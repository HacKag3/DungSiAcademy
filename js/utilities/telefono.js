// Regola unica dei telefoni, usata dal sito e dal build (building/lib/helpers.mjs):
// numero valido se ha almeno 8 cifre; il testo mostrato non ha il prefisso +39
// (o 0039), il link tel: sì.
export function telefono(valore) {
    const completo = String(valore ?? "").trim();
    if (completo.replace(/\D/g, "").length < 8) return null;
    return {
        testo: completo.replace(/^(?:\+|00)39[\s.-]*/, ""),
        href: completo.replace(/[^0-9+]/g, "")
    };
}
