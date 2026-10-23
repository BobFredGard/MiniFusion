/* ═══════════════════════════════════════════════════════════════════════════
   PERÇAGE (fonction 3D) — 2026-10-15-012
   Demande : « une fonction Perçage dans la modélisation 3D, en rapport avec
   l'opération Perçage FAO : une esquisse avec des points dédiés aux centres de
   trous, et on crée des trous ou des trous taraudés, avec lamage et fraisure
   intégrés, comme Fusion 360 ; la FAO le reconnaît automatiquement si créé avec ».

   • Points : entités cpoint `hole:true` de l'esquisse (outil ⊕ Centre de perçage) —
     seuls ces points portent un trou.
   • f = {type:'hole', sketchId, kind:'simple'|'cbore'|'csink', d (Ø de perçage),
          thread:null|{size:'M8',p:1.25,len}, cbD,cbH (lamage), csD,csA (fraisure),
          end:'blind'|'through', depth (profondeur à plein Ø), tip (angle de pointe,
          0 = fond plat), flip (sens), op:'cut'}
     Taraudé : d = Ø de perçage du taraud (M − pas), filet non modélisé (comme
     Fusion « filet cosmétique ») — l'info voyage jusqu'à la FAO.
   • Géométrie exacte : par point, un outil de révolution (lamage/fraisure + corps +
     pointe) le long de −n (ou +n si inversé), unis puis découpés du corps.
   ═══════════════════════════════════════════════════════════════════════════ */
// Métrique ISO : [taille, Ø nominal, pas gros, pas fins…]
const ISO_THREADS=[['M2',2,0.4],['M2.5',2.5,0.45],['M3',3,0.5],['M4',4,0.7],['M5',5,0.8],['M6',6,1,0.75],
  ['M8',8,1.25,1],['M10',10,1.5,1.25,1],['M12',12,1.75,1.5,1.25],['M14',14,2,1.5],['M16',16,2,1.5],
  ['M18',18,2.5,2,1.5],['M20',20,2.5,2,1.5],['M22',22,2.5,2,1.5],['M24',24,3,2]];
// Vis CHC (ISO 4762) : passage moyen, lamage Ø, profondeur de lamage
const ISO_CHC=[['M3',3.4,6.5,3.4],['M4',4.5,8,4.4],['M5',5.5,10,5.4],['M6',6.6,11,6.4],['M8',9,15,8.6],
  ['M10',11,18,10.8],['M12',13.5,20,13],['M14',15.5,24,15],['M16',17.5,26,17.5],['M20',22,33,21.5],['M24',26,40,25.5]];
function isoThread(size){ return ISO_THREADS.find(function(t){return t[0]===size;})||null; }
function tapDrill(size,p){ const t=isoThread(size); return t?+(t[1]-(p||t[2])).toFixed(2):null; }
// Filet interne ISO 68-1 / ISO 965-1 : crête (Ø mineur D1) méplat p/4, racine
// (Ø majeur D) méplat p/8, flancs à 60°. `jeu` est un jeu d'impression sur le
// DIAMÈTRE (mm) : chaque rayon est décalé de jeu/2.
function isoHoleThread(size,p,jeu){
  const t=isoThread(size);if(!t)return null;
  const D=+t[1],P=+p||+t[2];if(!(D>0)||!(P>0))return null;
  const c=Math.max(0,+jeu||0)/2,D1=D-1.082532*P;
  return {D:D,P:P,D1:D1,rCrete:D1/2+c,rRacine:D/2+c,c:c};
}
function holeThreadLabel(th){ if(!th||!th.size)return ''; const t=isoThread(th.size); return th.size+((t&&+th.p!==t[2])?('×'+String(th.p)):''); }
function holePoints(sk){
  // Centres de perçage de l'esquisse (2D) : [{id,x,y}]
  if(!sk)return [];
  return (sk.entities||[]).filter(function(e){return e&&e.t==='cpoint'&&e.hole&&sk.points&&sk.points[e.p];})
    .map(function(e){const Q=sk.points[e.p];return {id:e.id,x:Q.x,y:Q.y};});
}
function holeName(f){
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  const n=holePoints(sk).length;
  const fr=function(v){return String(+(+v).toFixed(2)).replace('.',',');};
  let t=f.thread&&f.thread.size?('Taraudé '+holeThreadLabel(f.thread)):('Ø'+fr(f.d));
  if(f.kind==='cbore')t+=' lamé Ø'+fr(f.cbD);
  if(f.kind==='csink')t+=' fraisé Ø'+fr(f.csD);
  const fin=f.end==='through'?' débouchant tout':(f.end==='next'?' débouchant':(f.end==='upto'?' jusqu’à la face':''));
  return 'Perçage '+t+fin+' ×'+n;
}
function holeNorm(f){
  // Valeurs bornées (jamais de géométrie dégénérée)
  const d=Math.max(0.2,+f.d||6.6);
  return {d:d,r:d/2,
    kind:f.kind==='cbore'||f.kind==='csink'?f.kind:'simple',
    cbD:Math.max(d+0.2,+f.cbD||d*1.7),cbH:Math.max(0.1,+f.cbH||d*0.9),
    csD:Math.max(d+0.2,+f.csD||d*2),csA:Math.min(150,Math.max(60,+f.csA||90)),
    end:(f.end==='through'||f.end==='next'||f.end==='upto')?f.end:'blind',
    through:f.end==='through',depth:Math.max(0.2,+f.depth||d*2.5),
    tip:(f.tip===0||f.tip==='0')?0:Math.min(170,Math.max(60,+f.tip||118))};
}
function holeAxis(f,sk){
  // Origine monde de chaque point + direction de perçage (−n par défaut).
  const B=sketchBasis(sk);
  const s=f.flip?1:-1;
  return {dir:{x:B.n.x*s,y:B.n.y*s,z:B.n.z*s},pts:holePoints(sk).map(function(p){const w=occW(sk,p.x,p.y);return {id:p.id,x:w[0],y:w[1],z:w[2]};})};
}
const HOLE_THROUGH=2000; // « débouchant » : la course traverse toute pièce raisonnable
function holeProfileSegs(N,zEndPt){
  // Segments le long de l'axe (distance depuis le plan, rayons début/fin) pour un trou.
  const s=[];let z=0;
  if(N.kind==='cbore'){s.push([z,N.cbH,N.cbD/2,N.cbD/2]);z=N.cbH;}
  else if(N.kind==='csink'){const h=(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360);s.push([z,h,N.csD/2,N.r]);z=h;}
  const zEnd=Math.max(isFinite(zEndPt)?zEndPt:(N.through?(N.thruLen||HOLE_THROUGH):N.depth),z+0.05);
  s.push([z,zEnd-z,N.r,N.r]);
  if(N.end==='blind'&&N.tip>0){const h=N.r/Math.tan(N.tip*Math.PI/360);s.push([zEnd,h,N.r,0]);}
  return s;
}
// 2026-10-19 : filet MODÉLISÉ (impression 3D) — gorge hélicoïdale exacte.
// Le trou reste percé au Ø de perçage (≥ Ø mineur + jeu) et l'on retire en plus la
// gorge comprise entre la crête (R1) et la racine (R2) le long de l'hélice au pas réel.
// Profil d'un pas (interne) : racine p/8 → flanc → crête p/4 → flanc → racine.
function occHoleThreadGroove(P,D,zStart,zLen,th,bins){
  const p=th.P,r1=th.rCrete,r2=th.rRacine;
  if(!(zLen>0.9*p))return null; // moins d'un pas : rien de représentable
  const cross=function(a,b){return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x};};
  const norm=function(a){const l=Math.hypot(a.x,a.y,a.z)||1;return {x:a.x/l,y:a.y/l,z:a.z/l};};
  const ref=Math.abs(D.z)<0.9?{x:0,y:0,z:1}:{x:1,y:0,z:0};
  const U=norm(cross(D,ref)),V=norm(cross(D,U));
  const r0=(r1+r2)/2;
  const P0={x:P.x+D.x*zStart+U.x*r0,y:P.y+D.y*zStart+U.y*r0,z:P.z+D.z*zStart+U.z*r0};
  // tangente au départ (dP/dθ) → plan du profil exactement normal à la spire
  const T=norm({x:D.x*(p/(Math.PI*2))+V.x*r0,y:D.y*(p/(Math.PI*2))+V.y*r0,z:D.z*(p/(Math.PI*2))+V.z*r0});
  const W=norm(cross(T,U));
  const mkWire=function(pts){
    const mkW=occBinPush(bins,new occt.BRepBuilderAPI_MakeWire_1());
    for(let i=0;i<pts.length-1;i++){
      const me=occBinPush(bins,new occt.BRepBuilderAPI_MakeEdge_3(pts[i],pts[i+1]));
      me.Build();if(!me.IsDone())throw new Error('arête de filet impossible');
      mkW.Add_1(me.Edge());
    }
    mkW.Build();if(!mkW.IsDone())throw new Error('fil de filet impossible');
    return mkW.Wire();
  };
  // hélice : zLen − p de course axiale + l'étendue axiale du profil (p) = zLen.
  // Le noyau exige une arête LISSE : une polyligne donne un solide dégénéré (volume
  // nul). On approche donc l'hélice par une B-spline passant par les points.
  const turns=Math.max(0.25,zLen/p-1),steps=Math.max(24,Math.ceil(turns*28));
  const spinePts=[];
  for(let i=0;i<=steps;i++){
    const a=2*Math.PI*turns*i/steps,z=zStart+p*turns*i/steps;
    spinePts.push(occBinPush(bins,new occt.gp_Pnt_3(
      P.x+D.x*z+U.x*r0*Math.cos(a)+V.x*r0*Math.sin(a),
      P.y+D.y*z+U.y*r0*Math.cos(a)+V.y*r0*Math.sin(a),
      P.z+D.z*z+U.z*r0*Math.cos(a)+V.z*r0*Math.sin(a))));
  }
  const makeSpine=function(){
    const arr=occBinPush(bins,new occt.TColgp_Array1OfPnt_2(1,spinePts.length));
    spinePts.forEach(function(q,i){arr.SetValue(i+1,q);});
    const fit=occBinPush(bins,new occt.GeomAPI_PointsToBSpline_2(arr,3,8,occt.GeomAbs_Shape.GeomAbs_C2,1e-4));
    const h=occBinPush(bins,new occt.Handle_Geom_Curve_2(fit.Curve().get()));
    const me=occBinPush(bins,new occt.BRepBuilderAPI_MakeEdge_24(h));
    me.Build();if(!me.IsDone())throw new Error('hélice impossible');
    const mkW=occBinPush(bins,new occt.BRepBuilderAPI_MakeWire_1());
    mkW.Add_1(me.Edge());mkW.Build();if(!mkW.IsDone())throw new Error('fil d\'hélice impossible');
    return mkW.Wire();
  };
  const profPt=function(r,z){
    return occBinPush(bins,new occt.gp_Pnt_3(P0.x+U.x*(r-r0)+W.x*z,P0.y+U.y*(r-r0)+W.y*z,P0.z+U.z*(r-r0)+W.z*z));
  };
  // Bords de FERMETURE du profil décalés de SEAM vers l'extérieur : confondus avec la
  // racine (r2), ils se superposaient à la facette (0→p/8) de même rayon. Le fil se
  // recouvrait lui-même et, selon la longueur, MakePipeShell produisait un solide
  // auto-sécant (volume faux ou négatif) qui faisait échouer les découpes suivantes
  // (filet débouchant). SEAM est très inférieur à la résolution d'impression.
  const SEAM=0.03;
  const zs=[0,p/8,p/8+5*p/16,p/8+5*p/16+p/4,p];
  const rs=[r2,r2,r1,r1,r2+SEAM];
  const profPts=zs.map(function(z,i){return profPt(rs[i],z);});
  profPts.push(profPts[0]);
  const pipe=occBinPush(bins,new occt.BRepOffsetAPI_MakePipeShell(makeSpine()));
  try{pipe.SetMode_1(true);}catch(e){}
  pipe.Add_1(mkWire(profPts),false,false);
  pipe.Build();
  if(!pipe.IsDone())throw new Error('balayage hélicoïdal impossible');
  try{pipe.MakeSolid();}catch(e){}
  return pipe.Shape();
}
function occShapeOfHole(f){
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  if(!sk)throw new Error('esquisse introuvable');
  const A=holeAxis(f,sk);
  if(!A.pts.length)throw new Error('aucun centre de perçage dans l’esquisse (outil ⊕)');
  const N0=holeNorm(f),thModel=(f.thread&&f.thread.model&&f.thread.size)?isoHoleThread(f.thread.size,f.thread.p,f.thread.clear):null;
  // filet modélisé : le corps ne doit jamais être plus étroit que la crête du filet
  const N=thModel?Object.assign({},N0,{r:Math.max(N0.r,thModel.rCrete)}):N0;
  // Débouchant : course limitée à la PIÈCE déjà construite (+1 mm) — sinon l'outil
  // fantôme affiché à la sélection serait une tige de 2 m.
  if(N.through&&typeof occThroughBase!=='undefined'&&occThroughBase){
    try{
      const bb=new occt.Bnd_Box_1();occt.BRepBndLib.Add(occThroughBase,bb,true);
      const a=bb.CornerMin(),b=bb.CornerMax();let L=0;
      const cs=[[a.X(),b.X()],[a.Y(),b.Y()],[a.Z(),b.Z()]];
      A.pts.forEach(function(P){for(let i=0;i<8;i++){const c=[cs[0][i&1],cs[1][(i>>1)&1],cs[2][(i>>2)&1]];
        L=Math.max(L,(c[0]-P.x)*A.dir.x+(c[1]-P.y)*A.dir.y+(c[2]-P.z)*A.dir.z);}});
      try{bb.delete();}catch(e){}
      if(L>0)N.thruLen=L+1;
    }catch(e){}
  }
  const bins=[],warnings=[];
  const base=(typeof occThroughBase!=='undefined')?occThroughBase:null;
  const zEndOf=function(P){
    // Profondeur (plein Ø) de CE trou selon la fin choisie.
    if(N.end==='upto'){
      const t=holePlaneDist(f.uptoPlane,P,A.dir);
      if(t===null){warnings.push('fin « jusqu’à la face » : face non choisie ou parallèle à l’axe — profondeur saisie utilisée');return N.depth;}
      return t;
    }
    if(N.end==='next'){
      const t=holeNextExit(base,P,A.dir);
      if(t===null){warnings.push('fin « débouchant » : aucune sortie de matière trouvée — profondeur saisie utilisée');return N.depth;}
      return t+0.05; // franchit la face de sortie (jamais de pellicule)
    }
    if(N.through)return N.thruLen||HOLE_THROUGH;
    return N.depth;
  };
  // longueur filetée effective (information FAO ; le filet n'est pas modélisé)
  try{
    if(f.thread&&f.thread.size&&A.pts.length){
      const m=f.thread.lenMode||'len',P0=A.pts[0];
      let L=+f.thread.len||0;
      if(m==='upto'){const t=holePlaneDist(f.thread.uptoPlane,P0,A.dir);if(t!==null)L=t;else warnings.push('longueur filetée « jusqu’à la face » : face non choisie');}
      else if(m==='next'){const t=holeNextExit(base,P0,A.dir);if(t!==null)L=t;}
      else if(m==='through'){const of0=(N.kind==='cbore')?N.cbH:(N.kind==='csink'?Math.max(0,(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360)):0);L=Math.max(0,zEndOf(P0)-of0);}
      f._thLen=+L.toFixed(3);
    }
  }catch(e){}
  const D=A.dir;
  const dir=occBinPush(bins,new occt.gp_Dir_4(D.x,D.y,D.z));
  // Outil = COMPOSÉ des corps (pas de fuse) : la découpe OCCT traite le composé comme
  // une liste d'outils en un seul passage — bien plus rapide qu'un fuse explicite avec
  // la gorge hélicoïdale, et le résultat est strictement le même.
  const tool=[];
  const add=function(sh){ tool.push(sh); };
  const OVER=0.02; // départ légèrement au-dessus du plan : jamais de face coplanaire
  A.pts.forEach(function(P){
    const zEnd=zEndOf(P);
    const segs=holeProfileSegs(N,zEnd);
    const body=[];
    segs.forEach(function(sg,i){
      // 1er segment rallongé de OVER au-dessus du plan : un CÔNE (fraisure) est prolongé
      // sur sa génératrice, sinon le Ø au ras de la face serait trop petit (10,96 pour 11).
      // Les segments suivants gardent leurs bornes exactes — c'est la FUSION ci-dessous,
      // et non un recouvrement, qui supprime les opercules internes (lamage/fraisure).
      const z0=sg[0]-(i===0?OVER:0),h=sg[1]+(i===0?OVER:0);
      const r0=(i===0&&sg[1]>1e-9)?sg[2]+OVER*(sg[2]-sg[3])/sg[1]:sg[2];
      const o=occBinPush(bins,new occt.gp_Pnt_3(P.x+D.x*z0,P.y+D.y*z0,P.z+D.z*z0));
      const ax=occBinPush(bins,new occt.gp_Ax2_3(o,dir));
      let sh=null;
      if(Math.abs(sg[2]-sg[3])<1e-9){const mk=new occt.BRepPrimAPI_MakeCylinder_3(ax,sg[2],h);sh=mk.Shape();try{mk.delete();}catch(e){}}
      else{const mk=new occt.BRepPrimAPI_MakeCone_3(ax,r0,sg[3],h);sh=mk.Shape();try{mk.delete();}catch(e){}}
      body.push(sh);
    });
    // Les segments du profil (fût, lamage/fraisure, pointe) sont FUSIONNÉS : une découpe
    // avec un composé laisse les opercules internes (membrane au fond du lamage). La fusion
    // ne porte que sur ces quelques corps simples — la gorge reste à part dans le composé.
    let prof=body[0];
    for(let k=1;k<body.length;k++)prof=occFuse(prof,body[k]);
    add(prof);
    if(thModel){
      const off=(N.kind==='cbore')?N.cbH:(N.kind==='csink'?Math.max(0,(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360)):0);
      const L=((f.thread.lenMode||'len')==='through')?Math.max(0,zEnd-off)
        :Math.min(+f._thLen||+f.thread.len||N.depth,zEnd-off);
      try{
        // La gorge DÉPASSE l'entrée d'un pas (et la sortie pour un débouchant) : la
        // jonction hélice/pièce tombe hors matière, il ne reste ni lèvre ni face de cap.
        const lead=thModel.P,leadOut=(N.through||N.end==='next')?thModel.P:0;
        const g=occHoleThreadGroove(P,A.dir,off-lead,L+lead+leadOut,thModel,bins);
        if(g)add(g);
        else warnings.push('filet modélisé ignoré : longueur filetée inférieure à un pas');
      }catch(err){warnings.push('filet modélisé impossible (trou lisse) : '+String(err.message||err));}
    }
  });
  if(!tool.length)throw new Error('aucun corps d’outil de perçage');
  const shp=(tool.length===1)?tool[0]:(occCompoundOf(tool)||tool[0]);
  return {shape:shp,bins:bins,warnings:warnings};
}
function legacyHoleGeos(f,msgs){
  // Repli maillage (sans noyau exact) : cylindres approchés.
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  if(!sk)throw new Error('esquisse introuvable');
  const A=holeAxis(f,sk),N=holeNorm(f),geos=[];
  if(msgs&&f.thread&&f.thread.model)msgs.push('filet modélisé : noyau exact requis — trou lisse en attendant');
  const segs=holeProfileSegs(N,N.end==='upto'?(holePlaneDist(f.uptoPlane,A.pts[0]||{x:0,y:0,z:0},A.dir)||N.depth):(N.end==='next'?N.depth:undefined));
  const up=new THREE.Vector3(0,1,0),dv=new THREE.Vector3(A.dir.x,A.dir.y,A.dir.z);
  const q=new THREE.Quaternion().setFromUnitVectors(up,dv);
  A.pts.forEach(function(P){
    segs.forEach(function(sg){
      const len=Math.min(sg[1],N.through?60:sg[1]); // repli maillage : course bornée
      // rayon nul (pointe) → 0,01 mm : un sommet dégénéré corrompt le booléen BSP (CSG)
      const g=new THREE.CylinderGeometry(Math.max(sg[3],0.01),Math.max(sg[2],0.01),len,24);
      g.applyQuaternion(q);
      const c=sg[0]+len/2;
      g.translate(P.x+dv.x*c,P.y+dv.y*c,P.z+dv.z*c);
      geos.push(g);
    });
  });
  if(!geos.length)throw new Error('aucun centre de perçage');
  return geos;
}
function holePlaneDist(pl,P,D){
  // Distance le long de l'axe jusqu'au plan choisi {p:[x,y,z],n:[x,y,z]} ; null si absent/parallèle/derrière.
  if(!pl||!pl.p||!pl.n)return null;
  const dn=D.x*pl.n[0]+D.y*pl.n[1]+D.z*pl.n[2];
  if(Math.abs(dn)<1e-6)return null;
  const t=((pl.p[0]-P.x)*pl.n[0]+(pl.p[1]-P.y)*pl.n[1]+(pl.p[2]-P.z)*pl.n[2])/dn;
  return t>0.01?t:null;
}
function holeNextExit(sh,P,D){
  // « Jusqu'à la prochaine face » : distance le long de l'axe jusqu'à la PREMIÈRE
  // sortie de matière (entrée dans le solide, puis sortie). Marche + dichotomie.
  if(!sh||typeof occt==='undefined')return null;
  let cl=null;
  try{
    cl=new occt.BRepClass3d_SolidClassifier_2(sh);
    const IN=occt.TopAbs_State.TopAbs_IN;
    const inAt=function(t){const p=new occt.gp_Pnt_3(P.x+D.x*t,P.y+D.y*t,P.z+D.z*t);cl.Perform(p,1e-7);const r=cl.State()===IN;try{p.delete();}catch(e){}return r;};
    let bb=null,Lmax=2000;
    try{bb=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,bb,true);const a=bb.CornerMin(),b=bb.CornerMax();Lmax=Math.hypot(b.X()-a.X(),b.Y()-a.Y(),b.Z()-a.Z())+1;bb.delete();}catch(e){}
    const step=0.25;let t=0.05,seenIn=false,prevIn=false;
    for(;t<=Lmax;t+=step){
      const i=inAt(t);
      if(i){seenIn=true;prevIn=true;continue;}
      if(seenIn&&prevIn){ // sortie entre t-step et t
        let lo=t-step,hi=t;
        for(let k=0;k<30;k++){const m=(lo+hi)/2;if(inAt(m))lo=m;else hi=m;}
        return hi;
      }
      prevIn=false;
    }
    return null;
  }catch(e){return null;}
  finally{try{if(cl)cl.delete();}catch(e){}}
}
let holeFacePick=null; // {fid, which:'end'|'thread'}
function holeFacePickStart(fid,which){
  holeFacePick={fid:fid,which:which};
  try{renderer.domElement.style.cursor='crosshair';}catch(e){}
  try{faceEl.textContent='Perçage : cliquez une face PLANE de la pièce ('+(which==='thread'?'fin du filetage':'fin du trou')+') — Échap pour annuler.';}catch(e){}
}
function holeFacePickCancel(){holeFacePick=null;try{renderer.domElement.style.cursor='default';}catch(e){}}
function holeFacePickAt(e){
  if(!holeFacePick)return false;
  const f=doc.features.find(function(x){return x.id===holeFacePick.fid;});
  if(!f){holeFacePickCancel();return false;}
  const h=pick(e);if(!h){try{faceEl.textContent='Perçage : aucune face sous le curseur.';}catch(e2){}return true;}
  let G=null;try{G=occFaceGeom(h.object,h.faceIndex);}catch(e2){G=null;}
  if(!G||G.kind!=='plan'){try{faceEl.textContent='Perçage : choisissez une face PLANE.';}catch(e2){}return true;}
  const pl={p:[G.p.x,G.p.y,G.p.z],n:[G.n.x,G.n.y,G.n.z]};
  docPushUndo('perçage : face');
  if(holeFacePick.which==='thread'){if(!f.thread)f.thread={};f.thread.uptoPlane=pl;f.thread.lenMode='upto';}
  else{f.uptoPlane=pl;f.end='upto';}
  holeFacePickCancel();
  f.name=holeName(f);markDirty();rebuild();renderTree();renderProps();
  try{faceEl.textContent='Perçage : face retenue.';}catch(e2){}
  return true;
}
/* ----- création ----- */
function askHole(presetSketchId){
  const lastWithHoles=function(){for(let i=doc.sketches.length-1;i>=0;i--){if(holePoints(doc.sketches[i]).length)return doc.sketches[i].id;}return null;};
  const skId=(presetSketchId&&holePoints(doc.sketches.find(function(s){return s.id===presetSketchId;})).length)?presetSketchId:lastWithHoles();
  if(!skId){alert('Perçage : placez d’abord des CENTRES DE PERÇAGE dans une esquisse (outil ⊕ de la barre d’esquisse), puis sélectionnez-la.');return;}
  const sk=doc.sketches.find(function(s){return s.id===skId;});
  const nf={id:uid('ho'),type:'hole',name:'',sketchId:skId,kind:'simple',d:6.6,thread:null,
    cbD:11,cbH:6.4,csD:13,csA:90,end:'blind',depth:15,tip:118,flip:false,op:'cut',visible:true};
  // sens automatique : vers la matière (le plan d'une face pointe vers l'extérieur)
  try{
    if(occHas()&&occLive&&occLive.shape){
      const A=holeAxis(nf,sk),P=A.pts[0],D=A.dir;
      const cl=new occt.BRepClass3d_SolidClassifier_2(occLive.shape);
      const st=function(s){const p=new occt.gp_Pnt_3(P.x+D.x*s,P.y+D.y*s,P.z+D.z*s);cl.Perform(p,1e-6);const r=cl.State();try{p.delete();}catch(e){}return r;};
      const IN=occt.TopAbs_State.TopAbs_IN;
      if(st(0.6)!==IN&&st(-0.6)===IN)nf.flip=true;
      try{cl.delete();}catch(e){}
    }
  }catch(e){}
  nf.name=holeName(nf);
  docPushUndo('perçage');
  addFeature(nf);
  if(sk.visible!==false)sk.visible=false;
  ghostHide=nf.id;
  sel={kind:'feature',id:nf.id};
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Perçage créé : '+nf.name+' — réglez type, taraudage et profondeur dans Paramètres.';
}
/* ----- panneau de la fonction ----- */
function renderHoleProps(p,f){
  const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});
  const go=function(){f.name=holeName(f);markDirty();rebuild();renderTree();renderProps();};
  /* helpers layout PLAN (mêmes classes que renderProps) */
  const pH=t=>{const h=document.createElement('div');h.className='pnl-h';h.textContent=t;p.appendChild(h);return h;};
  const pRow=(lab,el)=>{const r=document.createElement('div');r.className='pnl-row';
    const L=document.createElement('label');L.textContent=lab;r.appendChild(L);
    if(el)r.appendChild(el);p.appendChild(r);return r;};
  const pNote=t=>{const n=document.createElement('div');n.className='pnl-note';n.textContent=t;p.appendChild(n);return n;};
  const pBtns=list=>{const d=document.createElement('div');d.className='pnl-btns';
    list.forEach(([t,fn,cls])=>{const b=document.createElement('button');b.textContent=t;
      if(cls)b.className=cls;b.onclick=fn;d.appendChild(b);});
    p.appendChild(d);return d;};
  const sel=function(opts,val,fn){const s=document.createElement('select');
    opts.forEach(function(o){const op=document.createElement('option');op.value=o[0];op.textContent=o[1];s.appendChild(op);});
    s.value=String(val);s.onchange=function(){docPushUndo('perçage');fn(s.value);go();};return s;};
  const num=function(val,fn,w,hh,kk){const i=document.createElement('input');i.type='text';i.inputMode='decimal';
    i.value=String(+(+val).toFixed(3)).replace('.',',');if(hh)parFx(i,hh,kk);
    const c=function(){const v=parseFloat(String(i.value).replace(',','.'));if(isFinite(v)&&v>0){docPushUndo('perçage');fn(v);go();}};
    i.addEventListener('change',c);i.addEventListener('keydown',function(e){if(e.key==='Enter'){c();i.blur();}e.stopPropagation();});
    i.addEventListener('click',function(e){e.stopPropagation();});return i;};
  const num0=function(val,fn,min){const i=document.createElement('input');i.type='text';i.inputMode='decimal';
    i.value=String(+(+val).toFixed(2)).replace('.',',');
    const c=function(){const v=parseFloat(String(i.value).replace(',','.'));if(isFinite(v)&&v>=min){docPushUndo('perçage');fn(v);go();}};
    i.addEventListener('change',c);i.addEventListener('keydown',function(e){if(e.key==='Enter'){c();i.blur();}e.stopPropagation();});
    i.addEventListener('click',function(e){e.stopPropagation();});return i;};
  const nP=holePoints(sk).length;
  pH('Perçage');
  pNote(nP+' centre(s) dans « '+(sk?sk.name:'?')+' »'+(nP?'':' — ajoutez-en avec l\'outil ⊕ de l\'esquisse'));
  /* type */
  pRow('Type',sel([['simple','Simple'],['cbore','Lamage'],['csink','Fraisure']],f.kind||'simple',function(v){f.kind=v;}));
  /* taraudage */
  const thOpts=[['','Aucun (trou lisse)']];
  ISO_THREADS.forEach(function(t){thOpts.push([t[0]+'|'+t[2],t[0]+' (pas '+String(t[2]).replace('.',',')+')']);
    for(let k=3;k<t.length;k++)thOpts.push([t[0]+'|'+t[k],t[0]+'×'+String(t[k]).replace('.',',')+' (fin)']);});
  pRow('Taraudage',sel(thOpts,f.thread&&f.thread.size?(f.thread.size+'|'+f.thread.p):'',function(v){
    if(!v){f.thread=null;return;}
    const q=v.split('|'),pz=+q[1],prev=f.thread||{};
    // conserve le mode de longueur, la face choisie et les options d'impression
    f.thread=Object.assign({},prev,{size:q[0],p:pz});
    if(!(f.thread.len>0))f.thread.len=Math.max(2*isoThread(q[0])[1],+f.depth-2*pz);
    f.d=tapDrill(q[0],pz);
    if(f.kind==='csink')f.csD=+(isoThread(q[0])[1]*1.1+0.4).toFixed(2);
  }));
  /* vis CHC (lamage) */
  if(f.kind==='cbore')pRow('Vis CHC',sel([['','—']].concat(ISO_CHC.map(function(c){return [c[0],c[0]+' : Ø'+String(c[1]).replace('.',',')+' / lamage Ø'+c[2]+' × '+String(c[3]).replace('.',',')];})),'',function(v){
    const c=ISO_CHC.find(function(x){return x[0]===v;});if(!c)return;f.thread=null;f.d=c[1];f.cbD=c[2];f.cbH=c[3];}));
  /* Ø */
  pRow(f.thread&&f.thread.size?'Ø taraud '+holeThreadLabel(f.thread):'Ø du trou',num(f.d,function(v){f.d=v;},0,f,'d'));
  if(f.thread&&f.thread.size){
    pRow('Longueur filetée',sel([['len','Longueur'],['through','Débouchant tout (à travers)'],['upto','Jusqu\'à la face…'],['next','Prochaine face']],f.thread.lenMode||'len',function(v){
      f.thread.lenMode=v;if(v==='upto'&&!f.thread.uptoPlane)setTimeout(function(){holeFacePickStart(f.id,'thread');},0);}));
    const tm=f.thread.lenMode||'len';
    if(tm==='len')pRow('Longueur (mm)',num(f.thread.len||f.depth,function(v){f.thread.len=v;},0,f.thread,'len'));
    else if(tm==='upto')pBtns([['Sélectionner la face',function(){holeFacePickStart(f.id,'thread');}]]);
    if(f._thLen)pNote('Longueur filetée effective : '+String(f._thLen).replace('.',',')+' mm');
    pRow('Filet',sel([['cosmetic','Cosmétique (FAO seulement)'],['model','Modélisé — impression 3D']],f.thread.model?'model':'cosmetic',function(v){
      f.thread.model=(v==='model');if(f.thread.model&&f.thread.clear==null)f.thread.clear=0.2;}));
    if(f.thread.model){
      pRow('Jeu d\'impression (Ø mm)',num0(f.thread.clear==null?0.2:f.thread.clear,function(v){f.thread.clear=v;},0));
      const th=isoHoleThread(f.thread.size,f.thread.p,f.thread.clear);
      if(th){const fx=v=>String(+(+v).toFixed(3)).replace('.',',');
        pNote('ISO 261 / ISO 965-1 : Ø mineur '+fx(th.D1)+' (crête) / Ø majeur '+fx(th.D)+' (racine), pas '+fx(th.P)+' mm — '+
          Math.max(1,Math.round((+f._thLen||+f.thread.len||th.P*3)/th.P))+' spire(s). Noyau exact requis.');}
    }
  }
  if(f.kind==='cbore'){pRow('Ø lamage',num(f.cbD,function(v){f.cbD=v;},0,f,'cbD'));pRow('Profondeur lamage',num(f.cbH,function(v){f.cbH=v;},0,f,'cbH'));}
  if(f.kind==='csink'){pRow('Ø fraisure',num(f.csD,function(v){f.csD=v;},0,f,'csD'));pRow('Angle (°)',sel([['90','90°'],['82','82° (UNC)'],['100','100°'],['120','120°']],String(f.csA||90),function(v){f.csA=+v;}));}
  /* fin */
  pRow('Fin',sel([['blind','Distance (borgne)'],['upto','Jusqu\'à la face…'],['next','Débouchant (prochaine face)'],['through','Débouchant tout']],f.end||'blind',function(v){
    f.end=v;if(v==='upto'&&!f.uptoPlane)setTimeout(function(){holeFacePickStart(f.id,'end');},0);}));
  if(f.end==='upto')pBtns([['Sélectionner la face',function(){holeFacePickStart(f.id,'end');}]]);
  if(!f.end||f.end==='blind'){
    pRow('Profondeur (plein Ø)',num(f.depth,function(v){f.depth=v;},0,f,'depth'));
    pRow('Fond',sel([['118','Pointe 118°'],['135','Pointe 135°'],['140','Pointe 140°'],['90','Pointe 90°'],['0','Fond plat']],String(f.tip===0?0:(f.tip||118)),function(v){f.tip=+v;}));
  }
  pRow('Sens',sel([['0','Vers la matière (auto)'],['1','Inversé']],f.flip?'1':'0',function(v){f.flip=(v==='1');}));
  pBtns([['🔧 Éditer l\'esquisse (centres)',function(){if(sk)openSketch(sk.id);}]]);
}
/* ----- image du taraudage (filet cosmétique) — 2026-10-15-012 -----
   « Peut-on voir une image de taraudage sur les trous taraudés ? » : hélice au pas
   réel dessinée DANS le trou (juste en deçà du Ø de perçage, donc visible par
   l'ouverture) sur la longueur filetée, + cercle du Ø nominal à l'entrée. Le solide
   reste percé au Ø du taraud (juste pour la FAO) ; rien n'est modélisé. */
/* hélices et cercles d'entrée des filets cosmétiques, en points 3D : partagés par la vue 3D
   et par la mise en plan (ombrage, rendu 3D) — 2026-10-23. Un élément par trou :
   {bodyId, helix:[[x,y,z]…] (de l'entrée vers le fond), ring:[[x,y,z]…] (fermé), spt (pas angulaires par tour)} */
function holeThreadPaths(stepsPerTurn,inset){
  const out=[],spt=stepsPerTurn||24;
  (doc.features||[]).forEach(function(f){
    if(!f||f.type!=='hole'||f.visible===false||!f.thread||!f.thread.size)return;
    if(f.thread.model)return; // le filet est déjà dans le solide exact
    if(typeof tlLocked==='function'&&tlLocked(f))return;
    const sk=doc.sketches.find(function(s){return s.id===f.sketchId;});if(!sk)return;
    const t=isoThread(f.thread.size);if(!t)return;
    const pz=+f.thread.p||t[2],Rn=t[1]/2,N=holeNorm(f);
    const rh=Math.max(0.05,N.r-(inset||0.04)); // inset : retrait vers l'axe (paroi facettée du maillage)
    const len=Math.max(pz,+f._thLen||+f.thread.len||N.depth);
    const A=holeAxis(f,sk),D=new THREE.Vector3(A.dir.x,A.dir.y,A.dir.z);
    // repère orthonormé autour de l'axe
    const ref=Math.abs(D.z)<0.9?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);
    const U=new THREE.Vector3().crossVectors(D,ref).normalize(),V=new THREE.Vector3().crossVectors(D,U).normalize();
    const off=(N.kind==='cbore')?N.cbH:0;
    A.pts.forEach(function(P){
      const O=new THREE.Vector3(P.x,P.y,P.z),helix=[],ring=[];
      const turns=len/pz,steps=Math.max(spt,Math.ceil(turns*spt));
      for(let i=0;i<=steps;i++){
        const a=i/steps*turns*Math.PI*2,z=off+i/steps*len;
        const q=O.clone().addScaledVector(D,z).addScaledVector(U,rh*Math.cos(a)).addScaledVector(V,rh*Math.sin(a));
        helix.push([q.x,q.y,q.z]);
      }
      for(let k=0;k<=48;k++){const a=k/48*Math.PI*2;
        const q=O.clone().addScaledVector(D,off-0.03).addScaledVector(U,Rn*Math.cos(a)).addScaledVector(V,Rn*Math.sin(a));
        ring.push([q.x,q.y,q.z]);}
      out.push({bodyId:f.bodyId||null,helix:helix,ring:ring,spt:steps/turns});
    });
  });
  return out;
}
function holeThreadOverlay(){
  try{
    const old=scene.getObjectByName('holeThreads');
    if(old){scene.remove(old);old.traverse(function(o){try{if(o.geometry)o.geometry.dispose();}catch(e){}});}
    const grp=new THREE.Group();grp.name='holeThreads';
    holeThreadPaths().forEach(function(T){
      const helix=[],ring=[];
      const seg=function(arr,pts){for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i];arr.push(p[0],p[1],p[2],q[0],q[1],q[2]);}};
      seg(helix,T.helix);seg(ring,T.ring);
      const mkL=function(arr,col,op,dash){
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
        const m=dash?new THREE.LineDashedMaterial({color:col,dashSize:0.8,gapSize:0.6,transparent:true,opacity:op}):new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op});
        const l=new THREE.LineSegments(g,m);if(dash&&l.computeLineDistances)l.computeLineDistances();l.renderOrder=5;l.raycast=function(){};return l;};
      if(helix.length)grp.add(mkL(helix,0xffb340,0.9,false));
      if(ring.length)grp.add(mkL(ring,0xffb340,0.95,true));
    });
    if(grp.children.length)scene.add(grp);
  }catch(e){}
}
