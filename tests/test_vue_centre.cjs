// V0.2.5 : le CENTRE de rotation de la vue 3D suit la zone VISIBLE du grand
// panneau — entre le bandeau vertical de gauche (arborescence des corps, panneau
// Usinage en moderne FAO) et les overlays de droite (barre + panneau FAO en
// classique). Sans ça, le pivot d'orbite reste au centre du CANVAS : la pièce
// est excentrée et « fuit » en orbite dès qu'un bandeau est déplié.
// Suite : mesure PURE (viewMidOffset) + application (viewCenterShift via
// setViewOffset, no-op silencieux si la caméra du harnais n'a pas la méthode) +
// appels branchés aux points de changement (fit, repli arbre, repli FAO, espace).
const fs=require('fs'),path=require('path'),vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const APP=path.join(__dirname,'..','fusion_mvp.html');
const SRC=fs.readFileSync(APP,'utf8');
const src=f=>fs.readFileSync(path.join(__dirname,'..','src',f),'utf8');
const faoSrc=fs.readdirSync(path.join(__dirname,'..','src'))
  .filter(f=>/^88-fao-.*\.js$/.test(f)).sort().map(src).join('\n');
const S={s10:src('10-scene-3d.js'),s95:src('95-toolbar.js'),s88:faoSrc,s97:src('97-interface-moderne.js')};
const hasSrc=s=>SRC.indexOf(s)>=0;
const str=v=>JSON.stringify(v);
const HOST=[
];

const b=[
"  return new Promise(function(REZ){",
"  const P=[],ATT=[];",
"  const p=s=>P.push(String(s));",
"  const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
"  const fin=function(){",
"    if(ATT.length){p('');p('ÉCHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  ✗ '+m);});}",
"    else{p('');p('TOUT EST CONFORME');}",
"    REZ(P.join('\\n'));",
"  };",
// --- A) contrat source : la mesure et son application existent, branchées partout ---
"  const seg=function(s,fn){const i=s.indexOf('function '+fn);if(i<0)return '';const j=s.indexOf('\\nfunction ',i+1);return s.slice(i,j<0?undefined:j);};",
"  att(/function viewMidOffset/.test("+str(S.s10)+"),'src/10 : viewMidOffset absente');",
"  att(/function viewCenterShift/.test("+str(S.s10)+"),'src/10 : viewCenterShift absente');",
"  att(seg("+str(S.s10)+",'fit').indexOf('viewCenterShift')>=0,'src/10 : fit() applique le décalage');",
"  att(seg("+str(S.s95)+",'treeFoldSet').indexOf('viewCenterShift')>=0,'src/95 : treeFoldSet applique le décalage');",
"  att(seg("+str(S.s88)+",'faoFoldSet').indexOf('viewCenterShift')>=0,'src/88 : faoFoldSet applique le décalage');",
"  att(seg("+str(S.s97)+",'mfWs').indexOf('viewCenterShift')>=0,'src/97 : mfWs applique le décalage');",
"  att(/setViewOffset/.test("+str(S.s10)+"),'src/10 : la projection est décalée via setViewOffset');",
"  att(/clearViewOffset/.test("+str(S.s10)+"),'src/10 : le décalage est retiré quand la zone est déjà centrée');",
// V0.21.5 : pendant une fonction (congé, dépouille, coque), l'aperçu remplace la pièce : il compte pour le point sous la souris
"  att(/b\\.preview/.test(seg("+str(S.s10)+",'viewHitAt'))&&/Mesh\\.prototype\\.raycast\\.call/.test(seg("+str(S.s10)+",'viewHitAt')),'src/10 : viewHitAt vise aussi l\\'aperçu d\\'une fonction (raycast lancé à la main)');",
// --- B) géométrie mesurée : rectangles substitués au cas par cas (harnais) ---
"  const VP=document.getElementById('vpwrap');VP.clientWidth=1000;VP.clientHeight=600;",
"  VP.getBoundingClientRect=function(){return{left:0,top:0,right:1000,bottom:600,width:1000,height:600};};",
"  const TW=document.getElementById('treeWrap');", // lue par getElementById dans viewMidOffset
"  const FTW=faoTreeWrapEl||document.getElementById('faoTreeWrap');", // refs réelles utilisées par viewMidOffset
"  const FAB=faoAddBarEl||document.getElementById('faoAddBar');",
"  const modOff=function(){document.body.classList={add(){},remove(){},toggle(){},contains(){return false;}};document.body.getAttribute=function(){return null;};};",
"  modOff();",
"  const band=function(el,right,width){el.getBoundingClientRect=(right>0&&width>0)?function(){return{left:right-width,top:0,right:right,bottom:600,width:width,height:600};}:function(){return{left:0,top:0,right:0,bottom:0,width:0,height:0};};};",
"  band(TW,260,260);band(FTW,0,0);band(FAB,0,0);",
// s1 : arbre déplié à gauche (260), rien à droite → pivot à 630 au lieu de 500
"  {const o=viewMidOffset();att(o.W===1000&&o.H===600,'dimensions lues dans #vpwrap : '+o.W+'x'+o.H);att(Math.abs(o.L-260)<1,'s1 L = bord droit du bandeau arbre : '+o.L);att(Math.abs(o.R-1000)<0.001,'s1 R = pleine largeur (rien à droite sur le canvas) : '+o.R);att(Math.abs(o.d-130)<1,'s1 arbre déplié : d=130 (630−500), obtenu '+o.d);}",
// s2 : arbre RABATTU (onglet seul 24px) → décalage minime conservé
"  {band(TW,24,24);const o=viewMidOffset();att(Math.abs(o.d-12)<1,'s2 arbre rabattu (onglet 24px) : d=12, obtenu '+o.d);}",
// s3 : aucun bandeau (rects nuls) → pivot exactement au centre du canvas
"  {band(TW,0,0);const o=viewMidOffset();att(o.L===0,'s3 L nul sans bandeau : '+o.L);att(o.d===0,'s3 aucun bandeau : d=0, obtenu '+o.d);}",
// s4 : classique FAO — arbre à gauche + barre & panneau FAO à DROITE sur le canvas
"  {band(TW,260,260);band(FAB,1000,400);band(FTW,1000,440);const o=viewMidOffset();att(Math.abs(o.R-560)<1,'s4 R = bord GAUCHE du groupe FAO (barre et panneau, min) : '+o.R);att(Math.abs(o.d+90)<1,'s4 classique FAO : d=−90 (410−500, pivot tamponné à gauche), obtenu '+o.d);}",
// s5 : moderne espace FAO — panneau Usinage à GAUCHE, fiches FAO hors canvas
"  {band(FAB,0,0);document.body.classList={add(){},remove(){},toggle(){},contains:function(k){return k==='ui-modern';}};document.body.getAttribute=function(){return 'fao';};band(FTW,500,500);const o=viewMidOffset();att(Math.abs(o.L-500)<1,'s5 L = bord droit du panneau Usinage : '+o.L);att(Math.abs(o.R-1000)<0.001,'s5 R : rien à subir à droite (fiches hors canvas) : '+o.R);att(Math.abs(o.d-250)<1,'s5 moderne FAO : d=250 (750−500), obtenu '+o.d);}",
// s6 : bandeaux repliés et esquisse ouverte → d forcé à 0 (fondu 3D aligné sur le SVG)
"  {modOff();band(FTW,0,0);band(TW,24,24);skEdit={points:{},entities:[],seq:1};const o=viewMidOffset();att(o.d===0,'s6 esquisse ouverte : d forcé à 0, obtenu '+o.d);skEdit=null;}",
// --- C) application : viewCenterShift ne doit JAMAIS lever sous harnais (caméra stub) ---
"  {try{viewCenterShift();att(true,'s7 viewCenterShift sans setViewOffset (harnais) : no-op silencieux');}catch(e){att(false,'s7 viewCenterShift a levé : '+((e&&e.message)||e));}}",
"  {skEdit={points:{},entities:[],seq:1};try{viewCenterShift();att(true,'s8 viewCenterShift pendant esquisse : sans effet');}catch(e){att(false,'s8 a levé : '+((e&&e.message)||e));}skEdit=null;}",
// --- D) repères de la coque (le test lit le livrable reconstruit) ---
"  att("+hasSrc('#faoWrap{position:absolute;top:10px;right:10px;')+",\"coque : #faoWrap overlay à droite du canvas (classique)\");",
"  att(/document\\.body\\.classList\\.contains\\('ui-modern'\\)/.test("+str(S.s10)+"),'src/10 : le mode moderne (ui-modern) est détecté');",
"  att(/data-ws/.test("+str(S.s10)+"),'src/10 : la détection lit data-ws (espace CAO/FAO)');",
"  fin();",
"  });",
];
(async()=>{
  const {ctx}=loadApp();
  const code='(async()=>{\n'+b.join('\n')+'\n})()';
  const r=await vm.runInContext(code,ctx,{filename:'vuecentre.js'});
  console.log(r);
  if(/ÉCHECS/.test(r))process.exit(1);
})().catch(e=>{console.error('FATAL',String(e&&e.stack||e).slice(0,900));process.exit(1);});
