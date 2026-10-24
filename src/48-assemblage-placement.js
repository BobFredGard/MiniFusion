/* ---------- composants : placement des occurrences (V0.6.0 → V0.6.1) ----------
   Trois façons de placer une occurrence (enfant direct du composant actif, mode Placer) :
     · manipulateur 3D (occurrence libre sélectionnée) : flèches = translation le long des
       axes du composant actif, anneaux = rotation autour d'eux, pivot = origine de
       l'occurrence ; pas de 1 mm et de 5° (Maj = libre) ; un geste = une étape d'annulation ;
     · panneau : position X/Y/Z, rotations de ±90° / angle saisi autour de X, Y, Z ;
     · ALIGNER : un repère du composant (son origine ou un repère de construction, le sien ou
       celui d'un sous-composant) posé sur un repère cible (géométrie de base du composant
       actif, ou repère d'un autre de ses composants, à toute profondeur), avec
       retournement, rotation et décalage — associatif (46 : asmResolve).
   Une occurrence fixée ou alignée n'a pas de manipulateur (sa position est imposée). */
let asmGz=null;       // groupe du manipulateur (dans asmScene)
let asmDrag=null;     // geste en cours {kind:'move'|'rot', ax, o0, fr0, t0|p0, occ}
let asmAlign=null;    // commande Aligner en cours {occ, step:'src'|'dst', src, dst, flip, rz, off, saved}
const ASM_AX=[[1,0,0],[0,1,0],[0,0,1]],ASM_AX_COL=[0xff453a,0x30d158,0x0a84ff];
function asmMovable(o){return !!o&&!o.fixed&&!o.align;}
/* ── manipulateur ── */
function asmGizmoDraw(){
  // (Re)dessine le manipulateur sur l'occurrence sélectionnée libre ; taille constante à
  // l'écran (rangé dans TRIADS, comme les repères : triadUpdateAll le met à l'échelle)
  const S=asmSceneGet();
  if(asmGz){S.remove(asmGz);const i=TRIADS.indexOf(asmGz);if(i>=0)TRIADS.splice(i,1);asmGz.traverse(m=>{try{if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();}catch(e){}});asmGz=null;}
  const o=asmOcc(asmSelId);
  if(asmMode!=='asm'||!asmMovable(o)||asmAlign)return;
  const g=new THREE.Group();g.name='asmGizmo';g.userData.px=110;
  const mat=c=>new THREE.MeshBasicMaterial({color:c,depthTest:false,transparent:true,opacity:0.95});
  ASM_AX.forEach((a,i)=>{
    const d=new THREE.Vector3(a[0],a[1],a[2]),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d);
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.8,8),mat(ASM_AX_COL[i]));sh.quaternion.copy(q);sh.position.copy(d.clone().multiplyScalar(0.4));
    const tp=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.2,14),mat(ASM_AX_COL[i]));tp.quaternion.copy(q);tp.position.copy(d.clone().multiplyScalar(0.9));
    // poignée de saisie (invisible, plus large que la flèche)
    const hd=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.0,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
    hd.quaternion.copy(q);hd.position.copy(d.clone().multiplyScalar(0.55));hd.userData.gz={kind:'move',ax:i};
    [sh,tp].forEach(m=>{m.renderOrder=999;m.raycast=()=>{};});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.012,8,64),mat(ASM_AX_COL[i]));
    ring.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),d));ring.renderOrder=999;ring.raycast=()=>{};
    const rh=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.06,6,48),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
    rh.quaternion.copy(ring.quaternion);rh.userData.gz={kind:'rot',ax:i};
    g.add(sh,tp,hd,ring,rh);
  });
  g.position.set(o.fr.o[0],o.fr.o[1],o.fr.o[2]);
  S.add(g);TRIADS.push(g);asmGz=g;
}
function asmRay(e){
  const r=renderer.domElement.getBoundingClientRect();
  rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
  return rayc.ray;
}
function asmAxisParam(ray,O,a){
  // Paramètre t du point de l'axe (O + t·a) le plus proche du rayon souris
  const w=new THREE.Vector3().subVectors(ray.origin,O),b=a.dot(ray.direction),d=a.dot(w),e=ray.direction.dot(w);
  const den=1-b*b;if(Math.abs(den)<1e-9)return null;
  return (d-b*e)/den;
}
function asmPlaneHit(ray,O,a){
  const den=a.dot(ray.direction);if(Math.abs(den)<1e-9)return null;
  const t=a.dot(new THREE.Vector3().subVectors(O,ray.origin))/den;
  return ray.origin.clone().addScaledVector(ray.direction,t);
}
function asmRotFr(F,O,a,ang){
  // Rotation rigide de l'occurrence autour de la droite (O, a)
  const rot=v=>cgRotDir(v,a,ang);
  return asmRound({o:cgRot(F.o,O,a,ang),x:rot(F.x),y:rot(F.y),z:rot(F.z)});
}
function asmGizmoDown(e){
  // Capture (document) : avant OrbitControls — un clic sur le manipulateur ne fait pas tourner la vue
  if(asmMode!=='asm'||!asmGz||e.button!==0||!renderer||e.target!==renderer.domElement)return;
  const o=asmOcc(asmSelId);if(!asmMovable(o))return;
  const ray=asmRay(e);rayc.ray.copy(ray);
  asmGz.updateMatrixWorld(true);
  const hs=[];asmGz.traverse(m=>{if(m.isMesh&&m.userData.gz)hs.push(m);});
  const h=rayc.intersectObjects(hs,false)[0];if(!h)return;
  e.preventDefault();e.stopPropagation();
  const gz=h.object.userData.gz,O=new THREE.Vector3(o.fr.o[0],o.fr.o[1],o.fr.o[2]),a=new THREE.Vector3(...ASM_AX[gz.ax]);
  asmDrag={kind:gz.kind,ax:gz.ax,occ:o.id,fr0:JSON.parse(JSON.stringify(o.fr)),O,a,moved:false};
  if(gz.kind==='move')asmDrag.t0=asmAxisParam(ray,O,a);
  else{const p=asmPlaneHit(ray,O,a);asmDrag.p0=p?p.sub(O):null;}
  asmPush(gz.kind==='move'?'déplacer « '+o.name+' »':'tourner « '+o.name+' »');
  try{controls.enabled=false;}catch(err){}
  window.addEventListener('pointermove',asmGizmoMove,true);
  window.addEventListener('pointerup',asmGizmoUp,true);
}
function asmGizmoMove(e){
  const D=asmDrag;if(!D)return;
  const o=asmOcc(D.occ);if(!o)return;
  const ray=asmRay(e),free=e.shiftKey;
  if(D.kind==='move'){
    const t=asmAxisParam(ray,D.O,D.a);if(t==null||D.t0==null)return;
    let d=t-D.t0;if(!free)d=Math.round(d);
    o.fr=asmRound({o:[D.fr0.o[0]+D.a.x*d,D.fr0.o[1]+D.a.y*d,D.fr0.o[2]+D.a.z*d],x:D.fr0.x,y:D.fr0.y,z:D.fr0.z});
    try{faceEl.textContent=o.name+' : '+'XYZ'[D.ax]+' '+(d>=0?'+':'')+d.toFixed(free?2:0).replace('.',',')+' mm (Maj = libre)';}catch(err){}
  }else{
    const p=asmPlaneHit(ray,D.O,D.a);if(!p||!D.p0)return;
    const v=p.sub(D.O);
    let ang=Math.atan2(D.a.dot(new THREE.Vector3().crossVectors(D.p0,v)),D.p0.dot(v));
    const deg=ang*180/Math.PI;const sd=free?deg:Math.round(deg/5)*5;ang=sd*Math.PI/180;
    o.fr=asmRotFr(D.fr0,D.fr0.o,[D.a.x,D.a.y,D.a.z],ang);
    try{faceEl.textContent=o.name+' : rotation '+'XYZ'[D.ax]+' '+sd.toFixed(free?1:0).replace('.',',')+'° (Maj = libre)';}catch(err){}
  }
  D.moved=true;
  asmResolve();asmDraw();asmGizmoDraw();
}
function asmGizmoUp(){
  window.removeEventListener('pointermove',asmGizmoMove,true);
  window.removeEventListener('pointerup',asmGizmoUp,true);
  try{controls.enabled=true;}catch(e){}
  const D=asmDrag;asmDrag=null;
  if(!D)return;
  // simple clic, ou geste revenu au point de départ : pas d'étape d'annulation
  const o=asmOcc(D.occ);
  if(!D.moved||(o&&JSON.stringify(o.fr)===JSON.stringify(D.fr0))){asmUndoStack.pop();try{asmDraw();}catch(e){}return;}
  asmNotify();
}
try{document.addEventListener('pointerdown',asmGizmoDown,true);}catch(e){} // tests VM : document simplifié
/* ── panneau de placement ── */
function asmPlacementProps(p,o){
  // Section « Placement » du panneau d'occurrence (appelée par asmRenderProps, 47)
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const Row=(lab,ctl)=>{const r=mk('div','pnl-row');r.appendChild(mk('label',null,lab));if(ctl)r.appendChild(ctl);p.appendChild(r);return r;};
  const num=(v,fn,w)=>{const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.style.width=(w||64)+'px';i.value=String(+(+v).toFixed(3)).replace('.',',');
    const go=()=>{const x=parseFloat(String(i.value).replace(',','.'));if(isFinite(x))fn(x);};i.addEventListener('change',go);i.addEventListener('keydown',e=>{if(e.key==='Enter')go();});return i;};
  p.appendChild(mk('div','pnl-h','Placement'));
  if(o.align){
    const a=o.align,owner=asmOccOwner(o.id);
    p.appendChild(mk('div','pnl-note','🔗 '+asmRelName(o.comp,a.src)+' → '+asmRelName(owner&&owner.id,a.dst)));
    const c=document.createElement('input');c.type='checkbox';c.checked=!!a.flip;
    c.onchange=()=>{asmPush('alignement');a.flip=c.checked;asmResolve();asmNotify();};Row('Retourner',c);
    Row('Rotation (°)',num(a.rz||0,v=>{asmPush('alignement');a.rz=v;asmResolve();asmNotify();}));
    ['X','Y','Z'].forEach((k,i)=>Row('Décalage '+k+' (mm)',num((a.off||[0,0,0])[i]||0,v=>{asmPush('alignement');a.off=(a.off||[0,0,0]).slice();a.off[i]=v;asmResolve();asmNotify();})));
    const b=mk('div','pnl-btns');
    const rm=mk('button',null,'Supprimer l’alignement');rm.title='L’occurrence garde sa position actuelle et redevient libre';
    rm.onclick=()=>{asmPush('supprimer l’alignement');o.align=null;asmNotify();};b.appendChild(rm);p.appendChild(b);
    return;
  }
  if(o.fixed){p.appendChild(mk('div','pnl-note','📌 Fixée : libérez-la pour la déplacer.'));}
  else{
    ['X','Y','Z'].forEach((k,i)=>Row('Position '+k+' (mm)',num(o.fr.o[i],v=>{asmPush('position');o.fr=asmRound(Object.assign({},o.fr,{o:o.fr.o.map((q,j)=>j===i?v:q)}));asmNotify();})));
    const rw=mk('div','pnl-btns');
    ['X','Y','Z'].forEach((k,i)=>{[-90,90].forEach(s=>{const b=mk('button','mini',(s>0?'+':'−')+'90° '+k);
      b.title='Tourner l’occurrence autour de l’axe '+k+' de l’assemblage, passant par son origine';
      b.onclick=()=>{asmPush('rotation');o.fr=asmRotFr(o.fr,o.fr.o,ASM_AX[i],s*Math.PI/180);asmNotify();};rw.appendChild(b);});});
    p.appendChild(rw);
    p.appendChild(mk('div','pnl-note','Manipulateur : flèches = déplacer, anneaux = tourner (pas 1 mm / 5°, Maj = libre).'));
  }
  const b=mk('div','pnl-btns');const al=mk('button','primary','🔗 Aligner un repère…');al.onclick=()=>asmAlignStart(o.id);b.appendChild(al);p.appendChild(b);
}
/* ── Aligner ──
   Repères candidats, en coordonnées du composant actif (le porteur) :
     · à poser : origine et repères de construction du composant de l'occurrence ET de ses
       sous-composants (chemin relatif à ce composant) ;
     · cible : ceux du porteur lui-même (sa géométrie de base) et de ses autres descendants
       (chemin relatif au porteur). */
function asmRelKey(r){return r?(r.path||[]).join('/')+'|'+(r.cg||''):'';}
function asmRelName(cid,r){
  // « Châssis:1 › Roue:2 › Repère A » ; chemin vide = le composant cid lui-même
  if(!r)return '?';
  let c=asmComp(cid);const parts=[];
  for(const id of (r.path||[])){const o=c&&c.occ.find(q=>q.id===id);if(!o)return '?';parts.push(o.name);c=asmComp(o.comp);}
  if(!c)return '?';
  const fn=r.cg?((c.doc.cgeo||[]).find(k=>k.id===r.cg)||{}).name||'?':(r.path&&r.path.length?'Origine':'Origine de « '+c.name+' »');
  return parts.concat(fn).join(' › ');
}
function asmFramesUnder(cid,skip){
  // Repères de cid et de son sous-arbre : [{rel:{path,cg}, name, F (repère de cid)}] ;
  // skip : occurrence enfant directe dont le sous-arbre est exclu
  const out=[];
  asmInstances(cid).forEach(inst=>{
    if(skip&&inst.path[0]===skip)return;
    const c=asmComp(inst.comp);if(!c)return;
    const one=(cg,F)=>out.push({rel:{path:inst.path,cg},name:asmRelName(cid,{path:inst.path,cg}),F:asmCompose(inst.F,F)});
    one(null,asmFr0());
    (c.doc.cgeo||[]).forEach(k=>{if(k&&k.kind==='frame'&&k.fr)one(k.id,asmCompFrame(c.id,k.id));});
  });
  return out;
}
function asmFramesOf(occ){return asmFramesUnder(occ.comp,null);} // à poser (repère du composant de l'occurrence)
function asmAlignStart(id){
  const o=asmOcc(id);if(!o)return;
  if(o.fixed){try{faceEl.textContent='Occurrence fixée : libérez-la pour l’aligner.';}catch(e){}return;}
  asmAlign={occ:o.id,step:'src',src:undefined,dst:undefined,flip:false,rz:0,off:[0,0,0],saved:JSON.parse(JSON.stringify({fr:o.fr,align:o.align}))};
  asmAlignRefresh();
  try{faceEl.textContent='Aligner « '+o.name+' » : choisissez le repère du composant à poser (panneau ou clic sur un repère).';}catch(e){}
}
function asmAlignPreview(){
  const A=asmAlign,o=A&&asmOcc(A.occ);if(!o)return;
  if(A.src!==undefined&&A.dst!==undefined){o.align={src:A.src,dst:A.dst,flip:A.flip,rz:A.rz,off:A.off.slice()};asmResolve();}
  else{o.fr=A.saved.fr;o.align=A.saved.align;asmResolve();}
}
function asmAlignRefresh(){
  asmAlignPreview();
  try{asmDraw();asmAlignMarks();asmGizmoDraw();renderTree();renderProps();}catch(e){}
}
function asmAlignMarks(){
  // Triades des repères candidats (à poser : ceux de l'occurrence ; cible : les autres)
  const S=asmSceneGet();let G=S.getObjectByName('asmAlignMarks');
  if(G){S.remove(G);G.children.slice().forEach(t=>{const i=TRIADS.indexOf(t);if(i>=0)TRIADS.splice(i,1);});}
  if(!asmAlign)return;
  G=new THREE.Group();G.name='asmAlignMarks';S.add(G);
  const A=asmAlign,me=asmOcc(A.occ);
  const put=(Fw,key,on)=>{const t=triadMake({name:'am_'+key,px:on?78:54,planes:false,renderOrder:992});
    t.position.set(Fw.o[0],Fw.o[1],Fw.o[2]);
    t.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...Fw.x),new THREE.Vector3(...Fw.y),new THREE.Vector3(...Fw.z)));
    const s=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
    s.userData.am=key;t.add(s);G.add(t);};
  A.keys={};
  if(A.step==='src'){asmFramesOf(me).forEach((f,i)=>{const k='s'+i;A.keys[k]=f.rel;put(asmCompose(me.fr,f.F),k,asmRelKey(A.src)===asmRelKey(f.rel));});}
  else{asmFramesUnder(asm.active,me.id).forEach((f,i)=>{const k='d'+i;A.keys[k]=f.rel;put(f.F,k,asmRelKey(A.dst)===asmRelKey(f.rel));});}
}
function asmAlignPickAt(e){
  // Clic dans la vue pendant Aligner : repère candidat le plus proche → true si consommé
  if(!asmAlign)return false;
  const S=asmSceneGet(),G=S.getObjectByName('asmAlignMarks');if(!G)return true;
  rayc.ray.copy(asmRay(e));G.updateMatrixWorld(true);
  const ms=[];G.traverse(m=>{if(m.isMesh&&m.userData.am)ms.push(m);});
  const h=rayc.intersectObjects(ms,false)[0];
  if(!h){try{faceEl.textContent='Cliquez une triade (repère), ou choisissez dans le panneau.';}catch(err){}return true;}
  const k=h.object.userData.am,rel=asmAlign.keys&&asmAlign.keys[k];if(!rel)return true;
  if(k[0]==='s')asmAlignSetSrc(rel);else asmAlignSetDst(rel);
  return true;
}
function asmAlignSetSrc(rel){if(!asmAlign)return;asmAlign.src={path:rel.path.slice(),cg:rel.cg};asmAlign.step='dst';asmAlignRefresh();
  try{faceEl.textContent='Aligner : choisissez maintenant le repère cible (géométrie du composant actif, ou repère d’un autre composant).';}catch(e){}}
function asmAlignSetDst(rel){if(!asmAlign)return;asmAlign.dst={path:rel.path.slice(),cg:rel.cg};asmAlignRefresh();
  try{faceEl.textContent='Aligner : réglez retourner / rotation / décalage puis ✓.';}catch(e){}}
function asmAlignCommit(){
  const A=asmAlign,o=A&&asmOcc(A.occ);if(!o)return;
  if(A.src===undefined||A.dst===undefined){try{faceEl.textContent='Aligner : choisissez les deux repères.';}catch(e){}return;}
  // l'étape d'annulation part de l'état d'AVANT l'aperçu
  const now={fr:o.fr,align:o.align};o.fr=A.saved.fr;o.align=A.saved.align;
  asmPush('aligner « '+o.name+' »');
  o.fr=now.fr;o.align=now.align;
  asmAlign=null;asmAlignMarks();asmResolve();asmNotify();asmGizmoDraw();
  try{faceEl.textContent=o.name+' alignée'+(o.st==='warn'?' — ⚠ '+o.msg:'')+'. Elle suivra les repères si les composants changent.';}catch(e){}
}
function asmAlignCancel(){
  const A=asmAlign,o=A&&asmOcc(A.occ);asmAlign=null;
  if(o){o.fr=A.saved.fr;o.align=A.saved.align;asmResolve();}
  asmAlignMarks();try{asmDraw();asmGizmoDraw();renderTree();renderProps();}catch(e){}
}
function asmAlignProps(p){
  // Panneau de la commande Aligner (remplace celui de l'occurrence pendant la commande)
  const A=asmAlign,o=asmOcc(A.occ),me=o;
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const Row=(lab,ctl)=>{const r=mk('div','pnl-row');r.appendChild(mk('label',null,lab));if(ctl)r.appendChild(ctl);p.appendChild(r);return r;};
  const num=(v,fn)=>{const i=document.createElement('input');i.type='text';i.inputMode='decimal';i.style.width='64px';i.value=String(+(+v).toFixed(3)).replace('.',',');
    const go=()=>{const x=parseFloat(String(i.value).replace(',','.'));if(isFinite(x)){fn(x);asmAlignRefresh();}};i.addEventListener('change',go);i.addEventListener('keydown',e=>{if(e.key==='Enter')go();});return i;};
  const choice=(lab,on,fn)=>{const b=mk('button','mini',lab);if(on)b.style.outline='2px solid var(--accent, #0a84ff)';b.onclick=fn;return b;};
  p.appendChild(mk('div','pnl-h','🔗 Aligner « '+o.name+' »'));
  p.appendChild(mk('div','pnl-note','1. Repère du composant à poser'));
  const r1=mk('div','pnl-btns');asmFramesOf(me).forEach(f=>r1.appendChild(choice(f.name,A.src!==undefined&&asmRelKey(A.src)===asmRelKey(f.rel),()=>asmAlignSetSrc(f.rel))));p.appendChild(r1);
  if(A.src!==undefined){
    p.appendChild(mk('div','pnl-note','2. Repère cible'));
    const r2=mk('div','pnl-btns');
    asmFramesUnder(asm.active,me.id).forEach(f=>r2.appendChild(choice(f.name,A.dst!==undefined&&asmRelKey(A.dst)===asmRelKey(f.rel),()=>asmAlignSetDst(f.rel))));
    p.appendChild(r2);
  }
  if(A.dst!==undefined){
    const c=document.createElement('input');c.type='checkbox';c.checked=A.flip;c.onchange=()=>{A.flip=c.checked;asmAlignRefresh();};Row('Retourner (Z opposés)',c);
    Row('Rotation autour de Z (°)',num(A.rz,v=>{A.rz=v;}));
    ['X','Y','Z'].forEach((k,i)=>Row('Décalage '+k+' (mm)',num(A.off[i],v=>{A.off[i]=v;})));
    if(o.st==='warn')p.appendChild(mk('div','pnl-note','⚠ '+o.msg));
  }
  const b=mk('div','pnl-btns');
  const ok=mk('button','primary','✓ Valider');ok.onclick=asmAlignCommit;b.appendChild(ok);
  const no=mk('button',null,'Annuler');no.onclick=asmAlignCancel;b.appendChild(no);p.appendChild(b);
}
function asmTreePick(path){
  // Clic sur une instance dans l'arbre pendant Aligner (étape cible) : son origine → true.
  // path absolu ; seules les instances du sous-arbre actif, hors l'occurrence placée, conviennent.
  if(!asmAlign||asmAlign.step!=='dst')return false;
  const P=asm.path,n=P.length;
  if(path.length<=n||!P.every((q,i)=>path[i]===q))return true;
  const rel=path.slice(n);if(rel[0]===asmAlign.occ)return true;
  asmAlignSetDst({path:rel,cg:null});return true;
}
