import { clonaTemplate, riempi } from "../../utilities/template.js";

// Orari letti a runtime da contenuti/corsi.json (modificabili anche su main,
// senza rebuild). Il markup è nei <template> di building/pages/index/orari.html:
// qui si costruiscono tutti gli stati (discipline e fasce), poi si commuta
// solo la visibilità in base ai tab selezionati.
const CORSI_URL = "contenuti/corsi.json";

async function caricaCorsi() {
    const res = await fetch(CORSI_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${CORSI_URL}`);
    return res.json();
}

const elemento = (idTemplate, valori = {}) => riempi(clonaTemplate(idTemplate), valori).firstElementChild;

// Tab selezionabile (disciplina o fascia): la prima voce parte attiva.
function impostaTab(li, attivo) {
    li.className = attivo ? "" : "off";
    li.querySelector("button").setAttribute("aria-selected", String(attivo));
}

function creaFascia(disciplina, fascia, attiva) {
    const pannello = elemento("tpl-orari-fascia", { ...fascia, disciplina: disciplina.titolo });
    pannello.dataset.category = fascia.key;
    pannello.id = `schedule-${disciplina.key}-${fascia.key}`;
    pannello.hidden = !attiva;

    const giorni = fascia.giorni ?? [];
    if (giorni.length > 0) {
        pannello.querySelector("tbody").append(...giorni.map((giorno) => elemento("tpl-orari-riga", giorno)));
        pannello.querySelector(".schedule-empty").remove();
    } else {
        pannello.querySelector(".schedule-table").remove();
    }
    return pannello;
}

function costruisciOrari(contenitore, corsi) {
    const layout = elemento("tpl-orari");
    const menuDiscipline = layout.querySelector("#disciplina-selector-menu");
    const pannelloDiscipline = layout.querySelector(".discipline-panel");
    const selettoreFasce = layout.querySelector(".age-selector .selector");
    const contenuto = layout.querySelector(".schedule-results .content");

    corsi.forEach((disciplina, i) => {
        const attiva = i === 0;

        const tab = elemento("tpl-orari-disciplina", disciplina);
        impostaTab(tab, attiva);
        tab.querySelector("button").dataset.discipline = disciplina.key;
        tab.querySelector("i").className = disciplina.icona || "fas fa-circle";
        menuDiscipline.append(tab);

        const descrizione = elemento("tpl-orari-descrizione", disciplina);
        descrizione.dataset.discipline = disciplina.key;
        descrizione.hidden = !attiva;
        pannelloDiscipline.append(descrizione);

        const menuFasce = elemento("tpl-orari-menu-fasce");
        const stato = elemento("tpl-orari-stato");
        menuFasce.dataset.discipline = stato.dataset.discipline = disciplina.key;
        menuFasce.hidden = stato.hidden = !attiva;

        (disciplina.fasce ?? []).forEach((fascia, j) => {
            const tabFascia = elemento("tpl-orari-fascia-tab", fascia);
            impostaTab(tabFascia, j === 0);
            const bottone = tabFascia.querySelector("button");
            bottone.dataset.categoryKey = fascia.key;
            bottone.setAttribute("aria-controls", `schedule-${disciplina.key}-${fascia.key}`);
            menuFasce.append(tabFascia);

            stato.append(creaFascia(disciplina, fascia, j === 0));
        });

        selettoreFasce.append(menuFasce);
        contenuto.append(stato);
    });

    contenitore.replaceChildren(layout);
}

function attivaSelettori() {
    const disciplineMenu = document.getElementById("disciplina-selector-menu");
    const ageSelector = document.querySelector("#orari .age-selector");
    if (!disciplineMenu || !ageSelector) return;

    const states = document.querySelectorAll("#orari .orari-state");
    const descriptions = document.querySelectorAll("#orari .discipline-description[data-discipline]");
    const ageMenus = document.querySelectorAll("#orari .orari-selector-menu");
    const disciplineButtons = [...disciplineMenu.querySelectorAll("button[data-discipline]")];

    function syncAgeMenus(disciplineKey, categoryKey) {
        ageMenus.forEach(menu => {
            const show = menu.dataset.discipline === disciplineKey;
            menu.hidden = !show;
            if (show) {
                menu.querySelectorAll("button[data-category-key]").forEach((button) => {
                    const isActive = button.dataset.categoryKey === categoryKey;
                    button.closest("li")?.classList.toggle("off", !isActive);
                    button.setAttribute("aria-selected", String(isActive));
                });
            }
        });
    }

    function setCategory(disciplineKey, categoryKey) {
        const activeState = [...states].find(s => !s.hidden && s.dataset.discipline === disciplineKey);
        activeState?.querySelectorAll(".category-state").forEach(cat => {
            cat.hidden = cat.dataset.category !== categoryKey;
        });
        syncAgeMenus(disciplineKey, categoryKey);
    }

    function setDiscipline(key) {
        disciplineButtons.forEach(button => {
            const isActive = button.dataset.discipline === key;
            button.closest("li")?.classList.toggle("off", !isActive);
            button.setAttribute("aria-selected", String(isActive));
        });
        descriptions.forEach(d => { d.hidden = d.dataset.discipline !== key; });
        states.forEach(s => { s.hidden = s.dataset.discipline !== key; });

        const firstCategory = [...states]
            .find(s => !s.hidden && s.dataset.discipline === key)
            ?.querySelector(".category-state:not([hidden])")
            ?.dataset.category;
        syncAgeMenus(key, firstCategory);
    }

    disciplineMenu.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-discipline]");
        if (button) setDiscipline(button.dataset.discipline);
    });

    ageSelector.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-category-key]");
        if (!button) return;
        const menu = button.closest(".orari-selector-menu");
        if (menu) setCategory(menu.dataset.discipline, button.dataset.categoryKey);
    });
}

async function initOrari() {
    const contenitore = document.querySelector("#orari .orari-contenuto");
    if (!contenitore) return;

    try {
        const corsi = (await caricaCorsi()).filter((disciplina) => disciplina?.key && disciplina?.titolo);
        if (corsi.length === 0) throw new Error("nessuna disciplina in corsi.json");
        costruisciOrari(contenitore, corsi);
        attivaSelettori();
    } catch (error) {
        console.error("[Orari] Sezione orari non disponibile:", error);
        document.querySelector("#orari .orari-errore").hidden = false;
    }
}

export { initOrari };
