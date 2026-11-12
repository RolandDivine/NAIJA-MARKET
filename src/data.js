/* ===== businesses: 10 independent shops, 5 product lines each. Prices: Lagos retail, Nov 2026 ===== */
const L=(n,short,col,price,unit,src,raw,prod,st)=>({n,short,col,price,unit,src,raw,prod,st});
const BIZ={
nkechi:{name:"Mama Nkechi's Kitchen",tag:'Cooked food',tone:'#e8541e',field:'farm',food:true,owner:{cloth:'#e8501e',trim:'#ffc23d',hat:'gele'},
  venue:['Roadside bench','Canopy and tables','Buka','Restaurant, 150 seats','Grand Restaurant, 1,000 seats'],
  lines:[
   L('Jollof rice and beef','Jollof','#e8541e',2000,'plate','field',['round','#e2301f','#3aa336'],['plate','#e8541e',null,['#b92c14','#ffcf4a'],'#6b3a1f'],'pot'),
   L('Fried rice and chicken','Fried rice','#e0b400',3500,'plate','depot',['sack','#f4f1ea','#2f8f5b'],['plate','#f0d36a',null,['#3fa34d','#f08a24','#e2553c'],'#c98a3a'],'pot'),
   L('Pounded yam and egusi','Poundo','#f08c1a',3000,'plate','depot',['tuber','#7b4a22'],['plate','#fbf6e6','#e0a021',['#3f8f3a'],'#7a3b1c'],'pot'),
   L('Amala, ewedu and gbegiri','Amala','#3f9a3a',2500,'plate','depot',['sack','#b08a5a','#5b3a29'],['plate','#4a2f22','#3f9a3a',['#e8b93a'],'#7a3b1c'],'pot'),
   L('Cold bottled water','Water','#2a9fd6',300,'50cl bottle','depot',['sack','#bfe6fb','#2a9fd6'],['bottle','#8fd3f7','#1e6fb5'],'cooler')]},
tunde:{name:'Baba Tunde Farm Produce',tag:'Farm produce',tone:'#3f9a3a',field:'farm',owner:{cloth:'#2a62c9',trim:'#9cc4ff',hat:'fila'},
  venue:['Table-top stall','Canopy stall','Lock-up shop','Produce depot','Agro mega-market'],
  lines:[
   L('Yam tubers','Yam','#b5651d',3000,'medium tuber','field',['tuber','#7b4a22'],['bundle','#7b4a22','#e8c36a'],'table'),
   L('Ugu leaves','Ugu','#2e8b3d',500,'bunch','field',['leafy','#2e8b3d',null],['leafy','#2e8b3d','#e8c36a'],'table'),
   L('Cucumbers','Cucumber','#6fbf4a',300,'piece','field',['long','#3f9a3a','#2c6e2a'],['basket','#3f9a3a'],'table'),
   L('Local rice','Rice','#d9b84a',1000,'derica','field',['plant','#d9c36a'],['sack','#f4f1ea','#c62828'],'table'),
   L('Plantain','Plantain','#f2c230',3500,'small bunch','field',['long','#f2c230','#6a8f2a'],['basket','#f2c230'],'table')]},
musa:{name:'Mallam Musa Suya Spot',tag:'Suya and grills',tone:'#b8431f',field:'pasture',food:true,owner:{cloth:'#f4f1ea',trim:'#2f8f5b',hat:'cap'},
  venue:['Roadside grill','Canopy and benches','Suya joint','Grill house, 150 seats','Grand Grill Arena, 1,000 seats'],
  lines:[
   L('Beef suya','Beef suya','#b8431f',2000,'wrap','field',['cow'],['skewer','#8a3a16','#d4572a'],'grill'),
   L('Chicken suya','Chicken','#e09a2b',3500,'portion','field',['chicken'],['skewer','#c9892f','#f0b95a'],'grill'),
   L('Asun (peppered goat)','Asun','#c62828',4000,'portion','field',['goat'],['plate','#7a3b1c',null,['#e2301f','#3f9a3a'],null],'grill'),
   L('Masa','Masa','#caa66a',500,'5 pieces','depot',['sack','#f4f1ea','#b98b4e'],['ball','#f6ead0','#e0c89a'],'fryer'),
   L('Zobo drink','Zobo','#a8244a',500,'50cl bottle','depot',['sack','#7a1532','#a8244a'],['bottle','#8e1438','#f4f1ea'],'cooler')]},
basira:{name:'Iya Basira Snacks',tag:'Akara and puff-puff',tone:'#f0b440',field:'farm',food:true,owner:{cloth:'#7a1f6a',trim:'#f2d16b',hat:'gele'},
  venue:['Roadside fryer','Canopy and benches','Snack shop','Fast-food restaurant, 150 seats','Snack Palace, 1,000 seats'],
  lines:[
   L('Akara','Akara','#d9822b',500,'5 balls','field',['plant','#e9dcc0'],['ball','#c9762a','#e59a45'],'fryer'),
   L('Puff-puff','Puff-puff','#f0b440',500,'5 balls','depot',['sack','#f4f1ea','#e0a021'],['ball','#e3a53a','#f6cf7a'],'fryer'),
   L('Fried yam and dodo','Dodo','#e8961e',1000,'portion','field',['long','#f2c230','#6a8f2a'],['plate','#f2b430',null,['#c9762a','#e8d08a'],null],'fryer'),
   L('Egg roll','Egg roll','#b9783a',500,'one','depot',['carton','#e9dcc0','#b98b4e'],['wrap','#c9853a','#f4e2b0'],'fryer'),
   L('Moi-moi','Moi-moi','#3f8f3a',500,'wrap','depot',['sack','#c9a15a','#7b4a22'],['wrap','#e2703a','#3f8f3a'],'pot')]},
zainab:{name:'Aunty Zainab Drinks',tag:'Zobo, kunu and juice',tone:'#a8244a',field:'farm',food:true,owner:{cloth:'#0f7a5a',trim:'#f2d16b',hat:'gele'},
  venue:['Cooler by the road','Canopy and benches','Drinks kiosk','Juice bar, 150 seats','Drinks Lounge, 1,000 seats'],
  lines:[
   L('Zobo','Zobo','#a8244a',500,'50cl bottle','field',['plant','#a8244a'],['bottle','#8e1438','#f4f1ea'],'cooler'),
   L('Kunu','Kunu','#cdb98a',500,'50cl bottle','field',['plant','#d9c36a'],['bottle','#efe3c2','#b98b4e'],'cooler'),
   L('Tiger nut drink','Kunu aya','#9a6b3a',700,'50cl bottle','field',['plant','#9a6b3a'],['bottle','#d9b98a','#7b4a22'],'cooler'),
   L('Chapman','Chapman','#f26a2a',2500,'glass','field',['round','#f08a24','#3aa336'],['bottle','#f2552a','#3aa336'],'cooler'),
   L('Bottled water','Water','#2a9fd6',300,'50cl bottle','depot',['sack','#bfe6fb','#2a9fd6'],['bottle','#8fd3f7','#1e6fb5'],'cooler')]},
chidi:{name:'Chidi Provisions Store',tag:'Provisions',tone:'#e8b21e',field:'yard',owner:{cloth:'#d62828',trim:'#f4f1ea',hat:'cap'},
  venue:['Table-top stall','Kiosk','Lock-up shop','Supermarket','Mega mart'],
  lines:[
   L('Instant noodles','Noodles','#e8b21e',450,'70g pack','field',['carton','#f2c230','#d62828'],['pack','#f2c230','#d62828'],'table'),
   L('Soft drinks','Soft drink','#d62828',500,'50cl bottle','field',['carton','#d62828','#f4f1ea'],['bottle','#3a1a0e','#d62828'],'cooler'),
   L('Detergent','Detergent','#1e9bd6',2500,'900g pack','field',['carton','#1e9bd6','#f26a2a'],['pack','#1e9bd6','#f26a2a'],'table'),
   L('Powdered milk','Milk','#2a62c9',5000,'400g tin','field',['carton','#f4f1ea','#2a62c9'],['tin','#2a62c9','#f4f1ea'],'table'),
   L('Chocolate beverage','Beverage','#1f7a3a',5000,'500g tin','field',['carton','#1f7a3a','#f2c230'],['tin','#1f7a3a','#f2c230'],'table')]},
sikira:{name:'Iya Sikira Fish',tag:'Fresh and smoked fish',tone:'#2a7fb5',field:'water',owner:{cloth:'#1e9bd6',trim:'#f4f1ea',hat:'gele'},
  venue:['Basin by the road','Canopy stall','Fish shop','Cold-room depot','Seafood mega-market'],
  lines:[
   L('Fresh tilapia','Tilapia','#7f9aa6',6000,'1 kg','field',['fishlive','#8fa3ad'],['fish','#9fb3bd','#e9eef0'],'table'),
   L('Live catfish','Catfish','#555b63',6000,'1 kg','field',['fishlive','#4a4f55'],['fish','#4a4f55','#c9ced2'],'table'),
   L('Crayfish','Crayfish','#e5704a',4000,'derica','field',['fishlive','#e58a6a'],['basket','#e58a6a'],'table'),
   L('Smoked fish','Smoked','#7a4a1c',4000,'medium fish','depot',['carton','#cfe6f5','#2a62c9'],['fish','#5a3a1c','#8a5a2a'],'grill'),
   L('Stockfish','Stockfish','#c9b070',6000,'medium piece','depot',['sack','#d9c9a0','#8a6a2e'],['strip','#e3d2a2','#b89a5a'],'table')]},
sani:{name:'Alhaji Sani Pepper Market',tag:'Tomato and pepper',tone:'#e2301f',field:'farm',owner:{cloth:'#f4f1ea',trim:'#1f3f8f',hat:'fila'},
  venue:['Basket by the road','Canopy stall','Lock-up shop','Wholesale depot','Pepper mega-market'],
  lines:[
   L('Fresh tomatoes','Tomato','#e2301f',4500,'paint bucket','field',['round','#e2301f','#3aa336'],['basket','#e2301f'],'table'),
   L('Tatashe','Tatashe','#b01818',2000,'1 kg pile','field',['chili','#c41e1e'],['basket','#c41e1e'],'table'),
   L('Rodo (hot pepper)','Rodo','#f26a1a',5000,'small bucket','field',['round','#f26a1a','#3aa336'],['basket','#f26a1a'],'table'),
   L('Onions','Onions','#a8468a',1000,'pile','field',['round','#a8468a','#d9c36a'],['sack','#c05a9a','#7a2a5a'],'table'),
   L('Okra','Okra','#4a9a3a',500,'pile','field',['long','#4a9a3a','#2c6e2a'],['basket','#4a9a3a'],'table')]},
bola:{name:'Madam Bola Fabrics',tag:'Ankara, lace and aso-oke',tone:'#7a1f6a',field:'yard',owner:{cloth:'#0f7a5a',trim:'#f2d16b',hat:'gele'},
  venue:['Table-top stall','Canopy stall','Lock-up shop','Fabric plaza','Fashion mega-store'],
  lines:[
   L('Adire','Adire','#1f3f8f',11000,'5 yards','field',['carton','#c9b08a','#1f3f8f'],['cloth','#1f3f8f','#9cc4ff'],'table'),
   L('Ankara','Ankara','#e8501e',24000,'6 yards','field',['carton','#c9b08a','#e8501e'],['cloth','#e8501e','#ffc23d'],'table'),
   L('Lace','Lace','#d98ab0',45000,'5 yards','field',['carton','#c9b08a','#d98ab0'],['cloth','#f4f1ea','#d98ab0'],'table'),
   L('George wrapper','George','#0f7a5a',50000,'wrapper','field',['carton','#c9b08a','#0f7a5a'],['cloth','#0f7a5a','#f2d16b'],'table'),
   L('Aso-oke','Aso-oke','#7a1f6a',60000,'set','field',['carton','#c9b08a','#7a1f6a'],['cloth','#7a1f6a','#e3b23a'],'table')]},
chinedu:{name:'Chinedu Phone Accessories',tag:'Phones and accessories',tone:'#7a5af0',field:'yard',owner:{cloth:'#1b1f27',trim:'#7ad1ff',hat:'cap'},
  venue:['Table-top stall','Umbrella stand','Lock-up shop','Gadget plaza','Tech mega-store'],
  lines:[
   L('Phone cases','Cases','#2a9fd6',2500,'one','field',['carton','#c9b08a','#2a9fd6'],['gadget','case','#2a9fd6','#f2c230'],'table'),
   L('Earpieces','Earpiece','#e23c3c',3500,'one','field',['carton','#c9b08a','#e23c3c'],['gadget','ear','#22252b','#e23c3c'],'table'),
   L('Fast chargers','Charger','#3fbf5a',7500,'20W kit','field',['carton','#c9b08a','#3fbf5a'],['gadget','charger','#f4f1ea','#3fbf5a'],'table'),
   L('Power banks','Power bank','#6b7684',27000,'20,000mAh','field',['carton','#c9b08a','#6b7684'],['gadget','bank','#333a44','#5ad1ff'],'table'),
   L('Smartphones','Phone','#7a5af0',105000,'budget phone','field',['carton','#c9b08a','#7a5af0'],['gadget','phone','#1b1f27','#7ad1ff'],'table')]},
/* New businesses (version 5). Prices from plan3/shipping.json "Route pricing": bike = N1,500 + N500 x zone (average zone 3),
   waybill = N5,000 + N4 x km, 40ft trip = N1,200,000 + N1,900 x km (Lagos to Kano, 1,000 km), clearing fee N250,000,
   ocean freight $5,067 per 40ft at N1,460 to the dollar. w = share of customers, qx = most units one customer buys. */
ship:{name:'Wakaway Global Logistics',tag:'Courier, haulage and shipping',tone:'#f26a1a',field:'port',isNew:true,owner:{cloth:'#f26a1a',trim:'#1b2a4a',hat:'cap'},
  hand:'Loader',cook:'sorter',seller:'dispatcher',
  outfit:{hand:{cloth:'#f28a1e',trim:'#fff36b',hat:'hard'},cook:{cloth:'#1b2a4a',trim:'#f26a1a',hat:'none',apron:1},server:{cloth:'#f26a1a',trim:'#f26a1a',hat:'helmet'},porter:{cloth:'#4a6a8a',trim:'#22252b',hat:'hard'},cashier:{cloth:'#f4f1ea',trim:'#1b2a4a',hat:'none'}},
  venue:['Umbrella stand, Yaba','Rider Squad shop front','Warehouse, Lagos-Ibadan road','Borders and Hubs head office','Tin Can terminal and MV Waybill'],
  // Research stage startup costs: Rider Squad N6.5m, Waybill N45m, Big Wheels N180m, Warehouse N600m, Clearing licence N400m,
  // Borders and Hubs N2.5bn, MV Waybill N25bn. The charter booking desk (line 4) has no researched figure, so the engine prices it.
  costs:{venue:[6500000,600000000,2500000000,25000000000],line:[45000000,180000000,400000000]},
  lines:[
   Object.assign(L('Bike parcel delivery','Parcel','#f26a1a',3000,'Lagos parcel','field',['carton','#c9a15a','#f26a1a'],['pack','#f4e2b0','#f26a1a'],'table'),{w:10,qx:4}),
   Object.assign(L('Interstate waybill','Waybill','#2a62c9',9000,'carton to Kano','field',['sack','#e9dcc0','#2a62c9'],['carton','#c9a15a','#2a62c9'],'scale'),{w:5,qx:3}),
   Object.assign(L('Trailer haulage trip','Haulage','#c62828',3100000,'40ft, Lagos to Kano','field',['box40','#c62828','#8e1c1c'],['box40','#c62828','#f2c230'],'bay'),{w:.6,qx:1}),
   Object.assign(L('Container clearing','Clearing','#1f8a4c',250000,'container fee','field',['box40','#1f8a4c','#145c32'],['doc','#f4f1ea','#1f8a4c'],'desk'),{w:1,qx:2}),
   Object.assign(L('Ocean freight booking','Freight','#1b2a4a',7397820,'40ft, China to Apapa','field',['box40','#2a62c9','#1b2a4a'],['doc','#dfe7ec','#1b2a4a'],'desk'),{w:.25,qx:1})]}
};
const CAR=['Danfo bus','Keke','Tokunbo car','SUV'], HOUSE=['Rented room','Mini flat','Bungalow','Duplex mansion'];
const ADS=['','Radio jingle','Billboard','TV advert'];
