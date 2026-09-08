// building/build/render.mjs
// Applicazione dei partial annidati e sostituzione dei token nei template.

import fs from "node:fs";
import path from "node:path";
import { PARTIALS_DIR } from "./paths.mjs";

// Partial disponibili nei template. L'ordine non conta: applyPartials
// risolve in più passate finché non restano partial da espandere
// (es. head-pages annida head-common che annida icons).
const PARTIALS = {
    "{{HEAD_PAGES}}": "head-pages.html",
    "{{HEAD_ERROR}}": "head-error.html",
    "{{ICONS}}": "icons.html",
    "{{HEAD_COMMON}}": "head-common.html",
    "{{JSON_LD}}": "jsonLD.html",
    // Guscio condiviso del <body>: apertura (bg + header) e chiusura
    // (footer + tag di chiusura), identici per tutte le pagine "normali".
    "{{BODY_OPEN}}": "body-open.html",
    "{{BODY_CLOSE}}": "body-close.html"
};

export function applyPartials(html, pageKey, maxDepth = 5) {
    let out = html;

    for (let depth = 0; depth < maxDepth; depth++) {
        let changed = false;

        for (const [token, filename] of Object.entries(PARTIALS)) {
            if (!out.includes(token)) continue;

            const partialPath = path.join(PARTIALS_DIR, filename);
            if (!fs.existsSync(partialPath)) {
                console.warn(`!!!! Pagina "${pageKey}": partial mancante ${PARTIALS_DIR}/${filename}`);
                continue;
            }

            const partialContent = fs.readFileSync(partialPath, "utf-8");
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