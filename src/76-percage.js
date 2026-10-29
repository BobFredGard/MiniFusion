/* ═══════════════════════════════════════════════════════════════════════════
   PERÇAGE (fonction 3D) — 2026-10-15-012
   Demande : « une fonction Perçage dans la modélisation 3D, en rapport avec
   l'opération Perçage FAO : une esquisse avec des points dédiés aux centres de
   trous, et on crée des trous ou des trous taraudés, avec lamage et fraisure
   intégrés, comme Fusion 360 ; la FAO le reconnaît automatiquement si créé avec ».

   • Points : entités cpoint `hole:true` de l'esquisse (outil ⊕ Centre de perçage) —
     seuls ces points portent un trou.
   • f = {type:'hole', sketchId, kind:'simple'|'cbore'|'csink', d (Ø de perçage),
          thread:null|{size:'M8',p:1.25,len,model,clear}, cbD,cbH (lamage), csD,csA (fraisure),
          end:'blind'|'through', depth (profondeur à plein Ø), tip (angle de pointe,
          0 = fond plat), flip (sens), op:'cut'}
     Taraudé : d = Ø de perçage du taraud (M − pas) ; filet cosmétique (dessin seul)
     ou modélisé (profil ISO creusé dans le corps, V0.21.16) — l'info voyage jusqu'à la FAO.
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
// Vis CHC ANSI (ASME B18.3, pouces) : perçage de passage « normal fit », Ø lamage,
// profondeur = hauteur de tête + 0,4 mm (comme les CHC ISO) — V0.20.3
const INCH=25.4,inMm=function(v){return +(v*INCH).toFixed(2);};
const ANSI_CHC=[['#2',.1065,.188,.086],['#4',.136,.219,.112],['#5',.154,.25,.125],['#6',.1695,.281,.138],['#8',.1935,.313,.164],
  ['#10',.221,.375,.19],['1/4"',.281,.438,.25],['5/16"',.344,.531,.3125],['3/8"',.406,.625,.375],['7/16"',.469,.75,.4375],
  ['1/2"',.531,.812,.5],['5/8"',.656,1,.625],['3/4"',.781,1.188,.75],['7/8"',.906,1.375,.875],['1"',1.031,1.625,1]]
  .map(function(c){return [c[0],inMm(c[1]),inMm(c[2]),Math.ceil((c[3]*INCH+0.4)*10-1e-6)/10];});
// Vis FHC : passage, Ø de tête théorique dk max, angle de tête. La fraisure (même angle)
// est agrandie pour que la tête reste au moins 0,2 mm SOUS la surface d'entrée :
// Ø fraisure = dk + 2×0,2×tan(angle/2), arrondi au 0,1 supérieur.
// ISO 10642 : 90° ; ANSI (ASME B18.3, pouces) : 82° — V0.20.3.
const FHC_RETRAIT=0.2;
const ISO_FHC=[['M3',3.4,6.72],['M4',4.5,8.96],['M5',5.5,11.2],['M6',6.6,13.44],['M8',9,17.92],
  ['M10',11,22.4],['M12',13.5,26.88],['M14',15.5,30.8],['M16',17.5,33.6],['M20',22,40.32]];
const ANSI_FHC=[['#2',.1065,.197],['#4',.136,.255],['#5',.154,.281],['#6',.1695,.307],['#8',.1935,.359],['#10',.221,.411],
  ['1/4"',.281,.531],['5/16"',.344,.656],['3/8"',.406,.781],['7/16"',.469,.844],['1/2"',.531,.938],['5/8"',.656,1.188],
  ['3/4"',.781,1.438],['7/8"',.906,1.688],['1"',1.031,1.938]].map(function(c){return [c[0],inMm(c[1]),inMm(c[2]),82];});
function fhcCsD(c){ return Math.ceil((c[2]+2*FHC_RETRAIT*Math.tan((c[3]||90)*Math.PI/360))*10-1e-6)/10; }
// Vis dont les cotes correspondent au perçage (le choix reste affiché tant qu'on ne touche pas aux valeurs)
function holeScrewOf(f){
  if(!f||(f.thread&&f.thread.size))return '';
  const eq=function(a,b){return Math.abs(+a-b)<1e-6;};
  let c=null;
  if(f.kind==='cbore')c=ISO_CHC.concat(ANSI_CHC).find(function(x){return eq(f.d,x[1])&&eq(f.cbD,x[2])&&eq(f.cbH,x[3]);});
  else if(f.kind==='csink')c=ISO_FHC.concat(ANSI_FHC).find(function(x){return eq(f.d,x[1])&&eq(f.csD,fhcCsD(x))&&eq(f.csA||90,x[3]||90);});
  return c?c[0]:'';
}
// Filetages hors métrique ISO (V0.20.3), au même format [taille, Ø nominal, pas] (un seul pas) :
// • ANSI UNC / UNF (ASME B1.1, profil 60° comme l'ISO) ;
// • pas du gaz : G (ISO 228, cylindrique), Rc (ISO 7, conique 1:16), NPT (ASME B1.20.1, conique) — 55° / 60°.
// THREAD_INFO[taille] = {fam, drill (Ø de perçage du taraud, tables usuelles), cone (conique), model (filet modélisable)}.
const THREAD_INFO={};
const THREADS_UN=[],THREADS_GAZ=[];
[['#2',.086,56,.07,64,.07],['#4',.112,40,.089,48,.0935],['#5',.125,40,.1015,44,.104],['#6',.138,32,.1065,40,.113],
 ['#8',.164,32,.136,36,.136],['#10',.19,24,.1495,32,.159],['#12',.216,24,.177,28,.182],['1/4',.25,20,.201,28,.213],
 ['5/16',.3125,18,.257,24,.272],['3/8',.375,16,.3125,24,.332],['7/16',.4375,14,.368,20,.3906],['1/2',.5,13,.4219,20,.4531],
 ['9/16',.5625,12,.4844,18,.5156],['5/8',.625,11,.5312,18,.5781],['3/4',.75,10,.6562,16,.6875],['7/8',.875,9,.7656,14,.8125],
 ['1',1,8,.875,12,.9219]].forEach(function(u){
  [['UNC',u[2],u[3]],['UNF',u[4],u[5]]].forEach(function(k){
    const n=u[0]+'-'+k[1]+' '+k[0];
    THREADS_UN.push([n,+(u[1]*INCH).toFixed(3),+(INCH/k[1]).toFixed(4)]);
    THREAD_INFO[n]={fam:k[0],tpi:k[1],drill:inMm(k[2]),cone:false,model:true};
  });
});
[['1/16',7.723,28,6.8,6.6],['1/8',9.728,28,8.8,8.4],['1/4',13.157,19,11.8,11.2],['3/8',16.662,19,15.25,14.75],
 ['1/2',20.955,14,19,18.25],['3/4',26.441,14,24.5,23.75],['1',33.249,11,30.75,30],['1 1/4',41.91,11,39.5,38.5],
 ['1 1/2',47.803,11,45.25,44.5],['2',59.614,11,57,56]].forEach(function(g){
  const p=+(INCH/g[2]).toFixed(4);
  THREADS_GAZ.push(['G'+g[0],g[1],p]);THREAD_INFO['G'+g[0]]={fam:'G',tpi:g[2],drill:g[3],cone:false,model:false};
  THREADS_GAZ.push(['Rc'+g[0],g[1],p]);THREAD_INFO['Rc'+g[0]]={fam:'Rc',tpi:g[2],drill:g[4],cone:true,model:false};
});
[['1/16',7.94,27,6.3],['1/8',10.29,27,8.7],['1/4',13.72,18,11.1],['3/8',17.15,18,14.7],['1/2',21.34,14,18.3],
 ['3/4',26.67,14,23.4],['1',33.4,11.5,29.4],['1 1/4',42.16,11.5,38.1],['1 1/2',48.26,11.5,44],['2',60.33,11.5,56.3]].forEach(function(g){
  const n=g[0]+' NPT';THREADS_GAZ.push([n,g[1],+(INCH/g[2]).toFixed(4)]);THREAD_INFO[n]={fam:'NPT',tpi:g[2],drill:g[3],cone:true,model:false};
});
const ALL_THREADS=ISO_THREADS.concat(THREADS_UN,THREADS_GAZ);
function isoThread(size){ return ALL_THREADS.find(function(t){return t[0]===size;})||null; }
function threadInfo(size){ return THREAD_INFO[size]||{fam:'M',drill:0,cone:false,model:true}; }
function tapDrill(size,p){
  const t=isoThread(size);if(!t)return null;const I=threadInfo(size);
  if(I.drill>0&&(!p||Math.abs(+p-t[2])<1e-6))return I.drill;
  return +(t[1]-(p||t[2])).toFixed(2);
}
// Libellé d'un pas dans les listes : « M8 (pas 1,25) », « M8×1 (fin) », « 1/4-20 UNC (20 filets/po) », « G1/4 (19 filets/po) »
function threadOptLabel(t,k){
  const I=threadInfo(t[0]);
  if(I.fam!=='M')return t[0]+' ('+I.tpi+' filets/po'+(I.cone?', conique':'')+')';
  return k>2?(t[0]+'×'+String(t[k]).replace('.',',')+' (fin)'):(t[0]+' (pas '+String(t[2]).replace('.',',')+')');
}
// Filet interne ISO 68-1 / ISO 965-1 : crête (Ø mineur D1) méplat p/4, racine
// (Ø majeur D) méplat p/8, flancs à 60°. `jeu` est un jeu d'impression sur le
// DIAMÈTRE (mm) : chaque rayon est décalé de jeu/2.
function isoHoleThread(size,p,jeu){
  const t=isoThread(size);if(!t||!threadInfo(size).model)return null; // pas du gaz (55° / conique) : cosmétique seulement
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
// 2026-10-19 : filet MODÉLISÉ — gorge hélicoïdale creusée dans le corps.
// Le trou reste percé au Ø de perçage (≥ Ø mineur + jeu) et l'on retire en plus la
// gorge comprise entre la crête (R1) et la racine (R2) le long de l'hélice au pas réel.
// V0.21.16 : profil ISO 68-1 EXACT. Le profil normalisé est défini dans le plan AXIAL
// (flancs à 60° mesurés dans une coupe passant par l'axe) ; il était auparavant posé
// perpendiculairement à l'hélice (trièdre de Frenet), ce qui le déformait, sur une
// hélice approchée par points. Désormais :
//  - hélice EXACTE : droite tracée sur le cylindre (u = angle, v = axe), courbe 3D
//    déduite par le noyau (BRepLib.BuildCurves3d) ;
//  - balayage en mode « binormale = axe » : le profil reste dans le plan axial à
//    chaque tour, la coupe du trou montre le trapèze ISO (racine p/8, crête p/4, 60°).
// Profil (vide, filet INTERNE) : méplat p/8 au Ø majeur, flancs à 60°, prolongé sous
// le Ø mineur (rIn) pour recouvrir franchement le perçage : aucune pellicule, aucune
// face confondue avec l'alésage.
function occHoleThreadGroove(P,D,zStart,zLen,th,bins){
  const p=th.P,r1=th.rCrete,r2=th.rRacine;
  if(!(zLen>0.9*p))return null; // moins d'un pas : rien de représentable
  const cross=function(a,b){return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x};};
  const norm=function(a){const l=Math.hypot(a.x,a.y,a.z)||1;return {x:a.x/l,y:a.y/l,z:a.z/l};};
  const ref=Math.abs(D.z)<0.9?{x:0,y:0,z:1}:{x:1,y:0,z:0};
  // Départ de l'hélice tourné de ~37° : aligné sur la couture des cylindres/cônes du
  // perçage (même repère), le cœur du trou restait en solide séparé après la découpe.
  const U0=norm(cross(D,ref)),V0=cross(D,U0),ca=Math.cos(0.65),sa=Math.sin(0.65);
  const U={x:U0.x*ca+V0.x*sa,y:U0.y*ca+V0.y*sa,z:U0.z*ca+V0.z*sa};
  // L'hélice commence à zStart + p/2 : le profil (demi-largeur < p/2) couvre [zStart, zStart+zLen].
  const z0=zStart+p/2,turns=Math.max(0.25,zLen/p-1);
  const O={x:P.x+D.x*z0,y:P.y+D.y*z0,z:P.z+D.z*z0};
  const pnt=function(q){return occBinPush(bins,new occt.gp_Pnt_3(q.x,q.y,q.z));};
  const dirOf=function(q){return occBinPush(bins,new occt.gp_Dir_4(q.x,q.y,q.z));};
  // hélice à droite : u croît autour de D pendant que v avance le long de D
  const ax3=occBinPush(bins,new occt.gp_Ax3_3(pnt(O),dirOf(D),dirOf(U)));
  const hSurf=occBinPush(bins,new occt.Handle_Geom_Surface_2(new occt.Geom_CylindricalSurface_1(ax3,r1))); // la poignée possède la surface
  const hLine=occBinPush(bins,new occt.Handle_Geom2d_Curve_2(new occt.Geom2d_Line_3(
    occBinPush(bins,new occt.gp_Pnt2d_3(0,0)),occBinPush(bins,new occt.gp_Dir2d_4(2*Math.PI,p))))); // la poignée possède la droite
  const me=occBinPush(bins,new occt.BRepBuilderAPI_MakeEdge_31(hLine,hSurf,0,turns*Math.hypot(2*Math.PI,p)));
  if(!me.IsDone())throw new Error('hélice impossible');
  const helix=me.Edge();
  occt.BRepLib.BuildCurves3d_2(helix);
  const mkS=occBinPush(bins,new occt.BRepBuilderAPI_MakeWire_2(helix));
  if(!mkS.IsDone())throw new Error('fil d\'hélice impossible');
  // profil dans le plan (U, D) au départ de l'hélice ; s = décalage axial
  const t30=Math.tan(Math.PI/6),rIn=r1-Math.min(0.05,0.1*p);
  const hw=function(r){return p/16+(r2-r)*t30;}; // demi-largeur de la gorge au rayon r
  const at=function(r,s){return pnt({x:O.x+U.x*r+D.x*s,y:O.y+U.y*r+D.y*s,z:O.z+U.z*r+D.z*s});};
  const poly=occBinPush(bins,new occt.BRepBuilderAPI_MakePolygon_1());
  [[r2,-p/16],[r2,p/16],[rIn,hw(rIn)],[rIn,-hw(rIn)]].forEach(function(q){poly.Add_1(at(q[0],q[1]));});
  poly.Close();
  if(!poly.IsDone())throw new Error('profil de filet impossible');
  const pipe=occBinPush(bins,new occt.BRepOffsetAPI_MakePipeShell(mkS.Wire()));
  pipe.SetMode_3(dirOf(D));
  pipe.Add_1(poly.Wire(),false,false);
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
  // Outil = COMPOSÉ des corps (pas de fuse) — bien plus rapide qu'un fuse explicite avec
  // la gorge hélicoïdale.
  // V0.21.16 : filet modélisé → outil en ÉTAPES, découpées dans l'ordre de l'usinage
  // (occCutEach, src/20) : 1) avant-trou (fût + pointe), 2) filet (gorges), 3) tête
  // (lamage ou fraisure). Tout ensemble, ou le cône avant la gorge, le noyau échouait
  // en silence (filet absent, ou cœur du trou laissé en 2ᵉ solide).
  const tool=[],stages=[[],[],[]];
  const add=function(sh,k){ (thModel?stages[k||0]:tool).push(sh); };
  const OVER=0.02; // départ légèrement au-dessus du plan : jamais de face coplanaire
  const segShape=function(P,sg,first){
    // 1er segment rallongé de OVER au-dessus du plan : un CÔNE (fraisure) est prolongé
    // sur sa génératrice, sinon le Ø au ras de la face serait trop petit (10,96 pour 11).
    const z0=sg[0]-(first?OVER:0),h=sg[1]+(first?OVER:0);
    const r0=(first&&sg[1]>1e-9)?sg[2]+OVER*(sg[2]-sg[3])/sg[1]:sg[2];
    const o=occBinPush(bins,new occt.gp_Pnt_3(P.x+D.x*z0,P.y+D.y*z0,P.z+D.z*z0));
    const ax=occBinPush(bins,new occt.gp_Ax2_3(o,dir));
    let sh=null;
    if(Math.abs(sg[2]-sg[3])<1e-9){const mk=new occt.BRepPrimAPI_MakeCylinder_3(ax,sg[2],h);sh=mk.Shape();try{mk.delete();}catch(e){}}
    else{const mk=new occt.BRepPrimAPI_MakeCone_3(ax,r0,sg[3],h);sh=mk.Shape();try{mk.delete();}catch(e){}}
    return sh;
  };
  A.pts.forEach(function(P){
    const zEnd=zEndOf(P);
    // Filet modélisé : l'avant-trou est le fût SEUL depuis la face ; la tête vient en étape 3.
    const segs=holeProfileSegs(thModel?Object.assign({},N,{kind:'simple'}):N,zEnd);
    // Les segments du profil (fût, lamage/fraisure, pointe) sont FUSIONNÉS : une découpe
    // avec un composé laisse les opercules internes (membrane au fond du lamage). Les
    // segments suivants gardent leurs bornes exactes — c'est la fusion, et non un
    // recouvrement, qui supprime ces opercules.
    let prof=null;
    segs.forEach(function(sg,i){const sh=segShape(P,sg,i===0);prof=prof?occFuse(prof,sh):sh;});
    add(prof,0);
    if(thModel&&N.kind!=='simple')add(segShape(P,holeProfileSegs(N,zEnd)[0],true),2);
    if(thModel){
      const off=(N.kind==='cbore')?N.cbH:(N.kind==='csink'?Math.max(0,(N.csD-N.d)/2/Math.tan(N.csA*Math.PI/360)):0);
      const L=((f.thread.lenMode||'len')==='through')?Math.max(0,zEnd-off)
        :Math.min(+f._thLen||+f.thread.len||N.depth,zEnd-off);
      try{
        // La gorge DÉPASSE l'entrée d'un pas (et la sortie pour un débouchant) : la
        // jonction hélice/pièce tombe hors matière, il ne reste ni lèvre ni face de cap.
        const lead=thModel.P,leadOut=(N.through||N.end==='next')?thModel.P:0;
        const g=occHoleThreadGroove(P,A.dir,off-lead,L+lead+leadOut,thModel,bins);
        if(g)add(g,1);
        else warnings.push('filet modélisé ignoré : longueur filetée inférieure à un pas');
      }catch(err){warnings.push('filet modélisé impossible (trou lisse) : '+String(err.message||err));}
    }
  });
  if(thModel){
    // composé de composés = étapes ordonnées (occCutEach) ; une étape vide est omise
    const comp=function(list){const c=new occt.TopoDS_Compound(),bd=new occt.TopoDS_Builder();
      bd.MakeCompound(c);list.forEach(function(s){bd.Add(c,s);});try{bd.delete();}catch(e){}return c;};
    const st=stages.filter(function(l){return l.length;});
    if(!st.length)throw new Error('aucun corps d’outil de perçage');
    return {shape:comp(st.map(comp)),bins:bins,warnings:warnings};
  }
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
  const snap0=docSnap(),len0=docUndoStack.length; // V0.8.0 : Annuler retire le perçage
  docPushUndo('perçage');
  addFeature(nf);
  try{ fdynStart(nf,snap0,len0); }catch(e){}
  if(sk.visible!==false)sk.visible=false;
  ghostHide=nf.id;
  sel={kind:'feature',id:nf.id};
  markDirty();rebuild();renderTree();renderProps();
  faceEl.textContent='Perçage : tirez la flèche ou tapez la profondeur, réglez le type, puis OK (Échap = annuler).';
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
  // une entrée {g:'titre'} ouvre un groupe (optgroup) — V0.20.3
  const sel=function(opts,val,fn){const s=document.createElement('select');let grp=s;
    opts.forEach(function(o){if(o.g){grp=document.createElement('optgroup');grp.label=o.g;s.appendChild(grp);return;}
      const op=document.createElement('option');op.value=o[0];op.textContent=o[1];grp.appendChild(op);});
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
  // V0.8.0 : type en icônes (fenêtre dynamique)
  const segT=extSeg([['simple','⊚','Simple','Trou cylindrique'],['cbore','⊡','Lamage','Lamage pour tête de vis'],['csink','⊽','Fraisure','Fraisure conique']],f.kind||'simple',
    function(v){docPushUndo('perçage');f.kind=v;go();});
  pRow('Type',segT);
  /* taraudage */
  const thOpts=[['','Aucun (trou lisse)'],{g:'Métrique ISO'}];
  ISO_THREADS.forEach(function(t){for(let k=2;k<t.length;k++)thOpts.push([t[0]+'|'+t[k],threadOptLabel(t,k)]);});
  // V0.20.3 : ANSI UNC / UNF, pas du gaz G (cylindrique), Rc et NPT (coniques)
  [['UNC','ANSI UNC (gros)'],['UNF','ANSI UNF (fin)'],['G','Gaz G — cylindrique (ISO 228)'],['Rc','Gaz Rc — conique (ISO 7)'],['NPT','NPT — conique (ANSI)']].forEach(function(F){
    thOpts.push({g:F[1]});
    THREADS_UN.concat(THREADS_GAZ).forEach(function(t){if(threadInfo(t[0]).fam===F[0])thOpts.push([t[0]+'|'+t[2],threadOptLabel(t,2)]);});});
  pRow('Taraudage',sel(thOpts,f.thread&&f.thread.size?(f.thread.size+'|'+f.thread.p):'',function(v){
    if(!v){f.thread=null;return;}
    const q=v.split('|'),pz=+q[1],prev=f.thread||{};
    // conserve le mode de longueur, la face choisie et les options d'impression
    f.thread=Object.assign({},prev,{size:q[0],p:pz});
    if(!threadInfo(q[0]).model)f.thread.model=false; // pas du gaz : filet cosmétique seulement
    if(!(f.thread.len>0))f.thread.len=Math.max(2*isoThread(q[0])[1],+f.depth-2*pz);
    f.d=tapDrill(q[0],pz);
    if(f.kind==='csink')f.csD=+(isoThread(q[0])[1]*1.1+0.4).toFixed(2);
  }));
  /* vis CHC (lamage) */
  const fr=function(v){return String(v).replace('.',',');};
  if(f.kind==='cbore')pRow('Vis CHC',sel([['','—'],{g:'ISO 4762 (métrique)'}].concat(ISO_CHC.map(function(c){return [c[0],c[0]+' : Ø'+fr(c[1])+' / lamage Ø'+fr(c[2])+' × '+fr(c[3])];}),
    [{g:'ANSI B18.3 (pouces)'}],ANSI_CHC.map(function(c){return [c[0],c[0]+' : Ø'+fr(c[1])+' / lamage Ø'+fr(c[2])+' × '+fr(c[3])];})),holeScrewOf(f),function(v){
    const c=ISO_CHC.concat(ANSI_CHC).find(function(x){return x[0]===v;});if(!c)return;f.thread=null;f.d=c[1];f.cbD=c[2];f.cbH=c[3];}));
  /* vis FHC (fraisure) : tête au moins 0,2 mm sous la surface */
  const fhcOpt=function(c){return [c[0],c[0]+' : Ø'+fr(c[1])+' / fraisure Ø'+fr(fhcCsD(c))+' × '+(c[3]||90)+'° (tête −'+fr(FHC_RETRAIT)+')'];};
  if(f.kind==='csink')pRow('Vis FHC',sel([['','—'],{g:'ISO 10642 (métrique, 90°)'}].concat(ISO_FHC.map(fhcOpt),[{g:'ANSI B18.3 (pouces, 82°)'}],ANSI_FHC.map(fhcOpt)),holeScrewOf(f),function(v){
    const c=ISO_FHC.concat(ANSI_FHC).find(function(x){return x[0]===v;});if(!c)return;f.thread=null;f.d=c[1];f.csD=fhcCsD(c);f.csA=c[3]||90;}));
  /* Ø */
  pRow(f.thread&&f.thread.size?'Ø taraud '+holeThreadLabel(f.thread):'Ø du trou',num(f.d,function(v){f.d=v;},0,f,'d'));
  if(f.thread&&f.thread.size){
    pRow('Longueur filetée',sel([['len','Longueur'],['through','Débouchant tout (à travers)'],['upto','Jusqu\'à la face…'],['next','Prochaine face']],f.thread.lenMode||'len',function(v){
      f.thread.lenMode=v;if(v==='upto'&&!f.thread.uptoPlane)setTimeout(function(){holeFacePickStart(f.id,'thread');},0);}));
    const tm=f.thread.lenMode||'len';
    if(tm==='len')pRow('Longueur (mm)',num(f.thread.len||f.depth,function(v){f.thread.len=v;},0,f.thread,'len'));
    else if(tm==='upto')pBtns([['Sélectionner la face',function(){holeFacePickStart(f.id,'thread');}]]);
    if(f._thLen)pNote('Longueur filetée effective : '+String(f._thLen).replace('.',',')+' mm');
    if(!threadInfo(f.thread.size).model)pNote('Filet '+(threadInfo(f.thread.size).cone?'conique ':'')+'cosmétique seulement (profil non modélisé) ; Ø de perçage du taraud selon les tables usuelles.');
    else pRow('Filet',sel([['model','Modélisé — profil ISO dans le corps'],['cosmetic','Cosmétique (dessin seul, trou lisse)']],f.thread.model?'model':'cosmetic',function(v){
      f.thread.model=(v==='model');if(f.thread.model&&f.thread.clear==null)f.thread.clear=0;}));
    if(f.thread.model){
      // V0.21.16 : jeu 0 = profil nominal ISO ; > 0 seulement pour l'impression 3D
      pRow('Jeu (Ø mm, impression 3D)',num0(f.thread.clear==null?0:f.thread.clear,function(v){f.thread.clear=v;},0));      const th=isoHoleThread(f.thread.size,f.thread.p,f.thread.clear);
      if(th){const fx=v=>String(+(+v).toFixed(3)).replace('.',',');
        pNote((threadInfo(f.thread.size).fam==='M'?'ISO 261 / ISO 965-1':'ASME B1.1 (profil 60°)')+' : Ø mineur '+fx(th.D1)+' (crête) / Ø majeur '+fx(th.D)+' (racine), pas '+fx(th.P)+' mm — '+
          Math.max(1,Math.round((+f._thLen||+f.thread.len||th.P*3)/th.P))+' spire(s). Noyau exact requis.');}
    }
  }
  if(f.kind==='cbore'){pRow('Ø lamage',num(f.cbD,function(v){f.cbD=v;},0,f,'cbD'));pRow('Profondeur lamage',num(f.cbH,function(v){f.cbH=v;},0,f,'cbH'));}
  if(f.kind==='csink'){pRow('Ø fraisure',num(f.csD,function(v){f.csD=v;},0,f,'csD'));pRow('Angle (°)',sel([['90','90°'],['82','82° (UNC)'],['100','100°'],['120','120°']],String(f.csA||90),function(v){f.csA=+v;}));}
  /* fin */
  // V0.8.0 : fin en icônes
  pRow('Fin',extSeg([['blind','📏','Borgne','Profondeur donnée (flèche dans la vue)'],['upto','🎯','Jusqu’à la face','S’arrête sur une face choisie'],
    ['next','⤓','Débouchant','Jusqu’à la prochaine face'],['through','⤴','Tout','Traverse tout']],f.end||'blind',
    function(v){docPushUndo('perçage');f.end=v;if(v==='upto'&&!f.uptoPlane)setTimeout(function(){holeFacePickStart(f.id,'end');},0);go();}));
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
      // V0.15.11 : corps CONTENEUR de la fonction (f.body). L'ancien f.bodyId n'existe sur aucune
      // fonction : les filets n'appartenaient à aucun corps et restaient visibles corps caché.
      out.push({bodyId:(typeof occBodyOfFeat==='function'?occBodyOfFeat(f):f.body)||null,helix:helix,ring:ring,spt:steps/turns});
    });
  });
  return out;
}
/* V0.15.11 : « quand je cache un corps avec des trous taraudés, je veux cacher aussi les filets ».
   Un filet est montré tant que son corps l'est : œil du corps (doc.bodyVis), mais aussi tout ce
   qui cache le maillage sans passer par lui (clic droit « Cacher », isoler, esquisse en mode
   fantôme, sélection d'arêtes de congé). On suit donc la visibilité RÉELLE des maillages du
   corps ; corps sans maillage affiché (rejeu en cours) : seul doc.bodyVis décide. */
function holeThreadBodyShown(bid,memo){
  if(!bid)return true;
  if(memo&&memo.has(bid))return memo.get(bid);
  let r=!(doc.bodyVis&&doc.bodyVis[bid]===false);
  if(r){
    let seen=false,shown=false;
    (typeof bodies!=='undefined'&&bodies?bodies:[]).forEach(function(b){
      if(!b||b.ghost||!b.mesh)return;
      let id=null;try{id=bodyIdOfRuntime(b);}catch(e){}
      if(id!==bid)return;
      seen=true;if(b.mesh.visible!==false)shown=true;
    });
    r=!seen||shown;
  }
  if(memo)memo.set(bid,r);
  return r;
}
let holeThreadGrp=null; // groupe affiché (évite un parcours de scène à chaque image)
function holeThreadVisSync(){
  // Appelé à chaque image (10, animate) : quelques objets, une table par image.
  const g=holeThreadGrp;if(!g||!g.parent)return;
  const memo=new Map();
  for(const o of g.children){const v=holeThreadBodyShown(o.userData.bodyId,memo);if(o.visible!==v)o.visible=v;}
}
function holeThreadOverlay(){
  try{
    holeThreadGrp=null;
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
      const add=function(l){l.userData.bodyId=T.bodyId;grp.add(l);};
      if(helix.length)add(mkL(helix,0xffb340,0.9,false));
      if(ring.length)add(mkL(ring,0xffb340,0.95,true));
    });
    if(grp.children.length){scene.add(grp);holeThreadGrp=grp;holeThreadVisSync();}
  }catch(e){}
}
