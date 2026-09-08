const PLACEHOLDER_PATTERN = /\[DA CONFERMARE[^\]]*\]|\[DA DEFINIRE[^\]]*\]|\[\.\.\.\]/gi;

export function checkUnresolvedTokens(html, pageKey) {
    const leftover = html.match(/\{\{[A-Z_0-9]+\}\}/g);
    if (leftover) {
        console.warn(`!!!! Pagina "${pageKey}": token non risolti rimasti nell'output -> ${[...new Set(leftover)].join(", ")}`);
        return true;
    }
    return false;
}

export function checkPlaceholderText(html, pageKey) {
    const found = new Set(html.match(PLACEHOLDER_PATTERN) ?? []);

    if (found.size > 0) {
        console.warn(`!!!! Pagina "${pageKey}": placeholder provvisori trovati nell'output -> ${[...found].join(", ")}`);
        return true;
    }
    return false;
}

export function checkConfigPlaceholders(config) {
    const issues = [];

    function scan(value, pathLabel) {
        if (typeof value === "string") {
            const matches = value.match(PLACEHOLDER_PATTERN);
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
