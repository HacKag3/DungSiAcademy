const HIDE_AFTER_PX = 64;
const SHOW_AFTER_PX = 12;
const MENU_CLOSE_DELAY_MS = 420;

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
        state.acc = state.acc > 0 ? state.acc + delta : delta;
        if (!state.hidden && state.acc >= HIDE_AFTER_PX) {
            state.acc = 0;
            applyVisibility(true);
        }
    } else if (delta < 0) {
        state.acc = state.acc < 0 ? state.acc + delta : delta;
        if (state.hidden && state.acc <= -SHOW_AFTER_PX) {
            state.acc = 0;
            applyVisibility(false);
        }
    }
}

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

export function smartHeaderMenuOpened() {
    state.menuOpen = true;
    if (state.rehideTimer) {
        clearTimeout(state.rehideTimer);
        state.rehideTimer = null;
    }
    state.acc = 0;
    if (state.hidden) applyVisibility(false);
}

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
