/* ===== audio: effects, recorded market ambience and music (audio/*.mp3), night sounds ===== */
let AC=null,MG=null,AMB=null,NB=null,lastBeep=0,hornT=6;
const sndLvl=()=>SAVE.snd==null?2:SAVE.snd,quiet=()=>!G||G.speed>1||!sndLvl();
// Recorded tracks live next to the page in audio/. They loop, and audioTick() fades them for day, traffic, travel and night.
const ABASE=(()=>{let b=location.pathname;if(!/\/$/.test(b))b=/\.html?$/i.test(b)?b.replace(/[^/]*$/,''):b+'/';return b+'audio/';})(),TRK={};
for(const k of['market','music']){try{const a=new Audio(ABASE+k+'.mp3');a.loop=true;a.preload='auto';a.volume=0;TRK[k]=a;}catch(e){}}
function setTrack(k,v){const a=TRK[k];if(!a)return;v=Math.max(0,Math.min(1,v));if(v<=.01){if(!a.paused)a.pause();try{a.volume=0;}catch(e){}return;}try{a.volume=Math.max(0,Math.min(1,a.volume+(v-a.volume)*.08));}catch(e){}if(a.paused){const p=a.play();if(p&&p.catch)p.catch(()=>{});}}
function audio(){if(AC||quiet())return AC;try{AC=new(window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.connect(AC.destination);
    MG=AC.createGain();MG.gain.value=1;MG.connect(comp);AMB=AC.createGain();AMB.gain.value=0;AMB.connect(MG);
    NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){b=(b+.04*(Math.random()*2-1))/1.04;d[i]=b*9+(Math.random()*2-1)*.25;}
  }catch(e){AC=null;}return AC;}
function beep(f,d=.06,type='square',v=.05,slide=0,dest){if(quiet()||!audio())return;try{if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t+d);
    g.gain.value=Math.min(.5,v*3.4);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(dest||MG);o.start();o.stop(t+d);}catch(e){}}
function tick(f){if(G.t-lastBeep>.05){lastBeep=G.t;beep(f,.05,'triangle',.04);}}
function fanfare(big){(big?[392,523,659,784,1046,1318]:[523,659,784,1046]).forEach((f,i)=>setTimeout(()=>beep(f,.18,'square',.06),i*85));}
function horn(){if(quiet()||!audio())return;const f=pick([[392,494],[330,415],[440,554]]);for(let k=0;k<2;k++)setTimeout(()=>{beep(f[0],.22,'triangle',.022,0,AMB);beep(f[1],.22,'triangle',.016,0,AMB);},k*300);}
function babble(){if(quiet())return;const n=4+Math.floor(Math.random()*4),b=rnd(260,420);for(let i=0;i<n;i++)setTimeout(()=>beep(b*rnd(.8,1.5),.07,'triangle',.035,rnd(.85,1.2)),i*75);}
function noiseHit(t,dur,hp,v,dest){const s=AC.createBufferSource();s.buffer=NB;const fl=AC.createBiquadFilter();fl.type='highpass';fl.frequency.value=hp;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(dest||MG);s.start(t,Math.random());s.stop(t+dur+.02);}
function water(dur){if(quiet()||!audio())return;const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;s.loop=true;const fl=AC.createBiquadFilter();fl.type='highpass';fl.frequency.value=2200;const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2,t+.4);g.gain.setValueAtTime(.2,t+dur-.5);g.gain.linearRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(MG);s.start(t);s.stop(t+dur+.05);}
function crow(){[[620,1.25,.16],[780,1.15,.14],[900,.75,.5]].forEach((n,i)=>setTimeout(()=>beep(n[0],n[2],'sawtooth',.05,n[1]),i*190));}
function cricket(){for(let i=0;i<3;i++)setTimeout(()=>beep(4300,.035,'sine',.012),i*70);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){setTrack('market',0);setTrack('music',0);}if(!AC)return;try{if(document.hidden)AC.suspend();else if(sndLvl())AC.resume();}catch(e){}});
function audioTick(dt){if(!AC||quiet()||document.hidden){setTrack('market',0);setTrack('music',0);if(AC&&MG)MG.gain.value=sndLvl()&&G&&G.speed<=1?1:0;return;}MG.gain.value=1;const N=G.night,X=G.trip;let amb=0,mus=0,mk=0;
  if(!$('pick').hidden){}
  else if(N){if(N.st==='drive'){mus=.6;mk=.22;amb=.5;hornT-=dt;if(hornT<=0){hornT=rnd(2.5,5);horn();}}
    else if(N.st==='sleep'||N.st==='stmt'){hornT-=dt;if(hornT<=0){hornT=rnd(.5,1.3);cricket();}}else if(N.st==='morning')mk=.2;}
  else if(X&&X.st!=='tour'){mus=.55;if(X.st==='car')mk=.2;}
  else{mk=G.closing?.2:.45+.4*Math.min(1,G.custs.length/30);mus=.22;}
  setTrack('market',mk);setTrack('music',sndLvl()>1?mus:0);AMB.gain.setTargetAtTime(amb,AC.currentTime,.4);}
