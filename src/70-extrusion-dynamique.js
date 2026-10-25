/* ---------- extrusion dynamique (V0.7.6) ----------
   Comme les logiciels de CAO récents (Fusion 360, SolidCraft) :
     · APERÇU IMMÉDIAT : « Extrusion » crée tout de suite une VRAIE fonction (20 mm), rejouée par
       le noyau exact — l'aperçu est exactement le résultat ;
     · FLÈCHE À TIRER au centre du profil, le long de la normale de l'esquisse (pas de 1 mm, Maj =
       libre ; tirer de l'autre côté inverse le sens) et CHAMP « Distance » flottant à côté ;
     · PANNEAU À ICÔNES : opération, direction, étendue en boutons ; distance ; « ▸ Options »
       repliables (dépouille) ; Annuler / OK.
   La même fenêtre sert à modifier une extrusion : elle s'ouvre dès qu'une extrusion est
   sélectionnée. OK valide (et désélectionne) ; Annuler remet le document EXACTEMENT comme à
   l'ouverture (création : la fonction disparaît ; modification : valeurs d'avant) et retire les
   étapes d'annulation prises entre-temps. */
let extDyn=null;          // session : {id, snap (document à l'ouverture), len (pile d'annulation), isNew}
let extDynOptOpen=false;  // « ▸ Options » déplié (mémorisé entre deux ouvertures)
function extDynFeature(){
  if(typeof sel==='undefined'||!sel||sel.kind!=='feature')return null;
  const f=(doc.features||[]).find(x=>x&&x.id===sel.id);
  return f&&f.type==='extrude'?f:null;
}
function extDynEnsure(){
  // Session de la fenêtre : ouverte à la première sélection d'une extrusion
  const f=extDynFeature();
  if(!f){extDyn=null;return null;}
  if(!extDyn||extDyn.id!==f.id)extDyn={id:f.id,isNew:false,snap:docSnap(),len:docUndoStack.length};
  return f;
}
function extDynNew(skId){
  // « Extrusion » : la fonction naît tout de suite (aperçu = résultat), fenêtre ouverte
  const snap=docSnap(),len=docUndoStack.length;
  const nf={id:uid('ex'),type:'extrude',name:'',sketchId:skId,distance:20,op:'add',visible:true,mid:false,upto:null};
  nf.name=extName(nf);
  addFeature(nf);
  const s=doc.sketches.find(x=>x.id===skId);if(s)s.visible=false;
  sel={kind:'feature',id:nf.id};
  extDyn={id:nf.id,isNew:true,snap,len};
  markDirty();rebuild();renderTree();renderProps();
  try{faceEl.textContent='Extrusion : tirez la flèche ou tapez la distance, puis OK (Échap = annuler).';}catch(e){}
  return nf;
}
function extDynSet(label,fn){
  // Une modification depuis la fenêtre : une étape d'annulation, rejeu, panneau à jour
  const f=extDynFeature();if(!f)return;
  docPushUndo(label||('modification de « '+f.name+' »'));
  fn(f);
  f.name=extName(f);
  try{repSyncForFeature(f);}catch(e){}
  markDirty();rebuild();renderTree();renderProps();
}
function extDynClose(){extDyn=null;extDynHide();}
function extDynOk(){
  extDynClose();sel={kind:null,id:null};
  try{renderTree();renderProps();}catch(e){}
  try{faceEl.textContent='Extrusion validée.';}catch(e){}
}
function extDynCancel(){
  const E=extDyn;extDynClose();
  if(!E){sel={kind:null,id:null};try{renderTree();renderProps();}catch(e){}return;}
  const changed=E.isNew||docUndoStack.length>E.len;
  if(changed){
    docApplySnap(E.snap); // rejoue, arbre et panneau à jour
    docUndoStack.length=Math.min(docUndoStack.length,E.len);docRedoStack.length=0;
    try{docUndoUI();}catch(e){}
  }
  sel={kind:null,id:null};try{renderTree();renderProps();}catch(e){}
  try{faceEl.textContent=E.isNew?'Extrusion annulée.':'Modifications annulées.';}catch(e){}
}
/* ── panneau ── */
function extSeg(opts,val,fn){
  // Boutons à icône (icône au-dessus, libellé dessous) : un choix lisible d'un coup d'œil
  const d=document.createElement('div');d.className='pnl-btns extSeg';d.style.cssText='gap:4px;flex-wrap:wrap';
  opts.forEach(([v,ic,lab,tip,on])=>{
    const b=document.createElement('button');b.className='mini extSegBtn';b.dataset.v=v;b.title=tip||lab;
    b.innerHTML='<span style="font-size:16px;line-height:1.1">'+ic+'</span><span>'+lab+'</span>';
    const act=on!=null?on:v===val;
    b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 6px;min-width:62px;font-size:10.5px'+
      (act?';outline:2px solid var(--accent, #0a84ff);color:var(--primary)':'');
    b.onclick=()=>fn(v,act);
    d.appendChild(b);
  });
  return d;
}
function extDynPanel(p,f){
  // Fenêtre de l'extrusion (création et modification), dans le panneau des propriétés
  extDynEnsure();
  const E=extDyn;
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const sec=(lab,el)=>{const w=mk('div','extSec');w.style.cssText='margin:6px 0 2px';const l=mk('div','pnl-note',lab);l.style.cssText='margin:0 0 3px;font-weight:600';w.appendChild(l);w.appendChild(el);p.appendChild(w);return w;};
  if(E&&E.isNew)p.appendChild(mk('div','pnl-note','Aperçu : la pièce montrée EST le résultat. Tirez la flèche ou tapez la distance.'));
  // profil
  const pr=mk('div','pnl-btns');pr.style.cssText='align-items:center;gap:6px';
  pr.appendChild(mk('span','pnl-note','✏️ '+skName(f.sketchId)));
  const ch=mk('button','mini','🔧 Changer');ch.title='Extruder une autre esquisse';ch.onclick=()=>askExtrude(null,f);pr.appendChild(ch);
  sec('Profil',pr);
  // opération
  sec('Opération',extSeg([['add','➕','Plot','Ajoute de la matière (bossage)'],['cut','➖','Poche','Retire de la matière'],['new','◧','Nouveau corps','Solide séparé']],
    f.newBody?'new':(f.op||'add'),v=>extDynSet('opération de « '+f.name+' »',g=>{
      if(v==='new'){if(!g.newBody){g._bodyPrev=g.body;g.body=extNewBody();g.newBody=true;}g.op='add';}
      else{if(g.newBody){g.body=g._bodyPrev||(doc.bodies[0]&&doc.bodies[0].id);delete g._bodyPrev;delete g.newBody;}g.op=v;}
      if(!g.upto&&!g.through)g.distance=Math.abs(g.distance||20)*(g.op==='cut'?-1:1);
      ghostHide=(g.op==='cut')?g.id:null;
    })));
  // direction
  sec('Direction',extSeg([['one','↗','Un côté','Depuis le plan de l’esquisse, d’un seul côté'],['mid','↕','Symétrique','De part et d’autre du plan (la distance est la course totale)'],
    ['flip','⇄','Inverser','Inverser le sens',!!f.flip]],f.mid?'mid':'one',(v)=>{
    if(v==='flip')extDynSet('inverser « '+f.name+' »',g=>{g.flip=!g.flip;});
    else extDynSet('direction de « '+f.name+' »',g=>{g.mid=(v==='mid');});
  }));
  // étendue
  sec('Étendue',extSeg([['dist','📏','Distance','Une distance donnée'],['upto','🎯','Jusqu’à la face','S’arrête sur une face du corps cible'],['through','⤴','À travers tout','Traverse tout le solide']],
    f.upto?'upto':(f.through?'through':'dist'),v=>{
    if(v==='upto'){
      if(!f.upto){
        const me=doc.features.indexOf(f);
        const prevs=doc.features.slice(0,me).filter(x=>x.type==='extrude'&&(x.op||'add')==='add');
        if(!prevs.length){try{faceEl.textContent='Jusqu’à la face : aucune extrusion additive ANTÉRIEURE.';}catch(e){}return;}
        docPushUndo('étendue de « '+f.name+' »');f.upto={ex:prevs[prevs.length-1].id,side:1};
      }
      extPickFace={f};try{renderer.domElement.style.cursor='crosshair';}catch(e){}
      try{faceEl.textContent='Cliquez une face du corps cible (Échap annule).';}catch(e){}
      renderProps();
    }else if(v==='through')extDynSet('étendue de « '+f.name+' »',g=>{g.upto=null;g.through=true;g.distance=null;});
    else extDynSet('étendue de « '+f.name+' »',g=>{g.upto=null;g.through=false;if(!isFinite(g.distance)||g.distance===null)g.distance=10*(g.op==='cut'?-1:1);});
  }));
  // distance / face cible
  if(f.upto){
    const w=mk('div','pnl-btns');w.style.cssText='align-items:center;gap:6px';
    w.appendChild(mk('span','pnl-note',f.upto.faceId&&f.upto.faceId.bid?'Face #'+f.upto.faceId.fi:'Face : (à cliquer)'));
    const b=mk('button','mini','🎯 Changer la face');b.onclick=()=>{extPickFace={f};try{renderer.domElement.style.cursor='crosshair';}catch(e){}try{faceEl.textContent='Cliquez une face (Échap annule).';}catch(e){}};w.appendChild(b);
    sec('Face cible',w);
  }else if(!f.through){
    const inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.className='extDynDist';inp.style.width='90px';
    inp.value=String(Math.abs(+f.distance||0)).replace('.',',');
    try{parFx(inp,f,'distance');}catch(e){}
    const cd=()=>{
      const v=parseFloat(String(inp.value).replace(',','.'));
      if(isFinite(v)&&v!==0&&Math.abs(Math.abs(v)-Math.abs(+f.distance||0))>1e-9)
        extDynSet('distance de « '+f.name+' »',g=>extDistSet(g,Math.abs(v)*((g.op||'add')==='cut'?-1:1)));
    };
    inp.addEventListener('change',cd);
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){cd();inp.blur();}e.stopPropagation();});
    const w=mk('div','pnl-btns');w.style.cssText='align-items:center;gap:6px';w.appendChild(inp);w.appendChild(mk('span','pnl-note','mm'+(f.mid?' (course totale)':'')));
    sec('Distance',w);
  }
  // options repliables
  const det=document.createElement('details');det.className='extOpt';det.open=extDynOptOpen;det.style.cssText='margin:8px 0 4px';
  det.addEventListener('toggle',()=>{extDynOptOpen=det.open;});
  const sm=document.createElement('summary');sm.textContent='Options';sm.style.cssText='cursor:pointer;font-weight:600;color:var(--muted)';det.appendChild(sm);
  const r=mk('div','pnl-row');r.appendChild(mk('label',null,'Dépouille (°)'));
  const inpD=document.createElement('input');inpD.type='text';inpD.inputMode='decimal';inpD.style.width='70px';inpD.className='extDynDraft';
  inpD.value=String(+f.draft||0).replace('.',',');inpD.title='Angle signé / plan d’esquisse. 0 = parois droites.';
  try{parFx(inpD,f,'draft');}catch(e){}
  const cdD=()=>{const v=parseFloat(String(inpD.value).replace(',','.').replace(/\s/g,''));
    if(!isFinite(v)){inpD.value=String(+f.draft||0).replace('.',',');return;}
    if(v===(+f.draft||0))return;
    extDynSet('dépouille de « '+f.name+' »',g=>{g.draft=Math.abs(v)<1e-9?0:+v.toFixed(3);});};
  inpD.addEventListener('change',cdD);inpD.addEventListener('keydown',e=>{if(e.key==='Enter'){cdD();inpD.blur();}e.stopPropagation();});
  r.appendChild(inpD);det.appendChild(r);
  p.appendChild(det);
  // Annuler / OK
  const b=mk('div','pnl-btns');b.style.cssText='justify-content:flex-end;gap:6px;margin-top:6px';
  const no=mk('button',null,'Annuler');no.className='extDynCancel';no.title=E&&E.isNew?'Retirer cette extrusion':'Revenir aux valeurs d’avant';no.onclick=extDynCancel;b.appendChild(no);
  const ok=mk('button','primary','OK');ok.classList.add('extDynOk');ok.onclick=extDynOk;b.appendChild(ok);
  p.appendChild(b);
}
/* ── flèche et champ de cote dans la vue ── */
let extArrow=null,extDrag=null,extLabel=null,extWired=false,extSwallow=0,extRebuildPending=false;
function extArrowGeom(f){
  // Centre du profil (boîte des entités de l'esquisse), normale, bout de l'extrusion (le long de n)
  const sk=doc.sketches.find(s=>s.id===f.sketchId);if(!sk||!sk.points)return null;
  let x0=1e18,y0=1e18,x1=-1e18,y1=-1e18;const add=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
  (sk.entities||[]).forEach(e=>{if(!e||e.construction)return;const P=sk.points;
    if(e.t==='line'){[e.p1,e.p2].forEach(id=>{const q=P[id];if(q)add(q.x,q.y);});}
    else if((e.t==='circle'||e.t==='arc')&&P[e.pc]){const q=P[e.pc],r=+e.r||0;add(q.x-r,q.y-r);add(q.x+r,q.y+r);}});
  if(!(x1>=x0))return null;
  const B=sketchBasis(sk),cx=(x0+x1)/2,cy=(y0+y1)/2;
  const C=B.o.clone().addScaledVector(B.u,cx).addScaledVector(B.v,cy),n=B.n.clone().normalize();
  const sp=extrudeSpan(f);
  const end=f.mid?sp.hi:(Math.abs(sp.hi)>=Math.abs(sp.lo)?sp.hi:sp.lo);
  return {C,n,end,size:Math.max(x1-x0,y1-y0)};
}
function extArrowBuild(){
  const g=new THREE.Group();g.name='extArrow';g.userData.noMirror=true;
  const mat=new THREE.MeshBasicMaterial({color:0x0a84ff,depthTest:false,transparent:true,opacity:0.95});
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.75,10),mat);shaft.position.y=0.375;
  const tip=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.28,16),mat);tip.position.y=0.86;
  const hit=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,1.05,8),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=0.52;
  [shaft,tip,hit].forEach(m=>{m.renderOrder=999;m.userData.extArrow=true;m.userData.noMirror=true;g.add(m);});
  const dot=new THREE.Mesh(new THREE.SphereGeometry(0.07,12,8),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false}));dot.renderOrder=999;dot.userData.noMirror=true;g.add(dot);
  scene.add(g);return g;
}
function extDynHide(){
  if(extArrow)extArrow.visible=false;
  if(extLabel)extLabel.style.display='none';
}
function extLabelEl(){
  if(extLabel)return extLabel;
  const w=document.createElement('div');w.className='extDistLbl';
  w.style.cssText='position:fixed;z-index:40;display:none;align-items:center;gap:6px;padding:3px 7px;border-radius:7px;background:var(--panel, #1e1e22);border:1px solid var(--line, #3a3a40);box-shadow:0 2px 10px rgba(0,0,0,.35);font-size:12px;color:var(--fg, #ddd)';
  const l=document.createElement('span');l.textContent='Distance';w.appendChild(l);
  const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.className='extDistIn';i.style.cssText='width:64px;font-size:12px;padding:1px 4px';
  i.addEventListener('keydown',e=>{e.stopPropagation();
    if(e.key==='Enter'){const f=extDynFeature();const v=parseFloat(String(i.value).replace(',','.').replace(/\s*mm$/,''));
      if(f&&isFinite(v)&&v!==0)extDynSet('distance de « '+f.name+' »',g=>extDistSet(g,Math.abs(v)*((g.op||'add')==='cut'?-1:1)));i.blur();}
    else if(e.key==='Escape')i.blur();});
  w.appendChild(i);const u=document.createElement('span');u.textContent='mm';w.appendChild(u);
  document.body.appendChild(w);extLabel=w;return w;
}
function extDynTick(){
  // À chaque image : la flèche suit l'extrusion sélectionnée, garde une taille constante à l'écran
  if(!extWired)extWire();
  const f=extDynFeature();
  const busy=(typeof skEdit!=='undefined'&&skEdit)||(typeof asmMode!=='undefined'&&asmMode==='asm')||(typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX);
  if(!f||f.upto||f.through||busy||f.visible===false){if(extDyn&&!f)extDyn=null;extDynHide();return;}
  const G=extArrowGeom(f);if(!G){extDynHide();return;}
  if(!extArrow)extArrow=extArrowBuild();
  const dir=G.end<0?G.n.clone().negate():G.n.clone();
  const P=G.C.clone().addScaledVector(G.n,G.end);
  const L=Math.max(1e-3,camera.position.distanceTo(P)*0.11);
  extArrow.position.copy(P);extArrow.scale.setScalar(L);
  extArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  extArrow.visible=true;
  // champ de cote : à côté de la pointe
  const w=extLabelEl(),inp=w.querySelector('input');
  const T=P.clone().addScaledVector(dir,L*0.9).project(camera),r=renderer.domElement.getBoundingClientRect();
  if(T.z>1||T.z<-1){w.style.display='none';return;}
  w.style.display='flex';
  w.style.left=Math.round(r.left+(T.x+1)/2*r.width+14)+'px';w.style.top=Math.round(r.top+(1-T.y)/2*r.height-14)+'px';
  if(document.activeElement!==inp)inp.value=String(+Math.abs(+f.distance||0).toFixed(3)).replace('.',',');
}
function extRayAxis(e,C,n){
  // Paramètre, le long de l'axe (C, n), du point le plus proche du rayon souris
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const d=rayc.ray.direction,w0=rayc.ray.origin.clone().sub(C);
  const b=d.dot(n),den=1-b*b;if(den<1e-6)return null;
  return (n.dot(w0)-b*d.dot(w0))/den;
}
function extDragApply(t,free){
  // Nouvelle course depuis la position de la souris sur l'axe : pas de 1 mm (Maj : libre),
  // l'autre côté du plan inverse le sens (une extrusion symétrique n'a pas de sens)
  const f=extDynFeature();if(!f||!extDrag)return;
  let m=f.mid?2*Math.abs(t):Math.abs(t);
  m=free?Math.round(m*100)/100:Math.round(m);
  if(!(m>=0.1))m=f.mid?2:1;
  if(!extDrag.pushed){docPushUndo('distance de « '+f.name+' »');extDrag.pushed=true;}
  extDistSet(f,m*((f.op||'add')==='cut'?-1:1));
  if(!f.mid){
    const G=extArrowGeom(f);
    if(G&&G.end*t<0)f.flip=!f.flip; // le bout est passé de l'autre côté du plan
  }
  f.name=extName(f);
  if(!extRebuildPending){extRebuildPending=true;requestAnimationFrame(()=>{extRebuildPending=false;try{markDirty();rebuild();}catch(e){}});}
}
function extWire(){
  if(typeof renderer==='undefined'||!renderer||!renderer.domElement)return;
  extWired=true;const el=renderer.domElement;
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0||!extArrow||!extArrow.visible)return;
    const f=extDynFeature();if(!f)return;
    const r=el.getBoundingClientRect();
    rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
    extArrow.updateMatrixWorld(true);
    const ms=[];extArrow.traverse(m=>{if(m.isMesh&&m.userData.extArrow)ms.push(m);});
    if(!rayc.intersectObjects(ms,false).length)return;
    e.stopImmediatePropagation();e.preventDefault();
    const G=extArrowGeom(f);if(!G)return;
    extDrag={C:G.C,n:G.n,pushed:false,id:e.pointerId};
    try{el.setPointerCapture(e.pointerId);}catch(err){}
    try{el.style.cursor='grabbing';}catch(err){}
  },true);
  el.addEventListener('pointermove',e=>{
    if(!extDrag)return;e.stopImmediatePropagation();
    const t=extRayAxis(e,extDrag.C,extDrag.n);if(t!=null)extDragApply(t,e.shiftKey);
  },true);
  const up=e=>{
    if(!extDrag)return;e.stopImmediatePropagation();
    const D=extDrag;extDrag=null;extSwallow=Date.now();
    try{el.releasePointerCapture(D.id);}catch(err){}
    try{el.style.cursor='';}catch(err){}
    if(D.pushed){try{const f=extDynFeature();if(f)repSyncForFeature(f);}catch(err){}markDirty();rebuild();renderTree();renderProps();}
  };
  el.addEventListener('pointerup',up,true);
  el.addEventListener('click',e=>{if(Date.now()-extSwallow<350){e.stopImmediatePropagation();e.preventDefault();}},true);
}
// Échap : annule la fenêtre de l'extrusion (sauf pendant une saisie ou le choix d'une face)
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!extDyn||!extDynFeature())return;
  if(typeof extPickFace!=='undefined'&&extPickFace)return;
  const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'))return;
  e.stopImmediatePropagation();e.preventDefault();extDynCancel();
},true);
