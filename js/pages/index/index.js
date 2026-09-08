// js/pages/index/index.js
// Pagina home: orchestra le sezioni che dipendono dai dati runtime.
// I caroselli si inizializzano da soli (js/utilities/carosello.js).
import { loadSiteConfig } from "../../data-loader.js";
import { initAnnouncements } from "./announcements.js";
import { initOrari } from "./orari.js";
import { initLuogo } from "./luogo.js";

async function loadIndex() {
    initAnnouncements();

    if (!document.getElementById("orari-selector-menu") && !document.getElementById("luogo")) return;

    try {
        const config = await loadSiteConfig();
        if (document.getElementById("orari-selector-menu")) initOrari(config);
        if (document.getElementById("luogo")) initLuogo(config);
    } catch (error) {
        console.error("[Index] Impossibile caricare i dati del sito:", error);
    }
}

window.addEventListener("DOMContentLoaded", loadIndex);