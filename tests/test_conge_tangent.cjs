// Congé « arêtes tangentes » PERSISTANT : UNE arête germe (cliquée) suffit — à chaque
// rejeu la chaîne tangente est recalculée sur les arêtes du solide ACTUEL (passe 2b) :
// entrées perdues rattachées, arêtes apparues ajoutées au rayon du germe. Le drapeau
// f.tangent et le grain e.seed sont enregistrés (création, édition, JSON) — avant, tout
// était redemandé à l'interface à chaque session et « tangence sur une seule arête »
// oubliait sa chaîne au premier rejeu (retour utilisateur).
// Géométrie : profil SLOT (2 lignes + 2 demi-cercles tangents) extrudé 40 — la boucle
// supérieure = 4 arêtes tangentes en anneau (chaîne = 4).
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
    // --- slot : 2 lignes + 2 demi-cercles tangents, extrudé 40
    "const sk={id:'sk_t',name:'Slot',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[],seq:1,visible:true};",
    "[['p1',-20,6],['p2',20,6],['p3',20,-6],['p4',-20,-6],['p5',-20,0],['p6',20,0]].forEach(q=>{sk.points[q[0]]={x:q[1],y:q[2]};});",
    "sk.entities.push({id:'e1',t:'line',p1:'p1',p2:'p2'});",
    "sk.entities.push({id:'e2',t:'line',p1:'p4',p2:'p3'});",
    "sk.entities.push({id:'e3',t:'arc',pc:'p5',pa:'p1',pb:'p4',r:6});",
    "sk.entities.push({id:'e4',t:'arc',pc:'p6',pa:'p3',pb:'p2',r:6});",
    "doc.sketches=[sk];",
    "doc.features=[{id:'ex_t',type:'extrude',name:'Slot',sketchId:'sk_t',op:'add',distance:40,dist:40,d2:0,visible:true}];",
    "occSkipFeat=null;occCkClear();markDirty();rebuild();",
    // --- création PAR L'INTERFACE : entrée en mode exact, UN germe cliqué, tangence on
    "enterExactFilletMode(null,'fillet');",
    "att(!!filModeX,'mode congé exact non entré');",
    "const i0=filModeX?filModeX.edges.findIndex(e=>Math.hypot(e.mid[0]-0,e.mid[1]-6,e.mid[2]-40)<0.75):-1;",
    "att(i0>=0,'arête germe (haut, y=6) introuvable dans '+((filModeX&&filModeX.edges.length)||0)+' arêtes');",
    "if(i0>=0)xSeedAdd(i0);",
    "xSelSync();",
    "p('xSelSync : sel='+filModeX.sel.length+' arêtes, germes='+filModeX.seeds.length+' (chaîne tangente attendue : 4)');",
    "att(filModeX.sel.length===4,'après propagation : '+filModeX.sel.length+' arête(s) retenue(s) (4 attendues)');",
    "applyExactFillet();",
    "const f=doc.features.find(x=>x.type==='xfillet');",
    "att(!!f,'fonction de congé non créée');",
    "if(!f)return P.join(String.fromCharCode(10));",
    "att(f.tangent===true,'f.tangent non persisté à la création (='+(f.tangent)+')');",
    "const nbSeed=(f.edges||[]).filter(e=>e.seed).length;",
    "att(nbSeed===1,'germes persistés : '+nbSeed+' (1 attendu — une seule arête cliquée)');",
    "att(f.edges.length===4,'entrées enregistrées : '+f.edges.length+' (4 — xSelSync au moment du clic)');",
    "p('création : tangent='+f.tangent+' entrées='+f.edges.length+' germe(s)='+nbSeed+' _m='+(f._m?f._m.m+'/'+f._m.t:'?'));",
    "att(!!f._m&&f._m.m===4&&f._m.t===4,'création : '+(f._m?f._m.m+'/'+f._m.t:'compte absent')+' (4/4 attendu)');",
    // --- rejeu stable : rien ne s'ajoute, rien ne se perd
    "occCkClear();markDirty();rebuild();",
    "att(!!f._m&&f._m.m===4&&f._m.t===4,'rejeu : '+(f._m?f._m.m+'/'+f._m.t:'?')+' (4/4)');",
    "att(f.edges.length===4,'rejeu : le nombre d entrées dérive ('+f.edges.length+')');",
    "att((f.edges||[]).filter(e=>e.seed).length===1,'rejeu : le germe change');",
    // --- modification amont : le slot s'allonge (p2/p3/p6 → 28) — la chaîne suit
    "sk.points.p2.x=28;sk.points.p3.x=28;sk.points.p6.x=28;",
    "occCkClear();markDirty();rebuild();",
    "p('après allongement du slot (bouchons droit déplacés de 8 mm)');",
    "att(!!f._m&&f._m.m===4&&f._m.t===4,'après modification : '+(f._m?f._m.m+'/'+f._m.t:'?')+' (4/4 attendu)');",
    "att(!f._miss||!f._miss.length,'après modification : arête(s) perdue(s) '+JSON.stringify(f._miss||[]));",
    "att(f.edges.length===4,'après modification : entrées='+f.edges.length);",
    // --- persistance JSON (sauvegarde/rechargement du document)
    "const f2=JSON.parse(JSON.stringify(f));",
    "att(f2.tangent===true,'JSON : tangent perdu au cycle sauvegarde/rechargement');",
    "att((f2.edges||[]).some(e=>e.seed===1),'JSON : le germe (seed) perdu');",
    // --- tangence DÉCOCHÉE : seule la germe s applique, la chaîne ne se redessine pas
    "f.tangent=false;f.edges=f.edges.filter(e=>e.seed);",
    "occCkClear();markDirty();rebuild();",
    "p('tangence décochée : entrées='+f.edges.length+' _m='+(f._m?f._m.m+'/'+f._m.t:'?'));",
    "att(!!f._m&&f._m.m===1&&f._m.t===1,'tangence off : '+(f._m?f._m.m+'/'+f._m.t:'?')+' (1/1 attendu)');",
    "att(f.edges.length===1,'tangence off : la chaîne se redessine malgré tout (entrées='+f.edges.length+')');",
    "att(!f._miss||!f._miss.length,'tangence off : perdue(s) '+JSON.stringify(f._miss||[]));",
    // --- tangence RECOCHÉE : au prochain rejeu l appli retrouve TOUTE la chaîne seule
    "f.tangent=true;",
    "occCkClear();markDirty();rebuild();",
    "p('tangence recochée : entrées='+f.edges.length+' _m='+(f._m?f._m.m+'/'+f._m.t:'?')+' germe(s)='+(f.edges||[]).filter(e=>e.seed).length);",
    "att(!!f._m&&f._m.m===4&&f._m.t===4,'tangence on : '+(f._m?f._m.m+'/'+f._m.t:'?')+' (4/4 — la chaîne re-trouvée)');",
    "att(f.edges.length===4,'tangence on : entrées='+f.edges.length+' (4 attendues)');",
    "att((f.edges||[]).filter(e=>e.seed).length===1,'tangence on : germes='+(f.edges||[]).filter(e=>e.seed).length+' (1 — le germe pilote, pas les doublons)');",
    "att(!f._miss||!f._miss.length,'tangence on : perdue(s) '+JSON.stringify(f._miss||[]));",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));return P.join(String.fromCharCode(10));}",
    "p('');p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'conge_tangent.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
