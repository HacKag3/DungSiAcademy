export function buildDisciplineMap(disciplinaList) {
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

function normalizeProvincia(provincia) {
    if (Array.isArray(provincia)) return provincia[0] ?? "";
    return provincia ?? "";
}

function parseMapInput(mapInput) {
    if (!mapInput) return {};
    const trimmed = mapInput.trim();

    // Estrai src da un tag iframe completo
    const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    const src = iframeMatch ? iframeMatch[1] : trimmed;

    // Estrai lat/lng dall'URL Google Maps embed (!2d = lng, !3d = lat)
    const coords = {};
    const lngMatch = src.match(/!2d(-?\d+\.\d+)/);
    const latMatch = src.match(/!3d(-?\d+\.\d+)/);
    if (lngMatch) coords.lng = parseFloat(lngMatch[1]);
    if (latMatch) coords.lat = parseFloat(latMatch[1]);

    return { src, ...coords };
}

export function buildLuogo(luogo) {
    if (!luogo) return {};
    const indirizzo = luogo.indirizzo ?? {};
    const mapData = parseMapInput(luogo.map);
    return {
        indirizzo: {
            via: indirizzo.via ?? "",
            numero: indirizzo.numero ?? "",
            citta: indirizzo.citta ?? "",
            provincia: normalizeProvincia(indirizzo.provincia),
            cap: indirizzo.cap ?? "",
            paese: indirizzo.paese ?? "IT"
        },
        lat: luogo.lat ?? mapData.lat,
        lng: luogo.lng ?? mapData.lng,
        map: mapData.src
    };
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

function buildBrand(settings) {
    const brand = settings.brand ?? {};
    const paths = brand.logo?.paths ?? {};
    const copertina = brand.copertina ?? {};
    return {
        name: brand.name ?? "",
        descrizione: brand.descrizione ?? "",
        logo: paths.og || paths.svg || "",
        logoPng: paths.android?.["512"] || paths.og || paths.svg || "",
        copertina: {
            path: copertina.path ?? "",
            width: copertina.width ?? "",
            height: copertina.height ?? "",
            alt: copertina.alt ?? ""
        }
    };
}

// HTML compilato per pagina: il build genera l'HTML finale nei punti esatti
// delle pagine (header, burger, footer, sezioni). Le funzioni di compilazione
// vivono in compile.mjs; qui resta solo l'assemblaggio del config.
import {
    compileHeaderInner,
    compileBurger,
    compileDevAlert,
    compileFooter,
    compileOrari,
    compileLuogo,
    compileContactsPage,
    compileWhoweare
} from "./compile.mjs";

export function buildRuntimeConfig({ settings, contatti, corsi }) {
    return {
        discipline: buildDisciplineMap(corsi.disciplina ?? []),
        luogo: buildLuogo(corsi.luogo),
        contacts: buildContacts(contatti.email),
        social: contatti.social ?? [],
        brand: buildBrand(settings)
    };
}

export function buildNavigation(pages) {
    return pages
        .filter((page) => page.nav === true)
        .map(({ output, navLabel, title }) => ({
            name: navLabel || title,
            href: `./${output}`
        }));
}

export function buildPageConfig({ settings, contatti, corsi }) {
    return {
        brand: { ...buildBrand(settings), home: "./index.html" },
        ui: settings.ui ?? {},
        contacts: buildContacts(contatti.email),
        social: contatti.social ?? [],
        legal: {
            ...(settings.legale ?? {}),
            emailPrivacy: settings.legale?.emailPrivacy || contatti.email?.privacy?.email || ""
        },
        associations: settings.associazioni ?? {}
    };
}

export function buildPageHtml({ page, pages, settings, contatti, corsi, team, whoweare }) {
    const config = buildPageConfig({ settings, contatti, corsi });
    const nav = buildNavigation(pages);
    const { brand, ui } = config;

    return {
        headerInner: compileHeaderInner(brand, ui, nav, page.output),
        burger: compileBurger(ui, nav, page.output),
        devAlert: compileDevAlert(ui),
        footer: compileFooter(config, ui),
        orari: page.key === "index" ? compileOrari(corsi) : "",
        luogo: page.key === "index" ? compileLuogo(corsi) : "",
        contacts: page.key === "contacts" ? compileContactsPage(contatti, team) : "",
        whoweare: page.key === "whoweare" ? compileWhoweare(whoweare) : ""
    };
}
