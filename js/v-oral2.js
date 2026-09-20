'use strict';
/* ═════════════ Oral — spinning wheel · mock exam ═════════════ */

/* ───────── Wheel ───────── */
N.wh={topic:'all',only:'all',rot:0,spinning:false,pick:null,used:{},showA:false,noRepeat:true,t:null};
function whQs(){return oQs().filter(q=>q.topic!=='closing'&&(N.wh.topic==='all'||q.topic===N.wh.topic)&&(N.wh.only==='all'||(N.wh.only==='todo'&&!q.ok)||(N.wh.only==='star'&&q.star)));}
function whSet(k,v){N.wh[k]=v;N.wh.pick=null;N.wh.showA=false;rerender();}
function wheelPalette(qs){return qs.map((q,i)=>{const c=otopic(q.topic).c;return c.startsWith('#')?c:hashColor(q.topic);});}
function drawWheel(){
  const cv=$('#wheelcv');if(!cv)return;const qs=whQs(),n=qs.length,S_=1040;cv.width=S_;cv.height=S_;const c=cv.getContext('2d'),R=S_/2;
  c.clearRect(0,0,S_,S_);c.save();c.translate(R,R);
  if(!n){c.fillStyle='#e4dfd1';c.beginPath();c.arc(0,0,R-6,0,7);c.fill();c.restore();return;}
  const a=2*Math.PI/n,cols=wheelPalette(qs);c.rotate(N.wh.rot);
  for(let i=0;i<n;i++){
    c.beginPath();c.moveTo(0,0);c.arc(0,0,R-6,i*a,(i+1)*a);c.closePath();
    c.fillStyle=cols[i];c.fill();c.fillStyle=i%2?'rgba(255,255,255,.14)':'rgba(0,0,0,.06)';c.fill();
    c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=n>60?1:3;c.stroke();
    if(N.wh.used[qs[i].id]){c.fillStyle='rgba(255,255,255,.5)';c.fill();}
    if(n<=40){c.save();c.rotate((i+.5)*a);c.fillStyle='#fff';c.font=(n<=14?'600 30px':'700 24px')+' IBM Plex Sans, sans-serif';c.textAlign='right';c.textBaseline='middle';
      const lab=n<=14?String(qs[i].q).replace(/\s+/g,' ').slice(0,22)+(qs[i].q.length>22?'…':''):String(i+1);c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=4;c.fillText(lab,R-46,0);c.restore();}
  }
  c.restore();
}
function whSpin(){
  const W=N.wh;if(W.spinning)return;const qs=whQs();if(!qs.length){toast('No questions in this selection');return;}
  oStop();let pool=qs.map((q,i)=>i).filter(i=>!W.noRepeat||!W.used[qs[i].id]);if(!pool.length){W.used={};pool=qs.map((q,i)=>i);toast('Every question done — starting a new round');}
  const idx=pool[rnd(pool.length)],a=2*Math.PI/qs.length,theta=(idx+.2+Math.random()*.6)*a;
  let target=-Math.PI/2-theta;const two=2*Math.PI;target=((target%two)+two)%two;
  const start=W.rot,cur=((start%two)+two)%two;let end=start+(target-cur+two)%two+two*(5+rnd(3));
  W.spinning=true;W.pick=null;W.showA=false;const t0=performance.now(),dur=4800+rnd(1200);
  const ease=x=>1-Math.pow(1-x,4);
  (function frame(t){const p=Math.min(1,(t-t0)/dur);W.rot=start+(end-start)*ease(p);drawWheel();
    if(p<1)requestAnimationFrame(frame);else{W.spinning=false;W.rot=end;W.pick=qs[idx].id;W.used[qs[idx].id]=1;rerender();const q=qs[idx];setTimeout(()=>speak((q.subs&&q.subs.length?q.subs.join(' '):q.q),0.92),250);}})(t0);
}
function whTimer(sec){clearInterval(N.wh.t&&N.wh.t.iv);const t=N.wh.t={end:Date.now()+sec*1000,sec,iv:null};t.iv=setInterval(()=>{const el=$('#wht');if(!el){clearInterval(t.iv);return;}const left=Math.max(0,Math.round((t.end-Date.now())/1000));el.textContent=mmss(left);const b=$('#whb');if(b)b.style.width=(100-left/t.sec*100)+'%';if(left<=0){clearInterval(t.iv);toast('⏰ Time — wrap up your answer!');}},250);rerender();}
function whMark(ok){const q=oFind(N.wh.pick);if(!q)return;if(ok){q.ok=true;q.n=(q.n||0)+1;}else q.star=true;saveO();toast(ok?'Marked as rehearsed':'Marked as priority');rerender();}
function oralWheel(){
  const qs=whQs(),W=N.wh,topics=[...new Set(oQs().filter(q=>q.topic!=='closing').map(q=>q.topic))];
  const q=W.pick?oFind(W.pick):null,t=q?otopic(q.topic):null;
  return `<div class="row wrap" style="margin-bottom:14px"><div class="chips grow">${chip('All topics',W.topic==='all',"whSet('topic','all')")}${topics.map(id=>{const tt=otopic(id);return chip(`${tt.icon} ${esc(tt.short)}`,W.topic===id,`whSet('topic','${ea(id)}')`);}).join('')}</div>${seg([['all','All'],['todo','To rehearse'],['star','★ Priority']],W.only,"(v=>whSet('only',v))")}</div>
  <div class="grid g2" style="align-items:center;gap:26px">
   <div><div class="wheel-wrap"><div class="wheel-pin"></div><canvas id="wheelcv"></canvas><button class="wheel-hub" onclick="whSpin()" ${W.spinning||!qs.length?'disabled':''} aria-label="Spin">SPIN</button></div>
    <div class="row" style="justify-content:center;margin-top:18px;flex-wrap:wrap"><span class="muted" style="font-size:13.5px">${qs.length} question${qs.length===1?'':'s'} on the wheel · ${Object.keys(W.used).filter(id=>qs.some(x=>x.id===id)).length} done this round</span><label class="row gap-6" style="font-size:13.5px"><input type="checkbox" ${W.noRepeat?'checked':''} onchange="N.wh.noRepeat=this.checked;rerender()"> No repeats</label><button class="btn sm ghost" onclick="N.wh.used={};rerender()">New round</button></div></div>
   <div>${q?`<div class="oq" style="--c:${t.c};margin:0"><div class="oq-h"><div class="oq-q oral-sel">${(q.subs&&q.subs.length?q.subs:[q.q]).map(s=>`<span class="sub">${esc(s)}</span>`).join('')}<div class="row wrap gap-6" style="margin-top:10px"><span class="tag t" style="--c:${t.c}">${t.icon} ${esc(t.short)}</span></div></div></div>
      <div class="oq-body" style="padding-left:20px"><div class="row wrap gap-8"><button class="btn sm" onclick="oSayQ('${q.id}')"><i class="ti ti-volume"></i> Repeat</button><button class="btn sm" onclick="whTimer(60)"><i class="ti ti-clock"></i> 60s</button><button class="btn sm" onclick="whTimer(90)">90s</button><button class="btn sm ghost" onclick="N.wh.showA=!N.wh.showA;rerender()">${W.showA?'Hide answer':'Show model answer'}</button></div>
      ${W.t?`<div style="margin-top:12px"><div class="row between"><b class="serif" id="wht" style="font-size:26px">${mmss(Math.max(0,Math.round((W.t.end-Date.now())/1000)))}</b></div><div class="bar"><i id="whb" style="width:0%"></i></div></div>`:''}
      ${W.showA&&q.a?`<div class="ans oral-sel" style="margin-top:12px">${answerHtml(q.a)}</div>`:W.showA?'<p class="muted" style="margin-top:10px">No model answer stored for this question.</p>':''}
      <div class="row wrap" style="margin-top:14px"><button class="btn primary" style="background:var(--ok);border-color:var(--ok)" onclick="whMark(true)">Nailed it</button><button class="btn" onclick="whMark(false)">Need more practice</button><button class="btn ghost" onclick="whSpin()">Spin again</button></div></div></div>`
     :`<div class="card center" style="padding:44px 24px"><div style="font-size:52px">🎡</div><h3 style="font-size:22px;margin:8px 0">Spin for a question</h3><p class="muted">Click the wheel. The question is read aloud — answer out loud as if in the exam, then check the model answer.</p></div>`}</div></div>`;
}

/* ───────── Mock exam ───────── */
O.mcfg=O.mcfg||null;
const MCFG_DEF={partA:true,mic:false,prepMin:10,bMin:4,cMin:8,fuRate:50,hideText:false,topics:[],maxAns:75,voice:0.92};
const mcfg=()=>({...MCFG_DEF,...(O.mcfg||{})});
function mcSet(k,v){O.mcfg={...mcfg(),[k]:v};saveO();rerender();}
function mcTopic(t){const c=mcfg();const a=c.topics.includes(t)?c.topics.filter(x=>x!==t):[...c.topics,t];mcSet('topics',a);}
const SR_OK=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
const REACT=['D’accord.','Très bien.','Je vois.','Intéressant.','Ah bon ?','Hmm, d’accord.','Merci.','C’est vrai ?'];
function oralMock(){
  if(N.mk)return mockRun();
  const c=mcfg(),qs=oQs().filter(q=>q.topic!=='stimulus'&&q.topic!=='closing'),topics=[...new Set(qs.map(q=>q.topic))],st=O.stim;
  const hist=(O.mock||[]).slice(0,4);
  return `<div class="grid g2" style="align-items:start">
   <div class="col gap-16">
    <div class="card"><h3>Mock oral interview</h3><p class="muted" style="font-size:14.5px;margin-bottom:12px">Follows the real format: <b>Part A</b> ${c.prepMin} min prep → greeting &amp; WASN → <b>Part B</b> ≈${c.bMin} min on your stimulus → <b>Part C</b> ≈${c.cMin} min conversation. The examiner <b>speaks</b> to you; answer out loud and press <kbd class="mono" style="border:1px solid var(--line-2);padding:1px 7px;border-radius:6px">Space</kbd> when you’re done.</p>
     <button class="btn primary lg" onclick="mockStart()" ${qs.length?'':'disabled'}><i class="ti ti-player-play-filled"></i> Start the interview</button>${qs.length?'':'<p class="muted" style="margin-top:8px;font-size:13px">Add questions first (Manage tab).</p>'}</div>
    <div class="card"><h3>Options</h3>
      ${mrow('Part A preparation','10-minute prep timer with a notes booklet',switchBtn(c.partA,`mcSet('partA',${!c.partA})`))}
      ${mrow('Listen only — hide the question text','Realistic: no reading, just listening',switchBtn(c.hideText,`mcSet('hideText',${!c.hideText})`))}
      ${mrow('Live speech-to-text','Transcribes you so follow-ups react to what you really said · Chrome/Edge · uses the microphone'+(SR_OK?'':' — <b>not supported in this browser</b>'),switchBtn(c.mic&&SR_OK,`${SR_OK?`mcSet('mic',${!c.mic})`:"toast('Use Chrome or Edge for live transcription')"}`))}
      ${mrow('Side questions',`How often the examiner follows up: <b>${c.fuRate}%</b>`,`<input class="range" type="range" min="0" max="100" step="10" value="${c.fuRate}" style="width:140px" onchange="mcSet('fuRate',+this.value)">`)}
      ${mrow('Part B / Part C length','minutes',`<span class="row gap-6"><input class="input" type="number" min="1" max="10" value="${c.bMin}" style="width:64px" onchange="mcSet('bMin',+this.value)"><input class="input" type="number" min="2" max="15" value="${c.cMin}" style="width:64px" onchange="mcSet('cMin',+this.value)"></span>`)}
      ${mrow('Examiner speaking speed','',seg([[0.8,'Slow'],[0.92,'Normal'],[1.05,'Fast']],c.voice,"(v=>mcSet('voice',v))"))}
    </div></div>
   <div class="col gap-16">
    <div class="card"><h3>Topics for Part C</h3><p class="muted" style="font-size:13.5px;margin-bottom:10px">${c.topics.length?'Only these topics.':'All topics from this set (the examiner samples across them).'}</p><div class="chips">${topics.map(id=>{const t=otopic(id);return chip(`${t.icon} ${esc(t.short)}`,c.topics.includes(id),`mcTopic('${ea(id)}')`,{n:qs.filter(q=>q.topic===id).length});}).join('')}</div></div>
    <div class="card"><div class="row between"><h3>Your stimulus</h3><button class="btn sm ghost" onclick="oTab('fmt')">Edit</button></div>${st.title||st.notes?`<b>${esc(st.title||'(untitled)')}</b><div class="muted" style="font-size:13.5px">${st.unit?otopic(st.unit).icon+' '+esc(otopic(st.unit).name):''}</div>${st.notes?`<p class="muted" style="font-size:13.5px;margin-top:6px;white-space:pre-wrap">${esc(st.notes.slice(0,220))}</p>`:''}`:`<p class="muted" style="font-size:14px">Not set. Add it in <b>Exam format → My stimulus</b> so the examiner can ask about it; otherwise generic stimulus questions are used.</p>`}</div>
    ${hist.length?`<div class="card"><h3>Recent mocks</h3>${hist.map(h=>`<div class="row between" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span>${new Date(h.date).toLocaleDateString('en-AU',{day:'numeric',month:'short'})} · ${h.n} answers</span><span class="tag">${h.avg!=null?h.avg.toFixed(1)+' / 5':'not scored'}</span></div>`).join('')}</div>`:''}
   </div></div>`;
}
const mrow=(t,s,ctl)=>`<div class="row between" style="gap:14px;padding:11px 0;border-bottom:1px solid var(--line)"><div><div style="font-weight:600">${t}</div>${s?`<div class="muted" style="font-size:12.5px">${s}</div>`:''}</div><div>${ctl}</div></div>`;

/* engine */
function mockAbort(){const m=N.mk;if(!m)return;m.dead=true;clearInterval(m.iv);oStop();mkStopRec();if(m.resolve)m.resolve('abort');N.mk=null;}
const mkAbort=mockAbort;
const _go=window.go;window.go=function(r,p,k){if(N.mk&&r!=='oral')mockAbort();_go(r,p,k);};
const _oTab=window.oTab;window.oTab=function(t){if(N.mk&&t!=='mock')mockAbort();_oTab(t);};
function mockStart(){
  const c=mcfg();oStop();
  const base=oQs().filter(q=>q.topic!=='stimulus'&&q.topic!=='closing'&&(!c.topics.length||c.topics.includes(q.topic)));
  const byT={};shuffle(base).forEach(q=>(byT[q.topic]=byT[q.topic]||[]).push(q));
  const order=[];let more=true;while(more){more=false;for(const t of shuffle(Object.keys(byT))){if(byT[t].length){order.push(byT[t].shift());more=true;}}}
  const st=O.stim,bq=[];
  if(st.title)bq.push({text:`Pouvez-vous me décrire votre stimulus ? ${st.title}.`,src:'stim'});
  oQs().filter(q=>q.topic==='stimulus').forEach(q=>bq.push({text:(q.subs&&q.subs[0])||q.q,q,src:'set'}));
  (st.unit?oQs().filter(q=>q.topic===st.unit).slice(0,40):[]).sort(()=>Math.random()-.5).slice(0,3).forEach(q=>bq.push({text:(q.subs&&q.subs[0])||q.q,q,src:'unit'}));
  shuffle(FU_TOPIC.stimulus).forEach(t=>bq.push({text:t,src:'gen'}));
  N.mk={cfg:c,phase:'init',order,bq:[...new Map(bq.map(x=>[x.text,x])).values()],log:[],cur:null,answering:false,speaking:false,transcript:'',started:Date.now(),tB:0,tC:0,dead:false,repeats:0,scores:{},iv:null,notes:''};
  if(c.partA)mockPrep();else mockRoom();
  render();
}
function mockPrep(){
  const m=N.mk;m.phase='prep';m.prepEnd=Date.now()+m.cfg.prepMin*60000;
  m.iv=setInterval(()=>{if(!N.mk||N.mk!==m){clearInterval(m.iv);return;}const left=Math.max(0,Math.round((m.prepEnd-Date.now())/1000));const el=$('#mkprep');if(el)el.textContent=mmss(left);if(left<=0){clearInterval(m.iv);toast('Preparation time is over');mockRoom();}},500);
}
function mockRoom(){const m=N.mk;if(!m)return;clearInterval(m.iv);const nt=$('#mknotes');if(nt)m.notes=nt.value;m.phase='room';render();mockScript();}
function mkWait(){return new Promise(res=>{N.mk.resolve=res;});}
async function mkAsk(text,o){
  o=o||{};const m=N.mk;if(!m||m.dead)return 'abort';m.cur={text,en:o.en||'',lang:o.lang||'fr',kind:o.kind||'q'};m.speaking=true;m.answering=false;m.transcript='';m.interim='';rerender();
  await sayAsync(text,m.cfg.voice,o.lang==='en'?'en-AU':'fr-FR');
  if(N.mk!==m||m.dead)return 'abort';
  m.speaking=false;m.answering=true;m.t0=Date.now();rerender();if(m.cfg.mic&&SR_OK&&o.lang!=='en')mkStartRec();
  const r=await mkWait();mkStopRec();m.answering=false;
  const ms=Date.now()-m.t0;if(o.log!==false)m.log.push({text,ms,tr:m.transcript.trim(),part:m.phase,q:o.q||null,fu:!!o.fu,intr:r==='interrupt',rep:m.curRep||0});m.curRep=0;
  return r;
}
function mkDone(){const m=N.mk;if(!m||!m.answering||!m.resolve)return;const r=m.resolve;m.resolve=null;r('done');}
function mkRepeat(){const m=N.mk;if(!m||!m.answering||!m.cur)return;m.curRep=(m.curRep||0)+1;m.repeats++;mkStopRec();m.answering=false;m.speaking=true;rerender();const cur=m.cur;sayAsync(cur.text,m.cfg.voice,cur.lang==='en'?'en-AU':'fr-FR').then(()=>{if(N.mk!==m||m.dead)return;m.speaking=false;m.answering=true;m.t0=Date.now()-0;rerender();if(m.cfg.mic&&SR_OK&&cur.lang!=='en')mkStartRec();});}
function mkRec(){return window.SpeechRecognition||window.webkitSpeechRecognition;}
function mkStartRec(){
  const m=N.mk,SR=mkRec();if(!SR||!m)return;try{const r=new SR();r.lang='fr-FR';r.continuous=true;r.interimResults=true;
    r.onresult=e=>{let fin='',it='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)fin+=t+' ';else it+=t;}if(fin)m.transcript+=fin;m.interim=it;const el=$('#mklive');if(el)el.textContent=(m.transcript+it).trim()||'…';};
    r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){toast('Microphone blocked — continuing without transcription',3500);m.cfg.mic=false;m.recStop=true;}};
    r.onend=()=>{if(N.mk===m&&m.answering&&!m.recStop){try{r.start();}catch(e){}}};r.start();m.rec=r;m.recStop=false;}catch(e){m.cfg.mic=false;}
}
function mkStopRec(){const m=N.mk;if(!m||!m.rec)return;m.recStop=true;try{m.rec.stop();}catch(e){}m.rec=null;}
function mkPickFollowup(main,transcript,skipRate){
  const m=N.mk;if(!skipRate&&Math.random()*100>=m.cfg.fuRate)return null;
  let list=[];
  if(transcript&&transcript.split(/\s+/).length>=8)list=genFollowups(transcript,main&&main.q?main.q.topic:'general',4,main&&main.q?main.q.q:'').slice(0,3);
  if(!list.length&&main&&main.q&&(main.q.a||main.q.fu.length))list=ensureFU(main.q).filter(x=>!m.log.some(l=>l.text===x));
  if(!list.length)list=shuffle(FU_TOPIC[(main&&main.q&&main.q.topic)||'general']||FU_TOPIC.general).filter(x=>!m.log.some(l=>l.text===x));
  return list.length?list[rnd(Math.min(list.length,3))]:null;
}
async function mockScript(){
  const m=N.mk,v=(x)=>m&&!m.dead&&N.mk===m;
  m.phase='greet';if(await mkAsk('Bonjour. Comment allez-vous ?',{en:'Hello. How are you?',kind:'greet',log:false})==='abort')return;
  if(await mkAsk('I am your interviewer for the French: Second Language practical oral examination today. Can you read me your WA student number in English please?',{lang:'en',kind:'wasn',log:false})==='abort')return;
  if(await mkAsk('Thank you. I’ll repeat that number.',{lang:'en',kind:'ack',log:false,en:'(the marker repeats your number)'})==='abort')return;
  if(await mkAsk('Qu’est-ce que vous avez apporté pour votre examen aujourd’hui ?',{en:'What did you bring for your exam today?',kind:'bring',log:true})==='abort')return;
  // ── Part B
  m.phase='B';m.tB=Date.now();const bLimit=m.cfg.bMin*60000;m.iv=setInterval(mockTick,500);
  let bi=0;
  while(v()&&Date.now()-m.tB<bLimit&&bi<m.bq.length){
    const item=m.bq[bi++];const r=await mkAsk(item.text,{q:item.q,kind:'B'});if(r==='abort')return;
    if(Date.now()-m.tB>=bLimit)break;
    const fu=await mkFollowup({q:item.q},m.log[m.log.length-1].tr);
    if(fu){const rr=await mkAsk(REACT[rnd(REACT.length)]+' '+fu,{fu:true,kind:'B'});if(rr==='abort')return;}
  }
  if(!v())return;
  if(await mkAsk('Avez-vous quelque chose d’autre à dire ?',{en:'Anything else to add?',kind:'more',log:false})==='abort')return;
  if(await mkAsk('Merci. Pourriez-vous me rendre votre livret, s’il vous plaît ?',{en:'Could you hand back your booklet, please?',kind:'booklet',log:false})==='abort')return;
  // ── Part C
  m.phase='C';m.tC=Date.now();const cLimit=m.cfg.cMin*60000;
  if(await mkAsk('On va maintenant passer à la conversation.',{en:'Now we move on to the conversation.',kind:'intro',log:false})==='abort')return;
  m.tC=Date.now();let ci=0;
  while(v()&&Date.now()-m.tC<cLimit&&ci<m.order.length){
    const q=m.order[ci++];const txt=(q.subs&&q.subs[0])||q.q;const r=await mkAsk(txt,{q,kind:'C'});if(r==='abort')return;
    if(Date.now()-m.tC>=cLimit)break;
    const fu=await mkFollowup({q},m.log[m.log.length-1].tr);
    if(fu){const rr=await mkAsk(REACT[rnd(REACT.length)]+' '+fu,{q,fu:true,kind:'C'});if(rr==='abort')return;}
  }
  if(!v())return;
  m.phase='end';clearInterval(m.iv);
  await mkAsk('Merci. C’est la fin de l’entretien.',{en:'Thank you. That is the end of the interview.',kind:'end',log:false});
  if(!v())return;m.phase='summary';m.answering=false;m.speaking=false;rerender();
}
function mockTick(){
  const m=N.mk;if(!m||m.dead){return;}
  const now=Date.now(),bel=m.phase==='B'?now-m.tB:m.tB?m.cfg.bMin*60000:0,cel=m.phase==='C'?now-m.tC:0;
  const b=$('#mkB'),c=$('#mkC'),a=$('#mkA');
  if(b){b.textContent=mmss(Math.max(0,Math.round((m.cfg.bMin*60000-bel)/1000)));const bar=$('#mkBb');if(bar)bar.style.width=Math.min(100,bel/(m.cfg.bMin*60000)*100)+'%';}
  if(c){c.textContent=mmss(Math.max(0,Math.round((m.cfg.cMin*60000-cel)/1000)));const bar=$('#mkCb');if(bar)bar.style.width=Math.min(100,cel/(m.cfg.cMin*60000)*100)+'%';}
  if(a&&m.answering){const s=Math.round((now-m.t0)/1000);a.textContent=mmss(s);if(s>=m.cfg.maxAns&&m.resolve&&m.cur&&m.cur.kind!=='wasn'){const r=m.resolve;m.resolve=null;toast('The examiner interrupts — keep answers focused',2500);r('interrupt');}}
}
document.addEventListener('keydown',e=>{
  if(N.route!=='oral'||!N.mk||e.ctrlKey||e.metaKey||e.altKey)return;const tag=(e.target.tagName||'').toLowerCase();if(tag==='input'||tag==='textarea'||tag==='select')return;
  if(e.key===' '||e.key==='Enter'){e.preventDefault();if(N.mk.phase==='prep')mockRoom();else mkDone();}
  else if(e.key==='r'||e.key==='R')mkRepeat();
});
function mockRun(){
  const m=N.mk;
  if(m.phase==='prep'){
    const st=O.stim;
    return `<div class="mock"><div class="mock-stage"><div class="faint" style="font:600 12px var(--font-body);letter-spacing:.12em">PART A · PREPARATION</div><div class="serif" id="mkprep" style="font-size:64px;font-weight:600">${mmss(Math.max(0,Math.round((m.prepEnd-Date.now())/1000)))}</div>
      <p class="muted" style="max-width:520px">Prepare notes on your stimulus in the booklet below. In the real exam only these notes come into the room — <b>don’t read them out</b>.</p>${st.title?`<div class="tag" style="font-size:13px">📎 ${esc(st.title)}</div>`:''}
      <textarea id="mknotes" class="textarea" style="max-width:640px;min-height:170px" placeholder="Your preparation booklet…">${esc(m.notes||st.notes||'')}</textarea>
      <div class="row"><button class="btn primary lg" onclick="mockRoom()">Enter the interview room <span class="faint" style="opacity:.7;font-size:12px">space</span></button><button class="btn ghost" onclick="mockAbort();rerender()">Cancel</button></div></div></div>`;
  }
  if(m.phase==='summary')return mockSummary();
  const c=m.cur||{text:'…',en:'',lang:'fr'},p=m.phase;
  const hide=m.cfg.hideText&&!m.showText&&m.answering===false&&false;
  const partLabel={greet:'Greeting',B:'Part B · Stimulus',C:'Part C · Conversation',end:'Conclusion',init:'Starting…',room:'Starting…'}[p]||'';
  return `<div class="mock"><div class="mock-top"><span class="tag" style="font-size:13px">${partLabel}</span><div class="timers grow"><div><div class="lab"><span>Part B</span><b id="mkB" class="mono">${mmss(m.cfg.bMin*60)}</b></div><div class="bar"><i id="mkBb" style="width:0%"></i></div></div><div><div class="lab"><span>Part C</span><b id="mkC" class="mono">${mmss(m.cfg.cMin*60)}</b></div><div class="bar"><i id="mkCb" style="width:0%;--c:var(--ok)"></i></div></div></div><button class="btn sm ghost" onclick="confirmBox('Stop the interview now? You will lose this run.','mockAbort();rerender()','End')">End</button></div>
   <div class="mock-stage"><div class="examiner ${m.speaking?'talking':''}">🎓</div>
    <div class="faint" style="font:600 11px var(--font-body);letter-spacing:.12em;text-transform:uppercase">${m.speaking?'Examiner is speaking…':m.answering?'Your turn':''}</div>
    ${m.cfg.hideText&&c.kind!=='greet'?`<div class="mock-cap en faint" style="font-size:18px">🎧 Listening only — press <b>R</b> to repeat${m.showQ?'':' · <a href="#" onclick="N.mk.showQ=true;rerender();return false">show text</a>'}</div>${m.showQ?`<div class="mock-cap ${c.lang==='en'?'en':''}">${esc(c.text)}</div>`:''}`:`<div class="mock-cap ${c.lang==='en'?'en':''}">${esc(c.text)}</div>`}
    ${c.en&&(!m.cfg.hideText||m.showQ)?`<div class="mock-cap en" style="font-size:16px">${esc(c.en)}</div>`:''}
    ${m.answering?`<div class="row" style="gap:16px"><span class="mono" style="font-size:20px"><span class="recdot"></span><span id="mkA">00:00</span></span></div>${m.cfg.mic&&SR_OK&&c.lang!=='en'?`<div class="livebox" id="mklive">${esc((m.transcript+(m.interim||'')).trim())||'Listening…'}</div>`:''}
      <button class="btn primary donebtn" onclick="mkDone()">I’m done <span style="opacity:.7;font-size:13px">· Space</span></button><button class="btn ghost sm" onclick="mkRepeat()">Pourriez-vous répéter ? <span class="faint">· R</span></button>`:''}
   </div></div>`;
}
function mockSummary(){
  const m=N.mk,logs=m.log,totalMs=Date.now()-m.started,fus=logs.filter(l=>l.fu).length,intr=logs.filter(l=>l.intr).length,avgMs=logs.length?logs.reduce((a,l)=>a+l.ms,0)/logs.length:0;
  const crit=['Comprehension','Response','Language range','Language accuracy','Speech'];
  return `<div class="mock"><div class="card center" style="padding:30px"><div style="font-size:48px">🎓</div><h3 style="font-size:26px;margin:6px 0">Interview finished</h3><p class="muted">${logs.length} answers · ${fus} follow-up${fus===1?'':'s'} · ${intr?intr+' interruption'+(intr===1?'':'s')+' · ':''}${m.repeats} repeat${m.repeats===1?'':'s'} · average answer ${Math.round(avgMs/1000)}s · total ${fmtDur(totalMs)}</p></div>
   <div class="card" style="margin-top:14px"><h3>Score yourself honestly</h3>${crit.map((c,i)=>`<div class="row between" style="padding:9px 0;border-bottom:1px dashed var(--line);gap:12px"><span style="font-weight:600;min-width:150px">${c}</span><span class="row gap-4">${[1,2,3,4,5].map(n=>`<button class="btn sm ${m.scores[i]===n?'primary':''}" style="min-width:34px" onclick="N.mk.scores[${i}]=${n};rerender()">${n}</button>`).join('')}</span></div>`).join('')}</div>
   <div class="card" style="margin-top:14px"><h3>Your answers</h3><div class="list">${logs.map(l=>`<div class="li" style="align-items:flex-start"><span class="tag" style="margin-top:3px">${l.part}${l.fu?' · side q':''}</span><div class="grow"><div class="serif" style="font-weight:600">${esc(l.text)}</div><div class="faint" style="font-size:12.5px">${Math.round(l.ms/1000)}s${l.intr?' · interrupted':''}${l.rep?' · repeated ×'+l.rep:''}</div>${l.tr?`<div class="muted" style="font-size:13.5px;margin-top:4px">“${esc(l.tr.slice(0,220))}${l.tr.length>220?'…':''}”</div>`:''}</div></div>`).join('')||'<p class="muted" style="padding:14px">No answers recorded.</p>'}</div></div>
   <div class="row" style="justify-content:center;margin-top:18px"><button class="btn primary" onclick="mockSave()">Save &amp; finish</button><button class="btn" onclick="mockAbort();mockStart()">Run another</button></div></div>`;
}
function mockSave(){
  const m=N.mk,sc=Object.values(m.scores),avg=sc.length?sc.reduce((a,b)=>a+b,0)/sc.length:null;
  O.mock.unshift({date:Date.now(),n:m.log.length,fu:m.log.filter(l=>l.fu).length,avg,scores:m.scores,ms:Date.now()-m.started});O.mock=O.mock.slice(0,30);saveO();mockAbort();toast('Saved');rerender();
}
AFTER.oral=function(){if(N.or.tab==='wheel')drawWheel();};

/* Follow-up = AI (if an API key is set) → falls back to the local generator. Never blocks the interview for long. */
async function mkFollowup(main,transcript){
  const m=N.mk;if(!m||Math.random()*100>=m.cfg.fuRate)return null;
  const src=(transcript&&transcript.split(/\s+/).length>=6)?transcript:(main&&main.q&&main.q.a)||'';
  if(hasKey()&&src){
    const qtext=(main&&main.q&&main.q.q)||'';
    const prompt=`You are the examiner in a Year 12 WACE French oral exam. The question was: « ${qtext} »\nThe candidate ${transcript?'said':'(model answer)'}: « ${src.slice(0,900)} »\nWrite ONE natural follow-up question in French (vous form, max 25 words) that reacts to something specific they said and pushes them to justify, give an example or consider the opposite view. Output only the question.`;
    try{const r=await Promise.race([callAi(prompt,'You are a friendly but probing French oral examiner.',120,true),new Promise(res=>setTimeout(()=>res(null),6500))]);
      const line=r&&r.split('\n').map(x=>x.trim()).find(x=>x.length>8);if(line)return line.replace(/^["«»\s]+|["«»\s]+$/g,'');}catch(e){}
  }
  return mkPickFollowup(main,transcript,true);
}
