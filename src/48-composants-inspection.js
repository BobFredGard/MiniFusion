/* ---------- inspection : interférences, propriétés physiques (V0.6.6) ----------
   Sur le composant actif et tout ce qu'il contient (ou la pièce seule) :
     · formes EXACTES de chaque composant (copiées après son rejeu, gardées tant que son
       empreinte ne change pas — c._exact), placées par instance (gp_Trsf) ;
     · propriétés physiques : volume, masse (matière du composant : doc.mat {name, rho g/cm³}),
       centre de gravité, par corps et au total ;
     · interférences : entre deux corps distincts (même pièce ou composants différents), boîtes
       englobantes d'abord, puis intersection exacte (BRepAlgoAPI_Common) : volume commun, montré
       en rouge dans la vue. */
let asmInspect=null; // {items, inter, total, com, at}
const ASM_MATS=[['Acier',7.85],['Inox',7.93],['Aluminium',2.70],['Laiton',8.50],['Bronze',8.80],['Cuivre',8.96],['Fonte',7.20],
  ['Titane',4.43],['PLA',1.24],['ABS',1.04],['PETG',1.27],['Nylon (PA)',1.14],['POM',1.41],['Bois (chêne)',0.75]];
function asmMatOf(c){const m=c&&c.doc&&c.doc.mat;return m&&m.rho>0?m:{name:'Acier',rho:7.85};}
function asmTrsf(F){
  const t=new occt.gp_Trsf_1();
  t.SetValues(F.x[0],F.y[0],F.z[0],F.o[0], F.x[1],F.y[1],F.z[1],F.o[1], F.x[2],F.y[2],F.z[2],F.o[2]);
  return t;
}
function asmPlaced(sh,F){
  const t=asmTrsf(F),b=new occt.BRepBuilderAPI_Transform_2(sh,t,true),s=b.Shape();
  try{b.delete();}catch(e){}try{t.delete();}catch(e){}
  return s;
}
function asmVolCom(sh){
  // → {v (mm³), c [x,y,z]} (BRepGProp)
  const G=new occt.GProp_GProps_1();
  try{
    occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);
    const p=G.CentreOfMass(),r={v:G.Mass(),c:[p.X(),p.Y(),p.Z()]};
    try{p.delete();}catch(e){}
    return r;
  }finally{try{G.delete();}catch(e){}}
}
function asmBox(sh){
  // Boîte englobante (sommets des arêtes discrétisées) — tri avant l'intersection exacte
  const b={min:[1e18,1e18,1e18],max:[-1e18,-1e18,-1e18]};
  try{occListEdges(sh).forEach(e=>(e.pts||[]).forEach(p=>{for(let i=0;i<3;i++){b.min[i]=Math.min(b.min[i],p[i]);b.max[i]=Math.max(b.max[i],p[i]);}}));}catch(e){}
  return b;
}
function asmBoxHit(a,b,tol){return [0,1,2].every(i=>a.min[i]<=b.max[i]+tol&&b.min[i]<=a.max[i]+tol);}
function asmExactFree(c){if(c&&c._exact){(c._exact.list||[]).forEach(x=>{try{x.shape.delete();}catch(e){}});c._exact=null;}}
function asmExactActive(){
  // Corps exacts du composant actif (copies), d'un rejeu frais : les solides affichés peuvent
  // avoir été remplacés entre-temps (un rejeu libère les précédents)
  const out=[];let FR=null;
  try{
    FR=occFinalShape(null);
    (FR.perBody||[]).forEach(pb=>{
      if(!pb||!pb.shape||(doc.bodyVis&&doc.bodyVis[pb.bodyId]===false))return;
      const e=(doc.bodies||[]).find(x=>x.id===pb.bodyId);
      const s=occShapeCopy(pb.shape);if(s)out.push({id:pb.bodyId,name:(e&&e.name)||pb.bodyId,shape:s});
    });
  }catch(e){}
  try{occCleanup(FR,null);}catch(e){}
  return out;
}
function asmExactCollect(cids){
  // Formes exactes des composants demandés : copies en cache, sinon rejeu (activation) puis
  // retour au composant actif. → Map cid → [{id,name,shape}]
  const out=new Map();
  const back=asm.active,backPath=asm.path.slice();
  const ok=c=>c._exact&&c._snap&&c._exact.hash===c._snap.hash&&!c._stale;
  let moved=false;
  asmBuilding=true;
  try{
    cids.forEach(id=>{
      const c=asmComp(id);if(!c)return;
      if(!ok(c)){
        asmExactFree(c);
        // composant actif : son rejeu courant fait foi ; les autres sont activés (rejoués)
        if(c.id!==asm.active){asmActivate(c.id);moved=true;}
        c._exact={hash:c._snap?c._snap.hash:'',list:asmExactActive()};
      }
      out.set(id,c._exact.list);
    });
    if(moved)asmActivate(back,backPath);
  }finally{asmBuilding=false;}
  return out;
}
function asmInspectRun(){
  // Inspection du composant actif (et de son contenu) → asmInspect, ou null (pas de noyau exact)
  if(!(typeof occHas==='function'&&occHas()))return null;
  asmEnsure();
  const base=asmActiveComp();
  const hidden=path=>{let c=base;for(const id of path){const o=c&&c.occ.find(q=>q.id===id);if(!o||o.visible===false)return true;c=asmComp(o.comp);}return false;};
  const inst=asmInstances(base.id).filter(i=>!hidden(i.path));
  const ex=asmExactCollect([...new Set(inst.map(i=>i.comp))]);
  const name=path=>{const n=[];let c=base;path.forEach(id=>{const o=c.occ.find(q=>q.id===id);n.push(o.name);c=asmComp(o.comp);});return n.join(' › ');};
  const items=[];
  inst.forEach((I,k)=>{
    const c=asmComp(I.comp),m=asmMatOf(c);
    (ex.get(I.comp)||[]).forEach(b=>{
      const s=asmPlaced(b.shape,I.F),vc=asmVolCom(s);
      items.push({inst:k,path:I.path,comp:c.id,label:(I.path.length?name(I.path)+' › ':'')+b.name,body:b.name,mat:m.name,rho:m.rho,
        v:vc.v,mass:vc.v*m.rho/1000,c:vc.c,shape:s,box:asmBox(s)});
    });
  });
  const M=items.reduce((a,x)=>a+x.mass,0);
  const com=M>0?[0,1,2].map(i=>items.reduce((a,x)=>a+x.mass*x.c[i],0)/M):[0,0,0];
  const inter=[];
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
    const A=items[i],B=items[j];
    if(!asmBoxHit(A.box,B.box,1e-6))continue;
    let s=null;
    try{
      s=occCommon(A.shape,B.shape);
      const v=asmVolCom(s).v;
      if(v>1e-3){let geo=null;try{geo=occTessellate(s,0.3,0.3);}catch(e){}inter.push({a:A.label,b:B.label,v,geo});}
    }catch(e){}
    try{if(s)s.delete();}catch(e){}
  }
  items.forEach(x=>{try{x.shape.delete();}catch(e){}delete x.shape;});
  asmInspectClear();
  asmInspect={items,inter,total:{v:items.reduce((a,x)=>a+x.v,0),mass:M},com,comp:base.id,at:Date.now()};
  try{asmInspectDraw();}catch(e){}
  return asmInspect;
}
function asmInspectClear(){
  if(asmInspect)(asmInspect.inter||[]).forEach(x=>{try{x.geo&&x.geo.dispose();}catch(e){}});
  asmInspect=null;
  try{const S=asmSceneGet(),G=S.getObjectByName('asmInspect');if(G){S.remove(G);}}catch(e){}
  try{const G=scene.getObjectByName('asmInspect');if(G)scene.remove(G);}catch(e){}
}
function asmInspectDraw(){
  // Volumes en interférence (rouge) et centre de gravité (sphère), dans la scène affichée
  const S=asmMode==='asm'?asmSceneGet():scene;
  let G=S.getObjectByName('asmInspect');if(G)S.remove(G);
  if(!asmInspect)return;
  G=new THREE.Group();G.name='asmInspect';
  asmInspect.inter.forEach(x=>{if(!x.geo)return;
    const m=new THREE.Mesh(x.geo,new THREE.MeshBasicMaterial({color:0xff3b30,transparent:true,opacity:0.85,depthTest:false}));
    m.renderOrder=998;m.raycast=()=>{};G.add(m);});
  if(asmInspect.total.mass>0){
    const s=new THREE.Mesh(new THREE.SphereGeometry(1.5,16,12),new THREE.MeshBasicMaterial({color:0xffd60a,depthTest:false}));
    s.position.set(...asmInspect.com);s.renderOrder=999;s.raycast=()=>{};G.add(s);
  }
  S.add(G);
}
function asmCmdInspect(){
  if(typeof skEdit!=='undefined'&&skEdit){try{faceEl.textContent='Fermez d’abord l’esquisse.';}catch(e){}return;}
  if(!(typeof occHas==='function'&&occHas())){alert('L’inspection demande le noyau exact (OCCT), pas encore prêt.');return;}
  try{faceEl.textContent='Inspection : formes exactes, masses, interférences…';}catch(e){}
  const r=asmInspectRun();
  if(!r)return;
  try{renderProps();}catch(e){}
  try{faceEl.textContent='Inspection : '+r.items.length+' corps, '+asmFmt(r.total.mass/1000,3)+' kg, '+(r.inter.length?r.inter.length+' interférence(s) (en rouge)':'aucune interférence')+'.';}catch(e){}
}
function asmFmt(v,d){return (+v).toFixed(d==null?2:d).replace('.',',');}
function asmInspectProps(p){
  // Panneau des résultats (remplace celui du composant tant qu'il est ouvert)
  const R=asmInspect;if(!R)return false;
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  p.appendChild(mk('div','pnl-h','🔍 Inspection'));
  p.appendChild(mk('div','pnl-h','⚖ Propriétés physiques'));
  const tb=document.createElement('table');tb.style.cssText='width:100%;font-size:.7rem;border-collapse:collapse';
  tb.innerHTML='<tr style="color:var(--muted)"><td>Corps</td><td>Matière</td><td style="text-align:right">cm³</td><td style="text-align:right">g</td></tr>';
  R.items.forEach(x=>{const tr=document.createElement('tr');
    tr.innerHTML='<td>'+asmEsc(x.label)+'</td><td>'+asmEsc(x.mat)+'</td><td style="text-align:right">'+asmFmt(x.v/1000,2)+'</td><td style="text-align:right">'+asmFmt(x.mass,1)+'</td>';tb.appendChild(tr);});
  p.appendChild(tb);
  p.appendChild(mk('div','pnl-note','Total : '+asmFmt(R.total.v/1000,2)+' cm³ · '+asmFmt(R.total.mass/1000,3)+' kg · centre de gravité ('+R.com.map(v=>asmFmt(v,2)).join(' ; ')+') mm (sphère jaune)'));
  // matière par composant
  const comps=[...new Set(R.items.map(x=>x.comp))];
  comps.forEach(cid=>{
    const c=asmComp(cid),m=asmMatOf(c);
    const s=document.createElement('select');
    ASM_MATS.forEach(([n,r])=>{const o=document.createElement('option');o.value=n;o.textContent=n+' ('+asmFmt(r,2)+' g/cm³)';if(n===m.name)o.selected=true;s.appendChild(o);});
    s.onchange=()=>{const e=ASM_MATS.find(x=>x[0]===s.value);asmPush('matière de « '+c.name+' »',[c.id]);c.doc.mat={name:e[0],rho:e[1]};
      try{dirty=true;autosave();}catch(err){}asmInspectRun();renderProps();};
    const r=mk('div','pnl-row');r.appendChild(mk('label',null,'Matière · '+c.name));r.appendChild(s);p.appendChild(r);
  });
  p.appendChild(mk('div','pnl-h','⚠ Interférences ('+R.inter.length+')'));
  if(!R.inter.length)p.appendChild(mk('div','pnl-note','Aucun volume commun entre deux corps.'));
  R.inter.forEach(x=>p.appendChild(mk('div','pnl-note','🟥 '+x.a+' ∩ '+x.b+' : '+asmFmt(x.v,2)+' mm³')));
  const b=mk('div','pnl-btns');
  const re=mk('button','primary','↻ Relancer');re.onclick=()=>{asmCmdInspect();};b.appendChild(re);
  const cl=mk('button',null,'Fermer');cl.onclick=()=>{asmInspectClear();renderProps();};b.appendChild(cl);
  p.appendChild(b);
  return true;
}
