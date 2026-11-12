/* ===== evening routine: traffic, dinner, bath, sleep, payday statement, morning ===== */
const NORD=['drive','dinner','bath','sleep','stmt','morning'],DISH=['plate','#e8541e',null,['#b92c14','#ffcf4a'],'#6b3a1f'],CUP=['bottle','#8fd3f7','#1e6fb5'];
function startNight(){const NL=PLAN.road.night;$('hqp').hidden=true;G.trip=null;S.money+=S.till;S.till=0;const br=brDay();S.money+=br;S.mo.br+=br;S.lastEarn=S.dayEarn;SAVE.life=(SAVE.life||0)+S.dayEarn+(S.dayExp||0)+br;
  const due=monthDue(false),set=Math.max(0,Math.min(S.money,due.wages+due.tax-S.resv));S.money-=set;S.resv+=set;let stmt=null;
  if(S.day%MONTH===0){const d=monthDue(true),total=d.wages+d.tax,pool=S.resv;S.resv=0;S.money+=pool-total;S.stat.wages+=d.wages;S.stat.tax+=d.tax;
    stmt={m:S.day/MONTH,rev:d.rev,wages:d.wages,tax:d.tax,staff:d.staff,net:d.rev-total,short:Math.max(0,total-pool)};S.mo={rev:0,exp:0,br:0};}
  const tr=PLAN.road.night.traffic.slice().sort(()=>Math.random()-.5).slice(0,4);
  G.night={st:'drive',t:0,T:0,jam:rnd(10,14),off:0,v:0,stmt,sum:{day:S.day,earn:S.dayEarn,sold:S.daySold,exp:S.dayExp,br,set,left:MONTH-dayOfMonth()},
    L:{tr,radio:pick(NL.radio),dinner:pick(NL.dinner),bath:pick(NL.bath),sleep:pick(Math.random()<.5?NL.sleep:PBZ().chatter.night),morning:pick(NL.morning)}};
  G.input.active=false;G.custs=[];G.seatTaken.fill(null);G.bub=[];$('toast').style.opacity=0;document.body.classList.add('night');save();}
function nightNext(){const N=G.night;let i=NORD.indexOf(N.st)+1;if(NORD[i]==='stmt'&&!N.stmt)i++;if(i>=NORD.length)return endNight();N.st=NORD[i];N.t=0;
  if(N.st==='bath')water(5.2);if(N.st==='morning')crow();if(N.st==='stmt'){fanfare(false);confetti(40);}}
function nightTap(){const N=G.night;if(N.t>(N.st==='drive'?2.5:1.4))nightNext();}
function updNight(dt){const N=G.night;N.t+=dt;N.T+=dt;for(const p of G.conf){p.t+=dt;p.y+=p.vy*dt;p.x+=p.vx*dt;}G.conf=G.conf.filter(p=>p.y<H+20&&p.t<4);
  if(N.st==='drive'){const go=(N.t%4.2)<1.5||N.t>N.jam-2.4;N.v+=((go?1:0)-N.v)*Math.min(1,dt*2.5);N.off+=N.v*190*dt;}
  if(N.st==='dinner'&&Math.floor(N.t/1.1)!==Math.floor((N.t-dt)/1.1))beep(rnd(1500,2100),.04,'triangle',.02);
  if(N.t>={drive:N.jam,dinner:6.5,bath:5.5,sleep:18,stmt:24,morning:6}[N.st])nightNext();audioTick(dt);}
function endNight(){S.day++;S.clock=0;S.dayEarn=0;S.daySold=0;S.dayExp=0;G.closing=false;G.night=null;document.body.classList.remove('night');const P=G.player;P.x=150;P.y=1200;P.stack=[];P.trail=null;G.truck={state:'wait',t:4,y:-140};G.exp={state:'wait',t:12,x:WW+160,ord:null};
  rollEvent();toast(S.money<0?'Your account is in the red. No upgrades until you sell your way back up!':S.ev?EVI[S.ev.fx]+' '+S.ev.name+'. '+S.ev.text:'Day '+S.day+'. Good morning! '+(lvl('house')?'You slept well: morning rush is on.':'Market don open.'),S.ev?6:3.5);updateHud();save();}

function ncap(title,line,tapAt){const N=G.night,g=ctx;g.textAlign='center';g.font='32px "Lilita One",system-ui';g.lineWidth=5;g.strokeStyle='rgba(20,10,4,.7)';g.strokeText(title,0,-268);g.fillStyle='#ffc23d';g.fillText(title,0,-268);
  if(line)label(0,262,line,'#2b1608','#fff6e4',14);if(N.t>tapAt){g.globalAlpha=.55+.45*Math.sin(N.T*4);g.font='800 13px Nunito,system-ui';g.fillStyle='#fff';g.fillText('Tap to continue',0,296);g.globalAlpha=1;}}
function nroom(wall,floor,fy){const g=ctx;g.fillStyle=wall;g.fillRect(-1500,-900,3000,1800);g.fillStyle=floor;g.fillRect(-1500,fy,3000,900);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-1500,fy,3000,6);}
function nwindow(x,y,w,h,day){const g=ctx;R(g,x-5,y-5,w+10,h+10,5,'#6b3a1f');R(g,x,y,w,h,3,day?'#9fd8f5':'#141a3a');if(day)E(g,x+w*.7,y+h*.4,13,13,'#ffe27a');else{E(g,x+w*.7,y+h*.35,10,10,'#fff6d8');for(let i=0;i<7;i++)E(g,x+8+(i*37)%(w-14),y+8+(i*23)%(h-14),1.2,1.2,'#fff');}
  g.fillStyle='#6b3a1f';g.fillRect(x+w/2-2,y,4,h);g.fillRect(x,y+h/2-2,w,4);}
function drawNight(){const N=G.night,t=N.t,g=ctx,hl=lvl('house'),cl=lvl('car'),o=B.owner,s=Math.min(W/420,H/640);
  g.setTransform(DPR*s,0,0,DPR*s,DPR*W/2,DPR*H/2);
  if(N.st==='drive'){const sky=g.createLinearGradient(0,-340,0,60);sky.addColorStop(0,'#2a1f5c');sky.addColorStop(.7,'#c2553a');sky.addColorStop(1,'#f79a3c');g.fillStyle=sky;g.fillRect(-1500,-900,3000,1000);E(g,120,30,46,46,'#ffcf7a');
    for(let i=0;i<16;i++){const x=((i*170-N.off*.12)%2720+2720)%2720-1360,h=70+(i*53)%130;R(g,x,60-h,110,h,3,i%2?'#2b2350':'#3a2c63');for(let r=0;r<Math.floor(h/26);r++)for(let c=0;c<4;c++)if((i+r*3+c)%3)R(g,x+10+c*25,70-h+r*26,14,12,2,'#ffd98a');}
    g.fillStyle='#2f2c2a';g.fillRect(-1500,60,3000,190);g.fillStyle='#57514a';g.fillRect(-1500,250,3000,700);g.fillStyle='#e9d27a';for(let x=-1500-(N.off%80);x<1500;x+=80)g.fillRect(x,152,42,5);
    for(let i=0;i<9;i++){const x=((i*330-N.off)%2970+2970)%2970-1485;g.fillStyle='#1b1a22';g.fillRect(x,-40,5,100);R(g,x-16,-46,36,8,3,'#1b1a22');E(g,x+10,-36,7,4,'#ffe9a8');}
    const stop=N.v<.35,cars=[[-420,112,'danfo'],[-210,112,'car'],[40,112,'keke'],[250,112,'danfo'],[470,112,'suv'],[-380,200,'car'],[210,200,'danfo'],[430,200,'keke']];
    const dc=(c,i)=>{const x=c[0]+Math.sin(N.T*.6+i*2)*10+(1-N.v)*0;veh(g,x,c[1],c[2],1.25,['#c62828','#2a62c9','#f4f1ea','#1b1f27'][i%4]);if(stop){E(g,x-52,c[1]-20,5,4,'#ff2a1a');g.globalAlpha=.3;E(g,x-52,c[1]-20,13,9,'#ff2a1a');g.globalAlpha=1;}};
    cars.slice(0,5).forEach(dc);const hx=260-((N.T*34)%620);drawPerson(hx,156,{cloth:'#c9367a',trim:'#ffd659',hat:'none'},['p0','p0','p0'],N.T*9,-1,1.5);
    cars.slice(5).forEach((c,i)=>dc(c,i+5));const kind=['danfo','keke','car','suv'][cl],bob=Math.sin(N.T*22)*(N.v>.2?1.2:.5);veh(g,-80,206+bob,kind,1.75,cl===2?'#c62828':'#1b1f27');
    for(let i=0;i<3;i++){const k=(N.T*.9+i/3)%1;g.globalAlpha=(1-k)*.4;E(g,-165-k*40,196-k*20,6+k*10,5+k*8,'#ddd');g.globalAlpha=1;}
    label(0,-222,'📻 '+N.L.radio,'#2b1608','#ffc23d',13);const li=N.L.tr[Math.floor(t/3.4)%N.L.tr.length];label(0,-186,li,'#2b1608','#fff6e4',13);
    R(g,-150,262,300,10,5,'rgba(255,255,255,.25)');R(g,-150,262,300*Math.min(1,t/N.jam),10,5,'#7dff9a');g.font='16px system-ui';g.textAlign='center';g.fillText('🏡',166,273);
    ncap(stop?'Go-slow...':'Going home',null,2.5);}
  else if(N.st==='dinner'){nroom(['#b9a58a','#d9c7a8','#f1e2c6','#f4f1ea'][hl],['#6b4a32','#7a4a2a','#8a5a3a','#5b4636'][hl],150);nwindow(-175,-190,90,80,false);
    g.globalAlpha=.16;E(g,0,-110,150,130,'#ffe9a8');g.globalAlpha=1;g.fillStyle='#3a2a1e';g.fillRect(-1.5,-400,3,190);E(g,0,-205,22,12,'#e8a63c');E(g,0,-196,9,7,'#fff6c8');
    if(hl>=2){R(g,95,-170,80,56,4,'#3a2a1e');R(g,100,-165,70,46,2,'#2a62c9');E(g,135,-140,12,12,'#ffd659');}
    R(g,-70,20,140,150,10,'#5b3a22');drawPerson(0,150,o,null,0,1,3.1);
    R(g,-170,96,340,20,6,'#c98a45');R(g,-160,116,320,10,3,'#8a5426');g.fillStyle='#6b3b18';g.fillRect(-150,126,14,90);g.fillRect(136,126,14,90);
    drawDef(DISH,0,104,3.2);drawDef(CUP,96,100,1.9);const k=(Math.sin(t*5.6)+1)/2;g.strokeStyle='#d9d9d9';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(34-k*20,84-k*70);g.lineTo(52-k*20,64-k*70);g.stroke();E(g,32-k*20,86-k*70,7,5,k<.5?'#e8541e':'#d9d9d9');
    ncap('Dinner time',N.L.dinner,1.4);}
  else if(N.st==='bath'){nroom('#bfe3f0','#8fb3c4',170);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;for(let x=-1500;x<1500;x+=44){g.beginPath();g.moveTo(x,-900);g.lineTo(x,170);g.stroke();}for(let y=-340;y<170;y+=44){g.beginPath();g.moveTo(-1500,y);g.lineTo(1500,y);g.stroke();}
    g.fillStyle='#9aa0a6';g.fillRect(96,-400,8,170);R(g,40,-238,64,10,4,'#9aa0a6');E(g,40,-226,26,9,'#c9ced2');
    drawPerson(0,134,{cloth:'#6b3a1f',trim:'#6b3a1f',hat:'none'},null,0,1,3.1);E(g,0,0,30,18,'#f5a8c8');E(g,-8,-6,10,5,'rgba(255,255,255,.5)');
    g.strokeStyle='rgba(120,190,240,.85)';g.lineWidth=2.5;for(let i=0;i<22;i++){const x=-2+((i*37)%96)-48+i%3,y=((t*520+i*71)%380)-216;g.beginPath();g.moveTo(40+x*.9,y);g.lineTo(40+x,y+16);g.stroke();}
    for(let i=0;i<6;i++){g.fillStyle=i%2?'#f7c948':'#36b3a8';g.fillRect(-135+i*45,70,45,172);}g.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<6;i++)g.fillRect(-135+i*45,70,4,172);R(g,-150,60,300,12,5,'#8a8f96');
    for(let i=0;i<9;i++){const k=(t*.35+i/9)%1;g.globalAlpha=(1-k)*.8;g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.arc(-110+i*28+Math.sin(t*2+i)*8,50-k*250,5+(i%3)*3,0,7);g.stroke();}
    for(let i=0;i<4;i++){const k=(t*.25+i/4)%1;g.globalAlpha=(1-k)*.3;E(g,-80+i*55,-40-k*160,34+k*30,22+k*18,'#fff');}g.globalAlpha=1;
    ncap('Bath time',N.L.bath,1.4);}
  else if(N.st==='sleep'||N.st==='stmt'){nroom('#1d2440','#151a30',190);nwindow(96,10,78,70,false);
    R(g,-190,96,300,110,10,'#4a2e1a');R(g,-200,60,26,150,8,'#3a2212');R(g,-176,84,280,70,12,'#e9e2d2');R(g,-168,74,74,40,14,'#fff');E(g,-130,88,22,19,'#6b3a1f');E(g,-138,74,24,12,o.trim);
    R(g,-100,98,206,70,14,o.cloth);for(let i=0;i<5;i++)E(g,-76+i*40,132,7,7,o.trim);R(g,-100,98,206,12,6,'rgba(255,255,255,.25)');
    g.font='900 22px Nunito,system-ui';g.textAlign='left';for(let i=0;i<3;i++){const k=(N.T*.4+i/3)%1;g.globalAlpha=1-k;g.fillStyle='#fff';g.fillText('z',-110+k*50,60-k*70);}g.globalAlpha=1;
    const pw=372,px=-186,py=-304,M=N.stmt,U=N.sum,rows=[];
    if(N.st==='sleep'){rows.push(['Shop sales ('+U.sold.toLocaleString()+' orders)','₦'+fmt(U.earn),'#b9ffcf']);if(S.emp.con)rows.push(['Export trucks','₦'+fmt(U.exp),'#b9ffcf']);if(S.emp.br)rows.push([S.emp.br+' branches sent','₦'+fmt(U.br),'#b9ffcf']);
      rows.push(['Set aside for salaries and tax','-₦'+fmt(U.set),'#ffb3a3']);rows.push(['Payday',U.left?'in '+U.left+' day'+(U.left>1?'s':''):'tonight','#ffe9a8']);if(S.money<0)rows.push(['Account balance','-₦'+fmt(-S.money),'#ff8a7a']);}
    else{rows.push(['Total revenue','₦'+fmt(M.rev),'#b9ffcf']);rows.push(['Salaries, '+M.staff.toLocaleString()+' people','-₦'+fmt(M.wages),'#ffb3a3']);rows.push([TAX.label,M.tax?'-₦'+fmt(M.tax):'₦0 (relief)','#ffb3a3']);rows.push(['Profit after salaries and tax',(M.net<0?'-₦':'₦')+fmt(Math.abs(M.net)),'#ffd659']);
      rows.push([M.short?'Payday account was short by':'Paid in full from payday account',M.short?'₦'+fmt(M.short):'✓',M.short?'#ff8a7a':'#7dff9a']);}
    const ph=74+rows.length*28+34;R(g,px,py,pw,ph,18,'rgba(43,22,8,.93)');g.textAlign='center';g.fillStyle='#ffc23d';g.font='27px "Lilita One",system-ui';g.fillText(N.st==='sleep'?'Day '+U.day+' closed':'Month '+M.m+' payday',0,py+40);
    g.font='800 14px Nunito,system-ui';rows.forEach((r,i)=>{const y=py+76+i*28;g.textAlign='left';g.fillStyle='#fff6e4';g.fillText(r[0],px+18,y);g.textAlign='right';g.fillStyle=r[2];g.fillText(r[1],px+pw-18,y);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(px+16,y+8,pw-32,1);});
    g.textAlign='center';g.fillStyle='#fff6e4';g.globalAlpha=.6+.4*Math.sin(N.T*4);g.font='800 13px Nunito,system-ui';g.fillText(N.st==='sleep'?'Tap to sleep till morning':'Tap to continue',0,py+ph-14);g.globalAlpha=1;
    label(0,262,N.st==='sleep'?N.L.sleep:'Staff are happy. Salaries landed on time!','#2b1608','#fff6e4',14);}
  else{const k=Math.min(1,t/3),sky=g.createLinearGradient(0,-340,0,150);sky.addColorStop(0,k>.5?'#8fc8f0':'#4a5aa0');sky.addColorStop(1,'#ffc58a');g.fillStyle=sky;g.fillRect(-1500,-900,3000,1100);E(g,-120,130-k*200,40,40,'#fff2b0');
    g.fillStyle='#8a6a4a';g.fillRect(-1500,150,3000,900);g.fillStyle='#3f3c38';g.fillRect(-1500,186,3000,60);g.fillStyle='#e9d27a';for(let x=-1500;x<1500;x+=80)g.fillRect(x,213,42,5);
    g.save();g.translate(70,168);g.scale(.8,.8);drawHouse(0,0,hl,t<2.2);g.restore();drawDef(['chicken'],-170,152,2.2);if(t<2.6)label(-150,84,'Kukurukuu!','#2b1608','#fff6e4',13);
    const out=Math.max(0,t-3.6);veh(g,-60-out*out*90,236,['danfo','keke','car','suv'][cl],1.5,cl===2?'#c62828':'#1b1f27',true);
    ncap('Day '+(S.day+1),N.L.morning,1.4);}
  g.setTransform(DPR,0,0,DPR,0,0);for(const p of G.conf){g.fillStyle=p.c;g.fillRect(p.x,p.y,p.r,p.r*.66);}
}
