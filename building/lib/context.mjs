import { getBrandLogos, resolveIconPaths } from "./brand.mjs";

export function canonicalUrl(siteUrl, output) {
    return output === "index.html" ? `${siteUrl}/` : `${siteUrl}/${output}`;
}

/**
 * Dati globali visibili in tutti i template:
 *  - un campo per ogni file di building/data/ (sito, brand, contatti, …), più
 *    corsi e social (da contenuti/) per il JSON-LD;
 *  - sito.url: dominio senza "/" finale;
 *  - brand.loghi / brand.icone: percorsi di loghi e icone già risolti;
 *  - pages: tutte le pagine (con url canonico); nav: le voci di menu in ordine.
 */
export function createSiteContext(data, pages) {
    const sito = { ...data.sito, url: String(data.sito.domain).replace(/\/+$/, "") };
    const brand = { ...data.brand, loghi: getBrandLogos(data.brand), icone: resolveIconPaths(data.brand) };
    const allPages = pages.map((page) => ({ ...page, url: canonicalUrl(sito.url, page.output) }));
    const nav = allPages
        .filter((page) => page.nav)
        .map((page) => ({ label: page.nav.label, href: `./${page.output}`, output: page.output }));

    return { ...data, sito, brand, pages: allPages, nav };
}

/** Contesto di una pagina: i dati globali più `page` (con titolo e titolo social già composti). */
export function createPageContext(site, page) {
    const titleTag = page.title ? `${site.brand.name} - ${page.title}` : site.brand.name;
    return { ...site, page: { ...page, titleTag, ogTitle: page.ogTitle || titleTag } };
}
