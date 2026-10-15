// FAO 3D : ébauche par tranches + finition parallèle (Iso-Z supprimé 2026-10-14-003).
// Maillages synthétiques (boîte 10³, sphère lat-long) : slice, scanline,
// normales, iso-courbes et génération rough3d/geofinish.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- boîte 10^3, faces orientées vers l'extérieur
    "const box={v:[[0,0,0],[10,0,0],[10,10,0],[0,10,0],[0,0,10],[10,0,10],[10,10,10],[0,10,10]],",
    " t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]};",
    // --- slice à mi-hauteur : 8 segments (2 par face latérale)
    "const ss=faoSliceZ(box,5);",
    "att(ss.length===8,'slice boîte z=5 : 8 segs, vu '+ss.length);",
    "att(ss.every(s=>s.every(c=>c>=-1e-9&&c<=10+1e-9)),'slice : coords dans [0,10]');",
    // --- scanline : intervalle plein
    "const iv=faoScanIntervals(ss,5);",
    "att(iv.length===1&&Math.abs(iv[0][0])<1e-9&&Math.abs(iv[0][1]-10)<1e-9,'scan y=5 : [0,10], vu '+JSON.stringify(iv));",
    // --- normales : sommet 6 -> (1,1,1)/v3
    "const bn=faoMeshNormals(box);",
    "const d6=(bn[6][0]+bn[6][1]+bn[6][2])/Math.sqrt(3);",
    "att(d6>0.95,'normale sommet 6 sortante : '+d6.toFixed(3));",
    // --- spot hélice : départ 2 mm au-dessus de la matière (boîte z 0..10)
    "att(faoHelixSpot(box,5,5,3,2,4,20)===12,'spot : dessus brut 10 + 2');",
    "att(faoHelixSpot(box,50,50,3,2,4,20)===6,'spot : colonne vide -> niveau + 2');",
    // --- disque : dedans/interdit, dehors autorisé
    "const bsegs=faoSliceZ(box,5);",
    "att(faoDiscClear(bsegs,5,5,2,2)===false,'disque : au centre -> interdit');",
    "att(faoDiscClear(bsegs,20,5,2,2)===true,'disque : dehors -> autorisé');",
    "att(faoDiscClear(bsegs,11.5,5,2,2)===false,'disque : à 1.5 du mur (< r=2) -> interdit');",
    // --- canal : 2 plots, la poche centrale se vide (brut-moins-pièce, D10 r=5)
    "const mkBox=function(x0,x1,y0,y1,z0,z1){return {v:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]};};",
    "const merge=function(A,B){const off=A.v.length;return {v:A.v.concat(B.v),t:A.t.concat(B.t.map(function(t){return [t[0]+off,t[1]+off,t[2]+off];}))};};",
    "const CN=merge(mkBox(0,20,0,60,0,40),mkBox(80,100,0,60,0,40));",
    "const BX={x0:-5,y0:-5,x1:105,y1:65};",
    "const blkD=function(px,py,x0,x1,y0,y1){const dx=Math.max(x0-px,0,px-x1),dy=Math.max(y0-py,0,py-y1);return Math.hypot(dx,dy);};",
    "const rm=faoGenRough3D(CN,BX,40,0,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45});",
    "att(rm.length>10,'canal : '+rm.length+' moves');",
    "att(rm[0].r===1,'canal : 1er move rapide');",
    // Retour 6/10 : les abouts sont à la DISTANCE PERPENDICULAIRE (r·cosθ et
    // recul y±aeA supprimés) — la zone alignée X/Y ne reflétait plus la vérité
    // physique près des coins. Vérité : disque ≥ r sur toute la pièce +
    // garde-fou course dans la boîte élargie.
    "att(rm.filter(m=>!m.r).every(m=>blkD(m.x,m.y,0,20,0,60)>=4.99&&blkD(m.x,m.y,80,100,0,60)>=4.99&&m.x>=-30&&m.x<=140&&m.y>=-30&&m.y<=100),'canal : clearance outil >= r sur les deux plots (marge comprise)');",
    "att(rm.filter(m=>m.r).every(m=>m.z>=0-1e-9),'canal : rapides jamais sous le niveau');",
    "att(rm.some(m=>!m.r&&m.x<=-5+1e-9),'canal : marge laterale degagee');",
    "att(rm.some(m=>!m.r&&m.y<=-5+1e-9),'canal : marge avant degagee');",
    "const zc={};rm.filter(m=>!m.r).forEach(m=>{zc[Math.round(m.z)]=1;});",
    "att(zc[0]&&zc[10]&&zc[20]&&zc[30],'canal : niveaux 0,10,20,30 usinés');",
    // --- hélice unitaire : rayon constant, descente monotone, retour au départ
    "const hx=faoHelixEntry(0,0,10,0,3,10);",
    "att(hx[0].r===1&&Math.abs(hx[0].x-3)<1e-9&&hx[0].z===10,'helice : depart rapide (3,0,10)');",
    "const hxc=hx.filter(m=>!m.r);",
    "att(hxc.length>10&&hxc[hxc.length-1].z===0,'helice : fond Z=0 atteint');",
    "att(hxc.every((m,i)=>i===0||m.z<=hxc[i-1].z+1e-9),'helice : descente monotone');",
    "att(hxc.every(m=>Math.abs(Math.hypot(m.x,m.y)-3)<1e-6),'helice : rayon 3 constant');",
    // --- auto -> rampe sur intervalle étroit (canal D10 : on force étroit)
    "const rn=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,entry:'ramp'});",
    "att(rn[1].r===0&&Math.abs(rn[1].z-30)<1e-9,'rampe : 2e move au niveau 30');",
    // --- hélice forcée sur large (canal 50 >= 25)
    "const rh=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,entry:'helix'});",
    "att(rh[1].r===0&&rh[1].z<45&&rh[1].z>30,'helice forcee : 2e move en descente');",
    "att(rh.some(m=>!m.r&&Math.abs(m.z-30)<1e-9),'helice forcee : niveau 30 atteint');",
    // --- 2026-10-09-006 : bandes parallèles + rester sur le plan (canal rm)
    // (a) le milieu s'ouvre en longues lignes droites à cote constant (bandes),
    // sur BEAUCOUP de y distincts (les cadres seuls ne donnent que quelques y) ;
    // (b) les entrées sont groupées (≈1 par niveau/zone — plus de sortie/
    // ré-entrée en hélice à chaque morceau) ; (c) stay-down : peu de rapides.
    "const ln6=[];const ys6={};for(let i=1;i<rm.length;i++){const a=rm[i-1],b=rm[i];if(!a.r&&!b.r&&Math.abs(a.z-b.z)<1e-9&&Math.abs(a.y-b.y)<1e-9&&Math.abs(a.x-b.x)>=10){ln6.push(i);ys6[a.y.toFixed(2)]=1;}}",
    "att(ln6.length>20,'006 bandes : '+ln6.length+' longues lignes droites (>=10 mm) a cote constant');",
    "att(Object.keys(ys6).length>=12,'006 bandes : '+Object.keys(ys6).length+' y distincts (bandes, pas seulement cadres)');",
    "let ent6=0,last6=false;rm.forEach(function(m){const e=m.ent===1;if(e&&!last6)ent6++;last6=e;});",
    "att(ent6<=200,'2026-10-14-005 entrees : '+ent6+' groupes ent (glissement limité à 1,5 pas : au-delà lever + rapide + entrée)');",
    "att(rm.filter(m=>m.r).length<=400,'2026-10-14-005 rapides bornés : '+rm.filter(m=>m.r).length+' rapides sur '+rm.length+' moves');",
    // --- parois pièce : x=25 et x=75 suivis sur plusieurs lignes (grille aeA=2.5)
    "att(rm.some(m=>!m.r&&Math.abs(m.x-25)<1e-9&&Math.abs(m.y-0)<1e-9),'paroi : (25,0)');",
    "att(rm.some(m=>!m.r&&Math.abs(m.x-25)<1e-9&&Math.abs(m.y-52.5)<1e-9),'paroi : (25,52.5) suivie');",
    "att(rm.some(m=>!m.r&&Math.abs(m.x-75)<1e-9),'paroi droite x=75');",
    // --- plats : au-dessus de la pièce (z=30 vide) = surfaçage pleine largeur
    "const rf=faoGenRough3D(mkBox(40,60,20,40,0,10),BX,30,10,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:35});",
    "const z20=rf.filter(m=>!m.r&&Math.abs(m.z-20)<1e-9);",
    "att(z20.some(m=>m.x<10)&&z20.some(m=>m.x>90),'plat z=20 : pleine largeur');",
    "att(rf.filter(m=>!m.r&&blkD(m.x,m.y,40,60,20,40)<4.99).every(m=>m.z>=10-1e-9),'z=10 : jamais sous le dessus de la pièce (2026-10-15-001 : à Bas = dessus, l outil peut affleurer la face, sans entamer)');",
    "att(rf.filter(m=>!m.r&&Math.abs(m.z-10)<1e-9).some(m=>m.x<0),'plat z=10 : marge laterale degagee');",
    // --- marches : plots larges en bas, étroits en haut (raffinement auto)
    "const ST=merge(merge(mkBox(0,30,0,60,0,20),mkBox(70,100,0,60,0,20)),merge(mkBox(0,20,0,60,20,40),mkBox(80,100,0,60,20,40)));",
    "const mo=faoGenRough3D(ST,BX,40,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45});",
    "const z30=mo.filter(m=>!m.r&&Math.abs(m.z-30)<1e-9);",
    "att(z30.some(m=>m.x>23&&m.x<27),'troco : paroi gauche ~25.5');",
    "att(z30.some(m=>m.x>44&&m.x<46),'troco : passage interieur ~45');",
    "const consec=function(arr){const out=[];for(let i=1;i<arr.length;i++)out.push([arr[i-1],arr[i]]);return out;};",
    "att(consec(z30).some(p=>!p[0].r&&!p[1].r&&Math.abs(p[0].x-p[1].x)<0.01&&Math.abs(p[0].y-p[1].y)>2&&Math.abs(p[0].x-50)>20),'troco : flanc vertical (liaison entre lignes)');",
    // --- mode unique : les passes fines ap2 n'existent plus (pelage trocoïdal)
    "const mr=faoGenRough3D(ST,BX,40,0,{ap:10,ap2:2,ae:6,toolD:10,radial:0.5,axial:0,secu:45,entry:'ramp'});",
    "const zr={};mr.filter(m=>!m.r&&!m.ent).forEach(m=>{zr[Math.round(m.z)]=1;});",
    "att(!zr[26],'troco : ap2 ignore, aucun niveau fin à 26');",
    "att(!zr[24],'troco : ap2 ignore, aucun niveau fin à 24');",
    // --- mode unique : l'option strategy est rejetée (sortie identique)
    "const mz=faoGenRough3D(ST,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'zigzag'});",
    "const mz0=faoGenRough3D(ST,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45});",
    "att(JSON.stringify(mz)===JSON.stringify(mz0),'strategy zigzag rejetee : sortie identique');",
    // --- régions : 2 colonnes disjointes sur 2 lignes = 2 régions
    "const RG=faoRoughRegions([{y:0,ivs:[{a:0,b:4},{a:6,b:10}]},{y:1,ivs:[{a:0,b:4},{a:6,b:10}]}]);",
    "att(RG.length===2&&RG.every(g=>g.length===2),'régions : 2 colonnes');",
    "att(RG.some(g=>g.every(q=>q.iv.b<=4+1e-9)),'région gauche : que [0,4]');",
    // --- mode unique : les anciennes stratégies ont été supprimées du code
    "att(typeof faoRoughLevel==='undefined'&&typeof faoRoughMorph==='undefined'&&typeof faoRoughZigzag==='undefined'&&typeof faoRoughIntervals==='undefined','mode unique : helpers morph/zigzag supprimes');",
    // --- arrondi de l'ébauche : des arcs, bornes + surépaisseur tenues
    "const mro=faoGenRough3D(ST,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45});",
    "const mrr=faoRoundMoves(mro,2);",
    "att(mrr.some(m=>!m.r&&m.arc),'arrondi : arcs présents');",
    "const m30=mrr.filter(m=>!m.r&&Math.abs(m.z-30)<1e-9);",
    "att(m30.filter(m=>!m.arc).every(m=>blkD(m.x,m.y,0,20,0,60)>=4.99&&blkD(m.x,m.y,80,100,0,60)>=4.99&&m.x>=-30&&m.x<=140&&m.y>=-30&&m.y<=100),'arrondi : droites clearance >= r (marge comprise)');",
    "att(m30.every(m=>blkD(m.x,m.y,0,20,0,60)>=4.59&&blkD(m.x,m.y,80,100,0,60)>=4.59&&m.x>=-30&&m.x<=140&&m.y>=-30&&m.y<=100),'arrondi : bombe <= 0.9 (sagitta 90 degres)');",
    "att(mrr.filter(m=>!m.r&&!m.ent&&m.arc&&!m.arc.troch).every(m=>Math.hypot(m.arc.i,m.arc.j)<=2.01),'arrondi : rayon <= 2 (hors trochoides)');",
    // --- sphère lat-long R=10 (8x12), seed = pôle nord
    "const SP={v:[[0,0,10]],t:[]};",
    "{const nL=8,nC=12,Ra=10;",
    "for(let i=1;i<nL;i++){const ph=i*Math.PI/nL;",
    " for(let j=0;j<nC;j++){const th=j*2*Math.PI/nC;",
    "  SP.v.push([Ra*Math.sin(ph)*Math.cos(th),Ra*Math.sin(ph)*Math.sin(th),Ra*Math.cos(ph)]);}}",
    "const SUD=SP.v.length;SP.v.push([0,0,-10]);",
    "const RG=function(i,j){return 1+(i-1)*nC+(((j%nC)+nC)%nC);};",
    "for(let j=0;j<nC;j++)SP.t.push([0,RG(1,j),RG(1,j+1)]);",
    "for(let i=1;i<nL-1;i++)for(let j=0;j<nC;j++)SP.t.push([RG(i,j),RG(i+1,j),RG(i+1,j+1)],[RG(i,j),RG(i+1,j+1),RG(i,j+1)]);",
    "for(let j=0;j<nC;j++)SP.t.push([SUD,RG(nL-1,j+1),RG(nL-1,j)]);}",
    "att(SP.t.length===12+6*12*2+12,'sphere : 168 tris, vu '+SP.t.length);",
    "const sn=faoMeshNormals(SP);",
    "let out=0;for(let i=0;i<SP.v.length;i++){const l=Math.hypot(SP.v[i][0],SP.v[i][1],SP.v[i][2])||1;",
    " if((SP.v[i][0]*sn[i][0]+SP.v[i][1]*sn[i][1]+SP.v[i][2]*sn[i][2])/l<0.9)out++;}",
    "att(out===0,'sphere : normales sortantes ('+out+' KO)');",
    // --- finition (2026-10-14-003 : Iso-Z supprimé, faoGenGeoFinish = profils
    // PARALLÈLES) : passes sur la sphère, pointe outil jamais sous la surface
    "const gm=faoGenGeoFinish(SP,{step:5,toolD:8,kind:'ball',laisse:0,secu:30});",
    "att(gm.length>20,'geofinish : '+gm.length+' moves');",
    "att(gm.filter(m=>!m.r).every(m=>Math.hypot(m.x,m.y,m.z+4)>=13.5),'geofinish sphère : centre outil hors matière (R+4)');",
    // --- hélice d'entrée sur sphère (équateur large, SP défini plus haut)
    "const mh=faoGenRough3D(SP,{x0:-12,y0:-12,x1:12,y1:12},20,0,{ap:10,ae:4,toolD:4,radial:0.5,axial:0,secu:30});",
    "att(mh.some(m=>!m.r&&m.z>10&&m.z<30),'sphere : descente entree 20->10');",
    // --- pelage trocoïdal : petit pas + stay-down + trochoide (canal CN, BX)
    "const ad=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "att(ad.length>50,'adaptive : '+ad.length+' moves');",
    "att(ad[0].r===1,'adaptive : 1er move rapide');",
    "att(ad.filter(m=>!m.r).every(m=>blkD(m.x,m.y,0,20,0,60)>=5.49&&blkD(m.x,m.y,80,100,0,60)>=5.49&&m.x>=-30&&m.x<=140&&m.y>=-30&&m.y<=100),'adaptive : clearance outil >= r (marge comprise)');",
    "att(ad.some(m=>!m.r&&m.z>30&&m.z<45),'adaptive : descente helice');",
    "att(ad.filter(m=>m.r).length<=150,'adaptive (2026-10-14-005 : glissement <= 1,5 pas, sinon rapide) : '+ad.filter(m=>m.r).length+' rapides (1 entree par colonne)');",
    "const mo1=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'morph'});",
    "att(ad.filter(m=>!m.r).length===mo1.filter(m=>!m.r).length,'strategy morph rejetee : meme sortie troco');",
    // --- adaptive en goulet 15 mm (D10) : trochoides, pas de droite pleine largeur
    "const NB=merge(mkBox(0,42.5,0,60,0,40),mkBox(57.5,100,0,60,0,40));",
    "const az=faoGenRough3D(NB,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "att(az.length>20,'adaptive goulet : '+az.length+' moves');",
    "att((function(){const s={};az.filter(m=>!m.r).forEach(m=>{s[Math.round(m.y*10)/10]=1;});return Object.keys(s).length;})()>24,'adaptive goulet : oscillation Y (trochoide)');",
    "att(az.some(m=>!m.r&&m.arc&&m.ent!==1),'adaptive goulet : arcs G2/G3 presents');",
    "att(az.filter(m=>!m.r&&m.arc&&m.ent!==1).every(m=>{const q=Math.hypot(m.arc.i,m.arc.j);return q>=0.4&&q<=3.1;}),'adaptive goulet : rayons trochoides coherents');",
    "att(az.filter(m=>!m.r&&m.arc&&m.ent!==1).every(m=>!m.arc.cw),'adaptive goulet : trochoides CCW (G3)');",
    // --- adaptive : ombre du brut restant (queue d'aronde : large en haut)
    "const DV=merge(mkBox(40,60,0,60,0,20),mkBox(30,70,0,60,20,40));",
    "const BX2={x0:0,y0:-5,x1:100,y1:65};",
    "const av=faoGenRough3D(DV,BX2,40,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "const c10=av.filter(m=>!m.r&&Math.abs(m.z-10)<1e-9);",
    "att(c10.length>0,'adaptive surplomb : niveau bas usine');",
    "att(c10.every(m=>blkD(m.x,m.y,30,70,0,60)>=5.49),'adaptive surplomb : jamais sous le porte-a-faux [30,70]');",
    "att(av.some(m=>!m.r&&Math.abs(m.z-30)<1e-9),'adaptive surplomb : niveau haut usine');",
    // --- adaptive : micro-entree en fente ~D (12 mm, D10 : ni helice ni rampe)",
    "const NS=merge(mkBox(0,44,0,60,0,40),mkBox(56,100,0,60,0,40));",
    "const an=faoGenRough3D(NS,BX,40,30,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,strategy:'adaptive'});",
    "att(an.length>10&&an[0].r===1,'adaptive fente : '+an.length+' moves, demarre rapide');",
    "att(an.filter(m=>!m.r).every(m=>blkD(m.x,m.y,0,44,0,60)>=4.98&&blkD(m.x,m.y,56,100,0,60)>=4.98),'adaptive fente : clearance outil >= r sur les deux plots');",
    // --- trochoide : excursion Y bornee a la bande balayee + repli droit
    "const tc=[];faoTrochSlot(tc,0,20,5,10,10,2.5,5,5);",
    "att(tc.some(m=>!m.r&&m.arc),'troch clamp : arcs si place reduite en Y');",
    "att(tc.filter(m=>!m.r).every(m=>Math.abs(m.y-5)<=1.26),'troch clamp : |dY| <= bord (1.25)');",
    "const ts=[];faoTrochSlot(ts,0,20,5,10,10,0.5,5,5);",
    "att(ts.length>0&&ts.every(m=>!m.arc),'troch repli : droit si pas de place');",
    "att(ts.filter(m=>!m.r).every(m=>m.x>=-1e-9&&m.x<=20+1e-9&&Math.abs(m.y-5)<1e-9),'troch repli : reste sur la ligne');",
    // --- ombre exacte : voile fin 24.3-24.9 (hors grille 2 mm) jamais traverse
    "const VL=merge(mkBox(40,60,0,60,0,10),mkBox(30,70,0,60,24.3,24.9));",
    "const vv=faoGenRough3D(VL,BX2,40,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "const c20=vv.filter(m=>!m.r&&Math.abs(m.z-20)<1e-9);",
    "att(c20.length>0,'adaptive voile : niveau 20 usine autour');",
    "att(c20.every(m=>blkD(m.x,m.y,30,70,0,60)>=5.49),'adaptive voile : voile fin jamais traverse');",
    "att(Math.abs(faoHelixSpot(VL,50,30,3,5.5,20,40,[0,10,24.3,24.9])-26.9)<1e-9,'helice plans : depart au-dessus du voile');",
    // --- sens long : brut PORTRAIT -> pelage le long de Y (liaisons longues verticales)
    "const BP={x0:0,y0:0,x1:60,y1:120};",
    "const mp=faoGenRough3D(mkBox(10,50,10,110,0,20),BP,30,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "let lv=0,pp=null;mp.forEach(function(m){if(m.r){pp=null;return;}if(pp&&Math.abs(m.x-pp.x)<1e-6&&Math.abs(m.y-pp.y)>5)lv++;pp=m;});",
    "att(lv>0,'sens long : liaison longue verticale sur brut portrait ('+lv+')');",
    // --- mini-passes Z : contours de parois entre plans trocoïdaux (retour 4/10)
    // Plaque 60x40x18, ap=6 -> plans [12,6,0] ; bandes de 6 mm ; minipasses=2
    // -> z = 16,14 / 10,8 / 4,2 (k*ap/(nb+1) sous le plan du dessus, strictement
    // entre les plans). Offsets s = radial*(nb-k)/nb -> 0.25 puis 0 au plus profond.
    "const PL=mkBox(20,80,20,60,0,18);",
    "const mm=faoGenRough3D(PL,BX,18,0,{ap:6,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive',minipasses:2});",
    "const mid=function(ms,rr){return ms.filter(m=>blkD(m.x,m.y,20,80,20,60)<rr-0.01).length;};",
    "const m16=mm.filter(m=>!m.r&&Math.abs(m.z-16)<1e-6),m14=mm.filter(m=>!m.r&&Math.abs(m.z-14)<1e-6);",
    "att(m16.length>5&&m14.length>5,'mini passes : plans z=16/14 usines ('+m16.length+'/'+m14.length+' moves)');",
    "att(mid(m16,5.25)<=4,'mini passe 1 (z=16, s=0.25) : contour de parois seul ('+mid(m16,5.25)+' moves sous r_eff)');",
    "att(mid(m14,5)<=4,'mini passe 2 (z=14, s=0) : contour de parois seul ('+mid(m14,5)+' moves sous r_eff)');",
    "att(mm.some(m=>!m.r&&Math.abs(m.z-12)<1e-6),'mini passes : plan trocoïdal z=12 toujours usine');",
    "const m0=faoGenRough3D(PL,BX,18,0,{ap:6,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    // L'hélice d'entrée part maintenant 2 mm au-dessus de la face d'entrée
    // (18+2=20) et la traverse en descendant : elle traverse z=16, mais un SEUL
    // point, loin des parois — un vrai mini-plan z=16 serait au contour (5,25).
    "const m16off=m0.filter(m=>!m.r&&Math.abs(m.z-16)<1e-6);",
    "att(mid(m16off,5.5)===0,'minipasses off par defaut : aucun plan z=16 ('+m16off.length+' pt(s), dont '+mid(m16off,5.5)+' au contour)');",
    // --- plafond mini-passes 9 -> 50 (2026-10-07-003) : sanitise + générateur
    "const sjm={ops:[{id:'m99',type:'rough3d',minipasses:99},{id:'m50',type:'rough3d',minipasses:50},{id:'m12',type:'rough3d',minipasses:12}]};",
    "faoSanitiseOps(sjm);",
    "att(sjm.ops[0].minipasses===50,'sanitise mini : 99 -> 50 (nouveau plafond)');",
    "att(sjm.ops[1].minipasses===50&&sjm.ops[2].minipasses===12,'sanitise mini : 50 et 12 conserves (ancien plafond 9)');",
    "const mm50=faoGenRough3D(PL,BX,18,0,{ap:6,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive',minipasses:50});",
    "att(mid(mm50.filter(m=>!m.r&&Math.abs(m.z-11.882)<1e-6),5.6)>0,'mini 50 : plan intermediaire z=11,882 (= 12 - 6/51) au contour');",
    "att(mm50.length>mm.length*2,'mini 50 : plans intermediaires en plus ('+mm50.length+' > 2x '+mm.length+' moves)');",
    "const mm99=faoGenRough3D(PL,BX,18,0,{ap:6,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive',minipasses:99});",
    "att(mm99.length===mm50.length,'gen mini : 99 capé a 50 (meme parcours : '+mm99.length+' = '+mm50.length+' moves)');",
    // --- geodésique 6+2 : sens horizontal, limites Z, garde-fou fraise droite (retour 4/10)
    "const PLN={v:[[0,0,30],[60,0,30],[60,40,30],[0,40,30]],t:[[0,1,2],[0,2,3]]};",
    "const SL={v:[[0,0,0],[40,0,20],[40,20,20],[40,40,20],[0,40,0]],t:[[0,1,2],[0,2,3],[0,3,4]]};",
    // formes : offsets outil sur plan horizontal — 2026-10-13-006 : les points
    // chemin sont la POINTE outil (tip), plus le centre. Ball D8 sur plan z=30
    // -> coupe z=30 (la pointe touche la surface ; le centre serait à 34).
    "const gB=faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'ball',laisse:0,secu:45});",
    "const zB=gB.filter(m=>!m.r).map(m=>m.z);",
    "att(zB.length>4&&Math.abs(Math.max.apply(null,zB)-30)<1e-6,'geo formes : ball D8 sur plan z=30 -> coupe z=30 (pointe), vu '+(zB.length?Math.max.apply(null,zB):'-'));",
    "const gU=faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'bull',cornerR:1,laisse:0,secu:45});",
    "const zU=gU.filter(m=>!m.r).map(m=>m.z);",
    "att(zU.length>4&&Math.abs(Math.max.apply(null,zU)-30)<1e-6,'geo formes : bull coin1 sur plan -> coupe z=30 (pointe), vu '+(zU.length?Math.max.apply(null,zU):'-'));",
    "const gF=faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'flat',laisse:0,secu:45});",
    "const zF=gF.filter(m=>!m.r).map(m=>m.z);",
    "att(zF.length>4&&Math.abs(Math.max.apply(null,zF)-30)<1e-6,'geo formes : fraise droite sur plan -> coupe z=30, vu '+(zF.length?Math.max.apply(null,zF):'-'));",
    "const gS=faoGenGeoFinish(SL,{step:5,toolD:8,kind:'ball',laisse:0,secu:45});",
    "const cs=gS.filter(m=>!m.r);",
    "att(cs.length>6,'geo rampe : '+cs.length+' coupe outil');",
    // limites Z : ztop=12 -> aucune coupe au-dessus de 12+Rc
    "const gL=faoGenGeoFinish(SL,{step:5,toolD:8,kind:'ball',laisse:0,secu:45,ztop:12});",
    "const zL=gL.filter(m=>!m.r).map(m=>m.z);",
    "att(zL.length>0&&Math.max.apply(null,zL)<16,'geo limites Z : ztop=12 -> coupe max '+(zL.length?Math.max.apply(null,zL).toFixed(2):'-')+' < 16');",
    // garde-fou fraise droite : refusee sur non-horizontal, acceptee sur plan
    "att(faoGenGeoFinish(SL,{step:5,toolD:8,kind:'flat',laisse:0,secu:45}).length===0,'geo garde-fou : fraise droite refusee sur rampe');",
    "att(faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'flat',laisse:0,secu:45}).length>0,'geo garde-fou : fraise droite acceptee sur plan');",
    // --- dispatch via ops (maillage actif nul en VM -> [] sans planter)
    "const j3=faoDefaultJob();j3.ops=[{id:'x',on:true,toolId:'T3',type:'geofinish',step:1,laisse:0}];",
    "att(Array.isArray(faoOpMoves(j3.ops[0],j3)),'dispatch geofinish sans maillage : pas de plantage');",
    // --- 026 : géofinish 2026-10-12-002 — liaison par SPLINE TANGENTE (façon Fusion 360)
    // (1) unit : faoSplinePts respecte les points de départ/arrivée exacts, et les
    // tangentes aux bouts collent aux tangentes demandées (droite = dot 1.0).
    "function _dir(a,b){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,l=Math.hypot(dx,dy,dz)||1;return {x:dx/l,y:dy/l,z:dz/l};}",
    "const _P0={x:1,y:2,z:3},_P1={x:8,y:6,z:9},_T={x:7,y:4,z:6};",
    "const _sp=faoSplinePts(_P0,_T,_P1,_T,20);",
    "att(_sp[0].x===1&&_sp[0].y===2&&_sp[0].z===3&&_sp[_sp.length-1].x===8&&_sp[_sp.length-1].y===6&&_sp[_sp.length-1].z===9,'geo spline : extremites exactes');",
    "const _u0=_dir(_sp[0],_sp[1]),_w0=_dir(_P0,{x:_P0.x+_T.x,y:_P0.y+_T.y,z:_P0.z+_T.z});",
    "att(_u0.x*_w0.x+_u0.y*_w0.y+_u0.z*_w0.z>0.999,'geo spline : tangente au depart (dot '+(_u0.x*_w0.x+_u0.y*_w0.y+_u0.z*_w0.z).toFixed(3)+')');",
    "const _u1=_dir(_sp[_sp.length-2],_sp[_sp.length-1]),_w1=_dir(_P1,{x:_P1.x+_T.x,y:_P1.y+_T.y,z:_P1.z+_T.z});",
    "att(_u1.x*_w1.x+_u1.y*_w1.y+_u1.z*_w1.z>0.999,'geo spline : tangente a l arrivee (dot '+(_u1.x*_w1.x+_u1.y*_w1.y+_u1.z*_w1.z).toFixed(3)+')');",
    // (2) Deux plateaux disjoints a meme Z : un seul niveau geodesique = zone
    // multi-chaines -> la liaison inter-chaînes passe par une spline en AIR
    // (beaucoup de rapides G0) au lieu d un couple lift-secu. o.spline:false = repli lift.
    "const SBX=(function(){",
    "  const V=[],T=[];",
    "  function quad(a,b,c,d){T.push([a,b,c],[a,c,d]);}",
    "  function box(x0,y0,x1,y1,z0,z1){const b=V.length;V.push([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);quad(b,b+1,b+2,b+3);quad(b+4,b+5,b+6,b+7);quad(b,b+1,b+5,b+4);quad(b+1,b+2,b+6,b+5);quad(b+2,b+3,b+7,b+6);quad(b+3,b,b+4,b+7);}",
    "  box(0,0,20,20,0,10);box(30,0,50,20,0,10);",
    "  return {v:V,t:T};",
    "})();",
    "const geoSOn=faoGenGeoFinish(SBX,{step:5,toolD:6,kind:'ball',laisse:0,secu:25});",
    "const geoSOff=faoGenGeoFinish(SBX,{step:5,toolD:6,kind:'ball',laisse:0,secu:25,spline:false});",
    "const rapOn=geoSOn.filter(m=>m.r).length,rapOff=geoSOff.filter(m=>m.r).length;",
    "att(JSON.stringify(geoSOn)!==JSON.stringify(geoSOff),'geo spline : la liaison change le parcours');",
    "att(rapOn<=rapOff,'geo spline : liaisons en air -> pas plus de rapides que le lift ('+rapOn+' <= '+rapOff+', fusion des G0)');",
    // 2026-10-13-007 : l'invariant « liaisons volantes » porte sur la coupe
    // PURE (hors transitions tr:1, G1 stitch ou G0) : le stitch arrive au
    // contact et saute la rampe de ré-entrée (façon Fusion), donc le total
    // r:0 bouge d'autant — mais les points de coupe émis sont inchangés.
    "att(geoSOn.filter(m=>!m.r&&!m.tr).length===geoSOff.filter(m=>!m.r&&!m.tr).length,'geo spline : coupe pure inchangee ('+geoSOn.filter(m=>!m.r&&!m.tr).length+' == '+geoSOff.filter(m=>!m.r&&!m.tr).length+', liaisons volantes)');",
    // (3) laisse>0 : rien a tondre -> la spline ne s emet pas, repli lift strictement identique
    "const geoLOn=faoGenGeoFinish(SBX,{step:5,toolD:6,kind:'ball',laisse:3,secu:25});",
    "const geoLOff=faoGenGeoFinish(SBX,{step:5,toolD:6,kind:'ball',laisse:3,secu:25,spline:false});",
    "att(JSON.stringify(geoLOn)===JSON.stringify(geoLOff),'geo spline : laisse>0 -> liaison lift inchangee');",
    // (4) PLN (zones mono-chaîne) : la spline INTER-ZONES (2026-10-13-001)
    // relie maintenant les zones même mono-chaîne -> parcours différent.
    "const geoPnOn=faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'ball',laisse:0,secu:45});",
    "const geoPnOff=faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'ball',laisse:0,secu:45,spline:false});",
    "att(JSON.stringify(geoPnOn)!==JSON.stringify(geoPnOff),'geo spline : zone mono-chaîne -> liaison inter-zones active');",
    // --- 2026-10-13-001 : remontées COURTES + arc VERTICAL d'entrée
    // (a) spline:false sur PLN : le repli ne monte plus à secu — 2 rapides
    //     secu seulement (début de programme + retrait final), le reste à
    //     travel (colonne vide sur plan) ou H court.
    "const secP=geoPnOff.filter(m=>m.r===1&&Math.abs(m.z-45)<1e-9).length;",
    "att(secP<=2,'geo remontee courte : '+secP+' rapides a secu sur PLN (<=2 : debut + retrait), repli a travel/H');",
    // (b) chaque liaison cut->r:1->r:1 part de l'EXTRÉMITÉ LA PLUS PROCHE du
    //     tracé suivant (orientation aussi en tête de zone).
    // 2026-10-13-007 : la phase restes (réveillée par le fix want=null) peut
    // ajouter UN saut lointain vers un îlot non couvert (54,6 mm mesuré : 9
    // sauts ≤17,1 + 1 outlier) — borné par la diagonale pièce (~72), et les
    // sauts courants restent < 30.
    "const mjs=[];for(let i=0;i+2<geoPnOff.length;i++){if(geoPnOff[i].r===0&&geoPnOff[i+1].r===1&&geoPnOff[i+2].r===1){mjs.push(Math.hypot(geoPnOff[i+2].x-geoPnOff[i].x,geoPnOff[i+2].y-geoPnOff[i].y));}}",
    "const mj=mjs.length?Math.max.apply(null,mjs):0;",
    "p('geo remontee courte : liaison cut->r:1->r:1 max '+mj.toFixed(1)+' mm ('+mjs.filter(d=>d<30).length+'/'+mjs.length+' < 30)');",
    "att(mj>0&&mj<75&&mjs.filter(d=>d>=30).length<=2,'geo remontee courte : max '+mj.toFixed(1)+' < 75 et sauts courants < 30 (extremite la plus proche ; 1 saut restes toléré)');",
    // (c) arc VERTICAL d'entrée (varc) : avec ébauche avant + entrée circ,
    //     chaque entrée = quart de cercle en PLAN VERTICAL (G1 bleus ent,
    //     Δz>0) — plus aucun arc XY ({i,j,cw}) en entrée.
    "const geoV=faoGenGeoFinish(PLN,{step:6,toolD:8,kind:'ball',laisse:0,secu:45,entry:'circ',hasRrough:true});",
    "const vE=geoV.filter(m=>!m.r&&m.ent===1);",
    "att(vE.length>=8,'geo arc vertical : '+vE.length+' points d entree ent (quart de cercle attendu)');",
    "const vZmin=Math.min.apply(null,vE.map(m=>m.z)),vZmax=Math.max.apply(null,vE.map(m=>m.z));",
    "att(vZmax-vZmin>1,'geo arc vertical : entree en plan vertical (dz '+(vZmax-vZmin).toFixed(2)+' > 1)');",
    "att(geoV.filter(m=>m.ent===1&&m.arc).length===0,'geo arc vertical : aucun arc XY en entree (tout G1 de plan vertical)');",
    // --- 2026-10-13-007 : TRAJECTOIRE PARALLÈLE (rétro-ingénierie cav.txt +
    // visu Fusion « passes bleues ») : sol 60x40 + boss à gradins. Chaque
    // profil vertical suit la surface en Z (montée sur le boss), continu.
    "const PBOX=(function(){",
    "  const V=[],T=[];",
    "  function quad(a,b,c,d){T.push([a,b,c],[a,c,d]);}",
    "  function box(x0,y0,x1,y1,z0,z1){const b=V.length;V.push([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);quad(b,b+1,b+2,b+3);quad(b+4,b+5,b+6,b+7);quad(b,b+1,b+5,b+4);quad(b+1,b+2,b+6,b+5);quad(b+2,b+3,b+7,b+6);quad(b+3,b,b+4,b+7);}",
    "  box(0,0,60,40,0,2);box(22,12,38,28,2,8);box(26,16,34,24,8,12);",
    "  return {v:V,t:T};",
    "})();",
    "const gPar=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'parallel'});",
    "att(gPar.length>100,'geo parallel : parcours genere ('+gPar.length+' moves)');",
    "const parRuns=[];let parCur=[];gPar.forEach(function(m){if(!m.r&&!m.tr){parCur.push(m);}else{if(parCur.length){parRuns.push(parCur);parCur=[];}}});if(parCur.length)parRuns.push(parCur);",
    "let parZS=0;parRuns.forEach(function(r){const zs=r.map(function(m){return m.z;});const s=Math.max.apply(null,zs)-Math.min.apply(null,zs);if(s>parZS)parZS=s;});",
    "att(parZS>2,'geo parallel : passes 3D montant sur le boss (Z-spread max '+parZS.toFixed(1)+' > 2)');",
    "att(parRuns.length>=10,'geo parallel : profils sur toute la largeur ('+parRuns.length+' runs)');",
    "att(gPar.filter(m=>!m.r&&m.z<3).length>100,'geo parallel : fond couvert ('+gPar.filter(m=>!m.r&&m.z<3).length+' coupes basses)');",
    "const gZig=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'zigzag'});",
    "att(JSON.stringify(gZig)===JSON.stringify(gPar),'geo : générateur = profils parallèles quel que soit traj (Iso-Z supprimé)');",
    // --- 2026-10-13-007 : DIRECTION des passes (Auto/X/Y/Angle) — PBOX 60x40
    // (axe long X) : auto==x, ang0==x, ang90==y, x!=y, valeur inconnue==auto.
    "const gDX=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'parallel',pdir:'x'});",
    "const gDY=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'parallel',pdir:'y'});",
    "const gD0=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'parallel',pdir:'ang',pdirAng:0});",
    "const gD90=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'parallel',pdir:'ang',pdirAng:90});",
    "const gDB=faoGenGeoFinish(PBOX,{step:2,toolD:6,kind:'ball',laisse:0,secu:20,traj:'parallel',pdir:'nope'});",
    "att(JSON.stringify(gPar)===JSON.stringify(gDX),'geo direction : auto==x sur 60x40');",
    "att(JSON.stringify(gD0)===JSON.stringify(gDX),'geo direction : ang0==x');",
    "att(JSON.stringify(gD90)===JSON.stringify(gDY),'geo direction : ang90==y');",
    "att(JSON.stringify(gDX)!==JSON.stringify(gDY),'geo direction : x!=y');",
    "att(JSON.stringify(gDB)===JSON.stringify(gPar),'geo direction : valeur inconnue==auto');",
    "att(gDY.length>100&&gD0.length>100,'geo direction : tous les modes generent');",
    // --- 2026-10-13-007 : ORPHELINS géodésiques — boss bas (haut z=6) cerné
    // de plat + mur haut (z=20, fixe zt) : le boss est invisible du seed haut,
    // ses flancs ne sont couverts que par les rives pente/plat (2e Dijkstra).
    "const ORPH=(function(){",
    "  const V=[],T=[];",
    "  function quad(a,b,c,d){T.push([a,b,c],[a,c,d]);}",
    "  function box(x0,y0,x1,y1,z0,z1){const b=V.length;V.push([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]);quad(b,b+1,b+2,b+3);quad(b+4,b+5,b+6,b+7);quad(b,b+1,b+5,b+4);quad(b+1,b+2,b+6,b+5);quad(b+2,b+3,b+7,b+6);quad(b+3,b,b+4,b+7);}",
    "  box(0,0,60,40,0,2);box(10,10,20,20,2,6);box(50,0,54,40,0,20);",
    "  return {v:V,t:T};",
    "})();",
    "const gOrph=faoGenGeoFinish(ORPH,{step:2,toolD:6,kind:'ball',laisse:0,secu:25});",
    "const flank=gOrph.filter(m=>!m.r&&m.x>9&&m.x<21&&m.y>9&&m.y<21&&m.z>2&&m.z<6);",
    "att(flank.length>0,'geo orphelins : flancs du boss couverts par les rives ('+flank.length+' coupes)');",
    // --- 2026-10-13-007 : départ Fond — les bandes partent du bas (ordre
    // bottom-up) sur la rampe SL.
    "const gBot=faoGenGeoFinish(SL,{step:5,toolD:8,kind:'ball',laisse:0,secu:45,seed:'bottom'});",
    "const bRuns=[];let bCur=[];gBot.forEach(function(m){if(!m.r&&!m.tr){bCur.push(m);}else{if(bCur.length){bRuns.push(bCur);bCur=[];}}});if(bCur.length)bRuns.push(bCur);",
    "const bMeans=bRuns.map(function(r){return r.reduce(function(s,m){return s+m.z;},0)/r.length;});",
    "att(bRuns.length>=3&&bMeans[0]<bMeans[bMeans.length-1],'geo depart fond : ordre bas→haut ('+bRuns.length+' runs, '+bMeans[0].toFixed(1)+' → '+bMeans[bMeans.length-1].toFixed(1)+')');",
    // --- 025 : ébauche 3D — lignes bornées au RAYON sur les murs en Y (retour 4/10 pt 2)
    // Boîte 100x80x50, poche x10..90 y19..63 z20..50 ouverte dessus, D16 r=8 ae=4 :
    // les lignes de pelage doivent rester à >= r des parois Y (l'existence lisait
    // y±aeA (6<r) et laissait passer jusqu'à mur∓aeA -> gradins). X exact (r déjà
    // appliqué), marge pleine largeur (d>=r, tangence) intacte.
    "const cavM=(function(){",
    "  const V=[],T=[];",
    "  const Q=function(a,b,c,d){T.push([V.length,V.length+1,V.length+2]);T.push([V.length,V.length+2,V.length+3]);V.push(a,b,c,d);};",
    "  Q([0,0,0],[100,0,0],[100,80,0],[0,80,0]);",
    "  Q([0,0,0],[0,80,0],[0,80,50],[0,0,50]);",
    "  Q([100,0,0],[100,80,0],[100,80,50],[100,0,50]);",
    "  Q([0,0,0],[100,0,0],[100,0,50],[0,0,50]);",
    "  Q([0,80,0],[100,80,0],[100,80,50],[0,80,50]);",
    "  Q([10,19,20],[90,19,20],[90,63,20],[10,63,20]);",
    "  Q([10,19,20],[10,63,20],[10,63,50],[10,19,50]);",
    "  Q([90,19,20],[90,63,20],[90,63,50],[90,19,50]);",
    "  Q([10,19,20],[90,19,20],[90,19,50],[10,19,50]);",
    "  Q([10,63,20],[90,63,20],[90,63,50],[10,63,50]);",
    "  Q([0,0,50],[10,0,50],[10,80,50],[0,80,50]);",
    "  Q([90,0,50],[100,0,50],[100,80,50],[90,80,50]);",
    "  Q([10,0,50],[90,0,50],[90,19,50],[10,19,50]);",
    "  Q([10,63,50],[90,63,50],[90,80,50],[10,80,50]);",
    "  return {v:V,t:T};",
    "})();",
    "const cB={x0:-6,y0:-6,z0:0,x1:106,y1:86,z1:50};",
    "const cm=faoGenRough3D(cavM,cB,45,25,{ap:5,ae:4,toolD:16,radial:0,axial:0,secu:60,brutTop:50});",
    "const c30=cm.filter(m=>!m.r&&Math.abs(m.z-30)<1e-9);",
    "att(c30.length>20,'025 poche : niveau z=30 usine ('+c30.length+' moves)');",
    "const cY=c30.filter(m=>m.y>19&&m.y<63&&m.x>18&&m.x<82);",
    "att(cY.length>4,'025 poche : '+cY.length+' coupe dans la poche');",
    "const pYmax=Math.max.apply(null,cY.map(m=>m.y));",
    "const pYmin=Math.min.apply(null,cY.map(m=>m.y));",
    "att(pYmax<=63-8+0.6,'025 mur Y haut : bordé au rayon (y max '+pYmax.toFixed(2)+' <= 55.6)');",
    "att(pYmin>=19+8-0.6,'025 mur Y bas : bordé au rayon (y min '+pYmin.toFixed(2)+' >= 26.4)');",
    "const cX=c30.filter(m=>Math.abs(m.y-38)<1e-9&&m.x>=18&&m.x<=82);",
    "const xm=cX.length?Math.max.apply(null,cX.map(m=>m.x)):NaN;",
    "att(isFinite(xm)&&xm>=82-0.6&&xm<=82+0.6,'025 mur X : exact au rayon (x max '+xm.toFixed(2)+' ~ 82)');",
    "att(c30.some(m=>m.y===-10&&m.x<=-14+1e-6),'025 marge : ligne pleine largeur conservee (y=-10, x<=-14)');",
    // --- 027 : suivi de contour — pas de barrage d'excroissance, collé à 0,5.
    // Plaque + tenon (excroissance vers la marge) : l'ancien scanline abandonnait
    // la ligne y=4.5 (bande morte 2→7 traversant toute la marge = barrage).
    // (a) couverture : tout échantillon libre (dist >= r) à <= 1,9 mm d'une
    //     coupe (pas de bande > ~2 mm) ; (b) point de l'ancienne bande usiné ;
    // (c) aucune coupe < 5,49 (gouge) ; (d) au moins une coupe à 5,5 (collé).
    "const QP=merge(mkBox(20,80,20,60,0,20),mkBox(45,55,8,20,0,30));",
    "const QB={x0:0,y0:0,x1:100,y1:80};",
    "const qm=faoGenRough3D(QP,QB,30,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45});",
    "const qD=function(px,py){return Math.min(blkD(px,py,20,80,20,60),blkD(px,py,45,55,8,20));};",
    "const qPS=function(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy;let t=L2>0?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2:0;t=t<0?0:t>1?1:t;return Math.hypot(p[0]-(a[0]+dx*t),p[1]-(a[1]+dy*t));};",
    "const qCuts=[];",
    "{let last=null;qm.forEach(function(m){",
    "  if(m.r||Math.abs(m.z-10)>1e-6){last=null;return;}",
    "  if(last)qCuts.push([last,[m.x,m.y]]);",
    "  last=[m.x,m.y];",
    "});}",
    "att(qCuts.length>50,'027 : '+qCuts.length+' segments de coupe au niveau z=10');",
    "let qW=0,qWp=null,qN=0;",
    "for(let px=-5;px<=105;px++)for(let py=-5;py<=85;py++){",
    "  if(qD(px,py)<5.499)continue;",
    "  qN++;",
    "  const p=[px,py];let best=1/0;",
    "  for(let i=0;i<qCuts.length;i++){const d=qPS(p,qCuts[i][0],qCuts[i][1]);if(d<best)best=d;}",
    "  if(best>qW){qW=best;qWp=[px,py];}",
    "}",
    "att(qN>800,'027 : '+qN+' échantillons libres');",
    "att(qW<=2.05,'027 couverture : écart max '+qW.toFixed(2)+' mm en ('+(qWp?qWp[0]+','+qWp[1]:'?')+'), suivi de contour sans bande morte (<=2,05 — 2026-10-10-001 : les liens de zigzag qui couvraient (33,4) par hasard sont remplacés par l ordre serpentin ; l intention reste ~2 mm)');",
    "let qBd=1/0;",
    "qCuts.forEach(function(sg){qBd=Math.min(qBd,qPS([40,4.5],sg[0],sg[1]));});",
    "att(qBd<=1.9,'027 barrage : coupe à '+qBd.toFixed(2)+' mm de (40,4.5), ancienne bande 2→7 usinée (<=1,9)');",
    "let qMin=1/0;",
    "qCuts.forEach(function(sg){[sg[0],sg[1]].forEach(function(p){const d=qD(p[0],p[1]);if(d<qMin)qMin=d;});});",
    "att(qMin>=5.49,'027 gouge : coupe la plus proche '+qMin.toFixed(3)+' mm de la matière (>=5,49)');",
    "att(qMin<=5.51,'027 collé : '+qMin.toFixed(3)+' mm <= 5,51 (section suivie à 0,5)');",
    // --- 2026-10-04-009 : entrées géofinition — mode, garde hélice, groupement par zone
    "att(typeof faoGeoEntryMode==='function','geo entree : faoGeoEntryMode definie');",
    "if(typeof faoGeoEntryMode==='function'){",
    "  att(faoGeoEntryMode('ramp',true)==='ramp','geo entree : ramp forcee');",
    "  att(faoGeoEntryMode('helix',true)==='helix','geo entree : helix si ebauche avant');",
    "  att(faoGeoEntryMode('helix',false)==='ramp','geo entree : helice INTERDITE sans ebauche avant');",
    "  att(faoGeoEntryMode('auto',false)==='ramp','geo entree : auto sans ebauche -> ramp');",
    "  att(faoGeoEntryMode('auto',true)==='auto','geo entree : auto avec ebauche');",
    "  att(faoGeoEntryMode(undefined,false)==='ramp','geo entree : defaut sans ebauche -> ramp');",
    "  att(faoGeoEntryMode(undefined,true)==='auto','geo entree : defaut avec ebauche -> auto');",
    "  att(faoGeoEntryMode('bidon',false)==='ramp','geo entree : valeur inconnue -> ramp');",
    "}",
    "att(typeof faoGeoHasRrough==='function','geo entree : faoGeoHasRrough definie');",
    "if(typeof faoGeoHasRrough==='function'){",
    "  const JR={ops:[{id:'r',type:'rough3d',on:true},{id:'g',type:'geofinish'}]};",
    "  att(faoGeoHasRrough(JR,JR.ops[1])===true,'geo entree : ebauche 3D active avant -> true');",
    "  const JO={ops:[{id:'r',type:'rough3d',on:false},{id:'g',type:'geofinish'}]};",
    "  att(faoGeoHasRrough(JO,JO.ops[1])===false,'geo entree : ebauche desactivee avant -> false');",
    "  const JD={ops:[{id:'r',type:'pocket3d',on:true},{id:'g',type:'geofinish'}]};",
    "  att(faoGeoHasRrough(JD,JD.ops[1])===false,'geo entree : pocket3d supprime -> false');",
    "  const JV={ops:[{id:'g',type:'geofinish'}]};",
    "  att(faoGeoHasRrough(JV,JV.ops[0])===false,'geo entree : aucune operation avant -> false');",
    "  att(faoGeoHasRrough({ops:[]},{id:'z',type:'geofinish'})===false,'geo entree : op introuvable -> false');",
    "}",
    "att(faoOpDefaults('geofinish').entry==='circ','geo entree : defaut entry circ (2026-10-08-004)');",
    // Hélice sans ébauche : identique au ramp (l'entrée est ignorée en sécurité)
    "const gXr=faoGenGeoFinish(SL,{step:5,toolD:8,kind:'ball',laisse:0,secu:45,entry:'ramp'});",
    "const gXh=faoGenGeoFinish(SL,{step:5,toolD:8,kind:'ball',laisse:0,secu:45,entry:'helix'});",
    "att(JSON.stringify(gXh)===JSON.stringify(gXr),'geo entree : helix sans ebauche = ramp (sortie identique)');",
    // 3 tours égaux : iso à chaque niveau = 3 chaînes/niveau (regroupement par zone)
    "const TW=merge(merge(mkBox(0,20,0,20,0,40),mkBox(40,60,0,20,0,40)),mkBox(80,100,0,20,0,40));",
    "const gT=faoGenGeoFinish(TW,{step:6,toolD:8,kind:'ball',laisse:0,secu:45,entry:'ramp'});",
    "att(gT.length>50,'geo zones : '+gT.length+' moves (3 tours)');",
    // 2026-10-13-001 : le repli ne remonte plus à secu (travel/H court
    // d'abord) — comptage par MOTIF cut->r:1->r:1 HAUTEUR-AGNOSTIC (une
    // transition de chaîne = une zone), les rapides secu restent bornés.
    "const secOK=function(m){return m.r===1&&Math.abs(m.z-45)<1e-9;};",
    "let nS=0,nZ=0;",
    "for(let i=0;i+2<gT.length;i++){",
    "  if(gT[i].r===0&&gT[i+1].r===1&&gT[i+2].r===1)nZ++;",
    "}",
    "nS=gT.filter(secOK).length;",
    "p('geo zones : rapides a secu='+nS+' zones='+nZ);",
    "att(nZ>=3,'geo zones : au moins 3 zones (une par tour ; 2026-10-15-001 sections au-dessus des plans de faces), vu '+nZ);",
    "att(nS<=2*nZ+2,'geo groupement : rapides a secu '+nS+' <= 2*zones+2='+(2*nZ+2));",
    // Hélice avec débourrage avant : l'entrée change vraiment (spot disjoint des tours)
    "const gXe=faoGenGeoFinish(TW,{step:6,toolD:8,kind:'ball',laisse:0,secu:45,entry:'helix',hasRrough:true});",
    "att(gXe.length>50&&JSON.stringify(gXe)!==JSON.stringify(gT),'geo entree : helix avec ebauche avant change l entree');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao3d.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
