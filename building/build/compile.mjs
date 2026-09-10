/**
 * Compilazione dei dati in HTML statico: il build genera l'HTML finale
 * nei punti esatti delle pagine (header, burger, footer, orari, luogo,
 * contatti, Chi Siamo, campi legali). Il runtime non riceve dati da
 * compilare: i moduli JS gestiscono solo interazioni e i contenuti
 * ancora letti a runtime (annunci, caroselli).
 */
import { escapeHtml, telHref } from "../../js/utilities/utils.js";
import {
    buildContacts,
    buildDisciplineMap,
    buildLuogo
} from "./transforms.mjs";

const PLACEHOLDER_PHOTOS = {
    M: "./media/persone/placeholder-uomo.webp",
    F: "./media/persone/placeholder-donna.webp",
    default: "./media/persone/placeholder-uomo.webp"
};

const ORARI_UI = {
    kickerSelezione: "Il tuo percorso",
    kickerRisultati: "Programma settimanale",
    labelDisciplina: "Disciplina",
    labelFasciaEta: "Fascia d'età",
    ariaDisciplina: "Seleziona disciplina",
    ariaFasciaEta: "Seleziona fascia d'età",
    labelGiorno: "Giorno",
    labelOrario: "Orario",
    nessunCorso: "Nessun corso disponibile per questa disciplina e fascia d'età."
};

// ---------------------------------------------------------------------------
// Header + burger + alert di sviluppo (compilati in ogni pagina)
// ---------------------------------------------------------------------------

function navLinksFor(nav, currentOutput) {
    return nav.filter(link => link.href !== `./${currentOutput}`);
}

export function compileHeaderInner(brand, ui, nav, currentOutput) {
    const backToHomeAria = (ui.backToHomeAria ?? "").replaceAll("{brand}", brand.name);
    const links = navLinksFor(nav, currentOutput).map(({ href, name }) =>
        `<a href="${href}" class="nav__link">
                    <span>${escapeHtml(name)}</span>
                </a>`).join("\n                ");

    return `
        <div id="titolo" class="nav-fallback">
            <a href="${brand.home}" aria-label="${escapeHtml(backToHomeAria)}">
                <img
                    src="${brand.logo}"
                    alt="Logo ${escapeHtml(brand.name)}"
                    loading="eager"
                    height="128"
                    width="auto">
                <span class="header-brand-name">${escapeHtml(brand.name)}</span>
            </a>
        </div>

        <nav class="desktop-nav" aria-label="${escapeHtml(ui.navMainLabel ?? "Navigazione principale")}">
                ${links}
        </nav>
    `;
}

export function compileBurger(ui, nav, currentOutput) {
    const links = navLinksFor(nav, currentOutput).map(({ href, name }) =>
        `<li class="burger-nav__item">
                <a href="${href}" class="burger-nav__link">${escapeHtml(name)}</a>
            </li>`).join("\n            ");

    return `
        <div id="burger">
            <button
              class="burger-icon"
              aria-label="Menu"
              aria-expanded="false"
              aria-controls="burger-links">
                <svg
                  class="burger-svg"
                  viewBox="0 0 24 24">
                    <rect class="burger-line line1" x="0" y="2"  width="24" height="4" rx="2"></rect>
                    <rect class="burger-line line2" x="0" y="10" width="24" height="4" rx="2"></rect>
                    <rect class="burger-line line3" x="0" y="18" width="24" height="4" rx="2"></rect>
                </svg>
            </button>
        </div>
        <ul id="burger-links" class="burger-nav links-off" role="list" aria-label="Menu di navigazione">
            ${links}
        </ul>`;
}

export function compileDevAlert(ui) {
    if (!ui.developmentAlert) return "";
    return `
        <div class="development-alert" role="alert">${escapeHtml(ui.developmentAlert)}</div>`;
}

// ---------------------------------------------------------------------------
// Footer (compilato in ogni pagina)
// ---------------------------------------------------------------------------

function renderSocialItem({ name, url, icon, color }, ui) {
    const safeName = escapeHtml(name || "");
    const followAria = (ui.followUsAria ?? "").replaceAll("{name}", safeName);
    const dataAttr = (name || "").toLowerCase() === "tiktok" ? `data-platform="tiktok"` : "";

    return `
        <li style="--hover-color: ${escapeHtml(color)};">
            <a href="${escapeHtml(url)}"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${escapeHtml(followAria)}"
               class="social-link"
               ${dataAttr}>
                <i class="${escapeHtml(icon)}" aria-hidden="true"></i>
            </a>
        </li>`;
}

function renderSocialBox(config, ui) {
    if (!config.social?.length) return "";

    return `
        <nav class="footer-social" aria-label="${escapeHtml(ui.socialAriaLabel ?? "Social media")}">
            <p class="footer-social-title" aria-hidden="true">${escapeHtml(ui.socialFollowTitle ?? "")}</p>
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
    const callAria = (ui.callUsAria ?? "").replaceAll("{phone}", safePhone);
    return `
        <a href="tel:${telHref(phone)}" class="footer-phone" aria-label="${escapeHtml(callAria)}">
            <i class="fas fa-phone-alt" aria-hidden="true"></i>
            <span>${safePhone}</span>
        </a>`;
}

function renderAffiliation(config, ui) {
    const { logo, altText, subNum } = config.associations.asi ?? {};

    return `
        <div class="footer-affiliation">
            <span class="footer-affiliation-title">${escapeHtml(ui.affiliationTitle ?? "")}</span>
            <img src="${escapeHtml(logo)}" alt="${escapeHtml(altText || ui.affiliationCardAlt || "")}" loading="lazy" width="auto" height="72">
            ${subNum ? `<span class="footer-asi-subnum">${escapeHtml(ui.tesseraLabel ?? "")} ${escapeHtml(subNum)}</span>` : ""}
        </div>`;
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
            <nav class="footer-legal-links" aria-label="${escapeHtml(ui.legalInfoAriaLabel ?? "Informazioni legali")}">
                <a href="./privacy.html">Privacy Policy</a>
                <span aria-hidden="true">&middot;</span>
                <a href="./cookie.html">Cookie Policy</a>
            </nav>
        </div>`;
}

export function compileFooter(config, ui) {
    const year = new Date().getFullYear();

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

// ---------------------------------------------------------------------------
// Home: orari (stati completi compilati, il JS commuta solo la visibilità)
// ---------------------------------------------------------------------------

function renderBrand(config, ui) {
    return `
        <address class="footer-brand">
            <span class="footer-brand-name">${escapeHtml(config.brand.name)}</span>
            ${renderPhoneLink(config, ui)}
        </address>`;
}

function renderScheduleTable(dati) {
    return `
                <thead>
                    <tr>
                        <th class="giorno" scope="col">${ORARI_UI.labelGiorno}</th>
                        <th scope="col">${ORARI_UI.labelOrario}</th>
                    </tr>
                </thead>
                <tbody>
                    ${dati.giorni.map(g =>
                    `<tr>
                            <th class="giorno" scope="row">${escapeHtml(g.giorno)}</th>
                            <td class="orario-disciplina">${escapeHtml(g.ora || "-")}</td>
                        </tr>`).join("\n                    ")}
                </tbody>
            `;
}

export function compileOrari(corsi) {
    const disciplines = buildDisciplineMap(corsi.disciplina ?? []);
    const keys = Object.keys(disciplines);
    if (keys.length === 0) return "";

    const disciplineTabs = keys.map((key, index) => {
        const d = disciplines[key];
        return `<li class="${index ? "off" : ""}">
                            <button type="button" class="topic-btn" role="tab" aria-selected="${index === 0}" data-discipline="${escapeHtml(key)}">
                                <i class="${escapeHtml(d.icona || "fas fa-circle")}" aria-hidden="true"></i>
                                ${escapeHtml(d.titolo || key)}
                            </button>
                        </li>`;
    }).join("\n                        ");

    const descriptions = keys.map((key, index) => {
        const d = disciplines[key];
        return `<p class="discipline-description" data-discipline="${escapeHtml(key)}"${index ? " hidden" : ""}>${escapeHtml(d.descrizione || "")}</p>`;
    }).join("\n        ");

    const ageMenus = keys.map((key, index) => {
        const orari = disciplines[key].orari ?? {};
        const catKeys = Object.keys(orari);
        const tabs = catKeys.map((ck, j) =>
            `<li class="${j === 0 ? "" : "off"}">
                                    <button
                                        type="button"
                                        class="topic-btn"
                                        role="tab"
                                        aria-selected="${j === 0}"
                                        aria-controls="schedule-${escapeHtml(key)}-${escapeHtml(ck)}"
                                        data-category-key="${escapeHtml(ck)}">
                                        ${escapeHtml(orari[ck].id ?? ck)}
                                    </button>
                                </li>`).join("\n                                    ");
        return `<ul class="orari-selector-menu" data-discipline="${escapeHtml(key)}" role="tablist"${index ? " hidden" : ""}>
                                    ${tabs}
                                </ul>`;
    }).join("\n                        ");

    const contents = keys.map((key, index) => {
        const d = disciplines[key];
        const orari = d.orari ?? {};
        const cats = Object.keys(orari).map((ck, j) => {
            const dati = orari[ck];
            const hasRows = dati.giorni?.some(({ ora }) => Boolean(ora));
            const table = hasRows
                ? `<table class="schedule-table">
                                ${renderScheduleTable(dati)}
                            </table>`
                : `<p class="schedule-empty">${ORARI_UI.nessunCorso}</p>`;

            return `<div class="category-state" data-category="${escapeHtml(ck)}" id="schedule-${escapeHtml(key)}-${escapeHtml(ck)}" role="tabpanel"${j ? " hidden" : ""}>
                            <p class="schedule-description">${dati.info || ""}</p>
                            <div class="schedule-table-card">
                                <h3>${escapeHtml(d.titolo || key)}</h3>
                                ${table}
                            </div>
                        </div>`;
        }).join("\n            ");

        return `<div class="orari-state" data-discipline="${escapeHtml(key)}"${index ? " hidden" : ""}>
            ${cats}
        </div>`;
    }).join("\n        ");

    return `
            <div class="schedule-layout">
                <div class="discipline-panel schedule-selector-group">
                    <span class="schedule-panel-kicker" id="schedule-selection-kicker">${ORARI_UI.kickerSelezione}</span>
                    <span class="schedule-selector-label" id="schedule-discipline-label">${ORARI_UI.labelDisciplina}</span>
                    <div class="selector" aria-label="${ORARI_UI.ariaDisciplina}">
                        <ul id="disciplina-selector-menu" role="tablist">
                        ${disciplineTabs}
                        </ul>
                    </div>
                    ${descriptions}
                </div>

                <div class="schedule-results">
                    <div class="schedule-selector-group age-selector">
                        <span class="schedule-selector-label" id="schedule-age-label">${ORARI_UI.labelFasciaEta}</span>
                        <div class="selector" aria-label="${ORARI_UI.ariaFasciaEta}">
                        ${ageMenus}
                        </div>
                    </div>

                    <div class="content">
                        <span class="schedule-panel-kicker" id="schedule-results-kicker">${ORARI_UI.kickerRisultati}</span>
        ${contents}
                    </div>
                </div>
            </div>
        `;
}

// ---------------------------------------------------------------------------
// Home: luogo (indirizzo + mappa compilati, il placeholder è gestito dal JS)
// ---------------------------------------------------------------------------

export function compileLuogo(corsi) {
    const luogo = buildLuogo(corsi.luogo);
    const { via, numero, cap, citta, provincia } = luogo.indirizzo ?? {};

    const indirizzo = via
        ? `${escapeHtml(via)}, ${escapeHtml(numero)} <br>${escapeHtml(cap)} ${escapeHtml(citta)} (${escapeHtml(provincia)})`
        : "";

    const map = luogo.map
        ? `
            <iframe
                src="${escapeHtml(luogo.map)}"
                title="Mappa della sede"
                loading="lazy"
                hidden></iframe>
            <div class="map-placeholder">
                <div class="map-placeholder-icon">
                    <i class="fas fa-map-location-dot" aria-hidden="true"></i>
                </div>
                <p class="map-placeholder-text">
                    Per rispetto della tua privacy, la mappa interattiva di Google Maps
                    viene caricata solo su tua richiesta.
                </p>
                <button type="button" id="loadMapBtn" class="btn map-placeholder-btn">
                    <i class="fas fa-map-pin" aria-hidden="true"></i>
                    Carica la mappa
                </button>
            </div>`
        : "";

    return `<div id="indirizzo">${indirizzo}</div>
        <div id="map">${map}</div>`;
}

// ---------------------------------------------------------------------------
// Contatti (contatti utili + team compilati)
// ---------------------------------------------------------------------------

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

export function compileContactsPage(contatti, team) {
    const contacts = buildContacts(contatti.email);
    const usefulContacts = Object.values(contacts).map(renderUsefulContact).filter(Boolean).join("");
    const teamHtml = (team ?? []).map(renderPerson).filter(Boolean).join("");

    return `<section id="contatti-utili" class="useful-contacts-section">
        <label class="lb_title">Contatti Utili</label>
        <div class="useful-contacts-list">${usefulContacts}</div>
    </section>
    <section id="team" class="team-section">
        <label class="lb_title">Il Nostro Team</label>
        <div class="team-list">${teamHtml}</div>
    </section>`;
}

// ---------------------------------------------------------------------------
// Chi Siamo (contenuti + pannelli tab compilati, il JS commuta solo i tab)
// ---------------------------------------------------------------------------

function renderActivity(activity) {
    return `<div class="activity">
        <h3 class="activity-title">${activity.title}</h3>
        <section id="carosello${activity.carosello}" class="activity-media slideshow"></section>
        <div class="activity-text">${activity.text}</div>
    </div>`;
}

function renderTopic(disciplina, index) {
    const introCarousel = disciplina.carosello
        ? `<section id="carosello${disciplina.carosello}" class="activity-media slideshow"></section>`
        : "";

    return `<div class="content topic" id="topic-${disciplina.key}" role="tabpanel" aria-labelledby="topic-tab-${index}"${index ? " hidden" : ""}>
        <h2>${disciplina.heading}</h2>
        <div class="topic-intro">${disciplina.intro}</div>
        ${introCarousel}
        ${disciplina.introOutro ? `<div class="topic-intro-outro">${disciplina.introOutro}</div>` : ""}
        <div class="activities-list">${disciplina.activities.map(renderActivity).join("")}</div>
    </div>`;
}

export function compileWhoweare(whoweare) {
    const discipline = whoweare.disciplina ?? [];
    const tabs = discipline.map((d, index) => `<li class="${index ? "off" : ""}">
        <button type="button" class="topic-btn" role="tab" aria-selected="${index === 0}" aria-controls="topic-${d.key}" id="topic-tab-${index}" data-topic-index="${index}">${escapeHtml(d.tabLabel)}</button>
    </li>`).join("");

    return `<div id="descrizione">${whoweare.intro?.text ?? ""}</div>
    <div id="topicSelector" role="tablist" aria-label="Seleziona argomento"><ul>${tabs}</ul></div>
    <div id="topicsContainer">${discipline.map(renderTopic).join("")}</div>`;
}

// ---------------------------------------------------------------------------
// Campi legali (privacy/cookie compilati senza JS)
// ---------------------------------------------------------------------------

export function fillLegalFields(html, settings, contatti) {
    if (!html.includes("data-legal-field")) return html;

    const legal = settings.legale ?? {};
    const sede = legal.sedeLegale ?? {};
    const values = {
        denominazione: legal.denominazione ?? "",
        codiceFiscale: legal.codiceFiscale ?? "",
        partitaIva: legal.partitaIva ?? "",
        pivaInline: legal.partitaIva ? `, P.IVA ${legal.partitaIva}` : "",
        sedeLegale: sede.via ? `${sede.via}, ${sede.cap} ${sede.citta}` : "",
        rappresentanteLegale: legal.rappresentanteLegale ?? "",
        registrazione: legal.registrazione ?? "",
        emailPrivacy: legal.emailPrivacy || contatti.email?.privacy?.email || ""
    };

    return html
        .replace(/(<([a-z]+)[^>]*data-legal-field="([^"]+)"[^>]*>)[\s\S]*?<\/\2>/gi, (m, open, tag, key) =>
            key in values ? `${open}${values[key] ?? ""}</${tag}>` : m)
        .replace(/(<a[^>]*data-legal-field-href="([^"]+)"[^>]*href=")[^"]*(")/gi, (m, open, key, close) =>
            key in values ? `${open}mailto:${values[key] ?? ""}${close}` : m);
}





