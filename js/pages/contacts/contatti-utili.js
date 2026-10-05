import { caricaContatti } from "../../utilities/contatti.js";
import { clonaTemplate, riempi } from "../../utilities/template.js";
import { creaRecapiti } from "./recapiti.js";

// Contatti utili letti a runtime da contenuti/contatti.json (modificabile anche
// su main, senza rebuild). Il markup è in building/pages/contacts/contatti-utili.html.
function creaContatto([id, contatto]) {
    const riga = riempi(clonaTemplate("tpl-contatto"), contatto).querySelector(".useful-contact-row");
    riga.id = `contatto-${contatto.id ?? id}`;
    riga.querySelector(".useful-contact-icon i").className = contatto.icon || "fas fa-info-circle";

    const recapiti = creaRecapiti(contatto, contatto.titolo);
    if (recapiti.length > 0) {
        riga.querySelector(".person-contacts").append(...recapiti);
        riga.querySelector(".useful-contact-pending").remove();
    } else {
        riga.querySelector(".person-contacts").remove();
    }

    // Descrizione e referente sono facoltativi.
    if (!String(contatto.descrizione ?? "").trim()) riga.querySelector(".useful-contact-desc").remove();
    if (!String(contatto.referente ?? "").trim()) riga.querySelector(".useful-contact-referente").remove();
    return riga;
}

export async function initContattiUtili() {
    const lista = document.querySelector("#contatti-utili .useful-contacts-list");
    if (!lista) return;

    try {
        const contatti = await caricaContatti();
        const voci = Object.entries(contatti ?? {}).filter(([, contatto]) => contatto?.titolo);
        lista.replaceChildren(...voci.map(creaContatto));
    } catch (error) {
        console.error("[Contatti] Contatti utili non disponibili:", error);
        document.querySelector("#contatti-utili .useful-contacts-errore").hidden = false;
    }
}
