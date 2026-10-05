import { clonaTemplate, riempi } from "../../utilities/template.js";
import { telefono } from "../../utilities/telefono.js";

// Link di telefono ed email (template in building/pages/contacts/recapiti.html),
// condivisi da contatti utili e team. nome = chi si chiama/scrive, per l'aria-label.
function creaLink(idTemplate, testo, href, nome) {
    const link = riempi(clonaTemplate(idTemplate), { testo }).querySelector("a");
    link.href = href;
    link.setAttribute("aria-label", `${link.dataset.aria} ${nome}`);
    link.removeAttribute("data-aria");
    return link;
}

/** Link per telefono (se valido) ed email (se presente); lista vuota se non ce ne sono. */
export function creaRecapiti({ telefono: numero, email }, nome) {
    const tel = telefono(numero);
    const mail = String(email ?? "").trim();
    return [
        tel && creaLink("tpl-recapito-telefono", tel.testo, `tel:${tel.href}`, nome),
        mail && creaLink("tpl-recapito-email", mail, `mailto:${mail}`, nome)
    ].filter(Boolean);
}
