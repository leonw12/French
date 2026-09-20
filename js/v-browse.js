'use strict';
/* ═════════════ Browse: multi-category filtering · bulk actions · add/edit ═════════════ */
N.b={q:'',themes:[],types:[],subs:[],srcs:[],tags:[],all:false,status:'all',flag:0,sort:'default',group:'none',limit:60,sel:{}};
const STATUSES=[['all','All'],['new','New'],['learn','Learning'],['due','Due'],['young','Young'],['mature','Mature'],['starred','★ Starred'],['susp','Suspended'],['leech','Leech'],['flagged','Flagged'],['mine','My cards'],['trash','Trash']];
const SORTS=[['default','Curriculum order'],['az','A → Z'],['recent','Recently added'],['due','Due soonest'],['hard','Hardest first'],['stab','Weakest memory']];
const GROUPS=[['none','No grouping'],['theme','By theme'],['sub','By sub-section'],['type','By category']];

function browseWith(f){N.b={...N.b,q:'',themes:[],types:[],subs:[],srcs:[],tags:[],status:'all',flag:0,sel:{},limit:60,...f};go('browse');}
function bfilter(){
  const b=N.b,now=Date.now(),eod=endOfToday(now);
  const q=fold(b.q).toLowerCase().trim();
  let out=CARDS.filter(c=>{
    if(b.status==='trash'){if(c.del!==1)return false;}else if(c.del)return false;
    if(b.themes.length&&!(b.all?b.themes.every(t=>c.th.includes(t)):b.themes.some(t=>c.th.includes(t))))return false;
    if(b.types.length&&!(b.all?b.types.every(t=>c.ty.includes(t)):b.types.some(t=>c.ty.includes(t))))return false;
    if(b.subs.length&&!b.subs.includes(c.sub))return false;
    if(b.srcs.length&&!b.srcs.some(s=>c.src.includes(s)))return false;
    if(b.tags.length&&!b.tags.some(t=>c.tg.includes(t)))return false;
    if(b.flag&&c.fl!==b.flag)return false;
    switch(b.status){case 'new':if(c.st!==0||c.su)return false;break;case 'learn':if(!(c.st===1||c.st===3)||c.su)return false;break;
      case 'due':if(c.su||!(c.st===2?c.due<=eod:(c.st===1||c.st===3)&&c.due<=now+20*MIN))return false;break;
      case 'young':if(c.su||!(c.st===2&&c.s<21))return false;break;case 'mature':if(c.su||!(c.st===2&&c.s>=21))return false;break;
      case 'starred':if(!c.sr)return false;break;case 'susp':if(!c.su)return false;break;case 'leech':if(!c.tg.includes('leech'))return false;break;
      case 'flagged':if(!c.fl)return false;break;case 'mine':if(!c.user)return false;break;}
    if(q&&!c._q.includes(q))return false;
    return true;
  });
  const cmp={az:(a,b)=>fold(a.fr).localeCompare(fold(b.fr)),recent:(a,b)=>(b.ad||0)-(a.ad||0),due:(a,b)=>(a.st?a.due:9e15)-(b.st?b.due:9e15),hard:(a,b)=>(b.lp*2+b.d)-(a.lp*2+a.d),stab:(a,b)=>(a.st?a.s:9e9)-(b.st?b.s:9e9)}[b.sort];
  if(cmp)out=out.slice().sort(cmp);
  return out;
}
function bChipCount(kind,id){ // count of live cards for a chip, respecting the OTHER active filters
  const b=N.b,keep={...b};keep[kind]=[];const save_=N.b;N.b=keep;const n=bfilterCount(kind,id);N.b=save_;return n;
}
function bfilterCount(kind,id){
  const list=bfilter();return list.filter(c=>kind==='themes'?c.th.includes(id):kind==='types'?c.ty.includes(id):kind==='srcs'?c.src.includes(id):c.sub===id).length;
}
function bt(kind,v){const a=N.b[kind],i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);if(kind==='themes')N.b.subs=[];N.b.limit=60;rerender();}
function bset(k,v){N.b[k]=v;N.b.limit=60;if(k!=='status'||true)N.b.sel={};rerender();}
function bClear(){N.b={...N.b,q:'',themes:[],types:[],subs:[],srcs:[],tags:[],status:'all',flag:0,sel:{},limit:60};rerender();}
const bSearch=debounce(v=>{N.b.q=v;N.b.limit=60;bResults();},160);
function bMore(){N.b.limit+=120;bResults();}

VIEWS.browse=function(){
  const b=N.b,live=CARDS.filter(c=>!c.del),active=b.themes.length+b.types.length+b.subs.length+b.srcs.length+b.tags.length+(b.status!=='all'?1:0)+(b.flag?1:0)+(b.q?1:0);
  // sub-section chips for the chosen themes
  let subChips='';
  if(b.themes.length){const subs={};live.filter(c=>c.th.some(t=>b.themes.includes(t))&&c.sub).forEach(c=>subs[c.sub]=(subs[c.sub]||0)+1);
    const keys=Object.keys(subs).slice(0,60);if(keys.length)subChips=`<div class="chips" style="margin-top:8px">${keys.map(s=>chip(esc(s),b.subs.includes(s),`bt('subs','${ea(s).replace(/&#39;/g,"\\'")}')`,{n:subs[s]})).join('')}</div>`;}
  const allTags=[...new Set(live.flatMap(c=>c.tg))].sort();
  return ph('Cards & vocabulary',`${live.length.toLocaleString()} cards. A word can live in several themes and categories at once — filter by any combination.`,
    `<button class="btn" onclick="openAdd()"><i class="ti ti-plus"></i> New card</button><button class="btn primary" onclick="studyResults()"><i class="ti ti-player-play-filled"></i> Study these</button>`,'Library')+`
  <div class="filterbar">
    <div class="row wrap" style="margin-bottom:10px"><div class="search grow" style="min-width:220px"><i class="ti ti-search"></i><input class="input" id="bq" placeholder="Search French, English, examples, tags…" value="${ea(b.q)}" oninput="bSearch(this.value)"></div>
      <select class="select" style="width:auto" onchange="bset('sort',this.value)">${SORTS.map(s=>`<option value="${s[0]}" ${b.sort===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select>
      <select class="select" style="width:auto" onchange="bset('group',this.value)">${GROUPS.map(s=>`<option value="${s[0]}" ${b.group===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></div>
    <div class="chips" style="margin-bottom:8px">${STATUSES.map(s=>chip(s[1],b.status===s[0],`bset('status','${s[0]}')`)).join('')}</div>
  </div>
  <div class="card" style="padding:16px">
    <div class="row between" style="margin-bottom:8px"><label class="lbl" style="margin:0">Themes</label><span class="row"><span class="muted" style="font-size:12.5px">Match all</span>${switchBtn(b.all,`bset('all',${!b.all})`)}${active?`<button class="btn sm ghost" onclick="bClear()">Clear filters</button>`:''}</span></div>
    <div class="chips">${liveThemes().map(t=>chip(`${t.icon} ${t.short}`,b.themes.includes(t.id),`bt('themes','${t.id}')`,{n:bChipCount('themes',t.id)})).join('')}</div>${subChips}
    <label class="lbl" style="margin:16px 0 8px">Categories</label>
    <div class="chips">${TYPES.map(t=>chip(t.name,b.types.includes(t.id),`bt('types','${t.id}')`,{n:bChipCount('types',t.id)})).join('')}</div>
    <details style="margin-top:12px"><summary class="muted" style="cursor:pointer;font-size:13px">More filters — source, flags, tags</summary><div style="margin-top:10px"><div class="chips" style="margin-bottom:10px">${Object.keys(SRC).map(s=>chip(SRC[s],b.srcs.includes(s),`bt('srcs','${s}')`,{n:bChipCount('srcs',s)})).join('')}</div>
    <div class="chips" style="margin-bottom:10px">${FLAGS.slice(1).map((f,i)=>chip(f.n,b.flag===i+1,`bset('flag',${b.flag===i+1?0:i+1})`,{dot:f.c})).join('')}</div>${allTags.length?`<div class="chips">${allTags.slice(0,40).map(t=>chip('#'+esc(t),b.tags.includes(t),`bt('tags','${ea(t)}')`)).join('')}</div>`:''}</div></details>
  </div>
  <div id="bres" style="margin-top:16px">${bResultsHtml()}</div>`;
};
function bResults(){const el=$('#bres');if(el)el.innerHTML=bResultsHtml();}
function bResultsHtml(){
  const b=N.b,list=bfilter(),show=list.slice(0,b.limit),nsel=Object.keys(b.sel).length;
  if(!list.length)return empty('🔍','Nothing matches','Try clearing a filter or searching a different word.',`<button class="btn" onclick="bClear()">Clear filters</button>`);
  const groups=[];
  if(b.group==='none')groups.push([null,show]);
  else{const m=new Map();for(const c of show){const keys=b.group==='theme'?(c.th.length?[c.th[0]]:['general']):b.group==='type'?[c.ty[0]||'vocab']:[c.sub||'—'];for(const k of keys){if(!m.has(k))m.set(k,[]);m.get(k).push(c);}}for(const [k,v] of m)groups.push([k,v]);}
  const gLabel=k=>b.group==='theme'?`${THEME[k]?THEME[k].icon+' '+THEME[k].name:k}`:b.group==='type'?(TYPE[k]?TYPE[k].name:k):k;
  const html=groups.map(([k,cs])=>(k!=null?`<div class="group-h">${esc(gLabel(k))} <span class="badge soft">${cs.length}</span></div>`:'')+cs.map(rowHtml).join('')).join('');
  return `<div class="row between" style="margin-bottom:8px"><span class="muted" style="font-size:13.5px"><b>${list.length.toLocaleString()}</b> card${list.length===1?'':'s'}${list.length>show.length?` · showing ${show.length}`:''}</span><span class="row gap-6"><button class="btn sm ghost" onclick="bSelAll()">${nsel?'Deselect':'Select all'}</button></span></div>
    <div class="list">${html}</div>${list.length>show.length?`<div class="center" style="margin-top:14px"><button class="btn" onclick="bMore()">Show more (${list.length-show.length} left)</button></div>`:''}
    ${nsel?bulkBar(nsel):''}`;
}
function rowHtml(c){
  const dot=`<span class="status-dot ${cstat(c)}" title="${cstat(c)}"></span>`;
  const ths=c.th.slice(0,3).map(tagTheme).join(''),tys=c.ty.filter(t=>t!=='writing').slice(0,3).map(tagType).join('');
  const f=FLAGS[c.fl];
  return `<div class="li ${c.su?'susp':''}"><input type="checkbox" ${N.b.sel[c.id]?'checked':''} onchange="bSel('${c.id}',this.checked)">${dot}
    <div class="grow"><div class="row gap-8 wrap"><span class="fr">${esc(c.fr)}</span>${c.sr?'<span style="color:var(--warn)">★</span>':''}${f?`<span style="color:${f.c}">⚑</span>`:''}</div><div class="en">${esc(c.en)}</div>
      <div class="meta">${ths}${tys}${c.sub?`<span class="tag">${esc(c.sub)}</span>`:''}${c.tg.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>${c.ex?`<div class="faint" style="font-size:12.5px;margin-top:4px;font-style:italic">“${esc(c.ex)}”</div>`:''}</div>
    <div class="acts">${iconBtn('ti-volume',`speak(BYID.get('${c.id}').fr)`,'Speak')}${iconBtn(c.sr?'ti-star-filled':'ti-star',`bStar('${c.id}')`,'Star')}${iconBtn('ti-pencil',`openEdit('${c.id}')`,'Edit')}${c.del?iconBtn('ti-arrow-back-up',`bRestore('${c.id}')`,'Restore'):iconBtn('ti-trash',`bTrash('${c.id}')`,'Trash')}</div></div>`;
}
function bSel(id,on){if(on)N.b.sel[id]=1;else delete N.b.sel[id];const el=$('#bres');if(el)bResults();}
function bSelAll(){if(Object.keys(N.b.sel).length)N.b.sel={};else bfilter().forEach(c=>N.b.sel[c.id]=1);bResults();}
function bStar(id){const c=BYID.get(id);c.sr=!c.sr;commit(c);bResults();}
function bTrash(id){const c=BYID.get(id);trashCard(c);bResults();toast('Moved to trash');}
function bRestore(id){restoreCard(BYID.get(id));bResults();toast('Restored');}
function selCards(){return Object.keys(N.b.sel).map(id=>BYID.get(id)).filter(Boolean);}
function bulkBar(n){
  return `<div class="bulk"><b>${n} selected</b><span class="grow"></span>
    <button class="btn sm" onclick="bulkStudy()"><i class="ti ti-player-play"></i> Study</button><button class="btn sm" onclick="bulk('star')">★ Star</button><button class="btn sm" onclick="bulk('susp')">Suspend</button><button class="btn sm" onclick="bulk('unsusp')">Unsuspend</button>
    <button class="btn sm" onclick="bulkTag()"># Tag</button><button class="btn sm" onclick="bulkMove()">Move / add to…</button><button class="btn sm" onclick="bulk('reset')">Reset progress</button><button class="btn sm" onclick="bulk('${N.b.status==='trash'?'restore':'trash'}')">${N.b.status==='trash'?'Restore':'Trash'}</button></div>`;
}
function bulk(a){
  const cs=selCards();if(!cs.length)return;
  cs.forEach(c=>{
    if(a==='star')c.sr=true;else if(a==='susp')c.su=true;else if(a==='unsusp')c.su=false;else if(a==='trash')c.del=1;else if(a==='restore')c.del=0;
    else if(a==='reset'){c.st=0;c.d=0;c.s=0;c.due=0;c.lr=0;c.rp=0;c.lp=0;c.sp=0;}
    commit(c);
  });
  toast(cs.length+' card'+(cs.length===1?'':'s')+' updated');N.b.sel={};bResults();
}
function bulkStudy(){N.sf={ids:selCards().map(c=>c.id)};N.so={...N.so,kind:'cram',count:200};N.sess=null;go('study');}
function bulkTag(){modal(`<h3>Add a tag</h3><input id="btag" class="input" placeholder="e.g. exam-week, hard, unit-3" autofocus><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="bulkTagGo()">Add tag</button></div>`);}
function bulkTagGo(){const t=(($('#btag')||{}).value||'').trim().replace(/^#/,'').toLowerCase();if(!t)return;selCards().forEach(c=>{if(!c.tg.includes(t)){c.tg=[...c.tg,t];commit(c);}});closeModal();toast('Tagged #'+t);bResults();}
function bulkMove(){
  modal(`<h3>Add selected cards to…</h3><label class="lbl">Themes</label><div class="chips" id="mvth" style="margin-bottom:14px">${THEMES.map(t=>`<button class="chip" data-v="${t.id}" onclick="this.classList.toggle('on')">${t.icon} ${t.short}</button>`).join('')}</div>
   <label class="lbl">Categories</label><div class="chips" id="mvty">${TYPES.map(t=>`<button class="chip" data-v="${t.id}" onclick="this.classList.toggle('on')">${t.name}</button>`).join('')}</div>
   <div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="bulkMoveGo()">Add</button></div>`);
}
function bulkMoveGo(){
  const th=$$('#mvth .on').map(x=>x.dataset.v),ty=$$('#mvty .on').map(x=>x.dataset.v);
  selCards().forEach(c=>{const nth=[...new Set([...c.th,...th])],nty=[...new Set([...c.ty,...ty])];editCard(c,{th:nth,ty:nty});});
  closeModal();toast('Updated');bResults();
}
function studyResults(){
  const b=N.b;if(b.status!=='all'||b.flag||b.srcs.length){N.sf={ids:bfilter().map(c=>c.id)};}
  else N.sf={themes:b.themes.slice(),types:b.types.slice(),subs:b.subs.slice(),tags:b.tags.slice(),all:b.all,q:b.q};
  N.sf=Object.fromEntries(Object.entries(N.sf).filter(([k,v])=>v&&(!Array.isArray(v)||v.length)));
  N.sess=null;go('study');
}

/* ── Add / edit modal ── */
function cardForm(c){
  const th=c?c.th:[],ty=c?c.ty:['vocab'];
  return `<div class="col gap-8">
    <div class="grid g2" style="gap:10px"><div><label class="lbl">Français</label><input id="cf_fr" class="input" value="${ea(c?c.fr:'')}" autofocus></div><div><label class="lbl">English</label><input id="cf_en" class="input" value="${ea(c?c.en:'')}"></div></div>
    <div><label class="lbl">Example sentence <span class="faint">(optional)</span></label><input id="cf_ex" class="input" value="${ea(c?c.ex:'')}" placeholder="Une phrase où ce mot apparaît…"></div>
    <div class="grid g2" style="gap:10px"><div><label class="lbl">Notes / mnemonic</label><input id="cf_nt" class="input" value="${ea(c?c.nt:'')}"></div><div><label class="lbl">Tags <span class="faint">(comma separated)</span></label><input id="cf_tg" class="input" value="${ea(c?c.tg.join(', '):'')}"></div></div>
    <div><label class="lbl">Themes</label><div class="chips" id="cf_th">${THEMES.map(t=>`<button type="button" class="chip ${th.includes(t.id)?'on':''}" data-v="${t.id}" onclick="this.classList.toggle('on')">${t.icon} ${t.short}</button>`).join('')}</div></div>
    <div><label class="lbl">Categories</label><div class="chips" id="cf_ty">${TYPES.map(t=>`<button type="button" class="chip ${ty.includes(t.id)?'on':''}" data-v="${t.id}" onclick="this.classList.toggle('on')">${t.name}</button>`).join('')}</div></div></div>`;
}
function readForm(){
  const v=id=>(($('#'+id)||{}).value||'').trim();
  return {fr:v('cf_fr'),en:v('cf_en'),ex:v('cf_ex'),nt:v('cf_nt'),tg:v('cf_tg').split(',').map(x=>x.trim().replace(/^#/,'').toLowerCase()).filter(Boolean),th:$$('#cf_th .on').map(x=>x.dataset.v),ty:$$('#cf_ty .on').map(x=>x.dataset.v)};
}
function openAdd(pre){
  pre=pre||{};modal(`<h3>New card</h3>${cardForm(pre.fr?{fr:pre.fr,en:pre.en||'',ex:'',nt:'',tg:[],th:pre.th||[],ty:pre.ty||['vocab']}:null)}<div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveNew()">Add card</button></div>`,true);
}
function saveNew(){
  const f=readForm();if(!f.fr||!f.en){toast('Add both a French and an English side');return;}
  const dup=BYKEY.get(keyOf(f.fr));if(dup&&!dup.del){toast('“'+dup.fr+'” already exists — opening it');closeModal();openEdit(dup.id);return;}
  newUserCard({fr:f.fr,en:f.en,th:f.th,ty:f.ty,ex:f.ex,tg:f.tg,nt:f.nt});closeModal();toast('Card added');if(N.route==='browse')rerender();
}
function openEdit(id){
  const c=BYID.get(id);if(!c)return;
  modal(`<h3>Edit card</h3>${cardForm(c)}
   <div class="divider"></div><div class="row wrap gap-6"><span class="tag">${['New','Learning','Review','Relearning'][c.st]}</span>${c.st?`<span class="tag">due ${fmtDate(c.due)}</span><span class="tag">${c.rp} reviews · ${c.lp} lapses</span>`:''}<span class="tag">${esc(sourceLabel(c))}</span></div>
   <div class="row wrap" style="justify-content:space-between;margin-top:18px"><span class="row wrap gap-6"><button class="btn sm" onclick="editAct('${id}','susp')">${c.su?'Unsuspend':'Suspend'}</button><button class="btn sm" onclick="editAct('${id}','reset')">Reset progress</button><button class="btn sm" onclick="editAct('${id}','trash')" style="color:var(--rouge)">Trash</button></span><span class="row"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveEdit('${id}')">Save</button></span></div>`,true);
}
function saveEdit(id){
  const c=BYID.get(id),f=readForm();if(!f.fr||!f.en){toast('Both sides are required');return;}
  editCard(c,{fr:f.fr,en:f.en,ex:f.ex,nt:f.nt,tg:f.tg,th:f.th.length?f.th:['general'],ty:f.ty.length?f.ty:['vocab']});closeModal();toast('Saved');rerender();
}
function editAct(id,a){
  const c=BYID.get(id);
  if(a==='susp'){c.su=!c.su;commit(c);}else if(a==='trash'){trashCard(c);}
  else if(a==='reset'){c.st=0;c.d=0;c.s=0;c.due=0;c.lr=0;c.rp=0;c.lp=0;c.sp=0;commit(c);}
  closeModal();toast('Done');rerender();
}
