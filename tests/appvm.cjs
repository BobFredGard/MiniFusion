// Harnais de test sans Electron : exécute le script principal de fusion_mvp.html
// dans un sandbox vm avec des stubs DOM/THREE, et expose les fonctions d'esquisse.
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');

const APP=process.env.APP_FILE||path.join(__dirname,'..','fusion_mvp.html');

// --- boucle d'événements minimale : les handlers ajoutés par l'app sont réellement appelés ---
const EVCAT=new Map(); // clé: node|'window'|documentStub → {type:[fn]}
function evBind(k,t,fn){if(typeof fn!=='function')return;if(!EVCAT.has(k))EVCAT.set(k,{});const m=EVCAT.get(k);(m[t]=m[t]||[]).push(fn);}
function evFire(k,ev){
  const m=EVCAT.get(k);const a=m&&m[ev.type];
  if(a&&a.length)[...a].forEach(f=>{try{f(ev);}catch(e){console.log('[ev]',String(e&&e.message||e).slice(0,200));}});
}
const ctx2d={
  fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',textBaseline:'',globalAlpha:1,globalCompositeOperation:'',shadowColor:'',shadowBlur:0,lineCap:'',lineJoin:'',filter:'',
  createLinearGradient(){return{addColorStop(){}};},createRadialGradient(){return{addColorStop(){}};},
  fillRect(){},strokeRect(){},clearRect(){},fillText(){},strokeText(){},measureText(){return{width:0};},
  save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},arc(){},closePath(){},fill(){},stroke(){},setLineDash(){},drawImage(){},setTransform(){},getImageData(){return{data:new Uint8ClampedArray(4),width:1,height:1};},putImageData(){},createPattern(){return null;}
};
function mkNode(){
  const n={
    tagName:'DIV',
    addEventListener(t,fn){evBind(n,t,fn);},removeEventListener(){},
    dispatchEvent(ev){ev.target=n;ev.currentTarget=n;evFire(n,ev);evFire('window',ev);return !ev.defaultPrevented;},
    setPointerCapture(){},releasePointerCapture(){},setCapture(){},releaseCapture(){},
    style:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},
    contains(){return false;},querySelector(){return null;},querySelectorAll(){return [];},
    focus(){},blur(){},click(){},remove(){},preventDefault(){},stopPropagation(){},
    setAttribute(){},getAttribute(){return null;},removeAttribute(){},
    getBoundingClientRect(){return{left:0,top:0,right:800,bottom:600,width:800,height:600};},
    appendChild(c){if(c)n.children.push(c);return c;},insertBefore(){return null;},removeChild(){return null;},replaceChild(){return null;},
    clientWidth:800,clientHeight:500,value:'',checked:false,textContent:'',innerHTML:'',className:'',id:'',onload:null,onerror:null,
    firstChild:null,lastChild:null,parentNode:null,childNodes:[],children:[],dataset:{}
  };
  n.getContext=()=>ctx2d;
  return n;
}
const idMap=new Map();
const docBodyNode=mkNode();docBodyNode.tagName='BODY';docBodyNode.id='body';
const documentStub={
  getElementById:id=>{if(!idMap.has(id))idMap.set(id,mkNode());return idMap.get(id);},
  createElement:tag=>{const n=mkNode();n.tagName=String(tag).toUpperCase();return n;},
  createElementNS:(ns,tag)=>{const n=mkNode();n.tagName=String(tag).toUpperCase();return n;},
  createTextNode:()=>mkNode(),createEvent:()=>({initEvent(){},initMouseEvent(){},initPointerEvent(){}}),
  addEventListener(t,fn){evBind(documentStub,t,fn);},removeEventListener(){},
  dispatchEvent(ev){ev.target=documentStub;evFire(documentStub,ev);evFire('window',ev);return true;},
  querySelector(sel){
    if(sel==='body > input')return docBodyNode.children.find(c=>String(c.tagName).toUpperCase()==='INPUT')||null;
    return null;},
  querySelectorAll(sel){return [];},
  head:mkNode(),body:docBodyNode,documentElement:mkNode(),title:'',readyState:'complete'
};

function mkAny(depth){
  if(depth>10)return undefined;
  const f=function(){return mkAny(depth+1);};
  return new Proxy(f,{
    get(t,k){if(typeof k==='symbol')return undefined;return mkAny(depth+1);},
    set(){return true;},
    apply(){return mkAny(depth+1);},
    construct(){return mkAny(depth+1);}
  });
}
function mkShapePath(){
  // stub concret pour THREE.Shape / THREE.Path : sketchShape() a besoin de
  // .curves / .holes réels (tableaux) pour compter les trous.
  return function(){return{curves:[],holes:[],moveTo(){},lineTo(){},absarc(){},closePath(){}};};
}
function mkBoxGeometry(){return{dispose(){}};}
function mkMaterial(){return{dispose(){},side:0,transparent:false};}
function mkMeshGeometry(){return{dispose(){},getAttribute(){return null;}};}
function mkScene(){
  const o={children:[],background:null,fog:null,userData:{},name:'',type:'Scene',
    add(){return this;},remove(){return this;},traverse(){},getObjectByName(){return null;},
    getObjectById(){return null;},toJSON(){return{};}};
  return o;
}
function mkObject(){
  const o={children:[],position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,order:'XYZ'},scale:{x:1,y:1,z:1},
    name:'',visible:true,userData:{},type:'Object3D',isMesh:false,isGroup:false,
    add(){return this;},remove(){return this;},addEventListener(){},removeEventListener(){},
    dispatchEvent(){return true;},traverse(){},raycast(){},updateMatrix(){},dispose(){}};
  return o;
}
function mkVector3Class(){
  // Vector3 CONCRET pour les tests : l'arithmétique (dot/clone/subVectors…) doit être réelle —
  // le proxy magique ci-dessous rendait findHostForFace/sketchBasis inopérants en VM.
  return class Vector3{
    constructor(x,y,z){this.x=+x||0;this.y=+y||0;this.z=+z||0;}
    set(x,y,z){this.x=+x||0;this.y=+y||0;this.z=+z||0;return this;}
    setScalar(s){this.x=s;this.y=s;this.z=s;return this;}
    copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
    clone(){return new this.constructor(this.x,this.y,this.z);}
    add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
    addVectors(a,b){this.x=a.x+b.x;this.y=a.y+b.y;this.z=a.z+b.z;return this;}
    addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
    sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
    subVectors(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this;}
    multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
    divideScalar(s){return this.multiplyScalar(1/s);}
    dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;}
    lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
    length(){return Math.sqrt(this.lengthSq());}
    normalize(){const l=this.length()||1;this.x/=l;this.y/=l;this.z/=l;return this;}
    lerp(v,a){this.x+=(v.x-this.x)*a;this.y+=(v.y-this.y)*a;this.z+=(v.z-this.z)*a;return this;}
    crossVectors(a,b){const ax=a.x,ay=a.y,az=a.z,bx=b.x,by=b.y,bz=b.z;
      this.x=ay*bz-az*by;this.y=az*bx-ax*bz;this.z=ax*by-ay*bx;return this;}
    cross(v){return this.crossVectors(this,v);}
    distanceTo(v){return Math.sqrt(this.distanceToSquared(v));}
    distanceToSquared(v){const dx=this.x-v.x,dy=this.y-v.y,dz=this.z-v.z;return dx*dx+dy*dy+dz*dz;}
    applyMatrix3(m){return this;} // suffisant pour les tests (reconstruit si besoin)
    applyMatrix4(m){return this;}
    setFromMatrixPosition(m){return this;}
    equals(v){return this.x===v.x&&this.y===v.y&&this.z===v.z;}
    fromArray(a){this.x=a[0]||0;this.y=a[1]||0;this.z=a[2]||0;return this;}
    toArray(){return[this.x,this.y,this.z];}
  };
}
const Vector3Stub=mkVector3Class();
const THREE=new Proxy({},{
  get(t,k){
    if(typeof k==='symbol')return undefined;
    if(k==='Shape')return mkShapePath();
    if(k==='Path')return mkShapePath();
    if(k==='Scene')return mkScene;
    if(k==='Group')return mkObject;
    if(k==='Vector3')return Vector3Stub;
    if(k==='Mesh')return function(){const o=mkObject();o.isMesh=true;o.material=mkMaterial();o.geometry=mkMeshGeometry();o.matrixAutoUpdate=true;o.matrix={};return o;};
    if(k==='PerspectiveCamera'||k==='OrthographicCamera')return function(){const o=mkObject();o.projectionMatrix={};o.fov=50;o.updateProjectionMatrix=function(){};return o;};
    if(k==='BoxGeometry'||k==='CylinderGeometry'||k==='SphereGeometry')return mkBoxGeometry;
    return function(){return mkAny(0);};
  }
});

function loadApp(){
  const html=fs.readFileSync(APP,'utf8');
  const m=html.match(/<script>([\s\S]*?)<\/script>/);
  if(!m)throw new Error('script introuvable');
  const sandbox={
    console,document:documentStub,localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
    requestAnimationFrame:()=>{},cancelAnimationFrame(){},setTimeout,clearTimeout,setInterval,clearInterval,
    performance:global.performance,fetch:()=>Promise.reject(new Error('fetch stub')),Promise,Math,JSON,Date,String,Number,Boolean,Array,Object,RegExp,Error,TypeError,RangeError,Map,Set,WeakMap,WeakSet,Symbol,Proxy,Reflect,Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt,
    THREE,
    location:{href:'file:///fusion_mvp.html',protocol:'file:'},
    navigator:{userAgent:'node',platform:'test',onLine:true},
    history:{pushState(){},replaceState(){},back(){},forward(){}},
    screen:{width:1280,height:900},
    devicePixelRatio:1,
    crypto:global.crypto||{getRandomValues:(a)=>{for(let i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);return a;}}
  };
  sandbox.window=sandbox;sandbox.self=sandbox;sandbox.globalThis=sandbox;
  sandbox.addEventListener=function(t,fn){evBind('window',t,fn);};sandbox.removeEventListener=function(){};
  sandbox.dispatchEvent=function(ev){evFire('window',ev);return true;};
  sandbox.matchMedia=function(){return{matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}};};
  sandbox.getComputedStyle=function(){return{getPropertyValue:function(){return '';},setProperty(){}};};
  class PointerEvent{constructor(type,init={}){this.type=type;this.clientX=init.clientX||0;this.clientY=init.clientY||0;this.offsetX=init.offsetX||0;this.offsetY=init.offsetY||0;this.button=(init.button===undefined)?0:init.button;this.buttons=init.buttons||0;this.shiftKey=!!init.shiftKey;this.ctrlKey=!!init.ctrlKey;this.altKey=!!init.altKey;this.pointerId=init.pointerId||1;this.detail=init.detail||0;}preventDefault(){}stopPropagation(){}}
  class MouseEvent{constructor(type,init={}){this.type=type;this.clientX=init.clientX||0;this.clientY=init.clientY||0;this.button=(init.button===undefined)?0:init.button;this.buttons=init.buttons||0;this.shiftKey=!!init.shiftKey;this.ctrlKey=!!init.ctrlKey;this.altKey=!!init.altKey;this.detail=init.detail||0;}preventDefault(){}stopPropagation(){}}
  class KeyboardEvent{constructor(type,init={}){this.type=type;this.key=init.key||'';this.code=init.code||'';this.shiftKey=!!init.shiftKey;this.ctrlKey=!!init.ctrlKey;this.altKey=!!init.altKey;}preventDefault(){}stopPropagation(){}}
  const dragEv=(x,y,extra={})=>({clientX:x,clientY:y,button:0,buttons:1,preventDefault(){},stopPropagation(){},shiftKey:false,ctrlKey:false,altKey:false,...extra});
  sandbox.PointerEvent=PointerEvent;sandbox.MouseEvent=MouseEvent;sandbox.KeyboardEvent=KeyboardEvent;sandbox.dragEv=dragEv;
  const ctx=vm.createContext(sandbox);
  let loadErr=null;
  try{ vm.runInContext(m[1],ctx,{filename:'fusion_mvp.html'}); }
  catch(e){ loadErr=e; }
  return { ctx, sandbox, loadErr };
}
async function runTest(body){
  const {ctx,loadErr}=loadApp();
  if(loadErr)console.log('LOAD-ERR', String((loadErr&&(loadErr.message||loadErr))||loadErr).slice(0,200), '\nSTACK:', (loadErr&&loadErr.stack||'').slice(0,600));
  const p=vm.runInContext('(async()=>{\n'+body+'\n})()',ctx,{filename:'test.cjs'});
  let val=await p;
  while(val&&typeof val.then==='function')val=await val; // laisse passer une IIFE imbriquée
  console.log('RESULT', JSON.stringify(val,null,2));
  if(!val||val.err){process.exit(1);}
}
module.exports={runTest,APP,loadApp,documentStub,THREE};