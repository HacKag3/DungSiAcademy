import { CONFIG } from "../config.js";
import { genBurger, initBurger } from "./burger.js";
import { getCurrentPage, genNavBarLinks } from "../utilities/utils.js";

const MOBILE_BREAKPOINT = 767;

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

const debounce = (fn, wait) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
};


const SCROLL_DISTANCE_THRESHOLD = 8;

function initScrollBehavior(headerEl) {
    let lastScrollY = window.scrollY;
    let accumulated = 0;
    let isHidden = false;
    let ticking = false;
 
    const update = () => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const delta = currentScrollY - lastScrollY;
        const headerHeight = headerEl.offsetHeight;
 
        if (currentScrollY <= headerHeight/3) {
            headerEl.classList.remove("nav-hidden");
            headerEl.classList.add("nav-visible");
            isHidden = false;
            accumulated = 0;
        } else if (delta > 0) {
            // scroll verso il basso
            accumulated = accumulated > 0 ? accumulated + delta : delta;
            if (!isHidden && accumulated > 1) {
                headerEl.classList.add("nav-hidden");
                headerEl.classList.remove("nav-visible");
                isHidden = true;
            }
        } else if (delta < 0) {
            // scroll verso l'alto
            accumulated = accumulated < 0 ? accumulated + delta : delta;
            if (isHidden && accumulated < -1) {
                headerEl.classList.remove("nav-hidden");
                headerEl.classList.add("nav-visible");
                isHidden = false;
            }
        }
 
        lastScrollY = currentScrollY;
        ticking = false;
    };
 
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}


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
        - 20; // margine di sicurezza

    headerEl.classList.toggle("nav-fallback", navEl.offsetWidth > spaceAvailable);
}


function genDesktopNav() {
    return `
        <nav class="desktop-nav" aria-label="Navigazione principale">
            ${genNavBarLinks().map(({ href, name }) =>
            `<a href="${href}" class="nav__link">
                <span>${name}</span>
            </a>`).join("")}
        </nav>
    `;
}

const generateHeader = () => `
    ${genBurger()}

    <div id="titolo" class="nav-fallback">
        <a href="${CONFIG.brand.home}" aria-label="Torna alla homepage di ${CONFIG.brand.name}">
            <img
                src="${CONFIG.brand.logo}"
                alt="Logo ${CONFIG.brand.name}"
                loading="eager"
                height="128"
                width="auto">
            <span class="header-brand-name">${CONFIG.brand.name}</span>
        </a>
    </div>

    ${genDesktopNav()}
`;


export function loadHeader() {
    const headerEl = document.querySelector("header");
    if (!headerEl) {
        console.warn("[Header] Nessun elemento <header> trovato nel DOM.");
        return;
    }

    function render() {
        headerEl.innerHTML = generateHeader();
        initBurger();

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
    initScrollBehavior(headerEl);

    let wasMobile = isMobile();

    const onResize = debounce(() => {
        const nowMobile = isMobile();

        if (nowMobile !== wasMobile) {
            wasMobile = nowMobile;
            render();
        } else if (!nowMobile) {
            checkDesktopFit(headerEl);
        }
    }, 80);

    window.addEventListener("resize", onResize);
}