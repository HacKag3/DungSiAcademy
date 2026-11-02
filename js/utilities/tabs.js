// Tab condivisi da Corsi e Discipline e Approfondimenti.
// Il markup è compilato dal build: qui il JS mostra solo il pannello scelto.
// Ogni pulsante ha data-topic-index e data-topic-key; la chiave compare nell'indirizzo
// (pagina.html#chiave), così un tab si può aprire e condividere con un link diretto.

function changeTopic(index, { updateHash = true } = {}) {
    const panels = document.querySelectorAll(".topic");
    const buttons = document.querySelectorAll("#topicSelector button[data-topic-index]");

    if (!panels.length || !buttons.length) {
        console.warn("[Tabs] Nessun topic o pulsante trovato nel DOM.");
        return;
    }

    panels.forEach((panel, i) => {
        panel.hidden = i !== index;
    });

    buttons.forEach((button) => {
        const isActive = Number(button.dataset.topicIndex) === index;
        button.closest("li")?.classList.toggle("off", !isActive);
        button.setAttribute("aria-selected", String(isActive));
        if (isActive && updateHash && button.dataset.topicKey) {
            // replaceState: niente voci in più nella cronologia e nessuno scroll.
            history.replaceState(null, "", `#${button.dataset.topicKey}`);
        }
    });
}

function indexFromHash() {
    const key = decodeURIComponent(location.hash.slice(1));
    if (!key) return -1;
    const button = [...document.querySelectorAll("#topicSelector button[data-topic-key]")]
        .find((item) => item.dataset.topicKey === key);
    return button ? Number(button.dataset.topicIndex) : -1;
}

function openFromHash() {
    const index = indexFromHash();
    if (index >= 0) changeTopic(index, { updateHash: false });
}

function initTabs() {
    const selector = document.getElementById("topicSelector");
    // Con un solo pannello il build non genera la barra dei tab: non c'è nulla da commutare.
    if (!selector) return;

    selector.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-topic-index]");
        if (!button) return;
        changeTopic(Number(button.dataset.topicIndex));
    });

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
}

document.addEventListener("DOMContentLoaded", initTabs);
