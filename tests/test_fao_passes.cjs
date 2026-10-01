// Matière du viewer : une passe qui ne tue AUCUN voxel doit quand même descendre
// l'affichage (Z-map ET mesh) — colonnes TOUCHÉES collectées via outCols puis
// passé à faoViewerMatterKill. C'est le correctif du « la 3e/5e passe n'enlève
// rien à l'écran » : h[c] baissait déjà, mais mTops n'était recalculé que pour
// les colonnes ayant tué un voxel.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    // --- A) CarveSeg : outCols optionnel, contrat de retour intact sans lui
    "const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:100,y1:80,z1:25},2);",
    "att(!!g&&g.pas===2,'grille pas=2 strict ('+(g?g.pas:'?')+')');",
    "const cols=[];",
    "const k1=faoMatterCarveSeg(g,10,40,15.5,90,40,15.5,40,cols);",
    "att(k1.length>0,'passe 1 (15.5) : voxels tues ('+k1.length+')');",
    "att(cols.length>0,'passe 1 : colonnes touchees collectees ('+cols.length+')');",
    "const c0=cols[0];",
    "att(g.h[c0]===15.5,'passe 1 : Z-map a la cote 15.5 ('+g.h[c0]+')');",
    // passe 2 a 14.5 : cote ENTRE les centres 13 et 15 apres purge a 15.5 →
    // aucun voxel vivant >= 13.5 → kill VIDE, mais la Z-map doit descendre.
    "const cols2=[];",
    "const k2=faoMatterCarveSeg(g,10,40,14.5,90,40,14.5,40,cols2);",
    "att(k2.length===0,'passe 2 (14.5) : aucun voxel tue (le cas du bug)');",
    "att(cols2.length>0,'passe 2 : colonnes touchees quand meme ('+cols2.length+')');",
    "att(g.h[c0]===14.5,'passe 2 : Z-map descendue a 14.5 ('+g.h[c0]+')');",
    "const k3=faoMatterCarveSeg(g,10,40,12,90,40,12,40);",
    "att(Array.isArray(k3)&&k3.length>0,'contrat 7 args : tableau de tues conserve ('+k3.length+')');",
    // --- B) CarveTo : outCols propage (rattrapage 0 → t)
    "const gT=faoMatterGrid({x0:0,y0:0,z0:0,x1:100,y1:80,z1:25},2);",
    "const cT=[];",
    "const kT=faoMatterCarveTo(gT,[{x:10,y:40,z:15.5,r:0},{x:90,y:40,z:15.5,r:0}],[80,80],[0,1],1,cT);",
    "att(kT.length>0&&cT.length>0,'CarveTo : tues + colonnes touchees ('+kT.length+'/'+cT.length+')');",
    // --- C) passage complet par faoViewerMatterStep : le MESH doit suivre les 2 passes
    "const g2=faoMatterGrid({x0:0,y0:0,z0:0,x1:100,y1:80,z1:25},2);",
    "const nc2=g2.nx*g2.ny;",
    "const vw={matterOn:true,matter:{geometry:{attributes:{position:{needsUpdate:false}}}},",
    "  matterGrid:g2,mTops:new Float32Array(nc2),mArr:new Float32Array((nc2*30+6)*3),",
    "  mPos:null,pts:[{x:10,y:40,z:15.5},{x:90,y:40,z:15.5}],dd:[80,80],times:[0,1],t:1};",
    "for(let c=0;c<nc2;c++)vw.mTops[c]=g2.full;",
    "const cc=Math.floor(40/2)*g2.nx+Math.floor(50/2); // colonne sous (50,40)",
    "att(vw.mTops[cc]===g2.full,'avant : sommet au brut ('+vw.mTops[cc]+')');",
    "faoViewerMatterStep(vw,{x:90,y:40,z:15.5,i:1,r:false});",
    "att(vw.mTops[cc]===15.5,'apres passe 1 : sommet a 15.5 ('+vw.mTops[cc]+')');",
    "vw.mPos=null;vw.pts=[{x:10,y:40,z:14.5},{x:90,y:40,z:14.5}];vw.t=1;",
    "faoViewerMatterStep(vw,{x:90,y:40,z:14.5,i:1,r:false});",
    "att(g2.h[cc]===14.5,'passe 2 : Z-map a 14.5 ('+g2.h[cc]+')');",
    "att(vw.mTops[cc]===14.5,'passe 2 : le mesh suit, kill ou non ('+vw.mTops[cc]+')');",
    "att(vw.matter.geometry.attributes.position.needsUpdate===true,'buffer marque a rafraichir');",
    // --- D) sans colonnes ni tues : no-op (aucun crash)
    "faoViewerMatterKill(vw,[],[]);",
    "att(vw.mTops[cc]===14.5,'kill sans colonnes : inchange');",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(function(m){p('  x '+m);});}",
    "else p('TOUT EST CONFORME');",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'fao_passes.js'});
  console.log('=== matiere : chaque passe descend l affichage ===');
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
