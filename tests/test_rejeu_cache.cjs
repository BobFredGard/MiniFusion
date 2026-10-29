// V0.16.0 : points de contrôle du rejeu retrouvés (bilan du 2026-10-28). Trois causes de
// rejeu complet sans raison : (1) le filet JSON de featSig réinjectait edges[].pos des congés
// exacts (relevé rafraîchi, bruit ~1e-9) ; (2) skSig TRONQUAIT (|0) : −10,999999999 et
// −11,000000001 donnaient deux signatures ; (3) repGenChildren purgeait les instances AVANT la
// boucle linéaire / circulaire → esquisses d'instances recréées sous un nouvel id à chaque
// régénération. Test STRUCTUREL (pas de chrono) : nombre de booléens et de congés refaits.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
// « test suppr » : copie figée (version du 2026-10-27, avec extrusions) — l'exemple vivant a
// été retravaillé depuis (import seul) et ne porte plus d'extrusion à faire varier
const lire=n=>fs.readFileSync(n.startsWith('fixtures/')?path.join(__dirname,n):path.join(ROOT,'Exemples',n),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const out={fails:[],log:[]};
  const cas=async(fichier,corps)=>{
    const {ctx,sandbox}=loadApp();
    sandbox.__realOcct=real;sandbox.__txt=lire(fichier);
    vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};showAll=function(){};applyView=function(){};',ctx);
    const o=await vm.runInContext('(async()=>{'+[
      'const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
      'await bundleRestore(__txt);occt=__realOcct;occtReady=true;hardRefresh();',
      // compteur des opérations coûteuses (booléens + congés exacts)
      'let nOp=0;for(const n of ["occFuse","occCut","occCommon","occApplyXFillets"]){const o=globalThis[n];globalThis[n]=function(){nOp++;return o.apply(this,arguments);};}',
      'const instSk=()=>doc.features.filter(f=>f.repeatId&&f.sketchId).map(f=>f.sketchId).join(",");',
      corps,
      'return out;'].join('\n')+'})()',ctx);
    (o.log||[]).forEach(m=>out.log.push(fichier+' : '+m));(o.fails||[]).forEach(m=>out.fails.push(fichier+' : '+m));
  };
  // (2) skSig : arrondi, pas troncature
  await cas('fixtures/test_suppr_rejeu.minifusion.json',[
    'const sk={seq:1,points:{a:{x:0,y:-10.999999999},b:{x:5,y:0}},entities:[{t:"line",p1:"a",p2:"b"}],constraints:[],dims:[]};',
    'const s1=skSig(sk);sk.points.a.y=-11.000000001;',
    'A(skSig(sk)===s1,"1 : skSig — cote ronde à ±1e-9 près (−10,999999999 / −11,000000001) : même signature");',
    'sk.points.a.y=-11.01;A(skSig(sk)!==s1,"2 : skSig — un vrai changement (0,01 mm) change la signature");',
    // (1) rejeu sans changement : aucun booléen ni congé refait
    'nOp=0;markDirty();rebuild();A(nOp===0,"3 : rejeu sans changement : aucun booléen ni congé refait ("+nOp+")");',
    'nOp=0;markDirty();rebuild();A(nOp===0,"4 : second rejeu sans changement : toujours aucun ("+nOp+")");',
    // (3) instances de répétition : ids d'esquisses stables, retour à la valeur d'avant sur cache
    'const ids0=instSk(),nSk0=doc.sketches.length;',
    'const ex=doc.features.filter(f=>f.type==="extrude"&&f.visible!==false&&!f.repeatId)[0];const d0=ex.distance;',
    'nOp=0;ex.distance=d0+0.5;markDirty();rebuild();const nAller=nOp;',
    'A(instSk()===ids0,"5 : répétition régénérée (source modifiée) : esquisses des instances au MÊME id ("+ids0+")");',
    'nOp=0;ex.distance=d0;markDirty();rebuild();',
    'A(nAller>0&&nOp===0,"6 : retour à la valeur d\'avant : points de contrôle retrouvés, aucun booléen ("+nOp+", aller "+nAller+")");',
    'A(instSk()===ids0&&doc.sketches.length===nSk0,"7 : aller-retour : mêmes esquisses d\'instances, aucune esquisse en plus ("+doc.sketches.length+")");'
  ].join('\n'));
  // (2) sur un fichier réel : bruit de solveur sur une esquisse projetée
  await cas('Support Pédale Déportée R1200RT 2011.miniFusion',[
    'nOp=0;markDirty();rebuild();A(nOp===0,"8 : rejeu sans changement : aucun booléen ni congé refait ("+nOp+")");',
    'const ex=doc.features.filter(f=>f.type==="extrude"&&f.visible!==false&&!f.repeatId)[0];const d0=ex.distance;',
    'ex.distance=d0+0.5;markDirty();rebuild();nOp=0;ex.distance=d0;markDirty();rebuild();',
    'A(nOp===0,"9 : 1re extrusion, aller-retour : retour sur les points de contrôle ("+nOp+" opération(s) refaite(s))");'
  ].join('\n'));
  console.log('=== V0.16.0 : cache de rejeu — points de contrôle retrouvés ===');
  out.log.forEach(m=>console.log('  ✓ '+m));
  if(out.fails.length){out.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+out.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');process.exit(0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
