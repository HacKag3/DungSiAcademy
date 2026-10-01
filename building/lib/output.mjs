import fs from "node:fs";
import path from "node:path";
import { OUTPUT_DIR } from "./paths.mjs";
import { formatHtml, formatJson, formatText, formatXml } from "./format.mjs";

const FORMATTERS = {
    ".html": formatHtml,
    ".xml": formatXml,
    ".json": formatJson,
    ".webmanifest": formatJson
};

function setMode(filePath, mode) {
    try {
        fs.chmodSync(filePath, mode);
    } catch (err) {
        console.warn(`!!!! Non riesco a cambiare i permessi di ${filePath}: ${err.message}`);
    }
}

/**
 * Scrive un file generato nella root del sito (formattato e in sola lettura,
 * per ricordare che va modificato il sorgente in building/, non l'output).
 */
export function writeOutput(fileName, content, source) {
    const outPath = path.join(OUTPUT_DIR, fileName);
    const format = FORMATTERS[path.extname(fileName)] ?? formatText;

    if (fs.existsSync(outPath)) setMode(outPath, 0o644);
    fs.writeFileSync(outPath, format(content), "utf-8");
    setMode(outPath, 0o444);
    console.log(`V ${source} -> ${fileName}`);
}
