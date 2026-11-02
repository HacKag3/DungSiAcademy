// Il primo argomento (tab) parte selezionato; con #chiave nell'indirizzo il JS apre quello richiesto.
export default function corsi({ discipline }) {
    return {
        argomenti: discipline.disciplina.map((argomento, indice) => ({ ...argomento, indice, attivo: indice === 0 }))
    };
}
