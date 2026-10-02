// Congé/chanfrein doivent RESTER sur l'arête choisie : poche //XZ (face latérale +X),
// congé cliqué sur le FOND de poche, puis pièce allongée via Esquisse 1 (130 → 150) —
// la face porteuse glisse, la poche suit. Retour utilisateur : « le congé revient mais
// sur l'arête extérieure de la poche ».
// Cause : ancre de type point (t:'p') — la branche ne tenait AUCUN compte du NIVEAU du
// clic ni de pos0 (distance au clic) : fond, rebord et couture verticale se départagent
// au premier rencontré → l'ordre d'énumération d'OCCT (bouleversé par toute édition
// amont) fait basculer le congé. On vérifie le FOND en ordre naturel ET inversé, avant et
// après allongement, en mode match direct et en chemin complet (feature + rejeu).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const dist3=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);",
    // --- plaque 130 × 120 × 40 (Esquisse 1 : longueur portée par p1/p2 à x=130)
    "const sk={id:'sk_b',name:'Base',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[],seq:1,visible:true};",
    "[['p0',0,0,'e0','p1'],['p1',130,0,'e1','p2'],['p2',130,120,'e2','p3'],['p3',0,120,'e3','p0']].forEach(l=>{",
    "  sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches=[sk];",
    "doc.features=[{id:'ex_b',type:'extrude',name:'Extrusion 1',sketchId:'sk_b',op:'add',distance:40,dist:40,d2:0,visible:true}];",
    "occSkipFeat=null;occCkClear();markDirty();rebuild();",
    // --- poche //XZ sur la face latérale +X (host SIDE : glisse avec l'arête porteuse).
    // Le mur du bas est scindé en son milieu (pm) : point d'esquisse réel — c'est lui qui
    // reçoit l'ancre t:'p' (comme p15/p20 des documents réels) et la scission crée une
    // couture verticale EN ce point (le concurrent naturel du fond).
    "const nB=new THREE.Vector3(1,0,0);",
    "const bf=basisOnFace(nB,faceRefU(nB));",
    "const O0=new THREE.Vector3(130,60,20);",
    "const hf=findHostForFace(O0,nB);",
    "att(!!hf&&hf.tag==='SIDE','face porteuse +X introuvable ('+(hf?hf.tag:'null')+')');",
    "const skp={id:'sk_p',name:'Poche',plane:'FACE',origin:[130,60,20],",
    "  axU:[bf.u.x,bf.u.y,bf.u.z],axV:[bf.v.x,bf.v.y,bf.v.z],axN:[1,0,0],",
    "  host:hf?{feat:hf.feat.id,tag:hf.tag,x:hf.x,y:hf.y,name:'face poche',edge:hf.edge,h:hf.h}:null,",
    "  points:{},entities:[],constraints:[],dims:[],seq:1,visible:true};",
    "skp.points.pa={x:-8,y:10};skp.points.pm={x:0,y:10};skp.points.pb={x:8,y:10};",
    "skp.points.pc={x:8,y:-10};skp.points.pd={x:-8,y:-10};",
    "[['pa','pm'],['pm','pb'],['pb','pc'],['pc','pd'],['pd','pa']].forEach(l=>skp.entities.push({id:'L'+l[0],t:'line',p1:l[0],p2:l[1]}));",
    "doc.sketches.push(skp);",
    "doc.features.push({id:'ex_p',type:'extrude',name:'Poche',sketchId:'sk_p',op:'cut',distance:-12,dist:-12,d2:0,visible:true});",
    "occCkClear();markDirty();rebuild();",
    // --- références monde (recalées à chaque appel : suivent l'origine de l'esquisse)
    "const refPos=(lx,ly,dn)=>{const B=sketchBasis(skp);",
    "  return [B.o.x+B.u.x*lx+B.v.x*ly+B.n.x*dn,B.o.y+B.u.y*lx+B.v.y*ly+B.n.y*dn,B.o.z+B.u.z*lx+B.v.z*ly+B.n.z*dn];};",
    "const kind=(E,i)=>{const m=E[i].mid;",
    "  if(dist3(m,refPos(-4,10,-12))<0.5||dist3(m,refPos(4,10,-12))<0.5)return 'fond';",
    "  if(dist3(m,refPos(-4,10,0))<0.5||dist3(m,refPos(4,10,0))<0.5)return 'rebord';",
    "  if(dist3(m,refPos(0,10,-6))<0.5)return 'couture';",
    "  return 'autre';};",
    "const listEdges=()=>{const FR=occFinalShape(null);",
    "  const e=FR&&FR.shape?occListEdges(FR.shape):[];",
    "  if(FR)try{occCleanup(FR,null);}catch(x){}return e;};",
    "let edges=listEdges();",
    "let nF=0,nR=0,nC=0,nA=0;",
    "edges.forEach((e,i)=>{const k=kind(edges,i);if(k==='fond')nF++;else if(k==='rebord')nR++;else if(k==='couture')nC++;else nA++;});",
    "att(nF===2,'fond : '+nF+' arête(s) trouvée(s) (2 attendues) sur '+edges.length);",
    "att(nR===2,'rebord : '+nR+' arête(s) trouvée(s) (2 attendues)');",
    "att(nC===1,'couture : '+nC+' arête(s) trouvée(s) (1 attendue)');",
    "p('arêtes : fond='+nF+' rebord='+nR+' couture='+nC+' autres='+nA+' total='+edges.length);",
    // --- ancre RÉELLE (xAnchorFor, comme à la création d'un congé) + pos0 = clic sur le
    // fond, projeté pile sur pm → ancre de type point avec niveau (z) enregistré
    "const posF=refPos(0,10,-12);",
    "const aF=xAnchorFor(posF);",
    "att(!!aF&&aF.t==='p','ancre du clic fond : '+(aF?(aF.t+'#'+aF.id):'null')+' (type point attendu)');",
    "att(!!aF&&isFinite(+aF.z),'ancre point SANS niveau z enregistré (z='+(aF&&aF.z)+') — le fond ne peut pas se distinguer du rebord');",
    "const mkSe=()=>({pos:posF.slice(),pos0:posF.slice(),r:2,len:8,anchor:aF,name:'fond'});",
    "const rep=(E,se,rev)=>{const got=xAnchorMatch(se,rev?E.slice().reverse():E);",
    "  if(!got||!got.length)return 'AUCUN';",
    "  return kind(E,rev?E.length-1-got[0]:got[0]);};",
    "const nat=rep(edges,mkSe(),false),rev=rep(edges,mkSe(),true);",
    "p('match fond : naturel → '+nat+'   inversé → '+rev);",
    "att(nat!=='AUCUN','ancre point du fond : aucun candidat');",
    "att(nat==='fond','AVANT modification : le congé du fond se pose sur « '+nat+' » (ordre naturel)');",
    "att(rev==='fond','AVANT modification : ordre inversé → « '+rev+' » — le choix dépend de l ordre OCCT');",
    // --- garde-fou : cliquer la COUTURE verticale doit garder la couture, dans les deux
    // ordres — le correctif ne doit pas faire basculer les cliquages légitimes d ailleurs
    "const posC=refPos(0,10,-6);",
    "const aC=xAnchorFor(posC);",
    "att(!!aC&&aC.t==='p','ancre du clic couture : '+(aC?(aC.t+'#'+aC.id):'null'));",
    "const mkSeC=()=>({pos:posC.slice(),pos0:posC.slice(),r:2,len:12,anchor:aC,name:'couture'});",
    "const cNat=rep(edges,mkSeC(),false),cRev=rep(edges,mkSeC(),true);",
    "p('match couture : naturel → '+cNat+'   inversé → '+cRev);",
    "att(cNat==='couture','clic sur la couture : naturel donne « '+cNat+' »');",
    "att(cRev==='couture','clic sur la couture : inversé donne « '+cRev+' »');",
    // --- le congé appliqué (chemin complet : feature + rejeu)
    "doc.features.push({id:'xf_p',type:'xfillet',name:'Congé exact (1 arête(s))',visible:true,",
    "  edges:[{pos:posF.slice(),pos0:posF.slice(),r:2,len:8,anchor:aF,name:'fond'}]});",
    "occCkClear();markDirty();rebuild();",
    "const nearFond=pos=>Math.min(dist3(pos,refPos(-4,10,-12)),dist3(pos,refPos(4,10,-12)));",
    "{",
    "  const f=doc.features.find(x=>x.id==='xf_p');",
    "  const e0=f.edges[0];",
    "  att(!!f._m&&f._m.m===1&&f._m.t===1,'congé : '+(f._m?(f._m.m+'/'+f._m.t):'compte absent')+' apparie(s) sur 1 attendue');",
    "  att(!f._miss||!f._miss.length,'congé : arête(s) perdue(s) '+JSON.stringify(f._miss||[]));",
    "  p('apres creation : pos='+JSON.stringify(e0.pos.map(v=>+v.toFixed(1)))+' apparie '+(f._m?f._m.m+'/'+f._m.t:'sans compte')+' distFond='+nearFond(e0.pos).toFixed(2));",
    "  att(nearFond(e0.pos)<0.6,'apres creation : le congé est à '+nearFond(e0.pos).toFixed(1)+' mm du FOND — pos='+JSON.stringify(e0.pos.map(v=>+v.toFixed(1))));",
    "}",
    // --- Esquisse 1 modifiée « en longueur » : 130 → 150 (la face +X glisse, la poche suit)
    "sk.points.p1.x=150;sk.points.p2.x=150;",
    "occCkClear();markDirty();rebuild();",
    "p('apres allongement 130 → 150 (poche glissée de 20 mm)');",
    "{",
    "  const f=doc.features.find(x=>x.id==='xf_p');",
    "  const e0=f.edges[0];",
    "  att(!!f._m&&f._m.m===1&&f._m.t===1,'apres allongement : '+(f._m?(f._m.m+'/'+f._m.t):'compte absent')+' apparie(s) sur 1 attendue');",
    "  att(!f._miss||!f._miss.length,'apres allongement : arête perdue '+JSON.stringify(f._miss||[]));",
    "  p('congé apres rejeu : pos='+JSON.stringify(e0.pos.map(v=>+v.toFixed(1)))+' apparie '+(f._m?f._m.m+'/'+f._m.t:'sans compte')+' distFond='+nearFond(e0.pos).toFixed(2));",
    "  att(nearFond(e0.pos)<0.6,'APRES modification : le congé est à '+nearFond(e0.pos).toFixed(1)+' mm du FOND (attendu <0.6) — pos='+JSON.stringify(e0.pos.map(v=>+v.toFixed(1))));",
    "}",
    // Match mesuré sur la BASE sans le congé (occSkipFeat) : c'est exactement le solide que
    // occApplyXFillets reçoit en production (occReplayBody applique l'xfilt sur l'accumulateur
    // précédent). Le solide AVÉRÉ, lui, est contrôlé ci-dessus via f._m et e0.pos.
    "occSkipFeat='xf_p';markDirty();rebuild();",
    "const edges2=listEdges();",
    "occSkipFeat=null;markDirty();rebuild();",
    "const nat2=rep(edges2,mkSe(),false),rev2=rep(edges2,mkSe(),true);",
    "p('match fond apres : naturel → '+nat2+'   inversé → '+rev2);",
    "att(nat2!=='AUCUN','apres allongement : aucun candidat');",
    "att(nat2==='fond','APRES modification Esquisse 1 : le congé du fond bascule sur « '+nat2+' »');",
    "att(rev2==='fond','APRES modification : ordre inversé → « '+rev2+' »');",
    "const cNat2=rep(edges2,mkSeC(),false),cRev2=rep(edges2,mkSeC(),true);",
    "p('match couture apres : naturel → '+cNat2+'   inversé → '+cRev2);",
    "att(cNat2==='couture','apres : clic couture → naturel « '+cNat2+' »');",
    "att(cRev2==='couture','apres : clic couture → inversé « '+cRev2+' »');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));return P.join(String.fromCharCode(10));}",
    "p('');p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'conge_fond.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
