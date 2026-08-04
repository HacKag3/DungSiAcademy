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
                            <span class="annuncio-data"><i class="far fa-calendar-alt"></i> ${escapeHtml(a.data)}</span>
                            <p>${escapeHtml(a.testo)}</p>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;
}

export function initAnnouncements() {
    renderSezioneAnnunci();
}
