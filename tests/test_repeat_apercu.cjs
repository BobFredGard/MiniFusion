// V0.11.20 : APERÇU ROUGE des copies d'une répétition dès le choix du plan / de l'axe (retour :
// « j'aimerais voir les répétitions en rouge sur cette 1ère étape pour voir si je ne me trompe
// pas de plan »). Les matrices d'instances (repPreviewXforms) doivent transformer un point
// exactement comme repTransformPoint / repGenChildren : linéaire (grille comprise), circulaire
// (pas sur tour complet ou secteur), symétrie simple, symétrie double (image 1, image 2 et image
// de l'image 1), plans identiques (une seule image). Sans noyau ni THREE réel.
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const vm=require('vm');
const R=`
const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
const ap=(M,p)=>[M[0]*p[0]+M[4]*p[1]+M[8]*p[2]+M[12],M[1]*p[0]+M[5]*p[1]+M[9]*p[2]+M[13],M[2]*p[0]+M[6]*p[1]+M[10]*p[2]+M[14]];
const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<1e-9;
const P=[[7,-3,11],[0,0,0],[-2.5,4,1]];
const check=(tag,cfg,expect)=>{
  const ms=repPreviewXforms(cfg);
  A(ms.length===expect.length,tag+' : '+ms.length+' image(s), attendu '+expect.length);
  ms.forEach((M,i)=>{const ok=P.every(p=>near(ap(M,p),expect[i](p)));A(ok,tag+' : image '+(i+1)+' = transformation de la répétition');});
};
// linéaire X, 3 au total (copies = 2), pas 20
check('linéaire',{type:'lin',copies:2,dist:20,axis:'X'},[p=>repTransformPoint(p,1,{mode:'lin',copies:2,dist:20,axis:'X'}),p=>repTransformPoint(p,2,{mode:'lin',copies:2,dist:20,axis:'X'})]);
// grille 2 × 2 : cases (1,0), (0,1), (1,1)
{const c={type:'lin',copies:1,dist:20,axis:'X',lin2:true,axis2:'Y',copies2:1,dist2:15};
 const cells=repLinCells(c);
 check('grille',c,cells.map(cell=>p=>repTransformPoint(p,1,Object.assign({},c,{mode:'lin',_off:cell.off}))));}
// circulaire Z, 4 au total sur 360° (pas 90°) et 3 sur 90° (pas 45°)
check('circulaire 360',{type:'circ',copies:3,angle:360,axis:'Z'},[1,2,3].map(i=>p=>repTransformPoint(p,i,{mode:'circ',copies:3,angle:360,axis:'Z'})));
check('circulaire 90',{type:'circ',copies:2,angle:90,axis:'Z'},[1,2].map(i=>p=>repTransformPoint(p,i,{mode:'circ',copies:2,angle:90,axis:'Z'})));
// direction donnée par une face / arête
check('circulaire axe libre',{type:'circ',copies:1,angle:120,axis:'Face',dir:[1,1,0]},[p=>repTransformPoint(p,1,{mode:'circ',copies:1,angle:120,axis:'Face',dir:[1,1,0]})]);
// symétrie simple YZ, puis par normale de face
check('symétrie YZ',{type:'mir',plane:'YZ'},[p=>repTransformPoint(p,1,{mode:'mir',plane:'YZ'})]);
check('symétrie face',{type:'mir',plane:'Face',planeN:[0,3,4]},[p=>repTransformPoint(p,1,{mode:'mir',plane:'Face',planeN:[0,3,4]})]);
// symétrie double YZ puis XZ : image 1 (YZ), image 2 (XZ), image de l'image 1 (XZ ∘ YZ)
{const m1=p=>repTransformPoint(p,1,{mode:'mir',plane:'YZ'}),m2=p=>repTransformPoint(p,1,{mode:'mir',plane:'XZ'});
 check('symétrie double',{type:'mir',plane:'YZ',plane2:'XZ'},[m1,m2,p=>m2(m1(p))]);}
// plans identiques : la 2ᵉ passe ne fait rien
check('symétrie double même plan',{type:'mir',plane:'YZ',plane2:'Face',planeN2:[-1,0,0]},[p=>repTransformPoint(p,1,{mode:'mir',plane:'YZ'})]);
// pas de mode : rien
A(repPreviewXforms(null).length===0,'sans mode : aucune image');
// mise à jour sans corps : ne lève pas
repMode={type:'mir',plane:'YZ',copies:1,feats:[]};bodies=[];
let thrown=null;try{repPreviewUpdate();repPreviewRemove();}catch(e){thrown=e;}
A(!thrown,'repPreviewUpdate sans corps : sans exception ('+(thrown&&thrown.message)+')');
repMode=null;
out`;
const o=vm.runInContext('(()=>{'+R.replace(/\nout$/,'\nreturn out;')+'})()',ctx);
console.log('=== V0.11.20 : aperçu rouge des copies d\'une répétition ===');
(o.log||[]).forEach(m=>console.log('  ✓ '+m));
if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
console.log('\n*** TOUT PASSE ***');
