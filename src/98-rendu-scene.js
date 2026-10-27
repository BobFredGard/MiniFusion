/* ---------- scène de l'atelier RENDU : HDRI importée, studio courbe, supports texturés (V0.14.0) ----------
   - HDRI : image panoramique (.hdr Radiance, .exr OpenEXR) lue par les chargeurs du three récent
     (threejs/rendu-rayons.js, chargé pour l'occasion), réduite à 2048 px de large, gardée dans le
     navigateur (IndexedDB : elle revient à la prochaine ouverture, jamais dans le document). Les deux
     moteurs la reçoivent rééchantillonnée dans LEUR convention équirectangulaire, mais Z en haut (la
     convention de la CAO : l'image est faite Y en haut) et tournée de « Rotation ». Le soleil de l'image
     (zone la plus lumineuse, s'il en a un) devient la lampe du moteur rapide — ombre portée, la PMREM
     n'en fait pas — et « Lampe » règle sa force dans les deux moteurs. Elle peut aussi servir de fond.
   - Studio courbe : cuvette de révolution (sol plat, gorge, mur), comme un fond papier de photographe,
     sans bord visible quelle que soit la vue ; couleur du sol. Dans le lancer de rayons, ses murs laissent
     passer les rayons d'ombre (castShadow false) : l'ambiance éclaire la pièce à travers eux.
   - Supports : béton, plateau de bois, marbre, tapis de découpe — textures périodiques à l'échelle réelle
     (mm), posées sur le disque du sol (moteur rapide) ou son équivalent physique (lancer de rayons). */
const RD_SUPPORTS=[['','Uni'],['beton','Béton'],['bois','Plateau de bois'],['marbre','Marbre'],['tapis','Tapis de découpe']];
// t tuile (mm) · r rugosité (lancer de rayons)
const RD_SUP_DEF={beton:{t:400,r:0.85},bois:{t:600,r:0.45},marbre:{t:500,r:0.2},tapis:{t:100,r:0.7}};
let rdHdri=null; // {name, w, h, data (Float32 RGBA, Y en haut, ligne 0 en haut), sun:{u,v,lum}|null, at}
/* ── HDRI : import, mémoire du navigateur ── */
const RD_IDB='minifusion_hdri';
function rdIdb(mode,fn){
  return new Promise((ok,ko)=>{
    let rq;try{rq=indexedDB.open(RD_IDB,1);}catch(e){ko(e);return;}
    rq.onupgradeneeded=()=>{rq.result.createObjectStore('img');};
    rq.onerror=()=>ko(rq.error);
    rq.onsuccess=()=>{const db=rq.result,tx=db.transaction('img',mode),st=tx.objectStore('img');
      const r=fn(st);tx.oncomplete=()=>{db.close();ok(r&&r.result);};tx.onerror=()=>{db.close();ko(tx.error);};};
  });
}
function rdHdriSave(h){return rdIdb('readwrite',st=>st.put({name:h.name,w:h.w,h:h.h,data:h.data,sun:h.sun,at:h.at},'derniere')).catch(()=>{});}
async function rdHdriRestore(){ // l'HDRI de la dernière fois, si le navigateur l'a gardée
  if(rdHdri)return rdHdri;
  try{const h=await rdIdb('readonly',st=>st.get('derniere'));if(h&&h.data&&h.w&&h.h)rdHdri=h;}catch(e){}
  return rdHdri;
}
function rdHdriParse(L,buf,name){
  // → {w, h, data Float32 RGBA, ligne 0 en haut} ; .exr : ligne 0 en bas chez three, retournée
  const exr=/\.exr$/i.test(name);
  const ld=exr?new L.EXRLoader():new L.HDRLoader();ld.setDataType(L.THREE.FloatType);
  const t=ld.parse(buf);
  const w=t.width,h=t.height,src=t.data,nc=Math.round(src.length/(w*h));
  const k=Math.max(1,Math.ceil(w/2048)),W=Math.floor(w/k),H=Math.floor(h/k),out=new Float32Array(W*H*4);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    let r=0,g=0,b=0;
    for(let j=0;j<k;j++)for(let i=0;i<k;i++){
      const sy=y*k+j,row=exr?(h-1-sy):sy,o=(row*w+x*k+i)*nc;
      r+=src[o];g+=src[o+(nc>1?1:0)];b+=src[o+(nc>2?2:0)];
    }
    const o=(y*W+x)*4,n=k*k;out[o]=r/n;out[o+1]=g/n;out[o+2]=b/n;out[o+3]=1;
  }
  return {w:W,h:H,data:out};
}
function rdHdriSun(H){
  // soleil : pixel le plus lumineux (image lissée 4 × 4), s'il dépasse 30 fois la luminance moyenne
  const {w,h,data}=H;let best=-1,bu=0,bv=0,sum=0;
  for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){
    let l=0;for(let j=0;j<4&&y+j<h;j++)for(let i=0;i<4&&x+i<w;i++){const o=((y+j)*w+x+i)*4;l+=0.2126*data[o]+0.7152*data[o+1]+0.0722*data[o+2];}
    l/=16;sum+=l;if(l>best){best=l;bu=(x+2)/w;bv=(y+2)/h;}
  }
  const mean=sum/((w/4)*(h/4));
  return best>30*mean?{u:bu,v:bv,lum:best}:null;
}
function rdHdriImport(onDone){
  const inp=document.createElement('input');inp.type='file';inp.accept='.hdr,.exr';
  inp.onchange=async()=>{
    const f=inp.files&&inp.files[0];if(!f)return;
    rdMsg('Lecture de « '+f.name+' »…');
    try{
      const L=await rtLoad(),buf=await f.arrayBuffer();
      const P=rdHdriParse(L,buf,f.name);
      rdHdri={name:f.name.replace(/\.(hdr|exr)$/i,''),w:P.w,h:P.h,data:P.data,sun:null,at:Date.now()};
      rdHdri.sun=rdHdriSun(rdHdri);
      rdHdriSave(rdHdri);
      rdMsg('HDRI « '+rdHdri.name+' » : '+P.w+' × '+P.h+(rdHdri.sun?', soleil repéré (lampe du moteur rapide)':', sans soleil marqué')+'.');
      onDone&&onDone();
    }catch(e){rdMsg('HDRI illisible : '+(e&&e.message||e));}
  };
  inp.click();
}
/* ── HDRI → image du monde (Z en haut), convention équirectangulaire commune aux deux moteurs :
   pixel (u, v) → direction d = (sin φ cos θ, cos φ, sin φ sin θ), θ = (u − ½)·2π, φ = (1 − v)·π
   (three r147 equirectUv et three-gpu-pathtracer l'emploient tous deux) ; ligne 0 = v ≈ 0 = bas. ── */
function rdHdriDir(H,u,v){ // pixel de l'HDRI → direction du monde (Z en haut), avant rotation
  const th=(u-0.5)*2*Math.PI,ph=v*Math.PI; // ligne 0 en haut : v = 0 → zénith
  const x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th);
  return [x,-z,y]; // repère de l'image (Y en haut) → monde (Z en haut)
}
function rdHdriWorld(H,rot,W,sunK,sunCut){
  // Float32 RGBA W × W/2 ; sunK : facteur du soleil ; sunCut : soleil ôté (moteur rapide : la lampe le remplace)
  const Hh=W/2,out=new Float32Array(W*Hh*4),c=Math.cos(-rot),s=Math.sin(-rot),hw=H.w,hh=H.h,D=H.data;
  let sd=null,sc=0;
  if(H.sun){sd=rdHdriDir(H,H.sun.u,H.sun.v);sc=Math.cos(4*Math.PI/180);}
  for(let j=0;j<Hh;j++){
    const ph=(1-(j+0.5)/Hh)*Math.PI,sp=Math.sin(ph),cp=Math.cos(ph);
    for(let i=0;i<W;i++){
      const th=((i+0.5)/W-0.5)*2*Math.PI;
      let X=sp*Math.cos(th),Y=cp,Z=sp*Math.sin(th);
      const x0=X*c-Y*s,y0=X*s+Y*c;X=x0;Y=y0; // rotation inverse autour de Z
      const ix=X,iy=Z,iz=-Y; // monde → image (Y en haut)
      const u=(Math.atan2(iz,ix)/(2*Math.PI)+0.5)*hw-0.5,v=Math.acos(Math.max(-1,Math.min(1,iy)))/Math.PI*hh-0.5;
      const u0=Math.floor(u),v0=Math.max(0,Math.min(hh-1,Math.floor(v))),v1=Math.min(hh-1,v0+1),fu=u-u0,fv=Math.max(0,Math.min(1,v-v0));
      const a=((u0%hw)+hw)%hw,b=(a+1)%hw,o=(j*W+i)*4;
      for(let ch=0;ch<3;ch++)out[o+ch]=(D[(v0*hw+a)*4+ch]*(1-fu)+D[(v0*hw+b)*4+ch]*fu)*(1-fv)+(D[(v1*hw+a)*4+ch]*(1-fu)+D[(v1*hw+b)*4+ch]*fu)*fv;
      out[o+3]=1;
      if(sd&&X*sd[0]+Y*sd[1]+Z*sd[2]>=sc){ // disque du soleil (4°)
        if(sunCut){const m=H.sun.lum*0.02;for(let ch=0;ch<3;ch++)out[o+ch]=Math.min(out[o+ch],m);}
        else for(let ch=0;ch<3;ch++)out[o+ch]*=sunK;
      }
    }
  }
  return out;
}
function rdHdriGround(H){ // radiance moyenne du sol de l'image (5 à 35° sous l'horizon) : couleur du sol devant « Image »
  if(H.ground)return H.ground;
  const g=[0,0,0];let n=0;
  for(let y=Math.floor(H.h*(0.5+5/180));y<Math.floor(H.h*(0.5+35/180));y++)for(let x=0;x<H.w;x+=2){const o=(y*H.w+x)*4;g[0]+=H.data[o];g[1]+=H.data[o+1];g[2]+=H.data[o+2];n++;}
  return (H.ground=g.map(v=>n?v/n:0.3));
}
function rdLinHex(c){ // radiance linéaire → '#rrggbb' sRGB (bornée à 1)
  const s=v=>{v=Math.max(0,Math.min(1,v));v=v<=0.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-0.055;return ('0'+Math.round(v*255).toString(16)).slice(-2);};
  return '#'+s(c[0])+s(c[1])+s(c[2]);
}
function rdEnvCal(){
  // éclairement d'un plan horizontal {eUp [r,g,b] (ciel, panneaux ou image), eKey (lampe)} — celui que reçoit le
  // sol du lancer de rayons (rtEnvData) ; mis en cache par ambiance. Sert à caler un sol ÉCLAIRÉ (studio du
  // moteur rapide) : albédo = couleur × π / (eUp × Reflets + eKey) — hors de l'ombre, il garde sa couleur.
  const k=rtEnvKey();
  if(!rd.envCal||rd.envCal.k!==k){const {eUp,eKey}=rtEnvData();rd.envCal={k,eUp,eKey};}
  return rd.envCal;
}
function rdHdriSunKey(H){ // soleil → [azimut, élévation] en degrés (avant rotation) et son éclairement
  if(!H||!H.sun)return null;
  const d=rdHdriDir(H,H.sun.u,H.sun.v),sc=Math.cos(4*Math.PI/180),hw=H.w,hh=H.h;let E=0;
  for(let y=0;y<hh;y++){const ph=(y+0.5)/hh*Math.PI,dO=(2*Math.PI/hw)*(Math.PI/hh)*Math.sin(ph);
    for(let x=0;x<hw;x++){const q=rdHdriDir(H,(x+0.5)/hw,(y+0.5)/hh);if(q[0]*d[0]+q[1]*d[1]+q[2]*d[2]<sc)continue;
      const o=(y*hw+x)*4;E+=(0.2126*H.data[o]+0.7152*H.data[o+1]+0.0722*H.data[o+2])*dO;}}
  return {az:Math.atan2(d[1],d[0])*180/Math.PI,el:Math.asin(Math.max(-1,Math.min(1,d[2])))*180/Math.PI,E};
}
/* ── supports texturés : albédo sRGB 8 bits, tuile périodique de RD_SUP_DEF[k].t mm ── */
const _rdSupCache={};
function rdSupTex(k){
  if(_rdSupCache[k])return _rdSupCache[k];
  const N=1024,a=new Uint8Array(N*N*4),T=RD_SUP_DEF[k].t,mm=T/N;
  const put=(i,r,g,b)=>{a[i]=Math.max(0,Math.min(255,Math.round(r)));a[i+1]=Math.max(0,Math.min(255,Math.round(g)));a[i+2]=Math.max(0,Math.min(255,Math.round(b)));a[i+3]=255;};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const i=(y*N+x)*4,u=x/N,v=y/N;
    if(k==='beton'){ // gris ciment, nuages, pores
      const c1=Math.round(T/60),c2=Math.round(T/6),n=sfFbm(u*c1,v*c1,c1,c1,31)*0.7+sfNoise(u*c2,v*c2,c2,c2,32)*0.3,p=sfNoise(u*T/1.2,v*T/1.2,Math.round(T/1.2),Math.round(T/1.2),33);
      const g=150+(n-0.5)*55-(p>0.93?28:0);put(i,g*1.0,g*0.98,g*0.95);
    }else if(k==='bois'){ // 5 lames de 120 mm, fil le long de u (cernes larges ondulés + traits fins), joints sombres
      const lame=Math.floor(v*5),vv=v*5-lame,cw=Math.round(T/80),cs=Math.round(T/3);
      const cerne=sfTri(((vv*120)+(sfFbm(u*cw,vv*2+lame*3.1,cw,1e6,40+lame)-0.5)*40)/11);
      const trait=sfNoise(u*cs*0.04,vv*120/0.7,Math.max(1,Math.round(cs*0.04)),1e6,44+lame);
      const t=0.8+0.12*Math.pow(cerne,2)+0.08*(trait-0.5)+(sfHash(lame,0,41)-0.5)*0.16;
      const joint=vv<0.012||vv>0.988?0.35:1;put(i,190*t*joint,138*t*joint,92*t*joint);
    }else if(k==='marbre'){ // blanc veiné
      const c=Math.round(T/90),w=sfFbm(u*c,v*c,c,c,51)*2.2,vein=Math.pow(sfTri(u*3+v*2+w),6);
      const g=232-vein*120+(sfNoise(u*c*4,v*c*4,c*4,c*4,52)-0.5)*14;put(i,g,g*0.99,g*0.97);
    }else{ // tapis de découpe : vert, quadrillage 10 mm, traits forts tous les 50 mm
      const X=x*mm,Y=y*mm,dx=Math.min(X%10,10-X%10),dy=Math.min(Y%10,10-Y%10),DX=Math.min(X%50,50-X%50),DY=Math.min(Y%50,50-Y%50);
      const l=Math.min(dx,dy)<0.18?1:0,L2=Math.min(DX,DY)<0.35?1:0,n=(sfNoise(u*40,v*40,40,40,61)-0.5)*10;
      if(L2)put(i,222,234,226);else if(l)put(i,150+n,196+n,170+n);else put(i,38+n,110+n,78+n);
    }
  }
  return (_rdSupCache[k]={data:a,N,t:T});
}
/* ── studio courbe : profil (r, z) de la cuvette pour un corps de rayon R ── */
function rdStudioProfile(R){
  const r1=2.5*R,rc=2.2*R,h=6*R,P=[[0,0],[r1,0]];
  for(let i=1;i<=16;i++){const a=i/16*Math.PI/2;P.push([r1+rc*Math.sin(a),rc*(1-Math.cos(a))]);}
  P.push([r1+rc,h]);
  return P;
}
function rdStudioGeo(T3,R){ // LatheGeometry (axe Y) couchée sur Z, face vers l'intérieur
  const pts=rdStudioProfile(R).map(([r,z])=>new T3.Vector2(Math.max(r,1e-3),z));
  const g=new T3.LatheGeometry(pts,256);g.rotateX(Math.PI/2); // 256 côtés : pas de facettes dans le vernis
  return g;
}
