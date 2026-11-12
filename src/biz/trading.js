/* ===== Blue Ticker Trading House: research rules from plan3/trading.json on top of the shop engine =====
   Game money only. Nothing here is trading advice and no return is promised. All companies and tickers are invented.
   Client fees come first (paid win or lose), settle T+1, and pay the salaries. The firm's own book is a small, capped
   side line with a forced stop-loss. Licence capital sits locked in the vault and earns bill interest. Prices, the
   dollar rate and clues change once a game week. */
const TRDR={fx0:1460, // naira per dollar, same base the game uses for the dollar elsewhere (estimate)
  fee:{share:1.35,loyal:.75}, // % commission on shares; 5-star loyal clients pay 0.75% (research)
  loyalShare:.3, // share of share tickets from big loyal clients once you have 5 stars (estimate)
  need:[600000000,1000000000,2000000000], // SEC Nigeria Jan 2026 capital: broker, dealer, broker-dealer
  vaultMo:.154/12,billMo:.158/12,billBreak:.02, // 91-day bill 15.40%, 364-day bill 15.80% a year; break early lose 2% (storyline)
  failFee:10000, // redo cost of a failed ticket (research)
  failBase:.04,failClerk:.01,failMin:.01,failAuto:.005, // failed-ticket chances: base 4%, -1% per clerk, min 1% (estimates); engine 1 in 200 (plan)
  run:{tech:.12,exch:.08,office:.10,comp:.06,admin:.06}, // research cost structure, % of fee revenue (staff 38% is the payroll)
  side:.0075, // SEC/NGX/CSCS fees per side on own-book trades: (4.0-4.5% round trip - 2 x 1.35%) / 2 from the storyline research
  cap:.10,one:.02,stop:.08, // own book: 10% of free cash in all, 2% in one name, auto-close at -8% (research)
  missing:.03, // share of client files missing papers with no compliance officer (estimate); over 2% means a fine
  fine:.02,pause:3,trustDays:14,review:7,under:5,
  breach:.25, // weekly chance a dealer tries to double a losing position (estimate)
  pay:{clerk:250000,analyst:400000,comp:550000,risk:1500000}, // storyline monthly salaries
  co:[['AKARA','Akara Foods',100,['Akara Foods opens two new bean mills','Bean prices jump and squeeze Akara Foods']],
      ['MANGO','Mango Tree Bank',45,['Mango Tree Bank reports many new savers','Mango Tree Bank sets aside more for bad loans']],
      ['BRICK','Red Brick Cement',260,['Road building season lifts cement orders','Heavy rains slow building sites']],
      ['LAGPW','Lagoon Power',12,['Lagoon Power fixes its big turbine','A gas supply cut hits Lagoon Power']],
      ['TALKA','Talkabout Telecom',30,['Talkabout Telecom adds a million subscribers','Tower repairs cost Talkabout Telecom more']]]};
const isTrd=()=>SAVE.cur==='trading'&&B&&B.isNew;
function trdState(){const s=S.trd=S.trd||{};const d={wk:-1,fx:TRDR.fx0,px:TRDR.co.map(c=>c[2]),prev:TRDR.co.map(c=>c[2]),clues:[],idx:0,
    stars:3,clean:0,tk:0,fails:0,dtk:0,dfail:0,today:0,pend:0,trustTo:0,pauseTo:0,
    vault:0,under:0,susp:false,reviewAt:0,bills:0,clerks:0,comp:0,analyst:0,risk:0,riskSince:0,lastBreach:0,breachOff:0,
    pos:[],recap:null,insp:null,cleanInsp:0,mo:{rev:0,cost:0},day:{},hist:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));if(s.wk<0)trdWeek(true);return s;}
const trdNeed=()=>lvl('line3')?TRDR.need[2]:stage()>=2?TRDR.need[1]:lvl('line2')?TRDR.need[0]:0;
const trdBook=()=>{const s=S.trd;return s.pos.reduce((a,p)=>a+p.u*s.px[p.k],0);};
const trdFree=()=>Math.max(0,S.money)+trdBook(); // free cash: excludes the locked vault, bills and unsettled fees
const trdCost=(n,k)=>{const s=S.trd;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const trdFailP=()=>{const s=S.trd;return S.emp&&S.emp.auto?TRDR.failAuto:Math.max(TRDR.failMin,TRDR.failBase-TRDR.failClerk*s.clerks);};
const trdBookOpen=()=>{const s=S.trd,n=trdNeed();return stage()>=2&&!s.susp&&n>0&&s.vault>=n*1.2;};
const trdBookWhy=()=>{const s=S.trd,n=trdNeed();if(stage()<2)return'Own book opens with the dealer licence (dealing room stage).';if(s.susp)return'Licence suspended: own book closed.';if(s.vault<n*1.2)return'Vault under 120% of the licence line (₦'+short(n*1.2)+'): own book frozen.';return'';};

/* ----- the week: prices move on last week's clues, stop-losses, new clues, the dollar rate ----- */
function trdWeek(first){const s=S.trd;s.wk=Math.floor(S.day/7);
  if(!first){const mv=TRDR.co.map(()=>(Math.random()*2-1));
    for(const c of s.clues)mv[c.k]+=(c.up?1:-1)*(1+Math.random()*2); // each clue moves its company 1-3% the way it points
    s.prev=s.px.slice();let sum=0;s.px=s.px.map((p,k)=>{const m=Math.max(-10,Math.min(10,mv[k]));sum+=m;return Math.max(1,+(p*(1+m/100)).toFixed(2));});s.idx=sum/5;
    s.fx=Math.round(TRDR.fx0*(.97+Math.random()*.06)); // dollar rate set for the week (estimate band)
    // forced stop-loss at -8% from entry, no override
    for(const p of s.pos.slice())if(s.px[p.k]<=p.e*(1-TRDR.stop))trdClose(p,'Stop-loss at -8% closed it automatically.');
    // a dealer wants to double a losing position: the Head of Risk blocks it
    const losing=s.pos.find(p=>s.px[p.k]<p.e);
    if(losing&&S.day>=s.breachOff&&Math.random()<TRDR.breach){if(s.risk){s.breachOff=S.day+30;toast('🛡️ A dealer wanted to double a losing '+TRDR.co[losing.k][0]+' trade. Your Head of Risk said no.',4);}
      else{const l=Math.round(trdFree()*.01);trdCost(l,'breach');s.lastBreach=S.day;s.recap={t:TRDR.co[losing.k][0]+' risk breach',e:losing.e,x:s.px[losing.k],loss:l,pct:1,why:'A dealer doubled a losing position past the 2% cap. A Head of Risk would have blocked it.',fee:s.today};toast('⚠️ Risk breach: a dealer doubled a losing trade. Loss ₦'+short(l)+'. Hire a Head of Risk.',5);}}}
  s.clues=[0,1,2].map(()=>{const k=Math.floor(Math.random()*5),up=Math.random()<.5;return{k,up,t:TRDR.co[k][3][up?0:1]};});}
function trdClose(p,why){const s=S.trd,x=s.px[p.k],val=p.u*x,fee=Math.round(val*TRDR.side);S.money+=val-fee;s.mo.cost+=fee;s.pos.splice(s.pos.indexOf(p),1);
  const pl=val-fee-p.c;if(pl<0){const cl=s.clues.filter(c=>c.k===p.k);s.recap={t:TRDR.co[p.k][0],e:p.e,x,loss:Math.round(-pl),pct:+(-pl/Math.max(1,trdFree())*100).toFixed(2),
    why:(why?why+' ':'')+(cl.length?'Clue read: "'+cl[0].t+'" pointed '+(cl[0].up?'up':'down')+'.':'No clue named this company: the price moved on general noise.'),fee:s.today};}
  return pl;}

/* ----- clients ----- */
function trdDemand(){const s=trdState();return(.7+.1*s.stars)*(S.day<s.trustTo?.6:1)*(S.day<s.pauseTo?.3:1);}
function trdLineW(i){const s=trdState();if(i===1)return s.idx<-3?.7:s.idx>3?1.3:1; // red or green week changes share orders (estimate)
  return 1;}
function trdSale(i,c,q,amt){const s=trdState();
  if(i===0)amt=Math.round(amt*s.fx/TRDR.fx0); // currency margin follows the week's dollar rate, inside the CBN 1% cap
  if(i===1&&s.stars>=5){let a=0;for(let k=0;k<q;k++)a+=amt/q*(Math.random()<TRDR.loyalShare?TRDR.fee.loyal/TRDR.fee.share:1);amt=Math.round(a);}
  if(s.susp)amt=Math.round(amt/2); // suspended: orders go through a sponsor at half fees
  let f=0;for(let k=0;k<q;k++)if(Math.random()<trdFailP())f++;
  if(f)trdCost(f*TRDR.failFee,'fail');s.tk+=q;s.fails+=f;s.dtk+=q;s.dfail+=f;s.today+=amt;s.mo.rev+=amt;return amt;}

/* ----- nights: T+1 settlement, running costs, stars, the vault, inspections ----- */
function trdNight(){if(!isTrd())return[];const s=trdState(),rows=[];
  // today's fees wait one day; yesterday's settle now
  S.money-=s.today;const set=s.pend;s.pend=s.today;s.today=0;
  if(set){S.money+=set;rows.push(['Yesterday\'s fees settled (T+1)','₦'+fmt(set),'#b9ffcf']);
    const R=TRDR.run,run=Math.round(set*(R.tech+R.exch+R.office+R.comp+R.admin));trdCost(run,'run');}
  if(s.pend)rows.push(['Today\'s fees, settle tomorrow','₦'+fmt(s.pend),'#cfe3ff']);
  // star rating: 98% clean days build it, a bad week cuts it
  if(s.dtk){if(s.dfail/s.dtk<=.02){s.clean++;if(s.clean>=30)s.stars=5;else if(s.clean%10===0&&s.stars<4)s.stars++;}else s.clean=0;}
  s.dtk=0;s.dfail=0;
  if(S.day%7===0){if(s.tk&&s.fails/s.tk>.05){s.stars=Math.max(1,s.stars-2);s.trustTo=S.day+TRDR.trustDays;s.clean=0;toast('📉 Over 5% of tickets failed this week. Rating down 2 stars; fewer clients for 14 days.',5);}s.tk=0;s.fails=0;}
  // licence capital
  const n=trdNeed();if(n&&s.vault<n){s.under++;if(s.under>=TRDR.under&&!s.susp){s.susp=true;s.reviewAt=0;for(const p of s.pos.slice())trdClose(p,'Licence suspended.');toast('🔒 Vault under the licence minimum for 5 days. Licence suspended: half fees via a sponsor, own book closed.',6);}}
  else{s.under=0;if(s.susp){if(!s.reviewAt)s.reviewAt=S.day+TRDR.review;if(S.day>=s.reviewAt){s.susp=false;s.reviewAt=0;toast('✅ Regulator review done. Licence restored.',4);}}}
  if(evx('speed_up')&&(!s.insp||s.insp.day!==S.day))trdInspect();
  const D=s.day;if(D.run)rows.push(['Tech, exchange fees, office, audit, admin (42%)','-₦'+fmt(D.run),'#ffb3a3']);if(D.fail)rows.push(['Failed tickets redone (₦10,000 each)','-₦'+fmt(D.fail),'#ffb3a3']);
  if(D.fine)rows.push(['Compliance fine','-₦'+fmt(D.fine),'#ffb3a3']);if(D.breach)rows.push(['Risk breach loss','-₦'+fmt(D.breach),'#ffb3a3']);
  s.day={};if(Math.floor((S.day+1)/7)!==s.wk)trdWeek(false);return rows;}
function trdInspect(){const s=S.trd,miss=s.comp?0:TRDR.missing;s.insp={day:S.day,miss};
  if(miss>.02){const f=Math.round(S.mo.rev*TRDR.fine);trdCost(f,'fine');s.pauseTo=S.day+TRDR.pause;s.cleanInsp=0;toast('📋 Regulator found '+Math.round(miss*100)+'% of files missing ID papers. Fine ₦'+short(f)+'; new clients paused 3 days.',5);}
  else{s.cleanInsp++;toast('📋 Regulator checked every client file: none missing.',4);}}
function trdMonth(M){if(!isTrd())return{rows:[],cost:0,or:0};const s=trdState(),rows=[];
  const vi=Math.round(s.vault*TRDR.vaultMo),bi=Math.round(s.bills*TRDR.billMo);
  if(vi){S.money+=vi;rows.push(['Vault interest (15.4% a year)','₦'+fmt(vi),'#b9ffcf']);}if(bi){S.money+=bi;rows.push(['Treasury bill interest (15.8% a year)','₦'+fmt(bi),'#b9ffcf']);}
  if(Math.random()<.25)trdInspect(); // routine regulator visit (estimate: 1 month in 4)
  const r=s.mo.rev,cost=s.mo.cost-vi-bi;s.mo={rev:0,cost:0};const or=r?Math.round((cost+vi+bi+M.wages)/r*100):0;if(r){s.hist.push(or);if(s.hist.length>24)s.hist.shift();}
  return{rows,cost,or};}
function trdCrew(){if(!isTrd()||!S.trd)return[];const s=S.trd,P=TRDR.pay,r=[];
  if(s.clerks)r.push({name:'Settlement clerks',n:s.clerks,each:P.clerk});if(s.analyst)r.push({name:'Research analyst',n:1,each:P.analyst});
  if(s.comp)r.push({name:'Compliance officer',n:1,each:P.comp});if(s.risk)r.push({name:'Head of Risk',n:1,each:P.risk});return r;}

/* ----- licence ladder ----- */
function trdGate(st){const s=trdState(),v=s.vault;
  if(st.base==='line'&&st.arg===2){if(!s.comp)return'🔒 Broker licence: hire a compliance officer first (HQ).';if(v<TRDR.need[0])return'🔒 Broker licence: lock ₦600M capital in the vault (HQ). Now ₦'+short(v)+'.';}
  if(st.base==='venue'&&st.n===2&&v<TRDR.need[1])return'🔒 Dealer licence: vault capital must reach ₦1B (now ₦'+short(v)+').';
  if(st.base==='line'&&st.arg===3){if(v<TRDR.need[2])return'🔒 Broker-dealer licence: vault capital must reach ₦2B (now ₦'+short(v)+').';if(s.stars<5)return'🔒 Broker-dealer licence needs a 5-star settlement rating (now '+s.stars+').';}
  if(st.base==='venue'&&st.n===3){if(!s.risk)return'🔒 Abuja office: hire a Head of Risk first (HQ).';if(!s.cleanInsp)return'🔒 Abuja office: pass a regulator audit with zero missing client files.';}
  if(st.base==='line'&&st.arg===4&&!s.risk)return'🔒 Johannesburg desk shares one group risk limit: hire a Head of Risk first.';
  if(st.base==='venue'&&st.n===4){const d=s.risk?S.day-Math.max(s.riskSince,s.lastBreach):0;if(d<24*MONTH)return'🔒 Global licences need 24 months with no risk breach ('+Math.floor(Math.max(0,d)/MONTH)+' so far).';}
  return null;}

/* ----- HQ ----- */
function trdHtml(){const s=trdState(),n=trdNeed(),star='★'.repeat(s.stars)+'☆'.repeat(5-s.stars);
  let h='<h2>Settlement desk</h2><p class="note">Game money only. Not investment advice. Every client ticket pays its fee win or lose, and settles one day later (T+1).</p>';
  h+='<div class="stats"><div class="stat">Client rating<b>'+star+'</b></div><div class="stat">Clean days in a row<b>'+s.clean+'</b></div><div class="stat">Failed this week<b>'+s.fails+' of '+s.tk+'</b></div><div class="stat">Fees waiting T+1<b>₦'+fmt(s.today+s.pend)+'</b></div></div>';
  h+='<p class="note">Failed ticket chance now '+(trdFailP()*100).toFixed(1)+'%. Each one is redone for ₦10,000. A day at 98%+ clean counts as clean: 10 clean days add a star, 30 give 5 stars. Over 5% failed in a week costs 2 stars and 40% of clients for 14 days.</p>';
  h+='<div class="acts"><button class="ghost" data-tr="clerk" type="button">🧾 Hire settlement clerk · ₦250k a month ('+s.clerks+')</button>'+(s.comp?'':'<button class="ghost" data-tr="comp" type="button">📁 Hire compliance officer · ₦550k a month</button>')+'</div>';
  h+='<h2>Capital vault</h2><div class="stats"><div class="stat">Locked capital<b>₦'+fmt(s.vault)+'</b></div><div class="stat">Licence line<b>'+(n?'₦'+short(n):'none yet')+'</b></div><div class="stat">120% warning line<b>'+(n?'₦'+short(n*1.2):'-')+'</b></div><div class="stat">Status<b>'+(s.susp?'Suspended':n&&s.vault<n?'Below line ('+s.under+'/5 days)':n&&s.vault<n*1.2?'Thin':'Safe')+'</b></div></div>';
  h+='<p class="note">Licence capital: ₦600M broker, ₦1B dealer, ₦2B broker-dealer. It cannot be spent or traded, and earns 15.4% a year (paid on payday). Under the line for 5 days suspends the licence; a top-up then takes a 7-day review.</p>';
  h+='<div class="acts"><button class="ghost" data-tr="v100" type="button">🔐 Lock ₦100M</button><button class="ghost" data-tr="v1b" type="button">🔐 Lock ₦1B</button>'+(n>s.vault?'<button class="ghost" data-tr="vneed" type="button">🔐 Lock the shortfall · ₦'+short(n-s.vault)+'</button>':'')+(s.vault>n?'<button class="ghost" data-tr="vout" type="button">Release ₦'+short(s.vault-n)+' above the line</button>':'')+'</div>';
  if(lvl('line2'))h+='<h2>Patience shelf</h2><p class="note">Idle cash in 364-day treasury bills earns 15.8% a year, paid monthly. Breaking them early costs 2%. In bills: ₦'+fmt(s.bills)+'.</p><div class="acts"><button class="ghost" data-tr="b10" type="button">Buy ₦10M bills</button><button class="ghost" data-tr="b100" type="button">Buy ₦100M bills</button>'+(s.bills?'<button class="ghost" data-tr="bout" type="button">Break bills · lose ₦'+short(Math.round(s.bills*TRDR.billBreak))+'</button>':'')+'</div>';
  h+='<h2>Market board · week '+(s.wk+1)+'</h2><table><tr><td><b>Ticker</b></td><td><b>Price · week</b></td></tr>'+TRDR.co.map((c,k)=>{const ch=(s.px[k]/s.prev[k]-1)*100;return'<tr><td>'+c[0]+' <small>'+c[1]+'</small></td><td>₦'+s.px[k].toFixed(2)+' · <span style="color:'+(ch>=0?'#1f8a4c':'#c62828')+'">'+(ch>=0?'+':'')+ch.toFixed(1)+'%</span></td></tr>';}).join('')+'</table>';
  h+='<p class="note">Invented companies. Dollar rate this week: ₦'+fmt(s.fx)+'. Prices move once a week, never more than 10%.</p>';
  h+='<h2>Analyst clues for next week</h2>'+(s.analyst?'':'<p class="note">Without an analyst you see one clue of three.</p>')+'<table>'+s.clues.slice(0,s.analyst?3:1).map(c=>'<tr><td>📰 '+c.t+'</td></tr>').join('')+'</table>'+(s.analyst?'':'<div class="acts"><button class="ghost" data-tr="analyst" type="button">🔎 Hire research analyst · ₦400k a month</button></div>');
  if(stage()>=2){const F=trdFree(),bk=trdBook(),why=trdBookWhy();
    h+='<h2>Own book (small, capped)</h2><div class="stats"><div class="stat">Free cash<b>₦'+short(F)+'</b></div><div class="stat">In positions<b>₦'+short(bk)+' / ₦'+short(F*TRDR.cap)+'</b></div><div class="stat">Per name cap<b>₦'+short(F*TRDR.one)+'</b></div><div class="stat">Head of Risk<b>'+(s.risk?'Yes':'No')+'</b></div></div>';
    h+='<p class="note">Up to 10% of free cash in all, 2% in one name, own cash only (no borrowing). Down 8% closes by itself at the next weekly price. Exchange fees '+(TRDR.side*100).toFixed(2)+'% each way.'+(why?' ⚠️ '+why:'')+'</p>';
    if(s.recap){const r=s.recap;h+='<h2>Loss recap · read before the next trade</h2><p class="note">'+r.t+': in at ₦'+(+r.e).toFixed(2)+', out at ₦'+(+r.x).toFixed(2)+'. Loss ₦'+fmt(r.loss)+' ('+r.pct+'% of free cash). '+r.why+' Client fees booked today: ₦'+fmt(r.fee)+'.</p><div class="acts"><button class="ghost" data-tr="read" type="button">I have read it</button></div>';}
    else{h+='<table>'+TRDR.co.map((c,k)=>{const p=s.pos.find(x=>x.k===k);return'<tr><td>'+c[0]+(p?' · in at ₦'+p.e.toFixed(2)+', stop ₦'+(p.e*(1-TRDR.stop)).toFixed(2):'')+'</td><td>'+(p?'<button class="ghost" data-tr="sell'+k+'" type="button">Sell ₦'+short(Math.round(p.u*s.px[k]))+'</button>':(why?'-':'<button class="ghost" data-tr="buy'+k+'" type="button">Buy up to 2%</button>'))+'</td></tr>';}).join('')+'</table>';}
    if(!s.risk)h+='<div class="acts"><button class="ghost" data-tr="risk" type="button">🛡️ Hire Head of Risk · ₦1.5M a month</button></div>';}
  else if(!s.risk&&lvl('line2'))h+='<div class="acts"><button class="ghost" data-tr="risk" type="button">🛡️ Hire Head of Risk · ₦1.5M a month</button></div>';
  if(s.insp)h+='<p class="note">Last regulator visit: day '+s.insp.day+', '+Math.round(s.insp.miss*100)+'% of files missing papers. Clean audits: '+s.cleanInsp+'.</p>';
  return h;}
function trdBind(){if(!isTrd())return;const s=S.trd,re=()=>{save();hqRender();},no=n=>{toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);};
  document.querySelectorAll('#hqin [data-tr]').forEach(b=>b.onclick=()=>{const k=b.dataset.tr,n=trdNeed();
    const lock=a=>{if(a<=0)return;if(S.money<a)return no(a);S.money-=a;s.vault+=a;fanfare(false);re();};
    if(k==='v100')lock(1e8);if(k==='v1b')lock(1e9);if(k==='vneed')lock(n-s.vault);if(k==='vout'&&s.vault>n){S.money+=s.vault-n;s.vault=n;re();}
    if(k==='b10'||k==='b100'){const a=k==='b10'?1e7:1e8;if(S.money<a)return no(a);S.money-=a;s.bills+=a;re();}
    if(k==='bout'){const l=Math.round(s.bills*TRDR.billBreak);S.money+=s.bills-l;s.mo.cost+=l;s.bills=0;re();}
    if(k==='clerk'){s.clerks++;re();}if(k==='comp'){s.comp=1;re();}if(k==='analyst'){s.analyst=1;re();}if(k==='risk'){s.risk=1;s.riskSince=S.day;re();}
    if(k==='read'){s.recap=null;re();}
    if(k.startsWith('buy')){const i=+k.slice(3);if(s.recap||!trdBookOpen())return;const F=trdFree(),room=Math.min(F*TRDR.one,F*TRDR.cap-trdBook());
      const a=Math.floor(Math.min(room,S.money)/(1+TRDR.side));if(a<1000){toast('Refused: the 10% book cap is full.',3);return;}
      const fee=Math.round(a*TRDR.side);S.money-=a+fee;s.mo.cost+=fee;s.pos.push({k:i,u:a/s.px[i],e:s.px[i],c:a+fee});beep(660,.08,'square',.03);re();}
    if(k.startsWith('sell')){const i=+k.slice(4),p=s.pos.find(x=>x.k===i);if(p){const pl=trdClose(p,'');toast((pl>=0?'Closed with ₦'+short(Math.round(pl))+' profit.':'Closed with a ₦'+short(Math.round(-pl))+' loss.'),3);re();}}});}

/* ----- drawings: order ticket, dealing desk with screens, and the trading house map ----- */
XITEM.ticket=(g,a,b)=>{R(g,-9,-15,18,15,1.5,'#fffaf0');R(g,-9,-15,18,4,1,a);for(let i=0;i<3;i++)R(g,-6,-8+i*2.6,12-(i%2)*4,1,0,'#9aa0a6');E(g,5,-3,2.4,2.4,b||'#1f8a4c');};
XSTATION.dealdesk=col=>{rr(-46,-22,92,26,4,'#2b3a55');rr(-48,-28,96,8,3,'#41557a');
  for(const x of[-38,2]){rr(x,-50,36,24,3,'#14181f');rr(x+3,-47,30,18,2,'#0f2a3d');ctx.strokeStyle=x<0?'#3ddc84':'#ff6b6b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+5,-33);ctx.lineTo(x+13,-40);ctx.lineTo(x+20,-36);ctx.lineTo(x+31,-44);ctx.stroke();rr(x+15,-26,6,4,1,'#41557a');}
  rr(-8,-20,16,6,2,col);ctx.fillStyle='#1b2333';ctx.fillRect(-42,4,6,14);ctx.fillRect(36,4,6,14);};
function trdStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=(t,yy)=>{ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,yy);};
  if(li===0){ctx.fillStyle='#d9d2c3';ctx.fillRect(x+4,y+4,w-8,h-8);ctx.fillStyle='rgba(0,0,0,.06)';for(let k=x+4;k<x+w-4;k+=30)ctx.fillRect(k,y+4,1.5,h-8);
    rr(x+14,y+14,w-28,64,6,'#1b2333');ctx.font='900 12px Nunito,system-ui';ctx.textAlign='left';[['USD','#3ddc84'],['GBP','#ffd659'],['EUR','#7ad1ff']].forEach((r,k)=>{ctx.fillStyle=r[1];ctx.fillText(r[0]+'  BUY  SELL',x+24,y+34+k*17);});
    rr(x+12,y+100,w-24,36,4,'#7a4f30');rr(x+16,y+90,w-32,12,3,'rgba(190,230,255,.7)');ctx.fillStyle='rgba(43,22,8,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('BUREAU DE CHANGE',x+w/2,y+h-16);return;}
  if(li<=2){ctx.fillStyle='#24324d';ctx.fillRect(x+4,y+4,w-8,h-8);rr(x+12,y+12,w-24,74,5,'#0d1118');ctx.font='900 11px Nunito,system-ui';ctx.textAlign='left';
    const rows=li===1?[['AKARA','+2.1'],['MANGO','-0.8'],['BRICK','+1.4'],['TALKA','-1.9']]:[['91-DAY','15.40'],['182-DAY','15.79'],['364-DAY','15.80'],['LAGPW','+0.6']];
    rows.forEach((r,k)=>{const up=r[1][0]!=='-';ctx.fillStyle='#ffd659';ctx.fillText(r[0],x+20,y+28+k*15);ctx.fillStyle=up?'#3ddc84':'#ff6b6b';ctx.textAlign='right';ctx.fillText(r[1],x+w-20,y+28+k*15);ctx.textAlign='left';});
    for(let k=0;k<3;k++){rr(x+16+k*((w-32)/3),y+104,(w-32)/3-8,22,3,'#41557a');rr(x+22+k*((w-32)/3),y+96,16,10,2,'#14181f');}
    T(li===1?'TRADING FLOOR':'MONEY MARKET DESK',y+h-16);return;}
  if(li===3){ctx.fillStyle='#e8dcc2';ctx.fillRect(x+4,y+4,w-8,h-8);rr(x+12,y+12,w-24,70,4,'#6b4423');
    for(let r=0;r<3;r++)for(let k=0;k<7;k++)rr(x+18+k*((w-36)/7),y+16+r*22,(w-36)/7-3,18,1,['#1e5bd8','#c62828','#1f8a4c','#f2c230'][(k+r)%4]);
    rr(x+w/2-40,y+100,80,30,6,'#8a5a2a');rr(x+w/2-30,y+94,22,14,1,'#fffaf0');rr(x+w/2+6,y+94,22,14,1,'#fffaf0');ctx.fillStyle='rgba(43,22,8,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('RESEARCH ROOM',x+w/2,y+h-16);return;}
  ctx.fillStyle='#4a4f58';ctx.fillRect(x+4,y+4,w-8,h-8);rr(x+w/2-50,y+14,100,90,10,'#9aa0a6');ell(x+w/2,y+59,30,30,'#6b7684');ell(x+w/2,y+59,10,10,'#c9ced6');
  for(let k=0;k<4;k++)rr(x+16+k*18,y+116,16,8,1,'#f2c230');rr(x+w-70,y+110,22,18,4,'#8a6a3a');rr(x+w-44,y+110,22,18,4,'#8a6a3a');T('VAULT AND COMMODITIES',y+h-16);}

/* ===== business entry ===== */
BIZ.trading={name:'Blue Ticker Trading House',tag:'Currency counter to trading floors',tone:'#1e5bd8',field:'trading',isNew:true,qf:300,
  owner:{cloth:'#1f2a4d',trim:'#7ad1ff',hat:'none',gender:'f'},
  hand:'Ticket runner',cook:'dealer',seller:'client desk officer',
  outfit:{hand:{cloth:'#1e5bd8',trim:'#f4f1ea',hat:'cap'},cook:{cloth:'#1e5bd8',trim:'#f4f1ea',hat:'none'},server:{cloth:'#7ad1ff',trim:'#1f2a4d',hat:'none',gender:'f'},
    cashier:{cloth:'#f4f1ea',trim:'#1f2a4d',hat:'none',gender:'f'},porter:{cloth:'#41557a',trim:'#f2c230',hat:'cap'}},
  venue:['Counter in Aunty\'s bureau, Lagos Island','Two-desk office upstairs','Dealing room with price wall','Marina floor and Abuja office','Five-city trading house'],
  // Research stage costs (plan3 stages): Apprentice N15m; Licence N680m = N80m spend + N600m locked in the vault;
  // First Red Day N520m = N120m + capital raised to N1bn; Trading Floor N1.6bn = N600m + capital raised to N2bn;
  // Abuja N350m; Johannesburg N2.5bn; Sun Never Sets N12bn. Locked capital is kept by the player, not spent.
  // The share desk (line 1) opens with stage 2 with no separate figure, so the engine prices it.
  costs:{venue:[15000000,120000000,350000000,12000000000],line:[null,80000000,600000000,2500000000]},
  lines:[ // fees per ticket from plan2/trading.json product lines
   Object.assign(L('Currency Exchange','Currency','#1f8a4c',5000,'$500 exchange margin','field',['cash','#0e7a3c','#36b36a'],['ticket','#1f8a4c','#ffd659'],'desk'),{w:10,qx:2}),
   Object.assign(L('Share Trades','Shares','#1e5bd8',6750,'1.35% on N500k order','field',['ticket','#1e5bd8','#3ddc84'],['doc','#e7f1fb','#1e5bd8'],'dealdesk'),{w:6,qx:2}),
   Object.assign(L('Treasury Bills','T-bills','#7a5af0',12500,'0.125% on N10m bid','field',['ticket','#7a5af0','#f2c230'],['doc','#f1ecff','#7a5af0'],'dealdesk'),{w:2.5,qx:2}),
   Object.assign(L('Bonds','Bonds','#c62828',50000,'0.1% on N50m bond','field',['ticket','#c62828','#1f2a4d'],['doc','#fdeaea','#c62828'],'dealdesk'),{w:1,qx:1}),
   Object.assign(L('Commodity Contracts','Commodities','#c99a1a',150000,'0.5% on N30m contract','field',['sack','#c9a15a','#6b4423'],['doc','#fff4d6','#c99a1a'],'scale'),{w:.5,qx:1})]};
BIZX.trading={demand:trdDemand,lineW:trdLineW,sale:trdSale,gate:trdGate,html:trdHtml,bind:trdBind,night:trdNight,month:trdMonth,crew:trdCrew,
  strip:trdStrip,base:'#24324d',floor:['#d6cdb8','#cfd3d8','#b9c4d4','#aab8cc','#dfe5ee'],locked:()=>null};
