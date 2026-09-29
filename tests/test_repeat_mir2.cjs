// Symétrie DOUBLE : 2 plans, la 2e passe englobe la base ET la 1re symétrie.
// On prouve : le compte d'instances (1+2), la géométrie de chaque passe, la stabilité
// des ids entre régénérations, la compatibilité mono-miroir, la garde plans identiques
// et l'invalidation du cache — le tout sur le vrai moteur, jamais en lisant des champs.
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
    "const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};",
    "const f1=v=>v.toFixed(1);",
    "const nsolide=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    "const nbsol=function(sh){let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_SOLID,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};",
    // boite décentrée : x 10..30, y 5..15, z 0..20 — le miroir se voit dans les chiffres
    "const sk={id:'sk_t',name:'Plot',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "[['p0',10,5,'e0','p1'],['p1',30,5,'e1','p2'],['p2',30,15,'e2','p3'],['p3',10,15,'e3','p0']].forEach(l=>{",
    "  sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches=[sk];",
    "doc.features=[{id:'ex_t',type:'extrude',name:'Plot',sketchId:'sk_t',op:'add',distance:20}];",
    "occSkipFeat=null;",
    "const rejouer=()=>{try{occCk.length=0;}catch(e){}return occFinalShape(null);};",
    "const formeDe=f=>{const r=occShapeOfExtrude(f);const b=bb(r.shape);try{if(typeof occDispose!=='undefined')occDispose(r.bins);}catch(e){}return b;};",
    "let FR=rejouer();",
    "p('base seule : '+f1(bb(FR.shape)[0])+'..'+f1(bb(FR.shape)[3])+' x '+f1(bb(FR.shape)[1])+'..'+f1(bb(FR.shape)[4]));",
    "att(Math.abs(bb(FR.shape)[0]-10)<0.5&&Math.abs(bb(FR.shape)[3]-30)<0.5,'base : x attendu 10..30');",
    "if(FR.shape)FR.shape.delete();",
    // ---------- symétrie double YZ puis XZ ----------
    "const rp={id:'rp_t',type:'repeat',name:'Symétrie double',mode:'mir',copies:2,plane:'YZ',plane2:'XZ',base:['ex_t'],children:[],visible:true};",
    "doc.features.push(rp);",
    "const n1=repGenChildren(rp);",
    "const kids=()=>doc.features.filter(f=>f.repeatId==='rp_t');",
    "p('miroir double : '+n1+' instance(s) créées, repIndex ['+kids().map(k=>k.repIndex).join(',')+']');",
    "att(n1===3,'miroir double : 3 instances attendues (1+2), obtenu '+n1);",
    "att(kids().map(k=>k.repIndex).join(',')==='1,2,2','repIndex attendus [1,2,2]');",
    "const k1=kids().find(k=>k.repIndex===1),k2=kids().filter(k=>k.repIndex===2);",
    "att(k1&&k1._src==='ex_t','passe 1 : source = la base');",
    "att(k2.length===2&&k2.some(k=>k._src==='ex_t')&&k2.some(k=>k._src===k1.id),'passe 2 : base ET instance de passe 1');",
    // géométrie de chaque passe, instance par instance
    "const b1=formeDe(k1);",
    "p('passe 1 (miroir YZ) : x '+f1(b1[0])+'..'+f1(b1[3])+' (attendu −30..−10)');",
    "att(Math.abs(b1[0]+30)<0.6&&Math.abs(b1[3]+10)<0.6,'passe 1 : x attendu −30..−10');",
    "const bb2=k2.map(formeDe);",
    "p('passe 2 (miroir XZ) : '+bb2.map(b=>'x '+f1(b[0])+'..'+f1(b[3])+' y '+f1(b[1])+'..'+f1(b[4])).join(' | '));",
    "att(bb2.some(b=>Math.abs(b[0]-10)<0.6&&Math.abs(b[1]+15)<0.6),'passe 2 : base miroirée XZ (x 10..30, y −15..−5) introuvable');",
    "att(bb2.some(b=>Math.abs(b[0]+30)<0.6&&Math.abs(b[1]+15)<0.6),'passe 2 : passe-1 miroirée XZ (x −30..−10, y −15..−5) introuvable');",
    // rejeu complet : 4 solides disjoints, boîte symétrique
    "FR=rejouer();",
    "const B=bb(FR.shape);",
    "p('solide final : '+nbsol(FR.shape)+' solide(s), x '+f1(B[0])+'..'+f1(B[3])+', y '+f1(B[1])+'..'+f1(B[4]));",
    "att(nbsol(FR.shape)===4,'solide final : 4 solides disjoints attendus');",
    "att(Math.abs(B[0]+30)<0.6&&Math.abs(B[3]-30)<0.6&&Math.abs(B[1]+15)<0.6&&Math.abs(B[4]-15)<0.6,'solide final : boîte attendue x ±30, y ±15');",
    "(FR.msgs||[]).forEach(m=>p('  ! '+m));",
    "if(FR.shape)FR.shape.delete();",
    // stabilité des ids entre régénérations
    "const ids1=kids().map(k=>k.id).join(','),sk1=kids().map(k=>k.sketchId).join(',');",
    "repGenChildren(rp);repGenChildren(rp);",
    "const ids2=kids().map(k=>k.id).join(','),sk2=kids().map(k=>k.sketchId).join(',');",
    "p('stabilité : '+(ids1===ids2&&sk1===sk2?'ids + esquisses identiques après 2 régénérations':'DÉRIVE'));",
    "att(ids1===ids2,'stabilité : ids des instances ont changé : '+ids1+' → '+ids2);",
    "att(sk1===sk2,'stabilité : ids des esquisses ont changé');",
    // compatibilité : sans plane2, une seule instance (comportement d'avant)
    "const kid1id=k1.id;",
    "delete rp.plane2;delete rp.planeN2;",
    "const n2=repGenChildren(rp);",
    "p('sans plane2 : '+n2+' instance (miroir simple, comme avant)');",
    "att(n2===1&&kids().length===1,'sans plane2 : 1 seule instance attendue');",
    "att(kids()[0].id===kid1id,'sans plane2 : l instance de passe 1 doit être recyclée (même id)');",
    "att(!rp._samePlane,'sans plane2 : pas de drapeau _samePlane');",
    // garde : deux plans identiques → 2ᵉ passe sans effet + drapeau
    "rp.plane2='YZ';",
    "const n3=repGenChildren(rp);",
    "p('plans identiques : '+n3+' instance + drapeau '+(rp._samePlane?'posé':'ABSENT'));",
    "att(n3===1&&rp._samePlane===true,'plans identiques : 1 instance + _samePlane attendus');",
    "delete rp.plane2;repGenChildren(rp);",
    // signature : le cache doit s'invalider quand plane2 change
    "const s0=featSig(rp);rp.plane2='XZ';const s1=featSig(rp);rp.planeN2=[0,1,0];const s2=featSig(rp);delete rp.plane2;delete rp.planeN2;",
    "p('signatures : base/plane2/planeN2 '+(s0===s1?'IDENTIQUES':'distinctes')+' / '+(s1===s2?'IDENTIQUES':'distinctes'));",
    "att(s0!==s1,'signature : plane2 inchangé → cache périmé réutilisé');",
    "att(s1!==s2,'signature : planeN2 inchangé → cache périmé réutilisé');",
    // rejeu après sérialisation : plane2 doit survivre au chargement
    "rp.plane2='XZ';repGenChildren(rp);",
    "const json=JSON.stringify(doc);",
    "try{await deserialise(json,{rebuild:false});}catch(e){p('  (cadre de vue ignoré : harnais)');}",
    "const rp2=doc.features.find(f=>f.type==='repeat');",
    "p('après rechargement : plane2='+(rp2&&rp2.plane2)+', instances='+doc.features.filter(f=>f.repeatId===(rp2&&rp2.id)).length);",
    "att(rp2&&rp2.plane2==='XZ','rechargement : plane2 perdu');",
    "att(doc.features.filter(f=>f.repeatId===rp2.id).length===3,'rechargement : 3 instances attendues');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}",
    "else p('');p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'mir2.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
