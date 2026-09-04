export const CONFIG = {
    orari: {
        adulti: {
            id: "Adulti",
            giorni: [
                { giorno: "Lunedì", ora: "20:00-21:30" },
                { giorno: "Mercoledì", ora: "20:00-21:30" },
                { giorno: "Venerdì", ora: "20:00-21:30" }
            ],
            info: "Lezioni per adulti e ragazzi di età superiore ai 14 anni (compresi).<br>Nonostante tutti e tre i giorni siano disponibili sia le lezioni di arti marziali che di difesa personale, il mercoledì l'allenamento è dedicato per lo più alle arti marziali invece il venerdì alla difesa personale, il lunedì invece è misto."
        },
        bambini: {
            id: "Bambini",
            giorni: [
                { giorno: "Lunedì", ora: "19:00-20:00" },
                { giorno: "Mercoledì", ora: "19:00-20:00" }
            ],
            info: "Lezioni per bambini di età inferiore ai 14 anni."
        }
    },

    luogo: {
        indirizzo: {
            via: "Scuole medie, Via Friuli",
            numero: "9",
            citta: "Arcole",
            provincia: "VR",
            cap: "37040",
            paese: "IT"
        },
        lat: 45.35786798512037,
        lng: 11.29127910901515,
        map: `
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d897.085100866655!2d11.29127910901515!3d45.35786798512037!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477f4114e1748db3%3A0x239b9f730af2eed1!2sViet%20Vo%20Dao%20Dung%20Si!5e1!3m2!1sit!2sit!4v1728210616168!5m2!1sit!2sit"
                width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>`
    },

    contacts: {
        "generale": {
            id: "generale",
            titolo: "Generale",
            icon: "fas fa-address-book",
            descrizione: "Qualsiasi informazione o richiesta.",
            telefono: "+39 telefono",
            email: "email@email.ext"
        },
        "segreteria": {
            id: "segreteria",
            titolo: "Segreteria",
            icon: "fas fa-address-card",
            descrizione: "Informazioni su corsi, iscrizioni, orari e prove gratuite.",
            telefono: "",
            email: ""
        },
        "amministrazione": {
            id: "amministrazione",
            titolo: "Amministrazione",
            icon: "fas fa-file-invoice",
            descrizione: "Quote associative, pagamenti, certificati medici e fatturazione.",
            telefono: "",
            email: ""
        },
        "privacy": {
            id: "privacy",
            titolo: "Privacy e Tutela Dati",
            icon: "fas fa-user-shield",
            descrizione: "Richieste privacy, esenzione da foto/video ed esercizio dei diritti GDPR.",
            telefono: "",
            email: ""
        },
        "safeguardian": {
            id: "safeguarding",
            titolo: "Safeguarding",
            icon: "fas fa-shield-alt",
            descrizione: "Segnalazioni e richieste relative alla tutela e al benessere degli allievi.",
            telefono: "",
            email: ""
        },
        "eventi": {
            id: "eventi",
            titolo: "Eventi e Stage",
            icon: "fas fa-calendar-alt",
            descrizione: "Organizzazione di stage, esami di grado ed eventi della scuola.",
            telefono: "",
            email: ""
        }
    },
    
    social: [
        { name: "Facebook",  url: "https://facebook.com/dungsiacademy",  icon: "fab fa-facebook-f", color: "#1877F2" },
        { name: "Instagram", url: "https://instagram.com/...", icon: "fab fa-instagram",  color: "#E1306C" },
        { name: "TikTok",    url: "https://tiktok.com/@...",   icon: "fab fa-tiktok",     color: "#000000" },
        { name: "YouTube",   url: "https://youtube.com/...",   icon: "fab fa-youtube",    color: "#FF0000" },
        { name: "WhatsApp",  url: "https://wa.me/39...",       icon: "fab fa-whatsapp",   color: "#25D366" }
    ],

    brand: {
        name: "DŨNG SĨ Academy",
        logo: "./media/loghi/DungSi.svg",
        home: "./index.html",
        touchIcon: "./media/loghi/touch-icon.png",
        copertina: "./media/social/copertina.png"
    },

    legal: {
        denominazione: "[DA CONFERMARE: denominazione legale completa, es. A.S.D. DŨNG SĨ Academy]",
        codiceFiscale: "[DA CONFERMARE]",
        partitaIva: "[DA CONFERMARE, se presente]",
        sedeLegale: {
            via: "[DA CONFERMARE]",
            cap: "[DA CONFERMARE]",
            citta: "[DA CONFERMARE]"
        },
        rappresentanteLegale: "[DA CONFERMARE: nome del Presidente/legale rappresentante]",
        registrazione: "[DA CONFERMARE: n. iscrizione RUNTS o registro CONI/ente affiliante]",
        emailPrivacy: "[DA CONFERMARE: email per richieste privacy]"
    },

    associations: {
        asi : {
            logo: "./media/loghi/Logo-ASI.webp",
            subNum: "[DA CONFERMARE] A0000000",
            altText: "logo asi"
        }
    },

    // per elenco burger/navbar
    pages: [
        { name: "Home", href: "./index.html" },
        { name: "Chi Siamo", href: "./whoweare.html" },
        { name: "Contatti", href: "./contacts.html" },
    ]
};