const ANCHOR_SELECTOR = 'a[href^="#"]';
const HIGHLIGHT_CLASS = "highlight-section";
const HIGHLIGHT_MS = 1500;
const SCROLL_OFFSET = 80;
const SCROLL_ANIM_MS = 800;

// Sezione evidenziata in corso.
let current = null;
let clearTimer = null;

function clearHighlight() {
    if (!current) return;
    current.classList.remove(HIGHLIGHT_CLASS);
    current = null;
    clearTimeout(clearTimer);
}

function highlightSection(hash) {
    clearHighlight();
    const section = hash && hash.length > 1 ? document.getElementById(hash.substring(1)) : null;
    if (!section) return;

    // Rilegge il layout per far ripartire l'animazione anche sulla stessa sezione.
    void section.offsetWidth;
    section.classList.add(HIGHLIGHT_CLASS);
    current = section;
    clearTimer = setTimeout(clearHighlight, HIGHLIGHT_MS);
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

