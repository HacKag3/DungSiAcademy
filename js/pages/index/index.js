import { initAnnouncements } from "./announcements.js";
import { initOrari } from "./orari.js";
import { initLuogo } from "./luogo.js";
import { initScrollHighlight } from "./scrollHighlight.js";

// Contenuti compilati dal build: qui restano le interazioni della home
// e gli annunci (unico contenuto ancora caricato a runtime).
document.addEventListener("DOMContentLoaded", () => {
    initScrollHighlight();
    initOrari();
    initLuogo();
    initAnnouncements().catch((error) => console.error("[Annunci] Sezione annunci non disponibile:", error));
});

