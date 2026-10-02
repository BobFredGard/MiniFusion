// Menus clic-droit : jamais rognés par le bord de l'écran.
// #ctxMenu / #ctxMenu3D sont position:fixed dans un body overflow:hidden : un
// menu ouvert en bas d'écran dépassait le viewport et sa DERNIÈRE entrée — le
// bouton « ⬇ Exporter ce corps en STEP », repoussé plus bas par le bloc
// couleur/transparence ajouté en -003 — devenait invisible.
// 1) clamp testable en pur (ctxClampPos) ; 2) application (ctxPlace) via
//    showCtx/showCtx3D ; 3) le bouton STEP reste le dernier enfant et visible ;
// 4) garde-fous CSS injecté depuis JS (la coque ne s'édite jamais à la main).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- 1) clamp en pur
    "const c=ctxClampPos(100,2000,300,360,1280,800);",
    "att(c.top===436,'bas : top clampé à 436 (reçu '+c.top+')');",
    "att(c.left===100,'dedans en x : inchangé ('+c.left+')');",
    "const c2=ctxClampPos(5000,10,300,360,1280,800);",
    "att(c2.left===976,'droite : left clampé à 976 (reçu '+c2.left+')');",
    "att(c2.top===10,'haut : inchangé ('+c2.top+')');",
    "const c3=ctxClampPos(-50,-50,300,360,1280,800);",
    "att(c3.left===4&&c3.top===4,'hors écran : plancher à 4 ('+c3.left+','+c3.top+')');",
    "const c4=ctxClampPos(100,200,300,360,1280,800);",
    "att(c4.left===100&&c4.top===200,'entièrement dedans : inchangé');",
    // --- 2) intégration : menu arbre ouvert en bas d'écran
    "innerWidth=1280;innerHeight=800;",
    "const cm=document.getElementById('ctxMenu');",
    "cm.offsetWidth=300;cm.offsetHeight=380;",
    "showCtx(100,790,{kind:'body',id:'b1'});",
    "att(cm.style.display==='block','menu arbre ouvert');",
    "att(cm.style.top==='416px','arbre : top recalé à 416px (reçu '+cm.style.top+')');",
    "att(cm.style.left==='100px','arbre : left inchangé ('+cm.style.left+')');",
    // menu ouvert dans les clous : pas de repositionnement parasite
    "showCtx(100,300,{kind:'body',id:'b1'});",
    "att(cm.style.top==='300px','arbre : menu déjà dedans, top inchangé ('+cm.style.top+')');",
    // --- 3) intégration : menu vue 3D
    "const c3d=document.getElementById('ctxMenu3D');",
    "c3d.offsetWidth=300;c3d.offsetHeight=300;",
    "showCtx3D(100,790,'b1');",
    "att(c3d.style.top==='496px','3D : top recalé à 496px (reçu '+c3d.style.top+')');",
    "att(c3d.style.left==='100px','3D : left inchangé ('+c3d.style.left+')');",
    // --- 4) le bouton STEP reste le DERNIER enfant (donc le plus exposé) : le
    //     clamp est sa seule protection, il doit donc exister et être visible
    "const kids=cm.children;",
    "const b=kids[kids.length-1];",
    "att(!!b&&b.dataset&&b.dataset.act==='step','arbre : export STEP = dernier enfant du menu');",
    "att(b.style.display==='','corps : bouton STEP visible (display='+JSON.stringify(b.style.display)+')');",
    "const k3=c3d.children;",
    "const b3=k3[k3.length-1];",
    "att(!!b3&&b3.dataset&&b3.dataset.act==='step','3D : export STEP = dernier enfant du menu');",
    // --- 5) garde-fous CSS injecté depuis JS (scroll si le menu dépasse en hauteur)
    "const st=(document.head.children||[]).filter(function(n){return n.tagName==='STYLE'&&n.textContent&&n.textContent.indexOf('max-height:calc(100vh - 8px)')>=0;});",
    "att(st.length===1,'CSS anti-rognage injecté depuis JS ('+st.length+')');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'ctxmenuviewport.js'});
  console.log('=== menus clic-droit : viewport ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
