'use strict';
/* ═════════════ Home & Progress ═════════════ */
function greet(){const h=new Date().getHours();return h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir';}
const HOME_TIPS=[
  ['Un subjonctif par paragraphe.','One correct subjunctive per paragraph is one of the cheapest ways to move up a band.'],
  ['L · O · T · S','Linking words · Opinions · Tenses variety · Stunning structures — check all four before you hand in.'],
  ['Learn fifteen cold, not four hundred vaguely.','Pick ~15 phrases from the Phrase bank and use them deliberately.'],
  ['Don’t translate word for word.','Plan in French. Use the dot points in the question, in the same order.'],
  ['Ce qui / ce que / ce dont','A relative pronoun beyond qui/que is an instant sophistication marker.'],
  ['Si + imparfait → conditionnel','Si j’avais le choix, je partirais au Canada. Then try the pluperfect version.']];

VIEWS.home=function(){
  const c=counts(),day=dayObj(),newLeft=Math.max(0,(S.set.maxNew||20)-(day.nw||0));
  const nNew=Math.min(c.new,newLeft),due=c.due;
  const tip=HOME_TIPS[new Date().getDate()%HOME_TIPS.length];
  const goalDone=day.r,goal=Math.max(1,(S.set.maxNew||20)+Math.min(due,60));
  const themes=THEMES.map(t=>{const cs=CARDS.filter(x=>!x.del&&x.th.includes(t.id));const tot=cs.length,seen=cs.filter(x=>x.st>0).length,mat=cs.filter(x=>!x.su&&x.st===2&&x.s>=21).length;return {t,tot,seen,mat,due:cs.filter(x=>isDue(x)).length};}).filter(x=>x.tot);
  const weak=CARDS.filter(x=>!x.del&&x.st>0&&x.lp>0).sort((a,b)=>weak_(b)-weak_(a)).slice(0,6);
  const tiles=[
    ['phrases','ti-quote','Phrase bank','Openers, connectors, subjunctive triggers, idioms — 900+ writing phrases.','#7c4dd6'],
    ['texttypes','ti-file-text','Text types','20 formats with must-include checklists, phrases and model answers.','#dc2f55'],
    ['grammar','ti-book-2','Grammar','18 sections, every tense, pronoun and the ten costly errors.','#0f9d6b'],
    ['translate','ti-language-hiragana','Translation drill','150 graded sentences EN→FR with an answer key.','#d9822b'],
    ['guide','ti-notebook','Written guide','Exam plan, marking key, alternatives to basic words, past papers.','#2b6de0'],
    ['oral','ti-microphone-2','Oral prep','Practice questions, your scripts and text-to-speech.','#0e94b3']];
  return `${backupNag()}
  <div class="hero">
    <div class="eyebrow" style="color:#fff;opacity:.85">${new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})}</div>
    <h2>${greet()} ! ${S.set.name?esc(S.set.name):''}</h2>
    <p>${due+nNew>0?`You have <b>${due+nNew}</b> card${due+nNew===1?'':'s'} waiting today.`:'You’re all caught up. Try a phrase drill or the translation practice.'}${streak()?` 🔥 ${streak()}-day streak.`:''}</p>
    <div class="q3"><div><b style="color:#bcd3ff">${nNew}</b><span>New</span></div><div><b style="color:#ffc0c9">${c.learnDue}</b><span>Learning</span></div><div><b style="color:#b6f2d6">${c.rev}</b><span>To review</span></div></div>
    <div class="row wrap" style="margin-top:24px"><button class="btn primary lg" onclick="startStudy()"><i class="ti ti-player-play-filled"></i> ${due+nNew>0?'Study now':'Study anyway'}</button><button class="btn lg" onclick="go('browse')"><i class="ti ti-cards"></i> Browse ${c.total.toLocaleString()} cards</button></div>
  </div>

  <div class="grid g4" style="margin-top:18px">
    <div class="card stat"><div class="row between"><div><div class="v">${goalDone}</div><div class="l">Reviewed today</div><div class="s">${day.ag?day.ag+' again · ':''}${fmtDur(day.ms||0)} studied</div></div>${ring(pct(goalDone,goal),pct(goalDone,goal)+'%','var(--brand)',64)}</div></div>
    ${stat(c.mature.toLocaleString(),'Mature cards','interval ≥ 21 days','var(--ok)')}
    ${stat(pct(c.total-c.new,c.total)+'%','Seen so far',`${(c.total-c.new).toLocaleString()} of ${c.total.toLocaleString()}`)}
    ${stat(retNow(),'True retention','last 30 days · target '+Math.round(retention()*100)+'%',retNowColor())}
  </div>

  <div class="sec-title">Continue learning</div>
  <div class="grid g3">${tiles.map(t=>`<button class="card link tile" style="--c:${t[4]}" onclick="go('${t[0]}')"><div class="ico"><i class="ti ${t[1]}"></i></div><div><h4>${t[2]}</h4><p>${t[3]}</p></div></button>`).join('')}</div>

  <div class="sec-title">By theme</div>
  <div class="grid g-auto">${themes.map(({t,tot,seen,mat,due})=>`<button class="card link theme-card" style="--c:${t.c};text-align:left" onclick="studyFilter({themes:['${t.id}']})">
    <div class="row between" style="margin-bottom:8px"><span class="em">${t.icon}</span>${due?`<span class="badge red">${due} due</span>`:''}</div>
    <h4 class="serif" style="font-size:16px;margin-bottom:2px">${t.short}</h4><div class="faint" style="font-size:12.5px;margin-bottom:12px">${tot} cards · ${seen} seen · ${mat} mature</div>${bar(pct(seen,tot),t.c)}</button>`).join('')}</div>

  <div class="grid g2" style="margin-top:22px">
    <div class="card"><h3>💡 Astuce du jour</h3><p class="serif" style="font-size:20px;margin-bottom:6px">${tip[0]}</p><p class="muted">${tip[1]}</p></div>
    <div class="card"><div class="row between"><h3>Needs attention</h3>${weak.length?`<button class="btn sm" onclick="startStudy(null,{mode:'weak'})">Drill these</button>`:''}</div>
      ${weak.length?weak.map(w=>`<div class="row between" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span class="serif" style="font-weight:600">${esc(w.fr)}</span><span class="faint" style="font-size:12.5px">${w.lp} lapse${w.lp===1?'':'s'}</span></div>`).join(''):`<p class="muted">Words you keep forgetting will appear here once you’ve started reviewing.</p>`}</div>
  </div>`;
};
const weak_=c=>(c.lp||0)*1.0+(c.d||5)*0.2;
function trueRetention(days){
  const since=Date.now()-days*DAY;let pass=0,tot=0;
  for(let i=S.rl.length-1;i>=0;i--){const r=S.rl[i];if(r[0]<since)break;if(r[3]===2){tot++;if(r[2]>1)pass++;}}
  return tot>=10?Math.round(100*pass/tot):null;
}
function retNow(){const r=trueRetention(30);return r==null?'—':r+'%';}
function retNowColor(){const r=trueRetention(30);return r==null?'':r>=Math.round(retention()*100)-3?'var(--ok)':'var(--warn)';}

/* ═════════════ Progress / stats ═════════════ */
VIEWS.stats=function(){
  const c=counts(),now=Date.now();
  // heatmap: 26 weeks
  const cells=[];const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-(26*7-1)-((start.getDay()+6)%7));
  let max=1;for(const v of Object.values(S.days))if(v.r>max)max=v.r;
  for(let i=0;i<26*7;i++){const d=new Date(start.getTime()+i*DAY);if(d.getTime()>now+DAY)break;const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const v=(S.days[k]||{}).r||0;const l=v===0?0:v<max*.25?1:v<max*.5?2:v<max*.75?3:4;cells.push(`<i data-l="${l}" title="${d.toLocaleDateString('en-AU',{day:'numeric',month:'short'})}: ${v} reviews"></i>`);}
  // forecast next 14 days
  const fc=new Array(14).fill(0),eod=endOfToday(now);
  for(const x of CARDS){if(x.del||x.su||x.st!==2)continue;const d=Math.floor((x.due-eod+DAY)/DAY);if(d<=0)fc[0]++;else if(d<14)fc[d]++;}
  const fmax=Math.max(1,...fc);
  const tot7=[...Array(7)].map((_,i)=>(S.days[dayKey(now-i*DAY)]||{}).r||0).reduce((a,b)=>a+b,0);
  const totalRev=Object.values(S.days).reduce((a,b)=>a+(b.r||0),0),totalMs=Object.values(S.days).reduce((a,b)=>a+(b.ms||0),0);
  // maturity
  const seg3=[['New',c.new,'var(--new)'],['Learning',c.learn,'var(--learn)'],['Young',c.young,'var(--warn)'],['Mature',c.mature,'var(--review)'],['Suspended',c.susp,'var(--ink-3)']];
  // by theme + by type
  const rowFor=(label,color,list)=>{const t=list.length,seen=list.filter(x=>x.st>0).length,mat=list.filter(x=>x.st===2&&x.s>=21).length;return `<div style="margin-bottom:14px"><div class="row between" style="margin-bottom:6px"><b style="font-size:13.5px">${label}</b><span class="faint" style="font-size:12px">${mat} mature · ${seen}/${t} seen</span></div><div class="bar" style="position:relative"><i style="width:${pct(seen,t)}%;--c:color-mix(in srgb,${color} 40%,var(--surface-3));position:absolute;inset:0 auto 0 0"></i><i style="width:${pct(mat,t)}%;--c:${color};position:absolute;inset:0 auto 0 0"></i></div></div>`;};
  const live=CARDS.filter(x=>!x.del);
  const hardest=live.filter(x=>x.st>0).sort((a,b)=>(b.lp*2+b.d)-(a.lp*2+a.d)).slice(0,8);
  const leeches=live.filter(x=>x.tg.includes('leech'));
  const ans=S.rl.slice(-500);const gs=[0,0,0,0,0];ans.forEach(r=>gs[r[2]]++);
  return ph('Progress','Your memory model in numbers — reviews, forecast, retention and the words that need work.',`<button class="btn" onclick="go('settings')"><i class="ti ti-adjustments"></i> Scheduler settings</button>`,'Statistics')+`
  <div class="grid g4">${stat(streak(),'Day streak','🔥 keep it going','var(--rouge)')}${stat(tot7,'Reviews · 7 days')}${stat(totalRev.toLocaleString(),'Reviews · all time',fmtDur(totalMs)+' studied')}${stat(retNow(),'True retention','30-day pass rate on mature reviews')}</div>
  <div class="card" style="margin-top:16px"><h3>Study calendar</h3><div class="heat">${cells.join('')}</div><div class="row faint" style="font-size:12px;margin-top:8px;gap:6px">Less <div class="heat" style="grid-template-rows:14px;grid-auto-flow:column"><i></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i></div> More</div></div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>Forecast · next 14 days</h3><div class="bars">${fc.map((n,i)=>`<div title="${n} due"><span>${n||''}</span><i style="height:${Math.max(2,n/fmax*100)}%;${i===0?'background:var(--rouge)':''}"></i><span>${i===0?'Today':i===1?'+1':'+'+i}</span></div>`).join('')}</div></div>
    <div class="card"><h3>Card maturity</h3>
      <div class="row" style="height:16px;border-radius:99px;overflow:hidden;gap:2px;margin:6px 0 16px">${seg3.filter(s=>s[1]).map(s=>`<div style="flex:${s[1]};background:${s[2]}" title="${s[0]}: ${s[1]}"></div>`).join('')}</div>
      <div class="grid g2" style="gap:8px">${seg3.map(s=>`<div class="row"><span class="dot" style="width:10px;height:10px;border-radius:50%;background:${s[2]}"></span><span class="grow">${s[0]}</span><b>${s[1].toLocaleString()}</b></div>`).join('')}</div>
      <div class="divider"></div><div class="faint" style="font-size:12.5px">Last 500 answers — Again ${pct(gs[1],ans.length)}% · Hard ${pct(gs[2],ans.length)}% · Good ${pct(gs[3],ans.length)}% · Easy ${pct(gs[4],ans.length)}%</div></div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>By theme</h3>${THEMES.map(t=>rowFor(t.icon+' '+t.short,t.c,live.filter(x=>x.th.includes(t.id)))).join('')}</div>
    <div class="card"><h3>By category</h3>${TYPES.map(t=>{const l=live.filter(x=>x.ty.includes(t.id));return l.length?rowFor(t.name,t.c,l):'';}).join('')}</div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><div class="row between"><h3>Hardest words</h3>${hardest.length?`<button class="btn sm" onclick="startStudy(null,{mode:'weak'})">Drill</button>`:''}</div>${hardest.length?hardest.map(w=>`<div class="row between" style="padding:8px 0;border-bottom:1px dashed var(--line)"><div><b class="serif">${esc(w.fr)}</b><div class="faint" style="font-size:12.5px">${esc(w.en)}</div></div><span class="tag">${w.lp} lapses · D${w.d.toFixed(1)}</span></div>`).join(''):'<p class="muted">Nothing yet — hard words will surface after a few reviews.</p>'}</div>
    <div class="card"><div class="row between"><h3>Leeches</h3>${leeches.length?`<button class="btn sm" onclick="browseWith({tags:['leech']})">View</button>`:''}</div><p class="muted">Cards you’ve failed ${S.set.leech||8}+ times are suspended automatically and tagged <span class="tag">leech</span>. Rewrite them with a mnemonic or example sentence, then unsuspend.</p><p style="margin-top:10px"><b>${leeches.length}</b> leech${leeches.length===1?'':'es'} right now.</p></div>
  </div>`;
};
