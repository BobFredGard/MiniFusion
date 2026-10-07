// FAO — Ébauche 3D (7/10) : (1) le plan doit se POSER sur le fond réel de la
// poche quand « Bas » est en dessous (la passe courte qui ne remplit pas ap),
// (2) la finition des parois (case + N passes) descend de « Parois » à 0.
// Sondes A/B du 7/10 : Bas=0 / fond=5 laissait 0,5 mm sur le plancher et
// Fond ne changeait rien. Fixture : poche MANIFOLD (une seule coque) — les
// boîtes collées posent des arêtes DOUBLES à z-pile et la parité lit alors
// la cavité comme du matière (niveau au plancher émet vide).
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const out=vm.runInContext(`(function(){
    const P=[]; const A=(ok,m)=>P.push((ok?'OK   ':'ECHEC')+' : '+m);
    const mkBox=function(x0,x1,y0,y1,z0,z1){
      return {v:[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],
              t:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[2,3,7],[2,7,6],
                 [0,4,7],[0,7,3],[1,2,6],[1,6,5]]};
    };
    const V=[[0,0,0],[100,0,0],[100,80,0],[0,80,0],
             [0,0,10],[100,0,10],[100,80,10],[0,80,10],
             [20,20,5],[80,20,5],[80,60,5],[20,60,5],
             [20,20,10],[80,20,10],[80,60,10],[20,60,10],
             [0,20,10],[100,20,10],[100,60,10],[0,60,10]];
    const T=[[0,2,1],[0,3,2],
             [0,1,5],[0,5,4],[2,3,7],[2,7,6],
             [0,4,16],[0,16,19],[0,19,7],[0,7,3],
             [1,2,6],[1,6,18],[1,18,17],[1,17,5],
             [4,5,17],[4,17,13],[4,13,12],[4,12,16],
             [6,7,19],[6,19,15],[6,15,14],[6,14,18],
             [16,12,15],[16,15,19],[13,17,18],[13,18,14],
             [8,9,10],[8,10,11],
             [8,13,9],[8,12,13],[10,15,11],[10,14,15],
             [8,11,15],[8,15,12],[9,13,14],[9,14,10]];
    const PO={v:V,t:T};
    (function(){ // fermeture : chaque arete 2 fois, sens opposes
      const ed={}; let bad=0;
      for(let i=0;i<T.length;i++)for(let k=0;k<3;k++){
        const a=T[i][k],b=T[i][(k+1)%3];
        const key=Math.min(a,b)+','+Math.max(a,b);
        if(!ed[key])ed[key]=[];
        ed[key].push(a<b?1:-1);
      }
      for(const k in ed){ const e=ed[k];
        if(e.length!==2||e[0]===e[1])bad++; }
      A(bad===0,'fixture poche manifold : '+(bad?bad+' arete(s) mal fermee(s)':'36 tris, chaque arete 2 fois, sens opposes'));
    })();
    const BX={x0:-5,y0:-5,x1:105,y1:85};
    const inP=function(m){ return m.x>20.05&&m.x<79.95&&m.y>20.05&&m.y<59.95; };
    const gen=function(zbot,radial,axial,extra){
      const o={ap:1.5,ae:2,toolD:10,radial:radial,axial:axial,secu:20};
      if(extra)for(const k in extra)o[k]=extra[k];
      return faoGenRough3D(PO,BX,10,zbot,o).filter(function(m){return !m.r;});
    };
    const hist=function(cuts){
      const zs={};
      cuts.forEach(function(m){ if(!inP(m))return;
        const k=Math.round(m.z*1000)/1000; zs[k]=(zs[k]||0)+1; });
      return zs;
    };
    const minKey=function(zs){const k=Object.keys(zs).map(Number);
      return k.length?Math.min.apply(null,k):null;};
    const wallMinX=function(cuts){
      let mn=1/0;
      cuts.forEach(function(p){ if(p.z>=5-1e-9&&p.z<=10+1e-9&&inP(p)&&p.x<mn)mn=p.x; });
      return mn; };

    // --- 1. detection des fonds (parite : ni winding, ni voûte, ni interface)
    const F=faoUpFloors(PO,0,9.9);
    A(F.length===1&&F[0]===5,'fonds poche [0;9,9] = ['+F.join(',')+'] (plancher 5 seul)');
    const F2=faoUpFloors(PO,0,10);
    A(F2.length===2&&F2[0]===10&&F2[1]===5,'fonds poche [0;10] = ['+F2.join(',')+'] (+ dessus des murs)');
    const rev={v:PO.v,t:PO.t.map(function(t){return [t[0],t[2],t[1]];})};
    const FR=faoUpFloors(rev,0,9.9);
    A(FR.length===1&&FR[0]===5,'sens de triangulation inverse : ['+FR.join(',')+']');
    const Vc=faoUpFloors(mkBox(0,10,0,10,5,10),4,6);
    A(Vc.length===0,'voûte (bas d un bloc volant) ignoree : ['+Vc.join(',')+']');

    // --- 2. PLANCHER : Bas=0 (sous le fond reel) — le plan doit se poser a 5
    const h0=hist(gen(0,0.5,0,null));
    A((h0[5]||0)>0,'Bas=0 Fond=0 : plancher usine a z=5 -> '+(h0[5]||0)+' points (0 avant correctif)');
    A(minKey(h0)===5,'Bas=0 Fond=0 : rien SOUS le fond en poche (zmin '+minKey(h0)+')');
    const h0b=hist(gen(0,0.5,0.5,null));
    A((h0b[5]||0)===0,'Bas=0 Fond=0,5 : plancher intact a z=5 ('+(h0b[5]||0)+' points)');
    A((h0b[5.5]||0)>0,'Bas=0 Fond=0,5 : dernier niveau z=5,5 -> '+(h0b[5.5]||0)+' points (laisse 0,5)');
    A(minKey(h0b)===5.5,'Bas=0 Fond=0,5 : zmin poche 5,5 (vu '+minKey(h0b)+')');

    // --- 3. regression : Bas = fond reel (5) — comportement conserve
    const r0=hist(gen(5,0.5,0,null));
    A((r0[5]||0)>0,'Bas=5 Fond=0 : plancher z=5 usine ('+(r0[5]||0)+' points)');
    const r5=hist(gen(5,0.5,0.5,null));
    A((r5[5]||0)===0&&(r5[5.5]||0)>0,'Bas=5 Fond=0,5 : z=5 net ('+(r5[5]||0)+'), z=5,5 ('+(r5[5.5]||0)+')');

    // --- 4. FINITION DES PAROIS : mur x=20, D=10, Parois=0.5 -> centre a 25,5
    const m0=wallMinX(gen(5,0.5,0,null));
    A(m0>=25.49&&m0<=25.51,'finition OFF : centre min x='+m0.toFixed(3)+' (= 20 + 5 + 0,5)');
    const m1=wallMinX(gen(5,0.5,0,{finitParois:true,finitN:1}));
    A(m1>=24.999&&m1<=25.01,'finition 1 passe : contact exact x='+m1.toFixed(3)+' (20 + 5)');
    const c2=gen(5,0.5,0,{finitParois:true,finitN:2});
    const m2=wallMinX(c2);
    A(m2>=24.999&&m2<=25.01,'finition 2 passes : dernier contact x='+m2.toFixed(3));
    const inter=c2.filter(function(p){return inP(p)&&p.x>=25.2&&p.x<=25.3&&p.z>=5&&p.z<=10;}).length;
    A(inter>0,'finition 2 passes : anneau intermediaire x=25,25 -> '+inter+' points');
    const c3=gen(5,0.5,0,{finitParois:true,finitN:3});
    const i31=c3.filter(function(p){return inP(p)&&p.x>=25.33&&p.x<=25.34;}).length;
    const i32=c3.filter(function(p){return inP(p)&&p.x>=25.16&&p.x<=25.17;}).length;
    A(i31>0&&i32>0,'finition 3 passes : anneaux x=25,333 ('+i31+') et x=25,167 ('+i32+')');
    A(wallMinX(c3)>=24.999,'finition 3 passes : aucun point sous la cote theorique');
    const mr=wallMinX(gen(5,0,0,{finitParois:true,finitN:2}));
    A(mr>=24.99&&mr<=25.01,'Parois=0 + case cochee : sans effet (x='+mr.toFixed(3)+')');

    // --- 5. FICHE : case « Finir parois » + N passes (rendu, etats, aide)
    const all=function(root){const out=[];
      (function w(n){(n.children||[]).forEach(function(c){out.push(c);w(c);});})(root);
      return out;};
    const txt=function(root){return all(root).map(function(n){return String(n.textContent||'');}).join('|');};
    const findBox=function(root){return all(root).filter(function(n){
      return /input/i.test(n.tagName||'')&&n.type==='checkbox'&&/Finir les parois/.test(String(n.title||''));})[0];};
    const findNum=function(root){return all(root).filter(function(n){
      return /input/i.test(n.tagName||'')&&n.type==='number'&&/Nombre de contours de finition/.test(String(n.title||''));})[0];};
    const helpOf=function(root){return all(root).filter(function(n){
      return n.className==='fao-help'&&String(n.textContent||'').indexOf('Finition : ')===0;})[0];};
    const us=faoSetup();
    const uo={id:'ufi1',on:true,toolId:us.tools[0].id,type:'rough3d',
      ztop:10,zbot:0,ap:1.5,ae:2,radial:0.5,axial:0};
    us.ops.push(uo);
    const cA=faoOpCardElement(us,uo,0);
    const bx=findBox(cA), nA=findNum(cA);
    A(txt(cA).indexOf('Finir parois')>=0&&!!bx,'fiche : libelle « Finir parois » + case presents');
    A(!!nA&&nA.disabled===true&&!helpOf(cA),'fiche OFF : N passes grises, aide absente ('+(nA?'ok':'num introuvable')+')');
    bx.checked=true; bx.onchange();
    A(uo.finitParois===true&&uo.finitN===1,'cochage : finitParois=true, finitN=1 (defaut)');
    const cB=faoOpCardElement(us,uo,0);
    const nB=findNum(cB), hB=helpOf(cB);
    A(!!nB&&nB.disabled===false,'fiche ON : N passes reglables (disabled='+(nB?nB.disabled:'num introuvable')+')');
    A(!!hB&&hB.textContent.indexOf('Finition : 1 contour')===0,'fiche ON : aide 1 passe ('+(hB?hB.textContent.slice(0,40):'aucune')+')');
    nB.value='3'; nB.onchange();
    const hC=helpOf(faoOpCardElement(us,uo,0));
    A(uo.finitN===3&&!!hC&&hC.textContent.indexOf('Finition : 3 contour')===0,'edition N=3 : champ + aide suivent ('+uo.finitN+')');
    const cD=faoOpCardElement(us,uo,0), bD=findBox(cD), nD=findNum(cD);
    bD.checked=false; bD.onchange();
    const cE=faoOpCardElement(us,uo,0);
    A(uo.finitParois===undefined&&uo.finitN===undefined,'decochage : champs supprimes (sig pristine)');
    A(!helpOf(cE)&&findNum(cE).disabled===true,'fiche apres decochage : aide retiree, N grises');
    const uoS={id:'ufi2',on:true,toolId:us.tools[0].id,type:'rough3d',
      ztop:10,zbot:0,ap:1.5,radial:0.5,axial:0,finitParois:true,finitN:'x'};
    us.ops.push(uoS); faoSanitiseOps(us);
    const uoS2={id:'ufi3',on:true,toolId:us.tools[0].id,type:'rough3d',
      ztop:10,zbot:0,ap:1.5,radial:0.5,axial:0,finitParois:false,finitN:7};
    us.ops.push(uoS2); faoSanitiseOps(us);
    A(uoS.finitParois===true&&uoS.finitN===1,'sanitise : finitN invalide -> 1, casse gardee');
    A(uoS2.finitParois===undefined&&uoS2.finitN===undefined,'sanitise : case non cochee -> champs retires');

    return P;
  })()`,ctx);
  let ko=0;
  out.forEach(function(l){ console.log('  '+(l.indexOf('OK')===0?'✓':'✗')+' '+l.slice(7)); if(l.indexOf('ECHEC')===0)ko++; });
  if(ko){ console.log('\n'+ko+' ECHEC(S)'); process.exit(1); }
  console.log('\nTOUT EST CONFORME');
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
