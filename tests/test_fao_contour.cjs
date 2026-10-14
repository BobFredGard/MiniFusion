// FAO — CONTOUR 2.5D sur PROFIL d'arêtes (2026-10-14-004, src/89-fao-contour.js).
// 1. bossage 40×20 (z 5..20) sur dalle : côté auto = extérieur, finition à
//    r de la paroi, jamais dedans, niveaux ap + passe de finition pleine
//    hauteur, sens avalant (horaire autour d'un bossage), entrée/sortie
//    tangentes côté libre ; attaches ; 2. poche (cadre de 4 blocs) : côté
//    auto = intérieur, sens trigo ; 3. forçages ; 4. défauts, sanitise,
//    contour rectangle historique inchangé.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const mkBox=function(x0,x1,y0,y1,z0,z1){return {v:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]};};",
    "const merge=function(){const o={v:[],t:[]};for(let a=0;a<arguments.length;a++){const B=arguments[a],off=o.v.length;o.v=o.v.concat(B.v);o.t=o.t.concat(B.t.map(function(t){return [t[0]+off,t[1]+off,t[2]+off];}));}return o;};",
    "const dRect=function(x,y,x0,x1,y0,y1){const dx=Math.max(x0-x,0,x-x1),dy=Math.max(y0-y,0,y-y1);if(dx>0||dy>0)return Math.hypot(dx,dy);return -Math.min(x-x0,x1-x,y-y0,y1-y);};",
    "const area=function(c){let a=0;for(let i=0;i+1<c.length;i++)a+=c[i].x*c[i+1].y-c[i+1].x*c[i].y;return a/2;};",
    // --- 1. bossage
    "const BOSS=merge(mkBox(0,100,0,60,0,5),mkBox(30,70,20,40,5,20));",
    "const loopB=[[30,20],[70,20],[70,40],[30,40],[30,20]];",
    "const o={toolD:6,secu:30,ztop:20,zbot:5,ap:6,ae:2.4,nR:2,fin:0.2,sens:'climb',overlap:1};",
    "const mv=faoGenContourProfil(BOSS,loopB,o);",
    "const dg=mv.diag||{};",
    "p('bossage : '+mv.length+' moves, diag '+JSON.stringify(dg));",
    "att(dg.side==='ext','bossage : côté auto extérieur (vu '+dg.side+')');",
    "const cut=mv.filter(m=>!m.r);",
    "const dmin=Math.min.apply(null,cut.map(m=>dRect(m.x,m.y,30,70,20,40)));",
    "att(dmin>=3-0.005,'bossage : outil jamais dans la paroi (d min '+dmin.toFixed(4)+' >= r 3)');",
    "const fz=cut.filter(m=>!m.ent&&Math.abs(m.z-5)<1e-6);",
    "const finD=fz.map(m=>dRect(m.x,m.y,30,70,20,40));",
    "att(fz.length>10&&finD.some(d=>Math.abs(d-3)<0.005),'bossage : finition au fond à r exact de la paroi');",
    "const zs={};cut.filter(m=>!m.ent).forEach(m=>{zs[m.z.toFixed(2)]=1;});",
    "att(zs['14.00']&&zs['8.00']&&zs['5.00'],'bossage : niveaux ap 14 / 8 / 5 (vu '+Object.keys(zs).join(' ')+')');",
    "const rough=cut.filter(m=>!m.ent&&Math.abs(m.z-14)<1e-6).map(m=>dRect(m.x,m.y,30,70,20,40));",
    "att(rough.length&&Math.min.apply(null,rough)>=3.2-0.005,'bossage : passes en Z à r + finition (d min '+(rough.length?Math.min.apply(null,rough).toFixed(3):'-')+')');",
    "att(rough.some(d=>Math.abs(d-5.6)<0.01),'bossage : 2e passe latérale à r + 0,2 + ae');",
    // une passe (suite de coupes non-ent à z 14 et d≈3,2) : sens horaire
    "const run=[];for(let i=0;i<mv.length;i++){const m=mv[i];if(!m.r&&!m.ent&&Math.abs(m.z-14)<1e-6&&Math.abs(dRect(m.x,m.y,30,70,20,40)-3.2)<0.01)run.push(m);else if(run.length>=4)break;else run.length=0;}",
    "att(run.length>=4&&area(run)<0,'bossage : avalant = sens horaire autour du bossage (aire '+(run.length?area(run).toFixed(0):'-')+')');",
    "att(cut.some(m=>m.ent),'bossage : entrées/sorties tangentes présentes');",
    "att(cut.filter(m=>m.ent).every(m=>dRect(m.x,m.y,30,70,20,40)>=3-0.01),'bossage : arcs d\\'entrée côté libre');",
    "att(mv[mv.length-1].r===1&&mv[mv.length-1].z===30,'bossage : retrait final à secu');",
    // opposition : sens trigo
    "const mvO=faoGenContourProfil(BOSS,loopB,Object.assign({},o,{sens:'opp'}));",
    "const runO=[];for(let i=0;i<mvO.length;i++){const m=mvO[i];if(!m.r&&!m.ent&&Math.abs(m.z-14)<1e-6&&Math.abs(dRect(m.x,m.y,30,70,20,40)-3.2)<0.01)runO.push(m);else if(runO.length>=4)break;else runO.length=0;}",
    "att(runO.length>=4&&area(runO)>0,'bossage : opposition = sens trigo');",
    // attaches : 4 ponts de 5 mm, hauteur 2 -> coupes relevées à z 7
    "const mvT=faoGenContourProfil(BOSS,loopB,Object.assign({},o,{tabN:4,tabW:5,tabH:2}));",
    "const t7=mvT.filter(m=>!m.r&&Math.abs(m.z-7)<1e-6).length;",
    "p('attaches : '+t7+' points relevés à z 7');",
    "att(t7>8,'attaches : passes relevées à Bas + hauteur ('+t7+' points à z 7)');",
    // milieu de l'attache n°1 : s = L/8 sur le périmètre (120) = 15 -> (45,20)
    "const nearTab=mvT.filter(m=>!m.r&&m.z<7-1e-6&&Math.abs(m.x-45)<2.5+3-0.2&&m.y<20);",
    "att(nearTab.length===0,'attaches : aucune coupe sous l\\'attache ('+nearTab.length+')');",
    "att(mv.filter(m=>!m.r&&Math.abs(m.z-7)<1e-6).length===0,'sans attache : aucun point à z 7');",
    // --- 2. poche : cadre de 4 blocs autour d'un trou 60×30
    "const FR=merge(mkBox(0,100,0,15,0,20),mkBox(0,100,45,60,0,20),mkBox(0,20,15,45,0,20),mkBox(80,100,15,45,0,20));",
    "const loopP=[[20,15],[80,15],[80,45],[20,45],[20,15]];",
    "const mvP=faoGenContourProfil(FR,loopP,{toolD:6,secu:30,ztop:20,zbot:0,ap:10,nR:1,fin:0,sens:'climb'});",
    "att(mvP.diag.side==='int','poche : côté auto intérieur (vu '+mvP.diag.side+')');",
    "const cP=mvP.filter(m=>!m.r);",
    "att(cP.length>10&&cP.every(m=>-dRect(m.x,m.y,20,80,15,45)>=3-0.005),'poche : outil dedans, à >= r des parois');",
    "const runP=[];for(let i=0;i<mvP.length;i++){const m=mvP[i];if(!m.r&&!m.ent&&Math.abs(m.z-10)<1e-6)runP.push(m);else if(runP.length>=4)break;else runP.length=0;}",
    "att(runP.length>=4&&area(runP)>0,'poche : avalant = sens trigo dans une poche');",
    // --- 3. forçage du côté
    "const mvF=faoGenContourProfil(BOSS,loopB,Object.assign({},o,{side:'int'}));",
    "att(mvF.diag.side==='int'&&mvF.filter(m=>!m.r&&!m.ent).every(m=>dRect(m.x,m.y,30,70,20,40)<0),'forçage : côté intérieur respecté');",
    // --- 4. op : défauts, sanitise, dispatch, ancien contour
    "const df=faoOpDefaults('contour');",
    "att(df.strat==='profil'&&df.limit&&df.limit.mode==='chain'&&df.sens==='avalant'&&df.fin===0.2,'défauts contour : profil en chaîne, avalant, finition 0,2');",
    "const sA={id:'a',type:'contour',strat:'profil',sens:'opp',cside:'int',tabN:3},sB={id:'b',type:'contour',strat:'profil',sens:'bidir',cside:'bidon'},sC={id:'c',type:'pocket',cside:'ext',tabN:2};",
    "faoSanitiseOps({ops:[sA,sB,sC]});",
    "att(sA.sens==='opp'&&sA.cside==='int'&&sA.tabN===3,'sanitise : contour profil garde sens/côté/attaches');",
    "att(!('sens' in sB)&&!('cside' in sB)&&!('cside' in sC)&&!('tabN' in sC),'sanitise : valeurs inconnues / hors contour purgées');",
    "const job=faoDefaultJob();job.stock={x0:0,y0:0,z0:0,x1:100,y1:60,z1:20};job.tools=[{id:'TC',d:6,kind:'flat'}];",
    "const op=faoOpDefaults('contour');op.id='c1';op.toolId='TC';op.limit={mode:'chain',loop:loopB,closed:true,nEdges:4,tangent:true,side:'center',extra:0};op.ztop=20;op.zbot=5;",
    "job.ops=[op];",
    "const keepAM=faoActiveMesh;faoActiveMesh=function(){return {mesh:BOSS,box:{x0:0,y0:0,x1:100,y1:60}};};",
    "let mvD=[];try{mvD=faoOpMoves(op,job);}catch(e){att(false,'dispatch : exception '+e.message);}",
    "faoActiveMesh=keepAM;",
    "att(mvD.filter(m=>!m.r).length>50&&mvD.filter(m=>!m.r).every(m=>dRect(m.x,m.y,30,70,20,40)>=3-0.005),'dispatch : contour généré, jamais dans la paroi (pas de re-clip par la zone)');",
    "att(op.geoDiag&&op.geoDiag.side==='ext','dispatch : côté détecté affiché (geoDiag)');",
    "att(/Contour 4 arêtes/.test(faoOpLabel(op)),'libellé : '+faoOpLabel(op));",
    "const oldC={id:'oc',on:true,toolId:'TC',type:'contour',x0:30,y0:20,x1:70,y1:40,ztop:20,zbot:5,ap:5,radial:0,axial:0};",
    "const mvR=faoOpMoves(oldC,job);",
    "att(mvR.length>10&&mvR.some(m=>!m.r&&Math.abs(m.x-27)<1e-6),'contour rectangle historique : inchangé');",
    "const all=function(root){const out=[];(function w(n){out.push(n);(n.children||[]).forEach(w);})(root);return out;};",
    "let card=null;try{card=faoOpCardElement(faoSetup(),faoOpDefaults('contour'),0);}catch(e){att(false,'fiche contour : exception '+e.message);}",
    "const txt=card?all(card).map(n=>String(n.textContent||'')).join('|'):'';",
    "att(card&&/Sélectionner le profil/.test(txt)&&/Attaches/.test(txt)&&txt.indexOf('Entrée / sortie')>=0&&/Côté et sens/.test(txt),'fiche contour : sections profil, côté, entrée/sortie, attaches');",
    "att(card&&!/Zone int/.test(txt)&&!all(card).some(n=>n.tagName==='SELECT'&&/Tout usiner/.test(String(n.textContent||''))),'fiche contour : ni zone ni îlot génériques');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return {txt:P.join(String.fromCharCode(10)),ko:ATT.length};"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_contour.js'});
  console.log(r.txt);
  process.exit(r.ko?1:0);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
