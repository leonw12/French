'use strict';
/* ═════════════ boot ═════════════
   Order matters: load local copy → pull newer files from the local server (if running) → only then migrate/seed/save,
   so an empty browser can never overwrite the files in ./userdata. */
(async function boot(){
  load();loadO();applyTheme();
  try{await Promise.race([syncFromFiles(),new Promise(r=>setTimeout(()=>{REMOTE.synced=REMOTE.ok;r(false);},4000))]);}catch(e){console.warn('sync failed',e);REMOTE.synced=REMOTE.ok;}
  applyTheme();buildAll();
  if(!S.mig){
    let n=0;try{n=migrateV1();}catch(e){console.warn('migration failed',e);}
    S.mig=1;save(true);
    if(n)setTimeout(()=>toast('Brought over '+n+' cards and your progress from the earlier app',4200),600);
  }
  if(window.matchMedia){const mq=matchMedia('(prefers-color-scheme: dark)');if(mq.addEventListener)mq.addEventListener('change',()=>{if(S.set.dark==='auto')applyTheme();});}
  if(window.speechSynthesis)speechSynthesis.getVoices();
  if(typeof seedOral==='function')seedOral();
  render();
  if(!S.welcomed&&!S.mig_seen){S.mig_seen=1;setTimeout(welcome,350);}
})();
