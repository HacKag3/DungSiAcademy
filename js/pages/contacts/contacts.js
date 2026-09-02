import { PEOPLE } from "../../personale.js";
import { CONFIG } from "../../config.js";
import { escapeHtml } from "../../utilities/utils.js";

const PLACEHOLDER_PHOTOS = {
    M: "./media/persone/placeholder-uomo.webp",
    F: "./media/persone/placeholder-donna.webp",
    default: "./media/persone/placeholder-uomo.webp"
};

function getPlaceholderSrc(sesso) {
    if (sesso === "M" || sesso === "F") {
        return PLACEHOLDER_PHOTOS[sesso];
    }
    return PLACEHOLDER_PHOTOS.default;
}

function creaContatti({ telefono, email, nome }) {
    const telefonoPulito = telefono?.trim();
    const emailPulita = email?.trim();

    const links = [
        telefonoPulito && `
            <a class="contact-link" href="tel:${telefonoPulito.replace(/[^\d+]/g, '')}" aria-label="Chiama ${escapeHtml(nome)}">
                <i class="fas fa-phone-alt" aria-hidden="true"></i>
                <span>${escapeHtml(telefonoPulito)}</span>
            </a>`,
        emailPulita && `
            <a class="contact-link" href="mailto:${emailPulita}" aria-label="Scrivi a ${escapeHtml(nome)}">
                <i class="fas fa-envelope" aria-hidden="true"></i>
                <span>${escapeHtml(emailPulita)}</span>
            </a>`
    ].filter(Boolean).join("");

    return links ? `<div class="person-contacts">${links}</div>` : "";
}

function creaCard(persona, index) {
    const { titolo, nome, cognome, foto, sesso, ruolo, descrizione } = persona ?? {};

    if (!nome || !cognome) {
        console.warn("Persona senza nome/cognome: card saltata.", persona);
        return "";
    }

    const isReversed = index % 2 === 1;

    const fotoSrc = foto?.src?.trim() || getPlaceholderSrc(sesso);
    const isPlaceholder = !foto?.src?.trim();
    const photoClass = [
        "person-photo",
        foto?.cutout ? "cutout" : "",
        isPlaceholder ? "placeholder" : ""
    ].filter(Boolean).join(" ");
    const placeholderSrc = getPlaceholderSrc(sesso);

    const contatti = creaContatti(persona);

    return `
        <div class="person-row ${isReversed ? "reversed" : ""}">
            <div class="${photoClass}">
                <img 
                    src="${fotoSrc}" 
                    alt="${escapeHtml(foto?.alt ?? `${nome} ${cognome}`)}" 
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${placeholderSrc}'; this.closest('.person-photo').classList.add('placeholder');" />
            </div>
            <div class="person-info">
                ${titolo ? `<p class="person-title">${escapeHtml(titolo)}</p>` : ""}
                <h2 class="person-name">${escapeHtml(nome)} ${escapeHtml(cognome)}</h2>
                ${ruolo ? `<p class="person-role">${escapeHtml(ruolo)}</p>` : ""}
                ${descrizione ? `<p class="person-desc">${escapeHtml(descrizione)}</p>` : ""}
                ${contatti}
            </div>
        </div>
    `;
}

function creaTeamSection() {
    if (!Array.isArray(PEOPLE) || PEOPLE.length === 0) {
        return `
            <section id="team" class="team-section">
                <label class="lb_title">Il Nostro Team</label>
                <p class="team-empty">Le informazioni sul nostro team non sono ancora disponibili.</p>
            </section>
        `;
    }

    const cards = PEOPLE.map(creaCard).join("");

    return `
        <section id="team" class="team-section">
            <label class="lb_title">Il Nostro Team</label>
            <div class="team-list">
                ${cards}
            </div>
        </section>
    `;
}

function creaContattoUtileRow(contatto) {
    const { id, titolo, icon, descrizione, telefono, email } = contatto ?? {};

    if (!titolo) {
        console.warn("Contatto utile senza titolo: riga saltata.", contatto);
        return "";
    }

    const contatti = creaContatti({ telefono, email, nome: titolo });

    return `
        <div class="useful-contact-row" ${id ? `id="contatto-${escapeHtml(id)}"` : ""}>
            <div class="useful-contact-icon">
                <i class="${icon ?? 'fas fa-info-circle'}" aria-hidden="true"></i>
            </div>
            <div class="useful-contact-text">
                <h3 class="useful-contact-title">${escapeHtml(titolo)}</h3>
                ${descrizione ? `<p class="useful-contact-desc">${escapeHtml(descrizione)}</p>` : ""}
            </div>
            <div class="useful-contact-actions">
                ${contatti || `<span class="useful-contact-pending">In aggiornamento</span>`}
            </div>
        </div>
    `;
}

function creaContattiUtiliSection(contacts) {
    if (!contacts || typeof contacts !== "object") return "";

    const lista = Object.values(contacts);
    if (!lista.length) return "";

    const rows = lista.map(creaContattoUtileRow).filter(Boolean).join("");
    if (!rows) return "";

    return `
        <section id="contatti-utili" class="useful-contacts-section">
            <label class="lb_title">Contatti Utili</label>
            <div class="useful-contacts-list">
                ${rows}
            </div>
        </section>
    `;
}

function renderContatti() {
    const article = document.querySelector("article");
    if (!article) {
        console.error("Elemento <article> non trovato.");
        return;
    }

    article.innerHTML = `
        ${creaContattiUtiliSection(CONFIG.contacts)}
        ${creaTeamSection()}
    `;
}

window.addEventListener("DOMContentLoaded", renderContatti);