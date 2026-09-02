import { INTRO, TOPICS } from "../../topics.js";

function renderIntro(intro) {
    const container = document.getElementById("descrizioe");
    if (!container) {
        console.warn("[WhoWeAre] #descrizioe non trovato: intro non generata.");
        return;
    }
    container.innerHTML = intro.text;
}

function renderTabButton(topic, index) {
    return `
        <li>
            <button
              type="button"
              class="topic-btn"
              role="tab"
              aria-selected="${index === 0}"
              aria-controls="topic-${topic.key}"
              id="topic-tab-${index}"
              data-topic-index="${index}">
                ${topic.tabLabel}
            </button>
        </li>
    `;
}

function renderActivity(activity) {
    return `
        <div class="activity">
            <h3 class="activity-title">${activity.title}</h3>
            <section id="carosello${activity.caroselloNum}" class="activity-media slideshow"><!-- auto-generated --></section>
            <div class="activity-text">${activity.text}</div>
        </div>
    `;
}

function renderTopicPanel(topic, index) {
    const introCarosello = topic.introCaroselloNum
        ? `<section id="carosello${topic.introCaroselloNum}" class="activity-media slideshow"><!-- auto-generated --></section>`
        : "";

    return `
        <div class="content topic" id="topic-${topic.key}" role="tabpanel" aria-labelledby="topic-tab-${index}">
            <h2>${topic.heading}</h2>
            <div class="topic-intro">${topic.intro}</div>
            ${introCarosello}
            ${topic.introOutro ? `<div class="topic-intro-outro">${topic.introOutro}</div>` : ""}
            <div class="activities-list">
                ${topic.activities.map(renderActivity).join("")}
            </div>
        </div>
    `;
}

function checkForDuplicateCaroselloNums(topics) {
    const seen = new Map(); // caroselloNum -> descrizione di dove è usato

    const check = (num, where) => {
        if (num == null) return;
        if (seen.has(num)) {
            console.error(
                `[WhoWeAre] caroselloNum ${num} duplicato: usato sia in "${seen.get(num)}" sia in "${where}". ` +
                `Correggi whoweareContent.js assegnando un numero univoco.`
            );
        }
        seen.set(num, where);
    };

    topics.forEach((topic) => {
        check(topic.introCaroselloNum, `${topic.key} (intro)`);
        topic.activities.forEach((activity) => check(activity.caroselloNum, `${topic.key} > ${activity.key}`));
    });
}

function renderContent(topics) {
    checkForDuplicateCaroselloNums(topics);

    const selector = document.getElementById("topicSelector");
    const tabList = selector?.querySelector("ul");
    const container = document.getElementById("topicsContainer");

    if (!tabList || !container) {
        console.warn("[WhoWeAre] Contenitori #topicSelector/#topicsContainer non trovati: contenuto non generato.");
        return;
    }

    tabList.innerHTML = topics.map(renderTabButton).join("");
    container.innerHTML = topics.map(renderTopicPanel).join("");
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

    changeTopic(0);
}

renderIntro(INTRO);
renderContent(TOPICS);

document.addEventListener("DOMContentLoaded", initTopicSwitcher);