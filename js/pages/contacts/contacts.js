import { loadData, buildContacts } from "../../data-loader.js";
import { escapeHtml, telHref } from "../../utilities/utils.js";

const PLACEHOLDER_PHOTOS = {
    M: "./media/persone/placeholder-uomo.webp",
    F: "./media/persone/placeholder-donna.webp",
    default: "./media/persone/placeholder-uomo.webp"
};

function contactLinks({ telefono, email, nome }) {
    const phone = telefono?.trim();
    const address = email?.trim();
    const links = [
        phone && `<a class="contact-link" href="tel:${telHref(phone)}" aria-label="Chiama ${escapeHtml(nome)}"><i class="fas fa-phone-alt" aria-hidden="true"></i><span>${escapeHtml(phone)}</span></a>`,
        address && `<a class="contact-link" href="mailto:${escapeHtml(address)}" aria-label="Scrivi a ${escapeHtml(nome)}"><i class="fas fa-envelope" aria-hidden="true"></i><span>${escapeHtml(address)}</span></a>`
    ].filter(Boolean).join("");
    return links ? `<div class="person-contacts">${links}</div>` : "";
}

function renderPerson(person, index) {
    const { titolo, nome, cognome, foto, sesso, ruolo, descrizione } = person;
    if (!nome || !cognome) return "";

    const fallback = PLACEHOLDER_PHOTOS[sesso] || PLACEHOLDER_PHOTOS.default;
    const photo = foto?.src?.trim() || fallback;
    const classes = ["person-photo", foto?.cutout && "cutout", !foto?.src?.trim() && "placeholder"].filter(Boolean).join(" ");

    return `<div class="person-row ${index % 2 ? "reversed" : ""}">
        <div class="${classes}"><img src="${escapeHtml(photo)}" alt="${escapeHtml(foto?.alt ?? `${nome} ${cognome}`)}" loading="lazy" onerror="this.onerror=null; this.src='${fallback}'; this.closest('.person-photo').classList.add('placeholder');"></div>
        <div class="person-info">
            ${titolo ? `<p class="person-title">${escapeHtml(titolo)}</p>` : ""}
            <h2 class="person-name">${escapeHtml(nome)} ${escapeHtml(cognome)}</h2>
            ${ruolo ? `<p class="person-role">${escapeHtml(ruolo)}</p>` : ""}
            ${descrizione ? `<p class="person-desc">${escapeHtml(descrizione)}</p>` : ""}
            ${contactLinks(person)}
        </div>
    </div>`;
}

function renderUsefulContact(contact) {
    const { id, titolo, icon, descrizione, telefono, email } = contact;
    if (!titolo) return "";
    const links = contactLinks({ telefono, email, nome: titolo });
    return `<div class="useful-contact-row" ${id ? `id="contatto-${escapeHtml(id)}"` : ""}>
        <div class="useful-contact-icon"><i class="${escapeHtml(icon ?? "fas fa-info-circle")}" aria-hidden="true"></i></div>
        <div class="useful-contact-text"><h3 class="useful-contact-title">${escapeHtml(titolo)}</h3>${descrizione ? `<p class="useful-contact-desc">${escapeHtml(descrizione)}</p>` : ""}</div>
        <div class="useful-contact-actions">${links || "<span class=\"useful-contact-pending\">In aggiornamento</span>"}</div>
    </div>`;
}

async function renderContactsPage() {
    const root = document.querySelector("article#page-content");
    if (!root) return;

    const [contatti, personale] = await Promise.all([loadData("contatti"), loadData("personale")]);
    const contacts = buildContacts(contatti.email);
    const usefulContacts = Object.values(contacts).map(renderUsefulContact).filter(Boolean).join("");
    const team = (personale ?? []).map(renderPerson).filter(Boolean).join("");

    root.innerHTML = `<section id="contatti-utili" class="useful-contacts-section">
        <label class="lb_title">Contatti Utili</label>
        <div class="useful-contacts-list">${usefulContacts}</div>
    </section>
    <section id="team" class="team-section">
        <label class="lb_title">Il Nostro Team</label>
        <div class="team-list">${team}</div>
    </section>`;
}

document.addEventListener("DOMContentLoaded", () => {
    renderContactsPage().catch((error) => console.error("[Contatti] Impossibile caricare i dati:", error));
});
