/* ===== PadiTrust Bank: research rules from plan3/bank.json on top of the shop engine =====
   Deposits are customers' money and never the player's cash. Every deposit goes down a waterfall: a reserve locked at
   the central bank, till cash, then loans and treasury bills. Licence capital is locked too and is never spendable.
   Policy rate, T-bill, savings and loan rates and the dollar move week to week. All of it is game money. */
const BKR={cap:[0,0,50e6,1e9,50e9],natCap:200e9,intCap:500e9,natCost:220e9,intCost:550e9,
  res:[0,0,.10,.10,.45],   // reserve: 0 at kiosk, 10% at microfinance (game value), 45% CRR at bank stage
  dep:[0,0,200000,500000,2000000], // average new saver deposit by stage // estimate
  loan:[500000,10000000],agentCap:1200000,cashOut:10000,xfer:20000,netCut:50, // N10,000 cash-out, network 0.5% (N50) // xfer size estimate
  float0:300000,okRepay:.80,chkRepay:.97,recover:.30,checks:60, // loans one Credit Officer checks a month // estimate
  pay:{credit:250000,compliance:400000,custodian:220000,guard:90000},mpr0:23,fx0:1460,ins:.0035/12};
const isBank=()=>SAVE.cur==='bank'&&B&&B.isNew;
function bkState(){const s=S.bk=S.bk||{};const d={trust:70,dep:0,res:0,till:0,bills:0,cb:0,book:[],npl:[],cap:0,loanPct:70,tillPct:5,check:true,
    credit:0,compliance:0,custodian:0,guard:0,mpr:BKR.mpr0,fx:BKR.fx0,wk:Math.floor(S.day/7),run:false,unpaid:0,paidRun:0,moved:0,float:BKR.float0,floatNow:BKR.float0,
    floatRun:-1,clean:0,cleanMo:0,thin:0,susp:false,lic:'',grp:[],checked:0,made:0,defaults:0,recovered:0,day:{},mo:{rev:0,cost:0},hist:[],lost:0};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  const tier=BKR.cap[stage()]||0;if(s.cap<tier)s.cap=tier; // licence capital is part of each licence stage's price
  if(stage()>=2&&s.float){S.money+=s.float;s.float=0;s.floatNow=0;toast('🏦 Your agent float comes home: you are a licensed bank now.',3);}
  bkPrices();return s;}
/* ----- weekly rates (all yearly %, from the research: MPR 23%, 364-day T-bill 15.85%, lending ~30%, savings ~8%) ----- */
const tbillY=()=>Math.max(5,S.bk.mpr-7.15),loanM=()=>(stage()>=4?.025:.03)*(S.bk.mpr+7)/30,saveM=()=>.08*S.bk.mpr/BKR.mpr0/12,cbY=()=>S.bk.mpr+.5;
function bkPrices(){const s=S.bk;B.lines[3].price=Math.round(BKR.loan[0]*loanM());B.lines[4].price=Math.round(BKR.loan[1]*loanM());}
const loans=()=>S.bk.book.reduce((a,l)=>a+l.amt,0)+S.bk.grp.reduce((a,l)=>a+l.amt,0);
const nplAmt=()=>S.bk.npl.reduce((a,l)=>a+l.amt,0);
const nplPct=()=>{const t=loans()+nplAmt();return t>0?nplAmt()/t*100:0;};
const capRatio=()=>{const L=loans();return L>0?S.bk.cap/L*100:999;}; // T-bills carry 0% risk weight
const capMin=()=>S.bk.lic==='int'?15:10;
const resPct=()=>BKR.res[stage()]||0;
const freeFunds=()=>{const s=S.bk;return Math.max(0,s.dep-s.dep*resPct()-s.dep*s.tillPct/100);};
const loanRoom=()=>{const s=S.bk;return Math.max(0,Math.min(freeFunds()*s.loanPct/100-loans(),s.bills));};
const officerCap=()=>S.bk.credit*BKR.checks;
const bkCost=(n,k)=>{const s=S.bk;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const bkInc=(n,k)=>{const s=S.bk;S.money+=n;s.mo.rev+=n;S.mo.rev+=n;s.day[k]=(s.day[k]||0)+n;};
const lendStop=()=>{const s=S.bk;if(s.susp)return'Licence suspended until capital is rebuilt';if(nplPct()>5)return'Bad loans above 5%: the examiner has paused new loans';if(capRatio()<capMin())return'Capital ratio under '+capMin()+'%: no new loans';return null;};

/* ----- customers ----- */
function bkDemand(){const s=bkState();return .6+.6*s.trust/100;}
function bkLineW(i){const s=bkState(),st=stage();
  if(i<2&&st<2){if(s.moved>=BKR.agentCap)return 0;if(i===0&&s.floatNow<BKR.cashOut)return 0;}
  if(i>=2&&(st<2||s.susp))return 0;
  if(i>=3){if(lendStop())return 0;if(loanRoom()<BKR.loan[i-3])return 0;if(i===4&&st<4)return 0;}
  return 1;}
function bkSale(i,c,q,amt){const s=bkState(),st=stage();
  if(i<2&&st<2){const each=i===0?BKR.cashOut:BKR.xfer;let n=Math.min(q,Math.floor((BKR.agentCap-s.moved)/each));
    if(i===0){if(Math.random()<.5)s.floatNow+=each*n;else{n=Math.min(n,Math.floor(s.floatNow/each));s.floatNow-=each*n;}if(s.floatNow<BKR.cashOut)s.short=true;}
    n=Math.max(0,n);s.moved+=each*n;amt=Math.round(amt/q*n);const cut=i===0?BKR.netCut*n:0;s.day.net=(s.day.net||0)+cut;return amt-cut;}
  if(i===0&&st>=2){const d=BKR.cashOut*q;s.dep+=d;s.till+=d;} // cash-ins at the counter become deposits
  if(i===1&&s.lic==='int')amt+=Math.round(2*s.fx*q); // diaspora remittance fee, $2 each at this week's rate // estimate
  if(i===2){const d=BKR.dep[st]*q;s.dep+=d;s.till+=d;}
  if(i>=3){const size=BKR.loan[i-3];let n=0;for(let k=0;k<q&&loanRoom()>=size;k++){s.bills-=size;n++;}
    if(n){const chk=s.check&&s.checked+n<=officerCap();if(chk)s.checked+=n;s.made+=n;s.book.push({amt:size*n,left:6,chk,d:S.day});}
    amt=Math.round(amt/q*n);}
  s.mo.rev+=amt;return amt;}

/* ----- nights: withdrawals, the liquidity ladder, the waterfall, weekly rates ----- */
function bkNight(){if(!isBank())return[];const s=bkState(),rows=[],st=stage();
  if(st<2){if(s.short)toast('💵 The float ran out today. Raise your morning float in HQ.',3);else s.clean++;s.short=false;s.moved=0;s.floatNow=s.float;}
  if(st>=2&&s.dep>0){const ins=st>=2,runX=s.trust<50?(50-s.trust)*.002*(ins?.5:1):0,out=Math.round(s.dep*(.01+runX)),inn=Math.round(s.dep*.01*Math.min(1,s.trust/70));
    let need=Math.max(0,out-inn);s.dep-=need;
    const rel=Math.max(0,s.res-s.dep*resPct());s.res-=rel;s.till+=rel; // reserve falls with deposits
    if(out<inn){s.dep+=inn-out;s.till+=inn-out;}
    const pay=(have,f)=>{const x=Math.min(have,need);need-=x;f(x);return x;};
    pay(s.till,x=>s.till-=x);
    if(need>0){const x=pay(s.bills,x=>s.bills-=x);if(x)bkCost(Math.round(x*.01),'ladder');}
    if(need>0){const lim=Math.max(0,s.cap*.5-s.cb);pay(lim,x=>s.cb+=x);} // central bank loan, 50% of capital as limit // estimate
    if(need>0){let got=0;for(const l of s.book){if(need<=0)break;const x=Math.min(l.amt,need/.7);l.amt-=x;got+=x*.7;need-=x*.7;bkCost(Math.round(x*.3),'ladder');}s.book=s.book.filter(l=>l.amt>1);}
    if(need>0){s.unpaid++;s.trust=Math.max(0,s.trust-10);s.run=true;toast('🏦 A customer could not be paid today. Trust -10. Keep more till cash or T-bills.',4);}
    else if(s.run){s.trust=Math.min(100,s.trust+5);if(s.trust>=60){s.run=false;toast('🏦 Everyone was paid. The queue is gone and trust is back to '+s.trust+'.',3);}}
    if(s.trust<50&&!s.run){s.run=true;banner('QUEUE AT THE DOOR','Trust is '+s.trust+'. Pay everyone calmly to end it.');}
    if(!s.run&&s.till>=s.dep*.05)s.trust=Math.min(90,s.trust+2);
    if(Math.random()<1/360){s.trust=Math.max(0,s.trust-15);toast('📰 A rumour about banks is going round. Trust -15.',4);} // estimate: runs about once a year
    // waterfall: reserve, till target, the rest to T-bills (loans already out stay out)
    const R=s.dep*resPct();if(s.res<R){const x=Math.min(R-s.res,s.till+s.bills);const a=Math.min(x,s.till);s.till-=a;s.bills-=x-a;s.res+=x;}
    const T=s.dep*s.tillPct/100;if(s.till>T){s.bills+=s.till-T;s.till=T;}else{const x=Math.min(T-s.till,s.bills);s.bills-=x;s.till+=x;}
    if(s.cb>0&&s.bills>0){const x=Math.min(s.cb,s.bills);s.cb-=x;s.bills-=x;}}
  if(Math.floor(S.day/7)!==s.wk){s.wk=Math.floor(S.day/7);s.mpr=Math.round(Math.max(18,Math.min(28,s.mpr+rnd(-.5,.5)))*4)/4;s.fx=Math.round(Math.max(1200,Math.min(1800,s.fx*(1+rnd(-.02,.02)))));bkPrices();}
  if(capRatio()<5)s.thin++;else s.thin=0;
  if(s.thin>=30&&!s.susp){s.susp=true;banner('LICENCE SUSPENDED','Capital under 5% for 30 days. Insurance pays small savers.');}
  const D=s.day;if(D.net)rows.push(['Network share of agent fees','-₦'+fmt(D.net),'#ffb3a3']);if(D.ladder)rows.push(['Forced sales to pay withdrawals','-₦'+fmt(D.ladder),'#ff8a7a']);
  s.day={};return rows;}

/* ----- payday: the spread, defaults and recoveries, deposit insurance, group loans ----- */
function bkMonth(M){if(!isBank())return{rows:[],cost:0,or:0};const s=bkState(),rows=[],st=stage();let inc=0,cost=0;
  const lm=loanM();let li=0;for(const l of s.book){if(S.day-l.d>=MONTH*.5||l.left<6)li+=l.amt*lm;l.left--;} // first month was paid at signing
  const due=s.book.filter(l=>l.left<=0);s.book=s.book.filter(l=>l.left>0);let back=0,bad=0;
  for(const l of due){const p=l.chk?BKR.chkRepay:BKR.okRepay,b=Math.round(l.amt*(1-p)*rnd(.5,1.5));bad+=b;back+=l.amt-b;}
  s.bills+=back;if(bad){s.npl.push({amt:bad,m:3});s.defaults+=bad;}
  for(const n of s.npl)n.m--;const rec=s.npl.filter(n=>n.m<=0);s.npl=s.npl.filter(n=>n.m>0);let r=0;for(const n of rec){r+=Math.round(n.amt*BKR.recover);s.lost+=n.amt-Math.round(n.amt*BKR.recover);}s.bills+=r;s.recovered+=r;
  const tb=s.bills*tbillY()/1200,save=s.dep*.4*saveM(),ins=st>=2?s.dep*BKR.ins:0,cbi=s.cb*cbY()/1200;
  // loans to your own businesses: same rate as outside customers, paid from their cash
  let gi=0;for(const g of s.grp){const o=SAVE.biz[g.k];if(!o){g.amt=0;continue;}const intr=Math.round(g.amt*lm),prin=Math.min(g.amt,Math.round(g.amt/Math.max(1,g.left)));
    if(o.money>=intr+prin){o.money-=intr+prin;gi+=intr;g.amt-=prin;s.bills+=prin;g.left--;}else{g.late=(g.late||0)+1;}}
  s.grp=s.grp.filter(g=>g.amt>0);
  inc=Math.round(li+tb+gi);cost=Math.round(save+ins+cbi);S.money+=inc-cost;s.checked=0;
  if(li)rows.push(['Loan interest ('+(lm*100).toFixed(1)+'% a month)','₦'+fmt(Math.round(li)),'#b9ffcf']);if(gi)rows.push(['Interest from your own businesses','₦'+fmt(gi),'#b9ffcf']);
  if(tb)rows.push(['Treasury bills ('+tbillY().toFixed(2)+'% a year)','₦'+fmt(Math.round(tb)),'#b9ffcf']);if(save)rows.push(['Interest paid to savers','-₦'+fmt(Math.round(save)),'#ffb3a3']);
  if(ins)rows.push(['Deposit insurance premium','-₦'+fmt(Math.round(ins)),'#ffb3a3']);if(cbi)rows.push(['Central bank loan interest','-₦'+fmt(Math.round(cbi)),'#ffb3a3']);
  if(bad)rows.push(['Loans not repaid this month (now bad loans)','₦'+fmt(bad),'#ff8a7a']);if(r)rows.push(['Recovered politely from bad loans','₦'+fmt(r),'#b9ffcf']);
  if(s.made&&nplPct()<=5)s.cleanMo++;else if(nplPct()>5)s.cleanMo=0;
  const rev=s.mo.rev+inc,c=s.mo.cost+cost;s.mo={rev:0,cost:0};const or=rev>0?Math.round((c+M.wages)/rev*100):0;if(rev)s.hist.push(or);if(s.hist.length>24)s.hist.shift();
  return{rows,cost:cost-inc,or};}
function bkCrew(){if(!isBank()||!S.bk)return[];const s=S.bk,P=BKR.pay,r=[];if(s.credit)r.push({name:'Credit Officers',n:s.credit,each:P.credit});
  if(s.compliance)r.push({name:'Compliance Officers',n:s.compliance,each:P.compliance});if(s.custodian)r.push({name:'Vault Custodian',n:s.custodian,each:P.custodian});if(s.guard)r.push({name:'Security Guards',n:s.guard,each:P.guard});return r;}

/* ----- licence gates from the research stages ----- */
function bkGate(st){const s=bkState();
  if(st.base==='venue'&&st.n===1&&s.clean<30)return'🔒 The network registers a kiosk after 30 days with no float shortfall ('+s.clean+' so far).';
  if(st.base==='venue'&&st.n===2&&!s.compliance)return'🔒 A microfinance licence needs a KYC system: hire a Compliance Officer in HQ first.';
  if(st.base==='venue'&&st.n===3&&s.cleanMo<6)return'🔒 State licence: 6 months of lending with bad loans under 5% ('+s.cleanMo+' so far).';
  if(st.base==='venue'&&st.n===4&&(capRatio()<10||nplPct()>5))return'🔒 Regional licence: capital ratio 10%+ and bad loans under 5%.';
  if(st.base==='line'&&st.arg>=2&&st.arg<=3&&stage()<2)return'🔒 Savings and loans need the microfinance licence (Licence on the Wall).';
  if(st.base==='line'&&st.arg===4&&stage()<4)return'🔒 Corporate loans need the regional commercial licence.';
  return null;}

/* ----- HQ ----- */
const pc=n=>(Math.round(n*10)/10)+'%';
function bkHtml(){const s=bkState(),st=stage(),L=loans(),tot=Math.max(1,s.res+s.till+s.bills+L),stop=lendStop();
  let h='<h2>PadiTrust at a glance</h2><div class="stats"><div class="stat">Trust<b>'+s.trust+' / 100'+(s.run?' ⚠️':'')+'</b></div><div class="stat">Licence capital (locked)<b>₦'+short(s.cap)+'</b></div><div class="stat">Policy rate (weekly)<b>'+s.mpr+'%</b></div><div class="stat">Dollar (weekly)<b>₦'+s.fx.toLocaleString('en-NG')+'</b></div></div>';
  h+='<p class="note">Licence capital is your cushion. It stays locked in reserve and can never be spent. Customers\' deposits are their money, not yours: you earn the gap between loan and savings rates, plus fees.</p>';
  if(st<2){h+='<h2>Agent float</h2><table><tr><td>Morning float</td><td>₦'+fmt(s.float)+'</td></tr><tr><td>Float now</td><td>₦'+fmt(s.floatNow)+'</td></tr><tr><td>Moved today (cap ₦1.2m)</td><td>₦'+fmt(s.moved)+'</td></tr><tr><td>Days with no shortfall</td><td>'+s.clean+'</td></tr></table>';
    h+='<div class="acts"><button class="ghost" data-bk="float" type="button">💵 Add ₦100k to morning float</button>'+(s.floatRun===S.day?'':'<button class="ghost" data-bk="refill" type="button">🏃🏾‍♀️ Run to the float box</button>')+'</div><p class="note">Cash-out fee ₦200 per ₦10,000; the network keeps ₦50. Agents may not keep deposits. The kiosk closes for the day after ₦1.2m, and each customer is capped at ₦100,000.</p>';}
  else{h+='<h2>Balance sheet board</h2><div style="display:flex;height:22px;border-radius:6px;overflow:hidden;margin:6px 0">'+[[s.res,'#8e1c1c'],[s.till,'#f2c230'],[s.bills,'#2a62c9'],[L,'#2e8b3d']].map(x=>'<span style="width:'+(x[0]/tot*100)+'%;background:'+x[1]+'"></span>').join('')+'</div>';
    h+='<table><tr><td>🟥 Reserve at central bank ('+Math.round(resPct()*100)+'%)</td><td>₦'+short(s.res)+'</td></tr><tr><td>🟨 Till cash</td><td>₦'+short(s.till)+'</td></tr><tr><td>🟦 Treasury bills ('+tbillY().toFixed(2)+'% a year)</td><td>₦'+short(s.bills)+'</td></tr><tr><td>🟩 Loans ('+(loanM()*100).toFixed(1)+'% a month)</td><td>₦'+short(L)+'</td></tr><tr><td>Deposits (customers\' money)</td><td>₦'+short(s.dep)+'</td></tr>'+(s.cb?'<tr><td>Central bank loan ('+cbY()+'% a year)</td><td>₦'+short(s.cb)+'</td></tr>':'')+'</table>';
    h+='<p class="note">Loans: share of free funds</p><div class="seg" id="bkl">'+[40,55,70,85].map(p=>'<button class="ghost'+(s.loanPct===p?' on':'')+'" data-lp="'+p+'" type="button">'+p+'%</button>').join('')+'</div>';
    h+='<p class="note">Till cash: share of deposits</p><div class="seg" id="bkt">'+[5,10,15].map(p=>'<button class="ghost'+(s.tillPct===p?' on':'')+'" data-tp="'+p+'" type="button">'+p+'%</button>').join('')+'</div>';
    h+='<p class="note">Savers earn about '+(saveM()*1200).toFixed(1)+'% a year; current accounts (60%) earn nothing. Withdrawals are paid from the till first, then T-bills sold at a 1% loss, then a central bank loan, then loans sold at a 30% loss. Insurance pays small savers if a bank fails (premium 0.35% of deposits a year), so they queue at half speed.</p>';
    h+='<h2>Loan desk</h2><div class="stats"><div class="stat">Bad loans<b>'+pc(nplPct())+' (limit 5%)</b></div><div class="stat">Capital ratio<b>'+(L?pc(capRatio()):'—')+' (min '+capMin()+'%)</b></div><div class="stat">Room for new loans<b>₦'+short(loanRoom())+'</b></div><div class="stat">Checked this month<b>'+s.checked+' / '+officerCap()+'</b></div></div>';
    h+='<p class="note">Repay chance, shown to every borrower: <b>80%</b> approved fast, <b>97%</b> after a Credit Officer check. Unpaid loans become bad loans; 30% is recovered politely after 3 months. Loans run 6 months.'+(stop?' ⚠️ '+stop+'.':'')+'</p>';
    h+='<div class="acts"><button class="ghost'+(s.check?' on':'')+'" data-bk="check" type="button">🔍 Credit check: '+(s.check?'ON':'OFF')+'</button><button class="ghost" data-bk="addcap" type="button">🏛️ Add ₦'+short(Math.max(1e6,nice(s.cap*.1)))+' capital (locked)</button></div>';}
  h+='<h2>Staff</h2><div class="acts"><button class="ghost" data-bk="credit" type="button">Credit Officer · ₦250k ('+s.credit+')</button><button class="ghost" data-bk="compliance" type="button">Compliance Officer · ₦400k ('+s.compliance+')</button><button class="ghost" data-bk="custodian" type="button">Vault Custodian · ₦220k ('+s.custodian+')</button><button class="ghost" data-bk="guard" type="button">Security Guard · ₦90k ('+s.guard+')</button></div><p class="note">Monthly salaries. One Credit Officer checks about 60 loans a month.</p>';
  h+='<h2>Licence ladder</h2><table><tr><td>Unit microfinance</td><td>₦50m capital</td></tr><tr><td>State microfinance</td><td>₦1bn</td></tr><tr><td>Regional commercial (45% reserve)</td><td>₦50bn</td></tr><tr><td>National and listed</td><td>'+(s.lic?'✅':'₦200bn')+'</td></tr><tr><td>International (capital ratio 15%+)</td><td>'+(s.lic==='int'?'✅':'₦500bn')+'</td></tr></table>';
  if(st>=4&&!s.lic)h+='<div class="acts"><button class="ghost" data-bk="nat" type="button">🏛️ National licence · ₦220bn</button></div>';
  if(s.lic==='nat')h+='<div class="acts"><button class="ghost" data-bk="int" type="button">🌍 International licence · ₦550bn</button></div>';
  if(s.susp)h+='<p class="note">⚠️ Licence suspended. Add capital until the capital ratio is 10% or more to reopen savings and loans.</p>';
  const others=Object.keys(SAVE.biz).filter(k=>k!=='bank'&&BIZ[k]);
  if(st>=2){const used=s.grp.reduce((a,g)=>a+g.amt,0),each=s.cap*.05,all=s.cap*.1;
    h+='<h2>Loans to your own businesses</h2><p class="note">Same terms as any outside customer: '+(loanM()*100).toFixed(1)+'% a month, 6 months, collateral worth 120% of the loan. At most 5% of capital per business (₦'+short(each)+') and 10% in total (₦'+short(Math.max(0,all-used))+' left). No cheaper rate for family.</p>';
    if(s.grp.length)h+='<table>'+s.grp.map(g=>'<tr><td>'+BIZ[g.k].name+'</td><td>₦'+short(g.amt)+(g.late?' · late '+g.late:'')+'</td></tr>').join('')+'</table>';
    h+='<div class="acts">'+(others.length?others.map(k=>'<button class="ghost" data-gl="'+k+'" type="button">Lend to '+BIZ[k].name+'</button>').join(''):'<span class="note">Open another business first.</span>')+'</div>';}
  return h;}
function bkBind(){if(!isBank())return;const s=S.bk,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#bkl [data-lp]').forEach(b=>b.onclick=()=>{s.loanPct=+b.dataset.lp;re();});
  document.querySelectorAll('#bkt [data-tp]').forEach(b=>b.onclick=()=>{s.tillPct=+b.dataset.tp;re();});
  document.querySelectorAll('#hqin [data-bk]').forEach(b=>b.onclick=()=>{const k=b.dataset.bk;
    if(k==='float')buy(100000,()=>{s.float+=100000;s.floatNow+=100000;});
    if(k==='refill'){s.floatRun=S.day;s.floatNow=Math.max(s.floatNow,s.float);re();}
    if(k==='check'){s.check=!s.check;re();}
    if(k==='addcap')buy(Math.max(1e6,nice(s.cap*.1)),()=>{s.cap+=Math.max(1e6,nice(s.cap*.1)-0);if(s.susp&&capRatio()>=10){s.susp=false;s.thin=0;toast('🏛️ Licence restored.',3);}});
    if(['credit','compliance','custodian','guard'].includes(k)){s[k]++;re();}
    if(k==='nat'){if(nplPct()>5||capRatio()<10){toast('National licence needs bad loans under 5% and capital ratio 10%+.',3);return;}buy(BKR.natCost,()=>{s.cap=Math.max(s.cap,BKR.natCap);s.lic='nat';banner('NATIONAL AND LISTED','PadiTrust is in every state capital.');});}
    if(k==='int'){if(nplPct()>5||capRatio()<15){toast('International licence needs bad loans under 5% and capital ratio 15%+.',3);return;}buy(BKR.intCost,()=>{s.cap=Math.max(s.cap,BKR.intCap);s.lic='int';banner('BRANCHES ABROAD','Nairobi and London open under one green logo.');});}});
  document.querySelectorAll('#hqin [data-gl]').forEach(b=>b.onclick=()=>{const k=b.dataset.gl,o=SAVE.biz[k],used=s.grp.reduce((a,g)=>a+g.amt,0),mine=s.grp.filter(g=>g.k===k).reduce((a,g)=>a+g.amt,0);
    const coll=Math.max(0,(o.spent||0)/1.2-mine),amt=Math.floor(Math.min(s.cap*.05-mine,s.cap*.1-used,coll,s.bills));
    if(lendStop()){toast(lendStop()+'.',3);return;}if(amt<100000){toast('No room: limits are 5% of capital each, 10% in total, collateral 120%, and T-bills to fund it.',4);return;}
    s.bills-=amt;o.money=(o.money||0)+amt;s.grp.push({k,amt,left:6});toast('🏦 Lent ₦'+short(amt)+' to '+BIZ[k].name+' on outside terms.',3);re();});}

/* ----- drawings ----- */
XITEM.bag=(g,a,b)=>{E(g,0,-8,10,9,a);R(g,-4,-19,8,5,2,a);R(g,-5,-16,10,2,1,b);g.fillStyle=b;g.font='900 9px system-ui';g.textAlign='center';g.fillText('₦',0,-5);};
XITEM.card=(g,a,b)=>{R(g,-12,-15,24,15,2.5,a);R(g,-12,-12,24,3,0,'#22252b');R(g,-8,-7,6,4,1,b);R(g,2,-5,7,1.5,0,'rgba(255,255,255,.7)');};
XSTATION.counter=(col)=>{rr(-46,-20,92,26,4,'#2e5d44');rr(-48,-26,96,8,3,'#e9e2d2');rr(-40,-46,80,20,3,'rgba(122,209,255,.45)');rr(-30,-38,26,12,2,'#5b5f66');rr(-27,-36,20,4,1,'#7dff9a');rr(6,-38,24,12,2,col);rr(-44,6,6,10,1,'#22252b');rr(38,6,6,10,1,'#22252b');};
XSTATION.atm=(col)=>{for(let i=-1;i<=1;i++){rr(i*30-12,-44,24,48,4,'#1f8a4c');rr(i*30-9,-40,18,12,2,'#7ad1ff');rr(i*30-7,-24,14,8,1,'#22252b');rr(i*30-6,-12,12,3,1,col);}rr(-48,-50,96,6,3,'#22252b');};
function bkStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(43,22,8,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  if(li===0){ctx.fillStyle='#b9b3a6';ctx.fillRect(x+4,y+4,w-8,h-36);ell(x+w/2,y+60,60,22,'#1f8a4c');ell(x+w/2,y+56,60,16,'#f2c230');rr(x+w/2-3,y+60,6,80,2,'#5b5f66');rr(x+w/2-34,y+130,68,12,3,'#e9e2d2');rr(x+w/2-8,y+118,16,12,2,'#2e8b3d');rr(x+12,y+150,40,10,2,'#3a6fb0');T('POS UMBRELLA');}
  else if(li===1){ctx.fillStyle='#e9e2d2';ctx.fillRect(x+6,y+6,w-12,h-40);ctx.fillStyle='rgba(0,0,0,.08)';for(let k=0;k<6;k++)ctx.fillRect(x+6,y+20+k*28,w-12,2);rr(x+14,y+16,w-28,18,3,'#2e5d44');for(let k=0;k<3;k++)rr(x+20+k*((w-60)/3),y+70,30,40,3,'#c9a15a');T('BANKING HALL');}
  else if(li===2){ctx.fillStyle='#c4c2bc';ctx.fillRect(x+6,y+6,w-12,h-40);rr(x+10,y+10,w-20,14,4,'rgba(122,209,255,.6)');for(let k=0;k<3;k++){rr(x+18+k*((w-50)/3),y+34,26,56,4,'#1f8a4c');rr(x+22+k*((w-50)/3),y+40,18,12,2,'#7ad1ff');}T('ATM GALLERY');}
  else if(li===3){ctx.fillStyle='#5b5f66';ctx.fillRect(x+6,y+6,w-12,h-40);ell(x+w/2,y+80,56,56,'#8a9096');ell(x+w/2,y+80,46,46,'#3a3f46');ctx.strokeStyle='#f2c230';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+w/2-26,y+80);ctx.lineTo(x+w/2+26,y+80);ctx.moveTo(x+w/2,y+54);ctx.lineTo(x+w/2,y+106);ctx.stroke();ell(x+w/2,y+80,9,9,'#f2c230');T('VAULT');}
  else{ctx.fillStyle='#6aa23e';ctx.fillRect(x+6,y+6,w-12,h-40);rr(x+18,y+10,w-36,120,4,'#2a3d5a');for(let r=0;r<4;r++)for(let k=0;k<4;k++)rr(x+28+k*((w-70)/4),y+20+r*26,14,16,2,'rgba(122,209,255,.75)');rr(x+14,y+6,w-28,10,3,'#1f8a4c');T('HEAD OFFICE');}}

BIZ.bank={name:'PadiTrust Bank',tag:'POS to national bank',tone:'#1f8a4c',field:'bank',isNew:true,qf:300,
  owner:{cloth:'#1b2a4a',trim:'#f2c230',hat:'none',gender:'f'},
  hand:'Vault custodian',cook:'teller',seller:'customer care officer',
  outfit:{hand:{cloth:'#6b6f76',trim:'#f4f1ea',hat:'none',gender:'f'},cook:{cloth:'#1f8a4c',trim:'#f4f1ea',hat:'none'},server:{cloth:'#2e8b3d',trim:'#f2c230',hat:'gele',gender:'f'},cashier:{cloth:'#1b2a4a',trim:'#1f8a4c',hat:'none'},porter:{cloth:'#22305a',trim:'#f2c230',hat:'cap'}},
  venue:['Umbrella and one POS','The Agent Shop','Licence on the Wall','Bank for the Whole State','Regional commercial bank'],
  // Research stage startup costs: agent shop N2.5m, unit MFB N60m (incl. N50m capital), state MFB N1.2bn (N1bn capital),
  // regional N55bn (N50bn capital). Line costs are estimates (no research figure): card printer and core banking N5m,
  // loan desk N10m, corporate banking suite N2bn.
  costs:{venue:[2500000,60000000,1200000000,55000000000],line:[null,5000000,10000000,2000000000]},
  lines:[
   Object.assign(L('Cash In and Cash Out','Cash','#2e8b3d',200,'fee per ₦10,000','field',['bag','#c9a15a','#1f5d34'],['cash','#2e8b3d','#f2c230'],'counter'),{w:10,qx:3}),
   Object.assign(L('Transfers and Bills','Transfers','#2a62c9',50,'transfer fee','field',['cash','#2a62c9','#dfe7ec'],['doc','#e7f1fb','#2a62c9'],'desk'),{w:8,qx:3}),
   Object.assign(L('Savings and ATM Cards','Savings','#f2c230',1000,'ATM card','field',['bag','#f2c230','#1b2a4a'],['card','#1f8a4c','#f2c230'],'atm'),{w:3,qx:1}),
   Object.assign(L('Small Business Loans','Loans','#c62828',15000,'month of interest, ₦500,000 loan','field',['bag','#c62828','#f4f1ea'],['doc','#fff7d6','#c62828'],'desk'),{w:1.2,qx:1}),
   Object.assign(L('Corporate Loans','Corporate','#1b2a4a',250000,'month of interest, ₦10m loan','field',['carton','#5b5f66','#1b2a4a'],['doc','#f4f1ea','#1b2a4a'],'counter'),{w:.4,qx:1})]};
BIZX.bank={demand:bkDemand,lineW:bkLineW,sale:bkSale,gate:bkGate,html:bkHtml,bind:bkBind,night:bkNight,month:bkMonth,crew:bkCrew,
  strip:bkStrip,base:'#8f9a8c',floor:['#c9b89a','#d6cfc0','#e4dccb','#ece8de','#eef0ee'],locked(){return null;}};
