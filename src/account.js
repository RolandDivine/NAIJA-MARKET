/* ===== accounts and the player journey =====
   front page -> sign in (Community Square or email, cookies required, one player per phone) -> country -> career path
   -> welcome tour -> game. Also: cloud saves, leaderboards, player profiles, and sharing to the Community Square feed. */
const API=(window.NM_API||'')+'/api/naija',LEGACY='naijaMarket.v2';
const NM={pid:null,ver:0,timer:0,blocked:false,busy:false,player:null,cfg:null,mode:'signup'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const FLAG={NG:'🇳🇬',US:'🇺🇸',GB:'🇬🇧',GH:'🇬🇭',KE:'🇰🇪',ZA:'🇿🇦',CA:'🇨🇦'};

/* ----- this phone's id: one player per phone ----- */
function deviceId(){let d=null;try{d=localStorage.getItem('nm.dev');}catch(e){}
  if(!d){const m=document.cookie.match(/(?:^|;\s*)nm_dev=([a-f0-9]{32})/);if(m)d=m[1];}
  if(!d){const a=new Uint8Array(16);crypto.getRandomValues(a);d=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');}
  try{localStorage.setItem('nm.dev',d);}catch(e){}document.cookie='nm_dev='+d+';path=/;max-age=157680000;samesite=lax';return d;}
const cookiesOK=()=>{try{return localStorage.getItem('nm.cookies')==='1';}catch(e){return false;}};
async function nmApi(method,path,body,keep){try{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),9000);
  const r=await fetch(API+path,{method,signal:ac.signal,credentials:'same-origin',keepalive:!!keep,headers:{'content-type':'application/json','x-nm-device':deviceId()},body:body?JSON.stringify(body):undefined});
  clearTimeout(tm);const t=await r.text();let j=null;try{j=JSON.parse(t);}catch(e){}return{ok:r.ok,status:r.status,j};}catch(e){return{ok:false,status:0,j:null};}}
const sumLv=b=>1+Object.values(b.pads||{}).reduce((a,p)=>a+(p.l||0),0)+Object.values(b.emp||{}).reduce((a,v)=>a+(+v||0),0);
const bestLv=d=>Math.max(0,...Object.values((d&&d.biz)||{}).map(sumLv));
function localLegacy(){try{const s=JSON.parse(localStorage.getItem(LEGACY)||'null');return s&&s.biz&&Object.keys(s.biz).length?s:null;}catch(e){return null;}}
// Numbers shown on the leaderboards, sent with every save.
function myStats(){const bz=Object.values(SAVE.biz||{});const br=bz.reduce((a,b)=>a+((b.emp&&b.emp.br)||0),0);
  return{netWorth:Math.max(0,bz.reduce((a,b)=>a+(b.money||0),0)),life:SAVE.life||0,branches:br,staff:(G?G.workers.length:0)+br*120,companies:bz.length};}

/* ----- cloud sync ----- */
cloudHook=()=>{if(!NM.pid||NM.blocked||NM.timer)return;NM.timer=setTimeout(()=>{NM.timer=0;nmPush();},10000);};
async function nmPush(keep){if(!NM.pid||NM.blocked||NM.busy)return;clearTimeout(NM.timer);NM.timer=0;NM.busy=true;
  const r=await nmApi('PUT','/save',{version:NM.ver,data:SAVE,level:bestLv(SAVE),stats:myStats()},keep);NM.busy=false;
  if(r.ok&&r.j)NM.ver=r.j.version;
  else if(r.status===409&&r.j&&r.j.conflict){NM.blocked=true;acctConflict(r.j);}
  else if(r.status===401){NM.pid=null;showSignIn('Your session ended. Please sign in again.');}
  else cloudHook();}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G)save(),nmPush(true);});
addEventListener('pagehide',()=>{if(NM.pid)nmPush(true);});

/* ----- overlay helpers ----- */
const A=document.createElement('div');A.id='acct';A.hidden=true;document.body.appendChild(A);
const field=(id,label,type,ph,ac)=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" placeholder="'+ph+'" autocomplete="'+ac+'">';
const art=k=>ART[k]?ART[k][2]:'';
function screen(h){A.innerHTML='<div class="in">'+h+'</div>';A.hidden=false;A.scrollTop=0;}
function amsg(t,html){const e=$('amsg');if(!e)return;if(html)e.innerHTML=t;else e.textContent=t;e.hidden=!t;}

/* ----- 1. front page ----- */
function showFront(){const crew=['o_tunde','o_bola','o_nkechi','o_musa','o_chinedu'];
  screen('<h1>Naija Market</h1><div class="hero">'+crew.map((k,i)=>'<img alt="" src="'+art(k)+'" style="left:'+(4+i*19)+'%;z-index:'+(i===2?3:i%2?2:1)+(i===2?';height:206px':'')+'">').join('')+'</div>'+
    '<p class="sub">Start with one market table. Build a business empire across Nigeria, Africa and the world.</p>'+
    '<div class="feat"><div><b>🧺</b>Pick a career: jollof kitchen, farm, fabrics, phones and more.</div><div><b>🏢</b>Hire staff, buy machines, open up to 500 branches.</div><div><b>🏆</b>Climb the daily, weekly and monthly leaderboards.</div></div>'+
    '<button class="big go" id="fplay" type="button">Play now</button><p class="fine">Free to play. Your game saves to your account.</p>');
  $('fplay').onclick=()=>showSignIn();}

/* ----- 2. sign in ----- */
function showSignIn(msg){const c=NM.cfg||{},m=c.member,own=c.deviceOwner,mode=own?'login':NM.mode;NM.mode=mode;
  let h='<h1>Sign in</h1><p class="sub">'+(own?'This phone belongs to <b>'+esc(own)+'</b>. Log in to keep playing.':'Choose how you want to play.')+'</p><p class="msg" id="amsg"'+(msg?'':' hidden')+'>'+esc(msg||'')+'</p>';
  h+='<label class="chk"><input id="ack" type="checkbox"'+(cookiesOK()?' checked':'')+'> <span>Allow cookies so your game can be saved on this phone. <small>Required. We use them only to keep you signed in and store your game.</small></span></label>';
  h+='<button class="big cs" id="acs" type="button">'+(m?'Continue as '+esc(m.name)+' (Community Square)':'Continue with Community Square')+'</button>';
  h+='<div class="or"><span>or use your email</span></div><div class="tabs"><button id="tsu" type="button" class="'+(mode==='signup'?'on':'')+'">Create account</button><button id="tli" type="button" class="'+(mode==='login'?'on':'')+'">Log in</button></div>';
  if(mode==='signup')h+=field('an','Your player name','text','e.g. Ada Obi','nickname')+field('ae','Email','email','you@example.com','email')+field('ap','Password (8 or more characters)','password','Choose a password','new-password')+field('ay','Year you were born (optional)','number','e.g. 2005','off');
  else h+=field('ae','Email','email','you@example.com','email')+field('ap','Password','password','Your password','current-password');
  h+='<label class="chk"><input id="am" type="checkbox"> <span>Send me news about Naija Market and Community Square. <small>Optional. Marketing email only goes to adults who tick this box.</small></span></label>';
  h+='<button class="big go" id="ago" type="button">'+(mode==='signup'?'Create my player':'Log in')+'</button>';
  h+='<p class="fine">One player per phone. Want a second player? Use another phone. Anyone can play; Community Square itself is for adults (18+).</p>';
  screen(h);
  $('ack').onchange=()=>{try{localStorage.setItem('nm.cookies',$('ack').checked?'1':'0');}catch(e){}};
  $('tsu').onclick=()=>{NM.mode='signup';showSignIn();};$('tli').onclick=()=>{NM.mode='login';showSignIn();};$('acs').onclick=acctMember;$('ago').onclick=acctEmail;
  if(own)$('tsu').disabled=true;}
const wantMail=()=>!!($('am')&&$('am').checked);
function needCookies(){if($('ack')&&$('ack').checked){try{localStorage.setItem('nm.cookies','1');}catch(e){}return false;}amsg('Please tick "Allow cookies" first, so your game can be saved.');$('ack').focus();return true;}
async function acctMember(){if(needCookies())return;const r=await nmApi('POST','/member',{marketing:wantMail()});if(r.ok)return signedIn(r.j);
  if(r.j&&r.j.needMember)amsg('You are not signed in to Community Square on this phone yet. <a href="/" target="_blank" rel="noopener">Open Community Square</a>, sign in, then come back and tap this button again.',true);
  else amsg((r.j&&r.j.error)||'Could not reach Community Square. Check your internet and try again.');}
async function acctEmail(){if(needCookies())return;const b=$('ago');b.disabled=true;const signup=NM.mode==='signup';
  const body={email:$('ae').value,password:$('ap').value,marketing:wantMail(),cookies:true};if(signup){body.name=$('an').value;body.birthYear=$('ay').value||undefined;}
  const r=await nmApi('POST',signup?'/signup':'/login',body);b.disabled=false;if(r.ok)return signedIn(r.j);
  amsg((r.j&&r.j.error)||'Could not reach the server. Check your internet and try again.');}

/* ----- after sign-in: pick the save, then country, career and tour ----- */
function adopt(data,ver){SAVE=data;if(SAVE.snd==null)SAVE.snd=SAVE.sound===false?0:2;NM.ver=ver;NM.blocked=false;try{localStorage.setItem(KEY,JSON.stringify(SAVE));}catch(e){}}
async function signedIn(j){NM.pid=j.player.id;NM.player=j.player;KEY='naijaMarket.v3.'+NM.pid;const cloud=j.save,old=localLegacy();
  if(cloud){adopt(cloud.data,cloud.version);
    if(old&&bestLv(old)>bestLv(cloud.data)+2&&!sessionStorage.getItem('nm.asked.'+NM.pid)){sessionStorage.setItem('nm.asked.'+NM.pid,'1');return acctChoose(old,cloud.data);}}
  else if(old){adopt(old,0);nmPush();toast('Your game from this browser is now saved to your account.',5);}
  else adopt({sound:true,snd:2,cur:null,biz:{}},0);
  if(G)G=null;next();}
// Walks the player through whatever they have not chosen yet.
function next(){const p=NM.player;if(!p.country)return showCountry();if(!SAVE.onb)return showTour();enterGame();}
function acctChoose(old,cloud){screen('<h1>Which game?</h1><p class="sub">This browser has a more advanced game than your account.</p><button class="big go" id="co" type="button">Use this browser\'s game (level '+bestLv(old)+')</button><button class="big alt" id="cc" type="button">Keep my account\'s game (level '+bestLv(cloud)+')</button><p class="fine">The one you do not pick is left untouched until you play, then it is replaced.</p>');
  $('co').onclick=()=>{adopt(old,NM.ver);nmPush();next();};$('cc').onclick=next;}
function acctConflict(s){screen('<h1>Played somewhere else</h1><p class="sub">This game was saved from another phone or tab since you opened it. Pick which one to keep.</p><button class="big go" id="cl" type="button">Load the newest save</button><button class="big alt" id="ck" type="button">Keep this screen\'s game</button>');
  $('cl').onclick=()=>{if(s.data){adopt(s.data,s.version);G=null;next();}else location.reload();};$('ck').onclick=()=>{NM.ver=s.version;NM.blocked=false;nmPush();A.hidden=true;};}

/* ----- 3. country ----- */
function showCountry(){const C=(NM.cfg&&NM.cfg.countries)||{NG:'Nigeria'},live=(NM.cfg&&NM.cfg.liveCountries)||['NG'];
  screen('<h1>Your country</h1><p class="sub">Where do you want to build your empire?</p><p class="msg" id="amsg" hidden></p><div class="ctry">'+
    Object.keys(C).map(k=>'<button type="button" data-c="'+k+'"'+(live.includes(k)?'':' disabled')+'><b class="flag">'+(FLAG[k]||'🌍')+'</b>'+esc(C[k])+'<span>'+(live.includes(k)?'Open now':'Coming soon')+'</span></button>').join('')+'</div>');
  A.querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{const r=await nmApi('PUT','/profile',{country:b.dataset.c});if(r.ok){NM.player=r.j.player;next();}else amsg((r.j&&r.j.error)||'Could not save. Try again.');});}

/* ----- 4. career path (the business picker) ----- */
const SOON=[['🏦','PadiTrust Bank','Retail bank: deposits, loans, cards'],['💼','Kolanut Crown Capital','Investment bank: listings, bonds, mergers'],['📈','Blue Ticker Trading House','Stockbroking and trading floor'],
  ['🏫','Almond Shade Schools','From lesson teacher to university'],['🏗️','Oke-Ile Homes & Towers','Agent to estate and tower developer'],['🚢','Wakaway Global Logistics','Dispatch bike to shipping line'],
  ['✈️','KiteRise Air & Travels','Travel desk to intercontinental airline'],['🏭','Omi-Ola Industries','Pure water to consumer goods'],['⚡','Kpakpando Energy','Gas kiosk to power plants'],
  ['🏥','Dawnfield Health Group','Chemist to teaching hospital'],['🏨','Adunni Palms Hotels','Guest house to luxury chain'],['💻','KoboWave Technologies','Phone repair to payments company'],
  ['🎬','Koko Reel Entertainment','Wedding videos to studios and streaming'],['🏛️','Okele Council Services','Public service: ward to state']];
$('soon').innerHTML=SOON.map(s=>'<div class="card"><div class="ico">'+s[0]+'</div><div><h2>'+esc(s[1])+'</h2><span>'+esc(s[2])+'</span><em>Coming soon</em></div></div>').join('');
$('soonh').hidden=false;
$('cards').addEventListener('click',e=>{const c=e.target.closest('.card');if(c&&NM.pid&&NM.player&&!NM.player.career)nmApi('PUT','/profile',{career:c.dataset.biz}).then(r=>{if(r.ok)NM.player=r.j.player;});},true);

/* ----- 5. welcome tour ----- */
const TOUR=[['🧺','Pick a career','Cook jollof, farm yam, grill suya, sell fabric or phones. Each business has its own colour, staff and story.'],
  ['🏃','Walk, work, sell','Drag to walk. Circle your crops with the rope, carry goods on your head, serve customers and stand on price pads to upgrade.'],
  ['🏢','Build an empire','Grow your shop into a huge flagship, then hire a manager, buy machines, sign export contracts and open up to 500 stores.'],
  ['🏆','Climb the leaderboard','Tap the trophy to see the top players today, this week and this month. Share your wins on Community Square.']];
function showTour(){let i=0;const done=()=>{SAVE.onb=1;save();enterGame();};
  const step=()=>{const t=TOUR[i];A.innerHTML='<div class="in tour"><div class="dots">'+TOUR.map((_,n)=>'<i class="'+(n===i?'on':'')+'"></i>').join('')+'</div><div class="ico">'+t[0]+'</div><h1>'+t[1]+'</h1><p class="sub">'+t[2]+'</p><button class="big go" id="tn" type="button">'+(i<TOUR.length-1?'Next':'Choose my career')+'</button><button class="skip" id="ts" type="button">Skip</button></div>';A.hidden=false;
    $('tn').onclick=()=>{if(++i<TOUR.length)step();else done();};$('ts').onclick=done;};step();}
function enterGame(){A.hidden=true;$('who').textContent=NM.player?NM.player.name:'';$('logout').hidden=!NM.pid;$('lb').hidden=!NM.pid;$('lb2').hidden=!NM.pid;showMenu();}

/* ----- leaderboards and player profiles (shown in the HQ panel frame) ----- */
const LBP={period:'week',country:'NG'},PER={day:'Today',week:'This week',month:'This month',all:'All time'};
const careerName=k=>BIZ[k]?BIZ[k].name:'Not chosen yet';
async function lbOpen(){if(!NM.pid)return;if(G)G.input.active=false;$('hqp').hidden=false;$('hqin').innerHTML='<header><h1>Leaderboard<small>Loading...</small></h1><button class="ghost" id="hqx" type="button">Close</button></header>';$('hqx').onclick=lbClose;
  const r=await nmApi('GET','/leaders?period='+LBP.period+(LBP.country?'&country='+LBP.country:''));if($('hqp').hidden)return;
  let h='<header><h1>Leaderboard<small>'+(LBP.period==='all'?'Richest players by net worth':'Most money earned, '+PER[LBP.period].toLowerCase())+'</small></h1><button class="ghost" id="hqx" type="button">Close</button></header>';
  h+='<div class="lbt">'+Object.keys(PER).map(k=>'<button type="button" data-p="'+k+'" class="'+(k===LBP.period?'on':'')+'">'+PER[k]+'</button>').join('')+'</div>';
  h+='<div class="lbt"><button type="button" data-k="NG" class="'+(LBP.country==='NG'?'on':'')+'">🇳🇬 Nigeria</button><button type="button" data-k="" class="'+(!LBP.country?'on':'')+'">🌍 Everyone</button></div>';
  if(!r.ok)h+='<div class="lock">Could not load the leaderboard. Check your internet and try again.</div>';
  else{const rows=r.j.rows;if(!rows.length)h+='<div class="lock">No one is on this board yet. Sell something and you could be first!</div>';
    h+=rows.map(x=>'<button type="button" class="lbr'+(x.me?' me':'')+'" data-id="'+x.id+'"><i>'+(x.rank<=3?['🥇','🥈','🥉'][x.rank-1]:x.rank)+'</i><div><strong>'+esc(x.name)+(x.cs?' · ✅':'')+'</strong><span>'+(FLAG[x.country]||'')+' '+esc(careerName(x.career))+' · Level '+x.level+' · '+x.branches+' branches</span></div><b>₦'+short(x.score)+'</b></button>').join('');
    const me=r.j.me;h+='<p class="note">'+(me.rank?'You are number '+me.rank+' with ₦'+short(me.score)+'.':'You are not on this board yet. Earnings count after your next save.')+' ✅ means the player is on Community Square.</p>';}
  $('hqin').innerHTML=h;$('hqx').onclick=lbClose;
  $('hqin').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{LBP.period=b.dataset.p;lbOpen();});
  $('hqin').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{LBP.country=b.dataset.k;lbOpen();});
  $('hqin').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>profileOpen(+b.dataset.id));}
function lbClose(){$('hqp').hidden=true;}
async function profileOpen(id){const r=await nmApi('GET','/players/'+id);if(!r.ok)return toast('Could not load that player.',2);const p=r.j,mine=id===NM.pid;
  let h='<header><h1>'+esc(p.name)+'<small>'+(FLAG[p.country]||'')+' '+esc(careerName(p.career))+' · playing since '+esc(String(p.since||'').slice(0,10))+'</small></h1><button class="ghost" id="hqx" type="button">Back</button></header>';
  h+='<div class="stats"><div class="stat">Net worth<b>₦'+short(p.netWorth)+'</b></div><div class="stat">Level<b>'+p.level+'</b></div><div class="stat">Branches<b>'+p.branches+'</b></div><div class="stat">Staff<b>'+p.staff.toLocaleString()+'</b></div><div class="stat">Businesses<b>'+p.companies+'</b></div></div>';
  if(mine)h+='<p class="note">This is you.</p>';
  else if(p.cs)h+='<a class="cslink" href="/u/'+p.cs+'" target="_blank" rel="noopener">💬 Message '+esc(p.name)+' on Community Square</a><p class="note">Opens their Community Square profile. Chat there follows Community Square\'s own rules.</p>';
  else h+='<div class="lock">'+esc(p.name)+' has not linked Community Square, so you cannot message them yet.</div>';
  h+='<p class="note">Doing business with other players, depositing in their banks and hiring them as managers arrive with the new businesses.</p>';
  $('hqin').innerHTML=h;$('hqx').onclick=lbOpen;$('hqp').scrollTop=0;}
$('lb').addEventListener('click',lbOpen);$('lb2').addEventListener('click',lbOpen);$('lb').hidden=true;

/* ----- share to the Community Square feed: screenshot plus a caption they can edit ----- */
const canShare=()=>!!(NM.player&&NM.player.linked);
function shareCaption(){const st=myStats(),biz=B?B.name:'my business';
  return NM.player.name+' is building '+biz+' on Naija Market 🇳🇬\nLevel '+level()+' · ₦'+short(S.money)+' in the bank'+(st.branches?' · '+st.branches+' branches':'')+'.\nCome and play: '+location.origin+'/naija-market/';}
async function shareStart(){if(!G)return;draw();
  const src=cv,sc=Math.min(1,1080/src.width),c=document.createElement('canvas');c.width=Math.round(src.width*sc);c.height=Math.round(src.height*sc);c.getContext('2d').drawImage(src,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.85));if(!blob)return toast('Could not take a picture of your shop.',2);const url=URL.createObjectURL(blob);
  screen('<h1>Share to Community Square</h1><img class="shot" alt="Your shop" src="'+url+'"><label for="scap">What you want to say</label><textarea id="scap" maxlength="500"></textarea><p class="msg" id="amsg" hidden></p>'+
    '<button class="big go" id="spost" type="button">Post to my feed</button><button class="big alt" id="sauto" type="button">Write it for me again</button><button class="skip" id="sx" type="button">Cancel</button><p class="fine">Posts are public on Community Square.</p>');
  $('scap').value=shareCaption();$('sauto').onclick=()=>{$('scap').value=shareCaption();};$('sx').onclick=()=>{URL.revokeObjectURL(url);A.hidden=true;};
  $('spost').onclick=async()=>{const b=$('spost');b.disabled=true;amsg('');
    try{const up=await fetch('/api/uploads?kind=image',{method:'POST',credentials:'same-origin',headers:{'content-type':'image/jpeg'},body:blob});const uj=await up.json().catch(()=>({}));
      if(up.status===401){b.disabled=false;return amsg('Sign in to Community Square on this phone first. <a href="/" target="_blank" rel="noopener">Open Community Square</a>, then come back and post.',true);}
      if(!up.ok){b.disabled=false;return amsg(uj.error||'Could not upload the picture.');}
      const pr=await fetch('/api/posts',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({image_id:uj.id,caption:$('scap').value,visibility:'public'})});const pj=await pr.json().catch(()=>({}));
      if(!pr.ok){b.disabled=false;return amsg(pj.error||'Could not post.');}
      URL.revokeObjectURL(url);A.hidden=true;toast('Posted to your Community Square feed! 🎉',3);fanfare(false);}
    catch(e){b.disabled=false;amsg('Could not reach Community Square. Check your internet and try again.');}};}

/* ----- log out, and start-up ----- */
$('logout').addEventListener('click',async()=>{if(NM.pid)await nmPush();await nmApi('POST','/logout');NM.pid=null;NM.player=null;G=null;SAVE={sound:true,snd:2,cur:null,biz:{}};$('hqp').hidden=true;$('lb').hidden=true;$('lb2').hidden=true;const r=await nmApi('GET','/me');NM.cfg=r.j;showSignIn();});
(async()=>{if(location.protocol==='file:'){$('localnote').hidden=false;return;}
  A.innerHTML='<div class="in tour"><div class="ico">🧺</div><h1>Naija Market</h1><p class="sub">Opening your market...</p></div>';A.hidden=false;
  const r=await nmApi('GET','/me');
  if(!r.ok||!r.j||!('player' in r.j)){A.hidden=true;$('localnote').hidden=false;return;}   // not on Community Square: play locally on this device
  NM.cfg=r.j;if(r.j.player)return signedIn(r.j);showFront();})();
