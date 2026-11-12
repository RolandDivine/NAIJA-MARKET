/* ===== Koko Reel Entertainment: research rules from plan3/media.json on top of the shop engine =====
   Weddings and song mixing are the safe cash floor. Films are made on the Greenlight Board (budget paid daily), classified,
   run in cinemas on the sliding 50/45/40 split, then licensed to streaming per territory. Songs earn royalties per play.
   Box office and royalties follow the formulas only; there is no hidden quality roll. All names are invented. */
const MDR={crew:[600000,1500000,3000000],crewQ:[40,70,95],
  cast:[500000,3000000,10000000],castQ:[40,70,95], // cast fees per film: estimate (research has no figure)
  post:1500000,days:[5,20,40],fmt:['Short film','Feature','Big feature'],
  screens:[0,60,120], // screens a distributor books for a feature / big feature: estimate
  own:4,ticket:6800,tax:.1,split:[.5,.45,.4],dist:.12,snack:[2700,3400],snackCost:.2,
  cls:78000,fast:50000,lic0:5000000,licMax:60000000,play:2,adv:2000000,
  song:1000000,promo:[[1,0],[1.5,2000000],[2,5000000]], // song production and promo costs: estimate
  sec:[2000000,10000000,50000000],script:1000000,stand:5000000, // security, writers' room and snack stand prices: estimate
  exh:1150000,fire:500000,cmo:50000,online:1000000,prem:3000000, // exhibitor N1m + premises N150k (research); fire check, CMO, online, premiere ratings: estimate
  postQ:[0,35,55,70,85,95,100], // post-production weeks to score: estimate
  genres:[['Family comedy','PG',1],['Love drama','12A',1],['Crime thriller','18',.75]],
  terr:['Nigeria','Ghana','South Africa','UK','North America'],
  titles:['Danfo Love','Third Mainland Sunrise','Harmattan Kings','Owambe Overtime','Lagoon Letters','Rain on Ojuelegba','Jollof Diplomats','Last Bus to Ikorodu','Balogun Blues','Moonlight on Marina'],
  artists:['Zinny Bloom','Tobi Waves','Ada Starlight','Kwame Echo','Lola Breeze','Femi Groove'],
  songs:['Soft Landing','Jollof Heartbeat','Third Floor Dance','Harmattan Kiss','Keke to Your Heart','Gold Reel','Sunday Rice','Lagos Rain','Small Small','Owambe Queen'],
  pay:{editor:250000,engineer:200000,camera:220000,props:80000,cashier:90000,manager:350000}};
const isMedia=()=>SAVE.cur==='media'&&B&&B.isNew;
function mdState(){const s=S.md=S.md||{};const d={wed:0,mixed:0,script:0,sec:0,dist:false,copy:false,cmo:false,exh:false,fire:false,online:false,prem:false,stand:false,
    cap:0,split:50,promo:0,draft:{f:0,g:0,c:0,k:0,p:3},proj:null,films:[],artists:[],songs:[],nid:1,day:{},mo:{rev:0,cost:0},hist:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  if(lvl('line3')&&!s.artists.length)s.artists.push({n:MDR.artists[0],t:60,adv:MDR.adv,rec:0,loy:70,owed:0,gone:false});
  if(lvl('line4')){s.exh=true;s.fire=true;}if(stage()>=2)s.dist=true;return s;}
const mdTrend=(g,wk)=>{const x=Math.sin((wk+1)*12.9898+g*78.233)*43758.5453;return Math.round((.7+.6*(x-Math.floor(x)))*100)/100;};
const mdWk=()=>Math.floor(S.day/7);
const mdQ=d=>Math.round(.3*Math.min(100,40+12*S.md.script)+.25*MDR.castQ[d.c]+.2*MDR.crewQ[d.k]+.15*MDR.postQ[d.p]+.1*(d.sched==null?100:d.sched));
const mdBudget=d=>MDR.days[d.f]*MDR.crew[d.k]+MDR.cast[d.c]+d.p*MDR.post;
const mdCost=(n,k)=>{const s=S.md;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const mdIn=(n,k)=>{const s=S.md;n=Math.round(n);S.money+=n;S.mo.rev+=n;s.mo.rev+=n;s.day[k]=(s.day[k]||0)+n;};
const mdInRun=()=>S.md.films.some(f=>f.rel>=0&&!f.done);
const mdWeeks=f=>f.rel<0?0:Math.floor((S.day-f.rel)/7);
const mdLicFee=f=>Math.round(Math.min(MDR.licMax,(MDR.lic0+.15*f.gross)*(f.Q/70))*(f.leak?.8:1));
function mdNextLic(){for(const f of S.md.films){if(f.cls<2||f.sold.length>=MDR.terr.length)continue;
    if(f.fmt===0||f.early||f.done||mdWeeks(f)>=6)return f;}return null;}

/* ----- customers ----- */
function mdDemand(){mdState();return mdInRun()?1.1:1;} // estimate: a film in cinemas brings a little extra walk-in trade
function mdLineW(i){const s=mdState();if(i===2)return mdNextLic()?1:0;
  if(i===3){const n=s.artists.filter(a=>!a.gone).length;return n?Math.min(2,.5+.5*n):0;}return 1;}
function mdSale(i,c,q,amt){const s=mdState();
  if(i===0)s.wed+=q;if(i===1)s.mixed+=q;
  if(i===2){const f=mdNextLic();if(!f)return 0;const t=MDR.terr[f.sold.length];f.sold.push(t);amt=Math.round(mdLicFee(f)*(evx('price_up')?1.25:1));f.lic=(f.lic||0)+amt;
    toast('🎞️ '+f.name+' licensed to streaming in '+t+': ₦'+short(amt)+'.',3);}
  if(i===4){// own cinema: 10% tax off; film rent (about half) goes out unless our own film is showing. Snacks stay with us.
    const net=amt*(1-MDR.tax),kept=mdInRun()?net:net*.5,sn=q*MDR.snack[s.stand?1:0]*(1-MDR.snackCost);amt=Math.round(kept+sn);}
  s.mo.rev+=amt;return amt;}

/* ----- nights: shoot and post, box office weeks, royalties ----- */
function mdNight(){if(!isMedia())return[];const s=mdState(),rows=[],P=s.proj;
  if(P){if(P.phase==='shoot'){const rate=MDR.crew[P.k];
      if(S.money<3*rate){P.sched=Math.max(0,P.sched-8);toast('🎬 Cash is below 3 days of crew pay. The crew stopped the set: schedule −8. Pay from savings or a loan.',5);}
      else{if(!P.castPaid){mdCost(MDR.cast[P.c],'shoot');P.castPaid=1;}mdCost(rate,'shoot');P.left--;if(P.left<=0){P.phase='post';P.postLeft=P.p*7;}}}
    else{mdCost(Math.round(MDR.post/7),'post');P.postLeft--;
      if(P.postLeft<=0){const Q=mdQ(P);s.films.push({id:P.id,name:P.name,fmt:P.f,g:P.g,Q,budget:P.budget,cls:0,rel:-1,adm1:0,last:0,gross:0,share:0,sold:[],lic:0,leak:false,early:false,halve:false,done:false,scr:0});
        s.proj=null;banner('IT\'S A WRAP',P.name+' is finished. Quality '+Q+'.');fanfare(Q>=70);}}}
  for(const f of s.films){if(f.cls===1&&S.day>f.clsDay)f.cls=2;
    if(f.rel<0||f.done)continue;const d=S.day-f.rel;if(d<=0||d%7)continue;const wk=d/7;
    let adm=wk===1?f.scr*35*Math.pow(f.Q/50,2)*mdTrend(f.g,Math.floor(f.rel/7))*MDR.genres[f.g][2]*(f.leak?.7:1):f.last*(.45+.004*f.Q);
    if(f.halve){adm*=.5;f.halve=false;}adm=Math.round(adm);if(wk===1)f.adm1=adm;f.last=adm;
    const own=lvl('line4')?MDR.own:0,oa=Math.round(adm*own/f.scr),ra=adm-oa,sp=MDR.split[Math.min(2,wk-1)];
    const share=ra*MDR.ticket*(1-MDR.tax)*sp*(1-MDR.dist)+oa*MDR.ticket*(1-MDR.tax)*(sp*(1-MDR.dist)+1-sp),sn=oa*MDR.snack[s.stand?1:0]*(1-MDR.snackCost);
    f.gross+=adm*MDR.ticket;f.share+=share+sn;mdIn(share,'box');if(sn)mdIn(sn,'snack');
    if(adm<.05*f.adm1||wk>=20){f.done=true;
      if(f.share<.5*f.budget){s.cap=Math.round(.6*f.budget);toast('📉 '+f.name+' earned under half its budget in cinemas. The bank caps your next greenlight at ₦'+short(s.cap)+'.',6);}
      else{s.cap=0;toast('🍿 '+f.name+' ends its cinema run: ₦'+short(f.gross)+' gross, ₦'+short(f.share)+' to you.',5);}}}
  let roy=0;for(const g of s.songs){const a=s.artists[g.a],dd=S.day-g.d0;let pl=Math.round(g.peak*Math.pow(.98,dd)+.02*g.peak);if(evx('demand_up'))pl*=2;g.pl=pl;
    const inc=pl*MDR.play;g.earned+=inc;roy+=inc;let rest=inc;if(a.rec<a.adv){const r=Math.min(rest,a.adv-a.rec);a.rec+=r;rest-=r;}a.owed+=Math.round(rest*s.split/100);}
  if(roy)mdIn(roy,'roy');
  const D=s.day;if(D.shoot)rows.push(['Shoot day: crew and cast','-₦'+fmt(D.shoot),'#ffb3a3']);if(D.post)rows.push(['Post-production','-₦'+fmt(D.post),'#ffb3a3']);
  if(D.box)rows.push(['Box office share (week)','₦'+fmt(D.box),'#b9ffcf']);if(D.snack)rows.push(['Popcorn and drinks, own screens','₦'+fmt(D.snack),'#b9ffcf']);
  if(D.roy)rows.push(['Song plays (₦2 each)','₦'+fmt(D.roy),'#b9ffcf']);s.day={};return rows;}
function mdMonth(M){if(!isMedia())return{rows:[],cost:0,or:0};const s=mdState(),rows=[];let paid=0;
  for(const a of s.artists){if(a.owed>0){if(S.money>=a.owed){S.money-=a.owed;paid+=a.owed;a.owed=0;if(s.split>=50)a.loy=Math.min(100,a.loy+5);}
      else{a.loy-=20;toast('🎤 '+a.n+'\'s royalties are late. Loyalty −20.',4);}}
    if(s.split<40)a.loy-=10;
    if(!a.gone&&a.loy<30){a.gone=true;toast('🎤 '+a.n+' signed with Chief Bola Thunderbox. Old songs keep earning; new songs stop.',6);}}
  if(paid)rows.push(['Artist royalties paid','-₦'+fmt(paid),'#ffb3a3']);
  const cost=s.mo.cost+paid,r=s.mo.rev;s.mo={rev:0,cost:0};if(r)s.hist.push(Math.round((cost+M.wages)/r*100));if(s.hist.length>24)s.hist.shift();
  return{rows,cost,or:s.hist[s.hist.length-1]||0};}
function mdCrew(){if(!isMedia())return[];const P=MDR.pay,r=[];
  if(stage()>=1){r.push({name:'Video editor',n:1,each:P.editor});r.push({name:'Sound engineer',n:1,each:P.engineer});}
  if(lvl('line2')){r.push({name:'Camera operator',n:1,each:P.camera});r.push({name:'Props runner',n:1,each:P.props});}
  if(lvl('line3'))r.push({name:'Artist manager',n:1,each:P.manager});if(lvl('line4'))r.push({name:'Box office cashiers',n:2,each:P.cashier});return r;}

/* ----- stage gates (research licences and gates) ----- */
function mdGate(st){const s=mdState(),best=Math.max(0,...s.films.filter(f=>f.fmt===0).map(f=>f.Q));
  if(st.base==='venue'&&st.n===1&&s.wed<10)return'🔒 Deliver 10 wedding videos first ('+s.wed+' so far).';
  if(st.base==='line'&&st.arg===2&&best<55)return'🔒 Make a short film with quality 55+ for a festival slot (best so far: '+(best||'none')+'). Use the Greenlight Board in HQ.';
  if(st.base==='venue'&&st.n===2&&(!s.dist||!s.films.some(f=>f.cls===2)))return'🔒 Get a film classified and sign a distributor contract (HQ).';
  if(st.base==='line'&&st.arg===3&&(!s.copy||!s.cmo||!s.artists.length))return'🔒 Notify copyright, join the collecting society and sign your first artist (HQ).';
  if(st.base==='line'&&st.arg===4&&(!s.exh||!s.fire))return'🔒 Get the exhibitor and premises licences and pass the fire and food-safety check (HQ).';
  if(st.base==='venue'&&st.n===3){const fo=s.films.reduce((a,f)=>a+f.sold.filter(t=>t!=='Nigeria').length,0);
    if(!s.online||s.sec<3||fo<2)return'🔒 Needs the online exhibition licence, drive security level 3 and 2 foreign licence deals ('+fo+' so far).';}
  if(st.base==='venue'&&st.n===4&&(!s.prem||!s.films.some(f=>f.Q>=85&&f.cls===2)))return'🔒 Needs ratings in each premiere country and one classified film with quality 85+.';
  return null;}

/* ----- HQ: Greenlight Board, Release Planner, Royalty Ledger, paperwork ----- */
function mdSeg(id,arr,on,lock){return'<div class="seg" id="'+id+'">'+arr.map((t,i)=>'<button class="ghost'+(i===on?' on':'')+'" data-v="'+i+'" type="button"'+(lock&&lock(i)?' disabled':'')+'>'+t+'</button>').join('')+'</div>';}
function mdHtml(){const s=mdState(),d=s.draft,wk=mdWk();let h='<h2>Koko Reel studio</h2><div class="stats"><div class="stat">Wedding videos<b>'+s.wed+'</b></div><div class="stat">Songs mixed<b>'+s.mixed+'</b></div><div class="stat">Script desk<b>'+Math.min(100,40+12*s.script)+' / 100</b></div><div class="stat">Drive security<b>Level '+s.sec+'</b></div></div>';
  h+='<h2>Greenlight Board</h2>';
  if(stage()<1)h+='<p class="note">Open the egg-crate studio first. Weddings and song mixing pay the bills until then.</p>';
  else if(s.proj){const P=s.proj;h+='<p class="note">Now making <b>'+P.name+'</b> ('+MDR.fmt[P.f]+'). '+(P.phase==='shoot'?P.left+' shoot days left at ₦'+fmt(MDR.crew[P.k])+' a day.':'Post-production: '+P.postLeft+' days left.')+' Schedule score '+P.sched+'. Forecast quality '+mdQ(P)+'.</p>';
    if(P.phase==='shoot'&&P.left>1)h+='<div class="acts"><button class="ghost" data-md="cut" type="button">✂️ Cut a shoot day (saves ₦'+short(MDR.crew[P.k])+', schedule −8)</button></div>';}
  else{if(d.f===1&&!lvl('line2'))d.f=0;if(d.f===2&&stage()<2)d.f=0;
    h+=mdSeg('mdf',MDR.fmt.map((t,i)=>t+' · '+MDR.days[i]+' days'),d.f,i=>(i===1&&!lvl('line2'))||(i===2&&stage()<2));
    h+=mdSeg('mdg',MDR.genres.map((g,i)=>g[0]+' ('+g[1]+') ×'+mdTrend(i,wk)),d.g);
    h+=mdSeg('mdc',['Cast: new faces ₦0.5m','Known cast ₦3m','Star cast ₦10m'],d.c);
    h+=mdSeg('mdk',['Crew: basic ₦0.6m/day','Pro ₦1.5m/day','Elite ₦3m/day'],d.k);
    h+=mdSeg('mdp',[1,2,3,4,5,6].map(w=>w+' wk post'),d.p-1);
    const b=mdBudget(d),Q=mdQ(d),over=s.cap&&b>s.cap;
    h+='<p class="note">Locked budget ₦'+fmt(b)+' ('+MDR.days[d.f]+' days × crew + cast + '+d.p+' weeks × ₦1.5m), paid day by day. Forecast quality <b>'+Q+'</b> = 30% script + 25% cast + 20% crew + 15% post + 10% schedule. Genre trend this week, next week: '+MDR.genres.map((g,i)=>g[0]+' '+mdTrend(i,wk)+' → '+mdTrend(i,wk+1)).join(', ')+'. An 18 rating cuts opening week by 25%.'+(s.cap?' Bank cap after a flop: ₦'+short(s.cap)+'.':'')+'</p>';
    h+='<div class="acts"><button class="ghost" data-md="green" type="button"'+(over?' disabled':'')+'>🎬 Greenlight · ₦'+short(b)+'</button><button class="ghost" data-md="script" type="button"'+(s.script>=5?' disabled':'')+'>✍️ Writers\' room · ₦1m (script +12)</button></div>';}
  if(s.films.length){h+='<h2>Release planner</h2><table><tr><td><b>Title</b></td><td><b>Status</b></td></tr>';
    for(const f of s.films){const wkx=mdWeeks(f);let st=f.cls===0?'Not classified':f.cls===1?'At the film board (ready tomorrow)':f.fmt===0?'Festival short':f.rel<0?'Classified, not released':f.done?'Cinema run over':'In cinemas, week '+(wkx+1);
      h+='<tr><td>'+f.name+' · Q'+f.Q+' · '+MDR.genres[f.g][1]+(f.leak?' · leaked':'')+'</td><td>'+st+'<br>Gross ₦'+short(f.gross)+' · yours ₦'+short(f.share)+' · licences '+f.sold.length+'/5 (₦'+short(f.lic||0)+')';
      if(f.cls===0)h+='<br><button class="ghost" data-md="cls'+f.id+'" type="button">Classify ₦78,000</button><button class="ghost" data-md="fast'+f.id+'" type="button">Fast track +₦50,000</button>';
      if(f.cls===2&&f.fmt>0&&f.rel<0)h+='<br><button class="ghost" data-md="rel'+f.id+'" type="button"'+(s.dist?'':' disabled')+'>🍿 Release in cinemas</button>';
      if(f.rel>=0&&!f.done&&!f.early&&wkx<6)h+='<br><button class="ghost" data-md="early'+f.id+'" type="button">Sell streaming early (screens −50%)</button>';
      h+='</td></tr>';}
    h+='</table><p class="note">Cinema first, at least 6 weeks; then distributors buy streaming licences at the counter, one territory each: ₦5m + 15% of cinema gross, × quality/70, up to ₦60m. Tickets: 10% tax off, then you get 50% in week 1, 45% in week 2, 40% after; the distributor keeps 12% of that. Your own screens keep the cinema half and the popcorn.</p>';}
  h+='<h2>Royalty ledger</h2>';
  if(s.artists.length){h+='<table><tr><td><b>Artist</b></td><td><b>Advance repaid · owed · loyalty</b></td></tr>';
    s.artists.forEach((a,i)=>{h+='<tr><td>'+a.n+' (talent '+a.t+')'+(a.gone?' · left for Thunderbox':'')+'</td><td>₦'+short(a.rec)+' of ₦'+short(a.adv)+' · ₦'+fmt(a.owed)+' · '+a.loy+(a.gone?'':'<br><button class="ghost" data-md="song'+i+'" type="button">🎵 Release a song · ₦'+short(MDR.song+MDR.promo[s.promo][1])+'</button>')+'</td></tr>';});
    h+='</table>';}
  h+='<p class="note">Artist share after the advance is repaid. Under 40% or late royalties lower loyalty; under 30 the artist leaves (old songs keep earning).</p>'+mdSeg('mds',['50%','45%','40%','30%'],[50,45,40,30].indexOf(s.split));
  h+='<p class="note">Promotion for the next song (plays at peak ×1, ×1.5, ×2).</p>'+mdSeg('mdpr',['No promo','Radio and posters ₦2m','Full push ₦5m'],s.promo);
  if(s.songs.length){h+='<table><tr><td><b>Song</b></td><td><b>Plays a day · earned</b></td></tr>';for(const g of s.songs.slice(-6))h+='<tr><td>'+g.t+' · '+s.artists[g.a].n+' · Q'+g.Q+'</td><td>'+fmt(g.pl||0)+' · ₦'+short(g.earned)+'</td></tr>';h+='</table>';}
  h+='<div class="acts">'+(stage()>=1&&s.artists.length<MDR.artists.length?'<button class="ghost" data-md="sign" type="button">✍️ Sign an artist · ₦2m advance</button>':'')+'</div>';
  const pw=(k,t,c)=>'<tr><td>'+t+'</td><td>'+(s[k]?'✅':'<button class="ghost" data-md="pw'+k+'" type="button">'+(c?'₦'+fmt(c):'Free')+'</button>')+'</td></tr>';
  h+='<h2>Paperwork and upgrades</h2><table>'+pw('dist','Distributor contract (12% fee)',0)+pw('copy','Copyright notified for masters',0)+pw('cmo','Collecting society membership',MDR.cmo)+pw('exh','Exhibitor and premises licences',MDR.exh)+pw('fire','Fire and food-safety check',MDR.fire)+pw('online','Online exhibition licence',MDR.online)+pw('prem','Ratings in premiere countries',MDR.prem)+pw('stand','Upgraded snack stand (₦3,400 a head)',MDR.stand);
  h+='<tr><td>Drive security level '+s.sec+' (a leak hits when level is under quality ÷ 30)</td><td>'+(s.sec<3?'<button class="ghost" data-md="sec" type="button">Upgrade · ₦'+short(MDR.sec[s.sec])+'</button>':'✅')+'</td></tr></table>';
  return h;}
function mdBind(){if(!isMedia())return;const s=mdState(),re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return false;}S.money-=n;S.spent=(S.spent||0)+n;s.mo.cost+=n;f();fanfare(false);re();return true;};
  const seg=(id,f)=>document.querySelectorAll('#'+id+' [data-v]').forEach(b=>b.onclick=()=>{f(+b.dataset.v);re();});
  seg('mdf',v=>s.draft.f=v);seg('mdg',v=>s.draft.g=v);seg('mdc',v=>s.draft.c=v);seg('mdk',v=>s.draft.k=v);seg('mdp',v=>s.draft.p=v+1);
  seg('mds',v=>s.split=[50,45,40,30][v]);seg('mdpr',v=>s.promo=v);
  const F=id=>s.films.find(f=>f.id===id);
  document.querySelectorAll('#hqin [data-md]').forEach(b=>b.onclick=()=>{const k=b.dataset.md;
    if(k==='green'&&!s.proj){const d=s.draft,id=s.nid++;s.proj={id,name:MDR.titles[(id-1)%MDR.titles.length]+(id>MDR.titles.length?' '+Math.ceil(id/MDR.titles.length):''),f:d.f,g:d.g,c:d.c,k:d.k,p:d.p,left:MDR.days[d.f],sched:100,phase:'shoot',budget:mdBudget(d)};
      toast('🎬 Greenlit: '+s.proj.name+'. Crew is paid each night of the shoot.',4);re();}
    if(k==='cut'&&s.proj&&s.proj.left>1){s.proj.left--;s.proj.sched=Math.max(0,s.proj.sched-8);s.proj.budget-=MDR.crew[s.proj.k];re();}
    if(k==='script'&&s.script<5)buy(MDR.script,()=>s.script++);
    if(k==='sec'&&s.sec<3)buy(MDR.sec[s.sec],()=>s.sec++);
    if(k.startsWith('cls')){const f=F(+k.slice(3));if(f&&!f.cls)buy(MDR.cls,()=>{f.cls=1;f.clsDay=S.day;});}
    if(k.startsWith('fast')){const f=F(+k.slice(4));if(f&&!f.cls)buy(MDR.cls+MDR.fast,()=>{f.cls=2;});}
    if(k.startsWith('rel')){const f=F(+k.slice(3));if(f&&f.rel<0&&s.dist){f.rel=S.day;f.scr=MDR.screens[f.fmt]+(lvl('line4')?MDR.own:0);f.leak=s.sec<f.Q/30;
      toast(f.leak?'🏴 A copy of '+f.name+' leaked before release: tickets −30%, licences −20%. Raise drive security for the next film.':'🍿 '+f.name+' opens on '+f.scr+' screens this week.',5);re();}}
    if(k.startsWith('early')){const f=F(+k.slice(5));if(f&&!f.early){f.early=true;f.halve=true;re();}}
    if(k.startsWith('song')){const a=s.artists[+k.slice(4)];if(a&&!a.gone){const pr=MDR.promo[s.promo];buy(MDR.song+pr[1],()=>{const Q=Math.min(100,a.t+5*Math.max(0,lvl('line1')-1));
      s.songs.push({t:MDR.songs[s.songs.length%MDR.songs.length],a:+k.slice(4),Q,peak:Math.round(2000*Math.pow(Q/50,3)*pr[0]),d0:S.day,earned:0,pl:0});});}}
    if(k==='sign'&&s.artists.length<MDR.artists.length)buy(MDR.adv,()=>s.artists.push({n:MDR.artists[s.artists.length],t:rnd(45,75),adv:MDR.adv,rec:0,loy:70,owed:0,gone:false}));
    if(k.startsWith('pw')){const key=k.slice(2),c={dist:0,copy:0,cmo:MDR.cmo,exh:MDR.exh,fire:MDR.fire,online:MDR.online,prem:MDR.prem,stand:MDR.stand}[key];
      if(!s[key]){if(c)buy(c,()=>s[key]=true);else{s[key]=true;re();}}}});}

/* ----- drawings: items, stations and the map ----- */
XITEM.card=(g,a,b)=>{R(g,-9,-16,18,16,2,a);R(g,-9,-16,18,4,1,b);for(let i=0;i<4;i++)R(g,-6+i*4,-4,2,4,0,'#f2c230');};
XITEM.reel=(g,a,b)=>{E(g,0,-9,11,9,a);E(g,0,-9,4,4,b);for(let i=0;i<5;i++){const t=i*1.256;E(g,Math.cos(t)*7,-9+Math.sin(t)*6,2,2,'rgba(0,0,0,.35)');}};
XITEM.ticket=(g,a,b)=>{R(g,-12,-14,24,13,2,a);R(g,4,-14,2,13,0,b);R(g,-9,-10,10,2,0,b);R(g,-9,-6,7,2,0,b);};
XITEM.disc=(g,a,b)=>{E(g,0,-9,10,9,a);E(g,0,-9,6,6,'#3a3f46');E(g,0,-9,3,3,b);E(g,-3,-12,2,1.5,'rgba(255,255,255,.4)');};
XSTATION.edit=col=>{rr(-44,-6,88,10,3,'#5a3a22');rr(-38,4,6,22,2,'#3a2414');rr(32,4,6,22,2,'#3a2414');rr(-38,-42,34,26,3,'#22252b');rr(-35,-39,28,20,2,col);rr(4,-42,34,26,3,'#22252b');rr(7,-39,28,20,2,'#3a6a9a');rr(-24,-16,6,10,1,'#22252b');rr(18,-16,6,10,1,'#22252b');rr(-14,-12,28,5,2,'#c9ced2');};
XSTATION.mixer=col=>{rr(-46,-14,92,22,4,'#2a2d33');for(let i=0;i<10;i++){rr(-40+i*8.4,-10,3,14,1,'#555');rr(-41.5+i*8.4,-6+(i*5)%10,6,4,1,col);}rr(-30,-44,24,30,3,'#1b1d22');ell(-18,-29,8,8,'#3a3f46');rr(6,-44,24,30,3,'#1b1d22');ell(18,-29,8,8,'#3a3f46');rr(-42,8,6,18,2,'#22252b');rr(36,8,6,18,2,'#22252b');};
XSTATION.stage=col=>{rr(-48,-8,96,22,3,'#3a2a4a');rr(-48,-12,96,6,2,col);rr(-2,-46,4,36,1,'#9aa0a6');ell(0,-46,5,5,'#22252b');rr(-40,-36,16,26,3,'#1b1d22');ell(-32,-27,5,5,'#555');rr(24,-36,16,26,3,'#1b1d22');ell(32,-27,5,5,'#555');};
XSTATION.projector=col=>{rr(-34,-30,58,26,5,'#2a2d33');ell(30,-17,10,10,'#1b1d22');ell(30,-17,6,6,'#7ad1ff');ell(-18,-40,12,12,col);ell(4,-40,12,12,col);ell(-18,-40,4,4,'#22252b');ell(4,-40,4,4,'#22252b');rr(-6,-4,10,26,2,'#555');rr(-24,20,46,6,2,'#3a3f46');};
function mdStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  if(li===0){ctx.fillStyle='#7a3a5a';ctx.fillRect(x,y,w,h);for(let k=0;k<6;k++){ctx.fillStyle=k%2?'#f2c230':'#f4f1ea';ctx.beginPath();ctx.moveTo(x+k*w/6,y);ctx.lineTo(x+(k+1)*w/6,y);ctx.lineTo(x+(k+.5)*w/6,y+40);ctx.fill();}
    rr(x+w/2-24,y+70,48,40,6,'#f4f1ea');rr(x+w/2-16,y+52,32,20,5,'#fff7d6');rr(x+w/2-8,y+40,16,14,4,'#f4f1ea');for(let k=0;k<4;k++){rr(x+16+k*(w-40)/4,y+130,18,24,4,'#e9dcc0');}T('WEDDING HALL');}
  else if(li===1){ctx.fillStyle='#3a3340';ctx.fillRect(x,y,w,h);ctx.fillStyle='#8a7a6a';for(let yy=y+10;yy<y+h-60;yy+=18)for(let xx=x+10;xx<x+w-10;xx+=18)ctx.fillRect(xx,yy,12,12);
    rr(x+w/2-40,y+50,80,70,6,'#22252b');rr(x+w/2-32,y+58,64,40,4,'#4a7a9a');rr(x+w/2-2,y+60,4,30,1,'#c9ced2');ell(x+w/2,y+60,6,6,'#22252b');ctx.fillStyle='#e23c3c';ctx.beginPath();ctx.arc(x+w-24,y+24,7,0,7);ctx.fill();T('RECORDING STUDIO');}
  else if(li===2){ctx.fillStyle='#5a5f52';ctx.fillRect(x,y,w,h);rr(x+14,y+14,w-28,90,4,'#3fae4a');for(const k of[24,w-40]){rr(x+k,y+110,6,60,2,'#22252b');ctx.fillStyle='#fff3b0';ctx.beginPath();ctx.moveTo(x+k-10,y+104);ctx.lineTo(x+k+16,y+104);ctx.lineTo(x+k+3,y+122);ctx.fill();}
    rr(x+w/2-20,y+130,40,26,3,'#22252b');ctx.fillStyle='#fff';for(let k=0;k<4;k++)ctx.fillRect(x+w/2-18+k*10,y+130,5,6);T('FILM SET');}
  else if(li===3){ctx.fillStyle='#2a1f3a';ctx.fillRect(x,y,w,h);rr(x+10,y+60,w-20,50,4,'#6a4a2a');rr(x+10,y+56,w-20,8,3,'#f2c230');for(let k=0;k<5;k++){ctx.fillStyle='rgba(255,240,150,.18)';ctx.beginPath();ctx.moveTo(x+20+k*(w-40)/4,y+8);ctx.lineTo(x+8+k*(w-40)/4,y+60);ctx.lineTo(x+32+k*(w-40)/4,y+60);ctx.fill();}
    for(let k=0;k<7;k++)ell(x+18+k*(w-36)/6,y+140,9,9,'#4a3a5a');T('CONCERT STAGE');}
  else{ctx.fillStyle='#4a1a22';ctx.fillRect(x,y,w,h);rr(x+16,y+14,w-32,60,3,'#f4f1ea');rr(x+20,y+18,w-40,52,2,'#7ad1ff');ctx.fillStyle='#c62828';ctx.fillRect(x+8,y+10,10,72);ctx.fillRect(x+w-18,y+10,10,72);
    for(let r=0;r<3;r++)for(let k=0;k<6;k++)rr(x+16+k*(w-32)/6,y+96+r*24,(w-32)/6-4,16,4,'#a8323e');T('KOKO REEL CINEMA');}}

BIZ.media={name:'Koko Reel Entertainment',tag:'Weddings, songs, films and cinemas',tone:'#e0a020',field:'media',isNew:true,qf:300,
  owner:{cloth:'#e0a020',trim:'#1b1b1f',hat:'none'},
  hand:'Props runner',cook:'video editor',seller:'box office cashier',
  outfit:{hand:{cloth:'#6a6f7a',trim:'#e0a020',hat:'cap'},cook:{cloth:'#7a5af0',trim:'#1b2a4a',hat:'none',gender:'f'},server:{cloth:'#22252b',trim:'#e0a020',hat:'cap'},cashier:{cloth:'#c62828',trim:'#f2c230',hat:'none',gender:'f'},porter:{cloth:'#3a3f46',trim:'#f2c230',hat:'cap'}},
  venue:['Boys\' quarters, Surulere','Egg-crate studio, Surulere','Production house and sound stage','KokoPlay, Lagos and Accra','Koko Reel Group, three continents'],
  // Research stage startup costs: Egg-crate shop N6m, First Short Film N15m, Paperwork/production house N80m, Label N150m,
  // Own Screen N600m, Press Play Africa N2.5bn, World Premiere N10bn. Song mixing (line 1) has no own figure: engine prices it.
  costs:{venue:[6000000,80000000,2500000000,10000000000],line:[null,15000000,150000000,600000000]},
  lines:[
   Object.assign(L('Wedding video package','Wedding','#e0a020',350000,'wedding film and highlights','field',['card','#22252b','#e0a020'],['reel','#e0a020','#c62828'],'edit'),{w:10,qx:1}),
   Object.assign(L('Mixed and mastered song','Song','#7a5af0',150000,'song, mix and master','field',['card','#3a3f46','#7a5af0'],['disc','#22252b','#7a5af0'],'mixer'),{w:6,qx:2}),
   Object.assign(L('Feature film licence','Licence','#1b2a4a',30000000,'one territory, streaming','field',['card','#333a44','#5ad1ff'],['reel','#c0c4c8','#1b2a4a'],'edit'),{w:.4,qx:1}),
   Object.assign(L('Live show ticket','Show','#c62828',25000,'concert ticket','field',['cloth','#c62828','#f2c230'],['ticket','#f2c230','#c62828'],'stage'),{w:4,qx:4}),
   Object.assign(L('Cinema ticket','Cinema','#a8323e',6800,'one seat','field',['reel','#6b7684','#22252b'],['ticket','#f4f1ea','#a8323e'],'projector'),{w:8,qx:4})]};
BIZX.media={demand:mdDemand,lineW:mdLineW,sale:mdSale,gate:mdGate,html:mdHtml,bind:mdBind,night:mdNight,month:mdMonth,crew:mdCrew,strip:mdStrip,
  base:'#4a3a52',floor:['#8a6a4a','#7a6a7a','#6a5a6a','#5a4a5a','#4a3a4a'],locked:()=>null};
