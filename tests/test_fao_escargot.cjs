// FAO 3D — 2026-10-07-005 : mode Escargot (spirale centre -> faces).
// Pelage en spirale depuis le centre de la ZONE : chaque tour s'eloigne de
// ae, TOUTE entree en matiere est une helice (jamais de plongee directe, 1re
// face comprise), les faces sont atteintes en dernier et finies au mieux
// (laisse outil). Mini-passes / plafond / fond / finition inchanges : les
// plans supplementaires passent toujours par faoRoughAdaptiveLevel conv.
// Defaut a la CREATION d'une Ebauche 3D (faoOpDefaults), mode choisi en
// 1re option du selecteur, repli strictement conventionnel si le champ est
// absent (documents anciens).
//
// Retours utilisateur (2026-10-07-005, v2) :
//  1. Centre = POLE d'inaccessibilite des cases usinables (grille +
//     chanfrein, moyenne des cases liees) — pas le centre de la bbox des
//     intervalles (tombait hors zone sur une piece a poche decalee :
//     20,85 mm du centre de zone, 1re coupe piquee contre un bord).
//     Membership = meme chose que les liaisons : PARITE (faoShapeInside,
//     colonne interdite a tout plan >= z) ET disque (faoDistSeg >= r) —
//     faoDiscClear seul laissait passer un point au coeur d'une bande
//     matiere LARGE (>= r des deux bords).
//  2. Derniere passe de chaque niveau = contour des FACES : chaînes du
//     niveau offsetees a r (laisse outil exacte) + cadre E0 de la boite,
//     chaîne la plus proche d'abord, liaison sure ou entree.
//  3. Conventionnel : tour des morceaux par k DECROISSANT (milieu -> bords,
//     chaînes offsetees sortantes rabattues en k=0), mini-passes
//     (ringOnly) en greedy historique inchangee — voir aussi section 1.
//
// Fixture : bloc 80x60x18 avec poche ouverte x[10,70] y[10,50] fond z=4 —
// topologie manifold prouvee du test_fao_fond_finition (memes roles de
// sommets). Bas = fond (zbot=4) : aucune grille sous le plancher.
// Grille [14,10,6,4.5] (ap=4). Sens long : meme maillage transpose 60x80.
// Poche decalee (4bis) : meme topologie, poche x[45,75] y[15,45].
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- fixture manifold : bloc + poche ouverte vers le haut
    "const FV=[[0,0,0],[80,0,0],[80,60,0],[0,60,0],",
    " [0,0,18],[80,0,18],[80,60,18],[0,60,18],",
    " [10,10,4],[70,10,4],[70,50,4],[10,50,4],",
    " [10,10,18],[70,10,18],[70,50,18],[10,50,18],",
    " [0,10,18],[80,10,18],[80,50,18],[0,50,18]];",
    "const FT=[[0,2,1],[0,3,2],",
    " [0,1,5],[0,5,4],[2,3,7],[2,7,6],",
    " [0,4,16],[0,16,19],[0,19,7],[0,7,3],",
    " [1,2,6],[1,6,18],[1,18,17],[1,17,5],",
    " [4,5,17],[4,17,13],[4,13,12],[4,12,16],",
    " [6,7,19],[6,19,15],[6,15,14],[6,14,18],",
    " [16,12,15],[16,15,19],[13,17,18],[13,18,14],",
    " [8,9,10],[8,10,11],",
    " [8,13,9],[8,12,13],[10,15,11],[10,14,15],",
    " [8,11,15],[8,15,12],[9,13,14],[9,14,10]];",
    "const FR={v:FV,t:FT};",
    "const BX={x0:-5,y0:-5,x1:85,y1:65};",
    "(function(){ // fermeture manifold : chaque arete 2 fois, sens opposes",
    "  const ed={};let bad=0;",
    "  for(let i=0;i<FT.length;i++)for(let k=0;k<3;k++){",
    "    const a=FT[i][k],b=FT[i][(k+1)%3];",
    "    const key=Math.min(a,b)+','+Math.max(a,b);",
    "    if(!ed[key])ed[key]=[];",
    "    ed[key].push(a<b?1:-1);",
    "  }",
    "  for(const k in ed){const e=ed[k];if(e.length!==2||e[0]===e[1])bad++;}",
    "  att(bad===0,'fixture poche manifold : '+(bad?bad+' arete(s) mal fermee(s)':'ok'));",
    "})();",
    // --- faces de la poche = murs x[10,70] y[10,50] (distance signee + = dedans)
    "const MP=[[10,10],[70,10],[70,50],[10,50]];",
    "const sd=function(x,y,pp){return faoDistToPoly(x,y,pp)*(faoPointInPoly(x,y,pp)?1:-1);};",
    "const BASE={ap:4,ae:5,toolD:10,radial:0.5,axial:0.5,secu:23,minipasses:0};",
    "const gen=function(o){const z={};for(const k in BASE)z[k]=BASE[k];if(o)for(const k in o)z[k]=o[k];",
    "  return faoGenRough3D(FR,BX,18,4,z);};",
    "const cuts=function(mv){return mv.filter(function(m){return !m.r;});};",
    "const atZ=function(ms,z){return ms.filter(function(m){return Math.abs(m.z-z)<1e-6;});};",
    "const inP=function(ms,pp){return ms.filter(function(m){return faoPointInPoly(m.x,m.y,pp);});};",
    "const minSd=function(ms,pp){let w=1/0;inP(ms,pp).forEach(function(m){const d=sd(m.x,m.y,pp);if(d<w)w=d;});return w;};",
    "const maxSd=function(ms,pp){let w=-1/0;inP(ms,pp).forEach(function(m){const d=sd(m.x,m.y,pp);if(d>w)w=d;});return w;};",
    "const nearWall=function(ms,pp,l){return inP(ms,pp).filter(function(m){return sd(m.x,m.y,pp)<=l;}).length;};",
    // ================= 1. conventionnel intact + du milieu vers les bords =====
    "const mvC=gen();",
    "const mvC2=gen({mode:'conv'});",
    "att(JSON.stringify(mvC)===JSON.stringify(mvC2),'conv : sans mode == mode conv (parcours stricte identique)');",
    "const cC=cuts(mvC);",
    "att(cC.length>100,'conv : '+cC.length+' coupes');",
    // RETOUR 3 : enlever le MILIEU avant les bords (hors mini-passes).
    "const z14C=[];for(let i=0;i<mvC.length;i++){const m=mvC[i];",
    "  if(m.r||Math.abs(m.z-14)>1e-6)continue;",
    "  if(i>0&&!mvC[i-1].r&&mvC[i-1].z>14+1e-9)continue; // helice du niveau suivant qui traverse z=14",
    "  z14C.push(m);}",
    "att(z14C.length>500,'conv : niveau z=14 ('+z14C.length+' coupes)');",
    "const dcC=function(m){return Math.hypot(m.x-40,m.y-30);};",
    "att(dcC(z14C[0])<=10,'conv : 1re coupe au MILIEU ('+z14C[0].x.toFixed(1)+','+z14C[0].y.toFixed(1)+') d='+dcC(z14C[0]).toFixed(1)+' <= 10');",
    "let iEndC=-1;",
    "for(let i=1;i<mvC.length;i++){const m=mvC[i];",
    "  if(!m.r&&Math.abs(m.z-14)<1e-6){const p=mvC[i-1];if(p.r||p.z<=14+1e-9)iEndC=i;}}",
    "const mEndC=mvC[iEndC];",
    "att(mEndC&&dcC(mEndC)>=45,'conv : fin de niveau z=14 aux BORDS ('+(mEndC?mEndC.x.toFixed(1)+','+mEndC.y.toFixed(1):'?')+') d='+dcC(mEndC).toFixed(1)+' >= 45');",
    "let iMid=-1,iBord=-1;",
    "for(let i=0;i<z14C.length;i++){const m=z14C[i],d=dcC(m);",
    "  if(d<=12)iMid=i;",
    "  const inPocket=m.x>10&&m.x<70&&m.y>10&&m.y<50;",
    "  if(iBord<0&&d>=45&&!inPocket)iBord=i;}",
    "att(iMid>=0&&iBord>=0&&iMid<iBord,'conv : milieu avant les bords (dernier centre idx '+iMid+' < 1er bord idx '+iBord+')');",
    // ================= 2. escargot : pelage centre -> faces =================
    "const mvE=gen({mode:'escargot'});",
    "const cE=cuts(mvE);",
    "att(JSON.stringify(mvE)!==JSON.stringify(mvC),'escargot : parcours DIFFERENT du conventionnel');",
    "att(cE.length>1000,'escargot : '+cE.length+' coupes');",
    "[14,10,6,4.5].forEach(function(z){",
    "  const zz=atZ(cE,z);",
    "  att(zz.length>100,'escargot : niveau z='+z+' usine ('+zz.length+' coupes)');",
    "  att(inP(zz,MP).length>50,'escargot : z='+z+' attaque la poche ('+inP(zz,MP).length+' coupes dedans)');",
    "});",
    // 1re coupe = centre de la piece (bbox centre = (40,30))
    "att(cE.length&&Math.hypot(cE[0].x-40,cE[0].y-30)<=2.5,'escargot : 1re coupe au centre ('+",
    "  cE[0].x.toFixed(2)+','+cE[0].y.toFixed(2)+') d='+Math.hypot(cE[0].x-40,cE[0].y-30).toFixed(2));",
    // 1re ENTREE en matiere = helice : suite descendante depuis le haut,
    // rayon <= D/2, qui finit sur le plan de la face (z=14)
    "let run=0,mxR=0,zEnd=null;",
    "for(let i=1;i<cE.length;i++){",
    "  if(cE[i].z<cE[i-1].z-1e-9){run++;zEnd=cE[i].z;",
    "    const d=Math.hypot(cE[i].x-40,cE[i].y-30);if(d>mxR)mxR=d;",
    "  }else break;",
    "}",
    "att(run>=10&&mxR<=BASE.toolD*0.5&&Math.abs(zEnd-14)<1e-6,'escargot : 1re entree HELICE ('+",
    "  run+' pts descendant, rayon max '+mxR.toFixed(2)+' <= 5, fin z='+zEnd+')');",
    // ordre des plans : du dessus vers le fond
    "const i14=cE.findIndex(function(m){return Math.abs(m.z-14)<1e-6;});",
    "const i10=cE.findIndex(function(m){return Math.abs(m.z-10)<1e-6;});",
    "att(i14>=0&&i10>i14,'escargot : plan z=14 avant z=10');",
    // EXPANSION dans le plan : centre -> faces (tiers 3 largement plus loin).
    // 011 : mesure sur les coupes DANS la piece — le tour E0 de la boite
    // (hors silhouette, entrelace greedy avec les faces) pesait dans les
    // moyennes : ce n'est que l'ordre d'attaque des chaines, pas l'expansion
    // de la spirale (poche couverte a 100 % dans les deux cas).
    "const z14=atZ(cE,14).filter(function(m){return m.x>=0&&m.x<=80&&m.y>=0&&m.y<=60;});",
    "const dOf=function(m){return Math.hypot(m.x-40,m.y-30);};",
    "const q=Math.max(1,Math.floor(z14.length/3));",
    "let a1=0,a3=0;",
    "for(let i=0;i<q;i++)a1+=dOf(z14[i]);",
    "for(let i=z14.length-q;i<z14.length;i++)a3+=dOf(z14[i]);",
    "const dExp=(a3-a1)/q;",
    "att(dExp>=10,'escargot : expansion centre -> faces (+'+dExp.toFixed(1)+' mm du 1er au 3er tiers)');",
    "let back=0;for(let i=1;i<z14.length;i++)if(dOf(z14[i])<dOf(z14[i-1])-6)back++;",
    "att(back<=z14.length*0.15,'escargot : quasi-monotone ('+back+'/'+z14.length+' retours > 6 mm)');",
    // LAISSE OUTIL EN POCHE : membership disque -> [5.3 ; 6.5], centre couvert
    "[14,10,6,4.5].forEach(function(z){",
    "  const zz=atZ(cE,z),w=minSd(zz,MP),W=maxSd(zz,MP);",
    "  att(w>=5.3&&w<=6.5,'escargot : z='+z+' lasse outil '+w.toFixed(2)+' en [5.3,6.5] (faces atteintes)');",
    "  att(W>=15,'escargot : z='+z+' couvre le centre (max sd '+W.toFixed(2)+')');",
    "});",
    "const nw14=nearWall(z14,MP,7);",
    "att(nw14>=15,'escargot : z=14 finit les faces au mieux ('+nw14+' coupes a <= 7 mm des murs)');",
    // RETOUR 2 : la TOUTE DERNIERE passe du niveau suit les FACES du solide
    // (contour offsete a r = laisse outil, tour E0 de la boite). On coupe la
    // queue de l'helice du niveau suivant qui traverse z=14.
    "const z14E=[];for(let i=0;i<mvE.length;i++){const m=mvE[i];",
    "  if(m.r||Math.abs(m.z-14)>1e-6)continue;",
    "  if(i>0&&!mvE[i-1].r&&mvE[i-1].z>14+1e-9)continue;",
    "  z14E.push(m);}",
    "const MPC=MP.concat([MP[0]]); // faoDistToPoly attend la boucle FERMEE",
    "const onR=function(x,y){",
    "  if(x>10&&x<70&&y>10&&y<50)return Math.abs(sd(x,y,MPC)-5.5)<=0.3;",
    "  const sg=[[0,0,80,0],[80,0,80,60],[80,60,0,60],[0,60,0,0]];",
    "  let w=1/0;for(let k=0;k<4;k++){const a=sg[k];",
    "    const dx=a[2]-a[0],dy=a[3]-a[1],L2=dx*dx+dy*dy;",
    "    let t=L2>0?((x-a[0])*dx+(y-a[1])*dy)/L2:0;if(t<0)t=0;if(t>1)t=1;",
    "    const qx=x-(a[0]+t*dx),qy=y-(a[1]+t*dy),d=Math.sqrt(qx*qx+qy*qy);if(d<w)w=d;}",
    "  return Math.abs(w-5.5)<=0.3||Math.abs(w-10.5)<=0.3;};",
    "const tailE=z14E.slice(-40),badT=tailE.filter(function(m){return !onR(m.x,m.y);});",
    "att(tailE.length>=40&&badT.length===0,'escargot : derniere passe suit les FACES (40 dernieres sur la laisse, '+badT.length+' hors'+",
    "  (badT.length?' '+badT.slice(0,3).map(function(m){return '('+m.x.toFixed(1)+','+m.y.toFixed(1)+')';}).join(' '):'')+')');",
    // ================= 3. mini-passes conservees =================
    "att(atZ(cE,16.667).length===0,'mini-passes off : aucun plan z=16.667 ('+atZ(cE,16.667).length+')');",
    "const mvM=gen({mode:'escargot',minipasses:2});",
    "const nMP2=atZ(cuts(mvM),16.667).length;",
    "att(nMP2>15,'mini-passes 2 : plan z=16.667 ('+nMP2+' coupes)');",
    // ================= 4. sens long (portrait 60x80) =================
    "const TV=[[0,0,0],[60,0,0],[60,80,0],[0,80,0],",
    " [0,0,18],[60,0,18],[60,80,18],[0,80,18],",
    " [10,10,4],[50,10,4],[50,70,4],[10,70,4],",
    " [10,10,18],[50,10,18],[50,70,18],[10,70,18],",
    " [0,10,18],[60,10,18],[60,70,18],[0,70,18]];",
    "const TP={v:TV,t:FT};",
    "const TB={x0:-5,y0:-5,x1:65,y1:85};",
    "att((TB.y1-TB.y0)>(TB.x1-TB.x0),'sens long : boite portrait');",
    "const PP=[[10,10],[50,10],[50,70],[10,70]];",
    "const cP=cuts(faoGenRough3D(TP,TB,18,4,{ap:4,ae:5,toolD:10,radial:0.5,axial:0.5,secu:23,minipasses:0,mode:'escargot'}));",
    "att(cP.length>1000,'sens long : '+cP.length+' coupes');",
    "att(cP.length&&Math.hypot(cP[0].x-30,cP[0].y-40)<=2.5,'sens long : 1re coupe au centre (30,40) d='+",
    "  (cP.length?Math.hypot(cP[0].x-30,cP[0].y-40):-1).toFixed(2));",
    "let runP=0,mxRP=0,zEndP=null;",
    "for(let i=1;i<cP.length;i++){",
    "  if(cP[i].z<cP[i-1].z-1e-9){runP++;zEndP=cP[i].z;",
    "    const d=Math.hypot(cP[i].x-30,cP[i].y-40);if(d>mxRP)mxRP=d;",
    "  }else break;",
    "}",
    "att(runP>=10&&mxRP<=5&&Math.abs(zEndP-14)<1e-6,'sens long : 1re entree HELICE ('+runP+' pts, rayon '+mxRP.toFixed(2)+')');",
    "const wP=minSd(atZ(cP,14),PP);",
    "att(wP>=5.3&&wP<=6.5,'sens long : z=14 lasse outil '+wP.toFixed(2)+' en [5.3,6.5]');",
    "att(nearWall(atZ(cP,14),PP,7)>=15,'sens long : z=14 faces atteintes ('+nearWall(atZ(cP,14),PP,7)+' coupes <= 7 mm)');",
    // ============ 4bis. poche DECALEE : centre = ploe de la ZONE =========
    // Retour 1 : meme topologie que la fixture, poche x[45,75] y[15,45] —
    // centre de boite (40,30) MAIS centre de zone (60,30). Le centre par bbox
    // des intervalles tombait au centre de la boite (hors zone, 20,85 mm du
    // centre de zone) : 1re coupe piquee contre un bord de face.
    "const PV=[[0,0,0],[80,0,0],[80,60,0],[0,60,0],",
    " [0,0,18],[80,0,18],[80,60,18],[0,60,18],",
    " [45,15,4],[75,15,4],[75,45,4],[45,45,4],",
    " [45,15,18],[75,15,18],[75,45,18],[45,45,18],",
    " [0,15,18],[80,15,18],[80,45,18],[0,45,18]];",
    "const FT2=[[0,2,1],[0,3,2],",
    " [0,1,5],[0,5,4],[2,3,7],[2,7,6],",
    " [0,4,16],[0,16,19],[0,19,7],[0,7,3],",
    " [1,2,6],[1,6,18],[1,18,17],[1,17,5],",
    " [4,5,17],[4,17,13],[4,13,12],[4,12,16],",
    " [6,7,19],[6,19,15],[6,15,14],[6,14,18],",
    " [16,12,15],[16,15,19],[13,17,18],[13,18,14],",
    " [8,9,10],[8,10,11],",
    " [8,13,9],[8,12,13],[10,15,11],[10,14,15],",
    " [8,11,15],[8,15,12],[9,13,14],[9,14,10]];",
    "(function(){",
    "  const ed={};let bad=0;",
    "  for(let i=0;i<FT2.length;i++)for(let k=0;k<3;k++){",
    "    const a=FT2[i][k],b=FT2[i][(k+1)%3];",
    "    const key=Math.min(a,b)+','+Math.max(a,b);",
    "    if(!ed[key])ed[key]=[];",
    "    ed[key].push(a<b?1:-1);",
    "  }",
    "  for(const k in ed){const e=ed[k];if(e.length!==2||e[0]===e[1])bad++;}",
    "  att(bad===0,'fixture decalee manifold : '+(bad?bad+' arete(s)':'ok'));",
    "})();",
    "const PR={v:PV,t:FT2},POCK=[[45,15],[75,15],[75,45],[45,45]];",
    "const oD={};for(const k in BASE)oD[k]=BASE[k];oD.mode='escargot';",
    "const mvD=faoGenRough3D(PR,BX,18,4,oD);",
    "const cD=cuts(mvD);",
    "att(cD.length>1000,'decalee : '+cD.length+' coupes');",
    "const dZ=function(m){return Math.hypot(m.x-60,m.y-30);};",
    "att(cD.length&&dZ(cD[0])<=2.5,'decalee : 1re coupe au centre de la ZONE (60,30) d='+",
    "  (cD.length?dZ(cD[0]):-1).toFixed(2)+' <= 2.5 (boite centre = 40,30)');",
    "let runD=0,mxRD=0,zEndD=null;",
    "for(let i=1;i<cD.length;i++){",
    "  if(cD[i].z<cD[i-1].z-1e-9){runD++;zEndD=cD[i].z;",
    "    const d=Math.hypot(cD[i].x-60,cD[i].y-30);if(d>mxRD)mxRD=d;",
    "  }else break;",
    "}",
    "att(runD>=10&&mxRD<=5&&Math.abs(zEndD-14)<1e-6,'decalee : 1re entree HELICE ('+runD+' pts, rayon '+mxRD.toFixed(2)+')');",
    "const wD=minSd(atZ(cD,14),POCK);",
    "att(wD>=5.3&&wD<=6.5,'decalee : z=14 lasse outil '+wD.toFixed(2)+' en [5.3,6.5]');",
    // ================= 5. defaut a la creation + sanitise =================
    "att(faoOpDefaults('rough3d').mode==='escargot','creation : faoOpDefaults(rough3d) en mode escargot');",
    "const o1={id:'es1',type:'rough3d',minipasses:0,mode:'escargot'};",
    "faoSanitiseOps({ops:[o1]});",
    "att(o1.mode==='escargot','sanitise : escargot conserve');",
    "const o2={id:'es2',type:'rough3d',minipasses:0,mode:'conv'};",
    "faoSanitiseOps({ops:[o2]});",
    "att(!o2.mode,'sanitise : conv n ecrit aucun champ mode');",
    "const o3={id:'es3',type:'rough3d',minipasses:0,mode:'vidange'};",
    "faoSanitiseOps({ops:[o3]});",
    "att(!o3.mode,'sanitise : mode inconnu purge');",
    // ================= 6. fiche : selecteur Escargot en 1re option =================
    "const all=function(root){const out=[];(function w(n){out.push(n);(n.children||[]).forEach(w);})(root);return out;};",
    "const txt=function(root){return all(root).map(function(n){return String(n.textContent||'');}).join('|');};",
    "const selsOf=function(root){return all(root).filter(function(n){return n.tagName==='SELECT';});};",
    "const r3=faoOpDefaults('rough3d');",
    "const card=faoOpCardElement(faoSetup(),r3,0);",
    "att(card.children.length>8,'fiche escargot : sections ('+card.children.length+')');",
    "const sels=selsOf(card);",
    "const modeSel=sels.filter(function(s){return /Escargot/.test(Array.prototype.map.call(s.children||[],",
    "  function(o){return String(o.textContent||'');}).join('|'));})[0];",
    "att(!!modeSel,'fiche : selecteur de mode avec Escargot');",
    "if(modeSel){",
    "  const first=String((modeSel.children[0]||{}).textContent||'');",
    "  att(/^Escargot/.test(first),'fiche : Escargot en 1re option ('+first+')');",
    "  att(modeSel.value==='escargot','fiche : option selectionnee = escargot ('+modeSel.value+')');",
    "}",
    "const allTxt=Array.prototype.map.call(sels,function(s){",
    "  return Array.prototype.map.call(s.children||[],function(o){return String(o.textContent||'');}).join('|');}).join('');",
    "att(!/Morph|Zigzag|Adaptive/.test(allTxt),'fiche : selecteur de strategie absent');",
    // 2026-10-08-003 : les aides ne sont PLUS dans la fiche (trop en place) :
    // elles partent en menu contextuel au clic droit sur le select Mode.
    "att(!/Escargot : pelage en spirale/.test(txt(card)),'fiche : aide escargot retiree de la fiche');",
    "att(!/Pelage à ap constant/.test(txt(card)),'fiche : aide conventionnelle retiree de la fiche');",
    "att(/Clic droit/.test(String((modeSel&&modeSel.title)||'')),'select Mode : titre annonce le clic droit');",
    "const boxes=function(){const out=[];(function w(n){if(n&&n.className==='fao-ctx')out.push(n);(n.children||[]).forEach(w);})(document.body);return out;};",
    "if(modeSel&&modeSel.dispatchEvent){modeSel.dispatchEvent({type:'contextmenu',clientX:30,clientY:40,preventDefault:function(){}});}",
    "att(boxes().length===1,'clic droit : popup d infos ouverte ('+boxes().length+')');",
    "att(/Escargot : pelage en spirale/.test(String((boxes()[0]&&boxes()[0].textContent)||'')),'popup : texte du mode escargot');",
    "window.dispatchEvent({type:'keydown',key:'Escape'});",
    "att(boxes().length===0,'Echap : popup fermee');",
    // sans mode (doc ancien) : popup conventionnelle, puis bascule par le selecteur
    "const r4=faoOpDefaults('rough3d');delete r4.mode;",
    "const card4=faoOpCardElement(faoSetup(),r4,0);",
    "att(!/Pelage à ap constant/.test(txt(card4)),'fiche : sans mode -> aide conv retiree aussi');",
    "const ms4=selsOf(card4).filter(function(s){return /Escargot/.test(Array.prototype.map.call(s.children||[],",
    "  function(o){return String(o.textContent||'');}).join('|'));})[0];",
    "if(typeof sel!=='undefined')sel={kind:null,id:null};",
    "if(ms4){",
    "  if(ms4.dispatchEvent)ms4.dispatchEvent({type:'contextmenu',clientX:30,clientY:40,preventDefault:function(){}});",
    "  att(boxes().length===1,'clic droit sans mode : popup ouverte');",
    "  att(/Pelage à ap constant/.test(String((boxes()[boxes().length-1]&&boxes()[boxes().length-1].textContent)||'')),'popup : texte conventionnel');",
    "  ms4.value='escargot';ms4.onchange();",
    "  att(r4.mode==='escargot','selecteur : choisir Escargot ecrit op.mode');",
    "  att(boxes().length===0,'changement de mode : popup fermee');",
    "  const card5=faoOpCardElement(faoSetup(),r4,0);",
    "  att(!/Escargot : pelage en spirale/.test(txt(card5)),'apres selection : aide toujours hors fiche');",
    "  if(ms4.dispatchEvent)ms4.dispatchEvent({type:'contextmenu',clientX:30,clientY:40,preventDefault:function(){}});",
    "  att(/Escargot : pelage en spirale/.test(String((boxes()[boxes().length-1]&&boxes()[boxes().length-1].textContent)||'')),'apres selection : popup escargot');",
    "  window.dispatchEvent({type:'pointerdown',target:null});",
    "  att(boxes().length===0,'clic exterieur : popup fermee');",
    "}else att(false,'fiche sans mode : selecteur de mode introuvable');",
    // ================= 7. dispatch : op escargot -> parcours complet =================
    "const job=faoDefaultJob();",
    "job.stock={x0:-5,y0:-5,z0:0,x1:85,y1:65,z1:18};",
    "const mkOp=function(id,extra){const o={id:id,on:true,toolId:'T1',type:'rough3d',",
    "  ztop:18,zbot:4,ap:4,ae:5,radial:0.5,axial:0.5,minipasses:0};",
    "  if(extra)for(const k in extra)o[k]=extra[k];return o;};",
    "const opE=mkOp('de1',{mode:'escargot'});",
    "const opC=mkOp('de2',{});",
    "job.ops=[opE,opC];",
    "const keepAM=faoActiveMesh;",
    "faoActiveMesh=function(){return {mesh:FR,box:BX};};",
    "let dE=[],dC=[];",
    "try{",
    "  dE=faoOpMoves(opE,job);",
    "  dC=faoOpMoves(opC,job);",
    "}catch(e){att(false,'dispatch : exception '+e.message);}",
    "finally{faoActiveMesh=keepAM;}",
    "const dEc=cuts(dE),dCc=cuts(dC);",
    "att(dEc.length>1000,'dispatch escargot : '+dEc.length+' coupes generees');",
    "const wd=minSd(atZ(dEc,14),MP);",
    "att(wd>=5.3&&wd<=6.5,'dispatch escargot : z=14 lasse outil '+wd.toFixed(2)+' en [5.3,6.5]');",
    "att(JSON.stringify(dE)!==JSON.stringify(dC),'dispatch : escargot DIFFERENT du conventionnel');",
    // ================= rapport =================
    "p('escargot : '+cE.length+' coupes | conv : '+cC.length+' | portrait : '+cP.length+' | decalee : '+cD.length+' | dispatch : '+dEc.length);",
    "p('z=14 : lasse '+minSd(z14,MP).toFixed(2)+' mm, centre '+maxSd(z14,MP).toFixed(2)+' mm, '+nw14+' coupes <= 7 mm des murs');",
    "p('expansion +'+dExp.toFixed(1)+' mm (3er - 1er tiers) | helice 1re face '+run+' pts rayon '+mxR.toFixed(2)+' | mini-passes z16.667 : '+nMP2);",
    "p('decalee : 1re coupe d(zone)='+(cD.length?dZ(cD[0]):-1).toFixed(2)+' mm | derniere passe z=14 : '+(40-badT.length)+'/40 sur la laisse | conv : 1re d='+dcC(z14C[0]).toFixed(1)+', fin d='+dcC(mEndC).toFixed(1));",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_escargot.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
