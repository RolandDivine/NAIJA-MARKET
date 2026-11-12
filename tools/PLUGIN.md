# Adding a new Naija Market business (plug-in brief)

Repo: /home/claude/repo-clone/nm. The game is one HTML5 canvas page built by `build.sh` from `src/*.js`, all files
concatenated into ONE function scope (no modules, no imports). Every helper in src/ is visible to your file.

## You may ONLY create or edit these two files
- `src/biz/<key>.js`  – your business: data, rules, HQ panel, map drawing
- `plan/<key>.json`   – your business's plan (story names, chatter, events, machines, milestones)
Never edit any other file. Never run `git`. Never run plain `sh build.sh` (other agents build at the same time).
If you truly need an engine change, finish without it and describe the change in your final report.

## Build and test (always with OUT and ONLY)
```
cd /home/claude/repo-clone/nm
mkdir -p /tmp/claude-0/-home-claude/d3ed3c76-af02-5d38-b492-0e3a8bd1451c/scratchpad/biz/<key>
OUT=/tmp/claude-0/-home-claude/d3ed3c76-af02-5d38-b492-0e3a8bd1451c/scratchpad/biz/<key>/page.html ONLY=<key> sh build.sh
node -e "const s=require('fs').readFileSync(process.argv[1],'utf8');new Function(s.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('syntax ok')" <that page.html>
node tools/testbiz.js <that page.html> <key> <that dir>/shots
```
testbiz plays the business fresh and fully built, runs 125 nights, taps every HQ button and saves screenshots
(0menu, 1start, 2full, 3hq, 4hq-after). LOOK at 2full.png and 3hq.png with the Read tool and fix what looks wrong.
`errors` must be empty apart from "Failed to load resource: net::ERR_FAILED" (fonts are blocked in tests).

## Study these first
- `src/school.js` and `src/ship.js` – two finished businesses using the same ideas (read them fully).
- `src/data.js` – the `L(...)` line helper and the `ship` and `school` entries (copy their shape).
- `plan/school.json` – the plan file shape you must copy exactly (all keys, chatter has staff/customer/manager/night).
- `plan3/<key>.json` – the RESEARCH (unit economics, game rules, 8 stages with costs, unique mechanics, failure states).
- `plan2/<key>.json` – the STORYLINE (owner, product lines with prices, stages, staff, events, risks).

## What your src/biz/<key>.js must contain
```js
/* ===== <Business name>: research rules from plan3/<key>.json on top of the shop engine ===== */
BIZ.<key>={name:'<exact name from plan2>',tag:'…',tone:'#hex',field:'<key>',isNew:true,qf:300,
  owner:{cloth,trim,hat},            // hat: none|cap|fila|gele|chef|straw|helmet|hard
  hand:'Store keeper',cook:'pharmacist',seller:'nurse aide',   // engine role names (lower case for cook/seller)
  outfit:{hand:{…},cook:{…},server:{…},cashier:{…},porter:{…}},
  venue:[5 names, smallest to biggest],
  costs:{venue:[v1,v2,v3,v4],line:[null,l2,l3,l4]},   // research stage startup costs; null = engine prices it
  lines:[ Object.assign(L(name,short,col,price,unit,'field',RAW,PROD,STATION),{w:10,qx:3}), … 5 lines ]};
BIZX.<key>={ demand(){}, lineW(i){}, sale(i,c,q,amt){return amt;}, gate(step){return null;},
  html(){return'';}, bind(){}, night(){return[];}, month(stmt){return{rows:[],cost:0,or:0};}, crew(){return[];},
  strip(s,f){}, base:'#hex', floor:[5 colours], locked(){return null;} };
```
- Line prices = the storyline/research prices (real naira). `w` = share of customers (cheap lines high, big-ticket low),
  `qx` = most units per customer. RAW/PROD are item defs: `[kind,colourA,colourB]`. Existing kinds: round chili tuber
  bundle leafy long plant sack carton bottle fish skewer ball wrap strip cloth basket pack tin gadget box40 doc book kit
  bowl cash. Existing stations: table pot grill cooler fryer scale desk bay board lab. Add your own with
  `XITEM.<kind>=(g,a,b)=>{…}` (draw on 2D context g around (0,0), ~26 px wide, bottom at y=0, use the helpers
  `R(g,x,y,w,h,r,col)`, `E(g,x,y,rx,ry,col)`) and `XSTATION.<kind>=(col,busy)=>{…}` (draw with the global `ctx` around
  (0,0), inside x −50..50 and y −46..28, using `rr(x,y,w,h,r,col)` and `ell(x,y,rx,ry,col)`; it is drawn once and
  cached, so ignore `busy`). 2D flat drawings only, no images.
- `strip(s,f)`: draws YOUR OWN MAP for field strip `s` (`s.li` = line index 0–4, `s.x`, `s.w`; field `f.y`, `f.h`), with
  the global `ctx`. Every business must have its own map layout (see campusStrip and portStrip in src/draw.js).
  Draw it simply: it is cached once.
- Hooks (all optional, all guarded by the engine): `demand()` multiplies customer arrivals; `lineW(i)` multiplies a
  line's share (0 closes it for now); `sale(i,c,q,amt)` returns the cash actually received for a sale (apply research
  costs here, record your state); `gate(step)` returns a '🔒 …' string to lock a step (step.base is 'venue'|'line'|…,
  step.n = which venue, step.arg = line number); `html()`/`bind()` add your section to HQ (use the classes in school.js:
  h2, .stats/.stat, .note, table, .acts, .seg, button.ghost; call `hqRender()` after a change); `night()` runs every
  night and returns statement rows `[label,'₦…',colour]`; `month(stmt)` runs on payday (stmt.short>0 = payroll short)
  and returns {rows,cost,or}; `crew()` returns payroll rows `{name,n,each}` at research salaries; `locked()` returns a
  message to keep the business card locked in the menu (or null).
- Keep state in `S.<short>` created lazily (see `schState()`), JSON-safe only (it is saved).
- Useful globals: S (this business's save), SAVE, B, G, lvl('line2'), stage() (0–4 venue), MONTH (30 days a month),
  S.day, S.money, S.mo.rev, revenue(i,vip), toast(text,secs), banner(title,sub), fanfare(big), beep(...), fmt(n),
  short(n), nice(n), rnd(a,b), pick(arr), evx('effect'), payrollList(), monthDue(full), levelOf(key), save(), hqRender().
- Event effects allowed in plan json: demand_up demand_down price_up supply_slow cost_hit bonus_cash vip_day speed_up.

## Rules from the owner (binding)
- Use the research figures. Where a number has no research figure, mark it `// estimate` and list it in your report.
- Everything is game money. No promised returns, no real-money claims, in any country or currency.
- Bribery, vote buying, rigging, exam cheating, fraud and any corruption must not exist anywhere, not even as an offer the
  player refuses. Remove such scenes from the storyline.
- People are never goods. Customers and staff are treated with care. 2D drawings only.
- Prices, rates and exchange rates that move do so week to week (`Math.floor(S.day/7)` changes), not daily.
- Long paybacks are fine: the game already has bank loans, group loans and partner money for every business.
- Words players read: short, plain, specific, friendly; the player is the hero; no hype, no fake urgency.

## Done means
- Builds, syntax ok, testbiz runs with no errors, screenshots look right (map is clearly your own; HQ section readable).
- Final report (under 250 words): what the player does, which research rules you implemented, estimates you made,
  anything you could not do, and any engine change you need.
