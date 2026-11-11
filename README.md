# Naija Market

A mobile-friendly idle tycoon game. Pick a Nigerian business (jollof kitchen, farm, suya, snacks, drinks, provisions, fish, pepper market, fabrics or phone accessories), grow it from a roadside spot into a 1,000-seat flagship, then build an empire: managers, machines, export contracts, salaries, tax and up to 500 branches across Nigeria, Africa and the world.

Single static HTML page, no server needed. Progress is saved in the browser (localStorage).

## Play
Open `index.html`, or the GitHub Pages link once Pages is switched on. Drag to walk, loop your rope around crops, carry goods on your head, stand on price pads to upgrade, open **HQ** for the empire.

## Develop
- `src/` game code: `data.js` (businesses and prices), `plan.js` (generated empire content), `game.js`, `empire.js`, `audio.js`, `night.js`, `draw.js`, `head.html`.
- `plan/` design data per business, the economy model (`econ.json`, `econ_sim.py`) and the shared brief.
- `sh build.sh` regenerates `src/plan.js` and `index.html` (needs Node).

Business and buyer names in the game are invented. Prices are 2026 Lagos estimates; some are researched, others estimated.
