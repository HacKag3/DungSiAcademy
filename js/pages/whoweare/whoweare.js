import { loadData } from "../../data-loader.js";
import { initAllCarousels } from "../../utilities/carosello.js";

function renderActivity(activity) {
    return `<div class="activity">
        <h3 class="activity-title">${activity.title}</h3>
        <section id="carosello${activity.carosello}" class="activity-media slideshow"></section>
        <div class="activity-text">${activity.text}</div>
    </div>`;
}

function renderTopic(disciplina, index) {
    const introCarousel = disciplina.carosello
        ? `<section id="carosello${disciplina.carosello}" class="activity-media slideshow"></section>`
        : "";

    return `<div class="content topic" id="topic-${disciplina.key}" role="tabpanel" aria-labelledby="topic-tab-${index}"${index ? " hidden" : ""}>
        <h2>${disciplina.heading}</h2>
        <div class="topic-intro">${disciplina.intro}</div>
        ${introCarousel}
        ${disciplina.introOutro ? `<div class="topic-intro-outro">${disciplina.introOutro}</div>` : ""}
        <div class="activities-list">${disciplina.activities.map(renderActivity).join("")}</div>
    </div>`;
}

function renderWhoWeAreContent(intro, discipline) {
    const tabs = discipline.map((disciplina, index) => `<li class="${index ? "off" : ""}">
        <button type="button" class="topic-btn" role="tab" aria-selected="${index === 0}" aria-controls="topic-${disciplina.key}" id="topic-tab-${index}" data-topic-index="${index}">${disciplina.tabLabel}</button>
    </li>`).join("");

    return `<div id="descrizione">${intro.text}</div>
    <div id="topicSelector" role="tablist" aria-label="Seleziona argomento"><ul>${tabs}</ul></div>
    <div id="topicsContainer">${discipline.map(renderTopic).join("")}</div>`;
}

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

async function loadWhoWeAre() {
    const root = document.getElementById("page-content");
    if (!root) return;

    const whoweare = await loadData("whoweare");
    root.innerHTML = renderWhoWeAreContent(whoweare.intro, whoweare.disciplina);

    initTopicSwitcher();

    initAllCarousels();
}

document.addEventListener("DOMContentLoaded", () => {
    loadWhoWeAre().catch((error) => console.error("[WhoWeAre] Impossibile caricare i contenuti:", error));
});
