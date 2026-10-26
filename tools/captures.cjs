// Captures du README (docs/captures/) dans un vrai Chromium, sur la carte graphique :
//   node tools/captures.cjs [dossier de sortie] [nom…]
// Sans nom : toutes les captures. Le livrable est servi par tests/browser/serveur.cjs
// (le noyau OCCT .wasm ne se lit pas en file://). Les fichiers d'exemple ne sont jamais
// réécrits : tout se passe dans la page.
'use strict';
const {chromium}=require('@playwright/test');
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');

const RACINE=path.join(__dirname,'..');
const PORT=+(process.env.MF_PORT||3124);
const SORTIE=path.resolve(process.argv[2]||path.join(RACINE,'docs','captures'));
const VOULUES=process.argv.slice(3);
const EX=n=>path.join(RACINE,'Exemples',n+'.miniFusion');

async function demarrer(page){
  await page.goto('http://127.0.0.1:'+PORT+'/fusion_mvp.html');
  await page.waitForFunction(()=>typeof occtReady!=='undefined'&&(occtReady===true||/échec|indisponible/.test(occBaseMsg)),null,{timeout:200000});
  if(!await page.evaluate(()=>occtReady))throw new Error('noyau OCCT indisponible');
  await page.waitForFunction(()=>!skEdit&&rebuildDepth===0);
}
async function ouvrir(page,nom){
  await page.setInputFiles('#fileProj',EX(nom));
  await page.waitForFunction(n=>doc&&doc.name===n&&builtEngine==='exact'&&bodies.some(b=>b.shape)&&faoSolidSettled(),nom,{timeout:180000});
  await page.waitForTimeout(800);
}
const espace=(page,w)=>page.locator('[data-mfws="'+w+'"]').first().click().then(()=>page.waitForTimeout(1500));
const photo=(page,nom)=>page.screenshot({path:path.join(SORTIE,nom+'.png')}).then(()=>console.log('  '+nom+'.png'));

const ruban=(page,nom)=>page.locator('#mfRibbon button.mfRb:visible',{hasText:nom}).first();
// Parcours de tout le posage recalculés (les trajectoires embarquées d'un ancien moteur sont refusées).
async function regenerer(page){
  await ruban(page,'Régénérer').click();
  await page.waitForFunction(()=>!faoPrevStale&&/FAO : [1-9]\d* points de parcours/.test(faceEl.textContent),null,{timeout:480000});
  await page.waitForTimeout(800);
}

const CAPTURES={
  // un document par capture : ouvrir un 2e fichier par-dessus le 1er (modifié) attend une confirmation
  async cao(page){await ouvrir(page,'Perçages');await photo(page,'cao-percages');},
  async caoCrochet(page){await ouvrir(page,'Crochet');await photo(page,'cao-crochet');},
  async fao(page){
    await ouvrir(page,'Perçages');
    await espace(page,'fao');
    await page.evaluate(()=>faoDoc().ops.forEach(o=>{o.hidden=false;})); // traces masquées ligne par ligne dans le fichier
    await regenerer(page);
    await photo(page,'fao-parcours');
    // simulation : tout le programme taillé dans le brut, rendu réel
    await page.evaluate(()=>{faoViewerModeSet('reel');if(!faoViewerOpen())throw new Error('simulation');const vw=faoVw;faoViewerMatterEnable(vw,false);vw.t=vw.T;faoViewerApply();faoViewerBarUpdate();});
    await page.waitForTimeout(4000);
    await photo(page,'fao-simulation');
    await page.evaluate(()=>faoViewerClose());
  },
  async plan(page){await ouvrir(page,'Perçages');await espace(page,'plan');await photo(page,'plan-percages');},
  async planCrochet(page){await ouvrir(page,'Crochet');await espace(page,'plan');await photo(page,'plan-crochet');},
  async rendu(page){
    await ouvrir(page,'Support Pédale Déportée R1200RT 2011');
    // apparence de rendu posée dans la page seulement (le fichier n'est pas réécrit)
    await page.evaluate(m=>bodies.forEach(b=>{const id=bodyIdOfRuntime(b);if(id)setRenderLook(id,m,null);}),process.env.MF_MAT||'alu');
    // fond ardoise : l'aluminium ressort mieux que sur le dégradé blanc par défaut
    await page.evaluate(f=>{localStorage.setItem('minifusion_rendu',JSON.stringify(f));rdOpen();},
      process.env.MF_FOND==='blanc'?{}:{fond:'degrade',fc1:'#3a4049',fc2:'#121417'});
    await page.waitForTimeout(6000); // aperçu affiné (64 passes)
    await photo(page,'rendu-atelier');
    const dl=page.waitForEvent('download',{timeout:240000});
    await page.evaluate(()=>{rd.st.ech=64;rd.st.res='1080';rdExport();});
    await (await dl).saveAs(path.join(SORTIE,'rendu-pedale.png'));
    console.log('  rendu-pedale.png');
    await page.evaluate(()=>rdClose());
  }
};

(async()=>{
  fs.mkdirSync(SORTIE,{recursive:true});
  const srv=spawn(process.execPath,[path.join(RACINE,'tests','browser','serveur.cjs'),String(PORT)],{cwd:RACINE,stdio:'ignore'});
  const nav=await chromium.launch({args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
  try{
    for(const [nom,fn] of Object.entries(CAPTURES)){
      if(VOULUES.length&&VOULUES.indexOf(nom)<0)continue;
      console.log(nom);
      // contexte neuf par capture : rien ne reste du document précédent (stockage local compris)
      const ctx=await nav.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1,acceptDownloads:true,colorScheme:'dark'});
      const page=await ctx.newPage();
      page.on('pageerror',e=>console.log('  [page] '+e.message));
      page.on('dialog',d=>d.dismiss().catch(()=>{}));
      await demarrer(page);
      await fn(page);
      await ctx.close();
    }
  }finally{await nav.close();srv.kill();}
})().catch(e=>{console.error(e);process.exit(1);});
