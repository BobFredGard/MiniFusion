// 2026-10-02-011 : cache de rejeu par points de contrôle — le rejeu RAPIDE
// (freshHard=false, checkpoints réutilisés) doit produire une topologie
// STRICTEMENT IDENTIQUE au rejeu COMPLET (freshHard=true, purge avant chaque
// rejeu). Le rapide était désactivé par défaut de 2026-09-30a à -012 (réactivé
// par défaut au lot 2026-10-02-013) : la signature
// de préfixe (featSig) ne couvrait pas toutes les propriétés lues par la
// géométrie et un changement pouvait laisser un solide périmé au titre de
// « moins frais ». Filet : la fonction entière est sérialisée dans la
// signature (JSON.stringify d'une copie filtrée) — toute propriété, connue ou
// future, invalide dès qu'elle bouge.
// 1) structure : le filet existe dans src/20 (ROUGE avant implémentation) ;
// 2) comportement au noyau OCCT RÉEL : 5 scénarios (fin/milieu/tête de
// timeline), référence complète vs rejeu rapide — topologie strictement égale
// (faces/arêtes/sommets/solides/boîte) ET comportement des hits PENDANT le
// rebuild rapide : réutilisation prouvée en fin de timeline (hits>=1),
// invalidation totale en tête/milieu (hits===0, sinon solide périmé).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__src20=fs.readFileSync(path.join(ROOT,'src','20-noyau-et-operations-solides.js'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // ---------- 1) structure : le filet JSON.stringify est dans featSig ----------
    "const iF=__src20.indexOf('function featSig('),iE=__src20.indexOf('function occCkGet(');",
    "att(iF>0&&iE>iF,'src/20 : bornes de featSig introuvables');",
    "const corps=(iF>0&&iE>iF)?__src20.slice(iF,iE):'';",
    "att(/for\\(const k in f\\)/.test(corps)&&/JSON\\.stringify\\(/.test(corps),'featSig : copie filtrée des propriétés absente — le filet JSON.stringify(f) anti-propriété oubliée n est pas là');",
    "att(/k==='name'/.test(corps)&&/k==='open'/.test(corps)&&/k==='_m'/.test(corps)&&/k==='_mesh'/.test(corps),\"featSig : exclusions (name/open/_m/_mesh) incomplètes — replier/remanier invaliderait tout le cache ou un _mesh vivant planterait la signature\");",
    // ---------- 2) comportement : noyau OCCT réel ----------
    "const ex=(sh,t)=>{const x=new occt.TopExp_Explorer_2(sh,t,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);let n=0;while(x.More()){n++;x.Next();}x.delete();return n;};",
    "const nf=sh=>ex(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE);",
    "const ne=sh=>ex(sh,occt.TopAbs_ShapeEnum.TopAbs_EDGE);",
    "const nv=sh=>ex(sh,occt.TopAbs_ShapeEnum.TopAbs_VERTEX);",
    "const nsol=sh=>ex(sh,occt.TopAbs_ShapeEnum.TopAbs_SOLID);",
    "const bb=sh=>{const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()].map(x=>(+x).toFixed(4)).join(',');};",
    "const topo=function(){",
    "  const FR=occFinalShape(null);",
    "  if(!FR.shape){occCleanup(FR,null);return 'AUCUNE FORME';}",
    "  const t=nf(FR.shape)+'f/'+ne(FR.shape)+'e/'+nv(FR.shape)+'v/'+nsol(FR.shape)+'s @'+bb(FR.shape);",
    "  occCleanup(FR,null);return t;",
    "};",
    "let hits=0,phase='base';const __g=occCkGet;",
    "occCkGet=function(k){const r=__g(k);if(r&&phase==='rapide')hits++;return r;};",
    "const mkSq=(id,name,x0,y0,x1,y1)=>{",
    "  const sk={id:id,name:name,plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],visible:false};",
    "  [['p0',x0,y0,'e0','p1'],['p1',x1,y0,'e1','p2'],['p2',x1,y1,'e2','p3'],['p3',x0,y1,'e3','p0']].forEach(l=>{",
    "    sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "  return sk;",
    "};",
    "const docBase=()=>({",
    "  sketches:[mkSq('sk1','Base',0,0,100,60),mkSq('sk2','Poche',25,15,75,45),mkSq('sk3','Tour',70,40,90,60)],",
    "  features:[",
    "    {id:'E1',type:'extrude',name:'Base',sketchId:'sk1',op:'add',distance:40},",
    "    {id:'C1',type:'extrude',name:'Poche',sketchId:'sk2',op:'cut',distance:30},",
    "    {id:'E2',type:'extrude',name:'Tour',sketchId:'sk3',op:'add',distance:25}",
    "  ]});",
    "const charger=function(d){",
    "  doc.name='cache';doc.sketches=d.sketches;doc.features=d.features;",
    "  doc.bodies=[];doc.bodySeq=1;delete doc.activeBody;doc.bodyVis={};doc.entNames={};doc.fold={};",
    "  occSkipFeat=null;tlMark=null;markDirty();",
    "};",
    // nom, modif, minHits (1 = le préfixe DOIT être réutilisé, 0 = invalidation totale)
    "const cas=[",
    "  ['fin de timeline : distance E2 25→60',d=>{d.features[2].distance=60;},1],",
    "  ['fin de timeline : flip E2',d=>{d.features[2].flip=true;},1],",
    "  ['fin de timeline : congé 2D rayon 6 visé sur E2',d=>{d.features.push({id:'F1',type:'fillet',target:'E2',radius:6,name:'Congé 2D',visible:true});},1],",
    "  ['milieu de timeline : poche C1 « à travers tout »',d=>{d.features[1].through=true;},0],",
    "  ['tête de timeline : distance E1 40→50',d=>{d.features[0].distance=50;},0]",
    "];",
    "cas.forEach(c=>{",
    "  const nom=c[0],modif=c[1],minHits=c[2];",
    "  // référence : rejeu COMPLET (purge avant) sur le doc final",
    "  const d0=docBase();charger(d0);modif(doc);",
    "  phase='base';freshHard=true;occCkClear();markDirty();rebuild();",
    "  att(builtEngine==='exact',nom+' : la référence n est pas sur le moteur exact (builtEngine='+builtEngine+')');",
    "  const ref=topo();",
    "  // rejeu rapide : état de base construit (checkpoints remplis), puis modif + rejeu sans purge",
    "  const d1=docBase();charger(d1);",
    "  phase='base';freshHard=false;occCkClear();markDirty();rebuild();",
    "  att(builtEngine==='exact',nom+' : le rebuild de base n est pas sur le moteur exact');",
    "  const nCk=occCk.length;",
    "  hits=0;modif(doc);phase='rapide';markDirty();rebuild();phase='topo';",
    "  const rap=topo();",
    "  att(nCk>0,nom+' : aucun checkpoint posé après le rebuild de base (le test ne prouve rien)');",
    "  if(minHits)att(hits>=1,nom+' : le préfixe n a JAMAIS été réutilisé pendant le rebuild rapide ('+hits+' hit(s)) — le test ne prouve rien');",
    "  else att(hits===0,nom+' : '+hits+' hit(s) pendant le rebuild rapide — la modification de tête/milieu n a pas tout invalidé (solide périmé réutilisé)');",
    "  p(nom+' : complet '+ref+' | rapide '+rap+' ('+hits+' hit(s) rapide, '+nCk+' ck)');",
    "  att(ref===rap,nom+' : topologie RAPIDE ('+rap+') ≠ COMPLÈTE ('+ref+') — solide périmé ou différemment reconstruit');",
    "});",
    "occCkGet=__g;freshHard=true;phase='base';",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'cacheexact.js'});
  console.log('=== cache de rejeu : rapide vs complet (noyau réel) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,600));process.exit(1);});
