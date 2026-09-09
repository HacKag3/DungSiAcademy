import fs from "node:fs";
import path from "node:path";
import { PARTIALS_DIR } from "./paths.mjs";

const PARTIALS = {
    "{{HEAD_PAGES}}": "head-pages.html",
    "{{HEAD_ERROR}}": "head-error.html",
    "{{ICONS}}": "icons.html",
    "{{HEAD_COMMON}}": "head-common.html",
    "{{BODY_OPEN}}": "body-open.html"
};

const partialCache = new Map();

function readPartial(partialPath) {
    if (!partialCache.has(partialPath)) {
        if (!fs.existsSync(partialPath)) {
            console.warn(`!!!! Partial mancante: ${partialPath}`);
            partialCache.set(partialPath, null);
        } else {
            partialCache.set(partialPath, fs.readFileSync(partialPath, "utf-8"));
        }
    }
    return partialCache.get(partialPath);
}

export function applyPartials(html, maxDepth = 5) {
    let out = html;

    for (let depth = 0; depth < maxDepth; depth++) {
        let changed = false;

        for (const [token, filename] of Object.entries(PARTIALS)) {
            if (!out.includes(token)) continue;

            const partialContent = readPartial(path.join(PARTIALS_DIR, filename));
            if (partialContent == null) continue;

            out = out.split(token).join(partialContent);
            changed = true;
        }

        if (!changed) break;
    }

    return out;
}

export function applyTokens(content, tokens) {
    let out = content;
    const ordered = Object.entries(tokens).sort(([a], [b]) => {
        if (a === "{{JSON_LD_HOME}}") return -1;
        if (b === "{{JSON_LD_HOME}}") return 1;
        return 0;
    });
    for (const [token, value] of ordered) {
        out = out.split(token).join(value ?? "");
    }
    
    for (const [token, value] of Object.entries(tokens)) {
        if (token === "{{JSON_LD_HOME}}" || !out.includes(token)) continue;
        out = out.split(token).join(value ?? "");
    }
    return out;
}
