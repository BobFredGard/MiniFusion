/* ---------- apparence de RENDU par pièce, au clic droit (V0.17.0) ----------
   Matériau, couleur, relief et patine d'UNE pièce dans une petite fenêtre flottante, au lieu de la
   liste complète dans le panneau de l'atelier (qui prenait toute la hauteur) :
   - atelier RENDU (98-rendu) : clic droit sans glisser sur une pièce de l'image, ou clic sur sa ligne
     dans le bloc « Matériaux et reliefs » (une ligne par pièce) ;
   - vue CAO / FAO : menu du clic droit sur une pièce → « Matériau de rendu… » ; la vue en ambiance de
     rendu (98-rendu-vue) montre aussitôt le résultat.
   Cible : {id} corps de la pièce active (doc.rendu, 12-materiaux) ou {occ, bid, comp} corps d'une
   occurrence d'assemblage (o.rendu, 48-assemblage-apparence) ; {bid, comp} sans occ = composant ouvert. */
let rdLookT=null; // cible de la fenêtre ouverte
function rdLookCss(){
  if(document.getElementById('rdLookCss'))return;
  const s=document.createElement('style');s.id='rdLookCss';s.textContent=[
    '#rdLook{position:fixed;z-index:9600;width:262px;background:var(--surface,#1c1c20);color:var(--text,#f5f5f7);border:1px solid var(--border,#3a3a3f);border-radius:9px;padding:8px 10px;box-shadow:0 12px 32px rgba(0,0,0,.5);font-size:.74rem}',
    '#rdLook .rlHead{display:flex;align-items:center;gap:5px;margin-bottom:6px}',
    '#rdLook .rlHead>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}',
    '#rdLook button{padding:2px 7px;font-size:.71rem;border:1px solid var(--border);background:none;color:var(--text);border-radius:6px;cursor:pointer}',
    '#rdLook button:hover{border-color:var(--primary,#0a84ff)}',
    '#rdLook select,#rdLook input[type=number]{padding:3px 6px;font-size:.72rem;border:1px solid var(--border);border-radius:5px;background:var(--bg);color:var(--text);min-width:0}',
    '#rdLook input[type=color]{width:30px;height:22px;padding:0;border:1px solid var(--border);border-radius:4px;background:none;flex:none}',
    '#rdLook .rlRow,#rdLook .rdRel{display:flex;align-items:center;gap:4px;margin:4px 0}',
    '#rdLook .rlRow>select,#rdLook .rdRel>select:first-child{flex:1;max-width:none}',
    '#rdLook .rdRel>input{width:52px}',
    '#rdLook .rdNote{color:var(--muted);font-size:.68rem;line-height:1.35;margin:4px 0 0}',
    'body[data-theme="clair"] #rdLook{background:rgba(255,255,255,.98);color:#1c1c1e;box-shadow:0 12px 32px rgba(0,0,0,.18)}'
  ].join('\n');
  document.head.appendChild(s);
}
function rdLookOccMesh(t){ // maillage affiché d'une occurrence (son userData.rd est l'apparence en cours)
  let hit=null;
  const visit=root=>{if(!root||hit)return;root.traverse(o=>{const r=!hit&&o.isMesh&&o.userData&&o.userData.rd;if(r&&!r.ghost&&r.bid===t.bid&&(r.occ||null)===(t.occ||null)&&r.comp===t.comp)hit=r;});};
  try{if(typeof asmMode!=='undefined'&&asmMode==='asm'&&asmScene)visit(asmScene);}catch(e){}
  try{visit(scene.getObjectByName('asmCtx'));}catch(e){}
  if(!hit&&rd&&rd.srcs)hit=rd.srcs.find(s=>!s.id&&s.bid===t.bid&&(s.occ||null)===(t.occ||null)&&s.comp===t.comp)||null;
  return hit;
}
function rdLookGet(t){
  // {name, mat, color, rel, own} de la cible
  if(t.id||(t.bid&&!t.occ)){
    const id=t.id||t.bid,L=renderLookOf(id);
    let n=id;try{const e=bodyEntryOf(id),b=(bodies||[]).find(q=>bodyIdOfRuntime(q)===id);n=(e&&e.name)||(b&&b.name)||id;}catch(e){}
    return {name:n,mat:L.mat,color:L.color,rel:L.rel,own:L.own};
  }
  const o=asmOcc(t.occ),c=asmComp(t.comp),r=rdLookOccMesh(t);
  const be=c&&c.doc&&(c.doc.bodies||[]).find(e=>e&&e.id===t.bid);
  return {name:(o?o.name+' · ':'')+((be&&be.name)||t.bid),mat:r?r.mat:null,color:r?r.color:0x9a9aa0,rel:r?r.rel||null:null,
    own:!!(o&&o.rendu&&o.rendu.corps&&o.rendu.corps[t.bid]),o};
}
function rdLookDone(t){
  // la pièce a changé d'apparence : document, atelier ouvert, assemblage redessiné, fenêtre relue
  try{markDirty();}catch(e){}
  if(t.occ||t.bid){try{asmDraw();}catch(e){}try{asmCtxDraw();}catch(e){}}
  if(rd){try{rdRefresh('objets');rdPanel();}catch(e){}}
  rdLookFill();
}
function rdLookSet(t,mat,col,rel){
  if(t.occ){const L=rdLookGet(t);asmSetOccRendu(L.o,t.bid,mat,col,false,rel===undefined?L.rel:rel);}
  else{rdUndo();setRenderLook(t.id||t.bid,mat,col,rel);}
  rdLookDone(t);
}
function rdLookFill(){
  const p=document.getElementById('rdLook');if(!p||!rdLookT)return;
  const t=rdLookT,L=rdLookGet(t);p.innerHTML='';
  const el=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const select=(opts,cur,fn)=>{const s=el('select');opts.forEach(([v,tx])=>{const o=el('option',null,tx);o.value=v;if(String(v)===String(cur))o.selected=true;s.appendChild(o);});s.onchange=()=>fn(s.value);return s;};
  const h=el('div','rlHead');const n=el('span',null,L.name);n.title=L.name;h.appendChild(n);
  if(t.occ){
    const all=el('button',null,'⇉');all.title='Même apparence pour toutes les occurrences de ce composant';
    all.onclick=()=>{asmSetOccRendu(L.o,t.bid,L.mat,L.color,true,L.rel);rdLookDone(t);};h.appendChild(all);
  }
  const z=el('button',null,'↺');z.disabled=!L.own;z.style.opacity=L.own?'':'.35';
  z.title=t.occ?'Reprendre l’apparence de la pièce':'Reprendre le matériau et la couleur de la CAO';
  z.onclick=()=>{if(t.occ)asmClearOccRendu(L.o,t.bid,false);else{rdUndo();clearRenderLook(t.id||t.bid);}rdLookDone(t);};h.appendChild(z);
  const x=el('button',null,'×');x.title='Fermer (Échap)';x.onclick=rdLookClose;h.appendChild(x);
  p.appendChild(h);
  const r=el('div','rlRow');
  r.appendChild(matSelect(L.mat,k=>rdLookSet(t,k,null,undefined),'Sans matériau'));
  const ci=el('input');ci.type='color';ci.value=cssHex(L.color);ci.title='Couleur de rendu (la pièce CAO garde la sienne)';
  ci.onchange=()=>{const v=parseInt(ci.value.slice(1),16);if(v>=0){const L2=rdLookGet(t);rdLookSet(t,L2.mat,v,L2.rel);}};
  r.appendChild(ci);p.appendChild(r);
  p.appendChild(rdRelRow(el,select,L.rel,matDef(L.mat),rel=>{const L2=rdLookGet(t);rdLookSet(t,L2.mat,L2.color,rel);}));
  p.appendChild(el('div','rdNote','Apparence de RENDU, enregistrée avec '+(t.occ?'l’assemblage':'la pièce')+' : atelier RENDU et ambiances de la vue (⚙ → Environnement). La CAO garde sa couleur.'));
}
function rdLookPop(x,y,t){
  if(!t||!(t.id||t.bid))return;
  rdLookCss();rdLookT=t;
  let p=document.getElementById('rdLook');
  if(!p){p=document.createElement('div');p.id='rdLook';
    p.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();});
    p.addEventListener('pointerdown',e=>e.stopPropagation());
    p.addEventListener('wheel',e=>e.stopPropagation());
    document.body.appendChild(p);
    setTimeout(()=>{document.addEventListener('pointerdown',rdLookOut,true);document.addEventListener('keydown',rdLookKey,true);},0);}
  rdLookFill();
  const w=p.offsetWidth||262,hh=p.offsetHeight||160;
  p.style.left=Math.max(4,Math.min(x+6,innerWidth-w-4))+'px';p.style.top=Math.max(4,Math.min(y+6,innerHeight-hh-4))+'px';
}
function rdLookClose(){
  const p=document.getElementById('rdLook');if(p)p.remove();rdLookT=null;
  document.removeEventListener('pointerdown',rdLookOut,true);document.removeEventListener('keydown',rdLookKey,true);
}
function rdLookOut(e){const p=document.getElementById('rdLook');if(p&&!p.contains(e.target))rdLookClose();}
function rdLookKey(e){if(e.key==='Escape'&&rdLookT){e.stopPropagation();e.preventDefault();rdLookClose();}}
function rdLookFromSrc(s){return s&&s.id?{id:s.id}:s&&s.bid?{occ:s.occ||null,bid:s.bid,comp:s.comp}:null;}
function rdLookPick(ev){
  // atelier : clic droit sur une pièce de l'image → sa fenêtre d'apparence
  if(!rd||!rd.group)return false;
  const r=rd.canvas.getBoundingClientRect();
  const m=new THREE.Vector2((ev.clientX-r.left)/r.width*2-1,-((ev.clientY-r.top)/r.height*2-1));
  const ray=new THREE.Raycaster();ray.setFromCamera(m,rd.cam);
  const hit=ray.intersectObjects(rd.group.children,false)[0];if(!hit)return false;
  const t=rdLookFromSrc((rd.srcs||[])[rd.group.children.indexOf(hit.object)]);if(!t)return false;
  rdLookPop(ev.clientX,ev.clientY,t);return true;
}
function rdLookList(pane,el){
  // bloc « Matériaux et reliefs » de l'atelier : une ligne par pièce (pastille, nom, matériau) ; clic → fenêtre
  const seen=new Set(),rows=[];
  (rd.srcs||[]).forEach(s=>{const t=rdLookFromSrc(s);if(!t)return;const k=(t.id||'')+'|'+(t.occ||'')+'|'+(t.bid||'');if(seen.has(k))return;seen.add(k);rows.push(t);});
  if(!rows.length){pane.appendChild(el('div','rdNote','Aucune pièce à l’écran.'));return;}
  rows.forEach(t=>{
    const L=rdLookGet(t),d=matDef(L.mat);
    const b=el('button','rdLookRow');b.title='Matériau, couleur, relief et patine de « '+L.name+' »';
    const sw=el('i');sw.style.background=cssHex(L.color);b.appendChild(sw);
    const n=el('span',null,L.name);b.appendChild(n);
    b.appendChild(el('em',null,(d?d.nom:'sans matériau')+(L.own?' •':'')));
    b.onclick=e=>{const q=b.getBoundingClientRect();rdLookPop(q.left-268,q.top,t);e.stopPropagation();};
    pane.appendChild(b);
  });
  pane.appendChild(el('div','rdNote','Clic droit sur une pièce dans l’image (ou sur sa ligne) : matériau, couleur, relief, patine. • = apparence propre au rendu.'));
}
function rdLookCtxSync(bid){ // menu du clic droit de la vue (90) : « Matériau de rendu… » sur un corps
  const b=document.getElementById('ctxRdLook');if(b)b.style.display=bid?'':'none';
}
(function(){
  try{
    const m=document.getElementById('ctxMenu3D');if(!m||document.getElementById('ctxRdLook'))return;
    const b=document.createElement('button');b.id='ctxRdLook';b.textContent='✨ Matériau de rendu…';
    b.title='Matériau, couleur, relief et patine de rendu de cette pièce (atelier RENDU et ambiances de la vue)';
    b.onclick=()=>{
      const t=ctxTarget,q=m.getBoundingClientRect();hideCtx3D();
      const id=t&&ctxBodyId(t);if(id)rdLookPop(q.left,q.top,{id});
    };
    const row=m.querySelector('.ctxRow');m.insertBefore(b,row||null);
  }catch(e){}
})();
