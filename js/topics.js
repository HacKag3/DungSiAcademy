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
            La nostra è un'arte marziale tradizionale vietnamita che unisce corpo e mente in un unico
            percorso di studio.<br />
            Non ci limitiamo a costruire un corpo forte e una tecnica marziale solida: allenamento dopo
            allenamento stimoliamo anche la mente del praticante, per imparare a conoscersi meglio e affrontare
            le difficoltà quotidiane con quella che chiamiamo una mente marziale.<br /><br />
            Ecco le attività che si affrontano negli anni di pratica:
        `,
        activities: [
            {
                key: "tecniche-fondamentali",
                caroselloNum: 1,
                title: "Tecniche Fondamentali",
                text: `
                    Ogni tecnica nasce da una base solida: per questo dedichiamo grande cura alla costruzione
                    dei fondamentali fin dal primo giorno.<br />
                    Studiarli a fondo è essenziale per proseguire nella Via senza che la struttura costruita nel
                    tempo finisca per crollare.<br />
                    I fondamentali comprendono le tecniche base di parate, pugni e calci — ma soprattutto le
                    posizioni su cui il corpo si sorregge per eseguirle.
                `
            },
            {
                key: "forme-mani-nude",
                caroselloNum: 2,
                title: "Forme a Mani Nude",
                text: `
                    Una volta acquisite le basi, il passo successivo è combinarle in sequenze più complesse.<br />
                    Nasce così lo studio delle forme: sequenze di tecniche predefinite in cui si affronta uno o più
                    avversari immaginari.<br />
                    Viste da fuori possono sembrare movimenti senza uno scopo preciso, quasi una danza — ma con
                    la pratica si scopre quanto hanno da trasmettere. Ogni forma, oltre al combattimento simulato,
                    nasconde un obiettivo e un significato tutto suo.
                `
            },
            {
                key: "acrobatica",
                caroselloNum: 3,
                title: "Acrobatica",
                text: `
                    Nel nostro corso diamo spazio anche alle tecniche di caduta e all'acrobatica.<br />
                    Non è solo una questione di imparare a cadere senza farsi male e a rialzarsi in fretta: è
                    soprattutto un allenamento a rialzarsi mentalmente, per tornare in piedi ogni volta che la
                    vita ci mette a terra.
                `
            },
            {
                key: "studio-delle-armi",
                caroselloNum: 4,
                title: "Studio delle Armi",
                text: `
                    Fin dai primi anni di pratica ci si confronta con quella che consideriamo "l'arma madre":
                    il bastone lungo.<br />
                    Attraverso quest'arma il praticante sviluppa un controllo equilibrato di ogni parte del
                    corpo, coordinando lato destro e sinistro in egual misura, e tonifica la struttura fisica
                    senza creare scompensi tra le parti.<br />
                    Padroneggiato il bastone lungo, si passa ad altre armi tradizionali dell'arte: spada,
                    ventaglio, sciabola, e altre ancora.<br />
                    Non è tanto una questione di saper maneggiare fisicamente un'arma — è improbabile trovarsi a
                    doverlo fare nella vita reale — quanto di comprenderla a fondo. È proprio in questo studio
                    che si trovano gli insegnamenti più preziosi, spesso più mentali che tecnici.
                `
            },
            {
                key: "combattimento",
                caroselloNum: 5,
                title: "Combattimento",
                text: `
                    Tutto ciò che si impara — fondamentali, forme, tecniche di difesa — viene messo alla prova
                    nella pratica del combattimento.<br />
                    Con le protezioni adeguate, si allena sul campo ciò che lo studio tecnico e le forme
                    insegnano, per capire come applicarlo in una situazione di combattimento reale.<br />
                    Questa parte del programma si svolge sempre con rispetto, controllo e attenzione reciproca
                    tra gli allievi, per una pratica che resti serena e conviviale.
                `
            },
            {
                key: "tecniche-di-rottura",
                caroselloNum: 6,
                title: "Tecniche di Rottura",
                // TODO: contenuto da completare
                text: `Contenuto in arrivo.`
            },
            {
                key: "teoria",
                caroselloNum: 7,
                title: "Teoria",
                text: `
                    Come già accennato, il percorso non si ferma alla pratica fisica: comprende anche una parte
                    teorica ricca e variegata.<br />
                    Durante gli allenamenti vengono offerti spunti per crescere anche mentalmente come
                    praticanti; nelle lezioni dedicate alla teoria, invece, si approfondiscono concetti
                    tradizionali come simbologia, medicina tradizionale e la teoria dietro agli aspetti più
                    pratici.
                `
            }
        ]
    },
    {
        key: "difesa-personale",
        tabLabel: "Difesa Personale",
        heading: "Difesa Personale Close Combat",
        intro: `
            Il Close Combat è un sistema di difesa personale pensato per tre target diversi: militari, forze
            dell'ordine e civili.<br />
            Nella nostra palestra si insegna il livello civile: la capacità di difendersi in scenari diversi
            con un solo obiettivo, tutelare la propria persona — non neutralizzare o sopraffare
            l'avversario.<br />
            Oltre a saper difendersi fisicamente, lo scopo principale è acquisire fiducia in se stessi e
            autostima per affrontare i problemi di ogni giorno.<br />
            Per questo, quando parliamo di combattimento, non intendiamo solo calci e pugni: puntiamo a
            costruire una mente pronta ad affrontare qualsiasi avversità, da una situazione sgradevole a
            un'aggressione verbale o fisica.
        `,
        // slideshow generale del topic, mostrato subito dopo l'intro (prima dell'elenco attività)
        introCaroselloNum: 8,
        introOutro: `Ecco le attività che si affrontano negli anni di pratica:`,
        activities: [
            {
                key: "difesa-mani-nude",
                caroselloNum: 9,
                title: "Difesa a Mani Nude",
                // TODO: contenuto da completare
                text: `Contenuto in arrivo.`
            },
            {
                key: "difesa-uso-armi",
                caroselloNum: 10,
                title: "Difesa e Uso di Armi",
                // TODO: contenuto da completare
                text: `Contenuto in arrivo.`
            }
        ]
    }
];