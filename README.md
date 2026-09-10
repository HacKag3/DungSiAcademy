# DŨNG SĨ Academy

Sito statico generato da template HTML e dati editoriali separati.

## Modello: build minimo + dati a runtime

Il build (`npm run build`) integra negli HTML **solo ciò che deve essere
presente a priori nel file**: SEO/meta, JSON-LD, struttura della pagina e
navigazione. La navigazione viene iniettata ogni pagina come JSON
(`#navigation-data`).

Tutto il resto (brand, header/footer, orari, luogo, contatti, social, dati
legali, team, pagina Chi Siamo) viene **compilato dal build direttamente
nelle pagine** (`<script type="application/json" id="site-data">`):
`js/data-loader.js` legge quel blocco inline, senza alcun fetch di contenuto.

- modificare un file JSON richiede **un rebuild** per aggiornare le pagine;
- unici contenuti ancora letti a runtime: gli annunci
  (`media/annunci/annunci.json`, aggiornabili senza rebuild) e le immagini
  dei caroselli (dai manifest in `media/caroselli/`).

## Architettura del build

`building/build.mjs` è l'orchestratore: richiama i sottomoduli dedicati in
`building/build/`, ognuno con una responsabilità singola (utile per il
versionamento del codice):

| Sottomodulo | Responsabilità |
|---|---|
| `paths.mjs` | percorsi e costanti condivise (dir, file dati, colori, giorni IT→EN) |
| `loadData.mjs` | caricamento dei JSON sorgente (`building/data/*.json`) |
| `validate.mjs` | validazione dati (errore = build interrotto) + asset locali |
| `transforms.mjs` | trasformazioni dati → config virtuale (runtime) + navigazione |
| `schema.mjs` | frammenti JSON (`{{SCHEMA_*}}`: logo, indirizzo, geo, contatti, orari, sameAs) per il JSON-LD della home |
| `tokens.mjs` | calcolo token SEO/meta/icone/JSON-LD (`{{JSON_LD_HOME}}`) + navigazione |
| `render.mjs` | applicazione partial annidati e token nei template (con seconda passata per i token dentro il JSON-LD) |
| `checks.mjs` | controllo token irrisolti, placeholder e SEO/output (JSON-LD unico solo in home, canonical, og:image) |
| `output.mjs` | scrittura pagine + sitemap/robots/manifest (sola lettura) |

Struttura dei partial (annidati, risolti in più passate dal builder):

```
head-pages.html → head-common.html → icons.html
head-error.html → head-common.html
index.html include `{{JSON_LD_HOME}}` → partial `json-ld-home.html`
(unico blocco `<script type="application/ld+json">` con la sola
SportsActivityLocation della scuola, solo nella home)
{{BODY_OPEN}} (partial body-open.html: bg-layer + header)
(chiusura `<body>`/`<html>` con footer integrata direttamente in ogni template)
```

## Dove modificare cosa

- `building/data/seo-data.json`: dominio, elenco delle pagine, titoli, descrizioni e pagina iniziale.
	Impostare `nav: true` e `navLabel` per includere una pagina nella navigazione.
- `building/data/settings.json`: brand (nome, logo e icone), dati legali, affiliazioni e
	stringhe UI. (sorgente del build → inline nelle pagine)
- `building/data/contatti.json`: social e contatti email utili. (sorgente del build → inline)
- `building/data/corsi.json`: discipline e orari (in `disciplina[].fascia` con `giorni[].ora`)
	e luogo della palestra. (sorgente del build → inline nella home)
- `building/data/personale.json`: persone e profili del team. (sorgente del build → inline in Contatti)
- `media/annunci/annunci.json`: annunci pubblicati (fetch a runtime, aggiornabili
	senza rebuild; le pagine di dettaglio vivono nella stessa cartella).
- `building/data/content/whoweare.json`: contenuti della pagina Chi Siamo e numeri dei caroselli
	(`intro`, `disciplina[]` con `carosello` di introduzione e `activities[].carosello`).
	(sorgente del build → inline in Chi Siamo)
- `building/pages_template/`: template HTML tecnici delle pagine (il footer con
	chiusura `<body>`/`<html>` è integrato direttamente in ogni template;
	il `body-open.html` condiviso fornisce bg-layer + header).
- `building/pages_template/_partials/`: blocchi HTML condivisi (head, body, ecc.).
	Il JSON-LD vive solo nella home: `building/pages_template/index.html` include
	`{{JSON_LD_HOME}}` dal file di facile modifica `json-ld-home.html`
	(sola `SportsActivityLocation` della scuola); `schema.mjs` fornisce solo
	i frammenti dati `{{SCHEMA_*}}` (indirizzo, orari, contatti, sameAs...).
- `building/seo/`: sorgente tecnica di robots (`sitemap.xml` è generata
	dinamicamente da `seo-data.json`: solo pagine senza `errorCode`, con
	canonical `/` per la home, `lastmod` = data del build, `priority` e
	`changefreq` per importanza).
- `building/build.mjs`: orchestratore del build; la logica vive in `building/build/*.mjs`.
- `building/build/`: sottomoduli del generatore (paths, loadData, validate, transforms, schema, tokens, render, checks, output).
- `js/data-loader.js`: legge i dati inline che il build incorpora in ogni pagina
	(`<script type="application/json" id="site-data">`: nessun fetch per il
	contenuto) e li trasforma per il runtime. Unico fetch: gli annunci da
	`media/annunci/annunci.json` (e le immagini dei caroselli dai manifest).
- `js/pages/index/`: logica della home, divisa per sezione (`orari.js`,
	`luogo.js`, `announcements.js` + `annuncioDettaglio.js` per la modale).
- Root (`index.html`, `contacts.html`, `site.webmanifest`, ecc.): output generati, da non modificare manualmente.

## Flusso di aggiornamento

1. Per contenuti (orari, contatti, team, testi…): modificare il JSON in `building/data/` e rieseguire il build. Per gli annunci: modificare `media/annunci/annunci.json` (senza rebuild).
2. Per SEO, meta o struttura di pagina: modificare `building/data/seo-data.json` o un template e rieseguire `npm run build`.
3. Controllare gli avvisi sui placeholder prima della pubblicazione.

Le pagine `contacts.html` e `whoweare.html` hanno il contenuto principale
generato a runtime dai JSON. Il JavaScript gestisce anche interazioni come
menu, tab, caroselli e caricamento esplicito della mappa.

Il comando `npm run build` valida i dati prima di generare gli output. Un errore interrompe il build; i warning `[DA CONFERMARE]` indicano invece dati ancora provvisori da completare.
