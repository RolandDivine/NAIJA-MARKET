/* ===== Kolanut Crown Capital: research rules from plan3/ibank.json on top of the shop engine =====
   Clients bring files; the player carries them to desks. Starter packs pay on the spot. Bigger lines are mandates:
   pitch (win chance), a 10% retainer, deal-team work days, regulator review (IPO and bond), a 3-day order book, then
   the success fee at close, scaled by coverage. Licence capital is held aside, never spent. All money is game money. */
const IBR={
  rate:[0,.025,.015,.01,0],            // success fee rates: raise 2.5%, IPO 1.5%, bond 1%; merger uses the scale below
  need:[0,2,8,6,10],base:[0,10,30,24,40], // work points and base days: raise, IPO, bond, merger
  rivals:[0,0,1,2,2],                  // estimate: rival houses pitching per line
  pay:{front:180000,analyst:400000,associate:850000,compliance:1100000,vp:1800000,fund:2200000,md:4500000},
  run:.31,                             // offices 12% + legal and compliance 7% + travel 6% + admin 6% of fee income
  adv:2e9,uw:7e9,fund:2e9,fundBig:5e9, // SEC Nigeria minimum capital
  pitchBook:250000,                    // estimate: cost of one pitch book
  stop:5000000,                        // estimate: cost of one roadshow stop
  amFloor:500000000,                   // stage 7: N5.5bn, of which N5bn is fund capital held aside (estimate split)
  names:['Starter pack','Fund raise','IPO','Bond','Merger']};
const ibState=()=>{const s=S.kc=S.kc||{};const d={rep:1,capital:0,happy:0,staff:{analyst:0,associate:0,compliance:0,vp:0,fund:0},
    cut:0,pitch:true,px:0,stops:0,uw:false,deals:[],held:[],aum:0,am:false,closed:0,listings:0,yearDeals:0,bonus:30,speed:1,
    below:{adv:0,uw:0,fund:0},susp:{adv:false,uw:false,fund:false},lost:0,fines:0,day:{},mo:{rev:0,cost:0,am:0},hist:[],log:[],seq:0};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));return s;};
const isIb=()=>SAVE.cur==='ibank'&&B&&B.isNew;
const ibLvl=()=>Math.max(0,Math.min(10,Math.floor(S.kc.rep)));
const ibWeek=()=>Math.floor(S.day/7);
// Market mood moves week to week, 0.7 to 1.3.
const ibMood=()=>{const x=Math.sin(ibWeek()*12.9898+7.1)*43758.5453;return Math.round((.7+.6*(x-Math.floor(x)))*100)/100;};
// Analysts are the engine's desk workers (hired on the floor, paid in the engine payroll); associates and VPs are hired in HQ.
const ibAnalysts=()=>G&&G.workers?G.workers.filter(w=>w.kind==='cook').length*TEAM[stage()]:0;
const ibPoints=()=>{const t=S.kc.staff;return(1+ibAnalysts()+2*t.associate+3*t.vp)*S.kc.speed;}; // the owner works too (1 point)
const ibMerger=v=>Math.round(.02*Math.min(v,5e9)+.01*Math.max(0,Math.min(v,2e10)-5e9)+.005*Math.max(0,v-2e10));
const ibSize=(i,fee)=>{if(i<4)return fee/IBR.rate[i];if(fee<=1e8)return fee/.02;if(fee<=2.5e8)return 5e9+(fee-1e8)/.01;return 2e10+(fee-2.5e8)/.005;};
const ibLic=k=>!S.kc.susp[k];
const ibFundMin=()=>S.kc.aum>2e10?IBR.fundBig:IBR.fund;
const ibWin=i=>{const s=S.kc;let c=.15+.05*ibLvl()+(s.pitch?.1:0)-.1*IBR.rivals[i]+.05*(s.cut/.25);return Math.max(.05,Math.min(.85,c));};
const ibCost=(n,k)=>{const s=S.kc;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
// A fee arrives: running costs (31% of fee income, research cost structure) come out first.
function ibIn(amt){const s=S.kc,run=Math.round(amt*IBR.run);s.mo.cost+=run;s.day.run=(s.day.run||0)+run;s.mo.rev+=amt;return amt-run;}
const ibNote=t=>{const s=S.kc;s.log.unshift('Day '+S.day+': '+t);if(s.log.length>6)s.log.pop();};

/* ----- customers ----- */
function ibDemand(){const s=ibState();return .7+.06*ibLvl();}
function ibLineW(i){const s=ibState();
  if((i===2||i===3)&&!ibLic('adv'))return 0;          // advisory licence suspended: no new IPO or bond mandates
  if(i>0&&s.deals.filter(d=>d.i===i).length>=3)return 0; // the team takes at most 3 live mandates per line
  return 1;}
function ibSale(i,c,q,amt){const s=ibState();
  if(i===0){s.happy++;s.rep=Math.min(10,s.rep+.03);return ibIn(amt);}
  if(s.deals.filter(d=>d.i===i).length>=3)return 0; // team full on this line: the client books a later visit
  if(s.pitch)ibCost(IBR.pitchBook,'pitch');
  if(Math.random()>ibWin(i)){s.lost++;if(s.lost%4===1)toast('🤝 A rival house won this '+IBR.names[i].toLowerCase()+' mandate. A sharper pitch or a better name helps.',3);S.mo.rev-=0;return 0;}
  const rate=i<4?IBR.rate[i]:0,fee0=amt,size=ibSize(i,fee0),fee=i<4?Math.round(size*Math.max(.0025,rate-s.cut/100)):Math.round(ibMerger(size)*(1-s.cut/2));
  const d={id:++s.seq,i,size:Math.round(size),fee,ret:Math.round(fee*.1),ph:'work',prog:0,wait:0,q:0,cov:0,bd:0,happy:80,px:s.px,stops:s.stops,uw:false};
  s.deals.push(d);ibNote(IBR.names[i]+' mandate won: ₦'+short(d.size)+' deal, fee ₦'+short(fee)+'.');
  S.mo.rev+=0;return ibIn(d.ret);} // the retainer is 10% of the expected fee, credited at close

/* ----- nights: deal work, regulator review, order book, close ----- */
function ibNight(){if(!isIb())return[];const s=ibState(),rows=[],mood=ibMood();
  const work=s.deals.filter(d=>d.ph==='work'),pts=ibPoints()/Math.max(1,work.length);
  for(const d of s.deals){
    if(d.wait>0){d.wait--;continue;}
    if(d.ph==='work'){const a=Math.min(IBR.need[d.i]*2,pts);d.prog+=a/IBR.need[d.i]/IBR.base[d.i];
      if(d.i===4&&a<IBR.need[d.i])d.happy-=1;
      if(d.prog>=1){if(d.i===2||d.i===3){d.ph='review';const c=Math.min(2,s.staff.compliance);d.wait=Math.round(14*(1-.2*c));
          if(!c&&Math.random()<.1)ibSanction(d,'a serious prospectus error');}
        else if(d.i===4){d.ph='close';d.cov=d.happy>=30?1:0;}else{d.ph='book';d.bd=0;}}}
    else if(d.ph==='review'){const c=Math.min(2,s.staff.compliance);
      if(Math.random()<Math.max(0,.3-.1*c)){d.q++;d.wait=7;ibNote('Director Halima Sule queried the '+IBR.names[d.i]+' filing (query '+d.q+'). One more week.');if(d.q>=3)ibSanction(d,'three queries on one filing');}
      else{d.ph='book';d.bd=0;d.px=s.px;d.stops=s.stops;
        if(s.stops&&s.staff.vp)ibCost(IBR.stop*s.stops,'road');
        d.uw=s.uw&&ibLic('uw')&&s.capital>=IBR.uw&&d.size<=ibFree();}}
    else if(d.ph==='book'){const steps=d.px/5,pf=steps<0?1-.15*steps:1-.2*steps,st=s.staff.vp?Math.min(4,d.stops):0;
      d.cov+=.25*(1+.1*st)*mood*pf*(evx('demand_down')?.8:1)*(evx('vip_day')?1.2:1);d.bd++;if(d.bd>=3)d.ph='close';}
    if(d.ph==='close'){ibClose(d,rows,mood);d.done=true;}}
  s.deals=s.deals.filter(x=>!x.done);
  // held securities from underwriting: sold at the 10-day mark at offer price x (0.8 to 1.0) by mood
  for(const h of s.held){h.age++;if(h.age>=10){ibSell(h,rows);h.done=true;}}s.held=s.held.filter(h=>!h.done);
  // licence capital checks: under the minimum for 30 days suspends that licence
  const chk=(k,min,on)=>{if(!on){s.below[k]=0;return;}if(s.capital<min){s.below[k]++;if(s.below[k]===30){s.susp[k]=true;toast('⚠️ Capital under ₦'+short(min)+' for 30 days: licence suspended until capital is back.',5);}}else{s.below[k]=0;if(s.susp[k]){s.susp[k]=false;toast('✅ Capital is back above ₦'+short(min)+'. Licence restored.',4);}}};
  chk('adv',IBR.adv,lvl('line2')>0);chk('uw',IBR.uw,lvl('line3')>0);chk('fund',ibFundMin(),s.am);
  const D=s.day;if(D.run)rows.push(['Offices, compliance, travel, admin (31%)','-₦'+fmt(D.run),'#ffb3a3']);
  if(D.pitch)rows.push(['Pitch books','-₦'+fmt(D.pitch),'#ffb3a3']);if(D.road)rows.push(['Roadshow trips','-₦'+fmt(D.road),'#ffb3a3']);
  if(D.fine)rows.push(['Regulator fine','-₦'+fmt(D.fine),'#ffb3a3']);s.day={};return rows;}
const ibFree=()=>Math.max(0,S.kc.capital-S.kc.held.reduce((a,h)=>a+h.cost,0));
function ibSanction(d,why){const s=S.kc,f=Math.round(d.fee*.05);ibCost(f,'fine');s.fines++;d.wait=14;d.q=0;s.rep=Math.max(0,s.rep-1);
  toast('📋 Regulator sanction for '+why+': fine ₦'+short(f)+', deal paused 14 days, reputation -1.',5);ibNote('Sanction: '+why+'. Fixed and refiled.');}
function ibClose(d,rows,mood){const s=S.kc,n=IBR.names[d.i];
  if(d.cov<.5){s.rep=Math.max(0,s.rep-1);ibNote(n+' fell through ('+Math.round(d.cov*100)+'% '+(d.i===4?'client happiness too low':'covered')+'). Retainer kept, no success fee.');
    toast('📉 The '+n.toLowerCase()+' fell through. Reputation -1. The team is idle for 5 days.',4);for(const x of s.deals)if(x.ph==='work')x.wait=Math.max(x.wait,5);return;}
  const c=Math.min(1,d.cov),fee=Math.max(0,Math.round(d.fee*c)-d.ret),raised=Math.round(d.size*c);let cash=ibIn(fee);
  rows.push([n+' closed: success fee'+(c<1?' ('+Math.round(c*100)+'% covered)':''),'₦'+fmt(fee),'#b9ffcf']);
  if(d.uw){const extra=Math.round(d.size*.015);cash+=ibIn(extra);rows.push(['Underwriting commission (1.5%)','₦'+fmt(extra),'#b9ffcf']);
    if(c<1){const gap=Math.round(d.size*(1-c));s.capital-=gap;s.held.push({name:n+' #'+d.id,cost:gap,age:0,big:(1-c)>.2});rows.push(['Unsold '+n.toLowerCase()+' bought with capital','₦'+fmt(gap),'#ffd27a']);}}
  S.money+=cash;S.mo.rev+=0;if(s.am)s.aum+=Math.round(raised*.02);
  s.closed++;s.yearDeals++;if(d.i===2||d.i===3)s.listings++;s.rep=Math.min(10,s.rep+[0,.3,.6,.5,.7][d.i]);
  banner(d.i===2?'DING! THE BELL RINGS':n.toUpperCase()+' CLOSED','Fee ₦'+short(fee+d.ret)+(d.cov>1?' · '+Math.round(d.cov*100)+'% covered':''));fanfare(d.i>=2);
  ibNote(n+' closed: ₦'+short(raised)+' '+(d.i===4?'deal value':'raised')+', fee ₦'+short(fee+d.ret)+'.');}
function ibSell(h,rows){const s=S.kc,m=ibMood(),pr=Math.min(1,Math.max(.8,.8+(m-.7)/.6*.2)),back=Math.round(h.cost*pr);s.capital+=back;
  if(rows)rows.push(['Sold held '+h.name+' at '+Math.round(pr*100)+'%',(back<h.cost?'-₦'+fmt(h.cost-back):'₦0')+' to capital',back<h.cost?'#ffb3a3':'#b9ffcf']);
  if(back<h.cost)ibNote('Underwriting loss on '+h.name+': ₦'+short(h.cost-back)+' out of capital.');}

/* ----- payday: asset management fee, bonus season ----- */
function ibMonth(M){if(!isIb())return{rows:[],cost:0,or:0};const s=ibState(),rows=[];
  if(s.am){const fm=Math.min(3,s.staff.fund);s.aum=Math.round(s.aum*(1+.01*fm));const fee=Math.round(s.aum*.015/12);
    if(fee){S.money+=ibIn(fee);rows.push(['Asset management fee (1.5% a year)','₦'+fmt(fee),'#b9ffcf']);}}
  if(M.short>0)s.rep=Math.max(0,s.rep-.5);
  const mo=Math.round(S.day/MONTH);
  if(mo%12===0){// December bonus season
    const t=s.staff,yr=12*(ibAnalysts()*IBR.pay.analyst+t.associate*IBR.pay.associate+t.vp*IBR.pay.vp),pool=Math.round(yr*s.bonus/100);
    if(pool){S.money-=pool;s.mo.cost+=pool;rows.push(['December bonus pool ('+s.bonus+'% of yearly pay)','-₦'+fmt(pool),'#ffb3a3']);}
    if(s.bonus<30){let gone=0;for(const k of['associate','vp']){let n=0;for(let j=0;j<t[k];j++)if(Math.random()<.25)n++;t[k]-=n;gone+=n;}
      s.speed=.9;toast('Bonus pool under 30%: '+gone+' banker'+(gone===1?'':'s')+' left, and the team is 10% slower this year.',6);}
    else{s.speed=1.1;toast('🎉 Bonuses paid. The team is 10% faster this year.',4);}s.yearDeals=0;}
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};const cr=r?Math.round(M.wages/r*100):0;s.hist.push(cr);if(s.hist.length>24)s.hist.shift();
  return{rows,cost,or:cr};}
function ibCrew(){if(!isIb()||!S.kc)return[];const t=S.kc.staff,P=IBR.pay,r=[];
  if(lvl('venue1'))r.push({name:'Front desk officer',n:1,each:P.front});
if(t.associate)r.push({name:'Associates',n:t.associate,each:P.associate});
  if(t.compliance)r.push({name:'Compliance officers',n:t.compliance,each:P.compliance});if(t.vp)r.push({name:'Vice presidents',n:t.vp,each:P.vp});
  if(t.fund)r.push({name:'Fund managers',n:t.fund,each:P.fund});if(lvl('venue4'))r.push({name:'Managing director',n:1,each:P.md});return r;}

/* ----- stage gates (research licences and gates) ----- */
function ibGate(st){const s=ibState();
  if(st.base==='venue'&&st.n===1&&s.happy<10)return'🔒 The office lease needs 10 happy starter pack clients first ('+s.happy+' so far).';
  if(st.base==='line'&&st.arg===2){if(s.capital<IBR.adv)return'🔒 IPOs need the SEC adviser licence: hold ₦2bn as firm capital in HQ (now ₦'+short(s.capital)+').';if(!s.staff.compliance)return'🔒 IPOs need a compliance officer hired first (HQ).';}
  if(st.base==='line'&&st.arg===3&&s.capital<IBR.uw)return'🔒 Bonds need the underwriting licence: ₦7bn firm capital in HQ (now ₦'+short(s.capital)+').';
  if(st.base==='venue'&&st.n===3&&s.listings<2)return'🔒 The tower and data room come after two closed listings ('+s.listings+' so far).';
  if(st.base==='venue'&&st.n===4&&ibLvl()<9)return'🔒 Partner licences abroad need reputation level 9 (now '+ibLvl()+').';
  return null;}

/* ----- HQ panel ----- */
function ibHtml(){const s=ibState(),m=ibMood(),t=s.staff,pend=s.deals.length;
  let h='<h2>The firm</h2><div class="stats"><div class="stat">Reputation<b>Level '+ibLvl()+' / 10</b></div><div class="stat">Firm capital<b>₦'+short(s.capital)+'</b></div><div class="stat">Free capital<b>₦'+short(ibFree())+'</b></div><div class="stat">Market mood this week<b>'+m.toFixed(2)+(m>=1?' ☀️':' 🌧️')+'</b></div></div>';
  h+='<p class="note">Capital is held aside for licences; it is still yours, but it cannot be spent while it sits there. Market mood changes once a week.</p><div class="acts">';
  for(const a of[5e8,2e9])h+='<button class="ghost" data-ib="cap+'+a+'" type="button">➕ Put ₦'+short(a)+' into capital</button>';
  h+='<button class="ghost" data-ib="cap-5e8" type="button">➖ Take ₦500m out</button></div>';
  const L=[['SEC adviser licence','₦2bn','adv',lvl('line2')],['Underwriting licence','₦7bn','uw',lvl('line3')],['Fund manager licence','₦'+short(ibFundMin()),'fund',s.am]];
  h+='<h2>Licences</h2><table><tr><td><b>Licence</b></td><td><b>Capital needed · status</b></td></tr>'+L.map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+' · '+(!x[3]?'not yet':s.susp[x[2]]?'⚠️ suspended':s.below[x[2]]?'⚠️ short for '+s.below[x[2]]+' of 30 days':'✅ active')+'</td></tr>').join('')+'</table>';
  h+='<h2>Pitching</h2><p class="note">Win chance = 15% + 5% per reputation level + 10% with a pitch book − 10% per rival house + 5% per 0.25% fee cut (5% to 85%). A win pays a 10% retainer.</p>';
  h+='<div class="seg" id="ibcut">'+[0,.25,.5,.75].map(c=>'<button class="ghost'+(s.cut===c?' on':'')+'" data-cut="'+c+'" type="button">'+(c?'−'+c+'% fee':'Full fee')+'</button>').join('')+'</div>';
  h+='<div class="acts"><button class="ghost'+(s.pitch?' on':'')+'" data-ib="pitch" type="button">📘 Pitch books '+(s.pitch?'on':'off')+' · ₦250k each</button></div>';
  h+='<table><tr><td><b>Mandate</b></td><td><b>Win chance</b></td></tr>'+[1,2,3,4].filter(i=>lvl('line'+i)).map(i=>'<tr><td>'+IBR.names[i]+' ('+IBR.rivals[i]+' rival'+(IBR.rivals[i]===1?'':'s')+')</td><td>'+Math.round(ibWin(i)*100)+'%</td></tr>').join('')+'</table>';
  if(lvl('line2')||lvl('line3')){h+='<h2>Order book</h2><p class="note">Price against fair value. Lower sells faster but the client gets less; higher may not fill. Each VP roadshow stop adds 10% to daily orders (₦5m a stop, up to 4).</p>';
    h+='<div class="seg" id="ibpx">'+[-20,-15,-10,-5,0,5,10].map(p=>'<button class="ghost'+(s.px===p?' on':'')+'" data-px="'+p+'" type="button">'+(p>0?'+':'')+p+'%</button>').join('')+'</div>';
    h+='<div class="seg" id="ibst">'+[0,1,2,3,4].map(p=>'<button class="ghost'+(s.stops===p?' on':'')+'" data-st="'+p+'" type="button">'+p+' stop'+(p===1?'':'s')+'</button>').join('')+'</div>';
    if(lvl('line3'))h+='<div class="acts"><button class="ghost'+(s.uw?' on':'')+'" data-ib="uw" type="button">🛡️ Underwrite offers: '+(s.uw?'yes':'no')+' (+1.5%)</button></div><p class="note">If you underwrite and the book is not full, your capital buys the gap. It is sold after 10 days at 80% to 100% of the offer price, by mood. Only offers up to your free capital can be underwritten.</p>';}
  h+='<h2>Pipeline · '+pend+' live</h2><table><tr><td><b>Deal</b></td><td><b>Stage</b></td></tr>';
  for(const d of s.deals){const st=d.wait&&d.ph==='work'?'Idle '+d.wait+' days':d.ph==='work'?'Team at work '+Math.round(d.prog*100)+'%'+(d.i===4?' · client happiness '+d.happy:''):d.ph==='review'?'Regulator review · '+d.wait+' days'+(d.q?' · '+d.q+' quer'+(d.q>1?'ies':'y'):''):d.ph==='book'?'Order book day '+d.bd+' · '+Math.round(d.cov*100)+'% covered':'Closing';
    h+='<tr><td>'+IBR.names[d.i]+' · ₦'+short(d.size)+'<br><small>fee ₦'+short(d.fee)+'</small></td><td>'+st+'</td></tr>';}
  if(!pend)h+='<tr><td colspan="2">No live mandates. Clients in the lounge bring them.</td></tr>';h+='</table>';
  if(s.held.length){h+='<h2>Held from underwriting</h2><table>'+s.held.map((x,j)=>'<tr><td>'+x.name+' · ₦'+short(x.cost)+' · day '+x.age+' of 10</td><td><button class="ghost" data-ib="sell'+j+'" type="button">Sell now</button></td></tr>').join('')+'</table>';}
  h+='<h2>Deal team · '+ibPoints().toFixed(1)+' work points</h2><p class="note">Raise needs 2 points, bond 6, IPO 8, merger 10. Analyst 1, associate 2, VP 3, and you 1. Analysts: '+ibAnalysts()+' (hire them on the office floor). Live deals share the team.</p><table>';
  const R=[['associate','Associate',IBR.pay.associate],['vp','Vice president',IBR.pay.vp],['compliance','Compliance officer',IBR.pay.compliance]];
  if(s.am||lvl('venue3'))R.push(['fund','Fund manager',IBR.pay.fund]);
  for(const r of R)h+='<tr><td>'+r[1]+'s: '+t[r[0]]+'<br><small>₦'+fmt(r[2])+' a month</small></td><td><button class="ghost" data-ib="hire'+r[0]+'" type="button">Hire</button>'+(t[r[0]]?' <button class="ghost" data-ib="fire'+r[0]+'" type="button">Let go</button>':'')+'</td></tr>';
  h+='</table><p class="note">Each compliance officer cuts review time by 20% and queries by 10% (counts up to 2).</p>';
  if(lvl('venue3')){h+='<h2>Asset management</h2>';if(!s.am)h+='<div class="acts"><button class="ghost" data-ib="am" type="button">🌱 Open the asset management floor · ₦500m</button></div><p class="note">Needs the fund manager licence: ₦2bn capital, ₦5bn once savings under care pass ₦20bn.</p>';
    else h+='<div class="stats"><div class="stat">Savings under care<b>₦'+short(s.aum)+'</b></div><div class="stat">Fee this month<b>₦'+short(Math.round(s.aum*.015/12))+'</b></div></div><p class="note">1.5% a year, paid monthly. Grows 1% a month per fund manager (up to 3) and 2% of money raised on each closed deal. Grow it slowly and safely: it is people\'s retirement.</p>';}
  h+='<h2>December bonus</h2><div class="seg" id="ibbo">'+[0,30,60,100,150].map(p=>'<button class="ghost'+(s.bonus===p?' on':'')+'" data-bo="'+p+'" type="button">'+p+'%</button>').join('')+'</div><p class="note">Share of yearly pay for analysts, associates and VPs. Deals closed this year: '+s.yearDeals+'. Under 30% and some bankers leave; paying it makes the team 10% faster next year.</p>';
  if(s.log.length)h+='<h2>Deal log</h2><p class="note">'+s.log.join('<br>')+'</p>';
  return h;}
function ibBind(){if(!isIb())return;const s=S.kc,re=()=>{save();hqRender();},no=n=>{toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);};
  const seg=(id,a,f)=>document.querySelectorAll('#'+id+' [data-'+a+']').forEach(b=>b.onclick=()=>{f(+b.dataset[a]);re();});
  seg('ibcut','cut',v=>s.cut=v);seg('ibpx','px',v=>s.px=v);seg('ibst','st',v=>s.stops=v);seg('ibbo','bo',v=>s.bonus=v);
  document.querySelectorAll('#hqin [data-ib]').forEach(b=>b.onclick=()=>{const k=b.dataset.ib;
    if(k.startsWith('cap+')){const a=+k.slice(4);if(S.money<a)return no(a);S.money-=a;s.capital+=a;fanfare(false);}
    if(k==='cap-5e8'){const a=Math.min(5e8,ibFree());s.capital-=a;S.money+=a;}
    if(k==='pitch')s.pitch=!s.pitch;if(k==='uw')s.uw=!s.uw;
    if(k.startsWith('hire'))s.staff[k.slice(4)]++;if(k.startsWith('fire'))s.staff[k.slice(4)]=Math.max(0,s.staff[k.slice(4)]-1);
    if(k.startsWith('sell')){const h=s.held[+k.slice(4)];if(h){ibSell(h,null);s.held.splice(+k.slice(4),1);}}
    if(k==='am'){if(s.capital<IBR.fund){toast('The fund manager licence needs ₦2bn of firm capital first.',3);return;}if(S.money<IBR.amFloor)return no(IBR.amFloor);S.money-=IBR.amFloor;S.spent=(S.spent||0)+IBR.amFloor;s.am=true;fanfare(true);}
    re();});}

/* ----- drawings: items, stations, the firm's own map ----- */
XITEM.shoebox=(g,a,b)=>{R(g,-12,-12,24,12,2,a);R(g,-13,-15,26,4,1.5,b);R(g,-9,-19,7,6,1,'#fffaf0');R(g,0,-20,8,7,1,'#f4e9d0');R(g,-5,-21,6,4,1,'#e8f0ff');};
XITEM.folder=(g,a,b)=>{R(g,-11,-16,10,4,1.5,a);R(g,-11,-14,22,14,2,a);R(g,-9,-17,18,4,1,'#fffaf0');R(g,-11,-11,22,11,2,b);E(g,6,-5,2.5,2.5,'#f2c230');};
XITEM.sealbox=(g,a,b)=>{R(g,-12,-18,24,18,2,a);R(g,-12,-11,24,3,0,b);R(g,-2,-18,4,18,0,b);E(g,0,-9.5,4,4,'#c62828');E(g,-1,-10.5,1.5,1.2,'rgba(255,255,255,.6)');};
XSTATION.screens=(col)=>{rr(-46,-6,92,12,3,'#5a3a22');for(let i=-1;i<=1;i++){rr(i*30-13,-42,26,20,3,'#22252b');rr(i*30-11,-40,22,16,2,'#0f2a1c');ctx.strokeStyle=i?'#7dff9a':'#ff6b5a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(i*30-9,-28);ctx.lineTo(i*30-3,-34);ctx.lineTo(i*30+2,-30);ctx.lineTo(i*30+9,-37);ctx.stroke();rr(i*30-2,-22,4,16,1,'#3a3f46');}rr(-46,-9,92,4,2,col);rr(-10,8,20,14,3,'#2c2726');};
XSTATION.press=(col)=>{rr(-40,-30,80,36,6,'#5b5f66');rr(-34,-38,68,10,3,'#c9ced2');rr(-30,-36,60,3,1,'#fff');rr(-36,-14,72,6,2,'#22252b');for(let i=0;i<3;i++)rr(-28+i*20,-24,14,8,1,'#fffaf0');rr(-40,4,80,6,2,col);rr(22,-28,12,8,2,'#7dff9a');};
XSTATION.vault=(col)=>{rr(-38,-44,76,50,6,'#3a3f46');rr(-32,-38,64,38,4,'#5b5f66');ell(0,-19,13,13,'#c9ced2');ell(0,-19,9,9,'#3a3f46');ctx.strokeStyle='#c9ced2';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-19);ctx.lineTo(8,-19);ctx.moveTo(0,-27);ctx.lineTo(0,-11);ctx.stroke();rr(-38,6,76,5,2,col);rr(22,-34,6,6,1,'#f2c230');};
// Kolanut Crown's own map: the market gate desk, the trading desk, the listing bell, the boardroom and the deal room.
function ibStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,cx=x+w/2,T=(t)=>{ctx.fillStyle='rgba(20,30,24,.7)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,cx,y+h-16);};
  if(li===0){ctx.fillStyle='#c9a46a';ctx.fillRect(x+6,y+6,w-12,h-40);for(let k=0;k<4;k++)rr(x+12+k*(w-24)/4,y+12,(w-24)/4-6,26,3,['#e8501e','#f2c230','#1f8a4c','#2a62c9'][k]);
    ctx.fillStyle='#e9e2d2';ctx.beginPath();ctx.moveTo(cx-56,y+80);ctx.lineTo(cx,y+50);ctx.lineTo(cx+56,y+80);ctx.fill();ctx.fillStyle='#c62828';for(let k=-2;k<2;k++){ctx.beginPath();ctx.moveTo(cx+k*28,y+80);ctx.lineTo(cx,y+50);ctx.lineTo(cx+k*28+14,y+80);ctx.fill();}
    rr(cx-2,y+80,4,50,1,'#5b5f66');rr(cx-36,y+120,72,12,3,'#f4f1ea');rr(cx-30,y+132,4,24,1,'#9aa0a6');rr(cx+26,y+132,4,24,1,'#9aa0a6');rr(cx-10,y+112,22,8,2,'#3a3f46');T('MARKET GATE DESK');}
  else if(li===1){ctx.fillStyle='#2b3440';ctx.fillRect(x+6,y+6,w-12,h-40);for(let r=0;r<3;r++){rr(x+16,y+20+r*52,w-32,10,3,'#6b4423');for(let k=0;k<4;k++){const sx=x+22+k*(w-44)/4;rr(sx,y+4+r*52,(w-44)/4-8,14,2,'#0f2a1c');ctx.strokeStyle=(k+r)%2?'#7dff9a':'#ff6b5a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx+3,y+14+r*52);ctx.lineTo(sx+12,y+8+r*52);ctx.lineTo(sx+20,y+12+r*52);ctx.stroke();}}T('TRADING DESK');}
  else if(li===2){ctx.fillStyle='#1b2a4a';ctx.fillRect(x+6,y+6,w-12,h-40);rr(x+16,y+14,w-32,34,4,'#0f1a30');ctx.fillStyle='#f2c230';ctx.font='900 12px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('KCC ▲ 2.4%  ·  NGX',cx,y+36);
    rr(cx-50,y+120,100,16,4,'#6b4423');rr(cx-3,y+70,6,52,2,'#5b5f66');ctx.fillStyle='#f2c230';ctx.beginPath();ctx.moveTo(cx-22,y+108);ctx.quadraticCurveTo(cx-20,y+62,cx,y+62);ctx.quadraticCurveTo(cx+20,y+62,cx+22,y+108);ctx.fill();ell(cx,y+110,6,5,'#c99a2a');T('LISTING BELL');}
  else if(li===3){ctx.fillStyle='#8a6a4a';ctx.fillRect(x+6,y+6,w-12,h-40);ell(cx,y+90,w/2-30,46,'#5a3a22');ell(cx,y+86,w/2-34,42,'#7a4f30');for(let k=0;k<6;k++){const a=k/6*Math.PI*2;ell(cx+Math.cos(a)*(w/2-14),y+88+Math.sin(a)*58,10,10,'#1f8a4c');}
    rr(cx-14,y+80,28,10,2,'#fffaf0');T('BOARDROOM');}
  else{ctx.fillStyle='#3a3f46';ctx.fillRect(x+6,y+6,w-12,h-40);ctx.strokeStyle='#f2c230';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.strokeRect(x+14,y+14,w-28,h-56);ctx.setLineDash([]);
    for(let k=0;k<3;k++)rr(x+24+k*(w-48)/3,y+40,(w-48)/3-10,50,4,'#c9a46a');for(let k=0;k<3;k++)ell(x+24+k*(w-48)/3+((w-48)/3-10)/2,y+66,6,6,'#c62828');rr(cx-24,y+110,48,36,4,'#22252b');ctx.fillStyle='#7dff9a';ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('🔒',cx,y+136);T('DEAL ROOM');}}

/* Prices from plan2/ibank.json: starter pack N150,000; fund raise fee N2.5m (2.5% of N100m); IPO fee N75m (1.5% of N5bn);
   bond fee N200m (1% of N20bn). Merger fee N250m is the research fee scale on a N20bn deal (2% of first N5bn + 1% of next N15bn). */
BIZ.ibank={name:'Kolanut Crown Capital',tag:'Market desk to the listing bell',tone:'#0f7a52',field:'ibank',isNew:true,
  owner:{cloth:'#0f7a52',trim:'#d4a52a',hat:'none',gender:'f'},
  hand:'File clerk',cook:'analyst',seller:'front desk officer',
  outfit:{hand:{cloth:'#1f8a4c',trim:'#f4f1ea',hat:'cap'},cook:{cloth:'#f4f1ea',trim:'#1b2a4a',hat:'none'},server:{cloth:'#1b2a4a',trim:'#f2c230',hat:'gele',gender:'f'},cashier:{cloth:'#5b5f66',trim:'#f4f1ea',hat:'none',gender:'f'},porter:{cloth:'#2a3440',trim:'#d4a52a',hat:'none'}},
  venue:['Desk under an umbrella at the market gate','Room above the fabric shop','Glass office on Lagos Island','Kolanut Tower with a deal room','Five offices, Lagos to New York'],
  // Research stage costs: fabric shop office N6m; IPO (Ring the Bell) N300m; Lagos Island N2.15bn, of which N2bn is capital
  // held aside (paid in HQ), so N150m; bonds N5.2bn, of which N5bn tops capital up to N7bn, so N200m; tower and data room N800m;
  // Lagos to New York N25bn. The fund raise line opens with the stage 2 office (engine priced).
  costs:{venue:[6000000,150000000,800000000,25000000000],line:[null,300000000,200000000,null]},
  lines:[
   Object.assign(L('Business Starter Pack','Starter','#0f7a52',150000,'registration, tax number, first accounts','field',['shoebox','#c9a46a','#8a5a2a'],['doc','#fffaf0','#0f7a52'],'desk'),{w:10,qx:2}),
   Object.assign(L('Private Fund Raise','Fund raise','#d4a52a',2500000,'2.5% fee on a N100m raise','field',['folder','#d4a52a','#b5871a'],['book','#d4a52a','#fffaf0'],'screens'),{w:3,qx:1}),
   Object.assign(L('IPO Prospectus','IPO','#2a62c9',75000000,'1.5% fee on a N5bn share offer','field',['book','#2a62c9','#f4f1ea'],['doc','#e7f1fb','#2a62c9'],'press'),{w:.8,qx:1}),
   Object.assign(L('Bond Issue','Bond','#7a5af0',200000000,'1% fee on a N20bn 10-year bond','field',['folder','#7a5af0','#4a3a9a'],['doc','#efeaff','#7a5af0'],'screens'),{w:.5,qx:1}),
   Object.assign(L('Merger Deal','Merger','#8e1c1c',250000000,'advisory fee on a N20bn merger','field',['sealbox','#c9a46a','#8e1c1c'],['doc','#f4f1ea','#8e1c1c'],'vault'),{w:.35,qx:1})]};
BIZX.ibank={demand:ibDemand,lineW:ibLineW,sale:ibSale,gate:ibGate,html:ibHtml,bind:ibBind,night:ibNight,month:ibMonth,crew:ibCrew,
  strip:ibStrip,base:'#4f7a62',floor:['#c9a46a','#d6cfc0','#e4e0d6','#dfe3e6','#e9edf0'],locked(){return null;}};
