/* ----- bibliothèque d'outils : Vc/fz -> S/F ----- */
function faoRapide(job){
  // Vitesse des G0 du posage (mm/min) — défaut machine 5000.
  return (job&&isFinite(+job.rapide)&&+job.rapide>0)?+job.rapide:5000;
}
function faoPlungePct(job){
  // % de l'avance de coupe appliqué à la plongée (défaut 30).
  return (job&&isFinite(+job.plungePct)&&+job.plungePct>0)?Math.min(100,+job.plungePct):30;
}
function faoAccel(job){
  // Accélération machine (mm/s²) — défaut 1000. Sert au temps rapide réel.
  return (job&&isFinite(+job.accel)&&+job.accel>0)?+job.accel:1000;
}
function faoToolChg(job){
  // Durée d'un changement d'outil (s) — défaut 30, ajoutée à chaque changement.
  return (job&&isFinite(+job.toolChg)&&+job.toolChg>=0)?+job.toolChg:30;
}
function faoOrient(job){
  // Indexation 3+2 du posage : B = bascule autour de Y, C = rotation autour de Z
  // (cinématique table C + B). {0,0} = usinage 3 axes strictement inchangé.
  const o=(job&&job.orient)||{};
  const b=isFinite(+o.b)?+o.b:0, c=isFinite(+o.c)?+o.c:0;
  return {b:Math.round(b*1000)/1000, c:Math.round(c*1000)/1000};
}
function faoOrientOn(job){ const o=faoOrient(job); return o.b!==0||o.c!==0; }
function faoOrientFromNormal(nx,ny,nz){
  // Normale de face cliquée (repère pièce) -> angles d'indexation table C+B.
  // Chaîne cinématique : M = Ry(B)·Rz(C) applique la normale à (0,0,1) (outil
  // vertical). Règle de la main droite ; B ∈ [−90,0] pour une face sortante
  // ascendante — l'utilisateur ajuste les signes si sa machine diffère.
  const l=Math.hypot(+nx,+ny,+nz)||1;
  nx=+nx/l; ny=+ny/l; nz=+nz/l;
  const r=Math.hypot(nx,ny);
  const rnd=function(v){ return Math.round(v*100)/100; };
  return {
    b:rnd(Math.atan2(-r,nz)*180/Math.PI),
    c:rnd(Math.atan2(-ny,nx)*180/Math.PI),
    down:nz<-1e-6 // face tournée vers le bas : pièce à retourner
  };
}
function faoToolById(job,id){
  const ts=(job&&job.tools)||[];
  for(let i=0;i<ts.length;i++)if(ts[i].id===id)return ts[i];
  if(ts.length)return ts[0];
  return {id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06};
}
function faoToolSF(t,setup){
  // S = Vc*1000/(pi*D) ; F = fz*z*S ; plongée = plungePct % de F (posage, défaut 30 %).
  const D=isFinite(+t.d)&&+t.d>0?+t.d:10;
  const vc=isFinite(+t.vc)&&+t.vc>0?+t.vc:250;
  const fz=isFinite(+t.fz)&&+t.fz>0?+t.fz:0.05;
  const z=isFinite(+t.flutes)&&+t.flutes>0?Math.round(+t.flutes):2;
  const s=Math.max(1,Math.round(vc*1000/(Math.PI*D)));
  // Foret / foret à centrer : avance PAR TOUR (F = f × S), pas par dent.
  // Taraud : F = PAS × S (imposé par le filet) — jamais une avance « au choix ».
  const f=(t&&t.kind==='tap'&&+t.p>0)?Math.max(1,Math.round(+t.p*s))
    :((t&&(t.kind==='drill'||t.kind==='spot'))?Math.max(1,Math.round(faoToolFr(t)*s)):Math.max(1,Math.round(fz*z*s)));
  return {s:s, f:f, plunge:Math.max(1,Math.round(f*faoPlungePct(setup)/100))};
}
function faoKindLabel(k){ return k==='ball'?'Boule':(k==='bull'?'Torique':(k==='drill'?'Foret':(k==='spot'?'Foret à centrer':(k==='tap'?'Taraud':'Cylindrique')))); }
function faoToolEffCr(t){
  // Rayon d'arête ENCORE CHARGEUT (mm) : ball = D/2 plein, bull = cornerR borné
  // à D/2, flat = 0 (bout plat) — la source de vérité de la forme de coupe.
  const D=(t&&isFinite(+t.d)&&+t.d>0)?+t.d:10;
  if(!t||t.kind==='flat')return 0;
  if(t.kind==='ball')return D/2;
  const cr=isFinite(+t.cornerR)?+t.cornerR:0;
  return Math.max(0,Math.min(cr,D/2));
}
function faoToolProfile(kind,cr,D,H){
  // Profil de révolution unitaire pour THREE.LatheGeometry (rayon en unités de D,
  // hauteur 0 = pointe → 1 = corps H mm) : bout plat, torique (arc d'arête cr)
  // ou boule — un seul arc couvre torique ET boule (cr = D/2 → hémisphère).
  // 2026-10-13-001 : l'arc est normalisé par le corps H (et non par D) — le
  // groupe scale y=H, donc arcY=cr/H donne une SPHÈRE VRAIE (cr=D/2 → demi-
  // boule de D/2 mm). Sans H (tests/ancien), défaut H=D : squelette inchangé.
  const dia=(isFinite(+D)&&+D>0)?+D:10;
  const bh=(isFinite(+H)&&+H>0)?+H:dia;
  const q=Math.max(0,Math.min(0.5,(+cr||0)/dia)); // rayon arc en unités D
  if(q<=1e-6)return [[0,0],[0.5,0],[0.5,1]];
  const arcH=(+cr||0)/bh; // hauteur arc en unités H (sphère non étirée)
  const rc=0.5-q, out=[[0,0]];
  if(rc>1e-6)out.push([rc,0]);
  const N=8;
  for(let i=1;i<=N;i++){
    const th=(Math.PI/2)*(i/N);
    out.push([rc+q*Math.sin(th), arcH-arcH*Math.cos(th)]);
  }
  out.push([0.5,1]);
  return out;
}

/* ----- brut : 3 sources — tous les corps (défaut), corps choisi, manuel ----- */
function faoStockValid(s){
  return !!(s&&[s.x0,s.y0,s.z0,s.x1,s.y1,s.z1].every(isFinite)&&s.x1>s.x0&&s.y1>s.y0&&s.z1>s.z0);
}
/* 2026-10-16-018 : FORME du brut — 'box' (boîte, défaut), 'cyl' (cylindre d'axe X, Y ou Z, Ø/longueur
   auto = modèle + marges, ou saisis), 'solid' (le brut EST un corps : pièce brute de fonderie,
   ébauche importée — mode « corps choisi », sans marge). Le brut reste décrit par sa boîte
   englobante (x0..z1, ce que lisent tous les parcours) ; un cylindre y ajoute stock.cyl
   {axis,c:[x,y,z],r} (simulation : colonnes hors du disque vides, vue : cylindre). */
function faoStockShape(job){ const k=job&&job.stockShape; return (k==='cyl'||k==='solid')?k:'box'; }
function faoStockCylFrom(job,a,b,m,mzp,mzm,manual,meshes){
  // a,b = coins du modèle (ou de la boîte manuelle) ; retourne la boîte du cylindre + .cyl
  const ax=(job.cylAxis==='x'||job.cylAxis==='y')?job.cylAxis:'z';
  const I=ax==='x'?0:ax==='y'?1:2, U=(I+1)%3, V=(I+2)%3;
  const A=[a.x,a.y,a.z], B=[b.x,b.y,b.z];
  const c=[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2];
  let r=manual?Math.min(B[U]-A[U],B[V]-A[V])/2:Math.hypot(B[U]-A[U],B[V]-A[V])/2+m;
  // Ø auto : plus grande distance RÉELLE des sommets du modèle à l'axe (une pièce de révolution
  // donne son Ø exact, pas la diagonale de sa boîte)
  if(!manual&&meshes&&meshes.length){
    try{
      let rm=0;const v=new THREE.Vector3();
      meshes.forEach(function(me){
        const pa=me.geometry&&me.geometry.attributes&&me.geometry.attributes.position;if(!pa)return;
        me.updateMatrixWorld(true);
        const Fr=faoFrame(job);
        for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(me.matrixWorld);
          const q=Fr.id?[v.x,v.y,v.z]:faoToF(Fr,[v.x,v.y,v.z]);const d=Math.hypot(q[U]-c[U],q[V]-c[V]);if(d>rm)rm=d;}
      });
      if(rm>0)r=rm+m;
    }catch(e){}
  }
  if(isFinite(+job.cylD)&&+job.cylD>0)r=+job.cylD/2;
  let lo=A[I], hi=B[I];
  if(!manual){ if(I===2){ lo-=mzm; hi+=mzp; } else { lo-=m; hi+=m; } }
  if(isFinite(+job.cylL)&&+job.cylL>0){ // longueur saisie : dessus (Z) ou milieu (X/Y) conservé
    if(I===2)lo=hi-(+job.cylL); else { const mid=(lo+hi)/2; lo=mid-(+job.cylL)/2; hi=mid+(+job.cylL)/2; }
  }
  const lo3=[0,0,0], hi3=[0,0,0];
  lo3[I]=lo; hi3[I]=hi; lo3[U]=c[U]-r; hi3[U]=c[U]+r; lo3[V]=c[V]-r; hi3[V]=c[V]+r;
  const cc=c.slice(); cc[I]=(lo+hi)/2;
  return {x0:lo3[0],y0:lo3[1],z0:lo3[2],x1:hi3[0],y1:hi3[1],z1:hi3[2],cyl:{axis:ax,c:cc,r:r}};
}
function faoStock(){
  const job=faoDoc();
  const shape=faoStockShape(job);
  const mode=shape==='solid'?'body':((job.stockSrc==='body'||job.stockSrc==='manual')?job.stockSrc:'bodies');
  if(mode==='manual'){
    // Boîte saisie à la main : jamais recalculée (repli défaut si invalide).
    if(!faoStockValid(job.stock))job.stock=faoStockDefault();
    const s0=job.stock;
    if(shape==='cyl'){
      const s1=faoStockCylFrom(job,{x:+s0.x0,y:+s0.y0,z:+s0.z0},{x:+s0.x1,y:+s0.y1,z:+s0.z1},0,0,0,true);
      job.stock={x0:s0.x0,y0:s0.y0,z0:s0.z0,x1:s0.x1,y1:s0.y1,z1:s0.z1,cyl:s1.cyl};
    }else if(s0.cyl){ delete s0.cyl; }
    return job.stock;
  }
  let box=null;const meshes=[];
  try{
    if(typeof THREE!=='undefined'&&typeof bodies!=='undefined'&&bodies&&bodies.length){
      box=new THREE.Box3(); let n=0;
      const want=(mode==='body')?job.stockBody:null;
      bodies.forEach(function(b){
        if(!b||b.ghost||!b.mesh)return;
        // Corps choisi : bbox MÊME masqué (le masquage auto ne doit pas figer le
        // brut) ; mode « tous les corps » : corps visibles seulement (historique).
        if(want!=null){ if(b.id!==want)return; }
        else if(b.visible===false)return;
        try{ box.expandByObject(b.mesh); n++; meshes.push(b.mesh); }catch(e){}
      });
      if(!n)box=null;
      else{
        try{ if(box.isEmpty())box=null; }catch(e){ box=null; }
      }
    }
  }catch(e){ box=null; }
  const solid=shape==='solid'; // brut = le corps lui-même : aucune marge
  const m=solid?0:(isFinite(+job.marge)&&+job.marge>=0?+job.marge:5);
  // 2026-10-16-017 : surépaisseurs du brut au-dessus (Z+) et au-dessous (Z−) du modèle (défaut 0)
  const mzp=solid?0:(isFinite(+job.margeZp)&&+job.margeZp>=0?+job.margeZp:0);
  const mzm=solid?0:(isFinite(+job.margeZm)&&+job.margeZm>=0?+job.margeZm:0);
  // 2026-10-16-019 : repère orienté → boîte des corps dans SES coordonnées
  const Fr=faoFrame(job);
  if(box&&!Fr.id&&meshes.length){
    try{ const Bf=faoMeshesBoxF(meshes,Fr); if(Bf){ box.min.set(Bf.x0,Bf.y0,Bf.z0); box.max.set(Bf.x1,Bf.y1,Bf.z1); } }catch(e){}
  }
  if(box){
    try{
      const a=box.min,b=box.max;
      if([a.x,a.y,a.z,b.x,b.y,b.z].every(isFinite)&&b.x>a.x&&b.y>a.y&&b.z>a.z){
        if(shape==='cyl'){ job.stock=faoStockCylFrom(job,a,b,m,mzp,mzm,false,meshes); return job.stock; }
        job.stock={x0:a.x-m, y0:a.y-m, z0:a.z-mzm, x1:b.x+m, y1:b.y+m, z1:b.z+mzp};
        if(solid)job.stock.solid=job.stockBody;
        return job.stock;
      }
    }catch(e){}
  }
  // Repli : brut mémorisé s'il est valide (corps choisi introuvable…), sinon défaut.
  if(faoStockValid(job.stock))return job.stock;
  job.stock=faoStockDefault();
  return job.stock;
}

/* ----- corps-brut : désignation (fiche posage, liste « Source ») + masquage auto ----- */
// Dès qu'un corps est CHOISI comme brut (mode « corps choisi »), il devient
// invisible dans la vue — via doc.bodyVis[id]=false (le corps RESTE dans
// `bodies`, mesh présent : la bbox du brut suit sa géométrie, seule sa vue est
// off). L'œil 👁 de l'en-tête corps dans l'arbre le re-rend visible
// (bodyToggleVis = vue seule, ça ne change rien au rejeu). On ne défait QUE ce
// qu'on a fait : si le corps était déjà masqué avant le choix, il le reste après
// le retrait (stockBodyHid).
function faoStockBodyRestore(setup){
  setup=setup||faoSetup();
  const id=setup.stockBody;
  if(id!=null&&setup.stockBodyHid){
    try{doc.bodyVis=doc.bodyVis||{};delete doc.bodyVis[id];}catch(e){}
    try{
      const bl=(typeof bodies!=='undefined'&&bodies)?bodies:[];
      bl.forEach(function(b){ if(b&&b.id===id){ b.visible=true; if(b.mesh)b.mesh.visible=true; } });
    }catch(e){}
    try{markDirty();}catch(e){}
  }
  setup.stockBodyHid=false;
}
function faoStockBodyHide_(setup,id){
  try{
    const bl=(typeof bodies!=='undefined'&&bodies)?bodies:[];
    const bd=bl.filter(function(b){return b&&b.id===id;})[0];
    if(!bd||bd.visible===false){ setup.stockBodyHid=false; return; } // absent/déjà masqué : pas à nous
    const others=bl.filter(function(b){return b&&!b.ghost&&b.id!==id&&b.visible!==false&&b.mesh;});
    if(!others.length){ setup.stockBodyHid=false; return; } // seul corps visible : ne JAMAIS vider la vue
    doc.bodyVis=doc.bodyVis||{}; doc.bodyVis[id]=false;
    bd.visible=false; if(bd.mesh)bd.mesh.visible=false;
    setup.stockBodyHid=true;
    markDirty();
  }catch(e){ setup.stockBodyHid=false; }
}
function faoStockBodySet(bodyId,setup){
  // Désigne (bodyId) ou retire (null) le corps-brut — depuis la fiche posage
  // (selects « Source » / « Brut = »). Effet : masquage/restauration en vue 3D + mode.
  setup=setup||faoSetup();
  try{ faoSnapshot('corps choisi comme brut'); }catch(e){}
  const prev=(setup.stockSrc==='body'&&setup.stockBody!=null)?setup.stockBody:null;
  const same=(prev!=null&&prev===bodyId);
  if(!same)faoStockBodyRestore(setup);
  if(bodyId==null||bodyId===''){
    if(setup.stockSrc==='body')setup.stockSrc='bodies';
    delete setup.stockBody;
    setup.stockBodyHid=false;
  }else{
    setup.stockSrc='body';
    setup.stockBody=bodyId;
    if(!same)faoStockBodyHide_(setup,bodyId);
  }
  try{ faoChanged(); }catch(e){}
}
