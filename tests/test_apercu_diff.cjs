// 2026-09-31m : l'aperçu montre le SOLIDE COMPLET avec congé/chanfrein (plus de patch
// localisé — les 2 booléens de diff ont été supprimés). Ce test vise la vraie fonction
// `xPreviewShape` (pas une copie de sa logique) sur une boîte construite ici même :
// aucune dépendance à un fichier modèle. Congé + chanfrein, cas vides.
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
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const body=[
    'const out={};',
    'const bb=s=>{let E=[];try{E=occListEdges(s);}catch(e){return null;}',
    '  if(!E.length)return null;',
    '  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;',
    '  const add=p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);};',
    '  E.forEach(e=>{add(e.mid);add(e.pts[0]);add(e.pts[e.pts.length-1]);});',
    '  return {dx:x1-x0,dy:y1-y0,dz:z1-z0,n:E.length};};',
    'const tri=s=>{let n=0;try{n=occListEdges(s).length;}catch(e){}return n;};',
    'const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40);',
    'const box=mk.Shape();',
    'out.bbBase=bb(box);',
    'const E=occListEdges(box);',
    'const cible=E.map((e,i)=>({i:i,e:e})).filter(o=>{const a=o.e.pts[0],b=o.e.pts[o.e.pts.length-1];',
    '  const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);',
    '  return L>4&&Math.abs(b[2]-a[2])>Math.hypot(b[0]-a[0],b[1]-a[1]);})[0];',
    'out.arete=cible?{mid:cible.e.mid.map(v=>+v.toFixed(1)),src:cible.e.src}:null;',
    'const jobs=cible?[{src:cible.e.src,r:4,mid:cible.e.mid}]:[];',
    'const pf=xPreviewShape(box,jobs,false);',
    'out.conge=pf&&pf.shape?{bb:bb(pf.shape),tri:tri(pf.shape)}:null;',
    'if(pf&&pf.shape){try{pf.shape.delete();}catch(e){}}',
    'const jobsC=cible?[{src:cible.e.src,r:6,mid:cible.e.mid}]:[];',
    'const pc=xPreviewShape(box,jobsC,true);',
    'out.chanfrein=pc&&pc.shape?{bb:bb(pc.shape),tri:tri(pc.shape)}:null;',
    'if(pc&&pc.shape){try{pc.shape.delete();}catch(e){}}',
    'out.vide=xPreviewShape(box,[],false);',
    'out.nul=xPreviewShape(null,jobs,false);',
    'try{box.delete();}catch(e){}try{mk.delete();}catch(e){}',
    'return out;'
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  const fx=v=>v?('solide '+v.dx.toFixed(0)+'×'+v.dy.toFixed(0)+'×'+v.dz.toFixed(0)+' mm, '+v.n+' arêtes'):'VIDE';
  console.log('=== 2026-09-31m : aperçu = solide complet ===');
  console.log('  boîte : '+fx(r.bbBase));
  console.log('  arête cible : '+JSON.stringify(r.arete));
  const B=r.bbBase;
  const verif=(nom,p)=>{
    if(!p){console.log('  '+nom+' : NON PRODUIT');A(false,nom+' : solide produit');return;}
    // NOTE : on compte les arêtes, pas les triangles — le stub THREE du harnais n'a pas
    // BufferGeometry, donc occTessellate y est intestable (préexistant, inchangé par 31m).
    console.log('  '+nom+' : '+fx(p.bb)+' + '+p.tri+' arêtes');
    A(true,nom+' : solide produit');
    const d=Math.max(Math.abs(p.bb.dx-B.dx),Math.abs(p.bb.dy-B.dy),Math.abs(p.bb.dz-B.dz));
    A(d<B.dx*0.15,nom+' : solide complet, pas un patch localisé (écart '+d.toFixed(1)+' mm)');
    A(p.tri>0,nom+' : solide valide ('+p.tri+' arêtes)');
  };
  verif('congé   R4',r.conge);
  verif('chanfr. D6',r.chanfrein);
  A(r.vide===null,'jobs vides -> null (pas d\u2019aperçu fantôme)');
  A(r.nul===null,'base nulle -> null');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,800));process.exit(1);});
