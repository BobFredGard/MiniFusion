// V0.22.5 : arborescence d'un STEP multi-corps, et pièces masquées.
// L'arbre d'assemblage est lu dans le TEXTE du STEP (PRODUCT / NAUO) et calé sur les
// composés du noyau (importStepOcc → oc). Contrôles :
//   A. chaînes STEP : '' , \X\hh, \X2\…\X0\, \S\c, fins de ligne au milieu d'un nom ;
//   B. MERLIN-37-000.step (noyau réel) : nom de la racine, chaque occurrence une seule fois,
//      et AUCUNE pièce géométrique (IsPartner) sous deux noms différents ;
//   C. structure qui ne colle pas → noms génériques, toutes les occurrences gardées ;
//   D. masquage : triangles des occurrences masquées aplatis, rendus tels quels ensuite.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  console.log('=== V0.22.5 : arborescence d’un STEP multi-corps ===');

  // ── A. chaînes STEP ──
  const s=vm.runInContext(`[importStepStr("'Vis d''assemblage \\\\X\\\\E0 t\\\\X\\\\EAte'"),importStepStr("'Cavit\\\\X2\\\\00E9\\\\X0\\\\ v41:1'"),importStepStr("'\\\\S\\\\i'"),importStepStr("$")]`,ctx);
  A(s[0]==="Vis d'assemblage à tête",'\\X\\hh et apostrophe doublée ('+s[0]+')');
  A(s[1]==='Cavité v41:1','\\X2\\…\\X0\\ ('+s[1]+')');
  A(s[2]==='é','\\S\\c = moitié haute Latin-1 ('+s[2]+')');
  A(s[3]==='','argument non chaîne → vide');

  // ── B. fichier réel ──
  const F=path.join(ROOT,'Exemples','MERLIN-37-000.step');
  const buf=fs.existsSync(F)?fs.readFileSync(F):null;
  if(!buf||buf.slice(0,40).toString().indexOf('git-lfs')>=0)console.log('  (MERLIN-37-000.step absent ou pointeur LFS : partie B sautée — `git lfs checkout`)');
  else{
    sandbox.__u8=new Uint8Array(buf);
    const r=vm.runInContext(`(function(){
      occt.FS.writeFile('/arbre.stp',__u8);const rd=new occt.STEPControl_Reader_1();rd.ReadFile('/arbre.stp');rd.TransferRoots();const sh=rd.OneShape();
      const O=importStepOcc(sh);const T=importStepTree(__u8,O.oc,O.nOcc);
      const vus=new Map(),noms=new Map();let leaves=0;
      const walk=n=>{if(!n.k.length){leaves++;const o=n.o[0];vus.set(o,(vus.get(o)||0)+1);
        const nm=n.n.replace(/:\\d+$/,'').replace(/ \\(\\d+\\)$/,''),p=O.occPart[o];if(!noms.has(p))noms.set(p,new Set());noms.get(p).add(nm);}
        n.k.forEach(walk);};
      if(T)walk(T);
      return {nOcc:O.nOcc,ok:!!T,root:T&&T.n,top:T?T.k.length:0,leaves,uniq:[...vus.values()].every(v=>v===1)&&vus.size===O.nOcc,
        deuxNoms:[...noms.values()].filter(s=>s.size>1).length,generique:!!T&&/^(Solide|Sous-ensemble) /.test(T.k[0].n),
        uns:T?T.k.map(c=>c.n).slice(0,3):[]};
    })()`,ctx);
    console.log('  MERLIN : '+r.nOcc+' occurrences, racine « '+r.root+' », '+r.top+' enfants : '+r.uns.join(' · ')+'…');
    A(r.ok,'arbre construit');
    A(r.root==='003-04-000-Ensemble Vissage','racine = nom du produit de tête');
    A(!r.generique,'noms lus dans le fichier (pas de repli générique)');
    A(r.leaves===r.nOcc&&r.uniq,'chaque occurrence apparaît une seule fois ('+r.leaves+'/'+r.nOcc+')');
    A(r.deuxNoms===0,'aucune pièce géométrique sous deux noms différents (noms calés sur la bonne forme)');

    // ── E. V0.23.8 : arêtes d'une pièce masquée retirées ──
    const e=vm.runInContext(`(function(){
      const rd=new occt.STEPControl_Reader_1();rd.ReadFile('/arbre.stp');rd.TransferRoots();const sh=rd.OneShape();
      const O=importStepOcc(sh),E=occSharpEdges(sh);
      const occs=x=>[...new Set(x.fs.map(fi=>O.faceOcc[fi]))];
      const avec=E.filter(x=>x.fs&&x.fs.length),une=avec.filter(x=>occs(x).length===1);
      const b={mesh:{geometry:{userData:{impOcc:O,impHidKey:'0'}}}};
      const keep=importEdgeShown(b),gard=E.filter(keep),ret=E.filter(x=>!keep(x));
      const sig0=importHidSig({mesh:{geometry:{userData:{impOcc:O}}}}),sig1=importHidSig(b);
      b.mesh.geometry.userData.impHidKey='';
      return {n:E.length,avec:avec.length,une:une.length,gard:gard.length,ret:ret.length,
        retOk:ret.every(x=>occs(x).every(o=>o===0)),aucun:importEdgeShown(b)===null,sig0,sig1};
    })()`,ctx);
    console.log('  MERLIN : '+e.n+' arêtes, '+e.avec+' avec faces voisines, '+e.une+' sur une seule occurrence ; occurrence 0 masquée → '+e.ret+' retirées');
    A(e.avec===e.n,'chaque arête connaît ses faces voisines');
    A(e.une>=0.95*e.avec,'faces voisines sur la même pièce (ordinaux calés sur faceOcc)');
    A(e.ret>0&&e.gard+e.ret===e.n&&e.retOk,'occurrence masquée : ses arêtes retirées, et seulement elles');
    A(e.aucun,'rien de masqué : aucun filtre');
    A(e.sig0===''&&e.sig1==='[0]','signature de visibilité : suit les pièces masquées');
  }

  // ── C. repli générique ──
  const g=vm.runInContext(`(function(){
    const txt="ISO-10303-21;\\nDATA;\\n#1=PRODUCT('A','A','',(#9));\\n#2=PRODUCT_DEFINITION_FORMATION('','',#1);\\n#3=PRODUCT_DEFINITION('','',#2,#9);\\nENDSEC;\\n";
    const u8=new Uint8Array([...txt].map(c=>c.charCodeAt(0)));
    const oc={k:[{o:0},{k:[{o:1},{o:2}]}]};
    const T=importStepTree(u8,oc,3);
    return {ok:!!T,n:T&&T.k.map(c=>c.n),o:T&&T.o.slice().sort().join(',')};
  })()`,ctx);
  A(g.ok&&g.o==='0,1,2','structure sans assemblage : arbre générique, 3 occurrences gardées');
  A(g.ok&&g.n[0]==='A (1)'&&g.n[1]==='A (2)','solides propres d’une pièce : nom du produit numéroté ('+(g.n||[]).join(' · ')+')');

  // ── D. masquage ──
  const h=vm.runInContext(`(function(){
    const P=new Float32Array(3*9);for(let i=0;i<P.length;i++)P[i]=i+1;
    const g={attributes:{position:{array:P,needsUpdate:false}},userData:{occGroups:[{f:0,start:0,count:1},{f:1,start:1,count:2}],impOcc:{nOcc:2,faceOcc:Int32Array.from([0,1])}}};
    const f={name:'t',_mesh:{geometry:g},hidOcc:[1]};
    importHideApply(f);
    const flat=t=>P[t*9]===P[t*9+3]&&P[t*9]===P[t*9+6]&&P[t*9+2]===P[t*9+8];
    const a=[flat(0),flat(1),flat(2)];
    delete f.hidOcc;importHideApply(f);
    const b=P.every((v,i)=>v===i+1);
    return {a,b,key:g.userData.impHidKey};
  })()`,ctx);
  A(!h.a[0]&&h.a[1]&&h.a[2],'occurrence masquée : ses triangles aplatis, les autres intacts');
  A(h.b&&h.key==='','tout ré-affiché : positions d’origine rendues au bit près');

  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
