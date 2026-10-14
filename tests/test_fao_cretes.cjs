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
    "att(gouge<0.02,'cuvette : aucune surcoupe > 0,02 mm (vu '+gouge.toFixed(4)+')');",
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
    // bidir : différent, même couverture
    "const mvB=faoGenScallop(cuv,{step:1,toolD:6,kind:'ball',laisse:0,secu:30,zoneAt:zone,sens:'bidir'});",
    "att(JSON.stringify(mvB)!==JSON.stringify(mv),'cuvette : bidir différent du sens unique');",
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
    "const oS={id:'a',type:'geofinish',traj:'scallop'},oP={id:'b',type:'geofinish',traj:'parallel'},oX={id:'c',type:'geofinish',traj:'bidon'},oR={id:'d',type:'rough3d',traj:'scallop'};",
    "faoSanitiseOps({ops:[oS,oP,oX,oR]});",
    "att(oS.traj==='scallop'&&oP.traj==='parallel','sanitise : scallop/parallel conservés');",
    "att(!('traj' in oX)&&!('traj' in oR),'sanitise : valeur inconnue / hors geofinish purgées');",
    "att(JSON.stringify(faoOpSig({id:'a',type:'geofinish',traj:'scallop'}))!==JSON.stringify(faoOpSig({id:'a',type:'geofinish'})),'sig : scallop ≠ iso (régénération à la bascule)');",
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
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return {txt:P.join(String.fromCharCode(10)),ko:ATT.length};"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_cretes.js'});
  console.log(r.txt);
  process.exit(r.ko?1:0);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
