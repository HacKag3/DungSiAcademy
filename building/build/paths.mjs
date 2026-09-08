// building/build/paths.mjs
// Percorsi e costanti condivise da tutti i sottomoduli del builder.

import path from "node:path";
import { fileURLToPath } from "node:url";

const BUILD_MODULES_DIR = path.dirname(fileURLToPath(import.meta.url)); // building/build/
export const BUILDING_DIR = path.resolve(BUILD_MODULES_DIR, "..");      // building/
export const ROOT_DIR = path.resolve(BUILDING_DIR, "..");               // root del sito
export const DATA_DIR = path.join(ROOT_DIR, "data");

export const SEO_DATA_PATH = path.join(BUILDING_DIR, "data", "seo-data.json");
export const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");
export const CONTATTI_PATH = path.join(DATA_DIR, "contatti.json");
export const CORSI_PATH = path.join(DATA_DIR, "corsi.json");
export const PERSONALE_PATH = path.join(DATA_DIR, "personale.json");
export const ANNUNCI_PATH = path.join(DATA_DIR, "annunci.json");
export const WHOWEARE_PATH = path.join(DATA_DIR, "content", "whoweare.json");

export const TEMPLATES_DIR = path.join(BUILDING_DIR, "pages_template");
export const PARTIALS_DIR = path.join(TEMPLATES_DIR, "_partials");
export const SEO_TEMPLATES_DIR = path.join(BUILDING_DIR, "seo"); // sorgenti di sitemap e robots
export const OUTPUT_DIR = ROOT_DIR;

// Colore di default per theme-color/manifest; sovrascrivibile
// con settings.brand.themeColor.
export const THEME_COLOR_DEFAULT = "#1a1a1e";

// Mapping giorni IT -> EN per OpeningHoursSpecification nel JSON-LD.
export const GIORNI_IT_EN = {
    "Lunedì": "Monday",
    "Martedì": "Tuesday",
    "Mercoledì": "Wednesday",
    "Giovedì": "Thursday",
    "Venerdì": "Friday",
    "Sabato": "Saturday",
    "Domenica": "Sunday"
};