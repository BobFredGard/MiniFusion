// 2026-10-02-008 : arbre FILTRÉ au blocage ⏱ — pendant que le marqueur temps est
// actif, les fonctions EXCLUES du rejeu (index >= marqueur) ne doivent plus être
// listées dans l'arborescence : le filtre suit exactement ce que tlActiveList()
// rejoue (fonctions ET instances de répétition), le bandeau « Temps bloqué avant »
// et la ligne « ⏱ — marqueur ici — » restent les deux séparateurs visibles, et tout
// revient à la normale à la levée du marqueur (bouton « ↗ Rejouer tout »).
// On pilote les VRAIS rendus de renderTree() (DOM du harnais, comme test_arbre_selection).
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
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);

  const body = `
    const out={};
    const rectSk=function(id,n,x0,y0,x1,y1){
      const sk={id:id,name:n,plane:"XY",origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],
        points:{},entities:[],constraints:[],dims:[],visible:false};
      [["a",x0,y0],["b",x1,y0],["c",x1,y1],["d",x0,y1]].forEach(function(q){sk.points[q[0]]={x:q[1],y:q[2]};});
      [["a","b"],["b","c"],["c","d"],["d","a"]].forEach(function(e,i){sk.entities.push({id:"l"+i,t:"line",p1:e[0],p2:e[1]});});
      return sk;
    };
    doc.sketches=[];doc.features=[];doc.entNames={};doc.bodies=[];doc.bodyVis={};
    doc.sketches.push(rectSk("sk1","A",0,0,40,30));
    doc.sketches.push(rectSk("sk2","B",10,10,25,22));
    doc.features.push({id:"E1",type:"extrude",name:"Alpha",sketchId:"sk1",distance:20,op:"add",visible:true});
    doc.features.push({id:"E2",type:"extrude",name:"Poche",sketchId:"sk2",distance:30,op:"cut",visible:true});
    doc.features.push({id:"RP",type:"repeat",name:"Rép",mode:"lin",copies:2,dist:15,angle:0,axis:"X",plane:"YZ",
      base:["E1"],children:[],visible:true});
    doc.features.push({id:"I1",type:"extrude",name:"Copie 1",sketchId:"sk1",distance:20,op:"add",visible:true,repeatId:"RP",repIndex:1,_src:"E1"});
    doc.features.push({id:"I2",type:"extrude",name:"Copie 2",sketchId:"sk1",distance:20,op:"add",visible:true,repeatId:"RP",repIndex:2,_src:"E1"});
    doc.features.push({id:"E3",type:"extrude",name:"Sortie",sketchId:"sk2",distance:10,op:"add",visible:true});
    markDirty();rebuild();
    doc.features.find(f=>f.id==="RP").open=true; // répétition dépliée : instances listées

    // ---- rendu + lignes de DERNIER rendu (le DOM du harnais n'efface pas children)
    let total=0,nLignes=0;
    const lignes=function(){
      const t=document.getElementById('tree');
      const c=(t&&t.children)?t.children:[];
      return c.slice(Math.max(0,c.length-nLignes));
    };
    const rendre=function(){
      renderTree();
      const c=document.getElementById('tree').children;
      nLignes=Math.max(0,c.length-total);
      total=c.length;
    };
    const nomDe=function(d){return (d&&d.innerHTML)?d.innerHTML:'';};
    const txt=function(d){return d&&d.textContent?String(d.textContent):'';};
    const ligneDe=function(pred){
      const ls=lignes();
      for(let i=ls.length-1;i>=0;i--){ if(pred(ls[i]))return ls[i]; }
      return null;
    };
    const nomAffiche=function(d){
      const m=/class="nm">([^<]*)/.exec(nomDe(d));
      return m?m[1]:'';
    };
    const parNom=function(nom){return ligneDe(function(d){return nomAffiche(d).indexOf(nom)>=0;});};
    const contient=function(n,pat){
      if(!n)return false;
      if(pat.test(nomDe(n))||pat.test(txt(n)))return true;
      const c=n.children||[];
      for(let i=0;i<c.length;i++)if(contient(c[i],pat))return true;
      return false;
    };
    const bandeau=function(){return ligneDe(function(d){return contient(d,/Temps bloqu/);});};
    const toutTexte=function(n){ // innerHTML + textContent du sous-arbre (le bandeau range son texte dans un enfant)
      if(!n)return '';
      let s=nomDe(n)+' '+txt(n);
      const c=n.children||[];
      for(let i=0;i<c.length;i++)s+=' '+toutTexte(c[i]);
      return s;
    };
    const marqueurLigne=function(){return ligneDe(function(d){return /marqueur ici/.test(txt(d))||/marqueur ici/.test(nomDe(d));});};
    const groupe=function(){return ligneDe(function(d){return /Corps \\/ Fonctions/.test(txt(d))||/Corps \\/ Fonctions/.test(nomDe(d));});};
    const enTeteCorps=function(){return ligneDe(function(d){const h=nomDe(d);return /Corps 1/.test(h)&&/fonction\\(s\\)/.test(h);});};
    const rejouerBtn=function(){
      const b=bandeau();
      if(!b||!b.children)return null;
      for(let i=0;i<b.children.length;i++){if(String(b.children[i].textContent||'').indexOf('Rejouer tout')>=0)return b.children[i];}
      return null;
    };
    const clic=function(node){node.onclick({ctrlKey:false,shiftKey:false,altKey:false,metaKey:false,
      target:{classList:{contains:function(){return false;}},className:''},
      stopPropagation:function(){},preventDefault:function(){}});};

    // ── 0) sans marqueur : les 6 fonctions + instances sont là
    tlSetPtr(null);rendre();
    out.s0={
      alpha:parNom("Alpha")?1:0,poche:parNom("Poche")?1:0,rep:parNom("Rép")?1:0,
      copie1:parNom("Copie 1")?1:0,copie2:parNom("Copie 2")?1:0,sortie:parNom("Sortie")?1:0,
      bandeau:bandeau()?1:0,
      groupe:(groupe()?txt(groupe()):''),
      corps:(enTeteCorps()?nomDe(enTeteCorps()):'')
    };

    // ── 1) marqueur avant « Sortie » : la dernière fonction est FILTRÉE
    tlSetPtr(doc.features.find(f=>f.id==="E3"));rendre();
    out.t1={
      alpha:parNom("Alpha")?1:0,poche:parNom("Poche")?1:0,rep:parNom("Rép")?1:0,
      copie1:parNom("Copie 1")?1:0,copie2:parNom("Copie 2")?1:0,
      sortie:parNom("Sortie")?1:0,
      bandeau:bandeau()?toutTexte(bandeau()):'',
      marqueur:(marqueurLigne()?(txt(marqueurLigne())||nomDe(marqueurLigne())):''),
      groupe:(groupe()?txt(groupe()):''),
      corps:(enTeteCorps()?nomDe(enTeteCorps()):'')
    };

    // ── 2) marqueur sur l'INSTANCE « Copie 1 » : instances suivantes + Sortie filtrées,
    //       la répétition reste (elle est rejouée) mais affiche 0 instance(s)
    tlSetPtr(doc.features.find(f=>f.id==="I1"));rendre();
    out.t2={
      alpha:parNom("Alpha")?1:0,poche:parNom("Poche")?1:0,rep:parNom("Rép")?1:0,
      copie1:parNom("Copie 1")?1:0,copie2:parNom("Copie 2")?1:0,sortie:parNom("Sortie")?1:0,
      bandeau:bandeau()?toutTexte(bandeau()):'',
      repLigne:parNom("Rép")?nomDe(parNom("Rép")):''
    };

    // ── 3) levée par le vrai bouton « ↗ Rejouer tout » du bandeau : tout revient
    const btn=rejouerBtn();
    out.t3btn=btn?1:0;
    if(btn)clic(btn);
    out.t3={tlMark:tlMark};
    rendre();
    out.t3suite={
      alpha:parNom("Alpha")?1:0,rep:parNom("Rép")?1:0,copie1:parNom("Copie 1")?1:0,
      copie2:parNom("Copie 2")?1:0,sortie:parNom("Sortie")?1:0,
      bandeau:bandeau()?1:0,
      groupe:(groupe()?txt(groupe()):'')
    };
    return JSON.stringify(out);
  `;
  const raw=await vm.runInContext('(function(){'+body+'})()',ctx,{filename:'tree_filter.js'});
  const o=JSON.parse(raw);

  // 0) sans marqueur : tout est listé, aucun bandeau
  A(o.s0.alpha&&o.s0.poche&&o.s0.rep&&o.s0.copie1&&o.s0.copie2&&o.s0.sortie,'0) sans marqueur : les 6 lignes sont là (got '+JSON.stringify(o.s0).slice(0,120)+'…)');
  A(o.s0.bandeau===0,'0) sans marqueur : aucun bandeau ⏱');
  A(/Fonctions \(6\)/.test(o.s0.groupe),'0) sans marqueur : en-tête groupe = (6) — got « '+o.s0.groupe+' »');
  A(/· 4 fonction\(s\)/.test(o.s0.corps),'0) sans marqueur : en-tête corps = 4 fonctions — got « '+o.s0.corps.replace(/<[^>]*>/g,'')+' »');

  // 1) marqueur avant Sortie : Sortie filtrée, les 5 autres visibles, bandeau + marqueur
  A(o.t1.sortie===0,'1) « Sortie » doit être filtrée de l’arbre');
  A(o.t1.alpha&&o.t1.poche&&o.t1.rep&&o.t1.copie1&&o.t1.copie2,'1) les 5 fonctions rejouées restent visibles');
  A(/Temps bloqué avant « Sortie »/.test(o.t1.bandeau),'1) bandeau « Temps bloqué avant « Sortie » » — got « '+o.t1.bandeau.replace(/<[^>]*>/g,'').slice(0,90)+' »');
  A(/<b>5<\/b> fonction\(s\) rejouée\(s\)/.test(o.t1.bandeau),'1) bandeau : 5 fonctions rejouées');
  A(/marqueur ici/.test(o.t1.marqueur),'1) ligne marqueur présente');
  A(/1 fonction\(s\) masquée/.test(o.t1.marqueur),'1) ligne marqueur annonce la fonction masquée — got « '+o.t1.marqueur+' »');
  A(/Fonctions \(5\)/.test(o.t1.groupe),'1) en-tête groupe filtré = (5) — got « '+o.t1.groupe+' »');
  A(/· 3 fonction\(s\)/.test(o.t1.corps),'1) en-tête corps filtré = 3 fonctions — got « '+o.t1.corps.replace(/<[^>]*>/g,'')+' »');

  // 2) marqueur sur une instance : instances suivantes + Sortie filtrées, rép 0 instance(s)
  A(o.t2.copie1===0&&o.t2.copie2===0,'2) les instances filtrées ne sont plus listées');
  A(o.t2.sortie===0,'2) « Sortie » (après l’instance) filtrée');
  A(o.t2.alpha&&o.t2.poche&&o.t2.rep,'2) avant-marqueur visible');
  A(/Temps bloqué avant « Copie 1 »/.test(o.t2.bandeau),'2) bandeau nomme l’instance — got « '+o.t2.bandeau.replace(/<[^>]*>/g,'').slice(0,90)+' »');
  A(/<b>3<\/b> fonction\(s\) rejouée\(s\)/.test(o.t2.bandeau),'2) bandeau : 3 fonctions rejouées (E1, E2, RP)');
  A(/0 instance\(s\)/.test(o.t2.repLigne),'2) répétition affiche 0 instance(s) — got « '+o.t2.repLigne.replace(/<[^>]*>/g,'').slice(0,150)+' »');

  // 3) bouton ↗ Rejouer tout : marqueur levé, tout revient (bandeau compris)
  A(o.t3btn===1,'3) bouton « ↗ Rejouer tout » trouvé dans le bandeau');
  A(o.t3.tlMark===null,'3) tlMark levé après le bouton — got '+o.t3.tlMark);
  A(o.t3suite.sortie&&o.t3suite.copie1&&o.t3suite.copie2&&o.t3suite.alpha&&o.t3suite.rep,'3) toutes les lignes sont revenues');
  A(o.t3suite.bandeau===0,'3) bandeau disparu après levée');
  A(/Fonctions \(6\)/.test(o.t3suite.groupe),'3) en-tête groupe = (6) après levée — got « '+o.t3suite.groupe+' »');

  console.log('');
  if(ko){console.log('ECHECS ('+ko+')');process.exit(1);}
  console.log('TOUT EST CONFORME');
  process.exit(0);
})().catch(e=>{console.error('ECHEC',String((e&&e.message)||e).slice(0,600));process.exit(1);});
