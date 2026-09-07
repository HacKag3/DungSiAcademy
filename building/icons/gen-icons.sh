#!/usr/bin/env bash
#
# gen-icons.sh
#
# Genera tutte le icone necessarie per un sito web (favicon, apple-touch-icon,
# icone PWA/manifest, tile Windows) a partire da un logo SVG, anche se non
# quadrato: l'area di esportazione viene centrata automaticamente.
#
# Le icone vengono organizzate in sottocartelle per categoria:
#   icons/
#     favicon/    -> favicon-16x16.png, favicon-32x32.png, favicon-48x48.png,
#                    favicon-96x96.png, favicon.ico
#     apple/      -> apple-touch-icon-120x120.png, ...180x180.png (default)
#     android/    -> icon-192x192.png, icon-512x512.png
#     windows/    -> mstile-150x150.png
#     source/     -> logo-square.svg (versione quadrata master)
#
# Requisiti: inkscape, imagemagick (per favicon.ico, opzionale)
#
# Uso:
#   ./gen-icons.sh logo.svg [cartella_output]
#
# Esempio:
#   ./gen-icons.sh DungSi.svg
#   ./gen-icons.sh DungSi.svg img/favicons

set -euo pipefail

# ---------- Controlli iniziali ----------

if [ $# -lt 1 ]; then
  echo "Uso: $0 percorso/al/logo.svg [cartella_output]"
  exit 1
fi

SRC="$1"
OUTROOT="${2:-icons}"

if [ ! -f "$SRC" ]; then
  echo "Errore: file non trovato: $SRC"
  exit 1
fi

if ! command -v inkscape >/dev/null 2>&1; then
  echo "Errore: Inkscape non trovato nel PATH."
  echo "Installa con: sudo apt install inkscape   (Ubuntu/Debian)"
  echo "           o: brew install inkscape        (macOS)"
  exit 1
fi

HAS_IMAGEMAGICK=1
if ! command -v convert >/dev/null 2>&1; then
  HAS_IMAGEMAGICK=0
  echo "Attenzione: ImageMagick ('convert') non trovato: favicon.ico non verrà generato."
  echo "Installa con: sudo apt install imagemagick   (Ubuntu/Debian)"
  echo "           o: brew install imagemagick        (macOS)"
fi

# ---------- Struttura cartelle organizzata per categoria ----------

DIR_FAVICON="${OUTROOT}/favicon"
DIR_APPLE="${OUTROOT}/apple"
DIR_ANDROID="${OUTROOT}/android"
DIR_WINDOWS="${OUTROOT}/windows"
DIR_SOURCE="${OUTROOT}/source"

mkdir -p "$DIR_FAVICON" "$DIR_APPLE" "$DIR_ANDROID" "$DIR_WINDOWS" "$DIR_SOURCE"

# ---------- Rilevamento dimensioni del documento SVG ----------

echo "Rilevo dimensioni del documento SVG..."
W=$(inkscape "$SRC" --query-width --query-id="" 2>/dev/null || true)
H=$(inkscape "$SRC" --query-height --query-id="" 2>/dev/null || true)

if [ -z "$W" ] || [ -z "$H" ]; then
  echo "Impossibile rilevare automaticamente le dimensioni."
  read -rp "Larghezza documento SVG (px): " W
  read -rp "Altezza documento SVG (px): " H
fi

# Arrotonda a interi
W=$(printf "%.0f" "$W")
H=$(printf "%.0f" "$H")

echo "Dimensioni rilevate: ${W} x ${H}"

# ---------- Calcolo area quadrata centrata ----------

if [ "$W" -ge "$H" ]; then
  SIDE=$W
  MARGIN_Y=$(( (SIDE - H) / 2 ))
  X0=0
  Y0=$(( -MARGIN_Y ))
  X1=$SIDE
  Y1=$(( H + MARGIN_Y ))
else
  SIDE=$H
  MARGIN_X=$(( (SIDE - W) / 2 ))
  X0=$(( -MARGIN_X ))
  Y0=0
  X1=$(( W + MARGIN_X ))
  Y1=$SIDE
fi

EXPORT_AREA="${X0}:${Y0}:${X1}:${Y1}"
echo "Area di esportazione quadrata calcolata: $EXPORT_AREA (lato ${SIDE}px)"

# ---------- Funzione di esportazione PNG ----------

export_png () {
  local size="$1"
  local name="$2"
  local folder="$3"
  echo "  -> ${folder}/${name} (${size}x${size})"
  inkscape "$SRC" \
    --export-type=png \
    --export-area="$EXPORT_AREA" \
    -w "$size" -h "$size" \
    --export-filename="${folder}/${name}" >/dev/null 2>&1
}

echo ""
echo "Genero favicon classici -> ${DIR_FAVICON}"
export_png 16 favicon-16x16.png "$DIR_FAVICON"
export_png 32 favicon-32x32.png "$DIR_FAVICON"
export_png 48 favicon-48x48.png "$DIR_FAVICON"
export_png 96 favicon-96x96.png "$DIR_FAVICON"

echo "Genero icone Apple -> ${DIR_APPLE}"
export_png 120 apple-touch-icon-120x120.png "$DIR_APPLE"
export_png 152 apple-touch-icon-152x152.png "$DIR_APPLE"
export_png 167 apple-touch-icon-167x167.png "$DIR_APPLE"
export_png 180 apple-touch-icon.png          "$DIR_APPLE"

echo "Genero icone Android / PWA manifest -> ${DIR_ANDROID}"
export_png 192 icon-192x192.png "$DIR_ANDROID"
export_png 512 icon-512x512.png "$DIR_ANDROID"

echo "Genero tile Windows -> ${DIR_WINDOWS}"
export_png 150 mstile-150x150.png "$DIR_WINDOWS"

echo "Genero versione SVG quadrata 'master' -> ${DIR_SOURCE}"
inkscape "$SRC" \
  --export-type=svg \
  --export-area="$EXPORT_AREA" \
  --export-filename="${DIR_SOURCE}/logo-square.svg" >/dev/null 2>&1

if [ "$HAS_IMAGEMAGICK" -eq 1 ]; then
  echo "Genero favicon.ico multi-risoluzione -> ${DIR_FAVICON}"
  convert "${DIR_FAVICON}/favicon-16x16.png" "${DIR_FAVICON}/favicon-32x32.png" "${DIR_FAVICON}/favicon-48x48.png" "${DIR_FAVICON}/favicon.ico"
fi

echo ""
echo "Fatto. Struttura generata in: ${OUTROOT}/"
find "$OUTROOT" -type f | sort

echo ""
echo "Ricorda di controllare visivamente favicon-16x16.png a dimensione reale:"
echo "se il dettaglio del logo si perde, considera una versione semplificata."
echo ""
echo "Percorsi da usare nell'HTML (adatta il prefisso alla tua struttura sito):"
echo "  /icons/favicon/favicon-32x32.png"
echo "  /icons/apple/apple-touch-icon.png"
echo "  /icons/android/icon-192x192.png"
echo "  /icons/windows/mstile-150x150.png"