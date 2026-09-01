import { CONFIG } from "../../config.js";
import { initAnnouncements } from "./announcements.js";

function renderOrariTabs(categorieKeys) {
    return categorieKeys.map((chiave, index) => {
        const datiCategoria = CONFIG.orari[chiave];
        return `
            <li class="topic ${index === 0 ? '' : 'off'}">
                <button
                    type="button"
                    class="topic-btn"
                    role="tab"
                    aria-selected="${index === 0}"
                    aria-controls="topic-${chiave}"
                    id="topic-tab-${index}"
                    data-topic-index="${index}">
                        ${datiCategoria.id}
                </button>
            </li>
        `;
    }).join("");
}

function renderOrariContent(dati, table, infoBox) {
    table.innerHTML = `
        <thead>
            <tr>
                <th class="giorno" style="text-align:center">Giorno</th>
                <th>Orario</th>
            </tr>
        </thead>
        <tbody>
            ${dati.giorni.map(g =>
                `<tr>
                    <td class="giorno">${g.giorno}</td>
                    <td>${g.ora}</td>
                </tr>`).join("")}
        </tbody>
    `;

    infoBox.innerHTML = `<p>${dati.info}</p>`;
}

function initTabellaOrari() {
    const menuUl = document.getElementById("orari-selector-menu");
    const table = document.querySelector(".table");
    const infoBox = document.getElementById("infoBox");

    const categorieKeys = Object.keys(CONFIG.orari);
    if (!menuUl || !table || !infoBox || categorieKeys.length === 0) return;

    menuUl.innerHTML = renderOrariTabs(categorieKeys);

    function changeAge(tipo) {
        const chiaveSelezionata = categorieKeys[tipo];
        const dati = CONFIG.orari[chiaveSelezionata];
        if (!dati) return;

        renderOrariContent(dati, table, infoBox);

        menuUl.querySelectorAll("button[data-topic-index]").forEach((button) => {
            const isActive = Number(button.dataset.topicIndex) === tipo;
            button.closest("li")?.classList.toggle("off", !isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
    }

    menuUl.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-topic-index]");
        if (!button) return;
        changeAge(Number(button.dataset.topicIndex));
    });

    changeAge(0);
}

function initLuogo() {
    const address = document.getElementById("indirizzo");
    const { via, numero, cap, citta, provincia } = CONFIG.luogo.indirizzo;
    const map = document.getElementById("map");

    address.innerHTML = `${via}, ${numero} <br>${cap} ${citta} (${provincia})`;

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
        map.innerHTML = CONFIG.luogo.map;
    }, { once: true });
}

function loadIndex() {
    if (typeof window.initCarousel === "function" && document.querySelector('#carosello0')) {
        window.initCarousel(0);
    }
    initAnnouncements();
    if (document.getElementById("orari-selector-menu")) initTabellaOrari();
    if (document.getElementById("luogo")) initLuogo();
}

window.addEventListener("DOMContentLoaded", loadIndex);
document.addEventListener('click', (event) => {
    // Cerchiamo se l'elemento cliccato è l'icona o un suo contenuto
    const isIcon = event.target.closest('#infoIcon');
    const isOverlay = event.target.id === 'overlay';

    const infoBox = document.getElementById('infoBox');
    const overlay = document.getElementById('overlay');

    if (isIcon && infoBox && overlay) {
        infoBox.style.display = 'block';
        overlay.style.display = 'block';
    }
    else if (isOverlay && infoBox && overlay) {
        infoBox.style.display = 'none';
        overlay.style.display = 'none';
    }
});