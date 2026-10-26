/* ---------- géométrie de construction : affichage, saisie, panneau (V0.5.0) ----------
   Le modèle et la résolution sont dans 78-construction-modele.js. Ici :
     · cgDraw()      dessin 3D (groupe cgGroup) : plans translucides, axes mixtes, points,
                     repères (triadMake, taille constante à l'écran) — refait à chaque rejeu ;
     · cgMode        création / modification en cours : {draft, editId, slot} — le brouillon
                     est un élément complet résolu à la volée (aperçu en pointillés) ;
     · saisie        clic dans la vue ou dans l'arbre → référence de l'emplacement actif ;
     · cgRenderProps panneau de propriétés (méthode, références, valeurs ƒx, ✓ / Annuler). */
const CG_COL=0xe0a526,CG_COL_SEL=0xff9f0a,CG_COL_PRE=0x64d2ff;
let cgGroup=null;
const cgTriads=new Map(); // id → triade réemployée (les triades vivent dans TRIADS : pas de fuite)
let cgMode=null;
let cgPaintSig='';
function cgGroupGet(){
  if(!cgGroup){cgGroup=new THREE.Group();cgGroup.name='cgGroup';}
  if(cgGroup.parent!==scene)scene.add(cgGroup);
  return cgGroup;
}
function cgV3(a){return new THREE.Vector3(a[0],a[1],a[2]);}
function cgModelExtent(){
  // Taille et centre d'affichage : la pièce visible, sinon 25 mm autour de l'origine
  const box=new THREE.Box3();
  try{bodies.forEach(b=>{if(b&&b.visible!==false&&b.mesh&&!b.ghost)box.expandByObject(b.mesh);});}catch(e){}
  if(box.isEmpty())return {c:[0,0,0],h:25};
  const s=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3());
  return {c:[c.x,c.y,c.z],h:Math.max(25,0.6*Math.max(s.x,s.y,s.z))};
}
function cgDispose(o){
  // libère un dessin, SAUF les triades des repères (réemployées d'un rejeu à l'autre)
  if(!o||(o.userData&&o.userData.triad))return;
  (o.children||[]).slice().forEach(cgDispose);
  try{if(o.geometry)o.geometry.dispose();}catch(e){}
  try{if(o.material)o.material.dispose();}catch(e){}
}
function cgTriadFor(id){
  let g=cgTriads.get(id);
  if(!g){g=triadMake({name:'cgTri_'+id,px:62,renderOrder:985});cgTriads.set(id,g);
    Object.keys(g.userData.planes).forEach(p=>{g.userData.planes[p].userData.cg={id,sub:p};});}
  return g;
}
function cgDrawOne(el,G,E,mode){
  // mode : 'n' normal, 's' sélectionné, 'p' aperçu (brouillon)
  const F=el.fr;if(!F)return;
  const col=mode==='p'?CG_COL_PRE:(mode==='s'?CG_COL_SEL:CG_COL);
  const o=cgV3(F.o),h=E.h;
  const grp=new THREE.Group();grp.name='cg_'+el.id;grp.userData.cg={id:el.id};
  const lineMat=()=>mode==='p'
    ?new THREE.LineDashedMaterial({color:col,dashSize:h/25,gapSize:h/40,transparent:true,opacity:0.95,depthTest:false})
    :new THREE.LineBasicMaterial({color:col,transparent:true,opacity:mode==='s'?1:0.85});
  if(el.kind==='plane'){
    const u=cgV3(F.x),v=cgV3(F.y),n=cgV3(F.z);
    // centré sur la projection du centre de la pièce : le plan « couvre » la pièce, comme Fusion
    const d=new THREE.Vector3(E.c[0],E.c[1],E.c[2]).sub(o);
    const c=o.clone().addScaledVector(u,d.dot(u)).addScaledVector(v,d.dot(v));
    const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>c.clone().addScaledVector(u,a*h).addScaledVector(v,b*h));
    const ge=new THREE.BufferGeometry();const arr=[];[[0,1,2],[0,2,3]].forEach(t=>t.forEach(i=>arr.push(pts[i].x,pts[i].y,pts[i].z)));
    ge.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
    const m=new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:mode==='s'?0.3:0.16,side:THREE.DoubleSide,depthWrite:false}));
    m.userData.cg={id:el.id};m.userData.cgPlane=true;m.renderOrder=960;grp.add(m);
    const L=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),lineMat());
    if(L.computeLineDistances)L.computeLineDistances();L.renderOrder=961;L.raycast=()=>{};grp.add(L);
    // petite flèche de normale au coin : le sens du plan se lit (esquisse, extrusion)
    const k=pts[2].clone().addScaledVector(u,-h*0.12).addScaledVector(v,-h*0.12);
    const N=new THREE.Line(new THREE.BufferGeometry().setFromPoints([k,k.clone().addScaledVector(n,h*0.18)]),lineMat());
    N.raycast=()=>{};grp.add(N);
  }else if(el.kind==='axis'){
    const z=cgV3(F.z),L=h*1.3;
    const a=o.clone().addScaledVector(z,-L),b=o.clone().addScaledVector(z,L);
    const mat=new THREE.LineDashedMaterial({color:col,dashSize:h/10,gapSize:h/30,transparent:true,opacity:0.95,depthTest:mode!=='p'});
    const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);ln.computeLineDistances();ln.raycast=()=>{};grp.add(ln);
    // tube invisible pour le clic (une ligne n'a pas d'épaisseur)
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(h*0.02,h*0.02,2*L,8,1,true),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
    tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),z);tube.position.copy(o);tube.userData.cg={id:el.id};grp.add(tube);
  }else if(el.kind==='point'){
    const s=new THREE.Mesh(new THREE.SphereGeometry(h*0.025,14,10),new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true,opacity:0.95}));
    s.position.copy(o);s.renderOrder=970;s.userData.cg={id:el.id};grp.add(s);
  }else if(el.kind==='frame'){
    if(mode==='p'){
      // aperçu : trois traits (la triade réelle n'existe qu'une fois validée)
      [[F.x,0xff453a],[F.y,0x30d158],[F.z,0x0a84ff]].forEach(([d,c])=>{
        const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([o,o.clone().addScaledVector(cgV3(d),h*0.5)]),new THREE.LineBasicMaterial({color:c,depthTest:false}));
        ln.raycast=()=>{};grp.add(ln);});
    }else{
      const g=cgTriadFor(el.id),pg=g.userData.planeGroup;
      g.position.copy(o);
      g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(cgV3(F.x),cgV3(F.y),cgV3(F.z)));
      g.userData.cg={id:el.id};
      grp.add(g);grp.add(pg);
      Object.keys(g.userData.planes).forEach(p=>{const m=g.userData.planes[p];
        m.material.opacity=(sel&&sel.kind==='cg'&&sel.id===el.id&&(!sel.sub||sel.sub===p))?0.75:0.3;});
    }
  }
  G.add(grp);
}
function cgDraw(){
  // Redessine toute la construction (rejeu, visibilité, sélection, aperçu)
  if(typeof scene==='undefined'||!scene)return;
  const G=cgGroupGet();
  for(const o of [...G.children]){G.remove(o);cgDispose(o);}
  const vivants=new Set((doc.cgeo||[]).map(c=>c.id));
  for(const [id,g] of cgTriads){
    if(vivants.has(id))continue;
    [g,g.userData.planeGroup].forEach(x=>{const i=TRIADS.indexOf(x);if(i>=0)TRIADS.splice(i,1);});
    cgTriads.delete(id);
  }
  const E=cgModelExtent();
  const folded=!!(doc.fold&&doc.fold.cgHide);
  for(const el of (doc.cgeo||[])){
    if(!cgValid(el)||el.visible===false||folded||cgLocked(el))continue;
    if(cgMode&&cgMode.editId===el.id)continue; // en modification : seul l'aperçu est montré
    cgDrawOne(el,G,E,(sel&&sel.kind==='cg'&&sel.id===el.id)?'s':'n');
  }
  if(cgMode&&cgMode.draft&&cgMode.draft.fr)cgDrawOne(cgMode.draft,G,E,'p');
  cgPaintSig=cgSelSig();
}
function cgSelSig(){return (sel&&sel.kind==='cg')?sel.id+'|'+(sel.sub||''):'';}
function cgPaintIfNeeded(){
  // appelé à chaque image (animate) : la surbrillance suit la sélection sans rejeu
  if(!cgGroup||!(doc.cgeo||[]).length)return;
  if(cgSelSig()!==cgPaintSig){try{cgDraw();}catch(e){}}
}
/* ── clic dans la vue ── */
function cgPickAt(e){
  // Élément de construction sous le curseur → {id,sub,dist,plane} ou null
  if(!cgGroup||!cgGroup.children.length)return null;
  try{
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    cgGroup.updateMatrixWorld(true);
    const ms=[];cgGroup.traverse(o=>{if(o.isMesh&&o.userData&&o.userData.cg&&o.visible!==false)ms.push(o);});
    const hits=rayc.intersectObjects(ms,false).filter(h=>!(h.object.userData.cg.id===(cgMode&&cgMode.draft&&cgMode.draft.id)));
    if(!hits.length)return null;
    // un point, un axe ou un plan de repère passe avant un grand plan traversé
    hits.sort((a,b)=>((a.object.userData.cgPlane?1:0)-(b.object.userData.cgPlane?1:0))||(a.distance-b.distance));
    const h=hits[0],c=h.object.userData.cg;
    return {id:c.id,sub:c.sub||null,dist:h.distance,plane:!!h.object.userData.cgPlane};
  }catch(err){return null;}
}
function cgSelectAt(e){
  // Clic simple hors saisie : sélectionne l'élément visé. Un grand plan ne masque pas la pièce.
  const c=cgPickAt(e);if(!c)return false;
  if(c.plane){const h=pick(e);if(h&&h.distance<c.dist-1e-6)return false;}
  sel={kind:'cg',id:c.id,sub:c.sub};
  try{clearMeasure();}catch(err){}
  renderTree();renderProps();cgDraw();
  const el=cgGet(c.id);
  try{faceEl.textContent=(el?el.name:'')+(c.sub?' · plan '+c.sub:'')+(el&&(el.kind==='plane'||c.sub)?'\nBouton « Esquisse » (ou double-clic dans l’arbre) pour dessiner dessus.':'');}catch(err){}
  return true;
}
/* ── création / modification ── */
function cgExtKey(g){return (g.path||[]).join('/')+'|'+(g.cg||'')+'|'+(g.o||'');}
function cgExtCandidates(kind){
  // Éléments d'autres instances de l'assemblage (même type, et ceux de l'origine) → [{path,cg,o,label}]
  if(!asm||!asmOn())return [];
  const out=[],me=asm.path.join('/');
  const O={plane:['XY','XZ','YZ'],axis:['X','Y','Z'],point:['O'],frame:['O']}[kind]||[];
  const lab={XY:'Plan XY',XZ:'Plan XZ',YZ:'Plan YZ',X:'Axe X',Y:'Axe Y',Z:'Axe Z',O:'Origine'};
  asmInstances(asm.root).forEach(inst=>{
    if(inst.path.join('/')===me)return; // pas sa propre instance
    const c=asmComp(inst.comp);if(!c)return;
    const names=[];let q=asmRoot();inst.path.forEach(id=>{const o=q.occ.find(z=>z.id===id);names.push(o?o.name:'?');q=o?asmComp(o.comp):q;});
    const nm=inst.path.length?names.join(' › '):c.name+' (racine)';
    O.forEach(o=>out.push({path:inst.path,cg:null,o,label:nm+' › '+lab[o]}));
    (c.doc.cgeo||[]).forEach(k=>{if(k&&k.fr&&k.kind===kind)out.push({path:inst.path,cg:k.id,o:null,label:nm+' › '+k.name});});
  });
  return out;
}
function cgDraftOf(kind,how){
  return {id:'cg_brouillon',kind,how,name:'',refs:[],p:cgDefaults(kind,how),at:null,visible:true,fr:null,st:'ok',msg:''};
}
function cgSelRef(){
  // La sélection courante comme référence (préremplissage du premier emplacement)
  if(!sel)return null;
  if(sel.kind==='plane'&&CG_O_PLANES[sel.id])return {k:'o',id:sel.id};
  if(sel.kind==='originAxis')return {k:'o',id:sel.id};
  if(sel.kind==='cg'&&cgGet(sel.id))return sel.sub?{k:'cg',id:sel.id,sub:sel.sub}:{k:'cg',id:sel.id};
  return null;
}
function cgStart(kind){
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return;}
  if(!CG_KINDS[kind])return;
  const d=cgDraftOf(kind,CG_DEF_HOW[kind]);
  const r=cgSelRef();
  const S=CG_HOW[kind][d.how].slots;
  if(r&&S[0]&&(cgEvalRef(r,null)||{})[S[0][0]])d.refs[0]=r;
  cgMode={draft:d,editId:null,slot:null};
  cgNextSlot();
  sel={kind:null,id:null};
  cgRefresh();
}
function cgEdit(id){
  const el=cgGet(id);if(!el)return;
  if(typeof skEdit!=='undefined'&&skEdit)return;
  const d=JSON.parse(JSON.stringify(cgClean(el)));
  cgMode={draft:d,editId:id,slot:null};
  sel={kind:null,id:null};
  cgRefresh();
}
function cgNextSlot(from){
  // Active le premier emplacement obligatoire vide ; sinon l'emplacement FACULTATIF qui suit
  // celui qu'on vient de remplir (direction X d'un repère…) ; sinon aucun : tout est saisi.
  if(!cgMode)return;
  const S=CG_HOW[cgMode.draft.kind][cgMode.draft.how].slots,R=cgMode.draft.refs;
  let i=S.findIndex((s,k)=>!s[2]&&!R[k]);
  if(i<0&&from!=null)i=S.findIndex((s,k)=>k>from&&s[2]&&!R[k]);
  cgMode.slot=i>=0?i:null;
  try{renderer.domElement.style.cursor=cgMode.slot!=null?'crosshair':'default';}catch(e){}
}
function cgRefresh(){
  // Brouillon résolu, aperçu, panneau, consigne
  if(cgMode){try{cgResolveOne(cgMode.draft,{});}catch(e){}}
  try{cgDraw();}catch(e){}
  try{renderTree();renderProps();}catch(e){}
  if(cgMode&&cgMode.slot!=null){
    const s=CG_HOW[cgMode.draft.kind][cgMode.draft.how].slots[cgMode.slot];
    try{faceEl.textContent=CG_KINDS[cgMode.draft.kind].lab+' — '+s[1]+' : cliquez '+cgSlotHint(s[0])+' — Échap annule.';}catch(e){}
  }else if(cgMode){
    const d=cgMode.draft;
    try{faceEl.textContent=CG_KINDS[d.kind].lab+' — '+(d.fr&&d.st!=='warn'?'réglez les valeurs puis ✓ Valider (Échap annule).':'⚠ '+(d.msg||'références incomplètes'));}catch(e){}
  }
}
function cgSlotHint(t){
  return ({plane:'un plan d’origine, un plan de construction ou une face plane',
    axis:'un axe (origine, construction), une arête droite ou une face cylindrique',
    point:'l’origine, un point, un sommet, le centre d’une arête circulaire',
    frame:'un repère (ou l’origine)'})[t]||'une référence';
}
function cgCancel(){
  cgMode=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  cgRefresh();
  try{faceEl.textContent='Construction : annulé.';}catch(e){}
}
function cgCommit(){
  if(!cgMode)return;
  const d=cgMode.draft;
  try{cgResolveOne(d,{});}catch(e){}
  if(!d.fr){try{faceEl.textContent='Construction incomplète : '+(d.msg||'références manquantes')+'.';}catch(e){}return;}
  let id;
  if(cgMode.editId){
    const el=cgGet(cgMode.editId);if(!el){cgCancel();return;}
    docPushUndo('modification de « '+el.name+' »');
    el.how=d.how;el.refs=d.refs.map(r=>r?JSON.parse(JSON.stringify(r)):null);el.p=JSON.parse(JSON.stringify(d.p||{}));
    if(d.how==='ext'&&d.ext)el.ext=JSON.parse(JSON.stringify(d.ext));else delete el.ext;
    if(d.name)el.name=d.name;
    id=el.id;
  }else{
    const el=cgNew(d.kind,d.how,d.refs,d.p,d.name||null);
    if(d.ext){el.ext=JSON.parse(JSON.stringify(d.ext));try{cgResolveOne(el,{});}catch(e){}}
    id=el.id;
  }
  cgMode=null;
  try{renderer.domElement.style.cursor='default';}catch(e){}
  sel={kind:'cg',id};
  markDirty();rebuild();cgRefresh();
  const el=cgGet(id);
  try{faceEl.textContent=(el?el.name+' : '+cgHowLabel(el):'')+(el&&el.st==='warn'?' — ⚠ '+el.msg:'')+'.';}catch(e){}
}
function cgSetHow(how){
  if(!cgMode||!CG_HOW[cgMode.draft.kind][how])return;
  const d=cgMode.draft,old=d.how;if(old===how)return;
  const So=CG_HOW[d.kind][old].slots,Sn=CG_HOW[d.kind][how].slots;
  // on garde les références compatibles, emplacement par emplacement
  const refs=[];Sn.forEach((s,i)=>{const r=d.refs[i];if(r&&So[i]&&(cgEvalRef(r,null)||{})[s[0]])refs[i]=r;});
  d.how=how;d.refs=refs;d.p=Object.assign(cgDefaults(d.kind,how),Object.fromEntries(Object.entries(d.p||{}).filter(([k])=>k==='flip'||k==='expr'||k==='pname'||(CG_HOW[d.kind][how].par||{})[k])));
  cgNextSlot();cgRefresh();
}
function cgRefAccept(ref){
  // Remplit l'emplacement actif si la référence convient → true
  if(!cgMode||cgMode.slot==null||!ref)return false;
  const d=cgMode.draft,s=CG_HOW[d.kind][d.how].slots[cgMode.slot];
  if(ref.k==='cg'){
    // pas d'auto-référence ni de référence à un élément évalué après (cycle)
    if(cgMode.editId){
      if(ref.id===cgMode.editId){try{faceEl.textContent='Un élément ne peut pas se référencer lui-même.';}catch(e){}return false;}
      const ord=cgOrder(),me=cgGet(cgMode.editId),it=cgGet(ref.id);
      if(me&&it&&ord.indexOf(it)>ord.indexOf(me)){try{faceEl.textContent='« '+it.name+' » est évalué après : choisissez une référence antérieure.';}catch(e){}return false;}
    }
  }
  const g=cgEvalRef(ref,{});
  if(!g||!g[s[0]]){try{faceEl.textContent=s[1]+' : ce n’est pas '+({plane:'un plan',axis:'un axe',point:'un point',frame:'un repère'})[s[0]]+'. Cliquez '+cgSlotHint(s[0])+'.';}catch(e){}return false;}
  const k=cgMode.slot;
  d.refs[k]=ref;
  cgNextSlot(k);cgRefresh();
  return true;
}
function cgPickCommit(e){
  // Clic dans la vue pendant la saisie d'une référence
  if(!cgMode||cgMode.slot==null)return;
  const c=cgPickAt(e);
  const body=pick(e);
  if(c&&!(c.plane&&body&&body.distance<c.dist-1e-6)){cgRefAccept(c.sub?{k:'cg',id:c.id,sub:c.sub}:{k:'cg',id:c.id});return;}
  const tp=triadPickPlane(e);if(tp){cgRefAccept({k:'o',id:tp});return;}
  const mr=cgPickModelRef(e,cgMode.draft,cgMode.slot);
  if(mr){cgRefAccept(mr);return;}
  const xr=cgPickOtherComp(e,cgMode.draft,cgMode.slot,body);
  if(xr){cgRefAccept(xr);return;}
  if(!body){const pl=pickPlane(e);if(pl){cgRefAccept({k:'o',id:pl});return;}}
  try{faceEl.textContent='Rien de reconnu ici — cliquez '+cgSlotHint(CG_HOW[cgMode.draft.kind][cgMode.draft.how].slots[cgMode.slot][0])+'.';}catch(err){}
}
function cgPickModelRef(e,draft,slot){
  // Référence sur la pièce sous le curseur, selon le TYPE attendu par l'emplacement :
  //   point : sommet (≤ 12 px d'une extrémité d'arête), centre d'une arête circulaire, sinon
  //           l'extrémité la plus proche ;  axe : arête droite ou circulaire (axe du cercle),
  //           face cylindrique ou conique ;  plan : face plane, ou plan d'une arête circulaire.
  if(!(typeof occHas==='function'&&occHas())||!occLive||!occLive.shape)return null;
  const type=(CG_HOW[draft.kind][draft.how].slots[slot]||[])[0];
  const h=pick(e);
  {
    const E=cgEdgeUnder(e,h);
    if(E){
      const G=cgEdgeGeom(E.pts);
      const base={pos:E.mid.map(v=>+v.toFixed(4)),len:+E.len.toFixed(4)};
      try{const a=xAnchorFor(E.mid);if(a)base.anchor=a;}catch(err){}
      if(type==='point'){
        const r=renderer.domElement.getBoundingClientRect();
        const scr=p=>{const v=new THREE.Vector3(p[0],p[1],p[2]).project(camera);return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height];};
        const ends=[E.pts[0],E.pts[E.pts.length-1]].map(p=>{const s=scr(p);return {p,d:Math.hypot(s[0]-e.clientX,s[1]-e.clientY)};}).sort((x,y)=>x.d-y.d);
        if(G&&G.circ&&ends[0].d>12)return Object.assign({k:'edge',name:'Centre · '+entName('edge')},base);
        return Object.assign({k:'vtx',vpos:ends[0].p.map(v=>+v.toFixed(4)),name:'Sommet · '+entName('edge')},base);
      }
      if(type==='axis'&&G)return Object.assign({k:'edge',name:entName('edge')},base);
      if(type==='plane'&&G&&G.circ)return Object.assign({k:'edge',name:'Plan du cercle · '+entName('edge')},base);
    }
  }
  if(h&&(type==='plane'||type==='axis')){
    let hit=null;
    try{
      hit=occFaceOfHit(h.object,h.faceIndex);if(!hit||!hit.face)return null;
      const st=occSurfKind(hit.face);
      if(type==='plane'&&st!=='Plane')return null;
      if(type==='axis'&&st!=='Cylinder'&&st!=='Cone')return null;
      const fr=occFaceRefAny(hit.face);if(!fr)return null;
      return {k:'face',ref:fr,name:entName('face')};
    }catch(err){return null;}
    finally{try{if(hit&&hit.face)hit.face.delete();}catch(err){}}
  }
  return null;
}
function cgPickOtherComp(e,draft,slot,bodyHit){
  // Face d'un AUTRE composant affiché autour de la pièce (mode Modéliser d'un assemblage) :
  // plan = face plane, axe = face cylindrique ou conique. Ces maillages ne sont pas cliquables
  // en temps normal (asmFill) : on les vise ici, pendant la saisie seulement. → ref 'xf' ou null
  if(typeof asm==='undefined'||!asm||!asmOn()||asmMode==='asm')return null;
  const type=(CG_HOW[draft.kind][draft.how].slots[slot]||[])[0];
  if(type!=='plane'&&type!=='axis')return null;
  const G=scene.getObjectByName('asmCtx');if(!G)return null;
  try{
    const r=renderer.domElement.getBoundingClientRect();
    rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
    G.updateMatrixWorld(true);
    const hits=[];G.traverse(m=>{if(m.isMesh&&m.visible!==false)THREE.Mesh.prototype.raycast.call(m,rayc,hits);});
    hits.sort((a,b)=>a.distance-b.distance);
    const h=hits[0];if(!h||!h.face)return null;
    if(bodyHit&&bodyHit.distance<h.distance-1e-6)return null; // la pièce active est devant
    let g=h.object;while(g&&!(g.userData&&g.userData.path))g=g.parent;if(!g)return null;
    const path=g.userData.path.slice(),T=asmPathComp(path),c=asmComp(T);
    if(!c||T===asm.active)return null;
    const Fs=c._snap&&c._snap.pfaces;
    if(!Fs||!Fs.length){try{faceEl.textContent='« '+c.name+' » : faces exactes indisponibles (noyau exact requis, rejouez ce composant).';}catch(err){}return null;}
    const ctx=asm.path.slice(),Fi=asmInverse(asmSkXf(ctx,path));
    const p=asmApply(Fi,[h.point.x,h.point.y,h.point.z]);
    const nw=h.face.normal.clone().transformDirection(h.object.matrixWorld);
    const q=asmApply(Fi,[nw.x,nw.y,nw.z]),n=cgUnit([q[0]-Fi.o[0],q[1]-Fi.o[1],q[2]-Fi.o[2]]);
    let best=null,bd=Infinity;
    Fs.forEach(f=>{
      if(type==='plane'&&f.plane&&Math.abs(cgDot(n,f.plane.n))>0.995){
        const d=Math.abs(cgDot(cgSub(p,f.plane.o),f.plane.n));if(d<bd){bd=d;best=f;}
      }
      if(type==='axis'&&f.axis&&Math.abs(cgDot(n,f.axis.d))<0.2){
        const w=cgSub(p,f.axis.o),t=cgDot(w,f.axis.d),dd=cgLen(cgSub(w,cgMul(f.axis.d,t)));
        const d=f.axis.rad!=null?Math.abs(dd-f.axis.rad):dd;if(d<bd){bd=d;best=f;}
      }
    });
    if(!best||bd>0.5)return null;
    const nm=(asmOcc(path[path.length-1])||{}).name||c.name;
    const loc=best.plane?{plane:best.plane}:{axis:best.axis};
    return {k:'xf',ctx,path,ref:best.ref,loc,name:(best.plane?'Face':'Axe de face')+' · '+nm,sig:null};
  }catch(err){return null;}
}
function cgEdgeUnder(e,faceHit){
  // Arête EXACTE (occListEdges) à ≤ 7 px du curseur, indépendante de l'affichage des arêtes
  // (edgeHoverSegs n'existe que lorsqu'elles sont dessinées). Une arête cachée derrière la
  // face survolée est ignorée, comme pour la sélection d'arêtes.
  const edges=cgEdgesOf(occLive.shape,null);if(!edges.length)return null;
  const r=renderer.domElement.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const v=new THREE.Vector3(),toS=p=>{v.set(p[0],p[1],p[2]).project(camera);return [(v.x+1)/2*r.width,(1-v.y)/2*r.height,v.z];};
  let best=null,bd=7;
  for(const E of edges){
    let a=toS(E.pts[0]);
    for(let k=1;k<E.pts.length;k++){
      const b=toS(E.pts[k]);
      if(Math.abs(a[2])<1&&Math.abs(b[2])<1){
        const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-9;
        const t=Math.max(0,Math.min(1,((mx-a[0])*dx+(my-a[1])*dy)/L2));
        const d=Math.hypot(mx-(a[0]+t*dx),my-(a[1]+t*dy));
        if(d<bd){
          const P0=E.pts[k-1],P1=E.pts[k],w=new THREE.Vector3(P0[0]+(P1[0]-P0[0])*t,P0[1]+(P1[1]-P0[1])*t,P0[2]+(P1[2]-P0[2])*t);
          if(!faceHit||camera.position.distanceTo(w)<=faceHit.distance*1.004+0.3){bd=d;best=E;}
        }
      }
      a=b;
    }
  }
  return best;
}
function cgTreePick(ref){
  // Clic dans l'arbre pendant une saisie → true si consommé
  if(!cgMode||cgMode.slot==null)return false;
  cgRefAccept(ref);
  return true;
}
function cgEscape(){
  // Échap : quitte la saisie de l'emplacement, puis le panneau → true si consommé
  if(!cgMode)return false;
  if(cgMode.slot!=null){cgMode.slot=null;try{renderer.domElement.style.cursor='default';}catch(e){}cgRefresh();try{faceEl.textContent='Saisie interrompue — ✓ pour valider, Annuler pour abandonner.';}catch(e){}return true;}
  cgCancel();try{faceEl.textContent='Construction : annulé.';}catch(e){}
  return true;
}
/* ── libellés ── */
function cgRefLabel(r){
  if(!r)return '';
  if(r.k==='o')return CG_O_PLANES[r.id]?'Plan '+r.id:(r.id==='O'?'Origine':'Axe '+r.id);
  if(r.k==='cg'){const el=cgGet(r.id);return (el?el.name:'(supprimé)')+(r.sub?' · '+r.sub:'');}
  if(r.k==='skpt'){const sk=(doc.sketches||[]).find(s=>s.id===r.sk);return 'Point · '+(sk?sk.name:'esquisse ?');}
  if(r.name)return r.name;
  return ({face:'Face',edge:'Arête',vtx:'Sommet'})[r.k]||'Référence';
}
function cgLabel(el){
  const sub=el.kind==='point'&&el.fr?' ('+el.fr.o.map(v=>(+v).toFixed(1).replace('.',',')).join(' ; ')+')':'';
  return el.name+' · '+cgHowLabel(el)+sub;
}
/* ── panneau de propriétés ── */
function cgRenderProps(p){
  const el=(sel&&sel.kind==='cg')?cgGet(sel.id):null;
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const H=t=>p.appendChild(mk('div','pnl-h',t));
  const Note=t=>p.appendChild(mk('div','pnl-note',t));
  const Row=(lab,ctl)=>{const r=mk('div','pnl-row');r.appendChild(mk('label',null,lab));if(ctl)r.appendChild(ctl);p.appendChild(r);return r;};
  const Btns=list=>{const d=mk('div','pnl-btns');list.forEach(([t,fn,cls])=>{const b=mk('button',cls||null,t);b.onclick=fn;d.appendChild(b);});p.appendChild(d);return d;};
  if(!cgMode&&el){
    H(CG_KINDS[el.kind].ic+' '+el.name);
    Note(cgKindLabel(el)+' · '+cgHowLabel(el)+(sel.sub?' · plan '+sel.sub+' du repère':''));
    if(el.st==='warn')Note('⚠ '+el.msg);
    (el.refs||[]).forEach((r,i)=>{if(r){const s=(CG_HOW[el.kind][el.how].slots[i]||[0,'Référence'])[1];Note(s+' : '+cgRefLabel(r));}});
    if(el.how==='ext'&&el.ext){
      const g=cgExtCandidates(el.kind).find(x=>cgExtKey(x)===cgExtKey(el.ext));
      Note('Depuis : '+(g?g.label:'(élément visé introuvable)'));
      const fz=document.createElement('input');fz.type='checkbox';fz.checked=!!el.ext.frozen;
      fz.onchange=()=>{docPushUndo(fz.checked?'figer « '+el.name+' »':'libérer « '+el.name+' »');el.ext.frozen=fz.checked;markDirty();rebuild();cgRefresh();};
      Row('Figer (ne suit plus)',fz);
    }
    if(el.fr){const f=v=>v.map(x=>(+x).toFixed(3).replace('.',',')).join(' ; ');
      Note('Origine : '+f(el.fr.o)+(el.kind==='point'?'':' · '+(el.kind==='axis'?'direction':'normale Z')+' : '+f(el.fr.z)));}
    const can=el.kind==='plane'||(el.kind==='frame'&&sel.sub&&CG_O_PLANES[sel.sub]);
    const L=[['✏️ Modifier',()=>cgEdit(el.id)]];
    if(can&&typeof newSketchOnCg==='function')L.push(['✏️ Esquisse dessus',()=>newSketchOnCg(el.id,el.kind==='frame'?sel.sub:null)]);
    L.push(['🗑 Supprimer',()=>cgAskDelete(el.id),'danger']);
    Btns(L);
    const c=document.createElement('input');c.type='checkbox';c.checked=el.visible!==false;
    c.onchange=()=>{el.visible=c.checked;try{dirty=true;}catch(e){}cgDraw();renderTree();};
    Row('Visible',c);
    return;
  }
  if(!cgMode)return;
  const d=cgMode.draft,K=CG_KINDS[d.kind],HW=CG_HOW[d.kind][d.how];
  H(K.ic+' '+(cgMode.editId?'Modifier « '+((cgGet(cgMode.editId)||{}).name||'')+' »':'Nouveau '+K.lab.toLowerCase()));
  // méthode
  const s=document.createElement('select');
  Object.keys(CG_HOW[d.kind]).forEach(k=>{if(k==='ext'&&k!==d.how&&!cgExtCandidates(d.kind).length)return; // pas d'autre instance
    const o=document.createElement('option');o.value=k;o.textContent=CG_HOW[d.kind][k].lab;if(k===d.how)o.selected=true;s.appendChild(o);});
  s.onchange=()=>cgSetHow(s.value);
  Row('Méthode',s);
  // références
  HW.slots.forEach((sl,i)=>{
    const w=mk('span');w.style.cssText='display:flex;gap:4px;align-items:center;flex:1;justify-content:flex-end';
    const b=mk('button','mini',d.refs[i]?cgRefLabel(d.refs[i]):(cgMode.slot===i?'▸ cliquez…':(sl[2]?'(facultatif)':'— choisir —')));
    if(cgMode.slot===i){b.style.outline='2px solid var(--accent, #0a84ff)';}
    b.title='Cliquer puis désigner dans la vue ou dans l’arbre : '+cgSlotHint(sl[0]);
    b.onclick=()=>{cgMode.slot=i;try{renderer.domElement.style.cursor='crosshair';}catch(e){}cgRefresh();};
    w.appendChild(b);
    if(d.refs[i]){const x=mk('button','mini','✕');x.title='Retirer';x.onclick=()=>{d.refs[i]=null;cgMode.slot=i;cgRefresh();};w.appendChild(x);}
    Row(sl[1],w);
  });
  // référence externe : l'élément visé, dans une autre instance de l'assemblage
  if(HW.ext){
    const L=cgExtCandidates(d.kind),cur=d.ext?cgExtKey(d.ext):'';
    const s2=document.createElement('select');s2.style.maxWidth='190px';
    const o0=document.createElement('option');o0.value='';o0.textContent='— choisir —';s2.appendChild(o0);
    L.forEach((g,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=g.label;if(cgExtKey(g)===cur)o.selected=true;s2.appendChild(o);});
    s2.onchange=()=>{const g=L[+s2.value];d.ext=g?{ctx:asm.path.slice(),path:g.path.slice(),cg:g.cg,o:g.o,frozen:false}:null;cgRefresh();};
    Row('Élément visé',s2);
    Note('Associatif : suit l’autre composant quand il change ou se déplace (« Figer » ensuite pour l’arrêter).');
  }
  // valeurs (ƒx)
  Object.keys(HW.par||{}).forEach(k=>{
    const P=HW.par[k],inp=document.createElement('input');inp.type='text';inp.inputMode='decimal';inp.style.width='80px';
    inp.value=String(+(+d.p[k]||0).toFixed(4)).replace('.',',');
    if(typeof parFx==='function')parFx(inp,d.p,k);
    const apply=()=>{const v=parseFloat(String(inp.value).replace(',','.'));if(isFinite(v)&&v!==d.p[k]){d.p[k]=v;cgRefresh();}};
    inp.addEventListener('change',apply);inp.addEventListener('keydown',e=>{if(e.key==='Enter')apply();});
    const w=mk('span');w.style.cssText='display:flex;gap:4px;align-items:center';w.appendChild(inp);w.appendChild(mk('span','pnl-note',P.unit));
    Row(P.lab,w);
  });
  if(HW.flip){const c=document.createElement('input');c.type='checkbox';c.checked=!!d.p.flip;c.onchange=()=>{d.p.flip=c.checked;cgRefresh();};Row(d.kind==='axis'?'Inverser le sens':'Inverser la normale',c);}
  if(d.fr&&d.st!=='warn')Note('✓ '+(d.kind==='point'?'Point : ':'Origine : ')+d.fr.o.map(v=>(+v).toFixed(2).replace('.',',')).join(' ; '));
  else if(d.msg)Note('⚠ '+d.msg);
  Btns([['✓ Valider',cgCommit,'primary'],['Annuler',cgCancel]]);
}
function cgAskDelete(id){
  const el=cgGet(id);if(!el)return;
  const u=cgUsers(id),parts=[];
  if(u.sks.length)parts.push(u.sks.length+' esquisse(s) (laissées en place, plan figé)');
  if(u.cgs.length)parts.push(u.cgs.length+' élément(s) de construction (figés, ⚠)');
  if(!confirm('Supprimer « '+el.name+' » ?'+(parts.length?'\nIl est utilisé par '+parts.join(' et ')+'.':'')))return;
  cgDelete(id);
  sel={kind:null,id:null};
  markDirty();rebuild();cgRefresh();
}
/* ── arbre ── */
function cgTreeModel(L){
  // Section « Construction » de l'arbre (42 : treeModel, après l'origine) : une section repliable
  // et ses éléments EN ENFANTS (niveau 1), comme les plans et axes sous Origine
  const C=(doc.cgeo||[]).filter(cgValid).filter(c=>!cgLocked(c));
  if(!C.length)return;
  const f=!!(doc.fold&&doc.fold.cg);
  const open=!f||!!(typeof treeQuery!=='undefined'&&treeQuery)||(sel&&sel.kind==='cg')||!!cgMode; // jamais replié sur ce qu'on vise
  L.push({lvl:0,cls:'tnode tsec',title:'Plans, axes, points et repères de construction',
    html:'<span class="tri" title="Déplier / replier">'+(open?'▼':'▶')+'</span><span>📐</span><span class="nm">Construction ('+C.length+')</span>',
    on:{click:()=>{doc.fold=doc.fold||{};doc.fold.cg=open;try{dirty=true;}catch(e){}renderTree();}}});
  if(!open)return;
  C.forEach(el=>{
    const on=sel&&sel.kind==='cg'&&sel.id===el.id;
    const warn=el.st==='warn'?' <span title="'+String(el.msg||'').replace(/"/g,'&quot;')+'" style="color:var(--warn)">⚠</span>':'';
    L.push({lvl:1,cls:'tnode'+(on?' sel':'')+(el.visible===false?' hidden':''),
      html:'<span>'+CG_KINDS[el.kind].ic+'</span><span class="nm">'+cgLabel(el).replace(/</g,'&lt;')+warn+'</span><span class="eye" title="Afficher / masquer">'+(el.visible===false?'🙈':'👁')+'</span>',
      title:'Clic = sélectionner · double-clic = '+((el.kind==='plane'||el.kind==='frame')?'esquisse dessus':'modifier')+' · clic droit = modifier, renommer, supprimer',
      on:{
        eye:()=>{el.visible=!(el.visible!==false);try{dirty=true;}catch(e){}cgDraw();renderTree();},
        click:()=>{
          if(cgTreePick({k:'cg',id:el.id}))return;
          sel={kind:'cg',id:el.id};renderTree();renderProps();cgDraw();
        },
        dbl:()=>{
          if(cgMode)return;
          if(el.kind==='plane'&&typeof newSketchOnCg==='function')newSketchOnCg(el.id,null);
          else if(el.kind==='frame'&&typeof newSketchOnCg==='function')newSketchOnCg(el.id,'XY');
          else cgEdit(el.id);
        },
        ctx:e=>showCtx(e.clientX,e.clientY,{kind:'cg',id:el.id})}});
  });
}
function cgCtxAct(act,t){
  // Actions du menu contextuel de l'arbre pour un élément de construction → true si traité
  if(!t||t.kind!=='cg')return false;
  const el=cgGet(t.id);if(!el)return true;
  if(act==='rename'){const n=prompt('Nouveau nom :',el.name);if(!n)return true;docPushUndo('renommage');el.name=n;markDirty();renderTree();renderProps();return true;}
  if(act==='toggle'){el.visible=!(el.visible!==false);try{dirty=true;}catch(e){}cgDraw();renderTree();return true;}
  if(act==='edit'){cgEdit(el.id);return true;}
  if(act==='del'){cgAskDelete(el.id);return true;}
  return true;
}
