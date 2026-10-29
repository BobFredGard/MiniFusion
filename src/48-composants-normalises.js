/* ---------- composants normalisés : vis, bouchons, goupilles, clavettes (V0.21.0) ----------
   Fenêtre « Normalisés » du groupe Composants : on choisit une norme, une taille, un pas, une
   longueur, et la pièce arrive comme un COMPOSANT du composant actif (comme « Insérer »),
   modélisée par de vraies fonctions, rejouées par le noyau comme celles d'une pièce dessinée :
     · révolution d'un profil (r, z) du plan XZ autour de Z — arcs permis (bouts bombés) ;
     · six pans creux : découpe d'un hexagone (plan XY) depuis le dessus ;
     · fente d'une goupille élastique, contour d'une clavette : esquisse XY + extrusion.
   Le filet n'est pas modélisé (comme le filet cosmétique d'un perçage) : la désignation le
   porte (M8×1, 1/4-28 UNF, G 1/2…) et doc.std la garde (nomenclature, réemploi).
   Repères : vis CHC et bouchon à collerette — origine sous la tête (face d'appui), tige vers
   −Z ; vis FHC et bouchon conique — origine sur le dessus (affleurant), pièce vers −Z ;
   goupille — de z = 0 à z = L ; clavette — posée sur XY, centrée, hauteur vers +Z.
   « Aligner » sur une face de la pièce receveuse pose donc directement la vis.
   Une pièce déjà présente (même désignation) reçoit une nouvelle OCCURRENCE plutôt qu'un
   second composant identique.
   « Sur des trous » (comme l'insertion de visserie de Fusion 360) : on clique UN trou d'une pièce,
   tous les trous IDENTIQUES de cette pièce (même empilement de cylindres : simple, lamé, fraisé,
   même profondeur, même sens) reçoivent chacun une occurrence, tenue par une LIAISON RIGIDE
   (alignement sur le centre du cercle de la face d'assise : associatif, la vis suit le trou).
   Assise (sp.seat) : 'under' sous tête (CHC, collerette) — fond du lamage, sinon l'entrée ;
   'flush' affleurant (bouchon conique) — l'entrée ; FHC — l'entrée, 0,2 mm dessous (sp.sink,
   FHC_RETRAIT du perçage) ; 'mid' (goupille, origine en son milieu) — milieu de l'axe du trou. Cotes en mm ; les normes en pouces sont converties (STD_IN). */
const STD_IN=25.4;
// ISO 261 : pas gros (la désignation « M » seule) puis pas fins
const STD_ISO_PAS={'M1.6':[0.35,0.2],'M2':[0.4,0.25],'M2.5':[0.45,0.35],'M3':[0.5,0.35],'M4':[0.7,0.5],'M5':[0.8,0.5],
  'M6':[1,0.75],'M8':[1.25,1,0.75],'M10':[1.5,1.25,1,0.75],'M12':[1.75,1.5,1.25,1],'M14':[2,1.5,1.25,1],'M16':[2,1.5,1],
  'M20':[2.5,2,1.5,1],'M24':[3,2,1.5,1],'M30':[3.5,3,2,1.5,1],'M36':[4,3,2,1.5]};
// ISO 4762 (CHC) : [taille, d, dk, k, s (clé), t (prise de clé), Lmin, Lmax]
const STD_ISO4762=[['M1.6',1.6,3,1.6,1.5,0.7,2.5,16],['M2',2,3.8,2,1.5,1,3,20],['M2.5',2.5,4.5,2.5,2,1.1,4,25],
  ['M3',3,5.5,3,2.5,1.3,5,30],['M4',4,7,4,3,2,6,40],['M5',5,8.5,5,4,2.5,8,50],['M6',6,10,6,5,3,10,60],
  ['M8',8,13,8,6,4,12,80],['M10',10,16,10,8,5,16,100],['M12',12,18,12,10,6,20,120],['M14',14,21,14,12,7,25,140],
  ['M16',16,24,16,14,8,25,160],['M20',20,30,20,17,10,30,200],['M24',24,36,24,19,12,40,200],
  ['M30',30,45,30,22,15.5,45,200],['M36',36,54,36,27,19,55,200]];
// ISO 10642 (FHC, fraisure 90°) : [taille, d, dk théorique, k, s, t, Lmin, Lmax]
const STD_ISO10642=[['M3',3,6.72,1.86,2,1.1,8,30],['M4',4,8.96,2.48,2.5,1.5,8,40],['M5',5,11.2,3.1,3,1.9,8,50],
  ['M6',6,13.44,3.72,4,2.2,8,60],['M8',8,17.92,4.96,5,3,10,80],['M10',10,22.4,6.2,6,3.6,12,100],
  ['M12',12,26.88,7.44,8,4.3,20,100],['M16',16,33.6,8.8,10,4.8,30,100],['M20',20,40.32,10.16,12,5.6,35,100]];
const STD_ISO_LV=[2.5,3,4,5,6,8,10,12,16,20,25,30,35,40,45,50,55,60,65,70,80,90,100,110,120,130,140,150,160,180,200];
// ASME B18.3 CHC (pouces) : [taille, D, A (Ø tête), H, J (clé), T, filets/pouce UNC (0 : aucun), UNF, Lmin, Lmax]
const STD_ANSI_SHCS=[['#0',.06,.096,.06,.05,.025,0,80,'1/8','1/2'],['#1',.073,.118,.073,1/16,.031,64,72,'1/8','5/8'],
  ['#2',.086,.14,.086,5/64,.038,56,64,'1/8','3/4'],['#3',.099,.161,.099,5/64,.044,48,56,'1/8','1'],
  ['#4',.112,.183,.112,3/32,.051,40,48,'1/8','1'],['#5',.125,.205,.125,3/32,.057,40,44,'1/8','1'],
  ['#6',.138,.226,.138,7/64,.064,32,40,'1/8','1-1/2'],['#8',.164,.27,.164,9/64,.077,32,36,'1/4','2'],
  ['#10',.19,.312,.19,5/32,.09,24,32,'1/4','2-1/2'],['1/4',.25,.375,.25,3/16,.12,20,28,'1/4','4'],
  ['5/16',.3125,.469,.3125,1/4,.151,18,24,'3/8','4'],['3/8',.375,.562,.375,5/16,.182,16,24,'3/8','5'],
  ['7/16',.4375,.656,.4375,3/8,.213,14,20,'1/2','5'],['1/2',.5,.75,.5,3/8,.245,13,20,'1/2','6'],
  ['5/8',.625,.938,.625,1/2,.307,11,18,'3/4','6'],['3/4',.75,1.125,.75,5/8,.37,10,16,'1','6'],
  ['7/8',.875,1.312,.875,3/4,.432,9,14,'1-1/4','6'],['1',1,1.5,1,3/4,.495,8,12,'1-1/2','6']];
// ASME B18.3 FHC (fraisure 82°) : [taille, D, A théorique, J, T, Lmin, Lmax] — filets : table CHC
const STD_ANSI_FHCS=[['#2',.086,.197,.05,.038,'1/8','3/4'],['#3',.099,.226,1/16,.044,'1/8','1'],
  ['#4',.112,.255,1/16,.055,'1/8','1'],['#5',.125,.281,5/64,.061,'1/8','1'],['#6',.138,.307,5/64,.066,'1/8','1-1/2'],
  ['#8',.164,.359,3/32,.076,'1/4','2'],['#10',.19,.411,1/8,.087,'1/4','2'],['1/4',.25,.531,5/32,.111,'3/8','3'],
  ['5/16',.3125,.656,3/16,.135,'1/2','3'],['3/8',.375,.781,7/32,.159,'1/2','3'],['7/16',.4375,.844,1/4,.159,'5/8','3'],
  ['1/2',.5,.938,5/16,.172,'5/8','4'],['5/8',.625,1.188,3/8,.22,'1','4'],['3/4',.75,1.438,1/2,.265,'1','4']];
const STD_INCH_LV=['1/8','3/16','1/4','5/16','3/8','7/16','1/2','5/8','3/4','7/8','1','1-1/4','1-1/2','1-3/4','2',
  '2-1/4','2-1/2','2-3/4','3','3-1/4','3-1/2','3-3/4','4','4-1/2','5','5-1/2','6'];
// Bouchons six pans creux. DIN 906 (conique R, 1:16) : [taille, Ø de jauge, filets/pouce, L, s, t]
const STD_DIN906=[['R 1/8',9.728,28,8,5,4],['R 1/4',13.157,19,10,7,5],['R 3/8',16.662,19,10,8,5],['R 1/2',20.955,14,10,10,5],
  ['R 3/4',26.441,14,12,12,6],['R 1',33.249,11,12,17,6],['R 1-1/4',41.91,11,18,22,11.5],['R 1-1/2',47.803,11,20,24,11.5]];
// DIN 908 (cylindrique G, à collerette) : [taille, d, filets/pouce, dk, k, i (filetée), s, t]
const STD_DIN908=[['G 1/8',9.728,28,14,3,8,5,5],['G 1/4',13.157,19,18,3,12,6,7],['G 3/8',16.662,19,22,3,12,8,7.5],
  ['G 1/2',20.955,14,26,4,14,10,7.5],['G 3/4',26.441,14,32,4,16,12,9],['G 1',33.249,11,39,5,16,17,9],
  ['G 1-1/4',41.91,11,49,5,16,22,10.5],['G 1-1/2',47.803,11,52,5,16,24,10.5],['G 2',59.614,11,68,5,20,32,14]];
// NPTF (Dryseal, conicité 3/4" au pied) : [taille, Ø extérieur, filets/pouce, clé, L] en pouces — catalogue
const STD_NPTF=[['1/16',.3125,27,5/32,.31],['1/8',.405,27,3/16,.31],['1/4',.54,18,1/4,.44],['3/8',.675,18,5/16,.44],
  ['1/2',.84,14,3/8,.56],['3/4',1.05,14,9/16,.56],['1',1.315,11.5,5/8,.69],['1-1/4',1.66,11.5,3/4,.69],
  ['1-1/2',1.9,11.5,3/4,.69],['2',2.375,11.5,1,.69]];
// Goupilles ISO : [d, Lmin, Lmax] ; chanfrein c par Ø
const STD_PIN_C={1:.2,1.5:.3,2:.35,2.5:.4,3:.5,4:.63,5:.8,6:1.2,8:1.6,10:2,12:2.5,13:2.5,14:2.5,16:3,18:3,20:3.5};
const STD_ISO2338=[[1,4,10],[1.5,4,16],[2,6,20],[2.5,6,24],[3,8,30],[4,8,40],[5,10,50],[6,12,60],[8,14,80],[10,18,95],[12,22,140],[16,26,180],[20,35,200]];
const STD_ISO8734=[[1,3,10],[1.5,4,16],[2,5,20],[2.5,6,24],[3,8,30],[4,10,40],[5,12,50],[6,14,60],[8,18,80],[10,22,100],[12,26,100],[16,40,100],[20,50,100]];
const STD_ISO2339=[[1,6,10],[1.5,8,24],[2,10,35],[2.5,10,35],[3,12,45],[4,14,55],[5,18,60],[6,22,90],[8,22,120],[10,26,160],[12,32,180],[16,40,200],[20,45,200]];
// ISO 8752 (élastique, série épaisse) : [d, épaisseur s, Lmin, Lmax]
const STD_ISO8752=[[1,.2,4,20],[1.5,.3,4,20],[2,.4,4,30],[2.5,.5,4,30],[3,.6,4,40],[4,.8,4,50],[5,1,5,80],[6,1.2,10,100],
  [8,1.5,10,120],[10,2,10,160],[12,2.5,10,180],[13,2.5,10,180],[14,3,10,200],[16,3,10,200],[18,3.5,10,200],[20,4,10,200]];
const STD_PIN_LV=[3,4,5,6,8,10,12,14,16,18,20,22,24,26,28,30,32,35,40,45,50,55,60,65,70,75,80,85,90,95,100,120,140,160,180,200];
// ASME B18.8.2 : goupilles rectifiées trempées [Ø, Lmin, Lmax] ; élastiques fendues [Ø, épaisseur (po), Lmin, Lmax]
const STD_ANSI_DOWEL=[['1/16','3/16','1'],['3/32','3/16','1-1/4'],['1/8','1/4','2'],['5/32','3/8','2'],['3/16','3/8','2-1/2'],
  ['1/4','1/2','3'],['5/16','1/2','3'],['3/8','1/2','4'],['7/16','3/4','4'],['1/2','3/4','5'],['5/8','1','6'],['3/4','1','6'],
  ['7/8','1-1/2','6'],['1','1-1/2','6']];
const STD_ANSI_SPRING=[['1/16',.012,'1/8','1'],['5/64',.018,'1/8','1'],['3/32',.022,'3/16','1-1/2'],['1/8',.028,'1/4','2'],
  ['5/32',.032,'1/4','2-1/2'],['3/16',.04,'5/16','3'],['7/32',.048,'3/8','3'],['1/4',.062,'3/8','4'],['5/16',.062,'1/2','4'],
  ['3/8',.077,'1/2','4'],['7/16',.077,'3/4','4'],['1/2',.094,'3/4','4']];
// ISO 773 (clavettes parallèles, ≈ DIN 6885 A) : [arbre de, à, b, h, t1 (arbre), t2 (moyeu), Lmin, Lmax]
const STD_ISO773=[[6,8,2,2,1.2,1,6,20],[8,10,3,3,1.8,1.4,6,36],[10,12,4,4,2.5,1.8,8,45],[12,17,5,5,3,2.3,10,56],
  [17,22,6,6,3.5,2.8,14,70],[22,30,8,7,4,3.3,18,90],[30,38,10,8,5,3.3,22,110],[38,44,12,8,5,3.3,28,140],
  [44,50,14,9,5.5,3.8,36,160],[50,58,16,10,6,4.3,45,180],[58,65,18,11,7,4.4,50,200],[65,75,20,12,7.5,4.9,56,220],
  [75,85,22,14,9,5.4,63,250],[85,95,25,14,9,5.4,70,280],[95,110,28,16,10,6.4,80,320],[110,130,32,18,11,7.4,90,360]];
const STD_KEY_LV=[6,8,10,12,14,16,18,20,22,25,28,32,36,40,45,50,56,63,70,80,90,100,110,125,140,160,180,200,220,250,280,320,360];
/* ── outils ── */
function stdFrac(s){
  // '1-1/4' → 1.25 ; '3/8' → 0.375 ; '2' → 2
  const m=/^(?:(\d+)-)?(\d+)\/(\d+)$/.exec(String(s));
  if(m)return (m[1]?+m[1]:0)+(+m[2])/(+m[3]);
  return +s;
}
function stdF(v){return String(+(+v).toFixed(3)).replace('.',',');}
function stdHex(s){
  // hexagone de côtés s (sur plats), sommets sur X
  const R=s/Math.sqrt(3),o=[];
  for(let i=0;i<6;i++){const a=i*Math.PI/3;o.push([R*Math.cos(a),R*Math.sin(a)]);}
  return o;
}
function stdLens(lv,a,b,num){
  // longueurs de la série comprises entre a et b (numériques ou fractions)
  const v=num?x=>x:stdFrac,A=v(a),B=v(b);
  return lv.filter(x=>v(x)>=A-1e-9&&v(x)<=B+1e-9);
}
function stdCrown(r,R,z0,up){
  // bout bombé (sphère de rayon R sur l'axe) : du bord (r, z0∓h) au sommet (0, z0)
  const h=R-Math.sqrt(Math.max(0,R*R-r*r)),zc=up?z0-R:z0+R;
  return {edge:[r,up?z0-h:z0+h],top:[0,z0,{c:[0,zc]}],h};
}
/* ── pièces : chaque générateur rend une description {key, name, norm, desig, info, prof?, ops} ──
   prof : profil de révolution [[r,z(,{c})]…] ; ops : [{k:'hex', z, s, t} | {k:'slot', …} | {k:'key', …}] */
function stdScrewCHC(o){
  // o = {d, dk, k, s, t, L, P} en mm
  const c=Math.min(o.P,o.d*0.15),ch=Math.max(0.1,o.dk*0.04);
  return {prof:[[0,-o.L],[o.d/2-c,-o.L],[o.d/2,-o.L+c],[o.d/2,0],[o.dk/2,0],[o.dk/2,o.k-ch],[o.dk/2-ch,o.k],[0,o.k]],
    ops:[{k:'hex',z:o.k,s:o.s,t:o.t}]};
}
function stdScrewFHC(o){
  // o = {d, dk (théorique), k, a (angle de fraisure), s, t, L, P} — tête affleurante en z = 0
  const c=Math.min(o.P,o.d*0.15),dr=o.dk*0.97,tg=Math.tan(o.a/2*Math.PI/180);
  const zb=-o.k,ze=zb+(dr-o.d)/2/tg; // le cône atteint dr un peu sous le dessus : petit méplat cylindrique
  return {prof:[[0,-o.L],[o.d/2-c,-o.L],[o.d/2,-o.L+c],[o.d/2,zb],[dr/2,Math.min(ze,-0.05)],[dr/2,0],[0,0]],
    ops:[{k:'hex',z:0,s:o.s,t:o.t}]};
}
function stdIsoScrew(st){
  const fhc=st.type==='fhc',T=fhc?STD_ISO10642:STD_ISO4762,r=T.find(x=>x[0]===st.size)||T[0];
  const pas=STD_ISO_PAS[r[0]],P=+st.pitch||pas[0],L=+st.len,fin=Math.abs(P-pas[0])>1e-9;
  const g=fhc?stdScrewFHC({d:r[1],dk:r[2],k:r[3],a:90,s:r[4],t:r[5],L,P}):stdScrewCHC({d:r[1],dk:r[2],k:r[3],s:r[4],t:r[5],L,P});
  const th=r[0]+(fin?'×'+stdF(P):''),norm=fhc?'ISO 10642':'ISO 4762';
  return Object.assign(g,{seat:fhc?'flush':'under',sink:fhc?FHC_RETRAIT:0,key:norm+'|'+th+'|'+L,norm,desig:th+'×'+stdF(L),name:(fhc?'FHC ':'CHC ')+th+'×'+stdF(L),
    info:(fhc?'Vis à tête fraisée six pans creux, fraisure 90°':'Vis à tête cylindrique six pans creux')+' · pas '+stdF(P)+(fin?' (fin)':' (gros)')+
      ' · '+(fhc?'Ø tête ':'dk ')+stdF(r[2])+' · k '+stdF(r[3])+' · clé '+stdF(r[4])+' · L '+stdF(L)+(fhc?' (tête comprise)':' (sous tête)')});
}
function stdAnsiScrew(st){
  const fhc=st.type==='fhc',T=fhc?STD_ANSI_FHCS:STD_ANSI_SHCS,r=T.find(x=>x[0]===st.size)||T[0];
  const s3=STD_ANSI_SHCS.find(x=>x[0]===r[0]),serie=st.thr==='UNF'||!s3[6]?'UNF':'UNC',tpi=serie==='UNF'?s3[7]:s3[6];
  const L=stdFrac(st.len),I=STD_IN,P=I/tpi;
  const g=fhc?stdScrewFHC({d:r[1]*I,dk:r[2]*I,k:(r[2]-r[1])/2/Math.tan(41*Math.PI/180)*I,a:82,s:r[3]*I,t:r[4]*I,L:L*I,P})
    :stdScrewCHC({d:r[1]*I,dk:r[2]*I,k:r[3]*I,s:r[4]*I,t:r[5]*I,L:L*I,P});
  const th=r[0]+'-'+tpi+' '+serie,norm=fhc?'ASME B18.3 FHCS':'ASME B18.3 SHCS';
  return Object.assign(g,{seat:fhc?'flush':'under',sink:fhc?FHC_RETRAIT:0,key:norm+'|'+th+'|'+st.len,norm,desig:th+' × '+st.len+'"',name:(fhc?'FHCS ':'SHCS ')+th+' × '+st.len+'"',
    info:(fhc?'Flat head socket cap screw, fraisure 82°':'Socket head cap screw')+' · '+tpi+' filets/pouce · Ø '+stdF(r[1]*I)+' mm · L '+stdF(L*I)+' mm'+(fhc?' (tête comprise)':' (sous tête)')});
}
function stdPlug(st){
  if(st.type==='din908'){
    const r=STD_DIN908.find(x=>x[0]===st.size)||STD_DIN908[0],[,d,tpi,dk,k,i,s,t]=r,c=Math.min(STD_IN/tpi,1.5),ch=0.4;
    return {seat:'under',key:'DIN 908|'+r[0],norm:'DIN 908',desig:r[0]+' A',name:'Bouchon DIN 908 '+r[0],
      info:'Bouchon à collerette, six pans creux, filet cylindrique '+r[0]+' (ISO 228) · Ø collerette '+stdF(dk)+' · k '+stdF(k)+' · filetée '+stdF(i)+' · clé '+stdF(s),
      prof:[[0,-i],[d/2-c,-i],[d/2,-i+c],[d/2,0],[dk/2,0],[dk/2,k-ch],[dk/2-ch,k],[0,k]],ops:[{k:'hex',z:k,s,t}]};
  }
  const npt=st.type==='nptf',r=npt?(STD_NPTF.find(x=>x[0]===st.size)||STD_NPTF[0]):(STD_DIN906.find(x=>x[0]===st.size)||STD_DIN906[0]);
  const I=STD_IN,D=npt?r[1]*I:r[1],tpi=r[2],s=npt?r[3]*I:r[4],L=npt?r[4]*I:r[3],t=npt?L*0.6:r[5];
  const rt=D/2,rb=rt-L/32,c=Math.min(I/tpi*0.6,L*0.12); // conicité 1:16 sur le Ø
  const nm=npt?r[0]+'-'+tpi+' NPTF':r[0];
  return {seat:'flush',key:(npt?'NPTF':'DIN 906')+'|'+r[0],norm:npt?'ASME B1.20.3 NPTF':'DIN 906',desig:nm,name:'Bouchon '+(npt?nm:'DIN 906 '+nm),
    info:'Bouchon conique six pans creux, sans collerette'+(npt?' (Dryseal, conicité 1:16, dimensions de catalogue)':' (ISO 7-1, conicité 1:16)')+' · Ø '+stdF(D)+' · L '+stdF(L)+' · clé '+stdF(s),
    prof:[[0,-L],[rb-c,-L],[rb,-L+c],[rt,0],[0,0]],ops:[{k:'hex',z:0,s,t}]};
}
function stdPin(st){
  // Goupille centrée : origine au MILIEU de sa longueur (V0.21.1) — posée sur un trou, elle
  // s'aligne sur le milieu de l'axe du cylindre (seat 'mid')
  const sp=stdPinBody(st),zs=stdPolyPts(sp.prof).map(p=>p[1]),dz=-(Math.min(...zs)+Math.max(...zs))/2;
  sp.prof=sp.prof.map(q=>{const o=[q[0],q[1]+dz];if(q[2])o.push(Object.assign({},q[2],{c:[q[2].c[0],q[2].c[1]+dz]}));return o;});
  (sp.ops||[]).forEach(o=>{if(o.k==='slot')o.z0=dz;});
  sp.seat='mid';
  return sp;
}
function stdPinBody(st){
  // profil de z = 0 à z = L
  const ty=st.type,ansi=ty==='dowel'||ty==='spring';
  const d=ansi?stdFrac(st.size)*STD_IN:+st.size,L=ansi?stdFrac(st.len)*STD_IN:+st.len,r=d/2;
  const c=ansi?Math.max(0.15,d*0.08):(STD_PIN_C[+st.size]||d*0.15);
  const lab=ansi?st.size+'" × '+st.len+'"':stdF(d)+'×'+stdF(L);
  if(ty==='iso8752'||ty==='spring'){
    const w=ty==='spring'?(STD_ANSI_SPRING.find(x=>x[0]===st.size)||STD_ANSI_SPRING[0])[1]*STD_IN:(STD_ISO8752.find(x=>x[0]===+st.size)||STD_ISO8752[0])[1];
    const ri=r-w,cc=Math.min(w*0.8,c),g=Math.max(0.15,d*0.1);
    const norm=ty==='spring'?'ASME B18.8.2 spring':'ISO 8752';
    return {key:norm+'|'+lab,norm,desig:lab,name:(ty==='spring'?'Spring pin ':'Goupille élastique ISO 8752 ')+lab,
      info:'Goupille élastique fendue · épaisseur '+stdF(w)+' · fente '+stdF(g)+' · Ø '+stdF(d)+' · L '+stdF(L),
      prof:[[ri,0],[r-cc,0],[r,cc],[r,L-cc],[r-cc,L],[ri,L]],ops:[{k:'slot',x0:ri-0.3,x1:r+1,w:g,L}]};
  }
  if(ty==='iso2339'){
    // conique 1:50 : d au petit bout, bouts bombés (R ≈ d)
    const R2=r+L/100,a=stdCrown(r,d,0,false),b=stdCrown(R2,2*R2,L,true);
    return {key:'ISO 2339|'+lab,norm:'ISO 2339',desig:'A '+lab,name:'Goupille conique ISO 2339 '+lab,
      info:'Goupille conique 1:50 · Ø petit bout '+stdF(d)+' · Ø gros bout '+stdF(2*R2)+' · L '+stdF(L),
      prof:[[0,0],a.edge.concat([{c:[0,d]}]),b.edge,b.top],ops:[]};
  }
  if(ty==='iso8734'||ty==='dowel'){
    // trempée : un bout chanfreiné, l'autre bombé
    const b=stdCrown(r,d,L,true);
    const norm=ty==='dowel'?'ASME B18.8.2 dowel':'ISO 8734';
    return {key:norm+'|'+lab,norm,desig:lab,name:(ty==='dowel'?'Dowel pin ':'Goupille ISO 8734 ')+lab,
      info:'Goupille cylindrique trempée, rectifiée (m6) · un bout chanfreiné, un bout bombé · Ø '+stdF(d)+' · L '+stdF(L),
      prof:[[0,0],[r-c,0],[r,c],b.edge,b.top],ops:[]};
  }
  return {key:'ISO 2338|'+lab,norm:'ISO 2338',desig:'m6 '+lab,name:'Goupille ISO 2338 '+lab,
    info:'Goupille cylindrique non trempée (m6) · chanfreins '+stdF(c)+' · Ø '+stdF(d)+' · L '+stdF(L),
    prof:[[0,0],[r-c,0],[r,c],[r,L-c],[r-c,L],[0,L]],ops:[]};
}
function stdKey(st){
  const r=STD_ISO773.find(x=>x[2]+'x'+x[3]===st.size)||STD_ISO773[0],b=r[2],h=r[3],L=+st.len,f=st.type||'A';
  const lab=b+'×'+h+'×'+stdF(L);
  return {key:'ISO 773|'+f+'|'+lab,norm:'ISO 773',desig:f+' '+lab,name:'Clavette '+f+' '+lab,
    info:'Clavette parallèle forme '+f+(f==='A'?' (bouts ronds)':f==='B'?' (bouts droits)':' (un bout rond)')+' · arbre Ø '+r[0]+' à '+r[1]+
      ' · rainure arbre t1 '+stdF(r[4])+' · moyeu t2 '+stdF(r[5]),
    ops:[{k:'key',form:f,b,h,L}]};
}
function stdKeyOutline(o){
  // contour vu de dessus, centré : forme A (deux bouts ronds), B (droits), C (rond à gauche)
  const hl=o.L/2,r=o.b/2,x0=-hl+r,x1=hl-r;
  if(o.form==='B')return [[-hl,-r],[hl,-r],[hl,r],[-hl,r]];
  if(o.form==='C')return [[x0,-r,{c:[x0,0],ccw:true}],[hl,-r],[hl,r],[x0,r]];
  return [[x0,-r,{c:[x0,0],ccw:true}],[x1,-r],[x1,r,{c:[x1,0],ccw:true}],[x0,r]];
}
/* ── catégories de la fenêtre : champs (options selon l'état) et générateur ── */
const STD_CATS=[
  {k:'iso',lab:'Vis ISO',fields:[
    {k:'type',lab:'Type',opts:()=>[['chc','CHC — ISO 4762 (tête cylindrique)'],['fhc','FHC — ISO 10642 (tête fraisée 90°)']]},
    {k:'size',lab:'Taille',opts:st=>(st.type==='fhc'?STD_ISO10642:STD_ISO4762).map(r=>[r[0],r[0]]),def:()=>'M6'},
    {k:'pitch',lab:'Pas',opts:st=>(STD_ISO_PAS[st.size]||[1]).map((p,i)=>[String(p),stdF(p)+(i?' — fin':' — gros (M)')])},
    {k:'len',lab:'Longueur (mm)',opts:st=>{const r=(st.type==='fhc'?STD_ISO10642:STD_ISO4762).find(x=>x[0]===st.size);
      return r?stdLens(STD_ISO_LV,r[6],r[7],true).map(v=>[String(v),stdF(v)]):[];},def:st=>{const r=(st.type==='fhc'?STD_ISO10642:STD_ISO4762).find(x=>x[0]===st.size);return r?String(stdLens(STD_ISO_LV,Math.max(r[6],3*r[1]),r[7],true)[0]||r[6]):'';}}],
    gen:stdIsoScrew},
  {k:'ansi',lab:'Vis ANSI',fields:[
    {k:'type',lab:'Type',opts:()=>[['chc','SHCS — tête cylindrique (B18.3)'],['fhc','FHCS — tête fraisée 82° (B18.3)']]},
    {k:'size',lab:'Taille',opts:st=>(st.type==='fhc'?STD_ANSI_FHCS:STD_ANSI_SHCS).map(r=>[r[0],r[0]]),def:()=>'1/4'},
    {k:'thr',lab:'Filetage',opts:st=>{const r=STD_ANSI_SHCS.find(x=>x[0]===st.size)||STD_ANSI_SHCS[0];
      return (r[6]?[['UNC','UNC — '+r[6]+' filets/pouce']]:[]).concat([['UNF','UNF — '+r[7]+' filets/pouce']]);}},
    {k:'len',lab:'Longueur (po)',opts:st=>{const r=(st.type==='fhc'?STD_ANSI_FHCS:STD_ANSI_SHCS).find(x=>x[0]===st.size);
      if(!r)return [];const n=r.length;return stdLens(STD_INCH_LV,r[n-2],r[n-1]).map(v=>[v,v+'"']);},
      def:st=>{const r=(st.type==='fhc'?STD_ANSI_FHCS:STD_ANSI_SHCS).find(x=>x[0]===st.size);if(!r)return '';
        const n=r.length,l=stdLens(STD_INCH_LV,r[n-2],r[n-1]);return l.find(v=>stdFrac(v)>=3*r[1])||l[0];}}],
    gen:stdAnsiScrew},
  {k:'plug',lab:'Bouchons gaz',fields:[
    {k:'type',lab:'Type',opts:()=>[['din906','DIN 906 — conique R (sans collerette)'],['din908','DIN 908 — cylindrique G, à collerette'],['nptf','NPTF — conique (ANSI)']]},
    {k:'size',lab:'Taille',opts:st=>(st.type==='din908'?STD_DIN908:st.type==='nptf'?STD_NPTF:STD_DIN906).map(r=>[r[0],st.type==='nptf'?r[0]+'" — '+r[2]+' filets/pouce':r[0]+' — '+r[2]+' filets/pouce'])}],
    gen:stdPlug},
  {k:'pin',lab:'Goupilles',fields:[
    {k:'type',lab:'Norme',opts:()=>[['iso2338','ISO 2338 — cylindrique m6'],['iso8734','ISO 8734 — cylindrique trempée'],
      ['iso2339','ISO 2339 — conique 1:50'],['iso8752','ISO 8752 — élastique fendue'],['dowel','ANSI B18.8.2 — dowel pin trempée'],['spring','ANSI B18.8.2 — spring pin fendue']]},
    {k:'size',lab:'Diamètre',opts:st=>stdPinRows(st.type).map(r=>[String(r[0]),typeof r[0]==='string'?r[0]+'"':stdF(r[0])+' mm']),
      def:st=>{const t=stdPinRows(st.type);return String((t.find(r=>(typeof r[0]==='string'?stdFrac(r[0])*STD_IN:r[0])>=5.5)||t[0])[0]);}},
    {k:'len',lab:'Longueur',opts:st=>{const t=stdPinRows(st.type),r=t.find(x=>String(x[0])===st.size);if(!r)return [];
      const n=r.length;return typeof r[0]==='string'?stdLens(STD_INCH_LV,r[n-2],r[n-1]).map(v=>[v,v+'"']):stdLens(STD_PIN_LV,r[n-2],r[n-1],true).map(v=>[String(v),stdF(v)+' mm']);},
      def:st=>{const t=stdPinRows(st.type),r=t.find(x=>String(x[0])===st.size);if(!r)return '';const n=r.length,ins=typeof r[0]==='string',d=ins?stdFrac(r[0]):r[0];
        const l=ins?stdLens(STD_INCH_LV,r[n-2],r[n-1]):stdLens(STD_PIN_LV,r[n-2],r[n-1],true).map(String);return l.find(v=>stdFrac(v)>=4*d)||l[l.length-1];}}],
    gen:stdPin},
  {k:'key',lab:'Clavettes',fields:[
    {k:'type',lab:'Forme',opts:()=>[['A','A — bouts ronds'],['B','B — bouts droits'],['C','C — un bout rond']]},
    {k:'size',lab:'b × h (arbre)',opts:()=>STD_ISO773.map(r=>[r[2]+'x'+r[3],r[2]+' × '+r[3]+'  (arbre Ø '+r[0]+' à '+r[1]+')']),def:()=>'8x7'},
    {k:'len',lab:'Longueur (mm)',opts:st=>{const r=STD_ISO773.find(x=>x[2]+'x'+x[3]===st.size);
      return r?stdLens(STD_KEY_LV,r[6],r[7],true).map(v=>[String(v),stdF(v)]):[];},
      def:st=>{const r=STD_ISO773.find(x=>x[2]+'x'+x[3]===st.size);return r?String(stdLens(STD_KEY_LV,Math.max(r[6],4*r[2]),r[7],true)[0]||r[6]):'';}}],
    gen:stdKey}
];
function stdPinRows(t){
  return t==='iso8734'?STD_ISO8734:t==='iso2339'?STD_ISO2339:t==='iso8752'?STD_ISO8752:t==='dowel'?STD_ANSI_DOWEL:t==='spring'?STD_ANSI_SPRING:STD_ISO2338;
}
function stdCat(k){return STD_CATS.find(c=>c.k===k)||STD_CATS[0];}
function stdNormState(cat,st){
  // Chaque champ garde sa valeur si elle reste proposée, sinon reprend sa valeur par défaut
  const C=stdCat(cat),o=Object.assign({},st||{});
  C.fields.forEach(f=>{
    const op=f.opts(o);
    if(!op.some(x=>x[0]===o[f.k])){const d=f.def?f.def(o):null;o[f.k]=op.some(x=>x[0]===d)?d:(op[0]?op[0][0]:'');}
  });
  return o;
}
function stdSpec(cat,st){
  // Pièce d'après les réglages de la fenêtre ; cat / st la suivent (doc.std : « Modifier… » la rouvre)
  const C=stdCat(cat),s=stdNormState(C.k,st),sp=C.gen(s);
  sp.cat=C.k;sp.st=s;return sp;
}
function stdStateOf(std){
  // Réglages {cat, st} d'une pièce : enregistrés (V0.21.1), sinon retrouvés par sa clé (pièces V0.21.0)
  if(!std||typeof std.key!=='string')return null;
  if(std.st&&typeof std.st==='object'&&STD_CATS.some(c=>c.k===std.cat))return {cat:std.cat,st:stdNormState(std.cat,std.st)};
  let hit=null;
  STD_CATS.some(C=>{
    const walk=(i,st)=>{
      if(hit)return;
      if(i===C.fields.length){try{if(C.gen(st).key===std.key)hit={cat:C.k,st};}catch(e){}return;}
      const f=C.fields[i];
      f.opts(st).forEach(o=>{if(!hit)walk(i+1,Object.assign({},st,{[f.k]:o[0]}));});
    };
    walk(0,{});return !!hit;
  });
  return hit;
}
/* ── document du composant : esquisses + fonctions ── */
function stdSketch(d,name,plane,off){
  const s={id:uid('sk'),name,plane,entities:[],points:{},constraints:[],dims:[],seq:1,visible:false,origin:[0,0,0]};
  ensureSketchBasis(s);s.origin=s.axN.map(v=>v*(off||0));
  d.sketches.push(s);return s;
}
function stdLoop(s,pts){
  // Contour fermé : sommets [x,y] ; [x,y,{c:[cx,cy], ccw?}] = arc de centre c du sommet précédent
  // jusqu'à celui-ci (sens donné, sinon le petit arc). Les arcs d'esquisse vont de pa à pb en sens direct.
  const ids=pts.map(p=>addPoint(s,p[0],p[1]));
  pts.forEach((q,j)=>{
    const i=(j+pts.length-1)%pts.length,p=pts[i],a=ids[i],b=ids[j];
    if(q[2]&&q[2].c){
      const c=q[2].c,pc=addPoint(s,c[0],c[1]),r=Math.hypot(q[0]-c[0],q[1]-c[1]);
      const ccw=q[2].ccw!=null?q[2].ccw:((p[0]-c[0])*(q[1]-c[1])-(p[1]-c[1])*(q[0]-c[0]))>0;
      s.entities.push({id:skNewEid(s),t:'arc',pc,pa:ccw?a:b,pb:ccw?b:a,r});
    }else s.entities.push({id:skNewEid(s),t:'line',p1:a,p2:b});
  });
}
function stdDoc(sp){
  // Pièce complète : un corps (matière : l'acier par défaut, 48-composants-inspection), fiche normalisée (doc.std)
  const d=asmEmptyDoc(sp.name);
  d.bodies=[{id:'b1',name:sp.name,c:null}];d.bodySeq=2;d.activeBody='b1';
  d.std={key:sp.key,norm:sp.norm,desig:sp.desig};
  if(sp.cat&&sp.st){d.std.cat=sp.cat;d.std.st=Object.assign({},sp.st);}
  const F=(f)=>{f.id=uid(f.type==='revolve'?'rv':'ex');f.visible=true;f.body='b1';d.features.push(f);return f;};
  if(sp.prof){
    const s=stdSketch(d,'Profil','XZ',0);stdLoop(s,sp.prof);
    F({type:'revolve',name:'Révolution',sketchId:s.id,axis:{k:'sys',d:'Z'},angle:360,op:'add'});
  }
  (sp.ops||[]).forEach(o=>{
    if(o.k==='hex'){
      // au-dessus du dessus (0,5 mm) : la découpe ne part pas d'une face confondue
      const s=stdSketch(d,'Six pans creux','XY',o.z+0.5);stdLoop(s,stdHex(o.s));
      F({type:'extrude',name:'Six pans creux '+stdF(o.s),sketchId:s.id,distance:-(o.t+0.5),op:'cut',mid:false,upto:null});
    }else if(o.k==='slot'){
      const s=stdSketch(d,'Fente','XY',(o.z0||0)-1),g=o.w/2;stdLoop(s,[[o.x0,-g],[o.x1,-g],[o.x1,g],[o.x0,g]]);
      F({type:'extrude',name:'Fente',sketchId:s.id,distance:o.L+2,op:'cut',mid:false,upto:null});
    }else if(o.k==='key'){
      const s=stdSketch(d,'Contour','XY',0);stdLoop(s,stdKeyOutline(o));
      F({type:'extrude',name:'Clavette',sketchId:s.id,distance:o.h,op:'add',mid:false,upto:null});
    }
  });
  return d;
}
/* ── insertion dans l'assemblage ── */
function stdAddOcc(sp,ownerId,fr){
  // Modèle seul : occurrence de la pièce dans le porteur (composant neuf, ou nouvelle
  // occurrence d'une pièce identique déjà là) → {occ, fresh} ou null
  asmEnsure();
  const owner=asmComp(ownerId||asm.active);if(!owner)return null;
  const same=asm.comps.find(c=>c.doc&&c.doc.std&&c.doc.std.key===sp.key&&asmCanPlace(c.id,owner.id));
  if(same){const o=asmAddOcc(same.id,fr,owner.id);return o?{occ:o,fresh:false}:null;}
  asmPush('normalisé « '+sp.name+' »');
  const c={id:uid('cp'),kind:'comp',name:sp.name,doc:stdDoc(sp),occ:[],link:null};
  const L=asmLinkOwner(owner);if(L)c.of=L.id; // dans un composant lié : il en fait partie
  asm.comps.push(c);
  const o=asmNewOccObj(c.id,sp.name+':1',fr?asmRound(fr):asmFr0());
  owner.occ.push(o);
  asmResolve();
  return {occ:o,fresh:true};
}
function stdInsert(sp){
  // Commande : mode Placer, pièce posée à droite de ce qui est affiché, sélectionnée
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return null;}
  asmEnsure();
  if(asmMode!=='asm')asmEnter();
  const owner=asmActiveComp();if(!owner)return null;
  let dx=0;try{const box=new THREE.Box3();asmSceneGet().getObjectByName('asmOcc').traverse(m=>{if(m.isMesh)box.expandByObject(m);});if(!box.isEmpty())dx=box.max.x+20;}catch(e){}
  const r=stdAddOcc(sp,owner.id,{o:[dx,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]});if(!r)return null;
  if(r.fresh){try{asmBuildSnapshots();}catch(e){}}
  asmSelId=r.occ.id;
  asmNotify();
  try{faceEl.textContent=(r.fresh?'Inséré « ':'Nouvelle occurrence « ')+r.occ.name+' » dans « '+owner.name+' ». Placez-la, ou alignez un point d’accroche.';}catch(e){}
  return r.occ;
}
/* ── trous d'une pièce (faces exactes, 48-assemblage-accroches : asmSnapExtract) ──
   Entrée d'un trou = cercle d'une face plane qui est un bord INTÉRIEUR (la face déborde du
   cercle de tous côtés — le dessus d'un tenon, lui, s'arrête au cercle) et qu'aucun cercle
   coaxial du même côté ne domine (le fond d'un lamage n'est pas une entrée). Le trou est décrit
   par ses cylindres coaxiaux contigus depuis l'entrée : [r, profondeur début, fin]. */
function stdHoles(G){
  const V=asmV,out=[],circ=[],cyl=[];
  const key=v=>v.map(x=>x.toFixed(3)).join(',');
  (G&&G.faces||[]).forEach(F=>{
    if(F.k==='cyl'){
      const k=key(F.l)+'|'+key(F.n)+'|'+F.r.toFixed(3)+'|'+F.t[0].toFixed(3)+'|'+F.t[1].toFixed(3);
      if(!cyl.some(q=>q.k===k))cyl.push({k,F});
      return;
    }
    const [u0,u1,v0,v1]=F.rect;
    F.edges.forEach(e=>{
      if(e.k!=='circ'||Math.abs(V.dot(e.n,F.n))<0.999)return;
      const q=V.sub(e.c,F.c),u=V.dot(q,F.x),v=V.dot(q,F.y);
      if(Math.min(u1-u,u-u0,v1-v,v-v0)<e.r+0.01)return; // pas un bord intérieur
      if(circ.some(c=>c.F===F&&V.len(V.sub(c.c,e.c))<1e-3&&Math.abs(c.r-e.r)<1e-3))return; // demi-cercles
      circ.push({F,e,c:e.c,r:e.r,n:F.n});
    });
  });
  // profondeur (le long de −n) sous le plan d'entrée, et distance à l'axe
  const depth=(E,p)=>-V.dot(V.sub(p,E.c),E.n);
  const off=(E,p)=>{const w=V.sub(p,E.c);return V.len(V.sub(w,V.mul(E.n,V.dot(w,E.n))));};
  circ.forEach(E=>{
    const co=circ.filter(o=>o!==E&&V.dot(o.n,E.n)>0.999&&off(E,o.c)<0.01);
    if(co.some(o=>depth(E,o.c)<-0.01))return; // dominé : fond de lamage
    const cs=cyl.map(q=>q.F).filter(F=>Math.abs(V.dot(F.n,E.n))>0.999&&off(E,F.l)<0.01).map(F=>{
      const a=depth(E,V.add(F.l,V.mul(F.n,F.t[0]))),b=depth(E,V.add(F.l,V.mul(F.n,F.t[1])));
      return {r:F.r,d0:Math.min(a,b),d1:Math.max(a,b),F};
    }).filter(c=>c.d1>0.01).sort((a,b)=>a.d0-b.d0);
    // cylindres contigus depuis l'entrée (un fraisage laisse un cône, hors liste, au début)
    const seg=[];
    for(const c of cs){
      const prev=seg.length?seg[seg.length-1].d1:(c.r<E.r-0.01?c.d0:0);
      if(Math.abs(c.d0-prev)>0.02||c.r>E.r+0.01)break;
      seg.push(c);
    }
    if(!seg.length)return;
    const kind=seg[0].r<E.r-0.01?'csink':(seg.length>1&&seg[1].r<seg[0].r-0.01)?'cbore':'simple';
    let seat=E;
    if(kind==='cbore'){
      const s1=co.find(o=>Math.abs(depth(E,o.c)-seg[0].d1)<0.02&&Math.abs(o.r-seg[1].r)<0.01);
      if(s1)seat=s1;
    }
    const f=v=>(+v).toFixed(2);
    const main=seg[kind==='cbore'?1:0]; // cylindre du trou proprement dit (sous le lamage)
    out.push({E,seat,kind,n:E.n,r:main.r,cyl:main.F,
      sig:kind+'|'+f(E.r)+'|'+seg.map(c=>f(c.r)+':'+f(c.d0)+':'+f(c.d1)).join(';')});
  });
  return out;
}
function stdHoleAt(H,p,look){
  // Trou sous un point (coordonnées du composant) : le plus proche de son axe ; un débouchant a
  // deux entrées sur le même axe — look (direction du regard) retient celle tournée vers l'œil
  let best=null;
  H.forEach(h=>{
    const w=asmV.sub(p,h.E.c),d=-asmV.dot(w,h.n),lat=asmV.len(asmV.add(w,asmV.mul(h.n,d)));
    if(d<-0.6||lat>h.E.r+0.6)return;
    const sc=lat+(look&&asmV.dot(h.n,look)>0?1e3:0);
    if(!best||sc<best.sc)best={h,sc};
  });
  return best&&best.h;
}
function stdSameHoles(H,h){return H.filter(q=>q.sig===h.sig&&asmV.dot(q.n,h.n)>0.999);}
function stdHoleSn(h,mode){
  // Référence durable (point d'accroche) du centre du cercle d'assise ; 'mid' : milieu de l'axe du
  // cylindre du trou (goupille centrée dans l'épaisseur)
  if(mode==='mid'){const it=h.cyl&&asmSnapItems(h.cyl).find(q=>q.w==='am');return it?asmSnapRef(h.cyl,it):null;}
  const S=mode==='under'?h.seat:h.E;
  // Fond de lamage : face annulaire dont le centre EST celui du trou — les points d'accroche n'y
  // gardent que le « centre » de la face (même point, même axe) : il convient aussi
  const at=q=>asmV.len(asmV.sub(q.fr.o,S.c))<1e-3&&asmV.dot(q.fr.z,S.n)>0.999,its=asmSnapItems(S.F);
  const it=its.find(q=>q.w==='ec'&&q.e&&at(q))||its.find(q=>q.w==='c'&&at(q));
  return it?asmSnapRef(S.F,it):null;
}
function stdAddOnHoles(sp,ownerId,relPath,holes){
  // Une occurrence par trou, liaison rigide sur son cercle d'assise — une seule étape d'annulation
  asmEnsure();
  const owner=asmComp(ownerId||asm.active);if(!owner||!holes.length)return [];
  const sns=[];
  holes.forEach(h=>{const sn=stdHoleSn(h,sp.seat||'under');if(sn)sns.push({sn,h});});
  if(!sns.length)return [];
  asmPush('normalisé « '+sp.name+' » sur '+sns.length+' trou(s)');
  let c=asm.comps.find(q=>q.doc&&q.doc.std&&q.doc.std.key===sp.key&&asmCanPlace(q.id,owner.id));
  if(!c){
    c={id:uid('cp'),kind:'comp',name:sp.name,doc:stdDoc(sp),occ:[],link:null};
    const L=asmLinkOwner(owner);if(L)c.of=L.id;
    asm.comps.push(c);
  }
  const occs=sns.map(({sn,h})=>{
    const o=asmNewOccObj(c.id,asmOccName(c.id),asmFr0());
    // goupille : +Z de la pièce vers l'entrée (l'axe d'un cylindre a un sens arbitraire) ;
    // FHC : tête 0,2 mm sous la face d'entrée (sp.sink, retrait des fraisures du perçage)
    const flip=sp.seat==='mid'&&asmV.dot(sn.fr.z,h.n)<0;
    o.align={src:{path:[],cg:null},dst:{path:(relPath||[]).slice(),cg:null,sn},flip,rz:0,off:[0,0,-(sp.sink||0)]};
    owner.occ.push(o);return o;
  });
  asmResolve();
  return occs;
}
/* ── modifier une pièce posée (V0.21.1) ──
   all : toutes les occurrences du composant — il est reconstruit sur place (même objet document,
   autre contenu), renommé ; si la nouvelle pièce existe déjà, ses occurrences y passent plutôt.
   Sinon : cette occurrence seulement — elle passe sur la nouvelle pièce (créée ou réemployée).
   Positions, liaisons et apparence restent : l'origine d'une pièce (face d'appui, dessus, bout)
   ne dépend ni de la longueur ni du pas. Une seule étape d'annulation. */
function stdReplace(occId,sp,all){
  // → {comp, n (occurrences changées), how:'rebuilt'|'moved'|'same'} ou null
  if(!asm)return null;
  const o=asmOcc(occId),owner=asmOccOwner(occId);if(!o||!owner)return null;
  const c=asmComp(o.comp);if(!c||!c.doc||!c.doc.std||c.doc===doc)return null;
  if(c.doc.std.key===sp.key)return {comp:c,n:0,how:'same'};
  const list=all?asmCompOccs(c.id):[o];
  // même assise (sous tête, affleurant, milieu) : le retrait suit la nouvelle pièce (FHC ↔ bouchon…)
  const oS=stdStateOf(c.doc.std),was=oS?stdSpec(oS.cat,oS.st):null;
  const sink=()=>{if(was&&was.seat===sp.seat)list.forEach(q=>{if(q.align&&q.align.dst&&q.align.dst.sn)q.align.off=[0,0,-(sp.sink||0)];});};
  const ownerOf=q=>asmOccOwner(q.id);
  const same=asm.comps.find(q=>q!==c&&q.doc&&q.doc.std&&q.doc.std.key===sp.key&&list.every(x=>asmCanPlace(q.id,ownerOf(x).id)));
  const lab='« '+c.name+' » → « '+sp.name+' »'+(all?'':' (une occurrence)');
  const move=t=>list.forEach(q=>{q.name=asmOccName(t.id);q.comp=t.id;});
  if(same){asmPush(lab);move(same);sink();asmPurge();asmResolve();return {comp:same,n:list.length,how:'moved'};}
  if(all||asmCompOccs(c.id).length===1){
    // le composant entier change : reconstruit sur place
    asmPush(lab,[c.id]);
    const old=c.name,nd=stdDoc(sp);
    Object.keys(c.doc).forEach(k=>{delete c.doc[k];});Object.assign(c.doc,nd);
    c.name=sp.name;
    const re=new RegExp('^'+old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    asmCompOccs(c.id).forEach(q=>{q.name=q.name.replace(re,sp.name);});
    c._stale=true;
    sink();
    asmResolve();
    return {comp:c,n:asmCompOccs(c.id).length,how:'rebuilt'};
  }
  asmPush(lab);
  const t={id:uid('cp'),kind:'comp',name:sp.name,doc:stdDoc(sp),occ:[],link:null};
  const L=asmLinkOwner(owner);if(L)t.of=L.id;
  asm.comps.push(t);move(t);sink();asmResolve();
  return {comp:t,n:1,how:'moved'};
}
/* ── commande « Sur des trous » : clic sur un trou en mode Placer ── */
let stdHolePick=null; // {sp}
function stdHoleStart(sp){
  if(!sp||!sp.seat){try{faceEl.textContent='Cette pièce ne se pose pas dans un trou.';}catch(e){}return;}
  if(!(typeof occHas==='function'&&occHas())){alert('La pose sur des trous lit la forme exacte : noyau OCCT pas encore prêt.');return;}
  if(asmMode!=='asm')asmEnter();
  stdHolePick={sp};
  try{renderer.domElement.style.cursor='crosshair';}catch(e){}
  try{faceEl.textContent='« '+sp.name+' » : cliquez un trou (sa paroi) — tous les trous identiques de la pièce le recevront. Échap = annuler.';}catch(e){}
}
function stdHoleCancel(){
  stdHolePick=null;try{renderer.domElement.style.cursor='';}catch(e){}
  try{faceEl.textContent='Pose sur des trous annulée.';}catch(e){}
}
function stdHolePickAt(e){
  // asmClick (47) : true si le clic est consommé
  if(!stdHolePick)return false;
  const sp=stdHolePick.sp,S=asmSceneGet(),G=S.getObjectByName('asmOcc');if(!G)return true;
  const P=asm.path,n=P.length;
  const ms=[];G.traverse(m=>{if(m.isMesh&&m.parent&&Array.isArray(m.parent.userData.path))ms.push(m);});
  rayc.ray.copy(asmRay(e));
  const hits=[];ms.forEach(m=>{try{THREE.Mesh.prototype.raycast.call(m,rayc,hits);}catch(err){}});
  hits.sort((a,b)=>a.distance-b.distance);
  for(const hit of hits){
    const path=hit.object.parent.userData.path;
    if(path.length<n||!P.every((q,i)=>path[i]===q))continue; // hors du composant actif
    const c=asmComp(asmPathComp(path));if(!c||(c.doc&&c.doc.std))continue; // une vis déjà posée : on regarde derrière
    const Gs=asmSnapGeomOf(c);if(!Gs)continue;
    const inv=new THREE.Matrix4().copy(hit.object.matrixWorld).invert();
    const pl=hit.point.clone().applyMatrix4(inv),ld=rayc.ray.direction.clone().transformDirection(inv);
    const H=stdHoles(Gs),h=stdHoleAt(H,[pl.x,pl.y,pl.z],[ld.x,ld.y,ld.z]);
    if(!h)continue;
    const occs=stdAddOnHoles(sp,asm.active,path.slice(n),stdSameHoles(H,h));
    stdHolePick=null;try{renderer.domElement.style.cursor='';}catch(err){}
    try{asmBuildSnapshots();}catch(err){}
    if(occs.length)asmSelId=occs[0].id;
    asmNotify();
    const lab={simple:'simples',cbore:'lamés',csink:'fraisés'}[h.kind];
    try{faceEl.textContent=occs.length?'« '+sp.name+' » posé sur '+occs.length+' trou(s) '+lab+' Ø'+stdF(2*h.r)+' de « '+c.name+' », liaison rigide (suit la pièce).':'Pose impossible sur ce trou.';}catch(err){}
    const m=document.querySelector('#stdDlg .stdFoot span');if(m)m.textContent=occs.length?'✓ '+occs.length+' × '+sp.name:'';
    return true;
  }
  try{faceEl.textContent='Pas de trou ici : cliquez la paroi d’un trou (simple, lamé ou fraisé). Échap = annuler.';}catch(err){}
  return true;
}
/* ── aperçu : silhouette de côté (révolution) ou vue de dessus + côté (clavette) ── */
function stdPolyPts(pts){
  // sommets → polyligne (arcs échantillonnés)
  const out=[];
  pts.forEach((q,j)=>{
    const p=pts[(j+pts.length-1)%pts.length];
    if(q[2]&&q[2].c){
      const c=q[2].c,r=Math.hypot(q[0]-c[0],q[1]-c[1]);
      let a0=Math.atan2(p[1]-c[1],p[0]-c[0]),a1=Math.atan2(q[1]-c[1],q[0]-c[0]);
      const ccw=q[2].ccw!=null?q[2].ccw:((p[0]-c[0])*(q[1]-c[1])-(p[1]-c[1])*(q[0]-c[0]))>0;
      if(ccw){while(a1<=a0)a1+=2*Math.PI;}else{while(a1>=a0)a1-=2*Math.PI;}
      for(let k=1;k<=16;k++){const a=a0+(a1-a0)*k/16;out.push([c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)]);}
    }else out.push([q[0],q[1]]);
  });
  return out;
}
function stdSvg(sp){
  const W=240,H=220,shapes=[],hid=[];
  if(sp.prof){
    const P=stdPolyPts(sp.prof);
    shapes.push(P.map(p=>[p[0],p[1]]),P.map(p=>[-p[0],p[1]]));
    (sp.ops||[]).forEach(o=>{
      if(o.k==='hex'){const e=o.s/Math.sqrt(3);hid.push([[-e,o.z],[-e,o.z-o.t],[e,o.z-o.t],[e,o.z]]);}
      if(o.k==='slot'){const z0=o.z0||0;hid.push([[-o.w/2,z0],[-o.w/2,z0+o.L]],[[o.w/2,z0],[o.w/2,z0+o.L]]);}
    });
  }
  (sp.ops||[]).forEach(o=>{
    if(o.k!=='key')return;
    const P=stdPolyPts(stdKeyOutline(o)),gap=o.b*0.8;
    shapes.push(P.map(p=>[p[0],p[1]+o.b/2+gap/2]));
    shapes.push([[-o.L/2,-gap/2],[o.L/2,-gap/2],[o.L/2,-gap/2-o.h],[-o.L/2,-gap/2-o.h]]);
  });
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  shapes.forEach(S=>S.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}));
  const k=Math.min((W-24)/Math.max(1e-6,x1-x0),(H-24)/Math.max(1e-6,y1-y0));
  const X=x=>(W/2+(x-(x0+x1)/2)*k).toFixed(1),Y=y=>(H/2-(y-(y0+y1)/2)*k).toFixed(1);
  const path=S=>S.map((p,i)=>(i?'L':'M')+X(p[0])+' '+Y(p[1])).join(' ');
  let s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" xmlns="http://www.w3.org/2000/svg">';
  shapes.forEach(S=>{s+='<path d="'+path(S)+' Z" fill="var(--stdFill)" stroke="var(--text)" stroke-width="1.2" stroke-linejoin="round"/>';});
  if(sp.prof)s+='<path d="M'+X(0)+' 4 V'+(H-4)+'" stroke="var(--muted)" stroke-width="0.8" stroke-dasharray="10 3 2 3"/>';
  hid.forEach(S=>{s+='<path d="'+path(S)+'" fill="none" stroke="var(--text)" stroke-width="0.9" stroke-dasharray="4 3" opacity=".75"/>';});
  return s+'</svg>';
}
/* ── fenêtre ── */
let stdUi={cat:'iso',st:{}}; // dernière sélection (reprise à la réouverture)
function stdCss(){
  if(document.getElementById('stdCss'))return;
  const st=document.createElement('style');st.id='stdCss';
  st.textContent=[
    '#stdDlg{position:fixed;left:calc(50% - 310px);top:72px;z-index:8000;width:620px;max-width:calc(100vw - 32px);display:flex;flex-direction:column;border-radius:14px;background-color:var(--bg);border:1px solid var(--border);box-shadow:0 20px 50px rgba(0,0,0,.45);color:var(--text);--stdFill:rgba(127,127,127,.22)}',
    '#stdDlg .stdHead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);cursor:move;user-select:none}',
    '#stdDlg .stdHead b{font-size:.95rem}#stdDlg .stdHead button{padding:2px 8px}',
    '#stdDlg .stdTabs{display:flex;gap:4px;padding:8px 14px 0;flex-wrap:wrap}',
    '#stdDlg .stdTabs button{padding:4px 10px;border-radius:8px 8px 0 0;font-size:.8rem}',
    '#stdDlg .stdTabs button.on{background:var(--primary);color:#fff}',
    '#stdDlg .stdBody{display:flex;gap:14px;padding:12px 14px;border-top:1px solid var(--border);flex-wrap:wrap}',
    '#stdDlg .stdForm{flex:1 1 260px;display:flex;flex-direction:column;gap:8px;min-width:0}',
    '#stdDlg .stdForm label{display:flex;flex-direction:column;align-items:stretch;text-align:left;gap:3px;margin:0;font-size:.75rem;color:var(--muted)}',
    '#stdDlg .stdForm select{width:100%;max-width:none;margin:0;font-size:.85rem;color:var(--text)}',
    '#stdDlg .stdPrev{flex:0 0 240px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:10px;min-height:220px}',
    '#stdDlg .stdName{font-weight:600;font-size:.9rem;color:var(--text);text-align:left}',
    '#stdDlg .stdInfo{font-size:.75rem;color:var(--muted);line-height:1.4;text-align:left}',
    '#stdDlg .stdFoot{display:flex;gap:8px;justify-content:flex-end;align-items:center;padding:10px 14px;border-top:1px solid var(--border)}',
    '#stdDlg .stdFoot span{margin-right:auto;font-size:.75rem;color:var(--muted)}'
  ].join('\n');
  document.head.appendChild(st);
}
function stdDlg(edit){
  // Ouvre (ou ferme) la fenêtre des composants normalisés. edit = {occ} : « Modifier… » une pièce
  // posée — la fenêtre reprend ses réglages et applique à toutes ses occurrences ou à celle-ci.
  let w=document.getElementById('stdDlg');if(w){w.remove();if(!edit)return;}
  stdCss();
  try{const v=JSON.parse(localStorage.getItem('minifusion_std')||'null');if(v&&typeof v.cat==='string'&&v.st&&typeof v.st==='object')stdUi=v;}catch(e){}
  if(edit){
    const o=asmOcc(edit.occ),c=o&&asmComp(o.comp),S=c&&c.doc&&stdStateOf(c.doc.std);
    if(!S){try{faceEl.textContent='Ce composant n’est pas une pièce normalisée (ou ses réglages sont illisibles).';}catch(e){}return;}
    stdUi.cat=S.cat;stdUi.st=stdUi.st||{};stdUi.st[S.cat]=S.st;
  }
  w=document.createElement('div');w.id='stdDlg';
  w.innerHTML='<div class="stdHead"><b>🔩 Composants normalisés</b><button title="Fermer (Échap)">✕</button></div>'+
    '<div class="stdTabs"></div><div class="stdBody"><div class="stdForm"></div><div class="stdPrev"></div></div>'+
    (edit?'<div class="stdFoot"><span></span><button class="primary">✔ Toutes les occurrences</button><button>Celle-ci seulement</button><button>Fermer</button></div>'
      :'<div class="stdFoot"><span></span><button title="Cliquez un trou dans la vue : tous les trous identiques (simple, lamé, fraisé) reçoivent la pièce, en liaison rigide">🎯 Sur des trous…</button><button class="primary">➕ Insérer</button><button>Fermer</button></div>');
  const tabs=w.querySelector('.stdTabs'),form=w.querySelector('.stdForm'),prev=w.querySelector('.stdPrev'),msg=w.querySelector('.stdFoot span');
  const close=()=>w.remove();
  w.querySelector('.stdHead button').onclick=close;
  const [bHole,bIns,bClose]=w.querySelectorAll('.stdFoot button');bClose.onclick=close;
  const save=()=>{try{localStorage.setItem('minifusion_std',JSON.stringify(stdUi));}catch(e){}};
  const apply=(sp,all)=>{
    const r=sp&&stdReplace(edit.occ,sp,all);
    if(!r){msg.textContent='Modification impossible.';return;}
    if(r.how==='same'){msg.textContent='Déjà cette pièce.';return;}
    try{asmBuildSnapshots();}catch(e){}
    asmNotify();
    msg.textContent='✓ '+r.n+' occurrence(s) → '+sp.name;
    try{faceEl.textContent='Pièce normalisée modifiée : '+r.n+' occurrence(s) → « '+sp.name+' » (liaisons gardées). Ctrl+Z pour annuler.';}catch(e){}
    draw();
  };
  const draw=()=>{
    if(edit){
      const o=asmOcc(edit.occ),c=o&&asmComp(o.comp);if(!o||!c){close();return;}
      const n=asmCompOccs(c.id).length;
      w.querySelector('.stdHead b').textContent='🔩 Modifier « '+o.name+' »';
      bHole.textContent='✔ Toutes les occurrences ('+n+')';bIns.style.display=n>1?'':'none';
    }
    const C=stdCat(stdUi.cat);
    stdUi.st[C.k]=stdNormState(C.k,stdUi.st[C.k]);const st=stdUi.st[C.k];
    tabs.innerHTML='';
    STD_CATS.forEach(c=>{const b=document.createElement('button');b.textContent=c.lab;if(c.k===C.k)b.className='on';
      b.onclick=()=>{stdUi.cat=c.k;save();draw();};tabs.appendChild(b);});
    form.innerHTML='';
    C.fields.forEach(f=>{
      const l=document.createElement('label');l.textContent=f.lab;
      const s=document.createElement('select');s.dataset.k=f.k;
      f.opts(st).forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;if(v===st[f.k])o.selected=true;s.appendChild(o);});
      s.onchange=()=>{st[f.k]=s.value;save();draw();};
      l.appendChild(s);form.appendChild(l);
    });
    let sp=null;try{sp=stdSpec(C.k,st);}catch(e){sp=null;}
    const nm=document.createElement('div');nm.className='stdName';nm.textContent=sp?sp.name:'—';form.appendChild(nm);
    const inf=document.createElement('div');inf.className='stdInfo';inf.textContent=sp?(sp.norm+' · '+sp.info):'';form.appendChild(inf);
    prev.innerHTML=sp?stdSvg(sp):'';
    if(edit){bHole.disabled=bIns.disabled=!sp;bHole.onclick=()=>apply(sp,true);bIns.onclick=()=>apply(sp,false);return;}
    bIns.disabled=!sp;bHole.disabled=!sp||!sp.seat;
    bHole.onclick=()=>{if(sp){msg.textContent='Cliquez un trou dans la vue…';stdHoleStart(sp);}};
    bIns.onclick=()=>{
      if(!sp)return;
      const o=stdInsert(sp);
      msg.textContent=o?'✓ '+o.name+' inséré':'Insertion impossible ici.';
    };
  };
  // déplaçable par l'en-tête
  const hd=w.querySelector('.stdHead');
  hd.onmousedown=e=>{
    if(e.target.tagName==='BUTTON')return;
    const r=w.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;
    const mv=ev=>{w.style.left=Math.max(0,ev.clientX-dx)+'px';w.style.top=Math.max(0,ev.clientY-dy)+'px';};
    const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
    document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);e.preventDefault();
  };
  w.addEventListener('keydown',e=>{if(e.key==='Escape')close();e.stopPropagation();});
  document.body.appendChild(w);
  draw();
}
