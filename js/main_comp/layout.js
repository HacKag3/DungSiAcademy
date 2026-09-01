import { loadHeader } from "./header.js";
import { loadFooter } from "./footer.js";
import { injectSharedAssets } from "./assets.js";

export function loadLayout() {
    injectSharedAssets();
    
    loadHeader();
    loadFooter();
}

