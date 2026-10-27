// Antériorité (43) : une fonction ne s'appuie que sur ce qui la précède, comme dans Fusion.
// Sources de répétition limitées à l'amont ; déplacement (▲▼, glisser dans l'arbre) refusé
// s'il crée un lien vers l'aval, défaut ancien toléré ; ⚠ dans l'arbre pour les défauts
// existants, liens souples (ancres d'arêtes) exclus ; fichier réel : Support Pédale.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm'),fs=require('fs'),path=require('path');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const {ctx,loadErr}=loadApp();
  if(loadErr)console.log('LOAD-ERR (non bloquant)',String(loadErr.message||loadErr).slice(0,200));
  const body=`
    const o={};
    const sk=function(id,n,host){const s={id:id,name:n,plane:host?"FACE":"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
      points:{a:{x:0,y:0},b:{x:10,y:0}},entities:[{id:"l1",t:"line",p1:"a",p2:"b"}],constraints:[],dims:[],visible:true};
      if(host)s.host={feat:host,tag:"TOP",x:0,y:0,name:"Face 1"};return s;};
    const init=function(){
      doc.sketches=[sk("sk1","A"),sk("sk2","B","E1"),sk("sk3","C")];
      doc.bodies=[{id:"b1",name:"Corps 1"}];doc.activeBody="b1";doc.cgeo=[];
      doc.features=[
        {id:"E1",type:"extrude",name:"Bloc",sketchId:"sk1",distance:20,op:"add",visible:true,body:"b1"},
        {id:"RP",type:"repeat",name:"Rép",mode:"lin",copies:1,dist:15,angle:0,axis:"X",plane:"YZ",base:["E1"],visible:true,body:"b1"},
        {id:"I1",type:"extrude",name:"Bloc (rép 1)",sketchId:"sk1",distance:20,op:"add",visible:true,repeatId:"RP",repIndex:1,body:"b1"},
        {id:"E2",type:"extrude",name:"Bossage",sketchId:"sk2",distance:5,op:"add",visible:true,body:"b1"},
        {id:"XF",type:"xfillet",name:"Congé",edges:[{pos:[0,0,0],r:1,anchor:{t:"e",sk:"sk1",id:"l1",z:0,side:1}}],visible:true,body:"b1"},
        {id:"E3",type:"extrude",name:"Plot",sketchId:"sk3",distance:5,op:"add",upto:{ex:"E1",side:1},visible:true,body:"b1"}
      ];
      tlMark=null;sel={kind:null,id:null};treeSel=[];
    };
    const ordre=function(){return doc.features.map(function(f){return f.id;}).join(' ');};
    const etiquettes=function(box){return (box.children||[]).filter(function(l){return l.children&&l.children[1];}).map(function(l){return l.children[1].textContent;});};

    // ── liens décrits
    init();
    const d=function(id){return antDeps(doc.features.find(function(f){return f.id===id;})).map(function(x){return x.id+(x.soft?'~':'');}).join(',');};
    o.liens=[d('RP'),d('E2'),d('XF'),d('E3'),d('I1')];
    o.aucunDefaut=antViolations(null,true).length===0;

    // ── sources de répétition : l'amont seulement
    let lab=etiquettes(repSourceList(['E1'],function(){},null,doc.features.find(function(f){return f.id==='RP';})));
    o.srcAmont=lab.length===1&&/Bloc/.test(lab[0]);
    lab=etiquettes(repSourceList(['E1','E2'],function(){},null,doc.features.find(function(f){return f.id==='RP';})));
    o.srcAvalCochee=lab.length===2&&/^⚠/.test(lab[1])&&/Bossage/.test(lab[1])&&!/⚠/.test(lab[0]);
    lab=etiquettes(repSourceList([],function(){},null));
    o.srcCreation=lab.length===5&&lab.some(function(l){return /Rép/.test(l);}); // création en fin de fil : Bloc, Rép, Bossage, Congé, Plot (V0.11.30 : une répétition se répète)
    tlMark='E2';
    lab=etiquettes(repSourceList([],function(){},null));
    o.srcCreationMarqueur=lab.length===2&&/Bloc/.test(lab[0])&&/Rép/.test(lab[1]);
    o.amont=repAmont('E1',null)&&!repAmont('E2',null)&&!repAmont('XF',null);
    tlMark=null;

    // ── déplacements refusés (▲▼)
    init();let av=ordre();
    o.srcSousRep=!featMove('E1',1)&&ordre()===av&&/Rép/.test(featMoveWhy||'')&&/source de la répétition/.test(featMoveWhy);
    o.repSurSrc=!featMove('RP',-1)&&ordre()===av&&/Rép/.test(featMoveWhy||'');
    // Bossage passe le bloc de répétition (aucun lien), puis bute sur Bloc qui porte sa face
    o.hote=featMove('E2',-1)&&!featMove('E2',-1)&&ordre()==='E1 E2 RP I1 XF E3'&&/face portant/.test(featMoveWhy||'');
    init();
    o.soupleRefuse=(function(){
      // XF ancré sur l'esquisse de Bloc : remonter au-dessus de Bloc est refusé (3 crans)
      for(let n=0;n<3;n++){if(!featMove('XF',-1))return /arêtes créées par « Bloc »/.test(featMoveWhy||'');}
      return false;})();
    init();av=ordre();
    o.jusqua=(function(){for(let n=0;n<4;n++){if(!featMove('E3',-1))return /jusqu/.test(featMoveWhy||'')&&doc.features[1].id==='E3';}return false;})();
    init();
    o.libre=featMove('E3',-1)&&featMoveWhy===null&&ordre()==='E1 RP I1 E2 E3 XF';
    // message de l'arbre
    init();featMove('E1',1);featMoveFail();
    o.message=/⛔ Déplacement refusé : « Rép » doit rester après « Bloc »/.test(faceEl.textContent);

    // ── glisser dans l'arbre : refus entier, pas d'arrêt à mi-chemin
    init();av=ordre();
    o.glisserRefus=!treeFeatMoveTo('E2','E1')&&ordre()===av&&/⛔/.test(faceEl.textContent);
    o.glisserOk=treeFeatMoveTo('XF','E3')&&ordre()==='E1 RP I1 E2 E3 XF';

    // ── défaut existant : toléré, signalé, réparable
    init();
    doc.features=[doc.features[3],doc.features[0],doc.features[1],doc.features[2],doc.features[4],doc.features[5]]; // Bossage avant Bloc
    const W=antWarnMap();
    o.warnMap=W.has('E2')&&W.size===1&&/« Bloc »/.test(W.get('E2')[0]);
    o.toléré=featMove('E3',-1);               // déplacement sans rapport : permis
    o.réparable=featMove('E1',-1)&&ordre().indexOf('E1')<ordre().indexOf('E2');
    // ⚠ dans l'arbre
    init();
    doc.features=[doc.features[3],doc.features[0],doc.features[1],doc.features[2],doc.features[4],doc.features[5]];
    const t=document.getElementById('tree');const n0=t.children.length;renderTree();
    const rows=t.children.slice(n0);
    const rB=rows.find(function(r){return /Bossage/.test(r.innerHTML||'');});
    const rC=rows.find(function(r){return /Congé/.test(r.innerHTML||'');});
    o.arbreWarn=!!rB&&/antwarn/.test(rB.innerHTML)&&/Antériorité/.test(rB.innerHTML);
    o.arbreSansFaux=!!rC&&!/antwarn/.test(rC.innerHTML);
    // lien souple déjà à l'envers (Congé avant Bloc) : pas de ⚠
    init();
    doc.features=[doc.features[4],doc.features[0],doc.features[1],doc.features[2],doc.features[3],doc.features[5]];
    o.soupleNonSignale=antWarnMap().size===0&&antViolations(null,true).length===1;

    // ── fichier réel
    const D=JSON.parse(__SUPPORT).doc;
    doc=D;
    const v=antViolations();
    o.reel=v.length===1&&v[0].f.name.indexOf('Esquisse 5')>=0&&v[0].dep.name.indexOf('Découpe Esquisse 4')>=0;
    o.reelTxt=v.map(antMsg).join(' | ');
    return o;
  `;
  vm.runInContext('var __SUPPORT='+JSON.stringify(fs.readFileSync(path.join(__dirname,'..','Exemples','Support Pédale Déportée R1200RT 2011.miniFusion'),'utf8')),ctx);
  let o;
  try{o=await vm.runInContext('(async()=>{'+body+'})()',ctx);}
  catch(e){console.log('FATAL',String((e&&e.stack)||e).slice(0,800));process.exit(1);}
  console.log('  — liens : '+o.liens.join(' | '));
  A(o.liens[0]==='E1','répétition → ses sources');
  A(o.liens[1]==='E1','esquisse posée sur une face → la fonction qui porte la face');
  A(o.liens[2]==='E1~','congé → la fonction dont l’esquisse ancre ses arêtes (lien souple)');
  A(o.liens[3]==='E1','extrusion « jusqu’à » → sa cible');
  A(o.liens[4]==='','instance de répétition : non contrôlée');
  A(o.aucunDefaut,'document dans l’ordre : aucun défaut');
  console.log('  — sources de répétition');
  A(o.srcAmont,'répétition modifiée : seules les fonctions en amont sont proposées');
  A(o.srcAvalCochee,'source déjà cochée en aval (ancien fichier) : visible, marquée ⚠');
  A(o.srcCreation,'création en fin de fil : toutes les fonctions répétables');
  A(o.srcCreationMarqueur,'création avec le marqueur de temps : seulement ce qui le précède');
  A(o.amont,'repAmont');
  console.log('  — déplacements');
  A(o.srcSousRep,'source descendue sous sa répétition : refusé, ordre intact, raison donnée');
  A(o.repSurSrc,'répétition remontée au-dessus de sa source : refusé');
  A(o.hote,'extrusion remontée au-dessus de la face qui porte son esquisse : refusé');
  A(o.soupleRefuse,'congé remonté au-dessus de la fonction qui crée ses arêtes : refusé');
  A(o.jusqua,'extrusion « jusqu’à » : s’arrête juste après sa cible');
  A(o.libre,'déplacement sans dépendance : permis');
  A(o.message,'▲▼ refusé : message « ⛔ Déplacement refusé »');
  A(o.glisserRefus,'glisser dans l’arbre : refus entier, pas d’arrêt à mi-chemin');
  A(o.glisserOk,'glisser dans l’arbre sans dépendance : permis');
  console.log('  — défauts existants');
  A(o.warnMap,'défaut existant relevé');
  A(o.toléré,'défaut existant : les autres déplacements restent permis');
  A(o.réparable,'défaut existant : le déplacement qui le répare est permis');
  A(o.arbreWarn,'⚠ dans l’arbre sur la fonction fautive, raison en infobulle');
  A(o.arbreSansFaux,'pas de ⚠ sur les fonctions saines');
  A(o.soupleNonSignale,'lien souple déjà à l’envers : refusé au déplacement mais pas signalé');
  console.log('  — fichier réel : '+o.reelTxt);
  A(o.reel,'Support Pédale : Esquisse 5 posée sur une découpe placée après son extrusion');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,600));process.exit(1);});
