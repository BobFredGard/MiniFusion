// 2026-10-02-002 : esquisse — projection d'arêtes (vives ET de tangence) + garde de l'outil ⧉.
// Régressions couvertes :
//  1) la détection du consommateur ne testait QUE f.type==='extrude' → une esquisse
//     consommée par une RÉVOLUTION était traitée comme non consommée (mauvaise antériorité) ;
//  2) deux arêtes projetant le même segment 2D (bloc avant : bord z=40 et bord z=0) étaient
//     départagées par l'ordre de `occListEdges` → l'arête du bas pouvait gagner sur celle du
//     plan d'esquisse : l'arête du plan projeté gagne désormais (écart au plan) ;
//  3) garde « noyau OCCT requis » inconditionnelle : sans noyau on ne pouvait plus rien
//     projeter, alors que le repli sur les références (corps visibles) existe toujours ;
//  4) les références violettes n'étaient pas dessinées pendant l'outil ⧉ : impossible de
//     voir la cible au survol.
// Harnais : noyau OCCT RÉEL (wasm) + boîte 100×60×40 filée R4 (seul moyen d'obtenir de
// VRAIES arêtes tangentes dans le plan z=40) — cf. test_aretes_import.cjs pour le stub THREE.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  ✗ '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox,loadErr}=loadApp();
  if(loadErr)console.log('  (harnais : buildScene interrompu — comportement normal du stub)');
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};window.confirm=function(){return true;};',ctx);
  // boîte 100×60×40, congé R4 sur l'arête haute arrière (y=60,z=40) → ligne TANGENTE
  // dans le plan z=40 (y=56) + arêtes vives du plan (y=0, x=0) et un doublon projeté du bas.
  sandbox.__shape=vm.runInContext(`(function(){
    const mk=new occt.BRepPrimAPI_MakeBox_2(new occt.gp_Pnt_3(0,0,0),100,60,40);
    const box=mk.Shape();
    const E=occListEdges(box);let cible=null;
    for(let i=0;i<E.length;i++){const a=E[i].pts[0],b=E[i].pts[E[i].pts.length-1];
      const L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
      if(L>50&&Math.abs(a[2]-40)<0.01&&Math.abs(b[2]-40)<0.01&&Math.abs(a[1]-60)<0.01){cible=E[i];break;}}
    if(!cible)return null;
    const pf=xPreviewShape(box,[{src:cible.src,r:4,mid:cible.mid}],false);
    const sh=(pf&&pf.shape)?pf.shape:box;
    globalThis.__sh=sh;
    const S=occSharpEdges(sh);
    return {edges:S.length,sharp:S.filter(e=>e.sharp).length,tangent:S.filter(e=>!e.sharp).length,
            all:occListEdges(sh).length};
  })()`,ctx);
  console.log('=== esquisse : projection d\'arêtes (vives + tangences) ===');
  console.log('  solide de test : '+JSON.stringify(sandbox.__shape));
  if(!sandbox.__shape){console.log('  ✗ solide de test impossible à produire');process.exit(1);}

  const body=`
    const out={fails:[]};
    const A=(c,m)=>{if(!c)out.fails.push(m);};
    const sh=__sh;
    occLive={shape:sh};
    const sk={id:'p1',name:'P',plane:'FACE',origin:[0,0,40],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      entities:[],points:{},constraints:[],dims:[],seq:1,visible:true};
    ensureSketchBasis(sk);doc.sketches=[sk];doc.features=[];
    openSketch('p1');
    // ── 1. références projetées sur le plan ──
    out.refs=(skEdit._refs||[]).length;
    A(out.refs>0,'références projetées présentes ('+out.refs+' = arêtes du plan)');
    const probe=(x,y)=>{const p=projectEdgeAt(sk,x,y);return p?JSON.stringify(p):null;};
    const midOf=s=>{const m=s?JSON.parse(s):null;return (m&&m.srcMid)?m.srcMid:null;};
    const E=occSharpEdges(sh);
    out.sharp=E.filter(e=>e.sharp).length;out.tangent=E.filter(e=>!e.sharp).length;
    A(out.sharp>0&&out.tangent>0,'le solide de test contient des arêtes vives ET des tangentes ('+out.sharp+'+'+out.tangent+')');
    // ── 2. arête VIVE du plan : l'arête du z=40 gagne sur celle du z=0 (même segment 2D) ──
    out.pSharp=probe(50,0);
    const m1=midOf(out.pSharp);
    A(!!m1,'arête vive projetée à (50,0) : '+out.pSharp);
    if(m1)A(Math.abs(m1[2]-40)<1e-6,'…et c\\'est bien celle DU PLAN (z=40) qui gagne, pas le doublon du bas : '+JSON.stringify(m1));
    if(m1)A(Math.abs(m1[1]-0)<1e-6,'…au bon endroit (y=0) : '+JSON.stringify(m1));
    // ── 3. arête VIVE latérale ──
    out.pSide=probe(0,30);
    const m2=midOf(out.pSide);
    A(!!m2&&Math.abs(m2[0]-0)<1e-6,'arête vive latérale projetée (x=0) : '+out.pSide);
    // ── 4. arête de TANGENCE dans le plan (le cœur du correctif) ──
    out.pTan=probe(50,56);
    const m3=midOf(out.pTan);
    A(!!m3,'arête de TANGENCE projetée à (50,56) : '+out.pTan);
    if(m3)A(Math.abs(m3[1]-56)<1e-6&&Math.abs(m3[2]-40)<1e-6,'…la ligne du congé (y=56, z=40) : '+JSON.stringify(m3));
    // ── 5. garde de l'outil Projeter (noyau + solide) ──
    out.toolGuard=(!!occHas()&&!!occLive&&!!occLive.shape);
    A(out.toolGuard===true,'garde outil : noyau OCCT + solide dispo');
    // ── 6. consommateur : RÉVOLUTION prise en compte ──
    doc.features=[{id:'rv1',type:'revolve',name:'Rév',sketchId:'p1',op:'add',angle:360}];
    out.cIdx=(typeof skConsumerIdx==='function')?skConsumerIdx(sk):-1;
    out.hostId=tlHostFeatureOfSketch(sk)?tlHostFeatureOfSketch(sk).id:null;
    A(out.cIdx===0,'skConsumerIdx détecte une RÉVOLUTION consommatrice (avant fix : -1 — extrusion seule)');
    A(out.hostId==='rv1','tlHostFeatureOfSketch retourne la révolution');
    doc.features=[];
    // ── 7. références violettes affichées pendant l'outil ⧉ ──
    const _skEl=skEl;let refDraw=0;
    skEl=function(n,attrs,parent){if(attrs&&attrs.stroke==='#bf5af2')refDraw++;return _skEl(n,attrs,parent);};
    skShowRefs=false;
    skTool='project';refDraw=0;drawSketch2D();out.projDraw=refDraw;
    skTool='select';refDraw=0;drawSketch2D();out.selDraw=refDraw;
    skEl=_skEl;
    A(out.projDraw>0,'références visibles pendant l\\'outil Projeter ('+out.projDraw+' traits violets)');
    A(out.selDraw===0,'…et masquées hors outil quand le toggle reste éteint');
    skTool='project';
    // ── 8. garde ASSOUPLEE : pas de noyau mais des références → on projette quand même ──
    const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
    const ev=(type,x,y,extra)=>{const r=Object.assign({type:type,button:0,buttons:0,shiftKey:false,
      ctrlKey:false,altKey:false,detail:0,pointerId:1,preventDefault:function(){},stopPropagation:function(){}},extra||{});
      r.clientX=x;r.clientY=y;return r;};
    const click=(wx,wy)=>{const p=C(wx,wy);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1,detail:1}));};
    const _live=occLive;
    occLive=null;
    skEdit._refs=[{x1:0,y1:0,x2:100,y2:0}];
    sk.entities=[];sk.points={};sk.constraints=[];
    click(50,0);
    out.softN=sk.entities.filter(e=>e.proj).length;
    out.softStatus=(document.getElementById('skStatus')||{}).textContent||'';
    A(out.softN===1,'repli sans noyau : projection via les références ('+out.softN+' entité, statut « '+out.softStatus+' »)');
    A(out.softStatus.indexOf('noyau OCCT')<0,'…sans message « noyau requis » tant qu\\'il reste des références');
    // ── 9. garde DURE : ni noyau ni références → message, rien de projeté ──
    skEdit._refs=[];
    sk.entities=[];sk.points={};sk.constraints=[];
    click(50,0);
    out.hardN=sk.entities.filter(e=>e.proj).length;
    out.hardStatus=(document.getElementById('skStatus')||{}).textContent||'';
    A(out.hardN===0,'sans noyau ni références : rien n\\'est projeté ('+out.hardN+')');
    A(out.hardStatus.indexOf('noyau OCCT')>=0,'…avec le message d\\'origine (« '+out.hardStatus+' »)');
    occLive=_live;
    closeSketch(false);
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+body+'})()',ctx);
  if(o.fails&&o.fails.length){console.log('ECHECS (dans le harnais) :');o.fails.forEach(m=>console.log('  ✗ '+m));ko+=o.fails.length;}
  console.log('  refs='+o.refs+' · outil='+o.toolGuard+' · consommateur revolve='+o.cIdx+
              ' · violet projeté='+o.projDraw+'/'+o.selDraw+' · repli='+o.softN+' · garde='+o.hardN);
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,900));process.exit(1);});
