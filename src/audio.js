/* ===== audio: louder effects, market ambience, radio music, night sounds ===== */
let AC=null,MG=null,MUS=null,AMB=null,NB=null,lastBeep=0,musT=0,musStep=0,musKind=null,hornT=6;
const sndLvl=()=>SAVE.snd==null?2:SAVE.snd,quiet=()=>!G||G.speed>1||!sndLvl();
function audio(){if(AC||quiet())return AC;try{AC=new(window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.connect(AC.destination);
    MG=AC.createGain();MG.gain.value=1;MG.connect(comp);MUS=AC.createGain();MUS.gain.value=0;MUS.connect(MG);AMB=AC.createGain();AMB.gain.value=0;AMB.connect(MG);
    NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){b=(b+.04*(Math.random()*2-1))/1.04;d[i]=b*9+(Math.random()*2-1)*.25;}
    const mk=(type,f,q,v)=>{const s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=AC.createGain();g.gain.value=v;s.connect(fl).connect(g).connect(AMB);s.start();};
    mk('bandpass',520,.7,.55);mk('bandpass',1150,1.1,.22);mk('lowpass',140,.5,.5);setInterval(musTick,90);}catch(e){AC=null;}return AC;}
function beep(f,d=.06,type='square',v=.05,slide=0,dest){if(quiet()||!audio())return;try{if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t+d);
    g.gain.value=Math.min(.5,v*3.4);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(dest||MG);o.start();o.stop(t+d);}catch(e){}}
function tick(f){if(G.t-lastBeep>.05){lastBeep=G.t;beep(f,.05,'triangle',.04);}}
function fanfare(big){(big?[392,523,659,784,1046,1318]:[523,659,784,1046]).forEach((f,i)=>setTimeout(()=>beep(f,.18,'square',.06),i*85));}
function horn(){if(quiet()||!audio())return;const f=pick([[392,494],[330,415],[440,554]]);for(let k=0;k<2;k++)setTimeout(()=>{beep(f[0],.22,'square',.03,0,AMB);beep(f[1],.22,'sawtooth',.02,0,AMB);},k*300);}
function babble(){if(quiet())return;const n=4+Math.floor(Math.random()*4),b=rnd(260,420);for(let i=0;i<n;i++)setTimeout(()=>beep(b*rnd(.8,1.5),.07,'triangle',.035,rnd(.85,1.2)),i*75);}
function noiseHit(t,dur,hp,v,dest){const s=AC.createBufferSource();s.buffer=NB;const fl=AC.createBiquadFilter();fl.type='highpass';fl.frequency.value=hp;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(dest||MUS);s.start(t,Math.random());s.stop(t+dur+.02);}
function water(dur){if(quiet()||!audio())return;const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type='highpass';fl.frequency.value=2200;const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2,t+.4);g.gain.setValueAtTime(.2,t+dur-.5);g.gain.linearRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(MG);s.start(t);s.stop(t+dur+.05);}
function crow(){[[620,1.25,.16],[780,1.15,.14],[900,.75,.5]].forEach((n,i)=>setTimeout(()=>beep(n[0],n[2],'sawtooth',.05,n[1]),i*190));}
function cricket(){for(let i=0;i<3;i++)setTimeout(()=>beep(4300,.035,'sine',.012),i*70);}
const _=null,HZ=m=>440*Math.pow(2,(m-69)/12);
const MUSIC={day:{bpm:104,root:57,bass:[0,_,_,0,_,_,7,_,5,_,_,5,_,3,_,_],mel:[12,_,15,_,17,_,15,12,_,10,_,12,_,_,7,_,12,_,15,_,19,_,17,15,_,12,_,10,_,_,12,_]},
  radio:{bpm:114,root:60,bass:[0,_,0,_,_,3,_,_,5,_,5,_,_,7,_,_],mel:[7,_,10,12,_,10,_,7,_,5,_,7,_,_,3,_,7,_,10,12,_,15,_,12,_,10,_,7,_,5,_,_]}};
function tone(t,m,dur,type,v,lp){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=HZ(m);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  if(lp){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl).connect(g);}else o.connect(g);g.connect(MUS);o.start(t);o.stop(t+dur+.02);}
function musTick(){if(!AC||!musKind||sndLvl()<2||quiet()||document.hidden)return;const M=MUSIC[musKind],sd=60/M.bpm/4;if(musT<AC.currentTime)musT=AC.currentTime+.05;
  while(musT<AC.currentTime+.25){const s=musStep%32,b=s%16;
    if(b===0||b===6||b===10||(b===3&&s>15)){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(130,musT);o.frequency.exponentialRampToValueAtTime(45,musT+.12);g.gain.setValueAtTime(.7,musT);g.gain.exponentialRampToValueAtTime(.0001,musT+.16);o.connect(g).connect(MUS);o.start(musT);o.stop(musT+.18);}
    if(b===0||b===3||b===6||b===10||b===12)tone(musT,96,.04,'triangle',.22);
    noiseHit(musT,.04,6000,b%4===2?.22:.1);
    if(M.bass[b]!=null)tone(musT,M.root-24+M.bass[b],sd*1.9,'triangle',.5);
    if(M.mel[s]!=null)tone(musT,M.root+M.mel[s],sd*1.6,'square',.15,1700);
    musT+=sd;musStep++;}}
document.addEventListener('visibilitychange',()=>{if(!AC)return;try{if(document.hidden)AC.suspend();else if(sndLvl())AC.resume();}catch(e){}});
function audioTick(dt){if(!AC||quiet()){if(AC&&MG)MG.gain.value=sndLvl()&&G&&G.speed<=1?1:0;return;}MG.gain.value=1;const N=G.night,t=AC.currentTime;let amb=0,mus=0,kind=null;
  if(!$('pick').hidden){amb=0;}
  else if(N){if(N.st==='drive'){amb=.55;mus=.42;kind='radio';hornT-=dt;if(hornT<=0){hornT=rnd(1.5,3.5);horn();}}
    else if(N.st==='sleep'||N.st==='stmt'){hornT-=dt;if(hornT<=0){hornT=rnd(.5,1.3);cricket();}}}
  else{amb=G.closing?.12:.2+.3*Math.min(1,G.custs.length/30);mus=.2;kind='day';hornT-=dt;if(hornT<=0){hornT=rnd(7,16);horn();}}
  if(kind!==musKind){musKind=kind;musStep=0;}
  AMB.gain.setTargetAtTime(amb,t,.4);MUS.gain.setTargetAtTime(sndLvl()>1?mus:0,t,.3);}
