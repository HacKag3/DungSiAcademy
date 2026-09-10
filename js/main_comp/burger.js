// Markup burger compilato dal build: qui resta solo il comportamento del menu.
import { smartHeaderMenuOpened, smartHeaderMenuClosed } from "../utilities/smartHeader.js";

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

}
