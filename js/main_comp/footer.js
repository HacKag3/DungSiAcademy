// Footer generato a runtime dai dati in /data (social, contatti, legal,
// affiliazioni). Modificando i JSON i contenuti cambiano senza rebuild.
import { loadSiteConfig } from "../data-loader.js";
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

function renderSocialBox(config) {
    if (!config.social?.length) return "";

    return `
        <nav class="footer-social" aria-label="Social media">
            <p class="footer-social-title" aria-hidden="true">Seguici sui Social</p>
            <ul class="footer-social-icons" role="list">
                ${config.social.map(renderSocialItem).join("")}
            </ul>
        </nav>`;
}

function renderPhoneLink(config) {
    const phone = config.contacts?.generale?.telefono?.trim();

    const digitsOnly = (phone || "").replace(/\D/g, "");
    if (!phone || digitsOnly.length < 8) return "";

    const safePhone = escapeHtml(phone);
    return `
        <a href="tel:${digitsOnly}" class="footer-phone" aria-label="Chiamaci al ${safePhone}">
            <i class="fas fa-phone-alt" aria-hidden="true"></i>
            <span>${safePhone}</span>
        </a>`;
}

function renderAffiliation(config) {
    const { logo, altText, subNum } = config.associations.asi ?? {};

    return `
        <div class="footer-affiliation">
            <span class="footer-affiliation-title">Affiliazione ente sportivo</span>
            <img src="${escapeHtml(logo)}" alt="${escapeHtml(altText || "Logo associazione affiliata")}" loading="lazy" width="auto" height="72">
            ${subNum ? `<span class="footer-asi-subnum">Tessera/Affiliazione ${escapeHtml(subNum)}</span>` : ""}
        </div>`;
}

function renderBrand(config) {
    const { name } = config.brand;

    return `
        <address class="footer-brand">
            <span class="footer-brand-name">${escapeHtml(name)}</span>
            ${renderPhoneLink(config)}
        </address>`;
}

function renderNoteLegali(config) {
    const legal = config.legal ?? {};
    const sede = legal.sedeLegale;
    const sedeTesto = sede ? `${sede.via}, ${sede.cap} ${sede.citta}` : null;

    const righe = [
        legal.denominazione,
        legal.codiceFiscale && `C.F. ${legal.codiceFiscale}`,
        legal.partitaIva && `P.IVA ${legal.partitaIva}`,
        sedeTesto && `Sede legale: ${sedeTesto}`,
        legal.rappresentanteLegale && `Legale rappresentante: ${legal.rappresentanteLegale}`,
        legal.registrazione
    ].filter(Boolean);

    const infoHtml = righe.length
        ? `<div class="footer-legal-info">${righe.map(r => `<span>${escapeHtml(r)}</span>`).join("")}</div>`
        : "";

    return `
        <div class="footer-legal">
            ${infoHtml}
            <nav class="footer-legal-links" aria-label="Informazioni legali">
                <a href="./privacy.html">Privacy Policy</a>
                <span aria-hidden="true">·</span>
                <a href="./cookie.html">Cookie Policy</a>
            </nav>
        </div>`;
}


export function genFooter(config) {
    const year = new Date().getFullYear();

    return `
        <div class="footer-inner">
            ${renderAffiliation(config)}
            ${renderBrand(config)}
            ${renderSocialBox(config)}
        </div>
        ${renderNoteLegali(config)}
        <div class="footer-copyright">
            <small>&copy; ${year} ${escapeHtml(config.brand.name)}. Tutti i diritti riservati.</small>
        </div>`;
}

export async function loadFooter() {
    const footerEl = document.querySelector("footer");
    if (!footerEl) {
        console.warn("[Footer] Nessun footer trovato del DOM.");
        return;
    }

    const config = await loadSiteConfig();

    requestAnimationFrame(() => {
        footerEl.innerHTML = genFooter(config);
    });
}