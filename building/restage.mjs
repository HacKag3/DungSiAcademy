/**
 * Ricrea da zero la storia di main e dev (npm run restage), per avere su GitHub
 * solo lo stato attuale del sito senza la cronologia delle modifiche:
 *  - main = 1 commit con il sito;
 *  - dev  = quel commit + 1 commit con i sorgenti (building/ ecc.).
 * dev parte dal commit di main, così npm run pubblica continua a funzionare.
 *
 * Prima di riscrivere:
 *  - va lanciato da dev, senza modifiche in sospeso, con dev già pubblicato su
 *    main (npm run pubblica);
 *  - salva tutta la storia precedente in ../<cartella>-storia-<data>.bundle
 *    (si recupera con: git clone <file.bundle>);
 *  - chiede conferma prima del force push su GitHub (salta con: -- --conferma).
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { ROOT_DIR, DATA_DIR } from "./lib/paths.mjs";

const DEV = "dev";
const MAIN = "main";
const REMOTE = "origin";

const git = (...args) => execFileSync("git", args, { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
const gitOk = (...args) => spawnSync("git", args, { cwd: ROOT_DIR, encoding: "utf-8" }).status === 0;

function esci(messaggio) {
    console.error(`\n❌ ${messaggio}`);
    process.exit(1);
}

// --- controlli ----------------------------------------------------------------
if (git("symbolic-ref", "--short", "HEAD") !== DEV) esci(`Lancia il comando dal branch ${DEV}.`);
if (git("status", "--porcelain")) esci(`Ci sono modifiche non committate su ${DEV}: committale prima.`);

// dev deve essere già su main: o è stato pubblicato (dev contenuto in main),
// o è lo stato lasciato da un restage precedente (dev = main + 1 commit).
const pubblicato = gitOk("merge-base", "--is-ancestor", DEV, MAIN)
    || git("rev-parse", `${DEV}^`) === git("rev-parse", MAIN);
if (!pubblicato) esci(`${DEV} ha modifiche non ancora su ${MAIN}: lancia prima npm run pubblica.`);

const soloDev = fs.readFileSync(path.join(ROOT_DIR, ".githooks", "solo-dev.txt"), "utf-8")
    .split(/\r?\n/).map((riga) => riga.trim()).filter((riga) => riga && !riga.startsWith("#"));
const fileMain = git("ls-tree", "-r", "--name-only", MAIN).split("\n");
const intrusi = fileMain.filter((file) => soloDev.some((voce) => (voce.endsWith("/") ? file.startsWith(voce) : file === voce)));
if (intrusi.length > 0) esci(`${MAIN} contiene file solo-dev (${intrusi.slice(0, 3).join(", ")}…): sistemalo prima.`);

console.log(`Aggiorno i riferimenti di ${REMOTE}…`);
if (!gitOk("fetch", "-q", REMOTE)) esci(`Impossibile contattare ${REMOTE}: serve la connessione per il push.`);
const remotoMain = git("rev-parse", `${REMOTE}/${MAIN}`);
const remotoDev = git("rev-parse", `${REMOTE}/${DEV}`);

// --- copia di sicurezza ----------------------------------------------------
const data = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
const backup = path.join(path.dirname(ROOT_DIR), `${path.basename(ROOT_DIR)}-storia-${data}.bundle`);
git("bundle", "create", backup, "--all");
console.log(`Storia attuale salvata in ${backup}`);

// --- conferma ----------------------------------------------------------------
if (!process.argv.includes("--conferma")) {
    const domanda = readline.createInterface({ input: process.stdin, output: process.stdout });
    const risposta = await domanda.question(`\nSovrascrivo ${MAIN} e ${DEV} su GitHub con la storia ricreata? Scrivi RESTAGE per confermare: `);
    domanda.close();
    if (risposta.trim() !== "RESTAGE") esci("Annullato: nulla è stato modificato (la copia .bundle resta).");
}

// --- nuova storia --------------------------------------------------------------
const nome = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "brand.json"), "utf-8").replace(/^﻿/, "")).name;
const commitMain = git("commit-tree", `${MAIN}^{tree}`, "-m", `${nome}: sito`);
const commitDev = git("commit-tree", `${DEV}^{tree}`, "-p", commitMain, "-m", `${nome}: sorgenti e build del sito`);
git("branch", "-f", MAIN, commitMain);
git("reset", "-q", "--soft", commitDev);

console.log(`Push su ${REMOTE}…`);
git("push", `--force-with-lease=${MAIN}:${remotoMain}`, `--force-with-lease=${DEV}:${remotoDev}`, REMOTE, MAIN, DEV);

// --- pulizia locale ------------------------------------------------------------
git("reflog", "expire", "--expire=now", "--all");
git("gc", "-q", "--prune=now");
const altri = git("for-each-ref", "--format=%(refname)").split("\n").filter((ref) => ref && !/^refs\/(heads|remotes)\//.test(ref));

console.log(`\n✅ Storia ricreata: ${MAIN} = 1 commit, ${DEV} = 2 commit (anche su GitHub).`);
if (altri.length > 0) {
    console.log(`   Nota: restano ${altri.length} riferimenti locali alla vecchia storia (es. ${altri[0]}): cancellali a mano se non servono.`);
}
console.log("   La lista dei contributor di GitHub può impiegare fino a un giorno ad aggiornarsi.");
