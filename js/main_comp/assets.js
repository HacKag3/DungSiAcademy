import { CONFIG } from "../config.js";

export function injectSharedAssets() {
    const head = document.head;

    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = CONFIG.brand.logo;

    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href = "./font/font-awesome/css/all.min.css";

    head.appendChild(favicon);
    head.appendChild(fontAwesome);
}
