/* ===== setup ===== */
const $=id=>document.getElementById(id);
const cv=$('c');let ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,SCALE=1,QUAL=1;
function resize(){DPR=Math.max(1,Math.min(2,window.devicePixelRatio||1)*QUAL);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;SCALE=W>H?Math.min(H/640,W/1000):Math.min(W/600,H/900);if(window.NMZOOM)SCALE=window.NMZOOM;}
addEventListener('resize',resize);resize();
const WW=1000,WH=1420,LX=i=>110+i*170;
const SEATS=[6,12,24,32,40],VCAP=[9,16,28,36,44],VD=[1,1.7,2.6,3.6,4.6],VM=[1,1.3,1.7,2.5,4],INCAP=[0,0,0,150,1000],VR=[0,0,0,6,26],QTY=[3,4,5,7,9],SM=[1,2,4],ADM=[1,1.35,1.75,2.2];
const GROW=1.15,CASH=['cash'];
const rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b,c,d)=>Math.hypot(a-c,b-d);

/* ===== save ===== */
let KEY='naijaMarket.v2',cloudHook=null;
let SAVE={sound:true,cur:null,biz:{}};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.biz)SAVE=s;}catch(e){}
if(SAVE.snd==null)SAVE.snd=SAVE.sound===false?0:2;
function save(){try{localStorage.setItem(KEY,JSON.stringify(SAVE));}catch(e){}if(cloudHook)cloudHook();}
let S=null,B=null,G=null,PROG=[];
const lvl=id=>(S.pads[id]?S.pads[id].l:0);
const flag=()=>Object.values(S.pads).reduce((s,p)=>s+p.l,0);
const level=()=>1+flag()+empCount();
const stage=()=>lvl('venue');
const lineOpen=i=>i===0||lvl('line'+i)>0;
// openLines and visibleSteps are asked for many times a frame, so each is worked out once per update.
let _fr=0,_olF=-1,_ol=[],_vsF=-1,_vs=[];const dirty=()=>{_olF=_vsF=-1;};
const openLines=()=>{if(_olF!==_fr){_olF=_fr;_ol=B.lines.map((l,i)=>i).filter(lineOpen);}return _ol;};
const trayCap=()=>20+10*lvl('tray'),staffCap=()=>[16,32,60][lvl('train')],staffSpd=()=>[150,190,235][lvl('train')]*(S.emp.mgr?1.2:1)*(evx('speed_up')?1.3:1)*(S.money<0?.7:1);
const ropeMax=()=>1150+420*lvl('rope');
const dayLen=()=>[200,230,265,300][lvl('car')];
const hour=()=>8+12*Math.min(1,S.clock/dayLen());
const revenue=(i,vip)=>Math.round(B.lines[i].price*SM[lvl('st'+i)]*VM[stage()]*(vip?5:1)*(evx('price_up')?1.25:1));

/* ===== progression: ordered steps, cost grows with position ===== */
function nice(n){const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(n))-1));return Math.round(n/p)*p;}
function buildProg(){const D=B.lines.some(l=>l.src==='depot');
  const seq=['tray','cook0','hand','server','rope','venue','line1','cook1','cashier',D&&'porter','st0','car','tray','line2','cook2','server','ads','st1','venue','house','hand','rope',D&&'truck','line3','cook3','st2','train',D?'porter':'hand','car','venue','ads','tray','line4','cook4','st0','server','house','st3','st1','rope',D?'porter':'server',D&&'truck','ads','st4','train','st2','car','tray','st3','house','st4','venue'].filter(Boolean);
  const cnt={};let open=1;const ref=()=>{let a=0,w=0;for(const l of B.lines.slice(0,open)){a+=l.price*(l.w||1);w+=l.w||1;}return a/w;};
  PROG=seq.map((id,i)=>{cnt[id]=(cnt[id]||0)+1;const base=id.replace(/\d/,'');const w=base==='venue'?(cnt[id]===4?4:cnt[id]===3?1.8:2.4):base==='line'?1.7:base==='car'?1.5:base==='house'?2:1;
    let cost=nice(ref()*12*Math.pow(GROW,i)*w);const fix=B.costs&&B.costs[base]&&B.costs[base][base==='line'?+(id.match(/\d/)||[1])[0]-1:cnt[id]-1];if(fix)cost=fix;if(base==='line')open++;return{id,base,arg:+(id.match(/\d/)||[0])[0],i,n:cnt[id],cost};});
  G.maxOf=cnt;}
function nextStep(id){const n=lvl(id)+1;return PROG.find(s=>s.id===id&&s.n===n)||null;}
function visibleSteps(){if(_vsF===_fr)return _vs;const bought=flag(),ids=new Set(),out=[];for(const s of PROG){if(ids.has(s.id))continue;if(s.n===lvl(s.id)+1){ids.add(s.id);if(s.i<=bought+3)out.push(s);}}_vsF=_fr;return _vs=out;}
function padPos(s){const i=s.arg;switch(s.base){
  case'line':return[LX(i),512];case'cook':return[LX(i)+85,498];case'st':return[LX(i)+85,574];
  case'hand':return[150,392];case'rope':return[240,392];case'tray':return[330,392];
  case'porter':return[830,410];case'truck':return[915,410];
  case'server':return[952,478];case'cashier':return[952,548];case'train':return[952,618];
  case'venue':return[500,1228];case'ads':return[600,1228];case'car':return[215,1228];case'house':return[305,1228];}}
function padLabel(s){const l=B.lines[s.arg];switch(s.base){
  case'line':return'New: '+l.n;case'cook':return'Hire '+(B.cook||(B.food?'cook':'packer'))+' for '+l.short;case'st':return l.short+': sell x'+SM[s.n]+' per batch';
  case'hand':return'Hire '+(B.hand?B.hand.toLowerCase():B.field==='water'?'fisherman':B.field==='yard'?'offloader':B.field==='pasture'?'herdsman':'farmhand');
  case'rope':return'Longer rope';case'tray':return'Bigger head tray';case'porter':return'Hire porter';case'truck':return'Bigger delivery van';
  case'server':return'Hire '+(B.seller||(B.food?'server':'sales girl'));case'cashier':return'Hire cashier';case'train':return'Staff training';
  case'venue':return'Renovate: '+B.venue[s.n];case'ads':return ADS[s.n];case'car':return'Buy '+CAR[s.n];case'house':return'Move to '+HOUSE[s.n];}}
const PICON={hand:'🧑‍🌾',rope:'🪢',tray:'🧺',porter:'📦',truck:'🚚',server:'🏃',cashier:'💰',train:'🎓',venue:'🏗️',ads:'📻',car:'🚗',house:'🏡',cook:'👩‍🍳'};

/* ===== world build ===== */
function build(){
  B=BIZ[SAVE.cur];S=migrate(SAVE.biz[SAVE.cur]);dirty();if(typeof diaCheck==='function')setTimeout(diaCheck,1500);
  G={t:0,flyers:[],parts:[],floats:[],conf:[],custs:[],workers:[],cars:[],crops:[],procIn:[0,0,0,0,0],procT:[0,0,0,0,0],out:[0,0,0,0,0],counter:[0,0,0,0,0],depot:[0,0,0,0,0],
     player:{x:450,y:400,stack:[],trail:null,face:1,step:0},input:{active:false},keys:{},cam:{x:450,y:400},acc:{pick:0,drop:0,cash:0,payFly:0,spawn:0,v:0,hud:0,save:0,fl:0,chat:3},
     truck:{state:'wait',t:6,y:-140},exp:{state:'wait',t:10,x:WW+160,ord:null},mach:{x:120,y:160,v:150,acc:0},beltT:[0,0,0,0,0],depT:[0,0,0,0,0],bub:[],closing:false,closeT:0,night:null,inside:0,toastT:0,warnT:0,onPad:null,speed:1};
  G.F1=refP()*16*QF[SAVE.cur];buildProg();
  G.F=B.lines.map((l,i)=>i).filter(i=>B.lines[i].src==='field');G.D=B.lines.map((l,i)=>i).filter(i=>B.lines[i].src==='depot');
  const f=G.field={x:40,y:30,w:G.D.length?650:920,h:270};G.postA={x:f.x+70,y:325};G.postB={x:f.x+f.w-70,y:325};
  const sw=f.w/G.F.length;G.strips=G.F.map((li,k)=>({li,x:f.x+k*sw,w:sw}));
  G.stacks=G.D.map((li,j)=>({li,x:735+j*70,y:338}));
  const moving=B.field==='pasture'||B.field==='water';
  for(const s of G.strips){if(moving){const n=Math.round(s.w*f.h/1350);for(let i=0;i<n;i++)G.crops.push(newAnimal(s));}
    else for(let y=f.y+22;y<f.y+f.h-10;y+=30)for(let x=s.x+18;x<s.x+s.w-8;x+=30)if(!(B.field==='port'&&s.li>=2&&y<f.y+72)&&!(B.field==='campus'&&(s.li===0||s.li===3||s.li===4)&&y<f.y+108))G.crops.push({li:s.li,x:x+rnd(-4,4),y:y+rnd(-4,4),ready:true,t:0});}
  makeSeats();syncStaff();updateHud(true);
}
function newAnimal(s){const f=G.field;return{li:s.li,s,x:rnd(s.x+16,s.x+s.w-16),y:rnd(f.y+16,f.y+f.h-16),vx:rnd(-16,16),vy:rnd(-16,16),ready:true,t:0,mv:true,ph:rnd(0,6)};}
function makeSeats(){const st=stage(),s=[];G.tables=[];
  if(st===0){for(let i=0;i<6;i++)s.push({x:330+i*56,y:884});}
  else{const xs=st<=2?[220,440,660]:[150,320,490,660],ys=st===1?[930]:st<4?[900,1060]:[880,1000,1120];let n=0;
    for(const y of ys)for(const x of xs){if(n>=SEATS[st]/4)break;G.tables.push({x,y});for(const[dx,dy]of[[-30,-6],[30,-6],[-30,16],[30,16]])s.push({x:x+dx,y:y+dy});n++;}}
  G.seats=s;G.seatTaken=new Array(s.length).fill(null);for(const c of G.custs){c.st='out';c.seat=-1;}}
function syncStaff(){const want=[];
  for(let i=0;i<lvl('hand');i++)want.push('hand');for(let i=0;i<lvl('porter');i++)want.push('porter');for(let i=0;i<lvl('server');i++)want.push('server');
  for(let i=0;i<5;i++)if(lvl('cook'+i))want.push('cook'+i);if(lvl('cashier'))want.push('cashier');
  if(S.emp.mgr)want.push('manager');for(let i=0;i<[0,1,1,2,2,3,3][S.emp.con];i++)want.push('loader');
  for(const k of want){const have=G.workers.filter(w=>w.key===k).length,need=want.filter(x=>x===k).length;
    for(let j=have;j<need;j++){const w={key:k,kind:k.replace(/\d/,''),li:+(k.match(/\d/)||[0])[0],x:500,y:420,stack:[],state:'idle',wait:rnd(.2,1.5),path:[],trail:null,step:0,face:1,n:j};
      if(w.kind==='cook'){w.x=LX(w.li)-52;w.y=524;}else if(w.kind==='cashier'){w.x=915;w.y=716;}else if(w.kind==='hand'){w.x=G.postA.x+40+j*30;w.y=350;}else if(w.kind==='porter'){w.x=780+j*30;w.y=380;}else if(w.kind==='loader'){w.x=720+j*36;w.y=1215;}else if(w.kind==='manager'){w.x=500;w.y=660;}else{w.x=300+j*60;w.y=640;}
      G.workers.push(w);}}}

/* ===== ui ===== */
function toast(msg,t=2.4){const el=$('toast');el.textContent=msg;el.style.opacity=1;G.toastT=t;}
function banner(big,small){const el=$('banner');el.innerHTML=big+(small?'<small>'+small+'</small>':'');el.classList.remove('go');void el.offsetWidth;el.classList.add('go');}
function fmt(n){if(n<0)return'-'+fmt(-n);n=Math.floor(n);if(n>=1e9)return(n/1e9).toFixed(2)+'B';if(n>=1e7)return(n/1e6).toFixed(1)+'M';return n.toLocaleString('en-NG');}
function short(n){if(n>=1e9)return+(n/1e9).toFixed(2)+'B';if(n>=1e6)return+(n/1e6).toFixed(1)+'M';if(n>=1e4)return+(n/1e3).toFixed(0)+'K';return n.toLocaleString('en-NG');}
function clockTxt(){const h=hour(),hh=Math.floor(h),m=Math.floor((h-hh)*60/10)*10;return((hh+11)%12+1)+':'+String(m).padStart(2,'0')+(hh<12?' AM':' PM');}
const setH=(el,h)=>{if(el._h!==h){el._h=h;el.innerHTML=h;}},setT=(el,t)=>{if(el._t!==t){el._t=t;el.textContent=t;}},setW=(el,w)=>{w=Math.round(w)+'%';if(el._w!==w){el._w=w;el.style.width=w;}};
function updateHud(full){setH($('money'),'<b>₦</b>'+fmt(S.money));$('money').classList.toggle('neg',S.money<0);const ev=$('ev');ev.hidden=!S.ev;if(S.ev)setT(ev,evLabel());
  setH($('biz'),B.name+'<small>'+(S.emp.br?rank()+' · ':'')+'Level '+level()+' · Day '+S.day+' · '+(G.closing?'Closed':clockTxt())+'</small>');
  if(full){$('mute').textContent=['🔇','🔉','🔊'][sndLvl()];$('mute').title=['Sound off','Sound, no music','Sound and music'][sndLvl()];}
  const vis=visibleSteps();let best=null;for(const s of vis){const rem=s.cost-(S.pads[s.id]?S.pads[s.id].paid:0);if(!best||rem<best.rem)best={s,rem};}
  const g=$('goal');if(!best){g.hidden=false;const its=empItems().sort((a,b)=>a.cost-b.cost),it=its[0];if(!it){setT($('goalTxt'),'🏆 '+rank()+'! 500 stores worldwide.');setW($('goalBar'),100);return;}
    setT($('goalTxt'),'Tap for HQ: '+it.name+' · ₦'+short(it.cost));setW($('goalBar'),Math.max(0,Math.min(100,100*S.money/it.cost)));g.classList.toggle('ready',S.money>=it.cost);return;}
  g.hidden=false;setT($('goalTxt'),'Next: '+padLabel(best.s)+' · ₦'+short(best.rem));setW($('goalBar'),Math.max(0,Math.min(100,100*S.money/best.rem)));g.classList.toggle('ready',S.money>=best.rem);}

/* ===== input ===== */
cv.addEventListener('pointerdown',e=>{if(!G)return;audio();if(G.night){nightTap();return;}if(G.trip){tripTap();return;}G.input={active:true,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId);}catch(_){}});
cv.addEventListener('pointermove',e=>{if(G&&G.input.active){G.input.x=e.clientX;G.input.y=e.clientY;}});
const endIn=()=>{if(G)G.input.active=false};cv.addEventListener('pointerup',endIn);cv.addEventListener('pointercancel',endIn);
addEventListener('keydown',e=>{if(G&&e.key)G.keys[e.key.toLowerCase()]=true});addEventListener('keyup',e=>{if(G&&e.key)G.keys[e.key.toLowerCase()]=false});addEventListener('blur',()=>{if(G){G.keys={};G.input.active=false;}});

/* ===== fx helpers ===== */
function inRect(x,y,r){return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;}
function pip(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
function fly(type,x0,y0,z0,x1,y1,z1,dur=.35,delay=0,arc=60){if(G.flyers.length<260)G.flyers.push({type,x0,y0,z0,x1,y1,z1,t:-delay,dur,arc});}
function puff(x,y,n=6,col='#fff'){if(G.parts.length>220)return;for(let i=0;i<n;i++)G.parts.push({x,y,vx:rnd(-45,45),vy:rnd(-50,10),r:rnd(4,10),t:0,life:rnd(.5,.8),col});}
function floatTxt(x,y,txt,col='#b9ffcf',size=13){if(G.floats.length<40)G.floats.push({x,y,txt,col,size,t:0});}
function confetti(n=70){const cols=['#ffc23d','#e8501e','#36b36a','#2a9fd6','#fff','#c9367a'];for(let i=0;i<n;i++)G.conf.push({x:rnd(0,W),y:rnd(-H*.3,0),vx:rnd(-60,60),vy:rnd(120,380),r:rnd(4,9),c:cols[i%6],t:0,rot:rnd(0,6)});}

/* ===== rope ===== */
function trailLen(tr){let L=0;for(let i=1;i<tr.pts.length;i++)L+=dist(tr.pts[i-1].x,tr.pts[i-1].y,tr.pts[i].x,tr.pts[i].y);return L;}
function harvest(poly,isPlayer){let n=0;
  for(const c of G.crops){if(c.ready&&lineOpen(c.li)&&pip(c.x,c.y,poly)){c.ready=false;c.t=rnd(2.6,4.6)*(evx('supply_slow')?1.6:1);n++;G.procIn[c.li]++;fly('r'+c.li,c.x,c.y,6,LX(c.li),500,24,rnd(.45,.8),n*.005,90);}}
  if(isPlayer){if(n>0){floatTxt(G.player.x,G.player.y-70,'+'+n+(n>=40?'  CORRECT!':''),'#fff',n>=40?20:15);beep(660,.12,'square',.05,1.5);if(n>=40)puff(G.player.x,G.player.y-30,14,'#ffe9a8');}
    else toast('Nothing inside the circle. Go round the '+(B.field==='campus'?'books and supplies':B.field==='port'?'parcels and boxes':B.field==='yard'?'cartons':B.field==='water'?'fish':B.field==='pasture'?'animals':'crops')+'!',2);}
  return n;}

/* ===== workers ===== */
function moveTo(o,tx,ty,sp,dt){const d=dist(o.x,o.y,tx,ty);if(d<4)return true;const s=Math.min(d,sp*dt);o.x+=(tx-o.x)/d*s;o.y+=(ty-o.y)/d*s;o.face=tx<o.x?-1:1;o.step+=dt*10;return false;}
function updWorker(w,dt){const hm=w.kind==='hand'||w.kind==='porter'?S.emp.haul||0:0,sp=staffSpd()*HSPD[hm],cap=Math.round(staffCap()*HCAP[hm]),f=G.field;
  if(w.kind==='cook'||w.kind==='cashier'){w.step+=dt*(w.kind==='cook'&&G.procIn[w.li]>0?9:0);return;}
  if(w.kind==='manager'){if(w.state==='idle'){w.wait-=dt;if(w.wait<=0){w.tx=rnd(120,860);w.ty=pick([640,660,800,470]);w.state='walk';}}else if(moveTo(w,w.tx,w.ty,sp*.6,dt)){w.state='idle';w.wait=rnd(2,5);}return;}
  if(w.kind==='loader'){const o=G.exp.state==='load'?G.exp.ord:null;
    if(w.state==='idle'){if(o&&o.got<o.need&&G.out[o.li]>0){w.li=o.li;w.state='load';}else moveTo(w,720+w.n*36,1215,sp,dt);}
    else if(w.state==='load'){if(moveTo(w,LX(w.li)+30,604,sp,dt)){w.wait-=dt;if(w.wait<=0&&G.out[w.li]>0&&w.stack.length<cap){G.out[w.li]--;w.stack.push('p'+w.li);w.wait=.02;}if(w.stack.length>=cap||G.out[w.li]===0)w.state=w.stack.length?'drop':'idle';}}
    else{if(moveTo(w,BAY.x+w.n*14,BAY.y,sp,dt)){w.wait-=dt;if(w.wait<=0&&w.stack.length){w.stack.pop();if(o&&o.li===w.li&&o.got<o.need)o.got++;else G.counter[w.li]++;w.wait=.015;}if(!w.stack.length)w.state='idle';}}
    return;}
  if(w.kind==='hand'){
    if(w.state==='idle'){w.wait-=dt;if(w.wait<=0){const ss=G.strips.filter(s=>lineOpen(s.li)&&G.procIn[s.li]<140);if(!ss.length){w.wait=1;return;}const s=ss[Math.floor(Math.random()*ss.length)];
        const cx=Math.max(f.x+150,Math.min(f.x+f.w-150,s.x+s.w/2+rnd(-40,40))),hw=Math.min(s.w/2+40,rnd(110,140)+lvl('rope')*28),top=f.y+rnd(20,70);
        w.path=[{x:cx-hw*.4,y:f.y+f.h-4},{x:cx-hw,y:top+90},{x:cx-hw*.6,y:top},{x:cx+hw*.6,y:top},{x:cx+hw,y:top+90},{x:cx+hw*.4,y:f.y+f.h-4},{x:cx,y:f.y+f.h+30}];w.trail=null;w.state='loop';}}
    else{const p=w.path[0];if(moveTo(w,p.x,p.y,sp,dt))w.path.shift();
      if(inRect(w.x,w.y,f)){if(!w.trail)w.trail={pts:[{x:w.x,y:w.y}]};const l=w.trail.pts[w.trail.pts.length-1];if(dist(l.x,l.y,w.x,w.y)>12)w.trail.pts.push({x:w.x,y:w.y});}
      else if(w.trail&&w.y>f.y+f.h){harvest(w.trail.pts,false);w.trail=null;}
      if(!w.path.length){w.state='idle';w.wait=rnd(.3,.9);}}
    return;}
  if(w.kind==='porter'){
    if(w.state==='idle'){let best=-1,bv=1e9;for(const s of G.stacks){if(lineOpen(s.li)&&G.depot[s.li]>0&&G.procIn[s.li]<bv&&!G.workers.some(o=>o!==w&&o.kind==='porter'&&o.state!=='idle'&&o.li===s.li&&G.D.filter(lineOpen).length>1)){bv=G.procIn[s.li];best=s.li;}}
      if(best>=0&&bv<120){w.li=best;w.state='load';}else moveTo(w,790+w.n*32,385,sp,dt);}
    else if(w.state==='load'){const s=G.stacks.find(s=>s.li===w.li);if(moveTo(w,s.x,s.y+34,sp,dt)){w.wait-=dt;if(w.wait<=0&&G.depot[w.li]>0&&w.stack.length<cap*1.5){G.depot[w.li]--;w.stack.push('r'+w.li);w.wait=.02;}
        if(w.stack.length>=cap*1.5||G.depot[w.li]===0)w.state=w.stack.length?'drop':'idle';}}
    else{if(moveTo(w,LX(w.li)+rnd(-2,2),470,sp,dt)){w.wait-=dt;if(w.wait<=0&&w.stack.length){w.stack.pop();G.procIn[w.li]++;w.wait=.015;}if(!w.stack.length)w.state='idle';}}
    return;}
  if(w.kind==='server'){
    if(w.state==='idle'){let best=-1,bv=3;for(const i of openLines()){const v=G.out[i]-(G.counter[i]>=70?999:0)-(G.workers.some(o=>o!==w&&o.kind==='server'&&o.state!=='idle'&&o.li===i)?14:0);if(v>bv){bv=v;best=i;}}
      if(best>=0){w.li=best;w.state='load';}else moveTo(w,330+w.n*90,650,sp,dt);}
    else if(w.state==='load'){if(moveTo(w,LX(w.li)-30,604,sp,dt)){w.wait-=dt;if(w.wait<=0&&G.out[w.li]>0&&w.stack.length<cap){G.out[w.li]--;w.stack.push('p'+w.li);w.wait=.02;}
        if(w.stack.length>=cap||G.out[w.li]===0)w.state=w.stack.length?'drop':'idle';}}
    else{if(moveTo(w,LX(w.li)-18,712,sp,dt)){w.wait-=dt;if(w.wait<=0&&w.stack.length){w.stack.pop();G.counter[w.li]++;w.wait=.015;}if(!w.stack.length)w.state='idle';}}
  }}

/* ===== sales ===== */
function sale(i,c,q=1){let amt=revenue(i,c&&c.vip)*q;if(B.isNew&&typeof newSale==='function')amt=newSale(i,c,q,amt);S.till+=amt;S.dayEarn+=amt;S.mo.rev+=amt;S.daySold+=q;S.sold+=q;
  const x=c?c.x:rnd(800,945),y=c?c.y:1180;
  if(c){fly('p'+i,LX(i),738,26,c.x,c.y,30,.2,0,24);fly('cash',c.x,c.y,34,915,734,10,.4,.1,50);}
  if(c&&c.vip){floatTxt(x,y-60,'BIG SPENDER +₦'+short(amt),'#ffd659',17);puff(x,y-30,10,'#ffe9a8');beep(988,.2,'square',.05,1.5);}
  else if(G.t-G.acc.fl>.22){G.acc.fl=G.t;floatTxt(x,y-52,'+₦'+short(amt));}
  if(c)tick(820);}
// Lines with a weight (w) get that share of customers; a business can also close a line for now (no free truck).
function pickLine(ol){let t=0;const ws=ol.map(i=>{const v=(B.lines[i].w||1)*(B.isNew&&typeof lineW==='function'?lineW(i):1);t+=v;return v;});if(t<=0)return ol[0];let r=Math.random()*t;for(let k=0;k<ol.length;k++){r-=ws[k];if(r<=0)return ol[k];}return ol[ol.length-1];}
function bump(h,c,w){return Math.exp(-Math.pow((h-c)/w,2));}
function todMult(){const h=hour();let m=.75+.7*bump(h,13,1.2)+.85*bump(h,18.2,1.1);const hl=lvl('house');if(S.clock<[0,30,50,80][hl])m*=[1,1.5,1.75,2][hl];return m;}
function updCustomers(dt){const st=stage(),rate=1*VD[st]*ADM[lvl('ads')]*todMult()*(B.isNew&&typeof newDemand==='function'?newDemand():1)*(evx('demand_up')?1.5:evx('demand_down')?.65:1),ol=openLines();
  if(!G.closing&&G.custs.length<VCAP[st]){G.acc.spawn+=rate*dt;while(G.acc.spawn>=1){G.acc.spawn--;const li=pickLine(ol),pal=CPAL[Math.floor(Math.random()*CPAL.length)];
      G.custs.push({x:rnd(80,720),y:1292,li,st:'in',tx:LX(li)+rnd(-30,30),ty:774+rnd(0,22),pat:rnd(9,13),vip:Math.random()<(evx('vip_day')?.2:.05),q:Math.min(B.lines[li].qx||99,1+Math.floor(Math.random()*QTY[st])),o:{cloth:pal[0],trim:pal[1],hat:pal[2]},step:rnd(0,6),face:1,seat:-1,t:0});}}
  else G.acc.spawn=Math.min(G.acc.spawn,1);
  for(const c of G.custs){
    if(c.st==='in'){if(moveTo(c,c.tx,c.ty,150,dt))c.st='wait';}
    else if(c.st==='wait'){if(G.counter[c.li]>0){const q=Math.min(G.counter[c.li],c.q);G.counter[c.li]-=q;sale(c.li,c,q);c.got=true;let s=-1;for(let k=0;k<G.seats.length;k++)if(!G.seatTaken[k]){s=k;break;}
        if(s>=0){G.seatTaken[s]=c;c.seat=s;c.st='toSeat';}else c.st='out';}
      else{c.pat-=dt;if(c.pat<=0||G.closing){c.angry=true;c.st='out';S.lost=(S.lost||0)+1;}}}
    else if(c.st==='toSeat'){const s=G.seats[c.seat];if(!s){c.st='out';}else if(moveTo(c,s.x,s.y,150,dt)){c.st='eat';c.t=rnd(2.5,4.5);}}
    else if(c.st==='eat'){c.t-=dt;if(c.t<=0){G.seatTaken[c.seat]=null;c.seat=-1;c.st='out';}}
    else if(moveTo(c,c.tx,1300,160,dt))c.dead=true;}
  G.custs=G.custs.filter(c=>!c.dead);
  // indoor diners (abstract) once the building exists
  const cap=INCAP[st];if(cap){let stock=0;for(const i of ol)stock+=G.counter[i];
    if(!G.closing&&stock>0){G.acc.v+=VR[st]*ADM[lvl('ads')]*todMult()*(evx('demand_up')?1.5:evx('demand_down')?.65:1)*dt;while(G.acc.v>=1){G.acc.v--;const li=ol[Math.floor(Math.random()*ol.length)];if(G.counter[li]>0){G.counter[li]--;sale(li,null);}}}
    const tgt=G.closing?0:cap*Math.min(1,.25+.75*Math.min(1,stock/60))*Math.min(1,todMult()/1.4);G.inside+=(tgt-G.inside)*Math.min(1,dt*.4);}
}
const CPAL=[['#f2c230','#1f3f8f','none'],['#c9367a','#ffd659','gele'],['#2b8fd6','#f4f1ea','cap'],['#1f8a4c','#f2d16b','fila'],['#f4f1ea','#e8501e','none'],['#7a1f6a','#f2d16b','gele'],['#e8501e','#1b1f27','none'],['#36b3a8','#f4f1ea','none']];

/* ===== pads ===== */
function buyPad(s){const Lp=S.pads[s.id];Lp.l++;Lp.paid=0;dirty();const[x,y]=padPos(s);puff(x,y,18,'#9dffb8');
  const big=s.base==='venue'||s.base==='line'||s.base==='house'||s.base==='car';fanfare(big);confetti(big?120:50);
  let msg=padLabel(s);
  if(s.base==='venue'){makeSeats();msg=B.venue[s.n]+' is open!';if(s.n===4)msg='You built the '+B.venue[4]+'!';}
  if(s.base==='line')msg=B.lines[s.arg].n+' now on the menu';
  if(s.base==='car')msg='You bought a '+CAR[s.n]+'. Longer opening hours!';
  if(s.base==='house')msg='New home: '+HOUSE[s.n]+'. Better sleep, bigger morning rush.';
  if(s.base==='st')msg=B.lines[s.arg].short+' now sells x'+SM[s.n];
  if(s.base==='tray')msg='Head tray now carries '+trayCap();
  syncStaff();banner('LEVEL '+level(),msg);updateHud();save();}
const staffCount=()=>G.workers.length;

/* ===== main update ===== */
function update(dt){
  G.t+=dt;_fr++;const P=G.player,acc=G.acc,f=G.field;
  if(G.night){updNight(dt);return;}
  audioTick(dt);if(G.trip)updTrip(dt);
  if(!G.closing){S.clock+=dt;if(S.clock>=dayLen()){G.closing=true;G.closeT=0;toast('8 PM. Closing time! Walk to your '+(lvl('car')?CAR[lvl('car')]:'bus stop')+' to go home.',5);beep(330,.4,'sine',.06,.6);}}
  else{G.closeT+=dt;if(G.closeT>35||dist(P.x,P.y,110,1228)<44)return startNight();}
  // movement
  let mx=0,my=0;const I=G.input;
  if(I.active&&!G.trip){const dx=I.x-I.ox,dy=I.y-I.oy,d=Math.hypot(dx,dy);if(d>6){const k=Math.min(1,d/45);mx=dx/d*k;my=dy/d*k;}if(d>70){I.ox=I.x-dx/d*70;I.oy=I.y-dy/d*70;}}
  const K=G.trip?{}:G.keys;if(K.a||K.arrowleft)mx-=1;if(K.d||K.arrowright)mx+=1;if(K.w||K.arrowup)my-=1;if(K.s||K.arrowdown)my+=1;
  const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}
  const inF=inRect(P.x,P.y,f),sp=inF?175:225;
  let nx=Math.max(22,Math.min(978,P.x+mx*sp*dt)),ny=Math.max(34,Math.min(1262,P.y+my*sp*dt));
  if(inRect(nx,ny,f)&&!inF&&P.y>f.y+f.h){
    if(P.stack.length){nx=P.x;ny=P.y;if(G.t-(G.blockT||0)>2.5){G.blockT=G.t;toast('Drop your load first, then enter with empty hands.');}}
    else P.trail={pts:[{x:nx,y:f.y+f.h+6},{x:nx,y:ny}],len:0,strain:0};}
  if(ml>.05){P.step+=dt*12;if(mx)P.face=mx<0?-1:1;}
  P.x=nx;P.y=ny;
  if(P.trail){const tr=P.trail;
    if(inRect(P.x,P.y,f)){const l=tr.pts[tr.pts.length-1];if(dist(l.x,l.y,P.x,P.y)>10){tr.pts.push({x:P.x,y:P.y});tr.len=trailLen(tr);}tr.strain=tr.len/ropeMax();
      if(tr.strain>1){puff(P.x,P.y,14,'#cfe8ff');toast('Rope don cut! Make a smaller circle or buy a longer rope.',3);beep(140,.35,'sawtooth',.06,.4);P.trail=null;}
      else if(tr.strain>.82&&G.t-G.warnT>.6){G.warnT=G.t;beep(220,.12,'sawtooth',.03);}}
    else if(P.y>f.y+f.h){harvest([...tr.pts,{x:P.x,y:P.y}],true);P.trail=null;}
    else P.trail=null;}
  // crops
  for(const c of G.crops){if(!c.ready){c.t-=dt;if(c.t<=0){c.ready=true;if(c.mv)Object.assign(c,newAnimal(c.s));}}
    else if(c.mv){c.ph+=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(Math.random()<dt*.5){c.vx=rnd(-18,18);c.vy=rnd(-18,18);}
      const s=c.s;if(c.x<s.x+12||c.x>s.x+s.w-12)c.vx*=-1;if(c.y<f.y+12||c.y>f.y+f.h-12)c.vy*=-1;c.x=Math.max(s.x+12,Math.min(s.x+s.w-12,c.x));c.y=Math.max(f.y+12,Math.min(f.y+f.h-12,c.y));}}
  // delivery van
  if(G.D.length){const T=G.truck,tl=lvl('truck');
    if(T.state==='wait'){T.t-=dt;if(T.t<=0&&G.D.some(lineOpen)){T.state='in';T.y=-140;}}
    else if(T.state==='in'){T.y+=210*dt;if(T.y>=205){T.y=205;T.state='unload';T.t=1.6;}}
    else if(T.state==='unload'){T.t-=dt;if(T.t<=0){const load=[30,60,120][tl],cap=[60,120,240][tl];for(const s of G.stacks)if(lineOpen(s.li)){const add=Math.min(load,cap-G.depot[s.li]);G.depot[s.li]+=add;for(let k=0;k<Math.min(add,6);k++)fly('r'+s.li,850,205,20,s.x,s.y,10,.4,k*.06,50);}
        T.state='out';beep(180,.2,'square',.04);}}
    else{T.y-=230*dt;if(T.y<-150){T.state='wait';T.t=[20,15,10][tl]*(evx('supply_slow')?1.6:1);}}}
  // stations
  for(const i of openLines()){if(G.procIn[i]>0&&G.out[i]<80){G.procT[i]+=dt;const per=lvl('cook'+i)?[.1,.07,.045][lvl('train')]/(S.emp.mgr?1.2:1):.36;
      while(G.procT[i]>=per&&G.procIn[i]>0&&G.out[i]<80){G.procT[i]-=per;G.procIn[i]--;G.out[i]++;fly('p'+i,LX(i),500,30,LX(i)-21+((G.out[i]-1)/10|0)%4*14,592,6+((G.out[i]-1)%10)*5,.4,0,60);}}
    else G.procT[i]=0;}
  updCustomers(dt);
  for(const w of G.workers)updWorker(w,dt);
  updMachines(dt);updExport(dt);updChatter(dt);
  if(lvl('cashier')&&S.till>0){const t=Math.max(1,Math.ceil(S.till*Math.min(1,dt*3)));S.till-=t;S.money+=t;}
  // player zones
  let did=false;const top=P.stack[P.stack.length-1];
  for(const i of openLines()){
    if(!did&&G.out[i]>0&&P.stack.length<trayCap()&&(!top||top==='p'+i)&&dist(P.x,P.y,LX(i),592)<36){did=true;acc.pick+=dt;while(acc.pick>.035&&G.out[i]>0&&P.stack.length<trayCap()){acc.pick-=.035;G.out[i]--;P.stack.push('p'+i);tick(500+P.stack.length*10);}}
    if(!did&&top==='p'+i&&dist(P.x,P.y,LX(i),716)<40){did=true;acc.pick+=dt;while(acc.pick>.03&&P.stack.length){acc.pick-=.03;P.stack.pop();G.counter[i]++;tick(380+P.stack.length*8);}}
    if(!did&&top==='r'+i&&dist(P.x,P.y,LX(i),468)<36){did=true;acc.pick+=dt;while(acc.pick>.03&&P.stack.length){acc.pick-=.03;P.stack.pop();G.procIn[i]++;tick(300+P.stack.length*8);}}}
  for(const s of G.stacks){if(!did&&lineOpen(s.li)&&G.depot[s.li]>0&&P.stack.length<trayCap()&&(!top||top==='r'+s.li)&&dist(P.x,P.y,s.x,s.y+26)<34){did=true;acc.pick+=dt;while(acc.pick>.035&&G.depot[s.li]>0&&P.stack.length<trayCap()){acc.pick-=.035;G.depot[s.li]--;P.stack.push('r'+s.li);tick(450+P.stack.length*10);}}}
  {const o=G.exp.state==='load'?G.exp.ord:null;if(!did&&o&&top==='p'+o.li&&o.got<o.need&&dist(P.x,P.y,BAY.x,BAY.y)<52){did=true;acc.pick+=dt;while(acc.pick>.025&&P.stack.length&&o.got<o.need){acc.pick-=.025;P.stack.pop();o.got++;tick(420+P.stack.length*8);}}}
  if(!did)acc.pick=0;
  if(S.till>0&&!lvl('cashier')&&dist(P.x,P.y,915,690)<48){const t=Math.max(1,Math.ceil(S.till*Math.min(1,dt*5)));S.till-=t;S.money+=t;acc.cash+=dt;if(acc.cash>.05){acc.cash=0;fly('cash',915,724,10,P.x,P.y,30,.2,0,40);tick(900);}}
  // pads
  let onPad=null;for(const s of visibleSteps()){const[x,y]=padPos(s);if(dist(P.x,P.y,x,y)<30){onPad=s;break;}}
  G.onPad=onPad;
  const gate=onPad&&typeof stepGate==='function'?stepGate(onPad):null;if(gate){if(!(G.gateT>0)){toast(gate,3);G.gateT=3.2;}}
  else if(onPad&&S.money>0){const Lp=(S.pads[onPad.id]=S.pads[onPad.id]||{l:0,paid:0});const pay=Math.min(Math.max(1,Math.ceil(onPad.cost*dt*.9)),S.money,onPad.cost-Lp.paid);S.money-=pay;S.spent=(S.spent||0)+pay;Lp.paid+=pay;
    acc.payFly+=dt;if(acc.payFly>.06){acc.payFly=0;const[x,y]=padPos(onPad);fly('cash',P.x,P.y,40,x,y,4,.25,0,40);tick(700);}
    if(Lp.paid>=onPad.cost)buyPad(onPad);}
  // street traffic
  if(Math.random()<dt*.35&&G.cars.length<5){const r=Math.random()<.5;G.cars.push({x:r?-80:WW+80,y:r?1318:1372,v:r?rnd(120,190):-rnd(120,190),k:Math.random()<.6?'danfo':Math.random()<.5?'keke':'car',c:['#c62828','#2a62c9','#f4f1ea','#1b1f27'][Math.floor(Math.random()*4)]});}
  for(const c of G.cars)c.x+=c.v*dt;G.cars=G.cars.filter(c=>c.x>-120&&c.x<WW+120);
  // camera
  {const hw=W/2/SCALE,hh=H/2/SCALE;const tx=hw*2>=WW?WW/2:Math.max(hw,Math.min(WW-hw,P.x)),ty=Math.max(hh-125,Math.min(WH-hh,P.y-20));G.cam.x+=(tx-G.cam.x)*Math.min(1,dt*5);G.cam.y+=(ty-G.cam.y)*Math.min(1,dt*5);}
  // fx
  for(const fl of G.flyers)fl.t+=dt;G.flyers=G.flyers.filter(fl=>fl.t<fl.dur);
  for(const p of G.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;}G.parts=G.parts.filter(p=>p.t<p.life);
  for(const p of G.floats){p.t+=dt;p.y-=26*dt;}G.floats=G.floats.filter(p=>p.t<1.1);
  for(const p of G.conf){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*6;}G.conf=G.conf.filter(p=>p.y<H+20&&p.t<4);
  if(G.gateT>0)G.gateT-=dt;
  if(G.toastT>0){G.toastT-=dt;if(G.toastT<=0)$('toast').style.opacity=0;}
  acc.hud+=dt;if(acc.hud>.2){acc.hud=0;updateHud();}
  acc.save+=dt;if(acc.save>4){acc.save=0;save();}
}

/* ===== bot/guide target ===== */
function target(){const P=G.player;if(P.trail)return null;
  if(G.closing)return{x:110,y:1228};
  const top=P.stack[P.stack.length-1];
  if(top){const i=+top[1],o=G.exp.state==='load'?G.exp.ord:null;if(o&&top==='p'+o.li&&o.got<o.need)return BAY;return top[0]==='p'?{x:LX(i),y:716}:{x:LX(i),y:468};}
  if(S.till>=B.lines[0].price*6&&!lvl('cashier'))return{x:915,y:690};
  let best=null,bd=1e9;for(const s of visibleSteps()){const Lp=S.pads[s.id]||{paid:0};if(S.money>=s.cost-Lp.paid){const[x,y]=padPos(s),d=dist(P.x,P.y,x,y);if(d<bd){bd=d;best={x,y};}}}
  if(best)return best;
  const srv=lvl('server');let bi=-1,bv=srv?45:4;for(const i of openLines())if(G.out[i]>bv&&G.counter[i]<60){bv=G.out[i];bi=i;}
  if(bi>=0)return{x:LX(bi),y:592};
  if(!lvl('porter'))for(const s of G.stacks)if(lineOpen(s.li)&&G.depot[s.li]>5&&G.procIn[s.li]<6&&G.out[s.li]<20)return{x:s.x,y:s.y+26,depot:1};
  if(G.F.some(i=>lineOpen(i)&&G.procIn[i]<10&&G.out[i]<30)){const s0=G.strips.find(s=>lineOpen(s.li)&&G.procIn[s.li]<10&&G.out[s.li]<30)||G.strips[0];return{x:s0.x+Math.min(60,s0.w/3),y:G.field.y+G.field.h-12,field:1,strip:s0};}
  return null;}
