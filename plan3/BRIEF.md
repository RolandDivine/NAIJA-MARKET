# Naija Market: unit economics and rules research (brief shared by all research agents)

Naija Market is a mobile tycoon game set in Nigeria. Fourteen new businesses are planned. For each one a storyline already
exists in /home/claude/repo-clone/nm/plan2/<key>.json (read yours first: it has the 8 chapters, 5 product lines, staff, machines
and money mechanics). The general background is in /home/claude/repo-clone/nm/plan2/BRIEF.md.

Your job is the RESEARCH that turns your business into buildable game rules: real unit economics and real regulation, studied
from named real companies in the United States and in Nigeria, then simplified into numbers a game can run.

## How to work
- Use web search and fetch (aim for 8 to 14 searches). Prefer annual reports, regulator pages, central bank and stock exchange
  filings, and reputable business press. Record every source you rely on.
- Pick 2 real US case-study companies and 2 real Nigerian ones for your sector. Real names ARE allowed in "caseStudies",
  "regulation" and "sources" because this is a research document. Everything under "gameRules" and "stages" must use only invented
  or generic names (those go into the game).
- Mark every number as sourced or estimated. If you could not find a figure, say so; do not invent a source.
- Nothing may teach or reward fraud, bribery, tax evasion, money laundering or regulatory arbitrage. Regulation is shown as rules to meet.
- Respect every limit. Output valid JSON (UTF-8, double quotes, no comments, no trailing commas). Write it with the Write tool to
  /home/claude/repo-clone/nm/plan3/<key>.json, then validate:
  `node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'));console.log('ok')"`.
- Final reply: 3 lines or fewer (path plus anything I must know). Do not paste the JSON.

## JSON shape (use exactly these keys)
{
 "key": "...",
 "sector": "plain name of the sector",
 "howTheBusinessMakesMoney": "max 500 chars, plain words, the real-world model",
 "caseStudies": [exactly 4: {"company": "real name", "country": "US or Nigeria", "scale": "max 140 chars with one or two real figures and the year", "lesson": "max 220 chars: what the game should copy from how this company works", "source": "url"}],
 "unitEconomics": [5 to 8 rows, the key ratios of the sector: {"metric": "max 50 chars", "usTypical": "max 60 chars", "nigeriaTypical": "max 60 chars", "basis": "sourced or estimated", "source": "url or empty string"}],
 "costStructure": [4 to 7 rows that sum to about 100: {"item": "max 40 chars", "percentOfRevenue": number, "note": "max 100 chars"}],
 "regulation": [4 to 7 rows: {"rule": "max 50 chars", "unitedStates": "max 160 chars with the regulator", "nigeria": "max 160 chars with the regulator", "source": "url"}],
 "gameRules": [5 to 8 rules the engine will run, each a formula a programmer can code: {"name": "max 36 chars", "rule": "max 240 chars with exact numbers", "playerFeels": "max 100 chars", "simplifiedFrom": "max 120 chars"}],
 "stages": [exactly 8, matching the 8 storyline chapters in order: {"stage": "max 40 chars", "licenceOrGate": "max 100 chars, what must be met to enter this stage", "startupCostNaira": number, "monthlyRevenueNaira": number, "monthlyCostNaira": number, "staff": number, "customersPerDay": number}],
 "uniqueMechanics": [exactly 3, the things that make this business play differently from a market stall: {"name": "max 30 chars", "whatThePlayerDoes": "max 200 chars", "screenNeeded": "max 120 chars"}],
 "failureStates": [3 to 5: {"what": "max 60 chars", "trigger": "max 120 chars with a number", "consequence": "max 120 chars", "recovery": "max 120 chars"}],
 "balanceNotes": "max 500 chars: payback period per stage, where the player will feel stuck, what to tune first",
 "openQuestions": [2 to 4 strings, max 140 chars each, decisions the owner must make],
 "sources": [8 to 16: {"claim": "one sentence", "url": "..."}]
}
