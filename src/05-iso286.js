/* ═══════════════════════════════════════════════════════════════════════════
   ISO 286 — tolérances des alésages (A … ZC) et des arbres (a … zc) — V0.24.0
   Demande : « en mise en plan, il me faut toutes les tolérances existantes de l'ISO ;
   pour les perçages alésés pareil, mais uniquement pour les trous (grandes lettres) ».
   • ISO 286-1 : qualités IT01 … IT18, écarts fondamentaux de toutes les lettres,
     règle de Δ pour K, M, N (≤ IT8) et P … ZC (≤ IT7), cas particulier M6 250-315.
   • Plages de Ø jusqu'à 500 mm (au-delà : pas de tolérance, plutôt qu'une valeur fausse).
   • Qualités proposées par lettre : celles des tables ISO 286-2.
   Partagé par la fonction 3D Perçage (76) et la mise en plan (98-mep). Valeurs en µm.
   ═══════════════════════════════════════════════════════════════════════════ */
// plages principales (qualités IT) et intermédiaires (écarts fondamentaux), bornes hautes incluses
const ISO286_MAIN=[3,6,10,18,30,50,80,120,180,250,315,400,500];
const ISO286_SUB=[3,6,10,14,18,24,30,40,50,65,80,100,120,140,160,180,200,225,250,280,315,355,400,450,500];
const ISO286_IT={
  '01':[0.3,0.4,0.4,0.5,0.6,0.6,0.8,1,1.2,2,2.5,3,4],
  '0':[0.5,0.6,0.6,0.8,1,1,1.2,1.5,2,3,4,5,6],
  1:[0.8,1,1,1.2,1.5,1.5,2,2.5,3.5,4.5,6,7,8],
  2:[1.2,1.5,1.5,2,2.5,2.5,3,4,5,7,8,9,10],
  3:[2,2.5,2.5,3,4,4,5,6,8,10,12,13,15],
  4:[3,4,4,5,6,7,8,10,12,14,16,18,20],
  5:[4,5,6,8,9,11,13,15,18,20,23,25,27],
  6:[6,8,9,11,13,16,19,22,25,29,32,36,40],
  7:[10,12,15,18,21,25,30,35,40,46,52,57,63],
  8:[14,18,22,27,33,39,46,54,63,72,81,89,97],
  9:[25,30,36,43,52,62,74,87,100,115,130,140,155],
  10:[40,48,58,70,84,100,120,140,160,185,210,230,250],
  11:[60,75,90,110,130,160,190,220,250,290,320,360,400],
  12:[100,120,150,180,210,250,300,350,400,460,520,570,630],
  13:[140,180,220,270,330,390,460,540,630,720,810,890,970],
  14:[250,300,360,430,520,620,740,870,1000,1150,1300,1400,1550],
  15:[400,480,580,700,840,1000,1200,1400,1600,1850,2100,2300,2500],
  16:[600,750,900,1100,1300,1600,1900,2200,2500,2900,3200,3600,4000],
  17:[1000,1200,1500,1800,2100,2500,3000,3500,4000,4600,5200,5700,6300],
  18:[1400,1800,2200,2700,3300,3900,4600,5400,6300,7200,8100,8900,9700]};
// écarts fondamentaux des ARBRES par plage intermédiaire (25 plages) :
// a … g → es (négatif) ; k … zc → ei (positif) ; null = lettre non définie dans la plage
const ISO286_SHAFT=(function(){
  const N=null,r=function(a){return a;},e13=function(a){ // 13 plages principales → 25
    const o=[];ISO286_SUB.forEach(function(b){o.push(a[ISO286_MAIN.findIndex(function(m){return b<=m;})]);});return o;};
  return {
    a:r([-270,-270,-280,-290,-290,-300,-300,-310,-320,-340,-360,-380,-410,-460,-520,-580,-660,-740,-820,-920,-1050,-1200,-1350,-1500,-1650]),
    b:r([-140,-140,-150,-150,-150,-160,-160,-170,-180,-190,-200,-220,-240,-260,-280,-310,-340,-380,-420,-480,-540,-600,-680,-760,-840]),
    c:r([-60,-70,-80,-95,-95,-110,-110,-120,-130,-140,-150,-170,-180,-200,-210,-230,-240,-260,-280,-300,-330,-360,-400,-440,-480]),
    cd:[-34,-46,-56].concat(Array(22).fill(N)),
    d:e13([-20,-30,-40,-50,-65,-80,-100,-120,-145,-170,-190,-210,-230]),
    e:e13([-14,-20,-25,-32,-40,-50,-60,-72,-85,-100,-110,-125,-135]),
    ef:[-10,-14,-18].concat(Array(22).fill(N)),
    f:e13([-6,-10,-13,-16,-20,-25,-30,-36,-43,-50,-56,-62,-68]),
    fg:[-4,-6,-8].concat(Array(22).fill(N)),
    g:e13([-2,-4,-5,-6,-7,-9,-10,-12,-14,-15,-17,-18,-20]),
    h:Array(25).fill(0),
    k:e13([0,1,1,1,2,2,2,3,3,4,4,4,5]), // IT4 … IT7 ; 0 au-delà (et ≤ IT3)
    m:e13([2,4,6,7,8,9,11,13,15,17,20,21,23]),
    n:e13([4,8,10,12,15,17,20,23,27,31,34,37,40]),
    p:e13([6,12,15,18,22,26,32,37,43,50,56,62,68]),
    r:r([10,15,19,23,23,28,28,34,34,41,43,51,54,63,65,68,77,80,84,94,98,108,114,126,132]),
    s:r([14,19,23,28,28,35,35,43,43,53,59,71,79,92,100,108,122,130,140,158,170,190,208,232,252]),
    t:r([N,N,N,N,N,N,41,48,54,66,75,91,104,122,134,146,166,180,196,218,240,268,294,330,360]),
    u:r([18,23,28,33,33,41,48,60,70,87,102,124,144,170,190,210,236,258,284,315,350,390,435,490,540]),
    v:r([N,N,N,N,39,47,55,68,81,102,120,146,172,202,228,252,284,310,340,385,425,475,530,595,660]),
    x:r([20,28,34,40,45,54,64,80,97,122,146,178,210,248,280,310,350,385,425,475,525,590,660,740,820]),
    y:r([N,N,N,N,N,63,75,94,114,144,174,214,254,300,340,380,425,470,520,580,650,730,820,920,1000]),
    z:r([26,35,42,50,60,73,88,112,136,172,210,258,310,365,415,465,520,575,640,710,790,900,1000,1100,1250]),
    za:r([32,42,52,64,77,98,118,148,180,226,274,335,400,470,535,600,670,740,820,920,1000,1150,1300,1450,1600]),
    zb:r([40,50,67,90,108,136,160,200,242,300,360,445,525,620,700,780,880,960,1050,1200,1300,1500,1650,1850,2100]),
    zc:r([60,80,97,130,150,188,218,274,325,405,480,585,690,800,900,1000,1150,1250,1350,1550,1700,1900,2100,2400,2600])};
})();
// j (arbre, ei) et J (alésage, ES) : valeurs tabulées par qualité (13 plages principales)
const ISO286_J={j5:[-2,-2,-2,-3,-4,-5,-7,-9,-11,-13,-16,-18,-20],j6:[-2,-2,-2,-3,-4,-5,-7,-9,-11,-13,-16,-18,-20],
  j7:[-4,-4,-5,-6,-8,-10,-12,-15,-18,-21,-26,-28,-32],
  J6:[2,5,5,6,8,10,13,16,18,22,25,29,33],J7:[4,6,8,10,12,14,18,22,26,30,36,39,43],J8:[6,10,12,15,20,24,28,34,41,47,55,60,66]};
// Δ = IT(n) − IT(n−1) des alésages K … ZC (qualités 3 à 8)
const ISO286_DELTA={3:[0,1,1,1,1.5,1.5,2,2,3,3,4,4,5],4:[0,1.5,1.5,2,2,3,3,4,4,4,4,5,5],5:[0,1,2,3,3,4,5,5,6,6,7,7,7],
  6:[0,3,3,3,4,5,6,7,7,9,9,11,13],7:[0,4,6,7,8,9,11,13,15,17,20,21,23],8:[0,6,7,9,12,14,16,19,23,26,29,32,34]};
// qualités ISO 286-2 proposées par lettre (minuscule = arbre) ; H/h, JS/js : IT01 … IT18
const ISO286_GRADES=(function(){
  const rg=function(a,b){const o=[];for(let i=a;i<=b;i++)o.push(String(i));return o;};
  const all=['01','0'].concat(rg(1,18));
  return {A:rg(9,13),B:rg(8,13),C:rg(8,13),CD:rg(6,10),D:rg(6,13),E:rg(5,10),EF:rg(3,10),F:rg(3,10),FG:rg(3,10),G:rg(3,10),
    H:all,JS:all,J:rg(6,8),K:rg(3,10),M:rg(3,10),N:rg(3,11),P:rg(3,10),R:rg(3,10),S:rg(3,10),T:rg(5,8),U:rg(5,10),V:rg(5,8),
    X:rg(5,10),Y:rg(6,10),Z:rg(6,11),ZA:rg(6,11),ZB:rg(7,11),ZC:rg(7,11),
    a:rg(9,13),b:rg(8,13),c:rg(8,13),cd:rg(5,10),d:rg(5,13),e:rg(5,10),ef:rg(3,10),f:rg(3,10),fg:rg(3,10),g:rg(3,10),
    h:all,js:all,j:rg(5,7),k:rg(3,13),m:rg(3,9),n:rg(3,9),p:rg(3,10),r:rg(3,10),s:rg(3,10),t:rg(5,8),u:rg(5,9),v:rg(5,8),
    x:rg(5,10),y:rg(6,10),z:rg(6,11),za:rg(6,11),zb:rg(7,11),zc:rg(7,11)};
})();
const ISO286_HOLE_LETTERS=['A','B','C','CD','D','E','EF','F','FG','G','H','JS','J','K','M','N','P','R','S','T','U','V','X','Y','Z','ZA','ZB','ZC'];
const ISO286_SHAFT_LETTERS=ISO286_HOLE_LETTERS.map(function(L){return L.toLowerCase();});
const ISO286_UPPER=['a','b','c','cd','d','e','ef','f','fg','g'];
function iso286Idx(bounds,d){for(let i=0;i<bounds.length;i++)if(d<=bounds[i]+1e-9)return i;return -1;}
function iso286IT(g,d){const a=ISO286_IT[g];const i=iso286Idx(ISO286_MAIN,d);return (a&&i>=0)?a[i]:null;}
function iso286Parse(cls){
  const m=/^([A-Za-z]{1,2})(01|0|[1-9]|1[0-8])$/.exec(String(cls||'').trim());
  if(!m)return null;
  const L=m[1],up=L.toUpperCase();
  if(L!==up&&L!==L.toLowerCase())return null; // « Js » : casse mêlée refusée
  if(ISO286_HOLE_LETTERS.indexOf(up)<0)return null;
  return {L:L,g:m[2],hole:L===up};
}
// écarts {lo,hi} en µm d'une classe pour un Ø nominal (0 < Ø ≤ 500), ou null
function iso286DevUm(cls,nom){
  const P=iso286Parse(cls);const d=Math.abs(+nom);
  if(!P||!(d>0)||d>500)return null;
  const IT=iso286IT(P.g,d);if(IT==null)return null;
  const im=iso286Idx(ISO286_MAIN,d),is=iso286Idx(ISO286_SUB,d),gN=+P.g,l=P.L.toLowerCase();
  if(l==='h')return P.hole?{lo:0,hi:IT}:{lo:-IT,hi:0};
  if(l==='js')return {lo:-IT/2,hi:IT/2};
  if(l==='j'){
    const t=ISO286_J[P.L+P.g];if(!t)return null;
    return P.hole?{lo:t[im]-IT,hi:t[im]}:{lo:t[im],hi:t[im]+IT};
  }
  const sv=ISO286_SHAFT[l]?ISO286_SHAFT[l][is]:null;if(sv==null)return null;
  let ei=sv;
  if(l==='k')ei=(gN>=4&&gN<=7)?sv:0;
  const upper=ISO286_UPPER.indexOf(l)>=0; // a … g : écart supérieur es (A … G : EI = −es)
  if(!P.hole){
    if(upper)return {lo:sv-IT,hi:sv};
    return {lo:ei,hi:ei+IT};
  }
  if(upper)return {lo:-sv,hi:-sv+IT};
  const D=(gN>=3&&gN<=8)?ISO286_DELTA[gN][im]:0;
  let ES;
  if(l==='k')ES=(d<=3)?0:(gN<=8?-ISO286_SHAFT.k[is]+D:0);
  else if(l==='m'){ES=(d<=3)?-2:(gN<=8?-sv+D:-sv);if(gN===6&&d>250&&d<=315)ES=-9;}
  else if(l==='n')ES=(d<=3)?-4:(gN<=8?-sv+D:0);
  else ES=-sv+(gN<=7?D:0); // P … ZC
  return {lo:ES-IT,hi:ES};
}
// même chose en mm : {lo,hi}
function iso286Range(cls,nom){const r=iso286DevUm(cls,nom);return r?{lo:+(r.lo/1000).toFixed(4),hi:+(r.hi/1000).toFixed(4)}:null;}
function iso286Grades(L){return (ISO286_GRADES[L]||[]).slice();}
// toutes les classes d'un type (alésage : majuscules ; arbre : minuscules), dans l'ordre des tables
function iso286Classes(hole){
  const o=[];(hole?ISO286_HOLE_LETTERS:ISO286_SHAFT_LETTERS).forEach(function(L){iso286Grades(L).forEach(function(g){o.push(L+g);});});
  return o;
}
// « H7 (+0,012 / 0) » : écarts en mm, virgule française
function iso286Label(cls,nom){
  const r=iso286Range(cls,nom);if(!r)return String(cls||'');
  const f=function(v){if(Math.abs(v)<1e-9)return '0';return (v>0?'+':'−')+String(+Math.abs(v).toFixed(4)).replace('.',',');};
  return cls+' ('+f(r.hi)+' / '+f(r.lo)+')';
}
