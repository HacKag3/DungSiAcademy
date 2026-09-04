import { loadHeader } from "./header.js";
import { loadFooter } from "./footer.js";

function loadDevelopmentAlert() {
    if (document.querySelector(".development-alert")) {
        return;
    }

    const alertEl = document.createElement("div");
    alertEl.className = "development-alert";
    alertEl.setAttribute("role", "alert");
    alertEl.textContent = "Sito ancora in fase di sviluppo: le informazioni potrebbero non essere complete o fittizie.";

    const headerEl = document.querySelector("header");
    if (headerEl) {
        headerEl.after(alertEl);
    } else {
        document.body.prepend(alertEl);
    }
}

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
    loadHeader();
    loadDevelopmentAlert();
    loadFooter();
}

