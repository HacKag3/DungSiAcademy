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

function checkDesktopFit(headerEl) {
    const titleEl = document.getElementById("titolo");
    const navEl = document.querySelector(".desktop-nav");
    if (!titleEl || !navEl) {
        console.warn("[Header] Nessun titolo o desktop-nav trovato nel DOM (build non aggiornato?).");
        return;
    }

    headerEl.classList.remove("nav-fallback");

    const spaceAvailable = headerEl.offsetWidth
        - (titleEl.offsetLeft + titleEl.offsetWidth)
        - 20;

    headerEl.classList.toggle("nav-fallback", navEl.offsetWidth > spaceAvailable);
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

    initSmartHeader(headerEl, burgerEl);

    window.addEventListener("resize", debounce(() => {
        if (!isMobile()) checkDesktopFit(headerEl);
    }, 80));
}
