import { loadHeader } from "./header.js";
import { loadFooter } from "./footer.js";
import { loadData } from "../data-loader.js";

async function loadDevelopmentAlert() {
    if (document.querySelector(".development-alert")) {
        return;
    }

    const settings = await loadData("settings");
    const alertText = settings.ui?.developmentAlert;
    if (!alertText) return;

    const alertEl = document.createElement("div");
    alertEl.className = "development-alert";
    alertEl.setAttribute("role", "alert");
    alertEl.textContent = alertText;

    const headerEl = document.querySelector("header");
    if (headerEl) {
        headerEl.after(alertEl);
    } else {
        document.body.prepend(alertEl);
    }
}

export function loadLayout() {
    loadHeader().catch((error) => console.error("[Header] Caricamento non riuscito:", error));
    loadDevelopmentAlert().catch((error) => console.error("[Layout] Alert di sviluppo non caricato:", error));
    loadFooter().catch((error) => console.error("[Footer] Caricamento non riuscito:", error));
}
