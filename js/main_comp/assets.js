import { CONFIG } from "../config.js";

export function injectSharedAssets() {
    const head = document.head;

    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.href = CONFIG.brand.logo;

    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    fontAwesome.integrity = "sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==";
    fontAwesome.crossOrigin = "anonymous";
    fontAwesome.referrerPolicy = "no-referrer";

    head.appendChild(favicon);
    head.appendChild(fontAwesome);
}
