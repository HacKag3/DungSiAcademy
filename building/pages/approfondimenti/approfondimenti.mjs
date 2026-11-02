// Il primo articolo (tab) parte selezionato; con un solo articolo la barra dei tab non serve.
export default function approfondimenti({ approfondimenti: lista }) {
    const articoli = lista.map((articolo, indice) => ({
        ...articolo,
        indice,
        attivo: indice === 0,
        dataLabel: articolo.date
            ? new Date(`${articolo.date}T00:00:00Z`).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
            : null
    }));
    return { articoli, tabVisibili: articoli.length > 1 };
}
