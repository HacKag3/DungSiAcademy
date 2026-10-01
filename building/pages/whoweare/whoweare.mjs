// Il primo argomento (tab) parte selezionato.
export default function whoweare({ whoweare }) {
    return {
        argomenti: whoweare.disciplina.map((argomento, indice) => ({ ...argomento, indice, attivo: indice === 0 }))
    };
}
