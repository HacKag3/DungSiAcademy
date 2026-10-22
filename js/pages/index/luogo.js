// Luogo compilato dal build (indirizzo + iframe mappa nascosto):
// qui il JS gestisce solo il consenso esplicito al caricamento della mappa.
function initLuogo() {
    const map = document.getElementById("map");
    if (!map) return;

    const loadMapBtn = document.getElementById("loadMapBtn");
    loadMapBtn?.addEventListener("click", () => {
        const iframe = map.querySelector("iframe");
        if (!iframe) return;
        iframe.hidden = false;
        map.querySelector(".map-placeholder")?.remove();
    }, { once: true });
}

export { initLuogo };
