/* ---------- apparence en mode Placer (V0.7.3) ----------
   Le mode Placer dessine les instantanés des composants (47). Ils gardent désormais leurs
   ARÊTES (vives noires, tangentes grises — les mêmes que l'overlay du mode Modéliser, lues sur
   la forme exacte au moment de la capture), affichées quand le bouton « Arêtes » est actif.
   APPARENCE PAR OCCURRENCE, propre au mode Placer (le mode Modéliser n'en tient pas compte) :
   o.look = {op (« Intensité » 0,15…1), gl (« Transparence » 0,1…1), edges ('on' | 'off' ; absent
   = comme le bouton « Arêtes »)} — les réglages d'un corps (bodyStyleField), rendus de la même
   façon (setMatAlpha, passes de verre glassDepthMask, voile des arêtes arrière). La COULEUR reste
   celle des corps, la même dans tous les modes. Sans réglage, chaque corps garde ceux de sa fiche. Elle vaut pour l'occurrence et tout ce
   qu'elle contient ; l'occurrence la plus profonde qui en a une l'emporte. Enregistrée avec
   l'assemblage, annulable. */
function asmEdgeGeo(data){
  // Polylignes {pts, sharp} → segments colorés (même code couleur que l'overlay de la pièce)
  const {pos,col}=asmEdgeArrays(data);
  if(!pos.length)return null;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  return g;
}
function asmEdgeArrays(data){
  const pos=[],col=[];
  (data||[]).forEach(d=>{const pts=d&&d.pts;if(!pts||pts.length<2)return;
    const c=d.sharp?[0.02,0.02,0.025]:[0x9a/255,0x9f/255,0xa6/255];
    const M=(d.mw&&d.mw.elements)||null;
    const put=p=>{let x=+p[0],y=+p[1],z=+p[2];
      if(M){const X=x,Y=y,Z=z;x=M[0]*X+M[4]*Y+M[8]*Z+M[12];y=M[1]*X+M[5]*Y+M[9]*Z+M[13];z=M[2]*X+M[6]*Y+M[10]*Z+M[14];}
      pos.push(x,y,z);col.push(c[0],c[1],c[2]);};
    for(let i=0;i+1<pts.length;i++){put(pts[i]);put(pts[i+1]);}
  });
  return {pos,col};
}
function asmEdgeCapture(){
  // Arêtes du composant actif à la fin de son rejeu, que le bouton « Arêtes » soit actif ou non
  const em=edgeMode;let d=[];
  try{edgeMode='on';d=edgeOverlayData();}catch(e){d=[];}finally{edgeMode=em;}
  try{return asmEdgeGeo(d);}catch(e){return null;}
}
function asmLookNorm(l){
  // Apparence relue d'un fichier : champs valides seulement ; null si vide
  if(!l||typeof l!=='object')return null;
  const o={};
  if(isFinite(+l.op)&&+l.op>=0.15&&+l.op<1)o.op=+(+l.op).toFixed(3); // « Intensité » (setBodyOp)
  if(isFinite(+l.gl)&&+l.gl>=0.1&&+l.gl<1)o.gl=+(+l.gl).toFixed(3); // « Transparence » (setBodyGlass)
  if(l.edges==='on'||l.edges==='off')o.edges=l.edges;
  return Object.keys(o).length?o:null;
}
function asmLookOf(path){
  // Apparence d'une instance (chemin absolu) : champ par champ, l'occurrence la plus profonde gagne
  const out={};let c=asmRoot();
  for(const id of (path||[])){
    const o=c&&c.occ.find(q=>q.id===id);if(!o)break;
    if(o.look)Object.assign(out,o.look);
    c=asmComp(o.comp);
  }
  return out;
}
function asmEdgesShown(look){return look.edges==='on'||(look.edges!=='off'&&edgeMode==='on');}
function asmEdgeLines(geo,glass){
  // Arêtes d'une instance, comme l'overlay de la pièce (buildEdgeOverlay) : traits nets devant
  // les faces ; avec une pièce en TRANSPARENCE, le voile gris des arêtes arrière en plus
  const G=new THREE.Group();G.userData.asmEdges=true;
  if(glass){const veil=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x7d828a,transparent:true,opacity:0.9,depthTest:true,depthWrite:false}));
    veil.raycast=()=>{};veil.renderOrder=0.5;G.add(veil);}
  const net=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false}));
  net.raycast=()=>{};net.renderOrder=990;G.add(net);
  return G;
}
function asmLookMat(it,look,on){
  // Matière d'un corps d'instance en mode Placer : couleur du corps ; « Intensité » et
  // « Transparence » de l'occurrence, sinon celles du corps — setMatAlpha (même rendu que la pièce)
  const mat=new THREE.MeshStandardMaterial({color:it.color,metalness:.35,roughness:.4,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  setMatAlpha(mat,look.op!=null?look.op:(it.op||1),look.gl!=null?look.gl:(it.gl||1));
  if(on&&mat.emissive){mat.emissive.setHex(ASM_SEL_COL);mat.emissiveIntensity=0.35;}
  return mat;
}
function asmSetLook(o,patch,label,live){
  // Modifie l'apparence d'une occurrence (objet neuf : l'annulation garde l'ancien). live :
  // pendant le glisser d'un curseur — une seule étape d'annulation, la vue seule est redessinée
  if(!o._lookDrag){asmPush(label||'apparence');if(live)o._lookDrag=true;}
  const l=Object.assign({},o.look||{},patch);
  Object.keys(l).forEach(k=>{if(l[k]==null)delete l[k];});
  o.look=asmLookNorm(l);
  if(live){try{asmDraw();}catch(e){}return;}
  delete o._lookDrag;
  asmNotify();
}
function asmLookProps(p,o){
  // Section « Apparence (mode Placer) » : les réglages du corps (bodyStyleField) « Intensité » et
  // « Transparence », plus les arêtes, pour cette occurrence (la couleur reste celle des corps)
  const mk=(tag,cls,txt)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(txt!=null)d.textContent=txt;return d;};
  const c=asmComp(o.comp),L=o.look||{},it0=(c&&c._snap&&c._snap.items[0])||{};
  p.appendChild(mk('div','pnl-h','Apparence (mode Placer)'));
  const holder=document.createElement('div');holder.className='col';
  // intensité / transparence : mêmes bornes et mêmes effets que pour un corps
  const slider=(title,cls,min,max,val,tip,fn)=>{
    const row=mk('div','skrow');const l=mk('label',null,title);l.style.flex='1';
    const r=document.createElement('input');r.type='range';r.min=String(min);r.max=String(max);r.step='1';r.value=String(val);r.style.flex='2';r.className=cls;r.title=tip;
    const v=mk('span',null,r.value+'%');v.style.minWidth='38px';v.style.textAlign='right';v.style.fontSize='.78rem';
    r.addEventListener('input',()=>{v.textContent=r.value+'%';fn(+r.value,true);});
    r.addEventListener('change',()=>{v.textContent=r.value+'%';fn(+r.value,false);});
    row.appendChild(l);row.appendChild(r);row.appendChild(v);holder.appendChild(row);
  };
  slider('Intensité','asmLookOp',15,100,Math.round((L.op!=null?L.op:(it0.op||1))*100),'100 % = opaque · on voit au travers SANS que la pièce perde son éclat',
    (x,live)=>asmSetLook(o,{op:x<100?x/100:null},'intensité',live));
  slider('Transparence','asmLookGl',0,90,Math.round((1-(L.gl!=null?L.gl:(it0.gl||1)))*100),'0 % = opaque · on voit au travers de la pièce : poches, perçages, arêtes cachées',
    (x,live)=>asmSetLook(o,{gl:x>0?1-x/100:null},'transparence',live));
  // arêtes
  const row=mk('div','skrow');const le=mk('label',null,'Arêtes');le.style.flex='1';
  const ed=document.createElement('select');ed.className='asmLookEdges';
  [['','Comme le bouton « Arêtes »'],['on','Toujours'],['off','Jamais']].forEach(([v,t2])=>{const q=document.createElement('option');q.value=v;q.textContent=t2;if((L.edges||'')===v)q.selected=true;ed.appendChild(q);});
  ed.onchange=()=>asmSetLook(o,{edges:ed.value||null},'arêtes');
  row.appendChild(le);row.appendChild(ed);holder.appendChild(row);
  p.appendChild(holder);
  const b=mk('div','pnl-btns');
  const all=mk('button','mini','Appliquer à toutes les occurrences de « '+((c&&c.name)||'?')+' »');
  all.onclick=()=>{asmPush('apparence');const lk=o.look?JSON.parse(JSON.stringify(o.look)):null;
    asmCompOccs(o.comp).forEach(q=>{q.look=lk?Object.assign({},lk):null;});asmNotify();};
  b.appendChild(all);
  if(o.look){const rs=mk('button','mini','Par défaut');rs.title='Intensité et transparence des corps ; arêtes selon le bouton';rs.onclick=()=>{asmPush('apparence');o.look=null;asmNotify();};b.appendChild(rs);}
  p.appendChild(b);
  p.appendChild(mk('div','pnl-note','Vaut pour ce qu’elle contient ; sans effet en mode Modéliser. La couleur reste celle des corps (réglée en Modéliser), la même partout.'));
}
