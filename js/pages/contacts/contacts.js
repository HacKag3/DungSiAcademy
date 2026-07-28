import { PEOPLE } from "../../personale.js";
import { escapeHtml } from "../../utilities/utils.js";

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
    const { titolo, nome, cognome, foto, ruolo, descrizione } = persona ?? {};
 
    if (!nome || !cognome) {
        console.warn("Persona senza nome/cognome: card saltata.", persona);
        return "";
    }
 
    const isReversed = index % 2 === 1;
    const photoClass = foto?.cutout ? "person-photo cutout" : "person-photo";
    const contatti = creaContatti(persona);
 
    return `
        <div class="person-row ${isReversed ? "reversed" : ""}">
            <div class="${photoClass}">
                <img src="${foto?.src ?? ""}" alt="${escapeHtml(foto?.alt ?? `${nome} ${cognome}`)}" loading="lazy" />
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

function renderContatti() {
    const article = document.querySelector("article");
    if (!article) {
        console.error("Elemento <article> non trovato.");
        return;
    }
 
    if (!Array.isArray(PEOPLE) || PEOPLE.length === 0) {
        article.innerHTML = `
            <section id="team" class="team-section">
                <label class="lb_title">Il Nostro Team</label>
                <p class="team-empty">Le informazioni sul nostro team non sono ancora disponibili.</p>
            </section>
        `;
        console.warn("Nessuna persona trovata in PEOPLE.");
        return;
    }
 
    const cards = PEOPLE.map(creaCard).join("");
 
    article.innerHTML = `
        <section id="team" class="team-section">
            <label class="lb_title">Il Nostro Team</label>
            <div class="team-list">
                ${cards}
            </div>
        </section>
    `;
}

window.addEventListener("DOMContentLoaded", renderContatti);