// Script di build: legge seo-data.json + pages_template/*.html
// e genera gli .html finali pronti per il deploy.
//
// Uso:
//   node build-seo.mjs
//   (oppure: npm run build:seo)
//
// Per modificare titoli/descrizioni/dominio: edita SOLO seo-data.json.
// Per modificare il contenuto di una pagina: edita pages_template/<pagina>.html.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG } from "./js/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // root del sito

const DATA_PATH = path.join(__dirname, "seo-data.json");
const TEMPLATES_DIR = path.join(__dirname, "pages_template");
const PARTIALS_DIR = path.join(TEMPLATES_DIR, "_partials");
const OUTPUT_DIR = __dirname;

const PARTIALS = {
    "{{HEAD_COMMON}}": "head-common.html"
};

const GIORNI_IT_EN = {
    "Lunedì": "Monday",
    "Martedì": "Tuesday",
    "Mercoledì": "Wednesday",
    "Giovedì": "Thursday",
    "Venerdì": "Friday",
    "Sabato": "Saturday",
    "Domenica": "Sunday"
};

// Toglie il flag "sola lettura" se il file esiste già, cosi' possiamo
// riscriverlo. Su Windows fs.chmod agisce sull'attributo "read-only";
// su Unix/macOS sui permessi di scrittura del proprietario.
function makeWritable(filePath) {
    if (!fs.existsSync(filePath)) return;
    try {
        fs.chmodSync(filePath, 0o644);
    } catch (err) {
        console.warn(`⚠️  Non riesco a rendere scrivibile ${filePath}: ${err.message}`);
    }
}

// Imposta il file appena scritto come sola lettura, per scoraggiare
// modifiche a mano dei file generati (vanno editati i template, non
// questi).
function makeReadOnly(filePath) {
    try {
        fs.chmodSync(filePath, 0o444);
    } catch (err) {
        console.warn(`⚠️  Non riesco a impostare ${filePath} come sola lettura: ${err.message}`);
    }
}

function loadData() {
    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌  File non trovato: ${DATA_PATH}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function buildOpeningHours() {
    const specs = [];

    for (const categoria of Object.values(CONFIG.orari ?? {})) {
        for (const { giorno, ora } of categoria.giorni ?? []) {
            const dayOfWeek = GIORNI_IT_EN[giorno];
            const [opens, closes] = (ora || "").split("-").map(s => s.trim());

            if (!dayOfWeek || !opens || !closes) {
                console.warn(`⚠️  Riga orario non riconosciuta, saltata nello schema.org: giorno="${giorno}", ora="${ora}"`);
                continue;
            }

            specs.push({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [dayOfWeek],
                opens,
                closes
            });
        }
    }

    return specs;
}

function buildSameAs() {
    return (CONFIG.social ?? [])
        .map(s => s.url)
        .filter(url => url && !url.includes("..."));
}

function buildSchemaOrgJson(site, page) {
    const { indirizzoSchema, lat, lng } = CONFIG.luogo ?? {};
    const pageUrl = `${site.domain}/${page.output}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        name: site.name,
        description: page.description ?? "",
        url: pageUrl,
        image: `${site.domain}${site.ogImage}`,
        address: indirizzoSchema ? { "@type": "PostalAddress", ...indirizzoSchema } : undefined,
        geo: (lat && lng) ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng } : undefined,
        openingHoursSpecification: buildOpeningHours(),
        sameAs: buildSameAs(),
        telephone: CONFIG.contactPhone || undefined
    };

    Object.keys(schema).forEach(key => schema[key] === undefined && delete schema[key]);

    return JSON.stringify(schema, null, 4);
}

function buildLegalTokens() {
    const legal = CONFIG.legal ?? {};
    const sede = legal.sedeLegale ?? {};

    const sedeTesto = sede.via ? `${sede.via}, ${sede.cap} ${sede.citta}` : "";
    const pivaInline = legal.partitaIva ? `, P.IVA ${legal.partitaIva}` : "";

    return {
        "{{LEGAL_DENOMINAZIONE}}": legal.denominazione ?? "",
        "{{LEGAL_CF}}": legal.codiceFiscale ?? "",
        "{{LEGAL_PIVA}}": legal.partitaIva ?? "",
        "{{LEGAL_PIVA_INLINE}}": pivaInline,
        "{{LEGAL_SEDE}}": sedeTesto,
        "{{LEGAL_RAPPRESENTANTE}}": legal.rappresentanteLegale ?? "",
        "{{LEGAL_RUNTS}}": legal.registrazione ?? "",
        "{{LEGAL_EMAIL_PRIVACY}}": legal.emailPrivacy ?? ""
    };
}

function computeTokens(site, page) {
    const pageTitleTag = page.title ? `${site.name} - ${page.title}` : site.name;
    const pageOgTitle = page.ogTitle || pageTitleTag;
    const pageUrl = `${site.domain}/${page.output}`;

    return {
        "{{SITE_NAME}}": site.name,
        "{{SITE_LOCALE}}": site.locale,
        "{{SITE_DOMAIN}}": site.domain,
        "{{OG_IMAGE}}": `${site.domain}${site.ogImage}`,
        "{{OG_IMAGE_ALT}}": site.ogImageAlt,
        "{{PAGE_TITLE_TAG}}": pageTitleTag,
        "{{PAGE_OG_TITLE}}": pageOgTitle,
        "{{PAGE_DESCRIPTION}}": page.description ?? "",
        "{{PAGE_URL}}": pageUrl,
        "{{SCHEMA_ORG_JSON}}": buildSchemaOrgJson(site, page),
        ...buildLegalTokens()
    };
}

function applyPartials(html, pageKey) {
    let out = html;
    for (const [token, filename] of Object.entries(PARTIALS)) {
        if (!out.includes(token)) continue;

        const partialPath = path.join(PARTIALS_DIR, filename);
        if (!fs.existsSync(partialPath)) {
            console.warn(`⚠️  Pagina "${pageKey}": partial mancante _partials/${filename} per il token ${token}.`);
            continue;
        }

        const partialContent = fs.readFileSync(partialPath, "utf-8");
        out = out.split(token).join(partialContent);
    }
    return out;
}

function applyTokens(content, tokens) {
    let out = content;
    for (const [token, value] of Object.entries(tokens)) {
        out = out.split(token).join(value ?? "");
    }
    return out;
}

function checkUnresolvedTokens(html, pageKey) {
    const leftover = html.match(/\{\{[A-Z_]+\}\}/g);
    if (leftover) {
        console.warn(`⚠️  Pagina "${pageKey}": token non risolti rimasti nell'output -> ${[...new Set(leftover)].join(", ")}`);
    }
}

function build() {
    const { site, pages } = loadData();

    if (!Array.isArray(pages) || pages.length === 0) {
        console.warn("⚠️  Nessuna pagina definita in seo-data.json.");
        return;
    }

    let generated = 0;

    for (const page of pages) {
        const templatePath = path.join(TEMPLATES_DIR, page.template);

        if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️  Template mancante: ${TEMPLATES_DIR}/${page.template} (pagina "${page.key}") — saltata.`);
            continue;
        }

        const raw = fs.readFileSync(templatePath, "utf-8");
        const withPartials = applyPartials(raw, page.key);
        const tokens = computeTokens(site, page);
        const finalHtml = applyTokens(withPartials, tokens);

        checkUnresolvedTokens(finalHtml, page.key);

        const outPath = path.join(OUTPUT_DIR, page.output);
        makeWritable(outPath);
        fs.writeFileSync(outPath, finalHtml, "utf-8");
        makeReadOnly(outPath);
        console.log(`✅  ${TEMPLATES_DIR}/${page.template} -> ${page.output} (sola lettura)`);
        generated++;
    }

    console.log(`\nFatto: ${generated} pagina/e generate su ${pages.length} definite.`);
}

build();
