/* ===== accounts: sign in (Community Square, Google, email), onboarding, cloud saves ===== */
const API=(window.NM_API||'')+'/api/naija',LEGACY='naijaMarket.v2';
const NM={pid:null,ver:0,timer:0,dirty:false,blocked:false,busy:false,player:null,cfg:null,mode:'login'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function nmApi(method,path,body,keep){try{const r=await fetch(API+path,{method,credentials:'same-origin',keepalive:!!keep,headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});
  const t=await r.text();let j=null;try{j=JSON.parse(t);}catch(e){}return{ok:r.ok,status:r.status,j};}catch(e){return{ok:false,status:0,j:null};}}
const sumLv=b=>1+Object.values(b.pads||{}).reduce((a,p)=>a+(p.l||0),0)+Object.values(b.emp||{}).reduce((a,v)=>a+(+v||0),0);
const bestLv=d=>Math.max(0,...Object.values((d&&d.biz)||{}).map(sumLv));
function localLegacy(){try{const s=JSON.parse(localStorage.getItem(LEGACY)||'null');return s&&s.biz&&Object.keys(s.biz).length?s:null;}catch(e){return null;}}

/* ----- cloud sync ----- */
cloudHook=()=>{if(!NM.pid||NM.blocked||NM.timer)return;NM.timer=setTimeout(()=>{NM.timer=0;nmPush();},10000);};
async function nmPush(keep){if(!NM.pid||NM.blocked||NM.busy)return;clearTimeout(NM.timer);NM.timer=0;NM.busy=true;
  const r=await nmApi('PUT','/save',{version:NM.ver,data:SAVE,level:bestLv(SAVE)},keep);NM.busy=false;
  if(r.ok&&r.j)NM.ver=r.j.version;
  else if(r.status===409&&r.j&&r.j.conflict){NM.blocked=true;acctConflict(r.j);}
  else if(r.status===401){NM.pid=null;acctShow('login','Your session ended. Please sign in again.');}
  else cloudHook();}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G)save(),nmPush(true);});
addEventListener('pagehide',()=>{if(NM.pid)nmPush(true);});

/* ----- overlay ----- */
const A=document.createElement('div');A.id='acct';A.hidden=true;document.body.appendChild(A);
const field=(id,label,type,ph,ac)=>'<label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" placeholder="'+ph+'" autocomplete="'+ac+'">';
function acctShow(mode,msg){NM.mode=mode;const c=NM.cfg||{},m=c.member;let h='<div class="in"><h1>Naija Market</h1><p class="sub">Run a Nigerian business from a roadside spot to 500 stores worldwide. Sign in so your game is saved to you, on any phone.</p>';
  if(msg)h+='<p class="msg" id="amsg">'+esc(msg)+'</p>';else h+='<p class="msg" id="amsg" hidden></p>';
  h+='<button class="big cs" id="acs" type="button">'+(m?'Continue as '+esc(m.name)+' (Community Square)':'Continue with Community Square')+'</button>';
  if(c.googleClientId)h+='<div id="ag" class="ag"></div>';
  h+='<div class="or"><span>or use your email</span></div><div class="tabs"><button id="tsu" type="button" class="'+(mode==='signup'?'on':'')+'">Create account</button><button id="tli" type="button" class="'+(mode==='login'?'on':'')+'">Log in</button></div>';
  if(mode==='signup')h+=field('an','Your name','text','e.g. Ada Obi','name')+field('ae','Email','email','you@example.com','email')+field('ap','Password (8 or more characters)','password','Choose a password','new-password')+field('ay','Year you were born (optional)','number','e.g. 2005','off');
  else h+=field('ae','Email','email','you@example.com','email')+field('ap','Password','password','Your password','current-password');
  h+='<label class="chk"><input id="am" type="checkbox"> <span>Send me news about Naija Market and Community Square. <small>Optional. Marketing email only goes to adults who tick this box.</small></span></label>';
  h+='<button class="big go" id="ago" type="button">'+(mode==='signup'?'Create my account':'Log in')+'</button><p class="fine">We use your email to save your game and nothing else, unless you tick the box above. Anyone can play. Community Square itself is for adults (18+).</p></div>';
  A.innerHTML=h;A.hidden=false;A.scrollTop=0;
  $('tsu').onclick=()=>acctShow('signup');$('tli').onclick=()=>acctShow('login');$('acs').onclick=acctMember;$('ago').onclick=acctEmail;
  if(c.googleClientId)googleButton();}
function amsg(t){const e=$('amsg');if(e){e.textContent=t;e.hidden=!t;}}
const wantMail=()=>!!($('am')&&$('am').checked);
async function acctMember(){const r=await nmApi('POST','/member',{marketing:wantMail()});if(r.ok)return signedIn(r.j);
  if(r.j&&r.j.needMember){amsg('');A.querySelector('.msg').innerHTML='You are not signed in to Community Square on this phone yet. <a href="/" target="_blank" rel="noopener">Open Community Square</a>, sign in, then come back and tap this button again.';A.querySelector('.msg').hidden=false;}else amsg((r.j&&r.j.error)||'Could not reach Community Square. Check your internet and try again.');}
async function acctEmail(){const b=$('ago');b.disabled=true;const signup=NM.mode==='signup';
  const body={email:$('ae').value,password:$('ap').value,marketing:wantMail()};if(signup){body.name=$('an').value;body.birthYear=$('ay').value||undefined;}
  const r=await nmApi('POST',signup?'/signup':'/login',body);b.disabled=false;if(r.ok)return signedIn(r.j);
  amsg((r.j&&r.j.error)||'Could not reach the server. Check your internet and try again.');if(r.j&&r.j.useMember)$('acs').focus();}
function googleButton(){const go=()=>{try{google.accounts.id.initialize({client_id:NM.cfg.googleClientId,callback:async resp=>{const r=await nmApi('POST','/google',{credential:resp.credential,marketing:wantMail()});if(r.ok)signedIn(r.j);else amsg((r.j&&r.j.error)||'Google sign-in failed. Please try again.');}});
    google.accounts.id.renderButton($('ag'),{theme:'filled_blue',size:'large',text:'continue_with',shape:'pill',width:Math.min(300,innerWidth-48)});}catch(e){}};
  if(window.google&&google.accounts)return go();if(document.getElementById('gsi'))return;const s=document.createElement('script');s.id='gsi';s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=go;document.head.appendChild(s);}

/* ----- after sign-in: pick the right save, then the welcome tour ----- */
function adopt(data,ver){SAVE=data;if(SAVE.snd==null)SAVE.snd=SAVE.sound===false?0:2;NM.ver=ver;NM.blocked=false;try{localStorage.setItem(KEY,JSON.stringify(SAVE));}catch(e){}}
async function signedIn(j){NM.pid=j.player.id;NM.player=j.player;KEY='naijaMarket.v3.'+NM.pid;const cloud=j.save,old=localLegacy();
  if(cloud){adopt(cloud.data,cloud.version);
    if(old&&bestLv(old)>bestLv(cloud.data)+2&&!sessionStorage.getItem('nm.asked.'+NM.pid)){sessionStorage.setItem('nm.asked.'+NM.pid,'1');return acctChoose(old,cloud.data);}}
  else if(old){adopt(old,0);nmPush();toast('Your game from this browser is now saved to your account.',5);}
  else{adopt({sound:true,snd:2,cur:null,biz:{}},0);}
  if(G)G=null;finish();}
function acctChoose(old,cloud){A.innerHTML='<div class="in"><h1>Which game?</h1><p class="sub">This browser has a more advanced game than your account.</p><button class="big go" id="co" type="button">Use this browser\'s game (level '+bestLv(old)+')</button><button class="big alt" id="cc" type="button">Keep my account\'s game (level '+bestLv(cloud)+')</button><p class="fine">The one you do not pick is left untouched until you play, then it is replaced.</p></div>';
  $('co').onclick=()=>{adopt(old,NM.ver);nmPush();finish();};$('cc').onclick=finish;}
function acctConflict(s){A.innerHTML='<div class="in"><h1>Played somewhere else</h1><p class="sub">This game was saved from another phone or tab since you opened it. Pick which one to keep.</p><button class="big go" id="cl" type="button">Load the newest save</button><button class="big alt" id="ck" type="button">Keep this screen\'s game</button></div>';A.hidden=false;
  $('cl').onclick=()=>{if(s.data){adopt(s.data,s.version);G=null;finish();}else location.reload();};$('ck').onclick=()=>{NM.ver=s.version;NM.blocked=false;nmPush();A.hidden=true;};}
const TOUR=[['🧺','Pick a business','Cook jollof, farm yam, grill suya, sell fabric or phones. Each business has its own colour, staff and story.'],
  ['🏃','Walk, work, sell','Drag to walk. Circle your crops with the rope, carry goods on your head, serve customers and stand on price pads to upgrade.'],
  ['🏢','Build an empire','Grow your shop into a huge flagship, then hire a manager, sign export contracts and open up to 500 stores across Nigeria, Africa and the world.'],
  ['💸','Run it like real life','Staff are paid every 30 days and tax is due. At 8 PM you drive home through go-slow, eat, bath and sleep. Come back tomorrow, the market opens early.']];
const seenTour=()=>{SAVE.onb=1;if(cloudHook)cloudHook();try{localStorage.setItem(KEY,JSON.stringify(SAVE));}catch(e){}};
function finish(){if(SAVE.onb)return enterGame();let i=0;
  const step=()=>{const t=TOUR[i];A.innerHTML='<div class="in tour"><div class="dots">'+TOUR.map((_,n)=>'<i class="'+(n===i?'on':'')+'"></i>').join('')+'</div><div class="ico">'+t[0]+'</div><h1>'+t[1]+'</h1><p class="sub">'+t[2]+'</p><button class="big go" id="tn" type="button">'+(i<TOUR.length-1?'Next':'Start playing')+'</button><button class="skip" id="ts" type="button">Skip</button></div>';
    $('tn').onclick=()=>{if(++i<TOUR.length)step();else{seenTour();enterGame();}};$('ts').onclick=()=>{seenTour();enterGame();};};step();}
function enterGame(){A.hidden=true;$('who').textContent=NM.player?NM.player.name:'';$('logout').hidden=!NM.pid;showMenu();}

/* ----- log out, and start-up ----- */
$('logout').addEventListener('click',async()=>{if(NM.pid)await nmPush();await nmApi('POST','/logout');NM.pid=null;NM.player=null;G=null;SAVE={sound:true,snd:2,cur:null,biz:{}};$('hqp').hidden=true;$('pick').hidden=false;const r=await nmApi('GET','/me');NM.cfg=r.j;acctShow('login');});
(async()=>{const r=await nmApi('GET','/me');
  if(!r.ok||!r.j||!('player' in r.j)){$('localnote').hidden=false;return;}   // not on Community Square: play locally on this device
  NM.cfg=r.j;if(r.j.player)return signedIn(r.j);acctShow('signup');})();
