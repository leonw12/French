'use strict';
/* ═════════════ ui: router · shell · shared components ═════════════ */
const N={route:'home',p:{}};            // navigation state
const VIEWS={};                          // route → () => html
const AFTER={};                          // route → () => void (post-render hook)

const NAV=[
  {g:'Study',items:[
    {id:'home',l:'Home',i:'ti-home-2'},
    {id:'study',l:'Study now',i:'ti-player-play',badge:true},
    {id:'browse',l:'Cards & vocab',i:'ti-cards'},
    {id:'stats',l:'Progress',i:'ti-chart-histogram'}]},
  {g:'Writing',items:[
    {id:'phrases',l:'Phrase bank',i:'ti-quote'},
    {id:'texttypes',l:'Text types',i:'ti-file-text'},
    {id:'guide',l:'Written guide',i:'ti-notebook'},
    {id:'grammar',l:'Grammar',i:'ti-book-2'},
    {id:'conjugate',l:'Conjugator',i:'ti-abc'},
    {id:'translate',l:'Translation',i:'ti-language-hiragana'}]},
  {g:'Practise',items:[
    {id:'oral',l:'Oral',i:'ti-microphone-2'},
    {id:'listening',l:'Listening',i:'ti-headphones'},
    {id:'tutor',l:'AI tutor',i:'ti-message-chatbot'}]},
  {g:'Manage',items:[
    {id:'add',l:'Add cards',i:'ti-square-rounded-plus'},
    {id:'settings',l:'Settings',i:'ti-settings'}]},
];
const MOBILE=[{id:'home',l:'Home',i:'ti-home-2'},{id:'study',l:'Study',i:'ti-player-play',badge:true},{id:'browse',l:'Cards',i:'ti-cards'},{id:'phrases',l:'Write',i:'ti-pencil'},{id:'more',l:'More',i:'ti-dots'}];
const TITLES={};NAV.forEach(g=>g.items.forEach(i=>TITLES[i.id]=i.l));

function go(route,p,keepScroll){
  if(N.route==='study'&&route!=='study')stopSpeak();
  N.route=route;N.p=p||{};render(!keepScroll);
}
function dueBadge(){const c=counts();return c.due+Math.min(c.new,Math.max(0,(S.set.maxNew||20)-(dayObj().nw||0)));}
function shell(inner){
  const nb=dueBadge();
  const side=NAV.map(g=>`<div class="nav-group">${g.g}</div>`+g.items.map(i=>`<button class="nav-item ${N.route===i.id?'on':''}" onclick="go('${i.id}')"><i class="ti ${i.i}"></i><span>${i.l}</span>${i.badge&&nb?`<span class="badge">${nb>999?'999+':nb}</span>`:''}</button>`).join('')).join('');
  const mob=MOBILE.map(i=>`<button class="${N.route===i.id||(i.id==='more'&&!MOBILE.some(m=>m.id===N.route))?'on':''}" onclick="${i.id==='more'?'moreSheet()':`go('${i.id}')`}"><i class="ti ${i.i}"></i>${i.l}${i.badge&&nb?`<span class="badge red">${nb>99?'99+':nb}</span>`:''}</button>`).join('');
  return `<div class="app">
    <aside class="side">
      <div class="brand"><div class="brand-mark"><i></i><i></i><i></i><b>Fr</b></div><div><h1>Français ATAR</h1><small>Year 12 · Units 3 &amp; 4</small></div></div>
      ${side}
      <div class="side-foot"><div class="card flat tint" style="padding:12px 14px"><div id="savechip" class="faint" style="font-size:11.5px;margin-bottom:8px">${saveChipHtml()}</div><div class="row between"><span class="faint" style="font-size:12px;font-weight:600">🔥 Streak</span><b class="serif" style="font-size:20px">${streak()}</b></div></div></div>
    </aside>
    <div class="main">
      <div class="topbar"><div class="row"><div class="brand-mark" style="width:30px;height:30px;border-radius:9px"><i></i><i></i><i></i></div><h1 class="serif">${esc(TITLES[N.route]||'Français')}</h1></div><div class="row gap-6"><span class="tag">🔥 ${streak()}</span><button class="btn icon sm ghost" onclick="toggleDark()" aria-label="Toggle theme"><i class="ti ti-moon-stars"></i></button></div></div>
      <div class="page" id="page">${inner}</div>
    </div>
    <nav class="bottom-nav">${mob}</nav>
  </div>`;
}
function render(scrollTop){
  const view=VIEWS[N.route]||VIEWS.home;
  let html;try{html=view();}catch(e){console.error(e);html=`<div class="card"><h3>Something went wrong</h3><p class="muted">${esc(e.message)}</p><button class="btn" onclick="go('home')">Home</button></div>`;}
  const root=$('#root');root.innerHTML=shell(html);
  if(scrollTop!==false)window.scrollTo(0,0);
  if(AFTER[N.route])try{AFTER[N.route]();}catch(e){console.error(e);}
}
function rerender(){const y=window.scrollY;render(false);window.scrollTo(0,y);}
function moreSheet(){
  modal(`<h3>All sections</h3><div class="grid g2" style="gap:8px">${NAV.flatMap(g=>g.items).map(i=>`<button class="btn" style="justify-content:flex-start" onclick="closeModal();go('${i.id}')"><i class="ti ${i.i}"></i>${i.l}</button>`).join('')}</div>`);
}
/* Theme */
function applyTheme(){
  const m=S.set.dark;const dark=m==='dark'||(m==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
  document.documentElement.style.fontSize=(16*(S.set.fontScale||1))+'px';
  document.body.classList.toggle('reduce-motion',!!S.set.reduceMotion);
}
function toggleDark(){S.set.dark=document.documentElement.dataset.theme==='dark'?'light':'dark';save();applyTheme();rerender();}
function setSet(k,v,re){S.set[k]=v;save();applyTheme();if(re!==false)rerender();}

/* ── Components ── */
const ph=(title,sub,actions,eyebrow)=>`<div class="ph"><div>${eyebrow?`<div class="eyebrow">${eyebrow}</div>`:''}<h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${actions?`<div class="row wrap">${actions}</div>`:''}</div>`;
const tagTheme=id=>{const t=THEME[id];return t?`<span class="tag t" style="--c:${t.c}">${t.icon} ${t.short}</span>`:'';};
const tagType=id=>{const t=TYPE[id];return t?`<span class="tag t" style="--c:${t.c}">${t.name}</span>`:'';};
const stat=(v,l,s,c)=>`<div class="card stat"><div class="v" ${c?`style="color:${c}"`:''}>${v}</div><div class="l">${l}</div>${s?`<div class="s">${s}</div>`:''}</div>`;
const seg=(opts,cur,fn)=>`<div class="seg">${opts.map(o=>{const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return `<button class="${cur===v?'on':''}" onclick="${fn}(${JSON.stringify(v).replace(/"/g,'&quot;')})">${l}</button>`;}).join('')}</div>`;
const empty=(ico,title,text,act)=>`<div class="empty"><div class="big">${ico}</div><h3>${title}</h3><p>${text||''}</p>${act||''}</div>`;
const chip=(label,on,fn,o)=>{o=o||{};return `<button class="chip ${on?'on':''}" onclick="${fn}">${o.dot?`<span class="dot" style="background:${o.dot}"></span>`:''}${label}${o.n!=null?` <small>${o.n}</small>`:''}</button>`;};
const bar=(p,c)=>`<div class="bar"><i style="width:${clamp(p,0,100)}%;${c?`--c:${c}`:''}"></i></div>`;
const ring=(p,inner,c,sz)=>`<div class="ring" style="--p:${clamp(p,0,100)};--c:${c||'var(--brand)'};--sz:${sz||96}px"><div>${inner}</div></div>`;
const switchBtn=(on,fn)=>`<button class="switch ${on?'on':''}" onclick="${fn}" role="switch" aria-checked="${!!on}"></button>`;
const iconBtn=(icon,fn,title,cls)=>`<button class="btn icon sm ghost ${cls||''}" onclick="${fn}" title="${ea(title||'')}" aria-label="${ea(title||'')}"><i class="ti ${icon}"></i></button>`;
function sourceLabel(c){return c.src.map(s=>SRC[s]||s).join(' · ');}

/* Confirm modal (avoids native confirm) */
function confirmBox(msg,yesJs,yesLabel){modal(`<h3>Are you sure?</h3><p class="muted" style="margin-bottom:20px">${msg}</p><div class="row" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn rouge" onclick="closeModal();${yesJs}">${yesLabel||'Yes, do it'}</button></div>`);}
