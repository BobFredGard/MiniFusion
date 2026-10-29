/* ---------- reliefs procéduraux de l'atelier RENDU (V0.11.0, phase 2) ----------
   Brossé, sablé, moleté, veinage bois, grain, stries d'usinage, couches d'impression 3D : calculés
   dans le shader des matières (onBeforeCompile), sans image ni coordonnées de texture — les pièces
   de CAO n'en ont pas. Le motif est une hauteur h(p) en mm, p = position dans le repère de la
   pièce (il colle à la pièce quand on la tourne) ; la normale est inclinée par les dérivées écran de
   h (bump mapping, comme bumpMap de three). Un motif plus fin que le pixel s'atténue (fwidth) et
   cède la place à un peu de rugosité : pas de moiré, et l'affinage progressif lisse le reste.
   Relief d'un corps : apparence de rendu {rel:{t, e (échelle en mm), d ('x'|'y'|'z')}} (12-materiaux),
   sinon celui de son matériau (MAT_LIB[].rel), sinon aucun. */
const REL_TYPES=[['','Selon le matériau'],['aucun','Aucun'],['brosse','Brossé'],['sable','Sablé / microbillé'],['molete','Moleté'],
  ['bois','Veinage bois'],['grain','Grain (plastique, peinture)'],['stries','Stries d’usinage'],['couches','Couches d’impression 3D']];
// e : échelle par défaut (mm) · a : profondeur (mm) · r : rugosité ajoutée quand le motif est plus fin que le pixel
const REL_DEF={brosse:{e:0.12,a:0.006,r:0.06},sable:{e:0.07,a:0.006,r:0.16},molete:{e:1.0,a:0.16,r:0.02},bois:{e:2.2,a:0.012,r:0.04},
  grain:{e:0.3,a:0.008,r:0.08},stries:{e:0.2,a:0.004,r:0.04},couches:{e:0.2,a:0.03,r:0.05}};
const REL_ID={brosse:1,sable:2,molete:3,bois:4,grain:5,stries:6,couches:7};
function relOf(look,def){
  // relief effectif {t, e, d} d'un corps, ou null
  const r=(look&&look.rel)||{};
  let t=r.t;if(!t)t=def&&def.rel?def.rel.t:'aucun';
  if(!REL_ID[t])return null;
  const dd=def&&def.rel&&def.rel.t===t?def.rel:{};
  return {t,e:r.e>0?r.e:(dd.e>0?dd.e:REL_DEF[t].e),d:r.d||dd.d||'x'};
}
function relNorm(r){ // relu d'un fichier : champs valides seulement ; null si vide
  if(!r||typeof r!=='object')return null;
  const o={};
  if(r.t==='aucun'||REL_ID[r.t])o.t=r.t;
  if(isFinite(+r.e)&&+r.e>0.005&&+r.e<50)o.e=+(+r.e).toFixed(3);
  if(r.d==='x'||r.d==='y'||r.d==='z')o.d=r.d;
  if(typeof PAT_DEF!=='undefined'&&PAT_DEF[r.p]&&r.p!=='propre')o.p=r.p; // patine (98-rendu-surface, V0.13.0)
  return Object.keys(o).length?o:null;
}
const REL_VS_HEAD='varying vec3 vRelP;\nvarying vec3 vRelN;\n';
const REL_FS_HEAD=[
  'varying vec3 vRelP;varying vec3 vRelN;',
  'uniform float uRelT;uniform float uRelF;uniform float uRelA;uniform float uRelR;uniform vec3 uRelD;',
  'float relHash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}',
  'float relNoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);',
  '  return mix(mix(mix(relHash(i),relHash(i+vec3(1,0,0)),f.x),mix(relHash(i+vec3(0,1,0)),relHash(i+vec3(1,1,0)),f.x),f.y),',
  '             mix(mix(relHash(i+vec3(0,0,1)),relHash(i+vec3(1,0,1)),f.x),mix(relHash(i+vec3(0,1,1)),relHash(i+vec3(1,1,1)),f.x),f.y),f.z);}',
  'float relFbm(vec3 x){return relNoise(x)*0.6+relNoise(x*2.03+7.1)*0.3+relNoise(x*4.1+3.7)*0.1;}',
  'float relTri(float x){return abs(fract(x)-0.5)*2.0;}',
  // hauteur du motif (0..1) et, pour le bois, teinte (0..1) ; p en mm, D axe du motif
  'float relH(vec3 p,out float wood){',
  '  vec3 D=normalize(uRelD);vec3 q=p-D*dot(p,D);float f=uRelF;wood=0.5;int t=int(uRelT+0.5);',
  '  if(t==1){float w=dot(p,D);return relFbm(q*f+D*(w*f*0.015))*0.55+relNoise(q*f*0.18+D*(w*f*0.004))*0.45;}', // brossé : traits fins + traînées plus larges le long de D
  '  if(t==2){return relFbm(p*f)*0.7+relNoise(p*f*0.25)*0.3;}',                               // sablé
  '  if(t==3){vec3 a=normalize(cross(D,vec3(0.31,0.57,0.76)));vec3 b=cross(D,a);',            // moleté : pointes de diamant
  '    float u=dot(p,a),v=dot(p,b),w=dot(p,D);',
  '    return 1.0-max(relTri((w+u+v)*f*0.7071),relTri((w-u-v)*f*0.7071));}',
  '  if(t==4){float r=length(q)+relFbm(p*f*0.35)*1.6/f;wood=relTri(r*f);return wood;}',       // bois : cernes autour de D
  '  if(t==5){return relFbm(p*f)*0.75+relNoise(p*f*0.3)*0.25;}',                              // grain
  '  if(t==6){return relTri(length(q)*f);}',                                                 // stries : cercles autour de D
  '  if(t==7){return pow(relTri(dot(p,D)*f),0.6);}',                                         // couches : plans perpendiculaires à D
  '  return 0.0;}',
  'vec3 relPerturb(vec3 surf_pos,vec3 surf_norm,vec2 dHdxy,float faceDirection){',              // perturbNormalArb (three, bumpmap)
  '  vec3 vSigmaX=dFdx(surf_pos.xyz);vec3 vSigmaY=dFdy(surf_pos.xyz);vec3 vN=surf_norm;',
  '  vec3 R1=cross(vSigmaY,vN);vec3 R2=cross(vN,vSigmaX);float fDet=dot(vSigmaX,R1)*faceDirection;',
  '  vec3 vGrad=sign(fDet)*(dHdxy.x*R1+dHdxy.y*R2);return normalize(abs(fDet)*surf_norm-vGrad);}',
  ''].join('\n');
function relApply(mat,rel,S){
  // branche le relief rel ({t,e,d}) et, V0.13.0, les couches et la patine S (surfOpts, 98-rendu-surface :
  // paillettes, taches et traces, usure et salissure lues sur l'attribut aUse de surfGeo) sur une
  // MeshPhysicalMaterial de l'atelier ; rien de tout cela : la matière telle quelle
  const fl=S&&S.fl,wear=!!(S&&S.wear),sv=S?S.pat.v:0;
  if(!rel&&!fl&&!wear&&!sv)return mat;
  const P=rel?REL_DEF[rel.t]:null,D=rel&&rel.d==='y'?[0,1,0]:rel&&rel.d==='z'?[0,0,1]:[1,0,0];
  const U={uRelT:{value:rel?REL_ID[rel.t]:0},uRelF:{value:rel?1/rel.e:1},uRelA:{value:rel?P.a*(rel.e/P.e):0},uRelR:{value:rel?P.r:0},uRelD:{value:new THREE.Vector3(D[0],D[1],D[2])},
    uSfV:{value:sv},uSfW:{value:S?S.pat.w:0},uSfS:{value:S?S.pat.s:0},uSfPaint:{value:S&&S.paint?1:0},uFlT:{value:fl?fl.t:1},uFlI:{value:fl?fl.i:0}};
  mat.userData.rel=U;
  mat.defines=Object.assign(mat.defines||{},wear?{SURF_WEAR:''}:{},fl?{SURF_FLAKE:''}:{});
  mat.onBeforeCompile=function(sh){Object.assign(sh.uniforms,U);relShader(sh);};
  mat.customProgramCacheKey=function(){return 'rdRelief2';};
  mat.needsUpdate=true;
  return mat;
}
function relShader(sh){
  // relief, couches et patine dans le shader d'une matière standard ou physique : relApply, et la vue
  // en ambiance de rendu (98-rendu-vue) ; uniformes de relApply (uRel*, uSf*, uFl*) à fournir
  sh.vertexShader=REL_VS_HEAD+SURF_VS_HEAD+sh.vertexShader
    .replace('#include <begin_vertex>','#include <begin_vertex>\n  vRelP = transformed; vRelN = objectNormal;\n#ifdef SURF_WEAR\n  vUse = aUse;\n#endif');
  sh.fragmentShader=REL_FS_HEAD+SURF_FS_HEAD+sh.fragmentShader
    .replace('#include <color_fragment>','#include <color_fragment>\n'+
      '  float relWood; float relHv = relH( vRelP, relWood );\n'+
      // visibilité : motifs aléatoires jugés sur leurs composantes larges (l'affinage moyenne le reste) ;
      // motifs réguliers (moleté, stries, couches) sur leur pas — sinon moiré
      '  int relT = int( uRelT + 0.5 ); float relK = ( relT == 3 || relT == 6 || relT == 7 ) ? 1.0 : 0.3;\n'+
      '  float relFw = relK * ( fwidth( vRelP.x * uRelF ) + fwidth( vRelP.y * uRelF ) + fwidth( vRelP.z * uRelF ) );\n'+
      '  float relVis = 1.0 - smoothstep( 0.35, 1.2, relFw );\n'+                              // motif plus fin que le pixel : il s'estompe
      '  if( int( uRelT + 0.5 ) == 4 ) diffuseColor.rgb *= mix( 0.62, 1.08, mix( 0.5, relWood, max( relVis, 0.35 ) ) );\n'+SURF_FS_COLOR)
    .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n'+
      '  roughnessFactor = clamp( roughnessFactor + uRelR * ( 1.0 - relVis ) + uRelR * 0.4 * relVis * ( relHv - 0.5 ), 0.03, 1.0 );\n'+SURF_FS_ROUGH)
    .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n'+SURF_FS_METAL)
    .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+
      '  normal = relPerturb( - vViewPosition, normal, vec2( dFdx( relHv ), dFdy( relHv ) ) * uRelA * relVis, faceDirection );\n'+SURF_FS_NORMAL);
}
