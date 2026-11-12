/* ===== empire: managers, machines, export, branches, salaries, tax, events, chatter ===== */
const EC=PLAN.econ.empire,RG=PLAN.road.regions,ROLE=PLAN.econ.salaries,TAX=PLAN.econ.tax,PAYSH=.08; // salaries as a share of revenue (was 15%)
const HCAP=[1,1.5,2.2,3.2,4.5,6],HSPD=[1,1.1,1.25,1.4,1.55,1.7],haulCost=t=>nice(refP()*12*Math.pow(GROW,[8,18,28,38,48][t])*1.5);
const QF={nkechi:12600,tunde:5700,musa:6300,basira:11200,zainab:5000,chidi:5800,sikira:7400,sani:7000,bola:6400,chinedu:5100,ship:130,school:310},BAY={x:800,y:1228},MONTH=30;
const refP=()=>{let a=0,w=0;for(const l of B.lines){a+=l.price*(l.w||1);w+=l.w||1;}return a/w;};
const PBZ=()=>PLAN.biz[SAVE.cur],pick=a=>a[Math.floor(Math.random()*a.length)];
function migrate(s){s.emp=Object.assign({mgr:0,belt:0,auto:0,pack:0,con:0,reg:0,br:0,haul:0},s.emp||{});s.mo=Object.assign({rev:0,exp:0,br:0},s.mo||{});
  s.stat=Object.assign({tax:0,wages:0},s.stat||{});for(const k of['money','till','clock','dayEarn','daySold','sold'])if(!Number.isFinite(s[k]))s[k]=0;if(!(s.day>=1))s.day=1;s.pads=s.pads||{};s.resv=s.resv||0;s.dayExp=s.dayExp||0;return s;}
const Fu=()=>G.F1;
const empCount=()=>{const e=S.emp;return e.mgr+e.belt+e.auto+e.pack+e.con+e.reg+e.br+(e.haul||0);};
const regStart=r=>{let a=0;for(let i=0;i<r;i++)a+=EC.regions[i].size;return a;};
function regionOf(k){let a=0;for(let r=0;r<EC.regions.length;r++){a+=EC.regions[r].size;if(k<a)return r;}return EC.regions.length-1;}
const brCost=k=>nice(Fu()*.75*(EC.branch.c0+EC.branch.c1*Math.pow(k,EC.branch.p)));
function brDay(){let s=0;for(let r=0;r<EC.regions.length;r++){const n=Math.max(0,Math.min(EC.regions[r].size,S.emp.br-regStart(r)));s+=n*EC.regions[r].mult*(boosted(r)?1.2:1);}return Math.round(s*EC.branch.b*Fu());}
function cityOf(k){const r=regionOf(k),c=RG[r].cities,j=k-regStart(r);return c[j%c.length]+(j>=c.length?' '+(Math.floor(j/c.length)+1):'');}
const expDay=()=>EC.contracts.slice(0,S.emp.con).reduce((a,c)=>a+c.perDay,0)*Fu()*(S.emp.pack?1.15:1)/EC.inefficiency;
const rank=()=>{const t=[0,1,10,50,150,500];let i=0;for(let k=0;k<6;k++)if(S.emp.br>=t[k])i=k;return PBZ().rankTitles[i];};
const evx=k=>!!(S.ev&&S.ev.fx===k);

function empItems(){const e=S.emp,P=PBZ(),o=[];if(e.haul<5){const T=PLAN.mech[SAVE.cur][e.haul+1];o.push({id:'haul',sec:3,ico:['🛒','🛺','🛻','🚜','🚛'][e.haul],name:T.name,blurb:'Carries '+HCAP[e.haul+1]+'× the load, '+Math.round((HSPD[e.haul+1]-1)*100)+'% faster. '+T.how,cost:haulCost(e.haul)});}
  if(stage()<4)return o;
  if(!e.mgr)o.push({id:'mgr',sec:0,ico:'🧑‍💼',name:'Hire '+P.manager.name+', '+P.manager.title,blurb:'Runs the floor so you can think big. All staff work 20% faster.',cost:nice(EC.managerCost*Fu())});
  for(const m of['belt','auto','pack'])if(!e[m])o.push({id:m,sec:0,ico:{belt:'⚙️',auto:'🚜',pack:'📦'}[m],name:P.machines[m].name,blurb:P.machines[m].blurb,cost:nice(EC.machineCost[m]*Fu())});
  if(e.con<6){const c=P.export.contracts[e.con];o.push({id:'con',sec:1,ico:'🚛',name:(e.con?'Sign ':'Build '+P.export.bay+' and sign ')+c.buyer,blurb:c.where+'. '+c.blurb,cost:nice(EC.contracts[e.con].cost*Fu())});}
  if(e.br<500){const r=regionOf(e.br);
    if(e.reg<=r)o.push({id:'reg',sec:2,ico:RG[r].flag,name:'Hire '+RG[r].managerTitle,blurb:RG[r].story,cost:nice(EC.regions[r].managerCost*Fu())});
    else o.push({id:'br',sec:2,ico:'🏬',name:'Open a '+P.branchNoun+' in '+cityOf(e.br),blurb:RG[r].name+' · brings in ₦'+short(Math.round(EC.branch.b*EC.regions[r].mult*Fu()))+' a day',cost:brCost(e.br+1)});}
  return o;}
function empBuy(id){const it=empItems().find(i=>i.id===id);if(!it||S.money<it.cost)return false;S.money-=it.cost;S.spent=(S.spent||0)+it.cost;const e=S.emp,P=PBZ();e[id]++;let big=id!=='br',msg=it.name;
  if(id==='br'){const m=P.milestones.find(m=>m.at===e.br);if(m){big=true;msg=m.title;toast(m.blurb,7);}else{msg=cityOf(e.br-1)+' is open! '+e.br+' of 500';if(e.br%(e.br<100?5:10)===0){big=true;msg=e.br+' '+P.branchNoun+'s and counting!';}}}
  if(id==='con'){G.exp.t=Math.min(G.exp.t,3);msg='Signed: '+P.export.contracts[e.con-1].buyer;}
  if(id==='reg')msg=RG[e.reg-1].name+' is open for business';
  if(id==='haul')msg='Your '+handName().toLowerCase()+'s now use: '+PLAN.mech[SAVE.cur][e.haul].name;
  if(id==='mgr')msg=P.manager.name+' has joined as '+P.manager.title;
  syncStaff();fanfare(big);confetti(big?120:40);banner('LEVEL '+level(),msg);updateHud();save();return true;}

/* ----- salaries and tax ----- */
const AVGB=(ROLE.hand+ROLE.porter+ROLE.server+ROLE.cook+ROLE.cashier)/5;
const payGrade=()=>Math.max(1,PAYSH*MONTH*Fu()/(14*AVGB)*Math.pow(GROW,Math.min(52,flag())-52)*(stage()<4?.55:1));
const handName=()=>B.hand?B.hand:B.field==='water'?'Fisherman':B.field==='yard'?'Offloader':B.field==='pasture'?'Herdsman':'Farmhand';
const TEAM=[1,3,10,40,150],BRSTAFF=120;
function payrollList(){const tm=TEAM[stage()],g=Math.max(1,payGrade()/tm),c={},rows=[];for(const w of G.workers)c[w.kind]=(c[w.kind]||0)+1;
  const nm={hand:handName(),porter:'Porter',server:B.seller?(t=>t[0].toUpperCase()+t.slice(1))(B.seller):B.food?'Server':'Sales girl',cook:B.cook?(t=>t[0].toUpperCase()+t.slice(1))(B.cook):B.food?'Cook':'Packer',cashier:'Cashier',loader:'Export loader'};
  for(const k in nm)if(c[k])rows.push({name:nm[k]+(tm>1?'s':c[k]>1?'s':''),n:c[k]*tm,each:nice(ROLE[k]*g)});
  if(typeof shipCrew==='function')rows.push(...shipCrew(),...schCrew());
  if(c.manager)rows.push({name:PBZ().manager.name+', '+PBZ().manager.title,n:1,each:nice(ROLE.manager*g*4)});
  if(S.emp.reg)rows.push({name:'Regional manager'+(S.emp.reg>1?'s':''),n:S.emp.reg,each:nice(ROLE.regional*g*4)});
  if(S.emp.br)rows.push({name:'Branch staff ('+BRSTAFF+' per '+PBZ().branchNoun+')',n:S.emp.br*BRSTAFF,each:Math.round(PAYSH*brDay()*MONTH/(S.emp.br*BRSTAFF)),br:1});
  return rows;}
const dayOfMonth=()=>((S.day-1)%MONTH)+1;
function monthDue(full){const rows=payrollList(),k=full?1:dayOfMonth()/MONTH;let wages=0;for(const r of rows)if(!r.br)wages+=r.n*r.each*k;
  wages=Math.round(wages+PAYSH*(S.mo.br+S.mo.exp));const rev=S.mo.rev+S.mo.exp+S.mo.br;const tax=stage()<2?0:Math.round(TAX.gameRate*Math.max(0,rev-wages));return{rev,wages,tax,staff:rows.reduce((a,r)=>a+r.n,0)};}

/* ----- daily events ----- */
const EVI={inspect:'📋',diesel_up:'⛽',backhaul:'🚛',port_down:'🖥️',fx_up:'💱',demand_up:'📈',demand_down:'🌧️',price_up:'💹',supply_slow:'🐢',cost_hit:'💸',bonus_cash:'🎁',vip_day:'🤑',speed_up:'⚡'};
const EVT={inspect:'An inspector visits tonight',diesel_up:'Diesel up 10% today',backhaul:'Trucks coming home earn a return load',port_down:'The paperwork desk is slow today',fx_up:'Ocean freight earns 5% more today',demand_up:'More customers today',demand_down:'Fewer customers today',price_up:'Prices up 25% today',supply_slow:'Supplies are slow today',cost_hit:'It cost you',bonus_cash:'You received',vip_day:'Big spenders everywhere',speed_up:'Staff are fired up'};
function rollEvent(){S.ev=null;if(S.day<3||Math.random()>.55)return;const ev=pick(PBZ().events.concat(PLAN.road.commonEvents));S.ev={name:ev.name,text:ev.text,fx:ev.effect,amt:0};
  if(ev.effect==='cost_hit'){S.ev.amt=Math.round(Math.max(0,S.money)*.04);S.money-=S.ev.amt;}
  if(ev.effect==='bonus_cash'){S.ev.amt=Math.round((S.lastEarn||0)*.2);S.money+=S.ev.amt;}}
function evLabel(){const e=S.ev;return e?EVI[e.fx]+' '+e.name+': '+EVT[e.fx]+(e.amt?' ₦'+short(e.amt):''):'';}

/* ----- speech bubbles ----- */
function say(who,txt,t=3.2){if(G.bub.length<4)G.bub.push({who,txt,t});}
function updChatter(dt){for(const b of G.bub)b.t-=dt;G.bub=G.bub.filter(b=>b.t>0);G.acc.chat-=dt;if(G.acc.chat>0)return;G.acc.chat=rnd(3.5,6.5);
  const C=PBZ().chatter,r=Math.random(),mg=G.workers.find(w=>w.kind==='manager');let who=null,line;
  if(mg&&r<.25){who=mg;line=pick(C.manager);}
  else if(r<.6&&G.workers.length){who=pick(G.workers);line=pick(who.kind==='manager'?C.manager:C.staff);}
  else{const cs=G.custs.filter(c=>c.st!=='out');if(cs.length){who=pick(cs);line=pick(C.customer);}}
  if(who){say(who,line);if(Math.abs(who.y-G.cam.y)<H/2/SCALE)babble();}}

/* ----- export bay ----- */
function updExport(dt){const e=S.emp,X=G.exp;if(!e.con)return;
  if(X.state==='wait'){X.t-=dt;if(X.t<=0&&!G.closing){// The truck asks for the line with the most goods ready, and only as much as can be packed in its 60 seconds.
    const ls=openLines(),li=ls.reduce((m,i)=>G.out[i]+G.counter[i]>G.out[m]+G.counter[m]?i:m,ls[0]),full=40+15*e.con,need=Math.min(full,Math.max(12,G.out[li]+G.counter[li]+20));X.ord={li,need,got:0,pay:Math.round(expDay()*50/dayLen()*need/full),buyer:PBZ().export.contracts[Math.floor(Math.random()*e.con)]};X.state='in';X.x=WW+160;X.t0=G.t;}}
  else if(X.state==='in'){X.x-=300*dt;if(X.x<=880){X.x=880;X.state='load';X.t=60;horn();toast('🚛 '+X.ord.buyer.buyer+' wants '+X.ord.need+' '+B.lines[X.ord.li].short+'. Load the truck!',4);}}
  else if(X.state==='load'){X.t-=dt;const o=X.ord;if(o.got>=o.need||X.t<=0||G.closing){const pay=Math.round(o.pay*Math.min(1,o.got/o.need));if(pay>0){S.money+=pay;S.mo.exp+=pay;S.dayExp+=pay;floatTxt(X.x-40,1210,'EXPORT +₦'+short(pay),'#ffd659',18);puff(BAY.x,BAY.y-20,12,'#ffe9a8');beep(784,.22,'square',.06,1.5);}
      X.state='out';}}
  else{X.x-=320*dt;if(X.x<-200){X.state='wait';X.t=Math.max(5,50-(G.t-X.t0));X.ord=null;}}}

/* ----- machines ----- */
function updMachines(dt){const e=S.emp,f=G.field;
  if(e.belt)for(const i of openLines()){G.beltT[i]+=dt*30;while(G.beltT[i]>=1){G.beltT[i]--;if(G.out[i]>0&&G.counter[i]<70){G.out[i]--;G.counter[i]++;}}}
  if(e.auto){const M=G.mach;M.x+=M.v*dt;if(M.x>f.x+f.w-40){M.v=-150;M.y=f.y+rnd(50,f.h-40);}if(M.x<f.x+40){M.v=150;M.y=f.y+rnd(50,f.h-40);}
    M.acc+=dt;if(M.acc>.12){M.acc=0;let n=0;for(const c of G.crops)if(c.ready&&lineOpen(c.li)&&G.procIn[c.li]<160&&Math.abs(c.x-M.x)<46&&Math.abs(c.y-M.y)<70){c.ready=false;c.t=rnd(2.6,4.6);G.procIn[c.li]++;if(n++<3)fly('r'+c.li,c.x,c.y,6,LX(c.li),500,24,.6,0,90);}}
    for(const s of G.stacks)if(lineOpen(s.li)&&G.depot[s.li]>0&&G.procIn[s.li]<120){G.depT[s.li]=(G.depT[s.li]||0)+dt*12;while(G.depT[s.li]>=1&&G.depot[s.li]>0){G.depT[s.li]--;G.depot[s.li]--;G.procIn[s.li]++;}}}}

/* ----- HQ panel ----- */
function hqRender(){const e=S.emp,P=PBZ(),items=empItems(),due=monthDue(false),rows=payrollList();let h='';
  h+='<header><h1>'+rank()+'<small>'+B.name+' · Day '+S.day+' · Level '+level()+'</small></h1><div class="btns">'+(typeof canShare==='function'&&canShare()?'<button class="ghost" id="hqshare" type="button">📣 Share</button>':'')+(typeof canShare==='function'&&canShare()?'<button class="ghost" id="hqdia" type="button">💎 Top up</button>':'')+'<button class="ghost" id="hqx" type="button">Back to shop</button></div></header>';
  h+='<div class="stats"><div class="stat">Cash<b id="hqcash">₦'+fmt(S.money)+'</b></div><div class="stat">Branches<b>'+e.br+' / 500</b></div><div class="stat">People employed<b>'+due.staff.toLocaleString()+'</b></div><div class="stat">Branch income a day<b>₦'+fmt(brDay())+'</b></div></div>';
  h+=(typeof shipHtml==='function'?shipHtml():'')+finHtml();
  if(stage()<4)h+='<div class="lock">🔒 Your empire starts when you build the '+B.venue[4]+'. After that: a manager, machines, export contracts and up to 500 '+P.branchNoun+'s across Nigeria, Africa and the world.</div>';
  const sec=['Flagship: manager and machines','Wholesale and export','Branches','From rope to machines'];
  for(const s of[3,0,1,2]){const its=items.filter(i=>i.sec===s);if(!its.length)continue;h+='<h2>'+sec[s]+'</h2>';
    for(const it of its)h+='<button class="it'+(S.money>=it.cost?'':' no')+'" type="button" data-buy="'+it.id+'" data-cost="'+it.cost+'" style="--p:'+Math.max(0,Math.min(100,100*S.money/it.cost)).toFixed(0)+'%"><i>'+it.ico+'</i><div><strong>'+it.name+'</strong><span>'+it.blurb+'</span></div><em>₦'+short(it.cost)+'</em></button>';
    if(s===1&&e.con)h+='<p class="note">Signed so far: '+P.export.contracts.slice(0,e.con).map(c=>c.buyer+' ('+c.where+')').join(', ')+'. Export trucks bring in about ₦'+short(Math.round(expDay()))+' a day when fully loaded.</p>';
    if(s===2){h+='<div class="regs">';for(let r=0;r<RG.length;r++){const n=Math.max(0,Math.min(RG[r].size,e.br-regStart(r)));h+='<div class="reg'+(n>=RG[r].size?' done':r>=e.reg&&r>regionOf(e.br)?' lock':'')+'">'+RG[r].flag+' '+RG[r].name+' · '+n+'/'+RG[r].size+'<u><s style="width:'+(100*n/RG[r].size)+'%"></s></u></div>';}h+='</div>';}}
  h+=travelHtml();
  if(stage()>=4&&e.br>=500&&!items.length)h+='<div class="lock">🏆 500 '+P.branchNoun+'s on four continents. You are the '+P.rankTitles[5]+'!</div>';
  h+='<h2>Salaries (paid every 30 days)</h2><table>';for(const r of rows)h+='<tr><td>'+r.n.toLocaleString()+' × '+r.name+'</td><td>₦'+short(r.each)+' a month</td></tr>';h+='</table>';
  h+='<h2>This month so far</h2><table><tr><td>Shop sales</td><td>₦'+fmt(S.mo.rev)+'</td></tr><tr><td>Export</td><td>₦'+fmt(S.mo.exp)+'</td></tr><tr><td>Branches</td><td>₦'+fmt(S.mo.br)+'</td></tr><tr><td>Salaries due so far</td><td>-₦'+fmt(due.wages)+'</td></tr><tr><td>'+TAX.label+' ('+Math.round(TAX.gameRate*100)+'% of profit)</td><td>'+(stage()<2?'₦0 (small business relief)':due.tax?'-₦'+fmt(due.tax):'₦0')+'</td></tr><tr><td>Already set aside</td><td>₦'+fmt(S.resv)+'</td></tr></table>';
  h+='<p class="note">Payday is in '+(MONTH-dayOfMonth()+1)+' day'+(MONTH-dayOfMonth()?'s':'')+'. Each night your accountant sets money aside so salaries and tax are ready. Total paid so far: salaries ₦'+fmt(S.stat.wages)+', tax ₦'+fmt(S.stat.tax)+'.</p>';
  $('hqin').innerHTML=h;$('hqx').addEventListener('click',hqClose);if($('hqshare'))$('hqshare').addEventListener('click',()=>{hqClose();shareStart();});if($('hqdia'))$('hqdia').addEventListener('click',diaOpen);if(typeof shipBind==='function')shipBind();finBind();document.querySelectorAll('#hqin [data-go]').forEach(b=>b.addEventListener('click',()=>tripStart(+b.dataset.go)));
  document.querySelectorAll('#hqin [data-buy]').forEach(b=>b.addEventListener('click',()=>{if(empBuy(b.dataset.buy))hqRender();else{const em=b.querySelector('em'),need=Math.max(0,+b.dataset.cost-S.money);em.textContent='Need ₦'+short(Math.ceil(need))+' more';b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');clearTimeout(b._t);b._t=setTimeout(()=>{em.textContent='₦'+short(+b.dataset.cost);},1600);beep(160,.15,'sawtooth',.04);}}));}
// The shop keeps trading while HQ is open; this keeps the cash and the buy buttons current.
let hqAcc=0;function hqTick(dt){hqAcc+=dt;if(hqAcc<.4)return;hqAcc=0;if(G.night)return hqClose();if(G.trip)return;const c=$('hqcash');if(c)setT(c,'₦'+fmt(S.money));
  document.querySelectorAll('#hqin [data-buy]').forEach(b=>{const cost=+b.dataset.cost;b.classList.toggle('no',S.money<cost);b.style.setProperty('--p',Math.max(0,Math.min(100,100*S.money/cost)).toFixed(0)+'%');});}
function hqOpen(){if(!G||G.night||G.trip)return;G.input.active=false;hqRender();$('hqp').hidden=false;$('hqp').scrollTop=0;}
function hqClose(){if(G&&G.trip)return;$('hqp').hidden=true;save();}
$('hq').addEventListener('click',hqOpen);$('goal').addEventListener('click',()=>{if(G&&stage()>=4)hqOpen();});
