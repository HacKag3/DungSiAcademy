import { initTeam } from "./team.js";

// Contatti utili compilati dal build; il team è caricato a runtime.
document.addEventListener("DOMContentLoaded", () => {
    initTeam().catch((error) => console.error("[Team] Sezione team non disponibile:", error));
});
