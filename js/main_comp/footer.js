import { CONFIG } from "../config.js";
import { escapeHtml } from "../utilities/utils.js";


function renderSocialItem({ name, url, icon, color }) {
    const safeName = escapeHtml(name || "");
    const safeUrl = escapeHtml(url);
    const safeIcon = escapeHtml(icon);

    const dataAttr = (name || "").toLowerCase() === "tiktok" ? ' data-platform="tiktok"' : "";

    return `
        <li style="--hover-color: ${escapeHtml(color)};">
            <a href="${safeUrl}"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="Seguici su ${safeName}"
               class="social-link"
               ${dataAttr}>
                <i class="${safeIcon}" aria-hidden="true"></i>
            </a>
        </li>`;
}

function renderSocialBox() {
    if (!CONFIG.social?.length) return "";

    return `
        <nav class="footer-social" aria-label="Social media">
            <p class="footer-social-title" aria-hidden="true">Seguici sui Social</p>
            <ul class="footer-social-icons" role="list">
                ${CONFIG.social.map(renderSocialItem).join("")}
            </ul>
        </nav>`;
}

function renderAssociations() {
    const { name }          = CONFIG.brand;
    const { logo, altText } = CONFIG.associations.asi;
    const phone             = escapeHtml(CONFIG.contactPhone);

    return `
        <div class="footer-associations">
            <div class="footer-asi">
                <img src="${escapeHtml(logo)}" alt="${escapeHtml(altText)}" loading="lazy" width="auto" height="72">
            </div>
            <address class="footer-contact">
                <span class="footer-brand-name">${escapeHtml(name)}</span>
                <a href="tel:${phone}" class="footer-phone" aria-label="Chiamaci al ${phone}">
                    <i class="fas fa-phone-alt" aria-hidden="true"></i>
                    <span>${phone}</span>
                </a>
            </address>
        </div>`;
}


export function genFooter() {
    const year = new Date().getFullYear();

    return `
        <div class="footer-inner">
            ${renderAssociations()}
            ${renderSocialBox()}
        </div>
        <div class="footer-copyright">
            <small>&copy; ${year} ${escapeHtml(CONFIG.brand.name)}. Tutti i diritti riservati.</small>
        </div>`;
}

export function loadFooter() {
    const footerEl = document.querySelector("footer");
    if (!footerEl) {
        console.warn("[Footer] Nessun footer trovato del DOM.");
        return;
    }

    requestAnimationFrame(() => {
        footerEl.innerHTML = genFooter();
    });
}