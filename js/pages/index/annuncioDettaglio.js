import { escapeHtml } from "../../utilities/utils.js";

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
        dettaglio.innerHTML = `
            <div class="annuncio-dettaglio-box">
                <button type="button" class="annuncio-chiudi" aria-label="Chiudi dettaglio">&times;</button>
                <div class="annuncio-dettaglio-date">
                    <span class="annuncio-dettaglio-data"><i class="far fa-calendar-check" aria-hidden="true"></i> Evento: ${escapeHtml(annuncio.data)}</span>
                    <span class="annuncio-dettaglio-data annuncio-pubblicazione-data"><i class="far fa-clock" aria-hidden="true"></i> Pubblicato il ${escapeHtml(annuncio.dataPubblicazione)}</span>
                </div>
                <h2>${escapeHtml(annuncio.titolo)}</h2>
                <div class="annuncio-dettaglio-contenuto" aria-live="polite">Caricamento...</div>
            </div>
        `;
        dettaglio.hidden = false;
        document.body.classList.add("annuncio-alert-aperto");
        bottone.setAttribute("aria-expanded", "true");
        dettaglio.querySelector(".annuncio-chiudi").focus();

        try {
            const response = await fetch(annuncio.dettaglioUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            dettaglio.querySelector(".annuncio-dettaglio-contenuto").innerHTML = await response.text();
        } catch (error) {
            console.error(`Impossibile caricare il dettaglio dell'annuncio "${annuncio.id}":`, error);
            dettaglio.querySelector(".annuncio-dettaglio-contenuto").innerHTML = "<p>Il dettaglio non è momentaneamente disponibile.</p>";
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
