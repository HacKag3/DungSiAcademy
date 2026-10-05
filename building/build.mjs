/**
 * Build del sito (npm run build).
 *
 * Legge i dati (building/data), le pagine (building/pages), i layout e i
 * componenti, e scrive in root il sito finito: pagine html e file ausiliari
 * (building/files). CSS, JS e media restano in root e non passano dal build.
 */
import fs from "node:fs";
import path from "node:path";
import { BUILDING_DIR, COMPONENTS_DIR, FILES_DIR, LAYOUTS_DIR, PAGES_DIR } from "./lib/paths.mjs";
import { loadData, loadRuntimeData } from "./lib/data.mjs";
import { loadPages } from "./lib/pages.mjs";
import { validate } from "./lib/validate.mjs";
import { createPageContext, createSiteContext } from "./lib/context.mjs";
import { TemplateEngine, escapeHtml } from "./lib/template.mjs";
import { checkPage, reportPlaceholders } from "./lib/checks.mjs";
import { writeOutput } from "./lib/output.mjs";

// I file di testo semplice (robots.txt) non vogliono l'escape HTML dei {{campi}}.
const escapeFor = (fileName) => (path.extname(fileName) === ".txt" ? String : escapeHtml);

async function build() {
    const data = loadData();
    const pages = loadPages();
    const runtime = loadRuntimeData();
    validate(data, pages, runtime);

    // contatti, corsi e social servono solo al JSON-LD della home: sul sito sono letti a runtime.
    const { contatti, corsi, social } = runtime;
    const site = createSiteContext({ ...data, contatti, corsi, social }, pages);
    const engine = new TemplateEngine({ baseDir: BUILDING_DIR, componentsDir: COMPONENTS_DIR });
    await engine.loadModels([LAYOUTS_DIR, COMPONENTS_DIR, PAGES_DIR, FILES_DIR]);

    const labelled = (dir, files) => Object.entries(files).map(([key, value]) => [`${dir}/${key}.json`, value]);
    let hasWarnings = reportPlaceholders(Object.fromEntries([
        ...labelled("data", data),
        ...labelled("contenuti", runtime)
    ]));

    for (const page of site.pages) {
        const context = createPageContext(site, page);
        const content = engine.render(page.template, context);
        const html = engine.render(page.layout, { ...context, content });
        hasWarnings = checkPage(html, page) || hasWarnings;
        writeOutput(page.output, html, `pages/${page.folder}`);
    }

    const files = fs.readdirSync(FILES_DIR).filter((name) => !name.endsWith(".mjs")).sort();
    for (const fileName of files) {
        const content = engine.render(path.join(FILES_DIR, fileName), site, { escape: escapeFor(fileName) });
        writeOutput(fileName, content, `files/${fileName}`);
    }

    for (const warning of engine.warnings) console.warn(`!!!! Template ${warning}`);
    hasWarnings = hasWarnings || engine.warnings.length > 0;

    console.log(`\nFatto: ${site.pages.length} pagine e ${files.length} file ausiliari generati.`);
    if (hasWarnings) {
        console.warn("!!!! Attenzione: ci sono avvisi o valori provvisori. Controlla prima della pubblicazione.");
    }
}

build().catch((err) => {
    console.error(`\n❌ Build interrotto: ${err.message}`);
    process.exit(1);
});
