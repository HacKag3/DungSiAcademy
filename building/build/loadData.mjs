import fs from "node:fs";
import {
    ANNUNCI_PATH, CORSI_PATH, CONTATTI_PATH, PERSONALE_PATH,
    SEO_DATA_PATH, SETTINGS_PATH, WHOWEARE_PATH
} from "./paths.mjs";

function loadJson(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File dati non trovato: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function loadSiteData() {
    return {
        siteData: loadJson(SEO_DATA_PATH),
        settings: loadJson(SETTINGS_PATH),
        contatti: loadJson(CONTATTI_PATH),
        corsi: loadJson(CORSI_PATH),
        team: loadJson(PERSONALE_PATH),
        annunci: loadJson(ANNUNCI_PATH),
        whoweare: loadJson(WHOWEARE_PATH)
    };
}
