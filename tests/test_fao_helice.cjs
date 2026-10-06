// FAO — entrées hélice : départ 2 mm au-dessus de la MATIÈRE (dans le vide)
// et jeu latéral de 2 mm au contour. Couvre la constante de jeu, la règle
// de disque, le débourrage (pocket3d) et le garde-fou anti-plongée de
// l'ébauche 3D (rough3d).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);

    // Détection d'hélice : centre = point suivi d'une série de points à
    // distance constante (rayon) de lui, Z non croissant (faoHelixEntry).
    const helOf=function(mv,D){
      const hel=[];
      for(let i=0;i+2<mv.length;i++){
        const c=mv[i];
        if(c.r)continue;
        let hr=-1, ok=false, lastZ=c.z, cnt=0;
        for(let j=1;j<600&&i+j<mv.length;j++){
          const m=mv[i+j];
          if(m.r)break;
          const d=Math.hypot(m.x-c.x,m.y-c.y);
          if(hr<0){ if(!(d>0.5&&d<D*0.6))break; hr=d; ok=true; }
          else if(Math.abs(d-hr)>0.6)break;
          if(j>1&&m.z>c.z+1e-9)break;
          lastZ=m.z; cnt++;
        }
        // une vraie helice d'entree : >= 6 points ET >= 1 mm de descente
        if(ok&&cnt>=6&&(c.z-lastZ)>=1){ hel.push({z0:c.z,zLvl:lastZ,hr:hr}); i+=20; }
      }
      return hel;
    };

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

    // --- 3. débourrage (pocket3d) : départ de la 1re hélice à zTop+2
    const job=faoDefaultJob(); job.name='HELIX';
    job.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:60};
    job.ops=[{type:'pocket3d',x0:10,y0:10,x1:90,y1:70,ztop:60,zbot:10,ap:8,ae:6,tour:2}];
    const D=(job.tools[0]&&job.tools[0].d)||10;
    const mv=faoOpMoves(job.ops[0],job);
    const hel=helOf(mv,D);
    A(hel.length>=4,'débourrage : '+hel.length+' hélices détectées (D'+D+')');
    if(hel.length){
      A(Math.abs(hel[0].z0-62)<1e-9,'débourrage : 1re hélice démarre à zTop+2 = 62 (vu '+
        hel[0].z0.toFixed(3)+')');
      A(hel.every(h=>h.z0>=h.zLvl+2-1e-9),
        'débourrage : chaque hélice démarre à >= niveau+2 (min '+
        Math.min.apply(null,hel.map(h=>h.z0-h.zLvl)).toFixed(3)+' mm)');
      A(hel.every(h=>h.z0>h.zLvl+1e-9),'débourrage : aucun départ au niveau de coupe');
      A(hel.every(h=>h.hr>0.5&&h.hr<=D*0.6),'débourrage : rayon helice plausible');
    }
    // jamais de point de coupe sous zBot, rapides toujours au secu
    const SEC=(isFinite(+job.secu)&&+job.secu>0)?+job.secu:50;A(mv.filter(m=>m.r).every(m=>m.z>=SEC-1e-9),'débourrage : rapides a la securite '+SEC);
    A(mv.filter(m=>!m.r).every(m=>m.z>=job.ops[0].zbot-1e-9),'débourrage : rien sous le fond');

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
