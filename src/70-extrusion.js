/* ---------- extrusion ---------- */
function askExtrude(presetSketchId,editF){
// Création : on propose l'opération (Plot / Poche) et la distance AVANT de créer la fonction,
// pour ne pas être obligé de créer un plot de 20 mm puis de le transformer en poche dans les
// propriétés. « Changer d'esquisse » (editF) reste un simple changement d'esquisse : la
// fonction existe déjà, on ne lui redemande rien.
if(!doc.sketches.length){alert('Créez d\'abord une esquisse.');return;}
// Sans esquisse préselectionnée, on extrude la dernière esquisse RÉELLE : les esquisses
// d'instances de répétition (« … (rép i) ») sont des clones générés, jamais la source.
const lastRealSketch=()=>{
  for(let i=doc.sketches.length-1;i>=0;i--){if(!repCloneSkName(doc.sketches[i]))return doc.sketches[i].id;}
  return doc.sketches.length?doc.sketches[doc.sketches.length-1].id:null;
};
const skId=presetSketchId||(editF?editF.sketchId:lastRealSketch());
const hideSketch=(sid)=>{const s=doc.sketches.find(x=>x.id===sid);if(s&&s.visible!==false){s.visible=false;}};
if(editF){
  const old=editF.sketchId;
  editF.sketchId=skId;editF.name=extName(editF);
  if(skId!==old)hideSketch(skId);
  repSyncForFeature(editF);
  sel={kind:'feature',id:editF.id};
  markDirty();rebuild();renderProps();
  return;
}
// V0.7.6 : extrusion DYNAMIQUE — la fonction naît tout de suite (aperçu = résultat), flèche et
// fenêtre à icônes ; OK / Annuler (70-extrusion-dynamique). Le formulaire extNew reste pour les scripts.
extDynNew(skId);
}
let extNew=null; // extrusion en cours de création (formulaire du panneau)
function renderNewExtrude(){
  if(!extNew)return;
  const p=$('props');p.innerHTML='';
  // (note()/info() sont locales à renderProps : on construit les éléments ici)
  const h=document.createElement('div');h.className='pnl-h';
  h.innerHTML=`🧱 Nouvelle extrusion — Esquisse : ${skName(extNew.sketchId)}`;
  p.appendChild(h);
  // ── Opération : la liste déroulante demandée (Plot ou Poche) ──
  const r1=document.createElement('div');r1.className='pnl-row';
  const l1=document.createElement('label');l1.textContent='Opération';r1.appendChild(l1);
  const s1=document.createElement('select');
  s1.innerHTML='<option value="add">➕ Plot — ajoute de la matière (bossage)</option><option value="cut">➖ Poche — retire de la matière</option><option value="new">◧ Nouveau corps — solide séparé</option>';
  s1.value=extNew.op;
  s1.title='Le signe de la distance découle de ce choix : le champ reste toujours positif.';
  s1.onchange=()=>{extNew.op=s1.value;renderNewExtrude();};
  r1.appendChild(s1);p.appendChild(r1);
  // ── Distance ──
  const r2=document.createElement('div');r2.className='pnl-row';
  const l2=document.createElement('label');l2.textContent=(extNew.op==='cut'?'Profondeur de la poche':'Hauteur du plot')+' (mm)';r2.appendChild(l2);
  const i2=document.createElement('input');i2.type='text';i2.inputMode='decimal';i2.value=extNew.dist;parFx(i2,extNew,'dist');
  i2.addEventListener('change',()=>{const v=parseFloat(String(i2.value).replace(',','.'));if(isFinite(v)&&v!==0)extNew.dist=Math.abs(v);});
  i2.addEventListener('keydown',e=>{if(e.key==='Enter'){extNewOk();e.stopPropagation();}e.stopPropagation();});
  i2.addEventListener('click',e=>e.stopPropagation());
  r2.appendChild(i2);p.appendChild(r2);
  const nt=document.createElement('span');nt.className='note';
  nt.textContent='Étendue « Jusqu\'à la face » / « À travers tout » : réglable dans les propriétés de la fonction.';
  p.appendChild(nt);
  const row=document.createElement('div');row.className='pnl-btns';row.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Créer';ok.onclick=extNewOk;row.appendChild(ok);
  const no=document.createElement('button');no.textContent='✖ Annuler';no.onclick=extNewCancel;row.appendChild(no);
  p.appendChild(row);
}
function extNewOk(){
  if(!extNew)return;
  const op0=extNew.op,op=op0==='new'?'add':op0;
  const nf={id:uid('ex'),type:'extrude',name:'',sketchId:extNew.sketchId,
    distance:Math.abs(+extNew.dist||20)*(op==='cut'?-1:1),op:op,visible:true,mid:false,upto:null};
  parFxCopy(extNew,nf,{dist:'distance'});
  if(op0==='new'){nf.body=extNewBody();nf.newBody=true;} // 2026-10-16-009 : NOUVEAU CORPS (solide séparé)
  nf.name=extName(nf);
  addFeature(nf);
  const s=doc.sketches.find(x=>x.id===extNew.sketchId);if(s)s.visible=false;
  const id=nf.id;
  extNew=null;
  ghostHide=(op==='cut')?id:null; // outil caché après l'opération
  sel={kind:'feature',id:id};
  markDirty();rebuild();renderProps();
}
function extNewBody(){
  // crée l'entrée d'un nouveau corps (le corps actif reste inchangé)
  try{ensureBodies();}catch(e){}
  const n=doc.bodySeq++;const e={id:'b'+n,name:'Corps '+n,c:null};doc.bodies.push(e);return e.id;
}
function extNewCancel(){extNew=null;sel={kind:null,id:null};renderProps();}
function extName(f){
  // Nom d'affichage : distance signée, symétrique (±) ou « vers un objet » (cible).
  // ⇄ = sens inversé (miroir de la course, opération inchangée) ; ∠ = dépouille.
  if(!f)return'Extrusion';
  const base=(f.op==='cut'?'Découpe ':'Extrusion ')+skName(f.sketchId);
  const suf=(f.flip?' ⇄':'')+((+f.draft||0)?' ∠'+(+f.draft)+'°':'');
  if(f.upto&&f.upto.ex){
    // face cliquée : « → face » (dans un corps fusionné, la fonction cible ne dit pas QUELLE face)
    if(f.upto.faceProps)return base+' → face'+suf;
    const t=doc.features.find(x=>x.id===f.upto.ex);return base+' → '+(t?t.name:'cible supprimée')+suf;
  }
  const d=+f.distance||0;
  if(f.mid)return base+' ±'+(Math.abs(d)/2)+'mm'+suf;
  return base+' '+d+'mm'+suf;
}
function resolveExtrudeUpto(f){
  // « Vers un objet » : l'extrusion s'arrête sur la FACE CLICKEE (triangle fi stocké).
  // Si le maillage a changé, fallback sur matching géométrique (faceProps) puis alignement.
  if(!f||f.type!=='extrude'||!f.upto)return false;
  const tgt=doc.features.find(x=>x.id===f.upto.ex);
  const fi=doc.features.indexOf(f),ti=tgt?doc.features.indexOf(tgt):-1;
  if(ti<0||fi<0||ti>=fi){f.upto=null;f.name=extName(f);return false;}
  const sk=doc.sketches.find(s=>s.id===f.sketchId);
  if(!sk)return false;
  let B;try{B=sketchBasis(sk);}catch(e){return false;}
  // Corps cible : d'abord celui EFFECTIVEMENT cliqué (faceId.bid) — indispensable en mode
  // OCCT où le corps combiné s'appelle 'occ_result' (ref:null) et jamais l'id de la fonction ;
  // puis repli sur l'id/ref de la fonction additive (mode maillage). On exclut les fantômes
  // (outils de découpe) : la cible est un VOLUME.
  let tgtBody=bodies.find(b=>f.upto.faceId&&b.id===f.upto.faceId.bid&&b.mesh&&!b.ghost);
  if(!tgtBody)tgtBody=bodies.find(b=>(b.ref===f.upto.ex||b.id===f.upto.ex)&&b.mesh&&!b.ghost);
  if(!tgtBody||!tgtBody.mesh)return false;
  const mesh=tgtBody.mesh;
  const g=mesh.geometry;
  const pos=g.attributes.position;
  if(!pos)return false;
  mesh.updateMatrixWorld();
  // Direction de coupe le long de l'axe source
  const dir=(f.upto.side!==undefined&&f.upto.side!==0)?(f.upto.side>0?1:-1):(f.distance>=0?1:-1);
  const cutDir={x:B.n.x*dir,y:B.n.y*dir,z:B.n.z*dir};
  // 1) Priorité absolue : utiliser le triangle cliqué (faceId.fi) s'il est valide
  let bestFn=null,bestFi=-1,bestP=null;
  const faceCount=g.index?Math.floor(g.index.count/3):Math.floor(pos.count/3);
  const storedFi=f.upto.faceId?.fi;
  if(typeof storedFi==='number' && storedFi>=0 && storedFi<faceCount){
    const n=faceNormalWorld(mesh,storedFi);
    if(n){
      // N'accepte le triangle mémorisé que s'il est sur le MÊME PLAN que la face cliquée
      // (normale alignée) : une retessellation (OCCT) peut décaler les indices de triangles
      // et pointer sur une AUTRE face → distance inversée / sens de l'option distance.
      const fp=f.upto.faceProps;
      const samePlane=(!fp||!fp.normal)||Math.abs(fp.normal.x*n.x+fp.normal.y*n.y+fp.normal.z*n.z)>0.999;
      if(samePlane){
        bestFn=n;bestFi=storedFi;
        if(g.index){const idx=g.index.getX(storedFi*3);bestP=[pos.getX(idx),pos.getY(idx),pos.getZ(idx)];}
        else{const idx=storedFi*3;bestP=[pos.getX(idx),pos.getY(idx),pos.getZ(idx)];}
      }
    }
  }
  // 2) Fallback : matching géométrique (faceProps : centre, normale, aire)
  if(!bestFn && f.upto.faceProps?.center){
    let bestScore=-1;
    for(let i=0;i<faceCount;i++){
      const n=faceNormalWorld(mesh,i);
      if(!n)continue;
      const props=getFaceProps(mesh,i);
      if(!props)continue;
      const dCenter=f.upto.faceProps.center.distanceTo(props.center);
      const dotNormal=f.upto.faceProps.normal.dot(props.normal);
      const areaRatio=Math.min(f.upto.faceProps.area,props.area)/Math.max(f.upto.faceProps.area,props.area);
      const score=dotNormal*0.6 + areaRatio*0.3 - Math.min(dCenter/10,1)*0.1;
      if(score>bestScore){bestScore=score;bestFn=n;bestFi=i;bestP=props.center;}
    }
    if(!(bestFn && bestScore>0.5)) bestFn=null; // matching échoué
  }
  // 3) Repli : face la plus alignée avec cutDir
  if(!bestFn){
    let bestDot=-2;
    for(let i=0;i<faceCount;i++){
      const n=faceNormalWorld(mesh,i);
      if(!n)continue;
      const dot=n.x*cutDir.x+n.y*cutDir.y+n.z*cutDir.z;
      if(dot>bestDot){bestDot=dot;bestFn=n;bestFi=i;
        if(g.index){const idx=g.index.getX(i*3);bestP=[pos.getX(idx),pos.getY(idx),pos.getZ(idx)];}
        else{const idx=i*3;bestP=[pos.getX(idx),pos.getY(idx),pos.getZ(idx)];}
      }
    }
  }
  if(!bestFn)return false;
  // Mémorise le triangle utilisé pour le suivi dynamique
  f.upto.faceId={fi:bestFi,bid:tgtBody.id};
  // Distance signée le long de B.n de O (origine esquisse) au plan de la face
  const dotBn=bestFn.x*B.n.x+bestFn.y*B.n.y+bestFn.z*B.n.z;
  if(Math.abs(dotBn)<1e-9)return false;
  const num=bestFn.x*(bestP[0]-B.o.x)+bestFn.y*(bestP[1]-B.o.y)+bestFn.z*(bestP[2]-B.o.z);
  const t=num/dotBn;
  if(Math.abs(t)<1e-6)return false;
  // t est signé : le prisme [0,t] va naturellement VERS la face quel que soit le côté.
  // Plus de rejet avec dir — c'était la cause des « sens inversé » : une face inclinée a son
  // centre d'un côté du plan d'esquisse et son plan de l'autre, la garde repoussait la bonne
  // distance et l'extrusion retombait sur la valeur Distance.
  const prev=f.distance;
  f.distance=+t.toFixed(4);
  return Math.abs((+prev||0)-f.distance)>1e-6;
}
 function extDistSet(f,v){
  // Écriture de la course depuis le champ Distance : v = course signée le long de n.
  // Mode « vers un objet » : distance auto-résolue, champ inopérant.
  if(!f||!isFinite(v))return;
  if(f.upto)return;
  f.distance=+v.toFixed(3);
  f.name=extName(f);
}
/* V0.11.27 : « Jusqu'à la face » sans caprice.
   · Tant que la fenêtre de l'extrusion est ouverte avec cette étendue, le choix de face est
     PERMANENT (extUptoAuto) : chaque clic court sur une face la (re)désigne, sans bouton à
     rouvrir ni clic ailleurs. Avant, le premier relâchement de souris — même celui d'une
     rotation de la vue — consommait le mode, et la face n'était plus cliquable.
   · L'opération n'est plus forcée en Poche : un Plot reste un Plot.
   · Toute face d'un corps (hors outils fantômes) convient, quelle que soit la fonction qui l'a
     produite ; la cible mémorisée est la dernière fonction antérieure de ce corps. */
function extUptoAuto(){
  try{
    if(typeof skEdit!=='undefined'&&skEdit)return null;
    if(typeof asmMode!=='undefined'&&asmMode==='asm')return null;
    const f=extDynFeature();
    return f&&f.upto&&f.visible!==false?f:null;
  }catch(e){return null;}
}
function extPickHit(e){
  // face sous la souris, sur les corps VISIBLES et réels (les fantômes de découpe sont transparents)
  const r=renderer.domElement.getBoundingClientRect();
  rayc.setFromCamera(new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
  const ms=bodies.filter(b=>b.visible&&b.mesh&&!b.ghost&&b.mesh.visible!==false).map(b=>b.mesh);
  const h=rayc.intersectObjects(ms,false)[0];
  if(!h||!h.object.userData.bid)return null;
  return {bid:h.object.userData.bid,mesh:h.object,fi:h.faceIndex,props:getFaceProps(h.object,h.faceIndex)};
}
function extUptoTarget(f,bid){
  // fonction cible : la dernière fonction ANTÉRIEURE du corps cliqué, sinon la dernière antérieure
  const me=doc.features.indexOf(f);
  const prevs=doc.features.slice(0,me).filter(x=>x&&x.visible!==false);
  if(!prevs.length)return null;
  const own=prevs.filter(x=>x.id===bid||x.body===bid);
  return (own.length?own:prevs)[(own.length?own:prevs).length-1];
}
function extPickFaceCommit(e){
  const auto=extUptoAuto();
  const job=extPickFace||(auto?{f:auto}:null);extPickFace=null;
  try{renderer.domElement.style.cursor='';}catch(err){}
  if(!job)return;
  const f=doc.features.find(x=>x.id===job.f.id)||job.f;
  let picked=null;try{picked=extPickHit(e);}catch(err){}
  if(!picked){faceEl.textContent='Jusqu\'à la face : cliquez sur une face d\'un corps.';return;}
  const sk=doc.sketches.find(s=>s.id===f.sketchId);
  let B=null;try{B=sk?sketchBasis(sk):null;}catch(err){}
  // Côté déterminé par la POSITION de la face par rapport au plan d'esquisse (pas la normale)
  const faceProps=picked.props||getFaceProps(picked.mesh,picked.fi);
  let side=1;
  if(B&&faceProps){
    const c=faceProps.center;
    side=((c.x-B.o.x)*B.n.x+(c.y-B.o.y)*B.n.y+(c.z-B.o.z)*B.n.z)>=0?1:-1;
  }
  const tgt=extUptoTarget(f,picked.bid);
  if(!tgt){faceEl.textContent='Jusqu\'à la face : aucune fonction ANTÉRIEURE — créez d\'abord un volume avant cette extrusion.';return;}
  const prevUpto=f.upto,prevDist=f.distance;
  f.upto={ex:tgt.id,side,faceId:{fi:picked.fi,bid:picked.bid},faceProps};
  let ok=false;try{ok=resolveExtrudeUpto(f);}catch(err){ok=false;}
  if(!ok||!isFinite(f.distance)){
    // Face non utilisable (parallèle au sens d'extrusion, dans le plan d'esquisse…) : rien ne change
    f.upto=prevUpto;f.distance=prevDist;
    f.name=extName(f);
    faceEl.textContent='Jusqu\'à la face : face non utilisable (parallèle au sens d\'extrusion, ou dans le plan de l\'esquisse) — choisissez-en une autre.';
    return;
  }
  // une étape d'annulation par face choisie (l'état d'avant = prevUpto / prevDist)
  const now={upto:f.upto,distance:f.distance};
  f.upto=prevUpto;f.distance=prevDist;
  docPushUndo('face cible de « '+f.name+' »');
  f.upto=now.upto;f.distance=now.distance;
  f.name=extName(f);
  ghostHide=(f.op==='cut')?f.id:null;
  repSyncForFeature(f);markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Jusqu\'à la face : '+Math.abs(+f.distance||0)+' mm ('+(f.op==='cut'?'Poche':'Plot')+'). Cliquez une autre face pour changer.';
}
