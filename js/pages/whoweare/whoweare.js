// Contenuti Chi Siamo compilati dal build: qui il JS commuta solo i tab.
function changeTopic(topicIndex) {
    const panels = document.querySelectorAll(".topic");
    const buttons = document.querySelectorAll("#topicSelector button[data-topic-index]");

    if (!panels.length || !buttons.length) {
        console.warn("[WhoWeAre] Nessun topic o pulsante trovato nel DOM.");
        return;
    }

    panels.forEach((panel, i) => {
        panel.hidden = i !== topicIndex;
    });

    buttons.forEach((button) => {
        const isActive = Number(button.dataset.topicIndex) === topicIndex;
        button.closest("li")?.classList.toggle("off", !isActive);
        button.setAttribute("aria-selected", String(isActive));
    });
}

function initTopicSwitcher() {
    const selector = document.getElementById("topicSelector");
    if (!selector) {
        console.warn("[WhoWeAre] #topicSelector non trovato nel DOM.");
        return;
    }

    selector.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-topic-index]");
        if (!button) return;
        changeTopic(Number(button.dataset.topicIndex));
    });
}

document.addEventListener("DOMContentLoaded", initTopicSwitcher);
