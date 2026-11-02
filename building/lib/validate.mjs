/**
 * Validazione dei dati prima del build: un errore interrompe il build
 * indicando il file e il campo da correggere.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "./paths.mjs";
import { getBrandLogos, resolveIconPaths } from "./brand.mjs";

const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const ORA = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
const PERSONALE = "contenuti/personale.json";
// Percorsi di brand.logo.paths che puntano a file generati dal build, non ad asset.
const GENERATED_ICON_KEYS = new Set(["manifest", "browserconfig"]);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const filled = (value) => typeof value === "string" && value.trim() !== "";

function check(condition, where, message) {
    if (!condition) throw new Error(`${where}: ${message}`);
}

export function validate(data, pages, runtime) {
    validateSito(data.sito);
    validateBrand(data.brand);
    validateLuogo(data.luogo);
    validateCaroselli(data.discipline, data.approfondimenti);
    validateLegale(data.legale);
    // Contenuti runtime: su main si modificano senza build, qui almeno si controllano su dev.
    check(Array.isArray(runtime.annunci), "contenuti/annunci.json", "deve contenere una lista.");
    validateList(runtime.personale, PERSONALE, ["nome", "cognome"], { notEmpty: true });
    validatePersonale(runtime.personale);
    validateCorsi(runtime.corsi);
    validateList(runtime.social, "contenuti/social.json", ["name", "icon"]);
    validateContatti(runtime.contatti);
    validatePages(pages);
    validateAssets(data, runtime);
}

function validateSito(sito) {
    const where = "data/sito.json";
    check(isObject(sito), where, "deve contenere un oggetto.");
    check(/^https?:\/\/[^/]+/.test(sito.domain ?? ""), where, "domain deve essere un indirizzo completo, es. https://dominio.it.");
    check(filled(sito.lang) && filled(sito.locale), where, "lang e locale sono obbligatori.");
}

function validateBrand(brand) {
    const where = "data/brand.json";
    check(isObject(brand), where, "deve contenere un oggetto.");
    check(filled(brand.name), where, "name è obbligatorio.");
    check(filled(brand.themeColor), where, "themeColor è obbligatorio.");
    check(filled(brand.copertina?.path), where, "copertina.path è obbligatorio (immagine delle anteprime social).");
    check(filled(brand.logo?.paths?.root) && filled(brand.logo?.paths?.svg), where, "logo.paths.root e logo.paths.svg sono obbligatori.");
    const loghi = brand.logo?.loghi;
    check(Array.isArray(loghi) && loghi.length > 0, where, "logo.loghi deve contenere almeno un logo.");
    loghi.forEach((logo, index) => {
        check(filled(logo?.name) && filled(logo?.alt), where, `logo.loghi[${index}] richiede name e alt.`);
    });
}

function validateList(list, where, required, { notEmpty = false } = {}) {
    check(Array.isArray(list), where, "deve contenere una lista.");
    check(!notEmpty || list.length > 0, where, "la lista non può essere vuota.");
    list.forEach((item, index) => {
        const missing = required.filter((field) => !filled(item?.[field]));
        check(missing.length === 0, where, `elemento ${index + 1}: mancano ${missing.join(", ")}.`);
    });
}

// denominazione: nome del titolare; dati: { "Etichetta mostrata": "valore" };
// affiliazioni: un ente per voce, con logo, alt, link facoltativo (indirizzo web)
// ed eventuali dati nello stesso formato.
function validateLegale(legale) {
    const where = "data/legale.json";
    check(isObject(legale), where, "deve contenere un oggetto.");
    check(filled(legale.denominazione), where, "denominazione è obbligatoria.");
    checkEtichette(legale.dati, where, "dati");
    validateList(legale.affiliazioni, where, ["ente", "logo", "alt"]);
    legale.affiliazioni.forEach((ente) => {
        checkEtichette(ente.dati ?? {}, where, `dati di "${ente.ente}"`);
        check(ente.link === undefined || /^https?:\/\/\S+$/.test(ente.link), where,
            `link di "${ente.ente}" deve essere un indirizzo completo, es. https://www.coni.it/.`);
    });
}

function checkEtichette(dati, where, nome) {
    check(isObject(dati), where, `${nome} deve essere un oggetto { "Etichetta": "valore" }.`);
    for (const [etichetta, valore] of Object.entries(dati)) {
        check(typeof valore === "string", where, `${nome}: il valore di "${etichetta}" deve essere un testo.`);
    }
}

function validateContatti(contatti) {
    const where = "contenuti/contatti.json";
    check(isObject(contatti), where, "deve contenere un oggetto { id: contatto }.");
    for (const [id, contatto] of Object.entries(contatti)) {
        check(filled(contatto?.titolo), where, `il contatto "${id}" richiede titolo.`);
    }
}

// ruolo = ruolo principale; altriRuoli (facoltativo) = elenco dei ruoli secondari.
function validatePersonale(personale) {
    for (const persona of personale) {
        const { altriRuoli } = persona;
        if (altriRuoli === undefined) continue;
        check(Array.isArray(altriRuoli) && altriRuoli.every(filled), PERSONALE,
            `altriRuoli di ${persona.nome} deve essere una lista di testi, es. ["Iscrizioni", "Amministrazione"].`);
    }
}

function validateCorsi(corsi) {
    const where = "contenuti/corsi.json";
    check(Array.isArray(corsi) && corsi.length > 0, where, "definire almeno una disciplina.");
    for (const disciplina of corsi) {
        const nome = disciplina?.key ?? "(senza key)";
        check(filled(disciplina?.key) && filled(disciplina.titolo) && filled(disciplina.descrizione),
            where, `la disciplina "${nome}" richiede key, titolo e descrizione.`);
        check(Array.isArray(disciplina.fasce) && disciplina.fasce.length > 0, where, `la disciplina "${nome}" richiede almeno una fascia.`);
        for (const fascia of disciplina.fasce) {
            const id = `${nome}.${fascia?.key ?? "?"}`;
            check(filled(fascia?.key) && filled(fascia.nome) && Array.isArray(fascia.giorni),
                where, `la fascia "${id}" richiede key, nome e giorni.`);
            for (const { giorno, ora } of fascia.giorni) {
                check(GIORNI.includes(giorno), where, `giorno non valido "${giorno}" in "${id}" (usa ${GIORNI.join(", ")}).`);
                check(ORA.test(ora ?? ""), where, `orario non valido "${ora}" in "${id}" (formato HH:MM-HH:MM).`);
            }
        }
    }
}

function validateLuogo(luogo) {
    const where = "data/luogo.json";
    check(isObject(luogo?.indirizzo), where, "indirizzo è obbligatorio.");
    check(filled(luogo.indirizzo.via) && filled(luogo.indirizzo.citta), where, "indirizzo.via e indirizzo.citta sono obbligatori.");
}

const UNIQUE_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateDiscipline(discipline, caroselli) {
    const where = "data/discipline.json";
    check(filled(discipline?.intro?.text), where, "intro.text è obbligatorio.");
    check(Array.isArray(discipline.disciplina) && discipline.disciplina.length > 0, where, "definire almeno una disciplina.");
    const keys = new Set();
    for (const disciplina of discipline.disciplina) {
        check(filled(disciplina?.key) && filled(disciplina.tabLabel) && filled(disciplina.heading)
            && filled(disciplina.intro) && Array.isArray(disciplina.activities),
            where, `disciplina "${disciplina?.key ?? "?"}": servono key, tabLabel, heading, intro e activities.`);
        check(UNIQUE_KEY.test(disciplina.key) && !keys.has(disciplina.key), where, `key "${disciplina.key}" non valida o ripetuta (solo minuscole, numeri e trattini).`);
        keys.add(disciplina.key);
        useCaroselli(caroselli, where, [disciplina.carosello, ...disciplina.activities.map((activity) => activity.carosello)]);
    }
}

// Un articolo per file in data/approfondimenti/: ognuno è un tab della pagina Approfondimenti.
function validateApprofondimenti(articoli, caroselli) {
    const where = "data/approfondimenti/";
    check(Array.isArray(articoli) && articoli.length > 0, where, "definire almeno un articolo (un file .json per articolo).");
    const keys = new Set();
    for (const articolo of articoli) {
        const nome = `${where}${articolo?.key ?? "?"}.json`;
        check(filled(articolo?.key) && filled(articolo.tabLabel) && filled(articolo.title) && filled(articolo.summary) && filled(articolo.body),
            nome, "servono key, tabLabel, title, summary e body.");
        check(UNIQUE_KEY.test(articolo.key) && !keys.has(articolo.key), nome, `key "${articolo.key}" non valida o ripetuta (solo minuscole, numeri e trattini).`);
        keys.add(articolo.key);
        check(articolo.date === undefined || /^\d{4}-\d{2}-\d{2}$/.test(articolo.date), nome, "date deve avere il formato AAAA-MM-GG.");
        check(articolo.order === undefined || Number.isFinite(articolo.order), nome, "order deve essere un numero.");
        useCaroselli(caroselli, nome, [articolo.carosello]);
    }
}

// Il carosello 0 è quello della home: ogni numero deve essere unico in tutto il sito.
function validateCaroselli(discipline, approfondimenti) {
    const caroselli = new Set([0]);
    validateDiscipline(discipline, caroselli);
    validateApprofondimenti(approfondimenti, caroselli);
}

function useCaroselli(caroselli, where, numeri) {
    for (const numero of numeri.filter((value) => value != null)) {
        check(!caroselli.has(numero), where, `carosello ${numero} usato più volte.`);
        caroselli.add(numero);
    }
}

function validatePages(pages) {
    check(pages.length > 0, "building/pages", "definire almeno una pagina.");
    check(pages.some((page) => page.output === "index.html"), "building/pages", "manca la home (output \"index.html\").");

    const outputs = new Map();
    for (const page of pages) {
        const where = `building/pages/${page.folder}/${page.folder}.json`;
        check(filled(page.output) && /^[\w-]+\.html$/.test(page.output), where,
            `output non valido "${page.output}" (es. "nome.html", nella root del sito).`);
        check(!outputs.has(page.output), where,
            `output "${page.output}" già usato dalla cartella building/pages/${outputs.get(page.output)}/ `
            + "(se è una cartella vecchia o rinominata, eliminala).");
        outputs.set(page.output, page.folder);
        check(filled(page.title), where, `la pagina "${page.output}" richiede title.`);
        check(fs.existsSync(page.template), where, `template non trovato: ${path.relative(ROOT_DIR, page.template)}.`);
        check(fs.existsSync(page.layout), where, `layout non trovato: ${path.relative(ROOT_DIR, page.layout)}.`);
        check(!page.nav || filled(page.nav.label), where, `la voce di menu di "${page.output}" richiede nav.label.`);
    }
}

function validateAssets(data, runtime) {
    const assets = [
        ...getBrandLogos(data.brand).map((logo) => [`data/brand.json: logo "${logo.name}"`, logo.path]),
        ...iconAssets(resolveIconPaths(data.brand)),
        ["data/brand.json: copertina.path", data.brand.copertina.path],
        ...data.legale.affiliazioni.map((item) => [`data/legale.json: logo di "${item.ente}"`, item.logo]),
        ...runtime.personale.map((persona) => [`${PERSONALE}: foto di ${persona.nome}`, persona.foto?.src]),
        ...runtime.annunci.map((annuncio) => [`contenuti/annunci.json: dettaglio di "${annuncio.id}"`, annuncio.dettaglioUrl])
    ];

    for (const [label, assetPath] of assets) {
        if (!filled(assetPath) || /^https?:\/\//i.test(assetPath)) continue;
        const relative = assetPath.replace(/^\.?\/+/, "");
        check(fs.existsSync(path.join(ROOT_DIR, relative)), label, `file non trovato "${assetPath}".`);
    }
}

function iconAssets(node, trail = "logo.paths") {
    if (typeof node === "string") return [[`data/brand.json: ${trail}`, node]];
    if (!isObject(node)) return [];
    return Object.entries(node)
        .filter(([key]) => !GENERATED_ICON_KEYS.has(key))
        .flatMap(([key, value]) => iconAssets(value, `${trail}.${key}`));
}
