import fs from "node:fs";
import path from "node:path";
import { PARTIALS_DIR } from "./paths.mjs";

const PARTIALS = {
    "{{HEAD_PAGES}}": "head-pages.html",
    "{{HEAD_ERROR}}": "head-error.html",
    "{{ICONS}}": "icons.html",
    "{{HEAD_COMMON}}": "head-common.html",
    "{{JSON_LD}}": "jsonLD.html",
    "{{BODY_OPEN}}": "body-open.html",
    "{{BODY_CLOSE}}": "body-close.html"
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
    for (const [token, value] of Object.entries(tokens)) {
        out = out.split(token).join(value ?? "");
    }
    return out;
}
