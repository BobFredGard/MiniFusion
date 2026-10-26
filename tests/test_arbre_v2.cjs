// Arbre (42, treeModel + treeDraw). Sans assemblage, il doit rester IDENTIQUE, ligne par
// ligne (classes, HTML, titres, styles, gestionnaires posés), à l'ancien renderTree : sa
// sortie est figée dans fixtures/arbre_reference.json (V0.9.5 ; réécrite pour la lisibilité :
// sections sobres, origine repliée, esquisses au nom court, retrait par niveau ; --ecrire la
// réécrit depuis l'arbre actuel, à n'utiliser que pour un changement voulu).
// Puis : répartiteur unique, assemblage (composants imbriqués, ×N, liaisons), recherche,
// glisser-déposer.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm'),fs=require('fs'),path=require('path');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const {ctx,loadErr}=loadApp();
  if(loadErr)console.log('LOAD-ERR (non bloquant)',String(loadErr.message||loadErr).slice(0,200));
  const body=`
    const out={cas:[],ref:{}};
    const sk=function(id,n){return {id:id,name:n,plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:0,y:0},b:{x:10,y:0}},entities:[{id:"l1",t:"line",p1:"a",p2:"b"}],constraints:[],dims:[],visible:true};};
    doc.sketches=[sk("sk1","A"),sk("sk2","B")];
    doc.bodies=[{id:"b1",name:"Corps 1"},{id:"b2",name:"Corps 2",open:false}];
    doc.activeBody="b1";
    doc.features=[
      {id:"E1",type:"extrude",name:"Alpha",sketchId:"sk1",distance:20,op:"add",visible:true,body:"b1"},
      {id:"E2",type:"extrude",name:"Poche",sketchId:"sk2",distance:5,op:"cut",visible:false,body:"b1"},
      {id:"RP",type:"repeat",name:"Rép",mode:"lin",copies:2,dist:15,angle:0,axis:"X",plane:"YZ",base:["E1"],visible:true,body:"b1"},
      {id:"I1",type:"extrude",name:"Alpha (rép 1)",sketchId:"sk1",distance:20,op:"add",visible:true,repeatId:"RP",repIndex:1,body:"b1"},
      {id:"E3",type:"extrude",name:"Gamma",sketchId:"sk1",distance:8,op:"add",visible:true,body:"b2"}
    ];
    const t=document.getElementById('tree');
    const lignes=function(){
      const n0=t.children.length;renderTree();
      return t.children.slice(n0).filter(function(r){return r.className!=='tsearch';}).map(function(r){return JSON.stringify({c:r.className,h:r.innerHTML,x:r.textContent,t:r.title||'',
        s:r.style,k:(r.children||[]).map(function(k){return [k.tagName,k.className,k.innerHTML,k.textContent];}),
        oc:!!r.onclick,od:!!r.ondblclick,ox:!!r.oncontextmenu});});
    };
    const compare=function(nom){
      const b=lignes();const a=__REF[nom]||[];out.ref[nom]=b;
      let diff=-1;for(let i=0;i<Math.max(a.length,b.length);i++)if(a[i]!==b[i]){diff=i;break;}
      out.cas.push({nom:nom,n:a.length,nb:b.length,diff:diff,a:diff>=0?a[diff]:'',b:diff>=0?b[diff]:''});
    };
    sel={kind:null,id:null};treeSel=[];
    compare('état initial');
    sel={kind:'feature',id:'RP'};treeSel=['RP'];
    compare('répétition sélectionnée (dépliée, sources marquées)');
    sel={kind:'body',id:'b2'};treeSel=[];
    compare('corps replié sélectionné');
    doc.fold={origin:true,sk:true};sel={kind:'plane',id:'XZ'};
    compare('Origine et Esquisses repliées');
    doc.fold={};sel={kind:'feature',id:'E2'};treeSel=['E2','E1'];
    compare('lot Ctrl+clic');
    try{tlMark='E2';}catch(e){}
    compare('marqueur de temps');
    try{tlMark=null;}catch(e){}

    // ── répartiteur unique : les actions passent par les mêmes gestionnaires
    sel={kind:null,id:null};treeSel=[];
    const n0=t.children.length;renderTree();
    const rows=t.children.slice(n0);
    const ev=function(cls,ctrl,d){return {ctrlKey:!!ctrl,target:{classList:{contains:function(c){return c===cls;}},dataset:{d:d}},
      stopPropagation:function(){},preventDefault:function(){}};};
    const ligne=function(re){const r=rows.filter(function(r){return re.test(r.innerHTML||'');});return r[r.length-1];};
    const bh=ligne(/Corps 2/);
    bh.onclick(ev('eye'));out.oeilCorps=!!(doc.bodyVis&&doc.bodyVis.b2===false);
    const tri=ligne(/Corps 2/);
    let rendu=0;const rt=renderTree;renderTree=function(){rendu++;};
    tri.onclick(ev('tri'));out.triCorps=doc.bodies[1].open;
    const rp=ligne(/Rép/);
    rp.onclick(ev('tri'));out.triRep=doc.features.find(function(f){return f.id==='RP';}).open===true;
    const e1=ligne(/Alpha<\\/span>/);
    e1.onclick(ev('',true));out.ctrl=treeSel.join('+');
    let mv=null;const fm=featMove;featMove=function(id,d){mv=id+':'+d;return true;};
    e1.onclick(ev('mv',false,'1'));out.mv=mv;featMove=fm;
    e1.onclick(ev(''));out.clic=sel.kind+':'+sel.id+'|'+treeSel.join('+');
    renderTree=rt;
    out.option=typeof treeModel==='function'&&typeof treeDraw==='function';

    // ── lot 1 : assemblage → composants imbriqués (option seulement)
    sel={kind:null,id:null};treeSel=[];
    asmEnsure();
    const nb=asmNewComp('Bride');
    nb.comp.doc.bodies=[{id:'b1',name:'Corps Bride'}];
    nb.comp.doc.features=[{id:'F1',type:'extrude',name:'Collerette',op:'add',visible:true,body:'b1'}];
    const tout=function(el,acc){(el.children||[]).forEach(function(k){acc.push(k);tout(k,acc);});return acc;};
    const rendu2=function(){const n0=t.children.length;renderTree();const top=t.children.slice(n0);
      const acc=[];top.forEach(function(r){acc.push(r);tout(r,acc);});return {top:top,all:acc};};
    let v2=rendu2();
    const txt=function(r){return (r.innerHTML||'')+(r.textContent||'');};
    out.v2Section=v2.top.some(function(r){return /tsec/.test(r.className||'')&&/Composants/.test(r.innerHTML||'')&&/(1)/.test(r.innerHTML||'');});
    const racine=v2.top.find(function(r){return /tactive/.test(r.className||'')&&/troot/.test(r.className||'');});
    out.racineActive=!!racine;
    const boite=v2.top.find(function(r){return r.className==='tgroupbox';});
    out.pieceDansBoite=!!boite&&tout(boite,[]).some(function(r){return /Corps 1/.test(txt(r))&&/bh/.test(r.className||'');});
    out.boiteApresRacine=v2.top.indexOf(boite)===v2.top.indexOf(racine)+1&&v2.top.indexOf(boite)<v2.top.findIndex(function(r){return /tsec/.test(r.className||'')&&/Composants/.test(r.innerHTML||'');});
    const bride=v2.top.find(function(r){return /Bride:1/.test(r.innerHTML||'');});
    out.brideFerme=!!bride&&/▶/.test(bride.innerHTML)&&!v2.all.some(function(r){return /Collerette/.test(txt(r));});
    bride.onclick(ev('tri'));
    v2=rendu2();
    const coll=v2.all.find(function(r){return /Collerette/.test(txt(r))&&r.style&&r.style.opacity==='0.55';});
    out.brideOuvert=!!coll&&v2.all.some(function(r){return /Corps Bride/.test(txt(r));});
    let vers=null;const as0=asmShow;asmShow=function(p,m){vers=p.join('/')+':'+m;};
    coll.ondblclick();out.dblModele=vers===nb.occ.id+':part';asmShow=as0;
    // ── lot 2 : ×N, liaisons, recherche
    const nv=asmNewComp('Vis');asmAddOcc(nv.comp.id);asmAddOcc(nv.comp.id);
    nb.occ.align={src:{path:[],cg:null},dst:{path:[],cg:null},flip:false,rz:0,off:[0,0,0],type:'revolute',q:{rz:35}};
    doc.features.push({id:"PC",type:"hole",name:"Perçage Ø6",visible:true,body:"b1"});
    v2=rendu2();
    const grp=v2.top.find(function(r){return /Vis <span[^>]*>×3/.test(r.innerHTML||'');});
    out.grpFerme=!!grp&&/▶/.test(grp.innerHTML)&&!v2.top.some(function(r){return /Vis:2/.test(r.innerHTML||'');});
    grp.onclick(ev('tri'));v2=rendu2();
    out.grpOuvert=v2.top.filter(function(r){return /Vis:[0-9]/.test(r.innerHTML||'');}).length===3;
    out.dossierLiaisons=v2.top.findIndex(function(r){return /tsec/.test(r.className||'')&&/Liaisons/.test(r.innerHTML||'')&&/(1)/.test(r.innerHTML||'');})>=0;
    const lj=v2.top.find(function(r){return /tjoint/.test(r.className||'')&&/Pivot <span[^>]*>Bride:1 → Origine de/.test(r.innerHTML||'')&&/rz 35°/.test(r.title||'');});
    out.ligneLiaison=!!lj;
    let vj=null;const as1=asmShow;asmShow=function(p,m,id){vj=p.join('/')+':'+m+':'+id;};
    if(lj)lj.onclick(ev(''));out.clicLiaison=vj===':asm:'+nb.occ.id;asmShow=as1;
    treeQuery='percage';v2=rendu2();
    const vis=v2.all.filter(function(r){return r.className&&r.className.indexOf('tnode')>=0;}).map(function(r){return txt(r);});
    out.rechAccent=vis.some(function(s){return /Perçage Ø6/.test(s);})&&v2.all.some(function(r){return /tmatch/.test(r.className||'')&&/Perçage/.test(txt(r));});
    out.rechParents=vis.some(function(s){return /Corps 1/.test(s);})&&!vis.some(function(s){return /Plan XY/.test(s);})&&!vis.some(function(s){return /Vis:1/.test(s);});
    treeQuery='collerette';v2=rendu2();
    out.rechAutreComp=v2.all.some(function(r){return /Collerette/.test(txt(r));})&&v2.top.some(function(r){return /Bride:1/.test(r.innerHTML||'');});
    treeQuery='zzz';v2=rendu2();out.rechVide=v2.top.some(function(r){return /Aucun résultat/.test(txt(r));});
    treeQuery='';
    // ── lot 3 : glisser-déposer
    v2=rendu2();
    const ordre=function(){return doc.features.filter(function(x){return x.body==='b1'&&!x.repeatId;}).map(function(x){return x.id;}).join(',');};
    out.ordreAvant=ordre();
    const lE1=v2.all.find(function(r){return r.draggable&&/>Alpha</.test(r.innerHTML||'');});
    const lE2=v2.all.find(function(r){return r.draggable&&/>Poche</.test(r.innerHTML||'');});
    const lPC=v2.all.find(function(r){return r.ondrop&&/Perçage Ø6/.test(r.innerHTML||'');});
    const lE3=v2.all.find(function(r){return /Gamma/.test(r.innerHTML||'');});
    const dragEv={preventDefault:function(){},dataTransfer:{setData:function(){},effectAllowed:'',dropEffect:''}};
    if(lE1)lE1.ondragstart(dragEv);
    out.refusAutreCorps=!!treeDrag&&!(lE3&&lE3.ondrop&&treeDropFeat('E3').accept(treeDrag));
    // Alpha est la source de la répétition : la descendre sous elle est refusé (antériorité, 43)
    if(lPC)lPC.ondrop(dragEv);
    out.sourceRefusee=ordre()===out.ordreAvant&&/⛔/.test(faceEl.textContent);
    if(lE2)lE2.ondragstart(dragEv);
    if(lPC)lPC.ondrop(dragEv);
    out.ordreApres=ordre();
    out.descendu=out.ordreApres==='E1,RP,PC,E2';
    treeFeatMoveTo('E2','E1');out.remonte=ordre()==='E2,E1,RP,PC';
    let mt=null;const amt=asmCmdMoveTo;asmCmdMoveTo=function(k,id,cid){mt=k+':'+id+':'+cid;};
    v2=rendu2();
    const lCorps=v2.all.find(function(r){return r.draggable&&/Corps 1/.test(r.innerHTML||'')&&/bh/.test(r.className||'');});
    const lBride=v2.top.find(function(r){return r.ondrop&&/Bride:1/.test(r.innerHTML||'');});
    if(lCorps)lCorps.ondragstart(dragEv);
    if(lBride)lBride.ondrop(dragEv);
    out.corpsVersComp=mt==='body:b1:'+nb.comp.id;asmCmdMoveTo=amt;
    // ── face d'un autre composant comme référence de construction (46 : asmXfEval)
    nb.comp._snap={items:[],pedges:[],hash:'h1',pfaces:[{ref:{id:'F1'},plane:{o:[0,0,5],n:[0,0,1]}},{ref:{id:'C1'},axis:{o:[3,0,0],d:[0,0,1],rad:2}}]};
    nb.occ.fr={o:[10,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
    const xr={k:'xf',ctx:[],path:[nb.occ.id],ref:{id:'F1'},loc:{plane:{o:[0,0,5],n:[0,0,1]}}};
    const g1=cgEvalRef(xr);out.xfPlan=!!(g1&&g1.plane)&&g1.plane.o.join(',')==='10,0,5'&&Math.abs(g1.plane.n[2]-1)<1e-9;
    const g2=cgEvalRef(Object.assign({},xr,{ref:{id:'autre'}}));out.xfRepli=!!(g2&&g2.plane)&&g2.plane.o.join(',')==='10,0,5';
    const g3=cgEvalRef({k:'xf',ctx:[],path:[nb.occ.id],ref:{id:'zz'},loc:{plane:{o:[0,0,5],n:[1,0,0]}}});out.xfAbsente=g3===null;
    const g4=cgEvalRef({k:'xf',ctx:[],path:[nb.occ.id],ref:{id:'C1'},loc:{axis:{o:[3,0,0],d:[0,0,1]}}});out.xfAxe=!!(g4&&g4.axis)&&g4.axis.o.join(',')==='13,0,0';
    // ── arête / sommet d'un autre composant (46 : asmXeEval)
    const circ=[];for(let i=0;i<=24;i++){const t=i/24*2*Math.PI;circ.push([3+2*Math.cos(t),2*Math.sin(t),7]);}
    nb.comp._snap.pedges=[{pts:[[0,0,0],[0,0,10]],mid:[0,0,5]},{pts:circ,mid:circ[12]}];
    const xa=cgEvalRef({k:'xe',ctx:[],path:[nb.occ.id],sub:'edge',pos:[0,0,5],len:10});
    out.xeAxe=!!(xa&&xa.axis)&&xa.axis.o.join(',')==='10,0,5'&&Math.abs(Math.abs(xa.axis.d[2])-1)<1e-9;
    const xc=cgEvalRef({k:'xe',ctx:[],path:[nb.occ.id],sub:'edge',pos:circ[12].slice(),len:12.5});
    out.xeCentre=!!(xc&&xc.point)&&Math.hypot(xc.point.o[0]-13,xc.point.o[1],xc.point.o[2]-7)<1e-6&&!!xc.plane;
    const xv=cgEvalRef({k:'xe',ctx:[],path:[nb.occ.id],sub:'vtx',pos:[0,0,5],len:10,vpos:[0,0,9]});
    out.xeSommet=!!(xv&&xv.point)&&xv.point.o.join(',')==='10,0,10';
    out.xeAbsente=cgEvalRef({k:'xe',ctx:[],path:[nb.occ.id],sub:'edge',pos:[50,50,50],len:10})===null;
    // ── fonction déposée sur l'en-tête d'un autre corps (treeFeatToBody)
    out.memeCorpsRefuse=!treeDropBody('b1').accept({kind:'feature',id:'E1'});
    out.versAutreCorps=treeFeatToBody('E3','b1')===true&&doc.features.find(function(x){return x.id==='E3';}).body==='b1';
    out.repRefusee=treeFeatToBody('RP','b2')===false&&doc.features.find(function(x){return x.id==='RP';}).body==='b1';
    // ── un clic sur un plan de l'origine vide le lot Ctrl+clic (sinon le corps ne se replie plus)
    doc.fold={origin:false};treeSel=['E1','E2'];v2=rendu2();
    const pxy=v2.all.find(function(r){return /Plan XY/.test(r.innerHTML||'')&&r.onclick;});
    if(pxy)pxy.onclick(ev(''));out.planVideLot=!!pxy&&treeSel.length===0&&sel.kind==='plane';
    // ── double-clic sur une fonction en lecture seule : modéliser ET la sélectionner
    let ofv=null;const as2=asmShow;asmShow=function(p,m){ofv=p.join('/')+':'+m;return true;};
    treeInstOpen.add(nb.occ.id);v2=rendu2();
    const coll2=v2.all.find(function(r){return /Collerette/.test(txt(r))&&r.ondblclick;});
    if(coll2)coll2.ondblclick();out.ouvreFonction=ofv===nb.occ.id+':part';asmShow=as2;
    asmMode='asm';
    try{v2=rendu2();const box=v2.top.find(function(r){return r.className==='tgroupbox';});var ri=v2.top.findIndex(function(r){return /tactive/.test(r.className||'');});out.placer=!!box&&v2.top.indexOf(box)===ri+1&&tout(box,[]).some(function(r){return /Repères/.test(txt(r));})&&tout(box,[]).some(function(r){return /Origine de/.test(txt(r));})&&v2.top.some(function(r){return /Bride:1/.test(r.innerHTML||'');});}catch(e){out.placer='ERR '+e.message;}
    asmMode='part';
    return out;`;
  vm.runInContext('var __REF='+fs.readFileSync(path.join(__dirname,'fixtures','arbre_reference.json'),'utf8'),ctx);
  let o;
  try{o=await vm.runInContext('(async()=>{'+body+'})()',ctx);}
  catch(e){console.log('FATAL',String(e&&e.stack||e).slice(0,800));process.exit(1);}
  if(process.argv.includes('--ecrire')){fs.mkdirSync(path.join(__dirname,'fixtures'),{recursive:true});fs.writeFileSync(path.join(__dirname,'fixtures','arbre_reference.json'),JSON.stringify(o.ref,null,1));console.log('  référence écrite : tests/fixtures/arbre_reference.json');}
  o.cas.forEach(c=>{
    A(c.diff<0&&c.n===c.nb&&c.n>5,'identique à la référence — '+c.nom+' ('+c.n+' lignes)');
    if(c.diff>=0)console.log('     ligne '+c.diff+'\n     v1 '+c.a+'\n     v2 '+c.b);
  });
  A(o.oeilCorps,'👁 du corps : bodyToggleVis (masqué dans la vue)');
  A(o.triCorps===true,'▶/▼ du corps : be.open basculé');
  A(o.triRep,'▶/▼ de la répétition : f.open basculé');
  A(o.ctrl==='E1','Ctrl+clic : ajoute au lot (treeSelToggle)');
  A(o.mv==='E1:1','▼ : featMove(id, +1)');
  A(o.clic==='feature:E1|E1','clic simple : sélection et lot remis à zéro');
  A(o.option,'modèle et dessinateur exposés (treeModel, treeDraw)');
  console.log('  — lot 1 : assemblage');
  A(o.v2Section,'section « Composants (1) »');
  A(o.racineActive&&o.pieceDansBoite&&o.boiteApresRacine,'la pièce active (racine) : son contenu modifiable juste sous elle, avant Composants (maquette)');
  A(o.brideFerme,'le composant non édité est replié (▶), son contenu absent');
  A(o.brideOuvert,'▶ : son contenu apparaît en lecture seule (grisé : corps et fonctions)');
  A(o.dblModele,'double-clic sur ce contenu : asmShow(chemin, « part ») comme aujourd\'hui');
  A(o.placer===true,'mode Placer : section « Repères » (origine, repères) imbriquée sous le composant actif');
  console.log('  — lot 2 : ×N, liaisons, recherche');
  A(o.grpFerme,'3 occurrences identiques → une ligne « Vis ×3 » repliée');
  A(o.grpOuvert,'▶ : les 3 occurrences apparaissent');
  A(o.dossierLiaisons,'section « ⚙ Liaisons (1) »');
  A(o.ligneLiaison,'ligne de liaison : Pivot · Bride:1 → Origine de « racine » (libellé du panneau), rz 35° en infobulle');
  A(o.clicLiaison,'clic sur la liaison : asmShow(porteur, « asm », occurrence)');
  A(o.rechAccent,'recherche sans accent : « percage » trouve « Perçage Ø6 », marquée');
  A(o.rechParents,'recherche : parents gardés, le reste masqué');
  A(o.rechAutreComp,'recherche dans un composant non édité (contenu en lecture seule)');
  A(o.rechVide,'recherche sans résultat : message');
  console.log('  — lot 3 : glisser-déposer   ('+o.ordreAvant+' → '+o.ordreApres+')');
  A(o.refusAutreCorps,'une fonction ne se dépose pas dans un autre corps');
  A(o.sourceRefusee,'source de répétition déposée sous sa répétition : refusé (antériorité)');
  A(o.descendu,'fonction déposée plus bas : elle passe APRÈS la cible (blocs de répétition entiers)');
  A(o.remonte,'fonction déposée plus haut : elle passe AVANT la cible');
  console.log('  — référence : face d’un autre composant');
  A(o.xfPlan,'face plane d’une occurrence décalée de 10 mm : plan exprimé dans le composant actif');
  A(o.xfRepli,'référence durable perdue : retrouvée par la géométrie mémorisée');
  A(o.xfAbsente,'face disparue : null (l’élément garde sa position, ⚠)');
  A(o.xfAxe,'face cylindrique : axe exprimé dans le composant actif');
  A(o.xeAxe,'arête droite d’un autre composant : axe exprimé dans le composant actif');
  A(o.xeCentre,'arête circulaire : centre (et plan du cercle)');
  A(o.xeSommet,'sommet : l’extrémité la plus proche de la position mémorisée');
  A(o.xeAbsente,'arête disparue : null (position mémorisée, ⚠)');
  A(o.memeCorpsRefuse,'fonction déposée sur son propre corps : refusée');
  A(o.versAutreCorps,'extrusion déposée sur un autre corps : elle s’y applique');
  A(o.repRefusee,'répétition (références de son corps) : ne change pas de corps');
  A(o.planVideLot,'clic sur un plan de l’origine : le lot Ctrl+clic est vidé');
  A(o.ouvreFonction,'double-clic sur une fonction en lecture seule : modéliser son composant (puis la sélectionner)');
  A(o.corpsVersComp,'corps déposé sur un composant : asmCmdMoveTo(« body », corps, composant)');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,600));process.exit(1);});
