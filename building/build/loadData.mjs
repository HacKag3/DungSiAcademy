// building/build/loadData.mjs
// Caricamento dei file JSON sorgente (building/data/seo-data.json + data/*.json).

import fs from "node:fs";
import {
    ANNUNCI_PATH, CORSI_PATH, CONTATTI_PATH, PERSONALE_PATH,
    SEO_DATA_PATH, SETTINGS_PATH, WHOWEARE_PATH
} from "./paths.mjs";

export function loadJson(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File dati non trovato: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function loadSeoData() {
    return loadJson(SEO_DATA_PATH);
}

export function loadSettings() {
    return loadJson(SETTINGS_PATH);
}

export function loadContatti() {
    return loadJson(CONTATTI_PATH);
}

export function loadCorsi() {
    return loadJson(CORSI_PATH);
}

export function loadTeam() {
    return loadJson(PERSONALE_PATH);
}

export function loadAnnunci() {
    return loadJson(ANNUNCI_PATH);
}

export function loadWhoWeAre() {
    return loadJson(WHOWEARE_PATH);
}

// Carica tutti i dati del sito in un unico oggetto.
export function loadSiteData() {
    return {
        siteData: loadSeoData(),
        settings: loadSettings(),
        contatti: loadContatti(),
        corsi: loadCorsi(),
        team: loadTeam(),
        annunci: loadAnnunci(),
        whoweare: loadWhoWeAre()
    };
}