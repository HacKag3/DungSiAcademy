// building/build/output.mjs
// Scrittura dei file generati (pagine HTML, sitemap, robots, manifest)
// con protezione "sola lettura" per scoraggiare modifiche manuali
// (vanno editati i template, non gli output).

import fs from "node:fs";
import path from "node:path";
import { OUTPUT_DIR, SEO_TEMPLATES_DIR, THEME_COLOR_DEFAULT } from "./paths.mjs";

// Toglie il flag "sola lettura" se il file esiste già.
function makeWritable(filePath) {
    if (!fs.existsSync(filePath)) return;
    try {
        fs.chmodSync(filePath, 0o644);
    } catch (err) {
        console.warn(`!!!! Non riesco a rendere scrivibile ${filePath}: ${err.message}`);
    }
}

// Imposta il file come sola lettura.
function makeReadOnly(filePath) {
    try {
        fs.chmodSync(filePath, 0o444);
    } catch (err) {
        console.warn(`!!!! Non riesco a impostare ${filePath} come sola lettura: ${err.message}`);
    }
}

export function writeGeneratedFile(fileName, content, logLabel) {
    const outPath = path.join(OUTPUT_DIR, fileName);
    makeWritable(outPath);
    fs.writeFileSync(outPath, content, "utf-8");
    makeReadOnly(outPath);
    console.log(`V ${logLabel ?? fileName} (sola lettura)`);
    return outPath;
}

export function writePage(page, finalHtml) {
    return writeGeneratedFile(page.output, finalHtml, `pages_template -> ${page.output}`);
}

// Genera sitemap.xml e robots.txt usando il dominio da building/data/seo-data.json.
export function buildAuxiliaryFiles(site) {
    const siteUrl = site.domain;
    const auxFiles = ["sitemap.xml", "robots.txt"];

    for (const fileName of auxFiles) {
        const templatePath = path.join(SEO_TEMPLATES_DIR, fileName);

        if (!fs.existsSync(templatePath)) {
            console.warn(`!!!! File ausiliario mancante: ${SEO_TEMPLATES_DIR}/${fileName} — saltato.`);
            continue;
        }

        let content = fs.readFileSync(templatePath, "utf-8");
        content = content.split("%%SITE_URL%%").join(siteUrl);

        writeGeneratedFile(fileName, content, `seo/${fileName} (aggiornato con domain: ${siteUrl})`);
    }
}

// Genera site.webmanifest e browserconfig.xml usando i path delle icone
// presenti in data/settings.json (brand.logo.paths), referenziati dal head.
export function buildManifestFiles(settings) {
    const brand = settings.brand ?? {};
    const paths = brand.logo?.paths ?? {};
    const themeColor = brand.themeColor || THEME_COLOR_DEFAULT;

    const manifest = {
        name: brand.name ?? "",
        short_name: brand.name ?? "",
        description: brand.descrizione ?? "",
        start_url: "/index.html",
        display: "standalone",
        background_color: "#0E0E10",
        theme_color: themeColor,
        icons: [
            { src: paths.android?.["192"], sizes: "192x192", type: "image/png" },
            { src: paths.android?.["512"], sizes: "512x512", type: "image/png" }
        ].filter(icon => icon.src)
    };

    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/media/loghi/icons/windows/mstile-150x150.png"/>
            <TileColor>${themeColor}</TileColor>
        </tile>
    </msapplication>
</browserconfig>
`;

    writeGeneratedFile("site.webmanifest", JSON.stringify(manifest, null, 4), "site.webmanifest (generato dalle icone in data/settings.json)");
    writeGeneratedFile("browserconfig.xml", browserconfig, "browserconfig.xml (generato dalle icone in data/settings.json)");
}