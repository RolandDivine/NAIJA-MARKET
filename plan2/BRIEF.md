# Naija Market: new businesses and storylines (brief shared by all planning agents)

Naija Market is a mobile arcade-idle tycoon game set in Nigeria. Today the player picks one of 10 market businesses
(cooked food, farm produce, suya, snacks, drinks, provisions, fish, pepper, fabrics, phone accessories), grows a flagship
shop through about 53 levels, then builds an empire: manager, machines, export contracts, 500 branches across Nigeria, Africa
and the world, monthly salaries and tax, an evening routine at home, and travel by car and plane to inspect branches.

How the game plays (the engine every business must fit):
- The player walks a character around one site. "Raw goods" are collected (from a field, a yard, or a delivery truck), carried to
  "stations" where staff turn them into "products", then carried to a counter where customers buy. Each business has 5 product lines.
- Upgrades are bought by standing on price pads: more lines, more staff, better stations, bigger venue (5 venue stages), car, house, adverts.
- Later: managers, machines that automate carrying, bulk contracts, branches in other cities and countries, travel to visit them.

The owner now wants NEW, bigger kinds of business with a strong "from the ground to the top" storyline, where the owner must
travel regularly. You design ONE of them (named in your task). Make it feel real for Nigeria in 2026, but playable in this engine.

## Rules for all content
- Invent all company, bank, school, party and people names. NEVER use real brands, real companies, real banks, real schools,
  real politicians or real parties. Real cities, countries, regulators' generic roles ("the central bank", "the securities regulator") are fine.
- Tone: warm, aspirational, funny, clean. Light Nigerian Pidgin is welcome in dialogue. No insults, no religion or tribe jokes, no partisan politics.
- Nothing that teaches or rewards fraud, bribery, tax evasion, money laundering or rigging. If the real sector has these risks, they appear only
  as problems the player must avoid or clean up (for example "an auditor finds a ghost worker: remove them").
- Respect every character limit. Output valid JSON (UTF-8, double quotes, no comments, no trailing commas).
- Write the file with the Write tool, then validate: `node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'));console.log('ok')"`.
- Final reply: 3 lines or fewer (file path plus anything I must know). Do not paste the JSON.

## JSON shape (use exactly these keys)
{
 "key": "short lower-case id",
 "name": "business name shown in the game, invented, max 30 chars",
 "tagline": "max 70 chars",
 "ownerCharacter": {"name": "invented Nigerian name with title, max 22 chars", "look": "max 160 chars: age, build, clothes, colours, one signature prop, for a 3D character artist", "backstory": "max 240 chars"},
 "storyline": [exactly 8 chapters from the ground to the top: {"title": "max 30 chars", "stage": "what the business physically is at this point, max 90 chars", "story": "max 260 chars, what happens and what is at stake", "unlock": "max 90 chars, the new thing the player gets"}],
 "productLines": [exactly 5: {"name": "max 26 chars", "raw": "what is collected, max 40 chars", "station": "where staff process it, max 40 chars", "customer": "who buys or uses it, max 50 chars", "price": number in naira per unit (realistic 2026 Nigeria), "priceNote": "max 80 chars, why this price"}],
 "howItFitsTheEngine": "max 400 chars: what the player physically carries, where from, where to, and what customers do",
 "staffRoles": [5 to 7: {"role": "max 24 chars", "does": "max 80 chars", "look": "max 110 chars for the 3D artist", "monthlySalary": number in naira}],
 "machines": [exactly 3 automation upgrades, small to large: {"name": "max 26 chars", "does": "max 90 chars", "look": "max 110 chars for the 3D artist"}],
 "moneyMechanics": [3 to 6 rules special to this business: {"rule": "max 36 chars", "howItWorks": "max 200 chars, with numbers", "realBasis": "max 160 chars, the real-world practice it simplifies"}],
 "travel": [exactly 5 places the owner must travel to, nearest first: {"place": "real city or country", "why": "max 110 chars", "how": "car, domestic flight or international flight"}],
 "rivalsAndAllies": [3 to 4: {"name": "invented, max 24 chars", "role": "rival, mentor, regulator, partner or family", "line": "one thing they say, max 80 chars"}],
 "events": [exactly 8 random daily events: {"name": "max 28 chars", "text": "max 90 chars", "good": true or false}],
 "endgame": "max 240 chars: what 'the top' looks like for this business",
 "risksToHandleCarefully": "max 240 chars: anything in this theme the game should treat with care (children, politics, gambling-like mechanics, real money)",
 "research": [3 to 6: {"claim": "one sentence fact you found", "url": "source url"}]
}
