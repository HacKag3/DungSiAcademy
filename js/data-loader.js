// Unico contenuto ancora letto a runtime: gli annunci, che vivono in
// media/annunci/ (insieme alle pagine di dettaglio) e vengono aggiornati
// senza rebuild. Tutto il resto è compilato nelle pagine dal build.
const ANNUNCI_URL = "media/annunci/annunci.json";

const dataCache = new Map();

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${url}`);
    return res.json();
}

export function loadData(key) {
    if (key !== "annunci") {
        throw new Error(`Chiave dati sconosciuta: "${key}" (unico dato runtime: "annunci"; il resto è compilato dal build).`);
    }
    if (!dataCache.has(key)) {
        dataCache.set(key, fetchJson(ANNUNCI_URL));
    }
    return dataCache.get(key);
}

export function buildAnnouncements(annunci) {
    return (annunci ?? []).map(({ dataEvento, ...annuncio }) => ({
        ...annuncio,
        data: dataEvento ?? ""
    }));
}
