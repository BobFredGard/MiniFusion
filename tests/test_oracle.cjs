// Tests de référence (V0.7.0) : chaque recette de tests/oracle/cas.cjs est construite dans
// MiniFusion (noyau OCCT réel), puis volume, surface, centre de gravité et encombrement sont
// comparés aux valeurs calculées à la main. `node tests/test_oracle.cjs --ecrire` régénère
// docs/oracle.md (tableau des cas, formules, écarts).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const CAS=require('./oracle/cas.cjs');
const TOL={v:1e-6,a:1e-6,c:1e-6,box:1e-6}; // v, a : relatif ; c, box : mm
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  sandbox.__CAS=CAS;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const res=[];
    const PL={XY:{o:[0,0,0],u:[1,0,0],v:[0,1,0],n:[0,0,1]},XZ:{o:[0,0,0],u:[1,0,0],v:[0,0,1],n:[0,-1,0]},YZ:{o:[0,0,0],u:[0,1,0],v:[0,0,1],n:[1,0,0]}};
    const mesure=sh=>{
      const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);
      const p=G.CentreOfMass(),v=G.Mass(),c=[p.X(),p.Y(),p.Z()];G.delete();
      const H=new occt.GProp_GProps_1();occt.BRepGProp.SurfaceProperties_1(sh,H,false,false);const a=H.Mass();H.delete();
      const B=new occt.Bnd_Box_1();occt.BRepBndLib.AddOptimal(sh,B,false,false);
      const m=B.CornerMin(),M=B.CornerMax(),box=[[m.X(),m.Y(),m.Z()],[M.X(),M.Y(),M.Z()]];B.delete();
      return {v,a,c,box};
    };
    for(const K of __CAS){
      const r={nom:K.nom,ok:true,ecarts:[],mesure:null};
      try{
        docResetEmpty();doc.name=K.nom;
        doc.sketches=[];doc.features=[];doc.bodies=[{id:'b1',name:'Corps 1',c:null}];doc.bodySeq=2;doc.activeBody='b1';
        (K.sk||[]).forEach(S=>{
          const P=S.o?{o:S.o,u:S.u,v:S.v,n:S.n}:PL[S.plan||'XY'];
          const sk={id:S.id,name:S.id,plane:S.o?'FACE':(S.plan||'XY'),origin:P.o,axU:P.u,axV:P.v,axN:P.n,points:{},entities:[],constraints:[],dims:[],seq:1,visible:false};
          const pt=(x,y)=>{const id='p'+(sk.seq++);sk.points[id]={x,y};return id;};
          const ent=e=>{e.id='e'+(sk.seq++);sk.entities.push(e);return e;};
          const poly=L=>{const ids=L.map(([x,y])=>pt(x,y));ids.forEach((id,i)=>ent({t:'line',p1:id,p2:ids[(i+1)%ids.length]}));};
          if(S.rect){const [x0,y0,x1,y1]=S.rect;poly([[x0,y0],[x1,y0],[x1,y1],[x0,y1]]);}
          if(S.poly)poly(S.poly);
          if(S.cercle)ent({t:'circle',pc:pt(S.cercle[0],S.cercle[1]),r:S.cercle[2]});
          if(S.axe)S._axe=ent({t:'line',p1:pt(...S.axe[0]),p2:pt(...S.axe[1]),axis:true,construction:true}).id;
          (S.trous||[]).forEach(([x,y])=>ent({t:'cpoint',p:pt(x,y),hole:true}));
          doc.sketches.push(sk);
        });
        let n=0;
        (K.f||[]).forEach(F=>{
          const id='F'+(++n);
          if(F.ext!=null){
            const op=F.op||'add',f={id,type:'extrude',name:id,sketchId:F.ext,distance:F.d,op:op==='new'?'add':op,visible:true,mid:false,upto:null};
            if(op==='new'){const b='b'+doc.bodySeq++;doc.bodies.push({id:b,name:'Corps '+b.slice(1),c:null});f.body=b;f.newBody=true;}
            else f.body=F.corps||'b1';
            doc.features.push(f);
          }else if(F.rev!=null){
            const S=K.sk.find(s=>s.id===F.rev);
            doc.features.push({id,type:'revolve',name:id,sketchId:F.rev,axis:{k:'line',id:S._axe},angle:F.angle,op:F.op||'add',visible:true,body:F.corps||'b1'});
          }else if(F.trou!=null){
            doc.features.push({id,type:'hole',name:id,sketchId:F.trou,kind:F.type||'simple',d:F.d,thread:null,cbD:F.cbD||0,cbH:F.cbH||0,csD:0,csA:90,
              end:F.fin||'blind',depth:F.prof||10,tip:F.pointe!=null?F.pointe:118,flip:false,op:'cut',visible:true,body:F.corps||'b1'});
          }else if(F.comb!=null){
            doc.features.push({id,type:'combine',name:id,body:F.comb,tools:F.outils,mode:F.mode||'union',keep:false,visible:true});
          }
        });
        ensureBodies();markDirty();rebuild();
        if(builtEngine!=='exact')throw new Error('noyau exact non utilisé ('+builtEngine+')');
        const err=doc.features.filter(f=>f._err).map(f=>f.name+' : '+f._err);
        if(err.length)throw new Error(err.join(' ; '));
        const FR=occFinalShape(null);
        const m=mesure(FR.shape);occCleanup(FR,null);
        r.mesure=m;
        const E=K.attendu,T=Object.assign({},${JSON.stringify(TOL)},K.tol||{});
        const rel=(k,x,y)=>{const e=Math.abs(x-y)/Math.max(1,Math.abs(y));r.ecarts.push([k,e,x,y]);if(!(e<=T[k]))r.ok=false;};
        const abs=(k,x,y,t)=>{const e=Math.abs(x-y);r.ecarts.push([k,e,x,y]);if(!(e<=t))r.ok=false;};
        if(E.v!=null)rel('v',m.v,E.v);
        if(E.a!=null)rel('a',m.a,E.a);
        if(E.c)E.c.forEach((y,i)=>abs('c'+'xyz'[i],m.c[i],y,T.c));
        if(E.cr!=null)abs('cr',Math.hypot(m.c[0],m.c[1]),E.cr,T.c);
        if(E.cz!=null)abs('cz',m.c[2],E.cz,T.c);
        if(E.box)E.box.forEach((P,j)=>P.forEach((y,i)=>abs((j?'max':'min')+'xyz'[i],m.box[j][i],y,T.box)));
      }catch(e){r.ok=false;r.err=String(e&&e.message||e);}
      res.push(r);
    }
    return res;
  `.replace('${JSON.stringify(TOL)}',JSON.stringify(TOL));
  const res=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== tests de référence : '+res.length+' pièces ===');
  let ko=0;
  res.forEach((r,i)=>{
    const K=CAS[i],pire=r.ecarts.reduce((m,e)=>e[1]>m[1]?e:m,['',0]);
    if(!r.ok)ko++;
    console.log((r.ok?'  ✓ ':'  ✗ ')+r.nom+' — '+K.titre+(r.err?' — ERREUR '+r.err:' — écart max '+pire[0]+' '+pire[1].toExponential(2)));
    if(!r.ok&&!r.err)r.ecarts.filter(e=>!(e[1]<=1e-6)).forEach(e=>console.log('      '+e[0]+' : mesuré '+e[2]+' attendu '+e[3]));
  });
  if(process.argv.includes('--ecrire')){
    const L=['# Tests de référence','','Généré par `node tests/test_oracle.cjs --ecrire`. Chaque pièce de [`tests/oracle/cas.cjs`](../tests/oracle/cas.cjs) est décrite par une petite recette ; MiniFusion la construit avec son noyau exact et mesure **volume**, **surface**, **centre de gravité** et **encombrement**, comparés à des valeurs **calculées à la main** (formules ci-dessous). Aucune valeur attendue ne vient d’un logiciel de CAO.','',
      'Tolérances : volume et surface 10⁻⁶ en relatif, centre de gravité et encombrement 10⁻⁶ mm. La suite tourne à chaque version (CI).','',
      '| Pièce | Mesures | Résultat | Écart max | Formules |','|---|---|---|---|---|'];
    res.forEach((r,i)=>{const K=CAS[i],pire=r.ecarts.reduce((m,e)=>e[1]>m[1]?e:m,['',0]);
      const mes=[K.attendu.v!=null?'V':'',K.attendu.a!=null?'A':'',(K.attendu.c||K.attendu.cr!=null)?'G':'',K.attendu.box?'boîte':''].filter(Boolean).join(', ');
      L.push('| '+K.titre+' | '+mes+' | '+(r.ok?'✅':'❌')+' | '+(pire[0]?pire[0]+' : '+pire[1].toExponential(1):'—')+' | '+String(K.calc||'').replace(/\|/g,'\\|')+' |');});
    L.push('','Ajouter un cas : une entrée dans `tests/oracle/cas.cjs` (recette + valeurs attendues + formules), puis `node tests/test_oracle.cjs --ecrire`.','');
    fs.mkdirSync(path.join(ROOT,'docs'),{recursive:true});
    fs.writeFileSync(path.join(ROOT,'docs','oracle.md'),L.join('\n'));
    console.log('docs/oracle.md écrit');
  }
  if(ko){console.log('\n*** '+ko+' PIÈCE(S) HORS TOLÉRANCE ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
