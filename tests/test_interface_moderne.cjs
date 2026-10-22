// V0.2.1 : interface « Moderne » (en option, l'interface classique reste intacte) + thèmes.
// Chaque bouton du ruban CLIQUE un bouton existant : on vérifie que tous ces boutons existent.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const {loadApp}=require('./appvm.cjs');
let ko=0;const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
const html=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8');
const src=fs.readFileSync(path.join(ROOT,'src','97-interface-moderne.js'),'utf8');
const ids=[...src.matchAll(/\['[^']*','[^']*','(btn\w+|fao\w+Btn)'/g)].map(m=>m[1]);
const missing=ids.filter(id=>!new RegExp("id=[\"']"+id+"[\"']|\.id=[\"']"+id+"[\"']|id='"+id+"'").test(html));
A(ids.length>=20,'ruban : '+ids.length+' boutons reliés à des commandes existantes');
A(!missing.length,'tous les boutons cibles existent ('+(missing.join(', ')||'aucun manquant')+')');
A(/body\.ui-modern \.mfM\{display:flex!important\}/.test(src)&&/'\.mfM\{display:none!important\}'/.test(src),'éléments modernes invisibles en classique (classe .mfM)');
A(!/\.remove\(\)/.test(src.replace(/p\.remove\(\)|res\.remove\(\)|\.mfPop\.mfTmp'\)\.forEach\(p=>p\.remove\(\)\)/g,'')),'le mode moderne ne détruit rien de l’interface classique');
const {ctx,sandbox}=loadApp();
const LS={};sandbox.localStorage.getItem=k=>(k in LS?LS[k]:null);sandbox.localStorage.setItem=(k,v)=>{LS[k]=String(v);}; // mémoire réelle pour le test
const r=vm.runInContext(`(function(){const o=[];
  o.push(typeof mfTheme==='function'&&typeof mfUiMode==='function'&&typeof mfWs==='function'&&typeof mfCommands==='function');
  o.push(MF_THEMES.map(t=>t[0]).join(','));
  mfTheme('atelier');o.push(mfLS('minifusion_theme'));mfTheme('inconnu');o.push(mfLS('minifusion_theme'));
  mfUiMode('moderne');o.push(mfLS('minifusion_ui'));mfUiMode('classique');o.push(mfLS('minifusion_ui'));

  return o;})()`,ctx);
A(r[0],'fonctions thème / interface / espaces / recherche présentes');
A(r[1]==='nuit,graphite,atelier,clair,contraste','5 thèmes : '+r[1]);
A(r[2]==='atelier'&&r[3]==='nuit','thème mémorisé ; thème inconnu → Nuit (actuel)');
A(r[4]==='moderne'&&r[5]==='moderne','interface : Moderne seule (la demande « classique » reste en moderne)');
A(/id="mfStWasm"/.test(src)&&/mfClick\('btnOccWasm'\)/.test(src),'barre d’état moderne : bouton « Noyau .wasm… » (1er lancement en mode fichier)');
console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');process.exit(ko?1:0);
