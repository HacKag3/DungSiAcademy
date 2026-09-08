import { getNavigation } from "../data-loader.js";

function getCurrentPage() {
    const { pathname } = window.location;
    return pathname.substring(pathname.lastIndexOf("/") + 1) || "index.html";
}

export function genNavBarLinks() {
    const currentPage = getCurrentPage();

    return getNavigation()
        .filter(page => page.href !== `./${currentPage}`);
}

const ESCAPE_MAP = { 
    '&': '&amp;', 
    '<': '&lt;', 
    '>': '&gt;', 
    '"': '&quot;', 
    "'": '&#039;' };
export const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (m) => ESCAPE_MAP[m]);

export const telHref = (phone) => String(phone).replace(/[^0-9+]/g, "");
