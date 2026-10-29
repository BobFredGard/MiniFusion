// V0.21.0 : composants normalisés (48-composants-normalises.js). Partie modèle : toutes les
// tailles de toutes les normes donnent une géométrie saine (profil fermé, rayons ≥ 0, six pans
// dans la tête, fente dans la paroi) ; valeurs par défaut (pas gros, longueur) ; insertion comme
// composant, nouvelle occurrence pour une pièce identique, aller-retour du fichier (doc.std).
// Puis noyau OCCT réel : chaque type est rejoué, volume comparé au calcul (Pappus − six pans).
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
globalThis.__dirname=path.join(ROOT,'occt');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'occt','opencascade.full.js'),'utf8'),{filename:'occt.js'});
const {loadApp}=require('./appvm.cjs');
(async()=>{
  const real=await globalThis.opencascadeFactory({wasmBinary:fs.readFileSync(path.join(ROOT,'occt','opencascade.wasm.wasm'))});
  const {ctx,sandbox}=loadApp();
  sandbox.__realOcct=real;
  vm.runInContext('occt=__realOcct;occtReady=true;window.alert=function(){};confirm=function(){return true;};',ctx);
  const R=String.raw`
    const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
    // volume de révolution d'un polygone (r, z) autour de Z
    const pappus=P=>{let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=(a[1]-b[1])*(a[0]*a[0]+a[0]*b[0]+b[0]*b[0]);}return Math.abs(s)*Math.PI/3;};
    const area=P=>{let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s)/2;};
    const expVol=sp=>{
      let v=sp.prof?pappus(stdPolyPts(sp.prof)):0;
      (sp.ops||[]).forEach(o=>{
        if(o.k==='hex')v-=Math.sqrt(3)/2*o.s*o.s*o.t;
        if(o.k==='key')v+=area(stdPolyPts(stdKeyOutline(o)))*o.h;
      });
      return v;
    };
    // ── 1. toutes les tailles, toutes les longueurs extrêmes ──
    let n=0;const bad=[];
    STD_CATS.forEach(C=>{
      const walk=(i,st)=>{
        if(i===C.fields.length){
          n++;let sp;try{sp=C.gen(st);}catch(e){bad.push(C.k+' '+JSON.stringify(st)+' : '+e.message);return;}
          const why=[];
          if(!sp||!sp.key||!sp.name)why.push('sans nom');
          if(sp.prof){
            const P=stdPolyPts(sp.prof);
            if(P.some(p=>!isFinite(p[0])||!isFinite(p[1])||p[0]<-1e-9))why.push('profil invalide');
            if(!(pappus(P)>0))why.push('volume nul');
            const zs=P.map(p=>p[1]),z0=Math.min(...zs),z1=Math.max(...zs);
            (sp.ops||[]).forEach(o=>{
              if(o.k==='hex'){
                // le six pans (Ø sur angles e) tient dans la matière jusqu'à son fond
                const e=o.s/Math.sqrt(3),zf=o.z-o.t;
                if(zf<=z0)why.push('six pans débouchant');
                for(let k=0;k<=8;k++){const z=o.z-o.t*k/8;let rm=0;
                  // rayon extérieur du profil à la hauteur z
                  for(let j=0;j<P.length;j++){const a=P[j],b=P[(j+1)%P.length];if((a[1]-z)*(b[1]-z)<=0&&a[1]!==b[1]){rm=Math.max(rm,a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1]));}}
                  if(rm<e*1.02){why.push('six pans hors matière à z='+z.toFixed(2)+' (r '+rm.toFixed(2)+' < e/2 '+e.toFixed(2)+')');break;}}
              }
              if(o.k==='slot'&&!(o.x0<sp.prof[0][0]&&o.w>0))why.push('fente hors paroi');
            });
          }
          if(why.length)bad.push(sp.name+' : '+why.join(', '));
          return;
        }
        const f=C.fields[i],ops=f.opts(st);
        if(!ops.length){bad.push(C.k+' '+f.k+' sans option pour '+JSON.stringify(st));return;}
        // longueurs : seulement la plus courte et la plus longue (le reste est continu)
        const vals=f.k==='len'?[ops[0],ops[ops.length-1]]:ops;
        vals.forEach(o=>walk(i+1,Object.assign({},st,{[f.k]:o[0]})));
      };
      walk(0,{});
    });
    A(!bad.length,'1 : '+n+' pièces (normes × tailles × pas × longueurs extrêmes) saines'+(bad.length?' — '+bad.slice(0,6).join(' | '):''));
    // ── 2. valeurs par défaut ──
    let st=stdNormState('iso',{});
    A(st.type==='chc'&&st.size==='M6'&&st.pitch==='1'&&st.len==='20','2 : Vis ISO par défaut : CHC M6, pas gros 1, L 20 ('+JSON.stringify(st)+')');
    st=stdNormState('iso',{type:'chc',size:'M8',pitch:'0.75',len:'30'});
    A(stdSpec('iso',st).name==='CHC M8×0,75×30','3 : pas fin dans la désignation (CHC M8×0,75×30)');
    st=stdNormState('iso',{type:'chc',size:'M12',pitch:'0.75',len:'5'});
    A(st.pitch==='1.75'&&+st.len>=20,'4 : un pas ou une longueur hors norme reprend le pas gros et la longueur par défaut');
    A(stdSpec('iso',{type:'chc',size:'M8',pitch:'1.25',len:'30'}).name==='CHC M8×30','5 : pas gros : désignation « M » seule');
    st=stdNormState('ansi',{size:'#0',thr:'UNC'});
    A(st.thr==='UNF','6 : ANSI #0 : pas d UNC, UNF imposé');
    A(stdSpec('ansi',{type:'chc',size:'1/4',thr:'UNF',len:'1'}).desig==='1/4-28 UNF × 1"','7 : ANSI 1/4-28 UNF × 1"');
    A(stdNormState('key',{}).size==='8x7'&&stdNormState('plug',{}).type==='din906','8 : clavette 8×7, bouchon DIN 906 par défaut');
    // ── 3. insertion dans l'assemblage ──
    docResetEmpty();doc.name='Banc';
    const sp1=stdSpec('iso',{type:'chc',size:'M8',pitch:'1.25',len:'30'});
    const o1=(stdAddOcc(sp1)||{}).occ;
    A(o1&&asm&&asm.comps.length===2&&asmRoot().occ.length===1&&asmComp(o1.comp).doc.std.key===sp1.key,'9 : inséré comme composant de la racine, doc.std posé');
    const o2=(stdAddOcc(sp1)||{}).occ;
    A(o2&&o2.comp===o1.comp&&asm.comps.length===2&&asmRoot().occ.length===2,'10 : même vis : nouvelle occurrence, pas de second composant');
    const o3=(stdAddOcc(stdSpec('iso',{type:'chc',size:'M8',pitch:'1',len:'30'}))||{}).occ;
    A(o3&&o3.comp!==o1.comp&&asm.comps.length===3,'11 : pas fin : autre composant');
    A(asmUndo()&&asm.comps.length===2,'12 : Ctrl+Z retire le dernier composant');
    // aller-retour du fichier
    const txt=serialise();
    const b=JSON.parse(txt),t=asmTreeOfFile(b.doc||b);
    const c2=t.comps.find(c=>c.doc&&c.doc.std);
    A(c2&&c2.doc.std.key===sp1.key&&c2.doc.std.norm==='ISO 4762','13 : doc.std relu depuis le fichier');
    // ── 4. noyau exact : volumes ──
    const cases=[['iso',{type:'chc',size:'M8',pitch:'1',len:'30'}],['iso',{type:'fhc',size:'M6',len:'20'}],
      ['ansi',{type:'chc',size:'1/4',thr:'UNC',len:'1'}],['ansi',{type:'fhc',size:'#10',thr:'UNF',len:'3/4'}],
      ['plug',{type:'din906',size:'R 1/2'}],['plug',{type:'din908',size:'G 1/2'}],['plug',{type:'nptf',size:'1/4'}],
      ['pin',{type:'iso2338',size:'6',len:'30'}],['pin',{type:'iso8734',size:'6',len:'30'}],['pin',{type:'iso2339',size:'6',len:'40'}],
      ['pin',{type:'iso8752',size:'6',len:'30'}],['pin',{type:'dowel',size:'1/4',len:'1'}],['pin',{type:'spring',size:'1/8',len:'1'}],
      ['key',{type:'A',size:'8x7',len:'40'}],['key',{type:'B',size:'8x7',len:'40'}],['key',{type:'C',size:'8x7',len:'40'}]];
    const vols=()=>{const FR=occFinalShape(null);const v=FR.perBody.map(b=>occCoqueVolume(b.shape));occCleanup(FR,null);return v;};
    const root=asm.root;
    cases.forEach(([cat,s])=>{
      const sp=stdSpec(cat,s);
      const o=(stdAddOcc(sp,root)||{}).occ;if(!o){A(false,sp.name+' : insertion refusée');return;}
      asmActivate(o.comp);
      let v=[];try{v=vols();}catch(e){v=[];}
      let ex=expVol(sp);
      (sp.ops||[]).forEach(q=>{if(q.k==='slot'){const P=stdPolyPts(sp.prof),ri=P[0][0],ro=Math.max(...P.map(p=>p[0]));v.slotW=q.w;ex-=q.w*(ro-ri)*q.L*0.98;}});
      const ok=v.length===1&&Math.abs(v[0]-ex)<=Math.max(0.02*ex,0.5);
      A(ok,'14 : '+sp.name+' : un corps exact, '+(v[0]||0).toFixed(1)+' mm³ (attendu ≈ '+ex.toFixed(1)+')'+(builtEngine?' ['+builtEngine+']':''));
      asmActivate(root);
    });
    // ── 5. sur des trous : plaque percée (4 lamés, 2 simples, 2 fraisés, débouchants) ──
    docResetEmpty();asm=null;doc.name='Plaque';
    const SK=(id,off)=>{const s={id,name:id,plane:'XY',entities:[],points:{},constraints:[],dims:[],seq:1,visible:false,origin:[0,0,0]};ensureSketchBasis(s);s.origin=[0,0,off];doc.sketches.push(s);return s;};
    const sb=SK('skB',0);stdLoop(sb,[[-50,-30],[50,-30],[50,30],[-50,30]]);
    doc.features.push({id:'exB',type:'extrude',name:'Plaque',sketchId:'skB',distance:20,op:'add',visible:true,mid:false,upto:null,body:'b1'});
    const HO=(id,pts,o)=>{const s=SK('sk'+id,20);pts.forEach(p=>{const pid=addPoint(s,p[0],p[1]);s.entities.push({id:skNewEid(s),t:'cpoint',p:pid,hole:true});});
      doc.features.push(Object.assign({id,type:'hole',name:'',sketchId:s.id,kind:'simple',d:6.6,thread:null,cbD:11,cbH:6.4,csD:13,csA:90,end:'through',depth:15,tip:118,flip:false,op:'cut',visible:true,body:'b1'},o));return s;};
    const sCb=HO('hoCb',[[-40,-20],[-40,20],[40,-20],[40,20]],{kind:'cbore'});
    HO('hoS',[[-15,0],[15,0]],{});
    HO('hoCs',[[0,-20],[0,20]],{kind:'csink'});
    doc.bodies=[{id:'b1',name:'Plaque',c:null}];doc.bodySeq=2;doc.activeBody='b1';
    asmEnsure();asm._force=true;markDirty();rebuild();asm._force=false;
    const Rt=asmRoot();
    const Gp=asmSnapGeomOf(Rt),H=Gp?stdHoles(Gp):[];
    const cnt=(k,up)=>H.filter(h=>h.kind===k&&(h.n[2]>0.5)===up).length;
    A(cnt('cbore',true)===4&&cnt('simple',true)===2&&cnt('csink',true)===2,'15 : trous vus du dessus : 4 lamés, 2 simples, 2 fraisés ('+H.map(h=>h.kind+(h.n[2]>0?'↑':'↓')).join(' ')+')');
    A(cnt('simple',false)===8&&!H.some(h=>h.kind!=='simple'&&h.n[2]<0),'16 : vus du dessous : 8 sorties simples');
    const hCb=stdHoleAt(H,[-40,-20+3.3,10],[0,0,-1]);
    A(hCb&&hCb.kind==='cbore'&&stdSameHoles(H,hCb).length===4,'17 : un clic dans un lamé : les 4 lamés identiques');
    const hS=stdHoleAt(H,[15,3.3,5],[0,0,-1]),hCs=stdHoleAt(H,[0,20,19],[0,0,-1]);
    A(hS&&hS.kind==='simple'&&stdSameHoles(H,hS).length===2&&hCs&&hCs.kind==='csink'&&stdSameHoles(H,hCs).length===2,'18 : simples et fraisés : 2 chacun, distincts des lamés');
    const chc=stdSpec('iso',{type:'chc',size:'M6',pitch:'1',len:'25'});
    const occs=stdAddOnHoles(chc,Rt.id,[],stdSameHoles(H,hCb));
    const ok=v=>Array.isArray(v)&&v.every(isFinite);
    A(occs.length===4&&asm.comps.length===2&&occs.every(o=>o.align&&o.align.dst.sn&&o.st==='ok'),'19 : 4 CHC, un seul composant, 4 liaisons rigides résolues');
    const pos=occs.map(o=>o.fr.o.map(v=>+v.toFixed(3)).join(',')).sort();
    A(JSON.stringify(pos)===JSON.stringify(['-40,-20,13.6','-40,20,13.6','40,-20,13.6','40,20,13.6'])&&occs.every(o=>o.fr.z[2]>0.999),'20 : têtes au fond des lamés (z = 20 − 6,4), tige vers le bas ('+pos.join(' | ')+')');
    const fh=stdAddOnHoles(stdSpec('iso',{type:'fhc',size:'M6',len:'20'}),Rt.id,[],stdSameHoles(H,hCs));
    A(fh.length===2&&fh.every(o=>Math.abs(o.fr.o[2]-19.8)<1e-6&&o.fr.z[2]>0.999),'21 : FHC dans les fraisures, 0,2 mm sous l entrée (z = 19,8 : '+fh.map(o=>o.fr.o[2]).join(', ')+')');
    const pn=stdAddOnHoles(stdSpec('pin',{type:'iso2338',size:'6',len:'20'}),Rt.id,[],stdSameHoles(H,hS));
    A(pn.length===2&&pn.every(o=>Math.abs(o.fr.o[2]-10)<1e-6&&o.fr.z[2]>0.999),'22 : goupilles centrées au milieu de l axe du trou (z = 10 : '+pn.map(o=>o.fr.o.map(v=>+v.toFixed(3)).join(',')).join(' | ')+'), +Z vers l entrée');
    {const P=stdPolyPts(stdSpec('pin',{type:'iso8734',size:'6',len:'20'}).prof).map(p=>p[1]);A(Math.abs(Math.min(...P)+10)<1e-9&&Math.abs(Math.max(...P)-10)<1e-9,'22b : goupille : origine en son milieu (z de −10 à 10)');}
    A(asmUndo()&&Rt.occ.length===6,'23 : Ctrl+Z : toutes les goupilles d un coup');
    // goupilles : centre sur l'arête haute / basse, ou au plus court du clic (V0.21.7)
    A(stdPinAt(hS,[15,3.3,18])==='top'&&stdPinAt(hS,[15,3.3,11])==='mid'&&stdPinAt(hS,[15,3.3,3])==='bot','23b : au plus court : haut / milieu / bas selon la profondeur du clic');
    const pT=stdAddOnHoles(stdSpec('pin',{type:'iso2338',size:'6',len:'20'}),Rt.id,[],stdSameHoles(H,hS),'top');
    A(pT.length===2&&pT.every(o=>Math.abs(o.fr.o[2]-20)<1e-6&&o.fr.z[2]>0.999),'23c : arête haute : centre à l entrée (z = 20 : '+pT.map(o=>o.fr.o[2]).join(', ')+')');
    asmUndo();
    const pB=stdAddOnHoles(stdSpec('pin',{type:'iso2338',size:'6',len:'20'}),Rt.id,[],stdSameHoles(H,hS),'bot');
    A(pB.length===2&&pB.every(o=>Math.abs(o.fr.o[2])<1e-6&&o.fr.z[2]>0.999),'23d : arête basse : centre au fond (z = 0 : '+pB.map(o=>o.fr.o[2]).join(', ')+')');
    asmUndo();
    const pC=stdAddOnHoles(stdSpec('pin',{type:'iso2338',size:'6',len:'10'}),Rt.id,[],stdSameHoles(H,hCb),'top');
    A(pC.length===4&&pC.every(o=>Math.abs(o.fr.o[2]-13.6)<1e-6),'23e : trou lamé : arête haute = haut du cylindre sous le lamage (z = 13,6)');
    asmUndo();
    // associativité : les lamés bougent, les vis suivent
    Object.values(sCb.points).forEach(p=>{p.x+=p.x>0?3:-3;});
    markDirty();rebuild();asmSnapSync();
    const ids=new Set(occs.map(o=>o.id)),now=Rt.occ.filter(o=>ids.has(o.id)); // Ctrl+Z a restauré des copies
    const pos2=now.map(o=>o.fr.o.map(v=>+v.toFixed(3)).join(',')).sort();
    A(JSON.stringify(pos2)===JSON.stringify(['-43,-20,13.6','-43,20,13.6','43,-20,13.6','43,20,13.6']),'24 : lamés écartés de 3 mm : les vis suivent ('+pos2.join(' | ')+')');
    // ── 6. modifier une pièce posée (V0.21.1) ──
    const S0=stdStateOf({key:'ISO 4762|M8×1|30',norm:'ISO 4762',desig:'M8×1×30'});
    A(S0&&S0.cat==='iso'&&S0.st.type==='chc'&&S0.st.size==='M8'&&S0.st.pitch==='1'&&S0.st.len==='30','25 : pièce V0.21.0 (clé seule) : réglages retrouvés ('+JSON.stringify(S0)+')');
    const S1=stdStateOf({key:'ISO 773|C|8×7×40'});
    A(S1&&S1.cat==='key'&&S1.st.type==='C'&&S1.st.size==='8x7'&&S1.st.len==='40','26 : clavette retrouvée aussi');
    const C0=asmComp(now[0].comp);
    A(C0.doc.std.cat==='iso'&&C0.doc.std.st.len==='25','27 : réglages enregistrés dans doc.std (cat, st)');
    const docObj=C0.doc,pos0=now.map(o=>o.fr.o.join(','));
    let r=stdReplace(now[0].id,stdSpec('iso',{type:'chc',size:'M6',pitch:'1',len:'35'}),true);
    A(r&&r.how==='rebuilt'&&r.n===4&&C0.doc===docObj&&C0.name==='CHC M6×35'&&C0.doc.std.st.len==='35'&&now.every(o=>o.comp===C0.id&&/^CHC M6×35:\d$/.test(o.name)),'28 : toutes les occurrences : composant reconstruit sur place, renommé ('+now.map(o=>o.name).join(', ')+')');
    A(JSON.stringify(now.map(o=>o.fr.o.join(',')))===JSON.stringify(pos0)&&now.every(o=>o.align&&o.st==='ok'),'29 : positions et liaisons rigides gardées');
    const rv=C0.doc.features.find(f=>f.type==='revolve'),pk=C0.doc.sketches.find(s=>s.id===rv.sketchId);
    A(Math.min(...Object.values(pk.points).map(p=>p.y))===-35,'30 : profil refait : tige de 35');
    r=stdReplace(now[1].id,stdSpec('iso',{type:'chc',size:'M6',pitch:'1',len:'20'}),false);
    const C20=asmComp(now[1].comp);
    A(r&&r.how==='moved'&&C20!==C0&&C20.name==='CHC M6×20'&&asmCompOccs(C0.id).length===3&&now[1].align&&now[1].st==='ok'&&now[1].fr.o.join(',')===pos0[1],'31 : celle-ci seulement : elle passe sur une CHC M6×20, liaison gardée, les 3 autres restent');
    const nC=asm.comps.length;
    r=stdReplace(now[2].id,stdSpec('iso',{type:'chc',size:'M6',pitch:'1',len:'20'}),false);
    A(r&&now[2].comp===C20.id&&asm.comps.length===nC&&/:2$/.test(now[2].name),'32 : deuxième fois : la M6×20 existante est réemployée ('+now[2].name+')');
    A(asmUndo()&&now.length&&Rt.occ.find(o=>o.id===now[2].id).comp===C0.id,'33 : Ctrl+Z : l occurrence revient');
    r=stdReplace(now[0].id,stdSpec('iso',{type:'chc',size:'M6',pitch:'1',len:'20'}),true);
    A(r&&r.how==='moved'&&!asm.comps.includes(C0)&&asmCompOccs(C20.id).length===4,'34 : toutes vers une pièce déjà là : tout passe dessus, l ancien composant disparaît');
    A(asmUndo()&&asm.comps.includes(C0)&&asmCompOccs(C0.id).length===3,'35 : Ctrl+Z : rétabli');
    A(asmUndo()&&asmCompOccs(C0.id).length===4&&C0.name==='CHC M6×35'&&(asmUndo(),asmNamesSync(),C0.doc.std.st.len==='25'&&C0.name==='CHC M6×25'),'36 : Ctrl+Z jusqu à la reconstruction : M6×25 revient');
    const bk=JSON.parse(serialise()),t2=asmTreeOfFile(bk.doc||bk),c3=t2.comps.find(c=>c.doc&&c.doc.std&&c.doc.std.key===C0.doc.std.key);
    A(c3&&c3.doc.std.cat==='iso'&&c3.doc.std.st.len==='25','37 : cat / st relus depuis le fichier');
    // ── 7. clavettes dans une rainure (V0.21.9) : bloc à deux rainures fermées 8 × 40 (selon X et
    //    selon Y) et une rainure débouchante, profondeur 4 ──
    docResetEmpty();asm=null;doc.name='Arbre';
    const sb2=SK('skA',0);stdLoop(sb2,[[-50,-30],[50,-30],[50,30],[-50,30]]);
    doc.features.push({id:'exA',type:'extrude',name:'Bloc',sketchId:'skA',distance:20,op:'add',visible:true,mid:false,upto:null,body:'b1'});
    const KW=(id,pts)=>{const s=SK('sk'+id,20);stdLoop(s,pts);doc.features.push({id,type:'extrude',name:id,sketchId:s.id,distance:-4,op:'cut',visible:true,mid:false,upto:null,body:'b1'});};
    const sh=(P,f)=>P.map(q=>{const a=f(q[0],q[1]),o=[a[0],a[1]];if(q[2]){const c=f(q[2].c[0],q[2].c[1]);o.push(Object.assign({},q[2],{c}));}return o;});
    const ol=stdKeyOutline({form:'A',L:40,b:8});
    KW('kw1',sh(ol,(x,y)=>[x-20,y-15]));          // selon X, centre (−20, −15)
    KW('kw2',sh(ol,(x,y)=>[-y+25,x]));            // selon Y, centre (25, 0)
    KW('kw3',[[34,18,{c:[34,22],ccw:true}],[55,18],[55,26],[34,26]]); // débouchante en x = 50
    doc.bodies=[{id:'b1',name:'Arbre',c:null}];doc.bodySeq=2;doc.activeBody='b1';
    asmEnsure();asm._force=true;markDirty();rebuild();asm._force=false;
    const Ra=asmRoot(),Ga=asmSnapGeomOf(Ra);
    const KS=(Ga?Ga.faces:[]).map(stdKeyway).filter(k=>k&&k.form!=='rect');
    A(KS.filter(k=>k.form==='A').length===2&&KS.filter(k=>k.form==='open').length===1&&KS.filter(k=>k.form==='A').every(k=>Math.abs(k.w-8)<1e-6&&Math.abs(k.len-40)<1e-6),
      '38 : 2 rainures fermées 8 × 40 et 1 débouchante ('+KS.map(k=>k.form+' '+k.w.toFixed(1)+'×'+k.len.toFixed(1)).join(', ')+')');
    const r3=v=>v.map(x=>+x.toFixed(3)).join(',');
    stdUi.keyAt='face';
    let R=stdKeyPick(null,Ga,[-20,-15,16],[0,0,1]);
    let ok2=stdAddInKeyways(stdSpec('key',{type:'A',size:'8x7',len:'40'}),Ra.id,[],R.items,R.mode);
    const pf=ok2.map(o=>r3(o.fr.o)+' x'+r3(o.fr.x.map(Math.abs))).sort();
    A(R.mode==='face'&&ok2.length===2&&JSON.stringify(pf)===JSON.stringify(['-20,-15,16 x1,0,0','25,0,16 x0,1,0'])&&ok2.every(o=>o.fr.z[2]>0.999&&o.st==='ok'),
      '39 : centre de face : clavette 8×7×40 au centre des deux rainures, couchée sur le fond, X selon l axe de chacune ('+pf.join(' | ')+')');
    A(asmUndo()&&!Ra.occ.length,'40 : Ctrl+Z : les deux clavettes d un coup');
    stdUi.keyAt='arc';
    R=stdKeyPick(null,Ga,[-38,-15,16],[0,0,1]);
    ok2=stdAddInKeyways(stdSpec('key',{type:'A',size:'8x7',len:'25'}),Ra.id,[],R.items,R.mode);
    const kL=ok2.find(o=>Math.abs(o.fr.o[1]+15)<1e-6);
    A(R.mode==='arc'&&ok2.length===2&&kL&&r3(kL.fr.o)==="-27.5,-15,16"&&Math.abs(Math.abs(kL.fr.x[0])-1)<1e-9,'41 : centre du cercle : clavette 25 calée contre le bout gauche cliqué (centre en x = −36 + 8,5 : '+(kL?r3(kL.fr.o):"?")+")");
    asmUndo();
    R=stdKeyPick(null,Ga,[40,22,16],[0,0,1]);
    ok2=stdAddInKeyways(stdSpec('key',{type:'A',size:'8x7',len:'18'}),Ra.id,[],R.items,R.mode);
    A(R.K.form==='open'&&ok2.length===1&&r3(ok2[0].fr.o)==='39,22,16','42 : rainure débouchante : calée contre son bout rond ('+(ok2[0]?r3(ok2[0].fr.o):'?')+')');
    return out;
  `;
  const o=await vm.runInContext('(async()=>{'+R+'})()',ctx);
  console.log('=== V0.21.0 : composants normalisés ===');
  (o.log||[]).forEach(m=>console.log('  ✓ '+m));
  if(o.fails&&o.fails.length){o.fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.fails.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1200));process.exit(1);});
