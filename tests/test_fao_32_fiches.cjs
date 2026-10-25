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
  // changer l'axe X (ou tourner) le repère : la zone choisie reste au même endroit de la pièce
  {const pk=faoOpDefaults('pocket');pk.frame={z:'+X',x:'+Y',flipZ:false,flipX:false};pk.ztop=55;pk.zbot=44;s.ops=[pk];
   pk.limit={mode:'chain',loop:[[-18,-17],[18,-17],[18,-3],[-18,-3],[-18,-17]],closed:true,side:'in',extra:0,anchors:[{m:[0,-10,50],len:5}]};
   const W=()=>{const fr=faoOpFrame(s,pk);return pk.limit.loop.map(q=>faoPtOpToPos(fr,[q[0],q[1],44]));};
   const w0=W(),a0=faoPtOpToPos(faoOpFrame(s,pk),pk.limit.anchors[0].m);
   faoOpFrameEdit(s,pk,()=>{pk.frame=Object.assign({},pk.frame,{x:'-Z'});});
   const w1=W(),a1=faoPtOpToPos(faoOpFrame(s,pk),pk.limit.anchors[0].m);
   const d=Math.max(...w0.map((p,i)=>Math.hypot(p[0]-w1[i][0],p[1]-w1[i][1],p[2]-w1[i][2])),Math.hypot(a0[0]-a1[0],a0[1]-a1[1],a0[2]-a1[2]));
   A(d<1e-6&&!pk.limit.stale,'18 : axe X passé de +Y à −Z : boucle et ancres suivent, même place sur la pièce (écart '+d.toExponential(1)+') — avant : poche tournée hors de l’oblong');
   faoOpFrameEdit(s,pk,()=>{pk.frame=Object.assign({},pk.frame,{z:'-Y',x:'+X'});});
   A(pk.limit.stale===true,'19 : Z de l’opération changé : la zone n’est plus dans le plan de travail → ⚠ à revoir');}
  // simulation : un trou horizontal (outil le long de −X) se voit
  {const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:20,y1:10,z1:10},0.5);
   const area=(r,f)=>{let a=0;for(let t=0;t<r.n;t+=3){const o=t*3;if(!f(r.nrm[o],r.nrm[o+1],r.nrm[o+2],[r.pos[o],r.pos[o+3],r.pos[o+6]],[r.pos[o+1],r.pos[o+4],r.pos[o+7]],[r.pos[o+2],r.pos[o+5],r.pos[o+8]]))continue;
     const ux=r.pos[o+3]-r.pos[o],uy=r.pos[o+4]-r.pos[o+1],uz=r.pos[o+5]-r.pos[o+2],vx=r.pos[o+6]-r.pos[o],vy=r.pos[o+7]-r.pos[o+1],vz=r.pos[o+8]-r.pos[o+2];
     a+=Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)/2;}return a;};
   const wallX1=r=>area(r,(nx,ny,nz,X)=>nx>0.5&&X.every(x=>Math.abs(x-20)<1e-6));
   const r0=faoVoxBuild(g);
   const top0=area(r0,(nx,ny,nz,X,Y,Z)=>nz>0.5&&Z.every(z=>Math.abs(z-10)<1e-6));
   A(Math.abs(wallX1(r0)-100)<1e-6&&Math.abs(top0-200)<1e-6,'20 : brut plein en volume : face X1 = 10 × 10, dessus = 20 × 10 ('+wallX1(r0).toFixed(2)+', '+top0.toFixed(2)+')');
   faoMatterCarveTilt(g,{x:25,y:5,z:5},{x:12,y:5,z:5},2,[1,0,0],null);
   const r1=faoVoxBuild(g);
   const top1=area(r1,(nx,ny,nz,X,Y,Z)=>nz>0.5&&Z.every(z=>Math.abs(z-10)<1e-6));
   const floor=area(r1,(nx,ny,nz,X,Y,Z)=>nz>0.5&&Z.every(z=>z<9)&&X.every(x=>x>11.5));
   const ceil=area(r1,(nx,ny,nz,X,Y,Z)=>nz<-0.5&&Z.every(z=>z>1)&&X.every(x=>x>11.5));
   A(Math.abs(top1-200)<1e-6,'21 : trou horizontal : le dessus du brut reste intact (pas de cheminée)');
   A(wallX1(r1)<100-8&&floor>4&&ceil>4,'22 : trou horizontal VISIBLE : face X1 percée ('+(100-wallX1(r1)).toFixed(1)+' mm² ouverts), fond '+floor.toFixed(1)+' et plafond '+ceil.toFixed(1)+' mm² dans la matière');
   {const g2=faoMatterGrid({x0:0,y0:0,z0:0,x1:20,y1:10,z1:10},0.5);
    const ks=faoMatterCarveTilt(g2,{x:25,y:5,z:5},{x:12,y:5,z:5},2,[1,0,0],null);
    const v2={matterGrid:g2,cav:new Uint8Array(g2.nx*g2.ny)};const nw=faoVoxMarkCav(v2,ks);
    const ov=faoVoxBuild(g2,v2.cav);
    let zmapWall=0;for(let j=0;j<g2.ny;j++){const c=j*g2.nx+g2.nx-1;if(!v2.cav[c])zmapWall+=g2.h[c]*g2.pas;}
    const tot=zmapWall+wallX1(ov);
    A(nw.length>0&&nw.length<g2.nx*g2.ny/5&&Math.abs(tot-wallX1(r1))<1e-6&&ov.n<r1.n/3,
      '24 : rendu réel = Z-map + complément ('+nw.length+' colonnes creusées, '+(ov.n/3)+' triangles contre '+(r1.n/3)+' en surface complète) : même face X1 percée ('+tot.toFixed(1)+' mm²)');}
   const vw={pts:[{x:0,y:0,z:0},{x:1,y:0,z:0,ax:[1,0,0]}]};
   A(faoViewerVoxWanted(vw)&&!faoViewerVoxWanted({pts:[{x:0,y:0,z:0}]}),'23 : cavités dessinées seulement si le parcours a un outil incliné (posage sans 3+2 : Z-map inchangée)');}
  // aperçu : le clippeur de zone d'une opération 3+2 garde la coupe (zone dans le repère de l'opération)
  {const pk=faoOpDefaults('pocket');pk.frame={z:'+X',x:'+Y',flipZ:false,flipX:false};pk.ztop=55;pk.zbot=44;s.ops=[pk];
   pk.limit={mode:'chain',loop:[[-18,-17],[18,-17],[18,-3],[-18,-3],[-18,-17]],closed:true,side:'in',extra:0};
   const clip=faoSegClipper(pk,s);const got=[];
   // segment de coupe au MILIEU de l'oblong (la zone d'une poche est resserrée du rayon d'outil), en
   // coordonnées du posage : x = 50 (face X1), y de −5 à 5, z = 15 (op : u=y, v=z−25 → v=−10)
   if(clip)clip(50,-5,15,50,5,15,function(x1,y1,z1,x2,y2,z2){got.push([x1,y1,z1,x2,y2,z2]);});
   A(!!clip&&got.length===1&&Math.abs(got[0][0]-50)<1e-9&&Math.abs(got[0][1]+5)<1e-9&&Math.abs(got[0][4]-5)<1e-9&&Math.abs(got[0][2]-15)<1e-9,'25 : aperçu 3+2 — un segment de coupe dans la zone est gardé, rendu dans le repère du posage (avant : toute la coupe rejetée, seuls les rapides restaient)');
   const out=[];if(clip)clip(50,-10,30,50,10,30,function(){out.push(1);});
   A(out.length===0,'26 : … et un segment hors de la zone (Z30, au-dessus de l’oblong) est rejeté');}
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
