'use strict';
/* ═════════════ Games & drills: sentence builder · match game · grammar quizzes · verb conjugator ═════════════ */

/* ───────── Sentence builder (study mode "build") ───────── */
function buildHtml(s){
  const b=s.build;if(!b)return '';
  const pickedSet=new Set(b.picked);
  return `<div class="bslots" id="bslots">${b.picked.length?b.picked.map((i,k)=>`<button class="bchip on" onclick="buildUnpick(${k})">${esc(b.toks[i])}</button>`).join(''):'<span class="faint" style="font-size:14px">Tap the words in the right order…</span>'}</div>
   <div class="bchips">${b.order.map(i=>`<button class="bchip" ${pickedSet.has(i)?'disabled':''} onclick="buildPick(${i})">${esc(b.toks[i])}</button>`).join('')}</div>
   <div class="row" style="justify-content:center;margin-top:14px;gap:8px"><button class="btn primary" onclick="buildCheck()" ${b.picked.length===b.toks.length?'':'disabled'}>Check <span style="opacity:.6;font-size:12px">↵</span></button><button class="btn ghost" onclick="N.sess.build.picked=[];render(false)">Clear</button><button class="btn" onclick="N.sess.res={ok:false,input:''};N.sess.sug=1;N.sess.shown=true;render(false)">I don’t know</button></div>`;
}
function buildPick(i){const s=N.sess;if(!s||!s.build||s.shown)return;if(!s.build.picked.includes(i))s.build.picked.push(i);render(false);}
function buildUnpick(k){const s=N.sess;if(!s||!s.build||s.shown)return;s.build.picked.splice(k,1);render(false);}
function buildCheck(){
  const s=N.sess;if(!s||!s.build||s.shown||s.build.picked.length!==s.build.toks.length)return;
  const guess=s.build.picked.map(i=>s.build.toks[i]).join(' '),target=s.build.toks.join(' ');
  const ok=normAns(guess,S.set.strict)===normAns(target,S.set.strict);
  const wrongPos=s.build.picked.filter((i,k)=>s.build.toks[i]!==s.build.toks[k]).length;
  s.res={ok,close:!ok&&wrongPos<=2,input:guess};s.sug=ok?3:wrongPos<=2?2:1;s.shown=true;render(false);
}

/* ───────── Match game ───────── */
N.mg=null;
function gamesCard(){
  return `<div class="card" style="margin-top:16px"><h3>🎮 Games</h3><p class="muted" style="font-size:14px;margin-bottom:10px">Quick, fun practice with the words in your current filter (doesn’t change your review schedule).</p><div class="row wrap"><button class="btn" onclick="matchStart()"><i class="ti ti-layout-grid"></i> Match game</button></div></div>`;
}
const _studyView=VIEWS.study;
VIEWS.study=function(){if(N.mg)return matchView();const h=_studyView();return N.sess?h:h+gamesCard();};
function matchStart(){
  const f=N.sf||{};let pool=CARDS.filter(c=>!c.del&&!c.su&&matchFilter(c,f)&&c.fr.length<=30&&c.en.length<=34&&c.fr.trim().split(/\s+/).length<=4);
  if(pool.length<6){toast('Not enough short cards in this filter for a match game');return;}
  const seen=pool.filter(c=>c.st>0);const chosen=shuffle(seen.length>=8?seen:pool).slice(0,8);
  const tiles=shuffle(chosen.flatMap(c=>[{k:c.id+'f',id:c.id,t:c.fr,side:'fr'},{k:c.id+'e',id:c.id,t:c.en,side:'en'}]));
  N.mg={tiles,found:{},sel:null,wrong:null,moves:0,t0:Date.now(),done:false,ms:0,cards:chosen};rerender();
}
function matchTap(k){
  const g=N.mg;if(!g||g.done||g.wrong)return;const tile=g.tiles.find(x=>x.k===k);if(!tile||g.found[tile.id])return;
  if(!g.sel){g.sel=k;rerender();return;}
  if(g.sel===k){g.sel=null;rerender();return;}
  const a=g.tiles.find(x=>x.k===g.sel);g.moves++;
  if(a.id===tile.id&&a.side!==tile.side){g.found[tile.id]=1;g.sel=null;if(Object.keys(g.found).length===g.cards.length){g.done=true;g.ms=Date.now()-g.t0;S.mgBest=Math.min(S.mgBest||1e9,g.ms);save();}rerender();}
  else{g.wrong=[g.sel,k];g.sel=null;rerender();setTimeout(()=>{if(N.mg===g){g.wrong=null;rerender();}},650);}
}
function matchView(){
  const g=N.mg;
  if(g.done)return `<div class="study"><div class="card center" style="padding:40px 24px"><div style="font-size:52px">🏆</div><h3 style="font-size:26px;margin:8px 0">Tout trouvé !</h3><p class="muted">${g.cards.length} pairs in ${(g.ms/1000).toFixed(1)}s · ${g.moves} attempts${S.mgBest===g.ms?' · <b>new personal best!</b>':S.mgBest?' · best '+(S.mgBest/1000).toFixed(1)+'s':''}</p><div class="row" style="justify-content:center;margin-top:18px"><button class="btn primary" onclick="matchStart()">Play again</button><button class="btn" onclick="N.mg=null;rerender()">Back</button></div></div></div>`;
  return `<div class="study" style="max-width:820px"><div class="study-top"><button class="btn icon sm ghost" onclick="N.mg=null;rerender()" aria-label="Quit"><i class="ti ti-x"></i></button><div class="grow">${bar(pct(Object.keys(g.found).length,g.cards.length),'var(--ok)')}</div><b class="mono" id="mgt">0.0s</b></div>
   <div class="mgrid">${g.tiles.map(t=>`<button class="mtile ${g.found[t.id]?'found':''} ${g.sel===t.k?'sel':''} ${g.wrong&&g.wrong.includes(t.k)?'bad':''} ${t.side}" onclick="matchTap('${t.k}')" ${g.found[t.id]?'disabled':''}>${esc(t.t)}</button>`).join('')}</div></div>`;
}
AFTER.study=(function(prev){return function(){prev&&prev();if(N.mg&&!N.mg.done){clearInterval(N._mgi);N._mgi=setInterval(()=>{const el=$('#mgt');if(!el||!N.mg||N.mg.done){clearInterval(N._mgi);return;}el.textContent=((Date.now()-N.mg.t0)/1000).toFixed(1)+'s';},100);}};})(AFTER.study);

/* ───────── Grammar quizzes (auto-built from the grammar tables) ───────── */
N.gq=null;
function gqBuild(sec){
  const qs=[];
  for(const sb of sec.subs)for(const it of sb.items){
    if(it.k!=='t')continue;const rows=(it.rows.length&&typeof it.rows[0]==='string')?[it.rows]:it.rows;
    const hdr=Array.isArray(it.hdr)&&it.hdr.length?(typeof it.hdr[0]==='string'?it.hdr:it.hdr[0]):[];
    if(/Formes/i.test(hdr[1]||'')){ // conjugation tables: which form goes with the pronoun?
      const verb=(sb.title||'').split(' ')[0].toLowerCase();
      for(const r of rows){const forms=String(r[1]||'').split(' · ');if(forms.length<3)continue;const p=rnd(forms.length);const parts=forms[p].split(' ');const pron=parts.length>1&&/^(je|j['’]|tu|il|elle|on|nous|vous|ils|elles)$/i.test(parts[0])?parts[0]:forms[p].slice(0,forms[p].indexOf(' '));const ans=forms[p];
        const others=shuffle(forms.filter((_,i)=>i!==p)).slice(0,3);if(others.length<2)continue;
        qs.push({q:`${verb.toUpperCase()} — ${r[0]}: which is correct?`,sub:`Pick the form for “${(pron||'').replace(/['’]$/,'’')}”`,ans,opts:shuffle([ans,...others])});}
    }else if(rows.every(r=>r.length===2)&&rows.length>=3){
      for(const r of rows){if(!r[0]||!r[1]||r[0].length>70||r[1].length>90)continue;const others=shuffle(rows.filter(x=>x!==r)).slice(0,3).map(x=>x[1]);if(others.length<3)continue;
        qs.push({q:r[0],sub:'Choose the matching French / rule',ans:r[1],opts:shuffle([r[1],...others])});}
    }
  }
  return shuffle(qs).slice(0,10);
}
function gqStart(n){const sec=grData().sections.find(x=>x.n===n);const qs=gqBuild(sec);if(!qs.length){toast('No quiz-able tables in this section — try another one',3000);return;}N.gq={sec:n,qs,i:0,score:0,chosen:null,miss:[]};rerender();}
function gqPick(i){const g=N.gq;if(!g||g.chosen!=null)return;g.chosen=i;const q=g.qs[g.i];if(q.opts[i]===q.ans)g.score++;else g.miss.push(q);rerender();}
function gqNext(){const g=N.gq;g.i++;g.chosen=null;rerender();}
function gqHtml(){
  const g=N.gq,sec=grData().sections.find(x=>x.n===g.sec);
  if(g.i>=g.qs.length)return `<div class="card center" style="padding:34px"><div style="font-size:46px">${g.score>=g.qs.length*.8?'🎉':'💪'}</div><h3 style="font-size:24px;margin:6px 0">${g.score} / ${g.qs.length}</h3><p class="muted">${esc(sec.title)}</p>${g.miss.length?`<div class="divider"></div><div style="text-align:left"><b>Review these:</b>${g.miss.map(q=>`<div style="padding:8px 0;border-bottom:1px dashed var(--line)"><div class="muted" style="font-size:13px">${esc(q.q)}</div><div class="serif" style="font-weight:600">${esc(q.ans)}</div></div>`).join('')}</div>`:''}<div class="row" style="justify-content:center;margin-top:16px"><button class="btn primary" onclick="gqStart(${g.sec})">Another round</button><button class="btn" onclick="N.gq=null;rerender()">Back to the lesson</button></div></div>`;
  const q=g.qs[g.i];
  return `<div class="row between" style="margin-bottom:12px"><button class="btn ghost sm" onclick="N.gq=null;rerender()"><i class="ti ti-arrow-left"></i> Back</button><span class="tag">${g.i+1} / ${g.qs.length}</span></div>${bar(pct(g.i,g.qs.length),'var(--brand)')}
   <div class="card" style="margin-top:14px;padding:26px"><div class="muted" style="font-size:13px;margin-bottom:6px">${esc(q.sub)}</div><div class="serif" style="font-size:24px;font-weight:600;margin-bottom:16px">${esc(q.q)}</div>
   <div class="col gap-8">${q.opts.map((o,i)=>`<button class="btn" style="justify-content:flex-start;white-space:normal;text-align:left;${g.chosen!=null?(o===q.ans?'background:var(--ok-soft);border-color:var(--ok);':(i===g.chosen?'background:var(--rouge-soft);border-color:var(--rouge);':'')):''}" onclick="gqPick(${i})" ${g.chosen!=null?'disabled':''}>${esc(o)}</button>`).join('')}</div>
   ${g.chosen!=null?`<div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn primary" onclick="gqNext()">${g.i+1>=g.qs.length?'See score':'Next'}</button></div>`:''}</div>`;
}
const _grBody=grBody;
grBody=function(){if(N.gq&&!N.gr.q&&N.gq.sec===N.gr.sec)return gqHtml();return _grBody();};
const _grSec=grSectionHtml;
grSectionHtml=function(s){return `<div class="callout info" style="margin:0 0 16px"><i class="ti ti-target"></i><div class="grow">Test yourself on this section.</div><button class="btn sm primary" onclick="gqStart(${s.n})">Quiz me</button></div>`+_grSec(s);};

/* ───────── Verb conjugator ───────── */
N.cj={q:'',verb:null};
const CJ_TENSES=[['Présent','present'],['Passé composé','pc'],['Imparfait','imp'],['Futur simple','fut'],['Conditionnel','cond'],['Subjonctif présent','subj']];
const CJ_PRON=['je','tu','il/elle','nous','vous','ils/elles'];
const ETRE=new Set('aller venir arriver partir entrer sortir monter descendre naître mourir rester retourner tomber passer devenir revenir rentrer'.split(' '));
const CJ_IRREG={ // participle + stems for the most frequent irregular verbs not covered by the document tables
  'être':{pr:['suis','es','est','sommes','êtes','sont'],pp:'été',imp:'ét',fut:'ser',su:['sois','sois','soit','soyons','soyez','soient'],aux:'avoir'},
  'avoir':{pr:['ai','as','a','avons','avez','ont'],pp:'eu',imp:'av',fut:'aur',su:['aie','aies','ait','ayons','ayez','aient'],aux:'avoir'},
  'aller':{pr:['vais','vas','va','allons','allez','vont'],pp:'allé',imp:'all',fut:'ir',su:['aille','ailles','aille','allions','alliez','aillent'],aux:'être'},
  'faire':{pr:['fais','fais','fait','faisons','faites','font'],pp:'fait',imp:'fais',fut:'fer',su:['fasse','fasses','fasse','fassions','fassiez','fassent'],aux:'avoir'},
  'pouvoir':{pr:['peux','peux','peut','pouvons','pouvez','peuvent'],pp:'pu',imp:'pouv',fut:'pourr',su:['puisse','puisses','puisse','puissions','puissiez','puissent'],aux:'avoir'},
  'vouloir':{pr:['veux','veux','veut','voulons','voulez','veulent'],pp:'voulu',imp:'voul',fut:'voudr',su:['veuille','veuilles','veuille','voulions','vouliez','veuillent'],aux:'avoir'},
  'devoir':{pr:['dois','dois','doit','devons','devez','doivent'],pp:'dû',imp:'dev',fut:'devr',su:['doive','doives','doive','devions','deviez','doivent'],aux:'avoir'},
  'savoir':{pr:['sais','sais','sait','savons','savez','savent'],pp:'su',imp:'sav',fut:'saur',su:['sache','saches','sache','sachions','sachiez','sachent'],aux:'avoir'},
  'venir':{pr:['viens','viens','vient','venons','venez','viennent'],pp:'venu',imp:'ven',fut:'viendr',su:['vienne','viennes','vienne','venions','veniez','viennent'],aux:'être'},
  'prendre':{pr:['prends','prends','prend','prenons','prenez','prennent'],pp:'pris',imp:'pren',fut:'prendr',su:['prenne','prennes','prenne','prenions','preniez','prennent'],aux:'avoir'},
  'mettre':{pr:['mets','mets','met','mettons','mettez','mettent'],pp:'mis',imp:'mett',fut:'mettr',su:['mette','mettes','mette','mettions','mettiez','mettent'],aux:'avoir'},
  'voir':{pr:['vois','vois','voit','voyons','voyez','voient'],pp:'vu',imp:'voy',fut:'verr',su:['voie','voies','voie','voyions','voyiez','voient'],aux:'avoir'},
  'dire':{pr:['dis','dis','dit','disons','dites','disent'],pp:'dit',imp:'dis',fut:'dir',su:['dise','dises','dise','disions','disiez','disent'],aux:'avoir'},
  'partir':{pr:['pars','pars','part','partons','partez','partent'],pp:'parti',imp:'part',fut:'partir',su:['parte','partes','parte','partions','partiez','partent'],aux:'être'},
  'croire':{pr:['crois','crois','croit','croyons','croyez','croient'],pp:'cru',imp:'croy',fut:'croir',su:['croie','croies','croie','croyions','croyiez','croient'],aux:'avoir'},
  'écrire':{pr:['écris','écris','écrit','écrivons','écrivez','écrivent'],pp:'écrit',imp:'écriv',fut:'écrir',su:['écrive','écrives','écrive','écrivions','écriviez','écrivent'],aux:'avoir'},
  'lire':{pr:['lis','lis','lit','lisons','lisez','lisent'],pp:'lu',imp:'lis',fut:'lir',su:['lise','lises','lise','lisions','lisiez','lisent'],aux:'avoir'},
  'connaître':{pr:['connais','connais','connaît','connaissons','connaissez','connaissent'],pp:'connu',imp:'connaiss',fut:'connaîtr',su:['connaisse','connaisses','connaisse','connaissions','connaissiez','connaissent'],aux:'avoir'},
  'vivre':{pr:['vis','vis','vit','vivons','vivez','vivent'],pp:'vécu',imp:'viv',fut:'vivr',su:['vive','vives','vive','vivions','viviez','vivent'],aux:'avoir'},
  'recevoir':{pr:['reçois','reçois','reçoit','recevons','recevez','reçoivent'],pp:'reçu',imp:'recev',fut:'recevr',su:['reçoive','reçoives','reçoive','recevions','receviez','reçoivent'],aux:'avoir'},
  'ouvrir':{pr:['ouvre','ouvres','ouvre','ouvrons','ouvrez','ouvrent'],pp:'ouvert',imp:'ouvr',fut:'ouvrir',su:['ouvre','ouvres','ouvre','ouvrions','ouvriez','ouvrent'],aux:'avoir'},
  'sortir':{pr:['sors','sors','sort','sortons','sortez','sortent'],pp:'sorti',imp:'sort',fut:'sortir',su:['sorte','sortes','sorte','sortions','sortiez','sortent'],aux:'être'}};
const IMP_END=['ais','ais','ait','ions','iez','aient'],FUT_END=['ai','as','a','ons','ez','ont'],COND_END=['ais','ais','ait','ions','iez','aient'];
const eli=(p,f)=>/^[aeiouhéèêâîôû]/i.test(f)?(p==='je'?'j’':p)+f:p+' '+f;
const withP=(forms)=>forms.map((f,i)=>{const p=CJ_PRON[i];return p==='je'?eli('je',f):p+' '+f;});
function regularStem(inf){
  if(/er$/.test(inf))return {g:'er',s:inf.slice(0,-2)};if(/ir$/.test(inf))return {g:'ir',s:inf.slice(0,-2)};if(/re$/.test(inf))return {g:'re',s:inf.slice(0,-2)};return null;
}
function conjugate(inf){
  inf=inf.trim().toLowerCase();if(!inf)return null;
  const doc=docVerb(inf);if(doc)return {inf,doc,src:'doc'};
  const ir=CJ_IRREG[inf];let base;
  if(ir){base=ir;}
  else{const r=regularStem(inf);if(!r)return null;
    let s=r.s,pr,pp,imp,fut,su;
    if(r.g==='er'){const soft=/[cg]$/.test(s);pr=[s+'e',s+'es',s+'e',s+(soft?(/c$/.test(s)?'ç':'ge'):'')+'ons',s+'ez',s+'ent'];if(/c$/.test(s))pr[3]=s.slice(0,-1)+'çons';if(/g$/.test(s))pr[3]=s+'eons';pp=s+'é';imp=s;fut=inf;su=[s+'e',s+'es',s+'e',s+'ions',s+'iez',s+'ent'];}
    else if(r.g==='ir'){pr=[s+'is',s+'is',s+'it',s+'issons',s+'issez',s+'issent'];pp=s+'i';imp=s+'iss';fut=inf;su=[s+'isse',s+'isses',s+'isse',s+'issions',s+'issiez',s+'issent'];}
    else{pr=[s+'s',s+'s',s,s+'ons',s+'ez',s+'ent'];pp=s+'u';imp=s;fut=s;su=[s+'e',s+'es',s+'e',s+'ions',s+'iez',s+'ent'];}
    base={pr,pp,imp:r.g==='ir'?s+'iss':imp,fut,su,aux:ETRE.has(inf)?'être':'avoir',regular:true};
    if(r.g==='er'){base.imp=s;}
    if(r.g==='ir')base.imp=s+'iss';
  }
  const AV={avoir:['ai','as','a','avons','avez','ont'],être:['suis','es','est','sommes','êtes','sont']}[base.aux];
  const pcForms=AV.map((a,i)=>{let pp=base.pp;if(base.aux==='être'&&i>=3)pp+='(e)s';else if(base.aux==='être')pp+='(e)';return a+' '+pp;});
  const stemImp=base.imp,stemFut=base.fut;
  const impf=IMP_END.map((e,i)=>stemImp+e),fut=FUT_END.map(e=>stemFut+(/[rs]$/.test(stemFut)&&/^(?!$)/.test(stemFut)&&!/r$/.test(stemFut)?'r':'')+e);
  const futStem=/r$/.test(stemFut)?stemFut:stemFut+(/(er|ir)$/.test(inf)&&!CJ_IRREG[inf]?'':'r');
  const futs=FUT_END.map(e=>(/r$/.test(stemFut)?stemFut:stemFut+'r')+e);
  const conds=COND_END.map(e=>(/r$/.test(stemFut)?stemFut:stemFut+'r')+e);
  const isReg=!!base.regular;
  return {inf,src:isReg?'regular':'table',regular:isReg,tenses:{present:withP(base.pr),pc:withP(pcForms),imp:withP(impf),fut:withP(futs),cond:withP(conds),subj:withP(base.su).map((x,i)=>i===0?x.replace(/^je /,'que je ').replace(/^j’/,'que j’'):'que '+x)}};
}
function docVerb(inf){
  const sec=grData().sections.find(x=>x.n===18);if(!sec)return null;
  for(const sb of sec.subs){const name=(sb.title||'').split(' ')[0].toLowerCase();if(name===inf.toLowerCase()){
    const it=sb.items.find(x=>x.k==='t');if(!it)return null;const rows=(it.rows.length&&typeof it.rows[0]==='string')?[it.rows]:it.rows;return {title:sb.title,rows};}}
  return null;
}
function cjList(){const sec=grData().sections.find(x=>x.n===18);return sec?sec.subs.filter(x=>x.title).map(x=>x.title.split(' ')[0].toLowerCase()):[];}
const cjSearch=debounce(v=>{N.cj.q=v;const el=$('#cjres');if(el)el.innerHTML=cjResult();},200);
function cjSet(v){N.cj.q=v;rerender();}
function cjResult(){
  const r=conjugate(N.cj.q);
  if(!N.cj.q.trim())return `<div class="card"><h3>Verbs from your grammar guide</h3><div class="chips">${cjList().map(v=>chip(esc(v),false,`cjSet('${ea(v)}')`)).join('')}</div><p class="muted" style="margin-top:12px;font-size:13.5px">Or type any infinitive (e.g. <i>réussir</i>, <i>voyager</i>, <i>prendre</i>) — regular verbs are conjugated automatically.</p></div>`;
  if(!r)return empty('🔎','Not sure about that verb','Type an infinitive ending in -er, -ir or -re, or pick one of the verbs above.');
  if(r.src==='doc')return `<div class="card"><div class="row between"><h3 style="margin:0">${esc(r.doc.title)}</div><button class="btn sm" onclick="speak('${ea(r.inf)}')"><i class="ti ti-volume"></i></button></div><div class="tbl-wrap"><table class="tbl fr"><thead><tr><th>Temps</th><th>Formes</th></tr></thead><tbody>${r.doc.rows.map(x=>`<tr><td>${esc(x[0])}</td><td>${esc(x[1]).replace(/ · /g,'<br>')}</td></tr>`).join('')}</tbody></table></div></div>`;
  return `<div class="card"><div class="row between"><h3 style="margin:0">${esc(r.inf)}</h3><button class="btn sm" onclick="speak('${ea(r.inf)}')"><i class="ti ti-volume"></i></button></div>${r.regular?'<div class="callout" style="margin:12px 0"><i class="ti ti-alert-triangle"></i><div>Conjugated with the <b>regular pattern</b> — check irregular or spelling-change verbs (appeler, acheter, payer…).</div></div>':''}
  <div class="grid g3" style="margin-top:12px">${CJ_TENSES.map(([l,k])=>`<div class="card flat tint"><b style="font-size:13px" class="muted">${l}</b>${r.tenses[k].map(f=>`<div class="serif" style="font-size:16px;padding:2px 0">${esc(f)}</div>`).join('')}</div>`).join('')}</div></div>`;
}
VIEWS.conjugate=function(){
  return ph('Verb conjugator','Type an infinitive to see six key tenses. The 14 model verbs come straight from your grammar guide.',null,'Writing')+`<div class="search" style="max-width:520px;margin-bottom:16px"><i class="ti ti-search"></i><input class="input" placeholder="e.g. être, finir, voyager…" value="${ea(N.cj.q)}" oninput="cjSearch(this.value)" autofocus></div><div id="cjres">${cjResult()}</div>`;
};
