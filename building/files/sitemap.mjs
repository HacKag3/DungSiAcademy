export default function sitemap({ pages }) {
    return {
        voci: pages.filter((page) => page.sitemap),
        oggi: new Date().toISOString().slice(0, 10)
    };
}
