/**
 * Contenuto della pagina "Chi Siamo".
 *
 * Struttura di ogni topic:
 *  - key:      identificativo univoco (usato per generare id e aria-* automaticamente)
 *  - tabLabel: testo del pulsante nel selettore in alto
 *  - heading:  titolo (h2) del pannello
 *  - intro:    testo introduttivo del pannello (può contenere <br/>)
 *  - activities: elenco delle attività del topic, ognuna con:
 *        - key:         identificativo univoco dell'attività (solo per leggibilità/debug)
 *        - caroselloNum: numero del carosello (OBBLIGATORIO, deve essere univoco su tutta
 *                        la pagina). carosello.js genera l'id "carosello<N>" e usa <N> per
 *                        cercare la cartella "<N>_..." in /media/caroselli/manifest.json
 *                          NB: 0 usato per carosello nella pagina iniziale (index.html)
 *        - title:       titolo (h3)
 *        - text:        testo descrittivo (può contenere <br/>)
 */

export const TOPICS = [
    {
        key: "arte-marziale",
        tabLabel: "Arte Marziale Vietnamita",
        heading: "L'Arte Marziale",
        intro: `
            L'arte marziale che viene svolta in questa scuola è un arte marziale tradizionale vietnamita che
            comprende svariati ambiti di studi, dalla pratica fisica a quella mentale.<br />
            Infatti, nel corso della pratica, quest'arte non cerca solo di sviluppare un corpo e una conoscenza
            marziale, ma stimola anche la mente del praticante con l'obiettivo di comprendersi meglio e riuscire
            ad affrontare le avversità di ogni giorno con quella che noi chiamiamo una mente marziale.<br /><br />
            Negli anni di pratica si affronteranno le seguenti attività:
        `,
        activities: [
            {
                key: "tecniche-fondamentali",
                caroselloNum: 1,
                title: "Tecniche Fondamentali",
                text: `
                    Per una buona pratica fisica e longeva, poniamo estrema importanza
                    nel costruire la base su cui sviluppare ogni tecnica.<br />
                    Lo studio dei fontamentali risulta quindi essenziale per proseguire nella Via e non far crollare
                    la struttura che si costruisce con il passare del tempo.<br />
                    Nei fondamentali sono comprese le tecniche base di parate, pugni e calci, ma ancora più
                    importanti le posizioni su cui il corpo si soregge ed esegue quest'ultime.
                `
            },
            {
                key: "forme-mani-nude",
                caroselloNum: 2,
                title: "Forme a Mani Nude",
                text: `
                    Il passo successivo una volta imparate le basi è di mettere assieme e combinare le
                    varie tecniche di base per creare sequenze più complesse.<br />
                    Avviene quindi lo studio delle forme, esse sono infatti delle sequenze di tecniche predefinite
                    in cui si combatte con un avversario immaginario.<br />
                    Le forme da fuori potrebbero sembrare movimenti non sensati o danze, ma con la pratica si scopre
                    cosa queste possono trasmettere realmente. Infatti oltre ad un senso puramente fisico di
                    combattimento simulato, ogni forma nasconde un obbiettivo ed un significato particolare.
                `
            },
            {
                key: "acrobatica",
                caroselloNum: 3,
                title: "Acrobatica",
                text: `
                    Nel nostro corso poniamo anche importanza sulle tecniche di caduta e di acrobatica.<br />
                    Riteniamo fondamentale questa parte non solo per la capacità di riuscire a non provocarsi danno
                    nella caduta e a sapersi rialzare, ma soprattutto per sviluppare la capacità di
                    sapersi rialzare mentalmente; ovvero essere in grado di fronte alle avversità di tornare in
                    piedi ogni volta che veniamo buttati giù anche moralmente.
                `
            },
            {
                key: "studio-delle-armi",
                caroselloNum: 4,
                title: "Studio delle Armi",
                text: `
                    Fin dai primi anni di pratica nella nostra scuola, il praticante si ritrova a praticare lo studio
                    dell'arma per noi considerata "l'arma madre": il bastone lungo.<br />
                    Con quest'arma il praticante sviluppa un controllo equilibrato di ciascuna parte doppia del
                    corpo, sviluppando e coordinando parte destra e sinistra in equal modo. Tonifica in oltre il
                    corpo irrobustendolo e condizionandolo senza avere scompensi tra le parti.<br />
                    Una volta padroneggiato il bastone lungo il praticante verrà introdotto ad altre armi
                    tradizionai dell'arte, come ad esempio: spada, ventaglio, sciabola, etc.<br />
                    Lo studio di questo ambito non avviene tanto per la pratica delle armi, ma per comprendere
                    l'arma stessa e ciò che queste trasmettono. E' infatti improbabile trovarsi in situazioni in cui
                    poter utilizzare fisicamente queste armi nella vita reale, ma nello studio dell'arma si possono
                    trarre molte più informazioni che il semplice mero utilizzo, come ad esempio degli approcci
                    mentali.
                `
            },
            {
                key: "combattimento",
                caroselloNum: 5,
                title: "Combattimento",
                text: `
                    Lo studio dei fondamenti, di forme, tecniche di difesa e tutto quello che viene appreso nel
                    percorso viene anche messo a prova nella pratica vera e propria.<br />
                    Svolto con le protezioni adeguate, si studia tramite la pratica e
                    l'esercitazione ciò che nel tradizionale tecnico di forme e tecniche potrebbe tornare utile ed
                    essere applicato anche in situazioni di combattimento reale.<br />
                    Questa parte del programma viene svolta sempre con rispetto, controllo e attenzione tra gli
                    allievi così da garantire una continuazione nella pratica serena e conviviale.
                `
            },
            {
                key: "tecniche-di-rottura",
                caroselloNum: 6,
                title: "Tecniche di Rottura",
                // TODO: contenuto da completare
                text: `Durante...`
            },
            {
                key: "teoria",
                caroselloNum: 7,
                title: "Teoria",
                text: `
                    Come già accennato nel programma di studi il praticante non si concentrerà solo ed
                    esclusivamente nella pratica fisica, ma verrà istruito anche con una parte teorica molto
                    varia.<br />
                    Durante gli allenamenti infatti verranno forniti spunti e informazioni per svilupparsi anche
                    mentalmente come praticanti ed invece in possibili lezioni dedicate alla teoria verranno
                    introdotti e spiegati dei concetti tradizionali come: simbologia, medicina
                    tradizionale, teoria riferita ad argomenti pratici, etc.
                `
            }
        ]
    },
    {
        key: "difesa-personale",
        tabLabel: "Difesa Personale",
        heading: "Difesa Personale Close Combat",
        intro: `
            Il Close Combat è una tipologia di difesa personale divisibile in 3 target: per militari, per le forze
            dell'ordine e per i civili.<br />
            Nella nostra palestra si istruiscono gli allievi al livello civile di difesa pesonale,
            ovvero si impara la capacità di difendersi in diversi scenari con il solo scopo di tutelare la propria
            persona; senza quindi avere come obbiettivo primario quello di neutralizzare o bloccare l'avversario.<br />
            Il principale scopo che si vuole raggiungere, oltre alla capacità di difendersi fisicamente
            e acquisire informazioni/metodologie per affrontare un combattimento, è quello di acquisire
            fiducia in se stessi ed autostima per affrontare i problemi di ogni giorno.<br />
            Si precisa quindi, che quando si parla di combattimento, la nostra palestra, non si ferma al solo
            combattimento fisico di calci e pugni, ma punta a sviluppare una mente pronta ad affrontare anche
            avversità di qualsiasi tipo (da situazioni sgradevoli a aggressioni verbali a aggressioni fisiche).
        `,
        // slideshow generale del topic, mostrato subito dopo l'intro (prima dell'elenco attività)
        introCaroselloNum: 8,
        introOutro: `Negli anni di pratica si affronteranno le seguenti attività:`,
        activities: [
            {
                key: "difesa-mani-nude",
                caroselloNum: 9,
                title: "Difesa a Mani Nude",
                // TODO: contenuto da completare
                text: `...`
            },
            {
                key: "difesa-uso-armi",
                caroselloNum: 10,
                title: "Difesa e Uso di Armi",
                // TODO: contenuto da completare
                text: `...`
            }
        ]
    }
];