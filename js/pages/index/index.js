import { loadSiteConfig } from "../../data-loader.js";
import { initAnnouncements } from "./announcements.js";

// Testi UI del selettore orari (costanti: non sono dati del sito).
const ORARI_UI = {
    kickerSelezione: "Il tuo percorso",
    kickerRisultati: "Programma settimanale",
    labelDisciplina: "Disciplina",
    labelFasciaEta: "Fascia d'età",
    ariaDisciplina: "Seleziona disciplina",
    ariaFasciaEta: "Seleziona fascia d'età",
    labelGiorno: "Giorno",
    labelOrario: "Orario",
    nessunCorso: "Nessun corso disponibile per questa disciplina e fascia d'età."
};

function renderDisciplineTabs(disciplineKeys, disciplines) {
    return disciplineKeys.map((key, index) => {
        const discipline = disciplines[key];
        return `<li class="${index ? "off" : ""}">
            <button type="button" class="topic-btn" role="tab" aria-selected="${index === 0}" data-discipline="${key}">
                <i class="${discipline.icona || "fas fa-circle"}" aria-hidden="true"></i>
                ${discipline.titolo || key}
            </button>
        </li>`;
    }).join("");
}

function renderOrariTabs(categorieKeys, orari) {
    return categorieKeys.map((chiave, index) => {
        const datiCategoria = orari[chiave];
        return `
            <li class="topic ${index === 0 ? '' : 'off'}">
                <button
                    type="button"
                    class="topic-btn"
                    role="tab"
                    aria-selected="${index === 0}"
                    aria-controls="schedule-${chiave}"
                    id="topic-tab-${chiave}"
                    data-category-key="${chiave}">
                        ${datiCategoria.id}
                </button>
            </li>
        `;
    }).join("");
}

function renderScheduleTable(dati) {
    return `
        <thead>
            <tr>
                <th class="giorno" scope="col">${ORARI_UI.labelGiorno}</th>
                <th scope="col">${ORARI_UI.labelOrario}</th>
            </tr>
        </thead>
        <tbody>
            ${dati.giorni.map(g =>
                `<tr>
                    <th class="giorno" scope="row">${g.giorno}</th>
                    <td class="orario-disciplina">${g.ora || "-"}</td>
                </tr>`).join("")}
        </tbody>
    `;
}

function renderOrariContent(dati, discipline, disciplines, table, title, disciplineDescription, description, emptyMessage) {
    title.textContent = disciplines?.[discipline]?.titolo || discipline;
    disciplineDescription.textContent = disciplines?.[discipline]?.descrizione || "";
    const hasRows = dati?.giorni?.some(({ ora }) => Boolean(ora));
    table.hidden = !hasRows;
    emptyMessage.hidden = hasRows;
    if (!hasRows) {
        description.textContent = "";
        return;
    }

    table.innerHTML = renderScheduleTable(dati);
    description.innerHTML = dati.info || "";
}

function initTabellaOrari(config) {
    const menuUl = document.getElementById("orari-selector-menu");
    const disciplineMenu = document.getElementById("disciplina-selector-menu");
    const table = document.querySelector(".schedule-table");
    const title = document.getElementById("orari-table-title");
    const emptyMessage = document.getElementById("orari-empty");
    const disciplineDescription = document.getElementById("discipline-description");
    const description = document.getElementById("orari-description");
    const selectionKicker = document.getElementById("schedule-selection-kicker");
    const resultsKicker = document.getElementById("schedule-results-kicker");
    const disciplineLabel = document.getElementById("schedule-discipline-label");
    const ageLabel = document.getElementById("schedule-age-label");

    if (!menuUl || !disciplineMenu || !table || !title || !emptyMessage || !disciplineDescription || !description || !selectionKicker || !resultsKicker || !disciplineLabel || !ageLabel) return;

    const ui = ORARI_UI;
    selectionKicker.textContent = ui.kickerSelezione;
    resultsKicker.textContent = ui.kickerRisultati;
    disciplineLabel.textContent = ui.labelDisciplina;
    ageLabel.textContent = ui.labelFasciaEta;
    emptyMessage.textContent = ui.nessunCorso;
    disciplineMenu.setAttribute("aria-label", ui.ariaDisciplina);
    menuUl.setAttribute("aria-label", ui.ariaFasciaEta);

    const disciplines = config.discipline ?? {};
    const disciplineKeys = Object.keys(disciplines);
    if (disciplineKeys.length === 0) return;

    disciplineMenu.innerHTML = renderDisciplineTabs(disciplineKeys, disciplines);
    let selectedDiscipline = disciplineKeys[0];
    let categorieKeys = [];
    let selectedCategory = "";

    function renderAgeTabs() {
        const orari = config.discipline?.[selectedDiscipline]?.orari ?? {};
        categorieKeys = Object.keys(orari);
        menuUl.innerHTML = renderOrariTabs(categorieKeys, orari);
        return orari;
    }

    function changeSchedule(categoryKey) {
        const orari = config.discipline?.[selectedDiscipline]?.orari ?? {};
        const dati = orari[categoryKey];
        selectedCategory = categoryKey;
        if (!dati) {
            renderOrariContent(null, selectedDiscipline, disciplines, table, title, disciplineDescription, description, emptyMessage);
            return;
        }

        renderOrariContent(dati, selectedDiscipline, disciplines, table, title, disciplineDescription, description, emptyMessage);

        menuUl.querySelectorAll("button[data-category-key]").forEach((button) => {
            const isActive = button.dataset.categoryKey === categoryKey;
            button.closest("li")?.classList.toggle("off", !isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
    }

    menuUl.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-category-key]");
        if (!button) return;
        changeSchedule(button.dataset.categoryKey);
    });

    disciplineMenu.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-discipline]");
        if (!button) return;

        selectedDiscipline = button.dataset.discipline;
        disciplineMenu.querySelectorAll("button[data-discipline]").forEach((disciplineButton) => {
            const isActive = disciplineButton === button;
            disciplineButton.closest("li")?.classList.toggle("off", !isActive);
            disciplineButton.setAttribute("aria-selected", String(isActive));
        });

        const orari = renderAgeTabs();
        const availableCategories = Object.keys(orari);
        if (availableCategories.length > 0) {
            changeSchedule(availableCategories.includes(selectedCategory) ? selectedCategory : availableCategories[0]);
        } else {
            renderOrariContent(null, selectedDiscipline, disciplines, table, title, disciplineDescription, description, emptyMessage);
        }
    });

    const orari = renderAgeTabs();
    const availableCategories = Object.keys(orari);
    if (availableCategories.length > 0) changeSchedule(availableCategories[0]);
    else renderOrariContent(null, selectedDiscipline, disciplines, table, title, disciplineDescription, description, emptyMessage);
}

function initLuogo(config) {
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

async function loadIndex() {
    if (typeof window.initCarousel === "function" && document.querySelector('#carosello0')) {
        window.initCarousel(0);
    }
    initAnnouncements();

    if (!document.getElementById("orari-selector-menu") && !document.getElementById("luogo")) return;

    try {
        const config = await loadSiteConfig();
        if (document.getElementById("orari-selector-menu")) initTabellaOrari(config);
        if (document.getElementById("luogo")) initLuogo(config);
    } catch (error) {
        console.error("[Index] Impossibile caricare i dati del sito:", error);
    }
}

window.addEventListener("DOMContentLoaded", loadIndex);
