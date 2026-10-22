import { initContattiUtili } from "./contatti-utili.js";
import { initTeam } from "./team.js";

// Contatti utili e team sono entrambi caricati a runtime da contenuti/.
document.addEventListener("DOMContentLoaded", () => {
    initContattiUtili();
    initTeam().catch((error) => console.error("[Team] Sezione team non disponibile:", error));
});
