/* ===== Wakaway Global Logistics: the research rules from plan3/shipping.json, run on top of the shop engine =====
   Every number below comes from that file unless it says "estimate". Prices, diesel and the dollar move week to week. */
const SHIPR={km:1000,lpk:.45,d0:1650,dMin:1300,dMax:2300,fx0:1460,usd:5067,free:5,dem:[13000,19000,26000],
  truckCost:60000000,bikeCost:1200000,svcTruck:180000,svcBike:15000,repair:450000,fine:500000,riderShare:.7,tripDays:5,
  pay:{driver:180000,motorBoy:70000,agent:250000,forklift:150000}, // monthly salaries from the storyline staff list
  classes:[[5,'Machines and raw materials'],[10,'Part-made goods'],[20,'Finished goods for shops'],[35,'Specially protected goods']],
  cargo:[['Generator spare parts',0],['Factory sewing machines',0],['Plastic granules',0],['Cotton yarn for weaving',1],['Packaging film rolls',1],['Car tyres',2],['Ladies\' shoes',2],['Office furniture',2],['Ceramic floor tiles',2]]};
const isShip=()=>SAVE.cur==='ship'&&B&&B.isNew;
function shipState(){const s=S.ship=S.ship||{};const d={diesel:SHIPR.d0,fx:SHIPR.fx0,wk:Math.floor(S.day/7),trust:50,sur:false,px:0,riders:0,bikeCond:100,trucks:0,truckCond:100,
    out:[],boxes:[],pot:0,potPaid:0,agents:0,desk:0,self:0,deliv:0,trips:0,empty:0,back:0,cleared:0,clearedFree:0,lateBox:0,brk:0,hist:[],mo:{rev:0,cost:0},day:{cost:0,fuel:0,dem:0,back:0,rider:0},nid:1,oceanMo:0};
  for(const k in d)if(s[k]==null)s[k]=d[k];B.lines[4].price=Math.round(oceanUsd()*s.fx);if(lvl('line2')&&!s.trucks)s.trucks=3;if(lvl('line3')&&!s.agents)s.agents=1;return s;}
const shipCost=(n,why)=>{const s=S.ship;S.money-=n;s.mo.cost+=n;s.day.cost+=n;if(why)s.day[why]=(s.day[why]||0)+n;};
const trucksFree=()=>{const s=S.ship;return s.trucks-s.out.length;};
const surPct=()=>S.ship.sur?Math.max(0,(S.ship.diesel-SHIPR.d0)/SHIPR.d0*.3):0;
const fuelTrip=()=>Math.round(2*SHIPR.km*SHIPR.lpk*S.ship.diesel*(evx('diesel_up')?1.1:1)); // both legs always burn fuel
const backChance=()=>{const br=S.emp.br,dep=br>=100?3:br>=25?2:br>=10?1:0,seen=S.emp.insp&&S.emp.insp[5]>=S.day-2;return Math.min(.85,.3+.1*dep+(seen?.15:0));};
const deskCap=()=>{const s=S.ship;return s.agents?2+4*s.desk+4*s.agents:0;};
const ratio=()=>{const m=S.ship.mo,w=monthDue(false).wages;return m.rev>0?Math.round((m.cost+w)/m.rev*100):0;};
const oceanUsd=()=>Math.round(SHIPR.usd*((S.day/MONTH|0)%12===11?1.2:1)); // peak season: up 20% before Christmas

// Customers: trust, price and failures change how many come, and which lines they ask for.
function newDemand(){if(!isShip())return 1;const s=shipState(),p=s.px;return(.7+.6*s.trust/100)*(p>0?1-.015*p:1-.01*p)*(s.sur?.97:1);}
function lineW(i){if(!isShip())return 1;const s=shipState();
  if(i===0)return 1+.3*s.riders;
  if(i===2)return trucksFree()>0?(s.sur?.85:1):0;
  if(i===3){const late=s.boxes.filter(b=>b.age>SHIPR.free).length;if(s.boxes.length>=deskCap()*SHIPR.free)return 0;return late>=5||s.boxes.some(b=>b.age>15)?.3:1;}
  return 1;}
// Each sale: zone prices for bikes, riders' 70% share, a truck leaves for Kano, an import box starts its clock, freight in dollars.
// Running costs per naira of revenue, from the research cost structure: fuel 28%, vehicles 11% + repairs 9%, tolls and port 8%,
// rent, IT, insurance and admin 14%. Trucks burn their own diesel (counted per trip) and ocean freight pays ~68% for ship space.
const RUNC=[{fuel:.28,admin:.14},{fuel:.28,fleet:.2,port:.08,admin:.14},{port:.08,admin:.14},{port:.08,admin:.14},{carrier:.68,port:.08,admin:.14}];
function runCosts(i,amt){for(const k in RUNC[i])shipCost(Math.round(amt*RUNC[i][k]),k==='admin'?'admin':k==='carrier'?'carrier':k==='fuel'?'fuel':'run');}
function newSale(i,c,q,amt){if(!isShip())return amt;const s=shipState();amt=Math.round(amt*(1+s.px/100));
  if(i===0){let a=0;for(let k=0;k<q;k++)a+=amt/q*(1500+500*(1+Math.floor(Math.random()*5)))/3000;amt=Math.round(a);s.deliv+=q;
    const share=s.riders/(s.riders+1),cut=Math.round(amt*share*SHIPR.riderShare);if(cut){shipCost(cut,'rider');}
    if(s.deliv%50<q)s.trust=Math.min(100,s.trust+1);}
  else if(i===1){s.deliv+=q;}
  else if(i===2){amt=Math.round(amt*(1+surPct()));for(let k=0;k<q&&trucksFree()>0;k++){const fuel=fuelTrip();shipCost(fuel,'fuel');s.trips++;s.truckCond=Math.max(0,s.truckCond-2*SHIPR.km/250/Math.max(1,s.trucks));
      let days=SHIPR.tripDays;if(s.truckCond<60&&Math.random()*100<60-s.truckCond){days+=2;shipCost(SHIPR.repair,'repair');s.trust=Math.max(0,s.trust-5);s.brk++;toast('🛠️ A truck broke down near Lokoja. ₦450,000 repair and 2 days lost. Service the fleet!',4);}
      s.out.push({back:S.day+days,pay:Math.round(amt/q*.5)});}}
  else if(i===3){for(let k=0;k<q;k++){const g=pick(SHIPR.cargo),val=Math.round(rnd(15,90))*1e6,cls=g[1],r=SHIPR.classes[cls][0];
      const duty=Math.round(val*r/100+val*.075);s.boxes.push({id:s.nid++,goods:g[0],cls,val,duty,age:0,hold:0});s.pot+=duty;}}
  else if(i===4){amt=Math.round(oceanUsd()*s.fx*q*(evx('fx_up')?1.05:1)*(1+s.px/100));s.oceanMo++;}
  runCosts(i,amt);s.mo.rev+=amt;return amt;}

// Night: trucks come home (with or without a return load), the paperwork desk clears boxes, the demurrage clock ticks.
function shipNight(){if(!isShip())return null;const s=shipState();const rows=[];
  for(const t of s.out.filter(t=>t.back<=S.day)){if(evx('backhaul')||Math.random()<backChance()){S.money+=t.pay;s.mo.rev+=t.pay;S.mo.rev+=t.pay;s.back++;s.day.back+=t.pay;}else s.empty++;}
  s.out=s.out.filter(t=>t.back>S.day);
  let cap=deskCap()*(evx('port_down')?.5:1);
  s.boxes.sort((a,b)=>b.age-a.age);for(const b of s.boxes.slice()){if(cap<1)break;if(b.hold){continue;}cap--;clearBox(b,b.cls);}
  for(const b of s.boxes){if(b.done)continue;if(b.hold){b.hold--;if(!b.hold){finishBox(b);continue;}}b.age++;
    if(b.age>SHIPR.free){const d=b.age<=10?SHIPR.dem[0]:b.age<=15?SHIPR.dem[1]:SHIPR.dem[2];shipCost(Math.round(d*.5),'dem');s.trust=Math.max(0,s.trust-2);}}
  s.boxes=s.boxes.filter(b=>!b.done);
  s.bikeCond=Math.max(0,s.bikeCond-1.5); // about 90 km a day per bike, -1 per 60 km
  if(s.bikeCond<60)s.trust=Math.max(0,s.trust-1);
  const D=s.day;if(D.fuel)rows.push(['Fuel for bikes, vans and trucks','-₦'+fmt(D.fuel),'#ffb3a3']);
  if(D.rider)rows.push(['Riders\' 70% share','-₦'+fmt(D.rider),'#ffb3a3']);if(D.back)rows.push(['Return loads from Kano','₦'+fmt(D.back),'#b9ffcf']);
  if(D.dem)rows.push(['Your half of demurrage','-₦'+fmt(D.dem),'#ff8a7a']);if(D.carrier)rows.push(['Ship space paid to carriers','-₦'+fmt(D.carrier),'#ffb3a3']);
  if(D.admin||D.run)rows.push(['Rent, admin, tolls, port, vans','-₦'+fmt((D.admin||0)+(D.run||0)),'#ffb3a3']);const other=(D.repair||0)+(D.crew||0)+(D.svc||0)+(D.fine||0);if(other)rows.push(['Drivers, agents, repairs, fines','-₦'+fmt(other),'#ffb3a3']);
  s.day={cost:0,fuel:0,dem:0,back:0,rider:0};
  if(Math.floor(S.day/7)!==s.wk){s.wk=Math.floor(S.day/7);let m=1;for(let k=0;k<7;k++)m*=1+rnd(-.03,.03);s.diesel=Math.round(Math.max(SHIPR.dMin,Math.min(SHIPR.dMax,s.diesel*m)));
    s.fx=Math.round(Math.max(1200,Math.min(1800,s.fx*(1+rnd(-.02,.02)))));B.lines[4].price=Math.round(oceanUsd()*s.fx);}
  return rows;}
// Drivers, motor boys, licensed agents and forklift operators are paid on payday at the storyline salaries.
function shipCrew(){if(!isShip()||!S.ship)return[];const s=S.ship,P=SHIPR.pay,r=[];if(s.trucks){r.push({name:'Truck drivers',n:s.trucks,each:P.driver});r.push({name:'Motor boys',n:s.trucks,each:P.motorBoy});}
  if(s.agents)r.push({name:'Licensed clearing agent'+(s.agents>1?'s':''),n:s.agents,each:P.agent});if(S.emp.auto)r.push({name:'Forklift operators',n:2,each:P.forklift});return r;}
function clearBox(b,cls){const s=S.ship;b.declared=cls;if(Math.random()<.1&&cls!==b.cls){shipCost(SHIPR.fine,'fine');b.hold=3;s.trust=Math.max(0,s.trust-10);toast('🔎 Customs inspected box '+b.id+': wrong class. ₦500,000 fine and a 3-day hold. Declare it correctly.',5);return;}finishBox(b);}
function finishBox(b){const s=S.ship;b.done=true;s.pot-=b.duty;s.potPaid+=b.duty;s.cleared++;if(b.age<=SHIPR.free)s.clearedFree++;else s.lateBox++;}
function shipMonth(){if(!isShip())return null;const s=shipState(),r=ratio(),cost=s.mo.cost;if(s.mo.rev>0)s.hist.push(r);if(s.hist.length>24)s.hist.shift();s.mo={rev:0,cost:0};return{or:r,cost};}

// Licences and gates from the research stages. A step stays locked until its gate is met.
function stepGate(st){if(!isShip())return null;const s=shipState();
  if(st.base==='venue'&&st.n===1&&s.deliv<300)return'🔒 Rider Squad needs 300 safe deliveries first ('+s.deliv+' so far). Then the courier licence.';
  if(st.base==='line'&&st.n===1&&st.arg===1&&s.trust<60)return'🔒 The national courier licence needs trust 60+ (now '+s.trust+'). Deliver safely and clear on time.';
  if(st.base==='venue'&&st.n===3&&s.clearedFree<200)return'🔒 Borders and Hubs: clear 200 boxes within their 5 free days ('+s.clearedFree+' so far).';
  if(st.base==='line'&&st.arg===4&&stage()<3)return'🔒 Ocean freight comes after Borders and Hubs: open the hubs abroad first.';
  if(st.base==='venue'&&st.n===4){const h=s.hist.slice(-3);if(h.length<3||h.some(x=>x>=92))return'🔒 To buy MV Waybill: 3 straight months with operating ratio under 92 (charter first).';}
  return null;}

/* ----- HQ panel: fleet, port desk, prices ----- */
function shipHtml(){if(!isShip())return'';const s=shipState(),R=ratio(),late=s.boxes.filter(b=>b.age>SHIPR.free).length;let h='<h2>Operations</h2>';
  h+='<div class="stats"><div class="stat">Trust<b>'+s.trust+' / 100</b></div><div class="stat">Diesel (moves weekly)<b>₦'+s.diesel.toLocaleString('en-NG')+'/L</b></div><div class="stat">Dollar rate (weekly)<b>₦'+s.fx.toLocaleString('en-NG')+'</b></div><div class="stat">Operating ratio<b>'+(R?R+'%':'—')+'</b></div></div>';
  h+='<p class="note">Where each ₦100 of revenue goes: fuel ₦28 (trucks pay their own diesel), rent, IT and admin ₦14, tolls and port ₦8, vans ₦20 on waybills, plus salaries. Operating ratio = this month\'s costs ÷ revenue. Under 95 for 3 months opens bank truck loans; under 90 gets 1 point off the interest rate. UPS runs at 91, J.B. Hunt 92.8, Red Star Express about 94.</p>';
  h+='<h2>Prices</h2><div class="seg" id="spx">'+[-20,-10,0,10,20].map(p=>'<button class="ghost'+(s.px===p?' on':'')+'" data-px="'+p+'" type="button">'+(p>0?'+':'')+p+'%</button>').join('')+'</div><p class="note">List prices: bike ₦1,500 + ₦500 a zone, waybill ₦5,000 + ₦4 a km, 40ft trip ₦1.2m + ₦1,900 a km. Every 1% above list loses 1.5% of customers; every 1% below brings 1% more.</p>';
  h+='<h2>Riders and bikes</h2><table><tr><td>Riders on bikes</td><td>'+s.riders+'</td></tr><tr><td>Bike condition</td><td>'+Math.round(s.bikeCond)+'%</td></tr><tr><td>Safe deliveries</td><td>'+s.deliv.toLocaleString('en-NG')+'</td></tr></table>';
  h+='<div class="acts"><button class="ghost" data-sh="rider" type="button">🏍️ Add rider + bike · ₦1.2m</button><button class="ghost" data-sh="sbike" type="button">🔧 Service bikes · ₦'+short(SHIPR.svcBike*(s.riders+1))+'</button></div><p class="note">Riders keep 70% of each fee they deliver; you keep 30%. More riders, more parcels. Helmets on: Wakaway never rewards speeding.</p>';
  if(lvl('line2')){const f=fuelTrip(),pr=Math.round(B.lines[2].price*(1+surPct())*(1+s.px/100));
    h+='<h2>Trucks: Lagos to Kano</h2><table><tr><td>Trucks (busy on the road)</td><td>'+s.trucks+' ('+s.out.length+')</td></tr><tr><td>Truck condition</td><td>'+Math.round(s.truckCond)+'%'+(s.truckCond<60?' ⚠️ breakdown risk '+Math.round(60-s.truckCond)+'%':'')+'</td></tr><tr><td>Price per trip</td><td>₦'+fmt(pr)+'</td></tr><tr><td>Diesel per round trip (2,000 km × 0.45 L)</td><td>-₦'+fmt(f)+'</td></tr><tr><td>Chance of a return load</td><td>'+Math.round(backChance()*100)+'% (pays 50%)</td></tr><tr><td>Trips · returns full · empty</td><td>'+s.trips+' · '+s.back+' · '+s.empty+'</td></tr></table>';
    h+='<div class="acts"><button class="ghost" data-sh="truck" type="button">🚛 Buy a 40ft truck · ₦60m</button><button class="ghost" data-sh="struck" type="button">🔧 Service trucks · ₦'+short(SHIPR.svcTruck*s.trucks)+'</button><button class="ghost'+(s.sur?' on':'')+'" data-sh="sur" type="button">⛽ Fuel surcharge: '+(s.sur?'ON (+'+Math.round(surPct()*100)+'%)':'OFF')+'</button></div><p class="note">A round trip takes 5 days. Visiting Kano this week adds 15% to the return-load chance; hubs up north add 10% each level.</p>';}
  if(lvl('line3')){const cap=deskCap();
    h+='<h2>Port desk: the demurrage clock</h2><div class="stats"><div class="stat">Duty Pot (customers\' money)<b>₦'+fmt(s.pot)+'</b></div><div class="stat">Boxes cleared<b>'+s.cleared+' ('+s.clearedFree+' on time)</b></div><div class="stat">Desk clears a night<b>'+cap+'</b></div><div class="stat">Past free days<b>'+late+'</b></div></div>';
    h+='<p class="note">Duty is never your money: it sits in the locked pot and goes to customs in full. You earn the ₦250,000 fee. Each box has 5 free days, then ₦13,000 a day (days 6–10), ₦19,000 (11–15), ₦26,000 after. The importer is billed; when the delay is your paperwork, you pay half.</p>';
    if(s.boxes.length){h+='<div class="boxes">';for(const b of s.boxes.slice(0,12)){const left=SHIPR.free-b.age,cl=b.hold?'hold':left<=0?'red':left<=2?'amb':'ok';
      h+='<div class="box '+cl+'"><b>Box '+b.id+'</b><span>'+b.goods+'</span><span>'+(b.hold?'Held by customs: '+b.hold+' day(s)':left>0?left+' free day'+(left>1?'s':'')+' left':'Day '+b.age+': ₦'+short(b.age<=10?13000:b.age<=15?19000:26000)+'/day')+'</span>'+(b.hold||s.self>=S.day?'':'<button class="ghost" data-clr="'+b.id+'" type="button">Declare and clear</button>')+'</div>';}h+='</div>';}
    h+='<div class="acts"><button class="ghost" data-sh="agent" type="button">🧑‍💼 Hire licensed agent · ₦250k a month</button><button class="ghost" data-sh="desk" type="button">🗂️ Upgrade paperwork desk · ₦'+short(25000000*(s.desk+1))+'</button></div><p class="note">Licensed agents always declare correctly. You can declare one box yourself each day: pick the right goods class. Customs inspects 1 box in 10.</p>';}
  if(lvl('line4'))h+='<h2>Ocean freight</h2><p class="note">Freight is sold in dollars: $'+oceanUsd().toLocaleString('en-NG')+' a 40ft from China to Apapa ('+(SHIPR.usd===oceanUsd()?'normal season':'peak season, +20%')+'), ₦'+fmt(oceanUsd()*s.fx)+' at this week\'s rate. 35 to 48 days port to port. About 68% of each booking pays for the ship space; with port charges and admin, freight keeps about 10% (research for this stage: ₦9bn revenue and ₦8.1bn costs a month).</p>';
  return h;}
function shipBind(){if(!isShip())return;const s=S.ship,re=()=>{save();hqRender();};
  document.querySelectorAll('#spx [data-px]').forEach(b=>b.onclick=()=>{s.px=+b.dataset.px;re();});
  document.querySelectorAll('#hqin [data-sh]').forEach(b=>b.onclick=()=>{const k=b.dataset.sh,buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;f();fanfare(false);re();};
    if(k==='rider')buy(SHIPR.bikeCost,()=>{s.riders++;syncStaff();});
    if(k==='sbike')buy(SHIPR.svcBike*(s.riders+1),()=>{s.bikeCond=100;s.mo.cost+=SHIPR.svcBike*(s.riders+1);});
    if(k==='truck')buy(SHIPR.truckCost,()=>{s.trucks++;});
    if(k==='struck')buy(SHIPR.svcTruck*s.trucks,()=>{s.truckCond=100;s.mo.cost+=SHIPR.svcTruck*s.trucks;});
    if(k==='sur'){s.sur=!s.sur;re();}
    if(k==='agent'){s.agents++;toast('A licensed agent joins the port desk.',2.5);re();}
    if(k==='desk')buy(25000000*(s.desk+1),()=>{s.desk++;});});
  document.querySelectorAll('#hqin [data-clr]').forEach(b=>b.onclick=()=>{const bx=s.boxes.find(x=>x.id===+b.dataset.clr);if(!bx)return;
    $('hqin').insertAdjacentHTML('afterbegin','<div class="lock" id="decl"><b>Declare box '+bx.id+': '+bx.goods+'</b><br>Cargo value ₦'+fmt(bx.val)+'. Pick the goods class:<div class="acts">'+SHIPR.classes.map((c,i)=>'<button class="ghost" data-cls="'+i+'" type="button">'+c[0]+'% · '+c[1]+'</button>').join('')+'</div></div>');$('hqp').scrollTop=0;
    document.querySelectorAll('#decl [data-cls]').forEach(c=>c.onclick=()=>{s.self=S.day;clearBox(bx,+c.dataset.cls);s.boxes=s.boxes.filter(x=>!x.done);if(bx.done){toast('✅ Box '+bx.id+' cleared. Duty paid from the pot.',2.5);tick(900);}re();});});}
