// Bibliothèque de matériaux (V0.10.0) : UNE liste partagée par la CAO (couleur, masse estimée)
// et l'atelier RENDU. Vérifie l'intégrité de la liste, l'écriture dans la fiche du corps
// (doc.bodies[].mat + couleur de base), la couleur modifiable ensuite, l'enregistrement,
// l'apparence de RENDU séparée de la CAO, l'enregistrement, le volume d'un maillage (vrai three.js), le champ « Matériau » du panneau et les points d'entrée du rendu.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const staticKo=[];
// garde statique : l'atelier a SA scène et SON moteur, il ne touche jamais ceux de la CAO
const rendu=fs.readFileSync(path.join(ROOT,'src','98-rendu.js'),'utf8');
// vue CAO : cases Sol / Miroir (HTML) et Ombre (98-rendu-vue), shader du sol à deux réglages
const html0=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8'),vue=fs.readFileSync(path.join(ROOT,'src','98-rendu-vue.js'),'utf8'),sc3=fs.readFileSync(path.join(ROOT,'src','10-scene-3d.js'),'utf8');
if(!/id="optFloor"/.test(html0)||!/id="optMirror"/.test(html0))staticKo.push('réglages de vue : cases « Sol » et « Miroir » attendues');
if(/if\(mirrorOn&&floorMesh&&mirrorCam&&!/.test(sc3))staticKo.push('reflet : la passe miroir ne doit pas être coupée sous une ambiance (reflet figé)');
if(!/if\(vu\)\{/.test(sc3))staticKo.push('reflet : passe recalculée à chaque image attendue');
// V0.17.0 : « rendu léger » — en ambiance, la vue montre l'apparence de RENDU (relief compris), choisie au clic droit par pièce
if(!/renderLookOf/.test(vue)||!/relShader\(sh\)/.test(vue))staticKo.push('vue en ambiance : apparence de rendu et relief de chaque pièce attendus');
if(!/ws==='fao'/.test(vue))staticKo.push('vue en ambiance : espace FAO attendu');
// V0.18.2 : bouton « Rendu direct » (orange = actif), réglages de la fenêtre RENDU (ambiance, fond, reflets)
if(!/btnLive/.test(vue)||!/\['rendu','Rendu direct/.test(vue)||!/function vEnvCfg\(/.test(vue))staticKo.push('bouton Rendu direct et ambiance « rendu » attendus');
if(!/vEnvRdSt=null/.test(rendu))staticKo.push('Rendu direct : réglages de la fenêtre RENDU relus à l\'enregistrement');
{const ap=fs.readFileSync(path.join(ROOT,'src','98-rendu-apparence.js'),'utf8');
  if(!/function rdLookPop\(/.test(ap)||!/ctxRdLook/.test(ap))staticKo.push('apparence de rendu au clic droit (98-rendu-apparence) attendue');
  if(/matSelect\(L\.mat/.test(rendu))staticKo.push('atelier : plus de liste déroulante par pièce dans le panneau (clic droit)');}
if(/castShadow=shW&&!mat\.transparent/.test(vue))staticKo.push('ombre : les corps transparents doivent porter leur ombre');
if(!/solOn:true/.test(rendu)||!/miroir:true/.test(rendu)||!/ombreOn:true/.test(rendu)||!/function rdMirror\(/.test(rendu))staticKo.push('atelier : cases Sol / Miroir / Ombre et passe reflet attendues');
if(!/optShadow/.test(vue))staticKo.push('réglages de vue : case « Ombre » attendue');
if(!/uniform float uDisk; uniform float uRefl;/.test(sc3)||!/function floorSync\(/.test(sc3))staticKo.push('sol : shader Sol / Miroir séparés (uDisk, uRefl) et floorSync attendus');
if(/(^|[^.\w])(scene|renderer|camera)\s*=[^=]/m.test(rendu))staticKo.push('98-rendu.js : réaffecte la scène, le moteur ou la caméra de la CAO');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- intégrité de la liste
    "const ks=new Set();MAT_LIB.forEach(m=>{att(!ks.has(m.k),'clé en double : '+m.k);ks.add(m.k);});",
    "att(MAT_LIB.length>=40,'au moins 40 matériaux ('+MAT_LIB.length+')');",
    "MAT_LIB.forEach(m=>{",
    "  att(MAT_FAMS.indexOf(m.fam)>=0,m.k+' : famille inconnue');",
    "  att(typeof m.nom==='string'&&m.nom.length>1,m.k+' : nom');",
    "  att(m.col>=0&&m.col<=0xffffff,m.k+' : couleur');",
    "  att(m.metal>=0&&m.metal<=1&&m.rough>=0&&m.rough<=1,m.k+' : métal / rugosité hors 0..1');",
    "  att(m.rho==null||(m.rho>0.5&&m.rho<25),m.k+' : densité');",
    "});",
    "MAT_FAMS.forEach(f=>att(MAT_LIB.some(m=>m.fam===f),'famille vide : '+f));",
    "att(matDef('inox').nom==='Inox brossé'&&matDef('nimporte')===null&&matDef(null)===null,'matDef');",
    // --- fiche du corps
    "doc={name:'Mat',sketches:[],features:[],bodies:[],bodyVis:{},bodySeq:1,activeBody:null,fold:{}};",
    "ensureBodies();newBody();const id=doc.bodies[0].id;",
    "att(bodyMatOf(id)===null,'corps neuf : aucun matériau');",
    "setBodyMat(id,'laiton');",
    "att(bodyMatOf(id)==='laiton','setBodyMat écrit la clé');",
    "att(bodyColorOf(id)===matDef('laiton').col,'setBodyMat donne la couleur du matériau');",
    "setBodyColor(id,0x123456);",
    "att(bodyMatOf(id)==='laiton'&&bodyColorOf(id)===0x123456,'couleur changée à la main : le matériau reste');",
    "const js=JSON.parse(JSON.stringify(doc));att(js.bodies[0].mat==='laiton','enregistré avec la pièce');",
    "setBodyMat(id,'xxx');att(bodyMatOf(id)===null&&doc.bodies[0].mat===undefined,'clé inconnue : matériau retiré');",
    // --- verre approché (vue CAO) : transparence du matériau, sauf réglage « Transparence » du corps
    "setBodyGlass(id,1);setBodyMat(id,'verre');att(bodyGlassEff(id)===0.12,'verre : transparent dans la vue (gv)');",
    "setBodyMat(id,'verre-depoli');att(bodyGlassEff(id)===0.5,'verre dépoli : laiteux');",
    "setBodyGlass(id,0.7);att(bodyGlassEff(id)===0.7,'réglage Transparence du corps prioritaire');setBodyGlass(id,1);",
    "MAT_LIB.forEach(m=>att(!m.trans||(m.gv>0&&m.gv<1),m.k+' : un verre doit avoir sa transparence de vue (gv)'));",
    "setBodyMat(id,'alu');",
    // --- reliefs (V0.11.0) : données, défauts des matériaux, apparence de rendu
    "MAT_LIB.forEach(m=>{if(m.rel)att(!!REL_ID[m.rel.t],m.k+' : relief par défaut inconnu');});",
    "att(relOf(null,matDef('inox')).t==='brosse'&&relOf(null,matDef('inox')).e===REL_DEF.brosse.e,'inox : brossé par défaut');",
    "att(relOf(null,matDef('pla-mat')).d==='z','PLA : couches selon Z');",
    "att(relOf({rel:{t:'aucun'}},matDef('inox'))===null,'relief « aucun » : rien');",
    "att(relOf({rel:{e:0.5,d:'y'}},matDef('inox')).t==='brosse'&&relOf({rel:{e:0.5,d:'y'}},matDef('inox')).e===0.5,'relief : échelle et direction propres, type du matériau');",
    "att(relOf(null,matDef('laiton'))===null,'laiton : sans relief');",
    "att(relNorm({t:'zz',e:-1,d:'w'})===null&&relNorm({t:'molete',e:1.2,d:'z'}).t==='molete','relNorm');",
    "setRenderLook(id,'inox',null,{t:'molete',e:1,d:'z'});att(renderLookOf(id).rel.t==='molete','rendu : relief propre enregistré');",
    "setRenderLook(id,'inox',0x112233);att(renderLookOf(id).rel&&renderLookOf(id).rel.t==='molete','rendu : changer la couleur garde le relief');",
    "setRenderLook(id,'laiton',null);att(!renderLookOf(id).rel,'rendu : changer de matériau reprend le relief du matériau');",
    // --- vues enregistrées : relues, gardées quand on revient à l'apparence CAO
    "doc.rendu.cams=[{n:'Vue 1',p:[1,2,3],t:[0,0,0],f:85},{n:'x',p:[1,2]}];",
    "const _sv=JSON.parse(JSON.stringify(serialiseObj(doc,false)));att(_sv.rendu.cams.length===1&&_sv.rendu.cams[0].f===85&&_sv.rendu.cams[0].u[2]===1,'vues : enregistrées, invalides écartées');",
    "clearRenderLook(id);att(doc.rendu&&doc.rendu.cams&&doc.rendu.cams.length===2,'↺ : les vues enregistrées restent');doc.rendu=null;",
    // --- affinage : suite de Halton dans [0,1[, points dans le disque unité
    "let _hk=true;for(let i=0;i<200;i++){const h=rdHalton(i,2),[u,v]=rdDisk2(i,5,7);if(!(h>=0&&h<1)||u*u+v*v>1+1e-9)_hk=false;}att(_hk,'Halton / disque');",
    // --- apparence de RENDU : séparée de la CAO
    "att(renderLookOf(id).mat==='alu'&&!renderLookOf(id).own,'rendu : reprend la CAO par défaut');",
    "setRenderLook(id,'laiton',null);",
    "att(renderLookOf(id).mat==='laiton'&&renderLookOf(id).color===matDef('laiton').col&&renderLookOf(id).own,'rendu : matériau propre');",
    "att(bodyMatOf(id)==='alu'&&bodyColorOf(id)===matDef('alu').col,'rendu : la CAO garde son matériau et sa couleur');",
    "setRenderLook(id,null,0xff0000);att(renderLookOf(id).mat===null&&renderLookOf(id).color===0xff0000,'rendu : « sans matériau » même si la CAO en a un');",
    "setRenderLook(id,'inox',0x445566);",
    // --- enregistrement : matériau CAO ET apparence de rendu (champs listés un par un dans serialiseObj)
    "const so=JSON.parse(JSON.stringify(serialiseObj(doc,false)));",
    "att(so.bodies[0].mat==='alu','fichier : matériau CAO enregistré');",
    "att(so.rendu&&so.rendu.corps[id].mat==='inox'&&so.rendu.corps[id].col===0x445566,'fichier : apparence de rendu enregistrée (matériau + couleur)');",
    "const dd=docFromSerial(so);",
    "att(dd.bodies[0].mat==='alu'&&dd.rendu.corps[id].col===0x445566&&dd.rendu.corps[id].mat==='inox','fichier : relu à l ouverture');",
    "att(renduNorm({corps:{x:{mat:'zzz',col:-4},y:{mat:''}}}).corps.y.mat===''&&!renduNorm({corps:{x:{mat:'zzz'}}}),'renduNorm : champs invalides écartés');",
    "clearRenderLook(id);att(!renderLookOf(id).own&&doc.rendu===null,'↺ : retour à la CAO');",
    // --- rendu d'assemblage : apparence de rendu par occurrence (o.rendu), enregistrée avec l'assemblage
    "const _d0=doc;const _pd={name:'P',sketches:[],features:[],cgeo:[],bodyVis:{},bodies:[{id:'b1',name:'Corps 1',color:0xffd60a}],bodySeq:2,activeBody:null};",
    "const _t=asmTreeFromSerial({v:2,name:'A',root:'r',comps:[{id:'r',name:'A',doc:null,occ:[{id:'o1',comp:'p',name:'P:1',fr:asmFr0(),rendu:{corps:{b1:{mat:'laiton',col:0x123456},b9:{mat:'zzz'}}}},{id:'o2',comp:'p',name:'P:2',fr:asmFr0()}]},{id:'p',name:'P',doc:serialiseObj(_pd,false),occ:[]}]},_d0);",
    "att(!!_t,'assemblage relu');",
    "const _o1=_t.comps[0].occ.find(o=>o.id==='o1');att(_o1.rendu&&_o1.rendu.corps.b1.mat==='laiton'&&!_o1.rendu.corps.b9,'occurrence : apparence de rendu relue et normalisée');",
    "const _asm0=asm;asm={name:'A',root:'r',comps:_t.comps,path:[],active:'r'};",
    "att(asmOccRenduOf(['o1'],'b1').mat==='laiton'&&asmOccRenduOf(['o1'],'b1').col===0x123456,'asmOccRenduOf : occurrence');",
    "att(asmOccRenduOf(['o2'],'b1')===null,'autre occurrence : apparence de la pièce');",
    "att(asmOccSerial(_o1).rendu.corps.b1.mat==='laiton'&&!asmOccSerial(_t.comps[0].occ[1]).rendu,'occurrence : enregistrée seulement si réglée');",
    "asm=_asm0;",
    // --- masse affichée (le volume se vérifie plus bas avec le vrai three.js)
    "att(fmtMasse(16.2)==='16,2 g'&&fmtMasse(1620)==='1,62 kg','fmtMasse');",
    // --- panneau du corps : champ « Matériau » (même liste groupée par famille)
    "let _f=null;try{_f=bodyStyleField(id);}catch(e){att(false,'bodyStyleField : '+e.message);}att(!!_f,'fiche du corps construite avec le champ « Matériau »');",
    // --- atelier RENDU : points d'entrée
    "att(typeof rdOpen==='function'&&typeof rdClose==='function'&&typeof rdExport==='function','rdOpen / rdClose / rdExport');",
    "att(Math.abs(rdFov(50)-2*Math.atan(18/50/(16/9))*180/Math.PI)<1e-9,'focale → champ vertical 16:9');",
    "att(!!document.getElementById('btnRender'),'appareil photo dans la barre de vue');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'materiaux.js'});
  // volume d'un maillage avec le VRAI three.js (le bac à sable de appvm n'a que des stubs)
  const c3={console};vm.createContext(c3);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'threejs','three.min.js'),'utf8'),c3);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'src','12-materiaux.js'),'utf8'),c3);
  const v=vm.runInContext("const m=new THREE.Mesh(new THREE.BoxGeometry(10,20,30));m.position.set(5,-3,7);m.rotation.z=0.7;meshVolumeMm3(m)",c3);
  if(!(Math.abs(v-6000)<1e-6))staticKo.push("volume d'un pavé 10×20×30 (déplacé, tourné) : "+v+' au lieu de 6000');
  else console.log("volume d'un pavé 10×20×30 : 6000 mm³ ✓");
  // environnements de rendu de la vue : les lignes du shader retouchées existent bien dans three r147
  const frag=vm.runInContext('THREE.ShaderChunk.meshphysical_frag',c3);
  // reliefs : ancrages du shader présents dans three r147 (sinon le relief serait silencieusement absent)
  const vert=vm.runInContext('THREE.ShaderChunk.meshphysical_vert',c3);
  ['#include <beginnormal_vertex>','#include <begin_vertex>'].forEach(t=>{if(vert.indexOf(t)<0)staticKo.push('relApply : « '+t+' » absent du shader de three.js');});
  if(vert.indexOf('#include <beginnormal_vertex>')>vert.indexOf('#include <begin_vertex>'))staticKo.push('relApply : objectNormal doit précéder begin_vertex');
  ['#include <color_fragment>','#include <normal_fragment_maps>'].forEach(t=>{if(frag.indexOf(t)<0)staticKo.push('relApply : « '+t+' » absent du shader de three.js');});
  ['vec4 diffuseColor = vec4( diffuse, opacity );','vec3 totalEmissiveRadiance = emissive;','#include <roughnessmap_fragment>','#include <metalnessmap_fragment>','#include <encodings_fragment>']
    .forEach(t=>{if(frag.indexOf(t)<0)staticKo.push('vEnvPatch : « '+t+' » absent du shader de three.js');});
  // focale : la pièce garde sa taille à l'écran (l'appareil recule), jamais distance 0 (bug V0.10.0)
  vm.runInContext(fs.readFileSync(path.join(ROOT,'src','98-rendu.js'),'utf8'),c3);
  const fz=JSON.parse(vm.runInContext(`
    const cam=new THREE.PerspectiveCamera(30,16/9,0.1,1e4);cam.up.set(0,0,1);cam.position.set(100,-100,80);
    const tg=new THREE.Vector3(5,-4,-16);
    rd={st:{focale:50,envInt:1,ev:0,tons:'aces'},cam,ctl:{target:tg,update(){}},r:{},group:{traverse(){}},
      box:new THREE.Box3(new THREE.Vector3(-40,-40,-40),new THREE.Vector3(40,40,40))};
    const ch=()=>Math.tan(rdFov(rd.st.focale)*Math.PI/360)*cam.position.distanceTo(tg);
    const r=[[rd.st.focale,cam.position.distanceTo(tg),ch()]];
    [85,200,14,50].forEach(f=>{rdSetFocale(f);r.push([rd.st.focale,cam.position.distanceTo(tg),ch()]);});
    JSON.stringify(r)`,c3));
  const ch0=fz[0][2];
  fz.forEach(([f,d,ch])=>{
    if(!(d>1))staticKo.push('focale '+f+' mm : appareil sur la cible (distance '+d+')');
    if(Math.abs(ch-ch0)>1e-6*ch0)staticKo.push('focale '+f+' mm : la pièce change de taille à l\'écran');
  });
  if(Math.abs(fz[4][1]-fz[0][1])>1e-6*fz[0][1])staticKo.push('focale : retour à 50 mm ≠ position de départ');
  console.log('focale 50 → 85 → 200 → 14 → 50 mm : même cadrage, distances '+fz.map(x=>x[1].toFixed(0)).join(' / '));
  console.log(r);
  if(staticKo.length){console.log('ECHECS statiques :');staticKo.forEach(m=>console.log('  x '+m));}
  process.exit((/ECHECS|  x /.test(r)||staticKo.length)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
