// V0.8.7 : moteurs de matière « palier 3 » (88-fao-78) — tri-dexel et champ de distance, taille
// comparée à des volumes calculés à la main. Brut 60 × 40 × 20 ; rainure fraise plate R5 à Z15
// de (10,20) à (50,20) : (40×10 + π·25)×5 enlevés ; rainure fraise boule R5 (pointe Z15) :
// demi-disque × 40 + deux quarts de boule (une demi-boule) ; perçage 3+2 par la face X60 (axe +X, R3, bout plat,
// pointe à X50) : π·9·10 ; contre-dépouille : rainure en T vue par les rayons X et Y.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    const rel=(a,b)=>Math.abs(a-b)/Math.max(1e-9,Math.abs(b));
    const S={x0:0,y0:0,z0:0,x1:60,y1:40,z1:20};const V0=48000;
    const flat=(V0-(400+Math.PI*25)*5),ball=V0-(Math.PI*25/2*40+2*Math.PI*125/3),drill=V0-Math.PI*9*10;
    const p=0.25;
    const run=(mk,vol)=>{
      const out={};
      let D=mk();faoEngCarve(D,{x:10,y:20,z:15},{x:50,y:20,z:15},5,0,null,null);out.flat=vol(D);
      D=mk();faoEngCarve(D,{x:10,y:20,z:15},{x:50,y:20,z:15},5,5,null,null);out.ball=vol(D);
      D=mk();faoEngCarve(D,{x:50,y:20,z:10},{x:50,y:20,z:10},3,0,null,[1,0,0]);out.drill=vol(D);
      // pente : une rampe de Z20 à Z10 sur 40 mm, fraise plate R5 → coin enlevé ≈ (largeur 10) × aire du triangle
      D=mk();faoEngCarve(D,{x:10,y:20,z:20},{x:50,y:20,z:10},5,0,null,null);out.ramp=vol(D);
      out.D=D;return out;};
    const dx=run(()=>faoDexCreate(S,p),D=>faoDexVolume(D,2));
    att(rel(dx.flat,flat)<0.01,'1 : tri-dexel, rainure plate : '+dx.flat.toFixed(1)+' mm³ (attendu '+flat.toFixed(1)+')');
    att(rel(dx.ball,ball)<0.01,'2 : tri-dexel, rainure boule : '+dx.ball.toFixed(1)+' (attendu '+ball.toFixed(1)+')');
    att(rel(dx.drill,drill)<0.01,'3 : tri-dexel, perçage 3+2 par la face X60 : '+dx.drill.toFixed(1)+' (attendu '+drill.toFixed(1)+')');
    // les trois familles de rayons voient le même volume
    {const D=faoDexCreate(S,p);faoEngCarve(D,{x:10,y:20,z:15},{x:50,y:20,z:15},5,5,null,null);
     const v=[0,1,2].map(k=>faoDexVolume(D,k));
     att(v.every(x=>rel(x,ball)<0.015),'4 : tri-dexel : rayons X, Y et Z d’accord ('+v.map(x=>x.toFixed(0)).join(' / ')+')');}
    // contre-dépouille : rainure en T (fraise 3+2 latérale sous une rainure droite) — invisible d'une carte de hauteurs
    {const D=faoDexCreate(S,p);
     faoEngCarve(D,{x:0,y:20,z:12},{x:60,y:20,z:12},2,0,null,null);        // rainure Ø4 de Z12 à Z20
     faoEngCarve(D,{x:30,y:5,z:8},{x:30,y:35,z:8},2,0,null,[1,0,0]);         // outil couché (axe +X) le long de Y, pointe X30
     const Lz=D.L[2],nx=D.n[0],i=Math.round(45/p-0.5),j=Math.round(20/p-0.5),ray=Lz[j*nx+i];
     const ok=ray.length===4&&Math.abs(ray[0])<1e-6&&Math.abs(ray[1]-6)<0.05&&Math.abs(ray[2]-10)<0.05&&Math.abs(ray[3]-12)<0.05;
     att(ok,'5 : contre-dépouille : le rayon Z à X45 Y20 garde la matière AU-DESSUS du vide (0–6, vide, 10–12) '+JSON.stringify(ray.map(v=>+v.toFixed(2))));}
    const sd=run(()=>faoSdfCreate(S,0.3),D=>faoSdfVolume(D));
    att(rel(sd.flat,flat)<0.01,'6 : distance, rainure plate : '+sd.flat.toFixed(1)+' (attendu '+flat.toFixed(1)+')');
    att(rel(sd.ball,ball)<0.01,'7 : distance, rainure boule : '+sd.ball.toFixed(1)+' (attendu '+ball.toFixed(1)+')');
    att(rel(sd.drill,drill)<0.01,'8 : distance, perçage 3+2 : '+sd.drill.toFixed(1)+' (attendu '+drill.toFixed(1)+')');
    att(rel(dx.ramp,sd.ramp)<0.01,'9 : rampe : tri-dexel et distance d’accord ('+dx.ramp.toFixed(0)+' / '+sd.ramp.toFixed(0)+')');
    // outil OBLIQUE (45° dans XZ) : chemin échantillonné, les deux moteurs d'accord ; outil couché −Y (sens négatif)
    {const A=[Math.SQRT1_2,0,Math.SQRT1_2];
     const D1=faoDexCreate(S,p),D2=faoSdfCreate(S,0.3);
     [D1,D2].forEach(D=>{faoEngCarve(D,{x:20,y:20,z:10},{x:20,y:20,z:10},3,0,null,A);faoEngCarve(D,{x:20,y:20,z:10},{x:40,y:20,z:10},3,0,null,A);});
     const v1=faoDexVolume(D1,2),v2=faoSdfVolume(D2);
     att(rel(v1,v2)<0.01&&v1<V0-500,'10b : outil oblique 45° : tri-dexel '+v1.toFixed(0)+' / distance '+v2.toFixed(0));
     const D3=faoDexCreate(S,p);faoEngCarve(D3,{x:30,y:10,z:10},{x:30,y:10,z:10},3,0,null,[0,-1,0]); // pointe Y10, corps vers −Y
     att(rel(faoDexVolume(D3,2),V0-Math.PI*9*10)<0.01,'10c : outil couché vers −Y (perçage par la face Y0, 10 mm) : '+faoDexVolume(D3,2).toFixed(1));}
    // surface nets : maillage fermé du brut plein, sommets sur les faces
    {const D=faoSdfCreate({x0:0,y0:0,z0:0,x1:10,y1:8,z1:6},0.5);let tri=0,bad=0;
     for(let c=0;c<D.nch[2];c++)for(let b=0;b<D.nch[1];b++)for(let a=0;a<D.nch[0];a++){const m=faoSdfChunk(D,a,b,c);tri+=m.idx.length/3;
       for(let i=0;i<m.pos.length;i+=3){const x=m.pos[i],y=m.pos[i+1],z=m.pos[i+2];const dIn=Math.min(x,10-x,y,8-y,z,6-z);if(Math.abs(dIn)>0.5)bad++;}}
     att(tri>0&&bad===0,'10 : surface du brut : '+tri+' triangles, tous les sommets sur les faces');}
    // outil : profil
    {const T=faoEngTool(5,5,null);att(Math.abs(T.hmin(5)-5)<1e-9&&Math.abs(T.rmax(5)-5)<1e-9&&Math.abs(T.rmax(1)-3)<1e-2&&T.rmax(-0.1)===-1,'11 : profil d’une fraise boule R5 (hmin, rmax)');}
    // sélection du moteur
    faoEngineSet('dexel');att(faoSimEngine==='dexel'&&faoEngWanted(),'12 : moteur tri-dexel choisi');
    faoEngineSet('cartes');att(!faoEngWanted(),'13 : retour aux cartes');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.7 : moteurs tri-dexel et champ de distance ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
