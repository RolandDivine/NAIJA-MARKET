// Smoke test for one business plug-in.  node tools/testbiz.js <built.html> <key> <outdir>
// 1) opens the menu and the business, 2) plays 20 s at speed 40 with every step bought, 3) runs 125 nights with
// simulated sales, 4) opens HQ and taps every button, 5) saves screenshots, 6) prints state and any page errors.
const {chromium,devices}=require('playwright');const path=require('path'),fs=require('fs');
const [html,key,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['Pixel 5']});const p=await c.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
await p.route('**/fonts.g*/**',r=>r.abort());await p.goto('file://'+path.resolve(html));await p.waitForTimeout(600);
await p.screenshot({path:out+'/0menu.png'});
const card=await p.$('.card[data-biz="'+key+'"]');if(!card){console.log('NO CARD for',key);await b.close();return;}
const locked=await p.evaluate(k=>{const X=__nm&&null;return document.querySelector('.card[data-biz="'+k+'"]').classList.contains('locked');},key);
if(locked){console.log('card is locked (expected for council); unlocking for the test');await p.evaluate(()=>{const N=__nm;N.SAVE.biz.tunde={money:0,pads:{},day:1,clock:0,till:0,dayEarn:0,daySold:0,sold:0};});}
await p.evaluate(k=>__nm.enter(k),key);await p.waitForTimeout(800);await p.screenshot({path:out+'/1start.png'});
// fresh: a little play
await p.evaluate(()=>{__nm.G.speed=20;});await p.waitForTimeout(4000);
// all steps bought
await p.evaluate(k=>{const N=__nm;for(const s of N.PROG)N.S.pads[s.id]={l:s.n,paid:0};N.S.money=5e10;N.save();N.enter(k);N.G.speed=40;},key);await p.waitForTimeout(15000);
await p.evaluate(()=>{__nm.G.speed=1;});await p.waitForTimeout(500);await p.screenshot({path:out+'/2full.png'});
const log=[];
for(let d=0;d<125;d++){const r=await p.evaluate(()=>{const N=__nm,S=N.S;for(let k=0;k<10;k++){const i=Math.floor(Math.random()*5);if(N.lineW(i)>0){const amt=N.newSale(i,null,1,N.revenue(i,false));S.money+=amt;S.mo.rev+=amt;}}
  N.startNight();for(let k=0;k<14&&N.G.night;k++)N.nightNext();return{d:S.day,money:Math.round(S.money)};});if(r.d%25===0)log.push(JSON.stringify(r));}
console.log(log.join('\n'));
await p.evaluate(()=>__nm.hqOpen());await p.waitForTimeout(400);await p.screenshot({path:out+'/3hq.png'});
const n=await p.evaluate(()=>document.querySelectorAll('#hqin button').length);let taps=0;
for(let i=0;i<n&&i<80;i++){await p.evaluate(i=>{const bs=[...document.querySelectorAll('#hqin button')].filter(b=>!/Back|hqx/.test(b.id+b.textContent));const b=bs[i];if(b){b.scrollIntoView();b.click();}},i);taps++;await p.waitForTimeout(60);
  await p.evaluate(()=>{if(document.getElementById('hqp').hidden)__nm.hqOpen();});}
await p.screenshot({path:out+'/4hq-after.png',fullPage:true});
const txt=await p.evaluate(()=>document.getElementById('hqin').innerText.slice(0,3000));fs.writeFileSync(out+'/hq.txt',txt);
console.log('taps',taps,'S.'+key+' state:',JSON.stringify(await p.evaluate(k=>{const S=__nm.S;const o={};for(const x in S)if(!['pads','mo','stat','emp','ev'].includes(x)&&typeof S[x]==='object'&&S[x]&&!Array.isArray(S[x]))o[x]=S[x];return o;},key)).slice(0,1500));
console.log('errors',JSON.stringify(errs.slice(0,10)));await b.close();})();
