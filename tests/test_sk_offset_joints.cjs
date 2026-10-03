// 2026-10-02-017 : décalage — « le décalage garde bien les tangences mais pas les
// coïncidences » (réponse au questionnaire : TROUS AUX JOINTS).
// Symptôme : après décalage, des jonctions des copies ne sont pas raccordées
// (message « N joint(s) non raccordé(s) » ou points d'extrémité NON LIÉS qui
// dérivent au règlement suivant).
// Causes :
//  1) `if(!M){jointsBad++; newEnds[i]={solo:true}}` : quand l'intersection des
//     courbes DÉCALÉES est introuvable, chaque entité crée SON PROPRE point
//     (aucune fusion, aucune contrainte) → trou. `circleCircleInt` renvoie []
//     dès que les centres sont confondus → un cercle dessiné en 2 ARCS
//     concentriques est TOUJOURS non raccordé. line-line a un repli sur le point
//     source C0, PAS line-circle ni circle-circle.
//  2) `jInfo` est calculé sur `ch.order` PENDANT que tout le reste (inversion
//     d'ordre quand S fourni = clic dans l'UI, newEnds, tangences recréées) utilise
//     `order` inversé → le flag « joint contraint (forced) » tombe sur le MAUVAIS
//     joint : la contrainte coincident de la source n'est pas recréée là où elle
//     était (ou l'est là où elle n'était pas).
// Correctif : repli sur C0 (meilleur point des deux courbes décalées) pour TOUS
// les types d'entités → le joint est TOUJOURS un pid partagé (fusion structurelle,
// in-ouvrable) ; `jInfo` calculé sur `order` après inversion.
// Harnais : DOM/THREE stubbé, aucun noyau OCCT requis.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  const body=[
"const out={fails:[],log:[]};",
"const A=(c,m)=>{if(!c)out.fails.push(m);};",
"const step=m=>out.log.push(m);",
"const f=n=>(typeof n==='number'&&isFinite(n))?n.toFixed(4):String(n);",
"const mkSk=(pts,ents,cons)=>({id:'kJ'+Math.random().toString(36).slice(2,6),name:'K',plane:'XY',visible:true,",
"  points:JSON.parse(JSON.stringify(pts)),entities:JSON.parse(JSON.stringify(ents)),",
"  constraints:JSON.parse(JSON.stringify(cons||[])),dims:[],seq:700});",
"const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return sk;};",
"const ends=e=>e.t==='line'?[e.p1,e.p2]:(e.t==='arc'?[e.pa,e.pb]:[]);",
"const pidStats=ents=>{const m=new Map();ents.forEach(e=>ends(e).forEach(p=>{if(p)m.set(p,(m.get(p)||0)+1);}));return m;};",
"const shared=m=>[...m.values()].filter(v=>v>1).length;",
"const R=sk=>{try{solveSketch(sk,150);return skAudit(sk).residual||0;}catch(e){return 999;}};",
// ═══ A. cercle dessiné en 2 ARCS concentriques, chaîne ouverte : 1 joint ═══
"{const sk=mount(mkSk({o:{x:0,y:0},e1:{x:10,y:0},e2:{x:0,y:10},e3:{x:-10,y:0}},",
" [{id:'A1',t:'arc',pc:'o',pa:'e1',pb:'e2',r:10},{id:'A2',t:'arc',pc:'o',pa:'e2',pb:'e3',r:10}],[]));",
" const r=skOffsetApply(sk,['A1','A2'],3,null);",
" const added=sk.entities.filter(e=>e.id!=='A1'&&e.id!=='A2');",
" step('A : jointsBad='+r.jointsBad+' copies='+added.length);",
" A(r.ok,'A0 : décalage échoue : '+(r.msg||''));",
" A(r.jointsBad===0,'A1 : joint non raccordé (TROU) — jointsBad='+r.jointsBad+' — '+(r.msg||''));",
" A(added.length===2,'A2 : '+added.length+' copie(s) au lieu de 2');",
" const st=pidStats(added);",
" A(shared(st)===1,'A3 : le joint des 2 copies doit partager UN pid — pids='+st.size+' partages='+shared(st));",
" A(st.size===3,'A4 : 3 pids pour 4 extrémités (joint fusionné) — obtenu '+st.size);",
" const jp=[...st.keys()].find(p=>shared(st)===1&&(st.get(p)>1));",
" if(jp){const P=sk.points[jp],rr=Math.hypot(P.x,P.y);",
"   A(Math.abs(P.x)<1e-6,'A5 : joint au sommet du quart (x='+f(P.x)+')');",
"   A(Math.abs(rr-7)<1e-6||Math.abs(rr-13)<1e-6,'A6 : joint sur le rayon décalé 7 ou 13 — obtenu '+f(rr));}",
" const res=R(sk);A(res<1e-4,'A7 : résidu '+res+' après règlement');}",
// ═══ B. cercle complet en 2 arcs concentriques, chaîne FERMÉE : 2 joints ═══
"{const sk=mount(mkSk({o:{x:0,y:0},e1:{x:10,y:0},e2:{x:0,y:10}},",
" [{id:'A1',t:'arc',pc:'o',pa:'e1',pb:'e2',r:10},{id:'A2',t:'arc',pc:'o',pa:'e2',pb:'e1',r:10}],[]));",
" const r=skOffsetApply(sk,['A1','A2'],3,{x:20,y:0});",
" const added=sk.entities.filter(e=>e.id!=='A1'&&e.id!=='A2');",
" step('B : jointsBad='+r.jointsBad+' copies='+added.length);",
" A(r.ok,'B0 : décalage échoue : '+(r.msg||''));",
" A(r.jointsBad===0,'B1 : '+r.jointsBad+' joint(s) non raccordé(s) (TROUX) sur cercle en arcs — '+(r.msg||''));",
" const st=pidStats(added);",
" A(st.size===2&&shared(st)===2,'B2 : les 2 joints des copies doivent être fusionnés — pids='+st.size+' partages='+shared(st));",
" const res=R(sk);A(res<1e-4,'B3 : résidu '+res+' après règlement');}",
// ═══ C. joints mixtes + S (inversion d ordre) : la coincident source reste AU BON JOINT ═══
// source : J01 (l1|l2) = contrainte coincident ; J12 (l2|l3) = pid fusionné (d partagé)
"{const sk=mount(mkSk({a:{x:0,y:0},b:{x:40,y:0},c:{x:40,y:0},d:{x:40,y:30},e:{x:80,y:30}},",
" [{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'c',p2:'d'},{id:'l3',t:'line',p1:'d',p2:'e'}],",
" [{id:'k0',type:'coincident',a:'b',b:'c'}]));",
" const r=skOffsetApply(sk,['l1','l2','l3'],4,{x:60,y:-40});",
" A(r.ok,'C0 : décalage échoue : '+(r.msg||''));",
" const added=sk.entities.filter(e=>['l1','l2','l3'].indexOf(e.id)<0);",
" A(added.length===3,'C1 : '+added.length+' copie(s) au lieu de 3');",
" const near=(J,rad)=>{const s=new Set();added.forEach(e=>ends(e).forEach(p=>{const q=sk.points[p];if(q&&Math.hypot(q.x-J.x,q.y-J.y)<rad)s.add(p);}));return [...s];};",
" const j1=near({x:40,y:0},14),j2=near({x:40,y:30},14);",
" step('C : joint contraint='+(j1.length)+' pid(s) · joint fusionné='+(j2.length)+' pid(s)');",
" A(j1.length===2,'C2 : le joint source COINCIDENT doit donner 2 points distincts liés sur les copies — obtenu '+j1.length+' pid(s) (swap jInfo/order)');",
" if(j1.length===2)A(skHasCoincident(sk,j1[0],j1[1]),'C3 : contrainte coincident manquante sur ce joint');",
" if(j1.length===2)A(Math.hypot(sk.points[j1[0]].x-sk.points[j1[1]].x,sk.points[j1[0]].y-sk.points[j1[1]].y)<1e-6,'C4 : points du joint contraint non superposés');",
" A(j2.length===1,'C5 : le joint source FUSIONNÉ doit rester UN pid partagé sur les copies — obtenu '+j2.length+' pid(s) (swap jInfo/order)');",
" const res=R(sk);A(res<1e-4,'C6 : résidu '+res+' après règlement');}",
"if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}",
"else out.log.push('TOUT EST CONFORME');",
"return out.log.join(String.fromCharCode(10));"
  ].join('\n');
  const r=vm.runInContext('(function(){\n'+body+'\n})()',ctx,{filename:'test_sk_offset_joints.js'});
  console.log('=== esquisse décalage : joints des copies (aucun trou) ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
