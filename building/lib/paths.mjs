import path from "node:path";
import { fileURLToPath } from "node:url";

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));

export const BUILDING_DIR = path.resolve(LIB_DIR, "..");
export const ROOT_DIR = path.resolve(BUILDING_DIR, "..");

// Sorgenti del build (solo su dev).
export const DATA_DIR = path.join(BUILDING_DIR, "data");
export const LAYOUTS_DIR = path.join(BUILDING_DIR, "layouts");
export const COMPONENTS_DIR = path.join(BUILDING_DIR, "components");
export const PAGES_DIR = path.join(BUILDING_DIR, "pages");
export const FILES_DIR = path.join(BUILDING_DIR, "files");

// Sito finito: il build scrive in root; CSS e JS si modificano direttamente in root.
export const OUTPUT_DIR = ROOT_DIR;
export const CSS_DIR = path.join(ROOT_DIR, "css");
export const JS_DIR = path.join(ROOT_DIR, "js");

// Contenuti letti a runtime dal JS (modificabili anche su main, senza rebuild):
// annunci, corsi, personale, social… Il build li valida e ne usa alcuni per il JSON-LD.
// media/ contiene solo immagini (e i manifest dei caroselli).
export const CONTENUTI_DIR = path.join(ROOT_DIR, "contenuti");
