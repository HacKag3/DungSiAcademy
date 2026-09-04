// Script di build: legge seo-data.json + pages_template/*.html
// e genera gli .html finali pronti per il deploy.
//
// Uso:
//   node building/build.mjs
//   (oppure: npm run build)
//
// Per modificare titoli/descrizioni/dominio: edita SOLO seo-data.json.
// Per modificare il contenuto di una pagina: edita pages_template/<pagina>.html.
// e poi eseguire il build

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG } from "../js/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // root del sito
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(__dirname, "seo-data.json");
const TEMPLATES_DIR = path.join(__dirname, "pages_template");
const PARTIALS_DIR = path.join(TEMPLATES_DIR, "_partials");
const SEO_TEMPLATES_DIR = path.join(__dirname, "seo");          // dove si trovano i sorgenti di sitemap e robots
const OUTPUT_DIR = ROOT_DIR;

const PARTIALS = {
    "{{HEAD_COMMON}}": "head-common.html",
    "{{HEAD_ERROR}}": "head-error.html"
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

// Toglie il flag "sola lettura" se il file esiste già
function makeWritable(filePath) {
    if (!fs.existsSync(filePath)) return;
    try {
        fs.chmodSync(filePath, 0o644);
    } catch (err) {
        console.warn(`⚠️  Non riesco a rendere scrivibile ${filePath}: ${err.message}`);
    }
}
// Imposta il file come sola lettura, 
// per scoraggiare modifiche a mano dei file generati
// (vanno editati i template, non questi).
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

function buildAbsoluteAssetUrl(siteDomain, assetPath) {
    if (!assetPath) return "";

    if (/^https?:\/\//i.test(assetPath)) {
        return assetPath;
    }

    const cleanPath = assetPath.replace(/^\.?\//, "");
    return `${siteDomain}/${cleanPath}`;
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
    const luogo = CONFIG.luogo ?? {};
    const indirizzo = luogo.indirizzo ?? {};
    const generale = CONFIG.contacts?.generale ?? {};
    const pageUrl = `${site.domain}/${page.output}`;
    const address = indirizzo.via
        ? {
            "@type": "PostalAddress",
            streetAddress: `${indirizzo.via}${indirizzo.numero ? ` ${indirizzo.numero}` : ""}`,
            addressLocality: indirizzo.citta ?? "",
            addressRegion: indirizzo.provincia ?? "",
            postalCode: indirizzo.cap ?? "",
            addressCountry: indirizzo.paese ?? "IT"
        }
        : undefined;
    const geo = (
        typeof luogo.lat === "number" &&
        typeof luogo.lng === "number"
    )
        ? {
            "@type": "GeoCoordinates",
            latitude: luogo.lat,
            longitude: luogo.lng
        }
        : undefined;
    const telephone = generale.telefono?.trim() || undefined;
    const email = generale.email?.trim() || undefined;

    const schema = {
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        name: site.name,
        description: page.description ?? "",
        url: pageUrl,
        image: CONFIG.brand?.copertina
            ? buildAbsoluteAssetUrl(site.domain, CONFIG.brand.copertina)
            : undefined,
        logo: CONFIG.brand?.logo
            ? buildAbsoluteAssetUrl(site.domain, CONFIG.brand.logo)
            : undefined,
        address,
        geo,
        telephone,
        email,
        openingHoursSpecification: buildOpeningHours(),
        sameAs: buildSameAs()
    };

    Object.keys(schema).forEach(key => {
        if (
            schema[key] === undefined ||
            schema[key] === "" ||
            (Array.isArray(schema[key]) && schema[key].length === 0)
        ) {
            delete schema[key];
        }
    });

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

function buildContactTokens() {
    const generale = CONFIG.contacts?.generale ?? {};

    return {
        "{{CONTACT_GENERALE_TELEFONO}}": generale.telefono ?? "",
        "{{CONTACT_GENERALE_EMAIL}}": generale.email ?? "",

        "{{CONTACT_SEGRETERIA_TELEFONO}}":
            CONFIG.contacts?.segreteria?.telefono ?? "",
        "{{CONTACT_SEGRETERIA_EMAIL}}":
            CONFIG.contacts?.segreteria?.email ?? "",

        "{{CONTACT_AMMINISTRAZIONE_TELEFONO}}":
            CONFIG.contacts?.amministrazione?.telefono ?? "",
        "{{CONTACT_AMMINISTRAZIONE_EMAIL}}":
            CONFIG.contacts?.amministrazione?.email ?? "",

        "{{CONTACT_PRIVACY_TELEFONO}}":
            CONFIG.contacts?.privacy?.telefono ?? "",
        "{{CONTACT_PRIVACY_EMAIL}}":
            CONFIG.contacts?.privacy?.email ?? "",

        "{{CONTACT_SAFEGUARDING_TELEFONO}}":
            CONFIG.contacts?.safeguardian?.telefono ?? "",
        "{{CONTACT_SAFEGUARDING_EMAIL}}":
            CONFIG.contacts?.safeguardian?.email ?? ""
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
        "{{OG_IMAGE}}": buildAbsoluteAssetUrl(
            site.domain,
            CONFIG.brand?.copertina
        ),
        "{{OG_IMAGE_ALT}}": site.ogImageAlt || `${site.name} - Copertina`,
        "{{FAVICON}}": buildAbsoluteAssetUrl(
            site.domain,
            CONFIG.brand?.logo
        ),
        "{{TOUCH_ICON}}": buildAbsoluteAssetUrl(
            site.domain,
            CONFIG.brand?.touchIcon
        ),
        "{{PAGE_TITLE_TAG}}": pageTitleTag,
        "{{PAGE_OG_TITLE}}": pageOgTitle,
        "{{PAGE_DESCRIPTION}}": page.description ?? "",
        "{{PAGE_URL}}": pageUrl,
        "{{ERROR_CODE}}": page.errorCode ?? "",
        "{{ERROR_KICKER}}": page.errorKicker ?? "",
        "{{ERROR_TITLE}}": page.errorTitle ?? "",
        "{{ERROR_DESCRIPTION}}": page.errorDescription ?? "",
        "{{SCHEMA_ORG_JSON}}": buildSchemaOrgJson(site, page),
        ...buildLegalTokens(),
        ...buildContactTokens()
    };
}

function applyPartials(html, pageKey) {
    let out = html;
    for (const [token, filename] of Object.entries(PARTIALS)) {
        if (!out.includes(token)) continue;

        const partialPath = path.join(PARTIALS_DIR, filename);
        if (!fs.existsSync(partialPath)) {
            console.warn(`⚠️  Pagina "${pageKey}": partial mancante ${PARTIALS_DIR}/${filename}`);
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
        return true;
    }
    return false;
}

function checkPlaceholderText(html, pageKey) {
    const patterns = [
        /\[DA CONFERMARE[^\]]*\]/gi,
        /\[DA DEFINIRE[^\]]*\]/gi,
        /\[\.\.\.\]/g
    ];
    const found = new Set();

    for (const regex of patterns) {
        const matches = html.match(regex);
        if (matches) {
            matches.forEach(match => found.add(match));
        }
    }

    if (found.size > 0) {
        console.warn(`⚠️  Pagina "${pageKey}": placeholder provvisori trovati nell'output -> ${[...found].join(", ")}`);
        return true;
    }
    return false;
}

function checkConfigPlaceholders() {
    const placeholderRegex = /\[DA CONFERMARE[^\]]*\]|\[DA DEFINIRE[^\]]*\]|\[\.\.\.\]/gi;
    const issues = [];

    function scan(value, path) {
        if (typeof value === "string") {
            const matches = value.match(placeholderRegex);
            if (matches) {
                matches.forEach(match => issues.push(`${path}: ${match}`));
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => scan(item, `${path}[${index}]`));
        } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, nested]) => scan(nested, `${path}.${key}`));
        }
    }

    scan(CONFIG, "CONFIG");

    if (issues.length > 0) {
        console.warn("⚠️  Attenzione: il file js/config.js contiene valori provvisori o placeholder:");
        issues.forEach(issue => console.warn(`   - ${issue}`));
        return true;
    }
    return false;
}

// Funzione per generare sitemap.xml e robots.txt usando il dominio da seo-data.json
function buildAuxiliaryFiles(site) {
    const siteUrl = site.domain;
    const auxFiles = ["sitemap.xml", "robots.txt"];

    for (const fileName of auxFiles) {
        const templatePath = path.join(SEO_TEMPLATES_DIR, fileName);

        if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️  File ausiliario mancante: ${SEO_TEMPLATES_DIR}/${fileName} — saltato.`);
            continue;
        }

        let content = fs.readFileSync(templatePath, "utf-8");
        content = content.split("%%SITE_URL%%").join(siteUrl);

        const outPath = path.join(OUTPUT_DIR, fileName);
        makeWritable(outPath);
        fs.writeFileSync(outPath, content, "utf-8");
        makeReadOnly(outPath);

        console.log(`✅  ${SEO_TEMPLATES_DIR}/${fileName} -> ${fileName} (aggiornato con domain: ${siteUrl})`);
    }
}

function build() {
    const { site, pages } = loadData();

    if (!Array.isArray(pages) || pages.length === 0) {
        console.warn("⚠️  Nessuna pagina definita in seo-data.json.");
        return;
    }

    const configHasPlaceholders = checkConfigPlaceholders();
    let generated = 0;
    let hasWarnings = configHasPlaceholders;

    for (const page of pages) {
        const templatePath = path.join(TEMPLATES_DIR, page.template);

        if (!fs.existsSync(templatePath)) {
            console.warn(`⚠️  Template mancante: ${TEMPLATES_DIR}/${page.template} (pagina "${page.key}") — saltata.`);
            hasWarnings = true;
            continue;
        }

        const raw = fs.readFileSync(templatePath, "utf-8");
        const withPartials = applyPartials(raw, page.key);
        const tokens = computeTokens(site, page);
        const finalHtml = applyTokens(withPartials, tokens);

        const unresolvedTokens = checkUnresolvedTokens(finalHtml, page.key);
        const placeholderIssues = checkPlaceholderText(finalHtml, page.key);
        if (unresolvedTokens || placeholderIssues) {
            hasWarnings = true;
        }

        const outPath = path.join(OUTPUT_DIR, page.output);
        makeWritable(outPath);
        fs.writeFileSync(outPath, finalHtml, "utf-8");
        makeReadOnly(outPath);
        console.log(`✅  ${TEMPLATES_DIR}/${page.template} -> ${page.output} (sola lettura)`);
        generated++;
    }

    // Genera automaticamente sitemap e robots leggendo il domain da seo-data.json
    buildAuxiliaryFiles(site);
    
    console.log(`\nFatto: ${generated} pagina/e generate su ${pages.length} definite.`);
    if (hasWarnings) {
        console.warn("⚠️  Attenzione: sono stati rilevati placeholder o token provvisori. Controlla le pagine generate prima della pubblicazione o del push.");
    }
}

build();
