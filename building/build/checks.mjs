// building/build/checks.mjs
// Controlli post-render e sui dati: token irrisolti, placeholder
// "[DA CONFERMARE]"/"[...]" nei dati e nelle pagine generate.

export function checkUnresolvedTokens(html, pageKey) {
    const leftover = html.match(/\{\{[A-Z_0-9]+\}\}/g);
    if (leftover) {
        console.warn(`!!!! Pagina "${pageKey}": token non risolti rimasti nell'output -> ${[...new Set(leftover)].join(", ")}`);
        return true;
    }
    return false;
}

export function checkPlaceholderText(html, pageKey) {
    const patterns = [
        /\[DA CONFERMARE[^\]]*\]/gi,
        /\[DA DEFINIRE[^\]]*\]/gi,
        /\[\.\.\.\]/g
    ];
    const found = new Set();

    for (const regex of patterns) {
        const matches = html.match(regex);
        if (matches) {
            matches.forEach(match => found.add(match));
        }
    }

    if (found.size > 0) {
        console.warn(`!!!! Pagina "${pageKey}": placeholder provvisori trovati nell'output -> ${[...found].join(", ")}`);
        return true;
    }
    return false;
}

// Scansiona ricorsivamente un oggetto dati alla ricerca di placeholder.
export function checkConfigPlaceholders(config) {
    const placeholderRegex = /\[DA CONFERMARE[^\]]*\]|\[DA DEFINIRE[^\]]*\]|\[\.\.\.\]/gi;
    const issues = [];

    function scan(value, pathLabel) {
        if (typeof value === "string") {
            const matches = value.match(placeholderRegex);
            if (matches) {
                matches.forEach(match => issues.push(`${pathLabel}: ${match}`));
            }
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => scan(item, `${pathLabel}[${index}]`));
        } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, nested]) => scan(nested, `${pathLabel}.${key}`));
        }
    }

    scan(config, "dati");

    if (issues.length > 0) {
        console.warn("!!!! Attenzione: i file dati contengono valori provvisori o placeholder:");
        issues.forEach(issue => console.warn(`   - ${issue}`));
        return true;
    }
    return false;
}