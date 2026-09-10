import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "./paths.mjs";

export function validateData(site, pages, settings, contatti, corsi) {
    if (!site?.domain) {
        throw new Error("building/data/seo-data.json: site.domain Ã¨ obbligatorio.");
    }
    if (!Array.isArray(pages) || pages.length === 0) {
        throw new Error("building/data/seo-data.json: definire almeno una pagina.");
    }

    const outputs = new Set();
    for (const page of pages) {
        if (!page.key || !page.template || !page.output) {
            throw new Error("building/data/seo-data.json: ogni pagina deve avere key, template e output.");
        }
        if (page.nav === true && !page.navLabel && !page.title) {
            throw new Error(`building/data/seo-data.json: la pagina "${page.key}" nel menu deve avere navLabel o title.`);
        }
        if (path.isAbsolute(page.output) || page.output.includes("..")) {
            throw new Error(`building/data/seo-data.json: output non valido "${page.output}".`);
        }
        if (outputs.has(page.output)) {
            throw new Error(`building/data/seo-data.json: output duplicato "${page.output}".`);
        }
        outputs.add(page.output);
    }

    if (!settings || typeof settings !== "object") {
        throw new Error("building/data/settings.json: il contenuto deve essere un oggetto JSON.");
    }
    if (!settings.brand?.name) {
        throw new Error("building/data/settings.json: brand.name Ã¨ obbligatorio (usato come SITE_NAME/BRAND_NAME).");
    }
    if (!settings.brand?.logo?.paths?.svg) {
        throw new Error("building/data/settings.json: brand.logo.paths.svg Ã¨ obbligatorio.");
    }

    if (!contatti || typeof contatti !== "object") {
        throw new Error("building/data/contatti.json: il contenuto deve essere un oggetto JSON.");
    }
    if (!Array.isArray(contatti.social)) {
        throw new Error("building/data/contatti.json: social deve essere un array.");
    }
    if (!contatti.email || typeof contatti.email !== "object") {
        throw new Error("building/data/contatti.json: email Ã¨ obbligatorio.");
    }

    if (!Array.isArray(corsi?.disciplina) || corsi.disciplina.length === 0) {
        throw new Error("building/data/corsi.json: definire almeno una disciplina.");
    }
    for (const disciplina of corsi.disciplina) {
        if (!disciplina.key || !disciplina.titolo || !disciplina.description || typeof disciplina.fascia !== "object") {
            throw new Error(`building/data/corsi.json: disciplina non valida "${disciplina.key ?? "(senza key)"}".`);
        }
        for (const [fasciaKey, fascia] of Object.entries(disciplina.fascia ?? {})) {
            if (!fascia?.id || !Array.isArray(fascia.giorni)) {
                throw new Error(`building/data/corsi.json: fascia oraria non valida "${disciplina.key}.${fasciaKey}".`);
            }
            for (const entry of fascia.giorni) {
                if (!entry?.giorno || !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(entry.ora || "")) {
                    throw new Error(`building/data/corsi.json: orario non valido in "${disciplina.key}.${fasciaKey}".`);
                }
            }
        }
    }
}

export function validateContent(team, whoweare, annunci) {
    if (!Array.isArray(team) || team.length === 0) {
        throw new Error("building/data/personale.json: definire almeno una persona.");
    }
    for (const [index, person] of team.entries()) {
        if (!person.nome || !person.cognome) {
            throw new Error(`building/data/personale.json[${index}]: nome e cognome sono obbligatori.`);
        }
    }

    if (!Array.isArray(annunci)) {
        throw new Error("media/annunci/annunci.json: deve contenere un array.");
    }

    if (!whoweare?.intro?.text || !Array.isArray(whoweare.disciplina) || whoweare.disciplina.length === 0) {
        throw new Error("building/data/content/whoweare.json: intro.text e disciplina sono obbligatori.");
    }

    const carouselNumbers = new Set([0]);
    for (const disciplina of whoweare.disciplina) {
        if (!disciplina.key || !disciplina.tabLabel || !disciplina.heading || !disciplina.intro || !Array.isArray(disciplina.activities)) {
            throw new Error("building/data/content/whoweare.json: disciplina non valida.");
        }
        const numbers = [disciplina.carosello, ...disciplina.activities.map((activity) => activity.carosello)];
        for (const number of numbers) {
            if (number == null) continue;
            if (carouselNumbers.has(number)) {
                throw new Error(`building/data/content/whoweare.json: carosello duplicato "${number}".`);
            }
            carouselNumbers.add(number);
        }
    }
}

export function validateLocalAssets(settings, team) {
    const paths = settings.brand?.logo?.paths ?? {};
    const copertina = settings.brand?.copertina ?? {};
    const assets = [
        ["building/data/settings.json: brand.logo.paths.og", paths.og],
        ["building/data/settings.json: brand.logo.paths.svg", paths.svg],
        ["building/data/settings.json: brand.copertina.path", copertina.path],
        ["building/data/settings.json: associazioni.asi.logo", settings.associazioni?.asi?.logo],
        ...team.map((person, index) => [`building/data/personale.json[${index}].foto.src`, person.foto?.src])
    ];

    for (const [label, assetPath] of assets) {
        if (!assetPath || /^https?:\/\//i.test(assetPath)) continue;
        const relativePath = assetPath.replace(/^[./]+/, "");
        if (!fs.existsSync(path.join(ROOT_DIR, relativePath))) {
            throw new Error(`${label}: asset locale non trovato "${assetPath}".`);
        }
    }
}
