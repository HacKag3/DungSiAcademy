import { initAnnouncements } from "./announcements.js";
import { initOrari } from "./orari.js";
import { initLuogo } from "./luogo.js";
import { initScrollHighlight } from "./scrollHighlight.js";
import "../../utilities/carosello.js";

// Contenuti compilati dal build: qui restano le interazioni della home,
// gli annunci e i caroselli (caricati a runtime, modificabili su main).
document.addEventListener("DOMContentLoaded", () => {
    initScrollHighlight();
    initOrari();
    initLuogo();
    initAnnouncements().catch((error) => console.error("[Annunci] Sezione annunci non disponibile:", error));
});

