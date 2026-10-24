// V0.6.3 : composants liés à un fichier externe, édités sur place (47-composants-lies.js).
// Modèle seul, dossier de projets SIMULÉ en mémoire (faux FileSystemDirectoryHandle /
// FileSystemFileHandle) : lier, source modifiée ailleurs → mise à jour (l'alignement suit),
// édition sur place → source réécrite, conflit (trois issues), source introuvable, même source
// liée deux fois → occurrence, lien imbriqué, extraire vers un fichier, enregistrement de l'hôte.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const P=[];const p=s=>P.push(String(s));
    const ATT=[];const att=(ok,msg)=>{if(!ok)ATT.push(msg);};
    confirm=function(){return true;};alert=function(m){p("alerte : "+m);};
    const near=(a,b,t)=>Array.isArray(a)&&a.length===3&&a.every((x,i)=>Math.abs(x-b[i])<(t||1e-7));
    const FR=(id,name,o)=>({id,kind:'frame',how:'zx',name,refs:[],p:{},at:null,visible:true,fr:{o,x:[1,0,0],y:[0,1,0],z:[0,0,1]},st:'ok',msg:''});
    // ── dossier de projets en mémoire ──
    const FS={};let writes=0;
    const mkFile=path=>({kind:'file',name:path.split('/').pop(),_p:path,
      async getFile(){if(!(path in FS))throw new Error('NotFound');return {name:path.split('/').pop(),text:async()=>FS[path]};},
      async createWritable(){let buf='';return {write:async t=>{buf=t;},close:async()=>{FS[path]=buf;writes++;}};},
      async queryPermission(){return 'granted';},async requestPermission(){return 'granted';},
      async isSameEntry(o){return !!o&&o._p===path;}});
    const mkDir=prefix=>({kind:'directory',
      async getDirectoryHandle(n){return mkDir(prefix+n+'/');},
      async getFileHandle(n){const q=prefix+n;if(!(q in FS))throw new Error('NotFound');return mkFile(q);},
      async resolve(h){return h&&h._p&&h._p.startsWith(prefix)?h._p.slice(prefix.length).split('/'):null;},
      async queryPermission(){return 'granted';},async requestPermission(){return 'granted';}});
    mffFolder=mkDir('');
    let reponse='theirs';mffAsk=async()=>reponse;
    // ── la source : une roue avec un repère de moyeu ──
    docResetEmpty();doc.name='Roue';doc.cgeo.push(FR('moyeu','Moyeu',[0,0,10]));
    FS['pieces/Roue.miniFusion']=serialise();
    // ── l'hôte : un chariot qui lie la roue ──
    docResetEmpty();doc.name='Chariot';doc.cgeo.push(FR('axe','Axe avant',[100,0,30]));
    asmEnsure();
    const L=await asmLinkInsert(mkFile('pieces/Roue.miniFusion'),FS['pieces/Roue.miniFusion'],'Roue.miniFusion');
    att(L&&L.link&&L.link.rel==='pieces/Roue.miniFusion'&&!L.link.key,'1 : lié par son chemin dans le dossier de projets');
    att(L.name==='Roue'&&L.doc.cgeo.length===1&&L.doc.cgeo[0].id==='moyeu','2 : contenu de la source chargé');
    att(asmRoot().occ.length===1&&asmRoot().occ[0].comp===L.id,'3 : une occurrence dans le composant actif');
    att(!asmLinkDirty(L),'4 : rien de modifié ici après le lien');
    // la roue alignée : moyeu sur l'axe avant du chariot
    const oL=asmRoot().occ[0];
    oL.align={src:{path:[],cg:'moyeu'},dst:{path:[],cg:'axe'},flip:false,rz:0,off:[0,0,0]};asmResolve();
    att(near(oL.fr.o,[100,0,20]),'5 : roue alignée (origine 100 ; 0 ; 20)');
    // ── la source change ailleurs : mise à jour, l'alignement suit ──
    {const o=JSON.parse(FS['pieces/Roue.miniFusion']);o.cgeo[0].fr.o=[0,0,15];FS['pieces/Roue.miniFusion']=JSON.stringify(o,null,2);}
    let r=await asmLinksCheck(false);
    att(r.updated.join()==='Roue'&&near(L.doc.cgeo[0].fr.o,[0,0,15]),'6 : source modifiée ailleurs → composant mis à jour');
    att(near(oL.fr.o,[100,0,15]),'7 : l alignement suit le nouveau repère (z 15)');
    att(asmComp(L.id)===L&&asmRoot().occ[0]===oL,'8 : même composant, même occurrence (identifiants gardés)');
    r=await asmLinksCheck(false);
    att(!r.updated.length,'9 : rien de neuf : pas de mise à jour');
    // ── édition sur place : la source est réécrite à l'enregistrement de l'hôte ──
    L.doc.cgeo[0].fr.o=[0,0,12];
    att(asmLinkDirty(L),'10 : modifié ici');
    const w0=writes;await asmLinksWrite();
    const src=JSON.parse(FS['pieces/Roue.miniFusion']);
    att(writes===w0+1&&near(src.cgeo[0].fr.o,[0,0,12])&&src.name==='Roue'&&!src.asm,'11 : source réécrite (repère à z 12, pièce seule)');
    att(!asmLinkDirty(L),'12 : plus rien à écrire');
    // ── conflit : modifié des deux côtés ──
    const conflit=async rep=>{
      asmComp(L.id).doc.cgeo[0].fr.o=[0,0,40]; // (l'objet change après une réouverture)
      const o=JSON.parse(FS['pieces/Roue.miniFusion']);o.cgeo[0].fr.o=[0,0,50];FS['pieces/Roue.miniFusion']=JSON.stringify(o);
      reponse=rep;return asmLinksCheck(false);
    };
    await conflit('mine');
    att(near(L.doc.cgeo[0].fr.o,[0,0,40])&&asmLinkDirty(L)&&L.link.pend,'13 : conflit, « Garder les miennes » : modification gardée, à écrire');
    await asmLinksWrite();
    att(near(JSON.parse(FS['pieces/Roue.miniFusion']).cgeo[0].fr.o,[0,0,40]),'14 : … et la source est écrasée à l enregistrement');
    await conflit('theirs');
    att(near(L.doc.cgeo[0].fr.o,[0,0,50])&&!asmLinkDirty(L),'15 : conflit, « Prendre la source »');
    // ── l'hôte enregistré puis rouvert : le lien et l'état « modifié ici » survivent ──
    L.doc.cgeo[0].fr.o=[0,0,55];
    const js=serialise();
    await deserialise(js,{rebuild:false});
    const L2=asmComp(L.id);asmLinkRebase();
    att(L2&&L2.link&&L2.link.rel==='pieces/Roue.miniFusion'&&L2.link.sig===L.link.sig,'16 : rouvert : lien relu');
    att(asmLinkDirty(L2),'17 : rouvert : toujours « modifié ici » (écrit au prochain enregistrement)');
    await asmLinksWrite();
    att(near(JSON.parse(FS['pieces/Roue.miniFusion']).cgeo[0].fr.o,[0,0,55])&&!asmLinkDirty(L2),'18 : écrit');
    const js2=serialise();await deserialise(js2,{rebuild:false});asmLinkRebase();
    att(asmComp(L.id)&&!asmLinkDirty(asmComp(L.id)),'19 : rouvert sans modification : rien à écrire');
    const L3=asmComp(L.id);
    await conflit('break');
    att(L3&&!L3.link,'20 : conflit, « Rompre le lien » : copie locale');
    // ── source introuvable ──
    docResetEmpty();doc.name='Chariot';asmEnsure();
    FS['pieces/Roue.miniFusion']=serialise();
    const La=await asmLinkInsert(mkFile('pieces/Roue.miniFusion'),FS['pieces/Roue.miniFusion'],'Roue.miniFusion');
    delete FS['pieces/Roue.miniFusion'];
    r=await asmLinksCheck(false);
    att(La.link.st==='warn'&&/introuvable/.test(La.link.msg)&&r.warn.length===1,'21 : source introuvable : ⚠, le composant garde sa copie');
    FS['pieces/Roue.miniFusion']=serialise();
    // ── même source liée deux fois : une occurrence de plus ──
    const n0=asm.comps.length;
    const Lb=await asmLinkInsert(mkFile('pieces/Roue.miniFusion'),FS['pieces/Roue.miniFusion'],'Roue.miniFusion');
    att(La&&Lb===La&&asm.comps.length===n0&&asmCompOccs(La.id).length===2,'22 : déjà liée : nouvelle occurrence, pas de second composant');
    // ── source qui est un assemblage : ses sous-composants viennent avec elle ──
    docResetEmpty();doc.name='Essieu';asmEnsure();
    const sub=asmNewComp('Moyeu');sub.comp.doc.cgeo.push(FR('m','Repère moyeu',[0,0,1]));
    sub.occ.fr={o:[5,0,0],x:[1,0,0],y:[0,1,0],z:[0,0,1]};
    FS['Essieu.miniFusion']=serialise();
    docResetEmpty();doc.name='Chariot';asmEnsure();
    const E=await asmLinkInsert(mkFile('Essieu.miniFusion'),FS['Essieu.miniFusion'],'Essieu.miniFusion');
    const mem=asmLinkMembers(E);
    att(mem.length===2&&mem[1].name==='Moyeu'&&mem[1].of===E.id&&E.occ.length===1,'23 : assemblage lié : son sous-composant vient avec lui (marqué)');
    att(near(asmWorld([asmRoot().occ[0].id,E.occ[0].id]).o,[5,0,0]),'24 : position du sous-composant gardée');
    att(asmAddOcc(asmRoot().id,null,E.id)===null,'25 : pas d occurrence d un composant de l hôte dans un composant lié');
    const nc=asmNewComp('Écrou',E.id);
    att(nc&&nc.comp.of===E.id,'26 : composant créé dans un composant lié : il en fait partie');
    await asmLinksWrite();
    const es=JSON.parse(FS['Essieu.miniFusion']);
    att(es.asm&&es.asm.comps.length===3&&es.asm.comps.some(c=>c.name==='Écrou')&&es.asm.root===es.asm.comps[0].id&&es.name==='Essieu','27 : source de l assemblage réécrite avec le nouveau sous-composant');
    att(es.asm.comps.every(c=>!c.of),'28 : marques internes non écrites dans la source');
    // ── extraire un composant vers un fichier ──
    const ex=asmNewComp('Support');ex.comp.doc.cgeo.push(FR('s','Repère support',[1,2,3]));
    const sous=asmNewComp('Vis',ex.comp.id);
    att(await asmExtractTo(ex.comp,mkFile('Support.miniFusion'))===true,'29 : extrait');
    att(ex.comp.link&&ex.comp.link.rel==='Support.miniFusion'&&sous.comp.of===ex.comp.id&&!asmLinkDirty(ex.comp),'30 : le composant est lié à son nouveau fichier, son sous-composant en fait partie');
    const sp=JSON.parse(FS['Support.miniFusion']);
    att(sp.name==='Support'&&sp.cgeo[0].id==='s'&&sp.asm.comps.length===2,'31 : fichier écrit (repère, sous-composant)');
    att(asmExtractCheck(asmRoot())!==''&&asmExtractCheck(sous.comp)!=='','32 : racine et partie d un lien : pas d extraction');
    // ── enregistrement de l'hôte : les sources passent d'abord (mffWrite) ──
    ex.comp.doc.cgeo[0].fr.o=[9,9,9];
    FS['Hote.miniFusion']='';
    await mffWrite(mkFile('Hote.miniFusion'));
    att(near(JSON.parse(FS['Support.miniFusion']).cgeo[0].fr.o,[9,9,9])&&FS['Hote.miniFusion'].length>0,'33 : Ctrl+S de l hôte : la source modifiée est écrite, puis l hôte');
    if(ATT.length){p('ECHECS ('+ATT.length+') :');ATT.forEach(m=>p('  x '+m));}
    else p('TOUT EST CONFORME');
    return P.join(String.fromCharCode(10));
  `;
  const r=await vm.runInContext('(async()=>{'+R+'})()',ctx,{filename:'lies.js'});
  console.log(r);
  process.exit(/ECHECS|  x /.test(r)?1:0);
})().catch(e=>{console.error('ECHEC',String((e&&e.stack)||e).slice(0,800));process.exit(1);});
