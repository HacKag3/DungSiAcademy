import fs from "node:fs";
import path from "node:path";
import { CONTENUTI_DIR, DATA_DIR } from "./paths.mjs";

export function readJson(filePath) {
    if (!fs.existsSync(filePath)) throw new Error(`File non trovato: ${filePath}`);
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8").replace(/^﻿/, ""));
    } catch (err) {
        throw new Error(`${filePath}: JSON non valido (${err.message}).`);
    }
}

// "chi-siamo.json" → "chiSiamo"
const keyFor = (fileName) => path.basename(fileName, ".json").replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());

// Tutti i file .json di una cartella, ognuno sotto la chiave del suo nome.
function loadJsonDir(dir) {
    const data = {};
    for (const fileName of fs.readdirSync(dir).filter((name) => name.endsWith(".json")).sort()) {
        data[keyFor(fileName)] = readJson(path.join(dir, fileName));
    }
    return data;
}

/**
 * Ogni file data/X.json diventa disponibile nei template come {{X…}}:
 * per aggiungere un gruppo di dati basta creare il file.
 */
export function loadData() {
    return loadJsonDir(DATA_DIR);
}

/**
 * Contenuti runtime di contenuti/ (annunci, corsi, personale, social…),
 * modificabili su main senza rebuild: il build li valida e usa corsi e
 * social per i dati strutturati della home (JSON-LD).
 */
export function loadRuntimeData() {
    return loadJsonDir(CONTENUTI_DIR);
}
