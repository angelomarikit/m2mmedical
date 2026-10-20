#!/bin/sh
# Publish Vite dist to cPanel document root — overwrites matching paths only; does NOT delete other files/folders.
set -eu

DEPLOYPATH="${1:?Usage: cpanel-publish.sh /home/mmmedica/public_html/ [source_dir]}"
SRC="${2:-.}"

if [ ! -f "$SRC/index.html" ]; then
  echo "ERROR: $SRC/index.html missing — run npm run build first" >&2
  exit 1
fi

mkdir -p "$DEPLOYPATH"

# Core SPA files (always at domain root, not a subfolder)
cp -f "$SRC/index.html" "$DEPLOYPATH/"

if [ -d "$SRC/assets" ]; then
  mkdir -p "$DEPLOYPATH/assets"
  cp -R "$SRC/assets/." "$DEPLOYPATH/assets/"
fi

if [ -f "$SRC/.htaccess" ]; then
  cp -f "$SRC/.htaccess" "$DEPLOYPATH/.htaccess"
fi

# Other public assets (favicon, logo, og-image, robots, etc.)
for f in "$SRC"/*; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  case "$base" in
    index.html | assets | .cpanel.yml | cpanel-publish.sh) continue ;;
  esac
  cp -R "$f" "$DEPLOYPATH/"
done

echo "OK: Published built site to ${DEPLOYPATH} (unrelated files/folders preserved)"
