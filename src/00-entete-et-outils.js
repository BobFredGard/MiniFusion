/* ============ MiniFusion MVP — paramétrique + viewer-like ============ */
/* DÉGEL 2026-09-29 — anciennes zones GEL 2026-09-25 (sketch skLoopTrace→solveSketch + contraintes,
   congés xfillet/occApplyXFillets, antériorité occFinalShape/findHost) : désormais MODIFICATION LIBRE,
   sous la discipline projet — régression 24/24 verts → bump APP_VER → snapshot Backup/ → push GitHub.
   GARDE-FOU : le noyau exact OCCT (occApplyXFillets, occFinalShape) n'est PAS couvert par le harnais
   (OCCT ne se charge pas en node) — ne le modifier qu'après validation navigateur ET accord explicite.

   ── HISTORIQUE ─────────────────────────────────────────────────────────────
      Journal des versions (cause, correctif, test) : CHANGELOG.md — 123 entrées,
    de 2026-09-28b à 2026-10-01-015. Elles étaient embarquées ici (50 Ko) et sont
   sorties du livrable le 2026-09-30j. Ce qui précède est la description du projet
   et ses garde-fous, reprise telle quelle.
   ───────────────────────────────────────────────────────────────────────────
 *
 * ── VERSIONS ──
 * Avant le 2026-10-01 : `2026-09-30l`…`2026-09-31i` (date indicative + lettre).
 * Depuis le 2026-10-01 : `AAAA-MM-JJ-NNN` — date RÉELLE du jour + compteur quotidien
 * démarrant à 001, NNN sur 3 chiffres (`2026-10-01-001`, puis `-002`, …).
 * Le compteur repart à 001 chaque jour : avant de bumper, regarder la dernière version
 * du jour (`git log --oneline`, tags). Même règle pour les snapshots
 * (`Backup/fusion_mvp_AAAA-MM-JJ-NNN.html`) et les entrées `### …` du CHANGELOG.
 * APP_VER n’est comparé qu’à égalité stricte (anti-cache) et affiché : le format
 * peut changer sans rien casser.
 */

const APP_VER='2026-10-01-015';
try{document.getElementById('appVer').textContent=APP_VER;}catch(e){}
try{console.log('[MiniFusion] version '+APP_VER);}catch(e){}
let extPickFace=null; // mode « vers un objet » : clic sur une face pour le sens (Échap = annuler)
let ghostHide=null; // découpe dont l'OUTIL (fantôme rouge translucide) reste masqué après
                   // l'opération — le mécanisme d'aperçu au clic dans l'arbre est inchangé.
const $=id=>document.getElementById(id);
const statsEl=$('stats'), faceEl=$('faceInfo');
const log=s=>{statsEl.textContent=s;};
let scene,camera,renderer,controls,rayc=new THREE.Raycaster();
let bodies=[]; // {id,name,mesh,color,visible,transparent,kind,ref}
let doc={name:'Sans titre',sketches:[],features:[],bodyVis:{},bodies:[],bodySeq:1,activeBody:null}; // features: {id,type:'extrude'|'import',name,sketchId?,distance?,visible} ; bodies: identités multi-corps persistées (Corps 1, Corps 2… — centroïdes, jamais de handles)
let uidN=0; const uid=p=>p+'_'+(++uidN)+'_'+Date.now().toString(36);
function entName(kind){
  // Nom persistant unique d'une référence (Arête 1, Face 2, Projetée 3) — compteur
  // par type, jamais réemployé même si la référence est supprimée (l'identité reste stable).
  doc.entNames=doc.entNames||{};
  const k=(kind==='face')?'face':(kind==='proj')?'proj':'edge';
  const lab=(k==='edge')?'Arête ':(k==='face')?'Face ':'Projetée ';
  doc.entNames[k]=(doc.entNames[k]||0)+1;
  return lab+doc.entNames[k];
}
let sel={kind:null,id:null};
let selFaces=[]; // {mesh,faceIndex,point}
let selGroup=null,measureGroup=null,labelsDiv=$('labels'),selLabels=[];
let clipPlane=null,fileHandle=null,occt=null,occtReady=false,dirty=false;
let builtHash=null,builtEngine=null; // empreinte doc + moteur ('exact'|'mesh') du dernier affichage
// --- performances de reconstruction -------------------------------------------
// _docVersion : incrémenté à CHAQUE modification (markDirty) → un rebuild déclenché sans
// aucune modification entre deux rejeux est saute (O(1), aucun hashing nécessaire).
// docHash() est mémoïsé par version : une seule sérialisation du document par version au
// lieu de deux (rebuild + saveViewCache). L'empreinte et le cache d'affichage sont
// désormais écrits APRÈS le rendu (buildDone) : plus de blocking dans le chemin critique.
let builtVersion=-1,builtTl=null,builtSkip=null;
let _docVersion=0,_hashMemo=null,_hashVer=-1,_postT=null,_autoT=null;
function collectView(){
  // Préférences d'affichage (persistées dans le fichier à la sauvegarde).
  try{
    return{edges:edgeMode,mirror:mirrorOn,axes:axHelper?axHelper.visible:true,zoomInv,
      clipOn:$('clipOn').checked,clipPos:parseFloat($('clipPos').value)||0,clipFlip:$('clipFlip').checked};
  }catch(e){return{};}
}
function applyView(v){
  // Restaure l'affichage mémorisé (ouverture de fichier).
  if(!v)return;
  try{
    if(v.edges==='on'||v.edges==='off'){edgeMode=v.edges;if($('optEdges'))$('optEdges').value=edgeMode;}
    if(typeof v.mirror==='boolean'){mirrorOn=v.mirror;if($('optMirror'))$('optMirror').checked=mirrorOn;}
    if(typeof v.axes==='boolean'){if(axHelper)axHelper.visible=v.axes;if($('optAxes'))$('optAxes').checked=v.axes;}
    if(typeof v.zoomInv==='boolean'){zoomInv=v.zoomInv;if(controls)controls.zoomSpeed=zoomInv?-1:1;if($('optZoomInv'))$('optZoomInv').checked=zoomInv;}
    if(typeof v.clipOn==='boolean'&&$('clipOn'))$('clipOn').checked=v.clipOn;
    if(isFinite(v.clipPos)&&$('clipPos'))$('clipPos').value=v.clipPos;
    if(typeof v.clipFlip==='boolean'&&$('clipFlip'))$('clipFlip').checked=v.clipFlip;
    applyClip();refreshMirror();buildEdgeOverlay();
  }catch(e){}
}
let occBaseMsg='OCCT : état inconnu',occEngineMsg='—';
function occStatus(){try{$('occtState').textContent=occBaseMsg+' · Moteur : '+occEngineMsg;}catch(e){}
  try{const b=$('btnOccWasm');if(b)b.style.display=occtReady?'none':'';}catch(e){}}
async function occtFinishBoot(){
  occtReady=!!(occt&&occt.BRepPrimAPI_MakeBox_2&&occt.BRepFilletAPI_MakeFillet);
  occBaseMsg=occtReady
    ?'OCCT : prêt — prismes exacts, booléens Fuse/Cut, congés toutes arêtes, STEP.'
    :'OCCT : chargé mais incomplet — repli sur maillage (CSG).';
  occStatus();
  if(occtReady){
    // Recalcul systématique une fois le noyau prêt (même si un affichage existe) :
    // c'est ce qui garantit l'exact, le cache ne servant qu'à l'attente.
    // On ANNULE la garde « rien n'a changé » avant : restoreViewCache pose builtHash, donc
    // rebuild() se croyait à jour et ne rejouait rien. Résultat mesuré : au 2e
    // rechargement de la page, le cache était valide, le rejeu sauté, occLive absent —
    // plus aucun congé, plus aucune esquisse sur face, plus aucune sélection de face.
    try{faceEl.textContent='Noyau prêt — recalcul exact…';builtVersion=-1;builtHash=null;builtEngine=null;rebuild();}catch(e){}
    try{if(filMode&&occLive&&occLive.shape){exitFilletMode(true);enterExactFilletMode();}}catch(e){}}
}
async function bootWasmBinary(buf){
  // Mode fichier (file://) : le fetch du .wasm est bloqué par CORS, on l'injecte à la main.
  const factory=window.opencascadeFactory||window.opencascade;
  if(typeof factory!=='function'){occBaseMsg='OCCT : JS noyau absent — rechargez la page (Ctrl+F5).';occStatus();return;}
  occBaseMsg='OCCT : démarrage depuis le fichier local…';occStatus();
  try{
    occt=await factory({wasmBinary:buf,locateFile:p=>String(p).endsWith('.wasm')?'occt/opencascade.wasm.wasm':p});
    await occtFinishBoot();
  }catch(e){
    occtReady=false;
    occBaseMsg='OCCT : démarrage local impossible ('+String((e&&(e.message||e))||e).slice(0,120)+').';occStatus();
  }
}
const VIVID=[0x0a84ff,0x30d158,0xff9f0a,0xbf5af2,0xff453a,0x64d2ff,0xffd60a,0x5e5ce6];
const pickColor=i=>VIVID[i%VIVID.length];
const cssHex=c=>'#'+(c>>>0).toString(16).padStart(6,'0');
function featColor(f,fb){return(f&&f.color>0)?f.color:fb;} // couleur perso sinon auto
function featOp(f){const o=f&&f.opacity;return(o>0&&o<1)?{transparent:true,opacity:o}:{transparent:false,opacity:1};}
function applyFeatOp(mat,f){ // opacité persistée (coupes/fantômes : sémantique forcée, ignorée)
  if(!mat||!f)return mat;
  if((f.op||'add')==='cut')return mat;
  const o=featOp(f);
  if(o.transparent){mat.transparent=true;mat.opacity=o.opacity;mat.needsUpdate=true;}
  return mat;
}
let vivid=true;
try{const _vv=localStorage.getItem('minifusion_vivid');if(_vv==='off')vivid=false;}catch(e){}
function autoCol(ci){return vivid?pickColor(ci):0x9a9aa0;}
function partTint(){return(doc&&doc.tint>0)?doc.tint:0;} // teinte pièce (prioritaire partout)
const COLOR_SWATCHES=['#0a84ff','#30d158','#ff9f0a','#bf5af2','#ff453a','#64d2ff','#ffd60a','#5e5ce6','#9a9aa0'];
function presetRow(f){
  // Nuancier rapide : pastilles prédéfinies (remplace Coloris, 100 % fiable).
  const row=document.createElement('div');row.className='row';row.style.gap='4px';row.style.marginTop='2px';
  COLOR_SWATCHES.forEach(h=>{
    const s=document.createElement('span');
    s.title=h;s.style.cssText='width:18px;height:18px;border-radius:50%;cursor:pointer;border:1px solid rgba(255,255,255,.5);background:'+h;
    s.onclick=()=>{f.color=parseInt(h.slice(1),16);markDirty();rebuild();renderProps();};
    row.appendChild(s);
  });
  return row;
}
/* Plans d'origine bien distincts : une couleur par plan + pastille arbre assortie */
const PLANES={
  XY:{color:0x0a84ff,css:'#0a84ff',role:'dessus',label:'XY · bleu · plan horizontal (vue de dessus)'},
  XZ:{color:0x30d158,css:'#30d158',role:'face',label:'XZ · vert · plan vertical face à vous (Y vers l’arrière)'},
  YZ:{color:0xff9f0a,css:'#ff9f0a',role:'côté',label:'YZ · orange · plan vertical de côté'}
};
let originVis={XY:true,XZ:true,YZ:true};
let originMeshes={};
function setOriginVis(p,v){originVis[p]=v!==false;try{autosave();}catch(e){}renderTree();} // + sauvegarde : survit au Ctrl+F5

