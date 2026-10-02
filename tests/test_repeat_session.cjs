// Persistance des répétitions EN SESSION : toute mutation de paramètre d'une SOURCE
// doit régénérer ses instances (6 chemins : panneaux xmove/xdraft/xshell, éditions en
// place dépouillage/coque/congé exact), et les deux boutons de réparation (Recalcul,
// Rafraîchissement dur) balayent TOUTES les répétitions — filet de sécurité qui aligne
// les instances même si un chemin n'a pas synchronisé.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=[
    "const P=[];const p=s=>P.push(String(s));",
    "const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};",
    "const bb=function(sh){const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};",
    "const f1=v=>v.toFixed(1);",
    // ---------- document : extrusion + les 4 types de source + répétition linéaire ----------
    "const sk={id:'sk_t',name:'Plot',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};",
    "[['p0',10,5,'e0','p1'],['p1',30,5,'e1','p2'],['p2',30,15,'e2','p3'],['p3',10,15,'e3','p0']].forEach(l=>{",
    "  sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});",
    "doc.sketches=[sk];",
    "doc.features=[",
    "  {id:'ex_t',type:'extrude',name:'Plot',sketchId:'sk_t',op:'add',distance:20},",
    "  {id:'mv_t',type:'xmove',name:'Déplacement A',ref:{pos:[20,10,20],dim:[10,5],n:[0,0,1]},dist:5},",
    "  {id:'dr_t',type:'xdraft',name:'Dépouillage A',ref:{pos:[20,5,10],dim:[10,10],n:[0,-1,0]},faces:[{pos:[20,5,10],dim:[10,10],n:[0,-1,0]}],angle:10},",
    "  {id:'sh_t',type:'xshell',name:'Coque A',faces:[{pos:[20,10,20],dim:[10,5],n:[0,0,1]}],thick:2},",
    "  {id:'xf_t',type:'xfillet',name:'Congé A',edges:[{pos:[10,5,10],pos0:[10,5,10],r:2,len:20,anchor:null,name:'A'}],tangent:false},",
    "  {id:'rp_t',type:'repeat',name:'Linéaire',mode:'lin',copies:2,dist:15,axis:'X',base:['ex_t','mv_t','dr_t','sh_t','xf_t'],children:[],visible:true}",
    "];",
    "occSkipFeat=null;",
    "const n0=repGenChildren(doc.features.find(f=>f.id==='rp_t'));",
    "const kid=(src,idx)=>doc.features.find(f=>f.repeatId==='rp_t'&&f._src===src&&(idx?f.repIndex===idx:true));",
    "const kids=()=>doc.features.filter(f=>f.repeatId==='rp_t');",
    "p('création : '+n0+' instances ('+kids().map(k=>k.repIndex).join(',')+')');",
    "att(n0===10,'création : 10 instances attendues (5 sources x 2 copies), obtenu '+n0);",
    "att(kid('mv_t',1)&&+kid('mv_t',1).dist===5,'état initial : instance xmove dist != 5');",
    "att(kid('dr_t',1)&&+kid('dr_t',1).angle===10,'état initial : instance xdraft angle != 10');",
    "att(kid('sh_t',1)&&+kid('sh_t',1).thick===2,'état initial : instance xshell épaisseur != 2');",
    "att(kid('xf_t',1)&&(kid('xf_t',1).edges||[]).length===1,'état initial : instance congé != 1 arête');",
    "const ids0=kids().map(k=>k.id).sort().join(',');",
    // ---------- panneau props : le champ de paramètre d une source ----------
    "const panelInput=fid=>{",
    "  const before=$('props').children.length;",
    "  sel={kind:'feature',id:fid};renderProps();",
    "  const out=[];const walk=n=>{(n.children||[]).forEach(c=>{if(String(c.tagName).toUpperCase()==='INPUT')out.push(c);walk(c);});};",
    "  $('props').children.slice(before).forEach(c=>{if(String(c.tagName).toUpperCase()==='INPUT')out.push(c);walk(c);});",
    "  return out;",
    "};",
    // ---------- 1) panneau xmove : distance 5 -> 25 ----------
    "let ins=panelInput('mv_t');",
    "p('panneau xmove : '+ins.length+' champ(s) trouvé(s)');",
    "att(ins.length>=1,'panneau xmove : champ distance introuvable dans les propriétés');",
    "if(ins[0]){ins[0].value='25';ins[0].dispatchEvent({type:'change'});}",
    "p('xmove 5->25 : instance dist='+(kid('mv_t',1)&&kid('mv_t',1).dist));",
    "att(kid('mv_t',1)&&+kid('mv_t',1).dist===25,'chemin 1 (panneau xmove) : instance non régénérée, dist='+(kid('mv_t',1)&&kid('mv_t',1).dist)+' au lieu de 25');",
    // ---------- 2) panneau xdraft : angle 10 -> 30 ----------
    "ins=panelInput('dr_t');",
    "p('panneau xdraft : '+ins.length+' champ(s) trouvé(s)');",
    "att(ins.length>=1,'panneau xdraft : champ angle introuvable dans les propriétés');",
    "if(ins[0]){ins[0].value='30';ins[0].dispatchEvent({type:'change'});}",
    "p('xdraft 10->30 : instance angle='+(kid('dr_t',1)&&kid('dr_t',1).angle));",
    "att(kid('dr_t',1)&&+kid('dr_t',1).angle===30,'chemin 2 (panneau xdraft) : instance non régénérée, angle='+(kid('dr_t',1)&&kid('dr_t',1).angle)+' au lieu de 30');",
    // ---------- 3) panneau xshell : épaisseur 2 -> 8 ----------
    "ins=panelInput('sh_t');",
    "p('panneau xshell : '+ins.length+' champ(s) trouvé(s)');",
    "att(ins.length>=1,'panneau xshell : champ épaisseur introuvable dans les propriétés');",
    "if(ins[0]){ins[0].value='8';ins[0].dispatchEvent({type:'change'});}",
    "p('xshell 2->8 : instance épaisseur='+(kid('sh_t',1)&&kid('sh_t',1).thick));",
    "att(kid('sh_t',1)&&+kid('sh_t',1).thick===8,'chemin 3 (panneau xshell) : instance non régénérée, épaisseur='+(kid('sh_t',1)&&kid('sh_t',1).thick)+' au lieu de 8');",
    // ---------- 4) édition en place : dépouillage (draftApply) 30 -> 40 ----------
    "draftMode={editing:'dr_t',phase:'faces',ref:{pos:[20,5,10],dim:[10,10],n:[0,-1,0]},faces:[{pos:[20,5,10],dim:[10,10],n:[0,-1,0]}],angle:40};",
    "draftApply();",
    "p('draftApply 30->40 : source angle='+(doc.features.find(f=>f.id==='dr_t')||{}).angle+', instance='+(kid('dr_t',1)&&kid('dr_t',1).angle));",
    "att(+doc.features.find(f=>f.id==='dr_t').angle===40,'draftApply : la source doit passer à 40');",
    "att(kid('dr_t',1)&&+kid('dr_t',1).angle===40,'chemin 4 (draftApply) : instance non régénérée, angle='+(kid('dr_t',1)&&kid('dr_t',1).angle)+' au lieu de 40');",
    // ---------- 5) édition en place : coque (coqueApply) 8 -> 12 ----------
    "coqueMode={editing:'sh_t',faces:[{pos:[20,10,20],dim:[10,5],n:[0,0,1]}],thick:12};",
    "coqueApply();",
    "p('coqueApply 8->12 : source épaisseur='+(doc.features.find(f=>f.id==='sh_t')||{}).thick+', instance='+(kid('sh_t',1)&&kid('sh_t',1).thick));",
    "att(+doc.features.find(f=>f.id==='sh_t').thick===12,'coqueApply : la source doit passer à 12');",
    "att(kid('sh_t',1)&&+kid('sh_t',1).thick===12,'chemin 5 (coqueApply) : instance non régénérée, épaisseur='+(kid('sh_t',1)&&kid('sh_t',1).thick)+' au lieu de 12');",
    // ---------- 6) édition en place : congé exact (applyExactFillet) 1 -> 2 arêtes ----------
    "filModeX={editing:'xf_t',kind:'fillet',radius:'4',",
    "  sel:[{pos:[10,5,10],pos0:[10,5,10],r:4,len:20},{pos:[30,5,10],pos0:[30,5,10],r:4,len:20}],",
    "  edges:[{mid:[10,5,10]},{mid:[30,5,10]}],seeds:[0],tangent:true};",
    "applyExactFillet();",
    "p('applyExactFillet 1->2 arêtes : source='+(doc.features.find(f=>f.id==='xf_t')||{}).edges.length+', instance='+(kid('xf_t',1)&&(kid('xf_t',1).edges||[]).length)+' arête(s), tangent='+(kid('xf_t',1)&&kid('xf_t',1).tangent));",
    "att(doc.features.find(f=>f.id==='xf_t').edges.length===2,'applyExactFillet : la source doit avoir 2 arêtes');",
    "att(kid('xf_t',1)&&kid('xf_t',1).tangent===true,'chemin 6 (applyExactFillet) : drapeau tangent de l instance non régénéré');",
    "att(kid('xf_t',1)&&(kid('xf_t',1).edges||[]).length>=2,'chemin 6 (applyExactFillet) : instance non régénérée, '+(kid('xf_t',1)&&(kid('xf_t',1).edges||[]).length)+' arête(s) au lieu des 2 sélectionnées');",
    // ---------- 7) bouton Recalcul : balayage de toutes les répétitions + géométrie ----------
    "const ex=doc.features.find(f=>f.id==='ex_t');",
    "const ke1=kid('ex_t',1);",
    "ex.distance=28;ke1.distance=20; // désynchronisation simulée (source bougée sans sync)",
    "$('btnRebuild').onclick();",
    "p('btnRebuild : instance distance='+(+ke1.distance)+' (source 28)');",
    "att(+ke1.distance===28,'bouton Recalcul : instance non réalignée, distance='+(+ke1.distance)+' au lieu de 28');",
    "try{",
    "  const r=occShapeOfExtrude(ke1);const b=bb(r.shape);",
    "  p('moteur instance réalignée : x '+f1(b[0])+'..'+f1(b[3])+', z '+f1(b[2])+'..'+f1(b[5]));",
    "  att(Math.abs(b[5]-28)<0.6,'bouton Recalcul (moteur) : hauteur '+f1(b[5])+' au lieu de 28');",
    "  att(Math.abs(b[0]-25)<0.6&&Math.abs(b[3]-45)<0.6,'bouton Recalcul (moteur) : placement linéaire x 25..45 attendu, obtenu '+f1(b[0])+'..'+f1(b[3]));",
    "  if(r.shape)r.shape.delete();",
    "  try{if(typeof occDispose!=='undefined')occDispose(r.bins);}catch(e){}",
    "}catch(e){att(false,'moteur occShapeOfExtrude : '+String((e&&e.message)||e));}",
    // ---------- 8) Rafraîchissement dur : même balayage ----------
    "const mv=doc.features.find(f=>f.id==='mv_t');",
    "const km1=kid('mv_t',1);",
    "mv.dist=33; // source bougée sans sync (état périmé en session)",
    "try{hardRefresh();}catch(e){p('  (hardRefresh : '+String((e&&e.message)||e)+')');}",
    "p('hardRefresh : instance dist='+(km1&&km1.dist)+' (source 33)');",
    "att(km1&&+km1.dist===33,'Rafraîchissement dur : instance non réalignée, dist='+(km1&&km1.dist)+' au lieu de 33');",
    // ---------- tenue : ids stables + compte d instances ----------
    "const ids1=kids().map(k=>k.id).sort().join(',');",
    "p('stabilité : '+(ids0===ids1?'ids des instances conservés après tous les réalignements':'DÉRIVE : '+ids0+' -> '+ids1));",
    "att(ids0===ids1,'stabilité : les ids des instances ont changé');",
    "att(kids().length===10,'compte : 10 instances attendues en fin de parcours, obtenu '+kids().length);",
    "if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}",
    "else{p('');p('TOUT EST CONFORME');}",
    "return P.join(String.fromCharCode(10));"
  ].join('\n');
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'repeat_session.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,500));process.exit(1);});
