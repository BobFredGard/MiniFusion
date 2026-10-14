// FAO — POCHE 2.5D ADAPTATIVE (2026-10-14-004) : géométrie = arêtes du modèle
// (bord de la poche, op.limit chaîne, outil entier dedans), vidage par le
// moteur de l'Ébauche 3D (pelage, hélices, trochoïdes, fonds détectés), îlot
// = matière du solide. Pièce synthétique : dalle 100×60 (z 0..10), parois
// jusqu'à z 20 autour d'une poche 60×30 (x 20..80, y 15..45), bossage îlot
// 10×10 (x 45..55, y 25..35) jusqu'à z 18.
// 1. fond auto (faoPocketFloor) ; 2. dispatch : outil dedans, îlot épargné,
//    fond atteint, fond couvert ; 3. sans bord : rien ; 4. poche rectangle
//    historique inchangée ; 5. défauts, sanitise, libellé.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const mkBox=function(x0,x1,y0,y1,z0,z1){return {v:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]};};",
    "const merge=function(){const o={v:[],t:[]};for(let a=0;a<arguments.length;a++){const B=arguments[a],off=o.v.length;o.v=o.v.concat(B.v);o.t=o.t.concat(B.t.map(function(t){return [t[0]+off,t[1]+off,t[2]+off];}));}return o;};",
    "const PK=merge(mkBox(0,100,0,60,0,10),mkBox(0,20,0,60,10,20),mkBox(80,100,0,60,10,20),mkBox(20,80,0,15,10,20),mkBox(20,80,45,60,10,20),mkBox(45,55,25,35,10,18));",
    "const BX={x0:-5,y0:-5,x1:105,y1:65};",
    "const loop=[[20,15],[80,15],[80,45],[20,45],[20,15]];",
    // --- 1. fond auto
    "const zf=faoPocketFloor(PK,loop,0);",
    "att(Math.abs(zf-10)<1e-9,'fond auto : z 10 sous la boucle (vu '+zf+')');",
    "att(faoPocketFloor(PK,[[110,0],[120,0],[120,10],[110,10],[110,0]],-2)===-2,'fond auto : aucune face dedans -> bas du brut');",
    // --- 2. dispatch de bout en bout
    "const job=faoDefaultJob();",
    "job.stock={x0:-5,y0:-5,z0:0,x1:105,y1:65,z1:20};",
    "job.tools=[{id:'TP',d:6,kind:'flat'}];",
    "const op=faoOpDefaults('pocket');op.id='pk1';op.toolId='TP';",
    "op.limit={mode:'chain',loop:loop,closed:true,nEdges:4,tangent:true,side:'in',extra:0};",
    "op.ztop=20;op.zbot=zf;",
    "job.ops=[op];",
    "const keepAM=faoActiveMesh;faoActiveMesh=function(){return {mesh:PK,box:BX};};",
    "let mv=[];",
    "try{ mv=faoOpMoves(op,job); }catch(e){ att(false,'dispatch : exception '+e.message); }",
    "const cut=mv.filter(m=>!m.r);",
    "p('poche : '+mv.length+' moves, '+cut.length+' coupes, '+mv.filter(m=>m.r).length+' rapides');",
    "att(cut.length>200,'poche : parcours généré ('+cut.length+' coupes)');",
    // outil entier dans la poche (centre >= r = 3 des parois), tolérance 0,01
    "const out=cut.filter(m=>m.z<20-1e-6&&(m.x<23-0.01||m.x>77+0.01||m.y<18-0.01||m.y>42+0.01));",
    "att(out.length===0,'poche : outil entier dedans ('+out.length+' coupes hors x23..77/y18..42'+(out.length?', ex '+out[0].x.toFixed(2)+','+out[0].y.toFixed(2)+','+out[0].z.toFixed(2):'')+')');",
    // îlot épargné : sous z 18, centre à >= 3 du bossage
    "const dIs=function(x,y){const dx=Math.max(45-x,0,x-55),dy=Math.max(25-y,0,y-35);return Math.hypot(dx,dy);};",
    "const hit=cut.filter(m=>m.z<18-1e-6&&dIs(m.x,m.y)<3-0.01);",
    "if(hit.length)p('îlot : '+hit.slice(0,6).map(m=>[m.x.toFixed(2),m.y.toFixed(2),m.z.toFixed(2),dIs(m.x,m.y).toFixed(3),m.ent?'E':'',m.arc?'A':''].join(',')).join(' | ')+' dmin '+Math.min.apply(null,hit.map(m=>dIs(m.x,m.y))).toFixed(3));",
    "att(hit.length===0,'poche : îlot épargné ('+hit.length+' coupes à < r du bossage)');",
    // aucune surcoupe : disque outil (r 3) hors de chaque boîte du solide, à sa cote
    "const boxes=[[0,100,0,60,0,10],[0,20,0,60,10,20],[80,100,0,60,10,20],[20,80,0,15,10,20],[20,80,45,60,10,20],[45,55,25,35,10,18]];",
    "let gouge=0;for(let i=1;i<mv.length;i++){const a=mv[i-1],b=mv[i];if(b.r)continue;const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/0.2));",
    "  for(let k=0;k<=n;k++){const x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n,z=a.z+(b.z-a.z)*k/n;",
    "    for(const B of boxes){if(z>=B[5]-1e-6||z<B[4])continue;const d=Math.hypot(Math.max(B[0]-x,0,x-B[1]),Math.max(B[2]-y,0,y-B[3]));if(d<3-0.01)gouge++;}}}",
    "att(gouge===0,'poche : aucune surcoupe du solide ('+gouge+' échantillons dans la matière)');",
    // fond atteint (laisse axiale 0,2) sans passer dessous
    "const zmin=Math.min.apply(null,cut.map(m=>m.z));",
    "att(zmin>=10-1e-6&&zmin<=10.21,'poche : fond atteint à la laisse (z min '+zmin.toFixed(3)+', attendu 10..10,2)');",
    // fond couvert : chaque point du fond (hors îlot) à <= r d'une coupe du dernier niveau
    "const low=cut.filter(m=>m.z<=zmin+0.05);",
    "let miss=0,tot=0;",
    "for(let x=24;x<=76;x+=2)for(let y=19;y<=41;y+=2){if(dIs(x,y)<4)continue;tot++;",
    "  let ok=false;for(let i=1;i<mv.length&&!ok;i++){const a=mv[i-1],b=mv[i];if(b.r||a.z>zmin+0.05||b.z>zmin+0.05)continue;",
    "    const ex=b.x-a.x,ey=b.y-a.y,l2=ex*ex+ey*ey;let u=l2>0?((x-a.x)*ex+(y-a.y)*ey)/l2:0;u=Math.max(0,Math.min(1,u));",
    "    if(Math.hypot(a.x+ex*u-x,a.y+ey*u-y)<=3.01)ok=true;}",
    "  if(!ok)miss++;}",
    "p('poche : fond couvert '+(tot-miss)+'/'+tot+' points');",
    "att(miss===0,'poche : fond entièrement balayé ('+miss+'/'+tot+' points à > r d\\'une coupe du fond)');",
    // --- 3. sans bord : rien (jamais tout le brut)
    "const op0=faoOpDefaults('pocket');op0.id='pk0';op0.toolId='TP';op0.ztop=20;op0.zbot=0;",
    "let mv0=null;try{ mv0=faoOpMoves(op0,job); }catch(e){ att(false,'sans bord : exception '+e.message); }",
    "att(Array.isArray(mv0)&&mv0.filter(m=>!m.r).length===0,'poche sans bord : aucune coupe');",
    "faoActiveMesh=keepAM;",
    // --- 4. poche rectangle historique (sans strat) : inchangée
    "const oldP={id:'pr',on:true,toolId:'TP',type:'pocket',x0:20,y0:15,x1:80,y1:45,ztop:20,zbot:10,ap:5,ae:3,radial:0,axial:0};",
    "const mvR=faoOpMoves(oldP,job);",
    "att(mvR.length>20&&mvR.filter(m=>!m.r).every(m=>m.x>=23-1e-6&&m.x<=77+1e-6&&m.y>=18-1e-6&&m.y<=42+1e-6),'poche rectangle historique : générée, dans le rectangle');",
    // --- 5. défauts, sanitise, libellé, signature
    "const df=faoOpDefaults('pocket');",
    "att(df.strat==='adaptive'&&df.limit&&df.limit.mode==='chain'&&df.limit.side==='in','défauts poche : adaptative, bord en chaîne, outil dedans');",
    "att(df.finitParois===true&&df.sens==='avalant','défauts poche : finition des parois + avalant');",
    "const sA={id:'a',type:'pocket',strat:'adaptive',sens:'avalant',minipasses:3},sB={id:'b',type:'pocket',strat:'bidon',sens:'avalant'},sC={id:'c',type:'contour',strat:'adaptive'};",
    "faoSanitiseOps({ops:[sA,sB,sC]});",
    "att(sA.strat==='adaptive'&&sA.sens==='avalant'&&sA.minipasses===3,'sanitise : poche adaptative garde strat/sens/mini-passes');",
    "att(!('strat' in sB)&&!('sens' in sB)&&!('strat' in sC),'sanitise : strat inconnue / hors poche purgée, sens hors poche adaptative purgé');",
    "att(/Poche adaptative 4 arêtes/.test(faoOpLabel(op)),'libellé : '+faoOpLabel(op));",
    "att(faoMeshOp(op)&&!faoMeshOp(oldP),'cache : la poche adaptative dépend du solide, la rectangle non');",
    // fiche : section Bord de la poche + champs de l'ébauche
    "const all=function(root){const out=[];(function w(n){out.push(n);(n.children||[]).forEach(w);})(root);return out;};",
    "let card=null;try{card=faoOpCardElement(faoSetup(),faoOpDefaults('pocket'),0);}catch(e){att(false,'fiche poche : exception '+e.message);}",
    "const txt=card?all(card).map(n=>String(n.textContent||'')).join('|'):'';",
    "att(card&&/Bord de la poche/.test(txt)&&/Sélectionner le bord/.test(txt)&&/Finir parois/.test(txt),'fiche poche : bord + réglages de l ébauche');",
    "att(card&&!all(card).some(n=>n.tagName==='SELECT'&&/Tout usiner/.test(String(n.textContent||''))),'fiche poche : pas de sélecteur de zone générique');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return {txt:P.join(String.fromCharCode(10)),ko:ATT.length};"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_poche.js'});
  console.log(r.txt);
  process.exit(r.ko?1:0);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
