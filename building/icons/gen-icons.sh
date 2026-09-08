#!/usr/bin/env bash

set -euo pipefail

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

DIR_FAVICON="${OUTROOT}/favicon"
DIR_APPLE="${OUTROOT}/apple"
DIR_ANDROID="${OUTROOT}/android"
DIR_WINDOWS="${OUTROOT}/windows"
DIR_SOURCE="${OUTROOT}/source"

mkdir -p "$DIR_FAVICON" "$DIR_APPLE" "$DIR_ANDROID" "$DIR_WINDOWS" "$DIR_SOURCE"

echo "Rilevo dimensioni del documento SVG..."
W=$(inkscape "$SRC" --query-width --query-id="" 2>/dev/null || true)
H=$(inkscape "$SRC" --query-height --query-id="" 2>/dev/null || true)

if [ -z "$W" ] || [ -z "$H" ]; then
  echo "Impossibile rilevare automaticamente le dimensioni."
  read -rp "Larghezza documento SVG (px): " W
  read -rp "Altezza documento SVG (px): " H
fi

W=$(printf "%.0f" "$W")
H=$(printf "%.0f" "$H")

echo "Dimensioni rilevate: ${W} x ${H}"

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