import { clonaTemplate, riempi } from "../../utilities/template.js";
import { creaRecapiti } from "./recapiti.js";

// Team letto a runtime da contenuti/personale.json (modificabile anche su
// main, senza rebuild). Il markup è nei <template> di building/pages/contacts/team.html.
const PERSONALE_URL = "contenuti/personale.json";

async function caricaPersonale() {
    const res = await fetch(PERSONALE_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${PERSONALE_URL}`);
    return res.json();
}

function impostaFoto(img, contenitore, persona) {
    const segnaposto = persona.sesso === "F" ? img.dataset.segnapostoF : img.dataset.segnapostoM;
    const src = persona.foto?.src?.trim();
    delete img.dataset.segnapostoM;
    delete img.dataset.segnapostoF;

    img.src = src || segnaposto;
    img.alt = persona.foto?.alt ?? persona.nomeCompleto;
    contenitore.classList.toggle("cutout", Boolean(persona.foto?.cutout));
    contenitore.classList.toggle("placeholder", !src);
    img.addEventListener("error", () => {
        img.src = segnaposto;
        contenitore.classList.add("placeholder");
    }, { once: true });
}

function creaPersona(persona, indice) {
    const dati = { ...persona, nomeCompleto: `${persona.nome} ${persona.cognome}` };
    const scheda = riempi(clonaTemplate("tpl-persona"), dati);
    const riga = scheda.querySelector(".person-row");
    riga.classList.toggle("reversed", indice % 2 === 1);

    impostaFoto(scheda.querySelector(".person-photo img"), scheda.querySelector(".person-photo"), dati);

    // altriRuoli: lista di testi (un valore scritto male su main viene ignorato).
    const ruoli = scheda.querySelector(".person-other-roles");
    const altriRuoli = Array.isArray(persona.altriRuoli) ? persona.altriRuoli : [];
    for (const ruolo of altriRuoli.filter((voce) => typeof voce === "string" && voce.trim())) {
        const voce = clonaTemplate("tpl-persona-ruolo").querySelector("li");
        voce.textContent = ruolo;
        ruoli.append(voce);
    }

    scheda.querySelector(".person-contacts").append(...creaRecapiti(persona, persona.nome));

    // Gli elementi facoltativi senza contenuto non restano nella pagina.
    for (const elemento of scheda.querySelectorAll(".person-title, .person-role, .person-other-roles, .person-desc, .person-contacts")) {
        if (!elemento.textContent.trim()) elemento.remove();
    }
    return scheda;
}

export async function initTeam() {
    const lista = document.querySelector("#team .team-list");
    if (!lista) return;

    const persone = (await caricaPersonale()).filter((persona) => persona?.nome && persona?.cognome);
    if (persone.length === 0) {
        document.getElementById("team").hidden = true;
        return;
    }
    lista.replaceChildren(...persone.map(creaPersona));
}
