// Tests navigateur réels (Chromium headless) : `npm run test:browser`.
// Le livrable fusion_mvp.html est servi en http (le noyau OCCT .wasm ne se lit
// pas en file://) par un petit serveur statique sans dépendance.
'use strict';
const {defineConfig,devices}=require('@playwright/test');

const PORT=+(process.env.MF_PORT||3123);

module.exports=defineConfig({
  testDir:__dirname,
  testMatch:/.*\.spec\.cjs$/,
  // Compilation du noyau (~65 Mo) + rejeu exact : larges marges, surtout en CI.
  timeout:240000,
  expect:{timeout:30000},
  fullyParallel:false,
  workers:1,
  retries:process.env.CI?1:0,
  forbidOnly:!!process.env.CI,
  reporter:process.env.CI?[['list'],['html',{open:'never',outputFolder:'../../playwright-report'}]]:'list',
  outputDir:'../../test-results',
  use:{
    baseURL:'http://127.0.0.1:'+PORT,
    viewport:{width:1400,height:900},
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    acceptDownloads:true
  },
  projects:[
    // Parcours : WebGL sur SwiftShader (GPU émulé par le processeur), comme une CI sans carte.
    {name:'chromium',testIgnore:/gpu\.spec\.cjs$/,use:{...devices['Desktop Chrome'],viewport:{width:1400,height:900}}},
    // Carte graphique réelle : ANGLE Direct3D 11 au lieu de SwiftShader (`npm run test:gpu`).
    {name:'gpu',testMatch:/gpu\.spec\.cjs$/,use:{...devices['Desktop Chrome'],viewport:{width:1400,height:900},
      launchOptions:{args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']}}}
  ],
  webServer:{
    command:'node tests/browser/serveur.cjs '+PORT,
    cwd:require('path').join(__dirname,'..','..'),
    url:'http://127.0.0.1:'+PORT+'/fusion_mvp.html',
    reuseExistingServer:!process.env.CI,
    timeout:30000
  }
});
