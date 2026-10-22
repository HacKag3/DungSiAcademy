# DŨNG SĨ Academy

Sito statico della scuola, generato da template HTML e da dati separati per argomento.

## Due branch, due ruoli

- **dev**: sorgenti del sito. `building/` contiene dati, template, componenti e il
  build che genera le pagine; `css/`, `js/`, `contenuti/`, `media/` e `font/` in
  root sono il sito vero e proprio e si modificano direttamente.
- **main**: solo il sito finito e stabile, senza i file solo-dev elencati in
  `.githooks/solo-dev.txt` (`building/`, `package.json`, `README.md`).
  Su main si modificano soltanto i contenuti che non richiedono un rebuild.

I contenuti modificabili su main (letti dal browser) sono separati per tipo:

| Cartella | Cosa contiene |
|---|---|
| `contenuti/` | i dati: `annunci.json` (+ pagine di dettaglio in `contenuti/annunci/`), `corsi.json` (orari delle lezioni), `personale.json` (team: `ruolo` principale e `altriRuoli` facoltativi), `social.json` (icone social del footer), `contatti.json` (contatti utili della pagina Contatti, con `referente` facoltativo; il contatto `generale` dà il telefono del footer, il contatto `privacy` l’email e il referente citati nelle policy) |
| `media/` | solo immagini e i manifest delle immagini: foto del team in `media/persone/`, caroselli in `media/caroselli/<numero>_<nome>/` con il loro `manifest.json` (le cartelle sono elencate in `media/caroselli/manifest.json`), loghi, sfondo, copertina |

Nell'elenco dei caroselli (`media/caroselli/manifest.json`) ogni voce può essere
il solo nome della cartella oppure un oggetto con le opzioni del carosello:

```json
[
    "0_index",
    { "name": "1_viet", "autoplay": false }
]
```

`autoplay` assente o `true` = le slide scorrono da sole; `false` = cambiano solo
con frecce, punti, tastiera o swipe. L'autoplay è comunque disattivato per chi ha
chiesto al sistema di ridurre le animazioni e per i caroselli con una sola immagine.

Le immagini usate nelle pagine di dettaglio degli annunci vanno comunque in
`media/` (es. `media/annunci/foto.jpg`) e si richiamano con
`src="./media/annunci/foto.jpg"`: il dettaglio viene inserito nella home, quindi i
percorsi partono dalla root del sito.

Il build usa anche `contatti.json`, `corsi.json` e `social.json` per i dati
strutturati della home per Google (telefono, orari e profili social nel JSON-LD): una modifica fatta solo su
main arriva lì al build successivo da dev.

## Portare dev su main

Dal branch `dev`, con tutto committato:

```bash
npm run pubblica
```

Il comando passa su `main`, fa il merge di `dev`, toglie i file solo-dev,
rimette la versione di main dei contenuti gestiti su main, risolve da solo i
conflitti dovuti a file nuovi o spostati su dev, fa il commit e torna su `dev`;
poi basta `git push origin main`.

Due elenchi in `.githooks/` decidono cosa non passa da dev a main:

| Elenco | Effetto |
|---|---|
| `solo-dev.txt` | non arrivano mai su main (`building/`, `package.json`, `README.md`) |
| `solo-main.txt` | resta sempre la versione di main: annunci (`contenuti/annunci.json`, `contenuti/annunci/`) e caroselli (`media/caroselli/`). Su dev sono solo dati di prova: le modifiche e i file nuovi di dev in queste cartelle vengono ignorati |

Per aggiungere un file o una cartella basta una riga nell’elenco giusto. Se un file è cambiato sia su
dev sia su main (es. un JSON di `contenuti/`) si ferma, elenca i file e lascia a
te la scelta (`git merge --abort` annulla tutto). Non serve più sistemare il
merge a mano.

Protezioni: su dev l'hook `.githooks/pre-commit` rigenera il sito e aggiunge al
commit i file generati; su main blocca i commit che aggiungono file solo-dev
(attivalo una volta con `git config core.hooksPath .githooks`). Al push su main
la GitHub Action rimuove comunque i file solo-dev, se ci fossero arrivati.

## Comandi

```bash
npm run build                  # genera le pagine html e i file ausiliari in root
npm run icone -- <NomeLogo>    # genera le icone di building/grafica/loghi/<NomeLogo>.svg
npm run pubblica               # porta dev su main senza i file solo-dev (vedi sopra)
npm run restage                # ricrea da zero la storia di main e dev (vedi sotto)
```

**`npm run restage`** (da `dev`, dopo `npm run pubblica`) cancella la cronologia e
lascia solo lo stato attuale: `main` = 1 commit con il sito, `dev` = quel commit +
1 commit con i sorgenti. Prima salva tutta la storia precedente in
`../<cartella>-storia-<data>.bundle` (si recupera con `git clone <file.bundle>`),
poi chiede di scrivere `RESTAGE` e sovrascrive entrambi i branch su GitHub
(force push). Con `npm run restage -- --conferma` salta la domanda.

Il build non ha dipendenze (serve solo Node). Un errore nei dati interrompe il
build indicando file e campo; i valori `[DA CONFERMARE]` producono solo avvisi.
I file generati in root sono in sola lettura: si modificano i sorgenti in `building/`.

## Struttura di `building/`

```
building/
├── build.mjs            orchestratore del build
├── data/                contenuti del sito, un file per argomento
├── layouts/             scheletro delle pagine: base.html (sito), error.html (errori)
├── components/          componenti condivisi (head, header, footer, carosello, …)
├── pages/               una cartella per pagina (o gruppo di pagine)
├── files/               file ausiliari generati in root (robots, sitemap, manifest, …)
├── grafica/             sorgenti grafici: loghi/*.svg e sfondo.svg (non pubblicati)
├── icons/               script che generano le icone dei loghi
└── lib/                 motore del build (di norma non serve toccarlo)
```

Ogni elemento ha il suo file, con lo stesso nome per tutte le sue parti:

| File | Contenuto |
|---|---|
| `nome.html` | markup del componente o della sezione |
| `nome.mjs` | (facoltativo) prepara i dati per `nome.html` |
| `nome.json` | (solo pagine) titolo, descrizione, menu e sitemap della pagina |

CSS e JS non passano dal build: restano in root. Per ogni pagina il layout
collega `css/comune.css` e `js/main.js` (elementi comuni, che importano header,
footer e burger) più, se esistono, `css/pages/<pagina>/<pagina>.css` e
`js/pages/<pagina>/<pagina>.js`, che importano a loro volta ciò che serve alla
pagina (es. il carosello).

## Dove modificare cosa

| Cosa | File |
|---|---|
| Dominio, lingua, autore, banner "sito in sviluppo" | `data/sito.json` |
| Nome, descrizione, loghi, icone, copertina social, colore | `data/brand.json` |
| Dati legali (footer e privacy) ed enti di affiliazione (footer) | `data/legale.json` |
| Indirizzo e mappa della palestra (home) | `data/luogo.json` |
| Testi e caroselli della pagina Chi Siamo | `data/whoweare.json` |
| Testi della home | `pages/index/hero.html`, `partecipare.html`, … |
| Privacy e cookie policy | `pages/legal/privacy.html`, `cookie.html` |
| Testi delle pagine di errore | `pages/error/error.json` |
| Header, menu, footer | `components/header/`, `components/footer/` |
| Titolo, descrizione e voce di menu di una pagina | `pages/<pagina>/<pagina>.json` |

In `data/legale.json` le voci di `dati` (e i `dati` di ogni affiliazione) hanno come
chiave l’etichetta mostrata sul sito, nell’ordine del file: per aggiungere o
rinominare una riga del footer o della privacy basta modificare il JSON
(es. `"Codice CONI": "123456"`); una voce con valore vuoto non compare.
`denominazione` resta una chiave fissa perché è citata nel testo della privacy.
Ogni affiliazione può avere un `link` (es. la pagina dell’ente o la scheda nel
registro CONI): il riquadro nel footer diventa cliccabile e apre il link in una
nuova scheda.

Ogni file `data/X.json` è disponibile in tutti i template come `{{X.campo}}`:
per aggiungere un gruppo di dati basta creare il file.

## Template

I template usano un sottoinsieme della sintassi Handlebars:

```handlebars
{{campo}}  {{brand.name}}                valore (con escape HTML)
{{{campo}}}                              HTML dai dati, senza escape
{{#if campo}} … {{else}} … {{/if}}       anche {{#unless campo}}
{{#each lista}} … {{/each}}              dentro: {{this}}, {{@index}}, {{@first}}, {{@last}}
{{#with oggetto}} … {{/with}}
{{> nome}}                               include nome.html (o nome/nome.html)
{{> carosello numero=3 classe="x"}}      … passando dati aggiuntivi
{{!-- commento --}}                      non finisce nell'output
```

- Un campo si cerca nell'elemento corrente (voce di un `each`, componente) e poi
  nei dati globali (`sito`, `brand`, `page`, `nav`, …); `{{../campo}}` legge
  l'elemento che contiene quello corrente.
- `{{> nome}}` cerca prima nella cartella del template che lo include, poi in
  `components/`.
- Un campo non definito genera un avviso nel build, con file e riga.

## Aggiungere…

- **una pagina**: copia `pages/_modello/` in `pages/<nome>/`, rinomina i file e
  segui le istruzioni nel template. Le cartelle che iniziano con `_` vengono ignorate.
- **una sezione di una pagina**: crea `pages/<pagina>/<sezione>.html` e includila
  con `{{> sezione}}`; se servono dati calcolati aggiungi `<sezione>.mjs`.
- **un componente condiviso**: crea `components/<nome>.html` (o `components/<nome>/<nome>.html`)
  e usalo con `{{> nome}}` in qualsiasi pagina.
- **un file in root** (es. `humans.txt`): crea il template in `files/`.
- **un logo**: metti l'SVG in `building/grafica/loghi/`, lancia `npm run icone -- <Nome>`
  e aggiungi `{ "name": "<Nome>", "alt": "…" }` in `data/brand.json → logo.loghi`
  (il primo logo è quello principale: favicon e icone vengono da lui).

**Sfondo del sito**: il sorgente è `building/grafica/sfondo.svg`; il sito usa la sua
versione leggera `media/bg.webp`. Dopo averlo modificato, rigenerala con:

```bash
inkscape building/grafica/sfondo.svg --export-type=png --export-width=2560 --export-filename=sfondo.png
magick sfondo.png -resize 1920x -quality 70 media/bg.webp
```

## Contenuti generati nel browser

Annunci, orari, contatti, team, social e caroselli sono caricati dal JS (così su main si
aggiornano senza rebuild), ma il loro markup vive comunque nei template: i
`<template>` in `pages/index/annunci.html`, `pages/index/orari.html`,
`pages/contacts/contatti-utili.html`, `pages/contacts/team.html`,
`pages/contacts/recapiti.html`, `components/footer/social.html` e
`components/carosello/modelli.html` vengono clonati dal JS, che ne riempie gli
elementi con `data-campo="…"`. Questi file vengono sempre riverificati sul server
(`cache: "no-cache"`), quindi una modifica su main è visibile subito.

Su dev il build (eseguito a ogni commit dall’hook) valida comunque tutti i file
di `contenuti/`; su main una modifica errata non viene bloccata, quindi conviene
controllare la pagina dopo il push.
