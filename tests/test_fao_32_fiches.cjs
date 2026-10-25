// V0.7.6 : opérations au repère propre (3+2) — valeurs automatiques des fiches et dessins de saisie.
// Retour : « Il faut faire une passe sur tous les posages 3+2 des opérations car rien ne fonctionne
// vraiment correctement » (poche, ébauche 3D…). Le calcul des parcours était juste (même parcours
// qu'un posage orienté, vérifié au navigateur pour surfaçage, poche, contour, ébauche 3D, finitions) ;
// l'interface autour lisait le brut et la pièce du POSAGE : hauteurs de chaîne, rectangles, fond de
// poche, rapides hors brut, portée d'outil, et dessin des arêtes de la saisie de chaîne.
const path=require('path');
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const R=String.raw`
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  const s=faoDefaultSetup();s.stock={x0:-55,y0:-37.5,z0:-10,x1:55,y1:37.5,z1:25};s.stockSrc='manual';s.origin={pt:[0.5,0.5,1]};
  faoRoot().setups=[s];faoRoot().activeSetupId=s.id;
  const op=faoOpDefaults('pocket');s.ops=[op];
  A(faoOpView(s,op)===s,'1 : opération sans repère propre : le posage lui-même');
  op.frame={z:'+X',x:'+Y',flipZ:false,flipX:false};
  const ov=faoOpView(s,op);
  A(ov!==s&&ov.stock.z1===55&&ov.stock.z0===-55&&ov.stock.x0===-37.5&&ov.stock.x1===37.5,
    '2 : repère Z = +X : brut vu par l’opération — dessus = face X1 (55), largeur = Y du posage ('+JSON.stringify(ov.stock)+')');
  // fond de poche : seules les faces VUES DU DESSUS comptent
  const T=(a,b,c)=>[a,b,c];
  const V=[[6,6,0],[10,6,0],[6,10,0],          // fond visible en Z0
           [1,1,-5],[4,1,-5],[1,4,-5],         // facette « vers le haut » cachée sous la matière (Z−5)
           [0,0,5],[5,0,5],[0,5,5]];           // matière au-dessus (Z5)
  const mesh={v:V,t:[T(0,1,2),T(3,4,5),T(6,8,7)]};
  const loop=[[0,0],[12,0],[12,12],[0,12],[0,0]];
  A(faoPocketFloor(mesh,loop,-20)===0,'3 : fond de poche = face visible (Z0), pas la facette cachée sous la matière (Z−5) — '+faoPocketFloor(mesh,loop,-20));
  A(faoPocketFloor({v:V,t:[T(3,4,5)]},loop,-20)===-5,'4 : sans matière au-dessus, la même facette est bien un fond (−5)');
  // rapides hors brut : le brut du job (celui de l'opération en 3+2), plus celui du posage actif
  A(/function faoZoneStrip\(moves,ctx,secu,job\)/.test(String(faoZoneStrip))&&/job\.stock/.test(String(faoZoneStrip))
    &&/faoZoneStrip\(ch\.mv,ctx,secu,job\)/.test(String(faoZoneServe))&&/faoZoneStrip\(cut,ctx,secu,job\)/.test(String(faoZoneCuts)),
    '5 : rapides hors brut filtrés sur le brut DU JOB (repère de l’opération)');
  // valeurs automatiques des fiches
  A(/faoOpView\(setup,op\)/.test(String(faoChainOk))&&/faoActiveMesh\(ov\)/.test(String(faoChainOk)),
    '6 : validation de chaîne : haut = dessus du brut vu par l’opération, fond cherché dans son maillage');
  A((String(faoOpCardElement).match(/faoOpView\(setup,op\)\.stock/g)||[]).length>=3,
    '7 : rectangles de zone / d’îlot et écart de surfaçage pris sur le brut de l’opération');
  A(/faoOpFrame\(setup,op\)/.test(String(faoOpReachWarn))&&/faoToF\(fr/.test(String(faoOpReachWarn)),
    '8 : portée d’outil : profondeur mesurée le long du Z de l’opération');
  // saisie de chaîne : arêtes (repère de l'opération) dessinées et pointées via la matrice opération → posage
  A(/faoOpMatrix\(/.test(String(faoChainBuildOverlay))&&/RW=grp\.matrixWorld/.test(String(faoChainPick)),
    '9 : saisie de chaîne : arêtes dessinées et pointées dans le repère de l’opération');
  {const fr=faoOpFrame(s,op),p=[3,-7,11],w=faoPtOpToPos(fr,p);
   const o=faoToF(fr.P,fr.O),x=faoRotF(fr.P,fr.X),y=faoRotF(fr.P,fr.Y),z=faoRotF(fr.P,fr.Z);
   const q=[0,1,2].map(i=>o[i]+p[0]*x[i]+p[1]*y[i]+p[2]*z[i]);
   A(Math.hypot(q[0]-w[0],q[1]-w[1],q[2]-w[2])<1e-9,'10 : matrice de dessin = passage opération → posage des parcours ('+q.map(v=>+v.toFixed(3))+')');}
  // parcours mémorisé : même clé depuis le posage (F5, contrôles) que pendant le calcul
  {const f=faoOpDefaults('facing');f.frame={z:'+X',x:'+Y',flipZ:false,flipX:false};f.z=55;s.ops=[f];
   const mv=faoOpMoves(f,s)||[];const ch=faoOpMovesHit(f),k=faoOpMovesKey(f,s);
   A(mv.length>0&&ch&&ch.key===k,'11 : parcours 3+2 retrouvé en mémoire avec la clé du posage (avant : perdu à chaque F5, « à régénérer »)');
   const rd=faoOpMovesTry(f,s)||[];
   A(rd.length===mv.length&&rd.every((m,i)=>Math.abs(m.x-mv[i].x)<1e-9&&Math.abs(m.y-mv[i].y)<1e-9&&Math.abs(m.z-mv[i].z)<1e-9),
     '12 : relecture du parcours mémorisé : ramené dans le repère du posage (avant : servi brut, décalé)');
   A(mv.every(m=>!isFinite(+m.x)||m.r||Math.abs(m.x-55)<1e-6),'13 : surfaçage 3+2 sur la face X1 : toute la coupe à X55 du posage');
   s.planes={clear:{ref:'brutHaut',dz:9},retr:{ref:'brutHaut',dz:40}};
   A(faoOpMovesKey(f,s)!==k,'14 : un réglage hérité du posage (plans) périme bien le parcours 3+2');
   const k1=faoOpMovesKey(f,s),jo=faoOpJob(s,f,faoOpFrame(s,f));jo.planes=JSON.parse(JSON.stringify(s.planes)); // copie (ancien nettoyage)
   A(faoOpMovesKey(f,s)===k1,'15 : clé 3+2 stable : une copie des plans sur le posage vu par l’opération ne change pas l’ordre de la clé (avant : perdu au F5)');}
  // F5 : relecture relancée quand le solide exact arrive, pour TOUTE opération calculée sur le maillage
  {const s2=faoDefaultSetup();s2.stock={x0:0,y0:0,z0:0,x1:10,y1:10,z1:10};const pk=faoOpDefaults('pocket');s2.ops=[pk];faoRoot().setups=[s2];
   const src=String(faoMovesSolidFp);
   A(/faoMeshOp\(ops\[i\]\)/.test(src)&&faoMeshOp(pk),'16 : F5 — une poche adaptative (comme l’ébauche 3D) relance la relecture du cache à l’arrivée du solide exact');
   A(/faoRenderTree\(\)/.test(String(faoMovesDone)),'17 : F5 — les ⚠ « à régénérer » de l’arbre sont redessinés après chaque relecture');
   faoRoot().setups=[s];}
  return out;
`;
(async()=>{
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Opérations 3+2 : fiches et saisie dans le repère de l’opération ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
