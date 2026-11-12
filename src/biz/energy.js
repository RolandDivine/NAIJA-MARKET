/* ===== Kpakpando Energy: research rules from plan3/energy.json on top of the shop engine =====
   Fuel is prepaid by the tanker load and sold for a thin margin per litre. Gas is bought per kg at the depot price.
   Solar kits sell for cash or pay small-small. The power plant earns Band A only on 20-hour days. Prices move weekly.
   No illegal fuel, no hoarding gains, no short measure: pumps can never be set to pour short. */
BIZ.energy={name:'Kpakpando Energy',tag:'Gas, fuel, solar and power',tone:'#f28a1e',field:'energy',isNew:true,qf:300,
  owner:{cloth:'#f28a1e',trim:'#1b2a4a',hat:'hard',gender:'f'},
  hand:'Tanker hand',cook:'pump attendant',seller:'gas operator',
  outfit:{hand:{cloth:'#4a6a8a',trim:'#fff36b',hat:'hard'},cook:{cloth:'#f28a1e',trim:'#f2c230',hat:'cap'},server:{cloth:'#1b2a4a',trim:'#2a62c9',hat:'none'},
    cashier:{cloth:'#f4f1ea',trim:'#f28a1e',hat:'none',gender:'f'},porter:{cloth:'#2e8b3d',trim:'#22252b',hat:'hard'}},
  venue:['One gen, one table','The proper gas shop','Kpakpando filling station','Stations on every road','Depot and power plant'],
  // Research stage startup costs: gas shop N4.5m, filling station (First Pump) N180m, branch chain N3bn, depot and plant N60bn;
  // petrol pumps = land lease and tanks N120m, solar bay N60m. Diesel island has no figure, so the engine prices it.
  costs:{venue:[4500000,180000000,3000000000,60000000000],line:[null,120000000,null,60000000]},
  lines:[
   Object.assign(L('Phone charging','Charging','#f2c230',200,'phone charged','field',['jerry','#c62828','#f2c230'],['gadget','phone','#1b1f27','#7ad1ff'],'genset'),{w:10,qx:3}),
   Object.assign(L('Cooking gas refill','Gas','#2a62c9',1450,'kg of gas','field',['cyl','#2a62c9','#dfe7ec'],['cyl','#2a62c9','#f2c230'],'cage'),{w:6,qx:6}),
   // 25 L fill per car (research pump rule) x N1,350 a litre
   Object.assign(L('Petrol','Petrol','#c62828',25*1350,'25 L fill','field',['jerry','#c62828','#f2c230'],['jerry','#e04a3a','#fff36b'],'pump'),{w:5,qx:2}),
   Object.assign(L('Diesel','Diesel','#1f8a4c',25*1700,'25 L fill','field',['jerry','#1f8a4c','#f2c230'],['jerry','#2fae64','#fff36b'],'pump'),{w:2,qx:2}),
   Object.assign(L('Solar home kit (3kW)','Solar kit','#7a5af0',2400000,'3kW kit installed','field',['panel','#1b2a4a','#7ad1ff'],['panel','#7a5af0','#f2c230'],'solarbay'),{w:.5,qx:1})]};

const ENR={load:33000,tankMax:3,pet:[1316,1370,1340],die:[1600,1700,1650],lpg:[950,1050,1000],spread:450,area:50, // pet: research landing/depot; die: estimate
  late:.15,drift:.1,tol:.5,testEvery:14,fine:500000,service:50000,
  papers:[['site','Site suitability check',2000000,3],['act','Approval to construct',5000000,7],['lto','Licence to operate',3000000,3]],renew:3000000,year:360,
  reqFee:5000,unsafe:.05,leak:1/50,sensor:150000,sensorDays:90,ext:60000,drill:100000, // extinguishers and drill: estimates
  kit:2400000,kitCost:1800000,dep:720000,inst:140000,n:12,pay:.9,lateP:.07,def:.03,check:10000,
  genRent:3000,genBuy:450000,genFuel:.2,power:.015,grid:18000000, // gen rent/buy, phone gen fuel 20%, mini-grid 20kW x N900/W: estimates
  plantMW:50,cf:[.30,.45],tariff:{A:225,B:75},gas:100,contractKwh:100000,meter:500000000,maint:1000000000, // MW, gas N/kWh, contract size, meter and maintenance prices: estimates
  pay:{officer:250000,tech:180000,driver:150000,manager:350000}};
const isEn=()=>SAVE.cur==='energy'&&B&&B.isNew;
const enWk=()=>Math.floor(S.day/7);
function enState(){const s=S.en=S.en||{};const d={trust:50,wk:-1,pet:ENR.pet[2],die:ENR.die[2],lpg:ENR.lpg[2],kc:ENR.kitCost,cf:.4,pm:50,tank:[0,0],ord:[],auto:true,avg:[0,0],sold:[0,0],dry:[0,0],lost:0,
    pumps:[0,0,0,0],seal:[0,0,0,0],next:ENR.testEvery,fails:[],susp:0,tests:{p:0,f:0},paper:{},pend:null,lic:0,sensor:-1,sensorOld:false,ext:false,officer:0,drill:-99,check:true,alarm:0,req:[],
    gen:false,grid:false,tech:0,credit:true,cashOnly:false,loans:[],kits:0,defs:0,scar:0,plant:{maint:0,meters:0,band:'A',con:5,hrs:24,short:[]},day:{},mo:{rev:0,cost:0},hist:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));enWeek(s);
  const L=B.lines;L[1].price=s.lpg+ENR.spread;L[2].price=25*enPump(s,0);L[3].price=25*enPump(s,1);return s;}
const enPump=(s,f)=>(f?s.die:s.pet)+s.pm;
const walk=(v,r)=>Math.round(Math.max(r[0],Math.min(r[1],v+(Math.random()-.5)*(r[1]-r[0])*.3)));
function enWeek(s){const w=enWk();if(s.wk===w)return;const first=s.wk<0;s.wk=w;if(first)return;
  s.pet=walk(s.pet,ENR.pet);s.die=walk(s.die,ENR.die);s.lpg=walk(s.lpg,ENR.lpg);s.kc=Math.round(ENR.kitCost*(.95+Math.random()*.15)); // panel cost follows the naira week to week (estimate)
  s.cf=Math.round((ENR.cf[0]+Math.random()*(ENR.cf[1]-ENR.cf[0]))*100)/100;
  for(let k=0;k<4;k++)s.pumps[k]=Math.round((s.pumps[k]+ENR.drift)*10)/10;
  if(lvl('line2')&&Math.random()<.08){s.scar=S.day+3;s.pet=Math.round(s.pet*1.05);s.die=Math.round(s.die*1.05);toast('⛽ Fuel scarcity: queues for 3 days and depot prices +5%. Keep selling at your normal price.',5);}} // scarcity odds: estimate
const enCost=(n,k)=>{const s=S.en;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const licOk=()=>{const s=S.en;return s.lic>S.day&&s.susp<=S.day;};
const safety=()=>{const s=S.en;return Math.min(100,40+(s.sensor>=0&&!s.sensorOld?15:0)+(s.ext?10:0)+(s.officer?20:0)+(S.day-s.drill<=30?15:0));}; // weights: estimate
const openPumps=()=>S.en.seal.filter(d=>d<=S.day).length;
const defRate=()=>{const s=S.en;return s.kits?Math.round(s.defs/s.kits*100):0;};
const coll=()=>Math.min(.95,.8+.03*S.en.plant.meters);
const avail=()=>Math.min(.98,.75+.05*S.en.plant.maint);
const transit=f=>S.en.ord.filter(o=>o.f===f).reduce((a,o)=>a+o.L,0);
function enOrder(f,quiet){const s=S.en,cost=ENR.load*(f?s.die:s.pet);if(s.tank[f]+transit(f)+ENR.load>ENR.load*ENR.tankMax){if(!quiet)toast('The tank holds 3 loads. Sell some first.',3);return false;}
  if(S.money<cost){if(!quiet)toast('A load costs ₦'+short(cost)+'. You need ₦'+short(cost-S.money)+' more.',3);return false;}
  enCost(cost,'tanker');s.ord.push({f,L:ENR.load,at:S.day+1+(Math.random()<ENR.late?1:0)});return true;}

/* ----- customers ----- */
function enDemand(){const s=enState();return(.6+.8*s.trust/100)*(s.scar>S.day?1.3:1);}
function enLineW(i){const s=enState();
  if(i===1)return s.alarm>S.day?0:1;
  if(i===2||i===3){const f=i-2;if(!licOk()||s.tank[f]<=0)return 0;const p=s.pm-ENR.area;
    return openPumps()/4*(lvl('cook'+i)?1:6/20)*Math.max(.2,p>0?1-.05*p/10:1+.03*(-p)/10)*(s.scar>S.day?2:1);}
  if(i===4){if(s.tech<2)return 0;if(!s.cashOnly&&s.kits>=10&&defRate()>10)return 0;if(S.money<s.kc)return 0;}
  return 1;}
function enSale(i,c,q,amt){const s=enState();
  if(i===0){enCost(Math.round(amt*ENR.genFuel),'gen');}
  else if(i===1){if(Math.random()<ENR.unsafe){enCost(ENR.reqFee,'req');s.req.push({at:S.day+2,amt});return 0;}
    const kg=amt/B.lines[1].price;enCost(Math.round(kg*s.lpg+amt*ENR.power*(s.grid?.33:1)),'lpg');
    if(!s.check&&Math.random()<ENR.leak)enLeak('An unchecked cylinder leaked');}
  else if(i===2||i===3){const f=i-2,p=enPump(s,f),want=amt/p,L=Math.min(want,s.tank[f]);s.tank[f]-=L;s.sold[f]+=L;amt=Math.round(L*p);
    if(s.tank[f]<=0){s.tank[f]=0;s.dry[f]=1;}enCost(Math.round(amt*ENR.power*(s.grid?.33:1)),'gen');}
  else if(i===4){const n=Math.max(1,Math.round(amt/B.lines[4].price));enCost(n*s.kc+(s.credit&&!s.cashOnly?n*ENR.check:0),'kit');s.kits+=n;
    if(s.cashOnly)amt=n*ENR.kit;else{amt=n*ENR.dep;s.loans.push({n,left:ENR.n,late:0});}}
  s.mo.rev+=amt;return amt;}
function enLeak(why){const s=S.en;s.alarm=S.day+1;s.trust=Math.max(0,s.trust-30);toast('🚨 '+why+': leak alarm. Gas cage closed for a day, trust -30. Nobody was hurt.',5);}

/* ----- nights ----- */
function enNight(){if(!isEn())return[];const s=enState(),d=S.day,rows=[];
  for(const o of s.ord.filter(o=>o.at<=d)){s.tank[o.f]+=o.L;toast('🚛 Tanker arrived: '+fmt(o.L)+' L of '+(o.f?'diesel':'petrol')+'.',3);}s.ord=s.ord.filter(o=>o.at>d);
  for(const f of[0,1]){const on=lvl('line'+(f+2))&&licOk();s.avg[f]=Math.round(s.avg[f]*.7+s.sold[f]*.3);
    if(on){if(s.dry[f]){s.trust=Math.max(0,s.trust-10);s.lost+=10;rows.push([(f?'Diesel':'Petrol')+' pumps ran dry · trust -10','','#ffb3a3']);}
      else if(s.sold[f]){if(s.lost>0){const g=Math.min(5,s.lost);s.trust=Math.min(100,s.trust+g);s.lost-=g;}if(s.scar>d)s.trust=Math.min(100,s.trust+5);}
      if(s.auto&&s.tank[f]+transit(f)<Math.max(s.avg[f],1000)*1.5&&!transit(f))enOrder(f,true);}
    s.sold[f]=0;s.dry[f]=0;}
  if(lvl('line2')&&s.lic>d&&d>=s.next){s.next=d+ENR.testEvery;const k=Math.floor(Math.random()*4);
    if(s.pumps[k]<=ENR.tol){s.tests.p++;s.trust=Math.min(100,s.trust+10);toast('🧪 Inspector Hauwa\'s 10 L can read exact on pump '+(k+1)+'. Trust +10.',4);}
    else{s.tests.f++;s.seal[k]=d+1;enCost(ENR.fine,'fine');s.trust=Math.max(0,s.trust-15);s.fails.push(d);toast('🧪 Pump '+(k+1)+' poured '+Math.round(s.pumps[k]*100)+' mL short per 10 L. Sealed for a day, ₦500k fine, trust -15. Service your pumps.',6);}
    s.fails=s.fails.filter(x=>x>d-30);}
  if(lvl('line2')&&s.susp<=d&&s.lic>d&&(s.fails.length>=2||safety()<50)){s.susp=d+7;s.fails=[];toast('⛔ Licence suspended for 7 days: all pumps sealed. Service the pumps and run a drill.',6);}
  if(s.pend&&s.pend.at<=d){s.paper[s.pend.k]=1;if(s.pend.k==='lto')s.lic=d+ENR.year;toast('📄 '+ENR.papers.find(p=>p[0]===s.pend.k)[1]+' approved.',4);s.pend=null;}
  if(s.paper.lto&&s.lic<=d+1&&s.lic>d-1){if(S.money>=ENR.renew){enCost(ENR.renew,'lic');s.lic+=ENR.year;toast('📄 Station licence renewed for another year (₦3m).',4);}else toast('📄 Licence renewal due: ₦3m. Pumps lock if it lapses.',5);}
  if(s.sensor>=0&&!s.sensorOld&&d-s.sensor>ENR.sensorDays){s.sensorOld=true;if(lvl('line1'))enLeak('The leak sensor is over 90 days old');}
  for(const r of s.req.filter(r=>r.at<=d)){S.money+=r.amt;s.mo.rev+=r.amt;S.mo.rev+=r.amt;s.day.reqIn=(s.day.reqIn||0)+r.amt;}s.req=s.req.filter(r=>r.at>d);
  if(!s.gen)enCost(ENR.genRent,'rent');
  if(stage()>=4){const P=s.plant,h=Math.min(24,Math.round(24*avail()*(.92+Math.random()*.12)*10)/10);P.hrs=h;P.short.push(h<20?1:0);if(P.short.length>7)P.short.shift();
    const kwh=Math.min(Math.round(ENR.plantMW*1000*24*s.cf),P.con*ENR.contractKwh),t=P.band==='A'?(h>=20?ENR.tariff.A:0):ENR.tariff.B,cash=Math.round(kwh*t*coll());
    enCost(kwh*ENR.gas,'plantGas');S.money+=cash;s.mo.rev+=cash;S.mo.rev+=cash;rows.push(['Power: '+fmt(kwh)+' kWh, '+h+' h'+(P.band==='A'&&h<20?' (under 20 h: Band A refunded)':''),'₦'+fmt(cash),'#b9ffcf']);
    if(P.short.reduce((a,b)=>a+b,0)>=3){let gone=0;for(let k=0;k<P.con;k++)if(Math.random()<.2)gone++;P.con-=gone;P.short=[];if(gone)toast('⚡ Three short days this week: '+gone+' bulk buyer(s) left. Raise maintenance.',5);}}
  const D=s.day,lab={tanker:'Tanker loads (prepaid)',lpg:'Gas from depot and pump power',gen:'Generator diesel',rent:'Generator rental',kit:'Solar kits and credit checks',fine:'Pump test fine',req:'Cylinder requalification',lic:'Licence fees',plantGas:'Gas for the power plant',buy:'Safety and equipment'};
  for(const k in lab)if(D[k])rows.push([lab[k],'-₦'+fmt(D[k]),'#ffb3a3']);if(D.reqIn)rows.push(['Requalified cylinders refilled','₦'+fmt(D.reqIn),'#b9ffcf']);
  s.day={};return rows;}
function enMonth(M){if(!isEn())return[];const s=enState(),rows=[];let paid=0,late=0,def=0,rec=0;
  for(const l of s.loans){const due=l.n-l.late;let back=l.late;l.late=0;for(let k=0;k<due;k++){const r=Math.random(),dr=ENR.def*(s.credit?.5:1);
      if(r<dr){def++;l.n--;rec+=Math.round(s.kc*.5);}else if(r<dr+ENR.lateP){l.late++;late++;}else paid++;}
    paid+=back;l.left--;}
  s.loans=s.loans.filter(l=>l.left>0&&l.n>0);s.defs+=def;const cash=paid*ENR.inst+rec;if(cash){S.money+=cash;s.mo.rev+=cash;S.mo.rev+=cash;}
  if(paid||late||def)rows.push(['Pay small-small: '+paid+' paid, '+late+' late, '+def+' locked','₦'+fmt(cash),'#b9ffcf']);
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};if(r)s.hist.push(Math.round((cost+M.wages)/r*100));if(s.hist.length>24)s.hist.shift();
  return{rows,cost,or:s.hist[s.hist.length-1]};}
function enCrew(){if(!isEn()||!S.en)return[];const s=S.en,P=ENR.pay,r=[];if(s.officer)r.push({name:'Safety officer',n:s.officer,each:P.officer});if(s.tech)r.push({name:'Solar technicians',n:s.tech,each:P.tech});
  if(lvl('line2'))r.push({name:'Tanker driver',n:1,each:P.driver},{name:'Station manager',n:1,each:P.manager});return r;}

/* ----- stage gates ----- */
function enGate(st){const s=enState();
  if(st.base==='venue'&&st.n===1&&safety()<60)return'🔒 The gas shop needs safety 60+ (now '+safety()+'): extinguishers, a leak sensor or a safety officer (HQ).';
  if(st.base==='line'&&st.arg===2&&!(s.paper.site&&s.paper.act))return'🔒 Tanks go in after the site check and approval to construct (HQ, papers).';
  if(st.base==='venue'&&st.n===2&&!s.paper.lto)return'🔒 Opening day needs the licence to operate (HQ, papers).';
  if(st.base==='line'&&st.arg===4&&(s.trust<70||s.tech<2))return'🔒 Solar needs trust 70+ (now '+s.trust+') and two solar technicians (HQ).';
  if(st.base==='venue'&&st.n===3&&safety()<75)return'🔒 Every branch needs safety 75+ (now '+safety()+').';
  return null;}

/* ----- HQ panel ----- */
function enHtml(){const s=enState(),b=(k,t,on)=>'<button class="ghost'+(on?' on':'')+'" data-en="'+k+'" type="button">'+t+'</button>';
  let h='<h2>Trust and safety</h2><div class="stats"><div class="stat">Trust<b>'+s.trust+' / 100</b></div><div class="stat">Safety<b>'+safety()+' / 100</b></div><div class="stat">Gas depot<b>₦'+fmt(s.lpg)+'/kg</b></div><div class="stat">Gas retail<b>₦'+fmt(s.lpg+ENR.spread)+'/kg</b></div></div>';
  h+='<table><tr><td>Fire extinguishers</td><td>'+(s.ext?'✅':b('ext','Buy · ₦60k'))+'</td></tr><tr><td>Leak sensor (replace every 90 days)</td><td>'+(s.sensor>=0&&!s.sensorOld?'✅ '+(S.day-s.sensor)+' days old':b('sensor','Fit · ₦150k'))+'</td></tr>'
    +'<tr><td>Safety officer</td><td>'+(s.officer?'✅':b('officer','Hire · ₦250k a month'))+'</td></tr><tr><td>Fire drill (last 30 days)</td><td>'+(S.day-s.drill<=30?'✅':b('drill','Run · ₦100k'))+'</td></tr>'
    +'<tr><td>Leak check every cylinder</td><td>'+b('check',s.check?'On':'Off',s.check)+'</td></tr><tr><td>Generator</td><td>'+(s.gen?'Own gen ✅':b('gen','Buy own gen · ₦450k'))+(s.grid?' · solar mini-grid ✅':lvl('line2')?' '+b('grid','20 kW mini-grid · ₦18m'):'')+'</td></tr></table>';
  h+='<p class="note">5% of cylinders arrive expired or dented: we send them for requalification (₦5,000) and refill them 2 days later. Skipping leak checks risks a 1 in 50 leak alarm (cage shut a day, trust -30).</p>';
  h+='<h2>Three papers</h2><table>';for(const[k,n,c,dd]of ENR.papers){const done=s.paper[k],p=s.pend&&s.pend.k===k;h+='<tr><td>'+n+' · ₦'+short(c)+', '+dd+' days</td><td>'+(done?'✅':p?'⏳ day '+s.pend.at:b('p_'+k,'Apply'))+'</td></tr>';}
  h+='</table><p class="note">In order: site check, approval to construct, then the licence to operate (needs safety 70+). The licence renews every game year for ₦3m'+(s.lic>S.day?' · valid to day '+s.lic:'')+(s.susp>S.day?' · ⛔ suspended to day '+s.susp:'')+'.</p>';
  if(lvl('line2')){h+='<h2>Tanks and tanker orders</h2><table><tr><td><b>Fuel</b></td><td><b>Landed</b></td><td><b>Pump</b></td><td><b>Tank</b></td></tr>';
    for(const f of[0,1]){if(f&&!lvl('line3'))continue;const days=s.avg[f]?(s.tank[f]/s.avg[f]).toFixed(1):'–';h+='<tr><td>'+(f?'Diesel':'Petrol')+'</td><td>₦'+fmt(f?s.die:s.pet)+'</td><td>₦'+fmt(enPump(s,f))+'</td><td>'+fmt(Math.round(s.tank[f]))+' L · '+days+' days'+(transit(f)?' · 🚛 '+fmt(transit(f))+' L coming':'')+'</td></tr>';}
    h+='</table><div class="acts">'+b('o0','🚛 Petrol load · ₦'+short(ENR.load*s.pet))+(lvl('line3')?b('o1','🚛 Diesel load · ₦'+short(ENR.load*s.die)):'')+b('auto','Manager auto-orders: '+(s.auto?'on':'off'),s.auto)+'</div>';
    h+='<p class="note">A load is 33,000 L, paid before it leaves the depot. It arrives next day (15% chance of one day late). The tank holds 3 loads. Depot prices move each week.</p>';
    h+='<h2>Pump margin</h2><div class="seg" id="enpm">'+[20,30,40,50,60,70,80].map(m=>'<button class="ghost'+(s.pm===m?' on':'')+'" data-pm="'+m+'" type="button">+₦'+m+'</button>').join('')+'</div><p class="note">Pump price = landed cost + margin. Area margin is about ₦50: every ₦10 above it sends 5% of drivers elsewhere.</p>';
    h+='<h2>Pumps · full litre</h2><table><tr><td><b>Pump</b></td><td><b>Short per 10 L</b></td><td></td></tr>';for(let k=0;k<4;k++)h+='<tr><td>Pump '+(k+1)+(s.seal[k]>S.day?' (sealed)':'')+'</td><td>'+Math.round(s.pumps[k]*100)+' mL '+(s.pumps[k]>ENR.tol?'⚠️':'')+'</td><td>'+b('sv'+k,'Service · ₦50k')+'</td></tr>';
    h+='</table><p class="note">Pumps drift 10 mL per 10 L each week. The inspector tests every 14 days and passes within 50 mL. Tests: '+s.tests.p+' passed, '+s.tests.f+' failed.</p>';}
  h+='<h2>Solar pay small-small</h2><div class="stats"><div class="stat">Kits sold<b>'+s.kits+'</b></div><div class="stat">Default rate<b>'+defRate()+'%</b></div><div class="stat">Kits paying<b>'+s.loans.reduce((a,l)=>a+l.n,0)+'</b></div><div class="stat">Panel cost<b>₦'+short(s.kc)+'</b></div></div>';
  h+='<div class="acts">'+b('tech','Hire solar technician · ₦180k ('+s.tech+')')+b('credit','Credit checks: '+(s.credit?'on':'off'),s.credit)+b('cash','Cash only: '+(s.cashOnly?'on':'off'),s.cashOnly)+'</div>';
  h+='<p class="note">₦2.4m kit: 30% deposit (₦720,000), then 12 × ₦140,000. Each month about 90% pay, 7% pay late, 3% stop and the kit locks (recovered at half value). A ₦10,000 credit check halves defaults. Over 10% defaults pauses new credit kits.</p>';
  if(stage()>=4){const P=s.plant;h+='<h2>Power plant</h2><div class="stats"><div class="stat">Supply yesterday<b>'+P.hrs+' h</b></div><div class="stat">Availability<b>'+Math.round(avail()*100)+'%</b></div><div class="stat">Capacity factor<b>'+Math.round(s.cf*100)+'%</b></div><div class="stat">Collection<b>'+Math.round(coll()*100)+'%</b></div></div>';
    h+='<table><tr><td>NERC band</td><td>'+b('bA','Band A ₦225',P.band==='A')+b('bB','Band B ₦75',P.band==='B')+'</td></tr><tr><td>Bulk contracts</td><td>'+P.con+' '+b('con','Sign one')+'</td></tr><tr><td>Maintenance level '+P.maint+'</td><td>'+b('maint','Raise · ₦1bn')+'</td></tr><tr><td>Prepaid meters '+P.meters*10+'%</td><td>'+(P.meters<5?b('meter','+10% · ₦500m'):'max')+'</td></tr></table>';
    h+='<p class="note">Band A pays only on days with 20+ hours of supply; shorter days are refunded. Three short days in a week and each bulk buyer may leave (20%).</p>';}
  return h;}
function enBind(){if(!isEn())return;const s=S.en,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}enCost(n,'buy');f();fanfare(false);re();};
  document.querySelectorAll('#enpm [data-pm]').forEach(x=>x.onclick=()=>{s.pm=+x.dataset.pm;enState();re();});
  document.querySelectorAll('#hqin [data-en]').forEach(x=>x.onclick=()=>{const k=x.dataset.en,P=s.plant;
    if(k==='ext')buy(ENR.ext,()=>{s.ext=true;});if(k==='sensor')buy(ENR.sensor,()=>{s.sensor=S.day;s.sensorOld=false;});if(k==='officer'){s.officer=1;re();}if(k==='drill')buy(ENR.drill,()=>{s.drill=S.day;});
    if(k==='check'){s.check=!s.check;re();}if(k==='gen')buy(ENR.genBuy,()=>{s.gen=true;});if(k==='grid')buy(ENR.grid,()=>{s.grid=true;});
    if(k.startsWith('p_')){const i=ENR.papers.findIndex(p=>'p_'+p[0]===k),p=ENR.papers[i];if(s.pend)return toast('One paper at a time. Wait for the current one.',3);
      if(i>0&&!s.paper[ENR.papers[i-1][0]])return toast('Finish '+ENR.papers[i-1][1].toLowerCase()+' first.',3);if(p[0]==='lto'&&safety()<70)return toast('The licence needs safety 70+ (now '+safety()+').',3);
      buy(p[2],()=>{s.pend={k:p[0],at:S.day+p[3]};});}
    if(k==='o0'||k==='o1'){if(enOrder(+k[1]))fanfare(false);re();}if(k==='auto'){s.auto=!s.auto;re();}
    if(k.startsWith('sv')){const i=+k.slice(2);buy(ENR.service,()=>{s.pumps[i]=0;});}
    if(k==='tech'){s.tech++;re();}if(k==='credit'){s.credit=!s.credit;re();}if(k==='cash'){s.cashOnly=!s.cashOnly;re();}
    if(k==='bA'){P.band='A';re();}if(k==='bB'){P.band='B';re();}if(k==='con'){P.con++;re();}if(k==='maint')buy(ENR.maint,()=>{P.maint++;});if(k==='meter')buy(ENR.meter,()=>{P.meters++;});});}

/* ----- drawings: jerrycan, gas cylinder, solar panel; generator, gas cage, fuel pump, solar bay ----- */
XITEM.jerry=(g,a,b)=>{R(g,-10,-26,20,26,3,a);R(g,-6,-31,8,6,2,'#22252b');R(g,3,-30,6,4,1,b);R(g,-7,-20,14,3,1,'rgba(255,255,255,.35)');R(g,-7,-13,14,8,2,b);};
XITEM.cyl=(g,a,b)=>{R(g,-10,-24,20,24,8,a);E(g,0,-24,8,4,a);R(g,-4,-32,8,7,2,'#9aa1a8');R(g,-7,-34,14,3,1,'#5b5f66');R(g,-10,-14,20,3,1,b);};
XITEM.panel=(g,a,b)=>{R(g,-14,-24,28,22,2,'#c9ced2');R(g,-12,-22,24,18,1,a);g.fillStyle=b;for(let i=0;i<3;i++)for(let j=0;j<2;j++)g.fillRect(-11+i*8,-21+j*9,7,8);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-12,-22,24,3);R(g,-3,-2,6,2,1,'#5b5f66');};
XSTATION.genset=(col)=>{rr(-38,-30,76,34,5,'#2e8b3d');rr(-34,-26,30,22,3,'#22252b');for(let i=0;i<4;i++)rr(-31,-23+i*5,24,2,1,'#5b5f66');rr(4,-26,30,10,2,'#f2c230');rr(4,-12,30,12,2,'#e9e2d2');for(let i=0;i<4;i++)rr(7+i*7,-10,4,8,1,col);rr(-30,4,8,6,1,'#22252b');rr(22,4,8,6,1,'#22252b');rr(26,-40,5,12,2,'#5b5f66');};
XSTATION.cage=(col)=>{rr(-44,-44,88,48,3,'rgba(90,96,104,.25)');ctx.strokeStyle='#5b5f66';ctx.lineWidth=2;for(let x=-44;x<=44;x+=11){ctx.beginPath();ctx.moveTo(x,-44);ctx.lineTo(x,4);ctx.stroke();}ctx.strokeRect(-44,-44,88,48);
  for(let i=0;i<3;i++){rr(-38+i*15,-30,12,30,5,col);rr(-35+i*15,-34,6,5,1,'#9aa1a8');}rr(10,-6,30,10,2,'#5b5f66');rr(14,-12,22,7,2,'#c9ced2');rr(20,-30,10,18,2,'#22252b');rr(21,-28,8,6,1,'#7dff9a');};
XSTATION.pump=(col)=>{rr(-46,-6,92,12,3,'#c9ced2');rr(-20,-46,40,44,5,'#f4f1ea');rr(-20,-46,40,10,4,col);rr(-14,-32,28,12,2,'#1b2a4a');rr(-11,-29,22,6,1,'#7dff9a');rr(-14,-16,28,4,1,col);
  ctx.strokeStyle='#22252b';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(20,-28);ctx.quadraticCurveTo(36,-20,30,-4);ctx.stroke();rr(26,-10,8,10,2,'#22252b');ctx.fillStyle='#f2c230';ctx.font='900 9px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('★',0,-38);};
XSTATION.solarbay=(col)=>{rr(-46,-8,92,14,3,'#8a6a4a');ctx.save();ctx.translate(-18,-18);ctx.transform(1,0,-.35,1,0,0);rr(-16,-22,34,24,2,'#c9ced2');rr(-14,-20,30,20,1,'#1b2a4a');ctx.fillStyle='#2a62c9';for(let i=0;i<3;i++)for(let j=0;j<2;j++)ctx.fillRect(-13+i*10,-19+j*10,9,9);ctx.restore();
  rr(10,-34,30,26,3,'#22252b');rr(13,-31,24,10,2,'#2fae64');rr(13,-18,10,8,2,col);rr(26,-18,10,8,2,'#f2c230');};

/* ----- Kpakpando's own map: roadside gen and gas kiosk, the forecourt, the power plant and substation, the solar farm ----- */
function energyStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,c=x+w/2,T=t=>{ctx.fillStyle='rgba(30,20,8,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,c,y+h-16);};
  if(li===0){ctx.fillStyle='#b98a5a';ctx.fillRect(x+6,y+6,w-12,h-40);ctx.fillStyle='#5b5f66';ctx.fillRect(x,y+h-70,w,26);ctx.fillStyle='#fff';for(let k=x+8;k<x+w;k+=30)ctx.fillRect(k,y+h-58,16,2);
    ctx.fillStyle='#22252b';ctx.fillRect(c-2,y+40,4,70);ctx.fillStyle='#f28a1e';ctx.beginPath();ctx.moveTo(c-56,y+50);ctx.lineTo(c,y+22);ctx.lineTo(c+56,y+50);ctx.fill();ctx.fillStyle='#f2c230';ctx.beginPath();ctx.moveTo(c-20,y+40);ctx.lineTo(c,y+22);ctx.lineTo(c+20,y+40);ctx.fill();
    rr(c-40,y+108,80,10,3,'#8a5a2a');rr(c+20,y+86,30,22,3,'#2e8b3d');T('ROADSIDE KIOSK');}
  else if(li===1){ctx.fillStyle='#c9c2b2';ctx.fillRect(x+6,y+6,w-12,h-40);rr(x+16,y+16,w-32,70,4,'#e9e2d2');ctx.fillStyle='#2a62c9';ctx.fillRect(x+16,y+16,w-32,14);ctx.fillStyle='#fff';ctx.font='900 10px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('KPAKPANDO GAS',c,y+27);
    ctx.strokeStyle='#5b5f66';ctx.lineWidth=2;ctx.strokeRect(x+22,y+96,w-44,60);for(let k=x+22;k<x+w-22;k+=10){ctx.beginPath();ctx.moveTo(k,y+96);ctx.lineTo(k,y+156);ctx.stroke();}
    for(let k=0;k<5;k++)rr(x+30+k*((w-70)/5),y+120,12,30,5,k%2?'#2a62c9':'#3f8fd0');rr(x+w-40,y+40,10,20,2,'#c62828');T('GAS KIOSK');}
  else if(li===2){ctx.fillStyle='#6f6c66';ctx.fillRect(x+4,y+4,w-8,h-36);rr(x+10,y+16,w-20,22,4,'#f28a1e');ctx.fillStyle='#fff36b';ctx.fillRect(x+10,y+34,w-20,4);for(const k of[.3,.7])rr(x+w*k-4,y+38,8,90,2,'#c9ced2');
    for(const k of[.3,.7]){rr(x+w*k-14,y+100,28,30,3,'#f4f1ea');rr(x+w*k-14,y+100,28,7,2,'#c62828');}ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(x+10,y+150);ctx.lineTo(x+w-10,y+150);ctx.stroke();ctx.setLineDash([]);T('FORECOURT');}
  else if(li===3){ctx.fillStyle='#a39f96';ctx.fillRect(x+4,y+4,w-8,h-36);rr(x+14,y+40,w*.55,70,3,'#dfe7ec');rr(x+14,y+34,w*.55,10,2,'#5b5f66');rr(x+24,y+6,14,40,2,'#8a8f96');rr(x+44,y+12,12,34,2,'#8a8f96');ell(x+31,y+6,10,5,'rgba(230,230,230,.8)');
    for(let k=0;k<3;k++)rr(x+w*.62+k*16,y+60+k*6,12,26,2,'#5b6f8a');ctx.strokeStyle='#3a3f46';ctx.lineWidth=2;const px=x+w-30;ctx.beginPath();ctx.moveTo(px-14,y+160);ctx.lineTo(px,y+110);ctx.lineTo(px+14,y+160);ctx.moveTo(px-12,y+124);ctx.lineTo(px+12,y+124);ctx.moveTo(px-8,y+140);ctx.lineTo(px+8,y+140);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+14,y+124);ctx.lineTo(px,y+112);ctx.stroke();T('POWER PLANT AND SUBSTATION');}
  else{ctx.fillStyle='#8fae45';ctx.fillRect(x+4,y+4,w-8,h-36);for(let r=0;r<4;r++)for(let k=0;k<3;k++){const px=x+14+k*((w-28)/3),py=y+14+r*36;rr(px,py,(w-28)/3-8,24,2,'#c9ced2');rr(px+2,py+2,(w-28)/3-12,20,1,'#1b2a4a');ctx.fillStyle='rgba(122,209,255,.35)';ctx.fillRect(px+2,py+2,(w-28)/3-12,5);}
    T('SOLAR FARM');}}

BIZX.energy={demand:enDemand,lineW:enLineW,sale:enSale,gate:enGate,html:enHtml,bind:enBind,night:enNight,month:enMonth,crew:enCrew,strip:energyStrip,
  base:'#9a9384',floor:['#c9a27a','#cfc2a8','#d6d2c8','#e2e0da','#e8ecef'],locked(){return null;}};
