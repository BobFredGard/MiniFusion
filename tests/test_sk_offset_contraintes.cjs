// Esquisse → Décalage : quand la SOURCE est contrainte entre ses éléments, les
// copies du décalage doivent recevoir les mêmes liens ENTRE ELLES (contraintes
// explicites) :
//  - source jointe par contrainte `coincident` (2 points distincts) → copie avec
//    2 points distincts positionnés au joint + contrainte `coincident` ;
//  - source avec contrainte `tangent` (ligne ↔ arc) → copie avec contrainte
//    `tangent` (copie-ligne ↔ copie-arc).
// Si la source n'est PAS contrainte (jointures par points fusionnés), le
// comportement est inchangé : pids partagés, parallel+gap, radius — aucune
// contrainte copie↔copie ajoutée.
// Avant : skOffsetChains ne relie QUE les pids identiques (une source contrainte
// n'est jamais chaînée) et skOffsetApply ne crée ni `coincident` ni `tangent`.
// 1) structure (ROUGE) ; 2) comportement : les 5 cas ci-dessous, avec résidu
// skAudit ≈ 0 après règlement pour les cas contraints.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  const src50=require('fs').readFileSync(require('path').join(__dirname,'..','src','50-esquisse-2d-solveur.js'),'utf8');
  const body=[
    "const out={fails:[],log:[]};",
    "const A=(c,m)=>{if(!c)out.fails.push(m);};",
    "const step=m=>out.log.push(m);",
    // ═══ 1) structure : le filet existe dans src/50 ═══
    "const iC=__src50.indexOf('function skOffsetChains'),iD=__src50.indexOf('function skOffsetDistToSel'),",
    "  iA=__src50.indexOf('function skOffsetApply'),iB=__src50.indexOf('function skBoxHits');",
    "A(iC>0&&iD>iC&&iA>iD&&iB>iA,'bornes skOffset* introuvables');",
    "const cChain=(iC>0&&iD>iC)?__src50.slice(iC,iD):'';",
    "const cApply=(iA>0&&iB>iA)?__src50.slice(iA,iB):'';",
    "A(/coincident/.test(cChain),'skOffsetChains : aucun joint detecte via la contrainte coincident (une source contrainte n est jamais chainee)');",
    "A(/type:'coincident'/.test(cApply),\"skOffsetApply : aucune contrainte coincident creee entre les copies\");",
    "A(/type:'tangent'/.test(cApply),'skOffsetApply : aucune contrainte tangent creee entre les copies');",
    // ═══ 2) comportement : noyau 2D pur ═══
    "const typeCount=(sk,t)=>(sk.constraints||[]).filter(c=>c.type===t).length;",
    "const mkSk=(pts,ents,cons)=>({id:'k1',name:'K',plane:'XY',visible:true,",
    "  points:JSON.parse(JSON.stringify(pts)),entities:JSON.parse(JSON.stringify(ents)),",
    "  constraints:JSON.parse(JSON.stringify(cons||[])),dims:[],seq:300});",
    "const mount=sk=>{ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];openSketch(sk.id);return sk;};",
    "const residu=sk=>{try{solveSketch(sk,120);return skAudit(sk).residual||0;}catch(e){return 999;}};",
    "const lp=(sk,id)=>sk.entities.filter(e=>e.t==='line').find(e=>e.id===id);",
    // ─── (a) source NON contrainte : joints par pid fusionné → inchangé ───
    "{",
    "  const sk=mount(mkSk({a:{x:0,y:0},b:{x:30,y:0},c:{x:30,y:20}},",
    "    [{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'}],[]));",
    "  const r=skOffsetApply(sk,['l1','l2'],3,null);",
    "  const added=sk.entities.filter(e=>['l1','l2'].indexOf(e.id)<0);",
    "  step('a) source fusionnee : copies='+added.length+' coincident='+typeCount(sk,'coincident')+' tangent='+typeCount(sk,'tangent')+' parallel='+typeCount(sk,'parallel'));",
    "  A(r.ok,'a) décalage échoue : '+(r.msg||''));",
    "  A(added.length===2,'a) '+added.length+' copie(s) au lieu de 2');",
    "  if(added.length===2){",
    "    const p=new Set([added[0].p1,added[0].p2,added[1].p1,added[1].p2]);",
    "    A(p.size===3,'a) le joint des copies doit partager UN pid (fusion), obtenu '+p.size+' points');",
    "  }",
    "  A(typeCount(sk,'coincident')===0,'a) contrainte coincident ajoutée à tort sur une source non contrainte');",
    "  A(typeCount(sk,'tangent')===0,'a) contrainte tangent ajoutée à tort sur une source non contrainte');",
    "  A(typeCount(sk,'parallel')===2&&sk.dims.filter(d=>d.type==='gap').length===2,'a) parallel/gap historiques manquants');",
    "}",
    // ─── (b) source contrainte `coincident` (2 points distincts) → copie coincidente ───
    "{",
    "  const sk=mount(mkSk({a:{x:0,y:0},b:{x:30,y:0},c:{x:30,y:0},d:{x:30,y:20}},",
    "    [{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'c',p2:'d'}],",
    "    [{id:'k0',type:'coincident',a:'b',b:'c'}]));",
    "  const r=skOffsetApply(sk,['l1','l2'],3,null);",
    "  const added=sk.entities.filter(e=>['l1','l2'].indexOf(e.id)<0);",
    "  const co=(sk.constraints||[]).filter(c=>c.type==='coincident'&&c.id!=='k0');",
    "  step('b) source contrainte : copies='+added.length+' coincident(copie)='+co.length);",
    "  A(r.ok,'b) décalage échoue : '+(r.msg||''));",
    "  A(added.length===2,'b) '+added.length+' copie(s) au lieu de 2');",
    "  A(co.length===1,'b) contrainte coincident manquante sur le joint des copies ('+co.length+')');",
    "  if(co.length===1){",
    "    const P=sk.points,q1=P[co[0].a],q2=P[co[0].b];",
    "    A(!!q1&&!!q2&&co[0].a!==co[0].b,'b) les points de joint des copies doivent être DISTINCTS et liés');",
    "    if(q1&&q2)A(Math.hypot(q1.x-q2.x,q1.y-q2.y)<1e-6,'b) points de joint à '+Math.hypot(q1.x-q2.x,q1.y-q2.y).toExponential(2)+' mm l un de l autre');",
    "    if(q1)A(Math.abs(q1.x-27)<1e-6&&Math.abs(q1.y-3)<1e-6,'b) joint attendu (27,3), obtenu ('+q1.x.toFixed(3)+','+q1.y.toFixed(3)+')');",
    "  }",
    "  const res=residu(sk);",
    "  step('b) résidu après règlement : '+res.toExponential(2));",
    "  A(res<1e-6,'b) résidu '+res+' après règlement (joint de copie non résolu)');",
    "  A(typeCount(sk,'parallel')===2&&sk.dims.filter(d=>d.type==='gap').length===2,'b) parallel/gap historiques manquants');",
    "}",
    // ─── (c) source avec contrainte `tangent` (ligne ↔ arc) → copie tangente ───
    "{",
    "  const sk=mount(mkSk({o:{x:0,y:0},t:{x:20,y:0},w:{x:30,y:10},c:{x:20,y:10}},",
    "    [{id:'l1',t:'line',p1:'o',p2:'t'},{id:'a1',t:'arc',pc:'c',pa:'t',pb:'w',r:10}],",
    "    [{id:'k0',type:'tangent',line:'l1',ent:'a1'}]));",
    "  const r=skOffsetApply(sk,['l1','a1'],2,null);",
    "  const added=sk.entities.filter(e=>['l1','a1'].indexOf(e.id)<0);",
    "  const ta=(sk.constraints||[]).filter(c=>c.type==='tangent'&&c.id!=='k0');",
    "  step('c) source tangente : copies='+added.length+' tangent(copie)='+ta.length);",
    "  A(r.ok,'c) décalage échoue : '+(r.msg||''));",
    "  A(added.length===2,'c) '+added.length+' copie(s) au lieu de 2');",
    "  A(ta.length===1,'c) contrainte tangent manquante sur les copies ('+ta.length+')');",
    "  if(ta.length===1){",
    "    const ids=added.map(e=>e.id);",
    "    const lc=added.find(e=>e.t==='line'),ac=added.find(e=>e.t==='arc');",
    "    A(!!lc&&!!ac,'c) il faut une ligne ET un arc copiés');",
    "    if(lc&&ac)A(ta[0].line===lc.id&&ta[0].ent===ac.id,'c) tangent mal ciblée : line='+ta[0].line+' ent='+ta[0].ent+' (attendu '+lc.id+'/'+ac.id+')');",
    "  }",
    "  const res=residu(sk);",
    "  step('c) résidu après règlement : '+res.toExponential(2));",
    "  A(res<1e-6,'c) résidu '+res+' après règlement (tangence des copies non résolue)');",
    "}",
    // ─── (d) même géométrie SANS contrainte tangent sur la source → copie sans tangent ───
    "{",
    "  const sk=mount(mkSk({o:{x:0,y:0},t:{x:20,y:0},w:{x:30,y:10},c:{x:20,y:10}},",
    "    [{id:'l1',t:'line',p1:'o',p2:'t'},{id:'a1',t:'arc',pc:'c',pa:'t',pb:'w',r:10}],[]));",
    "  const r=skOffsetApply(sk,['l1','a1'],2,null);",
    "  step('d) source sans contrainte tangent : tangent(copie)='+typeCount(sk,'tangent'));",
    "  A(r.ok,'d) décalage échoue : '+(r.msg||''));",
    "  A(typeCount(sk,'tangent')===0,'d) contrainte tangent ajoutée à tort (la source n est pas contrainte)');",
    "}",
    // ─── (e) cercle solo : radius inchangé, aucune contrainte copie↔copie ───
    "{",
    "  const sk=mount(mkSk({c:{x:0,y:0}},[{id:'c1',t:'circle',pc:'c',r:10}],[]));",
    "  const r=skOffsetApply(sk,['c1'],2,{x:20,y:0});",
    "  const added=sk.entities.filter(e=>e.id!=='c1');",
    "  step('e) cercle solo : copies='+added.length+' radius='+sk.dims.filter(d=>d.type==='radius').length);",
    "  A(r.ok&&added.length===1,'e) cercle non décalé : '+(r.msg||''));",
    "  if(added.length===1)A(Math.abs(added[0].r-12)<1e-6,'e) rayon '+added[0].r+' au lieu de 12');",
    "  A(typeCount(sk,'coincident')===0&&typeCount(sk,'tangent')===0,'e) contraintes copie↔copie ajoutées à tort sur un cercle solo');",
    "}",
    "if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}",
    "else out.log.push('TOUT EST CONFORME');",
    "return out.log.join(String.fromCharCode(10));"
  ].join('\n');
  sandbox.__src50=src50;
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx,{filename:'skoffset.js'});
  console.log('=== esquisse décalage : contraintes explicites entre copies ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,600));process.exit(1);});
