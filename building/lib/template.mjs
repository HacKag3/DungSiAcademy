/**
 * Motore di template del build: un sottoinsieme della sintassi Handlebars,
 * senza dipendenze esterne.
 *
 *   {{campo}}  {{a.b.c}}                 valore con escape HTML
 *   {{{campo}}}                          valore senza escape (HTML fidato dai dati)
 *   {{#if campo}} … {{else}} … {{/if}}   anche {{#unless campo}}
 *   {{#each lista}} … {{else}} … {{/each}}
 *                                        dentro: {{this}} {{@index}} {{@first}} {{@last}} {{@key}}
 *   {{#with oggetto}} … {{/with}}
 *   {{> nome}}                           include un componente con il contesto corrente
 *   {{> nome campo}}                     … con `campo` come contesto
 *   {{> nome chiave=campo altra="testo"}} … con dati aggiuntivi
 *   {{!-- commento --}}                  non compare nell'output
 *
 * Un nome si cerca nell'elemento corrente (voce di un {{#each}}, oggetto di un
 * {{#with}}, componente) e poi nei dati globali della pagina (sito, brand,
 * page, …); {{../campo}} legge l'elemento che contiene quello corrente.
 *
 * {{> nome}} cerca `nome.html` o `nome/nome.html` prima nella cartella del
 * template che lo include, poi in building/components/.
 * Se accanto a `X.html` esiste `X.mjs`, la sua funzione di default riceve il
 * contesto (e i dati globali) e restituisce i dati aggiuntivi per `X.html`.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" };
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);

const BLOCKS = new Set(["if", "unless", "each", "with"]);
const STANDALONE_TAGS = new Set(["open", "else", "close", "comment", "partial"]);
const PATH_PATTERN = /^(?:\.\.\/)*(?:this|\.|@?[\w-]+)(?:\.[\w-]+)*$/;
const MAX_DEPTH = 40;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isTruthy = (value) => (Array.isArray(value) ? value.length > 0 : Boolean(value));
const hasKey = (value, key) => value !== null && typeof value === "object" && key in value;

class Frame {
    constructor(ctx, data, parent) {
        this.ctx = ctx;
        this.data = data;
        this.parent = parent;
    }
}

// ---------------------------------------------------------------------------
// Lettura del template: testo → tag → albero
// ---------------------------------------------------------------------------

function tokenize(source, where) {
    const tokens = [];
    let pos = 0;
    let line = 1;
    const advance = (text) => {
        for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
    };

    while (pos < source.length) {
        const open = source.indexOf("{{", pos);
        if (open === -1) {
            tokens.push({ type: "text", value: source.slice(pos) });
            break;
        }
        if (open > pos) {
            const text = source.slice(pos, open);
            tokens.push({ type: "text", value: text });
            advance(text);
        }

        const at = `${where}:${line}`;
        let end;
        if (source.startsWith("{{!--", open)) {
            end = findClose(source, "--}}", open + 5, at);
            tokens.push({ type: "comment" });
        } else if (source.startsWith("{{{", open)) {
            end = findClose(source, "}}}", open + 3, at);
            tokens.push(variable(source.slice(open + 3, end - 3).trim(), true, at));
        } else {
            end = findClose(source, "}}", open + 2, at);
            tokens.push(classify(source.slice(open + 2, end - 2).trim(), at));
        }
        advance(source.slice(open, end));
        pos = end;
    }
    return tokens;
}

function findClose(source, marker, from, at) {
    const index = source.indexOf(marker, from);
    if (index === -1) throw new Error(`${at}: tag aperto e mai chiuso (manca "${marker}").`);
    return index + marker.length;
}

function classify(content, at) {
    if (content.startsWith("!")) return { type: "comment" };
    if (content === "else") return { type: "else", at };
    if (content.startsWith("#")) {
        const [name, expr, extra] = content.slice(1).trim().split(/\s+/);
        if (!BLOCKS.has(name)) {
            throw new Error(`${at}: blocco sconosciuto {{#${name}}} (disponibili: ${[...BLOCKS].join(", ")}).`);
        }
        if (!expr || extra || !PATH_PATTERN.test(expr)) {
            throw new Error(`${at}: {{#${name}}} richiede un solo campo, es. {{#${name} lista}}.`);
        }
        return { type: "open", name, path: expr, at };
    }
    if (content.startsWith("/")) return { type: "close", name: content.slice(1).trim(), at };
    if (content.startsWith(">")) return { type: "partial", ...parsePartial(content.slice(1).trim(), at), at };
    return variable(content, false, at);
}

function variable(expr, raw, at) {
    if (!PATH_PATTERN.test(expr)) throw new Error(`${at}: espressione non valida {{${expr}}}.`);
    return { type: "var", path: expr, raw, at };
}

function parsePartial(text, at) {
    const [name, ...args] = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
    if (!name) throw new Error(`${at}: {{> }} senza il nome del componente.`);

    let context = null;
    const hash = {};
    for (const arg of args) {
        const eq = arg.indexOf("=");
        if (eq > 0) {
            hash[arg.slice(0, eq)] = parseValue(arg.slice(eq + 1), at);
        } else if (context === null && PATH_PATTERN.test(arg)) {
            context = arg;
        } else {
            throw new Error(`${at}: argomento non valido "${arg}" in {{> ${name}}}.`);
        }
    }
    return { name, context, hash };
}

function parseValue(raw, at) {
    if (/^"[^"]*"$|^'[^']*'$/.test(raw)) return { value: raw.slice(1, -1) };
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) return { value: Number(raw) };
    if (raw === "true" || raw === "false") return { value: raw === "true" };
    if (PATH_PATTERN.test(raw)) return { path: raw };
    throw new Error(`${at}: valore non valido "${raw}".`);
}

// Un tag di blocco, commento o componente da solo sulla sua riga non lascia
// righe vuote nell'output (come in Handlebars).
function stripStandaloneLines(tokens) {
    const last = tokens.length - 1;
    const standalone = tokens.map((token, i) => {
        if (!STANDALONE_TAGS.has(token.type)) return false;
        const prev = tokens[i - 1];
        const next = tokens[i + 1];
        const startsLine = !prev || (prev.type === "text"
            && (/\n[ \t]*$/.test(prev.value) || (i === 1 && /^[ \t]*$/.test(prev.value))));
        const endsLine = !next || (next.type === "text"
            && (/^[ \t]*\r?\n/.test(next.value) || (i === last - 1 && /^[ \t]*$/.test(next.value))));
        return startsLine && endsLine;
    });

    standalone.forEach((isStandalone, i) => {
        if (!isStandalone) return;
        const prev = tokens[i - 1];
        const next = tokens[i + 1];
        if (prev?.type === "text") prev.value = prev.value.replace(/[ \t]*$/, "");
        if (next?.type === "text") next.value = next.value.replace(/^[ \t]*(?:\r?\n)?/, "");
    });
    return tokens;
}

function parse(tokens) {
    const root = [];
    const stack = [{ node: null, target: root }];

    for (const token of tokens) {
        const top = stack[stack.length - 1];
        switch (token.type) {
            case "text":
                if (token.value) top.target.push(token);
                break;
            case "var":
            case "partial":
                top.target.push(token);
                break;
            case "open": {
                const node = { type: "block", name: token.name, path: token.path, at: token.at, body: [], inverse: [] };
                top.target.push(node);
                stack.push({ node, target: node.body });
                break;
            }
            case "else":
                if (!top.node) throw new Error(`${token.at}: {{else}} fuori da un blocco.`);
                if (top.target === top.node.inverse) throw new Error(`${token.at}: {{else}} ripetuto.`);
                top.target = top.node.inverse;
                break;
            case "close":
                if (!top.node || top.node.name !== token.name) {
                    const expected = top.node ? `a {{#${top.node.name}}} (${top.node.at})` : "a nessun blocco aperto";
                    throw new Error(`${token.at}: {{/${token.name}}} non corrisponde ${expected}.`);
                }
                stack.pop();
                break;
        }
    }

    if (stack.length > 1) {
        const open = stack[stack.length - 1].node;
        throw new Error(`${open.at}: {{#${open.name}}} non viene mai chiuso.`);
    }
    return root;
}

// ---------------------------------------------------------------------------
// Ricerca dei valori
// ---------------------------------------------------------------------------

function dig(value, keys) {
    let current = value;
    for (const key of keys) {
        if (current == null) return undefined;
        current = current[key];
    }
    return current;
}

function lookup(expr, frame, root) {
    let rest = expr;
    let target = frame;
    let up = 0;
    while (rest.startsWith("../")) {
        rest = rest.slice(3);
        target = target?.parent;
        up++;
    }
    if (!target) return undefined;
    if (rest === "this" || rest === ".") return target.ctx;

    const [head, ...keys] = rest.split(".");
    if (head === "this") return dig(target.ctx, keys);
    if (head === "@root") return dig(root, keys);
    if (head.startsWith("@")) {
        const name = head.slice(1);
        for (let f = target; f; f = f.parent) {
            if (f.data && name in f.data) return dig(f.data[name], keys);
        }
        return undefined;
    }
    if (hasKey(target.ctx, head)) return dig(target.ctx[head], keys);
    if (up === 0 && hasKey(root, head)) return dig(root[head], keys);
    return undefined;
}

// ---------------------------------------------------------------------------
// Motore
// ---------------------------------------------------------------------------

function listFiles(dir, extension) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listFiles(full, extension);
        return full.endsWith(extension) ? [full] : [];
    });
}

const modelFileFor = (file) => path.join(path.dirname(file), `${path.basename(file, path.extname(file))}.mjs`);

export class TemplateEngine {
    #baseDir;
    #componentsDir;
    #templates = new Map();
    #models = new Map();
    #resolved = new Map();
    #warnings = new Set();

    constructor({ baseDir, componentsDir }) {
        this.#baseDir = baseDir;
        this.#componentsDir = componentsDir;
    }

    /** Avvisi raccolti durante il rendering (campi non definiti, ecc.). */
    get warnings() {
        return [...this.#warnings];
    }

    /** Carica i modelli X.mjs che affiancano un template X.* (gli altri .mjs sono moduli di supporto). */
    async loadModels(dirs) {
        for (const file of dirs.flatMap((dir) => listFiles(dir, ".mjs"))) {
            const base = path.basename(file, ".mjs");
            const hasTemplate = fs.readdirSync(path.dirname(file))
                .some((name) => name !== path.basename(file) && name.startsWith(`${base}.`));
            if (!hasTemplate) continue;

            const module = await import(pathToFileURL(file).href);
            if (typeof module.default !== "function") {
                throw new Error(`${this.#relative(file)}: deve esportare una funzione di default che restituisce i dati del template.`);
            }
            this.#models.set(file, module.default);
        }
    }

    /** Rende il template `file` con il contesto dato. `escape` cambia l'escape dei {{campi}}. */
    render(file, context, { escape = escapeHtml } = {}) {
        const ctx = this.#applyModel(file, context, context);
        const state = { escape, root: ctx, depth: 0 };
        return this.#renderNodes(this.#template(file), new Frame(ctx, null, null), file, state);
    }

    #template(file) {
        if (!this.#templates.has(file)) {
            const source = fs.readFileSync(file, "utf-8").replace(/^\uFEFF/, "");
            this.#templates.set(file, parse(stripStandaloneLines(tokenize(source, this.#relative(file)))));
        }
        return this.#templates.get(file);
    }

    #renderNodes(nodes, frame, file, state) {
        let out = "";
        for (const node of nodes) {
            switch (node.type) {
                case "text": out += node.value; break;
                case "var": out += this.#renderVar(node, frame, state); break;
                case "block": out += this.#renderBlock(node, frame, file, state); break;
                case "partial": out += this.#renderPartial(node, frame, file, state); break;
            }
        }
        return out;
    }

    #renderVar(node, frame, state) {
        const value = lookup(node.path, frame, state.root);
        if (value === undefined) this.#warn(`${node.at}: {{${node.path}}} non è definito.`);
        if (value == null) return "";
        if (typeof value === "object") this.#warn(`${node.at}: {{${node.path}}} è un oggetto, non un testo.`);
        const text = String(value);
        return node.raw ? text : state.escape(text);
    }

    #renderBlock(node, frame, file, state) {
        const value = lookup(node.path, frame, state.root);
        const same = () => this.#renderNodes(node.body, frame, file, state);
        const inverse = () => this.#renderNodes(node.inverse, frame, file, state);

        switch (node.name) {
            case "if": return isTruthy(value) ? same() : inverse();
            case "unless": return isTruthy(value) ? inverse() : same();
            case "with": return isTruthy(value)
                ? this.#renderNodes(node.body, new Frame(value, null, frame), file, state)
                : inverse();
            case "each": {
                if (value != null && typeof value !== "object") {
                    this.#warn(`${node.at}: {{#each ${node.path}}} richiede una lista.`);
                }
                const entries = Array.isArray(value)
                    ? value.map((item, index) => [index, item])
                    : isObject(value) ? Object.entries(value) : [];
                if (entries.length === 0) return inverse();
                return entries.map(([key, item], index) => {
                    const data = { index, key, first: index === 0, last: index === entries.length - 1 };
                    return this.#renderNodes(node.body, new Frame(item, data, frame), file, state);
                }).join("");
            }
        }
        return "";
    }

    #renderPartial(node, frame, file, state) {
        const target = this.#resolve(node.name, file, node.at);
        const base = node.context ? lookup(node.context, frame, state.root) : frame.ctx;

        const extra = {};
        for (const [key, arg] of Object.entries(node.hash)) {
            extra[key] = "value" in arg ? arg.value : lookup(arg.path, frame, state.root);
        }
        let ctx = Object.keys(extra).length > 0 ? { ...(isObject(base) ? base : {}), ...extra } : base;
        ctx = this.#applyModel(target, ctx, state.root);

        if (++state.depth > MAX_DEPTH) {
            throw new Error(`${node.at}: troppi componenti annidati (inclusione ciclica di "${node.name}"?).`);
        }
        try {
            return this.#renderNodes(this.#template(target), new Frame(ctx, null, frame), target, state);
        } finally {
            state.depth--;
        }
    }

    #applyModel(file, ctx, root) {
        const modelFile = modelFileFor(file);
        const model = this.#models.get(modelFile);
        if (!model) return ctx;

        const extra = model(ctx, root);
        if (extra == null) return ctx;
        if (!isObject(extra)) throw new Error(`${this.#relative(modelFile)}: deve restituire un oggetto.`);
        return { ...(isObject(ctx) ? ctx : {}), ...extra };
    }

    #resolve(name, fromFile, at) {
        const key = `${path.dirname(fromFile)}|${name}`;
        if (!this.#resolved.has(key)) {
            const leaf = path.basename(name);
            const candidates = [path.dirname(fromFile), this.#componentsDir].flatMap((dir) => [
                path.join(dir, `${name}.html`),
                path.join(dir, name, `${leaf}.html`)
            ]);
            const found = candidates.find((candidate) => fs.existsSync(candidate));
            if (!found) {
                const list = [...new Set(candidates)].map((candidate) => `   - ${this.#relative(candidate)}`).join("\n");
                throw new Error(`${at}: componente "${name}" non trovato. Cercato in:\n${list}`);
            }
            this.#resolved.set(key, found);
        }
        return this.#resolved.get(key);
    }

    #warn(message) {
        this.#warnings.add(message);
    }

    #relative(file) {
        return path.relative(this.#baseDir, file).split(path.sep).join("/");
    }
}
