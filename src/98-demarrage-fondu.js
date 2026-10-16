/* ---------- Démarrage : attendre le noyau OCCT, puis faire apparaître la pièce en fondu (2026-10-16-015) ----------
   Après un rafraîchissement, le repli maillage s'affichait d'abord puis la pièce exacte la
   remplaçait (saut visible). La vue 3D reste désormais invisible tant que le noyau n'a pas
   recalculé la pièce en exact, puis elle apparaît en fondu. Garde-fous : noyau en échec →
   on montre le maillage ; ouverture locale (file://) qui attend le .wasm → 8 s ; 60 s au plus. */
let bootVeilOn=false;
function viewFadeOut(){
  // ouverture d'un modèle : la vue disparaît d'un coup (l'ancien modèle ne reste pas affiché)
  try{if(bootVeilOn)return;const cv=document.getElementById('viewport');if(!cv||!cv.style)return;cv.style.transition='none';cv.style.opacity='0';
    setTimeout(()=>{try{if(cv.style.opacity==='0'&&!bootVeilOn)viewFadeIn();}catch(e){}},4000);}catch(e){} // secours : ouverture en échec
}
function viewFadeIn(){
  // … puis réapparaît en fondu une fois le nouveau modèle reconstruit
  try{if(bootVeilOn)return;const cv=document.getElementById('viewport');if(!cv||!cv.style)return;
    const go=()=>{cv.style.transition='opacity .9s ease';cv.style.opacity='1';};
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(go));else go();}catch(e){}
}
(function(){
  try{
    const cv=document.getElementById('viewport'),wrap=document.getElementById('vpwrap');
    if(!cv||!cv.style||typeof setInterval!=='function')return;
    cv.style.opacity='0';cv.style.transition='opacity .9s ease';bootVeilOn=true;
    let veil=null;
    if(wrap&&wrap.appendChild){
      veil=document.createElement('div');veil.id='bootVeil';
      veil.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:none;z-index:5;color:var(--muted,#8e8e93);font-size:.85rem;transition:opacity .6s ease';
      veil.innerHTML='<div style="width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#0a84ff;animation:bootSpin 1s linear infinite"></div><div>Chargement du noyau 3D…</div>';
      const st=document.createElement('style');st.textContent='@keyframes bootSpin{to{transform:rotate(360deg)}}';
      try{document.head.appendChild(st);}catch(e){}
      wrap.appendChild(veil);
    }
    const t0=Date.now();
    const reveal=()=>{
      clearInterval(iv);bootVeilOn=false;
      cv.style.transition='opacity .9s ease';cv.style.opacity='1';
      if(veil){veil.style.opacity='0';setTimeout(()=>{try{veil.remove();}catch(e){}},700);}
    };
    const iv=setInterval(()=>{
      try{
        const dt=Date.now()-t0;
        const ready=(typeof occtReady!=='undefined'&&occtReady)&&((typeof builtEngine!=='undefined'&&builtEngine==='exact')||!((doc&&doc.features)||[]).length);
        const failed=typeof occBaseMsg==='string'&&/impossible|absent|incomplet/i.test(occBaseMsg);
        const local=(location&&location.protocol==='file:')&&!(typeof occtReady!=='undefined'&&occtReady)&&dt>8000;
        if(ready||failed||local||dt>60000)reveal();
      }catch(e){reveal();}
    },150);
  }catch(e){}
})();
