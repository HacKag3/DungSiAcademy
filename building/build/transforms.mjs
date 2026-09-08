// building/build/transforms.mjs
// Trasformazioni dati -> config "virtuale" usata dal builder per integrare
// a priori ciò che serve nei file (JSON-LD/schema.org). Le stesse regole
// girano lato browser in js/data-loader.js sui JSON originali.

// Trasforma data/corsi.json (disciplina come array) nella mappa "discipline":
// { [key]: { titolo, icona, descrizione, orari } }.
function buildDisciplineMap(disciplinaList) {
    const discipline = {};
    for (const item of disciplinaList) {
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

// data/corsi.json usa provincia come ["VR", "Verona"]: nella config
// il consumatore si aspetta una stringa (abbreviazione).
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

// Aggiunge un id leggibile ai contatti (data/contatti.json non lo contiene).
function buildContacts(emailMap) {
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

// Gli annunci nel runtime espongono la data evento come "data".
function buildAnnouncements(annunci) {
    return (annunci ?? []).map(({ dataEvento, ...annuncio }) => ({
        ...annuncio,
        data: dataEvento ?? ""
    }));
}

// Normalizza il brand da data/settings.json. La copertina ora è un oggetto
// { path, width, height, alt } usato dai token COPERTINA_* del head-common.
function buildBrand(settings) {
    const brand = settings.brand ?? {};
    const paths = brand.logo?.paths ?? {};
    const copertina = brand.copertina ?? {};
    return {
        name: brand.name ?? "",
        logo: paths.og || paths.svg || "",
        home: "./index.html",
        copertina: {
            path: copertina.path ?? "",
            width: copertina.width ?? "",
            height: copertina.height ?? "",
            alt: copertina.alt ?? ""
        }
    };
}

// Config "virtuale" usata solo per i token che il builder integra a priori
// (JSON-LD, schema.org). I dati editoriali veri sono letti dal browser
// a runtime da data/ via js/data-loader.js.
export function buildRuntimeConfig({ settings, contatti, corsi, pages, annunci }) {
    return {
        discipline: buildDisciplineMap(corsi.disciplina ?? []),
        luogo: buildLuogo(corsi.luogo),
        contacts: buildContacts(contatti.email),
        social: contatti.social ?? [],
        brand: buildBrand(settings),
        // emailPrivacy arriva dalle impostazioni oppure dal contatto
        // "privacy" di data/contatti.json.
        legal: {
            ...(settings.legale ?? {}),
            emailPrivacy: settings.legale?.emailPrivacy || contatti.email?.privacy?.email || ""
        },
        associations: settings.associazioni ?? {},
        content: { announcements: buildAnnouncements(annunci) },
        pages: buildNavigation(pages)
    };
}

// Navigazione: lista delle pagine da mostrare nel menu (struttura del sito).
export function buildNavigation(pages) {
    return pages
        .filter((page) => page.nav === true)
        .map(({ output, navLabel, title }) => ({
            name: navLabel || title,
            href: `./${output}`
        }));
}