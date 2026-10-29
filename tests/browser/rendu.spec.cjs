// Rendu dans un VRAI navigateur (Chromium, WebGL réel) : les tests VM (test_materiaux)
// ne voient ni les shaders ni les images. Deux parcours sur l'Axe :
//   1. atelier RENDU : ouverture par le bouton, affinage progressif, matériau de rendu
//      choisi au clic droit sur la pièce (la CAO garde le sien), export PNG 1920×1080, Échap ;
//   2. ambiances dans la vue CAO : Studio (fond, reflets, pièce à son apparence de RENDU, relief),
//      clic droit → Matériau de rendu…, verre approché, ombre portée, retour à « Actuel (CAO) ».
// Aucun message d'erreur WebGL (shader qui ne compile pas) n'est toléré.
'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');

const RACINE=path.join(__dirname,'..','..');
const AXE=path.join(RACINE,'Exemples','Axe.miniFusion');
const REL_ID_SABLE=2; // REL_ID.sable (98-rendu-reliefs)

test.beforeAll(()=>{
  for(const f of ['occt/opencascade.wasm.wasm','occt/opencascade.full.wasm','Exemples/Axe.miniFusion']){
    const n=fs.statSync(path.join(RACINE,f)).size;
    if(n<10000)throw new Error(f+' ne fait que '+n+' octets : pointeur Git LFS ? Lancez « git lfs pull ».');
  }
});

// Page prête avec l'Axe ouvert. Erreurs relevées : exceptions, boîtes de dialogue et
// messages de three.js sur la console (programme WebGL invalide, etc.).
async function demarrerAxe(page){
  const err=[];
  page.on('pageerror',e=>err.push('pageerror : '+e.message));
  page.on('dialog',d=>{err.push('dialog : '+d.message());d.dismiss().catch(()=>{});});
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))err.push('console : '+m.text().slice(0,300));});
  await page.goto('/fusion_mvp.html');
  await page.waitForFunction(()=>typeof occtReady!=='undefined'&&(occtReady===true||/échec|indisponible/.test(occBaseMsg)),null,{timeout:200000});
  expect(await page.evaluate(()=>occtReady),'noyau OCCT').toBe(true);
  await page.waitForFunction(()=>!skEdit&&rebuildDepth===0);
  await page.setInputFiles('#fileProj',AXE);
  await page.waitForFunction(()=>doc&&doc.name==='Axe'&&builtEngine==='exact'&&bodies.some(b=>b.shape)&&faoSolidSettled(),null,{timeout:120000});
  return err;
}

// Pixels de l'atelier (canvas préservé) : part des pixels qui diffèrent du fond et teinte
// moyenne de ceux-là, sur une grille de 96 × 54.
async function imageAtelier(page){
  return page.evaluate(()=>{
    const W=96,H=54,c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d');x.drawImage(rd.canvas,0,0,W,H);
    const d=x.getImageData(0,0,W,H).data;
    let n=0,r=0,g=0,b=0;
    for(let i=0;i<W*H;i++){
      const p=i*4,q=(i-i%W)*4; // fond dégradé vertical : référence = bord gauche de la même ligne
      if(Math.abs(d[p]-d[q])+Math.abs(d[p+1]-d[q+1])+Math.abs(d[p+2]-d[q+2])<24)continue;
      n++;r+=d[p];g+=d[p+1];b+=d[p+2];
    }
    return {part:n/(W*H),r:n?r/n:0,g:n?g/n:0,b:n?b/n:0};
  });
}

test('atelier RENDU : affinage, matériau de rendu séparé de la CAO, PNG 1920×1080',async({page})=>{
  const err=await demarrerAxe(page);
  const id=await page.evaluate(()=>bodyIdOfRuntime(bodies.find(b=>!b.ghost&&b.shape)));
  const cao0=await page.evaluate(i=>({mat:bodyMatOf(i),col:bodyColorOf(i)}),id);

  await page.locator('#btnRender').click();
  await expect(page.locator('#rdOverlay')).toBeVisible();
  await expect(page.locator('#rdPanel')).toContainText('Matériaux');
  // l'affinage progresse tout seul (requestAnimationFrame)
  await page.waitForFunction(()=>rd&&rd.acc&&rd.acc.n>=4,null,{timeout:60000});
  const im0=await imageAtelier(page);
  expect(im0.part,'la pièce occupe une part de l’image').toBeGreaterThan(0.03);
  expect(im0.part,'l’image n’est pas uniforme').toBeLessThan(0.9);

  // matériau de rendu : laiton, choisi au clic droit sur la pièce (fenêtre #rdLook, 98-rendu-apparence)
  await expect(page.locator('#rdPanel .rdLookRow')).toHaveCount(1);
  const bx=await page.evaluate(()=>{const b=new THREE.Box3().setFromObject(rd.group),c=b.getCenter(new THREE.Vector3()).project(rd.cam),r=rd.canvas.getBoundingClientRect();
    return {x:r.left+(c.x+1)/2*r.width,y:r.top+(1-c.y)/2*r.height};});
  await page.mouse.click(bx.x,bx.y,{button:'right'});
  await expect(page.locator('#rdLook')).toBeVisible();
  await page.locator('#rdLook select').first().selectOption('laiton');
  await page.waitForFunction(()=>rd&&rd.acc&&rd.acc.n>=4,null,{timeout:60000});
  const look=await page.evaluate(i=>({own:doc.rendu&&doc.rendu.corps&&doc.rendu.corps[i],cao:{mat:bodyMatOf(i),col:bodyColorOf(i)}}),id);
  expect(look.own&&look.own.mat).toBe('laiton');
  expect(look.cao,'la CAO garde son matériau et sa couleur').toEqual(cao0);
  const im1=await imageAtelier(page);
  expect(im1.r-im1.b,'laiton : nettement plus rouge que bleu').toBeGreaterThan(25);
  await expect(page.locator('#rdPanel .rdLookRow')).toContainText('Laiton');
  await page.keyboard.press('Escape'); // ferme d'abord la fenêtre, pas l'atelier
  await expect(page.locator('#rdLook')).toHaveCount(0);
  await expect(page.locator('#rdOverlay')).toBeVisible();

  // export : 4 passes suffisent ici (SwiftShader), au format 1920×1080
  await page.evaluate(()=>{rd.st.ech=4;rd.st.res='1080';});
  const [dl]=await Promise.all([page.waitForEvent('download',{timeout:120000}),page.locator('#rdPanel .rdGo').click()]);
  expect(dl.suggestedFilename()).toBe('Axe - rendu 1920x1080.png');
  const png=fs.readFileSync(await dl.path());
  expect(png.slice(1,4).toString()).toBe('PNG');
  expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([1920,1080]);
  expect(png.length,'image réellement dessinée').toBeGreaterThan(50000);
  await expect(page.locator('#rdPanel')).toContainText('1920×1080 enregistrée');

  // Échap ferme l'atelier ; la vue CAO garde la couleur CAO
  await page.keyboard.press('Escape');
  await expect(page.locator('#rdOverlay')).toHaveCount(0);
  expect(await page.evaluate(()=>rd)).toBeNull();
  expect(err).toEqual([]);
});

// Vue CAO rendue puis relue dans la même tâche (pas besoin de preserveDrawingBuffer) :
// couleur du coin haut gauche (fond) et du centre de la pièce.
async function pixelsVue(page){
  return page.evaluate(()=>{
    vEnvTick();renderer.render(scene,camera);
    const gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,p=new Uint8Array(4);
    gl.readPixels(4,h-5,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);
    return {fond:[p[0],p[1],p[2]],w,h};
  });
}

test('vue CAO : ambiance Studio, apparence de rendu, verre approché, ombre, retour à Actuel',async({page})=>{
  const err=await demarrerAxe(page);
  const id=await page.evaluate(()=>bodyIdOfRuntime(bodies.find(b=>!b.ghost&&b.shape)));
  // V0.17.0 : en ambiance, la vue montre l'apparence de RENDU (« rendu léger ») ; la CAO garde la sienne
  await page.evaluate(i=>setRenderLook(i,'alu-anod-rouge',null),id);
  const fond0=(await pixelsVue(page)).fond;

  await page.locator('#btnSettings').click();
  await page.locator('#optEnv').selectOption('studio');
  await page.waitForFunction(()=>vEnvS.on&&vEnvS.amb==='studio');
  await page.waitForFunction(i=>{const b=bodies.find(q=>bodyIdOfRuntime(q)===i);return b&&b.mesh.material.userData.vEnv;},id);
  const s=await page.evaluate(i=>{
    const b=bodies.find(q=>bodyIdOfRuntime(q)===i),U=b.mesh.material.userData.vEnv.U;
    return {col:U.uEnvCol.value.getHex(),rendu:renderLookOf(i).color,cao:bodyColorOf(i),glass:U.uEnvGlass.value,relT:U.uRelT.value,env:b.mesh.material.envMap===vEnvS.rt.texture,
      fondTex:!!(scene.background&&scene.background.isTexture),sun:!!vEnvS.sun,ombre:b.mesh.castShadow};
  },id);
  expect(s.col,'la pièce prend sa couleur de rendu').toBe(s.rendu);
  expect(s.cao,'la CAO garde la sienne').not.toBe(s.rendu);
  expect(s.relT,'relief du matériau (alu anodisé : sablé)').toBe(REL_ID_SABLE);
  expect(s.env,'reflets de l’ambiance').toBe(true);
  expect(s.fondTex,'fond dégradé de l’ambiance').toBe(true);
  expect(s.glass).toBe(0);
  const fond1=(await pixelsVue(page)).fond;
  expect(fond1.reduce((a,v,i)=>a+Math.abs(v-fond0[i]),0),'le fond change avec l’ambiance').toBeGreaterThan(30);

  // ombre portée : lampe d'ombre, la pièce porte son ombre
  await page.locator('#optShadow').setChecked(true);
  await page.waitForFunction(i=>{const b=bodies.find(q=>bodyIdOfRuntime(q)===i);return vEnvS.sun&&vEnvS.floor&&vEnvS.floor.visible&&b.mesh.castShadow;},id);

  // clic droit sur la pièce → « Matériau de rendu… » → fenêtre d'apparence
  const pc=await page.evaluate(i=>{const b=bodies.find(q=>bodyIdOfRuntime(q)===i),c=new THREE.Box3().setFromObject(b.mesh).getCenter(new THREE.Vector3()).project(camera),
    r=renderer.domElement.getBoundingClientRect();return {x:r.left+(c.x+1)/2*r.width,y:r.top+(1-c.y)/2*r.height};},id);
  await page.mouse.click(pc.x,pc.y,{button:'right'});
  await expect(page.locator('#ctxRdLook')).toBeVisible();
  await page.locator('#ctxRdLook').click();
  await expect(page.locator('#rdLook')).toBeVisible();
  // verre approché (matériau de rendu « verre ») : sans ombre
  await page.locator('#rdLook select').first().selectOption('verre');
  expect(await page.evaluate(i=>renderLookOf(i).mat,id)).toBe('verre');
  await page.waitForFunction(i=>{const b=bodies.find(q=>bodyIdOfRuntime(q)===i);const v=b.mesh.material.userData.vEnv;return v&&v.U.uEnvGlass.value===1&&!b.mesh.castShadow;},id);

  // retour à Actuel (CAO) : matières rendues telles quelles, fond du thème (⚙ refermé par le clic droit : on le rouvre)
  await page.keyboard.press('Escape');
  if(!await page.locator('#optEnv').isVisible())await page.locator('#btnSettings').click();
  await page.locator('#optEnv').selectOption('actuel');
  await page.waitForFunction(()=>!vEnvS.on&&vEnvS.mats.size===0);
  const fin=await page.evaluate(i=>{const b=bodies.find(q=>bodyIdOfRuntime(q)===i);return {patch:!!b.mesh.material.userData.vEnv,fondTex:!!(scene.background&&scene.background.isTexture)};},id);
  expect(fin).toEqual({patch:false,fondTex:false});
  const fond2=(await pixelsVue(page)).fond;
  expect(fond2.reduce((a,v,i)=>a+Math.abs(v-fond0[i]),0),'fond du thème retrouvé').toBeLessThan(12);

  // V0.21.3 : Rendu direct rallumé → un matériau changé s'affiche sans recharger (three reprenait le
  // programme en cache sans nos uniformes : couleur figée sur le GPU jusqu'au Ctrl+R)
  await page.locator('#btnLive').click();
  await page.waitForFunction(i=>{const b=bodies.find(q=>bodyIdOfRuntime(q)===i);return vEnvS.on&&b.mesh.material.userData.vEnv;},id);
  await page.evaluate(i=>setRenderLook(i,'cuivre',null),id);
  const lie=i=>{const m=bodies.find(q=>bodyIdOfRuntime(q)===i).mesh.material,p=renderer.properties.get(m),v=m.userData.vEnv;
    return {lie:!!(v&&p.uniforms&&p.uniforms.uEnvCol===v.U.uEnvCol),gpu:p.uniforms&&p.uniforms.uEnvCol?p.uniforms.uEnvCol.value.getHex():null,cuivre:matDef('cuivre').col,
      U:v?v.U.uEnvCol.value.getHex():null,on:vEnvS.on,vEnv,progs:p.programs?p.programs.size:-1};};
  try{await page.waitForFunction(new Function('i','const r=('+lie+')(i);return r.lie&&r.gpu===r.cuivre;'),id,{timeout:20000});}
  catch(e){throw new Error('uniformes non rebranchés : '+JSON.stringify(await page.evaluate(new Function('i','return ('+lie+')(i);'),id)));}
  await page.locator('#btnLive').click();
  await page.waitForFunction(()=>!vEnvS.on);
  expect(err).toEqual([]);
});
