// js/pages/legal/legal.js
// Le pagine Privacy/Cookie contengono campi legali che arrivano da
// data/settings.json (e l'email privacy da data/contatti.json):
// vengono riempiti a runtime, quindi basta modificare i JSON senza rebuild.
import { loadSiteData } from "../../data-loader.js";

function fillLegalFields(settings, contatti) {
    const legal = settings.legale ?? {};
    const sede = legal.sedeLegale ?? {};
    const pivaInline = legal.partitaIva ? `, P.IVA ${legal.partitaIva}` : "";
    const sedeTesto = sede.via ? `${sede.via}, ${sede.cap} ${sede.citta}` : "";
    const emailPrivacy = legal.emailPrivacy || contatti.email?.privacy?.email || "";

    const values = {
        denominazione: legal.denominazione ?? "",
        codiceFiscale: legal.codiceFiscale ?? "",
        partitaIva: legal.partitaIva ?? "",
        pivaInline,
        sedeLegale: sedeTesto,
        rappresentanteLegale: legal.rappresentanteLegale ?? "",
        registrazione: legal.registrazione ?? "",
        emailPrivacy
    };

    document.querySelectorAll("[data-legal-field]").forEach((el) => {
        const key = el.dataset.legalField;
        el.textContent = values[key] ?? "";
    });
    document.querySelectorAll("[data-legal-field-href]").forEach((el) => {
        const key = el.dataset.legalFieldHref;
        const value = values[key] ?? "";
        el.setAttribute("href", `mailto:${value}`);
    });
}

async function initLegal() {
    if (!document.querySelector("[data-legal-field], [data-legal-field-href]")) return;
    const data = await loadSiteData();
    fillLegalFields(data.settings, data.contatti);
}

document.addEventListener("DOMContentLoaded", initLegal);
