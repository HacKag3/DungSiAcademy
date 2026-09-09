import fs from "node:fs";
import path from "node:path";
import { OUTPUT_DIR, SEO_TEMPLATES_DIR, THEME_COLOR_DEFAULT } from "./paths.mjs";
import { formatHtml, formatJson, formatText, formatXml } from "./format.mjs";

function makeWritable(filePath) {
    if (!fs.existsSync(filePath)) return;
    try {
        fs.chmodSync(filePath, 0o644);
    } catch (err) {
        console.warn(`!!!! Non riesco a rendere scrivibile ${filePath}: ${err.message}`);
    }
}

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
    return writeGeneratedFile(page.output, formatHtml(finalHtml), `pages_template -> ${page.output}`);
}

export function buildAuxiliaryFiles(site, pages) {
    const siteUrl = String(site.domain ?? "").replace(/\/+$/, "");
    const indexablePages = (pages ?? []).filter(page => !page.errorCode);

    const today = new Date().toISOString().slice(0, 10);
    const priorityOf = (output) => {
        if (output === "index.html") return "1.0";
        if (output === "whoweare.html" || output === "contacts.html") return "0.8";
        return "0.5";
    };
    const changefreqOf = (output) => {
        if (output === "index.html") return "weekly";
        return "monthly";
    };
    const urlEntries = indexablePages.map(page => {
        const loc = page.output === "index.html" ? `${siteUrl}/` : `${siteUrl}/${page.output}`;
        return `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${today}</lastmod>\n        <changefreq>${changefreqOf(page.output)}</changefreq>\n        <priority>${priorityOf(page.output)}</priority>\n    </url>`;
    }).join("\n\n");

    const sitemap = formatXml(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n\n${urlEntries}\n\n</urlset>`);
    writeGeneratedFile("sitemap.xml", sitemap, `sitemap.xml (generata da seo-data.json: ${indexablePages.length} pagine indicizzabili)`);

    const templatePath = path.join(SEO_TEMPLATES_DIR, "robots.txt");
    if (!fs.existsSync(templatePath)) {
        console.warn(`!!!! File ausiliario mancante: ${SEO_TEMPLATES_DIR}/robots.txt — saltato.`);
        return;
    }

    let robots = fs.readFileSync(templatePath, "utf-8");
    robots = robots.split("%%SITE_URL%%").join(siteUrl);
    writeGeneratedFile("robots.txt", formatText(robots), `seo/robots.txt (aggiornato con domain: ${siteUrl})`);
}

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

    writeGeneratedFile("site.webmanifest", formatJson(manifest), "site.webmanifest (generato dalle icone in data/settings.json)");
    writeGeneratedFile("browserconfig.xml", formatXml(browserconfig), "browserconfig.xml (generato dalle icone in data/settings.json)");
}
