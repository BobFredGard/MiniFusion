// 2026-10-23 : répétition circulaire sur un tour complet — « quand j'en veux 6, c'est l'original + 5 ».
// L'ancien pas (360°/copies) posait la dernière copie SUR l'original : perçage doublé, paroi du trou
// scindée en deux faces. Pas = 360°/(copies+1) ; au chargement, l'ancienne copie superflue est retirée.
const fs=require('fs'),path=require('path'),vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const ROOT=path.join(__dirname,'..');
let ko=0;const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const {ctx}=loadApp();
  const json=fs.readFileSync(path.join(ROOT,'Exemples','Perçages.miniFusion'),'utf8');
  const o=await vm.runInContext(`(async()=>{
    const out={};
    out.stepTour=repCircStep({angle:360,copies:5});out.stepSect=repCircStep({angle:90,copies:3});
    const raw=JSON.parse(${JSON.stringify(json)});const d0=raw.doc||raw;
    const rp0=(d0.features||[]).find(f=>f.type==='repeat'&&f.mode==='circ');
    out.before=rp0?{copies:rp0.copies,kids:d0.features.filter(f=>f.repeatId===rp0.id).length}:null;
    if(raw.doc)await bundleRestore(${JSON.stringify(json)},{rebuild:false});else await deserialise(${JSON.stringify(json)},{rebuild:false});
    const rp=doc.features.find(f=>f.type==='repeat'&&f.mode==='circ');
    out.after=rp?{copies:rp.copies,q:rp.q,kids:doc.features.filter(f=>f.repeatId===rp.id).length}:null;
    // angles des copies autour de l'axe : aucun à 0 / 360° (sur l'original)
    out.angs=rp?Array.from({length:rp.copies},(_,i)=>+(repCircStep(rp)*(i+1)).toFixed(3)):[];
    return out;})()`,ctx);
  console.log('  · avant '+JSON.stringify(o.before)+' → après '+JSON.stringify(o.after)+' ; angles '+o.angs.join(', '));
  A(Math.abs(o.stepTour-60)<1e-9,'tour complet, quantité 6 (5 copies) : pas de 60°');
  A(Math.abs(o.stepSect-30)<1e-9,'secteur de 90°, 4 au total (3 copies) : pas de 30° (bornes comprises)');
  A(o.before&&o.after&&o.after.copies===o.before.copies-1&&o.after.kids===o.before.kids-1&&o.after.q===1,'ancien document : la copie posée sur l’original est retirée au chargement');
  A(o.angs.length&&o.angs.every(a=>a>1e-6&&a<360-1e-6),'plus aucune copie à 360° (sur l’original)');
  console.log(ko?'ÉCART':'*** TOUT PASSE ***');process.exit(ko?1:0);
})().catch(e=>{console.log('ERREUR',e&&e.stack||e);process.exit(1);});
