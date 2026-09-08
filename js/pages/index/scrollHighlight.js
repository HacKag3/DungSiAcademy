const ANCHOR_SELECTOR = 'a[href^="#"]';
const HIGHLIGHT_CLASS = "highlight-pulse";
const SCROLL_OFFSET = 80;
const SCROLL_ANIM_MS = 800;

let currentTarget = null;

function findTitleElement(hash) {
    const targetId = hash.substring(1);
    if (!targetId) return null;

    const target = document.getElementById(targetId);
    if (!target) return null;

    return target.querySelector(".lb_title") || target;
}

function clearHighlight(el) {
    if (!el) return;
    el.classList.remove(HIGHLIGHT_CLASS);
}

function applyHighlight(titleEl) {
    clearHighlight(currentTarget);
    currentTarget = titleEl;
    titleEl.classList.add(HIGHLIGHT_CLASS);
    setTimeout(() => clearHighlight(titleEl), 1500);
}

function highlightSection(hash) {
    if (!hash) {
        clearHighlight(currentTarget);
        currentTarget = null;
        return;
    }

    const titleEl = findTitleElement(hash);
    if (titleEl) applyHighlight(titleEl);
}

function handleHashChange() {
    highlightSection(window.location.hash);
}

function scrollToHash(hash) {
    const targetId = hash.substring(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
}

function onLinkClick(e) {
    const link = e.target.closest(ANCHOR_SELECTOR);
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#" || href.length < 2) return;

    const target = document.getElementById(href.substring(1));
    if (!target) return;

        e.preventDefault();
    scrollToHash(href);

    setTimeout(() => highlightSection(href), SCROLL_ANIM_MS);

    history.pushState(null, "", href);
}

export function initScrollHighlight() {
    document.addEventListener("click", onLinkClick, true);
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
}

