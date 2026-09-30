// Corps vrais conteneurs (modèle, sans OCCT) : migration, création, activation,
// taggage à la création, visibilité, suppression, persistance.
// Le rejeu isolé est prouvé sur le vrai noyau dans test_corps_iso.cjs.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
const fs=require('fs'),path=require('path');
const SRC=path.join(__dirname,'..','src');
let staticKo=[];
[['85-deplacement-face.js',/!=='occ_result'/],
 ['86-draft-depouillage.js',/id==='occ_result'|!=='occ_result'/],
 ['87-coque.js',/id==='occ_result'|!=='occ_result'/],
 ['80-conges-chanfreins.js',/!=='occ_result'/]
].forEach(([f,re])=>{
  const src=fs.readFileSync(path.join(SRC,f),'utf8');
  if(re.test(src))staticKo.push(f+' référence encore occ_result');
});
// syncBodyEntries/occSplitSolids (rapprochement par centroïdes) ont disparu avec les
// corps conteneurs : le rejeu attribue par id, plus par position.
['20-noyau-et-operations-solides.js'].forEach(f=>{
  const src=fs.readFileSync(path.join(SRC,f),'utf8');
  if(/function syncBodyEntries|function occSplitSolids/.test(src))staticKo.push(f+' : syncBodyEntries/occSplitSolids morts non supprimés');
  if(/solids=occSplitSolids/.test(src))staticKo.push(f+' : occRebuild scinde encore le composé');
});
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "confirm=function(){return true;};", // delBody demande confirmation (navigateur)
    "att(typeof ensureBodies==='function','ensureBodies présente');",
    "att(typeof ensureActiveBody==='function','ensureActiveBody présent');",
    "att(typeof occReplayBody==='function','occReplayBody présent');",
    "att(typeof occCompoundOf==='function','occCompoundOf présent');",
    "att(typeof newBody==='function','newBody présent');",
    "att(typeof delBody==='function','delBody présent');",
    "att(typeof bodyToggleVis==='function','bodyToggleVis présent');",
    // --- migration d'un ancien document (ni corps, ni f.body)
    "doc={name:'Vieux',sketches:[],features:[{id:'e1',type:'extrude',name:'Plot'}],bodyVis:{}};",
    "ensureBodies();",
    "att(doc.bodies.length===1&&doc.bodies[0].id==='b1','migration : 1 corps b1');",
    "att(doc.features[0].body==='b1','migration : fonction rangée en b1');",
    "att(doc.activeBody==='b1','migration : actif b1');",
    // --- nouveau corps : vide, actif, les créations naissent dedans
    "newBody();",
    "att(doc.bodies.length===2&&doc.bodies[1].id==='b2','newBody : b2 créé');",
    "att(doc.activeBody==='b2','newBody : b2 actif');",
    "att(doc.bodies[1].name==='Corps 2','newBody : nommé Corps 2');",
    "const nf={id:'e2',type:'extrude',name:'Plot 2'};addFeature(nf);",
    "att(nf.body==='b2','addFeature : née dans le corps actif b2');",
    // --- retour en b1 : les créations suivent l'actif
    "doc.activeBody='b1';",
    "const nf2={id:'e3',type:'extrude',name:'Plot 3'};addFeature(nf2);",
    "att(nf2.body==='b1','addFeature : suit le changement d actif');",
    // --- clones de répétition héritent du corps (copie JSON intégrale)
    "const cl=JSON.parse(JSON.stringify(nf));",
    "att(cl.body==='b2','clone : corps hérité, jamais orphelin');",
    // --- signature : deux fonctions identiques dans 2 corps ne se confondent pas
    "const s1=featSig({type:'extrude',op:'add',distance:40,sketchId:'a'});",
    "const s2=featSig({type:'extrude',op:'add',distance:40,sketchId:'a',body:'b2'});",
    "att(s1!==s2,'featSig : le corps fait partie de la signature');",
    // --- œil du corps : bascule ses fonctions (instances comprises)
    "doc.features.push({id:'r1',type:'repeat',name:'Rép',base:[],repeatId:undefined});",
    "doc.features.find(f=>f.id==='r1').body='b2';",
    "bodyToggleVis('b2');",
    "att(doc.features.find(f=>f.id==='e2').visible===false,'oeil : fonction masquée');",
    "bodyToggleVis('b2');",
    "att(doc.features.find(f=>f.id==='e2').visible!==false,'oeil : fonction réaffichée');",
    // --- suppression : corps + fonctions, actif replié, numéros non réemployés
    "const seq=doc.bodySeq;",
    "delBody('b2');",
    "att(!doc.bodies.some(e=>e.id==='b2'),'delBody : b2 parti');",
    "att(!doc.features.some(f=>f.id==='e2'),'delBody : fonctions emportées');",
    "att(doc.features.some(f=>f.id==='e1'),'delBody : b1 intact');",
    "att(doc.activeBody==='b1','delBody : actif replié sur b1');",
    "newBody();",
    "att(doc.bodies[doc.bodies.length-1].id!=='b2','delBody : numéro non réemployé (vu '+doc.bodies[doc.bodies.length-1].id+')');",
    "att(doc.bodySeq>seq,'delBody : compteur monotone');",
    // --- persistance : f.body + corps survivent au round-trip
    "const js=serialise(false);",
    "att(js.indexOf('\"body\":\"b1\"')>=0,'serialise : f.body persisté');",
    "await deserialise(js,{rebuild:false});",
    "att(doc.features.every(f=>f.body),'rechargement : aucune fonction orpheline');",
    "att(doc.bodies.length>=1&&doc.activeBody,'rechargement : corps + actif');",
    "const snap=docSnap();",
    "att(snap&&snap.indexOf('\"bodies\"')>=0,'undo : instantané avec les corps');",
    // --- repli : corps + groupes, persisté au round-trip
    "doc.bodies.find(e=>e.id==='b1').open=false;",
    "doc.fold={sk:true,origin:false};",
    "const js2=serialise(false);",
    "att(js2.indexOf('\"open\":false')>=0,'serialise : repli du corps persisté');",
    "att(js2.indexOf('\"fold\"')>=0,'serialise : repli des groupes persisté');",
    "await deserialise(js2,{rebuild:false});",
    "att(doc.bodies.find(e=>e.id==='b1').open===false,'rechargement : corps replié');",
    "att(doc.fold&&doc.fold.sk===true&&doc.fold.origin===false,'rechargement : groupes repliés');",
    "doc.bodies.find(e=>e.id==='b1').open=true;doc.fold={};",
    // --- déplacement intra-corps : b1=[m1,m2,m3], b2=[n1]
    "doc.features=[{id:'m1',type:'extrude',name:'M1',body:'b1'},{id:'m2',type:'extrude',name:'M2',body:'b1'},{id:'m3',type:'extrude',name:'M3',body:'b1'},{id:'n1',type:'extrude',name:'N1',body:'b2'}];",
    "att(featMove('m2',-1)===true,'décaler M2 vers le haut');",
    "att(doc.features.map(f=>f.id).join(',')==='m2,m1,m3,n1','ordre après M2▲ (vu '+doc.features.map(f=>f.id).join(',')+')');",
    "att(featMove('m2',-1)===false,'M2 déjà en tête de corps');",
    "att(featMove('m3',1)===true,'décaler M3 vers le bas (saute N1, autre corps)');",
    "att(doc.features.map(f=>f.id).join(',')==='m2,m1,n1,m3','M3▼ passe après N1 sans le toucher');",
    "att(docUndo()===true,'undo du déplacement');",
    "att(doc.features.map(f=>f.id).join(',')==='m2,m1,m3,n1','undo : ordre restauré');",
    // --- entrelacé : A2 passe devant A1 par-dessus B1
    "doc.features=[{id:'a1',type:'extrude',name:'A1',body:'b1'},{id:'b_1',type:'extrude',name:'B1',body:'b2'},{id:'a2',type:'extrude',name:'A2',body:'b1'}];",
    "att(featMove('a2',-1)===true,'A2▲ par-dessus B1');",
    "att(doc.features.map(f=>f.id).join(',')==='a2,a1,b_1','A2 devant A1 (B1 sauté, ordre relatif gardé)');",
    // --- instances non déplaçables ; bloc répétition entier oui
    "doc.features=[{id:'x1',type:'extrude',name:'X1',body:'b1'},{id:'rp',type:'repeat',name:'R',body:'b1',base:[]},{id:'k1',type:'extrude',name:'K1',body:'b1',repeatId:'rp'},{id:'k2',type:'extrude',name:'K2',body:'b1',repeatId:'rp'},{id:'x2',type:'extrude',name:'X2',body:'b1'}];",
    "att(featMove('k1',-1)===false,'instance seule : non déplaçable');",
    "att(featMove('rp',1)===true,'bloc répétition vers le bas');",
    "att(doc.features.map(f=>f.id).join(',')==='x1,x2,rp,k1,k2','bloc entier après X2');",
    // --- couleur du nom dans l'arbre : fiche, puis défaut
    "att(bodyTextColor({id:'b9',color:16711680})==='#ff0000','bodyTextColor fiche rouge');",
    "att(bodyTextColor({id:'b9'})==='','bodyTextColor défaut sans couleur');",
    "doc.bodies=[{id:'b1',name:'Corps 1',c:null,color:65280,open:true},{id:'b2',name:'Corps 2',c:null,open:true}];",
    "doc.bodySeq=3;doc.activeBody='b1';doc.sketches=[];doc.features=[];doc.fold={};treeSel=[];sel={kind:null,id:null};",
    "renderTree();",
    "const _tk=document.getElementById('tree').children;let _h1=null,_h2=null;",
    "for(let _i=0;_i<_tk.length;_i++){const _h=_tk[_i].innerHTML||'';if(_h.indexOf('Corps 1')>=0)_h1=_h;if(_h.indexOf('Corps 2')>=0)_h2=_h;}",
    "att(!!_h1&&!!_h2,'arbre : 2 en-têtes de corps');",
    "att(_h1&&_h1.indexOf('#00ff00')>=0,'arbre : Corps 1 en vert (sa couleur)');",
    "att(_h2&&_h2.indexOf('style=\"color:')<0,'arbre : Corps 2 couleur de texte par défaut');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "p('corps='+doc.bodies.map(e=>e.id).join(',')+' actif='+doc.activeBody);",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'corps.js'});
  console.log(r);
  if(staticKo.length){console.log('ECHECS statiques :');staticKo.forEach(m=>console.log('  x '+m));}
  process.exit((/ECHECS|  x /.test(r)||staticKo.length)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
