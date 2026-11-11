#!/bin/sh
# Builds index.html (the full playable page) from src/. Run: sh build.sh
cd "$(dirname "$0")"
node tools/mkplan.js
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  cat src/head.html; echo "<script>"; echo "(()=>{'use strict';"
  cat src/data.js src/plan.js src/game.js src/empire.js src/audio.js src/night.js src/draw.js
  echo "})();"; echo "</script></body></html>"; } > index.html
wc -c index.html
