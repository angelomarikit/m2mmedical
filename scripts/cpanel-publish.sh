#!/bin/sh
# Publish Vite dist to cPanel document root — overwrites matching paths only; does NOT delete other files/folders.
set -eu

DEPLOYPATH="${1:?Usage: cpanel-publish.sh /home/mmmedica/public_html/ [source_dir]}"
SRC="${2:-.}"

case "$DEPLOYPATH" in
  */) ;;
  *) DEPLOYPATH="${DEPLOYPATH}/" ;;
esac

if [ ! -f "$SRC/index.html" ]; then
  echo "ERROR: $SRC/index.html missing — run npm run build or deploy cpanel-release branch" >&2
  exit 1
fi

if [ ! -d "$DEPLOYPATH" ]; then
  echo "ERROR: DEPLOYPATH not a directory: $DEPLOYPATH" >&2
  exit 1
fi

echo "Publish source: $(cd "$SRC" && pwd)"
echo "Publish target: $DEPLOYPATH"

mkdir -p "$DEPLOYPATH"

cp -f "$SRC/index.html" "$DEPLOYPATH/"

if [ -d "$SRC/assets" ]; then
  mkdir -p "$DEPLOYPATH/assets"
  cp -R "$SRC/assets/." "$DEPLOYPATH/assets/"
else
  echo "ERROR: $SRC/assets missing" >&2
  exit 1
fi

if [ -f "$SRC/.htaccess" ]; then
  cp -f "$SRC/.htaccess" "$DEPLOYPATH/.htaccess"
fi

if [ -f "$SRC/DEPLOY_MANIFEST.json" ]; then
  cp -f "$SRC/DEPLOY_MANIFEST.json" "$DEPLOYPATH/DEPLOY_MANIFEST.json"
fi

for f in "$SRC"/*; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  case "$base" in
    index.html | assets | .cpanel.yml | cpanel-publish.sh | DEPLOY_MANIFEST.json) continue ;;
  esac
  cp -R "$f" "$DEPLOYPATH/"
done

# Verify index.html script/link targets exist at destination (catches stale 2017-only assets/)
html="$DEPLOYPATH/index.html"
missing=0
for rel in $(grep -oE '(src|href)="/assets/[^"]+"' "$html" | sed 's/.*="\(\/assets\/[^"]*\)".*/\1/'); do
  file="${DEPLOYPATH}${rel#/}"
  if [ ! -f "$file" ]; then
    echo "ERROR: index.html references missing file: $rel (expected $file)" >&2
    missing=1
  fi
done
if [ "$missing" -ne 0 ]; then
  exit 1
fi

js_count=$(find "$DEPLOYPATH/assets" -maxdepth 1 -name '*.js' 2>/dev/null | wc -l | tr -d ' ')
echo "OK: Published to ${DEPLOYPATH} — index.html updated, assets/*.js count at destination: ${js_count}"
echo "OK: Unrelated public_html files/folders were not removed."
