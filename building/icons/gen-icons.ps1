# gen-icons.ps1
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
# Requisiti:
#   - Inkscape installato (https://inkscape.org) e raggiungibile da PowerShell
#   - ImageMagick per generare favicon.ico (https://imagemagick.org) - opzionale
#
# Uso:
#   .\gen-icons.ps1 -Src "logo.svg"
#
# Se PowerShell blocca l'esecuzione di script, apri PowerShell come amministratore
# ed esegui una volta:
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

param(
    [Parameter(Mandatory = $true)]
    [string]$Src,

    [string]$OutRoot = "icons"
)

$ErrorActionPreference = "Stop"

# ---------- Controlli iniziali ----------

if (-not (Test-Path $Src)) {
    Write-Host "Errore: file non trovato: $Src" -ForegroundColor Red
    exit 1
}

# Trova l'eseguibile di Inkscape
$InkscapeExe = $null
if (Get-Command inkscape -ErrorAction SilentlyContinue) {
    $InkscapeExe = "inkscape"
} elseif (Test-Path "C:\Program Files\Inkscape\bin\inkscape.exe") {
    $InkscapeExe = "C:\Program Files\Inkscape\bin\inkscape.exe"
} elseif (Test-Path "C:\Program Files\Inkscape\inkscape.exe") {
    $InkscapeExe = "C:\Program Files\Inkscape\inkscape.exe"
} else {
    Write-Host "Errore: Inkscape non trovato." -ForegroundColor Red
    Write-Host "Installa da https://inkscape.org e assicurati che sia nel PATH,"
    Write-Host "oppure modifica questo script indicando il percorso completo di inkscape.exe."
    exit 1
}

$HasImageMagick = $true
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    $HasImageMagick = $false
    Write-Host "Attenzione: ImageMagick ('magick') non trovato: favicon.ico non verra' generato." -ForegroundColor Yellow
    Write-Host "Installa da https://imagemagick.org/script/download.php#windows"
}

# ---------- Struttura cartelle organizzata per categoria ----------

$Dirs = @{
    Favicon = Join-Path $OutRoot "favicon"
    Apple   = Join-Path $OutRoot "apple"
    Android = Join-Path $OutRoot "android"
    Windows = Join-Path $OutRoot "windows"
    Source  = Join-Path $OutRoot "source"
}

foreach ($d in $Dirs.Values) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# ---------- Rilevamento dimensioni del documento SVG ----------

Write-Host "Rilevo dimensioni del documento SVG..."

$W = $null
$H = $null
try {
    $W = & $InkscapeExe $Src --query-width 2>$null
    $H = & $InkscapeExe $Src --query-height 2>$null
} catch { }

if ([string]::IsNullOrWhiteSpace($W) -or [string]::IsNullOrWhiteSpace($H)) {
    Write-Host "Impossibile rilevare automaticamente le dimensioni."
    $W = Read-Host "Larghezza documento SVG (px)"
    $H = Read-Host "Altezza documento SVG (px)"
}

$W = [math]::Round([double]$W)
$H = [math]::Round([double]$H)

Write-Host "Dimensioni rilevate: $W x $H"

# ---------- Calcolo area quadrata centrata ----------

if ($W -ge $H) {
    $Side = $W
    $MarginY = [math]::Floor(($Side - $H) / 2)
    $X0 = 0
    $Y0 = -$MarginY
    $X1 = $Side
    $Y1 = $H + $MarginY
} else {
    $Side = $H
    $MarginX = [math]::Floor(($Side - $W) / 2)
    $X0 = -$MarginX
    $Y0 = 0
    $X1 = $W + $MarginX
    $Y1 = $Side
}

$ExportArea = "${X0}:${Y0}:${X1}:${Y1}"
Write-Host "Area di esportazione quadrata calcolata: $ExportArea (lato ${Side}px)"

# ---------- Funzione di esportazione PNG ----------

function Export-Png {
    param(
        [int]$Size,
        [string]$Name,
        [string]$Folder
    )
    Write-Host "  -> $Folder\$Name (${Size}x${Size})"
    $OutPath = Join-Path $Folder $Name
    & $InkscapeExe $Src `
        --export-type=png `
        --export-area=$ExportArea `
        -w $Size -h $Size `
        --export-filename=$OutPath | Out-Null
}

Write-Host ""
Write-Host "Genero favicon classici -> $($Dirs.Favicon)"
Export-Png 16 "favicon-16x16.png" $Dirs.Favicon
Export-Png 32 "favicon-32x32.png" $Dirs.Favicon
Export-Png 48 "favicon-48x48.png" $Dirs.Favicon
Export-Png 96 "favicon-96x96.png" $Dirs.Favicon

Write-Host "Genero icone Apple -> $($Dirs.Apple)"
Export-Png 120 "apple-touch-icon-120x120.png" $Dirs.Apple
Export-Png 152 "apple-touch-icon-152x152.png" $Dirs.Apple
Export-Png 167 "apple-touch-icon-167x167.png" $Dirs.Apple
Export-Png 180 "apple-touch-icon.png"          $Dirs.Apple

Write-Host "Genero icone Android / PWA manifest -> $($Dirs.Android)"
Export-Png 192 "icon-192x192.png" $Dirs.Android
Export-Png 512 "icon-512x512.png" $Dirs.Android

Write-Host "Genero tile Windows -> $($Dirs.Windows)"
Export-Png 150 "mstile-150x150.png" $Dirs.Windows

Write-Host "Genero versione SVG quadrata 'master' -> $($Dirs.Source)"
$OutSvg = Join-Path $Dirs.Source "logo-square.svg"
& $InkscapeExe $Src `
    --export-type=svg `
    --export-area=$ExportArea `
    --export-filename=$OutSvg | Out-Null

if ($HasImageMagick) {
    Write-Host "Genero favicon.ico multi-risoluzione -> $($Dirs.Favicon)"
    $Ico = Join-Path $Dirs.Favicon "favicon.ico"
    & magick (Join-Path $Dirs.Favicon "favicon-16x16.png") `
              (Join-Path $Dirs.Favicon "favicon-32x32.png") `
              (Join-Path $Dirs.Favicon "favicon-48x48.png") `
              $Ico
}

Write-Host ""
Write-Host "Fatto. Struttura generata in: $OutRoot\" -ForegroundColor Green
Get-ChildItem -Recurse $OutRoot | Where-Object { -not $_.PSIsContainer } |
    Select-Object @{N='File';E={$_.FullName.Substring((Resolve-Path $OutRoot).Path.Length + 1)}}

Write-Host ""
Write-Host "Ricorda di controllare visivamente favicon-16x16.png a dimensione reale:"
Write-Host "se il dettaglio del logo si perde, considera una versione semplificata."
Write-Host ""
Write-Host "Percorsi da usare nell'HTML (adatta il prefisso alla tua struttura sito):"
Write-Host '  /icons/favicon/favicon-32x32.png'
Write-Host '  /icons/apple/apple-touch-icon.png'
Write-Host '  /icons/android/icon-192x192.png'
Write-Host '  /icons/windows/mstile-150x150.png'