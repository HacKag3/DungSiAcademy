# DŨNG SĨ Academy

Sito statico generato da template HTML e dati editoriali separati.

## Modello: build minimo + dati a runtime

Il build (`npm run build`) integra negli HTML **solo ciò che deve essere
presente a priori nel file**: SEO/meta, JSON-LD, struttura della pagina e
navigazione. La navigazione viene iniettata ogni pagina come JSON
(`#navigation-data`).

Tutto il resto (brand, header/footer, orari, luogo, contatti, social, dati
legali, team, annunci, pagina Chi Siamo) viene letto **a runtime** dai file
JSON in `data/` tramite `js/data-loader.js`:

- modificare un file JSON aggiorna il contenuto delle pagine **senza rebuild**;
- il rebuild serve solo per cambi di struttura/SEO/navigazione.

## Architettura del build

`building/build.mjs` è l'orchestratore: richiama i sottomoduli dedicati in
`building/build/`, ognuno con una responsabilità singola (utile per il
versionamento del codice):

| Sottomodulo | Responsabilità |
|---|---|
| `paths.mjs` | percorsi e costanti condivise (dir, file dati, colori, giorni IT→EN) |
| `loadData.mjs` | caricamento dei JSON sorgente (`building/data/seo-data.json`, `data/*.json`) |
| `validate.mjs` | validazione dati (errore = build interrotto) + asset locali |
| `transforms.mjs` | trasformazioni dati → config virtuale (solo schema/JSON-LD) + navigazione |
| `schema.mjs` | JSON-LD / schema.org integrato a priori per i crawler |
| `tokens.mjs` | calcolo token SEO/meta/icone/JSON-LD/navigazione |
| `render.mjs` | applicazione partial annidati e token nei template |
| `checks.mjs` | controllo token irrisolti e placeholder nei dati/output |
| `output.mjs` | scrittura pagine + sitemap/robots/manifest (sola lettura) |

Struttura dei partial (annidati, risolti in più passate dal builder):

```
head-pages.html → head-common.html → icons.html
head-error.html → head-common.html
{{JSON_LD}} (partial jsonLD.html, usato nel template index)
{{BODY_OPEN}} (partial body-open.html: bg-layer + header)
{{BODY_CLOSE}} (partial body-close.html: footer + chiusura documento)
```

## Dove modificare cosa

- `building/data/seo-data.json`: dominio, elenco delle pagine, titoli, descrizioni e pagina iniziale.
	Impostare `nav: true` e `navLabel` per includere una pagina nella navigazione.
- `data/settings.json`: brand (nome, logo e icone), dati legali e affiliazioni. (runtime)
- `data/contatti.json`: social e contatti email utili. (runtime)
- `data/corsi.json`: discipline e orari (in `disciplina[].fascia` con `giorni[].ora`) e luogo della palestra. (runtime)
- `data/personale.json`: persone e profili del team. (runtime)
- `data/annunci.json`: annunci pubblicati. (runtime)
- `data/content/whoweare.json`: contenuti della pagina Chi Siamo e numeri dei caroselli
	(`intro`, `disciplina[]` con `carosello` di introduzione e `activities[].carosello`). (runtime)
- `building/pages_template/`: template HTML tecnici delle pagine (il guscio
	`<body>` condiviso arriva dai partial `body-open.html`/`body-close.html`).
- `building/pages_template/_partials/`: blocchi HTML condivisi (head, body, JSON-LD, ecc.).
- `building/seo/`: sorgenti tecnici di sitemap e robots.
- `building/build.mjs`: orchestratore del build; la logica vive in `building/build/*.mjs`.
- `building/build/`: sottomoduli del generatore (paths, loadData, validate, transforms, schema, tokens, render, checks, output).
- `js/data-loader.js`: fetch a runtime dei JSON in `data/` (caricamento per
	chiave con cache: ogni pagina scarica solo i dati che usa) e trasformazioni dati.
- `js/pages/index/`: logica della home, divisa per sezione (`orari.js`,
	`luogo.js`, `announcements.js` + `annuncioDettaglio.js` per la modale).
- Root (`index.html`, `contacts.html`, `site.webmanifest`, ecc.): output generati, da non modificare manualmente.

## Flusso di aggiornamento

1. Per contenuti (orari, contatti, team, annunci, testi…): modificare il JSON in `data/`.
2. Per SEO, meta o struttura di pagina: modificare `building/data/seo-data.json` o un template e rieseguire `npm run build`.
3. Controllare gli avvisi sui placeholder prima della pubblicazione.

Le pagine `contacts.html` e `whoweare.html` hanno il contenuto principale
generato a runtime dai JSON. Il JavaScript gestisce anche interazioni come
menu, tab, caroselli e caricamento esplicito della mappa.

Il comando `npm run build` valida i dati prima di generare gli output. Un errore interrompe il build; i warning `[DA CONFERMARE]` indicano invece dati ancora provvisori da completare.
