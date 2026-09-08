// js/data-loader.js
// Carica a runtime i dati del sito direttamente dai file JSON in /data.
// In questo modo, modificando un file JSON i contenuti cambiano SENZA rebuild.
//
// Il build resta vincolato solo a ciò che deve essere integrato a priori
// negli HTML: meta SEO, JSON-LD, struttura della pagina e navigazione
// (quest'ultima arriva come <script type="application/json" id="navigation-data">).
//
// File dati letti qui:
//   data/settings.json           -> brand, dati legali, affiliazioni
//   data/contatti.json           -> social e contatti email
//   data/corsi.json              -> discipline, orari e luogo
//   data/personale.json          -> team
//   data/annunci.json            -> annunci
//   data/content/whoweare.json   -> pagina "Chi Siamo"

const DATA_PATHS = {
    settings: "data/settings.json",
    contatti: "data/contatti.json",
    corsi: "data/corsi.json",
    personale: "data/personale.json",
    annunci: "data/annunci.json",
    whoweare: "data/content/whoweare.json"
};

let siteDataPromise = null;

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${url}`);
    return res.json();
}

/** Carica (una sola volta, con cache) tutti i dati del sito. */
export function loadSiteData() {
    if (!siteDataPromise) {
        siteDataPromise = Promise.all(
            Object.entries(DATA_PATHS).map(async ([key, url]) => [key, await fetchJson(url)])
        ).then((entries) => Object.fromEntries(entries));
    }
    return siteDataPromise;
}

// ---------------------------------------------------------------------------
// Trasformazioni dati: stesse regole che il builder applica in building/build/
// transforms.mjs, eseguite qui nel browser sui JSON originali. Esportate solo
// le funzioni usate da altri moduli del browser, il resto resta interno.
// ---------------------------------------------------------------------------

function normalizeProvincia(provincia) {
    if (Array.isArray(provincia)) return provincia[0] ?? "";
    return provincia ?? "";
}

function buildLuogo(luogo) {
    if (!luogo) return {};
    const indirizzo = luogo.indirizzo ?? {};
    return {
        indirizzo: {
            via: indirizzo.via ?? "",
            numero: indirizzo.numero ?? "",
            citta: indirizzo.citta ?? "",
            provincia: normalizeProvincia(indirizzo.provincia),
            cap: indirizzo.cap ?? "",
            paese: indirizzo.paese ?? "IT"
        },
        lat: luogo.lat,
        lng: luogo.lng,
        map: luogo.map
    };
}

/** data/corsi.json (disciplina come array) -> mappa "discipline" del runtime. */
function buildDisciplineMap(disciplinaList) {
    const discipline = {};
    for (const item of disciplinaList ?? []) {
        const orari = {};
        for (const [fasciaKey, fascia] of Object.entries(item.fascia ?? {})) {
            orari[fasciaKey] = {
                id: fascia?.id ?? fasciaKey,
                giorni: fascia?.giorni ?? [],
                info: fascia?.descrizione ?? ""
            };
        }
        discipline[item.key] = {
            titolo: item.titolo ?? "",
            icona: item.icona ?? "",
            descrizione: item.description ?? "",
            orari
        };
    }
    return discipline;
}

/** Aggiunge un id leggibile ai contatti (data/contatti.json non lo contiene). */
export function buildContacts(emailMap) {
    const contacts = {};
    for (const [key, contact] of Object.entries(emailMap ?? {})) {
        contacts[key] = {
            ...contact,
            id: contact?.id ?? key,
            titolo: contact?.titolo ?? "",
            icon: contact?.icon ?? "fas fa-info-circle",
            descrizione: contact?.descrizione ?? "",
            telefono: contact?.telefono ?? "",
            email: contact?.email ?? ""
        };
    }
    return contacts;
}

/** Gli annunci nel runtime espongono la data evento come "data". */
export function buildAnnouncements(annunci) {
    return (annunci ?? []).map(({ dataEvento, ...annuncio }) => ({
        ...annuncio,
        data: dataEvento ?? ""
    }));
}

/** Normalizza il brand da data/settings.json per header e footer. */
export function buildBrand(settings) {
    const brand = settings.brand ?? {};
    const paths = brand.logo?.paths ?? {};
    return {
        name: brand.name ?? "",
        logo: paths.og || paths.svg || "",
        home: "./index.html"
    };
}

/**
 * Config nel formato usato dai moduli del browser (footer, pagina index),
 * calcolata a runtime dai JSON originali (così basta modificare i dati).
 */
export async function loadSiteConfig() {
    const { settings, contatti, corsi } = await loadSiteData();
    return {
        discipline: buildDisciplineMap(corsi.disciplina ?? []),
        luogo: buildLuogo(corsi.luogo),
        contacts: buildContacts(contatti.email),
        social: contatti.social ?? [],
        brand: buildBrand(settings),
        legal: {
            ...(settings.legale ?? {}),
            emailPrivacy: settings.legale?.emailPrivacy || contatti.email?.privacy?.email || ""
        },
        associations: settings.associazioni ?? {}
    };
}

/**
 * Navigazione: la fornisce il builder dentro ogni pagina come
 * <script type="application/json" id="navigation-data">…</script>
 * (è struttura del sito, quindi "a priori": aggiungere una pagina richiede build).
 */
export function getNavigation() {
    const el = document.getElementById("navigation-data");
    if (!el) return [];
    try {
        return JSON.parse(el.textContent);
    } catch {
        return [];
    }
}
