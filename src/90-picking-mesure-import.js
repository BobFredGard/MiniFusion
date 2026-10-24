/* ---------- picking / mesure façon viewer ---------- */
function wirePick(){
  const el=renderer.domElement;let dx=0,dy=0;
  el.addEventListener('pointerdown',e=>{dx=e.clientX;dy=e.clientY;});
  el.addEventListener('pointerup',e=>{
    if(extPickFace){if(e.button===0)extPickFaceCommit(e);return;} // mode « vers un objet »
    if(cgMode&&cgMode.slot!=null){if(Math.hypot(e.clientX-dx,e.clientY-dy)<=6&&e.button===0)cgPickCommit(e);return;} // construction : référence de l'emplacement actif
    if(Math.hypot(e.clientX-dx,e.clientY-dy)>6)return;
    if(filMode){if(e.button===0&&!e.ctrlKey)filletToggle(e);return;}
    if(filModeX){if(e.button===0)exactToggle(e);return;} // Ctrl/Cmd+clic = ajouter / retirer une arête
    if(typeof holeFacePick!=='undefined'&&holeFacePick){if(e.button===0&&!e.ctrlKey)holeFacePickAt(e);return;} // fonction Perçage : face de fin
    if(typeof faoHolePick!=='undefined'&&faoHolePick){if(e.button===0&&!e.ctrlKey)faoHolePickAt(e);return;} // perçage : clic sur un trou
    if(faoChainMode){if(e.button===0&&!e.ctrlKey)faoChainToggle(e);return;}
    if(faoPlanePick){if(e.button===0&&!e.ctrlKey)faoPlaneCommit(e);return;}
    if(typeof faoFramePick!=='undefined'&&faoFramePick){if(e.button===0&&!e.ctrlKey)faoFramePickCommit(e);return;} // axe Z / X du posage
    if(typeof faoFacePick!=='undefined'&&faoFacePick){if(e.button===0&&!e.ctrlKey)faoFacePickCommit(e);return;} // faces usinables / intouchables
    if(faoZPlanePick){if(e.button===0&&!e.ctrlKey)faoZPlaneCommit(e);return;}
    if(mvMode){if(e.button===0&&!e.ctrlKey)mvFaceCommit(e);return;}
    if(draftMode){if(e.button===0&&!e.ctrlKey)draftToggle(e);return;}
    if(coqueMode){if(e.button===0&&!e.ctrlKey)coqueToggle(e);return;}
    if(e.altKey)return;
    if(e.button===0&&!(e.ctrlKey||e.metaKey)&&typeof faoPosePickAt==='function'&&faoPosePickAt(e))return; // point cardinal → origine du posage
    if(e.shiftKey&&e.button===0){shiftMeasure(e);return;}
    if(e.button===0&&!(e.ctrlKey||e.metaKey))faceSelect(e,false);
    else if((e.ctrlKey||e.metaKey)&&e.button===0)faceSelect(e,true);
    else if(e.ctrlKey&&e.button===2)recenter(e);
  });
   el.addEventListener('pointermove',hoverMove);
   el.addEventListener('pointerleave',()=>clearHover());
   el.addEventListener('pointermove',e=>{
      if(extPickFace){renderer.domElement.style.cursor='crosshair';return;}
      if(faoPlanePick){renderer.domElement.style.cursor='crosshair';return;}
      if(faoZPlanePick){renderer.domElement.style.cursor='crosshair';return;}
    if(mvMode){mvFaceHover(e);renderer.domElement.style.cursor='pointer';return;}
    if(draftMode){draftHover(e);return;}
    if(coqueMode){coqueHover(e);return;}
      if(filModeX){
       const i=exactPick(e);
       if(i!==xHover){xHover=i;paintExact();}
       renderer.domElement.style.cursor=(i===null||i===undefined)?'default':'pointer';
       return;
     }
     if(faoChainMode){
       const ci=faoChainPick(e);
       if(ci!==faoChainHover){faoChainHover=ci;faoChainPaint();}
       renderer.domElement.style.cursor=(ci===null||ci===undefined)?'default':'pointer';
       return;
     }
     if(!filMode)return;
     const ed=filletPick(e);
     // survol = simple indication visuelle (jaune)
     const k=filEdgeHoverKey(ed);
     if(k!==filHover){filHover=k;paintFilletEdges();}
     const fc=pickFace(e);
     if(fc&&fc.bid===filMode.target)renderer.domElement.style.cursor='pointer';
     else if(!ed)renderer.domElement.style.cursor='default';
   });
  el.addEventListener('contextmenu',e=>{
    if(filMode||filModeX||faoChainMode||faoPlanePick||faoZPlanePick){e.preventDefault();return;}
    if(e.ctrlKey){e.preventDefault();return;}
    if(Math.hypot(e.clientX-dx,e.clientY-dy)>6)return;
    e.preventDefault();hideCtx();
    const h=pick(e);if(!h)return;
    const b=bodies.find(x=>x.mesh===h.object);
    showCtx3D(e.clientX,e.clientY,b?b.id:null);
  });
  el.addEventListener('dblclick',e=>{
    if(filModeX){
      // Plus de sélection par double-clic : un clic = une arête. La propagation tangente
      // passe par l'option « arêtes tangentes » du panneau (visible, donc prévisible).
      e.preventDefault();
      return;
    }
    if(filMode){
      e.preventDefault();
      const ed=filletPick(e);
      if(ed&&ed.kind==='v'&&ed.corner){
        // chaîne 2D tangente (esquisse) : lignes/arcs tangents au coin
        const F=doc.features.find(x=>x.id===filMode.target);
        const sk=doc.sketches.find(s=>s.id===(F?F.sketchId:filMode.sketchId)); if(sk) filletTangentChain(sk, ed.corner);
      }
      return;
    }
    if(!e.altKey)return;e.preventDefault();
    const h=pick(e);if(!h)return;
    const b=bodies.find(x=>x.mesh===h.object);if(b)isolate(b.id);
  });
function filletTangentChain(sk, startCorner){
  // 2D : suit les entités tangentes (angle < 8°) autour du profil
  const tr=skLoopTrace(sk); if(!tr.loops.length) return;
  const chain=tr.loops[0].chain;
  // map coin -> index dans nodes
  const nodes=chainNodesOf(chain);
  const idx=nodes.findIndex(pid=>{const p=sk.points[pid]; return p && Math.hypot(p.x-startCorner.x,p.y-startCorner.y)<0.5;});
  if(idx<0) return;
  const addCorner=(pid)=>{
    const q=sk.points[pid]; if(!q) return;
    const k=q.x.toFixed(2)+','+q.y.toFixed(2);
    if(!filMode.sel.some(s=>filEdgeKey(s)===k)) filMode.sel.push({x:+q.x.toFixed(2),y:+q.y.toFixed(2),pid});
  };
  // marche avant/arrière tant que tangent (G1)
  const isTangentAt=(i)=>{
    const n=nodes.length-1;
    const pid=nodes[i], pPrev=nodes[(i-1+n)%n], pNext=nodes[(i+1)%n];
    // angle entre les deux arêtes incidentes
    const A=sk.points[pPrev], V=sk.points[pid], B=sk.points[pNext];
    if(!A||!V||!B) return false;
    const ux=(A.x-V.x)/Math.hypot(A.x-V.x,A.y-V.y), uy=(A.y-V.y)/Math.hypot(A.x-V.x,A.y-V.y);
    const wx=(B.x-V.x)/Math.hypot(B.x-V.x,B.y-V.y), wy=(B.y-V.y)/Math.hypot(B.x-V.x,B.y-V.y);
    const dot=ux*wx+uy*wy;
    return Math.abs(dot) > 0.99;
  };
  const visited=new Set([idx]);
  let cur=idx;
  // avant
  for(let s=0;s<20;s++){
    const nxt=(cur-1+nodes.length-1)%(nodes.length-1);
    if(visited.has(nxt)) break;
    if(!isTangentAt(nxt)) break;
    visited.add(nxt); addCorner(nodes[nxt]); cur=nxt;
  }
  cur=idx;
  for(let s=0;s<20;s++){
    const nxt=(cur+1)%(nodes.length-1);
    if(visited.has(nxt)) break;
    if(!isTangentAt(cur)) break;
    visited.add(nxt); addCorner(nodes[nxt]); cur=nxt;
  }
  addCorner(nodes[idx]);
  paintFilletEdges(); renderFilletPanel();
  faceEl.textContent=`Congé : chaîne tangente 2D ${visited.size} coin(s) sélectionnée.`;
}
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){
    if(cgEscape())return; // construction : saisie de référence, puis panneau
    if(extPickFace){extPickFace=null;try{renderer.domElement.style.cursor='default';}catch(e2){}faceEl.textContent='Vers un objet : annulé.';return;}
    if(faoPlanePick){faoPlaneCancel();faceEl.textContent='Plan : annulé.';return;}
    if(typeof faoFramePick!=='undefined'&&faoFramePick){faoFramePickCancel();faceEl.textContent='Axe du posage : annulé.';return;}
    if(typeof faoFacePick!=='undefined'&&faoFacePick){faoFacePickCancel();faceEl.textContent='Saisie des faces terminée.';return;}
    if(faoZPlanePick){faoZPlaneCancel();faceEl.textContent='Plan : annulé.';return;}
    if(filMode||filModeX){exitFilletMode();return;}
    if(faoChainMode){faoChainExit(true);return;}
    if(typeof faoHolePick!=='undefined'&&faoHolePick){faoHolePickExit();return;}
    if(typeof holeFacePick!=='undefined'&&holeFacePick){holeFacePickCancel();faceEl.textContent='Perçage : sélection de face annulée.';return;}
    if(mvMode){exitMoveFaceMode();return;}
    if(draftMode){exitDraftMode();return;}
    if(coqueMode){exitCoqueMode();return;}clearMeasure();clearHover();hideCtx();hideCtx3D();}});
  // Entrée applique le dépouillage, comme Échap l'annule. Le champ d'angle du panneau
  // est isolé du reste : sans cela, taper un angle puis Entrée valait la saisie mais
  // n'appliquait rien, puisque le garde-fou global ignore toute cible INPUT.
  window.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||!draftMode)return;
    const t=e.target;
    const estAngle=t&&t.id==='draftAngleIn';
    if(!estAngle&&t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    e.preventDefault();draftApply();
  });
  // Entrée applique la coque, comme Échap l'annule (même isolement du champ).
  window.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||!coqueMode)return;
    const t=e.target;
    const estThick=t&&t.id==='coqueThickIn';
    if(!estThick&&t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    e.preventDefault();coqueApply();
  });
}
/* F5 = Vue complète isométrique (au lieu du rechargement navigateur) : on voit la pièce entièrement. */
window.addEventListener('keydown',e=>{
  if(e.key==='F5'){e.preventDefault();const ov=$('sketchOverlay');if(skEdit||(ov&&ov.classList.contains('open')))return;setView('iso');return;} // en esquisse, F5 = parallèle
});
// 2026-10-16-005 : raccourcis 3D (hors esquisse, hors saisie) — H perçage · R révolution ·
// F congés · C chanfreins · M répétitions (E extrusion : ci-dessous).
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;
  const map={h:'btnHole',r:'btnRevolve',f:'btnFillet',c:'btnChamfer',m:'btnRepeat'};
  const id=map[String(e.key||'').toLowerCase()];if(!id)return;
  const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable))return;
  if(skEdit||extPickFace||faoChainMode)return;
  const ov=$('sketchOverlay');if(ov&&ov.classList.contains('open'))return;
  const b=$(id);if(!b||b.disabled)return;
  e.preventDefault();b.click();
});
/* raccourci E : ouvrir l'extrusion (Fusion360) — au niveau module pour être armé dès le chargement,
   jamais pendant la saisie (input/textarea/select), une esquisse ouverte ou un mode congé. */
window.addEventListener('keydown',e=>{
  if((e.key==='e'||e.key==='E')&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&!e.repeat){
    const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable))return;
    if(skEdit||filMode||filModeX||extPickFace||faoChainMode)return;
    const ov=$('sketchOverlay');if(ov&&ov.classList.contains('open'))return;
    e.preventDefault();
    const b=$('btnExtrude');if(b&&!b.disabled)b.click();
  }
});
function pick(e){
  const r=renderer.domElement.getBoundingClientRect();
  const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  rayc.setFromCamera(ndc,camera);
  const hits=rayc.intersectObjects(bodies.filter(b=>b.visible).map(b=>b.mesh),false);
  return hits[0]||null;
}
// 2026-10-16-003 : sélection d'ARÊTES (clic sur une arête présélectionnée) et MESURE entre
// 2 arêtes (Ctrl/Cmd + clic) : droites parallèles → distance perpendiculaire ; droites
// quelconques → angle + distance mini ; cercles/arcs → entraxe (+ écart des plans si
// coaxiaux) ; droite + cercle → distance centre ↔ droite.
let selEdges=[];
function edgeGeomOf(P){
  const V=P.map(p=>new THREE.Vector3(p[0],p[1],p[2]));
  const A=V[0],B=V[V.length-1],u=B.clone().sub(A);const L=u.length();
  const dev=q=>{if(L<1e-9)return 0;const t=q.clone().sub(A).dot(u)/(L*L);return q.distanceTo(A.clone().addScaledVector(u,t));};
  if(V.length<=2||V.every(q=>dev(q)<1e-3*Math.max(1,L)))return{kind:'line',a:A,b:B,u:u.clone().normalize(),pts:V};
  // cercle passant par 3 points (début, milieu, fin) ; fermé → 3 points répartis
  const closed=A.distanceTo(B)<1e-6*Math.max(1,L)+1e-6;
  const p1=V[0],p2=V[Math.floor(V.length/3)],p3=V[Math.floor(2*V.length/3)];
  const a=p2.clone().sub(p1),b=p3.clone().sub(p1),n=a.clone().cross(b);const nn=n.lengthSq();
  if(nn<1e-12)return{kind:'curve',pts:V};
  // centre circonscrit : C = p1 + ((|a|²·b − |b|²·a) × n) / (2|n|²), n = a × b
  const C=p1.clone().add(b.clone().multiplyScalar(a.lengthSq()).sub(a.clone().multiplyScalar(b.lengthSq())).cross(n).multiplyScalar(0.5/nn));
  const r=C.distanceTo(p1);
  const ok=V.every(q=>Math.abs(q.distanceTo(C)-r)<2e-3*Math.max(1,r));
  return ok?{kind:'circle',center:C,axis:n.clone().normalize(),r,closed,pts:V}:{kind:'curve',pts:V};
}
function edgeSelect(e,eh,second){
  const P=edgeHoverSegs()[eh.pi];if(!P)return;
  const G=edgeGeomOf(P);
  clearHover();
  if(!second||!selEdges.length){
    clearMeasure();selEdges=[{P,G}];
    if(!selGroup){selGroup=new THREE.Group();scene.add(selGroup);}
    edgeHoverDraw(P,selGroup,0xff9f0a);
    const desc=G.kind==='line'?('DROITE · longueur '+G.a.distanceTo(G.b).toFixed(2)+' mm'):(G.kind==='circle'?((G.closed?'CERCLE':'ARC')+' · Ø'+(2*G.r).toFixed(2)+' (R'+G.r.toFixed(2)+')'):'COURBE');
    faceEl.textContent='Arête 1 : '+desc+'\nCtrl/Cmd+clic une 2e arête : distance perpendiculaire, angle ou entraxe.';
    return;
  }
  selEdges.push({P,G});edgeHoverDraw(P,selGroup,0xff9f0a);
  const A=selEdges[0].G,B=G;
  if(A.kind==='line'&&B.kind==='line'){
    const ang=Math.acos(Math.min(1,Math.abs(A.u.dot(B.u))))*180/Math.PI;
    if(ang<0.5){
      const M=B.a.clone().add(B.b).multiplyScalar(0.5);
      const F=A.a.clone().addScaledVector(A.u,M.clone().sub(A.a).dot(A.u));
      const d=F.distanceTo(M);
      dimPair(F,M,d.toFixed(2));
      faceEl.textContent='Arêtes parallèles : '+d.toFixed(2)+' mm (perpendiculaire) · angle '+ang.toFixed(2)+'°';
    }else{
      // plus courte distance entre les 2 segments (échantillonnage + affinage)
      let best={d:1e18};
      const segPt=(G0,t)=>G0.a.clone().lerp(G0.b,t);
      for(let i=0;i<=40;i++)for(let j=0;j<=40;j++){const p=segPt(A,i/40),q=segPt(B,j/40),d=p.distanceTo(q);if(d<best.d)best={d,p,q,i,j};}
      dimPair(best.p,best.q,best.d.toFixed(2));
      faceEl.textContent='Arêtes non parallèles : angle '+ang.toFixed(2)+'° · distance mini ≈ '+best.d.toFixed(2)+' mm';
    }
    return;
  }
  if(A.kind==='circle'&&B.kind==='circle'){
    const d=A.center.distanceTo(B.center),coax=Math.abs(Math.abs(A.axis.dot(B.axis))-1)<1e-4&&B.center.clone().sub(A.center).cross(A.axis).length()<1e-3;
    dimPair(A.center,B.center,(coax?'':'entraxe ')+d.toFixed(2));
    tagAt('Ø '+(2*A.r).toFixed(2),A.pts[0]);tagAt('Ø '+(2*B.r).toFixed(2),B.pts[0]);
    faceEl.textContent=(coax?'Cercles COAXIAUX : écart des plans '+d.toFixed(2)+' mm':'Entraxe : '+d.toFixed(2)+' mm')+'\nØ1='+(2*A.r).toFixed(2)+' · Ø2='+(2*B.r).toFixed(2);
    return;
  }
  const L=A.kind==='line'?A:(B.kind==='line'?B:null),C=A.kind==='circle'?A:(B.kind==='circle'?B:null);
  if(L&&C){
    const F=L.a.clone().addScaledVector(L.u,C.center.clone().sub(L.a).dot(L.u));const d=F.distanceTo(C.center);
    dimPair(C.center,F,d.toFixed(2));tagAt('Ø '+(2*C.r).toFixed(2),C.pts[0]);
    faceEl.textContent='Centre ↔ droite : '+d.toFixed(2)+' mm (perpendiculaire) · Ø='+(2*C.r).toFixed(2);
    return;
  }
  // courbes quelconques : distance mini entre points des polylignes
  let best={d:1e18};A.pts.forEach(p=>B.pts.forEach(q=>{const d=p.distanceTo(q);if(d<best.d)best={d,p,q};}));
  dimPair(best.p,best.q,best.d.toFixed(2));faceEl.textContent='Distance mini entre arêtes ≈ '+best.d.toFixed(2)+' mm';
}
function faceSelect(e,second){
  // 2026-10-16-017 : plans du repère (dessinés devant la pièce) prioritaires
  if(!second){const tp=triadPickPlane(e);if(tp){clearMeasure();sel={kind:'plane',id:tp};renderTree();renderProps();refreshParts();faceEl.textContent=`Plan ${tp} — ${PLANES[tp].label}
Bouton « Esquisse » (ou double-clic dans l'arbre) pour dessiner dessus.`;return;}}
  if(!second&&cgSelectAt(e))return; // construction (79) : plans, axes, points, repères
  const h=pick(e);
  try{const eh=edgeHoverPick(e,h);if(eh){edgeSelect(e,eh,second);return;}}catch(err){}
  if(second&&selEdges.length&&!selFaces.length){selEdges=[];}
  if(!h){
    if(!second){
      const pl=pickPlane(e);
      if(pl){sel={kind:'plane',id:pl};renderTree();renderProps();refreshParts();faceEl.textContent=`Plan ${pl} — ${PLANES[pl].label}\nBouton « Esquisse » (ou double-clic dans l'arbre) pour dessiner dessus.`;return;}
      clearMeasure();faceEl.textContent='Aucune face — cliquez sur un corps.';
    }return;}
  clearHover();
  if(!second){clearMeasure();selFaces=[{mesh:h.object,faceIndex:h.faceIndex,point:h.point.clone(),geom:occFaceGeom(h.object,h.faceIndex)}];highlightTris(h.object,faceTrisFor(h.object,h.faceIndex),0xff9f0a,0.55);
    const G=selFaces[0].geom;
    faceEl.textContent=`Face 1 : ${bodyName(h.object)}${G?(G.kind==='cyl'?` · CYLINDRE Ø${(G.r*2).toFixed(2)}`:' · PLAN'):''}\nAire ≈ ${faceArea(h.object,h.faceIndex)}\nCtrl+clic une 2e face (entraxe auto si cylindres) · Bouton « Esquisse » pour esquisser dessus.`;}
  else{
    if(!selFaces.length){faceSelect(e,false);return;}
    const NB={mesh:h.object,faceIndex:h.faceIndex,point:h.point.clone(),geom:occFaceGeom(h.object,h.faceIndex)};
    selFaces.push(NB);highlightTris(h.object,faceTrisFor(h.object,h.faceIndex),0xff9f0a,0.55);
    if(!measurePair(selFaces[0],NB)){
      const[a,b]=selFaces;const d=a.point.distanceTo(b.point);
      dimPair(a.point,b.point,d.toFixed(2)+' mm');
      faceEl.textContent=`Face 1 : ${bodyName(a.mesh)}\nFace 2 : ${bodyName(b.mesh)}\nDistance points ≈ ${d.toFixed(2)} mm${occHas()?'':'\n(Entraxe/Ø exacts : noyau OCCT requis — page en http://)'}`;
    }
  }
}
function measurePair(A,B){
  // Mesures exactes entre 2 faces classées (plans / cylindres BRep). True si traité.
  const GA=A.geom,GB=B.geom;
  if(!GA||!GB)return false;
  if(GA.kind==='cyl'&&GB.kind==='cyl'){
    const en=entraxePts(GA.center,GA.axis,GB.center,GB.axis);
    const ang=Math.asin(Math.min(1,GA.axis.clone().cross(GB.axis).length()))*180/Math.PI;
    dimPair(en.q1,en.q2,'entraxe '+en.d.toFixed(2));
    tagAt('Ø '+(GA.r*2).toFixed(2),en.q1);tagAt('Ø '+(GB.r*2).toFixed(2),en.q2);
    drawAxis(GA.center,GA.axis,axisLen());drawAxis(GB.center,GB.axis,axisLen());
    faceEl.textContent=`Entraxe : ${en.d.toFixed(2)} mm${en.par?' (axes quasi-parallèles)':''}\nØ1=${(GA.r*2).toFixed(2)} · Ø2=${(GB.r*2).toFixed(2)} · angle axes=${ang.toFixed(2)}°`;
    return true;
  }
  const C=GA.kind==='cyl'?GA:(GB.kind==='cyl'?GB:null);
  const P=GA.kind==='plan'?GA:(GB.kind==='plan'?GB:null);
  if(C&&P){
    const a2p=Math.asin(Math.min(1,Math.abs(C.axis.dot(P.n))))*180/Math.PI;
    const dAx=(C.center.clone().sub(P.p)).dot(P.n);
    const qf=C.center.clone().addScaledVector(P.n,-dAx);
    dimPair(C.center,qf,Math.abs(dAx).toFixed(2));
    tagAt('Ø '+(C.r*2).toFixed(2),(GA.kind==='cyl'?A:B).point.clone());
    drawAxis(C.center,C.axis,axisLen());
    faceEl.textContent=`Axe↔face : ${Math.abs(dAx).toFixed(2)} mm${a2p>89?' (axe ⊥ face)':` (angle axe/plan=${a2p.toFixed(1)}°)`}\nØ=${(C.r*2).toFixed(2)}`;
    return true;
  }
  if(GA.kind==='plan'&&GB.kind==='plan'){
    const ang=Math.acos(Math.min(1,Math.abs(GA.n.dot(GB.n))))*180/Math.PI;
    if(ang<0.5){
      // Distance EXACTE entre les deux plans (équations BRep), pas entre les points
      // cliqués : un clic tombe sur le maillage, à la flèche de tessellation près.
      const signed=(GB.p.clone().sub(GA.p)).dot(GA.n);
      const A0=A.point.clone().addScaledVector(GA.n,-(A.point.clone().sub(GA.p)).dot(GA.n)); // pied SUR le plan 1
      dimPair(A0,A0.clone().addScaledVector(GA.n,signed),Math.abs(signed).toFixed(2));
      faceEl.textContent=`Faces parallèles : ${Math.abs(signed).toFixed(2)} mm (angle ${ang.toFixed(2)}°)`;
    }else{
      const d=A.point.distanceTo(B.point);
      dimPair(A.point,B.point,d.toFixed(2)+' mm');
      faceEl.textContent=`Faces non parallèles : angle=${ang.toFixed(2)}° · dist. points=${d.toFixed(2)} mm`;
    }
    return true;
  }
  return false;
}
function occFaceAt(shape,ord){
  const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
  const ex=new occt.TopExp_Explorer_2(shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
  let k=0;
  while(ex.More()){if(k===ord){const f=occt.TopoDS.Face_1(ex.Current());try{ex.delete();}catch(e){}return f;}k++;ex.Next();}
  try{ex.delete();}catch(e){}
  return null;
}
function occFaceGeom(mesh,fi){
  // Géométrie exacte d'une face cliquée (plan / cylindre) via le BRep. Null sinon.
  // Multi-corps : chaque mesh a ses propres ordinaux (occGroups par solide) — la face
  // est donc résolue sur le SOLIDE DU CORPS cliqué, pas sur le composé occLive.
  // 2026-10-15-004 : un import STEP (seul dans son corps) a AUSSI son BRep exact
  // (importGeom.brep) et son maillage porte occGroups : on le résout pareil. Avant,
  // un STEP retombait sur la distance entre les points cliqués (« la mesure sur les
  // fichiers STEP n'est pas identique à celle des solides de l'application »).
  if(!occHas()||!mesh||fi===undefined)return null;
  const bd=bodies.find(b=>b.mesh===mesh);
  if(!bd)return null;
  let shape=null;
  if(bd.kind==='body'&&bd.shape&&occLive&&occLive.shape)shape=bd.shape;
  else if(bd.kind==='import'){const e=importGeom.get(bd.ref||bd.id);if(e&&e.brep)shape=e.brep;}
  if(!shape)return null;
  try{
    const groups=mesh.geometry.userData.occGroups||[];
    const g=groups.find(g=>fi>=g.start&&fi<g.start+g.count);
    if(!g)return null;
    const f=occFaceAt(shape,g.f);
    if(!f)return null;
    const ad=new occt.BRepAdaptor_Surface_2(f,true);
    const gt=ad.GetType();
    const isCyl=gt===occt.GeomAbs_SurfaceType.GeomAbs_Cylinder;
    const isPl=gt===occt.GeomAbs_SurfaceType.GeomAbs_Plane;
    if(!isCyl&&!isPl){try{ad.delete();}catch(e){}try{f.delete();}catch(e){}return null;}
    let out=null;
    if(isCyl){
      const a=ad.Cylinder().Axis();
      out={kind:'cyl',axis:new THREE.Vector3(a.Direction().X(),a.Direction().Y(),a.Direction().Z()).normalize(),
        center:new THREE.Vector3(a.Location().X(),a.Location().Y(),a.Location().Z()),r:ad.Cylinder().Radius()};
    }else{
      const p=ad.Plane();
      const a=p.Axis();
      out={kind:'plan',n:new THREE.Vector3(a.Direction().X(),a.Direction().Y(),a.Direction().Z()).normalize(),
        p:new THREE.Vector3(a.Location().X(),a.Location().Y(),a.Location().Z())};
    }
    try{ad.delete();}catch(e){}
    // Repère du mesh (import déplacé) : la géométrie BRep est en coordonnées locales.
    try{
      mesh.updateMatrixWorld(true);const M=mesh.matrixWorld;
      if(M&&!M.equals(new THREE.Matrix4())){
        const N=new THREE.Matrix3().getNormalMatrix(M);
        if(out.kind==='cyl'){out.center.applyMatrix4(M);out.axis.applyMatrix3(N).normalize();}
        else{out.p.applyMatrix4(M);out.n.applyMatrix3(N).normalize();}
      }
    }catch(e){}
    return out;
  }catch(e){return null;}
}
function closestAxisPoints(c1,a1,c2,a2){
  const w0=c1.clone().sub(c2),b=a1.dot(a2),den=1-b*b;
  if(Math.abs(den)<1e-9){
    const q=c1.clone().addScaledVector(a1,c2.clone().sub(c1).dot(a1));
    return[q,c2.clone()];
  }
  const d=a1.dot(w0),e=a2.dot(w0);
  const sc=(b*e-d)/den,tc=(e-b*d)/den;
  return[c1.clone().addScaledVector(a1,sc),c2.clone().addScaledVector(a2,tc)];
}
function entraxePts(c1,a1,c2,a2){
  // Pieds anti-explosion : si quasi-parallèles (< 5°), mesure locale au point médian.
  if(Math.abs(a1.dot(a2))>Math.cos(5*Math.PI/180)){
    const m=c1.clone().add(c2).multiplyScalar(0.5);
    const q1=c1.clone().addScaledVector(a1,m.clone().sub(c1).dot(a1));
    const q2=c2.clone().addScaledVector(a2,m.clone().sub(c2).dot(a2));
    return{q1,q2,d:q1.distanceTo(q2),par:true};
  }
  const[q1,q2]=closestAxisPoints(c1,a1,c2,a2);
  return{q1,q2,d:q1.distanceTo(q2),par:false};
}
function drawAxis(center,axis,len){
  if(!selGroup){selGroup=new THREE.Group();scene.add(selGroup);}
  const a=center.clone().addScaledVector(axis,-len/2),b=center.clone().addScaledVector(axis,len/2);
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),
    new THREE.LineDashedMaterial({color:0xff9f0a,dashSize:len/20,gapSize:len/25,depthTest:false}));
  l.computeLineDistances();l.renderOrder=997;l.raycast=()=>{};selGroup.add(l);
}
function axisLen(){
  try{return Math.max(20,camera.position.distanceTo(controls.target)*0.4);}catch(e){return 40;}
}
function shiftMeasure(e){
  const h=pick(e);if(!h)return;
  const G=occFaceGeom(h.object,h.faceIndex);
  if(G&&G.kind==='cyl'){
    drawAxis(G.center,G.axis,axisLen());
    const q=G.center.clone().addScaledVector(G.axis,h.point.clone().sub(G.center).dot(G.axis));
    dimPair(q,h.point.clone(),'R '+G.r.toFixed(2));
    tagAt('Ø '+(G.r*2).toFixed(2),h.point.clone());
    faceEl.textContent=`Cylindre exact : Ø ${G.r.toFixed(2)} mm (R ${G.r.toFixed(2)})\nAxe=${G.axis.x.toFixed(3)}, ${G.axis.y.toFixed(3)}, ${G.axis.z.toFixed(3)} · centre=(${G.center.x.toFixed(1)}, ${G.center.y.toFixed(1)}, ${G.center.z.toFixed(1)})\nCtrl+clic un 2e cylindre = entraxe · Ctrl+clic un plan = cote axe↔face.`;
    return;
  }
  const box=new THREE.Box3().setFromObject(h.object);const s=box.getSize(new THREE.Vector3());
  const d=Math.min(s.x,s.y,s.z)||Math.max(s.x,s.y,s.z);
  dimPair(h.point.clone(),h.point.clone().add(new THREE.Vector3(0,0,d/2)),'Ø≈'+d.toFixed(1));
  faceEl.textContent=`Arête/solide : ${bodyName(h.object)}\nØ approx (boîte englobante) ≈ ${d.toFixed(2)} mm\n${occHas()?'(Cliquez une face cylindrique pour l\u2019Ø exact.)':'(Ø exact et entraxes : noyau OCCT requis — page en http://)'}`;
}
const bodyName=m=>(bodies.find(b=>b.mesh===m)||{name:m.name||'solide'}).name;
function faceArea(mesh,fi){
  try{const g=mesh.geometry;if(!g.index||fi===undefined)return 'n/a';
    const p=g.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    a.fromBufferAttribute(p,g.index.getX(fi*3));b.fromBufferAttribute(p,g.index.getX(fi*3+1));c.fromBufferAttribute(p,g.index.getX(fi*3+2));
    return (new THREE.Triangle(a,b,c).getArea()).toFixed(1)+' mm²';}catch(e){return 'n/a';}
}
function highlight(mesh,fi){
  if(!selGroup){selGroup=new THREE.Group();scene.add(selGroup);}
  const m=new THREE.Mesh(mesh.geometry,new THREE.MeshBasicMaterial({color:0xff9f0a,transparent:true,opacity:.35,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,depthWrite:false}));
  m.applyMatrix4(mesh.matrixWorld);m.raycast=()=>{};selGroup.add(m);
}
const growCache=new WeakMap(); // géométrie -> {adj,fn,nTri} (surlignage + survol)
function growData(mesh){
  let d=growCache.get(mesh.geometry);
  if(d)return d;
  const g=mesh.geometry,pos=g.attributes.position;
  const idOf=new Map();let nid=0;
  const vid=i=>{const k=pos.getX(i).toFixed(4)+','+pos.getY(i).toFixed(4)+','+pos.getZ(i).toFixed(4);let id=idOf.get(k);if(id===undefined){id=nid++;idOf.set(k,id);}return id;};
  const idx=g.index,nTri=idx?idx.count/3:pos.count/3;
  if(!nTri||nTri>150000)return null;
  const T=new Array(nTri);
  for(let t=0;t<nTri;t++)T[t]=[vid(idx?idx.getX(3*t):3*t),vid(idx?idx.getX(3*t+1):3*t+1),vid(idx?idx.getX(3*t+2):3*t+2)];
  const adj=new Map();
  T.forEach((vs,t)=>{[[0,1],[1,2],[2,0]].forEach(([p,q])=>{const k=pairKey(vs[p],vs[q]);let a=adj.get(k);if(!a){a=[];adj.set(k,a);}if(a.length<2)a.push(t);});});
  d={adj,T,nTri};growCache.set(mesh.geometry,d);
  return d;
}
function growTris(mesh,tri0){
  // Région de même surface par propagation dièdre (10/20/30°), comme le viewer. Null si échec/trop gros.
  const d=growData(mesh);
  if(!d||tri0<0||tri0>=d.nTri)return null;
  const g=mesh.geometry,pos=g.attributes.position,idx=g.index;
  const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),U=new THREE.Vector3(),V=new THREE.Vector3(),N=new THREE.Vector3();
  const fn=new Float32Array(d.nTri*3);
  for(let t=0;t<d.nTri;t++){
    A.fromBufferAttribute(pos,idx?idx.getX(3*t):3*t);B.fromBufferAttribute(pos,idx?idx.getX(3*t+1):3*t+1);C.fromBufferAttribute(pos,idx?idx.getX(3*t+2):3*t+2);
    U.subVectors(B,A);V.subVectors(C,A);N.crossVectors(U,V);
    const l=N.length()||1;fn[3*t]=N.x/l;fn[3*t+1]=N.y/l;fn[3*t+2]=N.z/l;
  }
  const neigh=t=>{
    const vs=d.T[t],res=[];
    [[vs[0],vs[1]],[vs[1],vs[2]],[vs[2],vs[0]]].forEach(([a,b])=>{
      (d.adj.get(pairKey(a,b))||[]).forEach(u=>{if(u!==t&&!res.includes(u))res.push(u);});
    });
    return res;
  };
  let best=[];
  for(const maxDeg of [10,20,30]){
    const cosMax=Math.cos(maxDeg*Math.PI/180);
    const seen=new Uint8Array(d.nTri);seen[tri0]=1;
    const stack=[tri0],out=[];
    while(stack.length&&out.length<20000){
      const t=stack.pop();out.push(t);
      neigh(t).forEach(u=>{
        if(seen[u])return;
        if(fn[3*t]*fn[3*u]+fn[3*t+1]*fn[3*u+1]+fn[3*t+2]*fn[3*u+2]>=cosMax){seen[u]=1;stack.push(u);}
      });
    }
    if(out.length>best.length)best=out;
    if(out.length>=25)break; // région large : comme le viewer, on s'arrête
  }
  return best.length?best:null;
}
function faceTrisFor(mesh,fi){
  // Triangles à surligner pour un triangle cliqué : face BRep exacte si dispo, sinon région propagée, sinon le triangle.
  try{
    const groups=mesh.geometry.userData.occGroups||[];
    const g=groups.find(g=>fi>=g.start&&fi<g.start+g.count);
    if(g){const out=[];for(let t=g.start;t<g.start+g.count;t++)out.push(t);return out;}
  }catch(e){}
  try{
    const grown=growTris(mesh,fi);
    if(grown&&grown.length)return grown;
  }catch(e){}
  return(fi>=0)?[fi]:null;
}
function highlightTris(mesh,tris,color,opacity,target){
  if(!tris||!tris.length)return;
  const grp=target||(()=>{if(!selGroup){selGroup=new THREE.Group();scene.add(selGroup);}return selGroup;})();
  mesh.updateMatrixWorld(true);
  const g=mesh.geometry,pos=g.attributes.position,idx=g.index;
  const arr=[],v=new THREE.Vector3();
  tris.forEach(t=>{
    for(let k=0;k<3;k++){
      const vi=idx?idx.getX(3*t+k):3*t+k;
      if(vi<0||vi>=pos.count)return;
      v.fromBufferAttribute(pos,vi).applyMatrix4(mesh.matrixWorld);
      arr.push(v.x,v.y,v.z);
    }
  });
  if(!arr.length)return;
  const hg=new THREE.BufferGeometry();
  hg.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
  hg.computeVertexNormals();
  // 2026-10-16-016 : surlignage MASQUÉ par la matière devant lui (depthTest) — avant, il se
  // voyait à travers la pièce (face arrière orange par-dessus les congés, paroi de poche
  // « flottante »). Exception : corps en verre, où l'on doit voir la face au travers.
  const xr=(()=>{try{const u=mesh.material&&mesh.material.userData;return !!(u&&typeof u.glass==='number'&&u.glass<0.999);}catch(e){return false;}})();
  const hm=new THREE.Mesh(hg,new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,depthTest:xr?false:true,depthWrite:false}));
  hm.renderOrder=996;hm.raycast=()=>{};grp.add(hm);
}
let hoverGroup=null,hoverKey='',lastHoverT=0;
function clearHover(){
  hoverKey='';
  if(hoverGroup){scene.remove(hoverGroup);hoverGroup.traverse(o=>{o.geometry&&o.geometry.dispose();o.material&&(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose&&m.dispose());});hoverGroup=null;}
}
// 2026-10-16-003 : PRÉSÉLECTION DES ARÊTES au survol (comme les faces) — surbrillance orange sanguine,
// ruban à peine plus épais que le trait normal (1,6 px au lieu de 1). Priorité à l'arête si le
// curseur est à ≤ 6 px d'elle ; une arête cachée derrière la face survolée est ignorée.
let edgeHoverCache={key:'',segs:null};
function edgeHoverSegs(){
  const key=(typeof _docVersion!=='undefined'?_docVersion:0)+'|'+bodies.length+'|'+bodies.filter(b=>b.visible).map(b=>b.id).join(',');
  if(edgeHoverCache.key===key&&edgeHoverCache.segs)return edgeHoverCache.segs;
  let data=[];try{data=edgeOverlayData()||[];}catch(e){data=[];}
  const out=[];
  data.forEach((d,ei)=>{const pts=d&&d.pts;if(!pts||pts.length<2)return;const M=(d.mw&&d.mw.elements)||null;
    const P=pts.map(p=>{let x=+p[0],y=+p[1],z=+p[2];if(M){const X=x,Y=y,Z=z;x=M[0]*X+M[4]*Y+M[8]*Z+M[12];y=M[1]*X+M[5]*Y+M[9]*Z+M[13];z=M[2]*X+M[6]*Y+M[10]*Z+M[14];}return[x,y,z];});
    out.push(P);});
  edgeHoverCache={key,segs:out};
  return out;
}
function edgeHoverPick(e,faceHit){
  const segs=edgeHoverSegs();if(!segs.length)return null;
  const r=renderer.domElement.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const v=new THREE.Vector3(),vz=new THREE.Vector3(),toS=p=>{vz.set(p[0],p[1],p[2]).applyMatrix4(camera.matrixWorldInverse);v.set(p[0],p[1],p[2]).project(camera);return[(v.x+1)/2*r.width,(1-v.y)/2*r.height,v.z,-vz.z];};
  let best=null,bd=6;
  segs.forEach((P,pi)=>{
    let a=toS(P[0]);
    for(let k=1;k<P.length;k++){
      const b=toS(P[k]);
      if(a[2]<1&&b[2]<1&&a[2]>-1&&b[2]>-1){
        const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-9;
        let t=((mx-a[0])*dx+(my-a[1])*dy)/L2;t=Math.max(0,Math.min(1,t));
        const d=Math.hypot(mx-(a[0]+t*dx),my-(a[1]+t*dy));
        if(d<bd){
          // paramètre 3D corrigé de la perspective (t écran ≠ t espace)
          if(!camera.isOrthographicCamera){const za=a[3],zb=b[3];const den=(1-t)*zb+t*za;if(Math.abs(den)>1e-12)t=t*za/den;}
          const w=[P[k-1][0]+(P[k][0]-P[k-1][0])*t,P[k-1][1]+(P[k][1]-P[k-1][1])*t,P[k-1][2]+(P[k][2]-P[k-1][2])*t];
          // masquée par la face survolée ? (l'arête doit être au moins aussi proche que la face)
          const dc=camera.position.distanceTo(new THREE.Vector3(w[0],w[1],w[2]));
          if(!faceHit||dc<=faceHit.distance*1.004+0.3){bd=d;best={pi,dc};}
        }
      }
      a=b;
    }
  });
  return best;
}
function edgeHoverDraw(P,grp,color){
  // ruban écran : largeur 1,6 px à la profondeur de chaque point, face à la caméra
  const r=renderer.domElement.getBoundingClientRect();
  const wpp=q=>{if(camera.isOrthographicCamera)return (camera.top-camera.bottom)/(camera.zoom||1)/r.height;
    const d=camera.position.distanceTo(q);return 2*d*Math.tan(camera.fov*Math.PI/360)/r.height;};
  const pos=[],A=new THREE.Vector3(),B=new THREE.Vector3(),dir=new THREE.Vector3(),view=new THREE.Vector3(),n=new THREE.Vector3();
  for(let k=1;k<P.length;k++){
    A.set(P[k-1][0],P[k-1][1],P[k-1][2]);B.set(P[k][0],P[k][1],P[k][2]);
    dir.subVectors(B,A);if(dir.lengthSq()<1e-18)continue;
    view.subVectors(camera.position,A).normalize();n.crossVectors(dir,view).normalize();
    const ha=0.8*wpp(A),hb=0.8*wpp(B);
    const a1=[A.x+n.x*ha,A.y+n.y*ha,A.z+n.z*ha],a2=[A.x-n.x*ha,A.y-n.y*ha,A.z-n.z*ha];
    const b1=[B.x+n.x*hb,B.y+n.y*hb,B.z+n.z*hb],b2=[B.x-n.x*hb,B.y-n.y*hb,B.z-n.z*hb];
    pos.push(...a1,...a2,...b1,...b1,...a2,...b2);
  }
  if(!pos.length)return;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:color||0xff5a1f,side:THREE.DoubleSide,depthTest:true,depthWrite:false,transparent:true,opacity:0.95}));
  m.renderOrder=997;m.raycast=()=>{};grp.add(m);
}
function hoverMove(e){
  // Pré-sélection lumineuse au survol (comme le viewer), ~15 Hz max, jamais en orbite/clic.
  if(filMode||filModeX||skEdit||faoChainMode)return;
  if(e.buttons!==0)return;
  const now=performance.now();if(now-lastHoverT<65)return;lastHoverT=now;
  try{
    if(triadHoverAt(e)||(typeof faoPoseHoverAt==='function'&&faoPoseHoverAt(e))){if(hoverKey)clearHover();renderer.domElement.style.cursor='pointer';hoverMove._cur=1;return;}
    if(hoverMove._cur){hoverMove._cur=0;renderer.domElement.style.cursor='';}
    const h=pick(e);
    const eh=edgeHoverPick(e,h);
    if(eh){
      const key='edge:'+eh.pi;if(key===hoverKey)return;
      clearHover();hoverKey=key;
      hoverGroup=new THREE.Group();scene.add(hoverGroup);
      edgeHoverDraw(edgeHoverSegs()[eh.pi],hoverGroup);
      return;
    }
    if(!h||h.faceIndex===undefined||h.faceIndex===null){if(hoverKey)clearHover();return;}
    const groups=(h.object.geometry.userData.occGroups||[]);
    const g=groups.find(g=>h.faceIndex>=g.start&&h.faceIndex<g.start+g.count);
    const key=h.object.uuid+':'+(g?('g'+g.f):('t'+h.faceIndex));
    if(key===hoverKey)return;
    clearHover();hoverKey=key;
    if(!hoverGroup){hoverGroup=new THREE.Group();scene.add(hoverGroup);}
    const tris=g?null:growTris(h.object,h.faceIndex);
    if(g){const out=[];for(let t=g.start;t<g.start+g.count&&out.length<4000;t++)out.push(t);highlightTris(h.object,out,0x0a84ff,0.35,hoverGroup);}
    else if(tris&&tris.length)highlightTris(h.object,tris.slice(0,4000),0x0a84ff,0.35,hoverGroup);
    else highlightTris(h.object,[h.faceIndex],0x0a84ff,0.35,hoverGroup);
  }catch(err){}
}
function clearMeasure(){
  selFaces=[];selEdges=[];selLabels=[];labelsDiv.innerHTML='';clearHover();
  if(selGroup){scene.remove(selGroup);selGroup=null;}
  if(measureGroup){scene.remove(measureGroup);measureGroup=null;}
}
function tagAt(text,pos){
  if(!measureGroup){measureGroup=new THREE.Group();scene.add(measureGroup);}
  const dot=new THREE.Mesh(new THREE.SphereGeometry(0.9,10,10),new THREE.MeshBasicMaterial({color:0x30d158,depthTest:false,depthWrite:false,transparent:true}));dot.position.copy(pos);dot.renderOrder=999;dot.raycast=()=>{};measureGroup.add(dot);
  const el=document.createElement('div');el.className='mlabel';el.textContent=text;labelsDiv.appendChild(el);
  selLabels.push({el,getPos:()=>pos.clone()});
}
function dimPair(p1,p2,text){
  if(!measureGroup){measureGroup=new THREE.Group();scene.add(measureGroup);}
  const ml=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]),new THREE.LineBasicMaterial({color:0x30d158,depthTest:false,depthWrite:false,transparent:true}));ml.renderOrder=999;ml.raycast=()=>{};measureGroup.add(ml);
  [p1,p2].forEach(p=>{const s=new THREE.Mesh(new THREE.SphereGeometry(1,10,10),new THREE.MeshBasicMaterial({color:0x30d158,depthTest:false,depthWrite:false,transparent:true}));s.position.copy(p);s.renderOrder=999;s.raycast=()=>{};measureGroup.add(s);});
  const el=document.createElement('div');el.className='mlabel';el.textContent=text;labelsDiv.appendChild(el);
  selLabels.push({el,getPos:()=>p1.clone().add(p2).multiplyScalar(.5)});
}
function updateLabels(){
  if(!selLabels.length)return;
  const r=renderer.domElement.getBoundingClientRect();
  selLabels.forEach(o=>{const p=o.getPos().clone().project(camera);o.el.style.left=((p.x*.5+.5)*r.width)+'px';o.el.style.top=((-p.y*.5+.5)*r.height)+'px';});
}
function recenter(e){
  const h=pick(e);if(!h||!controls)return;
  const p=h.point.clone(),off=camera.position.clone().sub(controls.target);
  controls.target.copy(p);camera.position.copy(p).add(off);controls.update();
}
function isolate(id){
  bodies.forEach(b=>{const on=(b.id===id);b.visible=on;b.mesh.visible=on;
    const f=doc.features.find(x=>x.id===b.ref);});
  doc.bodyVis={};bodies.forEach(b=>{doc.bodyVis[b.id]=b.visible;});markDirty();
  refreshParts();buildEdgeOverlay();refreshMirror();
}
function showAll2(){bodies.forEach(b=>{b.visible=true;b.mesh.visible=true;});doc.bodyVis={};doc.features.forEach(f=>f.visible=true);doc.sketches.forEach(s=>s.visible=true);markDirty();refreshParts();showAll();rebuild();}

/* ---------- menus contextuels ---------- */
let ctxTarget=null;
/* ---- clic droit → export STEP du SEUL corps (arbre + vue 3D) ----
   Le bouton est créé en JS (la coque HTML n'est jamais éditée à la main) et
   n'apparaît que pour un corps (visible via showCtx / showCtx3D). */
let ctxStepBtn=null, ctxStepBtn3d=null;
/* ---- menus : jamais coupés par le bord de l'écran --------------------------
   #ctxMenu / #ctxMenu3D sont position:fixed dans un body overflow:hidden : un
   menu ouvert en bas d'écran était ROGNÉ hors viewport et sa DERNIÈRE entrée
   (l'export STEP du corps, ajoutée après le bloc couleur/transparence de -003)
   devenait invisible — « le menu est ouvert mais je ne trouve plus l'entrée ».
   Le placement passe par ctxPlace : clamp testable en pur (ctxClampPos) +
   garde-fous CSS (max-height + scroll) injecté depuis JS (règle du dépôt :
   la coque ne s'édite jamais à la main). */
function ctxClampPos(x,y,w,h,vw,vh){
  const mx=Math.max(4,vw-w-4), my=Math.max(4,vh-h-4);
  return {left:Math.max(4,Math.min(+x||0,mx)), top:Math.max(4,Math.min(+y||0,my))};
}
function ctxPlace(el,x,y){
  try{
    el.style.left=x+'px';el.style.top=y+'px';
    const w=el.offsetWidth||0, h=el.offsetHeight||0;
    const vw=(typeof window!=='undefined'&&window.innerWidth)||0;
    const vh=(typeof window!=='undefined'&&window.innerHeight)||0;
    if(!(w>0&&h>0&&vw>0&&vh>0))return; // pas de mesure (harnais) : on garde x,y
    const p=ctxClampPos(x,y,w,h,vw,vh);
    el.style.left=p.left+'px';el.style.top=p.top+'px';
  }catch(e){}
}
(function ctxMenuMaxCss(){
  try{
    const st=document.createElement('style');
    st.textContent='#ctxMenu,#ctxMenu3D{max-height:calc(100vh - 8px);overflow-y:auto}';
    (document.head||document.documentElement).appendChild(st);
  }catch(e){}
})();
function showCtx(x,y,t){ctxTarget=t;$('ctxMenu').style.display='block';ctxPlace($('ctxMenu'),x,y);
  try{ if(ctxStepBtn)ctxStepBtn.style.display=(t&&t.kind==='body')?'':'none'; }catch(e){}
  // style du corps : le menu du CORPS porte la couleur et la transparence (même
  // source que le panneau et que la vue 3D) — masqué ailleurs, comme l'export STEP.
  try{ ctxStyleShow('ctxMenu',!!(t&&t.kind==='body')); ctxStyleSync(); }catch(e){}}
function hideCtx(){$('ctxMenu').style.display='none';}
function ctxBodyId(t){
  // Cible du clic-droit → CORPS conteneur. L'id affiché n'est PAS toujours celui
  // du corps (en mode maillage, le mesh porte l'id de sa fonction) : c'est CET id
  // qui sert à lire et à écrire la couleur et la transparence, partout.
  if(!t)return null;
  if(t.kind==='body'&&t.id){
    try{ if((doc.bodies||[]).some(e=>e&&e.id===t.id))return t.id; }catch(e){}
    let f=null;
    try{ f=(doc.features||[]).find(x=>x&&x.id===t.id); }catch(e){}
    if(f)return f.body||null;
    let rb=null;
    try{ rb=bodies.find(b=>b&&b.id===t.id); }catch(e){}
    if(rb)return bodyIdOfRuntime(rb);
    return null;
  }
  if(t.kind==='feature'){
    let f=null;
    try{ f=(doc.features||[]).find(x=>x&&x.id===t.id); }catch(e){}
    return f?(f.body||null):null;
  }
  return null;
}
function showCtx3D(x,y,bid){ctxTarget={kind:'body',id:bid};const _bd=bodies.find(b=>b.id===bid)||{name:'Pièce'};$('ctx3DTitle').textContent=_bd.name||'Pièce';
  try{ if(ctxStepBtn3d)ctxStepBtn3d.style.display=bid?'':'none'; }catch(e){}
  try{
    // ON LIT LA SOURCE, pas le matériau affiché : un fondu d'esquisse ou le cache
    // local changerait artificiellement l'affichage, pas la pièce.
    const _bid=ctxBodyId(ctxTarget);
    const _op=Math.round(bodyOpOf(_bid)*100);
    $('ctxColor').value=cssHex(bodyColorOf(_bid));
    $('ctxOp').value=_op;$('ctxOpV').textContent=_op+'%';
    ctxStyleShow('ctxMenu3D',!!(bid&&!_bd.ghost));
    ctxStyleSync();
  }catch(e){}
  $('ctxMenu3D').style.display='block';ctxPlace($('ctxMenu3D'),x,y);}
function hideCtx3D(){$('ctxMenu3D').style.display='none';}
document.querySelectorAll('#ctxMenu button').forEach(b=>b.onclick=()=>{
  const t=ctxTarget;hideCtx();if(!t)return;
  if(t.kind==='cg'){cgCtxAct(b.dataset.act,t);return;} // construction (79)
  if(b.dataset.act==='rename'){
    const n=prompt('Nouveau nom :',curName(t));if(!n)return;
    if(t.kind==='sketch')doc.sketches.find(s=>s.id===t.id).name=n;
    if(t.kind==='feature')doc.features.find(f=>f.id===t.id).name=n;
    if(t.kind==='body'){try{bodyEntry(t.id).name=n;dirty=true;}catch(e){}}
    markDirty();rebuild();renderProps();
  }
  if(b.dataset.act==='toggle'){
    if(t.kind==='plane'){setOriginVis(t.id,!originVis[t.id]);return;}
    if(t.kind==='sketch'){const s=doc.sketches.find(x=>x.id===t.id);s.visible=!(s.visible!==false);}
    if(t.kind==='feature'){const f=doc.features.find(x=>x.id===t.id);f.visible=!(f.visible!==false);}
    if(t.kind==='body'){try{bodyToggleVis(t.id);}catch(e){}return;}
    markDirty();rebuild();
  }
  if(b.dataset.act==='tl'){
    if(t.kind==='feature'){const f=doc.features.find(x=>x.id===t.id);if(f){tlSetPtr(f);markDirty();rebuild();renderTree();renderProps();}}
    return;
  }
  if(b.dataset.act==='tlclear'){
    if(tlMark!=null){tlSetPtr(null);markDirty();rebuild();renderTree();renderProps();}
    return;
  }
  if(b.dataset.act==='edit'){
    if(t.kind==='sketch')openSketch(t.id);
    if(t.kind==='feature'){const f=doc.features.find(x=>x.id===t.id);if(f&&tlLocked(f)){tlSetPtr(null);markDirty();rebuild();}if(f&&f.sketchId)openSketch(f.sketchId);}
  }
  if(b.dataset.act==='del'){
    if(t.kind==='body'){delBody(t.id);return;} // confirme + cascade + rebuild lui-même
    if(!confirm('Supprimer ?'))return;
    if(t.kind==='sketch'){doc.sketches=doc.sketches.filter(s=>s.id!==t.id);doc.features=doc.features.filter(f=>f.sketchId!==t.id);}
    if(t.kind==='feature'){delFeature(doc.features.find(x=>x.id===t.id));}
    sel={kind:null,id:null};markDirty();rebuild();renderProps();
  }
});
document.querySelectorAll('#ctxMenu3D button').forEach(b=>b.onclick=()=>{
  const t=ctxTarget;hideCtx3D();if(!t)return;const bd=bodies.find(x=>x.id===t.id);if(!bd)return;
  if(b.dataset.act==='hide'){bd.visible=false;bd.mesh.visible=false;refreshParts();buildEdgeOverlay();}
  // 👻 = preset de la SLIDER (25 %) : il écrit la même fiche que le curseur et le
  // panneau du corps, il n'y a donc plus d'opacité « à part » qui se désynchronise.
  if(b.dataset.act==='ghost')ctxSetBodyOp(25,true);
  if(b.dataset.act==='isolate')isolate(bd.id);
  if(b.dataset.act==='showall')showAll2();
});
/* ---- export STEP du corps : la shape vient de perBody (occFinalShape), donc
   SEULEMENT ce corps — jamais le composé de tous les corps. ---- */
async function ctxExportStep(bid){
  let nm='corps';
  try{ nm=(bodyEntryOf(bid)||{}).name||bid||'corps'; }catch(e){}
  let FR=null;
  try{
    if(!occHas())throw new Error('OCCT indisponible (chargement en cours ou échec — servez la page en http://)');
    faceEl.textContent='Export STEP « '+nm+' » : pré-test…';
    const pok=(await occExportPreflight());
    if(!pok[0])throw new Error(pok[1]||'pré-test impossible');
    FR=occFinalShape();
    const pb=(FR.perBody||[]).filter(p=>p.bodyId===bid);
    if(!pb.length)throw new Error('rien à exporter : aucune fonction visible de ce corps dans le rejeu (⏻ éteint ?)');
    const path='/b.stp'; // chemin court fixe (cf. /o.stp de l'export global)
    try{occt.FS.unlink(path);}catch(e){}
    const bytes=occWriteStep(pb.map(p=>p.shape),path);
    const blob=new Blob([bytes],{type:'application/step'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=String(nm).replace(/[\\/:*?"<>|]+/g,'-')+'.step';
    a.click();
    setTimeout(()=>{try{URL.revokeObjectURL(a.href);}catch(e){}},2000);
    try{occt.FS.unlink(path);}catch(e){}
    faceEl.textContent='STEP « '+nm+' » exporté ('+(bytes.length/1024).toFixed(1)+' Ko).';
  }catch(e){
    const msg=String((e&&e.message)||e||'erreur');
    faceEl.textContent='Export STEP « '+nm+' » : '+msg;
    try{alert('Export STEP de « '+nm+' » impossible : '+msg);}catch(_){}
  }finally{
    try{ if(FR)occCleanup(FR,null); }catch(e){}
  }
}
function ctxStepBtnMake(menuId){
  try{
    const b=document.createElement('button');
    b.dataset.act='step';
    b.textContent='⬇ Exporter ce corps en STEP';
    b.title='Géométrie exacte (OCCT) de SEULEMENT ce corps : téléchargement du fichier .step.';
    b.onclick=function(){
      const t=ctxTarget;
      try{ if(menuId==='ctxMenu')hideCtx(); else hideCtx3D(); }catch(e){}
      if(!t||t.kind!=='body'||!t.id)return;
      // En mode maillage l'id cliqué est celui de la FONCTION : le corps conteneur
      // est celui que perBody connaît (bodyId) — sans quoi aucun solide n'est trouvé.
      let cid=null;try{cid=ctxBodyId(t);}catch(e){}
      ctxExportStep(cid||t.id);
    };
    $(menuId).appendChild(b);
    return b;
  }catch(e){ return null; }
}
/* ── Style du corps dans les DEUX menus : deux miroirs d'une seule source ─────
   La coque de la vue 3D porte déjà la rangée « couleur » et la rangée
   « transparence » ; on lui ajoute le nuancier. Le menu de l'arbre est monté EN
   JS (règle du dépôt : on ne touche jamais la coque à la main). Une seule paire
   de fonctions écrit dans doc.bodies[] — donc panneau, arbre et vue 3D ne peuvent
   plus diverger, et il n'y a plus de bouton « Auto ». */
function ctxSetBodyColor(c,commit){
  try{
    const bid=ctxBodyId(ctxTarget);
    if(!bid||!(c>0))return;
    setBodyColor(bid,c);           // source unique
    applyBodyStyleLive(bid);       // écran immédiat, aucun rejeu
    try{renderTree();}catch(e){}
    ctxStyleSync();                // l' AUTRE miroir suit
    if(commit){markDirty();try{renderProps();}catch(e){}}
  }catch(e){}
}
function ctxSetBodyOp(pct,commit){
  try{
    const bid=ctxBodyId(ctxTarget);
    if(!bid)return;
    const v=Math.max(15,Math.min(100,Math.round(+pct||100)));
    setBodyOp(bid,v/100);          // source unique
    applyBodyStyleLive(bid);
    ctxStyleSync();
    if(commit){markDirty();try{renderProps();}catch(e){}}
  }catch(e){}
}
function ctxSetBodyGlass(pct,commit){
  // 2026-10-16-011 : transparence VRAIE depuis le clic droit (même source que le panneau)
  try{
    const bid=ctxBodyId(ctxTarget);if(!bid)return;
    const v=Math.max(0,Math.min(90,Math.round(+pct||0)));
    setBodyGlass(bid,1-v/100);applyBodyStyleLive(bid);try{buildEdgeOverlay();}catch(e){}
    ctxStyleSync();
    if(commit){markDirty();try{renderProps();}catch(e){}}
  }catch(e){}
}
function ctxGlassRow(menu){
  const ro=document.createElement('div');ro.className='ctxRow';
  const io=document.createElement('span');io.title='Transparence (on voit l’intérieur, identique au panneau)';io.textContent='🫧';ro.appendChild(io);
  const gi=document.createElement('input');gi.type='range';gi.min='0';gi.max='90';gi.value='0';gi.title='Transparence du corps';
  const gv=document.createElement('span');gv.className='ctxOpV';gv.textContent='0%';
  ro.appendChild(gi);ro.appendChild(gv);
  gi.addEventListener('input',()=>ctxSetBodyGlass(gi.value,false));
  gi.addEventListener('change',()=>ctxSetBodyGlass(gi.value,true));
  ctxStyleReg.push({menu,wrap:ro,g:gi,gv});
  return ro;
}
(function ctxStyleInit(){
  try{
    const wire=(c,o)=>{
      const hex=()=>{const m=/^#?([0-9a-fA-F]{6})$/.exec(String(c.value||'').trim());return m?parseInt(m[1],16):null;};
      c.addEventListener('input',()=>{const v=hex();if(v!=null)ctxSetBodyColor(v,false);});
      c.addEventListener('change',()=>{const v=hex();if(v!=null)ctxSetBodyColor(v,true);});
      o.addEventListener('input',()=>ctxSetBodyOp(o.value,false));
      o.addEventListener('change',()=>ctxSetBodyOp(o.value,true));
    };
    // 1) vue 3D — rangées existantes dans la coque + nuancier inséré entre elles
    const c3=$('ctxColor'),o3=$('ctxOp'),v3=$('ctxOpV');
    if(c3&&o3&&c3.parentElement&&o3.parentElement){
      const host=c3.parentElement.parentElement;
      const sw=swatchRow(hx=>ctxSetBodyColor(hx,true),'ctxRow');
      if(host&&host.insertBefore)host.insertBefore(sw,o3.parentElement);
      ctxStyleReg.push({menu:'ctxMenu3D',wrap:c3.parentElement,c:c3,o:o3,v:v3});
      ctxStyleReg.push({menu:'ctxMenu3D',wrap:sw,s:sw});
      wire(c3,o3);
      o3.title='Intensité du corps';try{o3.previousElementSibling.title='Intensité (estompe la pièce sur le fond)';}catch(e){}
      const g3=ctxGlassRow('ctxMenu3D');if(host&&host.insertBefore)host.insertBefore(g3,o3.parentElement.nextSibling);
    }
    // 2) arbre — rangées fabriquées en JS, en bas du menu
    const menu=$('ctxMenu');
    if(menu){
      const wrap=document.createElement('div');wrap.className='ctxWrap';
      const rc=document.createElement('div');rc.className='ctxRow';
      const ic=document.createElement('span');ic.title='Couleur du corps (la même partout)';ic.textContent='🎨';rc.appendChild(ic);
      const ci=document.createElement('input');ci.type='color';ci.value='#0a84ff';ci.title='Couleur du corps';
      rc.appendChild(ci);
      const sw=swatchRow(hx=>ctxSetBodyColor(hx,true),'ctxRow');
      const ro=document.createElement('div');ro.className='ctxRow';
      const io=document.createElement('span');io.title='Intensité du corps (estompe la pièce sur le fond)';io.textContent='🔆';ro.appendChild(io);
      const oi=document.createElement('input');oi.type='range';oi.min='15';oi.max='100';oi.value='100';
      const ov=document.createElement('span');ov.className='ctxOpV';ov.textContent='100%';
      ro.appendChild(oi);ro.appendChild(ov);
      wrap.appendChild(rc);wrap.appendChild(sw);wrap.appendChild(ro);wrap.appendChild(ctxGlassRow('ctxMenu'));
      menu.appendChild(wrap);
      ctxStyleReg.push({menu:'ctxMenu',wrap:wrap,c:ci,o:oi,v:ov});
      ctxStyleReg.push({menu:'ctxMenu',wrap:wrap,s:sw});
      wire(ci,oi);
    }
  }catch(e){}
})();
// Créés APRÈS les deux boucles ci-dessus : la boucle du runtime ne les voit donc
// pas (aucun écrasement de onclick) et le stub de test ne la passe pas non plus.
ctxStepBtn=ctxStepBtnMake('ctxMenu');
ctxStepBtn3d=ctxStepBtnMake('ctxMenu3D');
const curName=t=>{if(t.kind==='plane')return 'Plan '+t.id;if(t.kind==='cg')return (cgGet(t.id)||{}).name;if(t.kind==='sketch')return(doc.sketches.find(s=>s.id===t.id)||{}).name;if(t.kind==='feature')return(doc.features.find(f=>f.id===t.id)||{}).name;if(t.kind==='body')return String((bodies.find(b=>b.id===t.id)||{}).name||'').replace(/ · .*$/,'');return'';};

/* ---------- coupe ---------- */
function applyClip(){
  const on=$('clipOn').checked;
  if(on){const pos=parseFloat($('clipPos').value)||0;
    const flip=$('clipFlip').checked?-1:1;
    clipPlane=new THREE.Plane(new THREE.Vector3(0,0,-flip),flip*pos); // Z = hauteur
  }else clipPlane=null;
  bodies.forEach(b=>{b.mesh.material.clippingPlanes=clipPlane?[clipPlane]:null;b.mesh.material.needsUpdate=true;});
}

/* ---------- import / export ---------- */
// ── Géométrie vivante des imports (STEP / STL) ───────────────────────────────
// Un import n'a AUCUNE forme paramétrique : sa géométrie EST le mesh `f._mesh`,
// réutilisé tel quel à chaque rejeu. Trois pièges, tous corrigés ici :
//   1) `commitPrev()` / `clearBodies()` retiraient ce mesh de la scène à chaque rejeu
//      → le STEP disparaissait dès la création d'une esquisse (bodies le contient
//      toujours, l'objet n'est plus dans la scène). → importMeshesOfDoc().
//   2) `docSnap()` strippe `_mesh` (JSON) → annuler/rétablir rendait le corps fantôme
//      (entrée présente, rien d'affiché). → importHydrate() le re-broche.
//   3) le shape OCCT était détruit en fin d'import → classification des arêtes
//      tangentes impossible ensuite. → calculée tant qu'il vit, stockée ICI.
//   4) il n'était plus conservé DU TOUT → la voie exacte n'avait rien à unir ni à
//      soustraire (« découpe dans le vide » sur un STEP). → `entry.brep`, libéré
//      par la purge de la table comme le mesh.
// Table délibérément hors `doc` : jamais sérialisée, jamais dans `docHash`,
// jamais par instantané d'annulation — elle survit à tout rechargement d'état.
// Propriété : le mesh est LA TABLE qui en décide — il est libéré exactement quand
// son entrée est retirée (id absent de doc.features ET de toutes les piles
// d'annulation), donc jamais pendant un aller-retour annuler/rétablir.
const importGeom=new Map(); // id fonction -> {mesh, edges, faoGeo, brep}
function importMeshesOfDoc(){
  // Meshes des imports ENCORE DANS LE DOCUMENT : à afficher, donc à préserver.
  const s=new Set();
  try{
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='import')return;
      if(f._mesh)s.add(f._mesh);
      const e=importGeom.get(f.id);if(e&&e.mesh)s.add(e.mesh);
    });
  }catch(e){}
  return s;
}
function importOwnedMeshes(){
  // Tous les meshes entretenus par la table (dont ceux d'une fonction momentanément
  // annulée : ni affichés, mais RÉUTILISABLES au retour → jamais libérés ici).
  const s=new Set();
  try{for(const e of importGeom.values())if(e&&e.mesh)s.add(e.mesh);}catch(e){}
  return s;
}
function importIdStillReachable(id){
  // Annuler retire la fonction du document mais son instantané (JSON) la remettra
  // peut-être : tant que l'id existe dans une pile, la géométrie doit rester.
  try{
    const piles=[docUndoStack,docRedoStack];
    for(const p of piles){
      if(!p)continue;
      for(let i=0;i<p.length;i++){const e=p[i];if(e&&typeof e.snap==='string'&&e.snap.indexOf(id)>=0)return true;}
    }
  }catch(e){}
  return false;
}
function importHydrate(){
  // Re-broche `_mesh` (un instantané d'annulation l'a stripé) et libère les entrées
  // dont la fonction n'existe plus nulle part.
  const vivant=new Set();
  try{
    (doc.features||[]).forEach(f=>{
      if(!f||f.type!=='import')return;
      vivant.add(f.id);
      if(f._mesh){if(!importGeom.has(f.id))importGeom.set(f.id,{mesh:f._mesh});}
      else{const e=importGeom.get(f.id);if(e&&e.mesh)f._mesh=e.mesh;}
    });
  }catch(e){}
  for(const id of Array.from(importGeom.keys())){
    if(vivant.has(id)||importIdStillReachable(id))continue;
    const e=importGeom.get(id);importGeom.delete(id);
    try{if(e&&e.mesh&&e.mesh.geometry)e.mesh.geometry.dispose();}catch(_){}
    try{if(e&&e.faoGeo&&e.faoGeo.dispose)e.faoGeo.dispose();}catch(_){}
    try{if(e&&e._faoGeoFine&&e._faoGeoFine.dispose)e._faoGeoFine.dispose();}catch(_){}
    try{if(e&&e.brep)e.brep.delete();}catch(_){} // solide exact : même vie que le mesh
  }
}
$('btnImport').onclick=()=>$('fileImport').click();
$('fileImport').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  if(/\.stou?l$/i.test(f.name)){await importSTL(f);}
  else{await importSTEP(f);}
  e.target.value='';
});
/* ---------- 2026-10-15-004 : la SOURCE d'un import est persistée ----------
   Retour : « quand on sauvegarde la pièce avec le STEP et des usinages, le fichier
   n'est pas rechargé car manquant. Pourtant le .miniFusion fait 30 Mo ! » — les
   30 Mo étaient les trajectoires ; la géométrie importée n'était JAMAIS écrite
   (deserialise la jetait, avec l'alerte « réimportez le STEP/STL »).
   Désormais : les octets du fichier d'origine sont gardés (mémoire + IndexedDB,
   clé = empreinte du contenu) ; la fonction import ne porte que la référence
   f.src={fmt,key,size,file} — le JSON du document, l'autosave et les instantanés
   d'annulation restent légers. Le .miniFusion EMBARQUE ces octets (base64) : à
   l'ouverture, le STEP est rejoué avec le MÊME id de fonction, donc le corps, les
   enlèvements et les opérations FAO qui le visent retrouvent leur cible.
   Anciens fichiers (sans source) : la fonction est conservée « à réimporter » ;
   importer un fichier du même nom la rebranche (même id, usinages conservés). */
const importSrc=new Map(); // 'impsrc:<empreinte>' -> Uint8Array (fichier d'origine)
function importSrcKey(u8){
  let h=2166136261;for(let i=0;i<u8.length;i++){h^=u8[i];h=Math.imul(h,16777619);}
  return 'impsrc:'+(h>>>0).toString(36)+'_'+u8.length;
}
function importU8ToB64(u8){
  let out='';const CH=0x8000;
  for(let i=0;i<u8.length;i+=CH)out+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));
  return btoa(out);
}
function importB64ToU8(b64){
  const t=atob(b64);const u=new Uint8Array(t.length);
  for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);
  return u;
}
async function importSrcPut(key,u8){
  importSrc.set(key,u8);
  try{await idbSet(key,u8);}catch(e){} // F5 / autosave : relu depuis l'IndexedDB
}
async function importSrcGet(key){
  if(importSrc.has(key))return importSrc.get(key);
  try{
    const v=await idbGet(key);
    if(v){const u=(v instanceof Uint8Array)?v:new Uint8Array(v.buffer||v);importSrc.set(key,u);return u;}
  }catch(e){}
  return null;
}
function importPlaceholder(name){
  // Fonction import d'un ancien fichier, restée sans géométrie : même nom → on s'y
  // rebranche ; sinon, s'il n'en reste qu'UNE, on propose (le nom du fichier sur le
  // disque diffère souvent : « Cavité(Symétrie miroir) » ↔ « Cavité.step »).
  const att=(doc.features||[]).filter(f=>f&&f.type==='import'&&!f._mesh&&!importGeom.has(f.id));
  const m=att.find(f=>f.name===name);
  if(m)return m;
  if(att.length===1&&confirm('Rebrancher « '+name+' » sur l\'import manquant « '+att[0].name+' » ?\n(usinages et opérations qui le visent conservés)\n\nAnnuler = l\'ajouter comme nouvel import.'))return att[0];
  return null;
}
function importAttach(name,fmt,u8,entry,fileName){
  // Fonction import : nouvelle, ou rebranchement d'une fonction « à réimporter ».
  const key=importSrcKey(u8);
  importSrcPut(key,u8); // mémoire immédiate ; écriture IndexedDB en tâche de fond (l'import n'attend pas)
  const src={fmt,key,size:u8.length,file:fileName};
  const ph=importPlaceholder(name);
  if(ph){
    docPushUndo('réimport '+name);
    ph.src=src;ph._mesh=entry.mesh;importGeom.set(ph.id,entry);
    sel={kind:'feature',id:ph.id};
    markDirty();builtVersion=-1;builtHash=null;rebuild();showAll();
    return ph.id;
  }
  const id=uid('im');
  importGeom.set(id,entry);
  addFeature({id,type:'import',name,visible:true,_mesh:entry.mesh,src});
  return id;
}
function importStlBuild(u8){
  const geo=parseSTL(u8.buffer.slice(u8.byteOffset,u8.byteOffset+u8.byteLength));
  if(!geo)throw new Error('STL illisible');
  // centre la pièce
  geo.computeBoundingBox();const c=geo.boundingBox.getCenter(new THREE.Vector3());geo.translate(-c.x,-c.y,-c.z);
  return {mesh:new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x0a84ff}))};
}
async function importSTL(file){
  const u8=new Uint8Array(await file.arrayBuffer());
  let entry;try{entry=importStlBuild(u8);}catch(e){alert('STL illisible.');return;}
  const id=importAttach(file.name.replace(/\.[^.]+$/,''),'stl',u8,entry,file.name);
  sel={kind:'feature',id};markDirty();rebuild();showAll();
}
let _importRestoring=false;
async function importRestorePending(){
  // Rejoue les imports du document à partir de leur source persistée. Appelée à
  // l'ouverture (deserialise) et quand le noyau OCCT devient prêt (F5).
  if(_importRestoring)return 0;
  const todo=(doc.features||[]).filter(f=>f&&f.type==='import'&&!f._mesh&&!importGeom.has(f.id)&&f.src&&f.src.key);
  if(!todo.length)return 0;
  if(todo.some(f=>f.src.fmt!=='stl')&&!occHas())return 0; // occtFinishBoot relancera
  _importRestoring=true;let n=0;const miss=[];
  try{
    for(const f of todo){
      const u8=await importSrcGet(f.src.key);
      if(!u8){miss.push(f.name);continue;}
      if(!(doc.features||[]).includes(f))continue; // document remplacé entre-temps
      try{
        const e=(f.src.fmt==='stl')?importStlBuild(u8):importStepBuild(u8);
        importGeom.set(f.id,e);f._mesh=e.mesh;n++;
      }catch(err){miss.push(f.name);}
    }
  }finally{_importRestoring=false;}
  if(n){builtVersion=-1;builtHash=null;builtEngine=null;rebuild();if(!viewUserMoved)showAll();}
  if(miss.length)try{faceEl.textContent='Import(s) sans source : '+miss.join(', ')+' — réimportez le fichier (même nom : il se rebranche sur la fonction existante).';}catch(e){}
  return n;
}
function parseSTL(buf){
  try{
    const dv=new DataView(buf);let off=0;
    const txt=new TextDecoder().decode(buf.slice(0,80));
    if(txt.trim().startsWith('solid')){
      const s=new TextDecoder().decode(buf);const vs=[];
      const re=/vertex\s+([-\d.e+]+)\s+([-\d.e+]+)\s+([-\d.e+]+)/gi;let m;
      while((m=re.exec(s))){vs.push(parseFloat(m[1]),parseFloat(m[2]),parseFloat(m[3]));}
      if(vs.length>=9){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));g.computeVertexNormals();return g;}
    }
    const n=dv.getUint32(80,true);const pos=new Float32Array(n*9);
    for(let i=0;i<n;i++){const b=84+i*50;
      pos[i*9]=dv.getFloat32(b,true);pos[i*9+1]=dv.getFloat32(b+4,true);pos[i*9+2]=dv.getFloat32(b+8,true);
      pos[i*9+3]=dv.getFloat32(b+12,true);pos[i*9+4]=dv.getFloat32(b+16,true);pos[i*9+5]=dv.getFloat32(b+20,true);
      pos[i*9+6]=dv.getFloat32(b+24,true);pos[i*9+7]=dv.getFloat32(b+28,true);pos[i*9+8]=dv.getFloat32(b+32,true);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.computeVertexNormals();return g;
  }catch(e){return null;}
}
async function importSTEP(file){
  if(!occHas()){alert('Moteur STEP (OCCT) pas encore chargé — réessayez dans quelques secondes (page servie en http:// de préférence).\nEn attendant : import STL OK, extrusions OK.');return;}
  try{
    const u8=new Uint8Array(await file.arrayBuffer());
    const entry=importStepBuild(u8);
    importAttach(file.name.replace(/\.[^.]+$/,''),'step',u8,entry,file.name);
    markDirty();rebuild();showAll();
    faceEl.textContent='STEP importé : '+file.name;
  }catch(e){alert('Import STEP impossible : '+e.message);}
}
function importStepBuild(u8){
  // Octets STEP -> {mesh, faoGeo, edges, brep}. Synchrone, déterministe : le
  // rejeu d'un document redonne EXACTEMENT les mêmes triangles qu'à l'import.
  {
    const path='/i.stp'; // chemin court fixe (cf. export)
    try{occt.FS.unlink(path);}catch(e){}
    occt.FS.writeFile(path,u8);
    const reader=new occt.STEPControl_Reader_1();
    reader.ReadFile(path); // statut passé en revue via NbRootsForTransfer
    if(reader.NbRootsForTransfer()<1)throw new Error('aucun solide transférable');
    reader.TransferRoots();const shape=reader.OneShape();
    // FAO : la définition HISTORIQUE de l'import (0,5 mm / 0,5 rad), posée AVANT la
    // finesse d'affichage. Le noyau ne retesselle JAMAIS vers plus grossier : si l'on
    // commençait par le maillage fin, la demande grossière réutiliserait le fin et
    // l'outillage verrait d'autres triangles qu'aujourd'hui.
    let faoGeo=null;
    try{faoGeo=occTessellate(shape,0.5,0.5);}catch(e){faoGeo=null;}
    // MÊME déflection d'affichage que le natif (occDisplayDefl) : finesse commune,
    // ombrage identique, budget de triangles borné. Avant : 0,5 mm fixe + 0,5 rad,
    // donc un STEP toujours plus grossier qu'une pièce native.
    const D=occDisplayDefl(shape);
    const g=occTessellateBudget(shape,D,OCC_DISPLAY_TRIS)||occTessellate(shape,D.lin,D.ang);
    if(!g||!g.attributes.position.count)throw new Error('tessellation vide');
    const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x0a84ff}));
    const entry={mesh};
    if(faoGeo)entry.faoGeo=faoGeo; // géométrie réservée à l'outillage (voir la fin du fichier)
    // Arêtes tangentes : besoin des FACES et de leur continuité (C0/G1). Le shape est
    // détruit juste en dessous (shape.delete()) — on les classe DONC ICI, une fois pour
    // toutes, et on les range dans la table. Sans ça, l'overlay « Arêtes » ne couvrait
    // jamais un STEP : le repli ne dessinait que des vives > 30°, tout en noir.
    try{const E=occSharpEdges(shape);if(E&&E.length)entry.edges=E;}catch(e){}
    // SOLIDE EXACT CONSERVÉ : sans lui, la voie exacte n'avait RIEN à unir ni à
    // soustraire (le mesh n'est pas un solide) — « Uni » restait deux pièces et
    // « Soustraction » tombait dans le vide. Le BRep reste la PROPRIÉTÉ de la table :
    // occReplayBody en prend une COPIE, jamais l'original (libéré ici, à la purge).
    entry.brep=shape;
    try{reader.delete();}catch(e){}
    try{occt.FS.unlink(path);}catch(e){}
    return entry; // {mesh, edges, faoGeo, brep}
  }
}
/* ============ FAO : « corps blindés » (phase 4) ==============================
   L'affichage est désormais plus fin (occDisplayDefl + budget de triangles, phase 3)
   et 88-fao fabrique son maillage plan de posage en lisant les positions du mesh
   AFFICHÉ : sans intervention, un corps exact ou un import STEP donnerait d'autres
   triangles → autre G-code, et au-delà de 120 000 triangles le corps serait
   silencieusement EXCLU du posage (faoMeshFromBody renvoie null).
   On intercèpe donc faoMeshFromBody (déclaré en 88, appelé par faoActiveMesh) :
   la FAO reçoit la géométrie aux paramètres D'AUJOURD'HUI — occXDefl() pour un
   corps exact (le paramètre d'outillage n'a pas bougé), 0,5 mm/0,5 rad pour un
   import STEP (entry.faoGeo). Les autres corps (repli maillage, aperçus, fantômes)
   passent par l'ancienne fonction, strictement inchangée.
   Libération : b._faoGeo par clearBodies()/commitPrev(), entry.faoGeo par
   importHydrate() (entrées purgées). */
const _faoMeshFromBodyOrig=(typeof faoMeshFromBody==='function')?faoMeshFromBody:null;
function faoLegacyGeo(b){
  // Geometry d'OUTILLAGE d'un corps exact, en cache sur le corps.
  if(!b||b.kind!=='body'||!b.shape)return null;
  if(b._faoGeo)return b._faoGeo;
  let g=null;
  try{
    // Le shape est déjà maillé en AFFICHAGE (plus fin) : BRepMesh réutilise un
    // maillage existant s'il est au moins aussi fin → on l'efface, sinon la FAO
    // récupérerait la finesse d'affichage au lieu de sa définition historique.
    try{occt.BRepTools.Clean(b.shape);}catch(e){}
    const D=occXDefl();
    g=occTessellate(b.shape,D.lin,D.ang);
  }catch(e){g=null;}
  if(!g)return null;
  b._faoGeo=g;
  return g;
}
faoMeshFromBody=function(b){
  // Seule la lecture du mesh change : on redonne l'ANCIENNE géométrie à la
  // fonction d'origine via un corps factice {mesh:{geometry,matrixWorld}}.
  try{
    if(b&&b.kind==='import'&&_faoMeshFromBodyOrig){
      const e=importGeom.get(b.id);
      if(e&&e.faoGeo)return _faoMeshFromBodyOrig({mesh:{geometry:e.faoGeo,matrixWorld:b.mesh&&b.mesh.matrixWorld}});
    }else if(b&&b.kind==='body'&&b.shape&&_faoMeshFromBodyOrig){
      const g=faoLegacyGeo(b);
      if(g)return _faoMeshFromBodyOrig({mesh:{geometry:g,matrixWorld:b.mesh&&b.mesh.matrixWorld}});
    }
  }catch(e){}
  return _faoMeshFromBodyOrig?_faoMeshFromBodyOrig(b):null;
};
function occFsDiag(){
  // Photo du FS interne pour diagnostiquer (console F12).
  try{
    const L={cwd:'?',root:[],wrk:'?'};
    try{L.cwd=occt.FS.cwd();}catch(e){L.cwd='ERR '+e.message;}
    try{L.root=occt.FS.readdir('/').slice(0,20);}catch(e){L.root=['ERR '+e.message];}
    try{L.wrk=occt.FS.readdir(L.cwd).slice(0,20);}catch(e){L.wrk=['ERR '+e.message];}
    try{console.log('[OCCT-FS]',JSON.stringify(L));}catch(e){}
    return L;
  }catch(e){return null;}
}
function occWriteStep(shapes,path){
  // shapes : liste de TopoDS_Shape -> octets STEP via le FS OCCT. Chaque étape est vérifiée.
  const RD=occt.IFSelect_ReturnStatus;
  const wr=new occt.STEPControl_Writer_1();
  const AsIs=occt.STEPControl_StepModelType.STEPControl_AsIs;
  shapes.forEach((s,i)=>{
    let st=null;
    try{st=wr.Transfer(s,AsIs,true);}catch(e){throw new Error(`transfert ${i} impossible (${e.message||e})`);}
    if(st!==RD.IFSelect_RetDone)throw new Error(`transfert ${i} refusé par le noyau`);
  });
  let wst=null;
  try{wst=wr.Write(path);}catch(e){occFsDiag();throw new Error(`écriture impossible (${e.message||e}) — voir console F12 [OCCT-FS]`);}
  let bytes=null;
  try{bytes=occt.FS.readFile(path);}catch(e){bytes=null;} // lecture AVANT toute libération
  try{wr.delete();}catch(e){}
  if(wst!==RD.IFSelect_RetDone){occFsDiag();throw new Error(`écriture refusée par le noyau — voir console F12 [OCCT-FS]`);}
  let ok=false;
  try{ok=!!occt.FS.analyzePath(path).exists;}catch(e){ok=false;}
  if(bytes&&bytes.length>1000)return bytes;
  if(!ok){
    // Ultime recours : balaye le FS pour retrouver le fichier (CWD inattendu ?).
    let seen='';
    try{
      const walk=(d)=>{
        for(const n of occt.FS.readdir(d)){
          if(n==='.'||n==='..')continue;
          const p=(d==='/'?'':d)+'/'+n;
          try{
            const st=occt.FS.stat(p);
            if(st&&st.size>0&&/\.stp$/i.test(p)){seen=p;return true;}
            if(occt.FS.isDir&&occt.FS.isDir(st.mode)){if(walk(p))return true;}
          }catch(e){}
        }
        return false;
      };
      walk('/');
    }catch(e){}
    try{console.log('[OCCT-FS] fichier cherché : '+path+' · autre .stp trouvé : '+(seen||'aucun'));}catch(e){}
    if(seen){
      try{return occt.FS.readFile(seen);}
      catch(e){throw new Error(`fichier retrouvé ailleurs (${seen}) mais illisible`);}
    }
    throw new Error('fichier non créé ('+path+') — console F12 : [OCCT-FS]');
  }
  try{return occt.FS.readFile(path);}
  catch(e){throw new Error(`lecture du fichier interne impossible (${e.message||e})`);}
}
async function occExportPreflight(){
  // 1) FS JS, 2) écriture C++ d'une boîte témoin. Retourne [ok, détail].
  try{occt.FS.writeFile('/pre_t.txt','hello');}
  catch(e){return[false,'FS interne inscriptible ? NON ('+e.message+')'];}
  let rd=null;
  try{rd=occt.FS.readFile('/pre_t.txt');}catch(e){return[false,'FS lecture impossible ('+e.message+')'];}
  if(!rd||rd.length!==5)return[false,'FS lecture incohérente'];
  try{occt.FS.unlink('/pre_t.txt');}catch(e){}
  try{
    const RD=occt.IFSelect_ReturnStatus;
    const b=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),10,10,10);
    b.Build();
    const wr=new occt.STEPControl_Writer_1();
    wr.Transfer(b.Shape(),occt.STEPControl_StepModelType.STEPControl_AsIs,true);
    const st=wr.Write('/pre_b.stp');
    try{b.delete();}catch(e){}try{wr.delete();}catch(e){}
    if(st!==RD.IFSelect_RetDone)return[false,'Write boîte refusé par le noyau'];
    let ex=false;try{ex=!!occt.FS.analyzePath('/pre_b.stp').exists;}catch(e){}
    if(!ex)return[false,'Write boîte OK mais fichier absent (traversée des noms rompue — rechargez la page)'];
    let n=0;try{n=occt.FS.readFile('/pre_b.stp').length;}catch(e){}
    try{occt.FS.unlink('/pre_b.stp');}catch(e){}
    if(!(n>1000))return[false,'boîte écrite mais vide'];
    return[true,'pré-test OK'];
  }catch(e){return[false,'boîte témoin : '+(e.message||e)];}
}
$('btnExportStep').onclick=async()=>{
  if(!occHas()){alert('Export STEP exact nécessite OCCT (chargement en cours ou échec — servez la page en http://). Export STL/OBJ dispo.');return;}
  faceEl.textContent='Export STEP : pré-test…';
  const[pok,pdetail]=await occExportPreflight();
  try{console.log('[STEP-OUT] pré-test : '+pdetail);}catch(e){}
  if(!pok){alert('Export STEP impossible : '+pdetail+'.');faceEl.textContent='Export STEP : '+pdetail;return;}
  try{
    // Exporte le solide exact : même pipeline que l'affichage (prismes + booléens + congés exacts).
    const FR=occFinalShape();
    if(!FR.shape){alert('Solide vide, rien à exporter.');return;}
    const path='/o.stp'; // chemin court fixe (les chemins longs échouent dans certains onglets)
    try{occt.FS.unlink(path);}catch(e){}
    try{console.log('[STEP-OUT] path='+JSON.stringify(path)+' typeof='+(typeof path)+' cwd='+occt.FS.cwd()+' avant='+occt.FS.readdir('/').slice(0,12).join(','));}catch(e){}
    const bytes=occWriteStep([FR.shape],path);
    try{console.log('[STEP-OUT] après='+occt.FS.readdir('/').slice(0,12).join(','));}catch(e){}
    const blob=new Blob([bytes],{type:'application/step'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(doc.name||'piece')+'.step';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000);
    try{occt.FS.unlink(path);}catch(e){}
    occCleanup(FR,null);
    faceEl.textContent='STEP exact exporté ('+(bytes.length/1024).toFixed(1)+' Ko).';
  }catch(e){alert('Export STEP impossible : '+e.message);}
};
$('btnExportStl').onclick=()=>downloadMesh('stl');
$('btnExportObj').onclick=()=>downloadMesh('obj');
function downloadMesh(fmt){
  const vis=bodies.filter(b=>b.visible&&!b.ghost);if(!vis.length){alert('Rien à exporter (que des outils de découpe ?).');return;}
  let blob;
  if(fmt==='stl')blob=new Blob([meshesToSTL(vis.map(b=>b.mesh))],{type:'model/stl'});
  else blob=new Blob([meshesToOBJ(vis.map(b=>b.mesh))],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(doc.name||'piece')+'.'+fmt;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function meshesToSTL(meshes){
  let count=0;meshes.forEach(m=>{const g=m.geometry;count+= (g.index?g.index.count:g.attributes.position.count)/3;});
  const buf=new ArrayBuffer(84+count*50);const dv=new DataView(buf);
  dv.setUint32(80,count,true);let off=84;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3();
  meshes.forEach(m=>{m.updateMatrixWorld(true);const g=m.geometry;const p=g.attributes.position;const idx=g.index;
    const triN=(idx?idx.count:p.count)/3;
    for(let i=0;i<triN;i++){
      const ia=idx?idx.getX(i*3):i*3,ib=idx?idx.getX(i*3+1):i*3+1,ic=idx?idx.getX(i*3+2):i*3+2;
      a.fromBufferAttribute(p,ia).applyMatrix4(m.matrixWorld);b.fromBufferAttribute(p,ib).applyMatrix4(m.matrixWorld);c.fromBufferAttribute(p,ic).applyMatrix4(m.matrixWorld);
      e1.subVectors(b,a);e2.subVectors(c,a);n.crossVectors(e1,e2).normalize();
      dv.setFloat32(off,n.x,true);dv.setFloat32(off+4,n.y,true);dv.setFloat32(off+8,n.z,true);
      [a,b,c].forEach((v,k)=>{dv.setFloat32(off+12+k*12,v.x,true);dv.setFloat32(off+16+k*12,v.y,true);dv.setFloat32(off+20+k*12,v.z,true);});
      dv.setUint16(off+48,0,true);off+=50;
    }});
  return buf;
}
function meshesToOBJ(meshes){
  let s='# MiniFusion\n',vo=1;
  meshes.forEach(m=>{m.updateMatrixWorld(true);s+=`o ${m.name||'part'}\n`;const p=m.geometry.attributes.position;const v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);s+=`v ${v.x} ${v.y} ${v.z}\n`;}
    const idx=m.geometry.index;const n=(idx?idx.count:p.count)/3;
    for(let i=0;i<n;i++){const a=(idx?idx.getX(i*3):i*3)+vo,b=(idx?idx.getX(i*3+1):i*3+1)+vo,c=(idx?idx.getX(i*3+2):i*3+2)+vo;s+=`f ${a} ${b} ${c}\n`;}
    vo+=p.count;});
  return s;
}

/* ---------- sauvegarde locale + fichier dédié ---------- */
function serialise(pretty){
  // pretty=1 (défaut) pour l'export fichier lisible ; compact pour l'autosave local
  // (~40 % de volume en moins à sérialiser et à écrire à chaque sauvegarde).
  // V0.6.0 : la pièce active reste au premier niveau (un fichier d'une seule pièce est
  // inchangé, une version antérieure ouvre la pièce active) ; les autres pièces et les
  // occurrences sont dans le bloc asm (46-assemblage-modele.js).
  const o=serialiseObj(doc,true);
  const a=asmSerial();if(a)o.asm=a;
  return JSON.stringify(o,null,pretty===false?null:2);
}
function serialiseObj(d,ui){
  // Objet d'une pièce. ui : état d'interface (repère, vue, sélection) — pièce active seulement
  // (undefined → clé absente du JSON : l'ordre et le contenu restent ceux d'avant).
  return {app:'MiniFusion',v:1,name:d.name,tint:d.tint||0,entNames:d.entNames||null,originVis:ui?originVis:undefined,view:ui?collectView():undefined,bodyVis:d.bodyVis||{},bodies:(d.bodies||[]).map(e=>({id:e.id,name:e.name,c:e.c,color:e.color,op:e.op,gl:e.gl,open:e.open!==false})),bodySeq:d.bodySeq||0,activeBody:d.activeBody||null,fold:{sk:!!(d.fold&&d.fold.sk),origin:!!(d.fold&&d.fold.origin)},fao:d.fao||null,mep:d.mep||null,params:(d.params||[]).map(p=>({name:p.name,expr:p.expr,value:p.value})),sel:ui?{kind:sel.kind,id:sel.id}:undefined,sketches:(d.sketches||[]).map(s=>{const c=Object.assign({},s);delete c._refs;return c;}),features:(d.features||[]).map(({_mesh,_m,...r})=>r),cgeo:(d.cgeo||[]).map(cgClean)};
}
function docFromSerial(o){
  // Document de pièce à partir de son objet sérialisé (ouverture, pièces d'un assemblage)
  const d={name:o.name||'Sans titre',tint:o.tint||0,entNames:o.entNames||null,sketches:o.sketches||[],features:o.features||[],cgeo:Array.isArray(o.cgeo)?o.cgeo.filter(cgValid):[],bodyVis:o.bodyVis||{},bodies:Array.isArray(o.bodies)?o.bodies.filter(e=>e&&typeof e.id==='string').map(e=>({id:e.id,name:String(e.name||e.id),c:Array.isArray(e.c)&&e.c.length===3?e.c.slice():null,color:isFinite(+e.color)?+e.color:undefined,op:(e.op>0&&e.op<1)?+e.op:undefined,gl:(e.gl>0&&e.gl<1)?+e.gl:undefined,open:e.open!==false})):[],
    bodySeq:o.bodySeq>0?Math.floor(o.bodySeq):1,activeBody:(typeof o.activeBody==='string')?o.activeBody:null,fold:(o.fold&&typeof o.fold==='object')?{sk:!!o.fold.sk,origin:!!o.fold.origin}:{},fao:o.fao||null,mep:o.mep||null,params:Array.isArray(o.params)?o.params.filter(p=>p&&typeof p.name==='string'):[]};
  let mx=0;
  (d.bodies||[]).forEach(e=>{const m=/^b(\d+)$/.exec(e.id||'');if(m)mx=Math.max(mx,+m[1]);});
  if(!(d.bodySeq>mx))d.bodySeq=mx+1;
  if(d.activeBody&&!d.bodies.some(e=>e.id===d.activeBody))d.activeBody=null;
  return d;
}
function docHash(){
  // Empreinte du paramétrique rejouable (imports éphémères exclus : non persistés).
  // Normalisée comme serialise : AUCUN champ transitoire (_m, _refs, _health, _audit),
  // sinon le cache raterait à chaque F5 (c'était le bug de l'éventail).
  try{
    const stripSketch=sk=>{const c=Object.assign({},sk);delete c._refs;delete c._health;delete c._audit;return c;};
    const stripFeat=({_mesh,_m,...r})=>r;
    if(_hashMemo&&_hashVer===_docVersion)return _hashMemo; // même version → empreinte déjà calculée
    const stripCg=c=>{const o=cgClean(c);delete o.st;delete o.msg;delete o.ai;return o;};
    const s=JSON.stringify({s:doc.sketches.map(stripSketch),f:(doc.features||[]).filter(f=>f.type!=='import').map(stripFeat),t:doc.tint||0,...((doc.cgeo&&doc.cgeo.length)?{c:doc.cgeo.map(stripCg)}:{})}); // construction : seulement si présente (empreinte des anciens documents inchangée)
    let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
    _hashMemo=(h>>>0).toString(36)+'_'+s.length;_hashVer=_docVersion;return _hashMemo;
  }catch(e){return 'x';}
}
function idbOpen(){
  return new Promise((res,rej)=>{
    try{
      const rq=indexedDB.open('minifusion',1);
      rq.onupgradeneeded=()=>{rq.result.createObjectStore('kv');};
      rq.onsuccess=()=>res(rq.result);
      rq.onerror=()=>rej(rq.error);
    }catch(e){rej(e);}
  });
}
async function idbSet(k,v){
  const db=await idbOpen();
  return new Promise((res,rej)=>{
    const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);
    tx.oncomplete=()=>{try{db.close();}catch(e){}res();};
    tx.onerror=()=>{try{db.close();}catch(e){}rej(tx.error);};
  });
}
async function idbGet(k){
  const db=await idbOpen();
  return new Promise((res,rej)=>{
    const rq=db.transaction('kv').objectStore('kv').get(k);
    rq.onsuccess=()=>{try{db.close();}catch(e){}res(rq.result);};
    rq.onerror=()=>{try{db.close();}catch(e){}rej(rq.error);};
  });
}
async function idbKeys(prefix){
  // Tous les identifiants du magasin « kv », filtres par prefixe — necessaire
  // pour embarquer le cache de trajectoires dans un fichier .miniFusion.
  const db=await idbOpen();
  return new Promise((res,rej)=>{
    try{
      const rq=db.transaction('kv','readonly').objectStore('kv').getAllKeys();
      rq.onsuccess=()=>{try{db.close();}catch(e){}
        res((rq.result||[]).filter(function(k){
          return typeof k==='string'&&(!prefix||k.indexOf(prefix)===0); }));
      };
      rq.onerror=()=>{try{db.close();}catch(e){}rej(rq.error);};
    }catch(e){try{db.close();}catch(e2){}rej(e);}
  });
}
function saveViewCache(){
  // Mémorise le dernier affichage valide (hors ligne = retour instantané au rechargement).
  try{
    const items=[];let verts=0;
    for(const b of bodies){
      if(b.ghost||b.cached||!b.mesh||!b.mesh.visible)continue;
      if(b.kind==='import')continue; // éphémères : non persistés, non cachés
      const g=b.mesh.geometry;if(!g||!g.attributes.position||!g.attributes.position.count)continue;
      const p=g.attributes.position.array,n=g.attributes.normal?g.attributes.normal.array:null;
      verts+=g.attributes.position.count;if(verts>1500000)return; // trop gros : pas de cache
      // On persiste la SOURCE (fiche du corps), pas la matière affichée : un fondu
      // d'esquisse ou un cache local ne doit jamais figurer dans le document.
      const bid=b.bodyId||bodyIdOfRuntime(b)||b.id;
      items.push({id:b.id,bodyId:bid,name:b.name,color:bodyColorOf(bid),kind:b.kind||'mesh',ref:b.ref||null,
        op:bodyOpOf(bid),
        pos:ArrayBuffer.isView(p)?p.slice():p.slice(),nor:n?(ArrayBuffer.isView(n)?n.slice():n.slice()):null});
    }
    if(!items.length)return;
    idbSet('lastGood',{v:1,ver:CACHE_VER,at:Date.now(),hash:docHash(),engine:occEngineMsg,exact:builtEngine==='exact',items}).catch(()=>{});
  }catch(e){}
}
async function restoreViewCache(){
  // Affiche le cache pendant que le noyau exact recalcul en fond. Retourne true si appliqué.
  try{
    if(typeof indexedDB==='undefined')return false;
    const c=await idbGet('lastGood');
    if(!c||c.v!==1||!c.items||!c.items.length)return false;
    // La VALIDITÉ du cache dépend du hash du document ET de la VERSION DU MOTEUR (CACHE_VER,
    // pas APP_VER : une évolution d'interface ne produit pas une autre image). Sans ce
    // second critère, un rendu produit par une version buguée est restauré indéfiniment :
    // le document n'a pas bougé, donc le hash colle, et l'affichage reste celui de l'ancien
    // code — même après le correctif. Symptôme exact : « F5 n'affiche rien, il faut cliquer
    // sur Recalculer ». Toute évolution du moteur de géométrie invalide donc le cache.
    if(!cacheVerOK(c.ver))return false;
    if(c.hash!==docHash())return false; // doc différent : recalcul direct
    clearBodies();
    c.items.forEach(it=>{
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(it.pos,3));
      if(it.nor&&it.nor.length===it.pos.length)g.setAttribute('normal',new THREE.Float32BufferAttribute(it.nor,3));
      else g.computeVertexNormals();
      const bid=it.bodyId||it.id;
      const mat=new THREE.MeshStandardMaterial({color:it.color,metalness:.35,roughness:.4});
      try{applyBodyStyle(mat,bid);}catch(e){}
      const mesh=new THREE.Mesh(g,mat);mesh.userData.bid=it.id;scene.add(mesh);
      bodies.push({id:it.id,name:it.name,mesh,color:it.color,visible:true,kind:it.kind,ref:it.ref,cached:true,bodyId:bid});
    });
    if(!bodies.length)return false;
    builtHash=c.hash;builtEngine=c.exact?'exact':'mesh'; // l'affichage correspond au doc : aucun recalcul auto
    occEngineMsg='cache — image affichée, rejeu exact en cours ('+(c.engine||'?')+')';occStatus();
    refreshParts();renderTree();showAll();applyClip();buildEdgeOverlay();refreshMirror();
    faceEl.textContent='Pièce affichée depuis le cache local — le solide exact est rejoué juste après (nécessaire pour les congés, les esquisses sur face et la sélection de faces).';
    return true;
  }catch(e){return false;}
}
function markDirty(){dirty=true;_docVersion++;refreshParts();}
function autosave(){
  // Différé : une rafale de reconstructions n'écrit plus le document local à chaque fois
  // (sérialisation + écriture synchrone qui bloquaient le fil principal). Le contenu
  // reste identique ; l'indicateur « non sauvegardé » reste honnête jusqu'à l'écriture.
  refreshParts();
  if(_autoT)clearTimeout(_autoT);
  _autoT=setTimeout(()=>{_autoT=null;try{localStorage.setItem('minifusion_auto',serialise(false));dirty=false;}catch(e){}refreshParts();},600);
}
function autosaveFlush(){ // fermeture d'onglet : plus aucune perte possible
  if(!dirty)return;
  try{localStorage.setItem('minifusion_auto',serialise(false));dirty=false;}catch(e){}
}
addEventListener('beforeunload',()=>{autosaveFlush();});
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')autosaveFlush();});
async function deserialise(json,opts){
  try{if(typeof viewFadeOut==='function')viewFadeOut();}catch(e){} // 2026-10-16-015 : fondu à l'ouverture
  const o=JSON.parse(json);doc=docFromSerial(o);
  // V0.6.0 : assemblage (autres pièces + occurrences) — absent d'un fichier d'une seule pièce
  try{asmFromSerial(o.asm);}catch(e){asm=null;}
  // Les numéros de corps ne sont jamais réemployés : le compteur repart au-delà
  // du plus grand Corps N déjà connu (anciens fichiers sans bodySeq : on le déduit).
  try{
    let mx=0;
    (doc.bodies||[]).forEach(e=>{const m=/^b(\d+)$/.exec(e.id||'');if(m)mx=Math.max(mx,+m[1]);});
    if(!(doc.bodySeq>mx))doc.bodySeq=mx+1;
    if(doc.activeBody&&!doc.bodies.some(e=>e.id===doc.activeBody))doc.activeBody=null;
  }catch(e){}
  // Corps conteneurs + MIGRATION de style : f.color/f.opacity et la teinte pièce
  // sont reportés sur la fiche du corps puis supprimés, même quand on ne rejoue
  // pas ({rebuild:false} : restauration d'un brouillon) — sinon la prochaine
  // sauvegarde réécrirait l'ancien modèle et la source serait réouverte.
  try{ensureBodies();}catch(e){}
  try{
    (doc.sketches||[]).forEach(migrateSketch);
    try{resolveAllSketchHosts();}catch(e){}
  }catch(e){}
  try{applyView(o.view);}catch(e){}
  if(o.originVis)originVis={XY:o.originVis.XY!==false,XZ:o.originVis.XZ!==false,YZ:o.originVis.YZ!==false};
  sel={kind:null,id:null}; // restaure la sélection si elle désigne encore quelque chose
  if(o.sel&&o.sel.id){
    if(o.sel.kind==='plane'&&PLANES[o.sel.id])sel={kind:'plane',id:o.sel.id};
    else if(o.sel.kind==='sketch'&&doc.sketches.some(s=>s.id===o.sel.id))sel={kind:'sketch',id:o.sel.id};
    else if(o.sel.kind==='feature'&&doc.features.some(f=>f.id===o.sel.id))sel={kind:'feature',id:o.sel.id};
    else if(o.sel.kind==='cg'&&cgGet(o.sel.id))sel={kind:'cg',id:o.sel.id};
    else if(o.sel.kind==='body'&&(doc.bodies||[]).some(e=>e.id===o.sel.id))sel={kind:'body',id:o.sel.id};
  }
  // Imports STEP/STL : la fonction RESTE (même id → corps, enlèvements et FAO
  // gardent leur cible) ; sa géométrie est rejouée depuis la source persistée
  // (importRestorePending, fin de fonction). Ancien fichier sans source : la
  // fonction attend une réimportation du même nom.
  const sansSrc=doc.features.filter(f=>f.type==='import'&&!(f.src&&f.src.key)).map(f=>f.name);
  occCkClear(); // document remplacé : les points de contrôle ne valent plus rien
  const rep=docSanitise();
  if(rep.dup||rep.orph||rep.sk||rep.cap){try{log('Document réparé : '+rep.dup+' instance(s) en double, '+rep.orph+' instance(s) orpheline(s), '+rep.sk+' esquisse(s) d’instance abandonnée(s), '+rep.cap+' répétition(s) plafonnée(s) à '+REPEAT_MAX+' copies.');}catch(e){}}
  if(rep.ren){try{log('Nom de congé/chanfrein réaligné sur la géométrie réelle : '+rep.ren+' fonction(s) (des arêtes avaient été perdues).');}catch(e){}}
  if(rep.dup||rep.orph){try{doc.features.filter(f=>f.type==='repeat').forEach(f=>repGenChildren(f));}catch(e){}}
  // Les instances d'une répétition sont DÉRIVÉES : on les régénère à l'ouverture, toujours.
  // Sans cela, un fichier enregistré par une version qui miroirait mal les congés
  // conservait des clones à 80-100 mm du mauvais côté, et le triangle ⚠ revenait à
  // chaque chargement alors même que le code était corrigé. Coût : une régénération
  // déterministe, sans effet sur les sources.
  try{
    doc.features.filter(f=>f.type==='repeat').forEach(f=>{try{repGenChildren(f);}catch(e){}});
  }catch(e){}
  sel={kind:null,id:null};uidN=doc.sketches.length+doc.features.length+1;
  if(!opts||opts.rebuild!==false){rebuild();renderProps();showAll();}
  else renderProps();
  if(sansSrc.length)alert(sansSrc.length+' import(s) enregistré(s) sans leur fichier (ancien format) : '+sansSrc.join(', ')+'.\nRéimportez le STEP/STL (même nom, ou confirmez le rebranchement) : il reprend la fonction existante, usinages conservés. Puis ré-enregistrez.');
  try{importRestorePending();}catch(e){}
  // Parcours d'outils : on lit d'abord le cache persisté (IndexedDB), on ne
  // recalcule que ce qui manque — l'ouverture ne reprend plus les ~90 s du calcul.
  try{ if(typeof faoMovesReset==='function')faoMovesReset(); }catch(e){}
  try{ if(typeof faoMovesPreloadSoon==='function')faoMovesPreloadSoon(); }catch(e){}
  // ARBRE FAO : doc.fao a CHANGE (ouverture de fichier, restauration du brouillon au
  // F5) — sans ce rendu, l'arbre FAO gardait celui du document precedent (posage sans
  // aucune operation, alors que sa fleche reste ▼ : « le posage est la, pas ses ops »).
  try{ if(typeof faoRefreshFaoUI==='function')faoRefreshFaoUI(); }catch(e){}
  try{if(typeof viewFadeIn==='function')viewFadeIn();}catch(e){}
}
/* ---------- conteneur .miniFusion : document + cache de trajectoires ----------
   Demandé : « un fichier dédié qui encapsule le json ET son cache ». Le document
   tient dans le JSON, mais les parcours de l'ébauche 3D (7,9 Mo, ~90 s de calcul)
   vivent dans l'IndexedDB de CE navigateur : rouvrir ailleurs, ou après une
   purge, remet le triangle ⚠. Le bundle embarque ces entrées (faoMoves:*) —
   rouvrir donne l'état sauvegardé, sans recalcul. Le cache d'IMAGE (lastGood,
   plusieurs Mo de sommets) reste local : il ne fait que gagner du temps. */
function bundleIs(txt){
  // true = fichier .miniFusion ; false = ancien .minifusion.json (lu tel quel).
  try{ const b=JSON.parse(txt); return !!(b&&b.bundle===1&&b.doc); }
  catch(e){ return false; }
}
async function bundleMoves(){
  // 2026-10-15-004 : SEULEMENT les trajectoires des opérations DE CE DOCUMENT.
  // Avant, toutes les entrées faoMoves:* de l'IndexedDB partaient dans le fichier —
  // celles de tous les documents jamais ouverts dans ce navigateur : « Vide.miniFusion
  // pèse 70 Mo ». Clé = 'faoMoves:<posage>:<opération>' (cf. bundleRestore).
  const out={};
  if(!faoMovesReady())return out;
  const miens=new Set();
  try{
    // V0.6.0 : toutes les pièces de l'assemblage (la pièce active passe par faoRoot)
    const roots=[faoRoot()].concat(asmAllDocs().filter(d=>d!==doc).map(d=>d.fao).filter(Boolean));
    roots.forEach(function(r){(((r&&r.setups)||[])).forEach(function(st){
      ((st&&st.ops)||[]).forEach(function(op){ miens.add('faoMoves:'+((st&&st.id)||'_')+':'+((op&&op.id)||'_')); });
    });});
  }catch(e){}
  if(!miens.size)return out;
  try{
    const ks=(await idbKeys('faoMoves:')).filter(function(k){return miens.has(k);});
    for(let i=0;i<ks.length;i++){
      try{ const v=await idbGet(ks[i]); if(v&&v.v===1&&Array.isArray(v.mv))out[ks[i]]=v; }
      catch(e){}
    }
  }catch(e){}
  return out;
}
async function bundleImports(){
  // Fichiers d'origine des imports (base64) : sans eux, le STEP manquait à l'ouverture.
  const out={};
  for(const f of [].concat(...asmAllDocs().map(d=>d.features||[]))){ // toutes les pièces (V0.6.0)
    if(!f||f.type!=='import'||!f.src||!f.src.key||out[f.src.key])continue;
    try{const u8=await importSrcGet(f.src.key);if(u8)out[f.src.key]=importU8ToB64(u8);}catch(e){}
  }
  return out;
}
async function bundleSerialise(){
  const moves=await bundleMoves();
  const imports=await bundleImports();
  return JSON.stringify({app:'MiniFusion',bundle:1,v:APP_VER,cacheVer:CACHE_VER,
    at:Date.now(),name:doc.name||'',doc:JSON.parse(serialise()),
    nMoves:Object.keys(moves).length,moves:moves,imports:imports});
}
let faoBundleMovesN=0;   // trajectoires embarquees dans le fichier ouvert
function bundleReport(){
  // A l'ouverture d'un .miniFusion : dire ce que le fichier contient RÉELLEMENT.
  // « 1 opération sans parcours » sans dire laquelle ni pourquoi, c'est ce qui a
  // fait perdre une heure — le bundle ne transporte que ce que la machine
  // d'origine avait (tampon de version, clé du solide, entrée jamais produite).
  try{
    const job=faoDoc(), has=faoBundleMovesN;
    const miss=faoActiveOps(job).filter(function(op){
      const ck=faoOpMovesKey(op,job), ch=faoOpMovesHit(op);
      return ck!==null&&!(ch&&ch.key===ck);
    });
    if(!miss.length)return;
    if(typeof faceEl==='undefined'||!faceEl)return;
    const why=faoMovesWhyShort(job,miss[0]);
    faceEl.textContent='FAO : fichier ouvert — '+miss.length+' opération(s) sans parcours'
      +(has?(' valide dans les '+has+' trajectoires embarquées')
            :' (0 trajectoire embarquée : ancien format)')
      +(why?' — '+why:'')
      +' — « Tout régénérer » une fois, puis re-enregistrer le fichier.';
  }catch(e){}
}
async function bundleRestore(txt,opts){
  // Trajectoires d'abord (IndexedDB), document ensuite (deserialise relance la
  // lecture), puis mémoire amorcée : fonctionne aussi SANS IndexedDB.
  const b=JSON.parse(txt);
  if(!b||b.bundle!==1||!b.doc)return false;
  const moves=b.moves||{};
  if(opts&&opts.name&&b.doc&&typeof b.doc==='object')b.doc.name=opts.name;
  // Seulement les trajectoires des opérations du document (un ancien fichier
  // embarquait celles de TOUS les documents du navigateur d'origine : ~70 Mo).
  const miens=new Set();
  try{
    // pièce active + autres pièces d'un assemblage (V0.6.0)
    const frs=[b.doc&&b.doc.fao].concat(((b.doc&&b.doc.asm&&b.doc.asm.parts)||[]).map(p=>p&&p.doc&&p.doc.fao));
    frs.forEach(function(fr){(((fr&&fr.setups)||[])).forEach(function(st){
      ((st&&st.ops)||[]).forEach(function(op){ miens.add('faoMoves:'+((st&&st.id)||'_')+':'+((op&&op.id)||'_')); });
    });});
  }catch(e){}
  const ancienFao=!!(b.doc.fao&&typeof b.doc.fao==='object'&&!Array.isArray(b.doc.fao.setups)); // pré-posages : ids inconnus ici
  const ks=Object.keys(moves).filter(function(k){return ancienFao||miens.has(k);});
  if(ks.length&&faoMovesReady()){
    for(let i=0;i<ks.length;i++){ try{ await idbSet(ks[i],moves[ks[i]]); }catch(e){} }
  }
  faoBundleMovesN=ks.length;
  // Sources des imports AVANT le document : deserialise les rejoue aussitôt.
  const im=(b.imports&&typeof b.imports==='object')?b.imports:{};
  for(const k of Object.keys(im)){
    try{if(typeof im[k]==='string')await importSrcPut(k,importB64ToU8(im[k]));}catch(e){}
  }
  faoBundleWantReport=true;   // consomme par faoMovesDone() (fin de lecture)
  try{ setTimeout(function(){
        try{ if(faoBundleWantReport&&!faoMovesPending()){ faoBundleWantReport=false; bundleReport(); } }
        catch(e){} },1500); }catch(e){}
  await deserialise(JSON.stringify(b.doc),opts);
  // MÉMOIRE : indispensable SANS IndexedDB (le prechargeur n'y lit rien) et
  // immédiat AVEC — le premier dessin n'attend aucune relecture asynchrone.
  let seeded=0;
  try{
    const r=faoRoot();
    (((r&&r.setups)||[])).forEach(function(s){
      ((s&&s.ops)||[]).forEach(function(op){
        const e=moves['faoMoves:'+((s&&s.id)||'_')+':'+((op&&op.id)||'_')];
        if(e&&e.v===1&&e.k&&cacheVerOK(e.ver)&&Array.isArray(e.mv)&&e.k===faoOpMovesKey(op,s)){
          faoOpMovesStore(op,e.k,e.mv); seeded++;
        }
      });
    });
  }catch(e){}
  if(seeded)try{ faoMovesDone(); }catch(e){}   // scan + dessin : AUCUN calcul
  try{ if(faoBundleWantReport&&!faoMovesReady()){ faoBundleWantReport=false; bundleReport(); } }catch(e){}
  return true;
}

$('btnSave').onclick=async()=>{
  // Fichier dédié = bundle (.miniFusion : document + trajectoires) ; le repli
  // navigateur garde le JSON compact, seul format qui tient dans localStorage.
  try{
    if(window.showSaveFilePicker&&fileHandle){
      const data=await bundleSerialise();
      const w=await fileHandle.createWritable();await w.write(data);await w.close();
      autosave();alert('Sauvé dans '+fileHandle.name+' (document + trajectoires).');return;
    }
  }catch(e){}
  try{const d=serialise();localStorage.setItem('minifusion_auto',d);localStorage.setItem('minifusion_named_'+doc.name,d);dirty=false;refreshParts();alert('Sauvé en local (navigateur) sous « '+doc.name+' ». Utilisez « Sous… » pour un fichier dédié.');}catch(e){alert('Sauvegarde impossible : '+e.message);}
};
$('btnSaveAs').onclick=async()=>{
  const fname=(doc.name||'piece').replace(/[\\/:*?"<>|]/g,'_')+'.miniFusion';
  let data;try{ data=await bundleSerialise(); }catch(err){ data=serialise(); }
  try{
    if(window.showSaveFilePicker){
      fileHandle=await window.showSaveFilePicker({suggestedName:fname,types:[{description:'MiniFusion (document + trajectoires)',accept:{'application/json':['.miniFusion']}}]});
      const w=await fileHandle.createWritable();await w.write(data);await w.close();autosave();alert('Sauvé sous '+fileHandle.name+' (document + trajectoires).');return;
    }
    throw new Error('no picker');
  }catch(e){
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=fname;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  }
};
$('btnLoad').onclick=()=>$('fileProj').click();
$('fileProj').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const txt=await f.text();const nm=f.name.replace(/(\.minifusion(\.json)?|\.json)$/i,'');
    if(bundleIs(txt))await bundleRestore(txt,{name:nm});          // .miniFusion : doc + trajectoires
    else{await deserialise(txt);doc.name=nm;rebuild();renderProps();} // ancien .minifusion.json
  }catch(err){alert('Projet illisible : '+err.message);}
  e.target.value='';
});
try{$('fileProj').accept='.json,.minifusion.json,.miniFusion';}catch(e){}
try{$('btnSaveAs').title='Sauver sous… (.miniFusion : document + trajectoires)';}catch(e){}
try{$('btnLoad').title='Ouvrir un projet (.miniFusion ou .minifusion.json)';}catch(e){}


/* 2026-10-14-009 : MAILLAGE FIN DE FINITION — retour « dans les congés,
   l'affichage montre 2 ou 3 droites qui se suivent, il faut les lisser ».
   La FAO maille le solide exact à 0,5 mm / 0,5 rad (import STEP) ou
   occXDefl() (natif : 0,5 rad sans congé 3D) : un congé à 90° = 3 à 4
   facettes, que la Finition suit fidèlement. La Finition seule reçoit un
   maillage FIN (corde 0,01 mm, 0,1 rad ≈ 16 facettes sur 90°), en cache
   sur le corps ; l'Ébauche et les autres opérations gardent le leur
   (parcours inchangés). Repli : maillage d'outillage habituel. */
const FAO_FINE_DEFL={lin:0.01,ang:0.1};
function faoFineGeo(b){
  try{
    let shape=null,holder=null;
    if(b&&b.kind==='import'){const e=importGeom.get(b.id);if(e&&e.brep){shape=e.brep;holder=e;}}
    else if(b&&b.kind==='body'&&b.shape){shape=b.shape;holder=b;}
    if(!shape)return null;
    if(holder._faoGeoFine)return holder._faoGeoFine;
    let g=null;
    try{occt.BRepTools.Clean(shape);}catch(e){}
    try{g=occTessellate(shape,FAO_FINE_DEFL.lin,FAO_FINE_DEFL.ang);}catch(e){g=null;}
    // le solide garde sa triangulation fine : on l'efface (les autres
    // lectures — outillage, affichage — retessellent à LEUR définition)
    try{occt.BRepTools.Clean(shape);}catch(e){}
    if(!g)return null;
    holder._faoGeoFine=g;
    return g;
  }catch(e){return null;}
}
// 2026-10-22-009 : maillage INTERMÉDIAIRE (ébauche 3D, contour profil) — le
// maillage d'outillage d'un import STEP est à 0,5 mm / 0,5 rad : autant que la
// surépaisseur courante (« J'espère que tu prends bien en compte les vraies
// faces du modèle exact »). 0,05 mm / 0,2 rad : écart à la surface exacte
// 10 fois plus petit, triangles raisonnables pour le moteur d'ébauche.
const FAO_MID_DEFL={lin:0.05,ang:0.2};
function faoMidGeo(b){
  try{
    let shape=null,holder=null;
    if(b&&b.kind==='import'){const e=importGeom.get(b.id);if(e&&e.brep){shape=e.brep;holder=e;}}
    else if(b&&b.kind==='body'&&b.shape){shape=b.shape;holder=b;}
    if(!shape)return null;
    if(holder._faoGeoMid)return holder._faoGeoMid;
    let g=null;
    try{occt.BRepTools.Clean(shape);}catch(e){}
    try{g=occTessellate(shape,FAO_MID_DEFL.lin,FAO_MID_DEFL.ang);}catch(e){g=null;}
    try{occt.BRepTools.Clean(shape);}catch(e){}
    if(!g)return null;
    holder._faoGeoMid=g;
    return g;
  }catch(e){return null;}
}
function faoMeshFromBodyMid(b){
  try{
    const g=faoMidGeo(b);
    if(g&&_faoMeshFromBodyOrig)return _faoMeshFromBodyOrig({mesh:{geometry:g,matrixWorld:b.mesh&&b.mesh.matrixWorld}},600000);
  }catch(e){}
  return null;
}
function faoMeshFromBodyFine(b){
  try{
    const g=faoFineGeo(b);
    if(g&&_faoMeshFromBodyOrig)return _faoMeshFromBodyOrig({mesh:{geometry:g,matrixWorld:b.mesh&&b.mesh.matrixWorld}},600000);
  }catch(e){}
  return null;
}
