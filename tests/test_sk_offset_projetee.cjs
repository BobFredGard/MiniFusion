// 2026-10-02-019 : décalage sur les entités PROJETÉES (face) — « Esquisse 2 »
// du document réel de l'utilisateur (fixtures/décalage.json).
// Symptômes constatés dans le document sauvé :
//  1) les 8 copies du décalage ne forment PAS une boucle : aucun pid partagé
//     entre les copies (16 extrémités libres, trous structurels aux jonctions) ;
//  2) 3 points d'extrémité aberrants (±10⁴ mm) + bouts d'arcs déformés, stables
//     au règlement (résidu 2,66e-15) : dégâts datant d'une version antérieure.
// Cause de (1) : `skOffsetChains` ne relie les entités que par pid fusionné ou
// contrainte coincident — or une projection crée ses points DUPLICATA à chaque
// jonction (pids distincts, écarts ~2e-8, aucune contrainte) → 8 chaînes
// singleton ouvertes → aucune phase de joints → copies déconnectées.
// Correctif : joint géométrique (superposition < 1e-6) dans le chaînage et
// repli `J0={pid:sortie source, forced:false}` dans jInfo → les copies
// partagent UN pid par jonction (fusion structurelle, boucle in-ouvrable).
// Le document restant (vieilles copies aberrantes) se répare en supprimant les
// copies puis en re-décalant : c'est exactement le scénario B/C ci-dessous.
// Harnais : DOM/THREE stubbé ; le document réel est désérialisé (rebuild:false).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const json=fs.readFileSync(path.join(ROOT,'tests','fixtures','décalage.json'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  sandbox.__realOcct=real;
  sandbox.__json=json;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    "(async()=>{",
    "const out={fails:[],log:[]};",
    "const A=(c,m)=>{if(!c)out.fails.push(m);};",
    "const step=m=>out.log.push(m);",
    "const f=n=>(typeof n==='number'&&isFinite(n))?n.toFixed(4):String(n);",
    "const ends=e=>e.t==='line'?[e.p1,e.p2]:(e.t==='arc'?[e.pa,e.pb]:[]);",
    "const pidStats=ents=>{const m=new Map();ents.forEach(e=>ends(e).filter(Boolean).forEach(p=>{if(sk.points[p])m.set(p,(m.get(p)||0)+1);}));return m;};",
    "const shared=m=>[...m.values()].filter(v=>v>1).length;",
    "const wild=ents=>ents.flatMap(e=>ends(e).filter(Boolean).map(p=>sk.points[p]).filter(q=>q&&(Math.abs(q.x)>100||Math.abs(q.y)>100)));",
    "const strip=(sk,ids)=>{const inCp=v=>ids.indexOf(v)>=0;",
    " sk.constraints=sk.constraints.filter(c=>!(inCp(c.a)||inCp(c.b)||inCp(c.line)||inCp(c.ent)));",
    " sk.dims=sk.dims.filter(d=>!(inCp(d.a)||inCp(d.b)||inCp(d.ent)));",
    " const gone=sk.entities.filter(e=>inCp(e.id));",
    " sk.entities=sk.entities.filter(e=>!inCp(e.id));",
    " const gonePts=new Set();",
    " gone.forEach(e=>{if(e.t==='line'){gonePts.add(e.p1);gonePts.add(e.p2);}else if(e.t==='arc'){gonePts.add(e.pa);gonePts.add(e.pb);}});",
    " const used=new Set();",
    " sk.entities.forEach(e=>{if(e.t==='line'){used.add(e.p1);used.add(e.p2);}else if(e.t==='arc'){used.add(e.pc);used.add(e.pa);used.add(e.pb);}else if(e.t==='circle')used.add(e.pc);else if(e.p)used.add(e.p);});",
    " sk.constraints.forEach(c=>{['a','b','p','line','ent','mid'].forEach(k=>{if(c[k])used.add(c[k]);});});",
    " sk.dims.forEach(d=>{['a','b','ent','p'].forEach(k=>{if(d[k])used.add(d[k]);});});",
    " gonePts.forEach(p=>{if(p&&!used.has(p))delete sk.points[p];});",
    " return gone.length;};",
    "await deserialise(__json,{rebuild:false});",
    "const sk=doc.sketches.find(s=>s.id==='sk_6_mus65ome');",
    "A(!!sk,'doc : esquisse sk_6_mus65ome introuvable');",
    "if(!sk){out.log.push('ECHECS (1) :');out.fails.forEach(m=>out.log.push('  x '+m));return out.log.join(String.fromCharCode(10));}",
    "const proj=sk.entities.filter(e=>e.proj).map(e=>e.id);",
    "step('fixture : esquisse 2, '+proj.length+' entités projetées, '+sk.entities.length+' entités, '+Object.keys(sk.points).length+' points');",
    "A(proj.length===8,'proj : '+proj.length+' entités projetées au lieu de 8');",
    // ═══ A. chaînage : UNE boucle fermée de 8 sur les projections ═══
    "const chs=skOffsetChains(sk,proj);",
    "step('A : '+chs.length+' chaîne(s)'+(chs[0]?' — n='+chs[0].order.length+' fermée='+chs[0].closed:''));",
    "A(chs.length===1,'A1 : '+chs.length+' chaînes sur les 8 projections au lieu d\\'UNE — les jonctions (pids distincts, écarts ~2e-8) ne sont pas reconnues');",
    "A(chs.length===1&&chs[0].order.length===8,'A2 : la chaîne doit assembler les 8 projections — obtenu '+(chs[0]?chs[0].order.length:'?'));",
    "A(chs.length===1&&chs[0].closed===true,'A3 : la chaîne doit être FERMÉE (boucle complète)');",
    // ── rejeu après retrait des vieilles copies ──
    "const OLD=['e111','e116','e120','e125','e129','e134','e138','e143'];",
    "step('retrait : '+strip(sk,OLD)+' anciennes copies supprimées');",
    "const check=(tag,r,ents)=>{",
    " A(r.ok,tag+'0 : décalage échoue : '+(r.msg||''));",
    " A(r.copies&&r.copies.length===8,tag+'1 : '+((r.copies||[]).length)+' copie(s) au lieu de 8');",
    " A(r.jointsBad===0,tag+'2 : '+r.jointsBad+' joint(s) non raccordé(s) (TROU) — '+(r.msg||''));",
    " const st=pidStats(ents);",
    " A(st.size===8&&shared(st)===8,tag+'3 : boucle des copies = 8 pids partagés (fusion structurelle) — pids='+st.size+' partages='+shared(st));",
    " A(wild(ents).length===0,tag+'4 : '+wild(ents).length+' bout(s) aberrant(s) |coord|>100 mm sur les copies');",
    "};",
    // ═══ B. décalage frais, S à l'intérieur (clic côté intérieur) ═══
    "const rB=skOffsetApply(sk,proj,3.872,{x:0,y:0});",
    "const entsB=(rB.copies||[]).map(id=>sk.entities.find(e=>e.id===id)).filter(Boolean);",
    "step('B : '+(rB.msg||''));",
    "check('B',rB,entsB);",
    "A(entsB.filter(e=>e.t==='line').length===4&&entsB.filter(e=>e.t==='arc').length===4,'B5 : composition 4 lignes + 4 arcs — obtenu '+entsB.filter(e=>e.t==='line').length+'L/'+entsB.filter(e=>e.t==='arc').length+'A');",
    "const gD=sk.dims.filter(d=>d.type==='gap'&&(rB.copies||[]).indexOf(d.b)>=0&&Math.abs(d.value-3.872)<1e-9);",
    "A(gD.length>=4,'B6 : '+gD.length+' cote(s) gap 3,872 sur les copies de lignes au lieu de 4');",
    "const rD=sk.dims.filter(d=>d.type==='radius'&&(rB.copies||[]).indexOf(d.ent)>=0);",
    "A(rD.length>=4,'B7 : '+rD.length+' cote(s) radius sur les copies d\\'arcs au lieu de 4');",
    "A(rD.every(d=>Math.abs(d.value-6.128)<1e-6||Math.abs(d.value-13.872)<1e-6),'B8 : rayons décalés attendus 6,128 (intérieur) ou 13,872 (extérieur) — obtenu '+rD.map(d=>f(d.value)).join(', '));",
    "let res=999;try{solveSketch(sk,150);res=skAudit(sk).residual||0;}catch(e){res=999;}",
    "A(res<1e-4,'B9 : résidu '+res+' après règlement');",
    "A(wild(entsB).length===0,'B10 : bouts aberrants après règlement : '+wild(entsB).length);",
    // ═══ C. rejeu avec S=null (menu contextuel « décaler auto », chaîne fermée) ═══
    "step('retrait : '+strip(sk,rB.copies||[])+' copies B supprimées');",
    "const rC=skOffsetApply(sk,proj,3.872,null);",
    "const entsC=(rC.copies||[]).map(id=>sk.entities.find(e=>e.id===id)).filter(Boolean);",
    "step('C : '+(rC.msg||''));",
    "check('C',rC,entsC);",
    "res=999;try{solveSketch(sk,150);res=skAudit(sk).residual||0;}catch(e){res=999;}",
    "A(res<1e-4,'C5 : résidu '+res+' après règlement');",
    "A(wild(entsC).length===0,'C6 : bouts aberrants après règlement : '+wild(entsC).length);",
    "if(out.fails.length){out.log.push('');out.log.push('ECHECS ('+out.fails.length+') :');out.fails.forEach(m=>out.log.push('  x '+m));}",
    "else out.log.push('TOUT EST CONFORME');",
    "return out.log.join(String.fromCharCode(10));",
    "})()"
  ].join('\n');
  const txt=await vm.runInContext(body,ctx,{filename:'test_sk_offset_projetee.js'});
  console.log('=== décalage sur projections (esquisse 2, document réel) ===');
  console.log(txt);
  process.exit(/ECHECS|  x /.test(txt)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,3000));process.exit(1);});
