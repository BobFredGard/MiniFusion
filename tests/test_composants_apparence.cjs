// V0.7.3 : apparence en mode Placer (48-assemblage-apparence.js), modèle seul, sans noyau.
// Intensité, transparence et arêtes par OCCURRENCE (la couleur reste celle des corps) : héritage dans le sous-arbre (l'occurrence
// la plus profonde l'emporte, champ par champ), arêtes « comme le bouton » / toujours / jamais,
// valeurs refusées à la relecture, aller-retour du fichier, annulation, « appliquer à toutes
// les occurrences », segments d'arêtes construits depuis les polylignes de l'overlay.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    confirm=function(){return true;};
    docResetEmpty();doc.name='Banc';asmEnsure();
    const Rt=asmRoot();
    const nc=asmNewComp('Châssis');const C=nc.comp,oC=nc.occ;
    const nw=asmNewComp('Roue',C.id);const W=nw.comp,oW=nw.occ;
    const oC2=asmAddOcc(C.id,null,Rt.id);
    // ── héritage ──
    att(JSON.stringify(asmLookOf([oC.id,oW.id]))==='{}','sans apparence : rien d’imposé');
    oC.look={gl:0.4,op:0.5};
    let L=asmLookOf([oC.id,oW.id]);
    att(L.gl===0.4&&L.op===0.5,'la Roue hérite de l’apparence du Châssis (transparence 60 %, intensité 50 %)');
    oW.look={gl:0.8,edges:'off'};
    L=asmLookOf([oC.id,oW.id]);
    att(L.gl===0.8&&L.op===0.5&&L.edges==='off','la plus profonde l’emporte champ par champ (transparence 20 %, intensité 50 % héritée, arêtes off)');
    att(JSON.stringify(asmLookOf([oC2.id]))==='{}','l’autre occurrence du Châssis n’est pas touchée');
    att(asmLookOf([oC2.id,oW.id]).gl===0.8,'… mais la Roue (occurrence partagée par le composant) garde sa transparence dedans');
    // ── arêtes ──
    edgeMode='off';
    att(!asmEdgesShown({})&&asmEdgesShown({edges:'on'})&&!asmEdgesShown({edges:'off'}),'bouton « Arêtes » éteint : seulement « Toujours »');
    edgeMode='on';
    att(asmEdgesShown({})&&asmEdgesShown({edges:'on'})&&!asmEdgesShown({edges:'off'}),'bouton allumé : tout sauf « Jamais »');
    // ── relecture ──
    att(asmLookNorm({op:2,gl:-1,edges:'peut-être'})===null,'valeurs invalides refusées (null)');
    const n=asmLookNorm({color:0x123456,op:0.333333,edges:'on',x:1});
    att(n&&n.op===0.333&&n.edges==='on'&&!('x' in n)&&!('color' in n),'valeurs valides gardées, arrondies ; couleur et champs inconnus retirés (la couleur reste celle des corps)');
    att(asmLookNorm({op:1,gl:1})===null,'intensité 100 % et transparence 0 % = rien à garder');
    const g2=asmLookNorm({op:0.1,gl:0.4});
    att(g2&&g2.gl===0.4&&!('op' in g2),'bornes des corps : intensité ≥ 15 % (setBodyOp), transparence gardée (setBodyGlass)');
    // ── fichier ──
    const ser=JSON.parse(JSON.stringify(asmSerial()));
    const sC=ser.comps.find(c=>c.id===Rt.id).occ.find(o=>o.id===oC.id),sW=ser.comps.find(c=>c.id===C.id).occ.find(o=>o.id===oW.id);
    att(sC.look&&sC.look.op===0.5&&sC.look.gl===0.4&&sW.look&&sW.look.edges==='off','apparences enregistrées avec les occurrences');
    att(!('look' in ser.comps.find(c=>c.id===Rt.id).occ.find(o=>o.id===oC2.id)),'occurrence sans apparence : pas de champ');
    // ── modifier, annuler ──
    asmSetLook(oC2,{gl:0.5},'transparence');
    att(oC2.look&&oC2.look.gl===0.5,'asmSetLook : transparence posée');
    asmSetLook(oC2,{gl:null},'transparence');
    att(oC2.look===null,'… retirée : plus d’apparence');
    asmUndo();
    att(asmRoot().occ.find(o=>o.id===oC2.id).look.gl===0.5,'Ctrl+Z : la transparence revient');
    asmSetLook(oC2,{gl:0.3},'transparence',true);asmSetLook(oC2,{gl:0.2},'transparence',true);const nU=asmUndoStack.length;
    asmSetLook(oC2,{gl:0.1},'transparence');
    att(asmUndoStack.length===nU&&oC2.look.gl===0.1,'glisser d’un curseur : une seule étape d’annulation');
    // ── segments d'arêtes ──
    const A=asmEdgeArrays([{pts:[[0,0,0],[1,0,0],[1,1,0]],sharp:true},{pts:[[0,0,1]],sharp:false},{pts:[[0,0,0],[0,0,2]],sharp:false}]);
    att(A.pos.length===18&&A.col.length===18,'polylignes → 3 segments (6 sommets), polyligne d’un point ignorée');
    att(A.col[0]<0.05&&Math.abs(A.col[12]-0x9a/255)<1e-9,'vives noires, tangentes grises (comme en Modéliser)');
    att(asmEdgeGeo([])===null,'aucune arête : pas de géométrie');
    return {ATT,OK};
  `;
  const o=vm.runInContext('(function(){'+R+'})()',ctx);
  console.log('=== V0.7.3 : apparence en mode Placer ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
