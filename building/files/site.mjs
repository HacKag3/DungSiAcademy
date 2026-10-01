// Manifest dell'app (icona e colori quando il sito viene aggiunto alla schermata home).
export default function site({ brand }) {
    const manifest = {
        name: brand.name,
        short_name: brand.name,
        description: brand.descrizione ?? "",
        start_url: "/index.html",
        display: "standalone",
        background_color: "#0E0E10",
        theme_color: brand.themeColor,
        icons: [
            { src: brand.icone.android?.["192"], sizes: "192x192", type: "image/png" },
            { src: brand.icone.android?.["512"], sizes: "512x512", type: "image/png" }
        ].filter((icon) => icon.src)
    };
    return { manifest: JSON.stringify(manifest) };
}
