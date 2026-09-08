// js/pages/index/luogo.js
// Sezione "Dove Siamo": indirizzo testuale e mappa Google.

export function initLuogo(config) {
    const address = document.getElementById("indirizzo");
    const indirizzo = config.luogo?.indirizzo ?? {};
    const { via, numero, cap, citta, provincia } = indirizzo;
    const map = document.getElementById("map");

    if (via) {
        address.innerHTML = `${via}, ${numero} <br>${cap} ${citta} (${provincia})`;
    }

    // Non carichiamo subito l'iframe di Google Maps: mostriamo un placeholder
    // e carichiamo la mappa (con conseguente invio di dati a Google) solo se
    // l'utente clicca esplicitamente per vederla. (cookie e privacy choice)
    map.innerHTML = `
        <div class="map-placeholder">
            <div class="map-placeholder-icon">
                <i class="fas fa-map-location-dot" aria-hidden="true"></i>
            </div>
            <p class="map-placeholder-text">
                Per rispetto della tua privacy, la mappa interattiva di Google Maps
                viene caricata solo su tua richiesta.
            </p>
            <button type="button" id="loadMapBtn" class="btn map-placeholder-btn">
                <i class="fas fa-map-pin" aria-hidden="true"></i>
                Carica la mappa
            </button>
        </div>
    `;

    const loadMapBtn = document.getElementById("loadMapBtn");
    loadMapBtn?.addEventListener("click", () => {
        map.innerHTML = config.luogo?.map || "";
    }, { once: true });
}