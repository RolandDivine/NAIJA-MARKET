/* ===== KoboWave Technologies: research rules from plan3/tech.json on top of the shop engine =====
   Phone repair under an umbrella, then monthly app subscriptions, then Pay Link payments and Cloud Rack hosting.
   Customer money in the settlement vault is never the company's money: it is paid to sellers the next morning.
   No hacking, no fraud, no data misuse anywhere. Everything is game money. */
const TECHR={
  pay:{junior:300000,senior:2000000,support:180000,server:1200000,dpo:700000,settle:400000}, // research/storyline salaries; settlement officer is an estimate
  fee:{pct:.015,flat:100,waive:2500,cap:2000,keep:.6},   // 1.5% + N100, N100 waived under N2,500, cap N2,000; keep 60% after bank and card costs
  run:.30,              // cloud 10% + sales 12% + admin 8% of software revenue (research cost structure)
  parts:.5,             // share of a repair price spent on the screen or part // estimate
  dL:48,dP:1650,        // generator: 6 litres an hour for 8 hours at about N1,650 a litre (storyline)
  tank:400,             // litres per site tank // estimate
  site2:250000000,      // second server site // estimate
  solar:60000000,       // solar backup, cuts diesel by 70% // estimate (70% from storyline)
  pci:15000000,         // yearly PCI DSS audit (research)
  lic:[['Sandbox',0],['PSSP licence',100000000],['Payment Solution Services',250000000],['Switching licence',2000000000]],
  rounds:[['Seed',3000000000,.20],['Series A',22500000000,.20],['Series B',75000000000,.15]]};
const isTech=()=>SAVE.cur==='tech'&&B&&B.isNew;
const tYear=()=>Math.floor((S.day-1)/(MONTH*12));
function tState(){const s=S.tch=S.tch||{};const d={subs:[0,0,0,0,0],feat:0,bugs:[0,0,0,0,0],jr:0,sr:0,sup:0,eng:0,dpo:0,setl:0,shopPages:0,
    vault:0,vaultIn:0,fees:0,vol:0,pays:0,strikes:[],susp:0,clean:0,diesel:[TECHR.tank,0],site2:false,solar:false,auto:true,down:0,downMo:0,upHist:[],
    lic:0,own:1,round:0,pciDue:false,pciOk:0,dataLate:false,dataBlock:false,dataOk:0,churn:4,churnHist:[],hiChurn:0,unpaid:0,
    wk:-1,dp:TECHR.dP,pmax:60000,mo:{rev:0,cost:0},day:{},yrRev:0,last:null,rev50:0};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  if(lvl('line3')&&!s.lic)s.lic=1;
  const w=Math.floor(S.day/7);if(w!==s.wk){s.wk=w;s.dp=Math.round(TECHR.dP*(.88+.24*Math.random()));s.pmax=Math.round(30000+60000*Math.random());} // weekly diesel price and payment sizes // estimate range
  return s;}
const tCost=(n,k)=>{const s=S.tch;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const tSubs=()=>{const s=S.tch;return s.subs[1]+s.subs[2]+s.subs[4];};
const tUptime=()=>{const s=S.tch;return Math.max(0,100-s.downMo/(MONTH*24)*100);};
const tBugP=()=>{const s=S.tch,n=s.jr+s.sr;return n?(.15*s.jr+.04*s.sr)/n:.15;}; // bug chance per feature: junior 15%, senior 4%
const tChurn=()=>{const s=S.tch,bugs=s.bugs.reduce((a,b)=>a+b,0),n=Math.max(1,tSubs());
  let c=4+Math.floor(bugs/10)+.5*s.downMo-s.sup*100/n;c=Math.max(1.5,c);if(tUptime()<99)c*=2;return Math.round(c*10)/10;};
const tBurn=()=>{const s=S.tch,w=monthDue(true).wages;const L=s.last;if(!L)return 0;return Math.max(0,L.cost+w-L.rev);};
const tRunway=()=>{const b=tBurn();return b?S.money/b:99;};
const tSusp=()=>S.tch.susp>S.day;
const tLtv=()=>{const s=S.tch,n=tSubs();if(!n)return 0;const m=(s.subs[1]*B.lines[1].price+s.subs[2]*B.lines[2].price+s.subs[4]*B.lines[4].price)/n*(1-TECHR.run);return Math.round(m/(tChurn()/100));};
function payFee(p){let f=TECHR.fee.pct*p+(p<TECHR.fee.waive?0:TECHR.fee.flat);return Math.min(TECHR.fee.cap,f);}

/* ----- customers ----- */
function techDemand(){const s=tState();let m=1+Math.min(.3,.02*s.feat);if(s.clean>=30)m*=1.1;if(tRunway()<3)m*=.75;return m;}
function techLineW(i){const s=tState();if(i===0)return 1;
  if(s.bugs[i]>=3)return 0;                      // 3+ open bugs block that product's sales until fixed // estimate threshold
  if(s.dataBlock)return 0;                        // unfiled data audit: no new customers
  if(i===3&&(tSusp()||s.pciDue))return 0;          // Pay Link suspended or PCI audit unpaid
  if(i===4&&tUptime()<99)return .3;                 // bank clients wait after a bad month
  return 1;}
function techSale(i,c,q,amt){const s=tState();
  if(i===0){const parts=Math.round(amt*TECHR.parts);tCost(parts,'parts');return amt;}
  if(i===3){// Pay Link: a merchant's payments today; fees by the published rule, seller money into the locked vault
    let fees=0,vol=0,n=0;while(fees<amt&&n<400){const p=Math.round(500+Math.random()*s.pmax);vol+=p;fees+=payFee(p);n++;}
    s.vault+=vol;s.vaultIn+=vol;s.vol+=vol;s.pays+=n;s.fees+=fees;const keep=Math.round(fees*TECHR.fee.keep);s.subs[3]+=q;s.mo.rev+=keep;
    if(Math.random()<tBugP()/20)s.bugs[3]++;s.feat++;return keep;}
  // software and hosting: first month paid now, then billed on day 1 of every month
  s.subs[i]+=q;if(i===1)s.shopPages+=q;s.mo.rev+=amt;const run=Math.round(amt*TECHR.run);tCost(run,'run');
  if(i!==4){s.feat++;if(Math.random()<tBugP()/20)s.bugs[i]++;} // a new feature ships with every 20 sign-ups // estimate
  return amt;}

/* ----- nights: settlement, diesel and uptime, bug fixing, billing, audits ----- */
function techNight(){if(!isTech())return[];const s=tState(),d=S.day,rows=[];
  // generator diesel
  const servers=lvl('line1')||lvl('line4');let down=0;
  if(servers){const burn=Math.round(TECHR.dL*(evx('cost_hit')?2:1)*(s.solar?.3:1));for(let k=0;k<(s.site2?2:1);k++){
      if(s.auto&&s.diesel[k]<TECHR.tank){const need=TECHR.tank-s.diesel[k],c=need*s.dp;if(S.money>=c){tCost(c,'diesel');s.diesel[k]=TECHR.tank;}}
      s.diesel[k]=Math.max(0,s.diesel[k]-burn);}
    const out=s.diesel.slice(0,s.site2?2:1).map(x=>x<=0);
    const p=.048;let a=Math.random()<p?1+Math.floor(Math.random()*4):0;if(out[0])a=8; // one site: about 99.5% uptime
    if(s.site2){let b=Math.random()<p?1+Math.floor(Math.random()*4):0;if(out[1])b=8;down=Math.min(a,b)&&Math.random()<.1?Math.min(a,b):0;}else down=a;
    if(down){s.downMo+=down;s.down+=down;toast('⚡ Servers were down '+down+' hour'+(down>1?'s':'')+(out[0]?' (generator out of diesel)':'')+'. Fees lost and some customers unhappy.',4);}}
  // settlement: last day's seller money leaves the vault (T+1). It never pays our costs.
  if(s.vault){if(down>=4&&!s.setl){s.strikes.push(d);rows.push(['Late settlement (servers down)','strike','#ffb3a3']);toast('🏦 Sellers were paid late today. One trust strike.',4);}
    else rows.push(['Settled to sellers (T+1, their money)','₦'+fmt(s.vault),'#cfe3ff']);s.vault=0;}
  s.strikes=s.strikes.filter(x=>x>d-90);
  if(s.strikes.length>=3&&!tSusp()){s.susp=d+7;s.strikes=[];s.subs[3]=Math.round(s.subs[3]*.8);s.clean=0;banner('PAY LINK PAUSED','Regulator review: 7 days. 20% of payment sellers left.');}
  if(lvl('line3')){if(!down)s.clean++;else s.clean=0;}
  // developers fix bugs: founder 2, junior 2, senior 6 each night // estimate
  let fix=2+2*s.jr+6*s.sr;for(let i=1;i<5&&fix>0;i++){const f=Math.min(fix,s.bugs[i]);s.bugs[i]-=f;fix-=f;}
  // monthly billing on day 1
  if(d%MONTH===0){let bill=0;for(const i of[1,2,4]){const lost=Math.round(s.subs[i]*tChurn()/100);s.subs[i]-=lost;bill+=s.subs[i]*revenue(i,false);}
    s.subs[3]-=Math.round(s.subs[3]*tChurn()/100);
    if(bill){S.money+=bill;S.mo.rev+=bill;s.mo.rev+=bill;const run=Math.round(bill*TECHR.run);tCost(run,'run');rows.push(['Subscriptions billed ('+tSubs()+')','₦'+fmt(bill),'#b9ffcf']);}
    s.upHist.push(Math.round(tUptime()*100)/100);if(s.upHist.length>12)s.upHist.shift();s.downMo=0;}
  // audit day each year: day 90 (end of March)
  const yd=(d-1)%(MONTH*12)+1;
  if(yd===90){if(lvl('line3')){if(S.money>=TECHR.pci){tCost(TECHR.pci,'audit');s.pciOk++;toast('🔐 PCI card-data audit passed. Pay Link stays open.',4);}else{s.pciDue=true;toast('🔐 PCI audit is due (₦15m). Pay Link pauses until it is paid (HQ).',5);}}
    if(tSubs()>200){if(s.dpo){const f=dataFee();tCost(f,'audit');s.dataOk++;}else{s.dataLate=true;toast('📁 Data audit due. Hire a Data Protection Officer and file it in HQ (late fee +50%).',5);}}}
  if(yd===120&&s.dataLate&&!s.dataBlock){const fine=Math.round(s.yrRev*.02);tCost(fine,'audit');s.dataBlock=true;toast('📁 Data audit unfiled: fine ₦'+short(fine)+' (2% of yearly revenue) and no new customers until filed.',6);}
  if(yd===1)s.yrRev=0;
  const D=s.day;if(D.parts)rows.push(['Phone parts','-₦'+fmt(D.parts),'#ffb3a3']);if(D.run)rows.push(['Cloud, sales and admin','-₦'+fmt(D.run),'#ffb3a3']);
  if(D.diesel)rows.push(['Generator diesel','-₦'+fmt(D.diesel),'#ffb3a3']);if(D.audit)rows.push(['Audits and fines','-₦'+fmt(D.audit),'#ffb3a3']);
  s.day={};return rows;}
const dataFee=()=>{const n=tSubs();return n<1000?100000:n<5000?500000:1000000;}; // N100k to N1m by customer count (tier split is an estimate)
function techMonth(M){if(!isTech())return{rows:[],cost:0,or:0};const s=tState(),rows=[];
  if(M.short>0&&S.money<0){s.unpaid++;s.jr=Math.floor(s.jr/2);s.sr=Math.floor(s.sr/2);toast('Salaries were short. Half of the developers left. Cut costs, sell more or raise a round.',6);}else s.unpaid=0;
  const r=s.mo.rev,cost=s.mo.cost;s.last={rev:r,cost};s.yrRev+=r;s.rev50=r;s.mo={rev:0,cost:0};
  const c=tChurn();s.churnHist.push(c);if(s.churnHist.length>12)s.churnHist.shift();s.hiChurn=c>8?s.hiChurn+1:0;
  return{rows,cost,or:r?Math.round((cost+M.wages)/r*100):0};}
function techCrew(){if(!isTech()||!S.tch)return[];const s=S.tch,P=TECHR.pay,r=[];
  if(s.jr)r.push({name:'Junior developers',n:s.jr,each:P.junior});if(s.sr)r.push({name:'Senior developers',n:s.sr,each:P.senior});
  if(s.sup)r.push({name:'Support agents',n:s.sup,each:P.support});if(s.eng)r.push({name:'Server engineers',n:s.eng,each:P.server});
  if(s.dpo)r.push({name:'Data Protection Officer',n:1,each:P.dpo});if(s.setl)r.push({name:'Settlement officer',n:1,each:P.settle});return r;}

/* ----- stage gates (research licences and milestones) ----- */
function techGate(st){const s=tState();
  if(st.base==='line'&&st.arg===2&&s.shopPages<3)return'🔒 Ship your first 3 Shop Pages first ('+s.shopPages+' so far).';
  if(st.base==='venue'&&st.n===1&&tSubs()<30)return'🔒 Register with CAC and reach 30 paying subscribers ('+tSubs()+' now).';
  if(st.base==='line'&&st.arg===3&&!s.dpo)return'🔒 Pay Link needs a partner bank and a CBN PSSP licence (₦100m capital, in this step). Hire a Data Protection Officer first (HQ).';
  if(st.base==='venue'&&st.n===2&&tSubs()<500)return'🔒 The full office floor needs 500 paying subscribers ('+tSubs()+' now).';
  if(st.base==='line'&&st.arg===4){if(!s.pciOk)return'🔒 Rack room needs a passed PCI audit (audit day is day 90 of the year).';if(s.rev50<50000000)return'🔒 Rack room needs ₦50m monthly revenue (last month ₦'+short(s.rev50)+').';}
  if(st.base==='venue'&&st.n===3&&!s.dataOk)return'🔒 New countries want a clean yearly data audit first.';
  if(st.base==='venue'&&st.n===4){if(s.lic<3)return'🔒 The Unicorn Bell needs a Switching licence (₦2bn capital, HQ).';if(s.pciOk+s.dataOk<2)return'🔒 Two clean audits needed first.';}
  return null;}

/* ----- HQ panel ----- */
function techHtml(){const s=tState(),rw=tRunway(),b=tBurn(),up=tUptime();let h='<h2>Runway</h2>';
  h+='<div class="stats"><div class="stat">Monthly burn<b>'+(b?'₦'+short(b):'none, profitable')+'</b></div><div class="stat">Runway<b>'+(b?(rw>=99?'99+':rw.toFixed(1))+' months':'∞')+'</b></div><div class="stat">Your ownership<b>'+Math.round(s.own*100)+'%</b></div><div class="stat">Subscribers<b>'+fmt(tSubs())+'</b></div></div>';
  if(b&&rw<6)h+='<p class="note">'+(rw<3?'⚠️ Under 3 months of runway: sign-ups slow by 25% until you sell more, cut staff or raise.':'Runway under 6 months: hire carefully.')+'</p>';
  const R=TECHR.rounds[s.round];
  if(R){const need=s.round===0?tSubs()>=500:s.round===1?s.rev50>=50000000:s.rev50>=450000000,ok=need&&s.hiChurn<2;
    h+='<h2>Funding</h2><p class="note">'+R[0]+': ₦'+short(R[1])+' for '+Math.round(R[2]*100)+'% of the company. Needs '+(s.round===0?'500 subscribers':s.round===1?'₦50m monthly revenue':'₦450m monthly revenue')+(s.hiChurn>=2?'. Investors wait: churn was above 8% for two months.':'')+'. You can also grow on profit and keep your slice.</p><div class="acts"><button class="ghost" data-tk="round" type="button"'+(ok?'':' disabled')+'>🤝 Take '+R[0]+' round</button></div>';}
  h+='<h2>Customers</h2><table><tr><td>Shop Pages · Invoice apps · Cloud Racks</td><td>'+s.subs[1]+' · '+s.subs[2]+' · '+s.subs[4]+'</td></tr><tr><td>Monthly churn (4% base, bugs and downtime add, support cuts)</td><td>'+tChurn()+'%</td></tr><tr><td>Lifetime value per customer</td><td>₦'+fmt(tLtv())+'</td></tr><tr><td>Features shipped (+2% sign-ups each, max 30%)</td><td>'+s.feat+'</td></tr><tr><td>Open bugs (3 on a product pause its sales)</td><td>'+s.bugs.slice(1).reduce((a,x)=>a+x,0)+'</td></tr></table>';
  h+='<h2>Team</h2><table><tr><td>Junior developers (₦300k, 15% bug chance)</td><td>'+s.jr+'</td></tr><tr><td>Senior developers (₦2m, 4% bug chance)</td><td>'+s.sr+'</td></tr><tr><td>Support agents (₦180k, -1% churn per 100 customers)</td><td>'+s.sup+'</td></tr><tr><td>Server engineers (₦1.2m)</td><td>'+s.eng+'</td></tr><tr><td>Data Protection Officer · Settlement officer</td><td>'+(s.dpo?'✅':'—')+' · '+(s.setl?'✅':'—')+'</td></tr></table>';
  h+='<div class="acts"><button class="ghost" data-tk="jr" type="button">👩🏾‍💻 Hire junior</button><button class="ghost" data-tk="sr" type="button">🧑🏿‍💻 Hire senior</button><button class="ghost" data-tk="sup" type="button">🎧 Hire support</button><button class="ghost" data-tk="eng" type="button">🔧 Hire server engineer</button>'+(s.dpo?'':'<button class="ghost" data-tk="dpo" type="button">📁 Hire DPO</button>')+(s.setl?'':'<button class="ghost" data-tk="setl" type="button">🏦 Hire settlement officer</button>')+'<button class="ghost" data-tk="cut" type="button">✂️ Let one developer go</button></div>';
  h+='<h2>Uptime and diesel</h2><div class="stats"><div class="stat">Uptime this month<b>'+up.toFixed(2)+'%</b></div><div class="stat">Diesel this week<b>₦'+fmt(s.dp)+'/L</b></div><div class="stat">Site 1 tank<b>'+s.diesel[0]+' L</b></div><div class="stat">Site 2<b>'+(s.site2?s.diesel[1]+' L':'none')+'</b></div></div>';
  h+='<div class="acts"><button class="ghost'+(s.auto?' on':'')+'" data-tk="auto" type="button">⛽ Auto refuel: '+(s.auto?'on':'off')+'</button><button class="ghost" data-tk="fuel" type="button">⛽ Refuel now</button>'+(s.site2?'':'<button class="ghost" data-tk="site2" type="button">🏢 Second server site · ₦'+short(TECHR.site2)+'</button>')+(s.solar?'':'<button class="ghost" data-tk="solar" type="button">☀️ Solar backup · ₦'+short(TECHR.solar)+'</button>')+'</div>';
  h+='<p class="note">One site gives about 99.5% uptime; two sites almost never go down together. The generator burns 48 litres a day (twice that when grid power is out). Empty tank = servers down. Under 99% in a month doubles churn and bank clients wait.</p>';
  if(lvl('line3')){h+='<h2>Settlement vault</h2><div class="stats"><div class="stat">Held for sellers<b>₦'+fmt(s.vault)+'</b></div><div class="stat">Payments processed<b>'+fmt(s.pays)+'</b></div><div class="stat">Volume<b>₦'+short(s.vol)+'</b></div><div class="stat">Trust strikes (90 days)<b>'+s.strikes.length+' / 3</b></div></div>';
    h+='<p class="note">Fee per payment: 1.5% + ₦100 (₦100 waived under ₦2,500), never more than ₦2,000. 40% of each fee goes to bank and card costs. Sellers\' money sits in the vault and is paid out the next morning; it can never pay your costs. '+(tSusp()?'⚠️ Pay Link paused for regulator review until day '+s.susp+'.':s.clean>=30?'30+ clean days: 10% more customers.':'Clean days: '+s.clean+' of 30.')+'</p>';}
  h+='<h2>Licences and audits</h2><table>'+TECHR.lic.map((L,i)=>'<tr><td>'+L[0]+(L[1]?' (₦'+short(L[1])+' capital)':' (no capital)')+'</td><td>'+(s.lic>i?'✅':i===s.lic&&i>=2&&lvl('line3')?'<button class="ghost" data-tk="lic" type="button">Apply · ₦'+short(L[1])+'</button>':'—')+'</td></tr>').join('');
  h+='<tr><td>PCI card-data audit (₦15m, day 90 yearly)</td><td>'+(s.pciDue?'<button class="ghost" data-tk="pci" type="button">Pay now</button>':s.pciOk?'✅ '+s.pciOk+' passed':'not yet')+'</td></tr>';
  h+='<tr><td>Data audit (past 200 customers, ₦'+short(dataFee())+')</td><td>'+(s.dataLate?'<button class="ghost" data-tk="data" type="button">File · ₦'+short(Math.round(dataFee()*1.5))+'</button>':s.dataOk?'✅ '+s.dataOk+' filed':tSubs()>200?'due day 90':'not needed yet')+'</td></tr></table>';
  h+='<p class="note">Licence capital is held in reserve at the partner bank. Customer data is only used to serve the customer.</p>';
  return h;}
function techBind(){if(!isTech())return;const s=S.tch,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#hqin [data-tk]').forEach(b=>b.onclick=()=>{const k=b.dataset.tk;
    if(k==='jr'||k==='sr'||k==='sup'||k==='eng'){s[k]++;re();}
    if(k==='dpo'||k==='setl'){s[k]=1;re();}
    if(k==='cut'){if(s.jr)s.jr--;else if(s.sr)s.sr--;re();}
    if(k==='auto'){s.auto=!s.auto;re();}
    if(k==='fuel'){let c=0;for(let i=0;i<(s.site2?2:1);i++)c+=(TECHR.tank-s.diesel[i])*s.dp;buy(c,()=>{s.diesel[0]=TECHR.tank;if(s.site2)s.diesel[1]=TECHR.tank;});}
    if(k==='site2')buy(TECHR.site2,()=>{s.site2=true;s.diesel[1]=TECHR.tank;});
    if(k==='solar')buy(TECHR.solar,()=>{s.solar=true;});
    if(k==='lic'){const L=TECHR.lic[s.lic];if(L)buy(L[1],()=>{s.lic++;});}
    if(k==='pci')buy(TECHR.pci,()=>{s.pciDue=false;s.pciOk++;});
    if(k==='data'){if(!s.dpo){toast('Hire a Data Protection Officer first.',2);return;}buy(Math.round(dataFee()*1.5),()=>{s.dataLate=false;s.dataBlock=false;s.dataOk++;});}
    if(k==='round'){const R=TECHR.rounds[s.round];if(!R)return;S.money+=R[1];s.own*=1-R[2];s.round++;banner(R[0]+' ROUND','₦'+short(R[1])+' in. You now own '+Math.round(s.own*100)+'%.');fanfare(true);re();}});}

/* ----- drawings: tickets, phones, repair bench, dev desk, server rack ----- */
XITEM.ticket=(g,a,b)=>{R(g,-10,-18,20,16,2,a);R(g,-10,-18,20,4,1,b);R(g,-7,-11,10,1.6,0,'rgba(0,0,0,.35)');R(g,-7,-7,14,1.6,0,'rgba(0,0,0,.25)');};
XITEM.phone=(g,a,b)=>{R(g,-7,-24,14,24,3,'#22252b');R(g,-5.5,-21.5,11,18,1.5,a);R(g,-3,-17,6,3,1,b);R(g,-3,-12,6,3,1,b);E(g,0,-2,1.4,1.4,'#666');};
XSTATION.bench=(col)=>{ell(0,-18,48,16,col);rr(-2,-18,4,22,1,'#5b5f66');rr(-40,0,80,12,3,'#8a5a2a');rr(-36,12,6,16,1,'#6b4423');rr(30,12,6,16,1,'#6b4423');rr(-20,-6,14,8,2,'#22252b');rr(6,-5,18,6,1,'#9aa0a6');};
XSTATION.devdesk=(col)=>{rr(-44,-4,88,12,3,'#e9e2d2');rr(-40,8,6,20,1,'#9aa0a6');rr(34,8,6,20,1,'#9aa0a6');rr(-36,-36,32,24,3,'#22252b');rr(-33,-33,26,18,2,col);rr(4,-36,32,24,3,'#22252b');rr(7,-33,26,18,2,'#1b2a4a');
  for(let i=0;i<4;i++)rr(10,-30+i*4,10+(i%2)*8,1.6,0,'#9fe8a0');rr(-22,-12,4,8,1,'#5b5f66');rr(18,-12,4,8,1,'#5b5f66');rr(-14,-2,28,4,1,'#5b5f66');};
XSTATION.rack=(col)=>{rr(-30,-46,60,72,4,'#1b1d22');for(let i=0;i<6;i++){rr(-26,-42+i*11,52,8,1,'#2c3038');ell(18,-38+i*11,1.8,1.8,i%2?'#4fc3ff':'#57e389');}rr(-30,-46,60,5,2,col);};

/* ----- KoboWave's own map: repair kiosk, dev office, payments HQ, server room ----- */
function techStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  if(li===0){ctx.fillStyle='#b8a17a';ctx.fillRect(x,y,w,h);ell(x+w/2,y+60,62,26,'#f26a1a');ell(x+w/2,y+56,62,20,'#16a394');rr(x+w/2-2,y+58,4,70,1,'#5b5f66');rr(x+w/2-46,y+124,92,16,3,'#8a5a2a');
    for(let k=0;k<3;k++)rr(x+w/2-36+k*26,y+112,12,12,2,['#22252b','#2a62c9','#c62828'][k]);ctx.fillStyle='rgba(43,22,8,.55)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('REPAIR KIOSK',x+w/2,y+h-16);return;}
  if(li===1||li===2){ctx.fillStyle='#d7dde3';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(0,0,0,.06)';for(let yy=y;yy<y+h;yy+=30)ctx.fillRect(x,yy,w,1.5);
    for(let k=0;k<2;k++){const yy=y+30+k*80;rr(x+16,yy,w-32,22,4,'#f4f1ea');for(let m=0;m<3;m++){rr(x+26+m*((w-60)/3),yy-14,26,16,2,'#22252b');rr(x+28+m*((w-60)/3),yy-12,22,12,1,li===1?'#7ad1ff':'#16a394');}}
    rr(x+w-34,y+10,22,30,4,'#3f7a2a');ctx.fillStyle='rgba(43,22,8,.55)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(li===1?'DEV OFFICE':'PRODUCT WALL',x+w/2,y+h-16);return;}
  if(li===3){ctx.fillStyle='#1b2a4a';ctx.fillRect(x,y,w,h);rr(x+16,y+16,w-32,70,6,'#24395f');ctx.fillStyle='#16a394';ctx.fillRect(x+16,y+16,w-32,10);
    ctx.strokeStyle='#57e389';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+26,y+76);for(let k=0;k<7;k++)ctx.lineTo(x+26+k*((w-52)/6),y+70-k*5-(k%2)*8);ctx.stroke();
    rr(x+w/2-30,y+100,60,44,6,'#5b5f66');ell(x+w/2,y+122,14,14,'#9aa0a6');ell(x+w/2,y+122,5,5,'#22252b');ctx.fillStyle='#f2c230';ctx.font='900 10px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('SELLERS\' VAULT',x+w/2,y+156);T('PAYMENTS HQ');return;}
  ctx.fillStyle='#2b2f36';ctx.fillRect(x,y,w,h);for(let k=0;k<3;k++){const xx=x+18+k*((w-36)/3);rr(xx,y+16,(w-36)/3-10,110,3,'#121418');for(let m=0;m<8;m++){rr(xx+4,y+22+m*13,(w-36)/3-18,8,1,'#23262c');ell(xx+(w-36)/3-20,y+26+m*13,1.8,1.8,m%3?'#4fc3ff':'#57e389');}}
  rr(x+w-60,y+132,46,26,4,'#c9a15a');ctx.fillStyle='#22252b';ctx.font='900 9px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('DIESEL',x+w-37,y+149);T('SERVER ROOM');}

BIZ.tech={name:'KoboWave Technologies',tag:'Phone repair to payments',tone:'#16a394',field:'tech',isNew:true,qf:300,
  owner:{cloth:'#16a394',trim:'#f4f1ea',hat:'none'},
  hand:'Parts runner',cook:'developer',seller:'sales rep',
  outfit:{hand:{cloth:'#5b5f66',trim:'#16a394',hat:'cap'},cook:{cloth:'#f2c230',trim:'#1b2a4a',hat:'none'},server:{cloth:'#f4f1ea',trim:'#16a394',hat:'none'},cashier:{cloth:'#16a394',trim:'#f4f1ea',hat:'none',gender:'f'},porter:{cloth:'#5b5f66',trim:'#f26a1a',hat:'hard'}},
  venue:['Umbrella stand, Computer Village','Two laptops, one Yaba room','Full Yaba office floor','Offices in five cities','KoboWave tower'],
  // Research stage costs: Night Class N400k, Two Laptops N2.5m, Pay Link N120m (incl. N100m PSSP capital), Seed floor N300m,
  // Series A rack room N4bn, Five Cities N15bn, Unicorn Bell N60bn. The Invoice App step is priced by the engine.
  costs:{venue:[2500000,300000000,15000000000,60000000000],line:[400000,null,120000000,4000000000]},
  lines:[
   Object.assign(L('Phone screen repair','Repair','#f26a1a',12000,'repair, part included','field',['phone','#5b5f66','#c62828'],['phone','#7ad1ff','#f4f1ea'],'bench'),{w:10,qx:2}), // price // estimate
   Object.assign(L('Shop Page Starter','Shop Page','#16a394',5000,'month','field',['ticket','#fff7d6','#16a394'],['phone','#16a394','#f4f1ea'],'devdesk'),{w:6,qx:3}),
   Object.assign(L('Invoice and Stock App','Invoice App','#2a62c9',15000,'month per shop','field',['ticket','#e7f1fb','#2a62c9'],['phone','#2a62c9','#f4f1ea'],'devdesk'),{w:3,qx:2}),
   Object.assign(L('Pay Link Checkout','Pay Link','#f2c230',45000,'month of fees','field',['ticket','#fffaf0','#f2c230'],['doc','#fffaf0','#f2c230'],'devdesk'),{w:1.5,qx:1}),
   Object.assign(L('Cloud Rack Plan','Cloud Rack','#1b2a4a',600000,'month per server','field',['carton','#c9a15a','#1b2a4a'],['gadget','#22252b','#4fc3ff'],'rack'),{w:.4,qx:1})]};
BIZX.tech={demand:techDemand,lineW:techLineW,sale:techSale,gate:techGate,html:techHtml,bind:techBind,night:techNight,month:techMonth,crew:techCrew,
  strip:techStrip,base:'#8c9aa6',floor:['#c9b48f','#d9d3c6','#dfe3e8','#e6eaee','#eef1f4'],locked:()=>null};
