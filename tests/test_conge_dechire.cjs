// CONGÉ DÉCHIRÉ REFUSÉ, sur le vrai noyau OCCT (2026-10-27). Cavité Test du 27/10 : nervure
// dont les flancs sont dépouillés de 25°, puis congé exact R3 d'une arête au pied de la nervure.
// BRepFilletAPI_MakeFillet répondait « IsDone » avec un solide déchiré (4 faces et 2 contours
// invalides, −1 220 mm³) : l'appli l'affichait (éclats triangulaires) sans un mot.
// Désormais occFacesValides contrôle les faces autour des arêtes : le congé est refusé
// (_err « solide déchiré »), le solide reste celui d'avant le congé, et valide.
// Témoin : le congé voisin de 2 arêtes (R3), valide, passe toujours, sans faux refus.
// Pièce : tests/fixtures/conge_dechire.json (Cavité Test réduite : bloc, poche dépouillée,
// congé R8, nervure, dépouille 25°, congé 2 arêtes xf_10, congé 1 arête xf_11).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(__dirname,'fixtures','conge_dechire.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=`
  const P=[];const p=s=>P.push(String(s));
  const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
  await bundleRestore(${JSON.stringify(json)},{rebuild:false});
  const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);const v=G.Mass();G.delete();return v;};
  const valide=sh=>{const A=new occt.BRepCheck_Analyzer(sh,true);const v=A.IsValid_2();A.delete();return v;};
  const f2=v=>(+v).toFixed(2);
  const xf2=doc.features.find(f=>f.id==='xf_10_mvp160b8'),xf1=doc.features.find(f=>f.id==='xf_11_mvp167y0');
  const mesure=(v2,v1)=>{xf2.visible=v2;xf1.visible=v1;delete xf2._err;delete xf1._err;
    occCkClear();markDirty();rebuild();const FR=occFinalShape(null);
    const o={v:vol(FR.shape),ok:valide(FR.shape),msgs:FR.msgs||[]};try{FR.shape.delete();}catch(e){}return o;};
  const avant=mesure(false,false);
  p('sans congé : vol '+f2(avant.v)+', valide '+avant.ok);
  att(avant.ok,'pièce de base invalide');
  // 1) congé 1 arête seul, juste après la dépouille : le noyau le déchire → refus
  const a=mesure(false,true);
  p('congé 1 arête : vol '+f2(a.v)+', valide '+a.ok+' — '+(xf1._err||'aucune erreur'));
  att(a.ok,'congé 1 arête : solide invalide affiché');
  att(xf1._err&&/déchiré/.test(xf1._err),'congé 1 arête : refus « déchiré » absent ('+xf1._err+')');
  att(Math.abs(a.v-avant.v)<0.01,'congé 1 arête : volume '+f2(a.v)+' au lieu de '+f2(avant.v)+' (congé non refusé ?)');
  att(featIconOf(xf1).indexOf('⚠')>=0,'congé 1 arête : pas de ⚠ dans l arbre');
  // 2) témoin : congé 2 arêtes valide → passe, aucun faux refus
  const b=mesure(true,false);
  p('congé 2 arêtes (témoin) : vol '+f2(b.v)+', valide '+b.ok+' — '+(xf2._err||'aucune erreur'));
  att(b.ok&&!xf2._err,'témoin : refus à tort ('+xf2._err+')');
  att(Math.abs(b.v-avant.v)>1,'témoin : le congé 2 arêtes n a rien changé');
  // 3) rejeu depuis les points de contrôle : même refus, même solide
  xf2.visible=false;xf1.visible=true;markDirty();rebuild();const F3=occFinalShape(null);
  att(valide(F3.shape)&&Math.abs(vol(F3.shape)-avant.v)<0.01,'rejeu depuis le cache : congé déchiré réapparu');
  try{F3.shape.delete();}catch(e){}
  if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}
  else{p('');p('TOUT EST CONFORME');}
  return P.join('\\n');`;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'conge_dechire.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
