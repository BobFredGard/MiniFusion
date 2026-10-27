// V0.11.22 : « Quand je déplace le Plan 1 de Cavité Test, à 25 pas de souci, à 20 je perds des
// arêtes sur le congé 2 arêtes. » Plan 1 (décalé de YZ) porte l'Esquisse 3 ; la nervure
// extrudée ±4 a deux flancs (x = d−4 et d+4) congés R4 par deux entrées ancrées sur la même
// ligne e38, côté 0 et côté 1 (clics d'origine x = 25 et x = 35, quand la nervure faisait ±5
// autour de 30). À d = 20 le flanc HAUT (x = 24) passe à 1 mm du clic d'origine du flanc BAS
// (x = 25) : la garde « ancre divergente » d'occApplyXFillets prenait cette jumelle, les deux
// entrées visaient la même arête, et la passe « doublons » en effaçait une pour toujours
// (retour à 25 : une seule arête). Correctif : xAnchorStill — le clic n'est plus là où l'ancre
// le décrit (niveau +5 au lieu de −4/−5) → l'esquisse a emporté l'arête, l'ancre fait foi ;
// et la passe « doublons » ne fusionne plus deux ancres (ou deux clics) distinctes.
// Noyau OCCT réel, document réel (tests/fixtures/cavite_test_plan1.json).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__doc=fs.readFileSync(path.join(ROOT,'tests','fixtures','cavite_test_plan1.json'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};showAll=function(){};applyView=function(){};',ctx);
  const R=[
    'const out={fails:[],log:[]};',
    'const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};',
    'occt=__realOcct;occtReady=true;',
    'await deserialise(__doc);occt=__realOcct;occtReady=true;markDirty();rebuild();',
    'const cg=doc.cgeo.find(c=>c.name==="Plan 1");',
    'const XF=["xf_10_mvqmev0w","xf_16_mvqocs7o","xf_24_mvqocs7o","xf_25_mvqocs7o"]; // les 4 congés « 2 arêtes » (source + 3 images)',
    'const F=id=>doc.features.find(f=>f.id===id);',
    'const xs=id=>(F(id).edges||[]).map(e=>+e.pos[0].toFixed(2)).sort((a,b)=>a-b).join("/");',
    'const nFaces=sh=>{let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};',
    'const etat=()=>{const FR=occFinalShape(null);const r={msgs:(FR.msgs||[]).filter(m=>/doublon|divergente|introuvable|impossible/.test(m)),faces:FR.shape?nFaces(FR.shape):0,ab:Math.abs(F(XF[0]).edges[0].pos[0]),err:doc.features.filter(f=>f._err).map(f=>f.name)};XF.forEach(id=>r[id]=xs(id));return r;};',
    'const pose=d=>{cg.p.d=d;markDirty();rebuild();return etat();};',
    'A(builtEngine==="exact","0 : rejeu exact ("+builtEngine+")");',
    'const e25=etat();',
    'A(e25[XF[0]]==="21/29"&&e25[XF[1]]==="-29/-21"&&e25[XF[2]]==="21/29"&&e25[XF[3]]==="-29/-21","25 (fichier) : 4 congés × 2 arêtes, flancs à x = ±21 / ±29 ("+XF.map(id=>e25[id]).join(" ; ")+")");',
    'A(!e25.msgs.length&&!e25.err.length,"25 : aucun avertissement ("+(e25.msgs.join(" | ")||"aucun")+")");',
    'const s9=F(XF[0]).edges.find(e=>e.anchor.side===0);',
    // la nervure a été créée autour de x = 30 (clics à 25 et 35, niveau ±5) : à d = 30 le clic est là où l’ancre le décrit
    'pose(30);A(xAnchorStill(s9)===true,"30 : le clic d’Arête 9 (x = 25, niveau −5) est là où son ancre le décrit (xAnchorStill = "+xAnchorStill(s9)+")");',
    'pose(25);A(xAnchorStill(s9)===false,"25 : plan déjà décalé de 5 mm au moment du fichier — le clic n’est plus au niveau de l’ancre (xAnchorStill = "+xAnchorStill(s9)+")");',
    // d = 20 : le flanc haut (x = 24) passe à 1 mm du clic d’origine du flanc bas (x = 25)
    'const e20=pose(20);',
    'A(xAnchorStill(s9)===false,"20 : le clic d’Arête 9 n’est plus au niveau de son ancre — l’esquisse a bougé (xAnchorStill = "+xAnchorStill(s9)+")");',
    'A(e20[XF[0]]==="16/24"&&e20[XF[1]]==="-24/-16"&&e20[XF[2]]==="16/24"&&e20[XF[3]]==="-24/-16","20 : les 4 congés gardent 2 arêtes, flancs à x = ±16 / ±24 ("+XF.map(id=>e20[id]).join(" ; ")+")");',
    'A(!e20.msgs.length,"20 : ni « doublon » ni « ancre divergente » ("+(e20.msgs.join(" | ")||"aucun")+")");',
    'A(e20.faces===e25.faces,"20 : même nombre de faces qu’à 25 ("+e20.faces+" / "+e25.faces+") — les 8 arêtes sont arrondies");',
    'A(!e20.err.length,"20 : aucune fonction en erreur ("+(e20.err.join(" | ")||"aucune")+")");',
    // d = 23 : la jumelle à exactement 2 mm du clic (limite de la garde)
    'const e23=pose(23);',
    'A(e23[XF[0]]==="19/27"&&e23[XF[3]]==="-27/-19"&&!e23.msgs.length,"23 : flancs à x = ±19 / ±27, 2 arêtes par congé ("+e23[XF[0]]+" ; "+e23[XF[3]]+" ; "+(e23.msgs.join(" | ")||"aucun avertissement")+")");',
    // retour à 25 : rien n’a été perdu
    'const r25=pose(25);',
    'A(r25[XF[0]]==="21/29"&&r25[XF[3]]==="-29/-21"&&r25.faces===e25.faces&&!r25.msgs.length,"25 (retour) : état d’origine retrouvé ("+r25[XF[0]]+" ; faces "+r25.faces+")");',
    // passe « doublons » : deux entrées d’ancres distinctes appariées par erreur sur la même arête ne sont plus fusionnées
    'const xf=F(XF[0]);xf.edges[1].pos=xf.edges[0].pos.slice();xf.edges[1].len=xf.edges[0].len;',
    'const d20=pose(20);',
    'A(F(XF[0]).edges.length===2&&d20[XF[0]]==="16/24"&&!d20.msgs.length,"doublons : deux entrées à la même position mais d’ancres différentes restent deux sélections ("+d20[XF[0]]+" ; "+(d20.msgs.join(" | ")||"aucun avertissement")+")");',
    'return out;'
  ].join('\n');
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.11.22 : congé 2 arêtes et plan porteur décalé (Cavité Test, Plan 1 : 25 → 20) ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
