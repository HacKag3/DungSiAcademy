const PLACEHOLDER_PATTERN = /\[DA CONFERMARE[^\]]*\]|\[DA DEFINIRE[^\]]*\]|\[\.\.\.\]/gi;

export function checkUnresolvedTokens(html, pageKey) {
    const leftover = html.match(/\{\{[A-Z_0-9]+\}\}/g);
    if (leftover) {
        console.warn(`!!!! Pagina "${pageKey}": token non risolti rimasti nell'output -> ${[...new Set(leftover)].join(", ")}`);
        return true;
    }
    return false;
}

function validateSchemaOrgJsonLd(html, pageKey) {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const pageName = String(pageKey ?? "");
    const isHome = pageName === "index";
    
    if (blocks.length === 0) {
        if (!isHome) return false;
        console.warn(`!!!! Pagina "${pageKey}": nessun blocco JSON-LD trovato nell'output.`);
        return true;
    }
    if (blocks.length > 1) {
        console.warn(`!!!! Pagina "${pageKey}": trovati ${blocks.length} blocchi JSON-LD (atteso 1 unico blocco).`);
        return true;
    }
    try {
        const parsed = JSON.parse(blocks[0][1]);
        if (!parsed || parsed["@context"] !== "https://schema.org" || !Array.isArray(parsed["@graph"])) {
            console.warn(`!!!! Pagina "${pageKey}": JSON-LD non conforme (atteso unico oggetto @graph della home).`);
            return true;
        }
        const types = parsed["@graph"].map(node => node?.["@type"]).filter(Boolean);
        const ids = parsed["@graph"].map(node => node?.["@id"]).filter(Boolean);
        if (new Set(ids).size !== ids.length) {
            console.warn(`!!!! Pagina "${pageKey}": JSON-LD con @id duplicati -> ${ids.join(", ")}.`);
            return true;
        }
        const hasOrg = types.includes("SportsActivityLocation");
        if (!hasOrg) {
            console.warn(`!!!! Pagina "${pageKey}": JSON-LD incompleto (trovati: ${types.join(", ") || "nessuno"}; attesa la sede SportsActivityLocation della home).`);
            return true;
        }
        if (!isHome) {
            console.warn(`!!!! Pagina "${pageKey}": JSON-LD presente fuori dalla home (atteso solo in index).`);
            return true;
        }
    } catch (err) {
        console.warn(`!!!! Pagina "${pageKey}": JSON-LD non valido (${err.message}).`);
        return true;
    }
    return false;
}

function validateSeoHead(html, pageKey) {
    if (/noindex/i.test(html)) return false;
    let failed = false;
    const mustContain = [
        '<meta name="description"',
        '<link rel="canonical"',
        '<meta property="og:title"',
        '<meta property="og:description"',
        '<meta property="og:image"',
        '<meta property="og:url"',
        '<meta name="twitter:card"'
    ];
    for (const needle of mustContain) {
        if (!html.includes(needle)) {
            console.warn(`!!!! Pagina "${pageKey}": tag SEO mancante -> ${needle}.`);
            failed = true;
        }
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)" \/>/);
    if (canonical && /\/index\.html\/?$/i.test(canonical[1])) {
        console.warn(`!!!! Pagina "${pageKey}": canonical punta a /index.html invece che alla root (/) -> ${canonical[1]}.`);
        failed = true;
    }
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)">/);
    if (ogImage && ogImage[1] && !/^https?:\/\//i.test(ogImage[1])) {
        console.warn(`!!!! Pagina "${pageKey}": og:image non assoluto -> ${ogImage[1]}.`);
        failed = true;
    }
    const twitterImage = html.match(/<meta name="twitter:image" content="([^"]*)">/);
    if (twitterImage && twitterImage[1] && !/^https?:\/\//i.test(twitterImage[1])) {
        console.warn(`!!!! Pagina "${pageKey}": twitter:image non assoluto -> ${twitterImage[1]}.`);
        failed = true;
    }
    return failed;
}

export function checkSeoOutput(html, pageKey) {
    return validateSchemaOrgJsonLd(html, pageKey) || validateSeoHead(html, pageKey);
}

export function checkPlaceholderText(html, pageKey) {
    const found = new Set(html.match(PLACEHOLDER_PATTERN) ?? []);

    if (found.size > 0) {
        console.warn(`!!!! Pagina "${pageKey}": placeholder provvisori trovati nell'output -> ${[...found].join(", ")}`);
        return true;
    }
    return false;
}

export function checkConfigPlaceholders(config) {
    const issues = [];

    function scan(value, pathLabel) {
        if (typeof value === "string") {
            const matches = value.match(PLACEHOLDER_PATTERN);
            if (matches) {
                matches.forEach(match => issues.push(`${pathLabel}: ${match}`));
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => scan(item, `${pathLabel}[${index}]`));
        } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, nested]) => scan(nested, `${pathLabel}.${key}`));
        }
    }

    scan(config, "dati");

    if (issues.length > 0) {
        console.warn("!!!! Attenzione: i file dati contengono valori provvisori o placeholder:");
        issues.forEach(issue => console.warn(`   - ${issue}`));
        return true;
    }
    return false;
}
