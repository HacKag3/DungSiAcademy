/**
 * Genera le icone di un logo: npm run icone -- <NomeLogo>
 *
 * Sorgente: building/grafica/loghi/<NomeLogo>.svg
 * Output:   media/loghi/icons/<NomeLogo>/ (favicon, apple, android, windows, source/logo-square.svg)
 * Richiede Inkscape (e ImageMagick per favicon.ico). Poi aggiungi
 * { "name": "<NomeLogo>", "alt": "…" } in building/data/brand.json → logo.loghi.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { BUILDING_DIR, ROOT_DIR } from "../lib/paths.mjs";

const ICONS_DIR = path.join(BUILDING_DIR, "icons");
const nome = process.argv[2];

if (!nome) {
    console.error("Uso: npm run icone -- <NomeLogo>   (es. npm run icone -- KienLongVoDao)");
    process.exit(1);
}

const sorgente = path.join(BUILDING_DIR, "grafica", "loghi", `${nome}.svg`);
const destinazione = path.join(ROOT_DIR, "media", "loghi", "icons", nome);
if (!fs.existsSync(sorgente)) {
    console.error(`Logo non trovato: ${path.relative(ROOT_DIR, sorgente)}`);
    process.exit(1);
}

const risultato = process.platform === "win32"
    ? spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
        path.join(ICONS_DIR, "gen-icons.ps1"), "-Src", sorgente, "-OutRoot", destinazione], { stdio: "inherit" })
    : spawnSync("bash", [path.join(ICONS_DIR, "gen-icons.sh"), sorgente, destinazione], { stdio: "inherit" });

process.exit(risultato.status ?? 1);
