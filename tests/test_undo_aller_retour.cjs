// 2026-09-30r : FIDÉLITÉ de l'instantané d'annulation.
// L'undo de document sera un instantané JSON. Question décisive : un aller-retour
// JSON.parse(JSON.stringify(doc)) rejoue-t-il EXACTEMENT le même modèle ?
// Si non, l'annuler corromprait silencieusement la pièce.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};',
    '// ── un document « chargé de travail » : 2 esquisses, extrusion, révolution, congé, répétition',
    'const rect=(id,n,x0,y0,x1,y1)=>{',
    '  const sk={id:id,name:n,plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],',
    '    points:{},entities:[],constraints:[],dims:[],visible:true};',
    '  [["a",x0,y0],["b",x1,y0],["c",x1,y1],["d",x0,y1]].forEach(q=>{sk.points[q[0]]={x:q[1],y:q[2]};});',
    '  [["a","b"],["b","c"],["c","d"],["d","a"]].forEach((e,i)=>sk.entities.push({id:"l"+i,t:"line",p1:e[0],p2:e[1],construction:false}));',
    '  return sk;};',
    'doc.sketches=[];doc.features=[];doc.entNames={};',
    'const s1=rect("sk1","Profil A",0,0,40,30);',
    's1.constraints.push({id:"c1",type:"h",ent:"l0"});',
    's1.dims.push({id:"d1",type:"dist",ent:"l0",val:40});',
    's1.host=null;',
    'const s2=rect("sk2","Profil B",10,10,26,22);',
    's2.host={feat:"F1",tag:"TOP",x:12,y:11,name:"Face1"};',
    '// la révolution a besoin d\'un axe DANS le plan de son esquisse : ligne de construction',
    's2.points.ax0={x:-5,y:0};s2.points.ax1={x:35,y:0};',
    's2.entities.push({id:"axl",t:"line",p1:"ax0",p2:"ax1",construction:true});',
    'doc.sketches.push(s1,s2);',
    'doc.features.push({id:"F1",type:"extrude",name:"Bloc",sketchId:"sk1",distance:20,op:"add",visible:true,mid:false,upto:null});',
    'doc.features.push({id:"F2",type:"revolve",name:"Rev",sketchId:"sk2",axis:{k:"line",id:"axl"},angle:360,op:"cut",visible:true});',
    'doc.features.push({id:"F3",type:"xfillet",name:"Congé",target:"F1",edges:[{pos:[40,15,0],r:2,len:30,anchor:null,name:"Edge1"}],visible:true,kind:"fillet"});',
    'doc.features.push({id:"F4",type:"repeat",name:"Rép",base:["F1"],copies:2,dist:15,angle:0,axis:"X",plane:"YZ",mode:"lin",visible:true});',
    'doc.features[2].visible=false;   // un congé masqué doit survivre à l annulation (pas l extrusion !)',
    'out.nbSk=doc.sketches.length;out.nbF=doc.features.length;',
    '// ── référence de rejeu, prise APRÈS un 1er rebuild : le document est alors normalisé',
    '//    (migrateSketch a ajouté le point d\'origine O). C\'est cet état normalisé qu\'un',
    '//    annuler doit savoir restaurer — pas un document « sale ».',
    'markDirty();rebuild();',
    'out.avant=JSON.stringify(doc);',
    'const FR1=occFinalShape(null);',
    'out.refFaces=FR1.shape?facesOf(FR1.shape):-1;out.refEdges=FR1.shape?occListEdges(FR1.shape).length:-1;',
    'out.refMsgs=(FR1.msgs||[]).slice(0,3);',
    'out.refSig=featSig(doc.features[0])+"|"+featSig(doc.features[1]);',
    'if(FR1.shape)occCleanup(FR1,null);',
    '// ── aller-retour JSON : l\'instantané qu\'un undo utiliserait',
    'const snap=JSON.parse(JSON.stringify(doc));',
    'out.json=JSON.stringify(snap);',
    'out.tailleJson=out.json.length;',
    '// ce qui doit IMPÉRATIVEMENT survivre',
    'out.survie={',
    '  nbSk:snap.sketches.length,nbF:snap.features.length,',
    '  host:snap.sketches[1].host?1:0,',
    '  hostNom:snap.sketches[1].host?(snap.sketches[1].host.name||"?"):"-",',
    '  cibleCongé:(snap.features[2].target||"-"),',
    '  baseRep:(snap.features[3].base||[]).join("+")||"-",',
    '  masqueF1:snap.features[2].visible===false?1:0,',
    '  angleRev:snap.features[1].angle,',
    '  dim:snap.sketches[0].dims[0].val,',
    '  contrainte:snap.sketches[0].constraints[0].type};',
    '// ── on restaure l instantané et on REJOUE : le modèle doit être identique',
    'doc.sketches=snap.sketches;doc.features=snap.features;doc.entNames=snap.entNames;',
    'out.apres=JSON.stringify(doc);',
    '// ── le solide ne se construit PAS : pourquoi ? (on，降级 pas de features)',
    'out.diag=(function(){',
    '  const etapes=[];',
    '  const essai=(nom,liste)=>{',
    '    doc.features=liste.slice();',
    '    markDirty();rebuild();',
    '    const FR=occFinalShape(null);',
    '    etapes.push(nom+" -> "+(FR.shape?(facesOf(FR.shape)+" faces"):("ECHEC"+(FR.msgs&&FR.msgs.length?(" ["+FR.msgs.slice(0,2).join(" | ")+"]"):""))));',
    '    if(FR.shape)occCleanup(FR,null);',
    '  };',
    '  const F1=doc.features.find(x=>x.id==="F1"),F2=doc.features.find(x=>x.id==="F2"),',
    '        F3=doc.features.find(x=>x.id==="F3"),F4=doc.features.find(x=>x.id==="F4");',
    '  essai("extrude seule",[F1]);',
    '  essai("extrude+rep",[F1,F4]);',
    '  essai("extrude+conge",[F1,F3]);',
    '  essai("extrude+rev",[F1,F2]);',
    '  essai("les quatre",[F1,F2,F3,F4]);',
    '  doc.features=[F1,F2,F3,F4];',
    '  return etapes;',
    '})();',
    '// localisation exacte de la divergence',
    'out.div=(function(){',
    '  const a=out.avant,b=out.apres;',
    '  if(a===b)return null;',
    '  let i=0;while(i<Math.min(a.length,b.length)&&a[i]===b[i])i++;',
    '  return{i:i,avant:a.slice(Math.max(0,i-70),i+90),apres:b.slice(Math.max(0,i-70),i+90),lenA:a.length,lenB:b.length};',
    '})();',
    '// valeurs non representables en JSON (undefined / NaN) dans le document',
    'out.pis=(function(){',
    '  const p=[];',
    '  const walk=(o,chemin)=>{',
    '    if(o===null)return;',
    '    if(typeof o==="number"){if(!isFinite(o))p.push(chemin+"="+o);return;}',
    '    if(typeof o!=="object")return;',
    '    if(Array.isArray(o)){o.forEach((v,i)=>{if(v===undefined)p.push(chemin+"["+i+"]=undefined");else walk(v,chemin+"["+i+"]");});return;}',
    '    Object.keys(o).forEach(k=>{',
    '      if(o[k]===undefined)p.push(chemin+"."+k+"=undefined");',
    '      else walk(o[k],chemin+"."+k);});',
    '  };',
    '  walk(doc,"doc");',
    '  return p;',
    '})();',
    'markDirty();rebuild();',
    'const FR2=occFinalShape(null);',
    'out.newFaces=FR2.shape?facesOf(FR2.shape):-1;out.newEdges=FR2.shape?occListEdges(FR2.shape).length:-1;',
    'out.newSig=featSig(doc.features[0])+"|"+featSig(doc.features[1]);',
    'if(FR2.shape)occCleanup(FR2,null);',
    'return out;',
    'function facesOf(s){let n=0;const e=new occt.TopExp_Explorer_2(s,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(e.More()){n++;e.Next();}return n;}'
  ].join('\n');
  let o;
  try{o=await vm.runInContext('(async()=>{'+body+'})()',ctx);}
  catch(e){console.log('FATAL '+String(e&&e.message||e).slice(0,400));process.exit(1);}
  console.log('=== 2026-09-30r : fidélité de l\'instantané d\'annulation ===');
  console.log('  document : '+o.nbSk+' esquisses, '+o.nbF+' fonctions, '+o.tailleJson+' octets de JSON');
  console.log('  AVANT rejeu : '+o.refFaces+' faces, '+o.refEdges+' arêtes');
  console.log('  APRÈS rejeu : '+o.newFaces+' faces, '+o.newEdges+' arêtes');
  console.log('  survie : '+JSON.stringify(o.survie));
  if(o.pis&&o.pis.length){
    console.log('  valeurs non sérialisables ('+o.pis.length+') :');
    o.pis.slice(0,12).forEach(p=>console.log('    · '+p));
    if(o.pis.length>12)console.log('    … et '+(o.pis.length-12)+' autres');
  }else console.log('  valeurs non sérialisables : aucune');
  if(o.diag){
    console.log('  diagnostic de construction (par sous-ensemble) :');
    (o.diag||[]).forEach(d=>console.log('    '+d));
  }
  if(o.div){
    console.log('  DIVERGENCE à l\'offset '+o.div.i+' (longueurs '+o.div.lenA+' → '+o.div.lenB+')');
    console.log('    avant : …'+o.div.avant+'…');
    console.log('    après : …'+o.div.apres+'…');
  }
  A(o.avant===o.apres,'le document est BIT À BIT identique après aller-retour JSON');
  A(o.refFaces===o.newFaces&&o.refEdges===o.newEdges,'le solide rejoué est identique ('+o.refFaces+' faces, '+o.refEdges+' arêtes)');
  A(o.refSig===o.newSig,'les signatures de rejeu sont inchangées');
  A(o.survie.nbSk===2&&o.survie.nbF===4,'nombre d\'esquisses et de fonctions conservé');
  A(o.survie.host===1&&o.survie.hostNom==='Face1','hôte d\'esquisse (antériorité) conservé');
  A(o.survie.cibleCongé==='F1'&&o.survie.baseRep==='F1','références entre fonctions conservées (target, base)');
  A(o.survie.masqueF1===1,'l\'état de visibilité est conservé');
  A(o.survie.angleRev===360&&o.survie.dim===40&&o.survie.contrainte==='h','valeurs de paramètres et contraintes conservées');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,400));process.exit(1);});