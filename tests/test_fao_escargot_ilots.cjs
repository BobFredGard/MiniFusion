// FAO 3D — V0.23.15 : Ébauche 3D, mode ESCARGOT ('anneaux') — spirale puis
// anneaux parallèles aux bords qui tournent autour des îlots, de l'intérieur
// vers les faces ; l'ancien mode ('escargot') devient le TROCHOÏDAL, inchangé.
// Fixture : bloc 100×80×20 (maillage en colonnes de 10 mm), poche x[10,90]
// y[10,70] fond z=5, îlot x[40,60] y[30,50] jusqu'au dessus (z=20).
// Contrôles au niveau z=13 (ap 7 depuis 20) :
//  1. aucune coupe à moins de r (laisse comprise) de l'îlot ni des parois ;
//  2. toute la poche hors laisse est balayée par le disque d'outil (cases
//     0,5 mm, outil D10 → rayon 5) : aucun reste ;
//  3. l'îlot est ENTOURÉ : des coupes à r + ae autour de lui dans les 4 directions ;
//  4. brut restant : une boîte de brut plus basse que la pièce (dessus z=15,5)
//     → au niveau 13 rien ne change hors poche, et aucun anneau dans l'air ;
//  5. Trochoïdal ('escargot') toujours généré, différent de l'Escargot ;
//  6. sanitise : 'anneaux' gardé, inconnu → 'escargot' ; création → 'anneaux'.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- maillage en colonnes (hauteur par case de 10 mm), sommets partagés
    "const C=10,NX=10,NY=8;",
    "const hAt=function(i,j){if(i<0||j<0||i>=NX||j>=NY)return 0;",
    "  const x=i*C+5,y=j*C+5;if(x>10&&x<90&&y>10&&y<70&&!(x>40&&x<60&&y>30&&y<50))return 5;return 20;};",
    "const V=[],T=[],K={};",
    "const vid=function(x,y,z){const k=x+','+y+','+z;if(K[k]===undefined){K[k]=V.length;V.push([x,y,z]);}return K[k];};",
    "const quad=function(a,b,c,d){const A=vid.apply(null,a),B=vid.apply(null,b),Cc=vid.apply(null,c),Dd=vid.apply(null,d);T.push([A,B,Cc],[A,Cc,Dd]);};",
    "for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const h=hAt(i,j),x0=i*C,y0=j*C,x1=x0+C,y1=y0+C;",
    "  quad([x0,y0,h],[x1,y0,h],[x1,y1,h],[x0,y1,h]);",       // dessus (normale +z)
    "  quad([x0,y0,0],[x0,y1,0],[x1,y1,0],[x1,y0,0]);",       // dessous (−z)
    // parois vers les voisins plus bas (ou l'extérieur, hauteur 0)
    "  let hn=hAt(i+1,j);if(hn<h)quad([x1,y0,hn],[x1,y1,hn],[x1,y1,h],[x1,y0,h]);",
    "  hn=hAt(i-1,j);if(hn<h)quad([x0,y1,hn],[x0,y0,hn],[x0,y0,h],[x0,y1,h]);",
    "  hn=hAt(i,j+1);if(hn<h)quad([x1,y1,hn],[x0,y1,hn],[x0,y1,h],[x1,y1,h]);",
    "  hn=hAt(i,j-1);if(hn<h)quad([x0,y0,hn],[x1,y0,hn],[x1,y0,h],[x0,y0,h]);}",
    "const FR={v:V,t:T};",
    "const BX={x0:0,y0:0,x1:100,y1:80};",
    "const BASE={ap:7,ae:4,toolD:10,radial:0.5,axial:0.5,secu:25,minipasses:0,entry:'circ',sens:'avalant'};",
    "const gen=function(o){const z={};for(const k in BASE)z[k]=BASE[k];if(o)for(const k in o)z[k]=o[k];",
    "  return faoGenRough3D(FR,BX,20,5,z);};",
    "const atZ=function(mv,z){const o=[];for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];",
    "  if(!b.r&&!a.r&&Math.abs(a.z-z)<1e-6&&Math.abs(b.z-z)<1e-6)o.push([a,b]);}return o;};",
    // distance d'un point au rectangle (positive dehors)
    "const dRect=function(x,y,x0,y0,x1,y1){const dx=Math.max(x0-x,0,x-x1),dy=Math.max(y0-y,0,y-y1);",
    "  if(dx>0||dy>0)return Math.hypot(dx,dy);return -Math.min(x-x0,x1-x,y-y0,y1-y);};",
    "const dIsl=function(x,y){return dRect(x,y,40,30,60,50);};",
    "const dWall=function(x,y){return -dRect(x,y,10,10,90,70);};", // > 0 dans la poche
    "const Z=13,r=5.5;",
    "const mvA=gen({mode:'anneaux'});",
    "const sA=atZ(mvA,Z);",
    "att(sA.length>200,'escargot : niveau z=13 ('+sA.length+' segments de coupe)');",
    // 1. laisse
    "let mI=1/0,mW=1/0;sA.forEach(function(s){[s[0],s[1]].forEach(function(m){",
    "  if(m.x>10&&m.x<90&&m.y>10&&m.y<70){mI=Math.min(mI,dIsl(m.x,m.y));mW=Math.min(mW,dWall(m.x,m.y));}});});",
    "att(mI>=r-0.05,'escargot : laisse îlot '+mI.toFixed(2)+' >= '+r);",
    "att(mW>=r-0.05,'escargot : laisse paroi '+mW.toFixed(2)+' >= '+r);",
    // 2. couverture
    "const swept=function(segs){const g=0.5,nx=Math.round(100/g)+1,ny=Math.round(80/g)+1,cov=new Uint8Array(nx*ny),R=4.95;",
    "  segs.forEach(function(s){const a=s[0],b=s[1],L=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(L/0.25));",
    "    for(let k=0;k<=n;k++){const x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n;",
    "      for(let j=Math.max(0,Math.floor((y-R)/g));j<=Math.min(ny-1,Math.ceil((y+R)/g));j++)",
    "      for(let i=Math.max(0,Math.floor((x-R)/g));i<=Math.min(nx-1,Math.ceil((x+R)/g));i++)",
    "        if((i*g-x)*(i*g-x)+(j*g-y)*(j*g-y)<=R*R)cov[j*nx+i]=1;}});",
    "  let miss=0,ex=null;for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=i*g,y=j*g;",
    "    if(dWall(x,y)<0.6||dIsl(x,y)<0.6||dRect(x,y,15.5,15.5,84.5,64.5)>4.9)continue;if(!cov[j*nx+i]){miss++;if(!ex)ex=[x,y];}}",
    "  return {miss:miss,ex:ex};};",
    "const cvA=swept(sA);",
    "att(cvA.miss===0,'escargot : poche entièrement balayée ('+cvA.miss+' cases restantes'+(cvA.ex?', ex. '+cvA.ex.join(','):'')+')');",
    // 3. îlot entouré
    "const ring=[[50,30-r-4],[50,50+r+4],[40-r-4,40],[60+r+4,40]];",
    // points échantillonnés le long des segments (les anneaux droits sont simplifiés)
    "const pts=[];sA.forEach(function(s){const a=s[0],b=s[1],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/0.5));",
    "  for(let k=0;k<=n;k++)pts.push([a.x+(b.x-a.x)*k/n,a.y+(b.y-a.y)*k/n]);});",
    "ring.forEach(function(q){let best=1/0;pts.forEach(function(m){best=Math.min(best,Math.hypot(m[0]-q[0],m[1]-q[1]));});",
    "  att(best<=2.5,'escargot : anneau autour de l îlot près de ('+q.join(',')+') : '+best.toFixed(2)+' mm');});",
    // tours autour de l'îlot : secteurs couverts par les coupes à r+1..r+6 de l'îlot
    "const bins=new Uint8Array(36);pts.forEach(function(m){const d=dIsl(m[0],m[1]);if(d>r+1&&d<r+6){",
    "  bins[Math.floor(((Math.atan2(m[1]-40,m[0]-50)+Math.PI)/(2*Math.PI))*36)%36]=1;}});",
    "let nb=0;for(let i=0;i<36;i++)nb+=bins[i];",
    "att(nb===36,'escargot : l\\'îlot est entouré ('+nb+'/36 secteurs)');",
    // 4. brut plus bas que la pièce : dessus 15,5 → niveau 13 seul dans le brut
    "const mvS=gen({mode:'anneaux',stockBox:{x0:0,y0:0,x1:100,y1:80},brutTop:15.5});",
    "att(mvS.length>0,'escargot + brut : parcours généré ('+mvS.length+')');",
    // 4b. limite de zone « au centre » à x = 70 (pas une paroi) : l'outil va jusqu'à
    // la limite — anneau de bord ; la poche est balayée jusqu'à x = 70 + rayon
    "const mvZ=gen({mode:'anneaux',zoneAt:function(x,y){return x<=70;}});",
    "const sZ=atZ(mvZ,Z);let xMax=-1/0;sZ.forEach(function(s){xMax=Math.max(xMax,s[0].x,s[1].x);});",
    "att(xMax<=70+1e-6&&xMax>=69.5,'zone x<=70 : coupe jusqu à la limite ('+xMax.toFixed(2)+')');",
    "const g2=0.5;let missZ=0;for(let y=16;y<=64;y+=g2)for(let x=16;x<=74.5;x+=g2){if(dIsl(x,y)<0.6)continue;",
    "  let ok=false;for(let q=0;q<sZ.length&&!ok;q++){const a=sZ[q][0],b=sZ[q][1],dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy;",
    "    let t=l2>0?((x-a.x)*dx+(y-a.y)*dy)/l2:0;t=Math.max(0,Math.min(1,t));if(Math.hypot(a.x+t*dx-x,a.y+t*dy-y)<=4.95)ok=true;}",
    "  if(!ok)missZ++;}",
    "att(missZ===0,'zone x<=70 : poche balayée jusqu à x = 74,5 ('+missZ+' cases restantes)');",
    // 5. Trochoïdal inchangé et différent
    "const mvT=gen({mode:'escargot'});",
    "const sT=atZ(mvT,Z);",
    "att(sT.length>100,'trochoïdal : niveau z=13 ('+sT.length+')');",
    "att(JSON.stringify(mvT)!==JSON.stringify(mvA),'trochoïdal et escargot différents');",
    "const cvT=swept(sT);",
    // 6. sanitise / création
    "const o1={id:'a1',type:'rough3d',minipasses:0,mode:'anneaux'};faoSanitiseOps({ops:[o1]});",
    "att(o1.mode==='anneaux','sanitise : anneaux gardé');",
    "const o2={id:'a2',type:'rough3d',minipasses:0,mode:'xx'};faoSanitiseOps({ops:[o2]});",
    "att(o2.mode==='escargot','sanitise : inconnu -> escargot (trochoïdal)');",
    "att(faoOpDefaults('rough3d').mode==='anneaux','création : escargot (anneaux)');",
    // tracé SVG (contrôle visuel facultatif)
    "const svg=function(segs,col){return segs.map(function(s){return '<line x1=\"'+s[0].x+'\" y1=\"'+(80-s[0].y)+'\" x2=\"'+s[1].x+'\" y2=\"'+(80-s[1].y)+'\" stroke=\"'+col+'\" stroke-width=\"0.3\"/>';}).join('');};",
    "globalThis.__svg='<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-5 -5 220 90\" width=\"1320\" height=\"540\"><rect x=\"40\" y=\"30\" width=\"20\" height=\"20\" fill=\"#ccc\"/><rect x=\"10\" y=\"10\" width=\"80\" height=\"60\" fill=\"none\" stroke=\"#999\"/>'+svg(sA,'#c00')+",
    "  '<g transform=\"translate(110,0)\"><rect x=\"40\" y=\"30\" width=\"20\" height=\"20\" fill=\"#ccc\"/><rect x=\"10\" y=\"10\" width=\"80\" height=\"60\" fill=\"none\" stroke=\"#999\"/>'+svg(sT,'#06c')+'</g></svg>';",
    "p('escargot z=13 : '+sA.length+' segments, laisse îlot '+mI.toFixed(2)+', paroi '+mW.toFixed(2)+', reste '+cvA.miss+' | trochoïdal : '+sT.length+' segments, reste '+cvT.miss);",
    "p('mouvements : escargot '+mvA.length+' (rapides '+mvA.filter(function(m){return m.r;}).length+') | trochoïdal '+mvT.length+' (rapides '+mvT.filter(function(m){return m.r;}).length+')');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_escargot_ilots.js'});
  console.log(r);
  if(process.env.SVG_OUT)require('fs').writeFileSync(process.env.SVG_OUT,vm.runInContext('globalThis.__svg',ctx));
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
