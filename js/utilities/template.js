// I <template> HTML delle pagine vengono generati dal build (building/): il JS
// li clona e ne riempie i campi, senza scrivere markup nel codice.

/** Copia del contenuto di <template id="id"> (un DocumentFragment). */
export function clonaTemplate(id) {
    const template = document.getElementById(id);
    if (!(template instanceof HTMLTemplateElement)) {
        throw new Error(`Template "#${id}" non trovato nella pagina (build non aggiornato?).`);
    }
    return template.content.cloneNode(true);
}

/**
 * Scrive i valori negli elementi con data-campo="chiave" (come testo, mai come
 * HTML) e poi toglie l'attributo, che serve solo a indicare il campo.
 */
export function riempi(radice, valori) {
    for (const elemento of radice.querySelectorAll("[data-campo]")) {
        elemento.textContent = valori[elemento.dataset.campo] ?? "";
        elemento.removeAttribute("data-campo");
    }
    return radice;
}
