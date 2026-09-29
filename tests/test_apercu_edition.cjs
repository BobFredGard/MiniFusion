// 2026-09-31n : en ÉDITION, l'aperçu part dès l'entrée comme en création.
// On rejoue exactement ce calcul : solide SANS le congé (occSkipFeat, comme
// enterExactFilletMode en édition) + arêtes mémorisées de la fonction → jobs →
/// `xPreviewShape` doit produire le solide complet. Fichier réel Ma Pièce.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'tests','fixtures','Ma Pièce.minifusion.json'),'utf8');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};',
    'const bb=s=>{let E=[];try{E=occListEdges(s);}catch(e){return null;}',
    '  if(!E.length)return null;',
    '  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;',
    '  const add=p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);};',
    '  E.forEach(e=>{add(e.mid);add(e.pts[0]);add(e.pts[e.pts.length-1]);});',
    '  return {dx:x1-x0,dy:y1-y0,dz:z1-z0,n:E.length};};',
    'await deserialise('+JSON.stringify(json)+',{rebuild:false});',
    'occCkClear();markDirty();rebuild();',
    // prend le premier congé non-chanfrein avec des arêtes
    'const F=doc.features.find(f=>f.type==="xfillet"&&!f.chamfer&&(f.edges||[]).length>0);',
    'out.fonction=F?{nom:F.name,aretes:F.edges.length}:null;',
    // base SANS le congé, comme à l'entrée en édition (occSkipFeat) — via occFinalShape
    // direct + occLive manuel (pattern test_conge_reel : rebuild() seul ne remplit pas
    // occLive dans le harnais).
    'occSkipFeat=F.id;',
    'occCkClear();',
    'const FRB=occFinalShape(null);',
    'occSkipFeat=null;',
    'if(FRB&&FRB.shape){occLive={shape:FRB.shape};FRB.shape=null;}else{occLive=null;}',
    'if(!occLive||!occLive.shape){out.baseNulle=true;return out;}',
    'out.bbBase=bb(occLive.shape);',
    // appariement arêtes mémorisées -> arêtes vives (copie du code d'entrée d'aperçu)
    'const E=occListEdges(occLive.shape);',
    'const jobs=[];',
    'F.edges.forEach(s=>{',
    '  if(!(s.r>0))return;',
    '  let bi=-1,bd=1e9;',
    '  E.forEach((e,i)=>{const d=Math.hypot(e.mid[0]-s.pos[0],e.mid[1]-s.pos[1],e.mid[2]-s.pos[2]);if(d<bd){bd=d;bi=i;}});',
    '  if(bi>=0&&bd<1.5)jobs.push({src:E[bi].src,r:s.r,mid:E[bi].mid});',
    '});',
    'out.jobs=jobs.length+" / "+F.edges.length;',
    'const pv=xPreviewShape(occLive.shape,jobs,false);',
    'out.apercu=pv&&pv.shape?{bb:bb(pv.shape),aretes:bb(pv.shape).n}:null;',
    'if(pv&&pv.shape){try{pv.shape.delete();}catch(e){}}',
    'return out;'
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  const fx=v=>v?('solide '+v.dx.toFixed(0)+'×'+v.dy.toFixed(0)+'×'+v.dz.toFixed(0)+' mm, '+v.n+' arêtes'):'VIDE';
  console.log('=== 2026-09-31n : aperçu dès l\u2019entrée en édition ===');
  console.log('  fonction : '+JSON.stringify(r.fonction));
  console.log('  base sans congé : '+fx(r.bbBase));
  console.log('  arêtes appariées : '+r.jobs);
  const B=r.bbBase;
  A(!!r.fonction,'fonction congé trouvée dans Ma Pièce');
  A(!r.baseNulle,'base reconstruite sans le congé');
  A(!!r.apercu,'aperçu produit dès l\u2019entrée en édition');
  if(r.apercu&&B){
    console.log('  aperçu : '+fx(r.apercu.bb));
    const d=Math.max(Math.abs(r.apercu.bb.dx-B.dx),Math.abs(r.apercu.bb.dy-B.dy),Math.abs(r.apercu.bb.dz-B.dz));
    A(d<B.dx*0.15,'aperçu = solide complet (écart '+d.toFixed(1)+' mm)');
    A(r.apercu.aretes>0,'aperçu non vide ('+r.apercu.aretes+' arêtes)');
  }
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,800));process.exit(1);});
