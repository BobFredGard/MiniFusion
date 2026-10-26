/* ---------- bibliothèque de matériaux (V0.10.0) ----------
   UNE liste pour toute l'application : la CAO s'en sert pour la COULEUR d'un corps (et une
   masse estimée), l'atelier RENDU (98-rendu) pour l'aspect physique (métal, rugosité, vernis,
   transmission). Un corps porte la clé du matériau dans sa fiche : doc.bodies[].mat.
   Choisir un matériau donne au corps la couleur du matériau ; on peut ensuite changer la
   couleur à la main (alu anodisé rouge, ABS jaune…) : le matériau garde son FINI.
   Champs : k clé stable (enregistrée dans les fichiers — ne jamais renommer), nom, fam famille,
   col couleur de base, metal 0..1, rough 0..1, cc vernis 0..1, ccr rugosité du vernis,
   trans transmission 0..1 (verres), ior, rho densité g/cm³, sheen velours (élastomères), gv « Transparence »
   de la vue CAO pour un verre (verre approché : setMatAlpha, 0,1 = clair … 1 = opaque). */
const MAT_FAMS=['Aciers et fontes','Aluminium','Métaux non ferreux','Plastiques','Élastomères','Peintures','Bois','Verres et transparents'];
const MAT_LIB=[
  // aciers et fontes
  {k:'acier',nom:'Acier usiné',fam:'Aciers et fontes',col:0x9ea3a8,metal:1,rough:0.32,rho:7.85},
  {k:'acier-poli',nom:'Acier poli',fam:'Aciers et fontes',col:0xc4c8cc,metal:1,rough:0.12,rho:7.85},
  {k:'inox',nom:'Inox brossé',fam:'Aciers et fontes',col:0xb9bcbf,metal:1,rough:0.26,rho:7.9},
  {k:'inox-miroir',nom:'Inox poli miroir',fam:'Aciers et fontes',col:0xdadcde,metal:1,rough:0.04,rho:7.9},
  {k:'acier-noir',nom:'Acier bruni (noir)',fam:'Aciers et fontes',col:0x2a2b2d,metal:0.9,rough:0.38,rho:7.85},
  {k:'acier-zingue',nom:'Acier zingué',fam:'Aciers et fontes',col:0xc9cdd2,metal:1,rough:0.3,rho:7.85},
  {k:'fonte',nom:'Fonte',fam:'Aciers et fontes',col:0x5d5f62,metal:0.85,rough:0.6,rho:7.2},
  // aluminium
  {k:'alu',nom:'Aluminium usiné',fam:'Aluminium',col:0xd3d6d9,metal:1,rough:0.28,rho:2.7},
  {k:'alu-poli',nom:'Aluminium poli',fam:'Aluminium',col:0xe6e8ea,metal:1,rough:0.08,rho:2.7},
  {k:'alu-sable',nom:'Aluminium microbillé',fam:'Aluminium',col:0xc8cbce,metal:1,rough:0.55,rho:2.7},
  {k:'alu-anod-nat',nom:'Alu anodisé naturel',fam:'Aluminium',col:0xbfc2c5,metal:0.9,rough:0.42,rho:2.7},
  {k:'alu-anod-noir',nom:'Alu anodisé noir',fam:'Aluminium',col:0x1f2023,metal:0.75,rough:0.42,rho:2.7},
  {k:'alu-anod-rouge',nom:'Alu anodisé rouge',fam:'Aluminium',col:0xb3121c,metal:0.8,rough:0.38,rho:2.7},
  {k:'alu-anod-bleu',nom:'Alu anodisé bleu',fam:'Aluminium',col:0x1d54b8,metal:0.8,rough:0.38,rho:2.7},
  {k:'alu-anod-or',nom:'Alu anodisé or',fam:'Aluminium',col:0xc9a13b,metal:0.85,rough:0.36,rho:2.7},
  {k:'alu-anod-titane',nom:'Alu anodisé gris titane',fam:'Aluminium',col:0x6e7177,metal:0.85,rough:0.4,rho:2.7},
  // non ferreux
  {k:'laiton',nom:'Laiton',fam:'Métaux non ferreux',col:0xd6b25e,metal:1,rough:0.24,rho:8.5},
  {k:'bronze',nom:'Bronze',fam:'Métaux non ferreux',col:0xb07a45,metal:1,rough:0.32,rho:8.8},
  {k:'cuivre',nom:'Cuivre',fam:'Métaux non ferreux',col:0xd9825b,metal:1,rough:0.22,rho:8.96},
  {k:'titane',nom:'Titane',fam:'Métaux non ferreux',col:0xa7a59f,metal:1,rough:0.34,rho:4.43},
  {k:'or',nom:'Or',fam:'Métaux non ferreux',col:0xf2c45a,metal:1,rough:0.14,rho:19.3},
  {k:'chrome',nom:'Chrome',fam:'Métaux non ferreux',col:0xe8eaec,metal:1,rough:0.03,rho:7.19},
  // plastiques
  {k:'abs-noir',nom:'ABS noir',fam:'Plastiques',col:0x1b1c1e,metal:0,rough:0.45,cc:0.15,ccr:0.4,rho:1.05},
  {k:'abs-blanc',nom:'ABS blanc',fam:'Plastiques',col:0xeeeeea,metal:0,rough:0.45,cc:0.15,ccr:0.4,rho:1.05},
  {k:'abs-gris',nom:'ABS gris',fam:'Plastiques',col:0x7a7d82,metal:0,rough:0.48,rho:1.05},
  {k:'pla-mat',nom:'PLA mat (impression 3D)',fam:'Plastiques',col:0xff7a1f,metal:0,rough:0.7,rho:1.24},
  {k:'pla-brillant',nom:'PLA brillant',fam:'Plastiques',col:0x0a84ff,metal:0,rough:0.25,cc:0.4,ccr:0.2,rho:1.24},
  {k:'petg',nom:'PETG',fam:'Plastiques',col:0x30d158,metal:0,rough:0.3,cc:0.3,ccr:0.2,rho:1.27},
  {k:'pom',nom:'POM (Delrin)',fam:'Plastiques',col:0xf4f2ec,metal:0,rough:0.35,rho:1.41},
  {k:'pa-nylon',nom:'Polyamide (nylon)',fam:'Plastiques',col:0xe9e4d4,metal:0,rough:0.6,rho:1.14},
  {k:'pe-hd',nom:'Polyéthylène HD',fam:'Plastiques',col:0xf1f1ee,metal:0,rough:0.5,rho:0.95},
  // élastomères
  {k:'caoutchouc',nom:'Caoutchouc noir',fam:'Élastomères',col:0x18191a,metal:0,rough:0.85,sheen:0.3,rho:1.2},
  {k:'silicone',nom:'Silicone',fam:'Élastomères',col:0xd84a3a,metal:0,rough:0.6,sheen:0.2,rho:1.15},
  {k:'tpu',nom:'TPU souple',fam:'Élastomères',col:0x3a3d42,metal:0,rough:0.65,sheen:0.2,rho:1.21},
  // peintures
  {k:'peint-mat',nom:'Peinture mate',fam:'Peintures',col:0x2e3a46,metal:0,rough:0.8},
  {k:'peint-satin',nom:'Peinture satinée',fam:'Peintures',col:0xd8d4cc,metal:0,rough:0.45,cc:0.3,ccr:0.35},
  {k:'peint-laque',nom:'Laque brillante',fam:'Peintures',col:0xc8102e,metal:0,rough:0.3,cc:1,ccr:0.03},
  {k:'peint-metal',nom:'Peinture métallisée',fam:'Peintures',col:0x2c4f86,metal:0.6,rough:0.35,cc:1,ccr:0.03},
  {k:'peint-epoxy',nom:'Poudre époxy texturée',fam:'Peintures',col:0x1f2a22,metal:0,rough:0.7,cc:0.1,ccr:0.6},
  // bois
  {k:'bois-hetre',nom:'Hêtre',fam:'Bois',col:0xd9b48a,metal:0,rough:0.65,rho:0.72},
  {k:'bois-chene',nom:'Chêne',fam:'Bois',col:0xa77a4b,metal:0,rough:0.6,rho:0.75},
  {k:'bois-noyer',nom:'Noyer verni',fam:'Bois',col:0x5c3a24,metal:0,rough:0.4,cc:0.6,ccr:0.1,rho:0.65},
  {k:'mdf',nom:'MDF',fam:'Bois',col:0xb39a76,metal:0,rough:0.85,rho:0.75},
  // verres et transparents
  {k:'verre',nom:'Verre',fam:'Verres et transparents',col:0xf4fbff,metal:0,rough:0.02,trans:1,ior:1.5,rho:2.5,gv:0.12},
  {k:'verre-depoli',nom:'Verre dépoli',fam:'Verres et transparents',col:0xf0f6f8,metal:0,rough:0.35,trans:1,ior:1.5,rho:2.5,gv:0.5},
  {k:'pmma',nom:'PMMA (plexiglas)',fam:'Verres et transparents',col:0xf7fbff,metal:0,rough:0.03,trans:1,ior:1.49,rho:1.19,gv:0.12},
  {k:'pc-fume',nom:'Polycarbonate fumé',fam:'Verres et transparents',col:0x5a5f66,metal:0,rough:0.05,trans:0.85,ior:1.58,rho:1.2,gv:0.3}
];
const MAT_BY_KEY=Object.create(null);
MAT_LIB.forEach(m=>{MAT_BY_KEY[m.k]=m;});
function matDef(k){return(k&&MAT_BY_KEY[k])||null;}
function bodyMatOf(id){ // clé du matériau d'un corps (null = aucun)
  try{const e=bodyEntryOf(id);return(e&&matDef(e.mat))?e.mat:null;}catch(err){return null;}
}
function bodyGlassEff(id){
  // transparence AFFICHÉE dans la vue : le réglage « Transparence » du corps s'il en a un, sinon
  // celle de son matériau (verre approché : la vue CAO ne calcule pas la transmission, l'atelier si)
  const g=bodyGlassOf(id);if(g<0.999)return g;
  const d=matDef(bodyMatOf(id));return d&&d.gv?d.gv:1;
}
function setBodyMat(id,k){ // matériau + sa couleur de base (la couleur reste modifiable ensuite)
  if(!id)return false;const e=bodyEntry(id);if(!e)return false;
  const m=matDef(k);
  if(!m){delete e.mat;return true;}
  e.mat=m.k;e.color=m.col;
  return true;
}
function matSelect(cur,onPick,noneLabel){
  // liste déroulante groupée par famille, la même partout (fiche du corps, atelier RENDU)
  const s=document.createElement('select');
  const o0=document.createElement('option');o0.value='';o0.textContent=noneLabel||'— Aucun —';s.appendChild(o0);
  MAT_FAMS.forEach(f=>{
    const g=document.createElement('optgroup');g.label=f;
    g.style.color='#5b5b63';g.style.background='#ececf0';g.style.fontStyle='normal'; // la liste déroulante est claire : titre de famille lisible quel que soit le thème
    MAT_LIB.filter(m=>m.fam===f).forEach(m=>{const o=document.createElement('option');o.value=m.k;o.textContent=m.nom;o.style.color='#1c1c1e';o.style.background='#fff';if(m.k===cur)o.selected=true;g.appendChild(o);});
    s.appendChild(g);
  });
  s.onchange=()=>onPick(s.value||null);
  return s;
}
function meshVolumeMm3(mesh){
  // volume d'un maillage fermé (somme des tétraèdres signés), en mm³, dans le repère du monde
  try{
    const g=mesh&&mesh.geometry;const P=g&&g.attributes&&g.attributes.position;if(!P)return 0;
    mesh.updateMatrixWorld(true);
    const M=mesh.matrixWorld,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    const I=g.index,n=I?I.count:P.count;let v=0;
    for(let i=0;i+2<n;i+=3){
      const i0=I?I.getX(i):i,i1=I?I.getX(i+1):i+1,i2=I?I.getX(i+2):i+2;
      a.fromBufferAttribute(P,i0).applyMatrix4(M);b.fromBufferAttribute(P,i1).applyMatrix4(M);c.fromBufferAttribute(P,i2).applyMatrix4(M);
      v+=a.dot(b.clone().cross(c));
    }
    return Math.abs(v/6);
  }catch(err){return 0;}
}
function bodyVolumeMm3(id){ // somme des maillages affichés du corps
  let v=0;
  try{(bodies||[]).forEach(b=>{if(b&&!b.ghost&&b.mesh&&bodyIdOfRuntime(b)===id)v+=meshVolumeMm3(b.mesh);});}catch(err){}
  return v;
}
function fmtMasse(g){return g>=1000?(g/1000).toFixed(g>=10000?1:2).replace('.',',')+' kg':g.toFixed(g>=100?0:1).replace('.',',')+' g';}
/* ── apparences de RENDU (V0.10.0) : propres au rendu, la pièce CAO garde les siennes ──
   doc.rendu = {corps:{[id du corps]:{mat?, col?}}} — un champ absent = celui de la CAO ; mat '' = aucun.
   Lues par l'atelier RENDU (98-rendu) et par les environnements de rendu de la vue
   (98-rendu-vue) ; jamais par l'affichage CAO, l'usinage ni la mise en plan. */
function renduNorm(r){ // relu d'un fichier : champs valides seulement ; null si vide
  if(!r||typeof r!=='object'||!r.corps||typeof r.corps!=='object')return null;
  const c={};
  Object.keys(r.corps).forEach(id=>{const e=r.corps[id];if(!e||typeof e!=='object')return;
    const o={};if(e.mat===''||matDef(e.mat))o.mat=e.mat; /* '' = « sans matériau » voulu pour le rendu */
    if(isFinite(+e.col)&&+e.col>=0&&+e.col<=0xffffff)o.col=+e.col;
    if(Object.keys(o).length)c[id]=o;});
  return Object.keys(c).length?{corps:c}:null;
}
function renderLookOwn(id){try{return(doc&&doc.rendu&&doc.rendu.corps&&doc.rendu.corps[id])||null;}catch(e){return null;}}
function renderLookOf(id){
  // {mat, color, own} : l'apparence du rendu, sinon celle de la CAO (matériau + couleur du corps)
  const r=renderLookOwn(id);
  const mat=r&&r.mat!==undefined?r.mat:bodyMatOf(id);
  const color=r&&r.col!=null?r.col:bodyColorOf(id);
  return {mat:matDef(mat)?mat:null,color,own:!!r};
}
function setRenderLook(id,k,col){
  // matériau k (null = aucun) et couleur col (null = celle du matériau, sinon celle de la CAO)
  if(!id||!doc)return false;
  const m=matDef(k);
  const o={mat:m?m.k:''}; // '' : sans matériau, même si le corps en a un en CAO
  o.col=col!=null?col:(m?m.col:bodyColorOf(id));
  if(!doc.rendu||!doc.rendu.corps)doc.rendu={corps:{}};
  doc.rendu.corps[id]=o;
  return true;
}
function clearRenderLook(id){ // revient à l'apparence CAO
  if(!doc||!doc.rendu||!doc.rendu.corps)return false;
  delete doc.rendu.corps[id];
  if(!Object.keys(doc.rendu.corps).length)doc.rendu=null;
  return true;
}
