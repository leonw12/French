'use strict';
/* ═════════════ Oral · Listening & reading · Tutor · Add cards · Settings ═════════════ */
const SEED=()=>window.FRENCH_SEED||{};
const cleanTxt=s=>String(s||'').replace(/\r/g,'').replace(/^\s+/,'').replace(/-?\d{6,}(?=Nom)/g,'').replace(/left000/g,'');

/* ───────── Listening & reading ───────── */
N.li={tab:'t',book:null};
function liTab(t){N.li.tab=t;N.li.book=null;rerender();}
VIEWS.listening=function(){
  const sd=SEED(),tab=N.li.tab;let body='';
  if(tab==='t'){const tr=cleanTxt(sd.listeningTranscript);body=`<div class="card"><h3>🎧 Listening transcript</h3><div class="row" style="margin-bottom:10px"><button class="btn primary" onclick="speak(this.dataset.t,0.88)" data-t="${ea(tr.slice(0,4000))}"><i class="ti ti-player-play"></i> Play</button><button class="btn" onclick="stopSpeak()"><i class="ti ti-player-stop"></i> Stop</button></div><div class="scroll-box pre" style="max-height:560px">${esc(tr)}</div></div>`;}
  else if(tab==='v')body=`<div class="card"><h3>Vocabulary for listening & reading</h3><p class="muted">These lists now live in your flashcards, sorted by theme.</p><div class="row wrap" style="margin-top:10px"><button class="btn primary" onclick="browseWith({themes:[]})">Open library</button><button class="btn" onclick="studyFilter({types:['vocab']})">Study pure vocab</button></div></div>`;
  else{const bs=sd.booklets||[];
    if(N.li.book){const b=bs.find(x=>x.id===N.li.book);body=b?`<button class="btn ghost sm" onclick="N.li.book=null;rerender()" style="margin-bottom:10px"><i class="ti ti-arrow-left"></i> All booklets</button><div class="card"><h3>${esc(b.name)}</h3><div class="scroll-box pre" style="max-height:640px">${esc(cleanTxt(b.content))}</div></div>`:'';}
    else body=`<div class="grid g-auto">${bs.map(b=>{const th=THEME[b.id];return `<button class="card link tile" style="--c:${th?th.c:'#64748b'}" onclick="N.li.book='${b.id}';rerender()"><div class="ico">${th?th.icon:'📘'}</div><div><h4>${esc(b.name)}</h4><p>${(b.content.length/1000).toFixed(1)}K characters</p></div></button>`;}).join('')}</div>`;}
  return ph('Listening & reading','Your transcript and unit booklets, with text-to-speech.',null,'Practise')+`<div class="tabs">${[['t','Transcript'],['b','Booklets'],['v','Vocabulary']].map(t=>`<button class="${tab===t[0]?'on':''}" onclick="liTab('${t[0]}')">${t[1]}</button>`).join('')}</div>${body}`;
};

/* ───────── AI layer ───────── */
const hasKey=()=>!!(S.set.apiKey&&S.set.apiKey.trim());
async function callAi(prompt,system,max,silent){
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':S.set.apiKey,'anthropic-version':'2023-06-01','content-type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:max||1800,system:system||'',messages:[{role:'user',content:prompt}]})});
    if(!r.ok)throw new Error('API '+r.status+': '+(await r.text()).slice(0,160));
    const d=await r.json();return d.content.map(b=>b.text||'').join('');
  }catch(e){if(!silent)toast('AI error: '+e.message,4000);return null;}
}
function parsePairs(text,defTheme){
  const out=[];
  for(let ln of String(text||'').split('\n')){ln=ln.trim();if(!ln||ln[0]==='#'||ln.startsWith('//'))continue;ln=ln.replace(/^[-*•\d.)\s]+(?=\S)/,m=>/^\d/.test(m)?'':m.replace(/[-*•]\s*/,''));
    for(const sep of [/\s*\|\s*/,/\t/,/\s+[—–]\s+/,/\s+-\s+/,/;\s*/]){const p=ln.split(sep).map(x=>x.trim()).filter(Boolean);if(p.length>=2){let th=defTheme;if(p[2]){const k=fold(p[2]).toLowerCase();const t=THEMES.find(t=>k.includes(t.id)||k.includes(fold(t.short).toLowerCase()));if(t)th=t.id;}out.push({fr:p[0],en:p[1],th:th||'general'});break;}}}
  return out;
}

/* ───────── Tutor ───────── */
N.tu={msgs:[],busy:false};
const TUTOR_SYS='You are a friendly, precise French tutor for a Year 12 Western Australian ATAR French (Second Language) student. Reply mostly in English, with French examples always shown with a translation. Correct errors clearly (show ✗ → ✓), explain the rule briefly, and point out what would lift a WACE written response (connectors, subjunctive, si-clauses, relative pronouns, idioms). Keep answers under 250 words unless asked for more.';
const TUTOR_QUICK=['Correct this paragraph and rate it out of 20:','Explain when to use the subjunctive, with 5 examples about the media.','Give me 6 sophisticated ways to say “I think that…”','Quiz me: 5 sentences to translate, one at a time, on the immigration topic.','What is the difference between the imparfait and the passé composé?','Write a model formal email about youth stress, then explain the structures used.'];
async function tutorSend(text){
  const el=$('#tuin');text=(text||(el?el.value:'')).trim();if(!text)return;
  N.tu.msgs.push({r:'u',t:text});N.tu.draft='';
  if(hasKey()){N.tu.busy=true;rerender();const ctx=N.tu.msgs.slice(-8).map(m=>(m.r==='u'?'Student: ':'Tutor: ')+m.t).join('\n');const a=await callAi(ctx+'\nTutor:',TUTOR_SYS);N.tu.busy=false;N.tu.msgs.push({r:'a',t:a||'(no response)'});rerender();}
  else{N.tu.msgs.push({r:'a',t:'',prompt:TUTOR_SYS+'\n\nStudent question:\n'+text});rerender();}
  setTimeout(()=>window.scrollTo(0,document.body.scrollHeight),50);
}
VIEWS.tutor=function(){
  return ph('AI tutor','Ask anything about French — grammar, corrections, model answers, quizzes.',hasKey()?'':`<button class="btn" onclick="go('settings')"><i class="ti ti-key"></i> Add API key for live replies</button>`,'Practise')+`
  <div style="max-width:800px">
   ${!N.tu.msgs.length?`<div class="card"><h3>Try one of these</h3><div class="col gap-8">${TUTOR_QUICK.map((q,i)=>`<button class="btn" style="justify-content:flex-start;text-align:left;white-space:normal" onclick="tutorSend(TUTOR_QUICK[${i}])">${esc(q)}</button>`).join('')}</div>${hasKey()?'':`<p class="muted" style="margin-top:12px;font-size:13px">No API key set — the tutor will give you a ready-made prompt to paste into any free AI chat.</p>`}</div>`:''}
   <div class="col gap-16" style="margin-top:8px">${N.tu.msgs.map(m=>m.r==='u'?`<div style="align-self:flex-end;max-width:85%" class="card tint"><div class="pre">${esc(m.t)}</div></div>`:m.prompt?`<div class="card"><div class="muted" style="margin-bottom:8px">Copy this into Claude, ChatGPT or Gemini:</div><div class="scroll-box pre" style="max-height:200px;font-size:13px">${esc(m.prompt)}</div><button class="btn primary sm" style="margin-top:10px" onclick="copy(${ea(JSON.stringify(m.prompt))},'Prompt copied')"><i class="ti ti-copy"></i> Copy prompt</button></div>`:`<div class="card"><div class="pre">${esc(m.t)}</div></div>`).join('')}${N.tu.busy?`<div class="card"><span class="spinner"></span> <span class="muted">Thinking…</span></div>`:''}</div>
   <div class="row" style="margin-top:16px;align-items:flex-end"><textarea id="tuin" class="textarea grow" rows="2" placeholder="Ask a question or paste your writing…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();tutorSend()}">${esc(N.tu.draft||'')}</textarea><button class="btn primary lg" onclick="tutorSend()" ${N.tu.busy?'disabled':''}><i class="ti ti-send"></i></button></div>
   ${N.tu.msgs.length?`<button class="btn ghost sm" style="margin-top:8px" onclick="N.tu.msgs=[];rerender()">Clear conversation</button>`:''}</div>`;
};

/* ───────── Add cards ───────── */
N.ad={tab:'one',bulk:'',th:'general',ty:'vocab',prev:[],aiTopic:'',aiCount:15,aiLvl:'B2',aiBusy:false,aiRaw:''};
function adTab(t){N.ad.tab=t;N.ad.prev=[];rerender();}
function adBulkPreview(){const t=($('#adbulk')||{}).value||'';N.ad.bulk=t;N.ad.prev=parsePairs(t,N.ad.th);rerender();}
function adCommit(){
  const th=N.ad.th,ty=N.ad.ty;let add=0,dup=0;
  for(const p of N.ad.prev){const k=keyOf(p.fr);if(!k)continue;const ex=BYKEY.get(k);if(ex&&!ex.del){dup++;continue;}newUserCard({fr:p.fr,en:p.en,th:[p.th||th],ty:[ty]});add++;}
  N.ad.prev=[];N.ad.bulk='';toast(`Added ${add} card${add===1?'':'s'}${dup?` · skipped ${dup} duplicate${dup===1?'':'s'}`:''}`,3000);rerender();
}
function adFile(e){const f=e.target.files[0];if(!f)return;f.text().then(t=>{N.ad.bulk=t;N.ad.prev=parsePairs(t,N.ad.th);N.ad.tab='bulk';rerender();});}
function aiPrompt(){return `Create ${N.ad.aiCount} French vocabulary items for a Year 12 WACE ATAR French student (${N.ad.aiLvl} level) on the topic: "${N.ad.aiTopic||'general high-frequency words'}".\nOutput ONLY lines in the format:\nfrançais | english\nInclude articles for nouns (un/une/le/la), infinitives for verbs, and mix single words with useful chunks. No numbering, no commentary.`;}
async function aiGenerate(){
  N.ad.aiTopic=($('#aitopic')||{}).value||'';N.ad.aiCount=+($('#aicount')||{}).value||15;
  if(!hasKey()){copy(aiPrompt(),'Prompt copied — paste the reply into “Paste a list”');return;}
  N.ad.aiBusy=true;rerender();const r=await callAi(aiPrompt(),'You generate clean vocabulary lists.');N.ad.aiBusy=false;
  if(r){N.ad.prev=parsePairs(r,N.ad.th);}rerender();
}
VIEWS.add=function(){
  const a=N.ad,tabs=[['one','Single card'],['bulk','Paste a list'],['ai','AI generate'],['file','Import file']];
  const opts=`<div class="grid g2" style="gap:12px;margin:12px 0"><div><label class="lbl">Default theme</label><select class="select" onchange="N.ad.th=this.value">${THEMES.map(t=>`<option value="${t.id}" ${a.th===t.id?'selected':''}>${t.icon} ${t.name}</option>`).join('')}</select></div><div><label class="lbl">Category</label><select class="select" onchange="N.ad.ty=this.value">${TYPES.map(t=>`<option value="${t.id}" ${a.ty===t.id?'selected':''}>${t.name}</option>`).join('')}</select></div></div>`;
  const prev=a.prev.length?`<div class="card" style="margin-top:14px"><div class="row between"><h3>Preview · ${a.prev.length} cards</h3><button class="btn primary" onclick="adCommit()">Add all</button></div><div class="list">${a.prev.slice(0,50).map(p=>`<div class="li"><div class="grow"><span class="fr">${esc(p.fr)}</span> <span class="en">— ${esc(p.en)}</span></div>${tagTheme(p.th)}</div>`).join('')}</div>${a.prev.length>50?`<p class="faint" style="margin-top:8px">…and ${a.prev.length-50} more</p>`:''}</div>`:'';
  let body='';
  if(a.tab==='one')body=`<div class="card">${cardForm(null)}<div class="row" style="justify-content:flex-end;margin-top:18px"><button class="btn primary" onclick="saveNew()">Add card</button></div></div>`;
  else if(a.tab==='bulk')body=`<div class="card"><h3>Paste a list</h3><p class="muted" style="font-size:14px">One per line: <span class="mono">français | english</span> (or tab, “—”, “ - ”). Add a third column with a theme name to sort automatically.</p>${opts}<textarea id="adbulk" class="textarea" style="min-height:180px" placeholder="le temps d'écran | screen time&#10;faire défiler | to scroll">${esc(a.bulk)}</textarea><div class="row" style="margin-top:10px"><button class="btn primary" onclick="adBulkPreview()">Preview</button></div></div>${prev}`;
  else if(a.tab==='ai')body=`<div class="card"><h3>Generate with AI</h3><p class="muted" style="font-size:14px">${hasKey()?'Runs directly with your API key.':'No API key — this copies a prompt for any AI chat; paste the reply into “Paste a list”.'}</p>${opts}<div class="grid g2" style="gap:12px"><div><label class="lbl">Topic</label><input id="aitopic" class="input" value="${ea(a.aiTopic)}" placeholder="e.g. cyber-bullying, French rap, gap year"></div><div><label class="lbl">How many</label><input id="aicount" class="input" type="number" min="5" max="40" value="${a.aiCount}"></div></div><div class="row" style="margin-top:14px"><button class="btn primary" onclick="aiGenerate()" ${a.aiBusy?'disabled':''}>${a.aiBusy?'<span class="spinner"></span> Generating…':hasKey()?'Generate':'Copy prompt'}</button></div></div>${prev}`;
  else body=`<div class="card"><h3>Import a file</h3><p class="muted" style="font-size:14px">.txt, .csv or .tsv with two columns (français, english). Anki text exports work.</p><label class="btn" style="margin-top:10px"><i class="ti ti-upload"></i> Choose file<input type="file" accept=".txt,.csv,.tsv,text/plain" onchange="adFile(event)" style="display:none"></label></div>`;
  return ph('Add cards','Add your own vocabulary — one at a time, in bulk, generated by AI or from a file.',null,'Manage')+`<div class="tabs">${tabs.map(t=>`<button class="${a.tab===t[0]?'on':''}" onclick="adTab('${t[0]}')">${t[1]}</button>`).join('')}</div><div style="max-width:820px">${body}</div>`;
};

/* ───────── Settings ───────── */
function setSteps(k,v){const a=String(v).split(/[,\s]+/).map(Number).filter(x=>x>0&&x<1440);S.set[k]=a;save();toast('Steps updated');}
function ivPreview(){const r=retention();return [1,2,3,4].map(g=>{const c={st:2,d:5,s:10,lr:Date.now()-10*DAY,lp:0,rp:5,sp:0,due:0};const o=schedule(c,g,Date.now(),true);return `${RATE[g].l} ${fmtIvl(o.due-Date.now())}`;}).join(' · ');}
function exportCards(kind){
  const cs=CARDS.filter(c=>!c.del),day=dayKey();
  if(kind==='csv'){const rows=[['French','English','Example','Themes','Categories','Sub-section','Tags','State','Due'],...cs.map(c=>[c.fr,c.en,c.ex,c.th.join(' '),c.ty.join(' '),c.sub,c.tg.join(' '),cstat(c),c.st?new Date(c.due).toISOString().slice(0,10):''])].map(r=>r.map(s=>`"${String(s).replace(/"/g,'""')}"`).join(',')).join('\n');download(`french-cards-${day}.csv`,'﻿'+rows,'text/csv');}
  else if(kind==='anki'){download(`french-anki-${day}.txt`,'#separator:tab\n#html:false\n#tags column:4\n'+cs.map(c=>[c.fr,c.en+(c.ex?'\n'+c.ex:''),'',[...c.th,...c.ty].join(' ')].join('\t')).join('\n'),'text/plain');}
  else if(kind==='txt'){download(`french-${day}.txt`,cs.map(c=>`${c.fr} — ${c.en}`).join('\n'),'text/plain');}
}
function backup(){download(`french-backup-${dayKey()}.json`,JSON.stringify(S),'application/json');}
function restore(e){const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t);if(!o.set||!o.u)throw 0;S={...defS(),...o,set:{...DEF_SET,...o.set}};save(true);buildAll();applyTheme();toast('Backup restored');go('home');}catch(er){toast('That doesn’t look like a backup file');}});}
function resetProgress(){CARDS.forEach(c=>{if(c.st||c.rp){c.st=0;c.d=0;c.s=0;c.due=0;c.lr=0;c.rp=0;c.lp=0;c.sp=0;commit(c);}});S.rl=[];S.days={};save(true);toast('Progress reset');rerender();}
function wipeAll(){localStorage.removeItem(SK);S=defS();save(true);buildAll();toast('Everything reset');go('home');}
VIEWS.settings=function(){
  const s=S.set,row=(t,sub,ctl)=>`<div class="row between" style="gap:16px;padding:12px 0;border-bottom:1px solid var(--line)"><div><div style="font-weight:600">${t}</div>${sub?`<div class="muted" style="font-size:13px">${sub}</div>`:''}</div><div>${ctl}</div></div>`;
  const kb=Math.round(JSON.stringify(S).length/1024);
  return ph('Settings','Tune the scheduler, appearance and your data.',null,'Manage')+`
  <div class="grid g2" style="align-items:start">
   <div class="col gap-16">
    <div class="card"><h3>Scheduler</h3>
      ${row('Desired retention',`How likely you want to remember a card when it comes back. Higher = more reviews. <b>${Math.round(retention()*100)}%</b>`,`<input class="range" type="range" min="75" max="97" value="${Math.round(retention()*100)}" oninput="setSet('ret',this.value/100,false);this.parentNode.previousElementSibling.querySelector('b').textContent=this.value+'%';$('#ivp').textContent=ivPreview()" style="width:150px">`)}
      <div class="faint" style="font-size:12.5px;padding:8px 0" >A mature card you got right today would return in: <span id="ivp" class="mono">${ivPreview()}</span></div>
      ${row('New cards per day','',`<input class="input" type="number" min="0" max="200" style="width:90px" value="${s.maxNew}" onchange="setSet('maxNew',+this.value,false)">`)}
      ${row('Max reviews per day','',`<input class="input" type="number" min="10" max="2000" style="width:90px" value="${s.maxRev}" onchange="setSet('maxRev',+this.value,false)">`)}
      ${row('Learning steps (minutes)','New cards. e.g. “1 10”',`<input class="input" style="width:110px" value="${s.steps.join(' ')}" onchange="setSteps('steps',this.value)">`)}
      ${row('Relearning steps (minutes)','After a lapse',`<input class="input" style="width:110px" value="${s.relearn.join(' ')}" onchange="setSteps('relearn',this.value)">`)}
      ${row('Leech threshold','Suspend a card after this many lapses',`<input class="input" type="number" min="3" max="30" style="width:90px" value="${s.leech}" onchange="setSet('leech',+this.value,false)">`)}
      ${row('Day starts at','Hour when “tomorrow” begins',`<select class="select" style="width:100px" onchange="setSet('dayStart',+this.value,false)">${[0,1,2,3,4,5,6].map(h=>`<option value="${h}" ${s.dayStart===h?'selected':''}>${h}:00</option>`).join('')}</select>`)}
    </div>
    <div class="card"><h3>Study</h3>
      ${row('Default answer mode','',`<select class="select" style="width:160px" onchange="setSet('mode',this.value,false)">${MODES.map(m=>`<option value="${m[0]}" ${s.mode===m[0]?'selected':''}>${m[1]}</option>`).join('')}</select>`)}
      ${row('Card order','Smart: struggling cards first, most useful words first. Random: fully shuffled.',seg([['smart','Smart'],['curriculum','In order'],['random','Random']],s.order||'smart',"(v=>setSet('order',v))"))}
      ${row('Default direction','',`<select class="select" style="width:160px" onchange="setSet('dir',this.value,false)">${DIRS.map(m=>`<option value="${m[0]}" ${s.dir===m[0]?'selected':''}>${m[1]}</option>`).join('')}</select>`)}
      ${row('Speak automatically','Read the French aloud when a card appears',switchBtn(s.autoSpeak,`setSet('autoSpeak',${!s.autoSpeak})`))}
      ${row('Show example sentences','On the answer side',switchBtn(s.showEx,`setSet('showEx',${!s.showEx})`))}
      ${row('Strict accents','Typed answers must have exact accents',switchBtn(s.strict,`setSet('strict',${!s.strict})`))}
    </div>
   </div>
   <div class="col gap-16">
    <div class="card"><h3>Appearance</h3>
      ${row('Name','Used in your greeting',`<input class="input" style="width:170px" value="${ea(s.name||'')}" onchange="setSet('name',this.value,false)">`)}
      ${row('Theme','',seg([['auto','Auto'],['light','Light'],['dark','Dark']],s.dark,"(v=>setSet('dark',v))"))}
      ${row('Text size','',`<div class="row gap-6"><button class="btn icon sm" onclick="setSet('fontScale',Math.max(.85,+(S.set.fontScale-.1).toFixed(2)))">−</button><b style="min-width:44px;text-align:center">${Math.round(s.fontScale*100)}%</b><button class="btn icon sm" onclick="setSet('fontScale',Math.min(1.3,+(S.set.fontScale+.1).toFixed(2)))">+</button></div>`)}
      ${row('Reduce motion','',switchBtn(s.reduceMotion,`setSet('reduceMotion',${!s.reduceMotion})`))}
    </div>
    <div class="card"><h3>AI (optional)</h3><p class="muted" style="font-size:13.5px;margin-bottom:10px">An Anthropic API key lets the tutor and card generator answer directly. The key stays in this browser.</p><div class="row"><input id="akey" class="input" type="password" placeholder="sk-ant-…" value="${ea(s.apiKey||'')}"><button class="btn primary" onclick="setSet('apiKey',$('#akey').value.trim(),false);toast('Saved')">Save</button></div></div>
    <div class="card"><h3>Saving &amp; backup</h3>
      <div class="callout ${REMOTE.ok?'ok':''}" style="margin-top:0"><i class="ti ${REMOTE.ok?'ti-circle-check':'ti-alert-triangle'}"></i><div>${REMOTE.ok?(REMOTE.kind==='folder'?`Every change is saved automatically to the folder <b>${esc(REMOTE.name)}</b> (progress, your cards, oral sets).`:'Every change is saved automatically to the <b>userdata</b> folder next to the app.'):REMOTE.needPerm?`Your save folder <b>${esc(REMOTE.name)}</b> needs permission again after restarting the browser.`:'Right now everything is saved <b>in this browser only</b>. Choose a folder so your work is also saved as real files you can copy or back up.'}</div></div>
      <div class="row wrap" style="margin:10px 0 4px">${REMOTE.kind==='server'?'':(REMOTE.needPerm?'<button class="btn primary" onclick="reconnectFolder()"><i class="ti ti-plug-connected"></i> Reconnect folder</button>':`<button class="btn ${REMOTE.ok?'':'primary'}" onclick="chooseFolder()"><i class="ti ti-folder"></i> ${REMOTE.kind==='folder'?'Change save folder':'Choose save folder'}</button>`)}${REMOTE.kind==='folder'?'<button class="btn ghost" onclick="forgetFolder()">Disconnect</button>':''}</div>
      ${FS_OK||REMOTE.kind==='server'?'':'<p class="faint" style="font-size:12.5px">Folder saving needs Chrome or Edge. Other browsers: use “Download backup” below regularly.</p>'}
      <p class="muted" style="font-size:13.5px;margin:12px 0">${CARDS.filter(c=>!c.del).length.toLocaleString()} cards · ${S.rl.length.toLocaleString()} logged reviews · ${kb} KB${S.lastBackup?' · last backup '+fmtDate(S.lastBackup):''}</p>
      <div class="row wrap"><button class="btn" onclick="exportCards('csv')"><i class="ti ti-table"></i> CSV</button><button class="btn" onclick="exportCards('anki')"><i class="ti ti-cards"></i> Anki (.txt)</button><button class="btn" onclick="exportCards('txt')"><i class="ti ti-file-text"></i> Plain text</button></div>
      <div class="divider"></div><div class="row wrap"><button class="btn" onclick="backupAll()"><i class="ti ti-download"></i> Download backup</button><label class="btn"><i class="ti ti-upload"></i> Restore backup<input type="file" accept=".json" onchange="restoreAll(event)" style="display:none"></label></div>
      <div class="divider"></div><div class="row wrap"><button class="btn" style="color:var(--rouge)" onclick="confirmBox('All review history and scheduling will be cleared. Your cards stay.','resetProgress()','Reset progress')">Reset progress</button><button class="btn" style="color:var(--rouge)" onclick="confirmBox('This deletes your custom cards, edits, progress and settings.','wipeAll()','Erase everything')">Erase everything</button></div></div>
    <div class="card"><h3>About</h3><p class="muted" style="font-size:13.5px">Français ATAR · Year 12 · Units 3 &amp; 4. Scheduling uses the FSRS-4.5 memory model with Anki-style learning steps. Vocabulary, phrases, grammar and translation drills are built from your own study documents.</p></div>
   </div></div>`;
};

/* ───────── First run & backup reminder ───────── */
function welcome(){
  modal(`<div class="center" style="margin-bottom:8px"><div class="brand-mark" style="width:56px;height:56px;margin:0 auto 12px;border-radius:16px"><i></i><i></i><i></i></div><h3 style="font-size:26px;margin-bottom:4px">Bienvenue !</h3><p class="muted">A few seconds of setup — you can change all of this later in Settings.</p></div>
   <label class="lbl">Your name <span class="faint">(optional)</span></label><input id="wname" class="input" placeholder="e.g. Léa" value="${ea(S.set.name||'')}" autofocus>
   <div class="divider"></div><label class="lbl">Where should your progress be saved?</label>
   ${FS_OK?`<p class="muted" style="font-size:13.5px;margin-bottom:10px">Pick (or create) a folder — for example <b>Documents/French app data</b>. Everything you do is then saved there automatically as ordinary files.</p><button class="btn primary" onclick="chooseFolder()"><i class="ti ti-folder"></i> Choose save folder</button>`:`<p class="muted" style="font-size:13.5px">Your browser can’t write to a folder, so progress is kept in the browser. Use <b>Settings → Download backup</b> now and then (Chrome or Edge can save to a folder automatically).</p>`}
   <div class="row" style="justify-content:flex-end;margin-top:20px"><button class="btn primary lg" onclick="S.set.name=($('#wname')||{}).value||'';S.welcomed=1;save(true);closeModal();render(false)">Let’s go</button></div>`);
}
function backupNag(){
  if(REMOTE.ok||CARDS.filter(c=>c.rp>0).length<20)return '';
  if(Date.now()-(S.lastBackup||S.created||0)<7*DAY)return '';
  return `<div class="callout" style="margin:0 0 16px"><i class="ti ti-device-floppy"></i><div class="grow"><b>Back up your progress.</b> It’s only stored in this browser${FS_OK?' — choose a save folder to keep it safe automatically':''}.</div><span class="row gap-6">${FS_OK?'<button class="btn sm primary" onclick="chooseFolder()">Choose folder</button>':''}<button class="btn sm" onclick="backupAll()">Download backup</button></span></div>`;
}
