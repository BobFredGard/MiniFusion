// FAO — l'arbre FAO suit le document RÉELLEMENT chargé (ouverture / F5) :
//  · deserialise() remplace doc.fao en entier ; sans re-rendu, l'arbre gardait
//    celui du document précédent — le posage affichait ▼ (flèche active) mais
//    AUCUNE opération dessous (symptôme « posage là, opérations absentes ») ;
//  · le libellé Masquer/Afficher doit coller à l'état réel : « Masquer » = la
//    trace est visible, « Afficher » = elle est masquée.
// Note harnais : innerHTML='' ne vide PAS les enfants du stub DOM — on remet
// children à zéro AVANT chaque rendu, comme le fait test_fao.cjs.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const T=function(){ return document.getElementById('faoTree'); };
    const clear=function(){ const t=T(); if(t)t.children.length=0; };
    const walk=function(n){ let txt=''; if(!n)return txt;
      if(n.textContent)txt+=n.textContent;
      if(n.children)for(let k=0;k<n.children.length;k++)txt+=walk(n.children[k]);
      return txt; };
    const rows=function(){ const t=T(); return t?t.children.length:0; };
    const row=function(i){ const t=T(); return t&&t.children?t.children[i]:null; };
    const last=function(i){ const r=row(i);
      return r&&r.children?r.children[r.children.length-1]:null; };
    const render=function(){ clear(); faoRenderTree(); };

    const mk=function(id,name,nops,open){
      const s=faoDefaultSetup(); s.id=id; s.name=name;
      s.stock={x0:0,y0:0,z0:0,x1:100,y1:80,z1:25};
      s.tools=[{id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06}];
      s.open=open; s.ops=[];
      for(let i=0;i<nops;i++) s.ops.push({id:id+'_op'+(i+1),on:true,toolId:'T1',
        type:'facing',x0:5,y0:5,x1:95,y1:75,ztop:25,zbot:0,ae:6,np:0});
      return s;
    };
    const asJson=function(name,s){
      return JSON.stringify({app:'MiniFusion',v:1,name:name,sketches:[],features:[],
        bodyVis:{},bodies:[],bodySeq:1,activeBody:null,fold:{sk:false,origin:false},
        sel:{kind:null,id:null},fao:{setups:[s],activeSetupId:s.id}});
    };

    /* ============ 1. document A : le rendu sort bien posage + operations ============ */
    doc.fao={setups:[mk('sA','Posage A',2,true)],activeSetupId:'sA'};
    render();
    A(rows()===3,'rendu local : posage + 2 operations ('+rows()+' lignes)');

    /* ============ 2. OUVERTURE d'un autre document ============ */
    clear(); // l'arbre est vide : SEULE l'ouverture peut le remplir
    await deserialise(asJson('Posage B',mk('sB','Posage B',1,true)),{rebuild:false});
    A(rows()===2,'ouverture : arbre rempli par le fichier (posage + 1 op) — '+rows()+' lignes');
    A(walk(row(0)).indexOf('Posage B')>=0,
      'ouverture : le posage affiche est celui du fichier ('+JSON.stringify(walk(row(0)).slice(0,40))+')');
    A(walk(row(1)||{children:[]}).indexOf('1. ')>=0,
      'ouverture : l operation est bien sous le posage');
    A(!!last(1)&&last(1).textContent==='Masquer',
      'ouverture : trace visible -> bouton « Masquer » ('+(last(1)?last(1).textContent:'-')+')');

    /* ============ 3. libellé Masquer / Afficher = l'etat reel ============ */
    const op=doc.fao.setups[0].ops[0];
    op.hidden=true; render();
    A(!!last(1)&&last(1).textContent==='Afficher',
      'trace masquee -> bouton « Afficher » ('+(last(1)?last(1).textContent:'-')+')');
    op.hidden=false; render();
    A(!!last(1)&&last(1).textContent==='Masquer','retour a l etat visible');

    /* ============ 4. le masquage SURVIT a l'ouverture ============ */
    op.hidden=true;
    clear();
    await deserialise(asJson('Posage B',doc.fao.setups[0]),{rebuild:false});
    A(doc.fao.setups[0].ops[0].hidden===true,'le masquage est enregistre avec le document');
    A(rows()===2,'reouverture : arbre a nouveau rempli ('+rows()+' lignes)');
    A(!!last(1)&&last(1).textContent==='Afficher',
      'reouverture : libelle « Afficher » ('+(last(1)?last(1).textContent:'-')+')');

    const bad=P.filter(function(x){return x.indexOf('ECHEC')===0;});
    if(bad.length){P.push('');P.push('ECHECS ('+bad.length+') :');bad.forEach(function(m){P.push('  x '+m);});}
    else P.push('TOUT EST CONFORME');
    return P.join('\\n');
  })()`,ctx);
  console.log(out);
  process.exit(/ECHECS/.test(out)?1:0);
})().catch(e=>{console.error('FATAL',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
