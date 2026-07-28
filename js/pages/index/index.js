import { CONFIG } from "../../config.js";
import { initAnnouncements } from "./announcements.js";

function initTabellaOrari() {
    const menuUl = document.getElementById("orari-selector-menu");
    const table = document.querySelector(".table");
    const infoBox = document.getElementById("infoBox");

    const categorieKeys = Object.keys(CONFIG.orari);
    if (!menuUl || !table || !infoBox || categorieKeys.length === 0) return;

    menuUl.innerHTML = categorieKeys.map((chiave, index) => {
        const datiCategoria = CONFIG.orari[chiave];
        return `
            <a onclick="window.changeAge(${index})">
                <li class="topic ${index === 0 ? '' : 'off'}">${datiCategoria.id}</li>
            </a>
        `;
    }).join("");

    window.changeAge = function(tipo) {
        const chiaveSelezionata = categorieKeys[tipo];
        const dati = CONFIG.orari[chiaveSelezionata];
        if (!dati) return;

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

        menuUl.querySelectorAll("li.topic").forEach((bottone, indice) => {
            bottone.classList.toggle("off", indice !== tipo);
        });
    };

    window.changeAge(0);
}

function initLuogo() {
    const address = document.getElementById("indirizzo");
    const { via, cap, citta } = CONFIG.luogo.indirizzo;
    const map = document.getElementById("map");

    address.innerHTML = `${via} <br>${cap} ${citta}`;
    map.innerHTML = CONFIG.luogo.map;
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