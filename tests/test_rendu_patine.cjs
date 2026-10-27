// Matières multicouches et patine de l'atelier RENDU (V0.13.0, src/98-rendu-surface.js), avec le VRAI
// three.js r147 de l'application :
//   1. couches des matériaux (paillettes fl, irisation ir) bien formées ; patine relue d'un fichier ;
//   2. surfGeo sur un pavé subdivisé : arêtes vives convexes → usure 1 sur TOUT sommet de l'arête (aussi
//      ceux des triangles qui ne la touchent que par un sommet), triangles du bord recoupés, 0 au-delà ; aucune salissure sur un convexe ; aire conservée ;
//   3. courbure des arrondis : petite sphère (R 1 mm) usée partout, grande (R 40 mm) intacte ;
//   4. creux : coin rentrant d'un « L » → salissure sur l'arête concave ;
//   5. moteur rapide : relApply pose les définitions SURF_* et ses ancrages existent dans le shader r147.
'use strict';
const vm=require('vm'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const c={console};vm.createContext(c);
for(const f of ['threejs/three.min.js','src/12-materiaux.js','src/98-rendu-reliefs.js','src/98-rendu-surface.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),c,{filename:f});
const r=vm.runInContext(`(()=>{
  const P=[],ATT=[];const p=s=>P.push(String(s)),att=(ok,m)=>{if(!ok)ATT.push(m);};
  // 1. couches et patine
  MAT_LIB.forEach(m=>{
    if(m.fl)att(m.fl.t>0.01&&m.fl.t<1&&m.fl.i>0&&m.fl.i<=1,m.k+' : paillettes mal formées');
    if(m.ir)att(m.ir.i>0&&m.ir.i<=1&&m.ir.ior>1&&m.ir.th.length===2&&m.ir.th[0]<m.ir.th[1],m.k+' : irisation mal formée');
  });
  ['peint-paillettes','peint-nacre','titane-bleui'].forEach(k=>att(!!matDef(k),'matériau absent : '+k));
  att(!!matDef('peint-metal').fl,'peinture métallisée sans paillettes');
  att(JSON.stringify(relNorm({t:'brosse',p:'usee'}))==='{"t":"brosse","p":"usee"}','relNorm : patine perdue');
  att(relNorm({p:'propre'})===null&&relNorm({p:'nimporte'})===null,'relNorm : « propre » est le défaut, une valeur inconnue est ignorée');
  att(patOf(null)===PAT_DEF.propre&&patOf({p:'tres'}).w>patOf({p:'legere'}).w,'patOf');
  const S=surfOpts({mat:'peint-metal',rel:{p:'usee'}},matDef('peint-metal'));
  att(S.wear&&S.paint&&S.fl&&!S.ir,'surfOpts peinture métallisée usée');
  att(!surfOpts({mat:'inox',rel:null},matDef('inox')).wear,'patine propre : pas de bande d\\'usure');
  // 2. pavé 20 × 20 × 20 subdivisé (4 × 4 par face), bande 1 mm
  const area=g=>{const a=g.attributes.position;let s=0;const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
    for(let i=0;i<a.count;i+=3){A.fromBufferAttribute(a,i);B.fromBufferAttribute(a,i+1);C.fromBufferAttribute(a,i+2);s+=B.sub(A).cross(C.sub(A)).length()/2;}return s;};
  const box=new THREE.BoxGeometry(20,20,20,4,4,4);
  const g=surfGeo(box,1),U=g.attributes.aUse,Pp=g.attributes.position;
  const nTri0=box.index.count/3,nTri=Pp.count/3;
  p('pavé : '+nTri0+' → '+nTri+' triangles, aire '+area(g).toFixed(2)+' mm²');
  att(nTri>nTri0,'pavé : aucun triangle recoupé le long des arêtes');
  att(Math.abs(area(g)-2400)<1e-6*2400,'pavé : aire modifiée ('+area(g)+')');
  let onEdge=0,in0=0,bad=0,dirt=0;
  for(let i=0;i<Pp.count;i++){
    const v=[Math.abs(Pp.getX(i)),Math.abs(Pp.getY(i)),Math.abs(Pp.getZ(i))].sort((a,b)=>b-a);
    const dEdge=10-v[1]; // distance à l'arête la plus proche (deux coordonnées à ±10)
    const w=U.getX(i);if(U.getY(i)>1e-9)dirt++;
    if(dEdge<1e-6){onEdge++;if(w<0.999)bad++;}
    else if(dEdge>1-1e-6){if(w>1e-9)bad++;else in0++;}
    // entre l'arête et la bande : dégradé, valeur libre
  }
  p('pavé : '+onEdge+' sommets sur une arête (usure 1), '+in0+' à la bande ou au-delà (0), '+bad+' hors règle, '+dirt+' salis');
  // aucun sommet de l'arête à 0 : plus d'encoche là où un triangle ne la touche que par un sommet
  att(onEdge>0&&in0>0&&bad===0,'pavé : usure mal répartie ('+bad+' sommets hors règle)');
  att(dirt===0,'pavé convexe : salissure inattendue');
  att(surfGeo(box,1)!==surfGeo(box,1)&&surfGeo(box,1).attributes.position.count===Pp.count,'surfGeo : copie du cache attendue');
  // 2 bis. faces planes en ÉVENTAIL (tous les sommets sur le bord, comme la CAO) : usure limitée à la bande
  const usureAire=g=>{const P=g.attributes.position,U=g.attributes.aUse;let s=0,w=0;const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
    for(let i=0;i<P.count;i+=3){A.fromBufferAttribute(P,i);B.fromBufferAttribute(P,i+1);C.fromBufferAttribute(P,i+2);
      const ar=B.sub(A).cross(C.sub(A)).length()/2;s+=ar;w+=ar*(U.getX(i)+U.getX(i+1)+U.getX(i+2))/3;}return w/s;};
  const oct=new THREE.Shape();for(let i=0;i<8;i++){const a=i*Math.PI/4;oct[i?'lineTo':'moveTo'](20*Math.cos(a),20*Math.sin(a));}
  const pr=new THREE.ExtrudeGeometry(oct,{depth:10,bevelEnabled:false});pr.computeVertexNormals();
  const fp=usureAire(surfGeo(pr,1));
  p('prisme octogonal (faces en éventail) : '+(fp*100).toFixed(1)+' % de l’aire usée (moyenne pondérée)');
  att(fp<0.15,'éventail : usure étalée sur les faces ('+(fp*100).toFixed(1)+' %)');
  att(usureAire(g)<0.15,'pavé : usure étalée ('+(usureAire(g)*100).toFixed(1)+' %)');
  // 3. courbure : sphères
  const usure=R=>{const s=surfGeo(new THREE.SphereGeometry(R,48,24),R*0.02),u=s.attributes.aUse;let m=0;for(let i=0;i<u.count;i++)m+=u.getX(i);return m/u.count;};
  const u1=usure(1),u40=usure(40);
  p('sphère R 1 : usure moyenne '+u1.toFixed(2)+' · R 40 : '+u40.toFixed(3));
  att(u1>0.95&&u40<0.01,'courbure : R 1 mm doit être usée, R 40 mm intacte');
  // 4. « L » : deux pavés soudés → arête rentrante salie
  const a=new THREE.BoxGeometry(20,10,10,4,2,2).toNonIndexed(),b=new THREE.BoxGeometry(10,10,10,2,2,2).toNonIndexed();
  b.translate(-5,10,0);a.translate(0,0,0);
  // retire les faces jointives (y = 5 de a sous b, y = 5 de b) pour un solide fermé en « L »
  const keep=(g,f)=>{const P=g.attributes.position,N=g.attributes.normal,o=[],on=[];
    for(let i=0;i<P.count;i+=3){let k=true;const cy=(P.getY(i)+P.getY(i+1)+P.getY(i+2))/3,cx=(P.getX(i)+P.getX(i+1)+P.getX(i+2))/3;if(f(cx,cy,N.getY(i)))k=false;
      if(k)for(let j=0;j<3;j++){o.push(P.getX(i+j),P.getY(i+j),P.getZ(i+j));on.push(N.getX(i+j),N.getY(i+j),N.getZ(i+j));}}
    const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(o,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(on,3));return r;};
  const a2=keep(a,(cx,cy,ny)=>Math.abs(cy-5)<1e-6&&cx<0&&ny>0.5),b2=keep(b,(cx,cy,ny)=>Math.abs(cy-5)<1e-6&&ny<-0.5);
  const L=new THREE.BufferGeometry(),pa=a2.attributes.position.array,pb=b2.attributes.position.array,na=a2.attributes.normal.array,nb=b2.attributes.normal.array;
  L.setAttribute('position',new THREE.Float32BufferAttribute([...pa,...pb],3));L.setAttribute('normal',new THREE.Float32BufferAttribute([...na,...nb],3));
  const gl=surfGeo(L,1),ul=gl.attributes.aUse,pl=gl.attributes.position;let sale=0,mauvais=0;
  for(let i=0;i<pl.count;i++)if(ul.getY(i)>0.999){sale++;if(!(Math.abs(pl.getX(i))<1e-6&&Math.abs(pl.getY(i)-5)<1e-6))mauvais++;}
  p('« L » : '+sale+' sommets salis, '+mauvais+' hors de l\\'arête rentrante');
  att(sale>0&&mauvais===0,'« L » : salissure absente ou hors de l\\'arête rentrante');
  // 5. moteur rapide
  const m=relApply(new THREE.MeshPhysicalMaterial(),null,S);
  att('SURF_WEAR' in m.defines&&'SURF_FLAKE' in m.defines&&typeof m.onBeforeCompile==='function','relApply : définitions SURF_* attendues');
  att(relApply(new THREE.MeshPhysicalMaterial(),null,surfOpts({mat:null,rel:{p:'aucune'}},null)).userData.rel===undefined,'patine « aucune » sans relief : matière intacte');
  const sh={uniforms:{},vertexShader:THREE.ShaderChunk.meshphysical_vert,fragmentShader:THREE.ShaderChunk.meshphysical_frag};
  m.onBeforeCompile(sh);
  ['vUse = aUse;'].forEach(t=>att(sh.vertexShader.indexOf(t)>=0,'shader : « '+t+' » non inséré'));
  ['sfW = smoothstep','metalnessFactor = mix( metalnessFactor, 1.0, sfW )','flR * uFlI'].forEach(t=>att(sh.fragmentShader.indexOf(t)>=0,'shader : « '+t+' » non inséré'));
  att('uSfW' in sh.uniforms&&'uFlT' in sh.uniforms,'shader : uniformes de surface absents');
  if(ATT.length){p('');p('ECHECS ('+ATT.length+') :');ATT.forEach(x=>p('  ✗ '+x));}else{p('');p('TOUT EST CONFORME');}
  return P.join('\\n');
})()`,c,{filename:'rendu_patine.js'});
console.log(r);
process.exit(/ECHECS|✗/.test(r)?1:0);
