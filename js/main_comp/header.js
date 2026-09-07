// Header generato a runtime dai dati in /data (brand da settings.json,
// navigazione da #navigation-data). Modificando i JSON i contenuti cambiano
// senza rebuild.
import { loadSiteData, buildBrand } from "../data-loader.js";
import { genBurger, initBurger } from "./burger.js";
import { genNavBarLinks } from "../utilities/utils.js";

const MOBILE_BREAKPOINT = 767;

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

const debounce = (fn, wait) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
};


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

function generateHeader(brand) {
    return `
        <div id="titolo" class="nav-fallback">
            <a href="${brand.home}" aria-label="Torna alla homepage di ${brand.name}">
                <img
                    src="${brand.logo}"
                    alt="Logo ${brand.name}"
                    loading="eager"
                    height="128"
                    width="auto">
                <span class="header-brand-name">${brand.name}</span>
            </a>
        </div>

        ${genDesktopNav()}
    `;
}


export async function loadHeader() {
    const headerEl = document.querySelector("header");
    if (!headerEl) {
        console.warn("[Header] Nessun elemento <header> trovato nel DOM.");
        return;
    }

    const { settings } = await loadSiteData();
    const brand = buildBrand(settings);

    let burgerInitialized = false;

    function render() {
        // Il burger vive nel <body>, fuori dall'header: così può stare
        // sopra l'overlay a tutto schermo (z-index > header) e restare
        // cliccabile anche quando l'overlay oscura la pagina e l'header.
        // Il burger viene creato una sola volta (i suoi contenuti non cambiano
        // a runtime); solo l'header viene ricreato su resize. initBurger()
        // registra i listener una sola volta per evitare accumuli.
        if (!burgerInitialized) {
            document.body.insertAdjacentHTML("afterbegin", genBurger());
            initBurger();
            burgerInitialized = true;
        }

        headerEl.innerHTML = generateHeader(brand);

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

    const closeMenuCompletely = () => {
        // Chiude il menu e ripristina lo scroll: usato quando la modalità
        // mobile cambia (es. rotazione telefono) per evitare che il body
        // resti bloccato (menu-open) con il menu invisibile su desktop.
        // Simuliamo un click sull'overlay: questo chiama toggleMenu(false)
        // che aggiorna anche lo stato interno isMenuOpen, quindi il prossimo
        // click sull'icona riapre correttamente il menu.
        // Lo facciamo solo se il menu è effettivamente aperto, altrimenti
        // toggleMenu(false) chiamerebbe scrollLock.restore() e scrollerebbe
        // in cima alla pagina.
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
