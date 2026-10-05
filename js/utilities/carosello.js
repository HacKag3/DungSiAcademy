import { clonaTemplate } from "./template.js";

// Caroselli caricati a runtime (modificabili su main senza rebuild):
// media/caroselli/manifest.json elenca le cartelle "<numero>_<nome>",
// e il manifest.json di ogni cartella elenca le sue immagini.
// Ogni voce dell'elenco può essere il solo nome della cartella oppure
// { "name": "1_viet", "autoplay": false } (autoplay assente = scorre da solo).
const CAROSELLI_ROOT = "./media/caroselli/";

// Chi ha chiesto al sistema di ridurre le animazioni non riceve l'autoplay.
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const carousels = new Map();

let folderIndexPromise = null;

async function getFolderIndex() {
    if (!folderIndexPromise) {
        folderIndexPromise = fetch(`${CAROSELLI_ROOT}manifest.json`, { cache: "no-cache" })
            .then(res => {
                if (!res.ok) throw new Error("manifest.json dei caroselli non trovato");
                return res.json();
            })
            .catch(err => {
                console.error("Impossibile leggere l'indice dei caroselli:", err);
                return [];
            });
    }
    return folderIndexPromise;
}

// Voce dell'elenco → { name, autoplay }, qualunque sia il formato usato.
function normalizeEntry(entry) {
    if (typeof entry === "string") return { name: entry, autoplay: true };
    if (entry && typeof entry.name === "string") return { name: entry.name, autoplay: entry.autoplay !== false };
    return null;
}

async function resolveFolder(caroselloNum) {
    const entries = (await getFolderIndex()).map(normalizeEntry).filter(Boolean);
    const prefix = `${caroselloNum}_`;
    return entries.find(entry => entry.name.startsWith(prefix)) ?? null;
}

async function getCarousel(caroselloNum) {
    const folder = await resolveFolder(caroselloNum);
    if (!folder) {
        console.warn(`Nessuna cartella trovata per il carosello ${caroselloNum} (prefisso "${caroselloNum}_" assente in ${CAROSELLI_ROOT}manifest.json).`);
        return { images: [], autoplay: false };
    }

    const path = `${CAROSELLI_ROOT}${folder.name}/`;
    try {
        const res = await fetch(`${path}manifest.json`, { cache: "no-cache" });
        if (!res.ok) throw new Error("manifest non trovato");
        const files = await res.json();
        return { images: files.map(name => `${path}${name}`), autoplay: folder.autoplay };
    } catch (err) {
        console.error(`Impossibile leggere il manifest per il carosello ${caroselloNum}:`, err);
        return { images: [], autoplay: false };
    }
}

// Il markup viene dai <template> di building/components/carosello/modelli.html.
function buildSlide(src, i, total) {
    const slide = clonaTemplate("tpl-carosello-slide");
    slide.querySelector(".slide").classList.toggle("is-active", i === 0);
    const img = slide.querySelector("img");
    img.src = src;
    img.alt = `Immagine ${i + 1} di ${total}`;
    img.loading = i === 0 ? "eager" : "lazy";
    return slide;
}

function buildPaginationItem(i) {
    const item = clonaTemplate("tpl-carosello-punto").querySelector(".item");
    item.classList.toggle("is-active", i === 0);
    item.dataset.slideIndex = i;
    item.setAttribute("aria-label", `Vai alla slide ${i + 1}`);
    return item;
}

async function initCarousel(caroselloNum, { simple = false, interval = 6400 } = {}) {
    const root = document.querySelector(`#carosello${caroselloNum}`);
    if (!root) {
        console.error(`Carosello ${caroselloNum} non trovato nel DOM.`);
        return;
    }

    const { images, autoplay } = await getCarousel(caroselloNum);
    if (images.length === 0) {
        root.hidden = true;
        return;
    }
    root.hidden = false;

    root.replaceChildren(clonaTemplate("tpl-carosello"));

    const slidesEl = root.querySelector(".slides");
    const paginationEl = root.querySelector(".pagination");

    slidesEl.append(...images.map((src, i) => buildSlide(src, i, images.length)));

    if (!simple && paginationEl) {
        paginationEl.append(...images.map((_, i) => buildPaginationItem(i)));
    }

    const previous = carousels.get(caroselloNum);
    if (previous?.timer) clearInterval(previous.timer);

    const state = {
        index: 0,
        slides: root.querySelectorAll(".slide"),
        items: paginationEl ? root.querySelectorAll(".item") : [],
        timer: null,
        interval,
        autoplay: autoplay && images.length > 1 && !prefersReducedMotion()
    };
    carousels.set(caroselloNum, state);

    render(state);
    startAutoPlay(caroselloNum);

    root.addEventListener("mouseenter", () => stopAutoPlay(caroselloNum));
    root.addEventListener("mouseleave", () => startAutoPlay(caroselloNum));

    root.addEventListener("click", (e) => {
        const arrowBtn = e.target.closest("[data-action]");
        if (arrowBtn) {
            changeSlide(caroselloNum, arrowBtn.dataset.action === "next" ? 1 : -1);
            return;
        }
        const pageBtn = e.target.closest("[data-slide-index]");
        if (pageBtn) {
            setSlide(caroselloNum, Number(pageBtn.dataset.slideIndex));
        }
    });

    root.setAttribute("tabindex", "0");
    root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") changeSlide(caroselloNum, -1);
        if (e.key === "ArrowRight") changeSlide(caroselloNum, 1);
    });

    let touchStartX = 0;
    root.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    root.addEventListener("touchend", (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) changeSlide(caroselloNum, delta < 0 ? 1 : -1);
    }, { passive: true });
}

function render(state) {
    state.slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === state.index);
    });
    state.items.forEach((item, i) => {
        item.classList.toggle("is-active", i === state.index);
    });
}

function setSlide(caroselloNum, index) {
    const state = carousels.get(caroselloNum);
    if (!state) return;
    stopAutoPlay(caroselloNum);
    state.index = ((index % state.slides.length) + state.slides.length) % state.slides.length;
    render(state);
    startAutoPlay(caroselloNum);
}

function changeSlide(caroselloNum, n) {
    const state = carousels.get(caroselloNum);
    if (!state) return;
    setSlide(caroselloNum, state.index + n);
}

// Con autoplay disattivato si cambia slide solo con frecce, punti, tastiera e swipe.
function startAutoPlay(caroselloNum) {
    const state = carousels.get(caroselloNum);
    if (!state?.autoplay) return;
    stopAutoPlay(caroselloNum);
    state.timer = setInterval(() => changeSlide(caroselloNum, 1), state.interval);
}

function stopAutoPlay(caroselloNum) {
    const state = carousels.get(caroselloNum);
    if (state?.timer) clearInterval(state.timer);
}

export function initAllCarousels() {
    document.querySelectorAll('.slideshow[id^="carosello"]').forEach((section) => {
        if (section.querySelector(".slideshow-inner")) return;

        const num = section.id.replace(/^carosello/, "");
        const simple = section.dataset.simple === "true";
        const interval = section.dataset.interval ? Number(section.dataset.interval) : undefined;
        initCarousel(num, { simple, ...(interval ? { interval } : {}) });
    });
}

document.addEventListener("DOMContentLoaded", () => initAllCarousels());
