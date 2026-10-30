// V0.23.20 — FAO : copier / coller d'une ou plusieurs opérations et d'un posage complet.
//  · Ctrl+clic / Maj+clic : sélection multiple dans l'arbre (même posage) ;
//  · opérations collées après la sélection, nouveaux ids, outil absent ajouté ;
//  · posage collé après le posage actif : nom libre, ids neufs, rien de partagé ;
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=await vm.runInContext(`(async function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const mk=function(id,name,tools,nops){
      const s=faoDefaultSetup(); s.id=id; s.name=name; s.tools=tools; s.ops=[];
      for(let i=0;i<nops;i++) s.ops.push({id:id+'_op'+(i+1),on:true,toolId:tools[0].id,
        type:'facing',x0:5,y0:5,x1:95,y1:75,ztop:25,zbot:0,ae:6+i,np:0});
      return s;
    };
    const T1={id:'T1',num:1,name:'Fraise D10',kind:'flat',d:10,cornerR:0,flutes:2,vc:250,fz:0.06};
    const T9={id:'T9',num:9,name:'Boule D4',kind:'ball',d:4,cornerR:2,flutes:2,vc:200,fz:0.03};
    const a=mk('sA','PA',[T1,T9],4), b=mk('sB','PB',[Object.assign({},T1)],1);
    a.ops[2].toolId='T9';
    doc.fao={setups:[a,b],activeSetupId:'sA'};
    const ev=function(o){ return Object.assign({ctrlKey:false,shiftKey:false,metaKey:false},o||{}); };

    /* 1. sélection multiple : clic op1, Maj+clic op3 -> op1..op3 */
    faoSelectOp('sA','sA_op1');
    A(faoMultiClick(ev({shiftKey:true}),a,a.ops[2])===true,'Maj+clic traité');
    let so=faoSelectedOps();
    A(so&&so.ops.length===3,'Maj+clic : 3 opérations ('+(so?so.ops.length:0)+')');
    faoMultiClick(ev({ctrlKey:true}),a,a.ops[1]);
    so=faoSelectedOps();
    A(so&&so.ops.map(o=>o.id).join()==='sA_op1,sA_op3','Ctrl+clic retire op2 ('+(so?so.ops.map(o=>o.id).join():'')+')');
    A(faoMultiClick(ev(),a,a.ops[3])===false&&faoMulti.length===0,'clic simple = sélection unique');
    faoSelectOp('sA','sA_op1'); faoMultiClick(ev({ctrlKey:true}),a,a.ops[2]);

    /* 2. copier + coller dans le posage B (outil T9 absent -> ajouté) */
    A(faoCopy()===2,'Ctrl+C : 2 opérations copiées');
    faoSelectSetup('sB');
    A(faoPaste()===2,'Ctrl+V : 2 opérations collées');
    A(b.ops.length===3,'posage B : 1 + 2 opérations ('+b.ops.length+')');
    A(b.ops[1].ae===6&&b.ops[2].ae===8,'ordre conservé');
    A(b.ops[1].id!=='sA_op1'&&b.ops[2].id!=='sA_op3','ids neufs');
    A(b.ops[1].toolId==='T1','outil identique repris (T1)');
    const t9=b.tools.filter(t=>t.kind==='ball'&&t.d===4)[0];
    A(!!t9&&b.ops[2].toolId===t9.id,'outil absent ajouté au posage B ('+(t9?t9.id:'-')+')');
    A(a.ops.length===4&&a.ops[0].id==='sA_op1','posage A intact');
    b.ops[1].ae=99; A(a.ops[0].ae===6,'opérations indépendantes (aucune référence partagée)');

    /* 3. coller après l'opération sélectionnée */
    faoSelectOp('sA','sA_op2');
    faoPaste();
    A(a.ops.length===6&&a.ops[2].ae===6&&a.ops[3].ae===8&&a.ops[4].id==='sA_op3','collage juste après op2');

    /* 4. posage complet */
    faoSelectSetup('sA');
    A(faoCopy()===1,'Ctrl+C sur le posage');
    A(faoPaste()===1,'Ctrl+V : posage collé');
    const r=faoRoot();
    A(r.setups.length===3&&r.setups[1].name==='PA_COPIE','posage inséré après PA, nommé PA_COPIE ('+r.setups.map(s=>s.name).join()+')');
    const c=r.setups[1];
    A(c.id!=='sA'&&r.activeSetupId===c.id,'id neuf et posage actif');
    A(c.ops.length===6&&c.ops.every(o=>a.ops.every(q=>q.id!==o.id)),'opérations recopiées avec ids neufs');
    A(c.tools.length===2&&c.stock.x1===a.stock.x1&&c.machine===a.machine,'outils, brut et machine recopiés');
    c.stock.x1=1; A(a.stock.x1!==1,'brut indépendant');
    faoPaste(); A(faoRoot().setups.some(s=>s.name==='PA_COPIE2'),'2e collage : PA_COPIE2');

    const bad=P.filter(function(x){return x.indexOf('ECHEC')===0;});
    if(bad.length){P.push('');P.push('ECHECS ('+bad.length+') :');bad.forEach(function(m){P.push('  x '+m);});}
    else P.push('TOUT EST CONFORME');
    return P.join('\\n');
  })()`,ctx);
  console.log(out);
  process.exit(/ECHECS/.test(out)?1:0);
})().catch(e=>{console.error('FATAL',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
