// 2026-10-01p : déflection d'AFFICHAGE commune natif/imports + référence FAO intacte.
// Avant : le natif tesselait avec occXDefl() (0,04 à 0,5 mm / 0,5 rad ≈ 29°) et un
// import STEP avec 0,5 mm / 0,5 rad fixes → deux pièces voisines n'avaient ni la même
// finesse ni le même ombrage. Maintenant occDisplayDefl() (commun) + budget de triangles,
// et occXDefl() — la référence d'OUTILLAGE — reste strictement inchangée.
// Le nombre de triangles est mesuré pour de vrai via le noyau OCCT (BRepMesh), le
// harnais ne sachant pas compter les attributs d'un BufferGeometry stub.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);

  const o=vm.runInContext(`(function(){
    const out={};
    // ── 1. les deux déflections, sur la même pièce ──
    const mk=new occt.BRepPrimAPI_MakeCylinder_1(30,40);
    const cy=mk.Shape();
    const boxMk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const box=boxMk.Shape();
    const tinyMk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),10,8,5);
    const tiny=tinyMk.Shape();
    const bigMk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),600,400,200);
    const big=bigMk.Shape();
    out.dispCyl=occDisplayDefl(cy);
    out.dispBox=occDisplayDefl(box);
    out.dispPetit=occDisplayDefl(tiny);
    out.dispGrand=occDisplayDefl(big);
    out.dispNull=occDisplayDefl(null);
    out.xDeflAvant=occXDefl(); // SANS congé dans ce document

    // compte réel de triangles à une définition donnée (le noyau, pas le stub)
    const tris=(sh,lin,ang)=>{
      new occt.BRepMesh_IncrementalMesh_2(sh,lin,false,ang,false);
      let n=0;
      const SH=occt.TopAbs_ShapeEnum.TopAbs_SHAPE;
      const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,SH);
      while(ex.More()){
        const f=occt.TopoDS.Face_1(ex.Current());
        const loc=new occt.TopLoc_Location_1();
        try{const h=occt.BRep_Tool.Triangulation(f,loc);if(h&&!h.IsNull())n+=h.get().NbTriangles();}catch(e){}
        try{loc.delete();}catch(e){}
        ex.Next();
      }
      try{ex.delete();}catch(e){}
      return n;
    };
    out.cylHerite=tris(cy,0.5,0.5);           // définition héritée (avant : imports)
    out.cylAffichage=tris(cy,out.dispCyl.lin,out.dispCyl.ang);
    out.boxAffichage=tris(box,out.dispBox.lin,out.dispBox.ang);
    out.boxHerite=tris(box,0.5,0.5);

    // ── 2. occXDefl() : la référence FAO doit être EXACTEMENT celle d'avant ──
    doc.features.push({id:'XF',type:'xfillet',name:'Congé',target:'E1',chamfer:false,
      edges:[{pos:[0,0,0],r:2,len:10}],visible:true});
    out.xDeflConge=occXDefl();
    doc.features.pop();

    // ── 3. la tessellation budgétée : bornage, mutation grossière, repli ──
    // (countFn = sonde de comptage : le harnais n'a pas de compteurs d'attributs THREE)
    out.budget={};
    try{
      // D0 = référence mesurée AU MÊME INSTANT (la boîte englobante dépend d'une
      // éventuelle triangulation déjà posée sur la pièce : on ne la compare pas
      // à la valeur lue avant les tessellations).
      const D0=occDisplayDefl(cy),D=occDisplayDefl(cy);
      out.budget.g=!!occTessellateBudget(cy,D,OCC_DISPLAY_TRIS,()=>6);
      out.budget.intact=(D.lin===D0.lin&&D.ang===D0.ang);
    }catch(e){out.budget.err=e.message;}
    try{
      const D=occDisplayDefl(cy);out.budget.lin0=D.lin;out.budget.ang0=D.ang;let k=0;
      out.budget.mut=!!occTessellateBudget(cy,D,1,()=>((++k)===1?9999999:3));
      out.budget.mutLin=D.lin;out.budget.mutAng=D.ang;
    }catch(e){out.budget.mutErr=e.message;}
    try{
      const D=occDisplayDefl(cy);
      out.budget.epuise=(occTessellateBudget(cy,D,1,()=>9999999)===null);
      out.budget.epuiseLin=D.lin;out.budget.epuiseAng=D.ang;
    }catch(e){out.budget.epuiseErr=e.message;}
    try{cy.delete();}catch(e){}try{mk.delete();}catch(e){}
    try{box.delete();}catch(e){}try{boxMk.delete();}catch(e){}
    try{tiny.delete();}catch(e){}try{tinyMk.delete();}catch(e){}
    try{big.delete();}catch(e){}try{bigMk.delete();}catch(e){}
    return out;
  })()`,ctx);

  console.log('=== 2026-10-01p : déflection d\'affichage commune + référence FAO ===');
  console.log('  affichage cylindre : lin='+o.dispCyl.lin.toFixed(4)+' ang='+o.dispCyl.ang+'  | boîte : lin='+o.dispBox.lin.toFixed(4)+' ang='+o.dispBox.ang);
  console.log('  cylindre : héritée 0,5/0,5 → '+o.cylHerite+' tris  ·  affichage → '+o.cylAffichage+' tris');
  console.log('  boîte    : héritée 0,5/0,5 → '+o.boxHerite+' tris  ·  affichage → '+o.boxAffichage+' tris');
  console.log('  occXDefl sans congé : '+JSON.stringify(o.xDeflAvant)+'  avec congé R2 : '+JSON.stringify(o.xDeflConge));
  A(o.dispCyl.ang===0.2&&o.dispBox.ang===0.2,'angulaire d\'affichage = 0,2 rad (~11°) au lieu de 0,5 rad (~29°)');
  A(o.dispCyl.lin>=0.05&&o.dispCyl.lin<=0.35,'linéaire borné [0,05 ; 0,35] mm ('+o.dispCyl.lin.toFixed(4)+')');
  A(o.dispBox.lin>=0.05&&o.dispBox.lin<=0.35,'idem sur une autre pièce ('+o.dispBox.lin.toFixed(4)+')');
  A(o.dispPetit.lin===0.05,'petite pièce → plancher de finesse (0,05 mm au lieu de '+o.dispPetit.lin.toFixed(5)+')');
  A(o.dispGrand.lin>o.dispPetit.lin&&o.dispGrand.lin>o.dispCyl.lin,
    'finesse proportionnelle à la pièce (grand '+o.dispGrand.lin.toFixed(3)+' > petit '+o.dispPetit.lin.toFixed(3)+')');
  A(o.dispNull.ang===0.2,'pièce nulle / inconnue : déflection par défaut, pas de plantage');
  A(o.cylAffichage>o.cylHerite,'le cylindre est MAINTENANT plus fin que la définition héritée ('+o.cylAffichage+' > '+o.cylHerite+' tris)');
  A(o.boxAffichage>=o.boxHerite,'la boîte plane n\'est pas dégradée ('+o.boxAffichage+' >= '+o.boxHerite+' tris)');
  A(o.xDeflAvant.lin===0.5&&o.xDeflAvant.ang===0.5,'VERROU FAO : occXDefl() sans congé = 0,5/0,5 (inchangé)');
  A(o.xDeflConge.lin===0.2&&o.xDeflConge.ang===0.25,'VERROU FAO : occXDefl() avec congé R2 = 0,2/0,25 (inchangé)');
  A(o.budget&&o.budget.g===true,'occTessellateBudget renvoie une géométrie quand le budget tient');
  A(o.budget&&o.budget.intact===true,'dans le budget : la définition reste intacte (pas de mutation)');
  A(o.budget&&o.budget.mut===true&&o.budget.mutLin===Math.min(0.5,o.budget.lin0*4)&&o.budget.mutAng===0.4,
    'budget dépassé → palier grossier lin×4 ('+(o.budget?o.budget.lin0.toFixed(4):'?')+' → '+(o.budget?o.budget.mutLin.toFixed(4):'?')+') et ang×2 (0,2 → 0,4)');
  A(o.budget&&o.budget.epuise===true&&o.budget.epuiseLin===0.5&&o.budget.epuiseAng===0.6,
    'paliers épuisés → null : l\'appelant retombe sur occTessellate (jamais de gel)');
  A(o.budget&&!o.budget.err&&!o.budget.mutErr&&!o.budget.epuiseErr,'aucune exception sur la voie budgétée');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL '+(e&&e.name)+' : '+(e&&e.message));
  console.log(String((e&&e.stack)||e).slice(0,700));process.exit(1);});
