import { CONFIG } from "../config.js";

export function getCurrentPage() {
    const { pathname } = window.location;
    return pathname.substring(pathname.lastIndexOf("/") + 1) || "index.html";
}

export function genNavBarLinks() {
    const currentPage = getCurrentPage();

    return CONFIG.pages
        .filter(page => page.href !== `./${currentPage}`);
}

const ESCAPE_MAP = { 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    '"': '&quot;', 
    "'": '&#039;' };
export const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (m) => ESCAPE_MAP[m]);
