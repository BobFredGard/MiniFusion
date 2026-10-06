// FAO — entrées hélice : départ 2 mm au-dessus de la MATIÈRE (dans le vide)
// et jeu latéral de 2 mm au contour. Couvre la constante de jeu, la règle
// de disque, l'entrée hélice (faoHelixEntry) et le garde-fou anti-plongée de
// l'ébauche 3D (rough3d).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);

    // --- 1. constante de jeu
    A(faoHelixJeu===2,'faoHelixJeu = 2 mm (vu '+faoHelixJeu+')');

    // --- 2. la règle de disque honore bien une marge supplémentaire de 2 mm
    // boîte 0..10 : le mur utile est x=10 ; outil r=3 -> marge 3, avec jeu -> 5
    const box={v:[[0,0,0],[10,0,0],[10,10,0],[0,10,0],[0,0,10],[10,0,10],[10,10,10],[0,10,10]],
               t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],
                  [0,4,7],[0,7,3],[1,2,6],[1,6,5]]};
    const segs=faoSliceZ(box,5);
    A(faoDiscClear(segs,13.5,5,0,3)===true,'disque : 3,5 du mur, marge 3 -> autorisé');
    A(faoDiscClear(segs,13.5,5,0,5)===false,'disque : 3,5 du mur, marge 5 (jeu 2) -> refusé');
    A(faoDiscClear(segs,15.5,5,0,5)===true,'disque : 5,5 du mur, marge 5 -> autorisé');
    A(faoDiscClear(segs,5,5,0,6)===false,'disque : centre a 5 du mur, marge 6 -> refusé');
    A(faoDiscClear(segs,20,5,0,5)===true,'disque : dehors et loin -> autorisé');

    // --- 3. entrée hélice (faoHelixEntry) : rapide de départ en l'air, pas
    //        vertical ≤ 0.1*D (anti-plongée), rayon constant, fin exacte à zTo.
    const HE=faoHelixEntry(50,40,62,10,10,25);
    A(HE.length>20,'helice : '+HE.length+' moves');
    A(HE[0].r===1&&Math.abs(HE[0].z-62)<1e-9&&Math.abs(HE[0].x-60)<1e-9,
      'helice : rapide de depart a zFrom=62, rayon 10 (dans le vide)');
    A(HE.filter(function(m){return m.r;}).length===1,'helice : un seul rapide (le depart)');
    const HC=HE.filter(function(m){return !m.r;});
    A(HC.length>10&&HC.every(function(m){return m.z>=10-1e-9;}),'helice : rien sous zTo=10');
    A(Math.abs(HC[HC.length-1].z-10)<1e-9,'helice : fin exacte a zTo=10 (palier de fond)');
    A(HC.every(function(m){return Math.abs(Math.hypot(m.x-50,m.y-40)-10)<1e-6;}),
      'helice : rayon constant 10 mm');
    let pas=0;
    for(let i=1;i<HC.length;i++){const dz=HC[i-1].z-HC[i].z; if(dz>pas)pas=dz;}
    A(pas<=2.5+1e-9,'helice : pas vertical max '+pas.toFixed(3)+' <= 0.1*D = 2.5 mm');

    // --- 4. ébauche 3D : la micro-hélice de secours ne doit jamais conduire
    //        à une plongée dans la matière (fente ~D entre deux plots)
    const mkBox=function(x0,x1,y0,y1,z0,z1){
      return {v:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],
              t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],
                 [0,4,7],[0,7,3],[1,2,6],[1,6,5]]};
    };
    const merge=function(A2,B){const off=A2.v.length;
      return {v:A2.v.concat(B.v),t:A2.t.concat(B.t.map(function(t){return [t[0]+off,t[1]+off,t[2]+off];}))};};
    const NS=merge(mkBox(0,44,0,60,0,40),mkBox(56,100,0,60,0,40));
    const blkD=function(px,py,x0,x1,y0,y1){
      const dx=Math.max(x0-px,0,px-x1), dy=Math.max(y0-py,0,py-y1); return Math.hypot(dx,dy);};
    const an=faoGenRough3D(NS,{x0:-5,y0:-5,x1:105,y1:65},40,30,
      {ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45,strategy:'adaptive'});
    const coups=an.filter(m=>!m.r);
    A(an.length>10&&an[0].r===1,'ébauche 3D fente : '+an.length+' moves, 1er rapide');
    const pire=Math.min.apply(null,coups.map(m=>Math.min(
      blkD(m.x,m.y,0,44,0,60),blkD(m.x,m.y,56,100,0,60))));
    A(pire>=4.98,'ébauche 3D fente : jeu outil minimum '+pire.toFixed(3)+' mm (>= r-0,02)');
    A(coups.every(m=>m.z<=40+1e-9),'ébauche 3D fente : rien au-dessus du brut');
    const zMinRap=Math.min.apply(null,an.filter(m=>m.r).map(m=>m.z));
    A(zMinRap>=40,'ébauche 3D fente : rapides jamais sous le brut (min '+zMinRap+')');

    // --- 5. ébauche 3D (canal) : même garde-fou sur deux plots
    const CN=merge(mkBox(0,20,0,60,0,40),mkBox(80,100,0,60,0,40));
    const rm=faoGenRough3D(CN,{x0:-5,y0:-5,x1:105,y1:65},40,0,
      {ap:10,ae:6,toolD:10,radial:0,axial:0,secu:45});
    const pire2=Math.min.apply(null,rm.filter(m=>!m.r).map(m=>Math.min(
      blkD(m.x,m.y,0,20,0,60),blkD(m.x,m.y,80,100,0,60))));
    A(pire2>=4.99,'ébauche 3D canal : jeu outil minimum '+pire2.toFixed(3)+' mm (>= r)');

    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
