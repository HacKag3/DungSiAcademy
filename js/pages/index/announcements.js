import { loadData, buildAnnouncements } from "../../data-loader.js";
import { escapeHtml } from "../../utilities/utils.js";
import { setupDettaglio } from "./annuncioDettaglio.js";

async function verificaFileDettaglio(annunciAttivi) {
    return Promise.all(
        annunciAttivi.map(async (a) => {
            let fileEsiste = false;
            if (a.dettaglioUrl && String(a.dettaglioUrl).trim()) {
                try {
                    const res = await fetch(a.dettaglioUrl, { method: "HEAD" });
                    fileEsiste = res.ok;
                } catch {
                    fileEsiste = false;
                }
            }
            return { ...a, fileEsiste };
        })
    );
}

function renderCard(a) {
    return `
        <div class="annuncio-card">
            <h2>${escapeHtml(a.titolo)}</h2>
            <span class="annuncio-data annuncio-evento-data"><i class="far fa-calendar-check" aria-hidden="true"></i>
            <span> ${escapeHtml(a.data)}</span></span>
            <p>${escapeHtml(a.testo)}</p>
            <div class="annuncio-footer">
                <span class="annuncio-data annuncio-pubblicazione-data"><i class="far fa-clock" aria-hidden="true"></i><span>Pubblicato il ${escapeHtml(a.dataPubblicazione)}</span></span>
                ${a.fileEsiste ? `
                    <button type="button" class="annuncio-apri" data-annuncio-id="${escapeHtml(a.id)}" aria-controls="annuncio-dettaglio" aria-expanded="false">
                        Dettagli
                    </button>
                ` : ""}
            </div>
        </div>`;
}

export async function initAnnouncements() {
    const annunciContainer = document.getElementById("sezione-annunci");
    if (!annunciContainer) return;

    const annunci = buildAnnouncements(await loadData("annunci"));
    const annunciAttivi = annunci.filter(a => a.attivo);
    if (annunciAttivi.length === 0) {
        annunciContainer.style.display = "none";
        return;
    }

    const annunciConVerifica = await verificaFileDettaglio(annunciAttivi);

    annunciContainer.innerHTML = `
        <label><i class="fa-solid fa-bullhorn"></i> Annunci</label>
        <div class="fade-content">
            <div class="carousel-wrapper" id="carouselWrapper">
                <div class="carousel-track">
                    ${annunciConVerifica.map(renderCard).join("")}
                </div>
            </div>
            <section id="annuncio-dettaglio" class="annuncio-dettaglio" hidden aria-live="polite" aria-modal="true" role="dialog"></section>
        </div>
    `;

    const dettaglio = setupDettaglio(annunciContainer);

    const carouselWrapper = annunciContainer.querySelector("#carouselWrapper");
    let suppressClickAfterDrag = false;

    if (carouselWrapper) {
        let isDragging = false;
        let hasDragged = false;
        let startX = 0;
        let startScrollLeft = 0;

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            carouselWrapper.classList.remove("dragging");
            if (hasDragged) {
                suppressClickAfterDrag = true;
                window.setTimeout(() => {
                    suppressClickAfterDrag = false;
                }, 80);
            }
            hasDragged = false;
        };

        carouselWrapper.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;

            if (event.target.closest("button, a, input, select, textarea")) {
                return;
            }

            isDragging = true;
            hasDragged = false;
            startX = event.clientX;
            startScrollLeft = carouselWrapper.scrollLeft;

            carouselWrapper.classList.add("dragging");
            carouselWrapper.setPointerCapture?.(event.pointerId);
        }, { passive: true });

        carouselWrapper.addEventListener("pointermove", (event) => {
            if (!isDragging) return;

            const deltaX = event.clientX - startX;

            if (Math.abs(deltaX) > 4) {
                hasDragged = true;
                suppressClickAfterDrag = true;
                carouselWrapper.scrollLeft = startScrollLeft - deltaX;
            }
        }, { passive: true });

        carouselWrapper.addEventListener("pointerup", endDrag, { passive: true });
        carouselWrapper.addEventListener("pointerleave", endDrag, { passive: true });
        carouselWrapper.addEventListener("pointercancel", endDrag, { passive: true });
    }

    annunciContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-annuncio-id]");
        if (!button) return;

        if (suppressClickAfterDrag) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickAfterDrag = false;
            return;
        }

        const annuncio = annunci.find(a => a.id === button.dataset.annuncioId);
        if (!annuncio || !dettaglio) return;
        dettaglio.apri(annuncio, button);
    });
}
