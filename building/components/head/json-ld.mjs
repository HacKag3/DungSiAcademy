import { leggiMappa, telefono, urlAssoluto, valoreReale } from "../../lib/helpers.mjs";

const GIORNI_EN = {
    "Lunedì": "Monday",
    "Martedì": "Tuesday",
    "Mercoledì": "Wednesday",
    "Giovedì": "Thursday",
    "Venerdì": "Friday",
    "Sabato": "Saturday",
    "Domenica": "Sunday"
};

// Orari di apertura (senza duplicati) ricavati dalle lezioni di contenuti/corsi.json
// (letto al momento del build: le modifiche fatte solo su main arrivano qui al build successivo).
function orariApertura(corsi) {
    const visti = new Set();
    const orari = [];
    for (const { giorno, ora } of corsi.flatMap((disciplina) => disciplina.fasce.flatMap((fascia) => fascia.giorni))) {
        const [opens, closes] = ora.split("-").map((parte) => parte.trim());
        const chiave = `${giorno}|${opens}|${closes}`;
        if (visti.has(chiave)) continue;
        visti.add(chiave);
        orari.push({ "@type": "OpeningHoursSpecification", dayOfWeek: [GIORNI_EN[giorno]], opens, closes });
    }
    return orari;
}

// Toglie campi vuoti, liste vuote e oggetti vuoti.
function pulisci(valore) {
    if (Array.isArray(valore)) {
        const lista = valore.map(pulisci).filter((voce) => voce !== undefined);
        return lista.length > 0 ? lista : undefined;
    }
    if (valore && typeof valore === "object") {
        const voci = Object.entries(valore).map(([chiave, voce]) => [chiave, pulisci(voce)]).filter(([, voce]) => voce !== undefined);
        return voci.length > 0 ? Object.fromEntries(voci) : undefined;
    }
    return valore === "" || valore == null ? undefined : valore;
}

export default function jsonLd({ sito, brand, page, luogo, contatti, corsi, social }) {
    const { via, numero, cap, citta, provincia, paese } = luogo.indirizzo;
    const mappa = leggiMappa(luogo.mappa);
    const lat = luogo.lat ?? mappa.lat;
    const lng = luogo.lng ?? mappa.lng;

    const scuola = {
        "@type": "SportsActivityLocation",
        "@id": `${sito.url}/#organization`,
        name: brand.name,
        description: page.description,
        url: `${sito.url}/`,
        logo: urlAssoluto(sito.url, brand.icone.android?.["512"] || brand.loghi[0]?.path),
        image: urlAssoluto(sito.url, brand.copertina.path),
        address: {
            "@type": "PostalAddress",
            streetAddress: [via, numero].filter(Boolean).join(" "),
            addressLocality: citta,
            addressRegion: provincia,
            postalCode: cap,
            addressCountry: paese || "IT"
        },
        geo: typeof lat === "number" && typeof lng === "number"
            ? { "@type": "GeoCoordinates", latitude: lat, longitude: lng }
            : undefined,
        telephone: telefono(contatti.generale?.telefono)?.completo,
        email: valoreReale(contatti.generale?.email),
        openingHoursSpecification: orariApertura(corsi),
        // Profili social da contenuti/social.json (letto al build, come gli orari).
        sameAs: social.map((voce) => valoreReale(voce.url))
    };

    const dati = { "@context": "https://schema.org", "@graph": [pulisci(scuola)] };
    // Ogni "<" diventa la sequenza di escape JSON: nessun testo dei dati può chiudere lo <script>.
    return { jsonLd: JSON.stringify(dati).replace(/</g, "\\u003c") };
}
