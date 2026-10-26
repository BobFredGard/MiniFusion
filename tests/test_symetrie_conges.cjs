// SYMÉTRIE + CONGÉS EXACTS sur le vrai noyau OCCT. Retour utilisateur : « le dernier congé,
// dans la symétrie, fait des misères des fois ». Pour chaque scénario on compare la pièce
// symétrisée à la pièce SANS symétrie (même document, répétition masquée) : volume ×2,
// faces ×2 (pièces disjointes), chaque congé COPIÉ apparié (m = t, sans erreur) et posé sur
// l'image miroir exacte de l'arête source. Variantes : nombre et ordre des congés, ordre
// timeline (congé après la symétrie), cote amont modifiée, double symétrie, esquisse posée
// sur un PLAN DE CONSTRUCTION, et le fichier réel (fixtures/symetrie_conges_cg.miniFusion).
// Cause du défaut (2026-10-26) : l'esquisse copiée d'une esquisse sur plan de construction
// gardait son lien `cg` — cgResolveAll la recalait à chaque rejeu sur le plan SOURCE : la
// nervure « symétrique » retombait sur l'originale et ses congés copiés s'accrochaient à
// n'importe quoi (arête source, arête de 0,6 mm, volume nul). De plus, l'ancre du congé
// copié était jetée et se ré-ancrait au hasard sur l'esquisse source ou la plaque.
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
const reel=fs.readFileSync(path.join(ROOT,'tests','fixtures','symetrie_conges_cg.miniFusion'),'utf8');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;',ctx);
  const R=`
  const P=[];const p=s=>P.push(String(s));
  const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
  const vol=sh=>{const G=new occt.GProp_GProps_1();occt.BRepGProp.VolumeProperties_1(sh,G,false,false,false);const v=G.Mass();G.delete();return v;};
  const cnt=(sh,T)=>{let n=0;const ex=new occt.TopExp_Explorer_2(sh,occt.TopAbs_ShapeEnum[T],occt.TopAbs_ShapeEnum.TopAbs_SHAPE);while(ex.More()){n++;ex.Next();}ex.delete();return n;};
  const bb=sh=>{const b=new occt.Bnd_Box_1();occt.BRepBndLib.Add(sh,b,true);const a=b.CornerMin(),z=b.CornerMax();b.delete();return [a.X(),a.Y(),a.Z(),z.X(),z.Y(),z.Z()];};
  const f2=v=>(+v).toFixed(2);
  // rejeu complet (même chemin que l'appli : hôtes, construction, repSyncStale, rejeu exact)
  const mesure=()=>{markDirty();rebuild();const FR=occFinalShape(null);
    const o={v:vol(FR.shape),f:cnt(FR.shape,'TopAbs_FACE'),s:cnt(FR.shape,'TopAbs_SOLID'),b:bb(FR.shape),
      bad:(FR.msgs||[]).filter(m=>/impossible|introuvable|divergente/.test(m))};
    try{FR.shape.delete();}catch(e){}return o;};
  // la même pièce SANS la symétrie : répétition et instances masquées le temps d'un rejeu
  const sansSym=rp=>{const ks=doc.features.filter(f=>f.repeatId===rp.id);
    rp.visible=false;ks.forEach(k=>k.visible=false);occCkClear();const o=mesure();
    rp.visible=true;ks.forEach(k=>k.visible=true);return o;};
  const miroir=(q,n)=>{const d=q[0]*n[0]+q[1]*n[1]+q[2]*n[2];return [q[0]-2*d*n[0],q[1]-2*d*n[1],q[2]-2*d*n[2]];};
  const N={YZ:[1,0,0],XZ:[0,1,0],XY:[0,0,1]};
  // chaque congé COPIÉ : apparié en entier, sans erreur, sur l'image miroir de l'arête source
  const verifCopies=(tag,rp)=>{
    // les SOURCES d'abord : un congé déjà impossible sur l'original ne prouve rien sur la copie
    doc.features.filter(f=>f.type==='xfillet'&&!f.repeatId&&f.visible!==false).forEach(f=>
      att(f._m&&f._m.m===f._m.t&&!f._err,tag+' : congé source '+f.name+' '+(f._m?f._m.m+'/'+f._m.t:'?')+' '+(f._err||'')));
    const ks=doc.features.filter(f=>f.repeatId===rp.id&&f.type==='xfillet');
    ks.forEach(k=>{
      const src=doc.features.find(f=>f.id===k._src);
      const n=N[k.repIndex===2&&rp.plane2?rp.plane2:rp.plane];
      att(k._m&&k._m.m===k._m.t&&k._m.t===k.edges.length,tag+' : '+k.name+' (copie '+k.repIndex+') apparié '+(k._m?k._m.m+'/'+k._m.t:'?'));
      att(!k._err,tag+' : '+k.name+' (copie) en erreur : '+k._err);
      (k.edges||[]).forEach((e,j)=>{const s=src&&src.edges[j];if(!s)return;
        const m=miroir(s.pos,n),d=Math.hypot(m[0]-e.pos[0],m[1]-e.pos[1],m[2]-e.pos[2]);
        att(d<0.05,tag+' : '+k.name+' (copie '+k.repIndex+') arête '+(j+1)+' en ('+e.pos.map(f2)+'), miroir attendu ('+m.map(f2)+')');});
    });
    return ks.length;
  };
  // ---------- pièce de base : plot x X0..30, y 5..15, h = 20 ; congés A..E ----------
  const plot=(x0,h)=>{
    const sk={id:'sk_t',name:'Plot',plane:'XY',origin:[0,0,0],points:{},entities:[],constraints:[],dims:[]};
    [['p0',x0,5,'e0','p1'],['p1',30,5,'e1','p2'],['p2',30,15,'e2','p3'],['p3',x0,15,'e3','p0']].forEach(l=>{
      sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});
    doc.sketches=[sk];doc.cgeo=[];
    doc.features=[{id:'ex_t',type:'extrude',name:'Plot',sketchId:'sk_t',op:'add',distance:h}];
  };
  const XF=(id,pos,r)=>({id,type:'xfillet',name:'Congé '+id,visible:true,tangent:true,
    edges:[{pos:pos.slice(),pos0:pos.slice(),r,len:0,anchor:null,name:id,seed:1}]});
  const C={A:()=>XF('A',[30,5,10],2),B:()=>XF('B',[30,15,10],3),C:()=>XF('C',[30,10,20],1.5),
    D:()=>XF('D',[10,5,10],2.5),E:()=>XF('E',[10,10,0],1)};
  const scen=(tag,ordre,plan,opt)=>{
    opt=opt||{};
    plot(10,opt.h||20);
    ordre.forEach(k=>doc.features.push(C[k]()));
    const rp={id:'rp_t',type:'repeat',name:'Symétrie',mode:'mir',copies:1,plane:plan,base:['ex_t'].concat(ordre.filter(k=>!(opt.apres||[]).includes(k))),children:[],visible:true};
    if(opt.plane2)rp.plane2=opt.plane2;
    // congés « après » : placés APRÈS la symétrie dans la timeline (hors sélection)
    const apres=doc.features.filter(f=>(opt.apres||[]).includes(f.id));
    doc.features=doc.features.filter(f=>!apres.includes(f));
    doc.features.push(rp);repGenChildren(rp);
    doc.features.push(...apres);
    occCkClear();
    const ref=sansSym(rp);
    const m=mesure();
    const k=opt.plane2?4:2;
    // congé après la symétrie : il n'arrondit que l'original → on ôte sa part d'une copie
    let vAtt=k*ref.v,fAtt=k*ref.f;
    if(apres.length){const ks=doc.features.filter(f=>f.repeatId===rp.id);
      apres.forEach(f=>f.visible=false);rp.visible=false;ks.forEach(x=>x.visible=false);occCkClear();const nu=mesure();
      apres.forEach(f=>f.visible=true);rp.visible=true;ks.forEach(x=>x.visible=true);
      vAtt=ref.v+(k-1)*nu.v;fAtt=ref.f+(k-1)*nu.f;occCkClear();mesure();}
    const n=verifCopies(tag,rp);
    p(tag+' : vol '+f2(m.v)+' (attendu '+f2(vAtt)+'), faces '+m.f+' ('+fAtt+'), solides '+m.s+', '+n+' congé(s) copié(s)');
    att(Math.abs(m.v-vAtt)<0.05,tag+' : volume '+f2(m.v)+' au lieu de '+f2(vAtt));
    // pièces collées au plan de symétrie : un seul solide, faces de jonction fusionnées
    if(!opt.colle){att(m.f===fAtt,tag+' : '+m.f+' faces au lieu de '+fAtt);
      att(m.s===k,tag+' : '+m.s+' solide(s) au lieu de '+k);}
    else att(m.s===1,tag+' : '+m.s+' solide(s) au lieu de 1 (pièces collées)');
    att(!m.bad.length,tag+' : avertissements '+JSON.stringify(m.bad));
    return rp;
  };
  scen('A,B,C / YZ',['A','B','C'],'YZ');
  scen('C,B,A / YZ',['C','B','A'],'YZ');
  scen('B,C,A / XZ',['B','C','A'],'XZ');
  scen('A seul / YZ',['A'],'YZ');
  scen('A,C / XY (plan de l esquisse, collées)',['A','C'],'XY',{colle:true});
  scen('A,B,C,D,E / YZ',['A','B','C','D','E'],'YZ');
  scen('E,D,C,B,A / XZ',['E','D','C','B','A'],'XZ');
  scen('A,B,C double YZ+XZ',['A','B','C'],'YZ',{plane2:'XZ'});
  scen('A,B + C après la symétrie',['A','B','C'],'YZ',{apres:['C']});
  // ---------- cote amont : hauteur 20 → 32, la copie suit (repSyncStale) ----------
  {
    const rp=scen('A,B,C puis h=32',['A','B','C'],'YZ');
    doc.features.find(f=>f.id==='ex_t').distance=32;
    const pC=doc.features.find(f=>f.id==='C');pC.edges[0].pos=[30,10,32];pC.edges[0].pos0=[30,10,32];
    occCkClear();const ref=sansSym(rp);const m=mesure();
    const n=verifCopies('h=32',rp);
    p('h=32 : vol '+f2(m.v)+' (attendu '+f2(2*ref.v)+'), faces '+m.f+' ('+2*ref.f+'), '+n+' congé(s) copié(s)');
    att(Math.abs(m.v-2*ref.v)<0.05,'h=32 : volume '+f2(m.v)+' au lieu de '+f2(2*ref.v));
    att(m.f===2*ref.f,'h=32 : '+m.f+' faces au lieu de '+2*ref.f);
    att(Math.abs(m.b[5]-32)<0.05,'h=32 : hauteur '+f2(m.b[5]));
  }
  // ---------- esquisse sur PLAN DE CONSTRUCTION (le cas du retour utilisateur) ----------
  // nervure : plan décalé de YZ (x = 12), rectangle y 5..15 × z 0..20, extrusion ±2,5
  const nervure=d=>{
    const sk={id:'sk_n',name:'Nervure',plane:'CG',cg:{id:'cg_n'},origin:[0,0,0],points:{},entities:[],constraints:[],dims:[],seq:1};
    [['p0',5,0,'e0','p1'],['p1',15,0,'e1','p2'],['p2',15,20,'e2','p3'],['p3',5,20,'e3','p0']].forEach(l=>{
      sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});
    doc.sketches=[sk];
    doc.cgeo=[{id:'cg_n',kind:'plane',how:'offset',name:'Plan 1',refs:[{k:'o',id:'YZ'}],p:{d},visible:false}];
    cgResolveAll();
    doc.features=[{id:'ex_n',type:'extrude',name:'Nervure',sketchId:'sk_n',op:'add',distance:2.5,mid:true},
      XF('N1',[d,15,20],1.5),XF('N2',[d+1.25,10,20],1),XF('N3',[d,5,20],2)];
  };
  {
    nervure(12);
    const rp={id:'rp_n',type:'repeat',name:'Symétrie',mode:'mir',copies:1,plane:'XZ',base:['ex_n','N1','N2','N3'],children:[],visible:true};
    doc.features.push(rp);repGenChildren(rp);
    occCkClear();const ref=sansSym(rp);const m=mesure();
    const n=verifCopies('plan de construction',rp);
    const kex=doc.features.find(f=>f.repeatId==='rp_n'&&f.type==='extrude');
    const ksk=doc.sketches.find(s=>s.id===kex.sketchId);
    p('plan de construction : vol '+f2(m.v)+' (attendu '+f2(2*ref.v)+'), faces '+m.f+' ('+2*ref.f+'), solides '+m.s+', '+n+' congé(s) copié(s) ; esquisse copiée u=('+ksk.axU.map(f2)+')');
    att(Math.abs(m.v-2*ref.v)<0.05,'plan de construction : volume '+f2(m.v)+' au lieu de '+f2(2*ref.v)+' (copie superposée à l original ?)');
    att(m.f===2*ref.f,'plan de construction : '+m.f+' faces au lieu de '+2*ref.f);
    att(m.s===2,'plan de construction : '+m.s+' solide(s) au lieu de 2');
    att(Math.abs(m.b[1]+15)<0.3&&Math.abs(m.b[4]-15)<0.3,'plan de construction : y '+f2(m.b[1])+'..'+f2(m.b[4])+' au lieu de ±15');
    att(!m.bad.length,'plan de construction : avertissements '+JSON.stringify(m.bad));
    // le plan bouge (x = 12 → 20) : la source suit le plan, la copie suit la source
    doc.cgeo[0].p.d=20;
    ['N1','N2','N3'].forEach((id,i)=>{const f=doc.features.find(x=>x.id===id);const q=[[20,15,20],[21.25,10,20],[20,5,20]][i];f.edges[0].pos=q.slice();f.edges[0].pos0=q.slice();f.edges[0].anchor=null;});
    occCkClear();const ref2=sansSym(rp);const m2=mesure();
    const n2=verifCopies('plan déplacé',rp);
    p('plan déplacé (x=20) : vol '+f2(m2.v)+' (attendu '+f2(2*ref2.v)+'), x '+f2(m2.b[0])+'..'+f2(m2.b[3])+', '+n2+' congé(s) copié(s)');
    att(Math.abs(m2.v-2*ref2.v)<0.05,'plan déplacé : volume '+f2(m2.v)+' au lieu de '+f2(2*ref2.v));
    att(Math.abs(m2.b[0]-18.75)<0.3&&Math.abs(m2.b[3]-21.25)<0.3,'plan déplacé : x '+f2(m2.b[0])+'..'+f2(m2.b[3])+' au lieu de 18,75..21,25 (copie restée sur l ancien plan ?)');
    att(Math.abs(m2.b[1]+15)<0.3&&Math.abs(m2.b[4]-15)<0.3,'plan déplacé : y '+f2(m2.b[1])+'..'+f2(m2.b[4])+' au lieu de ±15');
    att(!m2.bad.length,'plan déplacé : avertissements '+JSON.stringify(m2.bad));
  }
  // ---------- fichier réel : symétrie double d'une nervure sur plan de construction ----------
  {
    await bundleRestore(${JSON.stringify(reel)},{rebuild:false});
    occCkClear();const m=mesure();
    const rp=doc.features.find(f=>f.type==='repeat');
    const n=verifCopies('fichier réel',rp);
    const src=doc.features.filter(f=>f.type==='xfillet'&&!f.repeatId);
    src.forEach(f=>att(f._m&&f._m.m===f._m.t&&!f._err,'fichier réel : congé source '+f.name+' '+(f._m?f._m.m+'/'+f._m.t:'?')+' '+(f._err||'')));
    p('fichier réel : vol '+f2(m.v)+', faces '+m.f+', solides '+m.s+', '+n+' congé(s) copié(s), '+m.bad.length+' avertissement(s)');
    att(n===6,'fichier réel : 6 congés copiés attendus, vu '+n);
    att(Math.abs(m.v-96370.28)<0.5,'fichier réel : volume '+f2(m.v)+' au lieu de 96370,28');
    att(m.f===79,'fichier réel : '+m.f+' faces au lieu de 79');
    att(!m.bad.length,'fichier réel : avertissements '+JSON.stringify(m.bad));
    // rejeu à froid (cache vidé) : même résultat
    occCkClear();const m2=mesure();
    att(Math.abs(m2.v-m.v)<1e-6&&m2.f===m.f,'fichier réel : rejeu à froid différent ('+f2(m2.v)+', '+m2.f+' faces)');
  }
  if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  ✗ '+m));}
  else{p('');p('TOUT EST CONFORME');}
  return P.join('\\n');`;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'symetrie_conges.js'});
  console.log(r);
  process.exit(/ECHECS|✗/.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
