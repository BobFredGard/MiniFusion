// Refonte FAO demandée : 1) les 7 +usinage quittent le panneau des corps pour une
// barre posée sur la vue 3D (même pilule que #viewbar) à DROITE, AU-DESSUS du
// panneau FAO — les deux reposent dans la même colonne #faoWrap ; 2) les boutons
// Iso/Dessus/Face/Droite passent à GAUCHE, au-dessus du panneau des corps.
// Suite : 3) le bouton « FAO » de la barre d outils disparaît, le panneau est toujours
// présent et se rabat sur sa droite (procédé de l arbre des corps) ; 4) ses
// actions sont regroupées sous un libellé (POSAGE / EXÉCUTION / EXPORT) ;
// 5) repli du panneau masquant aussi la barre 3D ; 6) chaque posage a une flèche
// ▼/▶ qui replie ses opérations, l'état (s.open) vivant dans le document.
const fs=require('fs');
const {loadApp,APP}=require('./appvm.cjs');
const vm=require('vm');
const SRC=fs.readFileSync(APP,'utf8');
const NOBT=/btnFao/.test(SRC);
// positions lues dans la coque (CSS hors <script> + CSS FAO injecté) : le livrable
// est la source de vérité, il est reconstruit par build.js avant la suite.
const hasCss=s=>SRC.indexOf(s)>=0;
const CSS={
  faoCol : hasCss('#faoWrap{position:absolute;top:10px;right:10px;'),
  pill   : hasCss('.fao-addbar{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;')&&hasCss('width:100%;padding:4px 6px;border-radius:10px;'),
  view   : hasCss('#viewbar{position:absolute;top:10px;left:4px;'),
  set    : hasCss('#setMenu{position:absolute;top:46px;left:4px;'),
  tree   : hasCss('#treeOverlay{width:252px;max-height:calc(100% - 56px);overflow-y:auto;margin:46px 0 10px 4px;'),
  // les DEUX pilules : meme ligne (top:10px) et meme geometrie -> meme hauteur.
  // hauteur = enfant le plus haut (24px) + padding 4px + bordure 2px = 34px :
  // cote viewbar c'est le gear (.9rem/1px = 24px), cote fao le bouton (.76rem/4px = 24px).
  sameH  : hasCss('#viewbar{position:absolute;top:10px;left:4px;z-index:22;display:flex;gap:5px;align-items:center;padding:4px 6px;')
        && hasCss('.fao-addbar{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;')
        && hasCss('width:100%;padding:4px 6px;border-radius:10px;')
        && hasCss('#viewbar button{padding:3px 9px;font-size:.76rem}')
        && hasCss('.fao-addbar button{padding:4px 6px;font-size:.76rem;white-space:nowrap}')
        && hasCss('#viewbar #btnSettings{font-size:.9rem;padding:1px 9px}')
};
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- 1) barre des 7 +usinage : colonne de droite, AU-DESSUS du panneau FAO
    "att(!!faoAddBarEl,'barre faoAddBar creee');",
    "att(!!faoWrapEl,'colonne #faoWrap creee');",
    "const VP=document.getElementById('vpwrap');",
    "att(!!faoWrapEl&&VP.children.indexOf(faoWrapEl)>=0,'colonne #faoWrap enfant de #vpwrap (grand pane)');",
    "att(!!faoWrapEl&&faoWrapEl.children.indexOf(faoAddBarEl)>=0,'barre dans #faoWrap');",
    "att(!!faoWrapEl&&faoWrapEl.children.indexOf(faoTreeWrapEl)>=0,'panneau FAO dans #faoWrap');",
    "att(!!faoWrapEl&&faoWrapEl.children.indexOf(faoAddBarEl)<faoWrapEl.children.indexOf(faoTreeWrapEl),'barre AU-DESSUS du panneau FAO');",
    "const TW=document.getElementById('treeWrap');",
    "att(TW.children.indexOf(faoAddBarEl)<0,'barre PAS dans #treeWrap (elle a quitte le panneau des corps)');",
    "att(faoAddBarEl.className==='fao-addbar','pilule .fao-addbar (meme grand panneau que #viewbar)');",
    "const kids=faoAddBarEl.children;",
    "att(kids.length===8,'titre + 7 boutons ('+kids.length+')');",
    "att(kids[0].className==='fao-addlab'&&kids[0].textContent==='+ Usinage','titre de groupe « + Usinage »');",
    "const labs=kids.slice(1).map(function(k){return k.textContent;});",
    "const want=['Surfaçage','Poche','Contour','Perçage','Ébauche 3D','Finition','Débourrage'];",
    "att(labs.length===7&&labs.join('|')===want.join('|'),'libelles sans + : '+labs.join(','));",
    "att(labs.every(function(l){return l.charAt(0)!=='+';}),'aucun + devant les libelles');",
    "let inWrap=false;(function w(n){if(n===faoAddBarEl)inWrap=true;if(n&&n.children)n.children.forEach(w);})(faoTreeWrapEl);",
    "att(!inWrap,'la barre n est PAS dans le panneau FAO');",
    // --- 1b) positions CSS (lues dans le livrable par le test hôte)
    "att("+CSS.faoCol+",'CSS : #faoWrap collee en haut a DROITE du grand pane');",
    "att("+CSS.pill+",'CSS : la barre porte bien la pilule (wrap + padding 4px 6px / radius 10px)');",
    "att("+CSS.view+",'CSS : #viewbar recalee a GAUCHE, au-dessus du panneau des corps');",
    "att("+CSS.set+",'CSS : menu reglages sous la viewbar, a gauche');",
    "att("+CSS.tree+",'CSS : panneau des corps pousse sous la viewbar (marge haute 46px)');",
    "att("+CSS.sameH+",'CSS : les deux pilules sont sur la meme ligne (top:10px) et a la MEME HAUTEUR (34px : padding 4px 6px, bouton 24px)');",
    // --- 3) bouton FAO supprimé de la barre d outils
    "att("+(!NOBT)+",'plus de bouton btnFao dans la coque');",
    // --- 4) panneau : groupes libellés + actions toujours là
    "const texts=[];(function w(n){if(n&&n.textContent)texts.push(n.textContent);if(n&&n.children)n.children.forEach(w);})(faoTreeWrapEl);",
    "['Posage','Exécution','Export','+ Posage','Outils','▶ Usinage','Générer + aperçu','Exporter G-code'].forEach(function(t){",
    "  att(texts.indexOf(t)>=0,'panneau : « '+t+' » present');});",
    "const grpN=texts.filter(function(t){return t==='Posage'||t==='Exécution'||t==='Export';}).length;",
    "att(grpN===3,'3 groupes libelles ('+grpN+')');",
    "let oldGrid=false;(function w(n){if(n&&n.className&&String(n.className).indexOf('fao-addgrid')>=0)oldGrid=true;if(n&&n.children)n.children.forEach(w);})(faoTreeWrapEl);",
    "att(!oldGrid,'plus de grille .fao-addgrid dans le panneau');",
    // --- 5) repli du panneau (procédé identique à l'arbre des corps)
    "const W=faoTreeWrapEl,tog=W.children[0],cnt=W.children[1];",
    "att(tog.id==='faoToggle','onglet #faoToggle en tete du panneau');",
    "att(cnt.className==='fao-cnt','contenu .fao-cnt');",
    "tog.onclick();",
    "att(cnt.style.display==='none','repli : contenu masque');",
    "att(faoAddBarEl.style.display==='none','repli : barre 3D masquee automatiquement');",
    "att(tog.textContent==='❮','repli : fleche « ❯ → ❮ » ('+tog.textContent+')');",
    "tog.onclick();",
    "att(cnt.style.display==='','der repli : contenu visible');",
    "att(faoAddBarEl.style.display==='','der repli : barre 3D visible');",
    "att(tog.textContent==='❯','der repli : fleche ❯');",
    // --- 6) flèche de repli par posage (état dans le document)
    "const sA=faoDefaultSetup();sA.name='P1';sA.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};",
    "doc.fao={setups:[sA],activeSetupId:sA.id};",
    "sA.ops=[faoOpDefaults('facing'),faoOpDefaults('facing')];sA.ops[0].z=20;sA.ops[1].z=16;",
    "const T=document.getElementById('faoTree');",
    "T.children.length=0;faoRenderTree();",
    "att(T.children.length===3,'ouvert : posage + 2 operations ('+T.children.length+')');",
    "const sRow=T.children[0];",
    "att(sRow.children[0].className==='fao-tri','fleche en tete de ligne posage');",
    "att(sRow.children[0].textContent==='▼','ouvert : ▼');",
    "sRow.children[0].onclick({stopPropagation:function(){}});",
    "att(doc.fao.setups[0].open===false,'repli : s.open=false enregistre dans le document');",
    "T.children.length=0;faoRenderTree();",
    "att(T.children.length===1,'repli : seule la ligne du posage ('+T.children.length+')');",
    "att(T.children[0].children[0].textContent==='▶','repli : ▶');",
    "T.children[0].children[0].onclick({stopPropagation:function(){}});",
    "att(doc.fao.setups[0].open===true,'re-deplie : s.open=true dans le document');",
    "T.children.length=0;faoRenderTree();",
    "att(T.children.length===3,'re-deplie : posage + 2 operations');",
    // le clic sur la flèche ne sélectionne pas le posage
    "sel={kind:null,id:null};",
    "T.children.length=0;faoRenderTree();",
    "T.children[0].children[0].onclick({stopPropagation:function(){}});",
    "att(!sel||!sel.kind,'clic fleche : pas de selection de posage');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_barre3d.js'});
  console.log('=== FAO : barre 3D, panneau groupe + repli, fleches posage ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
