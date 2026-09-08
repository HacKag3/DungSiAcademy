import { loadSiteConfig } from "../../data-loader.js";
import { initAnnouncements } from "./announcements.js";
import { initOrari } from "./orari.js";
import { initLuogo } from "./luogo.js";

async function loadIndex() {
    initAnnouncements().catch((error) => console.error("[Annunci] Sezione annunci non disponibile:", error));

    const orariRoot = document.getElementById("orari-selector-menu");
    const luogoRoot = document.getElementById("luogo");
    if (!orariRoot && !luogoRoot) return;

    try {
        const config = await loadSiteConfig();
        if (orariRoot) initOrari(config);
        if (luogoRoot) initLuogo(config);
    } catch (error) {
        console.error("[Index] Impossibile caricare i dati del sito:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadIndex);
