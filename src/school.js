/* ===== Almond Shade Schools Group: the research rules from plan3/school.json on top of the shop engine =====
   A school year here is 4 game months: First, Second and Third term, then the long holiday. Fees come in term bursts,
   salaries every month. No child is ever sent home over fees: unpaid fees only cut the school's cash.
   Children can leave when results are poor, when they are not cared for, or when parents complain. */
const SCHR={cap:[0,30,35,0,60],room:[0,8000000,15000000,0,15000000],beds:60,bedCost:1000000,food:2000,
  pay:{teacher:90000,science:160000,lecturer:160000,matron:120000,nurse:150000,cook:95000},
  train:50000,exam:27000,toilets:2500000,fence:4000000,aid:500000, // facility prices are estimates (no research figure)
  start:[0,2,4,60,2]};
const isSchool=()=>SAVE.cur==='school'&&B&&B.isNew;
const termOf=d=>Math.floor((d-1)/MONTH)%4,TERMS=['First term','Second term','Third term','Long holiday'];
function schState(){const s=S.sch=S.sch||{};const d={rep:40,q:2,trainT:0,trained:false,rooms:[0,0,0,0,0],teach:[0,0,0,0,0],beds:0,pupils:[0,0,0,0,0],wait:[0,0,0,0,0],
    pot:0,potPct:25,toilets:false,fence:false,aid:false,frozen:-1,passed:0,insp:null,late:0,matrons:0,nurses:0,missed:0,complaints:0,lapse:false,pass:0,low:0,
    pend:0,never:0,collected:0,scholars:0,left:null,results:null,day:{cost:0},mo:{rev:0,cost:0},hist:[],unpaidTerm:false};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  for(const i of[1,2,4])if(lvl('line'+i)&&!s.rooms[i]){s.rooms[i]=SCHR.start[i];s.teach[i]=SCHR.start[i];}
  if(lvl('line3')&&!s.beds)s.beds=SCHR.start[3];return s;}
const seats=i=>{const s=S.sch;return i===3?s.beds:Math.min(s.rooms[i],s.teach[i])*SCHR.cap[i];};
const schPayroll=()=>payrollList().reduce((a,r)=>a+(r.br?0:r.n*r.each),0);
const schCost=(n,k)=>{const s=S.sch;S.money-=n;s.mo.cost+=n;s.day.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const avgQ=()=>S.sch.q;
const passRate=()=>Math.min(98,Math.round(35+10*S.sch.q+(lvl('line2')?10:0)));
const qualified=()=>Math.min(100,Math.round(S.sch.q/3*100));
const inspScore=()=>{const s=S.sch;return Math.round(((s.toilets?100:0)+(s.fence?100:0)+qualified()+100+(s.aid?100:0))/5);};
// Research cost structure on fee income: non-teaching staff 12%, buildings 15%, books and lab kits 12% (boarding food is
// counted per boarder per day instead), power, diesel and transport 8%. Teachers are paid as salaries on payday.
// A fee arrives: the payroll pot takes its share first.
// Running costs are paid out of the fees as they arrive, then the pot takes its share of what is left.
function feeIn(amt){const s=S.sch,run=Math.round(amt*.47);s.mo.cost+=run;s.day.run=(s.day.run||0)+run;const net=amt-run,p=Math.round(net*s.potPct/100);s.pot+=p;s.collected+=amt;s.mo.rev+=amt;return net-p;}

/* ----- customers ----- */
function schDemand(){const s=schState();return .6+.8*s.rep/100;}
function schLineW(i){const s=schState(),t=termOf(S.day);if(i===0)return 1;if(t===3)return 0;if(s.frozen>=0&&i!==0)return 0;
  if(i===3&&(!s.nurses||s.missed>=3))return 0;const free=seats(i)-s.pupils[i];if(free<=0){if(Math.random()<.02)s.wait[i]=Math.min(Math.round(seats(i)*.5),s.wait[i]+1);return 0;}return 1;}
function schSale(i,c,q,amt){const s=schState();if(i>0){const free=Math.max(0,seats(i)-s.pupils[i]),n=Math.min(q,free);if(n<q)s.wait[i]=Math.min(Math.round(seats(i)*.5),s.wait[i]+q-n);
    s.pupils[i]+=n;amt=Math.round(amt/q*n);}
  amt=Math.round(amt*.95); // 1 seat in 20 is a free scholarship seat
  const now=Math.round(amt*.6),later=Math.round(amt*.35);s.pend+=later;s.never+=amt-now-later;
  const cash=feeIn(now);S.mo.rev+=amt-cash; // the month's revenue counts the whole fee; cash comes in parts
  return cash;}

/* ----- nights: meals, term start, mid-term fees, results, inspections ----- */
function schoolNight(){if(!isSchool())return null;const s=schState(),d=S.day,rows=[];
  const boarders=s.pupils[3];if(boarders){const food=boarders*SCHR.food;if(S.money>=food)schCost(food,'food');else{s.missed++;s.rep=Math.max(0,s.rep-2);s.complaints++;toast('🍲 Not enough cash for tonight\'s meals. Boarders went without: reputation -2.',4);}
    if(boarders>s.matrons*60||boarders>s.nurses*150)s.lapse=true;}
  if(d%MONTH===15&&s.pend){const p=s.pend;s.pend=0;S.money+=feeIn(p);rows.push(['Mid-term fees (35%)','₦'+fmt(p),'#b9ffcf']);}
  if(evx('inspect'))inspect(true);
  if(d%MONTH===0){const prev=termOf(d),next=termOf(d+1);if(s.pend){S.money+=feeIn(s.pend);s.pend=0;}
    if(prev<3)termEnd(prev);
    if(next<3)termStart(next,rows);else{const need=schPayroll();if(S.money+s.pot<need)toast('⚠️ Long holiday: no fees this month, but salaries are due. Cash and payroll pot are short by ₦'+short(need-S.money-s.pot)+'.',6);}}
  const D=s.day;if(D.food)rows.push(['Boarders\' meals (₦2,000 each a day)','-₦'+fmt(D.food),'#ffb3a3']);if(D.run)rows.push(['Staff, buildings, books, power','-₦'+fmt(D.run),'#ffb3a3']);if(D.train)rows.push(['Teacher training','-₦'+fmt(D.train),'#ffb3a3']);
  s.day={cost:0};return rows;}
function termEnd(t){const s=S.sch,why=[];let rate=.05;why.push('5% moved house or changed school');
  if(s.unpaidTerm){rate+=.1;why.push('10% after teachers went unpaid');}
  if(s.complaints){const c=Math.min(.2,s.complaints*.02);rate+=c;why.push(Math.round(c*100)+'% after '+s.complaints+' parent complaint'+(s.complaints>1?'s':''));}
  if(s.pass&&s.pass<50){rate+=.1;why.push('10% after poor results ('+s.pass+'% pass)');}
  const out=[0,0,0,0,0];for(let i=1;i<5;i++){let r=rate+(i===3&&s.lapse?.1:0);out[i]=Math.round(s.pupils[i]*r);s.pupils[i]-=out[i];}
  if(s.lapse)why.push('10% of boarders: not enough matrons or nurses');
  if(t===2){// results day and graduation at the end of the school year
    s.pass=passRate();const dr=Math.round((s.pass-60)/4);s.rep=Math.max(0,Math.min(100,s.rep+dr));s.low=s.pass<40?s.low+1:0;if(s.low>=2){s.rep=Math.max(0,s.rep-15);s.low=0;}
    const ss3=Math.round(s.pupils[2]/6),p6=Math.round(s.pupils[1]/6),move=lvl('line2')?Math.min(p6,Math.max(0,seats(2)-s.pupils[2]+ss3)):0;
    s.pupils[1]-=p6;s.pupils[2]+=move-ss3;const ug=Math.round(s.pupils[4]/4);s.pupils[4]-=ug;
    s.results={pass:s.pass,dr,ss3,p6,move,ug,exam:ss3*SCHR.exam};banner('RESULTS DAY',s.pass+'% passed. Reputation '+(dr>=0?'+':'')+dr);fanfare(dr>0);}
  if(s.trained){s.trainT++;s.trained=false;if(s.trainT>=2){s.trainT=0;s.q=Math.min(5,s.q+1);toast('🎓 Two terms of training: teacher quality is now '+s.q+' of 5.',4);}}
  s.rep=Math.min(100,s.rep+2); // scholarship seats: +2 reputation a term
  s.left={out,why,never:Math.round(s.never)};s.never=0;s.complaints=0;s.missed=0;s.lapse=false;s.unpaidTerm=false;if(s.frozen===t)s.frozen=-1;}
function termStart(t,rows){const s=S.sch;let burst=0;
  for(let i=1;i<5;i++){if(!s.pupils[i])continue;const fee=revenue(i,false)*s.pupils[i]*.95;burst+=fee;}
  // waiting list moves into free seats first
  for(let i=1;i<5;i++){const n=Math.min(s.wait[i],Math.max(0,seats(i)-s.pupils[i]));if(n){s.pupils[i]+=n;s.wait[i]-=n;burst+=revenue(i,false)*n*.95;}}
  if(burst){const now=Math.round(burst*.6),later=Math.round(burst*.35);s.pend+=later;s.never+=burst-now-later;S.money+=feeIn(now);S.mo.rev+=burst;rows.push([TERMS[t]+' fees at resumption (60%)','₦'+fmt(now),'#b9ffcf']);}
  if(Math.random()<.25)inspect(false);}
function inspect(forced){const s=S.sch,sc=inspScore(),t=termOf(S.day+1);s.insp={day:S.day,score:sc};
  if(sc>=70){s.passed++;s.rep=Math.min(100,s.rep+3);toast('📋 Inspector Hauwa visited: score '+sc+'. Passed, reputation +3.',4);}
  else if(sc>=50)toast('📋 Inspection score '+sc+': fix the checklist within 30 days.',4);
  else{s.frozen=t<3?t:0;s.complaints++;toast('📋 Inspection score '+sc+': no new pupils this term. Current pupils keep learning.',5);}}
// Payday: the pot covers any shortfall. Late salaries cost quality; two months late and 30% of teachers resign.
function schoolMonth(M){if(!isSchool())return[];const s=schState(),rows=[];
  if(M.short>0){const c=Math.min(s.pot,M.short);if(c){s.pot-=c;S.money+=c;rows.push(['Payroll pot covered','₦'+fmt(c),'#b9ffcf']);}
    if(M.short-c>0){s.late++;s.unpaidTerm=true;s.complaints++;if(s.late===1){s.q=Math.max(1,s.q-1);toast('Teachers were paid late. Quality falls to '+s.q+'.',5);}
      else{for(let i=1;i<5;i++)s.teach[i]=Math.floor(s.teach[i]*.7);toast('Salaries two months late: 30% of teachers resigned. Their classes are paused.',6);}}
    else s.late=0;}else s.late=0;
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};if(r)s.hist.push(Math.round((cost+M.wages)/r*100));if(s.hist.length>24)s.hist.shift();
  return{rows,cost,or:s.hist[s.hist.length-1]};}
// Teachers, matrons, nurses and cooks are paid on payday at the storyline salaries.
function schCrew(){if(!isSchool()||!S.sch)return[];const s=S.sch,P=SCHR.pay,r=[];
  if(s.teach[1])r.push({name:'Class teachers',n:s.teach[1],each:P.teacher});if(s.teach[2])r.push({name:'Science and subject teachers',n:s.teach[2],each:P.science});
  if(s.teach[4])r.push({name:'Lecturers',n:s.teach[4],each:P.lecturer});if(s.matrons)r.push({name:'House matrons',n:s.matrons,each:P.matron});
  if(s.nurses)r.push({name:'School nurses',n:s.nurses,each:P.nurse});if(s.beds)r.push({name:'Head cook',n:1,each:P.cook});return r;}

/* ----- stage gates ----- */
function schGate(st){const s=schState();
  if(st.base==='venue'&&st.n===1&&inspScore()<70)return'🔒 The ministry visits before you open: build toilets, a fence and a first aid room (score '+inspScore()+', need 70).';
  if(st.base==='line'&&st.arg===2){if(s.rep<30)return'🔒 Secondary needs reputation 30+ (now '+s.rep+').';if(s.rooms[1]<6)return'🔒 Secondary needs 6 primary classrooms first ('+s.rooms[1]+' now).';if(s.pot<schPayroll())return'🔒 Secondary needs a payroll pot of one month\'s salaries (₦'+short(schPayroll())+').';}
  if(st.base==='line'&&st.arg===3){if(!s.matrons||!s.nurses)return'🔒 Boarding needs a house matron and a school nurse hired first (HQ).';if(s.rep<50)return'🔒 Boarding needs reputation 50+ (now '+s.rep+').';}
  if(st.base==='venue'&&st.n===3&&s.pass<70)return'🔒 New states want a pass rate of 70%+ (last results: '+(s.pass||'none yet')+').';
  if(st.base==='line'&&st.arg===4&&s.passed<5)return'🔒 University licence: pass 5 inspection visits first ('+s.passed+' so far).';
  if(st.base==='venue'&&st.n===4&&s.pass<70)return'🔒 Full university licence needs a pass rate of 70%+.';
  return null;}

/* ----- HQ panel ----- */
function schHtml(){const s=schState(),t=termOf(S.day),pay=schPayroll();let h='<h2>School year</h2><div class="seg cal">'+TERMS.map((n,i)=>'<button class="ghost'+(i===t?' on':'')+'" type="button" disabled>'+n+'</button>').join('')+'</div>';
  h+='<p class="note">Fees come at resumption (60%) and mid-term (35%); about 5% never come. Salaries are due every month, holiday too. No child is sent home over fees: the bursar sends a polite reminder.</p>';
  h+='<div class="stats"><div class="stat">Reputation<b>'+s.rep+' / 100</b></div><div class="stat">Teacher quality<b>'+'★'.repeat(s.q)+'☆'.repeat(5-s.q)+'</b></div><div class="stat">Expected pass rate<b>'+passRate()+'%</b></div><div class="stat">Payroll pot<b>₦'+fmt(s.pot)+'</b></div></div>';
  h+='<h2>Payroll pot</h2><div class="seg" id="spot">'+[0,10,25,33,50].map(p=>'<button class="ghost'+(s.potPct===p?' on':'')+'" data-pot="'+p+'" type="button">'+p+'%</button>').join('')+'</div><p class="note">Share of every fee saved for payday. Monthly salaries: ₦'+fmt(pay)+'. The pot pays any shortfall on payday by itself.</p><div class="acts"><button class="ghost" data-sc="release" type="button">Move pot to cash</button></div>';
  h+='<h2>Classes</h2><table><tr><td><b>Class</b></td><td><b>Pupils / seats</b></td></tr>';
  const nm=['','Nursery and primary','Secondary','Boarders','University'];
  for(let i=1;i<5;i++)if(lvl('line'+i))h+='<tr><td>'+nm[i]+(i===3?' ('+s.beds+' beds)':' ('+s.rooms[i]+' rooms, '+s.teach[i]+' teachers)')+'</td><td>'+s.pupils[i]+' / '+seats(i)+(s.wait[i]?' · '+s.wait[i]+' waiting':'')+'</td></tr>';
  h+='</table><div class="acts">';
  if(lvl('line1'))h+='<button class="ghost" data-sc="r1" type="button">🏫 Primary classroom · ₦8m</button>';
  if(lvl('line2'))h+='<button class="ghost" data-sc="r2" type="button">🔬 Secondary classroom · ₦15m</button>';
  if(lvl('line4'))h+='<button class="ghost" data-sc="r4" type="button">🎓 Lecture hall · ₦15m</button>';
  if(lvl('line3'))h+='<button class="ghost" data-sc="beds" type="button">🛏️ 60 hostel beds · ₦60m</button>';
  for(const i of[1,2,4])if(s.teach[i]<s.rooms[i])h+='<button class="ghost" data-sc="hire'+i+'" type="button">👩🏾‍🏫 Rehire '+(s.rooms[i]-s.teach[i])+' teacher(s)</button>';
  h+='<button class="ghost'+(s.trained?' on':'')+'" data-sc="train" type="button">📚 Train teachers this term · ₦'+short(SCHR.train*Math.max(1,s.teach[1]+s.teach[2]+s.teach[4]))+'</button></div>';
  h+='<p class="note">Class caps: primary 30, secondary 35, lecture hall 60. Each room needs its own teacher (₦90,000 class teacher, ₦160,000 science teacher). Two terms of training raise quality by one star. Pass rate = 35 + 10 × quality + 10 with a science lab.</p>';
  h+='<h2>Inspection checklist · score '+inspScore()+'</h2><table><tr><td>6 clean WC toilets</td><td>'+(s.toilets?'✅':'<button class="ghost" data-sc="toilets" type="button">Build · ₦2.5m</button>')+'</td></tr><tr><td>Safe perimeter fence</td><td>'+(s.fence?'✅':'<button class="ghost" data-sc="fence" type="button">Build · ₦4m</button>')+'</td></tr><tr><td>First aid room</td><td>'+(s.aid?'✅':'<button class="ghost" data-sc="aid" type="button">Equip · ₦0.5m</button>')+'</td></tr><tr><td>Qualified teachers</td><td>'+qualified()+'%</td></tr><tr><td>Classes within size limits</td><td>100%</td></tr></table>';
  h+='<p class="note">70+ passes (+3 reputation). 50–69: fix within 30 days. Under 50: no new pupils for a term, but nobody already enrolled is sent away. Inspections passed: '+s.passed+(s.frozen>=0?' · ⚠️ enrolment frozen this term':'')+'.</p>';
  if(lvl('line2')||lvl('line3'))h+='<h2>Boarding care</h2><table><tr><td>Boarders · beds</td><td>'+s.pupils[3]+' · '+s.beds+'</td></tr><tr><td>House matrons (1 per 60)</td><td>'+s.matrons+'</td></tr><tr><td>School nurses (1 per 150)</td><td>'+s.nurses+'</td></tr><tr><td>Days without meals this term</td><td>'+s.missed+'</td></tr></table><div class="acts"><button class="ghost" data-sc="matron" type="button">Hire matron · ₦120k a month</button><button class="ghost" data-sc="nurse" type="button">Hire nurse · ₦150k a month</button></div><p class="note">Three meals a day at ₦2,000 per boarder. No nurse means no new boarders. Three days without meals in a term closes boarding intake.</p>';
  if(s.results){const r=s.results;h+='<h2>Last results day</h2><p class="note">'+r.pass+'% passed (reputation '+(r.dr>=0?'+':'')+r.dr+'). '+r.ss3+' SS3 candidates sat the national exam; their ₦27,000 fees (₦'+fmt(r.exam)+') went straight to the exam body. '+r.p6+' pupils finished Primary 6 and '+r.move+' moved up into your secondary school. '+(r.ug?r.ug+' graduates collected degrees.':'')+'</p>';}
  if(s.left){const L=s.left,n=L.out.reduce((a,b)=>a+b,0);h+='<h2>Who left last term</h2><p class="note">'+n+' pupil'+(n===1?'':'s')+' left: '+L.why.join('; ')+'. Nobody was sent home over fees; ₦'+fmt(L.never)+' of fees were never paid.</p>';}
  return h;}
function schBind(){if(!isSchool())return;const s=S.sch,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#spot [data-pot]').forEach(b=>b.onclick=()=>{s.potPct=+b.dataset.pot;re();});
  document.querySelectorAll('#hqin [data-sc]').forEach(b=>b.onclick=()=>{const k=b.dataset.sc;
    if(k==='release'){S.money+=s.pot;s.pot=0;re();}
    if(k==='r1')buy(SCHR.room[1],()=>{s.rooms[1]++;s.teach[1]++;});if(k==='r2')buy(SCHR.room[2],()=>{s.rooms[2]++;s.teach[2]++;});if(k==='r4')buy(SCHR.room[4],()=>{s.rooms[4]++;s.teach[4]++;});
    if(k==='beds')buy(SCHR.beds*SCHR.bedCost,()=>{s.beds+=SCHR.beds;});
    if(k.startsWith('hire')){const i=+k.slice(4);s.teach[i]=s.rooms[i];re();}
    if(k==='train'&&!s.trained){const n=SCHR.train*Math.max(1,s.teach[1]+s.teach[2]+s.teach[4]);buy(n,()=>{s.trained=true;s.day.train=(s.day.train||0)+n;});}
    if(k==='toilets')buy(SCHR.toilets,()=>{s.toilets=true;});if(k==='fence')buy(SCHR.fence,()=>{s.fence=true;});if(k==='aid')buy(SCHR.aid,()=>{s.aid=true;});
    if(k==='matron'){s.matrons++;re();}if(k==='nurse'){s.nurses++;re();}});}
