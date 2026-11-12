/* ===== Money to grow faster: bank loans, a loan from your own group, and a partner's money =====
   From the research: bank lending near 30% a year (2.5% a month), term 6 months (plan3/bank.json);
   1 point lower when the operating ratio is under 90 (plan3/shipping.json); group loans at 1% a month, at most
   50% of the lending business's cash, term up to 12 months; outside partners may hold at most 49% because the
   owner keeps 51% (plan3/group.json). All of it is game money. */
const FIN={bankRate:.025,goodRate:.29/12,term:6,groupRate:.01,groupTerm:6,maxPartner:49,step:10};
function finState(){const f=S.fin=S.fin||{};if(!f.loans)f.loans=[];if(f.partner==null)f.partner=0;if(f.paidOut==null)f.paidOut=0;if(!f.hist)f.hist=[];return f;}
const lastMonths=n=>finState().hist.slice(-n);
// Operating ratio for any business: (salaries + tax-free running costs) / revenue, month by month.
const orNow=()=>{if(typeof isShip==='function'&&isShip())return ratio();const r=S.mo.rev+S.mo.exp+S.mo.br;return r>0?Math.round(monthDue(false).wages/r*100):0;};
function bankOffer(){const f=finState(),h=lastMonths(3);
  if(f.loans.some(l=>l.kind==='bank'))return{no:'Pay off your current bank loan first.'};
  if(h.length<1)return{no:'The bank wants to see one full month of trading first.'};
  if(h.some(m=>m.or>=95))return{no:'The bank lends when costs stay under 95% of revenue for 3 straight months.'};
  if(h.length<3&&typeof isShip==='function'&&isShip()&&lvl('line2'))return{no:'Truck loans need 3 straight months with the operating ratio under 95.'};
  const last=h[h.length-1],good=h.every(m=>m.or<90);return{amt:nice(Math.max(1e6,last.rev*2)),rate:good?FIN.goodRate:FIN.bankRate,good};}
function groupOffer(){const others=Object.keys(SAVE.biz).filter(k=>k!==SAVE.cur&&k!=='bank'&&SAVE.biz[k].money>0) /* the bank is fenced off */;if(!others.length)return{no:'Open another business first. Your businesses can lend to each other.'};
  const k=others.sort((a,b)=>SAVE.biz[b].money-SAVE.biz[a].money)[0];const amt=nice(SAVE.biz[k].money*.5);return amt>0?{from:k,amt}:{no:'Your other businesses have no spare cash.'};}
function partnerOffer(){const f=finState();if(f.partner>=FIN.maxPartner)return{no:'Partners already hold 49%. You keep 51% control.'};
  const h=lastMonths(12),yr=h.length?h.reduce((a,m)=>a+Math.max(0,m.net),0)*12/h.length:0,worth=Math.max(yr*8,S.spent||0);
  const pct=Math.min(FIN.step,FIN.maxPartner-f.partner);return worth>0?{pct,amt:nice(worth*pct/100),basis:yr*8>=(S.spent||0)?'8 × yearly profit':'what you have put in'}:{no:'Partners invest once you have built something. Buy your first upgrades.'};}
function takeLoan(kind){const f=finState();let o;
  if(kind==='bank'){o=bankOffer();if(o.no)return toast(o.no,3);f.loans.push({kind,amt:o.amt,left:o.amt,rate:o.rate,months:FIN.term,from:'Harmattan Trust Bank'});S.money+=o.amt;}
  if(kind==='group'){o=groupOffer();if(o.no)return toast(o.no,3);SAVE.biz[o.from].money-=o.amt;f.loans.push({kind,amt:o.amt,left:o.amt,rate:FIN.groupRate,months:FIN.groupTerm,from:o.from});S.money+=o.amt;}
  if(kind==='partner'){o=partnerOffer();if(o.no)return toast(o.no,3);f.partner+=o.pct;S.money+=o.amt;}
  fanfare(false);banner(kind==='partner'?'PARTNER IN':'LOAN IN','+₦'+short(o.amt)+' to grow '+B.name);save();hqRender();}
// Month end, after salaries and tax: loan repayments, then the partners' share of what is left.
function finMonth(M){const f=finState(),rows=[];let pay=0;
  for(const l of f.loans){const p=Math.round(l.amt/(l.kind==='bank'?FIN.term:FIN.groupTerm)),i=Math.round(l.left*l.rate),due=Math.min(l.left,p)+i;pay+=due;l.left-=Math.min(l.left,p);l.months--;
    if(l.kind==='group'&&SAVE.biz[l.from])SAVE.biz[l.from].money+=due;}
  f.loans=f.loans.filter(l=>l.left>0);if(pay){S.money-=pay;rows.push(['Loan repayments and interest','-₦'+fmt(pay),'#ffb3a3']);}
  const net=M.net-pay,share=f.partner&&net>0?Math.round(net*f.partner/100):0;if(share){S.money-=share;f.paidOut+=share;rows.push(['Partners\' '+f.partner+'% of profit','-₦'+fmt(share),'#ffb3a3']);}
  f.hist.push({rev:M.rev,net:M.net,or:M.or!=null?M.or:M.rev>0?Math.round((M.rev-M.net)/M.rev*100):100});if(f.hist.length>24)f.hist.shift();return rows;}
function finHtml(){const f=finState(),b=bankOffer(),g=groupOffer(),p=partnerOffer();let h='<h2>Money to grow faster</h2>';
  const card=(k,ico,t,o,txt)=>'<button class="it'+(o.no?' no':'')+'" type="button" data-fin="'+k+'"><i>'+ico+'</i><div><strong>'+t+'</strong><span>'+(o.no||txt)+'</span></div><em>'+(o.no?'—':'+₦'+short(o.amt))+'</em></button>';
  h+=card('bank','🏦','Bank loan, Harmattan Trust Bank',b,b.amt?(Math.round(b.rate*1200*10)/10)+'% a year'+(b.good?' (1 point off: ratio under 90)':'')+', repaid over 6 months at month end.':'');
  h+=card('group','🔁','Loan from your own business',g,g.amt?'From '+(BIZ[g.from]?BIZ[g.from].name:g.from)+': 1% a month, half its cash at most, paid back over 6 months.':'');
  h+=card('partner','🤝','Bring in a partner',p,p.amt?'Sell '+p.pct+'% for ₦'+short(p.amt)+' ('+p.basis+'). Partners take '+(f.partner+p.pct)+'% of monthly profit after loans. You always keep at least 51%.':'');
  if(f.loans.length||f.partner)h+='<table>'+f.loans.map(l=>'<tr><td>'+(l.kind==='bank'?l.from:'Loan from '+(BIZ[l.from]?BIZ[l.from].name:l.from))+'</td><td>₦'+fmt(l.left)+' left</td></tr>').join('')+(f.partner?'<tr><td>Partners own</td><td>'+f.partner+'% (paid ₦'+fmt(f.paidOut)+')</td></tr>':'')+'</table>';
  return h+'<p class="note">All of this is game money. It never leaves Naija Market.</p>';}
function finBind(){document.querySelectorAll('#hqin [data-fin]').forEach(b=>b.onclick=()=>takeLoan(b.dataset.fin));}
