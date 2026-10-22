import { urlAssoluto } from "../../lib/helpers.mjs";

// Le anteprime social richiedono l'URL assoluto della copertina.
export default function openGraph({ sito, brand }) {
    return { immagine: urlAssoluto(sito.url, brand.copertina.path) };
}
