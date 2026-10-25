// V0.7.7 : qualité du rendu de la simulation — éclairage depuis l'outil (normales de la surface
// taillée par colonne, direction radiale pour les parois) et rendu GPU instancié (textures).
// Demande : « un moyen de gagner en qualité en ce qui concerne la simulation ? » — palier 1.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
const {ctx}=loadApp();
const R=String.raw`
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);
  const G=()=>faoMatterGrid({x0:0,y0:0,z0:0,x1:40,y1:40,z1:20},0.5);
  const col=(g,x,y)=>Math.floor((y-g.oy)/g.pas)*g.nx+Math.floor((x-g.ox)/g.pas);
  const N=(g,c)=>[g.nrm[c*4],g.nrm[c*4+1],g.nrm[c*4+2]];
  // 1. fraise plate : fond → normale verticale, direction radiale vers l'axe
  {const g=G();faoMatterCarveSeg(g,20,20,10,20,20,10,5,null,0,null);
   const c=col(g,20,20),n=N(g,c);A(near(n[2],1)&&near(g.h[c],10),'1 : fraise plate — fond à Z10, normale (0,0,1)');
   const e=col(g,24.2,20);const w=[g.wn[e*2],g.wn[e*2+1]];A(w[0]<-0.99&&near(w[1],0,0.1),'2 : colonne au bord du passage : direction radiale vers l’axe (−X) pour la paroi ('+w.map(v=>v.toFixed(2))+')');
   A(near(g.nrm[c*4+3],0),'3 : indicateur « colonne creusée » à 0 hors 3+2');}
  // 2. fraise torique R2 : l'arrondi incline la normale vers l'axe, progressivement
  {const g=G();faoMatterCarveSeg(g,20,20,10,20,20,10,5,null,2,null);
   const c0=col(g,20,20),c1=col(g,23.6,20),c2=col(g,24.6,20);
   const n0=N(g,c0),n1=N(g,c1),n2=N(g,c2);
   A(near(n0[2],1)&&n1[2]<0.999&&n1[2]>n2[2]&&n1[0]<0&&n2[0]<n1[0],'4 : fraise torique — plat au centre, normale de plus en plus couchée vers l’axe sous l’arrondi ('+n1.map(v=>v.toFixed(2))+' puis '+n2.map(v=>v.toFixed(2))+')');
   A(Math.abs(Math.hypot(...n2)-1)<1e-6,'5 : normales unitaires');}
  // 3. foret 118° : cône → normale inclinée vers l'axe d'un angle constant
  {const g=G();const tp=faoToolTipProfile({kind:'drill',d:6});faoMatterCarveSeg(g,20,20,8,20,20,8,3,null,0,tp);
   const c=col(g,21.6,20),n=N(g,c);const ang=Math.atan2(Math.hypot(n[0],n[1]),n[2])*180/Math.PI;
   A(n[0]<0&&near(ang,90-59,1.5),'6 : foret 118° — normale inclinée de '+ang.toFixed(1)+'° vers l’axe (attendu 31°)');}
  // 4. outil incliné (3+2) : normale = axe de l'outil
  {const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:40,y1:40,z1:20},0.5);
   faoMatterCarveTilt(g,{x:20,y:-2,z:10},{x:20,y:10,z:10},2,[0,-1,0],null);
   let okA=true,n=0;for(let c=0;c<g.nx*g.ny;c++){if(g.h[c]<20-1e-6){n++;}}
   A(n===0,'7 : outil horizontal — aucune colonne abaissée (la normale du dessus reste (0,0,1))');
   const g2=faoMatterGrid({x0:0,y0:0,z0:0,x1:40,y1:40,z1:20},0.5);const A2=[Math.SQRT1_2,0,Math.SQRT1_2];
   faoMatterCarveTilt(g2,{x:20,y:0,z:10},{x:20,y:40,z:10},5,A2,null);
   let found=0;for(let c=0;c<g2.nx*g2.ny;c++){if(g2.h[c]<20-1e-6&&near(g2.nrm[c*4],A2[0],1e-6)&&near(g2.nrm[c*4+2],A2[2],1e-6))found++;}
   A(found>0,'8 : outil à 45° — les colonnes abaissées portent la normale de l’axe de l’outil ('+found+')');}
  // 5. rendu GPU : hors navigateur (pas de WebGL2) → repli tableau de sommets ; shader cohérent
  A(faoMatterGpuSupported()===false&&faoMatterFine()===false,'9 : sans WebGL2 : repli sur le tableau de sommets, maille inchangée');
  A(/texelFetch\(faoH/.test(FAO_GPU_VS)&&/gl_InstanceID/.test(FAO_GPU_VS)&&/N\.a>0\.5/.test(FAO_GPU_VS)&&/dot\(Wn\.xy,fn\.xy\)>0\.2/.test(FAO_GPU_VS),
    '10 : shader instancié : hauteurs par texelFetch, colonne par gl_InstanceID, colonnes creusées repliées, parois éclairées par la direction radiale');
  {const g=G();faoMatterCarveSeg(g,20,20,10,20,20,10,5,null,0,null);
   const vw={matterGrid:g,mTops:g.h,mArr:new Float32Array((g.nx*g.ny*30+6)*3),mNrm:new Float32Array((g.nx*g.ny*30+6)*3)};
   const c=col(g,24.4,20);faoViewerMatterWriteCol(vw,c);const o=c*90;
   // paroi +X de la colonne basse (24.4 est dans le passage, 24.6 dehors ? r=5 → bord à 25) : voisine +X plus haute → quad replié
   const e=col(g,25.2,20);faoViewerMatterWriteCol(vw,e);const oe=e*90+18*3; // côté -X de la colonne HAUTE (vers la basse)
   const nW=[vw.mNrm[oe],vw.mNrm[oe+1],vw.mNrm[oe+2]];
   A(nW[0]<-0.99&&near(nW[2],0),'11 : paroi de la colonne haute vers la basse : normale = direction radiale de la colonne basse ('+nW.map(v=>v.toFixed(2))+')');
   const zq=[vw.mArr[oe+2],vw.mArr[oe+5],vw.mArr[oe+8]];A(Math.max(...zq)-Math.min(...zq)>5,'12 : … et le quad est bien déplié (de Z'+Math.min(...zq).toFixed(1)+' à Z'+Math.max(...zq).toFixed(1)+')');}
  // 6. segment en pente : la surface suit la pente (avant : taillée à la cote la plus basse du segment)
  {const g=faoMatterGrid({x0:0,y0:0,z0:0,x1:40,y1:20,z1:20},0.5);
   faoMatterCarveSeg(g,5,10,18,35,10,8,2,null,0,null); // fraise plate Ø4, descend de 10 mm sur 30 mm
   // la surface suit la pente décalée du rayon (le bord aval de la fraise plate, plus bas, passe en dernier)
   let errMax=0;for(let x=8;x<=31;x+=0.5){const c=col(g,x,10);const att=18-(x+2-5)/3;errMax=Math.max(errMax,Math.abs(g.h[c]-att));}
   A(errMax<0.2,'13 : segment en pente (30 mm, −10 mm) : surface à '+errMax.toFixed(3)+' mm de la pente attendue (avant : toute la longueur à la cote basse, 10 mm d’écart)');}
  // 7. aspect de la matière : beige (défaut) ou aluminium, appliqué aux matériaux et mémorisé
  {A(faoMatterLook==='beige'&&FAO_LOOKS.alu&&FAO_LOOKS.alu.shininess>FAO_LOOKS.beige.shininess,'14 : aspect par défaut beige ; aluminium plus brillant');
   const m={color:{setHex(v){this.v=v;}},specular:{setHex(v){this.v=v;}},shininess:0};
   const calls=[];let __s=null;try{if(typeof localStorage!=='undefined'&&localStorage){__s=localStorage.setItem;localStorage.setItem=function(k,v){calls.push(k+'='+v);};}}catch(e){}
   faoMatterLookSet('alu');faoMatterStyle(m);
   try{if(__s)localStorage.setItem=__s;}catch(e){}
   A(m.color.v===FAO_LOOKS.alu.color&&m.specular.v===FAO_LOOKS.alu.specular&&m.shininess===80,'15 : faoMatterLookSet(alu) : couleur, reflet et brillance de l’aluminium appliqués');
   A(calls.some(c=>c==='minifusion_faoMatiere=alu'),'16 : choix mémorisé (minifusion_faoMatiere = alu)');
   faoMatterLookSet('beige');A(faoMatterLook==='beige','17 : retour au beige');}
  return out;
`;
(async()=>{
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== Simulation : éclairage depuis l’outil et rendu GPU ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
