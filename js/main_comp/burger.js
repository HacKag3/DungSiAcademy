import { CONFIG } from "../config.js";
import { getCurrentPage, genNavBarLinks } from "../utilities/utils.js";


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

            <ul id="burger-links" class="burger-nav links-off" role="list" aria-label="Menu di navigazione">
                ${genNavBarLinks().map(({href, name}) => `
                <li class="burger-nav__item">
                    <a href="${href}" class="burger-nav__link">${name}</a>
                </li>`).join("")}
            </ul>
        </div>`;
}


export function initBurger() {
    const burgerBtn  = document.querySelector(".burger-icon");
    const burgerNav  = document.getElementById("burger-links");
    const headerEl   = document.querySelector("header");
    if (!burgerBtn || !burgerNav || !headerEl) {
        console.warn("[Burger] Nessun burger o header trovato del DOM.");
        return;
    }

    let isMenuOpen = false;

    const toggleMenu = (open = !isMenuOpen) => {
        isMenuOpen = open;
        burgerBtn.classList.toggle("active", isMenuOpen);
        burgerNav.classList.toggle("links-on", isMenuOpen);
        burgerNav.classList.toggle("links-off", !isMenuOpen);
        burgerBtn.setAttribute("aria-expanded", isMenuOpen);
    }

    burgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    document.addEventListener("click", (e) => { 
        if (isMenuOpen && !document.getElementById("burger").contains(e.target)) 
            toggleMenu(false); 
    });
    document.addEventListener("keydown", (e) => { 
        if (e.key === "Escape" && isMenuOpen) { 
            toggleMenu(false); 
            burgerBtn.focus(); 
        }
    });
}