import { ANNUNCI } from "../../annunci.js";
import { escapeHtml } from "../../utilities/utils.js";

export function renderSezioneAnnunci() {
    const annunciContainer = document.getElementById("sezione-annunci");
    if (!annunciContainer) return;

    const annunciAttivi = ANNUNCI.filter(a => a.attivo);
    if (annunciAttivi.length === 0) {
        annunciContainer.style.display = "none";
        return;
    }

    annunciContainer.innerHTML = `
        <label>📢 Annunci</label>
        <div class="fade-content">
            <div class="carousel-wrapper" id="carouselWrapper">
                <div class="carousel-track">
                    ${annunciAttivi.map(a => `
                        <div class="annuncio-card">
                            <h2>${escapeHtml(a.titolo)}</h2>
                            <span class="annuncio-data annuncio-evento-data"><i class="far fa-calendar-check" aria-hidden="true"></i>
                            <span> ${escapeHtml(a.data)}</span></span>     
                            <p>${escapeHtml(a.testo)}</p>
                            <div class="annuncio-footer">
                                <span class="annuncio-data annuncio-pubblicazione-data"><i class="far fa-clock" aria-hidden="true"></i><span>Pubblicato il ${escapeHtml(a.dataPubblicazione)}</span></span>
                                ${a.dettaglioUrl && String(a.dettaglioUrl).trim() ? `
                                    <button type="button" class="annuncio-apri" data-annuncio-id="${escapeHtml(a.id)}" aria-controls="annuncio-dettaglio" aria-expanded="false">
                                        Dettagli
                                    </button>
                                ` : ""}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
            <section id="annuncio-dettaglio" class="annuncio-dettaglio" hidden aria-live="polite" aria-modal="true" role="dialog"></section>
        </div>
    `;

    const dettaglio = annunciContainer.querySelector("#annuncio-dettaglio");
    document.body.appendChild(dettaglio);
    const carouselWrapper = annunciContainer.querySelector("#carouselWrapper");
    let ultimoBottoneAttivo = null;
    let suppressClickAfterDrag = false;

    if (carouselWrapper) {
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            carouselWrapper.classList.remove("dragging");
            suppressClickAfterDrag = true;
            window.setTimeout(() => {
                suppressClickAfterDrag = false;
            }, 80);
        };

        carouselWrapper.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;

            isDragging = true;
            startX = event.clientX;
            startScrollLeft = carouselWrapper.scrollLeft;
            carouselWrapper.classList.add("dragging");
            carouselWrapper.setPointerCapture?.(event.pointerId);
        }, { passive: true });

        carouselWrapper.addEventListener("pointermove", (event) => {
            if (!isDragging) return;

            const deltaX = event.clientX - startX;
            if (Math.abs(deltaX) > 4) {
                suppressClickAfterDrag = true;
                carouselWrapper.scrollLeft = startScrollLeft - deltaX;
            }
        }, { passive: true });

        carouselWrapper.addEventListener("pointerup", endDrag, { passive: true });
        carouselWrapper.addEventListener("pointerleave", endDrag, { passive: true });
        carouselWrapper.addEventListener("pointercancel", endDrag, { passive: true });
    }

    annunciContainer.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-annuncio-id]");
        if (!button) return;
        if (suppressClickAfterDrag) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickAfterDrag = false;
            return;
        }

        const annuncio = ANNUNCI.find(a => a.id === button.dataset.annuncioId);
        if (!annuncio || !dettaglio) return;

        ultimoBottoneAttivo = button;
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
        button.setAttribute("aria-expanded", "true");
        dettaglio.querySelector(".annuncio-chiudi").focus();

        try {
            const response = await fetch(annuncio.dettaglioUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            dettaglio.querySelector(".annuncio-dettaglio-contenuto").innerHTML = await response.text();
        } catch (error) {
            console.error(`Impossibile caricare il dettaglio dell'annuncio "${annuncio.id}":`, error);
            dettaglio.querySelector(".annuncio-dettaglio-contenuto").innerHTML = "<p>Il dettaglio non è momentaneamente disponibile.</p>";
        }
    });

    dettaglio.addEventListener("click", (event) => {
        if (!dettaglio || (event.target !== dettaglio && !event.target.closest(".annuncio-chiudi"))) return;
        dettaglio.hidden = true;
        document.body.classList.remove("annuncio-alert-aperto");
        annunciContainer.querySelectorAll("[data-annuncio-id]").forEach(button => button.setAttribute("aria-expanded", "false"));
        ultimoBottoneAttivo?.focus();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !dettaglio || dettaglio.hidden) return;
        dettaglio.hidden = true;
        document.body.classList.remove("annuncio-alert-aperto");
        annunciContainer.querySelectorAll("[data-annuncio-id]").forEach(button => button.setAttribute("aria-expanded", "false"));
        ultimoBottoneAttivo?.focus();
    });
}

export function initAnnouncements() {
    renderSezioneAnnunci();
}
