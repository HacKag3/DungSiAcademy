import { clonaTemplate, riempi } from "../../utilities/template.js";
import { setupDettaglio } from "./annuncioDettaglio.js";

// Annunci letti a runtime da contenuti/annunci.json (le pagine di dettaglio sono
// in contenuti/annunci/): si aggiornano anche su main, senza rebuild.
// Il markup è nei <template> di building/pages/index/annunci.html.
const ANNUNCI_URL = "contenuti/annunci.json";

async function caricaAnnunci() {
    const res = await fetch(ANNUNCI_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${ANNUNCI_URL}`);
    return res.json();
}

async function verificaFileDettaglio(annunciAttivi) {
    return Promise.all(
        annunciAttivi.map(async (a) => {
            let fileEsiste = false;
            if (a.dettaglioUrl && String(a.dettaglioUrl).trim()) {
                try {
                    const res = await fetch(a.dettaglioUrl, { method: "HEAD", cache: "no-cache" });
                    fileEsiste = res.ok;
                } catch {
                    fileEsiste = false;
                }
            }
            return { ...a, fileEsiste };
        })
    );
}

function creaCard(annuncio) {
    const card = riempi(clonaTemplate("tpl-annuncio-card"), annuncio);
    const apri = card.querySelector(".annuncio-apri");
    if (annuncio.fileEsiste) {
        apri.dataset.annuncioId = annuncio.id;
    } else {
        apri.remove();
    }
    return card;
}

export async function initAnnouncements() {
    const annunciContainer = document.getElementById("sezione-annunci");
    if (!annunciContainer) return;

    const annunciAttivi = (await caricaAnnunci()).filter(a => a.attivo);
    if (annunciAttivi.length === 0) {
        annunciContainer.style.display = "none";
        return;
    }

    const annunci = await verificaFileDettaglio(annunciAttivi);

    annunciContainer.replaceChildren(clonaTemplate("tpl-annunci"));
    annunciContainer.querySelector(".carousel-track").append(...annunci.map(creaCard));

    const dettaglio = setupDettaglio(annunciContainer);

    const carouselWrapper = annunciContainer.querySelector("#carouselWrapper");
    let suppressClickAfterDrag = false;

    if (carouselWrapper) {
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;

        carouselWrapper.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            if (event.target.closest("button, a, input, select, textarea")) return;

            isDragging = true;
            startX = event.clientX;
            startScrollLeft = carouselWrapper.scrollLeft;
            carouselWrapper.classList.add("dragging");
            try { carouselWrapper.setPointerCapture?.(event.pointerId); } catch {}
        }, { passive: true });

        carouselWrapper.addEventListener("pointermove", (event) => {
            if (!isDragging) return;
            const deltaX = event.clientX - startX;
            if (Math.abs(deltaX) > 3) {
                suppressClickAfterDrag = true;
                carouselWrapper.scrollLeft = startScrollLeft - deltaX;
            }
        }, { passive: true });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            carouselWrapper.classList.remove("dragging");
            if (suppressClickAfterDrag) {
                window.setTimeout(() => { suppressClickAfterDrag = false; }, 150);
            }
        };

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
