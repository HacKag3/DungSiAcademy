import { caricaContatti } from "../utilities/contatti.js";
import { riempi } from "../utilities/template.js";
import { telefono } from "../utilities/telefono.js";

// Dati di contenuti/contatti.json usati fuori dalla pagina Contatti:
//  - data-contatto-telefono="id"  → link tel: (es. il telefono nel footer);
//  - data-contatto-email="id"     → link mailto: (es. l'email privacy nelle policy);
//  - data-contatto-referente="id" → testo del referente (data-campo="referente").
// Gli elementi restano nascosti (o con il testo di ripiego) se il dato manca.
function etichetta(link, testo) {
    if (link.dataset.aria) link.setAttribute("aria-label", `${link.dataset.aria} ${testo}`);
    link.removeAttribute("data-aria");
}

export async function initContatti() {
    const telefoni = document.querySelectorAll("[data-contatto-telefono]");
    const email = document.querySelectorAll("[data-contatto-email]");
    const referenti = document.querySelectorAll("[data-contatto-referente]");
    if (telefoni.length + email.length + referenti.length === 0) return;

    const contatti = await caricaContatti();

    for (const link of telefoni) {
        const numero = telefono(contatti[link.dataset.contattoTelefono]?.telefono);
        if (!numero) continue;
        riempi(link, numero);
        link.href = `tel:${numero.href}`;
        etichetta(link, numero.testo);
        link.hidden = false;
    }

    for (const link of email) {
        const indirizzo = String(contatti[link.dataset.contattoEmail]?.email ?? "").trim();
        if (!indirizzo) continue;
        link.href = `mailto:${indirizzo}`;
        link.textContent = indirizzo;
    }

    for (const elemento of referenti) {
        const referente = String(contatti[elemento.dataset.contattoReferente]?.referente ?? "").trim();
        if (!referente) continue;
        riempi(elemento, { referente });
        elemento.hidden = false;
    }
}
