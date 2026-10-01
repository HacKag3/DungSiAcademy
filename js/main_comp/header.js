// Header compilato dal build: qui restano solo le interazioni
// (burger, smart header, controllo fit della nav desktop).
import { initBurger } from "./burger.js";
import { initSmartHeader } from "../utilities/smartHeader.js";

const MOBILE_BREAKPOINT = 767;

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

const debounce = (fn, wait) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
};

// Quando manca spazio per il menu desktop:
//  1. si nascondono i loghi secondari (classe "no-extra-logos");
//  2. se ancora non basta si passa al burger ("nav-fallback"): logo principale
//     e titolo restano soli, centrati.
function checkDesktopFit(headerEl) {
    const titleEl = document.getElementById("titolo");
    const navEl = document.querySelector(".desktop-nav");
    if (!titleEl || !navEl) {
        console.warn("[Header] Nessun titolo o desktop-nav trovato nel DOM (build non aggiornato?).");
        return;
    }

    // Spazio tra la fine del titolo e il bordo interno destro dell'header (padding escluso).
    const MIN_GAP = 32;
    const navFits = () => {
        const paddingRight = parseFloat(getComputedStyle(headerEl).paddingRight) || 0;
        const free = headerEl.clientWidth - paddingRight - (titleEl.offsetLeft + titleEl.offsetWidth);
        return navEl.offsetWidth + MIN_GAP <= free;
    };

    headerEl.classList.remove("nav-fallback", "no-extra-logos");
    if (navFits()) return;

    headerEl.classList.add("no-extra-logos");
    if (navFits()) return;

    headerEl.classList.add("nav-fallback");
}

export async function loadHeader() {
    const headerEl = document.querySelector("header");
    if (!headerEl) {
        console.warn("[Header] Nessun elemento <header> trovato nel DOM.");
        return;
    }

    const burgerEl = document.getElementById("burger");
    const burgerLinks = document.getElementById("burger-links");
    if (!burgerEl || !burgerLinks) {
        console.warn("[Header] Burger non trovato nel DOM (build non aggiornato?).");
        return;
    }

    initBurger();
    requestAnimationFrame(() => {
        burgerLinks.classList.add("has-transition");
    });

    if (!isMobile()) {
        document.fonts.ready.then(() => {
            requestAnimationFrame(() => checkDesktopFit(headerEl));
        });
    }

    // La larghezza dei loghi è nota solo a immagine caricata: si ricontrolla.
    headerEl.querySelectorAll("#titolo img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", () => { if (!isMobile()) checkDesktopFit(headerEl); }, { once: true });
    });

    initSmartHeader(headerEl, burgerEl);

    window.addEventListener("resize", debounce(() => {
        if (!isMobile()) checkDesktopFit(headerEl);
    }, 80));
}
