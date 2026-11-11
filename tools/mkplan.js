const fs=require('fs');const rd=f=>JSON.parse(fs.readFileSync(__dirname+'/../plan/'+f+'.json','utf8'));
const e=rd('econ'),r=rd('roadmap'),biz={};
const ren={basira:'Mrs Bisi',sikira:'Mrs Yetunde',bola:'Mrs Ronke'};
for(const k of ['nkechi','tunde','musa','basira','zainab','chidi','sikira','sani','bola','chinedu']){const b=rd(k);delete b.research;delete b.key;if(ren[k])b.manager.name=ren[k];biz[k]=b;}
const PLAN={econ:{salaries:e.salaries,tax:{gameRate:e.tax.gameRate,label:e.tax.label},payrollShare:e.payrollShare,empire:e.empire},
 road:{regions:r.regions.map(x=>({name:x.name,size:x.size,flag:x.flag,managerTitle:x.managerTitle,cities:x.cities,story:x.story})),commonEvents:r.commonEvents,night:r.night},biz};
fs.writeFileSync(__dirname+'/../src/plan.js','/* ===== generated from plan/*.json by mkplan.js ===== */\nconst PLAN='+JSON.stringify(PLAN)+';\n');
console.log('plan.js',fs.statSync(__dirname+'/../src/plan.js').size);
