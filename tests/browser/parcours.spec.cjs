// Parcours critiques dans un VRAI navigateur (Chromium headless) : noyau OCCT
// WebAssembly réel, rendu WebGL réel, interface moderne cliquée comme un
// utilisateur. Complète les tests VM (tests/*.cjs, stubs DOM/THREE) qui ne
// voient ni le .wasm ni le navigateur.
//   1. ouvrir Exemples/Axe.miniFusion → solide exact, congés présents ;
//   2. esquisse (rectangle à la souris) → extrusion → prisme exact au bon volume ;
//   3. FAO : surfaçage sur l'Axe → « Régénérer » → export G-code (téléchargement).
'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');

const RACINE=path.join(__dirname,'..','..');
const AXE=path.join(RACINE,'Exemples','Axe.miniFusion');

// Git LFS non récupéré → pointeurs de 130 octets à la place des binaires : on le dit
// tout de suite plutôt que de laisser le noyau échouer sans explication.
test.beforeAll(()=>{
  for(const f of ['occt/opencascade.wasm.wasm','occt/opencascade.full.wasm','Exemples/Axe.miniFusion']){
    const n=fs.statSync(path.join(RACINE,f)).size;
    if(n<10000)throw new Error(f+' ne fait que '+n+' octets : pointeur Git LFS ? Lancez « git lfs pull ».');
  }
});

// Page prête : livrable chargé, noyau OCCT compilé et vérifié. Les erreurs JS non
// rattrapées et les boîtes de dialogue sont relevées (un alert() = un échec).
async function demarrer(page){
  const err=[];
  page.on('pageerror',e=>err.push('pageerror : '+e.message));
  page.on('dialog',d=>{err.push('dialog : '+d.message());d.dismiss().catch(()=>{});});
  await page.goto('/fusion_mvp.html');
  await page.waitForFunction(()=>typeof occtReady!=='undefined'&&(occtReady===true||/échec|indisponible/.test(occBaseMsg)),null,{timeout:200000});
  const etat=await page.evaluate(()=>({ok:occtReady,msg:occBaseMsg,ver:APP_VER}));
  expect(etat.ok,'noyau OCCT : '+etat.msg).toBe(true);
  expect(etat.ver).toMatch(/^V\d+\.\d+\.\d+$/);
  // Rejeu du démarrage (document vide) terminé
  await page.waitForFunction(()=>!skEdit&&rebuildDepth===0);
  return err;
}
// Bouton VISIBLE du ruban moderne (les boutons d'origine sont masqués par l'interface).
const ruban=(page,nom)=>page.locator('#mfRibbon button.mfRb:visible',{hasText:nom}).first();

// Statistiques du solide exact affiché (occLive) : volume, faces par type de surface.
async function solide(page){
  return page.evaluate(()=>{
    const sh=occLive&&occLive.shape;if(!sh)return null;
    const T={};
    const x=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(x.More()){
      const s=new occt.BRepAdaptor_Surface_2(occt.TopoDS.Face_1(x.Current()),true);
      const k=s.GetType();const nom=Object.keys(occt.GeomAbs_SurfaceType).find(q=>occt.GeomAbs_SurfaceType[q]===k)||String(k);
      T[nom.replace('GeomAbs_','')]=(T[nom.replace('GeomAbs_','')]||0)+1;
      s.delete();x.Next();
    }
    x.delete();
    return {moteur:builtEngine,volume:occCoqueVolume(sh),faces:occCoqueNFaces(sh),types:T};
  });
}
async function ouvrirAxe(page){
  await page.setInputFiles('#fileProj',AXE);
  await page.waitForFunction(()=>doc&&doc.name==='Axe'&&builtEngine==='exact'&&bodies.some(b=>b.shape)&&faoSolidSettled(),null,{timeout:120000});
}

test('ouvrir Axe.miniFusion : solide exact avec ses congés',async({page})=>{
  const err=await demarrer(page);
  await ouvrirAxe(page);
  await expect(page.locator('#occtState')).toContainText('exact OCCT');
  const info=await page.evaluate(()=>({
    feats:doc.features.map(f=>f.type),
    conges:doc.features.filter(f=>f.type==='xfillet'&&/Congé/.test(f.name)).length,
    corps:bodies.filter(b=>!b.ghost&&b.shape).length
  }));
  expect(info.feats.length).toBe(13);
  expect(info.conges).toBe(1);
  expect(info.corps).toBe(1);
  const S=await solide(page);
  expect(S.moteur).toBe('exact');
  // Révolution + perçages + chanfreins + congé : 55 faces exactes, dont 2 tores = le
  // congé exact sur 2 arêtes circulaires (sans lui : 0 tore). Volume de référence
  // mesuré sur V0.4.7 (78 916,27 mm³).
  expect(S.faces).toBe(55);
  expect(S.types.Torus,'faces toriques du congé').toBe(2);
  expect(S.types.Cone,'faces coniques des chanfreins / fraisures').toBeGreaterThan(0);
  expect(S.volume).toBeGreaterThan(78916.27*0.999);
  expect(S.volume).toBeLessThan(78916.27*1.001);
  expect(err).toEqual([]);
});

test('esquisse rectangle → extrusion : prisme exact',async({page})=>{
  const err=await demarrer(page);
  await ruban(page,'Esquisse').click();
  await page.waitForFunction(()=>!!skEdit&&skEdit.plane==='XY');
  await page.locator('#skToolbar .tool[data-tool="rect"]').click();
  // Rectangle -20,-10 → 30,15 (mm) tracé à la souris : clic, glissé, clic.
  const [a,b]=await page.evaluate(()=>{const r=svg.getBoundingClientRect();
    return [w2s(-20,-10),w2s(30,15)].map(([x,y])=>[x+r.left,y+r.top]);});
  await page.mouse.click(a[0],a[1]);
  await page.mouse.move((a[0]+b[0])/2,(a[1]+b[1])/2,{steps:4});
  await page.mouse.move(b[0],b[1],{steps:4});
  await page.mouse.click(b[0],b[1]);
  const sk=await page.evaluate(()=>{
    const P=Object.keys(skEdit.points).filter(k=>k!=='O').map(k=>skEdit.points[k]);
    const xs=P.map(p=>p.x),ys=P.map(p=>p.y);
    return {lignes:skEdit.entities.filter(e=>e.t==='line'&&!e.construction).length,
      w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
  });
  expect(sk.lignes).toBe(4);
  expect(sk.w).toBeGreaterThan(40);expect(sk.h).toBeGreaterThan(15);
  await page.locator('#skOk').click();
  await page.waitForFunction(()=>!skEdit);
  // Extrusion : formulaire du panneau (Plot, 12 mm) puis « Créer »
  await ruban(page,'Extrusion').click();
  await page.locator('#props select').first().selectOption('add');
  const dist=page.locator('#props input[type=text]').first();
  await dist.fill('12');await dist.dispatchEvent('change');
  await page.locator('#props button',{hasText:'Créer'}).click();
  await page.waitForFunction(()=>doc.features.some(f=>f.type==='extrude')&&builtEngine==='exact'&&!!(occLive&&occLive.shape),null,{timeout:60000});
  const f=await page.evaluate(()=>{const f=doc.features.find(x=>x.type==='extrude');return {op:f.op,d:f.distance};});
  expect(f).toEqual({op:'add',d:12});
  const S=await solide(page);
  expect(S.faces).toBe(6);
  expect(S.types).toEqual({Plane:6});
  expect(Math.abs(S.volume-sk.w*sk.h*12)).toBeLessThan(1e-6*S.volume+1e-6);
  expect(err).toEqual([]);
});

test('plan de construction décalé → esquisse dessus → extrusion au bon endroit',async({page})=>{
  const err=await demarrer(page);
  // Ruban « Plan » → référence = Plan XY (clic dans l'arbre) → distance 20 → ✓
  await ruban(page,'Plan').click();
  await page.waitForFunction(()=>!!cgMode&&cgMode.draft.kind==='plane'&&cgMode.slot===0);
  await page.locator('#tree .tnode',{hasText:'Plan XY'}).click();
  await page.waitForFunction(()=>cgMode&&cgMode.draft.refs[0]&&cgMode.draft.refs[0].id==='XY');
  const dist=page.locator('#props input[type=text]').first();
  await dist.fill('20');await dist.press('Enter');
  await page.locator('#props button',{hasText:'Valider'}).click();
  await page.waitForFunction(()=>!cgMode&&doc.cgeo.length===1&&doc.cgeo[0].fr&&Math.abs(doc.cgeo[0].fr.o[2]-20)<1e-9);
  // Double-clic sur « Plan 1 » dans l'arbre → esquisse posée sur le plan. Libellé complet : une
  // fois l'esquisse créée, sa ligne « Esquisse 1 · Plan 1 · … » contient aussi « Plan 1 »
  // (un locator ambigu fait échouer l'action en mode strict).
  await page.locator('#tree .tnode',{hasText:'Plan 1 · Décalé'}).dblclick();
  await page.waitForFunction(()=>!!skEdit&&skEdit.plane==='CG'&&Math.abs(skEdit.origin[2]-20)<1e-9);
  await page.locator('#skToolbar .tool[data-tool="rect"]').click();
  const [a,b]=await page.evaluate(()=>{const r=svg.getBoundingClientRect();
    return [w2s(-15,-10),w2s(25,10)].map(([x,y])=>[x+r.left,y+r.top]);});
  await page.mouse.click(a[0],a[1]);
  await page.mouse.move((a[0]+b[0])/2,(a[1]+b[1])/2,{steps:4});
  await page.mouse.move(b[0],b[1],{steps:4});
  await page.mouse.click(b[0],b[1]);
  await page.locator('#skOk').click();
  await page.waitForFunction(()=>!skEdit);
  await ruban(page,'Extrusion').click();
  await page.locator('#props select').first().selectOption('add');
  const d=page.locator('#props input[type=text]').first();
  await d.fill('10');await d.dispatchEvent('change');
  await page.locator('#props button',{hasText:'Créer'}).click();
  await page.waitForFunction(()=>doc.features.some(f=>f.type==='extrude')&&builtEngine==='exact'&&!!(occLive&&occLive.shape),null,{timeout:60000});
  const zBox=()=>page.evaluate(()=>{const b=new occt.Bnd_Box_1();b.SetGap(0);occt.BRepBndLib.Add(occLive.shape,b,false);const r=[b.CornerMin().Z(),b.CornerMax().Z()];b.delete();return r;});
  let z=await zBox();
  expect(z[0]).toBeCloseTo(20,4);expect(z[1]).toBeCloseTo(30,4);
  // Le plan monte à 35 (panneau Modifier) : esquisse et solide suivent
  await page.locator('#tree .tnode',{hasText:'Plan 1 · Décalé'}).click();
  await page.locator('#props button',{hasText:'Modifier'}).click();
  const d2=page.locator('#props input[type=text]').first();
  await d2.fill('35');await d2.press('Enter');
  await page.locator('#props button',{hasText:'Valider'}).click();
  await page.waitForFunction(()=>!cgMode&&builtEngine==='exact'&&builtVersion===_docVersion&&rebuildDepth===0,null,{timeout:60000});
  z=await zBox();
  expect(z[0]).toBeCloseTo(35,4);expect(z[1]).toBeCloseTo(45,4);
  expect(err).toEqual([]);
});

test('composants : racine avec un repère de base, composant aligné qui suit, sous-composant',async({page})=>{
  const err=await demarrer(page);
  // Géométrie par script (le tracé à la souris est couvert plus haut) ; les commandes de
  // composants, elles, sont cliquées dans le ruban, l'arbre et le panneau.
  const bloc=(w,h,d)=>page.evaluate(([w,h,d])=>{
    newSketch('XY');const sk=skEdit;const P=[[0,0],[w,0],[w,h],[0,h]].map(([x,y])=>addPoint(sk,x,y));
    for(let i=0;i<4;i++)sk.entities.push({id:'L'+i,t:'line',p1:P[i],p2:P[(i+1)%4]});
    closeSketch(true);
    addFeature({id:uid('ex'),type:'extrude',name:'Bloc',sketchId:sk.id,op:'add',distance:d});markDirty();rebuild();
  },[w,h,d]);
  const pret=()=>page.waitForFunction(()=>builtEngine==='exact'&&rebuildDepth===0&&builtVersion===_docVersion&&!!(occLive&&occLive.shape),null,{timeout:60000});
  // Racine : socle 40 × 30 × 20, repère de base sur la face du DESSUS (référence de face)
  await bloc(40,30,20);await pret();
  await page.evaluate(()=>{
    doc.name='Socle';
    const fs=[];const x=new occt.TopExp_Explorer_2(occLive.shape,occt.TopAbs_ShapeEnum.TopAbs_FACE,occt.TopAbs_ShapeEnum.TopAbs_SHAPE);
    while(x.More()){fs.push(occt.TopoDS.Face_1(x.Current()));x.Next();}x.delete();
    const top=fs.map(f=>occFaceRefAny(f)).filter(r=>r&&r.n&&r.n[2]>0.99).sort((a,b)=>b.pos[2]-a.pos[2])[0];
    cgNew('frame','face',[{k:'face',ref:top,name:'Dessus'}],{});markDirty();rebuild();
  });
  await pret();
  // Ruban « Composant » : nouveau composant dans la racine, on est dedans
  await ruban(page,'Composant').click();
  await page.waitForFunction(()=>asm&&asm.comps.length===2&&asmRoot().occ.length===1&&asmMode==='part'&&doc.features.length===0);
  await bloc(10,10,60);await pret();
  await page.evaluate(()=>{cgNew('frame','zx',[{k:'o',id:'O'},{k:'o',id:'Z'}],{dx:5,dy:5});markDirty();rebuild();});
  await pret();
  // Placer (depuis un composant sans enfants : on remonte à la racine, l'occurrence sélectionnée)
  await ruban(page,'Placer').click();
  await page.waitForFunction(()=>asmMode==='asm'&&!asm.path.length&&asmScene.getObjectByName('asmOcc').children.length===2);
  await page.locator('#tree .tnode',{hasText:'Composant 1:1'}).click();
  await page.locator('#props button',{hasText:'Aligner un repère'}).click();
  await page.locator('#props button',{hasText:'Repère 1'}).first().click(); // repère du composant à poser
  await page.locator('#props button',{hasText:'Repère 1'}).last().click();  // repère de base de la racine
  await page.locator('#props button',{hasText:'Valider'}).click();
  const pied=()=>page.evaluate(()=>{const o=asmRoot().occ[0];return asmCompose(o.fr,asmRelFrame(o.comp,o.align&&o.align.src)).o;});
  let o=await pied();
  expect(o[0]).toBeCloseTo(20,6);expect(o[1]).toBeCloseTo(15,6);expect(o[2]).toBeCloseTo(20,6);
  // Modéliser la racine (hauteur 35), puis Placer : le composant suit
  await page.keyboard.press('Escape'); // désélectionne : le panneau est celui de la racine
  await page.locator('#props button',{hasText:'Modéliser « Socle »'}).click();
  await page.waitForFunction(()=>asmMode==='part'&&doc.name==='Socle');
  await page.evaluate(()=>{const f=doc.features.find(x=>x.type==='extrude');docPushUndo('hauteur');f.distance=35;markDirty();rebuild();});
  await pret();
  await ruban(page,'Placer').click();
  await page.waitForFunction(()=>asmMode==='asm');
  o=await pied();
  expect(o[2]).toBeCloseTo(35,6);
  // Sous-composant : double-clic sur Composant 1:1 (on le modélise), puis « Composant »
  await page.locator('#tree .tnode',{hasText:'Composant 1:1'}).dblclick();
  await page.waitForFunction(()=>asmMode==='part'&&asm.path.length===1);
  await ruban(page,'Composant').click();
  await page.waitForFunction(()=>asm.path.length===2&&asmMode==='part'&&doc.features.length===0);
  await expect(page.locator('#tree .asmCrumb')).toContainText('Socle›Composant 1›Composant 2');
  expect(await page.evaluate(()=>asmComp(asmRoot().occ[0].comp).occ.length)).toBe(1);
  expect(err).toEqual([]);
});

test('composants depuis les corps : clic droit sur un corps, même place, Ctrl+Z',async({page})=>{
  const err=await demarrer(page);
  // Deux corps par script ; la conversion, elle, passe par le clic droit de l'arbre
  await page.evaluate(()=>{
    const mkSk=(name,pts)=>{newSketch('XY');const sk=skEdit;sk.name=name;const P=pts.map(([x,y])=>addPoint(sk,x,y));
      for(let i=0;i<P.length;i++)sk.entities.push({id:'L'+i,t:'line',p1:P[i],p2:P[(i+1)%P.length]});closeSketch(true);return sk;};
    const a=mkSk('Esquisse socle',[[-20,-20],[20,-20],[20,20],[-20,20]]);
    addFeature({id:uid('ex'),type:'extrude',name:'Socle',sketchId:a.id,op:'add',distance:20});
    const b=mkSk('Esquisse colonne',[[30,-5],[40,-5],[40,5],[30,5]]);extNew={sketchId:b.id,op:'new',dist:50};extNewOk();
    doc.bodies[1].name='Colonne';markDirty();rebuild();
  });
  await page.waitForFunction(()=>builtEngine==='exact'&&rebuildDepth===0&&builtVersion===_docVersion&&doc.bodies.length===2,null,{timeout:60000});
  await page.locator('#tree .tnode.bh',{hasText:'Colonne'}).click({button:'right'});
  await page.locator('#ctxMenu button',{hasText:'Créer un composant depuis ce corps'}).click();
  await page.waitForFunction(()=>asm&&asm.comps.length===2&&asmRoot().occ.length===1&&doc.bodies.length===1,null,{timeout:60000});
  const r=await page.evaluate(()=>{const c=asm.comps.find(q=>q.name==='Colonne');
    return {ident:asmIsIdentity(asmRoot().occ[0].fr),feats:c.doc.features.length,sk:c.doc.sketches.map(s=>s.name),root:doc.features.length};});
  expect(r).toEqual({ident:true,feats:1,sk:['Esquisse colonne'],root:1});
  await expect(page.locator('#tree .tnode',{hasText:'Colonne:1'})).toBeVisible();
  // Ctrl+Z en mode pièce : la conversion est annulée d'un coup
  await page.keyboard.press('Control+z');
  await page.waitForFunction(()=>asm.comps.length===1&&doc.bodies.length===2&&doc.features.length===2);
  await page.keyboard.press('Control+y');
  await page.waitForFunction(()=>asm.comps.length===2&&doc.bodies.length===1);
  expect(err).toEqual([]);
});

test('composants liés : lier l\'Axe, modifier sur place, la source est réécrite, puis suivie',async({page})=>{
  const err=await demarrer(page);
  // Le stockage privé du navigateur (OPFS) sert de dossier de projets : mêmes API de fichiers
  // que le vrai dossier, sans fenêtre de dialogue à piloter.
  const axe=require('fs').readFileSync(require('path').join(__dirname,'..','..','Exemples','Axe.miniFusion'),'utf8');
  const r1=await page.evaluate(async axe=>{
    const dir=await (await navigator.storage.getDirectory()).getDirectoryHandle('mf-pw',{create:true});
    const h=await dir.getFileHandle('Axe.miniFusion',{create:true});
    const w=await h.createWritable();await w.write(axe);await w.close();
    mffFolder=dir;doc.name='Banc';asmEnsure();
    const L=await asmLinkInsert(h,axe,'Axe.miniFusion');
    return {rel:L.link.rel,dirty:asmLinkDirty(L),feats:L.doc.features.length};
  },axe);
  expect(r1).toEqual({rel:'Axe.miniFusion',dirty:false,feats:13});
  await expect(page.locator('#tree .tnode',{hasText:'Axe:1'})).toContainText('🔗');
  // modifier sur place : un repère de construction dans l'Axe, puis enregistrer (sources d'abord)
  const r2=await page.evaluate(async()=>{
    const L=asmLinked()[0];
    L.doc.cgeo.push({id:'rp',kind:'frame',how:'zx',name:'Repère PW',refs:[],p:{},at:null,visible:true,fr:{o:[1,2,3],x:[1,0,0],y:[0,1,0],z:[0,0,1]},st:'ok',msg:''});
    const d=asmLinkDirty(L);await asmLinksWrite();
    const h=await mffFolder.getFileHandle('Axe.miniFusion');const b=JSON.parse(await (await h.getFile()).text());
    return {d,bundle:b.bundle,rp:(b.doc.cgeo||[]).some(c=>c.id==='rp'),apres:asmLinkDirty(L)};
  });
  expect(r2).toEqual({d:true,bundle:1,rp:true,apres:false});
  // la source change ailleurs : vérification → mise à jour
  const r3=await page.evaluate(async()=>{
    const h=await mffFolder.getFileHandle('Axe.miniFusion');const b=JSON.parse(await (await h.getFile()).text());
    b.doc.cgeo=b.doc.cgeo.filter(c=>c.id!=='rp');
    const w=await h.createWritable();await w.write(JSON.stringify(b));await w.close();
    const r=await asmLinksCheck(false);
    return {u:r.updated,rp:asmLinked()[0].doc.cgeo.some(c=>c.id==='rp')};
  });
  expect(r3).toEqual({u:['Axe'],rp:false});
  expect(err).toEqual([]);
});

test('FAO : surfaçage sur l\'Axe → parcours → G-code',async({page})=>{
  const err=await demarrer(page);
  await ouvrirAxe(page);
  await page.locator('[data-mfws="fao"]').first().click();
  await expect(page.locator('body')).toHaveAttribute('data-ws','fao');
  await ruban(page,'Surfaçage').click();
  await page.waitForFunction(()=>faoDoc().ops.some(o=>o.type==='facing'));
  await ruban(page,'Régénérer').click();
  // Fin de « Tout régénérer » : aperçu à jour et bilan affiché dans la barre d'état
  await page.waitForFunction(()=>!faoPrevStale&&/FAO : \d+ points de parcours/.test(faceEl.textContent),null,{timeout:120000});
  const par=await page.evaluate(()=>{const s=faoDoc(),op=s.ops.find(o=>o.type==='facing'),mv=faoOpMoves(op,s);
    const cut=mv.filter(m=>!m.r);
    return {n:mv.length,coupes:cut.length,zmin:Math.min(...cut.map(m=>m.z)),zmax:Math.max(...cut.map(m=>m.z)),zop:+op.z,
      pts:+(/FAO : (\d+) points/.exec(faceEl.textContent)||[])[1]};});
  console.log('[FAO] surfaçage :',JSON.stringify(par));
  expect(par.pts).toBeGreaterThan(0);
  expect(par.coupes).toBeGreaterThan(4);
  // Surfaçage = un seul niveau de coupe, à la cote Z de l'opération
  expect(par.zmax-par.zmin).toBeLessThan(1e-6);
  expect(Math.abs(par.zmin-par.zop)).toBeLessThan(1e-6);
  // Export : vrai téléchargement du fichier G-code
  const [dl]=await Promise.all([page.waitForEvent('download'),ruban(page,'G-code').click()]);
  const fichier=path.join(test.info().outputDir,dl.suggestedFilename());
  await dl.saveAs(fichier);
  const code=fs.readFileSync(fichier,'utf8');
  expect(dl.suggestedFilename()).toMatch(/\.(mpf|nc|pim|txt|gcode|tap)$/i);
  expect(code).toMatch(/\bG54\b/);
  expect(code).toMatch(/^T1\b.*\n(.*\n)?M6\b/m); // appel d'outil T1 puis changement
  expect(code).toMatch(/\bM30\b|\bM02\b|\bM2\b/);
  const g1=code.split('\n').filter(l=>/\bG1\b/.test(l)).length;
  expect(g1).toBeGreaterThan(4);
  expect(await page.evaluate(()=>faceEl.textContent)).toContain(dl.suggestedFilename()+' exporté');
  expect(err).toEqual([]);
});
