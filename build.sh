#!/bin/sh
# Builds index.html (the full playable page) from src/. Run: sh build.sh
#   OUT=/some/dir/x.html sh build.sh   writes elsewhere (and keeps its own generated plan file)
#   ONLY=bank sh build.sh              includes only src/biz/bank.js of the plug-in businesses
# New businesses live in src/biz/<key>.js and plan/<key>.json and are picked up automatically.
cd "$(dirname "$0")"
OUT=${OUT:-index.html}
if [ "$OUT" = index.html ]; then PLANJS=src/plan.js; else PLANJS="$OUT.plan.js"; fi
node tools/mkplan.js "$PLANJS" >/dev/null || exit 1
if [ -n "$ONLY" ]; then BIZFILES="src/biz/$ONLY.js"; else BIZFILES=$(ls src/biz/*.js 2>/dev/null); fi
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  cat src/head.html; echo "<script>"; echo "(()=>{'use strict';"
  cat src/data.js "$PLANJS" src/game.js src/empire.js src/ship.js src/school.js $BIZFILES src/finance.js src/audio.js src/night.js src/travel.js src/draw.js src/account.js
  echo "})();"; echo "</script></body></html>"; } > "$OUT"
wc -c "$OUT"
