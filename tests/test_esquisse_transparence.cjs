// 2026-10-02-002 : esquisse — corps visibles en TRANSLUCIDE (0.75) et verrou à la bonne place.
// Régressions couvertes (diagnostic hors-repo avant correction) :
//  1) le fondu était posé AVANT le rejeu : skBuildRefs() tournait avant tlEditLock()+rebuild(),
//     les matériaux étaient ensuite régénérés → la pièce restait OPAQUE en édition ;
//  2) esquisse POSÉE SUR FACE non consommée : tlEditLock(hôte) excluait la fonction porteuse
//     du rejeu → plus aucun corps à l'écran (seuls les imports STEP survivaient) ;
//  3) un rebuild pendant la session (buildDone) effaçait le fondu.
// Contrats : extrusion consommée → verrou avant la consommatrice ; esquisse sur face →
// verrou APRÈS la porteuse (replay de l'état qui porte la face) ; esquisse libre → aucun
// verrou ; fermeture → corps restaurés (opacité 1) sans fuite du mode de fondu.
// Harnais : THREE est un stub Node (mkMaterial n'a PAS d'opacity) — « restauré » se dit
// donc « transparent=false et opacity absente ou ≈1 », jamais 0.75.
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    'const out={fails:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);};',
    'const live=()=>bodies.filter(b=>!b.ghost);',
    'const mat=b=>(b&&b.mesh&&b.mesh.material)||null;',
    'const visOk=()=>live().length>0&&live().every(b=>b.mesh&&b.mesh.visible===true);',
    'const opacOk=v=>live().length>0&&live().every(b=>{const m=mat(b);return m&&Math.abs(m.opacity-v)<1e-6;});',
    'const opacRestored=()=>live().length>0&&live().every(b=>{const m=mat(b);const o=m&&m.opacity;',
    '  return m&&m.transparent===false&&(o===undefined||Math.abs(o-1)<1e-6);});',
    'const rect=(id,tag)=>({id:id,name:tag,plane:"XY",visible:true,',
    '  points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30}},',
    '  entities:[{id:"l1",t:"line",p1:"a",p2:"b"},{id:"l2",t:"line",p1:"b",p2:"c"},',
    '            {id:"l3",t:"line",p1:"c",p2:"d"},{id:"l4",t:"line",p1:"d",p2:"a"}],',
    '  constraints:[],dims:[],seq:10});',
    'const safeRebuild=tag=>{try{markDirty();rebuild();}catch(e){out["rebuild_"+tag]=String(e&&e.message||e);}};',
    // ── modèle de base : esquisse XY → extrusion « Plot » ──
    'const sk=rect("sk_t","S");',
    'ensureSketchBasis(sk);doc.sketches=[sk];',
    'doc.features=[{id:"ex_t",type:"extrude",name:"Plot",sketchId:"sk_t",op:"add",distance:40,dist:40,d2:0}];',
    'safeRebuild("base");',
    'A(bodies.length===1,"model de base : un corps apres rebuild");',
    // ── T1 : esquisse LIBRE → modèle complet + corps en fondu ──
    'const sk3={id:"s3",name:"E3",plane:"XY",entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};',
    'ensureSketchBasis(sk3);doc.sketches.push(sk3);safeRebuild("t1");',
    'openSketch("s3");',
    'A(skEdit&&skEdit._fade==="bodies","T1 : mode de fondu actif (\\"bodies\\")");',
    'A(live().length===1,"T1 : le corps est la (un seul)");',
    'A(visOk(),"T1 : corps visible");',
    'A(opacOk(0.75),"T1 : corps TRANSLUCIDE a 0.75 (avant fix : opaque — le fondu partait avec le rejeu)");',
    'closeSketch(false);',
    // ── T2 : esquisse POSÉE SUR FACE, dernière fonction → aucun verrou, modèle complet ──
    'const sk2={id:"s2",name:"E2",plane:"FACE",origin:[0,0,40],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],',
    '  host:{feat:"ex_t",tag:"TOP",x:20,y:15,name:"face 1"},',
    '  entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};',
    'doc.sketches.push(sk2);safeRebuild("t2");',
    'openSketch("s2");',
    'out.t2={tlMark:tlMark,nb:live().length,op:mat(live()[0])?live()[0].mesh.material.opacity:null,note:skEdit._refNote};',
    'A(tlMark===null,"T2 : hote en derniere fonction -> aucun verrou (avant fix : verrou sur la porteuse = corps exclu du rejeu)");',
    'A(live().length===1,"T2 : la face esquissee existe toujours (1 corps, avant fix : 0)");',
    'A(visOk()&&opacOk(0.75),"T2 : corps visible et translucide");',
    'A(String(skEdit._refNote||"").indexOf("solide fini")>=0,"T2 : note de reference presente");',
    'closeSketch(false);',
    // ── T3 : une fonction existe APRÈS la porteuse → verrou APRES (porteuse rejouée) ──
    'doc.sketches.push(rect("s4","E4"));ensureSketchBasis(doc.sketches[doc.sketches.length-1]);',
    'doc.features.push({id:"ex_late",type:"extrude",name:"Tard",sketchId:"s4",op:"add",distance:5,dist:5,d2:0});',
    'safeRebuild("t3");',
    'openSketch("s2");',
    'out.t3={tlMark:tlMark,ids:live().map(b=>b.id)};',
    'A(tlMark==="ex_late","T3 : verrou APRES la porteuse (rejeu de ex_t, exclusion de ex_late) — tlMark="+tlMark);',
    'A(live().some(b=>b.id==="ex_t"),"T3 : le corps qui porte la face existe toujours");',
    'A(visOk()&&opacOk(0.75),"T3 : corps visible et translucide");',
    'closeSketch(false);',
    // ── T4 : esquisse CONSOMMÉE → verrou AVANT la consommatrice, corps en fondu ──
    'doc.sketches.push(rect("s5","E5"));ensureSketchBasis(doc.sketches[doc.sketches.length-1]);',
    'doc.features.push({id:"ex5",type:"extrude",name:"Suite",sketchId:"s5",op:"add",distance:10,dist:10,d2:0});',
    'safeRebuild("t4");',
    'openSketch("s5");',
    'out.t4={tlMark:tlMark,op:mat(live()[0])?live()[0].mesh.material.opacity:null,nb:live().length};',
    'A(tlMark==="ex5","T4 : verrou avant la consommatrice (etat anterieur, comme Fusion)");',
    'A(live().length>0&&visOk(),"T4 : les corps anterieurs sont visibles");',
    'A(opacOk(0.75),"T4 : corps translucides apres rejeu (avant fix : OPAQUES)");',
    // ── T5 : un rebuild PENDANT la session repose le fondu (regression buildDone) ──
    'live().forEach(b=>{b.mesh.material.opacity=1;b.mesh.material.transparent=false;});',
    'safeRebuild("t5");',
    'A(bodies.length>0&&visOk()&&opacOk(0.75),"T5 : rebuild en session -> fondu 0.75 repose (sinon la piece redevient opaque)");',
    // ── T6 : fermeture → restauration complete, aucun fantome ──
    'closeSketch(false);',
    'out.t6={tlMark:tlMark,nb:bodies.length,op:mat(live()[0])?live()[0].mesh.material.opacity:null,',
    '  tr:mat(live()[0])?live()[0].mesh.material.transparent:null,',
    '  fade:(doc.sketches.find(s=>s.id==="s5")||{})._fade,ghost:(typeof skAnteriorGhost!=="undefined"&&skAnteriorGhost)?1:0};',
    'A(tlMark===null,"T6 : verrou leve a la fermeture");',
    'A(visOk(),"T6 : corps visibles apres fermeture");',
    'A(opacRestored(),"T6 : opacite RESTAUREE (transparent=false, plus 0.75) — pas de fuite du fondu");',
    'A((doc.sketches.find(s=>s.id==="s5")||{})._fade==null,"T6 : mode de fondu efface");',
    'A(out.t6.ghost===0,"T6 : fantome anterieur detruit");',
    'return out;'
  ].join('\n');
  const vm=require('vm');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== esquisse : corps translucides + verrou a la bonne place ===');
  Object.keys(o).filter(k=>k.indexOf('rebuild_')===0).forEach(k=>console.log('  ('+k+' : '+o[k]+')'));
  ['t2','t3','t4','t6'].forEach(k=>{if(o[k])console.log('  '+k+' : '+JSON.stringify(o[k]));});
  if(o.fails&&o.fails.length){console.log('ECHECS :');o.fails.forEach(m=>console.log('  x '+m));process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
