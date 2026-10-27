// Tests sur la VRAIE carte graphique (projet Playwright « gpu » : Chromium lancé avec
// ANGLE Direct3D 11, voir playwright.config.cjs). Les tests VM (tests/*.cjs) n'ont pas
// de WebGL2 : ils ne voient que les replis en JavaScript. Le projet « chromium » tourne
// sur SwiftShader (GPU émulé par le processeur). Ici les shaders de taille
// (src/88-fao-79) s'exécutent sur le GPU et sont comparés à la taille JavaScript
// (src/88-fao-70), sur le même parcours : les deux doivent donner la même matière.
//   npm run test:gpu
'use strict';
const {test,expect}=require('@playwright/test');
const fs=require('fs'),path=require('path');

const RACINE=path.join(__dirname,'..','..');
const AXE=path.join(RACINE,'Exemples','Axe.miniFusion');

test.beforeAll(()=>{
  for(const f of ['occt/opencascade.wasm.wasm','occt/opencascade.full.wasm','Exemples/Axe.miniFusion']){
    const n=fs.statSync(path.join(RACINE,f)).size;
    if(n<10000)throw new Error(f+' ne fait que '+n+' octets : pointeur Git LFS ? Lancez « git lfs pull ».');
  }
});

async function demarrer(page){
  const err=[];
  page.on('pageerror',e=>err.push('pageerror : '+e.message));
  page.on('dialog',d=>{err.push('dialog : '+d.message());d.dismiss().catch(()=>{});});
  await page.goto('/fusion_mvp.html');
  await page.waitForFunction(()=>typeof occtReady!=='undefined'&&(occtReady===true||/échec|indisponible/.test(occBaseMsg)),null,{timeout:200000});
  expect(await page.evaluate(()=>occtReady),'noyau OCCT').toBe(true);
  await page.waitForFunction(()=>!skEdit&&rebuildDepth===0);
  return err;
}

// Bouton VISIBLE du ruban moderne (les boutons d'origine sont masqués par l'interface).
const ruban=(page,nom)=>page.locator('#mfRibbon button.mfRb:visible',{hasText:nom}).first();

// Carte graphique vue par la page (WEBGL_debug_renderer_info) : « SwiftShader » = émulée.
async function carte(page){
  return page.evaluate(()=>{const gl=renderer.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');
    return {nom:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),webgl2:renderer.capabilities.isWebGL2};});
}

test('carte graphique réelle : WebGL2, cibles flottantes, rendu et taille GPU disponibles',async({page})=>{
  const err=await demarrer(page);
  const c=await carte(page);
  test.info().annotations.push({type:'GPU',description:c.nom});
  expect(c.webgl2).toBe(true);
  expect(c.nom,'Chromium tourne sur SwiftShader : pas de carte graphique réelle').not.toMatch(/SwiftShader/i);
  const ok=await page.evaluate(()=>({rendu:faoMatterGpuSupported(),fine:faoMatterFine(),taille:faoCarteGOn()}));
  expect(ok).toEqual({rendu:true,fine:true,taille:true});
  expect(err).toEqual([]);
});

test('Axe, surfaçage + finition boule : taille GPU (shaders) = taille JavaScript, cellule par cellule',async({page})=>{
  const err=await demarrer(page);
  await page.setInputFiles('#fileProj',AXE);
  await page.waitForFunction(()=>doc&&doc.name==='Axe'&&builtEngine==='exact'&&bodies.some(b=>b.shape)&&faoSolidSettled(),null,{timeout:120000});
  await page.locator('[data-mfws="fao"]').first().click();
  await ruban(page,'Surfaçage').click();
  await page.waitForFunction(()=>faoDoc().ops.some(o=>o.type==='facing'));
  // Surfaçage 1,5 mm sous le dessus du brut (par défaut il est AU dessus : rien à tailler),
  // puis finition 3D à la fraise boule D8 (T3) : profil d'outil arrondi, cotes variables.
  await page.evaluate(()=>{const s=faoStock(),job=faoDoc();
    job.ops.find(o=>o.type==='facing').z=+(s.z1-1.5).toFixed(3);
    const op=faoOpDefaults('geofinish');op.toolId='T3';op.step=2;job.ops.push(op);});
  await ruban(page,'Régénérer').click();
  await page.waitForFunction(()=>!faoPrevStale&&/FAO : \d+ points de parcours/.test(faceEl.textContent),null,{timeout:120000});
  const R=await page.evaluate(async()=>{
    faoViewerModeSet('reel');
    const z1=faoStock().z1,ops=faoDoc().ops.filter(o=>o.on).map(o=>o.type+':'+faoOpMoves(o,faoDoc()).length);
    if(!faoViewerOpen())return {err:'simulation impossible à ouvrir'};
    const vw=faoVw;vw.t=vw.T; // tout le parcours, rattrapage 0 → T d'un coup
    // 1. GPU : grille neuve, taille par les shaders, hauteurs relues dans la cible flottante
    faoViewerMatterEnable(vw,false);
    if(!vw.cg)return {err:'taille GPU non branchée (vw.gpu='+!!vw.gpu+', vw.rm='+!!vw.rm+')'};
    const M=vw.cg.maps[0],nx=M.m.nx,ny=M.m.ny,gl=renderer.getContext();
    const px=new Float32Array(nx*ny*4),prev=renderer.getRenderTarget();
    renderer.setRenderTarget(M.rt);gl.readBuffer(gl.COLOR_ATTACHMENT0);gl.readPixels(0,0,nx,ny,gl.RGBA,gl.FLOAT,px);renderer.setRenderTarget(prev);
    const hG=new Float32Array(nx*ny);for(let i=0;i<nx*ny;i++)hG[i]=px[i*4];
    // 2. JavaScript : même parcours, taille faoMatterCarveTo
    const on=faoCarteGOn;faoCarteGOn=()=>false;
    let hC;try{faoViewerMatterEnable(vw,false);hC=Float32Array.from(vw.matterGrid.h);}finally{faoCarteGOn=on;}
    if(vw.cg)return {err:'le repli JavaScript a gardé la taille GPU'};
    if(hC.length!==hG.length)return {err:'grilles différentes : '+hC.length+' / '+hG.length};
    // 3. écarts
    let lo=1e9,max=0,n1=0,n10=0,taille=0;
    for(let i=0;i<hC.length;i++){const d=Math.abs(hG[i]-hC[i]);lo=Math.min(lo,hC[i]);if(d>max)max=d;if(d>0.01)n1++;if(d>0.1)n10++;if(hC[i]<z1-1e-3||hG[i]<z1-1e-3)taille++;}
    const res={ops,nx,ny,pas:M.m.pas,cellules:hC.length,taillees:taille,haut:z1,bas:lo,max,n1,n10};
    faoViewerClose();
    return res;
  });
  test.info().annotations.push({type:'écarts',description:JSON.stringify(R)});
  console.log('  GPU vs JS :',JSON.stringify(R));
  expect(R.err,R.err).toBeUndefined();
  expect(R.taillees,'les opérations enlèvent de la matière').toBeGreaterThan(R.cellules*0.05);
  // Le shader lit le profil de l'outil dans une table resserrée vers le bord (faoCarteGProfil),
  // le JavaScript calcule l'arc exact ; reste le float32 du GPU (≈ 1 µm). Avec l'ancienne table
  // régulière de 48 points : 0,2 mm d'écart au bord de la boule, sur 1 % des cellules.
  expect(R.max,'écart maximal GPU / JavaScript').toBeLessThan(0.005);
  expect(R.n1,'cellules à plus de 0,01 mm').toBe(0);
  expect(err).toEqual([]);
});

// Atelier RENDU, second moteur (src/98-rendu-rayons.js) : three-gpu-pathtracer sur un three récent,
// empaqueté à part (threejs/rendu-rayons.js) et chargé seulement quand on choisit le moteur.
test('atelier RENDU, « Lancer de rayons » : chargé à la demande, affinage sur le GPU, PNG 1920×1080',async({page})=>{
  const err=await demarrer(page);
  page.on('console',m=>{if(m.type()==='error')err.push('console : '+m.text().slice(0,300));});
  await page.setInputFiles('#fileProj',AXE);
  await page.waitForFunction(()=>doc&&doc.name==='Axe'&&builtEngine==='exact'&&bodies.some(b=>b.shape),null,{timeout:120000});
  await page.evaluate(()=>{try{localStorage.removeItem('minifusion_rendu');}catch(e){}});
  await page.locator('#btnRender').click();
  await page.waitForFunction(()=>rd&&rd.acc&&rd.acc.n>=1);
  expect(await page.evaluate(()=>typeof window.RDPT),'bibliothèque chargée sans être demandée').toBe('undefined');
  await page.locator('#rdPanel .rdSeg button',{hasText:'Lancer de rayons'}).click();
  await page.waitForFunction(()=>rd.rt&&rd.rt.pt&&rd.rt.pt.samples>=32,null,{timeout:180000});
  const R=await page.evaluate(()=>{
    const W=96,H=54,c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d');x.drawImage(rd.rt.canvas,0,0,W,H);
    const d=x.getImageData(0,0,W,H).data,teintes=new Set();let opaque=0;
    for(let i=0;i<W*H;i++){if(d[i*4+3]>200)opaque++;teintes.add((d[i*4]>>3)+','+(d[i*4+1]>>3)+','+(d[i*4+2]>>3));}
    return {rayons:RDPT.THREE.REVISION,cao:THREE.REVISION,opaque:opaque/(W*H),teintes:teintes.size,visible:rd.rt.canvas.style.visibility};
  });
  test.info().annotations.push({type:'lancer de rayons',description:JSON.stringify(R)});
  expect(R.rayons).toBe('186');
  expect(R.cao,'le three de la CAO reste celui de l’application').toBe('147');
  expect(R.visible).toBe('visible');
  expect(R.opaque,'pièce et sol dessinés').toBeGreaterThan(0.05);
  expect(R.teintes,'image ombrée, pas un aplat').toBeGreaterThan(40);
  await page.evaluate(()=>{rd.st.ech=16;rdPanel();rdFoot();}); // 128 échantillons
  const [dl]=await Promise.all([page.waitForEvent('download',{timeout:180000}),page.locator('#rdPanel .rdGo').click()]);
  expect(dl.suggestedFilename()).toMatch(/1920x1080 \(rayons\)\.png$/);
  // retour au moteur rapide : canevas et contexte du lancer de rayons libérés
  await page.locator('#rdPanel .rdSeg button',{hasText:'Rapide'}).click();
  expect(await page.evaluate(()=>!rd.rt&&!document.querySelector('#rdView canvas.rdPT'))).toBe(true);
  await page.keyboard.press('Escape');
  expect(err).toEqual([]);
});
