/* ---------- fenêtre dynamique : révolution, perçage, congé (V0.8.0) ----------
   La même logique que l'extrusion dynamique (src/70-extrusion-dynamique.js), pour les autres
   fonctions fréquentes :
     · APERÇU IMMÉDIAT : la fonction naît tout de suite, rejouée par le noyau exact ;
     · POIGNÉE DANS LA VUE + CHAMP FLOTTANT : angle de la révolution (poignée qui tourne autour de
       l'axe), profondeur du perçage (flèche le long de l'axe), rayon / distance du congé ou du
       chanfrein (flèche sur la première arête) ;
     · PANNEAU À ICÔNES (révolution : opération, angles usuels ; perçage : type, fin) ;
     · OK / ANNULER / Échap : Annuler remet le document EXACTEMENT comme à l'ouverture de la fenêtre
       (création : la fonction disparaît) et retire les étapes d'annulation prises entre-temps. */
let fdyn=null; // session : {id, type, snap, len, isNew}
const FDYN_TYPES={revolve:1,hole:1,xfillet:1};
function fdynFeature(){
  if(typeof sel==='undefined'||!sel||sel.kind!=='feature')return null;
  const f=(doc.features||[]).find(x=>x&&x.id===sel.id);
  return f&&FDYN_TYPES[f.type]?f:null;
}
function fdynEnsure(f){
  // session ouverte à la première sélection (modification) ; une création l'ouvre elle-même
  if(!f||!FDYN_TYPES[f.type]){fdyn=null;return null;}
  if(!fdyn||fdyn.id!==f.id)fdyn={id:f.id,type:f.type,isNew:false,snap:docSnap(),len:docUndoStack.length};
  return fdyn;
}
function fdynStart(f,snap,len){ fdyn={id:f.id,type:f.type,isNew:true,snap:snap,len:len}; }
function fdynRename(f){
  try{
    if(f.type==='revolve')f.name=revolveName(f);
    else if(f.type==='hole')f.name=holeName(f);
    else if(f.type==='xfillet')f.name=xFeatName(f);
  }catch(e){}
}
function fdynSet(label,fn){
  const f=fdynFeature();if(!f)return;
  docPushUndo(label||('modification de « '+f.name+' »'));
  fn(f);fdynRename(f);
  try{repSyncForFeature(f);}catch(e){}
  markDirty();rebuild();renderTree();renderProps();
}
function fdynClose(){fdyn=null;fdynHide();}
function fdynOk(){
  const f=fdynFeature();fdynClose();sel={kind:null,id:null};
  try{renderTree();renderProps();}catch(e){}
  try{faceEl.textContent=(f?f.name:'Fonction')+' validée.';}catch(e){}
}
function fdynCancel(){
  const E=fdyn;fdynClose();
  if(E&&(E.isNew||docUndoStack.length>E.len)){
    docApplySnap(E.snap);
    docUndoStack.length=Math.min(docUndoStack.length,E.len);docRedoStack.length=0;
    try{docUndoUI();}catch(e){}
  }
  sel={kind:null,id:null};try{renderTree();renderProps();}catch(e){}
  try{faceEl.textContent=E&&E.isNew?'Création annulée.':'Modifications annulées.';}catch(e){}
}
function fdynFoot(p,f){
  // Annuler / OK de la fenêtre (bas du panneau)
  fdynEnsure(f);
  const b=document.createElement('div');b.className='pnl-btns';b.style.cssText='justify-content:flex-end;gap:6px;margin-top:8px';
  const no=document.createElement('button');no.textContent='Annuler';no.className='fdynCancel';
  no.title=fdyn&&fdyn.isNew?'Retirer cette fonction':'Revenir aux valeurs d’avant';no.onclick=fdynCancel;b.appendChild(no);
  const ok=document.createElement('button');ok.className='primary fdynOk';ok.textContent='OK';ok.onclick=fdynOk;b.appendChild(ok);
  p.appendChild(b);
}
function fdynSec(p,lab,el){
  const w=document.createElement('div');w.style.cssText='margin:6px 0 2px';
  const l=document.createElement('div');l.className='pnl-note';l.style.cssText='margin:0 0 3px;font-weight:600';l.textContent=lab;
  w.appendChild(l);w.appendChild(el);p.appendChild(w);return w;
}
function fdynNumIn(val,onSet,cls,w){
  const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.className=cls||'';i.style.width=(w||80)+'px';
  i.value=String(+(+val).toFixed(3)).replace('.',',');
  const c=()=>{const v=parseFloat(String(i.value).replace(',','.'));if(isFinite(v)&&v>0&&Math.abs(v-(+val))>1e-9)onSet(v);};
  i.addEventListener('change',c);i.addEventListener('keydown',e=>{if(e.key==='Enter'){c();i.blur();}e.stopPropagation();});
  i.addEventListener('click',e=>e.stopPropagation());
  return i;
}
/* ── révolution : création immédiate, panneau ── */
function fdynRevolveNew(skId,axis){
  // « Révolution » : la fonction naît tout de suite si l'axe et le profil sont valables
  const sk=doc.sketches.find(x=>x.id===skId);if(!sk)return null;
  const probe={sketchId:skId,axis:axis,angle:360};
  const ax=revolveAxis2D(sk,probe);if(ax.err)return null;
  const tr=skLoopTrace(sk);
  if(!(tr.solids.length||tr.circlesOut.length))return null;
  if(!revolveSideCheck(sk,tr,ax).ok)return null;
  const snap=docSnap(),len=docUndoStack.length;
  const nf={id:uid('rv'),type:'revolve',name:'',sketchId:skId,axis:axis,angle:360,op:'add',visible:true};
  nf.name=revolveName(nf);
  addFeature(nf);
  if(sk.visible!==false)sk.visible=false;
  sel={kind:'feature',id:nf.id};
  fdynStart(nf,snap,len);
  markDirty();rebuild();renderTree();renderProps();
  try{faceEl.textContent='Révolution : tournez la poignée ou tapez l’angle, puis OK (Échap = annuler).';}catch(e){}
  return nf;
}
function fdynRevolvePanel(p,f){
  fdynEnsure(f);
  if(fdyn&&fdyn.isNew){const n=document.createElement('div');n.className='pnl-note';n.textContent='Aperçu : la pièce montrée EST le résultat. Tournez la poignée ou tapez l’angle.';p.appendChild(n);}
  const pr=document.createElement('div');pr.className='pnl-btns';pr.style.cssText='align-items:center;gap:6px';
  const nm=document.createElement('span');nm.className='pnl-note';nm.textContent='✏️ '+skName(f.sketchId);pr.appendChild(nm);
  const ch=document.createElement('button');ch.className='mini';ch.textContent='🔧 Changer';ch.title='Faire tourner une autre esquisse';ch.onclick=()=>askRevokePanel(f);pr.appendChild(ch);
  fdynSec(p,'Profil',pr);
  fdynSec(p,'Opération',extSeg([['add','➕','Plot','Ajoute de la matière'],['cut','➖','Poche','Retire de la matière']],f.op||'add',
    v=>fdynSet('opération de « '+f.name+' »',g=>{g.op=v;ghostHide=(v==='cut')?g.id:null;})));
  // axe : lignes de l'esquisse + axes système (liste : le nombre de lignes varie)
  const skR=doc.sketches.find(x=>x.id===f.sketchId);
  const lns=(skR&&skR.entities||[]).filter(e=>e.t==='line');
  const s=document.createElement('select');
  lns.map(e=>['L:'+e.id,(e.axis?'⟲ axe ':(e.construction?'constr. ':'ligne '))+e.id]).concat([['S:X','axe X'],['S:Y','axe Y'],['S:Z','axe Z']]).forEach(o=>{
    const op=document.createElement('option');op.value=o[0];op.textContent=o[1];s.appendChild(op);});
  const curv=(f.axis&&f.axis.k==='line')?'L:'+f.axis.id:'S:'+(f.axis?f.axis.d:'X');
  s.value=lns.some(e=>'L:'+e.id===curv)||curv[0]==='S'?curv:'S:X';
  s.onchange=()=>{const v=s.value;fdynSet('axe de « '+f.name+' »',g=>{g.axis=(v[0]==='L')?{k:'line',id:v.slice(2)}:{k:'sys',d:v.slice(2)};});};
  fdynSec(p,'Axe',s);
  // angle : valeurs usuelles en icônes + champ
  const a=revolveAngle(f);
  fdynSec(p,'Angle',extSeg([['90','◔','90°',''],['180','◑','180°',''],['270','◕','270°',''],['360','●','360°','Tour complet']],String(+a),
    v=>fdynSet('angle de « '+f.name+' »',g=>{g.angle=+v;})));
  const w=document.createElement('div');w.className='pnl-btns';w.style.cssText='align-items:center;gap:6px';
  w.appendChild(fdynNumIn(a,v=>fdynSet('angle de « '+f.name+' »',g=>{g.angle=Math.min(360,v);}),'fdynAngle',80));
  const u=document.createElement('span');u.className='pnl-note';u.textContent='°';w.appendChild(u);
  fdynSec(p,'',w);
  if(skR){
    const axR=revolveAxis2D(skR,f),trR=skLoopTrace(skR);let msg='';
    if(axR.err)msg='⚠ '+axR.err;
    else if(!trR.solids.length&&!trR.circlesOut.length)msg='⚠ profil non fermé';
    else{const sd=revolveSideCheck(skR,trR,axR);msg=sd.ok?('✓ axe « '+axR.label+' » — rayon '+sd.rMin.toFixed(1)+' à '+sd.rMax.toFixed(1)+' mm'):('⚠ '+sd.msg);}
    const n=document.createElement('div');n.className='pnl-note';n.textContent=msg;p.appendChild(n);
  }
  fdynFoot(p,f);
}
/* ── poignées dans la vue ── */
function fdynHandle(f){
  // -> {kind:'lin'|'rot', …, val, label, unit, step, min, max, set(v)} ou null
  if(!f||f.visible===false)return null;
  if(f.type==='hole'){
    if(f.end&&f.end!=='blind')return null;
    const sk=doc.sketches.find(s=>s.id===f.sketchId);if(!sk)return null;
    const A=holeAxis(f,sk);if(!A.pts.length)return null;
    const P=A.pts[0];
    return {kind:'lin',C:new THREE.Vector3(P.x,P.y,P.z),n:new THREE.Vector3(A.dir.x,A.dir.y,A.dir.z),val:+f.depth||10,
      label:'Profondeur',unit:'mm',step:1,min:0.5,max:2000,set:(g,v)=>{g.depth=v;}};
  }
  if(f.type==='xfillet'){
    const E=(f.edges||[])[0];if(!E||!E.pos)return null;
    const C=new THREE.Vector3(E.pos[0],E.pos[1],E.pos[2]);
    // sens : de la pièce vers l'arête (vers l'extérieur), repli +Z
    let n=new THREE.Vector3(0,0,1);
    try{const b=(bodies||[]).find(x=>x&&x.mesh&&x.visible!==false);
      if(b){const bb=new THREE.Box3().setFromObject(b.mesh),c=bb.getCenter(new THREE.Vector3());const d=C.clone().sub(c);if(d.lengthSq()>1e-9)n=d.normalize();}}catch(e){}
    return {kind:'lin',C:C,n:n,val:+E.r||1,label:f.chamfer?'Distance':'Rayon',unit:'mm',step:0.1,min:0.05,max:500,
      set:(g,v)=>{(g.edges||[]).forEach(s=>{s.r=v;});}};
  }
  if(f.type==='revolve'){
    const sk=doc.sketches.find(s=>s.id===f.sketchId);if(!sk)return null;
    const ax=revolveAxis2D(sk,f);if(ax.err)return null;
    const A=new THREE.Vector3(ax.P3.x,ax.P3.y,ax.P3.z),d=new THREE.Vector3(ax.D3.x,ax.D3.y,ax.D3.z).normalize();
    // point de référence : le point du profil le plus loin de l'axe
    let R0=null,best=-1;
    (sk.entities||[]).forEach(e=>{if(!e||e.construction)return;[e.p1,e.p2,e.pc].forEach(id=>{const q=sk.points&&sk.points[id];if(!q)return;
      const w=occW(sk,q.x,q.y),v=new THREE.Vector3(w[0],w[1],w[2]),r=v.clone().sub(A),dd=r.clone().addScaledVector(d,-r.dot(d)).length();
      if(dd>best){best=dd;R0=v;}});});
    if(!R0||!(best>1e-6))return null;
    return {kind:'rot',A:A,d:d,R0:R0,val:revolveAngle(f),label:'Angle',unit:'°',step:1,min:1,max:360,set:(g,v)=>{g.angle=v;}};
  }
  return null;
}
let fdynArrow=null,fdynKnob=null,fdynArc=null,fdynLbl=null,fdynDrag=null,fdynWired=false,fdynSwallow=0,fdynPending=false;
function fdynHide(){
  [fdynArrow,fdynKnob,fdynArc].forEach(o=>{if(o)o.visible=false;});
  if(fdynLbl)fdynLbl.style.display='none';
}
function fdynMeshes(){
  if(fdynArrow)return;
  // flèche (profondeur, rayon) : même dessin que celle de l'extrusion
  fdynArrow=extArrowBuild();fdynArrow.name='fdynArrow';
  fdynArrow.traverse(m=>{if(m.userData&&m.userData.extArrow){m.userData.extArrow=false;m.userData.fdyn=true;}});
  // poignée de rotation : boule + arc
  const g=new THREE.Group();g.name='fdynKnob';g.userData.noMirror=true;
  const k=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,12),new THREE.MeshBasicMaterial({color:0x0a84ff,depthTest:false}));k.renderOrder=999;k.userData.fdyn=true;k.userData.noMirror=true;g.add(k);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),new THREE.MeshBasicMaterial({visible:false}));hit.userData.fdyn=true;g.add(hit);
  scene.add(g);fdynKnob=g;
  const arc=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x0a84ff,depthTest:false,transparent:true,opacity:0.85}));
  arc.renderOrder=998;arc.userData.noMirror=true;arc.name='fdynArc';scene.add(arc);fdynArc=arc;
}
function fdynLabelEl(){
  if(fdynLbl)return fdynLbl;
  const w=document.createElement('div');w.className='fdynLbl';
  w.style.cssText='position:fixed;z-index:40;display:none;align-items:center;gap:6px;padding:3px 7px;border-radius:7px;background:var(--panel, #1e1e22);border:1px solid var(--line, #3a3a40);box-shadow:0 2px 10px rgba(0,0,0,.35);font-size:12px;color:var(--fg, #ddd)';
  const l=document.createElement('span');l.className='fdynLblT';w.appendChild(l);
  const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.className='fdynIn';i.style.cssText='width:64px;font-size:12px;padding:1px 4px';
  i.addEventListener('keydown',e=>{e.stopPropagation();
    if(e.key==='Enter'){const f=fdynFeature(),H=fdynHandle(f);const v=parseFloat(String(i.value).replace(',','.').replace(/\s*(mm|°)$/,''));
      if(f&&H&&isFinite(v)&&v>0)fdynSet(H.label.toLowerCase()+' de « '+f.name+' »',g=>H.set(g,Math.min(H.max,Math.max(H.min,v))));i.blur();}
    else if(e.key==='Escape')i.blur();});
  w.appendChild(i);const u=document.createElement('span');u.className='fdynLblU';w.appendChild(u);
  document.body.appendChild(w);fdynLbl=w;return w;
}
function fdynRotPt(H,ang){
  // point de référence tourné de ang degrés autour de l'axe (sens direct autour de d, comme OCCT)
  const r=H.R0.clone().sub(H.A),foot=H.A.clone().addScaledVector(H.d,r.dot(H.d));
  const v=H.R0.clone().sub(foot),k=H.d,a=ang*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  // Rodrigues : v·cos + (k × v)·sin + k (k·v)(1 − cos)
  const kxv=k.clone().cross(v),kv=k.dot(v);
  return foot.clone().addScaledVector(v,c).addScaledVector(kxv,s).addScaledVector(k,kv*(1-c));
}
function fdynTick(){
  if(!fdynWired)fdynWire();
  const f=fdynFeature();
  const busy=(typeof skEdit!=='undefined'&&skEdit)||(typeof asmMode!=='undefined'&&asmMode==='asm')||(typeof filMode!=='undefined'&&filMode)||(typeof filModeX!=='undefined'&&filModeX)||
    (typeof holeFacePick!=='undefined'&&holeFacePick);
  if(!f||busy){if(fdyn&&!f)fdyn=null;fdynHide();return;}
  const H=fdynHandle(f);if(!H){fdynHide();return;}
  fdynMeshes();
  let P,dir;
  if(H.kind==='lin'){
    P=H.C.clone().addScaledVector(H.n,H.val);dir=H.n.clone();
    const L=Math.max(1e-3,camera.position.distanceTo(P)*0.11);
    fdynArrow.position.copy(P);fdynArrow.scale.setScalar(L);
    fdynArrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
    fdynArrow.visible=true;fdynKnob.visible=false;fdynArc.visible=false;
    P=P.clone().addScaledVector(dir,L*0.9);
  }else{
    P=fdynRotPt(H,H.val);
    const L=Math.max(1e-3,camera.position.distanceTo(P)*0.11);
    fdynKnob.position.copy(P);fdynKnob.scale.setScalar(L);fdynKnob.visible=true;fdynArrow.visible=false;
    const pts=[];const n=Math.max(8,Math.ceil(H.val/4));for(let i=0;i<=n;i++)pts.push(fdynRotPt(H,H.val*i/n));
    fdynArc.geometry.dispose();fdynArc.geometry=new THREE.BufferGeometry().setFromPoints(pts);fdynArc.visible=true;
  }
  const w=fdynLabelEl(),inp=w.querySelector('input');
  const T=P.clone().project(camera),r=renderer.domElement.getBoundingClientRect();
  if(T.z>1||T.z<-1){w.style.display='none';return;}
  w.style.display='flex';
  w.querySelector('.fdynLblT').textContent=H.label;w.querySelector('.fdynLblU').textContent=H.unit;
  w.style.left=Math.round(r.left+(T.x+1)/2*r.width+14)+'px';w.style.top=Math.round(r.top+(1-T.y)/2*r.height-14)+'px';
  if(document.activeElement!==inp)inp.value=String(+(+H.val).toFixed(3)).replace('.',',');
}
function fdynRayPlane(e,P0,n){
  const r=renderer.domElement.getBoundingClientRect();
  rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
  const o=rayc.ray.origin,d=rayc.ray.direction,den=d.dot(n);if(Math.abs(den)<1e-6)return null;
  const t=P0.clone().sub(o).dot(n)/den;if(!(t>0))return null;
  return o.clone().addScaledVector(d,t);
}
function fdynDragApply(e){
  const f=fdynFeature(),H=fdynHandle(f);if(!f||!H||!fdynDrag)return;
  let v;
  if(H.kind==='lin'){const t=extRayAxis(e,H.C,H.n);if(t==null)return;v=t;}
  else{
    const r=H.R0.clone().sub(H.A),foot=H.A.clone().addScaledVector(H.d,r.dot(H.d));
    const hit=fdynRayPlane(e,foot,H.d);if(!hit)return;
    const u0=H.R0.clone().sub(foot).normalize(),h=hit.sub(foot);if(h.lengthSq()<1e-12)return;h.normalize();
    v=Math.atan2(u0.clone().cross(h).dot(H.d),u0.dot(h))*180/Math.PI;if(v<=0)v+=360;
  }
  const st=e.shiftKey?H.step/10:H.step;
  v=Math.round(v/st)*st;v=Math.min(H.max,Math.max(H.min,v));
  if(Math.abs(v-H.val)<1e-9)return;
  if(!fdynDrag.pushed){docPushUndo(H.label.toLowerCase()+' de « '+f.name+' »');fdynDrag.pushed=true;}
  H.set(f,v);fdynRename(f);
  if(!fdynPending){fdynPending=true;requestAnimationFrame(()=>{fdynPending=false;try{markDirty();rebuild();}catch(err){}});}
}
function fdynWire(){
  if(typeof renderer==='undefined'||!renderer||!renderer.domElement)return;
  fdynWired=true;const el=renderer.domElement;
  el.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const on=(fdynArrow&&fdynArrow.visible)||(fdynKnob&&fdynKnob.visible);if(!on)return;
    const f=fdynFeature();if(!f)return;
    const r=el.getBoundingClientRect();
    rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
    const ms=[];[fdynArrow,fdynKnob].forEach(g=>{if(g&&g.visible){g.updateMatrixWorld(true);g.traverse(m=>{if(m.isMesh&&m.userData.fdyn)ms.push(m);});}});
    if(!rayc.intersectObjects(ms,false).length)return;
    e.stopImmediatePropagation();e.preventDefault();
    fdynDrag={pushed:false,id:e.pointerId};
    try{el.setPointerCapture(e.pointerId);}catch(err){}
    try{el.style.cursor='grabbing';}catch(err){}
  },true);
  el.addEventListener('pointermove',e=>{if(!fdynDrag)return;e.stopImmediatePropagation();fdynDragApply(e);},true);
  el.addEventListener('pointerup',e=>{
    if(!fdynDrag)return;e.stopImmediatePropagation();
    const D=fdynDrag;fdynDrag=null;fdynSwallow=Date.now();
    try{el.releasePointerCapture(D.id);}catch(err){}
    try{el.style.cursor='';}catch(err){}
    if(D.pushed){try{const f=fdynFeature();if(f)repSyncForFeature(f);}catch(err){}markDirty();rebuild();renderTree();renderProps();}
  },true);
  el.addEventListener('click',e=>{if(Date.now()-fdynSwallow<350){e.stopImmediatePropagation();e.preventDefault();}},true);
}
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!fdyn||!fdynFeature())return;
  if((typeof filModeX!=='undefined'&&filModeX)||(typeof holeFacePick!=='undefined'&&holeFacePick))return;
  const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'))return;
  e.stopImmediatePropagation();e.preventDefault();fdynCancel();
},true);
