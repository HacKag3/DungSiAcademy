import { loadHeader } from "./header.js";
import { loadFooter } from "./footer.js";
import { injectSharedAssets } from "./assets.js";

function loadDevelopmentAlert() {
    if (document.querySelector(".development-alert")) {
        return;
    }

    const alertEl = document.createElement("div");
    alertEl.className = "development-alert";
    alertEl.setAttribute("role", "alert");
    alertEl.textContent = "Sito ancora in fase di sviluppo: le informazioni potrebbero non essere complete o fittizie.";

    document.querySelector("header")?.after(alertEl);
}

export function loadLayout() {
    injectSharedAssets();

    loadDevelopmentAlert();
    loadHeader();
    loadFooter();
}

