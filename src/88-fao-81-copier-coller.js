/* ----- V0.23.20 : copier / coller d'opérations FAO et de posages complets -----
   Arbre FAO : Ctrl+clic ajoute / retire une opération de la sélection, Maj+clic
   prend la plage depuis l'opération sélectionnée (même posage). Ctrl+C copie les
   opérations sélectionnées — ou le POSAGE ENTIER (machine, repère, brut, outils,
   opérations) quand c'est le posage qui est sélectionné ; Ctrl+V colle :
   · des opérations dans le posage actif, juste après l'opération sélectionnée
     (sinon à la fin) — un outil absent du posage cible y est ajouté ;
   · un posage juste après le posage actif, sous un nom libre (…_COPIE).
   Le presse-papiers vit en mémoire ET dans localStorage : coller dans un autre
   document ou un autre onglet fonctionne (références de faces / esquisses
   reprises telles quelles : elles ne valent que si la géométrie existe). */
let faoMulti=[]; // opérations sélectionnées EN PLUS de sel.id (même posage que sel.setup)
let faoClip=null;
function faoClone(o){ return JSON.parse(JSON.stringify(o)); }
function faoMultiHas(setupId,opId){
  try{ return typeof sel!=='undefined'&&sel&&sel.kind==='faoOp'&&sel.setup===setupId&&faoMulti.indexOf(opId)>=0; }
  catch(e){ return false; }
}
function faoMultiClick(ev,setup,op){
  // true = clic traité ici (Ctrl / Maj) ; false = clic simple, sélection unique.
  const ctrl=!!(ev&&(ev.ctrlKey||ev.metaKey)), shift=!!(ev&&ev.shiftKey);
  const same=typeof sel!=='undefined'&&sel&&sel.kind==='faoOp'&&sel.setup===setup.id;
  if(!(ctrl||shift)||!same){ faoMulti=[]; return false; }
  const ops=setup.ops||[];
  if(shift){
    const a=ops.findIndex(function(o){return o.id===sel.id;}), b=ops.indexOf(op);
    if(a<0||b<0)return false;
    faoMulti=ops.slice(Math.min(a,b),Math.max(a,b)+1).map(function(o){return o.id;})
      .filter(function(id){return id!==sel.id;});
  }else if(op.id===sel.id){
    // Ctrl+clic sur l'opération principale : elle sort, la suivante prend sa place
    if(!faoMulti.length)return true;
    const nx=faoMulti.shift();
    sel={kind:'faoOp',id:nx,setup:setup.id};
  }else{
    const k=faoMulti.indexOf(op.id);
    if(k>=0)faoMulti.splice(k,1); else faoMulti.push(op.id);
  }
  try{ if(typeof renderProps==='function')renderProps(); }catch(e){}
  faoRenderTree();
  return true;
}
function faoSelectedOps(){
  // {setup, ops} dans l'ordre d'usinage, ou null si aucune opération sélectionnée.
  try{
    if(typeof sel==='undefined'||!sel||sel.kind!=='faoOp')return null;
    const s=faoSetup(sel.setup);
    const ids=faoMulti.concat([sel.id]);
    const ops=(s.ops||[]).filter(function(o){return ids.indexOf(o.id)>=0;});
    return ops.length?{setup:s,ops:ops}:null;
  }catch(e){ return null; }
}
function faoClipSave(c){
  faoClip=c;
  try{ localStorage.setItem('minifusion_faoClip',JSON.stringify(c)); }catch(e){}
}
function faoClipLoad(){
  try{ const t=localStorage.getItem('minifusion_faoClip'); if(t){ const c=JSON.parse(t); if(c&&c.kind)return c; } }catch(e){}
  return faoClip;
}
function faoClipMsg(t){ try{ if(typeof faceEl!=='undefined'&&faceEl)faceEl.textContent='FAO : '+t; }catch(e){} }
function faoCopy(){
  // Copie la sélection courante ; renvoie le nombre d'éléments copiés (0 = rien).
  try{
    if(typeof sel==='undefined'||!sel)return 0;
    if(sel.kind==='faoSetup'){
      const s=faoSetup(sel.id);
      faoClipSave({kind:'setup',setup:faoClone(s)});
      faoClipMsg('posage « '+s.name+' » copié ('+(s.ops||[]).length+' opération(s)) — Ctrl+V pour le coller.');
      faoRenderTree();
      return 1;
    }
    const so=faoSelectedOps();
    if(!so)return 0;
    const used=[];
    so.ops.forEach(function(o){ const t=faoToolById(so.setup,o.toolId);
      if(t&&used.indexOf(t)<0)used.push(t); });
    faoClipSave({kind:'ops',ops:so.ops.map(faoClone),tools:used.map(faoClone)});
    faoClipMsg(so.ops.length+' opération(s) copiée(s) — Ctrl+V pour coller dans le posage actif.');
    faoRenderTree();
    return so.ops.length;
  }catch(e){ return 0; }
}
function faoPasteTool(dst,t){
  // Outil de l'opération collée dans le posage cible : même id et même géométrie
  // = repris ; sinon un outil identique (type, Ø, rayon de coin) ; sinon AJOUTÉ.
  if(!t)return (dst.tools&&dst.tools[0]&&dst.tools[0].id)||'T1';
  const same=function(a){ return a&&a.kind===t.kind&&+a.d===+t.d&&+(a.cornerR||0)===+(t.cornerR||0); };
  const tools=dst.tools||(dst.tools=[]);
  const byId=tools.filter(function(a){return a.id===t.id;})[0];
  if(byId&&same(byId))return byId.id;
  const twin=tools.filter(same)[0];
  if(twin)return twin.id;
  const n=faoClone(t);
  const nums=tools.map(function(a){return +a.num||0;});
  if(tools.some(function(a){return a.id===n.id;})||nums.indexOf(+n.num)>=0){
    n.num=Math.max.apply(null,[0].concat(nums))+1;
    n.id='T'+n.num;
    while(tools.some(function(a){return a.id===n.id;}))n.id=faoNewId('T');
  }
  tools.push(n);
  return n.id;
}
function faoFreshOp(o){
  const n=faoClone(o);
  n.id=faoNewId('op');
  delete n.stale; // faoStaleScan tranche (nouvel id = pas de parcours en mémoire)
  return n;
}
function faoPaste(){
  // Colle le presse-papiers ; renvoie le nombre d'éléments collés (0 = rien).
  const c=faoClipLoad();
  if(!c)return 0;
  try{
    const r=faoRoot();
    if(c.kind==='setup'&&c.setup){
      const s=faoClone(c.setup);
      s.id=faoNewId('setup');
      s.ops=(s.ops||[]).map(faoFreshOp);
      const names=r.setups.map(function(x){return x.name;});
      let nm=faoProgName(s.name+'_COPIE'), k=2;
      while(names.indexOf(nm)>=0)nm=faoProgName(s.name+'_COPIE'+(k++));
      s.name=nm;
      faoSnapshot('coller le posage « '+nm+' »');
      const at=r.setups.findIndex(function(x){return x.id===r.activeSetupId;});
      r.setups.splice(at<0?r.setups.length:at+1,0,s);
      faoMulti=[];
      faoChanged();
      faoSelectSetup(s.id);
      faoClipMsg('posage « '+nm+' » collé ('+s.ops.length+' opération(s)) — « Tout régénérer » pour ses parcours.');
      return 1;
    }
    if(c.kind==='ops'&&Array.isArray(c.ops)&&c.ops.length){
      const dst=faoSetup();
      const tools=c.tools||[];
      faoSnapshot('coller '+c.ops.length+' opération(s)');
      const ops=c.ops.map(function(o){
        const n=faoFreshOp(o);
        n.toolId=faoPasteTool(dst,tools.filter(function(t){return t.id===o.toolId;})[0]);
        delete n.cut; // vitesses reprises de la fiche de l'outil cible
        const src=tools.filter(function(t){return t.id===o.toolId;})[0];
        if(o.cut&&src&&n.toolId===src.id)n.cut=faoClone(o.cut);
        return n;
      });
      let at=dst.ops.length;
      if(typeof sel!=='undefined'&&sel&&sel.kind==='faoOp'&&sel.setup===dst.id){
        const ids=faoMulti.concat([sel.id]);
        dst.ops.forEach(function(o,i){ if(ids.indexOf(o.id)>=0)at=i+1; });
      }
      Array.prototype.splice.apply(dst.ops,[at,0].concat(ops));
      faoChanged();
      faoSelectOp(dst.id,ops[0].id);
      faoMulti=ops.slice(1).map(function(o){return o.id;});
      faoRenderTree();
      faoClipMsg(ops.length+' opération(s) collée(s) dans « '+dst.name+' » — « Tout régénérer » ou ⚠ pour leurs parcours.');
      return ops.length;
    }
  }catch(e){}
  return 0;
}
function faoClipKeyTarget(t){
  // Champ de saisie : Ctrl+C / Ctrl+V gardent leur sens natif (texte).
  try{
    if(!t)return false;
    const tg=String(t.tagName||'').toUpperCase();
    return tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT'||!!t.isContentEditable;
  }catch(e){ return false; }
}
(function(){
  if(typeof window==='undefined'||!window.addEventListener)return;
  window.addEventListener('keydown',function(e){
    if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey)return;
    const k=String(e.key||'').toLowerCase();
    if(k!=='c'&&k!=='v')return;
    if(typeof sel==='undefined'||!sel||!(sel.kind==='faoOp'||sel.kind==='faoSetup'))return;
    if(faoClipKeyTarget(e.target))return;
    try{ if(window.getSelection&&String(window.getSelection())!=='')return; }catch(err){} // texte surligné
    try{ if(document.querySelector&&document.querySelector('.mffDlgBg'))return; }catch(err){}
    const n=k==='c'?faoCopy():faoPaste();
    if(n){ e.preventDefault(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); }
  },true);
})();
