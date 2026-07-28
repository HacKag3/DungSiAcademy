const CAROSELLI_ROOT = "./media/caroselli/";
const IMG_EXTENSION = ".jpg";

const carousels = new Map();

let folderIndexPromise = null;


async function getFolderIndex() {
    if (!folderIndexPromise) {
        folderIndexPromise = fetch(`${CAROSELLI_ROOT}manifest.json`)
            .then(res => {
                if (!res.ok) throw new Error("index.json non trovato");
                return res.json();
            })
            .catch(err => {
                console.error("Impossibile leggere l'indice dei caroselli:", err);
                return [];
            });
    }
    return folderIndexPromise;
}

async function resolveFolderName(caroselloNum) {
    const folders = await getFolderIndex();
    const prefix = `${caroselloNum}_`;
    return folders.find(name => name.startsWith(prefix)) ?? null;
}

async function getImages(caroselloNum) {
    const folderName = await resolveFolderName(caroselloNum);
    if (!folderName) {
        console.warn(`Nessuna cartella trovata per il carosello ${caroselloNum} (prefisso "${caroselloNum}_" assente in index.json).`);
        return [];
    }

    const path = `${CAROSELLI_ROOT}${folderName}/`;
    try {
        const res = await fetch(`${path}manifest.json`);
        if (!res.ok) throw new Error("manifest non trovato");
        const files = await res.json();
        return files.map(name => `${path}${name}${IMG_EXTENSION}`);
    } catch (err) {
        console.error(`Impossibile leggere il manifest per il carosello ${caroselloNum}:`, err);
        return [];
    }
}

function buildCarouselSkeleton() {
    const arrowIcon = `
        <svg viewBox="0 0 14 26">
            <path d="M 9 20 l -9 -10 l 9 -10 l 5 2 l -7 8 l 7 8 z" />
        </svg>`;

    return `
        <div class="slideshow-inner">
            <div class="slides"></div>
            <div class="pagination"></div>
            <div class="arrows">
                <button type="button" class="arrow prev" data-action="prev" aria-label="Slide precedente">
                    ${arrowIcon}
                </button>
                <button type="button" class="arrow next" data-action="next" aria-label="Prossima slide">
                    ${arrowIcon}
                </button>
            </div>
        </div>
    `;
}

function buildSlidesMarkup(images) {
    return images.map((src, i) => `
        <div class="slide ${i === 0 ? 'is-active' : ''}">
            <div class="image-container">
                <img src="${src}" alt="Immagine ${i + 1} di ${images.length}" class="image"
                     loading="${i === 0 ? 'eager' : 'lazy'}"/>
            </div>
        </div>`).join("");
}

function buildPaginationMarkup(images) {
    return images.map((_, i) => `
        <button type="button" class="item ${i === 0 ? 'is-active' : ''}"
                data-slide-index="${i}" aria-label="Vai alla slide ${i + 1}">
        </button>`).join("");
}

async function initCarousel(caroselloNum, { simple = false, interval = 6400 } = {}) {
    const root = document.querySelector(`#carosello${caroselloNum}`);
    if (!root) {
        console.error(`Carosello ${caroselloNum} non trovato nel DOM.`);
        return;
    }

    const images = await getImages(caroselloNum);
    if (images.length === 0) {
        root.hidden = true;
        return;
    }
    root.hidden = false;

    root.innerHTML = buildCarouselSkeleton();

    const slidesEl = root.querySelector(".slides");
    const paginationEl = root.querySelector(".pagination");

    slidesEl.innerHTML = buildSlidesMarkup(images);

    if (!simple && paginationEl) {
        paginationEl.innerHTML = buildPaginationMarkup(images);
    }

    const state = {
        index: 0,
        slides: root.querySelectorAll(".slide"),
        items: paginationEl ? root.querySelectorAll(".item") : [],
        timer: null,
        interval,
        simple
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
            goToSlide(caroselloNum, Number(pageBtn.dataset.slideIndex));
        }
    });

    // Navigazione da tastiera
    root.setAttribute("tabindex", "0");
    root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") changeSlide(caroselloNum, -1);
        if (e.key === "ArrowRight") changeSlide(caroselloNum, 1);
    });

    // Swipe touch
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

function changeSlide(caroselloNum, n) {
    const state = carousels.get(caroselloNum);
    if (!state) return;
    stopAutoPlay(caroselloNum);
    state.index = (state.index + n + state.slides.length) % state.slides.length;
    render(state);
    startAutoPlay(caroselloNum);
}

function goToSlide(caroselloNum, n) {
    const state = carousels.get(caroselloNum);
    if (!state) return;
    stopAutoPlay(caroselloNum);
    state.index = n;
    render(state);
    startAutoPlay(caroselloNum);
}

function startAutoPlay(caroselloNum) {
    const state = carousels.get(caroselloNum);
    if (!state) return;
    stopAutoPlay(caroselloNum);
    state.timer = setInterval(() => changeSlide(caroselloNum, 1), state.interval);
}

function stopAutoPlay(caroselloNum) {
    const state = carousels.get(caroselloNum);
    if (state?.timer) clearInterval(state.timer);
}

/* inizializza automaticamente tutti i caroselli presenti nella pagina corrente */
function initAllCarousels() {
    document.querySelectorAll('.slideshow[id^="carosello"]').forEach((section) => {
        const num = section.id.replace(/^carosello/, "");
        const simple = section.dataset.simple === "true";
        const interval = section.dataset.interval ? Number(section.dataset.interval) : undefined;
        initCarousel(num, { simple, ...(interval ? { interval } : {}) });
    });
}

document.addEventListener("DOMContentLoaded", () => initAllCarousels());


// Esportate per eventuale controllo/inizializzazione programmatica esterna.
window.initCarousel = initCarousel;
window.initAllCarousels = initAllCarousels;
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;