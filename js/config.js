export const CONFIG = {

    annunci: [
        {
            id: "2026_esami_adulti",
            attivo: true,
            titolo: "Esame per il Passaggio di grado del corso adulti",
            data: "Venerdì 12 Giugno 2026 19:30",
            testo: "Si avvisa che venerdì 12 giugno alle 19:30 si effettueranno gli esami del corso adulti per il passaggio di grado. Si chiede abbigliamento completo e di arrivare almeno 10 minuti in anticipo.",
        },
        {
            id: "2026_esami_bambini",
            attivo: true,
            titolo: "Esame per il Passaggio di grado del corso bambini",
            data: "Domenica 31 Maggio 2026 9:00",
            testo: "Si avvisa che domenica 30 giugno alle 9:00 si effettueranno gli esami del corso bambini per il passaggio di grado. Si chiede abbigliamento completo e di arrivare almeno 10 minuti in anticipo.",
        }
    ],

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
            via: "Palestra Scuole Medie,</br> Via Friuli, 9",
            cap: "37040",
            citta: "Arcole (VR)"
        },
        map: `
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d897.085100866655!2d11.29127910901515!3d45.35786798512037!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477f4114e1748db3%3A0x239b9f730af2eed1!2sViet%20Vo%20Dao%20Dung%20Si!5e1!3m2!1sit!2sit!4v1728210616168!5m2!1sit!2sit"
                width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>`
    },

    contactPhone: "+39 telefono",
    
    social: [
        { name: "Facebook",  url: "https://facebook.com/dungsiacademy",  icon: "fab fa-facebook-f", color: "#1877F2" },
        { name: "Instagram", url: "https://instagram.com/...", icon: "fab fa-instagram",  color: "#E1306C" },
        { name: "TikTok",    url: "https://tiktok.com/@...",   icon: "fab fa-tiktok",     color: "#000000" },
        { name: "YouTube",   url: "https://youtube.com/...",   icon: "fab fa-youtube",    color: "#FF0000" },
        { name: "WhatsApp",  url: "https://wa.me/39...",       icon: "fab fa-whatsapp",   color: "#25D366" }
    ],

    brand: {
        name: "DŨNG SĨ Academy",
        logo: "./media/logo_DungSi.svg",
        home: "./index.html"
    },

    associations: {
        asi : {
            logo: "./media/Logo-ASI.png",
            subNum: "A0000000"
        }
    },

    pages: [
        { name: "Home", href: "./index.html" },
        { name: "Chi Siamo", href: "./whoweare.html" },
        { name: "Contatti", href: "./contacts.html" },
    ]
};