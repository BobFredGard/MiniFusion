// FAO 2026-10-13-001 — zone par ESQUISSE : le contour d'une esquisse (plan
// horizontal, sans îlot/trou/cercle) devient la limite d'usinage — toutes
// opérations (ébauche 3D, crêtes constantes, 2.5D, perçage). La boucle est
// extraite au choix (faoSketchLoop) puis RE-EXTRAITE à chaque fin de rejeu
// (faoSketchReplay) : édition -> nouvelle zone ; esquisse perdue ou devenue
// inutilisable -> stale + alerte, l'ANCIEN contour reste appliqué (jamais une
// zone qui s'ouvre en silence). Mêmes règles d'extraction que la poche
// d'entrée (-005) : contours FORTS, dédoublonnage, un seul contour unique.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const J=JSON.stringify;",
    // ============ 1. doc : rectangle XY 40x30 (harnais esquisse) ===========
    "const rect={id:'zs1',name:'Zone',plane:'XY',visible:true,",
    "  points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},",
    "            {id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],",
    "  constraints:[],dims:[],seq:10};",
    "ensureSketchBasis(rect);doc.sketches=[rect];",
    // ============ 2. extraction : aire, CCW, refus ========================
    "const w=faoSketchLoop('zs1');",
    "att(!!w&&w.length>=4,'extract : rectangle -> boucle '+(w?w.length:0)+' pts');",
    "let sw=0,i;",
    "if(w)for(i=0;i<w.length;i++){const p=w[i],q=w[(i+1)%w.length];sw+=p[0]*q[1]-q[0]*p[1];}",
    "att(w&&Math.abs(sw/2-1200)<1e-6,'extract : aire 1200 mm2 (obtenu '+(w?(sw/2).toFixed(3):'?')+')');",
    "att(w&&sw>0,'extract : contour normalise CCW');",
    "att(faoSketchLoop('introuvable')===null,'extract : esquisse absente -> null');",
    "const vert={id:'zv',name:'V',plane:'XZ',visible:true,",
    "  points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},",
    "            {id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'}],",
    "  constraints:[],dims:[],seq:10};",
    "ensureSketchBasis(vert);doc.sketches=[rect,vert];",
    "att(faoSketchLoop('zv')===null,'extract : plan XZ (non horizontal) -> null');",
    "const isl={id:'zi',name:'I',plane:'XY',visible:true,",
    "  points:{O:{x:0,y:0},a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:30},d:{x:0,y:30},",
    "          e:{x:10,y:10},f:{x:20,y:10},g:{x:20,y:20},h:{x:10,y:20}},",
    "  entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'},",
    "            {id:'l3',t:'line',p1:'c',p2:'d'},{id:'l4',t:'line',p1:'d',p2:'a'},",
    "            {id:'m1',t:'line',p1:'e',p2:'f'},{id:'m2',t:'line',p1:'f',p2:'g'},",
    "            {id:'m3',t:'line',p1:'g',p2:'h'},{id:'m4',t:'line',p1:'h',p2:'e'}],",
    "  constraints:[],dims:[],seq:10};",
    "ensureSketchBasis(isl);doc.sketches=[rect,isl];",
    "att(faoSketchLoop('zi')===null,'extract : îlot dedans -> null (repli sûr)');",
    "const circ={id:'zc',name:'C',plane:'XY',visible:true,",
    "  points:{O:{x:0,y:0}},entities:[{id:'c1',t:'circle',pc:'O',r:15}],",
    "  constraints:[],dims:[],seq:10};",
    "ensureSketchBasis(circ);doc.sketches=[rect,circ];",
    "att(faoSketchLoop('zc')===null,'extract : cercle seul -> null (décor ambigu)');",
    "doc.sketches=[rect];",
    // ============ 3. sanitise =============================================
    "const oOk={id:'s1',type:'pocket',limit:{mode:'sketch',sk:'zs1',loop:[[0,0],[40,0],[40,30],[0,30]],side:'center',extra:0}};",
    "const oMid={id:'s2',type:'pocket',limit:{mode:'sketch',sk:'',loop:[]}};",
    "const oNoSk={id:'s3',type:'pocket',limit:{mode:'sketch',loop:[[0,0],[1,0],[1,1]]}};",
    "const oBog={id:'s4',type:'pocket',limit:{mode:'gouffre'}};",
    "const oL2={id:'s5',type:'pocket',limit2:{mode:'sketch',sk:'zs1',loop:[[0,0],[1,0],[1,1]]}};",
    "faoSanitiseOps({tools:[{id:'T1',num:1,d:10,kind:'flat'}],ops:[oOk,oMid,oNoSk,oBog,oL2]});",
    "att(!!oOk.limit&&oOk.limit.sk==='zs1','sanitise : limite esquisse valide conservee');",
    "att(!!oMid.limit&&oMid.limit.sk==='','sanitise : choix en cours (sk vide) conserve');",
    "att(!oNoSk.limit,'sanitise : sk manquant -> purge');",
    "att(!oBog.limit,'sanitise : mode inconnu -> purge');",
    "att(!oL2.limit2,'sanitise : esquisse refusee en zone int (hors perimetre)');",
    // ============ 4. faoZoneCtx ===========================================
    "const job=faoDefaultJob();",
    "job.stock={x0:-5,y0:-5,z0:0,x1:85,y1:65,z1:18};",
    "const opK={id:'zk',on:true,toolId:'T1',type:'pocket',ap:4,ae:5,ztop:18,zbot:4,",
    "  limit:{mode:'sketch',sk:'zs1',loop:w,side:'center',extra:0}};",
    "const zk=faoZoneCtx(opK,job);",
    "att(!!zk&&zk.chain===true,'ctx : esquisse -> contexte en mode poly (chain)');",
    "if(zk){",
    "  att(zk.at(20,15)===true,'ctx : point dedans -> usinable');",
    "  att(zk.at(50,15)===false,'ctx : point hors (x>40) -> NON usinable');",
    "  att(zk.at(-1,-1)===false,'ctx : hors esquisse -> NON usinable');",
    "  att(zk.cross({x:-5,y:15},{x:50,y:15})===true,'ctx : traverse le bord -> cross');",
    "  att(zk.cross({x:10,y:10},{x:30,y:20})===false,'ctx : trajet interieur -> pas de cross');",
    "}",
    // ============ 5. perçage =============================================
    "const opD={id:'zd',type:'drill',toolId:'T1',pts:[[20,15],[50,15],[5,5]],limit:opK.limit};",
    "const kp=faoLimitDrillPts(opD,10);",
    "att(kp.length===2,'drill : trou hors esquisse exclu ('+kp.length+'/3 restants)');",
    // ============ 6. libellé + sig ========================================
    "att(faoOpLabel(opK,job).indexOf('[limite]')>=0,'fiche : tag [limite] present');",
    "const opKS={id:'zk2',toolId:'T1',type:'pocket',limit:Object.assign({},opK.limit,{stale:true})};",
    "att(faoOpLabel(opKS,job).indexOf('⚠')>=0,'fiche : stale affiche ⚠');",
    "const opKL={id:'zk3',toolId:'T1',type:'pocket',limit:{mode:'sketch',sk:'zs1',loop:[[0,0],[1,0]],side:'center',extra:0}};",
    "att(faoOpLabel(opKL,job).indexOf('[limite]')<0,'fiche : loop <3 pts -> pas de tag');",
    "const sgA={id:'x',type:'pocket',limit:{mode:'sketch',sk:'zs1',loop:w,side:'center',extra:0}};",
    "const sgB={id:'x',type:'pocket',limit:{mode:'sketch',sk:'zs1',loop:w,side:'center',extra:0,stale:true}};",
    "att(J(faoOpSig(sgA))===J(faoOpSig(sgB)),'sig : stale hors cle (etat UI)');",
    "const sgC=JSON.parse(J(sgA));sgC.limit.loop=[[0,0],[41,0],[41,30],[0,30]];",
    "att(J(faoOpSig(sgA))!==J(faoOpSig(sgC)),'sig : la boucle entre dans la cle');",
    // ============ 7. ZoneCuts de bout en bout =============================
    "const mvK=[{r:1,x:-10,y:15,z:8},{r:0,x:-10,y:15,z:1},{r:0,x:100,y:15,z:1}];",
    "const zcK=faoZoneCuts(mvK,opK,job,8);",
    "const ck=zcK.filter(function(m){return !m.r;});",
    "att(ck.length>0,'ZoneCuts : coupe conservee ('+ck.length+' pts)');",
    "att(ck.every(function(m){return faoLimInside(m.x,m.y,opK.limit,5);}),'ZoneCuts : aucune coupe hors contour');",
    "att(ck.some(function(m){return m.x>1&&m.x<39;}),'ZoneCuts : partie interieure bien usinee');",
    // ============ 8. affichage : faoSegClipper ============================
    "const fnK=faoSegClipper(opK,job);",
    "att(typeof fnK==='function','SegClipper : composite esquisse present');",
    "const skSegs=[];",
    "if(typeof fnK==='function')fnK(-10,15,1,100,15,1,function(a,b,c,d,e,f){skSegs.push([a,d]);});",
    "att(skSegs.length>0&&skSegs.every(function(s){return s[0]>=-0.001&&s[1]<=40.001;}),",
    "  'SegClipper : morceaux visibles bornes au contour [0,40] ('+J(skSegs)+')');",
    // ============ 9. rejeu : faoSketchReplay ==============================
    "const S0=faoSetup();if(S0.ops.indexOf(opK)<0)S0.ops.push(opK);",
    "let n=-2;try{ n=faoSketchReplay(); }catch(e){ n=-99; }",
    "att(n>=0,'replay : execution sans exception (n='+n+')');",
    "att((opK.limit.loop||[]).length>=4&&opK.limit.stale!==true,'replay : boucle extraite, pas de stale');",
    "const bAv=J(opK.limit.loop);",
    "rect.points.b.x=50;rect.points.c.x=50;",
    "n=-2;try{ n=faoSketchReplay(); }catch(e){ n=-99; }",
    "att(n>0,'replay : edition esquisse -> changement detecte (n='+n+')');",
    "att(J(opK.limit.loop)!==bAv,'replay : boucle mise a jour');",
    "let sN=0;for(i=0;i<opK.limit.loop.length;i++){const p=opK.limit.loop[i],q=opK.limit.loop[(i+1)%opK.limit.loop.length];sN+=p[0]*q[1]-q[0]*p[1];}",
    "att(Math.abs(sN/2-1500)<1e-6,'replay : aire 1500 apres edition (obtenu '+(sN/2).toFixed(3)+')');",
    "const bStale=J(opK.limit.loop);",
    "doc.sketches=[];",
    "n=-2;try{ n=faoSketchReplay(); }catch(e){ n=-99; }",
    "att(opK.limit.stale===true,'replay : esquisse perdue -> stale');",
    "att(J(opK.limit.loop)===bStale,'replay : boucle inchangee conservee (zone jamais ouverte en silence)');",
    "doc.sketches=[rect];",
    "n=-2;try{ n=faoSketchReplay(); }catch(e){ n=-99; }",
    "att(opK.limit.stale===false,'replay : esquisse restauree -> stale efface');",
    "try{const ix=S0.ops.indexOf(opK);if(ix>=0)S0.ops.splice(ix,1);}catch(e){}",
    // ============ 10. fiche UI : sélecteur Esquisse =======================
    "const all=function(root){const out=[];(function w(n){out.push(n);(n.children||[]).forEach(w);})(root);return out;};",
    "const txt=function(root){return all(root).map(function(n){return String(n.textContent||'');}).join('|');};",
    "const opU={id:'u',type:'pocket',ap:4,ae:5,ztop:18,zbot:4,x0:0,y0:0,x1:10,y1:10,toolId:'T1'};",
    "const card0=faoOpCardElement(faoSetup(),opU,0);",
    "const zsel=all(card0).filter(function(n){return n.tagName==='SELECT'&&",
    "  Array.prototype.map.call(n.children||[],function(o){return String(o.textContent||'');}).join('|').indexOf('Tout usiner')>=0;})[0];",
    "att(!!zsel,'fiche : selecteur Zone present');",
    "if(zsel){",
    "  att(Array.prototype.map.call(zsel.children,function(o){return String(o.textContent);}).join('|').indexOf('Esquisse')>=0,",
    "    'fiche : option Esquisse presente');",
    "  att(zsel.value==='all','fiche : defaut Tout usiner');",
    "  zsel.value='sketch';zsel.onchange();",
    "  att(opU.limit&&opU.limit.mode==='sketch'&&opU.limit.sk==='','fiche : bascule -> zone esquisse (sk vide)');",
    "}",
    "const card1=faoOpCardElement(faoSetup(),opU,0);",
    "const skSel=all(card1).filter(function(n){return n.tagName==='SELECT'&&",
    "  Array.prototype.map.call(n.children||[],function(o){return String(o.textContent||'');}).join('|').indexOf('choisir une esquisse')>=0;})[0];",
    "att(!!skSel,'fiche : selecteur Esquisse present');",
    "if(skSel){",
    "  att(skSel.value==='','fiche : aucun choix au depart');",
    "  skSel.value='zs1';skSel.onchange();",
    "  att(opU.limit.sk==='zs1'&&(opU.limit.loop||[]).length>=4,'fiche : choix -> boucle extraite ('+(opU.limit.loop||[]).length+' pts)');",
    "}",
    "const card2=faoOpCardElement(faoSetup(),opU,0);",
    "const t2=txt(card2);",
    "att(t2.indexOf('Boucle de')>=0,'fiche : statut boucle affiche');",
    "att(t2.indexOf('zone NON appliquée')<0,'fiche : pas d alerte une fois valide');",
    "att(t2.indexOf('Marge')>=0,'fiche : rangée Outil/Marge presente pour la zone esquisse');",
    "opU.limit.sk='zv';opU.limit.loop=[];opU.limit.stale=false;",
    "att(txt(faoOpCardElement(faoSetup(),opU,0)).indexOf('zone NON appliquée')>=0,",
    "  'fiche : esquisse absente/inutilisable -> alerte + zone NON appliquee');",
    "opU.limit.sk='zs1';opU.limit.loop=w;opU.limit.stale=true;",
    "att(txt(faoOpCardElement(faoSetup(),opU,0)).indexOf('obsolète')>=0,'fiche : stale -> alerte obsolete');",
    "return ATT;"
  ].join('\n');
  const out=await vm.runInContext('(async()=>{'+R+'\n})()',ctx);
  if(out&&out.length){
    console.log('=== zone par esquisse (FAO 2026-10-13-001) ===');
    console.log('ECHECS :');out.forEach(m=>console.log('  x '+m));
    process.exit(1);
  }
  console.log('=== zone par esquisse : extraction, ctx, clip, rejeu, fiche ===');
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.log('FATAL/FAIL',String((e&&e.stack)||e).slice(0,1400));process.exit(1);});
