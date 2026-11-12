/* ===== Omi-Ola Industries: research rules from plan3/factory.json on top of the shop engine =====
   Sachet water to consumer goods. Quality Score and product registration (never a printed registration number in the game),
   power from grid, diesel or gas, line health (OEE), a raw material store with weekly prices, distributor credit,
   a waste bin with a licensed recycler, and an export desk. Prices that move change week to week. */
const FACR={
  pass:{lab:180000,fitter:150000},            // storyline monthly salaries
  kwh:{grid:210,gas:350},                     // research cost per kWh
  diesel0:3277,                               // research: N3,277 a litre, May 2026
  kwhPerL:3.6,                                // estimate: so a diesel kWh costs about N900 (research figure)
  kwhPerNaira:.00018,                         // estimate: energy near 10% of revenue at half grid, half diesel
  tank:[1000,2000,10000,60000,250000],        // estimate: generator tank in litres per stage
  gas:80000000,reinsp:150000,reg:300000,      // research: gas line, re-inspection, new product registration
  test:10000,filters:60000,service:50000,     // estimates: outside lab test a day, filter change, line service parts
  mancap:1000000,envPermit:2000000,           // estimates: standards certificate and environment permit fees
  nepc:20000,recycle:150,fine:250000,bin:500, // research: exporter certificate, N150/kg recycler, N250k fine, 500 kg bin
  raw:.45,run:{dist:.10,maint:.05,admin:.08}, // research cost structure (admin without loan interest, which the bank charges)
  scrapKg:[.3,.5,1.5,2,2.5],                  // estimate: kg of scrap per unit sold, per line
  container:1000,sail:21};                    // estimates: cartons in a container, days at sea before payment
const FDIST=['Iya Basira Ventures, Agege','Kano Road Traders','Ariaria Wholesale, Aba'];
const isFac=()=>SAVE.cur==='factory'&&B&&B.isNew;
const fwk=()=>Math.floor(S.day/7);
function facState(){const s=S.fac=S.fac||{};const d={qs:80,st:stage(),lab:0,outLab:true,tests:0,filt:S.day,filtHit:0,q75:0,q80:0,reg:[true,false,false,false,false],sealed:false,reinsp:false,
    mancap:0,mancapAt:0,env:false,nepc:0,label:'Ghana',cont:[],fitter:0,svc:[S.day,S.day,S.day,S.day,S.day],down:[0,0,0,0,0],
    gH:5,gas:false,litres:FACR.tank[0],diesel:FACR.diesel0,idx:1,wk:fwk(),stock:46500*14,paid:1,use:46500,useDay:0,auto:true,out:false,payb:[],
    terms:0,trust:[60,60,60],inv:[],late:0,waste:0,sold:0,slow:-1,day:{},mo:{rev:0,cost:0},hist:[],batch:0};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  s.use=Math.max(s.use,facFloor());if(s.st!==stage()){s.st=stage();if(s.auto&&s.stock<s.use*7)fBuy(Math.round(s.use*7-s.stock));}return s;}
// research monthly revenue per stage x 45% raw share / 30 days: the smallest daily raw use the store plans for
const facFloor=()=>Math.round([3100000,8300000,21000000,420000000,2200000000][stage()]*FACR.raw/30);
const fcost=(n,k)=>{const s=S.fac;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const fP=()=>S.emp&&S.emp.auto?.95:.85;
const fA=i=>Math.max(0,1-S.fac.down[i]/10);
const fOEE=i=>fA(i)*fP()*S.fac.qs/100;
const fOff=()=>{const s=S.fac;return s.gas?0:(s.litres>0?0:1-s.gH/10);}; // share of the day lost to power
const fLimit=k=>S.fac.trust[k]<40?0:S.fac.trust[k]*20000*(stage()+1);
const fOwed=k=>S.fac.inv.filter(v=>v.d===k).reduce((a,v)=>a+v.amt,0);
const fRecv=()=>S.fac.inv.reduce((a,v)=>a+v.amt,0);
const fCap=()=>Math.round(S.fac.use*30);
const fBuyCost=v=>Math.round(v*S.fac.idx);
function fBuy(v,prem){const s=S.fac,c=Math.round(fBuyCost(v)*(prem||1));s.paid=(s.paid*s.stock+s.idx*(prem||1)*v)/Math.max(1,s.stock+v);s.stock+=v;s.out=false;
  if(s.q80>=30){s.payb.push({due:S.day+14,amt:c});s.mo.cost+=c;}else fcost(c,'raw');return c;}

/* ----- customers ----- */
function facDemand(){const s=facState();if(s.sealed||s.out)return 0;if(!s.gas&&s.litres<=0&&s.gH<=0)return 0;
  return(.7+.6*s.qs/100)*(s.terms?1.1:1)*(s.slow===S.day?.7:1);} // credit +10% buyers: estimate
function facLineW(i){const s=facState();if(s.sealed||s.out||!s.reg[i])return 0;return Math.max(.02,fOEE(i)*(1-fOff()));}
function facSale(i,c,q,amt){const s=facState(),base=amt;
  // raw materials from the store at the price paid; an empty store stops the lines until a delivery
  let u=base*FACR.raw;if(s.stock>=u){s.stock-=u;fcost(Math.round(u*s.paid),'raw');}
  else{const left=s.stock;fcost(Math.round(left*s.paid+(u-left)*s.idx*1.2),'raw');s.stock=0;s.out=true;toast('📦 The raw material store is empty. Lines stop until the next delivery.',4);}
  s.useDay+=u;
  // energy: grid hours, then gas or the generator
  const kwh=base*FACR.kwhPerNaira,g=s.gH/10;let e=kwh*g*FACR.kwh.grid;
  if(s.gas)e+=kwh*(1-g)*FACR.kwh.gas;else{const L=kwh*(1-g)/FACR.kwhPerL;s.litres=Math.max(0,s.litres-L);s.day.litres=(s.day.litres||0)+L;}
  fcost(Math.round(e),'power');
  for(const k in FACR.run)fcost(Math.round(base*FACR.run[k]),'run');
  s.waste+=q*FACR.scrapKg[i]*(1-s.qs/100+.02);s.sold+=q;
  if(s.qs>=90)amt=Math.round(amt*1.1);
  // distributor credit: price +5%, paid after the chosen days
  if(s.terms&&Math.random()<.5){const k=Math.floor(Math.random()*3),a=Math.round(amt*1.05);
    if(fOwed(k)+a<=fLimit(k)){const due=S.day+s.terms,v=s.inv.find(x=>x.d===k&&x.due===due&&!x.late);if(v)v.amt+=a;else s.inv.push({d:k,due,amt:a,late:false});
      S.mo.rev+=a;s.mo.rev+=a;return 0;}}
  s.mo.rev+=amt;return amt;}

/* ----- nights ----- */
function facNight(){if(!isFac())return[];const s=facState(),rows=[],d=S.day;
  // week to week: raw price index and diesel price
  if(fwk()!==s.wk){s.wk=fwk();s.idx=Math.min(1.5,Math.max(.7,s.idx+rnd(-.2,.2)-.25*(s.idx-1)));s.idx=Math.round(s.idx*100)/100;
    s.diesel=Math.round(Math.min(4200,Math.max(2600,s.diesel*(1+rnd(-.06,.06)))));} // diesel swing range: estimate
  if(!s.out)s.use=Math.max(facFloor(),Math.round(.8*s.use+.2*s.useDay));s.useDay=0;
  const hold=Math.round(s.stock*s.paid*.01/7);if(hold)fcost(hold,'hold');
  // deliveries: one day for local suppliers
  if(s.out&&s.auto)fBuy(Math.round(s.use*7));
  // supplier credit payments due
  const due=s.payb.filter(p=>p.due<=d);if(due.length){const t=due.reduce((a,p)=>a+p.amt,0);S.money-=t;s.day.raw=(s.day.raw||0)+t;s.payb=s.payb.filter(p=>p.due>d);}
  // distributor invoices
  let inCash=0;for(const v of s.inv)if(v.due<=d){if(!v.late&&Math.random()<(100-s.trust[v.d])/400){v.late=true;v.due=d+14;s.trust[v.d]=Math.max(0,s.trust[v.d]-15);s.late++;} // late payers settle 14 days later: estimate
    else{S.money+=v.amt;inCash+=v.amt;if(!v.late)s.trust[v.d]=Math.min(100,s.trust[v.d]+3);v.amt=0;}}
  s.inv=s.inv.filter(v=>v.amt>0);if(inCash)rows.push(['Distributors paid invoices','₦'+fmt(inCash),'#b9ffcf']);
  // quality: lab tests, filters, batches
  if(s.lab||s.outLab){s.qs=Math.min(100,s.qs+2);s.tests++;if(!s.lab)fcost(FACR.test,'lab');}else s.qs=Math.max(0,s.qs-5);
  const fa=d-s.filt;if(fa>=30&&fa-s.filtHit>=7){s.filtHit=fa;s.qs=Math.max(0,s.qs-10);toast('💧 Filters not changed for 30 days: Quality Score -10.',4);} // repeats weekly: estimate
  if(Math.random()<Math.max(0,80-s.qs)/400){s.qs=Math.max(0,s.qs-15);s.batch++;toast('🧪 A batch failed the lab test and was poured away. Quality Score -15.',4);} // chance: estimate
  s.q75=s.qs>=75?s.q75+1:0;s.q80=s.qs>=80?s.q80+1:0;
  if(s.reinsp){s.reinsp=false;if(s.qs>=60){s.sealed=false;toast('✅ Inspector Bisi re-inspected. The lines are open again.',4);}else toast('Re-inspection: Quality Score still under 60. Do lab tests and change filters first.',5);}
  if(!s.sealed&&s.qs<60){s.sealed=true;banner('LINES SEALED','Quality Score under 60. Clean up, then book a re-inspection.');}
  if(s.mancapAt&&d>=s.mancapAt){s.mancapAt=0;if(s.qs>=70){s.mancap=d+1080;toast('🏅 Standards certificate granted for 3 years.',4);}else toast('Standards certificate: the second inspection needs Quality Score 70+. Apply again.',5);}
  // waste bin
  if(s.waste>FACR.bin){s.waste=0;fcost(FACR.fine,'fine');s.qs=Math.max(0,s.qs-10);toast('🗑️ Waste bin overflowed: ₦250,000 fine and Quality Score -10. Sell scrap to the recycler in time.',5);}
  // power and machines for tomorrow
  let gh=0;for(let h=0;h<10;h++)if(Math.random()<.5)gh++;s.gH=gh;
  for(let i=0;i<5;i++){s.down[i]=0;if(!lvl('line'+i)&&i)continue;const ch=Math.min(.2,.02+.01*Math.floor((d-s.svc[i])/7));if(Math.random()<ch)s.down[i]=s.fitter?4:8;}
  if(!s.gas&&s.litres<=0&&gh<10){if(lvl('line2'))s.stock=Math.max(0,s.stock*(1-.2*Math.min(1,.1*(10-gh))));toast('⛽ The generator is dry. Lines stop when the grid is off. Buy diesel in HQ.',5);}
  // export containers
  for(const c of s.cont)if(c.due<=d){if(c.ok){S.money+=c.pay;S.mo.rev+=c.pay;rows.push(['Container paid in '+c.to,'₦'+fmt(c.pay),'#b9ffcf']);}else{s.stock+=c.back;toast('🚢 The '+c.to+' container came back: the label did not match. Goods are back in the store.',5);}c.done=true;}
  s.cont=s.cont.filter(c=>!c.done);
  const D=s.day,lab={raw:'Raw materials',power:'Power (grid, gas, diesel)',run:'Delivery, upkeep, admin',hold:'Store holding cost',lab:'Outside lab test',fine:'Waste fine'};
  for(const k in lab)if(D[k])rows.push([lab[k],'-₦'+fmt(D[k]),'#ffb3a3']);
  if(D.litres)rows.push(['Diesel burned',Math.round(D.litres)+' L','#ffd98a']);
  s.day={};return rows;}
function facMonth(M){if(!isFac())return{rows:[],cost:0,or:0};const s=facState(),rows=[];
  if(M.short>0){s.slow=S.day+1;rows.push(['Payroll short: output -30% tomorrow','','#ffb3a3']);}
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};if(r)s.hist.push(Math.round((cost+M.wages)/r*100));if(s.hist.length>24)s.hist.shift();
  return{rows,cost,or:s.hist[s.hist.length-1]||0};}
function facCrew(){if(!isFac()||!S.fac)return[];const s=S.fac,r=[];if(s.lab)r.push({name:'Lab technicians',n:s.lab,each:FACR.pass.lab});if(s.fitter)r.push({name:'Maintenance fitters',n:s.fitter,each:FACR.pass.fitter});return r;}

/* ----- stage gates (research licences) ----- */
function facGate(st){const s=facState();
  if(st.base==='venue'&&st.n===1&&(!s.tests||s.qs<60))return'🔒 The tiled room needs a passed lab test and Quality Score 60+ (now '+s.qs+').';
  if(st.base==='line'&&st.arg>0&&!s.reg[st.arg])return'🔒 Register this product first (HQ, ₦300,000 and an inspection).';
  if(st.base==='venue'&&st.n===2&&s.q75<30)return'🔒 Bottling needs Quality Score 75+ for 30 days ('+s.q75+' so far).';
  if(st.base==='line'&&st.arg===1&&s.q75<30)return'🔒 Bottled water needs Quality Score 75+ for 30 days ('+s.q75+' so far).';
  if(st.base==='line'&&st.arg===2&&s.mancap<S.day)return'🔒 Fruit drink needs a standards certificate (HQ).';
  if(st.base==='venue'&&st.n===3&&!s.env)return'🔒 The industrial park needs an environment permit (HQ).';
  if(st.base==='line'&&st.arg===4&&(s.nepc<S.day||s.qs<85))return'🔒 Soap for export needs an exporter certificate and Quality Score 85+.';
  if(st.base==='venue'&&st.n===4&&s.qs<90)return'🔒 Buyer audits need Quality Score 90+ (now '+s.qs+').';
  return null;}

/* ----- HQ ----- */
const facNM=()=>B.lines.map(l=>l.short);
function facHtml(){const s=facState(),off=fOff(),dl=FACR.tank[stage()],gauge=Math.round(Math.min(1,s.litres/dl)*100);
  let h='<h2>Quality and registration</h2><div class="stats"><div class="stat">Quality Score<b>'+s.qs+' / 100</b></div><div class="stat">Price<b>'+(s.qs>=90?'+10% premium':'normal')+'</b></div><div class="stat">Lab tests<b>'+s.tests+'</b></div><div class="stat">Filters changed<b>'+(S.day-s.filt)+' days ago</b></div></div>';
  if(s.sealed)h+='<p class="note">⚠️ Inspector Bisi sealed the lines: Quality Score under 60. Do lab tests, change filters, then book a re-inspection.</p>';
  h+='<div class="acts"><button class="ghost" data-fx="lab" type="button">🥼 Hire lab technician · ₦180k a month</button><button class="ghost'+(s.outLab?' on':'')+'" data-fx="out" type="button">🧪 Outside lab test daily · ₦10k</button><button class="ghost" data-fx="filt" type="button">💧 Change filters · ₦60k</button>';
  if(s.sealed)h+='<button class="ghost" data-fx="reinsp" type="button">📋 Book re-inspection · ₦150k</button>';
  h+='</div><table><tr><td><b>Product</b></td><td><b>Registration</b></td></tr>';
  for(let i=0;i<5;i++)h+='<tr><td>'+B.lines[i].n+'</td><td>'+(s.reg[i]?'✅ Registered':'<button class="ghost" data-fx="reg'+i+'" type="button">Register · ₦300k</button>')+'</td></tr>';
  h+='<tr><td>Standards certificate</td><td>'+(s.mancap>=S.day?'✅ to day '+s.mancap:s.mancapAt?'⏳ decision day '+s.mancapAt:'<button class="ghost" data-fx="mancap" type="button">Apply · ₦1m, 60 days</button>')+'</td></tr>';
  h+='<tr><td>Environment permit</td><td>'+(s.env?'✅':'<button class="ghost" data-fx="env" type="button">Apply · ₦2m</button>')+'</td></tr></table>';
  h+='<p class="note">+2 a day with a lab test, -5 without. -10 when filters pass 30 days, -15 for a failed batch. Under 60 the lines are sealed; 90+ earns 10% more per carton.</p>';
  h+='<h2>Power switchboard</h2><div class="stats"><div class="stat">Grid tomorrow<b>'+(s.gH>=7?'🟢':s.gH>=4?'🟡':'🔴')+' '+s.gH+' of 10 hours</b></div><div class="stat">Diesel tank<b>'+Math.round(s.litres)+' L ('+gauge+'%)</b></div><div class="stat">Diesel this week<b>₦'+fmt(s.diesel)+'/L</b></div><div class="stat">Gas line<b>'+(s.gas?'On':'None')+'</b></div></div>';
  const fill=Math.max(0,dl-s.litres);
  h+='<div class="acts"><button class="ghost" data-fx="diesel" type="button">⛽ Fill tank · ₦'+short(fill*s.diesel)+'</button><button class="ghost" data-fx="emerg" type="button">🚨 Emergency 25% (+20%) · ₦'+short(dl*.25*s.diesel*1.2)+'</button>';
  if(!s.gas&&lvl('line2'))h+='<button class="ghost" data-fx="gas" type="button">🔥 Pipe in gas · ₦80m</button>';
  h+='</div><p class="note">Grid costs ₦210 a kWh, gas ₦350, diesel about ₦900. No fuel and no grid means the lines stop'+(off?' (now losing '+Math.round(off*100)+'% of the day)':'')+'.</p>';
  h+='<h2>Line health board</h2><table><tr><td><b>Line</b></td><td><b>OEE</b></td><td><b>Service</b></td></tr>';
  for(let i=0;i<5;i++)if(i===0||lvl('line'+i))h+='<tr><td>'+facNM()[i]+(s.down[i]?' · ⚠️ down '+s.down[i]+'h':'')+'</td><td>'+Math.round(fOEE(i)*100)+'% <small>(A'+Math.round(fA(i)*100)+' P'+Math.round(fP()*100)+' Q'+s.qs+')</small></td><td>'+(S.day-s.svc[i])+' days <button class="ghost" data-fx="svc'+i+'" type="button">Service · ₦50k</button></td></tr>';
  h+='</table><div class="acts"><button class="ghost" data-fx="fitter" type="button">🔧 Hire fitter · ₦150k a month ('+s.fitter+')</button></div><p class="note">Breakdown chance: 2% a day plus 1% for each week since service (max 20%). A fitter fixes it in 4 hours, otherwise 8.</p>';
  const days=s.use?Math.round(s.stock/s.use):0,top=Math.max(0,fCap()-s.stock);
  h+='<h2>Raw material store</h2><div class="stats"><div class="stat">Price index this week<b>'+s.idx.toFixed(2)+'</b></div><div class="stat">Stock<b>'+days+' of 30 days</b></div><div class="stat">Supplier terms<b>'+(s.q80>=30?'14 days':'cash ('+s.q80+'/30 days at QS 80+)')+'</b></div></div>';
  h+='<div class="acts"><button class="ghost" data-fx="fill" type="button">🚛 Fill store · ₦'+short(fBuyCost(top))+'</button><button class="ghost" data-fx="wk" type="button">📦 Buy 7 days · ₦'+short(fBuyCost(s.use*7))+'</button><button class="ghost'+(s.auto?' on':'')+'" data-fx="auto" type="button">Auto-reorder when empty</button></div>';
  h+='<p class="note">Nylon, flour and palm oil prices move each week. Buy on a cheap week. Holding stock costs 1% of its value a week.</p>';
  const R=fRecv(),mo=Math.max(1,S.mo.rev);
  h+='<h2>Distributor ledger</h2><div class="seg" id="fterm">'+[0,7,14,30].map(t=>'<button class="ghost'+(s.terms===t?' on':'')+'" data-t="'+t+'" type="button">'+(t?t+' days':'Cash only')+'</button>').join('')+'</div>';
  h+='<table><tr><td><b>Distributor</b></td><td><b>Trust</b></td><td><b>Owed / limit</b></td></tr>';
  for(let k=0;k<3;k++)h+='<tr><td>'+FDIST[k]+'</td><td>'+'★'.repeat(Math.round(s.trust[k]/20))+'☆'.repeat(5-Math.round(s.trust[k]/20))+(s.trust[k]<40?' frozen':'')+'</td><td>₦'+short(fOwed(k))+' / ₦'+short(fLimit(k))+'</td></tr>';
  h+='</table><p class="note">Credit buyers pay 5% more later. On time: trust +3. Late: trust -15. Under 40 their credit is frozen. Owed to you: ₦'+fmt(R)+(R>.4*mo?' · ⚠️ over 40% of this month\'s sales: collect before you borrow':'')+'.</p>';
  h+='<h2>Waste bin</h2><p class="note">'+Math.round(s.waste)+' of 500 kg. Over 500 kg: ₦250,000 fine and Quality Score -10.</p><div class="acts"><button class="ghost" data-fx="recy" type="button">♻️ Sell to licensed recycler · ₦'+fmt(Math.round(s.waste*FACR.recycle))+'</button>';
  if(stage()>=3)h+='<button class="ghost" data-fx="regrind" type="button">♻️ Regrind into non-food sacks · ₦'+fmt(Math.round(s.waste*FACR.recycle*2))+' saved</button>'; // regrind saves 50% of film: valued at 2x recycler price, estimate
  h+='</div>';
  if(stage()>=3||lvl('line4')){const exp=s.nepc>=S.day,val=Math.round(FACR.container*B.lines[4].price);
    h+='<h2>Export desk</h2><p class="note">Exporter certificate: '+(exp?'valid to day '+s.nepc:'none')+'. Each container: bank export form and label check (Quality Score 85+, label set for the destination). Pass: twice the gate price less 25% freight, paid after '+FACR.sail+' days. Fail: back in 14 days.</p>';
    h+='<div class="seg" id="flab">'+['Ghana','Kenya','Europe'].map(t=>'<button class="ghost'+(s.label===t?' on':'')+'" data-l="'+t+'" type="button">Label: '+t+'</button>').join('')+'</div><div class="acts">';
    if(!exp)h+='<button class="ghost" data-fx="nepc" type="button">📄 Exporter certificate · ₦20k</button>';
    else for(const t of['Ghana','Kenya','Europe'])h+='<button class="ghost" data-fx="ship'+t+'" type="button">🚢 1,000 cartons of soap to '+t+' · ₦'+short(val*.55)+'</button>';
    h+='</div>'+(s.cont.length?'<p class="note">At sea: '+s.cont.map(c=>c.to+' (day '+c.due+')').join(', ')+'</p>':'');}
  return h;}
function facBind(){if(!isFac())return;const s=S.fac,re=()=>{save();hqRender();},buy=(n,f,k)=>{n=Math.round(n);if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}fcost(n,k||'run');f();fanfare(false);re();};
  document.querySelectorAll('#fterm [data-t]').forEach(b=>b.onclick=()=>{s.terms=+b.dataset.t;re();});
  document.querySelectorAll('#flab [data-l]').forEach(b=>b.onclick=()=>{s.label=b.dataset.l;re();});
  document.querySelectorAll('#hqin [data-fx]').forEach(b=>b.onclick=()=>{const k=b.dataset.fx,dl=FACR.tank[stage()];
    if(k==='lab'){s.lab++;re();}if(k==='fitter'){s.fitter++;re();}if(k==='out'){s.outLab=!s.outLab;re();}if(k==='auto'){s.auto=!s.auto;re();}
    if(k==='filt')buy(FACR.filters,()=>{s.filt=S.day;s.filtHit=0;});
    if(k==='reinsp'&&!s.reinsp)buy(FACR.reinsp,()=>{s.reinsp=true;toast('📋 Inspector Bisi comes tomorrow.',3);});
    if(k.startsWith('reg'))buy(FACR.reg,()=>{s.reg[+k.slice(3)]=true;});
    if(k==='mancap')buy(FACR.mancap,()=>{s.mancapAt=S.day+60;});if(k==='env')buy(FACR.envPermit,()=>{s.env=true;});
    if(k==='diesel')buy(Math.max(0,dl-s.litres)*s.diesel,()=>{s.litres=dl;},'power');
    if(k==='emerg')buy(dl*.25*s.diesel*1.2,()=>{s.litres=Math.min(dl,s.litres+dl*.25);},'power');
    if(k==='gas')buy(FACR.gas,()=>{s.gas=true;});
    if(k.startsWith('svc'))buy(FACR.service,()=>{s.svc[+k.slice(3)]=S.day;s.down[+k.slice(3)]=0;});
    if(k==='fill'||k==='wk'){const v=k==='fill'?Math.max(0,fCap()-s.stock):s.use*7;if(S.money<fBuyCost(v)&&s.q80<30){toast('You need ₦'+short(fBuyCost(v)-S.money)+' more.',2);return;}fBuy(v);re();}
    if(k==='recy'||k==='regrind'){const n=Math.round(s.waste*FACR.recycle*(k==='regrind'?2:1));S.money+=n;s.waste=0;re();}
    if(k==='nepc')buy(FACR.nepc,()=>{s.nepc=S.day+720;});
    if(k.startsWith('ship')){const to=k.slice(4),val=FACR.container*B.lines[4].price,ok=s.qs>=85&&s.label===to;
      buy(val*.55,()=>{s.cont.push({to,due:S.day+(ok?FACR.sail:14),ok,pay:Math.round(val*2*.75),back:Math.round(val*FACR.raw)});toast('🚢 Container to '+to+' has left the Lagos port.',3);});}
  });}

/* ----- drawings: nylon reel, drum, sachet bag, preform; sealer, filler, mixer, soap kettle ----- */
XITEM.reel=(g,a,b)=>{R(g,-13,-20,26,18,4,a);E(g,-13,-11,4,9,b);E(g,13,-11,4,9,'#ddd');E(g,13,-11,1.5,3,'#555');};
XITEM.drum=(g,a,b)=>{R(g,-10,-24,20,24,3,a);g.fillStyle=b;g.fillRect(-10,-17,20,3);g.fillRect(-10,-8,20,3);E(g,0,-24,10,3,b);};
XITEM.sachet=(g,a,b)=>{R(g,-13,-20,26,20,6,a);for(let k=0;k<3;k++)R(g,-10+k*7,-16,6,10,2,b);};
XITEM.preform=(g,a,b)=>{for(let k=0;k<3;k++){R(g,-11+k*8,-22,6,20,3,a);R(g,-12+k*8,-24,8,3,1,b);}};
XSTATION.sealer=(col)=>{rr(-38,-30,76,50,6,'#b8c2cc');rr(-30,-44,60,16,4,col);rr(-8,-20,16,24,3,'#5b636b');ell(24,-6,6,6,'#2fbf5a');rr(-46,14,92,10,3,'#6b737b');};
XSTATION.filler=(col)=>{rr(-42,-10,84,30,6,'#c8d0d8');rr(-36,-44,24,36,4,'#9fb3c4');rr(-4,-40,10,32,3,col);ell(30,-26,10,10,'#e9eef3');for(let k=0;k<5;k++)rr(-34+k*15,-6,8,14,3,'#7ad1ff');};
XSTATION.mixer=(col)=>{rr(-34,-40,40,56,14,'#d0d6dc');rr(-30,-46,32,8,3,col);rr(10,-20,32,36,5,'#e1e6ea');rr(14,-14,24,6,2,'#f2c230');rr(-40,16,86,10,3,'#6b737b');};
XSTATION.kettle=(col)=>{ell(-12,-6,30,24,'#8a8f96');ell(-12,-24,26,8,col);rr(22,-12,24,30,4,'#c99a5b');for(let k=0;k<3;k++)rr(25,-8+k*8,18,5,1,'#f4f1ea');};

/* ----- the map: borehole and tanks, bottling hall, cold store, warehouse, loading docks ----- */
function facStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(20,30,40,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  ctx.fillStyle=li===0?'#8fa36a':'#9ea3a6';ctx.fillRect(x+4,y+4,w-8,h-38);
  if(li===0){rr(x+20,y+30,40,14,3,'#5b636b');rr(x+34,y+10,12,24,2,'#3f454b');for(let k=0;k<2;k++){rr(x+w-90+k*40,y+40,34,70,8,'#2a62c9');ell(x+w-73+k*40,y+40,17,5,'#4f86e0');}
    ctx.strokeStyle='#3f454b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+46,y+38);ctx.lineTo(x+w-90,y+50);ctx.stroke();T('BOREHOLE AND TANKS');}
  else if(li===1){rr(x+14,y+12,w-28,110,6,'#e6ecef');ctx.fillStyle='#7ad1ff';for(let k=0;k<4;k++)ctx.fillRect(x+26+k*((w-60)/4),y+24,18,14);rr(x+20,y+70,w-40,14,4,'#6b737b');for(let k=0;k<6;k++)ell(x+30+k*((w-60)/6),y+70,5,5,'#f2c230');T('PRODUCTION HALL');}
  else if(li===2){rr(x+16,y+14,w-32,100,8,'#dfe9f1');rr(x+w/2-20,y+50,40,64,3,'#9fb3c4');ctx.fillStyle='#2a62c9';ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('❄',x+w/2,y+40);T('COLD STORE');}
  else if(li===3){rr(x+12,y+12,w-24,110,4,'#c9b27a');for(let r=0;r<3;r++)for(let k=0;k<4;k++)rr(x+22+k*((w-50)/4),y+24+r*30,(w-50)/4-6,24,2,['#c98a3a','#b5772c','#d49a4a'][(r+k)%3]);T('WAREHOUSE');}
  else{ctx.fillStyle='#5b5f66';ctx.fillRect(x+4,y+4,w-8,h-38);ctx.strokeStyle='#f2c230';ctx.lineWidth=3;for(let k=1;k<3;k++){ctx.beginPath();ctx.moveTo(x+k*w/3,y+10);ctx.lineTo(x+k*w/3,y+h-50);ctx.stroke();}
    rr(x+16,y+20,w/3-28,60,4,'#e9e2d2');rr(x+16,y+80,w/3-28,14,3,'#2a2a2a');rr(x+w/3+12,y+30,w/3-24,50,4,'#c62828');T('LOADING DOCKS');}}

BIZ.factory={name:'Omi-Ola Industries',tag:'Sachet water to soap',tone:'#2a7fc0',field:'factory',isNew:true,qf:300,
  owner:{cloth:'#7ec8ee',trim:'#f4f1ea',hat:'hard'},
  hand:'Store keeper',cook:'machine operator',seller:'packer',
  outfit:{hand:{cloth:'#8a6a4a',trim:'#f4f1ea',hat:'none'},cook:{cloth:'#2a62c9',trim:'#f4f1ea',hat:'none'},server:{cloth:'#f2c230',trim:'#f4f1ea',hat:'none',gender:'f'},
    cashier:{cloth:'#f4f1ea',trim:'#1b2a4a',hat:'none',gender:'f'},porter:{cloth:'#f26a1a',trim:'#2b2b2b',hat:'cap'}},
  venue:['Backyard shed, Agege','Tiled production room','Bottling plant and truck','Industrial park, Ogun','Five plants, two continents'],
  // Research stage costs: tiled room N6m, bottling plant N45m, industrial park N900m, export group N6bn (venues);
  // fruit drink N120m, Kano noodle plant N1.5bn, soap for export N3bn (lines). Bottled water line: engine priced.
  costs:{venue:[6000000,45000000,900000000,6000000000],line:[null,120000000,1500000000,3000000000]},
  lines:[
   Object.assign(L('Sachet Water (bag of 20)','Sachet','#2fa8e0',400,'bag of 20 sachets','field',['reel','#e9f4fb','#2fa8e0'],['sachet','#cfeaf8','#2fa8e0'],'sealer'),{w:10,qx:3}),
   Object.assign(L('Bottled Water (pack of 12)','Bottled','#2a62c9',1600,'pack of 12','field',['preform','#9fd4f5','#2a62c9'],['pack','#7ad1ff','#2a62c9'],'filler'),{w:5,qx:3}),
   Object.assign(L('Fruit Drink (carton of 24)','Fruit drink','#f29a1a',7000,'carton of 24','field',['drum','#f29a1a','#8a4a10'],['carton','#f2c230','#f29a1a'],'mixer'),{w:2.5,qx:2}),
   Object.assign(L('Noodles (carton of 40)','Noodles','#e0b400',12000,'carton of 40','field',['sack','#f4f1ea','#c98a3a'],['carton','#e0b400','#c62828'],'fryer'),{w:1.5,qx:2}),
   Object.assign(L('Bar Soap (carton of 48)','Soap','#1f8a4c',16000,'carton of 48','field',['drum','#c9a15a','#6b4423'],['carton','#d9f2e1','#1f8a4c'],'kettle'),{w:1,qx:1})]};
BIZX.factory={demand:facDemand,lineW:facLineW,sale:facSale,gate:facGate,html:facHtml,bind:facBind,night:facNight,month:facMonth,crew:facCrew,
  strip:facStrip,base:'#8a9196',floor:['#b9b3a6','#d6dde2','#cfd6db','#c4ccd2','#dfe5ea'],locked(){return null;}};
