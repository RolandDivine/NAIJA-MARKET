/* ===== Oke-Ile Homes & Towers: research rules from plan3/estate.json on top of the shop engine =====
   Letting earns a fair 5% of a year's rent; caution money sits in a locked box. Blocks follow the weekly cement price.
   Bungalows and towers rise in 4 stages (foundation 15%, walls 30%, roof 25%, finish 30%); buyers pay 20% down and
   20% after each stage passes inspection. Only titled, permitted land is built on or sold. Finished unsold units can be
   sold or let (rent 1 year ahead, never more). Construction loans run at 2.3% a month. */
const ESTR={sqm:120,perSqm:210000,share:[.15,.30,.25,.30],stN:['Foundation','Walls','Roof','Finish'],
  cement0:13000,steel0:1000000,deposit:.2,loanRate:.023,loanMax:.5,yieldHome:.05,yieldShop:.08,upkeep:.05,agent:.05,caution:.1,
  rent:2000000,                   // mini flat rent behind the ₦100,000 letting fee (plan2)
  titlePct:.10,titleDays:2,permitPct:.05,flatBuild:.58,  // title 10% of land; approvals 5% and construction 58% of price (cost structure)
  bungLand:3000000,               // estimate: outskirts plot for a bungalow
  estLand:6000000,                // estimate: raw land per estate plot (the layout itself is paid in the venue stage)
  bagsPerBlock:1/35,sandLabour:250, // 35 blocks a bag (plan2); sand and labour per block is an estimate
  storeCap:600,                   // estimate: 4 weeks of cement for the yard
  days:{b:6,t:15},                // estimate: build days per stage for a bungalow / a tower
  flats:60,                       // estimate: 15 floors x 4 flats
  shops:40,shopVal:25000000,      // 40 lock-up shops (plan2); shop value is an estimate
  qStd:85,qEng:10,qPass:70,qSwing:[-20,8], // pass mark and mixes from research; the pour-to-pour swing is an estimate
  pay:{agent:150000,operator:120000,brick:200000,driver:130000,eng:350000,title:400000,sales:250000}};
const isEstate=()=>SAVE.cur==='estate'&&B&&B.isNew;
const estFlatV=()=>B.lines[4].price*5,estBungV=()=>B.lines[2].price*5;
function estState(){const s=S.est=S.est||{};const d={trust:50,wk:-1,cement:ESTR.cement0,steel:ESTR.steel0,bags:0,bagP:0,eng:false,prem:0,
    placed:0,tenants:0,caution:0,refunds:0,blockDays:0,plots:[],sites:[],units:[],ep:{total:0,titled:0,ready:0,sold:0},loan:0,interest:0,
    done:{b:0,t:0},cancel:0,fails:0,plaza:false,nid:1,mo:{rev:0,cost:0},day:{},hist:[],log:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  const wk=Math.floor(S.day/7);if(wk!==s.wk){s.wk=wk; // prices move week to week
    s.cement=Math.round(Math.max(11000,Math.min(16000,ESTR.cement0*(1+rnd(-.08,.12)))));s.steel=Math.round(ESTR.steel0*(1+rnd(-.1,.1)));}
  if(lvl('line2')&&!s.plots.length&&!s.sites.some(x=>x.k==='b')&&!s.done.b)s.plots.push({ready:0}); // the one titled plot of First Bungalow
  if(stage()>=2&&!s.ep.total)s.ep.total=20;
  if(lvl('line3')&&s.ep.titled<s.ep.total){s.ep.titled=s.ep.total;s.ep.ready=0;} // line 3 opens only with all 20 titled
  if(lvl('line4')&&!s.sites.some(x=>x.k==='t'))newSite('t',0);
  if(stage()>=3&&!s.plaza){s.plaza=true;for(let i=0;i<ESTR.shops;i++)s.units.push({id:s.nid++,k:'s',v:ESTR.shopVal,mode:'let',next:S.day+1+(i%30)});}
  return s;}
const mIdx=()=>{const s=S.est,c=s.bags>0?s.bagP:s.cement;return .6+.25*c/ESTR.cement0+.15*s.steel/ESTR.steel0;};
const buildCost=k=>k==='b'?ESTR.perSqm*ESTR.sqm*mIdx()*(lvl('line1')?.95:1):ESTR.flatBuild*estFlatV()*ESTR.flats*mIdx(); // own blocks save 5% (estimate)
const stageCost=x=>Math.round(buildCost(x.k)*ESTR.share[x.st]);
const unitV=k=>k==='b'?estBungV():k==='t'?estFlatV():ESTR.shopVal;
const estCost=(n,why)=>{const s=S.est;S.money-=n;s.mo.cost+=n;s.day[why]=(s.day[why]||0)+n;};
const estIn=(n,why)=>{const s=S.est;let r=Math.min(s.loan,n);s.loan-=r;n-=r;S.money+=n;s.mo.rev+=n+r;S.mo.rev+=n+r;s.day[why]=(s.day[why]||0)+n+r;if(r)s.day.repaid=(s.day.repaid||0)+r;};
function newSite(k,sold){const s=S.est,n=k==='b'?1:ESTR.flats,dur=ESTR.days[k];s.sites.push({id:s.nid++,k,n,sold,st:0,ph:'fund',t:0,gap:0,start:S.day,due:S.day+4*(dur+1)+14});}
const paceF=()=>{const s=S.est;return Math.max(0,s.trust/100*(1-2*s.prem/100));};
const loanCap=()=>Math.round(S.est.sites.filter(x=>x.ph!=='done').reduce((a,x)=>a+buildCost(x.k)*ESTR.loanMax,0));
const readyPlots=()=>S.est.plots.filter(p=>p.ready<=S.day).length;

/* ----- customers ----- */
function estDemand(){const s=estState();return .6+.8*s.trust/100;}
function estLineW(i){const s=estState();
  if(i===2)return(readyPlots()>0||s.sites.some(x=>x.k==='b'&&x.sold<x.n&&x.ph!=='done'))?paceF():0;
  if(i===3)return s.ep.titled-s.ep.sold>0?paceF()*(.08+.04)/.08:0; // title shown +0.02, roads built +0.02 on the 8% base
  if(i===4)return s.sites.some(x=>x.k==='t'&&x.sold<x.n&&x.ph!=='done')?paceF():0;
  return 1;}
function estSale(i,c,q,amt){const s=estState(),P=1+s.prem/100;
  if(i===0){s.placed+=q;s.tenants+=q;s.caution+=q*ESTR.rent*ESTR.caution;s.mo.rev+=amt;return amt;}
  if(i===1){let bags=q*ESTR.bagsPerBlock,from=Math.min(bags,s.bags),cost=from*s.bagP+(bags-from)*s.cement+q*ESTR.sandLabour;s.bags-=from;
    cost=Math.round(cost);s.mo.cost+=cost;s.day.blocks=(s.day.blocks||0)+cost;s.mo.rev+=amt;return amt-cost;}
  if(i===2||i===4){const k=i===2?'b':'t';let got=0;
    for(let n=0;n<q;n++){let x=s.sites.find(x=>x.k===k&&x.sold<x.n&&x.ph!=='done');
      if(!x&&k==='b'&&readyPlots()>0){s.plots.splice(s.plots.findIndex(p=>p.ready<=S.day),1);newSite('b',0);x=s.sites[s.sites.length-1];}
      if(!x)break;x.sold++;got+=Math.round(unitV(k)*P*ESTR.deposit*(1+x.st));} // a late joiner pays deposit plus each passed stage
    s.mo.rev+=got;return got;}
  if(i===3){const n=Math.min(q,s.ep.titled-s.ep.sold);s.ep.sold+=n;const got=Math.round(B.lines[3].price*P*n);s.mo.rev+=got;return got;}
  return amt;}

/* ----- nights ----- */
function estNight(){if(!isEstate())return[];const s=estState(),rows=[];s.day={};
  if(lvl('line1'))s.blockDays=(ESTR.qStd+(s.eng?ESTR.qEng:0))>=80?s.blockDays+1:0;
  // tenants move out: caution comes back in full, trust +5 (about 1 tenant in 365 a day: estimate)
  let out=0;for(let k=0;k<s.tenants;k++)if(Math.random()<1/365)out++;out=Math.min(out,s.tenants);
  if(out){s.tenants-=out;const back=out*ESTR.rent*ESTR.caution;s.caution=Math.max(0,s.caution-back);s.refunds+=out;s.trust=Math.min(100,s.trust+5*out);rows.push(['Caution money returned ('+out+')','₦'+fmt(back)+' from the box','#cfe8ff']);}
  for(const x of s.sites){if(x.ph==='done')continue;
    if(x.ph==='fund'){const c=stageCost(x);if(S.money>=c){estCost(c,'build');x.ph='build';x.t=ESTR.days[x.k];x.gap=0;}
      else{x.gap++;if(x.gap===1)toast('🏗️ '+(x.k==='b'?'Bungalow':'Tower')+' '+ESTR.stN[x.st].toLowerCase()+' needs ₦'+short(c)+'. Sell or let stock, or take a construction loan (HQ).',5);
        if(x.gap>14)s.trust=Math.max(0,s.trust-1);}}
    else if(x.ph==='build'||x.ph==='stop'){if(--x.t<=0)x.ph='insp';}
    else if(x.ph==='insp'){const q=ESTR.qStd+(s.eng?ESTR.qEng:0)+rnd(ESTR.qSwing[0],ESTR.qSwing[1]);
      if(q>=ESTR.qPass){const pay=Math.round(x.sold*unitV(x.k)*(1+s.prem/100)*ESTR.deposit);if(pay)estIn(pay,'stage');
        x.st++;if(x.st>=4){x.ph='done';s.done[x.k]+=x.sold;if(x.k==='t')s.towers=(s.towers||0)+1;for(let k=x.sold;k<x.n;k++)s.units.push({id:s.nid++,k:x.k,v:unitV(x.k),mode:'sell',next:0});
          banner(x.k==='b'?'KEYS HANDED OVER':'TOWER COMPLETE',x.sold?x.sold+' buyer'+(x.sold>1?'s':'')+' got their keys with clean papers.':'Units ready to sell or let.');fanfare(true);}
        else x.ph='fund';}
      else{s.fails++;x.ph='stop';x.t=3;estCost(Math.round(stageCost(x)*.5),'redo');s.trust=Math.max(0,s.trust-10);
        toast('🧪 '+ESTR.stN[x.st]+' failed inspection (score '+Math.round(q)+'). Site stopped 3 days, 50% redo, trust -10. A site engineer adds +10.',5);}}}
  s.sites=s.sites.filter(x=>!(x.ph==='done'&&x.k==='b'));
  // rent day for let units: one year ahead, never more; 10% chance of 2 empty months each lease year
  for(const u of s.units){if(u.mode!=='let'||u.next>S.day)continue;
    if(Math.random()<.1){u.next=S.day+2*MONTH;s.day.empty=(s.day.empty||0)+1;continue;}
    const rent=Math.round(u.v*(u.k==='s'?ESTR.yieldShop:ESTR.yieldHome));estIn(Math.round(rent*(1+ESTR.agent)),'rent');estCost(Math.round(rent*ESTR.upkeep),'upkeep');u.next=S.day+12*MONTH;}
  const D=s.day,R=(k,t,neg)=>{if(D[k])rows.push([t,(neg?'-₦':'₦')+fmt(D[k]),neg?'#ffb3a3':'#b9ffcf']);};
  R('build','Build stages funded',1);R('redo','Inspection redo',1);R('blocks','Cement, sand and labour for blocks',1);R('stage','Buyer stage payments');R('rent','Rent a year ahead (+5% letting fee)');R('upkeep','Upkeep (5% of rent)',1);
  if(D.repaid)rows.push(['Loan repaid from sales first','₦'+fmt(D.repaid),'#cfe8ff']);if(D.empty)rows.push(['Units empty for 2 months',''+D.empty,'#ffd27a']);
  return rows;}

/* ----- payday ----- */
function estMonth(M){if(!isEstate())return{rows:[],cost:0,or:0};const s=estState(),rows=[];
  if(s.loan){const i=Math.round(s.loan*ESTR.loanRate);estCost(i,'int');s.interest+=i;rows.push(['Construction loan interest (2.3%)','-₦'+fmt(i),'#ffb3a3']);}
  // units for sale: 8% a month base, +2% title shown, +2% roads, times trust and price gap
  let sold=0;for(const u of s.units.slice()){if(u.mode!=='sell')continue;if(Math.random()<.12*paceF()){const v=Math.round(u.v*(1+s.prem/100));estIn(v,'unit');s.units.splice(s.units.indexOf(u),1);sold+=v;}}
  if(sold)rows.push(['Finished units sold','₦'+fmt(sold),'#b9ffcf']);
  // off-plan buyers cancel when a site is 90+ days late: 18% of them, refunded in full
  for(const x of s.sites){if(x.ph==='done'||S.day<x.due+90||!x.sold)continue;const n=Math.round(x.sold*.18)||(Math.random()<.18?1:0);if(!n)continue;
    const back=Math.round(n*unitV(x.k)*ESTR.deposit*(1+x.st));estCost(back,'refund');x.sold-=n;s.cancel+=n;rows.push(['Late site: '+n+' buyer(s) refunded','-₦'+fmt(back),'#ff8a7a']);}
  if(M.short>0)s.trust=Math.max(0,s.trust-3);
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};const or=r?Math.round((cost+M.wages)/r*100):0;if(r){s.hist.push(or);if(s.hist.length>24)s.hist.shift();}
  return{rows,cost,or};}
function estCrew(){if(!isEstate()||!S.est)return[];const s=S.est,P=ESTR.pay,r=[];
  r.push({name:'Letting agents',n:1+stage(),each:P.agent});if(lvl('line1'))r.push({name:'Block machine operators',n:2,each:P.operator});
  if(stage()>=1)r.push({name:'Tipper driver',n:1,each:P.driver});
  const act=s.sites.filter(x=>x.ph!=='done');const br=act.reduce((a,x)=>a+(x.k==='b'?4:20),0); // crew size per site: estimate
  if(br)r.push({name:'Bricklayers',n:br,each:P.brick});if(s.eng)r.push({name:'Site engineer',n:1,each:P.eng});
  if(lvl('line2'))r.push({name:'Title officer',n:1,each:P.title});if(lvl('line3'))r.push({name:'Sales executives',n:1+(lvl('line4')?2:0),each:P.sales});return r;}

/* ----- gates ----- */
function estGate(st){const s=estState();
  if(st.base==='line'&&st.arg===1&&s.placed<10)return'🔒 The landlord said: bring ten good tenants first ('+s.placed+' placed).';
  if(st.base==='venue'&&st.n===1&&s.blockDays<30)return'🔒 Tipper on credit: keep block quality 80+ for 30 days ('+s.blockDays+' so far).';
  if(st.base==='venue'&&st.n===2&&!s.done.b)return'🔒 Developer licence: hand over your first bungalow with clean papers first.';
  if(st.base==='line'&&st.arg===3){if(stage()<2)return'🔒 Estate plots need the walled estate layout first.';if(s.ep.ready>S.day||s.ep.titled<s.ep.total)return'🔒 Title all 20 plots first (HQ title desk): '+s.ep.titled+' of '+s.ep.total+'.';}
  if(st.base==='line'&&st.arg===4&&!s.eng)return'🔒 High-rise permit: hire a site engineer first (HQ). Every pour gets tested.';
  if(st.base==='venue'&&st.n===4&&(s.towers||0)<3)return'🔒 Skyline: finish 3 towers first ('+(s.towers||0)+' done).';
  return null;}

/* ----- HQ ----- */
function estHtml(){const s=estState(),mi=mIdx();
  let h='<h2>Site and title desk</h2><div class="stats"><div class="stat">Trust<b>'+s.trust+' / 100</b></div><div class="stat">Cement this week<b>₦'+fmt(s.cement)+' a bag</b></div><div class="stat">Steel<b>₦'+short(s.steel)+' a tonne</b></div><div class="stat">Material index<b>'+mi.toFixed(2)+'</b></div><div class="stat">Construction loan<b>₦'+short(s.loan)+'</b></div><div class="stat">Caution box (not yours)<b>₦'+short(s.caution)+'</b></div></div>';
  h+='<p class="note">Letting fee is 5% of a year\'s rent and fees stay within 10%. '+s.tenants+' tenants housed, '+s.refunds+' caution deposits returned in full (+5 trust each).</p>';
  if(lvl('line1')){h+='<h2>Cement store</h2><p class="note">'+Math.round(s.bags)+' of '+ESTR.storeCap+' bags'+(s.bags>0?' at ₦'+fmt(Math.round(s.bagP)):'')+'. Blocks and builds use stored cement first. Prices change each week. Block quality '+(ESTR.qStd+(s.eng?ESTR.qEng:0))+' ('+s.blockDays+' days at 80+).</p>';
    h+='<div class="acts"><button class="ghost" data-es="fill" type="button">🧱 Fill store at ₦'+fmt(s.cement)+' · ₦'+short(Math.max(0,ESTR.storeCap-s.bags)*s.cement)+'</button></div>';}
  h+='<h2>Site engineer</h2><p class="note">'+(s.eng?'On site: every pour tested, +10 quality.':'Standard mix scores 85; some pours still fall under 70. An engineer adds +10 (₦350,000 a month).')+' Failed inspections: '+s.fails+'.</p>';
  if(!s.eng)h+='<div class="acts"><button class="ghost" data-es="eng" type="button">👷🏾‍♀️ Hire site engineer</button></div>';
  if(lvl('line2')){const land=ESTR.bungLand,pack=Math.round(land*(1+ESTR.titlePct)+estBungV()*ESTR.permitPct);
    h+='<h2>Plots and title</h2><p class="note">Only titled land is built on or sold. Survey and consent cost 10% of the land price and take 2 days; the building permit adds 5% of the home price. Ready plots: '+readyPlots()+' of '+s.plots.length+'.</p>';
    h+='<div class="acts"><button class="ghost" data-es="plot" type="button">📜 Buy and title a plot · ₦'+short(pack)+'</button>'+(readyPlots()?'<button class="ghost" data-es="spec" type="button">🏠 Start a bungalow to keep</button>':'')+'</div>';}
  if(stage()>=2&&s.ep.titled<s.ep.total)h+='<div class="acts"><button class="ghost" data-es="ep" type="button">📜 Title all '+s.ep.total+' estate plots · ₦'+short((s.ep.total-s.ep.titled)*ESTR.estLand*ESTR.titlePct)+'</button></div>';
  if(s.ep.total)h+='<p class="note">Estate plots: '+s.ep.titled+' titled, '+s.ep.sold+' sold, roads and street lights built.'+(s.ep.ready>S.day?' Title files ready on day '+s.ep.ready+'.':'')+'</p>';
  if(s.sites.length){h+='<h2>Stage and pay ledger</h2><table><tr><td><b>Site</b></td><td><b>Stage</b></td><td><b>Next cost · buyers pay</b></td></tr>';
    for(const x of s.sites){const late=x.ph!=='done'&&S.day>x.due;h+='<tr><td>'+(x.k==='b'?'Bungalow #':'Tower #')+x.id+' · '+x.sold+'/'+x.n+' sold</td><td>'+ESTR.stN.map((n,i)=>i<x.st?'■':'□').join('')+' '+(x.ph==='done'?'done':x.ph==='fund'?'needs cash':x.ph==='insp'?'inspection':x.ph==='stop'?'stopped':ESTR.stN[x.st]+' '+x.t+'d')+(late?' ⚠️ late':'')+'</td><td>'+(x.ph==='done'?'—':'₦'+short(stageCost(x))+' · ₦'+short(x.sold*unitV(x.k)*ESTR.deposit))+'</td></tr>';}
    h+='</table>';}
  if(lvl('line4')&&s.sites.filter(x=>x.k==='t'&&x.ph!=='done').length<3){const v=estFlatV()*ESTR.flats,c=Math.round(v*(.16*(1+ESTR.titlePct)+ESTR.permitPct));h+='<div class="acts"><button class="ghost" data-es="tower" type="button">🏢 Titled land and permit for a new tower · ₦'+short(c)+'</button></div>';}
  const cap=loanCap();h+='<h2>Construction loan</h2><p class="note">Up to 50% of the build cost of your open sites (₦'+short(cap)+') at 2.3% a month, paid on payday. Buyer payments repay the loan first. Interest paid so far: ₦'+short(s.interest)+'.</p><div class="acts">';
  if(cap>s.loan)h+='<button class="ghost" data-es="borrow" type="button">🏦 Borrow ₦'+short(cap-s.loan)+'</button>';if(s.loan)h+='<button class="ghost" data-es="repay" type="button">Repay ₦'+short(Math.min(s.loan,Math.max(0,S.money)))+'</button>';h+='</div>';
  h+='<h2>Price against the market</h2><div class="seg" id="eprem">'+[0,5,10,20].map(p=>'<button class="ghost'+(s.prem===p?' on':'')+'" data-prem="'+p+'" type="button">'+(p?'+'+p+'%':'Market')+'</button>').join('')+'</div><p class="note">Every 1% above market slows sales by 2%. Sales pace now '+Math.round(paceF()*100)+'% of normal.</p>';
  const us=s.units.filter(u=>u.k!=='s');if(us.length||s.plaza){h+='<h2>Sell or let</h2><table><tr><td><b>Unit</b></td><td><b>Value · rent a year</b></td><td></td></tr>';
    for(const u of us.slice(0,8)){const rent=u.v*ESTR.yieldHome;h+='<tr><td>'+(u.k==='b'?'Bungalow':'Tower flat')+' #'+u.id+'</td><td>₦'+short(u.v)+' · ₦'+short(rent)+' ('+Math.round(1/ESTR.yieldHome)+' yrs)</td><td><button class="ghost'+(u.mode==='let'?' on':'')+'" data-unit="'+u.id+'" type="button">'+(u.mode==='let'?'Letting':'For sale')+'</button></td></tr>';}
    if(us.length>8)h+='<tr><td colspan="3">… and '+(us.length-8)+' more</td></tr>';
    if(s.plaza)h+='<tr><td>Plaza shops</td><td>'+ESTR.shops+' × ₦'+short(ESTR.shopVal)+' · ₦'+short(ESTR.shopVal*ESTR.yieldShop)+' each</td><td>Let</td></tr>';
    h+='</table><p class="note">Rent is 5% of value a year (shops 8%), collected one year ahead and never more. Upkeep is 5% of rent. Each lease year has a 1 in 10 chance of two empty months.</p>';}
  return h;}
function estBind(){if(!isEstate())return;const s=S.est,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#eprem [data-prem]').forEach(b=>b.onclick=()=>{s.prem=+b.dataset.prem;re();});
  document.querySelectorAll('#hqin [data-unit]').forEach(b=>b.onclick=()=>{const u=s.units.find(u=>u.id===+b.dataset.unit);if(u){u.mode=u.mode==='let'?'sell':'let';u.next=S.day+1;}re();});
  document.querySelectorAll('#hqin [data-es]').forEach(b=>b.onclick=()=>{const k=b.dataset.es;
    if(k==='fill'){const n=Math.max(0,ESTR.storeCap-s.bags);if(n)buy(Math.round(n*s.cement),()=>{s.bagP=(s.bags*s.bagP+n*s.cement)/(s.bags+n);s.bags+=n;});}
    if(k==='eng'){s.eng=true;re();}
    if(k==='plot')buy(Math.round(ESTR.bungLand*(1+ESTR.titlePct)+estBungV()*ESTR.permitPct),()=>{s.plots.push({ready:S.day+ESTR.titleDays});});
    if(k==='spec'&&readyPlots()){s.plots.splice(s.plots.findIndex(p=>p.ready<=S.day),1);newSite('b',0);re();}
    if(k==='ep')buy((s.ep.total-s.ep.titled)*ESTR.estLand*ESTR.titlePct,()=>{s.ep.titled=s.ep.total;s.ep.ready=S.day+ESTR.titleDays;});
    if(k==='tower'){const v=estFlatV()*ESTR.flats;buy(Math.round(v*(.16*(1+ESTR.titlePct)+ESTR.permitPct)),()=>newSite('t',0));}
    if(k==='borrow'){const n=loanCap()-s.loan;if(n>0){s.loan+=n;S.money+=n;}re();}
    if(k==='repay'){const n=Math.min(s.loan,Math.max(0,S.money));s.loan-=n;S.money-=n;re();}});}

/* ----- drawings ----- */
XITEM.key=(g,a,b)=>{g.strokeStyle=a;g.lineWidth=3;g.beginPath();g.arc(0,-14,8,0,7);g.stroke();R(g,-2,-12,4,12,1,b);R(g,2,-4,5,3,1,b);R(g,2,-9,4,3,1,b);};
XITEM.block=(g,a,b)=>{R(g,-13,-12,26,12,1,a);R(g,-9,-10,7,8,1,b);R(g,2,-10,7,8,1,b);};
XITEM.house=(g,a,b)=>{R(g,-11,-14,22,14,1,a);g.fillStyle=b;g.beginPath();g.moveTo(-14,-13);g.lineTo(0,-25);g.lineTo(14,-13);g.fill();R(g,-3,-8,6,8,1,'#6b4423');};
XITEM.tower=(g,a,b)=>{R(g,-8,-30,16,30,1,a);for(let y=-27;y<-3;y+=6){R(g,-5,y,4,3,0,b);R(g,1,y,4,3,0,b);}};
XITEM.plot=(g,a,b)=>{R(g,-1.5,-24,3,24,1,'#6b4423');R(g,-12,-26,24,12,2,a);R(g,-9,-22,18,3,1,b);};
XSTATION.mould=(col,busy)=>{rr(-40,-20,80,26,4,'#5b5f66');rr(-34,-36,30,18,3,col);rr(4,-36,30,18,3,col);for(let i=0;i<5;i++)rr(-44+i*18,10,14,8,1,'#b9b4a8');ell(28,-40,10,5,'#c9b48a');};
XSTATION.site=(col,busy)=>{rr(-40,-10,80,16,2,'#9a958c');for(let k=0;k<4;k++)rr(-34+k*20,-40,12,30,1,'#c9c3b8');ctx.strokeStyle='#8a5a2a';ctx.lineWidth=2;for(const x of[-44,44]){ctx.beginPath();ctx.moveTo(x,6);ctx.lineTo(x,-44);ctx.stroke();}ctx.beginPath();ctx.moveTo(-44,-24);ctx.lineTo(44,-24);ctx.stroke();rr(-6,-46,12,6,2,col);};
XSTATION.crane=(col,busy)=>{rr(-6,-46,12,70,1,'#f2c230');ctx.strokeStyle='#b88a10';ctx.lineWidth=1.5;for(let y=-44;y<20;y+=8){ctx.beginPath();ctx.moveTo(-6,y);ctx.lineTo(6,y+8);ctx.stroke();}rr(-46,-46,96,6,1,'#f2c230');rr(-48,-44,12,10,1,'#5b5f66');rr(6,-40,10,8,2,'#7ad1ff');ctx.strokeStyle='#333';ctx.beginPath();ctx.moveTo(36,-40);ctx.lineTo(36,-10);ctx.stroke();rr(32,-12,8,6,1,'#c62828');rr(-20,14,40,10,2,col);};
function estStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(43,22,8,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  if(li===0){ctx.fillStyle='#8a8578';ctx.fillRect(x+w/2-14,y,28,h-34);for(let k=0;k<3;k++){const yy=y+20+k*58;rr(x+8,yy,w/2-26,40,3,'#e9dcc0');ctx.fillStyle='#8e4a2a';ctx.fillRect(x+6,yy-6,w/2-22,8);rr(x+w/2+18,yy,w/2-26,40,3,'#f0e4c8');ctx.fillStyle='#2a62c9';ctx.fillRect(x+w/2+16,yy-6,w/2-22,8);}
    rr(x+w-40,y+10,30,18,2,'#fff');ctx.fillStyle='#c62828';ctx.font='900 9px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('TO LET',x+w-25,y+23);T('LETTING STREET');}
  else if(li===1){ctx.fillStyle='#bfb6a2';ctx.fillRect(x+6,y+6,w-12,h-40);ell(x+40,y+50,32,20,'#d9b26a');ell(x+w-44,y+46,28,18,'#a9a39a');for(let r=0;r<4;r++)for(let k=0;k<6;k++)rr(x+16+k*((w-32)/6),y+96+r*20,(w-32)/6-4,12,1,'#8f8b84');T('BLOCK YARD');}
  else if(li===2){ctx.fillStyle='#9c7b4e';ctx.fillRect(x+6,y+6,w-12,h-40);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.strokeRect(x+14,y+14,w/2-20,90);ctx.strokeRect(x+w/2+6,y+14,w/2-20,90);ctx.setLineDash([]);
    for(const px of[x+14,x+w/2-6,x+w/2+6,x+w-14])rr(px-2,y+10,4,8,1,'#f26a1a');rr(x+w/2+16,y+50,w/2-40,50,2,'#d5cfc4');rr(x+20,y+120,60,26,2,'#2a62c9');ctx.fillStyle='#fff';ctx.font='900 9px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('SITE',x+50,y+137);T('BUILDING PLOTS');}
  else if(li===3){ctx.fillStyle='#7fae4a';ctx.fillRect(x+6,y+6,w-12,h-40);ctx.fillStyle='#4b4b4b';ctx.fillRect(x+w/2-12,y+6,24,h-40);ctx.fillStyle='#f2c230';for(let yy=y+16;yy<y+h-40;yy+=24)ctx.fillRect(x+w/2-1.5,yy,3,10);
    for(let k=0;k<4;k++){ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=2;ctx.strokeRect(x+14,y+14+k*44,w/2-32,38);ctx.strokeRect(x+w/2+18,y+14+k*44,w/2-32,38);rr(x+w/2-18,y+20+k*44,3,24,1,'#333');ell(x+w/2-16,y+20+k*44,5,3,'#fff6b0');}
    rr(x+w/2-30,y+h-60,60,18,3,'#8e4a2a');T('ESTATE PLOTS');}
  else{ctx.fillStyle='#a8a296';ctx.fillRect(x+6,y+6,w-12,h-40);rr(x+w/2-34,y+40,68,h-90,3,'#cfd8dc');for(let r=0;r<8;r++)for(let k=0;k<4;k++)rr(x+w/2-28+k*15,y+48+r*16,10,10,1,'#7ad1ff');
    ctx.fillStyle='#f2c230';ctx.fillRect(x+w-36,y+10,8,h-60);ctx.fillRect(x+16,y+10,w-40,6);rr(x+14,y+16,14,10,1,'#5b5f66');ctx.strokeStyle='#333';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+50,y+16);ctx.lineTo(x+50,y+46);ctx.stroke();rr(x+44,y+46,12,8,1,'#c62828');T('TOWER SITE');}}

BIZ.estate={name:'Oke-Ile Homes & Towers',tag:'Keys to a skyline',tone:'#e0a21a',field:'estate',isNew:true,qf:300,
  owner:{cloth:'#f4f4f0',trim:'#1b2a4a',hat:'hard'},
  hand:'Tipper driver',cook:'bricklayer',seller:'letting agent',
  outfit:{hand:{cloth:'#4a7a5a',trim:'#c62828',hat:'cap'},cook:{cloth:'#2a62c9',trim:'#c62828',hat:'hard'},server:{cloth:'#f26a1a',trim:'#1b1b1b',hat:'none',gender:'f'},
    cashier:{cloth:'#1b2a4a',trim:'#f4f4f0',hat:'none'},porter:{cloth:'#9a9a9a',trim:'#c9a15a',hat:'none'}},
  venue:['Kiosk with a TO LET board','Block yard with a tipper','Walled estate with a gatehouse','Estate plaza with 40 shops','Towers in six cities'],
  // Research stage costs: Tipper on Credit N25m, Gate and Street Lights N400m, The Plaza N900m, Skyline N30bn (venues);
  // Sand Cement Sweat N3m, First Bungalow N60m, Going Up N4bn (lines). Estate Plots opens with the estate, engine-priced.
  costs:{venue:[25000000,400000000,900000000,30000000000],line:[3000000,60000000,null,4000000000]},
  lines:[
   Object.assign(L('Flat letting','Letting','#f26a1a',100000,'5% of a year\'s rent','field',['key','#c9a15a','#8a6a2a'],['doc','#fffaf0','#f26a1a'],'desk'),{w:10,qx:2}),
   Object.assign(L('9-inch blocks','Blocks','#8f8b84',900,'9-inch block','field',['sack','#d9d4c8','#2a62c9'],['block','#9a958c','#6f6b64'],'mould'),{w:8,qx:3}),
   Object.assign(L('Bungalow build','Bungalow','#2a62c9',6000000,'stage payment, N30m home','field',['block','#9a958c','#6f6b64'],['house','#e9dcc0','#c62828'],'site'),{w:.6,qx:1}),
   Object.assign(L('Estate plots','Plots','#3f8a2a',15000000,'titled, serviced plot','field',['doc','#f4f1ea','#3f8a2a'],['plot','#3f8a2a','#fff'],'desk'),{w:.5,qx:1}),
   Object.assign(L('Tower flats','Tower','#1b2a4a',30000000,'20% deposit, N150m flat','field',['strip','#7a7a7a','#4a4a4a'],['tower','#cfd8dc','#7ad1ff'],'crane'),{w:.3,qx:1})]};
BIZX.estate={demand:estDemand,lineW:estLineW,sale:estSale,gate:estGate,html:estHtml,bind:estBind,night:estNight,month:estMonth,crew:estCrew,
  strip:estStrip,base:'#b59a6a',floor:['#cfb98f','#d6c6a2','#ddd3bc','#e6e1d4','#dfe4e8'],locked(){return null;}};
