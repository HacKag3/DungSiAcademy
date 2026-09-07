// building/build/tokens.mjs
// Calcolo dei token sostituiti nei template: SEO/meta (head-common),
// icone (partial icons.html), JSON-LD (partial jsonLD.html),
// navigazione inline (#navigation-data in head-pages) e schema.org.

import { buildAbsoluteAssetUrl, buildSchemaOrgJson } from "./schema.mjs";
import { buildNavigation } from "./transforms.mjs";
import { THEME_COLOR_DEFAULT } from "./paths.mjs";

// Token per il partial icons.html: i path arrivano da data/settings.json
// (brand.logo.paths).
function buildIconTokens(settings) {
    const paths = settings.brand?.logo?.paths ?? {};
    const themeColor = settings.brand?.themeColor || THEME_COLOR_DEFAULT;
    return {
        "{{ICON_FAVICON_48}}": paths.favicon?.["48"] ?? "",
        "{{ICON_FAVICON_32}}": paths.favicon?.["32"] ?? "",
        "{{ICON_FAVICON_16}}": paths.favicon?.["16"] ?? "",
        "{{ICON_FAVICON_ICO}}": paths.favicon?.ico ?? "",
        "{{ICON_APPLE_180}}": paths.apple?.["180"] ?? "",
        "{{ICON_APPLE_152}}": paths.apple?.["152"] ?? "",
        "{{ICON_APPLE_120}}": paths.apple?.["120"] ?? "",
        "{{MANIFEST_PATH}}": paths.manifest ?? "/site.webmanifest",
        "{{BROWSERCONFIG_PATH}}": paths.browserconfig ?? "/browserconfig.xml",
        "{{THEME_COLOR}}": themeColor
    };
}

// Token del partial jsonLD.html: i valori devono essere stringhe JSON
// (con apici) perché finiscono dentro uno script ld+json. Attenzione:
// "{{DESCRIPTION}}" è già racchiuso tra virgolette nel partial, quindi
// vuole la stringa grezza e non JSON.stringify().
function buildJsonLDTokens(site, settings, corsi, contatti) {
    const brand = settings.brand ?? {};
    const paths = brand.logo?.paths ?? {};
    const indirizzo = corsi.luogo?.indirizzo ?? {};
    const via = [indirizzo.via, indirizzo.numero].filter(Boolean).join(" ");
    const socials = (contatti.social ?? [])
        .map(s => s.url)
        .filter(url => url && !url.includes("..."));

    return {
        "{{BRAND_NAME}}": JSON.stringify(brand.name ?? ""),
        "{{DOMAIN}}": JSON.stringify(site.domain),
        "{{ICON_ANDROID_512}}": JSON.stringify(
            buildAbsoluteAssetUrl(site.domain, paths.android?.["512"])
        ),
        "{{DESCRIPTION}}": brand.descrizione ?? "",
        "{{INDIRIZZO}}": JSON.stringify(via),
        "{{COMUNE}}": JSON.stringify(indirizzo.citta ?? ""),
        "{{PROVINCIA}}": JSON.stringify(Array.isArray(indirizzo.provincia) ? (indirizzo.provincia[0] ?? "") : (indirizzo.provincia ?? "")),
        "{{CAP}}": JSON.stringify(indirizzo.cap ?? ""),
        "{{COUNTRY}}": JSON.stringify(indirizzo.paese ?? "IT"),
        "{{SOCIALS}}": socials.map(url => JSON.stringify(url)).join(", ")
    };
}

// Navigazione iniettata in ogni pagina come JSON inline (#navigation-data):
// è struttura del sito, quindi "a priori" (aggiungere una pagina richiede build).
function buildNavigationJson(pages) {
    const nav = buildNavigation(pages);
    return `<script type="application/json" id="navigation-data">${JSON.stringify(nav)}</script>`;
}

export function computeTokens({ site, page, pages, runtimeConfig, settings, corsi, contatti }) {
    const brand = settings.brand ?? {};
    const brandName = brand.name ?? "";
    const copertina = brand.copertina ?? {};
    const pageTitleTag = page.title ? `${brandName} - ${page.title}` : brandName;
    const pageOgTitle = page.ogTitle || pageTitleTag;
    const pageUrl = `${site.domain}/${page.output}`;

    return {
        "{{SITE_NAME}}": brandName,
        "{{SITE_LOCALE}}": site.locale ?? "",
        "{{SITE_DOMAIN}}": site.domain,
        "{{AUTHOR}}": site.author ?? "",
        "{{COPERTINA_PATH}}": copertina.path ?? "",
        "{{COPERTINA_WIDTH}}": copertina.width ?? "",
        "{{COPERTINA_HEIGHT}}": copertina.height ?? "",
        "{{COPERTINA_ALT}}": copertina.alt ?? "",
        "{{PAGE_TITLE_TAG}}": pageTitleTag,
        "{{PAGE_OG_TITLE}}": pageOgTitle,
        "{{PAGE_DESCRIPTION}}": page.description ?? "",
        "{{PAGE_URL}}": pageUrl,
        "{{ERROR_CODE}}": page.errorCode ?? "",
        "{{ERROR_KICKER}}": page.errorKicker ?? "",
        "{{ERROR_TITLE}}": page.errorTitle ?? "",
        "{{ERROR_DESCRIPTION}}": page.errorDescription ?? "",
        ...buildIconTokens(settings),
        ...buildJsonLDTokens(site, settings, corsi, contatti),
        "{{SCHEMA_ORG_JSON}}": buildSchemaOrgJson(site, page, runtimeConfig),
        "{{NAVIGATION_DATA}}": buildNavigationJson(pages)
    };
}