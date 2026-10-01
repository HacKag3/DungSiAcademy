import fs from "node:fs";
import path from "node:path";
import { CSS_DIR, JS_DIR, LAYOUTS_DIR, PAGES_DIR } from "./paths.mjs";
import { readJson } from "./data.mjs";

const SITEMAP_DEFAULT = { priority: "0.5", changefreq: "monthly" };

/**
 * Ogni cartella building/pages/<nome>/ descrive una o più pagine in <nome>.json:
 *  - un oggetto per una pagina sola;
 *  - { "defaults": {…}, "pages": [ … ] } per più pagine con parti in comune.
 * Le cartelle che iniziano con "_" (es. _modello) vengono ignorate.
 *
 * CSS e JS della pagina si collegano da soli se esistono:
 * css/pages/<nome>/<nome>.css e js/pages/<nome>/<nome>.js.
 */
export function loadPages() {
    const folders = fs.readdirSync(PAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
        .map((entry) => entry.name)
        .sort();

    const pages = folders.flatMap((folder) => {
        const configPath = path.join(PAGES_DIR, folder, `${folder}.json`);
        const config = readJson(configPath);
        const entries = Array.isArray(config.pages)
            ? config.pages.map((page) => ({ ...config.defaults, ...page }))
            : [config];
        return entries.map((entry) => normalizePage(entry, folder));
    });

    // Prima le voci di menu (in ordine), poi le altre pagine per nome del file.
    return pages.sort((a, b) =>
        (a.nav ? a.nav.order : Infinity) - (b.nav ? b.nav.order : Infinity)
        || a.output.localeCompare(b.output));
}

function normalizePage(entry, folder) {
    const { template, layout, base, sitemap, nav, ...rest } = entry;
    const pageBase = base ?? "./";
    const asset = (dir, ext) => {
        const file = path.join(dir, "pages", folder, `${folder}.${ext}`);
        return fs.existsSync(file) ? `${pageBase}${ext}/pages/${folder}/${folder}.${ext}` : null;
    };

    return {
        ...rest,
        folder,
        key: path.basename(String(rest.output ?? ""), ".html"),
        template: path.join(PAGES_DIR, folder, template ?? `${folder}.html`),
        layout: path.join(LAYOUTS_DIR, `${layout ?? "base"}.html`),
        base: pageBase,
        nav: nav ? { label: nav.label ?? rest.title, order: nav.order ?? 0 } : null,
        sitemap: sitemap === false ? false : { ...SITEMAP_DEFAULT, ...sitemap },
        css: asset(CSS_DIR, "css"),
        js: asset(JS_DIR, "js")
    };
}
