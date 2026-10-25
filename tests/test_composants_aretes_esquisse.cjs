// V0.8.1 : arêtes des autres composants dans une esquisse (46 / 50 / 60). Sans noyau : les
// arêtes exactes d'un composant (_snap.pedges, capturées à la fin de son rejeu) sont injectées.
// Projeter les propose, transformées dans le repère du composant actif ; l'entité projetée
// (e.ext) suit quand l'instance visée se déplace ou que son composant change, actif ou non ;
// les instances du composant actif sont exclues ; fichier.
const {loadApp}=require('./appvm.cjs');
const vm=require('vm');
(async()=>{
  const {ctx}=loadApp();
  const R=`
    const ATT=[],OK=[];const att=(ok,msg)=>{(ok?OK:ATT).push(msg);};
    confirm=function(){return true;};alert=function(){};
    const near=(a,b,t)=>Math.abs(a-b)<(t||1e-6);
    const at=(o,x)=>{o.fr={o:x,x:[1,0,0],y:[0,1,0],z:[0,0,1]};};
    docResetEmpty();doc.name='Banc';asmEnsure();
    const Rt=asmRoot();
    const A=asmNewComp('Socle').comp,oA=Rt.occ[0];
    const B=asmNewComp('Capot').comp,oB=Rt.occ[1];
    at(oA,[50,0,0]);at(oB,[0,0,0]);
    // arêtes du socle (dans SON repère) : une ligne et un cercle à Z10
    const circ=(cx,cy,z,r)=>{const p=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI*1.5;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a),z]);}return {pts:p,mid:p[5].slice()};};
    const full=(cx,cy,z,r)=>{const p=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI*2;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a),z]);}p[10]=p[0].slice();return {pts:p,mid:p[5].slice()};};
    const lineY=y=>{const p=[];for(let i=0;i<=10;i++)p.push([2*i,y,10]);return {pts:p,mid:[10,y,10]};};
    const inject=(y,h)=>{A._snap=A._snap||{items:[],edges:null};A._snap.pedges=[lineY(y),circ(10,20,10,3),full(40,40,10,4)];A._snap.hash=h;};
    inject(0,'h1');
    // capot actif, esquisse sur XY
    asmActivatePath([oB.id]);
    const sk={id:'skc',name:'Esquisse capot',plane:'XY',visible:true,origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],seq:1};
    doc.sketches.push(sk);markDirty();rebuild();
    inject(0,'h1'); // un rejeu peut avoir recapturé le socle
    const L=asmSkExtLists();
    att(L.length===1&&L[0].ext.path.join()===oA.id&&L[0].name==='Socle','1 : Projeter propose les arêtes du socle (une instance)');
    att(L.length&&near(L[0].edges[0].pts[0][0],50)&&near(L[0].edges[0].pts[10][0],70),'2 : arêtes exprimées dans le repère du capot (socle à X50)');
    skView.s=4;
    const pr=projectEdgeAt(sk,60,0.1);
    att(pr&&pr.type==='line'&&pr.ext&&pr.ext.path.join()===oA.id&&pr.extName==='Socle'&&near(Math.min(pr.x1,pr.x2),50)&&near(Math.max(pr.x1,pr.x2),70),'3 : clic sur l’arête : ligne projetée, liée au socle');
    // entité, comme l'outil Projeter
    const p1=addPoint(sk,pr.x1,pr.y1),p2=addPoint(sk,pr.x2,pr.y2);
    sk.entities.push(Object.assign({id:'pl',t:'line',p1,p2,construction:true,proj:true},projNames(pr)));
    sk.constraints.push({id:'f1',type:'fix',p:p1},{id:'f2',type:'fix',p:p2});
    const pc=projectEdgeAt(sk,63,20);// arc aux trois quarts (0 → 270°)
    att(pc&&pc.type==='arc'&&near(pc.cx,60,1e-3)&&near(pc.cy,20,1e-3)&&near(pc.r,3,1e-3)&&pc.ext,'4 : arc du socle projeté (centre X60 Y20, R3)');
    const pf=projectEdgeAt(sk,94,40); // cercle complet : dernier point = premier
    att(pf&&pf.type==='circle'&&near(pf.cx,90,1e-3)&&near(pf.cy,40,1e-3)&&near(pf.r,4,1e-3),'4b : cercle complet projeté en cercle (et plus en ligne nulle)');
    const c0=addPoint(sk,pc.cx,pc.cy),a0=addPoint(sk,pc.x1,pc.y1),b0=addPoint(sk,pc.x2,pc.y2);
    sk.entities.push(Object.assign({id:'pcir',t:'arc',pc:c0,pa:a0,pb:b0,r:pc.r,construction:true,proj:true},projNames(pc)));
    sk.constraints.push({id:'f3',type:'fix',p:c0},{id:'f4',type:'fix',p:a0},{id:'f5',type:'fix',p:b0});
    const ent=id=>B.doc.sketches.find(s=>s.id==='skc').entities.find(e=>e.id===id);
    const pts=()=>{const s=B.doc.sketches.find(x=>x.id==='skc'),e=ent('pl');return [s.points[e.p1],s.points[e.p2]];};
    att(ent('pl').ext&&ent('pl').ext.sig&&ent('pl').ext.ctx.join()===oB.id,'5 : l’entité garde l’instance visée, le contexte et la signature');
    att(asmExtStale().length===0,'6 : rien à rejouer tant que rien ne bouge');
    // le socle se déplace : capot ACTIF
    asmPush('déplacer');at(oA,[60,0,0]);
    att(asmExtStale().length===1&&asmExtStale()[0]===B,'7 : socle déplacé : capot signalé à rejouer');
    asmExtSync();inject(0,'h1');
    let q=pts();
    att(near(Math.min(q[0].x,q[1].x),60,1e-3)&&near(Math.max(q[0].x,q[1].x),80,1e-3),'8 : la ligne projetée suit le socle (X60 → X80)');
    const sC=B.doc.sketches.find(x=>x.id==='skc');
    att(near(sC.points[ent('pcir').pc].x,70,1e-3),'9 : l’arc suit aussi (centre X70)');
    // le socle change (son arête passe à Y5) : capot INACTIF
    asmActivatePath([]);inject(5,'h2');
    att(asmExtStale().includes(B),'10 : socle modifié : capot signalé');
    asmExtSync();
    q=pts();
    att(near(q[0].y,5,1e-3)&&near(q[1].y,5,1e-3),'11 : capot inactif rejoué : la ligne suit l’arête modifiée (Y5)');
    att(asm.active===Rt.id&&doc===Rt.doc,'12 : retour au composant actif d’avant');
    att(asmExtStale().length===0,'13 : stable après synchronisation');
    // le composant actif ne se vise pas lui-même
    asmActivatePath([oA.id]);inject(5,'h2');
    att(asmSkExtLists().every(l=>l.ext.path.join()!==oA.id),'14 : socle actif : ses propres instances ne sont pas proposées');
    asmActivatePath([]);
    // fichier
    const js=serialise();await deserialise(js,{rebuild:false});
    const e2=asmComp(B.id).doc.sketches.find(s=>s.id==='skc').entities.find(e=>e.id==='pl');
    att(e2&&e2.ext&&e2.ext.path.join()===oA.id&&e2.ext.ctx.join()===oB.id&&e2.proj,'15 : fichier : l’arête projetée garde son lien');
    // pièce seule : rien de proposé
    docResetEmpty();
    att(asmSkExtLists().length===0,'16 : pièce sans composants : aucune arête externe');
    return {ATT,OK};
  `;
  const o=await vm.runInContext('(async function(){'+R+'})()',ctx);
  console.log('=== V0.8.1 : arêtes des autres composants dans une esquisse ===');
  o.OK.forEach(m=>console.log('  ✓ '+m));
  if(o.ATT.length){o.ATT.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+o.ATT.length+' PROBLEME(S) ***');process.exit(1);}
  console.log('\n*** TOUT PASSE ***');
})().catch(e=>{console.log('FATAL',String((e&&e.stack)||e).slice(0,1500));process.exit(1);});
