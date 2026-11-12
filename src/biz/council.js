/* ===== Okele Council Services: research rules from plan3/council.json on top of the shop engine =====
   The player serves residents of invented Okele LGA in invented Marobi State. Money comes from the monthly allocation
   (most of it) plus fees collected at service points. Approval is earned only by service: stocked points, posted
   budgets, clean audits and town halls. Nothing in this file buys approval or votes. */
const CNR={
  alloc:[2500000,25000000,700000000,3000000000,58000000000], // research monthlyRevenueNaira: Ward 7, Councillor, Chairman, Commissioner, Governor
  people:[12000,30000,250000,4500000,4500000],                // residents served (estimate)
  pocket:[60000,60000,75693,150000,185000],                   // personal monthly salary; chairman = N908,312 a year basic (research); others estimate
  share:{pay:.5,roads:.18,health:.09,schools:.08,waste:.07,over:.08}, // costStructure percentOfBudget
  pay:{clerk:85000,chw:130000,teacher:110000,crew:75000,foreman:160000,auditor:240000,treasurer:350000}, // storyline salaries
  staff:[[1,1,1,1,0,0,0],[2,3,6,3,1,0,0],[120,240,480,300,58,1,1],[250,500,1000,620,128,1,1],[3000,6000,12000,7500,1496,2,2]], // research staff counts
  ghostPay:95000,   // estimate: average salary of an unverified name
  kiosk:60000000,   // research "Audit Season" stage startup: kiosks, compactor, auditors' desk
  post:50000,       // storyline: printing the budget notice
  hall:50000,       // estimate: town hall chairs, sound and water
  term:120          // research open question suggests 120 game days a term
};
const isCouncil=()=>SAVE.cur==='council'&&B&&B.isNew;
function cnState(){const s=S.cn=S.cn||{};const d={appr:50,kiosk:false,post:-999,posted:false,miss:0,flag:null,frozen:false,clean:0,strike:0,offices:0,
    ghost:0,pad:false,inherited:false,served:[0,0,0,0,0],empty:0,roads:2,lastAlloc:0,lastRoads:0,pocket:0,births:0,hall:-999,terms:[],lastTerm:null,igr:0,day:{}};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));
  if(stage()>=2&&!s.inherited){s.inherited=true;const n=CNR.staff[2].reduce((a,b)=>a+b,0);s.ghost=Math.round(n*rnd(1,3)/100);s.pad=true;}
  return s;}
const cnOpen=i=>i===0||lvl('line'+i);
const cnCrewPay=()=>{const st=CNR.staff[stage()],P=CNR.pay,k=['clerk','chw','teacher','crew','foreman','auditor','treasurer'];return st.reduce((a,n,i)=>a+n*P[k[i]],0)+(S.cn?S.cn.ghost*CNR.ghostPay:0);};
function cnRate(){const s=cnState();let r=s.kiosk?.95:.6;if(S.day-s.post<30)r+=.1;if(s.appr<40)r-=.1;if(s.empty>=7)r-=.1;return Math.max(0,Math.min(1,r));}
function cnGrade(){const s=cnState();const ok=[s.clean>=3,s.miss===0&&s.post>-999,S.money>=.1*CNR.alloc[stage()]].filter(Boolean).length;return s.frozen?'C':ok===3?'A':ok===2?'B':'C';}
const cnTermLeft=()=>CNR.term-(S.day%CNR.term);
const cnAdd=(n)=>{const s=S.cn;s.appr=Math.max(0,Math.min(100,Math.round((s.appr+n)*10)/10));};

/* ----- items and stations (2D only) ----- */
XITEM.ticket=(g,a,b)=>{E(g,0,-7,10,7,a);E(g,0,-7,4,3,b);R(g,6,-6,12,6,1,'#fffaf0');R(g,9,-5,2,4,0,b);};
XITEM.bin=(g,a,b)=>{R(g,-9,-20,18,20,3,a);R(g,-11,-23,22,5,2,b);E(g,-6,0,3,3,'#22252b');E(g,6,0,3,3,'#22252b');R(g,-6,-16,3,12,1,'rgba(255,255,255,.25)');};
XSTATION.clinic=(col)=>{rr(-44,-50,88,50,6,'#f4f1ea');rr(-44,-50,88,10,5,col);for(let r=0;r<2;r++)for(let k=0;k<4;k++)rr(-36+k*18,-36+r*14,12,10,2,['#e8541e','#2a62c9','#f2c230','#1f8a4c'][(k+r)%4]);
  rr(-48,-6,96,18,4,'#c9b08a');rr(-5,-8,10,24,2,'#1f8a4c');rr(-12,-1,24,10,2,'#1f8a4c');};
XSTATION.binbay=(col)=>{rr(-48,-8,96,20,4,'#5b5f66');for(let k=0;k<3;k++){rr(-40+k*28,-40,22,32,4,col);rr(-42+k*28,-44,26,6,3,'#22252b');}rr(-48,10,96,4,2,'#f2c230');};

/* ----- customers ----- */
function cnDemand(){const s=cnState();if(s.strike>0)return 0;return .6+.8*s.appr/100;}
function cnLineW(i){const s=cnState();if(s.strike>0)return 0;return 1;}
// A resident pays the fee at a service point. Only the collection rate reaches the treasury (cash desks leak).
function cnSale(i,c,q,amt){const s=cnState();s.served[i]+=q;const cash=Math.round(amt*cnRate());s.igr+=cash;
  if(i===1&&Math.random()<.1)s.births++; // birth registration at the health centre is free (share is an estimate)
  return cash;}

/* ----- nights: allocation day, approval, audits, budget notices, terms ----- */
function cnNight(){if(!isCouncil())return[];const s=cnState(),d=S.day,rows=[];
  if(s.frozen&&s.unfreeze&&d>=s.unfreeze){s.frozen=false;s.unfreeze=0;}
  // Approval: +0.3 per point that served today, -0.5 per open point that served nobody; -1 per point closed by a strike.
  let empty=0;for(let i=0;i<5;i++){if(!cnOpen(i))continue;if(s.strike>0)cnAdd(-1);else if(s.served[i])cnAdd(.3);else{cnAdd(-.5);empty++;}}
  s.empty=empty>=3?s.empty+1:0;if(s.empty>=7){cnAdd(-2);if(s.empty===7)toast('🏚️ Three service points have served nobody for a week. Restock them and hold a town hall.',5);}
  if(s.strike>0)s.strike--;s.served=[0,0,0,0,0];
  if(s.flag&&!s.frozen&&d>s.flag.due){s.frozen=true;s.clean=0;cnAdd(-15);toast('📋 The audit flag was not fixed in 3 days. New projects are frozen and approval fell by 15.',6);}
  if(d%MONTH===0){// Allocation day: lands in the council treasury, never in your pocket. Salaries come first.
    const st=stage(),A=Math.round(CNR.alloc[st]*(.85+Math.random()*.3)),due=monthDue(true);s.lastAlloc=A;S.money+=A;rows.push(['Monthly allocation','₦'+fmt(A),'#b9ffcf']);
    const keep=Math.max(0,due.wages+due.tax-S.resv);let avail=Math.max(0,S.money-keep),gap=0;
    const spend=(label,n)=>{n=Math.round(n);const p=Math.min(n,avail);avail-=p;S.money-=p;gap+=n-p;if(p)rows.push([label,'-₦'+fmt(p),'#ffb3a3']);return p;};
    const C=CNR.share;spend('Pensions and other council staff',Math.max(0,C.pay*A-cnCrewPay()));
    spend('Clinic drugs and running costs',C.health*A);spend('School books and repairs',C.schools*A);spend('Waste trucks, fuel and bins',C.waste*A);spend('Office, audit and revenue collection',C.over*A);
    // Roads: full share goes to open tender (12% below list), half share uses three quotes, hold keeps it for projects.
    const r=s.roads===2?C.roads*A*.88:s.roads===1?C.roads*A/2:0;s.lastRoads=spend('Roads and drains',r);cnAdd(s.roads===2?2:s.roads===1?0:-3);
    if(gap>0){cnAdd(-2);toast('⚠️ The treasury was ₦'+short(gap)+' short for services this month. Salaries were kept safe first.',5);}
    s.pocket+=CNR.pocket[st];}
  if(d%90===0){// quarter: budget notice check and possible audit visit
    if(!s.posted){s.miss++;if(s.miss>=2){cnAdd(-8);s.miss=0;toast('📌 Two quarters without a posted budget. Residents lost trust: approval -8.',5);}}else s.miss=0;s.posted=false;
    if(Math.random()<.4)cnAudit();}
  if(d%CNR.term===0)cnTermEnd();
  return rows;}
function cnAudit(){const s=S.cn,A=CNR.alloc[stage()];
  if(s.ghost>0){s.flag={kind:'ghost',n:s.ghost,amt:s.ghost*CNR.ghostPay*3,due:S.day+3};}
  else if(s.pad){s.flag={kind:'pad',amt:Math.round(A*CNR.share.roads*.2),due:S.day+3};}
  else{s.clean++;cnAdd(2);toast('📋 Auditor Kemi Dogo checked every receipt. Clean audit!',4);return;}
  banner('AUDIT VISIT','Auditor Kemi Dogo found '+(s.flag.kind==='ghost'?s.flag.n+' unknown names on the payroll':'a padded road invoice')+'. Fix it in HQ within 3 days.');}
function cnTermEnd(){const s=S.cn,a=Math.round(s.appr);let msg;
  if(a>=70){s.offices++;msg='Re-elected with approval '+a+'. Residents trust you with the next office.';fanfare(true);}
  else if(a>=50)msg='Re-elected with approval '+a+'. Reach 70 by the next term end to move up.';
  else{msg='Approval '+a+': the ward chose someone else this term. Keep serving and stand again.';s.appr=Math.max(s.appr,45);}
  s.lastTerm={day:S.day,a,msg};s.terms.push(a);if(s.terms.length>12)s.terms.shift();banner('ELECTION DAY',msg);}
function cnMonth(stmt){if(!isCouncil())return{rows:[],cost:0,or:0};const s=cnState(),rows=[];
  if(S.money<0){s.strike=3;cnAdd(-10);rows.push(['Salaries missed: staff strike 3 days','approval -10','#ffb3a3']);toast('✊ Salaries could not be paid in full. Staff strike for 3 days and approval falls by 10.',6);}
  rows.push(['Fees collected (IGR)','₦'+fmt(s.igr),'#b9ffcf']);s.igr=0;
  return{rows,cost:0,or:0};}
function cnCrew(){if(!isCouncil())return[];const st=CNR.staff[stage()],P=CNR.pay,r=[];
  const nm=[['Revenue clerks','clerk'],['Community health workers','chw'],['Primary school teachers','teacher'],['Sanitation crew','crew'],['Road works foremen','foreman'],['Internal auditor','auditor'],['Council treasurer','treasurer']];
  st.forEach((n,i)=>{if(n)r.push({name:nm[i][0],n,each:P[nm[i][1]]});});
  if(S.cn&&S.cn.ghost)r.push({name:'Unverified names on the old payroll',n:S.cn.ghost,each:CNR.ghostPay});return r;}

/* ----- stage gates: offices are earned at term end, never bought ----- */
function cnGate(st){const s=cnState();
  if(s.frozen)return'🔒 Fix the audit flag and publish the report first (HQ).';
  if(st.base==='venue'){const need=st.n;if(s.offices<need)return'🔒 Finish a term with approval 70+ to earn this office ('+s.offices+' of '+need+' earned, approval '+Math.round(s.appr)+', '+cnTermLeft()+' days to term end).';
    if(st.n===3&&s.clean<2)return'🔒 The assembly confirms a commissioner after 2 clean audits ('+s.clean+' so far).';
    if(st.n===4&&cnGrade()==='C')return'🔒 Governorship needs credit grade A or B (clean audits, budgets posted, reserve 10% of budget).';}
  if(st.base==='line'&&s.lastAlloc&&cnCrewPay()>.6*s.lastAlloc)return'🔒 Payroll is over 60% of the budget. Clean the payroll before new projects.';
  return null;}

/* ----- HQ ----- */
function cnHtml(){const s=cnState(),st=stage(),A=CNR.alloc[st],ppl=CNR.people[st];const g=cnGrade();
  let h='<h2>Council treasury</h2><div class="stats"><div class="stat">Approval<b>'+Math.round(s.appr)+' / 100</b></div><div class="stat">Term ends in<b>'+cnTermLeft()+' days</b></div><div class="stat">Fee collection<b>'+Math.round(cnRate()*100)+'%</b></div><div class="stat">Credit grade<b>'+g+'</b></div></div>';
  h+='<p class="note">Council money (₦'+fmt(Math.floor(S.money))+') only buys services and projects. Your own salary goes to your personal wallet: ₦'+fmt(s.pocket)+' so far (₦'+fmt(CNR.pocket[st])+' a month). At term end, approval 50+ re-elects you and 70+ earns the next office ('+s.offices+' earned).'+(s.strike>0?' ✊ Staff on strike: '+s.strike+' day(s) left.':'')+'</p>';
  h+='<h2>Budget board</h2><table><tr><td><b>Share of the allocation</b></td><td><b>Monthly</b></td><td><b>Per resident a year</b></td></tr>';
  const C=CNR.share,row=(n,p)=>'<tr><td>'+n+' · '+Math.round(p*100)+'%</td><td>₦'+short(A*p)+'</td><td>₦'+fmt(Math.round(A*p*12/ppl))+'</td></tr>';
  h+=row('Salaries and pensions',C.pay)+row('Roads and drains',C.roads*[0,.5,.88][s.roads])+row('Clinic drugs',C.health)+row('School books',C.schools)+row('Waste collection',C.waste)+row('Office and audit',C.over)+'</table>';
  h+='<div class="seg" id="cnroad">'+['Hold for projects','Half · 3 quotes','Full · open tender'].map((t,i)=>'<button class="ghost'+(s.roads===i?' on':'')+'" data-rd="'+i+'" type="button">'+t+'</button>').join('')+'</div>';
  h+='<p class="note">Roads and drains get 18% in the plan. Open tender takes longer but costs 12% less. Holding the money pays for new service points, but potholes cost 3 approval a month. Last allocation: ₦'+fmt(s.lastAlloc)+' (it swings ±15% with oil and VAT receipts).</p>';
  h+='<h2>Service points today</h2><table>';const nm=['Market tickets','Health centre','Primary school','Motor park','Waste collection'];
  for(let i=0;i<5;i++)if(cnOpen(i))h+='<tr><td>'+nm[i]+'</td><td>'+(s.served[i]?s.served[i]+' served':'nobody yet')+'</td></tr>';
  h+='</table><p class="note">Free birth registrations at the health centre: '+s.births+'. Stocked points that serve residents raise approval each night; idle ones lower it.</p>';
  h+='<h2>Open books</h2><div class="acts"><button class="ghost'+(s.posted?' on':'')+'" data-cn="post" type="button">📌 Post this quarter\'s budget · ₦50k</button><button class="ghost" data-cn="hall" type="button">🏛️ Hold a town hall · ₦50k</button>'+(s.kiosk?'':'<button class="ghost" data-cn="kiosk" type="button">🧾 E-ticket kiosks · ₦60m</button>')+'</div>';
  h+='<p class="note">A posted budget gives +5 approval and +10% fee payments for 30 days. Skip two quarters and approval drops 8. Kiosks log every payment: collection goes from 60% to 95%. One town hall a month: +3 approval.</p>';
  h+='<h2>Audit desk</h2>';
  if(s.flag){const f=s.flag;h+='<p class="note">'+(f.kind==='ghost'?f.n+' names on the old payroll that nobody has ever seen.':'A road invoice from the old books, padded by 20%.')+' Recoverable: ₦'+fmt(f.amt)+'. '+(s.frozen?'⚠️ Deadline passed: projects frozen until fixed.':'Days left: '+Math.max(0,f.due-S.day)+'.')+'</p><div class="acts"><button class="ghost" data-cn="fix" type="button">✅ Remove, recover and publish the report</button></div>';}
  else h+='<p class="note">No open flags. Clean audits: '+s.clean+'. Auditors visit each quarter about 4 times in 10.'+(s.ghost||s.pad?' The old books may still hide problems.':'')+'</p>';
  if(s.lastTerm)h+='<h2>Last election</h2><p class="note">'+s.lastTerm.msg+'</p>';
  return h;}
function cnBind(){if(!isCouncil())return;const s=cnState(),re=()=>{save();hqRender();},pay=(n,f)=>{if(S.money<n){toast('The treasury needs ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;f();fanfare(false);re();};
  document.querySelectorAll('#cnroad [data-rd]').forEach(b=>b.onclick=()=>{s.roads=+b.dataset.rd;re();});
  document.querySelectorAll('#hqin [data-cn]').forEach(b=>b.onclick=()=>{const k=b.dataset.cn;
    if(k==='post'&&!s.posted)pay(CNR.post,()=>{s.posted=true;s.post=S.day;cnAdd(5);toast('📌 Budget posted on the gate and online. Approval +5.',3);});
    if(k==='hall'){if(S.day-s.hall<30){toast('Next town hall in '+(30-S.day+s.hall)+' days.',2);return;}pay(CNR.hall,()=>{s.hall=S.day;cnAdd(3);toast('🏛️ Residents spoke, you listened. Approval +3.',3);});}
    if(k==='kiosk'&&!s.kiosk)pay(CNR.kiosk,()=>{s.kiosk=true;});
    if(k==='fix'&&s.flag){const f=s.flag;S.money+=f.amt;if(f.kind==='ghost')s.ghost=0;else s.pad=false;cnAdd(6);if(s.frozen)s.unfreeze=S.day+1;else s.clean++;s.flag=null;toast('✅ Report published. ₦'+short(f.amt)+' back in the treasury, approval +6.',4);re();}});}

/* ----- map: market, health centre, council office, roads and drains, town hall ----- */
function councilStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(43,22,8,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  if(li===0){for(let k=0;k<3;k++){const cx=x+30+k*((w-60)/2);rr(cx-22,y+60,44,26,3,'#c99a5b');ctx.fillStyle=['#e8541e','#2a62c9','#f2c230'][k];ctx.beginPath();ctx.moveTo(cx-30,y+60);ctx.lineTo(cx,y+34);ctx.lineTo(cx+30,y+60);ctx.fill();}
    rr(x+8,y+h-50,w-16,10,3,'#5b6a72');T('OKELE MARKET');}
  else if(li===1){rr(x+16,y+18,w-32,90,6,'#f4f1ea');rr(x+12,y+12,w-24,12,4,'#1f8a4c');rr(x+w/2-6,y+40,12,36,2,'#1f8a4c');rr(x+w/2-18,y+52,36,12,2,'#1f8a4c');rr(x+28,y+80,22,28,3,'#6b4423');T('HEALTH CENTRE');}
  else if(li===2){rr(x+14,y+20,w-28,96,4,'#e9dcc0');rr(x+10,y+14,w-20,10,3,'#138a8a');for(let r=0;r<2;r++)for(let k=0;k<4;k++)rr(x+26+k*((w-60)/4),y+34+r*38,18,22,2,'#7ad1ff');
    ctx.fillStyle='#6b4423';ctx.fillRect(x+w-30,y-20,3,40);rr(x+w-27,y-20,22,13,1,'#138a8a');ell(x+w-16,y-13.5,3.5,3.5,'#f2c230');T('COUNCIL OFFICE');}
  else if(li===3){ctx.fillStyle='#4a4d52';ctx.fillRect(x+6,y+30,w-12,70);ctx.strokeStyle='#f2c230';ctx.lineWidth=3;ctx.setLineDash([16,12]);ctx.beginPath();ctx.moveTo(x+10,y+65);ctx.lineTo(x+w-10,y+65);ctx.stroke();ctx.setLineDash([]);
    rr(x+6,y+104,w-12,12,2,'#8a9aa4');ctx.fillStyle='#2f7fc0';ctx.fillRect(x+10,y+107,w-20,6);ell(x+w/2-30,y+50,10,5,'#2c2f33');T('ROADS AND DRAINS');}
  else{rr(x+20,y+30,w-40,80,4,'#f4e9d0');ctx.fillStyle='#8e1c1c';ctx.beginPath();ctx.moveTo(x+12,y+32);ctx.lineTo(x+w/2,y+6);ctx.lineTo(x+w-12,y+32);ctx.fill();
    for(let k=0;k<4;k++)rr(x+34+k*((w-80)/3),y+40,10,66,2,'#fff');T('TOWN HALL');}}

BIZ.council={name:'Okele Council Services',tag:'Serve the ward, fix the town',tone:'#138a8a',field:'council',isNew:true,qf:300,
  owner:{cloth:'#138a8a',trim:'#f4f1ea',hat:'none',gender:'f'},
  hand:'Depot keeper',cook:'health worker',seller:'revenue clerk',
  outfit:{hand:{cloth:'#4a6a8a',trim:'#f2c230',hat:'cap'},cook:{cloth:'#b9e4c9',trim:'#f4f1ea',hat:'none',gender:'f'},server:{cloth:'#7ad1ff',trim:'#f28a1e',hat:'none'},
    cashier:{cloth:'#f4f1ea',trim:'#138a8a',hat:'gele',gender:'f'},porter:{cloth:'#f28a1e',trim:'#fff36b',hat:'hard'}},
  venue:['Ward 7 office, Okele Market gate','Councillor\'s ward with clinic and school','Okele LGA secretariat','Ministry of Local Services, Marobi','Government House, Marobi State'],
  // Research stage startup costs: health post (Ward 7) N1.5m, Councillor N12m, Chairman N150m, Commissioner N500m, Governor N2bn.
  costs:{venue:[12000000,150000000,500000000,2000000000],line:[1500000,null,null,null]},
  lines:[
   Object.assign(L('Market stall ticket','Market','#f2c230',200,'daily stall ticket','field',['ticket','#f4f1ea','#e8541e'],['doc','#fffaf0','#f2c230'],'desk'),{w:10,qx:3}),
   Object.assign(L('Clinic visit','Clinic','#1f8a4c',1000,'card and drugs','field',['carton','#c9b08a','#1f8a4c'],['kit','#f4f1ea','#1f8a4c'],'clinic'),{w:4,qx:2}),
   Object.assign(L('School term pack','School','#2a62c9',1500,'parents\' levy per term','field',['book','#2a62c9','#f2c230'],['book','#f4f1ea','#2a62c9'],'board'),{w:3,qx:2}),
   Object.assign(L('Motor park ticket','Park','#5b5f66',500,'daily loading ticket','field',['sack','#3a3d42','#22252b'],['doc','#e7f1fb','#5b5f66'],'scale'),{w:5,qx:2}),
   Object.assign(L('Waste collection','Waste','#2e8b3d',2500,'household, monthly','field',['bin','#2e8b3d','#1b5e2a'],['sack','#22252b','#2e8b3d'],'binbay'),{w:2,qx:1})]};
BIZX.council={demand:cnDemand,lineW:cnLineW,sale:cnSale,gate:cnGate,html:cnHtml,bind:cnBind,night:cnNight,month:cnMonth,crew:cnCrew,
  strip:councilStrip,base:'#9aa58a',floor:['#d8cfbf','#e2dacb','#ebe5d8','#f2eee4','#f6f3ec'],
  locked(){for(const k in SAVE.biz)if(k!=='council'&&levelOf(k)>=50)return null;return'Reach level 50 in another business to serve in local government';}};
