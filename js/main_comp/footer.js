import { loadSiteConfig } from "../data-loader.js";
import { escapeHtml, telHref } from "../utilities/utils.js";

function renderSocialItem({ name, url, icon, color }, ui) {
    const safeName = escapeHtml(name || "");
    const safeUrl = escapeHtml(url);
    const safeIcon = escapeHtml(icon);

        const dataAttr = (name || "").toLowerCase() === "tiktok" ?  `data-platform="tiktok"` : "";
    const followAria = ui.followUsAria.replaceAll("{name}", safeName);

    return `
        <li style="--hover-color: ${escapeHtml(color)};">
            <a href="${safeUrl}"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${followAria}"
               class="social-link"
               ${dataAttr}>
                <i class="${safeIcon}" aria-hidden="true"></i>
            </a>
        </li>`;
}

function renderSocialBox(config, ui) {
    if (!config.social?.length) return "";

    return `
        <nav class="footer-social" aria-label="${ui.socialAriaLabel}">
            <p class="footer-social-title" aria-hidden="true">${ui.socialFollowTitle}</p>
            <ul class="footer-social-icons" role="list">
                ${config.social.map(s => renderSocialItem(s, ui)).join("")}
            </ul>
        </nav>`;
}

function renderPhoneLink(config, ui) {
    const phone = config.contacts?.generale?.telefono?.trim();
    const digitsOnly = (phone || "").replace(/\D/g, "");
    if (!phone || digitsOnly.length < 8) return "";

    const safePhone = escapeHtml(phone);
    const callAria = ui.callUsAria.replaceAll("{phone}", safePhone);
    return `
        <a href="tel:${telHref(phone)}" class="footer-phone" aria-label="${callAria}">
            <i class="fas fa-phone-alt" aria-hidden="true"></i>
            <span>${safePhone}</span>
        </a>`;
}

function renderAffiliation(config, ui) {
    const { logo, altText, subNum } = config.associations.asi ?? {};

    return `
        <div class="footer-affiliation">
            <span class="footer-affiliation-title">${ui.affiliationTitle}</span>
            <img src="${escapeHtml(logo)}" alt="${escapeHtml(altText || ui.affiliationCardAlt)}" loading="lazy" width="auto" height="72">
            ${subNum ? `<span class="footer-asi-subnum">${ui.tesseraLabel} ${escapeHtml(subNum)}</span>` : ""}
        </div>`;
}

function renderBrand(config, ui) {
    const { name } = config.brand;

    return `
        <address class="footer-brand">
            <span class="footer-brand-name">${escapeHtml(name)}</span>
            ${renderPhoneLink(config, ui)}
        </address>`;
}

function renderNoteLegali(config, ui) {
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
            <nav class="footer-legal-links" aria-label="${ui.legalInfoAriaLabel}">
                <a href="./privacy.html">Privacy Policy</a>
                <span aria-hidden="true">&middot;</span>
                <a href="./cookie.html">Cookie Policy</a>
            </nav>
        </div>`;
}

function genFooter(config) {
    const year = new Date().getFullYear();
    const ui = config.ui ?? {};

    return `
        <div class="footer-inner">
            ${renderAffiliation(config, ui)}
            ${renderBrand(config, ui)}
            ${renderSocialBox(config, ui)}
        </div>
        ${renderNoteLegali(config, ui)}
        <div class="footer-copyright">
            <small>&copy; ${year} ${escapeHtml(config.brand.name)}. Tutti i diritti riservati.</small>
        </div>`;
}

export async function loadFooter() {
    const footerEl = document.querySelector("footer");
    if (!footerEl) {
        console.warn("[Footer] Nessun footer trovato nel DOM.");
        return;
    }

    try {
        const config = await loadSiteConfig();
        requestAnimationFrame(() => {
            footerEl.innerHTML = genFooter(config);
        });
    } catch (err) {
        console.warn("[Footer] Impossibile caricare i dati del footer, usando fallback inline:", err);
        requestAnimationFrame(() => {
            const year = new Date().getFullYear();
            const brandName = footerEl.dataset.brand || "";
            footerEl.innerHTML = `<div class="footer-copyright"><small>&copy; ${year} ${brandName}. Tutti i diritti riservati.</small></div>`;
        });
    }
}
