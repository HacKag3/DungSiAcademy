// Orari compilati dal build: tutti gli stati (discipline/fasce) sono già
// nell'HTML; qui il JS commuta solo la visibilità in base ai tab selezionati.
function initOrari() {
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
            ?.dataset.category ?? "adulti";
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

export { initOrari };
