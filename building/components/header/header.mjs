// Loghi e voci di menu per header.html e burger.html (la pagina corrente non compare nel menu).
export default function header({ brand, nav, page }) {
    const [logoPrincipale, ...altriLoghi] = brand.loghi;
    return {
        logoPrincipale,
        altriLoghi,
        links: nav.filter((voce) => voce.output !== page.output)
    };
}
