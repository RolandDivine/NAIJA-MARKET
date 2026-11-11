# Naija Market: empire expansion brief (shared by all planning agents)

Naija Market is a mobile arcade-idle game (single HTML canvas file). The player picks ONE of 10 Nigerian businesses and grows it.
Today each business has a "flagship" ladder of about 53 levels: 5 products, staff (farmhands, porters, cooks/packers, servers/sales girls, cashier),
delivery van, venue renovations from roadside stall to a 1,000-capacity mega venue, car, house, adverts. A game day runs 8 AM to 8 PM (about 4-5 real minutes).

Problem: after level 53 the game ends. The owner wants players to keep playing for 1,000 game days, growing from one shop to
500 stores (Lagos -> other Nigerian states -> West Africa -> international), with wholesale/export contracts, managers, monthly salaries and tax.

## New systems being built (the engine is fixed; you supply content/numbers)
1. EXPORT BAY: a loading dock at the flagship. Trucks arrive with bulk orders for packaged product. 6 contract tiers, small to large:
   (1) nearby shops/mall in the same city, (2) a Lagos supermarket chain, (3) hotels/caterers/institutions nationwide,
   (4) distributors in other Nigerian states, (5) West Africa (ECOWAS), (6) overseas diaspora markets (UK, US, etc.).
2. MACHINES (3 per business): "belt" = moves finished goods to the counter automatically; "auto" = harvests/collects raw goods automatically
   (e.g. tractor, trawler, forklift); "pack" = packaging line that raises export value.
3. BRANCHES: up to 500 stores opened one at a time across regions. Each needs a regional manager per region. Branches earn daily profit.
4. MANAGERS, monthly SALARIES for every staff member, monthly TAX, month-end statement.
5. Daily random EVENTS (one line of text + one effect) and speech-bubble CHATTER between staff, customers and the manager.
6. Evening routine: drive home in Lagos traffic with radio, eat dinner, bath, sleep, wake.

## Rules for all content
- Invent generic buyer/company names. NEVER use real brand or company names (no Shoprite, Jumia, Dangote, Indomie, etc.). Real city, state and country names are fine.
- Tone: warm, funny, clean. Light Nigerian Pidgin is welcome in chatter (e.g. "Oga, customer don full ground!"). No insults, no politics, no religion jokes, no tribe stereotypes.
- Respect every character limit. Output must be valid JSON (UTF-8, double quotes, no comments, no trailing commas).
- Write the JSON file with the Write tool, then validate it: `node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'));console.log('ok')"`.
- Your final reply must be 3 lines or fewer: the file path and anything I must know. Do not paste the JSON in the reply.
