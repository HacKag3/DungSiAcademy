/**
 * Controlli sull'output generato: non interrompono il build ma segnalano
 * problemi da sistemare prima della pubblicazione.
 */
const PLACEHOLDER_PATTERN = /\[DA CONFERMARE[^\]]*\]|\[DA DEFINIRE[^\]]*\]|\[\.\.\.\]/gi;
const SEO_TAGS = [
    '<meta name="description"',
    '<link rel="canonical"',
    '<meta property="og:title"',
    '<meta property="og:description"',
    '<meta property="og:image"',
    '<meta property="og:url"',
    '<meta name="twitter:card"'
];

function warn(page, message) {
    console.warn(`!!!! Pagina "${page.output}": ${message}`);
    return true;
}

/** Controlla una pagina generata; restituisce true se ci sono avvisi. */
export function checkPage(html, page) {
    let warned = false;

    const leftover = html.match(/\{\{[^}]*\}\}/g);
    if (leftover) warned = warn(page, `tag di template rimasti nell'output -> ${[...new Set(leftover)].join(", ")}`);

    const placeholders = new Set(html.match(PLACEHOLDER_PATTERN) ?? []);
    if (placeholders.size > 0) warned = warn(page, `placeholder provvisori nell'output -> ${[...placeholders].join(", ")}`);

    const jsonLdWarned = checkJsonLd(html, page);
    const seoWarned = checkSeoHead(html, page);
    return warned || jsonLdWarned || seoWarned;
}

function checkJsonLd(html, page) {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const isHome = page.output === "index.html";

    if (blocks.length === 0) return isHome ? warn(page, "nessun blocco JSON-LD (atteso nella home).") : false;
    if (!isHome) return warn(page, "JSON-LD presente fuori dalla home.");
    if (blocks.length > 1) return warn(page, `trovati ${blocks.length} blocchi JSON-LD (atteso 1).`);

    try {
        const parsed = JSON.parse(blocks[0][1]);
        const graph = parsed?.["@graph"];
        if (parsed?.["@context"] !== "https://schema.org" || !Array.isArray(graph)) {
            return warn(page, "JSON-LD non conforme (atteso un oggetto @graph).");
        }
        const ids = graph.map((node) => node?.["@id"]).filter(Boolean);
        if (new Set(ids).size !== ids.length) return warn(page, `JSON-LD con @id duplicati -> ${ids.join(", ")}.`);
        if (!graph.some((node) => node?.["@type"] === "SportsActivityLocation")) {
            return warn(page, "JSON-LD senza la sede (SportsActivityLocation).");
        }
    } catch (err) {
        return warn(page, `JSON-LD non valido (${err.message}).`);
    }
    return false;
}

function checkSeoHead(html, page) {
    if (/<meta name="robots" content="noindex/i.test(html)) return false;
    let warned = false;

    for (const tag of SEO_TAGS.filter((needle) => !html.includes(needle))) {
        warned = warn(page, `tag SEO mancante -> ${tag}.`);
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (canonical && /\/index\.html\/?$/i.test(canonical)) {
        warned = warn(page, `canonical punta a /index.html invece che alla root (/) -> ${canonical}.`);
    }
    for (const property of ["og:image", "twitter:image"]) {
        const value = html.match(new RegExp(`<meta (?:property|name)="${property}" content="([^"]*)">`))?.[1];
        if (value && !/^https?:\/\//i.test(value)) warned = warn(page, `${property} non assoluto -> ${value}.`);
    }
    return warned;
}

/** Elenca i valori provvisori ([DA CONFERMARE], …) dei file dati ({ percorso: contenuto }); true se ce ne sono. */
export function reportPlaceholders(files) {
    const issues = [];
    const scan = (value, trail) => {
        if (typeof value === "string") {
            for (const match of value.match(PLACEHOLDER_PATTERN) ?? []) issues.push(`${trail}: ${match}`);
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => scan(item, `${trail}[${index}]`));
        } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, nested]) => scan(nested, `${trail}.${key}`));
        }
    };
    Object.entries(files).forEach(([file, value]) => scan(value, file));

    if (issues.length === 0) return false;
    console.warn("!!!! I file dati contengono valori provvisori:");
    issues.forEach((issue) => console.warn(`   - ${issue}`));
    return true;
}
