// Extrusion : (1) inversion du sens sans changer Plot/Poche, (2) dépouille signée
// / plan d'esquisse. Parcours complet sur le moteur : esquisse réelle, extrusion,
// rejeu, mesures géométriques — jamais de simple lecture de champ.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,false);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};",
    "const f1=v=>v.toFixed(1);",
    "const nf=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    // face plane ⊥ Z la plus haute : dimensions du « dessus » (où la dépouille se voit)
    "const topFace=function(sh){let best=null,bd=-1e18;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);",
    "  while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());",
    "    try{const ad=new occt.BRepAdaptor_Surface_2(f,true);",
    "      if(ad.GetType()===occt.GeomAbs_SurfaceType.GeomAbs_Plane){",
    "        const d=ad.Plane().Axis().Direction();",
    "        if(Math.abs(d.Z())>0.999){const z=ad.Plane().Location().Z();if(z>bd){bd=z;best=f;}}}ad.delete();}catch(e){}",
    "    ex.Next();}ex.delete();return best?{f:best,z:bd}:null;};",
    "const faceDims=function(f){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(f,b,false);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [z.X()-a.X(),z.Y()-a.Y()];};",
    "const sk={id:'sk_t',name:'Plaque',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "[['p0',0,0,'e0','p1'],['p1',100,0,'e1','p2'],['p2',100,60,'e2','p3'],['p3',0,60,'e3','p0']].forEach(l=>{",
    "  sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches=[sk];",
    "doc.features=[{id:'ex_t',type:'extrude',name:'Plot',sketchId:'sk_t',op:'add',distance:40,dist:40,d2:0}];",
    "occSkipFeat=null;",
    "const rejouer=()=>{try{occCk.length=0;}catch(e){}return occFinalShape(null);};",
    "let FR=rejouer();",
    "const B0=bb(FR.shape);",
    "p('référence plot 40 : z ['+f1(B0[2])+', '+f1(B0[5])+']');",
    "att(Math.abs(B0[2])<0.5&&Math.abs(B0[5]-40)<0.5,'référence : course attendue [0,40]');",
    "if(FR.shape)FR.shape.delete();",
    "const F=()=>doc.features.find(x=>x.id==='ex_t');",
    // ---------- 1. flip : même opération, côté opposé ----------
    "F().flip=true;FR=rejouer();",
    "const B1=bb(FR.shape);",
    "p('plot + flip : z ['+f1(B1[2])+', '+f1(B1[5])+']  (attendu miroir [−40, 0])');",
    "att(Math.abs(B1[5])<0.5&&Math.abs(B1[2]+40)<0.5,'flip : course attendue [−40,0]');",
    "att(F().op==='add','flip : l opération a changé (doit rester Plot)');",
    "(FR.msgs||[]).forEach(m=>p('  ! '+m));",
    "if(FR.shape)FR.shape.delete();",
    // poche : sans flip la poche sous le plan ne retire rien ; avec flip elle mord le dessus
    "F().flip=false; // base à nouveau côté +n : seule la poche sera inversée",
    "// poche : profil STRICTEMENT intérieur (40x20) pour un booléen non dégénéré",
    "const skp={id:'sk_p',name:'Poche',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "[['q0',0,0,'f0','q1'],['q1',40,0,'f1','q2'],['q2',40,20,'f2','q3'],['q3',0,20,'f3','q0']].forEach(l=>{",
    "  skp.points[l[0]]={x:l[1],y:l[2]};skp.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches.push(skp);",
    "doc.features.push({id:'pk_t',type:'extrude',name:'Poche',sketchId:'sk_p',op:'cut',distance:-10});",
    "const PK=()=>doc.features.find(x=>x.id==='pk_t');",
    "FR=rejouer();",
    "const BP=bb(FR.shape);",
    "p('poche −10 sans flip : zmax='+f1(BP[5])+' (outil sous le plan → rien retiré, attendu 40)');",
    "att(Math.abs(BP[5]-40)<0.5,'poche sans flip : le dessus doit rester à 40');",
    "if(FR.shape)FR.shape.delete();",
    "PK().flip=true;FR=rejouer();",
    "const BPF=bb(FR.shape);",
    "p('poche −10 + flip : zmax='+f1(BPF[5])+' (outil au-dessus → fond à 10, dessus intact)');",
    "att(Math.abs(BPF[5]-40)<0.5,'poche + flip : le dessus (hors poche) doit rester à 40');",
    "att(PK().op==='cut','flip : l opération a changé (doit rester Poche)');",
    "const fond=function(){let bd=-1e18,dd=null;const ex=new occt.TopExp_Explorer_2(FR.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);",
    "  while(ex.More()){const f=occt.TopoDS.Face_1(ex.Current());",
    "    try{const ad=new occt.BRepAdaptor_Surface_2(f,true);",
    "      if(ad.GetType()===occt.GeomAbs_SurfaceType.GeomAbs_Plane){const d=ad.Plane().Axis().Direction();",
    "        if(Math.abs(d.Z())>0.999){const z=ad.Plane().Location().Z();if(z>9&&z<11&&z>bd){bd=z;dd=faceDims(f);}}}ad.delete();}catch(e){}",
    "    ex.Next();}ex.delete();return dd;};",
    "const df=fond();",
    "p('fond de poche : '+(df?f1(df[0])+' x '+f1(df[1]):'introuvable')+' (attendu 40 x 20 à z=10)');",
    "att(!!df&&Math.abs(df[0]-40)<0.6&&Math.abs(df[1]-20)<0.6,'poche + flip : fond 40x20 à z=10 attendu');",
    "if(FR.shape)FR.shape.delete();",
    "PK().flip=false;",
    "doc.features=doc.features.filter(x=>x.id!=='pk_t');",
    "F().flip=false;",
    // ---------- 2. dépouille signée / plan d'esquisse ----------
    "F().draft=10;FR=rejouer();",
    "const BD=bb(FR.shape);",
    "p('dépouille +10° : z ['+f1(BD[2])+', '+f1(BD[5])+'] (course inchangée)');",
    "att(Math.abs(BD[2])<0.5&&Math.abs(BD[5]-40)<0.5,'dépouille : la course doit rester [0,40]');",
    "const tp=topFace(FR.shape);",
    "att(!!tp,'dépouille : face de dessus introuvable');",
    "const dtp=tp?faceDims(tp.f):[0,0];",
    "p('dessus : '+f1(dtp[0])+' x '+f1(dtp[1])+' (base 100 x 60 — signe + = rétréci)');",
    "att(dtp[0]<99&&dtp[0]>70&&dtp[1]<59&&dtp[1]>30,'dépouille +10° : le dessus doit rétrécir (≈86 x 46)');",
    "if(FR.shape)FR.shape.delete();",
    "F().draft=-10;FR=rejouer();",
    "const tp2=topFace(FR.shape);const dtp2=tp2?faceDims(tp2.f):[0,0];",
    "p('dépouille −10° : dessus '+f1(dtp2[0])+' x '+f1(dtp2[1])+' (signe − = évasé)');",
    "att(dtp2[0]>101&&dtp2[1]>61,'dépouille −10° : le dessus doit s évaser (≈114 x 74)');",
    "if(FR.shape)FR.shape.delete();",
    "F().draft=0;FR=rejouer();",
    "const BZ=bb(FR.shape);",
    "p('dépouille 0 : z ['+f1(BZ[2])+', '+f1(BZ[5])+'] (identique référence)');",
    "att(Math.abs(BZ[5]-B0[5])<1e-6&&Math.abs(BZ[2]-B0[2])<1e-6,'dépouille 0 : doit être identique à la référence');",
    "if(FR.shape)FR.shape.delete();",
    // flip + dépouille combinés : pivot toujours au plan d'esquisse
    "F().flip=true;F().draft=10;FR=rejouer();",
    "const BC=bb(FR.shape);",
    "p('flip + dépouille +10° : z ['+f1(BC[2])+', '+f1(BC[5])+']');",
    "att(Math.abs(BC[5])<0.5&&Math.abs(BC[2]+40)<0.5,'flip+dépouille : course attendue [−40,0]');",
    "if(FR.shape)FR.shape.delete();",
    "F().flip=false;F().draft=0;",
    // angle extrême : avertissement + extrusion droite, jamais de crash
    "F().draft=80;FR=rejouer();",
    "const BX=bb(FR.shape);",
    "const w80=(FR.msgs||[]).filter(m=>/pouille/.test(m));",
    "p('dépouille 80° : z ['+f1(BX[2])+', '+f1(BX[5])+'] avertissements='+w80.length);",
    "w80.forEach(m=>p('  ! '+m));",
    "att(!!FR.shape,'dépouille 80° : le solide ne doit pas disparaître');",
    "if(FR.shape)FR.shape.delete();",
    "F().draft=0;",
    // ---------- 3. signature : le cache doit s'invalider ----------
    "const s0=featSig(F());F().flip=true;const s1=featSig(F());F().flip=false;F().draft=5;const s2=featSig(F());F().draft=0;",
    "p('signatures : base/flip/draft '+(s0===s1?'IDENTIQUES':'distinctes')+' / '+(s0===s2?'IDENTIQUES':'distinctes'));",
    "att(s0!==s1,'signature : flip inchangée → cache périmé réutilisé');",
    "att(s0!==s2,'signature : draft inchangé → cache périmé réutilisé');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'extrude_flip_draft.js'});
  console.log(r);
  process.exit(/ECHECS \(\d+\)/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,300));process.exit(1);});
