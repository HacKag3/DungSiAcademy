import fs from "node:fs";
import path from "node:path";
import { buildSchemaFragments, buildCanonicalPageUrl, buildAbsoluteAssetUrl } from "./schema.mjs";
import { buildPageHtml } from "./transforms.mjs";
import { PARTIALS_DIR, THEME_COLOR_DEFAULT } from "./paths.mjs";

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

const jsonLdPartialCache = new Map();
function readJsonLdPartial(fileName) {
    if (!jsonLdPartialCache.has(fileName)) {
        const fullPath = path.join(PARTIALS_DIR, fileName);
        if (!fs.existsSync(fullPath)) {
            console.warn(`!!!! Partial JSON-LD mancante: ${fullPath}`);
            jsonLdPartialCache.set(fileName, "");
        } else {
            jsonLdPartialCache.set(fileName, fs.readFileSync(fullPath, "utf-8"));
        }
    }
    return jsonLdPartialCache.get(fileName);
}

function buildJsonLdHomeBlock(site, page) {
    const isHome = !page.output || page.output === "index.html";
    if (!isHome) return "";
    return readJsonLdPartial("json-ld-home.html");
}

export function computeTokens({ site, page, pages, runtimeConfig, settings, contatti, corsi, team, whoweare }) {
    const brand = settings.brand ?? {};
    const brandName = brand.name ?? "";
    const copertina = brand.copertina ?? {};
    const pageTitleTag = page.title ? `${brandName} - ${page.title}` : brandName;
    const pageOgTitle = page.ogTitle || (page.output === "index.html" ? "DŨNG SĨ Academy - Arti Marziali e Difesa Personale ad Arcole (VR)" : pageTitleTag);
    const pageUrl = buildCanonicalPageUrl(site.domain, page.output);
    const ogImage = copertina.path ? buildAbsoluteAssetUrl(site.domain, copertina.path) : "";
    const pageHtml = buildPageHtml({ page, pages, settings, contatti, corsi, team, whoweare });

    return {
        "{{SITE_NAME}}": brandName,
        "{{SITE_LOCALE}}": site.locale ?? "",
        "{{SITE_DOMAIN}}": site.domain,
        "{{AUTHOR}}": site.author ?? "",
        "{{BRAND_LOGO_OG}}": (settings.brand?.logo?.paths?.og ?? "/media/loghi/DungSi.svg"),
        "{{HOME_URL}}": "./index.html",
        "{{COPERTINA_PATH}}": ogImage,
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
        ...buildSchemaFragments(site, page, runtimeConfig),
        "{{JSON_LD_HOME}}": buildJsonLdHomeBlock(site, page),
        "{{HEADER_INNER}}": pageHtml.headerInner,
        "{{BURGER}}": pageHtml.burger,
        "{{DEV_ALERT}}": pageHtml.devAlert,
        "{{FOOTER_CONTENT}}": pageHtml.footer,
        "{{ORARI_CONTENT}}": pageHtml.orari,
        "{{LUOGO_CONTENT}}": pageHtml.luogo,
        "{{CONTACTS_CONTENT}}": pageHtml.contacts,
        "{{WHOWEARE_CONTENT}}": pageHtml.whoweare
    };
}
