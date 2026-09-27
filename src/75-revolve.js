/* ═══════════════════════════════════════════════════════════════════════════
   RÉVOLUTION 360° — un profil d'esquisse pivoté autour d'un axe (ligne de
   l'esquisse ou axe système) pour produire un solide de révolution.

   Reflet de l'extrusion : mêmes boucles (skLoopTrace), mêmes decisions
   add/cut, mêmes ancrages par esquisse, même repli maillage. Le noyau exact
   utilise BRepPrimAPI_MakeRevol ; le repli utilise THREE.LatheGeometry.

   Règle géométrique : le profil doit être d'UN SEUL CÔTÉ de l'axe (sinon la
   révolution s'auto-intersecte) — un côté peut être SUR l'axe (cas classique
   d'un rectangle adossé à son axe de révolution).
   ═══════════════════════════════════════════════════════════════════════════ */

let revNew=null; // révolution en cours de création : {sketchId,axis,op,angle}

// ── l'axe, dans le plan de l'esquisse puis en 3D ────────────────────────────
// f.axis = {k:'line',id:'e15'} | {k:'sys',d:'X'|'Y'|'Z'} | {k:'auto'}
// Renvoie {p2:{x,y},d2:{x,y},P3:{x,y,z},D3:{x,y,z},label} ou null + un motif.
function revolveAxis2D(sk,f){
  if(!sk)return{err:'esquisse introuvable'};
  const B=sketchBasis(sk),P=sk.points||{};
  if(f.axis&&f.axis.k==='line'){
    const e=(sk.entities||[]).find(x=>x.id===f.axis.id);
    if(!e||e.t!=='line')return{err:'axe : ligne introuvable dans cette esquisse'};
    const A=P[e.p1],Bp=P[e.p2];
    if(!A||!Bp)return{err:'axe : extrémités manquantes'};
    const dx=Bp.x-A.x,dy=Bp.y-A.y,L=Math.hypot(dx,dy);
    if(!(L>1e-9))return{err:'axe : ligne dégénérée'};
    const d2={x:dx/L,y:dy/L};
    // occW(sk, x, y) attend DEUX coordonnées et renvoie un TABLEAU [x,y,z] (pas un objet,
    // pas un point) — d'où les [0]/[1]/[2] ci-dessous. D3 est la DIRECTION 3D (différence des
    // deux extrémités), normalisée : c'est elle que gp_Dir attend.
    const P3=occW(sk,A.x,A.y),Q3=occW(sk,Bp.x,Bp.y);
    const ex=Q3[0]-P3[0],ey=Q3[1]-P3[1],ez=Q3[2]-P3[2];
    const L3=Math.hypot(ex,ey,ez);
    if(!(L3>1e-9))return{err:'axe : direction dégénérée'};
    return{p2:{x:A.x,y:A.y},d2:d2,
      P3:{x:P3[0],y:P3[1],z:P3[2]},
      D3:{x:ex/L3,y:ey/L3,z:ez/L3},
      label:(e.construction?'ligne de construction ':'ligne ')+e.id};
  }
  const want=(f.axis&&f.axis.k==='sys')?f.axis.d:null;
  if(want){
    // axe système : direction projetée dans le plan, point = origine de l'esquisse
    const w={X:{x:1,y:0,z:0},Y:{x:0,y:1,z:0},Z:{x:0,y:0,z:1}}[want]||{x:0,y:0,z:1};
    const d3=occDirInPlane(B,w);
    if(!d3)return{err:'axe '+want+' : il ne passe pas par le plan de l\'esquisse'};
    const O=occW(sk,0,0);
    return{p2:{x:0,y:0},d2:{x:d3.u,y:d3.v},
      P3:{x:O[0],y:O[1],z:O[2]},
      D3:{x:d3.w.x,y:d3.w.y,z:d3.w.z},
      label:'axe système '+want};
  }
  return{err:'aucun axe défini'};
}
// direction MONDE w projetée dans le plan d'esquisse (base u,v,n) → {u,v,w}|null
function occDirInPlane(B,w){
  const d=w.x*B.n.x+w.y*B.n.y+w.z*B.n.z;              // composante normale
  const px=w.x-B.n.x*d,py=w.y-B.n.y*d,pz=w.z-B.n.z*d;  // partie dans le plan
  const L=Math.hypot(px,py,pz);
  if(!(L>1e-9))return null;                            // axe PERPENDICULAIRE au plan
  const ux=px/L,uy=py/L,uz=pz/L;
  return{u:ux*B.u.x+uy*B.u.y+uz*B.u.z,
         v:ux*B.v.x+uy*B.v.y+uz*B.v.z,
         w:{x:ux,y:uy,z:uz}};
}
function revolveName(f){
  if(!f)return'Révolution';
  const base=(f.op==='cut'?'Révolution (découpe) ':'Révolution ')+(skName?skName(f.sketchId):'');
  const a=revolveAngle(f);
  return base+' '+(a>=359.9?'360°':Math.round(a)+'°');
}
function revolveAngle(f){const a=Math.abs(+f.angle||360);return a>0?Math.min(360,a):360;}

// ── contrôle du profil : un seul côté de l'axe ─────────────────────────────
// Renvoie {ok,msg,crossed,rMin,rMax} — rMax > 0 et aucun point franchit l'axe.
// NOTE : une « chain » de skLoopTrace est une suite de {from, ed:{kind,a}} et les points
// résolus sont dans tr.pts — ce n'est PAS une liste d'ids d'entités.
function revolveSideCheck(sk,tr,ax){
  const A=ax.p2,d=ax.d2;
  const side=p=>{const dx=p.x-A.x,dy=p.y-A.y;return dx*(-d.y)+dy*(d.x);}; // perpendiculaire signée
  const rOf=p=>{const dx=p.x-A.x,dy=p.y-A.y,t=dx*d.x+dy*d.y;return Math.hypot(dx-d.x*t,dy-d.y*t);};
  let pos=0,neg=0,rMin=1e18,rMax=0;
  const see=p=>{
    if(!p)return;
    const s=side(p);
    if(Math.abs(s)>1e-7){if(s>0)pos++;else neg++;}
    const r=rOf(p);if(r<rMin)rMin=r;if(r>rMax)rMax=r;
  };
  const walk=(chain)=>{
    (chain||[]).forEach(seg=>{
      if(!seg||!seg.ed)return;
      const toId=(seg.ed.a===seg.from)?seg.ed.b:seg.ed.a;
      see(tr.pts[seg.from]);see(tr.pts[toId]);
      const a=seg.ed.e;
      if(seg.ed.kind!=='line'&&a&&a.pc){
        const C=tr.pts[a.pc]||sk.points[a.pc];
        see(C);
        // le centre seul ne suffit PAS : un arc peut franchir l'axe en son milieu. On
        // échantillonne l'arc (9 points) avec la même loi d'angles que occWireFromChain.
        if(C){
          const an=arcAngles(sk,a);
          if(an)for(let i=0;i<=8;i++){
            const t=an.a1+(an.a2-an.a1)*i/8;
            see({x:C.x+a.r*Math.cos(t),y:C.y+a.r*Math.sin(t)});
          }
        }
      }
    });
  };
  (tr.solids||[]).forEach(s=>{walk(s.chain);(s.holes||[]).forEach(walk);});
  (tr.circlesOut||[]).forEach(c=>{
    const C=tr.pts[c.pc]||sk.points[c.pc];if(!C)return;
    see(C);
    for(let i=0;i<12;i++){const t=i*Math.PI/6;see({x:C.x+c.r*Math.cos(t),y:C.y+c.r*Math.sin(t)});}
  });
  if(pos>0&&neg>0)return{ok:false,msg:'le profil est de part et d\'autre de son axe — une révolution à 360° s\'auto-intersecte. Décalez le profil d\'un seul côté, ou changez d\'axe.',crossed:true,rMin:rMin,rMax:rMax};
  if(!(rMax>1e-7))return{ok:false,msg:'le profil est sur son axe (aire nulle) — rien à révolutionner',rMin:rMin,rMax:rMax};
  return{ok:true,msg:'',rMin:rMin,rMax:rMax};
}

// ── solide EXACT (noyau OCCT) ───────────────────────────────────────────────
function occShapeOfRevolve(f){
  const sk=doc.sketches.find(s=>s.id===f.sketchId);
  if(!sk)throw new Error('esquisse introuvable');
  const ax=revolveAxis2D(sk,f);
  if(ax.err)throw new Error(ax.err);
  const fils=doc.features.filter(x=>x.type==='fillet'&&x.target===f.id&&x.visible!==false);
  let data=sk;const warns=[];
  if(fils.length){
    const rf=applyFilletsToSketch(sk,fils);
    warns.push(...rf.warnings);data=rf.sk;
  }
  const tr=skLoopTrace(data);
  if(!tr.solids.length&&!tr.circlesOut.length){
    let m='profil non fermé';
    if(tr.opens&&tr.opens.length)m+=` (bout ouvert en ${tr.opens[0].x.toFixed(1)}, ${tr.opens[0].y.toFixed(1)})`;
    throw new Error(m);
  }
  const side=revolveSideCheck(data,tr,ax);
  if(!side.ok)throw new Error(side.msg);
  const ang=revolveAngle(f)*Math.PI/180;
  const bins=[];
  // gp_Ax1 : point sur l'axe + direction (en 3D). BRepPrimAPI_MakeRevol_2 exige un gp_Ax1
  // (un gp_Ax2 est refusé : « Expected null or instance of gp_Ax1 »). Signature vérifiée :
  // gp_Ax1_2(P,D) ; gp_Ax1_1() est l'axe par défaut, inutile ici.
  const mkAx=()=>{
    const P=occBinPush(bins,new occt.gp_Pnt_3(ax.P3.x,ax.P3.y,ax.P3.z));
    const D=occBinPush(bins,new occt.gp_Dir_4(ax.D3.x,ax.D3.y,ax.D3.z));
    return occBinPush(bins,new occt.gp_Ax1_2(P,D));
  };
  const revol=(faceShape)=>{
    // ATTENTION : cette build d'OCCT ignore l'angle dans BRepPrimAPI_MakeRevol_2(S,Ax,angle)
    // (90° et 360° donnent exactement le même solide). Seule la surcharge à 4 arguments
    // MakeRevol_1(S,Ax,angle,copy) applique réellement l'angle, EN RADIANS — vérifié :
    // 30°→arcs 2,62/7,85 · 90°→7,85/23,56 · 180°→15,71/47,12 · 360°→tour complet.
    const r=occBinPush(bins,new occt.BRepPrimAPI_MakeRevol_1(faceShape,mkAx(),ang,false));
    r.Build();
    if(!r.IsDone())throw new Error('révolution impossible (profil auto-intersecté ?)');
    return r.Shape();
  };
  // face plane d'une boucle (z0 = plan de l'esquisse)
  const faceOf=(chain,area)=>{
    const bin=[];
    try{
      let w=occWireFromChain(data,tr,chain,bin,0);
      if(area<0)w=occt.TopoDS.Wire_1(w.Reversed());
      const fm=occBinPush(bin,new occt.BRepBuilderAPI_MakeFace_15(w,true));
      fm.Build();if(!fm.IsDone())throw new Error('face impossible');
      const fc=fm.Face();
      try{w.delete();}catch(e){}
      bins.push(...bin);
      return fc;
    }catch(err){occDispose(bin);throw err;}
  };
  // Face d'un CERCLE PLEIN, construite directement dans le plan de l'esquisse — même
  // recette que occDiskPrism (2 demi-arcs sur une gp_Circ) : cette build d'OCCT n'expose ni
  // GC_MakeCirc, ni gp_Trsf, donc on construit la pastille là où elle est, sans transform.
  // ATTENTION : c'est « data » (l'esquisse evt. copyiée par les congés), pas « sk ».
  const diskOf=(cEnt)=>{
    const C=data.points[cEnt.pc];if(!C)throw new Error('pastille : centre introuvable');
    const bin=[];
    try{
      const{u,v,n}=sketchBasis(data);
      const Cw=occW(data,C.x,C.y),dir=occBinPush(bin,new occt.gp_Dir_4(n.x,n.y,n.z));
      const ax2=occBinPush(bin,new occt.gp_Ax2_3(occBinPush(bin,new occt.gp_Pnt_3(Cw[0],Cw[1],Cw[2])),dir));
      const circ=occBinPush(bin,new occt.gp_Circ_2(ax2,cEnt.r));
      const Pa=occW(data,C.x+cEnt.r,C.y),Pb=occW(data,C.x-cEnt.r,C.y);
      const P0=occBinPush(bin,new occt.gp_Pnt_3(Pa[0],Pa[1],Pa[2])),P1=occBinPush(bin,new occt.gp_Pnt_3(Pb[0],Pb[1],Pb[2]));
      const mkW=occBinPush(bin,new occt.BRepBuilderAPI_MakeWire_1());
      const m1=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P0,P1));m1.Build();
      const m2=occBinPush(bin,new occt.BRepBuilderAPI_MakeEdge_10(circ,P1,P0));m2.Build();
      if(!m1.IsDone()||!m2.IsDone())throw new Error('pastille impossible');
      mkW.Add_1(m1.Edge());mkW.Add_1(m2.Edge());mkW.Build();
      if(!mkW.IsDone())throw new Error('pastille non fermée');
      const fm=occBinPush(bin,new occt.BRepBuilderAPI_MakeFace_15(mkW.Wire(),true));
      fm.Build();if(!fm.IsDone())throw new Error('face pastille impossible');
      bins.push(...bin);
      return fm.Face();
    }catch(err){occDispose(bin);throw err;}
  };
  let shape=null;
  const fuseIn=(s)=>{if(!shape){shape=s;return;}const nx=occUnify(occFuse(shape,s));try{shape.delete();}catch(e){}try{s.delete();}catch(e){}shape=nx;};
  // skLoopTrace peut renvoyer deux fois la MÊME boucle (sens CW puis CCW) quand le profil
  // est mixte ligne+arc : on ne garde qu'un exemplaire par jeu d'arêtes, sinon on révolutionne
  // le même solide deux fois et on fusionne deux fois pour rien.
  const vus=new Set();
  const boucleKey=ch=>(ch||[]).map(x=>(x.ed&&x.ed.e&&x.ed.e.id)||(x.ed&&x.ed.a+'>'+x.ed.b)).sort().join('|');
  const solides=tr.solids.filter(s=>{const k=boucleKey(s.chain);if(vus.has(k))return false;vus.add(k);return true;});
  solides.forEach((sol,si)=>{
    let s=revol(faceOf(sol.chain,sol.area));
    (sol.holes||[]).forEach(h=>{
      const t=revol(faceOf(h,1));
      const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;
    });
    tr.circleHoles.filter(ch=>ch.solid===si).forEach(ch=>{
      const t=revol(diskOf(ch.circle));
      const c=occCut(s,t);try{s.delete();}catch(e){}try{t.delete();}catch(e){}s=c;
    });
    fuseIn(s);
  });  tr.circlesOut.forEach(cEnt=>{fuseIn(revol(diskOf(cEnt)));});
  if(!shape){occDispose(bins);throw new Error('solide vide');}
  return{shape,bins,warnings:warns};
}

// ── repli MAILLAGE (LatheGeometry) ──────────────────────────────────────────
function legacyRevolveGeos(f,warnArr){
  // Profil → (r, t) puis LatheGeometry (qui revolve autour de son Y), replacé en monde.
  const sk=doc.sketches.find(s=>s.id===f.sketchId);if(!sk)throw new Error('esquisse introuvable');
  const ax=revolveAxis2D(sk,f);
  if(ax.err)throw new Error(ax.err);
  const fils=doc.features.filter(x=>x.type==='fillet'&&x.target===f.id&&x.visible!==false);
  let data=sk;
  if(fils.length){const rf=applyFilletsToSketch(sk,fils);if(warnArr)warnArr.push(...rf.warnings.map(w=>`${f.name} : ${w}`));data=rf.sk;}
  const tr=skLoopTrace(data);
  if(!tr.solids.length)throw new Error('profil non fermé');
  const side=revolveSideCheck(data,tr,ax);
  if(!side.ok)throw new Error(side.msg);
  const ang=revolveAngle(f)*Math.PI/180;
  const A=ax.p2,d=ax.d2;
  const toRT=p=>{const dx=p.x-A.x,dy=p.y-A.y,t=dx*d.x+dy*d.y;
    return[Math.hypot(dx-d.x*t,dy-d.y*t),t];};
  // contour en (r,t) : on suit la chaîne (ordre garanti), ligne et arc
  const ptsOfChain=(chain)=>{
    const out=[];
    const push=p=>{const R=toRT(p);
      if(!out.length){out.push(R);return;}
      const last=out[out.length-1];
      const n=Math.max(1,Math.ceil(Math.hypot(R[0]-last[0],R[1]-last[1])/0.6));
      for(let k=1;k<=n;k++)out.push([last[0]+(R[0]-last[0])*k/n,last[1]+(R[1]-last[1])*k/n]);};
    (chain||[]).forEach(seg=>{
      if(!seg||!seg.ed)return;
      const toId=(seg.ed.a===seg.from)?seg.ed.b:seg.ed.a;
      const pf=tr.pts[seg.from],pt=tr.pts[toId];
      if(!pf||!pt)return;
      if(seg.ed.kind==='line'){push(pf);push(pt);return;}
      // arc : on échantillonne l'entité réelle
      const e=seg.ed.e;if(!e)return;
      const C=tr.pts[e.pc];if(!C)return;
      const an=arcAngles(data,e);if(!an)return;
      const TAU=Math.PI*2;
      const dA=((an.a2-an.a1)%TAU+TAU)%TAU;
      const aF=Math.atan2(pf.y-C.y,pf.x-C.x);
      const aT=Math.atan2(pt.y-C.y,pt.x-C.x);
      // sens réel (comme occWireFromChain) : départ sur a1 → direct, sinon retour
      const direct=Math.abs(((aF-an.a1)%TAU+TAU)%TAU)<1e-6;
      const span=direct?dA:(TAU-dA);
      const n=Math.max(6,Math.ceil(span*e.r/0.6));
      for(let k=0;k<=n;k++){
        const t=aF+(direct?1:-1)*span*k/n;
        push({x:C.x+e.r*Math.cos(t),y:C.y+e.r*Math.sin(t)});
      }
    });
    return out;
  };
  // base orthonormée : X = n × d (perpendiculaire à l'axe, dans le plan), Y = axe, Z = normale
  const B=sketchBasis(data);
  const d3={x:B.u.x*d.x+B.v.x*d.y,y:B.u.y*d.x+B.v.y*d.y,z:B.u.z*d.x+B.v.z*d.y};
  const X={x:B.n.y*d3.z-B.n.z*d3.y,y:B.n.z*d3.x-B.n.x*d3.z,z:B.n.x*d3.y-B.n.y*d3.x};
  const m=new THREE.Matrix4().makeBasis(X,d3,B.n);m.setPosition(ax.P3);
  const geos=[];
  const segs=Math.max(24,Math.min(128,Math.round(ang/(2*Math.PI)*96)));
  // même déduplication que le chemin exact : skLoopTrace peut rendre deux fois la même boucle
  const vus=new Set();
  const boucleKey=ch=>(ch||[]).map(x=>(x.ed&&x.ed.e&&x.ed.e.id)||(x.ed&&x.ed.a+'>'+x.ed.b)).sort().join('|');
  const solides=tr.solids.filter(s=>{const k=boucleKey(s.chain);if(vus.has(k))return false;vus.add(k);return true;});
  solides.forEach(sol=>{
    const pts=ptsOfChain(sol.chain);
    if(pts.length<3)return;
    const v=pts.map(p=>new THREE.Vector2(Math.max(1e-4,p[0]),p[1]));
    const g=new THREE.LatheGeometry(v,segs,0,ang);
    g.applyMatrix4(m);
    geos.push(g);
  });
  if(!geos.length)throw new Error('contour de révolution vide');
  return geos;
}

// ── CRÉATION (panneau) ─────────────────────────────────────────────────────
function askRevolve(presetSketchId){
  if(!doc.sketches.length){alert('Créez d\'abord une esquisse.');return;}
  const lastReal=()=>{for(let i=doc.sketches.length-1;i>=0;i--){if(!repCloneSkName(doc.sketches[i]))return doc.sketches[i].id;}return doc.sketches.length?doc.sketches[doc.sketches.length-1].id:null;};
  const skId=presetSketchId||lastReal();
  if(!skId)return;
  const sk=doc.sketches.find(x=>x.id===skId);
  // axe par défaut : 1re ligne de CONSTRUCTION de l'esquisse (l'axe du sketch), sinon 1re ligne
  const cands=(sk.entities||[]).filter(e=>e.t==='line');
  const def=cands.find(e=>e.construction)||cands[0]||null;
  revNew={sketchId:skId,axis:def?{k:'line',id:def.id}:{k:'sys',d:'X'},op:'add',angle:360};
  sel={kind:null,id:null};
  renderNewRevolve();
}
function renderNewRevolve(){
  if(!revNew)return;
  const p=$('props');p.innerHTML='';
  const sk=doc.sketches.find(x=>x.id===revNew.sketchId);
  const h=document.createElement('div');h.style.fontSize='.83rem';
  h.innerHTML='<b>🔄 Révolution 360°</b><br><span class="note">Esquisse : '+(sk?sk.name:'—')+'</span>';
  p.appendChild(h);
  // ── Opération (comme l'extrusion) ──
  const l1=document.createElement('label');l1.textContent='Opération';
  const s1=document.createElement('select');
  s1.innerHTML='<option value="add">➕ Plot — ajoute de la matière</option><option value="cut">➖ Poche — retire de la matière</option>';
  s1.value=revNew.op;s1.onchange=()=>{revNew.op=s1.value;renderNewRevolve();};
  l1.appendChild(s1);p.appendChild(l1);
  // ── Axe : liste des lignes de l'esquisse + axes système ──
  const l2=document.createElement('label');l2.textContent='Axe de révolution';
  const s2=document.createElement('select');
  const lines=(sk&&sk.entities||[]).filter(e=>e.t==='line');
  s2.innerHTML=lines.map(e=>'<option value="L:'+e.id+'">'+(e.construction?'ligne de construction ':'ligne ')+e.id+'</option>').join('')+
    '<option value="S:X">axe système X</option><option value="S:Y">axe système Y</option><option value="S:Z">axe système Z</option>';
  const curV=(revNew.axis&&revNew.axis.k==='line')?'L:'+revNew.axis.id:'S:'+(revNew.axis?revNew.axis.d:'X');
  s2.value=lines.some(e=>'L:'+e.id===curV)?curV:'S:X';
  s2.onchange=()=>{const v=s2.value;
    revNew.axis=v[0]==='L'?{k:'line',id:v.slice(2)}:{k:'sys',d:v.slice(2)};
    renderNewRevolve();};
  l2.appendChild(s2);p.appendChild(l2);
  // ── Angle ──
  const l3=document.createElement('label');l3.textContent='Angle (°)';
  const i3=document.createElement('input');i3.type='text';i3.inputMode='decimal';i3.value=revNew.angle;i3.style.width='80px';
  i3.addEventListener('change',()=>{const v=parseFloat(String(i3.value).replace(',','.'));if(isFinite(v)&&v>0)revNew.angle=Math.min(360,v);});
  i3.addEventListener('keydown',e=>{if(e.key==='Enter'){revNewOk();e.stopPropagation();}e.stopPropagation();});
  i3.addEventListener('click',e=>e.stopPropagation());
  l3.appendChild(i3);p.appendChild(l3);
  // ── diagnostic immédiat : l'axe est-il utilisable ? le profil est-il d'un seul côté ? ──
  const note=document.createElement('span');note.className='note';note.style.marginTop='6px';
  if(sk){
    const probe={sketchId:revNew.sketchId,axis:revNew.axis,angle:revNew.angle};
    const ax=revolveAxis2D(sk,probe);
    if(ax.err)note.textContent='⚠ '+ax.err;
    else{
      const tr=skLoopTrace(sk);
      if(!tr.solids.length&&!tr.circlesOut.length)note.textContent='⚠ profil non fermé (bouts ouverts en rouge dans l\'esquisse)';
      else{
        const sd=revolveSideCheck(sk,tr,ax);
        note.textContent=sd.ok
          ?'✓ axe « '+ax.label+' » — profil d\'un seul côté, rayon '+sd.rMin.toFixed(1)+' à '+sd.rMax.toFixed(1)+' mm'
          :'⚠ '+sd.msg;
      }
    }
  }
  p.appendChild(note);
  const row=document.createElement('div');row.className='row';row.style.marginTop='8px';
  const ok=document.createElement('button');ok.className='primary';ok.textContent='✔ Créer';ok.onclick=revNewOk;row.appendChild(ok);
  const no=document.createElement('button');no.textContent='✖ Annuler';no.onclick=revNewCancel;row.appendChild(no);
  p.appendChild(row);
}
function revNewOk(){
  if(!revNew)return;
  const sk=doc.sketches.find(x=>x.id===revNew.sketchId);
  if(!sk){revNewCancel();return;}
  const probe={sketchId:revNew.sketchId,axis:revNew.axis,angle:revNew.angle};
  const ax=revolveAxis2D(sk,probe);
  if(ax.err){faceEl.textContent='Révolution : '+ax.err;return;}
  const tr=skLoopTrace(sk);
  const sd=tr.solids.length||tr.circlesOut.length?revolveSideCheck(sk,tr,ax):{ok:false,msg:'profil non fermé'};
  if(!sd.ok){faceEl.textContent='Révolution : '+sd.msg;return;}
  const nf={id:uid('rv'),type:'revolve',name:'',sketchId:revNew.sketchId,
    axis:revNew.axis,angle:revNew.angle,op:revNew.op,visible:true};
  nf.name=revolveName(nf);
  addFeature(nf);
  if(sk.visible!==false)sk.visible=false;
  const id=nf.id;
  revNew=null;
  ghostHide=(nf.op==='cut')?id:null;
  sel={kind:'feature',id:id};
  markDirty();rebuild();renderProps();
  faceEl.textContent='Révolution créée : '+nf.name;
}
function revNewCancel(){revNew=null;sel={kind:null,id:null};renderProps();}

// Changer l'esquisse d'une révolution EXISTANTE (panneau de la fonction)
function askRevokePanel(f){
  if(!f||f.type!=='revolve')return;
  const cands=doc.sketches.filter(s=>!repCloneSkName(s));
  if(!cands.length)return;
  // si une seule esquisse réelle, on bascule direct dessus
  const apply=(sid)=>{
    if(sid===f.sketchId)return;
    const s=doc.sketches.find(x=>x.id===sid);if(s&&s.visible!==false)s.visible=false;
    f.sketchId=sid;
    // l'axe était une LIGNE de l'ancienne esquisse : il n'existe plus ici
    const sk2=doc.sketches.find(x=>x.id===sid);
    const still=(f.axis&&f.axis.k==='line')&&sk2&&(sk2.entities||[]).some(e=>e.id===f.axis.id&&e.t==='line');
    if(!still){
      const c=(sk2&&sk2.entities||[]).filter(e=>e.t==='line');
      const def=c.find(e=>e.construction)||c[0];
      f.axis=def?{k:'line',id:def.id}:{k:'sys',d:'X'};
    }
    f.name=revolveName(f);
    repSyncForFeature(f);markDirty();rebuild();renderProps();
    faceEl.textContent='Révolution : esquisse changée ('+sk2.name+').';
  };
  if(cands.length===1){apply(cands[0].id);return;}
  const lab=document.createElement('label');lab.textContent='Esquisse de révolution';
  const sel2=document.createElement('select');
  cands.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;sel2.appendChild(o);});
  sel2.value=f.sketchId;
  sel2.onchange=()=>apply(sel2.value);
  lab.appendChild(sel2);
  const p=$('props');p.insertBefore(lab,p.firstChild);
}
