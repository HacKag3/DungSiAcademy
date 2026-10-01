// Facoltativo: riceve i dati della pagina (e quelli globali) e restituisce
// i campi aggiuntivi usati in _modello.html.
export default function modello({ brand }) {
    return { testo: `Contenuto della pagina di ${brand.name}.` };
}
