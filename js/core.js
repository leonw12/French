'use strict';
/* ═════════════ core: utils · constants · state · card model · storage ═════════════ */
const SK='french-app-v2', OLD_SK='french-app-v1';
const DAY=864e5, HOUR=36e5, MIN=6e4;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ea=esc;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=(a,n)=>shuffle(a).slice(0,n);
const uid=()=>'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fold=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'');
const keyOf=fr=>fold(fr).toLowerCase().replace(/\((m|f|pl|mpl|fpl|m\/f|f\/m)\)/g,'').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
const fnv=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);};
const pct=(a,b)=>b?Math.round(100*a/b):0;
const plural=(n,w,p)=>n+' '+(n===1?w:(p||w+'s'));
const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};};

/* ── Themes & categories ── */
const THEMES=[
  {id:'technology', name:'Technologie et moi',        short:'Technologie', icon:'💻', c:'#2b6de0'},
  {id:'media',      name:'Les médias',                short:'Médias',      icon:'📰', c:'#7c4dd6'},
  {id:'cinema',     name:'Le cinéma',                 short:'Cinéma',      icon:'🎬', c:'#dc2f55'},
  {id:'musique',    name:'La musique',                short:'Musique',     icon:'🎵', c:'#d6398f'},
  {id:'avenir',     name:'Mes projets d’avenir',  short:'Avenir',      icon:'🎓', c:'#0f9d6b'},
  {id:'immigration',name:'L’immigration',         short:'Immigration', icon:'🌍', c:'#d9822b'},
  {id:'youth',      name:'Les problèmes des jeunes',  short:'Jeunes',      icon:'👥', c:'#0e94b3'},
  {id:'olympics',   name:'Les Jeux Olympiques',       short:'JO',          icon:'🏅', c:'#c79a0b'},
  {id:'environment',name:'L’environnement',    short:'Environnement',icon:'🌱', c:'#3d9a4b'},
  {id:'health',     name:'La santé & le bien-être',short:'Santé',      icon:'🩺', c:'#e0563f'},
  {id:'society',    name:'Société & politique',       short:'Société',     icon:'🏛️', c:'#5b6bd6'},
  {id:'sport',      name:'Sport & loisirs',           short:'Sport',       icon:'⚽', c:'#e08a00'},
  {id:'travel',     name:'Voyage & culture',          short:'Voyage',      icon:'✈️', c:'#1a9bb3'},
  {id:'general',    name:'Général & transversal',     short:'Général',     icon:'🔗', c:'#64748b'},
];
const THEME=Object.fromEntries(THEMES.map(t=>[t.id,t]));
const TYPES=[
  {id:'vocab',      name:'Pure vocab',            icon:'📚', c:'#2b6de0', d:'Words & short terms'},
  {id:'verb',       name:'Verbs',                 icon:'🏃', c:'#0f9d6b', d:'Infinitives & verb phrases'},
  {id:'adjective',  name:'Adjectives',            icon:'🎨', c:'#d6398f', d:''},
  {id:'adverb',     name:'Adverbs',               icon:'⚡', c:'#c79a0b', d:''},
  {id:'connector',  name:'Connectors',            icon:'🔗', c:'#7c4dd6', d:'Linking words & discourse markers'},
  {id:'opinion',    name:'Opinion phrases',       icon:'💭', c:'#dc2f55', d:'Giving, nuancing, agreeing'},
  {id:'phrase',     name:'Phrases & sentences',   icon:'💬', c:'#0e94b3', d:'Chunks and full sentences'},
  {id:'opener',     name:'Openers',               icon:'✉️', c:'#2b6de0', d:'Ways to start a text'},
  {id:'closer',     name:'Closers',               icon:'🏁', c:'#d9822b', d:'Ways to finish a text'},
  {id:'subjunctive',name:'Subjunctive triggers',  icon:'🎯', c:'#dc2f55', d:'Phrases that force the subjunctive'},
  {id:'structure',  name:'Impressive structures', icon:'✨', c:'#c79a0b', d:'Grammar patterns that lift a script'},
  {id:'idiom',      name:'Idioms',                icon:'🎭', c:'#d6398f', d:'Expressions imagées'},
  {id:'proverb',    name:'Proverbs',              icon:'📜', c:'#8a6d3b', d:'Dictons'},
  {id:'colloquial', name:'Colloquial',            icon:'😎', c:'#0f9d6b', d:'Le français familier'},
  {id:'keyphrase',  name:'Topic key phrases',     icon:'🔑', c:'#25348e', d:'Ready-made sentences per theme'},
  {id:'writing',    name:'Writing toolkit',       icon:'✍️', c:'#25348e', d:'Everything useful for the written exam'},
];
const TYPE=Object.fromEntries(TYPES.map(t=>[t.id,t]));
const SRC={b2:'B2 expansion',v3000:'Vocabulary 3000',master:'Master list',list:'Vocab list',phrases:'Phrases for Writing',guide:'Written guide',expr:'Y12 Expressions',mine:'My cards',legacy:'Booklets'};
const FLAGS=[null,{n:'Red',c:'#e5484d'},{n:'Orange',c:'#f76b15'},{n:'Green',c:'#30a46c'},{n:'Blue',c:'#3e63dd'},{n:'Pink',c:'#d6409f'},{n:'Purple',c:'#8e4ec6'}];
const themeName=id=>(THEME[id]||{}).short||id;
const themeColor=id=>(THEME[id]||{c:'#64748b'}).c;

/* ── Settings ── */
const DEF_SET={order:'smart',dark:'auto',strict:false,fontScale:1,reduceMotion:false,ret:0.9,maxNew:20,maxRev:200,steps:[1,10],relearn:[10],leech:8,dayStart:4,dir:'FR→EN',mode:'flip',autoSpeak:false,showEx:true,maxIvl:36500,apiKey:'',sessionLen:0};
const defS=()=>({v:2,set:{...DEF_SET},u:{},uc:[],rl:[],days:{},trans:{},gram:{},chk:{},saved:[],filters:[],mig:0,created:Date.now()});
let S=defS();
let _saveT=null,_saveErr=false;
/* ── Oral store (separate file: userdata/oral.json) ── */
const OK='french-oral-v1';
const defO=()=>({v:1,sets:[],active:null,stim:{title:'',unit:'',notes:''},mock:[],seeded:false,updatedAt:0});
let O=defO();
function loadO(){try{const raw=localStorage.getItem(OK);if(raw){O={...defO(),...JSON.parse(raw)};return true;}}catch(e){console.warn('oral load failed',e);}return false;}

/* ── Saving: 1) a folder the user picks (File System Access API, Chrome/Edge — works from a double-clicked file)
            2) the local Windows server (userdata/*.json)   3) browser storage (always kept as a copy)                ── */
const REMOTE={ok:false,kind:'browser',synced:false,t:{},last:{},err:false,lastSaved:0,needPerm:false,name:''};
let BACKEND=null;
const FS_OK=typeof window.showDirectoryPicker==='function';
/* tiny IndexedDB helper for the folder handle */
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('french-atar',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function idbGet(k){try{const d=await idb();return await new Promise((res,rej)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}catch(e){return null;}}
async function idbSet(k,v){try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=res;t.onerror=()=>rej(t.error);});}catch(e){}}
async function idbDel(k){try{const d=await idb();await new Promise(res=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').delete(k);t.oncomplete=res;});}catch(e){}}

const serverBackend={kind:'server',name:'userdata folder',
  async get(name){try{const r=await fetch('/api/data/'+name,{cache:'no-store'});return r.ok?await r.json():null;}catch(e){return null;}},
  async put(name,body){const r=await fetch('/api/data/'+name,{method:'PUT',headers:{'content-type':'application/json'},body});if(!r.ok)throw new Error('put failed');}};
function folderBackend(dir){return {kind:'folder',name:dir.name,dir,
  async get(name){try{const fh=await dir.getFileHandle(name+'.json');const f=await fh.getFile();const t=await f.text();return t?JSON.parse(t):null;}catch(e){return null;}},
  async put(name,body){
    try{const old=await dir.getFileHandle(name+'.json').then(h=>h.getFile()).then(f=>f.text());if(old&&old.length>2){const b=await dir.getFileHandle(name+'.bak.json',{create:true});const w=await b.createWritable();await w.write(old);await w.close();}}catch(e){}
    const fh=await dir.getFileHandle(name+'.json',{create:true});const w=await fh.createWritable();await w.write(body);await w.close();}};}

async function initBackend(){
  BACKEND=null;REMOTE.ok=false;REMOTE.kind='browser';REMOTE.needPerm=false;
  try{if(location.protocol.startsWith('http')){const r=await fetch('/api/ping',{cache:'no-store'});if(r.ok&&(await r.json()).files){BACKEND=serverBackend;}}}catch(e){}
  if(!BACKEND&&FS_OK){
    const h=await idbGet('dir');
    if(h){let p='prompt';try{p=await h.queryPermission({mode:'readwrite'});}catch(e){}
      if(p==='granted')BACKEND=folderBackend(h);else{REMOTE.needPerm=true;REMOTE.name=h.name;REMOTE.handle=h;}}
  }
  if(BACKEND){REMOTE.ok=true;REMOTE.kind=BACKEND.kind;REMOTE.name=BACKEND.name;}
  return REMOTE.ok;
}
async function chooseFolder(){
  if(!FS_OK){toast('Your browser can’t save to a folder — use Chrome or Edge, or use Export backup.',4500);return;}
  try{const h=await window.showDirectoryPicker({mode:'readwrite',id:'french-atar'});await idbSet('dir',h);
    BACKEND=folderBackend(h);REMOTE.ok=true;REMOTE.kind='folder';REMOTE.name=h.name;REMOTE.needPerm=false;REMOTE.synced=false;REMOTE.last={};
    const changed=await syncFromFiles(true);if(changed){buildAll();applyTheme();if(typeof seedOral==='function')seedOral();}
    toast('Saving to the folder “'+h.name+'”',3000);closeModal();render(false);
  }catch(e){if(e&&e.name!=='AbortError')toast('Could not use that folder: '+e.message,4000);}
}
async function reconnectFolder(){
  const h=REMOTE.handle;if(!h)return chooseFolder();
  try{const p=await h.requestPermission({mode:'readwrite'});if(p==='granted'){BACKEND=folderBackend(h);REMOTE.ok=true;REMOTE.kind='folder';REMOTE.needPerm=false;REMOTE.synced=false;const changed=await syncFromFiles(true);if(changed){buildAll();applyTheme();}toast('Reconnected to “'+h.name+'”');render(false);}}
  catch(e){toast('Permission was not granted');}
}
async function forgetFolder(){await idbDel('dir');BACKEND=null;REMOTE.ok=false;REMOTE.kind='browser';REMOTE.needPerm=false;REMOTE.handle=null;toast('Save folder disconnected — data stays in this browser');render(false);}

async function remoteGet(name){return BACKEND?BACKEND.get(name):null;}
function remotePut(name,obj,now){
  if(!REMOTE.ok||!REMOTE.synced||!BACKEND)return;const body=JSON.stringify(obj);if(REMOTE.last[name]===body)return;
  const go=()=>{REMOTE.last[name]=body;Promise.resolve(BACKEND.put(name,body)).then(()=>{REMOTE.err=false;REMOTE.lastSaved=Date.now();const el=$('#savechip');if(el)el.innerHTML=saveChipHtml();}).catch(e=>{REMOTE.err=true;REMOTE.last[name]='';console.warn('save failed',e);});};
  clearTimeout(REMOTE.t[name]);if(now)go();else REMOTE.t[name]=setTimeout(go,700);
}
function pushState(now){const {uc,...rest}=S;remotePut('state',rest,now);remotePut('custom-cards',{uc,updatedAt:S.updatedAt},now);}
function pushOral(now){remotePut('oral',O,now);}
async function syncFromFiles(force){
  if(!REMOTE.ok&&!(await initBackend()))return false;let changed=false;
  const [st,cc,or]=await Promise.all([remoteGet('state'),remoteGet('custom-cards'),remoteGet('oral')]);
  REMOTE.synced=true;
  if(st&&(st.updatedAt||0)>(S.updatedAt||0)){S={...defS(),...st,set:{...DEF_SET,...(st.set||{})},uc:(cc&&cc.uc)||[]};try{localStorage.setItem(SK,JSON.stringify(S));}catch(e){}changed=true;}
  else{S.updatedAt=S.updatedAt||Date.now();pushState(true);}
  if(or&&(or.updatedAt||0)>(O.updatedAt||0)){O={...defO(),...or};try{localStorage.setItem(OK,JSON.stringify(O));}catch(e){}changed=true;}
  else if(O.updatedAt||O.sets.length){pushOral(true);}
  return changed;
}
function saveChipHtml(){
  if(REMOTE.ok)return `<span style="color:var(--ok)">●</span> ${REMOTE.err?'⚠ Save failed — retrying':'Saved'+(REMOTE.lastSaved?' '+new Date(REMOTE.lastSaved).toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'}):'')} · ${esc(REMOTE.kind==='folder'?REMOTE.name:'files')}`;
  if(REMOTE.needPerm)return `<a href="#" onclick="reconnectFolder();return false" style="color:var(--rouge);font-weight:600">⚠ Reconnect save folder</a>`;
  return `<a href="#" onclick="chooseFolder();return false" style="color:var(--warn);font-weight:600">⚠ Browser-only · Choose save folder</a>`;
}
/* manual backups */
function backupAll(){
  const {uc,...rest}=S;const pack={app:'french-atar',v:3,date:new Date().toISOString(),state:rest,cards:{uc},oral:O};
  download('french-atar-backup-'+dayKey()+'.json',JSON.stringify(pack),'application/json');S.lastBackup=Date.now();save();toast('Backup downloaded');
}
function restoreAll(e){
  const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const p=JSON.parse(t);
    if(p.app==='french-atar'){S={...defS(),...p.state,set:{...DEF_SET,...(p.state.set||{})},uc:(p.cards&&p.cards.uc)||[]};O={...defO(),...(p.oral||{})};}
    else if(p.set&&p.u){S={...defS(),...p,set:{...DEF_SET,...p.set}};}   // old single-file backup
    else throw 0;
    S.updatedAt=Date.now();O.updatedAt=Date.now();save(true);saveO(true);buildAll();applyTheme();if(typeof seedOral==='function')seedOral();toast('Backup restored');go('home');
  }catch(er){toast('That doesn’t look like a backup file');}});
}
function load(){
  try{const raw=localStorage.getItem(SK);if(raw){const o=JSON.parse(raw);S={...defS(),...o,set:{...DEF_SET,...(o.set||{})}};return true;}}catch(e){console.warn('load failed',e);}
  return false;
}
function save(now){
  clearTimeout(_saveT);
  const go=()=>{S.updatedAt=Date.now();try{localStorage.setItem(SK,JSON.stringify(S));_saveErr=false;}catch(e){if(!_saveErr){_saveErr=true;toast('⚠ Could not save in the browser — storage full? Export a backup.');}}pushState(false);};
  if(now)go();else _saveT=setTimeout(go,350);
}
let _saveOT=null;
function saveO(now){
  clearTimeout(_saveOT);
  const go=()=>{O.updatedAt=Date.now();try{localStorage.setItem(OK,JSON.stringify(O));}catch(e){}pushOral(false);};
  if(now)go();else _saveOT=setTimeout(go,300);
}
function flushAll(){
  save(true);saveO(true);
  if(!(REMOTE.ok&&REMOTE.synced))return;
  if(REMOTE.kind==='server'&&navigator.sendBeacon){
    for(const n of Object.keys(REMOTE.t))clearTimeout(REMOTE.t[n]);
    try{const {uc,...rest}=S;navigator.sendBeacon('/api/data/state',new Blob([JSON.stringify(rest)],{type:'application/json'}));navigator.sendBeacon('/api/data/custom-cards',new Blob([JSON.stringify({uc,updatedAt:S.updatedAt})],{type:'application/json'}));navigator.sendBeacon('/api/data/oral',new Blob([JSON.stringify(O)],{type:'application/json'}));}catch(e){}
  }else{pushState(true);pushOral(true);}
}
window.addEventListener('beforeunload',flushAll);window.addEventListener('pagehide',flushAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushAll();});

/* ── Time helpers ── */
const ds=()=>(S.set.dayStart||0)*HOUR;
function dayKey(ts){const d=new Date((ts==null?Date.now():ts)-ds());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function endOfToday(now){const d=new Date((now||Date.now())-ds());d.setHours(0,0,0,0);d.setDate(d.getDate()+1);return d.getTime()+ds();}
function startOfToday(now){return endOfToday(now)-DAY;}
function dayObj(key){const k=key||dayKey();return S.days[k]||(S.days[k]={r:0,nw:0,ag:0,ok:0,ms:0});}
function streak(){let n=0,t=Date.now();if(!(S.days[dayKey(t)]||{}).r)t-=DAY;while((S.days[dayKey(t)]||{}).r>0){n++;t-=DAY;}return n;}
function fmtIvl(ms){
  if(ms<MIN)return '<1m'; if(ms<HOUR)return Math.round(ms/MIN)+'m'; if(ms<DAY)return Math.round(ms/HOUR)+'h';
  const d=ms/DAY; if(d<30)return (d<10?Math.round(d*10)/10:Math.round(d))+'d'; if(d<365)return (Math.round(d/30*10)/10)+'mo'; return (Math.round(d/365*10)/10)+'y';
}
function fmtDate(ts){return ts?new Date(ts).toLocaleDateString('en-AU',{day:'numeric',month:'short'}):'—';}
function fmtDur(ms){const s=Math.round(ms/1000);if(s<60)return s+'s';const m=Math.floor(s/60);if(m<60)return m+'m '+(s%60)+'s';return Math.floor(m/60)+'h '+(m%60)+'m';}

/* ── Card model ── */
let CARDS=[],BYID=new Map(),BYKEY=new Map();
const STATE_KEYS=['st','d','s','due','lr','rp','lp','sp','fl','sr','su','tg','nt','ex','ad','del','ed','bu'];
function build(base,id,u,user){
  u=u||{};const ed=u.ed||{};
  const c={id,user:!!user,fr:ed.fr!=null?ed.fr:base.fr,en:ed.en!=null?ed.en:base.en,th:ed.th||base.th||['general'],ty:ed.ty||base.ty||['vocab'],
    sub:base.s||base.sub||'',ws:base.ws||'',wo:base.wo||0,src:base.src||['mine'],note:base.note||'',
    st:u.st||0,d:u.d||0,s:u.s||0,due:u.due||0,lr:u.lr||0,rp:u.rp||0,lp:u.lp||0,sp:u.sp||0,fl:u.fl||0,sr:!!u.sr,su:!!u.su,tg:u.tg||[],nt:u.nt||'',ex:u.ex||base.ex||'',ad:u.ad||base.ad||0,del:u.del||0,bu:u.bu||0};
  c._q=fold((c.fr+' '+c.en+' '+c.ex+' '+c.tg.join(' ')+' '+c.sub)).toLowerCase();
  return c;
}
function refreshQ(c){c._q=fold((c.fr+' '+c.en+' '+c.ex+' '+c.tg.join(' ')+' '+c.sub)).toLowerCase();}
function packState(c){
  const o={};
  if(c.st)o.st=c.st; if(c.d)o.d=+c.d.toFixed(3); if(c.s)o.s=+c.s.toFixed(3); if(c.due)o.due=Math.round(c.due); if(c.lr)o.lr=Math.round(c.lr);
  if(c.rp)o.rp=c.rp; if(c.lp)o.lp=c.lp; if(c.sp)o.sp=c.sp; if(c.fl)o.fl=c.fl; if(c.sr)o.sr=1; if(c.su)o.su=1;
  if(c.tg&&c.tg.length)o.tg=c.tg; if(c.nt)o.nt=c.nt; if(c.ex&&(c.user||c.ex!==''))o.ex=c.ex; if(c.del)o.del=c.del; if(c.bu)o.bu=c.bu;
  if(c.ed)o.ed=c.ed;
  return o;
}
function commit(c,now){ // write a card's mutable state back to S
  if(c.user){const i=S.uc.findIndex(x=>x.id===c.id);const rec={id:c.id,fr:c.fr,en:c.en,th:c.th,ty:c.ty,s:c.sub,ad:c.ad};if(i<0)S.uc.push(rec);else S.uc[i]=rec;const st=packState(c);delete st.ad;S.u[c.id]=st;}
  else{const st=packState(c);if(Object.keys(st).length)S.u[c.id]=st;else delete S.u[c.id];}
  refreshQ(c);save(now);
}
/* hidden importance tier: 1 = core/high-frequency … 4 = rare/specialised. Never shown to the user; only orders new cards. */
let FREQ=null;
function freqSet(){if(!FREQ){FREQ=new Set(String(window.FR_FREQ||'').split(/\s+/).filter(Boolean));}return FREQ;}
function guessTier(c){
  const ty=c.ty,sub=(c.sub||'').toLowerCase();
  if(ty.some(t=>['connector','opinion','opener','closer','subjunctive','structure'].includes(t)))return 1;
  if(/extra|extended|history|festival|award|industry|discriminat|racism|cybercrime|abbrev|argot|slang|proverb/.test(sub)||ty.some(t=>['idiom','proverb','colloquial'].includes(t)))return 3;
  if(ty.includes('keyphrase'))return 2;
  const F=freqSet(),words=keyOf(c.fr).split(' ').filter(w=>w&&!/^(le|la|les|l|un|une|des|du|de|d|se|s|to|a|an|the|en|au|aux)$/.test(w));
  if(!words.length)return 2;
  const hits=words.filter(w=>F.has(w)).length/words.length;
  if(hits>=1&&words.length<=2)return 1;
  if(hits>=0.5||words.length<=2&&/technolog|media|cinema|musique|avenir|immigration|youth/.test(c.th.join(' '))&&!/extra/.test(sub))return 2;
  return c.th.includes('general')&&hits>0?2:3;
}
function buildAll(){
  CARDS=[];BYID=new Map();BYKEY=new Map();
  const base=((window.FR_DATA&&FR_DATA.cards)||[]).slice();
  const b2=(window.FR_DATA&&FR_DATA.b2)||{cards:[],patch:[]};
  for(const r of b2.cards||[])base.push({fr:r[0],en:r[1],th:r[2],ty:r[3],s:r[4]||'',t:r[5]||0,src:['b2']});
  for(const b of base){
    const k=keyOf(b.fr);if(!k)continue;
    let id='s'+fnv(k);while(BYID.has(id))id+='_';
    const c=build(b,id,S.u[id],false);c._k=k;c.tier=b.t||0;CARDS.push(c);BYID.set(id,c);BYKEY.set(k,c);
  }
  for(const p of b2.patch||[]){const c=BYKEY.get(keyOf(p[0]));if(!c)continue;
    for(const t of p[1])if(!c.th.includes(t))c.th=[...c.th,t];for(const t of p[2])if(!c.ty.includes(t))c.ty=[...c.ty,t];
    if(p[3]&&(!c.tier||p[3]<c.tier))c.tier=p[3];if(!c.src.includes('b2'))c.src=[...c.src,'b2'];}
  for(const b of S.uc){
    const c=build({...b,src:['mine']},b.id,S.u[b.id],true);c.ad=b.ad||0;c._k=keyOf(b.fr);c.tier=2;CARDS.push(c);BYID.set(b.id,c);if(!BYKEY.has(c._k))BYKEY.set(c._k,c);
  }
  CARDS.forEach((c,i)=>{c.ix=i;if(!c.tier)c.tier=guessTier(c);});
}
function newUserCard(p){
  const c=build({fr:p.fr,en:p.en,th:p.th&&p.th.length?p.th:['general'],ty:p.ty&&p.ty.length?p.ty:['vocab'],s:p.sub||'',src:['mine']},uid(),{ex:p.ex||'',tg:p.tg||[],nt:p.nt||'',ad:Date.now()},true);
  c.ad=Date.now();c._k=keyOf(c.fr);CARDS.push(c);BYID.set(c.id,c);if(!BYKEY.has(c._k))BYKEY.set(c._k,c);commit(c);return c;
}
function editCard(c,p){
  if(c.user){Object.assign(c,p);}
  else{c.ed=c.ed||{};for(const k of ['fr','en','th','ty']){if(p[k]!=null){c.ed[k]=p[k];c[k]=p[k];}}if(p.sub!=null)c.sub=p.sub;}
  for(const k of ['ex','nt','tg'])if(p[k]!=null)c[k]=p[k];
  commit(c);
}
function trashCard(c){c.del=1;c.su=false;commit(c);}
function restoreCard(c){c.del=0;commit(c);}
function purgeCard(c){
  if(c.user){S.uc=S.uc.filter(x=>x.id!==c.id);delete S.u[c.id];CARDS=CARDS.filter(x=>x!==c);BYID.delete(c.id);save();}
  else{c.del=2;commit(c);}
}
const isLive=c=>!c.del;
const cstat=c=>c.su?'susp':c.st===0?'new':(c.st===1||c.st===3)?'learn':(c.s>=21?'mature':'young');
const isDue=(c,now)=>c.st!==0&&!c.su&&!c.del&&c.due<=(now||Date.now());
function counts(list){
  const now=Date.now(),eod=endOfToday(now),o={total:0,new:0,learn:0,learnDue:0,rev:0,due:0,young:0,mature:0,susp:0,starred:0};
  for(const c of list||CARDS){if(c.del)continue;o.total++;if(c.su){o.susp++;continue;}if(c.sr)o.starred++;
    if(c.st===0)o.new++;else if(c.st===1||c.st===3){o.learn++;if(c.due<=now+20*MIN){o.due++;o.learnDue++;}}else{if(c.due<=eod){o.due++;o.rev++;}if(c.s>=21)o.mature++;else o.young++;}}
  return o;
}

/* ── Speech ── */
let _vw=false;
function frVoiceWarn(){if(_vw)return;try{const v=speechSynthesis.getVoices();if(v.length&&!v.some(x=>x.lang&&x.lang.toLowerCase().startsWith('fr'))){_vw=true;toast('No French voice found on this device — add one in your system speech settings for proper pronunciation.',6500);}}catch(e){}}
function speak(text,rate){frVoiceWarn();
  try{
    const t=String(text||'').split(/\s\/\s/)[0].replace(/\((?:m|f|pl|mpl|fpl)\)/g,'').replace(/[…]|\.\.\./g,', ').replace(/\([^)]*\)/g,'').trim();if(!t)return;
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=rate||0.92;
    const v=speechSynthesis.getVoices().find(v=>v.lang&&v.lang.toLowerCase().startsWith('fr'));if(v)u.voice=v;speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeak(){try{speechSynthesis.cancel();}catch(e){}}
function download(name,content,type){const b=new Blob([content],{type:type||'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
function copy(text,msg){navigator.clipboard.writeText(text).then(()=>toast(msg||'Copied'),()=>toast('Copy failed'));}

/* ── Toast & modal ── */
function toast(msg,ms){
  let box=$('.toasts');if(!box){box=document.createElement('div');box.className='toasts';document.body.appendChild(box);}
  const t=document.createElement('div');t.className='toast';t.textContent=msg;box.appendChild(t);setTimeout(()=>t.remove(),ms||2200);
}
function modal(html,wide){closeModal();const o=document.createElement('div');o.className='overlay';o.id='modal';o.innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${html}</div>`;o.addEventListener('mousedown',e=>{if(e.target===o)closeModal();});document.body.appendChild(o);const f=o.querySelector('[autofocus]');if(f)f.focus();}
function closeModal(){const o=$('#modal');if(o)o.remove();}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ── Migration from the first French app (french-app-v1) ── */
function migrateV1(){
  let old;try{old=JSON.parse(localStorage.getItem(OLD_SK)||'null');}catch(e){}
  if(!old||S.mig)return 0;
  let n=0;const now=Date.now();
  const bankTheme=id=>THEME[id]?id:(id==='youth'?'youth':'general');
  for(const o of (old.cards||[])){
    if(o.subject&&o.subject!=='french')continue;
    const k=keyOf(o.fr);if(!k)continue;
    let c=BYKEY.get(k);
    if(!c){const th=bankTheme(o.bank);c=newUserCard({fr:o.fr,en:o.en,th:[th],ty:['vocab'],ex:o.ex||'',tg:o.bank&&!THEME[o.bank]?[o.bank]:[]});c.ad=o.added||now;}
    if(o.starred)c.sr=true;
    if(o.notes)c.nt=o.notes;
    if(o.seen>0&&!c.rp){
      const iv=o.interval||0;
      if(iv>=1){c.st=2;c.s=Math.max(0.5,iv);c.d=clamp(5+(2.5-(o.ease||2.5))*3,1,10);c.due=o.due||now;c.lr=(o.due||now)-iv*DAY;}
      else{c.st=1;c.s=0.6;c.d=6;c.sp=0;c.due=o.due||now;c.lr=now;}
      c.rp=o.reps||1;c.lp=Math.max(0,(o.seen||0)-(o.correct||0));
    }
    commit(c,true);n++;
  }
  for(const [k,v] of Object.entries(old.log||{}))if(v>0&&!S.days[k])S.days[k]={r:v,nw:0,ag:0,ok:v,ms:0};
  if(old.apiKey&&!S.set.apiKey)S.set.apiKey=old.apiKey;
  if(old.dark)S.set.dark='dark';
  if(old.strict)S.set.strict=true;
  S.mig=1;save(true);return n;
}
const liveThemes=()=>THEMES.filter(t=>t.id==='general'||CARDS.some(c=>!c.del&&c.th.includes(t.id)));
