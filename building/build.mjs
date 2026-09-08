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

    validateData(site, pages, settings, contatti, corsi);
    validateContent(team, whoweare, annunci);
    validateLocalAssets(settings, team);

    const runtimeConfig = buildRuntimeConfig({ settings, contatti, corsi });

    const hasWarnings = checkConfigPlaceholders({ site, pages, settings, contatti, corsi, personale: team, annunci, whoweare });

    let generated = 0;
    for (const page of pages) {
        const templatePath = path.join(TEMPLATES_DIR, page.template);

        if (!fs.existsSync(templatePath)) {
            console.warn(`!!!! Template mancante: ${TEMPLATES_DIR}/${page.template} (pagina "${page.key}") — saltata.`);
            continue;
        }

        const raw = fs.readFileSync(templatePath, "utf-8");
        const withPartials = applyPartials(raw);

        const withSchema = withPartials.includes("{{SCHEMA_ORG_JSON}}")
            || withPartials.includes("{{BRAND_NAME}}");

        const tokens = computeTokens({ site, page, pages, runtimeConfig, settings, corsi, contatti, withSchema });
        const finalHtml = applyTokens(withPartials, tokens);

        checkUnresolvedTokens(finalHtml, page.key);
        checkPlaceholderText(finalHtml, page.key);

        writePage(page, finalHtml);
        generated++;
    }

    buildAuxiliaryFiles(site);
    buildManifestFiles(settings);

    console.log(`\nFatto: ${generated} pagina/e generate su ${pages.length} definite.`);
    if (hasWarnings) {
        console.warn("!!!! Attenzione: sono stati rilevati placeholder o token provvisori. Controlla le pagine generate prima della pubblicazione o del push.");
    }
}

build();
