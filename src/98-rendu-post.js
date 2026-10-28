/* ---------- finition de l'image de l'atelier RENDU (V0.15.0) ----------
   Une chaîne écrite UNE fois, en GLSL que comprennent le three r147 (moteur rapide) et le three récent
   (lancer de rayons) : rpCreate(T, moteur) reçoit l'espace de noms three de chacun. Elle part de l'image
   LINÉAIRE accumulée (cible flottante, alpha prémultiplié ou non) et va jusqu'aux pixels du canevas :
     1. débruitage (lancer de rayons) : filtre bilatéral — moyenne pondérée des voisins, coupée là où la
        couleur change franchement (jugée sur c / (1 + c) : les reflets intenses ne bavent pas) ;
     2. halo : l'image (après exposition, alpha compris), floutée au ¼, au 1/16 et au 1/64 de la taille, mêlée à l'image nette
        (au plus 40 %) : chaque zone claire déborde sur ses voisines plus sombres, fond compris, sans ajouter de
        lumière. V0.15.2 : auparavant seule la partie au-dessus du blanc (luminance > 1) débordait — rien sur une
        pièce sombre, et un seuil plus bas noyait de brouillard les scènes claires ;
     3. tons (ACES, Reinhard, Cinéon, linéaire) et fond (dégradé, uni, transparent) ;
     4. étalonnage (température, contraste, saturation), vignettage, grain — sur l'image affichée, fond compris ;
     5. sRGB.
   Les réglages (rd.st) restent dans le navigateur, comme le reste de l'atelier. */
const RP_VS='varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const RP_DEN=[
  'uniform sampler2D tSrc; uniform vec2 uPx; uniform float uPremul; uniform float uSig; uniform float uThr; varying vec2 vUv;',
  'vec4 rpRd(vec2 uv){ vec4 c = texture2D(tSrc, uv); if(uPremul < 0.5) c.rgb *= c.a; return c; }',
  'void main(){',
  '  vec4 c0 = rpRd(vUv); if(uSig < 0.01){ gl_FragColor = c0; return; }',
  '  vec3 k0 = c0.rgb / (1.0 + c0.rgb); float z = 0.0; vec4 acc = vec4(0.0);',
  '  for(int x = -6; x <= 6; x++) for(int y = -6; y <= 6; y++){',
  '    vec2 d = vec2(float(x), float(y)); float r2 = dot(d, d); if(r2 > 36.0) continue;',
  '    vec4 c = rpRd(vUv + d * uPx); vec3 k = c.rgb / (1.0 + c.rgb); vec3 dk = k - k0; float da = c.a - c0.a;',
  '    float w = exp(-r2 / (2.0 * uSig * uSig)) * exp(-(dot(dk, dk) + da * da) / (2.0 * uThr * uThr));',
  '    acc += w * c; z += w; }',
  '  gl_FragColor = acc / max(z, 1e-6); }'].join('\n');
const RP_BRIGHT=[ // image exposée (prémultipliée), réduite de moitié (4 lectures)
  'uniform sampler2D tSrc; uniform vec2 uPx; uniform float uExpo; varying vec2 vUv;',
  'vec4 rpB(vec2 uv){ vec4 c = texture2D(tSrc, uv); c.rgb *= uExpo; return c; }',
  'void main(){ gl_FragColor = (rpB(vUv + uPx * vec2(-0.5, -0.5)) + rpB(vUv + uPx * vec2(0.5, -0.5)) + rpB(vUv + uPx * vec2(-0.5, 0.5)) + rpB(vUv + uPx * vec2(0.5, 0.5))) * 0.25; }'].join('\n');
const RP_BLUR=[ // flou gaussien séparé, 9 lectures (pas : uDir en pixels de la cible lue)
  'uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;',
  'void main(){ vec4 s = texture2D(tSrc, vUv) * 0.2270270;',
  '  s += (texture2D(tSrc, vUv + uDir * 1.3846154) + texture2D(tSrc, vUv - uDir * 1.3846154)) * 0.3162162;',
  '  s += (texture2D(tSrc, vUv + uDir * 3.2307692) + texture2D(tSrc, vUv - uDir * 3.2307692)) * 0.0702703;',
  '  gl_FragColor = s; }'].join('\n');
const RP_NIV=6; // niveaux du halo : ½ … 1/64 de la taille (le shader final lit le 2e, le 4e et le 6e)
const RP_FINAL=[
  'uniform sampler2D tC; uniform sampler2D tB1; uniform sampler2D tB2; uniform sampler2D tB3;',
  'uniform float uExpo; uniform float uTone; uniform float uHalo; uniform float uBg; uniform vec3 uC1; uniform vec3 uC2;',
  'uniform float uVig; uniform float uGrain; uniform float uCon; uniform float uSat; uniform float uTemp; uniform float uAsp; varying vec2 vUv;',
  'vec3 rpRrt(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }',
  'vec3 rpAces(vec3 c){',
  '  const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));',
  '  const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));',
  '  c *= 1.0 / 0.6; c = I * c; c = rpRrt(c); c = O * c; return clamp(c, 0.0, 1.0); }',
  'vec3 rpTone(vec3 c){ if(uTone < 0.5) return rpAces(c); if(uTone < 1.5) return clamp(c / (1.0 + c), 0.0, 1.0);',
  '  if(uTone < 2.5){ c = max(vec3(0.0), c - 0.004); return pow((c * (6.2 * c + 0.5)) / (c * (6.2 * c + 1.7) + 0.06), vec3(2.2)); } return clamp(c, 0.0, 1.0); }',
  'vec3 rpSrgb(vec3 c){ c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }',
  'vec3 rpLin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }',
  'float rpHash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }',
  'vec3 rpLook(vec3 c, vec2 fc){', // étalonnage, vignettage, grain : couleur affichée (linéaire, 0..1)
  '  c *= vec3(1.0 + 0.12 * uTemp, 1.0 + 0.02 * uTemp, 1.0 - 0.12 * uTemp);',
  '  float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, 1.0 + uSat);',
  '  vec3 s = rpSrgb(c); s = (s - 0.5) * (1.0 + uCon) + 0.5; c = rpLin(clamp(s, 0.0, 1.0));',
  '  vec2 d = (vUv - 0.5) * vec2(uAsp, 1.0) / sqrt(uAsp * uAsp * 0.25 + 0.25); c *= 1.0 - uVig * smoothstep(0.35, 1.0, length(d));',
  '  c += (rpHash(fc) - 0.5) * uGrain * 0.12 * (0.35 + 0.65 * sqrt(max(l, 0.0)));',
  '  return clamp(c, 0.0, 1.0); }',
  'void main(){',
  '  vec4 a = texture2D(tC, vUv);', // linéaire, alpha prémultiplié
  '  vec4 h = (texture2D(tB1, vUv) + texture2D(tB2, vUv) + texture2D(tB3, vUv)) / 3.0;', // halo : image floutée, exposée
  '  vec3 lin = mix(a.rgb * uExpo, h.rgb, uHalo); float al = clamp(mix(a.a, h.a, uHalo), 0.0, 1.0);',
  '  vec3 col = al > 1e-4 ? rpTone(lin / al) : vec3(0.0);',
  '  if(uBg > 1.5){ vec3 c = rpLook(col, gl_FragCoord.xy); gl_FragColor = vec4(rpSrgb(c) * al, al); return; }', // fond transparent : PNG détouré, prémultiplié
  '  vec3 bg = rpLin(uBg > 0.5 ? mix(uC2, uC1, vUv.y) : uC1);',
  '  gl_FragColor = vec4(rpSrgb(rpLook(mix(bg, col, al), gl_FragCoord.xy)), 1.0); }'].join('\n');
function rpCreate(T,r){
  const cam=new T.OrthographicCamera(-1,1,1,-1,0,1),quad=new T.Mesh(new T.PlaneGeometry(2,2)),sc=new T.Scene();
  quad.frustumCulled=false;sc.add(quad);
  const mat=(fs,U)=>new T.ShaderMaterial({uniforms:U,vertexShader:RP_VS,fragmentShader:fs,depthTest:false,depthWrite:false});
  const P={T,r,cam,quad,sc,w:0,h:0,rt:{},
    den:mat(RP_DEN,{tSrc:{value:null},uPx:{value:new T.Vector2()},uPremul:{value:1},uSig:{value:0},uThr:{value:0.1}}),
    bright:mat(RP_BRIGHT,{tSrc:{value:null},uPx:{value:new T.Vector2()},uExpo:{value:1}}),
    blur:mat(RP_BLUR,{tSrc:{value:null},uDir:{value:new T.Vector2()}}),
    fin:mat(RP_FINAL,{tC:{value:null},tB1:{value:null},tB2:{value:null},tB3:{value:null},uExpo:{value:1},uTone:{value:0},uHalo:{value:0},uBg:{value:1},
      uC1:{value:new T.Color()},uC2:{value:new T.Color()},uVig:{value:0},uGrain:{value:0},uCon:{value:0},uSat:{value:0},uTemp:{value:0},uAsp:{value:16/9}})};
  return P;
}
function rpSize(P,w,h){
  if(P.w===w&&P.h===h)return;
  Object.values(P.rt).forEach(t=>t.dispose());P.rt={};
  const T=P.T,mk=(a,b)=>new T.WebGLRenderTarget(Math.max(1,a),Math.max(1,b),{type:T.HalfFloatType,depthBuffer:false});
  P.rt.den=mk(w,h);
  for(let i=1;i<=RP_NIV;i++){const s=1<<i;P.rt['a'+i]=mk(Math.ceil(w/s),Math.ceil(h/s));P.rt['b'+i]=mk(Math.ceil(w/s),Math.ceil(h/s));}
  P.w=w;P.h=h;
}
function rpPass(P,m,target){P.quad.material=m;P.r.setRenderTarget(target);P.r.render(P.sc,P.cam);}
function rpRender(P,src,w,h,o){
  // src : texture linéaire (o.premul : alpha prémultiplié) ; o : {den, halo, expo, tone, bg, c1, c2, vig, grain, con, sat, temp}
  rpSize(P,w,h);
  const D=P.den.uniforms;let tex=src;
  if(o.den>0.001){D.tSrc.value=src;D.uPx.value.set(1/w,1/h);D.uPremul.value=o.premul?1:0;D.uSig.value=0.8+4.2*o.den;D.uThr.value=0.04+0.22*o.den;
    rpPass(P,P.den,P.rt.den);tex=P.rt.den.texture;}
  else if(!o.premul){D.tSrc.value=src;D.uPx.value.set(1/w,1/h);D.uPremul.value=0;D.uSig.value=0;rpPass(P,P.den,P.rt.den);tex=P.rt.den.texture;} // prémultiplie
  const F=P.fin.uniforms;
  if(o.halo>0.001){
    const B=P.bright.uniforms;B.tSrc.value=tex;B.uPx.value.set(1/w,1/h);B.uExpo.value=o.expo;rpPass(P,P.bright,P.rt.a1);
    const L=P.blur.uniforms;
    for(let i=1;i<=RP_NIV;i++){
      const a=P.rt['a'+i],b=P.rt['b'+i];
      if(i>1){L.tSrc.value=P.rt['a'+(i-1)].texture;L.uDir.value.set(0,0);rpPass(P,P.blur,a);} // réduction (lecture bilinéaire)
      L.tSrc.value=a.texture;L.uDir.value.set(1/a.width,0);rpPass(P,P.blur,b);
      L.tSrc.value=b.texture;L.uDir.value.set(0,1/a.height);rpPass(P,P.blur,a);
    }
    F.tB1.value=P.rt.a2.texture;F.tB2.value=P.rt.a4.texture;F.tB3.value=P.rt.a6.texture;
  }else{F.tB1.value=F.tB2.value=F.tB3.value=tex;}
  F.tC.value=tex;F.uExpo.value=o.expo;F.uTone.value=o.tone;F.uHalo.value=o.halo>0.001?o.halo*0.4:0;F.uBg.value=o.bg;
  rpHex(F.uC1.value,o.c1);rpHex(F.uC2.value,o.c2); // valeurs sRGB telles quelles (le three récent convertirait un « #rrggbb »)
  F.uVig.value=o.vig;F.uGrain.value=o.grain;F.uCon.value=o.con;F.uSat.value=o.sat;F.uTemp.value=o.temp;F.uAsp.value=w/h;
  if(o.halo<=0.001){F.uHalo.value=0;}
  rpPass(P,P.fin,null);
}
function rpHex(c,h){const v=parseInt(String(h).slice(1),16)||0;c.setRGB(((v>>16)&255)/255,((v>>8)&255)/255,(v&255)/255);}
function rpOpts(premul,den){ // réglages de l'atelier → rpRender
  const st=rd.st;
  return {premul,den:den?+st.pDen:0,halo:+st.pHalo,expo:Math.pow(2,st.ev),tone:{aces:0,doux:1,cine:2,lin:3}[st.tons]||0,
    bg:st.fond==='transparent'?2:st.fond==='degrade'||st.fond==='studio'?1:0,c1:st.fc1,c2:st.fc2,
    vig:+st.pVig,grain:+st.pGrain,con:+st.pCon,sat:+st.pSat,temp:+st.pTemp};
}
function rpDispose(P){if(!P)return;Object.values(P.rt).forEach(t=>t.dispose());['den','bright','blur','fin'].forEach(k=>P[k].dispose());P.quad.geometry.dispose();}
/* ── enregistrement : le PNG, ou (« Calques séparés ») une archive .zip pour la retouche :
   beauté (l'image finie) + calques géométriques rendus par le moteur rapide, même cadrage, sans décalage :
   masque (pièce blanche sur noir), profondeur (proche = clair), normales (repère de la caméra),
   identifiants (une teinte par corps), ombre (ombre portée seule, noire sur blanc : en « produit »). ── */
async function rdSaveImage(blob,W,H,base){
  let out=blob,name=base+'.png',zip=false;
  if(rd.st.calques){
    const files={'1 - beaute.png':new Uint8Array(await blob.arrayBuffer())},L=await rdLayers(W,H);
    for(const k of Object.keys(L))files[k]=new Uint8Array(await L[k].arrayBuffer());
    const Lib=await rtLoad();
    out=new Blob([Lib.zipSync(files,{level:0})],{type:'application/zip'});name=base+' - calques.zip';zip=true;
  }
  const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  return {url,size:out.size,zip};
}
async function rdLayers(W,H){
  const r=rd.r,sc=rd.scene,cam=rd.cam,G=rd.group.children.filter(m=>m.isMesh);
  r.setPixelRatio(1);r.setSize(W,H,false);cam.clearViewOffset();cam.updateMatrixWorld();
  const keep={bg:sc.background,vis:[rd.disk,rd.floor,rd.studio,rd.edges].map(o=>o&&o.visible),mats:G.map(m=>m.material),
    fo:rd.floor.material.opacity,fc:rd.floor.material.color.getHex(),cc:r.getClearColor(new THREE.Color()).getHex(),ca:r.getClearAlpha()};
  const hide=()=>{[rd.disk,rd.studio,rd.edges,rd.floor].forEach(o=>{if(o)o.visible=false;});};
  const box=rd.box,cen=box.getCenter(new THREE.Vector3()),R=box.getSize(new THREE.Vector3()).length()*0.5||50,dc=cam.position.distanceTo(cen);
  const made=[],shot=async(nom,bg,mats)=>{
    hide();sc.background=null;
    G.forEach((m,i)=>{m.material=mats(i);});
    r.setRenderTarget(null);r.setClearColor(bg,1);r.clear();r.render(sc,cam);
    const b=await new Promise(res=>rd.canvas.toBlob(res,'image/png'));if(b)made.push([nom,b]);
  };
  const tmp=[],T=m=>{tmp.push(m);return m;};
  try{
    const white=T(new THREE.MeshBasicMaterial({color:0xffffff}));
    await shot('2 - masque.png',0x000000,()=>white);
    const dep=T(new THREE.ShaderMaterial({uniforms:{uN:{value:Math.max(0.01,dc-R)},uF:{value:dc+R}},
      vertexShader:'varying float vZ;\nvoid main(){ vec4 p = modelViewMatrix * vec4(position, 1.0); vZ = -p.z; gl_Position = projectionMatrix * p; }',
      fragmentShader:'uniform float uN; uniform float uF; varying float vZ;\nvoid main(){ float d = clamp((vZ - uN) / (uF - uN), 0.0, 1.0); gl_FragColor = vec4(vec3(1.0 - d), 1.0); }'}));
    await shot('3 - profondeur.png',0x000000,()=>dep);
    const nor=T(new THREE.MeshNormalMaterial());
    await shot('4 - normales.png',0x8080ff,()=>nor);
    const ids=G.map((m,i)=>T(new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL((i*0.618034)%1,0.75,0.55)})));
    await shot('5 - identifiants.png',0x000000,i=>ids[i]);
    // ombre : la pièce n'écrit aucune couleur (elle masque seulement le sol et porte son ombre)
    const inv=T(new THREE.MeshBasicMaterial({colorWrite:false}));
    hide();rd.floor.visible=true;rd.floor.material.opacity=1;rd.floor.material.color.setHex(0x000000);
    G.forEach(m=>{m.material=inv;});sc.background=null;
    // pénombre : moyenne de 48 positions de la lampe dans son disque (« Douceur »), comme l'affinage
    const acc=document.createElement('canvas');acc.width=W;acc.height=H;const g2=acc.getContext('2d');
    for(let i=0;i<48;i++){
      rdSunJitter(i);r.shadowMap.needsUpdate=true;
      r.setRenderTarget(null);r.setClearColor(0xffffff,1);r.clear();r.render(sc,cam);
      g2.globalAlpha=1/(i+1);g2.drawImage(rd.canvas,0,0);
    }
    rdSunJitter(-1);
    const b=await new Promise(res=>acc.toBlob(res,'image/png'));if(b)made.push(['6 - ombre.png',b]);
  }finally{
    G.forEach((m,i)=>{m.material=keep.mats[i];});tmp.forEach(m=>m.dispose());
    sc.background=keep.bg;[rd.disk,rd.floor,rd.studio,rd.edges].forEach((o,i)=>{if(o)o.visible=keep.vis[i];});
    rd.floor.material.opacity=keep.fo;rd.floor.material.color.setHex(keep.fc);r.setClearColor(keep.cc,keep.ca);r.shadowMap.needsUpdate=true;
  }
  return Object.fromEntries(made);
}
