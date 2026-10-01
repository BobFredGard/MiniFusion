// FAO 3D : ébauche par tranches + finition iso-géodésique.
// Maillages synthétiques (boîte 10³, sphère lat-long) : slice, scanline,
// normales, Dijkstra, iso-courbes et génération rough3d/geofinish.
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
    "const rm=faoGenRough3D(CN,BX,40,0,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45});",
    "att(rm.length>10,'canal : '+rm.length+' moves');",
    "att(rm[0].r===1,'canal : 1er move rapide');",
    "att(rm.filter(m=>!m.r).every(m=>m.x>=25-1e-9&&m.x<=75+1e-9),'canal : centre dans [25,75], jamais dans les plots');",
    "att(rm.filter(m=>m.r).every(m=>m.z>=0-1e-9),'canal : rapides jamais sous le niveau');",
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
    "const rn=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,entry:'ramp',strategy:'zigzag'});",
    "att(rn[1].r===0&&Math.abs(rn[1].z-30)<1e-9,'rampe : 2e move au niveau 30');",
    // --- hélice forcée sur large (canal 50 >= 25)
    "const rh=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,entry:'helix',strategy:'zigzag'});",
    "att(rh[1].r===0&&rh[1].z<45&&rh[1].z>30,'helice forcee : 2e move en descente');",
    "att(rh.some(m=>!m.r&&Math.abs(m.z-30)<1e-9),'helice forcee : niveau 30 atteint');",
    // --- parois pièce : x=25 et x=75 suivis sur plusieurs lignes
    "att(rm.some(m=>!m.r&&Math.abs(m.x-25)<1e-9&&Math.abs(m.y-0)<1e-9),'paroi : (25,0)');",
    "att(rm.some(m=>!m.r&&Math.abs(m.x-25)<1e-9&&Math.abs(m.y-54)<1e-9),'paroi : (25,54) suivie');",
    "att(rm.some(m=>!m.r&&Math.abs(m.x-75)<1e-9),'paroi droite x=75');",
    // --- plats : au-dessus de la pièce (z=30 vide) = surfaçage pleine largeur
    "const rf=faoGenRough3D(mkBox(40,60,20,40,0,10),BX,30,10,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:35});",
    "const z20=rf.filter(m=>!m.r&&Math.abs(m.z-20)<1e-9);",
    "att(z20.some(m=>m.x<10)&&z20.some(m=>m.x>90),'plat z=20 : pleine largeur');",
    "att(rf.filter(m=>!m.r&&Math.abs(m.z-10)<1e-9).every(m=>m.x<=35+1e-9||m.x>=65-1e-9),'z=10 : rien dans [35,65] (pièce respectée)');",
    // --- marches : plots larges en bas, étroits en haut (raffinement auto)
    "const ST=merge(merge(mkBox(0,30,0,60,0,20),mkBox(70,100,0,60,0,20)),merge(mkBox(0,20,0,60,20,40),mkBox(80,100,0,60,20,40)));",
    "const mo=faoGenRough3D(ST,BX,40,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45});",
    "const z30=mo.filter(m=>!m.r&&Math.abs(m.z-30)<1e-9);",
    "att(z30.some(m=>m.x>23&&m.x<27),'morph : boucle externe ~25.5');",
    "att(z30.some(m=>m.x>44&&m.x<46),'morph : boucle interne ~45');",
    "const consec=function(arr){const out=[];for(let i=1;i<arr.length;i++)out.push([arr[i-1],arr[i]]);return out;};",
    "att(consec(z30).some(p=>!p[0].r&&!p[1].r&&Math.abs(p[0].x-p[1].x)<0.01&&Math.abs(p[0].y-p[1].y)>2&&Math.abs(p[0].x-50)>20),'morph : flanc vertical (suivi de forme)');",
    // --- raffinement : ap2=2 entre z=30 et z=20 (section 55 -> 35)
    "const mr=faoGenRough3D(ST,BX,40,0,{ap:10,ap2:2,ae:6,toolD:10,radial:0.5,axial:0,secu:45,entry:'ramp'});",
    "const zr={};mr.filter(m=>!m.r).forEach(m=>{zr[Math.round(m.z)]=1;});",
    "att(zr[26]&&zr[22],'raffinement : niveaux 26 et 22 présents');",
    "att(!zr[15],'pas de niveau parasite à 15');",
    // --- zigzag conservé en option : traverse complète à mi-poche
    "const mz=faoGenRough3D(ST,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'zigzag'});",
    "const mzz=mz.filter(m=>!m.r&&Math.abs(m.z-30)<1e-9);",
    "const zx=mzz.map(m=>m.x);",
    "att(Math.min.apply(null,zx)<=26&&Math.max.apply(null,zx)>=74,'zigzag : traverse [25.5,74.5]');",
    "att(mz.some(m=>!m.r&&m.arc),'zigzag : arcs dentree parois');",
    // --- régions : 2 colonnes disjointes sur 2 lignes = 2 régions
    "const RG=faoRoughRegions([{y:0,ivs:[{a:0,b:4},{a:6,b:10}]},{y:1,ivs:[{a:0,b:4},{a:6,b:10}]}]);",
    "att(RG.length===2&&RG.every(g=>g.length===2),'régions : 2 colonnes');",
    "att(RG.some(g=>g.every(q=>q.iv.b<=4+1e-9)),'région gauche : que [0,4]');",
    // --- zigzag : le vide entre intervalles n'est jamais coupé, liaison par sécu
    "const ZL=[];faoRoughZigzag([{y:0,ivs:[{a:0,b:4},{a:6,b:10}]}],5,10,0,30,30,6,'ramp',false,[],{x0:0,y0:0,x1:10,y1:10},null,null,ZL);",
    "att(ZL.filter(m=>!m.r).every(m=>m.x<=4+1e-9||m.x>=6-1e-9),'zigzag : jamais de coupe dans le vide ]4,6[');",
    "att(ZL.some(m=>m.r&&Math.abs(m.z-30)<1e-9),'zigzag : liaison par sécu');",
    // --- arrondi du morph : des arcs, bornes + surépaisseur tenues
    "const mro=faoGenRough3D(ST,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45});",
    "const mrr=faoRoundMoves(mro,2);",
    "att(mrr.some(m=>!m.r&&m.arc),'arrondi morph : arcs présents');",
    "const m30=mrr.filter(m=>!m.r&&Math.abs(m.z-30)<1e-9);",
    "att(m30.filter(m=>!m.arc).every(m=>m.x>=25.5-1e-9&&m.x<=74.5+1e-9),'arrondi : droites dans [25.5,74.5]');",
    "att(m30.every(m=>m.x>=25.5-0.9&&m.x<=74.5+0.9),'arrondi : bombe <= 0.9 (sagitta 90°)');",
    "att(mrr.filter(m=>!m.r&&m.arc).every(m=>Math.hypot(m.arc.i,m.arc.j)<=2.01),'arrondi : rayon <= 2');",
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
    "const sd=faoDijkstra(SP,faoSeedTop(SP));",
    "let dm=0;for(let i=0;i<sd.length;i++)if(sd[i]<1/0&&sd[i]>dm)dm=sd[i];",
    "p('dmax sphere R10 : '+dm.toFixed(2)+' (attendu ~31.4)');",
    "att(dm>25&&dm<33,'dmax dans [25,33]');",
    // --- finition géodésique : anneaux au pas 5, centres à R+4
    "const gm=faoGenGeoFinish(SP,{step:5,toolD:8,kind:'ball',laisse:0,secu:30,seed:'top'});",
    "att(gm.length>20,'geofinish : '+gm.length+' moves');",
    "const cuts=gm.filter(m=>!m.r);",
    "const rr=cuts.map(m=>Math.hypot(m.x,m.y,m.z));",
    "const rmoy=rr.reduce((a,b)=>a+b,0)/rr.length;",
    "p('rayon moyen centres : '+rmoy.toFixed(2)+' (attendu ~14)');",
    "att(rmoy>13&&rmoy<15,'centres outil à R+4');",
    "att(cuts[0].z>5,'1er anneau près du sommet : z='+cuts[0].z.toFixed(1));",
    // --- morph + hélice centrale sur sphère (équateur large, SP défini plus haut)
    "const mh=faoGenRough3D(SP,{x0:-12,y0:-12,x1:12,y1:12},20,0,{ap:10,ae:4,toolD:4,radial:0.5,axial:0,secu:30});",
    "att(mh.some(m=>!m.r&&m.z>10&&m.z<30),'morph sphere : descente helice 30->10');",
    // --- adaptive : pelage petit pas + stay-down + trochoide (canal CN, BX)
    "const ad=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "att(ad.length>50,'adaptive : '+ad.length+' moves');",
    "att(ad[0].r===1,'adaptive : 1er move rapide');",
    "att(ad.filter(m=>!m.r).every(m=>m.x>=25-1e-9&&m.x<=75+1e-9),'adaptive : jamais dans les plots');",
    "att(ad.some(m=>!m.r&&m.z>30&&m.z<45),'adaptive : descente helice');",
    "att(ad.filter(m=>m.r).length<=4,'adaptive : stay-down, '+ad.filter(m=>m.r).length+' rapides');",
    "const mo1=faoGenRough3D(CN,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'morph'});",
    "att(ad.filter(m=>!m.r).length>mo1.filter(m=>!m.r).length,'adaptive : plus de passes qu en morph (petit pas)');",
    // --- adaptive en goulet 15 mm (D10) : trochoides, pas de droite pleine largeur
    "const NB=merge(mkBox(0,42.5,0,60,0,40),mkBox(57.5,100,0,60,0,40));",
    "const az=faoGenRough3D(NB,BX,40,30,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "att(az.length>20,'adaptive goulet : '+az.length+' moves');",
    "att((function(){const s={};az.filter(m=>!m.r).forEach(m=>{s[Math.round(m.y*10)/10]=1;});return Object.keys(s).length;})()>24,'adaptive goulet : oscillation Y (trochoide)');",
    "att(az.some(m=>!m.r&&m.arc),'adaptive goulet : arcs G2/G3 presents');",
    "att(az.filter(m=>!m.r&&m.arc).every(m=>{const q=Math.hypot(m.arc.i,m.arc.j);return q>=0.4&&q<=3.1;}),'adaptive goulet : rayons trochoides coherents');",
    "att(az.filter(m=>!m.r&&m.arc).every(m=>!m.arc.cw),'adaptive goulet : trochoides CCW (G3)');",
    // --- adaptive : ombre du brut restant (queue d'aronde : large en haut)
    "const DV=merge(mkBox(40,60,0,60,0,20),mkBox(30,70,0,60,20,40));",
    "const BX2={x0:0,y0:-5,x1:100,y1:65};",
    "const av=faoGenRough3D(DV,BX2,40,0,{ap:10,ae:6,toolD:10,radial:0.5,axial:0,secu:45,strategy:'adaptive'});",
    "const c10=av.filter(m=>!m.r&&Math.abs(m.z-10)<1e-9);",
    "att(c10.length>0,'adaptive surplomb : niveau bas usine');",
    "att(c10.every(m=>m.x<=24.6||m.x>=75.4),'adaptive surplomb : jamais sous le porte-a-faux [30,70]');",
    "att(av.some(m=>!m.r&&Math.abs(m.z-30)<1e-9),'adaptive surplomb : niveau haut usine');",
    // --- adaptive : micro-entree en fente ~D (12 mm, D10 : ni helice ni rampe)",
    "const NS=merge(mkBox(0,44,0,60,0,40),mkBox(56,100,0,60,0,40));",
    "const an=faoGenRough3D(NS,BX,40,30,{ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,strategy:'adaptive'});",
    "att(an.length>10&&an[0].r===1,'adaptive fente : '+an.length+' moves, demarre rapide');",
    "att(an.filter(m=>!m.r).every(m=>m.x>=48.9&&m.x<=51.1),'adaptive fente : reste dans la fente');",
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
    "att(c20.every(m=>m.x<=24.6||m.x>=75.4),'adaptive voile : voile fin jamais traverse');",
    "att(Math.abs(faoHelixSpot(VL,50,30,3,5.5,20,40,[0,10,24.3,24.9])-26.9)<1e-9,'helice plans : depart au-dessus du voile');",
    // --- dispatch via ops (maillage actif nul en VM -> [] sans planter)
    "const j3=faoDefaultJob();j3.ops=[{id:'x',on:true,toolId:'T3',type:'geofinish',step:1,laisse:0,seed:'top'}];",
    "att(Array.isArray(faoOpMoves(j3.ops[0],j3)),'dispatch geofinish sans maillage : pas de plantage');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao3d.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
