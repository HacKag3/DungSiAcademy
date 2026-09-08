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
            <li class="${index === 0 ? '' : 'off'}">
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

export function initOrari(config) {
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

    selectionKicker.textContent = ORARI_UI.kickerSelezione;
    resultsKicker.textContent = ORARI_UI.kickerRisultati;
    disciplineLabel.textContent = ORARI_UI.labelDisciplina;
    ageLabel.textContent = ORARI_UI.labelFasciaEta;
    emptyMessage.textContent = ORARI_UI.nessunCorso;
    disciplineMenu.setAttribute("aria-label", ORARI_UI.ariaDisciplina);
    menuUl.setAttribute("aria-label", ORARI_UI.ariaFasciaEta);

    const disciplines = config.discipline ?? {};
    const disciplineKeys = Object.keys(disciplines);
    if (disciplineKeys.length === 0) return;

    let selectedDiscipline = disciplineKeys[0];
    let selectedCategory = "";

    function renderAgeTabs() {
        const orari = disciplines[selectedDiscipline]?.orari ?? {};
        menuUl.innerHTML = renderOrariTabs(Object.keys(orari), orari);
        return orari;
    }

    function showSchedule(dati) {
        title.textContent = disciplines[selectedDiscipline]?.titolo || selectedDiscipline;
        disciplineDescription.textContent = disciplines[selectedDiscipline]?.descrizione || "";

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

    function changeSchedule(categoryKey) {
        const orari = disciplines[selectedDiscipline]?.orari ?? {};
        selectedCategory = categoryKey;
        showSchedule(orari[categoryKey]);

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

        const categorie = Object.keys(renderAgeTabs());
        if (categorie.length > 0) {
            changeSchedule(categorie.includes(selectedCategory) ? selectedCategory : categorie[0]);
        } else {
            showSchedule(null);
        }
    });

    disciplineMenu.innerHTML = renderDisciplineTabs(disciplineKeys, disciplines);

    const categorie = Object.keys(renderAgeTabs());
    if (categorie.length > 0) changeSchedule(categorie[0]);
    else showSchedule(null);
}
