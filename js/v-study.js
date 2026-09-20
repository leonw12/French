'use strict';
/* ═════════════ Study: setup · session engine · answer modes ═════════════ */
N.sf=N.sf||{};                       // current study filter
N.so=N.so||{kind:'due',count:30};    // study options (kind: due | weak | cram | ahead | extra)
N.sess=null;

const MODES=[['flip','Flip','ti-flip-horizontal'],['type','Type it','ti-keyboard'],['mcq','Multiple choice','ti-list-check'],['listen','Listening','ti-headphones'],['cloze','Cloze','ti-brackets-contain'],['build','Sentence builder','ti-blocks']];
const DIRS=[['FR→EN','FR → EN'],['EN→FR','EN → FR'],['Both','Both ways']];

/* ── entry points ── */
function startStudy(f,opts){ // quick start from anywhere
  N.sf=f||N.sf||{};N.so={...N.so,...(opts||{})};
  if(!opts||!opts.kind)N.so.kind=(opts&&opts.mode)||'due';
  beginSession();
}
function studyFilter(f){N.sf=f;N.sess=null;go('study');}
function beginSession(){
  const o=N.so,f={...(N.sf||{})};if(['cloze','build'].includes(o.mode||S.set.mode))f.minWords=3;
  const opts={mode:o.kind==='weak'?'weak':o.kind==='cram'?'cram':undefined,extra:o.kind==='extra',ahead:o.kind==='ahead'?3:0,newCount:o.newCount||20,count:o.count||30,limit:o.limit};
  const q=buildQueue(f,opts);
  if(!q.main.length&&!q.learn.length){N.sess=null;toast('Nothing to study with these settings — try “Study ahead” or “Cram”.',3200);go('study');return;}
  N.sess={f,opts,learn:q.learn,main:q.main,cram:!!q.cram,stats:{n:0,again:0,hard:0,good:0,easy:0,nw:0,ms:0},undo:[],cur:null,wait:null,shown:false,done:false,total:q.learn.length+q.main.length,start:Date.now(),mode:o.mode||S.set.mode||'flip',dirSet:o.dir||S.set.dir||'FR→EN'};
  advance();go('study');
}
function endSession(){stopSpeak();N.sess=null;go('study');}

/* ── engine ── */
function nextCard(s){
  const now=Date.now();s.learn.sort((a,b)=>a.due-b.due);
  if(s.learn.length&&s.learn[0].due<=now)return s.learn.shift();
  if(s.main.length)return s.main.shift();
  return null;
}
function advance(){
  const s=N.sess;s.shown=false;s.res=null;s.typed='';s.wait=null;s.t0=Date.now();s.reveal=false;
  const c=nextCard(s);
  if(c){s.cur=c;prep(s,c);}
  else if(s.learn.length){s.cur=null;s.wait=s.learn[0];clearTimeout(s._wt);s._wt=setTimeout(()=>{if(N.sess===s&&s.wait){advance();if(N.route==='study')rerender();}},Math.max(500,s.wait.due-Date.now()+50));}
  else{s.cur=null;s.done=true;}
}
function prep(s,c){
  let dir=s.dirSet==='Both'?(Math.random()<.5?'FR→EN':'EN→FR'):s.dirSet;
  let mode=s.mode;
  if(mode==='listen')dir='FR→EN';
  if(mode==='cloze'){const cl=makeCloze(c);if(!cl)mode='flip';else s.cloze=cl;}
  if(mode==='build'){const toks=c.fr.replace(/\s+/g,' ').trim().split(' ');if(toks.length<3||toks.length>14)mode='flip';else{dir='EN→FR';s.build={toks,order:shuffle(toks.map((_,i)=>i)),picked:[]};}}
  if(mode==='mcq')s.choices=makeChoices(c,dir);
  s.cd=dir;s.cm=mode;
  if(S.set.autoSpeak&&dir==='FR→EN'&&mode!=='cloze')setTimeout(()=>speak(c.fr),120);
}
function makeCloze(c){
  const src=c.fr.split(/\s+/);if(src.length<3)return null;
  let best=-1,len=0;src.forEach((w,i)=>{const z=fold(w).replace(/[^a-z]/gi,'');if(z.length>=4&&z.length>len&&!/^(pour|avec|dans|cette|leurs|notre|votre)$/.test(z)){best=i;len=z.length;}});
  if(best<0)return null;
  const word=src[best].replace(/[.,;:!?…()«»"]/g,'');const shown=src.map((w,i)=>i===best?w.replace(word,'_'.repeat(Math.max(3,word.length))):w).join(' ');
  return {word,shown};
}
function makeChoices(c,dir){
  const ans=dir==='FR→EN'?c.en:c.fr;const pool=CARDS.filter(x=>!x.del&&x.id!==c.id&&(x.th.some(t=>c.th.includes(t))||x.ty.some(t=>c.ty.includes(t))));
  const same=pool.filter(x=>x.ty.some(t=>c.ty.includes(t)));const list=shuffle(same.length>=8?same:pool);
  const out=[ans];for(const x of list){const a=dir==='FR→EN'?x.en:x.fr;if(a&&!out.includes(a)&&Math.abs(a.length-ans.length)<Math.max(20,ans.length))out.push(a);if(out.length>=4)break;}
  return shuffle(out).map(t=>({t,ok:t===ans}));
}
function q_(s){return s.cd==='FR→EN'?s.cur.fr:s.cur.en;}
function a_(s){return s.cd==='FR→EN'?s.cur.en:s.cur.fr;}

function reveal(){const s=N.sess;if(!s||!s.cur||s.shown)return;s.shown=true;
  if(s.cm==='listen'||(s.cd==='EN→FR'&&S.set.autoSpeak))speak(s.cur.fr);
  render(false);}
function rate(g){
  const s=N.sess;if(!s||!s.cur||!s.shown)return;
  const c=s.cur,ms=Date.now()-s.t0;let rec=null;
  if(!s.cram)rec=answer(c,g,ms);
  s.undo.push({c,rec,g,cram:s.cram});if(s.undo.length>30)s.undo.shift();
  s.stats.n++;s.stats.ms+=Math.min(ms,60000);if(g===1)s.stats.again++;else if(g===2)s.stats.hard++;else if(g===3)s.stats.good++;else s.stats.easy++;if(rec&&rec.wasNew)s.stats.nw++;
  if(s.cram){if(g===1)s.main.push(c);}
  else if((c.st===1||c.st===3)&&!c.su)s.learn.push(c);
  if(rec&&rec.leech)toast('🩸 Leech — “'+c.fr+'” suspended. Review it in Cards.',3500);
  advance();render(false);
}
function undoRate(){
  const s=N.sess;if(!s||!s.undo.length)return;const u=s.undo.pop();
  if(!u.cram&&u.rec)undo(u.c,u.rec,u.g);
  s.learn=s.learn.filter(x=>x!==u.c);s.main=s.main.filter(x=>x!==u.c||true);
  if(s.cur&&!s.done)s.main.unshift(s.cur);
  s.stats.n--;s.stats.ms-=0;if(u.g===1)s.stats.again--;else if(u.g===2)s.stats.hard--;else if(u.g===3)s.stats.good--;else s.stats.easy--;if(u.rec&&u.rec.wasNew)s.stats.nw--;
  if(u.cram&&u.g===1){const i=s.main.lastIndexOf(u.c);if(i>=0&&s.main[i]===u.c&&s.main.filter(x=>x===u.c).length>1)s.main.splice(i,1);}
  s.done=false;s.cur=u.c;s.wait=null;s.shown=true;s.res=null;s.typed='';s.t0=Date.now();prep(s,u.c);s.shown=true;render(false);toast('Undone');
}
function skipWait(){const s=N.sess;if(!s||!s.wait)return;const c=s.wait;s.learn=s.learn.filter(x=>x!==c);s.cur=c;s.wait=null;s.shown=false;s.t0=Date.now();prep(s,c);render(false);}

/* ── answer checking ── */
const stripArt=s=>s.replace(/^(to|a|an|the|le|la|les|l'|un|une|des|du|de la|de l'|d')\s+/,'');
function normAns(s,strict){let r=String(s||'').toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[.,!?;:"«»…]/g,' ').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();if(!strict)r=fold(r);return stripArt(r);}
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,i)=>i);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[n];}
function checkAnswer(input,answer){
  const strict=S.set.strict,opts=String(answer).split(/\s\/\s|;|\bou\b/).map(x=>x.trim()).filter(Boolean);opts.push(String(answer));
  const ni=normAns(input,strict),ni2=normAns(input,true);let best={ok:false,close:false,accent:false,target:opts[0]};
  if(!ni)return best;
  for(const o of opts){const no=normAns(o,strict);
    if(ni===no)return {ok:true,close:false,accent:normAns(input,true)!==normAns(o,true),target:o};
    if(!strict&&ni2!==normAns(o,true)&&ni===no)return {ok:true,accent:true,target:o};
    const d=lev(ni,no);if(no.length>=4&&d<=Math.max(1,Math.floor(no.length*0.16))){best={ok:false,close:true,accent:false,target:o};}
    if(!best.close&&normAns(answer,strict).includes(ni)&&ni.length>=4&&ni.split(' ').length>=Math.max(1,no.split(' ').length-1)){best={ok:false,close:true,accent:false,target:o};}
  }
  if(!best.ok&&fold(ni)===fold(normAns(opts[0],true)))best.accent=true;
  return best;
}
function diffHtml(input,target){ // LCS-based char highlight of what the user typed
  const a=[...String(input)],b=[...String(target)],m=a.length,n=b.length;const L=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)L[i][j]=a[i].toLowerCase()===b[j].toLowerCase()?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  let i=0,j=0,out='';while(i<m&&j<n){if(a[i].toLowerCase()===b[j].toLowerCase()){out+=`<span class="ok">${esc(a[i])}</span>`;i++;j++;}else if(L[i+1][j]>=L[i][j+1]){out+=`<span class="bad">${esc(a[i])}</span>`;i++;}else j++;}
  while(i<m)out+=`<span class="bad">${esc(a[i++])}</span>`;return out;
}
function submitTyped(){
  const s=N.sess;if(!s||!s.cur||s.shown)return;
  const el=$('#ans');const val=el?el.value:'';s.typed=val;
  const target=s.cm==='cloze'?s.cloze.word:s.cm==='listen'?s.cur.fr:a_(s);
  const r=checkAnswer(val,target);r.input=val;s.res=r;
  s.sug=r.ok?(r.accent?2:3):r.close?2:1;
  s.shown=true;render(false);
}
function pickChoice(i){
  const s=N.sess;if(!s||s.shown)return;const ch=s.choices[i];s.res={ok:ch.ok,chosen:i,input:ch.t};s.sug=ch.ok?3:1;s.shown=true;render(false);
}
function acceptSuggestion(){const s=N.sess;if(s&&s.shown)rate(s.sug||3);}

/* ── card actions during a session ── */
function sessStar(){const c=N.sess&&N.sess.cur;if(!c)return;c.sr=!c.sr;commit(c);rerender();}
function sessFlag(){const c=N.sess&&N.sess.cur;if(!c)return;c.fl=(c.fl+1)%FLAGS.length;commit(c);rerender();}
function sessSuspend(){const s=N.sess,c=s&&s.cur;if(!c)return;c.su=true;commit(c);toast('Suspended');advance();rerender();}
function sessBury(){const s=N.sess,c=s&&s.cur;if(!c)return;c.bu=endOfToday();commit(c);toast('Buried until tomorrow');advance();rerender();}
function sessInfo(){
  const c=N.sess&&N.sess.cur;if(!c)return;
  modal(`<h3>Card info</h3><div class="col gap-8"><div class="serif" style="font-size:22px;font-weight:600">${esc(c.fr)}</div><div class="muted">${esc(c.en)}</div><div class="divider"></div>
  ${[['State',['New','Learning','Review','Relearning'][c.st]],['Reviews',c.rp],['Lapses',c.lp],['Stability',c.s?c.s.toFixed(1)+' days':'—'],['Difficulty',c.d?c.d.toFixed(1)+' / 10':'—'],['Recall now',c.st?Math.round(retr((Date.now()-c.lr)/DAY,c.s)*100)+'%':'—'],['Due',c.st?fmtDate(c.due):'—'],['Source',sourceLabel(c)]].map(r=>`<div class="row between"><span class="muted">${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div><div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn" onclick="closeModal()">Close</button></div>`);
}

/* ── keyboard ── */
document.addEventListener('keydown',e=>{
  if(N.route!=='study'||!N.sess||e.ctrlKey||e.metaKey||e.altKey)return;
  const s=N.sess,tag=(e.target.tagName||'').toLowerCase(),typing=tag==='input'||tag==='textarea'||tag==='select';
  if(!s.cur){if((e.key==='Enter'||e.key===' ')&&s.wait){e.preventDefault();skipWait();}return;}
  if(typing){if(e.target.id==='ans'&&e.key==='Enter'){e.preventDefault();submitTyped();}return;}
  const k=e.key;
  if(k===' '||k==='Enter'){e.preventDefault();if(!s.shown){if(s.cm==='flip')reveal();else if(s.cm==='build')buildCheck();else if(s.cm==='type'||s.cm==='listen'||s.cm==='cloze'){const a=$('#ans');if(a)a.focus();}}else acceptSuggestion();}
  else if(s.shown&&'1234'.includes(k)&&k)rate(+k);
  else if(s.cm==='mcq'&&!s.shown&&'1234'.includes(k)&&k){if(s.choices[+k-1])pickChoice(+k-1);}
  else if(k==='z'||k==='Z')undoRate();
  else if(k==='s')sessStar();else if(k==='f')sessFlag();else if(k==='t')speak(s.cur.fr);
  else if(k==='e'){openEdit(s.cur.id);}else if(k==='b')sessBury();else if(k==='-')sessSuspend();else if(k==='i')sessInfo();
});

/* ═════════ View ═════════ */
VIEWS.study=function(){
  const s=N.sess;
  if(!s)return studySetup();
  if(s.done)return studyDone(s);
  if(s.wait)return studyWait(s);
  return studyCard(s);
};
AFTER.study=function(){const a=$('#ans');if(a&&!N.sess.shown)a.focus();};

function sessCounts(s){
  const all=[...s.main,...s.learn,...(s.cur?[s.cur]:[])];
  const n=all.filter(c=>c.st===0).length;const l=all.filter(c=>c.st===1||c.st===3).length;const r=all.length-n-l;
  return {n,l,r,cur:s.cur?(s.cur.st===0?'n':(s.cur.st===1||s.cur.st===3)?'l':'r'):''};
}
function studyCard(s){
  const c=s.cur,cn=sessCounts(s),pv=(!s.cram)?preview(c):null;
  const q=s.cm==='cloze'?s.cloze.shown:q_(s),theme=THEME[c.th[0]]||THEME.general;
  const dirLabel=s.cm==='cloze'?'Fill the gap':s.cm==='listen'?'Listen & write':s.cd==='FR→EN'?'Français → English':'English → Français';
  const qcls=(q.length>60?'xs':q.length>28?'sm':'');
  const wrong=s.res&&!s.res.ok;
  let front,back='';
  const qHtml=s.cm==='listen'?`<button class="btn lg" style="border-radius:50%;width:88px;height:88px;font-size:36px;padding:0" onclick="speak(N.sess.cur.fr)"><i class="ti ti-volume"></i></button><div class="faint" style="margin-top:12px;font-size:13px">Press <kbd class="mono">T</kbd> to replay · type what you hear</div>`:`<div class="q ${qcls}">${esc(q)}</div>${s.cm==='cloze'?`<div class="muted" style="margin-top:10px;font-size:17px">${esc(c.en)}</div>`:''}`;
  let input='';
  if(!s.shown){
    if(s.cm==='flip')input=`<button class="btn primary lg showbtn" onclick="reveal()">Show answer <span class="faint" style="font-size:12px;opacity:.7">space</span></button>`;
    else if(s.cm==='build')input=buildHtml(s);
    else if(s.cm==='mcq')input=`<div class="mcq">${s.choices.map((o,i)=>`<button onclick="pickChoice(${i})"><span class="faint mono" style="font-size:11px">${i+1}</span> ${esc(o.t)}</button>`).join('')}</div>`;
    else input=`<div class="typebox"><input id="ans" class="input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${s.cm==='cloze'?'Missing word…':s.cm==='listen'?'Type the French you hear…':s.cd==='FR→EN'?'Type the English…':'Tapez en français…'}" ${s.cm==='cloze'?'':''}><div class="row" style="justify-content:center;margin-top:12px;gap:8px"><button class="btn primary" onclick="submitTyped()">Check <span style="opacity:.6;font-size:12px">↵</span></button><button class="btn" onclick="N.sess.res={ok:false,input:''};N.sess.sug=1;N.sess.shown=true;render(false)">I don’t know</button></div></div>`;
    if(s.cm==='cloze')input+=`<div class="hint">${'• '.repeat(Math.min(s.cloze.word.length,14)).trim()}</div>`;
  }else{
    const ans=s.cm==='cloze'?s.cloze.word:s.cm==='listen'?c.fr:a_(s);
    if(s.cm==='mcq'){input=`<div class="mcq">${s.choices.map((o,i)=>`<button class="${o.ok?'ok':(s.res.chosen===i?'bad':'')}" disabled>${esc(o.t)}</button>`).join('')}</div>`;}
    else if(s.cm==='build'){const r=s.res||{};input=(r.input?`<div class="diff">${r.ok?`<span class="ok">${esc(r.input)}</span>`:diffHtml(r.input,c.fr)}</div>`:'')+`<div class="muted" style="margin-top:10px;font-size:13px">${r.ok?'✓ Perfect order':r.close?'≈ Nearly there':'✗ Not quite'}</div>`;}
    else if(s.cm==='type'||s.cm==='listen'||s.cm==='cloze'){
      const r=s.res||{};
      input=r.input?`<div class="diff">${r.ok?`<span class="ok">${esc(r.input)}</span>`:diffHtml(r.input,ans)}</div>`:'';
      input+=`<div class="muted" style="margin-top:10px;font-size:13px">${r.ok?(r.accent?'✓ Correct — watch the accents':'✓ Correct'):r.close?'≈ Almost — small slip':'✗ Not quite'}</div>`;
    }
    const answerShow=s.cm==='cloze'?`<span>${esc(c.fr)}</span>`:s.cm==='listen'?`<span>${esc(c.fr)}</span><div class="muted" style="font-size:19px;margin-top:6px">${esc(c.en)}</div>`:esc(ans);
    back=`<div class="a ${ans.length>34?'sm':''}">${answerShow}</div>${S.set.showEx&&c.ex?`<div class="ex">“${esc(c.ex)}”</div>`:''}${c.nt?`<div class="note">📝 ${esc(c.nt)}</div>`:''}${c.note&&!c.nt?`<div class="note">${esc(c.note)}</div>`:''}`;
  }
  const rates=s.shown?`<div class="rate">${[1,2,3,4].map(g=>`<button class="${RATE[g].k} ${s.sug===g?'sug':''}" onclick="rate(${g})"><span>${RATE[g].l}</span><small>${pv?pv[g].label:(g===1?'again':'')}</small><kbd>${g}</kbd></button>`).join('')}</div>`:'';
  const flag=FLAGS[c.fl];
  return `<div class="study">
    <div class="study-top"><button class="btn icon sm ghost" onclick="confirmBox('End this session? Your answers so far are saved.','endSession()','End session')" aria-label="End"><i class="ti ti-x"></i></button>
      <div class="grow">${bar(pct(s.stats.n,s.stats.n+cn.n+cn.l+cn.r-0),'var(--brand)')}</div>
      <div class="counts"><span class="n ${cn.cur==='n'?'cur':''}" title="New">${cn.n}</span><span class="l ${cn.cur==='l'?'cur':''}" title="Learning">${cn.l}</span><span class="r ${cn.cur==='r'?'cur':''}" title="Review">${cn.r}</span></div></div>
    <div class="fc-wrap"><div class="fc ${wrong?'wrong':s.res&&s.res.ok?'right':''} ${s.shown?'':'enter'}" style="--c:${theme.c}">
      <div class="meta"><span class="dir">${dirLabel}</span><span class="row gap-4">${flag?`<span class="dot" style="background:${flag.c};width:11px;height:11px;border-radius:50%"></span>`:''}${c.sr?'<span style="color:var(--warn)">★</span>':''}${c.st===0?'<span class="tag" style="--c:var(--new)">new</span>':c.lp>2?`<span class="tag">${c.lp} lapses</span>`:''}</span></div>
      ${qHtml}${input}${back}
    </div></div>
    ${rates}
    <div class="tools">${iconBtn('ti-volume','speak(N.sess.cur.fr)','Speak (T)')}${iconBtn(c.sr?'ti-star-filled':'ti-star','sessStar()','Star (S)')}${iconBtn('ti-flag'+(c.fl?'-filled':''),'sessFlag()','Flag (F)')}${iconBtn('ti-pencil','openEdit(N.sess.cur.id)','Edit (E)')}${iconBtn('ti-info-circle','sessInfo()','Info (I)')}${iconBtn('ti-eye-off','sessBury()','Bury until tomorrow (B)')}${iconBtn('ti-player-pause','sessSuspend()','Suspend (-)')}${s.undo.length?iconBtn('ti-arrow-back-up','undoRate()','Undo (Z)'):''}</div>
    <div class="kbd-help"><kbd>Space</kbd> ${s.shown?'good':'show'} · <kbd>1</kbd>–<kbd>4</kbd> rate · <kbd>Z</kbd> undo · <kbd>S</kbd> star · <kbd>T</kbd> speak</div>
  </div>`;
}
function studyWait(s){
  const c=s.wait;
  return `<div class="study"><div class="card center" style="padding:44px 24px"><div class="big" style="font-size:52px">⏳</div><h3 style="font-size:24px;margin:10px 0 6px">Next card in ${fmtIvl(Math.max(0,c.due-Date.now()))}</h3><p class="muted">You’re waiting on learning steps. Take a breath — or go again now.</p>
    <div class="row" style="justify-content:center;margin-top:20px"><button class="btn primary" onclick="skipWait()">Show it now</button><button class="btn" onclick="endSession()">Finish</button></div></div></div>`;
}
function studyDone(s){
  const st=s.stats,acc=pct(st.good+st.easy+st.hard,st.n),tomorrow=CARDS.filter(x=>!x.del&&!x.su&&x.st===2&&x.due<=endOfToday()+DAY&&x.due>endOfToday()).length;
  const left=counts();
  return `<div class="study"><div class="card center" style="padding:40px 26px">
    <div class="summary-ring">${ring(acc,`<div><div style="font-size:28px">${acc}%</div><div class="faint" style="font:600 10px var(--font-body);letter-spacing:.1em">RECALLED</div></div>`,'var(--ok)',132)}</div>
    <h3 style="font-size:28px;margin:18px 0 4px">${st.n?'Bravo !':'Session finished'}</h3><p class="muted">${st.n} card${st.n===1?'':'s'} in ${fmtDur(st.ms)}${st.nw?` · ${st.nw} new`:''}${s.cram?' · cram (schedule unchanged)':''}</p>
    <div class="grid g4" style="margin:22px 0;gap:10px">${[['again','Again',st.again],['hard','Hard',st.hard],['good','Good',st.good],['easy','Easy',st.easy]].map(x=>`<div class="card flat tint" style="padding:12px"><div class="serif" style="font-size:26px;font-weight:600;color:var(--${x[0]==='again'?'rouge':x[0]==='hard'?'warn':x[0]==='good'?'ok':'info'})">${x[2]}</div><div class="faint" style="font-size:12px">${x[1]}</div></div>`).join('')}</div>
    ${tomorrow?`<p class="muted">Tomorrow: ${tomorrow} reviews already scheduled.</p>`:''}
    <div class="row wrap" style="justify-content:center;margin-top:16px">${left.new?`<button class="btn primary" onclick="N.so.kind='extra';N.so.newCount=10;beginSession()">Learn 10 more new cards</button>`:''}<button class="btn" onclick="N.so.kind='cram';beginSession()">Cram this set</button><button class="btn" onclick="endSession();go('home')">Home</button></div>
  </div></div>`;
}

/* ── setup screen ── */
function sfToggle(k,v){const f=N.sf=N.sf||{};const a=f[k]||(f[k]=[]);const i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);if(!a.length)delete f[k];rerender();}
function sfSet(k,v){if(v===false||v==null||v==='')delete N.sf[k];else N.sf[k]=v;rerender();}
function soSet(k,v){N.so[k]=v;if(k==='mode'||k==='dir'||k==='order'){S.set[k]=v;save();}rerender();}
function studySetup(){
  const f0=N.sf=N.sf||{},o=N.so,kind=o.kind||'due';const f=['cloze','build'].includes(o.mode||S.set.mode)?{...f0,minWords:3}:f0;
  const opts={mode:kind==='weak'?'weak':kind==='cram'?'cram':undefined,extra:kind==='extra',ahead:kind==='ahead'?3:0,newCount:o.newCount||20,count:o.count||30};
  const q=buildQueue(f,opts),tot=q.main.length+q.learn.length;
  const tcount=id=>CARDS.filter(c=>!c.del&&c.th.includes(id)).length,ycount=id=>CARDS.filter(c=>!c.del&&c.ty.includes(id)).length;
  const kinds=[['due','Due today','ti-calendar-due'],['ahead','Study ahead','ti-calendar-plus'],['weak','Weak spots','ti-flame'],['cram','Cram (no scheduling)','ti-bolt'],['extra','Extra new cards','ti-sparkles']];
  const active=Object.keys(f).length;
  return ph('Study','Pick what to practise. Everything here follows one memory model — the app decides when each card comes back.',
    `<button class="btn primary lg" onclick="beginSession()" ${tot?'':'disabled'}><i class="ti ti-player-play-filled"></i> Start ${tot?`(${tot})`:''}</button>`,'Study session')+`
  <div class="grid g2" style="align-items:start">
    <div class="col gap-16">
      <div class="card"><h3>What to study</h3><div class="chips">${kinds.map(k=>chip(`<i class="ti ${k[2]}"></i> ${k[1]}`,kind===k[0],`soSet('kind','${k[0]}')`)).join('')}</div>
        <p class="muted" style="margin-top:12px;font-size:13.5px">${{due:'Reviews that are due plus today’s share of new cards ('+(S.set.maxNew||20)+'/day).',ahead:'Also pulls in reviews due over the next 3 days — no penalty to your schedule.',weak:'Cards with the most lapses and hardest difficulty, ignoring the schedule.',cram:'Random drill of cards you’ve already seen. Does not change intervals.',extra:'Introduce more new cards beyond today’s limit.'}[kind]}</p>
        ${kind==='extra'?`<div class="row" style="margin-top:8px"><span class="muted">New cards:</span>${seg([5,10,20,40],o.newCount||20,"(v=>soSet('newCount',v))")}</div>`:''}
        ${kind==='weak'||kind==='cram'?`<div class="row" style="margin-top:8px"><span class="muted">How many:</span>${seg([15,30,50,100],o.count||30,"(v=>soSet('count',v))")}</div>`:''}</div>
      <div class="card"><h3>How</h3>
        <label class="lbl">Answer mode</label><div class="chips" style="margin-bottom:14px">${MODES.map(m=>chip(`<i class="ti ${m[2]}"></i> ${m[1]}`,(o.mode||S.set.mode)===m[0],`soSet('mode','${m[0]}')`)).join('')}</div>
        <label class="lbl">Direction</label>${seg(DIRS,o.dir||S.set.dir,"(v=>soSet('dir',v))")}
        <label class="lbl" style="margin-top:14px">Card order</label>${seg([['smart','Smart'],['curriculum','In order'],['random','Random']],S.set.order||'smart',"(v=>soSet('order',v))")}<p class="faint" style="font-size:12.5px;margin:6px 0 0">${{smart:'Struggling cards come first, and the most useful words are introduced before rarer ones.',curriculum:'New cards in the order of your lists.',random:'Completely shuffled.'}[S.set.order||'smart']}</p>
        <label class="lbl" style="margin-top:14px">Session length</label>${seg([[0,'All'],[10,'10'],[25,'25'],[50,'50']],o.limit||0,"(v=>soSet('limit',v))")}
      </div>
    </div>
    <div class="card"><div class="row between"><h3>Filter <span class="faint" style="font-weight:400;font-size:14px">${active?'· '+active+' active':'· everything'}</span></h3>${active?`<button class="btn sm ghost" onclick="N.sf={};rerender()">Clear</button>`:''}</div>
      <label class="lbl">Themes</label><div class="chips" style="margin-bottom:14px">${liveThemes().map(t=>chip(`${t.icon} ${t.short}`,(f.themes||[]).includes(t.id),`sfToggle('themes','${t.id}')`,{n:tcount(t.id)})).join('')}</div>
      <label class="lbl">Categories</label><div class="chips" style="margin-bottom:14px">${TYPES.map(t=>chip(t.name,(f.types||[]).includes(t.id),`sfToggle('types','${t.id}')`,{n:ycount(t.id)})).join('')}</div>
      <div class="row wrap"><span class="row"><span class="muted" style="font-size:13px">Match all selected</span>${switchBtn(f.all,`sfSet('all',${!f.all})`)}</span><span class="row"><span class="muted" style="font-size:13px">★ Starred</span>${switchBtn(f.starred,`sfSet('starred',${!f.starred})`)}</span></div>
      <div class="divider"></div><div class="row between"><span class="muted">In this session</span><b class="serif" style="font-size:22px">${q.counts.n} new · ${q.counts.l} learning · ${q.counts.r} review</b></div>
      ${!tot?`<p class="muted" style="margin-top:10px">Nothing matches. ${kind==='due'?'You’re done for today — try “Study ahead” or “Cram”.':''}</p>`:''}
    </div>
  </div>`;
}
