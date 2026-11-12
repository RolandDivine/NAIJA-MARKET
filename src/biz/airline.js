/* ===== KiteRise Air & Travels: research rules from plan3/airline.json on top of the shop engine =====
   Stages 0-1 own no seats: every ticket earns 1% commission + a N10,000 service fee. Stage 2 adds a wet-leased charter plane.
   After the five-phase operator certificate, leased aircraft fly routes; each flight earns seats x load factor x fare and pays
   its trip cost (fuel, charges, checks). Leases are in dollars. Fuel and the dollar move week to week. Safety is never cut:
   checks ground the aircraft and there is no way to skip or delay them. */
const AIRR={fx0:1500,fuel0:1.0,fuelMin:.65,fuelMax:1.7,fee:10000,comm:.01,visa:50000,wrong:25000,guarantee:15000000,
  // aircraft types: seats, monthly lease $, burn litres per block hour, check cost scale (research: narrow-body $40k / $900k)
  types:{c9:{n:'9-seat charter (wet lease)',seats:9,usd:60000,burn:300,ck:0},tp:{n:'50-seat turboprop',seats:50,usd:90000,burn:800,ck:.375},
    nb:{n:'150-seat narrow-body',seats:150,usd:240000,burn:3000,ck:1},wb:{n:'300-seat wide-body',seats:300,usd:700000,burn:9000,ck:2.92}},
  // burn 300 L/h for the 9-seater and check scale by lease size are estimates
  light:{every:60,days:1,usd:40000},heavy:{every:600,days:10,usd:900000},
  // routes: distance km, demand seats/day, base load factor, cabin; demand and distances for the network are research ranges
  routes:[{n:'Lagos–Abuja',d:520,dem:900,lf:.72,intl:0,tax:0},{n:'Lagos–Kano & PH',d:830,dem:600,lf:.72,intl:0,tax:0},
    {n:'Lagos–Accra',d:400,dem:300,lf:.75,intl:1,tax:.35},{n:'Lagos–London & Dubai',d:5000,dem:300,lf:.8,intl:1,tax:.2}],
  // foreign taxes share of fare (.35 regional, .2 long-haul) and the 30-seat business cabin are estimates
  biz:30,landing:[150000,400000,2000000],psc:2000,pscUsd:50,snack:3000,
  charterTrip:4300000, // estimate: oil company pays per round trip; two a day matches the research N260m a month
  aoc:[['Pre-application',5],['Formal application',5],['Document evaluation',90],['Demonstration flights',10],['Certificate issue',5]],
  pay:{consultant:180000,checkin:200000,handler:130000,cabin:450000,fo:2500000,captain:7000000,engineer:1800000},
  cabin:{tp:2,nb:4,wb:10}}; // cabin crew per aircraft: estimate
const AIRBASE=[135000,160000,420000,1650000,4800000];
const isAir=()=>SAVE.cur==='airline'&&B&&B.isNew;
function airState(){const s=S.air=S.air||{};const d={fx:AIRR.fx0,fuel:AIRR.fuel0,wk:Math.floor(S.day/7),fxRef:AIRR.fx0,usd:0,depot:0,depotPx:0,rep:1,
    tickets:0,visas:0,wrong:0,dbl:false,guar:false,charter:false,aoc:0,aocT:0,aocDay:0,fleet:[],nid:1,fare:[100,100,100,100],walk:[0,0,0,0,0],
    ot:[],refq:[],frozen:0,fined:0,repo:0,lastRepo:-999,crunch:false,last:null,mo:{rev:0,cost:0},day:{},hist:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  if(stage()>=2&&!s.charter){s.charter=true;s.fleet.push({id:s.nid++,t:'c9',r:-2,fl:0,flH:0,gd:0,miss:0});}
  for(let i=0;i<4;i++){const own=airOwn(i);B.lines[i].price=own?Math.round(AIRBASE[i]*s.fare[i]/100):AIRBASE[i];}
  B.lines[4].price=airOwn(3)?Math.round(AIRBASE[4]*s.fare[3]/100):AIRBASE[4];return s;}
const airCert=()=>S.air&&S.air.aoc>=5&&stage()>=3;
const airFly=r=>S.air.fleet.filter(a=>a.r===r&&!a.gd);
const airOwn=i=>{const s=S.air;if(!s||!airCert())return false;const r=i>=3?3:i;return s.fleet.some(a=>a.r===r);};
const airCost=(n,k)=>{const s=S.air;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const airUsdPay=(usd,k)=>{const s=S.air,u=Math.min(s.usd,usd);s.usd-=u;const n=Math.round((usd-u)*s.fx);if(n)airCost(n,k);else{s.day[k]=(s.day[k]||0)+Math.round(u*s.fx);}return n;};
const airBlock=r=>AIRR.routes[r].d/650+.4;
// 8 block hours a day with 45-minute turns; long-haul flies one round trip (two legs)
const airFpd=r=>r===3?2:Math.max(1,Math.floor(8/(airBlock(r)+.75)));
const airLF=r=>{const s=S.air,f=s.fare[r]/100;return Math.min(.95,AIRR.routes[r].lf*Math.pow(1/f,1.5)*s.rep);};
const airSeats=(a,r)=>r===3?AIRR.types[a.t].seats-(lvl('line4')?AIRR.biz:0):AIRR.types[a.t].seats;
const airFuelPx=()=>S.air.fuel*S.air.fx; // naira per litre
const airChk=a=>{const T=AIRR.types[a.t];return(AIRR.light.usd/AIRR.light.every+AIRR.heavy.usd/AIRR.heavy.every)*T.ck;};
const airCrewMo=a=>{const P=AIRR.pay;return a.t==='c9'?0:P.captain+P.fo+P.engineer+P.cabin*(AIRR.cabin[a.t]||2);};
// trip cost of one flight (one leg) and break-even load factor: BELF = tripCost / (seats x price x 0.95)
function airTrip(a,r){const s=S.air,T=AIRR.types[a.t],R0=AIRR.routes[r],lf=airLF(r),seats=airSeats(a,r),fare=AIRBASE[r===3?3:r]*s.fare[r]/100*(r===3?.5:1);
  const pax=seats*lf,bizRev=r===3&&lvl('line4')?AIRR.biz*lf*AIRBASE[4]*s.fare[3]/100*.5:0,rev=pax*fare+bizRev;
  const fuel=T.burn*airBlock(r)*airFuelPx(),lease=T.usd*s.fx/(airFpd(r)*MONTH),chk=airChk(a)*s.fx,crew=airCrewMo(a)/(airFpd(r)*MONTH);
  const chg=rev*(.05+R0.tax)+(pax+(bizRev?AIRR.biz*lf:0))*(R0.intl?AIRR.pscUsd*s.fx:AIRR.psc)+AIRR.landing[a.t==='wb'?2:a.t==='nb'?1:0];
  const cost=fuel+lease+chk+crew+chg,full=(seats*fare+(bizRev?AIRR.biz*AIRBASE[4]*s.fare[3]/100*.5:0))*.95;
  return{fuel,lease,chk,crew,chg,cost,rev,belf:cost/full,lf,litres:T.burn*airBlock(r)};}
const airLight=(r,a)=>{const t=airTrip(a,r);return t.lf>=t.belf+.05?'🟢':t.lf>=t.belf?'🟠':'🔴';};
const airOnTime=()=>{const o=S.air.ot.slice(-30);const f=o.reduce((x,y)=>x+y[0],0),k=o.reduce((x,y)=>x+y[1],0);return f?Math.round(k/f*100):100;};
const airLeaseUsd=()=>S.air.fleet.reduce((x,a)=>x+AIRR.types[a.t].usd,0);
const airBurnDay=()=>{const s=S.air;let l=0;if(!airCert())return 0;for(const a of s.fleet)if(a.r>=0)l+=AIRR.types[a.t].burn*airBlock(a.r)*airFpd(a.r);return l;};
const airMachines=()=>S.emp?(S.emp.belt||0)+(S.emp.auto||0)+(S.emp.pack||0):0;

/* ----- customers ----- */
function airDemand(){const s=airState();if(s.frozen>0)return 0;return(.7+.3*s.rep)*(s.dbl?.9:1);} // double-checking slows the desk 10%: estimate
function airLineW(i){const s=airState();if(s.frozen>0)return 0;const r=i>=3?3:i;if(airOwn(i))return airFly(r).length?Math.pow(100/s.fare[r],1.5):0;return 1;}
function airSale(i,c,q,amt){const s=airState();
  if(airOwn(i)){s.walk[i]+=q;s.mo.rev+=amt;return amt;} // own seat: the full fare
  // agency ticket on another airline: 1% commission + N10,000 service fee; international trips add a visa file (N50,000, whatever the embassy decides)
  let cash=Math.round(amt*AIRR.comm)+AIRR.fee*q;s.tickets+=q;if(i>=2){cash+=AIRR.visa*q;s.visas+=q;}
  if(!s.dbl)for(let k=0;k<q;k++)if(Math.random()<.02){cash-=AIRR.wrong;s.wrong++;toast('✏️ A wrong name on a ticket: the ₦25,000 change fee comes from the desk.',3);}
  S.mo.rev+=cash-amt;s.mo.rev+=cash;return cash;}

/* ----- nights: weekly fuel and dollar, flights, checks, delays, refunds, certificate ----- */
function airNight(){if(!isAir())return[];const s=airState(),rows=[],wk=Math.floor(S.day/7);s.day={};
  if(wk!==s.wk){s.wk=wk;s.fuel=Math.min(AIRR.fuelMax,Math.max(AIRR.fuelMin,s.fuel*(1+(Math.random()*.08-.04))));s.fx=Math.round(s.fx*(1+(Math.random()*.04-.017)));
    if(wk%4===0)s.fxRef=s.fx;}
  const need=airLeaseUsd();s.crunch=s.fx>=s.fxRef*1.15&&s.usd<need;
  if(s.frozen>0)s.frozen--;
  // certificate phases count down by themselves; demonstration flights need a leased aircraft and burn real fuel
  if(s.aoc<5&&s.aocT>0){if(s.aoc===3&&!s.fleet.some(a=>a.t!=='c9'))toast('🛫 Proving flights wait for a leased turboprop or jet.',3);
    else{s.aocT--;if(s.aoc===3){const a=s.fleet.find(a=>a.t!=='c9');airCost(Math.round(AIRR.types[a.t].burn*1.2*airFuelPx()),'proving');}
      if(!s.aocT){s.aoc++;if(s.aoc<5)s.aocT=AIRR.aoc[s.aoc][1];else{s.aocDay=S.day;banner('CERTIFIED','KiteRise holds its own air operator certificate');fanfare(true);}}}}
  // charter: two round trips a day to Port Harcourt for the oil company
  const ch=s.fleet.find(a=>a.t==='c9');if(ch&&s.charter){const inc=AIRR.charterTrip*2;S.money+=inc;S.mo.rev+=inc;s.mo.rev+=inc;s.day.charter=inc;
    airCost(Math.round(AIRR.types.c9.burn*(530/650+.4)*4*airFuelPx()),'fuel');}
  // scheduled flights
  let fl=0,ok=0,on=0,rev=0;const bad=Math.random()<.2,spare=s.fleet.some(a=>a.r===-1&&!a.gd);
  if(airCert())for(let r=0;r<4;r++){const assigned=s.fleet.filter(a=>a.r===r);if(!assigned.length)continue;
    for(const a0 of assigned){let a=a0;if(a.gd){const sp=s.fleet.find(x=>x.r===-1&&!x.gd&&x.t!=='c9'&&!x.used);if(sp){sp.used=1;a=sp;}else{// cancelled: pay 25% (30% intl) of the fare to booked passengers
        const t=airTrip(a0,r),n=Math.round(airSeats(a0,r)*t.lf)*airFpd(r),pay=Math.round(n*AIRBASE[r]*s.fare[r]/100*(AIRR.routes[r].intl?.3:.25));
        s.refq.push({d:S.day,n,amt:pay});s.rep=Math.max(.8,s.rep-.03);fl+=airFpd(r);continue;}}
      const t=airTrip(a,r);for(let k=0;k<airFpd(r);k++){fl++;
        const seats=airSeats(a,r),pax=Math.min(Math.round(seats*t.lf),Math.round(AIRR.routes[r].dem*Math.pow(100/s.fare[r],1.5)*s.rep/Math.max(1,airFpd(r)*assigned.length)));
        let r2=pax*AIRBASE[r]*s.fare[r]/100*(r===3?.5:1);if(r===3&&lvl('line4'))r2+=Math.round(AIRR.biz*t.lf)*AIRBASE[4]*s.fare[3]/100*.5;
        const walk=r===3?s.walk[3]+s.walk[4]:s.walk[r];r2=Math.max(0,r2-walk*AIRBASE[r]*s.fare[r]/100/Math.max(1,airFpd(r)*assigned.length));
        rev+=r2;// fuel from the depot first, at the locked price
        let lit=t.litres;const fromD=Math.min(s.depot,lit);s.depot-=fromD;lit-=fromD;airCost(Math.round(fromD*s.depotPx+lit*airFuelPx()),'fuel');
        airCost(Math.round(t.chg),'charges');
        let delay=.1+(bad?.15:0)+(spare?0:.2)-.03*airMachines();if(Math.random()<delay){airCost(pax*AIRR.snack,'snacks');if(Math.random()<.5){const ref=Math.round(pax*.3)*AIRBASE[r]*s.fare[r]/100*(r===3?.5:1);s.refq.push({d:S.day,n:Math.round(pax*.3),amt:ref});}}else on++;
        ok++;a.fl++;a.flH++;}
      // checks: light every 60 flights (1 day), heavy every 600 (10 days); the aircraft cannot fly until the engineer signs
      if(a.flH>=AIRR.heavy.every){a.flH=0;a.fl=0;a.gd=AIRR.heavy.days;a.gdNew=1;airUsdPay(AIRR.heavy.usd*AIRR.types[a.t].ck,'checks');toast('🔧 '+AIRR.types[a.t].n+' #'+a.id+' is in heavy check for 10 days.',4);}
      else if(a.fl>=AIRR.light.every){a.fl=0;a.gd=AIRR.light.days;a.gdNew=1;airUsdPay(AIRR.light.usd*AIRR.types[a.t].ck,'checks');}}}
  for(const a of s.fleet){delete a.used;if(a.gdNew)delete a.gdNew;else if(a.gd)a.gd--;}
  if(fl){s.ot.push([fl,on]);if(s.ot.length>60)s.ot.shift();}
  if(rev){rev=Math.round(rev);S.money+=rev;S.mo.rev+=rev;s.mo.rev+=rev;rows.push(['Seats sold online ('+ok+' flights)','₦'+fmt(rev),'#b9ffcf']);}
  s.walk=[0,0,0,0,0];
  // reputation: on-time below 60% for 30 days falls to 0.8; above 80% slowly recovers
  if(s.ot.length>=30){const o=airOnTime();if(o<60)s.rep=.8;else if(o>=80)s.rep=Math.min(1.2,s.rep+.005);}
  // refunds are paid from cash as soon as it is there; over 50 unpaid past 14 days brings a N50m fine and 3 days without sales
  for(const q of s.refq.slice()){if(S.money>=q.amt){airCost(q.amt,'refunds');s.refq.splice(s.refq.indexOf(q),1);}}
  const old=s.refq.filter(q=>S.day-q.d>14).reduce((x,q)=>x+q.n,0);if(old>50&&!s.frozen){airCost(50000000,'fine');s.frozen=3;s.fined++;toast('⚖️ More than 50 refunds waited past 14 days: ₦50m fine and ticket sales frozen for 3 days. Pay every refund first.',6);}
  const D=s.day,lab={charter:'Charter contract (2 round trips)',fuel:'Jet A1 fuel',charges:'Ticket charge, airport and foreign taxes',checks:'Maintenance checks',snacks:'Delay snacks (₦3,000 a passenger)',refunds:'Refunds and cancellation pay',proving:'Proving flight fuel',fine:'Regulator fine'};
  for(const k in lab)if(D[k])rows.push([lab[k],(k==='charter'?'₦':'-₦')+fmt(D[k]),k==='charter'?'#b9ffcf':'#ffb3a3']);
  s.last={fl,on,rev};return rows;}
// Payday: dollar leases for every aircraft, flying or grounded. Two missed payments: the lessor takes the plane back.
function airMonth(M){if(!isAir())return{rows:[],cost:0,or:0};const s=airState(),rows=[];let lease=0;
  for(const a of s.fleet.slice()){const usd=AIRR.types[a.t].usd,n=Math.round(Math.max(0,usd-s.usd)*s.fx);
    if(s.usd+S.money/s.fx>=usd){const u=Math.min(s.usd,usd);s.usd-=u;if(n){S.money-=n;s.mo.cost+=n;}lease+=Math.round(usd*s.fx);a.miss=0;}
    else{a.miss++;if(a.miss>=2){s.fleet.splice(s.fleet.indexOf(a),1);s.repo++;s.lastRepo=S.day;if(a.t==='c9')s.charter=false;toast('✈️ Two lease payments missed: the lessor took back '+AIRR.types[a.t].n+' #'+a.id+'. Its passengers are refunded.',6);}
      else toast('⚠️ Lease for '+AIRR.types[a.t].n+' #'+a.id+' missed. A second miss and the lessor takes it back.',5);}}
  if(lease)rows.push(['Aircraft leases ($'+fmt(airLeaseUsd())+' at ₦'+fmt(s.fx)+'/$)','-₦'+fmt(lease),'#ffb3a3']);
  const r=s.mo.rev,cost=s.mo.cost+lease;s.mo={rev:0,cost:0};const or=r?Math.round((cost+M.wages)/r*100):0;s.hist.push(or);if(s.hist.length>24)s.hist.shift();
  return{rows,cost:lease,or};}
function airCrew(){if(!isAir()||!S.air)return[];const s=S.air,P=AIRR.pay,st=stage(),r=[],own=s.fleet.filter(a=>a.t!=='c9'),routes=new Set(s.fleet.filter(a=>a.r>=0).map(a=>a.r)).size;
  r.push({name:'Travel consultants',n:[1,3,3,4,6][st],each:P.consultant}); // counts per stage: estimate
  if(own.length){r.push({name:'Captains',n:own.length,each:P.captain},{name:'First officers',n:own.length,each:P.fo},{name:'Aircraft engineers',n:own.length,each:P.engineer},
    {name:'Cabin crew',n:own.reduce((x,a)=>x+AIRR.cabin[a.t],0),each:P.cabin});}
  if(routes&&airCert())r.push({name:'Check-in agents',n:2*routes,each:P.checkin},{name:'Baggage handlers',n:2*routes,each:P.handler});return r;}

/* ----- gates ----- */
function airGate(st){const s=airState();
  if(st.base==='venue'&&st.n===1){if(s.tickets<500)return'🔒 The ticketing licence needs 500 tickets sold at the desk ('+s.tickets+' so far).';if(!s.guar)return'🔒 Lodge the ₦15m bank guarantee in HQ first.';}
  if(st.base==='venue'&&st.n===2&&!s.chSigned)return'🔒 Sign the Port Harcourt charter contract in HQ first.';
  if(st.base==='venue'&&st.n===3&&s.aoc<5)return'🔒 Pass all five certificate phases first (HQ). There is no shortcut.';
  if(st.base==='venue'&&st.n===4){if(!s.aocDay||S.day-s.aocDay<360||S.day-s.lastRepo<360||s.fined)return'🔒 Own hangar approval needs 12 months of clean audits since the certificate.';}
  if(st.base==='line'&&st.arg===1){const own=s.fleet.filter(a=>a.t!=='c9').length;if(!airCert())return'🔒 Scheduled routes need the operator certificate.';if(own<3)return'🔒 Four Cities needs 3 aircraft including a spare ('+own+' now).';if(s.ot.length<30||airOnTime()<75)return'🔒 Four Cities needs 75% on time for 30 days (now '+airOnTime()+'%).';}
  if(st.base==='line'&&st.arg===2&&s.usd<1500000)return'🔒 West Coast needs a $1.5m dollar reserve (now $'+fmt(Math.round(s.usd))+').';
  if(st.base==='line'&&st.arg===3){if(!s.fleet.some(a=>a.t==='wb'))return'🔒 Lease a wide-body first (3-month deposit).';if(airOnTime()<80)return'🔒 The foreign safety audit wants 80% on time (now '+airOnTime()+'%).';}
  return null;}

/* ----- HQ ----- */
function airHtml(){const s=airState(),RT=AIRR.routes;let h='<h2>Fuel and dollar desk</h2><div class="stats"><div class="stat">Dollar rate<b>₦'+fmt(s.fx)+'/$</b></div><div class="stat">Jet A1 this week<b>₦'+fmt(Math.round(airFuelPx()))+'/L</b></div>'+
  '<div class="stat">Dollar account<b>$'+fmt(Math.round(s.usd))+'</b></div><div class="stat">Fuel depot<b>'+fmt(Math.round(s.depot))+' L</b></div><div class="stat">Reputation<b>'+s.rep.toFixed(2)+'</b></div><div class="stat">On time (30 days)<b>'+airOnTime()+'%</b></div></div>';
  h+='<p class="note">Fuel and the dollar change once a week. Monthly leases: $'+fmt(airLeaseUsd())+(s.crunch?' · ⚠️ Dollar crunch: the naira fell 15%+ and the dollar account is short. New leases and depot buys are locked.':'')+'</p>';
  h+='<div class="acts"><button class="ghost" data-air="usd1" type="button">💵 Buy $100k · ₦'+short(100000*s.fx)+'</button><button class="ghost" data-air="usd2" type="button">💵 Buy $1m · ₦'+short(1e6*s.fx)+'</button>'+
    (airBurnDay()?'<button class="ghost" data-air="depot" type="button">⛽ Buy 7 days of fuel · ₦'+short(airBurnDay()*7*airFuelPx())+'</button>':'')+'</div>';
  if(stage()<3||!airCert()){h+='<h2>Travel desk</h2><p class="note">You own no seats yet. Each ticket earns 1% commission and a ₦10,000 service fee. International trips add a visa file (₦50,000): you prepare it with care, and the embassy alone decides. Tickets sold: '+s.tickets+' · visa files: '+s.visas+' · wrong names: '+s.wrong+'.</p>';
    h+='<div class="acts"><button class="ghost'+(s.dbl?' on':'')+'" data-air="dbl" type="button">✔️ Check every name twice'+(s.dbl?' (on)':'')+'</button>'+(s.guar?'':'<button class="ghost" data-air="guar" type="button">🏦 Lodge bank guarantee · ₦15m</button>')+
      (stage()>=1&&!s.chSigned?'<button class="ghost" data-air="charter" type="button">🤝 Sign Port Harcourt charter contract</button>':'')+'</div><p class="note">Checking twice stops wrong names (2% chance each, ₦25,000 to fix) but the desk serves about 10% fewer people.</p>';}
  if(stage()>=2){h+='<h2>Operator certificate</h2><table>'+AIRR.aoc.map((p,i)=>'<tr><td>'+(i+1)+'. '+p[0]+'</td><td>'+(s.aoc>i?'✅':s.aoc===i&&s.aocT?s.aocT+' days left':i===3?'needs a leased aircraft':'')+'</td></tr>').join('')+'</table>';
    if(s.aoc===0&&!s.aocT)h+='<div class="acts"><button class="ghost" data-air="aoc" type="button">📘 Start the five phases</button></div>';
    h+='<p class="note">Phases run in order, with inspectors on the proving flights. Lease payments run the whole time.</p>';}
  if(stage()>=2){h+='<h2>Fleet</h2><table><tr><td><b>Aircraft</b></td><td><b>Route · checks</b></td></tr>';
    for(const a of s.fleet){const T=AIRR.types[a.t];h+='<tr><td>'+T.n+' #'+a.id+'<br><small>$'+fmt(T.usd)+'/month'+(a.miss?' · ⚠️ lease missed':'')+'</small></td><td>'+(a.t==='c9'?'Charter, Lagos–PH':'<button class="ghost" data-air="r'+a.id+'" type="button">'+(a.r<0?'Spare':RT[a.r].n)+'</button>')+
      (a.t==='c9'?'':'<br><small>'+(a.gd?'🔧 grounded '+a.gd+' day(s)':'light check in '+(AIRR.light.every-a.fl)+' · heavy in '+(AIRR.heavy.every-a.flH))+'</small>')+'</td></tr>';}
    h+='</table><div class="acts">'+['tp','nb','wb'].filter(t=>t==='tp'||(t==='nb'&&airCert())||(t==='wb'&&lvl('line2'))).map(t=>'<button class="ghost" data-air="lease'+t+'" type="button">✈️ Lease '+AIRR.types[t].n+' · deposit ₦'+short(AIRR.types[t].usd*3*s.fx)+'</button>').join('')+'</div>';
    h+='<p class="note">Light check every 60 flights (1 day), heavy every 600 (10 days). No check can be skipped. A spare aircraft takes over a grounded one; with no spare, flights are cancelled and passengers get 25% (30% international) back.</p>';}
  if(airCert()&&s.fleet.some(a=>a.r>=0)){h+='<h2>Routes</h2><table><tr><td><b>Route · fare</b></td><td><b>Load · break-even</b></td></tr>';
    for(let r=0;r<4;r++){const a=s.fleet.find(x=>x.r===r);if(!a)continue;const t=airTrip(a,r);
      h+='<tr><td>'+RT[r].n+' · '+airFpd(r)+' flights a day each<div class="seg">'+[60,80,100,120,140,160].map(p=>'<button class="ghost'+(s.fare[r]===p?' on':'')+'" data-fare="'+r+'_'+p+'" type="button">'+p+'%</button>').join('')+'</div></td><td>'+airLight(r,a)+' '+Math.round(t.lf*100)+'% · '+Math.round(t.belf*100)+'%<br><small>trip ₦'+short(t.cost)+': fuel '+short(t.fuel)+', lease '+short(t.lease)+', checks '+short(t.chk)+'</small></td></tr>';}
    h+='</table><p class="note">Green: load factor 5+ points above break-even. Higher fares empty seats fast. Last night: '+(s.last?s.last.fl+' flights, '+s.last.on+' on time':'none')+'. Refunds waiting: '+s.refq.length+'.</p>';}
  return h;}
function airBind(){if(!isAir())return;const s=S.air,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#hqin [data-fare]').forEach(b=>b.onclick=()=>{const[r,p]=b.dataset.fare.split('_');s.fare[+r]=+p;airState();re();});
  document.querySelectorAll('#hqin [data-air]').forEach(b=>b.onclick=()=>{const k=b.dataset.air;
    if(k==='usd1')buy(Math.round(100000*s.fx),()=>{s.usd+=100000;});if(k==='usd2')buy(Math.round(1e6*s.fx),()=>{s.usd+=1e6;});
    if(k==='depot'){if(s.crunch){toast('Dollar crunch: depot buys are locked.',3);return;}const add=Math.min(airBurnDay()*7,airBurnDay()*30-s.depot);if(add<=0){toast('The depot holds 30 days of fuel at most.',2);return;}
      buy(Math.round(add*airFuelPx()),()=>{s.depotPx=(s.depot*s.depotPx+add*airFuelPx())/(s.depot+add);s.depot+=add;});}
    if(k==='dbl'){s.dbl=!s.dbl;re();}if(k==='guar')buy(AIRR.guarantee,()=>{s.guar=true;});if(k==='charter'){s.chSigned=true;toast('🤝 Signed: a team to Port Harcourt by 7am, every day.',3);re();}
    if(k==='aoc'){s.aocT=AIRR.aoc[0][1];re();}
    if(k.startsWith('lease')){const t=k.slice(5);if(s.crunch){toast('Dollar crunch: new leases are locked.',3);return;}buy(Math.round(AIRR.types[t].usd*3*s.fx),()=>{s.fleet.push({id:s.nid++,t,r:-1,fl:0,flH:0,gd:0,miss:0});});}
    if(k[0]==='r'){const a=s.fleet.find(x=>x.id===+k.slice(1));if(!a)return;const ok=[-1,0];if(lvl('line1'))ok.push(1);if(lvl('line2'))ok.push(2);if(lvl('line3')&&a.t==='wb')ok.push(3);
      a.r=ok[(ok.indexOf(a.r)+1)%ok.length];airState();re();}});}

/* ----- drawings ----- */
XITEM.bag=(g,a,b)=>{R(g,-9,-16,18,16,3,a);R(g,-4,-20,8,4,2,b);R(g,-9,-9,18,2,0,b);};
XITEM.ticket=(g,a,b)=>{R(g,-11,-12,22,12,2,a);R(g,-11,-12,6,12,2,b);for(let i=0;i<3;i++)R(g,-2,-9+i*3,10-i*2,1.2,0,'#6b7280');};
XITEM.trolley=(g,a,b)=>{R(g,-8,-22,16,20,2,a);R(g,-8,-22,16,4,1,b);R(g,-6,-14,12,1.5,0,'#9aa0a6');E(g,-5,-1,2,2,'#333');E(g,5,-1,2,2,'#333');};
XITEM.drum=(g,a,b)=>{R(g,-8,-20,16,20,3,a);R(g,-8,-14,16,2,0,b);R(g,-8,-7,16,2,0,b);E(g,0,-20,8,2,b);};
XSTATION.plane=(col)=>{rr(-46,-6,92,26,13,'#f4f1ea');ell(-44,7,8,13,'#f4f1ea');rr(-30,-2,8,6,2,'#2a3b5a');for(let i=0;i<5;i++)rr(-14+i*11,0,6,6,2,'#7ad1ff');
  rr(-8,8,22,6,1,col);rr(30,-24,12,24,3,col);rr(-4,-40,10,34,3,'#c9c4b8');rr(-4,14,10,14,3,'#c9c4b8');rr(-12,4,10,16,2,'#2a3b5a');};
function airStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=(t)=>{ctx.fillStyle='rgba(20,20,30,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  const jet=(cx,cy,sc,c)=>{ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);rr(-8,-50,16,100,8,'#f4f1ea');ctx.fillStyle='#e3ded2';ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(-52,14);ctx.lineTo(-52,22);ctx.lineTo(-6,10);ctx.lineTo(6,10);ctx.lineTo(52,22);ctx.lineTo(52,14);ctx.lineTo(6,-6);ctx.fill();
    ctx.beginPath();ctx.moveTo(-3,34);ctx.lineTo(-20,48);ctx.lineTo(20,48);ctx.lineTo(3,34);ctx.fill();rr(-2,30,4,22,2,c);ell(0,-44,4,3,'#2a3b5a');ctx.restore();};
  if(li===0){ctx.fillStyle='#d8cdb6';ctx.fillRect(x+4,y+4,w-8,h-8);rr(x+16,y+14,w-32,26,6,'#1b2a4a');ctx.fillStyle='#f47b20';ctx.font='900 12px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('KITERISE TRAVELS',x+w/2,y+32);
    for(let k=0;k<2;k++){rr(x+22+k*(w/2-14),y+70,w/2-30,26,4,'#8a5a2a');rr(x+30+k*(w/2-14),y+60,22,12,2,'#2a3b5a');ell(x+40+k*(w/2-14),y+112,9,9,'#5b5f66');}T('TRAVEL DESK');}
  else if(li===1){ctx.fillStyle='#cfd6dd';ctx.fillRect(x+4,y+4,w-8,h-8);rr(x+8,y+8,w-16,18,4,'#7ad1ff');for(let k=0;k<3;k++){rr(x+16+k*((w-32)/3),y+60,(w-32)/3-8,20,3,'#1b2a4a');rr(x+20+k*((w-32)/3),y+52,14,8,2,'#f47b20');}
    ctx.strokeStyle='#9aa0a6';ctx.lineWidth=2;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x+20,y+100+k*14);ctx.lineTo(x+w-20,y+100+k*14);ctx.stroke();}T('TERMINAL CHECK-IN');}
  else if(li===4){ctx.fillStyle='#8f949b';ctx.fillRect(x+4,y+4,w-8,h-8);ctx.fillStyle='#5b6068';ctx.beginPath();ctx.moveTo(x+8,y+70);ctx.quadraticCurveTo(x+w/2,y-10,x+w-8,y+70);ctx.lineTo(x+w-8,y+h-34);ctx.lineTo(x+8,y+h-34);ctx.fill();
    ctx.fillStyle='#2b2f36';ctx.fillRect(x+20,y+70,w-40,h-110);jet(x+w/2,y+h/2+6,.8,'#f47b20');T('HANGAR');}
  else{ctx.fillStyle='#6f737a';ctx.fillRect(x+4,y+4,w-8,h-8);ctx.strokeStyle='rgba(255,214,90,.85)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+w/2,y+8);ctx.lineTo(x+w/2,y+h-34);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.strokeRect(x+14,y+12,w-28,h-48);jet(x+w/2,y+h/2-8,li===3?1.05:.8,li===2?'#2a62c9':'#f47b20');T(li===3?'WIDE-BODY STAND':'APRON STAND '+li);}}

/* ===== registration ===== */
BIZ.airline={name:'KiteRise Air & Travels',tag:'Travel desk to five world cities',tone:'#f47b20',field:'airline',isNew:true,qf:300,
  owner:{cloth:'#1b2a4a',trim:'#f47b20',hat:'none',gender:'f'},
  hand:'Baggage handler',cook:'ground crew',seller:'travel consultant',
  outfit:{hand:{cloth:'#f28a1e',trim:'#fff36b',hat:'hard'},cook:{cloth:'#5b6068',trim:'#f47b20',hat:'cap'},server:{cloth:'#1b2a4a',trim:'#f47b20',hat:'none',gender:'f'},
    cashier:{cloth:'#1b2a4a',trim:'#f47b20',hat:'none'},porter:{cloth:'#f28a1e',trim:'#22252b',hat:'hard'}},
  venue:['Plaza desk, Lagos','KiteRise Travels shop','Hangar corner and charter plane','Domestic terminal wing','KiteRise Lagos hub'],
  // Research stage startup costs: Agency N25m, One Small Plane N200m, Five Phases N1bn, Five Cities N40bn;
  // Four Cities N1.8bn, West Coast N5bn, Wide Body N6bn. The business cabin (line 4) has no figure, so the engine prices it.
  costs:{venue:[25000000,200000000,1000000000,40000000000],line:[1800000000,5000000000,6000000000,null]},
  lines:[
   Object.assign(L('Lagos-Abuja Shuttle Seat','Abuja','#f47b20',135000,'one-way seat','field',['bag','#1b2a4a','#f47b20'],['ticket','#fffaf0','#f47b20'],'desk'),{w:10,qx:3}),
   Object.assign(L('Kano & PH Hop Seat','Kano/PH','#2a62c9',160000,'one-way seat','field',['bag','#2a62c9','#f2c230'],['ticket','#e7f1fb','#2a62c9'],'plane'),{w:5,qx:2}),
   Object.assign(L('West Coast Flyer Seat','Accra','#1f8a4c',420000,'regional seat','field',['trolley','#e9e2d2','#1f8a4c'],['ticket','#eaf7ef','#1f8a4c'],'plane'),{w:2,qx:2}),
   Object.assign(L('London Economy Return','London','#7a5af0',1650000,'economy return','field',['drum','#c62828','#f2c230'],['ticket','#f1ecff','#7a5af0'],'plane'),{w:.8,qx:1}),
   Object.assign(L('Long-Haul Business Return','Business','#8e1c1c',4800000,'business return','field',['trolley','#1b2a4a','#d4af37'],['ticket','#fff7e0','#8e1c1c'],'plane'),{w:.3,qx:1})]};
BIZX.airline={demand:airDemand,lineW:airLineW,sale:airSale,gate:airGate,html:airHtml,bind:airBind,night:airNight,month:airMonth,crew:airCrew,
  strip:airStrip,base:'#7d8188',floor:['#d8cdb6','#e2d8c4','#c9ced4','#d8dde2','#e6e9ec'],locked(){return null;}};
