// V0.2.0 : UN SEUL numéro de version (= tag Git) — APP_VER, affiché par le badge.
// 2026-10-02-010 : badge de version produit, en haut à droite du
// bandeau supérieur. La coque HTML n'est jamais éditée à la main : le badge est
// créé depuis JS dans src/96 (avec le regroupement du bandeau), enfant direct du
// .topbar (hors .tb, donc jamais déplacé par le regroupement), poussé à droite
// par margin-left:auto avant la rangée .hints — donc le script construit contient
// bien APP_VER et le head de fusion_mvp.html pas, avec la règle #prodVer du
// style injecté styleBandeau.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
(async()=>{
  // ---------- structure ----------
  const src96=fs.readFileSync(path.join(ROOT,'src','96-bandeau-groupes.js'),'utf8');
  A(/id='prodVer'/.test(src96),"src/96 : création du badge #prodVer");
  A(/v\.textContent=APP_VER/.test(src96),"src/96 : texte du badge = APP_VER (numéro unique)");
  const src00=fs.readFileSync(path.join(ROOT,'src','00-entete-et-outils.js'),'utf8');
  const VER=(src00.match(/const APP_VER='([^']+)'/)||[])[1]||'';
  A(/^V\d+\.\d+\.\d+$/.test(VER),"APP_VER au format des tags (V0.x.y) : "+VER);
  A(/#prodVer\{/.test(src96),"src/96 : règle de style #prodVer (styleBandeau)");
  A(/#prodVer\{margin-left:auto/.test(src96),"src/96 : badge poussé à droite (margin-left:auto)");
  const html=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8');
  const m=html.match(/<script>([\s\S]*?)<\/script>/);
  A(!!m,"fusion_mvp.html : script principal trouvé");
  const head=html.split('<script>')[0];
  A(head.indexOf(VER)<0,"coque (head) : aucun numéro de version en dur — injection JS uniquement");
  A(!/MVP param/.test(head)&&!/id="appVer"/.test(head),"coque (head) : plus de « MVP paramétrique » ni de 2e numéro (appVer)");
  A(!!m&&m[1].indexOf("APP_VER='"+VER+"'")>=0,"script construit : APP_VER = "+VER);
  // ---------- comportement ----------
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=function(s){P.push(String(s));};",
    "const ATT=[];const att=function(ok,msg){if(!ok)ATT.push(msg);};",
    "const top=document.querySelector('.topbar');",
    "att(!!top,'harnais : nœud .topbar disponible');",
    "const kids=top?Array.prototype.slice.call(top.children||[]):[];",
    "const ids=kids.map(function(c){return c&&c.id;});",
    "const vi=ids.indexOf('prodVer');",
    "att(vi>=0,'badge #prodVer absent du .topbar');",
    "if(vi>=0){",
    "  const v=kids[vi];",
    "  att(/^V[0-9]+[.][0-9]+[.][0-9]+$/.test(v.textContent),'textContent = '+JSON.stringify(v.textContent)+' (attendu V0.x.y)');",
    "  const bar=document.querySelector('.tb');",
    "  const barKids=bar?Array.prototype.slice.call(bar.children||[]):[];",
    "  att(barKids.indexOf(v)<0,'le badge reste hors de la barre .tb (jamais déplacé par le regroupement)');",
    "}",
    "const stx=(document.head.children||[]).filter(function(n){return n.id==='styleBandeau';});",
    "att(stx.length===1,'styleBandeau injecté depuis JS ('+stx.length+')');",
    "const rule=stx.length?(stx[0].textContent.match(/#prodVer\\{[^}]*\\}/)||null):null;",
    "att(!!rule,'règle #prodVer absente du style injecté');",
    "att(!!rule&&/margin-left:auto/.test(rule[0]),'règle #prodVer sans margin-left:auto — badge non poussé à droite');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(x){p('  x '+x);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'prodver.js'});
  console.log('=== badge version produit (numéro unique) ===');
  console.log(r);
  process.exit((/ECHECS|  x /.test(r)||ko)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
