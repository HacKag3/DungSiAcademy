import { GIORNI_IT_EN } from "./paths.mjs";

export function buildAbsoluteAssetUrl(siteDomain, assetPath) {
    if (!assetPath) return "";

    if (/^https?:\/\//i.test(assetPath)) {
        return assetPath;
    }

    const cleanDomain = String(siteDomain ?? "").replace(/\/+$/, "");
    const cleanPath = String(assetPath).replace(/^\.?\/+/, "");
    return `${cleanDomain}/${cleanPath}`;
}

export function buildCanonicalPageUrl(siteDomain, pageOutput) {
    const cleanDomain = String(siteDomain ?? "").replace(/\/+$/, "");
    if (!pageOutput || pageOutput === "index.html") {
        return `${cleanDomain}/`;
    }
    const cleanOutput = String(pageOutput).replace(/^\/+/, "");
    return `${cleanDomain}/${cleanOutput}`;
}

function isPlaceholderContactValue(value) {
    if (!value) return true;
    const v = String(value).trim();
    if (!v) return true;
    return (
        v.includes("...") ||
        v.includes("[DA CONFERMARE") ||
        v.includes("[DA DEFINIRE") ||
        /telefono/i.test(v) ||
        /email@email/i.test(v) ||
        v === "+39" ||
        v === "@..."
    );
}

function cleanContactValue(value) {
    if (isPlaceholderContactValue(value)) return undefined;
    return String(value).trim();
}

function buildOpeningHours(config) {
    const seen = new Set();
    const specs = [];

    for (const disciplina of Object.values(config.discipline ?? {})) {
        for (const categoria of Object.values(disciplina.orari ?? {})) {
            for (const { giorno, ora } of categoria.giorni ?? []) {
                const dayOfWeek = GIORNI_IT_EN[giorno];
                const [opens, closes] = (ora || "").split("-").map(s => s.trim());

                if (!dayOfWeek || !opens || !closes) continue;

                const dedupeKey = `${dayOfWeek}|${opens}|${closes}`;
                if (seen.has(dedupeKey)) continue;
                seen.add(dedupeKey);

                specs.push({
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [dayOfWeek],
                    opens,
                    closes
                });
            }
        }
    }
    return specs;
}

function buildSameAs(config) {
    return (config.social ?? [])
        .map(s => s.url)
        .filter(url => url && !url.includes("...") && !url.includes("[DA "));
}

function pruneEmpty(value) {
    if (Array.isArray(value)) {
        const cleaned = value.map(pruneEmpty).filter(v => v !== undefined);
        return cleaned.length > 0 ? cleaned : undefined;
    }
    if (value && typeof value === "object") {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
            const cleaned = pruneEmpty(nested);
            if (cleaned !== undefined && cleaned !== "") {
                out[key] = cleaned;
            }
        }
        return Object.keys(out).length > 0 ? out : undefined;
    }
    if (value === undefined || value === "") return undefined;
    return value;
}

export function buildSchemaFragments(site, page, config) {
    const luogo = config.luogo ?? {};
    const indirizzo = luogo.indirizzo ?? {};
    const generale = config.contacts?.generale ?? {};
    const copertina = config.brand?.copertina ?? {};
    const cleanDomain = String(site.domain ?? "").replace(/\/+$/, "");
    const pageUrl = buildCanonicalPageUrl(site.domain, page.output);
    const isHome = !page.output || page.output === "index.html";

    const address = pruneEmpty({
        "@type": "PostalAddress",
        streetAddress: `${indirizzo.via ?? ""}${indirizzo.numero ? ` ${indirizzo.numero}` : ""}`.trim(),
        addressLocality: indirizzo.citta ?? "",
        addressRegion: indirizzo.provincia ?? "",
        postalCode: indirizzo.cap ?? "",
        addressCountry: indirizzo.paese ?? "IT"
    }) ?? null;
    const geo = (
        typeof luogo.lat === "number" &&
        typeof luogo.lng === "number"
    )
        ? {
            "@type": "GeoCoordinates",
            latitude: luogo.lat,
            longitude: luogo.lng
        }
        : null;

    const telephone = cleanContactValue(generale.telefono);
    const email = cleanContactValue(generale.email);
    const contactLines = [
        telephone ? `                "telephone": ${JSON.stringify(telephone)},` : "",
        email ? `                "email": ${JSON.stringify(email)},` : ""
    ].filter(Boolean).join("\n");

    const breadcrumbItems = isHome
        ? [{ "@type": "ListItem", position: 1, name: "Home", item: pageUrl }]
        : [
            { "@type": "ListItem", position: 1, name: "Home", item: `${cleanDomain}/` },
            { "@type": "ListItem", position: 2, name: page.navLabel || page.title || page.ogTitle || "Pagina", item: pageUrl }
        ];

    const logoUrl = config.brand?.logoPng
        ? buildAbsoluteAssetUrl(site.domain, config.brand.logoPng)
        : "";
    const imageUrl = copertina.path
        ? buildAbsoluteAssetUrl(site.domain, copertina.path)
        : "";

    return {
        "{{SCHEMA_LOGO}}": logoUrl,
        "{{SCHEMA_IMAGE}}": imageUrl,
        "{{SCHEMA_ADDRESS_JSON}}": JSON.stringify(address, null, 4),
        "{{SCHEMA_GEO_JSON}}": JSON.stringify(geo, null, 4),
        "{{SCHEMA_CONTACT_LINES}}": contactLines ? `${contactLines}\n` : "",
        "{{SCHEMA_HOURS_JSON}}": JSON.stringify(buildOpeningHours(config), null, 4),
        "{{SCHEMA_SAMEAS_JSON}}": JSON.stringify(buildSameAs(config), null, 4),
        "{{SCHEMA_BREADCRUMB_JSON}}": JSON.stringify({ "@type": "BreadcrumbList", itemListElement: breadcrumbItems }, null, 4)
    };
}
