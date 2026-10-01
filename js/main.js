// Elementi comuni a tutte le pagine del sito: header (con burger) e social del footer.
import { loadHeader } from "./main_comp/header.js";
import { initSocial } from "./main_comp/social.js";

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    initSocial().catch((error) => console.error("[Social] Social del footer non disponibili:", error));
});
