// 2026-10-15-009 : régénération du modèle 3D — chaîne de dépendances complète.
// Retour : « Cavité Usinage : quand je passe la cote de 50 de la 1ère extrusion à 55,
// l'avant-dernière esquisse ne suit pas et la dernière extrusion négative n'est plus
// visible car pas au bon plan ».
// Chaîne : Extrusion 1 (50) → Esquisse 2 sur sa face → découpe (fond de cavité) →
// Esquisse 3 (YZ) dont 2 arêtes PROJETÉES servent de PROFIL → extrusion → Symétrie
// (instance + esquisse copiée) → Esquisse 8 sur une face LATÉRALE de l'instance →
// découpe → « Limite Basse » sur sa face.
// Causes corrigées : (1) projetée passée en profil = plus associative ; (2) instances de
// symétrie jamais régénérées pendant le rejeu ; (3) une seule passe de reprise ;
// (4) cote entraxe non signée → solution miroir au retour (congés R7 impossibles).
// Noyau OCCT réel, document réel (tests/fixtures/cavite_regeneration.json).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  { const html=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8'),s97=fs.readFileSync(path.join(ROOT,'src','97-auto-tests.js'),'utf8');
    sandbox.__unique=!/id="btnHard"/.test(html)&&!/b\.id='btnValidate'/.test(s97)&&/⟳ Régénérer<\/button>/.test(html); }
  sandbox.__doc=fs.readFileSync(path.join(ROOT,'tests','fixtures','cavite_regeneration.json'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};showAll=function(){};applyView=function(){};',ctx);
  const R=[
    'const out={fails:[],log:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
    'occt=__realOcct;occtReady=true;',
    'await deserialise(__doc);occt=__realOcct;occtReady=true;markDirty();rebuild();',
    'const S=id=>doc.sketches.find(s=>s.id===id);',
    'const ys=id=>{const P=S(id).points;return [...new Set(Object.keys(P).filter(k=>k!=="O").map(k=>+P[k].y.toFixed(2)))].sort((a,b)=>a-b).join(" ");};',
    'const pts=id=>{const P=S(id).points;return Object.keys(P).sort().map(k=>k+":"+P[k].x.toFixed(2)+"/"+P[k].y.toFixed(2)).join(" ");};',
    'const st=()=>({o8:S("sk_32_mv4zre1v").origin[2],lim:S("sk_35_mv59e0kp").origin[2],o2:S("sk_4_mup7m3s3").origin[2],',
    '  s3:ys("sk_9_muviakc5"),s22:ys("sk_22_muvijb97"),s14:pts("sk_14_muvicymd"),err:doc.features.filter(f=>f._err).map(f=>f.name).join("|")});',
    'const f=doc.features.find(x=>x.id==="ex_3_mup7fzw5");',
    'const i0=st();',
    'A(builtEngine==="exact","0 : rejeu exact ("+builtEngine+")");',
    'A(i0.o8===20&&!i0.err,"0 : état initial (Esquisse 8 à Z "+i0.o8+", erreurs : "+(i0.err||"aucune")+")");',
    'f.distance=55;markDirty();rebuild();const a=st();',
    'A(a.o2===55,"55 : Esquisse 2 sur la face du dessus suit (Z "+a.o2+")");',
    'A(/^25 /.test(a.s3),"55 : Esquisse 3 — arêtes projetées de PROFIL recalées sur le fond (y "+a.s3+")");',
    'A(a.s22===a.s3,"55 : copie symétrique régénérée = source ("+a.s22+")");',
    'A(a.o8===25,"55 : Esquisse 8 (face latérale de l’instance) suit : Z "+a.o8+" (attendu 25)");',
    'A(a.lim===25,"55 : Limite Basse suit : Z "+a.lim);',
    'A(!a.err,"55 : aucune fonction en erreur ("+(a.err||"aucune")+")");',
    'f.distance=50;markDirty();rebuild();const b=st();',
    'A(b.o8===20&&b.lim===20&&b.s3===i0.s3&&b.s22===i0.s22,"50 : retour exact (Esquisse 8 Z "+b.o8+", Limite "+b.lim+")");',
    'A(!b.err,"50 : aucune fonction en erreur au retour ("+(b.err||"aucune")+") — avant : 2 congés R7 impossibles");',
    'const near=(p,q)=>{const P=p.split(" "),Q=q.split(" ");return P.length===Q.length&&P.every((x,i)=>{const[a1,b1]=x.split(":")[1].split("/").map(Number),[a2,b2]=Q[i].split(":")[1].split("/").map(Number);return Math.abs(a1-a2)<0.02&&Math.abs(b1-b2)<0.02;});};',
    'A(near(b.s14,i0.s14),"50 : Esquisse 4 identique à l’origine (cote entraxe du bon CÔTÉ, pas la solution miroir)");',
    'const kGap=S("sk_14_muvicymd").dims.find(d=>d.type==="gap");',
    'A(kGap&&(kGap.sgn===1||kGap.sgn===-1),"côté mémorisé sur la cote entraxe ("+(kGap&&kGap.sgn)+")");',
    // bouton unique
    'A(typeof regenTout==="function"&&__unique,"bouton unique : regenTout ; plus de bouton Hard (coque) ni Valider (src/97)");',
    'f.distance=55;markDirty();const rep=regenTout();const c=st();',
    'A(/^VALIDATION : /m.test(rep||"")&&c.o8===25&&!c.err,"⟳ Régénérer : rapport + modèle à jour (Z "+c.o8+")");',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== 2026-10-15-009 : régénération — chaîne cote → face → projection → symétrie → face → poche ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
