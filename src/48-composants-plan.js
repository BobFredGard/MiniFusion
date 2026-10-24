/* ---------- mise en plan d'assemblage (V0.6.7) ----------
   Le PLAN d'un composant (doc.mep, 98-mise-en-plan.js) peut montrer « Assemblage » : le composant
   ET tout ce qu'il contient. Le PLAN travaille sur des corps (maillage + solide exact) : on lui
   fournit, en plus des corps du composant actif, un « corps » par corps de chaque instance placée
   (solide exact copié, transformé, maillage tiré du solide — repli : l'instantané d'affichage).
   Les solides des autres composants viennent d'un rejeu SILENCIEUX (doc échangé le temps du
   calcul, sans activation : activer fermerait le PLAN), gardés en cache (c._exact).
   Nomenclature par composant (premier niveau / tous niveaux / pièces seules), bulles. */
let asmPlanCache=null; // {sig, list}
function asmPlanOn(){return !!asm&&!!asmActiveComp()&&asmActiveComp().occ.length>0;}
function asmPlanInstances(){
  // Instances sous le composant actif (lui exclu), visibles
  const base=asmActiveComp();if(!base)return [];
  const hidden=path=>{let c=base;for(const id of path){const o=c&&c.occ.find(q=>q.id===id);if(!o||o.visible===false)return true;c=asmComp(o.comp);}return false;};
  return asmInstances(base.id).filter(i=>i.path.length&&!hidden(i.path));
}
function asmPlanSig(){
  if(!asmPlanOn())return '';
  return asmHash(JSON.stringify(asmPlanInstances().map(i=>{const c=asmComp(i.comp);
    return [i.path.join('/'),asmRound(i.F),c&&c._snap?c._snap.hash:'',c&&c._stale?1:0];})));
}
function asmExactQuiet(c){
  // Solides exacts d'un composant SANS l'activer : document échangé le temps du rejeu
  const d0=doc,a0=asm.active,s0=occSkipFeat;
  let out=[];
  try{doc=c.doc;asm.active=c.id;occSkipFeat=null;out=asmExactActive();}
  finally{doc=d0;asm.active=a0;occSkipFeat=s0;}
  return out;
}
function asmExactOfQuiet(c){
  const h=c._snap?c._snap.hash:'';
  if(c._exact&&c._exact.hash===h&&h&&!c._stale)return c._exact.list;
  asmExactFree(c);
  const list=c.doc===doc?asmExactActive():asmExactQuiet(c);
  c._exact={hash:h,list};
  return list;
}
function asmPlanFree(){
  if(!asmPlanCache)return;
  asmPlanCache.list.forEach(b=>{try{b.mesh.geometry.dispose();b.mesh.material.dispose();}catch(e){}try{if(b.shape)b.shape.delete();}catch(e){}});
  asmPlanCache=null;
}
function asmPlanBodies(){
  // Corps à projeter pour une vue « Assemblage » : ceux du composant actif + ceux des instances
  const own=((typeof bodies!=='undefined'&&bodies)||[]).filter(b=>b&&!b.ghost&&b.kind!=='ghost'&&b.mesh&&b.mesh.visible!==false);
  if(!asmPlanOn())return own;
  const sig=asmPlanSig();
  if(asmPlanCache&&asmPlanCache.sig===sig)return own.concat(asmPlanCache.list);
  asmPlanFree();
  const exact=typeof occHas==='function'&&occHas();
  const list=[];
  asmPlanInstances().forEach(I=>{
    const c=asmComp(I.comp);if(!c)return;
    const key='asm:'+I.path.join('/');
    let done=false;
    if(exact){
      try{
        asmExactOfQuiet(c).forEach(b=>{
          const sh=asmPlaced(b.shape,I.F);
          let geo=null;try{geo=occTessellate(sh,0.3,0.4);}catch(e){}
          if(!geo){try{sh.delete();}catch(e){}return;}
          const e=(c.doc.bodies||[]).find(x=>x.id===b.id)||{};
          const col=e.color>0?e.color:0x9a9aa0;
          const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:col}));
          list.push({kind:'body',id:key+':'+b.id,bodyId:key+':'+b.id,name:c.name+' · '+b.name,mesh,shape:sh,color:col,asmComp:c.id,asmPath:I.path});
          done=true;
        });
      }catch(e){}
    }
    if(!done&&c._snap){
      // repli maillage : l'instantané d'affichage, placé
      c._snap.items.forEach((it,k)=>{
        const g=it.geo.clone();g.applyMatrix4(asmMat4(I.F));
        const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:it.color}));
        list.push({kind:'body',id:key+':m'+k,bodyId:key+':m'+k,name:c.name,mesh,shape:null,color:it.color,asmComp:c.id,asmPath:I.path});
      });
    }
  });
  asmPlanCache={sig,list};
  return own.concat(list);
}
function asmBomRows(lvl){
  // Nomenclature des composants : 'comp1' (premier niveau), 'all' (tous niveaux), 'parts'
  // (pièces seules : composants sans sous-composants). → [{rep,name,qty,mat,dims,ids:[compId]}]
  const base=asmActiveComp();if(!base)return [];
  let inst=asmPlanInstances();
  if(lvl==='comp1')inst=inst.filter(i=>i.path.length===1);
  if(lvl==='parts')inst=inst.filter(i=>{const c=asmComp(i.comp);return c&&!c.occ.length;});
  const rows=[];
  inst.forEach(i=>{
    let r=rows.find(q=>q.ids[0]===i.comp);
    if(r){r.qty++;return;}
    const c=asmComp(i.comp);let dims='';
    try{if(c._snap&&c._snap.items.length){const b=asmSnapBox(c._snap),S=b.getSize(new THREE.Vector3());dims=[S.x,S.y,S.z].map(v=>(+v).toFixed(1).replace('.',',')).join(' × ');}}catch(e){}
    rows.push({name:c.name,qty:1,mat:asmMatOf(c).name,dims,ids:[c.id]});
  });
  rows.forEach((q,k)=>q.rep=k+1);
  return rows;
}
function asmBalloonAnchor(cid){
  // Point d'accroche d'une bulle : centre de l'instantané de la première instance du composant
  const I=asmPlanInstances().find(i=>i.comp===cid);if(!I)return null;
  const c=asmComp(cid);let p=[0,0,0];
  try{if(c._snap&&c._snap.items.length){const b=asmSnapBox(c._snap),m=b.getCenter(new THREE.Vector3());p=[m.x,m.y,m.z];}}catch(e){}
  return asmApply(I.F,p);
}
