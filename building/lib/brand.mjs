/**
 * Lettura della sezione `logo` di data/brand.json:
 *  - `loghi`: elenco dei loghi del brand ({ name, alt }); ogni logo vive in
 *    `{paths.root}/{name}/` (cartella generata con `npm run icone -- <name>`)
 *    e sul sito si usa la sua versione `source/logo-square.svg`;
 *  - `paths`: icone (favicon, apple, android, ...) relative alla cartella del
 *    logo principale (il primo di `loghi`).
 */

// File che vivono nella root del sito: non fanno parte della cartella icone.
const SITE_ROOT_KEYS = new Set(["manifest", "browserconfig"]);

// Versione quadrata del logo generata dallo script, usata in tutto il sito.
const LOGO_SQUARE_SVG = "source/logo-square.svg";

function joinUrl(root, relativePath) {
    if (!relativePath) return "";
    if (/^(https?:)?\/\//i.test(relativePath)) return relativePath;
    const cleanRoot = String(root ?? "").replace(/\/+$/, "");
    const cleanPath = String(relativePath).replace(/^\/+/, "");
    return cleanRoot ? `${cleanRoot}/${cleanPath}` : `/${cleanPath}`;
}

function resolveNode(node, root, key) {
    if (typeof node === "string") {
        return SITE_ROOT_KEYS.has(key) ? node : joinUrl(root, node);
    }
    if (node && typeof node === "object") {
        return Object.fromEntries(
            Object.entries(node).map(([k, v]) => [k, resolveNode(v, root, k)])
        );
    }
    return node;
}

/** Cartella di un logo: `{paths.root}/{name}`. */
function logoDir(brand, name) {
    return joinUrl(brand?.logo?.paths?.root, name);
}

/** Percorsi delle icone del logo principale, pronti per l'HTML. */
export function resolveIconPaths(brand) {
    const { root, ...rest } = brand?.logo?.paths ?? {};
    const mainLogo = getBrandLogos(brand)[0];
    return resolveNode(rest, mainLogo ? logoDir(brand, mainLogo.name) : root);
}

/**
 * Loghi del brand validi (con name), nell'ordine definito in data/brand.json,
 * con `path` ricavato dal nome: `./{paths.root}/{name}/source/logo-square.svg`.
 */
export function getBrandLogos(brand) {
    const loghi = brand?.logo?.loghi;
    if (!Array.isArray(loghi)) return [];
    return loghi
        .filter(logo => logo && typeof logo.name === "string" && logo.name)
        .map(logo => ({
            ...logo,
            path: `.${joinUrl(logoDir(brand, logo.name), LOGO_SQUARE_SVG)}`
        }));
}
