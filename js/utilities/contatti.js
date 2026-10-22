// Contatti utili letti a runtime da contenuti/contatti.json (modificabile anche
// su main, senza rebuild). Il file viene scaricato una sola volta per pagina,
// anche se lo usano più moduli (footer, privacy, pagina Contatti).
const CONTATTI_URL = "contenuti/contatti.json";

let contattiPromise = null;

export function caricaContatti() {
    contattiPromise ??= fetch(CONTATTI_URL, { cache: "no-cache" }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${CONTATTI_URL}`);
        return res.json();
    });
    return contattiPromise;
}
