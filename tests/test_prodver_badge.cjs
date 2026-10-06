// 2026-10-02-010 : badge de version produit « V0.1.5 », en haut à droite du
// bandeau supérieur. La coque HTML n'est jamais éditée à la main : le badge est
// créé depuis JS dans src/96 (avec le regroupement du bandeau), enfant direct du
// .topbar (hors .tb, donc jamais déplacé par le regroupement), poussé à droite
// par margin-left:auto avant la rangée .hints — donc le script construit contient
// bien « V0.1.5 » et le head de fusion_mvp.html pas, avec la règle #prodVer du
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
  A(/V0\.1\.5/.test(src96),"src/96 : texte du badge = V0.1.5");
  A(/#prodVer\{/.test(src96),"src/96 : règle de style #prodVer (styleBandeau)");
  A(/#prodVer\{margin-left:auto/.test(src96),"src/96 : badge poussé à droite (margin-left:auto)");
  const html=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8');
  const m=html.match(/<script>([\s\S]*?)<\/script>/);
  A(!!m,"fusion_mvp.html : script principal trouvé");
  const head=html.split('<script>')[0];
  A(!/V0\.1\.5/.test(head),"coque (head) : aucun V0.1.5 en dur — injection JS uniquement");
  A(!!m&&/V0\.1\.5/.test(m[1]),"script construit : V0.1.5 présent (chunk src/96)");
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
    "  att(v.textContent==='V0.1.5','textContent = '+JSON.stringify(v.textContent)+' (attendu V0.1.5)');",
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
  console.log('=== badge version produit V0.1.5 ===');
  console.log(r);
  process.exit((/ECHECS|  x /.test(r)||ko)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
