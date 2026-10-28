// V0.15.8 : rattrapage des exceptions C++ du noyau OCCT.
// La colle Emscripten de opencascade.full.js appelle ___cxa_can_catch quand une exception
// d'un type DÉRIVÉ traverse un catch(Base&) ; ni le .wasm ni la colle ne la définissaient :
// « ReferenceError: ___cxa_can_catch is not defined », l'opération avortait au lieu que le
// noyau se rattrape (suppression d'une chaîne de 18 faces sur un plateau STEP : plantage
// après 64 s → refus propre une fois corrigé, mesuré sur la pièce de l'utilisateur).
// 1. occtCanCatch sur des type_info Itanium simulés (wasm32) : héritage simple, multiple,
//    types sans lien, même nom vu par deux unités de compilation, mémoire illisible.
// 2. Branchement : la colle trouve ___cxa_can_catch / ___cxa_is_pointer_type sur l'objet
//    global (application et harnais), et le crochet du harnais délègue à celui de l'app.
// 3. Le worker de suppression de face (V0.15.9) embarque le crochet.
// 4. La colle fournie appelle bien ces noms comme identifiants libres (sinon la correction
//    serait sans effet après une mise à jour du noyau) et ne les définit pas elle-même.
const fs=require('fs'),path=require('path');
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
const {sandbox}=loadApp();
const can=sandbox.occtCanCatch;
console.log('=== Rattrapage des exceptions du noyau ===');
A(typeof can==='function','occtCanCatch exposée par l\'application');

// mémoire simulée : type_info = [vptr, nom] (+ base pour __si, flags/nb/bases pour __vmi)
const buf=new ArrayBuffer(4096),H8=new Uint8Array(buf),H32=new Int32Array(buf);
const nom=(adr,s)=>{for(let i=0;i<s.length;i++)H8[adr+i]=s.charCodeAt(i);H8[adr+s.length]=0;return adr;};
const ti=(adr,vt,n,...rest)=>{H32[adr>>2]=vt;H32[(adr+4)>>2]=n;rest.forEach((v,i)=>{H32[(adr+8+4*i)>>2]=v;});return adr;};
const TRANS=ti(100,11,nom(1000,'18Standard_Transient'),0);
const FAIL =ti(200,22,nom(1100,'16Standard_Failure'),TRANS);
const DOM  =ti(300,22,nom(1200,'20Standard_DomainError'),FAIL);
const CONS =ti(400,22,nom(1300,'28Standard_ConstructionError'),DOM);
const AUTRE=ti(500,11,nom(1400,'5Autre'),0);
const MULTI=ti(600,33,nom(1500,'5Multi'),0,2,AUTRE,0,DOM,4); // __vmi : flags 0, 2 bases
const FAIL2=ti(700,11,nom(1600,'16Standard_Failure'),0);       // même type, autre unité
const BRUIT=ti(800,22,9999999,123456);                            // nom hors mémoire
if(typeof can==='function'){
  A(can(H8,H32,FAIL,CONS),'catch(Standard_Failure&) attrape Standard_ConstructionError (3 niveaux)');
  A(can(H8,H32,TRANS,CONS),'… et catch(Standard_Transient&) aussi');
  A(can(H8,H32,CONS,CONS),'même type : attrapé');
  A(!can(H8,H32,CONS,FAIL),'catch(dérivé&) n\'attrape PAS la base');
  A(!can(H8,H32,AUTRE,CONS),'type sans lien : non attrapé');
  A(can(H8,H32,FAIL,MULTI)&&can(H8,H32,AUTRE,MULTI),'héritage multiple : chaque branche est suivie');
  A(!can(H8,H32,CONS,MULTI),'héritage multiple : pas de faux positif');
  A(can(H8,H32,FAIL2,CONS),'même nom vu par une autre unité de compilation : attrapé');
  A(!can(H8,H32,FAIL,BRUIT)&&!can(H8,H32,FAIL,0),'mémoire illisible : pas d\'exception, réponse « non »');
}

// branchement : application (bac à sable) et harnais (contexte principal de Node)
A(typeof sandbox.___cxa_can_catch==='function'&&typeof sandbox.___cxa_is_pointer_type==='function','l\'application définit les deux fonctions sur son objet global');
A(typeof globalThis.___cxa_can_catch==='function','le harnais les définit là où la colle du noyau les cherche');
A(sandbox.___cxa_can_catch(1,2,0)===1,'sans noyau chargé : réponse « oui » (Standard_Failure, l\'attrapé courant)');
A(globalThis.___cxa_can_catch(1,2,0)===1&&sandbox.___cxa_is_pointer_type(5)===0,'délégation du harnais, pas d\'exception par pointeur');

// V0.15.9 : le worker de suppression de face charge SON noyau — le crochet doit y être posé
if(typeof sandbox.delWkSource==='function'){
  const src=sandbox.delWkSource(),i=src.indexOf('occtExcInstall(self);');
  A(i>0&&/function occtCanCatch/.test(src)&&/function occtTypeName/.test(src),'worker : test d\'héritage et crochet embarqués');
  A(i>0&&i<src.lastIndexOf('self.onmessage'),'worker : crochet posé avant le chargement de son noyau');
}else A(false,'delWkSource exposée par l\'application');

// la colle livrée appelle ces noms sans les définir
const glue=fs.readFileSync(path.join(__dirname,'..','occt','opencascade.full.js'),'utf8');
A(/___cxa_can_catch\(caughtType/.test(glue),'la colle du noyau appelle ___cxa_can_catch');
A(!/function ___cxa_can_catch\b|___cxa_can_catch\s*=/.test(glue),'… sans la définir (sinon cette correction serait à retirer)');

console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(ko?1:0);
