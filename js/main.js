// Elementi comuni a tutte le pagine del sito: header (con burger), social del
// footer e dati dei contatti usati fuori dalla pagina Contatti (telefono, email privacy).
import { loadHeader } from "./main_comp/header.js";
import { initSocial } from "./main_comp/social.js";
import { initContatti } from "./main_comp/contatti.js";

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    initSocial().catch((error) => console.error("[Social] Social del footer non disponibili:", error));
    initContatti().catch((error) => console.error("[Contatti] Contatti non disponibili:", error));
});
