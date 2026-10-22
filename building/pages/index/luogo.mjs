import { leggiMappa } from "../../lib/helpers.mjs";

// Il campo mappa accetta sia l'URL di embed sia l'<iframe> copiato da Google Maps.
export default function luogo({ luogo }) {
    return { mappa: leggiMappa(luogo.mappa) };
}
