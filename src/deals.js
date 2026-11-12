/* ===== deals with other players: bank deposits, school places, manager jobs =====
   GAME MONEY ONLY. Nothing here is real money: it can't be cashed out and earns nothing in real life.
   The server keeps the ledger. Money moves as transfers the game applies once (ids kept in SAVE.p2p);
   the server marks them done when a save holding the id is accepted. */
const DL={d:null,at:0,busy:false};
const p2pKey=()=>{const a=new Uint8Array(12);crypto.getRandomValues(a);return[...a].map(x=>x.toString(16).padStart(2,'0')).join('');};
const KIND={deposit:'🏦',school:'🎒',manager:'🧑‍💼'};
const bizName=k=>k&&BIZ[k]?BIZ[k].name:k==='bank'?'your bank':k==='school'?'your school':'your business';
const pctTxt=bp=>(bp/100).toLocaleString('en-NG',{maximumFractionDigits:2})+'%';
const whenTxt=ms=>{const d=Math.max(0,ms-Date.now()),h=Math.round(d/36e5);return h<1?'within the hour':h<48?'in '+h+' hour'+(h===1?'':'s'):'in '+Math.round(h/24)+' days';};
const p2pNote='<p class="note">All deals use game money only. It stays in Naija Market and can never be cashed out.</p>';

/* ----- applying transfers to the save, once each ----- */
function p2pApply(list){if(!G||!S||!list||!list.length)return 0;SAVE.p2p=SAVE.p2p||[];let n=0,net=0;
  for(const t of list){if(SAVE.p2p.includes(t.id))continue;const b=t.biz&&SAVE.biz[t.biz]?SAVE.biz[t.biz]:S;
    SAVE.p2p.push(t.id);b.money=(b.money||0)+t.amount;if(b===S)net+=t.amount;n++;if(n<=2)toast((t.amount>0?'➕ ₦':'➖ ₦')+fmt(Math.abs(t.amount))+' game money · '+t.note,4);}
  if(SAVE.p2p.length>300)SAVE.p2p=SAVE.p2p.slice(-300);
  if(n){updateHud();save();nmPush();}return n;}
async function dealsFetch(){if(!NM.pid||DL.busy)return DL.d;DL.busy=true;const r=await nmApi('GET','/deals');DL.busy=false;
  if(r.ok&&r.j){DL.d=r.j;DL.at=Date.now();p2pApply(r.j.pending);}return DL.d;}
setInterval(()=>{if(NM.pid&&G&&!G.night)dealsFetch();},60000);
setTimeout(function first(){if(NM.pid&&G)dealsFetch();else setTimeout(first,4000);},4000);
// Saves now, so the server checks the money against the latest cash.
async function p2pSync(){save();for(let i=0;i<20&&NM.busy;i++)await new Promise(r=>setTimeout(r,150));await nmPush();}
// After a deal call: take the fresh list, apply what is owed, and save so the other side gets paid.
async function p2pAfter(j){DL.d=j;DL.at=Date.now();p2pApply(j.pending);await p2pSync();setTimeout(()=>dealsFetch().then(()=>{if(!$('hqp').hidden&&$('p2p'))dealsFill();}),1500);}

/* ----- the in-game family: up to 3 children, made the first time it is needed ----- */
const KIDN=['Ada','Tobi','Chidera','Musa','Zainab','Emeka','Ife','Kemi','Ngozi','Sola','Amaka','Bayo','Halima','Uche','Funmi','Dayo'];
function famState(){if(!SAVE.family){const n=Math.floor(Math.random()*4),kids=[];for(let i=0;i<n;i++)kids.push({id:p2pKey().slice(0,8),name:pick(KIDN.filter(x=>!kids.some(k=>k.name===x))),age:3+Math.floor(Math.random()*12)});SAVE.family={kids};save();}return SAVE.family;}
function famAdd(){const f=famState();if(f.kids.length>=3)return;f.kids.push({id:p2pKey().slice(0,8),name:pick(KIDN.filter(x=>!f.kids.some(k=>k.name===x))),age:0});save();}
const kidSchool=id=>DL.d&&DL.d.deals.find(d=>d.kind==='school'&&d.role==='a'&&d.child&&d.child.id===id);

/* ----- who manages a business (a player you hired) ----- */
function p2pMgr(k){const m=DL.d&&DL.d.managers&&DL.d.managers.find(x=>x.biz===(k||SAVE.cur));return m?m.name:null;}

/* ----- buttons on another player's profile ----- */
async function dealsProfile(id,name){const box=$('p2pp');if(!box)return;box.innerHTML='<p class="note">Loading deals...</p>';
  const r=await nmApi('GET','/deals/player/'+id);if(!$('p2pp'))return;if(!r.ok||!r.j){box.innerHTML='<p class="note">Could not load deals with '+esc(name)+'.</p>';return;}
  const j=r.j,b=[];if(j.me){box.innerHTML='';return;}
  let h='<h2>Do business with '+esc(name)+'</h2>';
  if(!G){box.innerHTML=h+'<div class="lock">Open one of your businesses first, then come back here to make deals.</div>'+p2pNote;return;}
  for(const d of j.between)h+='<p class="note">'+KIND[d.kind]+' '+dealLine(d)+'</p>';
  if(j.bank)b.push(j.bank.rateBp==null?['','🏦','Deposit in '+esc(name)+'\'s bank','Their bank is not taking deposits yet.','—']:['dep','🏦','Deposit in '+esc(name)+'\'s bank','Earns '+pctTxt(j.bank.rateBp)+' a week, paid by the bank. Take it out any time.',pctTxt(j.bank.rateBp)+'/wk']);
  if(j.school)b.push(j.school.fee==null?['','🎒','Enrol a child','Their school is not taking pupils yet.','—']:['enr','🎒','Enrol a child','Term fee ₦'+fmt(j.school.fee)+', paid every '+j.caps.termWeeks+' weeks.','₦'+short(j.school.fee)]);
  const job=j.between.some(d=>d.kind==='manager');
  b.push(j.hired||job?['','🧑‍💼','Offer manager job',job?'You already have a job deal with '+esc(name)+'.':esc(name)+' already manages a business.','—']:['job','🧑‍💼','Offer manager job','Pay '+esc(name)+' a weekly salary to manage '+esc(B.name)+'.','Offer']);
  h+=b.map(x=>'<button class="it'+(x[0]?'':' no')+'" type="button"'+(x[0]?' data-p2p="'+x[0]+'"':'')+'><i>'+x[1]+'</i><div><strong>'+x[2]+'</strong><span>'+x[3]+'</span></div><em>'+x[4]+'</em></button>').join('');
  if(!j.bank&&!j.school)h+='<p class="note">'+esc(name)+' does not run a bank or a school yet, so you can only offer them a job.</p>';
  h+='<div id="p2pf"></div>'+p2pNote;box.innerHTML=h;
  box.querySelectorAll('[data-p2p]').forEach(x=>x.onclick=()=>p2pForm(x.dataset.p2p,j,name));}

function p2pForm(kind,j,name){const f=$('p2pf'),key=p2pKey();let h='';
  if(kind==='dep')h='<h2>Deposit game money</h2><p class="note">From '+esc(B.name)+' (₦'+fmt(S.money)+' cash). '+esc(name)+'\'s bank pays '+pctTxt(j.bank.rateBp)+' of it every week.</p>'+
    '<label class="note">Amount (₦'+fmt(j.caps.deposit.min)+' to ₦'+fmt(j.caps.deposit.max)+')<input id="p2pn" type="number" inputmode="numeric" min="'+j.caps.deposit.min+'" max="'+j.caps.deposit.max+'" placeholder="e.g. 500000"></label>';
  if(kind==='enr'){const fam=famState(),free=fam.kids.filter(k=>!kidSchool(k.id));
    h='<h2>Enrol a child</h2><p class="note">₦'+fmt(j.school.fee)+' a term from '+esc(B.name)+', first term paid now.</p>';
    if(!fam.kids.length)h+='<div class="lock">You have no children in the game yet.</div><button class="big" id="p2pbaby" type="button">👶 Welcome a baby</button>';
    else if(!free.length)h+='<div class="lock">All your children are already in school.</div>';
    else h+='<div class="diap">'+free.map(k=>'<button class="ghost" type="button" data-kid="'+k.id+'">'+esc(k.name)+'<small>age '+k.age+'</small></button>').join('')+'</div>';}
  if(kind==='job')h='<h2>Offer a manager job</h2><p class="note">'+esc(name)+' would manage '+esc(B.name)+'. You pay the salary every week from its cash, first week when they say yes.</p>'+
    '<label class="note">Salary a week (₦'+fmt(j.caps.salary.min)+' to ₦'+fmt(j.caps.salary.max)+')<input id="p2pn" type="number" inputmode="numeric" min="'+j.caps.salary.min+'" max="'+j.caps.salary.max+'" placeholder="e.g. 200000"></label>';
  h+='<p class="msg" id="p2pm" hidden></p><button class="big" id="p2pgo" type="button"'+(kind==='enr'?' disabled':'')+'>'+(kind==='dep'?'Deposit':kind==='enr'?'Pick a child':'Send offer')+'</button>';
  f.innerHTML=h;f.scrollIntoView({block:'nearest'});let kid=null;
  const msg=t=>{const m=$('p2pm');m.textContent=t;m.hidden=!t;};
  if($('p2pbaby'))$('p2pbaby').onclick=()=>{famAdd();p2pForm(kind,j,name);};
  f.querySelectorAll('[data-kid]').forEach(x=>x.onclick=()=>{kid=famState().kids.find(k=>k.id===x.dataset.kid);f.querySelectorAll('[data-kid]').forEach(y=>y.classList.toggle('on',y===x));$('p2pgo').disabled=false;$('p2pgo').textContent='Enrol '+kid.name+' · ₦'+short(j.school.fee);});
  $('p2pgo').onclick=async()=>{const b=$('p2pgo');if(b.disabled)return;let path,body;
    if(kind==='enr'){if(!kid)return;path='/deals/enrol';body={to:j.id,childId:kid.id,childName:kid.name,biz:SAVE.cur,key};if(S.money<j.school.fee)return msg('You need ₦'+fmt(j.school.fee)+' in '+B.name+'.');}
    else{const n=Math.floor(+$('p2pn').value),c=kind==='dep'?j.caps.deposit:j.caps.salary;if(!(n>=c.min&&n<=c.max))return msg('Pick an amount from ₦'+fmt(c.min)+' to ₦'+fmt(c.max)+'.');
      if(n>S.money)return msg('You have ₦'+fmt(S.money)+' in '+B.name+'.');path=kind==='dep'?'/deals/deposit':'/deals/job';body=kind==='dep'?{to:j.id,amount:n,biz:SAVE.cur,key}:{to:j.id,salary:n,biz:SAVE.cur,key};}
    b.disabled=true;b.textContent='Sending...';msg('');await p2pSync();
    const r=await nmApi('POST',path,body);
    if(!r.ok||!r.j){b.disabled=false;b.textContent='Try again';return msg((r.j&&r.j.error)||'That did not go through. Nothing was taken. Please try again.');}
    await p2pAfter(r.j);beep(988,.12,'square',.06);
    toast(kind==='dep'?'🏦 Deposited in '+name+'\'s bank':kind==='enr'?'🎒 '+kid.name+' is starting at '+name+'\'s school':'🧑‍💼 Job offer sent to '+name,4);profileOpen(j.id);};}

/* ----- the HQ section ----- */
function dealLine(d){const o=esc(d.other.name),a=d.role==='a';
  if(d.kind==='deposit')return a?'₦'+fmt(d.amount)+' in '+o+'\'s bank at '+pctTxt(d.rateBp)+' a week':o+' keeps ₦'+fmt(d.amount)+' in your bank at '+pctTxt(d.rateBp)+' a week';
  if(d.kind==='school')return a?esc(d.child.name)+' at '+o+'\'s school, ₦'+fmt(d.amount)+' a term':o+'\'s child '+esc(d.child.name)+' at your school, ₦'+fmt(d.amount)+' a term';
  return d.status==='offer'?(a?'Job offer to '+o+': manage '+esc(bizName(d.job))+' for ₦'+fmt(d.amount)+' a week':o+' offers you a job managing '+esc(BIZ[d.job]?BIZ[d.job].name:'their business')+' for ₦'+fmt(d.amount)+' a week')
    :(a?o+' manages '+esc(bizName(d.job))+' for ₦'+fmt(d.amount)+' a week':'You manage '+o+'\'s '+esc(BIZ[d.job]?BIZ[d.job].name:'business')+' for ₦'+fmt(d.amount)+' a week');}
function dealBtns(d){if(d.status==='funding')return'<em>Starting...</em>';const a=d.role==='a',bt=(act,t,c)=>'<button class="ghost'+(c?' '+c:'')+'" type="button" data-deal="'+d.id+'" data-act="'+act+'">'+t+'</button>';
  if(d.kind==='deposit')return bt('end',a?'Take it out':'Pay it back');
  if(d.kind==='school')return bt('end',a?'Take '+esc(d.child.name)+' out':'End place');
  if(d.status==='offer')return a?bt('end','Take back'):bt('accept','Accept','yes')+bt('end','Say no');
  return bt('end',a?'End job':'Leave job');}
function dealsHtml(){const j=DL.d;let h='<h2>Deals with players</h2>';
  if(!j)return h+'<p class="note">Loading...</p>';
  const m=p2pMgr();if(m)h+='<div class="lock">🧑‍💼 '+esc(m)+' (a real player) manages '+esc(B.name)+'.</div>';
  if(!j.deals.length)h+='<p class="note">No deals yet. Open the 🏆 leaderboard, tap a player, and deposit in their bank, enrol a child in their school or offer them a manager job.</p>';
  for(const d of j.deals)h+='<div class="p2pd"><div><strong>'+KIND[d.kind]+' '+dealLine(d)+'</strong><span>'+(d.status==='active'?(d.paid?'₦'+fmt(d.paid)+' paid so far. ':'')+'Next payment '+whenTxt(d.next)+'.':d.status==='offer'?'Waiting for an answer.':'Starting: saving your game...')+'</span></div><div class="p2pb">'+dealBtns(d)+'</div></div>';
  if(j.ended.length)h+='<p class="note">Recently ended: '+j.ended.slice(0,4).map(d=>esc(d.note||'')).join(' · ')+'</p>';
  if(SAVE.biz.bank)h+='<label class="note">🏦 Your bank\'s deposit rate, % a week (0 to '+pctTxt(j.caps.rateBp.max)+'). Leave empty to take no new deposits.<span class="p2pr"><input id="p2pbr" type="number" step="0.05" min="0" max="'+j.caps.rateBp.max/100+'" value="'+(j.terms.depositRateBp==null?'':j.terms.depositRateBp/100)+'"><button class="ghost" type="button" id="p2pbs">Save</button></span></label>';
  if(SAVE.biz.school)h+='<label class="note">🎒 Your school\'s fee for other players\' children, ₦ a term. Leave empty to take no new pupils.<span class="p2pr"><input id="p2psf" type="number" min="'+j.caps.fee.min+'" max="'+j.caps.fee.max+'" value="'+(j.terms.schoolFee==null?'':j.terms.schoolFee)+'"><button class="ghost" type="button" id="p2pss">Save</button></span></label>';
  const kids=famState().kids;h+='<p class="note">👪 Your family: '+(kids.length?kids.map(k=>esc(k.name)+' ('+k.age+')'+(kidSchool(k.id)?' 🎒':'')).join(', '):'no children yet')+'.'+(kids.length<3?' <button class="ghost" type="button" id="p2pbaby2">👶 Welcome a baby</button>':'')+'</p>';
  return h+'<p class="note" id="p2pm2" hidden></p>'+p2pNote;}
function dealsFill(){const box=$('p2p');if(!box)return;box.innerHTML=dealsHtml();
  const msg=t=>{const m=$('p2pm2');if(m){m.textContent=t;m.hidden=!t;}};
  const call=async(method,path,body)=>{const r=await nmApi(method,path,body);if(!r.ok||!r.j){msg((r.j&&r.j.error)||'That did not go through. Please try again.');return false;}await p2pAfter(r.j);dealsFill();return true;};
  box.querySelectorAll('[data-deal]').forEach(b=>b.onclick=async()=>{b.disabled=true;if(b.dataset.act==='accept')await p2pSync();if(await call('POST','/deals/'+b.dataset.deal+'/'+b.dataset.act))beep(784,.12,'square',.05);else b.disabled=false;});
  if($('p2pbs'))$('p2pbs').onclick=()=>{const v=$('p2pbr').value.trim();call('PUT','/deals/terms',{depositRateBp:v===''?null:Math.round(+v*100)}).then(ok=>ok&&toast('🏦 Deposit rate saved',2));};
  if($('p2pss'))$('p2pss').onclick=()=>{const v=$('p2psf').value.trim();call('PUT','/deals/terms',{schoolFee:v===''?null:Math.floor(+v)}).then(ok=>ok&&toast('🎒 School fee saved',2));};
  if($('p2pbaby2'))$('p2pbaby2').onclick=()=>{famAdd();dealsFill();};}
// Called by hqRender: show what we have now, then refresh from the server.
function dealsHq(){if(!NM.pid){const b=$('p2p');if(b)b.innerHTML='';return;}dealsFill();if(Date.now()-DL.at>4000)dealsFetch().then(()=>{if(!$('hqp').hidden)dealsFill();});}
{const st=document.createElement('style');st.textContent='#hqp .p2pd{display:flex;gap:10px;align-items:center;justify-content:space-between;background:rgba(255,255,255,.08);border-radius:14px;padding:10px 12px;margin:6px 0}#hqp .p2pd strong{display:block;font-size:14px}#hqp .p2pd span{display:block;font-size:12px;font-weight:700;opacity:.8;margin-top:2px}#hqp .p2pb{display:flex;flex-direction:column;gap:6px;flex:none}#hqp .p2pb em{font-style:normal;font-size:12px;opacity:.8}#hqp .ghost.yes{background:#1f8a4c}#hqp .p2pr{display:flex;gap:8px}#hqp .p2pr input{flex:1;min-width:0}#hqp .msg{color:#ffd0c4;font-weight:800}';document.head.appendChild(st);}
