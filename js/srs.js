'use strict';
/* ═════════════ Spaced repetition — FSRS-4.5 memory model + Anki-style learning steps ═════════════
   Card state: st 0=new 1=learning 2=review 3=relearning · d difficulty(1–10) · s stability(days) · due(ms) · lr last review(ms)
   Grades: 1 Again · 2 Hard · 3 Good · 4 Easy                                                          */
const W=[0.4872,1.4003,3.7145,13.8206,5.1618,1.2298,0.8975,0.031,1.6474,0.1367,1.0461,2.2757,0.0959,0.2919,2.3315,0.2192,3.0004];
const DECAY=-0.5,FACTOR=19/81;
const retr=(days,s)=>s>0?Math.pow(1+FACTOR*Math.max(0,days)/s,DECAY):0;                 // probability of recall after `days`
const ivlDays=(s,ret)=>s/FACTOR*(Math.pow(ret,1/DECAY)-1);                              // days until recall drops to `ret`
const clampD=d=>clamp(d,1,10);
const d0=g=>clampD(W[4]-W[5]*(g-3));
const s0=g=>Math.max(0.1,W[g-1]);
const nextD=(d,g)=>clampD(W[7]*d0(4)+(1-W[7])*(d-W[6]*(g-3)));
const sRecall=(d,s,r,g)=>s*(1+Math.exp(W[8])*(11-d)*Math.pow(s,-W[9])*(Math.exp(W[10]*(1-r))-1)*(g===2?W[15]:1)*(g===4?W[16]:1));
const sForget=(d,s,r)=>Math.max(0.1,W[11]*Math.pow(d,-W[12])*(Math.pow(s+1,W[13])-1)*Math.exp(W[14]*(1-r)));

const RATE=[null,{k:'again',l:'Again'},{k:'hard',l:'Hard'},{k:'good',l:'Good'},{k:'easy',l:'Easy'}];
const retention=()=>clamp(S.set.ret||0.9,0.7,0.97);
const maxIvl=()=>S.set.maxIvl||36500;
const steps=(re)=>((re?S.set.relearn:S.set.steps)||[]).filter(x=>x>0);

function reviewIvl(s){return clamp(Math.round(ivlDays(s,retention())),1,maxIvl());}
function fuzz(ivl){
  if(ivl<3)return ivl; const f=ivl<7?0.15:ivl<20?0.1:0.05;
  return clamp(Math.round(ivl*(1+(Math.random()*2-1)*f)),1,maxIvl());
}
/* Pure function: returns the card state after answering with grade g at time `now` (does not mutate). */
function schedule(c,g,now,noFuzz){
  const o={st:c.st,d:c.d,s:c.s,due:c.due,lr:now,rp:c.rp+1,lp:c.lp,sp:c.sp};
  const grad=(s)=>{o.st=2;o.sp=0;o.s=s;let iv=reviewIvl(s);if(!noFuzz)iv=fuzz(iv);o.due=now+iv*DAY;o.iv=iv;};
  if(c.st===0){
    o.d=d0(g);o.s=s0(g);const ls=steps(false);
    if(g===4||!ls.length){grad(o.s);if(g===4&&o.iv<4){o.iv=4;o.due=now+4*DAY;}}
    else if(g===3&&ls.length>1){o.st=1;o.sp=1;o.due=now+ls[1]*MIN;}
    else if(g===3){grad(o.s);}
    else{o.st=1;o.sp=0;o.due=now+(g===2&&ls.length>1?(ls[0]+ls[1])/2:g===2?ls[0]*1.5:ls[0])*MIN;}
    return o;
  }
  if(c.st===1||c.st===3){
    const re=c.st===3,ls=steps(re);
    if(!ls.length){grad(o.s||s0(3));return o;}
    if(g===1){o.sp=0;o.due=now+ls[0]*MIN;}
    else if(g===2){o.due=now+ls[Math.min(c.sp,ls.length-1)]*MIN;}
    else if(g===3){const n=c.sp+1;if(n<ls.length){o.sp=n;o.due=now+ls[n]*MIN;}else grad(o.s);}
    else grad(o.s);
    return o;
  }
  /* review */
  const days=Math.max(0,(now-(c.lr||now))/DAY),r=retr(days,c.s||1);
  o.d=nextD(c.d||5,g);
  if(g===1){
    o.lp=c.lp+1;o.s=sForget(c.d||5,c.s||1,r);const ls=steps(true);
    if(ls.length){o.st=3;o.sp=0;o.due=now+ls[0]*MIN;}else{o.st=2;const iv=1;o.due=now+iv*DAY;o.iv=iv;}
    return o;
  }
  const sH=sRecall(c.d||5,c.s||1,r,2),sG=sRecall(c.d||5,c.s||1,r,3),sE=sRecall(c.d||5,c.s||1,r,4);
  let iH=reviewIvl(sH),iG=reviewIvl(sG),iE=reviewIvl(sE);
  iH=Math.min(iH,iG);iG=Math.max(iG,iH+(iG===iH?1:0));iE=Math.max(iE,iG+1);
  const pickS=g===2?sH:g===3?sG:sE;let iv=g===2?iH:g===3?iG:iE;
  if(!noFuzz)iv=fuzz(iv);iv=clamp(iv,1,maxIvl());
  o.st=2;o.s=pickS;o.iv=iv;o.due=now+iv*DAY;return o;
}
/* Interval previews for the four buttons */
function preview(c,now){
  now=now||Date.now();const out={};
  for(let g=1;g<=4;g++){const o=schedule(c,g,now,true);out[g]={ms:o.due-now,label:fmtIvl(o.due-now),st:o.st};}
  return out;
}
/* Apply an answer to a card, log it, return the undo record */
function answer(c,g,ms){
  const now=Date.now(),before={st:c.st,d:c.d,s:c.s,due:c.due,lr:c.lr,rp:c.rp,lp:c.lp,sp:c.sp,su:c.su,tg:c.tg.slice(),fl:c.fl};
  const wasNew=c.st===0;
  const o=schedule(c,g,now);
  c.st=o.st;c.d=o.d;c.s=o.s;c.due=o.due;c.lr=now;c.rp=o.rp;c.lp=o.lp;c.sp=o.sp;
  let leech=false;
  if(g===1&&c.lp>=(S.set.leech||8)&&c.lp%Math.max(1,S.set.leech||8)===0){leech=true;c.su=true;if(!c.tg.includes('leech'))c.tg=[...c.tg,'leech'];}
  commit(c);
  const day=dayObj();day.r++;if(wasNew)day.nw++;if(g===1)day.ag++;else day.ok++;day.ms+=Math.min(ms||0,60000);
  S.rl.push([now,c.id,g,before.st,Math.round(o.iv!=null?o.iv:(o.due-now)/DAY*100)/100,Math.min(ms||0,60000)]);
  if(S.rl.length>15000)S.rl.splice(0,S.rl.length-15000);
  save();
  return {before,wasNew,leech,gradeLogIdx:S.rl.length-1,day:dayKey(now)};
}
function undo(c,rec,g){
  Object.assign(c,rec.before);commit(c);
  const day=S.days[rec.day];if(day){day.r=Math.max(0,day.r-1);if(rec.wasNew)day.nw=Math.max(0,day.nw-1);if(g===1)day.ag=Math.max(0,day.ag-1);else day.ok=Math.max(0,day.ok-1);}
  S.rl.pop();save();
}
const currentR=(c,now)=>c.st===2||c.st===3||c.st===1?retr(((now||Date.now())-(c.lr||now||Date.now()))/DAY,c.s||1):0;

/* ── Session queue ── */
function matchFilter(c,f){
  if(!f)return true;
  if(f.themes&&f.themes.length&&!(f.all?f.themes.every(t=>c.th.includes(t)):f.themes.some(t=>c.th.includes(t))))return false;
  if(f.types&&f.types.length&&!(f.all?f.types.every(t=>c.ty.includes(t)):f.types.some(t=>c.ty.includes(t))))return false;
  if(f.subs&&f.subs.length&&!f.subs.includes(c.sub))return false;
  if(f.srcs&&f.srcs.length&&!f.srcs.some(s=>c.src.includes(s)))return false;
  if(f.tags&&f.tags.length&&!f.tags.some(t=>c.tg.includes(t)))return false;
  if(f.ids&&!(f._set||(f._set=new Set(f.ids))).has(c.id))return false;
  if(f.minWords&&c.fr.trim().split(/\s+/).length<f.minWords)return false;
  if(f.starred&&!c.sr)return false;
  if(f.flag&&c.fl!==f.flag)return false;
  if(f.q){const q=fold(f.q).toLowerCase().trim();if(q&&!c._q.includes(q))return false;}
  return true;
}
/* ── ordering (smart = weakest first + important words first; can be switched off → fully random) ── */
const orderMode=()=>S.set.order||'smart';
const fh=c=>{const F=freqSet();return keyOf(c.fr).split(' ').some(w=>F.has(w))?0:1;};
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function seededShuffle(arr,seed){const r=mulberry(seed),a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const dayNum=()=>{let h=0;for(const ch of dayKey())h=(h*31+ch.charCodeAt(0))|0;return h;};
const urgency=(c,now)=>{const R=retr((now-(c.lr||now))/DAY,c.s||1);return (1-R)*2+Math.min(c.lp||0,6)*0.18+((c.d||5)-5)*0.05+Math.max(0,(now-c.due)/DAY)*0.02;};
function pickNew(pool,limit,mode,all){
  if(limit<=0)return [];
  if(mode==='random')return shuffle(pool).slice(0,limit);
  if(mode==='curriculum')return pool.slice().sort((a,b)=>a.ix-b.ix).slice(0,limit);
  // smart: finish the most important tier first (advance once ~80% of it has been started), keep sub-sections together
  const seen=[0,0,0,0,0,0],tot=[0,0,0,0,0,0];
  for(const c of all){const t=Math.min(4,c.tier||3);tot[t]++;if(c.st>0||c.su)seen[t]++;}
  let gate=4;for(let t=1;t<=4;t++){if(tot[t]&&seen[t]/tot[t]<0.8){gate=t;break;}}
  const startedKeys=new Set(all.filter(c=>c.st>0).map(c=>c.th[0]+'|'+(c.sub||'')));
  const seed=dayNum(),byTier=[[],[],[],[],[]];pool.forEach(c=>byTier[Math.min(4,c.tier||3)].push(c));
  const out=[];
  for(let t=gate;t<=4&&out.length<limit;t++){
    // group by sub-section: continue sub-sections already in progress first, then a stable per-day order
    const groups=new Map();byTier[t].forEach(c=>{const k=c.th[0]+'|'+(c.sub||'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);});
    const started=k=>startedKeys.has(k)?0:1;
    const avgW=k=>{const g=groups.get(k);return Math.min(4,Math.round(g.reduce((s,c)=>s+c.fr.trim().split(/\s+/).length,0)/g.length));};
    const keys=seededShuffle([...groups.keys()],seed+t).sort((a,b)=>started(a)-started(b)||avgW(a)-avgW(b));
    for(const k of keys){for(const c of groups.get(k).sort((a,b)=>fh(a)-fh(b)||a.ix-b.ix)){out.push(c);if(out.length>=limit)break;}if(out.length>=limit)break;}
  }
  return out.slice(0,limit);
}
function buildQueue(f,opts){
  opts=opts||{};const now=Date.now(),eod=endOfToday(now),day=dayObj(),mode=opts.order||orderMode();
  const live=CARDS.filter(c=>!c.del&&matchFilter(c,f));
  const pool=live.filter(c=>!c.su&&(!c.bu||c.bu<now));
  const learn=pool.filter(c=>(c.st===1||c.st===3)&&c.due<=now+20*MIN).sort((a,b)=>a.due-b.due);
  let rev=pool.filter(c=>c.st===2&&c.due<=eod+(opts.ahead||0)*DAY);
  const revDone=Math.max(0,day.r-day.nw);
  if(mode==='smart')rev.sort((a,b)=>urgency(b,now)-urgency(a,now));else if(mode==='curriculum')rev.sort((a,b)=>a.due-b.due);else rev=shuffle(rev);
  if(!opts.extra)rev=rev.slice(0,Math.max(0,(S.set.maxRev||200)-revDone));
  const nLimit=opts.extra?(opts.newCount||20):Math.max(0,(S.set.maxNew||20)-(day.nw||0));
  const nw=pickNew(pool.filter(c=>c.st===0),nLimit,mode,live);
  if(opts.mode==='weak'){const w=pool.filter(c=>c.st>0).sort((a,b)=>weak(b)-weak(a)).slice(0,opts.count||30);return {learn:[],main:w,counts:{n:0,l:0,r:w.length}};}
  if(opts.mode==='cram'){const cnt=opts.count||50;let all=(mode==='smart'?pool.filter(c=>c.st>0).sort((a,b)=>urgency(b,now)-urgency(a,now)):shuffle(pool.filter(c=>c.st>0))).slice(0,cnt);if(all.length<cnt)all=all.concat(pickNew(pool.filter(c=>c.st===0),cnt-all.length,mode,live));return {learn:[],main:mode==='smart'?all:shuffle(all),cram:true,counts:{n:0,l:0,r:all.length}};}
  // interleave new cards evenly among reviews (weakest reviews stay early in smart mode)
  const main=[],R=rev.length,Nn=nw.length;let ri=0,ni=0;
  while(ri<R||ni<Nn){if(ni<Nn&&(ri>=R||ni*R<=ri*Nn))main.push(nw[ni++]);else main.push(rev[ri++]);}
  const lim=opts.limit||S.set.sessionLen||0;
  return {learn,main:lim?main.slice(0,lim):main,counts:{n:nw.length,l:learn.length,r:rev.length}};
}
const weak=c=>(1-(retr((Date.now()-(c.lr||Date.now()))/DAY,c.s||1)))*3+(c.lp||0)*0.8+(c.d||5)*0.15;
