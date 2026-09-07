// building/build.mjs
// Orchestratore del build: richiama i sottomoduli dedicati in building/build/.
//
// Il build integra negli HTML SOLO ciò che deve essere presente a priori nel
// file: SEO/meta, JSON-LD, struttura pagina e navigazione. Tutto il resto
// (brand, header/footer, orari, luogo, contatti, social, dati legali, team,
// annunci, pagina Chi Siamo) è caricato a runtime da data/*.json tramite
// js/data-loader.js: modificare un dato aggiorna le pagine SENZA rebuild.
//
// Sottomoduli (building/build/):
//   paths.mjs       -> percorsi e costanti condivise
//   loadData.mjs    -> caricamento dei JSON sorgente
//   validate.mjs    -> validazione dati (errore = build interrotto)
//   transforms.mjs  -> dati -> config virtuale + navigazione
//   schema.mjs      -> JSON-LD / schema.org (integrato a priori per i crawler)
//   tokens.mjs      -> calcolo dei token SEO/meta/icone/JSON-LD/navigazione
//   render.mjs      -> applicazione partial annidati e token nei template
//   checks.mjs      -> controllo token irrisolti e placeholder
//   output.mjs      -> scrittura pagine + sitemap/robots/manifest
//
// Uso:
//   node building/build.mjs
//   (oppure: npm run build)

import fs from "node:fs";
import path from "node:path";
import { TEMPLATES_DIR } from "./build/paths.mjs";
import { loadSiteData } from "./build/loadData.mjs";
import { validateData, validateContent, validateLocalAssets } from "./build/validate.mjs";
import { buildRuntimeConfig } from "./build/transforms.mjs";
import { computeTokens } from "./build/tokens.mjs";
import { applyPartials, applyTokens } from "./build/render.mjs";
import { checkUnresolvedTokens, checkPlaceholderText, checkConfigPlaceholders } from "./build/checks.mjs";
import { writePage, buildAuxiliaryFiles, buildManifestFiles } from "./build/output.mjs";

function build() {
    const {
        siteData: { site, pages },
        settings,
        contatti,
        corsi,
        team,
        annunci,
        whoweare
    } = loadSiteData();

    // 1. Validazione: un errore qui interrompe il build.
    validateData(site, pages, settings, contatti, corsi);
    validateContent(team, whoweare, annunci);
    validateLocalAssets(settings, team);

    // 2. Config "virtuale" usata solo per i token che il builder integra
    //    a priori (JSON-LD, schema.org).
    const runtimeConfig = buildRuntimeConfig({ settings, contatti, corsi, pages, annunci });

    // 3. Scansione placeholder nei dati (warning, il build prosegue).
    const hasWarnings = checkConfigPlaceholders({ site, pages, settings, contatti, corsi, personale: team, annunci, whoweare });

    // 4. Generazione pagine: template -> partial annidati -> token -> checks.
    let generated = 0;
    for (const page of pages) {
        const templatePath = path.join(TEMPLATES_DIR, page.template);

        if (!fs.existsSync(templatePath)) {
            console.warn(`!!!! Template mancante: ${TEMPLATES_DIR}/${page.template} (pagina "${page.key}") — saltata.`);
            continue;
        }

        const raw = fs.readFileSync(templatePath, "utf-8");
        const withPartials = applyPartials(raw, page.key);
        const tokens = computeTokens({ site, page, pages, runtimeConfig, settings, corsi, contatti });
        const finalHtml = applyTokens(withPartials, tokens);

        checkUnresolvedTokens(finalHtml, page.key);
        checkPlaceholderText(finalHtml, page.key);

        writePage(page, finalHtml);
        generated++;
    }

    // 5. File ausiliari: sitemap, robots, manifest PWA, browserconfig.
    buildAuxiliaryFiles(site);
    buildManifestFiles(settings);

    console.log(`\nFatto: ${generated} pagina/e generate su ${pages.length} definite.`);
    if (hasWarnings) {
        console.warn("!!!! Attenzione: sono stati rilevati placeholder o token provvisori. Controlla le pagine generate prima della pubblicazione o del push.");
    }
}

build();