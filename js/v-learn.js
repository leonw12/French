'use strict';
/* ═════════════ Grammar reference · Translation practice ═════════════ */

/* ───────── Grammar ───────── */
N.gr={sec:0,q:''};
const grData=()=>(window.FR_DATA&&FR_DATA.grammar)||{intro:[],sections:[]};
function grSet(n){N.gr.sec=n;N.gr.q='';rerender();}
function grDone(n){S.gram[n]=!S.gram[n];save();rerender();}
function grErr(i){const a=S.chk.gramerr||(S.chk.gramerr=[]);const j=a.indexOf(i);if(j>=0)a.splice(j,1);else a.push(i);save();rerender();}
const grSearch=debounce(v=>{N.gr.q=v;const el=$('#grbody');if(el)el.innerHTML=grBody();},200);
function grTable(it0){
  const rows=(it0.rows.length&&typeof it0.rows[0]==='string')?[it0.rows]:it0.rows;
  const hdrRow=Array.isArray(it0.hdr)&&it0.hdr.length?(typeof it0.hdr[0]==='string'?it0.hdr:it0.hdr[0]):[];
  const cols=Math.max(...rows.map(r=>r.length),hdrRow.length);
  return `<div class="tbl-wrap"><table class="tbl fr">${hdrRow.length?`<thead><tr>${hdrRow.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead>`:''}<tbody>${rows.map(r=>`<tr>${Array.from({length:cols},(_,i)=>`<td>${esc(r[i]||'').replace(/\n/g,'<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function grItem(it){
  if(it.k==='t')return grTable(it);
  const t=it.t;
  if(/^⚠/.test(t))return `<div class="callout"><i class="ti ti-alert-triangle"></i><div>${esc(t.replace(/^⚠\s*/,'')).replace(/^([A-Za-z][^:]{2,60}:)/,'<b>$1</b>')}</div></div>`;
  if(/^•/.test(t))return `<p style="padding-left:14px;text-indent:-14px">• ${esc(t.replace(/^•\s*/,''))}</p>`;
  return `<p>${esc(t)}</p>`;
}
function grSectionHtml(s){
  return `<div class="row between wrap" style="margin-bottom:8px"><div><div class="eyebrow">Section ${s.n}</div><h2 style="font-size:28px">${esc(s.title)}</h2></div><button class="btn ${S.gram[s.n]?'':'primary'}" onclick="grDone(${s.n})"><i class="ti ${S.gram[s.n]?'ti-check':'ti-circle'}"></i> ${S.gram[s.n]?'Studied':'Mark as studied'}</button></div>
  <div class="prose">${s.subs.map(sb=>`${sb.title?`<h3>${esc(sb.title)}</h3>`:''}${sb.items.map(grItem).join('')}`).join('')}</div>
  <div class="row between" style="margin-top:28px">${s.n>1?`<button class="btn" onclick="grSet(${s.n-1})"><i class="ti ti-arrow-left"></i> Previous</button>`:'<span></span>'}${s.n<grData().sections.length?`<button class="btn primary" onclick="grSet(${s.n+1})">Next <i class="ti ti-arrow-right"></i></button>`:''}</div>`;
}
function grBody(){
  const d=grData(),q=fold(N.gr.q).toLowerCase().trim();
  if(q){
    const hits=[];d.sections.forEach(s=>s.subs.forEach(sb=>sb.items.forEach(it=>{const txt=it.k==='t'?[...it.hdr.flat(),...it.rows.flat()].join(' | '):it.t;if(fold(txt).toLowerCase().includes(q))hits.push({s,sb,it,txt});})));
    return `<p class="muted" style="margin-bottom:10px">${hits.length} match${hits.length===1?'':'es'} for “${esc(N.gr.q)}”</p>${hits.slice(0,40).map(h=>`<div class="card" style="margin-bottom:10px;padding:14px 18px"><div class="row between"><span class="tag">${h.s.n} · ${esc(h.s.title)}${h.sb.title?' › '+esc(h.sb.title):''}</span><button class="btn sm ghost" onclick="grSet(${h.s.n})">Open</button></div>${h.it.k==='t'?grTable({...h.it,rows:h.it.rows.filter(r=>fold(r.join(' ')).toLowerCase().includes(q)).slice(0,6)}):grItem(h.it)}</div>`).join('')}`;
  }
  if(N.gr.sec===0){
    const errs=d.intro.filter(x=>x.k==='p'&&/^•/.test(x.t)).map(x=>x.t.replace(/^•\s*/,'')),lead=d.intro.filter(x=>x.k==='p'&&!/^•/.test(x.t));
    const chk=S.chk.gramerr||[];
    return `${lead.map(x=>`<p class="muted" style="max-width:70ch;margin-bottom:10px">${esc(x.t)}</p>`).join('')}
    <div class="card" style="margin-top:14px"><div class="row between"><h3>⚠ The ten errors that cost the most marks</h3><span class="badge soft">${chk.length}/${errs.length} checked</span></div><p class="muted" style="margin-bottom:8px;font-size:14px">Tick each one when you can spot and fix it in your own writing.</p>
      ${errs.map((e,i)=>`<div class="check ${chk.includes(i)?'on':''}" onclick="grErr(${i})"><div class="bx"><i class="ti ti-check" style="font-size:14px"></i></div><span class="serif" style="font-size:16px">${esc(e)}</span></div>`).join('')}</div>
    <div class="sec-title">Sections</div><div class="grid g-auto">${d.sections.map(s=>`<button class="card link tile" onclick="grSet(${s.n})"><div class="ico serif" style="font-size:20px;font-weight:700">${s.n}</div><div><h4>${esc(s.title)}</h4><p>${s.subs.filter(x=>x.title).slice(0,3).map(x=>esc(x.title)).join(' · ')||'&nbsp;'}</p></div>${S.gram[s.n]?'<i class="ti ti-circle-check" style="color:var(--ok);margin-left:auto;font-size:22px"></i>':''}</button>`).join('')}</div>`;
  }
  const s=d.sections.find(x=>x.n===N.gr.sec);return s?grSectionHtml(s):'';
}
VIEWS.grammar=function(){
  const d=grData(),done=Object.values(S.gram).filter(Boolean).length;
  return ph('Grammar','A complete reference: every tense, pronoun, preposition and exception. Work through one section a night, then write three sentences of your own.',
    `<span class="tag">${done}/${d.sections.length} studied</span>`,'Writing')+`
  <div class="split"><div><div class="search" style="margin-bottom:10px"><i class="ti ti-search"></i><input class="input" placeholder="Search grammar…" value="${ea(N.gr.q)}" oninput="grSearch(this.value)"></div>
    <div class="toc"><button class="${N.gr.sec===0&&!N.gr.q?'on':''}" onclick="grSet(0)"><b>★</b> Overview & top errors</button>${d.sections.map(s=>`<button class="${N.gr.sec===s.n&&!N.gr.q?'on':''}" onclick="grSet(${s.n})"><b>${S.gram[s.n]?'✓':s.n}</b><span>${esc(s.title)}</span></button>`).join('')}</div></div>
  <div id="grbody">${grBody()}</div></div>`;
};

/* ───────── Translation practice ───────── */
N.tr={topic:'all',lvl:0,cur:null,rev:false,list:[]};
const trAll=()=>(window.FR_DATA&&FR_DATA.translations)||[];
const TR_TOPICS=()=>[...new Set(trAll().map(x=>x.topic))];
function trFilter(){return trAll().filter(x=>(N.tr.topic==='all'||x.topic===N.tr.topic)&&(!N.tr.lvl||x.lvl===N.tr.lvl));}
function trSet(k,v){N.tr[k]=v;N.tr.cur=null;rerender();}
function trStart(n){N.tr.cur=n!=null?n:(()=>{const l=trFilter();const un=l.filter(x=>!(S.trans[x.n]&&S.trans[x.n].best>=2));const pool=un.length?un:l;return pool.length?pool[rnd(Math.min(pool.length,8))].n:null;})();N.tr.rev=false;N.tr.val='';rerender();}
function trCheck(){const a=$('#tra');N.tr.val=a?a.value:'';N.tr.rev=true;rerender();}
function trMark(n,v){const t=S.trans[n]||(S.trans[n]={best:0,tries:0});t.tries++;t.last=Date.now();t.best=v===0?Math.max(0,Math.min(t.best,1)):Math.max(t.best,v);if(v===2)t.best=2;S.trans[n]=t;dayObj();save();
  const l=trFilter().filter(x=>x.n!==n&&!(S.trans[x.n]&&S.trans[x.n].best>=2));const nxt=l.length?l[0].n:null;
  if(v<2){const it=trAll().find(x=>x.n===n);if(it&&!BYKEY.get(keyOf(it.fr))){newUserCard({fr:it.fr,en:it.en,th:[it.theme||'general'],ty:['phrase','writing'],tg:['translation']});toast('Saved to flashcards for review');}}
  N.tr.cur=nxt;N.tr.rev=false;N.tr.val='';rerender();}
function trSim(a,b){const x=normAns(a,false),y=normAns(b,false);if(!x)return 0;return 1-lev(x,y)/Math.max(x.length,y.length,1);}
VIEWS.translate=function(){
  const all=trAll(),list=trFilter(),done=all.filter(x=>S.trans[x.n]&&S.trans[x.n].best>=2).length;
  const cur=N.tr.cur!=null?all.find(x=>x.n===N.tr.cur):null;
  const topics=TR_TOPICS();
  const head=ph('Translation practice','150 sentences English → French, graded ★ to ★★★. Write it out first, then check against the key — and mark yourself honestly.',
    `<span class="tag">${done}/${all.length} mastered</span>`,'Writing');
  const filters=`<div class="row wrap" style="margin-bottom:16px"><div class="chips">${chip('All topics',N.tr.topic==='all',"trSet('topic','all')")}${topics.map((t,i)=>chip(esc(t.replace(/^(La |Le |Les |L')/,'').replace(/^./,x=>x.toUpperCase())),N.tr.topic===t,`trSet('topic',TR_TOPICS()[${i}])`,{n:all.filter(x=>x.topic===t).length})).join('')}</div>
    <span class="grow"></span>${seg([[0,'All levels'],[1,'★'],[2,'★★'],[3,'★★★']],N.tr.lvl,"(v=>trSet('lvl',v))")}</div>`;
  if(cur){
    const sim=N.tr.rev?trSim(N.tr.val||'',cur.fr):0;
    return head+filters+`<div class="qcard" style="max-width:820px;margin:0 auto">
      <div class="row between" style="margin-bottom:14px"><span class="tag">${esc(cur.topic)}</span><span class="stars">${'★'.repeat(cur.lvl)}</span></div>
      <div class="en">${esc(cur.en)}</div>
      <textarea id="tra" class="textarea" style="margin-top:18px;font:500 20px/1.5 var(--font-head)" placeholder="Écrivez la phrase en français…" ${N.tr.rev?'disabled':'autofocus'}>${esc(N.tr.val||'')}</textarea>
      ${!N.tr.rev?`<div class="row" style="margin-top:14px"><button class="btn primary" onclick="trCheck()">Check answer</button><button class="btn" onclick="N.tr.val='';trCheck()">Show key</button><span class="grow"></span><button class="btn ghost" onclick="trStart()">Skip</button><button class="btn ghost" onclick="N.tr.cur=null;rerender()">Back to list</button></div>`
      :`<div class="key-reveal">${esc(cur.fr)}<div class="row gap-6" style="margin-top:8px">${iconBtn('ti-volume',`speak(${ea(JSON.stringify(cur.fr))})`,'Listen')}${iconBtn('ti-copy',`copy(${ea(JSON.stringify(cur.fr))})`,'Copy')}</div></div>
        ${N.tr.val?`<div class="diff" style="font-size:19px">${diffHtml(N.tr.val,cur.fr)}</div><p class="muted" style="font-size:13px;margin-top:4px">${Math.round(sim*100)}% match — accents and word order count in the exam, so read it yourself too.</p>`:''}
        <div class="row wrap" style="margin-top:16px"><button class="btn rouge" onclick="trMark(${cur.n},0)">Missed it</button><button class="btn" onclick="trMark(${cur.n},1)" style="border-color:var(--warn);color:var(--warn)">Nearly</button><button class="btn primary" onclick="trMark(${cur.n},2)" style="background:var(--ok);border-color:var(--ok)">Nailed it</button><span class="grow"></span><button class="btn ghost" onclick="N.tr.cur=null;rerender()">Back to list</button></div><p class="faint" style="font-size:12.5px;margin-top:8px">Missed or nearly → saved as a flashcard so it comes back.</p>`}
    </div>`;
  }
  return head+filters+`<div class="row wrap" style="margin-bottom:14px"><button class="btn primary" onclick="trStart()"><i class="ti ti-player-play"></i> Practise ${list.length} sentence${list.length===1?'':'s'}</button><span class="muted" style="font-size:13px">${list.filter(x=>S.trans[x.n]&&S.trans[x.n].best>=2).length} of ${list.length} mastered in this view</span></div>
  <div class="list">${list.map(x=>{const t=S.trans[x.n];const st=t?(t.best>=2?'mature':t.best===1?'young':'learn'):'new';return `<div class="li" style="cursor:pointer" onclick="trStart(${x.n})"><span class="status-dot ${st}"></span><span class="faint mono" style="width:28px;font-size:12px">${x.n}</span><div class="grow"><div class="serif" style="font-size:16.5px;font-weight:600">${esc(x.en)}</div><div class="meta"><span class="tag">${esc(x.topic)}</span></div></div><span class="stars" style="font-size:13px">${'★'.repeat(x.lvl)}</span></div>`;}).join('')}</div>`;
};
