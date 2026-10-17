/* ---------- Repère façon Fusion : point central + 3 axes + 3 plans (2026-10-16-017) ----------
   Remplace l'AxesHelper (3 traits de 60 mm). Taille CONSTANTE à l'écran (indépendante du zoom),
   dessiné par-dessus la pièce. Les 3 petits plans du repère de l'appli sont sélectionnables :
   clic = même sélection que le plan d'origine dans l'arbre (esquisse dessus, référence…).
   Le même dessin sert au repère des posages FAO (src/88 : faoPoseSync). */
const TRIADS=[]; // repères à remettre à l'échelle à chaque image
const TRIAD_AX={X:0xff453a,Y:0x30d158,Z:0x0a84ff};
function triadMake(opts){
  opts=opts||{};
  const g=new THREE.Group();g.name=opts.name||'triad';
  g.userData.triad=true;g.userData.px=opts.px||100;g.userData.planes={};
  // 2026-10-16-020 : les 3 plans vivent dans un groupe FRÈRE (même échelle) : repère et plans
  // se masquent séparément. Repère pièce seulement — les repères FAO n'ont pas de plans.
  const pg=new THREE.Group();pg.name=(opts.name||'triad')+'Planes';pg.userData.triad=true;pg.userData.px=g.userData.px;pg.userData.follow=g;
  g.userData.planeGroup=pg;
  const base=(col,op)=>new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?1:op,depthTest:false,depthWrite:false,side:THREE.DoubleSide});
  const RO=opts.renderOrder||990;
  // 3 plans : petits carrés décalés de l'origine (comme Fusion), couleur du plan d'origine
  if(opts.planes!==false){
    const a=0.16,b=0.6;
    const quad=(pts)=>{const ge=new THREE.BufferGeometry();const v=[];[[0,1,2],[0,2,3]].forEach(t=>t.forEach(i=>v.push(...pts[i])));ge.setAttribute('position',new THREE.Float32BufferAttribute(v,3));return ge;};
    const defs={XY:[[a,a,0],[b,a,0],[b,b,0],[a,b,0]],XZ:[[a,0,a],[b,0,a],[b,0,b],[a,0,b]],YZ:[[0,a,a],[0,b,a],[0,b,b],[0,a,b]]};
    Object.keys(defs).forEach(p=>{
      const col=(typeof PLANES!=='undefined'&&PLANES[p])?PLANES[p].color:0x888888;
      const m=new THREE.Mesh(quad(defs[p]),base(col,0.34));m.renderOrder=RO;m.userData.plane=p;
      const ol=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(defs[p].map(q=>new THREE.Vector3(q[0],q[1],q[2]))),
        new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.9,depthTest:false,depthWrite:false}));
      ol.renderOrder=RO+1;ol.raycast=()=>{};m.add(ol);
      pg.add(m);g.userData.planes[p]=m;
    });
    TRIADS.push(pg);
  }
  // 3 axes : tige + pointe
  const axes=[['X',new THREE.Vector3(1,0,0)],['Y',new THREE.Vector3(0,1,0)],['Z',new THREE.Vector3(0,0,1)]];
  axes.forEach(([k,d])=>{
    const col=TRIAD_AX[k];
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.84,8),base(col));
    const tip=new THREE.Mesh(new THREE.ConeGeometry(0.055,0.16,14),base(col));
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d);
    shaft.quaternion.copy(q);shaft.position.copy(d.clone().multiplyScalar(0.42));
    tip.quaternion.copy(q);tip.position.copy(d.clone().multiplyScalar(0.92));
    [shaft,tip].forEach(o=>{o.renderOrder=RO+2;o.raycast=()=>{};g.add(o);});
  });
  // point central
  const c=new THREE.Mesh(new THREE.SphereGeometry(0.065,16,12),base(0xffffff));
  c.renderOrder=RO+3;c.raycast=()=>{};g.add(c);
  const cr=new THREE.Mesh(new THREE.SphereGeometry(0.085,16,12),base(0x1c1c1e,0.9));
  cr.renderOrder=RO+2;cr.raycast=()=>{};g.add(cr);
  TRIADS.push(g);
  return g;
}
function triadWpp(pos){
  // mm par pixel à cette position (perspective ou orthographique)
  try{
    const h=(renderer&&renderer.domElement&&renderer.domElement.clientHeight)||600;
    if(camera.isOrthographicCamera)return (camera.top-camera.bottom)/(camera.zoom||1)/h;
    const d=camera.position.distanceTo(pos);
    return 2*d*Math.tan((camera.fov*Math.PI/180)/2)/h;
  }catch(e){return 0.1;}
}
function triadUpdateAll(){
  const wp=new THREE.Vector3();
  for(const g of TRIADS){
    if(!g.visible||!g.parent)continue;
    try{
      const f=g.userData.follow;if(f){g.position.copy(f.position);g.quaternion.copy(f.quaternion);}
      g.getWorldPosition(wp);
      const s=g.userData.px*triadWpp(wp);
      if(isFinite(s)&&s>0)g.scale.setScalar(s);
    }catch(e){}
  }
}
let triadHover=null;
function triadPaint(g){
  // opacité des plans : survol / sélection (plan d'origine sélectionné dans l'arbre)
  if(!g||!g.userData.planes)return;
  Object.keys(g.userData.planes).forEach(p=>{
    const m=g.userData.planes[p];
    const act=(typeof sel!=='undefined'&&sel&&sel.kind==='plane'&&sel.id===p);
    m.material.opacity=act?0.8:(triadHover===p&&g===axHelper?0.6:0.34);
  });
}
function triadPickPlane(e){
  // Plan du repère de l'appli sous le curseur (prioritaire sur les corps : il est dessiné devant)
  try{
    if(!axHelper||!axHelper.userData||!axHelper.userData.planes)return null;
    const r=renderer.domElement.getBoundingClientRect();
    const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
    rayc.setFromCamera(ndc,camera);
    axHelper.updateMatrixWorld(true);
    const ms=Object.values(axHelper.userData.planes).filter(m=>m.visible); // plans masqués (œil de l'arbre) : non cliquables
    const hits=rayc.intersectObjects(ms,false);
    return hits.length?hits[0].object.userData.plane:null;
  }catch(e){return null;}
}
function triadHoverAt(e){
  const p=triadPickPlane(e);
  if(p!==triadHover){triadHover=p;triadPaint(axHelper);}
  return p;
}
