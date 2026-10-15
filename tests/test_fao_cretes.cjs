// FAO — Crêtes constantes façon Fusion 360 (2026-10-14-001, src/89-fao-cretes.js).
// Rétro-ingénierie de Exemples/cav.txt : anneaux FERMÉS à distance constante
// sur la surface depuis chaque bord de zone, fronts qui se rencontrent à
// mi-chemin, restes en boucles concentriques, sens unique avalant, liaisons
// en S au contact, descente outil (jamais de surcoupe).
// 1. cuvette synthétique (champ de hauteur) avec îlot : 2 fronts, anneaux
//    fermés, pas sur le fond, sens, séquences, aucune surcoupe ;
// 2. outils : torique sans surcoupe, fraise droite refusée sur pente ;
// 3. briques : FMM ≈ distance exacte (plan), drop-cutter boule (sphère/plan) ;
// 4. op : défauts, sanitise, signature ;
// 5. cavité réelle (fixture OCCT de Exemples/Cavité Usinage.miniFusion).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm'),fs=require('fs'),path=require('path');
const FIX=path.join(__dirname,'fixtures');
(async()=>{
  const {ctx,sandbox}=loadApp();
  sandbox.__cavMesh=JSON.parse(fs.readFileSync(path.join(FIX,'cavite_usinage_mesh.json'),'utf8'));
  sandbox.__cavOp=JSON.parse(fs.readFileSync(path.join(FIX,'cavite_usinage_op.json'),'utf8'));
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- cuvette : champ de hauteur 120×80, fond z=0 dans |x|<35,|y|<15
    // (coins arrondis), paroi à 45° jusqu'à z=10, plateau haut au-delà.
    "const hf=function(x,y){const ax=Math.max(0,Math.abs(x)-25),ay=Math.max(0,Math.abs(y)-5);",
    "  const d=Math.hypot(ax,ay)-10;return Math.max(0,Math.min(10,d));};",
    "const mkHF=function(f,X,Y,h){const v=[],t=[];const nx=Math.round(2*X/h),ny=Math.round(2*Y/h);",
    "  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=-X+i*h,y=-Y+j*h;v.push([x,y,f(x,y)]);}",
    "  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;t.push([a,b,d]);t.push([a,d,c]);}",
    "  return {v:v,t:t};};",
    "const cuv=mkHF(hf,60,40,1);",
    // zone : intérieur du rectangle 100×60 ET hors îlot central 30×10
    "const zone=function(x,y){return Math.abs(x)<=50&&Math.abs(y)<=30&&!(Math.abs(x)<15&&Math.abs(y)<5);};",
    "const t0=Date.now();",
    "const mv=faoGenScallop(cuv,{step:1,toolD:6,kind:'ball',laisse:0,secu:30,zoneAt:zone});",
    "const dt=Date.now()-t0;",
    "const dg=mv.diag||{};",
    "p('cuvette : '+mv.length+' moves, '+dt+' ms, diag '+JSON.stringify({f:dg.fronts,r:dg.rings,rest:dg.rest,seq:dg.seq,tris:dg.tris}));",
    "att(mv.length>1000,'cuvette : parcours non vide ('+mv.length+')');",
    "att(dg.fronts===2,'cuvette : 2 fronts (îlot + contour), vu '+dg.fronts);",
    "att(dg.rings&&dg.rings.length===2&&dg.rings[0]>=5&&dg.rings[1]>=5,'cuvette : anneaux sur les 2 fronts '+JSON.stringify(dg.rings));",
    "att(mv[0].r===1&&Math.abs(mv[0].z-30)<1e-9,'cuvette : 1er move rapide à secu');",
    "att(mv[mv.length-1].r===1&&mv[mv.length-1].z>=30-1e-9,'cuvette : retrait final à secu');",
    // aucune surcoupe : chaque point de coupe/liaison au-dessus de la descente outil
    "const dr=faoScDropper(cuv,'ball',6,3,0);",
    "let gouge=0,gx=null;",
    "for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(b.r)continue;",
    "  const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/0.25));",
    "  for(let k=0;k<=n;k++){const x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n,z=a.z+(b.z-a.z)*k/n;",
    "    const g=dr.tip(x,y)-z;if(g>gouge){gouge=g;gx=[x,y,z];}}}",
    "p('cuvette : surcoupe max '+gouge.toFixed(4)+' mm'+(gx?' en '+gx.map(c=>c.toFixed(2)).join(','):''));",
    "att(gouge<0.005,'cuvette : aucune surcoupe > 0,005 mm, cordes comprises (vu '+gouge.toFixed(4)+')');",
    // rapides : jamais sous la descente outil
    "let rbad=0;for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(!b.r)continue;",
    "  const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/0.5));",
    "  for(let k=0;k<=n;k++){const x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n,z=a.z+(b.z-a.z)*k/n;if(dr.tip(x,y)>z+1e-6)rbad++;}}",
    "att(rbad===0,'cuvette : rapides au-dessus de la matière ('+rbad+' échantillons dessous)');",
    // pas sur le fond plat : coupes à y=0 côté x>0, z≈0 (fond), écarts ≈ 1
    "const xs=[];for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(b.r||b.tr||b.ent)continue;",
    "  if((a.y<0)!==(b.y<0)&&a.x>15&&a.x<33){const u=-a.y/(b.y-a.y);const z=a.z+(b.z-a.z)*u;if(Math.abs(z)<0.05)xs.push(a.x+(b.x-a.x)*u);}}",
    "xs.sort((a,b)=>a-b);const gaps=[];for(let i=1;i<xs.length;i++)gaps.push(xs[i]-xs[i-1]);",
    "p('cuvette : '+xs.length+' anneaux traversent y=0 sur le fond ; écarts '+gaps.map(g=>g.toFixed(2)).join(' '));",
    "att(xs.length>=10,'cuvette : >=10 anneaux sur le fond à y=0 (vu '+xs.length+')');",
    "att(gaps.length&&gaps.every(g=>g>0.6&&g<1.25),'cuvette : écart entre anneaux ≈ pas (0,6..1,25) : '+gaps.map(g=>g.toFixed(2)).join(' '));",
    // sens : anneau autour de l'îlot horaire (aire < 0), côté usiné à droite
    "const loopsOf=function(mv){const L=[];let cur=null;for(let i=0;i<mv.length;i++){const m=mv[i];",
    "  if(m.r||m.tr||m.ent){if(cur&&cur.length>20)L.push(cur);cur=null;continue;}(cur||(cur=[])).push(m);}if(cur&&cur.length>20)L.push(cur);return L;};",
    "const area=function(c){let a=0;for(let i=0;i<c.length;i++){const p0=c[i],q=c[(i+1)%c.length];a+=p0.x*q.y-q.x*p0.y;}return a/2;};",
    "const LL=loopsOf(mv);",
    "const inner=LL.filter(c=>c.every(q=>Math.abs(q.z)<0.05)&&c.some(q=>Math.abs(q.x)<20));",
    "att(inner.length>=3&&inner.every(c=>area(c)<0),'cuvette : anneaux du fond (autour de l\\'îlot) en sens horaire');",
    "const outer=LL.filter(c=>c.every(q=>q.z>9.5));",
    "att(outer.length>=1&&outer.every(c=>area(c)>0),'cuvette : anneaux du haut (bord extérieur) en sens anti-horaire');",
    "att(dg.seq<=12,'cuvette : peu de séquences (anneaux enchaînés au contact) : '+dg.seq);",
    // liaisons en S au contact présentes
    "att(mv.filter(m=>m.tr).length>50,'cuvette : liaisons au contact (tr) présentes');",
    "att(mv.filter(m=>m.r).length<=4*dg.seq+4,'cuvette : rapides limités aux sauts entre séquences ('+mv.filter(m=>m.r).length+')');",
    // GLISSEMENTS (2026-10-14-003) : entre séquences, l'outil reste au contact
    // seulement vers une trace au pas (2026-10-14-006 : <= 1,5 pas, sinon remontée)
    "p('cuvette : glissements '+(dg.slides||0)+', remontées '+(dg.lifts||0)+', pointes '+(dg.tips||0));",
    // 2026-10-14-006 : transitions SEULEMENT entre deux traces au pas (<= 1,5 pas en travers, + l'avance de la liaison en S <= max(pas, 0,75·D)) ; au-delà : remontée Z rapide sur place puis rapide vers la nouvelle entrée
    "const trJ=function(mv,lim){let bad=0,mx=0;for(let i=1;i<mv.length;i++){if(!mv[i].tr||mv[i-1].tr)continue;const a=mv[i-1];let j=i;while(j+1<mv.length&&mv[j+1].tr)j++;const b=mv[j];const d=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);if(d>mx)mx=d;if(d>lim)bad++;i=j;}return {bad:bad,mx:mx};};",
    "const tj=trJ(mv,Math.hypot(1.5,4.5)+0.5);",
    "att(tj.bad===0,'cuvette : transitions au pas seulement (max '+tj.mx.toFixed(2)+' mm, '+tj.bad+' trop longues)');",
    "const vUp=function(mv){let bad=0;for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(b.r&&!a.r&&i>1&&(Math.abs(b.x-a.x)>1e-6||Math.abs(b.y-a.y)>1e-6))bad++;}return bad;};",
    "att(vUp(mv)===0,'cuvette : chaque remontée part en Z sur place ('+vUp(mv)+' rapides obliques depuis la coupe)');",
    // bidir : différent, même couverture
    "const mvB=faoGenScallop(cuv,{step:1,toolD:6,kind:'ball',laisse:0,secu:30,zoneAt:zone,sens:'bidir'});",
    "att(JSON.stringify(mvB)!==JSON.stringify(mv),'cuvette : bidir différent du sens unique');",
    // COUVERTURE à pas fin (2026-10-14-002, retour : « avec un pas à 0,35 il y
    // a des manques ») : chaque point de la surface outil dans la zone doit
    // avoir une passe à ≤ 0,75 pas (milieu entre deux passes = 0,5 pas) — pied
    // de paroi (creux vif) et rencontre des fronts compris.
    "const cover=function(mv,st){const P=[];for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(a.r||b.r)continue;",
    "  const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/0.1));for(let k=0;k<n;k++){const t=k/n;P.push([a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t]);}}",
    "  const H=new Map();P.forEach(q=>{const k=Math.floor(q[0])*100003+Math.floor(q[1]);let L=H.get(k);if(!L)H.set(k,L=[]);L.push(q);});",
    "  let n=0,m1=0,m2=0;for(let y=-29.5;y<=29.5;y+=0.25)for(let x=-49.5;x<=49.5;x+=0.25){if(!zone(x,y))continue;const z=dr.tip(x,y);n++;let b=1e9;",
    "    const ci=Math.floor(x),cj=Math.floor(y);for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){const L=H.get((ci+a)*100003+cj+c);if(!L)continue;for(const q of L){const d=(q[0]-x)**2+(q[1]-y)**2+(q[2]-z)**2;if(d<b)b=d;}}",
    "    b=Math.sqrt(b);if(b>0.75*st)m1++;if(b>1.5*st)m2++;}",
    "  return {n:n,m1:m1/n,m2:m2/n};};",
    "const mv5=faoGenScallop(cuv,{step:0.5,toolD:6,kind:'ball',laisse:0,secu:30,zoneAt:zone});",
    "const cv5=cover(mv5,0.5);",
    "p('cuvette pas 0,5 : '+mv5.length+' moves, manque >0,75 pas '+(cv5.m1*100).toFixed(2)+' %, >1,5 pas '+(cv5.m2*100).toFixed(2)+' %');",
    "att(cv5.m1<0.01,'couverture pas 0,5 : < 1 % de points à > 0,75 pas d\\'une passe (vu '+(cv5.m1*100).toFixed(2)+' %)');",
    "att(cv5.m2===0,'couverture pas 0,5 : aucun point à > 1,5 pas (vu '+(cv5.m2*100).toFixed(2)+' %)');",
    // --- 2. outils -----------------------------------------------------------
    "const mvT=faoGenScallop(cuv,{step:1.5,toolD:10,kind:'bull',cornerR:2,laisse:0,secu:30,zoneAt:zone});",
    "const drT=faoScDropper(cuv,'bull',10,2,0);let gT=0;",
    "for(let i=1;i<mvT.length;i++){const b=mvT[i];if(b.r)continue;const g=drT.tip(b.x,b.y)-b.z;if(g>gT)gT=g;}",
    "att(mvT.length>500&&gT<0.02,'torique D10 R2 : parcours sans surcoupe (max '+gT.toFixed(4)+')');",
    "const mvF=faoGenScallop(cuv,{step:1,toolD:6,kind:'flat',laisse:0,secu:30,zoneAt:zone});",
    "att(mvF.length===0,'fraise droite sur pente : refusée (0 move)');",
    // laisse : la pointe reste au-dessus de la surface d'au moins ~laisse
    "const mvL=faoGenScallop(cuv,{step:2,toolD:6,kind:'ball',laisse:0.5,secu:30,zoneAt:zone});",
    "let lmin=1/0;for(let i=1;i<mvL.length;i++){const b=mvL[i];if(b.r||b.tr||b.ent)continue;const g=b.z-dr.tip(b.x,b.y);if(g<lmin)lmin=g;}",
    "att(lmin>0.4,'laisse 0,5 : pointe ≥ 0,4 au-dessus de la descente sans laisse (vu '+lmin.toFixed(3)+')');",
    // --- 3. briques ----------------------------------------------------------
    // FMM sur un plan 40×40 maillé 1 mm : distance au bord gauche x=-20 = x+20
    "const pl=mkHF(function(){return 0;},20,20,1);",
    "const vt=[];for(let i=0;i<pl.v.length;i++)vt.push([]);pl.t.forEach((t,i)=>{vt[t[0]].push(i);vt[t[1]].push(i);vt[t[2]].push(i);});",
    "const dd=new Float64Array(pl.v.length).fill(1/0);pl.v.forEach((q,i)=>{if(q[0]<=-20+1e-9)dd[i]=0;});",
    "faoScFMM(pl.v,pl.t,vt,dd,new Uint8Array(pl.v.length).fill(1));",
    "let ferr=0;pl.v.forEach((q,i)=>{const e=Math.abs(dd[i]-(q[0]+20));if(e>ferr)ferr=e;});",
    "att(ferr<1e-6,'FMM : front plan exact sur maillage régulier (err '+ferr.toExponential(2)+')');",
    // source ponctuelle : erreur relative bornée (Dijkstra ferait ~8 %)
    "const dd2=new Float64Array(pl.v.length).fill(1/0);let c0=0;pl.v.forEach((q,i)=>{if(q[0]===0&&q[1]===0)c0=i;});dd2[c0]=0;",
    "faoScFMM(pl.v,pl.t,vt,dd2,new Uint8Array(pl.v.length).fill(1));",
    "let rerr=0;pl.v.forEach((q,i)=>{const r=Math.hypot(q[0],q[1]);if(r>8){const e=Math.abs(dd2[i]-r)/r;if(e>rerr)rerr=e;}});",
    "p('FMM source ponctuelle : erreur relative max '+(rerr*100).toFixed(2)+' %');",
    "att(rerr<0.10,'FMM : source ponctuelle, erreur relative < 10 % (Dijkstra : 41 %) (vu '+(rerr*100).toFixed(2)+' %)');",
    // drop-cutter boule sur plan z=0 : pointe = 0 ; sur sphère (rayon 20)
    "const drp=faoScDropper(pl,'ball',6,3,0);",
    "att(Math.abs(drp.tip(3.3,-2.7))<1e-9,'drop boule sur plan : pointe à 0');",
    "const drpL=faoScDropper(pl,'ball',6,3,0.5);",
    "att(Math.abs(drpL.tip(3.3,-2.7)-0.5)<1e-9,'drop boule + laisse 0,5 : pointe à 0,5');",
    "const drf=faoScDropper(pl,'flat',6,0,0);",
    "att(Math.abs(drf.tip(1,1))<1e-9,'drop fraise droite sur plan : 0');",
    // --- 4. op : défauts, sanitise, signature --------------------------------
    "const df=faoOpDefaults('geofinish');",
    "att(df.traj==='scallop'&&df.sens==='avalant','défauts geofinish : traj scallop + avalant');",
    "const oS={id:'a',type:'geofinish',traj:'scallop'},oP={id:'b',type:'geofinish',traj:'parallel'},oX={id:'c',type:'geofinish',traj:'iso',seed:'bottom',stayMax:40},oN={id:'e',type:'geofinish'},oR={id:'d',type:'rough3d',traj:'scallop'};",
    "faoSanitiseOps({ops:[oS,oP,oX,oR,oN]});",
    "att(oS.traj==='scallop'&&oP.traj==='parallel','sanitise : scallop/parallel conservés');",
    "att(oX.traj==='scallop'&&oN.traj==='scallop'&&!('seed' in oX),'sanitise : Iso-Z supprimé — iso / absent -> scallop, départ purgé');",
    "att(!('stayMax' in oX)&&!('traj' in oR),'sanitise : stayMax (retiré) purgé, traj purgé hors geofinish');",
    "att(JSON.stringify(faoOpSig({id:'a',type:'geofinish',traj:'scallop'}))!==JSON.stringify(faoOpSig({id:'a',type:'geofinish',traj:'parallel'})),'sig : scallop ≠ parallel (régénération à la bascule)');",
    // 2026-10-14-009 : la Finition demande le maillage FIN (congés lisses) ;
    // l'Ébauche 3D garde le maillage d'outillage (parcours 005 inchangé)
    "const keepAM=faoActiveMesh;const asked=[];faoActiveMesh=function(s,fine){asked.push(!!fine);return null;};",
    "try{const jf=faoDefaultJob();const og=faoOpDefaults('geofinish');og.id='g1';jf.ops=[og];faoOpMoves(og,jf);const orr=faoOpDefaults('rough3d');orr.id='r1';jf.ops=[orr];asked.push('|');faoOpMoves(orr,jf);}catch(e){}",
    "faoActiveMesh=keepAM;",
    "const ia=asked.indexOf('|');",
    "att(asked.slice(0,ia).some(x=>x===true),'Finition : maillage fin demandé ('+JSON.stringify(asked)+')');",
    "att(asked.slice(ia+1).every(x=>x===false),'Ébauche 3D : maillage d outillage habituel ('+JSON.stringify(asked)+')');",
    "att(typeof faoMeshFromBodyFine==='function'&&faoMeshFromBodyFine({kind:'body'})===null,'maillage fin : repli null sans solide exact');",
    "{const kb=(typeof bodies!=='undefined')?bodies:undefined,kF=faoMeshFromBodyFine,kM=faoMeshFromBody;",
    "  try{bodies=[{id:'bF',kind:'body',visible:true}];",
    "    faoMeshFromBodyFine=function(){return {v:[[0,0,0],[1,0,0],[0,1,0]],t:[[0,1,2]]};};",
    "    faoMeshFromBody=function(){return {v:[[0,0,0],[1,0,0],[0,1,0],[1,1,0]],t:[[0,1,2],[1,3,2]]};};",
    "    const mf=faoActiveMesh({},true),mc=faoActiveMesh({});",
    "    att(mf&&mf.mesh.t.length===1&&mc&&mc.mesh.t.length===2,'faoActiveMesh : fin pour la Finition ('+(mf&&mf.mesh.t.length)+'), outillage sinon ('+(mc&&mc.mesh.t.length)+')');",
    "  }finally{bodies=kb;faoMeshFromBodyFine=kF;faoMeshFromBody=kM;}}",
    // --- 5. cavité réelle (Exemples/Cavité Usinage.miniFusion, maillage OCCT)
    "const job={tools:__cavOp.tools};const op=__cavOp.op;",
    "const zc=faoZoneCtx(op,job);const tool=faoToolById(job,op.toolId);",
    "const t1=Date.now();",
    "const mc=faoGenScallop({v:__cavMesh.v,t:__cavMesh.t},{step:+op.step||1,toolD:tool.d,kind:tool.kind,cornerR:tool.cornerR,laisse:0,secu:55,ztop:op.ztop,zbot:op.zbot,zoneAt:zc.at});",
    "const dt1=Date.now()-t1;const dc=mc.diag||{};",
    "p('cavité : '+mc.length+' moves, '+dt1+' ms, diag '+JSON.stringify({f:dc.fronts,r:dc.rings,rest:dc.rest,seq:dc.seq,tris:dc.tris}));",
    "att(dc.fronts===2,'cavité : 2 fronts (îlot + bord haut), vu '+dc.fronts);",
    "att(dc.rings&&dc.rings[0]>=18&&dc.rings[1]>=18,'cavité : ≥18 anneaux par front (Fusion 30/24) '+JSON.stringify(dc.rings));",
    "att(dc.rest>=8,'cavité : boucles de reste dans les coins (Fusion : lentilles) — '+dc.rest);",
    "att(dc.seq<=25,'cavité : séquences ≤ 25 (Fusion 7) — '+dc.seq);",
    "att(dt1<20000,'cavité : génération < 20 s (vu '+dt1+' ms)');",
    "const drc=faoScDropper({v:__cavMesh.v,t:__cavMesh.t},'ball',tool.d,tool.cornerR,0);let gc=0;",
    "for(let i=1;i<mc.length;i+=1){const b=mc[i];if(b.r)continue;const g=drc.tip(b.x,b.y)-b.z;if(g>gc)gc=g;}",
    "att(gc<0.02,'cavité : aucune surcoupe aux points (max '+gc.toFixed(4)+')');",
    "const zbad=mc.filter(m=>!m.r&&!m.ent&&!m.tr&&!zc.at(m.x,m.y)&&!zc.at(m.x+0.06,m.y)&&!zc.at(m.x-0.06,m.y)&&!zc.at(m.x,m.y+0.06)&&!zc.at(m.x,m.y-0.06)).length;",
    "const zb2=mc.map((m,i)=>[m,i]).filter(q=>{const m=q[0];return !m.r&&!m.ent&&!m.tr&&!zc.at(m.x,m.y)&&!zc.at(m.x+0.06,m.y)&&!zc.at(m.x-0.06,m.y)&&!zc.at(m.x,m.y+0.06)&&!zc.at(m.x,m.y-0.06);});",
    "if(zb2.length)p('hors zone : '+zb2.slice(0,8).map(q=>q[1]+':'+q[0].x.toFixed(2)+','+q[0].y.toFixed(2)+','+q[0].z.toFixed(2)).join(' '));",
    "att(zbad===0,'cavité : coupes dans la zone (limite ∧ ¬îlot) — '+zbad+' points dehors');",
    // glissements (2026-10-14-003) : restent dans la zone (jamais sur l'îlot)
    "const tbad=mc.filter(m=>m.tr&&!zc.at(m.x,m.y)&&!zc.at(m.x+0.06,m.y)&&!zc.at(m.x-0.06,m.y)&&!zc.at(m.x,m.y+0.06)&&!zc.at(m.x,m.y-0.06)).length;",
    "p('cavité : glissements '+(dc.slides||0)+', remontées '+(dc.lifts||0)+', pointes '+(dc.tips||0));",
    "att(tbad===0,'cavité : glissements dans la zone — '+tbad+' points dehors');",
    "const tjc=trJ(mc,Math.hypot(1.5,4.5)+0.5);",
    "att(tjc.bad===0,'cavité : transitions au pas seulement (max '+tjc.mx.toFixed(2)+' mm)');",
    "att(vUp(mc)===0,'cavité : remontées en Z sur place');",
    "att(dc.seq<=15,'cavité : anneaux enchaînés au pas (séquences '+dc.seq+')');",
    "att((dc.tips||0)>=4,'cavité : pointes des lentilles finies (aller-retour sur la crête) — '+dc.tips);",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return {txt:P.join(String.fromCharCode(10)),ko:ATT.length};"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_cretes.js'});
  console.log(r.txt);
  process.exit(r.ko?1:0);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
