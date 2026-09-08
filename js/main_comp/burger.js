import { genNavBarLinks } from "../utilities/utils.js";
import { smartHeaderMenuOpened, smartHeaderMenuClosed } from "../utilities/smartHeader.js";


// Blocco dello scroll di pagina quando il menu è aperto.
// Usa position:fixed sul body per evitare il salto in cima alla pagina
// e lo scroll-lock via overflow come fallback per browser meno recenti.
const scrollLock = (() => {
    let scrollY = 0;

    return {
        save() {
            scrollY = window.scrollY;
            document.body.classList.add("menu-open");
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.position = "fixed";
        },
        restore() {
            document.body.classList.remove("menu-open");
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.position = "";
            window.scrollTo(0, scrollY);
        }
    };
})();


export function genBurger() {
    return `
        <div id="burger">
            <button
              class="burger-icon"
              aria-label="Menu"
              aria-expanded="false"
              aria-controls="burger-links">
                <svg
                  class="burger-svg"
                  viewBox="0 0 24 24">
                    <rect class="burger-line line1" x="0" y="2"  width="24" height="4" rx="2"></rect>
                    <rect class="burger-line line2" x="0" y="10" width="24" height="4" rx="2"></rect>
                    <rect class="burger-line line3" x="0" y="18" width="24" height="4" rx="2"></rect>
                </svg>
            </button>
        </div>
        <ul id="burger-links" class="burger-nav links-off" role="list" aria-label="Menu di navigazione">
            ${genNavBarLinks().map(({href, name}) => `
            <li class="burger-nav__item">
                <a href="${href}" class="burger-nav__link">${name}</a>
            </li>`).join("")}
        </ul>`;
}


// L'overlay vive nel <body>, fuori dall'header: così resta a tutto schermo
// anche quando l'header ha una transform (nav-hidden/nav-visible), che
// altrimenti diventerebbe containing block per i figli position:fixed.
// Intercetta i click sulla pagina e chiude il menu senza farli passare
// agli elementi sottostanti.
function ensureOverlay() {
    document.getElementById("burger-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "burger-overlay";
    overlay.className = "burger-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    return overlay;
}

export function initBurger() {
    const burgerEl   = document.getElementById("burger");
    const burgerBtn  = document.querySelector(".burger-icon");
    const burgerNav  = document.getElementById("burger-links");
    const headerEl   = document.querySelector("header");
    if (!burgerBtn || !burgerNav || !headerEl || !burgerEl) {
        console.warn("[Burger] Nessun burger o header trovato del DOM.");
        return;
    }

    const overlay = ensureOverlay();

    let isMenuOpen = false;

    const toggleMenu = (open = !isMenuOpen) => {
        isMenuOpen = open;
        burgerBtn.classList.toggle("active", isMenuOpen);
        burgerNav.classList.toggle("links-on", isMenuOpen);
        burgerNav.classList.toggle("links-off", !isMenuOpen);
        overlay.classList.toggle("active", isMenuOpen);
        burgerBtn.setAttribute("aria-expanded", isMenuOpen);

        // Blocca lo scroll della pagina quando il menu è aperto: il menu
        // resta utilizzabile per intero e non si "interrompe" scorrendo.
        // Header/burger seguono via smartHeader: visibili a menu aperto,
        // riallineati alla posizione di scroll dopo la chiusura.
        if (isMenuOpen) {
            scrollLock.save();
            smartHeaderMenuOpened();
        } else {
            scrollLock.restore();
            smartHeaderMenuClosed();
        }
    }

    burgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Click sull'overlay: chiude il menu SENZA interagire con la pagina
    // (l'evento colpisce l'overlay, mai gli elementi sottostanti).
    overlay.addEventListener("click", () => toggleMenu(false));
    document.addEventListener("click", (e) => {
        if (isMenuOpen && !burgerEl.contains(e.target) && !burgerNav.contains(e.target))
            toggleMenu(false);
    });
    document.addEventListener("keydown", (e) => { 
        if (e.key === "Escape" && isMenuOpen) { 
            toggleMenu(false); 
            burgerBtn.focus(); 
        }
    });

    // Nota: la logica di comparsa/scomparsa del burger allo scroll non vive
    // qui: e' gestita da smartHeader.js insieme all'header, con una sola
    // macchina a stati condivisa (initSmartHeader e' chiamato da header.js).
}