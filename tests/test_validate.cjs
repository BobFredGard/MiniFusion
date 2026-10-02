// ✓ Valider : bouton dédié (créé depuis src/97, jamais la coque HTML) + fonction
// runValidate() aux 7 phases diagnostic + réparation dont le rapport s'écrit dans
// #selfTest : 1 Document (docSanitise) · 2 Répétitions (repGenAll) · 3 Esquisses
// (skAudit) · 4 Fonctions (rejeu _err/_m) · 5 Moteur+caches (OCCT + hardRefresh) ·
// 6 Corps+imports (ensureBodies, bodyVis, table d'imports) · 7 Rapport.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__src97=fs.readFileSync(path.join(ROOT,'src','97-auto-tests.js'),'utf8');
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // ---------- structure source : le bouton vit dans src/97 ----------
    "att(/btnValidate/.test(__src97),'src/97 : id btnValidate absent');",
    "att(/✓ Valider/.test(__src97),'src/97 : libellé « ✓ Valider » absent');",
    "att(/insertBefore\\(b,hote\\)/.test(__src97),'src/97 : montage du bouton à côté de Auto-tests absent');",
    "att(/onclick=\\(\\)=>runValidate\\(\\)/.test(__src97),'src/97 : le bouton ne déclenche pas runValidate()');",
    // ---------- document de test : extrusion saine + orphelin + répétition désynchronisée ----------
    "const mkrect=(id,dim)=>({id,name:'Esquisse '+(dim?'mauvaise':'saine'),plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:(dim?[{id:'d_bad',type:'length',line:'e0',value:999}]:[]),seq:50});",
    "const sk=mkrect('sk_t',false),skb=mkrect('sk_bad',true);",
    "[['p0',10,5,'e0','p1'],['p1',30,5,'e1','p2'],['p2',30,15,'e2','p3'],['p3',10,15,'e3','p0']].forEach(l=>{",
    "  sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "[['p0',10,5,'e0','p1'],['p1',30,5,'e1','p2'],['p2',30,15,'e2','p3'],['p3',10,15,'e3','p0']].forEach(l=>{",
    "  skb.points[l[0]]={x:l[1],y:l[2]};skb.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches=[sk,skb];",
    "doc.features=[",
    "  {id:'ex_t',type:'extrude',name:'Bloc',sketchId:'sk_t',op:'add',distance:20},",
    "  {id:'z_orph',type:'extrude',name:'Instance orpheline',sketchId:'sk_t',distance:9,repeatId:'rp_missing'},",
    "  {id:'rp_t',type:'repeat',name:'Linéaire',mode:'lin',copies:1,dist:10,axis:'X',base:['ex_t'],children:[],visible:true}",
    "];",
    "occSkipFeat=null;",
    "repGenChildren(doc.features.find(f=>f.id==='rp_t'));",
    "const kid=doc.features.find(f=>f.repeatId==='rp_t');",
    "att(!!kid,'prérequis : instance de répétition absente');",
    "if(kid)kid.distance=5; // désynchronisation simulée (source = 20)",
    // ---------- runValidate : 7 phases ----------
    "if(typeof runValidate!=='function'){att(false,'runValidate() absente (src/97)');}",
    "else{",
    "  const r=runValidate();",
    "  p(r);",
    "  att(typeof r==='string'&&r.length>0,'runValidate() ne renvoie pas le rapport');",
    "  att(/^VALIDATION : \\d+\\/7 phases OK — \\d+ réparation\\(s\\)/m.test(r),'entête du rapport absente : '+(r&&r.split('\\n')[0]));",
    "  const lines=r.split('\\n');",
    "  [1,2,3,4,5,6,7].forEach(n=>att(lines.some(l=>l.indexOf(n+' ')===0),'ligne de phase '+n+' absente du rapport'));",
    "  att($('selfTest').textContent===r,'#selfTest n a pas reçu le rapport');",
    "  // phase 1 : instance orpheline purgée par docSanitise",
    "  att(!doc.features.some(f=>f.id==='z_orph'),'phase 1 : instance orpheline non purgée');",
    "  att(/^1 ✅ /m.test(r),'phase 1 (Document) non verte');",
    "  // phase 2 : instance réalignée sur sa source par repGenAll",
    "  att(kid&&+kid.distance===20,'phase 2 : instance non réalignée (distance='+(kid&&kid.distance)+', attendu 20)');",
    "  att(/^2 ✅ /m.test(r),'phase 2 (Répétitions) non verte');",
    "  // phase 3 : cote violée de l esquisse signalée (⚠, diagnostic non réparable)",
    "  att(/^3 ⚠ /m.test(r),'phase 3 (Esquisses) : violation non signalée en ⚠');",
    "  att(/violée/.test(r),'phase 3 : message de violation absent');",
    "  // phases 4 à 6 : lignes présentes et le moteur chargé est dit tel quel",
    "  att(/^4 /m.test(r),'phase 4 (Fonctions) absente');",
    "  att(/^5 ✅ /m.test(r),'phase 5 (Moteur+caches) non verte');",
    "  att(/OCCT chargé/.test(r),'phase 5 : état du moteur absent');",
    "  att(/^6 /m.test(r),'phase 6 (Corps+imports) absente');",
    "  att(/^7 ✅ /m.test(r),'phase 7 (Rapport) non verte');",
    "  // compteur de réparations : orphelin (1) + réalignement (1) + hardRefresh (1) >= 3",
    "  const mm=r.match(/— (\\d+) réparation\\(s\\)/);",
    "  att(mm&&+mm[1]>=3,'compteur de réparations trop bas : '+(mm&&mm[1])+' (attendu >= 3)');",
    "  p('compteur réparations : '+(mm&&mm[1]));",
    "}",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}",
    "else{p('');p('TOUT EST CONFORME');}",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'validate.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
