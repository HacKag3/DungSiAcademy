const DATA_PATHS = {
    settings: "data/settings.json",
    contatti: "data/contatti.json",
    corsi: "data/corsi.json",
    personale: "data/personale.json",
    annunci: "data/annunci.json",
    whoweare: "data/content/whoweare.json"
};

const dataCache = new Map();

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} caricando ${url}`);
    return res.json();
}

export function loadData(key) {
    if (!DATA_PATHS[key]) {
        throw new Error(`Chiave dati sconosciuta: "${key}" (disponibili: ${Object.keys(DATA_PATHS).join(", ")})`);
    }
    if (!dataCache.has(key)) {
        dataCache.set(key, fetchJson(DATA_PATHS[key]));
    }
    return dataCache.get(key);
}

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

export function buildAnnouncements(annunci) {
    return (annunci ?? []).map(({ dataEvento, ...annuncio }) => ({
        ...annuncio,
        data: dataEvento ?? ""
    }));
}

export function buildBrand(settings) {
    const brand = settings.brand ?? {};
    const paths = brand.logo?.paths ?? {};
    return {
        name: brand.name ?? "",
        logo: paths.og || paths.svg || "",
        home: "./index.html"
    };
}

export async function loadSiteConfig() {
    const [settings, contatti, corsi] = await Promise.all([
        loadData("settings"),
        loadData("contatti"),
        loadData("corsi")
    ]);

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
        associations: settings.associazioni ?? {},
        ui: settings.ui ?? {}
    };
}

export function getNavigation() {
    const el = document.getElementById("navigation-data");
    if (!el) return [];
    try {
        return JSON.parse(el.textContent);
    } catch {
        return [];
    }
}
