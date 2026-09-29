// 2026-09-30s : sélection dans l'arborescence — les trois défauts signalés :
//  1. Ctrl+clic ouvrait le panneau Répétition (et y ajoutait la source) ;
//  2. après un lot, sélectionner une répétition laissait l'ancienne sélection ;
//  3. on ne voyait pas quelles fonctions sont les sources d'une répétition.
// On pilote les VRAIS gestionnaires de clic posés par renderTree() (lisibles dans
// le DOM du harnais) : on ne teste pas une réimplémentation.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
let ko=0;
const A=(c,m)=>{if(!c){ko++;console.log('  x '+m);}else console.log('  ✓ '+m);};
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext(`
    var __confirm=[]; var __confirmer=true;
    window.confirm=function(){__confirm.push(1);return __confirmer;};
    window.alert=function(){};
  `,ctx);

  const body = `
    const out={};
    const rectSk=function(id,n,x0,y0,x1,y1){
      const sk={id:id,name:n,plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
        points:{},entities:[],constraints:[],dims:[],visible:false};
      [["a",x0,y0],["b",x1,y0],["c",x1,y1],["d",x0,y1]].forEach(function(q){sk.points[q[0]]={x:q[1],y:q[2]};});
      [["a","b"],["b","c"],["c","d"],["d","a"]].forEach(function(e,i){sk.entities.push({id:"l"+i,t:"line",p1:e[0],p2:e[1]});});
      return sk;
    };
    doc.sketches=[];doc.features=[];doc.entNames={};
    doc.sketches.push(rectSk("sk1","A",0,0,40,30));
    doc.sketches.push(rectSk("sk2","B",10,10,25,22));
    doc.features.push({id:"E1",type:"extrude",name:"Alpha",sketchId:"sk1",distance:20,op:"add",visible:true,mid:false,upto:null});
    doc.features.push({id:"E2",type:"extrude",name:"Poche",sketchId:"sk2",distance:30,op:"cut",visible:true,mid:false,upto:null});
    doc.features.push({id:"RP",type:"repeat",name:"Rép",mode:"lin",copies:2,dist:15,angle:0,axis:"X",plane:"YZ",
      base:["E1"],children:[],visible:true});
    doc.features.push({id:"I1",type:"extrude",name:"Zeta",sketchId:"sk1",distance:20,op:"add",visible:true,repeatId:"RP",repIndex:2,_src:"E1"});
    markDirty();rebuild();

    // ---- pilote de clic : appelle le gestionnaire RÉEL de la ligne de l'arbre
    const evClic=function(ctrl){return {ctrlKey:!!ctrl,shiftKey:false,altKey:false,metaKey:false,
      target:{classList:{contains:function(){return false;}},className:""},
      stopPropagation:function(){},preventDefault:function(){}};};
    // Le DOM du harnais n'efface PAS children quand innerHTML='' : on ne considère
    // donc que les lignes du DERNIER rendu (on compte ce que le rendu précédent avait
    // laissé, et on ne garde que ce qui est arrivé depuis).
    let total=0,nLignes=0;
    const lignes=function(){
      const t=document.getElementById('tree');
      const c=(t&&t.children)?t.children:[];
      return c.slice(Math.max(0,c.length-nLignes));
    };
    const ligneDe=function(pred){
      const ls=lignes();
      // On cherche la DERNIÈRE occurrence : les gestionnaires de clic rejouent
      // renderTree() eux-mêmes, donc la fenêtre contient plusieurs rendus et une
      // ligne périmée ne doit jamais gagner.
      for(let i=ls.length-1;i>=0;i--){ if(pred(ls[i]))return ls[i]; }
      return null;
    };
    const nomDe=function(d){return d&&d.innerHTML?d.innerHTML:'';};
    // le NOM affiché de la ligne (span.nm) : l'infobulle du badge de sources contient
    // lui aussi des noms de fonctions, et.search sur tout le HTML serait ambigu
    const nomAffiche=function(d){
      const m=/class="nm">([^<]*)/.exec(nomDe(d));
      return m?m[1]:'';
    };
    const parNom=function(nom){return ligneDe(function(d){return nomAffiche(d).indexOf(nom)>=0;});};
    const rendre=function(){
      renderTree();
      const c=document.getElementById('tree').children;
      nLignes=Math.max(0,c.length-total);
      total=c.length;
    };
    // Le harnais ne construit pas innerHTML : on cherche les cases à cocher en
    // parcourant les nœuds réellement créés.
    const chercher=function(noeud,pred,acc){
      acc=acc||[];
      if(!noeud)return acc;
      if(pred(noeud))acc.push(noeud);
      const kids=noeud.children||[];
      for(let i=0;i<kids.length;i++)chercher(kids[i],pred,acc);
      return acc;
    };
    rendre();
    out.nbLignes=nLignes;

    // ── 1) Ctrl+clic sur deux fonctions : NE DOIT PAS ouvrir la répétition
    repMode=null;treeSel=[];sel={kind:null,id:null};rendre();
    parNom("Alpha").onclick(evClic(true));
    out.t1a=treeSel.join("+");
    out.repApres1=(repMode===null)?'nul':'OUVERT';
    parNom("Poche").onclick(evClic(true));
    out.t1b=treeSel.join("+");
    out.repApres2=(repMode===null)?'nul':'OUVERT';
    out.selApres2=sel.id;

    // ── 2) clic simple sur la répétition : le lot doit être VIDÉ
    parNom("Rép").onclick(evClic(false));
    out.t2=treeSel.join("+");
    out.sel2=sel.id;
    out.repApres3=(repMode===null)?'nul':'OUVERT';

    // ── 2b) clic simple sur une INSTANCE : le lot doit être vidé aussi
    treeSel=["E1","E2"];
    parNom("Zeta").onclick(evClic(false));
    out.t2b=treeSel.join("+");
    out.sel2b=sel.id;

    // ── 3) sources visibles dans l'arbre quand la répétition est sélectionnée
    rendre();
    out.marqueSource=lignes().filter(function(d){return /srcmark/.test(nomDe(d));}).length;
    // le repère doit être sur la SOURCE (Bloc), pas sur la poche
    out.marqueSurBloc=lignes().filter(function(d){return /srcmark/.test(nomDe(d))&&nomAffiche(d).indexOf("Alpha")>=0;}).length;
    out.marqueSurPoche=/srcmark/.test(nomDe(ligneDe(function(d){return nomAffiche(d).indexOf("Poche")>=0;})))?1:0;
    out.badgeRep=/repsrc/.test(nomDe(parNom("Rép")))?1:0;
    out.htmlRep=nomDe(parNom("Rép")).slice(0,240);
    out.selAuMoment=sel.kind+':'+sel.id;
    out.badgeChiffre=(nomDe(parNom("Rép")).match(/repsrc[^>]*>[^<]*([0-9]+)</)||[])[1]||'?';
    // sans répétition sélectionnée, plus de repère
    sel={kind:'null',id:null};rendre();
    out.marqueSansSel=/srcmark/.test(nomDe(parNom("Alpha")))?1:0;

    // ── 4) le panneau de répétition liste les fonctions répétables, en cases
    sel={kind:'feature',id:"RP"};
    enterRepMode();
    out.repOuvert=repMode?1:0;
    out.cochées=(repMode.feats||[]).join("+");
    const p=document.getElementById('props');
    // on repart d'un panneau VIDE : le harnais n'efface pas children, on vide donc
    // le tableau nous-mêmes pour ne compter qu'UN rendu
    p.children.length=0;
    renderRepPanel();
    const cases=chercher(p,function(n){return n.tagName==='INPUT'&&n.className==='repsrcchk';});
    out.nbCases=cases.length;
    out.cochees=cases.filter(function(c){return c.checked;}).length;
    const noms=chercher(p,function(n){return n.tagName==='SPAN'&&n.textContent;}).map(function(n){return n.textContent;});
    out.nomsListe=noms.join('|');
    out.toutesRepetables=doc.features.filter(function(f){return repCanFeature(f.id);}).map(function(f){return f.id;}).join("+");

    // ── 5) ÉDITION d'une répétition : la MÊME liste à cocher, cochée sur les
    //       sources actuelles — et cocher/décocher agit sur la répétition.
    repMode=null;sel={kind:'feature',id:"RP"};
    renderProps();
    const pe=document.getElementById('props');
    pe.children.length=0;
    renderProps();
    const casesEdit=chercher(pe,function(n){return n.tagName==='INPUT'&&n.className==='repsrcchk';});
    out.nbCasesEdit=casesEdit.length;
    out.cocheesEdit=casesEdit.filter(function(c){return c.checked;}).length;
    // la liste d'édition contient-elle les mêmes noms que celle de création ?
    const nomsEdit=chercher(pe,function(n){return n.tagName==='SPAN'&&n.textContent;}).map(function(n){return n.textContent;}).join('|');
    out.nomsEdit=nomsEdit;
    out.pasDeBoutonAjouter=(function(){
      const t=chercher(pe,function(n){return n.tagName==='BUTTON';}).map(function(n){return n.textContent;}).join('|');
      return t.indexOf('Ctrl')<0;
    })();
    // décocher la source -> la répétition perd sa source, les instances suivent
    const avant=doc.features.filter(function(f){return f.repeatId==="RP";}).length;
    out.instancesAvant=avant;
    const c0=casesEdit.filter(function(c){return c.checked;})[0];
    if(c0){c0.checked=false;c0.onchange();}
    out.baseApres=(doc.features.find(function(f){return f.id==="RP";}).base||[]).join("+");
    out.instancesApres=doc.features.filter(function(f){return f.repeatId==="RP";}).length;
    // la source est-elle de nouveau cochée après re-rendu ?
    renderProps();
    const pe2=document.getElementById('props');pe2.children.length=0;renderProps();
    out.cocheesApres=chercher(pe2,function(n){return n.tagName==='INPUT'&&n.className==='repsrcchk';}).filter(function(c){return c.checked;}).length;

    // ── 6) RÉGRESSION : « je peux décocher mais pas cocher ».
    //    Le navigateur bascule la case PUIS envoie change. Si le panneau se
    //    reconstruit dans onchange, le nœud cliqué est détruit pendant le clic.
    //    On reproduit donc l'ordre exact, et on compte les reconstructions.
    sel={kind:'feature',id:"RP"};
    // état de départ connu : E1 source, E2 pas source
    doc.features.find(function(f){return f.id==="RP";}).base=["E1"];
    const p3=document.getElementById('props');p3.children.length=0;
    const origRenderProps=renderProps;
    let nbRender=0;
    renderProps=function(){nbRender++;return origRenderProps.apply(this,arguments);};
    renderProps();
    const cases3=chercher(p3,function(n){return n.tagName==='INPUT'&&n.className==='repsrcchk';});
    out.nbCases3=cases3.length;
    const decoche=cases3.filter(function(c){return c.checked;})[0];
    const aCocher=cases3.filter(function(c){return !c.checked;})[0];
    out.nbRenderInitial=nbRender;
    // 6a) COCHER : le navigateur met checked=true, puis onchange
    if(aCocher){
      aCocher.checked=true;              // ce que fait le navigateur
      aCocher.onchange();                // puis l'événement change
    }
    out.cocheRestant=aCocher?aCocher.checked:0;
    out.baseApresCheck=(doc.features.find(function(f){return f.id==="RP";}).base||[]).join("+");
    out.nbRenderApresCheck=nbRender-out.nbRenderInitial;
    out.enteteApresCheck=(function(){
      const t=chercher(p3,function(n){return n.innerHTML&&n.innerHTML.indexOf('instance(s)')>=0;});
      return t.length?t[0].innerHTML.replace(/<[^>]*>/g,''):'';
    })();
    // 6b) DÉCOCHER de la même façon
    nbRender=0;
    if(decoche){
      decoche.checked=false;
      decoche.onchange();
    }
    out.decocheRestant=decoche?decoche.checked:0;
    out.nbRenderApresUncheck=nbRender;
    out.baseApresUncheck=(doc.features.find(function(f){return f.id==="RP";}).base||[]).join("+");
    renderProps=origRenderProps;
    return out;
  `;
  let o;
  try{o=await vm.runInContext('(async()=>{'+body+'})()',ctx);}
  catch(e){console.log('FATAL '+String(e&&e.stack||e).slice(0,700));process.exit(1);}

  console.log('=== 2026-09-30s : sélection dans l arborescence ===');
  console.log('  lignes d arbre rendues : '+o.nbLignes);
  console.log('  Ctrl+clic Bloc         : lot=['+o.t1a+']  répétition='+o.repApres1);
  console.log('  Ctrl+clic + Poche      : lot=['+o.t1b+']  répétition='+o.repApres2);
  console.log('  clic simple sur Rép    : lot=['+o.t2+']  sel='+o.sel2+'  répétition='+o.repApres3);
  console.log('  clic sur instance      : lot=['+o.t2b+']  sel='+o.sel2b);
  console.log('  sources marquées       : '+(o.marqueSource?'oui':'non')+'  (source='+o.marqueSurBloc+', non-source='+o.marqueSurPoche+')');
  console.log('  badge de la répétition : '+(o.badgeRep?'présent':'absent')+'  ◀ '+o.badgeChiffre);
  console.log('  sans répétition sélectionnée, repère : '+o.marqueSansSel+' (0 attendu)');
  console.log('  panneau répétition     : ouvert='+o.repOuvert+'  cases='+o.nbCases+' (cochées '+o.cochees+')  répétables='+o.toutesRepetables);
  console.log('  liste du panneau       : '+o.nomsListe);
  console.log('  html ligne repetition  : '+o.htmlRep);
  console.log('  selection : '+o.selAuMoment);
  A(o.t1a==='E1','Ctrl+clic sur une fonction l ajoute au lot');
  A(o.repApres1==='nul'&&o.repApres2==='nul','Ctrl+clic n ouvre PLUS le panneau Répétition (défaut 1)');
  A(o.t1b==='E1+E2','le lot s accumule (E1+E2) — la suppression multiple reste possible');
  A(o.selApres2==='E2','la dernière fonction cliquée reste la sélection courante');
  A(o.t2==='RP','un clic simple sur une répétition REMPLACE le lot (plus de sélection fantôme)');
  A(o.sel2==='RP','la répétition devient la sélection courante');
  A(o.repApres3==='nul','le clic simple n ouvre pas non plus la répétition');
  A(o.t2b==='RP','un clic sur une INSTANCE vide aussi le lot');
  A(o.marqueSource>=1&&o.marqueSurBloc>=1,'la SOURCE est marquée ◀ dans l\'arbre ('+o.marqueSurBloc+' ligne(s) rendues)');
  A(o.marqueSurPoche===0,'la fonction NON source ne porte pas ce repère');
  A(o.marqueSansSel===0,'aucun repère quand aucune répétition n est sélectionnée');
  A(o.badgeRep===1&&o.badgeChiffre==='1','la répétition affiche son nombre de sources (◀ 1)');
  A(o.repOuvert===1&&o.nbCases===2,'le panneau propose une case par fonction répétable (2)');
  A(o.cochees===0,'aucune source pré-cochée quand la répétition n est pas la source courante');
  A(/Alpha/.test(o.nomsListe)&&/Poche/.test(o.nomsListe),'la liste nomme les fonctions répétables, associées ou non');
  A(o.toutesRepetables==='E1+E2','les fonctions répétables sont E1 et E2 (les instances sont exclues)');
  console.log('  édition               : cases='+o.nbCasesEdit+' (cochées '+o.cocheesEdit+')  liste='+o.nomsEdit);
  console.log('  aucun bouton Ctrl+clic : '+(o.pasDeBoutonAjouter?'oui':'NON'));
  console.log('  décocher la source    : base='+o.baseApres+'  instances '+o.instancesAvant+' -> '+o.instancesApres);
  A(o.nbCasesEdit===2,'le panneau d\'ÉDITION propose la même liste de 2 fonctions répétables');
  A(o.cocheesEdit===1,'les sources ACTUELLES sont déjà cochées (1)');
  A(o.nomsEdit.indexOf('Alpha')>=0&&o.nomsEdit.indexOf('Poche')>=0,'la liste d\'édition nomme les mêmes fonctions que la création');
  A(o.pasDeBoutonAjouter,'le bouton « Ajouter / retirer par Ctrl+clic » a disparu');
  A(o.baseApres==='','décocher retire la source de la répétition');
  A(o.cocheesApres===0,'le re-rendu reflète la nouvelle liste (0 cochée)');
  console.log('  COCHER (ordre navigateur) : cases='+o.nbCases3+'  reste cochée='+o.cocheRestant+
    '  base='+o.baseApresCheck+'  reconstructions du panneau='+o.nbRenderApresCheck);
  console.log('  en-tête mis à jour sur place : '+o.enteteApresCheck);
  console.log('  DÉCOCHER                    : reste cochée='+o.decocheRestant+
    '  base='+o.baseApresUncheck+'  reconstructions='+o.nbRenderApresUncheck);
  A(o.cocheRestant===true,'COCHER fonctionne : la case reste cochée');
  A(o.baseApresCheck==='E1+E2','cocher AJOUTE la source à la répétition (E1+E2)');
  A(o.nbRenderApresCheck===0,'le panneau ne se RECONSTRUIT pas depuis le clic (cause du bug)');
  A(/4 instance/.test(o.enteteApresCheck),'l\'en-tête « n instance(s) » se met à jour sur place (2 sources × 2)');
  A(o.decocheRestant===false&&o.baseApresUncheck==='E2','DÉCOCHER retire la source cochée (E1 cochée → il reste E2)');
  A(o.nbRenderApresUncheck===0,'décocher ne reconstruit pas le panneau non plus');
  console.log(ko?'\n*** '+ko+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
  process.exit(ko?1:0);
})().catch(e=>{console.log('FATAL',String((e&&e.message)||e).slice(0,600));process.exit(1);});