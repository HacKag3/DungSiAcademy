import { loadData } from "../../data-loader.js";

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
    const [settings, contatti] = await Promise.all([loadData("settings"), loadData("contatti")]);
    fillLegalFields(settings, contatti);
}

document.addEventListener("DOMContentLoaded", () => {
    initLegal().catch((error) => console.error("[Legal] Impossibile caricare i dati legali:", error));
});
