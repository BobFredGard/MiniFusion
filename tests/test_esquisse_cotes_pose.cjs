// V0.11.13 : cotes d'esquisse — statut pilotante / référence et placement des R / Ø.
// Symptômes : « cotes non contraintes alors que l'esquisse n'est pas encore totalement blanche,
// dès la 1re cote » et « les cotes de rayon ou diamètre se placent mal ».
// Causes : le contrôle de rang (pilotante ou référence) n'était fait qu'à la CRÉATION de la
// cote vivante ; la conversion pendant la pose (longueur → point↔ligne / entraxe, alignée → H)
// ne le refaisait pas. Le coude R/Ø était décalé depuis un point à 45° (0,7·r) alors que le
// dessin part de la bissectrice de l'arc, 26 px plus loin : jusqu'à 13 mm d'écart sur un congé.
// Contrôles (rectangle 60×40 à (10,10), H/V posées ; valeurs à la main) :
//  A. ligne du bas déjà cotée, recotée (référence) puis 2ᵉ clic sur la ligne du haut :
//     entraxe 40 PILOTANTE dès la conversion, DDL 3 → 2 ;
//  B. distance coin↔coin posée en horizontale (= largeur déjà cotée) : RÉFÉRENCE, DDL inchangé ;
//     curseur pile à gauche → verticale 40 pilotante (l’écart 179,99° comptait comme 179,99° et non 0,01°) ;
//  C. 1re cote sur une arête fixe (projection) puis clic sur le coin (10,10) : distance 10 pilotante ;
//  D. cote R d'un congé : le coude suit le curseur ; recoter le même congé ne crée pas de doublon ;
//  E. « test esquisse » : ─ posée sur une ligne ⟂ à une ligne ─ — la résolution écrasait la 1re
//     ligne en un point (e17), et ce point sans direction faussait le rang (3 cotes en référence,
//     7 DDL libres). La contrainte est refusée, esquisse intacte ; sur le fichier tel quel, les
//     3 cotes peuvent piloter.
// Harnais : DOM/THREE stubbé, sans OCCT.
const vm=require('vm');
const {loadApp}=require('./appvm.cjs');
function inVm(){
  const out={fails:[],log:[]};const A=(c,m)=>{if(!c)out.fails.push(m);else out.log.push(m);};
  confirm=function(){return true;};alert=function(){};prompt=function(){return null;};
  const C=(wx,wy)=>{const r=svg.getBoundingClientRect();const p=w2s(wx,wy);return [r.left+p[0],r.top+p[1]];};
  const ev=(t,x,y,ex)=>{const r=Object.assign({type:t,button:0,buttons:0,shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,detail:1,pointerId:1,preventDefault(){},stopPropagation(){}},ex||{});r.clientX=x;r.clientY=y;return r;};
  const pmove=(x,y)=>{const p=C(x,y);svg.dispatchEvent(ev('pointermove',p[0],p[1],{buttons:0}));};
  const click=(x,y)=>{pmove(x,y);const p=C(x,y);svg.dispatchEvent(ev('pointerdown',p[0],p[1],{button:0,buttons:1}));svg.dispatchEvent(ev('pointerup',p[0],p[1]));};
  const dof=()=>{skDofCache={key:null};return skDofInfo(skEdit).dof;};
  const last=()=>skEdit.dims[skEdit.dims.length-1];
  const mk=()=>{const sk={id:'s1',name:'S',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{},entities:[],constraints:[],dims:[],seq:20,visible:true};
    [['p0',10,10,'e0','p1'],['p1',70,10,'e1','p2'],['p2',70,50,'e2','p3'],['p3',10,50,'e3','p0']].forEach(l=>{sk.points[l[0]]={x:l[1],y:l[2]};sk.entities.push({id:l[3],t:'line',p1:l[0],p2:l[4]});});
    sk.constraints.push({id:'c0',type:'h',line:'e0'},{id:'c1',type:'v',line:'e1'},{id:'c2',type:'h',line:'e2'},{id:'c3',type:'v',line:'e3'});
    doc.sketches=[sk];doc.features=[];openSketch('s1');skTool='dim';return skEdit;};
  // A
  let sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();
  const dA=dof();
  click(40,10);A(last().ref,'A. ligne du bas recotée : référence pendant la pose (longueur déjà cotée)');
  click(40,50);A(last().type==='gap'&&!last().ref&&dof()===dA-1,'A. 2ᵉ clic ligne du haut : entraxe pilotante dès la conversion, DDL '+dA+' → '+dof());
  click(80,30);A(!last().ref&&Math.abs(last().value-40)<0.01,'A. posée : entraxe 40 pilotante');
  // B
  sk=mk();sk.dims.push({id:'d0',type:'length',line:'e0',value:60,chk:1});afterEdit();
  const dB=dof();
  click(10,10);click(70,50);A(last().type==='distance'&&!last().ref,'B. distance coin↔coin alignée (72,11) : pilotante');
  pmove(40,-5);A(last().orient==='h'&&last().ref&&dof()===dB,'B. curseur dessous → horizontale 60 = largeur cotée : RÉFÉRENCE, DDL '+dB+' inchangé ('+dof()+')');
  pmove(-5,30);A(last().orient==='v'&&!last().ref&&dof()===dB-1,'B. curseur à gauche → verticale 40 : pilotante de nouveau, DDL '+(dB-1)+' ('+dof()+')');
  // C
  sk=mk();sk.points.f1={x:0,y:0};sk.points.f2={x:100,y:0};sk.entities.push({id:'ef',t:'line',p1:'f1',p2:'f2',construction:true});
  sk.constraints.push({id:'cf1',type:'fix',p:'f1'},{id:'cf2',type:'fix',p:'f2'});afterEdit();
  click(90,0);A(last().ref,'C. 1re cote sur l\'arête fixe : longueur déjà déterminée → référence');
  click(10,10);A(last().type==='distline'&&!last().ref&&Math.abs(last().value-10)<0.01,'C. clic sur le coin (10,10) : distance 10 à l\'arête PILOTANTE dès la conversion');
  // D
  sk=mk();skTool='fillet';click(70,10);skTool='dim';
  const arc=sk.entities.find(e=>e.t==='arc');A(!!arc,'D. congé posé au coin (70,10)');
  if(arc){
    const nR=sk.dims.filter(d=>d.type==='radius').length;
    const Cc=sk.points[arc.pc],an=arcAngles(sk,arc),am=(an.a1+an.a2)/2,X=Cc.x+arc.r*Math.cos(am),Y=Cc.y+arc.r*Math.sin(am);
    click(X,Y);pmove(X+15,Y-5);const K=rdLayout(sk,last()).K;
    A(Math.hypot(K.x-X-15,K.y-Y+5)<1e-6,'D. cote R en pose : coude sous le curseur ('+K.x.toFixed(2)+', '+K.y.toFixed(2)+')');
    const s0=skView.s;skView.s=s0*3;const K2=rdLayout(sk,last()).K;skView.s=s0;
    A(Math.hypot(K2.x-K.x,K2.y-K.y)<1e-6,'D. zoom ×3 : le coude ne bouge pas');
    click(X+15,Y-5);
    A(sk.dims.filter(d=>d.type==='radius').length===nR&&skSel&&skSel.kind==='dim','D. même congé recoté : pas de doublon, la cote R existante est sélectionnée');
    pmove(X+15,Y-5);
  }
  // E
  {const sk={id:'s2',name:'S',plane:'XY',origin:[0,0,0],axU:[1,0,0],axV:[0,1,0],axN:[0,0,1],points:{a:{x:-75,y:20},b:{x:-55,y:20},c:{x:-55,y:-10}},
    entities:[{id:'l1',t:'line',p1:'a',p2:'b'},{id:'l2',t:'line',p1:'b',p2:'c'}],constraints:[{id:'k1',type:'h',line:'l1'},{id:'k2',type:'perpendicular',a:'l2',b:'l1'}],dims:[],seq:20,visible:true};
    doc.sketches=[sk];doc.features=[];openSketch('s2');skTool='select';
    const len=id=>{const l=entById(skEdit,id),P=skEdit.points;return Math.hypot(P[l.p2].x-P[l.p1].x,P[l.p2].y-P[l.p1].y);};
    skSel={kind:'ent',id:'l2'};skSelX=[];applyCon('h');
    A(!skEdit.constraints.some(c=>c.type==='h'&&c.line==='l2')&&len('l1')>19.9&&len('l2')>29.9&&/réduite à un point/.test(skMsg),'E. ─ sur une ligne ⟂ à une ligne ─ : refusée, aucune ligne écrasée ('+skMsg+')');
    if(__TE){const s3=JSON.parse(JSON.stringify(__TE));ensureSketchBasis(s3);skDofCache={key:null};
      A(skDofInfo(s3).dof===7&&s3.dims.every(d=>skDimCanDrive(s3,d)),'E. fichier « test esquisse » : 7 DDL, les 3 cotes peuvent piloter (le point e17 ne fausse plus le rang)');}
  }
  closeSketch(false);
  return out;
}
const {ctx}=loadApp();
try{ctx.__TE=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'..','Exemples','test esquisse.miniFusion'),'utf8')).doc.sketches[0];}catch(e){ctx.__TE=null;}
const out=vm.runInContext('('+inVm.toString()+')()',ctx,{filename:'test_esquisse_cotes_pose.js'});
console.log('=== Esquisse : statut des cotes en pose, placement R / Ø ===');
out.log.forEach(m=>console.log('  ✓ '+m));
out.fails.forEach(m=>console.log('  ✗ '+m));
console.log(out.fails.length?'\n*** '+out.fails.length+' PROBLEME(S) ***':'\n*** TOUT PASSE ***');
process.exit(out.fails.length?1:0);
