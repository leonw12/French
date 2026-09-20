'use strict';
/* ═════════════ Writing: Phrase bank · Text types · Written guide ═════════════ */

/* ───────── Phrase bank ───────── */
N.pb={sec:'opener',q:'',theme:''};
const PB_SECS=[
  ['opener','Openers','✉️','Start a text well — formal, informal, article.'],
  ['closer','Closers','🏁','Conclude, sign off, leave an impression.'],
  ['opinion','Opinion','💭','State, nuance, agree and disagree.'],
  ['connector','Connectors','🔗','Basic → sophisticated linking words.'],
  ['subjunctive','Subjunctive','🎯','Triggers you can memorise and reuse.'],
  ['structure','Structures','✨','Patterns that instantly raise a script.'],
  ['idiom','Idioms','🎭','Images and expressions — use two or three.'],
  ['colloquial','Colloquial','😎','Informal registers only.'],
  ['keyphrase','Theme key phrases','🔑','Learn 2–3 per topic.'],
  ['mine','My toolkit','⭐','Starred phrases — your personal exam 15.']];
function pbSet(k,v){N.pb[k]=v;if(k==='sec')N.pb.q='';rerender();}
const pbSearch=debounce(v=>{N.pb.q=v;const el=$('#pbres');if(el)el.innerHTML=pbList();},150);
function pbCards(){
  const p=N.pb,q=fold(p.q).toLowerCase().trim();
  return CARDS.filter(c=>!c.del&&(p.sec==='mine'?(c.sr&&(c.ty.includes('writing')||c.ty.includes('idiom')||c.ty.includes('connector'))):c.ty.includes(p.sec)||(p.sec==='idiom'&&c.ty.includes('proverb')))
    &&(!p.theme||c.th.includes(p.theme))&&(!q||c._q.includes(q)));
}
function pbList(){
  const list=pbCards();
  if(!list.length)return empty(N.pb.sec==='mine'?'⭐':'🔍',N.pb.sec==='mine'?'No toolkit phrases yet':'Nothing found',N.pb.sec==='mine'?'Star phrases in any section and they’ll collect here — aim for about fifteen.':'Try another search or theme.');
  const groups=new Map();list.slice().sort((a,b)=>(a.wo||99999)-(b.wo||99999)).forEach(c=>{const k=c.ws||c.sub||'General';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);});
  return [...groups].map(([k,cs])=>`<div class="sec-title">${esc(k)} <span class="badge soft">${cs.length}</span></div><div class="list">${cs.map(pbRow).join('')}</div>`).join('');
}
function pbRow(c){
  return `<div class="phrase"><div class="grow"><div class="fr">${esc(c.fr)}</div><div class="en">${esc(c.en)}</div>${c.note?`<div class="nt">${esc(c.note)}</div>`:''}
    <div class="row wrap gap-6" style="margin-top:7px">${c.th.filter(t=>t!=='general').slice(0,2).map(tagTheme).join('')}${c.ty.filter(t=>!['writing','phrase'].includes(t)).slice(0,2).map(tagType).join('')}${c.st?`<span class="tag">${cstat(c)}</span>`:''}</div></div>
    <div class="row gap-4">${iconBtn('ti-volume',`speak(BYID.get('${c.id}').fr)`,'Speak')}${iconBtn('ti-copy',`copy(BYID.get('${c.id}').fr)`,'Copy French')}${iconBtn(c.sr?'ti-star-filled':'ti-star',`pbStar('${c.id}')`,'Add to my toolkit')}</div></div>`;
}
function pbStar(id){const c=BYID.get(id);c.sr=!c.sr;commit(c);const el=$('#pbres');if(el)el.innerHTML=pbList();}
VIEWS.phrases=function(){
  const p=N.pb,cur=PB_SECS.find(s=>s[0]===p.sec)||PB_SECS[0];
  const cnt=id=>id==='mine'?CARDS.filter(c=>!c.del&&c.sr&&(c.ty.includes('writing')||c.ty.includes('idiom')||c.ty.includes('connector'))).length:CARDS.filter(c=>!c.del&&(c.ty.includes(id)||(id==='idiom'&&c.ty.includes('proverb')))).length;
  return ph('Phrase bank','Every phrase from your writing sheets, sorted by job. Star the ones you’ll actually use — “learn fifteen cold, not four hundred vaguely.”',
    `<button class="btn primary" onclick="studyFilter({types:['${p.sec==='mine'?'writing':p.sec}']${p.sec==='mine'?',starred:true':''}})"><i class="ti ti-player-play-filled"></i> Drill ${esc(cur[1])}</button>`,'Writing')+`
  <div class="tabs">${PB_SECS.map(s=>`<button class="${p.sec===s[0]?'on':''}" onclick="pbSet('sec','${s[0]}')">${s[2]} ${s[1]} <span class="faint" style="font-size:11px">${cnt(s[0])}</span></button>`).join('')}</div>
  <div class="row wrap" style="margin-bottom:6px"><div class="search grow" style="min-width:240px"><i class="ti ti-search"></i><input class="input" placeholder="Search in ${esc(cur[1]).toLowerCase()}…" value="${ea(p.q)}" oninput="pbSearch(this.value)"></div>
    <select class="select" style="width:auto" onchange="pbSet('theme',this.value)"><option value="">All themes</option>${THEMES.map(t=>`<option value="${t.id}" ${p.theme===t.id?'selected':''}>${t.icon} ${t.short}</option>`).join('')}</select></div>
  <p class="muted" style="font-size:14px">${cur[3]}</p>
  <div id="pbres">${pbList()}</div>`;
};

/* ───────── Text types ───────── */
N.tt={id:null,cat:'All'};
const TT_COLORS={Correspondance:['#25348e','#4b62d8'],'Web & médias':['#7c4dd6','#a77bf0'],Cinéma:['#b81f45','#ec5a7c'],Personnel:['#0f8a5f','#3fc596'],Oral:['#c26a10','#f0a04a'],'Oral / journalistic':['#c26a10','#f0a04a'],Récit:['#0e7c95','#3cb8d4'],Rapport:['#3b4a6b','#6f80a8'],Brief:['#a23b8e','#d474c0'],Persuasif:['#c42d2d','#f26b5b'],Visuel:['#0d7a6f','#3cbfb1']};
const ttAll=()=>(window.FRENCH_GUIDES&&FRENCH_GUIDES.textTypes)||[];
function ttOpen(id){N.tt.id=id;go('texttypes',{},false);}
function ttCat(c){N.tt.cat=c;N.tt.id=null;rerender();}
function ttCheck(id,i){const k='tt:'+id;const a=S.chk[k]||(S.chk[k]=[]);const j=a.indexOf(i);if(j>=0)a.splice(j,1);else a.push(i);save();rerender();}
function ttReset(id){delete S.chk['tt:'+id];save();rerender();}
const splitPh=s=>{const m=String(s).split(/\s+[—–]\s+/);return m.length>1?[m[0],m.slice(1).join(' — ')]:[s,''];};
VIEWS.texttypes=function(){
  const all=ttAll(),t=all.find(x=>x.id===N.tt.id);
  if(!t){
    const cats=['All',...new Set(all.map(x=>x.category))];
    const list=all.filter(x=>N.tt.cat==='All'||x.category===N.tt.cat);
    return ph('Text types','The 20 formats WACE can ask for. Each has a must-include checklist, ready-made phrases and a model answer.',null,'Writing')+`
    <div class="chips" style="margin-bottom:18px">${cats.map(c=>chip(esc(c),N.tt.cat===c,`ttCat('${ea(c)}')`)).join('')}</div>
    <div class="grid g-auto-lg">${list.map(x=>{const col=TT_COLORS[x.category]||['#25348e','#4b62d8'];const done=(S.chk['tt:'+x.id]||[]).length;return `<button class="card link" style="text-align:left;position:relative;overflow:hidden" onclick="ttOpen('${x.id}')">
      <div style="position:absolute;right:-6px;top:-6px;width:96px;height:96px;border-radius:0 0 0 96px;background:linear-gradient(135deg,${col[0]},${col[1]});opacity:.9"></div><div style="position:absolute;right:16px;top:12px;font-size:32px">${x.icon}</div>
      <div class="tag t" style="--c:${col[0]};margin-bottom:12px">${esc(x.category)}</div><h3 style="font-size:19px;margin-bottom:2px;padding-right:70px">${esc(x.name)}</h3><div class="muted" style="font-size:13.5px">${esc(x.en)}</div>
      <div class="row between" style="margin-top:14px"><span class="tag">${esc(x.register||'')}</span><span class="faint" style="font-size:12px">${done?`✓ ${done}/${x.mustInclude.length}`:x.mustInclude.length+' must-haves'}</span></div></button>`;}).join('')}</div>`;
  }
  const col=TT_COLORS[t.category]||['#25348e','#4b62d8'],chk=S.chk['tt:'+t.id]||[];
  const ix=all.findIndex(x=>x.id===t.id),prev=all[(ix+all.length-1)%all.length],next=all[(ix+1)%all.length];
  const grp=[['opening','Opening lines','ti-door-enter'],['body','Body','ti-layout-list'],['closing','Closing lines','ti-door-exit'],['farewell','Sign-off','ti-hand-stop']].filter(g=>t.phrases&&t.phrases[g[0]]&&t.phrases[g[0]].length);
  const rel=t.register&&/informal|casual|tu/i.test(t.register)?['opener','colloquial','opinion']:['opener','connector','opinion','closer'];
  return `<button class="btn ghost sm" onclick="N.tt.id=null;rerender()" style="margin-bottom:14px"><i class="ti ti-arrow-left"></i> All text types</button>
  <div class="tt-hero" data-ico="${t.icon}" style="--c1:${col[0]};--c2:${col[1]}"><div class="row wrap gap-8" style="margin-bottom:10px"><span class="tag">${esc(t.category)}</span><span class="tag">${esc(t.register||'')}</span></div><h2>${esc(t.name)}</h2><p>${esc(t.en)}</p></div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
    <div class="card"><div class="row between"><h3>✅ Must include</h3><span class="row gap-6"><span class="badge soft">${chk.length}/${t.mustInclude.length}</span>${chk.length?`<button class="btn sm ghost" onclick="ttReset('${t.id}')">Reset</button>`:''}</span></div>${bar(pct(chk.length,t.mustInclude.length),'var(--ok)')}<div style="margin-top:8px">${t.mustInclude.map((m,i)=>`<div class="check ${chk.includes(i)?'on':''}" onclick="ttCheck('${t.id}',${i})"><div class="bx"><i class="ti ti-check" style="font-size:14px"></i></div><span>${esc(m)}</span></div>`).join('')}</div></div>
    <div class="col gap-16"><div class="card"><h3>💡 Tips</h3><p class="muted pre">${esc(t.tips||'')}</p></div>
      <div class="card"><h3>Jump to phrases</h3><div class="chips">${rel.map(r=>chip(`${TYPE[r].name}`,false,`go('phrases');pbSet('sec','${r}')`)).join('')}${chip('Grammar tips',false,"go('guide')")}</div></div></div></div>
  ${grp.length?`<div class="sec-title">Phrases to borrow</div><div class="grid g2">${grp.map(g=>`<div class="card"><h3><i class="ti ${g[2]}" style="color:${col[0]}"></i> ${g[1]}</h3>${t.phrases[g[0]].map(p=>{const [fr,en]=splitPh(p);return `<button class="phr-chip" onclick="copy(this.dataset.t,'Copied to clipboard')" data-t="${ea(fr)}"><b>${esc(fr)}</b>${en?`<span>${esc(en)}</span>`:''}</button>`;}).join('')}</div>`).join('')}</div>`:''}
  ${t.sample?`<div class="sec-title">Model answer</div><div class="sample" style="--c1:${col[0]}">${esc(t.sample)}</div><div class="row" style="margin-top:10px"><button class="btn sm" onclick="copy(${ea(JSON.stringify(t.sample))},'Sample copied')"><i class="ti ti-copy"></i> Copy</button><button class="btn sm" onclick="speak(${ea(JSON.stringify(t.sample.slice(0,600)))},0.9)"><i class="ti ti-volume"></i> Listen</button><button class="btn sm ghost" onclick="stopSpeak()"><i class="ti ti-player-stop"></i></button></div>`:''}
  <div class="row between" style="margin-top:30px"><button class="btn" onclick="ttOpen('${prev.id}')"><i class="ti ti-arrow-left"></i> ${esc(prev.en)}</button><button class="btn" onclick="ttOpen('${next.id}')">${esc(next.en)} <i class="ti ti-arrow-right"></i></button></div>`;
};

/* ───────── Written guide ───────── */
N.gd={tab:'tips',timer:null};
const GD_TABS=[['tips','Tips & structures','ti-bulb'],['plan','Exam plan','ti-clock'],['marking','Marking key','ti-checklist'],['alt','Better than basic','ti-arrows-exchange'],['kw','Key words','ti-key'],['idioms','Idioms by theme','ti-mood-smile-beam'],['extra','Abbreviations & slang','ti-abc'],['subj','Subjunctive','ti-target'],['exams','Past exams','ti-files']];
const guideData=()=>(window.FR_DATA&&FR_DATA.guide)||{tips:[],keywords:[],idioms:[],alternatives:[],abbrev:[],slang:[],subj:[]};
function gdTab(t){N.gd.tab=t;rerender();}
const cellsTable=(rows,hdr)=>`<div class="tbl-wrap"><table class="tbl fr">${hdr?`<thead><tr>${hdr.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead>`:''}<tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c).replace(/\n/g,'<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const PLAN=[['Choose your topic',2,'Read every question. Pick the topic, text type and grammar you’re most comfortable with — not just the theme you like.'],['Brainstorm',3,'Text type · grammar · vocabulary & expressions · style and register. Highlight key words in the question.'],['Plan',5,'Ideas, sequence, linking words, grammar you might need. Use the dot points in the same order as the question.'],['Write',30,'Use your plan and connectors. Vary tenses. Don’t translate word-for-word. Use your dictionary wisely.'],['Proofread',5,'Spelling, agreements, verb endings. Make sure the first and last sentences are spot on.']];
function gdTimer(a){
  let t=N.gd.timer;
  if(a==='start'){if(t&&t.iv)return;t=N.gd.timer=t&&t.left>0?t:{i:0,left:PLAN[0][1]*60,iv:null};t.iv=setInterval(()=>{t.left--;if(t.left<=0){toast('⏰ '+PLAN[t.i][0]+' finished');t.i++;if(t.i>=PLAN.length){clearInterval(t.iv);t.iv=null;t.done=true;t.left=0;}else t.left=PLAN[t.i][1]*60;}gdTimerPaint();},1000);}
  else if(a==='pause'){if(t&&t.iv){clearInterval(t.iv);t.iv=null;}}
  else if(a==='reset'){if(t&&t.iv)clearInterval(t.iv);N.gd.timer=null;}
  else if(a==='next'&&t){t.i=Math.min(PLAN.length-1,t.i+1);t.left=PLAN[t.i][1]*60;}
  rerender();
}
function gdTimerPaint(){const el=$('#gdt');if(!el||!N.gd.timer)return;const t=N.gd.timer;el.innerHTML=timerHtml(t);}
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function timerHtml(t){if(!t)return `<div class="serif" style="font-size:44px;font-weight:600">45:00</div><div class="faint">Ready when you are</div>`;if(t.done)return `<div class="serif" style="font-size:40px">Terminé !</div>`;return `<div class="faint" style="font:600 11px var(--font-body);letter-spacing:.1em;text-transform:uppercase">${PLAN[t.i][0]}</div><div class="serif" style="font-size:52px;font-weight:600;line-height:1.1">${mmss(t.left)}</div>`;}
VIEWS.guide=function(){
  const g=guideData(),tab=N.gd.tab;let body='';
  if(tab==='tips'){
    body=`<div class="callout ok"><i class="ti ti-bulb"></i><div><b>Remember L·O·T·S</b> — <b>L</b>inking words · <b>O</b>pinions · <b>T</b>enses variety · <b>S</b>tunning structures. Tenses to show off: présent · passé composé · imparfait · conditionnel · impératif · futur proche/simple · subjonctif.</div></div>
    <div class="grid g-auto-lg">${(g.tips||[]).filter(x=>x.lines&&x.lines.length&&x.h!=='Preparation').map(x=>`<div class="card"><h3>${esc(x.h.replace(/^USE /,'Use ').replace(/REMEMBER /,'Remember '))}</h3>${x.lines.map(l=>`<p class="serif" style="font-size:16px;margin-bottom:8px;line-height:1.55">${esc(l)}</p>`).join('')}</div>`).join('')}</div>`;
  }else if(tab==='plan'){
    const t=N.gd.timer;
    body=`<div class="grid g2" style="align-items:start"><div class="card"><h3>How to use your 45 minutes</h3><div class="timeline">${PLAN.map((p,i)=>`<div><div class="row between"><b class="serif" style="font-size:17px">${p[0]}</b><span class="tag">${p[1]} min</span></div><p class="muted" style="font-size:14px;margin-top:2px">${p[2]}</p></div>`).join('')}</div></div>
    <div class="col gap-16"><div class="card center"><div id="gdt" style="min-height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center">${timerHtml(t)}</div><div class="row" style="justify-content:center;margin-top:12px">${t&&t.iv?`<button class="btn" onclick="gdTimer('pause')"><i class="ti ti-player-pause"></i> Pause</button>`:`<button class="btn primary" onclick="gdTimer('start')"><i class="ti ti-player-play"></i> ${t?'Resume':'Start practice timer'}</button>`}${t?`<button class="btn" onclick="gdTimer('next')">Skip phase</button><button class="btn ghost" onclick="gdTimer('reset')">Reset</button>`:''}</div></div>
    <div class="card"><h3>Preparation tips</h3><ul style="padding-left:18px;line-height:1.9"><li>Create your own bank of words</li><li>Keep a list of linking / connector words</li><li>Find proverbs & idioms linked to each topic</li><li>Read different texts — notice their structures</li><li>Practise every text type in writing</li><li>Know how to use your time in the exam</li></ul></div></div></div>
    <div class="callout"><i class="ti ti-alert-triangle"></i><div><b>Do not rush choosing your topic.</b> Don’t pick a topic just because you like the theme — check you’re comfortable with the text type, the kind of writing and the grammar it needs.</div></div>`;
  }else if(tab==='marking'){
    const m=g.marking;body=m?`<p class="muted" style="margin-bottom:12px">Example marking key (immigration task). Read each band and aim one band higher than where you sit.</p>${cellsTable(m.rows,m.h)}`:empty('📋','No marking key found');
  }else if(tab==='alt'){
    const rows=(g.alternatives||[]);
    body=rows.length?`<p class="muted" style="margin-bottom:12px">Swap the basic word on the left for something a marker will notice. Left/right columns are two families of alternatives from your guide.</p><div class="tbl-wrap"><table class="tbl fr"><tbody>${rows.map(r=>{const head=r.length&&/^\(.*\)/.test(r[0]);return `<tr style="${head?'background:var(--brand-soft);font-weight:700':''}">${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`;}).join('')}</tbody></table></div>`:empty('🔁','Alternatives table not available');
  }else if(tab==='kw'){
    body=`<p class="muted" style="margin-bottom:14px">Read through, highlight the ones you’ll use. Every phrase here is also a flashcard under <b>Writing toolkit</b>.</p><div class="grid g-auto-lg">${(g.keywords||[]).map(k=>`<div class="card"><h3 style="font-size:16px">${esc(k.h.replace(/[!:]+$/,'').replace(/^./,x=>x).toLowerCase().replace(/^./,x=>x.toUpperCase()))}</h3>${k.pairs.map(p=>`<div style="padding:7px 0;border-bottom:1px dashed var(--line)"><div class="serif" style="font-weight:600;font-size:16px">${esc(p.fr)}</div><div class="muted" style="font-size:13.5px">${esc(p.en)}</div></div>`).join('')}</div>`).join('')}</div>`;
  }else if(tab==='idioms'){
    body=(g.idioms||[]).map(k=>`<details class="acc" ${k.theme==='technology'?'open':''}><summary><span>${k.theme?THEME[k.theme].icon+' ':''}${esc(k.h.charAt(0)+k.h.slice(1).toLowerCase())} <span class="badge soft">${k.pairs.length}</span></span></summary><div class="in">${k.pairs.map(p=>`<div class="row between" style="padding:8px 0;border-bottom:1px dashed var(--line);gap:14px"><span class="serif" style="font-weight:600;font-size:16px">${esc(p.fr)}</span><span class="muted" style="text-align:right;font-size:13.5px">${esc(p.en)}</span></div>`).join('')}</div></details>`).join('');
  }else if(tab==='extra'){
    body=`<div class="grid g2" style="align-items:start"><div class="card"><h3>Abréviations</h3>${cellsTable((g.abbrev||[]).map(a=>[a.a,a.full,a.en]),['Sigle','Full form','Meaning'])}</div><div class="card"><h3>Argot & verlan</h3>${cellsTable((g.slang||[]).map(a=>[a.fr,a.en]),['Français','English'])}</div></div>`;
  }else if(tab==='subj'){
    body=`<p class="muted" style="margin-bottom:12px">Verbs and expressions that trigger the subjunctive. Learn a handful and place one per paragraph.</p><div class="card">${(g.subj||[]).map(a=>`<div class="row between" style="padding:9px 0;border-bottom:1px dashed var(--line)"><span class="serif" style="font-weight:600;font-size:17px">${esc(a.fr)}</span><span class="muted">${esc(a.en)}</span></div>`).join('')}</div><div class="row" style="margin-top:14px"><button class="btn" onclick="go('phrases');pbSet('sec','subjunctive')">Subjunctive phrase bank</button><button class="btn" onclick="go('grammar')">Grammar reference</button></div>`;
  }else if(tab==='exams'){
    const years=[[2022,[3,4,5]],[2021,[6,7,8,9]],[2020,[10,11,12,13,14,15]],[2019,[16,17,18,19,20,21]]];
    const ex=g.exams;
    body=`${ex?`<h3 style="margin-bottom:10px">History of questions & text types</h3>${cellsTable(ex.rows.slice(1),ex.rows[0].map(x=>x||' '))}`:''}
    <div class="sec-title">Past written papers</div>${years.map(([y,ids])=>`<h3 style="margin:14px 0 10px">${y}</h3><div class="gallery">${ids.map(i=>{const f='assets/exams/exam-'+String(i).padStart(2,'0')+'.png';return `<img src="${f}" loading="lazy" alt="WACE ${y} paper page" onclick="lightbox('${f}')">`;}).join('')}</div>`).join('')}`;
  }
  return ph('Written exam guide','Everything from “How to prepare for the written exam” — organised, searchable and connected to your flashcards.',null,'Writing')+`<div class="tabs">${GD_TABS.map(t=>`<button class="${tab===t[0]?'on':''}" onclick="gdTab('${t[0]}')"><i class="ti ${t[2]}"></i> ${t[1]}</button>`).join('')}</div>${body}`;
};
function lightbox(src){const o=document.createElement('div');o.className='overlay';o.style.cursor='zoom-out';o.innerHTML=`<img src="${ea(src)}" style="max-width:96vw;max-height:94vh;border-radius:10px;background:#fff">`;o.onclick=()=>o.remove();document.body.appendChild(o);}
