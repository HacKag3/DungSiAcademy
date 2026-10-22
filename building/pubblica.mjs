/**
 * Porta dev su main (npm run pubblica):
 *  - i file di .githooks/solo-dev.txt (building/, package.json, README.md, …)
 *    non arrivano mai su main;
 *  - per i file di .githooks/solo-main.txt (annunci, caroselli…) resta sempre la
 *    versione di main: si gestiscono lì, quelli di dev sono solo di prova.
 *
 * 1. controlla di essere su dev, senza modifiche in sospeso;
 * 2. passa su main e fa il merge di dev senza committare;
 * 3. toglie i file solo-dev, rimette la versione di main dei file solo-main e
 *    risolve i conflitti "tecnici": file nuovi o spostati su dev che su main
 *    non esistevano → si tiene la versione di dev;
 * 4. se restano conflitti veri (es. un file di contenuti/ cambiato su entrambi
 *    i branch) si ferma e li elenca, lasciando a te la scelta;
 * 5. altrimenti fa il commit del merge e torna su dev. Il push resta a te.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { ROOT_DIR } from "./lib/paths.mjs";

const DEV = "dev";
const MAIN = "main";

function git(...args) {
    return execFileSync("git", args, { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
}

// Come git(), ma senza fermarsi se il comando termina con errore (es. merge con conflitti).
function gitLibero(...args) {
    return spawnSync("git", args, { cwd: ROOT_DIR, encoding: "utf-8" });
}

function esci(messaggio) {
    console.error(`\n❌ ${messaggio}`);
    process.exit(1);
}

// Voci di un elenco di .githooks/ (una per riga, le cartelle finiscono con "/").
const leggiElenco = (nome) => fs.readFileSync(path.join(ROOT_DIR, ".githooks", nome), "utf-8")
    .split(/\r?\n/).map((riga) => riga.trim()).filter((riga) => riga && !riga.startsWith("#"));
const corrisponde = (elenco) => (file) => elenco.some((voce) => (voce.endsWith("/") ? file.startsWith(voce) : file === voce));
const righe = (testo) => testo.split("\n").filter(Boolean);

const soloDev = leggiElenco("solo-dev.txt");
const soloMain = leggiElenco("solo-main.txt");
const eSoloDev = corrisponde(soloDev);
const eSoloMain = corrisponde(soloMain);

// --- 1. controlli iniziali -------------------------------------------------
if (git("symbolic-ref", "--short", "HEAD") !== DEV) esci(`Lancia il comando dal branch ${DEV}.`);
if (git("status", "--porcelain")) esci(`Ci sono modifiche non committate su ${DEV}: committale prima di pubblicare.`);
if (git("rev-list", "--count", `${MAIN}..${DEV}`) === "0") {
    console.log(`\n${MAIN} contiene già tutto ${DEV}: niente da pubblicare.`);
    process.exit(0);
}

// --- 2. merge senza commit --------------------------------------------------
console.log(`Passo su ${MAIN} e faccio il merge di ${DEV}…`);
git("checkout", MAIN);
gitLibero("merge", "--no-ff", "--no-commit", DEV);
if (gitLibero("rev-parse", "-q", "--verify", "MERGE_HEAD").status !== 0) {
    git("checkout", DEV);
    esci("Il merge non è partito: controlla con git status.");
}

// --- 3. file solo-dev e conflitti tecnici -----------------------------------
gitLibero("rm", "-r", "-f", "-q", "--ignore-unmatch", "--", ...soloDev);
for (const voce of soloDev) fs.rmSync(path.join(ROOT_DIR, voce), { recursive: true, force: true });

// Contenuti di main: via i file arrivati solo da dev, poi la versione di main del resto.
for (const voce of soloMain) {
    const diMain = new Set(righe(git("ls-tree", "-r", "--name-only", "HEAD", "--", voce)));
    const daTogliere = [...new Set(righe(git("ls-files", "--", voce)))].filter((file) => !diMain.has(file));
    if (daTogliere.length > 0) gitLibero("rm", "-f", "-q", "--", ...daTogliere);
    if (diMain.size > 0) git("checkout", "HEAD", "--", voce);
}

const conflittiVeri = [];
for (const riga of git("status", "--porcelain").split("\n").filter(Boolean)) {
    const stato = riga.slice(0, 2);
    const file = riga.slice(3).replace(/^"|"$/g, "");
    if (!["DU", "UA", "DD", "UD", "UU", "AA", "AU"].includes(stato)) continue;

    if (eSoloMain(file)) continue;
    if (eSoloDev(file) || stato === "DD") {
        gitLibero("rm", "-f", "-q", "--", file);
    } else if (stato === "DU" || stato === "UA") {
        // Nuovo o spostato su dev, assente su main: si tiene la versione di dev.
        git("add", "--", file);
    } else {
        conflittiVeri.push(`${stato} ${file}`);
    }
}

// --- 4. conflitti da decidere a mano ----------------------------------------
if (conflittiVeri.length > 0) {
    console.error(`\n⚠️  Merge da completare a mano: questi file sono cambiati sia su ${DEV} sia su ${MAIN}:`);
    conflittiVeri.forEach((voce) => console.error(`   - ${voce}`));
    console.error(`\nSei su ${MAIN}. Sistemali, poi: git add <file>  →  git commit  →  git checkout ${DEV}`);
    console.error("Per annullare tutto: git merge --abort  →  git checkout dev");
    process.exit(1);
}

// --- 5. commit del merge e ritorno su dev -----------------------------------
git("commit", "--no-edit", "-m", `Merge branch '${DEV}'`);
const commit = git("log", "-1", "--format=%h %s");
git("checkout", DEV);
console.log(`\n✅ ${MAIN} aggiornato (${commit}): senza i file solo-dev e con i contenuti di ${MAIN} intatti. Sei di nuovo su ${DEV}.`);
console.log(`   Per pubblicare: git push origin ${MAIN}`);
