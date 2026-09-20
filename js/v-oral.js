'use strict';
/* ═════════════ Oral — question sets · questions · exam format · manage/import ═════════════ */
N.or={tab:'q',topic:'all',q:'',only:'all',open:{},more:60};
const ORAL_TABS=[['q','Questions','ti-messages'],['fmt','Exam format','ti-clipboard-text'],['wheel','Wheel','ti-refresh-dot'],['mock','Mock exam','ti-microphone-2'],['manage','Manage','ti-adjustments-horizontal']];
const ORAL_SPECIAL={stimulus:{name:'Stimulus & photo',short:'Stimulus',icon:'🖼️',c:'#8a6d3b'},closing:{name:'Closing line',short:'Closing',icon:'🏁',c:'#64748b'}};
const hashColor=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))%360;return `hsl(${h} 55% 45%)`;};
function otopic(id){const t=THEME[id];if(t)return {name:t.name,short:t.short,icon:t.icon,c:t.c};if(ORAL_SPECIAL[id])return ORAL_SPECIAL[id];return {name:id,short:id,icon:'💬',c:hashColor(id)};}
const oSet=()=>O.sets.find(s=>s.id===O.active)||O.sets[0]||null;
const oQs=()=>{const s=oSet();return s?s.q:[];};
const oFind=id=>oQs().find(q=>q.id===id);
function seedOral(){
  if(O.seeded||!window.ORAL_DEFAULT)return;
  O.sets.push({id:'default',name:ORAL_DEFAULT.name,builtin:true,q:ORAL_DEFAULT.questions.map(q=>({id:'d'+q.id,topic:q.topic,q:q.q,subs:q.subs||[],a:q.a||'',fu:[],star:false,ok:false,n:0}))});
  O.active='default';O.seeded=true;saveO(true);
}
function restoreBuiltin(){
  if(!window.ORAL_DEFAULT)return;const ex=O.sets.find(s=>s.id==='default');
  const fresh=ORAL_DEFAULT.questions.map(q=>({id:'d'+q.id,topic:q.topic,q:q.q,subs:q.subs||[],a:q.a||'',fu:[],star:false,ok:false,n:0}));
  if(ex)ex.q=fresh;else O.sets.push({id:'default',name:ORAL_DEFAULT.name,builtin:true,q:fresh});
  O.active='default';saveO(true);toast('Built-in questions restored');rerender();
}
function toastUndo(msg,fn){
  let box=$('.toasts');if(!box){box=document.createElement('div');box.className='toasts';document.body.appendChild(box);}
  const t=document.createElement('div');t.className='toast';t.style.pointerEvents='auto';t.innerHTML=`${esc(msg)} <button style="margin-left:12px;font-weight:700;text-decoration:underline;color:inherit">Undo</button>`;
  t.querySelector('button').onclick=()=>{fn();t.remove();};box.appendChild(t);setTimeout(()=>t.remove(),6500);
}

/* ── follow-up question generator (local, no AI needed) ── */
const STOP=new Set('les des une pour dans avec sont plus mais aussi cette comme tout tous elle elles nous vous leur leurs être avoir fait faire très bien donc même quand alors sans sous entre après avant chez depuis encore ainsi car qui que quoi dont mon mes ton tes son ses notre nos votre vos ces cet celui celle ceux peut peuvent doit doivent était étaient sera seront serait aurait avait avaient voir dire aller falloir faut fois chose choses beaucoup souvent toujours jamais aujourd hui parce puisque quelque quelques certains certaines autres autre première premier grande grand petit petite lorsque tandis pendant contre vers selon ailleurs surtout notamment comment pourquoi lequel'.split(' '));
const FU_TOPIC={
  technology:['Est-ce que la technologie rend les gens plus heureux, selon vous ?','Et pour les personnes âgées, la technologie est-elle un avantage ou un obstacle ?','Pensez-vous que les réseaux sociaux soient dangereux pour les jeunes ?','Comment sera la technologie dans vingt ans, à votre avis ?','Avez-vous déjà fait une pause numérique ? Pourquoi ou pourquoi pas ?'],
  cinema:['Pourquoi les films français sont-ils différents des films américains, selon vous ?','Préférez-vous voir un film au cinéma ou chez vous ? Pourquoi ?','Est-ce que les sous-titres vous aident à apprendre le français ?','Quel film recommanderiez-vous à un ami qui apprend le français ?','Le cinéma peut-il changer la façon de penser des gens ?'],
  musique:['Pourquoi la musique est-elle si importante dans la vie des jeunes ?','Écoutez-vous de la musique quand vous étudiez ? Est-ce efficace ?','Les paroles sont-elles plus importantes que la mélodie ?','Quel concert ou festival voudriez-vous voir un jour ?','La musique francophone peut-elle devenir populaire en Australie ?'],
  media:['Comment faire la différence entre une vraie et une fausse information ?','Les réseaux sociaux ont-ils remplacé les journaux traditionnels ?','Quelle est la responsabilité des journalistes aujourd\'hui ?','Faut-il limiter la liberté de la presse dans certains cas ?','Comment vos parents s\'informaient-ils quand ils étaient jeunes ?'],
  avenir:['Que ferez-vous si vous n\'obtenez pas les résultats espérés ?','Quelles qualités faut-il pour réussir dans votre futur métier ?','Préférez-vous un travail bien payé ou un travail qui vous passionne ?','Où aimeriez-vous habiter dans dix ans ? Pourquoi ?','Qui vous a le plus influencé dans vos choix d\'avenir ?'],
  immigration:['Quels sont les avantages de l\'immigration pour un pays ?','Que pensez-vous des difficultés de l\'intégration ?','Comment l\'Australie est-elle différente de la France à ce sujet ?','Quel rôle l\'école joue-t-elle dans l\'intégration ?','Comprenez-vous pourquoi certaines personnes quittent leur pays ?'],
  youth:['Quelle solution proposeriez-vous au gouvernement pour aider les jeunes ?','Est-ce que ce problème est plus grave aujourd\'hui qu\'à l\'époque de vos parents ?','Comment les écoles peuvent-elles mieux aider les élèves ?','Que feriez-vous si un ami avait ce problème ?','Les campagnes de prévention sont-elles efficaces ?'],
  stimulus:['Pourquoi avez-vous choisi cette image ?','Que représente cette image pour vous, personnellement ?','Qu\'est-ce qui vous frappe le plus dans cette image ?','En quoi cette image est-elle liée au thème que vous avez choisi ?','Que voudriez-vous dire aux gens qui regardent cette image ?'],
  closing:['Voulez-vous ajouter quelque chose ?'],general:['Pouvez-vous m\'en dire un peu plus ?','Pourquoi pensez-vous cela ?','Pouvez-vous donner un exemple ?']};
const tr_=(s,n)=>{s=String(s).trim().replace(/[,;:.\s]+$/,'');return s.length>n?s.slice(0,n).replace(/\s+\S*$/,'')+'…':s;};
function genFollowups(text,topic,n,avoid){
  n=n||6;text=String(text||'');const out=[];const add=s=>{if(s&&!out.includes(s))out.push(s);};
  const av=fold(avoid||'').toLowerCase();
  const reasons=[...text.matchAll(/(?:car|parce que|puisque|étant donné que|grâce à|à cause de)\s+([^.;:!?—\n]{12,90})/gi)].map(m=>m[1]);
  reasons.slice(0,2).forEach(r=>add(`Vous avez dit « ${tr_(r,70)} ». Pouvez-vous m'expliquer un peu plus ?`));
  const freq={};(text.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ’'-]{5,}/g)||[]).forEach(w=>{const k=w.toLowerCase();if(STOP.has(k)||/^(j|l|d|qu|c|n|s|m)['’]/.test(k)||/ment$/.test(k)||/^(informations?|personnellement|technologies?|exemple|exemples|manière|façon|important|importante|nombreux|nombreuses|plusieurs|différent|différente)$/.test(k))return;if(av&&av.includes(fold(k)))return;freq[k]=(freq[k]||0)+1;});
  const names=[...text.matchAll(/(?<=[a-zà-ÿ,;:]\s)([A-ZÀ-Ý][a-zà-ÿ]{3,}(?:\s[A-ZÀ-Ý][a-zà-ÿ]{2,})?)/g)].map(m=>m[1]).filter(x=>!STOP.has(x.toLowerCase()));
  const kws=[...new Set([...names.slice(0,2),...Object.keys(freq).sort((a,b)=>freq[b]*10+b.length-freq[a]*10-a.length).slice(0,6)])];
  if(kws[0])add(`Pouvez-vous me donner un exemple concret à propos de « ${kws[0]} » ?`);
  if(kws[1])add(`Qu'est-ce que « ${kws[1]} » représente pour vous, personnellement ?`);
  if(kws[2])add(`Que pensez-vous de « ${kws[2]} » ? Y a-t-il des aspects négatifs ?`);
  if(/d[’']un côté/i.test(text))add('Et de l\'autre côté, quels sont les arguments opposés ?');
  if(/j[’']aimerais|je voudrais|j[’']espère|je compte|j[’']ai l[’']intention/i.test(text))add('Que ferez-vous si ce projet ne se réalise pas ?');
  if(/quand j[’']étais|autrefois|il y a \w+ ans|à l[’']époque/i.test(text))add('Est-ce différent aujourd\'hui ? Pourquoi ?');
  if(/je pense|à mon avis|selon moi|je crois|je trouve/i.test(text))add('Qu\'est-ce qui vous fait penser cela ?');
  if(/si (?:j[’']avais|je pouvais|on m[’']offrait|je devais)/i.test(text))add('Et si la situation était vraiment différente, que feriez-vous ?');
  const bank=FU_TOPIC[topic]||FU_TOPIC.general;shuffle(bank).forEach(add);
  return out.slice(0,n);
}
function ensureFU(q){if(!q.fu||!q.fu.length)q.fu=genFollowups(q.a||q.q,q.topic,6,q.q);return q.fu;}

/* ── speech helpers ── */
let SAY={id:0};
function sayAsync(text,rate,lang){if(!lang||lang.startsWith('fr'))frVoiceWarn();
  return new Promise(res=>{let done=false,tm=null;const fin=v=>{if(!done){done=true;clearTimeout(tm);res(v);}};
    try{const t=String(text).replace(/\s+/g,' ').trim();const u=new SpeechSynthesisUtterance(t);u.lang=lang||'fr-FR';u.rate=rate||0.92;
    const v=speechSynthesis.getVoices().find(v=>v.lang&&v.lang.toLowerCase().startsWith((lang||'fr').slice(0,2).toLowerCase()));if(v)u.voice=v;
    tm=setTimeout(()=>fin(true),Math.max(1500,t.length*115/(rate||1)+3500)); // safety net: some browsers never fire onend
    u.onend=()=>fin(true);u.onerror=()=>fin(false);speechSynthesis.speak(u);}catch(e){fin(false);}});
}
function oStop(){SAY.id++;stopSpeak();$$('.sent.now').forEach(e=>e.classList.remove('now'));}
function oSayQ(id){const q=oFind(id);if(!q)return;oStop();speak(q.subs&&q.subs.length?q.subs.join(' '):q.q,0.92);}
async function oPlayAnswer(id){
  const card=$('#oq-'+id);if(!card)return;oStop();const my=SAY.id;
  const els=$$('.sent',card);
  for(const el of els){if(my!==SAY.id)return;el.classList.add('now');el.scrollIntoView({block:'nearest',behavior:'smooth'});await sayAsync(el.textContent,0.9);el.classList.remove('now');}
}
function oSaySent(el){oStop();const my=SAY.id;el.classList.add('now');sayAsync(el.textContent,0.9).then(()=>el.classList.remove('now'));}
/* select any text → floating "Listen" button */
let _pop=null;
function killPop(){if(_pop){_pop.remove();_pop=null;}}
function checkSelection(){
  const sel=window.getSelection();const txt=sel?sel.toString().trim():'';
  if(!txt||txt.length<2||!sel.rangeCount){killPop();return;}
  const node=sel.anchorNode&&(sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement);
  if(!node||!node.closest('.oral-sel')){killPop();return;}
  const r=sel.getRangeAt(0).getBoundingClientRect();killPop();
  _pop=document.createElement('div');_pop.className='listen-pop';
  _pop.innerHTML=`<button data-a="1"><i class="ti ti-volume"></i> Listen</button><button data-a="slow">Slow</button><button data-a="copy"><i class="ti ti-copy"></i></button>`;
  _pop.style.left=Math.max(8,Math.min(r.left+window.scrollX,window.innerWidth-200))+'px';_pop.style.top=Math.max(8,r.top+window.scrollY-50)+'px';
  _pop.addEventListener('mousedown',e=>e.preventDefault());
  _pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;oStop();if(a==='copy')copy(txt);else speak(txt,a==='slow'?0.65:0.92);});
  document.body.appendChild(_pop);
}
document.addEventListener('mouseup',()=>setTimeout(checkSelection,10));
document.addEventListener('touchend',()=>setTimeout(checkSelection,300));
document.addEventListener('mousedown',e=>{if(_pop&&!_pop.contains(e.target))killPop();});

/* ── answer rendering ── */
const CONN_RE=/\b(car|donc|mais|cependant|pourtant|d['’]abord|ensuite|enfin|puis|bien que|quoique|parce que|puisque|de plus|en outre|par ailleurs|en revanche|toutefois|néanmoins|malgré|grâce à|afin de|afin que|pour que|d['’]un côté|de l['’]autre|autant que je sache|à mon avis|selon moi|en conclusion|par conséquent|c['’]est pourquoi|en effet|sans doute)\b/gi;
const STARTS=/^(D['’]abord|Premièrement|Deuxièmement|Ensuite|Puis|Enfin|Par ailleurs|De plus|D['’]un côté|De l['’]autre|Cependant|En conclusion|Pour conclure|En revanche|Bref)/i;
function hilite(raw){return esc(raw.replace(CONN_RE,'$1')).replace(//g,'<mark class="cn">').replace(//g,'</mark>');}
function answerHtml(a){
  const sents=String(a||'').split(/\n{2,}/).flatMap(p=>p.split(/(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«“"‘(])/));
  const paras=[];let cur=[],len=0;
  for(const s of sents){const t=s.trim();if(!t)continue;if(cur.length&&(STARTS.test(t)||len>250||cur.length>=3)){paras.push(cur);cur=[];len=0;}cur.push(t);len+=t.length;}
  if(cur.length)paras.push(cur);
  return paras.map(p=>`<p>${p.map(s=>`<span class="sent" onclick="oSaySent(this)">${hilite(s)}</span>`).join(' ')}</p>`).join('');
}

/* ── shell ── */
function oTab(t){oStop();N.or.tab=t;rerender();}
function oSetActive(id){O.active=id;N.or.topic='all';N.or.open={};saveO();rerender();}
VIEWS.oral=function(){
  const s=oSet();const tab=N.or.tab;
  const setSel=O.sets.length?`<select class="select" style="width:auto;max-width:260px" onchange="oSetActive(this.value)">${O.sets.map(x=>`<option value="${x.id}" ${s&&s.id===x.id?'selected':''}>${esc(x.name)} (${x.q.length})</option>`).join('')}</select>`:'';
  const body={q:oralQuestions,fmt:oralFormat,wheel:oralWheel,mock:oralMock,manage:oralManage}[tab]||oralQuestions;
  return ph('Oral preparation','Questions, model answers, the real exam format, a spinning wheel and a full mock interview.',setSel,'Practise')+
   `<div class="tabs">${ORAL_TABS.map(t=>`<button class="${tab===t[0]?'on':''}" onclick="oTab('${t[0]}')"><i class="ti ${t[2]}"></i> ${t[1]}</button>`).join('')}</div>${body()}`;
};

/* ── Questions tab ── */
function oFiltered(){
  const f=N.or,q=fold(f.q).toLowerCase().trim();
  return oQs().filter(x=>(f.topic==='all'||x.topic===f.topic)&&(f.only==='all'||(f.only==='star'&&x.star)||(f.only==='todo'&&!x.ok))&&(!q||fold(x.q+' '+x.a).toLowerCase().includes(q)));
}
function oFilt(k,v){N.or[k]=v;N.or.more=60;rerender();}
const oSearch=debounce(v=>{N.or.q=v;N.or.more=60;const el=$('#oqres');if(el)el.innerHTML=oListHtml();},160);
function oToggle(id){N.or.open[id]=!N.or.open[id];const el=$('#oq-'+id);if(el){const idx=oFiltered().findIndex(x=>x.id===id);el.outerHTML=oCardHtml(oFind(id),idx);}}
function oExpandAll(on){oFiltered().forEach(q=>N.or.open[q.id]=on);const el=$('#oqres');if(el)el.innerHTML=oListHtml();}
function oStar(id){const q=oFind(id);q.star=!q.star;saveO();oToggleRefresh(id);}
function oDone(id){const q=oFind(id);q.ok=!q.ok;if(q.ok)q.n=(q.n||0)+1;saveO();oToggleRefresh(id);}
function oToggleRefresh(id){const el=$('#oq-'+id);if(el){const idx=oFiltered().findIndex(x=>x.id===id);el.outerHTML=oCardHtml(oFind(id),idx);}}
function oRegenFU(id){const q=oFind(id);q.fu=genFollowups(q.a||q.q,q.topic,9,q.q).sort(()=>Math.random()-.5).slice(0,6);saveO();oToggleRefresh(id);}
function oCardHtml(q,i){
  const t=otopic(q.topic),open=!!N.or.open[q.id];
  const subs=(q.subs&&q.subs.length?q.subs:[q.q]).map(s=>`<span class="sub">${esc(s)}</span>`).join('');
  const fu=open?ensureFU(q):[];
  return `<div class="oq ${q.ok?'done':''}" id="oq-${q.id}" style="--c:${t.c}">
   <div class="oq-h"><span class="oq-n">${i+1}</span><div class="oq-q oral-sel">${subs}<div class="row wrap gap-6" style="margin-top:10px"><span class="tag t" style="--c:${t.c}">${t.icon} ${esc(t.short)}</span>${q.star?'<span class="tag">★ priority</span>':''}${q.ok?'<span class="tag" style="background:var(--ok-soft);color:var(--ok)">✓ rehearsed'+(q.n>1?' ×'+q.n:'')+'</span>':''}${q.a?'':'<span class="tag" style="background:var(--warn-soft);color:var(--warn)">no answer yet</span>'}</div></div>
    <div class="oq-acts">${iconBtn('ti-volume',`oSayQ('${q.id}')`,'Listen to the question')}${iconBtn(q.star?'ti-star-filled':'ti-star',`oStar('${q.id}')`,'Mark priority')}${iconBtn(q.ok?'ti-circle-check-filled':'ti-circle-check',`oDone('${q.id}')`,'Mark as rehearsed')}${iconBtn('ti-pencil',`oEdit('${q.id}')`,'Edit')}${iconBtn('ti-trash',`oDel('${q.id}')`,'Delete')}</div></div>
   <div class="oq-body">
    <div class="row wrap gap-8"><button class="btn sm ${open?'':'primary'}" onclick="oToggle('${q.id}')"><i class="ti ${open?'ti-eye-off':'ti-eye'}"></i> ${open?'Hide answer':q.a?'Show model answer':'Add / view'}</button>
      ${open&&q.a?`<button class="btn sm" onclick="oPlayAnswer('${q.id}')"><i class="ti ti-player-play"></i> Listen to answer</button><button class="btn sm ghost" onclick="oStop()"><i class="ti ti-player-stop"></i></button>`:''}</div>
    ${open?`${q.a?`<div class="ans oral-sel" style="margin-top:12px">${answerHtml(q.a)}</div><p class="faint" style="font-size:12px;margin-top:6px">Tip: click a sentence to hear it, or highlight any words and press <b>Listen</b>. <span style="color:var(--brand);font-weight:600">Blue</span> = connectors to reuse.</p>`:`<div class="callout info" style="margin-top:12px"><i class="ti ti-info-circle"></i><div>No model answer yet. <a href="#" onclick="oEdit('${q.id}');return false">Write one</a> or upload your answers in <b>Manage</b>.</div></div>`}
     <div class="ans-h"><b>Possible follow-up questions</b><button class="btn sm ghost" onclick="oRegenFU('${q.id}')"><i class="ti ti-dice-3"></i> Shuffle</button></div>
     <div class="fu">${fu.map(f=>`<button onclick="speak(this.dataset.t)" data-t="${ea(f)}"><i class="ti ti-volume"></i><span>${esc(f)}</span></button>`).join('')}</div>`:''}
   </div></div>`;
}
function oListHtml(){
  const list=oFiltered();
  if(!oQs().length)return empty('🎤','No questions yet','Import your question set or add questions in the Manage tab.',`<div class="row" style="justify-content:center"><button class="btn primary" onclick="oTab('manage')">Go to Manage</button>${window.ORAL_DEFAULT?`<button class="btn" onclick="restoreBuiltin()">Restore built-in questions</button>`:''}</div>`);
  if(!list.length)return empty('🔍','Nothing matches','Try another topic or search.');
  return `<div class="row between" style="margin-bottom:10px"><span class="muted" style="font-size:13.5px"><b>${list.length}</b> question${list.length===1?'':'s'} · ${list.filter(x=>x.ok).length} rehearsed</span><span class="row gap-6"><button class="btn sm ghost" onclick="oExpandAll(true)">Expand all</button><button class="btn sm ghost" onclick="oExpandAll(false)">Collapse all</button></span></div>${list.slice(0,N.or.more).map((q,i)=>oCardHtml(q,i)).join('')}${list.length>N.or.more?`<div class="center"><button class="btn" onclick="N.or.more+=60;$('#oqres').innerHTML=oListHtml()">Show more</button></div>`:''}`;
}
function oralQuestions(){
  const qs=oQs(),topics=[...new Set(qs.map(q=>q.topic))];
  return `<div class="row wrap" style="margin-bottom:14px"><div class="search grow" style="min-width:220px"><i class="ti ti-search"></i><input class="input" placeholder="Search questions and answers…" value="${ea(N.or.q)}" oninput="oSearch(this.value)"></div>${seg([['all','All'],['todo','To rehearse'],['star','★ Priority']],N.or.only,"(v=>oFilt('only',v))")}</div>
  <div class="chips" style="margin-bottom:16px">${chip('All topics',N.or.topic==='all',"oFilt('topic','all')",{n:qs.length})}${topics.map(id=>{const t=otopic(id);return chip(`${t.icon} ${esc(t.short)}`,N.or.topic===id,`oFilt('topic','${ea(id)}')`,{n:qs.filter(q=>q.topic===id).length});}).join('')}</div>
  <div id="oqres">${oListHtml()}</div>`;
}

/* ── Edit / delete ── */
function oEdit(id){
  const q=id?oFind(id):null,topic=q?q.topic:(N.or.topic!=='all'?N.or.topic:'technology');
  const opts=[...THEMES.map(t=>t.id),'stimulus','closing',...new Set(oQs().map(x=>x.topic).filter(x=>!THEME[x]&&!ORAL_SPECIAL[x]))];
  modal(`<h3>${q?'Edit question':'New question'}</h3><div class="col gap-8">
   <div><label class="lbl">Topic</label><select id="oe_t" class="select" onchange="$('#oe_c').classList.toggle('hide',this.value!=='__new')">${opts.map(o=>`<option value="${ea(o)}" ${o===topic?'selected':''}>${esc(otopic(o).icon+' '+otopic(o).name)}</option>`).join('')}<option value="__new">➕ New topic…</option></select><input id="oe_c" class="input hide" style="margin-top:8px" placeholder="New topic name"></div>
   <div><label class="lbl">Question <span class="faint">(put several sub-questions on separate lines)</span></label><textarea id="oe_q" class="textarea" rows="3" autofocus>${esc(q?(q.subs&&q.subs.length?q.subs.join('\n'):q.q):'')}</textarea></div>
   <div><label class="lbl">Model answer <span class="faint">(optional — powers follow-ups in the mock exam)</span></label><textarea id="oe_a" class="textarea" rows="8">${esc(q?q.a:'')}</textarea></div></div>
   <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="oSave('${id||''}')">Save</button></div>`,true);
}
function oSave(id){
  const set=oSet();if(!set){toast('Create a set first (Manage tab)');return;}
  let topic=$('#oe_t').value;if(topic==='__new')topic=($('#oe_c').value||'').trim()||'other';
  const lines=$('#oe_q').value.split('\n').map(x=>x.trim()).filter(Boolean);if(!lines.length){toast('Write a question first');return;}
  const a=$('#oe_a').value.trim();const q=id?oFind(id):null;
  if(q){const changed=q.a!==a;Object.assign(q,{topic,q:lines.join(' '),subs:lines,a});if(changed)q.fu=[];}
  else set.q.push({id:'q'+Date.now().toString(36)+rnd(999),topic,q:lines.join(' '),subs:lines,a,fu:[],star:false,ok:false,n:0});
  saveO();closeModal();toast('Saved');rerender();
}
function oDel(id){
  const set=oSet(),i=set.q.findIndex(x=>x.id===id);if(i<0)return;const [q]=set.q.splice(i,1);saveO();rerender();
  toastUndo('Question deleted',()=>{set.q.splice(Math.min(i,set.q.length),0,q);saveO();if(N.route==='oral')rerender();});
}

/* ── Exam format tab (from the SCSA 2026 requirements) ── */
const SCRIPT=[
  ['m','Bonjour. Comment allez-vous ?','Hello. How are you?'],
  ['c','Bonjour Madame/Monsieur. Ça va bien merci, et vous ?','Say this in French.'],
  ['m','“I am your interviewer… Can you read me your WA student number in English please?”','English — the only English of the exam'],
  ['c','Yes, my number is …','Read your WASN slowly in English. The marker repeats it to confirm.'],
  ['m','Qu’est-ce que vous avez apporté pour votre examen aujourd’hui ?','What did you bring for your exam today?'],
  ['c','J’ai apporté une photo / une affiche / un article… Ça se rapporte au thème de… (Unit 3 / Unit 4).','Name your stimulus and the Unit 3/4 topic it belongs to.'],
  ['m','(Part B — questions about your stimulus, opinions and ideas)','≈ 4 minutes'],
  ['m','Avez-vous quelque chose d’autre à dire (rajouter) ?','Anything to add?'],
  ['c','Non, merci, rien d’autre.  /  Oui, je voudrais rajouter…','Then hand over your booklet.'],
  ['m','Merci. Pourriez-vous me rendre votre brochure (livret), s’il vous plaît ?','Could you hand back your booklet, please?'],
  ['m','On va maintenant passer à la conversation.','Now we move on to the conversation (Part C, ≈ 8 minutes).'],
  ['m','Merci (Je vous remercie). C’est la fin de l’entretien.','Thank you. That is the end of the interview.'],
  ['c','Merci beaucoup, au revoir Madame/Monsieur. Bonne journée !','Then leave the room quietly.']];
const CRIT=[['ti-ear','Comprehension','Answer the question that was actually asked. If unsure: “Pourriez-vous répéter, s’il vous plaît ?”'],['ti-target-arrow','Response','Relevance and depth: give an opinion + a reason + an example. Develop, don’t stop at one sentence.'],['ti-stack-2','Language range','Vary vocabulary and structures: connectors, subjunctive, si-clauses, relative pronouns, idioms.'],['ti-check','Language accuracy','Agreements, verb endings, tenses, genders. Slow slightly to stay correct.'],['ti-wave-sine','Speech','Fluency and pronunciation. Speak naturally — markers interrupt monologues, so make it a conversation.']];
function oralFormat(){
  const st=O.stim;
  return `<div class="tl"><div><div class="part">Part A</div><div class="big">10 min</div><b>Preparation</b><p class="muted" style="font-size:14px;margin-top:6px">Plan your stimulus in the booklet. Notes only — <b>don’t</b> read them out. Dictionary allowed.</p></div>
   <div><div class="part">Part B</div><div class="big">≈ 4 min</div><b>Discussion of stimulus</b><p class="muted" style="font-size:14px;margin-top:6px">Greeting, WASN, then questions about your stimulus. Show flexible language.</p></div>
   <div><div class="part">Part C</div><div class="big">≈ 8 min</div><b>Conversation</b><p class="muted" style="font-size:14px;margin-top:6px">Range of Unit 3 &amp; 4 topics. Questions may follow up what you said or introduce a new topic.</p></div></div>
  <div class="grid g2" style="margin-top:18px;align-items:start">
   <div class="card"><div class="row between"><h3>How the interview goes</h3><button class="btn sm" onclick="oPlayScript()"><i class="ti ti-player-play"></i> Play it</button></div>
    <div class="script">${SCRIPT.map(s=>`<span class="who ${s[0]}">${s[0]==='m'?'Marker':'You'}</span><div class="line"><div class="fr">${esc(s[1])} ${/^[A-Za-zÀ-ÿ“(]/.test(s[1])&&!/^\(|^“/.test(s[1])&&!/^Yes/.test(s[1])?`<button class="btn icon sm ghost" onclick="speak(this.dataset.t)" data-t="${ea(s[1])}"><i class="ti ti-volume"></i></button>`:''}</div><div class="en">${esc(s[2])}</div></div>`).join('')}</div></div>
   <div class="col gap-16">
    <div class="card"><h3>What you’re marked on</h3>${CRIT.map(c=>`<div class="crit"><div class="ico"><i class="ti ${c[0]}"></i></div><div><b>${c[1]}</b><div class="muted" style="font-size:14px">${c[2]}</div></div></div>`).join('')}</div>
    <div class="card"><h3>Rules &amp; reminders</h3><ul style="padding-left:18px;line-height:1.85"><li>Oral is <b>30%</b> of the course (written 70%).</li><li>Report <b>20 minutes</b> before your time; bring a <b>signed printed timetable</b> and photo ID.</li><li>Bring <b>one stimulus</b> (picture, poster, article, object…) linked to Unit 3/4 — <b>no notes on it</b>. No stimulus = 0 for Part B.</li><li>One print dictionary (no notes) — <b>prep time only</b>.</li><li>Have a <b>conversation</b>, don’t recite: monologues get interrupted.</li></ul></div>
    <div class="card"><h3>My stimulus</h3><p class="muted" style="font-size:13.5px;margin-bottom:10px">Saved for the mock exam so the examiner can ask about it.</p>
      <div class="col gap-8"><input class="input" placeholder="What is it? (e.g. photo of the University of Melbourne)" value="${ea(st.title)}" onchange="O.stim.title=this.value;saveO()">
      <select class="select" onchange="O.stim.unit=this.value;saveO()"><option value="">Which topic / unit?</option>${THEMES.filter(t=>t.id!=='general'&&t.id!=='olympics').map(t=>`<option value="${t.id}" ${st.unit===t.id?'selected':''}>${t.icon} ${t.name}</option>`).join('')}</select>
      <textarea class="textarea" rows="4" placeholder="Key points you plan to say (opinions, examples, vocabulary)…" onchange="O.stim.notes=this.value;saveO()">${esc(st.notes)}</textarea></div></div>
   </div></div>`;
}
async function oPlayScript(){
  oStop();const my=SAY.id;for(const s of SCRIPT){if(my!==SAY.id)return;if(s[0]==='m'&&/^[A-ZÀ]/.test(s[1])&&!/^“|^\(/.test(s[1]))await sayAsync(s[1],0.9);else if(s[0]==='c'&&!/^Yes/.test(s[1]))await new Promise(r=>setTimeout(r,1500));}
}

/* ── Manage tab: sets · import · answers · create ── */
N.imp={mode:'new',name:'',parsed:null,file:'',target:'',hasA:false};
function setRename(id){const s=O.sets.find(x=>x.id===id);modal(`<h3>Rename set</h3><input id="rn" class="input" value="${ea(s.name)}" autofocus><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="s_rn('${id}')">Save</button></div>`);}
function s_rn(id){const s=O.sets.find(x=>x.id===id);s.name=($('#rn').value||'').trim()||s.name;saveO();closeModal();rerender();}
function setDup(id){const s=O.sets.find(x=>x.id===id);const n={...JSON.parse(JSON.stringify(s)),id:'s'+Date.now().toString(36),name:s.name+' (copy)',builtin:false};O.sets.push(n);O.active=n.id;saveO();rerender();}
function setDel(id){confirmBox('This deletes the whole question set and its answers. You can restore the built-in questions later from Manage.',`setDelGo('${id}')`,'Delete set');}
function setDelGo(id){const i=O.sets.findIndex(x=>x.id===id);const [s]=O.sets.splice(i,1);if(O.active===id)O.active=O.sets[0]?O.sets[0].id:null;saveO();rerender();toastUndo('Set deleted',()=>{O.sets.splice(i,0,s);O.active=s.id;saveO();if(N.route==='oral')rerender();});}
function setExport(id,kind){const s=O.sets.find(x=>x.id===id);if(kind==='json')download(`oral-${s.name.replace(/\W+/g,'-')}.json`,JSON.stringify(s,null,1),'application/json');
  else if(kind==='csv')download(`oral-${s.name.replace(/\W+/g,'-')}.csv`,'﻿'+[['Topic','Question','Answer'],...s.q.map(q=>[otopic(q.topic).name,q.q,q.a])].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv');
  else download(`oral-${s.name.replace(/\W+/g,'-')}.txt`,s.q.map(q=>`${otopic(q.topic).name}\n${q.q}\n${q.a||''}\n`).join('\n'),'text/plain');}
function topicDel(t){const set=oSet();const gone=set.q.filter(q=>q.topic===t);set.q=set.q.filter(q=>q.topic!==t);saveO();rerender();toastUndo(`${gone.length} questions deleted`,()=>{set.q.push(...gone);saveO();if(N.route==='oral')rerender();});}

/* file parsing (docx via JSZip, txt/csv/json) */
async function readParas(file){
  const name=file.name.toLowerCase();
  if(name.endsWith('.docx')){
    if(!window.JSZip)throw new Error('The .docx reader could not load (offline?). Save the document as .txt or paste the text instead.');
    const zip=await JSZip.loadAsync(await file.arrayBuffer());const xml=await zip.file('word/document.xml').async('string');
    const doc=new DOMParser().parseFromString(xml,'application/xml');const out=[];
    doc.getElementsByTagName('w:p').length;
    for(const p of Array.from(doc.getElementsByTagName('w:p'))){let t='';for(const n of Array.from(p.getElementsByTagName('*'))){if(n.nodeName==='w:t')t+=n.textContent;else if(n.nodeName==='w:tab')t+=' ';}t=t.replace(/\s+/g,' ').trim();if(t)out.push(t);}
    return out;
  }
  const text=await file.text();
  if(name.endsWith('.csv')||name.endsWith('.tsv')){
    const sep=name.endsWith('.tsv')||text.split('\n')[0].includes('\t')?'\t':',';return csvRows(text,sep);
  }
  return text.split(/\r?\n/).map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
}
function csvRows(text,sep){const rows=[];let cur=[],f='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else if(c==='"')q=true;else if(c===sep){cur.push(f);f='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;cur.push(f);f='';if(cur.some(x=>x))rows.push(cur);cur=[];}else f+=c;}if(f||cur.length){cur.push(f);rows.push(cur);}return {rows};}
const TOPIC_KEYS=[[/technolog|numeri|digital/,'technology'],[/cin[eé]ma|film/,'cinema'],[/music/,'musique'],[/m[eé]dia|actualit|news|press/,'media'],[/avenir|future|plans|projet|futur/,'avenir'],[/immigr|migra/,'immigration'],[/jeunes|youth|alcool|stress|drog/,'youth'],[/olymp/,'olympics'],[/photo|stimulus|image/,'stimulus'],[/final|conclusion|closing/,'closing']];
function topicFromHeading(h){const f=fold(h).toLowerCase();for(const [re,id] of TOPIC_KEYS)if(re.test(f))return id;return h.replace(/\(.*?\)/g,'').trim().slice(0,40)||'other';}
function parseOral(paras){
  if(paras&&paras.rows){ // CSV: topic,question,answer  (header optional)
    let rows=paras.rows;const h=rows[0].map(x=>fold(x).toLowerCase());let ti=h.findIndex(x=>/topic|theme|sujet/.test(x)),qi=h.findIndex(x=>/question/.test(x)),ai=h.findIndex(x=>/answer|reponse|r[eé]ponse/.test(x));
    if(qi>=0||ti>=0||ai>=0)rows=rows.slice(1);else{ti=rows[0].length>2?0:-1;qi=rows[0].length>2?1:0;ai=rows[0].length>2?2:1;}
    const qs=rows.filter(r=>(r[qi]||'').trim()).map(r=>({topic:ti>=0&&r[ti]?topicFromHeading(r[ti]):'other',q:r[qi].trim(),a:ai>=0?(r[ai]||'').trim():''}));
    return {qs,hasA:qs.some(q=>q.a)};
  }
  paras=paras.map(p=>String(p).trim()).filter(Boolean);
  const longNoQ=paras.filter(p=>p.length>200&&!/\?/.test(p)).length;const hasA=longNoQ>=3;
  const qs=[];let topic='other',cur=null;
  const QW=/^(parlez|donnez|d[ée]crivez|expliquez|racontez|dites|imaginez|que |qu['’]|quel|quelle|quels|quelles|comment|pourquoi|est-ce|avez|pensez|selon|si |o[uù] |combien|qui |quand |peut-on|faut-il|voudriez|aimeriez|etes-vous|êtes-vous)/i;
  const isHead=(p,i)=>p.length<60&&!/[?!:.]$/.test(p)&&!QW.test(p)&&p.split(' ').length<=8&&i<paras.length-1;
  paras.forEach((p,i)=>{
    if(isHead(p,i)){topic=topicFromHeading(p);cur=null;return;}
    if(!hasA){qs.push({topic,q:p,a:''});return;}
    const isQ=(/\?/.test(p)&&p.length<320)||(QW.test(p)&&p.length<200);
    if(!cur||(isQ&&cur.a)){cur={topic,q:isQ?p:'Question',a:isQ?'':p};qs.push(cur);}
    else if(isQ&&!cur.a&&cur.q!=='Question'){cur.q+=' '+p;}
    else{cur.a+=(cur.a?'\n\n':'')+p;}
  });
  return {qs,hasA};
}
async function impFile(e){
  const f=e.target.files[0];if(!f)return;N.imp.file=f.name;N.imp.name=N.imp.name||f.name.replace(/\.[^.]+$/,'');
  try{
    if(f.name.toLowerCase().endsWith('.json')){const o=JSON.parse(await f.text());const qs=(o.q||o.questions||[]).map(q=>({topic:q.topic||'other',q:q.q,a:q.a||'',subs:q.subs}));N.imp.parsed={qs,hasA:qs.some(q=>q.a)};if(o.name)N.imp.name=o.name;}
    else N.imp.parsed=parseOral(await readParas(f));
    N.imp.hasA=N.imp.parsed.hasA;if(N.imp.mode==='merge'&&!N.imp.hasA)N.imp.mode='add';
    rerender();
  }catch(err){toast('Could not read that file: '+err.message,4500);}
}
const _tok=s=>new Set(fold(s).toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3));
function _jac(a,b){let i=0;for(const x of a)if(b.has(x))i++;return i/Math.max(1,a.size+b.size-i);}
function impCommit(){
  const im=N.imp,p=im.parsed;if(!p||!p.qs.length){toast('Choose a file first');return;}
  const mk=x=>({id:'q'+Date.now().toString(36)+rnd(99999),topic:x.topic,q:x.q,subs:x.subs||x.q.split(/(?<=\?)\s+/).map(s=>s.trim()).filter(Boolean),a:x.a||'',fu:[],star:false,ok:false,n:0});
  if(im.mode==='new'){const s={id:'s'+Date.now().toString(36),name:(im.name||'Imported set').trim(),builtin:false,q:p.qs.map(mk)};O.sets.push(s);O.active=s.id;toast(`Created “${s.name}” with ${s.q.length} questions`,3000);}
  else{const set=oSet();if(!set){toast('Create a set first');return;}
    if(im.mode==='add'){p.qs.forEach(x=>set.q.push(mk(x)));toast(`Added ${p.qs.length} questions`);}
    else{let m=0,extra=[];const toks=set.q.map(q=>_tok(q.q));
      p.qs.forEach(x=>{if(!x.a)return;const tk=_tok(x.q);let best=-1,bs=0;toks.forEach((t,i)=>{const s=_jac(tk,t);if(s>bs){bs=s;best=i;}});if(best>=0&&bs>=0.4){set.q[best].a=x.a;set.q[best].fu=[];m++;}else extra.push(x);});
      if(extra.length&&im.addExtra)extra.forEach(x=>set.q.push(mk(x)));toast(`Matched ${m} answers${extra.length?` · ${extra.length} unmatched${im.addExtra?' (added as new)':''}`:''}`,4000);}
  }
  N.imp={mode:'new',name:'',parsed:null,file:'',target:'',hasA:false};saveO(true);rerender();
}
function impMode(m){N.imp.mode=m;rerender();}
const QSTARTERS={technology:['Comment la technologie a-t-elle changé votre vie ?','Passez-vous trop de temps sur votre téléphone ?'],cinema:['Quel est votre film francophone préféré ?','Que pensez-vous du cinéma français ?'],musique:['Quel style de musique francophone aimez-vous ?','Pourquoi la musique est-elle importante ?'],media:['Comment vous informez-vous ?','Peut-on faire confiance aux réseaux sociaux ?'],avenir:['Que ferez-vous après le bac ?','Où voudriez-vous travailler ?'],immigration:['Pourquoi les gens émigrent-ils ?','Comment faciliter l\'intégration ?'],youth:['Quels sont les principaux problèmes des jeunes ?','Comment gérez-vous le stress ?']};
function oralManage(){
  const s=oSet(),im=N.imp,topics=s?[...new Set(s.q.map(q=>q.topic))]:[];
  const modes=[['new','New set'],['add','Add to “'+(s?s.name:'…')+'”'],['merge','Merge answers into “'+(s?s.name:'…')+'”']];
  return `<div class="grid g2" style="align-items:start">
   <div class="col gap-16">
    <div class="card"><h3>Upload questions or answers</h3><p class="muted" style="font-size:14px;margin-bottom:12px">Accepts <b>.docx, .txt, .csv, .json</b>. A file with question / answer paragraphs under topic headings (like your V8 document) is detected automatically; a plain list of questions works too.</p>
      <div class="seg" style="margin-bottom:12px">${modes.map(m=>`<button class="${im.mode===m[0]?'on':''}" onclick="impMode('${m[0]}')" ${m[0]!=='new'&&!s?'disabled':''}>${esc(m[1])}</button>`).join('')}</div>
      ${im.mode==='new'?`<input class="input" style="margin-bottom:10px" placeholder="Name of the new set" value="${ea(im.name)}" onchange="N.imp.name=this.value">`:''}
      <p class="faint" style="font-size:12.5px;margin-bottom:10px">${im.mode==='merge'?'Upload <b>your own answers</b>: each answer is matched to the closest question already in this set — that’s what powers the follow-up questions in the mock exam.':im.mode==='add'?'New questions are appended to the current set.':'Creates a separate set — handy if a friend uses different questions.'}</p>
      <label class="btn"><i class="ti ti-upload"></i> ${im.file?'Choose another file':'Choose file'}<input type="file" accept=".docx,.txt,.csv,.tsv,.json,.md" onchange="impFile(event)" style="display:none"></label>
      ${im.parsed?`<div class="divider"></div><div class="row between"><b>${esc(im.file)}</b><span class="tag">${im.parsed.qs.length} found${im.hasA?' · with answers':''}</span></div><div class="list" style="max-height:280px;overflow:auto;margin-top:10px">${im.parsed.qs.slice(0,40).map(q=>`<div class="li"><span class="tag t" style="--c:${otopic(q.topic).c}">${esc(otopic(q.topic).short)}</span><div class="grow ellip" title="${ea(q.q)}">${esc(q.q)}</div>${q.a?'<span class="faint">✓ answer</span>':''}</div>`).join('')}</div>${im.mode==='merge'?`<label class="row" style="margin-top:10px;font-size:14px"><input type="checkbox" onchange="N.imp.addExtra=this.checked" ${im.addExtra?'checked':''}> Add unmatched answers as new questions</label>`:''}<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" onclick="impCommit()">${im.mode==='new'?'Create set':im.mode==='add'?'Add questions':'Merge answers'}</button></div>`:''}</div>
    <div class="card"><h3>Create questions</h3><div class="row wrap"><button class="btn primary" onclick="oEdit()" ${s?'':'disabled'}><i class="ti ti-plus"></i> New question</button><button class="btn" onclick="oNewSet()"><i class="ti ti-folder-plus"></i> Empty set</button><button class="btn" onclick="oQuick()" ${s?'':'disabled'}><i class="ti ti-bolt"></i> Add common exam questions</button><button class="btn" onclick="oAiGen()" ${s?'':'disabled'}><i class="ti ti-sparkles"></i> Generate with AI</button></div></div>
   </div>
   <div class="col gap-16">
    <div class="card"><h3>My question sets</h3>${O.sets.length?O.sets.map(x=>`<div class="row" style="padding:10px 0;border-bottom:1px dashed var(--line)"><input type="radio" name="aset" ${O.active===x.id?'checked':''} onchange="oSetActive('${x.id}')"><div class="grow"><b>${esc(x.name)}</b><div class="faint" style="font-size:12.5px">${x.q.length} questions · ${x.q.filter(q=>q.a).length} answers${x.builtin?' · built-in':''}</div></div>${iconBtn('ti-pencil',`setRename('${x.id}')`,'Rename')}${iconBtn('ti-copy',`setDup('${x.id}')`,'Duplicate')}<span class="row gap-4"><button class="btn sm ghost" onclick="setExport('${x.id}','json')">JSON</button><button class="btn sm ghost" onclick="setExport('${x.id}','csv')">CSV</button></span>${iconBtn('ti-trash',`setDel('${x.id}')`,'Delete set')}</div>`).join(''):'<p class="muted">No sets yet.</p>'}
      ${window.ORAL_DEFAULT?`<button class="btn sm" style="margin-top:12px" onclick="restoreBuiltin()"><i class="ti ti-restore"></i> Restore built-in questions</button>`:''}</div>
    ${s?`<div class="card"><h3>Topics in “${esc(s.name)}”</h3>${topics.map(t=>`<div class="row" style="padding:8px 0;border-bottom:1px dashed var(--line)"><span class="tag t" style="--c:${otopic(t).c}">${otopic(t).icon} ${esc(otopic(t).name)}</span><span class="grow faint">${s.q.filter(q=>q.topic===t).length} questions</span><button class="btn sm ghost" style="color:var(--rouge)" onclick="confirmBox('Delete all ${s.q.filter(q=>q.topic===t).length} questions in this topic?','topicDel(&quot;${ea(t)}&quot;)','Delete topic')">Delete topic</button></div>`).join('')}</div>`:''}
    <div class="card"><h3>Where is this saved?</h3><p class="muted" style="font-size:14px">${REMOTE.ok?'Your sets and answers are saved automatically as <span class="mono">oral.json</span> in your save folder (plus a copy in the browser). Uploaded Word files are only read, never stored.':'Right now they are stored in this browser only. <a href="#" onclick="chooseFolder();return false"><b>Choose a save folder</b></a> in Settings to keep them as real files too. Uploaded Word files are only read, never stored.'}</p></div>
   </div></div>`;
}
function oNewSet(){modal(`<h3>New empty set</h3><input id="ns" class="input" placeholder="Set name" autofocus><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="oNewSetGo()">Create</button></div>`);}
function oNewSetGo(){const n=($('#ns').value||'').trim()||'My questions';const s={id:'s'+Date.now().toString(36),name:n,builtin:false,q:[]};O.sets.push(s);O.active=s.id;saveO(true);closeModal();rerender();}
function oQuick(){const s=oSet();let n=0;for(const [t,list] of Object.entries(QSTARTERS))for(const q of list){if(!s.q.some(x=>x.q===q)){s.q.push({id:'q'+Date.now().toString(36)+rnd(99999),topic:t,q,subs:[q],a:'',fu:[],star:false,ok:false,n:0});n++;}}saveO();toast(n+' questions added');rerender();}
async function oAiGen(){
  const s=oSet();const topic=N.or.topic!=='all'?otopic(N.or.topic).name:'the Year 12 WACE French oral topics (technology, cinema, music, media, future plans, migration, youth issues)';
  const prompt=`Write 12 varied oral examination questions in French for a Year 12 WACE French: Second Language ATAR student on: ${topic}. One question per line, no numbering, natural interviewer register (vous). Mix opinion, description, hypothetical (si + imparfait) and personal questions.`;
  if(!hasKey()){copy(prompt,'Prompt copied — paste the reply into a .txt file and upload it');return;}
  toast('Generating…');const r=await callAi(prompt,'You write French oral exam questions.');if(!r)return;
  const qs=r.split('\n').map(x=>x.replace(/^[\d.\-*)\s]+/,'').trim()).filter(x=>x.length>10);
  qs.forEach(q=>s.q.push({id:'q'+Date.now().toString(36)+rnd(99999),topic:N.or.topic!=='all'?N.or.topic:'other',q,subs:[q],a:'',fu:[],star:false,ok:false,n:0}));saveO();toast(qs.length+' questions added');rerender();
}
