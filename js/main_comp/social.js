import { clonaTemplate } from "../utilities/template.js";

// Social del footer letti a runtime da contenuti/social.json (modificabile anche
// su main, senza rebuild). Il markup è in building/components/footer/social.html.
const SOCIAL_URL = "contenuti/social.json";

async function caricaSocial() {
    const res = await fetch(SOCIAL_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${SOCIAL_URL}`);
    return res.json();
}

// Solo indirizzi web: una voce scritta male su main non diventa un link pericoloso.
const urlValido = (url) => /^https?:\/\//i.test(String(url ?? "").trim());

function creaSocial({ name, url, icon, color }) {
    const voce = clonaTemplate("tpl-social").querySelector("li");
    const link = voce.querySelector("a");
    if (color) voce.style.setProperty("--hover-color", color);
    link.href = url.trim();
    link.setAttribute("aria-label", `${link.dataset.aria} ${name}`);
    link.removeAttribute("data-aria");
    link.dataset.platform = String(name).toLowerCase();
    link.querySelector("i").className = icon;
    return voce;
}

export async function initSocial() {
    const nav = document.querySelector(".footer-social");
    if (!nav) return;

    const social = await caricaSocial();
    const attivi = (Array.isArray(social) ? social : [])
        .filter((voce) => voce?.name && voce?.icon && urlValido(voce.url));
    if (attivi.length === 0) return;

    nav.querySelector(".footer-social-icons").replaceChildren(...attivi.map(creaSocial));
    nav.hidden = false;
}
