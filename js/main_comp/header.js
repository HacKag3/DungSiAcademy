import { loadData, buildBrand } from "../data-loader.js";
import { genBurger, initBurger } from "./burger.js";
import { genNavBarLinks } from "../utilities/utils.js";
import { initSmartHeader } from "../utilities/smartHeader.js";

const MOBILE_BREAKPOINT = 767;

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

const debounce = (fn, wait) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
};

function checkDesktopFit(headerEl) {
    const titleEl = document.getElementById("titolo");
    const navEl   = document.querySelector(".desktop-nav");
    if (!titleEl || !navEl) {
        console.warn("[Header] Nessun titolo o desktop-nav trovato del DOM.");
        return;
    }

    headerEl.classList.remove("nav-fallback");

    const spaceAvailable = headerEl.offsetWidth
        - (titleEl.offsetLeft + titleEl.offsetWidth)
        - 20;

    headerEl.classList.toggle("nav-fallback", navEl.offsetWidth > spaceAvailable);
}

function genDesktopNav(ui) {
    return `
        <nav class="desktop-nav" aria-label="${ui.navMainLabel}">
            ${genNavBarLinks().map(({ href, name }) =>
            `<a href="${href}" class="nav__link">
                <span>${name}</span>
            </a>`).join("")}
        </nav>
    `;
}

function generateHeader(brand, ui) {
    const backToHomeAria = ui.backToHomeAria.replaceAll("{brand}", brand.name);
    return `
        <div id="titolo" class="nav-fallback">
            <a href="${brand.home}" aria-label="${backToHomeAria}">
                <img
                    src="${brand.logo}"
                    alt="Logo ${brand.name}"
                    loading="eager"
                    height="128"
                    width="auto">
                <span class="header-brand-name">${brand.name}</span>
            </a>
        </div>

        ${genDesktopNav(ui)}
    `;
}

export async function loadHeader() {
    const headerEl = document.querySelector("header");
    if (!headerEl) {
        console.warn("[Header] Nessun elemento <header> trovato nel DOM.");
        return;
    }

    const fallbackBrand = {
        name: headerEl.dataset.brand || "",
        logo: headerEl.dataset.logo || "",
        home: headerEl.dataset.home || "./index.html"
    };

    let brand, ui;
    try {
        const settings = await loadData("settings");
        brand = buildBrand(settings);
        ui = settings.ui ?? {};
    } catch (err) {
        console.warn("[Header] Impossibile caricare settings.json, usando fallback inline:", err);
        brand = fallbackBrand;
        ui = {
            navMainLabel: "Navigazione principale",
            backToHomeAria: "Torna alla home"
        };
    }

    let burgerInitialized = false;

    function render() {
        if (!burgerInitialized) {
            document.body.insertAdjacentHTML("afterbegin", genBurger());
            initBurger();
            burgerInitialized = true;
        }

        headerEl.innerHTML = generateHeader(brand, ui);

        requestAnimationFrame(() => {
            document.getElementById("burger-links")?.classList.add("has-transition");
        });

        if (!isMobile()) {
            document.fonts.ready.then(() => {
                requestAnimationFrame(() => checkDesktopFit(headerEl));
            });
        }
    }

    render();
    initSmartHeader(headerEl, document.getElementById("burger"));

    let wasMobile = isMobile();

    const closeMenuCompletely = () => {
        const icon = document.querySelector(".burger-icon");
        if (icon?.getAttribute("aria-expanded") === "true") {
            const overlay = document.querySelector(".burger-overlay");
            overlay?.click();
        }
    };

    const onResize = debounce(() => {
        const nowMobile = isMobile();

        if (nowMobile !== wasMobile) {
            wasMobile = nowMobile;
            closeMenuCompletely();
            render();
        } else if (!nowMobile) {
            checkDesktopFit(headerEl);
        }
    }, 80);

    window.addEventListener("resize", onResize);
}
