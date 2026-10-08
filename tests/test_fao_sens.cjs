// FAO 3D — 2026-10-08-003 : sens de passe « avalant » (défaut) vs « bidir ».
//
// Sens de coupe CONSTANT : aucune chaîne n'est retournée, la passe suit
// toujours le même sens d'avance (les dents attaquent la matière comme la
// rotation de la fraise l'exige — c'est « une histoire de signe », le vrai
// sens se règle plus tard). Les anneaux fermes ne sont que ROTATIONNÉS.
// 'bidir' = comportement historique (retournement vers l'extrémité la plus
// proche) : les documents SANS champ restent strictement identiques (legacy
// byte-identique, prouvé ici au générateur ET au dispatch).
//
// Fixture : bloc 80x60x18 + poche ouverte x[10,70] y[10,50] fond z=4
// (même maillage manifold que test_fao_escargot).
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
    "const BASE={ap:4,ae:5,toolD:10,radial:0.5,axial:0.5,secu:23,minipasses:0};",
    "const gen=function(o){const z={};for(const k in BASE)z[k]=BASE[k];if(o)for(const k in o)z[k]=o[k];",
    "  return faoGenRough3D(FR,BX,18,4,z);};",
    "const cuts=function(mv){return mv.filter(function(m){return !m.r;});};",
    "const J=JSON.stringify;",
    // ================= 1. legacy byte-identique (absent == bidir) ============
    "const g0=gen();",
    "const gB=gen({sens:'bidir'});",
    "att(J(g0)===J(gB),'conv : document ancien (sans champ) == bidir — legacy byte-identique');",
    "const gE0=gen({mode:'escargot'});",
    "const gEB=gen({mode:'escargot',sens:'bidir'});",
    "att(J(gE0)===J(gEB),'escargot : legacy byte-identique');",
    // ================= 2. avalant : sens de coupe constant ==================
    "const gA=gen({sens:'avalant'});",
    "att(J(g0)!==J(gA),'conv : avalant DIFFERENT de bidir (retournement bloquee)');",
    "att(cuts(gA).length>1000,'conv avalant : parcours complet ('+cuts(gA).length+' coupes)');",
    "att(Math.abs(cuts(gA).length-cuts(gB).length)<cuts(gB).length*0.1,",
    "  'conv avalant : meme etendue que bidir ('+cuts(gA).length+' vs '+cuts(gB).length+' coupes)');",
    "const gEA=gen({mode:'escargot',sens:'avalant'});",
    "att(cuts(gEA).length>1000,'escargot avalant : parcours complet ('+cuts(gEA).length+' coupes)');",
    // ================= 3. creation / sanitise / sig =========================
    "att(faoOpDefaults('rough3d').sens==='avalant','creation : sens par defaut avalant');",
    "const mk=function(ex){const o={id:'s',type:'rough3d',minipasses:0,ap:4,ae:5,radial:0.5,axial:0.5};",
    "  if(ex)for(const k in ex)o[k]=ex[k];return o;};",
    "const oA=mk({sens:'avalant'}),oB=mk({sens:'bidir'}),oN=mk(),oX=mk({sens:'zigzag'}),oF=mk({sens:'avalant',type:'facing'});",
    "faoSanitiseOps({ops:[oA,oB,oN,oX,oF]});",
    "att(oA.sens==='avalant','sanitise : avalant conserve');",
    "att(oB.sens==='bidir','sanitise : bidir conserve');",
    "att(!('sens' in oN),'sanitise : absent reste absent');",
    "att(!('sens' in oX),'sanitise : valeur inconnue purgee');",
    "att(!('sens' in oF),'sanitise : hors Ebauche 3D le champ part');",
    "att(J(faoOpSig(oA))!==J(faoOpSig(oB)),'sig : avalant != bidir (rejeu a la bascule)');",
    "att(J(faoOpSig(oB))!==J(faoOpSig(oN)),'sig : bidir != absent (lecture ancien doc, choix explicite)');",
    // ================= 4. fiche : selecteur Sens ============================
    "const all=function(root){const out=[];(function w(n){out.push(n);(n.children||[]).forEach(w);})(root);return out;};",
    "const cardA=faoOpCardElement(faoSetup(),faoOpDefaults('rough3d'),0);",
    "const sensSel=all(cardA).filter(function(n){return n.tagName==='SELECT'&&",
    "  Array.prototype.map.call(n.children||[],function(o){return String(o.textContent||'');}).join('|').indexOf('Sens unique')>=0;})[0];",
    "att(!!sensSel,'fiche : selecteur Sens present');",
    "if(sensSel){",
    "  att(sensSel.value==='avalant','fiche : valeur affichee avalant ('+sensSel.value+')');",
    "  const opU=faoOpDefaults('rough3d');delete opU.sens;",
    "  const cardU=faoOpCardElement(faoSetup(),opU,0);",
    "  const sensU=all(cardU).filter(function(n){return n.tagName==='SELECT'&&",
    "    Array.prototype.map.call(n.children||[],function(o){return String(o.textContent||'');}).join('|').indexOf('Sens unique')>=0;})[0];",
    "  att(sensU&&sensU.value==='bidir','fiche ancien doc : valeur affichee bidir (valeur reelle)');",
    "  if(sensU){sensU.value='avalant';sensU.onchange();",
    "    att(opU.sens==='avalant','fiche : choisir avalant ecrit op.sens');",
    "    sensU.value='bidir';sensU.onchange();",
    "    att(opU.sens==='bidir','fiche : choisir bidir ecrit op.sens');}",
    "}else att(false,'fiche : selecteur Sens absent');",
    // ================= 5. dispatch de bout en bout ==========================
    "const job=faoDefaultJob();",
    "job.stock={x0:-5,y0:-5,z0:0,x1:85,y1:65,z1:18};",
    "const mkOp=function(id,extra){const o={id:id,on:true,toolId:'T1',type:'rough3d',",
    "  ztop:18,zbot:4,ap:4,ae:5,radial:0.5,axial:0.5,minipasses:0};",
    "  if(extra)for(const k in extra)o[k]=extra[k];return o;};",
    "const opA=mkOp('sa1',{sens:'avalant'}),opB=mkOp('sa2',{sens:'bidir'}),opN=mkOp('sa3');",
    "job.ops=[opA,opB,opN];",
    "const keepAM=faoActiveMesh;",
    "faoActiveMesh=function(){return {mesh:FR,box:BX};};",
    "let dA=[],dB=[],dN=[];",
    "try{",
    "  dA=faoOpMoves(opA,job);dB=faoOpMoves(opB,job);dN=faoOpMoves(opN,job);",
    "}catch(e){att(false,'dispatch : exception '+e.message);}",
    "finally{faoActiveMesh=keepAM;}",
    "att(dA.length&&dB.length&&dN.length,'dispatch : trois parcours generes ('+dA.length+'/'+dB.length+'/'+dN.length+')');",
    "att(J(dA)!==J(dB),'dispatch : avalant DIFFERENT de bidir');",
    "att(J(dN)===J(dB),'dispatch ancien doc : sans champ == bidir (byte-identique)');",
    // ================= rapport ==============================================
    "p('conv : sans champ '+J(g0).length+' | bidir '+J(gB).length+' | avalant '+J(gA).length);",
    "p('escargot : sans champ '+J(gE0).length+' | avalant '+J(gEA).length);",
    "p('coupes conv avalant '+cuts(gA).length+' vs bidir '+cuts(gB).length+' | dispatch '+dA.length+'/'+dB.length+'/'+dN.length);",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_sens.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
