/* miniFusion — atelier RENDU, moteur « Lancer de rayons » : bibliothèque empaquetée (script classique → window.RDPT).
   three 0.186.1 (MIT, Three.js Authors) · three-mesh-bvh 0.9.16 (MIT, Garrett Johnson) · three-gpu-pathtracer 0.0.27 (MIT, Garrett Johnson) · HDRLoader, EXRLoader et fflate (MIT) pour les images HDRI.
   Fichier GÉNÉRÉ par tools/rendu-rayons-entree.mjs (voir l’en-tête de ce fichier) : ne pas éditer. */
var RDPT=(()=>{var Zc=Object.defineProperty;var Fm=Object.getOwnPropertyDescriptor;var Nm=Object.getOwnPropertyNames;var Um=Object.prototype.hasOwnProperty;var jh=(i,e)=>{for(var t in e)Zc(i,t,{get:e[t],enumerable:!0})},Bm=(i,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Nm(e))!Um.call(i,r)&&r!==t&&Zc(i,r,{get:()=>e[r],enumerable:!(n=Fm(e,r))||n.enumerable});return i};var Om=i=>Bm(Zc({},"__esModule",{value:!0}),i);var FS={};jh(FS,{EXRLoader:()=>Xc,HDRLoader:()=>Wc,PhysicalCamera:()=>ys,THREE:()=>LS,WebGLPathTracer:()=>Gc});var bf=0,Au=1,Mf=2;var js=1,Tf=2,$r=3,bn=0,$t=1,xn=2,Jt=0,ti=1,eo=2,Eu=3,Ru=4,wf=5;var lr=100,Af=101,Ef=102,Rf=103,Cf=104,If=200,Pf=201,Df=202,Lf=203,Cu=204,Iu=205,Ff=206,Nf=207,Uf=208,Bf=209,Of=210,zf=211,kf=212,Vf=213,Hf=214,xa=0,va=1,_a=2,Vr=3,ya=4,Sa=5,ba=6,Ma=7,Pu=0,Gf=1,Wf=2,Mn=0,Du=1,to=2,no=3,io=4,Lu=5,ro=6,so=7;var Fu=300,Ui=301,cr=302,ni=303,Ya=304,oo=306,rn=1e3,Dt=1001,Ta=1002,Qe=1003,Xf=1004;var ao=1005;var nt=1006,Za=1007;var _i=1008,Nu=1008,on=1009,Jr=1010,lo=1011,Bi=1012,Oi=1013,an=1014,et=1015,ct=1016,$a=1017,Ja=1018,Kr=1020,Uu=35902,Bu=35899,Ou=1021,zu=1022,Ge=1023,jn=1026,zi=1027,Tn=1028,Qr=1029,ln=1030,ki=1031;var Vi=1033,co=33776,uo=33777,ho=33778,fo=33779,Ka=35840,Qa=35841,ja=35842,el=35843,tl=36196,nl=37492,il=37496,rl=37488,sl=37489,po=37490,ol=37491,al=37808,ll=37809,cl=37810,ul=37811,hl=37812,fl=37813,dl=37814,pl=37815,ml=37816,gl=37817,xl=37818,vl=37819,_l=37820,yl=37821,Sl=36492,bl=36494,Ml=36495,Tl=36283,wl=36284,mo=36285,Al=36286;var Fs=2300,wa=2301,ma=2302,vu=2303,_u=2400,yu=2401,Su=2402;var qf=3200;var El=0,Yf=1,yi="",_n="srgb",fn="srgb-linear",Ns="linear",Et="srgb";var ga=7680;var Zf=519,$f=512,Jf=513,Kf=514,Rl=515,Qf=516,jf=517,Cl=518,ed=519,td=35044;var ku="300 es",qn=2e3,Us=2001;function zm(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function km(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Bs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function nd(){let i=Bs("canvas");return i.style.display="block",i}var ef={},Hr=null;function Vu(...i){let e="THREE."+i.shift();Hr?Hr("log",e,...i):console.log(e,...i)}function id(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function We(...i){i=id(i);let e="THREE."+i.shift();if(Hr)Hr("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function $e(...i){i=id(i);let e="THREE."+i.shift();if(Hr)Hr("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Ci(...i){let e=i.join(" ");e in ef||(ef[e]=!0,We(...i))}function rd(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}var sd={[xa]:va,[_a]:ba,[ya]:Ma,[Vr]:Sa,[va]:xa,[ba]:_a,[Ma]:ya,[Sa]:Vr},ei=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},pn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var $c=Math.PI/180,Aa=180/Math.PI;function go(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(pn[i&255]+pn[i>>8&255]+pn[i>>16&255]+pn[i>>24&255]+"-"+pn[e&255]+pn[e>>8&255]+"-"+pn[e>>16&15|64]+pn[e>>24&255]+"-"+pn[t&63|128]+pn[t>>8&255]+"-"+pn[t>>16&255]+pn[t>>24&255]+pn[n&255]+pn[n>>8&255]+pn[n>>16&255]+pn[n>>24&255]).toLowerCase()}function tt(i,e,t){return Math.max(e,Math.min(t,i))}function Vm(i,e){return(i%e+e)%e}function Jc(i,e,t){return(1-t)*i+t*e}function Cs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function En(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var qu=class qu{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(tt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(tt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};qu.prototype.isVector2=!0;var Be=qu,On=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],u=n[r+1],f=n[r+2],h=n[r+3],c=s[o+0],p=s[o+1],x=s[o+2],M=s[o+3];if(h!==M||l!==c||u!==p||f!==x){let m=l*c+u*p+f*x+h*M;m<0&&(c=-c,p=-p,x=-x,M=-M,m=-m);let g=1-a;if(m<.9995){let S=Math.acos(m),A=Math.sin(S);g=Math.sin(g*S)/A,a=Math.sin(a*S)/A,l=l*g+c*a,u=u*g+p*a,f=f*g+x*a,h=h*g+M*a}else{l=l*g+c*a,u=u*g+p*a,f=f*g+x*a,h=h*g+M*a;let S=1/Math.sqrt(l*l+u*u+f*f+h*h);l*=S,u*=S,f*=S,h*=S}}e[t]=l,e[t+1]=u,e[t+2]=f,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],u=n[r+2],f=n[r+3],h=s[o],c=s[o+1],p=s[o+2],x=s[o+3];return e[t]=a*x+f*h+l*p-u*c,e[t+1]=l*x+f*c+u*h-a*p,e[t+2]=u*x+f*p+a*c-l*h,e[t+3]=f*x-a*h-l*c-u*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,u=a(n/2),f=a(r/2),h=a(s/2),c=l(n/2),p=l(r/2),x=l(s/2);switch(o){case"XYZ":this._x=c*f*h+u*p*x,this._y=u*p*h-c*f*x,this._z=u*f*x+c*p*h,this._w=u*f*h-c*p*x;break;case"YXZ":this._x=c*f*h+u*p*x,this._y=u*p*h-c*f*x,this._z=u*f*x-c*p*h,this._w=u*f*h+c*p*x;break;case"ZXY":this._x=c*f*h-u*p*x,this._y=u*p*h+c*f*x,this._z=u*f*x+c*p*h,this._w=u*f*h-c*p*x;break;case"ZYX":this._x=c*f*h-u*p*x,this._y=u*p*h+c*f*x,this._z=u*f*x-c*p*h,this._w=u*f*h+c*p*x;break;case"YZX":this._x=c*f*h+u*p*x,this._y=u*p*h+c*f*x,this._z=u*f*x-c*p*h,this._w=u*f*h-c*p*x;break;case"XZY":this._x=c*f*h-u*p*x,this._y=u*p*h-c*f*x,this._z=u*f*x+c*p*h,this._w=u*f*h+c*p*x;break;default:We("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],u=t[2],f=t[6],h=t[10],c=n+a+h;if(c>0){let p=.5/Math.sqrt(c+1);this._w=.25/p,this._x=(f-l)*p,this._y=(s-u)*p,this._z=(o-r)*p}else if(n>a&&n>h){let p=2*Math.sqrt(1+n-a-h);this._w=(f-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+u)/p}else if(a>h){let p=2*Math.sqrt(1+a-n-h);this._w=(s-u)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+f)/p}else{let p=2*Math.sqrt(1+h-n-a);this._w=(o-r)/p,this._x=(s+u)/p,this._y=(l+f)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(tt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,u=t._z,f=t._w;return this._x=n*f+o*a+r*u-s*l,this._y=r*f+o*l+s*a-n*u,this._z=s*f+o*u+n*l-r*a,this._w=o*f-n*a-r*l-s*u,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,r=-r,s=-s,o=-o,a=-a);let l=1-t;if(a<.9995){let u=Math.acos(a),f=Math.sin(u);l=Math.sin(l*u)/f,t=Math.sin(t*u)/f,this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Yu=class Yu{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(tf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(tf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,u=2*(o*r-a*n),f=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*u+o*h-a*f,this.y=n+l*f+a*u-s*h,this.z=r+l*h+s*f-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this.z=tt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this.z=tt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(tt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Kc.copy(this).projectOnVector(e),this.sub(Kc)}reflect(e){return this.sub(Kc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(tt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Yu.prototype.isVector3=!0;var k=Yu,Kc=new k,tf=new On,Zu=class Zu{constructor(e,t,n,r,s,o,a,l,u){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,u)}set(e,t,n,r,s,o,a,l,u){let f=this.elements;return f[0]=e,f[1]=r,f[2]=a,f[3]=t,f[4]=s,f[5]=l,f[6]=n,f[7]=o,f[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],u=n[1],f=n[4],h=n[7],c=n[2],p=n[5],x=n[8],M=r[0],m=r[3],g=r[6],S=r[1],A=r[4],y=r[7],T=r[2],E=r[5],I=r[8];return s[0]=o*M+a*S+l*T,s[3]=o*m+a*A+l*E,s[6]=o*g+a*y+l*I,s[1]=u*M+f*S+h*T,s[4]=u*m+f*A+h*E,s[7]=u*g+f*y+h*I,s[2]=c*M+p*S+x*T,s[5]=c*m+p*A+x*E,s[8]=c*g+p*y+x*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],f=e[8];return t*o*f-t*a*u-n*s*f+n*a*l+r*s*u-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],f=e[8],h=f*o-a*u,c=a*l-f*s,p=u*s-o*l,x=t*h+n*c+r*p;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let M=1/x;return e[0]=h*M,e[1]=(r*u-f*n)*M,e[2]=(a*n-r*o)*M,e[3]=c*M,e[4]=(f*t-r*l)*M,e[5]=(r*s-a*t)*M,e[6]=p*M,e[7]=(n*l-u*t)*M,e[8]=(o*t-n*s)*M,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),u=Math.sin(s);return this.set(n*l,n*u,-n*(l*o+u*a)+o+e,-r*u,r*l,-r*(-u*o+l*a)+a+t,0,0,1),this}scale(e,t){return Ci("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Qc.makeScale(e,t)),this}rotate(e){return Ci("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Qc.makeRotation(-e)),this}translate(e,t){return Ci("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Qc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Zu.prototype.isMatrix3=!0;var je=Zu,Qc=new je,nf=new je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),rf=new je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Hm(){let i={enabled:!0,workingColorSpace:fn,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===Et&&(r.r=xi(r.r),r.g=xi(r.g),r.b=xi(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Et&&(r.r=kr(r.r),r.g=kr(r.g),r.b=kr(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===yi?Ns:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Ci("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Ci("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[fn]:{primaries:e,whitePoint:n,transfer:Ns,toXYZ:nf,fromXYZ:rf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:_n},outputColorSpaceConfig:{drawingBufferColorSpace:_n}},[_n]:{primaries:e,whitePoint:n,transfer:Et,toXYZ:nf,fromXYZ:rf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:_n}}}),i}var dt=Hm();function xi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function kr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var wr,Ea=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{wr===void 0&&(wr=Bs("canvas")),wr.width=e.width,wr.height=e.height;let r=wr.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=wr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Bs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=xi(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(xi(t[n]/255)*255):t[n]=xi(t[n]);return{data:t,width:e.width,height:e.height}}else return We("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Gm=0,nr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Gm++}),this.uuid=go(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(jc(r[o].image)):s.push(jc(r[o]))}else s=jc(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function jc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ea.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(We("Texture: Unable to serialize Texture."),{})}var Os=class extends nr{constructor(e=null){Ci('Source: "Source" has been renamed to "TextureSource". Please update your code to use "THREE.TextureSource" instead.'),super(e),this.isSource=!0}},Wm=0,eu=new k,Rn=class i extends ei{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Dt,r=Dt,s=nt,o=_i,a=Ge,l=on,u=i.DEFAULT_ANISOTROPY,f=yi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wm++}),this.uuid=go(),this.name="",this.source=new nr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Be(0,0),this.repeat=new Be(1,1),this.center=new Be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(eu).x}get height(){return this.source.getSize(eu).y}get depth(){return this.source.getSize(eu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){We(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){We(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Fu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case rn:e.x=e.x-Math.floor(e.x);break;case Dt:e.x=e.x<0?0:1;break;case Ta:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case rn:e.y=e.y-Math.floor(e.y);break;case Dt:e.y=e.y<0?0:1;break;case Ta:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Rn.DEFAULT_IMAGE=null;Rn.DEFAULT_MAPPING=Fu;Rn.DEFAULT_ANISOTROPY=1;var $u=class $u{constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,u=l[0],f=l[4],h=l[8],c=l[1],p=l[5],x=l[9],M=l[2],m=l[6],g=l[10];if(Math.abs(f-c)<.01&&Math.abs(h-M)<.01&&Math.abs(x-m)<.01){if(Math.abs(f+c)<.1&&Math.abs(h+M)<.1&&Math.abs(x+m)<.1&&Math.abs(u+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(u+1)/2,y=(p+1)/2,T=(g+1)/2,E=(f+c)/4,I=(h+M)/4,_=(x+m)/4;return A>y&&A>T?A<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(A),r=E/n,s=I/n):y>T?y<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),n=E/r,s=_/r):T<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(T),n=I/s,r=_/s),this.set(n,r,s,t),this}let S=Math.sqrt((m-x)*(m-x)+(h-M)*(h-M)+(c-f)*(c-f));return Math.abs(S)<.001&&(S=1),this.x=(m-x)/S,this.y=(h-M)/S,this.z=(c-f)/S,this.w=Math.acos((u+p+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=tt(this.x,e.x,t.x),this.y=tt(this.y,e.y,t.y),this.z=tt(this.z,e.z,t.z),this.w=tt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=tt(this.x,e,t),this.y=tt(this.y,e,t),this.z=tt(this.z,e,t),this.w=tt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(tt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};$u.prototype.isVector4=!0;var bt=$u,Ra=class extends ei{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:nt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t),this.textures=[];let r={width:e,height:t,depth:n.depth},s=new Rn(r),o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:nt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new nr(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Vt=class extends Ra{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ii=class extends Rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Qe,this.minFilter=Qe,this.wrapR=Dt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},zs=class extends Vt{constructor(e=1,t=1,n=1,r={}){super(e,t,r),this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new Ii(null,e,t,n),this._setTextureOptions(r),this.texture.isRenderTargetTexture=!0}},Ca=class extends Rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Qe,this.minFilter=Qe,this.wrapR=Dt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var qa=class qa{constructor(e,t,n,r,s,o,a,l,u,f,h,c,p,x,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,u,f,h,c,p,x,M,m)}set(e,t,n,r,s,o,a,l,u,f,h,c,p,x,M,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=s,g[5]=o,g[9]=a,g[13]=l,g[2]=u,g[6]=f,g[10]=h,g[14]=c,g[3]=p,g[7]=x,g[11]=M,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new qa().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Ar.setFromMatrixColumn(e,0).length(),s=1/Ar.setFromMatrixColumn(e,1).length(),o=1/Ar.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),u=Math.sin(r),f=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let c=o*f,p=o*h,x=a*f,M=a*h;t[0]=l*f,t[4]=-l*h,t[8]=u,t[1]=p+x*u,t[5]=c-M*u,t[9]=-a*l,t[2]=M-c*u,t[6]=x+p*u,t[10]=o*l}else if(e.order==="YXZ"){let c=l*f,p=l*h,x=u*f,M=u*h;t[0]=c+M*a,t[4]=x*a-p,t[8]=o*u,t[1]=o*h,t[5]=o*f,t[9]=-a,t[2]=p*a-x,t[6]=M+c*a,t[10]=o*l}else if(e.order==="ZXY"){let c=l*f,p=l*h,x=u*f,M=u*h;t[0]=c-M*a,t[4]=-o*h,t[8]=x+p*a,t[1]=p+x*a,t[5]=o*f,t[9]=M-c*a,t[2]=-o*u,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let c=o*f,p=o*h,x=a*f,M=a*h;t[0]=l*f,t[4]=x*u-p,t[8]=c*u+M,t[1]=l*h,t[5]=M*u+c,t[9]=p*u-x,t[2]=-u,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let c=o*l,p=o*u,x=a*l,M=a*u;t[0]=l*f,t[4]=M-c*h,t[8]=x*h+p,t[1]=h,t[5]=o*f,t[9]=-a*f,t[2]=-u*f,t[6]=p*h+x,t[10]=c-M*h}else if(e.order==="XZY"){let c=o*l,p=o*u,x=a*l,M=a*u;t[0]=l*f,t[4]=-h,t[8]=u*f,t[1]=c*h+M,t[5]=o*f,t[9]=p*h-x,t[2]=x*h-p,t[6]=a*f,t[10]=M*h+c}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xm,e,qm)}lookAt(e,t,n){let r=this.elements;return Pn.subVectors(e,t),Pn.lengthSq()===0&&(Pn.z=1),Pn.normalize(),Ti.crossVectors(n,Pn),Ti.lengthSq()===0&&(Math.abs(n.z)===1?Pn.x+=1e-4:Pn.z+=1e-4,Pn.normalize(),Ti.crossVectors(n,Pn)),Ti.normalize(),$o.crossVectors(Pn,Ti),r[0]=Ti.x,r[4]=$o.x,r[8]=Pn.x,r[1]=Ti.y,r[5]=$o.y,r[9]=Pn.y,r[2]=Ti.z,r[6]=$o.z,r[10]=Pn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],u=n[12],f=n[1],h=n[5],c=n[9],p=n[13],x=n[2],M=n[6],m=n[10],g=n[14],S=n[3],A=n[7],y=n[11],T=n[15],E=r[0],I=r[4],_=r[8],R=r[12],P=r[1],N=r[5],F=r[9],z=r[13],U=r[2],V=r[6],q=r[10],te=r[14],he=r[3],Q=r[7],ie=r[11],le=r[15];return s[0]=o*E+a*P+l*U+u*he,s[4]=o*I+a*N+l*V+u*Q,s[8]=o*_+a*F+l*q+u*ie,s[12]=o*R+a*z+l*te+u*le,s[1]=f*E+h*P+c*U+p*he,s[5]=f*I+h*N+c*V+p*Q,s[9]=f*_+h*F+c*q+p*ie,s[13]=f*R+h*z+c*te+p*le,s[2]=x*E+M*P+m*U+g*he,s[6]=x*I+M*N+m*V+g*Q,s[10]=x*_+M*F+m*q+g*ie,s[14]=x*R+M*z+m*te+g*le,s[3]=S*E+A*P+y*U+T*he,s[7]=S*I+A*N+y*V+T*Q,s[11]=S*_+A*F+y*q+T*ie,s[15]=S*R+A*z+y*te+T*le,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],u=e[13],f=e[2],h=e[6],c=e[10],p=e[14],x=e[3],M=e[7],m=e[11],g=e[15],S=l*p-u*c,A=a*p-u*h,y=a*c-l*h,T=o*p-u*f,E=o*c-l*f,I=o*h-a*f;return t*(M*S-m*A+g*y)-n*(x*S-m*T+g*E)+r*(x*A-M*T+g*I)-s*(x*y-M*E+m*I)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[1],o=e[5],a=e[9],l=e[2],u=e[6],f=e[10];return t*(o*f-a*u)-n*(s*f-a*l)+r*(s*u-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],f=e[8],h=e[9],c=e[10],p=e[11],x=e[12],M=e[13],m=e[14],g=e[15],S=t*a-n*o,A=t*l-r*o,y=t*u-s*o,T=n*l-r*a,E=n*u-s*a,I=r*u-s*l,_=f*M-h*x,R=f*m-c*x,P=f*g-p*x,N=h*m-c*M,F=h*g-p*M,z=c*g-p*m,U=S*z-A*F+y*N+T*P-E*R+I*_;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/U;return e[0]=(a*z-l*F+u*N)*V,e[1]=(r*F-n*z-s*N)*V,e[2]=(M*I-m*E+g*T)*V,e[3]=(c*E-h*I-p*T)*V,e[4]=(l*P-o*z-u*R)*V,e[5]=(t*z-r*P+s*R)*V,e[6]=(m*y-x*I-g*A)*V,e[7]=(f*I-c*y+p*A)*V,e[8]=(o*F-a*P+u*_)*V,e[9]=(n*P-t*F-s*_)*V,e[10]=(x*E-M*y+g*S)*V,e[11]=(h*y-f*E-p*S)*V,e[12]=(a*R-o*N-l*_)*V,e[13]=(t*N-n*R+r*_)*V,e[14]=(M*A-x*T-m*S)*V,e[15]=(f*T-h*A+c*S)*V,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,u=s*o,f=s*a;return this.set(u*o+n,u*a-r*l,u*l+r*a,0,u*a+r*l,f*a+n,f*l-r*o,0,u*l-r*a,f*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,u=s+s,f=o+o,h=a+a,c=s*u,p=s*f,x=s*h,M=o*f,m=o*h,g=a*h,S=l*u,A=l*f,y=l*h,T=n.x,E=n.y,I=n.z;return r[0]=(1-(M+g))*T,r[1]=(p+y)*T,r[2]=(x-A)*T,r[3]=0,r[4]=(p-y)*E,r[5]=(1-(c+g))*E,r[6]=(m+S)*E,r[7]=0,r[8]=(x+A)*I,r[9]=(m-S)*I,r[10]=(1-(c+M))*I,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let s=this.determinantAffine();if(s===0)return n.set(1,1,1),t.identity(),this;let o=Ar.set(r[0],r[1],r[2]).length(),a=Ar.set(r[4],r[5],r[6]).length(),l=Ar.set(r[8],r[9],r[10]).length();s<0&&(o=-o),Gn.copy(this);let u=1/o,f=1/a,h=1/l;return Gn.elements[0]*=u,Gn.elements[1]*=u,Gn.elements[2]*=u,Gn.elements[4]*=f,Gn.elements[5]*=f,Gn.elements[6]*=f,Gn.elements[8]*=h,Gn.elements[9]*=h,Gn.elements[10]*=h,t.setFromRotationMatrix(Gn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,r,s,o,a=qn,l=!1){let u=this.elements,f=2*s/(t-e),h=2*s/(n-r),c=(t+e)/(t-e),p=(n+r)/(n-r),x,M;if(l)x=s/(o-s),M=o*s/(o-s);else if(a===qn)x=-(o+s)/(o-s),M=-2*o*s/(o-s);else if(a===Us)x=-o/(o-s),M=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return u[0]=f,u[4]=0,u[8]=c,u[12]=0,u[1]=0,u[5]=h,u[9]=p,u[13]=0,u[2]=0,u[6]=0,u[10]=x,u[14]=M,u[3]=0,u[7]=0,u[11]=-1,u[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=qn,l=!1){let u=this.elements,f=2/(t-e),h=2/(n-r),c=-(t+e)/(t-e),p=-(n+r)/(n-r),x,M;if(l)x=1/(o-s),M=o/(o-s);else if(a===qn)x=-2/(o-s),M=-(o+s)/(o-s);else if(a===Us)x=-1/(o-s),M=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return u[0]=f,u[4]=0,u[8]=0,u[12]=c,u[1]=0,u[5]=h,u[9]=0,u[13]=p,u[2]=0,u[6]=0,u[10]=x,u[14]=M,u[3]=0,u[7]=0,u[11]=0,u[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};qa.prototype.isMatrix4=!0;var Ze=qa,Ar=new k,Gn=new Ze,Xm=new k(0,0,0),qm=new k(1,1,1),Ti=new k,$o=new k,Pn=new k,sf=new Ze,of=new On,vi=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],u=r[5],f=r[9],h=r[2],c=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(c,u),this._z=0);break;case"YXZ":this._x=Math.asin(-tt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(tt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-tt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(c,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(tt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,u),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(c,u),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-f,p),this._y=0);break;default:We("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return sf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(sf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return of.setFromEuler(this),this.setFromQuaternion(of,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};vi.DEFAULT_ORDER="XYZ";var ks=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Ym=0,af=new k,Er=new On,ci=new Ze,Jo=new k,Is=new k,Zm=new k,$m=new On,lf=new k(1,0,0),cf=new k(0,1,0),uf=new k(0,0,1),hf={type:"added"},Jm={type:"removed"},Rr={type:"childadded",child:null},tu={type:"childremoved",child:null},zn=class i extends ei{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ym++}),this.uuid=go(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new k,t=new vi,n=new On,r=new k(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ze},normalMatrix:{value:new je}}),this.matrix=new Ze,this.matrixWorld=new Ze,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ks,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Er.setFromAxisAngle(e,t),this.quaternion.multiply(Er),this}rotateOnWorldAxis(e,t){return Er.setFromAxisAngle(e,t),this.quaternion.premultiply(Er),this}rotateX(e){return this.rotateOnAxis(lf,e)}rotateY(e){return this.rotateOnAxis(cf,e)}rotateZ(e){return this.rotateOnAxis(uf,e)}translateOnAxis(e,t){return af.copy(e).applyQuaternion(this.quaternion),this.position.add(af.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(lf,e)}translateY(e){return this.translateOnAxis(cf,e)}translateZ(e){return this.translateOnAxis(uf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ci.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Jo.copy(e):Jo.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Is.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ci.lookAt(Is,Jo,this.up):ci.lookAt(Jo,Is,this.up),this.quaternion.setFromRotationMatrix(ci),r&&(ci.extractRotation(r.matrixWorld),Er.setFromRotationMatrix(ci),this.quaternion.premultiply(Er.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?($e("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(hf),Rr.child=e,this.dispatchEvent(Rr),Rr.child=null):$e("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Jm),tu.child=e,this.dispatchEvent(tu),tu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ci.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ci.multiply(e.parent.matrixWorld)),e.applyMatrix4(ci),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(hf),Rr.child=e,this.dispatchEvent(Rr),Rr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Is,e,Zm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Is,$m,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*n-s[8]*r,s[13]+=n-s[1]*t-s[5]*n-s[9]*r,s[14]+=r-s[2]*t-s[6]*n-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let u=0,f=l.length;u<f;u++){let h=l[u];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,u=this.material.length;l<u;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),u=o(e.textures),f=o(e.images),h=o(e.shapes),c=o(e.skeletons),p=o(e.animations),x=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),u.length>0&&(n.textures=u),f.length>0&&(n.images=f),h.length>0&&(n.shapes=h),c.length>0&&(n.skeletons=c),p.length>0&&(n.animations=p),x.length>0&&(n.nodes=x)}return n.object=r,n;function o(a){let l=[];for(let u in a){let f=a[u];delete f.metadata,l.push(f)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};zn.DEFAULT_UP=new k(0,1,0);zn.DEFAULT_MATRIX_AUTO_UPDATE=!0;zn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var gi=class extends zn{constructor(){super(),this.isGroup=!0,this.type="Group"}},Km={type:"move"},Gr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(let M of e.hand.values()){let m=t.getJointPose(M,n),g=this._getHandJoint(u,M);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let f=u.joints["index-finger-tip"],h=u.joints["thumb-tip"],c=f.position.distanceTo(h.position),p=.02,x=.005;u.inputState.pinching&&c>p+x?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&c<=p-x&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Km)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new gi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},od={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},wi={h:0,s:0,l:0},Ko={h:0,s:0,l:0};function nu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Je=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=_n){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,dt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=dt.workingColorSpace){if(e=Vm(e,1),t=tt(t,0,1),n=tt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=nu(o,s,e+1/3),this.g=nu(o,s,e),this.b=nu(o,s,e-1/3)}return dt.colorSpaceToWorking(this,r),this}setStyle(e,t=_n){function n(s){s!==void 0&&parseFloat(s)<1&&We("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:We("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);We("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=_n){let n=od[e.toLowerCase()];return n!==void 0?this.setHex(n,t):We("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=kr(e.r),this.g=kr(e.g),this.b=kr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=_n){return dt.workingToColorSpace(mn.copy(this),e),Math.round(tt(mn.r*255,0,255))*65536+Math.round(tt(mn.g*255,0,255))*256+Math.round(tt(mn.b*255,0,255))}getHexString(e=_n){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.workingToColorSpace(mn.copy(this),t);let n=mn.r,r=mn.g,s=mn.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,u,f=(a+o)/2;if(a===o)l=0,u=0;else{let h=o-a;switch(u=f<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=u,e.l=f,e}getRGB(e,t=dt.workingColorSpace){return dt.workingToColorSpace(mn.copy(this),t),e.r=mn.r,e.g=mn.g,e.b=mn.b,e}getStyle(e=_n){dt.workingToColorSpace(mn.copy(this),e);let t=mn.r,n=mn.g,r=mn.b;return e!==_n?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(wi),this.setHSL(wi.h+e,wi.s+t,wi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(wi),e.getHSL(Ko);let n=Jc(wi.h,Ko.h,t),r=Jc(wi.s,Ko.s,t),s=Jc(wi.l,Ko.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},mn=new Je;Je.NAMES=od;var ir=class extends zn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vi,this.environmentIntensity=1,this.environmentRotation=new vi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Wn=new k,ui=new k,iu=new k,hi=new k,Cr=new k,Ir=new k,ff=new k,ru=new k,su=new k,ou=new k,au=new bt,lu=new bt,cu=new bt,gn=class i{constructor(e=new k,t=new k,n=new k){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Wn.subVectors(e,t),r.cross(Wn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Wn.subVectors(r,t),ui.subVectors(n,t),iu.subVectors(e,t);let o=Wn.dot(Wn),a=Wn.dot(ui),l=Wn.dot(iu),u=ui.dot(ui),f=ui.dot(iu),h=o*u-a*a;if(h===0)return s.set(0,0,0),null;let c=1/h,p=(u*l-a*f)*c,x=(o*f-a*l)*c;return s.set(1-p-x,x,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,hi)===null?!1:hi.x>=0&&hi.y>=0&&hi.x+hi.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,hi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,hi.x),l.addScaledVector(o,hi.y),l.addScaledVector(a,hi.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return au.setScalar(0),lu.setScalar(0),cu.setScalar(0),au.fromBufferAttribute(e,t),lu.fromBufferAttribute(e,n),cu.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(au,s.x),o.addScaledVector(lu,s.y),o.addScaledVector(cu,s.z),o}static isFrontFacing(e,t,n,r){return Wn.subVectors(n,t),ui.subVectors(e,t),Wn.cross(ui).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wn.subVectors(this.c,this.b),ui.subVectors(this.a,this.b),Wn.cross(ui).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;Cr.subVectors(r,n),Ir.subVectors(s,n),ru.subVectors(e,n);let l=Cr.dot(ru),u=Ir.dot(ru);if(l<=0&&u<=0)return t.copy(n);su.subVectors(e,r);let f=Cr.dot(su),h=Ir.dot(su);if(f>=0&&h<=f)return t.copy(r);let c=l*h-f*u;if(c<=0&&l>=0&&f<=0)return o=l/(l-f),t.copy(n).addScaledVector(Cr,o);ou.subVectors(e,s);let p=Cr.dot(ou),x=Ir.dot(ou);if(x>=0&&p<=x)return t.copy(s);let M=p*u-l*x;if(M<=0&&u>=0&&x<=0)return a=u/(u-x),t.copy(n).addScaledVector(Ir,a);let m=f*x-p*h;if(m<=0&&h-f>=0&&p-x>=0)return ff.subVectors(s,r),a=(h-f)/(h-f+(p-x)),t.copy(r).addScaledVector(ff,a);let g=1/(m+M+c);return o=M*g,a=c*g,t.copy(n).addScaledVector(Cr,o).addScaledVector(Ir,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},kt=class{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Xn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Xn):Xn.fromBufferAttribute(s,o),Xn.applyMatrix4(e.matrixWorld),this.expandByPoint(Xn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Qo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Qo.copy(n.boundingBox)),Qo.applyMatrix4(e.matrixWorld),this.union(Qo)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Xn),Xn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ps),jo.subVectors(this.max,Ps),Pr.subVectors(e.a,Ps),Dr.subVectors(e.b,Ps),Lr.subVectors(e.c,Ps),Ai.subVectors(Dr,Pr),Ei.subVectors(Lr,Dr),Qi.subVectors(Pr,Lr);let t=[0,-Ai.z,Ai.y,0,-Ei.z,Ei.y,0,-Qi.z,Qi.y,Ai.z,0,-Ai.x,Ei.z,0,-Ei.x,Qi.z,0,-Qi.x,-Ai.y,Ai.x,0,-Ei.y,Ei.x,0,-Qi.y,Qi.x,0];return!uu(t,Pr,Dr,Lr,jo)||(t=[1,0,0,0,1,0,0,0,1],!uu(t,Pr,Dr,Lr,jo))?!1:(ea.crossVectors(Ai,Ei),t=[ea.x,ea.y,ea.z],uu(t,Pr,Dr,Lr,jo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(fi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),fi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),fi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),fi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),fi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),fi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),fi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),fi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(fi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},fi=[new k,new k,new k,new k,new k,new k,new k,new k],Xn=new k,Qo=new kt,Pr=new k,Dr=new k,Lr=new k,Ai=new k,Ei=new k,Qi=new k,Ps=new k,jo=new k,ea=new k,ji=new k;function uu(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){ji.fromArray(i,s);let a=r.x*Math.abs(ji.x)+r.y*Math.abs(ji.y)+r.z*Math.abs(ji.z),l=e.dot(ji),u=t.dot(ji),f=n.dot(ji);if(Math.max(-Math.max(l,u,f),Math.min(l,u,f))>a)return!1}return!0}var mi=Qm();function Qm(){let i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),r=new Uint32Array(512);for(let l=0;l<256;++l){let u=l-127;u<-27?(n[l]=0,n[l|256]=32768,r[l]=24,r[l|256]=24):u<-14?(n[l]=1024>>-u-14,n[l|256]=1024>>-u-14|32768,r[l]=-u-1,r[l|256]=-u-1):u<=15?(n[l]=u+15<<10,n[l|256]=u+15<<10|32768,r[l]=13,r[l|256]=13):u<128?(n[l]=31744,n[l|256]=64512,r[l]=24,r[l|256]=24):(n[l]=31744,n[l|256]=64512,r[l]=13,r[l|256]=13)}let s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let u=l<<13,f=0;for(;(u&8388608)===0;)u<<=1,f-=8388608;u&=-8388609,f+=947912704,s[l]=u|f}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:r,mantissaTable:s,exponentTable:o,offsetTable:a}}function jm(i){Math.abs(i)>65504&&We("DataUtils.toHalfFloat(): Value out of range."),i=tt(i,-65504,65504),mi.floatView[0]=i;let e=mi.uint32View[0],t=e>>23&511;return mi.baseTable[t]+((e&8388607)>>mi.shiftTable[t])}function eg(i){let e=i>>10;return mi.uint32View[0]=mi.mantissaTable[mi.offsetTable[e]+(i&1023)]+mi.exponentTable[e],mi.floatView[0]}var vt=class{static toHalfFloat(e){return jm(e)}static fromHalfFloat(e){return eg(e)}},Yt=new k,ta=new Be,tg=0,xt=class extends ei{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:tg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=td,this.updateRanges=[],this.gpuType=et,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ta.fromBufferAttribute(this,t),ta.applyMatrix3(e),this.setXY(t,ta.x,ta.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.applyMatrix3(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.applyMatrix4(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.applyNormalMatrix(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.transformDirection(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Cs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=En(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Cs(t,this.array)),t}setX(e,t){return this.normalized&&(t=En(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Cs(t,this.array)),t}setY(e,t){return this.normalized&&(t=En(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Cs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=En(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Cs(t,this.array)),t}setW(e,t){return this.normalized&&(t=En(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=En(t,this.array),n=En(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=En(t,this.array),n=En(n,this.array),r=En(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=En(t,this.array),n=En(n,this.array),r=En(r,this.array),s=En(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Vs=class extends xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Hs=class extends xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Xt=class extends xt{constructor(e,t,n){super(new Float32Array(e),t,n)}},ng=new kt,Ds=new k,hu=new k,Wr=class{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):ng.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ds.subVectors(e,this.center);let t=Ds.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Ds,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(hu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ds.copy(e.center).add(hu)),this.expandByPoint(Ds.copy(e.center).sub(hu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},ig=0,Bn=new Ze,fu=new zn,Fr=new k,Dn=new kt,Ls=new kt,tn=new k,Lt=class i extends ei{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ig++}),this.uuid=go(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(zm(e)?Hs:Vs)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new je().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Bn.makeRotationFromQuaternion(e),this.applyMatrix4(Bn),this}rotateX(e){return Bn.makeRotationX(e),this.applyMatrix4(Bn),this}rotateY(e){return Bn.makeRotationY(e),this.applyMatrix4(Bn),this}rotateZ(e){return Bn.makeRotationZ(e),this.applyMatrix4(Bn),this}translate(e,t,n){return Bn.makeTranslation(e,t,n),this.applyMatrix4(Bn),this}scale(e,t,n){return Bn.makeScale(e,t,n),this.applyMatrix4(Bn),this}lookAt(e){return fu.lookAt(e),fu.updateMatrix(),this.applyMatrix4(fu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fr).negate(),this.translate(Fr.x,Fr.y,Fr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Xt(n,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&We("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new kt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){$e("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];Dn.setFromBufferAttribute(s),this.morphTargetsRelative?(tn.addVectors(this.boundingBox.min,Dn.min),this.boundingBox.expandByPoint(tn),tn.addVectors(this.boundingBox.max,Dn.max),this.boundingBox.expandByPoint(tn)):(this.boundingBox.expandByPoint(Dn.min),this.boundingBox.expandByPoint(Dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&$e('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){$e("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){let n=this.boundingSphere.center;if(Dn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Ls.setFromBufferAttribute(a),this.morphTargetsRelative?(tn.addVectors(Dn.min,Ls.min),Dn.expandByPoint(tn),tn.addVectors(Dn.max,Ls.max),Dn.expandByPoint(tn)):(Dn.expandByPoint(Ls.min),Dn.expandByPoint(Ls.max))}Dn.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)tn.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(tn));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let u=0,f=a.count;u<f;u++)tn.fromBufferAttribute(a,u),l&&(Fr.fromBufferAttribute(e,u),tn.add(Fr)),r=Math.max(r,n.distanceToSquared(tn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&$e('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){$e("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,r=t.normal,s=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new xt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<n.count;_++)a[_]=new k,l[_]=new k;let u=new k,f=new k,h=new k,c=new Be,p=new Be,x=new Be,M=new k,m=new k;function g(_,R,P){u.fromBufferAttribute(n,_),f.fromBufferAttribute(n,R),h.fromBufferAttribute(n,P),c.fromBufferAttribute(s,_),p.fromBufferAttribute(s,R),x.fromBufferAttribute(s,P),f.sub(u),h.sub(u),p.sub(c),x.sub(c);let N=1/(p.x*x.y-x.x*p.y);isFinite(N)&&(M.copy(f).multiplyScalar(x.y).addScaledVector(h,-p.y).multiplyScalar(N),m.copy(h).multiplyScalar(p.x).addScaledVector(f,-x.x).multiplyScalar(N),a[_].add(M),a[R].add(M),a[P].add(M),l[_].add(m),l[R].add(m),l[P].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let _=0,R=S.length;_<R;++_){let P=S[_],N=P.start,F=P.count;for(let z=N,U=N+F;z<U;z+=3)g(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let A=new k,y=new k,T=new k,E=new k;function I(_){T.fromBufferAttribute(r,_),E.copy(T);let R=a[_];A.copy(R),A.sub(T.multiplyScalar(T.dot(R))).normalize(),y.crossVectors(E,R);let N=y.dot(l[_])<0?-1:1;o.setXYZW(_,A.x,A.y,A.z,N)}for(let _=0,R=S.length;_<R;++_){let P=S[_],N=P.start,F=P.count;for(let z=N,U=N+F;z<U;z+=3)I(e.getX(z+0)),I(e.getX(z+1)),I(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let c=0,p=n.count;c<p;c++)n.setXYZ(c,0,0,0);let r=new k,s=new k,o=new k,a=new k,l=new k,u=new k,f=new k,h=new k;if(e)for(let c=0,p=e.count;c<p;c+=3){let x=e.getX(c+0),M=e.getX(c+1),m=e.getX(c+2);r.fromBufferAttribute(t,x),s.fromBufferAttribute(t,M),o.fromBufferAttribute(t,m),f.subVectors(o,s),h.subVectors(r,s),f.cross(h),a.fromBufferAttribute(n,x),l.fromBufferAttribute(n,M),u.fromBufferAttribute(n,m),a.add(f),l.add(f),u.add(f),n.setXYZ(x,a.x,a.y,a.z),n.setXYZ(M,l.x,l.y,l.z),n.setXYZ(m,u.x,u.y,u.z)}else for(let c=0,p=t.count;c<p;c+=3)r.fromBufferAttribute(t,c+0),s.fromBufferAttribute(t,c+1),o.fromBufferAttribute(t,c+2),f.subVectors(o,s),h.subVectors(r,s),f.cross(h),n.setXYZ(c+0,f.x,f.y,f.z),n.setXYZ(c+1,f.x,f.y,f.z),n.setXYZ(c+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)tn.fromBufferAttribute(e,t),tn.normalize(),e.setXYZ(t,tn.x,tn.y,tn.z)}toNonIndexed(){function e(a,l){let u=a.array,f=a.itemSize,h=a.normalized,c=new u.constructor(l.length*f),p=0,x=0;for(let M=0,m=l.length;M<m;M++){a.isInterleavedBufferAttribute?p=l[M]*a.data.stride+a.offset:p=l[M]*f;for(let g=0;g<f;g++)c[x++]=u[p++]}return new xt(c,f,h)}if(this.index===null)return We("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],u=e(l,n);t.setAttribute(a,u)}let s=this.morphAttributes;for(let a in s){let l=[],u=s[a];for(let f=0,h=u.length;f<h;f++){let c=u[f],p=e(c,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let u=o[a];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let u=n[l];e.data.attributes[l]=u.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let u=this.morphAttributes[l],f=[];for(let h=0,c=u.length;h<c;h++){let p=u[h];f.push(p.toJSON(e.data))}f.length>0&&(r[l]=f,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let u in r){let f=r[u];this.setAttribute(u,f.clone(t))}let s=e.morphAttributes;for(let u in s){let f=[],h=s[u];for(let c=0,p=h.length;c<p;c++)f.push(h[c].clone(t));this.morphAttributes[u]=f}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let u=0,f=o.length;u<f;u++){let h=o[u];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var du=new k,rg=new k,sg=new je,yn=class{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=du.subVectors(n,t).cross(rg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(du),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/s;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(r,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||sg.getNormalMatrix(e),r=this.coplanarPoint(du).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},og=0,Pi=class extends ei{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:og++}),this.uuid=go(),this.name="",this.type="Material",this.blending=ti,this.side=bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Cu,this.blendDst=Iu,this.blendEquation=lr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Je(0,0,0),this.blendAlpha=0,this.depthFunc=Vr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Zf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ga,this.stencilZFail=ga,this.stencilZPass=ga,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){We(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){We(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Je().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new yn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Be().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Be().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var di=new k,pu=new k,na=new k,ia=new k,Xr=class{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,di)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=di.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(di.copy(this.origin).addScaledVector(this.direction,t),di.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){pu.copy(e).add(t).multiplyScalar(.5),na.copy(t).sub(e).normalize(),ia.copy(this.origin).sub(pu);let s=e.distanceTo(t)*.5,o=-this.direction.dot(na),a=ia.dot(this.direction),l=-ia.dot(na),u=ia.lengthSq(),f=Math.abs(1-o*o),h,c,p,x;if(f>0)if(h=o*l-a,c=o*a-l,x=s*f,h>=0)if(c>=-x)if(c<=x){let M=1/f;h*=M,c*=M,p=h*(h+o*c+2*a)+c*(o*h+c+2*l)+u}else c=s,h=Math.max(0,-(o*c+a)),p=-h*h+c*(c+2*l)+u;else c=-s,h=Math.max(0,-(o*c+a)),p=-h*h+c*(c+2*l)+u;else c<=-x?(h=Math.max(0,-(-o*s+a)),c=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+c*(c+2*l)+u):c<=x?(h=0,c=Math.min(Math.max(-s,-l),s),p=c*(c+2*l)+u):(h=Math.max(0,-(o*s+a)),c=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+c*(c+2*l)+u);else c=o>0?-s:s,h=Math.max(0,-(o*c+a)),p=-h*h+c*(c+2*l)+u;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(pu).addScaledVector(na,c),p}intersectSphere(e,t){if(e.radius<0)return null;di.subVectors(e.center,this.origin);let n=di.dot(this.direction),r=di.dot(di)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,u=1/this.direction.x,f=1/this.direction.y,h=1/this.direction.z,c=this.origin;return u>=0?(n=(e.min.x-c.x)*u,r=(e.max.x-c.x)*u):(n=(e.max.x-c.x)*u,r=(e.min.x-c.x)*u),f>=0?(s=(e.min.y-c.y)*f,o=(e.max.y-c.y)*f):(s=(e.max.y-c.y)*f,o=(e.min.y-c.y)*f),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-c.z)*h,l=(e.max.z-c.z)*h):(a=(e.max.z-c.z)*h,l=(e.min.z-c.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,di)!==null}intersectTriangle(e,t,n,r,s){let o=this.origin,a=this.direction,l=a.x,u=a.y,f=a.z,h=e.x-o.x,c=e.y-o.y,p=e.z-o.z,x=t.x-o.x,M=t.y-o.y,m=t.z-o.z,g=n.x-o.x,S=n.y-o.y,A=n.z-o.z,y=Math.abs(l),T=Math.abs(u),E=Math.abs(f),I,_,R,P,N,F,z,U,V,q,te,he;if(y>=T&&y>=E?(R=l,F=h,V=x,he=g,l>=0?(I=u,_=f,P=c,N=p,z=M,U=m,q=S,te=A):(I=f,_=u,P=p,N=c,z=m,U=M,q=A,te=S)):T>=E?(R=u,F=c,V=M,he=S,u>=0?(I=f,_=l,P=p,N=h,z=m,U=x,q=A,te=g):(I=l,_=f,P=h,N=p,z=x,U=m,q=g,te=A)):(R=f,F=p,V=m,he=A,f>=0?(I=l,_=u,P=h,N=c,z=x,U=M,q=g,te=S):(I=u,_=l,P=c,N=h,z=M,U=x,q=S,te=g)),R===0)return null;let Q=I/R,ie=_/R,le=1/R,Re=P-Q*F,ye=N-ie*F,ut=z-Q*V,Xe=U-ie*V,rt=q-Q*he,J=te-ie*he,ce=rt*Xe-J*ut,Ee=Re*J-ye*rt,Ye=ut*ye-Xe*Re;if(r){if(ce<0||Ee<0||Ye<0)return null}else if((ce<0||Ee<0||Ye<0)&&(ce>0||Ee>0||Ye>0))return null;let Ie=ce+Ee+Ye;if(Ie===0)return null;let Ke=le*(ce*F+Ee*V+Ye*he);return(Ie>0?Ke<0:Ke>0)?null:this.at(Ke/Ie,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rr=class extends Pi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.combine=Pu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},df=new Ze,er=new Xr,ra=new Wr,pf=new k,sa=new k,oa=new k,aa=new k,mu=new k,la=new k,mf=new k,ca=new k,sn=class extends zn{constructor(e=new Lt,t=new rr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){la.set(0,0,0);for(let l=0,u=s.length;l<u;l++){let f=a[l],h=s[l];f!==0&&(mu.fromBufferAttribute(h,e),o?la.addScaledVector(mu,f):la.addScaledVector(mu.sub(t),f))}t.add(la)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ra.copy(n.boundingSphere),ra.applyMatrix4(s),er.copy(e.ray).recast(e.near),!(ra.containsPoint(er.origin)===!1&&(er.intersectSphere(ra,pf)===null||er.origin.distanceToSquared(pf)>(e.far-e.near)**2))&&(df.copy(s).invert(),er.copy(e.ray).applyMatrix4(df),!(n.boundingBox!==null&&er.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,er)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,u=s.attributes.uv,f=s.attributes.uv1,h=s.attributes.normal,c=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let x=0,M=c.length;x<M;x++){let m=c[x],g=o[m.materialIndex],S=Math.max(m.start,p.start),A=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=S,T=A;y<T;y+=3){let E=a.getX(y),I=a.getX(y+1),_=a.getX(y+2);r=ua(this,g,e,n,u,f,h,E,I,_),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let x=Math.max(0,p.start),M=Math.min(a.count,p.start+p.count);for(let m=x,g=M;m<g;m+=3){let S=a.getX(m),A=a.getX(m+1),y=a.getX(m+2);r=ua(this,o,e,n,u,f,h,S,A,y),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let x=0,M=c.length;x<M;x++){let m=c[x],g=o[m.materialIndex],S=Math.max(m.start,p.start),A=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=S,T=A;y<T;y+=3){let E=y,I=y+1,_=y+2;r=ua(this,g,e,n,u,f,h,E,I,_),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let x=Math.max(0,p.start),M=Math.min(l.count,p.start+p.count);for(let m=x,g=M;m<g;m+=3){let S=m,A=m+1,y=m+2;r=ua(this,o,e,n,u,f,h,S,A,y),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function ag(i,e,t,n,r,s,o,a){let l;if(e.side===$t?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===bn,a),l===null)return null;ca.copy(a),ca.applyMatrix4(i.matrixWorld);let u=t.ray.origin.distanceTo(ca);return u<t.near||u>t.far?null:{distance:u,point:ca.clone(),object:i}}function ua(i,e,t,n,r,s,o,a,l,u){i.getVertexPosition(a,sa),i.getVertexPosition(l,oa),i.getVertexPosition(u,aa);let f=ag(i,e,t,n,sa,oa,aa,mf);if(f){let h=new k;gn.getBarycoord(mf,sa,oa,aa,h),r&&(f.uv=gn.getInterpolatedAttribute(r,a,l,u,h,new Be)),s&&(f.uv1=gn.getInterpolatedAttribute(s,a,l,u,h,new Be)),o&&(f.normal=gn.getInterpolatedAttribute(o,a,l,u,h,new k),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));let c={a,b:l,c:u,normal:new k,materialIndex:0};gn.getNormal(sa,oa,aa,c.normal),f.face=c,f.barycoord=h}return f}var It=class extends Rn{constructor(e=null,t=1,n=1,r,s,o,a,l,u=Qe,f=Qe,h,c){super(null,o,a,l,u,f,r,s,h,c),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var tr=new Wr,lg=new Be(.5,.5),ha=new k,Gs=class{constructor(e=new yn,t=new yn,n=new yn,r=new yn,s=new yn,o=new yn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=qn,n=!1){let r=this.planes,s=e.elements,o=s[0],a=s[1],l=s[2],u=s[3],f=s[4],h=s[5],c=s[6],p=s[7],x=s[8],M=s[9],m=s[10],g=s[11],S=s[12],A=s[13],y=s[14],T=s[15];if(r[0].setComponents(u-o,p-f,g-x,T-S).normalize(),r[1].setComponents(u+o,p+f,g+x,T+S).normalize(),r[2].setComponents(u+a,p+h,g+M,T+A).normalize(),r[3].setComponents(u-a,p-h,g-M,T-A).normalize(),n)r[4].setComponents(l,c,m,y).normalize(),r[5].setComponents(u-l,p-c,g-m,T-y).normalize();else if(r[4].setComponents(u-l,p-c,g-m,T-y).normalize(),t===qn)r[5].setComponents(u+l,p+c,g+m,T+y).normalize();else if(t===Us)r[5].setComponents(l,c,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),tr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),tr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(tr)}intersectsSprite(e){tr.center.set(0,0,0);let t=lg.distanceTo(e.center);return tr.radius=.7071067811865476+t,tr.applyMatrix4(e.matrixWorld),this.intersectsSphere(tr)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ha.x=r.normal.x>0?e.max.x:e.min.x,ha.y=r.normal.y>0?e.max.y:e.min.y,ha.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ha)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Ws=class extends Rn{constructor(e=[],t=Ui,n,r,s,o,a,l,u,f){super(e,t,n,r,s,o,a,l,u,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Di=class extends Rn{constructor(e,t,n=an,r,s,o,a=Qe,l=Qe,u,f=jn,h=1){if(f!==jn&&f!==zi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let c={width:e,height:t,depth:h};super(c,r,s,o,a,l,f,n,u),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new nr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ia=class extends Di{constructor(e,t=an,n=Ui,r,s,o=Qe,a=Qe,l,u=jn){let f={width:e,height:e,depth:1},h=[f,f,f,f,f,f];super(e,e,t,n,r,s,o,a,l,u),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Xs=class extends Rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},qr=class i extends Lt{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],u=[],f=[],h=[],c=0,p=0;x("z","y","x",-1,-1,n,t,e,o,s,0),x("z","y","x",1,-1,n,t,-e,o,s,1),x("x","z","y",1,1,e,n,t,r,o,2),x("x","z","y",1,-1,e,n,-t,r,o,3),x("x","y","z",1,-1,e,t,n,r,s,4),x("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Xt(u,3)),this.setAttribute("normal",new Xt(f,3)),this.setAttribute("uv",new Xt(h,2));function x(M,m,g,S,A,y,T,E,I,_,R){let P=y/I,N=T/_,F=y/2,z=T/2,U=E/2,V=I+1,q=_+1,te=0,he=0,Q=new k;for(let ie=0;ie<q;ie++){let le=ie*N-z;for(let Re=0;Re<V;Re++){let ye=Re*P-F;Q[M]=ye*S,Q[m]=le*A,Q[g]=U,u.push(Q.x,Q.y,Q.z),Q[M]=0,Q[m]=0,Q[g]=E>0?1:-1,f.push(Q.x,Q.y,Q.z),h.push(Re/I),h.push(1-ie/_),te+=1}}for(let ie=0;ie<_;ie++)for(let le=0;le<I;le++){let Re=c+le+V*ie,ye=c+le+V*(ie+1),ut=c+(le+1)+V*(ie+1),Xe=c+(le+1)+V*ie;l.push(Re,ye,Xe),l.push(ye,ut,Xe),he+=6}a.addGroup(p,he,R),p+=he,c+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var qs=class i extends Lt{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],u=new k,f=new Be;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,c=3;h<=t;h++,c+=3){let p=n+h/t*r;u.x=e*Math.cos(p),u.y=e*Math.sin(p),o.push(u.x,u.y,u.z),a.push(0,0,1),f.x=(o[c]/e+1)/2,f.y=(o[c+1]/e+1)/2,l.push(f.x,f.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Xt(o,3)),this.setAttribute("normal",new Xt(a,3)),this.setAttribute("uv",new Xt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var Ys=class i extends Lt{constructor(e=[new Be(0,-.5),new Be(.5,0),new Be(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=tt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],u=[],f=1/t,h=new k,c=new Be,p=new k,x=new k,M=new k,m=0,g=0;for(let S=0;S<=e.length-1;S++)switch(S){case 0:m=e[S+1].x-e[S].x,g=e[S+1].y-e[S].y,p.x=g*1,p.y=-m,p.z=g*0,M.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(M.x,M.y,M.z);break;default:m=e[S+1].x-e[S].x,g=e[S+1].y-e[S].y,p.x=g*1,p.y=-m,p.z=g*0,x.copy(p),p.x+=M.x,p.y+=M.y,p.z+=M.z,p.normalize(),l.push(p.x,p.y,p.z),M.copy(x)}for(let S=0;S<=t;S++){let A=n+S*f*r,y=Math.sin(A),T=Math.cos(A);for(let E=0;E<=e.length-1;E++){h.x=e[E].x*y,h.y=e[E].y,h.z=e[E].x*T,o.push(h.x,h.y,h.z),c.x=S/t,c.y=E/(e.length-1),a.push(c.x,c.y);let I=l[3*E+0]*y,_=l[3*E+1],R=l[3*E+0]*T;u.push(I,_,R)}}for(let S=0;S<t;S++)for(let A=0;A<e.length-1;A++){let y=A+S*e.length,T=y,E=y+e.length,I=y+e.length+1,_=y+1;s.push(T,E,_),s.push(I,_,E)}this.setIndex(s),this.setAttribute("position",new Xt(o,3)),this.setAttribute("uv",new Xt(a,2)),this.setAttribute("normal",new Xt(u,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var sr=class i extends Lt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),u=a+1,f=l+1,h=e/a,c=t/l,p=[],x=[],M=[],m=[];for(let g=0;g<f;g++){let S=g*c-o;for(let A=0;A<u;A++){let y=A*h-s;x.push(y,-S,0),M.push(0,0,1),m.push(A/a),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let S=0;S<a;S++){let A=S+u*g,y=S+u*(g+1),T=S+1+u*(g+1),E=S+1+u*g;p.push(A,y,E),p.push(y,T,E)}this.setIndex(p),this.setAttribute("position",new Xt(x,3)),this.setAttribute("normal",new Xt(M,3)),this.setAttribute("uv",new Xt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};function ur(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];if(gf(r))r.isRenderTargetTexture?(We("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone();else if(Array.isArray(r))if(gf(r[0])){let s=[];for(let o=0,a=r.length;o<a;o++)s[o]=r[o].clone();e[t][n]=s}else e[t][n]=r.slice();else e[t][n]=r}}return e}function vn(i){let e={};for(let t=0;t<i.length;t++){let n=ur(i[t]);for(let r in n)e[r]=n[r]}return e}function gf(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function cg(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Hu(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:dt.workingColorSpace}var ad={clone:ur,merge:vn},ug=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,qt=class extends Pi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ug,this.fragmentShader=hg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ur(e.uniforms),this.uniformsGroups=cg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case"t":this.uniforms[n].value=t[r.value]||null;break;case"c":this.uniforms[n].value=new Je().setHex(r.value);break;case"v2":this.uniforms[n].value=new Be().fromArray(r.value);break;case"v3":this.uniforms[n].value=new k().fromArray(r.value);break;case"v4":this.uniforms[n].value=new bt().fromArray(r.value);break;case"m3":this.uniforms[n].value=new je().fromArray(r.value);break;case"m4":this.uniforms[n].value=new Ze().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Pa=class extends qt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Yr=class extends Pi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Je(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Je(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=El,this.normalScale=new Be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Zs=class extends Yr{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Be(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Je(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Je(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Je(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Da=class extends Pi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=qf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},La=class extends Pi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Nr(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function gu(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Li=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Fa=class extends Li{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:_u,endingEnd:_u}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case yu:s=e,a=2*t-n;break;case Su:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case yu:o=e,l=2*n-t;break;case Su:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let u=(n-t)*.5,f=this.valueSize;this._weightPrev=u/(t-a),this._weightNext=u/(l-n),this._offsetPrev=s*f,this._offsetNext=o*f}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,f=this._offsetPrev,h=this._offsetNext,c=this._weightPrev,p=this._weightNext,x=(n-t)/(r-t),M=x*x,m=M*x,g=-c*m+2*c*M-c*x,S=(1+c)*m+(-1.5-2*c)*M+(-.5+c)*x+1,A=(-1-p)*m+(1.5+p)*M+.5*x,y=p*m-p*M;for(let T=0;T!==a;++T)s[T]=g*o[f+T]+S*o[u+T]+A*o[l+T]+y*o[h+T];return s}},Na=class extends Li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,f=(n-t)/(r-t),h=1-f;for(let c=0;c!==a;++c)s[c]=o[u+c]*h+o[l+c]*f;return s}},Ua=class extends Li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ba=class extends Li{interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,f=this.inTangents,h=this.outTangents;if(!f||!h){let x=(n-t)/(r-t),M=1-x;for(let m=0;m!==a;++m)s[m]=o[u+m]*M+o[l+m]*x;return s}let c=a*2,p=e-1;for(let x=0;x!==a;++x){let M=o[u+x],m=o[l+x],g=p*c+x*2,S=h[g],A=h[g+1],y=e*c+x*2,T=f[y],E=f[y+1],I=dg(n,t,S,T,r);s[x]=ld(I,M,A,E,m)}return s}};function ld(i,e,t,n,r){let s=1-i;return s*s*s*e+3*s*s*i*t+3*s*i*i*n+i*i*i*r}function fg(i,e,t,n,r){let s=1-i;return 3*s*s*(t-e)+6*s*i*(n-t)+3*i*i*(r-n)}function dg(i,e,t,n,r){let s=(i-e)/(r-e);for(let o=0;o<8;o++){let a=ld(s,e,t,n,r)-i;if(Math.abs(a)<1e-10)break;let l=fg(s,e,t,n,r);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}var Ln=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Nr(t,this.TimeBufferType),this.values=Nr(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Nr(e.times,Array),values:Nr(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r),gu(e.settings)&&(n.settings={inTangents:Nr(e.settings.inTangents,Array),outTangents:Nr(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ua(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Na(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ba(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Fs:t=this.InterpolantFactoryMethodDiscrete;break;case wa:t=this.InterpolantFactoryMethodLinear;break;case ma:t=this.InterpolantFactoryMethodSmooth;break;case vu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return We("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Fs;case this.InterpolantFactoryMethodLinear:return wa;case this.InterpolantFactoryMethodSmooth:return ma;case this.InterpolantFactoryMethodBezier:return vu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;gu(this.settings)&&(xf(this.settings.inTangents,e),xf(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&($e("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&($e("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){$e("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){$e("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&km(r))for(let a=0,l=r.length;a!==l;++a){let u=r[a];if(isNaN(u)){$e("KeyframeTrack: Value is not a valid number.",this,a,u),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ma,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,u=e[a],f=e[a+1];if(u!==f&&(a!==1||u!==e[0]))if(r)l=!0;else{let h=a*n,c=h-n,p=h+n;for(let x=0;x!==n;++x){let M=t[h+x];if(M!==t[c+x]||M!==t[p+x]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,c=o*n;for(let p=0;p!==n;++p)t[c+p]=t[h+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,u=0;u!==n;++u)t[l+u]=t[a+u];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,gu(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function xf(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Ln.prototype.ValueTypeName="";Ln.prototype.TimeBufferType=Float32Array;Ln.prototype.ValueBufferType=Float32Array;Ln.prototype.DefaultInterpolation=wa;var Fi=class extends Ln{constructor(e,t,n){super(e,t,n)}};Fi.prototype.ValueTypeName="bool";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=Fs;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;var Oa=class extends Ln{constructor(e,t,n,r){super(e,t,n,r)}};Oa.prototype.ValueTypeName="color";var za=class extends Ln{constructor(e,t,n,r){super(e,t,n,r)}};za.prototype.ValueTypeName="number";var ka=class extends Li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),u=e*a;for(let f=u+a;u!==f;u+=4)On.slerpFlat(s,0,o,u-a,o,u,l);return s}},$s=class extends Ln{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ka(this.times,this.values,this.getValueSize(),e)}};$s.prototype.ValueTypeName="quaternion";$s.prototype.InterpolantFactoryMethodSmooth=void 0;var Ni=class extends Ln{constructor(e,t,n){super(e,t,n)}};Ni.prototype.ValueTypeName="string";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=Fs;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;var Va=class extends Ln{constructor(e,t,n,r){super(e,t,n,r)}};Va.prototype.ValueTypeName="vector";var bu={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(vf(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!vf(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function vf(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Ha=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(f){a++,s===!1&&r.onStart!==void 0&&r.onStart(f,o,a),s=!0},this.itemEnd=function(f){o++,r.onProgress!==void 0&&r.onProgress(f,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(f){r.onError!==void 0&&r.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,h){return u.push(f,h),this},this.removeHandler=function(f){let h=u.indexOf(f);return h!==-1&&u.splice(h,2),this},this.getHandler=function(f){for(let h=0,c=u.length;h<c;h+=2){let p=u[h],x=u[h+1];if(p.global&&(p.lastIndex=0),p.test(f))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},cd=new Ha,Zr=class{constructor(e){this.manager=e!==void 0?e:cd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Zr.DEFAULT_MATERIAL_NAME="__DEFAULT";var pi={},Mu=class extends Error{constructor(e,t){super(e),this.response=t}},Ga=class extends Zr{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=bu.get(`file:${e}`);if(s!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0);return}if(pi[e]!==void 0){pi[e].push({onLoad:t,onProgress:n,onError:r});return}pi[e]=[],pi[e].push({onLoad:t,onProgress:n,onError:r});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(u=>{if(u.status===200||u.status===0){if(u.status===0&&We("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||u.body===void 0||u.body.getReader===void 0)return u;let f=pi[e],h=u.body.getReader(),c=u.headers.get("X-File-Size")||u.headers.get("Content-Length"),p=c?parseInt(c):0,x=p!==0,M=0,m=new ReadableStream({start(g){S();function S(){h.read().then(({done:A,value:y})=>{if(A)g.close();else{M+=y.byteLength;let T=new ProgressEvent("progress",{lengthComputable:x,loaded:M,total:p});for(let E=0,I=f.length;E<I;E++){let _=f[E];_.onProgress&&_.onProgress(T)}g.enqueue(y),S()}},A=>{g.error(A)})}}});return new Response(m)}else throw new Mu(`fetch for "${u.url}" responded with ${u.status}: ${u.statusText}`,u)}).then(u=>{switch(l){case"arraybuffer":return u.arrayBuffer();case"blob":return u.blob();case"document":return u.text().then(f=>new DOMParser().parseFromString(f,a));case"json":return u.json();default:if(a==="")return u.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),c=h&&h[1]?h[1].toLowerCase():void 0,p=new TextDecoder(c);return u.arrayBuffer().then(x=>p.decode(x))}}}).then(u=>{bu.add(`file:${e}`,u);let f=pi[e];delete pi[e];for(let h=0,c=f.length;h<c;h++){let p=f[h];p.onLoad&&p.onLoad(u)}}).catch(u=>{let f=pi[e];if(f===void 0)throw this.manager.itemError(e),u;delete pi[e];for(let h=0,c=f.length;h<c;h++){let p=f[h];p.onError&&p.onError(u)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var or=class extends Zr{constructor(e){super(e)}load(e,t,n,r){let s=this,o=new It,a=new Ga(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(e,function(l){let u;try{u=s.parse(l)}catch(f){r!==void 0?r(f):$e(f);return}s._applyTexData(o,u),t&&t(o,u)},n,r),o}createDataTexture(e){let t=new It;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:Dt,e.wrapT=t.wrapT!==void 0?t.wrapT:Dt,e.magFilter=t.magFilter!==void 0?t.magFilter:nt,e.minFilter=t.minFilter!==void 0?t.minFilter:nt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=_i),t.mipmapCount===1&&(e.minFilter=nt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}};var fa=new k,da=new On,Qn=new k,Js=class extends zn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ze,this.projectionMatrix=new Ze,this.projectionMatrixInverse=new Ze,this.coordinateSystem=qn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(fa,da,Qn),Qn.x===1&&Qn.y===1&&Qn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fa,da,Qn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(fa,da,Qn),Qn.x===1&&Qn.y===1&&Qn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fa,da,Qn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ri=new k,_f=new Be,yf=new Be,nn=class extends Js{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Aa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan($c*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Aa*2*Math.atan(Math.tan($c*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ri.x,Ri.y).multiplyScalar(-e/Ri.z),Ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ri.x,Ri.y).multiplyScalar(-e/Ri.z)}getViewSize(e,t){return this.getViewBounds(e,_f,yf),t.subVectors(yf,_f)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan($c*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,u=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/u,r*=o.width/l,n*=o.height/u}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var ar=class extends Js{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let u=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,o=s+u*this.view.width,a-=f*this.view.offsetY,l=a-f*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var Ur=-90,Br=1,Wa=class extends zn{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new nn(Ur,Br,e,t);r.layers=this.layers,this.add(r);let s=new nn(Ur,Br,e,t);s.layers=this.layers,this.add(s);let o=new nn(Ur,Br,e,t);o.layers=this.layers,this.add(o);let a=new nn(Ur,Br,e,t);a.layers=this.layers,this.add(a);let l=new nn(Ur,Br,e,t);l.layers=this.layers,this.add(l);let u=new nn(Ur,Br,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let u of t)this.remove(u);if(e===qn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Us)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,u,f]=this.children,h=e.getRenderTarget(),c=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,1,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),n.texture.generateMipmaps=M,e.setRenderTarget(n,5,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,f),e.setRenderTarget(h,c,p),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},Xa=class extends nn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Gu="\\[\\]\\.:\\/",pg=new RegExp("["+Gu+"]","g"),Wu="[^"+Gu+"]",mg="[^"+Gu.replace("\\.","")+"]",gg=/((?:WC+[\/:])*)/.source.replace("WC",Wu),xg=/(WCOD+)?/.source.replace("WCOD",mg),vg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Wu),_g=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Wu),yg=new RegExp("^"+gg+xg+vg+_g+"$"),Sg=["material","materials","bones","map"],Tu=class{constructor(e,t,n){let r=n||Ot.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ot=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(pg,"")}static parseTrackName(e){let t=yg.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);Sg.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){We("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let u=t.objectIndex;switch(n){case"materials":if(!e.material){$e("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){$e("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){$e("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let f=0;f<e.length;f++)if(e[f].name===u){u=f;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){$e("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){$e("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){$e("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(u!==void 0){if(e[u]===void 0){$e("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}let o=e[r];if(o===void 0){let u=t.nodeName;$e("PropertyBinding: Trying to update property for track: "+u+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){$e("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){$e("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ot.Composite=Tu;Ot.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ot.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ot.prototype.GetterByBindingType=[Ot.prototype._getValue_direct,Ot.prototype._getValue_array,Ot.prototype._getValue_arrayElement,Ot.prototype._getValue_toArray];Ot.prototype.SetterByBindingTypeAndVersioning=[[Ot.prototype._setValue_direct,Ot.prototype._setValue_direct_setNeedsUpdate,Ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_array,Ot.prototype._setValue_array_setNeedsUpdate,Ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_arrayElement,Ot.prototype._setValue_arrayElement_setNeedsUpdate,Ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_fromArray,Ot.prototype._setValue_fromArray_setNeedsUpdate,Ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var US=new Float32Array(1);var Ks=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,We("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},Qs=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=tt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(tt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Ju=class Ju{constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let s=this.elements;return s[0]=e,s[2]=t,s[1]=n,s[3]=r,this}};Ju.prototype.isMatrix2=!0;var wu=Ju;var Sf=new k,pa=new k,Or=new k,zr=new k,xu=new k,bg=new k,Mg=new k,Sn=class{constructor(e=new k,t=new k){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){Sf.subVectors(e,this.start),pa.subVectors(this.end,this.start);let n=pa.dot(pa);if(n===0)return 0;let s=pa.dot(Sf)/n;return t&&(s=tt(s,0,1)),s}closestPointToPoint(e,t,n){let r=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=bg,n=Mg){let r=10000000000000001e-32,s,o,a=this.start,l=e.start,u=this.end,f=e.end;Or.subVectors(u,a),zr.subVectors(f,l),xu.subVectors(a,l);let h=Or.dot(Or),c=zr.dot(zr),p=zr.dot(xu);if(h<=r&&c<=r)return t.copy(a),n.copy(l),t.sub(n),t.dot(t);if(h<=r)s=0,o=p/c,o=tt(o,0,1);else{let x=Or.dot(xu);if(c<=r)o=0,s=tt(-x/h,0,1);else{let M=Or.dot(zr),m=h*c-M*M;m!==0?s=tt((M*p-x*c)/m,0,1):s=0,o=(M*s+p)/c,o<0?(o=0,s=tt(-x/h,0,1)):o>1&&(o=1,s=tt((M-x)/h,0,1))}}return t.copy(a).addScaledVector(Or,s),n.copy(l).addScaledVector(zr,o),t.distanceToSquared(n)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};function Xu(i,e,t,n){let r=Tg(n);switch(t){case Ou:return i*e;case Tn:return i*e/r.components*r.byteLength;case Qr:return i*e/r.components*r.byteLength;case ln:return i*e*2/r.components*r.byteLength;case ki:return i*e*2/r.components*r.byteLength;case zu:return i*e*3/r.components*r.byteLength;case Ge:return i*e*4/r.components*r.byteLength;case Vi:return i*e*4/r.components*r.byteLength;case co:case uo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ho:case fo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Qa:case el:return Math.max(i,16)*Math.max(e,8)/4;case Ka:case ja:return Math.max(i,8)*Math.max(e,8)/2;case tl:case nl:case rl:case sl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case il:case po:case ol:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case al:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ll:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case cl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case ul:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case hl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case fl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case dl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case pl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ml:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case gl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case xl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case vl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case _l:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case yl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Sl:case bl:case Ml:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Tl:case wl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case mo:case Al:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Tg(i){switch(i){case on:case Jr:return{byteLength:1,components:1};case Bi:case lo:case ct:return{byteLength:2,components:1};case $a:case Ja:return{byteLength:2,components:4};case an:case Oi:case et:return{byteLength:4,components:1};case Uu:case Bu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?We("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Pd(){let i=null,e=!1,t=null,n=null;function r(s,o){n=i.requestAnimationFrame(r),t(s,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function wg(i){let e=new WeakMap;function t(a,l){let u=a.array,f=a.usage,h=u.byteLength,c=i.createBuffer();i.bindBuffer(l,c),i.bufferData(l,u,f),a.onUploadCallback();let p;if(u instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&u instanceof Float16Array)p=i.HALF_FLOAT;else if(u instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)p=i.SHORT;else if(u instanceof Uint32Array)p=i.UNSIGNED_INT;else if(u instanceof Int32Array)p=i.INT;else if(u instanceof Int8Array)p=i.BYTE;else if(u instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:c,type:p,bytesPerElement:u.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,u){let f=l.array,h=l.updateRanges;if(i.bindBuffer(u,a),h.length===0)i.bufferSubData(u,0,f);else{h.sort((p,x)=>p.start-x.start);let c=0;for(let p=1;p<h.length;p++){let x=h[c],M=h[p];M.start<=x.start+x.count+1?x.count=Math.max(x.count,M.start+M.count-x.start):(++c,h[c]=M)}h.length=c+1;for(let p=0,x=h.length;p<x;p++){let M=h[p];i.bufferSubData(u,M.start*f.BYTES_PER_ELEMENT,f,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let f=e.get(a);(!f||f.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let u=e.get(a);if(u===void 0)e.set(a,t(a,l));else if(u.version<a.version){if(u.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(u.buffer,a,l),u.version=a.version}}return{get:r,remove:s,update:o}}var Ag=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Eg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Rg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Cg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ig=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Pg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Dg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Lg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Fg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Ng=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ug=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Og=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,zg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,kg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Vg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Hg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Gg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Wg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,qg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Yg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Zg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,$g=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Jg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Kg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Qg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,e0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,t0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,n0="gl_FragColor = linearToOutputTexel( gl_FragColor );",i0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,r0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,s0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,o0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,a0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,l0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,c0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,u0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,h0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,f0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,d0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,p0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,m0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,g0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,x0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,v0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,_0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,y0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,S0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,b0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,M0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,T0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,w0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,A0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,E0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,R0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,C0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,I0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,P0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,D0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,L0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,F0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,N0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,U0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,B0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,O0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,z0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,k0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,V0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,H0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,G0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,W0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,X0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,q0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Y0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Z0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,$0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,J0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,K0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Q0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,j0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ex=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,nx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ix=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,rx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,sx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ox=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ax=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,lx=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,cx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,ux=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,hx=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,fx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,dx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,px=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,mx=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,gx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,xx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,vx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,_x=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,yx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Sx=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,bx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Mx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Tx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,wx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Ax=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ex=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cx=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ix=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Px=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Lx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Fx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Nx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Ux=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Bx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ox=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,kx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Vx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Xx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Yx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Zx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$x=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Kx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ev=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,tv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,nv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,iv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,at={alphahash_fragment:Ag,alphahash_pars_fragment:Eg,alphamap_fragment:Rg,alphamap_pars_fragment:Cg,alphatest_fragment:Ig,alphatest_pars_fragment:Pg,aomap_fragment:Dg,aomap_pars_fragment:Lg,batching_pars_vertex:Fg,batching_vertex:Ng,begin_vertex:Ug,beginnormal_vertex:Bg,bsdfs:Og,iridescence_fragment:zg,bumpmap_pars_fragment:kg,clipping_planes_fragment:Vg,clipping_planes_pars_fragment:Hg,clipping_planes_pars_vertex:Gg,clipping_planes_vertex:Wg,color_fragment:Xg,color_pars_fragment:qg,color_pars_vertex:Yg,color_vertex:Zg,common:$g,cube_uv_reflection_fragment:Jg,defaultnormal_vertex:Kg,displacementmap_pars_vertex:Qg,displacementmap_vertex:jg,emissivemap_fragment:e0,emissivemap_pars_fragment:t0,colorspace_fragment:n0,colorspace_pars_fragment:i0,envmap_fragment:r0,envmap_common_pars_fragment:s0,envmap_pars_fragment:o0,envmap_pars_vertex:a0,envmap_physical_pars_fragment:v0,envmap_vertex:l0,fog_vertex:c0,fog_pars_vertex:u0,fog_fragment:h0,fog_pars_fragment:f0,gradientmap_pars_fragment:d0,lightmap_pars_fragment:p0,lights_lambert_fragment:m0,lights_lambert_pars_fragment:g0,lights_pars_begin:x0,lights_toon_fragment:_0,lights_toon_pars_fragment:y0,lights_phong_fragment:S0,lights_phong_pars_fragment:b0,lights_physical_fragment:M0,lights_physical_pars_fragment:T0,lights_fragment_begin:w0,lights_fragment_maps:A0,lights_fragment_end:E0,lightprobes_pars_fragment:R0,logdepthbuf_fragment:C0,logdepthbuf_pars_fragment:I0,logdepthbuf_pars_vertex:P0,logdepthbuf_vertex:D0,map_fragment:L0,map_pars_fragment:F0,map_particle_fragment:N0,map_particle_pars_fragment:U0,metalnessmap_fragment:B0,metalnessmap_pars_fragment:O0,morphinstance_vertex:z0,morphcolor_vertex:k0,morphnormal_vertex:V0,morphtarget_pars_vertex:H0,morphtarget_vertex:G0,normal_fragment_begin:W0,normal_fragment_maps:X0,normal_pars_fragment:q0,normal_pars_vertex:Y0,normal_vertex:Z0,normalmap_pars_fragment:$0,clearcoat_normal_fragment_begin:J0,clearcoat_normal_fragment_maps:K0,clearcoat_pars_fragment:Q0,iridescence_pars_fragment:j0,opaque_fragment:ex,packing:tx,premultiplied_alpha_fragment:nx,project_vertex:ix,dithering_fragment:rx,dithering_pars_fragment:sx,roughnessmap_fragment:ox,roughnessmap_pars_fragment:ax,shadowmap_pars_fragment:lx,shadowmap_pars_vertex:cx,shadowmap_vertex:ux,shadowmask_pars_fragment:hx,skinbase_vertex:fx,skinning_pars_vertex:dx,skinning_vertex:px,skinnormal_vertex:mx,specularmap_fragment:gx,specularmap_pars_fragment:xx,tonemapping_fragment:vx,tonemapping_pars_fragment:_x,transmission_fragment:yx,transmission_pars_fragment:Sx,uv_pars_fragment:bx,uv_pars_vertex:Mx,uv_vertex:Tx,worldpos_vertex:wx,background_vert:Ax,background_frag:Ex,backgroundCube_vert:Rx,backgroundCube_frag:Cx,cube_vert:Ix,cube_frag:Px,depth_vert:Dx,depth_frag:Lx,distance_vert:Fx,distance_frag:Nx,equirect_vert:Ux,equirect_frag:Bx,linedashed_vert:Ox,linedashed_frag:zx,meshbasic_vert:kx,meshbasic_frag:Vx,meshlambert_vert:Hx,meshlambert_frag:Gx,meshmatcap_vert:Wx,meshmatcap_frag:Xx,meshnormal_vert:qx,meshnormal_frag:Yx,meshphong_vert:Zx,meshphong_frag:$x,meshphysical_vert:Jx,meshphysical_frag:Kx,meshtoon_vert:Qx,meshtoon_frag:jx,points_vert:ev,points_frag:tv,shadow_vert:nv,shadow_frag:iv,sprite_vert:rv,sprite_frag:sv},Ce={common:{diffuse:{value:new Je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new je}},envmap:{envMap:{value:null},envMapRotation:{value:new je},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new je},normalScale:{value:new Be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new Je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0},uvTransform:{value:new je}},sprite:{diffuse:{value:new Je(16777215)},opacity:{value:1},center:{value:new Be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new je},alphaMap:{value:null},alphaMapTransform:{value:new je},alphaTest:{value:0}}},ri={basic:{uniforms:vn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.fog]),vertexShader:at.meshbasic_vert,fragmentShader:at.meshbasic_frag},lambert:{uniforms:vn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new Je(0)},envMapIntensity:{value:1}}]),vertexShader:at.meshlambert_vert,fragmentShader:at.meshlambert_frag},phong:{uniforms:vn([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new Je(0)},specular:{value:new Je(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:at.meshphong_vert,fragmentShader:at.meshphong_frag},standard:{uniforms:vn([Ce.common,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.roughnessmap,Ce.metalnessmap,Ce.fog,Ce.lights,{emissive:{value:new Je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag},toon:{uniforms:vn([Ce.common,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.gradientmap,Ce.fog,Ce.lights,{emissive:{value:new Je(0)}}]),vertexShader:at.meshtoon_vert,fragmentShader:at.meshtoon_frag},matcap:{uniforms:vn([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,{matcap:{value:null}}]),vertexShader:at.meshmatcap_vert,fragmentShader:at.meshmatcap_frag},points:{uniforms:vn([Ce.points,Ce.fog]),vertexShader:at.points_vert,fragmentShader:at.points_frag},dashed:{uniforms:vn([Ce.common,Ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:at.linedashed_vert,fragmentShader:at.linedashed_frag},depth:{uniforms:vn([Ce.common,Ce.displacementmap]),vertexShader:at.depth_vert,fragmentShader:at.depth_frag},normal:{uniforms:vn([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,{opacity:{value:1}}]),vertexShader:at.meshnormal_vert,fragmentShader:at.meshnormal_frag},sprite:{uniforms:vn([Ce.sprite,Ce.fog]),vertexShader:at.sprite_vert,fragmentShader:at.sprite_frag},background:{uniforms:{uvTransform:{value:new je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:at.background_vert,fragmentShader:at.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new je}},vertexShader:at.backgroundCube_vert,fragmentShader:at.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:at.cube_vert,fragmentShader:at.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:at.equirect_vert,fragmentShader:at.equirect_frag},distance:{uniforms:vn([Ce.common,Ce.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:at.distance_vert,fragmentShader:at.distance_frag},shadow:{uniforms:vn([Ce.lights,Ce.fog,{color:{value:new Je(0)},opacity:{value:1}}]),vertexShader:at.shadow_vert,fragmentShader:at.shadow_frag}};ri.physical={uniforms:vn([ri.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new je},clearcoatNormalScale:{value:new Be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new je},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new je},sheen:{value:0},sheenColor:{value:new Je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new je},transmissionSamplerSize:{value:new Be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new je},attenuationDistance:{value:0},attenuationColor:{value:new Je(0)},specularColor:{value:new Je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new je},anisotropyVector:{value:new Be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new je}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag};var Il={r:0,b:0,g:0},ov=new Ze,Dd=new je;Dd.set(-1,0,0,0,1,0,0,0,1);function av(i,e,t,n,r,s){let o=new Je(0),a=r===!0?0:1,l,u,f=null,h=0,c=null;function p(S){let A=S.isScene===!0?S.background:null;if(A&&A.isTexture){let y=S.backgroundBlurriness>0;A=e.get(A,y)}return A}function x(S){let A=!1,y=p(S);y===null?m(o,a):y&&y.isColor&&(m(y,1),A=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,s):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function M(S,A){let y=p(A);y&&(y.isCubeTexture||y.mapping===oo)?(u===void 0&&(u=new sn(new qr(1,1,1),new qt({name:"BackgroundCubeMaterial",uniforms:ur(ri.backgroundCube.uniforms),vertexShader:ri.backgroundCube.vertexShader,fragmentShader:ri.backgroundCube.fragmentShader,side:$t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,E,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(u)),u.material.uniforms.envMap.value=y,u.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(ov.makeRotationFromEuler(A.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&u.material.uniforms.backgroundRotation.value.premultiply(Dd),u.material.toneMapped=dt.getTransfer(y.colorSpace)!==Et,(f!==y||h!==y.version||c!==i.toneMapping)&&(u.material.needsUpdate=!0,f=y,h=y.version,c=i.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new sn(new sr(2,2),new qt({name:"BackgroundMaterial",uniforms:ur(ri.background.uniforms),vertexShader:ri.background.vertexShader,fragmentShader:ri.background.fragmentShader,side:bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=dt.getTransfer(y.colorSpace)!==Et,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||h!==y.version||c!==i.toneMapping)&&(l.material.needsUpdate=!0,f=y,h=y.version,c=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function m(S,A){S.getRGB(Il,Hu(i)),t.buffers.color.setClear(Il.r,Il.g,Il.b,A,s)}function g(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(S,A=1){o.set(S),a=A,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(S){a=S,m(o,a)},render:x,addToRenderList:M,dispose:g}}function lv(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=c(null),s=r,o=!1;function a(N,F,z,U,V){let q=!1,te=h(N,U,z,F);s!==te&&(s=te,u(s.object)),q=p(N,U,z,V),q&&x(N,U,z,V),V!==null&&e.update(V,i.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,y(N,F,z,U),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return i.createVertexArray()}function u(N){return i.bindVertexArray(N)}function f(N){return i.deleteVertexArray(N)}function h(N,F,z,U){let V=U.wireframe===!0,q=n[F.id];q===void 0&&(q={},n[F.id]=q);let te=N.isInstancedMesh===!0?N.id:0,he=q[te];he===void 0&&(he={},q[te]=he);let Q=he[z.id];Q===void 0&&(Q={},he[z.id]=Q);let ie=Q[V];return ie===void 0&&(ie=c(l()),Q[V]=ie),ie}function c(N){let F=[],z=[],U=[];for(let V=0;V<t;V++)F[V]=0,z[V]=0,U[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:z,attributeDivisors:U,object:N,attributes:{},index:null}}function p(N,F,z,U){let V=s.attributes,q=F.attributes,te=0,he=z.getAttributes();for(let Q in he)if(he[Q].location>=0){let le=V[Q],Re=q[Q];if(Re===void 0&&(Q==="instanceMatrix"&&N.instanceMatrix&&(Re=N.instanceMatrix),Q==="instanceColor"&&N.instanceColor&&(Re=N.instanceColor)),le===void 0||le.attribute!==Re||Re&&le.data!==Re.data)return!0;te++}return s.attributesNum!==te||s.index!==U}function x(N,F,z,U){let V={},q=F.attributes,te=0,he=z.getAttributes();for(let Q in he)if(he[Q].location>=0){let le=q[Q];le===void 0&&(Q==="instanceMatrix"&&N.instanceMatrix&&(le=N.instanceMatrix),Q==="instanceColor"&&N.instanceColor&&(le=N.instanceColor));let Re={};Re.attribute=le,le&&le.data&&(Re.data=le.data),V[Q]=Re,te++}s.attributes=V,s.attributesNum=te,s.index=U}function M(){let N=s.newAttributes;for(let F=0,z=N.length;F<z;F++)N[F]=0}function m(N){g(N,0)}function g(N,F){let z=s.newAttributes,U=s.enabledAttributes,V=s.attributeDivisors;z[N]=1,U[N]===0&&(i.enableVertexAttribArray(N),U[N]=1),V[N]!==F&&(i.vertexAttribDivisor(N,F),V[N]=F)}function S(){let N=s.newAttributes,F=s.enabledAttributes;for(let z=0,U=F.length;z<U;z++)F[z]!==N[z]&&(i.disableVertexAttribArray(z),F[z]=0)}function A(N,F,z,U,V,q,te){te===!0?i.vertexAttribIPointer(N,F,z,V,q):i.vertexAttribPointer(N,F,z,U,V,q)}function y(N,F,z,U){M();let V=U.attributes,q=z.getAttributes(),te=F.defaultAttributeValues;for(let he in q){let Q=q[he];if(Q.location>=0){let ie=V[he];if(ie===void 0&&(he==="instanceMatrix"&&N.instanceMatrix&&(ie=N.instanceMatrix),he==="instanceColor"&&N.instanceColor&&(ie=N.instanceColor)),ie!==void 0){let le=ie.normalized,Re=ie.itemSize,ye=e.get(ie);if(ye===void 0)continue;let ut=ye.buffer,Xe=ye.type,rt=ye.bytesPerElement,J=Xe===i.INT||Xe===i.UNSIGNED_INT||ie.gpuType===Oi;if(ie.isInterleavedBufferAttribute){let ce=ie.data,Ee=ce.stride,Ye=ie.offset;if(ce.isInstancedInterleavedBuffer){for(let Ie=0;Ie<Q.locationSize;Ie++)g(Q.location+Ie,ce.meshPerAttribute);N.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Ie=0;Ie<Q.locationSize;Ie++)m(Q.location+Ie);i.bindBuffer(i.ARRAY_BUFFER,ut);for(let Ie=0;Ie<Q.locationSize;Ie++)A(Q.location+Ie,Re/Q.locationSize,Xe,le,Ee*rt,(Ye+Re/Q.locationSize*Ie)*rt,J)}else{if(ie.isInstancedBufferAttribute){for(let ce=0;ce<Q.locationSize;ce++)g(Q.location+ce,ie.meshPerAttribute);N.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let ce=0;ce<Q.locationSize;ce++)m(Q.location+ce);i.bindBuffer(i.ARRAY_BUFFER,ut);for(let ce=0;ce<Q.locationSize;ce++)A(Q.location+ce,Re/Q.locationSize,Xe,le,Re*rt,Re/Q.locationSize*ce*rt,J)}}else if(te!==void 0){let le=te[he];if(le!==void 0)switch(le.length){case 2:i.vertexAttrib2fv(Q.location,le);break;case 3:i.vertexAttrib3fv(Q.location,le);break;case 4:i.vertexAttrib4fv(Q.location,le);break;default:i.vertexAttrib1fv(Q.location,le)}}}}S()}function T(){R();for(let N in n){let F=n[N];for(let z in F){let U=F[z];for(let V in U){let q=U[V];for(let te in q)f(q[te].object),delete q[te];delete U[V]}}delete n[N]}}function E(N){if(n[N.id]===void 0)return;let F=n[N.id];for(let z in F){let U=F[z];for(let V in U){let q=U[V];for(let te in q)f(q[te].object),delete q[te];delete U[V]}}delete n[N.id]}function I(N){for(let F in n){let z=n[F];for(let U in z){let V=z[U];if(V[N.id]===void 0)continue;let q=V[N.id];for(let te in q)f(q[te].object),delete q[te];delete V[N.id]}}}function _(N){for(let F in n){let z=n[F],U=N.isInstancedMesh===!0?N.id:0,V=z[U];if(V!==void 0){for(let q in V){let te=V[q];for(let he in te)f(te[he].object),delete te[he];delete V[q]}delete z[U],Object.keys(z).length===0&&delete n[F]}}}function R(){P(),o=!0,s!==r&&(s=r,u(s.object))}function P(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:R,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfObject:_,releaseStatesOfProgram:I,initAttributes:M,enableAttribute:m,disableUnusedAttributes:S}}function cv(i,e,t){let n;function r(l){n=l}function s(l,u){i.drawArrays(n,l,u),t.update(u,n,1)}function o(l,u,f){f!==0&&(i.drawArraysInstanced(n,l,u,f),t.update(u,n,f))}function a(l,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,f);let c=0;for(let p=0;p<f;p++)c+=u[p];t.update(c,n,1)}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function uv(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(I){return!(I!==Ge&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(I){let _=I===ct&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==on&&I!==et&&!_&&n.convert(I)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(I){if(I==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp",f=l(u);f!==u&&(We("WebGLRenderer:",u,"not supported, using",f,"instead."),u=f);let h=t.logarithmicDepthBuffer===!0,c=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&c===!1&&We("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:u,logarithmicDepthBuffer:h,reversedDepthBuffer:c,maxTextures:p,maxVertexTextures:x,maxTextureSize:M,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:S,maxVaryings:A,maxFragmentUniforms:y,maxSamples:T,samples:E}}function hv(i){let e=this,t=null,n=0,r=!1,s=!1,o=new yn,a=new je,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,c){let p=h.length!==0||c||n!==0||r;return r=c,n=h.length,p},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,c){t=f(h,c,0)},this.setState=function(h,c,p){let x=h.clippingPlanes,M=h.clipIntersection,m=h.clipShadows,g=i.get(h);if(!r||x===null||x.length===0||s&&!m)s?f(null):u();else{let S=s?0:n,A=S*4,y=g.clippingState||null;l.value=y,y=f(x,c,A,p);for(let T=0;T!==A;++T)y[T]=t[T];g.clippingState=y,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=S}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function f(h,c,p,x){let M=h!==null?h.length:0,m=null;if(M!==0){if(m=l.value,x!==!0||m===null){let g=p+M*4,S=c.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<g)&&(m=new Float32Array(g));for(let A=0,y=p;A!==M;++A,y+=4)o.copy(h[A]).applyMatrix4(S,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,m}}var es=4,fv=6,dv=20,pv=256,xo=new ar,ud=new Je,Ku=null,Qu=0,ju=0,eh=!1,mv=new k,hr=new k,Dl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,s={}){let{size:o=256,position:a=mv}=s;Ku=this._renderer.getRenderTarget(),Qu=this._renderer.getActiveCubeFace(),ju=this._renderer.getActiveMipmapLevel(),eh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=dd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ku,Qu,ju),this._renderer.xr.enabled=eh,e.scissorTest=!1,jr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ui||e.mapping===cr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ku=this._renderer.getRenderTarget(),Qu=this._renderer.getActiveCubeFace(),ju=this._renderer.getActiveMipmapLevel(),eh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:nt,minFilter:nt,generateMipmaps:!1,type:ct,format:Ge,colorSpace:fn,depthBuffer:!1},r=hd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=hd(e,t,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=gv(s)),this._blurMaterial=vv(s,e,t),this._ggxMaterial=xv(s,e,t)}return r}_compileMaterial(e){let t=new sn(new Lt,e);this._renderer.compile(t,xo)}_sceneToCubeUV(e,t,n,r,s){let l=new nn(90,1,t,n),u=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],h=this._renderer,c=h.autoClear,p=h.toneMapping;h.getClearColor(ud),h.toneMapping=Mn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(r),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new sn(new qr,new rr({name:"PMREM.Background",side:$t,depthWrite:!1,depthTest:!1})));let M=this._backgroundBox,m=M.material,g=!1,S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,g=!0):(m.color.copy(ud),g=!0);for(let A=0;A<6;A++){let y=A%3;y===0?(l.up.set(0,u[A],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+f[A],s.y,s.z)):y===1?(l.up.set(0,0,u[A]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+f[A],s.z)):(l.up.set(0,u[A],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+f[A]));let T=this._cubeSize;jr(r,y*T,A>2?T:0,T,T),h.setRenderTarget(r),g&&h.render(M,l),h.render(e,l)}h.toneMapping=p,h.autoClear=c,e.background=S}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===Ui||e.mapping===cr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=dd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fd());let s=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;jr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,xo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,u=n/(this._lodMeshes.length-1),f=t/(this._lodMeshes.length-1),h=Math.sqrt(u*u-f*f),c=u*1.25,p=h*c,{_lodMax:x}=this,M=this._sizeLods[n],m=3*M*(n>x-es?n-x+es:0),g=4*(this._cubeSize-M);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=x-t,jr(s,m,g,3*M,2*M),r.setRenderTarget(s),r.render(a,xo),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=x-n,jr(e,m,g,3*M,2*M),r.setRenderTarget(e),r.render(a,xo)}_blur(e,t,n,r){let s=this._pingPongRenderTarget,o=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,s,t,n,o),this._blurPass(s,e,n,n,o)}_blurPass(e,t,n,r,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[r];l.material=a;let u=a.uniforms;u.envMap.value=e.texture,u.sigma.value=s,u.mipInt.value=this._lodMax-n;let f=this._sizeLods[r],h=3*f*(r>this._lodMax-es?r-this._lodMax+es:0),c=4*(this._cubeSize-f);jr(t,h,c,3*f,2*f),o.setRenderTarget(t),o.render(l,xo)}};function gv(i){let e=[],t=[],n=i,r=i-es+1+fv;for(let s=0;s<r;s++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,u=1+a,f=[l,l,u,l,u,u,l,l,u,u,l,u],h=6,c=6,p=3,x=new Float32Array(p*c*h),M=new Float32Array(p*c*h);for(let g=0;g<h;g++){let S=g%3*2/3-1,A=g>2?0:-1,y=[S,A,0,S+2/3,A,0,S+2/3,A+1,0,S,A,0,S+2/3,A+1,0,S,A+1,0];x.set(y,p*c*g);for(let T=0;T<c;T++){let E=f[T*2]*2-1,I=f[T*2+1]*2-1;g===0?hr.set(1,I,E):g===1?hr.set(-E,1,-I):g===2?hr.set(-E,I,1):g===3?hr.set(-1,I,-E):g===4?hr.set(-E,-1,I):hr.set(E,I,-1),hr.toArray(M,(g*c+T)*p)}}let m=new Lt;m.setAttribute("position",new xt(x,p)),m.setAttribute("outputDirection",new xt(M,p)),t.push(new sn(m,null)),n>es&&n--}return{lodMeshes:t,sizeLods:e}}function hd(i,e,t){let n=new Vt(i,e,t);return n.texture.mapping=oo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function jr(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function xv(i,e,t){return new qt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:pv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Nl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Jt,depthTest:!1,depthWrite:!1})}function vv(i,e,t){return new qt({name:"SphericalGaussianBlur",defines:{SAMPLES:dv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Nl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Jt,depthTest:!1,depthWrite:!1})}function fd(){return new qt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Nl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Jt,depthTest:!1,depthWrite:!1})}function dd(){return new qt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Nl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Jt,depthTest:!1,depthWrite:!1})}function Nl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ll=class extends Vt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Ws(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new qr(5,5,5),s=new qt({name:"CubemapFromEquirect",uniforms:ur(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:$t,blending:Jt});s.uniforms.tEquirect.value=t;let o=new sn(r,s),a=t.minFilter;return t.minFilter===_i&&(t.minFilter=nt),new Wa(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}};function _v(i){let e=new WeakMap,t=new WeakMap,n=null;function r(c,p=!1){return c==null?null:p?o(c):s(c)}function s(c){if(c&&c.isTexture){let p=c.mapping;if(p===ni||p===Ya)if(e.has(c)){let x=e.get(c).texture;return a(x,c.mapping)}else{let x=c.image;if(x&&x.height>0){let M=new Ll(x.height);return M.fromEquirectangularTexture(i,c),e.set(c,M),c.addEventListener("dispose",u),a(M.texture,c.mapping)}else return null}}return c}function o(c){if(c&&c.isTexture){let p=c.mapping,x=p===ni||p===Ya,M=p===Ui||p===cr;if(x||M){let m=t.get(c),g=m!==void 0?m.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==g)return n===null&&(n=new Dl(i)),m=x?n.fromEquirectangular(c,m):n.fromCubemap(c,m),m.texture.pmremVersion=c.pmremVersion,t.set(c,m),m.texture;if(m!==void 0)return m.texture;{let S=c.image;return x&&S&&S.height>0||M&&S&&l(S)?(n===null&&(n=new Dl(i)),m=x?n.fromEquirectangular(c):n.fromCubemap(c),m.texture.pmremVersion=c.pmremVersion,t.set(c,m),c.addEventListener("dispose",f),m.texture):null}}}return c}function a(c,p){return p===ni?c.mapping=Ui:p===Ya&&(c.mapping=cr),c}function l(c){let p=0,x=6;for(let M=0;M<x;M++)c[M]!==void 0&&p++;return p===x}function u(c){let p=c.target;p.removeEventListener("dispose",u);let x=e.get(p);x!==void 0&&(e.delete(p),x.dispose())}function f(c){let p=c.target;p.removeEventListener("dispose",f);let x=t.get(p);x!==void 0&&(t.delete(p),x.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:h}}function yv(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let r=t(n);return r===null&&Ci("WebGLRenderer: "+n+" extension not supported."),r}}}function Sv(i,e,t,n){let r={},s=new WeakMap;function o(h){let c=h.target;c.index!==null&&e.remove(c.index);for(let x in c.attributes)e.remove(c.attributes[x]);c.removeEventListener("dispose",o),delete r[c.id];let p=s.get(c);p&&(e.remove(p),s.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function a(h,c){return r[c.id]===!0||(c.addEventListener("dispose",o),r[c.id]=!0,t.memory.geometries++),c}function l(h){let c=h.attributes;for(let p in c)e.update(c[p],i.ARRAY_BUFFER)}function u(h){let c=[],p=h.index,x=h.attributes.position,M=0;if(x===void 0)return;if(p!==null){let S=p.array;M=p.version;for(let A=0,y=S.length;A<y;A+=3){let T=S[A+0],E=S[A+1],I=S[A+2];c.push(T,E,E,I,I,T)}}else{let S=x.array;M=x.version;for(let A=0,y=S.length/3-1;A<y;A+=3){let T=A+0,E=A+1,I=A+2;c.push(T,E,E,I,I,T)}}let m=new(x.count>=65535?Hs:Vs)(c,1);m.version=M;let g=s.get(h);g&&e.remove(g),s.set(h,m)}function f(h){let c=s.get(h);if(c){let p=h.index;p!==null&&c.version<p.version&&u(h)}else u(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:f}}function bv(i,e,t){let n;function r(h){n=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function l(h,c){i.drawElements(n,c,s,h*o),t.update(c,n,1)}function u(h,c,p){p!==0&&(i.drawElementsInstanced(n,c,s,h*o,p),t.update(c,n,p))}function f(h,c,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,c,0,s,h,0,p);let M=0;for(let m=0;m<p;m++)M+=c[m];t.update(M,n,1)}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=u,this.renderMultiDraw=f}function Mv(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:$e("WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Tv(i,e,t){let n=new WeakMap,r=new bt;function s(o,a,l){let u=o.morphTargetInfluences,f=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=f!==void 0?f.length:0,c=n.get(a);if(c===void 0||c.count!==h){let R=function(){I.dispose(),n.delete(a),a.removeEventListener("dispose",R)};c!==void 0&&c.texture.dispose();let p=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,M=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],A=0;p===!0&&(A=1),x===!0&&(A=2),M===!0&&(A=3);let y=a.attributes.position.count*A,T=1;y>e.maxTextureSize&&(T=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let E=new Float32Array(y*T*4*h),I=new Ii(E,y,T,h);I.type=et,I.needsUpdate=!0;let _=A*4;for(let P=0;P<h;P++){let N=m[P],F=g[P],z=S[P],U=y*T*4*P;for(let V=0;V<N.count;V++){let q=V*_;p===!0&&(r.fromBufferAttribute(N,V),E[U+q+0]=r.x,E[U+q+1]=r.y,E[U+q+2]=r.z,E[U+q+3]=0),x===!0&&(r.fromBufferAttribute(F,V),E[U+q+4]=r.x,E[U+q+5]=r.y,E[U+q+6]=r.z,E[U+q+7]=0),M===!0&&(r.fromBufferAttribute(z,V),E[U+q+8]=r.x,E[U+q+9]=r.y,E[U+q+10]=r.z,E[U+q+11]=z.itemSize===4?r.w:1)}}c={count:h,texture:I,size:new Be(y,T)},n.set(a,c),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let M=0;M<u.length;M++)p+=u[M];let x=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",u)}l.getUniforms().setValue(i,"morphTargetsTexture",c.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:s}}function wv(i,e,t,n,r){let s=new WeakMap;function o(u){let f=r.render.frame,h=u.geometry,c=e.get(u,h);if(s.get(c)!==f&&(e.update(c),s.set(c,f)),u.isInstancedMesh&&(u.hasEventListener("dispose",l)===!1&&u.addEventListener("dispose",l),s.get(u)!==f&&(t.update(u.instanceMatrix,i.ARRAY_BUFFER),u.instanceColor!==null&&t.update(u.instanceColor,i.ARRAY_BUFFER),s.set(u,f))),u.isSkinnedMesh){let p=u.skeleton;s.get(p)!==f&&(p.update(),s.set(p,f))}return c}function a(){s=new WeakMap}function l(u){let f=u.target;f.removeEventListener("dispose",l),n.releaseStatesOfObject(f),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:o,dispose:a}}var Av={[Du]:"LINEAR_TONE_MAPPING",[to]:"REINHARD_TONE_MAPPING",[no]:"CINEON_TONE_MAPPING",[io]:"ACES_FILMIC_TONE_MAPPING",[ro]:"AGX_TONE_MAPPING",[so]:"NEUTRAL_TONE_MAPPING",[Lu]:"CUSTOM_TONE_MAPPING"};function Ev(i,e,t,n,r,s){let o=new Vt(e,t,{type:i,depthBuffer:r,stencilBuffer:s,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,u=new Lt;u.setAttribute("position",new Xt([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Xt([0,2,0,0,2,0],2));let f=new Pa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new sn(u,f),c=new ar(-1,1,1,-1,0,1),p=null,x=null,M=!1,m,g=null,S=[],A=!1;this.setSize=function(y,T){o.setSize(y,T),a!==null&&a.setSize(y,T),l!==null&&l.setSize(y,T);for(let E=0;E<S.length;E++){let I=S[E];I.setSize&&I.setSize(y,T)}},this.setEffects=function(y){S=y,A=S.length>0&&S[0].isRenderPass===!0;let T=o.width,E=o.height;S.length>0&&a===null&&(a=new Vt(T,E,{type:ct,depthBuffer:!1,stencilBuffer:!1}),l=new Vt(T,E,{type:ct,depthBuffer:!1,stencilBuffer:!1}));for(let I=0;I<S.length;I++){let _=S[I];_.setSize&&_.setSize(T,E)}},this.begin=function(y,T){if(M||y.toneMapping===Mn&&S.length===0)return!1;if(g=T,T!==null){let E=T.width,I=T.height;(o.width!==E||o.height!==I)&&this.setSize(E,I)}return A===!1&&y.setRenderTarget(o),m=y.toneMapping,y.toneMapping=Mn,!0},this.hasRenderPass=function(){return A},this.end=function(y,T){y.toneMapping=m,M=!0;let E=o,I=a;for(let _=0;_<S.length;_++){let R=S[_];R.enabled!==!1&&(R.render(y,I,E,T),R.needsSwap!==!1&&(E=I,I=I===a?l:a))}if(p!==y.outputColorSpace||x!==y.toneMapping){p=y.outputColorSpace,x=y.toneMapping,f.defines={},dt.getTransfer(p)===Et&&(f.defines.SRGB_TRANSFER="");let _=Av[x];_&&(f.defines[_]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=E.texture,y.setRenderTarget(g),y.render(h,c),g=null,M=!1},this.isCompositing=function(){return M},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),u.dispose(),f.dispose()}}var Ld=new Rn,ih=new Di(1,1),Fd=new Ii,Nd=new Ca,Ud=new Ws,pd=[],md=[],gd=new Float32Array(16),xd=new Float32Array(9),vd=new Float32Array(4);function is(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=pd[r];if(s===void 0&&(s=new Float32Array(r),pd[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function Kt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Qt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ul(i,e){let t=md[e];t===void 0&&(t=new Int32Array(e),md[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Rv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Cv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;i.uniform2fv(this.addr,e),Qt(t,e)}}function Iv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Kt(t,e))return;i.uniform3fv(this.addr,e),Qt(t,e)}}function Pv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;i.uniform4fv(this.addr,e),Qt(t,e)}}function Dv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Kt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Qt(t,e)}else{if(Kt(t,n))return;vd.set(n),i.uniformMatrix2fv(this.addr,!1,vd),Qt(t,n)}}function Lv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Kt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Qt(t,e)}else{if(Kt(t,n))return;xd.set(n),i.uniformMatrix3fv(this.addr,!1,xd),Qt(t,n)}}function Fv(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Kt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Qt(t,e)}else{if(Kt(t,n))return;gd.set(n),i.uniformMatrix4fv(this.addr,!1,gd),Qt(t,n)}}function Nv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Uv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;i.uniform2iv(this.addr,e),Qt(t,e)}}function Bv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Kt(t,e))return;i.uniform3iv(this.addr,e),Qt(t,e)}}function Ov(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;i.uniform4iv(this.addr,e),Qt(t,e)}}function zv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function kv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;i.uniform2uiv(this.addr,e),Qt(t,e)}}function Vv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Kt(t,e))return;i.uniform3uiv(this.addr,e),Qt(t,e)}}function Hv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;i.uniform4uiv(this.addr,e),Qt(t,e)}}function Gv(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(ih.compareFunction=t.isReversedDepthBuffer()?Cl:Rl,s=ih):s=Ld,t.setTexture2D(e||s,r)}function Wv(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Nd,r)}function Xv(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Ud,r)}function qv(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Fd,r)}function Yv(i){switch(i){case 5126:return Rv;case 35664:return Cv;case 35665:return Iv;case 35666:return Pv;case 35674:return Dv;case 35675:return Lv;case 35676:return Fv;case 5124:case 35670:return Nv;case 35667:case 35671:return Uv;case 35668:case 35672:return Bv;case 35669:case 35673:return Ov;case 5125:return zv;case 36294:return kv;case 36295:return Vv;case 36296:return Hv;case 35678:case 36198:case 36298:case 36306:case 35682:return Gv;case 35679:case 36299:case 36307:return Wv;case 35680:case 36300:case 36308:case 36293:return Xv;case 36289:case 36303:case 36311:case 36292:return qv}}function Zv(i,e){i.uniform1fv(this.addr,e)}function $v(i,e){let t=is(e,this.size,2);i.uniform2fv(this.addr,t)}function Jv(i,e){let t=is(e,this.size,3);i.uniform3fv(this.addr,t)}function Kv(i,e){let t=is(e,this.size,4);i.uniform4fv(this.addr,t)}function Qv(i,e){let t=is(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function jv(i,e){let t=is(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function e_(i,e){let t=is(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function t_(i,e){i.uniform1iv(this.addr,e)}function n_(i,e){i.uniform2iv(this.addr,e)}function i_(i,e){i.uniform3iv(this.addr,e)}function r_(i,e){i.uniform4iv(this.addr,e)}function s_(i,e){i.uniform1uiv(this.addr,e)}function o_(i,e){i.uniform2uiv(this.addr,e)}function a_(i,e){i.uniform3uiv(this.addr,e)}function l_(i,e){i.uniform4uiv(this.addr,e)}function c_(i,e,t){let n=this.cache,r=e.length,s=Ul(t,r);Kt(n,s)||(i.uniform1iv(this.addr,s),Qt(n,s));let o;this.type===i.SAMPLER_2D_SHADOW?o=ih:o=Ld;for(let a=0;a!==r;++a)t.setTexture2D(e[a]||o,s[a])}function u_(i,e,t){let n=this.cache,r=e.length,s=Ul(t,r);Kt(n,s)||(i.uniform1iv(this.addr,s),Qt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Nd,s[o])}function h_(i,e,t){let n=this.cache,r=e.length,s=Ul(t,r);Kt(n,s)||(i.uniform1iv(this.addr,s),Qt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Ud,s[o])}function f_(i,e,t){let n=this.cache,r=e.length,s=Ul(t,r);Kt(n,s)||(i.uniform1iv(this.addr,s),Qt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Fd,s[o])}function d_(i){switch(i){case 5126:return Zv;case 35664:return $v;case 35665:return Jv;case 35666:return Kv;case 35674:return Qv;case 35675:return jv;case 35676:return e_;case 5124:case 35670:return t_;case 35667:case 35671:return n_;case 35668:case 35672:return i_;case 35669:case 35673:return r_;case 5125:return s_;case 36294:return o_;case 36295:return a_;case 36296:return l_;case 35678:case 36198:case 36298:case 36306:case 35682:return c_;case 35679:case 36299:case 36307:return u_;case 35680:case 36300:case 36308:case 36293:return h_;case 36289:case 36303:case 36311:case 36292:return f_}}var rh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Yv(t.type)}},sh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=d_(t.type)}},oh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},th=/(\w+)(\])?(\[|\.)?/g;function _d(i,e){i.seq.push(e),i.map[e.id]=e}function p_(i,e,t){let n=i.name,r=n.length;for(th.lastIndex=0;;){let s=th.exec(n),o=th.lastIndex,a=s[1],l=s[2]==="]",u=s[3];if(l&&(a=a|0),u===void 0||u==="["&&o+2===r){_d(t,u===void 0?new rh(a,i,e):new sh(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new oh(a),_d(t,h)),t=h}}}var ts=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);p_(a,l,this)}let r=[],s=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(o):s.push(o);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function yd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var m_=37297,g_=0;function x_(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Sd=new je;function v_(i){dt._getMatrix(Sd,dt.workingColorSpace,i);let e=`mat3( ${Sd.elements.map(t=>t.toFixed(4))} )`;switch(dt.getTransfer(i)){case Ns:return[e,"LinearTransferOETF"];case Et:return[e,"sRGBTransferOETF"];default:return We("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function bd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+x_(i.getShaderSource(e),a)}else return s}function __(i,e){let t=v_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var y_={[Du]:"Linear",[to]:"Reinhard",[no]:"Cineon",[io]:"ACESFilmic",[ro]:"AgX",[so]:"Neutral",[Lu]:"Custom"};function S_(i,e){let t=y_[e];return t===void 0?(We("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Pl=new k;function b_(){dt.getLuminanceCoefficients(Pl);let i=Pl.x.toFixed(4),e=Pl.y.toFixed(4),t=Pl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function M_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(_o).join(`
`)}function T_(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function w_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function _o(i){return i!==""}function Md(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Td(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var A_=/^[ \t]*#include +<([\w\d./]+)>/gm;function ah(i){return i.replace(A_,R_)}var E_=new Map;function R_(i,e){let t=at[e];if(t===void 0){let n=E_.get(e);if(n!==void 0)t=at[n],We('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return ah(t)}var C_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function wd(i){return i.replace(C_,I_)}function I_(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Ad(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var P_={[js]:"SHADOWMAP_TYPE_PCF",[$r]:"SHADOWMAP_TYPE_VSM"};function D_(i){return P_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var L_={[Ui]:"ENVMAP_TYPE_CUBE",[cr]:"ENVMAP_TYPE_CUBE",[oo]:"ENVMAP_TYPE_CUBE_UV"};function F_(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":L_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var N_={[cr]:"ENVMAP_MODE_REFRACTION"};function U_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":N_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var B_={[Pu]:"ENVMAP_BLENDING_MULTIPLY",[Gf]:"ENVMAP_BLENDING_MIX",[Wf]:"ENVMAP_BLENDING_ADD"};function O_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":B_[i.combine]||"ENVMAP_BLENDING_NONE"}function z_(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function k_(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=D_(t),u=F_(t),f=U_(t),h=O_(t),c=z_(t),p=M_(t),x=T_(s),M=r.createProgram(),m,g,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(_o).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(_o).join(`
`),g.length>0&&(g+=`
`)):(m=[Ad(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(_o).join(`
`),g=[Ad(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",t.envMap?"#define "+h:"",c?"#define CUBEUV_TEXEL_WIDTH "+c.texelWidth:"",c?"#define CUBEUV_TEXEL_HEIGHT "+c.texelHeight:"",c?"#define CUBEUV_MAX_MIP "+c.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mn?"#define TONE_MAPPING":"",t.toneMapping!==Mn?at.tonemapping_pars_fragment:"",t.toneMapping!==Mn?S_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",at.colorspace_pars_fragment,__("linearToOutputTexel",t.outputColorSpace),b_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(_o).join(`
`)),o=ah(o),o=Md(o,t),o=Td(o,t),a=ah(a),a=Md(a,t),a=Td(a,t),o=wd(o),a=wd(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===ku?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ku?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let A=S+m+o,y=S+g+a,T=yd(r,r.VERTEX_SHADER,A),E=yd(r,r.FRAGMENT_SHADER,y);r.attachShader(M,T),r.attachShader(M,E),t.index0AttributeName!==void 0?r.bindAttribLocation(M,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(M,0,"position"),r.linkProgram(M);function I(N){if(i.debug.checkShaderErrors){let F=r.getProgramInfoLog(M)||"",z=r.getShaderInfoLog(T)||"",U=r.getShaderInfoLog(E)||"",V=F.trim(),q=z.trim(),te=U.trim(),he=!0,Q=!0;if(r.getProgramParameter(M,r.LINK_STATUS)===!1)if(he=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,M,T,E);else{let ie=bd(r,T,"vertex"),le=bd(r,E,"fragment");$e("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(M,r.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+V+`
`+ie+`
`+le)}else V!==""?We("WebGLProgram: Program Info Log:",V):(q===""||te==="")&&(Q=!1);Q&&(N.diagnostics={runnable:he,programLog:V,vertexShader:{log:q,prefix:m},fragmentShader:{log:te,prefix:g}})}r.deleteShader(T),r.deleteShader(E),_=new ts(r,M),R=w_(r,M)}let _;this.getUniforms=function(){return _===void 0&&I(this),_};let R;this.getAttributes=function(){return R===void 0&&I(this),R};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=r.getProgramParameter(M,m_)),P},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=g_++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=T,this.fragmentShader=E,this}var V_=0,lh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ch(e),t.set(e,n)),n}},ch=class{constructor(e){this.id=V_++,this.code=e,this.usedTimes=0}};function H_(i){return i===ln||i===po||i===mo}function G_(i,e,t,n,r,s){let o=new ks,a=new lh,l=new Set,u=[],f=new Map,h=n.logarithmicDepthBuffer,c=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(_){return l.add(_),_===0?"uv":`uv${_}`}function M(_,R,P,N,F,z){let U=N.fog,V=F.geometry,q=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?N.environment:null,te=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,he=e.get(_.envMap||q,te),Q=he&&he.mapping===oo?he.image.height:null,ie=p[_.type];_.precision!==null&&(c=n.getMaxPrecision(_.precision),c!==_.precision&&We("WebGLProgram.getParameters:",_.precision,"not supported, using",c,"instead."));let le=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Re=le!==void 0?le.length:0,ye=0;V.morphAttributes.position!==void 0&&(ye=1),V.morphAttributes.normal!==void 0&&(ye=2),V.morphAttributes.color!==void 0&&(ye=3);let ut,Xe,rt,J;if(ie){let Pt=ri[ie];ut=Pt.vertexShader,Xe=Pt.fragmentShader}else{ut=_.vertexShader,Xe=_.fragmentShader;let Pt=a.getVertexShaderStage(_),yt=a.getFragmentShaderStage(_);a.update(_,Pt,yt),rt=Pt.id,J=yt.id}let ce=i.getRenderTarget(),Ee=i.state.buffers.depth.getReversed(),Ye=F.isInstancedMesh===!0,Ie=F.isBatchedMesh===!0,Ke=!!_.map,zt=!!_.matcap,it=!!he,ht=!!_.aoMap,At=!!_.lightMap,lt=!!_.bumpMap&&_.wireframe===!1,Ut=!!_.normalMap,Wt=!!_.displacementMap,un=!!_.emissiveMap,Bt=!!_.metalnessMap,Ht=!!_.roughnessMap,W=_.anisotropy>0,jt=_.clearcoat>0,gt=_.dispersion>0,O=_.retroreflectivity>0,w=_.iridescence>0,Z=_.sheen>0,K=_.transmission>0,re=W&&!!_.anisotropyMap,_e=jt&&!!_.clearcoatMap,be=jt&&!!_.clearcoatNormalMap,oe=jt&&!!_.clearcoatRoughnessMap,ue=w&&!!_.iridescenceMap,we=w&&!!_.iridescenceThicknessMap,Le=Z&&!!_.sheenColorMap,ve=Z&&!!_.sheenRoughnessMap,Te=!!_.specularMap,Ue=!!_.specularColorMap,Ne=!!_.specularIntensityMap,ze=K&&!!_.transmissionMap,G=K&&!!_.thicknessMap,j=!!_.gradientMap,ae=!!_.alphaMap,Ae=_.alphaTest>0,Pe=!!_.alphaHash,de=!!_.extensions,Ve=Mn;_.toneMapped&&(ce===null||ce.isXRRenderTarget===!0)&&(Ve=i.toneMapping);let Oe={shaderID:ie,shaderType:_.type,shaderName:_.name,vertexShader:ut,fragmentShader:Xe,defines:_.defines,customVertexShaderID:rt,customFragmentShaderID:J,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:c,batching:Ie,batchingColor:Ie&&F._colorsTexture!==null,instancing:Ye,instancingColor:Ye&&F.instanceColor!==null,instancingMorph:Ye&&F.morphTexture!==null,outputColorSpace:ce===null?i.outputColorSpace:ce.isXRRenderTarget===!0?ce.texture.colorSpace:dt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ke,matcap:zt,envMap:it,envMapMode:it&&he.mapping,envMapCubeUVHeight:Q,aoMap:ht,lightMap:At,bumpMap:lt,normalMap:Ut,displacementMap:Wt,emissiveMap:un,normalMapObjectSpace:Ut&&_.normalMapType===Yf,normalMapTangentSpace:Ut&&_.normalMapType===El,packedNormalMap:Ut&&_.normalMapType===El&&H_(_.normalMap.format),metalnessMap:Bt,roughnessMap:Ht,anisotropy:W,anisotropyMap:re,clearcoat:jt,clearcoatMap:_e,clearcoatNormalMap:be,clearcoatRoughnessMap:oe,dispersion:gt,retroreflection:O,iridescence:w,iridescenceMap:ue,iridescenceThicknessMap:we,sheen:Z,sheenColorMap:Le,sheenRoughnessMap:ve,specularMap:Te,specularColorMap:Ue,specularIntensityMap:Ne,transmission:K,transmissionMap:ze,thicknessMap:G,gradientMap:j,opaque:_.transparent===!1&&_.blending===ti&&_.alphaToCoverage===!1,alphaMap:ae,alphaTest:Ae,alphaHash:Pe,combine:_.combine,mapUv:Ke&&x(_.map.channel),aoMapUv:ht&&x(_.aoMap.channel),lightMapUv:At&&x(_.lightMap.channel),bumpMapUv:lt&&x(_.bumpMap.channel),normalMapUv:Ut&&x(_.normalMap.channel),displacementMapUv:Wt&&x(_.displacementMap.channel),emissiveMapUv:un&&x(_.emissiveMap.channel),metalnessMapUv:Bt&&x(_.metalnessMap.channel),roughnessMapUv:Ht&&x(_.roughnessMap.channel),anisotropyMapUv:re&&x(_.anisotropyMap.channel),clearcoatMapUv:_e&&x(_.clearcoatMap.channel),clearcoatNormalMapUv:be&&x(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:oe&&x(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ue&&x(_.iridescenceMap.channel),iridescenceThicknessMapUv:we&&x(_.iridescenceThicknessMap.channel),sheenColorMapUv:Le&&x(_.sheenColorMap.channel),sheenRoughnessMapUv:ve&&x(_.sheenRoughnessMap.channel),specularMapUv:Te&&x(_.specularMap.channel),specularColorMapUv:Ue&&x(_.specularColorMap.channel),specularIntensityMapUv:Ne&&x(_.specularIntensityMap.channel),transmissionMapUv:ze&&x(_.transmissionMap.channel),thicknessMapUv:G&&x(_.thicknessMap.channel),alphaMapUv:ae&&x(_.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Ut||W),vertexNormals:!!V.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!V.attributes.uv&&(Ke||ae),fog:!!U,useFog:_.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||V.attributes.normal===void 0&&Ut===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ee,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Re,morphTextureStride:ye,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ve,decodeVideoTexture:Ke&&_.map.isVideoTexture===!0&&dt.getTransfer(_.map.colorSpace)===Et,decodeVideoTextureEmissive:un&&_.emissiveMap.isVideoTexture===!0&&dt.getTransfer(_.emissiveMap.colorSpace)===Et,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===xn,flipSided:_.side===$t,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:de&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(de&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Oe.vertexUv1s=l.has(1),Oe.vertexUv2s=l.has(2),Oe.vertexUv3s=l.has(3),l.clear(),Oe}function m(_){let R=[];if(_.shaderID?R.push(_.shaderID):(R.push(_.customVertexShaderID),R.push(_.customFragmentShaderID)),_.defines!==void 0)for(let P in _.defines)R.push(P),R.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(g(R,_),S(R,_),R.push(i.outputColorSpace)),R.push(_.customProgramCacheKey),R.join()}function g(_,R){_.push(R.precision),_.push(R.outputColorSpace),_.push(R.envMapMode),_.push(R.envMapCubeUVHeight),_.push(R.mapUv),_.push(R.alphaMapUv),_.push(R.lightMapUv),_.push(R.aoMapUv),_.push(R.bumpMapUv),_.push(R.normalMapUv),_.push(R.displacementMapUv),_.push(R.emissiveMapUv),_.push(R.metalnessMapUv),_.push(R.roughnessMapUv),_.push(R.anisotropyMapUv),_.push(R.clearcoatMapUv),_.push(R.clearcoatNormalMapUv),_.push(R.clearcoatRoughnessMapUv),_.push(R.iridescenceMapUv),_.push(R.iridescenceThicknessMapUv),_.push(R.sheenColorMapUv),_.push(R.sheenRoughnessMapUv),_.push(R.specularMapUv),_.push(R.specularColorMapUv),_.push(R.specularIntensityMapUv),_.push(R.transmissionMapUv),_.push(R.thicknessMapUv),_.push(R.combine),_.push(R.fogExp2),_.push(R.sizeAttenuation),_.push(R.morphTargetsCount),_.push(R.morphAttributeCount),_.push(R.numSunLights),_.push(R.numDirLights),_.push(R.numPointLights),_.push(R.numSpotLights),_.push(R.numSpotLightMaps),_.push(R.numHemiLights),_.push(R.numRectAreaLights),_.push(R.numSunLightShadows),_.push(R.numDirLightShadows),_.push(R.numPointLightShadows),_.push(R.numSpotLightShadows),_.push(R.numSpotLightShadowsWithMaps),_.push(R.numLightProbes),_.push(R.shadowMapType),_.push(R.toneMapping),_.push(R.numClippingPlanes),_.push(R.numClipIntersection),_.push(R.depthPacking)}function S(_,R){o.disableAll(),R.instancing&&o.enable(0),R.instancingColor&&o.enable(1),R.instancingMorph&&o.enable(2),R.matcap&&o.enable(3),R.envMap&&o.enable(4),R.normalMapObjectSpace&&o.enable(5),R.normalMapTangentSpace&&o.enable(6),R.clearcoat&&o.enable(7),R.iridescence&&o.enable(8),R.alphaTest&&o.enable(9),R.vertexColors&&o.enable(10),R.vertexAlphas&&o.enable(11),R.vertexUv1s&&o.enable(12),R.vertexUv2s&&o.enable(13),R.vertexUv3s&&o.enable(14),R.vertexTangents&&o.enable(15),R.anisotropy&&o.enable(16),R.alphaHash&&o.enable(17),R.batching&&o.enable(18),R.dispersion&&o.enable(19),R.retroreflection&&o.enable(24),R.batchingColor&&o.enable(20),R.gradientMap&&o.enable(21),R.packedNormalMap&&o.enable(22),R.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),R.fog&&o.enable(0),R.useFog&&o.enable(1),R.flatShading&&o.enable(2),R.logarithmicDepthBuffer&&o.enable(3),R.reversedDepthBuffer&&o.enable(4),R.skinning&&o.enable(5),R.morphTargets&&o.enable(6),R.morphNormals&&o.enable(7),R.morphColors&&o.enable(8),R.premultipliedAlpha&&o.enable(9),R.shadowMapEnabled&&o.enable(10),R.doubleSided&&o.enable(11),R.flipSided&&o.enable(12),R.useDepthPacking&&o.enable(13),R.dithering&&o.enable(14),R.transmission&&o.enable(15),R.sheen&&o.enable(16),R.opaque&&o.enable(17),R.pointsUvs&&o.enable(18),R.decodeVideoTexture&&o.enable(19),R.decodeVideoTextureEmissive&&o.enable(20),R.alphaToCoverage&&o.enable(21),R.numLightProbeGrids>0&&o.enable(22),R.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function A(_){let R=p[_.type],P;if(R){let N=ri[R];P=ad.clone(N.uniforms)}else P=_.uniforms;return P}function y(_,R){let P=f.get(R);return P!==void 0?++P.usedTimes:(P=new k_(i,R,_,r),u.push(P),f.set(R,P)),P}function T(_){if(--_.usedTimes===0){let R=u.indexOf(_);u[R]=u[u.length-1],u.pop(),f.delete(_.cacheKey),_.destroy()}}function E(_){a.remove(_)}function I(){a.dispose()}return{getParameters:M,getProgramCacheKey:m,getUniforms:A,acquireProgram:y,releaseProgram:T,releaseShaderCache:E,programs:u,dispose:I}}function W_(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function X_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Ed(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Rd(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(c){let p=0;return c.isInstancedMesh&&(p+=2),c.isSkinnedMesh&&(p+=1),p}function a(c,p,x,M,m,g){let S=i[e];return S===void 0?(S={id:c.id,object:c,geometry:p,material:x,materialVariant:o(c),groupOrder:M,renderOrder:c.renderOrder,z:m,group:g},i[e]=S):(S.id=c.id,S.object=c,S.geometry=p,S.material=x,S.materialVariant=o(c),S.groupOrder=M,S.renderOrder=c.renderOrder,S.z=m,S.group=g),e++,S}function l(c,p,x,M,m,g,S){S.reversedDepth===!0&&(m=-m);let A=a(c,p,x,M,m,g);x.transmission>0?n.push(A):x.transparent===!0?r.push(A):t.push(A)}function u(c,p,x,M,m,g){let S=a(c,p,x,M,m,g);x.transmission>0?n.unshift(S):x.transparent===!0?r.unshift(S):t.unshift(S)}function f(c,p){t.length>1&&t.sort(c||X_),n.length>1&&n.sort(p||Ed),r.length>1&&r.sort(p||Ed)}function h(){for(let c=e,p=i.length;c<p;c++){let x=i[c];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:l,unshift:u,finish:h,sort:f}}function q_(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new Rd,i.set(n,[o])):r>=s.length?(o=new Rd,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Y_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new k,color:new Je};break;case"SpotLight":t={position:new k,direction:new k,color:new Je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new Je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new Je,groundColor:new Je};break;case"RectAreaLight":t={color:new Je,position:new k,halfWidth:new k,halfHeight:new k};break}return i[e.id]=t,t}}}function Z_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Be,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var $_=0;function J_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function K_(i){let e=new Y_,t=Z_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)n.probe.push(new k);let r=new k,s=new Ze,o=new Ze;function a(u){let f=0,h=0,c=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let p=0,x=0,M=0,m=0,g=0,S=0,A=0,y=0,T=0,E=0,I=0,_=0,R=0,P=0;u.sort(J_);for(let F=0,z=u.length;F<z;F++){let U=u[F],V=U.color,q=U.intensity,te=U.distance,he=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===ln?he=U.shadow.map.texture:he=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)f+=V.r*q,h+=V.g*q,c+=V.b*q;else if(U.isLightProbe){for(let Q=0;Q<9;Q++)n.probe[Q].addScaledVector(U.sh.coefficients[Q],q);P++}else if(U.isSunLight){let Q=e.get(U);if(Q.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let ie=U.shadow,le=t.get(U);le.shadowIntensity=ie.intensity,le.shadowBias=ie.bias,le.shadowNormalBias=ie.normalBias,le.shadowRadius=ie.radius,le.shadowMapSize.copy(ie.mapSize).multiply(ie.getFrameExtents()),n.sunShadow[x]=le,n.sunShadowMap[x]=he;let Re=ie.getViewportCount();for(let ye=0;ye<Re;ye++)n.sunShadowMatrix[M+ye]=ie.getMatrix(ye),n.sunShadowCascade[M+ye]=ie._cascadeData[ye];M+=Re,x++}n.sun[p]=Q,p++}else if(U.isDirectionalLight){let Q=e.get(U);if(Q.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let ie=U.shadow,le=t.get(U);le.shadowIntensity=ie.intensity,le.shadowBias=ie.bias,le.shadowNormalBias=ie.normalBias,le.shadowRadius=ie.radius,le.shadowMapSize=ie.mapSize,n.directionalShadow[m]=le,n.directionalShadowMap[m]=he,n.directionalShadowMatrix[m]=U.shadow.matrix,T++}n.directional[m]=Q,m++}else if(U.isSpotLight){let Q=e.get(U);Q.position.setFromMatrixPosition(U.matrixWorld),Q.color.copy(V).multiplyScalar(q),Q.distance=te,Q.coneCos=Math.cos(U.angle),Q.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),Q.decay=U.decay,n.spot[S]=Q;let ie=U.shadow;if(U.map&&(n.spotLightMap[_]=U.map,_++,ie.updateMatrices(U),U.castShadow&&R++),n.spotLightMatrix[S]=ie.matrix,U.castShadow){let le=t.get(U);le.shadowIntensity=ie.intensity,le.shadowBias=ie.bias,le.shadowNormalBias=ie.normalBias,le.shadowRadius=ie.radius,le.shadowMapSize=ie.mapSize,n.spotShadow[S]=le,n.spotShadowMap[S]=he,I++}S++}else if(U.isRectAreaLight){let Q=e.get(U);Q.color.copy(V).multiplyScalar(q),Q.halfWidth.set(U.width*.5,0,0),Q.halfHeight.set(0,U.height*.5,0),n.rectArea[A]=Q,A++}else if(U.isPointLight){let Q=e.get(U);if(Q.color.copy(U.color).multiplyScalar(U.intensity),Q.distance=U.distance,Q.decay=U.decay,U.castShadow){let ie=U.shadow,le=t.get(U);le.shadowIntensity=ie.intensity,le.shadowBias=ie.bias,le.shadowNormalBias=ie.normalBias,le.shadowRadius=ie.radius,le.shadowMapSize=ie.mapSize,le.shadowCameraNear=ie.camera.near,le.shadowCameraFar=ie.camera.far,n.pointShadow[g]=le,n.pointShadowMap[g]=he,n.pointShadowMatrix[g]=U.shadow.matrix,E++}n.point[g]=Q,g++}else if(U.isHemisphereLight){let Q=e.get(U);Q.skyColor.copy(U.color).multiplyScalar(q),Q.groundColor.copy(U.groundColor).multiplyScalar(q),n.hemi[y]=Q,y++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ce.LTC_FLOAT_1,n.rectAreaLTC2=Ce.LTC_FLOAT_2):(n.rectAreaLTC1=Ce.LTC_HALF_1,n.rectAreaLTC2=Ce.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=h,n.ambient[2]=c;let N=n.hash;(N.sunLength!==p||N.directionalLength!==m||N.pointLength!==g||N.spotLength!==S||N.rectAreaLength!==A||N.hemiLength!==y||N.numSunShadows!==x||N.numDirectionalShadows!==T||N.numPointShadows!==E||N.numSpotShadows!==I||N.numSpotMaps!==_||N.numLightProbes!==P)&&(n.sun.length=p,n.directional.length=m,n.spot.length=S,n.rectArea.length=A,n.point.length=g,n.hemi.length=y,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=M,n.sunShadowCascade.length=M,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=I,n.spotShadowMap.length=I,n.spotLightMatrix.length=I+_-R,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=P,N.sunLength=p,N.directionalLength=m,N.pointLength=g,N.spotLength=S,N.rectAreaLength=A,N.hemiLength=y,N.numSunShadows=x,N.numDirectionalShadows=T,N.numPointShadows=E,N.numSpotShadows=I,N.numSpotMaps=_,N.numLightProbes=P,n.version=$_++)}function l(u,f){let h=0,c=0,p=0,x=0,M=0,m=0,g=f.matrixWorldInverse;for(let S=0,A=u.length;S<A;S++){let y=u[S];if(y.isSunLight){let T=n.sun[h];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(g),h++}else if(y.isDirectionalLight){let T=n.directional[c];T.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(g),c++}else if(y.isSpotLight){let T=n.spot[x];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(g),T.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(g),x++}else if(y.isRectAreaLight){let T=n.rectArea[M];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(g),o.identity(),s.copy(y.matrixWorld),s.premultiply(g),o.extractRotation(s),T.halfWidth.set(y.width*.5,0,0),T.halfHeight.set(0,y.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),M++}else if(y.isPointLight){let T=n.point[p];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(g),p++}else if(y.isHemisphereLight){let T=n.hemi[m];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(g),m++}}}return{setup:a,setupView:l,state:n}}function Cd(i){let e=new K_(i),t=[],n=[],r=[];function s(c){h.camera=c,t.length=0,n.length=0,r.length=0}function o(c){t.push(c)}function a(c){n.push(c)}function l(c){r.push(c)}function u(){e.setup(t)}function f(c){e.setupView(t,c)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:h,setupLights:u,setupLightsView:f,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function Q_(i){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new Cd(i),e.set(r,[a])):s>=o.length?(a=new Cd(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var j_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ey=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ty=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],ny=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],Id=new Ze,vo=new k,nh=new k;function iy(i,e,t){let n=new Gs,r=new Be,s=new Be,o=new bt,a=new Da,l=new La,u={},f=t.maxTextureSize,h={[bn]:$t,[$t]:bn,[xn]:xn},c=new qt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Be},radius:{value:4}},vertexShader:j_,fragmentShader:ey}),p=c.clone();p.defines.HORIZONTAL_PASS=1;let x=new Lt;x.setAttribute("position",new xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let M=new sn(x,c),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=js;let g=this.type;this.render=function(E,I,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===Tf&&(We("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=js);let R=i.getRenderTarget(),P=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Jt),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let z=g!==this.type;z&&I.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(V=>V.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,V=E.length;U<V;U++){let q=E[U],te=q.shadow;if(te===void 0){We("WebGLShadowMap:",q,"has no shadow.");continue}if(te.autoUpdate===!1&&te.needsUpdate===!1)continue;r.copy(te.mapSize);let he=te.getFrameExtents();r.multiply(he),s.copy(te.mapSize),(r.x>f||r.y>f)&&(r.x>f&&(s.x=Math.floor(f/he.x),r.x=s.x*he.x,te.mapSize.x=s.x),r.y>f&&(s.y=Math.floor(f/he.y),r.y=s.y*he.y,te.mapSize.y=s.y));let Q=i.state.buffers.depth.getReversed();if(te.camera._reversedDepth=Q,te.map===null||z===!0){if(te.map!==null&&(te.map.depthTexture!==null&&(te.map.depthTexture.dispose(),te.map.depthTexture=null),te.map.dispose()),this.type===$r){if(q.isPointLight){We("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}te.map=new Vt(r.x,r.y,{format:ln,type:ct,minFilter:nt,magFilter:nt,generateMipmaps:!1}),te.map.texture.name=q.name+".shadowMap",te.map.depthTexture=new Di(r.x,r.y,et),te.map.depthTexture.name=q.name+".shadowMapDepth",te.map.depthTexture.format=jn,te.map.depthTexture.compareFunction=null,te.map.depthTexture.minFilter=Qe,te.map.depthTexture.magFilter=Qe}else q.isPointLight?(te.map=new Ll(r.x),te.map.depthTexture=new Ia(r.x,an)):(te.map=new Vt(r.x,r.y),te.map.depthTexture=new Di(r.x,r.y,an)),te.map.depthTexture.name=q.name+".shadowMap",te.map.depthTexture.format=jn,this.type===js?(te.map.depthTexture.compareFunction=Q?Cl:Rl,te.map.depthTexture.minFilter=nt,te.map.depthTexture.magFilter=nt):(te.map.depthTexture.compareFunction=null,te.map.depthTexture.minFilter=Qe,te.map.depthTexture.magFilter=Qe);te.camera.updateProjectionMatrix()}te.map.isWebGLCubeRenderTarget!==!0&&(te.map.width!==r.x||te.map.height!==r.y)&&te.map.setSize(r.x,r.y);let ie=te.map.isWebGLCubeRenderTarget?6:te.getViewportCount();q.isPointLight!==!0&&te.updateMatrices(q,_);for(let le=0;le<ie;le++){let Re=te.getCamera(le);if(q.isPointLight){let ye=te.camera,ut=te.matrix,Xe=q.distance||ye.far;Xe!==ye.far&&(ye.far=Xe,ye.updateProjectionMatrix()),vo.setFromMatrixPosition(q.matrixWorld),ye.position.copy(vo),nh.copy(ye.position),nh.add(ty[le]),ye.up.copy(ny[le]),ye.lookAt(nh),ye.updateMatrixWorld(),ut.makeTranslation(-vo.x,-vo.y,-vo.z),Id.multiplyMatrices(ye.projectionMatrix,ye.matrixWorldInverse),te._frustum.setFromProjectionMatrix(Id,ye.coordinateSystem,ye.reversedDepth)}if(te.map.isWebGLCubeRenderTarget)i.setRenderTarget(te.map,le),i.clear();else{le===0&&(i.setRenderTarget(te.map),i.clear());let ye=te.getViewport(le);o.set(s.x*ye.x,s.y*ye.y,s.x*ye.z,s.y*ye.w),F.viewport(o)}n=te.getFrustum(le),y(I,_,Re,q,this.type)}te.isPointLightShadow!==!0&&this.type===$r&&S(te,_),te.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(R,P,N)};function S(E,I){let _=e.update(M);c.defines.VSM_SAMPLES!==E.blurSamples&&(c.defines.VSM_SAMPLES=E.blurSamples,p.defines.VSM_SAMPLES=E.blurSamples,c.needsUpdate=!0,p.needsUpdate=!0),E.mapPass===null?E.mapPass=new Vt(r.x,r.y,{format:ln,type:ct}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),c.uniforms.shadow_pass.value=E.map.depthTexture,c.uniforms.resolution.value.set(E.map.width,E.map.height),c.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(I,null,_,c,M,null),p.uniforms.shadow_pass.value=E.mapPass.texture,p.uniforms.resolution.value.set(E.map.width,E.map.height),p.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(I,null,_,p,M,null)}function A(E,I,_,R){let P=null,N=_.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(N!==void 0)P=N;else if(P=_.isPointLight===!0?l:a,i.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let F=P.uuid,z=I.uuid,U=u[F];U===void 0&&(U={},u[F]=U);let V=U[z];V===void 0&&(V=P.clone(),U[z]=V,I.addEventListener("dispose",T)),P=V}if(P.visible=I.visible,P.wireframe=I.wireframe,R===$r?P.side=I.shadowSide!==null?I.shadowSide:I.side:P.side=I.shadowSide!==null?I.shadowSide:h[I.side],P.alphaMap=I.alphaMap,P.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,P.map=I.map,P.clipShadows=I.clipShadows,P.clippingPlanes=I.clippingPlanes,P.clipIntersection=I.clipIntersection,P.displacementMap=I.displacementMap,P.displacementScale=I.displacementScale,P.displacementBias=I.displacementBias,P.wireframeLinewidth=I.wireframeLinewidth,P.linewidth=I.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let F=i.properties.get(P);F.light=_}return P}function y(E,I,_,R,P){if(E.visible===!1)return;if(E.layers.test(I.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&P===$r)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,E.matrixWorld);let z=e.update(E),U=E.material;if(Array.isArray(U)){let V=z.groups;for(let q=0,te=V.length;q<te;q++){let he=V[q],Q=U[he.materialIndex];if(Q&&Q.visible){let ie=A(E,Q,R,P);E.onBeforeShadow(i,E,I,_,z,ie,he),i.renderBufferDirect(_,null,z,ie,E,he),E.onAfterShadow(i,E,I,_,z,ie,he)}}}else if(U.visible){let V=A(E,U,R,P);E.onBeforeShadow(i,E,I,_,z,V,null),i.renderBufferDirect(_,null,z,V,E,null),E.onAfterShadow(i,E,I,_,z,V,null)}}let F=E.children;for(let z=0,U=F.length;z<U;z++)y(F[z],I,_,R,P)}function T(E){E.target.removeEventListener("dispose",T);for(let _ in u){let R=u[_],P=E.target.uuid;P in R&&(R[P].dispose(),delete R[P])}}}function ry(i,e){function t(){let G=!1,j=new bt,ae=null,Ae=new bt(0,0,0,0);return{setMask:function(Pe){ae!==Pe&&!G&&(i.colorMask(Pe,Pe,Pe,Pe),ae=Pe)},setLocked:function(Pe){G=Pe},setClear:function(Pe,de,Ve,Oe,Pt){Pt===!0&&(Pe*=Oe,de*=Oe,Ve*=Oe),j.set(Pe,de,Ve,Oe),Ae.equals(j)===!1&&(i.clearColor(Pe,de,Ve,Oe),Ae.copy(j))},reset:function(){G=!1,ae=null,Ae.set(-1,0,0,0)}}}function n(){let G=!1,j=!1,ae=null,Ae=null,Pe=null;return{setReversed:function(de){if(j!==de){let Ve=e.get("EXT_clip_control");de?Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.ZERO_TO_ONE_EXT):Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.NEGATIVE_ONE_TO_ONE_EXT),j=de;let Oe=Pe;Pe=null,this.setClear(Oe)}},getReversed:function(){return j},setTest:function(de){de?ce(i.DEPTH_TEST):Ee(i.DEPTH_TEST)},setMask:function(de){ae!==de&&!G&&(i.depthMask(de),ae=de)},setFunc:function(de){if(j&&(de=sd[de]),Ae!==de){switch(de){case xa:i.depthFunc(i.NEVER);break;case va:i.depthFunc(i.ALWAYS);break;case _a:i.depthFunc(i.LESS);break;case Vr:i.depthFunc(i.LEQUAL);break;case ya:i.depthFunc(i.EQUAL);break;case Sa:i.depthFunc(i.GEQUAL);break;case ba:i.depthFunc(i.GREATER);break;case Ma:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Ae=de}},setLocked:function(de){G=de},setClear:function(de){Pe!==de&&(Pe=de,j&&(de=1-de),i.clearDepth(de))},reset:function(){G=!1,ae=null,Ae=null,Pe=null,j=!1}}}function r(){let G=!1,j=null,ae=null,Ae=null,Pe=null,de=null,Ve=null,Oe=null,Pt=null;return{setTest:function(yt){G||(yt?ce(i.STENCIL_TEST):Ee(i.STENCIL_TEST))},setMask:function(yt){j!==yt&&!G&&(i.stencilMask(yt),j=yt)},setFunc:function(yt,In,Un){(ae!==yt||Ae!==In||Pe!==Un)&&(i.stencilFunc(yt,In,Un),ae=yt,Ae=In,Pe=Un)},setOp:function(yt,In,Un){(de!==yt||Ve!==In||Oe!==Un)&&(i.stencilOp(yt,In,Un),de=yt,Ve=In,Oe=Un)},setLocked:function(yt){G=yt},setClear:function(yt){Pt!==yt&&(i.clearStencil(yt),Pt=yt)},reset:function(){G=!1,j=null,ae=null,Ae=null,Pe=null,de=null,Ve=null,Oe=null,Pt=null}}}let s=new t,o=new n,a=new r,l=new WeakMap,u=new WeakMap,f={},h={},c={},p=new WeakMap,x=[],M=null,m=!1,g=null,S=null,A=null,y=null,T=null,E=null,I=null,_=new Je(0,0,0),R=0,P=!1,N=null,F=null,z=null,U=null,V=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,he=0,Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?(he=parseFloat(/^WebGL (\d)/.exec(Q)[1]),te=he>=1):Q.indexOf("OpenGL ES")!==-1&&(he=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),te=he>=2);let ie=null,le={},Re=i.getParameter(i.SCISSOR_BOX),ye=i.getParameter(i.VIEWPORT),ut=new bt().fromArray(Re),Xe=new bt().fromArray(ye);function rt(G,j,ae,Ae){let Pe=new Uint8Array(4),de=i.createTexture();i.bindTexture(G,de),i.texParameteri(G,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(G,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ve=0;Ve<ae;Ve++)G===i.TEXTURE_3D||G===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,Ae,0,i.RGBA,i.UNSIGNED_BYTE,Pe):i.texImage2D(j+Ve,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Pe);return de}let J={};J[i.TEXTURE_2D]=rt(i.TEXTURE_2D,i.TEXTURE_2D,1),J[i.TEXTURE_CUBE_MAP]=rt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[i.TEXTURE_2D_ARRAY]=rt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),J[i.TEXTURE_3D]=rt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ce(i.DEPTH_TEST),o.setFunc(Vr),lt(!1),Ut(Au),ce(i.CULL_FACE),ht(Jt);function ce(G){f[G]!==!0&&(i.enable(G),f[G]=!0)}function Ee(G){f[G]!==!1&&(i.disable(G),f[G]=!1)}function Ye(G,j){return c[G]!==j?(i.bindFramebuffer(G,j),c[G]=j,G===i.DRAW_FRAMEBUFFER&&(c[i.FRAMEBUFFER]=j),G===i.FRAMEBUFFER&&(c[i.DRAW_FRAMEBUFFER]=j),!0):!1}function Ie(G,j){let ae=x,Ae=!1;if(G){ae=p.get(j),ae===void 0&&(ae=[],p.set(j,ae));let Pe=G.textures;if(ae.length!==Pe.length||ae[0]!==i.COLOR_ATTACHMENT0){for(let de=0,Ve=Pe.length;de<Ve;de++)ae[de]=i.COLOR_ATTACHMENT0+de;ae.length=Pe.length,Ae=!0}}else ae[0]!==i.BACK&&(ae[0]=i.BACK,Ae=!0);Ae&&i.drawBuffers(ae)}function Ke(G){return M!==G?(i.useProgram(G),M=G,!0):!1}let zt={[lr]:i.FUNC_ADD,[Af]:i.FUNC_SUBTRACT,[Ef]:i.FUNC_REVERSE_SUBTRACT};zt[Rf]=i.MIN,zt[Cf]=i.MAX;let it={[If]:i.ZERO,[Pf]:i.ONE,[Df]:i.SRC_COLOR,[Cu]:i.SRC_ALPHA,[Of]:i.SRC_ALPHA_SATURATE,[Uf]:i.DST_COLOR,[Ff]:i.DST_ALPHA,[Lf]:i.ONE_MINUS_SRC_COLOR,[Iu]:i.ONE_MINUS_SRC_ALPHA,[Bf]:i.ONE_MINUS_DST_COLOR,[Nf]:i.ONE_MINUS_DST_ALPHA,[zf]:i.CONSTANT_COLOR,[kf]:i.ONE_MINUS_CONSTANT_COLOR,[Vf]:i.CONSTANT_ALPHA,[Hf]:i.ONE_MINUS_CONSTANT_ALPHA};function ht(G,j,ae,Ae,Pe,de,Ve,Oe,Pt,yt){if(G===Jt){m===!0&&(Ee(i.BLEND),m=!1);return}if(m===!1&&(ce(i.BLEND),m=!0),G!==wf){if(G!==g||yt!==P){if((S!==lr||T!==lr)&&(i.blendEquation(i.FUNC_ADD),S=lr,T=lr),yt)switch(G){case ti:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case eo:i.blendFunc(i.ONE,i.ONE);break;case Eu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ru:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:$e("WebGLState: Invalid blending: ",G);break}else switch(G){case ti:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case eo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Eu:$e("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ru:$e("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$e("WebGLState: Invalid blending: ",G);break}A=null,y=null,E=null,I=null,_.set(0,0,0),R=0,g=G,P=yt}return}Pe=Pe||j,de=de||ae,Ve=Ve||Ae,(j!==S||Pe!==T)&&(i.blendEquationSeparate(zt[j],zt[Pe]),S=j,T=Pe),(ae!==A||Ae!==y||de!==E||Ve!==I)&&(i.blendFuncSeparate(it[ae],it[Ae],it[de],it[Ve]),A=ae,y=Ae,E=de,I=Ve),(Oe.equals(_)===!1||Pt!==R)&&(i.blendColor(Oe.r,Oe.g,Oe.b,Pt),_.copy(Oe),R=Pt),g=G,P=!1}function At(G,j){G.side===xn?Ee(i.CULL_FACE):ce(i.CULL_FACE);let ae=G.side===$t;j&&(ae=!ae),lt(ae),G.blending===ti&&G.transparent===!1?ht(Jt):ht(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),o.setFunc(G.depthFunc),o.setTest(G.depthTest),o.setMask(G.depthWrite),s.setMask(G.colorWrite);let Ae=G.stencilWrite;a.setTest(Ae),Ae&&(a.setMask(G.stencilWriteMask),a.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),a.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),un(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?ce(i.SAMPLE_ALPHA_TO_COVERAGE):Ee(i.SAMPLE_ALPHA_TO_COVERAGE)}function lt(G){N!==G&&(G?i.frontFace(i.CW):i.frontFace(i.CCW),N=G)}function Ut(G){G!==bf?(ce(i.CULL_FACE),G!==F&&(G===Au?i.cullFace(i.BACK):G===Mf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ee(i.CULL_FACE),F=G}function Wt(G){G!==z&&(te&&i.lineWidth(G),z=G)}function un(G,j,ae){G?(ce(i.POLYGON_OFFSET_FILL),(U!==j||V!==ae)&&(U=j,V=ae,o.getReversed()&&(j=-j),i.polygonOffset(j,ae))):Ee(i.POLYGON_OFFSET_FILL)}function Bt(G){G?ce(i.SCISSOR_TEST):Ee(i.SCISSOR_TEST)}function Ht(G){G===void 0&&(G=i.TEXTURE0+q-1),ie!==G&&(i.activeTexture(G),ie=G)}function W(G,j,ae){ae===void 0&&(ie===null?ae=i.TEXTURE0+q-1:ae=ie);let Ae=le[ae];Ae===void 0&&(Ae={type:void 0,texture:void 0},le[ae]=Ae),(Ae.type!==G||Ae.texture!==j)&&(ie!==ae&&(i.activeTexture(ae),ie=ae),i.bindTexture(G,j||J[G]),Ae.type=G,Ae.texture=j)}function jt(){let G=le[ie];G!==void 0&&G.type!==void 0&&(i.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function gt(){try{i.compressedTexImage2D(...arguments)}catch(G){$e("WebGLState:",G)}}function O(){try{i.compressedTexImage3D(...arguments)}catch(G){$e("WebGLState:",G)}}function w(){try{i.texSubImage2D(...arguments)}catch(G){$e("WebGLState:",G)}}function Z(){try{i.texSubImage3D(...arguments)}catch(G){$e("WebGLState:",G)}}function K(){try{i.compressedTexSubImage2D(...arguments)}catch(G){$e("WebGLState:",G)}}function re(){try{i.compressedTexSubImage3D(...arguments)}catch(G){$e("WebGLState:",G)}}function _e(){try{i.texStorage2D(...arguments)}catch(G){$e("WebGLState:",G)}}function be(){try{i.texStorage3D(...arguments)}catch(G){$e("WebGLState:",G)}}function oe(){try{i.texImage2D(...arguments)}catch(G){$e("WebGLState:",G)}}function ue(){try{i.texImage3D(...arguments)}catch(G){$e("WebGLState:",G)}}function we(G){return h[G]!==void 0?h[G]:i.getParameter(G)}function Le(G,j){h[G]!==j&&(i.pixelStorei(G,j),h[G]=j)}function ve(G){ut.equals(G)===!1&&(i.scissor(G.x,G.y,G.z,G.w),ut.copy(G))}function Te(G){Xe.equals(G)===!1&&(i.viewport(G.x,G.y,G.z,G.w),Xe.copy(G))}function Ue(G,j){let ae=u.get(j);ae===void 0&&(ae=new WeakMap,u.set(j,ae));let Ae=ae.get(G);Ae===void 0&&(Ae=i.getUniformBlockIndex(j,G.name),ae.set(G,Ae))}function Ne(G,j){let Ae=u.get(j).get(G);l.get(j)!==Ae&&(i.uniformBlockBinding(j,Ae,G.__bindingPointIndex),l.set(j,Ae))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),f={},h={},ie=null,le={},c={},p=new WeakMap,x=[],M=null,m=!1,g=null,S=null,A=null,y=null,T=null,E=null,I=null,_=new Je(0,0,0),R=0,P=!1,N=null,F=null,z=null,U=null,V=null,ut.set(0,0,i.canvas.width,i.canvas.height),Xe.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ce,disable:Ee,bindFramebuffer:Ye,drawBuffers:Ie,useProgram:Ke,setBlending:ht,setMaterial:At,setFlipSided:lt,setCullFace:Ut,setLineWidth:Wt,setPolygonOffset:un,setScissorTest:Bt,activeTexture:Ht,bindTexture:W,unbindTexture:jt,compressedTexImage2D:gt,compressedTexImage3D:O,texImage2D:oe,texImage3D:ue,pixelStorei:Le,getParameter:we,updateUBOMapping:Ue,uniformBlockBinding:Ne,texStorage2D:_e,texStorage3D:be,texSubImage2D:w,texSubImage3D:Z,compressedTexSubImage2D:K,compressedTexSubImage3D:re,scissor:ve,viewport:Te,reset:ze}}function sy(i,e,t,n,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Be,f=new WeakMap,h=new Set,c,p=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(O,w){return x?new OffscreenCanvas(O,w):Bs("canvas")}function m(O,w,Z){let K=1,re=gt(O);if((re.width>Z||re.height>Z)&&(K=Z/Math.max(re.width,re.height)),K<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){let _e=Math.floor(K*re.width),be=Math.floor(K*re.height);c===void 0&&(c=M(_e,be));let oe=w?M(_e,be):c;return oe.width=_e,oe.height=be,oe.getContext("2d").drawImage(O,0,0,_e,be),We("WebGLRenderer: Texture has been resized from ("+re.width+"x"+re.height+") to ("+_e+"x"+be+")."),oe}else return"data"in O&&We("WebGLRenderer: Image in DataTexture is too big ("+re.width+"x"+re.height+")."),O;return O}function g(O){return O.generateMipmaps}function S(O){i.generateMipmap(O)}function A(O){return O.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?i.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(O,w,Z,K,re,_e=!1){if(O!==null){if(i[O]!==void 0)return i[O];We("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let be;K&&(be=e.get("EXT_texture_norm16"),be||We("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let oe=w;if(w===i.RED&&(Z===i.FLOAT&&(oe=i.R32F),Z===i.HALF_FLOAT&&(oe=i.R16F),Z===i.UNSIGNED_BYTE&&(oe=i.R8),Z===i.UNSIGNED_SHORT&&be&&(oe=be.R16_EXT),Z===i.SHORT&&be&&(oe=be.R16_SNORM_EXT)),w===i.RED_INTEGER&&(Z===i.UNSIGNED_BYTE&&(oe=i.R8UI),Z===i.UNSIGNED_SHORT&&(oe=i.R16UI),Z===i.UNSIGNED_INT&&(oe=i.R32UI),Z===i.BYTE&&(oe=i.R8I),Z===i.SHORT&&(oe=i.R16I),Z===i.INT&&(oe=i.R32I)),w===i.RG&&(Z===i.FLOAT&&(oe=i.RG32F),Z===i.HALF_FLOAT&&(oe=i.RG16F),Z===i.UNSIGNED_BYTE&&(oe=i.RG8),Z===i.UNSIGNED_SHORT&&be&&(oe=be.RG16_EXT),Z===i.SHORT&&be&&(oe=be.RG16_SNORM_EXT)),w===i.RG_INTEGER&&(Z===i.UNSIGNED_BYTE&&(oe=i.RG8UI),Z===i.UNSIGNED_SHORT&&(oe=i.RG16UI),Z===i.UNSIGNED_INT&&(oe=i.RG32UI),Z===i.BYTE&&(oe=i.RG8I),Z===i.SHORT&&(oe=i.RG16I),Z===i.INT&&(oe=i.RG32I)),w===i.RGB_INTEGER&&(Z===i.UNSIGNED_BYTE&&(oe=i.RGB8UI),Z===i.UNSIGNED_SHORT&&(oe=i.RGB16UI),Z===i.UNSIGNED_INT&&(oe=i.RGB32UI),Z===i.BYTE&&(oe=i.RGB8I),Z===i.SHORT&&(oe=i.RGB16I),Z===i.INT&&(oe=i.RGB32I)),w===i.RGBA_INTEGER&&(Z===i.UNSIGNED_BYTE&&(oe=i.RGBA8UI),Z===i.UNSIGNED_SHORT&&(oe=i.RGBA16UI),Z===i.UNSIGNED_INT&&(oe=i.RGBA32UI),Z===i.BYTE&&(oe=i.RGBA8I),Z===i.SHORT&&(oe=i.RGBA16I),Z===i.INT&&(oe=i.RGBA32I)),w===i.RGB&&(Z===i.UNSIGNED_SHORT&&be&&(oe=be.RGB16_EXT),Z===i.SHORT&&be&&(oe=be.RGB16_SNORM_EXT),Z===i.UNSIGNED_INT_5_9_9_9_REV&&(oe=i.RGB9_E5),Z===i.UNSIGNED_INT_10F_11F_11F_REV&&(oe=i.R11F_G11F_B10F)),w===i.RGBA){let ue=_e?Ns:dt.getTransfer(re);Z===i.FLOAT&&(oe=i.RGBA32F),Z===i.HALF_FLOAT&&(oe=i.RGBA16F),Z===i.UNSIGNED_BYTE&&(oe=ue===Et?i.SRGB8_ALPHA8:i.RGBA8),Z===i.UNSIGNED_SHORT&&be&&(oe=be.RGBA16_EXT),Z===i.SHORT&&be&&(oe=be.RGBA16_SNORM_EXT),Z===i.UNSIGNED_SHORT_4_4_4_4&&(oe=i.RGBA4),Z===i.UNSIGNED_SHORT_5_5_5_1&&(oe=i.RGB5_A1)}return(oe===i.R16F||oe===i.R32F||oe===i.RG16F||oe===i.RG32F||oe===i.RGBA16F||oe===i.RGBA32F)&&e.get("EXT_color_buffer_float"),oe}function T(O,w){let Z;return O?w===null||w===an||w===Kr?Z=i.DEPTH24_STENCIL8:w===et?Z=i.DEPTH32F_STENCIL8:w===Bi&&(Z=i.DEPTH24_STENCIL8,We("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===an||w===Kr?Z=i.DEPTH_COMPONENT24:w===et?Z=i.DEPTH_COMPONENT32F:w===Bi&&(Z=i.DEPTH_COMPONENT16),Z}function E(O,w){return g(O)===!0||O.isFramebufferTexture&&O.minFilter!==Qe&&O.minFilter!==nt?Math.log2(Math.max(w.width,w.height))+1:O.mipmaps!==void 0&&O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?w.mipmaps.length:1}function I(O){let w=O.target;w.removeEventListener("dispose",I),R(w),w.isVideoTexture&&f.delete(w),w.isHTMLTexture&&h.delete(w)}function _(O){let w=O.target;w.removeEventListener("dispose",_),N(w)}function R(O){let w=n.get(O);if(w.__webglInit===void 0)return;let Z=O.source,K=p.get(Z);if(K){let re=K[w.__cacheKey];re.usedTimes--,re.usedTimes===0&&P(O),Object.keys(K).length===0&&p.delete(Z)}n.remove(O)}function P(O){let w=n.get(O);i.deleteTexture(w.__webglTexture);let Z=O.source,K=p.get(Z);delete K[w.__cacheKey],o.memory.textures--}function N(O){let w=n.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),n.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(w.__webglFramebuffer[K]))for(let re=0;re<w.__webglFramebuffer[K].length;re++)i.deleteFramebuffer(w.__webglFramebuffer[K][re]);else i.deleteFramebuffer(w.__webglFramebuffer[K]);w.__webglDepthbuffer&&i.deleteRenderbuffer(w.__webglDepthbuffer[K])}else{if(Array.isArray(w.__webglFramebuffer))for(let K=0;K<w.__webglFramebuffer.length;K++)i.deleteFramebuffer(w.__webglFramebuffer[K]);else i.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&i.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&i.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let K=0;K<w.__webglColorRenderbuffer.length;K++)w.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(w.__webglColorRenderbuffer[K]);w.__webglDepthRenderbuffer&&i.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let Z=O.textures;for(let K=0,re=Z.length;K<re;K++){let _e=n.get(Z[K]);_e.__webglTexture&&(i.deleteTexture(_e.__webglTexture),o.memory.textures--),n.remove(Z[K])}n.remove(O)}let F=0;function z(){F=0}function U(){return F}function V(O){F=O}function q(){let O=F;return O>=r.maxTextures&&We("WebGLTextures: Trying to use "+(O+1)+" texture units while this GPU supports only "+r.maxTextures),F+=1,O}function te(O){let w=[];return w.push(O.wrapS),w.push(O.wrapT),w.push(O.wrapR||0),w.push(O.magFilter),w.push(O.minFilter),w.push(O.anisotropy),w.push(O.internalFormat),w.push(O.format),w.push(O.type),w.push(O.generateMipmaps),w.push(O.premultiplyAlpha),w.push(O.flipY),w.push(O.unpackAlignment),w.push(O.colorSpace),w.join()}function he(O,w){let Z=n.get(O);if(O.isVideoTexture&&W(O),O.isRenderTargetTexture===!1&&O.isExternalTexture!==!0&&O.version>0&&Z.__version!==O.version){let K=O.image;if(K===null)We("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)We("WebGLRenderer: Texture marked for update but image is incomplete");else{Ee(Z,O,w);return}}else O.isExternalTexture&&(Z.__webglTexture=O.sourceTexture?O.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,Z.__webglTexture,i.TEXTURE0+w)}function Q(O,w){let Z=n.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Z.__version!==O.version){Ee(Z,O,w);return}else O.isExternalTexture&&(Z.__webglTexture=O.sourceTexture?O.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,Z.__webglTexture,i.TEXTURE0+w)}function ie(O,w){let Z=n.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Z.__version!==O.version){Ee(Z,O,w);return}t.bindTexture(i.TEXTURE_3D,Z.__webglTexture,i.TEXTURE0+w)}function le(O,w){let Z=n.get(O);if(O.isCubeDepthTexture!==!0&&O.version>0&&Z.__version!==O.version){Ye(Z,O,w);return}t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture,i.TEXTURE0+w)}let Re={[rn]:i.REPEAT,[Dt]:i.CLAMP_TO_EDGE,[Ta]:i.MIRRORED_REPEAT},ye={[Qe]:i.NEAREST,[Xf]:i.NEAREST_MIPMAP_NEAREST,[ao]:i.NEAREST_MIPMAP_LINEAR,[nt]:i.LINEAR,[Za]:i.LINEAR_MIPMAP_NEAREST,[_i]:i.LINEAR_MIPMAP_LINEAR},ut={[$f]:i.NEVER,[ed]:i.ALWAYS,[Jf]:i.LESS,[Rl]:i.LEQUAL,[Kf]:i.EQUAL,[Cl]:i.GEQUAL,[Qf]:i.GREATER,[jf]:i.NOTEQUAL};function Xe(O,w){if(w.type===et&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===nt||w.magFilter===Za||w.magFilter===ao||w.magFilter===_i||w.minFilter===nt||w.minFilter===Za||w.minFilter===ao||w.minFilter===_i)&&We("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(O,i.TEXTURE_WRAP_S,Re[w.wrapS]),i.texParameteri(O,i.TEXTURE_WRAP_T,Re[w.wrapT]),(O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY)&&i.texParameteri(O,i.TEXTURE_WRAP_R,Re[w.wrapR]),i.texParameteri(O,i.TEXTURE_MAG_FILTER,ye[w.magFilter]),i.texParameteri(O,i.TEXTURE_MIN_FILTER,ye[w.minFilter]),w.compareFunction&&(i.texParameteri(O,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(O,i.TEXTURE_COMPARE_FUNC,ut[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===Qe||w.minFilter!==ao&&w.minFilter!==_i||w.type===et&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){let Z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(O,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function rt(O,w){let Z=!1;O.__webglInit===void 0&&(O.__webglInit=!0,w.addEventListener("dispose",I));let K=w.source,re=p.get(K);re===void 0&&(re={},p.set(K,re));let _e=te(w);if(_e!==O.__cacheKey){re[_e]===void 0&&(re[_e]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,Z=!0),re[_e].usedTimes++;let be=re[O.__cacheKey];be!==void 0&&(re[O.__cacheKey].usedTimes--,be.usedTimes===0&&P(w)),O.__cacheKey=_e,O.__webglTexture=re[_e].texture}return Z}function J(O,w,Z){return Math.floor(Math.floor(O/Z)/w)}function ce(O,w,Z,K){let _e=O.updateRanges;if(_e.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,w.width,w.height,Z,K,w.data);else{_e.sort((Le,ve)=>Le.start-ve.start);let be=0;for(let Le=1;Le<_e.length;Le++){let ve=_e[be],Te=_e[Le],Ue=ve.start+ve.count,Ne=J(Te.start,w.width,4),ze=J(ve.start,w.width,4);Te.start<=Ue+1&&Ne===ze&&J(Te.start+Te.count-1,w.width,4)===Ne?ve.count=Math.max(ve.count,Te.start+Te.count-ve.start):(++be,_e[be]=Te)}_e.length=be+1;let oe=t.getParameter(i.UNPACK_ROW_LENGTH),ue=t.getParameter(i.UNPACK_SKIP_PIXELS),we=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,w.width);for(let Le=0,ve=_e.length;Le<ve;Le++){let Te=_e[Le],Ue=Math.floor(Te.start/4),Ne=Math.ceil(Te.count/4),ze=Ue%w.width,G=Math.floor(Ue/w.width),j=Ne,ae=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(i.UNPACK_SKIP_ROWS,G),t.texSubImage2D(i.TEXTURE_2D,0,ze,G,j,ae,Z,K,w.data)}O.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,oe),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ue),t.pixelStorei(i.UNPACK_SKIP_ROWS,we)}}function Ee(O,w,Z){let K=i.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),w.isData3DTexture&&(K=i.TEXTURE_3D);let re=rt(O,w),_e=w.source;t.bindTexture(K,O.__webglTexture,i.TEXTURE0+Z);let be=n.get(_e);if(_e.version!==be.__version||re===!0){if(t.activeTexture(i.TEXTURE0+Z),(typeof ImageBitmap<"u"&&w.image instanceof ImageBitmap)===!1){let ae=dt.getPrimaries(dt.workingColorSpace),Ae=w.colorSpace===yi?null:dt.getPrimaries(w.colorSpace),Pe=w.colorSpace===yi||ae===Ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe)}t.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment);let ue=m(w.image,!1,r.maxTextureSize);ue=jt(w,ue);let we=s.convert(w.format,w.colorSpace),Le=s.convert(w.type),ve=y(w.internalFormat,we,Le,w.normalized,w.colorSpace,w.isVideoTexture);Xe(K,w);let Te,Ue=w.mipmaps,Ne=w.isVideoTexture!==!0,ze=be.__version===void 0||re===!0,G=_e.dataReady,j=E(w,ue);if(w.isDepthTexture)ve=T(w.format===zi,w.type),ze&&(Ne?t.texStorage2D(i.TEXTURE_2D,1,ve,ue.width,ue.height):t.texImage2D(i.TEXTURE_2D,0,ve,ue.width,ue.height,0,we,Le,null));else if(w.isDataTexture)if(Ue.length>0){Ne&&ze&&t.texStorage2D(i.TEXTURE_2D,j,ve,Ue[0].width,Ue[0].height);for(let ae=0,Ae=Ue.length;ae<Ae;ae++)Te=Ue[ae],Ne?G&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Te.width,Te.height,we,Le,Te.data):t.texImage2D(i.TEXTURE_2D,ae,ve,Te.width,Te.height,0,we,Le,Te.data);w.generateMipmaps=!1}else Ne?(ze&&t.texStorage2D(i.TEXTURE_2D,j,ve,ue.width,ue.height),G&&ce(w,ue,we,Le)):t.texImage2D(i.TEXTURE_2D,0,ve,ue.width,ue.height,0,we,Le,ue.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Ne&&ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,j,ve,Ue[0].width,Ue[0].height,ue.depth);for(let ae=0,Ae=Ue.length;ae<Ae;ae++)if(Te=Ue[ae],w.format!==Ge)if(we!==null)if(Ne){if(G)if(w.layerUpdates.size>0){let Pe=Xu(Te.width,Te.height,w.format,w.type);for(let de of w.layerUpdates){let Ve=Te.data.subarray(de*Pe/Te.data.BYTES_PER_ELEMENT,(de+1)*Pe/Te.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,de,Te.width,Te.height,1,we,Ve)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,Te.width,Te.height,ue.depth,we,Te.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,ve,Te.width,Te.height,ue.depth,0,Te.data,0,0);else We("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ne?G&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,Te.width,Te.height,ue.depth,we,Le,Te.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,ve,Te.width,Te.height,ue.depth,0,we,Le,Te.data);w.layerUpdates.size>0&&w.clearLayerUpdates()}else{Ne&&ze&&t.texStorage2D(i.TEXTURE_2D,j,ve,Ue[0].width,Ue[0].height);for(let ae=0,Ae=Ue.length;ae<Ae;ae++)Te=Ue[ae],w.format!==Ge?we!==null?Ne?G&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,Te.width,Te.height,we,Te.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,ve,Te.width,Te.height,0,Te.data):We("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ne?G&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Te.width,Te.height,we,Le,Te.data):t.texImage2D(i.TEXTURE_2D,ae,ve,Te.width,Te.height,0,we,Le,Te.data)}else if(w.isDataArrayTexture)if(Ne){if(ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,j,ve,ue.width,ue.height,ue.depth),G)if(w.layerUpdates.size>0){let ae=Xu(ue.width,ue.height,w.format,w.type);for(let Ae of w.layerUpdates){let Pe=ue.data.subarray(Ae*ae/ue.data.BYTES_PER_ELEMENT,(Ae+1)*ae/ue.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ae,ue.width,ue.height,1,we,Le,Pe)}w.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ue.width,ue.height,ue.depth,we,Le,ue.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ve,ue.width,ue.height,ue.depth,0,we,Le,ue.data);else if(w.isData3DTexture)Ne?(ze&&t.texStorage3D(i.TEXTURE_3D,j,ve,ue.width,ue.height,ue.depth),G&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ue.width,ue.height,ue.depth,we,Le,ue.data)):t.texImage3D(i.TEXTURE_3D,0,ve,ue.width,ue.height,ue.depth,0,we,Le,ue.data);else if(w.isFramebufferTexture){if(ze)if(Ne)t.texStorage2D(i.TEXTURE_2D,j,ve,ue.width,ue.height);else{let ae=ue.width,Ae=ue.height;for(let Pe=0;Pe<j;Pe++)t.texImage2D(i.TEXTURE_2D,Pe,ve,ae,Ae,0,we,Le,null),ae>>=1,Ae>>=1}}else if(w.isHTMLTexture){if("texElementImage2D"in i){let ae=i.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),ue.parentNode!==ae){ae.appendChild(ue),h.add(w),ae.onpaint=Ae=>{let Pe=Ae.changedElements;for(let de of h)Pe.includes(de.image)&&(de.needsUpdate=!0)},ae.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ue);else{let Pe=i.RGBA,de=i.RGBA,Ve=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Pe,de,Ve,ue)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ue.length>0){if(Ne&&ze){let ae=gt(Ue[0]);t.texStorage2D(i.TEXTURE_2D,j,ve,ae.width,ae.height)}for(let ae=0,Ae=Ue.length;ae<Ae;ae++)Te=Ue[ae],Ne?G&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,we,Le,Te):t.texImage2D(i.TEXTURE_2D,ae,ve,we,Le,Te);w.generateMipmaps=!1}else if(Ne){if(ze){let ae=gt(ue);t.texStorage2D(i.TEXTURE_2D,j,ve,ae.width,ae.height)}G&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,we,Le,ue)}else t.texImage2D(i.TEXTURE_2D,0,ve,we,Le,ue);g(w)&&S(K),be.__version=_e.version,w.onUpdate&&w.onUpdate(w)}O.__version=w.version}function Ye(O,w,Z){if(w.image.length!==6)return;let K=rt(O,w),re=w.source;t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+Z);let _e=n.get(re);if(re.version!==_e.__version||K===!0){t.activeTexture(i.TEXTURE0+Z);let be=dt.getPrimaries(dt.workingColorSpace),oe=w.colorSpace===yi?null:dt.getPrimaries(w.colorSpace),ue=w.colorSpace===yi||be===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ue);let we=w.isCompressedTexture||w.image[0].isCompressedTexture,Le=w.image[0]&&w.image[0].isDataTexture,ve=[];for(let de=0;de<6;de++)!we&&!Le?ve[de]=m(w.image[de],!0,r.maxCubemapSize):ve[de]=Le?w.image[de].image:w.image[de],ve[de]=jt(w,ve[de]);let Te=ve[0],Ue=s.convert(w.format,w.colorSpace),Ne=s.convert(w.type),ze=y(w.internalFormat,Ue,Ne,w.normalized,w.colorSpace),G=w.isVideoTexture!==!0,j=_e.__version===void 0||K===!0,ae=re.dataReady,Ae=E(w,Te);Xe(i.TEXTURE_CUBE_MAP,w);let Pe;if(we){G&&j&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ae,ze,Te.width,Te.height);for(let de=0;de<6;de++){Pe=ve[de].mipmaps;for(let Ve=0;Ve<Pe.length;Ve++){let Oe=Pe[Ve];w.format!==Ge?Ue!==null?G?ae&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,0,0,Oe.width,Oe.height,Ue,Oe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,ze,Oe.width,Oe.height,0,Oe.data):We("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):G?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,0,0,Oe.width,Oe.height,Ue,Ne,Oe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve,ze,Oe.width,Oe.height,0,Ue,Ne,Oe.data)}}}else{if(Pe=w.mipmaps,G&&j){Pe.length>0&&Ae++;let de=gt(ve[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ae,ze,de.width,de.height)}for(let de=0;de<6;de++)if(Le){G?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,ve[de].width,ve[de].height,Ue,Ne,ve[de].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ze,ve[de].width,ve[de].height,0,Ue,Ne,ve[de].data);for(let Ve=0;Ve<Pe.length;Ve++){let Pt=Pe[Ve].image[de].image;G?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,0,0,Pt.width,Pt.height,Ue,Ne,Pt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,ze,Pt.width,Pt.height,0,Ue,Ne,Pt.data)}}else{G?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,Ue,Ne,ve[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ze,Ue,Ne,ve[de]);for(let Ve=0;Ve<Pe.length;Ve++){let Oe=Pe[Ve];G?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,0,0,Ue,Ne,Oe.image[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,Ve+1,ze,Ue,Ne,Oe.image[de])}}}g(w)&&S(i.TEXTURE_CUBE_MAP),_e.__version=re.version,w.onUpdate&&w.onUpdate(w)}O.__version=w.version}function Ie(O,w,Z,K,re,_e){let be=s.convert(Z.format,Z.colorSpace),oe=s.convert(Z.type),ue=y(Z.internalFormat,be,oe,Z.normalized,Z.colorSpace),we=n.get(w),Le=n.get(Z);if(Le.__renderTarget=w,!we.__hasExternalTextures){let ve=Math.max(1,w.width>>_e),Te=Math.max(1,w.height>>_e);re===i.TEXTURE_3D||re===i.TEXTURE_2D_ARRAY?t.texImage3D(re,_e,ue,ve,Te,w.depth,0,be,oe,null):t.texImage2D(re,_e,ue,ve,Te,0,be,oe,null)}t.bindFramebuffer(i.FRAMEBUFFER,O),Ht(w)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,re,Le.__webglTexture,0,Bt(w)):(re===i.TEXTURE_2D||re>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,re,Le.__webglTexture,_e),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ke(O,w,Z){if(i.bindRenderbuffer(i.RENDERBUFFER,O),w.depthBuffer){let K=w.depthTexture,re=K&&K.isDepthTexture?K.type:null,_e=T(w.stencilBuffer,re),be=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ht(w)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Bt(w),_e,w.width,w.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Bt(w),_e,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,_e,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,O)}else{let K=w.textures;for(let re=0;re<K.length;re++){let _e=K[re],be=s.convert(_e.format,_e.colorSpace),oe=s.convert(_e.type),ue=y(_e.internalFormat,be,oe,_e.normalized,_e.colorSpace);Ht(w)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Bt(w),ue,w.width,w.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Bt(w),ue,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,ue,w.width,w.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function zt(O,w,Z){let K=w.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,O),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let re=n.get(w.depthTexture);if(re.__renderTarget=w,(!re.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),K){if(re.__webglInit===void 0&&(re.__webglInit=!0,w.depthTexture.addEventListener("dispose",I)),re.__webglTexture===void 0){re.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),Xe(i.TEXTURE_CUBE_MAP,w.depthTexture);let we=s.convert(w.depthTexture.format),Le=s.convert(w.depthTexture.type),ve;w.depthTexture.format===jn?ve=i.DEPTH_COMPONENT24:w.depthTexture.format===zi&&(ve=i.DEPTH24_STENCIL8);for(let Te=0;Te<6;Te++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,ve,w.width,w.height,0,we,Le,null)}}else he(w.depthTexture,0);let _e=re.__webglTexture,be=Bt(w),oe=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+Z:i.TEXTURE_2D,ue=w.depthTexture.format===zi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(w.depthTexture.format===jn)Ht(w)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,oe,_e,0,be):i.framebufferTexture2D(i.FRAMEBUFFER,ue,oe,_e,0);else if(w.depthTexture.format===zi)Ht(w)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ue,oe,_e,0,be):i.framebufferTexture2D(i.FRAMEBUFFER,ue,oe,_e,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function it(O){let w=n.get(O),Z=O.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==O.depthTexture){let K=O.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),K){let re=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,K.removeEventListener("dispose",re)};K.addEventListener("dispose",re),w.__depthDisposeCallback=re}w.__boundDepthTexture=K}if(O.depthTexture&&!w.__autoAllocateDepthBuffer)if(Z)for(let K=0;K<6;K++)zt(w.__webglFramebuffer[K],O,K);else{let K=O.texture.mipmaps;K&&K.length>0?zt(w.__webglFramebuffer[0],O,0):zt(w.__webglFramebuffer,O,0)}else if(Z){w.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer[K]),w.__webglDepthbuffer[K]===void 0)w.__webglDepthbuffer[K]=i.createRenderbuffer(),Ke(w.__webglDepthbuffer[K],O,!1);else{let re=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_e=w.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,_e),i.framebufferRenderbuffer(i.FRAMEBUFFER,re,i.RENDERBUFFER,_e)}}else{let K=O.texture.mipmaps;if(K&&K.length>0?t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=i.createRenderbuffer(),Ke(w.__webglDepthbuffer,O,!1);else{let re=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_e=w.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,_e),i.framebufferRenderbuffer(i.FRAMEBUFFER,re,i.RENDERBUFFER,_e)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ht(O,w,Z){let K=n.get(O);w!==void 0&&Ie(K.__webglFramebuffer,O,O.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),Z!==void 0&&it(O)}function At(O){let w=O.texture,Z=n.get(O),K=n.get(w);O.addEventListener("dispose",_);let re=O.textures,_e=O.isWebGLCubeRenderTarget===!0,be=re.length>1;if(be||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=w.version,o.memory.textures++),_e){Z.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(w.mipmaps&&w.mipmaps.length>0){Z.__webglFramebuffer[oe]=[];for(let ue=0;ue<w.mipmaps.length;ue++)Z.__webglFramebuffer[oe][ue]=i.createFramebuffer()}else Z.__webglFramebuffer[oe]=i.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){Z.__webglFramebuffer=[];for(let oe=0;oe<w.mipmaps.length;oe++)Z.__webglFramebuffer[oe]=i.createFramebuffer()}else Z.__webglFramebuffer=i.createFramebuffer();if(be)for(let oe=0,ue=re.length;oe<ue;oe++){let we=n.get(re[oe]);we.__webglTexture===void 0&&(we.__webglTexture=i.createTexture(),o.memory.textures++)}if(O.samples>0&&Ht(O)===!1){Z.__webglMultisampledFramebuffer=i.createFramebuffer(),Z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let oe=0;oe<re.length;oe++){let ue=re[oe];Z.__webglColorRenderbuffer[oe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,Z.__webglColorRenderbuffer[oe]);let we=s.convert(ue.format,ue.colorSpace),Le=s.convert(ue.type),ve=y(ue.internalFormat,we,Le,ue.normalized,ue.colorSpace,O.isXRRenderTarget===!0),Te=Bt(O);i.renderbufferStorageMultisample(i.RENDERBUFFER,Te,ve,O.width,O.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+oe,i.RENDERBUFFER,Z.__webglColorRenderbuffer[oe])}i.bindRenderbuffer(i.RENDERBUFFER,null),O.depthBuffer&&(Z.__webglDepthRenderbuffer=i.createRenderbuffer(),Ke(Z.__webglDepthRenderbuffer,O,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(_e){t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),Xe(i.TEXTURE_CUBE_MAP,w);for(let oe=0;oe<6;oe++)if(w.mipmaps&&w.mipmaps.length>0)for(let ue=0;ue<w.mipmaps.length;ue++)Ie(Z.__webglFramebuffer[oe][ue],O,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ue);else Ie(Z.__webglFramebuffer[oe],O,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);g(w)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let oe=0,ue=re.length;oe<ue;oe++){let we=re[oe],Le=n.get(we),ve=i.TEXTURE_2D;(O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(ve=O.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ve,Le.__webglTexture),Xe(ve,we),Ie(Z.__webglFramebuffer,O,we,i.COLOR_ATTACHMENT0+oe,ve,0),g(we)&&S(ve)}t.unbindTexture()}else{let oe=i.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(oe=O.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(oe,K.__webglTexture),Xe(oe,w),w.mipmaps&&w.mipmaps.length>0)for(let ue=0;ue<w.mipmaps.length;ue++)Ie(Z.__webglFramebuffer[ue],O,w,i.COLOR_ATTACHMENT0,oe,ue);else Ie(Z.__webglFramebuffer,O,w,i.COLOR_ATTACHMENT0,oe,0);g(w)&&S(oe),t.unbindTexture()}O.depthBuffer&&it(O)}function lt(O){let w=O.textures;for(let Z=0,K=w.length;Z<K;Z++){let re=w[Z];if(g(re)){let _e=A(O),be=n.get(re).__webglTexture;t.bindTexture(_e,be),S(_e),t.unbindTexture()}}}let Ut=[],Wt=[];function un(O){if(O.samples>0){if(Ht(O)===!1){let w=O.textures,Z=O.width,K=O.height,re=i.COLOR_BUFFER_BIT,_e=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(O),oe=w.length>1;if(oe)for(let we=0;we<w.length;we++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+we,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+we,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer);let ue=O.texture.mipmaps;ue&&ue.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let we=0;we<w.length;we++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(re|=i.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(re|=i.STENCIL_BUFFER_BIT)),oe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[we]);let Le=n.get(w[we]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Le,0)}i.blitFramebuffer(0,0,Z,K,0,0,Z,K,re,i.NEAREST),l===!0&&(Ut.length=0,Wt.length=0,Ut.push(i.COLOR_ATTACHMENT0+we),O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&(Ut.push(_e),Wt.push(_e),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Wt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ut))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),oe)for(let we=0;we<w.length;we++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+we,i.RENDERBUFFER,be.__webglColorRenderbuffer[we]);let Le=n.get(w[we]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+we,i.TEXTURE_2D,Le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&l){let w=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[w])}}}function Bt(O){return Math.min(r.maxSamples,O.samples)}function Ht(O){let w=n.get(O);return O.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function W(O){let w=o.render.frame;f.get(O)!==w&&(f.set(O,w),O.update())}function jt(O,w){let Z=O.colorSpace,K=O.format,re=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||Z!==fn&&Z!==yi&&(dt.getTransfer(Z)===Et?(K!==Ge||re!==on)&&We("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):$e("WebGLTextures: Unsupported texture color space:",Z)),w}function gt(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(u.width=O.naturalWidth||O.width,u.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(u.width=O.displayWidth,u.height=O.displayHeight):(u.width=O.width,u.height=O.height),u}this.allocateTextureUnit=q,this.resetTextureUnits=z,this.getTextureUnits=U,this.setTextureUnits=V,this.setTexture2D=he,this.setTexture2DArray=Q,this.setTexture3D=ie,this.setTextureCube=le,this.rebindTextures=ht,this.setupRenderTarget=At,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=un,this.setupDepthRenderbuffer=it,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=Ht,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function oy(i,e){function t(n,r=yi){let s,o=dt.getTransfer(r);if(n===on)return i.UNSIGNED_BYTE;if(n===$a)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ja)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Uu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Bu)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Jr)return i.BYTE;if(n===lo)return i.SHORT;if(n===Bi)return i.UNSIGNED_SHORT;if(n===Oi)return i.INT;if(n===an)return i.UNSIGNED_INT;if(n===et)return i.FLOAT;if(n===ct)return i.HALF_FLOAT;if(n===Ou)return i.ALPHA;if(n===zu)return i.RGB;if(n===Ge)return i.RGBA;if(n===jn)return i.DEPTH_COMPONENT;if(n===zi)return i.DEPTH_STENCIL;if(n===Tn)return i.RED;if(n===Qr)return i.RED_INTEGER;if(n===ln)return i.RG;if(n===ki)return i.RG_INTEGER;if(n===Vi)return i.RGBA_INTEGER;if(n===co||n===uo||n===ho||n===fo)if(o===Et)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===co)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===uo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ho)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===fo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===co)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===uo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ho)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===fo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ka||n===Qa||n===ja||n===el)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Ka)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Qa)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ja)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===el)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===tl||n===nl||n===il||n===rl||n===sl||n===po||n===ol)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===tl||n===nl)return o===Et?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===il)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===rl)return s.COMPRESSED_R11_EAC;if(n===sl)return s.COMPRESSED_SIGNED_R11_EAC;if(n===po)return s.COMPRESSED_RG11_EAC;if(n===ol)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===al||n===ll||n===cl||n===ul||n===hl||n===fl||n===dl||n===pl||n===ml||n===gl||n===xl||n===vl||n===_l||n===yl)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===al)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ll)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===cl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ul)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===hl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===fl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===dl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===pl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ml)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===gl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===xl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===vl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===_l)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===yl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Sl||n===bl||n===Ml)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Sl)return o===Et?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===bl)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ml)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Tl||n===wl||n===mo||n===Al)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Tl)return s.COMPRESSED_RED_RGTC1_EXT;if(n===wl)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===mo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Al)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Kr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var ay=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ly=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,uh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Xs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new qt({vertexShader:ay,fragmentShader:ly,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new sn(new sr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},hh=class extends ei{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,u=null,f=null,h=null,c=null,p=null,x=null,M=typeof XRWebGLBinding<"u",m=new uh,g={},S=t.getContextAttributes(),A=null,y=null,T=[],E=[],I=new Be,_=null,R=null,P=new nn;P.viewport=new bt;let N=new nn;N.viewport=new bt;let F=[P,N],z=new Xa,U=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ce=T[J];return ce===void 0&&(ce=new Gr,T[J]=ce),ce.getTargetRaySpace()},this.getControllerGrip=function(J){let ce=T[J];return ce===void 0&&(ce=new Gr,T[J]=ce),ce.getGripSpace()},this.getHand=function(J){let ce=T[J];return ce===void 0&&(ce=new Gr,T[J]=ce),ce.getHandSpace()};function q(J){let ce=E.indexOf(J.inputSource);if(ce===-1)return;let Ee=T[ce];Ee!==void 0&&(Ee.update(J.inputSource,J.frame,u||o),Ee.dispatchEvent({type:J.type,data:J.inputSource}))}function te(){r.removeEventListener("select",q),r.removeEventListener("selectstart",q),r.removeEventListener("selectend",q),r.removeEventListener("squeeze",q),r.removeEventListener("squeezestart",q),r.removeEventListener("squeezeend",q),r.removeEventListener("end",te),r.removeEventListener("inputsourceschange",he);for(let J=0;J<T.length;J++){let ce=E[J];ce!==null&&(E[J]=null,T[J].disconnect(ce))}U=null,V=null,m.reset();for(let J in g)delete g[J];if(e.setRenderTarget(A),p=null,c=null,h=null,r=null,y=null,rt.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(I.width,I.height,!1),R!==null){let J=R.camera;J.fov=R.fov,J.zoom=R.zoom,J.updateProjectionMatrix(),R=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){s=J,n.isPresenting===!0&&We("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,n.isPresenting===!0&&We("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(J){u=J},this.getBaseLayer=function(){return c!==null?c:p},this.getBinding=function(){return h===null&&M&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return x},this.getSession=function(){return r},this.setSession=async function(J){if(r=J,r!==null){if(A=e.getRenderTarget(),r.addEventListener("select",q),r.addEventListener("selectstart",q),r.addEventListener("selectend",q),r.addEventListener("squeeze",q),r.addEventListener("squeezestart",q),r.addEventListener("squeezeend",q),r.addEventListener("end",te),r.addEventListener("inputsourceschange",he),S.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(I),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ee=null,Ye=null,Ie=null;S.depth&&(Ie=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ee=S.stencil?zi:jn,Ye=S.stencil?Kr:an);let Ke={colorFormat:t.RGBA8,depthFormat:Ie,scaleFactor:s};h=this.getBinding(),c=h.createProjectionLayer(Ke),r.updateRenderState({layers:[c]}),e.setPixelRatio(1),e.setSize(c.textureWidth,c.textureHeight,!1),y=new Vt(c.textureWidth,c.textureHeight,{format:Ge,type:on,depthTexture:new Di(c.textureWidth,c.textureHeight,Ye,void 0,void 0,void 0,void 0,void 0,void 0,Ee),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1,resolveStencilBuffer:c.ignoreDepthValues===!1,storeMultisampledDepthBuffer:c.ignoreDepthValues===!1,storeMultisampledStencilBuffer:c.ignoreDepthValues===!1})}else{let Ee={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,Ee),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new Vt(p.framebufferWidth,p.framebufferHeight,{format:Ge,type:on,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await r.requestReferenceSpace(a),rt.setContext(r),rt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function he(J){for(let ce=0;ce<J.removed.length;ce++){let Ee=J.removed[ce],Ye=E.indexOf(Ee);Ye>=0&&(E[Ye]=null,T[Ye].disconnect(Ee))}for(let ce=0;ce<J.added.length;ce++){let Ee=J.added[ce],Ye=E.indexOf(Ee);if(Ye===-1){for(let Ke=0;Ke<T.length;Ke++)if(Ke>=E.length){E.push(Ee),Ye=Ke;break}else if(E[Ke]===null){E[Ke]=Ee,Ye=Ke;break}if(Ye===-1)break}let Ie=T[Ye];Ie&&Ie.connect(Ee)}}let Q=new k,ie=new k;function le(J,ce,Ee){Q.setFromMatrixPosition(ce.matrixWorld),ie.setFromMatrixPosition(Ee.matrixWorld);let Ye=Q.distanceTo(ie),Ie=ce.projectionMatrix.elements,Ke=Ee.projectionMatrix.elements,zt=Ie[14]/(Ie[10]-1),it=Ie[14]/(Ie[10]+1),ht=(Ie[9]+1)/Ie[5],At=(Ie[9]-1)/Ie[5],lt=(Ie[8]-1)/Ie[0],Ut=(Ke[8]+1)/Ke[0],Wt=zt*lt,un=zt*Ut,Bt=Ye/(-lt+Ut),Ht=Bt*-lt;if(ce.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(Ht),J.translateZ(Bt),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Ie[10]===-1)J.projectionMatrix.copy(ce.projectionMatrix),J.projectionMatrixInverse.copy(ce.projectionMatrixInverse);else{let W=zt+Bt,jt=it+Bt,gt=Wt-Ht,O=un+(Ye-Ht),w=ht*it/jt*W,Z=At*it/jt*W;J.projectionMatrix.makePerspective(gt,O,w,Z,W,jt),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Re(J,ce){ce===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ce.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(r===null)return;let ce=J.near,Ee=J.far;m.texture!==null&&(m.depthNear>0&&(ce=m.depthNear),m.depthFar>0&&(Ee=m.depthFar)),z.near=N.near=P.near=ce,z.far=N.far=P.far=Ee,(U!==z.near||V!==z.far)&&(r.updateRenderState({depthNear:z.near,depthFar:z.far}),U=z.near,V=z.far),z.layers.mask=J.layers.mask|6,P.layers.mask=z.layers.mask&-5,N.layers.mask=z.layers.mask&-3;let Ye=J.parent,Ie=z.cameras;Re(z,Ye);for(let Ke=0;Ke<Ie.length;Ke++)Re(Ie[Ke],Ye);Ie.length===2?le(z,P,N):z.projectionMatrix.copy(P.projectionMatrix),R===null&&J.isPerspectiveCamera&&(R={camera:J,fov:J.fov,zoom:J.zoom}),ye(J,z,Ye)};function ye(J,ce,Ee){Ee===null?J.matrix.copy(ce.matrixWorld):(J.matrix.copy(Ee.matrixWorld),J.matrix.invert(),J.matrix.multiply(ce.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ce.projectionMatrix),J.projectionMatrixInverse.copy(ce.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Aa*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(c===null&&p===null))return l},this.setFoveation=function(J){l=J,c!==null&&(c.fixedFoveation=J),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function(J){return g[J]};let ut=null;function Xe(J,ce){if(f=ce.getViewerPose(u||o),x=ce,f!==null){let Ee=f.views;p!==null&&(e.setRenderTargetFramebuffer(y,p.framebuffer),e.setRenderTarget(y));let Ye=!1;Ee.length!==z.cameras.length&&(z.cameras.length=0,Ye=!0);for(let it=0;it<Ee.length;it++){let ht=Ee[it],At=null;if(p!==null)At=p.getViewport(ht);else{let Ut=h.getViewSubImage(c,ht);At=Ut.viewport,it===0&&(e.setRenderTargetTextures(y,Ut.colorTexture,Ut.depthStencilTexture),e.setRenderTarget(y))}let lt=F[it];lt===void 0&&(lt=new nn,lt.layers.enable(it),lt.viewport=new bt,F[it]=lt),lt.matrix.fromArray(ht.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(ht.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(At.x,At.y,At.width,At.height),it===0&&(z.matrix.copy(lt.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Ye===!0&&z.cameras.push(lt)}let Ie=r.enabledFeatures;if(Ie&&Ie.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&M){h=n.getBinding();let it=h.getDepthInformation(Ee[0]);it&&it.isValid&&it.texture&&m.init(it,r.renderState)}if(Ie&&Ie.includes("camera-access")&&M){e.state.unbindTexture(),h=n.getBinding();for(let it=0;it<Ee.length;it++){let ht=Ee[it].camera;if(ht){let At=g[ht];At||(At=new Xs,g[ht]=At);let lt=h.getCameraImage(ht);At.sourceTexture=lt}}}}for(let Ee=0;Ee<T.length;Ee++){let Ye=E[Ee],Ie=T[Ee];Ye!==null&&Ie!==void 0&&Ie.update(Ye,ce,u||o)}ut&&ut(J,ce),ce.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ce}),x=null}let rt=new Pd;rt.setAnimationLoop(Xe),this.setAnimationLoop=function(J){ut=J},this.dispose=function(){}}},cy=new Ze,Bd=new je;Bd.set(-1,0,0,0,1,0,0,0,1);function uy(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,Hu(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function r(m,g,S,A,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?s(m,g):g.isMeshLambertMaterial?(s(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(s(m,g),h(m,g)):g.isMeshPhongMaterial?(s(m,g),f(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(s(m,g),c(m,g),g.isMeshPhysicalMaterial&&p(m,g,y)):g.isMeshMatcapMaterial?(s(m,g),x(m,g)):g.isMeshDepthMaterial?s(m,g):g.isMeshDistanceMaterial?(s(m,g),M(m,g)):g.isMeshNormalMaterial?s(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?l(m,g,S,A):g.isSpriteMaterial?u(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===$t&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===$t&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let S=e.get(g),A=S.envMap,y=S.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(cy.makeRotationFromEuler(y)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Bd),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,S,A){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*S,m.scale.value=A*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function f(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function c(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function p(m,g,S){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===$t&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,g){g.matcap&&(m.matcap.value=g.matcap)}function M(m,g){let S=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function hy(i,e,t,n){let r={},s={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,T){let E=T.program;n.uniformBlockBinding(y,E)}function u(y,T){let E=r[y.id];E===void 0&&(m(y),E=f(y),r[y.id]=E,y.addEventListener("dispose",S));let I=T.program;n.updateUBOMapping(y,I);let _=e.render.frame;s[y.id]!==_&&(c(y),s[y.id]=_)}function f(y){let T=h();y.__bindingPointIndex=T;let E=i.createBuffer(),I=y.__size,_=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,I,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,E),E}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return $e("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function c(y){let T=r[y.id],E=y.uniforms,I=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,R=E.length;_<R;_++){let P=E[_];if(Array.isArray(P))for(let N=0,F=P.length;N<F;N++)p(P[N],_,N,I);else p(P,_,0,I)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(y,T,E,I){if(M(y,T,E,I)===!0){let _=y.__offset,R=y.value;if(Array.isArray(R)){let P=0;for(let N=0;N<R.length;N++){let F=R[N],z=g(F);x(F,y.__data,P),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(P+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(R,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,y.__data)}}function x(y,T,E){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,E)}function M(y,T,E,I){let _=y.value,R=T+"_"+E;if(I[R]===void 0)return typeof _=="number"||typeof _=="boolean"?I[R]=_:ArrayBuffer.isView(_)?I[R]=_.slice():I[R]=_.clone(),!0;{let P=I[R];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return I[R]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(y){let T=y.uniforms,E=0,I=16;for(let R=0,P=T.length;R<P;R++){let N=Array.isArray(T[R])?T[R]:[T[R]];for(let F=0,z=N.length;F<z;F++){let U=N[F],V=Array.isArray(U.value)?U.value:[U.value];for(let q=0,te=V.length;q<te;q++){let he=V[q],Q=g(he),ie=E%I,le=ie%Q.boundary,Re=ie+le;E+=le,Re!==0&&I-Re<Q.storage&&(E+=I-Re),U.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=E,E+=Q.storage}}}let _=E%I;return _>0&&(E+=I-_),y.__size=E,y.__cache={},this}function g(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?We("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):We("WebGLRenderer: Unsupported uniform value type.",y),T}function S(y){let T=y.target;T.removeEventListener("dispose",S);let E=o.indexOf(T.__bindingPointIndex);o.splice(E,1),i.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function A(){for(let y in r)i.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:u,dispose:A}}var fy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ii=null;function dy(){return ii===null&&(ii=new It(fy,16,16,ln,ct),ii.name="DFG_LUT",ii.minFilter=nt,ii.magFilter=nt,ii.wrapS=Dt,ii.wrapT=Dt,ii.generateMipmaps=!1,ii.needsUpdate=!0),ii}var Fl=class{constructor(e={}){let{canvas:t=nd(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:c=!1,outputBufferType:p=on}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=o;let M=p,m=new Set([Vi,ki,Qr]),g=new Set([on,an,Bi,Kr,$a,Ja]),S=new Uint32Array(4),A=new Int32Array(4),y=new k,T=null,E=null,I=[],_=[],R=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Mn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,N=!1,F=null,z=null,U=null,V=null;this._outputColorSpace=_n;let q=0,te=0,he=null,Q=-1,ie=null,le=new bt,Re=new bt,ye=null,ut=new Je(0),Xe=0,rt=t.width,J=t.height,ce=1,Ee=null,Ye=null,Ie=new bt(0,0,rt,J),Ke=new bt(0,0,rt,J),zt=!1,it=new Gs,ht=!1,At=!1,lt=new Ze,Ut=new k,Wt=new bt,un={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Bt=!1;function Ht(){return he===null?ce:1}let W=n;function jt(d,b){return t.getContext(d,b)}let gt,O,w,Z,K,re,_e,be,oe,ue,we,Le,ve,Te,Ue,Ne,ze,G,j,ae,Ae,Pe,de;try{let d={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:f,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Pt,!1),t.addEventListener("webglcontextrestored",yt,!1),t.addEventListener("webglcontextcreationerror",In,!1),W===null){let b="webgl2";if(W=jt(b,d),W===null)throw jt(b)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ve()}catch(d){throw t.removeEventListener("webglcontextlost",Pt,!1),t.removeEventListener("webglcontextrestored",yt,!1),t.removeEventListener("webglcontextcreationerror",In,!1),$e("WebGLRenderer: "+d.message),d}function Ve(){gt=new yv(W),gt.init(),Ae=new oy(W,gt),O=new uv(W,gt,e,Ae),w=new ry(W,gt),O.reversedDepthBuffer&&c&&w.buffers.depth.setReversed(!0),z=W.createFramebuffer(),U=W.createFramebuffer(),V=W.createFramebuffer(),Z=new Mv(W),K=new W_,re=new sy(W,gt,w,K,O,Ae,Z),_e=new _v(P),be=new wg(W),Pe=new lv(W,be),oe=new Sv(W,be,Z,Pe),ue=new wv(W,oe,be,Pe,Z),G=new Tv(W,O,re),Ue=new hv(K),we=new G_(P,_e,gt,O,Pe,Ue),Le=new uy(P,K),ve=new q_,Te=new Q_(gt),ze=new av(P,_e,w,ue,x,l),Ne=new iy(P,ue,O),de=new hy(W,Z,O,w),j=new cv(W,gt,Z),ae=new bv(W,gt,Z),Z.programs=we.programs,P.capabilities=O,P.extensions=gt,P.properties=K,P.renderLists=ve,P.shadowMap=Ne,P.state=w,P.info=Z}M!==on&&(R=new Ev(M,t.width,t.height,a,r,s));let Oe=new hh(P,W);this.xr=Oe,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){let d=gt.get("WEBGL_lose_context");d&&d.loseContext()},this.forceContextRestore=function(){let d=gt.get("WEBGL_lose_context");d&&d.restoreContext()},this.getPixelRatio=function(){return ce},this.setPixelRatio=function(d){d!==void 0&&(ce=d,this.setSize(rt,J,!1))},this.getSize=function(d){return d.set(rt,J)},this.setSize=function(d,b,C=!0){if(Oe.isPresenting){We("WebGLRenderer: Can't change size while VR device is presenting.");return}rt=d,J=b,t.width=Math.floor(d*ce),t.height=Math.floor(b*ce),C===!0&&(t.style.width=d+"px",t.style.height=b+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,d,b)},this.getDrawingBufferSize=function(d){return d.set(rt*ce,J*ce).floor()},this.setDrawingBufferSize=function(d,b,C){rt=d,J=b,ce=C,t.width=Math.floor(d*C),t.height=Math.floor(b*C),this.setViewport(0,0,d,b)},this.setEffects=function(d){if(M===on){$e("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(d){for(let b=0;b<d.length;b++)if(d[b].isOutputPass===!0){We("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(d||[])},this.getCurrentViewport=function(d){return d.copy(le)},this.getViewport=function(d){return d.copy(Ie)},this.setViewport=function(d,b,C,D){d.isVector4?Ie.set(d.x,d.y,d.z,d.w):Ie.set(d,b,C,D),w.viewport(le.copy(Ie).multiplyScalar(ce).round())},this.getScissor=function(d){return d.copy(Ke)},this.setScissor=function(d,b,C,D){d.isVector4?Ke.set(d.x,d.y,d.z,d.w):Ke.set(d,b,C,D),w.scissor(Re.copy(Ke).multiplyScalar(ce).round())},this.getScissorTest=function(){return zt},this.setScissorTest=function(d){w.setScissorTest(zt=d)},this.setOpaqueSort=function(d){Ee=d},this.setTransparentSort=function(d){Ye=d},this.getClearColor=function(d){return d.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(d=!0,b=!0,C=!0){let D=0;if(d){let B=!1;if(he!==null){let L=he.texture.format;B=m.has(L)}if(B){let L=he.texture.type,X=g.has(L),H=ze.getClearColor(),Y=ze.getClearAlpha(),$=H.r,se=H.g,ee=H.b;X?(S[0]=$,S[1]=se,S[2]=ee,S[3]=Y,W.clearBufferuiv(W.COLOR,0,S)):(A[0]=$,A[1]=se,A[2]=ee,A[3]=Y,W.clearBufferiv(W.COLOR,0,A))}else D|=W.COLOR_BUFFER_BIT}b&&(D|=W.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),C&&(D|=W.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D!==0&&W.clear(D)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(d){d.setRenderer(this),F=d},this.dispose=function(){t.removeEventListener("webglcontextlost",Pt,!1),t.removeEventListener("webglcontextrestored",yt,!1),t.removeEventListener("webglcontextcreationerror",In,!1),ze.dispose(),ve.dispose(),Te.dispose(),K.dispose(),_e.dispose(),ue.dispose(),Pe.dispose(),de.dispose(),we.dispose(),Oe.dispose(),Oe.removeEventListener("sessionstart",ko),Oe.removeEventListener("sessionend",Vo),oi.stop()};function Pt(d){d.preventDefault(),Vu("WebGLRenderer: Context Lost."),N=!0}function yt(){Vu("WebGLRenderer: Context Restored."),N=!1;let d=Z.autoReset,b=Ne.enabled,C=Ne.autoUpdate,D=Ne.needsUpdate,B=Ne.type;Ve(),Z.autoReset=d,Ne.enabled=b,Ne.autoUpdate=C,Ne.needsUpdate=D,Ne.type=B}function In(d){$e("WebGLRenderer: A WebGL context could not be created. Reason: ",d.statusMessage)}function Un(d){let b=d.target;b.removeEventListener("dispose",Un),qc(b)}function qc(d){Yc(d),K.remove(d)}function Yc(d){let b=K.get(d).programs;b!==void 0&&(b.forEach(function(C){we.releaseProgram(C)}),d.isShaderMaterial&&we.releaseShaderCache(d))}this.renderBufferDirect=function(d,b,C,D,B,L){b===null&&(b=un);let X=B.isMesh&&B.matrixWorld.determinantAffine()<0,H=Xo(d,b,C,D,B);w.setMaterial(D,X);let Y=C.index,$=1;if(D.wireframe===!0){if(Y=oe.getWireframeAttribute(C),Y===void 0)return;$=2}let se=C.drawRange,ee=C.attributes.position,ne=se.start*$,ge=(se.start+se.count)*$;L!==null&&(ne=Math.max(ne,L.start*$),ge=Math.min(ge,(L.start+L.count)*$)),Y!==null?(ne=Math.max(ne,0),ge=Math.min(ge,Y.count)):ee!=null&&(ne=Math.max(ne,0),ge=Math.min(ge,ee.count));let pe=ge-ne;if(pe<0||pe===1/0)return;Pe.setup(B,D,H,C,Y);let me,Se=j;if(Y!==null&&(me=be.get(Y),Se=ae,Se.setIndex(me)),B.isMesh)D.wireframe===!0?(w.setLineWidth(D.wireframeLinewidth*Ht()),Se.setMode(W.LINES)):Se.setMode(W.TRIANGLES);else if(B.isLine){let He=D.linewidth;He===void 0&&(He=1),w.setLineWidth(He*Ht()),B.isLineSegments?Se.setMode(W.LINES):B.isLineLoop?Se.setMode(W.LINE_LOOP):Se.setMode(W.LINE_STRIP)}else B.isPoints?Se.setMode(W.POINTS):B.isSprite&&Se.setMode(W.TRIANGLES);if(B.isBatchedMesh)if(gt.get("WEBGL_multi_draw"))Se.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let He=B._multiDrawStarts,fe=B._multiDrawCounts,qe=B._multiDrawCount,xe=Y?be.get(Y).bytesPerElement:1,Me=K.get(D).currentProgram.getUniforms();for(let Fe=0;Fe<qe;Fe++)Me.setValue(W,"_gl_DrawID",Fe),Se.render(He[Fe]/xe,fe[Fe])}else if(B.isInstancedMesh)Se.renderInstances(ne,pe,B.count);else if(C.isInstancedBufferGeometry){let He=C._maxInstanceCount!==void 0?C._maxInstanceCount:1/0,fe=Math.min(C.instanceCount,He);Se.renderInstances(ne,pe,fe)}else Se.render(ne,pe)};function Oo(d,b,C,D){F!==null&&d.isNodeMaterial&&F.setObject(D,d),ht===!0&&Ue.setState(d,C,!1),d.transparent===!0&&d.side===xn&&d.forceSinglePass===!1?(d.side=$t,d.needsUpdate=!0,ai(d,b,D),d.side=bn,d.needsUpdate=!0,ai(d,b,D),d.side=xn):ai(d,b,D)}this.compile=function(d,b,C=null){C===null&&(C=d),F!==null&&F.renderStart(d,b,C),E=Te.get(C),E.init(b),_.push(E),C.traverseVisible(function(B){B.isLight&&B.layers.test(b.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),d!==C&&d.traverseVisible(function(B){B.isLight&&B.layers.test(b.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),E.setupLights(),F!==null&&F.updateLights(E.state.lightsArray),At=this.localClippingEnabled,ht=Ue.init(this.clippingPlanes,At),ht===!0&&Ue.setGlobalState(this.clippingPlanes,b),F!==null&&Ne.render(E.state.shadowsArray,C,b);let D=new Set;return d.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let L=B.material;if(L)if(Array.isArray(L))for(let X=0;X<L.length;X++){let H=L[X];Oo(H,C,b,B),D.add(H)}else Oo(L,C,b,B),D.add(L)}),E=_.pop(),F!==null&&F.renderEnd(),D},this.compileAsync=function(d,b,C=null){let D=this.compile(d,b,C);return new Promise(B=>{function L(){if(D.forEach(function(X){let Y=K.get(X).currentProgram;(Y===void 0||Y.isReady())&&D.delete(X)}),D.size===0){B(d);return}setTimeout(L,10)}gt.get("KHR_parallel_shader_compile")!==null?L():setTimeout(L,10)})};let ws=null;function zo(d){ws&&ws(d)}function ko(){oi.stop()}function Vo(){oi.start()}let oi=new Pd;oi.setAnimationLoop(zo),typeof self<"u"&&oi.setContext(self),this.setAnimationLoop=function(d){ws=d,Oe.setAnimationLoop(d),d===null?oi.stop():oi.start()},Oe.addEventListener("sessionstart",ko),Oe.addEventListener("sessionend",Vo),this.render=function(d,b){if(b!==void 0&&b.isCamera!==!0){$e("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;F!==null&&F.renderStart(d,b);let C=Oe.enabled===!0&&Oe.isPresenting===!0,D=R!==null&&(he===null||C)&&R.begin(P,he);if(d.matrixWorldAutoUpdate===!0&&d.updateMatrixWorld(),b.parent===null&&b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),Oe.enabled===!0&&Oe.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Oe.cameraAutoUpdate===!0&&Oe.updateCamera(b),b=Oe.getCamera()),d.isScene===!0&&d.onBeforeRender(P,d,b,he),E=Te.get(d,_.length),E.init(b),E.state.textureUnits=re.getTextureUnits(),_.push(E),lt.multiplyMatrices(b.projectionMatrix,b.matrixWorldInverse),it.setFromProjectionMatrix(lt,qn,b.reversedDepth),At=this.localClippingEnabled,ht=Ue.init(this.clippingPlanes,At),T=ve.get(d,I.length),T.init(),I.push(T),Oe.enabled===!0&&Oe.isPresenting===!0){let X=P.xr.getDepthSensingMesh();X!==null&&Sr(X,b,-1/0,P.sortObjects)}Sr(d,b,0,P.sortObjects),T.finish(),F!==null&&F.updateLights(E.state.lightsArray),P.sortObjects===!0&&T.sort(Ee,Ye),Bt=Oe.enabled===!1||Oe.isPresenting===!1||Oe.hasDepthSensing()===!1,Bt&&ze.addToRenderList(T,d),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ht===!0&&Ue.beginShadows();let B=E.state.shadowsArray;if(Ne.render(B,d,b),ht===!0&&Ue.endShadows(),(D&&R.hasRenderPass())===!1){let X=T.opaque,H=T.transmissive;if(E.setupLights(),b.isArrayCamera){let Y=b.cameras;if(H.length>0)for(let $=0,se=Y.length;$<se;$++){let ee=Y[$];As(X,H,d,ee)}Bt&&ze.render(d);for(let $=0,se=Y.length;$<se;$++){let ee=Y[$];Ho(T,d,ee,ee.viewport)}}else H.length>0&&As(X,H,d,b),Bt&&ze.render(d),Ho(T,d,b)}he!==null&&te===0&&(re.updateMultisampleRenderTarget(he),re.updateRenderTargetMipmap(he)),D&&R.end(P),d.isScene===!0&&d.onAfterRender(P,d,b),Pe.resetDefaultState(),Q=-1,ie=null,_.pop(),_.length>0?(E=_[_.length-1],re.setTextureUnits(E.state.textureUnits),ht===!0&&Ue.setGlobalState(P.clippingPlanes,E.state.camera)):E=null,I.pop(),I.length>0?T=I[I.length-1]:T=null,F!==null&&F.renderEnd()};function Sr(d,b,C,D){if(d.visible===!1)return;if(d.layers.test(b.layers)){if(d.isGroup)C=d.renderOrder;else if(d.isLOD)d.autoUpdate===!0&&d.update(b);else if(d.isLightProbeGrid)E.pushLightProbeGrid(d);else if(d.isLight)E.pushLight(d),d.castShadow&&E.pushShadow(d);else if(d.isSprite){if(!d.frustumCulled||d.intersectsFrustum(it)){D&&Wt.setFromMatrixPosition(d.matrixWorld).applyMatrix4(lt);let X=ue.update(d),H=d.material;H.visible&&T.push(d,X,H,C,Wt.z,null,b)}}else if((d.isMesh||d.isLine||d.isPoints)&&(!d.frustumCulled||d.intersectsFrustum(it))){let X=ue.update(d),H=d.material;if(D&&(d.boundingSphere!==void 0?(d.boundingSphere===null&&d.computeBoundingSphere(),Wt.copy(d.boundingSphere.center)):(X.boundingSphere===null&&X.computeBoundingSphere(),Wt.copy(X.boundingSphere.center)),Wt.applyMatrix4(d.matrixWorld).applyMatrix4(lt)),Array.isArray(H)){let Y=X.groups;for(let $=0,se=Y.length;$<se;$++){let ee=Y[$],ne=H[ee.materialIndex];ne&&ne.visible&&T.push(d,X,ne,C,Wt.z,ee,b)}}else H.visible&&T.push(d,X,H,C,Wt.z,null,b)}}let L=d.children;for(let X=0,H=L.length;X<H;X++)Sr(L[X],b,C,D)}function Ho(d,b,C,D){let{opaque:B,transmissive:L,transparent:X}=d;E.setupLightsView(C),ht===!0&&Ue.setGlobalState(P.clippingPlanes,C),D&&w.viewport(le.copy(D)),B.length>0&&br(B,b,C),L.length>0&&br(L,b,C),X.length>0&&br(X,b,C),w.buffers.depth.setTest(!0),w.buffers.depth.setMask(!0),w.buffers.color.setMask(!0),w.setPolygonOffset(!1)}function As(d,b,C,D){if((C.isScene===!0?C.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[D.id]===void 0){let ne=gt.has("EXT_color_buffer_half_float")||gt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[D.id]=new Vt(1,1,{generateMipmaps:!0,type:ne?ct:on,minFilter:_i,samples:Math.max(4,O.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:dt.workingColorSpace})}let L=E.state.transmissionRenderTarget[D.id],X=D.viewport||le;L.setSize(X.z*P.transmissionResolutionScale,X.w*P.transmissionResolutionScale);let H=P.getRenderTarget(),Y=P.getActiveCubeFace(),$=P.getActiveMipmapLevel();P.setRenderTarget(L),P.getClearColor(ut),Xe=P.getClearAlpha(),Xe<1&&P.setClearColor(16777215,.5),P.clear(),Bt&&ze.render(C);let se=P.toneMapping;P.toneMapping=Mn;let ee=D.viewport;if(D.viewport!==void 0&&(D.viewport=void 0),E.setupLightsView(D),ht===!0&&Ue.setGlobalState(P.clippingPlanes,D),br(d,C,D),re.updateMultisampleRenderTarget(L),re.updateRenderTargetMipmap(L),gt.has("WEBGL_multisampled_render_to_texture")===!1){let ne=!1;for(let ge=0,pe=b.length;ge<pe;ge++){let me=b[ge],{object:Se,geometry:He,material:fe,group:qe}=me;if(fe.side===xn&&Se.layers.test(D.layers)){let xe=fe.side;fe.side=$t,fe.needsUpdate=!0,Go(Se,C,D,He,fe,qe),fe.side=xe,fe.needsUpdate=!0,ne=!0}}ne===!0&&(re.updateMultisampleRenderTarget(L),re.updateRenderTargetMipmap(L))}P.setRenderTarget(H,Y,$),P.setClearColor(ut,Xe),ee!==void 0&&(D.viewport=ee),P.toneMapping=se}function br(d,b,C){let D=b.isScene===!0?b.overrideMaterial:null;for(let B=0,L=d.length;B<L;B++){let X=d[B],{object:H,geometry:Y,group:$}=X,se=X.material;se.allowOverride===!0&&D!==null&&(se=D),H.layers.test(C.layers)&&Go(H,b,C,Y,se,$)}}function Go(d,b,C,D,B,L){F!==null&&B.isNodeMaterial&&F.setObject(d,B),d.onBeforeRender(P,b,C,D,B,L),d.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,d.matrixWorld),d.normalMatrix.getNormalMatrix(d.modelViewMatrix),B.onBeforeRender(P,b,C,D,d,L),B.transparent===!0&&B.side===xn&&B.forceSinglePass===!1?(B.side=$t,B.needsUpdate=!0,P.renderBufferDirect(C,b,D,B,d,L),B.side=bn,B.needsUpdate=!0,P.renderBufferDirect(C,b,D,B,d,L),B.side=xn):P.renderBufferDirect(C,b,D,B,d,L),d.onAfterRender(P,b,C,D,B,L)}function ai(d,b,C){b.isScene!==!0&&(b=un);let D=K.get(d),B=E.state.lights,L=E.state.shadowsArray,X=B.state.version,H=we.getParameters(d,B.state,L,b,C,E.state.lightProbeGridArray),Y=we.getProgramCacheKey(H),$=D.programs;D.environment=d.isMeshStandardMaterial||d.isMeshLambertMaterial||d.isMeshPhongMaterial?b.environment:null,D.fog=b.fog;let se=d.isMeshStandardMaterial||d.isMeshLambertMaterial&&!d.envMap||d.isMeshPhongMaterial&&!d.envMap;D.envMap=_e.get(d.envMap||D.environment,se),D.envMapRotation=D.environment!==null&&d.envMap===null?b.environmentRotation:d.envMapRotation,$===void 0&&(d.addEventListener("dispose",Un),$=new Map,D.programs=$);let ee=$.get(Y);if(ee!==void 0){if(D.currentProgram===ee&&D.lightsStateVersion===X)return Wo(d,H),ee}else H.uniforms=we.getUniforms(d),F!==null&&d.isNodeMaterial&&F.build(d,C,H),d.onBeforeCompile(H,P),ee=we.acquireProgram(H,Y),$.set(Y,ee),D.uniforms=H.uniforms;let ne=D.uniforms;return(!d.isShaderMaterial&&!d.isRawShaderMaterial||d.clipping===!0)&&(ne.clippingPlanes=Ue.uniform),Wo(d,H),D.needsLights=An(d),D.lightsStateVersion=X,D.needsLights&&(ne.ambientLightColor.value=B.state.ambient,ne.lightProbe.value=B.state.probe,ne.sunLights.value=B.state.sun,ne.sunLightShadows.value=B.state.sunShadow,ne.directionalLights.value=B.state.directional,ne.directionalLightShadows.value=B.state.directionalShadow,ne.spotLights.value=B.state.spot,ne.spotLightShadows.value=B.state.spotShadow,ne.rectAreaLights.value=B.state.rectArea,ne.ltc_1.value=B.state.rectAreaLTC1,ne.ltc_2.value=B.state.rectAreaLTC2,ne.pointLights.value=B.state.point,ne.pointLightShadows.value=B.state.pointShadow,ne.hemisphereLights.value=B.state.hemi,ne.sunShadowMatrix.value=B.state.sunShadowMatrix,ne.sunShadowCascade.value=B.state.sunShadowCascade,ne.directionalShadowMatrix.value=B.state.directionalShadowMatrix,ne.spotLightMatrix.value=B.state.spotLightMatrix,ne.spotLightMap.value=B.state.spotLightMap,ne.pointShadowMatrix.value=B.state.pointShadowMatrix),D.lightProbeGrid=E.state.lightProbeGridArray.length>0,D.currentProgram=ee,D.uniformsList=null,ee}function Ji(d){if(d.uniformsList===null){let b=d.currentProgram.getUniforms();d.uniformsList=ts.seqWithValue(b.seq,d.uniforms)}return d.uniformsList}function Wo(d,b){let C=K.get(d);C.outputColorSpace=b.outputColorSpace,C.batching=b.batching,C.batchingColor=b.batchingColor,C.instancing=b.instancing,C.instancingColor=b.instancingColor,C.instancingMorph=b.instancingMorph,C.skinning=b.skinning,C.morphTargets=b.morphTargets,C.morphNormals=b.morphNormals,C.morphColors=b.morphColors,C.morphTargetsCount=b.morphTargetsCount,C.numClippingPlanes=b.numClippingPlanes,C.numIntersection=b.numClipIntersection,C.vertexAlphas=b.vertexAlphas,C.vertexTangents=b.vertexTangents,C.toneMapping=b.toneMapping}function Mr(d,b){if(d.length===0)return null;if(d.length===1)return d[0].texture!==null?d[0]:null;y.setFromMatrixPosition(b.matrixWorld);for(let C=0,D=d.length;C<D;C++){let B=d[C];if(B.texture!==null&&B.boundingBox.containsPoint(y))return B}return null}function Xo(d,b,C,D,B){b.isScene!==!0&&(b=un),re.resetTextureUnits();let L=b.fog,X=D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial?b.environment:null,H=he===null?P.outputColorSpace:he.isXRRenderTarget===!0?he.texture.colorSpace:dt.workingColorSpace,Y=D.isMeshStandardMaterial||D.isMeshLambertMaterial&&!D.envMap||D.isMeshPhongMaterial&&!D.envMap,$=_e.get(D.envMap||X,Y),se=D.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,ee=!!C.attributes.tangent&&(!!D.normalMap||D.anisotropy>0),ne=!!C.morphAttributes.position,ge=!!C.morphAttributes.normal,pe=!!C.morphAttributes.color,me=Mn;D.toneMapped&&(he===null||he.isXRRenderTarget===!0)&&(me=P.toneMapping);let Se=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,He=Se!==void 0?Se.length:0,fe=K.get(D),qe=E.state.lights;if(ht===!0&&(At===!0||d!==ie)){let ot=d===ie&&D.id===Q;Ue.setState(D,d,ot)}let xe=!1;D.version===fe.__version?(fe.needsLights&&fe.lightsStateVersion!==qe.state.version||fe.outputColorSpace!==H||B.isBatchedMesh&&fe.batching===!1||!B.isBatchedMesh&&fe.batching===!0||B.isBatchedMesh&&fe.batchingColor===!0&&B._colorsTexture===null||B.isBatchedMesh&&fe.batchingColor===!1&&B._colorsTexture!==null||B.isInstancedMesh&&fe.instancing===!1||!B.isInstancedMesh&&fe.instancing===!0||B.isSkinnedMesh&&fe.skinning===!1||!B.isSkinnedMesh&&fe.skinning===!0||B.isInstancedMesh&&fe.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&fe.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&fe.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&fe.instancingMorph===!1&&B.morphTexture!==null||fe.envMap!==$||D.fog===!0&&fe.fog!==L||fe.numClippingPlanes!==void 0&&(fe.numClippingPlanes!==Ue.numPlanes||fe.numIntersection!==Ue.numIntersection)||fe.vertexAlphas!==se||fe.vertexTangents!==ee||fe.morphTargets!==ne||fe.morphNormals!==ge||fe.morphColors!==pe||fe.toneMapping!==me||fe.morphTargetsCount!==He||!!fe.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(xe=!0):(xe=!0,fe.__version=D.version);let Me=fe.currentProgram;xe===!0&&(Me=ai(D,b,B),F&&D.isNodeMaterial&&F.onUpdateProgram(D,Me,fe));let Fe=!1,ft=!1,st=!1,De=Me.getUniforms(),ke=fe.uniforms;if(w.useProgram(Me.program)&&(Fe=!0,ft=!0,st=!0),D.id!==Q&&(Q=D.id,ft=!0),fe.needsLights){let ot=Mr(E.state.lightProbeGridArray,B);fe.lightProbeGrid!==ot&&(fe.lightProbeGrid=ot,ft=!0)}if(Fe||ie!==d){w.buffers.depth.getReversed()&&d.reversedDepth!==!0&&(d._reversedDepth=!0,d.updateProjectionMatrix()),De.setValue(W,"projectionMatrix",d.projectionMatrix),De.setValue(W,"viewMatrix",d.matrixWorldInverse);let mt=De.map.cameraPosition;mt!==void 0&&mt.setValue(W,Ut.setFromMatrixPosition(d.matrixWorld)),O.logarithmicDepthBuffer&&De.setValue(W,"logDepthBufFC",2/(Math.log(d.far+1)/Math.LN2)),(D.isMeshPhongMaterial||D.isMeshToonMaterial||D.isMeshLambertMaterial||D.isMeshBasicMaterial||D.isMeshStandardMaterial||D.isShaderMaterial)&&De.setValue(W,"isOrthographic",d.isOrthographicCamera===!0),ie!==d&&(ie=d,ft=!0,st=!0)}if(fe.needsLights&&(qe.state.sunShadowMap.length>0&&De.setValue(W,"sunShadowMap",qe.state.sunShadowMap,re),qe.state.directionalShadowMap.length>0&&De.setValue(W,"directionalShadowMap",qe.state.directionalShadowMap,re),qe.state.spotShadowMap.length>0&&De.setValue(W,"spotShadowMap",qe.state.spotShadowMap,re),qe.state.pointShadowMap.length>0&&De.setValue(W,"pointShadowMap",qe.state.pointShadowMap,re)),B.isSkinnedMesh){De.setOptional(W,B,"bindMatrix"),De.setOptional(W,B,"bindMatrixInverse");let ot=B.skeleton;ot&&(ot.boneTexture===null&&ot.computeBoneTexture(),De.setValue(W,"boneTexture",ot.boneTexture,re))}B.isBatchedMesh&&(De.setOptional(W,B,"batchingTexture"),De.setValue(W,"batchingTexture",B._matricesTexture,re),De.setOptional(W,B,"batchingIdTexture"),De.setValue(W,"batchingIdTexture",B._indirectTexture,re),De.setOptional(W,B,"batchingColorTexture"),B._colorsTexture!==null&&De.setValue(W,"batchingColorTexture",B._colorsTexture,re));let Ct=C.morphAttributes;if((Ct.position!==void 0||Ct.normal!==void 0||Ct.color!==void 0)&&G.update(B,C,Me),(ft||fe.receiveShadow!==B.receiveShadow)&&(fe.receiveShadow=B.receiveShadow,De.setValue(W,"receiveShadow",B.receiveShadow)),(D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial)&&D.envMap===null&&b.environment!==null&&(ke.envMapIntensity.value=b.environmentIntensity),ke.dfgLUT!==void 0&&(ke.dfgLUT.value=dy()),ft){if(De.setValue(W,"toneMappingExposure",P.toneMappingExposure),fe.needsLights&&en(ke,st),L&&D.fog===!0&&Le.refreshFogUniforms(ke,L),Le.refreshMaterialUniforms(ke,D,ce,J,E.state.transmissionRenderTarget[d.id]),fe.needsLights&&fe.lightProbeGrid){let ot=fe.lightProbeGrid;ke.probesSH.value=ot.texture,ke.probesMin.value.copy(ot.boundingBox.min),ke.probesMax.value.copy(ot.boundingBox.max),ke.probesResolution.value.copy(ot.resolution)}ts.upload(W,Ji(fe),ke,re)}if(D.isShaderMaterial&&D.uniformsNeedUpdate===!0&&(ts.upload(W,Ji(fe),ke,re),D.uniformsNeedUpdate=!1),D.isSpriteMaterial&&De.setValue(W,"center",B.center),De.setValue(W,"modelViewMatrix",B.modelViewMatrix),De.setValue(W,"normalMatrix",B.normalMatrix),De.setValue(W,"modelMatrix",B.matrixWorld),D.uniformsGroups!==void 0){let ot=D.uniformsGroups;for(let mt=0,hn=ot.length;mt<hn;mt++){let li=ot[mt];de.update(li,Me),de.bind(li,Me)}}return Me}function en(d,b){d.ambientLightColor.needsUpdate=b,d.lightProbe.needsUpdate=b,d.sunLights.needsUpdate=b,d.sunLightShadows.needsUpdate=b,d.directionalLights.needsUpdate=b,d.directionalLightShadows.needsUpdate=b,d.pointLights.needsUpdate=b,d.pointLightShadows.needsUpdate=b,d.spotLights.needsUpdate=b,d.spotLightShadows.needsUpdate=b,d.rectAreaLights.needsUpdate=b,d.hemisphereLights.needsUpdate=b}function An(d){return d.isMeshLambertMaterial||d.isMeshToonMaterial||d.isMeshPhongMaterial||d.isMeshStandardMaterial||d.isShadowMaterial||d.isShaderMaterial&&d.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return te},this.getRenderTarget=function(){return he},this.setRenderTargetTextures=function(d,b,C){let D=K.get(d);D.__autoAllocateDepthBuffer=d.resolveDepthBuffer===!1,D.__autoAllocateDepthBuffer===!1&&(D.__useRenderToTexture=!1),K.get(d.texture).__webglTexture=b,K.get(d.depthTexture).__webglTexture=D.__autoAllocateDepthBuffer?void 0:C,D.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(d,b){let C=K.get(d);C.__webglFramebuffer=b,C.__useDefaultFramebuffer=b===void 0},this.setRenderTarget=function(d,b=0,C=0){he=d,q=b,te=C;let D=null,B=!1,L=!1;if(d){let H=K.get(d);if(H.__useDefaultFramebuffer!==void 0){w.bindFramebuffer(W.FRAMEBUFFER,H.__webglFramebuffer),le.copy(d.viewport),Re.copy(d.scissor),ye=d.scissorTest,w.viewport(le),w.scissor(Re),w.setScissorTest(ye),Q=-1;return}else if(H.__webglFramebuffer===void 0)re.setupRenderTarget(d);else if(H.__hasExternalTextures)re.rebindTextures(d,K.get(d.texture).__webglTexture,K.get(d.depthTexture).__webglTexture);else if(d.depthBuffer){let se=d.depthTexture;if(H.__boundDepthTexture!==se){if(se!==null&&K.has(se)&&(d.width!==se.image.width||d.height!==se.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");re.setupDepthRenderbuffer(d)}}let Y=d.texture;(Y.isData3DTexture||Y.isDataArrayTexture||Y.isCompressedArrayTexture)&&(L=!0);let $=K.get(d).__webglFramebuffer;d.isWebGLCubeRenderTarget?(Array.isArray($[b])?D=$[b][C]:D=$[b],B=!0):d.samples>0&&re.useMultisampledRTT(d)===!1?D=K.get(d).__webglMultisampledFramebuffer:Array.isArray($)?D=$[C]:D=$,le.copy(d.viewport),Re.copy(d.scissor),ye=d.scissorTest}else le.copy(Ie).multiplyScalar(ce).floor(),Re.copy(Ke).multiplyScalar(ce).floor(),ye=zt;if(C!==0&&(D=z),w.bindFramebuffer(W.FRAMEBUFFER,D)&&w.drawBuffers(d,D),w.viewport(le),w.scissor(Re),w.setScissorTest(ye),B){let H=K.get(d.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_CUBE_MAP_POSITIVE_X+b,H.__webglTexture,C)}else if(L){let H=b;for(let Y=0;Y<d.textures.length;Y++){let $=K.get(d.textures[Y]);W.framebufferTextureLayer(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0+Y,$.__webglTexture,C,H)}}else if(d!==null&&C!==0){let H=K.get(d.texture);W.framebufferTexture2D(W.FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,H.__webglTexture,C)}Q=-1};function v(d){let b=K.get(d);return(b.__readFormat!==d.format||b.__readType!==d.type)&&(b.__readFormat=d.format,b.__readType=d.type,b.__formatReadable=O.textureFormatReadable(d.format),b.__typeReadable=O.textureTypeReadable(d.type)),b}this.readRenderTargetPixels=function(d,b,C,D,B,L,X,H=0){if(!(d&&d.isWebGLRenderTarget)){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Y=K.get(d).__webglFramebuffer;if(d.isWebGLCubeRenderTarget&&X!==void 0&&(Y=Y[X]),Y){w.bindFramebuffer(W.FRAMEBUFFER,Y);try{let $=d.textures[H],se=$.format,ee=$.type;d.textures.length>1&&W.readBuffer(W.COLOR_ATTACHMENT0+H);let ne=v($);if(ne.__formatReadable===!1){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ne.__typeReadable===!1){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}b>=0&&b<=d.width-D&&C>=0&&C<=d.height-B&&W.readPixels(b,C,D,B,Ae.convert(se),Ae.convert(ee),L)}finally{let $=he!==null?K.get(he).__webglFramebuffer:null;w.bindFramebuffer(W.FRAMEBUFFER,$)}}},this.readRenderTargetPixelsAsync=async function(d,b,C,D,B,L,X,H=0){if(!(d&&d.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Y=K.get(d).__webglFramebuffer;if(d.isWebGLCubeRenderTarget&&X!==void 0&&(Y=Y[X]),Y)if(b>=0&&b<=d.width-D&&C>=0&&C<=d.height-B){w.bindFramebuffer(W.FRAMEBUFFER,Y);let $=d.textures[H],se=$.format,ee=$.type;d.textures.length>1&&W.readBuffer(W.COLOR_ATTACHMENT0+H);let ne=v($);if(ne.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ne.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ge=W.createBuffer();W.bindBuffer(W.PIXEL_PACK_BUFFER,ge),W.bufferData(W.PIXEL_PACK_BUFFER,L.byteLength,W.STREAM_READ),W.readPixels(b,C,D,B,Ae.convert(se),Ae.convert(ee),0),W.bindBuffer(W.PIXEL_PACK_BUFFER,null);let pe=he!==null?K.get(he).__webglFramebuffer:null;w.bindFramebuffer(W.FRAMEBUFFER,pe);let me=W.fenceSync(W.SYNC_GPU_COMMANDS_COMPLETE,0);return W.flush(),await rd(W,me,4),W.bindBuffer(W.PIXEL_PACK_BUFFER,ge),W.getBufferSubData(W.PIXEL_PACK_BUFFER,0,L),W.bindBuffer(W.PIXEL_PACK_BUFFER,null),W.deleteBuffer(ge),W.deleteSync(me),L}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(d,b=null,C=0){let D=Math.pow(2,-C),B=Math.floor(d.image.width*D),L=Math.floor(d.image.height*D),X=b!==null?b.x:0,H=b!==null?b.y:0;re.setTexture2D(d,0),W.copyTexSubImage2D(W.TEXTURE_2D,C,0,0,X,H,B,L),w.unbindTexture()},this.copyTextureToTexture=function(d,b,C=null,D=null,B=0,L=0){let X,H,Y,$,se,ee,ne,ge,pe,me=d.isCompressedTexture?d.mipmaps[L]:d.image;if(C!==null)X=C.max.x-C.min.x,H=C.max.y-C.min.y,Y=C.isBox3?C.max.z-C.min.z:1,$=C.min.x,se=C.min.y,ee=C.isBox3?C.min.z:0;else{let ke=Math.pow(2,-B);X=Math.floor(me.width*ke),H=Math.floor(me.height*ke),d.isDataArrayTexture?Y=me.depth:d.isData3DTexture?Y=Math.floor(me.depth*ke):Y=1,$=0,se=0,ee=0}D!==null?(ne=D.x,ge=D.y,pe=D.z):(ne=0,ge=0,pe=0);let Se=Ae.convert(b.format),He=Ae.convert(b.type),fe;b.isData3DTexture?(re.setTexture3D(b,0),fe=W.TEXTURE_3D):b.isDataArrayTexture||b.isCompressedArrayTexture?(re.setTexture2DArray(b,0),fe=W.TEXTURE_2D_ARRAY):(re.setTexture2D(b,0),fe=W.TEXTURE_2D),w.activeTexture(W.TEXTURE0),w.pixelStorei(W.UNPACK_FLIP_Y_WEBGL,b.flipY),w.pixelStorei(W.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),w.pixelStorei(W.UNPACK_ALIGNMENT,b.unpackAlignment);let qe=w.getParameter(W.UNPACK_ROW_LENGTH),xe=w.getParameter(W.UNPACK_IMAGE_HEIGHT),Me=w.getParameter(W.UNPACK_SKIP_PIXELS),Fe=w.getParameter(W.UNPACK_SKIP_ROWS),ft=w.getParameter(W.UNPACK_SKIP_IMAGES);w.pixelStorei(W.UNPACK_ROW_LENGTH,me.width),w.pixelStorei(W.UNPACK_IMAGE_HEIGHT,me.height),w.pixelStorei(W.UNPACK_SKIP_PIXELS,$),w.pixelStorei(W.UNPACK_SKIP_ROWS,se),w.pixelStorei(W.UNPACK_SKIP_IMAGES,ee);let st=d.isDataArrayTexture||d.isData3DTexture,De=b.isDataArrayTexture||b.isData3DTexture;if(d.isDepthTexture){let ke=K.get(d),Ct=K.get(b),ot=K.get(ke.__renderTarget),mt=K.get(Ct.__renderTarget);w.bindFramebuffer(W.READ_FRAMEBUFFER,ot.__webglFramebuffer),w.bindFramebuffer(W.DRAW_FRAMEBUFFER,mt.__webglFramebuffer);for(let hn=0;hn<Y;hn++)st&&(W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,K.get(d).__webglTexture,B,ee+hn),W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,K.get(b).__webglTexture,L,pe+hn)),W.blitFramebuffer($,se,X,H,ne,ge,X,H,W.DEPTH_BUFFER_BIT,W.NEAREST);w.bindFramebuffer(W.READ_FRAMEBUFFER,null),w.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else if(B!==0||d.isRenderTargetTexture||K.has(d)){let ke=K.get(d),Ct=K.get(b);w.bindFramebuffer(W.READ_FRAMEBUFFER,U),w.bindFramebuffer(W.DRAW_FRAMEBUFFER,V);for(let ot=0;ot<Y;ot++)st?W.framebufferTextureLayer(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,ke.__webglTexture,B,ee+ot):W.framebufferTexture2D(W.READ_FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,ke.__webglTexture,B),De?W.framebufferTextureLayer(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,Ct.__webglTexture,L,pe+ot):W.framebufferTexture2D(W.DRAW_FRAMEBUFFER,W.COLOR_ATTACHMENT0,W.TEXTURE_2D,Ct.__webglTexture,L),B!==0?W.blitFramebuffer($,se,X,H,ne,ge,X,H,W.COLOR_BUFFER_BIT,W.NEAREST):De?W.copyTexSubImage3D(fe,L,ne,ge,pe+ot,$,se,X,H):W.copyTexSubImage2D(fe,L,ne,ge,$,se,X,H);w.bindFramebuffer(W.READ_FRAMEBUFFER,null),w.bindFramebuffer(W.DRAW_FRAMEBUFFER,null)}else De?d.isDataTexture||d.isData3DTexture?W.texSubImage3D(fe,L,ne,ge,pe,X,H,Y,Se,He,me.data):b.isCompressedArrayTexture?W.compressedTexSubImage3D(fe,L,ne,ge,pe,X,H,Y,Se,me.data):W.texSubImage3D(fe,L,ne,ge,pe,X,H,Y,Se,He,me):d.isDataTexture?W.texSubImage2D(W.TEXTURE_2D,L,ne,ge,X,H,Se,He,me.data):d.isCompressedTexture?W.compressedTexSubImage2D(W.TEXTURE_2D,L,ne,ge,me.width,me.height,Se,me.data):W.texSubImage2D(W.TEXTURE_2D,L,ne,ge,X,H,Se,He,me);w.pixelStorei(W.UNPACK_ROW_LENGTH,qe),w.pixelStorei(W.UNPACK_IMAGE_HEIGHT,xe),w.pixelStorei(W.UNPACK_SKIP_PIXELS,Me),w.pixelStorei(W.UNPACK_SKIP_ROWS,Fe),w.pixelStorei(W.UNPACK_SKIP_IMAGES,ft),L===0&&b.generateMipmaps&&W.generateMipmap(fe),w.unbindTexture()},this.initRenderTarget=function(d){K.get(d).__webglFramebuffer===void 0&&re.setupRenderTarget(d)},this.initTexture=function(d){d.isCubeTexture?re.setTextureCube(d,0):d.isData3DTexture?re.setTexture3D(d,0):d.isDataArrayTexture||d.isCompressedArrayTexture?re.setTexture2DArray(d,0):re.setTexture2D(d,0),w.unbindTexture()},this.resetState=function(){q=0,te=0,he=null,w.reset(),Pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}};var rs=Math.pow(2,-24),yo=Symbol("SKIP_GENERATION"),Bl={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[yo]:!1};function Ft(i,e,t){return t.min.x=e[i],t.min.y=e[i+1],t.min.z=e[i+2],t.max.x=e[i+3],t.max.y=e[i+4],t.max.z=e[i+5],t}function So(i){let e=-1,t=-1/0;for(let n=0;n<3;n++){let r=i[n+3]-i[n];r>t&&(t=r,e=n)}return e}function fh(i,e){e.set(i)}function dh(i,e,t){let n,r;for(let s=0;s<3;s++){let o=s+3;n=i[s],r=e[s],t[s]=n<r?n:r,n=i[o],r=e[o],t[o]=n>r?n:r}}function bo(i,e,t){for(let n=0;n<3;n++){let r=e[i+2*n],s=e[i+2*n+1],o=r-s,a=r+s;o<t[n]&&(t[n]=o),a>t[n+3]&&(t[n+3]=a)}}function ss(i){let e=i[3]-i[0],t=i[4]-i[1],n=i[5]-i[2];return 2*(e*t+t*n+n*e)}function pt(i,e){return e[i+15]===65535}function St(i,e){return e[i+6]}function Rt(i,e){return e[i+14]}function Mt(i){return i+8}function Tt(i,e){let t=e[i+6];return i+t*8}function Hi(i,e){return e[i+7]}function Ol(i,e,t,n,r){let s=1/0,o=1/0,a=1/0,l=-1/0,u=-1/0,f=-1/0,h=1/0,c=1/0,p=1/0,x=-1/0,M=-1/0,m=-1/0,g=i.offset||0;for(let S=(e-g)*6,A=(e+t-g)*6;S<A;S+=6){let y=i[S+0],T=i[S+1],E=y-T,I=y+T;E<s&&(s=E),I>l&&(l=I),y<h&&(h=y),y>x&&(x=y);let _=i[S+2],R=i[S+3],P=_-R,N=_+R;P<o&&(o=P),N>u&&(u=N),_<c&&(c=_),_>M&&(M=_);let F=i[S+4],z=i[S+5],U=F-z,V=F+z;U<a&&(a=U),V>f&&(f=V),F<p&&(p=F),F>m&&(m=F)}n[0]=s,n[1]=o,n[2]=a,n[3]=l,n[4]=u,n[5]=f,r[0]=h,r[1]=c,r[2]=p,r[3]=x,r[4]=M,r[5]=m}var Si=32,gy=(i,e)=>i.candidate-e.candidate,Gi=new Array(Si).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),zl=new Float32Array(6);function kd(i,e,t,n,r,s){let o=-1,a=0;if(s===0)o=So(e),o!==-1&&(a=(e[o]+e[o+3])/2);else if(s===1)o=So(i),o!==-1&&(a=xy(t,n,r,o));else if(s===2){let l=ss(i),u=1.25*r,f=t.offset||0,h=(n-f)*6,c=(n+r-f)*6;for(let p=0;p<3;p++){let x=e[p],g=(e[p+3]-x)/Si;if(r<Si/4){let S=[...Gi];S.length=r;let A=0;for(let T=h;T<c;T+=6,A++){let E=S[A];E.candidate=t[T+2*p],E.count=0;let{bounds:I,leftCacheBounds:_,rightCacheBounds:R}=E;for(let P=0;P<3;P++)R[P]=1/0,R[P+3]=-1/0,_[P]=1/0,_[P+3]=-1/0,I[P]=1/0,I[P+3]=-1/0;bo(T,t,I)}S.sort(gy);let y=r;for(let T=0;T<y;T++){let E=S[T];for(;T+1<y&&S[T+1].candidate===E.candidate;)S.splice(T+1,1),y--}for(let T=h;T<c;T+=6){let E=t[T+2*p];for(let I=0;I<y;I++){let _=S[I];E>=_.candidate?bo(T,t,_.rightCacheBounds):(bo(T,t,_.leftCacheBounds),_.count++)}}for(let T=0;T<y;T++){let E=S[T],I=E.count,_=r-E.count,R=E.leftCacheBounds,P=E.rightCacheBounds,N=0;I!==0&&(N=ss(R)/l);let F=0;_!==0&&(F=ss(P)/l);let z=1+1.25*(N*I+F*_);z<u&&(o=p,u=z,a=E.candidate)}}else{for(let y=0;y<Si;y++){let T=Gi[y];T.count=0,T.candidate=x+g+y*g;let E=T.bounds;for(let I=0;I<3;I++)E[I]=1/0,E[I+3]=-1/0}for(let y=h;y<c;y+=6){let I=~~((t[y+2*p]-x)/g);I>=Si&&(I=Si-1);let _=Gi[I];_.count++,bo(y,t,_.bounds)}let S=Gi[Si-1];fh(S.bounds,S.rightCacheBounds);for(let y=Si-2;y>=0;y--){let T=Gi[y],E=Gi[y+1];dh(T.bounds,E.rightCacheBounds,T.rightCacheBounds)}let A=0;for(let y=0;y<Si-1;y++){let T=Gi[y],E=T.count,I=T.bounds,R=Gi[y+1].rightCacheBounds;E!==0&&(A===0?fh(I,zl):dh(I,zl,zl)),A+=E;let P=0,N=0;A!==0&&(P=ss(zl)/l);let F=r-A;F!==0&&(N=ss(R)/l);let z=1+1.25*(P*A+N*F);z<u&&(o=p,u=z,a=T.candidate)}}}}else console.warn(`BVH: Invalid build strategy value ${s} used.`);return{axis:o,pos:a}}function xy(i,e,t,n){let r=0,s=i.offset;for(let o=e,a=e+t;o<a;o++)r+=i[(o-s)*6+n*2];return r/t}var os=class{constructor(){this.boundingData=new Float32Array(6)}};function Vd(i,e,t,n,r,s){let o=n,a=n+r-1,l=s.pos,u=s.axis*2,f=t.offset||0;for(;;){for(;o<=a&&t[(o-f)*6+u]<l;)o++;for(;o<=a&&t[(a-f)*6+u]>=l;)a--;if(o<a){for(let h=0;h<e;h++){let c=i[o*e+h];i[o*e+h]=i[a*e+h],i[a*e+h]=c}for(let h=0;h<6;h++){let c=o-f,p=a-f,x=t[c*6+h];t[c*6+h]=t[p*6+h],t[p*6+h]=x}o++,a--}else return o}}var Hd,kl,ph,Gd,vy=Math.pow(2,32);function Vl(i){return"count"in i?1:1+Vl(i.left)+Vl(i.right)}function Wd(i,e,t){return Hd=new Float32Array(t),kl=new Uint32Array(t),ph=new Uint16Array(t),Gd=new Uint8Array(t),mh(i,e)}function mh(i,e){let t=i/4,n=i/2,r="count"in e,s=e.boundingData;for(let o=0;o<6;o++)Hd[t+o]=s[o];if(r)return e.buffer?(Gd.set(new Uint8Array(e.buffer),i),i+e.buffer.byteLength):(kl[t+6]=e.offset,ph[n+14]=e.count,ph[n+15]=65535,i+32);{let{left:o,right:a,splitAxis:l}=e,u=i+32,f=mh(u,o),h=i/32,p=f/32-h;if(p>vy)throw new Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");return kl[t+6]=p,kl[t+7]=l,mh(f,a)}}function _y(i,e,t,n,r,s){let{maxDepth:o,verbose:a,targetLeafSize:l,_strictLeafSize:u=1/0,strategy:f,onProgress:h}=r,c=i.primitiveBuffer,p=i.primitiveBufferStride,x=new Float32Array(6),M=!1,m=new os;return Ol(e,t,n,m.boundingData,x),S(m,t,n,x),m;function g(A){h&&h((A-s.offset)/s.count)}function S(A,y,T,E=null,I=0){!M&&I>=o&&(M=!0,a&&console.warn(`BVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`));let _=T>u;if(T<=l&&!_||I>=o)return g(y+T),A.offset=y,A.count=T,A;let R=kd(A.boundingData,E,e,y,T,f),P=R.axis===-1?-1:Vd(c,p,e,y,T,R);if(R.axis===-1||P===y||P===y+T){if(!_)return g(y+T),A.offset=y,A.count=T,A;R.axis=Math.max(0,So(A.boundingData)),P=y+Math.max(1,Math.floor(T/2))}A.splitAxis=R.axis;let N=new os,F=y,z=P-y;A.left=N,Ol(e,F,z,N.boundingData,x),S(N,F,z,x,I+1);let U=new os,V=P,q=T-z;return A.right=U,Ol(e,V,q,U.boundingData,x),S(U,V,q,x,I+1),A}}function Xd(i,e){let t=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,n=i.getRootRanges(e.range),r=n[0],s=n[n.length-1],o={offset:r.offset,count:s.offset+s.count-r.offset},a=new Float32Array(6*o.count);a.offset=o.offset,i.computePrimitiveBounds(o.offset,o.count,a),i._roots=n.map(l=>{let u=_y(i,a,l.offset,l.count,e,o),f=Vl(u),h=new t(32*f);return Wd(0,u,h),h})}var Wi=class{constructor(e){this._getNewPrimitive=e,this._primitives=[]}getPrimitive(){let e=this._primitives;return e.length===0?this._getNewPrimitive():e.pop()}releasePrimitive(e){this._primitives.push(e)}};var gh=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let e=[],t=null;this.setBuffer=n=>{t&&e.push(t),t=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{t=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,e.length!==0&&this.setBuffer(e.pop())}}},_t=new gh;var Xi,ls,as=[],Hl=new Wi(()=>new kt);function qd(i,e,t,n,r,s){Xi=Hl.getPrimitive(),ls=Hl.getPrimitive(),as.push(Xi,ls),_t.setBuffer(i._roots[e]);let o=xh(0,i.geometry,t,n,r,s);_t.clearBuffer(),Hl.releasePrimitive(Xi),Hl.releasePrimitive(ls),as.pop(),as.pop();let a=as.length;return a>0&&(ls=as[a-1],Xi=as[a-2]),o}function xh(i,e,t,n,r=null,s=0,o=0){let{float32Array:a,uint16Array:l,uint32Array:u}=_t,f=i*2;if(pt(f,l)){let c=St(i,u),p=Rt(f,l);return Ft(i,a,Xi),n(c,p,!1,o,s+i/8,Xi)}else{let P=function(F){let{uint16Array:z,uint32Array:U}=_t,V=F*2;for(;!pt(V,z);)F=Mt(F),V=F*2;return St(F,U)},N=function(F){let{uint16Array:z,uint32Array:U}=_t,V=F*2;for(;!pt(V,z);)F=Tt(F,U),V=F*2;return St(F,U)+Rt(V,z)},c=Mt(i),p=Tt(i,u),x=c,M=p,m,g,S,A;if(r&&(S=Xi,A=ls,Ft(x,a,S),Ft(M,a,A),m=r(S),g=r(A),g<m)){x=p,M=c;let F=m;m=g,g=F,S=A}S||(S=Xi,Ft(x,a,S));let y=pt(x*2,l),T=t(S,y,m,o+1,s+x/8),E;if(T===2){let F=P(x),U=N(x)-F;E=n(F,U,!0,o+1,s+x/8,S)}else E=T&&xh(x,e,t,n,r,s,o+1);if(E)return!0;A=ls,Ft(M,a,A);let I=pt(M*2,l),_=t(A,I,g,o+1,s+M/8),R;if(_===2){let F=P(M),U=N(M)-F;R=n(F,U,!0,o+1,s+M/8,A)}else R=_&&xh(M,e,t,n,r,s,o+1);return!!R}}var Mo=new _t.constructor,Wl=new _t.constructor,qi=new Wi(()=>new kt),cs=new kt,us=new kt,vh=new kt,_h=new kt,yh=!1;function Yd(i,e,t,n){if(yh)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");yh=!0;let r=i._roots,s=e._roots,o,a=0,l=0,u=new Ze().copy(t).invert();for(let f=0,h=r.length;f<h;f++){Mo.setBuffer(r[f]),l=0;let c=qi.getPrimitive();Ft(0,Mo.float32Array,c),c.applyMatrix4(u);for(let p=0,x=s.length;p<x&&(Wl.setBuffer(s[p]),o=Yn(0,0,t,u,n,a,l,0,0,c),Wl.clearBuffer(),l+=s[p].byteLength/32,!o);p++);if(qi.releasePrimitive(c),Mo.clearBuffer(),a+=r[f].byteLength/32,o)break}return yh=!1,o}function Yn(i,e,t,n,r,s=0,o=0,a=0,l=0,u=null,f=!1){let h,c;f?(h=Wl,c=Mo):(h=Mo,c=Wl);let p=h.float32Array,x=h.uint32Array,M=h.uint16Array,m=c.float32Array,g=c.uint32Array,S=c.uint16Array,A=i*2,y=e*2,T=pt(A,M),E=pt(y,S),I=!1;if(E&&T)f?I=r(St(e,g),Rt(e*2,S),St(i,x),Rt(i*2,M),l,o+e/8,a,s+i/8):I=r(St(i,x),Rt(i*2,M),St(e,g),Rt(e*2,S),a,s+i/8,l,o+e/8);else if(E){let _=qi.getPrimitive();Ft(e,m,_),_.applyMatrix4(t);let R=Mt(i),P=Tt(i,x);Ft(R,p,cs),Ft(P,p,us);let N=_.intersectsBox(cs),F=_.intersectsBox(us);I=N&&Yn(e,R,n,t,r,o,s,l,a+1,_,!f)||F&&Yn(e,P,n,t,r,o,s,l,a+1,_,!f),qi.releasePrimitive(_)}else{let _=Mt(e),R=Tt(e,g);Ft(_,m,vh),Ft(R,m,_h);let P=u.intersectsBox(vh),N=u.intersectsBox(_h);if(P&&N)I=Yn(i,_,t,n,r,s,o,a,l+1,u,f)||Yn(i,R,t,n,r,s,o,a,l+1,u,f);else if(P)if(T)I=Yn(i,_,t,n,r,s,o,a,l+1,u,f);else{let F=qi.getPrimitive();F.copy(vh).applyMatrix4(t);let z=Mt(i),U=Tt(i,x);Ft(z,p,cs),Ft(U,p,us);let V=F.intersectsBox(cs),q=F.intersectsBox(us);I=V&&Yn(_,z,n,t,r,o,s,l,a+1,F,!f)||q&&Yn(_,U,n,t,r,o,s,l,a+1,F,!f),qi.releasePrimitive(F)}else if(N)if(T)I=Yn(i,R,t,n,r,s,o,a,l+1,u,f);else{let F=qi.getPrimitive();F.copy(_h).applyMatrix4(t);let z=Mt(i),U=Tt(i,x);Ft(z,p,cs),Ft(U,p,us);let V=F.intersectsBox(cs),q=F.intersectsBox(us);I=V&&Yn(R,z,n,t,r,o,s,l,a+1,F,!f)||q&&Yn(R,U,n,t,r,o,s,l,a+1,F,!f),qi.releasePrimitive(F)}}return I}var Xl=new class{constructor(){let i=null,e=null,t=null,n=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(s,o)=>{if(n)throw new Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=o,this.buffer=i=s._roots[o],this.uint16Array=t=new Uint16Array(i),this.uint32Array=e=new Uint32Array(i)},this.reset=()=>{this.root=null,this.buffer=i=null,this.uint16Array=t=null,this.uint32Array=e=null},this.getRangeStart=s=>{let o=s*2;for(;!pt(o,t);)s=Mt(s),o=s*2;return St(s,e)},this.getRangeEnd=s=>{let o=s*2;for(;!pt(o,t);)s=Tt(s,e),o=s*2;return St(s,e)+Rt(o,t)};let r=(s,o,a)=>{let l=o*2,u=pt(l,t);if(!s(a,u,o)&&!u){let h=Mt(o),c=Tt(o,e);r(s,h,a+1),r(s,c,a+1)}};this.traverseBuffer=s=>{if(n)throw new Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");n=!0;try{r(s,0,0)}finally{n=!1}},this.traverse=s=>{this.traverseBuffer((o,a,l)=>{if(a){let u=l*2,f=e[l+6],h=t[u+14];return s(o,a,new Float32Array(i,l*4,6),f,h)}else{let u=Hi(l,e);return s(o,a,new Float32Array(i,l*4,6),u)}})}}};var Zd=new kt,hs=new Float32Array(6),ql=class{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(e){e={...Bl,...e},"maxLeafSize"in e&&(console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafSize}),Xd(this,e)}getRootRanges(){throw new Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw new Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(e,t,n,r){let s=1/0,o=1/0,a=1/0,l=-1/0,u=-1/0,f=-1/0;for(let h=e,c=e+t;h<c;h++){this.writePrimitiveBounds(h,hs,0);let[p,x,M,m,g,S]=hs;p<s&&(s=p),m>l&&(l=m),x<o&&(o=x),g>u&&(u=g),M<a&&(a=M),S>f&&(f=S)}return n[r+0]=s,n[r+1]=o,n[r+2]=a,n[r+3]=l,n[r+4]=u,n[r+5]=f,n}computePrimitiveBounds(e,t,n){let r=n.offset||0;for(let s=e,o=e+t;s<o;s++){this.writePrimitiveBounds(s,hs,0);let[a,l,u,f,h,c]=hs,p=(a+f)/2,x=(l+h)/2,M=(u+c)/2,m=(f-a)/2,g=(h-l)/2,S=(c-u)/2,A=(s-r)*6;n[A+0]=p,n[A+1]=m+(Math.abs(p)+m)*rs,n[A+2]=x,n[A+3]=g+(Math.abs(x)+g)*rs,n[A+4]=M,n[A+5]=S+(Math.abs(M)+S)*rs}return n}shiftPrimitiveOffsets(e){let t=this._indirectBuffer;if(t)for(let n=0,r=t.length;n<r;n++)t[n]+=e;else{let n=this._roots;for(let r=0;r<n.length;r++){let s=n[r],o=new Uint32Array(s),a=new Uint16Array(s),l=s.byteLength/32;for(let u=0;u<l;u++){let f=8*u,h=2*f;pt(h,a)&&(o[f+6]+=e)}}}}traverse(e,t=0){Xl.setBVH(this,t),Xl.traverse(e),Xl.reset()}refit(){let e=this._roots;for(let t=0,n=e.length;t<n;t++){let r=e[t],s=new Uint32Array(r),o=new Uint16Array(r),a=new Float32Array(r),l=r.byteLength/32;for(let u=l-1;u>=0;u--){let f=u*8,h=f*2;if(pt(h,o)){let p=St(f,s),x=Rt(h,o);this.writePrimitiveRangeBounds(p,x,hs,0),a.set(hs,f)}else{let p=Mt(f),x=Tt(f,s);for(let M=0;M<3;M++){let m=a[p+M],g=a[p+M+3],S=a[x+M],A=a[x+M+3];a[f+M]=m<S?m:S,a[f+M+3]=g>A?g:A}}}}}getBoundingBox(e){return e.makeEmpty(),this._roots.forEach(n=>{Ft(0,new Float32Array(n),Zd),e.union(Zd)}),e}shapecast(e){let{boundsTraverseOrder:t,intersectsBounds:n,intersectsRange:r,intersectsPrimitive:s,scratchPrimitive:o,iterate:a}=e;if(r&&s){let h=r;r=(c,p,x,M,m)=>h(c,p,x,M,m)?!0:a(c,p,this,s,x,M,o)}else r||(s?r=(h,c,p,x)=>a(h,c,this,s,p,x,o):r=(h,c,p)=>p);let l=!1,u=0,f=this._roots;for(let h=0,c=f.length;h<c;h++){let p=f[h];if(l=qd(this,h,n,r,t,u),l)break;u+=p.byteLength/32}return l}bvhcast(e,t,n){let{intersectsRanges:r}=n;return Yd(this,e,t,r)}};function $d(){return typeof SharedArrayBuffer<"u"}function To(i){return i.index?i.index.count:i.attributes.position.count}function Yi(i){return To(i)/3}function Sh(i,e=ArrayBuffer){return i>65535?new Uint32Array(new e(4*i)):new Uint16Array(new e(2*i))}function Jd(i,e){if(!i.index){let t=i.attributes.position.count,n=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,r=Sh(t,n);i.setIndex(new xt(r,1));for(let s=0;s<t;s++)r[s]=s}}function Sy(i,e,t){let n=To(i)/t,r=e||i.drawRange,s=r.start/t,o=(r.start+r.count)/t,a=Math.max(0,s),l=Math.min(n,o)-a;return{offset:Math.floor(a),count:Math.floor(l)}}function by(i,e){return i.groups.map(t=>({offset:t.start/e,count:t.count/e}))}function bh(i,e,t){let n=Sy(i,e,t),r=by(i,t);if(!r.length)return[n];let s=[],o=n.offset,a=n.offset+n.count,l=To(i)/t,u=[];for(let c of r){let{offset:p,count:x}=c,M=p,m=isFinite(x)?x:l-p,g=p+m;M<a&&g>o&&(u.push({pos:Math.max(o,M),isStart:!0}),u.push({pos:Math.min(a,g),isStart:!1}))}u.sort((c,p)=>c.pos!==p.pos?c.pos-p.pos:c.type==="end"?-1:1);let f=0,h=null;for(let c of u){let p=c.pos;f!==0&&p!==h&&s.push({offset:h,count:p-h}),f+=c.isStart?1:-1,h=p}return s}function My(i,e){let t=i[i.length-1],n=t.offset+t.count>2**16,r=i.reduce((u,f)=>u+f.count,0),s=n?4:2,o=e?new SharedArrayBuffer(r*s):new ArrayBuffer(r*s),a=n?new Uint32Array(o):new Uint16Array(o),l=0;for(let u=0;u<i.length;u++){let{offset:f,count:h}=i[u];for(let c=0;c<h;c++)a[l+c]=f+c;l+=h}return a}var Yl=class extends ql{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(e){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(e){}constructor(e,t={}){if(e.isBufferGeometry){if(e.index&&e.index.isInterleavedBufferAttribute)throw new Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("BVH: Only BufferGeometries are supported.");if(t.useSharedArrayBuffer&&!$d())throw new Error("BVH: SharedArrayBuffer is not available.");super(),this.geometry=e,this.resolvePrimitiveIndex=t.indirect?n=>this._indirectBuffer[n]:n=>n,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,t={...Bl,...t},t[yo]||this.init(t)}init(e){let{geometry:t,primitiveStride:n}=this;if(e.indirect){let r=bh(t,e.range,n),s=My(r,e.useSharedArrayBuffer);this._indirectBuffer=s}else Jd(t,e);super.init(e),!t.boundingBox&&e.setBoundingBox&&(t.boundingBox=this.getBoundingBox(new kt))}getRootRanges(e){return this.indirect?[{offset:0,count:this._indirectBuffer.length}]:bh(this.geometry,e,this.primitiveStride)}raycastObject3D(){throw new Error("BVH: raycastObject3D() not implemented")}};var Fn=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(e,t){let n=1/0,r=-1/0;for(let s=0,o=e.length;s<o;s++){let l=e[s][t];n=l<n?l:n,r=l>r?l:r}this.min=n,this.max=r}setFromPoints(e,t){let n=1/0,r=-1/0;for(let s=0,o=t.length;s<o;s++){let a=t[s],l=e.dot(a);n=l<n?l:n,r=l>r?l:r}this.min=n,this.max=r}isSeparated(e){return this.min>e.max||e.min>this.max}};Fn.prototype.setFromBox=(function(){let i=new k;return function(t,n){let r=n.min,s=n.max,o=1/0,a=-1/0;for(let l=0;l<=1;l++)for(let u=0;u<=1;u++)for(let f=0;f<=1;f++){i.x=r.x*l+s.x*(1-l),i.y=r.y*u+s.y*(1-u),i.z=r.z*f+s.z*(1-f);let h=t.dot(i);o=Math.min(h,o),a=Math.max(h,a)}this.min=o,this.max=a}})();var Ty=(function(){let i=new k,e=new k,t=new k;return function(r,s,o){let a=r.start,l=i,u=s.start,f=e;t.subVectors(a,u),i.subVectors(r.end,r.start),e.subVectors(s.end,s.start);let h=t.dot(f),c=f.dot(l),p=f.dot(f),x=t.dot(l),m=l.dot(l)*p-c*c,g,S;m!==0?g=(h*c-x*p)/m:g=0,S=(h+g*c)/p,o.x=g,o.y=S}})(),wo=(function(){let i=new Be,e=new k,t=new k;return function(r,s,o,a){Ty(r,s,i);let l=i.x,u=i.y;if(l>=0&&l<=1&&u>=0&&u<=1){r.at(l,o),s.at(u,a);return}else if(l>=0&&l<=1){u<0?s.at(0,a):s.at(1,a),r.closestPointToPoint(a,!0,o);return}else if(u>=0&&u<=1){l<0?r.at(0,o):r.at(1,o),s.closestPointToPoint(o,!0,a);return}else{let f;l<0?f=r.start:f=r.end;let h;u<0?h=s.start:h=s.end;let c=e,p=t;if(r.closestPointToPoint(h,!0,e),s.closestPointToPoint(f,!0,t),c.distanceToSquared(h)<=p.distanceToSquared(f)){o.copy(c),a.copy(h);return}else{o.copy(f),a.copy(p);return}}}})(),Kd=(function(){let i=new k,e=new k,t=new yn,n=new Sn;return function(s,o){let{radius:a,center:l}=s,{a:u,b:f,c:h}=o;if(n.start=u,n.end=f,n.closestPointToPoint(l,!0,i).distanceTo(l)<=a||(n.start=u,n.end=h,n.closestPointToPoint(l,!0,i).distanceTo(l)<=a)||(n.start=f,n.end=h,n.closestPointToPoint(l,!0,i).distanceTo(l)<=a))return!0;let M=o.getPlane(t);if(Math.abs(M.distanceToPoint(l))<=a){let g=M.projectPoint(l,e);if(o.containsPoint(g))return!0}return!1}})();var wy=["x","y","z"],bi=1e-15,Qd=bi*bi;function kn(i){return Math.abs(i)<bi}var dn=class extends gn{constructor(...e){super(...e),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new k),this.satBounds=new Array(4).fill().map(()=>new Fn),this.points=[this.a,this.b,this.c],this.plane=new yn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new Sn,this.needsUpdate=!0}intersectsSphere(e){return Kd(e,this)}update(){let e=this.a,t=this.b,n=this.c,r=this.points,s=this.satAxes,o=this.satBounds,a=s[0],l=o[0];this.getNormal(a),l.setFromPoints(a,r);let u=s[1],f=o[1];u.subVectors(e,t),f.setFromPoints(u,r);let h=s[2],c=o[2];h.subVectors(t,n),c.setFromPoints(h,r);let p=s[3],x=o[3];p.subVectors(n,e),x.setFromPoints(p,r);let M=u.length(),m=h.length(),g=p.length();this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,M<bi?m<bi||g<bi?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(n)):m<bi?g<bi?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(e)):g<bi&&(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(n),this.degenerateSegment.end.copy(t)),this.plane.setFromNormalAndCoplanarPoint(a,e),this.needsUpdate=!1}};dn.prototype.closestPointToSegment=(function(){let i=new k,e=new k,t=new Sn;return function(r,s=null,o=null){let{start:a,end:l}=r,u=this.points,f,h=1/0;for(let c=0;c<3;c++){let p=(c+1)%3;t.start.copy(u[c]),t.end.copy(u[p]),wo(t,r,i,e),f=i.distanceToSquared(e),f<h&&(h=f,s&&s.copy(i),o&&o.copy(e))}return this.closestPointToPoint(a,i),f=a.distanceToSquared(i),f<h&&(h=f,s&&s.copy(i),o&&o.copy(a)),this.closestPointToPoint(l,i),f=l.distanceToSquared(i),f<h&&(h=f,s&&s.copy(i),o&&o.copy(l)),Math.sqrt(h)}})();dn.prototype.intersectsTriangle=(function(){let i=new dn,e=new Fn,t=new Fn,n=new k,r=new k,s=new k,o=new k,a=new Sn,l=new Sn,u=new k,f=new Be,h=new Be;function c(A,y,T,E){let I=n;!A.isDegenerateIntoPoint&&!A.isDegenerateIntoSegment?I.copy(A.plane.normal):I.copy(y.plane.normal);let _=A.satBounds,R=A.satAxes;for(let F=1;F<4;F++){let z=_[F],U=R[F];if(e.setFromPoints(U,y.points),z.isSeparated(e)||(o.copy(I).cross(U),e.setFromPoints(o,A.points),t.setFromPoints(o,y.points),e.isSeparated(t)))return!1}let P=y.satBounds,N=y.satAxes;for(let F=1;F<4;F++){let z=P[F],U=N[F];if(e.setFromPoints(U,A.points),z.isSeparated(e)||(o.crossVectors(I,U),e.setFromPoints(o,A.points),t.setFromPoints(o,y.points),e.isSeparated(t)))return!1}return T&&(E||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),T.start.set(0,0,0),T.end.set(0,0,0)),!0}function p(A,y,T,E,I,_,R,P,N,F,z){let U=R/(R-P);F.x=E+(I-E)*U,z.start.subVectors(y,A).multiplyScalar(U).add(A),U=R/(R-N),F.y=E+(_-E)*U,z.end.subVectors(T,A).multiplyScalar(U).add(A)}function x(A,y,T,E,I,_,R,P,N,F,z){if(I>0)p(A.c,A.a,A.b,E,y,T,N,R,P,F,z);else if(_>0)p(A.b,A.a,A.c,T,y,E,P,R,N,F,z);else if(P*N>0||R!=0)p(A.a,A.b,A.c,y,T,E,R,P,N,F,z);else if(P!=0)p(A.b,A.a,A.c,T,y,E,P,R,N,F,z);else if(N!=0)p(A.c,A.a,A.b,E,y,T,N,R,P,F,z);else return!0;return!1}function M(A,y,T,E){let I=y.degenerateSegment,_=A.plane.distanceToPoint(I.start),R=A.plane.distanceToPoint(I.end);return kn(_)?kn(R)?c(A,y,T,E):(T&&(T.start.copy(I.start),T.end.copy(I.start)),A.containsPoint(I.start)):kn(R)?(T&&(T.start.copy(I.end),T.end.copy(I.end)),A.containsPoint(I.end)):A.plane.intersectLine(I,n)!=null?(T&&(T.start.copy(n),T.end.copy(n)),A.containsPoint(n)):!1}function m(A,y,T){let E=y.a;return kn(A.plane.distanceToPoint(E))&&A.containsPoint(E)?(T&&(T.start.copy(E),T.end.copy(E)),!0):!1}function g(A,y,T){let E=A.degenerateSegment,I=y.a;return E.closestPointToPoint(I,!0,n),I.distanceToSquared(n)<Qd?(T&&(T.start.copy(I),T.end.copy(I)),!0):!1}function S(A,y,T,E){if(A.isDegenerateIntoSegment)if(y.isDegenerateIntoSegment){let I=A.degenerateSegment,_=y.degenerateSegment,R=r,P=s;I.delta(R),_.delta(P);let N=n.subVectors(_.start,I.start),F=R.x*P.y-R.y*P.x;if(kn(F))return!1;let z=(N.x*P.y-N.y*P.x)/F,U=-(R.x*N.y-R.y*N.x)/F;if(z<0||z>1||U<0||U>1)return!1;let V=I.start.z+R.z*z,q=_.start.z+P.z*U;return kn(V-q)?(T&&(T.start.copy(I.start).addScaledVector(R,z),T.end.copy(I.start).addScaledVector(R,z)),!0):!1}else return y.isDegenerateIntoPoint?g(A,y,T):M(y,A,T,E);else{if(A.isDegenerateIntoPoint)return y.isDegenerateIntoPoint?y.a.distanceToSquared(A.a)<Qd?(T&&(T.start.copy(A.a),T.end.copy(A.a)),!0):!1:y.isDegenerateIntoSegment?g(y,A,T):m(y,A,T);if(y.isDegenerateIntoPoint)return m(A,y,T);if(y.isDegenerateIntoSegment)return M(A,y,T,E)}}return function(y,T=null,E=!1){this.needsUpdate&&this.update(),y.isExtendedTriangle?y.needsUpdate&&y.update():(i.copy(y),i.update(),y=i);let I=S(this,y,T,E);if(I!==void 0)return I;let _=this.plane,R=y.plane,P=R.distanceToPoint(this.a),N=R.distanceToPoint(this.b),F=R.distanceToPoint(this.c);kn(P)&&(P=0),kn(N)&&(N=0),kn(F)&&(F=0);let z=P*N,U=P*F;if(z>0&&U>0)return!1;let V=_.distanceToPoint(y.a),q=_.distanceToPoint(y.b),te=_.distanceToPoint(y.c);kn(V)&&(V=0),kn(q)&&(q=0),kn(te)&&(te=0);let he=V*q,Q=V*te;if(he>0&&Q>0)return!1;r.copy(_.normal),s.copy(R.normal);let ie=r.cross(s),le=0,Re=Math.abs(ie.x),ye=Math.abs(ie.y);ye>Re&&(Re=ye,le=1),Math.abs(ie.z)>Re&&(le=2);let Xe=wy[le],rt=this.a[Xe],J=this.b[Xe],ce=this.c[Xe],Ee=y.a[Xe],Ye=y.b[Xe],Ie=y.c[Xe];if(x(this,rt,J,ce,z,U,P,N,F,f,a))return c(this,y,T,E);if(x(y,Ee,Ye,Ie,he,Q,V,q,te,h,l))return c(this,y,T,E);if(f.y<f.x){let Ke=f.y;f.y=f.x,f.x=Ke,u.copy(a.start),a.start.copy(a.end),a.end.copy(u)}if(h.y<h.x){let Ke=h.y;h.y=h.x,h.x=Ke,u.copy(l.start),l.start.copy(l.end),l.end.copy(u)}return f.y<h.x||h.y<f.x?!1:(T&&(h.x>f.x?T.start.copy(l.start):T.start.copy(a.start),h.y<f.y?T.end.copy(l.end):T.end.copy(a.end)),!0)}})();dn.prototype.distanceToPoint=(function(){let i=new k;return function(t){return this.closestPointToPoint(t,i),t.distanceTo(i)}})();dn.prototype.distanceToTriangle=(function(){let i=new k,e=new k,t=["a","b","c"],n=new Sn,r=new Sn;return function(o,a=null,l=null){let u=a||l?n:null;if(this.intersectsTriangle(o,u,!0))return(a||l)&&(a&&u.getCenter(a),l&&u.getCenter(l)),0;let f=1/0;for(let h=0;h<3;h++){let c,p=t[h],x=o[p];this.closestPointToPoint(x,i),c=x.distanceToSquared(i),c<f&&(f=c,a&&a.copy(i),l&&l.copy(x));let M=this[p];o.closestPointToPoint(M,i),c=M.distanceToSquared(i),c<f&&(f=c,a&&a.copy(M),l&&l.copy(i))}for(let h=0;h<3;h++){let c=t[h],p=t[(h+1)%3];n.set(this[c],this[p]);for(let x=0;x<3;x++){let M=t[x],m=t[(x+1)%3];r.set(o[M],o[m]),wo(n,r,i,e);let g=i.distanceToSquared(e);g<f&&(f=g,a&&a.copy(i),l&&l.copy(e))}}return Math.sqrt(f)}})();var Gt=class{constructor(e,t,n){this.isOrientedBox=!0,this.min=new k,this.max=new k,this.matrix=new Ze,this.invMatrix=new Ze,this.points=new Array(8).fill().map(()=>new k),this.satAxes=new Array(3).fill().map(()=>new k),this.satBounds=new Array(3).fill().map(()=>new Fn),this.alignedSatBounds=new Array(3).fill().map(()=>new Fn),this.needsUpdate=!1,e&&this.min.copy(e),t&&this.max.copy(t),n&&this.matrix.copy(n)}set(e,t,n){this.min.copy(e),this.max.copy(t),this.matrix.copy(n),this.needsUpdate=!0}copy(e){this.min.copy(e.min),this.max.copy(e.max),this.matrix.copy(e.matrix),this.needsUpdate=!0}};Gt.prototype.update=(function(){return function(){let e=this.matrix,t=this.min,n=this.max,r=this.points;for(let u=0;u<=1;u++)for(let f=0;f<=1;f++)for(let h=0;h<=1;h++){let c=1*u|2*f|4*h,p=r[c];p.x=u?n.x:t.x,p.y=f?n.y:t.y,p.z=h?n.z:t.z,p.applyMatrix4(e)}let s=this.satBounds,o=this.satAxes,a=r[0];for(let u=0;u<3;u++){let f=o[u],h=s[u],c=1<<u,p=r[c];f.subVectors(a,p),h.setFromPoints(f,r)}let l=this.alignedSatBounds;l[0].setFromPointsField(r,"x"),l[1].setFromPointsField(r,"y"),l[2].setFromPointsField(r,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();Gt.prototype.intersectsBox=(function(){let i=new Fn;return function(t){this.needsUpdate&&this.update();let n=t.min,r=t.max,s=this.satBounds,o=this.satAxes,a=this.alignedSatBounds;if(i.min=n.x,i.max=r.x,a[0].isSeparated(i)||(i.min=n.y,i.max=r.y,a[1].isSeparated(i))||(i.min=n.z,i.max=r.z,a[2].isSeparated(i)))return!1;for(let l=0;l<3;l++){let u=o[l],f=s[l];if(i.setFromBox(u,t),f.isSeparated(i))return!1}return!0}})();Gt.prototype.intersectsTriangle=(function(){let i=new dn,e=new Array(3),t=new Fn,n=new Fn,r=new k;return function(o){this.needsUpdate&&this.update(),o.isExtendedTriangle?o.needsUpdate&&o.update():(i.copy(o),i.update(),o=i);let a=this.satBounds,l=this.satAxes;e[0]=o.a,e[1]=o.b,e[2]=o.c;for(let c=0;c<3;c++){let p=a[c],x=l[c];if(t.setFromPoints(x,e),p.isSeparated(t))return!1}let u=o.satBounds,f=o.satAxes,h=this.points;for(let c=0;c<3;c++){let p=u[c],x=f[c];if(t.setFromPoints(x,h),p.isSeparated(t))return!1}for(let c=0;c<3;c++){let p=l[c];for(let x=0;x<4;x++){let M=f[x];if(r.crossVectors(p,M),t.setFromPoints(r,e),n.setFromPoints(r,h),t.isSeparated(n))return!1}}return!0}})();Gt.prototype.closestPointToPoint=(function(){return function(e,t){return this.needsUpdate&&this.update(),t.copy(e).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),t}})();Gt.prototype.distanceToPoint=(function(){let i=new k;return function(t){return this.closestPointToPoint(t,i),t.distanceTo(i)}})();Gt.prototype.distanceToBox=(function(){let i=["x","y","z"],e=new Array(12).fill().map(()=>new Sn),t=new Array(12).fill().map(()=>new Sn),n=new k,r=new k;return function(o,a=0,l=null,u=null){if(this.needsUpdate&&this.update(),this.intersectsBox(o))return(l||u)&&(o.getCenter(r),this.closestPointToPoint(r,n),o.closestPointToPoint(n,r),l&&l.copy(n),u&&u.copy(r)),0;let f=a*a,h=o.min,c=o.max,p=this.points,x=1/0;for(let m=0;m<8;m++){let g=p[m];r.copy(g).clamp(h,c);let S=g.distanceToSquared(r);if(S<x&&(x=S,l&&l.copy(g),u&&u.copy(r),S<f))return Math.sqrt(S)}let M=0;for(let m=0;m<3;m++)for(let g=0;g<=1;g++)for(let S=0;S<=1;S++){let A=(m+1)%3,y=(m+2)%3,T=g<<A|S<<y,E=1<<m|g<<A|S<<y,I=p[T],_=p[E];e[M].set(I,_);let P=i[m],N=i[A],F=i[y],z=t[M],U=z.start,V=z.end;U[P]=h[P],U[N]=g?h[N]:c[N],U[F]=S?h[F]:c[N],V[P]=c[P],V[N]=g?h[N]:c[N],V[F]=S?h[F]:c[N],M++}for(let m=0;m<=1;m++)for(let g=0;g<=1;g++)for(let S=0;S<=1;S++){r.x=m?c.x:h.x,r.y=g?c.y:h.y,r.z=S?c.z:h.z,this.closestPointToPoint(r,n);let A=r.distanceToSquared(n);if(A<x&&(x=A,l&&l.copy(n),u&&u.copy(r),A<f))return Math.sqrt(A)}for(let m=0;m<12;m++){let g=e[m];for(let S=0;S<12;S++){let A=t[S];wo(g,A,n,r);let y=n.distanceToSquared(r);if(y<x&&(x=y,l&&l.copy(n),u&&u.copy(r),y<f))return Math.sqrt(y)}}return Math.sqrt(x)}})();var Mh=class extends Wi{constructor(){super(()=>new dn)}},wn=new Mh;var Ao=new k,Th=new k;function jd(i,e,t={},n=0,r=1/0){let s=n*n,o=r*r,a=1/0,l=null;if(i.shapecast({boundsTraverseOrder:f=>(Ao.copy(e).clamp(f.min,f.max),Ao.distanceToSquared(e)),intersectsBounds:(f,h,c)=>c<a&&c<o,intersectsTriangle:(f,h)=>{f.closestPointToPoint(e,Ao);let c=e.distanceToSquared(Ao);return c<a&&(Th.copy(Ao),a=c,l=h),c<s}}),a===1/0)return null;let u=Math.sqrt(a);return t.point?t.point.copy(Th):t.point=Th.clone(),t.distance=u,t.faceIndex=l,t}var Zl=parseInt("186")>=169,Ay=parseInt("186")<=161,fr=new k,dr=new k,pr=new k,$l=new Be,Jl=new Be,Kl=new Be,ep=new k,tp=new k,np=new k,Eo=new k;function Ey(i,e,t,n,r,s,o,a){let l;if(s===$t?l=i.intersectTriangle(n,t,e,!0,r):l=i.intersectTriangle(e,t,n,s!==xn,r),l===null)return null;let u=i.origin.distanceTo(r);return u<o||u>a?null:{distance:u,point:r.clone()}}function ip(i,e,t,n,r,s,o,a,l,u,f){fr.fromBufferAttribute(e,s),dr.fromBufferAttribute(e,o),pr.fromBufferAttribute(e,a);let h=Ey(i,fr,dr,pr,Eo,l,u,f);if(h){if(n){$l.fromBufferAttribute(n,s),Jl.fromBufferAttribute(n,o),Kl.fromBufferAttribute(n,a),h.uv=new Be;let p=gn.getInterpolation(Eo,fr,dr,pr,$l,Jl,Kl,h.uv);Zl||(h.uv=p)}if(r){$l.fromBufferAttribute(r,s),Jl.fromBufferAttribute(r,o),Kl.fromBufferAttribute(r,a),h.uv1=new Be;let p=gn.getInterpolation(Eo,fr,dr,pr,$l,Jl,Kl,h.uv1);Zl||(h.uv1=p),Ay&&(h.uv2=h.uv1)}if(t){ep.fromBufferAttribute(t,s),tp.fromBufferAttribute(t,o),np.fromBufferAttribute(t,a),h.normal=new k;let p=gn.getInterpolation(Eo,fr,dr,pr,ep,tp,np,h.normal);h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1),Zl||(h.normal=p)}let c={a:s,b:o,c:a,normal:new k,materialIndex:0};if(gn.getNormal(fr,dr,pr,c.normal),h.face=c,h.faceIndex=s,Zl){let p=new k;gn.getBarycoord(Eo,fr,dr,pr,p),h.barycoord=p}}return h}function rp(i){return i&&i.isMaterial?i.side:i}function fs(i,e,t,n,r,s,o){let a=n*3,l=a+0,u=a+1,f=a+2,{index:h,groups:c}=i;i.index&&(l=h.getX(l),u=h.getX(u),f=h.getX(f));let{position:p,normal:x,uv:M,uv1:m}=i.attributes;if(Array.isArray(e)){let g=n*3;for(let S=0,A=c.length;S<A;S++){let{start:y,count:T,materialIndex:E}=c[S];if(g>=y&&g<y+T){let I=rp(e[E]),_=ip(t,p,x,M,m,l,u,f,I,s,o);if(_)if(_.faceIndex=n,_.face.materialIndex=E,r)r.push(_);else return _}}}else{let g=rp(e),S=ip(t,p,x,M,m,l,u,f,g,s,o);if(S)if(S.faceIndex=n,S.face.materialIndex=0,r)r.push(S);else return S}return null}function Nt(i,e,t,n){let r=i.a,s=i.b,o=i.c,a=e,l=e+1,u=e+2;t&&(a=t.getX(a),l=t.getX(l),u=t.getX(u)),r.x=n.getX(a),r.y=n.getY(a),r.z=n.getZ(a),s.x=n.getX(l),s.y=n.getY(l),s.z=n.getZ(l),o.x=n.getX(u),o.y=n.getY(u),o.z=n.getZ(u)}function sp(i,e,t,n,r,s,o,a){let{geometry:l,_indirectBuffer:u}=i;for(let f=n,h=n+r;f<h;f++)fs(l,e,t,f,s,o,a)}function op(i,e,t,n,r,s,o){let{geometry:a,_indirectBuffer:l}=i,u=1/0,f=null;for(let h=n,c=n+r;h<c;h++){let p;p=fs(a,e,t,h,null,s,o),p&&p.distance<u&&(f=p,u=p.distance)}return f}function ap(i,e,t,n,r,s,o){let{geometry:a}=t,{index:l}=a,u=a.attributes.position;for(let f=i,h=e+i;f<h;f++){let c;if(c=f,Nt(o,c*3,l,u),o.needsUpdate=!0,n(o,c,r,s))return!0}return!1}function lp(i,e=null){e&&Array.isArray(e)&&(e=new Set(e));let t=i.geometry,n=t.index?t.index.array:null,r=t.attributes.position,s,o,a,l,u=0,f=i._roots;for(let c=0,p=f.length;c<p;c++)s=f[c],o=new Uint32Array(s),a=new Uint16Array(s),l=new Float32Array(s),h(0,u),u+=s.byteLength;function h(c,p,x=!1){let M=c*2;if(pt(M,a)){let m=St(c,o),g=Rt(M,a),S=1/0,A=1/0,y=1/0,T=-1/0,E=-1/0,I=-1/0;for(let _=3*m,R=3*(m+g);_<R;_++){let P=n[_],N=r.getX(P),F=r.getY(P),z=r.getZ(P);N<S&&(S=N),N>T&&(T=N),F<A&&(A=F),F>E&&(E=F),z<y&&(y=z),z>I&&(I=z)}return l[c+0]!==S||l[c+1]!==A||l[c+2]!==y||l[c+3]!==T||l[c+4]!==E||l[c+5]!==I?(l[c+0]=S,l[c+1]=A,l[c+2]=y,l[c+3]=T,l[c+4]=E,l[c+5]=I,!0):!1}else{let m=Mt(c),g=Tt(c,o),S=x,A=!1,y=!1;if(e){if(!S){let P=m/8+p/32,N=g/8+p/32;A=e.has(P),y=e.has(N),S=!A&&!y}}else A=!0,y=!0;let T=S||A,E=S||y,I=!1;T&&(I=h(m,p,S));let _=!1;E&&(_=h(g,p,S));let R=I||_;if(R)for(let P=0;P<3;P++){let N=m+P,F=g+P,z=l[N],U=l[N+3],V=l[F],q=l[F+3];l[c+P]=z<V?z:V,l[c+P+3]=U>q?U:q}return R}}}function Vn(i,e,t,n,r){let s,o,a,l,u,f,h=1/t.direction.x,c=1/t.direction.y,p=1/t.direction.z,x=t.origin.x,M=t.origin.y,m=t.origin.z,g=e[i],S=e[i+3],A=e[i+1],y=e[i+3+1],T=e[i+2],E=e[i+3+2];return h>=0?(s=(g-x)*h,o=(S-x)*h):(s=(S-x)*h,o=(g-x)*h),c>=0?(a=(A-M)*c,l=(y-M)*c):(a=(y-M)*c,l=(A-M)*c),s>l||a>o||((a>s||isNaN(s))&&(s=a),(l<o||isNaN(o))&&(o=l),p>=0?(u=(T-m)*p,f=(E-m)*p):(u=(E-m)*p,f=(T-m)*p),s>f||u>o)?!1:((u>s||s!==s)&&(s=u),(f<o||o!==o)&&(o=f),s<=r&&o>=n)}function cp(i,e,t,n,r,s,o,a){let{geometry:l,_indirectBuffer:u}=i;for(let f=n,h=n+r;f<h;f++){let c=u?u[f]:f;fs(l,e,t,c,s,o,a)}}function up(i,e,t,n,r,s,o){let{geometry:a,_indirectBuffer:l}=i,u=1/0,f=null;for(let h=n,c=n+r;h<c;h++){let p;p=fs(a,e,t,l?l[h]:h,null,s,o),p&&p.distance<u&&(f=p,u=p.distance)}return f}function hp(i,e,t,n,r,s,o){let{geometry:a}=t,{index:l}=a,u=a.attributes.position;for(let f=i,h=e+i;f<h;f++){let c;if(c=t.resolveTriangleIndex(f),Nt(o,c*3,l,u),o.needsUpdate=!0,n(o,c,r,s))return!0}return!1}function fp(i,e,t,n,r,s,o){_t.setBuffer(i._roots[e]),wh(0,i,t,n,r,s,o),_t.clearBuffer()}function wh(i,e,t,n,r,s,o){let{float32Array:a,uint16Array:l,uint32Array:u}=_t,f=i*2;if(pt(f,l)){let c=St(i,u),p=Rt(f,l);sp(e,t,n,c,p,r,s,o)}else{let c=Mt(i);Vn(c,a,n,s,o)&&wh(c,e,t,n,r,s,o);let p=Tt(i,u);Vn(p,a,n,s,o)&&wh(p,e,t,n,r,s,o)}}var Ry=["x","y","z"];function dp(i,e,t,n,r,s){_t.setBuffer(i._roots[e]);let o=Ah(0,i,t,n,r,s);return _t.clearBuffer(),o}function Ah(i,e,t,n,r,s){let{float32Array:o,uint16Array:a,uint32Array:l}=_t,u=i*2;if(pt(u,a)){let h=St(i,l),c=Rt(u,a);return op(e,t,n,h,c,r,s)}else{let h=Hi(i,l),c=Ry[h],x=n.direction[c]>=0,M,m;x?(M=Mt(i),m=Tt(i,l)):(M=Tt(i,l),m=Mt(i));let S=Vn(M,o,n,r,s)?Ah(M,e,t,n,r,s):null;if(S){let T=S.point[c];if(x?T<=o[m+h]:T>=o[m+h+3])return S}let y=Vn(m,o,n,r,s)?Ah(m,e,t,n,r,s):null;return S&&y?S.distance<=y.distance?S:y:S||y||null}}var Ql=new kt,ds=new dn,ps=new dn,Ro=new Ze,pp=new Gt,jl=new Gt;function mp(i,e,t,n){_t.setBuffer(i._roots[e]);let r=Eh(0,i,t,n);return _t.clearBuffer(),r}function Eh(i,e,t,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:a}=_t,l=i*2;if(r===null&&(t.boundingBox||t.computeBoundingBox(),pp.set(t.boundingBox.min,t.boundingBox.max,n),r=pp),pt(l,o)){let f=e.geometry,h=f.index,c=f.attributes.position,p=t.index,x=t.attributes.position,M=St(i,a),m=Rt(l,o);if(Ro.copy(n).invert(),t.boundsTree)return Ft(i,s,jl),jl.matrix.copy(Ro),jl.needsUpdate=!0,t.boundsTree.shapecast({intersectsBounds:S=>jl.intersectsBox(S),intersectsTriangle:S=>{S.a.applyMatrix4(n),S.b.applyMatrix4(n),S.c.applyMatrix4(n),S.needsUpdate=!0;for(let A=M*3,y=(m+M)*3;A<y;A+=3)if(Nt(ps,A,h,c),ps.needsUpdate=!0,S.intersectsTriangle(ps))return!0;return!1}});{let g=Yi(t);for(let S=M*3,A=(m+M)*3;S<A;S+=3){Nt(ds,S,h,c),ds.a.applyMatrix4(Ro),ds.b.applyMatrix4(Ro),ds.c.applyMatrix4(Ro),ds.needsUpdate=!0;for(let y=0,T=g*3;y<T;y+=3)if(Nt(ps,y,p,x),ps.needsUpdate=!0,ds.intersectsTriangle(ps))return!0}}}else{let f=Mt(i),h=Tt(i,a);return Ft(f,s,Ql),!!(r.intersectsBox(Ql)&&Eh(f,e,t,n,r)||(Ft(h,s,Ql),r.intersectsBox(Ql)&&Eh(h,e,t,n,r)))}}var ec=new Ze,Rh=new Gt,Co=new Gt,Cy=new k,Iy=new k,Py=new k,Dy=new k;function gp(i,e,t,n={},r={},s=0,o=1/0){e.boundingBox||e.computeBoundingBox(),Rh.set(e.boundingBox.min,e.boundingBox.max,t),Rh.needsUpdate=!0;let a=i.geometry,l=a.attributes.position,u=a.index,f=e.attributes.position,h=e.index,c=wn.getPrimitive(),p=wn.getPrimitive(),x=Cy,M=Iy,m=null,g=null;r&&(m=Py,g=Dy);let S=1/0,A=null,y=null;return ec.copy(t).invert(),Co.matrix.copy(ec),i.shapecast({boundsTraverseOrder:T=>Rh.distanceToBox(T),intersectsBounds:(T,E,I)=>I<S&&I<o?(E&&(Co.min.copy(T.min),Co.max.copy(T.max),Co.needsUpdate=!0),!0):!1,intersectsRange:(T,E)=>{if(e.boundsTree)return e.boundsTree.shapecast({boundsTraverseOrder:_=>Co.distanceToBox(_),intersectsBounds:(_,R,P)=>P<S&&P<o,intersectsRange:(_,R)=>{for(let P=_,N=_+R;P<N;P++){Nt(p,3*P,h,f),p.a.applyMatrix4(t),p.b.applyMatrix4(t),p.c.applyMatrix4(t),p.needsUpdate=!0;for(let F=T,z=T+E;F<z;F++){Nt(c,3*F,u,l),c.needsUpdate=!0;let U=c.distanceToTriangle(p,x,m);if(U<S&&(M.copy(x),g&&g.copy(m),S=U,A=F,y=P),U<s)return!0}}}});{let I=Yi(e);for(let _=0,R=I;_<R;_++){Nt(p,3*_,h,f),p.a.applyMatrix4(t),p.b.applyMatrix4(t),p.c.applyMatrix4(t),p.needsUpdate=!0;for(let P=T,N=T+E;P<N;P++){Nt(c,3*P,u,l),c.needsUpdate=!0;let F=c.distanceToTriangle(p,x,m);if(F<S&&(M.copy(x),g&&g.copy(m),S=F,A=P,y=_),F<s)return!0}}}}}),wn.releasePrimitive(c),wn.releasePrimitive(p),S===1/0?null:(n.point?n.point.copy(M):n.point=M.clone(),n.distance=S,n.faceIndex=A,r&&(r.point?r.point.copy(g):r.point=g.clone(),r.point.applyMatrix4(ec),M.applyMatrix4(ec),r.distance=M.sub(r.point).length(),r.faceIndex=y),n)}function xp(i,e=null){e&&Array.isArray(e)&&(e=new Set(e));let t=i.geometry,n=t.index?t.index.array:null,r=t.attributes.position,s,o,a,l,u=0,f=i._roots;for(let c=0,p=f.length;c<p;c++)s=f[c],o=new Uint32Array(s),a=new Uint16Array(s),l=new Float32Array(s),h(0,u),u+=s.byteLength;function h(c,p,x=!1){let M=c*2;if(pt(M,a)){let m=St(c,o),g=Rt(M,a),S=1/0,A=1/0,y=1/0,T=-1/0,E=-1/0,I=-1/0;for(let _=m,R=m+g;_<R;_++){let P=3*i.resolveTriangleIndex(_);for(let N=0;N<3;N++){let F=P+N;F=n?n[F]:F;let z=r.getX(F),U=r.getY(F),V=r.getZ(F);z<S&&(S=z),z>T&&(T=z),U<A&&(A=U),U>E&&(E=U),V<y&&(y=V),V>I&&(I=V)}}return l[c+0]!==S||l[c+1]!==A||l[c+2]!==y||l[c+3]!==T||l[c+4]!==E||l[c+5]!==I?(l[c+0]=S,l[c+1]=A,l[c+2]=y,l[c+3]=T,l[c+4]=E,l[c+5]=I,!0):!1}else{let m=Mt(c),g=Tt(c,o),S=x,A=!1,y=!1;if(e){if(!S){let P=m/8+p/32,N=g/8+p/32;A=e.has(P),y=e.has(N),S=!A&&!y}}else A=!0,y=!0;let T=S||A,E=S||y,I=!1;T&&(I=h(m,p,S));let _=!1;E&&(_=h(g,p,S));let R=I||_;if(R)for(let P=0;P<3;P++){let N=m+P,F=g+P,z=l[N],U=l[N+3],V=l[F],q=l[F+3];l[c+P]=z<V?z:V,l[c+P+3]=U>q?U:q}return R}}}function vp(i,e,t,n,r,s,o){_t.setBuffer(i._roots[e]),Ch(0,i,t,n,r,s,o),_t.clearBuffer()}function Ch(i,e,t,n,r,s,o){let{float32Array:a,uint16Array:l,uint32Array:u}=_t,f=i*2;if(pt(f,l)){let c=St(i,u),p=Rt(f,l);cp(e,t,n,c,p,r,s,o)}else{let c=Mt(i);Vn(c,a,n,s,o)&&Ch(c,e,t,n,r,s,o);let p=Tt(i,u);Vn(p,a,n,s,o)&&Ch(p,e,t,n,r,s,o)}}var Ly=["x","y","z"];function _p(i,e,t,n,r,s){_t.setBuffer(i._roots[e]);let o=Ih(0,i,t,n,r,s);return _t.clearBuffer(),o}function Ih(i,e,t,n,r,s){let{float32Array:o,uint16Array:a,uint32Array:l}=_t,u=i*2;if(pt(u,a)){let h=St(i,l),c=Rt(u,a);return up(e,t,n,h,c,r,s)}else{let h=Hi(i,l),c=Ly[h],x=n.direction[c]>=0,M,m;x?(M=Mt(i),m=Tt(i,l)):(M=Tt(i,l),m=Mt(i));let S=Vn(M,o,n,r,s)?Ih(M,e,t,n,r,s):null;if(S){let T=S.point[c];if(x?T<=o[m+h]:T>=o[m+h+3])return S}let y=Vn(m,o,n,r,s)?Ih(m,e,t,n,r,s):null;return S&&y?S.distance<=y.distance?S:y:S||y||null}}var tc=new kt,ms=new dn,gs=new dn,Io=new Ze,yp=new Gt,nc=new Gt;function Sp(i,e,t,n){_t.setBuffer(i._roots[e]);let r=Ph(0,i,t,n);return _t.clearBuffer(),r}function Ph(i,e,t,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:a}=_t,l=i*2;if(r===null&&(t.boundingBox||t.computeBoundingBox(),yp.set(t.boundingBox.min,t.boundingBox.max,n),r=yp),pt(l,o)){let f=e.geometry,h=f.index,c=f.attributes.position,p=t.index,x=t.attributes.position,M=St(i,a),m=Rt(l,o);if(Io.copy(n).invert(),t.boundsTree)return Ft(i,s,nc),nc.matrix.copy(Io),nc.needsUpdate=!0,t.boundsTree.shapecast({intersectsBounds:S=>nc.intersectsBox(S),intersectsTriangle:S=>{S.a.applyMatrix4(n),S.b.applyMatrix4(n),S.c.applyMatrix4(n),S.needsUpdate=!0;for(let A=M,y=m+M;A<y;A++)if(Nt(gs,3*e.resolveTriangleIndex(A),h,c),gs.needsUpdate=!0,S.intersectsTriangle(gs))return!0;return!1}});{let g=Yi(t);for(let S=M,A=m+M;S<A;S++){let y=e.resolveTriangleIndex(S);Nt(ms,3*y,h,c),ms.a.applyMatrix4(Io),ms.b.applyMatrix4(Io),ms.c.applyMatrix4(Io),ms.needsUpdate=!0;for(let T=0,E=g*3;T<E;T+=3)if(Nt(gs,T,p,x),gs.needsUpdate=!0,ms.intersectsTriangle(gs))return!0}}}else{let f=Mt(i),h=Tt(i,a);return Ft(f,s,tc),!!(r.intersectsBox(tc)&&Ph(f,e,t,n,r)||(Ft(h,s,tc),r.intersectsBox(tc)&&Ph(h,e,t,n,r)))}}var ic=new Ze,Dh=new Gt,Po=new Gt,Fy=new k,Ny=new k,Uy=new k,By=new k;function bp(i,e,t,n={},r={},s=0,o=1/0){e.boundingBox||e.computeBoundingBox(),Dh.set(e.boundingBox.min,e.boundingBox.max,t),Dh.needsUpdate=!0;let a=i.geometry,l=a.attributes.position,u=a.index,f=e.attributes.position,h=e.index,c=wn.getPrimitive(),p=wn.getPrimitive(),x=Fy,M=Ny,m=null,g=null;r&&(m=Uy,g=By);let S=1/0,A=null,y=null;return ic.copy(t).invert(),Po.matrix.copy(ic),i.shapecast({boundsTraverseOrder:T=>Dh.distanceToBox(T),intersectsBounds:(T,E,I)=>I<S&&I<o?(E&&(Po.min.copy(T.min),Po.max.copy(T.max),Po.needsUpdate=!0),!0):!1,intersectsRange:(T,E)=>{if(e.boundsTree){let I=e.boundsTree;return I.shapecast({boundsTraverseOrder:_=>Po.distanceToBox(_),intersectsBounds:(_,R,P)=>P<S&&P<o,intersectsRange:(_,R)=>{for(let P=_,N=_+R;P<N;P++){let F=I.resolveTriangleIndex(P);Nt(p,3*F,h,f),p.a.applyMatrix4(t),p.b.applyMatrix4(t),p.c.applyMatrix4(t),p.needsUpdate=!0;for(let z=T,U=T+E;z<U;z++){let V=i.resolveTriangleIndex(z);Nt(c,3*V,u,l),c.needsUpdate=!0;let q=c.distanceToTriangle(p,x,m);if(q<S&&(M.copy(x),g&&g.copy(m),S=q,A=z,y=P),q<s)return!0}}}})}else{let I=Yi(e);for(let _=0,R=I;_<R;_++){Nt(p,3*_,h,f),p.a.applyMatrix4(t),p.b.applyMatrix4(t),p.c.applyMatrix4(t),p.needsUpdate=!0;for(let P=T,N=T+E;P<N;P++){let F=i.resolveTriangleIndex(P);Nt(c,3*F,u,l),c.needsUpdate=!0;let z=c.distanceToTriangle(p,x,m);if(z<S&&(M.copy(x),g&&g.copy(m),S=z,A=P,y=_),z<s)return!0}}}}}),wn.releasePrimitive(c),wn.releasePrimitive(p),S===1/0?null:(n.point?n.point.copy(M):n.point=M.clone(),n.distance=S,n.faceIndex=A,r&&(r.point?r.point.copy(g):r.point=g.clone(),r.point.applyMatrix4(ic),M.applyMatrix4(ic),r.distance=M.sub(r.point).length(),r.faceIndex=y),n)}function Lh(i,e,t){return i===null?null:(i.point.applyMatrix4(e.matrixWorld),i.distance=i.point.distanceTo(t.ray.origin),i.object=e,i)}var rc=new Gt,sc=new Xr,Mp=new k,Tp=new Ze,wp=new k,Fh=["getX","getY","getZ"],oc=class i extends Yl{static serialize(e,t={}){t={cloneBuffers:!0,...t};let n=e.geometry,r=e._roots,s=e._indirectBuffer,o=n.getIndex(),a={version:1,roots:null,index:null,indirectBuffer:null};return t.cloneBuffers?(a.roots=r.map(l=>l.slice()),a.index=o?o.array.slice():null,a.indirectBuffer=s?s.slice():null):(a.roots=r,a.index=o?o.array:null,a.indirectBuffer=s),a}static deserialize(e,t,n={}){n={setIndex:!0,indirect:!!e.indirectBuffer,...n};let{index:r,roots:s,indirectBuffer:o}=e;e.version||(console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),l(s));let a=new i(t,{...n,[yo]:!0});if(a._roots=s,a._indirectBuffer=o||null,n.setIndex){let u=t.getIndex();if(u===null){let f=new xt(e.index,1,!1);t.setIndex(f)}else u.array!==r&&(u.array.set(r),u.needsUpdate=!0)}return a;function l(u){for(let f=0;f<u.length;f++){let h=u[f],c=new Uint32Array(h),p=new Uint16Array(h);for(let x=0,M=h.byteLength/32;x<M;x++){let m=8*x,g=2*m;pt(g,p)||(c[m+6]=c[m+6]/8-x)}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(e,t={}){t.maxLeafTris&&(console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafTris}),super(e,t)}shiftTriangleOffsets(e){return super.shiftPrimitiveOffsets(e)}writePrimitiveBounds(e,t,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,a=r.index?r.index.array:null,u=(s?s[e]:e)*3,f=u+0,h=u+1,c=u+2;a&&(f=a[f],h=a[h],c=a[c]);for(let p=0;p<3;p++){let x=o[Fh[p]](f),M=o[Fh[p]](h),m=o[Fh[p]](c),g=x;M<g&&(g=M),m<g&&(g=m);let S=x;M>S&&(S=M),m>S&&(S=m),t[n+p]=g,t[n+p+3]=S}return t}computePrimitiveBounds(e,t,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,a=r.index?r.index.array:null,l=o.normalized;if(e<0||t+e-n.offset>n.length/6)throw new Error("MeshBVH: compute triangle bounds range is invalid.");let u=o.array,f=o.offset||0,h=3;o.isInterleavedBufferAttribute&&(h=o.data.stride);let c=["getX","getY","getZ"],p=n.offset;for(let x=e,M=e+t;x<M;x++){let g=(s?s[x]:x)*3,S=(x-p)*6,A=g+0,y=g+1,T=g+2;a&&(A=a[A],y=a[y],T=a[T]),l||(A=A*h+f,y=y*h+f,T=T*h+f);for(let E=0;E<3;E++){let I,_,R;l?(I=o[c[E]](A),_=o[c[E]](y),R=o[c[E]](T)):(I=u[A+E],_=u[y+E],R=u[T+E]);let P=I;_<P&&(P=_),R<P&&(P=R);let N=I;_>N&&(N=_),R>N&&(N=R);let F=(N-P)/2,z=E*2;n[S+z+0]=P+F,n[S+z+1]=F+(Math.abs(P)+F)*rs}}return n}raycastObject3D(e,t,n=[]){let{material:r}=e;if(r===void 0)return;Tp.copy(e.matrixWorld).invert(),sc.copy(t.ray).applyMatrix4(Tp),wp.setFromMatrixScale(e.matrixWorld),Mp.copy(sc.direction).multiply(wp);let s=Mp.length(),o=t.near/s,a=t.far/s;if(t.firstHitOnly===!0){let l=this.raycastFirst(sc,r,o,a);l=Lh(l,e,t),l&&n.push(l)}else{let l=this.raycast(sc,r,o,a);for(let u=0,f=l.length;u<f;u++){let h=Lh(l[u],e,t);h&&n.push(h)}}return n}refit(e=null){return(this.indirect?xp:lp)(this,e)}raycast(e,t=bn,n=0,r=1/0){let s=this._roots,o=[],a=this.indirect?vp:fp;for(let l=0,u=s.length;l<u;l++)a(this,l,t,e,o,n,r);return o}raycastFirst(e,t=bn,n=0,r=1/0){let s=this._roots,o=null,a=this.indirect?_p:dp;for(let l=0,u=s.length;l<u;l++){let f=a(this,l,t,e,n,r);f!=null&&(o==null||f.distance<o.distance)&&(o=f)}return o}intersectsGeometry(e,t){let n=!1,r=this._roots,s=this.indirect?Sp:mp;for(let o=0,a=r.length;o<a&&(n=s(this,o,e,t),!n);o++);return n}shapecast(e){let t=wn.getPrimitive(),n=super.shapecast({...e,intersectsPrimitive:e.intersectsTriangle,scratchPrimitive:t,iterate:this.indirect?hp:ap});return wn.releasePrimitive(t),n}bvhcast(e,t,n){let{intersectsRanges:r,intersectsTriangles:s}=n,o=wn.getPrimitive(),a=this.geometry.index,l=this.geometry.attributes.position,u=this.indirect?x=>{let M=this.resolveTriangleIndex(x);Nt(o,M*3,a,l)}:x=>{Nt(o,x*3,a,l)},f=wn.getPrimitive(),h=e.geometry.index,c=e.geometry.attributes.position,p=e.indirect?x=>{let M=e.resolveTriangleIndex(x);Nt(f,M*3,h,c)}:x=>{Nt(f,x*3,h,c)};if(s){if(!(e instanceof i))throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let x=(M,m,g,S,A,y,T,E)=>{for(let I=g,_=g+S;I<_;I++){p(I),f.a.applyMatrix4(t),f.b.applyMatrix4(t),f.c.applyMatrix4(t),f.needsUpdate=!0;for(let R=M,P=M+m;R<P;R++)if(u(R),o.needsUpdate=!0,s(o,f,R,I,A,y,T,E))return!0}return!1};if(r){let M=r;r=function(m,g,S,A,y,T,E,I){return M(m,g,S,A,y,T,E,I)?!0:x(m,g,S,A,y,T,E,I)}}else r=x}return super.bvhcast(e,t,{intersectsRanges:r})}intersectsBox(e,t){return rc.set(e.min,e.max,t),rc.needsUpdate=!0,this.shapecast({intersectsBounds:n=>rc.intersectsBox(n),intersectsTriangle:n=>rc.intersectsTriangle(n)})}intersectsSphere(e){return this.shapecast({intersectsBounds:t=>e.intersectsBox(t),intersectsTriangle:t=>t.intersectsSphere(e)})}closestPointToGeometry(e,t,n={},r={},s=0,o=1/0){return(this.indirect?bp:gp)(this,e,t,n,r,s,o)}closestPointToPoint(e,t={},n=0,r=1/0){return jd(this,e,t,n,r)}};function Oy(i){switch(i){case 1:return"R";case 2:return"RG";case 3:return"RGBA";case 4:return"RGBA"}throw new Error}function zy(i){switch(i){case 1:return Tn;case 2:return ln;case 3:return Ge;case 4:return Ge}}function Ap(i){switch(i){case 1:return Qr;case 2:return ki;case 3:return Vi;case 4:return Vi}}var ac=class extends It{constructor(){super(),this.minFilter=Qe,this.magFilter=Qe,this.generateMipmaps=!1,this.overrideItemSize=null,this._forcedType=null}updateFrom(e){let t=this.overrideItemSize,n=e.itemSize,r=e.count;if(t!==null){if(n*r%t!==0)throw new Error("VertexAttributeTexture: overrideItemSize must divide evenly into buffer length.");e.itemSize=t,e.count=r*n/t}let s=e.itemSize,o=e.count,a=e.normalized,l=e.array.constructor,u=l.BYTES_PER_ELEMENT,f=this._forcedType,h=s;if(f===null)switch(l){case Float32Array:f=et;break;case Uint8Array:case Uint16Array:case Uint32Array:f=an;break;case Int8Array:case Int16Array:case Int32Array:f=Oi;break}let c,p,x,M,m=Oy(s);switch(f){case et:x=1,p=zy(s),a&&u===1?(M=l,m+="8",l===Uint8Array?c=on:(c=Jr,m+="_SNORM")):(M=Float32Array,m+="32F",c=et);break;case Oi:m+=u*8+"I",x=a?Math.pow(2,l.BYTES_PER_ELEMENT*8-1):1,p=Ap(s),u===1?(M=Int8Array,c=Jr):u===2?(M=Int16Array,c=lo):(M=Int32Array,c=Oi);break;case an:m+=u*8+"UI",x=a?Math.pow(2,l.BYTES_PER_ELEMENT*8-1):1,p=Ap(s),u===1?(M=Uint8Array,c=on):u===2?(M=Uint16Array,c=Bi):(M=Uint32Array,c=an);break}h===3&&(p===Ge||p===Vi)&&(h=4);let g=Math.ceil(Math.sqrt(o))||1,S=h*g*g,A=new M(S),y=e.normalized;e.normalized=!1;for(let T=0;T<o;T++){let E=h*T;A[E]=e.getX(T)/x,s>=2&&(A[E+1]=e.getY(T)/x),s>=3&&(A[E+2]=e.getZ(T)/x,h===4&&(A[E+3]=1)),s>=4&&(A[E+3]=e.getW(T)/x)}e.normalized=y,this.internalFormat=m,this.format=p,this.type=c,this.image.width=g,this.image.height=g,this.image.data=A,this.needsUpdate=!0,this.dispose(),e.itemSize=n,e.count=r}},xs=class extends ac{constructor(){super(),this._forcedType=an}};var vs=class extends ac{constructor(){super(),this._forcedType=et}};var lc=class{constructor(){this.index=new xs,this.position=new vs,this.bvhBounds=new It,this.bvhContents=new It,this._cachedIndexAttr=null,this.index.overrideItemSize=3}updateFrom(e){let{geometry:t}=e;if(Vy(e,this.bvhBounds,this.bvhContents),this.position.updateFrom(t.attributes.position),e.indirect){let n=e._indirectBuffer;if(this._cachedIndexAttr===null||this._cachedIndexAttr.count!==n.length)if(t.index)this._cachedIndexAttr=t.index.clone();else{let r=Sh(To(t));this._cachedIndexAttr=new xt(r,1,!1)}ky(t,n,this._cachedIndexAttr),this.index.updateFrom(this._cachedIndexAttr)}else this.index.updateFrom(t.index)}dispose(){let{index:e,position:t,bvhBounds:n,bvhContents:r}=this;e&&e.dispose(),t&&t.dispose(),n&&n.dispose(),r&&r.dispose()}};function ky(i,e,t){let n=t.array,r=i.index?i.index.array:null;for(let s=0,o=e.length;s<o;s++){let a=3*s,l=3*e[s];for(let u=0;u<3;u++)n[a+u]=r?r[l+u]:l+u}}function Vy(i,e,t){let n=i._roots;if(n.length!==1)throw new Error("MeshBVHUniformStruct: Multi-root BVHs not supported.");let r=n[0],s=new Uint16Array(r),o=new Uint32Array(r),a=new Float32Array(r),l=r.byteLength/32,u=2*Math.ceil(Math.sqrt(l/2)),f=new Float32Array(4*u*u),h=Math.ceil(Math.sqrt(l)),c=new Uint32Array(2*h*h);for(let p=0;p<l;p++){let x=p*32/4,M=x*2,m=x;for(let g=0;g<3;g++)f[8*p+0+g]=a[m+0+g],f[8*p+4+g]=a[m+3+g];if(pt(M,s)){let g=Rt(M,s),S=St(x,o),A=-65536|g;c[p*2+0]=A,c[p*2+1]=S}else{let g=o[x+6],S=Hi(x,o);c[p*2+0]=S,c[p*2+1]=g}}e.image.data=f,e.image.width=u,e.image.height=u,e.format=Ge,e.type=et,e.internalFormat="RGBA32F",e.minFilter=Qe,e.magFilter=Qe,e.generateMipmaps=!1,e.needsUpdate=!0,e.dispose(),t.image.data=c,t.image.width=h,t.image.height=h,t.format=ki,t.type=an,t.internalFormat="RG32UI",t.minFilter=Qe,t.magFilter=Qe,t.generateMipmaps=!1,t.needsUpdate=!0,t.dispose()}var mr={};jh(mr,{bvh_distance_functions:()=>Ep,bvh_ray_functions:()=>Uh,bvh_struct_definitions:()=>Rp,common_functions:()=>Nh});var Nh=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`;var Ep=`

float dot2( vec3 v ) {

	return dot( v, v );

}

// implementation from https://www.shadertoy.com/view/ttfGWl, though method 2 has been removed
// and is now available at this fork: https://www.shadertoy.com/view/WlB3zW
vec3 closestPointToTriangle( vec3 p, vec3 v0, vec3 v1, vec3 v2, out vec3 barycoord ) {

    vec3 v10 = v1 - v0;
    vec3 v21 = v2 - v1;
    vec3 v02 = v0 - v2;

	vec3 p0 = p - v0;
	vec3 p1 = p - v1;
	vec3 p2 = p - v2;

    vec3 nor = cross( v10, v02 );

    // method 2, in barycentric space
    vec3  q = cross( nor, p0 );
    float d = 1.0 / dot2( nor );
    float u = d * dot( q, v02 );
    float v = d * dot( q, v10 );
    float w = 1.0 - u - v;

	if( u < 0.0 ) {

		w = clamp( dot( p2, v02 ) / dot2( v02 ), 0.0, 1.0 );
		u = 0.0;
		v = 1.0 - w;

	} else if( v < 0.0 ) {

		u = clamp( dot( p0, v10 ) / dot2( v10 ), 0.0, 1.0 );
		v = 0.0;
		w = 1.0 - u;

	} else if( w < 0.0 ) {

		v = clamp( dot( p1, v21 ) / dot2( v21 ), 0.0, 1.0 );
		w = 0.0;
		u = 1.0 - v;

	}

	// output the barycoord in v0, v1, v2 weight order
	barycoord = vec3( w, u, v );
    return u * v1 + v * v2 + w * v0;

}

float distanceToTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// point and cut off range
	vec3 point, float closestDistanceSquared,

	// outputs
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord, inout float side, inout vec3 outPoint
) {

	bool found = false;
	vec3 localBarycoord;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		// get the closest point and barycoord
		vec3 closestPoint = closestPointToTriangle( point, a, b, c, localBarycoord );
		vec3 delta = point - closestPoint;
		float sqDist = dot2( delta );
		if ( sqDist < closestDistanceSquared ) {

			// set the output results
			closestDistanceSquared = sqDist;
			faceIndices = uvec4( indices.xyz, i );
			faceNormal = normalize( cross( a - b, b - c ) );
			barycoord = localBarycoord;
			outPoint = closestPoint;
			side = sign( dot( faceNormal, delta ) );

		}

	}

	return closestDistanceSquared;

}

float distanceSqToBounds( vec3 point, vec3 boundsMin, vec3 boundsMax ) {

	vec3 clampedPoint = clamp( point, boundsMin, boundsMax );
	vec3 delta = point - clampedPoint;
	return dot( delta, delta );

}

float distanceSqToBVHNodeBoundsPoint( vec3 point, sampler2D bvhBounds, uint currNodeIndex ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return distanceSqToBounds( point, boundsMin, boundsMax );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhClosestPointToPoint(		bvh,		point, maxDistance, faceIndices, faceNormal, barycoord, side, outPoint	)	_bvhClosestPointToPoint(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		point, maxDistance, faceIndices, faceNormal, barycoord, side, outPoint	)

float _bvhClosestPointToPoint(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// point to check
	vec3 point, float maxDistance,

	// output variables
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout vec3 outPoint
 ) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int pointer = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float closestDistanceSquared = maxDistance * maxDistance;
	bool found = false;
	while ( pointer > - 1 && pointer < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ pointer ];
		pointer --;

		// check if we intersect the current bounds
		float boundsHitDistance = distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, currNodeIndex );
		if ( boundsHitDistance > closestDistanceSquared ) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );
		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;
			closestDistanceSquared = distanceToTriangles(
				bvh_position, bvh_index, offset, count, point, closestDistanceSquared,

				// outputs
				faceIndices, faceNormal, barycoord, side, outPoint
			);

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = currNodeIndex + boundsInfo.y;
			bool leftToRight = distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, leftIndex ) < distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, rightIndex );//rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			pointer ++;
			stack[ pointer ] = c2;
			pointer ++;
			stack[ pointer ] = c1;

		}

	}

	return sqrt( closestDistanceSquared );

}
`;var Uh=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int pointer = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( pointer > - 1 && pointer < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ pointer ];
		pointer --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = currNodeIndex + boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			pointer ++;
			stack[ pointer ] = c2;

			pointer ++;
			stack[ pointer ] = c1;

		}

	}

	return found;

}
`;var Rp=`
struct BVH {

	usampler2D index;
	sampler2D position;

	sampler2D bvhBounds;
	usampler2D bvhContents;

};
`;var AE=`
	${Nh}
	${Uh}
`;function cc(i,e,t=0){if(i.isInterleavedBufferAttribute){let n=i.itemSize;for(let r=0,s=i.count;r<s;r++){let o=r+t;e.setX(o,i.getX(r)),n>=2&&e.setY(o,i.getY(r)),n>=3&&e.setZ(o,i.getZ(r)),n>=4&&e.setW(o,i.getW(r))}}else{let n=e.array,r=n.constructor,s=n.BYTES_PER_ELEMENT*i.itemSize*t;new r(n.buffer,s,i.array.length).set(i.array)}}function gr(i,e=null){let t=i.array.constructor,n=i.normalized,r=i.itemSize,s=e===null?i.count:e;return new xt(new t(r*s),r,n)}function Zi(i,e){if(!i&&!e)return!0;if(!!i!=!!e)return!1;let t=i.count===e.count,n=i.normalized===e.normalized,r=i.array.constructor===e.array.constructor,s=i.itemSize===e.itemSize;return!(!t||!n||!r||!s)}function Hy(i){let e=i[0].index!==null,t=new Set(Object.keys(i[0].attributes));if(!i[0].getAttribute("position"))throw new Error("StaticGeometryGenerator: position attribute is required.");for(let n=0;n<i.length;++n){let r=i[n],s=0;if(e!==(r.index!==null))throw new Error("StaticGeometryGenerator: All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");for(let o in r.attributes){if(!t.has(o))throw new Error('StaticGeometryGenerator: All geometries must have compatible attributes; make sure "'+o+'" attribute exists among all geometries, or in none of them.');s++}if(s!==t.size)throw new Error("StaticGeometryGenerator: All geometries must have the same number of attributes.")}}function Gy(i){let e=0;for(let t=0,n=i.length;t<n;t++)e+=i[t].getIndex().count;return e}function Wy(i){let e=0;for(let t=0,n=i.length;t<n;t++)e+=i[t].getAttribute("position").count;return e}function Xy(i,e,t){i.index&&i.index.count!==e&&i.setIndex(null);let n=i.attributes;for(let r in n)n[r].count!==t&&i.deleteAttribute(r)}function Cp(i,e={},t=new Lt){let{useGroups:n=!1,forceUpdate:r=!1,skipAssigningAttributes:s=[],overwriteIndex:o=!0}=e;Hy(i);let a=i[0].index!==null,l=a?Gy(i):-1,u=Wy(i);if(Xy(t,l,u),n){let h=0;for(let c=0,p=i.length;c<p;c++){let x=i[c],M;a?M=x.getIndex().count:M=x.getAttribute("position").count,t.addGroup(h,M,c),h+=M}}if(a){let h=!1;if(t.index||(t.setIndex(new xt(new Uint32Array(l),1,!1)),h=!0),h||o){let c=0,p=0,x=t.getIndex();for(let M=0,m=i.length;M<m;M++){let g=i[M],S=g.getIndex();if(!(!r&&!h&&s[M]))for(let y=0;y<S.count;++y)x.setX(c+y,S.getX(y)+p);c+=S.count,p+=g.getAttribute("position").count}}}let f=Object.keys(i[0].attributes);for(let h=0,c=f.length;h<c;h++){let p=!1,x=f[h];if(!t.getAttribute(x)){let g=i[0].getAttribute(x);t.setAttribute(x,gr(g,u)),p=!0}let M=0,m=t.getAttribute(x);for(let g=0,S=i.length;g<S;g++){let A=i[g],y=!r&&!p&&s[g],T=A.getAttribute(x);if(!y)if(x==="color"&&m.itemSize!==T.itemSize)for(let E=M,I=T.count;E<I;E++)T.setXYZW(E,m.getX(E),m.getY(E),m.getZ(E),1);else cc(T,m,M);M+=T.count}}}function Ip(i,e,t){let n=i.index,s=i.attributes.position.count,o=n?n.count:s,a=i.groups;a.length===0&&(a=[{count:o,start:0,materialIndex:0}]);let l=i.getAttribute("materialIndex");if(!l||l.count!==s){let f;t.length<=255?f=new Uint8Array(s):f=new Uint16Array(s),l=new xt(f,1,!1),i.deleteAttribute("materialIndex"),i.setAttribute("materialIndex",l)}let u=l.array;for(let f=0;f<a.length;f++){let h=a[f],c=h.start,p=h.count,x=Math.min(p,o-c),M=Array.isArray(e)?e[h.materialIndex]:e,m=t.indexOf(M);for(let g=0;g<x;g++){let S=c+g;n&&(S=n.getX(S)),u[S]=m}}}function Pp(i,e){if(!i.index){let t=i.attributes.position.count,n=new Array(t);for(let r=0;r<t;r++)n[r]=r;i.setIndex(n)}if(!i.attributes.normal&&e&&e.includes("normal")&&i.computeVertexNormals(),!i.attributes.uv&&e&&e.includes("uv")){let t=i.attributes.position.count;i.setAttribute("uv",new xt(new Float32Array(t*2),2,!1))}if(!i.attributes.uv2&&e&&e.includes("uv2")){let t=i.attributes.position.count;i.setAttribute("uv2",new xt(new Float32Array(t*2),2,!1))}if(!i.attributes.tangent&&e&&e.includes("tangent"))if(i.attributes.uv&&i.attributes.normal)i.computeTangents();else{let t=i.attributes.position.count;i.setAttribute("tangent",new xt(new Float32Array(t*4),4,!1))}if(!i.attributes.color&&e&&e.includes("color")){let t=i.attributes.position.count,n=new Float32Array(t*4);n.fill(1),i.setAttribute("color",new xt(n,4))}}function _s(i){let e=0;if(i.byteLength!==0){let t=new Uint8Array(i);for(let n=0;n<i.byteLength;n++){let r=t[n];e=(e<<5)-e+r,e|=0}}return e}function Dp(i){let e=i.uuid,t=Object.values(i.attributes);i.index&&(t.push(i.index),e+=`index|${i.index.version}`);let n=Object.keys(t).sort();for(let r of n){let s=t[r];e+=`${r}_${s.version}|`}return e}function Lp(i){let e=i.skeleton;return e?(e.boneTexture||e.computeBoneTexture(),`${_s(e.boneTexture.image.data.buffer)}_${e.boneTexture.uuid}`):null}var uc=class{constructor(e=null){this.matrixWorld=new Ze,this.geometryHash=null,this.skeletonHash=null,this.primitiveCount=-1,e!==null&&this.updateFrom(e)}updateFrom(e){let t=e.geometry,n=(t.index?t.index.count:t.attributes.position.count)/3;this.matrixWorld.copy(e.matrixWorld),this.geometryHash=Dp(t),this.primitiveCount=n,this.skeletonHash=Lp(e)}didChange(e){let t=e.geometry,n=(t.index?t.index.count:t.attributes.position.count)/3;return!(this.matrixWorld.equals(e.matrixWorld)&&this.geometryHash===Dp(t)&&this.skeletonHash===Lp(e)&&this.primitiveCount===n)}};var xr=new k,vr=new k,_r=new k,Fp=new bt,hc=new k,Bh=new k,Np=new bt,Up=new bt,fc=new Ze,Bp=new Ze;function Op(i,e,t){let n=i.skeleton,r=i.geometry,s=n.bones,o=n.boneInverses;Np.fromBufferAttribute(r.attributes.skinIndex,e),Up.fromBufferAttribute(r.attributes.skinWeight,e),fc.elements.fill(0);for(let a=0;a<4;a++){let l=Up.getComponent(a);if(l!==0){let u=Np.getComponent(a);Bp.multiplyMatrices(s[u].matrixWorld,o[u]),qy(fc,Bp,l)}}return fc.multiply(i.bindMatrix).premultiply(i.bindMatrixInverse),t.transformDirection(fc),t}function Oh(i,e,t,n,r){hc.set(0,0,0);for(let s=0,o=i.length;s<o;s++){let a=e[s],l=i[s];a!==0&&(Bh.fromBufferAttribute(l,n),t?hc.addScaledVector(Bh,a):hc.addScaledVector(Bh.sub(r),a))}r.add(hc)}function qy(i,e,t){let n=i.elements,r=e.elements;for(let s=0,o=r.length;s<o;s++)n[s]+=r[s]*t}function Yy(i){let{index:e,attributes:t}=i;if(e)for(let n=0,r=e.count;n<r;n+=3){let s=e.getX(n),o=e.getX(n+2);e.setX(n,o),e.setX(n+2,s)}else for(let n in t){let r=t[n],s=r.itemSize;for(let o=0,a=r.count;o<a;o+=3)for(let l=0;l<s;l++){let u=r.getComponent(o,l),f=r.getComponent(o+2,l);r.setComponent(o,l,f),r.setComponent(o+2,l,u)}}return i}function zp(i,e={},t=new Lt){e={applyWorldTransforms:!0,attributes:[],...e};let n=i.geometry,r=e.applyWorldTransforms,s=e.attributes.includes("normal"),o=e.attributes.includes("tangent"),a=n.attributes,l=t.attributes;for(let S in t.attributes)(!e.attributes.includes(S)||!(S in n.attributes))&&t.deleteAttribute(S);!t.index&&n.index&&(t.index=n.index.clone()),l.position||t.setAttribute("position",gr(a.position)),s&&!l.normal&&a.normal&&t.setAttribute("normal",gr(a.normal)),o&&!l.tangent&&a.tangent&&t.setAttribute("tangent",gr(a.tangent)),Zi(n.index,t.index),Zi(a.position,l.position),s&&Zi(a.normal,l.normal),o&&Zi(a.tangent,l.tangent);let u=a.position,f=s?a.normal:null,h=o?a.tangent:null,c=n.morphAttributes.position,p=n.morphAttributes.normal,x=n.morphAttributes.tangent,M=n.morphTargetsRelative,m=i.morphTargetInfluences,g=new je;g.getNormalMatrix(i.matrixWorld),n.index&&t.index.array.set(n.index.array);for(let S=0,A=a.position.count;S<A;S++)xr.fromBufferAttribute(u,S),f&&vr.fromBufferAttribute(f,S),h&&(Fp.fromBufferAttribute(h,S),_r.fromBufferAttribute(h,S)),m&&(c&&Oh(c,m,M,S,xr),p&&Oh(p,m,M,S,vr),x&&Oh(x,m,M,S,_r)),i.isSkinnedMesh&&(i.applyBoneTransform(S,xr),f&&Op(i,S,vr),h&&Op(i,S,_r)),r&&xr.applyMatrix4(i.matrixWorld),l.position.setXYZ(S,xr.x,xr.y,xr.z),f&&(r&&vr.applyNormalMatrix(g),l.normal.setXYZ(S,vr.x,vr.y,vr.z)),h&&(r&&_r.transformDirection(i.matrixWorld),l.tangent.setXYZW(S,_r.x,_r.y,_r.z,Fp.w));for(let S in e.attributes){let A=e.attributes[S];A==="position"||A==="tangent"||A==="normal"||!(A in a)||(l[A]||t.setAttribute(A,gr(a[A])),Zi(a[A],l[A]),cc(a[A],l[A]))}return i.matrixWorld.determinant()<0&&Yy(t),t}var dc=class extends Lt{constructor(){super(),this.version=0,this.hash=null,this._diff=new uc}isCompatible(e,t){let n=e.geometry;for(let r=0;r<t.length;r++){let s=t[r],o=n.attributes[s],a=this.attributes[s];if(o&&!Zi(o,a))return!1}return!0}updateFrom(e,t){let n=this._diff;return n.didChange(e)?(zp(e,t,this),n.updateFrom(e),this.version++,this.hash=`${this.uuid}_${this.version}`,!0):!1}};var mc=0,zh=1,kh=2;function Zy(i,e){for(let t=0,n=i.length;t<n;t++)i[t].traverseVisible(s=>{s.isMesh&&e(s)})}function $y(i){let e=[];for(let t=0,n=i.length;t<n;t++){let r=i[t];Array.isArray(r.material)?e.push(...r.material):e.push(r.material)}return e}function Jy(i,e,t){if(i.length===0){e.setIndex(null);let n=e.attributes;for(let r in n)e.deleteAttribute(r);for(let r in t.attributes)e.setAttribute(t.attributes[r],new xt(new Float32Array(0),4,!1))}else Cp(i,t,e);for(let n in e.attributes)e.attributes[n].needsUpdate=!0}var pc=class{constructor(e){this.objects=null,this.useGroups=!0,this.applyWorldTransforms=!0,this.generateMissingAttributes=!0,this.overwriteIndex=!0,this.attributes=["position","normal","color","tangent","uv","uv2"],this._intermediateGeometry=new Map,this._geometryMergeSets=new WeakMap,this._mergeOrder=[],this._dummyMesh=null,this.setObjects(e||[])}_getDummyMesh(){if(!this._dummyMesh){let e=new rr,t=new Lt;t.setAttribute("position",new xt(new Float32Array(9),3)),this._dummyMesh=new sn(t,e)}return this._dummyMesh}_getMeshes(){let e=[];return Zy(this.objects,t=>{e.push(t)}),e.sort((t,n)=>t.uuid>n.uuid?1:t.uuid<n.uuid?-1:0),e.length===0&&e.push(this._getDummyMesh()),e}_updateIntermediateGeometries(){let{_intermediateGeometry:e}=this,t=this._getMeshes(),n=new Set(e.keys()),r={attributes:this.attributes,applyWorldTransforms:this.applyWorldTransforms};for(let s=0,o=t.length;s<o;s++){let a=t[s],l=a.uuid;n.delete(l);let u=e.get(l);(!u||!u.isCompatible(a,this.attributes))&&(u&&u.dispose(),u=new dc,e.set(l,u)),u.updateFrom(a,r)&&this.generateMissingAttributes&&Pp(u,this.attributes)}n.forEach(s=>{e.delete(s)})}setObjects(e){Array.isArray(e)?this.objects=[...e]:this.objects=[e]}generate(e=new Lt){let{useGroups:t,overwriteIndex:n,_intermediateGeometry:r,_geometryMergeSets:s}=this,o=this._getMeshes(),a=[],l=[],u=s.get(e)||[];this._updateIntermediateGeometries();let f=!1;o.length!==u.length&&(f=!0);for(let c=0,p=o.length;c<p;c++){let x=o[c],M=r.get(x.uuid);l.push(M);let m=u[c];!m||m.uuid!==M.uuid?(a.push(!1),f=!0):m.version!==M.version?a.push(!1):a.push(!0)}Jy(l,e,{useGroups:t,forceUpdate:f,skipAssigningAttributes:a,overwriteIndex:n}),f&&e.dispose(),s.set(e,l.map(c=>({version:c.version,uuid:c.uuid})));let h=mc;return f?h=kh:a.includes(!1)&&(h=zh),{changeType:h,materials:$y(o),geometry:e}}};function Ky(i){let e=new Set;for(let t=0,n=i.length;t<n;t++){let r=i[t];for(let s in r){let o=r[s];o&&o.isTexture&&e.add(o)}}return Array.from(e)}function Qy(i){let e=[],t=new Set;for(let r=0,s=i.length;r<s;r++)i[r].traverse(o=>{o.visible&&(o.isRectAreaLight||o.isSpotLight||o.isPointLight||o.isDirectionalLight)&&(e.push(o),o.iesMap&&t.add(o.iesMap))});let n=Array.from(t).sort((r,s)=>r.uuid<s.uuid?1:r.uuid>s.uuid?-1:0);return{lights:e,iesTextures:n}}var gc=class{get initialized(){return!!this.bvh}constructor(e){this.bvhOptions={},this.attributes=["position","normal","tangent","color","uv","uv2"],this.generateBVH=!0,this.bvh=null,this.geometry=new Lt,this.staticGeometryGenerator=new pc(e),this._bvhWorker=null,this._pendingGenerate=null,this._buildAsync=!1,this._materialUuids=null}setObjects(e){this.staticGeometryGenerator.setObjects(e)}setBVHWorker(e){this._bvhWorker=e}async generateAsync(e=null){if(!this._bvhWorker)throw new Error('PathTracingSceneGenerator: "setBVHWorker" must be called before "generateAsync" can be called.');if(this.bvh instanceof Promise)return this._pendingGenerate||(this._pendingGenerate=new Promise(async()=>(await this.bvh,this._pendingGenerate=null,this.generateAsync(e)))),this._pendingGenerate;{this._buildAsync=!0;let t=this.generate(e);return this._buildAsync=!1,t.bvh=this.bvh=await t.bvh,t}}generate(e=null){let{staticGeometryGenerator:t,geometry:n,attributes:r}=this,s=t.objects;t.attributes=r,s.forEach(c=>{c.traverse(p=>{p.isSkinnedMesh&&p.skeleton&&p.skeleton.update()})});let o=t.generate(n),a=o.materials,l=o.changeType!==mc||this._materialUuids===null||this._materialUuids.length!==length;if(!l){for(let c=0,p=a.length;c<p;c++)if(a[c].uuid!==this._materialUuids[c]){l=!0;break}}let u=Ky(a),{lights:f,iesTextures:h}=Qy(s);if(l&&(Ip(n,a,a),this._materialUuids=a.map(c=>c.uuid)),this.generateBVH){if(this.bvh instanceof Promise)throw new Error("PathTracingSceneGenerator: BVH is already building asynchronously.");if(o.changeType===kh){let c={strategy:2,maxLeafTris:1,indirect:!0,onProgress:e,...this.bvhOptions};this._buildAsync?this.bvh=this._bvhWorker.generate(n,c):this.bvh=new oc(n,c)}else o.changeType===zh&&this.bvh.refit()}return{bvhChanged:o.changeType!==mc,bvh:this.bvh,needsMaterialIndexUpdate:l,lights:f,iesTextures:h,geometry:n,materials:a,textures:u,objects:s}}};var jy=new ar(-1,1,1,-1,0,1),Vh=class extends Lt{constructor(){super(),this.setAttribute("position",new Xt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Xt([0,2,0,0,2,0],2))}},eS=new Vh,Nn=class{constructor(e){this._mesh=new sn(eS,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,jy)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var $i=class extends qt{set needsUpdate(e){super.needsUpdate=!0,this.dispatchEvent({type:"recompilation"})}constructor(e){super(e);for(let t in this.uniforms)Object.defineProperty(this,t,{get(){return this.uniforms[t].value},set(n){this.uniforms[t].value=n}})}setDefine(e,t=void 0){if(t==null){if(e in this.defines)return delete this.defines[e],this.needsUpdate=!0,!0}else if(this.defines[e]!==t)return this.defines[e]=t,this.needsUpdate=!0,!0;return!1}};var xc=class extends $i{constructor(e){super({blending:Jt,uniforms:{target1:{value:null},target2:{value:null},opacity:{value:1}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				uniform float opacity;

				uniform sampler2D target1;
				uniform sampler2D target2;

				varying vec2 vUv;

				void main() {

					vec4 color1 = texture2D( target1, vUv );
					vec4 color2 = texture2D( target2, vUv );

					float invOpacity = 1.0 - opacity;
					float totalAlpha = color1.a * invOpacity + color2.a * opacity;

					if ( color1.a != 0.0 || color2.a != 0.0 ) {

						gl_FragColor.rgb = color1.rgb * ( invOpacity * color1.a / totalAlpha ) + color2.rgb * ( opacity * color2.a / totalAlpha );
						gl_FragColor.a = totalAlpha;

					} else {

						gl_FragColor = vec4( 0.0 );

					}

				}`}),this.setValues(e)}};function vc(i=1){let e="uint";return i>1&&(e="uvec"+i),`
		${e} sobolReverseBits( ${e} x ) {

			x = ( ( ( x & 0xaaaaaaaau ) >> 1 ) | ( ( x & 0x55555555u ) << 1 ) );
			x = ( ( ( x & 0xccccccccu ) >> 2 ) | ( ( x & 0x33333333u ) << 2 ) );
			x = ( ( ( x & 0xf0f0f0f0u ) >> 4 ) | ( ( x & 0x0f0f0f0fu ) << 4 ) );
			x = ( ( ( x & 0xff00ff00u ) >> 8 ) | ( ( x & 0x00ff00ffu ) << 8 ) );
			return ( ( x >> 16 ) | ( x << 16 ) );

		}

		${e} sobolHashCombine( uint seed, ${e} v ) {

			return seed ^ ( v + ${e}( ( seed << 6 ) + ( seed >> 2 ) ) );

		}

		${e} sobolLaineKarrasPermutation( ${e} x, ${e} seed ) {

			x += seed;
			x ^= x * 0x6c50b47cu;
			x ^= x * 0xb82f1e52u;
			x ^= x * 0xc7afe638u;
			x ^= x * 0x8d22f6e6u;
			return x;

		}

		${e} nestedUniformScrambleBase2( ${e} x, ${e} seed ) {

			x = sobolLaineKarrasPermutation( x, seed );
			x = sobolReverseBits( x );
			return x;

		}
	`}function _c(i=1){let e="uint",t="float",n="",r=".r",s="1u";return i>1&&(e="uvec"+i,t="vec"+i,n=i+"",i===2?(r=".rg",s="uvec2( 1u, 2u )"):i===3?(r=".rgb",s="uvec3( 1u, 2u, 3u )"):(r="",s="uvec4( 1u, 2u, 3u, 4u )")),`

		${t} sobol${n}( int effect ) {

			uint seed = sobolGetSeed( sobolBounceIndex, uint( effect ) );
			uint index = sobolPathIndex;

			uint shuffle_seed = sobolHashCombine( seed, 0u );
			uint shuffled_index = nestedUniformScrambleBase2( sobolReverseBits( index ), shuffle_seed );
			${t} sobol_pt = sobolGetTexturePoint( shuffled_index )${r};
			${e} result = ${e}( sobol_pt * 16777216.0 );

			${e} seed2 = sobolHashCombine( seed, ${s} );
			result = nestedUniformScrambleBase2( result, seed2 );

			return SOBOL_FACTOR * ${t}( result >> 8 );

		}
	`}var yc=`

	// Utils
	const float SOBOL_FACTOR = 1.0 / 16777216.0;
	const uint SOBOL_MAX_POINTS = 256u * 256u;

	${vc(1)}
	${vc(2)}
	${vc(3)}
	${vc(4)}

	uint sobolHash( uint x ) {

		// finalizer from murmurhash3
		x ^= x >> 16;
		x *= 0x85ebca6bu;
		x ^= x >> 13;
		x *= 0xc2b2ae35u;
		x ^= x >> 16;
		return x;

	}

`,kp=`

	const uint SOBOL_DIRECTIONS_1[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0xa0000000u, 0xf0000000u,
		0x88000000u, 0xcc000000u, 0xaa000000u, 0xff000000u,
		0x80800000u, 0xc0c00000u, 0xa0a00000u, 0xf0f00000u,
		0x88880000u, 0xcccc0000u, 0xaaaa0000u, 0xffff0000u,
		0x80008000u, 0xc000c000u, 0xa000a000u, 0xf000f000u,
		0x88008800u, 0xcc00cc00u, 0xaa00aa00u, 0xff00ff00u,
		0x80808080u, 0xc0c0c0c0u, 0xa0a0a0a0u, 0xf0f0f0f0u,
		0x88888888u, 0xccccccccu, 0xaaaaaaaau, 0xffffffffu
	);

	const uint SOBOL_DIRECTIONS_2[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0x60000000u, 0x90000000u,
		0xe8000000u, 0x5c000000u, 0x8e000000u, 0xc5000000u,
		0x68800000u, 0x9cc00000u, 0xee600000u, 0x55900000u,
		0x80680000u, 0xc09c0000u, 0x60ee0000u, 0x90550000u,
		0xe8808000u, 0x5cc0c000u, 0x8e606000u, 0xc5909000u,
		0x6868e800u, 0x9c9c5c00u, 0xeeee8e00u, 0x5555c500u,
		0x8000e880u, 0xc0005cc0u, 0x60008e60u, 0x9000c590u,
		0xe8006868u, 0x5c009c9cu, 0x8e00eeeeu, 0xc5005555u
	);

	const uint SOBOL_DIRECTIONS_3[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0x20000000u, 0x50000000u,
		0xf8000000u, 0x74000000u, 0xa2000000u, 0x93000000u,
		0xd8800000u, 0x25400000u, 0x59e00000u, 0xe6d00000u,
		0x78080000u, 0xb40c0000u, 0x82020000u, 0xc3050000u,
		0x208f8000u, 0x51474000u, 0xfbea2000u, 0x75d93000u,
		0xa0858800u, 0x914e5400u, 0xdbe79e00u, 0x25db6d00u,
		0x58800080u, 0xe54000c0u, 0x79e00020u, 0xb6d00050u,
		0x800800f8u, 0xc00c0074u, 0x200200a2u, 0x50050093u
	);

	const uint SOBOL_DIRECTIONS_4[ 32 ] = uint[ 32 ](
		0x80000000u, 0x40000000u, 0x20000000u, 0xb0000000u,
		0xf8000000u, 0xdc000000u, 0x7a000000u, 0x9d000000u,
		0x5a800000u, 0x2fc00000u, 0xa1600000u, 0xf0b00000u,
		0xda880000u, 0x6fc40000u, 0x81620000u, 0x40bb0000u,
		0x22878000u, 0xb3c9c000u, 0xfb65a000u, 0xddb2d000u,
		0x78022800u, 0x9c0b3c00u, 0x5a0fb600u, 0x2d0ddb00u,
		0xa2878080u, 0xf3c9c040u, 0xdb65a020u, 0x6db2d0b0u,
		0x800228f8u, 0x400b3cdcu, 0x200fb67au, 0xb00ddb9du
	);

	uint getMaskedSobol( uint index, uint directions[ 32 ] ) {

		uint X = 0u;
		for ( int bit = 0; bit < 32; bit ++ ) {

			uint mask = ( index >> bit ) & 1u;
			X ^= mask * directions[ bit ];

		}
		return X;

	}

	vec4 generateSobolPoint( uint index ) {

		if ( index >= SOBOL_MAX_POINTS ) {

			return vec4( 0.0 );

		}

		// NOTE: this sobol "direction" is also available but we can't write out 5 components
		// uint x = index & 0x00ffffffu;
		uint x = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_1 ) ) & 0x00ffffffu;
		uint y = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_2 ) ) & 0x00ffffffu;
		uint z = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_3 ) ) & 0x00ffffffu;
		uint w = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_4 ) ) & 0x00ffffffu;

		return vec4( x, y, z, w ) * SOBOL_FACTOR;

	}

`,Vp=`

	// Seeds
	uniform sampler2D sobolTexture;
	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;

	uint sobolGetSeed( uint bounce, uint effect ) {

		return sobolHash(
			sobolHashCombine(
				sobolHashCombine(
					sobolHash( bounce ),
					sobolPixelIndex
				),
				effect
			)
		);

	}

	vec4 sobolGetTexturePoint( uint index ) {

		if ( index >= SOBOL_MAX_POINTS ) {

			index = index % SOBOL_MAX_POINTS;

		}

		uvec2 dim = uvec2( textureSize( sobolTexture, 0 ).xy );
		uint y = index / dim.x;
		uint x = index - y * dim.x;
		vec2 uv = vec2( x, y ) / vec2( dim );
		return texture( sobolTexture, uv );

	}

	${_c(1)}
	${_c(2)}
	${_c(3)}
	${_c(4)}

`;var Hh=class extends $i{constructor(){super({blending:Jt,uniforms:{resolution:{value:new Be}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`

				${yc}
				${kp}

				varying vec2 vUv;
				uniform vec2 resolution;
				void main() {

					uint index = uint( gl_FragCoord.y ) * uint( resolution.x ) + uint( gl_FragCoord.x );
					gl_FragColor = generateSobolPoint( index );

				}
			`})}},Sc=class{generate(e,t=256){let n=new Vt(t,t,{type:et,format:Ge,minFilter:Qe,magFilter:Qe,generateMipmaps:!1}),r=e.getRenderTarget();e.setRenderTarget(n);let s=new Nn(new Hh);return s.material.resolution.set(t,t),s.render(e),e.setRenderTarget(r),s.dispose(),n}};var ys=class extends nn{set bokehSize(e){this.fStop=this.getFocalLength()/e}get bokehSize(){return this.getFocalLength()/this.fStop}constructor(...e){super(...e),this.fStop=1.4,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=25,this.anamorphicRatio=1}copy(e,t){return super.copy(e,t),this.fStop=e.fStop,this.apertureBlades=e.apertureBlades,this.apertureRotation=e.apertureRotation,this.focusDistance=e.focusDistance,this.anamorphicRatio=e.anamorphicRatio,this}};var bc=class{constructor(){this.bokehSize=0,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=10,this.anamorphicRatio=1}updateFrom(e){e instanceof ys?(this.bokehSize=e.bokehSize,this.apertureBlades=e.apertureBlades,this.apertureRotation=e.apertureRotation,this.focusDistance=e.focusDistance,this.anamorphicRatio=e.anamorphicRatio):(this.bokehSize=0,this.apertureRotation=0,this.apertureBlades=0,this.focusDistance=10,this.anamorphicRatio=1)}};function Mc(i){let e=new Uint16Array(i.length);for(let t=0,n=i.length;t<n;++t)e[t]=vt.toHalfFloat(i[t]);return e}function Hp(i,e,t=0,n=i.length){let r=t,s=t+n-1;for(;r<s;){let o=r+s>>1;i[o]<e?r=o+1:s=o}return r-t}function tS(i,e,t){return .2126*i+.7152*e+.0722*t}function nS(i,e=ct){let t=i.clone();t.source=new Os({...t.image});let{width:n,height:r,data:s}=t.image,o=s;if(t.type!==e){e===ct?o=new Uint16Array(s.length):o=new Float32Array(s.length);let a;s instanceof Int8Array||s instanceof Int16Array||s instanceof Int32Array?a=2**(8*s.BYTES_PER_ELEMENT-1)-1:a=2**(8*s.BYTES_PER_ELEMENT)-1;for(let l=0,u=s.length;l<u;l++){let f=s[l];t.type===ct&&(f=vt.fromHalfFloat(s[l])),t.type!==et&&t.type!==ct&&(f/=a),e===ct&&(o[l]=vt.toHalfFloat(f))}t.image.data=o,t.type=e}if(t.flipY){let a=o;o=o.slice();for(let l=0;l<r;l++)for(let u=0;u<n;u++){let f=r-l-1,h=4*(l*n+u),c=4*(f*n+u);o[c+0]=a[h+0],o[c+1]=a[h+1],o[c+2]=a[h+2],o[c+3]=a[h+3]}t.flipY=!1,t.image.data=o}return t}var Tc=class{constructor(){let e=new It(Mc(new Float32Array([0,0,0,0])),1,1);e.type=ct,e.format=Ge,e.minFilter=nt,e.magFilter=nt,e.wrapS=rn,e.wrapT=rn,e.generateMipmaps=!1,e.needsUpdate=!0;let t=new It(Mc(new Float32Array([0,1])),1,2);t.type=ct,t.format=Tn,t.minFilter=nt,t.magFilter=nt,t.generateMipmaps=!1,t.needsUpdate=!0;let n=new It(Mc(new Float32Array([0,0,1,1])),2,2);n.type=ct,n.format=Tn,n.minFilter=nt,n.magFilter=nt,n.generateMipmaps=!1,n.needsUpdate=!0,this.map=e,this.marginalWeights=t,this.conditionalWeights=n,this.totalSum=0}getPixelWeight(e,t,n){return tS(e,t,n)}dispose(){this.marginalWeights.dispose(),this.conditionalWeights.dispose(),this.map.dispose()}updateFrom(e){let t=nS(e);t.wrapS=rn,t.wrapT=Dt;let{width:n,height:r,data:s}=t.image,o=new Float32Array(n*r),a=new Float32Array(n*r),l=new Float32Array(r),u=new Float32Array(r),f=0,h=0;for(let m=0;m<r;m++){let g=0;for(let S=0;S<n;S++){let A=m*n+S,y=vt.fromHalfFloat(s[4*A+0]),T=vt.fromHalfFloat(s[4*A+1]),E=vt.fromHalfFloat(s[4*A+2]),I=this.getPixelWeight(y,T,E,m,r);g+=I,f+=I,o[A]=I,a[A]=g}if(g!==0)for(let S=m*n,A=m*n+n;S<A;S++)o[S]/=g,a[S]/=g;h+=g,l[m]=g,u[m]=h}if(h!==0)for(let m=0,g=l.length;m<g;m++)l[m]/=h,u[m]/=h;let c=new Uint16Array(r),p=new Uint16Array(n*r);for(let m=0;m<r;m++){let g=(m+1)/r,S=Hp(u,g);c[m]=vt.toHalfFloat((S+.5)/r)}for(let m=0;m<r;m++)for(let g=0;g<n;g++){let S=m*n+g,A=(g+1)/n,y=Hp(a,A,m*n,n);p[S]=vt.toHalfFloat((y+.5)/n)}this.dispose();let{marginalWeights:x,conditionalWeights:M}=this;x.image={width:r,height:1,data:c},x.needsUpdate=!0,M.image={width:n,height:r,data:p},M.needsUpdate=!0,this.totalSum=f,this.map=t}};var Gh=6,iS=11,rS=0,sS=1,oS=2,aS=3,lS=4,Zn=new k,Cn=new k,Gp=new Ze,Ss=new On,Wp=new k,si=new k,cS=new k(0,1,0),wc=class{constructor(){let e=new It(new Float32Array(4),1,1);e.format=Ge,e.type=et,e.wrapS=Dt,e.wrapT=Dt,e.generateMipmaps=!1,e.minFilter=Qe,e.magFilter=Qe,this.tex=e,this.count=0}updateFrom(e,t=[]){let n=this.tex,r=Math.max(e.length*Gh,1),s=Math.ceil(Math.sqrt(r));n.image.width!==s&&(n.dispose(),n.image.data=new Float32Array(s*s*4),n.image.width=s,n.image.height=s);let o=n.image.data;for(let l=0,u=e.length;l<u;l++){let f=e[l],h=l*Gh*4,c=0;for(let x=0;x<Gh*4;x++)o[h+x]=0;f.getWorldPosition(Cn),o[h+c++]=Cn.x,o[h+c++]=Cn.y,o[h+c++]=Cn.z;let p=rS;if(f.isRectAreaLight&&f.isCircular?p=sS:f.isSpotLight?p=oS:f.isDirectionalLight||f.isSunLight?p=aS:f.isPointLight&&(p=lS),o[h+c++]=p,o[h+c++]=f.color.r,o[h+c++]=f.color.g,o[h+c++]=f.color.b,o[h+c++]=f.intensity,f.getWorldQuaternion(Ss),f.isRectAreaLight)Zn.set(f.width,0,0).applyQuaternion(Ss),o[h+c++]=Zn.x,o[h+c++]=Zn.y,o[h+c++]=Zn.z,c++,Cn.set(0,f.height,0).applyQuaternion(Ss),o[h+c++]=Cn.x,o[h+c++]=Cn.y,o[h+c++]=Cn.z,o[h+c++]=Zn.cross(Cn).length()*(f.isCircular?Math.PI/4:1);else if(f.isSpotLight){let x=f.radius||0;Wp.setFromMatrixPosition(f.matrixWorld),si.setFromMatrixPosition(f.target.matrixWorld),Gp.lookAt(Wp,si,cS),Ss.setFromRotationMatrix(Gp),Zn.set(1,0,0).applyQuaternion(Ss),o[h+c++]=Zn.x,o[h+c++]=Zn.y,o[h+c++]=Zn.z,c++,Cn.set(0,1,0).applyQuaternion(Ss),o[h+c++]=Cn.x,o[h+c++]=Cn.y,o[h+c++]=Cn.z,o[h+c++]=Math.PI*x*x,o[h+c++]=x,o[h+c++]=f.decay,o[h+c++]=f.distance,o[h+c++]=Math.cos(f.angle),o[h+c++]=Math.cos(f.angle*(1-f.penumbra)),o[h+c++]=f.iesMap?t.indexOf(f.iesMap):-1}else if(f.isPointLight){let x=Zn.setFromMatrixPosition(f.matrixWorld);o[h+c++]=x.x,o[h+c++]=x.y,o[h+c++]=x.z,c++,c+=4,c+=1,o[h+c++]=f.decay,o[h+c++]=f.distance}else if(f.isDirectionalLight){let x=Zn.setFromMatrixPosition(f.matrixWorld),M=Cn.setFromMatrixPosition(f.target.matrixWorld);si.subVectors(x,M).normalize(),o[h+c++]=si.x,o[h+c++]=si.y,o[h+c++]=si.z}else f.isSunLight&&(si.setFromMatrixPosition(f.matrixWorld).normalize(),o[h+c++]=si.x,o[h+c++]=si.y,o[h+c++]=si.z);o[h+iS]=f.visibleToCameraRays?1:0}this.count=e.length;let a=_s(o.buffer);return this.hash!==a?(this.hash=a,n.needsUpdate=!0,!0):!1}};function Xp(i,e,t,n,r){if(e>n)throw new Error;let s=i.length/e,o=i.constructor.BYTES_PER_ELEMENT*8,a=1;switch(i.constructor){case Uint8Array:case Uint16Array:case Uint32Array:a=2**o-1;break;case Int8Array:case Int16Array:case Int32Array:a=2**(o-1)-1;break}for(let l=0;l<s;l++){let u=4*l,f=e*l;for(let h=0;h<n;h++)t[r+u+h]=e>=h+1?i[f+h]/a:0}}var Ac=class extends Ii{constructor(){super(),this._textures=[],this.type=et,this.format=Ge,this.internalFormat="RGBA32F"}updateAttribute(e,t){let n=this._textures[e];n.updateFrom(t);let r=n.image,s=this.image;if(r.width!==s.width||r.height!==s.height)throw new Error("FloatAttributeTextureArray: Attribute must be the same dimensions when updating single layer.");let{width:o,height:a,data:l}=s,f=o*a*4*e,h=t.itemSize;h===3&&(h=4),Xp(n.image.data,h,l,4,f),this.dispose(),this.needsUpdate=!0}setAttributes(e){let t=e[0].count,n=e.length;for(let h=0,c=n;h<c;h++)if(e[h].count!==t)throw new Error("FloatAttributeTextureArray: All attributes must have the same item count.");let r=this._textures;for(;r.length<n;){let h=new vs;r.push(h)}for(;r.length>n;)r.pop();for(let h=0,c=n;h<c;h++)r[h].updateFrom(e[h]);let o=r[0].image,a=this.image;(o.width!==a.width||o.height!==a.height||o.depth!==n)&&(a.width=o.width,a.height=o.height,a.depth=n,a.data=new Float32Array(a.width*a.height*a.depth*4));let{data:l,width:u,height:f}=a;for(let h=0,c=n;h<c;h++){let p=r[h],M=u*f*4*h,m=e[h].itemSize;m===3&&(m=4),Xp(p.image.data,m,l,4,M)}this.dispose(),this.needsUpdate=!0}};var Ec=class extends Ac{updateNormalAttribute(e){this.updateAttribute(0,e)}updateTangentAttribute(e){this.updateAttribute(1,e)}updateUvAttribute(e){this.updateAttribute(2,e)}updateColorAttribute(e){this.updateAttribute(3,e)}updateFrom(e,t,n,r){this.setAttributes([e,t,n,r])}};function Wh(i,e){return i.uuid<e.uuid?1:i.uuid>e.uuid?-1:0}function Rc(i){return`${i.source.uuid}:${i.colorSpace}`}function uS(i){let e=new Set,t=[];for(let n=0,r=i.length;n<r;n++){let s=i[n],o=Rc(s);e.has(o)||(e.add(o),t.push(s))}return t}function qp(i){let e=i.map(n=>n.iesMap||null).filter(n=>n),t=new Set(e);return Array.from(t).sort(Wh)}function Yp(i){let e=new Set;for(let n=0,r=i.length;n<r;n++){let s=i[n];for(let o in s){let a=s[o];a&&a.isTexture&&e.add(a)}}let t=Array.from(e);return uS(t).sort(Wh)}function Zp(i){let e=[];return i.traverseVisible(t=>{(t.isRectAreaLight||t.isSpotLight||t.isPointLight||t.isDirectionalLight||t.isSunLight)&&e.push(t)}),e.sort(Wh)}var Ic=47,$p=Ic*4,Xh=class{constructor(){this._features={}}isUsed(e){return e in this._features}setUsed(e,t=!0){t===!1?delete this._features[e]:this._features[e]=!0}reset(){this._features={}}},Cc=class extends It{constructor(){super(new Float32Array(4),1,1),this.format=Ge,this.type=et,this.wrapS=Dt,this.wrapT=Dt,this.minFilter=Qe,this.magFilter=Qe,this.generateMipmaps=!1,this.features=new Xh}updateFrom(e,t){function n(x,M,m=-1){if(M in x&&x[M]){let g=Rc(x[M]);return h[g]}else return m}function r(x,M,m){return M in x?x[M]:m}function s(x,M,m,g){let S=x[M]&&x[M].isTexture?x[M]:null;if(S){S.matrixAutoUpdate&&S.updateMatrix();let A=S.matrix.elements,y=0;m[g+y++]=A[0],m[g+y++]=A[3],m[g+y++]=A[6],y++,m[g+y++]=A[1],m[g+y++]=A[4],m[g+y++]=A[7],y++}return 8}let o=0,a=e.length*Ic,l=Math.ceil(Math.sqrt(a))||1,{image:u,features:f}=this,h={};for(let x=0,M=t.length;x<M;x++)h[Rc(t[x])]=x;u.width!==l&&(this.dispose(),u.data=new Float32Array(l*l*4),u.width=l,u.height=l);let c=u.data;f.reset();for(let x=0,M=e.length;x<M;x++){let m=e[x];if(m.isFogVolumeMaterial){f.setUsed("FOG");for(let A=0;A<$p;A++)c[o+A]=0;c[o+0+0]=m.color.r,c[o+0+1]=m.color.g,c[o+0+2]=m.color.b,c[o+8+3]=r(m,"emissiveIntensity",0),c[o+12+0]=m.emissive.r,c[o+12+1]=m.emissive.g,c[o+12+2]=m.emissive.b,c[o+52+1]=m.density,c[o+52+3]=0,c[o+56+2]=4,o+=$p;continue}c[o++]=m.color.r,c[o++]=m.color.g,c[o++]=m.color.b,c[o++]=n(m,"map"),c[o++]=r(m,"metalness",0),c[o++]=n(m,"metalnessMap"),c[o++]=r(m,"roughness",0),c[o++]=n(m,"roughnessMap"),c[o++]=r(m,"ior",1.5),c[o++]=r(m,"transmission",0),c[o++]=n(m,"transmissionMap"),c[o++]=r(m,"emissiveIntensity",0),"emissive"in m?(c[o++]=m.emissive.r,c[o++]=m.emissive.g,c[o++]=m.emissive.b):(c[o++]=0,c[o++]=0,c[o++]=0),c[o++]=n(m,"emissiveMap"),c[o++]=n(m,"normalMap"),"normalScale"in m?(c[o++]=m.normalScale.x,c[o++]=m.normalScale.y):(c[o++]=1,c[o++]=1),c[o++]=r(m,"clearcoat",0),c[o++]=n(m,"clearcoatMap"),c[o++]=r(m,"clearcoatRoughness",0),c[o++]=n(m,"clearcoatRoughnessMap"),c[o++]=n(m,"clearcoatNormalMap"),"clearcoatNormalScale"in m?(c[o++]=m.clearcoatNormalScale.x,c[o++]=m.clearcoatNormalScale.y):(c[o++]=1,c[o++]=1),o++,c[o++]=r(m,"sheen",0),"sheenColor"in m?(c[o++]=m.sheenColor.r,c[o++]=m.sheenColor.g,c[o++]=m.sheenColor.b):(c[o++]=0,c[o++]=0,c[o++]=0),c[o++]=n(m,"sheenColorMap"),c[o++]=r(m,"sheenRoughness",0),c[o++]=n(m,"sheenRoughnessMap"),c[o++]=n(m,"iridescenceMap"),c[o++]=n(m,"iridescenceThicknessMap"),c[o++]=r(m,"iridescence",0),c[o++]=r(m,"iridescenceIOR",1.3);let g=r(m,"iridescenceThicknessRange",[100,400]);c[o++]=g[0],c[o++]=g[1],"specularColor"in m?(c[o++]=m.specularColor.r,c[o++]=m.specularColor.g,c[o++]=m.specularColor.b):(c[o++]=1,c[o++]=1,c[o++]=1),c[o++]=n(m,"specularColorMap"),c[o++]=r(m,"specularIntensity",1),c[o++]=n(m,"specularIntensityMap");let S=r(m,"thickness",0)===0&&r(m,"attenuationDistance",1/0)===1/0;if(c[o++]=Number(S),o++,"attenuationColor"in m?(c[o++]=m.attenuationColor.r,c[o++]=m.attenuationColor.g,c[o++]=m.attenuationColor.b):(c[o++]=1,c[o++]=1,c[o++]=1),c[o++]=r(m,"attenuationDistance",1/0),c[o++]=n(m,"alphaMap"),c[o++]=m.opacity,c[o++]=m.alphaTest,!S&&m.transmission>0)c[o++]=0;else switch(m.side){case bn:c[o++]=1;break;case $t:c[o++]=-1;break;case xn:c[o++]=0;break}c[o++]=Number(r(m,"matte",!1)),c[o++]=Number(r(m,"castShadow",!0)),c[o++]=Number(m.vertexColors)|Number(m.flatShading)<<1,c[o++]=Number(m.transparent),o+=s(m,"map",c,o),o+=s(m,"metalnessMap",c,o),o+=s(m,"roughnessMap",c,o),o+=s(m,"transmissionMap",c,o),o+=s(m,"emissiveMap",c,o),o+=s(m,"normalMap",c,o),o+=s(m,"clearcoatMap",c,o),o+=s(m,"clearcoatNormalMap",c,o),o+=s(m,"clearcoatRoughnessMap",c,o),o+=s(m,"sheenColorMap",c,o),o+=s(m,"sheenRoughnessMap",c,o),o+=s(m,"iridescenceMap",c,o),o+=s(m,"iridescenceThicknessMap",c,o),o+=s(m,"specularColorMap",c,o),o+=s(m,"specularIntensityMap",c,o),o+=s(m,"alphaMap",c,o)}let p=_s(c.buffer);return this.hash!==p?(this.hash=p,this.needsUpdate=!0,!0):!1}};var Jp=new Je;function hS(i){return i?`${i.uuid}:${i.version}`:null}function fS(i,e){for(let t in e)t in i&&(i[t]=e[t])}var Do=class extends zs{constructor(e,t,n){let r={format:Ge,type:on,minFilter:nt,magFilter:nt,wrapS:rn,wrapT:rn,generateMipmaps:!1,...n};super(e,t,1,r),fS(this.texture,r),this.texture.setTextures=(...o)=>{this.setTextures(...o)},this.hashes=[null];let s=new Nn(new qh);this.fsQuad=s}setTextures(e,t,n=this.width,r=this.height){let s=e.getRenderTarget(),o=e.toneMapping,a=e.getClearAlpha();e.getClearColor(Jp);let l=t.length||1;(n!==this.width||r!==this.height||this.depth!==l)&&(this.setSize(n,r,l),this.hashes=new Array(l).fill(null)),e.setClearColor(0,0),e.toneMapping=Mn;let u=this.fsQuad,f=this.hashes,h=!1;for(let c=0,p=l;c<p;c++){let x=t[c],M=hS(x);x&&(f[c]!==M||x.isWebGLRenderTarget)&&(x.matrixAutoUpdate=!1,x.matrix.identity(),u.material.map=x,e.setRenderTarget(this,c),u.render(e),x.updateMatrix(),x.matrixAutoUpdate=!0,f[c]=M,h=!0)}return u.material.map=null,e.setClearColor(Jp,a),e.setRenderTarget(s),e.toneMapping=o,h}dispose(){super.dispose(),this.fsQuad.dispose()}},qh=class extends qt{get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}constructor(){super({uniforms:{map:{value:null}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`
				uniform sampler2D map;
				varying vec2 vUv;
				void main() {

					gl_FragColor = texture2D( map, vUv );

				}
			`})}};function dS(i,e=Math.random()){for(let t=i.length-1;t>0;t--){let n=Math.floor(e()*(t+1)),r=i[t];i[t]=i[n],i[n]=r}return i}var Pc=class{constructor(e,t,n=Math.random){let r=e**t,s=new Uint16Array(r),o=r;for(let a=0;a<r;a++)s[a]=a;this.samples=new Float32Array(t),this.strataCount=e,this.reset=function(){for(let a=0;a<r;a++)s[a]=a;o=0},this.reshuffle=function(){o=0},this.next=function(){let{samples:a}=this;o>=s.length&&(dS(s,n),this.reshuffle());let l=s[o++];for(let u=0;u<t;u++)a[u]=(l%e+n())/e,l=Math.floor(l/e);return a}}};var Dc=class{constructor(e,t,n=Math.random){let r=0;for(let l of t)r+=l;let s=new Float32Array(r),o=[],a=0;for(let l of t){let u=new Pc(e,l,n);u.samples=new Float32Array(s.buffer,a,u.samples.length),a+=u.samples.length*4,o.push(u)}this.samples=s,this.strataCount=e,this.next=function(){for(let l of o)l.next();return s},this.reshuffle=function(){for(let l of o)l.reshuffle()},this.reset=function(){for(let l of o)l.reset()}}};var Yh=class{constructor(e=0){this.m=2147483648,this.a=1103515245,this.c=12345,this.seed=e}nextInt(){return this.seed=(this.a*this.seed+this.c)%this.m,this.seed}nextFloat(){return this.nextInt()/(this.m-1)}},Lc=class extends It{constructor(e=1,t=1,n=8){super(new Float32Array(1),1,1,Ge,et),this.minFilter=Qe,this.magFilter=Qe,this.strata=n,this.sampler=null,this.generator=new Yh,this.stableNoise=!1,this.random=()=>this.stableNoise?this.generator.nextFloat():Math.random(),this.init(e,t,n)}init(e=this.image.height,t=this.image.width,n=this.strata){let{image:r}=this;if(r.width===t&&r.height===e&&this.sampler!==null)return;let s=new Array(e*t).fill(4),o=new Dc(n,s,this.random);r.width=t,r.height=e,r.data=o.samples,this.sampler=o,this.dispose(),this.next()}next(){this.sampler.next(),this.needsUpdate=!0}reset(){this.sampler.reset(),this.generator.seed=0}};function Kp(i,e=Math.random){for(let t=i.length-1;t>0;t--){let n=~~((e()-1e-6)*t),r=i[t];i[t]=i[n],i[n]=r}}function Qp(i,e){i.fill(0);for(let t=0;t<e;t++)i[t]=1}var Lo=class{constructor(e){this.count=0,this.size=-1,this.sigma=-1,this.radius=-1,this.lookupTable=null,this.score=null,this.binaryPattern=null,this.resize(e),this.setSigma(1.5)}findVoid(){let{score:e,binaryPattern:t}=this,n=1/0,r=-1;for(let s=0,o=t.length;s<o;s++){if(t[s]!==0)continue;let a=e[s];a<n&&(n=a,r=s)}return r}findCluster(){let{score:e,binaryPattern:t}=this,n=-1/0,r=-1;for(let s=0,o=t.length;s<o;s++){if(t[s]!==1)continue;let a=e[s];a>n&&(n=a,r=s)}return r}setSigma(e){if(e===this.sigma)return;let t=~~(Math.sqrt(20*e**2)+1),n=2*t+1,r=new Float32Array(n*n),s=e*e;for(let o=-t;o<=t;o++)for(let a=-t;a<=t;a++){let l=(t+a)*n+o+t,u=o*o+a*a;r[l]=Math.E**(-u/(2*s))}this.lookupTable=r,this.sigma=e,this.radius=t}resize(e){this.size!==e&&(this.size=e,this.score=new Float32Array(e*e),this.binaryPattern=new Uint8Array(e*e))}invert(){let{binaryPattern:e,score:t,size:n}=this;t.fill(0);for(let r=0,s=e.length;r<s;r++)if(e[r]===0){let o=~~(r/n),a=r-o*n;this.updateScore(a,o,1),e[r]=1}else e[r]=0}updateScore(e,t,n){let{size:r,score:s,lookupTable:o}=this,a=this.radius,l=2*a+1;for(let u=-a;u<=a;u++)for(let f=-a;f<=a;f++){let h=(a+f)*l+u+a,c=o[h],p=e+u;p=p<0?r+p:p%r;let x=t+f;x=x<0?r+x:x%r;let M=x*r+p;s[M]+=n*c}}addPointIndex(e){this.binaryPattern[e]=1;let t=this.size,n=~~(e/t),r=e-n*t;this.updateScore(r,n,1),this.count++}removePointIndex(e){this.binaryPattern[e]=0;let t=this.size,n=~~(e/t),r=e-n*t;this.updateScore(r,n,-1),this.count--}copy(e){this.resize(e.size),this.score.set(e.score),this.binaryPattern.set(e.binaryPattern),this.setSigma(e.sigma),this.count=e.count}};var Fc=class{constructor(){this.random=Math.random,this.sigma=1.5,this.size=64,this.majorityPointsRatio=.1,this.samples=new Lo(1),this.savedSamples=new Lo(1)}generate(){let{samples:e,savedSamples:t,sigma:n,majorityPointsRatio:r,size:s}=this;e.resize(s),e.setSigma(n);let o=Math.floor(s*s*r),a=e.binaryPattern;Qp(a,o),Kp(a,this.random);for(let h=0,c=a.length;h<c;h++)a[h]===1&&e.addPointIndex(h);for(;;){let h=e.findCluster();e.removePointIndex(h);let c=e.findVoid();if(h===c){e.addPointIndex(h);break}e.addPointIndex(c)}let l=new Uint32Array(s*s);t.copy(e);let u;for(u=e.count-1;u>=0;){let h=e.findCluster();e.removePointIndex(h),l[h]=u,u--}let f=s*s;for(u=t.count;u<f/2;){let h=t.findVoid();t.addPointIndex(h),l[h]=u,u++}for(t.invert();u<f;){let h=t.findCluster();t.removePointIndex(h),l[h]=u,u++}return{data:l,maxValue:f}}};function pS(i){return i>=3?4:i}function mS(i){switch(i){case 1:return Tn;case 2:return ln;default:return Ge}}var Nc=class extends It{constructor(e=64,t=1){super(new Float32Array(4),1,1,Ge,et),this.minFilter=Qe,this.magFilter=Qe,this.size=e,this.channels=t,this.update()}update(){let e=this.channels,t=this.size,n=new Fc;n.channels=e,n.size=t;let r=pS(e),s=mS(r);(this.image.width!==t||s!==this.format)&&(this.image.width=t,this.image.height=t,this.image.data=new Float32Array(t**2*r),this.format=s,this.dispose());let o=this.image.data;for(let a=0,l=e;a<l;a++){let u=n.generate(),f=u.data,h=u.maxValue;for(let c=0,p=f.length;c<p;c++){let x=f[c]/h;o[c*r+a]=x}}this.needsUpdate=!0}};var jp=`

	struct PhysicalCamera {

		float focusDistance;
		float anamorphicRatio;
		float bokehSize;
		int apertureBlades;
		float apertureRotation;

	};

`;var em=`

	struct EquirectHdrInfo {

		sampler2D marginalWeights;
		sampler2D conditionalWeights;
		sampler2D map;

		float totalSum;

	};

`;var tm=`

	#define RECT_AREA_LIGHT_TYPE 0
	#define CIRC_AREA_LIGHT_TYPE 1
	#define SPOT_LIGHT_TYPE 2
	#define DIR_LIGHT_TYPE 3
	#define POINT_LIGHT_TYPE 4

	struct LightsInfo {

		sampler2D tex;
		uint count;

	};

	struct Light {

		vec3 position;
		int type;

		vec3 color;
		float intensity;

		vec3 u;
		vec3 v;
		float area;

		// spot light fields
		float radius;
		float near;
		float decay;
		float distance;
		float coneCos;
		float penumbraCos;
		int iesProfile;

	};

	Light readLightInfo( sampler2D tex, uint index ) {

		uint i = index * 6u;

		vec4 s0 = texelFetch1D( tex, i + 0u );
		vec4 s1 = texelFetch1D( tex, i + 1u );
		vec4 s2 = texelFetch1D( tex, i + 2u );
		vec4 s3 = texelFetch1D( tex, i + 3u );

		Light l;
		l.position = s0.rgb;
		l.type = int( round( s0.a ) );

		l.color = s1.rgb;
		l.intensity = s1.a;

		l.u = s2.rgb;
		l.v = s3.rgb;
		l.area = s3.a;

		if ( l.type == SPOT_LIGHT_TYPE || l.type == POINT_LIGHT_TYPE ) {

			vec4 s4 = texelFetch1D( tex, i + 4u );
			vec4 s5 = texelFetch1D( tex, i + 5u );
			l.radius = s4.r;
			l.decay = s4.g;
			l.distance = s4.b;
			l.coneCos = s4.a;

			l.penumbraCos = s5.r;
			l.iesProfile = int( round( s5.g ) );

		} else {

			l.radius = 0.0;
			l.decay = 0.0;
			l.distance = 0.0;

			l.coneCos = 0.0;
			l.penumbraCos = 0.0;
			l.iesProfile = - 1;

		}

		return l;

	}

`;var nm=`

	struct Material {

		vec3 color;
		int map;

		float metalness;
		int metalnessMap;

		float roughness;
		int roughnessMap;

		float ior;
		float transmission;
		int transmissionMap;

		float emissiveIntensity;
		vec3 emissive;
		int emissiveMap;

		int normalMap;
		vec2 normalScale;

		float clearcoat;
		int clearcoatMap;
		int clearcoatNormalMap;
		vec2 clearcoatNormalScale;
		float clearcoatRoughness;
		int clearcoatRoughnessMap;

		int iridescenceMap;
		int iridescenceThicknessMap;
		float iridescence;
		float iridescenceIor;
		float iridescenceThicknessMinimum;
		float iridescenceThicknessMaximum;

		vec3 specularColor;
		int specularColorMap;

		float specularIntensity;
		int specularIntensityMap;
		bool thinFilm;

		vec3 attenuationColor;
		float attenuationDistance;

		int alphaMap;

		bool castShadow;
		float opacity;
		float alphaTest;

		float side;
		bool matte;

		float sheen;
		vec3 sheenColor;
		int sheenColorMap;
		float sheenRoughness;
		int sheenRoughnessMap;

		bool vertexColors;
		bool flatShading;
		bool transparent;
		bool fogVolume;

		mat3 mapTransform;
		mat3 metalnessMapTransform;
		mat3 roughnessMapTransform;
		mat3 transmissionMapTransform;
		mat3 emissiveMapTransform;
		mat3 normalMapTransform;
		mat3 clearcoatMapTransform;
		mat3 clearcoatNormalMapTransform;
		mat3 clearcoatRoughnessMapTransform;
		mat3 sheenColorMapTransform;
		mat3 sheenRoughnessMapTransform;
		mat3 iridescenceMapTransform;
		mat3 iridescenceThicknessMapTransform;
		mat3 specularColorMapTransform;
		mat3 specularIntensityMapTransform;
		mat3 alphaMapTransform;

	};

	mat3 readTextureTransform( sampler2D tex, uint index ) {

		mat3 textureTransform;

		vec4 row1 = texelFetch1D( tex, index );
		vec4 row2 = texelFetch1D( tex, index + 1u );

		textureTransform[0] = vec3(row1.r, row2.r, 0.0);
		textureTransform[1] = vec3(row1.g, row2.g, 0.0);
		textureTransform[2] = vec3(row1.b, row2.b, 1.0);

		return textureTransform;

	}

	Material readMaterialInfo( sampler2D tex, uint index ) {

		uint i = index * uint( MATERIAL_PIXELS );

		vec4 s0 = texelFetch1D( tex, i + 0u );
		vec4 s1 = texelFetch1D( tex, i + 1u );
		vec4 s2 = texelFetch1D( tex, i + 2u );
		vec4 s3 = texelFetch1D( tex, i + 3u );
		vec4 s4 = texelFetch1D( tex, i + 4u );
		vec4 s5 = texelFetch1D( tex, i + 5u );
		vec4 s6 = texelFetch1D( tex, i + 6u );
		vec4 s7 = texelFetch1D( tex, i + 7u );
		vec4 s8 = texelFetch1D( tex, i + 8u );
		vec4 s9 = texelFetch1D( tex, i + 9u );
		vec4 s10 = texelFetch1D( tex, i + 10u );
		vec4 s11 = texelFetch1D( tex, i + 11u );
		vec4 s12 = texelFetch1D( tex, i + 12u );
		vec4 s13 = texelFetch1D( tex, i + 13u );
		vec4 s14 = texelFetch1D( tex, i + 14u );

		Material m;
		m.color = s0.rgb;
		m.map = int( round( s0.a ) );

		m.metalness = s1.r;
		m.metalnessMap = int( round( s1.g ) );
		m.roughness = s1.b;
		m.roughnessMap = int( round( s1.a ) );

		m.ior = s2.r;
		m.transmission = s2.g;
		m.transmissionMap = int( round( s2.b ) );
		m.emissiveIntensity = s2.a;

		m.emissive = s3.rgb;
		m.emissiveMap = int( round( s3.a ) );

		m.normalMap = int( round( s4.r ) );
		m.normalScale = s4.gb;

		m.clearcoat = s4.a;
		m.clearcoatMap = int( round( s5.r ) );
		m.clearcoatRoughness = s5.g;
		m.clearcoatRoughnessMap = int( round( s5.b ) );
		m.clearcoatNormalMap = int( round( s5.a ) );
		m.clearcoatNormalScale = s6.rg;

		m.sheen = s6.a;
		m.sheenColor = s7.rgb;
		m.sheenColorMap = int( round( s7.a ) );
		m.sheenRoughness = s8.r;
		m.sheenRoughnessMap = int( round( s8.g ) );

		m.iridescenceMap = int( round( s8.b ) );
		m.iridescenceThicknessMap = int( round( s8.a ) );
		m.iridescence = s9.r;
		m.iridescenceIor = s9.g;
		m.iridescenceThicknessMinimum = s9.b;
		m.iridescenceThicknessMaximum = s9.a;

		m.specularColor = s10.rgb;
		m.specularColorMap = int( round( s10.a ) );

		m.specularIntensity = s11.r;
		m.specularIntensityMap = int( round( s11.g ) );
		m.thinFilm = bool( s11.b );

		m.attenuationColor = s12.rgb;
		m.attenuationDistance = s12.a;

		m.alphaMap = int( round( s13.r ) );

		m.opacity = s13.g;
		m.alphaTest = s13.b;
		m.side = s13.a;

		m.matte = bool( s14.r );
		m.castShadow = bool( s14.g );
		m.vertexColors = bool( int( s14.b ) & 1 );
		m.flatShading = bool( int( s14.b ) & 2 );
		m.fogVolume = bool( int( s14.b ) & 4 );
		m.transparent = bool( s14.a );

		uint firstTextureTransformIdx = i + 15u;

		// mat3( 1.0 ) is an identity matrix
		m.mapTransform = m.map == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx );
		m.metalnessMapTransform = m.metalnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 2u );
		m.roughnessMapTransform = m.roughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 4u );
		m.transmissionMapTransform = m.transmissionMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 6u );
		m.emissiveMapTransform = m.emissiveMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 8u );
		m.normalMapTransform = m.normalMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 10u );
		m.clearcoatMapTransform = m.clearcoatMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 12u );
		m.clearcoatNormalMapTransform = m.clearcoatNormalMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 14u );
		m.clearcoatRoughnessMapTransform = m.clearcoatRoughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 16u );
		m.sheenColorMapTransform = m.sheenColorMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 18u );
		m.sheenRoughnessMapTransform = m.sheenRoughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 20u );
		m.iridescenceMapTransform = m.iridescenceMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 22u );
		m.iridescenceThicknessMapTransform = m.iridescenceThicknessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 24u );
		m.specularColorMapTransform = m.specularColorMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 26u );
		m.specularIntensityMapTransform = m.specularIntensityMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 28u );
		m.alphaMapTransform = m.alphaMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 30u );

		return m;

	}

`;var im=`

	struct SurfaceRecord {

		// surface type
		bool volumeParticle;

		// geometry
		vec3 faceNormal;
		bool frontFace;
		vec3 normal;
		mat3 normalBasis;
		mat3 normalInvBasis;

		// cached properties
		float eta;
		float f0;

		// material
		float roughness;
		float filteredRoughness;
		float metalness;
		vec3 color;
		vec3 emission;

		// transmission
		float ior;
		float transmission;
		bool thinFilm;
		vec3 attenuationColor;
		float attenuationDistance;

		// clearcoat
		vec3 clearcoatNormal;
		mat3 clearcoatBasis;
		mat3 clearcoatInvBasis;
		float clearcoat;
		float clearcoatRoughness;
		float filteredClearcoatRoughness;

		// sheen
		float sheen;
		vec3 sheenColor;
		float sheenRoughness;

		// iridescence
		float iridescence;
		float iridescenceIor;
		float iridescenceThickness;

		// specular
		vec3 specularColor;
		float specularIntensity;
	};

	struct ScatterRecord {
		float specularPdf;
		float pdf;
		vec3 direction;
		vec3 color;
	};

`;var rm=`

	// samples the the given environment map in the given direction
	vec3 sampleEquirectColor( sampler2D envMap, vec3 direction ) {

		return texture2D( envMap, equirectDirectionToUv( direction ) ).rgb;

	}

	// gets the pdf of the given direction to sample
	float equirectDirectionPdf( vec3 direction ) {

		vec2 uv = equirectDirectionToUv( direction );
		float theta = uv.y * PI;
		float sinTheta = sin( theta );
		if ( sinTheta == 0.0 ) {

			return 0.0;

		}

		return 1.0 / ( 2.0 * PI * PI * sinTheta );

	}

	// samples the color given env map with CDF and returns the pdf of the direction
	float sampleEquirect( vec3 direction, inout vec3 color ) {

		float totalSum = envMapInfo.totalSum;
		if ( totalSum == 0.0 ) {

			color = vec3( 0.0 );
			return 1.0;

		}

		vec2 uv = equirectDirectionToUv( direction );
		color = texture2D( envMapInfo.map, uv ).rgb;

		float lum = luminance( color );
		ivec2 resolution = textureSize( envMapInfo.map, 0 );
		float pdf = lum / totalSum;

		return float( resolution.x * resolution.y ) * pdf * equirectDirectionPdf( direction );

	}

	// samples a direction of the envmap with color and retrieves pdf
	float sampleEquirectProbability( vec2 r, inout vec3 color, inout vec3 direction ) {

		// sample env map cdf
		float v = texture2D( envMapInfo.marginalWeights, vec2( r.x, 0.0 ) ).x;
		float u = texture2D( envMapInfo.conditionalWeights, vec2( r.y, v ) ).x;
		vec2 uv = vec2( u, v );

		vec3 derivedDirection = equirectUvToDirection( uv );
		direction = derivedDirection;
		color = texture2D( envMapInfo.map, uv ).rgb;

		float totalSum = envMapInfo.totalSum;
		float lum = luminance( color );
		ivec2 resolution = textureSize( envMapInfo.map, 0 );
		float pdf = lum / totalSum;

		return float( resolution.x * resolution.y ) * pdf * equirectDirectionPdf( direction );

	}
`;var sm=`

	float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {

		return smoothstep( coneCosine, penumbraCosine, angleCosine );

	}

	float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

		// based upon Frostbite 3 Moving to Physically-based Rendering
		// page 32, equation 26: E[window1]
		// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), EPSILON );

		if ( cutoffDistance > 0.0 ) {

			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

		}

		return distanceFalloff;

	}

	float getPhotometricAttenuation( sampler2DArray iesProfiles, int iesProfile, vec3 posToLight, vec3 lightDir, vec3 u, vec3 v ) {

		float cosTheta = dot( posToLight, lightDir );
		float angle = acos( cosTheta ) / PI;

		return texture2D( iesProfiles, vec3( angle, 0.0, iesProfile ) ).r;

	}

	struct LightRecord {

		float dist;
		vec3 direction;
		float pdf;
		vec3 emission;
		int type;

	};

	bool intersectLightAtIndex( sampler2D lights, vec3 rayOrigin, vec3 rayDirection, uint l, inout LightRecord lightRec ) {

		bool didHit = false;
		Light light = readLightInfo( lights, l );

		vec3 u = light.u;
		vec3 v = light.v;

		// check for backface
		vec3 normal = normalize( cross( u, v ) );
		if ( dot( normal, rayDirection ) > 0.0 ) {

			u *= 1.0 / dot( u, u );
			v *= 1.0 / dot( v, v );

			float dist;

			// MIS / light intersection is not supported for punctual lights.
			if(
				( light.type == RECT_AREA_LIGHT_TYPE && intersectsRectangle( light.position, normal, u, v, rayOrigin, rayDirection, dist ) ) ||
				( light.type == CIRC_AREA_LIGHT_TYPE && intersectsCircle( light.position, normal, u, v, rayOrigin, rayDirection, dist ) )
			) {

				float cosTheta = dot( rayDirection, normal );
				didHit = true;
				lightRec.dist = dist;
				lightRec.pdf = ( dist * dist ) / ( light.area * cosTheta );
				lightRec.emission = light.color * light.intensity;
				lightRec.direction = rayDirection;
				lightRec.type = light.type;

			}

		}

		return didHit;

	}

	LightRecord randomAreaLightSample( Light light, vec3 rayOrigin, vec2 ruv ) {

		vec3 randomPos;
		if( light.type == RECT_AREA_LIGHT_TYPE ) {

			// rectangular area light
			randomPos = light.position + light.u * ( ruv.x - 0.5 ) + light.v * ( ruv.y - 0.5 );

		} else if( light.type == CIRC_AREA_LIGHT_TYPE ) {

			// circular area light
			float r = 0.5 * sqrt( ruv.x );
			float theta = ruv.y * 2.0 * PI;
			float x = r * cos( theta );
			float y = r * sin( theta );

			randomPos = light.position + light.u * x + light.v * y;

		}

		vec3 toLight = randomPos - rayOrigin;
		float lightDistSq = dot( toLight, toLight );
		float dist = sqrt( lightDistSq );
		vec3 direction = toLight / dist;
		vec3 lightNormal = normalize( cross( light.u, light.v ) );

		LightRecord lightRec;
		lightRec.type = light.type;
		lightRec.emission = light.color * light.intensity;
		lightRec.dist = dist;
		lightRec.direction = direction;

		// TODO: the denominator is potentially zero
		lightRec.pdf = lightDistSq / ( light.area * dot( direction, lightNormal ) );

		return lightRec;

	}

	LightRecord randomSpotLightSample( Light light, sampler2DArray iesProfiles, vec3 rayOrigin, vec2 ruv ) {

		float radius = light.radius * sqrt( ruv.x );
		float theta = ruv.y * 2.0 * PI;
		float x = radius * cos( theta );
		float y = radius * sin( theta );

		vec3 u = light.u;
		vec3 v = light.v;
		vec3 normal = normalize( cross( u, v ) );

		float angle = acos( light.coneCos );
		float angleTan = tan( angle );
		float startDistance = light.radius / max( angleTan, EPSILON );

		vec3 randomPos = light.position - normal * startDistance + u * x + v * y;
		vec3 toLight = randomPos - rayOrigin;
		float lightDistSq = dot( toLight, toLight );
		float dist = sqrt( lightDistSq );

		vec3 direction = toLight / max( dist, EPSILON );
		float cosTheta = dot( direction, normal );

		float spotAttenuation = light.iesProfile != - 1 ?
			getPhotometricAttenuation( iesProfiles, light.iesProfile, direction, normal, u, v ) :
			getSpotAttenuation( light.coneCos, light.penumbraCos, cosTheta );

		float distanceAttenuation = getDistanceAttenuation( dist, light.distance, light.decay );
		LightRecord lightRec;
		lightRec.type = light.type;
		lightRec.dist = dist;
		lightRec.direction = direction;
		lightRec.emission = light.color * light.intensity * distanceAttenuation * spotAttenuation;
		lightRec.pdf = 1.0;

		return lightRec;

	}

	LightRecord randomLightSample( sampler2D lights, sampler2DArray iesProfiles, uint lightCount, vec3 rayOrigin, vec3 ruv ) {

		LightRecord result;

		// pick a random light
		uint l = uint( ruv.x * float( lightCount ) );
		Light light = readLightInfo( lights, l );

		if ( light.type == SPOT_LIGHT_TYPE ) {

			result = randomSpotLightSample( light, iesProfiles, rayOrigin, ruv.yz );

		} else if ( light.type == POINT_LIGHT_TYPE ) {

			vec3 lightRay = light.u - rayOrigin;
			float lightDist = length( lightRay );
			float cutoffDistance = light.distance;
			float distanceFalloff = 1.0 / max( pow( lightDist, light.decay ), 0.01 );
			if ( cutoffDistance > 0.0 ) {

				distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDist / cutoffDistance ) ) );

			}

			LightRecord rec;
			rec.direction = normalize( lightRay );
			rec.dist = length( lightRay );
			rec.pdf = 1.0;
			rec.emission = light.color * light.intensity * distanceFalloff;
			rec.type = light.type;
			result = rec;

		} else if ( light.type == DIR_LIGHT_TYPE ) {

			LightRecord rec;
			rec.dist = 1e10;
			rec.direction = light.u;
			rec.pdf = 1.0;
			rec.emission = light.color * light.intensity;
			rec.type = light.type;

			result = rec;

		} else {

			// sample the light
			result = randomAreaLightSample( light, rayOrigin, ruv.yz );

		}

		return result;

	}

`;var om=`

	vec3 sampleHemisphere( vec3 n, vec2 uv ) {

		// https://www.rorydriscoll.com/2009/01/07/better-sampling/
		// https://graphics.pixar.com/library/OrthonormalB/paper.pdf
		float sign = n.z == 0.0 ? 1.0 : sign( n.z );
		float a = - 1.0 / ( sign + n.z );
		float b = n.x * n.y * a;
		vec3 b1 = vec3( 1.0 + sign * n.x * n.x * a, sign * b, - sign * n.x );
		vec3 b2 = vec3( b, sign + n.y * n.y * a, - n.y );

		float r = sqrt( uv.x );
		float theta = 2.0 * PI * uv.y;
		float x = r * cos( theta );
		float y = r * sin( theta );
		return x * b1 + y * b2 + sqrt( 1.0 - uv.x ) * n;

	}

	vec2 sampleTriangle( vec2 a, vec2 b, vec2 c, vec2 r ) {

		// get the edges of the triangle and the diagonal across the
		// center of the parallelogram
		vec2 e1 = a - b;
		vec2 e2 = c - b;
		vec2 diag = normalize( e1 + e2 );

		// pick the point in the parallelogram
		if ( r.x + r.y > 1.0 ) {

			r = vec2( 1.0 ) - r;

		}

		return e1 * r.x + e2 * r.y;

	}

	vec2 sampleCircle( vec2 uv ) {

		float angle = 2.0 * PI * uv.x;
		float radius = sqrt( uv.y );
		return vec2( cos( angle ), sin( angle ) ) * radius;

	}

	vec3 sampleSphere( vec2 uv ) {

		float u = ( uv.x - 0.5 ) * 2.0;
		float t = uv.y * PI * 2.0;
		float f = sqrt( 1.0 - u * u );

		return vec3( f * cos( t ), f * sin( t ), u );

	}

	vec2 sampleRegularPolygon( int sides, vec3 uvw ) {

		sides = max( sides, 3 );

		vec3 r = uvw;
		float anglePerSegment = 2.0 * PI / float( sides );
		float segment = floor( float( sides ) * r.x );

		float angle1 = anglePerSegment * segment;
		float angle2 = angle1 + anglePerSegment;
		vec2 a = vec2( sin( angle1 ), cos( angle1 ) );
		vec2 b = vec2( 0.0, 0.0 );
		vec2 c = vec2( sin( angle2 ), cos( angle2 ) );

		return sampleTriangle( a, b, c, r.yz );

	}

	// samples an aperture shape with the given number of sides. 0 means circle
	vec2 sampleAperture( int blades, vec3 uvw ) {

		return blades == 0 ?
			sampleCircle( uvw.xy ) :
			sampleRegularPolygon( blades, uvw );

	}


`;var am=`

	bool totalInternalReflection( float cosTheta, float eta ) {

		float sinTheta = sqrt( 1.0 - cosTheta * cosTheta );
		return eta * sinTheta > 1.0;

	}

	// https://google.github.io/filament/Filament.md.html#materialsystem/diffusebrdf
	float schlickFresnel( float cosine, float f0 ) {

		return f0 + ( 1.0 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	vec3 schlickFresnel( float cosine, vec3 f0 ) {

		return f0 + ( 1.0 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	vec3 schlickFresnel( float cosine, vec3 f0, vec3 f90 ) {

		return f0 + ( f90 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	float dielectricFresnel( float cosThetaI, float eta ) {

		// https://schuttejoe.github.io/post/disneybsdf/
		float ni = eta;
		float nt = 1.0;

		// Check for total internal reflection
		float sinThetaISq = 1.0f - cosThetaI * cosThetaI;
		float sinThetaTSq = eta * eta * sinThetaISq;
		if( sinThetaTSq >= 1.0 ) {

			return 1.0;

		}

		float sinThetaT = sqrt( sinThetaTSq );

		float cosThetaT = sqrt( max( 0.0, 1.0f - sinThetaT * sinThetaT ) );
		float rParallel = ( ( nt * cosThetaI ) - ( ni * cosThetaT ) ) / ( ( nt * cosThetaI ) + ( ni * cosThetaT ) );
		float rPerpendicular = ( ( ni * cosThetaI ) - ( nt * cosThetaT ) ) / ( ( ni * cosThetaI ) + ( nt * cosThetaT ) );
		return ( rParallel * rParallel + rPerpendicular * rPerpendicular ) / 2.0;

	}

	// https://raytracing.github.io/books/RayTracingInOneWeekend.html#dielectrics/schlickapproximation
	float iorRatioToF0( float eta ) {

		return pow( ( 1.0 - eta ) / ( 1.0 + eta ), 2.0 );

	}

	vec3 evaluateFresnel( float cosTheta, float eta, vec3 f0, vec3 f90 ) {

		if ( totalInternalReflection( cosTheta, eta ) ) {

			return f90;

		}

		return schlickFresnel( cosTheta, f0, f90 );

	}

	// TODO: disney fresnel was removed and replaced with this fresnel function to better align with
	// the glTF but is causing blown out pixels. Should be revisited
	// float evaluateFresnelWeight( float cosTheta, float eta, float f0 ) {

	// 	if ( totalInternalReflection( cosTheta, eta ) ) {

	// 		return 1.0;

	// 	}

	// 	return schlickFresnel( cosTheta, f0 );

	// }

	// https://schuttejoe.github.io/post/disneybsdf/
	float disneyFresnel( vec3 wo, vec3 wi, vec3 wh, float f0, float eta, float metalness ) {

		float dotHV = dot( wo, wh );
		if ( totalInternalReflection( dotHV, eta ) ) {

			return 1.0;

		}

		float dotHL = dot( wi, wh );
		float dielectricFresnel = dielectricFresnel( abs( dotHV ), eta );
		float metallicFresnel = schlickFresnel( dotHL, f0 );

		return mix( dielectricFresnel, metallicFresnel, metalness );

	}

`;var lm=`

	// Fast arccos approximation used to remove banding artifacts caused by numerical errors in acos.
	// This is a cubic Lagrange interpolating polynomial for x = [-1, -1/2, 0, 1/2, 1].
	// For more information see: https://github.com/gkjohnson/three-gpu-pathtracer/pull/171#issuecomment-1152275248
	float acosApprox( float x ) {

		x = clamp( x, -1.0, 1.0 );
		return ( - 0.69813170079773212 * x * x - 0.87266462599716477 ) * x + 1.5707963267948966;

	}

	// An acos with input values bound to the range [-1, 1].
	float acosSafe( float x ) {

		return acos( clamp( x, -1.0, 1.0 ) );

	}

	float saturateCos( float val ) {

		return clamp( val, 0.001, 1.0 );

	}

	float square( float t ) {

		return t * t;

	}

	vec2 square( vec2 t ) {

		return t * t;

	}

	vec3 square( vec3 t ) {

		return t * t;

	}

	vec4 square( vec4 t ) {

		return t * t;

	}

	vec2 rotateVector( vec2 v, float t ) {

		float ac = cos( t );
		float as = sin( t );
		return vec2(
			v.x * ac - v.y * as,
			v.x * as + v.y * ac
		);

	}

	// forms a basis with the normal vector as Z
	mat3 getBasisFromNormal( vec3 normal ) {

		vec3 other;
		if ( abs( normal.x ) > 0.5 ) {

			other = vec3( 0.0, 1.0, 0.0 );

		} else {

			other = vec3( 1.0, 0.0, 0.0 );

		}

		vec3 ortho = normalize( cross( normal, other ) );
		vec3 ortho2 = normalize( cross( normal, ortho ) );
		return mat3( ortho2, ortho, normal );

	}

`;var cm=`

	// Finds the point where the ray intersects the plane defined by u and v and checks if this point
	// falls in the bounds of the rectangle on that same plane.
	// Plane intersection: https://lousodrome.net/blog/light/2020/07/03/intersection-of-a-ray-and-a-plane/
	bool intersectsRectangle( vec3 center, vec3 normal, vec3 u, vec3 v, vec3 rayOrigin, vec3 rayDirection, inout float dist ) {

		float t = dot( center - rayOrigin, normal ) / dot( rayDirection, normal );

		if ( t > EPSILON ) {

			vec3 p = rayOrigin + rayDirection * t;
			vec3 vi = p - center;

			// check if p falls inside the rectangle
			float a1 = dot( u, vi );
			if ( abs( a1 ) <= 0.5 ) {

				float a2 = dot( v, vi );
				if ( abs( a2 ) <= 0.5 ) {

					dist = t;
					return true;

				}

			}

		}

		return false;

	}

	// Finds the point where the ray intersects the plane defined by u and v and checks if this point
	// falls in the bounds of the circle on that same plane. See above URL for a description of the plane intersection algorithm.
	bool intersectsCircle( vec3 position, vec3 normal, vec3 u, vec3 v, vec3 rayOrigin, vec3 rayDirection, inout float dist ) {

		float t = dot( position - rayOrigin, normal ) / dot( rayDirection, normal );

		if ( t > EPSILON ) {

			vec3 hit = rayOrigin + rayDirection * t;
			vec3 vi = hit - position;

			float a1 = dot( u, vi );
			float a2 = dot( v, vi );

			if( length( vec2( a1, a2 ) ) <= 0.5 ) {

				dist = t;
				return true;

			}

		}

		return false;

	}

`;var um=`

	// add texel fetch functions for texture arrays
	vec4 texelFetch1D( sampler2DArray tex, int layer, uint index ) {

		uint width = uint( textureSize( tex, 0 ).x );
		uvec2 uv;
		uv.x = index % width;
		uv.y = index / width;

		return texelFetch( tex, ivec3( uv, layer ), 0 );

	}

	vec4 textureSampleBarycoord( sampler2DArray tex, int layer, vec3 barycoord, uvec3 faceIndices ) {

		return
			barycoord.x * texelFetch1D( tex, layer, faceIndices.x ) +
			barycoord.y * texelFetch1D( tex, layer, faceIndices.y ) +
			barycoord.z * texelFetch1D( tex, layer, faceIndices.z );

	}

`;var Uc=`

	// TODO: possibly this should be renamed something related to material or path tracing logic

	#ifndef RAY_OFFSET
	#define RAY_OFFSET 1e-4
	#endif

	// adjust the hit point by the surface normal by a factor of some offset and the
	// maximum component-wise value of the current point to accommodate floating point
	// error as values increase.
	vec3 stepRayOrigin( vec3 rayOrigin, vec3 rayDirection, vec3 offset, float dist ) {

		vec3 point = rayOrigin + rayDirection * dist;
		vec3 absPoint = abs( point );
		float maxPoint = max( absPoint.x, max( absPoint.y, absPoint.z ) );
		return point + offset * ( maxPoint + 1.0 ) * RAY_OFFSET;

	}

	// https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_volume/README.md#attenuation
	vec3 transmissionAttenuation( float dist, vec3 attColor, float attDist ) {

		vec3 ot = - log( attColor ) / attDist;
		return exp( - ot * dist );

	}

	vec3 getHalfVector( vec3 wi, vec3 wo, float eta ) {

		// get the half vector - assuming if the light incident vector is on the other side
		// of the that it's transmissive.
		vec3 h;
		if ( wi.z > 0.0 ) {

			h = normalize( wi + wo );

		} else {

			// Scale by the ior ratio to retrieve the appropriate half vector
			// From Section 2.2 on computing the transmission half vector:
			// https://blog.selfshadow.com/publications/s2015-shading-course/burley/s2015_pbs_disney_bsdf_notes.pdf
			h = normalize( wi + wo * eta );

		}

		h *= sign( h.z );
		return h;

	}

	vec3 getHalfVector( vec3 a, vec3 b ) {

		return normalize( a + b );

	}

	// The discrepancy between interpolated surface normal and geometry normal can cause issues when a ray
	// is cast that is on the top side of the geometry normal plane but below the surface normal plane. If
	// we find a ray like that we ignore it to avoid artifacts.
	// This function returns if the direction is on the same side of both planes.
	bool isDirectionValid( vec3 direction, vec3 surfaceNormal, vec3 geometryNormal ) {

		bool aboveSurfaceNormal = dot( direction, surfaceNormal ) > 0.0;
		bool aboveGeometryNormal = dot( direction, geometryNormal ) > 0.0;
		return aboveSurfaceNormal == aboveGeometryNormal;

	}

	// ray sampling x and z are swapped to align with expected background view
	vec2 equirectDirectionToUv( vec3 direction ) {

		// from Spherical.setFromCartesianCoords
		vec2 uv = vec2( atan( direction.z, direction.x ), acos( direction.y ) );
		uv /= vec2( 2.0 * PI, PI );

		// apply adjustments to get values in range [0, 1] and y right side up
		uv.x += 0.5;
		uv.y = 1.0 - uv.y;
		return uv;

	}

	vec3 equirectUvToDirection( vec2 uv ) {

		// undo above adjustments
		uv.x -= 0.5;
		uv.y = 1.0 - uv.y;

		// from Vector3.setFromSphericalCoords
		float theta = uv.x * 2.0 * PI;
		float phi = uv.y * PI;

		float sinPhi = sin( phi );

		return vec3( sinPhi * cos( theta ), cos( phi ), sinPhi * sin( theta ) );

	}

	// power heuristic for multiple importance sampling
	float misHeuristic( float a, float b ) {

		float aa = a * a;
		float bb = b * b;
		return aa / ( aa + bb );

	}

	// tentFilter from Peter Shirley's 'Realistic Ray Tracing (2nd Edition)' book, pg. 60
	// erichlof/THREE.js-PathTracing-Renderer/
	float tentFilter( float x ) {

		return x < 0.5 ? sqrt( 2.0 * x ) - 1.0 : 1.0 - sqrt( 2.0 - ( 2.0 * x ) );

	}
`;var Zh=`

	// https://www.shadertoy.com/view/wltcRS
	uvec4 WHITE_NOISE_SEED;

	void rng_initialize( vec2 p, int frame ) {

		// white noise seed
		WHITE_NOISE_SEED = uvec4( p, uint( frame ), uint( p.x ) + uint( p.y ) );

	}

	// https://www.pcg-random.org/
	void pcg4d( inout uvec4 v ) {

		v = v * 1664525u + 1013904223u;
		v.x += v.y * v.w;
		v.y += v.z * v.x;
		v.z += v.x * v.y;
		v.w += v.y * v.z;
		v = v ^ ( v >> 16u );
		v.x += v.y*v.w;
		v.y += v.z*v.x;
		v.z += v.x*v.y;
		v.w += v.y*v.z;

	}

	// returns [ 0, 1 ]
	float pcgRand() {

		pcg4d( WHITE_NOISE_SEED );
		return float( WHITE_NOISE_SEED.x ) / float( 0xffffffffu );

	}

	vec2 pcgRand2() {

		pcg4d( WHITE_NOISE_SEED );
		return vec2( WHITE_NOISE_SEED.xy ) / float(0xffffffffu);

	}

	vec3 pcgRand3() {

		pcg4d( WHITE_NOISE_SEED );
		return vec3( WHITE_NOISE_SEED.xyz ) / float( 0xffffffffu );

	}

	vec4 pcgRand4() {

		pcg4d( WHITE_NOISE_SEED );
		return vec4( WHITE_NOISE_SEED ) / float( 0xffffffffu );

	}
`;var hm=`

	uniform sampler2D stratifiedTexture;
	uniform sampler2D stratifiedOffsetTexture;

	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;
	vec4 pixelSeed = vec4( 0 );

	vec4 rand4( int v ) {

		ivec2 uv = ivec2( v, sobolBounceIndex );
		vec4 stratifiedSample = texelFetch( stratifiedTexture, uv, 0 );
		return fract( stratifiedSample + pixelSeed.r ); // blue noise + stratified samples

	}

	vec3 rand3( int v ) {

		return rand4( v ).xyz;

	}

	vec2 rand2( int v ) {

		return rand4( v ).xy;

	}

	float rand( int v ) {

		return rand4( v ).x;

	}

	void rng_initialize( vec2 screenCoord, int frame ) {

		// tile the small noise texture across the entire screen
		ivec2 noiseSize = ivec2( textureSize( stratifiedOffsetTexture, 0 ) );
		ivec2 pixel = ivec2( screenCoord.xy ) % noiseSize;
		vec2 pixelWidth = 1.0 / vec2( noiseSize );
		vec2 uv = vec2( pixel ) * pixelWidth + pixelWidth * 0.5;

		// note that using "texelFetch" here seems to break Android for some reason
		pixelSeed = texture( stratifiedOffsetTexture, uv );

	}

`;var fm=`

	// diffuse
	float diffuseEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// https://schuttejoe.github.io/post/disneybsdf/
		float fl = schlickFresnel( wi.z, 0.0 );
		float fv = schlickFresnel( wo.z, 0.0 );

		float metalFactor = ( 1.0 - surf.metalness );
		float transFactor = ( 1.0 - surf.transmission );
		float rr = 0.5 + 2.0 * surf.roughness * fl * fl;
		float retro = rr * ( fl + fv + fl * fv * ( rr - 1.0f ) );
		float lambert = ( 1.0f - 0.5f * fl ) * ( 1.0f - 0.5f * fv );

		// TODO: subsurface approx?

		// float F = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float F = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );
		color = ( 1.0 - F ) * transFactor * metalFactor * wi.z * surf.color * ( retro + lambert ) / PI;

		return wi.z / PI;

	}

	vec3 diffuseDirection( vec3 wo, SurfaceRecord surf ) {

		vec3 lightDirection = sampleSphere( rand2( 11 ) );
		lightDirection.z += 1.0;
		lightDirection = normalize( lightDirection );

		return lightDirection;

	}

	// specular
	float specularEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// if roughness is set to 0 then D === NaN which results in black pixels
		float metalness = surf.metalness;
		float roughness = surf.filteredRoughness;

		float eta = surf.eta;
		float f0 = surf.f0;

		vec3 f0Color = mix( f0 * surf.specularColor * surf.specularIntensity, surf.color, surf.metalness );
		vec3 f90Color = vec3( mix( surf.specularIntensity, 1.0, surf.metalness ) );
		vec3 F = evaluateFresnel( dot( wo, wh ), eta, f0Color, f90Color );

		vec3 iridescenceF = evalIridescence( 1.0, surf.iridescenceIor, dot( wi, wh ), surf.iridescenceThickness, f0Color );
		F = mix( F, iridescenceF,  surf.iridescence );

		// PDF
		// See 14.1.1 Microfacet BxDFs in https://www.pbr-book.org/
		float incidentTheta = acos( wo.z );
		float G = ggxShadowMaskG2( wi, wo, roughness );
		float D = ggxDistribution( wh, roughness );
		float G1 = ggxShadowMaskG1( incidentTheta, roughness );
		float ggxPdf = D * G1 * max( 0.0, abs( dot( wo, wh ) ) ) / abs ( wo.z );

		color = wi.z * F * G * D / ( 4.0 * abs( wi.z * wo.z ) );
		return ggxPdf / ( 4.0 * dot( wo, wh ) );

	}

	vec3 specularDirection( vec3 wo, SurfaceRecord surf ) {

		// sample ggx vndf distribution which gives a new normal
		float roughness = surf.filteredRoughness;
		vec3 halfVector = ggxDirection(
			wo,
			vec2( roughness ),
			rand2( 12 )
		);

		// apply to new ray by reflecting off the new normal
		return - reflect( wo, halfVector );

	}


	// transmission
	/*
	float transmissionEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// See section 4.2 in https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf

		float filteredRoughness = surf.filteredRoughness;
		float eta = surf.eta;
		bool frontFace = surf.frontFace;
		bool thinFilm = surf.thinFilm;

		color = surf.transmission * surf.color;

		float denom = pow( eta * dot( wi, wh ) + dot( wo, wh ), 2.0 );
		return ggxPDF( wo, wh, filteredRoughness ) / denom;

	}

	vec3 transmissionDirection( vec3 wo, SurfaceRecord surf ) {

		float filteredRoughness = surf.filteredRoughness;
		float eta = surf.eta;
		bool frontFace = surf.frontFace;

		// sample ggx vndf distribution which gives a new normal
		vec3 halfVector = ggxDirection(
			wo,
			vec2( filteredRoughness ),
			rand2( 13 )
		);

		vec3 lightDirection = refract( normalize( - wo ), halfVector, eta );
		if ( surf.thinFilm ) {

			lightDirection = - refract( normalize( - lightDirection ), - vec3( 0.0, 0.0, 1.0 ), 1.0 / eta );

		}

		return normalize( lightDirection );

	}
	*/

	// TODO: This is just using a basic cosine-weighted specular distribution with an
	// incorrect PDF value at the moment. Update it to correctly use a GGX distribution
	float transmissionEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		color = surf.transmission * surf.color;

		// PDF
		// float F = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		// float F = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );
		// if ( F >= 1.0 ) {

		// 	return 0.0;

		// }

		// return 1.0 / ( 1.0 - F );

		// reverted to previous to transmission. The above was causing black pixels
		float eta = surf.eta;
		float f0 = surf.f0;
		float cosTheta = min( wo.z, 1.0 );
		float sinTheta = sqrt( 1.0 - cosTheta * cosTheta );
		float reflectance = schlickFresnel( cosTheta, f0 );
		bool cannotRefract = eta * sinTheta > 1.0;
		if ( cannotRefract ) {

			return 0.0;

		}

		return 1.0 / ( 1.0 - reflectance );

	}

	vec3 transmissionDirection( vec3 wo, SurfaceRecord surf ) {

		float roughness = surf.filteredRoughness;
		float eta = surf.eta;
		vec3 halfVector = normalize( vec3( 0.0, 0.0, 1.0 ) + sampleSphere( rand2( 13 ) ) * roughness );
		vec3 lightDirection = refract( normalize( - wo ), halfVector, eta );

		if ( surf.thinFilm ) {

			lightDirection = - refract( normalize( - lightDirection ), - vec3( 0.0, 0.0, 1.0 ), 1.0 / eta );

		}
		return normalize( lightDirection );

	}

	// clearcoat
	float clearcoatEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		float ior = 1.5;
		float f0 = iorRatioToF0( ior );
		bool frontFace = surf.frontFace;
		float roughness = surf.filteredClearcoatRoughness;

		float eta = frontFace ? 1.0 / ior : ior;
		float G = ggxShadowMaskG2( wi, wo, roughness );
		float D = ggxDistribution( wh, roughness );
		float F = schlickFresnel( dot( wi, wh ), f0 );

		float fClearcoat = F * D * G / ( 4.0 * abs( wi.z * wo.z ) );
		color = color * ( 1.0 - surf.clearcoat * F ) + fClearcoat * surf.clearcoat * wi.z;

		// PDF
		// See equation (27) in http://jcgt.org/published/0003/02/03/
		return ggxPDF( wo, wh, roughness ) / ( 4.0 * dot( wi, wh ) );

	}

	vec3 clearcoatDirection( vec3 wo, SurfaceRecord surf ) {

		// sample ggx vndf distribution which gives a new normal
		float roughness = surf.filteredClearcoatRoughness;
		vec3 halfVector = ggxDirection(
			wo,
			vec2( roughness ),
			rand2( 14 )
		);

		// apply to new ray by reflecting off the new normal
		return - reflect( wo, halfVector );

	}

	// sheen
	vec3 sheenColor( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf ) {

		float cosThetaO = saturateCos( wo.z );
		float cosThetaI = saturateCos( wi.z );
		float cosThetaH = wh.z;

		float D = velvetD( cosThetaH, surf.sheenRoughness );
		float G = velvetG( cosThetaO, cosThetaI, surf.sheenRoughness );

		// See equation (1) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
		vec3 color = surf.sheenColor;
		color *= D * G / ( 4.0 * abs( cosThetaO * cosThetaI ) );

		return color;

	}

	// bsdf
	void getLobeWeights(
		vec3 wo, vec3 wi, vec3 wh, vec3 clearcoatWo, SurfaceRecord surf,
		inout float diffuseWeight, inout float specularWeight, inout float transmissionWeight, inout float clearcoatWeight
	) {

		float metalness = surf.metalness;
		float transmission = surf.transmission;
		// float fEstimate = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float fEstimate = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );

		float transSpecularProb = mix( max( 0.25, fEstimate ), 1.0, metalness );
		float diffSpecularProb = 0.5 + 0.5 * metalness;

		diffuseWeight = ( 1.0 - transmission ) * ( 1.0 - diffSpecularProb );
		specularWeight = transmission * transSpecularProb + ( 1.0 - transmission ) * diffSpecularProb;
		transmissionWeight = transmission * ( 1.0 - transSpecularProb );
		clearcoatWeight = surf.clearcoat * schlickFresnel( clearcoatWo.z, 0.04 );

		float totalWeight = diffuseWeight + specularWeight + transmissionWeight + clearcoatWeight;
		diffuseWeight /= totalWeight;
		specularWeight /= totalWeight;
		transmissionWeight /= totalWeight;
		clearcoatWeight /= totalWeight;
	}

	float bsdfEval(
		vec3 wo, vec3 clearcoatWo, vec3 wi, vec3 clearcoatWi, SurfaceRecord surf,
		float diffuseWeight, float specularWeight, float transmissionWeight, float clearcoatWeight, inout float specularPdf, inout vec3 color
	) {

		float metalness = surf.metalness;
		float transmission = surf.transmission;

		float spdf = 0.0;
		float dpdf = 0.0;
		float tpdf = 0.0;
		float cpdf = 0.0;
		color = vec3( 0.0 );

		vec3 halfVector = getHalfVector( wi, wo, surf.eta );

		// diffuse
		if ( diffuseWeight > 0.0 && wi.z > 0.0 ) {

			dpdf = diffuseEval( wo, wi, halfVector, surf, color );
			color *= 1.0 - surf.transmission;

		}

		// ggx specular
		if ( specularWeight > 0.0 && wi.z > 0.0 ) {

			vec3 outColor;
			spdf = specularEval( wo, wi, getHalfVector( wi, wo ), surf, outColor );
			color += outColor;

		}

		// transmission
		if ( transmissionWeight > 0.0 && wi.z < 0.0 ) {

			tpdf = transmissionEval( wo, wi, halfVector, surf, color );

		}

		// sheen
		color *= mix( 1.0, sheenAlbedoScaling( wo, wi, surf ), surf.sheen );
		color += sheenColor( wo, wi, halfVector, surf ) * surf.sheen;

		// clearcoat
		if ( clearcoatWi.z >= 0.0 && clearcoatWeight > 0.0 ) {

			vec3 clearcoatHalfVector = getHalfVector( clearcoatWo, clearcoatWi );
			cpdf = clearcoatEval( clearcoatWo, clearcoatWi, clearcoatHalfVector, surf, color );

		}

		float pdf =
			dpdf * diffuseWeight
			+ spdf * specularWeight
			+ tpdf * transmissionWeight
			+ cpdf * clearcoatWeight;

		// retrieve specular rays for the shadows flag
		specularPdf = spdf * specularWeight + cpdf * clearcoatWeight;

		return pdf;

	}

	float bsdfResult( vec3 worldWo, vec3 worldWi, SurfaceRecord surf, inout vec3 color ) {

		if ( surf.volumeParticle ) {

			color = surf.color / ( 4.0 * PI );
			return 1.0 / ( 4.0 * PI );

		}

		vec3 wo = normalize( surf.normalInvBasis * worldWo );
		vec3 wi = normalize( surf.normalInvBasis * worldWi );

		vec3 clearcoatWo = normalize( surf.clearcoatInvBasis * worldWo );
		vec3 clearcoatWi = normalize( surf.clearcoatInvBasis * worldWi );

		vec3 wh = getHalfVector( wo, wi, surf.eta );
		float diffuseWeight;
		float specularWeight;
		float transmissionWeight;
		float clearcoatWeight;
		getLobeWeights( wo, wi, wh, clearcoatWo, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight );

		float specularPdf;
		return bsdfEval( wo, clearcoatWo, wi, clearcoatWi, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight, specularPdf, color );

	}

	ScatterRecord bsdfSample( vec3 worldWo, SurfaceRecord surf ) {

		if ( surf.volumeParticle ) {

			ScatterRecord sampleRec;
			sampleRec.specularPdf = 0.0;
			sampleRec.pdf = 1.0 / ( 4.0 * PI );
			sampleRec.direction = sampleSphere( rand2( 16 ) );
			sampleRec.color = surf.color / ( 4.0 * PI );
			return sampleRec;

		}

		vec3 wo = normalize( surf.normalInvBasis * worldWo );
		vec3 clearcoatWo = normalize( surf.clearcoatInvBasis * worldWo );
		mat3 normalBasis = surf.normalBasis;
		mat3 invBasis = surf.normalInvBasis;
		mat3 clearcoatNormalBasis = surf.clearcoatBasis;
		mat3 clearcoatInvBasis = surf.clearcoatInvBasis;

		float diffuseWeight;
		float specularWeight;
		float transmissionWeight;
		float clearcoatWeight;
		// using normal and basically-reflected ray since we don't have proper half vector here
		getLobeWeights( wo, wo, vec3( 0, 0, 1 ), clearcoatWo, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight );

		float pdf[4];
		pdf[0] = diffuseWeight;
		pdf[1] = specularWeight;
		pdf[2] = transmissionWeight;
		pdf[3] = clearcoatWeight;

		float cdf[4];
		cdf[0] = pdf[0];
		cdf[1] = pdf[1] + cdf[0];
		cdf[2] = pdf[2] + cdf[1];
		cdf[3] = pdf[3] + cdf[2];

		if( cdf[3] != 0.0 ) {

			float invMaxCdf = 1.0 / cdf[3];
			cdf[0] *= invMaxCdf;
			cdf[1] *= invMaxCdf;
			cdf[2] *= invMaxCdf;
			cdf[3] *= invMaxCdf;

		} else {

			cdf[0] = 1.0;
			cdf[1] = 0.0;
			cdf[2] = 0.0;
			cdf[3] = 0.0;

		}

		vec3 wi;
		vec3 clearcoatWi;

		float r = rand( 15 );
		if ( r <= cdf[0] ) { // diffuse

			wi = diffuseDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[1] ) { // specular

			wi = specularDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[2] ) { // transmission / refraction

			wi = transmissionDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[3] ) { // clearcoat

			clearcoatWi = clearcoatDirection( clearcoatWo, surf );
			wi = normalize( invBasis * normalize( clearcoatNormalBasis * clearcoatWi ) );

		}

		ScatterRecord result;
		result.pdf = bsdfEval( wo, clearcoatWo, wi, clearcoatWi, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight, result.specularPdf, result.color );
		result.direction = normalize( surf.normalBasis * wi );

		return result;

	}

`;var dm=`

	// returns the hit distance given the material density
	float intersectFogVolume( Material material, float u ) {

		// https://raytracing.github.io/books/RayTracingTheNextWeek.html#volumes/constantdensitymediums
		return material.opacity == 0.0 ? INFINITY : ( - 1.0 / material.opacity ) * log( u );

	}

	ScatterRecord sampleFogVolume( SurfaceRecord surf, vec2 uv ) {

		ScatterRecord sampleRec;
		sampleRec.specularPdf = 0.0;
		sampleRec.pdf = 1.0 / ( 2.0 * PI );
		sampleRec.direction = sampleSphere( uv );
		sampleRec.color = surf.color;
		return sampleRec;

	}

`;var pm=`

	// The GGX functions provide sampling and distribution information for normals as output so
	// in order to get probability of scatter direction the half vector must be computed and provided.
	// [0] https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf
	// [1] https://hal.archives-ouvertes.fr/hal-01509746/document
	// [2] http://jcgt.org/published/0007/04/01/
	// [4] http://jcgt.org/published/0003/02/03/

	// trowbridge-reitz === GGX === GTR

	vec3 ggxDirection( vec3 incidentDir, vec2 roughness, vec2 uv ) {

		// TODO: try GGXVNDF implementation from reference [2], here. Needs to update ggxDistribution
		// function below, as well

		// Implementation from reference [1]
		// stretch view
		vec3 V = normalize( vec3( roughness * incidentDir.xy, incidentDir.z ) );

		// orthonormal basis
		vec3 T1 = ( V.z < 0.9999 ) ? normalize( cross( V, vec3( 0.0, 0.0, 1.0 ) ) ) : vec3( 1.0, 0.0, 0.0 );
		vec3 T2 = cross( T1, V );

		// sample point with polar coordinates (r, phi)
		float a = 1.0 / ( 1.0 + V.z );
		float r = sqrt( uv.x );
		float phi = ( uv.y < a ) ? uv.y / a * PI : PI + ( uv.y - a ) / ( 1.0 - a ) * PI;
		float P1 = r * cos( phi );
		float P2 = r * sin( phi ) * ( ( uv.y < a ) ? 1.0 : V.z );

		// compute normal
		vec3 N = P1 * T1 + P2 * T2 + V * sqrt( max( 0.0, 1.0 - P1 * P1 - P2 * P2 ) );

		// unstretch
		N = normalize( vec3( roughness * N.xy, max( 0.0, N.z ) ) );

		return N;

	}

	// Below are PDF and related functions for use in a Monte Carlo path tracer
	// as specified in Appendix B of the following paper
	// See equation (34) from reference [0]
	float ggxLamda( float theta, float roughness ) {

		float tanTheta = tan( theta );
		float tanTheta2 = tanTheta * tanTheta;
		float alpha2 = roughness * roughness;

		float numerator = - 1.0 + sqrt( 1.0 + alpha2 * tanTheta2 );
		return numerator / 2.0;

	}

	// See equation (34) from reference [0]
	float ggxShadowMaskG1( float theta, float roughness ) {

		return 1.0 / ( 1.0 + ggxLamda( theta, roughness ) );

	}

	// See equation (125) from reference [4]
	float ggxShadowMaskG2( vec3 wi, vec3 wo, float roughness ) {

		float incidentTheta = acos( wi.z );
		float scatterTheta = acos( wo.z );
		return 1.0 / ( 1.0 + ggxLamda( incidentTheta, roughness ) + ggxLamda( scatterTheta, roughness ) );

	}

	// See equation (33) from reference [0]
	float ggxDistribution( vec3 halfVector, float roughness ) {

		float a2 = roughness * roughness;
		a2 = max( EPSILON, a2 );
		float cosTheta = halfVector.z;
		float cosTheta4 = pow( cosTheta, 4.0 );

		if ( cosTheta == 0.0 ) return 0.0;

		float theta = acosSafe( halfVector.z );
		float tanTheta = tan( theta );
		float tanTheta2 = pow( tanTheta, 2.0 );

		float denom = PI * cosTheta4 * pow( a2 + tanTheta2, 2.0 );
		return ( a2 / denom );

	}

	// See equation (3) from reference [2]
	float ggxPDF( vec3 wi, vec3 halfVector, float roughness ) {

		float incidentTheta = acos( wi.z );
		float D = ggxDistribution( halfVector, roughness );
		float G1 = ggxShadowMaskG1( incidentTheta, roughness );

		return D * G1 * max( 0.0, dot( wi, halfVector ) ) / wi.z;

	}

`;var mm=`

	// XYZ to sRGB color space
	const mat3 XYZ_TO_REC709 = mat3(
		3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);

	vec3 fresnel0ToIor( vec3 fresnel0 ) {

		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );

	}

	// Conversion FO/IOR
	vec3 iorToFresnel0( vec3 transmittedIor, float incidentIor ) {

		return square( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );

	}

	// ior is a value between 1.0 and 3.0. 1.0 is air interface
	float iorToFresnel0( float transmittedIor, float incidentIor ) {

		return square( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ) );

	}

	// Fresnel equations for dielectric/dielectric interfaces. See https://belcour.github.io/blog/research/2017/05/01/brdf-thin-film.html
	vec3 evalSensitivity( float OPD, vec3 shift ) {

		float phase = 2.0 * PI * OPD * 1.0e-9;

		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );

		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - square( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * square( phase ) );
		xyz /= 1.0685e-7;

		vec3 srgb = XYZ_TO_REC709 * xyz;
		return srgb;

	}

	// See Section 4. Analytic Spectral Integration, A Practical Extension to Microfacet Theory for the Modeling of Varying Iridescence, https://hal.archives-ouvertes.fr/hal-01518344/document
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {

		vec3 I;

		// Force iridescenceIor -> outsideIOR when thinFilmThickness -> 0.0
		float iridescenceIor = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );

		// Evaluate the cosTheta on the base layer (Snell law)
		float sinTheta2Sq = square( outsideIOR / iridescenceIor ) * ( 1.0 - square( cosTheta1 ) );

		// Handle TIR:
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {

			return vec3( 1.0 );

		}

		float cosTheta2 = sqrt( cosTheta2Sq );

		// First interface
		float R0 = iorToFresnel0( iridescenceIor, outsideIOR );
		float R12 = schlickFresnel( cosTheta1, R0 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIor < outsideIOR ) {

			phi12 = PI;

		}

		float phi21 = PI - phi12;

		// Second interface
		vec3 baseIOR = fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) ); // guard against 1.0
		vec3 R1 = iorToFresnel0( baseIOR, iridescenceIor );
		vec3 R23 = schlickFresnel( cosTheta2, R1 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[0] < iridescenceIor ) {

			phi23[ 0 ] = PI;

		}

		if ( baseIOR[1] < iridescenceIor ) {

			phi23[ 1 ] = PI;

		}

		if ( baseIOR[2] < iridescenceIor ) {

			phi23[ 2 ] = PI;

		}

		// Phase shift
		float OPD = 2.0 * iridescenceIor * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;

		// Compound terms
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = square( T121 ) * R23 / ( vec3( 1.0 ) - R123 );

		// Reflectance term for m = 0 (DC term amplitude)
		vec3 C0 = R12 + Rs;
		I = C0;

		// Reflectance term for m > 0 (pairs of diracs)
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {

			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;

		}

		// Since out of gamut colors might be produced, negative color values are clamped to 0.
		return max( I, vec3( 0.0 ) );

	}

`;var gm=`

	// See equation (2) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetD( float cosThetaH, float roughness ) {

		float alpha = max( roughness, 0.07 );
		alpha = alpha * alpha;

		float invAlpha = 1.0 / alpha;

		float sqrCosThetaH = cosThetaH * cosThetaH;
		float sinThetaH = max( 1.0 - sqrCosThetaH, 0.001 );

		return ( 2.0 + invAlpha ) * pow( sinThetaH, 0.5 * invAlpha ) / ( 2.0 * PI );

	}

	float velvetParamsInterpolate( int i, float oneMinusAlphaSquared ) {

		const float p0[5] = float[5]( 25.3245, 3.32435, 0.16801, -1.27393, -4.85967 );
		const float p1[5] = float[5]( 21.5473, 3.82987, 0.19823, -1.97760, -4.32054 );

		return mix( p1[i], p0[i], oneMinusAlphaSquared );

	}

	float velvetL( float x, float alpha ) {

		float oneMinusAlpha = 1.0 - alpha;
		float oneMinusAlphaSquared = oneMinusAlpha * oneMinusAlpha;

		float a = velvetParamsInterpolate( 0, oneMinusAlphaSquared );
		float b = velvetParamsInterpolate( 1, oneMinusAlphaSquared );
		float c = velvetParamsInterpolate( 2, oneMinusAlphaSquared );
		float d = velvetParamsInterpolate( 3, oneMinusAlphaSquared );
		float e = velvetParamsInterpolate( 4, oneMinusAlphaSquared );

		return a / ( 1.0 + b * pow( abs( x ), c ) ) + d * x + e;

	}

	// See equation (3) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetLambda( float cosTheta, float alpha ) {

		return abs( cosTheta ) < 0.5 ? exp( velvetL( cosTheta, alpha ) ) : exp( 2.0 * velvetL( 0.5, alpha ) - velvetL( 1.0 - cosTheta, alpha ) );

	}

	// See Section 3, Shadowing Term, in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetG( float cosThetaO, float cosThetaI, float roughness ) {

		float alpha = max( roughness, 0.07 );
		alpha = alpha * alpha;

		return 1.0 / ( 1.0 + velvetLambda( cosThetaO, alpha ) + velvetLambda( cosThetaI, alpha ) );

	}

	float directionalAlbedoSheen( float cosTheta, float alpha ) {

		cosTheta = saturate( cosTheta );

		float c = 1.0 - cosTheta;
		float c3 = c * c * c;

		return 0.65584461 * c3 + 1.0 / ( 4.16526551 + exp( -7.97291361 * sqrt( alpha ) + 6.33516894 ) );

	}

	float sheenAlbedoScaling( vec3 wo, vec3 wi, SurfaceRecord surf ) {

		float alpha = max( surf.sheenRoughness, 0.07 );
		alpha = alpha * alpha;

		float maxSheenColor = max( max( surf.sheenColor.r, surf.sheenColor.g ), surf.sheenColor.b );

		float eWo = directionalAlbedoSheen( saturateCos( wo.z ), alpha );
		float eWi = directionalAlbedoSheen( saturateCos( wi.z ), alpha );

		return min( 1.0 - maxSheenColor * eWo, 1.0 - maxSheenColor * eWi );

	}

	// See Section 5, Layering, in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float sheenAlbedoScaling( vec3 wo, SurfaceRecord surf ) {

		float alpha = max( surf.sheenRoughness, 0.07 );
		alpha = alpha * alpha;

		float maxSheenColor = max( max( surf.sheenColor.r, surf.sheenColor.g ), surf.sheenColor.b );

		float eWo = directionalAlbedoSheen( saturateCos( wo.z ), alpha );

		return 1.0 - maxSheenColor * eWo;

	}

`;var xm=`

#ifndef FOG_CHECK_ITERATIONS
#define FOG_CHECK_ITERATIONS 30
#endif

// returns whether the given material is a fog material or not
bool isMaterialFogVolume( sampler2D materials, uint materialIndex ) {

	uint i = materialIndex * uint( MATERIAL_PIXELS );
	vec4 s14 = texelFetch1D( materials, i + 14u );
	return bool( int( s14.b ) & 4 );

}

// returns true if we're within the first fog volume we hit
bool bvhIntersectFogVolumeHit(
	vec3 rayOrigin, vec3 rayDirection,
	usampler2D materialIndexAttribute, sampler2D materials,
	inout Material material
) {

	material.fogVolume = false;

	for ( int i = 0; i < FOG_CHECK_ITERATIONS; i ++ ) {

		// find nearest hit
		uvec4 faceIndices = uvec4( 0u );
		vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
		vec3 barycoord = vec3( 0.0 );
		float side = 1.0;
		float dist = 0.0;
		bool hit = bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
		if ( hit ) {

			// if it's a fog volume return whether we hit the front or back face
			uint materialIndex = uTexelFetch1D( materialIndexAttribute, faceIndices.x ).r;
			if ( isMaterialFogVolume( materials, materialIndex ) ) {

				material = readMaterialInfo( materials, materialIndex );
				return side == - 1.0;

			} else {

				// move the ray forward
				rayOrigin = stepRayOrigin( rayOrigin, rayDirection, - faceNormal, dist );

			}

		} else {

			return false;

		}

	}

	return false;

}

`;var vm=`

	// step through multiple surface hits and accumulate color attenuation based on transmissive surfaces
	// returns true if a solid surface was hit
	bool attenuateHit(
		RenderState state,
		Ray ray, float rayDist,
		out vec3 color
	) {

		// store the original bounce index so we can reset it after
		uint originalBounceIndex = sobolBounceIndex;

		int traversals = state.traversals;
		int transmissiveTraversals = state.transmissiveTraversals;
		bool isShadowRay = state.isShadowRay;
		Material fogMaterial = state.fogMaterial;

		vec3 startPoint = ray.origin;

		// hit results
		SurfaceHit surfaceHit;

		color = vec3( 1.0 );

		bool result = true;
		for ( int i = 0; i < traversals; i ++ ) {

			sobolBounceIndex ++;

			int hitType = traceScene( ray, fogMaterial, surfaceHit );

			if ( hitType == FOG_HIT ) {

				result = true;
				break;

			} else if ( hitType == SURFACE_HIT ) {

				float totalDist = distance( startPoint, ray.origin + ray.direction * surfaceHit.dist );
				if ( totalDist > rayDist ) {

					result = false;
					break;

				}

				// TODO: attenuate the contribution based on the PDF of the resulting ray including refraction values
				// Should be able to work using the material BSDF functions which will take into account specularity, etc.
				// TODO: should we account for emissive surfaces here?

				uint materialIndex = uTexelFetch1D( materialIndexAttribute, surfaceHit.faceIndices.x ).r;
				Material material = readMaterialInfo( materials, materialIndex );

				// adjust the ray to the new surface
				bool isEntering = surfaceHit.side == 1.0;
				ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );

				#if FEATURE_FOG

				if ( material.fogVolume ) {

					fogMaterial = material;
					fogMaterial.fogVolume = surfaceHit.side == 1.0;
					i -= sign( transmissiveTraversals );
					transmissiveTraversals --;
					continue;

				}

				#endif

				if ( ! material.castShadow && isShadowRay ) {

					continue;

				}

				vec2 uv = textureSampleBarycoord( attributesArray, ATTR_UV, surfaceHit.barycoord, surfaceHit.faceIndices.xyz ).xy;
				vec4 vertexColor = textureSampleBarycoord( attributesArray, ATTR_COLOR, surfaceHit.barycoord, surfaceHit.faceIndices.xyz );

				// albedo
				vec4 albedo = vec4( material.color, material.opacity );
				if ( material.map != - 1 ) {

					vec3 uvPrime = material.mapTransform * vec3( uv, 1 );
					albedo *= texture2D( textures, vec3( uvPrime.xy, material.map ) );

				}

				if ( material.vertexColors ) {

					albedo *= vertexColor;

				}

				// alphaMap
				if ( material.alphaMap != - 1 ) {

					vec3 uvPrime = material.alphaMapTransform * vec3( uv, 1 );
					albedo.a *= texture2D( textures, vec3( uvPrime.xy, material.alphaMap ) ).x;

				}

				// transmission
				float transmission = material.transmission;
				if ( material.transmissionMap != - 1 ) {

					vec3 uvPrime = material.transmissionMapTransform * vec3( uv, 1 );
					transmission *= texture2D( textures, vec3( uvPrime.xy, material.transmissionMap ) ).r;

				}

				// metalness
				float metalness = material.metalness;
				if ( material.metalnessMap != - 1 ) {

					vec3 uvPrime = material.metalnessMapTransform * vec3( uv, 1 );
					metalness *= texture2D( textures, vec3( uvPrime.xy, material.metalnessMap ) ).b;

				}

				float alphaTest = material.alphaTest;
				bool useAlphaTest = alphaTest != 0.0;
				float transmissionFactor = ( 1.0 - metalness ) * transmission;
				if (
					transmissionFactor < rand( 9 ) && ! (
						// material sidedness
						material.side != 0.0 && surfaceHit.side == material.side

						// alpha test
						|| useAlphaTest && albedo.a < alphaTest

						// opacity
						|| material.transparent && ! useAlphaTest && albedo.a < rand( 10 )
					)
				) {

					result = true;
					break;

				}

				if ( surfaceHit.side == 1.0 && isEntering ) {

					// only attenuate by surface color on the way in
					color *= mix( vec3( 1.0 ), albedo.rgb, transmissionFactor );

				} else if ( surfaceHit.side == - 1.0 ) {

					// attenuate by medium once we hit the opposite side of the model
					color *= transmissionAttenuation( surfaceHit.dist, material.attenuationColor, material.attenuationDistance );

				}

				bool isTransmissiveRay = dot( ray.direction, surfaceHit.faceNormal * surfaceHit.side ) < 0.0;
				if ( ( isTransmissiveRay || isEntering ) && transmissiveTraversals > 0 ) {

					i -= sign( transmissiveTraversals );
					transmissiveTraversals --;

				}

			} else {

				result = false;
				break;

			}

		}

		// reset the bounce index
		sobolBounceIndex = originalBounceIndex;
		return result;

	}

`;var _m=`

	vec3 ndcToRayOrigin( vec2 coord ) {

		vec4 rayOrigin4 = cameraWorldMatrix * invProjectionMatrix * vec4( coord, - 1.0, 1.0 );
		return rayOrigin4.xyz / rayOrigin4.w;
	}

	Ray getCameraRay() {

		vec2 ssd = vec2( 1.0 ) / resolution;

		// Jitter the camera ray by finding a uv coordinate at a random sample
		// around this pixel's UV coordinate for AA
		vec2 ruv = rand2( 0 );
		vec2 jitteredUv = vUv + vec2( tentFilter( ruv.x ) * ssd.x, tentFilter( ruv.y ) * ssd.y );
		Ray ray;

		#if CAMERA_TYPE == 2

			// Equirectangular projection
			vec4 rayDirection4 = vec4( equirectUvToDirection( jitteredUv ), 0.0 );
			vec4 rayOrigin4 = vec4( 0.0, 0.0, 0.0, 1.0 );

			rayDirection4 = cameraWorldMatrix * rayDirection4;
			rayOrigin4 = cameraWorldMatrix * rayOrigin4;

			ray.direction = normalize( rayDirection4.xyz );
			ray.origin = rayOrigin4.xyz / rayOrigin4.w;

		#else

			// get [- 1, 1] normalized device coordinates
			vec2 ndc = 2.0 * jitteredUv - vec2( 1.0 );
			ray.origin = ndcToRayOrigin( ndc );

			#if CAMERA_TYPE == 1

				// Orthographic projection
				ray.direction = ( cameraWorldMatrix * vec4( 0.0, 0.0, - 1.0, 0.0 ) ).xyz;
				ray.direction = normalize( ray.direction );

			#else

				// Perspective projection
				ray.direction = normalize( mat3( cameraWorldMatrix ) * ( invProjectionMatrix * vec4( ndc, 0.0, 1.0 ) ).xyz );

			#endif

		#endif

		#if FEATURE_DOF
		{

			// depth of field
			vec3 focalPoint = ray.origin + normalize( ray.direction ) * physicalCamera.focusDistance;

			// get the aperture sample
			// if blades === 0 then we assume a circle
			vec3 shapeUVW= rand3( 1 );
			int blades = physicalCamera.apertureBlades;
			float anamorphicRatio = physicalCamera.anamorphicRatio;
			vec2 apertureSample = sampleAperture( blades, shapeUVW );
			apertureSample *= physicalCamera.bokehSize * 0.5 * 1e-3;

			// rotate the aperture shape
			apertureSample =
				rotateVector( apertureSample, physicalCamera.apertureRotation ) *
				saturate( vec2( anamorphicRatio, 1.0 / anamorphicRatio ) );

			// create the new ray
			ray.origin += ( cameraWorldMatrix * vec4( apertureSample, 0.0, 0.0 ) ).xyz;
			ray.direction = focalPoint - ray.origin;

		}
		#endif

		ray.direction = normalize( ray.direction );

		return ray;

	}

`;var ym=`

	vec3 directLightContribution( vec3 worldWo, SurfaceRecord surf, RenderState state, vec3 rayOrigin ) {

		vec3 result = vec3( 0.0 );

		// uniformly pick a light or environment map
		if( lightsDenom != 0.0 && rand( 5 ) < float( lights.count ) / lightsDenom ) {

			// sample a light or environment
			LightRecord lightRec = randomLightSample( lights.tex, iesProfiles, lights.count, rayOrigin, rand3( 6 ) );

			bool isSampleBelowSurface = ! surf.volumeParticle && dot( surf.faceNormal, lightRec.direction ) < 0.0;
			if ( isSampleBelowSurface ) {

				lightRec.pdf = 0.0;

			}

			// check if a ray could even reach the light area
			Ray lightRay;
			lightRay.origin = rayOrigin;
			lightRay.direction = lightRec.direction;
			vec3 attenuatedColor;
			if (
				lightRec.pdf > 0.0 &&
				isDirectionValid( lightRec.direction, surf.normal, surf.faceNormal ) &&
				! attenuateHit( state, lightRay, lightRec.dist, attenuatedColor )
			) {

				// get the material pdf
				vec3 sampleColor;
				float lightMaterialPdf = bsdfResult( worldWo, lightRec.direction, surf, sampleColor );
				bool isValidSampleColor = all( greaterThanEqual( sampleColor, vec3( 0.0 ) ) );
				if ( lightMaterialPdf > 0.0 && isValidSampleColor ) {

					// weight the direct light contribution
					float lightPdf = lightRec.pdf / lightsDenom;
					float misWeight = lightRec.type == SPOT_LIGHT_TYPE || lightRec.type == DIR_LIGHT_TYPE || lightRec.type == POINT_LIGHT_TYPE ? 1.0 : misHeuristic( lightPdf, lightMaterialPdf );
					result = attenuatedColor * lightRec.emission * state.throughputColor * sampleColor * misWeight / lightPdf;

				}

			}

		} else if ( envMapInfo.totalSum != 0.0 && environmentIntensity != 0.0 ) {

			// find a sample in the environment map to include in the contribution
			vec3 envColor, envDirection;
			float envPdf = sampleEquirectProbability( rand2( 7 ), envColor, envDirection );
			envDirection = invEnvRotation3x3 * envDirection;

			// this env sampling is not set up for transmissive sampling and yields overly bright
			// results so we ignore the sample in this case.
			// TODO: this should be improved but how? The env samples could traverse a few layers?
			bool isSampleBelowSurface = ! surf.volumeParticle && dot( surf.faceNormal, envDirection ) < 0.0;
			if ( isSampleBelowSurface ) {

				envPdf = 0.0;

			}

			// check if a ray could even reach the surface
			Ray envRay;
			envRay.origin = rayOrigin;
			envRay.direction = envDirection;
			vec3 attenuatedColor;
			if (
				envPdf > 0.0 &&
				isDirectionValid( envDirection, surf.normal, surf.faceNormal ) &&
				! attenuateHit( state, envRay, INFINITY, attenuatedColor )
			) {

				// get the material pdf
				vec3 sampleColor;
				float envMaterialPdf = bsdfResult( worldWo, envDirection, surf, sampleColor );
				bool isValidSampleColor = all( greaterThanEqual( sampleColor, vec3( 0.0 ) ) );
				if ( envMaterialPdf > 0.0 && isValidSampleColor ) {

					// weight the direct light contribution
					envPdf /= lightsDenom;
					float misWeight = misHeuristic( envPdf, envMaterialPdf );
					result = attenuatedColor * environmentIntensity * envColor * state.throughputColor * sampleColor * misWeight / envPdf;

				}

			}

		}

		// Function changed to have a single return statement to potentially help with crashes on Mac OS.
		// See issue #470
		return result;

	}

`;var Sm=`

	#define SKIP_SURFACE 0
	#define HIT_SURFACE 1
	int getSurfaceRecord(
		Material material, SurfaceHit surfaceHit, sampler2DArray attributesArray,
		float accumulatedRoughness,
		inout SurfaceRecord surf
	) {

		if ( material.fogVolume ) {

			vec3 normal = vec3( 0, 0, 1 );

			SurfaceRecord fogSurface;
			fogSurface.volumeParticle = true;
			fogSurface.color = material.color;
			fogSurface.emission = material.emissiveIntensity * material.emissive;
			fogSurface.normal = normal;
			fogSurface.faceNormal = normal;
			fogSurface.clearcoatNormal = normal;

			surf = fogSurface;
			return HIT_SURFACE;

		}

		// uv coord for textures
		vec2 uv = textureSampleBarycoord( attributesArray, ATTR_UV, surfaceHit.barycoord, surfaceHit.faceIndices.xyz ).xy;
		vec4 vertexColor = textureSampleBarycoord( attributesArray, ATTR_COLOR, surfaceHit.barycoord, surfaceHit.faceIndices.xyz );

		// albedo
		vec4 albedo = vec4( material.color, material.opacity );
		if ( material.map != - 1 ) {

			vec3 uvPrime = material.mapTransform * vec3( uv, 1 );
			albedo *= texture2D( textures, vec3( uvPrime.xy, material.map ) );

		}

		if ( material.vertexColors ) {

			albedo *= vertexColor;

		}

		// alphaMap
		if ( material.alphaMap != - 1 ) {

			vec3 uvPrime = material.alphaMapTransform * vec3( uv, 1 );
			albedo.a *= texture2D( textures, vec3( uvPrime.xy, material.alphaMap ) ).x;

		}

		// possibly skip this sample if it's transparent, alpha test is enabled, or we hit the wrong material side
		// and it's single sided.
		// - alpha test is disabled when it === 0
		// - the material sidedness test is complicated because we want light to pass through the back side but still
		// be able to see the front side. This boolean checks if the side we hit is the front side on the first ray
		// and we're rendering the other then we skip it. Do the opposite on subsequent bounces to get incoming light.
		float alphaTest = material.alphaTest;
		bool useAlphaTest = alphaTest != 0.0;
		if (
			// material sidedness
			material.side != 0.0 && surfaceHit.side != material.side

			// alpha test
			|| useAlphaTest && albedo.a < alphaTest

			// opacity
			|| material.transparent && ! useAlphaTest && albedo.a < rand( 3 )
		) {

			return SKIP_SURFACE;

		}

		// fetch the interpolated smooth normal
		vec3 normal = normalize( textureSampleBarycoord(
			attributesArray,
			ATTR_NORMAL,
			surfaceHit.barycoord,
			surfaceHit.faceIndices.xyz
		).xyz );

		// roughness
		float roughness = material.roughness;
		if ( material.roughnessMap != - 1 ) {

			vec3 uvPrime = material.roughnessMapTransform * vec3( uv, 1 );
			roughness *= texture2D( textures, vec3( uvPrime.xy, material.roughnessMap ) ).g;

		}

		// metalness
		float metalness = material.metalness;
		if ( material.metalnessMap != - 1 ) {

			vec3 uvPrime = material.metalnessMapTransform * vec3( uv, 1 );
			metalness *= texture2D( textures, vec3( uvPrime.xy, material.metalnessMap ) ).b;

		}

		// emission
		vec3 emission = material.emissiveIntensity * material.emissive;
		if ( material.emissiveMap != - 1 ) {

			vec3 uvPrime = material.emissiveMapTransform * vec3( uv, 1 );
			emission *= texture2D( textures, vec3( uvPrime.xy, material.emissiveMap ) ).xyz;

		}

		// transmission
		float transmission = material.transmission;
		if ( material.transmissionMap != - 1 ) {

			vec3 uvPrime = material.transmissionMapTransform * vec3( uv, 1 );
			transmission *= texture2D( textures, vec3( uvPrime.xy, material.transmissionMap ) ).r;

		}

		// normal
		if ( material.flatShading ) {

			// if we're rendering a flat shaded object then use the face normals - the face normal
			// is provided based on the side the ray hits the mesh so flip it to align with the
			// interpolated vertex normals.
			normal = surfaceHit.faceNormal * surfaceHit.side;

		}

		vec3 baseNormal = normal;
		if ( material.normalMap != - 1 ) {

			vec4 tangentSample = textureSampleBarycoord(
				attributesArray,
				ATTR_TANGENT,
				surfaceHit.barycoord,
				surfaceHit.faceIndices.xyz
			);

			// some provided tangents can be malformed (0, 0, 0) causing the normal to be degenerate
			// resulting in NaNs and slow path tracing.
			if ( length( tangentSample.xyz ) > 0.0 ) {

				vec3 tangent = normalize( tangentSample.xyz );
				vec3 bitangent = normalize( cross( normal, tangent ) * tangentSample.w );
				mat3 vTBN = mat3( tangent, bitangent, normal );

				vec3 uvPrime = material.normalMapTransform * vec3( uv, 1 );
				vec3 texNormal = texture2D( textures, vec3( uvPrime.xy, material.normalMap ) ).xyz * 2.0 - 1.0;
				texNormal.xy *= material.normalScale;
				normal = vTBN * texNormal;

			}

		}

		normal *= surfaceHit.side;

		// clearcoat
		float clearcoat = material.clearcoat;
		if ( material.clearcoatMap != - 1 ) {

			vec3 uvPrime = material.clearcoatMapTransform * vec3( uv, 1 );
			clearcoat *= texture2D( textures, vec3( uvPrime.xy, material.clearcoatMap ) ).r;

		}

		// clearcoatRoughness
		float clearcoatRoughness = material.clearcoatRoughness;
		if ( material.clearcoatRoughnessMap != - 1 ) {

			vec3 uvPrime = material.clearcoatRoughnessMapTransform * vec3( uv, 1 );
			clearcoatRoughness *= texture2D( textures, vec3( uvPrime.xy, material.clearcoatRoughnessMap ) ).g;

		}

		// clearcoatNormal
		vec3 clearcoatNormal = baseNormal;
		if ( material.clearcoatNormalMap != - 1 ) {

			vec4 tangentSample = textureSampleBarycoord(
				attributesArray,
				ATTR_TANGENT,
				surfaceHit.barycoord,
				surfaceHit.faceIndices.xyz
			);

			// some provided tangents can be malformed (0, 0, 0) causing the normal to be degenerate
			// resulting in NaNs and slow path tracing.
			if ( length( tangentSample.xyz ) > 0.0 ) {

				vec3 tangent = normalize( tangentSample.xyz );
				vec3 bitangent = normalize( cross( clearcoatNormal, tangent ) * tangentSample.w );
				mat3 vTBN = mat3( tangent, bitangent, clearcoatNormal );

				vec3 uvPrime = material.clearcoatNormalMapTransform * vec3( uv, 1 );
				vec3 texNormal = texture2D( textures, vec3( uvPrime.xy, material.clearcoatNormalMap ) ).xyz * 2.0 - 1.0;
				texNormal.xy *= material.clearcoatNormalScale;
				clearcoatNormal = vTBN * texNormal;

			}

		}

		clearcoatNormal *= surfaceHit.side;

		// sheenColor
		vec3 sheenColor = material.sheenColor;
		if ( material.sheenColorMap != - 1 ) {

			vec3 uvPrime = material.sheenColorMapTransform * vec3( uv, 1 );
			sheenColor *= texture2D( textures, vec3( uvPrime.xy, material.sheenColorMap ) ).rgb;

		}

		// sheenRoughness
		float sheenRoughness = material.sheenRoughness;
		if ( material.sheenRoughnessMap != - 1 ) {

			vec3 uvPrime = material.sheenRoughnessMapTransform * vec3( uv, 1 );
			sheenRoughness *= texture2D( textures, vec3( uvPrime.xy, material.sheenRoughnessMap ) ).a;

		}

		// iridescence
		float iridescence = material.iridescence;
		if ( material.iridescenceMap != - 1 ) {

			vec3 uvPrime = material.iridescenceMapTransform * vec3( uv, 1 );
			iridescence *= texture2D( textures, vec3( uvPrime.xy, material.iridescenceMap ) ).r;

		}

		// iridescence thickness
		float iridescenceThickness = material.iridescenceThicknessMaximum;
		if ( material.iridescenceThicknessMap != - 1 ) {

			vec3 uvPrime = material.iridescenceThicknessMapTransform * vec3( uv, 1 );
			float iridescenceThicknessSampled = texture2D( textures, vec3( uvPrime.xy, material.iridescenceThicknessMap ) ).g;
			iridescenceThickness = mix( material.iridescenceThicknessMinimum, material.iridescenceThicknessMaximum, iridescenceThicknessSampled );

		}

		iridescence = iridescenceThickness == 0.0 ? 0.0 : iridescence;

		// specular color
		vec3 specularColor = material.specularColor;
		if ( material.specularColorMap != - 1 ) {

			vec3 uvPrime = material.specularColorMapTransform * vec3( uv, 1 );
			specularColor *= texture2D( textures, vec3( uvPrime.xy, material.specularColorMap ) ).rgb;

		}

		// specular intensity
		float specularIntensity = material.specularIntensity;
		if ( material.specularIntensityMap != - 1 ) {

			vec3 uvPrime = material.specularIntensityMapTransform * vec3( uv, 1 );
			specularIntensity *= texture2D( textures, vec3( uvPrime.xy, material.specularIntensityMap ) ).a;

		}

		surf.volumeParticle = false;

		surf.faceNormal = surfaceHit.faceNormal;
		surf.normal = normal;

		surf.metalness = metalness;
		surf.color = albedo.rgb;
		surf.emission = emission;

		surf.ior = material.ior;
		surf.transmission = transmission;
		surf.thinFilm = material.thinFilm;
		surf.attenuationColor = material.attenuationColor;
		surf.attenuationDistance = material.attenuationDistance;

		surf.clearcoatNormal = clearcoatNormal;
		surf.clearcoat = clearcoat;

		surf.sheen = material.sheen;
		surf.sheenColor = sheenColor;

		surf.iridescence = iridescence;
		surf.iridescenceIor = material.iridescenceIor;
		surf.iridescenceThickness = iridescenceThickness;

		surf.specularColor = specularColor;
		surf.specularIntensity = specularIntensity;

		// apply perceptual roughness factor from gltf. sheen perceptual roughness is
		// applied by its brdf function
		// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#microfacet-surfaces
		surf.roughness = roughness * roughness;
		surf.clearcoatRoughness = clearcoatRoughness * clearcoatRoughness;
		surf.sheenRoughness = sheenRoughness;

		// frontFace is used to determine transmissive properties and PDF. If no transmission is used
		// then we can just always assume this is a front face.
		surf.frontFace = surfaceHit.side == 1.0 || transmission == 0.0;
		surf.eta = material.thinFilm || surf.frontFace ? 1.0 / material.ior : material.ior;
		surf.f0 = iorRatioToF0( surf.eta );

		// Compute the filtered roughness value to use during specular reflection computations.
		// The accumulated roughness value is scaled by a user setting and a "magic value" of 5.0.
		// If we're exiting something transmissive then scale the factor down significantly so we can retain
		// sharp internal reflections
		surf.filteredRoughness = applyFilteredGlossy( surf.roughness, accumulatedRoughness );
		surf.filteredClearcoatRoughness = applyFilteredGlossy( surf.clearcoatRoughness, accumulatedRoughness );

		// get the normal frames
		surf.normalBasis = getBasisFromNormal( surf.normal );
		surf.normalInvBasis = inverse( surf.normalBasis );

		surf.clearcoatBasis = getBasisFromNormal( surf.clearcoatNormal );
		surf.clearcoatInvBasis = inverse( surf.clearcoatBasis );

		return HIT_SURFACE;

	}
`;var bm=`

	struct Ray {

		vec3 origin;
		vec3 direction;

	};

	struct SurfaceHit {

		uvec4 faceIndices;
		vec3 barycoord;
		vec3 faceNormal;
		float side;
		float dist;

	};

	struct RenderState {

		bool firstRay;
		bool transmissiveRay;
		bool isShadowRay;
		float accumulatedRoughness;
		int transmissiveTraversals;
		int traversals;
		uint depth;
		vec3 throughputColor;
		Material fogMaterial;

	};

	RenderState initRenderState() {

		RenderState result;
		result.firstRay = true;
		result.transmissiveRay = true;
		result.isShadowRay = false;
		result.accumulatedRoughness = 0.0;
		result.transmissiveTraversals = 0;
		result.traversals = 0;
		result.throughputColor = vec3( 1.0 );
		result.depth = 0u;
		result.fogMaterial.fogVolume = false;
		return result;

	}

`;var Mm=`

	#define NO_HIT 0
	#define SURFACE_HIT 1
	#define LIGHT_HIT 2
	#define FOG_HIT 3

	// Passing the global variable 'lights' into this function caused shader program errors.
	// So global variables like 'lights' and 'bvh' were moved out of the function parameters.
	// For more information, refer to: https://github.com/gkjohnson/three-gpu-pathtracer/pull/457
	int traceScene(
		Ray ray, Material fogMaterial, inout SurfaceHit surfaceHit
	) {

		int result = NO_HIT;
		bool hit = bvhIntersectFirstHit( bvh, ray.origin, ray.direction, surfaceHit.faceIndices, surfaceHit.faceNormal, surfaceHit.barycoord, surfaceHit.side, surfaceHit.dist );

		#if FEATURE_FOG

		if ( fogMaterial.fogVolume ) {

			// offset the distance so we don't run into issues with particles on the same surface
			// as other objects
			float particleDist = intersectFogVolume( fogMaterial, rand( 1 ) );
			if ( particleDist + RAY_OFFSET < surfaceHit.dist ) {

				surfaceHit.side = 1.0;
				surfaceHit.faceNormal = normalize( - ray.direction );
				surfaceHit.dist = particleDist;
				return FOG_HIT;

			}

		}

		#endif

		if ( hit ) {

			result = SURFACE_HIT;

		}

		return result;

	}

`;var Bc=class extends $i{onBeforeRender(){this.setDefine("FEATURE_DOF",this.physicalCamera.bokehSize===0?0:1),this.setDefine("FEATURE_BACKGROUND_MAP",this.backgroundMap?1:0),this.setDefine("FEATURE_FOG",this.materials.features.isUsed("FOG")?1:0)}constructor(e){super({transparent:!0,depthWrite:!1,defines:{FEATURE_MIS:1,FEATURE_RUSSIAN_ROULETTE:1,FEATURE_DOF:1,FEATURE_BACKGROUND_MAP:0,FEATURE_FOG:1,RANDOM_TYPE:2,CAMERA_TYPE:0,DEBUG_MODE:0,ATTR_NORMAL:0,ATTR_TANGENT:1,ATTR_UV:2,ATTR_COLOR:3,MATERIAL_PIXELS:Ic},uniforms:{resolution:{value:new Be},opacity:{value:1},bounces:{value:10},transmissiveBounces:{value:10},filterGlossyFactor:{value:0},physicalCamera:{value:new bc},cameraWorldMatrix:{value:new Ze},invProjectionMatrix:{value:new Ze},bvh:{value:new lc},attributesArray:{value:new Ec},materialIndexAttribute:{value:new xs},materials:{value:new Cc},textures:{value:new Do().texture},lights:{value:new wc},iesProfiles:{value:new Do(360,180,{type:ct,wrapS:Dt,wrapT:Dt}).texture},environmentIntensity:{value:1},environmentRotation:{value:new Ze},envMapInfo:{value:new Tc},backgroundBlur:{value:0},backgroundMap:{value:null},backgroundAlpha:{value:1},backgroundIntensity:{value:1},backgroundRotation:{value:new Ze},seed:{value:0},sobolTexture:{value:null},stratifiedTexture:{value:new Lc},stratifiedOffsetTexture:{value:new Nc(64,1)}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vec4 mvPosition = vec4( position, 1.0 );
					mvPosition = modelViewMatrix * mvPosition;
					gl_Position = projectionMatrix * mvPosition;

					vUv = uv;

				}

			`,fragmentShader:`
				#define RAY_OFFSET 1e-4
				#define INFINITY 1e20

				precision highp isampler2D;
				precision highp usampler2D;
				precision highp sampler2DArray;
				vec4 envMapTexelToLinear( vec4 a ) { return a; }
				#include <common>

				// bvh intersection
				${mr.common_functions}
				${mr.bvh_struct_definitions}
				${mr.bvh_ray_functions}

				// uniform structs
				${jp}
				${tm}
				${em}
				${nm}
				${im}

				// random
				#if RANDOM_TYPE == 2 	// Stratified List

					${hm}

				#elif RANDOM_TYPE == 1 	// Sobol

					${Zh}
					${yc}
					${Vp}

					#define rand(v) sobol(v)
					#define rand2(v) sobol2(v)
					#define rand3(v) sobol3(v)
					#define rand4(v) sobol4(v)

				#else 					// PCG

				${Zh}

					// Using the sobol functions seems to break the the compiler on MacOS
					// - specifically the "sobolReverseBits" function.
					uint sobolPixelIndex = 0u;
					uint sobolPathIndex = 0u;
					uint sobolBounceIndex = 0u;

					#define rand(v) pcgRand()
					#define rand2(v) pcgRand2()
					#define rand3(v) pcgRand3()
					#define rand4(v) pcgRand4()

				#endif

				// common
				${um}
				${am}
				${Uc}
				${lm}
				${cm}

				// environment
				uniform EquirectHdrInfo envMapInfo;
				uniform mat4 environmentRotation;
				uniform float environmentIntensity;

				// lighting
				uniform sampler2DArray iesProfiles;
				uniform LightsInfo lights;

				// background
				uniform float backgroundBlur;
				uniform float backgroundAlpha;
				#if FEATURE_BACKGROUND_MAP

				uniform sampler2D backgroundMap;
				uniform mat4 backgroundRotation;
				uniform float backgroundIntensity;

				#endif

				// camera
				uniform mat4 cameraWorldMatrix;
				uniform mat4 invProjectionMatrix;
				#if FEATURE_DOF

				uniform PhysicalCamera physicalCamera;

				#endif

				// geometry
				uniform sampler2DArray attributesArray;
				uniform usampler2D materialIndexAttribute;
				uniform sampler2D materials;
				uniform sampler2DArray textures;
				uniform BVH bvh;

				// path tracer
				uniform int bounces;
				uniform int transmissiveBounces;
				uniform float filterGlossyFactor;
				uniform int seed;

				// image
				uniform vec2 resolution;
				uniform float opacity;

				varying vec2 vUv;

				// globals
				mat3 envRotation3x3;
				mat3 invEnvRotation3x3;
				float lightsDenom;

				// sampling
				${om}
				${rm}
				${sm}

				${xm}
				${pm}
				${gm}
				${mm}
				${dm}
				${fm}

				float applyFilteredGlossy( float roughness, float accumulatedRoughness ) {

					return clamp(
						max(
							roughness,
							accumulatedRoughness * filterGlossyFactor * 5.0 ),
						0.0,
						1.0
					);

				}

				vec3 sampleBackground( vec3 direction, vec2 uv ) {

					vec3 sampleDir = sampleHemisphere( direction, uv ) * 0.5 * backgroundBlur;

					#if FEATURE_BACKGROUND_MAP

					sampleDir = normalize( mat3( backgroundRotation ) * direction + sampleDir );
					return backgroundIntensity * sampleEquirectColor( backgroundMap, sampleDir );

					#else

					sampleDir = normalize( envRotation3x3 * direction + sampleDir );
					return environmentIntensity * sampleEquirectColor( envMapInfo.map, sampleDir );

					#endif

				}

				${bm}
				${_m}
				${Mm}
				${vm}
				${ym}
				${Sm}

				void main() {

					// init
					rng_initialize( gl_FragCoord.xy, seed );
					sobolPixelIndex = ( uint( gl_FragCoord.x ) << 16 ) | uint( gl_FragCoord.y );
					sobolPathIndex = uint( seed );

					// get camera ray
					Ray ray = getCameraRay();

					// inverse environment rotation
					envRotation3x3 = mat3( environmentRotation );
					invEnvRotation3x3 = inverse( envRotation3x3 );
					lightsDenom =
						( environmentIntensity == 0.0 || envMapInfo.totalSum == 0.0 ) && lights.count != 0u ?
							float( lights.count ) :
							float( lights.count + 1u );

					// final color
					gl_FragColor = vec4( 0, 0, 0, 1 );

					// surface results
					SurfaceHit surfaceHit;
					ScatterRecord scatterRec;

					// path tracing state
					RenderState state = initRenderState();
					state.transmissiveTraversals = transmissiveBounces;
					#if FEATURE_FOG

					state.fogMaterial.fogVolume = bvhIntersectFogVolumeHit(
						ray.origin, - ray.direction,
						materialIndexAttribute, materials,
						state.fogMaterial
					);

					#endif

					for ( int i = 0; i < bounces; i ++ ) {

						sobolBounceIndex ++;

						state.depth ++;
						state.traversals = bounces - i;
						state.firstRay = i == 0 && state.transmissiveTraversals == transmissiveBounces;

						int hitType = traceScene( ray, state.fogMaterial, surfaceHit );

						// check if we intersect any lights and accumulate the light contribution
						// TODO: we can add support for light surface rendering in the else condition if we
						// add the ability to toggle visibility of the the light
						if ( ! state.firstRay && ! state.transmissiveRay ) {

							LightRecord lightRec;
							float lightDist = hitType == NO_HIT ? INFINITY : surfaceHit.dist;
							for ( uint i = 0u; i < lights.count; i ++ ) {

								if (
									intersectLightAtIndex( lights.tex, ray.origin, ray.direction, i, lightRec ) &&
									lightRec.dist < lightDist
								) {

									#if FEATURE_MIS

									// weight the contribution
									// NOTE: Only area lights are supported for forward sampling and can be hit
									float misWeight = misHeuristic( scatterRec.pdf, lightRec.pdf / lightsDenom );
									gl_FragColor.rgb += lightRec.emission * state.throughputColor * misWeight;

									#else

									gl_FragColor.rgb += lightRec.emission * state.throughputColor;

									#endif

								}

							}

						}

						if ( hitType == NO_HIT ) {

							if ( state.firstRay || state.transmissiveRay ) {

								gl_FragColor.rgb += sampleBackground( ray.direction, rand2( 2 ) ) * state.throughputColor;
								gl_FragColor.a = backgroundAlpha;

							} else {

								#if FEATURE_MIS

								// get the PDF of the hit envmap point
								vec3 envColor;
								float envPdf = sampleEquirect( envRotation3x3 * ray.direction, envColor );
								envPdf /= lightsDenom;

								// and weight the contribution
								float misWeight = misHeuristic( scatterRec.pdf, envPdf );
								gl_FragColor.rgb += environmentIntensity * envColor * state.throughputColor * misWeight;

								#else

								gl_FragColor.rgb +=
									environmentIntensity *
									sampleEquirectColor( envMapInfo.map, envRotation3x3 * ray.direction ) *
									state.throughputColor;

								#endif

							}
							break;

						}

						uint materialIndex = uTexelFetch1D( materialIndexAttribute, surfaceHit.faceIndices.x ).r;
						Material material = readMaterialInfo( materials, materialIndex );

						#if FEATURE_FOG

						if ( hitType == FOG_HIT ) {

							material = state.fogMaterial;
							state.accumulatedRoughness += 0.2;

						} else if ( material.fogVolume ) {

							state.fogMaterial = material;
							state.fogMaterial.fogVolume = surfaceHit.side == 1.0;

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );

							i -= sign( state.transmissiveTraversals );
							state.transmissiveTraversals -= sign( state.transmissiveTraversals );
							continue;

						}

						#endif

						// early out if this is a matte material
						if ( material.matte && state.firstRay ) {

							gl_FragColor = vec4( 0.0 );
							break;

						}

						// if we've determined that this is a shadow ray and we've hit an item with no shadow casting
						// then skip it
						if ( ! material.castShadow && state.isShadowRay ) {

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );
							continue;

						}

						SurfaceRecord surf;
						if (
							getSurfaceRecord(
								material, surfaceHit, attributesArray, state.accumulatedRoughness,
								surf
							) == SKIP_SURFACE
						) {

							// only allow a limited number of transparency discards otherwise we could
							// crash the context with too long a loop.
							i -= sign( state.transmissiveTraversals );
							state.transmissiveTraversals -= sign( state.transmissiveTraversals );

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );
							continue;

						}

						scatterRec = bsdfSample( - ray.direction, surf );
						state.isShadowRay = scatterRec.specularPdf < rand( 4 );

						bool isBelowSurface = ! surf.volumeParticle && dot( scatterRec.direction, surf.faceNormal ) < 0.0;
						vec3 hitPoint = stepRayOrigin( ray.origin, ray.direction, isBelowSurface ? - surf.faceNormal : surf.faceNormal, surfaceHit.dist );

						// next event estimation
						#if FEATURE_MIS

						gl_FragColor.rgb += directLightContribution( - ray.direction, surf, state, hitPoint );

						#endif

						// accumulate a roughness value to offset diffuse, specular, diffuse rays that have high contribution
						// to a single pixel resulting in fireflies
						// TODO: handle transmissive surfaces
						if ( ! surf.volumeParticle && ! isBelowSurface ) {

							// determine if this is a rough normal or not by checking how far off straight up it is
							vec3 halfVector = normalize( - ray.direction + scatterRec.direction );
							state.accumulatedRoughness += max(
								sin( acosApprox( dot( halfVector, surf.normal ) ) ),
								sin( acosApprox( dot( halfVector, surf.clearcoatNormal ) ) )
							);

							state.transmissiveRay = false;

						}

						// accumulate emissive color
						gl_FragColor.rgb += ( surf.emission * state.throughputColor );

						// skip the sample if our PDF or ray is impossible
						if ( scatterRec.pdf <= 0.0 || ! isDirectionValid( scatterRec.direction, surf.normal, surf.faceNormal ) ) {

							break;

						}

						// if we're bouncing around the inside a transmissive material then decrement
						// perform this separate from a bounce
						bool isTransmissiveRay = ! surf.volumeParticle && dot( scatterRec.direction, surf.faceNormal * surfaceHit.side ) < 0.0;
						if ( ( isTransmissiveRay || isBelowSurface ) && state.transmissiveTraversals > 0 ) {

							state.transmissiveTraversals --;
							i --;

						}

						//

						// handle throughput color transformation
						// attenuate the throughput color by the medium color
						if ( ! surf.frontFace ) {

							state.throughputColor *= transmissionAttenuation( surfaceHit.dist, surf.attenuationColor, surf.attenuationDistance );

						}

						#if FEATURE_RUSSIAN_ROULETTE

						// russian roulette path termination
						// https://www.arnoldrenderer.com/research/physically_based_shader_design_in_arnold.pdf
						uint minBounces = 3u;
						float depthProb = float( state.depth < minBounces );

						float rrProb = luminance( state.throughputColor * scatterRec.color / scatterRec.pdf );
						rrProb /= luminance( state.throughputColor );
						rrProb = sqrt( rrProb );
						rrProb = max( rrProb, depthProb );
						rrProb = min( rrProb, 1.0 );
						if ( rand( 8 ) > rrProb ) {

							break;

						}

						// perform sample clamping here to avoid bright pixels
						state.throughputColor *= min( 1.0 / rrProb, 20.0 );

						#endif

						// adjust the throughput and discard and exit if we find discard the sample if there are any NaNs
						state.throughputColor *= scatterRec.color / scatterRec.pdf;
						if ( any( isnan( state.throughputColor ) ) || any( isinf( state.throughputColor ) ) ) {

							break;

						}

						//

						// prepare for next ray
						ray.direction = scatterRec.direction;
						ray.origin = hitPoint;

					}

					gl_FragColor.a *= opacity;

					#if DEBUG_MODE == 1

					// output the number of rays checked in the path and number of
					// transmissive rays encountered.
					gl_FragColor.rgb = vec3(
						float( state.depth ),
						transmissiveBounces - state.transmissiveTraversals,
						0.0
					);
					gl_FragColor.a = 1.0;

					#endif

				}

			`}),this.setValues(e)}};function*xS(){let{_renderer:i,_fsQuad:e,_blendQuad:t,_primaryTarget:n,_blendTargets:r,_sobolTarget:s,_subframe:o,alpha:a,material:l}=this,u=new bt,f=new bt,h=t.material,[c,p]=r;for(;;){a?(h.opacity=this._opacityFactor/(this.samples+1),l.blending=Jt,l.opacity=1):(l.opacity=this._opacityFactor/(this.samples+1),l.blending=ti);let[x,M,m,g]=o,S=n.width,A=n.height;l.resolution.set(S*m,A*g),l.sobolTexture=s.texture,l.stratifiedTexture.init(20,l.bounces+l.transmissiveBounces+5),l.stratifiedTexture.next(),l.seed++;let y=this.tiles.x||1,T=this.tiles.y||1,E=y*T,I=Math.ceil(S*m),_=Math.ceil(A*g),R=Math.floor(x*S),P=Math.floor(M*A),N=Math.ceil(I/y),F=Math.ceil(_/T);for(let z=0;z<T;z++)for(let U=0;U<y;U++){let V=i.getRenderTarget(),q=i.autoClear,te=i.getScissorTest();i.getScissor(u),i.getViewport(f);let he=U,Q=z;if(!this.stableTiles){let le=this._currentTile%(y*T);he=le%y,Q=~~(le/y),this._currentTile=le+1}let ie=T-Q-1;n.scissor.set(R+he*N,P+ie*F,Math.min(N,I-he*N),Math.min(F,_-ie*F)),n.viewport.set(R,P,I,_),i.setRenderTarget(n),i.setScissorTest(!0),i.autoClear=!1,e.render(i),i.setViewport(f),i.setScissor(u),i.setScissorTest(te),i.setRenderTarget(V),i.autoClear=q,a&&(h.target1=c.texture,h.target2=n.texture,i.setRenderTarget(p),t.render(i),i.setRenderTarget(V)),this.samples+=1/E,U===y-1&&z===T-1&&(this.samples=Math.round(this.samples)),yield}[c,p]=[p,c]}}var Tm=new Je,Fo=class{get material(){return this._fsQuad.material}set material(e){this._fsQuad.material.removeEventListener("recompilation",this._compileFunction),e.addEventListener("recompilation",this._compileFunction),this._fsQuad.material=e}get target(){return this._alpha?this._blendTargets[1]:this._primaryTarget}set alpha(e){this._alpha!==e&&(e||(this._blendTargets[0].dispose(),this._blendTargets[1].dispose()),this._alpha=e,this.reset())}get alpha(){return this._alpha}get isCompiling(){return!!this._compilePromise}constructor(e){this.camera=null,this.tiles=new Be(3,3),this.stableNoise=!1,this.stableTiles=!0,this.samples=0,this._subframe=new bt(0,0,1,1),this._opacityFactor=1,this._renderer=e,this._alpha=!1,this._fsQuad=new Nn(new Bc),this._blendQuad=new Nn(new xc),this._task=null,this._currentTile=0,this._compilePromise=null,this._sobolTarget=new Sc().generate(e),this._primaryTarget=new Vt(1,1,{format:Ge,type:et,magFilter:Qe,minFilter:Qe}),this._blendTargets=[new Vt(1,1,{format:Ge,type:et,magFilter:Qe,minFilter:Qe}),new Vt(1,1,{format:Ge,type:et,magFilter:Qe,minFilter:Qe})],this._compileFunction=()=>{let t=this.compileMaterial(this._fsQuad._mesh);t.then(()=>{this._compilePromise===t&&(this._compilePromise=null)}),this._compilePromise=t},this.material.addEventListener("recompilation",this._compileFunction)}compileMaterial(){return this._renderer.compileAsync(this._fsQuad._mesh)}setCamera(e){let{material:t}=this;t.cameraWorldMatrix.copy(e.matrixWorld),t.invProjectionMatrix.copy(e.projectionMatrixInverse),t.physicalCamera.updateFrom(e);let n=0;e.projectionMatrix.elements[15]>0&&(n=1),e.isEquirectCamera&&(n=2),t.setDefine("CAMERA_TYPE",n),this.camera=e}setSize(e,t){e=Math.ceil(e),t=Math.ceil(t),!(this._primaryTarget.width===e&&this._primaryTarget.height===t)&&(this._primaryTarget.setSize(e,t),this._blendTargets[0].setSize(e,t),this._blendTargets[1].setSize(e,t),this.reset())}getSize(e){e.x=this._primaryTarget.width,e.y=this._primaryTarget.height}dispose(){this._primaryTarget.dispose(),this._blendTargets[0].dispose(),this._blendTargets[1].dispose(),this._sobolTarget.dispose(),this._fsQuad.dispose(),this._blendQuad.dispose(),this._task=null}reset(){let{_renderer:e,_primaryTarget:t,_blendTargets:n}=this,r=e.getRenderTarget(),s=e.getClearAlpha();e.getClearColor(Tm),e.setRenderTarget(t),e.setClearColor(0,0),e.clearColor(),e.setRenderTarget(n[0]),e.setClearColor(0,0),e.clearColor(),e.setRenderTarget(n[1]),e.setClearColor(0,0),e.clearColor(),e.setClearColor(Tm,s),e.setRenderTarget(r),this.samples=0,this._task=null,this.material.stratifiedTexture.stableNoise=this.stableNoise,this.stableNoise&&(this.material.seed=0,this.material.stratifiedTexture.reset())}update(){this.material.onBeforeRender(),!this.isCompiling&&(this._task||(this._task=xS.call(this)),this._task.next())}};var yr=new Be,wm=new Be,Oc=new Qs,zc=new Je,kc=class extends It{constructor(e=512,t=512){super(new Uint16Array(e*t*4),e,t,Ge,ct,ni,rn,Dt,nt,nt),this.generationCallback=null}update(){this.dispose(),this.needsUpdate=!0;let{data:e,width:t,height:n}=this.image;for(let r=0;r<t;r++)for(let s=0;s<n;s++){wm.set(t,n),yr.set(r/t,s/n),yr.x-=.5,yr.y=1-yr.y,Oc.theta=yr.x*2*Math.PI,Oc.phi=yr.y*Math.PI,Oc.radius=1,this.generationCallback(Oc,yr,wm,zc);let a=4*(s*t+r);e[a+0]=vt.toHalfFloat(zc.r),e[a+1]=vt.toHalfFloat(zc.g),e[a+2]=vt.toHalfFloat(zc.b),e[a+3]=vt.toHalfFloat(1)}}copy(e){return super.copy(e),this.generationCallback=e.generationCallback,this}};var Am=new k,Vc=class extends kc{constructor(e=512){super(e,e),this.topColor=new Je().set(16777215),this.bottomColor=new Je().set(0),this.exponent=2,this.generationCallback=(t,n,r,s)=>{Am.setFromSpherical(t);let o=Am.y*.5+.5;s.lerpColors(this.bottomColor,this.topColor,o**this.exponent)}}copy(e){return super.copy(e),this.topColor.copy(e.topColor),this.bottomColor.copy(e.bottomColor),this}};var Hc=class extends qt{get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}constructor(e){super({uniforms:{map:{value:null},opacity:{value:1}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`
				uniform sampler2D map;
				uniform float opacity;
				varying vec2 vUv;

				vec4 clampedTexelFatch( sampler2D map, ivec2 px, int lod ) {

					vec4 res = texelFetch( map, ivec2( px.x, px.y ), 0 );

					#if defined( TONE_MAPPING )

					res.xyz = toneMapping( res.xyz );

					#endif

			  		return linearToOutputTexel( res );

				}

				void main() {

					vec2 size = vec2( textureSize( map, 0 ) );
					vec2 pxUv = vUv * size;
					vec2 pxCurr = floor( pxUv );
					vec2 pxFrac = fract( pxUv ) - 0.5;
					vec2 pxOffset;
					pxOffset.x = pxFrac.x > 0.0 ? 1.0 : - 1.0;
					pxOffset.y = pxFrac.y > 0.0 ? 1.0 : - 1.0;

					vec2 pxNext = clamp( pxOffset + pxCurr, vec2( 0.0 ), size - 1.0 );
					vec2 alpha = abs( pxFrac );

					vec4 p1 = mix(
						clampedTexelFatch( map, ivec2( pxCurr.x, pxCurr.y ), 0 ),
						clampedTexelFatch( map, ivec2( pxNext.x, pxCurr.y ), 0 ),
						alpha.x
					);

					vec4 p2 = mix(
						clampedTexelFatch( map, ivec2( pxCurr.x, pxNext.y ), 0 ),
						clampedTexelFatch( map, ivec2( pxNext.x, pxNext.y ), 0 ),
						alpha.x
					);

					gl_FragColor = mix( p1, p2, alpha.y );
					gl_FragColor.a *= opacity;
					#include <premultiplied_alpha_fragment>

				}
			`}),this.setValues(e)}};var $h=class extends qt{constructor(){super({uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`
				#define ENVMAP_TYPE_CUBE_UV

				uniform samplerCube envMap;
				uniform float flipEnvMap;
				varying vec2 vUv;

				#include <common>
				#include <cube_uv_reflection_fragment>

				${Uc}

				void main() {

					vec3 rayDirection = equirectUvToDirection( vUv );
					rayDirection.x *= flipEnvMap;
					gl_FragColor = textureCube( envMap, rayDirection );

				}`}),this.depthWrite=!1,this.depthTest=!1}},No=class{constructor(e){this._renderer=e,this._quad=new Nn(new $h)}generate(e,t=null,n=null){if(!e.isCubeTexture)throw new Error("CubeToEquirectMaterial: Source can only be cube textures.");let r=e.images[0],s=this._renderer,o=this._quad;t===null&&(t=4*r.height),n===null&&(n=2*r.height);let a=new Vt(t,n,{type:et,colorSpace:r.colorSpace}),l=r.height,u=Math.log2(l)-2,f=1/l,h=1/(3*Math.max(Math.pow(2,u),112));o.material.defines.CUBEUV_MAX_MIP=`${u}.0`,o.material.defines.CUBEUV_TEXEL_WIDTH=h,o.material.defines.CUBEUV_TEXEL_HEIGHT=f,o.material.uniforms.envMap.value=e,o.material.uniforms.flipEnvMap.value=e.isRenderTargetTexture?1:-1,o.material.needsUpdate=!0;let c=s.getRenderTarget(),p=s.autoClear;s.autoClear=!0,s.setRenderTarget(a),o.render(s),s.setRenderTarget(c),s.autoClear=p;let x=new Uint16Array(t*n*4),M=new Float32Array(t*n*4);s.readRenderTargetPixels(a,0,0,t,n,M),a.dispose();for(let g=0,S=M.length;g<S;g++)x[g]=vt.toHalfFloat(M[g]);let m=new It(x,t,n,Ge,ct);return m.minFilter=Nu,m.magFilter=nt,m.wrapS=rn,m.wrapT=rn,m.mapping=ni,m.needsUpdate=!0,m}dispose(){this._quad.dispose()}};function vS(i){return i.extensions.get("EXT_float_blend")}var bs=new Be,Gc=class{get multipleImportanceSampling(){return!!this._pathTracer.material.defines.FEATURE_MIS}set multipleImportanceSampling(e){this._pathTracer.material.setDefine("FEATURE_MIS",e?1:0)}get transmissiveBounces(){return this._pathTracer.material.transmissiveBounces}set transmissiveBounces(e){this._pathTracer.material.transmissiveBounces=e}get bounces(){return this._pathTracer.material.bounces}set bounces(e){this._pathTracer.material.bounces=e}get filterGlossyFactor(){return this._pathTracer.material.filterGlossyFactor}set filterGlossyFactor(e){this._pathTracer.material.filterGlossyFactor=e}get samples(){return this._pathTracer.samples}get target(){return this._pathTracer.target}get tiles(){return this._pathTracer.tiles}get stableNoise(){return this._pathTracer.stableNoise}set stableNoise(e){this._pathTracer.stableNoise=e}get isCompiling(){return!!this._pathTracer.isCompiling}constructor(e){console.warn('WebGLPathTracer: This class has been deprecated and will be removed in a future release. Use "WebGPUPathTracer" instead.'),this._renderer=e,this._generator=new gc,this._pathTracer=new Fo(e),this._queueReset=!1,this._clock=new Ks,this._compilePromise=null,this._lowResPathTracer=new Fo(e),this._lowResPathTracer.tiles.set(1,1),this._quad=new Nn(new Hc({map:null,transparent:!0,blending:Jt,premultipliedAlpha:e.getContextAttributes().premultipliedAlpha})),this._materials=null,this._previousEnvironment=null,this._previousBackground=null,this._internalBackground=null,this.renderDelay=100,this.minSamples=5,this.fadeDuration=500,this.enablePathTracing=!0,this.pausePathTracing=!1,this.dynamicLowRes=!1,this.lowResScale=.25,this.renderScale=1,this.synchronizeRenderSize=!0,this.rasterizeScene=!0,this.renderToCanvas=!0,this.textureSize=new Be(1024,1024),this.rasterizeSceneCallback=(t,n)=>{this._renderer.render(t,n)},this.renderToCanvasCallback=(t,n,r)=>{let s=n.autoClear;n.autoClear=!1,r.render(n),n.autoClear=s},this.setScene(new ir,new nn)}setBVHWorker(e){this._generator.setBVHWorker(e)}setScene(e,t,n={}){e.updateMatrixWorld(!0),t.updateMatrixWorld();let r=this._generator;if(r.setObjects(e),this._buildAsync)return r.generateAsync(n.onProgress).then(s=>this._updateFromResults(e,t,s));{let s=r.generate();return this._updateFromResults(e,t,s)}}setSceneAsync(...e){this._buildAsync=!0;let t=this.setScene(...e);return this._buildAsync=!1,t}setCamera(e){this.camera=e,this.updateCamera()}updateCamera(){let e=this.camera;e.updateMatrixWorld(),this._pathTracer.setCamera(e),this._lowResPathTracer.setCamera(e),this.reset()}updateMaterials(){let e=this._pathTracer.material,t=this._renderer,n=this._materials,r=this.textureSize,s=Yp(n);e.textures.setTextures(t,s,r.x,r.y),e.materials.updateFrom(n,s),this.reset()}updateLights(){let e=this.scene,t=this._renderer,n=this._pathTracer.material,r=Zp(e),s=qp(r);n.lights.updateFrom(r,s),n.iesProfiles.setTextures(t,s),this.reset()}updateEnvironment(){let e=this.scene,t=this._pathTracer.material;if(this._internalBackground&&(this._internalBackground.dispose(),this._internalBackground=null),t.backgroundBlur=e.backgroundBlurriness,t.backgroundIntensity=e.backgroundIntensity??1,t.backgroundRotation.makeRotationFromEuler(e.backgroundRotation).invert(),e.background===null)t.backgroundMap=null,t.backgroundAlpha=0;else if(e.background.isColor){this._colorBackground=this._colorBackground||new Vc(16);let n=this._colorBackground;n.topColor.equals(e.background)||(n.topColor.set(e.background),n.bottomColor.set(e.background),n.update()),t.backgroundMap=n,t.backgroundAlpha=1}else if(e.background.isCubeTexture){if(e.background!==this._previousBackground){let n=new No(this._renderer).generate(e.background);this._internalBackground=n,t.backgroundMap=n,t.backgroundAlpha=1}}else t.backgroundMap=e.background,t.backgroundAlpha=1;if(t.environmentIntensity=e.environment!==null?e.environmentIntensity??1:0,t.environmentRotation.makeRotationFromEuler(e.environmentRotation).invert(),this._previousEnvironment!==e.environment&&e.environment!==null)if(e.environment.isCubeTexture){let n=new No(this._renderer).generate(e.environment);t.envMapInfo.updateFrom(n)}else t.envMapInfo.updateFrom(e.environment);this._previousEnvironment=e.environment,this._previousBackground=e.background,this.reset()}_updateFromResults(e,t,n){let{materials:r,geometry:s,bvh:o,bvhChanged:a,needsMaterialIndexUpdate:l}=n;this._materials=r;let f=this._pathTracer.material;return a&&(f.bvh.updateFrom(o),f.attributesArray.updateFrom(s.attributes.normal,s.attributes.tangent,s.attributes.uv,s.attributes.color)),l&&f.materialIndexAttribute.updateFrom(s.attributes.materialIndex),this._previousScene=e,this.scene=e,this.camera=t,this.updateCamera(),this.updateMaterials(),this.updateEnvironment(),this.updateLights(),n}renderSample(){let e=this._lowResPathTracer,t=this._pathTracer,n=this._renderer,r=this._clock,s=this._quad;this._updateScale(),this._queueReset&&(t.reset(),e.reset(),this._queueReset=!1,s.material.opacity=0,r.start());let o=r.getDelta()*1e3,a=r.getElapsedTime()*1e3;if(!this.pausePathTracing&&this.enablePathTracing&&this.renderDelay<=a&&!this.isCompiling&&t.update(),t.alpha=t.material.backgroundAlpha!==1||!vS(n),e.alpha=t.alpha,this.renderToCanvas){let l=this._renderer,u=this.minSamples;if(a>=this.renderDelay&&this.samples>=this.minSamples&&(this.fadeDuration!==0?s.material.opacity=Math.min(s.material.opacity+o/this.fadeDuration,1):s.material.opacity=1),!this.enablePathTracing||this.samples<u||s.material.opacity<1){if(this.dynamicLowRes&&!this.isCompiling){e.samples<1&&(e.material=t.material,e.update());let f=s.material.opacity;s.material.opacity=1-s.material.opacity,s.material.map=e.target.texture,s.render(l),s.material.opacity=f}(!this.dynamicLowRes&&this.rasterizeScene||this.dynamicLowRes&&this.isCompiling)&&this.rasterizeSceneCallback(this.scene,this.camera)}this.enablePathTracing&&s.material.opacity>0&&(s.material.opacity<1&&(s.material.blending=this.dynamicLowRes?eo:ti),s.material.map=t.target.texture,this.renderToCanvasCallback(t.target,l,s),s.material.blending=Jt)}}reset(){this._queueReset=!0,this._pathTracer.samples=0}dispose(){this._quad.dispose(),this._quad.material.dispose(),this._pathTracer.dispose()}_updateScale(){if(this.synchronizeRenderSize){this._renderer.getDrawingBufferSize(bs);let e=Math.floor(this.renderScale*bs.x),t=Math.floor(this.renderScale*bs.y);if(this._pathTracer.getSize(bs),bs.x!==e||bs.y!==t){let n=this.lowResScale;this._pathTracer.setSize(e,t),this._lowResPathTracer.setSize(Math.floor(e*n),Math.floor(t*n))}}}getRenderTime(){return this._clock.getElapsedTime()*1e3}};var Wc=class extends or{constructor(e){super(e),this.type=ct}parse(e){let o=function(_,R){switch(_){case 1:throw new Error("THREE.HDRLoader: Read Error: "+(R||""));case 2:throw new Error("THREE.HDRLoader: Write Error: "+(R||""));case 3:throw new Error("THREE.HDRLoader: Bad File Format: "+(R||""));default:case 4:throw new Error("THREE.HDRLoader: Memory Error: "+(R||""))}},h=function(_,R,P){R=R||1024;let F=_.pos,z=-1,U=0,V="",q=String.fromCharCode.apply(null,new Uint16Array(_.subarray(F,F+128)));for(;0>(z=q.indexOf(`
`))&&U<R&&F<_.byteLength;)V+=q,U+=q.length,F+=128,q=String.fromCharCode.apply(null,new Uint16Array(_.subarray(F,F+128)));return-1<z?(P!==!1&&(_.pos+=U+z+1),V+q.slice(0,z)):!1},c=function(_){let R=/^#\?(\S+)/,P=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,N=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,F=/^\s*FORMAT=(\S+)\s*$/,z=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,U={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},V,q;for((_.pos>=_.byteLength||!(V=h(_)))&&o(1,"no header found"),(q=V.match(R))||o(3,"bad initial token"),U.valid|=1,U.programtype=q[1],U.string+=V+`
`;V=h(_),V!==!1;){if(U.string+=V+`
`,V.charAt(0)==="#"){U.comments+=V+`
`;continue}if((q=V.match(P))&&(U.gamma=parseFloat(q[1])),(q=V.match(N))&&(U.exposure=parseFloat(q[1])),(q=V.match(F))&&(U.valid|=2,U.format=q[1]),(q=V.match(z))&&(U.valid|=4,U.height=parseInt(q[1],10),U.width=parseInt(q[2],10)),U.valid&2&&U.valid&4)break}return U.valid&2||o(3,"missing format specifier"),U.valid&4||o(3,"missing image size specifier"),U},p=function(_,R,P){let N=R;if(N<8||N>32767||_[0]!==2||_[1]!==2||_[2]&128)return new Uint8Array(_);N!==(_[2]<<8|_[3])&&o(3,"wrong scanline width");let F=new Uint8Array(4*R*P);F.length||o(4,"unable to allocate buffer space");let z=0,U=0,V=4*N,q=new Uint8Array(4),te=new Uint8Array(V),he=P;for(;he>0&&U<_.byteLength;){U+4>_.byteLength&&o(1),q[0]=_[U++],q[1]=_[U++],q[2]=_[U++],q[3]=_[U++],(q[0]!=2||q[1]!=2||(q[2]<<8|q[3])!=N)&&o(3,"bad rgbe scanline format");let Q=0,ie;for(;Q<V&&U<_.byteLength;){ie=_[U++];let Re=ie>128;if(Re&&(ie-=128),(ie===0||Q+ie>V)&&o(3,"bad scanline data"),Re){let ye=_[U++];for(let ut=0;ut<ie;ut++)te[Q++]=ye}else te.set(_.subarray(U,U+ie),Q),Q+=ie,U+=ie}let le=N;for(let Re=0;Re<le;Re++){let ye=0;F[z]=te[Re+ye],ye+=N,F[z+1]=te[Re+ye],ye+=N,F[z+2]=te[Re+ye],ye+=N,F[z+3]=te[Re+ye],z+=4}he--}return F},x=function(_,R,P,N){let F=_[R+3],z=Math.pow(2,F-128)/255;P[N+0]=_[R+0]*z,P[N+1]=_[R+1]*z,P[N+2]=_[R+2]*z,P[N+3]=1},M=function(_,R,P,N){let F=_[R+3],z=Math.pow(2,F-128)/255;P[N+0]=vt.toHalfFloat(Math.min(_[R+0]*z,65504)),P[N+1]=vt.toHalfFloat(Math.min(_[R+1]*z,65504)),P[N+2]=vt.toHalfFloat(Math.min(_[R+2]*z,65504)),P[N+3]=vt.toHalfFloat(1)},m=new Uint8Array(e);m.pos=0;let g=c(m),S=g.width,A=g.height,y=p(m.subarray(m.pos),S,A),T,E,I;switch(this.type){case et:I=y.length/4;let _=new Float32Array(I*4);for(let P=0;P<I;P++)x(y,P*4,_,P*4);T=_,E=et;break;case ct:I=y.length/4;let R=new Uint16Array(I*4);for(let P=0;P<I;P++)M(y,P*4,R,P*4);T=R,E=ct;break;default:throw new Error("THREE.HDRLoader: Unsupported type: "+this.type)}return{width:S,height:A,data:T,header:g.string,gamma:g.gamma,exposure:g.exposure,type:E,colorSpace:fn,minFilter:nt,magFilter:nt,generateMipmaps:!1,flipY:!0}}setDataType(e){return this.type=e,this}};var Hn=Uint8Array,Ms=Uint16Array,_S=Int32Array,Em=new Hn([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Rm=new Hn([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),yS=new Hn([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Cm=function(i,e){for(var t=new Ms(31),n=0;n<31;++n)t[n]=e+=1<<i[n-1];for(var r=new _S(t[30]),n=1;n<30;++n)for(var s=t[n];s<t[n+1];++s)r[s]=s-t[n]<<5|n;return{b:t,r}},Im=Cm(Em,2),Pm=Im.b,SS=Im.r;Pm[28]=258,SS[258]=28;var Dm=Cm(Rm,0),bS=Dm.b,L3=Dm.r,Qh=new Ms(32768);for(wt=0;wt<32768;++wt)Mi=(wt&43690)>>1|(wt&21845)<<1,Mi=(Mi&52428)>>2|(Mi&13107)<<2,Mi=(Mi&61680)>>4|(Mi&3855)<<4,Qh[wt]=((Mi&65280)>>8|(Mi&255)<<8)>>1;var Mi,wt,Uo=(function(i,e,t){for(var n=i.length,r=0,s=new Ms(e);r<n;++r)i[r]&&++s[i[r]-1];var o=new Ms(e);for(r=1;r<e;++r)o[r]=o[r-1]+s[r-1]<<1;var a;if(t){a=new Ms(1<<e);var l=15-e;for(r=0;r<n;++r)if(i[r])for(var u=r<<4|i[r],f=e-i[r],h=o[i[r]-1]++<<f,c=h|(1<<f)-1;h<=c;++h)a[Qh[h]>>l]=u}else for(a=new Ms(n),r=0;r<n;++r)i[r]&&(a[r]=Qh[o[i[r]-1]++]>>15-i[r]);return a}),Bo=new Hn(288);for(wt=0;wt<144;++wt)Bo[wt]=8;var wt;for(wt=144;wt<256;++wt)Bo[wt]=9;var wt;for(wt=256;wt<280;++wt)Bo[wt]=7;var wt;for(wt=280;wt<288;++wt)Bo[wt]=8;var wt,Lm=new Hn(32);for(wt=0;wt<32;++wt)Lm[wt]=5;var wt;var MS=Uo(Bo,9,1);var TS=Uo(Lm,5,1),Jh=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},$n=function(i,e,t){var n=e/8|0;return(i[n]|i[n+1]<<8)>>(e&7)&t},Kh=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},wS=function(i){return(i+7)/8|0},AS=function(i,e,t){return(e==null||e<0)&&(e=0),(t==null||t>i.length)&&(t=i.length),new Hn(i.subarray(e,t))};var ES=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Jn=function(i,e,t){var n=new Error(e||ES[i]);if(n.code=i,Error.captureStackTrace&&Error.captureStackTrace(n,Jn),!t)throw n;return n},RS=function(i,e,t,n){var r=i.length,s=n?n.length:0;if(!r||e.f&&!e.l)return t||new Hn(0);var o=!t,a=o||e.i!=2,l=e.i;o&&(t=new Hn(r*3));var u=function(Ie){var Ke=t.length;if(Ie>Ke){var zt=new Hn(Math.max(Ke*2,Ie));zt.set(t),t=zt}},f=e.f||0,h=e.p||0,c=e.b||0,p=e.l,x=e.d,M=e.m,m=e.n,g=r*8;do{if(!p){f=$n(i,h,1);var S=$n(i,h+1,3);if(h+=3,S)if(S==1)p=MS,x=TS,M=9,m=5;else if(S==2){var E=$n(i,h,31)+257,I=$n(i,h+10,15)+4,_=E+$n(i,h+5,31)+1;h+=14;for(var R=new Hn(_),P=new Hn(19),N=0;N<I;++N)P[yS[N]]=$n(i,h+N*3,7);h+=I*3;for(var F=Jh(P),z=(1<<F)-1,U=Uo(P,F,1),N=0;N<_;){var V=U[$n(i,h,z)];h+=V&15;var A=V>>4;if(A<16)R[N++]=A;else{var q=0,te=0;for(A==16?(te=3+$n(i,h,3),h+=2,q=R[N-1]):A==17?(te=3+$n(i,h,7),h+=3):A==18&&(te=11+$n(i,h,127),h+=7);te--;)R[N++]=q}}var he=R.subarray(0,E),Q=R.subarray(E);M=Jh(he),m=Jh(Q),p=Uo(he,M,1),x=Uo(Q,m,1)}else Jn(1);else{var A=wS(h)+4,y=i[A-4]|i[A-3]<<8,T=A+y;if(T>r){l&&Jn(0);break}a&&u(c+y),t.set(i.subarray(A,T),c),e.b=c+=y,e.p=h=T*8,e.f=f;continue}if(h>g){l&&Jn(0);break}}a&&u(c+131072);for(var ie=(1<<M)-1,le=(1<<m)-1,Re=h;;Re=h){var q=p[Kh(i,h)&ie],ye=q>>4;if(h+=q&15,h>g){l&&Jn(0);break}if(q||Jn(2),ye<256)t[c++]=ye;else if(ye==256){Re=h,p=null;break}else{var ut=ye-254;if(ye>264){var N=ye-257,Xe=Em[N];ut=$n(i,h,(1<<Xe)-1)+Pm[N],h+=Xe}var rt=x[Kh(i,h)&le],J=rt>>4;rt||Jn(3),h+=rt&15;var Q=bS[J];if(J>3){var Xe=Rm[J];Q+=Kh(i,h)&(1<<Xe)-1,h+=Xe}if(h>g){l&&Jn(0);break}a&&u(c+131072);var ce=c+ut;if(c<Q){var Ee=s-Q,Ye=Math.min(Q,ce);for(Ee+c<0&&Jn(3);c<Ye;++c)t[c]=n[Ee+c]}for(;c<ce;++c)t[c]=t[c-Q]}}e.l=p,e.p=Re,e.b=c,e.f=f,p&&(f=1,e.m=M,e.d=x,e.n=m)}while(!f);return c!=t.length&&o?AS(t,0,c):t.subarray(0,c)};var CS=new Hn(0);var IS=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&Jn(6,"invalid zlib data"),(i[1]>>5&1)==+!e&&Jn(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function Ts(i,e){return RS(i.subarray(IS(i,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var PS=typeof TextDecoder<"u"&&new TextDecoder,DS=0;try{PS.decode(CS,{stream:!0}),DS=1}catch{}var Xc=class extends or{constructor(e){super(e),this.type=ct,this.outputFormat=Ge,this.part=0}parse(e){let R=Math.pow(2.7182818,2.2),P=null;function N(v,d){let b=0;for(let D=0;D<65536;++D)(D==0||v[D>>3]&1<<(D&7))&&(d[b++]=D);let C=b-1;for(;b<65536;)d[b++]=0;return C}function F(v){for(let d=0;d<16384;d++)v[d]={},v[d].len=0,v[d].lit=0,v[d].p=null}let z={l:0,c:0,lc:0};function U(v,d,b,C,D){for(;b<v;)d=d<<8|Te(C,D),b+=8;b-=v,z.l=d>>b&(1<<v)-1,z.c=d,z.lc=b}let V=new Array(59);function q(v){for(let b=0;b<=58;++b)V[b]=0;for(let b=0;b<65537;++b)V[v[b]]+=1;let d=0;for(let b=58;b>0;--b){let C=d+V[b]>>1;V[b]=d,d=C}for(let b=0;b<65537;++b){let C=v[b];C>0&&(v[b]=C|V[C]++<<6)}}function te(v,d,b,C,D,B){let L=d,X=0,H=0;for(;C<=D;C++){if(L.value-d.value>b)return!1;U(6,X,H,v,L);let Y=z.l;if(X=z.c,H=z.lc,B[C]=Y,Y==63){if(L.value-d.value>b)throw new Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");U(8,X,H,v,L);let $=z.l+6;if(X=z.c,H=z.lc,C+$>D+1)throw new Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");for(;$--;)B[C++]=0;C--}else if(Y>=59){let $=Y-59+2;if(C+$>D+1)throw new Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");for(;$--;)B[C++]=0;C--}}q(B)}function he(v){return v&63}function Q(v){return v>>6}function ie(v,d,b,C){for(;d<=b;d++){let D=Q(v[d]),B=he(v[d]);if(D>>B)throw new Error("THREE.EXRLoader: Invalid table entry");if(B>14){let L=C[D>>B-14];if(L.len)throw new Error("THREE.EXRLoader: Invalid table entry");if(L.lit++,L.p){let X=L.p;L.p=new Array(L.lit);for(let H=0;H<L.lit-1;++H)L.p[H]=X[H]}else L.p=new Array(1);L.p[L.lit-1]=d}else if(B){let L=0;for(let X=1<<14-B;X>0;X--){let H=C[(D<<14-B)+L];if(H.len||H.p)throw new Error("THREE.EXRLoader: Invalid table entry");H.len=B,H.lit=d,L++}}}return!0}let le={c:0,lc:0};function Re(v,d,b,C){v=v<<8|Te(b,C),d+=8,le.c=v,le.lc=d}let ye={c:0,lc:0};function ut(v,d,b,C,D,B,L,X,H){if(v==d){C<8&&(Re(b,C,D,B),b=le.c,C=le.lc),C-=8;let Y=b>>C;if(Y=new Uint8Array([Y])[0],X.value+Y>H)return!1;let $=L[X.value-1];for(;Y-- >0;)L[X.value++]=$}else if(X.value<H)L[X.value++]=v;else return!1;ye.c=b,ye.lc=C}function Xe(v){return v&65535}function rt(v){let d=Xe(v);return d>32767?d-65536:d}let J={a:0,b:0};function ce(v,d){let b=rt(v),D=rt(d),B=b+(D&1)+(D>>1),L=B,X=B-D;J.a=L,J.b=X}function Ee(v,d){let b=Xe(v),C=Xe(d),D=b-(C>>1)&65535,B=C+D-32768&65535;J.a=B,J.b=D}function Ye(v,d,b,C,D,B,L){let X=L<16384,H=b>D?D:b,Y=1,$,se;for(;Y<=H;)Y<<=1;for(Y>>=1,$=Y,Y>>=1;Y>=1;){se=0;let ee=se+B*(D-$),ne=B*Y,ge=B*$,pe=C*Y,me=C*$,Se,He,fe,qe;for(;se<=ee;se+=ge){let xe=se,Me=se+C*(b-$);for(;xe<=Me;xe+=me){let Fe=xe+pe,ft=xe+ne,st=ft+pe;X?(ce(v[xe+d],v[ft+d]),Se=J.a,fe=J.b,ce(v[Fe+d],v[st+d]),He=J.a,qe=J.b,ce(Se,He),v[xe+d]=J.a,v[Fe+d]=J.b,ce(fe,qe),v[ft+d]=J.a,v[st+d]=J.b):(Ee(v[xe+d],v[ft+d]),Se=J.a,fe=J.b,Ee(v[Fe+d],v[st+d]),He=J.a,qe=J.b,Ee(Se,He),v[xe+d]=J.a,v[Fe+d]=J.b,Ee(fe,qe),v[ft+d]=J.a,v[st+d]=J.b)}if(b&Y){let Fe=xe+ne;X?ce(v[xe+d],v[Fe+d]):Ee(v[xe+d],v[Fe+d]),Se=J.a,v[Fe+d]=J.b,v[xe+d]=Se}}if(D&Y){let xe=se,Me=se+C*(b-$);for(;xe<=Me;xe+=me){let Fe=xe+pe;X?ce(v[xe+d],v[Fe+d]):Ee(v[xe+d],v[Fe+d]),Se=J.a,v[Fe+d]=J.b,v[xe+d]=Se}}$=Y,Y>>=1}return se}function Ie(v,d,b,C,D,B,L,X,H){let Y=0,$=0,se=L,ee=Math.trunc(C.value+(D+7)/8);for(;C.value<ee;)for(Re(Y,$,b,C),Y=le.c,$=le.lc;$>=14;){let ge=Y>>$-14&16383,pe=d[ge];if(pe.len)$-=pe.len,ut(pe.lit,B,Y,$,b,C,X,H,se),Y=ye.c,$=ye.lc;else{if(!pe.p)throw new Error("THREE.EXRLoader: hufDecode issues");let me;for(me=0;me<pe.lit;me++){let Se=he(v[pe.p[me]]);for(;$<Se&&C.value<ee;)Re(Y,$,b,C),Y=le.c,$=le.lc;if($>=Se&&Q(v[pe.p[me]])==(Y>>$-Se&(1<<Se)-1)){$-=Se,ut(pe.p[me],B,Y,$,b,C,X,H,se),Y=ye.c,$=ye.lc;break}}if(me==pe.lit)throw new Error("THREE.EXRLoader: hufDecode issues")}}let ne=8-D&7;for(Y>>=ne,$-=ne;$>0;){let ge=d[Y<<14-$&16383];if(ge.len)$-=ge.len,ut(ge.lit,B,Y,$,b,C,X,H,se),Y=ye.c,$=ye.lc;else throw new Error("THREE.EXRLoader: hufDecode issues")}return!0}function Ke(v,d,b,C,D,B){let L={value:0},X=b.value,H=ve(d,b),Y=ve(d,b);b.value+=4;let $=ve(d,b);if(b.value+=4,H<0||H>=65537||Y<0||Y>=65537)throw new Error("THREE.EXRLoader: Something wrong with HUF_ENCSIZE");let se=new Array(65537),ee=new Array(16384);F(ee);let ne=C-(b.value-X);if(te(v,b,ne,H,Y,se),$>8*(C-(b.value-X)))throw new Error("THREE.EXRLoader: Something wrong with hufUncompress");ie(se,H,Y,ee),Ie(se,ee,v,b,$,Y,B,D,L)}function zt(v,d,b){for(let C=0;C<b;++C)d[C]=v[d[C]]}function it(v){for(let d=1;d<v.length;d++){let b=v[d-1]+v[d]-128;v[d]=b}}function ht(v,d){let b=0,C=Math.floor((v.length+1)/2),D=0,B=v.length-1;for(;!(D>B||(d[D++]=v[b++],D>B));)d[D++]=v[C++]}function At(v){let d=v.byteLength,b=new Array,C=0,D=new DataView(v);for(;d>0;){let B=D.getInt8(C++);if(B<0){let L=-B;d-=L+1;for(let X=0;X<L;X++)b.push(D.getUint8(C++))}else{let L=B;d-=2;let X=D.getUint8(C++);for(let H=0;H<L+1;H++)b.push(X)}}return b}function lt(v,d,b,C,D,B){let L=new DataView(B.buffer),X=b[v.idx[0]].width,H=b[v.idx[0]].height,Y=3,$=Math.floor(X/8),se=Math.ceil(X/8),ee=Math.ceil(H/8),ne=X-(se-1)*8,ge=H-(ee-1)*8,pe={value:0},me=new Array(Y),Se=new Array(Y),He=new Array(Y),fe=new Array(Y),qe=new Array(Y);for(let Me=0;Me<Y;++Me)qe[Me]=d[v.idx[Me]],me[Me]=Me<1?0:me[Me-1]+se*ee,Se[Me]=new Float32Array(64),He[Me]=new Uint16Array(64),fe[Me]=new Uint16Array(se*64);for(let Me=0;Me<ee;++Me){let Fe=8;Me==ee-1&&(Fe=ge);let ft=8;for(let De=0;De<se;++De){De==se-1&&(ft=ne);for(let ke=0;ke<Y;++ke)He[ke].fill(0),He[ke][0]=D[me[ke]++],Wt(pe,C,He[ke]),un(He[ke],Se[ke]),Bt(Se[ke]);Y==3&&Ht(Se);for(let ke=0;ke<Y;++ke)W(Se[ke],fe[ke],De*64)}let st=0;for(let De=0;De<Y;++De){let ke=b[v.idx[De]].type;for(let Ct=8*Me;Ct<8*Me+Fe;++Ct){st=qe[De][Ct];for(let ot=0;ot<$;++ot){let mt=ot*64+(Ct&7)*8;L.setUint16(st+0*ke,fe[De][mt+0],!0),L.setUint16(st+2*ke,fe[De][mt+1],!0),L.setUint16(st+4*ke,fe[De][mt+2],!0),L.setUint16(st+6*ke,fe[De][mt+3],!0),L.setUint16(st+8*ke,fe[De][mt+4],!0),L.setUint16(st+10*ke,fe[De][mt+5],!0),L.setUint16(st+12*ke,fe[De][mt+6],!0),L.setUint16(st+14*ke,fe[De][mt+7],!0),st+=16*ke}}if($!=se)for(let Ct=8*Me;Ct<8*Me+Fe;++Ct){let ot=qe[De][Ct]+8*$*2*ke,mt=$*64+(Ct&7)*8;for(let hn=0;hn<ft;++hn)L.setUint16(ot+hn*2*ke,fe[De][mt+hn],!0)}}}let xe=new Uint16Array(X);L=new DataView(B.buffer);for(let Me=0;Me<Y;++Me){b[v.idx[Me]].decoded=!0;let Fe=b[v.idx[Me]].type;if(b[Me].type==2)for(let ft=0;ft<H;++ft){let st=qe[Me][ft];for(let De=0;De<X;++De)xe[De]=L.getUint16(st+De*2*Fe,!0);for(let De=0;De<X;++De)L.setFloat32(st+De*2*Fe,j(xe[De]),!0)}}}function Ut(v,d,b,C,D,B){let L=new DataView(B.buffer),X=b[v],H=X.width,Y=X.height,$=Math.ceil(H/8),se=Math.ceil(Y/8),ee=Math.floor(H/8),ne=H-($-1)*8,ge=Y-(se-1)*8,pe={value:0},me=0,Se=new Float32Array(64),He=new Uint16Array(64),fe=new Uint16Array($*64);for(let qe=0;qe<se;++qe){let xe=8;qe==se-1&&(xe=ge);for(let Me=0;Me<$;++Me)He.fill(0),He[0]=D[me++],Wt(pe,C,He),un(He,Se),Bt(Se),W(Se,fe,Me*64);for(let Me=8*qe;Me<8*qe+xe;++Me){let Fe=d[v][Me];for(let ft=0;ft<ee;++ft){let st=ft*64+(Me&7)*8;for(let De=0;De<8;++De)L.setUint16(Fe+De*2*X.type,fe[st+De],!0);Fe+=16*X.type}if($!=ee){let ft=ee*64+(Me&7)*8;for(let st=0;st<ne;++st)L.setUint16(Fe+st*2*X.type,fe[ft+st],!0)}}}X.decoded=!0}function Wt(v,d,b){let C,D=1;for(;D<64;)C=d[v.value],C==65280?D=64:C>>8==255?D+=C&255:(b[D]=C,D++),v.value++}function un(v,d){d[0]=j(v[0]),d[1]=j(v[1]),d[2]=j(v[5]),d[3]=j(v[6]),d[4]=j(v[14]),d[5]=j(v[15]),d[6]=j(v[27]),d[7]=j(v[28]),d[8]=j(v[2]),d[9]=j(v[4]),d[10]=j(v[7]),d[11]=j(v[13]),d[12]=j(v[16]),d[13]=j(v[26]),d[14]=j(v[29]),d[15]=j(v[42]),d[16]=j(v[3]),d[17]=j(v[8]),d[18]=j(v[12]),d[19]=j(v[17]),d[20]=j(v[25]),d[21]=j(v[30]),d[22]=j(v[41]),d[23]=j(v[43]),d[24]=j(v[9]),d[25]=j(v[11]),d[26]=j(v[18]),d[27]=j(v[24]),d[28]=j(v[31]),d[29]=j(v[40]),d[30]=j(v[44]),d[31]=j(v[53]),d[32]=j(v[10]),d[33]=j(v[19]),d[34]=j(v[23]),d[35]=j(v[32]),d[36]=j(v[39]),d[37]=j(v[45]),d[38]=j(v[52]),d[39]=j(v[54]),d[40]=j(v[20]),d[41]=j(v[22]),d[42]=j(v[33]),d[43]=j(v[38]),d[44]=j(v[46]),d[45]=j(v[51]),d[46]=j(v[55]),d[47]=j(v[60]),d[48]=j(v[21]),d[49]=j(v[34]),d[50]=j(v[37]),d[51]=j(v[47]),d[52]=j(v[50]),d[53]=j(v[56]),d[54]=j(v[59]),d[55]=j(v[61]),d[56]=j(v[35]),d[57]=j(v[36]),d[58]=j(v[48]),d[59]=j(v[49]),d[60]=j(v[57]),d[61]=j(v[58]),d[62]=j(v[62]),d[63]=j(v[63])}function Bt(v){let d=.5*Math.cos(.7853975),b=.5*Math.cos(3.14159/16),C=.5*Math.cos(3.14159/8),D=.5*Math.cos(3*3.14159/16),B=.5*Math.cos(5*3.14159/16),L=.5*Math.cos(3*3.14159/8),X=.5*Math.cos(7*3.14159/16),H=new Array(4),Y=new Array(4),$=new Array(4),se=new Array(4);for(let ee=0;ee<8;++ee){let ne=ee*8;H[0]=C*v[ne+2],H[1]=L*v[ne+2],H[2]=C*v[ne+6],H[3]=L*v[ne+6],Y[0]=b*v[ne+1]+D*v[ne+3]+B*v[ne+5]+X*v[ne+7],Y[1]=D*v[ne+1]-X*v[ne+3]-b*v[ne+5]-B*v[ne+7],Y[2]=B*v[ne+1]-b*v[ne+3]+X*v[ne+5]+D*v[ne+7],Y[3]=X*v[ne+1]-B*v[ne+3]+D*v[ne+5]-b*v[ne+7],$[0]=d*(v[ne+0]+v[ne+4]),$[3]=d*(v[ne+0]-v[ne+4]),$[1]=H[0]+H[3],$[2]=H[1]-H[2],se[0]=$[0]+$[1],se[1]=$[3]+$[2],se[2]=$[3]-$[2],se[3]=$[0]-$[1],v[ne+0]=se[0]+Y[0],v[ne+1]=se[1]+Y[1],v[ne+2]=se[2]+Y[2],v[ne+3]=se[3]+Y[3],v[ne+4]=se[3]-Y[3],v[ne+5]=se[2]-Y[2],v[ne+6]=se[1]-Y[1],v[ne+7]=se[0]-Y[0]}for(let ee=0;ee<8;++ee)H[0]=C*v[16+ee],H[1]=L*v[16+ee],H[2]=C*v[48+ee],H[3]=L*v[48+ee],Y[0]=b*v[8+ee]+D*v[24+ee]+B*v[40+ee]+X*v[56+ee],Y[1]=D*v[8+ee]-X*v[24+ee]-b*v[40+ee]-B*v[56+ee],Y[2]=B*v[8+ee]-b*v[24+ee]+X*v[40+ee]+D*v[56+ee],Y[3]=X*v[8+ee]-B*v[24+ee]+D*v[40+ee]-b*v[56+ee],$[0]=d*(v[ee]+v[32+ee]),$[3]=d*(v[ee]-v[32+ee]),$[1]=H[0]+H[3],$[2]=H[1]-H[2],se[0]=$[0]+$[1],se[1]=$[3]+$[2],se[2]=$[3]-$[2],se[3]=$[0]-$[1],v[0+ee]=se[0]+Y[0],v[8+ee]=se[1]+Y[1],v[16+ee]=se[2]+Y[2],v[24+ee]=se[3]+Y[3],v[32+ee]=se[3]-Y[3],v[40+ee]=se[2]-Y[2],v[48+ee]=se[1]-Y[1],v[56+ee]=se[0]-Y[0]}function Ht(v){for(let d=0;d<64;++d){let b=v[0][d],C=v[1][d],D=v[2][d];v[0][d]=b+1.5747*D,v[1][d]=b-.1873*C-.4682*D,v[2][d]=b+1.8556*C}}function W(v,d,b){for(let C=0;C<64;++C)d[b+C]=vt.toHalfFloat(jt(v[C]))}function jt(v){return v<=1?Math.sign(v)*Math.pow(Math.abs(v),2.2):Math.sign(v)*Math.pow(R,Math.abs(v)-1)}function gt(v){return new DataView(v.array.buffer,v.offset.value,v.size)}function O(v){let d=v.viewer.buffer.slice(v.offset.value,v.offset.value+v.size),b=new Uint8Array(At(d)),C=new Uint8Array(b.length);return it(b),ht(b,C),new DataView(C.buffer)}function w(v){let d=v.array.slice(v.offset.value,v.offset.value+v.size),b=Ts(d),C=new Uint8Array(b.length);return it(b),ht(b,C),new DataView(C.buffer)}function Z(v){let d=v.viewer,b={value:v.offset.value},C=new Uint16Array(v.columns*v.lines*(v.inputChannels.length*v.type)),D=new Uint8Array(8192),B=0,L=new Array(v.inputChannels.length);for(let ge=0,pe=v.inputChannels.length;ge<pe;ge++)L[ge]={},L[ge].start=B,L[ge].end=L[ge].start,L[ge].nx=v.columns,L[ge].ny=v.lines,L[ge].size=v.type,B+=L[ge].nx*L[ge].ny*L[ge].size;let X=ae(d,b),H=ae(d,b);if(H>=8192)throw new Error("THREE.EXRLoader: Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");if(X<=H)for(let ge=0;ge<H-X+1;ge++)D[ge+X]=Ue(d,b);let Y=new Uint16Array(65536),$=N(D,Y),se=ve(d,b);Ke(v.array,d,b,se,C,B);for(let ge=0;ge<v.inputChannels.length;++ge){let pe=L[ge];for(let me=0;me<L[ge].size;++me)Ye(C,pe.start+me,pe.nx,pe.size,pe.ny,pe.nx*pe.size,$)}zt(Y,C,B);let ee=0,ne=new Uint8Array(C.buffer.byteLength);for(let ge=0;ge<v.lines;ge++)for(let pe=0;pe<v.inputChannels.length;pe++){let me=L[pe],Se=me.nx*me.size,He=new Uint8Array(C.buffer,me.end*2,Se*2);ne.set(He,ee),ee+=Se*2,me.end+=Se}return new DataView(ne.buffer)}function K(v){let d=v.array.slice(v.offset.value,v.offset.value+v.size),b=Ts(d),C=v.inputChannels.length*v.lines*v.columns*v.totalBytes,D=new ArrayBuffer(C),B=new DataView(D),L=0,X=0,H=new Array(4);for(let Y=0;Y<v.lines;Y++)for(let $=0;$<v.inputChannels.length;$++){let se=0;switch(v.inputChannels[$].pixelType){case 1:H[0]=L,H[1]=H[0]+v.columns,L=H[1]+v.columns;for(let ne=0;ne<v.columns;++ne){let ge=b[H[0]++]<<8|b[H[1]++];se+=ge,B.setUint16(X,se,!0),X+=2}break;case 2:H[0]=L,H[1]=H[0]+v.columns,H[2]=H[1]+v.columns,L=H[2]+v.columns;for(let ne=0;ne<v.columns;++ne){let ge=b[H[0]++]<<24|b[H[1]++]<<16|b[H[2]++]<<8;se+=ge,B.setUint32(X,se,!0),X+=4}break}}return B}function re(v){let d=v.array,b=v.offset.value,C=v.columns,D=v.lines,B=v.inputChannels,L=v.totalBytes,X=en.compression==="B44A_COMPRESSION",H=new Uint8Array(D*C*L),Y=new Uint16Array(16),$=0;for(let se=0;se<B.length;se++){let ee=B[se],ne=ee.pixelType*2,ge=Math.ceil(C/ee.xSampling),pe=Math.ceil(D/ee.ySampling),me=ee.xSampling===1&&ee.ySampling===1;if(ee.pixelType!==1){for(let fe=0;fe<pe;fe++)if(me){let qe=fe*C*L+$*C;for(let xe=0;xe<ge*ne;xe++)H[qe+xe]=d[b++]}else b+=ge*ne;$+=ne;continue}let Se=Math.ceil(ge/4),He=Math.ceil(pe/4);for(let fe=0;fe<He;fe++)for(let qe=0;qe<Se;qe++){if(X&&d[b+2]>=52){let xe=d[b]<<8|d[b+1],Me=xe&32768?xe&32767:~xe&65535;Y.fill(Me),b+=3}else{let xe=d[b]<<8|d[b+1],Me=d[b+2]>>2,Fe=32<<Me,ft=xe+((d[b+2]<<4|d[b+3]>>4)&63)*(1<<Me)-Fe&65535,st=ft+((d[b+3]<<2|d[b+4]>>6)&63)*(1<<Me)-Fe&65535,De=st+(d[b+4]&63)*(1<<Me)-Fe&65535,ke=xe+(d[b+5]>>2&63)*(1<<Me)-Fe&65535,Ct=ft+((d[b+5]<<4|d[b+6]>>4)&63)*(1<<Me)-Fe&65535,ot=st+((d[b+6]<<2|d[b+7]>>6)&63)*(1<<Me)-Fe&65535,mt=De+(d[b+7]&63)*(1<<Me)-Fe&65535,hn=ke+(d[b+8]>>2&63)*(1<<Me)-Fe&65535,li=Ct+((d[b+8]<<4|d[b+9]>>4)&63)*(1<<Me)-Fe&65535,Es=ot+((d[b+9]<<2|d[b+10]>>6)&63)*(1<<Me)-Fe&65535,Kn=mt+(d[b+10]&63)*(1<<Me)-Fe&65535,Ki=hn+(d[b+11]>>2&63)*(1<<Me)-Fe&65535,qo=li+((d[b+11]<<4|d[b+12]>>4)&63)*(1<<Me)-Fe&65535,Yo=Es+((d[b+12]<<2|d[b+13]>>6)&63)*(1<<Me)-Fe&65535,Zo=Kn+(d[b+13]&63)*(1<<Me)-Fe&65535,Rs=[xe,ke,hn,Ki,ft,Ct,li,qo,st,ot,Es,Yo,De,mt,Kn,Zo];for(let Tr=0;Tr<16;Tr++)Y[Tr]=Rs[Tr]&32768?Rs[Tr]&32767:~Rs[Tr]&65535;b+=14}if(ee.pLinear){if(P===null){P=new Uint16Array(65536);for(let xe=0;xe<65536;xe++)if((xe&31744)===31744||xe>32768)P[xe]=0;else{let Me=j(xe);P[xe]=Me<=0?0:vt.toHalfFloat(8*Math.log(Me))}}for(let xe=0;xe<16;xe++)Y[xe]=P[Y[xe]]}for(let xe=0;xe<4;xe++){let Me=fe*4+xe;if(!(Me>=pe))for(let Fe=0;Fe<4;Fe++){let ft=qe*4+Fe;if(ft>=ge)continue;let st=Y[xe*4+Fe];for(let De=0;De<ee.ySampling;De++){let ke=Me*ee.ySampling+De;if(!(ke>=D))for(let Ct=0;Ct<ee.xSampling;Ct++){let ot=ft*ee.xSampling+Ct;if(ot>=C)continue;let mt=ke*C*L+$*C+ot*2;H[mt]=st&255,H[mt+1]=st>>8&255}}}}}$+=2}return new DataView(H.buffer)}function _e(v){let d=v.viewer,b={value:v.offset.value},C=new Uint8Array(v.columns*v.lines*(v.inputChannels.length*v.type*2)),D={version:Ne(d,b),unknownUncompressedSize:Ne(d,b),unknownCompressedSize:Ne(d,b),acCompressedSize:Ne(d,b),dcCompressedSize:Ne(d,b),rleCompressedSize:Ne(d,b),rleUncompressedSize:Ne(d,b),rleRawSize:Ne(d,b),totalAcUncompressedCount:Ne(d,b),totalDcUncompressedCount:Ne(d,b),acCompression:Ne(d,b)};if(D.version<2)throw new Error("THREE.EXRLoader: "+en.compression+" version "+D.version+" is unsupported");let B=new Array,L=ae(d,b)-2;for(;L>0;){let pe=be(d.buffer,b),me=Ue(d,b),Se=me>>2&3,He=(me>>4)-1,fe=new Int8Array([He])[0],qe=Ue(d,b);B.push({name:pe,index:fe,type:qe,compression:Se}),L-=pe.length+3}let X=en.channels,H=new Array(v.inputChannels.length);for(let pe=0;pe<v.inputChannels.length;++pe){let me=H[pe]={},Se=X[pe];me.name=Se.name,me.compression=0,me.decoded=!1,me.type=Se.pixelType,me.pLinear=Se.pLinear,me.width=v.columns,me.height=v.lines}let Y={idx:new Array(3)};for(let pe=0;pe<v.inputChannels.length;++pe){let me=H[pe],Se=me.name.lastIndexOf("."),He=Se>=0?me.name.substring(Se+1):me.name;for(let fe=0;fe<B.length;++fe){let qe=B[fe];He===qe.name&&me.type===qe.type&&(me.compression=qe.compression,qe.index>=0&&(Y.idx[qe.index]=pe),me.offset=pe)}}let $,se,ee;if(D.acCompressedSize>0)switch(D.acCompression){case 0:$=new Uint16Array(D.totalAcUncompressedCount),Ke(v.array,d,b,D.acCompressedSize,$,D.totalAcUncompressedCount);break;case 1:let pe=v.array.slice(b.value,b.value+D.totalAcUncompressedCount),me=Ts(pe);$=new Uint16Array(me.buffer),b.value+=D.totalAcUncompressedCount;break}if(D.dcCompressedSize>0){let pe={array:v.array,offset:b,size:D.dcCompressedSize};se=new Uint16Array(w(pe).buffer),b.value+=D.dcCompressedSize}if(D.rleRawSize>0){let pe=v.array.slice(b.value,b.value+D.rleCompressedSize),me=Ts(pe);ee=At(me.buffer),b.value+=D.rleCompressedSize}let ne=0,ge=new Array(H.length);for(let pe=0;pe<ge.length;++pe)ge[pe]=new Array;for(let pe=0;pe<v.lines;++pe)for(let me=0;me<H.length;++me)ge[me].push(ne),ne+=H[me].width*v.type*2;Y.idx[0]!==void 0&&H[Y.idx[0]]&&lt(Y,ge,H,$,se,C);for(let pe=0;pe<H.length;++pe){let me=H[pe];if(!me.decoded)switch(me.compression){case 2:let Se=0,He=0;for(let fe=0;fe<v.lines;++fe){let qe=ge[pe][Se];for(let xe=0;xe<me.width;++xe){for(let Me=0;Me<2*me.type;++Me)C[qe++]=ee[He+Me*me.width*me.height];He++}Se++}break;case 1:Ut(pe,ge,H,$,se,C);break;default:throw new Error("THREE.EXRLoader: unsupported channel compression")}}return new DataView(C.buffer)}function be(v,d){let b=new Uint8Array(v),C=0;for(;b[d.value+C]!=0;)C+=1;let D=new TextDecoder().decode(b.slice(d.value,d.value+C));return d.value=d.value+C+1,D}function oe(v,d,b){let C=new TextDecoder().decode(new Uint8Array(v).slice(d.value,d.value+b));return d.value=d.value+b,C}function ue(v,d){let b=Le(v,d),C=ve(v,d);return[b,C]}function we(v,d){let b=ve(v,d),C=ve(v,d);return[b,C]}function Le(v,d){let b=v.getInt32(d.value,!0);return d.value=d.value+4,b}function ve(v,d){let b=v.getUint32(d.value,!0);return d.value=d.value+4,b}function Te(v,d){let b=v[d.value];return d.value=d.value+1,b}function Ue(v,d){let b=v.getUint8(d.value);return d.value=d.value+1,b}let Ne=function(v,d){let b=Number(v.getBigInt64(d.value,!0));return d.value+=8,b};function ze(v,d){let b=v.getFloat32(d.value,!0);return d.value+=4,b}function G(v,d){return vt.toHalfFloat(ze(v,d))}function j(v){let d=(v&31744)>>10,b=v&1023;return(v>>15?-1:1)*(d?d===31?b?NaN:1/0:Math.pow(2,d-15)*(1+b/1024):6103515625e-14*(b/1024))}function ae(v,d){let b=v.getUint16(d.value,!0);return d.value+=2,b}function Ae(v,d){return j(ae(v,d))}function Pe(v,d,b,C){let D=b.value,B=[];for(;b.value<D+C-1;){let L=be(d,b),X=Le(v,b),H=Ue(v,b);b.value+=3;let Y=Le(v,b),$=Le(v,b);B.push({name:L,pixelType:X,pLinear:H,xSampling:Y,ySampling:$})}return b.value+=1,B}function de(v,d){let b=ze(v,d),C=ze(v,d),D=ze(v,d),B=ze(v,d),L=ze(v,d),X=ze(v,d),H=ze(v,d),Y=ze(v,d);return{redX:b,redY:C,greenX:D,greenY:B,blueX:L,blueY:X,whiteX:H,whiteY:Y}}function Ve(v,d){let b=["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"],C=Ue(v,d);return b[C]}function Oe(v,d){let b=Le(v,d),C=Le(v,d),D=Le(v,d),B=Le(v,d);return{xMin:b,yMin:C,xMax:D,yMax:B}}function Pt(v,d){let b=["INCREASING_Y","DECREASING_Y","RANDOM_Y"],C=Ue(v,d);return b[C]}function yt(v,d){let b=["ENVMAP_LATLONG","ENVMAP_CUBE"],C=Ue(v,d);return b[C]}function In(v,d){let b=["ONE_LEVEL","MIPMAP_LEVELS","RIPMAP_LEVELS"],C=["ROUND_DOWN","ROUND_UP"],D=ve(v,d),B=ve(v,d),L=Ue(v,d);return{xSize:D,ySize:B,levelMode:b[L&15],roundingMode:C[L>>4]}}function Un(v,d){let b=ze(v,d),C=ze(v,d);return[b,C]}function qc(v,d){let b=ze(v,d),C=ze(v,d),D=ze(v,d);return[b,C,D]}function Yc(v,d,b,C,D){if(C==="string"||C==="stringvector"||C==="iccProfile")return oe(d,b,D);if(C==="chlist")return Pe(v,d,b,D);if(C==="chromaticities")return de(v,b);if(C==="compression")return Ve(v,b);if(C==="box2i")return Oe(v,b);if(C==="envmap")return yt(v,b);if(C==="tiledesc")return In(v,b);if(C==="lineOrder")return Pt(v,b);if(C==="float")return ze(v,b);if(C==="v2f")return Un(v,b);if(C==="v3f")return qc(v,b);if(C==="int")return Le(v,b);if(C==="rational")return ue(v,b);if(C==="timecode")return we(v,b);if(C==="preview"||C==="deepImageState"||C==="idmanifest")return b.value+=D,"skipped";b.value+=D}function Oo(v,d){let b=Math.log2(v);return d=="ROUND_DOWN"?Math.floor(b):Math.ceil(b)}function ws(v,d,b){let C=0;switch(v.levelMode){case"ONE_LEVEL":C=1;break;case"MIPMAP_LEVELS":C=Oo(Math.max(d,b),v.roundingMode)+1;break;case"RIPMAP_LEVELS":throw new Error("THREE.EXRLoader: RIPMAP_LEVELS tiles currently unsupported.")}return C}function zo(v,d,b,C){let D=new Array(v);for(let B=0;B<v;B++){let L=1<<B,X=d/L|0;C=="ROUND_UP"&&X*L<d&&(X+=1);let H=Math.max(X,1);D[B]=(H+b-1)/b|0}return D}function ko(){let v=this,d=v.offset,b={value:0};for(let C=0;C<v.tileCount;C++){let D=Le(v.viewer,d),B=Le(v.viewer,d);d.value+=8,v.size=ve(v.viewer,d);let L=D*v.blockWidth,X=B*v.blockHeight;v.columns=L+v.blockWidth>v.width?v.width-L:v.blockWidth,v.lines=X+v.blockHeight>v.height?v.height-X:v.blockHeight;let H=v.columns*v.totalBytes,$=v.size<v.lines*H?v.uncompress(v):gt(v);d.value+=v.size;for(let se=0;se<v.lines;se++){let ee=se*v.columns*v.totalBytes;for(let ne=0;ne<v.inputChannels.length;ne++){let ge=en.channels[ne].name,pe=v.channelByteOffsets[ge]*v.columns,me=v.decodeChannels[ge];if(me===void 0)continue;b.value=ee+pe;let Se=(v.height-(1+X+se))*v.outLineWidth;for(let He=0;He<v.columns;He++){let fe=Se+(He+L)*v.outputChannels+me;v.byteArray[fe]=v.getter($,b)}}}}}function Vo(){let v=this,d=v.offset,b={value:0};for(let C=0;C<v.height/v.blockHeight;C++){let D=Le(v.viewer,d)-en.dataWindow.yMin;v.size=ve(v.viewer,d),v.lines=D+v.blockHeight>v.height?v.height-D:v.blockHeight;let B=v.columns*v.totalBytes,X=v.size<v.lines*B?v.uncompress(v):gt(v);d.value+=v.size;for(let H=0;H<v.lines;H++){let Y=D+H,$=H*B,se=(v.height-1-Y)*v.outLineWidth;for(let ee=0;ee<v.inputChannels.length;ee++){let ne=en.channels[ee].name,ge=v.channelByteOffsets[ne]*v.columns,pe=v.decodeChannels[ne];if(pe!==void 0){b.value=$+ge;for(let me=0;me<v.columns;me++){let Se=se+me*v.outputChannels+pe;v.byteArray[Se]=v.getter(X,b)}}}}}}function oi(){let v=this,d=v.chunkOffsets,b={value:0};for(let C=0;C<d.length;C++){let D={value:d[C]};D.value+=4;let B=Le(v.viewer,D)-en.dataWindow.yMin;v.size=ve(v.viewer,D),v.lines=B+v.blockHeight>v.height?v.height-B:v.blockHeight;let L=v.columns*v.totalBytes,X=v.size<v.lines*L,H=v.offset;v.offset=D;let Y=X?v.uncompress(v):gt(v);v.offset=H;for(let $=0;$<v.lines;$++){let se=B+$,ee=$*L,ne=(v.height-1-se)*v.outLineWidth;for(let ge=0;ge<v.inputChannels.length;ge++){let pe=en.channels[ge].name,me=v.channelByteOffsets[pe]*v.columns,Se=v.decodeChannels[pe];if(Se!==void 0){b.value=ee+me;for(let He=0;He<v.columns;He++){let fe=ne+He*v.outputChannels+Se;v.byteArray[fe]=v.getter(Y,b)}}}}}}function Sr(v,d,b,C){if(b===0)return null;let D=v.slice(d,d+b);switch(C){case"NO_COMPRESSION":return new DataView(D.buffer,D.byteOffset,D.byteLength);case"RLE_COMPRESSION":{let B=new Uint8Array(At(D.buffer.slice(D.byteOffset,D.byteOffset+D.byteLength))),L=new Uint8Array(B.length);return it(B),ht(B,L),new DataView(L.buffer)}case"ZIPS_COMPRESSION":{let B=Ts(D),L=new Uint8Array(B.length);return it(B),ht(B,L),new DataView(L.buffer)}default:throw new Error("THREE.EXRLoader: "+C+" is unsupported for deep data")}}function Ho(){let v=this,d=v.chunkOffsets,b=v.width,C=v.height,D=v.deepChannels,B=en.compression,L=v.multiPart,X=v.decodeChannels,H=v.outputChannels,Y=v.byteArray instanceof Uint16Array,$=-1;for(let se=0;se<D.length;se++)if(D[se].name==="A"){$=se;break}for(let se=0;se<d.length;se++){let ee={value:d[se]};L&&(ee.value+=4);let ne=Le(v.viewer,ee)-en.dataWindow.yMin,ge=Ne(v.viewer,ee),pe=Ne(v.viewer,ee);Ne(v.viewer,ee);let me=Sr(v.array,ee.value,ge,B);if(ee.value+=ge,me===null)continue;let Se=new Uint32Array(b);for(let Fe=0;Fe<b;Fe++)Se[Fe]=me.getUint32(Fe*4,!0);let He=Se[b-1];if(He===0){ee.value+=pe;continue}let fe=Sr(v.array,ee.value,pe,B),qe=[],xe=0;for(let Fe=0;Fe<D.length;Fe++)qe.push(xe),xe+=He*D[Fe].bytesPerSample;let Me=(C-1-ne)*v.outLineWidth;for(let Fe=0;Fe<b;Fe++){let ft=Fe===0?0:Se[Fe-1],De=Se[Fe]-ft;if(De===0)continue;let ke=new Float32Array(H),Ct=0;for(let mt=0;mt<De;mt++){let hn=ft+mt,li=1-Ct;if(li<=0)break;let Es=1;if($>=0){let Kn=D[$].bytesPerSample,Ki=qe[$]+hn*Kn;Es=Kn===2?j(fe.getUint16(Ki,!0)):fe.getFloat32(Ki,!0)}for(let Kn=0;Kn<D.length;Kn++){let Ki=D[Kn],qo=X[Ki.name];if(qo===void 0)continue;let Yo=Ki.bytesPerSample,Zo=qe[Kn]+hn*Yo,Rs=Yo===2?j(fe.getUint16(Zo,!0)):fe.getFloat32(Zo,!0);ke[qo]+=Rs*li}Ct+=Es*li}X.A!==void 0&&(ke[X.A]=Ct);let ot=Me+Fe*H;for(let mt=0;mt<H;mt++)v.byteArray[ot+mt]=Y?vt.toHalfFloat(ke[mt]):ke[mt]}}}function As(v,d,b){let C={},D=!1;for(;;){let B=be(d,b);if(B==="")break;D=!0;let L=be(d,b),X=ve(v,b),H=Yc(v,d,b,L,X);H===void 0?console.warn(`THREE.EXRLoader: Skipped unknown header attribute type '${L}'.`):C[B]=H}return D?C:null}function br(v,d,b){if(v.getUint32(0,!0)!=20000630)throw new Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");let C=v.getUint8(4),D=v.getUint8(5),B={singleTile:!!(D&2),longName:!!(D&4),deepFormat:!!(D&8),multiPart:!!(D&16)};b.value=8;let L=[];if(B.multiPart){for(;;){let X=As(v,d,b);if(X===null)break;X.version=C,X.spec=B,L.push(X)}if(L.length===0)throw new Error("THREE.EXRLoader: No valid part headers found.")}else{let X=As(v,d,b);X.version=C,X.spec=B,L.push(X)}return L}function Go(v,d,b,C,D,B){let L={size:0,viewer:d,array:b,offset:C,width:v.dataWindow.xMax-v.dataWindow.xMin+1,height:v.dataWindow.yMax-v.dataWindow.yMin+1,inputChannels:v.channels,channelByteOffsets:{},shouldExpand:!1,yCbCr:!1,totalBytes:null,columns:null,lines:null,type:null,uncompress:null,getter:null,format:null,colorSpace:fn};switch(v.compression){case"NO_COMPRESSION":L.blockHeight=1,L.uncompress=gt;break;case"RLE_COMPRESSION":L.blockHeight=1,L.uncompress=O;break;case"ZIPS_COMPRESSION":L.blockHeight=1,L.uncompress=w;break;case"ZIP_COMPRESSION":L.blockHeight=16,L.uncompress=w;break;case"PIZ_COMPRESSION":L.blockHeight=32,L.uncompress=Z;break;case"PXR24_COMPRESSION":L.blockHeight=16,L.uncompress=K;break;case"B44_COMPRESSION":case"B44A_COMPRESSION":L.blockHeight=32,L.uncompress=re;break;case"DWAA_COMPRESSION":L.blockHeight=32,L.uncompress=_e;break;case"DWAB_COMPRESSION":L.blockHeight=256,L.uncompress=_e;break;default:throw new Error("THREE.EXRLoader: "+v.compression+" is unsupported")}let X={};for(let ee of v.channels)switch(ee.name){case"BY":case"RY":case"Y":case"R":case"G":case"B":case"A":X[ee.name]=!0,L.type=ee.pixelType}let H=!1,Y=!1;if(X.Y&&X.RY&&X.BY)L.outputChannels=4,L.yCbCr=!0;else if(X.R&&X.G&&X.B)L.outputChannels=4;else if(X.Y)L.outputChannels=1;else throw new Error("THREE.EXRLoader: file contains unsupported data channels.");switch(L.outputChannels){case 4:B==Ge?(H=!X.A,L.format=Ge,L.colorSpace=fn,L.outputChannels=4,L.decodeChannels={R:0,G:1,B:2,A:3}):B==ln?(L.format=ln,L.colorSpace=fn,L.outputChannels=2,L.decodeChannels={R:0,G:1}):B==Tn?(L.format=Tn,L.colorSpace=fn,L.outputChannels=1,L.decodeChannels={R:0}):Y=!0;break;case 1:B==Ge?(H=!0,L.format=Ge,L.colorSpace=fn,L.outputChannels=4,L.shouldExpand=!0,L.decodeChannels={Y:0}):B==ln?(L.format=ln,L.colorSpace=fn,L.outputChannels=2,L.shouldExpand=!0,L.decodeChannels={Y:0}):B==Tn?(L.format=Tn,L.colorSpace=fn,L.outputChannels=1,L.decodeChannels={Y:0}):Y=!0;break;default:Y=!0}if(Y)throw new Error("THREE.EXRLoader: invalid output format for specified file.");if(L.yCbCr&&(L.format=Ge,L.outputChannels=4,L.decodeChannels={Y:0,RY:1,BY:2},H=!0),L.type==1)switch(D){case et:L.getter=Ae;break;case ct:L.getter=ae;break}else if(L.type==2)switch(D){case et:L.getter=ze;break;case ct:L.getter=G}else throw new Error("THREE.EXRLoader: unsupported pixelType "+L.type+" for "+v.compression+".");L.columns=L.width;let $=L.width*L.height*L.outputChannels;switch(D){case et:L.byteArray=new Float32Array($),H&&L.byteArray.fill(1,0,$);break;case ct:L.byteArray=new Uint16Array($),H&&L.byteArray.fill(15360,0,$);break;default:console.error("THREE.EXRLoader: unsupported type: ",D);break}let se=0;for(let ee of v.channels)L.decodeChannels[ee.name]!==void 0&&(L.channelByteOffsets[ee.name]=se),se+=ee.pixelType*2;if(L.totalBytes=se,L.outLineWidth=L.width*L.outputChannels,v.spec.deepFormat){L.deepChannels=[];let ee=0;for(let ne of v.channels){let ge=ne.pixelType===0?4:ne.pixelType*2;L.deepChannels.push({name:ne.name,pixelType:ne.pixelType,bytesPerSample:ge}),ee+=ge}L.deepBytesPerSample=ee,L.chunkOffsets=v._chunkOffsets,L.multiPart=v.spec.multiPart,L.decode=Ho.bind(L)}else if(v.spec.singleTile){L.blockHeight=v.tiles.ySize,L.blockWidth=v.tiles.xSize;let ee=ws(v.tiles,L.width,L.height),ne=zo(ee,L.width,v.tiles.xSize,v.tiles.roundingMode),ge=zo(ee,L.height,v.tiles.ySize,v.tiles.roundingMode);L.tileCount=ne[0]*ge[0];for(let pe=0;pe<ee;pe++)for(let me=0;me<ge[pe];me++)for(let Se=0;Se<ne[pe];Se++)Ne(d,C);L.decode=ko.bind(L)}else if(v.spec.multiPart)L.blockWidth=L.width,L.chunkOffsets=v._chunkOffsets,L.decode=oi.bind(L);else{L.blockWidth=L.width;let ee=Math.ceil(L.height/L.blockHeight);for(let ne=0;ne<ee;ne++)Ne(d,C);L.decode=Vo.bind(L)}return L}let ai={value:0},Ji=new DataView(e),Wo=new Uint8Array(e),Mr=br(Ji,e,ai),Xo=Math.max(0,Math.min(this.part,Mr.length-1)),en=Mr[Xo];if(en.spec.multiPart||en.spec.deepFormat)for(let v=0;v<Mr.length;v++){let d=Mr[v].chunkCount;if(v===Xo){en._chunkOffsets=[];for(let b=0;b<d;b++)en._chunkOffsets.push(Ne(Ji,ai))}else for(let b=0;b<d;b++)Ne(Ji,ai)}let An=Go(en,Ji,Wo,ai,this.type,this.outputFormat);if(An.decode(),An.shouldExpand){let v=An.byteArray;if(this.outputFormat==Ge)for(let d=0;d<v.length;d+=4)v[d+2]=v[d+1]=v[d];else if(this.outputFormat==ln)for(let d=0;d<v.length;d+=2)v[d+1]=v[d]}if(An.yCbCr){let v=An.byteArray,d=An.width*An.height;if(this.type===ct)for(let b=0;b<d;b++){let C=b*4,D=j(v[C]),B=j(v[C+1]),L=j(v[C+2]),X=(1+B)*D,H=(1+L)*D,Y=(D-X*.2126-H*.0722)/.7152;v[C]=vt.toHalfFloat(Math.max(0,X)),v[C+1]=vt.toHalfFloat(Math.max(0,Y)),v[C+2]=vt.toHalfFloat(Math.max(0,H))}else for(let b=0;b<d;b++){let C=b*4,D=v[C],B=v[C+1],L=v[C+2],X=(1+B)*D,H=(1+L)*D;v[C]=Math.max(0,X),v[C+1]=Math.max(0,(D-X*.2126-H*.0722)/.7152),v[C+2]=Math.max(0,H)}}return{header:en,width:An.width,height:An.height,data:An.byteArray,format:An.format,colorSpace:An.colorSpace,type:this.type,minFilter:nt,magFilter:nt,generateMipmaps:!1,flipY:!1}}setDataType(e){return this.type=e,this}setOutputFormat(e){return this.outputFormat=e,this}setPart(e){return this.part=e,this}};var LS={WebGLRenderer:Fl,Scene:ir,Group:gi,Mesh:sn,BufferGeometry:Lt,BufferAttribute:xt,MeshPhysicalMaterial:Zs,MeshStandardMaterial:Yr,DataTexture:It,Color:Je,Matrix4:Ze,Vector2:Be,Vector3:k,PlaneGeometry:sr,CircleGeometry:qs,LatheGeometry:Ys,RGBAFormat:Ge,FloatType:et,HalfFloatType:ct,LinearFilter:nt,EquirectangularReflectionMapping:ni,RepeatWrapping:rn,ClampToEdgeWrapping:Dt,DoubleSide:xn,FrontSide:bn,SRGBColorSpace:_n,LinearSRGBColorSpace:fn,NoToneMapping:Mn,ACESFilmicToneMapping:io,ReinhardToneMapping:to,CineonToneMapping:no,AgXToneMapping:ro,NeutralToneMapping:so,REVISION:"186"};return Om(FS);})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

three/examples/jsm/libs/fflate.module.js:
  (*!
  fflate - fast JavaScript compression/decompression
  <https://101arrowz.github.io/fflate>
  Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
  version 0.8.2
  *)
*/
