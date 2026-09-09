// Formattazione dei file generati per renderli visibilmente leggibili (ben indentati).
// Nessuna dipendenza esterna: tutto implementato con soli moduli Node integrati.

const INDENT = "    ";

const VOID_ELEMENTS = new Set([
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "param", "source", "track", "wbr"
]);

const RAW_TAGS = new Set(["script", "style"]);
const VERBATIM_TAGS = new Set(["pre", "textarea"]);

function indentFor(depth) {
    return INDENT.repeat(Math.max(0, depth));
}

function normalizeLineEndings(text) {
    return String(text ?? "").replace(/\r\n?/g, "\n");
}

// Riformatta un blocco JSON interno a <script> con indentazione a 4 spazi.
// Ritorna null se il contenuto non e' JSON valido (in tal caso si tiene l'originale).
function tryPrettyJson(inner) {
    const trimmed = inner.trim();
    if (!trimmed) return null;
    try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(parsed, null, 4);
    } catch {
        return null;
    }
}

// Espande i blocchi JSON embedded in forma multilinea e ben indentata,
// cosi' il passaggio di indentazione HTML deve solo aggiungere la base.
function prettyPrintEmbeddedJson(html) {
    let out = html;
    out = out.replace(
        /<script([^>]*type="application\/ld\+json"[^>]*)>([\s\S]*?)<\/script>/gi,
        (match, attrs, inner) => {
            const pretty = tryPrettyJson(inner);
            if (pretty == null) return match;
            return `<script${attrs}>\n${pretty}\n</script>`;
        }
    );
    out = out.replace(
        /<script([^>]*type="application\/json"[^>]*)>([\s\S]*?)<\/script>/gi,
        (match, attrs, inner) => {
            const pretty = tryPrettyJson(inner);
            if (pretty == null) return match;
            return `<script${attrs}>\n${pretty}\n</script>`;
        }
    );
    return out;
}

function countOpenTags(line) {
    const re = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*?)?>/g;
    let count = 0;
    let m;
    while ((m = re.exec(line)) !== null) {
        const full = m[0];
        const tag = m[1].toLowerCase();
        const index = m.index;
        if (index > 0 && line[index - 1] === "/") continue;
        if (full.endsWith("/>")) continue;
        if (VOID_ELEMENTS.has(tag)) continue;
        count++;
    }
    return count;
}

function countCloseTags(line) {
    const matches = line.match(/<\/[a-zA-Z][^>]*>/g);
    return matches ? matches.length : 0;
}

function tagNameOfOpening(trimmed) {
    const m = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)([\s/>]|$)/);
    return m ? m[1].toLowerCase() : null;
}

function isSingleLineRawBlock(trimmed, tag) {
    const openRe = new RegExp(`<${tag}(\\s[^>]*)?>`, "i");
    const closeRe = new RegExp(`</${tag}\\s*>`, "i");
    return openRe.test(trimmed) && closeRe.test(trimmed);
}
export function formatHtml(html) {
    let normalized = normalizeLineEndings(html);
    normalized = prettyPrintEmbeddedJson(normalized);
    const lines = normalized.split("\n");
    const out = [];
    let depth = 0;
    let rawTag = null;
    let blankStreak = 0;
    for (const rawLine of lines) {
        const noTrailing = rawLine.replace(/[ \t]+$/g, "");
        if (/^[ \t]*$/.test(noTrailing)) {
            if (rawTag != null) continue;
            if (blankStreak === 0 && out.length > 0) {
                out.push("");
                blankStreak++;
            }
            continue;
        }
        blankStreak = 0;
        if (rawTag != null && VERBATIM_TAGS.has(rawTag)) {
            const t = noTrailing.trim();
            const closeRe = new RegExp(`^</${rawTag}\\s*>`, "i");
            if (closeRe.test(t)) {
                depth = Math.max(0, depth - 1);
                out.push(indentFor(depth) + t);
                rawTag = null;
            } else {
                out.push(noTrailing);
            }
            continue;
        }
        if (rawTag != null && RAW_TAGS.has(rawTag)) {
            const t = noTrailing.trim();
            const closeRe = new RegExp(`^</${rawTag}\\s*>`, "i");
            if (closeRe.test(t)) {
                depth = Math.max(0, depth - 1);
                out.push(indentFor(depth) + t);
                rawTag = null;
            } else if (t === "") {
                continue;
            } else {
                const rel = noTrailing.replace(/^[ \t]*/, "");
                const leading = noTrailing.slice(0, noTrailing.length - rel.length);
                out.push(indentFor(depth) + leading + rel);
            }
            continue;
        }
        const trimmed = noTrailing.trim();
        if (/^<!DOCTYPE/i.test(trimmed) || /^<\?/.test(trimmed)) {
            out.push(indentFor(depth) + trimmed);
            continue;
        }
        if (/^<!--/.test(trimmed) || /-->$/.test(trimmed)) {
            out.push(indentFor(depth) + trimmed);
            continue;
        }
        const openingTag = tagNameOfOpening(trimmed);
        if (openingTag != null) {
            const isRaw = RAW_TAGS.has(openingTag) || VERBATIM_TAGS.has(openingTag);
            if (isRaw && !isSingleLineRawBlock(trimmed, openingTag)) {
                out.push(indentFor(depth) + trimmed);
                depth++;
                rawTag = openingTag;
                continue;
            }
        }
        const opens = countOpenTags(trimmed);
        const closes = countCloseTags(trimmed);
        const startsWithClose = /^<\//.test(trimmed);
        if (startsWithClose) {
            depth = Math.max(0, depth - 1);
            out.push(indentFor(depth) + trimmed);
            depth = Math.max(0, depth + opens - (closes - 1));
        } else {
            out.push(indentFor(depth) + trimmed);
            depth = Math.max(0, depth + opens - closes);
        }
    }
    while (out.length > 0 && out[0] === "") out.shift();
    while (out.length > 0 && out[out.length - 1] === "") out.pop();
    return out.join("\n") + "\n";
}

export function formatXml(xml) {
    const normalized = normalizeLineEndings(xml).replace(/[ \t]+$/gm, "");
    const lines = normalized.split("\n");
    const out = [];
    let depth = 0;
    let blankStreak = 0;
    for (const rawLine of lines) {
        if (/^[ \t]*$/.test(rawLine)) {
            if (blankStreak === 0 && out.length > 0) {
                out.push("");
                blankStreak++;
            }
            continue;
        }
        blankStreak = 0;
        const trimmed = rawLine.trim();
        if (/^<\?/.test(trimmed) || /^<!/.test(trimmed)) {
            out.push(indentFor(depth) + trimmed);
            continue;
        }
        const startsWithClose = /^<\//.test(trimmed);
        const isSelfClosing = /\/>$/.test(trimmed);
        const opens = (trimmed.match(/<[a-zA-Z][^>]*>/g) ?? []).filter((t) => !t.startsWith("</") && !t.endsWith("/>")).length;
        const closes = (trimmed.match(/<\/[^>]+>/g) ?? []).length;
        if (startsWithClose && !isSelfClosing && opens === 0) {
            depth = Math.max(0, depth - 1);
            out.push(indentFor(depth) + trimmed);
        } else {
            out.push(indentFor(depth) + trimmed);
            if (!isSelfClosing) depth = Math.max(0, depth + opens - closes);
        }
    }
    while (out.length > 0 && out[0] === "") out.shift();
    while (out.length > 0 && out[out.length - 1] === "") out.pop();
    return out.join("\n") + "\n";
}

export function formatText(text) {
    const normalized = normalizeLineEndings(text).split("\n").map((line) => line.replace(/[ \t]+$/g, ""));
    const out = [];
    let blankStreak = 0;
    for (const line of normalized) {
        if (/^[ \t]*$/.test(line)) {
            if (blankStreak === 0 && out.length > 0) {
                out.push("");
                blankStreak++;
            }
            continue;
        }
        blankStreak = 0;
        out.push(line.trim());
    }
    while (out.length > 0 && out[0] === "") out.shift();
    while (out.length > 0 && out[out.length - 1] === "") out.pop();
    return out.join("\n") + "\n";
}

export function formatJson(value) {
    const text = typeof value === "string" ? value : JSON.stringify(value, null, 4);
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 4) + "\n";
    } catch {
        return normalizeLineEndings(text).replace(/\s+$/g, "") + "\n";
    }
}

