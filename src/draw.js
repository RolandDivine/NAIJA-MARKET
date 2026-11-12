/* ===== sprites: every good is drawn once to a small canvas, then stamped ===== */
function E(g,x,y,rx,ry,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,6.2832);g.fill();}
function R(g,x,y,w,h,r,col){g.fillStyle=col;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
const HI='rgba(255,255,255,.35)',LO='rgba(0,0,0,.18)';
function drawKind(g,d){const[k,a,b,c,m]=d;switch(k){
  case'plate':E(g,0,-3,12,4.6,'#d9d2c2');E(g,0,-4,12,4.6,'#fff');
    if(b){E(g,4.5,-6.5,5.5,3.2,b);E(g,-3.5,-7.5,5.6,4.2,a);E(g,-5,-9,2,1.2,HI);if(c)c.forEach((s,i)=>E(g,3+i*2.4,-7.2+i*.8,1.5,1,s));}
    else{E(g,0,-7,8,4,a);E(g,-2,-8.6,3,1.3,HI);if(c)c.forEach((s,i)=>{E(g,-4.5+i*3.2,-6.4-(i%2)*1.8,1.25,.95,s);E(g,3.6-i*2.6,-8.4+(i%2)*1.6,1.1,.85,s);});}
    if(m){R(g,b?-1.5:2,-12.5,6,4,1.6,m);R(g,b?-1:2.5,-12.3,3,1.2,.6,HI);}break;
  case'round':E(g,0,-6.5,7,6.5,a);E(g,-2.2,-8.8,2.4,1.6,HI);R(g,-1,-14.5,2,3,0,b||'#3aa336');E(g,0,-13,4,1.5,b||'#3aa336');break;
  case'chili':g.save();g.rotate(-.3);R(g,-10,-9,19,7,3.5,a);E(g,7,-5.5,4,2.4,a);R(g,-8,-8.4,10,1.6,.8,HI);R(g,-13,-7.5,4,2.4,1,'#3aa336');g.restore();break;
  case'tuber':g.save();g.rotate(-.22);R(g,-11,-10,22,9,4.5,a);R(g,-9,-9.2,17,2.6,1.3,HI);R(g,9.6,-9,1.6,7,.5,'#f1e2c0');g.restore();break;
  case'bundle':g.save();g.rotate(-.12);R(g,-11,-9,22,7,3.5,a);R(g,-10,-15,20,7,3.5,a);R(g,-8,-14.2,14,2,1,HI);g.restore();R(g,-2,-17,4,17,1,b);break;
  case'leafy':E(g,-5,-9,4,7,a);E(g,5,-9,4,7,a);E(g,0,-11,4.5,8,a);E(g,0,-12,1,6,'rgba(255,255,255,.25)');R(g,-1.5,-4,3,4,1,'#2c6e2a');if(b)R(g,-4,-5,8,2.4,1,b);break;
  case'long':g.save();g.rotate(-.18);R(g,-11,-9,22,6.4,3.2,a);R(g,-8,-8.4,13,1.6,.8,HI);E(g,-11,-5.8,1.6,2,b);E(g,11,-5.8,1.4,1.8,b);g.restore();break;
  case'plant':E(g,0,-5,9.5,6,'#3f8a2a');E(g,-3,-7,4,3,'#57a83a');[[-5,-5],[1,-9],[5,-5],[-1,-4]].forEach(p=>E(g,p[0],p[1],2.1,2.1,a));break;
  case'sack':R(g,-8.5,-15,17,15,4.5,a);R(g,-8.5,-10,17,3.4,0,b);R(g,-6,-14,5,2,1,HI);E(g,0,-16,3.4,2,a);R(g,-2.4,-16.6,4.8,1.4,.7,LO);break;
  case'carton':R(g,-10.5,-14,21,14,1.5,a);R(g,-10.5,-9,21,3.4,0,b);R(g,-10.5,-14,21,2.2,1,LO);R(g,-.6,-14,1.2,5,0,LO);break;
  case'bottle':R(g,-4.2,-15,8.4,15,3,a);R(g,-2.2,-20,4.4,6,1.2,a);R(g,-2.6,-21.5,5.2,2.6,1,b||'#fff');R(g,-4.2,-10.5,8.4,4.4,0,'rgba(255,255,255,.8)');R(g,-3,-14,1.4,10,.7,HI);break;
  case'fish':E(g,-1.5,-6.5,9.5,4.8,a);E(g,-1.5,-4.8,7.5,2.3,b);g.fillStyle=a;g.beginPath();g.moveTo(7,-6.5);g.lineTo(12.5,-11);g.lineTo(12.5,-2);g.closePath();g.fill();E(g,-7,-7.5,1.2,1.2,'#111');E(g,-3,-8.6,4,1,HI);break;
  case'skewer':g.strokeStyle='#d6c08a';g.lineWidth=1.5;g.beginPath();g.moveTo(-13,-4);g.lineTo(13,-10);g.stroke();for(let i=-8;i<9;i+=5.4){E(g,i,-7-i*.23,3.4,2.8,a);E(g,i-.8,-8-i*.23,1.3,.8,b);}break;
  case'ball':[[-5.5,-5],[5.5,-5],[0,-11]].forEach(p=>{E(g,p[0],p[1],5.6,5.2,a);E(g,p[0]-1.6,p[1]-1.8,2,1.3,b);});break;
  case'wrap':E(g,0,-6.5,10.5,6.2,a);R(g,-10,-8,20,2.6,1,b);E(g,-3,-9.6,4,1.3,HI);break;
  case'strip':g.save();g.rotate(-.2);for(let i=0;i<3;i++){R(g,-11+i*2,-6-i*4.6,20,3.6,1,a);R(g,-9+i*2,-5.6-i*4.6,12,1,.5,b);}g.restore();break;
  case'cloth':R(g,-11.5,-10,23,10,2,a);for(let i=0;i<4;i++)E(g,-8+i*5.4,-5,1.6,1.6,b);R(g,-11.5,-14,23,5,2,b);R(g,-11.5,-10.4,23,1,0,LO);for(let i=0;i<4;i++)E(g,-8+i*5.4,-11.6,1,1,a);break;
  case'basket':g.fillStyle='#c9a15a';g.beginPath();g.moveTo(-10,-9);g.lineTo(10,-9);g.lineTo(7.5,0);g.lineTo(-7.5,0);g.closePath();g.fill();g.strokeStyle='#8a6a2e';g.lineWidth=.8;for(let i=-6;i<8;i+=4){g.beginPath();g.moveTo(i*1.2,-9);g.lineTo(i,0);g.stroke();}
    E(g,0,-10,10,4.6,a);[[-5,-11.5],[1,-13],[5.5,-11]].forEach(p=>{E(g,p[0],p[1],3.4,3,a);E(g,p[0]-1,p[1]-1,1.2,.8,HI);});break;
  case'pack':R(g,-7.5,-15,15,15,2,a);R(g,-7.5,-10,15,4.4,0,b);R(g,-7.5,-15,15,1.8,1,LO);R(g,-5.5,-13.4,3,1.4,.6,HI);break;
  case'tin':R(g,-6.5,-14,13,14,2,a);E(g,0,-14,6.5,2.2,'#d9d9d9');R(g,-6.5,-10,13,5,0,b);R(g,-5,-13,1.6,11,.8,HI);break;
  case'gadget':if(a==='charger'){R(g,-6,-12,12,12,2.4,b);R(g,-3.4,-16,1.8,4.4,.5,'#9aa0a6');R(g,1.6,-16,1.8,4.4,.5,'#9aa0a6');E(g,0,-6,2.2,2.2,c);g.strokeStyle=c;g.lineWidth=1.4;g.beginPath();g.moveTo(6,-3);g.quadraticCurveTo(13,-2,10,-10);g.stroke();}
    else if(a==='ear'){g.strokeStyle=c;g.lineWidth=1.3;g.beginPath();g.moveTo(-6,-12);g.quadraticCurveTo(-7,-3,0,-3);g.quadraticCurveTo(7,-3,6,-12);g.moveTo(0,-3);g.lineTo(0,0);g.stroke();E(g,-6,-13,3.4,3.4,b);E(g,6,-13,3.4,3.4,b);E(g,-6,-13,1.4,1.4,c);E(g,6,-13,1.4,1.4,c);}
    else if(a==='case'){R(g,-6.5,-18,13,18,3.2,b);R(g,-4.6,-16.4,5,5,1.6,LO);E(g,-2.1,-13.9,1.5,1.5,c);R(g,-5.4,-9,1.6,7,.8,HI);}
    else if(a==='bank'){R(g,-11,-10,22,10,3,b);for(let i=0;i<4;i++)E(g,-6+i*3.2,-5,1,1,c);R(g,-9,-9,12,1.4,.7,HI);}
    else{R(g,-6.5,-18,13,18,2.6,b);R(g,-5.3,-16.4,10.6,13.6,1.4,c);R(g,-4.4,-15.6,3,10,1,HI);E(g,0,-1.4,1,1,'#555');}break;
  case'cow':R(g,-11,-15,19,10.5,5,'#f2ece0');E(g,-5,-11,3,2.4,'#6e4a2c');E(g,3.5,-13,2.5,2,'#6e4a2c');R(g,6,-18,8,8,3,'#f2ece0');E(g,12,-13,2.2,2,'#e6b3a3');g.strokeStyle='#efe0b8';g.lineWidth=1.5;g.beginPath();g.moveTo(7,-18);g.lineTo(4.5,-21.5);g.moveTo(13,-18);g.lineTo(15.5,-21.5);g.stroke();R(g,-9,-5,2.2,5,.5,'#5a3a22');R(g,4,-5,2.2,5,.5,'#5a3a22');break;
  case'chicken':E(g,-1,-7,7.5,6,'#fff');E(g,-6,-10,3.6,3,'#f1ece0');E(g,5,-13,3.6,3.6,'#fff');R(g,4,-18,3,3,1.2,'#d62828');g.fillStyle='#f2a01e';g.beginPath();g.moveTo(8.4,-13.6);g.lineTo(12,-12.6);g.lineTo(8.4,-11.6);g.fill();E(g,6,-13.6,.8,.8,'#111');R(g,-2,-2,1.2,2.4,0,'#f2a01e');R(g,1.4,-2,1.2,2.4,0,'#f2a01e');break;
  case'goat':R(g,-10,-13,17,9,4,'#8a6a4a');R(g,-10,-13,7,9,4,'#3a2a1e');R(g,5,-17,7,7,2.6,'#8a6a4a');g.strokeStyle='#d9c9a0';g.lineWidth=1.3;g.beginPath();g.moveTo(7,-17);g.lineTo(4,-21);g.moveTo(10,-17);g.lineTo(9,-21.5);g.stroke();R(g,9.6,-11,1.4,3.6,.6,'#d9d2c2');R(g,-8,-5,2,5,.5,'#2a1e16');R(g,3.6,-5,2,5,.5,'#2a1e16');break;
  case'fishlive':E(g,0,-6,8.5,3.6,a);E(g,-1,-7,5,1.2,HI);g.fillStyle=a;g.beginPath();g.moveTo(-7,-6);g.lineTo(-12.5,-9.6);g.lineTo(-12.5,-2.4);g.closePath();g.fill();E(g,5.4,-6.6,.9,.9,'#111');break;
  case'box40':R(g,-13,-13,26,13,1,a);for(let i=-10;i<12;i+=3.2)R(g,i,-12,1.1,11,0,b);R(g,-13,-13,26,1.8,.6,HI);R(g,-13,-1.6,26,1.6,0,LO);R(g,9,-11,2.6,9,.5,'rgba(255,255,255,.35)');break;
  case'doc':R(g,-8,-17,16,17,1.5,a);R(g,-8,-17,16,4,1,b);for(let i=0;i<4;i++)R(g,-5.5,-10+i*2.6,11-(i%2)*4,1,0,'#9aa0a6');E(g,4,-3.6,3,3,'rgba(198,40,40,.75)');break;
  case'cash':R(g,-9.5,-6,19,6,1,'#0e7a3c');R(g,-9.5,-7,19,2.2,1,'#36b36a');E(g,0,-4,2.6,1.4,'#b7f5c8');break;
}}
const SPR={};
function sprite(def){const key=def.join('|');let c=SPR[key];if(c)return c;c=document.createElement('canvas');c.width=90;c.height=84;const g=c.getContext('2d');g.scale(3,3);g.translate(15,26);drawKind(g,def);return SPR[key]=c;}
function drawDef(def,x,y,s=1,g=ctx){g.drawImage(sprite(def),x-15*s,y-26*s,30*s,28*s);}
function itemDef(key){if(key==='cash')return CASH;const l=B.lines[+key[1]];return key[0]==='p'?l.prod:l.raw;}
function drawItem(key,x,y,s){drawDef(itemDef(key),x,y,s);}

/* ===== world drawing ===== */
const ell=(x,y,rx,ry,col)=>E(ctx,x,y,rx,ry,col),rr=(x,y,w,h,r,col)=>R(ctx,x,y,w,h,r,col);
// stamp(): paint something once to a spare canvas (keyed), then draw that picture wherever it is needed.
// (x0,y0,w,h) is the box around the origin that the drawing fills; res is how sharp to keep it.
const CS={};
function stamp(key,x0,y0,w,h,fn,x,y,s=1,res=2){let c=CS[key];if(!c){c=CS[key]=document.createElement('canvas');c.width=Math.ceil(w*res);c.height=Math.ceil(h*res);const main=ctx;ctx=c.getContext('2d');ctx.scale(res,res);ctx.translate(-x0,-y0);try{fn();}finally{ctx=main;}}
  ctx.drawImage(c,x+x0*s,y+y0*s,w*s,h*s);}
function shadow(x,y,r){stamp('sh',-20,-9,40,18,()=>ell(0,0,20,9,'rgba(40,15,0,.22)'),x,y,r/20,1.5);}
function label(x,y,txt,col,bg,size=12){ctx.font='900 '+size+'px Nunito,system-ui';ctx.textAlign='center';const w=ctx.measureText(txt).width+12;rr(x-w/2,y-size,w,size+7,8,bg);ctx.fillStyle=col;ctx.fillText(txt,x,y+1);}
// People are the most-drawn thing on screen, so each look (clothes, walking frame, facing) is painted once and stamped.
const PSPR={};
function personSprite(o,fr,face,big){const res=big?7:2.5,key=o.cloth+o.trim+o.hat+(o.apron?1:0)+fr+face+res;let c=PSPR[key];if(c)return c;c=document.createElement('canvas');c.width=32*res;c.height=70*res;
  const main=ctx;ctx=c.getContext('2d');ctx.scale(res,res);ctx.translate(16,62);
  try{const sw=[0,3,0,-3][fr],bob=fr%2?1.5:0;shadow(0,0,11);
    ctx.fillStyle='#4a2614';ctx.fillRect(-5+sw*.4,-8,4,8);ctx.fillRect(1-sw*.4,-8,4,8);
    rr(-10,-30-bob,20,24,8,o.cloth);rr(-10,-14-bob,20,5,2,o.trim);
    if(o.apron)rr(-6,-27-bob,12,17,3,'#fff');
    ell(0,-36-bob,8,8,'#6b3a1f');ell(face*3,-36-bob,1.3,1.5,'#1c0b03');
    const h=o.hat;if(h==='gele'){ell(0,-43-bob,11,5,o.trim);ell(-5,-46-bob,6,4,o.cloth);ell(5,-47-bob,6,4.5,o.trim);}
    else if(h==='fila')rr(-8,-48-bob,16,8,3,o.trim);else if(h==='cap')rr(-8,-46-bob,16,6,3,o.trim==='#f4f1ea'?'#c62828':o.trim);
    else if(h==='straw'){ell(0,-43-bob,13,3.5,'#e1c46e');rr(-6,-49-bob,12,6,3,'#e1c46e');}
    else if(h==='helmet'){ell(0,-45-bob,9.5,7,o.trim);rr(-10,-44-bob,20,3,1.5,'rgba(0,0,0,.25)');}
    else if(h==='hard'){ell(0,-45-bob,9,6,'#f2c230');rr(-11,-42-bob,22,2.5,1,'#d9a91e');}
    else if(h==='chef'){rr(-7,-54-bob,14,12,4,'#fff');ell(0,-54-bob,8,4,'#fff');}
  }finally{ctx=main;}return PSPR[key]=c;}
// Rendered character art (src/art.js). Each person is one picture that bobs and leans as it walks.
function drawPerson(x,y,o,stack,step,face,scale=1,sway=1){const ph=((step%6.2832)+6.2832)%6.2832,fr=Math.floor(ph/1.5708+.5)%4,bob=fr%2?1.5:0;
  ctx.drawImage(personSprite(o,fr,face<0?-1:1,scale>1.6),x-16*scale,y-62*scale,32*scale,70*scale);
  if(stack&&stack.length){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const base=-50-bob;ell(0,base+2,13,3.5,'#b07a3a');const cap=scale>1?36:20,n=Math.min(stack.length,cap);
    for(let i=0;i<n;i++)drawItem(stack[i],Math.sin(G.t*3+i*.15)*i*.12*sway,base-i*5.5,.92);
    if(stack.length>cap){ctx.fillStyle='#fff';ctx.font='900 11px Nunito';ctx.textAlign='center';ctx.fillText('x'+stack.length,0,base-n*5.5-8);}
    ctx.restore();}}
const OUTFIT={hand:{cloth:'#6d8f2f',trim:'#d9c27a',hat:'straw'},porter:{cloth:'#3a6fb0',trim:'#22252b',hat:'none'},server:{cloth:'#d83a3a',trim:'#222',hat:'cap'},cook:{cloth:'#444b55',trim:'#fff',hat:'chef',apron:1},cashier:{cloth:'#1f8a4c',trim:'#ffc23d',hat:'none'},loader:{cloth:'#f28a1e',trim:'#fff36b',hat:'cap'},manager:{cloth:'#1b2a4a',trim:'#c62828',hat:'none',apron:1}};

function drawGround(){const f=G.field,st=stage();
  ctx.fillStyle='#d98c4a';ctx.fillRect(0,0,WW,WH);
  // field
  const base={farm:'#6aa23e',pasture:'#8fae45',water:'#2f8fd0',yard:'#a39f96',port:'#7d7a74'}[B.field];rr(f.x-6,f.y-6,f.w+12,f.h+12,16,'#8a5a2a');rr(f.x,f.y,f.w,f.h,12,base);
  for(const s of G.strips){const open=lineOpen(s.li);
    if(B.field==='farm'){ctx.fillStyle='rgba(60,40,10,.16)';for(let y=f.y+22;y<f.y+f.h;y+=30)ctx.fillRect(s.x+6,y-3,s.w-12,8);}
    else if(B.field==='port')portStrip(s,f);
    else if(B.field==='yard'){ctx.strokeStyle='rgba(255,220,80,.5)';ctx.lineWidth=2;ctx.setLineDash([12,10]);ctx.strokeRect(s.x+8,f.y+8,s.w-16,f.h-16);ctx.setLineDash([]);}
    else{for(let i=0;i<10;i++)ell(s.x+((i*97)%s.w),f.y+((i*53)%f.h),6,2,'#7c9a38');}
    if(s!==G.strips[0]){ctx.fillStyle='rgba(40,20,5,.35)';ctx.fillRect(s.x-1.5,f.y,3,f.h);}
    ctx.fillStyle=B.lines[s.li].col;ctx.fillRect(s.x+4,f.y+f.h-7,s.w-8,5);
    if(!open){rr(s.x,f.y,s.w,f.h,0,'rgba(30,14,4,.55)');ctx.font='20px system-ui';ctx.textAlign='center';ctx.fillText('🔒',s.x+s.w/2,f.y+f.h/2);drawItem('r'+s.li,s.x+s.w/2,f.y+f.h/2+34,1.2);}}
  // delivery road + depot
  if(G.D.length){rr(712,-20,276,330,0,'#4a4640');ctx.strokeStyle='#e9d27a';ctx.lineWidth=3;ctx.setLineDash([18,16]);ctx.beginPath();ctx.moveTo(850,0);ctx.lineTo(850,150);ctx.stroke();ctx.setLineDash([]);rr(704,300,284,78,8,'#b9b3a6');label(846,316,'DELIVERIES','#fff','rgba(43,22,8,.6)',10);}
  // kitchen floor
  const kf=(B.field==='port'?['#9c968c','#a8a296','#b3b0a8','#c4c2bc','#d3d6da']:['#cf7f3f','#c79a62','#d6cfc0','#ece8de','#dfe7ec'])[st];rr(24,425,962,345,14,kf);
  ctx.fillStyle='rgba(0,0,0,.06)';if(st<2){for(let y=450;y<765;y+=26)ctx.fillRect(24,y,962,2);}else{for(let y=425;y<770;y+=38)ctx.fillRect(24,y,962,1.5);for(let x=24;x<986;x+=38)ctx.fillRect(x,425,1.5,345);}
  for(let i=0;i<5;i++){ctx.globalAlpha=lineOpen(i)?.2:.07;rr(LX(i)-46,438,92,322,12,B.lines[i].col);ctx.globalAlpha=1;}
  // dining / shop floor
  const dw=st>=3?715:930;
  if(st===1){rr(40,805,dw,385,14,'#c9773a');for(let i=0;i<24;i++){ctx.fillStyle=['#e8501e','#ffc23d','#1f8a4c'][i%3];ctx.beginPath();const bx=52+i*39;ctx.moveTo(bx,806);ctx.lineTo(bx+16,806);ctx.lineTo(bx+8,822);ctx.fill();}}
  else if(st===2){rr(40,805,dw,385,14,'#cfc6b4');ctx.fillStyle='rgba(0,0,0,.06)';for(let x=40;x<40+dw;x+=48)ctx.fillRect(x,805,2,385);}
  else if(st===3){rr(40,805,dw,385,10,'#f1e6d2');ctx.fillStyle='#d98c5a';for(let y=0;y<10;y++)for(let x=0;x<18;x++)if((x+y)%2)ctx.fillRect(40+x*39.7,805+y*38.5,39.7,38.5);}
  else if(st===4){rr(40,805,dw,385,10,'#262b36');ctx.strokeStyle='rgba(90,209,255,.5)';ctx.lineWidth=2;for(let x=80;x<40+dw;x+=80){ctx.beginPath();ctx.moveTo(x,805);ctx.lineTo(x,1190);ctx.stroke();}ctx.strokeStyle='rgba(255,194,61,.8)';ctx.lineWidth=4;ctx.strokeRect(46,811,dw-12,373);}
  else{ctx.fillStyle='rgba(120,60,10,.12)';ctx.beginPath();ctx.ellipse(470,890,260,60,0,0,7);ctx.fill();}
  if(B.field==='port'){ctx.strokeStyle='rgba(242,194,48,.85)';ctx.lineWidth=4;ctx.setLineDash([22,14]);ctx.strokeRect(30,431,950,333);ctx.setLineDash([]);rr(300,773,400,28,9,'#1b2a4a');ctx.fillStyle='#fff';ctx.font='900 14px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('WAKAWAY · If e fit move, we go move am',500,792);}
  // parking + street
  rr(52,1196,116,66,8,'#5a554d');ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(58,1202,104,54);
  ctx.fillStyle='#bdb5a4';ctx.fillRect(0,1270,WW,12);ctx.fillStyle='#3f3c38';ctx.fillRect(0,1282,WW,138);ctx.fillStyle='#e9d27a';for(let x=10;x<WW;x+=70)ctx.fillRect(x,1343,38,4);
}
// Wakaway's own map: parcel yards on the left, then the container quay with the lagoon, a berth and a ship.
function portStrip(s,f){const li=s.li,q=li>=2;
  if(!q){ctx.fillStyle='#6f6c66';ctx.fillRect(s.x,f.y,s.w,f.h);ctx.strokeStyle='rgba(255,214,90,.75)';ctx.lineWidth=3;for(let y=f.y+40;y<f.y+f.h;y+=56){ctx.beginPath();ctx.moveTo(s.x+10,y);ctx.lineTo(s.x+s.w-10,y);ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(li?'WAYBILL DROP-OFF':'PARCEL DROP-OFF',s.x+s.w/2,f.y+f.h-16);return;}
  ctx.fillStyle='#b9b4a8';ctx.fillRect(s.x,f.y,s.w,f.h);ctx.fillStyle='rgba(0,0,0,.07)';for(let x=s.x;x<s.x+s.w;x+=46)ctx.fillRect(x,f.y,1.5,f.h);for(let y=f.y;y<f.y+f.h;y+=46)ctx.fillRect(s.x,y,s.w,1.5);
  ctx.fillStyle='#2f7fc0';ctx.fillRect(s.x,f.y,s.w,58);ctx.fillStyle='rgba(255,255,255,.25)';for(let x=s.x+8;x<s.x+s.w;x+=34)ctx.fillRect(x,f.y+18+(x%3)*9,18,2.5);
  ctx.fillStyle='#e9e2d2';ctx.fillRect(s.x,f.y+58,s.w,6);ctx.fillStyle='#22252b';for(let x=s.x+14;x<s.x+s.w;x+=40)ctx.fillRect(x,f.y+60,8,6);
  if(li===4){rr(s.x+10,f.y+8,s.w-20,40,10,'#1b2a4a');rr(s.x+10,f.y+8,s.w-20,8,4,'#c62828');rr(s.x+s.w-62,f.y-14,34,26,4,'#f4f1ea');ctx.fillStyle='#fff';ctx.font='900 11px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('MV WAYBILL',s.x+s.w/2-20,f.y+38);
    for(let i=0;i<4;i++)rr(s.x+22+i*26,f.y-6,22,14,1,['#c62828','#2a62c9','#1f8a4c','#f2c230'][i]);}
  if(li===3){ctx.strokeStyle='#2a62c9';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(s.x+30,f.y+f.h-20);ctx.lineTo(s.x+30,f.y+6);ctx.lineTo(s.x+s.w-20,f.y+6);ctx.moveTo(s.x+s.w-40,f.y+f.h-20);ctx.lineTo(s.x+s.w-40,f.y+6);ctx.stroke();ctx.strokeStyle='#f26a1a';ctx.lineWidth=3;ctx.strokeRect(s.x+s.w/2-12,f.y,24,14);}
  ctx.fillStyle='rgba(43,22,8,.55)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(['','','TRUCK PARK','CUSTOMS YARD','SHIP BERTH'][li],s.x+s.w/2,f.y+f.h-16);}
// The ground never changes between upgrades, so it is painted once to a spare canvas and stamped each frame.
let GC=null,GCK='';
function groundCache(){const sc=Math.min(1.6,SCALE*DPR),key=[SAVE.cur,stage(),openLines().join(''),sc].join('|');if(GC&&key===GCK)return sc;GCK=key;if(!GC)GC=document.createElement('canvas');
  GC.width=Math.ceil(WW*sc);GC.height=Math.ceil(WH*sc);const main=ctx;ctx=GC.getContext('2d');ctx.setTransform(sc,0,0,sc,0,0);try{drawGround();}finally{ctx=main;}return sc;}
function drawWaves(){const f=G.field,t=G.t;ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=2;for(const s of G.strips)for(let y=f.y+30;y<f.y+f.h;y+=44){ctx.beginPath();for(let x=s.x+10;x<s.x+s.w-10;x+=14)ctx.lineTo(x,y+Math.sin(x*.05+t*1.5+y)*3);ctx.stroke();}}
function drawField(){const farm=B.field==='farm';ctx.fillStyle=farm?'#3f7a2a':'rgba(0,0,0,.18)';
  for(const c of G.crops){if(c.mv||!lineOpen(c.li))continue;
    if(c.ready){if(farm)stamp('crop'+SAVE.cur+c.li,-15,-22,30,28,()=>{ell(0,-1,9,5.5,'#3f8a2a');drawItem('r'+c.li,0,3,.82);},c.x,c.y,1,3);else drawItem('r'+c.li,c.x,c.y+3,.82);}
    else ctx.fillRect(c.x-3,c.y-2,6,4);}}
function drawAnimal(c){const bob=Math.sin(c.ph*6);if(B.field==='water'){ctx.globalAlpha=.35;stamp('rip',-7,-2,14,4,()=>ell(0,0,7,2,'#fff'),c.x-(c.vx>0?12:-12),c.y-2,1,3);ctx.globalAlpha=1;}else shadow(c.x,c.y+2,10);
  ctx.save();ctx.translate(c.x,c.y+bob);if(c.vx<0)ctx.scale(-1,1);drawDef(B.lines[c.li].raw,0,4,1.05);ctx.restore();}
function drawPosts(){for(const p of[G.postA,G.postB]){shadow(p.x,p.y+3,12);rr(p.x-8,p.y-30,16,32,4,'#8a5426');ell(p.x,p.y-30,10,4,'#e8a63c');ctx.strokeStyle='#e8501e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-5,p.y-33);ctx.lineTo(p.x+5,p.y-27);ctx.moveTo(p.x+5,p.y-33);ctx.lineTo(p.x-5,p.y-27);ctx.stroke();}}
function drawTrail(tr,pos,isP){if(!tr)return;const s=tr.strain||0,warn=isP&&s>.82&&Math.sin(G.t*20)>0;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=warn?'#ff3b30':'#f3e08a';ctx.lineWidth=warn?6:5;ctx.beginPath();tr.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y-10):ctx.moveTo(p.x,p.y-10));ctx.lineTo(pos.x,pos.y-14);ctx.stroke();
  ctx.strokeStyle='rgba(120,90,30,.6)';ctx.lineWidth=1.5;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
  if(isP)label(pos.x,pos.y-78,'Rope '+Math.min(100,Math.round(s*100))+'%',warn?'#fff':'#2b1608',warn?'#e0281e':'#ffe9a8',10);}
function unitBody(kind,col,busy){
  if(kind==='pot'){for(let i=-2;i<=2;i++){ctx.save();ctx.translate(i*9,8);ctx.rotate(i*.3);rr(-3,-14,6,16,2,'#6b3b18');ctx.restore();}
    ell(0,-14,32,21,'#1f1b1a');ell(0,-28,32,10,'#2c2726');ell(0,-28,27,8,col);ell(-8,-30,9,3,HI);rr(-38,-30,8,5,2,'#1f1b1a');rr(30,-30,8,5,2,'#1f1b1a');}
  else if(kind==='grill'){rr(-40,-24,80,28,4,'#2a2523');rr(-37,-31,74,13,3,busy?'#e8461e':'#5a463c');ctx.strokeStyle='#bbb';ctx.lineWidth=1;for(let i=-34;i<36;i+=6){ctx.beginPath();ctx.moveTo(i,-31);ctx.lineTo(i,-18);ctx.stroke();}
    for(let i=0;i<4;i++)rr(-30+i*16,-29,11,5,2,col);ctx.fillStyle='#555';ctx.fillRect(-36,4,4,10);ctx.fillRect(32,4,4,10);}
  else if(kind==='fryer'){rr(-34,-8,68,14,4,'#3a3330');ell(0,-16,34,14,'#2c2726');ell(0,-19,29,10,'#e8b93a');for(let i=0;i<6;i++)ell(-16+i*6.5,-19+Math.cos(i*2)*4,4.4,3.6,col);rr(32,-22,16,4,2,'#2c2726');}
  else if(kind==='cooler'){rr(-26,-40,52,44,8,col);rr(-26,-40,52,10,6,'#fff');rr(-20,-24,40,14,3,'rgba(255,255,255,.85)');rr(-22,-36,5,34,2.5,HI);rr(-6,2,12,6,2,'#888');}
  else if(kind==='scale'){rr(-30,-6,60,12,3,'#5b5f66');rr(-26,-14,52,9,2,'#c9ced2');rr(-6,-40,12,28,3,'#3a3f46');rr(-16,-52,32,16,4,'#22252b');rr(-12,-49,24,9,2,busy?'#7dff9a':'#4a7a5a');rr(-30,-18,60,3,1,col);}
  else if(kind==='desk'){rr(-44,-22,88,26,4,'#5a3a24');rr(-46,-28,92,8,3,'#7a4f30');rr(-34,-40,22,14,2,'#f4f1ea');rr(-31,-38,16,2,1,col);rr(4,-38,26,12,2,'#22252b');rr(6,-36,22,8,1,busy?'#7ad1ff':'#38506a');rr(-6,-34,8,6,2,'#c62828');ctx.fillStyle='#3a2414';ctx.fillRect(-40,4,6,12);ctx.fillRect(34,4,6,12);}
  else if(kind==='bay'){rr(-46,-10,92,16,3,'#3a3f46');ctx.fillStyle='#f2c230';for(let i=-44;i<44;i+=12)ctx.fillRect(i,-10,6,16);rr(-42,-34,84,22,3,col);for(let i=-38;i<40;i+=7)ctx.fillRect(i,-32,2,18);ell(-30,8,7,7,'#111');ell(30,8,7,7,'#111');}
  else{rr(-44,-24,88,30,5,'#8a5426');rr(-42,-30,84,24,4,'#c98a45');rr(-38,-27,76,5,2,col);ctx.fillStyle='#6b3b18';ctx.fillRect(-40,2,6,12);ctx.fillRect(34,2,6,12);}}
const flame=(x,y,i)=>stamp('fl'+(i%2),-4,-6,8,12,()=>ell(0,0,4,6,i%2?'#ffb02e':'#ff5a1f'),x,y,1,3);
function unit(kind,x,y,s,col,busy,t){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  if(busy&&kind==='pot')for(let i=0;i<5;i++)flame(-14+i*7,2-Math.abs(Math.sin(t*9+i))*6,i);
  if(busy&&kind==='fryer')for(let i=0;i<4;i++)flame(-18+i*12,8-Math.abs(Math.sin(t*9+i))*5,i);
  stamp('u'+kind+col+(kind==='grill'&&busy?1:0),-50,-46,100,74,()=>unitBody(kind,col,busy),0,0,1,2);
  if(busy&&kind!=='cooler'&&kind!=='table'){const a=ctx.globalAlpha;for(let i=0;i<3;i++){const k=(t*.6+i/3)%1;ctx.globalAlpha=a*(1-k)*.75;stamp('puff',-10,-8,20,16,()=>ell(0,0,10,8,'#fff'),-10+i*10,-40-k*36,(6+k*8)/10,2);}ctx.globalAlpha=a;}
  ctx.restore();}
function drawStation(i){const l=B.lines[i],x=LX(i),y=512,sl=lvl('st'+i),busy=G.procIn[i]>0&&G.out[i]<80;
  if(!lineOpen(i)){ctx.globalAlpha=.25;unit(l.st,x,y,.9,'#888',false,0);ctx.globalAlpha=1;return;}
  shadow(x,y+8,44);const n=sl+1,sc=[1,.78,.64][sl],off=[[0],[-24,24],[-32,0,32]][sl];for(let k=0;k<n;k++)unit(l.st,x+off[k],y+(k%2)*4,sc,l.col,busy,G.t+k);
  if(busy&&l.st==='table')for(let k=0;k<Math.min(5,G.procIn[i]);k++)drawItem('r'+i,x-28+k*14,y-26,.8);
  label(x,y-74,l.short+(sl?' x'+SM[sl]:''),'#fff',l.col,11);
  if(G.procIn[i]>0)label(x,y-56,G.procIn[i]+' waiting','#2b1608','rgba(255,246,228,.9)',10);
  if(l.src==='depot'&&G.player.stack[0]==='r'+i){ctx.strokeStyle='#7dff9a';ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.strokeRect(x-26,448,52,34);ctx.setLineDash([]);}}
function drawOut(i){if(!lineOpen(i))return;const x=LX(i),y=592,full=G.out[i]>=80,near=dist(G.player.x,G.player.y,x,y)<36;
  ctx.strokeStyle=full?'#ff3b30':near?'#7dff9a':'rgba(255,255,255,.85)';ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.strokeRect(x-27,y-20,54,34);ctx.setLineDash([]);
  if(!G.out[i]){ctx.globalAlpha=.4;drawItem('p'+i,x,y+6,1.1);ctx.globalAlpha=1;}
  const cols=Math.ceil(G.out[i]/10);for(let c=0;c<Math.min(cols,4);c++){const n=Math.min(10,G.out[i]-c*10);for(let k=0;k<n;k++)drawItem('p'+i,x-21+c*14,y+8-k*5,.9);}
  if(G.out[i]>40)label(x+30,y+26,''+G.out[i],'#fff','rgba(43,22,8,.7)',9);if(full)label(x,y-70,'! FULL','#fff','#e0281e',12);}
function drawStacks(){for(const s of G.stacks){const open=lineOpen(s.li),n=G.depot[s.li];rr(s.x-26,s.y-8,52,24,3,'#8a6a3a');ctx.fillStyle=B.lines[s.li].col;ctx.fillRect(s.x-26,s.y+12,52,4);
    if(!open){ctx.globalAlpha=.3;drawItem('r'+s.li,s.x,s.y+8,1);ctx.globalAlpha=1;continue;}
    const m=Math.min(18,Math.ceil(n/Math.max(1,[60,120,240][lvl('truck')]/18)));for(let k=0;k<m;k++)drawItem('r'+s.li,s.x-14+(k%3)*14,s.y+8-Math.floor(k/3)*7,.85);
    if(n)label(s.x,s.y-54,''+n,'#fff','rgba(43,22,8,.7)',10);}}
function drawTruck(){const T=G.truck;if(T.state==='wait')return;const x=850,y=T.y;shadow(x,y+50,40);
  rr(x-27,y-70,54,96,6,'#f4f1ea');rr(x-27,y-30,54,10,0,B.tone);rr(x-25,y+26,50,34,8,B.tone);rr(x-20,y+38,40,14,4,'#bfe6fb');ell(x-18,y+58,5,3,'#ffe9a8');ell(x+18,y+58,5,3,'#ffe9a8');
  ctx.fillStyle='#22252b';for(const[dx,dy]of[[-30,-50],[24,-50],[-30,30],[24,30]])ctx.fillRect(x+dx,y+dy,6,18);}
function drawCounter(){const st=stage(),wood=['#8a5426','#8a5426','#a9764a','#5b4636','#3a4250'][st],topc=['#b8743a','#c98a45','#e9dcc6','#f4f1ea','#dfe7ec'][st];
  rr(34,744,860,22,4,wood);rr(30,728,868,20,5,topc);
  for(let i=0;i<5;i++){const l=B.lines[i],x=LX(i),open=lineOpen(i);ctx.globalAlpha=open?1:.3;rr(x-40,729,80,18,4,l.col);ctx.globalAlpha=1;if(!open)continue;
    const n=Math.min(G.counter[i],24);for(let k=0;k<n;k++)drawItem('p'+i,x-24+(k%4)*16,738-Math.floor(k/4)*5,.82);
    if(G.counter[i]>24)label(x+34,712,''+G.counter[i],'#fff','rgba(43,22,8,.7)',9);
    ctx.font='900 10px Nunito,system-ui';ctx.textAlign='center';const txt='₦'+short(revenue(i));const w=ctx.measureText(txt).width+10;rr(x-w/2,751,w,14,3,'#fff6e4');ctx.fillStyle='#2b1608';ctx.fillText(txt,x,762);
    if(G.player.stack[0]==='p'+i){ctx.strokeStyle='#7dff9a';ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.strokeRect(x-28,694,56,30);ctx.setLineDash([]);}}
  // till
  rr(897,716,38,30,4,'#2c2f36');rr(901,706,30,14,3,'#4b515c');rr(905,709,22,7,2,'#9dffb8');
  if(S.till>0&&!lvl('cashier')){const n=Math.min(30,Math.ceil(S.till/(B.lines[0].price*4)));for(let k=0;k<n;k++)drawItem('cash',905+(k%3)*10,696-Math.floor(k/3)*5,1);label(915,640-Math.min(40,n*1.6),'₦'+short(S.till),'#b9ffcf','rgba(12,60,30,.9)',11);}}
function drawTable(tb){const st=stage(),ol=openLines();stamp('tb'+SAVE.cur+st+(B.food?'':ol.join('')),-40,-26,80,58,()=>{shadow(0,14,34);
  if(B.food){ell(0,2,26,13,st>=4?'#1b1f27':'#6b3b18');ell(0,-2,26,13,st>=3?'#fff':'#c98a45');if(st>=4)ell(0,-2,20,9,'rgba(90,209,255,.25)');}
  else{rr(-28,-12,56,24,4,'#8a5426');rr(-26,-16,52,20,3,st>=3?'#f4f1ea':'#c98a45');for(let k=0;k<3;k++)drawItem('p'+ol[k%ol.length],-16+k*16,-4,.7);}},tb.x,tb.y,1,2);}
function drawBench(){rr(300,890,340,10,3,'#8a5426');rr(300,884,340,8,3,'#b8743a');ctx.fillStyle='#6b3b18';ctx.fillRect(310,898,6,10);ctx.fillRect(624,898,6,10);
  ctx.fillStyle='#6b3b18';ctx.fillRect(468,820,4,60);for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#ffc23d':B.tone;ctx.beginPath();ctx.moveTo(470,812);ctx.arc(470,826,46,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6);ctx.fill();}}
function drawBuilding(){const st=stage(),x=770,y=815,w=205,h=360,t=G.t;
  stamp('bld'+SAVE.cur+st,756,750,234,486,()=>{shadow(x+w/2,y+h+6,110);
    if(st===3){rr(x,y,w,h,8,'#f1e2c6');rr(x,y,w,26,8,B.tone);for(let r=0;r<2;r++)for(let c=0;c<4;c++)rr(x+16+c*47,y+70+r*120,32,58,4,'#ffe9a8');rr(x+w/2-24,y+h-70,48,70,6,'#5b3a22');}
    else{const gr=ctx.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#16324a');gr.addColorStop(1,'#0b1a2b');rr(x,y-22,w,h+22,12,gr);
      for(let r=0;r<9;r++)for(let c=0;c<6;c++)rr(x+12+c*32,y+44+r*30,24,20,3,(r+c)%3?'#ffe9a8':'#7ad1ff');
      ctx.strokeStyle='#5ad1ff';ctx.lineWidth=2.5;ctx.strokeRect(x+4,y-18,w-8,h+14);rr(x+w/2-34,y+h-56,68,56,8,'#7ad1ff');ctx.fillStyle='#ff3b30';ctx.fillRect(x+w/2-1.5,y-52,3,32);}},0,0,1,1.5);
  // a few windows go dark and come back, so the building looks lived in
  if(st===3){ctx.fillStyle='#8fb8d6';for(let r=0;r<2;r++)for(let c=0;c<4;c++)if((r*4+c+Math.floor(t/3))%5===0)ctx.fillRect(x+17+c*47,y+71+r*120,30,56);}
  else{ctx.fillStyle='#1d3550';for(let r=0;r<9;r++)for(let c=0;c<6;c++)if(((r*7+c*13+Math.floor(t*.7+r))%6)===0)ctx.fillRect(x+13+c*32,y+45+r*30,22,18);
    ctx.fillStyle=Math.sin(t*4)>0?'#ff3b30':'#7a1c12';ctx.fillRect(x+w/2-4,y-58,8,8);}
  ctx.font='16px "Lilita One",system-ui';ctx.textAlign='center';ctx.fillStyle=st===4?'#ffd659':'#fff';ctx.fillText(B.name.split("'")[0].split(' ').slice(0,2).join(' ').toUpperCase(),x+w/2,y+(st===4?16:19));
  label(x+w/2,y+(st===4?38:48),'Inside: '+Math.round(G.inside).toLocaleString()+' / '+INCAP[st].toLocaleString(),'#fff','rgba(0,0,0,.55)',11);}
function vehRaw(g,k,col){
  if(k==='danfo'){R(g,-44,-40,88,34,7,'#f2c230');R(g,-44,-22,88,6,0,'#1b1f27');for(let i=0;i<4;i++)R(g,-38+i*20,-36,15,11,2,'#bfe6fb');R(g,36,-20,8,6,2,'#ffe9a8');}
  else if(k==='keke'){R(g,-26,-36,50,30,9,'#f2c230');R(g,-20,-32,22,13,3,'#bfe6fb');R(g,-26,-36,50,7,6,'#1b1f27');R(g,18,-14,10,8,3,'#f2c230');}
  else if(k==='suv'){R(g,-46,-30,92,24,7,col||'#1b1f27');R(g,-34,-46,62,20,7,col||'#1b1f27');R(g,-28,-42,22,13,3,'#bfe6fb');R(g,-2,-42,24,13,3,'#bfe6fb');R(g,40,-22,7,6,2,'#ffe9a8');}
  else{R(g,-42,-24,84,18,7,col||'#c62828');R(g,-24,-38,46,16,7,col||'#c62828');R(g,-19,-35,17,11,3,'#bfe6fb');R(g,2,-35,16,11,3,'#bfe6fb');R(g,36,-18,7,5,2,'#ffe9a8');}
  const wx=k==='keke'?[-14,12]:[-26,26];for(const w of wx){E(g,w,-5,8,8,'#111');E(g,w,-5,3.4,3.4,'#999');}}
function veh(g,x,y,k,s,col,flip){const key='v'+k+(col||'');let c=CS[key];if(!c){c=CS[key]=document.createElement('canvas');c.width=300;c.height=165;const g2=c.getContext('2d');g2.scale(3,3);g2.translate(50,50);vehRaw(g2,k,col);}
  g.save();g.translate(x,y);g.scale(flip?-s:s,s);g.drawImage(c,-50,-50,100,55);g.restore();}
function drawPad(s){const Lp=S.pads[s.id]||{l:0,paid:0},[x,y]=padPos(s),on=G.onPad===s,rem=s.cost-Lp.paid,can=S.money>=rem,pr=Lp.paid/s.cost,pulse=can?1+Math.sin(G.t*6)*.05:1;
  ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);
  rr(-27,-21,54,42,9,'rgba(30,14,4,.86)');if(pr>0)rr(-27,21-42*pr,54,42*pr,9,'rgba(48,190,96,.6)');
  ctx.strokeStyle=on?'#7dff9a':can?'#ffd659':'#fff';ctx.lineWidth=on||can?3:2;for(const[sx,sy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){ctx.beginPath();ctx.moveTo(sx*31,sy*15);ctx.lineTo(sx*31,sy*25);ctx.lineTo(sx*21,sy*25);ctx.stroke();}
  if(s.base==='line'||s.base==='st'){drawItem('p'+s.arg,s.base==='st'?-5:0,4,1);if(s.base==='st'){ctx.fillStyle='#ffd659';ctx.font='900 11px Nunito';ctx.textAlign='left';ctx.fillText('x'+SM[s.n],6,-4);}}
  else{ctx.font='17px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(PICON[s.base],0,-1);}
  rr(-25,5,50,13,4,can?'#0e9a48':'#0e5a30');ctx.fillStyle='#fff';ctx.font='900 10.5px Nunito,system-ui';ctx.textAlign='center';ctx.fillText('₦'+short(rem),0,15.5);
  ctx.restore();
  if(on||dist(G.player.x,G.player.y,x,y)<95)label(x,y-32,padLabel(s),'#fff','rgba(43,22,8,.82)',10);}
function drawCust(c){const seated=c.st==='eat';drawPerson(c.x,c.y,c.o,null,seated?0:c.step,c.face,.86);
  if(c.vip){ctx.strokeStyle='#ffd659';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(c.x,c.y,13,6,0,0,7);ctx.stroke();}
  if(seated||c.st==='toSeat'){drawItem('p'+c.li,c.x+(seated?0:8),c.y-(seated?30:22),.62);}
  else if(c.st==='in'||c.st==='wait'){const bx=c.x,by=c.y-52,low=c.st==='wait'&&c.pat<4,col=low?'#ffd0c8':'#fff';stamp('bub'+(low?1:0),-13,-11,26,26,()=>{ell(0,0,12,10.5,col);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(0,14);ctx.lineTo(3,8);ctx.fill();},bx,by,1,3);drawItem('p'+c.li,bx,by+7,.72);}
  else if(c.angry){const bx=c.x,by=c.y-50;ell(bx,by,8,8,'#e8331e');ctx.fillStyle='#2b0a03';ctx.fillRect(bx-5,by-3,3,1.5);ctx.fillRect(bx+2,by-3,3,1.5);ctx.fillRect(bx-3,by+3,6,1.5);}}
function drawBelts(){for(const i of openLines()){const x=LX(i);rr(x-9,606,18,108,4,'#2c2f36');ctx.fillStyle='#7ad1ff';for(let k=0;k<6;k++){const y=608+((k*18+G.t*60)%104);ctx.fillRect(x-6,y,12,3);}if(G.out[i]>0)drawItem('p'+i,x,640+((G.t*60)%60),.7);}}
function drawBay(){const X=G.exp,P=PBZ();rr(690,1196,286,66,8,'#4b5563');ctx.strokeStyle='#ffd659';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.strokeRect(696,1202,274,54);ctx.setLineDash([]);
  label(833,1194,P.export.bay.toUpperCase(),'#fff','rgba(43,22,8,.75)',10);
  if(S.emp.pack){rr(900,1206,66,44,6,'#1f3f5a');rr(906,1212,54,10,3,'#7ad1ff');for(let k=0;k<3;k++)rr(908+((k*20+G.t*30)%44),1228,12,12,2,'#c9a15a');}
  const o=X.state==='load'?X.ord:null;if(o){const near=dist(G.player.x,G.player.y,BAY.x,BAY.y)<52;ctx.strokeStyle=near?'#7dff9a':'#fff';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.strokeRect(BAY.x-32,BAY.y-22,64,40);ctx.setLineDash([]);
    const n=Math.min(12,Math.ceil(o.got/Math.max(1,o.need/12)));for(let k=0;k<n;k++)drawDef(['carton','#c9a15a',B.lines[o.li].col],BAY.x-20+(k%4)*13,BAY.y+10-Math.floor(k/4)*9,.8);
    drawItem('p'+o.li,BAY.x-52,BAY.y+8,1);label(BAY.x,BAY.y-34,B.lines[o.li].short+' '+o.got+'/'+o.need+' · ₦'+short(o.pay)+' · '+Math.ceil(X.t)+'s','#2b1608','#ffd659',11);}}
function drawExpTruck(){const X=G.exp;if(X.state==='wait')return;const x=X.x,y=1300;shadow(x,y+4,70);rr(x-20,y-58,104,50,5,'#f4f1ea');rr(x-20,y-30,104,8,0,B.tone);rr(x-62,y-44,40,36,7,B.tone);rr(x-58,y-40,20,16,3,'#bfe6fb');ell(x-62,y-14,4,3,'#ffe9a8');
  for(const wx of[-44,10,60]){ell(x+wx,y-6,9,9,'#111');ell(x+wx,y-6,4,4,'#999');}if(X.ord){ctx.font='900 9px Nunito,system-ui';ctx.textAlign='center';ctx.fillStyle='#2b1608';ctx.fillText(X.ord.buyer.buyer.slice(0,18),x+32,y-40);}}
// Farmhands and porters ride whatever machine the owner has bought (rope, barrow, tricycle, pickup, tractor or forklift, truck).
// Farmhands and porters ride whatever machine the owner has bought: barrow, keke, pickup, tractor or forklift, truck (2D drawings).
function drawBarrow(x,y,f,load){ctx.save();ctx.translate(x,y);ctx.scale(f,1);shadow(0,4,16);ctx.strokeStyle='#5b5f66';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-6,-10);ctx.lineTo(-22,-18);ctx.stroke();
  ctx.fillStyle='#8a9099';ctx.beginPath();ctx.moveTo(-8,-14);ctx.lineTo(16,-14);ctx.lineTo(10,-3);ctx.lineTo(-4,-3);ctx.closePath();ctx.fill();ell(12,0,5,5,'#222');ell(12,0,2,2,'#999');if(load)drawItem(load,4,-16,.7);ctx.restore();}
function drawTractor(x,y,f,yard){ctx.save();ctx.translate(x,y);ctx.scale(f*.62,.62);shadow(0,6,40);
  if(yard){rr(-24,-26,40,30,5,'#f2c230');rr(-18,-46,24,22,4,'#22252b');rr(-14,-42,14,12,2,'#bfe6fb');ctx.fillStyle='#555';ctx.fillRect(18,-50,5,56);ctx.fillRect(18,0,26,5);ell(-14,4,8,8,'#111');ell(10,4,8,8,'#111');}
  else{rr(-30,-22,44,26,5,'#2e8b3d');rr(-22,-44,26,24,4,'#1f6a2c');rr(-18,-40,16,13,2,'#bfe6fb');rr(18,-18,36,18,3,'#c62828');ell(-18,6,12,12,'#111');ell(-18,6,5,5,'#f2c230');ell(18,8,8,8,'#111');ell(44,8,7,7,'#111');}
  ctx.restore();}
function drawWorker(w){const o=(B.outfit&&B.outfit[w.kind])||OUTFIT[w.kind],t=w.kind==='hand'||w.kind==='porter'?S.emp.haul||0:0,busy=w.stack.length||w.state!=='idle';
  if(!t||!busy||(B.field==='water'&&w.kind==='hand'&&t>1))return drawPerson(w.x,w.y,o,w.stack,w.step,w.face,.92);
  if(t===1){drawPerson(w.x-w.face*10,w.y,o,null,w.step,w.face,.92);drawBarrow(w.x+w.face*12,w.y,w.face,w.stack[0]);}
  else if(t===4)drawTractor(w.x,w.y,w.face,B.field==='yard'||B.field==='port'||w.kind==='porter');
  else veh(ctx,w.x,w.y+6,['','','keke','car','','danfo'][t],.62,t===3?'#f4f1ea':B.tone,w.face<0);
  if(w.stack.length&&t>1){drawItem(w.stack[0],w.x,w.y-44,.85);ctx.fillStyle='#fff';ctx.strokeStyle='rgba(43,22,8,.8)';ctx.lineWidth=3;ctx.font='900 11px Nunito';ctx.textAlign='center';ctx.strokeText('x'+w.stack.length,w.x,w.y-62);ctx.fillText('x'+w.stack.length,w.x,w.y-62);}}
function drawMach(){const M=G.mach,x=M.x,y=M.y;ctx.save();ctx.translate(x,y);if(M.v<0)ctx.scale(-1,1);
  if(B.field==='water'){ctx.globalAlpha=.4;ell(-34,4,22,5,'#fff');ctx.globalAlpha=1;ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.moveTo(-36,-10);ctx.lineTo(36,-10);ctx.lineTo(24,8);ctx.lineTo(-28,8);ctx.closePath();ctx.fill();rr(-14,-28,24,18,3,'#2a62c9');rr(-10,-24,10,8,2,'#bfe6fb');ctx.fillStyle='#6b3b18';ctx.fillRect(16,-40,3,30);}
  else if(B.field==='yard'||B.field==='port'){shadow(0,10,30);rr(-24,-22,40,28,5,'#f2c230');rr(-18,-38,24,18,4,'#22252b');rr(-14,-34,14,10,2,'#bfe6fb');ctx.fillStyle='#555';ctx.fillRect(18,-40,4,48);ctx.fillRect(18,2,24,4);drawDef(['carton','#c9b08a','#8a6a3a'],32,2,.9);ell(-14,8,7,7,'#111');ell(10,8,7,7,'#111');}
  else{shadow(0,10,34);rr(-30,-20,44,24,5,'#2e8b3d');rr(-22,-40,26,22,4,'#1f6a2c');rr(-18,-36,16,12,2,'#bfe6fb');rr(14,-14,26,16,3,'#c62828');ctx.fillStyle='#ffd659';for(let k=0;k<4;k++)ctx.fillRect(40,-12+k*4,8,2);ell(-18,8,11,11,'#111');ell(-18,8,5,5,'#f2c230');ell(18,10,7,7,'#111');}
  ctx.restore();}
function tint(){const h=hour();let c=null;if(G.closing)c='rgba(20,20,70,'+Math.min(.5,.3+G.closeT*.02)+')';else if(h<9)c='rgba(255,200,120,'+(.1*(9-h))+')';else if(h>17)c=h<19?'rgba(255,120,30,'+(.11*(h-17))+')':'rgba(90,50,110,'+(.22+.12*(h-19))+')';
  if(c){ctx.fillStyle=c;ctx.fillRect(0,0,W,H);}}

function draw(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  if(G.night){drawNight();return;}if(G.trip){drawTrip();return;}
  ctx.fillStyle='#3a2210';ctx.fillRect(0,0,W,H);
  const s=SCALE,P=G.player;ctx.setTransform(DPR*s,0,0,DPR*s,DPR*(W/2-G.cam.x*s),DPR*(H/2-G.cam.y*s));
  const vy0=G.cam.y-H/2/s-80,vy1=G.cam.y+H/2/s+140,vis=y=>y>vy0&&y<vy1;
  {const sc=groundCache(),x0=Math.max(0,G.cam.x-W/2/s),x1=Math.min(WW,G.cam.x+W/2/s),y0=Math.max(0,G.cam.y-H/2/s),y1=Math.min(WH,G.cam.y+H/2/s);if(x1>x0&&y1>y0)ctx.drawImage(GC,x0*sc,y0*sc,(x1-x0)*sc,(y1-y0)*sc,x0,y0,x1-x0,y1-y0);}
  const fv=vy0<G.field.y+G.field.h+60;
  if(fv){if(B.field==='water')drawWaves();drawField();}if(S.emp.belt&&vis(660))drawBelts();
  const steps=visibleSteps();for(const st of steps)if(vis(padPos(st)[1]))drawPad(st);
  if(fv){drawPosts();for(const w of G.workers)if(w.trail)drawTrail(w.trail,w,false);drawTrail(P.trail,P,true);}
  const Ls=[];
  if(fv)for(const c of G.crops)if(c.mv&&c.ready&&lineOpen(c.li))Ls.push({y:c.y,f:()=>drawAnimal(c)});
  if(vis(540))for(let i=0;i<5;i++){Ls.push({y:512,f:()=>drawStation(i)});Ls.push({y:566,f:()=>drawOut(i)});}
  if(G.D.length){Ls.push({y:340,f:drawStacks});Ls.push({y:G.truck.y+60,f:drawTruck});}
  if(vis(748))Ls.push({y:748,f:drawCounter});
  if(stage()===0)Ls.push({y:880,f:drawBench});for(const tb of G.tables)if(vis(tb.y))Ls.push({y:tb.y-8,f:()=>drawTable(tb)});
  if(stage()>=3)Ls.push({y:1176,f:drawBuilding});
  if(S.emp.con){Ls.push({y:1190,f:drawBay});Ls.push({y:1300,f:drawExpTruck});}if(S.emp.auto)Ls.push({y:G.mach.y+10,f:drawMach});
  const cl=lvl('car');Ls.push({y:1236,f:()=>{if(cl)veh(ctx,110,1250,['','keke','car','suv'][cl],.62,cl===2?'#c62828':'#1b1f27');else{ctx.fillStyle='#6b3b18';ctx.fillRect(108,1196,4,50);rr(92,1186,36,18,4,'#f2c230');ctx.fillStyle='#1b1f27';ctx.font='900 9px Nunito';ctx.textAlign='center';ctx.fillText('BUS',110,1199);}}});
  for(const c of G.custs)if(vis(c.y))Ls.push({y:c.y,f:()=>drawCust(c)});
  for(const w of G.workers)if(vis(w.y))Ls.push({y:w.y,f:()=>drawWorker(w)});
  Ls.push({y:P.y,f:()=>drawPerson(P.x,P.y,B.owner,P.stack,P.step,P.face,1.1,G.input.active?1.7:1)});
  for(const c of G.cars)Ls.push({y:c.y,f:()=>veh(ctx,c.x,c.y,c.k,.8,c.c,c.v<0)});
  Ls.sort((a,b)=>a.y-b.y);for(const o of Ls)o.f();
  for(const b of G.bub){const w=b.who;if(vis(w.y)){ctx.globalAlpha=Math.min(1,b.t*2);label(Math.max(90,Math.min(WW-90,w.x)),w.y-66,b.txt,'#2b1608','#fff',11);ctx.globalAlpha=1;}}
  for(const f of G.flyers){if(f.t<0)continue;const k=f.t/f.dur;drawItem(f.type,f.x0+(f.x1-f.x0)*k,f.y0+(f.y1-f.y0)*k-(f.z0+(f.z1-f.z0)*k+Math.sin(k*Math.PI)*f.arc),1);}
  for(const p of G.parts){ctx.globalAlpha=1-p.t/p.life;ell(p.x,p.y,p.r*(1+p.t),p.r*(1+p.t),p.col);}ctx.globalAlpha=1;
  for(const p of G.floats){ctx.globalAlpha=Math.min(1,(1.1-p.t)*2.5);ctx.font='900 '+p.size+'px Nunito,system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(30,14,4,.85)';ctx.strokeText(p.txt,p.x,p.y);ctx.fillStyle=p.col;ctx.fillText(p.txt,p.x,p.y);}ctx.globalAlpha=1;
  const T=target();if(T){const bob=Math.sin(G.t*6)*5;ctx.fillStyle='#ffc23d';ctx.strokeStyle='#2b1608';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(T.x,T.y-30+bob);ctx.lineTo(T.x-11,T.y-46+bob);ctx.lineTo(T.x-4,T.y-46+bob);ctx.lineTo(T.x-4,T.y-60+bob);ctx.lineTo(T.x+4,T.y-60+bob);ctx.lineTo(T.x+4,T.y-46+bob);ctx.lineTo(T.x+11,T.y-46+bob);ctx.closePath();ctx.fill();ctx.stroke();
    const sx=(T.x-G.cam.x)*s,sy=(T.y-G.cam.y)*s;if(Math.abs(sx)>W/2-30||Math.abs(sy)>H/2-40){const ang=Math.atan2(T.y-P.y,T.x-P.x);ctx.save();ctx.translate(P.x+Math.cos(ang)*50,P.y-22+Math.sin(ang)*50);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-7,-9);ctx.lineTo(-7,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}}
  ctx.setTransform(DPR,0,0,DPR,0,0);tint();
  for(const p of G.conf){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/3,p.r,p.r*.66);ctx.restore();}
  const I=G.input;if(I.active){ctx.globalAlpha=.3;E(ctx,I.ox,I.oy,50,50,'#fff');ctx.globalAlpha=.8;const dx=I.x-I.ox,dy=I.y-I.oy,m=Math.hypot(dx,dy)||1,d=Math.min(50,m);E(ctx,I.ox+dx/m*d,I.oy+dy/m*d,22,22,'#fff');ctx.globalAlpha=1;}
}

/* ===== night scene ===== */
function drawHouse(x,y,k,lit){const g=ctx,win=lit?'#ffe9a8':'#5a6a7a';
  if(k===0){R(g,x-110,y-70,220,70,3,'#b9a58a');R(g,x-116,y-82,232,14,3,'#7a4a2a');for(let i=0;i<4;i++){R(g,x-98+i*54,y-48,22,48,2,'#5b3a22');R(g,x-70+i*54,y-52,16,16,2,i===1?win:'#5a6a7a');}}
  else if(k===1){R(g,x-80,y-120,160,120,4,'#d9c7a8');R(g,x-86,y-130,172,14,3,'#8a3a1e');for(let r=0;r<2;r++)for(let c=0;c<3;c++)R(g,x-62+c*48,y-108+r*52,28,26,3,r===1&&c===1?'#5b3a22':(c+r)%2?win:'#5a6a7a');}
  else if(k===2){R(g,x-120,y-76,240,76,4,'#f1e2c6');g.fillStyle='#a8431f';g.beginPath();g.moveTo(x-136,y-74);g.lineTo(x,y-128);g.lineTo(x+136,y-74);g.fill();R(g,x-14,y-46,28,46,3,'#5b3a22');R(g,x-92,y-52,44,28,3,win);R(g,x+48,y-52,44,28,3,win);R(g,x-170,y-34,40,34,2,'#8a8a8a');}
  else{R(g,x-140,y-150,280,150,6,'#f4f1ea');R(g,x-150,y-162,300,16,4,'#2b3a55');R(g,x-140,y-80,280,6,0,'#c9b070');for(let r=0;r<2;r++)for(let c=0;c<4;c++)R(g,x-118+c*64,y-138+r*72,40,40,4,win);R(g,x-20,y-56,40,56,5,'#5b3a22');R(g,x-60,y-62,8,62,2,'#e9dcc6');R(g,x+52,y-62,8,62,2,'#e9dcc6');R(g,x-200,y-40,44,40,2,'#3a3a3a');R(g,x+156,y-40,44,40,2,'#3a3a3a');}}
/* ===== menu + loop ===== */
function cardHtml(k){const b=BIZ[k],s=SAVE.biz[k];const lv=s?1+Object.values(s.pads).reduce((a,p)=>a+p.l,0):0;
  return'<button class="card" type="button" data-biz="'+k+'" style="--tone:'+b.tone+'"><canvas width="120" height="120" data-k="'+k+'"></canvas><div><h2>'+b.name+(b.isNew?' <small class="newb">NEW</small>':'')+'</h2><span>'+b.lines.map(l=>l.short).join(', ')+'</span>'+
    (s?'<em>Level '+lv+' · Day '+s.day+' · ₦'+short(Math.floor(s.money))+'</em>':'<em class="new">Start: '+b.lines[0].short+' at ₦'+b.lines[0].price.toLocaleString()+' per '+b.lines[0].unit+'</em>')+'</div></button>';}
function showMenu(){$('cards').innerHTML=Object.keys(BIZ).map(cardHtml).join('');
  document.querySelectorAll('#cards canvas').forEach(c=>{const g=c.getContext('2d'),b=BIZ[c.dataset.k];E(g,60,60,58,58,'#ffe2b8');drawDef(b.lines[0].prod,60,96,3.6,g);});
  document.querySelectorAll('#cards .card').forEach(el=>el.addEventListener('click',()=>enter(el.dataset.biz)));
  $('back').hidden=!G;$('reset').hidden=!G;$('reset').textContent='Restart this business';$('reset').dataset.arm='';$('pick').hidden=false;$('pick').scrollTop=0;}
function enter(k){if(G)save();SAVE.cur=k;const fresh=!SAVE.biz[k];if(fresh)SAVE.biz[k]={money:0,pads:{},day:1,clock:0,till:0,dayEarn:0,daySold:0,sold:0};$('hqp').hidden=true;
  build();save();$('pick').hidden=true;
  toast(fresh?'Welcome to '+B.name+'! Walk into the '+(B.field==='water'?'river':B.field==='yard'||B.field==='port'?'yard':'farm')+', make a circle and come back out.':'Welcome back! Day '+S.day+'.',4.5);}
$('mute').addEventListener('click',()=>{SAVE.snd=(sndLvl()+2)%3;SAVE.sound=!!SAVE.snd;audio();$('mute').textContent=['🔇','🔉','🔊'][sndLvl()];save();});$('mute').textContent=['🔇','🔉','🔊'][sndLvl()];
$('menu').addEventListener('click',()=>{if(G)save();showMenu();});
$('back').addEventListener('click',()=>{$('pick').hidden=true;});
$('reset').addEventListener('click',e=>{const b=e.currentTarget;if(!b.dataset.arm){b.dataset.arm='1';b.textContent='Tap again to wipe '+B.name;return;}delete SAVE.biz[SAVE.cur];const k=SAVE.cur;G=null;enter(k);});
// Main loop. Game time follows the real clock even on a slow phone (several small steps per frame), a crash in one
// frame never stops the next, and the picture gets lighter by itself if the phone cannot keep up.
let last=0,pfT=0,pfN=0,errSeen='';
function frame(t){requestAnimationFrame(frame);const real=Math.min(.25,Math.max(0,(t-last)/1000||0));last=t;
  if(!G||!$('pick').hidden){if(AC&&G)audioTick(0);return;}
  const hq=!$('hqp').hidden;
  try{const n=Math.max(1,Math.min(5,Math.ceil(real/.034))),dt=real/n;for(let k=0;k<n*G.speed&&G;k++)update(dt);if(G){if(hq&&!(G.trip&&G.trip.st!=='tour'))hqTick(real);else draw();}}
  catch(e){const m=String(e&&e.message);if(m!==errSeen){errSeen=m;console.error('Naija Market frame error',e);}}
  if(G&&!hq&&G.speed===1&&!document.hidden){pfT+=real;if(++pfN>=150){const avg=pfT/pfN;pfT=pfN=0;if(avg>.03&&QUAL>.5){QUAL=Math.max(.5,QUAL-.25);resize();}}}}
if(SAVE.cur&&SAVE.biz[SAVE.cur]){build();}
showMenu();requestAnimationFrame(frame);
window.__nmAcct=()=>NM;window.__trk=()=>TRK;window.__nmPerf=()=>({QUAL,DPR,SCALE});window.__nm={get SAVE(){return SAVE},draw,tripStart,tripNext,get G(){return G},get S(){return S},get B(){return B},update,target,visibleSteps,padPos,harvest,lvl,level,enter,get PROG(){return PROG},empItems,empBuy,nightNext,startNight,brDay,expDay,monthDue,payrollList,hqOpen,hqClose,Fu,flag,buyPad,save,get stepGate(){return typeof stepGate==="function"?stepGate:null},get takeLoan(){return takeLoan},get bankOffer(){return bankOffer},get partnerOffer(){return partnerOffer}};
