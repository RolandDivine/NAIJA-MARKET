/* ===== Dawnfield Health Group: research rules from plan3/health.json on top of the shop engine =====
   Pharmacy lines (0-2) sell from dated stock: every batch expires 10 game days after it is bought, oldest goes out first,
   price = cost x 1.33 (25% gross margin). Fever is tested before it is treated. Prescriptions need a pharmacist or doctor.
   Health plan claims pay 85% of list, 30-90 days later. Emergencies are always treated, paid or not (Care Fund).
   Doses below are standard ADULT doses, shown as information only. Children: dose by weight.
   Sources (checked Nov 2026):
   - Artemether-lumefantrine 80/480 mg (4 x 20/120 mg tabs) at 0 h, 8 h, then twice daily days 2-3 (6 doses), with food:
     https://drugs.com/pro/coartem.html (label; WHO-prequalified ACT, first line in WHO and Nigerian malaria guidelines)
   - Severe malaria: artesunate 2.4 mg/kg IV/IM at 0, 12, 24 h then daily; at least 24 h, then a full oral ACT course:
     https://severemalaria.org/node/107 (WHO guideline summary)
   - Paracetamol 0.5-1 g every 4-6 h, max 4 g in 24 h: https://www.healthdirect.gov.au/paracetamol
   - ORS for watery diarrhoea, adults drink as much as they want until it stops; zinc is for children (dose by age/weight):
     https://gpnotebook.com/pages/gastroenterology/who-world-health-organisation-suggested-management-of-dehydration-secondary-to-diarrhoeal-illness/treatment-plan-a-management-of-patients-with-no-signs-of-dehydration-who-recommendations
   - Hypertension step 1: amlodipine 5 mg once daily (WHO HEARTS protocol, WHO AFRO):
     https://www.afro.who.int/sites/default/files/2026-02/850_HTN%20Protocol_Poster_Eswatini_Modified_0.pdf
   - Type 2 diabetes: metformin 500 mg once daily for 1 week, then 500 mg twice daily, up to 1 g twice daily; not if eGFR < 30:
     https://www.afro.who.int/sites/default/files/2026-02/851_Diabetes%20Protocol_Poster_Eswatini_Modified.pdf
   - Community-acquired pneumonia (mild/moderate): amoxicillin 1 g every 8 h for 5 days:
     https://africaguidelines.onehealthtrust.org/?p=11107
   - Uncomplicated lower UTI: nitrofurantoin 50 mg every 6 h for 5 days:
     https://africaguidelines.onehealthtrust.org/treatment/adult/urinary-tract-infection
   - Anaphylaxis: adrenaline 500 micrograms IM (0.5 mL of 1 mg/mL, 1:1000), repeat after 5 min if no better (Resuscitation Council UK):
     https://www.medicalert.org.uk/news/recommended-dose-of-adrenaline-for-adults
   - Preventing bleeding after birth: oxytocin 10 IU right after the baby is born (WHO; IV preferred, IM also used):
     https://guidelinecentral.com/guideline/325209/patient-summary/2214781 */
const HCR={exp:10,margin:1.33,test:1500,treat:5000,claim:.85,bed:75000,perNurse:6,care:.02,solar:4500000,cut:.15,
  wing:900000000,wingBeds:40,beds:20,
  pay:{pharm:430000,lab:300000,nurse:250000,doc:860000,surgeon:1300000,officer:180000}, // plan2 staff salaries
  stay:3,erCost:45000,reinsp:100000,clean:150000, // estimates: average ward stay, emergency cost, re-inspection fee, cleaning a month
  orders:[0,10,20,40]}; // estimate: units ordered per night per pharmacy line
const FORM=[
  ['Fever, malaria test positive','Artemether-lumefantrine 80/480 mg','4 tablets (20/120 mg) at once, again after 8 h, then twice a day on days 2 and 3. Take with food.','Coartem label, WHO-prequalified'],
  ['Severe malaria (ward)','Artesunate injection','2.4 mg/kg IV or IM at 0, 12 and 24 h, then daily; after 24 h and when able to swallow, a full ACT course.','WHO, severemalaria.org'],
  ['Pain or fever','Paracetamol','0.5 to 1 g every 4 to 6 hours. No more than 4 g in 24 hours.','healthdirect'],
  ['Watery diarrhoea','Oral rehydration salts','Drink as much as wanted until the diarrhoea stops. Zinc is for children.','WHO Plan A'],
  ['High blood pressure','Amlodipine','5 mg once a day to start (step 1).','WHO HEARTS, WHO AFRO'],
  ['Type 2 diabetes','Metformin','500 mg once a day for a week, then 500 mg twice a day, up to 1 g twice a day. Not if eGFR is under 30.','WHO AFRO protocol'],
  ['Pneumonia, mild to moderate','Amoxicillin','1 g every 8 hours for 5 days.','Africa CDC / One Health Trust'],
  ['Bladder infection (simple UTI)','Nitrofurantoin','50 mg every 6 hours for 5 days.','Africa CDC / One Health Trust'],
  ['Anaphylaxis (emergency)','Adrenaline 1 mg/mL','0.5 mg (0.5 mL) into the thigh muscle; repeat after 5 minutes if no better.','Resuscitation Council UK'],
  ['Bleeding after birth (prevention)','Oxytocin','10 IU right after the baby is born, IV or IM.','WHO']];
const RXCASE=[4,5,6,7],DOCCASE=[6,7,4,5],ERCASE=[8,9,1];
const isHealth=()=>SAVE.cur==='health'&&B&&B.isNew;
function hcState(){const s=S.hc=S.hc||{};const d={trust:50,stock:[[],[],[]],order:[20,20,20],pharm:0,lab:0,nurse:0,doc:0,surgeon:0,officer:false,solar:false,clean:false,wing:false,
    plan:0,claims:[],bounced:[],beds:[],full:0,fund:0,er:0,erFree:0,refer:0,expired:0,spoiled:0,coldOk:true,insp:null,shut:-1,lastInsp:0,cases:[],
    mo:{rev:0,cost:0,exp:0},day:{cost:0},hist:[]};
  for(const k in d)if(s[k]==null)s[k]=JSON.parse(JSON.stringify(d[k]));return s;}
const hcCost=(n,k)=>{const s=S.hc;S.money-=n;s.mo.cost+=n;s.day[k]=(s.day[k]||0)+n;};
const hcBeds=()=>stage()>=3?HCR.beds+(S.hc.wing?HCR.wingBeds:0):0;
const hcOpenBeds=()=>Math.min(hcBeds(),S.hc.nurse*HCR.perNurse);
const hcUnits=i=>S.hc.stock[i].reduce((a,b)=>a+b[1],0);
const hcUnitCost=i=>Math.round((i===1?HCR.treat:B.lines[i].price)/HCR.margin);
const rainy=()=>{const m=Math.floor((S.day-1)/MONTH)%12;return m>=3&&m<=9;}; // April to October
const hcCase=t=>{const s=S.hc;s.cases.unshift(t);if(s.cases.length>4)s.cases.pop();};
function hcTake(i,q){const st=S.hc.stock[i];st.sort((a,b)=>a[0]-b[0]);let got=0;while(got<q&&st.length){const n=Math.min(q-got,st[0][1]);st[0][1]-=n;got+=n;if(!st[0][1])st.shift();}return got;}
const hcRecords=()=>S.hc.officer?96:85; // records score: estimate
function hcInspScore(){const s=S.hc,sales=s.mo.rev||1;return(s.expired/sales<=.05?20:0)+(s.coldOk?20:0)+(!lvl('line2')||s.pharm?20:0)+(hcOpenBeds()>=Math.min(hcBeds(),s.beds.length)?20:0)+(s.clean?20:10);}

/* ----- customers ----- */
function hcDemand(){const s=hcState();return(.6+.8*s.trust/100)*(rainy()?1.1:1);}
function hcLineW(i){const s=hcState();if(s.shut===i)return 0;
  if(i<=2&&hcUnits(i)<=0)return 0;
  if(i===2&&!s.pharm&&!s.doc)return 0; // no stamp, no sale
  if(i===1)return rainy()?1.6:1;
  if(i===3&&(!s.doc||!s.lab))return 0;
  if(i===4&&s.beds.length>=hcOpenBeds())return 0;
  return 1;}
function hcOver(amt,share){const n=Math.round(amt*share);if(n)hcCost(n,'run');} // power, building, equipment, admin
function hcPlanSplit(amt){const s=S.hc;if(!s.wing||!s.plan||Math.random()*100>=s.plan)return amt;
  const due=S.day+30+Math.floor(Math.random()*61)-(s.officer?15:0);s.claims.push({amt:Math.round(amt*HCR.claim),due});return 0;}
function hcSale(i,c,q,amt){const s=hcState(),each=amt/q;let cash=amt;
  if(i===0){const n=hcTake(0,q);cash=Math.round(each*n);if(Math.random()<.3)hcCase(pick([2,3]));hcOver(cash,.12);}
  else if(i===1){cash=0;for(let k=0;k<q;k++){const pos=Math.random()<(rainy()?.6:.35);
      if(pos&&hcTake(1,1)){cash+=HCR.test+HCR.treat;hcCase(0);}else{cash+=HCR.test;if(!pos)s.refer++;}}hcOver(cash,.12);}
  else if(i===2){const n=hcTake(2,q);cash=Math.round(each*n);if(n)hcCase(pick(RXCASE));hcOver(cash,.12);}
  else if(i===3){hcCase(pick(DOCCASE));hcCost(Math.round(amt*.32),'cons');hcOver(amt,.24);cash=hcPlanSplit(amt);}
  else if(i===4){for(let k=0;k<q&&s.beds.length<hcOpenBeds();k++)s.beds.push(S.day+HCR.stay);hcCase(1);cash=0;amt=0;} // paid per night
  s.mo.rev+=cash;s.fund+=Math.round(cash*HCR.care);hcCost(Math.round(cash*HCR.care),'fund');return cash;}

/* ----- night: stock, wards, emergencies, claims, power cuts, inspections ----- */
function hcNight(){if(!isHealth())return[];const s=hcState(),d=S.day,rows=[];
  // expired stock goes to the return bin at full cost
  for(let i=0;i<3;i++){const st=s.stock[i];for(const b of st.filter(b=>b[0]<=d)){const v=b[1]*hcUnitCost(i);s.expired+=v;s.day.exp=(s.day.exp||0)+v;}s.stock[i]=st.filter(b=>b[0]>d);}
  // tonight's orders from licensed wholesalers
  for(let i=0;i<3;i++){if(!(i===0||lvl('line'+i)))continue;const n=HCR.orders[s.order[i]]||0;if(n){hcCost(n*hcUnitCost(i)*(evx('cost_hit')?1.15:1),'stock');s.stock[i].push([d+HCR.exp,n]);}}
  // power cut: fridge stock spoils without solar backup
  if(lvl('line2')&&Math.random()<HCR.cut){if(s.solar)toast('⚡ Power cut. Solar backup kept the medicine fridge cold.',3);
    else{const v=hcUnits(2)*hcUnitCost(2);if(v){s.spoiled+=v;s.coldOk=false;s.stock[2]=[];rows.push(['Fridge stock spoilt in a power cut','-₦'+fmt(v),'#ffb3a3']);toast('⚡ Power cut. The fridge warmed up and its stock spoilt. Solar backup prevents this.',4);}}}
  // wards: income per occupied bed, discharges, occupancy
  if(s.beds.length){let inc=0;for(let k=0;k<s.beds.length;k++)inc+=hcPlanSplit(HCR.bed);hcCost(Math.round(s.beds.length*HCR.bed*.32),'cons');hcOver(s.beds.length*HCR.bed,.24);
    S.money+=inc;S.mo.rev+=inc;s.mo.rev+=inc;if(inc)rows.push(['Ward care, '+s.beds.length+' beds','₦'+fmt(inc),'#b9ffcf']);}
  const out=s.beds.filter(b=>b<=d).length;s.beds=s.beds.filter(b=>b>d);if(out)hcCase(pick([1,6]));
  const open=hcOpenBeds();if(s.beds.length>open)s.beds.length=open;
  if(open&&s.beds.length/open>.9){if(++s.full>=3){s.trust=Math.max(0,s.trust-1);toast('🛏️ Wards over 90% full for 3 days. The team is tired: trust -1.',3);}}else s.full=0;
  if(hcBeds()&&s.nurse*10<s.beds.length){s.trust=Math.max(0,s.trust-3);toast('🩺 Fewer than 1 nurse per 10 patients. Hire nurses (HQ): trust -3.',4);}
  // emergencies: always treated; beyond our skill, stabilise and refer
  const nE=stage()>=3?(Math.random()<.6?1:0)+(Math.random()<.25?1:0):(Math.random()<.15?1:0);
  for(let k=0;k<nE;k++){s.er++;const can=stage()>=3&&Math.random()<.8;hcCase(pick(ERCASE));
    if(!can){s.refer++;s.trust=Math.min(100,s.trust+5);rows.push(['Emergency stabilised and referred','trust +5','#b9ffcf']);continue;}
    if(Math.random()<.3){s.erFree++;const f=Math.min(s.fund,HCR.erCost);s.fund-=f;if(HCR.erCost-f)hcCost(HCR.erCost-f,'er');rows.push(['Emergency treated, paid by Care Fund','₦'+fmt(HCR.erCost),'#ffe08a']);}
    else{S.money+=HCR.erCost;S.mo.rev+=HCR.erCost;s.mo.rev+=HCR.erCost;rows.push(['Emergency treated','₦'+fmt(HCR.erCost),'#b9ffcf']);}
    s.trust=Math.min(100,s.trust+1);}
  // claims land when due; some bounce when records are weak
  let paid=0;for(const c of s.claims.filter(c=>c.due<=d)){if(Math.random()<(hcRecords()>=90?.03:.1))s.bounced.push(c.amt);else paid+=c.amt;}
  s.claims=s.claims.filter(c=>c.due>d);if(evx('bonus_cash')&&s.claims.length){for(const c of s.claims)paid+=c.amt;s.claims=[];}
  if(paid){S.money+=paid;S.mo.rev+=paid;s.mo.rev+=paid;rows.push(['Health plan claims paid','₦'+fmt(paid),'#b9ffcf']);}
  // cash crunch from late claims
  const owed=s.claims.reduce((a,c)=>a+c.amt,0)+s.bounced.reduce((a,b)=>a+b,0);
  if(owed>.6*Math.max(1,s.mo.rev)&&s.mo.rev&&S.money<monthDue(false).wages){s.trust=Math.max(0,s.trust-2);if(d%5===0)toast('💸 Claims owed are high and cash is short of payroll. Fix bounced claims or hire a Claims Officer.',4);}
  if(d-s.lastInsp>=360||(d%MONTH===0&&Math.random()<.1))hcInspect();
  const D=s.day;if(D.stock)rows.push(['Stock from licensed wholesalers','-₦'+fmt(D.stock),'#ffb3a3']);if(D.exp)rows.push(['Expired stock to the return bin','-₦'+fmt(D.exp),'#ffb3a3']);
  if(D.cons)rows.push(['Drips, linen, oxygen, reagents','-₦'+fmt(D.cons),'#ffb3a3']);if(D.run)rows.push(['Power, building, equipment, admin','-₦'+fmt(D.run),'#ffb3a3']);
  if(D.fund)rows.push(['Care Fund (2% of income)','₦'+fmt(D.fund),'#ffe08a']);if(D.er)rows.push(['Emergency care from cash','-₦'+fmt(D.er),'#ffb3a3']);
  s.day={cost:0};return rows;}
function hcInspect(){const s=S.hc,sc=hcInspScore();s.lastInsp=S.day;s.insp={day:S.day,score:sc};
  if(sc>=80){s.shut=-1;s.trust=Math.min(100,s.trust+2);toast('📋 Inspector Halima Sule visited: score '+sc+'. Licence renewed.',4);}
  else if(sc>=60)toast('📋 Inspection score '+sc+': fix the gaps within 3 days.',4);
  else{s.shut=!s.coldOk&&lvl('line3')?3:lvl('line2')?2:1;toast('📋 Inspection score '+sc+': '+B.lines[s.shut].short+' is closed until it is fixed. The emergency bay stays open.',5);}}
function hcMonth(M){if(!isHealth())return{rows:[],cost:0,or:0};const s=hcState(),rows=[];
  if(s.clean){hcCost(HCR.clean,'clean');rows.push(['Cleaning contract','-₦'+fmt(HCR.clean),'#ffb3a3']);}
  if(s.mo.rev&&s.expired>.05*s.mo.rev)toast('📋 Expired stock was over 5% of sales this month. Order smaller batches.',5);
  if(M.short>0){s.trust=Math.max(0,s.trust-2);toast('Staff were paid late. Trust -2.',4);}
  const r=s.mo.rev,cost=s.mo.cost;s.mo={rev:0,cost:0};s.expired=0;s.spoiled=0;s.coldOk=true;if(r)s.hist.push(Math.round((cost+M.wages)/r*100));if(s.hist.length>24)s.hist.shift();
  return{rows,cost,or:s.hist[s.hist.length-1]||0};}
function hcCrew(){if(!isHealth()||!S.hc)return[];const s=S.hc,P=HCR.pay,r=[];
  if(s.pharm)r.push({name:'Pharmacists',n:s.pharm,each:P.pharm});if(s.lab)r.push({name:'Lab scientists',n:s.lab,each:P.lab});
  if(s.nurse)r.push({name:'Nurses',n:s.nurse,each:P.nurse});if(s.doc)r.push({name:'Doctors',n:s.doc,each:P.doc});
  if(s.surgeon)r.push({name:'Consultant surgeons',n:s.surgeon,each:P.surgeon});if(s.officer)r.push({name:'Claims Officer',n:1,each:P.officer});return r;}
function hcGate(st){const s=hcState();
  if(st.base==='venue'&&st.n===1){if(!s.pharm)return'🔒 The Green Cross needs a qualified pharmacist (hire in HQ).';if(hcInspScore()<80)return'🔒 Premises inspection needs 80+ (now '+hcInspScore()+'). Book cleaning in HQ.';}
  if(st.base==='line'&&(st.arg===1||st.arg===2)&&stage()<1)return'🔒 Opens at The Green Cross pharmacy.';
  if(st.base==='venue'&&st.n===2&&(!s.doc||!s.lab))return'🔒 Clinic registration needs a licensed doctor and a lab scientist (HQ).';
  if(st.base==='line'&&st.arg===3&&stage()<2)return'🔒 Opens with the clinic upstairs.';
  if(st.base==='venue'&&st.n===3&&s.nurse<4)return'🔒 20 beds need 1 nurse per 6 beds: hire 4 nurses ('+s.nurse+' now).';
  if(st.base==='line'&&st.arg===4&&stage()<3)return'🔒 Opens with the 20-bed wards.';
  if(st.base==='venue'&&st.n===4){if(!s.wing)return'🔒 Build the Specialist Wing first (HQ).';if(hcRecords()<90)return'🔒 Teaching accreditation needs claims records 90+: hire a Claims Officer.';if(s.trust<70)return'🔒 Needs trust 70+ (now '+s.trust+').';}
  return null;}

/* ----- HQ panel ----- */
function hcHtml(){const s=hcState(),owed=s.claims.reduce((a,c)=>a+c.amt,0),bo=s.bounced.reduce((a,b)=>a+b,0),ob=hcOpenBeds();
  let h='<h2>Dawnfield today</h2><div class="stats"><div class="stat">Trust<b>'+s.trust+' / 100</b></div><div class="stat">Care Fund<b>₦'+fmt(s.fund)+'</b></div><div class="stat">Season<b>'+(rainy()?'🌧️ Rainy':'☀️ Dry')+'</b></div><div class="stat">Inspection<b>'+hcInspScore()+' / 100</b></div></div>';
  h+='<p class="note">Fever is tested first (₦1,500). Positive: about 60% in the rains, 35% in the dry season, then a ₦5,000 treatment pack. Negative: referred to the doctor. Emergencies are always treated, paid or not.'+(s.shut>=0?' ⚠️ '+B.lines[s.shut].short+' is closed after inspection.':'')+'</p>';
  h+='<h2>Medicine shelf</h2><table><tr><td><b>Line</b></td><td><b>Units · oldest expiry</b></td><td><b>Order a night</b></td></tr>';
  for(let i=0;i<3;i++){if(i&&!lvl('line'+i))continue;const st=s.stock[i],old=st.length?Math.min(...st.map(b=>b[0]))-S.day:0;
    h+='<tr><td>'+B.lines[i].short+(i===2?' (fridge)':'')+'</td><td>'+hcUnits(i)+(st.length?' · '+old+' day'+(old===1?'':'s'):'')+'</td><td><div class="seg">'+HCR.orders.map((n,k)=>'<button class="ghost'+(s.order[i]===k?' on':'')+'" data-ho="'+i+'.'+k+'" type="button">'+n+'</button>').join('')+'</div></td></tr>';}
  h+='</table><p class="note">Every batch expires in 10 days; the oldest is sold first. Expired stock goes to the return bin at full cost. Expired this month: ₦'+fmt(s.expired)+'.</p>';
  h+='<h2>Staff and licences</h2><table><tr><td>Pharmacists (₦430k)</td><td>'+s.pharm+'</td></tr><tr><td>Lab scientists (₦300k)</td><td>'+s.lab+'</td></tr><tr><td>Doctors (₦860k)</td><td>'+s.doc+'</td></tr><tr><td>Nurses (₦250k)</td><td>'+s.nurse+'</td></tr>'+(s.wing?'<tr><td>Consultant surgeons (₦1.3m)</td><td>'+s.surgeon+'</td></tr>':'')+'</table><div class="acts">';
  h+='<button class="ghost" data-hc="pharm" type="button">💊 Hire pharmacist</button>';
  if(stage()>=1)h+='<button class="ghost" data-hc="doc" type="button">🩺 Hire doctor</button><button class="ghost" data-hc="lab" type="button">🧪 Hire lab scientist</button>';
  if(stage()>=2)h+='<button class="ghost" data-hc="nurse" type="button">👩🏾‍⚕️ Hire nurse</button>';
  h+='<button class="ghost'+(s.clean?' on':'')+'" data-hc="clean" type="button">🧽 Cleaning contract · ₦150k a month</button>';
  if(lvl('line2')&&!s.solar)h+='<button class="ghost" data-hc="solar" type="button">☀️ Solar backup · ₦4.5m</button>';
  if(s.shut>=0)h+='<button class="ghost" data-hc="reinsp" type="button">📋 Ask for re-inspection · ₦100k</button>';
  h+='</div>';
  if(hcBeds()){h+='<h2>Bed board</h2><div class="stats"><div class="stat">Beds open<b>'+ob+' / '+hcBeds()+'</b></div><div class="stat">Occupied<b>'+s.beds.length+'</b></div><div class="stat">Occupancy<b>'+(ob?Math.round(s.beds.length/ob*100):0)+'%</b></div><div class="stat">Emergencies<b>'+s.er+' ('+s.erFree+' free)</b></div></div><p class="note">Each nurse covers 6 beds. ₦75,000 a bed a night. Aim for 65 to 85% full; over 90% for 3 days tires the team. Referred to partner hospitals: '+s.refer+'.</p>';
    if(!s.wing)h+='<div class="acts"><button class="ghost" data-hc="wing" type="button">🏥 Specialist Wing: theatre, scan, +40 beds · ₦900m</button></div>';}
  if(s.wing){h+='<h2>Claims desk</h2><div class="seg" id="hplan">'+[0,20,40,60].map(p=>'<button class="ghost'+(s.plan===p?' on':'')+'" data-pl="'+p+'" type="button">'+p+'% plan</button>').join('')+'</div>';
    h+='<p class="note">Plan members pay ₦0. Claims pay 85% of list after 30 to 90 days. Records score '+hcRecords()+' ('+(hcRecords()>=90?'3%':'10%')+' bounce). Waiting: ₦'+fmt(owed)+' in '+s.claims.length+' claims. Bounced: ₦'+fmt(bo)+'.</p><div class="acts">';
    if(bo)h+='<button class="ghost" data-hc="fix" type="button">📂 Fix and resubmit bounced claims</button>';
    if(!s.officer)h+='<button class="ghost" data-hc="officer" type="button">🎧 Hire Claims Officer · ₦180k a month</button>';
    h+='<button class="ghost" data-hc="surgeon" type="button">🔪 Hire consultant surgeon</button></div>';}
  if(s.cases.length)h+='<h2>Recent cases</h2><table>'+s.cases.map(k=>'<tr><td>'+FORM[k][0]+'</td><td>'+FORM[k][1]+'</td></tr>').join('')+'</table>';
  h+='<h2>Formulary (adult doses)</h2><table>'+FORM.map(f=>'<tr><td><b>'+f[1]+'</b><br>'+f[0]+'</td><td>'+f[2]+' <i>('+f[3]+')</i></td></tr>').join('')+'</table>';
  h+='<p class="note">Children: dose by weight. For game learning only, not medical advice.</p>';
  return h;}
function hcBind(){if(!isHealth())return;const s=S.hc,re=()=>{save();hqRender();},buy=(n,f)=>{if(S.money<n){toast('You need ₦'+short(n-S.money)+' more.',2);beep(160,.15,'sawtooth',.04);return;}S.money-=n;S.spent=(S.spent||0)+n;f();fanfare(false);re();};
  document.querySelectorAll('#hqin [data-ho]').forEach(b=>b.onclick=()=>{const[i,k]=b.dataset.ho.split('.').map(Number);s.order[i]=k;re();});
  document.querySelectorAll('#hplan [data-pl]').forEach(b=>b.onclick=()=>{s.plan=+b.dataset.pl;re();});
  document.querySelectorAll('#hqin [data-hc]').forEach(b=>b.onclick=()=>{const k=b.dataset.hc;
    if(['pharm','doc','lab','nurse','surgeon'].includes(k)){s[k]++;re();}
    if(k==='officer'){s.officer=true;re();}if(k==='clean'){s.clean=!s.clean;re();}
    if(k==='solar')buy(HCR.solar,()=>{s.solar=true;});if(k==='wing')buy(HCR.wing,()=>{s.wing=true;});
    if(k==='fix'){for(const a of s.bounced)s.claims.push({amt:a,due:S.day+30});s.bounced=[];re();}
    if(k==='reinsp')buy(HCR.reinsp,()=>{hcInspect();});});}

/* ----- drawings: blister pack, drip bag, hospital bed, consulting desk ----- */
XITEM.blister=(g,a,b)=>{R(g,-12,-12,24,12,2,a);for(let i=0;i<4;i++)for(let j=0;j<2;j++)E(g,-8+i*5.4,-8.5+j*5,2,1.8,b);};
XITEM.drip=(g,a,b)=>{R(g,-7,-20,14,16,4,a);R(g,-7,-12,14,3,0,b);R(g,-1,-4,2,4,1,'#9aa4ad');R(g,-5,-22,10,3,1,'#9aa4ad');};
XSTATION.bed=(col)=>{rr(-44,-14,88,18,4,'#d9dde2');rr(-42,-24,84,12,4,'#fff');rr(-42,-24,30,12,4,col);rr(-46,-34,6,40,2,'#7a8590');rr(40,-26,6,32,2,'#7a8590');ell(30,-20,8,5,'#f4f1ea');rr(-30,-46,3,22,1,'#9aa4ad');rr(-36,-48,14,10,3,'#dff3ff');};
XSTATION.consult=(col)=>{rr(-40,-20,80,10,3,'#8a5a2a');rr(-36,-10,6,20,2,'#6b4423');rr(30,-10,6,20,2,'#6b4423');rr(-22,-42,30,22,3,'#22252b');rr(-19,-39,24,15,2,col);ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.beginPath();ctx.arc(22,-26,7,0,3.2);ctx.stroke();ell(22,-19,3,3,'#9aa4ad');};

/* ----- map: chemist shop, test lab, dispensary, clinic rooms, wards and ambulance bay ----- */
function hcStrip(s,f){const li=s.li,x=s.x,w=s.w,y=f.y,h=f.h,T=t=>{ctx.fillStyle='rgba(20,40,30,.6)';ctx.font='900 13px Nunito,system-ui';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+h-16);};
  const cross=(cx,cy,r,c)=>{rr(cx-r/3,cy-r,r*2/3,r*2,2,c);rr(cx-r,cy-r/3,r*2,r*2/3,2,c);};
  if(li===0){rr(x+14,y+12,w-28,100,6,'#f4f1ea');rr(x+10,y+8,w-20,16,4,'#1f8a4c');rr(x+24,y+40,w-48,40,3,'#c9b08a');for(let k=0;k<4;k++)rr(x+30+k*((w-70)/4),y+46,18,12,2,['#e0782a','#2a62c9','#c62828','#f2c230'][k]);cross(x+w-34,y+34,10,'#2ecc71');T("CHEMIST SHOP");}
  else if(li===1){rr(x+12,y+12,w-24,110,6,'#e7f1fb');rr(x+24,y+60,w-48,14,3,'#9aa4ad');for(let k=0;k<5;k++)rr(x+32+k*14,y+44,6,16,2,['#c62828','#7a5af0','#c62828','#2a62c9','#f2c230'][k]);ell(x+w-46,y+44,12,12,'#22252b');ell(x+w-46,y+44,6,6,'#7ad1ff');T('TEST LAB');}
  else if(li===2){rr(x+12,y+12,w-24,110,6,'#f4f1ea');rr(x+20,y+24,40,80,4,'#dfe7ec');rr(x+24,y+30,32,30,3,'#7ad1ff');rr(x+24,y+66,32,30,3,'#7ad1ff');rr(x+70,y+70,w-90,12,3,'#8a5a2a');cross(x+w-36,y+40,11,'#1f8a4c');T('DISPENSARY AND FRIDGE');}
  else if(li===3){for(let k=0;k<2;k++){const bx=x+12+k*(w-24)/2;rr(bx+2,y+12,(w-24)/2-6,104,4,'#eaf4ee');rr(bx+10,y+70,(w-24)/2-24,10,2,'#8a5a2a');rr(bx+(w-24)/4-12,y+92,22,24,2,'#6b4423');}T('CLINIC ROOMS');}
  else{rr(x+12,y+10,w-24,80,6,'#eef3f7');for(let k=0;k<3;k++){const bx=x+22+k*((w-50)/3);rr(bx,y+30,(w-70)/3,22,3,'#fff');rr(bx,y+30,10,22,3,'#2a62c9');}
    ctx.fillStyle='#6f6c66';ctx.fillRect(x+12,y+100,w-24,h-140);ctx.strokeStyle='rgba(255,214,90,.8)';ctx.lineWidth=3;ctx.strokeRect(x+24,y+110,w-48,h-160);
    rr(x+w/2-34,y+118,68,34,6,'#fff');rr(x+w/2-34,y+132,68,6,0,'#c62828');rr(x+w/2+14,y+122,16,14,3,'#7ad1ff');cross(x+w/2-12,y+128,6,'#c62828');ell(x+w/2-20,y+154,6,6,'#22252b');ell(x+w/2+20,y+154,6,6,'#22252b');T('WARDS AND AMBULANCE BAY');}}

BIZ.health={name:'Dawnfield Health Group',tag:'Chemist to teaching hospital',tone:'#1f8a4c',field:'health',isNew:true,qf:300,
  owner:{cloth:'#f4f1ea',trim:'#16a394',hat:'gele',gender:'f'},
  hand:'Store keeper',cook:'pharmacist',seller:'nurse aide',
  outfit:{hand:{cloth:'#1f8a4c',trim:'#f4f1ea',hat:'cap'},cook:{cloth:'#f4f1ea',trim:'#1b2a4a',hat:'none',gender:'f'},server:{cloth:'#7ad1ff',trim:'#f4f1ea',hat:'none',gender:'f'},cashier:{cloth:'#16a394',trim:'#f4f1ea',hat:'none'},porter:{cloth:'#4a6a8a',trim:'#f4f1ea',hat:'cap'}},
  venue:["Aunty's Chemist, Surulere",'The Green Cross pharmacy','Doctor in the House clinic','Lights On All Night, 20 beds','Dawnfield Teaching Hospital'],
  // Research stage startup costs: Green Cross N15m, clinic N60m, 20-bed hospital N250m, teaching hospital N30bn.
  // The Specialist Wing (N900m) is bought in HQ. Abuja and abroad are the engine's branches. Lines are engine-priced.
  costs:{venue:[15000000,60000000,250000000,30000000000],line:[null,null,null,null]},
  lines:[
   Object.assign(L('Home Care Pack','Home care','#1f8a4c',1500,'shelf remedies pack','field',['carton','#c9b08a','#1f8a4c'],['blister','#e9f2ee','#1f8a4c'],'table'),{w:10,qx:3}),
   Object.assign(L('Malaria Test and Care','Malaria','#c62828',6500,'test, then treatment if positive','field',['kit','#dfe7ec','#c62828'],['blister','#fff','#c62828'],'lab'),{w:5,qx:2}),
   Object.assign(L('Prescription Refill','Refill','#2a62c9',6000,'course or monthly refill','field',['pack','#e7f1fb','#2a62c9'],['bottle','#f4f1ea','#2a62c9'],'cooler'),{w:4,qx:2}),
   Object.assign(L('Doctor Visit and Lab Test','Doctor','#7a5af0',15000,'consult and test panel','field',['kit','#e7f1fb','#7a5af0'],['doc','#fffaf0','#7a5af0'],'consult'),{w:2,qx:1}),
   Object.assign(L('Ward Care (per night)','Ward','#16a394',75000,'bed night','field',['drip','#dff3ff','#16a394'],['cloth','#f4f1ea','#7ad1ff'],'bed'),{w:.7,qx:1})]};
BIZX.health={demand:hcDemand,lineW:hcLineW,sale:hcSale,gate:hcGate,html:hcHtml,bind:hcBind,night:hcNight,month:hcMonth,crew:hcCrew,
  strip:hcStrip,base:'#8fb8a0',floor:['#e8e2d4','#eef0ea','#f2f5f2','#f4f7f8','#f8fafb'],locked(){return null;}};
