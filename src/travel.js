/* ===== travel: drive or fly to a region, tour the shops there, come home ===== */
// Return tickets and flight times are 2026 estimates from Lagos (LOS).
const TRIPS=[{to:'Lagos',car:1,time:'45 min in traffic',fare:25000},{to:'Ibadan',time:'25 min',fare:95000},{to:'Port Harcourt',time:'1 h 10 min',fare:180000},{to:'Enugu',time:'1 h 05 min',fare:175000},
  {to:'Abuja',time:'1 h 15 min',fare:185000},{to:'Kano',time:'1 h 40 min',fare:210000},{to:'Maiduguri',time:'1 h 55 min',fare:230000},{to:'Accra',time:'1 h',fare:650000,abroad:1},
  {to:'Nairobi',time:'5 h 30 min',fare:1300000,abroad:1},{to:'London',time:'6 h 40 min',fare:2400000,abroad:1},{to:'Houston',time:'14 h 30 min, one stop',fare:3400000,abroad:1},{to:'Dubai',time:'7 h 30 min',fare:2100000,abroad:1}];
const regCount=r=>Math.max(0,Math.min(RG[r].size,S.emp.br-regStart(r)));
const boosted=r=>!!(S.emp.insp&&S.emp.insp[r]>=S.day);
const shopForm=(i,d)=>.75+(((Math.sin(i*12.9898+d*78.233)*43758.5453)%1)+1)%1*.5;   // each shop has good and slow days
const shopDay=(r,i)=>Math.round(EC.branch.b*EC.regions[r].mult*Fu()*shopForm(regStart(r)+i,S.day)*(boosted(r)?1.2:1));
function tripStart(r){const T=TRIPS[r];if(!G||G.night||G.trip)return;if(G.closing){toast('Shops are closed for today. Travel tomorrow.',3);return;}if(S.money<T.fare){toast('You need ₦'+short(T.fare)+' for the trip.',3);return;}
  S.money-=T.fare;$('hqp').hidden=true;G.input.active=false;G.trip={r,st:'car',t:0,T:0,off:0};document.body.classList.add('night');$('toast').style.opacity=0;if(!T.car)setTimeout(()=>{if(G&&G.trip)jet(7);},4200);save();}
function tripNext(){const X=G.trip,T=TRIPS[X.r];X.t=0;
  if(X.st==='car'){if(T.car)return tourOpen();X.st='fly';}
  else if(X.st==='fly')tourOpen();
  else tripEnd();}
function tripTap(){if(G.trip.st!=='tour'&&G.trip.t>1.2)tripNext();}
function updTrip(dt){const X=G.trip;X.t+=dt;X.T+=dt;X.off+=dt*220;if(X.st==='tour')return;if(X.t>=(X.st==='car'?5:X.st==='fly'?7:4.5))tripNext();}
function tripEnd(){G.trip=null;$('hqp').hidden=true;document.body.classList.remove('night');const P=G.player;P.x=150;P.y=1200;P.stack=[];P.trail=null;toast('Welcome back to '+B.name+'. The shop kept selling while you were away.',4);updateHud();save();}
function tourOpen(){const X=G.trip,r=X.r,T=TRIPS[r],n=regCount(r),P=PBZ();X.st='tour';let tot=0,best=0,bi=0;const rows=[];
  for(let i=0;i<n;i++){const v=shopDay(r,i),f=shopForm(regStart(r)+i,S.day);tot+=v;if(v>best){best=v;bi=i;}rows.push('<tr><td>'+cityOf(regStart(r)+i)+'</td><td>'+(f>1.12?'🔥 Booming':f<.88?'⚠️ Slow week':'✅ Steady')+'</td><td>₦'+short(v)+'</td></tr>');}
  let h='<header><h1>'+RG[r].flag+' '+RG[r].name+'<small>'+RG[r].managerTitle+' welcomes you · '+T.time+' from Lagos</small></h1></header>';
  h+='<div class="stats"><div class="stat">Shops here<b>'+n+' / '+RG[r].size+'</b></div><div class="stat">Profit today<b>₦'+fmt(tot)+'</b></div><div class="stat">Staff here<b>'+(n*BRSTAFF).toLocaleString()+'</b></div><div class="stat">Best shop<b>'+cityOf(regStart(r)+bi)+'</b></div></div>';
  h+=boosted(r)?'<div class="lock">⭐ Inspection bonus is on: these shops earn 20% more until day '+S.emp.insp[r]+'.</div>'
    :'<button class="it" type="button" id="insp" style="--p:100%"><i>📋</i><div><strong>Inspect every '+P.branchNoun+' here</strong><span>Walk the floor, check the books, greet the staff. These shops earn 20% more for 5 days.</span></div><em>Inspect</em></button>';
  h+='<h2>Every '+P.branchNoun+' in '+RG[r].name+'</h2><table><tr><td><b>Town</b></td><td><b>This week</b></td><td><b>Profit today</b></td></tr>'+rows.join('')+'</table>';
  h+='<p class="note">Each shop sends its profit to HQ every night. Trip cost: ₦'+fmt(T.fare)+' return.</p><button class="it" type="button" id="home" style="--p:0%"><i>'+(T.car?'🚗':'🛬')+'</i><div><strong>'+(T.car?'Drive back to your shop':'Fly home to Lagos')+'</strong><span>Your flagship kept selling while you were away.</span></div><em>Go</em></button>';
  $('hqin').innerHTML=h;$('hqp').hidden=false;$('hqp').scrollTop=0;
  const ib=$('insp');if(ib)ib.addEventListener('click',()=>{S.emp.insp=S.emp.insp||{};S.emp.insp[r]=S.day+5;fanfare(false);banner('INSPECTED',RG[r].name+' shops earn 20% more for 5 days');save();tourOpen();});
  $('home').addEventListener('click',()=>{$('hqp').hidden=true;if(T.car)return tripEnd();X.st='back';X.t=0;jet(4.5);});}
function jet(dur){if(quiet()||!audio())return;try{const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=420;const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.5,t+.8);g.gain.setValueAtTime(.5,t+dur-1);g.gain.linearRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(MG);s.start(t);s.stop(t+dur+.05);}catch(e){}}
function travelHtml(){const e=S.emp;if(!e.br)return'';let h='<h2>Visit your shops</h2>';
  for(let r=0;r<RG.length;r++){const n=regCount(r);if(!n)continue;const T=TRIPS[r];h+='<button class="it'+(S.money>=T.fare?'':' no')+'" type="button" data-go="'+r+'" style="--p:0%"><i>'+(T.car?'🚗':'✈️')+'</i><div><strong>'+(T.car?'Drive round your Lagos shops':'Fly to '+T.to+', '+RG[r].name)+'</strong><span>'+n+' shop'+(n>1?'s':'')+' · '+T.time+(boosted(r)?' · ⭐ bonus on':'')+'</span></div><em>₦'+short(T.fare)+'</em></button>';}
  return h;}
function drawTrip(){const X=G.trip,T=TRIPS[X.r],g=ctx,s=Math.min(W/420,H/640),t=X.t;g.setTransform(DPR*s,0,0,DPR*s,DPR*W/2,DPR*H/2);
  const title=(big,small)=>{g.textAlign='center';g.font='30px "Lilita One",system-ui';g.lineWidth=5;g.strokeStyle='rgba(20,10,4,.7)';g.strokeText(big,0,-250);g.fillStyle='#ffc23d';g.fillText(big,0,-250);label(0,-214,small,'#2b1608','#fff6e4',13);
    if(t>1.2){g.globalAlpha=.55+.45*Math.sin(X.T*4);g.font='800 13px Nunito,system-ui';g.fillStyle='#fff';g.fillText('Tap to continue',0,296);g.globalAlpha=1;}};
  if(X.st==='car'){const sky=g.createLinearGradient(0,-340,0,60);sky.addColorStop(0,'#5fb4ee');sky.addColorStop(1,'#cfeaff');g.fillStyle=sky;g.fillRect(-1500,-900,3000,1000);E(g,130,-150,34,34,'#fff2a8');
    for(let i=0;i<16;i++){const x=((i*170-X.off*.25)%2720+2720)%2720-1360,h=70+(i*53)%130;R(g,x,60-h,110,h,3,i%2?'#8fa3b8':'#a9bccf');for(let r=0;r<Math.floor(h/26);r++)for(let c=0;c<4;c++)R(g,x+10+c*25,70-h+r*26,14,12,2,'#e8f4ff');}
    g.fillStyle='#3f3c38';g.fillRect(-1500,60,3000,190);g.fillStyle='#8a8478';g.fillRect(-1500,250,3000,700);g.fillStyle='#e9d27a';for(let x=-1500-(X.off%80);x<1500;x+=80)g.fillRect(x,152,42,5);
    if(!T.car){const sx=900-X.off*.9;R(g,sx,-60,150,60,6,'#1f5fa8');g.font='900 15px Nunito,system-ui';g.textAlign='center';g.fillStyle='#fff';g.fillText('✈ AIRPORT',sx+75,-24);g.fillStyle='#555';g.fillRect(sx+20,0,6,60);g.fillRect(sx+124,0,6,60);}
    const cl=lvl('car');veh(g,-60,206+Math.sin(X.T*22),['danfo','keke','car','suv'][cl],1.75,cl===2?'#c62828':'#1b1f27');veh(g,230-((X.T*60)%700),118,'danfo',1.2,'',true);
    title(T.car?'Lagos shop tour':'To the airport',T.car?'Checking on your '+regCount(X.r)+' Lagos shops':'Flight to '+T.to+' boards soon');}
  else{const back=X.st==='back',sky=g.createLinearGradient(0,-340,0,340);sky.addColorStop(0,'#2f7fd6');sky.addColorStop(1,'#bfe4ff');g.fillStyle=sky;g.fillRect(-1500,-900,3000,1800);
    for(let i=0;i<9;i++){const x=((i*260-X.off*(.5+(i%3)*.3)*(back?-1:1))%2400+2400)%2400-1200,y=-170+(i*97)%420;g.globalAlpha=.85;E(g,x,y,60,20,'#fff');E(g,x+34,y-12,38,18,'#fff');E(g,x-36,y-8,30,14,'#fff');g.globalAlpha=1;}
    g.save();g.translate(0,-10+Math.sin(X.T*2)*6);if(back)g.scale(-1,1);g.fillStyle='#d9dee6';g.beginPath();g.moveTo(-10,0);g.lineTo(-58,62);g.lineTo(-30,62);g.lineTo(34,0);g.fill();g.beginPath();g.moveTo(-10,-6);g.lineTo(-48,-48);g.lineTo(-28,-48);g.lineTo(26,-6);g.fill();
      R(g,-110,-16,220,32,16,'#f4f6fa');R(g,-110,-2,220,6,0,B.tone);g.fillStyle='#f4f6fa';g.beginPath();g.moveTo(-104,-10);g.lineTo(-132,-56);g.lineTo(-104,-56);g.lineTo(-76,-12);g.fill();g.fillStyle=B.tone;g.beginPath();g.moveTo(-122,-40);g.lineTo(-132,-56);g.lineTo(-104,-56);g.lineTo(-96,-40);g.fill();
      for(let i=0;i<9;i++)R(g,-70+i*17,-10,9,7,2,'#7ab8e8');R(g,86,-10,16,8,3,'#2a4a6a');g.restore();
    R(g,-150,196,300,54,14,'rgba(43,22,8,.85)');g.textAlign='center';g.font='900 15px Nunito,system-ui';g.fillStyle='#fff6e4';g.fillText(back?T.to+'  ✈  Lagos':'Lagos  ✈  '+T.to,0,218);g.font='800 12px Nunito,system-ui';g.fillStyle='#ffe9a8';g.fillText(T.time+(T.abroad?' · passport stamped':''),0,238);
    const k=Math.min(1,t/(back?4.5:7));R(g,-120,262,240,8,4,'rgba(255,255,255,.35)');R(g,-120,262,240*k,8,4,'#7dff9a');
    title(back?'Flying home':'Flying to '+T.to,back?'Next stop: '+B.name:RG[X.r].flag+' '+RG[X.r].name+' · '+regCount(X.r)+' shops waiting');}
  g.setTransform(DPR,0,0,DPR,0,0);}
