// Clic droit sur un corps (arbre ET vue 3D) → « Exporter ce corps en STEP ».
// 1) bouton créé par le JS dans les DEUX menus, affiché pour un corps seul ;
// 2) sans OCCT : alerte propre (aucun plantage) ;
// 3) OCCT simulé : le writer reçoit LA SHAPE DU CORPS (perBody filtré) — jamais le
//    composé de tous les corps — nom de fichier au nom du corps, cleanup fait ;
// 4) corps sans fonction dans le rejeu : message « rien à exporter », rien écrit.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const ALERTS=[];window.alert=function(m){ALERTS.push(String(m));};",
    // --- 1) bouton présent dans les deux menus (créé en JS, pas dans la coque)
    "const cm=document.getElementById('ctxMenu');",
    "const cm3=document.getElementById('ctxMenu3D');",
    "const findBtn=function(m){return (m.children||[]).filter(b=>b&&b.dataset&&b.dataset.act==='step')[0]||null;};",
    "const b1=findBtn(cm),b3=findBtn(cm3);",
    "att(!!b1,'arbre : bouton data-act=step present');",
    "att(!!b3,'vue 3D : bouton data-act=step present');",
    "att(!!b1&&b1.textContent.indexOf('STEP')>=0,'libelle STEP ('+(b1?b1.textContent:'?')+')');",
    // --- 2) visibilite selon le kind de cible
    "showCtx(10,10,{kind:'body',id:'b1'});",
    "att(b1.style.display==='','corps (arbre) : bouton visible (display='+JSON.stringify(b1.style.display)+')');",
    "showCtx(10,10,{kind:'sketch',id:'s1'});",
    "att(b1.style.display==='none','esquisse : bouton masque');",
    "showCtx(10,10,{kind:'feature',id:'f1'});",
    "att(b1.style.display==='none','fonction : bouton masque');",
    "showCtx3D(10,10,'b1');",
    "att(b3.style.display==='','vue 3D sur corps : bouton visible');",
    "showCtx3D(10,10,null);",
    "att(b3.style.display==='none','vue 3D sans corps : bouton masque');",
    // --- 3) SANS OCCT : alerte claire, aucun plantage
    "showCtx(10,10,{kind:'body',id:'b1'});",
    "ALERTS.length=0;faceEl.textContent='';",
    "b1.onclick();",
    "att(ALERTS.length===1&&/OCCT indisponible/.test(ALERTS[0]),'sans OCCT : alerte ('+ALERTS.join(' | ')+')');",
    "att(/OCCT indisponible/.test(faceEl.textContent),'sans OCCT : message aussi en face d informations');",
    // --- 4) OCCT simule : c EST la shape du corps qui part dans le writer
    // (le boot asynchrone de l app remet occtReady=false au 1er tick : on re-pose
    //  les stubs AVANT chaque clic, sinon occHas() redevient faux entre deux tests)
    "occtReady=true;occt={FS:{unlink:function(){},readFile:function(){return new Uint8Array(1536);},readdir:function(){return [];},cwd:function(){return '/';}}};",
    "occExportPreflight=async function(){return [true,'pre-test OK'];};",
    "const SH1={tag:'shape-b1'},SH2={tag:'shape-b2'},SHG={tag:'composes'};",
    "occFinalShape=function(){return {shape:SHG,perBody:[{bodyId:'b1',shape:SH1},{bodyId:'b2',shape:SH2}]};};",
    "let wrote=null,cleaned=0;",
    "occWriteStep=function(shapes,path){wrote={shapes:shapes,path:path};return new Uint8Array(1536);};",
    "occCleanup=function(){cleaned++;};",
    "Blob=class{constructor(parts,opts){this.parts=parts;this.type=(opts||{}).type;}};",
    "URL={createObjectURL:function(){return 'blob:test';},revokeObjectURL:function(){}};",
    "doc.bodies=[{id:'b1',name:'Piece A'}];",
    "let dl=null;const _ce=document.createElement.bind(document);",
    "document.createElement=function(t){const n=_ce(t);if(String(t).toLowerCase()==='a'){n.click=function(){dl=n;};}return n;};",
    "ALERTS.length=0;wrote=null;cleaned=0;dl=null;",
    "showCtx(10,10,{kind:'body',id:'b1'});",
    "b1.onclick();",
    "await new Promise(function(r){setTimeout(r,10);});",
    "att(ALERTS.length===0,'export arbre : aucune alerte ('+ALERTS.join(' | ')+')');",
    "att(!!wrote&&wrote.shapes.length===1,'writer : exactement 1 shape');",
    "att(!!wrote&&wrote.shapes[0]===SH1,'writer : la shape DU CORPS b1 ('+(wrote?wrote.shapes[0].tag:'rien')+', pas le compose)');",
    "att(!!wrote&&wrote.shapes[0]!==SHG,'writer : jamais le compose global');",
    "att(!!wrote&&wrote.path==='/b.stp','chemin court /b.stp ('+(wrote?wrote.path:'?')+')');",
    "att(!!dl&&dl.download==='Piece A.step','nom de fichier = nom du corps ('+(dl?dl.download:'aucun telechargement')+')');",
    "att(cleaned===1,'occCleanup appele une fois ('+cleaned+')');",
    "att(/1\\.5 Ko/.test(faceEl.textContent),'retour : '+faceEl.textContent);",
    // --- 4b) le meme export depuis le menu 3D
    "wrote=null;dl=null;ALERTS.length=0;occtReady=true;occt={FS:{unlink:function(){},readFile:function(){return new Uint8Array(1536);},readdir:function(){return [];},cwd:function(){return '/';}}};",
    "showCtx3D(10,10,'b1');",
    "b3.onclick();",
    "await new Promise(function(r){setTimeout(r,10);});",
    "att(ALERTS.length===0&&!!wrote&&wrote.shapes[0]===SH1,'vue 3D : meme export du corps b1');",
    // --- 5) corps absent du rejeu : rien ecrit, message explicite
    "wrote=null;dl=null;ALERTS.length=0;occtReady=true;occt={FS:{unlink:function(){},readFile:function(){return new Uint8Array(1536);},readdir:function(){return [];},cwd:function(){return '/';}}};",
    "showCtx(10,10,{kind:'body',id:'zzz'});",
    "b1.onclick();",
    "await new Promise(function(r){setTimeout(r,10);});",
    "att(wrote===null&&dl===null,'corps hors rejeu : rien ecrit, rien telecharge');",
    "att(ALERTS.length===1&&/rien . exporter/.test(ALERTS[0]),'corps hors rejeu : alerte explicite ('+ALERTS.join(' | ')+')');",
    "att(/rien . exporter/.test(faceEl.textContent),'corps hors rejeu : retour en face d informations');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'ctxstep.js'});
  console.log('=== clic droit corps -> export STEP ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
