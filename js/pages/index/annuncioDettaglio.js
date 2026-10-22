import { clonaTemplate, riempi } from "../../utilities/template.js";

export function setupDettaglio(container) {
    const dettaglio = container.querySelector("#annuncio-dettaglio");
    if (!dettaglio) return null;

    document.body.appendChild(dettaglio);

    let ultimoBottoneAttivo = null;

    function chiudi() {
        dettaglio.hidden = true;
        document.body.classList.remove("annuncio-alert-aperto");
        container.querySelectorAll("[data-annuncio-id]").forEach(button => button.setAttribute("aria-expanded", "false"));
        ultimoBottoneAttivo?.focus();
    }

    async function apri(annuncio, bottone) {
        ultimoBottoneAttivo = bottone;
        dettaglio.replaceChildren(riempi(clonaTemplate("tpl-annuncio-dettaglio"), annuncio));
        dettaglio.hidden = false;
        document.body.classList.add("annuncio-alert-aperto");
        bottone.setAttribute("aria-expanded", "true");
        dettaglio.querySelector(".annuncio-chiudi").focus();

        const contenuto = dettaglio.querySelector(".annuncio-dettaglio-contenuto");
        try {
            const response = await fetch(annuncio.dettaglioUrl, { cache: "no-cache" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            contenuto.innerHTML = await response.text();
        } catch (error) {
            console.error(`Impossibile caricare il dettaglio dell'annuncio "${annuncio.id}":`, error);
            const messaggio = document.createElement("p");
            messaggio.textContent = contenuto.dataset.errore;
            contenuto.replaceChildren(messaggio);
        }
    }

    dettaglio.addEventListener("click", (event) => {
        if (event.target !== dettaglio && !event.target.closest(".annuncio-chiudi")) return;
        chiudi();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || dettaglio.hidden) return;
        chiudi();
    });

    return { apri };
}
