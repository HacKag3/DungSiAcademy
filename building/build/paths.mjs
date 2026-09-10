import path from "node:path";
import { fileURLToPath } from "node:url";

const BUILD_MODULES_DIR = path.dirname(fileURLToPath(import.meta.url));
export const BUILDING_DIR = path.resolve(BUILD_MODULES_DIR, "..");
export const ROOT_DIR = path.resolve(BUILDING_DIR, "..");
// Tutti i dati sorgente vivono in building/data/: il build li compila
// nelle pagine (inline) e li valida; la root contiene solo il sito live.
const DATA_DIR = path.join(BUILDING_DIR, "data");

export const SEO_DATA_PATH = path.join(BUILDING_DIR, "data", "seo-data.json");
export const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");
export const CONTATTI_PATH = path.join(DATA_DIR, "contatti.json");
export const CORSI_PATH = path.join(DATA_DIR, "corsi.json");
export const PERSONALE_PATH = path.join(DATA_DIR, "personale.json");
export const ANNUNCI_PATH = path.join(ROOT_DIR, "media", "annunci", "annunci.json");
export const WHOWEARE_PATH = path.join(DATA_DIR, "content", "whoweare.json");

export const TEMPLATES_DIR = path.join(BUILDING_DIR, "pages_template");
export const PARTIALS_DIR = path.join(TEMPLATES_DIR, "_partials");
export const SEO_TEMPLATES_DIR = path.join(BUILDING_DIR, "seo");
export const OUTPUT_DIR = ROOT_DIR;

export const THEME_COLOR_DEFAULT = "#1a1a1e";

export const GIORNI_IT_EN = {
    "Lunedì": "Monday",
    "Martedì": "Tuesday",
    "Mercoledì": "Wednesday",
    "Giovedì": "Thursday",
    "Venerdì": "Friday",
    "Sabato": "Saturday",
    "Domenica": "Sunday"
};
