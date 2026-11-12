/* ===== Adunni Palms Hotels: research rules from plan3/hotel.json on top of the shop engine =====
   Rooms sell once a night when they are ready. Checkout makes them dirty; housekeepers clean them overnight with
   linen and toiletries. Generators burn diesel when the grid is off. Taxes collected on bills sit in a tax box paid
   on day 20. Stars come from the tourism board checklist. Everything is game money. */
const HTLR={diesel:3277,vat:.075,horc:.05,svc:.1,hall:1500000,hallHrs:8, // research figures (hallHrs is an estimate)
  run:.21,  // research cost structure: repairs 6% + sales and booking fees 8% + admin, insurance, levies 7% of revenue
  food:.37, // research: about 35-40% of food and beverage revenue goes on ingredients
  hallFood:.25, // estimate: tea breaks and table linen for a hall day
  rooms:[4,20,60,140,400], // research: 4 rooms, 20-room budget hotel, 60-room Ikeja, +80-room Abuja tower; 400 for the chain is an estimate
  suites:[1,4,10,24,60],villas:[12,12,12,12,24], // estimates
  min:{std:30,suite:45,villa:60},shift:480, // research cleaning minutes; 8-hour shift is an estimate
  linen:1000,toil:1250, // estimate: split of the research 5% linen and supplies share on a N45,000 room
  tank:[200,1000,2000,5000,15000],hk:[1,2,3,6,16], // estimates
  pay:{hk:80000,rec:110000,chef:350000,stew:75000,eng:180000,mgr:650000}, // storyline salaries
  insp:250000,partner:20000000,partnerRev:100*.667*205534*30, // inspection fee and partner audit are estimates; partner revenue = 100 rooms x research occupancy x ADR
  checks:[['reg','Tourism registration (one-year certificate)',150000],['ext','Fire extinguishers serviced (lasts 180 days)',120000,1],['exit','Clear, signed fire exits',400000,1],
    ['kitchen','Clean kitchen, food handlers certified',600000,1],['register','Guest register kept',50000],['alarm','Smoke alarms in every room',800000],
    ['cert','Fire safety certificate',500000],['gen','Big soundproof generator',12000000],['uni','Staff uniforms and training',1500000],['pool','Pool and beach safety plan',3000000]]}; // checklist prices are estimates
const isHotel=()=>SAVE.cur==='hotel'&&B&&B.isNew;
const HT={0:0,2:1,4:2},HTN=['Standard rooms','Executive suites','Beach villas'];
function htState(){const s=S.htl=S.htl||{};const d={occ:[0,0,0],dirty:[0,0,0],cl:[0,0,0],clT:0,linen:40,toil:40,auto:true,hk:1,stew:0,eng:0,mgr:false,
    rev:4,stars:0,chk:{},extT:0,closed:0,tank:100,solar:false,diesel:HTLR.diesel,wk:-1,grid:12,adj:0,box:0,owed:0,taxAuto:true,taxDebt:0,
    book:[],partners:0,occH:[],lowWk:0,warn:'',day:{},mo:{rev:0,cost:0},last:null,hist:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  const st=stage();if(s.hk<HTLR.hk[st])s.hk=HTLR.hk[st];if(lvl('line3')&&s.stew<4&&!s.stewSet){s.stew=4;s.stewSet=1;}
  const wk=Math.floor(S.day/7);if(s.wk!==wk){s.wk=wk;s.diesel=Math.round(HTLR.diesel*(.9+Math.random()*.25));} // diesel moves week to week
  return s;}
const htTotal=t=>{const st=stage(),su=lvl('line2')?HTLR.suites[st]:0;return t===0?HTLR.rooms[st]-su:t===1?su:(lvl('line4')?HTLR.villas[st]:0);};
const htReady=t=>{const s=S.htl;return Math.max(0,htTotal(t)-s.occ[t]-s.dirty[t]-s.cl[t]);};
const htAll=()=>htTotal(0)+htTotal(1)+htTotal(2);
const htDate=()=>{const m=Math.floor((S.day-1)/MONTH)%12,dom=(S.day-1)%MONTH+1;return{m,dom};};
const htSeason=()=>{const{m,dom}=htDate();return(m===11&&dom>=15)||(m===0&&dom<=5)?'peak':m>=5&&m<=8?'rain':'normal';};
const htSeasonX=t=>{const z=htSeason();return z==='peak'?1.5:z==='rain'?(t===2?.7:.85):1;};
const htRate=t=>(1+.15*S.htl.stars)*htSeasonX(t)*(1+S.htl.adj/100);
const htCost=(n,k)=>{const s=S.htl;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const htPassed=()=>{const s=S.htl;return HTLR.checks.filter(c=>s.chk[c[0]]&&(c[0]!=='ext'||S.day<s.extT)).length;};
const htOcc=n=>{const h=S.htl.occH.slice(-n);return h.length?Math.round(h.reduce((a,b)=>a+b,0)/h.length):0;};
const htSafeFail=()=>HTLR.checks.filter(c=>c[3]&&!(S.htl.chk[c[0]]&&(c[0]!=='ext'||S.day<S.htl.extT))).map(c=>c[1]);
// A bill: room or food price, then 10% service charge (paid to staff) and 7.5% VAT + 5% consumption tax into the tax box.
function htBill(amt){const s=S.htl,tax=Math.round(amt*(HTLR.vat+HTLR.horc));s.owed+=tax;if(s.taxAuto)s.box+=tax;else S.money+=tax;
  s.day.svc=(s.day.svc||0)+Math.round(amt*HTLR.svc);htCost(Math.round(amt*HTLR.run),'run');}

/* ----- customers ----- */
function htDemand(){const s=htState();let m=s.rev<2.5?.75:.7+.1*s.rev;m*=htSeason()==='peak'?1.5:1;
  m*=s.adj>0?1-.08*s.adj/10:1-.05*s.adj/10; // research: -8% per 10% above suggested; +5% per 10% below is an estimate
  return Math.max(.1,m);}
function htLineW(i){const s=htState();if(i in HT){if(s.closed>0)return 0;const t=HT[i];return htReady(t)>0?(t===2&&htSeason()==='rain'?.7:1):0;}
  if(i===3)return s.book.length>=3?0:1;return 1;}
function htSale(i,c,q,amt){const s=htState();
  if(i in HT){const t=HT[i],n=Math.min(q,htReady(t));if(!n)return 0;s.occ[t]+=n;amt=Math.round(amt/q*n*htRate(t));s.day.sold=(s.day.sold||0)+n;s.day.room=(s.day.room||0)+amt;htBill(amt);return amt;}
  if(i===1){htBill(amt);htCost(Math.round(amt*HTLR.food),'food');return amt;}
  // hall: booked 3-10 days ahead, 30% deposit now (estimate), the rest on the day
  const d=S.day+3+Math.floor(Math.random()*8),dep=Math.round(amt*.3);s.book.push({d,fee:amt,dep});htBill(dep);return dep;}

/* ----- nights ----- */
function htNight(){if(!isHotel())return[];const s=htState(),rows=[],D=s.day,{dom}=htDate();
  if(s.clT&&S.day>=s.clT){s.cl=[0,0,0];s.clT=0;}
  // events in the hall today
  let hallHrs=0;for(const b of s.book.filter(b=>b.d<=S.day)){const sat=S.day%7===6,ok=s.stew>=4;let rest=Math.round(b.fee*(sat?2:1)*(ok?1:.7))-b.dep;rest=Math.max(0,rest);
    S.money+=rest;S.mo.rev+=rest;s.mo.rev+=rest;htBill(rest);htCost(Math.round(b.fee*HTLR.hallFood),'food');hallHrs+=HTLR.hallHrs;if(!ok)s.rev=Math.max(0,s.rev-.3);
    const g=Math.round(300*.1),n=Math.min(g,htReady(0));if(n){const r=Math.round(n*B.lines[0].price*htRate(0));s.occ[0]+=n;S.money+=r;S.mo.rev+=r;htBill(r);D.sold=(D.sold||0)+n;D.room=(D.room||0)+r;}
    rows.push([(sat?'Wedding':'Conference')+' in the hall'+(ok?'':' (not ready: fee -30%)')+(n?', '+n+' rooms booked':''),'₦'+fmt(rest),'#b9ffcf']);}
  s.book=s.book.filter(b=>b.d>S.day);
  // power: grid hours, generator litres, diesel tank
  const all=Math.max(1,htAll()),sold=D.sold||0,occ=Math.min(1,sold/all);s.grid=8+Math.floor(Math.random()*9);
  const genH=(24-s.grid)*occ*(s.solar?.4:1),lit=Math.round(genH*Math.max(1,.25*all)+10*hallHrs);let dark=false;
  if(lit){if(s.tank>=lit)s.tank-=lit;else{const need=lit-s.tank,c=Math.round(need*s.diesel*1.25);if(S.money>=c){htCost(c,'emerg');s.tank=0;toast('⛽ Tank ran dry. Emergency diesel came at +25%: ₦'+short(c)+'. Buy ahead to save.',4);}else{s.tank=0;dark=sold>0;}}}
  if(dark&&D.room){const ref=Math.round(D.room*.3);htCost(ref,'refund');toast('🔦 No light and no diesel tonight. 30% of room money refunded to guests.',5);}
  // checkout, then housekeeping overnight
  for(let t=0;t<3;t++){s.dirty[t]+=s.occ[t];s.occ[t]=0;}
  let mins=s.hk*HTLR.shift,cleaned=0,noStock=false;const M=[HTLR.min.std,HTLR.min.suite,HTLR.min.villa];
  for(const t of[1,2,0])while(s.dirty[t]>0&&mins>=M[t]){if(s.linen<1||s.toil<1){if(s.auto){const n=50,c=Math.round(n*(HTLR.linen+HTLR.toil)*1.1);if(S.money>=c){htCost(c,'stock');s.linen+=n;s.toil+=n;}else{noStock=true;break;}}else{noStock=true;break;}}
    s.dirty[t]--;s.linen--;s.toil--;mins-=M[t];cleaned++;}
  const left=s.dirty[0]+s.dirty[1]+s.dirty[2];
  // reviews: 5 minus 1 per issue; no light means 1 star
  if(sold){const sc=dark?1:5-(left?1:0)-(noStock?1:0);s.rev=Math.max(0,Math.min(5,s.rev+(sc-s.rev)*Math.min(1,sold/50)));}
  s.occH.push(Math.round(occ*100));if(s.occH.length>28)s.occH.shift();
  // breakdowns without an engineer (estimate: 3% a night from the budget hotel up)
  if(stage()>=1&&!s.eng&&Math.random()<.03&&!s.clT){s.cl[0]=Math.min(2,htTotal(0));s.clT=S.day+2;toast('🚰 A pipe burst: 2 rooms closed for 2 days. An engineer prevents this.',4);}
  if(s.closed>0)s.closed--;
  if(s.chk.ext&&S.day===s.extT)toast('🧯 Fire extinguishers are due for service (HQ checklist).',4);
  if(S.day%360===0)htInspect(false);
  // tax day: the 20th
  if(dom===20&&s.owed){const p=Math.min(s.box,s.owed),rest=s.owed-p;s.box-=p;s.owed=0;rows.push(['VAT and consumption tax paid from tax box','₦'+fmt(p),'#ffd98a']);
    if(rest>0){const debt=Math.round(rest*1.1);if(S.money>=debt){S.money-=debt;s.mo.cost+=debt;rows.push(['Tax box short: paid with 10% penalty','-₦'+fmt(debt),'#ffb3a3']);}else{s.taxDebt+=debt;toast('🧾 Tax box was short. ₦'+short(debt)+' (with 10% penalty) is owed; growth is paused until it is paid.',6);}}}
  s.last={sold,all,occ:Math.round(occ*100),grid:s.grid,lit,cleaned,left,dark};
  if(sold)rows.push(['Room nights sold '+sold+' of '+all+' ('+Math.round(occ*100)+'%)','₦'+fmt(D.room||0),'#b9ffcf']);
  if(D.svc)rows.push(['Service charge collected and shared with staff','₦'+fmt(D.svc),'#dfe7ec']);
  if(lit)rows.push(['Generator: '+lit+' litres ('+s.grid+'h grid light)','-₦'+fmt(Math.round(lit*s.diesel)),'#ffb3a3']);
  if(D.emerg)rows.push(['Emergency diesel (+25%)','-₦'+fmt(D.emerg),'#ffb3a3']);
  if(D.run)rows.push(['Repairs, booking fees, admin (21%)','-₦'+fmt(D.run),'#ffb3a3']);
  if(D.food)rows.push(['Food and tea-break supplies','-₦'+fmt(D.food),'#ffb3a3']);
  if(D.stock)rows.push(['Linen and toiletries (rush order)','-₦'+fmt(D.stock),'#ffb3a3']);
  if(D.refund)rows.push(['Refunds: no light','-₦'+fmt(D.refund),'#ffb3a3']);
  if(left)rows.push([left+' room(s) still dirty for tomorrow','','#ffd98a']);
  s.day={};return rows;}
function htInspect(paid){const s=S.htl,f=htSafeFail();
  if(f.length){s.closed=3;toast('📋 Inspector Halima Sule: '+f.join(', ')+' failed. No new guests for 3 days; stars withheld.',6);s.inspLast={day:S.day,ok:false,f};return;}
  const old=s.stars;s.stars=Math.min(5,Math.floor(htPassed()/2));s.inspLast={day:S.day,ok:true};
  if(s.stars>old){banner('NEW STAR GRADE',s.stars+' star'+(s.stars>1?'s':'')+'. Room rates +15% per star.');fanfare(true);}else toast('📋 Inspection passed. Grade stays at '+s.stars+' star'+(s.stars===1?'':'s')+'.',4);}
// Payday: brand fees from partner hotels, occupancy watch while a bank loan runs.
function htMonth(M){if(!isHotel())return{rows:[],cost:0,or:0};const s=htState(),rows=[];
  if(s.partners){const fee=Math.round(s.partners*HTLR.partnerRev*.05);S.money+=fee;S.mo.rev+=fee;rows.push([s.partners+' partner hotel(s): 5% brand fee','₦'+fmt(fee),'#b9ffcf']);}
  const loan=S.fin&&S.fin.loans&&S.fin.loans.some(l=>l.kind==='bank'),o=htOcc(28);
  if(loan&&s.occH.length>=28&&o<45){s.warn='Average occupancy '+o+'% with a bank loan running. New branches are paused until it is back over 45%.';toast('🏦 The bank is worried: occupancy '+o+'%. Try off-season deals and better reviews.',6);}else s.warn='';
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};const or=r?Math.round((cost+M.wages)/Math.max(1,M.rev||r)*100):0;return{rows,cost,or};}
function htCrew(){if(!isHotel()||!S.htl)return[];const s=S.htl,P=HTLR.pay,r=[{name:'Housekeepers',n:s.hk,each:P.hk},{name:'Receptionists',n:Math.max(1,Math.ceil(htAll()/40)),each:P.rec}];
  if(lvl('line1'))r.push({name:'Head chef',n:1,each:P.chef});if(s.stew)r.push({name:'Banquet stewards',n:s.stew,each:P.stew});
  if(s.eng)r.push({name:'Maintenance engineer',n:s.eng,each:P.eng});if(s.mgr)r.push({name:'Hotel manager',n:1,each:P.mgr});return r;}

/* ----- stage gates (research licences) ----- */
function htGate(st){const s=htState(),c=s.chk;
  if(s.taxDebt>0&&(st.base==='venue'||st.base==='line'))return'🔒 Pay the tax owed first (₦'+short(s.taxDebt)+', HQ).';
  if(s.warn&&st.base==='venue')return'🔒 '+s.warn;
  if(st.base==='venue'&&st.n===1){if(!c.reg||!c.ext)return'🔒 Budget hotel: get the tourism registration and service the fire extinguishers (HQ).';if(htOcc(7)<60)return'🔒 Budget hotel: keep 60% average occupancy for a week (now '+htOcc(7)+'%).';}
  if(st.base==='line'&&st.arg===2&&s.stars<1)return'🔒 Suites need your first star: fire certificate, clean kitchen and guest register, then pass an inspection (HQ).';
  if(st.base==='venue'&&st.n===2){if(s.stars<2)return'🔒 Ikeja needs 2 stars (now '+s.stars+').';if(s.rev<4)return'🔒 Ikeja needs a review score of 4.0+ (now '+s.rev.toFixed(1)+').';}
  if(st.base==='venue'&&st.n===3){if(!s.mgr)return'🔒 Abuja needs a hotel manager hired (HQ).';if(htOcc(7)<65)return'🔒 Abuja needs 65%+ occupancy at home (now '+htOcc(7)+'%).';}
  if(st.base==='line'&&st.arg===4){if(s.stars<3)return'🔒 Beach villas need 3 stars (now '+s.stars+').';if(!c.pool)return'🔒 Beach villas need a pool and beach safety plan (HQ checklist).';}
  if(st.base==='venue'&&st.n===4&&s.stars<5)return'🔒 Dubai and London need a five-star grade at home (now '+s.stars+').';
  return null;}

/* ----- HQ panel ----- */
function htHtml(){const s=htState(),z=htSeason(),{m,dom}=htDate(),L=s.last||{};
  const sq=(n,col)=>'<span style="display:inline-block;width:9px;height:9px;margin:1px;border-radius:2px;background:'+col+'"></span>'.repeat(Math.min(n,60));
  let h='<h2>Room board</h2><div class="stats"><div class="stat">Review score<b>'+s.rev.toFixed(1)+' / 5</b></div><div class="stat">Stars<b>'+(s.stars?'★'.repeat(s.stars):'none yet')+'</b></div><div class="stat">Occupancy, 7 nights<b>'+htOcc(7)+'%</b></div><div class="stat">Linen · toiletries<b>'+s.linen+' · '+s.toil+'</b></div></div>';
  h+='<table>';for(let t=0;t<3;t++){const T=htTotal(t);if(!T)continue;h+='<tr><td>'+HTN[t]+' ('+T+')<br><small>₦'+fmt(Math.round(B.lines[[0,2,4][t]].price*htRate(t)))+' a night</small></td><td>'+sq(htReady(t),'#3fbf6a')+sq(s.occ[t],'#5aa0ff')+sq(s.dirty[t],'#f08a24')+sq(s.cl[t],'#888')+'</td></tr>';}
  h+='</table><p class="note">🟩 ready · 🟦 guest in · 🟧 dirty · ⬜ closed. A room earns only when it is ready. Each housekeeper works 8 hours a night: a standard room takes 30 minutes, a suite 45, a villa 60, and each uses one linen set and one toiletry pack.'+(L.left?' Last night '+L.left+' room(s) were not ready in time.':'')+(s.closed?' ⚠️ No new guests for '+s.closed+' more day(s).':'')+'</p>';
  h+='<div class="acts"><button class="ghost" data-ht="hk" type="button">🧹 Hire housekeeper · ₦80k a month ('+s.hk+')</button>'+(s.hk>1?'<button class="ghost" data-ht="hk-" type="button">Let one housekeeper go</button>':'')+
    '<button class="ghost" data-ht="stock50" type="button">🧺 50 linen + toiletry sets · ₦'+short(50*(HTLR.linen+HTLR.toil))+'</button><button class="ghost" data-ht="stock200" type="button">🧺 200 sets · ₦'+short(200*(HTLR.linen+HTLR.toil))+'</button>'+
    '<button class="ghost'+(s.auto?' on':'')+'" data-ht="auto" type="button">Rush order when out (+10%): '+(s.auto?'on':'off')+'</button></div>';
  h+='<h2>Light and diesel</h2><div class="stats"><div class="stat">Grid light last night<b>'+(L.grid||s.grid)+' h</b></div><div class="stat">Tank<b>'+s.tank+' / '+HTLR.tank[stage()]+' L</b></div><div class="stat">Diesel this week<b>₦'+fmt(s.diesel)+'/L</b></div><div class="stat">Litres last night<b>'+(L.lit||0)+'</b></div></div>';
  h+='<div style="height:10px;border-radius:5px;background:rgba(255,255,255,.12);margin:6px 0"><div style="height:10px;border-radius:5px;width:'+Math.min(100,Math.round(s.tank/HTLR.tank[stage()]*100))+'%;background:#f2c230"></div></div>';
  h+='<div class="acts"><button class="ghost" data-ht="fill" type="button">⛽ Fill tank · ₦'+short(Math.max(0,HTLR.tank[stage()]-s.tank)*s.diesel)+'</button>'+(s.solar?'':'<button class="ghost" data-ht="solar" type="button">☀️ Solar and inverters · ₦'+short(htSolar())+'</button>')+'</div>';
  h+='<p class="note">When the grid is off, the generator burns about '+Math.max(1,Math.round(.25*htAll()))+' litres an hour for a full house, plus 10 litres per hall hour. '+(s.solar?'Solar cuts generator hours by 60%.':'Solar cuts generator hours by 60%.')+' If the tank runs dry, emergency diesel costs 25% more; with no cash for it, guests sit in the dark and get 30% back.</p>';
  const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  h+='<h2>Season and events · '+MN[m]+' '+dom+'</h2><div class="seg cal">'+MN.map((n,i)=>'<button class="ghost'+(i===m?' on':'')+'" type="button" disabled style="'+(i===11||i===0?'background:rgba(242,194,48,.35)':i>=5&&i<=8?'background:rgba(90,160,255,.25)':'')+'">'+n+'</button>').join('')+'</div>';
  h+='<p class="note">Now: '+(z==='peak'?'Detty December peak: rates ×1.5, rooms fill up.':z==='rain'?'Rainy season: city rates ×0.85, villas ×0.70.':'Normal season.')+' Peak runs 15 Dec to 5 Jan. Each star adds 15% to room rates.</p>';
  h+='<div class="seg" id="htadj">'+[-20,-10,0,10,20].map(p=>'<button class="ghost'+(s.adj===p?' on':'')+'" data-adj="'+p+'" type="button">'+(p>0?'+':'')+p+'%</button>').join('')+'</div><p class="note">Your price against the suggested rate. Every 10% above it loses about 8% of bookings.</p>';
  if(lvl('line3')){h+='<table><tr><td><b>Hall bookings</b></td><td><b>Day</b></td></tr>'+(s.book.length?s.book.map(b=>'<tr><td>₦'+short(b.fee)+(b.d%7===6?' (Saturday wedding ×2)':'')+'</td><td>in '+(b.d-S.day)+' day(s)</td></tr>').join(''):'<tr><td colspan="2">No bookings yet</td></tr>')+'</table>';
    h+='<div class="acts"><button class="ghost" data-ht="stew" type="button">🎀 Hire banquet steward · ₦75k ('+s.stew+')</button></div><p class="note">A hall day needs 4 stewards ready at the start, or the fee drops 30%. Each event books rooms for 10% of its guests.</p>';}
  h+='<h2>Star grade checklist · '+htPassed()+' of 10</h2><table>'+HTLR.checks.map(c=>{const ok=s.chk[c[0]]&&(c[0]!=='ext'||S.day<s.extT);return'<tr><td>'+c[1]+(c[3]?' ⚠️':'')+'</td><td>'+(ok?'✅':'<button class="ghost" data-ht="c-'+c[0]+'" type="button">₦'+short(c[2])+'</button>')+'</td></tr>';}).join('')+'</table>';
  h+='<div class="acts"><button class="ghost" data-ht="insp" type="button">📋 Ask for inspection · ₦'+short(HTLR.insp)+'</button></div><p class="note">Stars = items passed ÷ 2, up to 5. ⚠️ items are safety items: if one fails, no new guests for 3 days. There is no shortcut: fix each item. The board also visits once a year.'+(s.inspLast?' Last visit: day '+s.inspLast.day+(s.inspLast.ok?', passed.':', failed.'):'')+'</p>';
  h+='<h2>Staff</h2><div class="acts">'+(s.eng?'':'<button class="ghost" data-ht="eng" type="button">🔧 Hire engineer · ₦180k a month</button>')+(s.mgr?'':'<button class="ghost" data-ht="mgr" type="button">👩🏾‍💼 Hire hotel manager · ₦650k a month</button>')+'<button class="ghost" data-ht="clean" type="button">🧽 Deep clean and training day · ₦'+short(htDeep())+'</button></div><p class="note">An engineer keeps pipes and the generator working. A manager runs the hotel while you travel. Deep clean makes every dirty room ready now.</p>';
  h+='<h2>Tax box</h2><div class="stats"><div class="stat">In the box<b>₦'+fmt(s.box)+'</b></div><div class="stat">Due on the 20th<b>₦'+fmt(s.owed)+'</b></div></div><div class="acts"><button class="ghost'+(s.taxAuto?' on':'')+'" data-ht="tax" type="button">Tax goes straight to the box: '+(s.taxAuto?'on':'off')+'</button>'+(s.box<s.owed?'<button class="ghost" data-ht="topup" type="button">Move ₦'+short(s.owed-s.box)+' into the box</button>':'')+(s.taxDebt?'<button class="ghost" data-ht="debt" type="button">Pay tax owed · ₦'+short(s.taxDebt)+'</button>':'')+'</div>';
  h+='<p class="note">Every bill adds 7.5% VAT and 5% consumption tax. That money belongs to the tax office. If the box is short on the 20th, you pay 10% extra and growth pauses until it is settled. A 10% service charge goes to staff.</p>';
  if(stage()>=4){h+='<h2>Partner hotels</h2><p class="note">Other owners can run hotels under the Adunni Palms name and standard. Each pays 5% of its room revenue (about ₦'+short(HTLR.partnerRev*.05)+' a month). Partners now: '+s.partners+'.</p><div class="acts"><button class="ghost" data-ht="partner" type="button">🤝 Audit and sign a partner · ₦'+short(HTLR.partner)+'</button></div>';}
  if(s.warn)h+='<p class="note">⚠️ '+s.warn+'</p>';
  return h;}
const htSolar=()=>Math.round(15000000*Math.max(1,htAll()/20)); // estimate
const htDeep=()=>Math.round(300000*Math.max(1,htAll()/20)); // estimate
function htBind(){if(!isHotel())return;const s=htState(),re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#htadj [data-adj]').forEach(b=>b.onclick=()=>{s.adj=+b.dataset.adj;re();});
  document.querySelectorAll('#hqin [data-ht]').forEach(b=>b.onclick=()=>{const k=b.dataset.ht;
    if(k==='hk'){s.hk++;re();}if(k==='hk-'&&s.hk>1){s.hk--;re();}if(k==='stew'){s.stew++;re();}if(k==='eng'){s.eng=1;re();}if(k==='mgr'){s.mgr=true;re();}
    if(k==='auto'){s.auto=!s.auto;re();}if(k==='tax'){s.taxAuto=!s.taxAuto;re();}
    if(k==='stock50'||k==='stock200'){const n=k==='stock50'?50:200;buy(n*(HTLR.linen+HTLR.toil),()=>{s.linen+=n;s.toil+=n;});}
    if(k==='fill'){const l=Math.max(0,HTLR.tank[stage()]-s.tank);if(l)buy(l*s.diesel,()=>{s.tank+=l;});}
    if(k==='solar')buy(htSolar(),()=>{s.solar=true;});
    if(k==='clean')buy(htDeep(),()=>{s.dirty=[0,0,0];s.rev=Math.min(5,s.rev+.2);});
    if(k==='insp')buy(HTLR.insp,()=>htInspect(true));
    if(k==='topup'){const n=s.owed-s.box;if(S.money>=n){S.money-=n;s.box+=n;re();}else toast('You need ₦'+short(n-S.money)+' more.',2);}
    if(k==='debt')buy(s.taxDebt,()=>{s.taxDebt=0;});
    if(k==='partner')buy(HTLR.partner,()=>{s.partners++;});
    if(k.startsWith('c-')){const c=HTLR.checks.find(x=>x[0]===k.slice(2));buy(c[2],()=>{s.chk[c[0]]=true;if(c[0]==='ext')s.extT=S.day+180;});}});}

/* ----- drawings: own items, stations and map ----- */
XITEM.linen=(g,a,b)=>{for(let i=0;i<3;i++){R(g,-13,-8-i*7,26,7,2,a);R(g,-13,-5-i*7,26,1.6,1,b||'#1f7a4a');}};
XITEM.keycard=(g,a,b)=>{R(g,-12,-17,24,16,3,a);R(g,-12,-13,24,4,1,b);E(g,6,-5,2.5,2.5,'#fff');};
XITEM.tray=(g,a,b)=>{E(g,0,-3,14,4,'#c9c9c9');E(g,0,-8,10,8,a);E(g,0,-16,2,2,b||'#777');};
XSTATION.bed=(col)=>{rr(-44,-36,88,8,3,'#6b4423');rr(-42,-30,84,48,6,'#f4f1ea');rr(-36,-26,30,12,5,'#fff');rr(4,-26,30,12,5,'#fff');rr(-42,-8,84,26,5,col);rr(-42,-8,84,4,2,'rgba(255,255,255,.4)');rr(-42,18,6,8,2,'#6b4423');rr(36,18,6,8,2,'#6b4423');};
XSTATION.hall=(col)=>{for(const[x,y]of[[-30,-30],[30,-30],[-38,4],[38,4],[0,-40]])ell(x,y,8,6,'#8a5a2a');ell(0,-8,34,22,'#fff');ell(0,-10,30,18,col);ell(0,-12,8,5,'#f2c230');};
BIZ.hotel={name:'Adunni Palms Hotels',tag:'Rooms, food and halls',tone:'#1f7a4a',field:'hotel',isNew:true,qf:300,
  owner:{cloth:'#1f7a4a',trim:'#f2c230',hat:'gele',gender:'f'},
  hand:'Porter',cook:'housekeeper',seller:'receptionist',
  outfit:{hand:{cloth:'#2f8f5b',trim:'#f2c230',hat:'cap'},cook:{cloth:'#178a8a',trim:'#f4f1ea',hat:'none',apron:1,gender:'f'},server:{cloth:'#1f7a4a',trim:'#f2c230',hat:'none'},cashier:{cloth:'#1f7a4a',trim:'#f2c230',hat:'none',gender:'f'},porter:{cloth:'#2f8f5b',trim:'#f2c230',hat:'cap'}},
  venue:['Four-room guest house, Surulere','Budget hotel, Yaba','Business hotel, Ikeja','Lagos and Abuja towers','Seven-city chain'],
  // Research stage costs: Budget hotel N60m, Ikeja N800m, Abuja N1.6bn, Seven-City Crown N40bn; Stars on the Door N25m
  // (suites and upgrade), Calabar resort N2.5bn (villas). Breakfast kitchen and the hall have no own figure: engine prices them.
  costs:{venue:[60000000,800000000,1600000000,40000000000],line:[null,25000000,null,2500000000]},
  lines:[
   Object.assign(L('Standard room night','Room','#1f8a6a',45000,'night','field',['linen','#f4f1ea','#1f8a6a'],['keycard','#1f8a6a','#f2c230'],'bed'),{w:10,qx:2}),
   Object.assign(L('Breakfast buffet plate','Breakfast','#e0782a',15000,'plate','field',['carton','#c9a15a','#e0782a'],['bowl','#f4f1ea','#e0782a'],'pot'),{w:6,qx:3}),
   Object.assign(L('Executive suite night','Suite','#7a5af0',205000,'night','field',['linen','#fff','#7a5af0'],['keycard','#2b2b3a','#f2c230'],'bed'),{w:2,qx:1}),
   Object.assign(L('Conference hall day','Hall','#c62828',1500000,'hall day','field',['linen','#f4f1ea','#c62828'],['tray','#dfe7ec','#c62828'],'hall'),{w:.5,qx:1}),
   Object.assign(L('Beach villa night','Villa','#16a3c4',480000,'night','field',['basket','#f2c230'],['keycard','#16a3c4','#fff'],'bed'),{w:.8,qx:1})]};
// Adunni Palms' own map: rooms block, restaurant, rooftop suites, conference hall, pool and villas.
function hotelStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(20,30,20,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  if(li===0){rr(x+14,y+12,w-28,h-52,6,'#efe2c4');rr(x+10,y+8,w-20,12,4,'#1f7a4a');for(let r=0;r<3;r++)for(let c=0;c<4;c++)rr(x+26+c*((w-60)/4),y+30+r*36,18,22,3,r===2&&c===1?'#6b4423':'#7ad1ff');T('ROOMS BLOCK');}
  else if(li===1){rr(x+12,y+14,w-24,24,4,'#e0782a');ctx.fillStyle='#fff';for(let k=x+16;k<x+w-16;k+=24)ctx.fillRect(k,y+14,12,24);for(let k=0;k<3;k++){const cx=x+34+k*((w-68)/2);ell(cx,y+90,20,12,'#f4f1ea');ell(cx,y+90,6,4,'#e0782a');rr(cx-26,y+84,8,12,2,'#8a5a2a');rr(cx+18,y+84,8,12,2,'#8a5a2a');}T('RESTAURANT');}
  else if(li===2){rr(x+8,y+8,w-16,h-46,6,'#4a4f5a');ctx.strokeStyle='#f2c230';ctx.lineWidth=3;ctx.strokeRect(x+14,y+14,w-28,h-58);for(let k=0;k<3;k++){rr(x+26+k*((w-60)/3),y+40,26,12,4,'#f4f1ea');ell(x+38+k*((w-60)/3),y+100,10,10,'#3f9a3a');}T('ROOFTOP SUITES');}
  else if(li===3){rr(x+12,y+30,w-24,h-70,4,'#f1e6d2');ctx.fillStyle='#c62828';ctx.beginPath();ctx.moveTo(x+8,y+32);ctx.lineTo(x+w/2,y+8);ctx.lineTo(x+w-8,y+32);ctx.fill();for(let k=0;k<5;k++)rr(x+24+k*((w-60)/4),y+40,8,h-90,2,'#fff');rr(x+w/2-14,y+h-62,28,22,3,'#6b4423');T('CONFERENCE HALL');}
  else{rr(x+20,y+20,w-40,90,10,'#2fa8e0');ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(x+20+k*(w-40)/4,y+24);ctx.lineTo(x+20+k*(w-40)/4,y+106);ctx.stroke();}
    for(const px of[x+12,x+w-14]){rr(px-2,y+112,5,34,2,'#7a5230');ell(px,y+110,16,7,'#3f9a3a');}rr(x+w/2-20,y+124,40,26,4,'#f4e2b0');ctx.fillStyle='#8e5a2a';ctx.beginPath();ctx.moveTo(x+w/2-24,y+126);ctx.lineTo(x+w/2,y+112);ctx.lineTo(x+w/2+24,y+126);ctx.fill();T('POOL AND VILLAS');}}
BIZX.hotel={demand:htDemand,lineW:htLineW,sale:htSale,gate:htGate,html:htHtml,bind:htBind,night:htNight,month:htMonth,crew:htCrew,
  strip:hotelStrip,base:'#7fa65a',floor:['#d9c7a3','#e3d4b4','#efe4cc','#f3ead8','#f7f1e4'],locked(){return null;}};
