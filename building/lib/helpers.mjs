/** Funzioni di supporto condivise dai modelli (.mjs) di componenti e pagine. */
// La regola dei telefoni è la stessa del sito: il build usa il modulo del runtime.
import { telefono as telefonoSito } from "../../js/utilities/telefono.js";

const PLACEHOLDER = /\.\.\.|\[DA (?:CONFERMARE|DEFINIRE)|email@email/i;

/**
 * Telefono valido (almeno 8 cifre), altrimenti null:
 *  - testo: da mostrare, senza il prefisso internazionale italiano (+39 / 0039);
 *  - href: per i link tel:, con il prefisso;
 *  - completo: il numero come scritto nei dati (per i dati strutturati).
 */
export function telefono(valore) {
    const numero = telefonoSito(valore);
    return numero && { ...numero, completo: String(valore).trim() };
}

/** Recapiti di una persona o di un contatto ({ tel, mail }), oppure null se non ce ne sono. */
export function recapiti({ telefono: numero, email } = {}) {
    const tel = telefono(numero);
    const mail = String(email ?? "").trim() || null;
    return tel || mail ? { tel, mail } : null;
}

/** Valore reale (non vuoto e non segnaposto come "[DA CONFERMARE]"), altrimenti undefined. */
export function valoreReale(valore) {
    const testo = String(valore ?? "").trim();
    return testo && !PLACEHOLDER.test(testo) ? testo : undefined;
}

/** URL assoluto di un asset del sito (per SEO e anteprime social). */
export function urlAssoluto(sitoUrl, percorso) {
    if (!percorso) return "";
    if (/^https?:\/\//i.test(percorso)) return percorso;
    return `${sitoUrl}/${String(percorso).replace(/^\.?\/+/, "")}`;
}

/** Campo mappa di data/luogo.json (URL di embed o <iframe> copiato da Google Maps) → { src, lat, lng }. */
export function leggiMappa(mappa) {
    const testo = String(mappa ?? "").trim();
    const src = testo.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1] ?? testo;
    const lng = src.match(/!2d(-?\d+\.\d+)/)?.[1];
    const lat = src.match(/!3d(-?\d+\.\d+)/)?.[1];
    return { src, lat: lat ? Number(lat) : undefined, lng: lng ? Number(lng) : undefined };
}

/** "via, cap città" di una sede (vuoto se manca la via). */
export function testoSede({ via, cap, citta } = {}) {
    return via ? `${via}, ${cap} ${citta}` : "";
}
