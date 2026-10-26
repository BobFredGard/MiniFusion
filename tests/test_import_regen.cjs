// 2026-10-26 : « Régénérer » après un enlèvement / ajout sur un STEP importé.
// Retour : « à l'import tout fonctionne ; quand je rajoute ou enlève de la matière on
// voit l'ajout ou le retrait, puis il suffit d'un Régénérer et le STEP n'est plus
// visible, sauf l'opération ». On mesure la GÉOMÉTRIE du corps après runValidate()
// (bouton ⟳ Régénérer) : le STEP doit toujours être dans le solide.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
const aR=(v,e,p)=>Math.abs(v-e)<=(p||0.5);
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};showAll=function(){};',ctx);
  sandbox.__step=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),60,40,20);
    const sh=mk.Shape();
    const b=occWriteStep([sh],'/__r.stp');
    try{sh.delete();}catch(e){}try{mk.delete();}catch(e){}
    return b?Uint8Array.from(b).buffer:null;
  })()`,ctx);
  if(!sandbox.__step){console.log('  ✗ STEP de test impossible à produire');process.exit(1);}
  const body=`
    const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,false);
      const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};
    const etat=()=>{
      const pc=bodies.filter(b=>b.kind==='body'&&!b.ghost);
      const p=pc[0];
      return {n:pc.length,box:p&&p.shape?bb(p.shape):null,
        tris:(()=>{const g=p&&p.mesh&&p.mesh.geometry,q=g&&g.attributes&&g.attributes.position;return q?q.count/3:0;})(),
        kinds:bodies.map(b=>b.kind+(b.ghost?'*':'')).join(','),msg:String(faceEl.textContent||'').slice(0,300)};
    };
    const out={};
    await importSTEP({name:'bloc.stp',arrayBuffer:async()=>__step});
    // ajout : bloc 20×20 de 15 mm sur la face du dessus (une découpe seule ne mémorise rien)
    doc.sketches.push({id:'skP',name:'Poche',plane:'XY',origin:[0,0,20],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:20,y:10},b:{x:40,y:10},c:{x:40,y:30},d:{x:20,y:30}},
      entities:[{id:'l0',t:'line',p1:'a',p2:'b'},{id:'l1',t:'line',p1:'b',p2:'c'},
                {id:'l2',t:'line',p1:'c',p2:'d'},{id:'l3',t:'line',p1:'d',p2:'a'}],
      constraints:[],dims:[],visible:false});
    doc.features.push({id:'exP',type:'extrude',name:'Poche',sketchId:'skP',op:'add',distance:15,visible:true});
    markDirty();rebuild();
    out.avant=etat();
    try{runValidate();}catch(e){out.errV=String(e&&e.message||e);}
    out.apres=etat();
    try{runValidate();}catch(e){}
    out.apres2=etat();
    // Ctrl+R : le noyau rejoue AVANT que importRestorePending n'ait relu le STEP
    // (IndexedDB) — on retire la géométrie de la table comme après un rechargement.
    const f=doc.features.find(x=>x.type==='import');
    const ent=importGeom.get(f.id);importGeom.delete(f.id);delete f._mesh;
    builtVersion=-1;builtHash=null;builtEngine=null;rebuild();
    out.sansStep=etat();
    try{if(ent&&ent.brep)ent.brep.delete();}catch(e){}
    out.nRest=await importRestorePending();
    out.recharge=etat();
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  const show=(k,e)=>console.log('  '+k+' : corps='+e.n+' tris='+e.tris+' boîte=['+(e.box||[]).map(v=>v.toFixed(1))+'] kinds='+e.kinds);
  console.log('=== Régénérer après un retrait sur un STEP importé ===');
  show('avant',o.avant);show('après Régénérer',o.apres);show('après 2e Régénérer',o.apres2);
  if(o.errV)console.log('  erreur runValidate : '+o.errV);
  const ok=e=>e.n===1&&e.box&&aR(e.box[0],0)&&aR(e.box[3],60)&&aR(e.box[4],40)&&aR(e.box[5],35);
  A(ok(o.avant),'avant Régénérer : le corps est le STEP + le bloc ajouté (boîte 60×40×35)');
  A(ok(o.apres),'après Régénérer : le STEP est toujours dans le corps');
  A(ok(o.apres2),'après un 2e Régénérer : idem');
  show('rechargement, STEP pas encore relu',o.sansStep);show('rechargement, STEP restauré ('+o.nRest+')',o.recharge);
  A(o.nRest===1,'rechargement : le STEP est restauré depuis sa source');
  A(ok(o.recharge),'rechargement : le corps reprend le STEP (pas le point de contrôle mémorisé sans lui)');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
