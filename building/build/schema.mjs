// building/build/schema.mjs
// Costruzione del blocco schema.org (JSON-LD) integrato a priori nella
// pagina index: deve essere presente nell'HTML per i crawler.

import { GIORNI_IT_EN } from "./paths.mjs";

export function buildAbsoluteAssetUrl(siteDomain, assetPath) {
    if (!assetPath) return "";

    if (/^https?:\/\//i.test(assetPath)) {
        return assetPath;
    }

    const cleanPath = assetPath.replace(/^\.?\//, "");
    return `${siteDomain}/${cleanPath}`;
}

function buildOpeningHours(config) {
    const specs = [];

    for (const disciplina of Object.values(config.discipline ?? {})) {
        for (const categoria of Object.values(disciplina.orari ?? {})) {
            for (const { giorno, ora } of categoria.giorni ?? []) {
                const dayOfWeek = GIORNI_IT_EN[giorno];
                const [opens, closes] = (ora || "").split("-").map(s => s.trim());

                if (!dayOfWeek || !opens || !closes) continue;

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
        .filter(url => url && !url.includes("..."));
}

export function buildSchemaOrgJson(site, page, config) {
    const luogo = config.luogo ?? {};
    const indirizzo = luogo.indirizzo ?? {};
    const generale = config.contacts?.generale ?? {};
    const copertina = config.brand?.copertina ?? {};
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
        name: config.brand?.name,
        description: page.description ?? "",
        url: pageUrl,
        image: copertina.path
            ? buildAbsoluteAssetUrl(site.domain, copertina.path)
            : undefined,
        logo: config.brand?.logo
            ? buildAbsoluteAssetUrl(site.domain, config.brand.logo)
            : undefined,
        address,
        geo,
        telephone,
        email,
        openingHoursSpecification: buildOpeningHours(config),
        sameAs: buildSameAs(config)
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