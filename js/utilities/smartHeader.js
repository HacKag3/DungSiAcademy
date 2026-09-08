// Gestione condivisa della comparsa/scomparsa di header e burger allo scroll.
//
// Prima header.js e burger.js implementavano ciascuno la propria copia di
// questa logica (con soglie diverse e reazioni indipendenti), con due bug
// evidenti: l'header spariva dopo 1px di scroll lasciando scoperta la banda
// del padding-top del body, e la chiusura del burger (che ripristina lo
// scroll con un salto) nascondeva tutto all'istante.
//
// Regole:
//  - entro l'altezza dell'header è sempre visibile: qui il padding-top del
//    body che gli riserva lo spazio sarebbe una banda vuota se nascondesse;
//  - verso il basso si nasconde solo dopo uno scroll deciso (HIDE_AFTER_PX),
//    non a ogni pixel;
//  - verso l'alto ricompare dopo una soglia minima (SHOW_AFTER_PX) per non
//    reagire al micro-jitter del touchpad;
//  - mentre il menu burger è aperto lo scroll è bloccato e la logica è
//    sospesa; alla chiusura lo stato si riallinea alla posizione reale e,
//    se si è oltre la zona di rispetto, header/burger si nascondono di nuovo
//    ma solo a fine animazione della sidebar (niente strappi simultanei).

const HIDE_AFTER_PX = 64;        // px di scroll in giù prima di nascondere
const SHOW_AFTER_PX = 12;        // px di scroll in su per farlo riapparire
const MENU_CLOSE_DELAY_MS = 420; // poco oltre la transizione sidebar (350ms)

const state = {
    els: [],
    lastY: 0,
    acc: 0,
    hidden: false,
    menuOpen: false,
    rehideTimer: null,
    ticking: false,
};

function applyVisibility(hidden) {
    state.hidden = hidden;
    for (const el of state.els) {
        el.classList.toggle("nav-hidden", hidden);
        el.classList.toggle("nav-visible", !hidden);
    }
}

// Zona di rispetto: finché il scroll è qui dentro l'header non si nasconde,
// perché il padding-top del body (che gli riserva lo spazio in-flow) sarebbe
// parzialmente in vista e si vedrebbe il vuoto al suo posto.
function topZone() {
    let h = 0;
    for (const el of state.els) h = Math.max(h, el.offsetHeight);
    return h;
}

function update() {
    state.ticking = false;
    if (state.menuOpen) return;

    const y = Math.max(window.scrollY, 0);
    const delta = y - state.lastY;
    state.lastY = y;

    if (y <= topZone()) {
        state.acc = 0;
        if (state.hidden) applyVisibility(false);
        return;
    }

    if (delta > 0) {
        // scroll verso il basso: serve un intento deciso per nascondere
        state.acc = state.acc > 0 ? state.acc + delta : delta;
        if (!state.hidden && state.acc >= HIDE_AFTER_PX) {
            state.acc = 0;
            applyVisibility(true);
        }
    } else if (delta < 0) {
        // scroll verso l'alto: ricompare dopo una soglia minima
        state.acc = state.acc < 0 ? state.acc + delta : delta;
        if (state.hidden && state.acc <= -SHOW_AFTER_PX) {
            state.acc = 0;
            applyVisibility(false);
        }
    }
}

// Registra gli elementi che devono nascondersi/mostrarsi in sync (header e
// burger). Da chiamare una sola volta: gli elementi <header> e #burger
// persistono per tutta la vita della pagina.
export function initSmartHeader(...elements) {
    state.els = elements.filter(Boolean);
    if (!state.els.length) return;

    state.lastY = Math.max(window.scrollY, 0);
    applyVisibility(false);

    window.addEventListener("scroll", () => {
        if (!state.ticking) {
            state.ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
}

// Menu aperto: header e burger restano visibili (l'icona deve restare
// raggiungibile per poter chiudere) e la logica di scroll è sospesa finché
// il menu non si chiude.
export function smartHeaderMenuOpened() {
    state.menuOpen = true;
    if (state.rehideTimer) {
        clearTimeout(state.rehideTimer);
        state.rehideTimer = null;
    }
    state.acc = 0;
    if (state.hidden) applyVisibility(false);
}

// Menu chiuso: riassorbe la posizione di scroll reale (il salto di
// scrollTo del ripristino non deve contare come scroll utente) e, se si è
// oltre la zona di rispetto, ri-nasconde dopo l'animazione di uscita della
// sidebar, così le due transizioni non si sovrappongono.
export function smartHeaderMenuClosed() {
    state.menuOpen = false;
    state.lastY = Math.max(window.scrollY, 0);
    state.acc = 0;
    if (state.rehideTimer) clearTimeout(state.rehideTimer);

    if (state.lastY > topZone()) {
        state.rehideTimer = setTimeout(() => {
            state.rehideTimer = null;
            if (!state.menuOpen && Math.max(window.scrollY, 0) > topZone()) {
                applyVisibility(true);
                state.lastY = Math.max(window.scrollY, 0);
            }
        }, MENU_CLOSE_DELAY_MS);
    }
}
