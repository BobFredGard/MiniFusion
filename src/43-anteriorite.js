/* ---------- antériorité : une fonction ne s'appuie que sur ce qui la précède ----------
   Comme Fusion : une répétition ne répète que des fonctions placées AVANT elle, un congé ne
   vise que des faces déjà créées, une extrusion « jusqu'à » ne vise qu'une fonction
   antérieure, une esquisse posée sur une face ou un plan de construction n'est consommée
   qu'après eux. antDeps décrit ces liens ; antViolations relève ceux qui pointent vers
   l'aval ; featMoveRaw (40) refuse un cran qui en crée un nouveau ; l'arbre (42) et
   l'ouverture d'un fichier (90) signalent ceux qui existent déjà (⚠), sans rien modifier.
   Les instances de répétition (repeatId) sont dérivées : elles suivent leur répétition et
   ne sont pas contrôlées pour elles-mêmes.
   Liens SOUPLES (soft) : les ancres d'arêtes / faces (xAnchorFor) cherchent dans TOUTES les
   esquisses, aval compris — Cavité Usinage a un congé ancré sur une esquisse extrudée plus
   loin, et il se rejoue bien. Elles empêchent un déplacement de créer un défaut, mais un
   lien souple déjà à l'envers n'est pas signalé. */
function antSketchUsers(F){
  // esquisse → PREMIÈRE fonction de F qui la consomme (extrusion, révolution, perçage)
  const m=new Map();
  F.forEach(f=>{if(f&&(f.type==='extrude'||f.type==='revolve'||f.type==='hole')&&f.sketchId&&!m.has(f.sketchId))m.set(f.sketchId,f);});
  return m;
}
function antAnchorSketches(o,out,prof){
  // Esquisses citées par les ancres (anchor.sk) des références de faces / arêtes de la fonction
  if(!o||typeof o!=='object'||(prof|0)>4)return out;
  if(Array.isArray(o)){o.forEach(x=>antAnchorSketches(x,out,(prof|0)+1));return out;}
  if(o.anchor&&typeof o.anchor==='object'&&typeof o.anchor.sk==='string')out.add(o.anchor.sk);
  for(const k in o){if(k==='anchor'||k[0]==='_')continue;const v=o[k];if(v&&typeof v==='object')antAnchorSketches(v,out,(prof|0)+1);}
  return out;
}
function antDeps(f,F,users){
  // Liens d'antériorité de f : [{id, why, soft}] — id = fonction qui doit précéder f
  F=F||doc.features;users=users||antSketchUsers(F);
  const out=[],vu=new Set();
  const add=(id,why,soft)=>{if(id&&id!==f.id&&!vu.has(id)&&F.some(x=>x.id===id)){vu.add(id);out.push(soft?{id,why,soft:true}:{id,why});}};
  if(!f||f.repeatId)return out;
  if(f.type==='repeat')(f.base||[]).forEach(id=>add(id,'source de la répétition'));
  if((f.type==='xfillet'||f.type==='fillet')&&f.target)add(f.target,'fonction visée');
  if(f.upto&&f.upto.ex)add(f.upto.ex,'cible « jusqu’à »');
  if(f.sketchId){
    const sk=(doc.sketches||[]).find(s=>s.id===f.sketchId);
    if(sk&&sk.host&&sk.host.feat)add(sk.host.feat,'face portant l’esquisse « '+(sk.name||sk.id)+' »');
    if(sk&&sk.plane==='CG'&&sk.cg&&sk.cg.id){
      const c=(doc.cgeo||[]).find(x=>x&&x.id===sk.cg.id);
      if(c&&c.at)add(c.at,'plan de construction « '+(c.name||c.id)+' » de l’esquisse « '+(sk.name||sk.id)+' »');
    }
  }
  antAnchorSketches(f,new Set()).forEach(skId=>{
    if(skId===f.sketchId)return;
    const u=users.get(skId);
    if(u)add(u.id,'faces ou arêtes créées par « '+u.name+' »',true);
  });
  return out;
}
function antViolations(F,soft){
  // Liens qui pointent vers l'AVAL dans l'ordre F : [{f, dep, why}] ; soft = liens souples compris
  F=F||doc.features||[];
  const users=antSketchUsers(F),idx=new Map();
  F.forEach((x,i)=>idx.set(x.id,i));
  const out=[];
  F.forEach((f,i)=>{
    antDeps(f,F,users).forEach(d=>{
      if(d.soft&&!soft)return;
      const j=idx.get(d.id);
      if(j!=null&&j>i)out.push({f,dep:F[j],why:d.why});
    });
  });
  return out;
}
function antKey(v){return v.f.id+'>'+v.dep.id;}
function antNewViolation(A,B){
  // Premier lien vers l'aval présent dans l'ordre B mais pas dans A (null = aucun) :
  // un déplacement peut laisser un défaut ancien, jamais en créer un.
  const avant=new Set(antViolations(A,true).map(antKey));
  return antViolations(B,true).find(v=>!avant.has(antKey(v)))||null;
}
function antMsg(v){
  return '« '+v.f.name+' » doit rester après « '+v.dep.name+' » ('+v.why+').';
}
function antWarnMap(F){
  // id de fonction → libellés de ses liens vers l'aval (⚠ de l'arbre)
  const m=new Map();
  antViolations(F).forEach(v=>{
    if(!m.has(v.f.id))m.set(v.f.id,[]);
    m.get(v.f.id).push('« '+v.dep.name+' » ('+v.why+') est placée APRÈS');
  });
  return m;
}
