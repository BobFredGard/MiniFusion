/* miniFusion — atelier RENDU, moteur « Lancer de rayons » : bibliothèque empaquetée (script classique → window.RDPT).
   three 0.186.1 (MIT, Three.js Authors) · three-mesh-bvh 0.9.16 (MIT, Garrett Johnson) · three-gpu-pathtracer 0.0.27 (MIT, Garrett Johnson) · HDRLoader, EXRLoader et fflate (MIT) pour les images HDRI.
   Fichier GÉNÉRÉ par tools/rendu-rayons-entree.mjs (voir l’en-tête de ce fichier) : ne pas éditer. */
var RDPT=(()=>{var tu=Object.defineProperty;var ig=Object.getOwnPropertyDescriptor;var rg=Object.getOwnPropertyNames;var sg=Object.prototype.hasOwnProperty;var mf=(i,e)=>{for(var t in e)tu(i,t,{get:e[t],enumerable:!0})},og=(i,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of rg(e))!sg.call(i,r)&&r!==t&&tu(i,r,{get:()=>e[r],enumerable:!(n=ig(e,r))||n.enumerable});return i};var ag=i=>og(tu({},"__esModule",{value:!0}),i);var ob={};mf(ob,{EXRLoader:()=>Qc,HDRLoader:()=>$c,PhysicalCamera:()=>ws,THREE:()=>sb,WebGLPathTracer:()=>Zc,zipSync:()=>ng});var Bf=0,Lu=1,Of=2;var io=1,zf=2,es=3,Tn=0,Jt=1,_n=2,Kt=0,ii=1,ro=2,Fu=3,Nu=4,kf=5;var dr=100,Vf=101,Hf=102,Gf=103,Wf=104,Xf=200,qf=201,Yf=202,Zf=203,Uu=204,Bu=205,$f=206,Jf=207,Kf=208,Qf=209,jf=210,ed=211,td=212,nd=213,id=214,ba=0,Ma=1,Ta=2,qr=3,wa=4,Aa=5,Ea=6,Ra=7,Ou=0,rd=1,sd=2,wn=0,zu=1,so=2,oo=3,ao=4,ku=5,lo=6,co=7;var Vu=300,Vi=301,pr=302,ri=303,Qa=304,uo=306,sn=1e3,Lt=1001,Ca=1002,je=1003,od=1004;var ho=1005;var st=1006,ja=1007;var Mi=1008,Hu=1008,an=1009,ts=1010,fo=1011,Hi=1012,Gi=1013,ln=1014,nt=1015,ut=1016,el=1017,tl=1018,ns=1020,Gu=35902,Wu=35899,Xu=1021,qu=1022,Xe=1023,ti=1026,Wi=1027,An=1028,is=1029,cn=1030,Xi=1031;var qi=1033,po=33776,mo=33777,go=33778,xo=33779,nl=35840,il=35841,rl=35842,sl=35843,ol=36196,al=37492,ll=37496,cl=37488,ul=37489,vo=37490,hl=37491,fl=37808,dl=37809,pl=37810,ml=37811,gl=37812,xl=37813,vl=37814,_l=37815,yl=37816,Sl=37817,bl=37818,Ml=37819,Tl=37820,wl=37821,Al=36492,El=36494,Rl=36495,Cl=36283,Il=36284,_o=36285,Pl=36286;var Os=2300,Ia=2301,ya=2302,wu=2303,Au=2400,Eu=2401,Ru=2402;var ad=3200;var Dl=0,ld=1,Ti="",Sn="srgb",dn="srgb-linear",zs="linear",Et="srgb";var Sa=7680;var cd=519,ud=512,hd=513,fd=514,Ll=515,dd=516,pd=517,Fl=518,md=519,gd=35044;var Yu="300 es",$n=2e3,ks=2001;function lg(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function cg(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Vs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function xd(){let i=Vs("canvas");return i.style.display="block",i}var gf={},Yr=null;function Zu(...i){let e="THREE."+i.shift();Yr?Yr("log",e,...i):console.log(e,...i)}function vd(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function qe(...i){i=vd(i);let e="THREE."+i.shift();if(Yr)Yr("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Je(...i){i=vd(i);let e="THREE."+i.shift();if(Yr)Yr("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Fi(...i){let e=i.join(" ");e in gf||(gf[e]=!0,qe(...i))}function _d(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}var yd={[ba]:Ma,[Ta]:Ea,[wa]:Ra,[qr]:Aa,[Ma]:ba,[Ea]:Ta,[Ra]:wa,[Aa]:qr},ni=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},gn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var nu=Math.PI/180,Pa=180/Math.PI;function yo(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(gn[i&255]+gn[i>>8&255]+gn[i>>16&255]+gn[i>>24&255]+"-"+gn[e&255]+gn[e>>8&255]+"-"+gn[e>>16&15|64]+gn[e>>24&255]+"-"+gn[t&63|128]+gn[t>>8&255]+"-"+gn[t>>16&255]+gn[t>>24&255]+gn[n&255]+gn[n>>8&255]+gn[n>>16&255]+gn[n>>24&255]).toLowerCase()}function rt(i,e,t){return Math.max(e,Math.min(t,i))}function ug(i,e){return(i%e+e)%e}function iu(i,e,t){return(1-t)*i+t*e}function Ls(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Cn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ju=class ju{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=rt(this.x,e.x,t.x),this.y=rt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=rt(this.x,e,t),this.y=rt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(rt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ju.prototype.isVector2=!0;var Oe=ju,Hn=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],u=n[r+1],f=n[r+2],h=n[r+3],c=s[o+0],d=s[o+1],x=s[o+2],b=s[o+3];if(h!==b||l!==c||u!==d||f!==x){let p=l*c+u*d+f*x+h*b;p<0&&(c=-c,d=-d,x=-x,b=-b,p=-p);let g=1-a;if(p<.9995){let S=Math.acos(p),w=Math.sin(S);g=Math.sin(g*S)/w,a=Math.sin(a*S)/w,l=l*g+c*a,u=u*g+d*a,f=f*g+x*a,h=h*g+b*a}else{l=l*g+c*a,u=u*g+d*a,f=f*g+x*a,h=h*g+b*a;let S=1/Math.sqrt(l*l+u*u+f*f+h*h);l*=S,u*=S,f*=S,h*=S}}e[t]=l,e[t+1]=u,e[t+2]=f,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],u=n[r+2],f=n[r+3],h=s[o],c=s[o+1],d=s[o+2],x=s[o+3];return e[t]=a*x+f*h+l*d-u*c,e[t+1]=l*x+f*c+u*h-a*d,e[t+2]=u*x+f*d+a*c-l*h,e[t+3]=f*x-a*h-l*c-u*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,u=a(n/2),f=a(r/2),h=a(s/2),c=l(n/2),d=l(r/2),x=l(s/2);switch(o){case"XYZ":this._x=c*f*h+u*d*x,this._y=u*d*h-c*f*x,this._z=u*f*x+c*d*h,this._w=u*f*h-c*d*x;break;case"YXZ":this._x=c*f*h+u*d*x,this._y=u*d*h-c*f*x,this._z=u*f*x-c*d*h,this._w=u*f*h+c*d*x;break;case"ZXY":this._x=c*f*h-u*d*x,this._y=u*d*h+c*f*x,this._z=u*f*x+c*d*h,this._w=u*f*h-c*d*x;break;case"ZYX":this._x=c*f*h-u*d*x,this._y=u*d*h+c*f*x,this._z=u*f*x-c*d*h,this._w=u*f*h+c*d*x;break;case"YZX":this._x=c*f*h+u*d*x,this._y=u*d*h+c*f*x,this._z=u*f*x-c*d*h,this._w=u*f*h-c*d*x;break;case"XZY":this._x=c*f*h-u*d*x,this._y=u*d*h-c*f*x,this._z=u*f*x+c*d*h,this._w=u*f*h+c*d*x;break;default:qe("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],u=t[2],f=t[6],h=t[10],c=n+a+h;if(c>0){let d=.5/Math.sqrt(c+1);this._w=.25/d,this._x=(f-l)*d,this._y=(s-u)*d,this._z=(o-r)*d}else if(n>a&&n>h){let d=2*Math.sqrt(1+n-a-h);this._w=(f-l)/d,this._x=.25*d,this._y=(r+o)/d,this._z=(s+u)/d}else if(a>h){let d=2*Math.sqrt(1+a-n-h);this._w=(s-u)/d,this._x=(r+o)/d,this._y=.25*d,this._z=(l+f)/d}else{let d=2*Math.sqrt(1+h-n-a);this._w=(o-r)/d,this._x=(s+u)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(rt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,u=t._z,f=t._w;return this._x=n*f+o*a+r*u-s*l,this._y=r*f+o*l+s*a-n*u,this._z=s*f+o*u+n*l-r*a,this._w=o*f-n*a-r*l-s*u,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,r=-r,s=-s,o=-o,a=-a);let l=1-t;if(a<.9995){let u=Math.acos(a),f=Math.sin(u);l=Math.sin(l*u)/f,t=Math.sin(t*u)/f,this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},eh=class eh{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(xf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(xf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,u=2*(o*r-a*n),f=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*u+o*h-a*f,this.y=n+l*f+a*u-s*h,this.z=r+l*h+s*f-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=rt(this.x,e.x,t.x),this.y=rt(this.y,e.y,t.y),this.z=rt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=rt(this.x,e,t),this.y=rt(this.y,e,t),this.z=rt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(rt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ru.copy(this).projectOnVector(e),this.sub(ru)}reflect(e){return this.sub(ru.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};eh.prototype.isVector3=!0;var k=eh,ru=new k,xf=new Hn,th=class th{constructor(e,t,n,r,s,o,a,l,u){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,u)}set(e,t,n,r,s,o,a,l,u){let f=this.elements;return f[0]=e,f[1]=r,f[2]=a,f[3]=t,f[4]=s,f[5]=l,f[6]=n,f[7]=o,f[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],u=n[1],f=n[4],h=n[7],c=n[2],d=n[5],x=n[8],b=r[0],p=r[3],g=r[6],S=r[1],w=r[4],y=r[7],T=r[2],E=r[5],C=r[8];return s[0]=o*b+a*S+l*T,s[3]=o*p+a*w+l*E,s[6]=o*g+a*y+l*C,s[1]=u*b+f*S+h*T,s[4]=u*p+f*w+h*E,s[7]=u*g+f*y+h*C,s[2]=c*b+d*S+x*T,s[5]=c*p+d*w+x*E,s[8]=c*g+d*y+x*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],f=e[8];return t*o*f-t*a*u-n*s*f+n*a*l+r*s*u-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],f=e[8],h=f*o-a*u,c=a*l-f*s,d=u*s-o*l,x=t*h+n*c+r*d;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/x;return e[0]=h*b,e[1]=(r*u-f*n)*b,e[2]=(a*n-r*o)*b,e[3]=c*b,e[4]=(f*t-r*l)*b,e[5]=(r*s-a*t)*b,e[6]=d*b,e[7]=(n*l-u*t)*b,e[8]=(o*t-n*s)*b,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),u=Math.sin(s);return this.set(n*l,n*u,-n*(l*o+u*a)+o+e,-r*u,r*l,-r*(-u*o+l*a)+a+t,0,0,1),this}scale(e,t){return Fi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(su.makeScale(e,t)),this}rotate(e){return Fi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(su.makeRotation(-e)),this}translate(e,t){return Fi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(su.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};th.prototype.isMatrix3=!0;var tt=th,su=new tt,vf=new tt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_f=new tt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hg(){let i={enabled:!0,workingColorSpace:dn,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===Et&&(r.r=yi(r.r),r.g=yi(r.g),r.b=yi(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Et&&(r.r=Xr(r.r),r.g=Xr(r.g),r.b=Xr(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ti?zs:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return Fi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return Fi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[dn]:{primaries:e,whitePoint:n,transfer:zs,toXYZ:vf,fromXYZ:_f,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Sn},outputColorSpaceConfig:{drawingBufferColorSpace:Sn}},[Sn]:{primaries:e,whitePoint:n,transfer:Et,toXYZ:vf,fromXYZ:_f,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Sn}}}),i}var dt=hg();function yi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Xr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ir,Da=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ir===void 0&&(Ir=Vs("canvas")),Ir.width=e.width,Ir.height=e.height;let r=Ir.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=Ir}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Vs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=yi(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(yi(t[n]/255)*255):t[n]=yi(t[n]);return{data:t,width:e.width,height:e.height}}else return qe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},fg=0,lr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:fg++}),this.uuid=yo(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(ou(r[o].image)):s.push(ou(r[o]))}else s=ou(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function ou(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Da.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(qe("Texture: Unable to serialize Texture."),{})}var Hs=class extends lr{constructor(e=null){Fi('Source: "Source" has been renamed to "TextureSource". Please update your code to use "THREE.TextureSource" instead.'),super(e),this.isSource=!0}},dg=0,au=new k,In=class i extends ni{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Lt,r=Lt,s=st,o=Mi,a=Xe,l=an,u=i.DEFAULT_ANISOTROPY,f=Ti){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dg++}),this.uuid=yo(),this.name="",this.source=new lr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(au).x}get height(){return this.source.getSize(au).y}get depth(){return this.source.getSize(au).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){qe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){qe(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case sn:e.x=e.x-Math.floor(e.x);break;case Lt:e.x=e.x<0?0:1;break;case Ca:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case sn:e.y=e.y-Math.floor(e.y);break;case Lt:e.y=e.y<0?0:1;break;case Ca:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};In.DEFAULT_IMAGE=null;In.DEFAULT_MAPPING=Vu;In.DEFAULT_ANISOTROPY=1;var nh=class nh{constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,u=l[0],f=l[4],h=l[8],c=l[1],d=l[5],x=l[9],b=l[2],p=l[6],g=l[10];if(Math.abs(f-c)<.01&&Math.abs(h-b)<.01&&Math.abs(x-p)<.01){if(Math.abs(f+c)<.1&&Math.abs(h+b)<.1&&Math.abs(x+p)<.1&&Math.abs(u+d+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(u+1)/2,y=(d+1)/2,T=(g+1)/2,E=(f+c)/4,C=(h+b)/4,_=(x+p)/4;return w>y&&w>T?w<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(w),r=E/n,s=C/n):y>T?y<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),n=E/r,s=_/r):T<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(T),n=C/s,r=_/s),this.set(n,r,s,t),this}let S=Math.sqrt((p-x)*(p-x)+(h-b)*(h-b)+(c-f)*(c-f));return Math.abs(S)<.001&&(S=1),this.x=(p-x)/S,this.y=(h-b)/S,this.z=(c-f)/S,this.w=Math.acos((u+d+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=rt(this.x,e.x,t.x),this.y=rt(this.y,e.y,t.y),this.z=rt(this.z,e.z,t.z),this.w=rt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=rt(this.x,e,t),this.y=rt(this.y,e,t),this.z=rt(this.z,e,t),this.w=rt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(rt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};nh.prototype.isVector4=!0;var bt=nh,La=class extends ni{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:st,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t),this.textures=[];let r={width:e,height:t,depth:n.depth},s=new In(r),o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:st,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new lr(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},kt=class extends La{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ni=class extends In{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=je,this.minFilter=je,this.wrapR=Lt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Gs=class extends kt{constructor(e=1,t=1,n=1,r={}){super(e,t,r),this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new Ni(null,e,t,n),this._setTextureOptions(r),this.texture.isRenderTargetTexture=!0}},Fa=class extends In{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=je,this.minFilter=je,this.wrapR=Lt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Ka=class Ka{constructor(e,t,n,r,s,o,a,l,u,f,h,c,d,x,b,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,u,f,h,c,d,x,b,p)}set(e,t,n,r,s,o,a,l,u,f,h,c,d,x,b,p){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=s,g[5]=o,g[9]=a,g[13]=l,g[2]=u,g[6]=f,g[10]=h,g[14]=c,g[3]=d,g[7]=x,g[11]=b,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ka().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Pr.setFromMatrixColumn(e,0).length(),s=1/Pr.setFromMatrixColumn(e,1).length(),o=1/Pr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),u=Math.sin(r),f=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let c=o*f,d=o*h,x=a*f,b=a*h;t[0]=l*f,t[4]=-l*h,t[8]=u,t[1]=d+x*u,t[5]=c-b*u,t[9]=-a*l,t[2]=b-c*u,t[6]=x+d*u,t[10]=o*l}else if(e.order==="YXZ"){let c=l*f,d=l*h,x=u*f,b=u*h;t[0]=c+b*a,t[4]=x*a-d,t[8]=o*u,t[1]=o*h,t[5]=o*f,t[9]=-a,t[2]=d*a-x,t[6]=b+c*a,t[10]=o*l}else if(e.order==="ZXY"){let c=l*f,d=l*h,x=u*f,b=u*h;t[0]=c-b*a,t[4]=-o*h,t[8]=x+d*a,t[1]=d+x*a,t[5]=o*f,t[9]=b-c*a,t[2]=-o*u,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let c=o*f,d=o*h,x=a*f,b=a*h;t[0]=l*f,t[4]=x*u-d,t[8]=c*u+b,t[1]=l*h,t[5]=b*u+c,t[9]=d*u-x,t[2]=-u,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let c=o*l,d=o*u,x=a*l,b=a*u;t[0]=l*f,t[4]=b-c*h,t[8]=x*h+d,t[1]=h,t[5]=o*f,t[9]=-a*f,t[2]=-u*f,t[6]=d*h+x,t[10]=c-b*h}else if(e.order==="XZY"){let c=o*l,d=o*u,x=a*l,b=a*u;t[0]=l*f,t[4]=-h,t[8]=u*f,t[1]=c*h+b,t[5]=o*f,t[9]=d*h-x,t[2]=x*h-d,t[6]=a*f,t[10]=b*h+c}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(pg,e,mg)}lookAt(e,t,n){let r=this.elements;return Fn.subVectors(e,t),Fn.lengthSq()===0&&(Fn.z=1),Fn.normalize(),Ci.crossVectors(n,Fn),Ci.lengthSq()===0&&(Math.abs(n.z)===1?Fn.x+=1e-4:Fn.z+=1e-4,Fn.normalize(),Ci.crossVectors(n,Fn)),Ci.normalize(),ea.crossVectors(Fn,Ci),r[0]=Ci.x,r[4]=ea.x,r[8]=Fn.x,r[1]=Ci.y,r[5]=ea.y,r[9]=Fn.y,r[2]=Ci.z,r[6]=ea.z,r[10]=Fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],u=n[12],f=n[1],h=n[5],c=n[9],d=n[13],x=n[2],b=n[6],p=n[10],g=n[14],S=n[3],w=n[7],y=n[11],T=n[15],E=r[0],C=r[4],_=r[8],R=r[12],I=r[1],F=r[5],L=r[9],O=r[13],N=r[2],V=r[6],W=r[10],J=r[14],ce=r[3],K=r[7],ie=r[11],re=r[15];return s[0]=o*E+a*I+l*N+u*ce,s[4]=o*C+a*F+l*V+u*K,s[8]=o*_+a*L+l*W+u*ie,s[12]=o*R+a*O+l*J+u*re,s[1]=f*E+h*I+c*N+d*ce,s[5]=f*C+h*F+c*V+d*K,s[9]=f*_+h*L+c*W+d*ie,s[13]=f*R+h*O+c*J+d*re,s[2]=x*E+b*I+p*N+g*ce,s[6]=x*C+b*F+p*V+g*K,s[10]=x*_+b*L+p*W+g*ie,s[14]=x*R+b*O+p*J+g*re,s[3]=S*E+w*I+y*N+T*ce,s[7]=S*C+w*F+y*V+T*K,s[11]=S*_+w*L+y*W+T*ie,s[15]=S*R+w*O+y*J+T*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],u=e[13],f=e[2],h=e[6],c=e[10],d=e[14],x=e[3],b=e[7],p=e[11],g=e[15],S=l*d-u*c,w=a*d-u*h,y=a*c-l*h,T=o*d-u*f,E=o*c-l*f,C=o*h-a*f;return t*(b*S-p*w+g*y)-n*(x*S-p*T+g*E)+r*(x*w-b*T+g*C)-s*(x*y-b*E+p*C)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[1],o=e[5],a=e[9],l=e[2],u=e[6],f=e[10];return t*(o*f-a*u)-n*(s*f-a*l)+r*(s*u-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],u=e[7],f=e[8],h=e[9],c=e[10],d=e[11],x=e[12],b=e[13],p=e[14],g=e[15],S=t*a-n*o,w=t*l-r*o,y=t*u-s*o,T=n*l-r*a,E=n*u-s*a,C=r*u-s*l,_=f*b-h*x,R=f*p-c*x,I=f*g-d*x,F=h*p-c*b,L=h*g-d*b,O=c*g-d*p,N=S*O-w*L+y*F+T*I-E*R+C*_;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/N;return e[0]=(a*O-l*L+u*F)*V,e[1]=(r*L-n*O-s*F)*V,e[2]=(b*C-p*E+g*T)*V,e[3]=(c*E-h*C-d*T)*V,e[4]=(l*I-o*O-u*R)*V,e[5]=(t*O-r*I+s*R)*V,e[6]=(p*y-x*C-g*w)*V,e[7]=(f*C-c*y+d*w)*V,e[8]=(o*L-a*I+u*_)*V,e[9]=(n*I-t*L-s*_)*V,e[10]=(x*E-b*y+g*S)*V,e[11]=(h*y-f*E-d*S)*V,e[12]=(a*R-o*F-l*_)*V,e[13]=(t*F-n*R+r*_)*V,e[14]=(b*w-x*T-p*S)*V,e[15]=(f*T-h*w+c*S)*V,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,u=s*o,f=s*a;return this.set(u*o+n,u*a-r*l,u*l+r*a,0,u*a+r*l,f*a+n,f*l-r*o,0,u*l-r*a,f*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,u=s+s,f=o+o,h=a+a,c=s*u,d=s*f,x=s*h,b=o*f,p=o*h,g=a*h,S=l*u,w=l*f,y=l*h,T=n.x,E=n.y,C=n.z;return r[0]=(1-(b+g))*T,r[1]=(d+y)*T,r[2]=(x-w)*T,r[3]=0,r[4]=(d-y)*E,r[5]=(1-(c+g))*E,r[6]=(p+S)*E,r[7]=0,r[8]=(x+w)*C,r[9]=(p-S)*C,r[10]=(1-(c+b))*C,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let s=this.determinantAffine();if(s===0)return n.set(1,1,1),t.identity(),this;let o=Pr.set(r[0],r[1],r[2]).length(),a=Pr.set(r[4],r[5],r[6]).length(),l=Pr.set(r[8],r[9],r[10]).length();s<0&&(o=-o),qn.copy(this);let u=1/o,f=1/a,h=1/l;return qn.elements[0]*=u,qn.elements[1]*=u,qn.elements[2]*=u,qn.elements[4]*=f,qn.elements[5]*=f,qn.elements[6]*=f,qn.elements[8]*=h,qn.elements[9]*=h,qn.elements[10]*=h,t.setFromRotationMatrix(qn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,r,s,o,a=$n,l=!1){let u=this.elements,f=2*s/(t-e),h=2*s/(n-r),c=(t+e)/(t-e),d=(n+r)/(n-r),x,b;if(l)x=s/(o-s),b=o*s/(o-s);else if(a===$n)x=-(o+s)/(o-s),b=-2*o*s/(o-s);else if(a===ks)x=-o/(o-s),b=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return u[0]=f,u[4]=0,u[8]=c,u[12]=0,u[1]=0,u[5]=h,u[9]=d,u[13]=0,u[2]=0,u[6]=0,u[10]=x,u[14]=b,u[3]=0,u[7]=0,u[11]=-1,u[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=$n,l=!1){let u=this.elements,f=2/(t-e),h=2/(n-r),c=-(t+e)/(t-e),d=-(n+r)/(n-r),x,b;if(l)x=1/(o-s),b=o/(o-s);else if(a===$n)x=-2/(o-s),b=-(o+s)/(o-s);else if(a===ks)x=-1/(o-s),b=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return u[0]=f,u[4]=0,u[8]=0,u[12]=c,u[1]=0,u[5]=h,u[9]=0,u[13]=d,u[2]=0,u[6]=0,u[10]=x,u[14]=b,u[3]=0,u[7]=0,u[11]=0,u[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Ka.prototype.isMatrix4=!0;var $e=Ka,Pr=new k,qn=new $e,pg=new k(0,0,0),mg=new k(1,1,1),Ci=new k,ea=new k,Fn=new k,yf=new $e,Sf=new Hn,Si=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],u=r[5],f=r[9],h=r[2],c=r[6],d=r[10];switch(t){case"XYZ":this._y=Math.asin(rt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(c,u),this._z=0);break;case"YXZ":this._x=Math.asin(-rt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(rt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-rt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(c,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(rt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,u),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-rt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(c,u),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-f,d),this._y=0);break;default:qe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return yf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(yf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Sf.setFromEuler(this),this.setFromQuaternion(Sf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Si.DEFAULT_ORDER="XYZ";var Ws=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},gg=0,bf=new k,Dr=new Hn,fi=new $e,ta=new k,Fs=new k,xg=new k,vg=new Hn,Mf=new k(1,0,0),Tf=new k(0,1,0),wf=new k(0,0,1),Af={type:"added"},_g={type:"removed"},Lr={type:"childadded",child:null},lu={type:"childremoved",child:null},Gn=class i extends ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gg++}),this.uuid=yo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new k,t=new Si,n=new Hn,r=new k(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new $e},normalMatrix:{value:new tt}}),this.matrix=new $e,this.matrixWorld=new $e,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ws,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Dr.setFromAxisAngle(e,t),this.quaternion.multiply(Dr),this}rotateOnWorldAxis(e,t){return Dr.setFromAxisAngle(e,t),this.quaternion.premultiply(Dr),this}rotateX(e){return this.rotateOnAxis(Mf,e)}rotateY(e){return this.rotateOnAxis(Tf,e)}rotateZ(e){return this.rotateOnAxis(wf,e)}translateOnAxis(e,t){return bf.copy(e).applyQuaternion(this.quaternion),this.position.add(bf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Mf,e)}translateY(e){return this.translateOnAxis(Tf,e)}translateZ(e){return this.translateOnAxis(wf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(fi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ta.copy(e):ta.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?fi.lookAt(Fs,ta,this.up):fi.lookAt(ta,Fs,this.up),this.quaternion.setFromRotationMatrix(fi),r&&(fi.extractRotation(r.matrixWorld),Dr.setFromRotationMatrix(fi),this.quaternion.premultiply(Dr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Je("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Af),Lr.child=e,this.dispatchEvent(Lr),Lr.child=null):Je("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(_g),lu.child=e,this.dispatchEvent(lu),lu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),fi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),fi.multiply(e.parent.matrixWorld)),e.applyMatrix4(fi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Af),Lr.child=e,this.dispatchEvent(Lr),Lr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fs,e,xg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fs,vg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*n-s[8]*r,s[13]+=n-s[1]*t-s[5]*n-s[9]*r,s[14]+=r-s[2]*t-s[6]*n-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let u=0,f=l.length;u<f;u++){let h=l[u];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,u=this.material.length;l<u;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),u=o(e.textures),f=o(e.images),h=o(e.shapes),c=o(e.skeletons),d=o(e.animations),x=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),u.length>0&&(n.textures=u),f.length>0&&(n.images=f),h.length>0&&(n.shapes=h),c.length>0&&(n.skeletons=c),d.length>0&&(n.animations=d),x.length>0&&(n.nodes=x)}return n.object=r,n;function o(a){let l=[];for(let u in a){let f=a[u];delete f.metadata,l.push(f)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Gn.DEFAULT_UP=new k(0,1,0);Gn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _i=class extends Gn{constructor(){super(),this.isGroup=!0,this.type="Group"}},yg={type:"move"},Zr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _i,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _i,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _i,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(let b of e.hand.values()){let p=t.getJointPose(b,n),g=this._getHandJoint(u,b);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let f=u.joints["index-finger-tip"],h=u.joints["thumb-tip"],c=f.position.distanceTo(h.position),d=.02,x=.005;u.inputState.pinching&&c>d+x?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&c<=d-x&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(yg)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new _i;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Sd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ii={h:0,s:0,l:0},na={h:0,s:0,l:0};function cu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ke=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Sn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,dt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=dt.workingColorSpace){if(e=ug(e,1),t=rt(t,0,1),n=rt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=cu(o,s,e+1/3),this.g=cu(o,s,e),this.b=cu(o,s,e-1/3)}return dt.colorSpaceToWorking(this,r),this}setStyle(e,t=Sn){function n(s){s!==void 0&&parseFloat(s)<1&&qe("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:qe("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);qe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Sn){let n=Sd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):qe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yi(e.r),this.g=yi(e.g),this.b=yi(e.b),this}copyLinearToSRGB(e){return this.r=Xr(e.r),this.g=Xr(e.g),this.b=Xr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Sn){return dt.workingToColorSpace(xn.copy(this),e),Math.round(rt(xn.r*255,0,255))*65536+Math.round(rt(xn.g*255,0,255))*256+Math.round(rt(xn.b*255,0,255))}getHexString(e=Sn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.workingToColorSpace(xn.copy(this),t);let n=xn.r,r=xn.g,s=xn.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,u,f=(a+o)/2;if(a===o)l=0,u=0;else{let h=o-a;switch(u=f<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=u,e.l=f,e}getRGB(e,t=dt.workingColorSpace){return dt.workingToColorSpace(xn.copy(this),t),e.r=xn.r,e.g=xn.g,e.b=xn.b,e}getStyle(e=Sn){dt.workingToColorSpace(xn.copy(this),e);let t=xn.r,n=xn.g,r=xn.b;return e!==Sn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Ii),this.setHSL(Ii.h+e,Ii.s+t,Ii.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ii),e.getHSL(na);let n=iu(Ii.h,na.h,t),r=iu(Ii.s,na.s,t),s=iu(Ii.l,na.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},xn=new Ke;Ke.NAMES=Sd;var cr=class extends Gn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Si,this.environmentIntensity=1,this.environmentRotation=new Si,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Yn=new k,di=new k,uu=new k,pi=new k,Fr=new k,Nr=new k,Ef=new k,hu=new k,fu=new k,du=new k,pu=new bt,mu=new bt,gu=new bt,vn=class i{constructor(e=new k,t=new k,n=new k){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Yn.subVectors(e,t),r.cross(Yn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Yn.subVectors(r,t),di.subVectors(n,t),uu.subVectors(e,t);let o=Yn.dot(Yn),a=Yn.dot(di),l=Yn.dot(uu),u=di.dot(di),f=di.dot(uu),h=o*u-a*a;if(h===0)return s.set(0,0,0),null;let c=1/h,d=(u*l-a*f)*c,x=(o*f-a*l)*c;return s.set(1-d-x,x,d)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,pi)===null?!1:pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,pi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,pi.x),l.addScaledVector(o,pi.y),l.addScaledVector(a,pi.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return pu.setScalar(0),mu.setScalar(0),gu.setScalar(0),pu.fromBufferAttribute(e,t),mu.fromBufferAttribute(e,n),gu.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(pu,s.x),o.addScaledVector(mu,s.y),o.addScaledVector(gu,s.z),o}static isFrontFacing(e,t,n,r){return Yn.subVectors(n,t),di.subVectors(e,t),Yn.cross(di).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Yn.subVectors(this.c,this.b),di.subVectors(this.a,this.b),Yn.cross(di).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;Fr.subVectors(r,n),Nr.subVectors(s,n),hu.subVectors(e,n);let l=Fr.dot(hu),u=Nr.dot(hu);if(l<=0&&u<=0)return t.copy(n);fu.subVectors(e,r);let f=Fr.dot(fu),h=Nr.dot(fu);if(f>=0&&h<=f)return t.copy(r);let c=l*h-f*u;if(c<=0&&l>=0&&f<=0)return o=l/(l-f),t.copy(n).addScaledVector(Fr,o);du.subVectors(e,s);let d=Fr.dot(du),x=Nr.dot(du);if(x>=0&&d<=x)return t.copy(s);let b=d*u-l*x;if(b<=0&&u>=0&&x<=0)return a=u/(u-x),t.copy(n).addScaledVector(Nr,a);let p=f*x-d*h;if(p<=0&&h-f>=0&&d-x>=0)return Ef.subVectors(s,r),a=(h-f)/(h-f+(d-x)),t.copy(r).addScaledVector(Ef,a);let g=1/(p+b+c);return o=b*g,a=c*g,t.copy(n).addScaledVector(Fr,o).addScaledVector(Nr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Vt=class{constructor(e=new k(1/0,1/0,1/0),t=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Zn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Zn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Zn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Zn):Zn.fromBufferAttribute(s,o),Zn.applyMatrix4(e.matrixWorld),this.expandByPoint(Zn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ia.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ia.copy(n.boundingBox)),ia.applyMatrix4(e.matrixWorld),this.union(ia)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zn),Zn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ns),ra.subVectors(this.max,Ns),Ur.subVectors(e.a,Ns),Br.subVectors(e.b,Ns),Or.subVectors(e.c,Ns),Pi.subVectors(Br,Ur),Di.subVectors(Or,Br),rr.subVectors(Ur,Or);let t=[0,-Pi.z,Pi.y,0,-Di.z,Di.y,0,-rr.z,rr.y,Pi.z,0,-Pi.x,Di.z,0,-Di.x,rr.z,0,-rr.x,-Pi.y,Pi.x,0,-Di.y,Di.x,0,-rr.y,rr.x,0];return!xu(t,Ur,Br,Or,ra)||(t=[1,0,0,0,1,0,0,0,1],!xu(t,Ur,Br,Or,ra))?!1:(sa.crossVectors(Pi,Di),t=[sa.x,sa.y,sa.z],xu(t,Ur,Br,Or,ra))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(mi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},mi=[new k,new k,new k,new k,new k,new k,new k,new k],Zn=new k,ia=new Vt,Ur=new k,Br=new k,Or=new k,Pi=new k,Di=new k,rr=new k,Ns=new k,ra=new k,sa=new k,sr=new k;function xu(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){sr.fromArray(i,s);let a=r.x*Math.abs(sr.x)+r.y*Math.abs(sr.y)+r.z*Math.abs(sr.z),l=e.dot(sr),u=t.dot(sr),f=n.dot(sr);if(Math.max(-Math.max(l,u,f),Math.min(l,u,f))>a)return!1}return!0}var vi=Sg();function Sg(){let i=new ArrayBuffer(4),e=new Float32Array(i),t=new Uint32Array(i),n=new Uint32Array(512),r=new Uint32Array(512);for(let l=0;l<256;++l){let u=l-127;u<-27?(n[l]=0,n[l|256]=32768,r[l]=24,r[l|256]=24):u<-14?(n[l]=1024>>-u-14,n[l|256]=1024>>-u-14|32768,r[l]=-u-1,r[l|256]=-u-1):u<=15?(n[l]=u+15<<10,n[l|256]=u+15<<10|32768,r[l]=13,r[l|256]=13):u<128?(n[l]=31744,n[l|256]=64512,r[l]=24,r[l|256]=24):(n[l]=31744,n[l|256]=64512,r[l]=13,r[l|256]=13)}let s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let u=l<<13,f=0;for(;(u&8388608)===0;)u<<=1,f-=8388608;u&=-8388609,f+=947912704,s[l]=u|f}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:r,mantissaTable:s,exponentTable:o,offsetTable:a}}function bg(i){Math.abs(i)>65504&&qe("DataUtils.toHalfFloat(): Value out of range."),i=rt(i,-65504,65504),vi.floatView[0]=i;let e=vi.uint32View[0],t=e>>23&511;return vi.baseTable[t]+((e&8388607)>>vi.shiftTable[t])}function Mg(i){let e=i>>10;return vi.uint32View[0]=vi.mantissaTable[vi.offsetTable[e]+(i&1023)]+vi.exponentTable[e],vi.floatView[0]}var vt=class{static toHalfFloat(e){return bg(e)}static fromHalfFloat(e){return Mg(e)}},Zt=new k,oa=new Oe,Tg=0,xt=class extends ni{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Tg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=gd,this.updateRanges=[],this.gpuType=nt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)oa.fromBufferAttribute(this,t),oa.applyMatrix3(e),this.setXY(t,oa.x,oa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Zt.fromBufferAttribute(this,t),Zt.applyMatrix3(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Zt.fromBufferAttribute(this,t),Zt.applyMatrix4(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Zt.fromBufferAttribute(this,t),Zt.applyNormalMatrix(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Zt.fromBufferAttribute(this,t),Zt.transformDirection(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ls(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Cn(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ls(t,this.array)),t}setX(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ls(t,this.array)),t}setY(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ls(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ls(t,this.array)),t}setW(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),n=Cn(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),n=Cn(n,this.array),r=Cn(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),n=Cn(n,this.array),r=Cn(r,this.array),s=Cn(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Xs=class extends xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var qs=class extends xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Yt=class extends xt{constructor(e,t,n){super(new Float32Array(e),t,n)}},wg=new Vt,Us=new k,vu=new k,$r=class{constructor(e=new k,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):wg.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Us.subVectors(e,this.center);let t=Us.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Us,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(vu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Us.copy(e.center).add(vu)),this.expandByPoint(Us.copy(e.center).sub(vu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ag=0,Vn=new $e,_u=new Gn,zr=new k,Nn=new Vt,Bs=new Vt,nn=new k,Ft=class i extends ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ag++}),this.uuid=yo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(lg(e)?qs:Xs)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new tt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Vn.makeRotationFromQuaternion(e),this.applyMatrix4(Vn),this}rotateX(e){return Vn.makeRotationX(e),this.applyMatrix4(Vn),this}rotateY(e){return Vn.makeRotationY(e),this.applyMatrix4(Vn),this}rotateZ(e){return Vn.makeRotationZ(e),this.applyMatrix4(Vn),this}translate(e,t,n){return Vn.makeTranslation(e,t,n),this.applyMatrix4(Vn),this}scale(e,t,n){return Vn.makeScale(e,t,n),this.applyMatrix4(Vn),this}lookAt(e){return _u.lookAt(e),_u.updateMatrix(),this.applyMatrix4(_u.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(zr).negate(),this.translate(zr.x,zr.y,zr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Yt(n,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&qe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Vt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];Nn.setFromBufferAttribute(s),this.morphTargetsRelative?(nn.addVectors(this.boundingBox.min,Nn.min),this.boundingBox.expandByPoint(nn),nn.addVectors(this.boundingBox.max,Nn.max),this.boundingBox.expandByPoint(nn)):(this.boundingBox.expandByPoint(Nn.min),this.boundingBox.expandByPoint(Nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new $r);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(e){let n=this.boundingSphere.center;if(Nn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Bs.setFromBufferAttribute(a),this.morphTargetsRelative?(nn.addVectors(Nn.min,Bs.min),Nn.expandByPoint(nn),nn.addVectors(Nn.max,Bs.max),Nn.expandByPoint(nn)):(Nn.expandByPoint(Bs.min),Nn.expandByPoint(Bs.max))}Nn.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)nn.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(nn));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let u=0,f=a.count;u<f;u++)nn.fromBufferAttribute(a,u),l&&(zr.fromBufferAttribute(e,u),nn.add(zr)),r=Math.max(r,n.distanceToSquared(nn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,r=t.normal,s=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new xt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<n.count;_++)a[_]=new k,l[_]=new k;let u=new k,f=new k,h=new k,c=new Oe,d=new Oe,x=new Oe,b=new k,p=new k;function g(_,R,I){u.fromBufferAttribute(n,_),f.fromBufferAttribute(n,R),h.fromBufferAttribute(n,I),c.fromBufferAttribute(s,_),d.fromBufferAttribute(s,R),x.fromBufferAttribute(s,I),f.sub(u),h.sub(u),d.sub(c),x.sub(c);let F=1/(d.x*x.y-x.x*d.y);isFinite(F)&&(b.copy(f).multiplyScalar(x.y).addScaledVector(h,-d.y).multiplyScalar(F),p.copy(h).multiplyScalar(d.x).addScaledVector(f,-x.x).multiplyScalar(F),a[_].add(b),a[R].add(b),a[I].add(b),l[_].add(p),l[R].add(p),l[I].add(p))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let _=0,R=S.length;_<R;++_){let I=S[_],F=I.start,L=I.count;for(let O=F,N=F+L;O<N;O+=3)g(e.getX(O+0),e.getX(O+1),e.getX(O+2))}let w=new k,y=new k,T=new k,E=new k;function C(_){T.fromBufferAttribute(r,_),E.copy(T);let R=a[_];w.copy(R),w.sub(T.multiplyScalar(T.dot(R))).normalize(),y.crossVectors(E,R);let F=y.dot(l[_])<0?-1:1;o.setXYZW(_,w.x,w.y,w.z,F)}for(let _=0,R=S.length;_<R;++_){let I=S[_],F=I.start,L=I.count;for(let O=F,N=F+L;O<N;O+=3)C(e.getX(O+0)),C(e.getX(O+1)),C(e.getX(O+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let c=0,d=n.count;c<d;c++)n.setXYZ(c,0,0,0);let r=new k,s=new k,o=new k,a=new k,l=new k,u=new k,f=new k,h=new k;if(e)for(let c=0,d=e.count;c<d;c+=3){let x=e.getX(c+0),b=e.getX(c+1),p=e.getX(c+2);r.fromBufferAttribute(t,x),s.fromBufferAttribute(t,b),o.fromBufferAttribute(t,p),f.subVectors(o,s),h.subVectors(r,s),f.cross(h),a.fromBufferAttribute(n,x),l.fromBufferAttribute(n,b),u.fromBufferAttribute(n,p),a.add(f),l.add(f),u.add(f),n.setXYZ(x,a.x,a.y,a.z),n.setXYZ(b,l.x,l.y,l.z),n.setXYZ(p,u.x,u.y,u.z)}else for(let c=0,d=t.count;c<d;c+=3)r.fromBufferAttribute(t,c+0),s.fromBufferAttribute(t,c+1),o.fromBufferAttribute(t,c+2),f.subVectors(o,s),h.subVectors(r,s),f.cross(h),n.setXYZ(c+0,f.x,f.y,f.z),n.setXYZ(c+1,f.x,f.y,f.z),n.setXYZ(c+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)nn.fromBufferAttribute(e,t),nn.normalize(),e.setXYZ(t,nn.x,nn.y,nn.z)}toNonIndexed(){function e(a,l){let u=a.array,f=a.itemSize,h=a.normalized,c=new u.constructor(l.length*f),d=0,x=0;for(let b=0,p=l.length;b<p;b++){a.isInterleavedBufferAttribute?d=l[b]*a.data.stride+a.offset:d=l[b]*f;for(let g=0;g<f;g++)c[x++]=u[d++]}return new xt(c,f,h)}if(this.index===null)return qe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],u=e(l,n);t.setAttribute(a,u)}let s=this.morphAttributes;for(let a in s){let l=[],u=s[a];for(let f=0,h=u.length;f<h;f++){let c=u[f],d=e(c,n);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let u=o[a];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let u=n[l];e.data.attributes[l]=u.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let u=this.morphAttributes[l],f=[];for(let h=0,c=u.length;h<c;h++){let d=u[h];f.push(d.toJSON(e.data))}f.length>0&&(r[l]=f,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let u in r){let f=r[u];this.setAttribute(u,f.clone(t))}let s=e.morphAttributes;for(let u in s){let f=[],h=s[u];for(let c=0,d=h.length;c<d;c++)f.push(h[c].clone(t));this.morphAttributes[u]=f}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let u=0,f=o.length;u<f;u++){let h=o[u];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var yu=new k,Eg=new k,Rg=new tt,bn=class{constructor(e=new k(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=yu.subVectors(n,t).cross(Eg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(yu),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/s;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(r,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Rg.getNormalMatrix(e),r=this.coplanarPoint(yu).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Cg=0,Ui=class extends ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Cg++}),this.uuid=yo(),this.name="",this.type="Material",this.blending=ii,this.side=Tn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Uu,this.blendDst=Bu,this.blendEquation=dr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ke(0,0,0),this.blendAlpha=0,this.depthFunc=qr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=cd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Sa,this.stencilZFail=Sa,this.stencilZPass=Sa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){qe(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){qe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new bn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var gi=new k,Su=new k,aa=new k,la=new k,Jr=class{constructor(e=new k,t=new k(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,gi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=gi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(gi.copy(this.origin).addScaledVector(this.direction,t),gi.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Su.copy(e).add(t).multiplyScalar(.5),aa.copy(t).sub(e).normalize(),la.copy(this.origin).sub(Su);let s=e.distanceTo(t)*.5,o=-this.direction.dot(aa),a=la.dot(this.direction),l=-la.dot(aa),u=la.lengthSq(),f=Math.abs(1-o*o),h,c,d,x;if(f>0)if(h=o*l-a,c=o*a-l,x=s*f,h>=0)if(c>=-x)if(c<=x){let b=1/f;h*=b,c*=b,d=h*(h+o*c+2*a)+c*(o*h+c+2*l)+u}else c=s,h=Math.max(0,-(o*c+a)),d=-h*h+c*(c+2*l)+u;else c=-s,h=Math.max(0,-(o*c+a)),d=-h*h+c*(c+2*l)+u;else c<=-x?(h=Math.max(0,-(-o*s+a)),c=h>0?-s:Math.min(Math.max(-s,-l),s),d=-h*h+c*(c+2*l)+u):c<=x?(h=0,c=Math.min(Math.max(-s,-l),s),d=c*(c+2*l)+u):(h=Math.max(0,-(o*s+a)),c=h>0?s:Math.min(Math.max(-s,-l),s),d=-h*h+c*(c+2*l)+u);else c=o>0?-s:s,h=Math.max(0,-(o*c+a)),d=-h*h+c*(c+2*l)+u;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Su).addScaledVector(aa,c),d}intersectSphere(e,t){if(e.radius<0)return null;gi.subVectors(e.center,this.origin);let n=gi.dot(this.direction),r=gi.dot(gi)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,u=1/this.direction.x,f=1/this.direction.y,h=1/this.direction.z,c=this.origin;return u>=0?(n=(e.min.x-c.x)*u,r=(e.max.x-c.x)*u):(n=(e.max.x-c.x)*u,r=(e.min.x-c.x)*u),f>=0?(s=(e.min.y-c.y)*f,o=(e.max.y-c.y)*f):(s=(e.max.y-c.y)*f,o=(e.min.y-c.y)*f),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-c.z)*h,l=(e.max.z-c.z)*h):(a=(e.max.z-c.z)*h,l=(e.min.z-c.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,gi)!==null}intersectTriangle(e,t,n,r,s){let o=this.origin,a=this.direction,l=a.x,u=a.y,f=a.z,h=e.x-o.x,c=e.y-o.y,d=e.z-o.z,x=t.x-o.x,b=t.y-o.y,p=t.z-o.z,g=n.x-o.x,S=n.y-o.y,w=n.z-o.z,y=Math.abs(l),T=Math.abs(u),E=Math.abs(f),C,_,R,I,F,L,O,N,V,W,J,ce;if(y>=T&&y>=E?(R=l,L=h,V=x,ce=g,l>=0?(C=u,_=f,I=c,F=d,O=b,N=p,W=S,J=w):(C=f,_=u,I=d,F=c,O=p,N=b,W=w,J=S)):T>=E?(R=u,L=c,V=b,ce=S,u>=0?(C=f,_=l,I=d,F=h,O=p,N=x,W=w,J=g):(C=l,_=f,I=h,F=d,O=x,N=p,W=g,J=w)):(R=f,L=d,V=p,ce=w,f>=0?(C=l,_=u,I=h,F=c,O=x,N=b,W=g,J=S):(C=u,_=l,I=c,F=h,O=b,N=x,W=S,J=g)),R===0)return null;let K=C/R,ie=_/R,re=1/R,Te=I-K*L,ve=F-ie*L,Qe=O-K*V,Ue=N-ie*V,et=W-K*ce,Q=J-ie*ce,le=et*Ue-Q*Qe,Re=Te*Q-ve*et,We=Qe*ve-Ue*Te;if(r){if(le<0||Re<0||We<0)return null}else if((le<0||Re<0||We<0)&&(le>0||Re>0||We>0))return null;let Ce=le+Re+We;if(Ce===0)return null;let Ye=re*(le*L+Re*V+We*ce);return(Ce>0?Ye<0:Ye>0)?null:this.at(Ye/Ce,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ur=class extends Ui{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Si,this.combine=Ou,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Rf=new $e,or=new Jr,ca=new $r,Cf=new k,ua=new k,ha=new k,fa=new k,bu=new k,da=new k,If=new k,pa=new k,on=class extends Gn{constructor(e=new Ft,t=new ur){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){da.set(0,0,0);for(let l=0,u=s.length;l<u;l++){let f=a[l],h=s[l];f!==0&&(bu.fromBufferAttribute(h,e),o?da.addScaledVector(bu,f):da.addScaledVector(bu.sub(t),f))}t.add(da)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ca.copy(n.boundingSphere),ca.applyMatrix4(s),or.copy(e.ray).recast(e.near),!(ca.containsPoint(or.origin)===!1&&(or.intersectSphere(ca,Cf)===null||or.origin.distanceToSquared(Cf)>(e.far-e.near)**2))&&(Rf.copy(s).invert(),or.copy(e.ray).applyMatrix4(Rf),!(n.boundingBox!==null&&or.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,or)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,u=s.attributes.uv,f=s.attributes.uv1,h=s.attributes.normal,c=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let x=0,b=c.length;x<b;x++){let p=c[x],g=o[p.materialIndex],S=Math.max(p.start,d.start),w=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let y=S,T=w;y<T;y+=3){let E=a.getX(y),C=a.getX(y+1),_=a.getX(y+2);r=ma(this,g,e,n,u,f,h,E,C,_),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let x=Math.max(0,d.start),b=Math.min(a.count,d.start+d.count);for(let p=x,g=b;p<g;p+=3){let S=a.getX(p),w=a.getX(p+1),y=a.getX(p+2);r=ma(this,o,e,n,u,f,h,S,w,y),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let x=0,b=c.length;x<b;x++){let p=c[x],g=o[p.materialIndex],S=Math.max(p.start,d.start),w=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let y=S,T=w;y<T;y+=3){let E=y,C=y+1,_=y+2;r=ma(this,g,e,n,u,f,h,E,C,_),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let x=Math.max(0,d.start),b=Math.min(l.count,d.start+d.count);for(let p=x,g=b;p<g;p+=3){let S=p,w=p+1,y=p+2;r=ma(this,o,e,n,u,f,h,S,w,y),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function Ig(i,e,t,n,r,s,o,a){let l;if(e.side===Jt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Tn,a),l===null)return null;pa.copy(a),pa.applyMatrix4(i.matrixWorld);let u=t.ray.origin.distanceTo(pa);return u<t.near||u>t.far?null:{distance:u,point:pa.clone(),object:i}}function ma(i,e,t,n,r,s,o,a,l,u){i.getVertexPosition(a,ua),i.getVertexPosition(l,ha),i.getVertexPosition(u,fa);let f=Ig(i,e,t,n,ua,ha,fa,If);if(f){let h=new k;vn.getBarycoord(If,ua,ha,fa,h),r&&(f.uv=vn.getInterpolatedAttribute(r,a,l,u,h,new Oe)),s&&(f.uv1=vn.getInterpolatedAttribute(s,a,l,u,h,new Oe)),o&&(f.normal=vn.getInterpolatedAttribute(o,a,l,u,h,new k),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));let c={a,b:l,c:u,normal:new k,materialIndex:0};vn.getNormal(ua,ha,fa,c.normal),f.face=c,f.barycoord=h}return f}var It=class extends In{constructor(e=null,t=1,n=1,r,s,o,a,l,u=je,f=je,h,c){super(null,o,a,l,u,f,r,s,h,c),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ar=new $r,Pg=new Oe(.5,.5),ga=new k,Ys=class{constructor(e=new bn,t=new bn,n=new bn,r=new bn,s=new bn,o=new bn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=$n,n=!1){let r=this.planes,s=e.elements,o=s[0],a=s[1],l=s[2],u=s[3],f=s[4],h=s[5],c=s[6],d=s[7],x=s[8],b=s[9],p=s[10],g=s[11],S=s[12],w=s[13],y=s[14],T=s[15];if(r[0].setComponents(u-o,d-f,g-x,T-S).normalize(),r[1].setComponents(u+o,d+f,g+x,T+S).normalize(),r[2].setComponents(u+a,d+h,g+b,T+w).normalize(),r[3].setComponents(u-a,d-h,g-b,T-w).normalize(),n)r[4].setComponents(l,c,p,y).normalize(),r[5].setComponents(u-l,d-c,g-p,T-y).normalize();else if(r[4].setComponents(u-l,d-c,g-p,T-y).normalize(),t===$n)r[5].setComponents(u+l,d+c,g+p,T+y).normalize();else if(t===ks)r[5].setComponents(l,c,p,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ar.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ar.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ar)}intersectsSprite(e){ar.center.set(0,0,0);let t=Pg.distanceTo(e.center);return ar.radius=.7071067811865476+t,ar.applyMatrix4(e.matrixWorld),this.intersectsSphere(ar)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ga.x=r.normal.x>0?e.max.x:e.min.x,ga.y=r.normal.y>0?e.max.y:e.min.y,ga.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ga)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Zs=class extends In{constructor(e=[],t=Vi,n,r,s,o,a,l,u,f){super(e,t,n,r,s,o,a,l,u,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Bi=class extends In{constructor(e,t,n=ln,r,s,o,a=je,l=je,u,f=ti,h=1){if(f!==ti&&f!==Wi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let c={width:e,height:t,depth:h};super(c,r,s,o,a,l,f,n,u),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new lr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Na=class extends Bi{constructor(e,t=ln,n=Vi,r,s,o=je,a=je,l,u=ti){let f={width:e,height:e,depth:1},h=[f,f,f,f,f,f];super(e,e,t,n,r,s,o,a,l,u),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},$s=class extends In{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Kr=class i extends Ft{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],u=[],f=[],h=[],c=0,d=0;x("z","y","x",-1,-1,n,t,e,o,s,0),x("z","y","x",1,-1,n,t,-e,o,s,1),x("x","z","y",1,1,e,n,t,r,o,2),x("x","z","y",1,-1,e,n,-t,r,o,3),x("x","y","z",1,-1,e,t,n,r,s,4),x("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Yt(u,3)),this.setAttribute("normal",new Yt(f,3)),this.setAttribute("uv",new Yt(h,2));function x(b,p,g,S,w,y,T,E,C,_,R){let I=y/C,F=T/_,L=y/2,O=T/2,N=E/2,V=C+1,W=_+1,J=0,ce=0,K=new k;for(let ie=0;ie<W;ie++){let re=ie*F-O;for(let Te=0;Te<V;Te++){let ve=Te*I-L;K[b]=ve*S,K[p]=re*w,K[g]=N,u.push(K.x,K.y,K.z),K[b]=0,K[p]=0,K[g]=E>0?1:-1,f.push(K.x,K.y,K.z),h.push(Te/C),h.push(1-ie/_),J+=1}}for(let ie=0;ie<_;ie++)for(let re=0;re<C;re++){let Te=c+re+V*ie,ve=c+re+V*(ie+1),Qe=c+(re+1)+V*(ie+1),Ue=c+(re+1)+V*ie;l.push(Te,ve,Ue),l.push(ve,Qe,Ue),ce+=6}a.addGroup(d,ce,R),d+=ce,c+=J}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Js=class i extends Ft{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],u=new k,f=new Oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,c=3;h<=t;h++,c+=3){let d=n+h/t*r;u.x=e*Math.cos(d),u.y=e*Math.sin(d),o.push(u.x,u.y,u.z),a.push(0,0,1),f.x=(o[c]/e+1)/2,f.y=(o[c+1]/e+1)/2,l.push(f.x,f.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Yt(o,3)),this.setAttribute("normal",new Yt(a,3)),this.setAttribute("uv",new Yt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var Ks=class i extends Ft{constructor(e=[new Oe(0,-.5),new Oe(.5,0),new Oe(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=rt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],u=[],f=1/t,h=new k,c=new Oe,d=new k,x=new k,b=new k,p=0,g=0;for(let S=0;S<=e.length-1;S++)switch(S){case 0:p=e[S+1].x-e[S].x,g=e[S+1].y-e[S].y,d.x=g*1,d.y=-p,d.z=g*0,b.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(b.x,b.y,b.z);break;default:p=e[S+1].x-e[S].x,g=e[S+1].y-e[S].y,d.x=g*1,d.y=-p,d.z=g*0,x.copy(d),d.x+=b.x,d.y+=b.y,d.z+=b.z,d.normalize(),l.push(d.x,d.y,d.z),b.copy(x)}for(let S=0;S<=t;S++){let w=n+S*f*r,y=Math.sin(w),T=Math.cos(w);for(let E=0;E<=e.length-1;E++){h.x=e[E].x*y,h.y=e[E].y,h.z=e[E].x*T,o.push(h.x,h.y,h.z),c.x=S/t,c.y=E/(e.length-1),a.push(c.x,c.y);let C=l[3*E+0]*y,_=l[3*E+1],R=l[3*E+0]*T;u.push(C,_,R)}}for(let S=0;S<t;S++)for(let w=0;w<e.length-1;w++){let y=w+S*e.length,T=y,E=y+e.length,C=y+e.length+1,_=y+1;s.push(T,E,_),s.push(C,_,E)}this.setIndex(s),this.setAttribute("position",new Yt(o,3)),this.setAttribute("uv",new Yt(a,2)),this.setAttribute("normal",new Yt(u,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var hr=class i extends Ft{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),u=a+1,f=l+1,h=e/a,c=t/l,d=[],x=[],b=[],p=[];for(let g=0;g<f;g++){let S=g*c-o;for(let w=0;w<u;w++){let y=w*h-s;x.push(y,-S,0),b.push(0,0,1),p.push(w/a),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let S=0;S<a;S++){let w=S+u*g,y=S+u*(g+1),T=S+1+u*(g+1),E=S+1+u*g;d.push(w,y,E),d.push(y,T,E)}this.setIndex(d),this.setAttribute("position",new Yt(x,3)),this.setAttribute("normal",new Yt(b,3)),this.setAttribute("uv",new Yt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};function mr(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];if(Pf(r))r.isRenderTargetTexture?(qe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone();else if(Array.isArray(r))if(Pf(r[0])){let s=[];for(let o=0,a=r.length;o<a;o++)s[o]=r[o].clone();e[t][n]=s}else e[t][n]=r.slice();else e[t][n]=r}}return e}function yn(i){let e={};for(let t=0;t<i.length;t++){let n=mr(i[t]);for(let r in n)e[r]=n[r]}return e}function Pf(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Dg(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function $u(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:dt.workingColorSpace}var bd={clone:mr,merge:yn},Lg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ht=class extends Ui{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Lg,this.fragmentShader=Fg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=mr(e.uniforms),this.uniformsGroups=Dg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case"t":this.uniforms[n].value=t[r.value]||null;break;case"c":this.uniforms[n].value=new Ke().setHex(r.value);break;case"v2":this.uniforms[n].value=new Oe().fromArray(r.value);break;case"v3":this.uniforms[n].value=new k().fromArray(r.value);break;case"v4":this.uniforms[n].value=new bt().fromArray(r.value);break;case"m3":this.uniforms[n].value=new tt().fromArray(r.value);break;case"m4":this.uniforms[n].value=new $e().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Ua=class extends Ht{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Qr=class extends Ui{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Dl,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Si,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Qs=class extends Qr{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Oe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return rt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ke(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ke(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ke(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Ba=class extends Ui{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ad,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Oa=class extends Ui{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function kr(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Mu(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Oi=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},za=class extends Oi{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Au,endingEnd:Au}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Eu:s=e,a=2*t-n;break;case Ru:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Eu:o=e,l=2*n-t;break;case Ru:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let u=(n-t)*.5,f=this.valueSize;this._weightPrev=u/(t-a),this._weightNext=u/(l-n),this._offsetPrev=s*f,this._offsetNext=o*f}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,f=this._offsetPrev,h=this._offsetNext,c=this._weightPrev,d=this._weightNext,x=(n-t)/(r-t),b=x*x,p=b*x,g=-c*p+2*c*b-c*x,S=(1+c)*p+(-1.5-2*c)*b+(-.5+c)*x+1,w=(-1-d)*p+(1.5+d)*b+.5*x,y=d*p-d*b;for(let T=0;T!==a;++T)s[T]=g*o[f+T]+S*o[u+T]+w*o[l+T]+y*o[h+T];return s}},ka=class extends Oi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,f=(n-t)/(r-t),h=1-f;for(let c=0;c!==a;++c)s[c]=o[u+c]*h+o[l+c]*f;return s}},Va=class extends Oi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ha=class extends Oi{interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,f=this.inTangents,h=this.outTangents;if(!f||!h){let x=(n-t)/(r-t),b=1-x;for(let p=0;p!==a;++p)s[p]=o[u+p]*b+o[l+p]*x;return s}let c=a*2,d=e-1;for(let x=0;x!==a;++x){let b=o[u+x],p=o[l+x],g=d*c+x*2,S=h[g],w=h[g+1],y=e*c+x*2,T=f[y],E=f[y+1],C=Ug(n,t,S,T,r);s[x]=Md(C,b,w,E,p)}return s}};function Md(i,e,t,n,r){let s=1-i;return s*s*s*e+3*s*s*i*t+3*s*i*i*n+i*i*i*r}function Ng(i,e,t,n,r){let s=1-i;return 3*s*s*(t-e)+6*s*i*(n-t)+3*i*i*(r-n)}function Ug(i,e,t,n,r){let s=(i-e)/(r-e);for(let o=0;o<8;o++){let a=Md(s,e,t,n,r)-i;if(Math.abs(a)<1e-10)break;let l=Ng(s,e,t,n,r);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}var Un=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=kr(t,this.TimeBufferType),this.values=kr(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:kr(e.times,Array),values:kr(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r),Mu(e.settings)&&(n.settings={inTangents:kr(e.settings.inTangents,Array),outTangents:kr(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Va(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ka(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new za(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ha(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Os:t=this.InterpolantFactoryMethodDiscrete;break;case Ia:t=this.InterpolantFactoryMethodLinear;break;case ya:t=this.InterpolantFactoryMethodSmooth;break;case wu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return qe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Os;case this.InterpolantFactoryMethodLinear:return Ia;case this.InterpolantFactoryMethodSmooth:return ya;case this.InterpolantFactoryMethodBezier:return wu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Mu(this.settings)&&(Df(this.settings.inTangents,e),Df(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Je("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(Je("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Je("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Je("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&cg(r))for(let a=0,l=r.length;a!==l;++a){let u=r[a];if(isNaN(u)){Je("KeyframeTrack: Value is not a valid number.",this,a,u),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ya,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,u=e[a],f=e[a+1];if(u!==f&&(a!==1||u!==e[0]))if(r)l=!0;else{let h=a*n,c=h-n,d=h+n;for(let x=0;x!==n;++x){let b=t[h+x];if(b!==t[c+x]||b!==t[d+x]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,c=o*n;for(let d=0;d!==n;++d)t[c+d]=t[h+d]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,u=0;u!==n;++u)t[l+u]=t[a+u];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Mu(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Df(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Un.prototype.ValueTypeName="";Un.prototype.TimeBufferType=Float32Array;Un.prototype.ValueBufferType=Float32Array;Un.prototype.DefaultInterpolation=Ia;var zi=class extends Un{constructor(e,t,n){super(e,t,n)}};zi.prototype.ValueTypeName="bool";zi.prototype.ValueBufferType=Array;zi.prototype.DefaultInterpolation=Os;zi.prototype.InterpolantFactoryMethodLinear=void 0;zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ga=class extends Un{constructor(e,t,n,r){super(e,t,n,r)}};Ga.prototype.ValueTypeName="color";var Wa=class extends Un{constructor(e,t,n,r){super(e,t,n,r)}};Wa.prototype.ValueTypeName="number";var Xa=class extends Oi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),u=e*a;for(let f=u+a;u!==f;u+=4)Hn.slerpFlat(s,0,o,u-a,o,u,l);return s}},js=class extends Un{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Xa(this.times,this.values,this.getValueSize(),e)}};js.prototype.ValueTypeName="quaternion";js.prototype.InterpolantFactoryMethodSmooth=void 0;var ki=class extends Un{constructor(e,t,n){super(e,t,n)}};ki.prototype.ValueTypeName="string";ki.prototype.ValueBufferType=Array;ki.prototype.DefaultInterpolation=Os;ki.prototype.InterpolantFactoryMethodLinear=void 0;ki.prototype.InterpolantFactoryMethodSmooth=void 0;var qa=class extends Un{constructor(e,t,n,r){super(e,t,n,r)}};qa.prototype.ValueTypeName="vector";var Cu={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Lf(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Lf(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Lf(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Ya=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(f){a++,s===!1&&r.onStart!==void 0&&r.onStart(f,o,a),s=!0},this.itemEnd=function(f){o++,r.onProgress!==void 0&&r.onProgress(f,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(f){r.onError!==void 0&&r.onError(f)},this.resolveURL=function(f){return f=f.normalize("NFC"),l?l(f):f},this.setURLModifier=function(f){return l=f,this},this.addHandler=function(f,h){return u.push(f,h),this},this.removeHandler=function(f){let h=u.indexOf(f);return h!==-1&&u.splice(h,2),this},this.getHandler=function(f){for(let h=0,c=u.length;h<c;h+=2){let d=u[h],x=u[h+1];if(d.global&&(d.lastIndex=0),d.test(f))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Td=new Ya,jr=class{constructor(e){this.manager=e!==void 0?e:Td,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};jr.DEFAULT_MATERIAL_NAME="__DEFAULT";var xi={},Iu=class extends Error{constructor(e,t){super(e),this.response=t}},Za=class extends jr{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=Cu.get(`file:${e}`);if(s!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0);return}if(xi[e]!==void 0){xi[e].push({onLoad:t,onProgress:n,onError:r});return}xi[e]=[],xi[e].push({onLoad:t,onProgress:n,onError:r});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(u=>{if(u.status===200||u.status===0){if(u.status===0&&qe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||u.body===void 0||u.body.getReader===void 0)return u;let f=xi[e],h=u.body.getReader(),c=u.headers.get("X-File-Size")||u.headers.get("Content-Length"),d=c?parseInt(c):0,x=d!==0,b=0,p=new ReadableStream({start(g){S();function S(){h.read().then(({done:w,value:y})=>{if(w)g.close();else{b+=y.byteLength;let T=new ProgressEvent("progress",{lengthComputable:x,loaded:b,total:d});for(let E=0,C=f.length;E<C;E++){let _=f[E];_.onProgress&&_.onProgress(T)}g.enqueue(y),S()}},w=>{g.error(w)})}}});return new Response(p)}else throw new Iu(`fetch for "${u.url}" responded with ${u.status}: ${u.statusText}`,u)}).then(u=>{switch(l){case"arraybuffer":return u.arrayBuffer();case"blob":return u.blob();case"document":return u.text().then(f=>new DOMParser().parseFromString(f,a));case"json":return u.json();default:if(a==="")return u.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),c=h&&h[1]?h[1].toLowerCase():void 0,d=new TextDecoder(c);return u.arrayBuffer().then(x=>d.decode(x))}}}).then(u=>{Cu.add(`file:${e}`,u);let f=xi[e];delete xi[e];for(let h=0,c=f.length;h<c;h++){let d=f[h];d.onLoad&&d.onLoad(u)}}).catch(u=>{let f=xi[e];if(f===void 0)throw this.manager.itemError(e),u;delete xi[e];for(let h=0,c=f.length;h<c;h++){let d=f[h];d.onError&&d.onError(u)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var fr=class extends jr{constructor(e){super(e)}load(e,t,n,r){let s=this,o=new It,a=new Za(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(e,function(l){let u;try{u=s.parse(l)}catch(f){r!==void 0?r(f):Je(f);return}s._applyTexData(o,u),t&&t(o,u)},n,r),o}createDataTexture(e){let t=new It;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:Lt,e.wrapT=t.wrapT!==void 0?t.wrapT:Lt,e.magFilter=t.magFilter!==void 0?t.magFilter:st,e.minFilter=t.minFilter!==void 0?t.minFilter:st,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=Mi),t.mipmapCount===1&&(e.minFilter=st),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}};var xa=new k,va=new Hn,ei=new k,eo=class extends Gn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new $e,this.projectionMatrix=new $e,this.projectionMatrixInverse=new $e,this.coordinateSystem=$n,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(xa,va,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(xa,va,ei.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(xa,va,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(xa,va,ei.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Li=new k,Ff=new Oe,Nf=new Oe,rn=class extends eo{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Pa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(nu*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Pa*2*Math.atan(Math.tan(nu*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Li.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Li.x,Li.y).multiplyScalar(-e/Li.z),Li.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Li.x,Li.y).multiplyScalar(-e/Li.z)}getViewSize(e,t){return this.getViewBounds(e,Ff,Nf),t.subVectors(Nf,Ff)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(nu*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,u=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/u,r*=o.width/l,n*=o.height/u}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var bi=class extends eo{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let u=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,o=s+u*this.view.width,a-=f*this.view.offsetY,l=a-f*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var Vr=-90,Hr=1,$a=class extends Gn{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new rn(Vr,Hr,e,t);r.layers=this.layers,this.add(r);let s=new rn(Vr,Hr,e,t);s.layers=this.layers,this.add(s);let o=new rn(Vr,Hr,e,t);o.layers=this.layers,this.add(o);let a=new rn(Vr,Hr,e,t);a.layers=this.layers,this.add(a);let l=new rn(Vr,Hr,e,t);l.layers=this.layers,this.add(l);let u=new rn(Vr,Hr,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let u of t)this.remove(u);if(e===$n)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ks)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,u,f]=this.children,h=e.getRenderTarget(),c=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let b=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,1,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),n.texture.generateMipmaps=b,e.setRenderTarget(n,5,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,f),e.setRenderTarget(h,c,d),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},Ja=class extends rn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ju="\\[\\]\\.:\\/",Bg=new RegExp("["+Ju+"]","g"),Ku="[^"+Ju+"]",Og="[^"+Ju.replace("\\.","")+"]",zg=/((?:WC+[\/:])*)/.source.replace("WC",Ku),kg=/(WCOD+)?/.source.replace("WCOD",Og),Vg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ku),Hg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ku),Gg=new RegExp("^"+zg+kg+Vg+Hg+"$"),Wg=["material","materials","bones","map"],Pu=class{constructor(e,t,n){let r=n||zt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},zt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Bg,"")}static parseTrackName(e){let t=Gg.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);Wg.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){qe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let u=t.objectIndex;switch(n){case"materials":if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Je("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Je("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let f=0;f<e.length;f++)if(e[f].name===u){u=f;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Je("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Je("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(u!==void 0){if(e[u]===void 0){Je("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}let o=e[r];if(o===void 0){let u=t.nodeName;Je("PropertyBinding: Trying to update property for track: "+u+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};zt.Composite=Pu;zt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};zt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};zt.prototype.GetterByBindingType=[zt.prototype._getValue_direct,zt.prototype._getValue_array,zt.prototype._getValue_arrayElement,zt.prototype._getValue_toArray];zt.prototype.SetterByBindingTypeAndVersioning=[[zt.prototype._setValue_direct,zt.prototype._setValue_direct_setNeedsUpdate,zt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[zt.prototype._setValue_array,zt.prototype._setValue_array_setNeedsUpdate,zt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[zt.prototype._setValue_arrayElement,zt.prototype._setValue_arrayElement_setNeedsUpdate,zt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[zt.prototype._setValue_fromArray,zt.prototype._setValue_fromArray_setNeedsUpdate,zt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var lb=new Float32Array(1);var to=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,qe("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}},no=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=rt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(rt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var ih=class ih{constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let s=this.elements;return s[0]=e,s[2]=t,s[1]=n,s[3]=r,this}};ih.prototype.isMatrix2=!0;var Du=ih;var Uf=new k,_a=new k,Gr=new k,Wr=new k,Tu=new k,Xg=new k,qg=new k,Mn=class{constructor(e=new k,t=new k){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){Uf.subVectors(e,this.start),_a.subVectors(this.end,this.start);let n=_a.dot(_a);if(n===0)return 0;let s=_a.dot(Uf)/n;return t&&(s=rt(s,0,1)),s}closestPointToPoint(e,t,n){let r=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=Xg,n=qg){let r=10000000000000001e-32,s,o,a=this.start,l=e.start,u=this.end,f=e.end;Gr.subVectors(u,a),Wr.subVectors(f,l),Tu.subVectors(a,l);let h=Gr.dot(Gr),c=Wr.dot(Wr),d=Wr.dot(Tu);if(h<=r&&c<=r)return t.copy(a),n.copy(l),t.sub(n),t.dot(t);if(h<=r)s=0,o=d/c,o=rt(o,0,1);else{let x=Gr.dot(Tu);if(c<=r)o=0,s=rt(-x/h,0,1);else{let b=Gr.dot(Wr),p=h*c-b*b;p!==0?s=rt((b*d-x*c)/p,0,1):s=0,o=(b*s+d)/c,o<0?(o=0,s=rt(-x/h,0,1)):o>1&&(o=1,s=rt((b-x)/h,0,1))}}return t.copy(a).addScaledVector(Gr,s),n.copy(l).addScaledVector(Wr,o),t.distanceToSquared(n)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};function Qu(i,e,t,n){let r=Yg(n);switch(t){case Xu:return i*e;case An:return i*e/r.components*r.byteLength;case is:return i*e/r.components*r.byteLength;case cn:return i*e*2/r.components*r.byteLength;case Xi:return i*e*2/r.components*r.byteLength;case qu:return i*e*3/r.components*r.byteLength;case Xe:return i*e*4/r.components*r.byteLength;case qi:return i*e*4/r.components*r.byteLength;case po:case mo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case go:case xo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case il:case sl:return Math.max(i,16)*Math.max(e,8)/4;case nl:case rl:return Math.max(i,8)*Math.max(e,8)/2;case ol:case al:case cl:case ul:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ll:case vo:case hl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case fl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case dl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case pl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case ml:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case gl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case xl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case vl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case _l:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case yl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Sl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case bl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ml:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Tl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case wl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Al:case El:case Rl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Cl:case Il:return Math.ceil(i/4)*Math.ceil(e/4)*8;case _o:case Pl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Yg(i){switch(i){case an:case ts:return{byteLength:1,components:1};case Hi:case fo:case ut:return{byteLength:2,components:1};case el:case tl:return{byteLength:2,components:4};case ln:case Gi:case nt:return{byteLength:4,components:1};case Gu:case Wu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?qe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function qd(){let i=null,e=!1,t=null,n=null;function r(s,o){n=i.requestAnimationFrame(r),t(s,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Zg(i){let e=new WeakMap;function t(a,l){let u=a.array,f=a.usage,h=u.byteLength,c=i.createBuffer();i.bindBuffer(l,c),i.bufferData(l,u,f),a.onUploadCallback();let d;if(u instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&u instanceof Float16Array)d=i.HALF_FLOAT;else if(u instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)d=i.SHORT;else if(u instanceof Uint32Array)d=i.UNSIGNED_INT;else if(u instanceof Int32Array)d=i.INT;else if(u instanceof Int8Array)d=i.BYTE;else if(u instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:c,type:d,bytesPerElement:u.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,u){let f=l.array,h=l.updateRanges;if(i.bindBuffer(u,a),h.length===0)i.bufferSubData(u,0,f);else{h.sort((d,x)=>d.start-x.start);let c=0;for(let d=1;d<h.length;d++){let x=h[c],b=h[d];b.start<=x.start+x.count+1?x.count=Math.max(x.count,b.start+b.count-x.start):(++c,h[c]=b)}h.length=c+1;for(let d=0,x=h.length;d<x;d++){let b=h[d];i.bufferSubData(u,b.start*f.BYTES_PER_ELEMENT,f,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let f=e.get(a);(!f||f.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let u=e.get(a);if(u===void 0)e.set(a,t(a,l));else if(u.version<a.version){if(u.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(u.buffer,a,l),u.version=a.version}}return{get:r,remove:s,update:o}}var $g=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Jg=`#ifdef USE_ALPHAHASH
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
#endif`,Kg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Qg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,e0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,t0=`#ifdef USE_AOMAP
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
#endif`,n0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,i0=`#ifdef USE_BATCHING
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
#endif`,r0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,s0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,o0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,a0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,l0=`#ifdef USE_IRIDESCENCE
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
#endif`,c0=`#ifdef USE_BUMPMAP
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
#endif`,u0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,h0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,f0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,d0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,p0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,m0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,g0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,x0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,v0=`#define PI 3.141592653589793
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
} // validated`,_0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,y0=`vec3 transformedNormal = objectNormal;
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
#endif`,S0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,b0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,M0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,T0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,w0="gl_FragColor = linearToOutputTexel( gl_FragColor );",A0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,E0=`#ifdef USE_ENVMAP
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
#endif`,R0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,C0=`#ifdef USE_ENVMAP
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
#endif`,I0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,P0=`#ifdef USE_ENVMAP
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
#endif`,D0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,L0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,F0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,N0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,U0=`#ifdef USE_GRADIENTMAP
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
}`,B0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,O0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,z0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,k0=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,V0=`#ifdef USE_ENVMAP
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
#endif`,H0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,G0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,W0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,X0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,q0=`PhysicalMaterial material;
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
#endif`,Y0=`uniform sampler2D dfgLUT;
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
}`,Z0=`
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
#endif`,$0=`#if defined( RE_IndirectDiffuse )
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
#endif`,J0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,K0=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Q0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,j0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ex=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,nx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ix=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,rx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,sx=`#if defined( USE_POINTS_UV )
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
#endif`,ox=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ax=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,lx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,cx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ux=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hx=`#ifdef USE_MORPHTARGETS
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
#endif`,fx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,px=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,mx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,vx=`#ifdef USE_NORMALMAP
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
#endif`,_x=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,yx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Sx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,bx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Mx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Tx=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,wx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ax=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ex=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Rx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ix=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Px=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Dx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Lx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Fx=`float getShadowMask() {
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
}`,Nx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ux=`#ifdef USE_SKINNING
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
#endif`,Bx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ox=`#ifdef USE_SKINNING
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
#endif`,zx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,kx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Vx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Hx=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Gx=`#ifdef USE_TRANSMISSION
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
#endif`,Wx=`#ifdef USE_TRANSMISSION
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
#endif`,Xx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,qx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Zx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,$x=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Jx=`uniform sampler2D t2D;
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
}`,Kx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Qx=`#ifdef ENVMAP_TYPE_CUBE
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
}`,jx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ev=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tv=`#include <common>
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
}`,nv=`#if DEPTH_PACKING == 3200
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
}`,iv=`#define DISTANCE
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
}`,rv=`#define DISTANCE
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
}`,sv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ov=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,av=`uniform float scale;
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
}`,lv=`uniform vec3 diffuse;
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
}`,cv=`#include <common>
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
}`,uv=`uniform vec3 diffuse;
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
}`,hv=`#define LAMBERT
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
}`,fv=`#define LAMBERT
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
}`,dv=`#define MATCAP
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
}`,pv=`#define MATCAP
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
}`,mv=`#define NORMAL
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
}`,gv=`#define NORMAL
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
}`,xv=`#define PHONG
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
}`,vv=`#define PHONG
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
}`,_v=`#define STANDARD
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
}`,yv=`#define STANDARD
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
}`,Sv=`#define TOON
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
}`,bv=`#define TOON
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
}`,Mv=`uniform float size;
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
}`,Tv=`uniform vec3 diffuse;
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
}`,wv=`#include <common>
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
}`,Av=`uniform vec3 color;
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
}`,Ev=`uniform float rotation;
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
}`,Rv=`uniform vec3 diffuse;
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
}`,lt={alphahash_fragment:$g,alphahash_pars_fragment:Jg,alphamap_fragment:Kg,alphamap_pars_fragment:Qg,alphatest_fragment:jg,alphatest_pars_fragment:e0,aomap_fragment:t0,aomap_pars_fragment:n0,batching_pars_vertex:i0,batching_vertex:r0,begin_vertex:s0,beginnormal_vertex:o0,bsdfs:a0,iridescence_fragment:l0,bumpmap_pars_fragment:c0,clipping_planes_fragment:u0,clipping_planes_pars_fragment:h0,clipping_planes_pars_vertex:f0,clipping_planes_vertex:d0,color_fragment:p0,color_pars_fragment:m0,color_pars_vertex:g0,color_vertex:x0,common:v0,cube_uv_reflection_fragment:_0,defaultnormal_vertex:y0,displacementmap_pars_vertex:S0,displacementmap_vertex:b0,emissivemap_fragment:M0,emissivemap_pars_fragment:T0,colorspace_fragment:w0,colorspace_pars_fragment:A0,envmap_fragment:E0,envmap_common_pars_fragment:R0,envmap_pars_fragment:C0,envmap_pars_vertex:I0,envmap_physical_pars_fragment:V0,envmap_vertex:P0,fog_vertex:D0,fog_pars_vertex:L0,fog_fragment:F0,fog_pars_fragment:N0,gradientmap_pars_fragment:U0,lightmap_pars_fragment:B0,lights_lambert_fragment:O0,lights_lambert_pars_fragment:z0,lights_pars_begin:k0,lights_toon_fragment:H0,lights_toon_pars_fragment:G0,lights_phong_fragment:W0,lights_phong_pars_fragment:X0,lights_physical_fragment:q0,lights_physical_pars_fragment:Y0,lights_fragment_begin:Z0,lights_fragment_maps:$0,lights_fragment_end:J0,lightprobes_pars_fragment:K0,logdepthbuf_fragment:Q0,logdepthbuf_pars_fragment:j0,logdepthbuf_pars_vertex:ex,logdepthbuf_vertex:tx,map_fragment:nx,map_pars_fragment:ix,map_particle_fragment:rx,map_particle_pars_fragment:sx,metalnessmap_fragment:ox,metalnessmap_pars_fragment:ax,morphinstance_vertex:lx,morphcolor_vertex:cx,morphnormal_vertex:ux,morphtarget_pars_vertex:hx,morphtarget_vertex:fx,normal_fragment_begin:dx,normal_fragment_maps:px,normal_pars_fragment:mx,normal_pars_vertex:gx,normal_vertex:xx,normalmap_pars_fragment:vx,clearcoat_normal_fragment_begin:_x,clearcoat_normal_fragment_maps:yx,clearcoat_pars_fragment:Sx,iridescence_pars_fragment:bx,opaque_fragment:Mx,packing:Tx,premultiplied_alpha_fragment:wx,project_vertex:Ax,dithering_fragment:Ex,dithering_pars_fragment:Rx,roughnessmap_fragment:Cx,roughnessmap_pars_fragment:Ix,shadowmap_pars_fragment:Px,shadowmap_pars_vertex:Dx,shadowmap_vertex:Lx,shadowmask_pars_fragment:Fx,skinbase_vertex:Nx,skinning_pars_vertex:Ux,skinning_vertex:Bx,skinnormal_vertex:Ox,specularmap_fragment:zx,specularmap_pars_fragment:kx,tonemapping_fragment:Vx,tonemapping_pars_fragment:Hx,transmission_fragment:Gx,transmission_pars_fragment:Wx,uv_pars_fragment:Xx,uv_pars_vertex:qx,uv_vertex:Yx,worldpos_vertex:Zx,background_vert:$x,background_frag:Jx,backgroundCube_vert:Kx,backgroundCube_frag:Qx,cube_vert:jx,cube_frag:ev,depth_vert:tv,depth_frag:nv,distance_vert:iv,distance_frag:rv,equirect_vert:sv,equirect_frag:ov,linedashed_vert:av,linedashed_frag:lv,meshbasic_vert:cv,meshbasic_frag:uv,meshlambert_vert:hv,meshlambert_frag:fv,meshmatcap_vert:dv,meshmatcap_frag:pv,meshnormal_vert:mv,meshnormal_frag:gv,meshphong_vert:xv,meshphong_frag:vv,meshphysical_vert:_v,meshphysical_frag:yv,meshtoon_vert:Sv,meshtoon_frag:bv,points_vert:Mv,points_frag:Tv,shadow_vert:wv,shadow_frag:Av,sprite_vert:Ev,sprite_frag:Rv},Ie={common:{diffuse:{value:new Ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new tt}},envmap:{envMap:{value:null},envMapRotation:{value:new tt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new tt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new tt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new tt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new tt},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new tt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new tt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new tt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new tt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new Ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0},uvTransform:{value:new tt}},sprite:{diffuse:{value:new Ke(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}}},oi={basic:{uniforms:yn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:yn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Ke(0)},envMapIntensity:{value:1}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:yn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Ke(0)},specular:{value:new Ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:yn([Ie.common,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.roughnessmap,Ie.metalnessmap,Ie.fog,Ie.lights,{emissive:{value:new Ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:yn([Ie.common,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.gradientmap,Ie.fog,Ie.lights,{emissive:{value:new Ke(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:yn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:yn([Ie.points,Ie.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:yn([Ie.common,Ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:yn([Ie.common,Ie.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:yn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:yn([Ie.sprite,Ie.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new tt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new tt}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distance:{uniforms:yn([Ie.common,Ie.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distance_vert,fragmentShader:lt.distance_frag},shadow:{uniforms:yn([Ie.lights,Ie.fog,{color:{value:new Ke(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};oi.physical={uniforms:yn([oi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new tt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new tt},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new tt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new tt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new tt},sheen:{value:0},sheenColor:{value:new Ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new tt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new tt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new tt},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new tt},attenuationDistance:{value:0},attenuationColor:{value:new Ke(0)},specularColor:{value:new Ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new tt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new tt},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new tt}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};var Nl={r:0,b:0,g:0},Cv=new $e,Yd=new tt;Yd.set(-1,0,0,0,1,0,0,0,1);function Iv(i,e,t,n,r,s){let o=new Ke(0),a=r===!0?0:1,l,u,f=null,h=0,c=null;function d(S){let w=S.isScene===!0?S.background:null;if(w&&w.isTexture){let y=S.backgroundBlurriness>0;w=e.get(w,y)}return w}function x(S){let w=!1,y=d(S);y===null?p(o,a):y&&y.isColor&&(p(y,1),w=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,s):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(i.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function b(S,w){let y=d(w);y&&(y.isCubeTexture||y.mapping===uo)?(u===void 0&&(u=new on(new Kr(1,1,1),new Ht({name:"BackgroundCubeMaterial",uniforms:mr(oi.backgroundCube.uniforms),vertexShader:oi.backgroundCube.vertexShader,fragmentShader:oi.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,E,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(u)),u.material.uniforms.envMap.value=y,u.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Cv.makeRotationFromEuler(w.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&u.material.uniforms.backgroundRotation.value.premultiply(Yd),u.material.toneMapped=dt.getTransfer(y.colorSpace)!==Et,(f!==y||h!==y.version||c!==i.toneMapping)&&(u.material.needsUpdate=!0,f=y,h=y.version,c=i.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new on(new hr(2,2),new Ht({name:"BackgroundMaterial",uniforms:mr(oi.background.uniforms),vertexShader:oi.background.vertexShader,fragmentShader:oi.background.fragmentShader,side:Tn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=dt.getTransfer(y.colorSpace)!==Et,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||h!==y.version||c!==i.toneMapping)&&(l.material.needsUpdate=!0,f=y,h=y.version,c=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function p(S,w){S.getRGB(Nl,$u(i)),t.buffers.color.setClear(Nl.r,Nl.g,Nl.b,w,s)}function g(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(S,w=1){o.set(S),a=w,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(S){a=S,p(o,a)},render:x,addToRenderList:b,dispose:g}}function Pv(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=c(null),s=r,o=!1;function a(F,L,O,N,V){let W=!1,J=h(F,N,O,L);s!==J&&(s=J,u(s.object)),W=d(F,N,O,V),W&&x(F,N,O,V),V!==null&&e.update(V,i.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,y(F,L,O,N),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return i.createVertexArray()}function u(F){return i.bindVertexArray(F)}function f(F){return i.deleteVertexArray(F)}function h(F,L,O,N){let V=N.wireframe===!0,W=n[L.id];W===void 0&&(W={},n[L.id]=W);let J=F.isInstancedMesh===!0?F.id:0,ce=W[J];ce===void 0&&(ce={},W[J]=ce);let K=ce[O.id];K===void 0&&(K={},ce[O.id]=K);let ie=K[V];return ie===void 0&&(ie=c(l()),K[V]=ie),ie}function c(F){let L=[],O=[],N=[];for(let V=0;V<t;V++)L[V]=0,O[V]=0,N[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:O,attributeDivisors:N,object:F,attributes:{},index:null}}function d(F,L,O,N){let V=s.attributes,W=L.attributes,J=0,ce=O.getAttributes();for(let K in ce)if(ce[K].location>=0){let re=V[K],Te=W[K];if(Te===void 0&&(K==="instanceMatrix"&&F.instanceMatrix&&(Te=F.instanceMatrix),K==="instanceColor"&&F.instanceColor&&(Te=F.instanceColor)),re===void 0||re.attribute!==Te||Te&&re.data!==Te.data)return!0;J++}return s.attributesNum!==J||s.index!==N}function x(F,L,O,N){let V={},W=L.attributes,J=0,ce=O.getAttributes();for(let K in ce)if(ce[K].location>=0){let re=W[K];re===void 0&&(K==="instanceMatrix"&&F.instanceMatrix&&(re=F.instanceMatrix),K==="instanceColor"&&F.instanceColor&&(re=F.instanceColor));let Te={};Te.attribute=re,re&&re.data&&(Te.data=re.data),V[K]=Te,J++}s.attributes=V,s.attributesNum=J,s.index=N}function b(){let F=s.newAttributes;for(let L=0,O=F.length;L<O;L++)F[L]=0}function p(F){g(F,0)}function g(F,L){let O=s.newAttributes,N=s.enabledAttributes,V=s.attributeDivisors;O[F]=1,N[F]===0&&(i.enableVertexAttribArray(F),N[F]=1),V[F]!==L&&(i.vertexAttribDivisor(F,L),V[F]=L)}function S(){let F=s.newAttributes,L=s.enabledAttributes;for(let O=0,N=L.length;O<N;O++)L[O]!==F[O]&&(i.disableVertexAttribArray(O),L[O]=0)}function w(F,L,O,N,V,W,J){J===!0?i.vertexAttribIPointer(F,L,O,V,W):i.vertexAttribPointer(F,L,O,N,V,W)}function y(F,L,O,N){b();let V=N.attributes,W=O.getAttributes(),J=L.defaultAttributeValues;for(let ce in W){let K=W[ce];if(K.location>=0){let ie=V[ce];if(ie===void 0&&(ce==="instanceMatrix"&&F.instanceMatrix&&(ie=F.instanceMatrix),ce==="instanceColor"&&F.instanceColor&&(ie=F.instanceColor)),ie!==void 0){let re=ie.normalized,Te=ie.itemSize,ve=e.get(ie);if(ve===void 0)continue;let Qe=ve.buffer,Ue=ve.type,et=ve.bytesPerElement,Q=Ue===i.INT||Ue===i.UNSIGNED_INT||ie.gpuType===Gi;if(ie.isInterleavedBufferAttribute){let le=ie.data,Re=le.stride,We=ie.offset;if(le.isInstancedInterleavedBuffer){for(let Ce=0;Ce<K.locationSize;Ce++)g(K.location+Ce,le.meshPerAttribute);F.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Ce=0;Ce<K.locationSize;Ce++)p(K.location+Ce);i.bindBuffer(i.ARRAY_BUFFER,Qe);for(let Ce=0;Ce<K.locationSize;Ce++)w(K.location+Ce,Te/K.locationSize,Ue,re,Re*et,(We+Te/K.locationSize*Ce)*et,Q)}else{if(ie.isInstancedBufferAttribute){for(let le=0;le<K.locationSize;le++)g(K.location+le,ie.meshPerAttribute);F.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let le=0;le<K.locationSize;le++)p(K.location+le);i.bindBuffer(i.ARRAY_BUFFER,Qe);for(let le=0;le<K.locationSize;le++)w(K.location+le,Te/K.locationSize,Ue,re,Te*et,Te/K.locationSize*le*et,Q)}}else if(J!==void 0){let re=J[ce];if(re!==void 0)switch(re.length){case 2:i.vertexAttrib2fv(K.location,re);break;case 3:i.vertexAttrib3fv(K.location,re);break;case 4:i.vertexAttrib4fv(K.location,re);break;default:i.vertexAttrib1fv(K.location,re)}}}}S()}function T(){R();for(let F in n){let L=n[F];for(let O in L){let N=L[O];for(let V in N){let W=N[V];for(let J in W)f(W[J].object),delete W[J];delete N[V]}}delete n[F]}}function E(F){if(n[F.id]===void 0)return;let L=n[F.id];for(let O in L){let N=L[O];for(let V in N){let W=N[V];for(let J in W)f(W[J].object),delete W[J];delete N[V]}}delete n[F.id]}function C(F){for(let L in n){let O=n[L];for(let N in O){let V=O[N];if(V[F.id]===void 0)continue;let W=V[F.id];for(let J in W)f(W[J].object),delete W[J];delete V[F.id]}}}function _(F){for(let L in n){let O=n[L],N=F.isInstancedMesh===!0?F.id:0,V=O[N];if(V!==void 0){for(let W in V){let J=V[W];for(let ce in J)f(J[ce].object),delete J[ce];delete V[W]}delete O[N],Object.keys(O).length===0&&delete n[L]}}}function R(){I(),o=!0,s!==r&&(s=r,u(s.object))}function I(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:R,resetDefaultState:I,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfObject:_,releaseStatesOfProgram:C,initAttributes:b,enableAttribute:p,disableUnusedAttributes:S}}function Dv(i,e,t){let n;function r(l){n=l}function s(l,u){i.drawArrays(n,l,u),t.update(u,n,1)}function o(l,u,f){f!==0&&(i.drawArraysInstanced(n,l,u,f),t.update(u,n,f))}function a(l,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,f);let c=0;for(let d=0;d<f;d++)c+=u[d];t.update(c,n,1)}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function Lv(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(C){return!(C!==Xe&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let _=C===ut&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==an&&C!==nt&&!_&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp",f=l(u);f!==u&&(qe("WebGLRenderer:",u,"not supported, using",f,"instead."),u=f);let h=t.logarithmicDepthBuffer===!0,c=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&c===!1&&qe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:u,logarithmicDepthBuffer:h,reversedDepthBuffer:c,maxTextures:d,maxVertexTextures:x,maxTextureSize:b,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:S,maxVaryings:w,maxFragmentUniforms:y,maxSamples:T,samples:E}}function Fv(i){let e=this,t=null,n=0,r=!1,s=!1,o=new bn,a=new tt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,c){let d=h.length!==0||c||n!==0||r;return r=c,n=h.length,d},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,c){t=f(h,c,0)},this.setState=function(h,c,d){let x=h.clippingPlanes,b=h.clipIntersection,p=h.clipShadows,g=i.get(h);if(!r||x===null||x.length===0||s&&!p)s?f(null):u();else{let S=s?0:n,w=S*4,y=g.clippingState||null;l.value=y,y=f(x,c,w,d);for(let T=0;T!==w;++T)y[T]=t[T];g.clippingState=y,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=S}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function f(h,c,d,x){let b=h!==null?h.length:0,p=null;if(b!==0){if(p=l.value,x!==!0||p===null){let g=d+b*4,S=c.matrixWorldInverse;a.getNormalMatrix(S),(p===null||p.length<g)&&(p=new Float32Array(g));for(let w=0,y=d;w!==b;++w,y+=4)o.copy(h[w]).applyMatrix4(S,a),o.normal.toArray(p,y),p[y+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,p}}var ss=4,Nv=6,Uv=20,Bv=256,So=new bi,wd=new Ke,rh=null,sh=0,oh=0,ah=!1,Ov=new k,gr=new k,Bl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,s={}){let{size:o=256,position:a=Ov}=s;rh=this._renderer.getRenderTarget(),sh=this._renderer.getActiveCubeFace(),oh=this._renderer.getActiveMipmapLevel(),ah=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Rd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ed(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(rh,sh,oh),this._renderer.xr.enabled=ah,e.scissorTest=!1,rs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Vi||e.mapping===pr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),rh=this._renderer.getRenderTarget(),sh=this._renderer.getActiveCubeFace(),oh=this._renderer.getActiveMipmapLevel(),ah=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:st,minFilter:st,generateMipmaps:!1,type:ut,format:Xe,colorSpace:dn,depthBuffer:!1},r=Ad(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ad(e,t,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=zv(s)),this._blurMaterial=Vv(s,e,t),this._ggxMaterial=kv(s,e,t)}return r}_compileMaterial(e){let t=new on(new Ft,e);this._renderer.compile(t,So)}_sceneToCubeUV(e,t,n,r,s){let l=new rn(90,1,t,n),u=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],h=this._renderer,c=h.autoClear,d=h.toneMapping;h.getClearColor(wd),h.toneMapping=wn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(r),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new on(new Kr,new ur({name:"PMREM.Background",side:Jt,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,p=b.material,g=!1,S=e.background;S?S.isColor&&(p.color.copy(S),e.background=null,g=!0):(p.color.copy(wd),g=!0);for(let w=0;w<6;w++){let y=w%3;y===0?(l.up.set(0,u[w],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+f[w],s.y,s.z)):y===1?(l.up.set(0,0,u[w]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+f[w],s.z)):(l.up.set(0,u[w],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+f[w]));let T=this._cubeSize;rs(r,y*T,w>2?T:0,T,T),h.setRenderTarget(r),g&&h.render(b,l),h.render(e,l)}h.toneMapping=d,h.autoClear=c,e.background=S}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===Vi||e.mapping===pr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Rd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ed());let s=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;rs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,So)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,u=n/(this._lodMeshes.length-1),f=t/(this._lodMeshes.length-1),h=Math.sqrt(u*u-f*f),c=u*1.25,d=h*c,{_lodMax:x}=this,b=this._sizeLods[n],p=3*b*(n>x-ss?n-x+ss:0),g=4*(this._cubeSize-b);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=x-t,rs(s,p,g,3*b,2*b),r.setRenderTarget(s),r.render(a,So),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=x-n,rs(e,p,g,3*b,2*b),r.setRenderTarget(e),r.render(a,So)}_blur(e,t,n,r){let s=this._pingPongRenderTarget,o=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,s,t,n,o),this._blurPass(s,e,n,n,o)}_blurPass(e,t,n,r,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[r];l.material=a;let u=a.uniforms;u.envMap.value=e.texture,u.sigma.value=s,u.mipInt.value=this._lodMax-n;let f=this._sizeLods[r],h=3*f*(r>this._lodMax-ss?r-this._lodMax+ss:0),c=4*(this._cubeSize-f);rs(t,h,c,3*f,2*f),o.setRenderTarget(t),o.render(l,So)}};function zv(i){let e=[],t=[],n=i,r=i-ss+1+Nv;for(let s=0;s<r;s++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,u=1+a,f=[l,l,u,l,u,u,l,l,u,u,l,u],h=6,c=6,d=3,x=new Float32Array(d*c*h),b=new Float32Array(d*c*h);for(let g=0;g<h;g++){let S=g%3*2/3-1,w=g>2?0:-1,y=[S,w,0,S+2/3,w,0,S+2/3,w+1,0,S,w,0,S+2/3,w+1,0,S,w+1,0];x.set(y,d*c*g);for(let T=0;T<c;T++){let E=f[T*2]*2-1,C=f[T*2+1]*2-1;g===0?gr.set(1,C,E):g===1?gr.set(-E,1,-C):g===2?gr.set(-E,C,1):g===3?gr.set(-1,C,-E):g===4?gr.set(-E,-1,C):gr.set(E,C,-1),gr.toArray(b,(g*c+T)*d)}}let p=new Ft;p.setAttribute("position",new xt(x,d)),p.setAttribute("outputDirection",new xt(b,d)),t.push(new on(p,null)),n>ss&&n--}return{lodMeshes:t,sizeLods:e}}function Ad(i,e,t){let n=new kt(i,e,t);return n.texture.mapping=uo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function rs(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function kv(i,e,t){return new Ht({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Bv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:kl(),fragmentShader:`

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
		`,blending:Kt,depthTest:!1,depthWrite:!1})}function Vv(i,e,t){return new Ht({name:"SphericalGaussianBlur",defines:{SAMPLES:Uv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:kl(),fragmentShader:`

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
		`,blending:Kt,depthTest:!1,depthWrite:!1})}function Ed(){return new Ht({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:kl(),fragmentShader:`

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
		`,blending:Kt,depthTest:!1,depthWrite:!1})}function Rd(){return new Ht({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:kl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Kt,depthTest:!1,depthWrite:!1})}function kl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ol=class extends kt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Zs(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Kr(5,5,5),s=new Ht({name:"CubemapFromEquirect",uniforms:mr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Jt,blending:Kt});s.uniforms.tEquirect.value=t;let o=new on(r,s),a=t.minFilter;return t.minFilter===Mi&&(t.minFilter=st),new $a(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}};function Hv(i){let e=new WeakMap,t=new WeakMap,n=null;function r(c,d=!1){return c==null?null:d?o(c):s(c)}function s(c){if(c&&c.isTexture){let d=c.mapping;if(d===ri||d===Qa)if(e.has(c)){let x=e.get(c).texture;return a(x,c.mapping)}else{let x=c.image;if(x&&x.height>0){let b=new Ol(x.height);return b.fromEquirectangularTexture(i,c),e.set(c,b),c.addEventListener("dispose",u),a(b.texture,c.mapping)}else return null}}return c}function o(c){if(c&&c.isTexture){let d=c.mapping,x=d===ri||d===Qa,b=d===Vi||d===pr;if(x||b){let p=t.get(c),g=p!==void 0?p.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==g)return n===null&&(n=new Bl(i)),p=x?n.fromEquirectangular(c,p):n.fromCubemap(c,p),p.texture.pmremVersion=c.pmremVersion,t.set(c,p),p.texture;if(p!==void 0)return p.texture;{let S=c.image;return x&&S&&S.height>0||b&&S&&l(S)?(n===null&&(n=new Bl(i)),p=x?n.fromEquirectangular(c):n.fromCubemap(c),p.texture.pmremVersion=c.pmremVersion,t.set(c,p),c.addEventListener("dispose",f),p.texture):null}}}return c}function a(c,d){return d===ri?c.mapping=Vi:d===Qa&&(c.mapping=pr),c}function l(c){let d=0,x=6;for(let b=0;b<x;b++)c[b]!==void 0&&d++;return d===x}function u(c){let d=c.target;d.removeEventListener("dispose",u);let x=e.get(d);x!==void 0&&(e.delete(d),x.dispose())}function f(c){let d=c.target;d.removeEventListener("dispose",f);let x=t.get(d);x!==void 0&&(t.delete(d),x.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:h}}function Gv(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let r=t(n);return r===null&&Fi("WebGLRenderer: "+n+" extension not supported."),r}}}function Wv(i,e,t,n){let r={},s=new WeakMap;function o(h){let c=h.target;c.index!==null&&e.remove(c.index);for(let x in c.attributes)e.remove(c.attributes[x]);c.removeEventListener("dispose",o),delete r[c.id];let d=s.get(c);d&&(e.remove(d),s.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function a(h,c){return r[c.id]===!0||(c.addEventListener("dispose",o),r[c.id]=!0,t.memory.geometries++),c}function l(h){let c=h.attributes;for(let d in c)e.update(c[d],i.ARRAY_BUFFER)}function u(h){let c=[],d=h.index,x=h.attributes.position,b=0;if(x===void 0)return;if(d!==null){let S=d.array;b=d.version;for(let w=0,y=S.length;w<y;w+=3){let T=S[w+0],E=S[w+1],C=S[w+2];c.push(T,E,E,C,C,T)}}else{let S=x.array;b=x.version;for(let w=0,y=S.length/3-1;w<y;w+=3){let T=w+0,E=w+1,C=w+2;c.push(T,E,E,C,C,T)}}let p=new(x.count>=65535?qs:Xs)(c,1);p.version=b;let g=s.get(h);g&&e.remove(g),s.set(h,p)}function f(h){let c=s.get(h);if(c){let d=h.index;d!==null&&c.version<d.version&&u(h)}else u(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:f}}function Xv(i,e,t){let n;function r(h){n=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function l(h,c){i.drawElements(n,c,s,h*o),t.update(c,n,1)}function u(h,c,d){d!==0&&(i.drawElementsInstanced(n,c,s,h*o,d),t.update(c,n,d))}function f(h,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,c,0,s,h,0,d);let b=0;for(let p=0;p<d;p++)b+=c[p];t.update(b,n,1)}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=u,this.renderMultiDraw=f}function qv(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:Je("WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Yv(i,e,t){let n=new WeakMap,r=new bt;function s(o,a,l){let u=o.morphTargetInfluences,f=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=f!==void 0?f.length:0,c=n.get(a);if(c===void 0||c.count!==h){let R=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",R)};c!==void 0&&c.texture.dispose();let d=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,b=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],w=0;d===!0&&(w=1),x===!0&&(w=2),b===!0&&(w=3);let y=a.attributes.position.count*w,T=1;y>e.maxTextureSize&&(T=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let E=new Float32Array(y*T*4*h),C=new Ni(E,y,T,h);C.type=nt,C.needsUpdate=!0;let _=w*4;for(let I=0;I<h;I++){let F=p[I],L=g[I],O=S[I],N=y*T*4*I;for(let V=0;V<F.count;V++){let W=V*_;d===!0&&(r.fromBufferAttribute(F,V),E[N+W+0]=r.x,E[N+W+1]=r.y,E[N+W+2]=r.z,E[N+W+3]=0),x===!0&&(r.fromBufferAttribute(L,V),E[N+W+4]=r.x,E[N+W+5]=r.y,E[N+W+6]=r.z,E[N+W+7]=0),b===!0&&(r.fromBufferAttribute(O,V),E[N+W+8]=r.x,E[N+W+9]=r.y,E[N+W+10]=r.z,E[N+W+11]=O.itemSize===4?r.w:1)}}c={count:h,texture:C,size:new Oe(y,T)},n.set(a,c),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let d=0;for(let b=0;b<u.length;b++)d+=u[b];let x=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",u)}l.getUniforms().setValue(i,"morphTargetsTexture",c.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:s}}function Zv(i,e,t,n,r){let s=new WeakMap;function o(u){let f=r.render.frame,h=u.geometry,c=e.get(u,h);if(s.get(c)!==f&&(e.update(c),s.set(c,f)),u.isInstancedMesh&&(u.hasEventListener("dispose",l)===!1&&u.addEventListener("dispose",l),s.get(u)!==f&&(t.update(u.instanceMatrix,i.ARRAY_BUFFER),u.instanceColor!==null&&t.update(u.instanceColor,i.ARRAY_BUFFER),s.set(u,f))),u.isSkinnedMesh){let d=u.skeleton;s.get(d)!==f&&(d.update(),s.set(d,f))}return c}function a(){s=new WeakMap}function l(u){let f=u.target;f.removeEventListener("dispose",l),n.releaseStatesOfObject(f),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:o,dispose:a}}var $v={[zu]:"LINEAR_TONE_MAPPING",[so]:"REINHARD_TONE_MAPPING",[oo]:"CINEON_TONE_MAPPING",[ao]:"ACES_FILMIC_TONE_MAPPING",[lo]:"AGX_TONE_MAPPING",[co]:"NEUTRAL_TONE_MAPPING",[ku]:"CUSTOM_TONE_MAPPING"};function Jv(i,e,t,n,r,s){let o=new kt(e,t,{type:i,depthBuffer:r,stencilBuffer:s,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,u=new Ft;u.setAttribute("position",new Yt([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Yt([0,2,0,0,2,0],2));let f=new Ua({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new on(u,f),c=new bi(-1,1,1,-1,0,1),d=null,x=null,b=!1,p,g=null,S=[],w=!1;this.setSize=function(y,T){o.setSize(y,T),a!==null&&a.setSize(y,T),l!==null&&l.setSize(y,T);for(let E=0;E<S.length;E++){let C=S[E];C.setSize&&C.setSize(y,T)}},this.setEffects=function(y){S=y,w=S.length>0&&S[0].isRenderPass===!0;let T=o.width,E=o.height;S.length>0&&a===null&&(a=new kt(T,E,{type:ut,depthBuffer:!1,stencilBuffer:!1}),l=new kt(T,E,{type:ut,depthBuffer:!1,stencilBuffer:!1}));for(let C=0;C<S.length;C++){let _=S[C];_.setSize&&_.setSize(T,E)}},this.begin=function(y,T){if(b||y.toneMapping===wn&&S.length===0)return!1;if(g=T,T!==null){let E=T.width,C=T.height;(o.width!==E||o.height!==C)&&this.setSize(E,C)}return w===!1&&y.setRenderTarget(o),p=y.toneMapping,y.toneMapping=wn,!0},this.hasRenderPass=function(){return w},this.end=function(y,T){y.toneMapping=p,b=!0;let E=o,C=a;for(let _=0;_<S.length;_++){let R=S[_];R.enabled!==!1&&(R.render(y,C,E,T),R.needsSwap!==!1&&(E=C,C=C===a?l:a))}if(d!==y.outputColorSpace||x!==y.toneMapping){d=y.outputColorSpace,x=y.toneMapping,f.defines={},dt.getTransfer(d)===Et&&(f.defines.SRGB_TRANSFER="");let _=$v[x];_&&(f.defines[_]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=E.texture,y.setRenderTarget(g),y.render(h,c),g=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),u.dispose(),f.dispose()}}var Zd=new In,uh=new Bi(1,1),$d=new Ni,Jd=new Fa,Kd=new Zs,Cd=[],Id=[],Pd=new Float32Array(16),Dd=new Float32Array(9),Ld=new Float32Array(4);function ls(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=Cd[r];if(s===void 0&&(s=new Float32Array(r),Cd[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function Qt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function jt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Vl(i,e){let t=Id[e];t===void 0&&(t=new Int32Array(e),Id[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Kv(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Qv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;i.uniform2fv(this.addr,e),jt(t,e)}}function jv(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Qt(t,e))return;i.uniform3fv(this.addr,e),jt(t,e)}}function e_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;i.uniform4fv(this.addr,e),jt(t,e)}}function t_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Qt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),jt(t,e)}else{if(Qt(t,n))return;Ld.set(n),i.uniformMatrix2fv(this.addr,!1,Ld),jt(t,n)}}function n_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Qt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),jt(t,e)}else{if(Qt(t,n))return;Dd.set(n),i.uniformMatrix3fv(this.addr,!1,Dd),jt(t,n)}}function i_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Qt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),jt(t,e)}else{if(Qt(t,n))return;Pd.set(n),i.uniformMatrix4fv(this.addr,!1,Pd),jt(t,n)}}function r_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function s_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;i.uniform2iv(this.addr,e),jt(t,e)}}function o_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Qt(t,e))return;i.uniform3iv(this.addr,e),jt(t,e)}}function a_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;i.uniform4iv(this.addr,e),jt(t,e)}}function l_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function c_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Qt(t,e))return;i.uniform2uiv(this.addr,e),jt(t,e)}}function u_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Qt(t,e))return;i.uniform3uiv(this.addr,e),jt(t,e)}}function h_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Qt(t,e))return;i.uniform4uiv(this.addr,e),jt(t,e)}}function f_(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(uh.compareFunction=t.isReversedDepthBuffer()?Fl:Ll,s=uh):s=Zd,t.setTexture2D(e||s,r)}function d_(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Jd,r)}function p_(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Kd,r)}function m_(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||$d,r)}function g_(i){switch(i){case 5126:return Kv;case 35664:return Qv;case 35665:return jv;case 35666:return e_;case 35674:return t_;case 35675:return n_;case 35676:return i_;case 5124:case 35670:return r_;case 35667:case 35671:return s_;case 35668:case 35672:return o_;case 35669:case 35673:return a_;case 5125:return l_;case 36294:return c_;case 36295:return u_;case 36296:return h_;case 35678:case 36198:case 36298:case 36306:case 35682:return f_;case 35679:case 36299:case 36307:return d_;case 35680:case 36300:case 36308:case 36293:return p_;case 36289:case 36303:case 36311:case 36292:return m_}}function x_(i,e){i.uniform1fv(this.addr,e)}function v_(i,e){let t=ls(e,this.size,2);i.uniform2fv(this.addr,t)}function __(i,e){let t=ls(e,this.size,3);i.uniform3fv(this.addr,t)}function y_(i,e){let t=ls(e,this.size,4);i.uniform4fv(this.addr,t)}function S_(i,e){let t=ls(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function b_(i,e){let t=ls(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function M_(i,e){let t=ls(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function T_(i,e){i.uniform1iv(this.addr,e)}function w_(i,e){i.uniform2iv(this.addr,e)}function A_(i,e){i.uniform3iv(this.addr,e)}function E_(i,e){i.uniform4iv(this.addr,e)}function R_(i,e){i.uniform1uiv(this.addr,e)}function C_(i,e){i.uniform2uiv(this.addr,e)}function I_(i,e){i.uniform3uiv(this.addr,e)}function P_(i,e){i.uniform4uiv(this.addr,e)}function D_(i,e,t){let n=this.cache,r=e.length,s=Vl(t,r);Qt(n,s)||(i.uniform1iv(this.addr,s),jt(n,s));let o;this.type===i.SAMPLER_2D_SHADOW?o=uh:o=Zd;for(let a=0;a!==r;++a)t.setTexture2D(e[a]||o,s[a])}function L_(i,e,t){let n=this.cache,r=e.length,s=Vl(t,r);Qt(n,s)||(i.uniform1iv(this.addr,s),jt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Jd,s[o])}function F_(i,e,t){let n=this.cache,r=e.length,s=Vl(t,r);Qt(n,s)||(i.uniform1iv(this.addr,s),jt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Kd,s[o])}function N_(i,e,t){let n=this.cache,r=e.length,s=Vl(t,r);Qt(n,s)||(i.uniform1iv(this.addr,s),jt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||$d,s[o])}function U_(i){switch(i){case 5126:return x_;case 35664:return v_;case 35665:return __;case 35666:return y_;case 35674:return S_;case 35675:return b_;case 35676:return M_;case 5124:case 35670:return T_;case 35667:case 35671:return w_;case 35668:case 35672:return A_;case 35669:case 35673:return E_;case 5125:return R_;case 36294:return C_;case 36295:return I_;case 36296:return P_;case 35678:case 36198:case 36298:case 36306:case 35682:return D_;case 35679:case 36299:case 36307:return L_;case 35680:case 36300:case 36308:case 36293:return F_;case 36289:case 36303:case 36311:case 36292:return N_}}var hh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=g_(t.type)}},fh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=U_(t.type)}},dh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},lh=/(\w+)(\])?(\[|\.)?/g;function Fd(i,e){i.seq.push(e),i.map[e.id]=e}function B_(i,e,t){let n=i.name,r=n.length;for(lh.lastIndex=0;;){let s=lh.exec(n),o=lh.lastIndex,a=s[1],l=s[2]==="]",u=s[3];if(l&&(a=a|0),u===void 0||u==="["&&o+2===r){Fd(t,u===void 0?new hh(a,i,e):new fh(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new dh(a),Fd(t,h)),t=h}}}var os=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);B_(a,l,this)}let r=[],s=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(o):s.push(o);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function Nd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var O_=37297,z_=0;function k_(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Ud=new tt;function V_(i){dt._getMatrix(Ud,dt.workingColorSpace,i);let e=`mat3( ${Ud.elements.map(t=>t.toFixed(4))} )`;switch(dt.getTransfer(i)){case zs:return[e,"LinearTransferOETF"];case Et:return[e,"sRGBTransferOETF"];default:return qe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Bd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+k_(i.getShaderSource(e),a)}else return s}function H_(i,e){let t=V_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var G_={[zu]:"Linear",[so]:"Reinhard",[oo]:"Cineon",[ao]:"ACESFilmic",[lo]:"AgX",[co]:"Neutral",[ku]:"Custom"};function W_(i,e){let t=G_[e];return t===void 0?(qe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ul=new k;function X_(){dt.getLuminanceCoefficients(Ul);let i=Ul.x.toFixed(4),e=Ul.y.toFixed(4),t=Ul.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function q_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Mo).join(`
`)}function Y_(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Z_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Mo(i){return i!==""}function Od(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var $_=/^[ \t]*#include +<([\w\d./]+)>/gm;function ph(i){return i.replace($_,K_)}var J_=new Map;function K_(i,e){let t=lt[e];if(t===void 0){let n=J_.get(e);if(n!==void 0)t=lt[n],qe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return ph(t)}var Q_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function kd(i){return i.replace(Q_,j_)}function j_(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Vd(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var ey={[io]:"SHADOWMAP_TYPE_PCF",[es]:"SHADOWMAP_TYPE_VSM"};function ty(i){return ey[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var ny={[Vi]:"ENVMAP_TYPE_CUBE",[pr]:"ENVMAP_TYPE_CUBE",[uo]:"ENVMAP_TYPE_CUBE_UV"};function iy(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":ny[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var ry={[pr]:"ENVMAP_MODE_REFRACTION"};function sy(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":ry[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var oy={[Ou]:"ENVMAP_BLENDING_MULTIPLY",[rd]:"ENVMAP_BLENDING_MIX",[sd]:"ENVMAP_BLENDING_ADD"};function ay(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":oy[i.combine]||"ENVMAP_BLENDING_NONE"}function ly(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function cy(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=ty(t),u=iy(t),f=sy(t),h=ay(t),c=ly(t),d=q_(t),x=Y_(s),b=r.createProgram(),p,g,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Mo).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Mo).join(`
`),g.length>0&&(g+=`
`)):(p=[Vd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Mo).join(`
`),g=[Vd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",t.envMap?"#define "+h:"",c?"#define CUBEUV_TEXEL_WIDTH "+c.texelWidth:"",c?"#define CUBEUV_TEXEL_HEIGHT "+c.texelHeight:"",c?"#define CUBEUV_MAX_MIP "+c.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==wn?"#define TONE_MAPPING":"",t.toneMapping!==wn?lt.tonemapping_pars_fragment:"",t.toneMapping!==wn?W_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,H_("linearToOutputTexel",t.outputColorSpace),X_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Mo).join(`
`)),o=ph(o),o=Od(o,t),o=zd(o,t),a=ph(a),a=Od(a,t),a=zd(a,t),o=kd(o),a=kd(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,p=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",t.glslVersion===Yu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let w=S+p+o,y=S+g+a,T=Nd(r,r.VERTEX_SHADER,w),E=Nd(r,r.FRAGMENT_SHADER,y);r.attachShader(b,T),r.attachShader(b,E),t.index0AttributeName!==void 0?r.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(b,0,"position"),r.linkProgram(b);function C(F){if(i.debug.checkShaderErrors){let L=r.getProgramInfoLog(b)||"",O=r.getShaderInfoLog(T)||"",N=r.getShaderInfoLog(E)||"",V=L.trim(),W=O.trim(),J=N.trim(),ce=!0,K=!0;if(r.getProgramParameter(b,r.LINK_STATUS)===!1)if(ce=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,b,T,E);else{let ie=Bd(r,T,"vertex"),re=Bd(r,E,"fragment");Je("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(b,r.VALIDATE_STATUS)+`

Material Name: `+F.name+`
Material Type: `+F.type+`

Program Info Log: `+V+`
`+ie+`
`+re)}else V!==""?qe("WebGLProgram: Program Info Log:",V):(W===""||J==="")&&(K=!1);K&&(F.diagnostics={runnable:ce,programLog:V,vertexShader:{log:W,prefix:p},fragmentShader:{log:J,prefix:g}})}r.deleteShader(T),r.deleteShader(E),_=new os(r,b),R=Z_(r,b)}let _;this.getUniforms=function(){return _===void 0&&C(this),_};let R;this.getAttributes=function(){return R===void 0&&C(this),R};let I=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=r.getProgramParameter(b,O_)),I},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=z_++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=T,this.fragmentShader=E,this}var uy=0,mh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new gh(e),t.set(e,n)),n}},gh=class{constructor(e){this.id=uy++,this.code=e,this.usedTimes=0}};function hy(i){return i===cn||i===vo||i===_o}function fy(i,e,t,n,r,s){let o=new Ws,a=new mh,l=new Set,u=[],f=new Map,h=n.logarithmicDepthBuffer,c=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(_){return l.add(_),_===0?"uv":`uv${_}`}function b(_,R,I,F,L,O){let N=F.fog,V=L.geometry,W=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?F.environment:null,J=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,ce=e.get(_.envMap||W,J),K=ce&&ce.mapping===uo?ce.image.height:null,ie=d[_.type];_.precision!==null&&(c=n.getMaxPrecision(_.precision),c!==_.precision&&qe("WebGLProgram.getParameters:",_.precision,"not supported, using",c,"instead."));let re=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Te=re!==void 0?re.length:0,ve=0;V.morphAttributes.position!==void 0&&(ve=1),V.morphAttributes.normal!==void 0&&(ve=2),V.morphAttributes.color!==void 0&&(ve=3);let Qe,Ue,et,Q;if(ie){let Dt=oi[ie];Qe=Dt.vertexShader,Ue=Dt.fragmentShader}else{Qe=_.vertexShader,Ue=_.fragmentShader;let Dt=a.getVertexShaderStage(_),yt=a.getFragmentShaderStage(_);a.update(_,Dt,yt),et=Dt.id,Q=yt.id}let le=i.getRenderTarget(),Re=i.state.buffers.depth.getReversed(),We=L.isInstancedMesh===!0,Ce=L.isBatchedMesh===!0,Ye=!!_.map,Pt=!!_.matcap,it=!!ce,ht=!!_.aoMap,At=!!_.lightMap,ct=!!_.bumpMap&&_.wireframe===!1,Bt=!!_.normalMap,qt=!!_.displacementMap,hn=!!_.emissiveMap,Ot=!!_.metalnessMap,Gt=!!_.roughnessMap,X=_.anisotropy>0,en=_.clearcoat>0,gt=_.dispersion>0,z=_.retroreflectivity>0,A=_.iridescence>0,Z=_.sheen>0,j=_.transmission>0,se=X&&!!_.anisotropyMap,ye=en&&!!_.clearcoatMap,be=en&&!!_.clearcoatNormalMap,ae=en&&!!_.clearcoatRoughnessMap,he=A&&!!_.iridescenceMap,Ae=A&&!!_.iridescenceThicknessMap,Le=Z&&!!_.sheenColorMap,_e=Z&&!!_.sheenRoughnessMap,we=!!_.specularMap,Be=!!_.specularColorMap,Ne=!!_.specularIntensityMap,ke=j&&!!_.transmissionMap,G=j&&!!_.thicknessMap,ee=!!_.gradientMap,ue=!!_.alphaMap,Ee=_.alphaTest>0,Pe=!!_.alphaHash,de=!!_.extensions,He=wn;_.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(He=i.toneMapping);let ze={shaderID:ie,shaderType:_.type,shaderName:_.name,vertexShader:Qe,fragmentShader:Ue,defines:_.defines,customVertexShaderID:et,customFragmentShaderID:Q,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:c,batching:Ce,batchingColor:Ce&&L._colorsTexture!==null,instancing:We,instancingColor:We&&L.instanceColor!==null,instancingMorph:We&&L.morphTexture!==null,outputColorSpace:le===null?i.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:dt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Ye,matcap:Pt,envMap:it,envMapMode:it&&ce.mapping,envMapCubeUVHeight:K,aoMap:ht,lightMap:At,bumpMap:ct,normalMap:Bt,displacementMap:qt,emissiveMap:hn,normalMapObjectSpace:Bt&&_.normalMapType===ld,normalMapTangentSpace:Bt&&_.normalMapType===Dl,packedNormalMap:Bt&&_.normalMapType===Dl&&hy(_.normalMap.format),metalnessMap:Ot,roughnessMap:Gt,anisotropy:X,anisotropyMap:se,clearcoat:en,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:ae,dispersion:gt,retroreflection:z,iridescence:A,iridescenceMap:he,iridescenceThicknessMap:Ae,sheen:Z,sheenColorMap:Le,sheenRoughnessMap:_e,specularMap:we,specularColorMap:Be,specularIntensityMap:Ne,transmission:j,transmissionMap:ke,thicknessMap:G,gradientMap:ee,opaque:_.transparent===!1&&_.blending===ii&&_.alphaToCoverage===!1,alphaMap:ue,alphaTest:Ee,alphaHash:Pe,combine:_.combine,mapUv:Ye&&x(_.map.channel),aoMapUv:ht&&x(_.aoMap.channel),lightMapUv:At&&x(_.lightMap.channel),bumpMapUv:ct&&x(_.bumpMap.channel),normalMapUv:Bt&&x(_.normalMap.channel),displacementMapUv:qt&&x(_.displacementMap.channel),emissiveMapUv:hn&&x(_.emissiveMap.channel),metalnessMapUv:Ot&&x(_.metalnessMap.channel),roughnessMapUv:Gt&&x(_.roughnessMap.channel),anisotropyMapUv:se&&x(_.anisotropyMap.channel),clearcoatMapUv:ye&&x(_.clearcoatMap.channel),clearcoatNormalMapUv:be&&x(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ae&&x(_.clearcoatRoughnessMap.channel),iridescenceMapUv:he&&x(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ae&&x(_.iridescenceThicknessMap.channel),sheenColorMapUv:Le&&x(_.sheenColorMap.channel),sheenRoughnessMapUv:_e&&x(_.sheenRoughnessMap.channel),specularMapUv:we&&x(_.specularMap.channel),specularColorMapUv:Be&&x(_.specularColorMap.channel),specularIntensityMapUv:Ne&&x(_.specularIntensityMap.channel),transmissionMapUv:ke&&x(_.transmissionMap.channel),thicknessMapUv:G&&x(_.thicknessMap.channel),alphaMapUv:ue&&x(_.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Bt||X),vertexNormals:!!V.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!V.attributes.uv&&(Ye||ue),fog:!!N,useFog:_.fog===!0,fogExp2:!!N&&N.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||V.attributes.normal===void 0&&Bt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Re,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Te,morphTextureStride:ve,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:He,decodeVideoTexture:Ye&&_.map.isVideoTexture===!0&&dt.getTransfer(_.map.colorSpace)===Et,decodeVideoTextureEmissive:hn&&_.emissiveMap.isVideoTexture===!0&&dt.getTransfer(_.emissiveMap.colorSpace)===Et,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===_n,flipSided:_.side===Jt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:de&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(de&&_.extensions.multiDraw===!0||Ce)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return ze.vertexUv1s=l.has(1),ze.vertexUv2s=l.has(2),ze.vertexUv3s=l.has(3),l.clear(),ze}function p(_){let R=[];if(_.shaderID?R.push(_.shaderID):(R.push(_.customVertexShaderID),R.push(_.customFragmentShaderID)),_.defines!==void 0)for(let I in _.defines)R.push(I),R.push(_.defines[I]);return _.isRawShaderMaterial===!1&&(g(R,_),S(R,_),R.push(i.outputColorSpace)),R.push(_.customProgramCacheKey),R.join()}function g(_,R){_.push(R.precision),_.push(R.outputColorSpace),_.push(R.envMapMode),_.push(R.envMapCubeUVHeight),_.push(R.mapUv),_.push(R.alphaMapUv),_.push(R.lightMapUv),_.push(R.aoMapUv),_.push(R.bumpMapUv),_.push(R.normalMapUv),_.push(R.displacementMapUv),_.push(R.emissiveMapUv),_.push(R.metalnessMapUv),_.push(R.roughnessMapUv),_.push(R.anisotropyMapUv),_.push(R.clearcoatMapUv),_.push(R.clearcoatNormalMapUv),_.push(R.clearcoatRoughnessMapUv),_.push(R.iridescenceMapUv),_.push(R.iridescenceThicknessMapUv),_.push(R.sheenColorMapUv),_.push(R.sheenRoughnessMapUv),_.push(R.specularMapUv),_.push(R.specularColorMapUv),_.push(R.specularIntensityMapUv),_.push(R.transmissionMapUv),_.push(R.thicknessMapUv),_.push(R.combine),_.push(R.fogExp2),_.push(R.sizeAttenuation),_.push(R.morphTargetsCount),_.push(R.morphAttributeCount),_.push(R.numSunLights),_.push(R.numDirLights),_.push(R.numPointLights),_.push(R.numSpotLights),_.push(R.numSpotLightMaps),_.push(R.numHemiLights),_.push(R.numRectAreaLights),_.push(R.numSunLightShadows),_.push(R.numDirLightShadows),_.push(R.numPointLightShadows),_.push(R.numSpotLightShadows),_.push(R.numSpotLightShadowsWithMaps),_.push(R.numLightProbes),_.push(R.shadowMapType),_.push(R.toneMapping),_.push(R.numClippingPlanes),_.push(R.numClipIntersection),_.push(R.depthPacking)}function S(_,R){o.disableAll(),R.instancing&&o.enable(0),R.instancingColor&&o.enable(1),R.instancingMorph&&o.enable(2),R.matcap&&o.enable(3),R.envMap&&o.enable(4),R.normalMapObjectSpace&&o.enable(5),R.normalMapTangentSpace&&o.enable(6),R.clearcoat&&o.enable(7),R.iridescence&&o.enable(8),R.alphaTest&&o.enable(9),R.vertexColors&&o.enable(10),R.vertexAlphas&&o.enable(11),R.vertexUv1s&&o.enable(12),R.vertexUv2s&&o.enable(13),R.vertexUv3s&&o.enable(14),R.vertexTangents&&o.enable(15),R.anisotropy&&o.enable(16),R.alphaHash&&o.enable(17),R.batching&&o.enable(18),R.dispersion&&o.enable(19),R.retroreflection&&o.enable(24),R.batchingColor&&o.enable(20),R.gradientMap&&o.enable(21),R.packedNormalMap&&o.enable(22),R.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),R.fog&&o.enable(0),R.useFog&&o.enable(1),R.flatShading&&o.enable(2),R.logarithmicDepthBuffer&&o.enable(3),R.reversedDepthBuffer&&o.enable(4),R.skinning&&o.enable(5),R.morphTargets&&o.enable(6),R.morphNormals&&o.enable(7),R.morphColors&&o.enable(8),R.premultipliedAlpha&&o.enable(9),R.shadowMapEnabled&&o.enable(10),R.doubleSided&&o.enable(11),R.flipSided&&o.enable(12),R.useDepthPacking&&o.enable(13),R.dithering&&o.enable(14),R.transmission&&o.enable(15),R.sheen&&o.enable(16),R.opaque&&o.enable(17),R.pointsUvs&&o.enable(18),R.decodeVideoTexture&&o.enable(19),R.decodeVideoTextureEmissive&&o.enable(20),R.alphaToCoverage&&o.enable(21),R.numLightProbeGrids>0&&o.enable(22),R.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function w(_){let R=d[_.type],I;if(R){let F=oi[R];I=bd.clone(F.uniforms)}else I=_.uniforms;return I}function y(_,R){let I=f.get(R);return I!==void 0?++I.usedTimes:(I=new cy(i,R,_,r),u.push(I),f.set(R,I)),I}function T(_){if(--_.usedTimes===0){let R=u.indexOf(_);u[R]=u[u.length-1],u.pop(),f.delete(_.cacheKey),_.destroy()}}function E(_){a.remove(_)}function C(){a.dispose()}return{getParameters:b,getProgramCacheKey:p,getUniforms:w,acquireProgram:y,releaseProgram:T,releaseShaderCache:E,programs:u,dispose:C}}function dy(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function py(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Hd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Gd(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(c){let d=0;return c.isInstancedMesh&&(d+=2),c.isSkinnedMesh&&(d+=1),d}function a(c,d,x,b,p,g){let S=i[e];return S===void 0?(S={id:c.id,object:c,geometry:d,material:x,materialVariant:o(c),groupOrder:b,renderOrder:c.renderOrder,z:p,group:g},i[e]=S):(S.id=c.id,S.object=c,S.geometry=d,S.material=x,S.materialVariant=o(c),S.groupOrder=b,S.renderOrder=c.renderOrder,S.z=p,S.group=g),e++,S}function l(c,d,x,b,p,g,S){S.reversedDepth===!0&&(p=-p);let w=a(c,d,x,b,p,g);x.transmission>0?n.push(w):x.transparent===!0?r.push(w):t.push(w)}function u(c,d,x,b,p,g){let S=a(c,d,x,b,p,g);x.transmission>0?n.unshift(S):x.transparent===!0?r.unshift(S):t.unshift(S)}function f(c,d){t.length>1&&t.sort(c||py),n.length>1&&n.sort(d||Hd),r.length>1&&r.sort(d||Hd)}function h(){for(let c=e,d=i.length;c<d;c++){let x=i[c];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:l,unshift:u,finish:h,sort:f}}function my(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new Gd,i.set(n,[o])):r>=s.length?(o=new Gd,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function gy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new k,color:new Ke};break;case"SpotLight":t={position:new k,direction:new k,color:new Ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new k,color:new Ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new k,skyColor:new Ke,groundColor:new Ke};break;case"RectAreaLight":t={color:new Ke,position:new k,halfWidth:new k,halfHeight:new k};break}return i[e.id]=t,t}}}function xy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var vy=0;function _y(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function yy(i){let e=new gy,t=xy(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)n.probe.push(new k);let r=new k,s=new $e,o=new $e;function a(u){let f=0,h=0,c=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let d=0,x=0,b=0,p=0,g=0,S=0,w=0,y=0,T=0,E=0,C=0,_=0,R=0,I=0;u.sort(_y);for(let L=0,O=u.length;L<O;L++){let N=u[L],V=N.color,W=N.intensity,J=N.distance,ce=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===cn?ce=N.shadow.map.texture:ce=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)f+=V.r*W,h+=V.g*W,c+=V.b*W;else if(N.isLightProbe){for(let K=0;K<9;K++)n.probe[K].addScaledVector(N.sh.coefficients[K],W);I++}else if(N.isSunLight){let K=e.get(N);if(K.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let ie=N.shadow,re=t.get(N);re.shadowIntensity=ie.intensity,re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize.copy(ie.mapSize).multiply(ie.getFrameExtents()),n.sunShadow[x]=re,n.sunShadowMap[x]=ce;let Te=ie.getViewportCount();for(let ve=0;ve<Te;ve++)n.sunShadowMatrix[b+ve]=ie.getMatrix(ve),n.sunShadowCascade[b+ve]=ie._cascadeData[ve];b+=Te,x++}n.sun[d]=K,d++}else if(N.isDirectionalLight){let K=e.get(N);if(K.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let ie=N.shadow,re=t.get(N);re.shadowIntensity=ie.intensity,re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize=ie.mapSize,n.directionalShadow[p]=re,n.directionalShadowMap[p]=ce,n.directionalShadowMatrix[p]=N.shadow.matrix,T++}n.directional[p]=K,p++}else if(N.isSpotLight){let K=e.get(N);K.position.setFromMatrixPosition(N.matrixWorld),K.color.copy(V).multiplyScalar(W),K.distance=J,K.coneCos=Math.cos(N.angle),K.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),K.decay=N.decay,n.spot[S]=K;let ie=N.shadow;if(N.map&&(n.spotLightMap[_]=N.map,_++,ie.updateMatrices(N),N.castShadow&&R++),n.spotLightMatrix[S]=ie.matrix,N.castShadow){let re=t.get(N);re.shadowIntensity=ie.intensity,re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize=ie.mapSize,n.spotShadow[S]=re,n.spotShadowMap[S]=ce,C++}S++}else if(N.isRectAreaLight){let K=e.get(N);K.color.copy(V).multiplyScalar(W),K.halfWidth.set(N.width*.5,0,0),K.halfHeight.set(0,N.height*.5,0),n.rectArea[w]=K,w++}else if(N.isPointLight){let K=e.get(N);if(K.color.copy(N.color).multiplyScalar(N.intensity),K.distance=N.distance,K.decay=N.decay,N.castShadow){let ie=N.shadow,re=t.get(N);re.shadowIntensity=ie.intensity,re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize=ie.mapSize,re.shadowCameraNear=ie.camera.near,re.shadowCameraFar=ie.camera.far,n.pointShadow[g]=re,n.pointShadowMap[g]=ce,n.pointShadowMatrix[g]=N.shadow.matrix,E++}n.point[g]=K,g++}else if(N.isHemisphereLight){let K=e.get(N);K.skyColor.copy(N.color).multiplyScalar(W),K.groundColor.copy(N.groundColor).multiplyScalar(W),n.hemi[y]=K,y++}}w>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ie.LTC_FLOAT_1,n.rectAreaLTC2=Ie.LTC_FLOAT_2):(n.rectAreaLTC1=Ie.LTC_HALF_1,n.rectAreaLTC2=Ie.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=h,n.ambient[2]=c;let F=n.hash;(F.sunLength!==d||F.directionalLength!==p||F.pointLength!==g||F.spotLength!==S||F.rectAreaLength!==w||F.hemiLength!==y||F.numSunShadows!==x||F.numDirectionalShadows!==T||F.numPointShadows!==E||F.numSpotShadows!==C||F.numSpotMaps!==_||F.numLightProbes!==I)&&(n.sun.length=d,n.directional.length=p,n.spot.length=S,n.rectArea.length=w,n.point.length=g,n.hemi.length=y,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=b,n.sunShadowCascade.length=b,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=C,n.spotShadowMap.length=C,n.spotLightMatrix.length=C+_-R,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=I,F.sunLength=d,F.directionalLength=p,F.pointLength=g,F.spotLength=S,F.rectAreaLength=w,F.hemiLength=y,F.numSunShadows=x,F.numDirectionalShadows=T,F.numPointShadows=E,F.numSpotShadows=C,F.numSpotMaps=_,F.numLightProbes=I,n.version=vy++)}function l(u,f){let h=0,c=0,d=0,x=0,b=0,p=0,g=f.matrixWorldInverse;for(let S=0,w=u.length;S<w;S++){let y=u[S];if(y.isSunLight){let T=n.sun[h];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(g),h++}else if(y.isDirectionalLight){let T=n.directional[c];T.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(g),c++}else if(y.isSpotLight){let T=n.spot[x];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(g),T.direction.setFromMatrixPosition(y.matrixWorld),r.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(g),x++}else if(y.isRectAreaLight){let T=n.rectArea[b];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(g),o.identity(),s.copy(y.matrixWorld),s.premultiply(g),o.extractRotation(s),T.halfWidth.set(y.width*.5,0,0),T.halfHeight.set(0,y.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),b++}else if(y.isPointLight){let T=n.point[d];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(g),d++}else if(y.isHemisphereLight){let T=n.hemi[p];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(g),p++}}}return{setup:a,setupView:l,state:n}}function Wd(i){let e=new yy(i),t=[],n=[],r=[];function s(c){h.camera=c,t.length=0,n.length=0,r.length=0}function o(c){t.push(c)}function a(c){n.push(c)}function l(c){r.push(c)}function u(){e.setup(t)}function f(c){e.setupView(t,c)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:h,setupLights:u,setupLightsView:f,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function Sy(i){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new Wd(i),e.set(r,[a])):s>=o.length?(a=new Wd(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var by=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,My=`uniform sampler2D shadow_pass;
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
}`,Ty=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],wy=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],Xd=new $e,bo=new k,ch=new k;function Ay(i,e,t){let n=new Ys,r=new Oe,s=new Oe,o=new bt,a=new Ba,l=new Oa,u={},f=t.maxTextureSize,h={[Tn]:Jt,[Jt]:Tn,[_n]:_n},c=new Ht({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:by,fragmentShader:My}),d=c.clone();d.defines.HORIZONTAL_PASS=1;let x=new Ft;x.setAttribute("position",new xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new on(x,c),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=io;let g=this.type;this.render=function(E,C,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===zf&&(qe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=io);let R=i.getRenderTarget(),I=i.getActiveCubeFace(),F=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Kt),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let O=g!==this.type;O&&C.traverse(function(N){N.material&&(Array.isArray(N.material)?N.material.forEach(V=>V.needsUpdate=!0):N.material.needsUpdate=!0)});for(let N=0,V=E.length;N<V;N++){let W=E[N],J=W.shadow;if(J===void 0){qe("WebGLShadowMap:",W,"has no shadow.");continue}if(J.autoUpdate===!1&&J.needsUpdate===!1)continue;r.copy(J.mapSize);let ce=J.getFrameExtents();r.multiply(ce),s.copy(J.mapSize),(r.x>f||r.y>f)&&(r.x>f&&(s.x=Math.floor(f/ce.x),r.x=s.x*ce.x,J.mapSize.x=s.x),r.y>f&&(s.y=Math.floor(f/ce.y),r.y=s.y*ce.y,J.mapSize.y=s.y));let K=i.state.buffers.depth.getReversed();if(J.camera._reversedDepth=K,J.map===null||O===!0){if(J.map!==null&&(J.map.depthTexture!==null&&(J.map.depthTexture.dispose(),J.map.depthTexture=null),J.map.dispose()),this.type===es){if(W.isPointLight){qe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}J.map=new kt(r.x,r.y,{format:cn,type:ut,minFilter:st,magFilter:st,generateMipmaps:!1}),J.map.texture.name=W.name+".shadowMap",J.map.depthTexture=new Bi(r.x,r.y,nt),J.map.depthTexture.name=W.name+".shadowMapDepth",J.map.depthTexture.format=ti,J.map.depthTexture.compareFunction=null,J.map.depthTexture.minFilter=je,J.map.depthTexture.magFilter=je}else W.isPointLight?(J.map=new Ol(r.x),J.map.depthTexture=new Na(r.x,ln)):(J.map=new kt(r.x,r.y),J.map.depthTexture=new Bi(r.x,r.y,ln)),J.map.depthTexture.name=W.name+".shadowMap",J.map.depthTexture.format=ti,this.type===io?(J.map.depthTexture.compareFunction=K?Fl:Ll,J.map.depthTexture.minFilter=st,J.map.depthTexture.magFilter=st):(J.map.depthTexture.compareFunction=null,J.map.depthTexture.minFilter=je,J.map.depthTexture.magFilter=je);J.camera.updateProjectionMatrix()}J.map.isWebGLCubeRenderTarget!==!0&&(J.map.width!==r.x||J.map.height!==r.y)&&J.map.setSize(r.x,r.y);let ie=J.map.isWebGLCubeRenderTarget?6:J.getViewportCount();W.isPointLight!==!0&&J.updateMatrices(W,_);for(let re=0;re<ie;re++){let Te=J.getCamera(re);if(W.isPointLight){let ve=J.camera,Qe=J.matrix,Ue=W.distance||ve.far;Ue!==ve.far&&(ve.far=Ue,ve.updateProjectionMatrix()),bo.setFromMatrixPosition(W.matrixWorld),ve.position.copy(bo),ch.copy(ve.position),ch.add(Ty[re]),ve.up.copy(wy[re]),ve.lookAt(ch),ve.updateMatrixWorld(),Qe.makeTranslation(-bo.x,-bo.y,-bo.z),Xd.multiplyMatrices(ve.projectionMatrix,ve.matrixWorldInverse),J._frustum.setFromProjectionMatrix(Xd,ve.coordinateSystem,ve.reversedDepth)}if(J.map.isWebGLCubeRenderTarget)i.setRenderTarget(J.map,re),i.clear();else{re===0&&(i.setRenderTarget(J.map),i.clear());let ve=J.getViewport(re);o.set(s.x*ve.x,s.y*ve.y,s.x*ve.z,s.y*ve.w),L.viewport(o)}n=J.getFrustum(re),y(C,_,Te,W,this.type)}J.isPointLightShadow!==!0&&this.type===es&&S(J,_),J.needsUpdate=!1}g=this.type,p.needsUpdate=!1,i.setRenderTarget(R,I,F)};function S(E,C){let _=e.update(b);c.defines.VSM_SAMPLES!==E.blurSamples&&(c.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,c.needsUpdate=!0,d.needsUpdate=!0),E.mapPass===null?E.mapPass=new kt(r.x,r.y,{format:cn,type:ut}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),c.uniforms.shadow_pass.value=E.map.depthTexture,c.uniforms.resolution.value.set(E.map.width,E.map.height),c.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(C,null,_,c,b,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(C,null,_,d,b,null)}function w(E,C,_,R){let I=null,F=_.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(F!==void 0)I=F;else if(I=_.isPointLight===!0?l:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let L=I.uuid,O=C.uuid,N=u[L];N===void 0&&(N={},u[L]=N);let V=N[O];V===void 0&&(V=I.clone(),N[O]=V,C.addEventListener("dispose",T)),I=V}if(I.visible=C.visible,I.wireframe=C.wireframe,R===es?I.side=C.shadowSide!==null?C.shadowSide:C.side:I.side=C.shadowSide!==null?C.shadowSide:h[C.side],I.alphaMap=C.alphaMap,I.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,I.map=C.map,I.clipShadows=C.clipShadows,I.clippingPlanes=C.clippingPlanes,I.clipIntersection=C.clipIntersection,I.displacementMap=C.displacementMap,I.displacementScale=C.displacementScale,I.displacementBias=C.displacementBias,I.wireframeLinewidth=C.wireframeLinewidth,I.linewidth=C.linewidth,_.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let L=i.properties.get(I);L.light=_}return I}function y(E,C,_,R,I){if(E.visible===!1)return;if(E.layers.test(C.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&I===es)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,E.matrixWorld);let O=e.update(E),N=E.material;if(Array.isArray(N)){let V=O.groups;for(let W=0,J=V.length;W<J;W++){let ce=V[W],K=N[ce.materialIndex];if(K&&K.visible){let ie=w(E,K,R,I);E.onBeforeShadow(i,E,C,_,O,ie,ce),i.renderBufferDirect(_,null,O,ie,E,ce),E.onAfterShadow(i,E,C,_,O,ie,ce)}}}else if(N.visible){let V=w(E,N,R,I);E.onBeforeShadow(i,E,C,_,O,V,null),i.renderBufferDirect(_,null,O,V,E,null),E.onAfterShadow(i,E,C,_,O,V,null)}}let L=E.children;for(let O=0,N=L.length;O<N;O++)y(L[O],C,_,R,I)}function T(E){E.target.removeEventListener("dispose",T);for(let _ in u){let R=u[_],I=E.target.uuid;I in R&&(R[I].dispose(),delete R[I])}}}function Ey(i,e){function t(){let G=!1,ee=new bt,ue=null,Ee=new bt(0,0,0,0);return{setMask:function(Pe){ue!==Pe&&!G&&(i.colorMask(Pe,Pe,Pe,Pe),ue=Pe)},setLocked:function(Pe){G=Pe},setClear:function(Pe,de,He,ze,Dt){Dt===!0&&(Pe*=ze,de*=ze,He*=ze),ee.set(Pe,de,He,ze),Ee.equals(ee)===!1&&(i.clearColor(Pe,de,He,ze),Ee.copy(ee))},reset:function(){G=!1,ue=null,Ee.set(-1,0,0,0)}}}function n(){let G=!1,ee=!1,ue=null,Ee=null,Pe=null;return{setReversed:function(de){if(ee!==de){let He=e.get("EXT_clip_control");de?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),ee=de;let ze=Pe;Pe=null,this.setClear(ze)}},getReversed:function(){return ee},setTest:function(de){de?le(i.DEPTH_TEST):Re(i.DEPTH_TEST)},setMask:function(de){ue!==de&&!G&&(i.depthMask(de),ue=de)},setFunc:function(de){if(ee&&(de=yd[de]),Ee!==de){switch(de){case ba:i.depthFunc(i.NEVER);break;case Ma:i.depthFunc(i.ALWAYS);break;case Ta:i.depthFunc(i.LESS);break;case qr:i.depthFunc(i.LEQUAL);break;case wa:i.depthFunc(i.EQUAL);break;case Aa:i.depthFunc(i.GEQUAL);break;case Ea:i.depthFunc(i.GREATER);break;case Ra:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Ee=de}},setLocked:function(de){G=de},setClear:function(de){Pe!==de&&(Pe=de,ee&&(de=1-de),i.clearDepth(de))},reset:function(){G=!1,ue=null,Ee=null,Pe=null,ee=!1}}}function r(){let G=!1,ee=null,ue=null,Ee=null,Pe=null,de=null,He=null,ze=null,Dt=null;return{setTest:function(yt){G||(yt?le(i.STENCIL_TEST):Re(i.STENCIL_TEST))},setMask:function(yt){ee!==yt&&!G&&(i.stencilMask(yt),ee=yt)},setFunc:function(yt,Ln,kn){(ue!==yt||Ee!==Ln||Pe!==kn)&&(i.stencilFunc(yt,Ln,kn),ue=yt,Ee=Ln,Pe=kn)},setOp:function(yt,Ln,kn){(de!==yt||He!==Ln||ze!==kn)&&(i.stencilOp(yt,Ln,kn),de=yt,He=Ln,ze=kn)},setLocked:function(yt){G=yt},setClear:function(yt){Dt!==yt&&(i.clearStencil(yt),Dt=yt)},reset:function(){G=!1,ee=null,ue=null,Ee=null,Pe=null,de=null,He=null,ze=null,Dt=null}}}let s=new t,o=new n,a=new r,l=new WeakMap,u=new WeakMap,f={},h={},c={},d=new WeakMap,x=[],b=null,p=!1,g=null,S=null,w=null,y=null,T=null,E=null,C=null,_=new Ke(0,0,0),R=0,I=!1,F=null,L=null,O=null,N=null,V=null,W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),J=!1,ce=0,K=i.getParameter(i.VERSION);K.indexOf("WebGL")!==-1?(ce=parseFloat(/^WebGL (\d)/.exec(K)[1]),J=ce>=1):K.indexOf("OpenGL ES")!==-1&&(ce=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),J=ce>=2);let ie=null,re={},Te=i.getParameter(i.SCISSOR_BOX),ve=i.getParameter(i.VIEWPORT),Qe=new bt().fromArray(Te),Ue=new bt().fromArray(ve);function et(G,ee,ue,Ee){let Pe=new Uint8Array(4),de=i.createTexture();i.bindTexture(G,de),i.texParameteri(G,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(G,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let He=0;He<ue;He++)G===i.TEXTURE_3D||G===i.TEXTURE_2D_ARRAY?i.texImage3D(ee,0,i.RGBA,1,1,Ee,0,i.RGBA,i.UNSIGNED_BYTE,Pe):i.texImage2D(ee+He,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Pe);return de}let Q={};Q[i.TEXTURE_2D]=et(i.TEXTURE_2D,i.TEXTURE_2D,1),Q[i.TEXTURE_CUBE_MAP]=et(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Q[i.TEXTURE_2D_ARRAY]=et(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Q[i.TEXTURE_3D]=et(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),le(i.DEPTH_TEST),o.setFunc(qr),ct(!1),Bt(Lu),le(i.CULL_FACE),ht(Kt);function le(G){f[G]!==!0&&(i.enable(G),f[G]=!0)}function Re(G){f[G]!==!1&&(i.disable(G),f[G]=!1)}function We(G,ee){return c[G]!==ee?(i.bindFramebuffer(G,ee),c[G]=ee,G===i.DRAW_FRAMEBUFFER&&(c[i.FRAMEBUFFER]=ee),G===i.FRAMEBUFFER&&(c[i.DRAW_FRAMEBUFFER]=ee),!0):!1}function Ce(G,ee){let ue=x,Ee=!1;if(G){ue=d.get(ee),ue===void 0&&(ue=[],d.set(ee,ue));let Pe=G.textures;if(ue.length!==Pe.length||ue[0]!==i.COLOR_ATTACHMENT0){for(let de=0,He=Pe.length;de<He;de++)ue[de]=i.COLOR_ATTACHMENT0+de;ue.length=Pe.length,Ee=!0}}else ue[0]!==i.BACK&&(ue[0]=i.BACK,Ee=!0);Ee&&i.drawBuffers(ue)}function Ye(G){return b!==G?(i.useProgram(G),b=G,!0):!1}let Pt={[dr]:i.FUNC_ADD,[Vf]:i.FUNC_SUBTRACT,[Hf]:i.FUNC_REVERSE_SUBTRACT};Pt[Gf]=i.MIN,Pt[Wf]=i.MAX;let it={[Xf]:i.ZERO,[qf]:i.ONE,[Yf]:i.SRC_COLOR,[Uu]:i.SRC_ALPHA,[jf]:i.SRC_ALPHA_SATURATE,[Kf]:i.DST_COLOR,[$f]:i.DST_ALPHA,[Zf]:i.ONE_MINUS_SRC_COLOR,[Bu]:i.ONE_MINUS_SRC_ALPHA,[Qf]:i.ONE_MINUS_DST_COLOR,[Jf]:i.ONE_MINUS_DST_ALPHA,[ed]:i.CONSTANT_COLOR,[td]:i.ONE_MINUS_CONSTANT_COLOR,[nd]:i.CONSTANT_ALPHA,[id]:i.ONE_MINUS_CONSTANT_ALPHA};function ht(G,ee,ue,Ee,Pe,de,He,ze,Dt,yt){if(G===Kt){p===!0&&(Re(i.BLEND),p=!1);return}if(p===!1&&(le(i.BLEND),p=!0),G!==kf){if(G!==g||yt!==I){if((S!==dr||T!==dr)&&(i.blendEquation(i.FUNC_ADD),S=dr,T=dr),yt)switch(G){case ii:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ro:i.blendFunc(i.ONE,i.ONE);break;case Fu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Nu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Je("WebGLState: Invalid blending: ",G);break}else switch(G){case ii:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ro:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Fu:Je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Nu:Je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Je("WebGLState: Invalid blending: ",G);break}w=null,y=null,E=null,C=null,_.set(0,0,0),R=0,g=G,I=yt}return}Pe=Pe||ee,de=de||ue,He=He||Ee,(ee!==S||Pe!==T)&&(i.blendEquationSeparate(Pt[ee],Pt[Pe]),S=ee,T=Pe),(ue!==w||Ee!==y||de!==E||He!==C)&&(i.blendFuncSeparate(it[ue],it[Ee],it[de],it[He]),w=ue,y=Ee,E=de,C=He),(ze.equals(_)===!1||Dt!==R)&&(i.blendColor(ze.r,ze.g,ze.b,Dt),_.copy(ze),R=Dt),g=G,I=!1}function At(G,ee){G.side===_n?Re(i.CULL_FACE):le(i.CULL_FACE);let ue=G.side===Jt;ee&&(ue=!ue),ct(ue),G.blending===ii&&G.transparent===!1?ht(Kt):ht(G.blending,G.blendEquation,G.blendSrc,G.blendDst,G.blendEquationAlpha,G.blendSrcAlpha,G.blendDstAlpha,G.blendColor,G.blendAlpha,G.premultipliedAlpha),o.setFunc(G.depthFunc),o.setTest(G.depthTest),o.setMask(G.depthWrite),s.setMask(G.colorWrite);let Ee=G.stencilWrite;a.setTest(Ee),Ee&&(a.setMask(G.stencilWriteMask),a.setFunc(G.stencilFunc,G.stencilRef,G.stencilFuncMask),a.setOp(G.stencilFail,G.stencilZFail,G.stencilZPass)),hn(G.polygonOffset,G.polygonOffsetFactor,G.polygonOffsetUnits),G.alphaToCoverage===!0?le(i.SAMPLE_ALPHA_TO_COVERAGE):Re(i.SAMPLE_ALPHA_TO_COVERAGE)}function ct(G){F!==G&&(G?i.frontFace(i.CW):i.frontFace(i.CCW),F=G)}function Bt(G){G!==Bf?(le(i.CULL_FACE),G!==L&&(G===Lu?i.cullFace(i.BACK):G===Of?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Re(i.CULL_FACE),L=G}function qt(G){G!==O&&(J&&i.lineWidth(G),O=G)}function hn(G,ee,ue){G?(le(i.POLYGON_OFFSET_FILL),(N!==ee||V!==ue)&&(N=ee,V=ue,o.getReversed()&&(ee=-ee),i.polygonOffset(ee,ue))):Re(i.POLYGON_OFFSET_FILL)}function Ot(G){G?le(i.SCISSOR_TEST):Re(i.SCISSOR_TEST)}function Gt(G){G===void 0&&(G=i.TEXTURE0+W-1),ie!==G&&(i.activeTexture(G),ie=G)}function X(G,ee,ue){ue===void 0&&(ie===null?ue=i.TEXTURE0+W-1:ue=ie);let Ee=re[ue];Ee===void 0&&(Ee={type:void 0,texture:void 0},re[ue]=Ee),(Ee.type!==G||Ee.texture!==ee)&&(ie!==ue&&(i.activeTexture(ue),ie=ue),i.bindTexture(G,ee||Q[G]),Ee.type=G,Ee.texture=ee)}function en(){let G=re[ie];G!==void 0&&G.type!==void 0&&(i.bindTexture(G.type,null),G.type=void 0,G.texture=void 0)}function gt(){try{i.compressedTexImage2D(...arguments)}catch(G){Je("WebGLState:",G)}}function z(){try{i.compressedTexImage3D(...arguments)}catch(G){Je("WebGLState:",G)}}function A(){try{i.texSubImage2D(...arguments)}catch(G){Je("WebGLState:",G)}}function Z(){try{i.texSubImage3D(...arguments)}catch(G){Je("WebGLState:",G)}}function j(){try{i.compressedTexSubImage2D(...arguments)}catch(G){Je("WebGLState:",G)}}function se(){try{i.compressedTexSubImage3D(...arguments)}catch(G){Je("WebGLState:",G)}}function ye(){try{i.texStorage2D(...arguments)}catch(G){Je("WebGLState:",G)}}function be(){try{i.texStorage3D(...arguments)}catch(G){Je("WebGLState:",G)}}function ae(){try{i.texImage2D(...arguments)}catch(G){Je("WebGLState:",G)}}function he(){try{i.texImage3D(...arguments)}catch(G){Je("WebGLState:",G)}}function Ae(G){return h[G]!==void 0?h[G]:i.getParameter(G)}function Le(G,ee){h[G]!==ee&&(i.pixelStorei(G,ee),h[G]=ee)}function _e(G){Qe.equals(G)===!1&&(i.scissor(G.x,G.y,G.z,G.w),Qe.copy(G))}function we(G){Ue.equals(G)===!1&&(i.viewport(G.x,G.y,G.z,G.w),Ue.copy(G))}function Be(G,ee){let ue=u.get(ee);ue===void 0&&(ue=new WeakMap,u.set(ee,ue));let Ee=ue.get(G);Ee===void 0&&(Ee=i.getUniformBlockIndex(ee,G.name),ue.set(G,Ee))}function Ne(G,ee){let Ee=u.get(ee).get(G);l.get(ee)!==Ee&&(i.uniformBlockBinding(ee,Ee,G.__bindingPointIndex),l.set(ee,Ee))}function ke(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),f={},h={},ie=null,re={},c={},d=new WeakMap,x=[],b=null,p=!1,g=null,S=null,w=null,y=null,T=null,E=null,C=null,_=new Ke(0,0,0),R=0,I=!1,F=null,L=null,O=null,N=null,V=null,Qe.set(0,0,i.canvas.width,i.canvas.height),Ue.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:le,disable:Re,bindFramebuffer:We,drawBuffers:Ce,useProgram:Ye,setBlending:ht,setMaterial:At,setFlipSided:ct,setCullFace:Bt,setLineWidth:qt,setPolygonOffset:hn,setScissorTest:Ot,activeTexture:Gt,bindTexture:X,unbindTexture:en,compressedTexImage2D:gt,compressedTexImage3D:z,texImage2D:ae,texImage3D:he,pixelStorei:Le,getParameter:Ae,updateUBOMapping:Be,uniformBlockBinding:Ne,texStorage2D:ye,texStorage3D:be,texSubImage2D:A,texSubImage3D:Z,compressedTexSubImage2D:j,compressedTexSubImage3D:se,scissor:_e,viewport:we,reset:ke}}function Ry(i,e,t,n,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Oe,f=new WeakMap,h=new Set,c,d=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(z,A){return x?new OffscreenCanvas(z,A):Vs("canvas")}function p(z,A,Z){let j=1,se=gt(z);if((se.width>Z||se.height>Z)&&(j=Z/Math.max(se.width,se.height)),j<1)if(typeof HTMLImageElement<"u"&&z instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&z instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&z instanceof ImageBitmap||typeof VideoFrame<"u"&&z instanceof VideoFrame){let ye=Math.floor(j*se.width),be=Math.floor(j*se.height);c===void 0&&(c=b(ye,be));let ae=A?b(ye,be):c;return ae.width=ye,ae.height=be,ae.getContext("2d").drawImage(z,0,0,ye,be),qe("WebGLRenderer: Texture has been resized from ("+se.width+"x"+se.height+") to ("+ye+"x"+be+")."),ae}else return"data"in z&&qe("WebGLRenderer: Image in DataTexture is too big ("+se.width+"x"+se.height+")."),z;return z}function g(z){return z.generateMipmaps}function S(z){i.generateMipmap(z)}function w(z){return z.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:z.isWebGL3DRenderTarget?i.TEXTURE_3D:z.isWebGLArrayRenderTarget||z.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(z,A,Z,j,se,ye=!1){if(z!==null){if(i[z]!==void 0)return i[z];qe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+z+"'")}let be;j&&(be=e.get("EXT_texture_norm16"),be||qe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ae=A;if(A===i.RED&&(Z===i.FLOAT&&(ae=i.R32F),Z===i.HALF_FLOAT&&(ae=i.R16F),Z===i.UNSIGNED_BYTE&&(ae=i.R8),Z===i.UNSIGNED_SHORT&&be&&(ae=be.R16_EXT),Z===i.SHORT&&be&&(ae=be.R16_SNORM_EXT)),A===i.RED_INTEGER&&(Z===i.UNSIGNED_BYTE&&(ae=i.R8UI),Z===i.UNSIGNED_SHORT&&(ae=i.R16UI),Z===i.UNSIGNED_INT&&(ae=i.R32UI),Z===i.BYTE&&(ae=i.R8I),Z===i.SHORT&&(ae=i.R16I),Z===i.INT&&(ae=i.R32I)),A===i.RG&&(Z===i.FLOAT&&(ae=i.RG32F),Z===i.HALF_FLOAT&&(ae=i.RG16F),Z===i.UNSIGNED_BYTE&&(ae=i.RG8),Z===i.UNSIGNED_SHORT&&be&&(ae=be.RG16_EXT),Z===i.SHORT&&be&&(ae=be.RG16_SNORM_EXT)),A===i.RG_INTEGER&&(Z===i.UNSIGNED_BYTE&&(ae=i.RG8UI),Z===i.UNSIGNED_SHORT&&(ae=i.RG16UI),Z===i.UNSIGNED_INT&&(ae=i.RG32UI),Z===i.BYTE&&(ae=i.RG8I),Z===i.SHORT&&(ae=i.RG16I),Z===i.INT&&(ae=i.RG32I)),A===i.RGB_INTEGER&&(Z===i.UNSIGNED_BYTE&&(ae=i.RGB8UI),Z===i.UNSIGNED_SHORT&&(ae=i.RGB16UI),Z===i.UNSIGNED_INT&&(ae=i.RGB32UI),Z===i.BYTE&&(ae=i.RGB8I),Z===i.SHORT&&(ae=i.RGB16I),Z===i.INT&&(ae=i.RGB32I)),A===i.RGBA_INTEGER&&(Z===i.UNSIGNED_BYTE&&(ae=i.RGBA8UI),Z===i.UNSIGNED_SHORT&&(ae=i.RGBA16UI),Z===i.UNSIGNED_INT&&(ae=i.RGBA32UI),Z===i.BYTE&&(ae=i.RGBA8I),Z===i.SHORT&&(ae=i.RGBA16I),Z===i.INT&&(ae=i.RGBA32I)),A===i.RGB&&(Z===i.UNSIGNED_SHORT&&be&&(ae=be.RGB16_EXT),Z===i.SHORT&&be&&(ae=be.RGB16_SNORM_EXT),Z===i.UNSIGNED_INT_5_9_9_9_REV&&(ae=i.RGB9_E5),Z===i.UNSIGNED_INT_10F_11F_11F_REV&&(ae=i.R11F_G11F_B10F)),A===i.RGBA){let he=ye?zs:dt.getTransfer(se);Z===i.FLOAT&&(ae=i.RGBA32F),Z===i.HALF_FLOAT&&(ae=i.RGBA16F),Z===i.UNSIGNED_BYTE&&(ae=he===Et?i.SRGB8_ALPHA8:i.RGBA8),Z===i.UNSIGNED_SHORT&&be&&(ae=be.RGBA16_EXT),Z===i.SHORT&&be&&(ae=be.RGBA16_SNORM_EXT),Z===i.UNSIGNED_SHORT_4_4_4_4&&(ae=i.RGBA4),Z===i.UNSIGNED_SHORT_5_5_5_1&&(ae=i.RGB5_A1)}return(ae===i.R16F||ae===i.R32F||ae===i.RG16F||ae===i.RG32F||ae===i.RGBA16F||ae===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ae}function T(z,A){let Z;return z?A===null||A===ln||A===ns?Z=i.DEPTH24_STENCIL8:A===nt?Z=i.DEPTH32F_STENCIL8:A===Hi&&(Z=i.DEPTH24_STENCIL8,qe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):A===null||A===ln||A===ns?Z=i.DEPTH_COMPONENT24:A===nt?Z=i.DEPTH_COMPONENT32F:A===Hi&&(Z=i.DEPTH_COMPONENT16),Z}function E(z,A){return g(z)===!0||z.isFramebufferTexture&&z.minFilter!==je&&z.minFilter!==st?Math.log2(Math.max(A.width,A.height))+1:z.mipmaps!==void 0&&z.mipmaps.length>0?z.mipmaps.length:z.isCompressedTexture&&Array.isArray(z.image)?A.mipmaps.length:1}function C(z){let A=z.target;A.removeEventListener("dispose",C),R(A),A.isVideoTexture&&f.delete(A),A.isHTMLTexture&&h.delete(A)}function _(z){let A=z.target;A.removeEventListener("dispose",_),F(A)}function R(z){let A=n.get(z);if(A.__webglInit===void 0)return;let Z=z.source,j=d.get(Z);if(j){let se=j[A.__cacheKey];se.usedTimes--,se.usedTimes===0&&I(z),Object.keys(j).length===0&&d.delete(Z)}n.remove(z)}function I(z){let A=n.get(z);i.deleteTexture(A.__webglTexture);let Z=z.source,j=d.get(Z);delete j[A.__cacheKey],o.memory.textures--}function F(z){let A=n.get(z);if(z.depthTexture&&(z.depthTexture.dispose(),n.remove(z.depthTexture)),z.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(A.__webglFramebuffer[j]))for(let se=0;se<A.__webglFramebuffer[j].length;se++)i.deleteFramebuffer(A.__webglFramebuffer[j][se]);else i.deleteFramebuffer(A.__webglFramebuffer[j]);A.__webglDepthbuffer&&i.deleteRenderbuffer(A.__webglDepthbuffer[j])}else{if(Array.isArray(A.__webglFramebuffer))for(let j=0;j<A.__webglFramebuffer.length;j++)i.deleteFramebuffer(A.__webglFramebuffer[j]);else i.deleteFramebuffer(A.__webglFramebuffer);if(A.__webglDepthbuffer&&i.deleteRenderbuffer(A.__webglDepthbuffer),A.__webglMultisampledFramebuffer&&i.deleteFramebuffer(A.__webglMultisampledFramebuffer),A.__webglColorRenderbuffer)for(let j=0;j<A.__webglColorRenderbuffer.length;j++)A.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(A.__webglColorRenderbuffer[j]);A.__webglDepthRenderbuffer&&i.deleteRenderbuffer(A.__webglDepthRenderbuffer)}let Z=z.textures;for(let j=0,se=Z.length;j<se;j++){let ye=n.get(Z[j]);ye.__webglTexture&&(i.deleteTexture(ye.__webglTexture),o.memory.textures--),n.remove(Z[j])}n.remove(z)}let L=0;function O(){L=0}function N(){return L}function V(z){L=z}function W(){let z=L;return z>=r.maxTextures&&qe("WebGLTextures: Trying to use "+(z+1)+" texture units while this GPU supports only "+r.maxTextures),L+=1,z}function J(z){let A=[];return A.push(z.wrapS),A.push(z.wrapT),A.push(z.wrapR||0),A.push(z.magFilter),A.push(z.minFilter),A.push(z.anisotropy),A.push(z.internalFormat),A.push(z.format),A.push(z.type),A.push(z.generateMipmaps),A.push(z.premultiplyAlpha),A.push(z.flipY),A.push(z.unpackAlignment),A.push(z.colorSpace),A.join()}function ce(z,A){let Z=n.get(z);if(z.isVideoTexture&&X(z),z.isRenderTargetTexture===!1&&z.isExternalTexture!==!0&&z.version>0&&Z.__version!==z.version){let j=z.image;if(j===null)qe("WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)qe("WebGLRenderer: Texture marked for update but image is incomplete");else{Re(Z,z,A);return}}else z.isExternalTexture&&(Z.__webglTexture=z.sourceTexture?z.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,Z.__webglTexture,i.TEXTURE0+A)}function K(z,A){let Z=n.get(z);if(z.isRenderTargetTexture===!1&&z.version>0&&Z.__version!==z.version){Re(Z,z,A);return}else z.isExternalTexture&&(Z.__webglTexture=z.sourceTexture?z.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,Z.__webglTexture,i.TEXTURE0+A)}function ie(z,A){let Z=n.get(z);if(z.isRenderTargetTexture===!1&&z.version>0&&Z.__version!==z.version){Re(Z,z,A);return}t.bindTexture(i.TEXTURE_3D,Z.__webglTexture,i.TEXTURE0+A)}function re(z,A){let Z=n.get(z);if(z.isCubeDepthTexture!==!0&&z.version>0&&Z.__version!==z.version){We(Z,z,A);return}t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture,i.TEXTURE0+A)}let Te={[sn]:i.REPEAT,[Lt]:i.CLAMP_TO_EDGE,[Ca]:i.MIRRORED_REPEAT},ve={[je]:i.NEAREST,[od]:i.NEAREST_MIPMAP_NEAREST,[ho]:i.NEAREST_MIPMAP_LINEAR,[st]:i.LINEAR,[ja]:i.LINEAR_MIPMAP_NEAREST,[Mi]:i.LINEAR_MIPMAP_LINEAR},Qe={[ud]:i.NEVER,[md]:i.ALWAYS,[hd]:i.LESS,[Ll]:i.LEQUAL,[fd]:i.EQUAL,[Fl]:i.GEQUAL,[dd]:i.GREATER,[pd]:i.NOTEQUAL};function Ue(z,A){if(A.type===nt&&e.has("OES_texture_float_linear")===!1&&(A.magFilter===st||A.magFilter===ja||A.magFilter===ho||A.magFilter===Mi||A.minFilter===st||A.minFilter===ja||A.minFilter===ho||A.minFilter===Mi)&&qe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(z,i.TEXTURE_WRAP_S,Te[A.wrapS]),i.texParameteri(z,i.TEXTURE_WRAP_T,Te[A.wrapT]),(z===i.TEXTURE_3D||z===i.TEXTURE_2D_ARRAY)&&i.texParameteri(z,i.TEXTURE_WRAP_R,Te[A.wrapR]),i.texParameteri(z,i.TEXTURE_MAG_FILTER,ve[A.magFilter]),i.texParameteri(z,i.TEXTURE_MIN_FILTER,ve[A.minFilter]),A.compareFunction&&(i.texParameteri(z,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(z,i.TEXTURE_COMPARE_FUNC,Qe[A.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===je||A.minFilter!==ho&&A.minFilter!==Mi||A.type===nt&&e.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||n.get(A).__currentAnisotropy){let Z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(z,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,r.getMaxAnisotropy())),n.get(A).__currentAnisotropy=A.anisotropy}}}function et(z,A){let Z=!1;z.__webglInit===void 0&&(z.__webglInit=!0,A.addEventListener("dispose",C));let j=A.source,se=d.get(j);se===void 0&&(se={},d.set(j,se));let ye=J(A);if(ye!==z.__cacheKey){se[ye]===void 0&&(se[ye]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,Z=!0),se[ye].usedTimes++;let be=se[z.__cacheKey];be!==void 0&&(se[z.__cacheKey].usedTimes--,be.usedTimes===0&&I(A)),z.__cacheKey=ye,z.__webglTexture=se[ye].texture}return Z}function Q(z,A,Z){return Math.floor(Math.floor(z/Z)/A)}function le(z,A,Z,j){let ye=z.updateRanges;if(ye.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,A.width,A.height,Z,j,A.data);else{ye.sort((Le,_e)=>Le.start-_e.start);let be=0;for(let Le=1;Le<ye.length;Le++){let _e=ye[be],we=ye[Le],Be=_e.start+_e.count,Ne=Q(we.start,A.width,4),ke=Q(_e.start,A.width,4);we.start<=Be+1&&Ne===ke&&Q(we.start+we.count-1,A.width,4)===Ne?_e.count=Math.max(_e.count,we.start+we.count-_e.start):(++be,ye[be]=we)}ye.length=be+1;let ae=t.getParameter(i.UNPACK_ROW_LENGTH),he=t.getParameter(i.UNPACK_SKIP_PIXELS),Ae=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,A.width);for(let Le=0,_e=ye.length;Le<_e;Le++){let we=ye[Le],Be=Math.floor(we.start/4),Ne=Math.ceil(we.count/4),ke=Be%A.width,G=Math.floor(Be/A.width),ee=Ne,ue=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ke),t.pixelStorei(i.UNPACK_SKIP_ROWS,G),t.texSubImage2D(i.TEXTURE_2D,0,ke,G,ee,ue,Z,j,A.data)}z.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,ae),t.pixelStorei(i.UNPACK_SKIP_PIXELS,he),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ae)}}function Re(z,A,Z){let j=i.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),A.isData3DTexture&&(j=i.TEXTURE_3D);let se=et(z,A),ye=A.source;t.bindTexture(j,z.__webglTexture,i.TEXTURE0+Z);let be=n.get(ye);if(ye.version!==be.__version||se===!0){if(t.activeTexture(i.TEXTURE0+Z),(typeof ImageBitmap<"u"&&A.image instanceof ImageBitmap)===!1){let ue=dt.getPrimaries(dt.workingColorSpace),Ee=A.colorSpace===Ti?null:dt.getPrimaries(A.colorSpace),Pe=A.colorSpace===Ti||ue===Ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,A.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe)}t.pixelStorei(i.UNPACK_ALIGNMENT,A.unpackAlignment);let he=p(A.image,!1,r.maxTextureSize);he=en(A,he);let Ae=s.convert(A.format,A.colorSpace),Le=s.convert(A.type),_e=y(A.internalFormat,Ae,Le,A.normalized,A.colorSpace,A.isVideoTexture);Ue(j,A);let we,Be=A.mipmaps,Ne=A.isVideoTexture!==!0,ke=be.__version===void 0||se===!0,G=ye.dataReady,ee=E(A,he);if(A.isDepthTexture)_e=T(A.format===Wi,A.type),ke&&(Ne?t.texStorage2D(i.TEXTURE_2D,1,_e,he.width,he.height):t.texImage2D(i.TEXTURE_2D,0,_e,he.width,he.height,0,Ae,Le,null));else if(A.isDataTexture)if(Be.length>0){Ne&&ke&&t.texStorage2D(i.TEXTURE_2D,ee,_e,Be[0].width,Be[0].height);for(let ue=0,Ee=Be.length;ue<Ee;ue++)we=Be[ue],Ne?G&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,we.width,we.height,Ae,Le,we.data):t.texImage2D(i.TEXTURE_2D,ue,_e,we.width,we.height,0,Ae,Le,we.data);A.generateMipmaps=!1}else Ne?(ke&&t.texStorage2D(i.TEXTURE_2D,ee,_e,he.width,he.height),G&&le(A,he,Ae,Le)):t.texImage2D(i.TEXTURE_2D,0,_e,he.width,he.height,0,Ae,Le,he.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){Ne&&ke&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ee,_e,Be[0].width,Be[0].height,he.depth);for(let ue=0,Ee=Be.length;ue<Ee;ue++)if(we=Be[ue],A.format!==Xe)if(Ae!==null)if(Ne){if(G)if(A.layerUpdates.size>0){let Pe=Qu(we.width,we.height,A.format,A.type);for(let de of A.layerUpdates){let He=we.data.subarray(de*Pe/we.data.BYTES_PER_ELEMENT,(de+1)*Pe/we.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,de,we.width,we.height,1,Ae,He)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,0,we.width,we.height,he.depth,Ae,we.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ue,_e,we.width,we.height,he.depth,0,we.data,0,0);else qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ne?G&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ue,0,0,0,we.width,we.height,he.depth,Ae,Le,we.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ue,_e,we.width,we.height,he.depth,0,Ae,Le,we.data);A.layerUpdates.size>0&&A.clearLayerUpdates()}else{Ne&&ke&&t.texStorage2D(i.TEXTURE_2D,ee,_e,Be[0].width,Be[0].height);for(let ue=0,Ee=Be.length;ue<Ee;ue++)we=Be[ue],A.format!==Xe?Ae!==null?Ne?G&&t.compressedTexSubImage2D(i.TEXTURE_2D,ue,0,0,we.width,we.height,Ae,we.data):t.compressedTexImage2D(i.TEXTURE_2D,ue,_e,we.width,we.height,0,we.data):qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ne?G&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,we.width,we.height,Ae,Le,we.data):t.texImage2D(i.TEXTURE_2D,ue,_e,we.width,we.height,0,Ae,Le,we.data)}else if(A.isDataArrayTexture)if(Ne){if(ke&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ee,_e,he.width,he.height,he.depth),G)if(A.layerUpdates.size>0){let ue=Qu(he.width,he.height,A.format,A.type);for(let Ee of A.layerUpdates){let Pe=he.data.subarray(Ee*ue/he.data.BYTES_PER_ELEMENT,(Ee+1)*ue/he.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ee,he.width,he.height,1,Ae,Le,Pe)}A.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,he.width,he.height,he.depth,Ae,Le,he.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,_e,he.width,he.height,he.depth,0,Ae,Le,he.data);else if(A.isData3DTexture)Ne?(ke&&t.texStorage3D(i.TEXTURE_3D,ee,_e,he.width,he.height,he.depth),G&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,he.width,he.height,he.depth,Ae,Le,he.data)):t.texImage3D(i.TEXTURE_3D,0,_e,he.width,he.height,he.depth,0,Ae,Le,he.data);else if(A.isFramebufferTexture){if(ke)if(Ne)t.texStorage2D(i.TEXTURE_2D,ee,_e,he.width,he.height);else{let ue=he.width,Ee=he.height;for(let Pe=0;Pe<ee;Pe++)t.texImage2D(i.TEXTURE_2D,Pe,_e,ue,Ee,0,Ae,Le,null),ue>>=1,Ee>>=1}}else if(A.isHTMLTexture){if("texElementImage2D"in i){let ue=i.canvas;if(ue.hasAttribute("layoutsubtree")||ue.setAttribute("layoutsubtree","true"),he.parentNode!==ue){ue.appendChild(he),h.add(A),ue.onpaint=Ee=>{let Pe=Ee.changedElements;for(let de of h)Pe.includes(de.image)&&(de.needsUpdate=!0)},ue.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,he);else{let Pe=i.RGBA,de=i.RGBA,He=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Pe,de,He,he)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Be.length>0){if(Ne&&ke){let ue=gt(Be[0]);t.texStorage2D(i.TEXTURE_2D,ee,_e,ue.width,ue.height)}for(let ue=0,Ee=Be.length;ue<Ee;ue++)we=Be[ue],Ne?G&&t.texSubImage2D(i.TEXTURE_2D,ue,0,0,Ae,Le,we):t.texImage2D(i.TEXTURE_2D,ue,_e,Ae,Le,we);A.generateMipmaps=!1}else if(Ne){if(ke){let ue=gt(he);t.texStorage2D(i.TEXTURE_2D,ee,_e,ue.width,ue.height)}G&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ae,Le,he)}else t.texImage2D(i.TEXTURE_2D,0,_e,Ae,Le,he);g(A)&&S(j),be.__version=ye.version,A.onUpdate&&A.onUpdate(A)}z.__version=A.version}function We(z,A,Z){if(A.image.length!==6)return;let j=et(z,A),se=A.source;t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+Z);let ye=n.get(se);if(se.version!==ye.__version||j===!0){t.activeTexture(i.TEXTURE0+Z);let be=dt.getPrimaries(dt.workingColorSpace),ae=A.colorSpace===Ti?null:dt.getPrimaries(A.colorSpace),he=A.colorSpace===Ti||be===ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,A.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,A.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);let Ae=A.isCompressedTexture||A.image[0].isCompressedTexture,Le=A.image[0]&&A.image[0].isDataTexture,_e=[];for(let de=0;de<6;de++)!Ae&&!Le?_e[de]=p(A.image[de],!0,r.maxCubemapSize):_e[de]=Le?A.image[de].image:A.image[de],_e[de]=en(A,_e[de]);let we=_e[0],Be=s.convert(A.format,A.colorSpace),Ne=s.convert(A.type),ke=y(A.internalFormat,Be,Ne,A.normalized,A.colorSpace),G=A.isVideoTexture!==!0,ee=ye.__version===void 0||j===!0,ue=se.dataReady,Ee=E(A,we);Ue(i.TEXTURE_CUBE_MAP,A);let Pe;if(Ae){G&&ee&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ee,ke,we.width,we.height);for(let de=0;de<6;de++){Pe=_e[de].mipmaps;for(let He=0;He<Pe.length;He++){let ze=Pe[He];A.format!==Xe?Be!==null?G?ue&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He,0,0,ze.width,ze.height,Be,ze.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He,ke,ze.width,ze.height,0,ze.data):qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):G?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He,0,0,ze.width,ze.height,Be,Ne,ze.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He,ke,ze.width,ze.height,0,Be,Ne,ze.data)}}}else{if(Pe=A.mipmaps,G&&ee){Pe.length>0&&Ee++;let de=gt(_e[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ee,ke,de.width,de.height)}for(let de=0;de<6;de++)if(Le){G?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,_e[de].width,_e[de].height,Be,Ne,_e[de].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ke,_e[de].width,_e[de].height,0,Be,Ne,_e[de].data);for(let He=0;He<Pe.length;He++){let Dt=Pe[He].image[de].image;G?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He+1,0,0,Dt.width,Dt.height,Be,Ne,Dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He+1,ke,Dt.width,Dt.height,0,Be,Ne,Dt.data)}}else{G?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,Be,Ne,_e[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,ke,Be,Ne,_e[de]);for(let He=0;He<Pe.length;He++){let ze=Pe[He];G?ue&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He+1,0,0,Be,Ne,ze.image[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,He+1,ke,Be,Ne,ze.image[de])}}}g(A)&&S(i.TEXTURE_CUBE_MAP),ye.__version=se.version,A.onUpdate&&A.onUpdate(A)}z.__version=A.version}function Ce(z,A,Z,j,se,ye){let be=s.convert(Z.format,Z.colorSpace),ae=s.convert(Z.type),he=y(Z.internalFormat,be,ae,Z.normalized,Z.colorSpace),Ae=n.get(A),Le=n.get(Z);if(Le.__renderTarget=A,!Ae.__hasExternalTextures){let _e=Math.max(1,A.width>>ye),we=Math.max(1,A.height>>ye);se===i.TEXTURE_3D||se===i.TEXTURE_2D_ARRAY?t.texImage3D(se,ye,he,_e,we,A.depth,0,be,ae,null):t.texImage2D(se,ye,he,_e,we,0,be,ae,null)}t.bindFramebuffer(i.FRAMEBUFFER,z),Gt(A)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,se,Le.__webglTexture,0,Ot(A)):(se===i.TEXTURE_2D||se>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&se<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,se,Le.__webglTexture,ye),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ye(z,A,Z){if(i.bindRenderbuffer(i.RENDERBUFFER,z),A.depthBuffer){let j=A.depthTexture,se=j&&j.isDepthTexture?j.type:null,ye=T(A.stencilBuffer,se),be=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Gt(A)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ot(A),ye,A.width,A.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ot(A),ye,A.width,A.height):i.renderbufferStorage(i.RENDERBUFFER,ye,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,z)}else{let j=A.textures;for(let se=0;se<j.length;se++){let ye=j[se],be=s.convert(ye.format,ye.colorSpace),ae=s.convert(ye.type),he=y(ye.internalFormat,be,ae,ye.normalized,ye.colorSpace);Gt(A)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ot(A),he,A.width,A.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ot(A),he,A.width,A.height):i.renderbufferStorage(i.RENDERBUFFER,he,A.width,A.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Pt(z,A,Z){let j=A.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,z),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let se=n.get(A.depthTexture);if(se.__renderTarget=A,(!se.__webglTexture||A.depthTexture.image.width!==A.width||A.depthTexture.image.height!==A.height)&&(A.depthTexture.image.width=A.width,A.depthTexture.image.height=A.height,A.depthTexture.needsUpdate=!0),j){if(se.__webglInit===void 0&&(se.__webglInit=!0,A.depthTexture.addEventListener("dispose",C)),se.__webglTexture===void 0){se.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,se.__webglTexture),Ue(i.TEXTURE_CUBE_MAP,A.depthTexture);let Ae=s.convert(A.depthTexture.format),Le=s.convert(A.depthTexture.type),_e;A.depthTexture.format===ti?_e=i.DEPTH_COMPONENT24:A.depthTexture.format===Wi&&(_e=i.DEPTH24_STENCIL8);for(let we=0;we<6;we++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+we,0,_e,A.width,A.height,0,Ae,Le,null)}}else ce(A.depthTexture,0);let ye=se.__webglTexture,be=Ot(A),ae=j?i.TEXTURE_CUBE_MAP_POSITIVE_X+Z:i.TEXTURE_2D,he=A.depthTexture.format===Wi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(A.depthTexture.format===ti)Gt(A)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,he,ae,ye,0,be):i.framebufferTexture2D(i.FRAMEBUFFER,he,ae,ye,0);else if(A.depthTexture.format===Wi)Gt(A)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,he,ae,ye,0,be):i.framebufferTexture2D(i.FRAMEBUFFER,he,ae,ye,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function it(z){let A=n.get(z),Z=z.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==z.depthTexture){let j=z.depthTexture;if(A.__depthDisposeCallback&&A.__depthDisposeCallback(),j){let se=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,j.removeEventListener("dispose",se)};j.addEventListener("dispose",se),A.__depthDisposeCallback=se}A.__boundDepthTexture=j}if(z.depthTexture&&!A.__autoAllocateDepthBuffer)if(Z)for(let j=0;j<6;j++)Pt(A.__webglFramebuffer[j],z,j);else{let j=z.texture.mipmaps;j&&j.length>0?Pt(A.__webglFramebuffer[0],z,0):Pt(A.__webglFramebuffer,z,0)}else if(Z){A.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(t.bindFramebuffer(i.FRAMEBUFFER,A.__webglFramebuffer[j]),A.__webglDepthbuffer[j]===void 0)A.__webglDepthbuffer[j]=i.createRenderbuffer(),Ye(A.__webglDepthbuffer[j],z,!1);else{let se=z.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ye=A.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,ye),i.framebufferRenderbuffer(i.FRAMEBUFFER,se,i.RENDERBUFFER,ye)}}else{let j=z.texture.mipmaps;if(j&&j.length>0?t.bindFramebuffer(i.FRAMEBUFFER,A.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=i.createRenderbuffer(),Ye(A.__webglDepthbuffer,z,!1);else{let se=z.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ye=A.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ye),i.framebufferRenderbuffer(i.FRAMEBUFFER,se,i.RENDERBUFFER,ye)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ht(z,A,Z){let j=n.get(z);A!==void 0&&Ce(j.__webglFramebuffer,z,z.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),Z!==void 0&&it(z)}function At(z){let A=z.texture,Z=n.get(z),j=n.get(A);z.addEventListener("dispose",_);let se=z.textures,ye=z.isWebGLCubeRenderTarget===!0,be=se.length>1;if(be||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=A.version,o.memory.textures++),ye){Z.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(A.mipmaps&&A.mipmaps.length>0){Z.__webglFramebuffer[ae]=[];for(let he=0;he<A.mipmaps.length;he++)Z.__webglFramebuffer[ae][he]=i.createFramebuffer()}else Z.__webglFramebuffer[ae]=i.createFramebuffer()}else{if(A.mipmaps&&A.mipmaps.length>0){Z.__webglFramebuffer=[];for(let ae=0;ae<A.mipmaps.length;ae++)Z.__webglFramebuffer[ae]=i.createFramebuffer()}else Z.__webglFramebuffer=i.createFramebuffer();if(be)for(let ae=0,he=se.length;ae<he;ae++){let Ae=n.get(se[ae]);Ae.__webglTexture===void 0&&(Ae.__webglTexture=i.createTexture(),o.memory.textures++)}if(z.samples>0&&Gt(z)===!1){Z.__webglMultisampledFramebuffer=i.createFramebuffer(),Z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let ae=0;ae<se.length;ae++){let he=se[ae];Z.__webglColorRenderbuffer[ae]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,Z.__webglColorRenderbuffer[ae]);let Ae=s.convert(he.format,he.colorSpace),Le=s.convert(he.type),_e=y(he.internalFormat,Ae,Le,he.normalized,he.colorSpace,z.isXRRenderTarget===!0),we=Ot(z);i.renderbufferStorageMultisample(i.RENDERBUFFER,we,_e,z.width,z.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,Z.__webglColorRenderbuffer[ae])}i.bindRenderbuffer(i.RENDERBUFFER,null),z.depthBuffer&&(Z.__webglDepthRenderbuffer=i.createRenderbuffer(),Ye(Z.__webglDepthRenderbuffer,z,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ye){t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),Ue(i.TEXTURE_CUBE_MAP,A);for(let ae=0;ae<6;ae++)if(A.mipmaps&&A.mipmaps.length>0)for(let he=0;he<A.mipmaps.length;he++)Ce(Z.__webglFramebuffer[ae][he],z,A,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,he);else Ce(Z.__webglFramebuffer[ae],z,A,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);g(A)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let ae=0,he=se.length;ae<he;ae++){let Ae=se[ae],Le=n.get(Ae),_e=i.TEXTURE_2D;(z.isWebGL3DRenderTarget||z.isWebGLArrayRenderTarget)&&(_e=z.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(_e,Le.__webglTexture),Ue(_e,Ae),Ce(Z.__webglFramebuffer,z,Ae,i.COLOR_ATTACHMENT0+ae,_e,0),g(Ae)&&S(_e)}t.unbindTexture()}else{let ae=i.TEXTURE_2D;if((z.isWebGL3DRenderTarget||z.isWebGLArrayRenderTarget)&&(ae=z.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ae,j.__webglTexture),Ue(ae,A),A.mipmaps&&A.mipmaps.length>0)for(let he=0;he<A.mipmaps.length;he++)Ce(Z.__webglFramebuffer[he],z,A,i.COLOR_ATTACHMENT0,ae,he);else Ce(Z.__webglFramebuffer,z,A,i.COLOR_ATTACHMENT0,ae,0);g(A)&&S(ae),t.unbindTexture()}z.depthBuffer&&it(z)}function ct(z){let A=z.textures;for(let Z=0,j=A.length;Z<j;Z++){let se=A[Z];if(g(se)){let ye=w(z),be=n.get(se).__webglTexture;t.bindTexture(ye,be),S(ye),t.unbindTexture()}}}let Bt=[],qt=[];function hn(z){if(z.samples>0){if(Gt(z)===!1){let A=z.textures,Z=z.width,j=z.height,se=i.COLOR_BUFFER_BIT,ye=z.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(z),ae=A.length>1;if(ae)for(let Ae=0;Ae<A.length;Ae++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer);let he=z.texture.mipmaps;he&&he.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let Ae=0;Ae<A.length;Ae++){if(z.resolveDepthBuffer&&(z.depthBuffer&&(se|=i.DEPTH_BUFFER_BIT),z.stencilBuffer&&z.resolveStencilBuffer&&(se|=i.STENCIL_BUFFER_BIT)),ae){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[Ae]);let Le=n.get(A[Ae]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Le,0)}i.blitFramebuffer(0,0,Z,j,0,0,Z,j,se,i.NEAREST),l===!0&&(Bt.length=0,qt.length=0,Bt.push(i.COLOR_ATTACHMENT0+Ae),z.depthBuffer&&z.storeMultisampledDepthBuffer===!1&&(Bt.push(ye),qt.push(ye),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,qt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Bt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ae)for(let Ae=0;Ae<A.length;Ae++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.RENDERBUFFER,be.__webglColorRenderbuffer[Ae]);let Le=n.get(A[Ae]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ae,i.TEXTURE_2D,Le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(z.depthBuffer&&z.storeMultisampledDepthBuffer===!1&&l){let A=z.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[A])}}}function Ot(z){return Math.min(r.maxSamples,z.samples)}function Gt(z){let A=n.get(z);return z.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function X(z){let A=o.render.frame;f.get(z)!==A&&(f.set(z,A),z.update())}function en(z,A){let Z=z.colorSpace,j=z.format,se=z.type;return z.isCompressedTexture===!0||z.isVideoTexture===!0||Z!==dn&&Z!==Ti&&(dt.getTransfer(Z)===Et?(j!==Xe||se!==an)&&qe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Je("WebGLTextures: Unsupported texture color space:",Z)),A}function gt(z){return typeof HTMLImageElement<"u"&&z instanceof HTMLImageElement?(u.width=z.naturalWidth||z.width,u.height=z.naturalHeight||z.height):typeof VideoFrame<"u"&&z instanceof VideoFrame?(u.width=z.displayWidth,u.height=z.displayHeight):(u.width=z.width,u.height=z.height),u}this.allocateTextureUnit=W,this.resetTextureUnits=O,this.getTextureUnits=N,this.setTextureUnits=V,this.setTexture2D=ce,this.setTexture2DArray=K,this.setTexture3D=ie,this.setTextureCube=re,this.rebindTextures=ht,this.setupRenderTarget=At,this.updateRenderTargetMipmap=ct,this.updateMultisampleRenderTarget=hn,this.setupDepthRenderbuffer=it,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Gt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Cy(i,e){function t(n,r=Ti){let s,o=dt.getTransfer(r);if(n===an)return i.UNSIGNED_BYTE;if(n===el)return i.UNSIGNED_SHORT_4_4_4_4;if(n===tl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Gu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Wu)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===ts)return i.BYTE;if(n===fo)return i.SHORT;if(n===Hi)return i.UNSIGNED_SHORT;if(n===Gi)return i.INT;if(n===ln)return i.UNSIGNED_INT;if(n===nt)return i.FLOAT;if(n===ut)return i.HALF_FLOAT;if(n===Xu)return i.ALPHA;if(n===qu)return i.RGB;if(n===Xe)return i.RGBA;if(n===ti)return i.DEPTH_COMPONENT;if(n===Wi)return i.DEPTH_STENCIL;if(n===An)return i.RED;if(n===is)return i.RED_INTEGER;if(n===cn)return i.RG;if(n===Xi)return i.RG_INTEGER;if(n===qi)return i.RGBA_INTEGER;if(n===po||n===mo||n===go||n===xo)if(o===Et)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===po)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===mo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===go)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===xo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===po)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===mo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===go)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===xo)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===nl||n===il||n===rl||n===sl)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===nl)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===il)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===rl)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===sl)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ol||n===al||n===ll||n===cl||n===ul||n===vo||n===hl)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===ol||n===al)return o===Et?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===ll)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===cl)return s.COMPRESSED_R11_EAC;if(n===ul)return s.COMPRESSED_SIGNED_R11_EAC;if(n===vo)return s.COMPRESSED_RG11_EAC;if(n===hl)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===fl||n===dl||n===pl||n===ml||n===gl||n===xl||n===vl||n===_l||n===yl||n===Sl||n===bl||n===Ml||n===Tl||n===wl)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===fl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===dl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===pl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ml)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===gl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===xl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===vl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===_l)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===yl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Sl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===bl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ml)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Tl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===wl)return o===Et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Al||n===El||n===Rl)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Al)return o===Et?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===El)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Rl)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Cl||n===Il||n===_o||n===Pl)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Cl)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Il)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===_o)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Pl)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ns?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Iy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Py=`
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

}`,xh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new $s(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ht({vertexShader:Iy,fragmentShader:Py,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new on(new hr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},vh=class extends ni{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,u=null,f=null,h=null,c=null,d=null,x=null,b=typeof XRWebGLBinding<"u",p=new xh,g={},S=t.getContextAttributes(),w=null,y=null,T=[],E=[],C=new Oe,_=null,R=null,I=new rn;I.viewport=new bt;let F=new rn;F.viewport=new bt;let L=[I,F],O=new Ja,N=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let le=T[Q];return le===void 0&&(le=new Zr,T[Q]=le),le.getTargetRaySpace()},this.getControllerGrip=function(Q){let le=T[Q];return le===void 0&&(le=new Zr,T[Q]=le),le.getGripSpace()},this.getHand=function(Q){let le=T[Q];return le===void 0&&(le=new Zr,T[Q]=le),le.getHandSpace()};function W(Q){let le=E.indexOf(Q.inputSource);if(le===-1)return;let Re=T[le];Re!==void 0&&(Re.update(Q.inputSource,Q.frame,u||o),Re.dispatchEvent({type:Q.type,data:Q.inputSource}))}function J(){r.removeEventListener("select",W),r.removeEventListener("selectstart",W),r.removeEventListener("selectend",W),r.removeEventListener("squeeze",W),r.removeEventListener("squeezestart",W),r.removeEventListener("squeezeend",W),r.removeEventListener("end",J),r.removeEventListener("inputsourceschange",ce);for(let Q=0;Q<T.length;Q++){let le=E[Q];le!==null&&(E[Q]=null,T[Q].disconnect(le))}N=null,V=null,p.reset();for(let Q in g)delete g[Q];if(e.setRenderTarget(w),d=null,c=null,h=null,r=null,y=null,et.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(C.width,C.height,!1),R!==null){let Q=R.camera;Q.fov=R.fov,Q.zoom=R.zoom,Q.updateProjectionMatrix(),R=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){s=Q,n.isPresenting===!0&&qe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){a=Q,n.isPresenting===!0&&qe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(Q){u=Q},this.getBaseLayer=function(){return c!==null?c:d},this.getBinding=function(){return h===null&&b&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return x},this.getSession=function(){return r},this.setSession=async function(Q){if(r=Q,r!==null){if(w=e.getRenderTarget(),r.addEventListener("select",W),r.addEventListener("selectstart",W),r.addEventListener("selectend",W),r.addEventListener("squeeze",W),r.addEventListener("squeezestart",W),r.addEventListener("squeezeend",W),r.addEventListener("end",J),r.addEventListener("inputsourceschange",ce),S.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(C),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let Re=null,We=null,Ce=null;S.depth&&(Ce=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Re=S.stencil?Wi:ti,We=S.stencil?ns:ln);let Ye={colorFormat:t.RGBA8,depthFormat:Ce,scaleFactor:s};h=this.getBinding(),c=h.createProjectionLayer(Ye),r.updateRenderState({layers:[c]}),e.setPixelRatio(1),e.setSize(c.textureWidth,c.textureHeight,!1),y=new kt(c.textureWidth,c.textureHeight,{format:Xe,type:an,depthTexture:new Bi(c.textureWidth,c.textureHeight,We,void 0,void 0,void 0,void 0,void 0,void 0,Re),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1,resolveStencilBuffer:c.ignoreDepthValues===!1,storeMultisampledDepthBuffer:c.ignoreDepthValues===!1,storeMultisampledStencilBuffer:c.ignoreDepthValues===!1})}else{let Re={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,t,Re),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new kt(d.framebufferWidth,d.framebufferHeight,{format:Xe,type:an,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await r.requestReferenceSpace(a),et.setContext(r),et.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function ce(Q){for(let le=0;le<Q.removed.length;le++){let Re=Q.removed[le],We=E.indexOf(Re);We>=0&&(E[We]=null,T[We].disconnect(Re))}for(let le=0;le<Q.added.length;le++){let Re=Q.added[le],We=E.indexOf(Re);if(We===-1){for(let Ye=0;Ye<T.length;Ye++)if(Ye>=E.length){E.push(Re),We=Ye;break}else if(E[Ye]===null){E[Ye]=Re,We=Ye;break}if(We===-1)break}let Ce=T[We];Ce&&Ce.connect(Re)}}let K=new k,ie=new k;function re(Q,le,Re){K.setFromMatrixPosition(le.matrixWorld),ie.setFromMatrixPosition(Re.matrixWorld);let We=K.distanceTo(ie),Ce=le.projectionMatrix.elements,Ye=Re.projectionMatrix.elements,Pt=Ce[14]/(Ce[10]-1),it=Ce[14]/(Ce[10]+1),ht=(Ce[9]+1)/Ce[5],At=(Ce[9]-1)/Ce[5],ct=(Ce[8]-1)/Ce[0],Bt=(Ye[8]+1)/Ye[0],qt=Pt*ct,hn=Pt*Bt,Ot=We/(-ct+Bt),Gt=Ot*-ct;if(le.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(Gt),Q.translateZ(Ot),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),Ce[10]===-1)Q.projectionMatrix.copy(le.projectionMatrix),Q.projectionMatrixInverse.copy(le.projectionMatrixInverse);else{let X=Pt+Ot,en=it+Ot,gt=qt-Gt,z=hn+(We-Gt),A=ht*it/en*X,Z=At*it/en*X;Q.projectionMatrix.makePerspective(gt,z,A,Z,X,en),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function Te(Q,le){le===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices(le.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(r===null)return;let le=Q.near,Re=Q.far;p.texture!==null&&(p.depthNear>0&&(le=p.depthNear),p.depthFar>0&&(Re=p.depthFar)),O.near=F.near=I.near=le,O.far=F.far=I.far=Re,(N!==O.near||V!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),N=O.near,V=O.far),O.layers.mask=Q.layers.mask|6,I.layers.mask=O.layers.mask&-5,F.layers.mask=O.layers.mask&-3;let We=Q.parent,Ce=O.cameras;Te(O,We);for(let Ye=0;Ye<Ce.length;Ye++)Te(Ce[Ye],We);Ce.length===2?re(O,I,F):O.projectionMatrix.copy(I.projectionMatrix),R===null&&Q.isPerspectiveCamera&&(R={camera:Q,fov:Q.fov,zoom:Q.zoom}),ve(Q,O,We)};function ve(Q,le,Re){Re===null?Q.matrix.copy(le.matrixWorld):(Q.matrix.copy(Re.matrixWorld),Q.matrix.invert(),Q.matrix.multiply(le.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy(le.projectionMatrix),Q.projectionMatrixInverse.copy(le.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=Pa*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(c===null&&d===null))return l},this.setFoveation=function(Q){l=Q,c!==null&&(c.fixedFoveation=Q),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Q)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(O)},this.getCameraTexture=function(Q){return g[Q]};let Qe=null;function Ue(Q,le){if(f=le.getViewerPose(u||o),x=le,f!==null){let Re=f.views;d!==null&&(e.setRenderTargetFramebuffer(y,d.framebuffer),e.setRenderTarget(y));let We=!1;Re.length!==O.cameras.length&&(O.cameras.length=0,We=!0);for(let it=0;it<Re.length;it++){let ht=Re[it],At=null;if(d!==null)At=d.getViewport(ht);else{let Bt=h.getViewSubImage(c,ht);At=Bt.viewport,it===0&&(e.setRenderTargetTextures(y,Bt.colorTexture,Bt.depthStencilTexture),e.setRenderTarget(y))}let ct=L[it];ct===void 0&&(ct=new rn,ct.layers.enable(it),ct.viewport=new bt,L[it]=ct),ct.matrix.fromArray(ht.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(ht.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(At.x,At.y,At.width,At.height),it===0&&(O.matrix.copy(ct.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),We===!0&&O.cameras.push(ct)}let Ce=r.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&b){h=n.getBinding();let it=h.getDepthInformation(Re[0]);it&&it.isValid&&it.texture&&p.init(it,r.renderState)}if(Ce&&Ce.includes("camera-access")&&b){e.state.unbindTexture(),h=n.getBinding();for(let it=0;it<Re.length;it++){let ht=Re[it].camera;if(ht){let At=g[ht];At||(At=new $s,g[ht]=At);let ct=h.getCameraImage(ht);At.sourceTexture=ct}}}}for(let Re=0;Re<T.length;Re++){let We=E[Re],Ce=T[Re];We!==null&&Ce!==void 0&&Ce.update(We,le,u||o)}Qe&&Qe(Q,le),le.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:le}),x=null}let et=new qd;et.setAnimationLoop(Ue),this.setAnimationLoop=function(Q){Qe=Q},this.dispose=function(){}}},Dy=new $e,Qd=new tt;Qd.set(-1,0,0,0,1,0,0,0,1);function Ly(i,e){function t(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,$u(i)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function r(p,g,S,w,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?s(p,g):g.isMeshLambertMaterial?(s(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(s(p,g),h(p,g)):g.isMeshPhongMaterial?(s(p,g),f(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(s(p,g),c(p,g),g.isMeshPhysicalMaterial&&d(p,g,y)):g.isMeshMatcapMaterial?(s(p,g),x(p,g)):g.isMeshDepthMaterial?s(p,g):g.isMeshDistanceMaterial?(s(p,g),b(p,g)):g.isMeshNormalMaterial?s(p,g):g.isLineBasicMaterial?(o(p,g),g.isLineDashedMaterial&&a(p,g)):g.isPointsMaterial?l(p,g,S,w):g.isSpriteMaterial?u(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,t(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===Jt&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,t(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===Jt&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,t(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,t(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let S=e.get(g),w=S.envMap,y=S.envMapRotation;w&&(p.envMap.value=w,p.envMapRotation.value.setFromMatrix4(Dy.makeRotationFromEuler(y)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Qd),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,p.aoMapTransform))}function o(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform))}function a(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,S,w){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*S,p.scale.value=w*.5,g.map&&(p.map.value=g.map,t(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function u(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function f(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function h(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function c(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function d(p,g,S){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Jt&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.retroreflectivity>0&&(p.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=S.texture,p.transmissionSamplerSize.value.set(S.width,S.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,p.specularIntensityMapTransform))}function x(p,g){g.matcap&&(p.matcap.value=g.matcap)}function b(p,g){let S=e.get(g).light;p.referencePosition.value.setFromMatrixPosition(S.matrixWorld),p.nearDistance.value=S.shadow.camera.near,p.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Fy(i,e,t,n){let r={},s={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,T){let E=T.program;n.uniformBlockBinding(y,E)}function u(y,T){let E=r[y.id];E===void 0&&(p(y),E=f(y),r[y.id]=E,y.addEventListener("dispose",S));let C=T.program;n.updateUBOMapping(y,C);let _=e.render.frame;s[y.id]!==_&&(c(y),s[y.id]=_)}function f(y){let T=h();y.__bindingPointIndex=T;let E=i.createBuffer(),C=y.__size,_=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,C,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,E),E}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Je("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function c(y){let T=r[y.id],E=y.uniforms,C=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,R=E.length;_<R;_++){let I=E[_];if(Array.isArray(I))for(let F=0,L=I.length;F<L;F++)d(I[F],_,F,C);else d(I,_,0,C)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(y,T,E,C){if(b(y,T,E,C)===!0){let _=y.__offset,R=y.value;if(Array.isArray(R)){let I=0;for(let F=0;F<R.length;F++){let L=R[F],O=g(L);x(L,y.__data,I),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(I+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(R,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,y.__data)}}function x(y,T,E){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,E)}function b(y,T,E,C){let _=y.value,R=T+"_"+E;if(C[R]===void 0)return typeof _=="number"||typeof _=="boolean"?C[R]=_:ArrayBuffer.isView(_)?C[R]=_.slice():C[R]=_.clone(),!0;{let I=C[R];if(typeof _=="number"||typeof _=="boolean"){if(I!==_)return C[R]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(I.equals(_)===!1)return I.copy(_),!0}}return!1}function p(y){let T=y.uniforms,E=0,C=16;for(let R=0,I=T.length;R<I;R++){let F=Array.isArray(T[R])?T[R]:[T[R]];for(let L=0,O=F.length;L<O;L++){let N=F[L],V=Array.isArray(N.value)?N.value:[N.value];for(let W=0,J=V.length;W<J;W++){let ce=V[W],K=g(ce),ie=E%C,re=ie%K.boundary,Te=ie+re;E+=re,Te!==0&&C-Te<K.storage&&(E+=C-Te),N.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=E,E+=K.storage}}}let _=E%C;return _>0&&(E+=C-_),y.__size=E,y.__cache={},this}function g(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?qe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):qe("WebGLRenderer: Unsupported uniform value type.",y),T}function S(y){let T=y.target;T.removeEventListener("dispose",S);let E=o.indexOf(T.__bindingPointIndex);o.splice(E,1),i.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function w(){for(let y in r)i.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:u,dispose:w}}var Ny=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),si=null;function Uy(){return si===null&&(si=new It(Ny,16,16,cn,ut),si.name="DFG_LUT",si.minFilter=st,si.magFilter=st,si.wrapS=Lt,si.wrapT=Lt,si.generateMipmaps=!1,si.needsUpdate=!0),si}var zl=class{constructor(e={}){let{canvas:t=xd(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:c=!1,outputBufferType:d=an}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=o;let b=d,p=new Set([qi,Xi,is]),g=new Set([an,ln,Hi,ns,el,tl]),S=new Uint32Array(4),w=new Int32Array(4),y=new k,T=null,E=null,C=[],_=[],R=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=wn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,F=!1,L=null,O=null,N=null,V=null;this._outputColorSpace=Sn;let W=0,J=0,ce=null,K=-1,ie=null,re=new bt,Te=new bt,ve=null,Qe=new Ke(0),Ue=0,et=t.width,Q=t.height,le=1,Re=null,We=null,Ce=new bt(0,0,et,Q),Ye=new bt(0,0,et,Q),Pt=!1,it=new Ys,ht=!1,At=!1,ct=new $e,Bt=new k,qt=new bt,hn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ot=!1;function Gt(){return ce===null?le:1}let X=n;function en(m,M){return t.getContext(m,M)}let gt,z,A,Z,j,se,ye,be,ae,he,Ae,Le,_e,we,Be,Ne,ke,G,ee,ue,Ee,Pe,de;try{let m={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:f,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Dt,!1),t.addEventListener("webglcontextrestored",yt,!1),t.addEventListener("webglcontextcreationerror",Ln,!1),X===null){let M="webgl2";if(X=en(M,m),X===null)throw en(M)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}He()}catch(m){throw t.removeEventListener("webglcontextlost",Dt,!1),t.removeEventListener("webglcontextrestored",yt,!1),t.removeEventListener("webglcontextcreationerror",Ln,!1),Je("WebGLRenderer: "+m.message),m}function He(){gt=new Gv(X),gt.init(),Ee=new Cy(X,gt),z=new Lv(X,gt,e,Ee),A=new Ey(X,gt),z.reversedDepthBuffer&&c&&A.buffers.depth.setReversed(!0),O=X.createFramebuffer(),N=X.createFramebuffer(),V=X.createFramebuffer(),Z=new qv(X),j=new dy,se=new Ry(X,gt,A,j,z,Ee,Z),ye=new Hv(I),be=new Zg(X),Pe=new Pv(X,be),ae=new Wv(X,be,Z,Pe),he=new Zv(X,ae,be,Pe,Z),G=new Yv(X,z,se),Be=new Fv(j),Ae=new fy(I,ye,gt,z,Pe,Be),Le=new Ly(I,j),_e=new my,we=new Sy(gt),ke=new Iv(I,ye,A,he,x,l),Ne=new Ay(I,he,z),de=new Fy(X,Z,z,A),ee=new Dv(X,gt,Z),ue=new Xv(X,gt,Z),Z.programs=Ae.programs,I.capabilities=z,I.extensions=gt,I.properties=j,I.renderLists=_e,I.shadowMap=Ne,I.state=A,I.info=Z}b!==an&&(R=new Jv(b,t.width,t.height,a,r,s));let ze=new vh(I,X);this.xr=ze,this.getContext=function(){return X},this.getContextAttributes=function(){return X.getContextAttributes()},this.forceContextLoss=function(){let m=gt.get("WEBGL_lose_context");m&&m.loseContext()},this.forceContextRestore=function(){let m=gt.get("WEBGL_lose_context");m&&m.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(m){m!==void 0&&(le=m,this.setSize(et,Q,!1))},this.getSize=function(m){return m.set(et,Q)},this.setSize=function(m,M,P=!0){if(ze.isPresenting){qe("WebGLRenderer: Can't change size while VR device is presenting.");return}et=m,Q=M,t.width=Math.floor(m*le),t.height=Math.floor(M*le),P===!0&&(t.style.width=m+"px",t.style.height=M+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,m,M)},this.getDrawingBufferSize=function(m){return m.set(et*le,Q*le).floor()},this.setDrawingBufferSize=function(m,M,P){et=m,Q=M,le=P,t.width=Math.floor(m*P),t.height=Math.floor(M*P),this.setViewport(0,0,m,M)},this.setEffects=function(m){if(b===an){Je("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(m){for(let M=0;M<m.length;M++)if(m[M].isOutputPass===!0){qe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(m||[])},this.getCurrentViewport=function(m){return m.copy(re)},this.getViewport=function(m){return m.copy(Ce)},this.setViewport=function(m,M,P,D){m.isVector4?Ce.set(m.x,m.y,m.z,m.w):Ce.set(m,M,P,D),A.viewport(re.copy(Ce).multiplyScalar(le).round())},this.getScissor=function(m){return m.copy(Ye)},this.setScissor=function(m,M,P,D){m.isVector4?Ye.set(m.x,m.y,m.z,m.w):Ye.set(m,M,P,D),A.scissor(Te.copy(Ye).multiplyScalar(le).round())},this.getScissorTest=function(){return Pt},this.setScissorTest=function(m){A.setScissorTest(Pt=m)},this.setOpaqueSort=function(m){Re=m},this.setTransparentSort=function(m){We=m},this.getClearColor=function(m){return m.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor(...arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha(...arguments)},this.clear=function(m=!0,M=!0,P=!0){let D=0;if(m){let B=!1;if(ce!==null){let U=ce.texture.format;B=p.has(U)}if(B){let U=ce.texture.type,q=g.has(U),H=ke.getClearColor(),Y=ke.getClearAlpha(),$=H.r,oe=H.g,te=H.b;q?(S[0]=$,S[1]=oe,S[2]=te,S[3]=Y,X.clearBufferuiv(X.COLOR,0,S)):(w[0]=$,w[1]=oe,w[2]=te,w[3]=Y,X.clearBufferiv(X.COLOR,0,w))}else D|=X.COLOR_BUFFER_BIT}M&&(D|=X.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),P&&(D|=X.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D!==0&&X.clear(D)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(m){m.setRenderer(this),L=m},this.dispose=function(){t.removeEventListener("webglcontextlost",Dt,!1),t.removeEventListener("webglcontextrestored",yt,!1),t.removeEventListener("webglcontextcreationerror",Ln,!1),ke.dispose(),_e.dispose(),we.dispose(),j.dispose(),ye.dispose(),he.dispose(),Pe.dispose(),de.dispose(),Ae.dispose(),ze.dispose(),ze.removeEventListener("sessionstart",Xo),ze.removeEventListener("sessionend",qo),ci.stop()};function Dt(m){m.preventDefault(),Zu("WebGLRenderer: Context Lost."),F=!0}function yt(){Zu("WebGLRenderer: Context Restored."),F=!1;let m=Z.autoReset,M=Ne.enabled,P=Ne.autoUpdate,D=Ne.needsUpdate,B=Ne.type;He(),Z.autoReset=m,Ne.enabled=M,Ne.autoUpdate=P,Ne.needsUpdate=D,Ne.type=B}function Ln(m){Je("WebGLRenderer: A WebGL context could not be created. Reason: ",m.statusMessage)}function kn(m){let M=m.target;M.removeEventListener("dispose",kn),jc(M)}function jc(m){eu(m),j.remove(m)}function eu(m){let M=j.get(m).programs;M!==void 0&&(M.forEach(function(P){Ae.releaseProgram(P)}),m.isShaderMaterial&&Ae.releaseShaderCache(m))}this.renderBufferDirect=function(m,M,P,D,B,U){M===null&&(M=hn);let q=B.isMesh&&B.matrixWorld.determinantAffine()<0,H=Jo(m,M,P,D,B);A.setMaterial(D,q);let Y=P.index,$=1;if(D.wireframe===!0){if(Y=ae.getWireframeAttribute(P),Y===void 0)return;$=2}let oe=P.drawRange,te=P.attributes.position,ne=oe.start*$,ge=(oe.start+oe.count)*$;U!==null&&(ne=Math.max(ne,U.start*$),ge=Math.min(ge,(U.start+U.count)*$)),Y!==null?(ne=Math.max(ne,0),ge=Math.min(ge,Y.count)):te!=null&&(ne=Math.max(ne,0),ge=Math.min(ge,te.count));let pe=ge-ne;if(pe<0||pe===1/0)return;Pe.setup(B,D,H,P,Y);let me,Se=ee;if(Y!==null&&(me=be.get(Y),Se=ue,Se.setIndex(me)),B.isMesh)D.wireframe===!0?(A.setLineWidth(D.wireframeLinewidth*Gt()),Se.setMode(X.LINES)):Se.setMode(X.TRIANGLES);else if(B.isLine){let Ge=D.linewidth;Ge===void 0&&(Ge=1),A.setLineWidth(Ge*Gt()),B.isLineSegments?Se.setMode(X.LINES):B.isLineLoop?Se.setMode(X.LINE_LOOP):Se.setMode(X.LINE_STRIP)}else B.isPoints?Se.setMode(X.POINTS):B.isSprite&&Se.setMode(X.TRIANGLES);if(B.isBatchedMesh)if(gt.get("WEBGL_multi_draw"))Se.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let Ge=B._multiDrawStarts,fe=B._multiDrawCounts,Ze=B._multiDrawCount,xe=Y?be.get(Y).bytesPerElement:1,Me=j.get(D).currentProgram.getUniforms();for(let Fe=0;Fe<Ze;Fe++)Me.setValue(X,"_gl_DrawID",Fe),Se.render(Ge[Fe]/xe,fe[Fe])}else if(B.isInstancedMesh)Se.renderInstances(ne,pe,B.count);else if(P.isInstancedBufferGeometry){let Ge=P._maxInstanceCount!==void 0?P._maxInstanceCount:1/0,fe=Math.min(P.instanceCount,Ge);Se.renderInstances(ne,pe,fe)}else Se.render(ne,pe)};function Go(m,M,P,D){L!==null&&m.isNodeMaterial&&L.setObject(D,m),ht===!0&&Be.setState(m,P,!1),m.transparent===!0&&m.side===_n&&m.forceSinglePass===!1?(m.side=Jt,m.needsUpdate=!0,ui(m,M,D),m.side=Tn,m.needsUpdate=!0,ui(m,M,D),m.side=_n):ui(m,M,D)}this.compile=function(m,M,P=null){P===null&&(P=m),L!==null&&L.renderStart(m,M,P),E=we.get(P),E.init(M),_.push(E),P.traverseVisible(function(B){B.isLight&&B.layers.test(M.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),m!==P&&m.traverseVisible(function(B){B.isLight&&B.layers.test(M.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),E.setupLights(),L!==null&&L.updateLights(E.state.lightsArray),At=this.localClippingEnabled,ht=Be.init(this.clippingPlanes,At),ht===!0&&Be.setGlobalState(this.clippingPlanes,M),L!==null&&Ne.render(E.state.shadowsArray,P,M);let D=new Set;return m.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let U=B.material;if(U)if(Array.isArray(U))for(let q=0;q<U.length;q++){let H=U[q];Go(H,P,M,B),D.add(H)}else Go(U,P,M,B),D.add(U)}),E=_.pop(),L!==null&&L.renderEnd(),D},this.compileAsync=function(m,M,P=null){let D=this.compile(m,M,P);return new Promise(B=>{function U(){if(D.forEach(function(q){let Y=j.get(q).currentProgram;(Y===void 0||Y.isReady())&&D.delete(q)}),D.size===0){B(m);return}setTimeout(U,10)}gt.get("KHR_parallel_shader_compile")!==null?U():setTimeout(U,10)})};let Cs=null;function Wo(m){Cs&&Cs(m)}function Xo(){ci.stop()}function qo(){ci.start()}let ci=new qd;ci.setAnimationLoop(Wo),typeof self<"u"&&ci.setContext(self),this.setAnimationLoop=function(m){Cs=m,ze.setAnimationLoop(m),m===null?ci.stop():ci.start()},ze.addEventListener("sessionstart",Xo),ze.addEventListener("sessionend",qo),this.render=function(m,M){if(M!==void 0&&M.isCamera!==!0){Je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(F===!0)return;L!==null&&L.renderStart(m,M);let P=ze.enabled===!0&&ze.isPresenting===!0,D=R!==null&&(ce===null||P)&&R.begin(I,ce);if(m.matrixWorldAutoUpdate===!0&&m.updateMatrixWorld(),M.parent===null&&M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),ze.enabled===!0&&ze.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(ze.cameraAutoUpdate===!0&&ze.updateCamera(M),M=ze.getCamera()),m.isScene===!0&&m.onBeforeRender(I,m,M,ce),E=we.get(m,_.length),E.init(M),E.state.textureUnits=se.getTextureUnits(),_.push(E),ct.multiplyMatrices(M.projectionMatrix,M.matrixWorldInverse),it.setFromProjectionMatrix(ct,$n,M.reversedDepth),At=this.localClippingEnabled,ht=Be.init(this.clippingPlanes,At),T=_e.get(m,C.length),T.init(),C.push(T),ze.enabled===!0&&ze.isPresenting===!0){let q=I.xr.getDepthSensingMesh();q!==null&&Ar(q,M,-1/0,I.sortObjects)}Ar(m,M,0,I.sortObjects),T.finish(),L!==null&&L.updateLights(E.state.lightsArray),I.sortObjects===!0&&T.sort(Re,We),Ot=ze.enabled===!1||ze.isPresenting===!1||ze.hasDepthSensing()===!1,Ot&&ke.addToRenderList(T,m),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ht===!0&&Be.beginShadows();let B=E.state.shadowsArray;if(Ne.render(B,m,M),ht===!0&&Be.endShadows(),(D&&R.hasRenderPass())===!1){let q=T.opaque,H=T.transmissive;if(E.setupLights(),M.isArrayCamera){let Y=M.cameras;if(H.length>0)for(let $=0,oe=Y.length;$<oe;$++){let te=Y[$];Is(q,H,m,te)}Ot&&ke.render(m);for(let $=0,oe=Y.length;$<oe;$++){let te=Y[$];Yo(T,m,te,te.viewport)}}else H.length>0&&Is(q,H,m,M),Ot&&ke.render(m),Yo(T,m,M)}ce!==null&&J===0&&(se.updateMultisampleRenderTarget(ce),se.updateRenderTargetMipmap(ce)),D&&R.end(I),m.isScene===!0&&m.onAfterRender(I,m,M),Pe.resetDefaultState(),K=-1,ie=null,_.pop(),_.length>0?(E=_[_.length-1],se.setTextureUnits(E.state.textureUnits),ht===!0&&Be.setGlobalState(I.clippingPlanes,E.state.camera)):E=null,C.pop(),C.length>0?T=C[C.length-1]:T=null,L!==null&&L.renderEnd()};function Ar(m,M,P,D){if(m.visible===!1)return;if(m.layers.test(M.layers)){if(m.isGroup)P=m.renderOrder;else if(m.isLOD)m.autoUpdate===!0&&m.update(M);else if(m.isLightProbeGrid)E.pushLightProbeGrid(m);else if(m.isLight)E.pushLight(m),m.castShadow&&E.pushShadow(m);else if(m.isSprite){if(!m.frustumCulled||m.intersectsFrustum(it)){D&&qt.setFromMatrixPosition(m.matrixWorld).applyMatrix4(ct);let q=he.update(m),H=m.material;H.visible&&T.push(m,q,H,P,qt.z,null,M)}}else if((m.isMesh||m.isLine||m.isPoints)&&(!m.frustumCulled||m.intersectsFrustum(it))){let q=he.update(m),H=m.material;if(D&&(m.boundingSphere!==void 0?(m.boundingSphere===null&&m.computeBoundingSphere(),qt.copy(m.boundingSphere.center)):(q.boundingSphere===null&&q.computeBoundingSphere(),qt.copy(q.boundingSphere.center)),qt.applyMatrix4(m.matrixWorld).applyMatrix4(ct)),Array.isArray(H)){let Y=q.groups;for(let $=0,oe=Y.length;$<oe;$++){let te=Y[$],ne=H[te.materialIndex];ne&&ne.visible&&T.push(m,q,ne,P,qt.z,te,M)}}else H.visible&&T.push(m,q,H,P,qt.z,null,M)}}let U=m.children;for(let q=0,H=U.length;q<H;q++)Ar(U[q],M,P,D)}function Yo(m,M,P,D){let{opaque:B,transmissive:U,transparent:q}=m;E.setupLightsView(P),ht===!0&&Be.setGlobalState(I.clippingPlanes,P),D&&A.viewport(re.copy(D)),B.length>0&&Er(B,M,P),U.length>0&&Er(U,M,P),q.length>0&&Er(q,M,P),A.buffers.depth.setTest(!0),A.buffers.depth.setMask(!0),A.buffers.color.setMask(!0),A.setPolygonOffset(!1)}function Is(m,M,P,D){if((P.isScene===!0?P.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[D.id]===void 0){let ne=gt.has("EXT_color_buffer_half_float")||gt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[D.id]=new kt(1,1,{generateMipmaps:!0,type:ne?ut:an,minFilter:Mi,samples:Math.max(4,z.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:dt.workingColorSpace})}let U=E.state.transmissionRenderTarget[D.id],q=D.viewport||re;U.setSize(q.z*I.transmissionResolutionScale,q.w*I.transmissionResolutionScale);let H=I.getRenderTarget(),Y=I.getActiveCubeFace(),$=I.getActiveMipmapLevel();I.setRenderTarget(U),I.getClearColor(Qe),Ue=I.getClearAlpha(),Ue<1&&I.setClearColor(16777215,.5),I.clear(),Ot&&ke.render(P);let oe=I.toneMapping;I.toneMapping=wn;let te=D.viewport;if(D.viewport!==void 0&&(D.viewport=void 0),E.setupLightsView(D),ht===!0&&Be.setGlobalState(I.clippingPlanes,D),Er(m,P,D),se.updateMultisampleRenderTarget(U),se.updateRenderTargetMipmap(U),gt.has("WEBGL_multisampled_render_to_texture")===!1){let ne=!1;for(let ge=0,pe=M.length;ge<pe;ge++){let me=M[ge],{object:Se,geometry:Ge,material:fe,group:Ze}=me;if(fe.side===_n&&Se.layers.test(D.layers)){let xe=fe.side;fe.side=Jt,fe.needsUpdate=!0,Zo(Se,P,D,Ge,fe,Ze),fe.side=xe,fe.needsUpdate=!0,ne=!0}}ne===!0&&(se.updateMultisampleRenderTarget(U),se.updateRenderTargetMipmap(U))}I.setRenderTarget(H,Y,$),I.setClearColor(Qe,Ue),te!==void 0&&(D.viewport=te),I.toneMapping=oe}function Er(m,M,P){let D=M.isScene===!0?M.overrideMaterial:null;for(let B=0,U=m.length;B<U;B++){let q=m[B],{object:H,geometry:Y,group:$}=q,oe=q.material;oe.allowOverride===!0&&D!==null&&(oe=D),H.layers.test(P.layers)&&Zo(H,M,P,Y,oe,$)}}function Zo(m,M,P,D,B,U){L!==null&&B.isNodeMaterial&&L.setObject(m,B),m.onBeforeRender(I,M,P,D,B,U),m.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,m.matrixWorld),m.normalMatrix.getNormalMatrix(m.modelViewMatrix),B.onBeforeRender(I,M,P,D,m,U),B.transparent===!0&&B.side===_n&&B.forceSinglePass===!1?(B.side=Jt,B.needsUpdate=!0,I.renderBufferDirect(P,M,D,B,m,U),B.side=Tn,B.needsUpdate=!0,I.renderBufferDirect(P,M,D,B,m,U),B.side=_n):I.renderBufferDirect(P,M,D,B,m,U),m.onAfterRender(I,M,P,D,B,U)}function ui(m,M,P){M.isScene!==!0&&(M=hn);let D=j.get(m),B=E.state.lights,U=E.state.shadowsArray,q=B.state.version,H=Ae.getParameters(m,B.state,U,M,P,E.state.lightProbeGridArray),Y=Ae.getProgramCacheKey(H),$=D.programs;D.environment=m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial?M.environment:null,D.fog=M.fog;let oe=m.isMeshStandardMaterial||m.isMeshLambertMaterial&&!m.envMap||m.isMeshPhongMaterial&&!m.envMap;D.envMap=ye.get(m.envMap||D.environment,oe),D.envMapRotation=D.environment!==null&&m.envMap===null?M.environmentRotation:m.envMapRotation,$===void 0&&(m.addEventListener("dispose",kn),$=new Map,D.programs=$);let te=$.get(Y);if(te!==void 0){if(D.currentProgram===te&&D.lightsStateVersion===q)return $o(m,H),te}else H.uniforms=Ae.getUniforms(m),L!==null&&m.isNodeMaterial&&L.build(m,P,H),m.onBeforeCompile(H,I),te=Ae.acquireProgram(H,Y),$.set(Y,te),D.uniforms=H.uniforms;let ne=D.uniforms;return(!m.isShaderMaterial&&!m.isRawShaderMaterial||m.clipping===!0)&&(ne.clippingPlanes=Be.uniform),$o(m,H),D.needsLights=Rn(m),D.lightsStateVersion=q,D.needsLights&&(ne.ambientLightColor.value=B.state.ambient,ne.lightProbe.value=B.state.probe,ne.sunLights.value=B.state.sun,ne.sunLightShadows.value=B.state.sunShadow,ne.directionalLights.value=B.state.directional,ne.directionalLightShadows.value=B.state.directionalShadow,ne.spotLights.value=B.state.spot,ne.spotLightShadows.value=B.state.spotShadow,ne.rectAreaLights.value=B.state.rectArea,ne.ltc_1.value=B.state.rectAreaLTC1,ne.ltc_2.value=B.state.rectAreaLTC2,ne.pointLights.value=B.state.point,ne.pointLightShadows.value=B.state.pointShadow,ne.hemisphereLights.value=B.state.hemi,ne.sunShadowMatrix.value=B.state.sunShadowMatrix,ne.sunShadowCascade.value=B.state.sunShadowCascade,ne.directionalShadowMatrix.value=B.state.directionalShadowMatrix,ne.spotLightMatrix.value=B.state.spotLightMatrix,ne.spotLightMap.value=B.state.spotLightMap,ne.pointShadowMatrix.value=B.state.pointShadowMatrix),D.lightProbeGrid=E.state.lightProbeGridArray.length>0,D.currentProgram=te,D.uniformsList=null,te}function nr(m){if(m.uniformsList===null){let M=m.currentProgram.getUniforms();m.uniformsList=os.seqWithValue(M.seq,m.uniforms)}return m.uniformsList}function $o(m,M){let P=j.get(m);P.outputColorSpace=M.outputColorSpace,P.batching=M.batching,P.batchingColor=M.batchingColor,P.instancing=M.instancing,P.instancingColor=M.instancingColor,P.instancingMorph=M.instancingMorph,P.skinning=M.skinning,P.morphTargets=M.morphTargets,P.morphNormals=M.morphNormals,P.morphColors=M.morphColors,P.morphTargetsCount=M.morphTargetsCount,P.numClippingPlanes=M.numClippingPlanes,P.numIntersection=M.numClipIntersection,P.vertexAlphas=M.vertexAlphas,P.vertexTangents=M.vertexTangents,P.toneMapping=M.toneMapping}function Rr(m,M){if(m.length===0)return null;if(m.length===1)return m[0].texture!==null?m[0]:null;y.setFromMatrixPosition(M.matrixWorld);for(let P=0,D=m.length;P<D;P++){let B=m[P];if(B.texture!==null&&B.boundingBox.containsPoint(y))return B}return null}function Jo(m,M,P,D,B){M.isScene!==!0&&(M=hn),se.resetTextureUnits();let U=M.fog,q=D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial?M.environment:null,H=ce===null?I.outputColorSpace:ce.isXRRenderTarget===!0?ce.texture.colorSpace:dt.workingColorSpace,Y=D.isMeshStandardMaterial||D.isMeshLambertMaterial&&!D.envMap||D.isMeshPhongMaterial&&!D.envMap,$=ye.get(D.envMap||q,Y),oe=D.vertexColors===!0&&!!P.attributes.color&&P.attributes.color.itemSize===4,te=!!P.attributes.tangent&&(!!D.normalMap||D.anisotropy>0),ne=!!P.morphAttributes.position,ge=!!P.morphAttributes.normal,pe=!!P.morphAttributes.color,me=wn;D.toneMapped&&(ce===null||ce.isXRRenderTarget===!0)&&(me=I.toneMapping);let Se=P.morphAttributes.position||P.morphAttributes.normal||P.morphAttributes.color,Ge=Se!==void 0?Se.length:0,fe=j.get(D),Ze=E.state.lights;if(ht===!0&&(At===!0||m!==ie)){let at=m===ie&&D.id===K;Be.setState(D,m,at)}let xe=!1;D.version===fe.__version?(fe.needsLights&&fe.lightsStateVersion!==Ze.state.version||fe.outputColorSpace!==H||B.isBatchedMesh&&fe.batching===!1||!B.isBatchedMesh&&fe.batching===!0||B.isBatchedMesh&&fe.batchingColor===!0&&B._colorsTexture===null||B.isBatchedMesh&&fe.batchingColor===!1&&B._colorsTexture!==null||B.isInstancedMesh&&fe.instancing===!1||!B.isInstancedMesh&&fe.instancing===!0||B.isSkinnedMesh&&fe.skinning===!1||!B.isSkinnedMesh&&fe.skinning===!0||B.isInstancedMesh&&fe.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&fe.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&fe.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&fe.instancingMorph===!1&&B.morphTexture!==null||fe.envMap!==$||D.fog===!0&&fe.fog!==U||fe.numClippingPlanes!==void 0&&(fe.numClippingPlanes!==Be.numPlanes||fe.numIntersection!==Be.numIntersection)||fe.vertexAlphas!==oe||fe.vertexTangents!==te||fe.morphTargets!==ne||fe.morphNormals!==ge||fe.morphColors!==pe||fe.toneMapping!==me||fe.morphTargetsCount!==Ge||!!fe.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(xe=!0):(xe=!0,fe.__version=D.version);let Me=fe.currentProgram;xe===!0&&(Me=ui(D,M,B),L&&D.isNodeMaterial&&L.onUpdateProgram(D,Me,fe));let Fe=!1,ft=!1,ot=!1,De=Me.getUniforms(),Ve=fe.uniforms;if(A.useProgram(Me.program)&&(Fe=!0,ft=!0,ot=!0),D.id!==K&&(K=D.id,ft=!0),fe.needsLights){let at=Rr(E.state.lightProbeGridArray,B);fe.lightProbeGrid!==at&&(fe.lightProbeGrid=at,ft=!0)}if(Fe||ie!==m){A.buffers.depth.getReversed()&&m.reversedDepth!==!0&&(m._reversedDepth=!0,m.updateProjectionMatrix()),De.setValue(X,"projectionMatrix",m.projectionMatrix),De.setValue(X,"viewMatrix",m.matrixWorldInverse);let mt=De.map.cameraPosition;mt!==void 0&&mt.setValue(X,Bt.setFromMatrixPosition(m.matrixWorld)),z.logarithmicDepthBuffer&&De.setValue(X,"logDepthBufFC",2/(Math.log(m.far+1)/Math.LN2)),(D.isMeshPhongMaterial||D.isMeshToonMaterial||D.isMeshLambertMaterial||D.isMeshBasicMaterial||D.isMeshStandardMaterial||D.isShaderMaterial)&&De.setValue(X,"isOrthographic",m.isOrthographicCamera===!0),ie!==m&&(ie=m,ft=!0,ot=!0)}if(fe.needsLights&&(Ze.state.sunShadowMap.length>0&&De.setValue(X,"sunShadowMap",Ze.state.sunShadowMap,se),Ze.state.directionalShadowMap.length>0&&De.setValue(X,"directionalShadowMap",Ze.state.directionalShadowMap,se),Ze.state.spotShadowMap.length>0&&De.setValue(X,"spotShadowMap",Ze.state.spotShadowMap,se),Ze.state.pointShadowMap.length>0&&De.setValue(X,"pointShadowMap",Ze.state.pointShadowMap,se)),B.isSkinnedMesh){De.setOptional(X,B,"bindMatrix"),De.setOptional(X,B,"bindMatrixInverse");let at=B.skeleton;at&&(at.boneTexture===null&&at.computeBoneTexture(),De.setValue(X,"boneTexture",at.boneTexture,se))}B.isBatchedMesh&&(De.setOptional(X,B,"batchingTexture"),De.setValue(X,"batchingTexture",B._matricesTexture,se),De.setOptional(X,B,"batchingIdTexture"),De.setValue(X,"batchingIdTexture",B._indirectTexture,se),De.setOptional(X,B,"batchingColorTexture"),B._colorsTexture!==null&&De.setValue(X,"batchingColorTexture",B._colorsTexture,se));let Ct=P.morphAttributes;if((Ct.position!==void 0||Ct.normal!==void 0||Ct.color!==void 0)&&G.update(B,P,Me),(ft||fe.receiveShadow!==B.receiveShadow)&&(fe.receiveShadow=B.receiveShadow,De.setValue(X,"receiveShadow",B.receiveShadow)),(D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial)&&D.envMap===null&&M.environment!==null&&(Ve.envMapIntensity.value=M.environmentIntensity),Ve.dfgLUT!==void 0&&(Ve.dfgLUT.value=Uy()),ft){if(De.setValue(X,"toneMappingExposure",I.toneMappingExposure),fe.needsLights&&tn(Ve,ot),U&&D.fog===!0&&Le.refreshFogUniforms(Ve,U),Le.refreshMaterialUniforms(Ve,D,le,Q,E.state.transmissionRenderTarget[m.id]),fe.needsLights&&fe.lightProbeGrid){let at=fe.lightProbeGrid;Ve.probesSH.value=at.texture,Ve.probesMin.value.copy(at.boundingBox.min),Ve.probesMax.value.copy(at.boundingBox.max),Ve.probesResolution.value.copy(at.resolution)}os.upload(X,nr(fe),Ve,se)}if(D.isShaderMaterial&&D.uniformsNeedUpdate===!0&&(os.upload(X,nr(fe),Ve,se),D.uniformsNeedUpdate=!1),D.isSpriteMaterial&&De.setValue(X,"center",B.center),De.setValue(X,"modelViewMatrix",B.modelViewMatrix),De.setValue(X,"normalMatrix",B.normalMatrix),De.setValue(X,"modelMatrix",B.matrixWorld),D.uniformsGroups!==void 0){let at=D.uniformsGroups;for(let mt=0,fn=at.length;mt<fn;mt++){let hi=at[mt];de.update(hi,Me),de.bind(hi,Me)}}return Me}function tn(m,M){m.ambientLightColor.needsUpdate=M,m.lightProbe.needsUpdate=M,m.sunLights.needsUpdate=M,m.sunLightShadows.needsUpdate=M,m.directionalLights.needsUpdate=M,m.directionalLightShadows.needsUpdate=M,m.pointLights.needsUpdate=M,m.pointLightShadows.needsUpdate=M,m.spotLights.needsUpdate=M,m.spotLightShadows.needsUpdate=M,m.rectAreaLights.needsUpdate=M,m.hemisphereLights.needsUpdate=M}function Rn(m){return m.isMeshLambertMaterial||m.isMeshToonMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isShadowMaterial||m.isShaderMaterial&&m.lights===!0}this.getActiveCubeFace=function(){return W},this.getActiveMipmapLevel=function(){return J},this.getRenderTarget=function(){return ce},this.setRenderTargetTextures=function(m,M,P){let D=j.get(m);D.__autoAllocateDepthBuffer=m.resolveDepthBuffer===!1,D.__autoAllocateDepthBuffer===!1&&(D.__useRenderToTexture=!1),j.get(m.texture).__webglTexture=M,j.get(m.depthTexture).__webglTexture=D.__autoAllocateDepthBuffer?void 0:P,D.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(m,M){let P=j.get(m);P.__webglFramebuffer=M,P.__useDefaultFramebuffer=M===void 0},this.setRenderTarget=function(m,M=0,P=0){ce=m,W=M,J=P;let D=null,B=!1,U=!1;if(m){let H=j.get(m);if(H.__useDefaultFramebuffer!==void 0){A.bindFramebuffer(X.FRAMEBUFFER,H.__webglFramebuffer),re.copy(m.viewport),Te.copy(m.scissor),ve=m.scissorTest,A.viewport(re),A.scissor(Te),A.setScissorTest(ve),K=-1;return}else if(H.__webglFramebuffer===void 0)se.setupRenderTarget(m);else if(H.__hasExternalTextures)se.rebindTextures(m,j.get(m.texture).__webglTexture,j.get(m.depthTexture).__webglTexture);else if(m.depthBuffer){let oe=m.depthTexture;if(H.__boundDepthTexture!==oe){if(oe!==null&&j.has(oe)&&(m.width!==oe.image.width||m.height!==oe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");se.setupDepthRenderbuffer(m)}}let Y=m.texture;(Y.isData3DTexture||Y.isDataArrayTexture||Y.isCompressedArrayTexture)&&(U=!0);let $=j.get(m).__webglFramebuffer;m.isWebGLCubeRenderTarget?(Array.isArray($[M])?D=$[M][P]:D=$[M],B=!0):m.samples>0&&se.useMultisampledRTT(m)===!1?D=j.get(m).__webglMultisampledFramebuffer:Array.isArray($)?D=$[P]:D=$,re.copy(m.viewport),Te.copy(m.scissor),ve=m.scissorTest}else re.copy(Ce).multiplyScalar(le).floor(),Te.copy(Ye).multiplyScalar(le).floor(),ve=Pt;if(P!==0&&(D=O),A.bindFramebuffer(X.FRAMEBUFFER,D)&&A.drawBuffers(m,D),A.viewport(re),A.scissor(Te),A.setScissorTest(ve),B){let H=j.get(m.texture);X.framebufferTexture2D(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_CUBE_MAP_POSITIVE_X+M,H.__webglTexture,P)}else if(U){let H=M;for(let Y=0;Y<m.textures.length;Y++){let $=j.get(m.textures[Y]);X.framebufferTextureLayer(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0+Y,$.__webglTexture,P,H)}}else if(m!==null&&P!==0){let H=j.get(m.texture);X.framebufferTexture2D(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,H.__webglTexture,P)}K=-1};function v(m){let M=j.get(m);return(M.__readFormat!==m.format||M.__readType!==m.type)&&(M.__readFormat=m.format,M.__readType=m.type,M.__formatReadable=z.textureFormatReadable(m.format),M.__typeReadable=z.textureTypeReadable(m.type)),M}this.readRenderTargetPixels=function(m,M,P,D,B,U,q,H=0){if(!(m&&m.isWebGLRenderTarget)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Y=j.get(m).__webglFramebuffer;if(m.isWebGLCubeRenderTarget&&q!==void 0&&(Y=Y[q]),Y){A.bindFramebuffer(X.FRAMEBUFFER,Y);try{let $=m.textures[H],oe=$.format,te=$.type;m.textures.length>1&&X.readBuffer(X.COLOR_ATTACHMENT0+H);let ne=v($);if(ne.__formatReadable===!1){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ne.__typeReadable===!1){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}M>=0&&M<=m.width-D&&P>=0&&P<=m.height-B&&X.readPixels(M,P,D,B,Ee.convert(oe),Ee.convert(te),U)}finally{let $=ce!==null?j.get(ce).__webglFramebuffer:null;A.bindFramebuffer(X.FRAMEBUFFER,$)}}},this.readRenderTargetPixelsAsync=async function(m,M,P,D,B,U,q,H=0){if(!(m&&m.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Y=j.get(m).__webglFramebuffer;if(m.isWebGLCubeRenderTarget&&q!==void 0&&(Y=Y[q]),Y)if(M>=0&&M<=m.width-D&&P>=0&&P<=m.height-B){A.bindFramebuffer(X.FRAMEBUFFER,Y);let $=m.textures[H],oe=$.format,te=$.type;m.textures.length>1&&X.readBuffer(X.COLOR_ATTACHMENT0+H);let ne=v($);if(ne.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ne.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ge=X.createBuffer();X.bindBuffer(X.PIXEL_PACK_BUFFER,ge),X.bufferData(X.PIXEL_PACK_BUFFER,U.byteLength,X.STREAM_READ),X.readPixels(M,P,D,B,Ee.convert(oe),Ee.convert(te),0),X.bindBuffer(X.PIXEL_PACK_BUFFER,null);let pe=ce!==null?j.get(ce).__webglFramebuffer:null;A.bindFramebuffer(X.FRAMEBUFFER,pe);let me=X.fenceSync(X.SYNC_GPU_COMMANDS_COMPLETE,0);return X.flush(),await _d(X,me,4),X.bindBuffer(X.PIXEL_PACK_BUFFER,ge),X.getBufferSubData(X.PIXEL_PACK_BUFFER,0,U),X.bindBuffer(X.PIXEL_PACK_BUFFER,null),X.deleteBuffer(ge),X.deleteSync(me),U}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(m,M=null,P=0){let D=Math.pow(2,-P),B=Math.floor(m.image.width*D),U=Math.floor(m.image.height*D),q=M!==null?M.x:0,H=M!==null?M.y:0;se.setTexture2D(m,0),X.copyTexSubImage2D(X.TEXTURE_2D,P,0,0,q,H,B,U),A.unbindTexture()},this.copyTextureToTexture=function(m,M,P=null,D=null,B=0,U=0){let q,H,Y,$,oe,te,ne,ge,pe,me=m.isCompressedTexture?m.mipmaps[U]:m.image;if(P!==null)q=P.max.x-P.min.x,H=P.max.y-P.min.y,Y=P.isBox3?P.max.z-P.min.z:1,$=P.min.x,oe=P.min.y,te=P.isBox3?P.min.z:0;else{let Ve=Math.pow(2,-B);q=Math.floor(me.width*Ve),H=Math.floor(me.height*Ve),m.isDataArrayTexture?Y=me.depth:m.isData3DTexture?Y=Math.floor(me.depth*Ve):Y=1,$=0,oe=0,te=0}D!==null?(ne=D.x,ge=D.y,pe=D.z):(ne=0,ge=0,pe=0);let Se=Ee.convert(M.format),Ge=Ee.convert(M.type),fe;M.isData3DTexture?(se.setTexture3D(M,0),fe=X.TEXTURE_3D):M.isDataArrayTexture||M.isCompressedArrayTexture?(se.setTexture2DArray(M,0),fe=X.TEXTURE_2D_ARRAY):(se.setTexture2D(M,0),fe=X.TEXTURE_2D),A.activeTexture(X.TEXTURE0),A.pixelStorei(X.UNPACK_FLIP_Y_WEBGL,M.flipY),A.pixelStorei(X.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),A.pixelStorei(X.UNPACK_ALIGNMENT,M.unpackAlignment);let Ze=A.getParameter(X.UNPACK_ROW_LENGTH),xe=A.getParameter(X.UNPACK_IMAGE_HEIGHT),Me=A.getParameter(X.UNPACK_SKIP_PIXELS),Fe=A.getParameter(X.UNPACK_SKIP_ROWS),ft=A.getParameter(X.UNPACK_SKIP_IMAGES);A.pixelStorei(X.UNPACK_ROW_LENGTH,me.width),A.pixelStorei(X.UNPACK_IMAGE_HEIGHT,me.height),A.pixelStorei(X.UNPACK_SKIP_PIXELS,$),A.pixelStorei(X.UNPACK_SKIP_ROWS,oe),A.pixelStorei(X.UNPACK_SKIP_IMAGES,te);let ot=m.isDataArrayTexture||m.isData3DTexture,De=M.isDataArrayTexture||M.isData3DTexture;if(m.isDepthTexture){let Ve=j.get(m),Ct=j.get(M),at=j.get(Ve.__renderTarget),mt=j.get(Ct.__renderTarget);A.bindFramebuffer(X.READ_FRAMEBUFFER,at.__webglFramebuffer),A.bindFramebuffer(X.DRAW_FRAMEBUFFER,mt.__webglFramebuffer);for(let fn=0;fn<Y;fn++)ot&&(X.framebufferTextureLayer(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,j.get(m).__webglTexture,B,te+fn),X.framebufferTextureLayer(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,j.get(M).__webglTexture,U,pe+fn)),X.blitFramebuffer($,oe,q,H,ne,ge,q,H,X.DEPTH_BUFFER_BIT,X.NEAREST);A.bindFramebuffer(X.READ_FRAMEBUFFER,null),A.bindFramebuffer(X.DRAW_FRAMEBUFFER,null)}else if(B!==0||m.isRenderTargetTexture||j.has(m)){let Ve=j.get(m),Ct=j.get(M);A.bindFramebuffer(X.READ_FRAMEBUFFER,N),A.bindFramebuffer(X.DRAW_FRAMEBUFFER,V);for(let at=0;at<Y;at++)ot?X.framebufferTextureLayer(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,Ve.__webglTexture,B,te+at):X.framebufferTexture2D(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,Ve.__webglTexture,B),De?X.framebufferTextureLayer(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,Ct.__webglTexture,U,pe+at):X.framebufferTexture2D(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,Ct.__webglTexture,U),B!==0?X.blitFramebuffer($,oe,q,H,ne,ge,q,H,X.COLOR_BUFFER_BIT,X.NEAREST):De?X.copyTexSubImage3D(fe,U,ne,ge,pe+at,$,oe,q,H):X.copyTexSubImage2D(fe,U,ne,ge,$,oe,q,H);A.bindFramebuffer(X.READ_FRAMEBUFFER,null),A.bindFramebuffer(X.DRAW_FRAMEBUFFER,null)}else De?m.isDataTexture||m.isData3DTexture?X.texSubImage3D(fe,U,ne,ge,pe,q,H,Y,Se,Ge,me.data):M.isCompressedArrayTexture?X.compressedTexSubImage3D(fe,U,ne,ge,pe,q,H,Y,Se,me.data):X.texSubImage3D(fe,U,ne,ge,pe,q,H,Y,Se,Ge,me):m.isDataTexture?X.texSubImage2D(X.TEXTURE_2D,U,ne,ge,q,H,Se,Ge,me.data):m.isCompressedTexture?X.compressedTexSubImage2D(X.TEXTURE_2D,U,ne,ge,me.width,me.height,Se,me.data):X.texSubImage2D(X.TEXTURE_2D,U,ne,ge,q,H,Se,Ge,me);A.pixelStorei(X.UNPACK_ROW_LENGTH,Ze),A.pixelStorei(X.UNPACK_IMAGE_HEIGHT,xe),A.pixelStorei(X.UNPACK_SKIP_PIXELS,Me),A.pixelStorei(X.UNPACK_SKIP_ROWS,Fe),A.pixelStorei(X.UNPACK_SKIP_IMAGES,ft),U===0&&M.generateMipmaps&&X.generateMipmap(fe),A.unbindTexture()},this.initRenderTarget=function(m){j.get(m).__webglFramebuffer===void 0&&se.setupRenderTarget(m)},this.initTexture=function(m){m.isCubeTexture?se.setTextureCube(m,0):m.isData3DTexture?se.setTexture3D(m,0):m.isDataArrayTexture||m.isCompressedArrayTexture?se.setTexture2DArray(m,0):se.setTexture2D(m,0),A.unbindTexture()},this.resetState=function(){W=0,J=0,ce=null,A.reset(),Pe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return $n}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}};var cs=Math.pow(2,-24),To=Symbol("SKIP_GENERATION"),Hl={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[To]:!1};function Nt(i,e,t){return t.min.x=e[i],t.min.y=e[i+1],t.min.z=e[i+2],t.max.x=e[i+3],t.max.y=e[i+4],t.max.z=e[i+5],t}function wo(i){let e=-1,t=-1/0;for(let n=0;n<3;n++){let r=i[n+3]-i[n];r>t&&(t=r,e=n)}return e}function _h(i,e){e.set(i)}function yh(i,e,t){let n,r;for(let s=0;s<3;s++){let o=s+3;n=i[s],r=e[s],t[s]=n<r?n:r,n=i[o],r=e[o],t[o]=n>r?n:r}}function Ao(i,e,t){for(let n=0;n<3;n++){let r=e[i+2*n],s=e[i+2*n+1],o=r-s,a=r+s;o<t[n]&&(t[n]=o),a>t[n+3]&&(t[n+3]=a)}}function us(i){let e=i[3]-i[0],t=i[4]-i[1],n=i[5]-i[2];return 2*(e*t+t*n+n*e)}function pt(i,e){return e[i+15]===65535}function St(i,e){return e[i+6]}function Rt(i,e){return e[i+14]}function Mt(i){return i+8}function Tt(i,e){let t=e[i+6];return i+t*8}function Yi(i,e){return e[i+7]}function Gl(i,e,t,n,r){let s=1/0,o=1/0,a=1/0,l=-1/0,u=-1/0,f=-1/0,h=1/0,c=1/0,d=1/0,x=-1/0,b=-1/0,p=-1/0,g=i.offset||0;for(let S=(e-g)*6,w=(e+t-g)*6;S<w;S+=6){let y=i[S+0],T=i[S+1],E=y-T,C=y+T;E<s&&(s=E),C>l&&(l=C),y<h&&(h=y),y>x&&(x=y);let _=i[S+2],R=i[S+3],I=_-R,F=_+R;I<o&&(o=I),F>u&&(u=F),_<c&&(c=_),_>b&&(b=_);let L=i[S+4],O=i[S+5],N=L-O,V=L+O;N<a&&(a=N),V>f&&(f=V),L<d&&(d=L),L>p&&(p=L)}n[0]=s,n[1]=o,n[2]=a,n[3]=l,n[4]=u,n[5]=f,r[0]=h,r[1]=c,r[2]=d,r[3]=x,r[4]=b,r[5]=p}var wi=32,zy=(i,e)=>i.candidate-e.candidate,Zi=new Array(wi).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),Wl=new Float32Array(6);function tp(i,e,t,n,r,s){let o=-1,a=0;if(s===0)o=wo(e),o!==-1&&(a=(e[o]+e[o+3])/2);else if(s===1)o=wo(i),o!==-1&&(a=ky(t,n,r,o));else if(s===2){let l=us(i),u=1.25*r,f=t.offset||0,h=(n-f)*6,c=(n+r-f)*6;for(let d=0;d<3;d++){let x=e[d],g=(e[d+3]-x)/wi;if(r<wi/4){let S=[...Zi];S.length=r;let w=0;for(let T=h;T<c;T+=6,w++){let E=S[w];E.candidate=t[T+2*d],E.count=0;let{bounds:C,leftCacheBounds:_,rightCacheBounds:R}=E;for(let I=0;I<3;I++)R[I]=1/0,R[I+3]=-1/0,_[I]=1/0,_[I+3]=-1/0,C[I]=1/0,C[I+3]=-1/0;Ao(T,t,C)}S.sort(zy);let y=r;for(let T=0;T<y;T++){let E=S[T];for(;T+1<y&&S[T+1].candidate===E.candidate;)S.splice(T+1,1),y--}for(let T=h;T<c;T+=6){let E=t[T+2*d];for(let C=0;C<y;C++){let _=S[C];E>=_.candidate?Ao(T,t,_.rightCacheBounds):(Ao(T,t,_.leftCacheBounds),_.count++)}}for(let T=0;T<y;T++){let E=S[T],C=E.count,_=r-E.count,R=E.leftCacheBounds,I=E.rightCacheBounds,F=0;C!==0&&(F=us(R)/l);let L=0;_!==0&&(L=us(I)/l);let O=1+1.25*(F*C+L*_);O<u&&(o=d,u=O,a=E.candidate)}}else{for(let y=0;y<wi;y++){let T=Zi[y];T.count=0,T.candidate=x+g+y*g;let E=T.bounds;for(let C=0;C<3;C++)E[C]=1/0,E[C+3]=-1/0}for(let y=h;y<c;y+=6){let C=~~((t[y+2*d]-x)/g);C>=wi&&(C=wi-1);let _=Zi[C];_.count++,Ao(y,t,_.bounds)}let S=Zi[wi-1];_h(S.bounds,S.rightCacheBounds);for(let y=wi-2;y>=0;y--){let T=Zi[y],E=Zi[y+1];yh(T.bounds,E.rightCacheBounds,T.rightCacheBounds)}let w=0;for(let y=0;y<wi-1;y++){let T=Zi[y],E=T.count,C=T.bounds,R=Zi[y+1].rightCacheBounds;E!==0&&(w===0?_h(C,Wl):yh(C,Wl,Wl)),w+=E;let I=0,F=0;w!==0&&(I=us(Wl)/l);let L=r-w;L!==0&&(F=us(R)/l);let O=1+1.25*(I*w+F*L);O<u&&(o=d,u=O,a=T.candidate)}}}}else console.warn(`BVH: Invalid build strategy value ${s} used.`);return{axis:o,pos:a}}function ky(i,e,t,n){let r=0,s=i.offset;for(let o=e,a=e+t;o<a;o++)r+=i[(o-s)*6+n*2];return r/t}var hs=class{constructor(){this.boundingData=new Float32Array(6)}};function np(i,e,t,n,r,s){let o=n,a=n+r-1,l=s.pos,u=s.axis*2,f=t.offset||0;for(;;){for(;o<=a&&t[(o-f)*6+u]<l;)o++;for(;o<=a&&t[(a-f)*6+u]>=l;)a--;if(o<a){for(let h=0;h<e;h++){let c=i[o*e+h];i[o*e+h]=i[a*e+h],i[a*e+h]=c}for(let h=0;h<6;h++){let c=o-f,d=a-f,x=t[c*6+h];t[c*6+h]=t[d*6+h],t[d*6+h]=x}o++,a--}else return o}}var ip,Xl,Sh,rp,Vy=Math.pow(2,32);function ql(i){return"count"in i?1:1+ql(i.left)+ql(i.right)}function sp(i,e,t){return ip=new Float32Array(t),Xl=new Uint32Array(t),Sh=new Uint16Array(t),rp=new Uint8Array(t),bh(i,e)}function bh(i,e){let t=i/4,n=i/2,r="count"in e,s=e.boundingData;for(let o=0;o<6;o++)ip[t+o]=s[o];if(r)return e.buffer?(rp.set(new Uint8Array(e.buffer),i),i+e.buffer.byteLength):(Xl[t+6]=e.offset,Sh[n+14]=e.count,Sh[n+15]=65535,i+32);{let{left:o,right:a,splitAxis:l}=e,u=i+32,f=bh(u,o),h=i/32,d=f/32-h;if(d>Vy)throw new Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");return Xl[t+6]=d,Xl[t+7]=l,bh(f,a)}}function Hy(i,e,t,n,r,s){let{maxDepth:o,verbose:a,targetLeafSize:l,_strictLeafSize:u=1/0,strategy:f,onProgress:h}=r,c=i.primitiveBuffer,d=i.primitiveBufferStride,x=new Float32Array(6),b=!1,p=new hs;return Gl(e,t,n,p.boundingData,x),S(p,t,n,x),p;function g(w){h&&h((w-s.offset)/s.count)}function S(w,y,T,E=null,C=0){!b&&C>=o&&(b=!0,a&&console.warn(`BVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`));let _=T>u;if(T<=l&&!_||C>=o)return g(y+T),w.offset=y,w.count=T,w;let R=tp(w.boundingData,E,e,y,T,f),I=R.axis===-1?-1:np(c,d,e,y,T,R);if(R.axis===-1||I===y||I===y+T){if(!_)return g(y+T),w.offset=y,w.count=T,w;R.axis=Math.max(0,wo(w.boundingData)),I=y+Math.max(1,Math.floor(T/2))}w.splitAxis=R.axis;let F=new hs,L=y,O=I-y;w.left=F,Gl(e,L,O,F.boundingData,x),S(F,L,O,x,C+1);let N=new hs,V=I,W=T-O;return w.right=N,Gl(e,V,W,N.boundingData,x),S(N,V,W,x,C+1),w}}function op(i,e){let t=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,n=i.getRootRanges(e.range),r=n[0],s=n[n.length-1],o={offset:r.offset,count:s.offset+s.count-r.offset},a=new Float32Array(6*o.count);a.offset=o.offset,i.computePrimitiveBounds(o.offset,o.count,a),i._roots=n.map(l=>{let u=Hy(i,a,l.offset,l.count,e,o),f=ql(u),h=new t(32*f);return sp(0,u,h),h})}var $i=class{constructor(e){this._getNewPrimitive=e,this._primitives=[]}getPrimitive(){let e=this._primitives;return e.length===0?this._getNewPrimitive():e.pop()}releasePrimitive(e){this._primitives.push(e)}};var Mh=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let e=[],t=null;this.setBuffer=n=>{t&&e.push(t),t=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{t=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,e.length!==0&&this.setBuffer(e.pop())}}},_t=new Mh;var Ji,ds,fs=[],Yl=new $i(()=>new Vt);function ap(i,e,t,n,r,s){Ji=Yl.getPrimitive(),ds=Yl.getPrimitive(),fs.push(Ji,ds),_t.setBuffer(i._roots[e]);let o=Th(0,i.geometry,t,n,r,s);_t.clearBuffer(),Yl.releasePrimitive(Ji),Yl.releasePrimitive(ds),fs.pop(),fs.pop();let a=fs.length;return a>0&&(ds=fs[a-1],Ji=fs[a-2]),o}function Th(i,e,t,n,r=null,s=0,o=0){let{float32Array:a,uint16Array:l,uint32Array:u}=_t,f=i*2;if(pt(f,l)){let c=St(i,u),d=Rt(f,l);return Nt(i,a,Ji),n(c,d,!1,o,s+i/8,Ji)}else{let I=function(L){let{uint16Array:O,uint32Array:N}=_t,V=L*2;for(;!pt(V,O);)L=Mt(L),V=L*2;return St(L,N)},F=function(L){let{uint16Array:O,uint32Array:N}=_t,V=L*2;for(;!pt(V,O);)L=Tt(L,N),V=L*2;return St(L,N)+Rt(V,O)},c=Mt(i),d=Tt(i,u),x=c,b=d,p,g,S,w;if(r&&(S=Ji,w=ds,Nt(x,a,S),Nt(b,a,w),p=r(S),g=r(w),g<p)){x=d,b=c;let L=p;p=g,g=L,S=w}S||(S=Ji,Nt(x,a,S));let y=pt(x*2,l),T=t(S,y,p,o+1,s+x/8),E;if(T===2){let L=I(x),N=F(x)-L;E=n(L,N,!0,o+1,s+x/8,S)}else E=T&&Th(x,e,t,n,r,s,o+1);if(E)return!0;w=ds,Nt(b,a,w);let C=pt(b*2,l),_=t(w,C,g,o+1,s+b/8),R;if(_===2){let L=I(b),N=F(b)-L;R=n(L,N,!0,o+1,s+b/8,w)}else R=_&&Th(b,e,t,n,r,s,o+1);return!!R}}var Eo=new _t.constructor,$l=new _t.constructor,Ki=new $i(()=>new Vt),ps=new Vt,ms=new Vt,wh=new Vt,Ah=new Vt,Eh=!1;function lp(i,e,t,n){if(Eh)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");Eh=!0;let r=i._roots,s=e._roots,o,a=0,l=0,u=new $e().copy(t).invert();for(let f=0,h=r.length;f<h;f++){Eo.setBuffer(r[f]),l=0;let c=Ki.getPrimitive();Nt(0,Eo.float32Array,c),c.applyMatrix4(u);for(let d=0,x=s.length;d<x&&($l.setBuffer(s[d]),o=Jn(0,0,t,u,n,a,l,0,0,c),$l.clearBuffer(),l+=s[d].byteLength/32,!o);d++);if(Ki.releasePrimitive(c),Eo.clearBuffer(),a+=r[f].byteLength/32,o)break}return Eh=!1,o}function Jn(i,e,t,n,r,s=0,o=0,a=0,l=0,u=null,f=!1){let h,c;f?(h=$l,c=Eo):(h=Eo,c=$l);let d=h.float32Array,x=h.uint32Array,b=h.uint16Array,p=c.float32Array,g=c.uint32Array,S=c.uint16Array,w=i*2,y=e*2,T=pt(w,b),E=pt(y,S),C=!1;if(E&&T)f?C=r(St(e,g),Rt(e*2,S),St(i,x),Rt(i*2,b),l,o+e/8,a,s+i/8):C=r(St(i,x),Rt(i*2,b),St(e,g),Rt(e*2,S),a,s+i/8,l,o+e/8);else if(E){let _=Ki.getPrimitive();Nt(e,p,_),_.applyMatrix4(t);let R=Mt(i),I=Tt(i,x);Nt(R,d,ps),Nt(I,d,ms);let F=_.intersectsBox(ps),L=_.intersectsBox(ms);C=F&&Jn(e,R,n,t,r,o,s,l,a+1,_,!f)||L&&Jn(e,I,n,t,r,o,s,l,a+1,_,!f),Ki.releasePrimitive(_)}else{let _=Mt(e),R=Tt(e,g);Nt(_,p,wh),Nt(R,p,Ah);let I=u.intersectsBox(wh),F=u.intersectsBox(Ah);if(I&&F)C=Jn(i,_,t,n,r,s,o,a,l+1,u,f)||Jn(i,R,t,n,r,s,o,a,l+1,u,f);else if(I)if(T)C=Jn(i,_,t,n,r,s,o,a,l+1,u,f);else{let L=Ki.getPrimitive();L.copy(wh).applyMatrix4(t);let O=Mt(i),N=Tt(i,x);Nt(O,d,ps),Nt(N,d,ms);let V=L.intersectsBox(ps),W=L.intersectsBox(ms);C=V&&Jn(_,O,n,t,r,o,s,l,a+1,L,!f)||W&&Jn(_,N,n,t,r,o,s,l,a+1,L,!f),Ki.releasePrimitive(L)}else if(F)if(T)C=Jn(i,R,t,n,r,s,o,a,l+1,u,f);else{let L=Ki.getPrimitive();L.copy(Ah).applyMatrix4(t);let O=Mt(i),N=Tt(i,x);Nt(O,d,ps),Nt(N,d,ms);let V=L.intersectsBox(ps),W=L.intersectsBox(ms);C=V&&Jn(R,O,n,t,r,o,s,l,a+1,L,!f)||W&&Jn(R,N,n,t,r,o,s,l,a+1,L,!f),Ki.releasePrimitive(L)}}return C}var Jl=new class{constructor(){let i=null,e=null,t=null,n=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(s,o)=>{if(n)throw new Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=o,this.buffer=i=s._roots[o],this.uint16Array=t=new Uint16Array(i),this.uint32Array=e=new Uint32Array(i)},this.reset=()=>{this.root=null,this.buffer=i=null,this.uint16Array=t=null,this.uint32Array=e=null},this.getRangeStart=s=>{let o=s*2;for(;!pt(o,t);)s=Mt(s),o=s*2;return St(s,e)},this.getRangeEnd=s=>{let o=s*2;for(;!pt(o,t);)s=Tt(s,e),o=s*2;return St(s,e)+Rt(o,t)};let r=(s,o,a)=>{let l=o*2,u=pt(l,t);if(!s(a,u,o)&&!u){let h=Mt(o),c=Tt(o,e);r(s,h,a+1),r(s,c,a+1)}};this.traverseBuffer=s=>{if(n)throw new Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");n=!0;try{r(s,0,0)}finally{n=!1}},this.traverse=s=>{this.traverseBuffer((o,a,l)=>{if(a){let u=l*2,f=e[l+6],h=t[u+14];return s(o,a,new Float32Array(i,l*4,6),f,h)}else{let u=Yi(l,e);return s(o,a,new Float32Array(i,l*4,6),u)}})}}};var cp=new Vt,gs=new Float32Array(6),Kl=class{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(e){e={...Hl,...e},"maxLeafSize"in e&&(console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafSize}),op(this,e)}getRootRanges(){throw new Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw new Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(e,t,n,r){let s=1/0,o=1/0,a=1/0,l=-1/0,u=-1/0,f=-1/0;for(let h=e,c=e+t;h<c;h++){this.writePrimitiveBounds(h,gs,0);let[d,x,b,p,g,S]=gs;d<s&&(s=d),p>l&&(l=p),x<o&&(o=x),g>u&&(u=g),b<a&&(a=b),S>f&&(f=S)}return n[r+0]=s,n[r+1]=o,n[r+2]=a,n[r+3]=l,n[r+4]=u,n[r+5]=f,n}computePrimitiveBounds(e,t,n){let r=n.offset||0;for(let s=e,o=e+t;s<o;s++){this.writePrimitiveBounds(s,gs,0);let[a,l,u,f,h,c]=gs,d=(a+f)/2,x=(l+h)/2,b=(u+c)/2,p=(f-a)/2,g=(h-l)/2,S=(c-u)/2,w=(s-r)*6;n[w+0]=d,n[w+1]=p+(Math.abs(d)+p)*cs,n[w+2]=x,n[w+3]=g+(Math.abs(x)+g)*cs,n[w+4]=b,n[w+5]=S+(Math.abs(b)+S)*cs}return n}shiftPrimitiveOffsets(e){let t=this._indirectBuffer;if(t)for(let n=0,r=t.length;n<r;n++)t[n]+=e;else{let n=this._roots;for(let r=0;r<n.length;r++){let s=n[r],o=new Uint32Array(s),a=new Uint16Array(s),l=s.byteLength/32;for(let u=0;u<l;u++){let f=8*u,h=2*f;pt(h,a)&&(o[f+6]+=e)}}}}traverse(e,t=0){Jl.setBVH(this,t),Jl.traverse(e),Jl.reset()}refit(){let e=this._roots;for(let t=0,n=e.length;t<n;t++){let r=e[t],s=new Uint32Array(r),o=new Uint16Array(r),a=new Float32Array(r),l=r.byteLength/32;for(let u=l-1;u>=0;u--){let f=u*8,h=f*2;if(pt(h,o)){let d=St(f,s),x=Rt(h,o);this.writePrimitiveRangeBounds(d,x,gs,0),a.set(gs,f)}else{let d=Mt(f),x=Tt(f,s);for(let b=0;b<3;b++){let p=a[d+b],g=a[d+b+3],S=a[x+b],w=a[x+b+3];a[f+b]=p<S?p:S,a[f+b+3]=g>w?g:w}}}}}getBoundingBox(e){return e.makeEmpty(),this._roots.forEach(n=>{Nt(0,new Float32Array(n),cp),e.union(cp)}),e}shapecast(e){let{boundsTraverseOrder:t,intersectsBounds:n,intersectsRange:r,intersectsPrimitive:s,scratchPrimitive:o,iterate:a}=e;if(r&&s){let h=r;r=(c,d,x,b,p)=>h(c,d,x,b,p)?!0:a(c,d,this,s,x,b,o)}else r||(s?r=(h,c,d,x)=>a(h,c,this,s,d,x,o):r=(h,c,d)=>d);let l=!1,u=0,f=this._roots;for(let h=0,c=f.length;h<c;h++){let d=f[h];if(l=ap(this,h,n,r,t,u),l)break;u+=d.byteLength/32}return l}bvhcast(e,t,n){let{intersectsRanges:r}=n;return lp(this,e,t,r)}};function up(){return typeof SharedArrayBuffer<"u"}function Ro(i){return i.index?i.index.count:i.attributes.position.count}function Qi(i){return Ro(i)/3}function Rh(i,e=ArrayBuffer){return i>65535?new Uint32Array(new e(4*i)):new Uint16Array(new e(2*i))}function hp(i,e){if(!i.index){let t=i.attributes.position.count,n=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,r=Rh(t,n);i.setIndex(new xt(r,1));for(let s=0;s<t;s++)r[s]=s}}function Wy(i,e,t){let n=Ro(i)/t,r=e||i.drawRange,s=r.start/t,o=(r.start+r.count)/t,a=Math.max(0,s),l=Math.min(n,o)-a;return{offset:Math.floor(a),count:Math.floor(l)}}function Xy(i,e){return i.groups.map(t=>({offset:t.start/e,count:t.count/e}))}function Ch(i,e,t){let n=Wy(i,e,t),r=Xy(i,t);if(!r.length)return[n];let s=[],o=n.offset,a=n.offset+n.count,l=Ro(i)/t,u=[];for(let c of r){let{offset:d,count:x}=c,b=d,p=isFinite(x)?x:l-d,g=d+p;b<a&&g>o&&(u.push({pos:Math.max(o,b),isStart:!0}),u.push({pos:Math.min(a,g),isStart:!1}))}u.sort((c,d)=>c.pos!==d.pos?c.pos-d.pos:c.type==="end"?-1:1);let f=0,h=null;for(let c of u){let d=c.pos;f!==0&&d!==h&&s.push({offset:h,count:d-h}),f+=c.isStart?1:-1,h=d}return s}function qy(i,e){let t=i[i.length-1],n=t.offset+t.count>2**16,r=i.reduce((u,f)=>u+f.count,0),s=n?4:2,o=e?new SharedArrayBuffer(r*s):new ArrayBuffer(r*s),a=n?new Uint32Array(o):new Uint16Array(o),l=0;for(let u=0;u<i.length;u++){let{offset:f,count:h}=i[u];for(let c=0;c<h;c++)a[l+c]=f+c;l+=h}return a}var Ql=class extends Kl{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(e){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(e){}constructor(e,t={}){if(e.isBufferGeometry){if(e.index&&e.index.isInterleavedBufferAttribute)throw new Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("BVH: Only BufferGeometries are supported.");if(t.useSharedArrayBuffer&&!up())throw new Error("BVH: SharedArrayBuffer is not available.");super(),this.geometry=e,this.resolvePrimitiveIndex=t.indirect?n=>this._indirectBuffer[n]:n=>n,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,t={...Hl,...t},t[To]||this.init(t)}init(e){let{geometry:t,primitiveStride:n}=this;if(e.indirect){let r=Ch(t,e.range,n),s=qy(r,e.useSharedArrayBuffer);this._indirectBuffer=s}else hp(t,e);super.init(e),!t.boundingBox&&e.setBoundingBox&&(t.boundingBox=this.getBoundingBox(new Vt))}getRootRanges(e){return this.indirect?[{offset:0,count:this._indirectBuffer.length}]:Ch(this.geometry,e,this.primitiveStride)}raycastObject3D(){throw new Error("BVH: raycastObject3D() not implemented")}};var Bn=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(e,t){let n=1/0,r=-1/0;for(let s=0,o=e.length;s<o;s++){let l=e[s][t];n=l<n?l:n,r=l>r?l:r}this.min=n,this.max=r}setFromPoints(e,t){let n=1/0,r=-1/0;for(let s=0,o=t.length;s<o;s++){let a=t[s],l=e.dot(a);n=l<n?l:n,r=l>r?l:r}this.min=n,this.max=r}isSeparated(e){return this.min>e.max||e.min>this.max}};Bn.prototype.setFromBox=(function(){let i=new k;return function(t,n){let r=n.min,s=n.max,o=1/0,a=-1/0;for(let l=0;l<=1;l++)for(let u=0;u<=1;u++)for(let f=0;f<=1;f++){i.x=r.x*l+s.x*(1-l),i.y=r.y*u+s.y*(1-u),i.z=r.z*f+s.z*(1-f);let h=t.dot(i);o=Math.min(h,o),a=Math.max(h,a)}this.min=o,this.max=a}})();var Yy=(function(){let i=new k,e=new k,t=new k;return function(r,s,o){let a=r.start,l=i,u=s.start,f=e;t.subVectors(a,u),i.subVectors(r.end,r.start),e.subVectors(s.end,s.start);let h=t.dot(f),c=f.dot(l),d=f.dot(f),x=t.dot(l),p=l.dot(l)*d-c*c,g,S;p!==0?g=(h*c-x*d)/p:g=0,S=(h+g*c)/d,o.x=g,o.y=S}})(),Co=(function(){let i=new Oe,e=new k,t=new k;return function(r,s,o,a){Yy(r,s,i);let l=i.x,u=i.y;if(l>=0&&l<=1&&u>=0&&u<=1){r.at(l,o),s.at(u,a);return}else if(l>=0&&l<=1){u<0?s.at(0,a):s.at(1,a),r.closestPointToPoint(a,!0,o);return}else if(u>=0&&u<=1){l<0?r.at(0,o):r.at(1,o),s.closestPointToPoint(o,!0,a);return}else{let f;l<0?f=r.start:f=r.end;let h;u<0?h=s.start:h=s.end;let c=e,d=t;if(r.closestPointToPoint(h,!0,e),s.closestPointToPoint(f,!0,t),c.distanceToSquared(h)<=d.distanceToSquared(f)){o.copy(c),a.copy(h);return}else{o.copy(f),a.copy(d);return}}}})(),fp=(function(){let i=new k,e=new k,t=new bn,n=new Mn;return function(s,o){let{radius:a,center:l}=s,{a:u,b:f,c:h}=o;if(n.start=u,n.end=f,n.closestPointToPoint(l,!0,i).distanceTo(l)<=a||(n.start=u,n.end=h,n.closestPointToPoint(l,!0,i).distanceTo(l)<=a)||(n.start=f,n.end=h,n.closestPointToPoint(l,!0,i).distanceTo(l)<=a))return!0;let b=o.getPlane(t);if(Math.abs(b.distanceToPoint(l))<=a){let g=b.projectPoint(l,e);if(o.containsPoint(g))return!0}return!1}})();var Zy=["x","y","z"],Ai=1e-15,dp=Ai*Ai;function Wn(i){return Math.abs(i)<Ai}var pn=class extends vn{constructor(...e){super(...e),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new k),this.satBounds=new Array(4).fill().map(()=>new Bn),this.points=[this.a,this.b,this.c],this.plane=new bn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new Mn,this.needsUpdate=!0}intersectsSphere(e){return fp(e,this)}update(){let e=this.a,t=this.b,n=this.c,r=this.points,s=this.satAxes,o=this.satBounds,a=s[0],l=o[0];this.getNormal(a),l.setFromPoints(a,r);let u=s[1],f=o[1];u.subVectors(e,t),f.setFromPoints(u,r);let h=s[2],c=o[2];h.subVectors(t,n),c.setFromPoints(h,r);let d=s[3],x=o[3];d.subVectors(n,e),x.setFromPoints(d,r);let b=u.length(),p=h.length(),g=d.length();this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,b<Ai?p<Ai||g<Ai?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(n)):p<Ai?g<Ai?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(e)):g<Ai&&(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(n),this.degenerateSegment.end.copy(t)),this.plane.setFromNormalAndCoplanarPoint(a,e),this.needsUpdate=!1}};pn.prototype.closestPointToSegment=(function(){let i=new k,e=new k,t=new Mn;return function(r,s=null,o=null){let{start:a,end:l}=r,u=this.points,f,h=1/0;for(let c=0;c<3;c++){let d=(c+1)%3;t.start.copy(u[c]),t.end.copy(u[d]),Co(t,r,i,e),f=i.distanceToSquared(e),f<h&&(h=f,s&&s.copy(i),o&&o.copy(e))}return this.closestPointToPoint(a,i),f=a.distanceToSquared(i),f<h&&(h=f,s&&s.copy(i),o&&o.copy(a)),this.closestPointToPoint(l,i),f=l.distanceToSquared(i),f<h&&(h=f,s&&s.copy(i),o&&o.copy(l)),Math.sqrt(h)}})();pn.prototype.intersectsTriangle=(function(){let i=new pn,e=new Bn,t=new Bn,n=new k,r=new k,s=new k,o=new k,a=new Mn,l=new Mn,u=new k,f=new Oe,h=new Oe;function c(w,y,T,E){let C=n;!w.isDegenerateIntoPoint&&!w.isDegenerateIntoSegment?C.copy(w.plane.normal):C.copy(y.plane.normal);let _=w.satBounds,R=w.satAxes;for(let L=1;L<4;L++){let O=_[L],N=R[L];if(e.setFromPoints(N,y.points),O.isSeparated(e)||(o.copy(C).cross(N),e.setFromPoints(o,w.points),t.setFromPoints(o,y.points),e.isSeparated(t)))return!1}let I=y.satBounds,F=y.satAxes;for(let L=1;L<4;L++){let O=I[L],N=F[L];if(e.setFromPoints(N,w.points),O.isSeparated(e)||(o.crossVectors(C,N),e.setFromPoints(o,w.points),t.setFromPoints(o,y.points),e.isSeparated(t)))return!1}return T&&(E||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),T.start.set(0,0,0),T.end.set(0,0,0)),!0}function d(w,y,T,E,C,_,R,I,F,L,O){let N=R/(R-I);L.x=E+(C-E)*N,O.start.subVectors(y,w).multiplyScalar(N).add(w),N=R/(R-F),L.y=E+(_-E)*N,O.end.subVectors(T,w).multiplyScalar(N).add(w)}function x(w,y,T,E,C,_,R,I,F,L,O){if(C>0)d(w.c,w.a,w.b,E,y,T,F,R,I,L,O);else if(_>0)d(w.b,w.a,w.c,T,y,E,I,R,F,L,O);else if(I*F>0||R!=0)d(w.a,w.b,w.c,y,T,E,R,I,F,L,O);else if(I!=0)d(w.b,w.a,w.c,T,y,E,I,R,F,L,O);else if(F!=0)d(w.c,w.a,w.b,E,y,T,F,R,I,L,O);else return!0;return!1}function b(w,y,T,E){let C=y.degenerateSegment,_=w.plane.distanceToPoint(C.start),R=w.plane.distanceToPoint(C.end);return Wn(_)?Wn(R)?c(w,y,T,E):(T&&(T.start.copy(C.start),T.end.copy(C.start)),w.containsPoint(C.start)):Wn(R)?(T&&(T.start.copy(C.end),T.end.copy(C.end)),w.containsPoint(C.end)):w.plane.intersectLine(C,n)!=null?(T&&(T.start.copy(n),T.end.copy(n)),w.containsPoint(n)):!1}function p(w,y,T){let E=y.a;return Wn(w.plane.distanceToPoint(E))&&w.containsPoint(E)?(T&&(T.start.copy(E),T.end.copy(E)),!0):!1}function g(w,y,T){let E=w.degenerateSegment,C=y.a;return E.closestPointToPoint(C,!0,n),C.distanceToSquared(n)<dp?(T&&(T.start.copy(C),T.end.copy(C)),!0):!1}function S(w,y,T,E){if(w.isDegenerateIntoSegment)if(y.isDegenerateIntoSegment){let C=w.degenerateSegment,_=y.degenerateSegment,R=r,I=s;C.delta(R),_.delta(I);let F=n.subVectors(_.start,C.start),L=R.x*I.y-R.y*I.x;if(Wn(L))return!1;let O=(F.x*I.y-F.y*I.x)/L,N=-(R.x*F.y-R.y*F.x)/L;if(O<0||O>1||N<0||N>1)return!1;let V=C.start.z+R.z*O,W=_.start.z+I.z*N;return Wn(V-W)?(T&&(T.start.copy(C.start).addScaledVector(R,O),T.end.copy(C.start).addScaledVector(R,O)),!0):!1}else return y.isDegenerateIntoPoint?g(w,y,T):b(y,w,T,E);else{if(w.isDegenerateIntoPoint)return y.isDegenerateIntoPoint?y.a.distanceToSquared(w.a)<dp?(T&&(T.start.copy(w.a),T.end.copy(w.a)),!0):!1:y.isDegenerateIntoSegment?g(y,w,T):p(y,w,T);if(y.isDegenerateIntoPoint)return p(w,y,T);if(y.isDegenerateIntoSegment)return b(w,y,T,E)}}return function(y,T=null,E=!1){this.needsUpdate&&this.update(),y.isExtendedTriangle?y.needsUpdate&&y.update():(i.copy(y),i.update(),y=i);let C=S(this,y,T,E);if(C!==void 0)return C;let _=this.plane,R=y.plane,I=R.distanceToPoint(this.a),F=R.distanceToPoint(this.b),L=R.distanceToPoint(this.c);Wn(I)&&(I=0),Wn(F)&&(F=0),Wn(L)&&(L=0);let O=I*F,N=I*L;if(O>0&&N>0)return!1;let V=_.distanceToPoint(y.a),W=_.distanceToPoint(y.b),J=_.distanceToPoint(y.c);Wn(V)&&(V=0),Wn(W)&&(W=0),Wn(J)&&(J=0);let ce=V*W,K=V*J;if(ce>0&&K>0)return!1;r.copy(_.normal),s.copy(R.normal);let ie=r.cross(s),re=0,Te=Math.abs(ie.x),ve=Math.abs(ie.y);ve>Te&&(Te=ve,re=1),Math.abs(ie.z)>Te&&(re=2);let Ue=Zy[re],et=this.a[Ue],Q=this.b[Ue],le=this.c[Ue],Re=y.a[Ue],We=y.b[Ue],Ce=y.c[Ue];if(x(this,et,Q,le,O,N,I,F,L,f,a))return c(this,y,T,E);if(x(y,Re,We,Ce,ce,K,V,W,J,h,l))return c(this,y,T,E);if(f.y<f.x){let Ye=f.y;f.y=f.x,f.x=Ye,u.copy(a.start),a.start.copy(a.end),a.end.copy(u)}if(h.y<h.x){let Ye=h.y;h.y=h.x,h.x=Ye,u.copy(l.start),l.start.copy(l.end),l.end.copy(u)}return f.y<h.x||h.y<f.x?!1:(T&&(h.x>f.x?T.start.copy(l.start):T.start.copy(a.start),h.y<f.y?T.end.copy(l.end):T.end.copy(a.end)),!0)}})();pn.prototype.distanceToPoint=(function(){let i=new k;return function(t){return this.closestPointToPoint(t,i),t.distanceTo(i)}})();pn.prototype.distanceToTriangle=(function(){let i=new k,e=new k,t=["a","b","c"],n=new Mn,r=new Mn;return function(o,a=null,l=null){let u=a||l?n:null;if(this.intersectsTriangle(o,u,!0))return(a||l)&&(a&&u.getCenter(a),l&&u.getCenter(l)),0;let f=1/0;for(let h=0;h<3;h++){let c,d=t[h],x=o[d];this.closestPointToPoint(x,i),c=x.distanceToSquared(i),c<f&&(f=c,a&&a.copy(i),l&&l.copy(x));let b=this[d];o.closestPointToPoint(b,i),c=b.distanceToSquared(i),c<f&&(f=c,a&&a.copy(b),l&&l.copy(i))}for(let h=0;h<3;h++){let c=t[h],d=t[(h+1)%3];n.set(this[c],this[d]);for(let x=0;x<3;x++){let b=t[x],p=t[(x+1)%3];r.set(o[b],o[p]),Co(n,r,i,e);let g=i.distanceToSquared(e);g<f&&(f=g,a&&a.copy(i),l&&l.copy(e))}}return Math.sqrt(f)}})();var Wt=class{constructor(e,t,n){this.isOrientedBox=!0,this.min=new k,this.max=new k,this.matrix=new $e,this.invMatrix=new $e,this.points=new Array(8).fill().map(()=>new k),this.satAxes=new Array(3).fill().map(()=>new k),this.satBounds=new Array(3).fill().map(()=>new Bn),this.alignedSatBounds=new Array(3).fill().map(()=>new Bn),this.needsUpdate=!1,e&&this.min.copy(e),t&&this.max.copy(t),n&&this.matrix.copy(n)}set(e,t,n){this.min.copy(e),this.max.copy(t),this.matrix.copy(n),this.needsUpdate=!0}copy(e){this.min.copy(e.min),this.max.copy(e.max),this.matrix.copy(e.matrix),this.needsUpdate=!0}};Wt.prototype.update=(function(){return function(){let e=this.matrix,t=this.min,n=this.max,r=this.points;for(let u=0;u<=1;u++)for(let f=0;f<=1;f++)for(let h=0;h<=1;h++){let c=1*u|2*f|4*h,d=r[c];d.x=u?n.x:t.x,d.y=f?n.y:t.y,d.z=h?n.z:t.z,d.applyMatrix4(e)}let s=this.satBounds,o=this.satAxes,a=r[0];for(let u=0;u<3;u++){let f=o[u],h=s[u],c=1<<u,d=r[c];f.subVectors(a,d),h.setFromPoints(f,r)}let l=this.alignedSatBounds;l[0].setFromPointsField(r,"x"),l[1].setFromPointsField(r,"y"),l[2].setFromPointsField(r,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();Wt.prototype.intersectsBox=(function(){let i=new Bn;return function(t){this.needsUpdate&&this.update();let n=t.min,r=t.max,s=this.satBounds,o=this.satAxes,a=this.alignedSatBounds;if(i.min=n.x,i.max=r.x,a[0].isSeparated(i)||(i.min=n.y,i.max=r.y,a[1].isSeparated(i))||(i.min=n.z,i.max=r.z,a[2].isSeparated(i)))return!1;for(let l=0;l<3;l++){let u=o[l],f=s[l];if(i.setFromBox(u,t),f.isSeparated(i))return!1}return!0}})();Wt.prototype.intersectsTriangle=(function(){let i=new pn,e=new Array(3),t=new Bn,n=new Bn,r=new k;return function(o){this.needsUpdate&&this.update(),o.isExtendedTriangle?o.needsUpdate&&o.update():(i.copy(o),i.update(),o=i);let a=this.satBounds,l=this.satAxes;e[0]=o.a,e[1]=o.b,e[2]=o.c;for(let c=0;c<3;c++){let d=a[c],x=l[c];if(t.setFromPoints(x,e),d.isSeparated(t))return!1}let u=o.satBounds,f=o.satAxes,h=this.points;for(let c=0;c<3;c++){let d=u[c],x=f[c];if(t.setFromPoints(x,h),d.isSeparated(t))return!1}for(let c=0;c<3;c++){let d=l[c];for(let x=0;x<4;x++){let b=f[x];if(r.crossVectors(d,b),t.setFromPoints(r,e),n.setFromPoints(r,h),t.isSeparated(n))return!1}}return!0}})();Wt.prototype.closestPointToPoint=(function(){return function(e,t){return this.needsUpdate&&this.update(),t.copy(e).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),t}})();Wt.prototype.distanceToPoint=(function(){let i=new k;return function(t){return this.closestPointToPoint(t,i),t.distanceTo(i)}})();Wt.prototype.distanceToBox=(function(){let i=["x","y","z"],e=new Array(12).fill().map(()=>new Mn),t=new Array(12).fill().map(()=>new Mn),n=new k,r=new k;return function(o,a=0,l=null,u=null){if(this.needsUpdate&&this.update(),this.intersectsBox(o))return(l||u)&&(o.getCenter(r),this.closestPointToPoint(r,n),o.closestPointToPoint(n,r),l&&l.copy(n),u&&u.copy(r)),0;let f=a*a,h=o.min,c=o.max,d=this.points,x=1/0;for(let p=0;p<8;p++){let g=d[p];r.copy(g).clamp(h,c);let S=g.distanceToSquared(r);if(S<x&&(x=S,l&&l.copy(g),u&&u.copy(r),S<f))return Math.sqrt(S)}let b=0;for(let p=0;p<3;p++)for(let g=0;g<=1;g++)for(let S=0;S<=1;S++){let w=(p+1)%3,y=(p+2)%3,T=g<<w|S<<y,E=1<<p|g<<w|S<<y,C=d[T],_=d[E];e[b].set(C,_);let I=i[p],F=i[w],L=i[y],O=t[b],N=O.start,V=O.end;N[I]=h[I],N[F]=g?h[F]:c[F],N[L]=S?h[L]:c[F],V[I]=c[I],V[F]=g?h[F]:c[F],V[L]=S?h[L]:c[F],b++}for(let p=0;p<=1;p++)for(let g=0;g<=1;g++)for(let S=0;S<=1;S++){r.x=p?c.x:h.x,r.y=g?c.y:h.y,r.z=S?c.z:h.z,this.closestPointToPoint(r,n);let w=r.distanceToSquared(n);if(w<x&&(x=w,l&&l.copy(n),u&&u.copy(r),w<f))return Math.sqrt(w)}for(let p=0;p<12;p++){let g=e[p];for(let S=0;S<12;S++){let w=t[S];Co(g,w,n,r);let y=n.distanceToSquared(r);if(y<x&&(x=y,l&&l.copy(n),u&&u.copy(r),y<f))return Math.sqrt(y)}}return Math.sqrt(x)}})();var Ih=class extends $i{constructor(){super(()=>new pn)}},En=new Ih;var Io=new k,Ph=new k;function pp(i,e,t={},n=0,r=1/0){let s=n*n,o=r*r,a=1/0,l=null;if(i.shapecast({boundsTraverseOrder:f=>(Io.copy(e).clamp(f.min,f.max),Io.distanceToSquared(e)),intersectsBounds:(f,h,c)=>c<a&&c<o,intersectsTriangle:(f,h)=>{f.closestPointToPoint(e,Io);let c=e.distanceToSquared(Io);return c<a&&(Ph.copy(Io),a=c,l=h),c<s}}),a===1/0)return null;let u=Math.sqrt(a);return t.point?t.point.copy(Ph):t.point=Ph.clone(),t.distance=u,t.faceIndex=l,t}var jl=parseInt("186")>=169,$y=parseInt("186")<=161,xr=new k,vr=new k,_r=new k,ec=new Oe,tc=new Oe,nc=new Oe,mp=new k,gp=new k,xp=new k,Po=new k;function Jy(i,e,t,n,r,s,o,a){let l;if(s===Jt?l=i.intersectTriangle(n,t,e,!0,r):l=i.intersectTriangle(e,t,n,s!==_n,r),l===null)return null;let u=i.origin.distanceTo(r);return u<o||u>a?null:{distance:u,point:r.clone()}}function vp(i,e,t,n,r,s,o,a,l,u,f){xr.fromBufferAttribute(e,s),vr.fromBufferAttribute(e,o),_r.fromBufferAttribute(e,a);let h=Jy(i,xr,vr,_r,Po,l,u,f);if(h){if(n){ec.fromBufferAttribute(n,s),tc.fromBufferAttribute(n,o),nc.fromBufferAttribute(n,a),h.uv=new Oe;let d=vn.getInterpolation(Po,xr,vr,_r,ec,tc,nc,h.uv);jl||(h.uv=d)}if(r){ec.fromBufferAttribute(r,s),tc.fromBufferAttribute(r,o),nc.fromBufferAttribute(r,a),h.uv1=new Oe;let d=vn.getInterpolation(Po,xr,vr,_r,ec,tc,nc,h.uv1);jl||(h.uv1=d),$y&&(h.uv2=h.uv1)}if(t){mp.fromBufferAttribute(t,s),gp.fromBufferAttribute(t,o),xp.fromBufferAttribute(t,a),h.normal=new k;let d=vn.getInterpolation(Po,xr,vr,_r,mp,gp,xp,h.normal);h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1),jl||(h.normal=d)}let c={a:s,b:o,c:a,normal:new k,materialIndex:0};if(vn.getNormal(xr,vr,_r,c.normal),h.face=c,h.faceIndex=s,jl){let d=new k;vn.getBarycoord(Po,xr,vr,_r,d),h.barycoord=d}}return h}function _p(i){return i&&i.isMaterial?i.side:i}function xs(i,e,t,n,r,s,o){let a=n*3,l=a+0,u=a+1,f=a+2,{index:h,groups:c}=i;i.index&&(l=h.getX(l),u=h.getX(u),f=h.getX(f));let{position:d,normal:x,uv:b,uv1:p}=i.attributes;if(Array.isArray(e)){let g=n*3;for(let S=0,w=c.length;S<w;S++){let{start:y,count:T,materialIndex:E}=c[S];if(g>=y&&g<y+T){let C=_p(e[E]),_=vp(t,d,x,b,p,l,u,f,C,s,o);if(_)if(_.faceIndex=n,_.face.materialIndex=E,r)r.push(_);else return _}}}else{let g=_p(e),S=vp(t,d,x,b,p,l,u,f,g,s,o);if(S)if(S.faceIndex=n,S.face.materialIndex=0,r)r.push(S);else return S}return null}function Ut(i,e,t,n){let r=i.a,s=i.b,o=i.c,a=e,l=e+1,u=e+2;t&&(a=t.getX(a),l=t.getX(l),u=t.getX(u)),r.x=n.getX(a),r.y=n.getY(a),r.z=n.getZ(a),s.x=n.getX(l),s.y=n.getY(l),s.z=n.getZ(l),o.x=n.getX(u),o.y=n.getY(u),o.z=n.getZ(u)}function yp(i,e,t,n,r,s,o,a){let{geometry:l,_indirectBuffer:u}=i;for(let f=n,h=n+r;f<h;f++)xs(l,e,t,f,s,o,a)}function Sp(i,e,t,n,r,s,o){let{geometry:a,_indirectBuffer:l}=i,u=1/0,f=null;for(let h=n,c=n+r;h<c;h++){let d;d=xs(a,e,t,h,null,s,o),d&&d.distance<u&&(f=d,u=d.distance)}return f}function bp(i,e,t,n,r,s,o){let{geometry:a}=t,{index:l}=a,u=a.attributes.position;for(let f=i,h=e+i;f<h;f++){let c;if(c=f,Ut(o,c*3,l,u),o.needsUpdate=!0,n(o,c,r,s))return!0}return!1}function Mp(i,e=null){e&&Array.isArray(e)&&(e=new Set(e));let t=i.geometry,n=t.index?t.index.array:null,r=t.attributes.position,s,o,a,l,u=0,f=i._roots;for(let c=0,d=f.length;c<d;c++)s=f[c],o=new Uint32Array(s),a=new Uint16Array(s),l=new Float32Array(s),h(0,u),u+=s.byteLength;function h(c,d,x=!1){let b=c*2;if(pt(b,a)){let p=St(c,o),g=Rt(b,a),S=1/0,w=1/0,y=1/0,T=-1/0,E=-1/0,C=-1/0;for(let _=3*p,R=3*(p+g);_<R;_++){let I=n[_],F=r.getX(I),L=r.getY(I),O=r.getZ(I);F<S&&(S=F),F>T&&(T=F),L<w&&(w=L),L>E&&(E=L),O<y&&(y=O),O>C&&(C=O)}return l[c+0]!==S||l[c+1]!==w||l[c+2]!==y||l[c+3]!==T||l[c+4]!==E||l[c+5]!==C?(l[c+0]=S,l[c+1]=w,l[c+2]=y,l[c+3]=T,l[c+4]=E,l[c+5]=C,!0):!1}else{let p=Mt(c),g=Tt(c,o),S=x,w=!1,y=!1;if(e){if(!S){let I=p/8+d/32,F=g/8+d/32;w=e.has(I),y=e.has(F),S=!w&&!y}}else w=!0,y=!0;let T=S||w,E=S||y,C=!1;T&&(C=h(p,d,S));let _=!1;E&&(_=h(g,d,S));let R=C||_;if(R)for(let I=0;I<3;I++){let F=p+I,L=g+I,O=l[F],N=l[F+3],V=l[L],W=l[L+3];l[c+I]=O<V?O:V,l[c+I+3]=N>W?N:W}return R}}}function Xn(i,e,t,n,r){let s,o,a,l,u,f,h=1/t.direction.x,c=1/t.direction.y,d=1/t.direction.z,x=t.origin.x,b=t.origin.y,p=t.origin.z,g=e[i],S=e[i+3],w=e[i+1],y=e[i+3+1],T=e[i+2],E=e[i+3+2];return h>=0?(s=(g-x)*h,o=(S-x)*h):(s=(S-x)*h,o=(g-x)*h),c>=0?(a=(w-b)*c,l=(y-b)*c):(a=(y-b)*c,l=(w-b)*c),s>l||a>o||((a>s||isNaN(s))&&(s=a),(l<o||isNaN(o))&&(o=l),d>=0?(u=(T-p)*d,f=(E-p)*d):(u=(E-p)*d,f=(T-p)*d),s>f||u>o)?!1:((u>s||s!==s)&&(s=u),(f<o||o!==o)&&(o=f),s<=r&&o>=n)}function Tp(i,e,t,n,r,s,o,a){let{geometry:l,_indirectBuffer:u}=i;for(let f=n,h=n+r;f<h;f++){let c=u?u[f]:f;xs(l,e,t,c,s,o,a)}}function wp(i,e,t,n,r,s,o){let{geometry:a,_indirectBuffer:l}=i,u=1/0,f=null;for(let h=n,c=n+r;h<c;h++){let d;d=xs(a,e,t,l?l[h]:h,null,s,o),d&&d.distance<u&&(f=d,u=d.distance)}return f}function Ap(i,e,t,n,r,s,o){let{geometry:a}=t,{index:l}=a,u=a.attributes.position;for(let f=i,h=e+i;f<h;f++){let c;if(c=t.resolveTriangleIndex(f),Ut(o,c*3,l,u),o.needsUpdate=!0,n(o,c,r,s))return!0}return!1}function Ep(i,e,t,n,r,s,o){_t.setBuffer(i._roots[e]),Dh(0,i,t,n,r,s,o),_t.clearBuffer()}function Dh(i,e,t,n,r,s,o){let{float32Array:a,uint16Array:l,uint32Array:u}=_t,f=i*2;if(pt(f,l)){let c=St(i,u),d=Rt(f,l);yp(e,t,n,c,d,r,s,o)}else{let c=Mt(i);Xn(c,a,n,s,o)&&Dh(c,e,t,n,r,s,o);let d=Tt(i,u);Xn(d,a,n,s,o)&&Dh(d,e,t,n,r,s,o)}}var Ky=["x","y","z"];function Rp(i,e,t,n,r,s){_t.setBuffer(i._roots[e]);let o=Lh(0,i,t,n,r,s);return _t.clearBuffer(),o}function Lh(i,e,t,n,r,s){let{float32Array:o,uint16Array:a,uint32Array:l}=_t,u=i*2;if(pt(u,a)){let h=St(i,l),c=Rt(u,a);return Sp(e,t,n,h,c,r,s)}else{let h=Yi(i,l),c=Ky[h],x=n.direction[c]>=0,b,p;x?(b=Mt(i),p=Tt(i,l)):(b=Tt(i,l),p=Mt(i));let S=Xn(b,o,n,r,s)?Lh(b,e,t,n,r,s):null;if(S){let T=S.point[c];if(x?T<=o[p+h]:T>=o[p+h+3])return S}let y=Xn(p,o,n,r,s)?Lh(p,e,t,n,r,s):null;return S&&y?S.distance<=y.distance?S:y:S||y||null}}var ic=new Vt,vs=new pn,_s=new pn,Do=new $e,Cp=new Wt,rc=new Wt;function Ip(i,e,t,n){_t.setBuffer(i._roots[e]);let r=Fh(0,i,t,n);return _t.clearBuffer(),r}function Fh(i,e,t,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:a}=_t,l=i*2;if(r===null&&(t.boundingBox||t.computeBoundingBox(),Cp.set(t.boundingBox.min,t.boundingBox.max,n),r=Cp),pt(l,o)){let f=e.geometry,h=f.index,c=f.attributes.position,d=t.index,x=t.attributes.position,b=St(i,a),p=Rt(l,o);if(Do.copy(n).invert(),t.boundsTree)return Nt(i,s,rc),rc.matrix.copy(Do),rc.needsUpdate=!0,t.boundsTree.shapecast({intersectsBounds:S=>rc.intersectsBox(S),intersectsTriangle:S=>{S.a.applyMatrix4(n),S.b.applyMatrix4(n),S.c.applyMatrix4(n),S.needsUpdate=!0;for(let w=b*3,y=(p+b)*3;w<y;w+=3)if(Ut(_s,w,h,c),_s.needsUpdate=!0,S.intersectsTriangle(_s))return!0;return!1}});{let g=Qi(t);for(let S=b*3,w=(p+b)*3;S<w;S+=3){Ut(vs,S,h,c),vs.a.applyMatrix4(Do),vs.b.applyMatrix4(Do),vs.c.applyMatrix4(Do),vs.needsUpdate=!0;for(let y=0,T=g*3;y<T;y+=3)if(Ut(_s,y,d,x),_s.needsUpdate=!0,vs.intersectsTriangle(_s))return!0}}}else{let f=Mt(i),h=Tt(i,a);return Nt(f,s,ic),!!(r.intersectsBox(ic)&&Fh(f,e,t,n,r)||(Nt(h,s,ic),r.intersectsBox(ic)&&Fh(h,e,t,n,r)))}}var sc=new $e,Nh=new Wt,Lo=new Wt,Qy=new k,jy=new k,eS=new k,tS=new k;function Pp(i,e,t,n={},r={},s=0,o=1/0){e.boundingBox||e.computeBoundingBox(),Nh.set(e.boundingBox.min,e.boundingBox.max,t),Nh.needsUpdate=!0;let a=i.geometry,l=a.attributes.position,u=a.index,f=e.attributes.position,h=e.index,c=En.getPrimitive(),d=En.getPrimitive(),x=Qy,b=jy,p=null,g=null;r&&(p=eS,g=tS);let S=1/0,w=null,y=null;return sc.copy(t).invert(),Lo.matrix.copy(sc),i.shapecast({boundsTraverseOrder:T=>Nh.distanceToBox(T),intersectsBounds:(T,E,C)=>C<S&&C<o?(E&&(Lo.min.copy(T.min),Lo.max.copy(T.max),Lo.needsUpdate=!0),!0):!1,intersectsRange:(T,E)=>{if(e.boundsTree)return e.boundsTree.shapecast({boundsTraverseOrder:_=>Lo.distanceToBox(_),intersectsBounds:(_,R,I)=>I<S&&I<o,intersectsRange:(_,R)=>{for(let I=_,F=_+R;I<F;I++){Ut(d,3*I,h,f),d.a.applyMatrix4(t),d.b.applyMatrix4(t),d.c.applyMatrix4(t),d.needsUpdate=!0;for(let L=T,O=T+E;L<O;L++){Ut(c,3*L,u,l),c.needsUpdate=!0;let N=c.distanceToTriangle(d,x,p);if(N<S&&(b.copy(x),g&&g.copy(p),S=N,w=L,y=I),N<s)return!0}}}});{let C=Qi(e);for(let _=0,R=C;_<R;_++){Ut(d,3*_,h,f),d.a.applyMatrix4(t),d.b.applyMatrix4(t),d.c.applyMatrix4(t),d.needsUpdate=!0;for(let I=T,F=T+E;I<F;I++){Ut(c,3*I,u,l),c.needsUpdate=!0;let L=c.distanceToTriangle(d,x,p);if(L<S&&(b.copy(x),g&&g.copy(p),S=L,w=I,y=_),L<s)return!0}}}}}),En.releasePrimitive(c),En.releasePrimitive(d),S===1/0?null:(n.point?n.point.copy(b):n.point=b.clone(),n.distance=S,n.faceIndex=w,r&&(r.point?r.point.copy(g):r.point=g.clone(),r.point.applyMatrix4(sc),b.applyMatrix4(sc),r.distance=b.sub(r.point).length(),r.faceIndex=y),n)}function Dp(i,e=null){e&&Array.isArray(e)&&(e=new Set(e));let t=i.geometry,n=t.index?t.index.array:null,r=t.attributes.position,s,o,a,l,u=0,f=i._roots;for(let c=0,d=f.length;c<d;c++)s=f[c],o=new Uint32Array(s),a=new Uint16Array(s),l=new Float32Array(s),h(0,u),u+=s.byteLength;function h(c,d,x=!1){let b=c*2;if(pt(b,a)){let p=St(c,o),g=Rt(b,a),S=1/0,w=1/0,y=1/0,T=-1/0,E=-1/0,C=-1/0;for(let _=p,R=p+g;_<R;_++){let I=3*i.resolveTriangleIndex(_);for(let F=0;F<3;F++){let L=I+F;L=n?n[L]:L;let O=r.getX(L),N=r.getY(L),V=r.getZ(L);O<S&&(S=O),O>T&&(T=O),N<w&&(w=N),N>E&&(E=N),V<y&&(y=V),V>C&&(C=V)}}return l[c+0]!==S||l[c+1]!==w||l[c+2]!==y||l[c+3]!==T||l[c+4]!==E||l[c+5]!==C?(l[c+0]=S,l[c+1]=w,l[c+2]=y,l[c+3]=T,l[c+4]=E,l[c+5]=C,!0):!1}else{let p=Mt(c),g=Tt(c,o),S=x,w=!1,y=!1;if(e){if(!S){let I=p/8+d/32,F=g/8+d/32;w=e.has(I),y=e.has(F),S=!w&&!y}}else w=!0,y=!0;let T=S||w,E=S||y,C=!1;T&&(C=h(p,d,S));let _=!1;E&&(_=h(g,d,S));let R=C||_;if(R)for(let I=0;I<3;I++){let F=p+I,L=g+I,O=l[F],N=l[F+3],V=l[L],W=l[L+3];l[c+I]=O<V?O:V,l[c+I+3]=N>W?N:W}return R}}}function Lp(i,e,t,n,r,s,o){_t.setBuffer(i._roots[e]),Uh(0,i,t,n,r,s,o),_t.clearBuffer()}function Uh(i,e,t,n,r,s,o){let{float32Array:a,uint16Array:l,uint32Array:u}=_t,f=i*2;if(pt(f,l)){let c=St(i,u),d=Rt(f,l);Tp(e,t,n,c,d,r,s,o)}else{let c=Mt(i);Xn(c,a,n,s,o)&&Uh(c,e,t,n,r,s,o);let d=Tt(i,u);Xn(d,a,n,s,o)&&Uh(d,e,t,n,r,s,o)}}var nS=["x","y","z"];function Fp(i,e,t,n,r,s){_t.setBuffer(i._roots[e]);let o=Bh(0,i,t,n,r,s);return _t.clearBuffer(),o}function Bh(i,e,t,n,r,s){let{float32Array:o,uint16Array:a,uint32Array:l}=_t,u=i*2;if(pt(u,a)){let h=St(i,l),c=Rt(u,a);return wp(e,t,n,h,c,r,s)}else{let h=Yi(i,l),c=nS[h],x=n.direction[c]>=0,b,p;x?(b=Mt(i),p=Tt(i,l)):(b=Tt(i,l),p=Mt(i));let S=Xn(b,o,n,r,s)?Bh(b,e,t,n,r,s):null;if(S){let T=S.point[c];if(x?T<=o[p+h]:T>=o[p+h+3])return S}let y=Xn(p,o,n,r,s)?Bh(p,e,t,n,r,s):null;return S&&y?S.distance<=y.distance?S:y:S||y||null}}var oc=new Vt,ys=new pn,Ss=new pn,Fo=new $e,Np=new Wt,ac=new Wt;function Up(i,e,t,n){_t.setBuffer(i._roots[e]);let r=Oh(0,i,t,n);return _t.clearBuffer(),r}function Oh(i,e,t,n,r=null){let{float32Array:s,uint16Array:o,uint32Array:a}=_t,l=i*2;if(r===null&&(t.boundingBox||t.computeBoundingBox(),Np.set(t.boundingBox.min,t.boundingBox.max,n),r=Np),pt(l,o)){let f=e.geometry,h=f.index,c=f.attributes.position,d=t.index,x=t.attributes.position,b=St(i,a),p=Rt(l,o);if(Fo.copy(n).invert(),t.boundsTree)return Nt(i,s,ac),ac.matrix.copy(Fo),ac.needsUpdate=!0,t.boundsTree.shapecast({intersectsBounds:S=>ac.intersectsBox(S),intersectsTriangle:S=>{S.a.applyMatrix4(n),S.b.applyMatrix4(n),S.c.applyMatrix4(n),S.needsUpdate=!0;for(let w=b,y=p+b;w<y;w++)if(Ut(Ss,3*e.resolveTriangleIndex(w),h,c),Ss.needsUpdate=!0,S.intersectsTriangle(Ss))return!0;return!1}});{let g=Qi(t);for(let S=b,w=p+b;S<w;S++){let y=e.resolveTriangleIndex(S);Ut(ys,3*y,h,c),ys.a.applyMatrix4(Fo),ys.b.applyMatrix4(Fo),ys.c.applyMatrix4(Fo),ys.needsUpdate=!0;for(let T=0,E=g*3;T<E;T+=3)if(Ut(Ss,T,d,x),Ss.needsUpdate=!0,ys.intersectsTriangle(Ss))return!0}}}else{let f=Mt(i),h=Tt(i,a);return Nt(f,s,oc),!!(r.intersectsBox(oc)&&Oh(f,e,t,n,r)||(Nt(h,s,oc),r.intersectsBox(oc)&&Oh(h,e,t,n,r)))}}var lc=new $e,zh=new Wt,No=new Wt,iS=new k,rS=new k,sS=new k,oS=new k;function Bp(i,e,t,n={},r={},s=0,o=1/0){e.boundingBox||e.computeBoundingBox(),zh.set(e.boundingBox.min,e.boundingBox.max,t),zh.needsUpdate=!0;let a=i.geometry,l=a.attributes.position,u=a.index,f=e.attributes.position,h=e.index,c=En.getPrimitive(),d=En.getPrimitive(),x=iS,b=rS,p=null,g=null;r&&(p=sS,g=oS);let S=1/0,w=null,y=null;return lc.copy(t).invert(),No.matrix.copy(lc),i.shapecast({boundsTraverseOrder:T=>zh.distanceToBox(T),intersectsBounds:(T,E,C)=>C<S&&C<o?(E&&(No.min.copy(T.min),No.max.copy(T.max),No.needsUpdate=!0),!0):!1,intersectsRange:(T,E)=>{if(e.boundsTree){let C=e.boundsTree;return C.shapecast({boundsTraverseOrder:_=>No.distanceToBox(_),intersectsBounds:(_,R,I)=>I<S&&I<o,intersectsRange:(_,R)=>{for(let I=_,F=_+R;I<F;I++){let L=C.resolveTriangleIndex(I);Ut(d,3*L,h,f),d.a.applyMatrix4(t),d.b.applyMatrix4(t),d.c.applyMatrix4(t),d.needsUpdate=!0;for(let O=T,N=T+E;O<N;O++){let V=i.resolveTriangleIndex(O);Ut(c,3*V,u,l),c.needsUpdate=!0;let W=c.distanceToTriangle(d,x,p);if(W<S&&(b.copy(x),g&&g.copy(p),S=W,w=O,y=I),W<s)return!0}}}})}else{let C=Qi(e);for(let _=0,R=C;_<R;_++){Ut(d,3*_,h,f),d.a.applyMatrix4(t),d.b.applyMatrix4(t),d.c.applyMatrix4(t),d.needsUpdate=!0;for(let I=T,F=T+E;I<F;I++){let L=i.resolveTriangleIndex(I);Ut(c,3*L,u,l),c.needsUpdate=!0;let O=c.distanceToTriangle(d,x,p);if(O<S&&(b.copy(x),g&&g.copy(p),S=O,w=I,y=_),O<s)return!0}}}}}),En.releasePrimitive(c),En.releasePrimitive(d),S===1/0?null:(n.point?n.point.copy(b):n.point=b.clone(),n.distance=S,n.faceIndex=w,r&&(r.point?r.point.copy(g):r.point=g.clone(),r.point.applyMatrix4(lc),b.applyMatrix4(lc),r.distance=b.sub(r.point).length(),r.faceIndex=y),n)}function kh(i,e,t){return i===null?null:(i.point.applyMatrix4(e.matrixWorld),i.distance=i.point.distanceTo(t.ray.origin),i.object=e,i)}var cc=new Wt,uc=new Jr,Op=new k,zp=new $e,kp=new k,Vh=["getX","getY","getZ"],hc=class i extends Ql{static serialize(e,t={}){t={cloneBuffers:!0,...t};let n=e.geometry,r=e._roots,s=e._indirectBuffer,o=n.getIndex(),a={version:1,roots:null,index:null,indirectBuffer:null};return t.cloneBuffers?(a.roots=r.map(l=>l.slice()),a.index=o?o.array.slice():null,a.indirectBuffer=s?s.slice():null):(a.roots=r,a.index=o?o.array:null,a.indirectBuffer=s),a}static deserialize(e,t,n={}){n={setIndex:!0,indirect:!!e.indirectBuffer,...n};let{index:r,roots:s,indirectBuffer:o}=e;e.version||(console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),l(s));let a=new i(t,{...n,[To]:!0});if(a._roots=s,a._indirectBuffer=o||null,n.setIndex){let u=t.getIndex();if(u===null){let f=new xt(e.index,1,!1);t.setIndex(f)}else u.array!==r&&(u.array.set(r),u.needsUpdate=!0)}return a;function l(u){for(let f=0;f<u.length;f++){let h=u[f],c=new Uint32Array(h),d=new Uint16Array(h);for(let x=0,b=h.byteLength/32;x<b;x++){let p=8*x,g=2*p;pt(g,d)||(c[p+6]=c[p+6]/8-x)}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(e,t={}){t.maxLeafTris&&(console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafTris}),super(e,t)}shiftTriangleOffsets(e){return super.shiftPrimitiveOffsets(e)}writePrimitiveBounds(e,t,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,a=r.index?r.index.array:null,u=(s?s[e]:e)*3,f=u+0,h=u+1,c=u+2;a&&(f=a[f],h=a[h],c=a[c]);for(let d=0;d<3;d++){let x=o[Vh[d]](f),b=o[Vh[d]](h),p=o[Vh[d]](c),g=x;b<g&&(g=b),p<g&&(g=p);let S=x;b>S&&(S=b),p>S&&(S=p),t[n+d]=g,t[n+d+3]=S}return t}computePrimitiveBounds(e,t,n){let r=this.geometry,s=this._indirectBuffer,o=r.attributes.position,a=r.index?r.index.array:null,l=o.normalized;if(e<0||t+e-n.offset>n.length/6)throw new Error("MeshBVH: compute triangle bounds range is invalid.");let u=o.array,f=o.offset||0,h=3;o.isInterleavedBufferAttribute&&(h=o.data.stride);let c=["getX","getY","getZ"],d=n.offset;for(let x=e,b=e+t;x<b;x++){let g=(s?s[x]:x)*3,S=(x-d)*6,w=g+0,y=g+1,T=g+2;a&&(w=a[w],y=a[y],T=a[T]),l||(w=w*h+f,y=y*h+f,T=T*h+f);for(let E=0;E<3;E++){let C,_,R;l?(C=o[c[E]](w),_=o[c[E]](y),R=o[c[E]](T)):(C=u[w+E],_=u[y+E],R=u[T+E]);let I=C;_<I&&(I=_),R<I&&(I=R);let F=C;_>F&&(F=_),R>F&&(F=R);let L=(F-I)/2,O=E*2;n[S+O+0]=I+L,n[S+O+1]=L+(Math.abs(I)+L)*cs}}return n}raycastObject3D(e,t,n=[]){let{material:r}=e;if(r===void 0)return;zp.copy(e.matrixWorld).invert(),uc.copy(t.ray).applyMatrix4(zp),kp.setFromMatrixScale(e.matrixWorld),Op.copy(uc.direction).multiply(kp);let s=Op.length(),o=t.near/s,a=t.far/s;if(t.firstHitOnly===!0){let l=this.raycastFirst(uc,r,o,a);l=kh(l,e,t),l&&n.push(l)}else{let l=this.raycast(uc,r,o,a);for(let u=0,f=l.length;u<f;u++){let h=kh(l[u],e,t);h&&n.push(h)}}return n}refit(e=null){return(this.indirect?Dp:Mp)(this,e)}raycast(e,t=Tn,n=0,r=1/0){let s=this._roots,o=[],a=this.indirect?Lp:Ep;for(let l=0,u=s.length;l<u;l++)a(this,l,t,e,o,n,r);return o}raycastFirst(e,t=Tn,n=0,r=1/0){let s=this._roots,o=null,a=this.indirect?Fp:Rp;for(let l=0,u=s.length;l<u;l++){let f=a(this,l,t,e,n,r);f!=null&&(o==null||f.distance<o.distance)&&(o=f)}return o}intersectsGeometry(e,t){let n=!1,r=this._roots,s=this.indirect?Up:Ip;for(let o=0,a=r.length;o<a&&(n=s(this,o,e,t),!n);o++);return n}shapecast(e){let t=En.getPrimitive(),n=super.shapecast({...e,intersectsPrimitive:e.intersectsTriangle,scratchPrimitive:t,iterate:this.indirect?Ap:bp});return En.releasePrimitive(t),n}bvhcast(e,t,n){let{intersectsRanges:r,intersectsTriangles:s}=n,o=En.getPrimitive(),a=this.geometry.index,l=this.geometry.attributes.position,u=this.indirect?x=>{let b=this.resolveTriangleIndex(x);Ut(o,b*3,a,l)}:x=>{Ut(o,x*3,a,l)},f=En.getPrimitive(),h=e.geometry.index,c=e.geometry.attributes.position,d=e.indirect?x=>{let b=e.resolveTriangleIndex(x);Ut(f,b*3,h,c)}:x=>{Ut(f,x*3,h,c)};if(s){if(!(e instanceof i))throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let x=(b,p,g,S,w,y,T,E)=>{for(let C=g,_=g+S;C<_;C++){d(C),f.a.applyMatrix4(t),f.b.applyMatrix4(t),f.c.applyMatrix4(t),f.needsUpdate=!0;for(let R=b,I=b+p;R<I;R++)if(u(R),o.needsUpdate=!0,s(o,f,R,C,w,y,T,E))return!0}return!1};if(r){let b=r;r=function(p,g,S,w,y,T,E,C){return b(p,g,S,w,y,T,E,C)?!0:x(p,g,S,w,y,T,E,C)}}else r=x}return super.bvhcast(e,t,{intersectsRanges:r})}intersectsBox(e,t){return cc.set(e.min,e.max,t),cc.needsUpdate=!0,this.shapecast({intersectsBounds:n=>cc.intersectsBox(n),intersectsTriangle:n=>cc.intersectsTriangle(n)})}intersectsSphere(e){return this.shapecast({intersectsBounds:t=>e.intersectsBox(t),intersectsTriangle:t=>t.intersectsSphere(e)})}closestPointToGeometry(e,t,n={},r={},s=0,o=1/0){return(this.indirect?Bp:Pp)(this,e,t,n,r,s,o)}closestPointToPoint(e,t={},n=0,r=1/0){return pp(this,e,t,n,r)}};function aS(i){switch(i){case 1:return"R";case 2:return"RG";case 3:return"RGBA";case 4:return"RGBA"}throw new Error}function lS(i){switch(i){case 1:return An;case 2:return cn;case 3:return Xe;case 4:return Xe}}function Vp(i){switch(i){case 1:return is;case 2:return Xi;case 3:return qi;case 4:return qi}}var fc=class extends It{constructor(){super(),this.minFilter=je,this.magFilter=je,this.generateMipmaps=!1,this.overrideItemSize=null,this._forcedType=null}updateFrom(e){let t=this.overrideItemSize,n=e.itemSize,r=e.count;if(t!==null){if(n*r%t!==0)throw new Error("VertexAttributeTexture: overrideItemSize must divide evenly into buffer length.");e.itemSize=t,e.count=r*n/t}let s=e.itemSize,o=e.count,a=e.normalized,l=e.array.constructor,u=l.BYTES_PER_ELEMENT,f=this._forcedType,h=s;if(f===null)switch(l){case Float32Array:f=nt;break;case Uint8Array:case Uint16Array:case Uint32Array:f=ln;break;case Int8Array:case Int16Array:case Int32Array:f=Gi;break}let c,d,x,b,p=aS(s);switch(f){case nt:x=1,d=lS(s),a&&u===1?(b=l,p+="8",l===Uint8Array?c=an:(c=ts,p+="_SNORM")):(b=Float32Array,p+="32F",c=nt);break;case Gi:p+=u*8+"I",x=a?Math.pow(2,l.BYTES_PER_ELEMENT*8-1):1,d=Vp(s),u===1?(b=Int8Array,c=ts):u===2?(b=Int16Array,c=fo):(b=Int32Array,c=Gi);break;case ln:p+=u*8+"UI",x=a?Math.pow(2,l.BYTES_PER_ELEMENT*8-1):1,d=Vp(s),u===1?(b=Uint8Array,c=an):u===2?(b=Uint16Array,c=Hi):(b=Uint32Array,c=ln);break}h===3&&(d===Xe||d===qi)&&(h=4);let g=Math.ceil(Math.sqrt(o))||1,S=h*g*g,w=new b(S),y=e.normalized;e.normalized=!1;for(let T=0;T<o;T++){let E=h*T;w[E]=e.getX(T)/x,s>=2&&(w[E+1]=e.getY(T)/x),s>=3&&(w[E+2]=e.getZ(T)/x,h===4&&(w[E+3]=1)),s>=4&&(w[E+3]=e.getW(T)/x)}e.normalized=y,this.internalFormat=p,this.format=d,this.type=c,this.image.width=g,this.image.height=g,this.image.data=w,this.needsUpdate=!0,this.dispose(),e.itemSize=n,e.count=r}},bs=class extends fc{constructor(){super(),this._forcedType=ln}};var Ms=class extends fc{constructor(){super(),this._forcedType=nt}};var dc=class{constructor(){this.index=new bs,this.position=new Ms,this.bvhBounds=new It,this.bvhContents=new It,this._cachedIndexAttr=null,this.index.overrideItemSize=3}updateFrom(e){let{geometry:t}=e;if(uS(e,this.bvhBounds,this.bvhContents),this.position.updateFrom(t.attributes.position),e.indirect){let n=e._indirectBuffer;if(this._cachedIndexAttr===null||this._cachedIndexAttr.count!==n.length)if(t.index)this._cachedIndexAttr=t.index.clone();else{let r=Rh(Ro(t));this._cachedIndexAttr=new xt(r,1,!1)}cS(t,n,this._cachedIndexAttr),this.index.updateFrom(this._cachedIndexAttr)}else this.index.updateFrom(t.index)}dispose(){let{index:e,position:t,bvhBounds:n,bvhContents:r}=this;e&&e.dispose(),t&&t.dispose(),n&&n.dispose(),r&&r.dispose()}};function cS(i,e,t){let n=t.array,r=i.index?i.index.array:null;for(let s=0,o=e.length;s<o;s++){let a=3*s,l=3*e[s];for(let u=0;u<3;u++)n[a+u]=r?r[l+u]:l+u}}function uS(i,e,t){let n=i._roots;if(n.length!==1)throw new Error("MeshBVHUniformStruct: Multi-root BVHs not supported.");let r=n[0],s=new Uint16Array(r),o=new Uint32Array(r),a=new Float32Array(r),l=r.byteLength/32,u=2*Math.ceil(Math.sqrt(l/2)),f=new Float32Array(4*u*u),h=Math.ceil(Math.sqrt(l)),c=new Uint32Array(2*h*h);for(let d=0;d<l;d++){let x=d*32/4,b=x*2,p=x;for(let g=0;g<3;g++)f[8*d+0+g]=a[p+0+g],f[8*d+4+g]=a[p+3+g];if(pt(b,s)){let g=Rt(b,s),S=St(x,o),w=-65536|g;c[d*2+0]=w,c[d*2+1]=S}else{let g=o[x+6],S=Yi(x,o);c[d*2+0]=S,c[d*2+1]=g}}e.image.data=f,e.image.width=u,e.image.height=u,e.format=Xe,e.type=nt,e.internalFormat="RGBA32F",e.minFilter=je,e.magFilter=je,e.generateMipmaps=!1,e.needsUpdate=!0,e.dispose(),t.image.data=c,t.image.width=h,t.image.height=h,t.format=Xi,t.type=ln,t.internalFormat="RG32UI",t.minFilter=je,t.magFilter=je,t.generateMipmaps=!1,t.needsUpdate=!0,t.dispose()}var yr={};mf(yr,{bvh_distance_functions:()=>Hp,bvh_ray_functions:()=>Gh,bvh_struct_definitions:()=>Gp,common_functions:()=>Hh});var Hh=`

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
`;var Hp=`

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
`;var Gh=`

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
`;var Gp=`
struct BVH {

	usampler2D index;
	sampler2D position;

	sampler2D bvhBounds;
	usampler2D bvhContents;

};
`;var QE=`
	${Hh}
	${Gh}
`;function pc(i,e,t=0){if(i.isInterleavedBufferAttribute){let n=i.itemSize;for(let r=0,s=i.count;r<s;r++){let o=r+t;e.setX(o,i.getX(r)),n>=2&&e.setY(o,i.getY(r)),n>=3&&e.setZ(o,i.getZ(r)),n>=4&&e.setW(o,i.getW(r))}}else{let n=e.array,r=n.constructor,s=n.BYTES_PER_ELEMENT*i.itemSize*t;new r(n.buffer,s,i.array.length).set(i.array)}}function Sr(i,e=null){let t=i.array.constructor,n=i.normalized,r=i.itemSize,s=e===null?i.count:e;return new xt(new t(r*s),r,n)}function ji(i,e){if(!i&&!e)return!0;if(!!i!=!!e)return!1;let t=i.count===e.count,n=i.normalized===e.normalized,r=i.array.constructor===e.array.constructor,s=i.itemSize===e.itemSize;return!(!t||!n||!r||!s)}function hS(i){let e=i[0].index!==null,t=new Set(Object.keys(i[0].attributes));if(!i[0].getAttribute("position"))throw new Error("StaticGeometryGenerator: position attribute is required.");for(let n=0;n<i.length;++n){let r=i[n],s=0;if(e!==(r.index!==null))throw new Error("StaticGeometryGenerator: All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");for(let o in r.attributes){if(!t.has(o))throw new Error('StaticGeometryGenerator: All geometries must have compatible attributes; make sure "'+o+'" attribute exists among all geometries, or in none of them.');s++}if(s!==t.size)throw new Error("StaticGeometryGenerator: All geometries must have the same number of attributes.")}}function fS(i){let e=0;for(let t=0,n=i.length;t<n;t++)e+=i[t].getIndex().count;return e}function dS(i){let e=0;for(let t=0,n=i.length;t<n;t++)e+=i[t].getAttribute("position").count;return e}function pS(i,e,t){i.index&&i.index.count!==e&&i.setIndex(null);let n=i.attributes;for(let r in n)n[r].count!==t&&i.deleteAttribute(r)}function Wp(i,e={},t=new Ft){let{useGroups:n=!1,forceUpdate:r=!1,skipAssigningAttributes:s=[],overwriteIndex:o=!0}=e;hS(i);let a=i[0].index!==null,l=a?fS(i):-1,u=dS(i);if(pS(t,l,u),n){let h=0;for(let c=0,d=i.length;c<d;c++){let x=i[c],b;a?b=x.getIndex().count:b=x.getAttribute("position").count,t.addGroup(h,b,c),h+=b}}if(a){let h=!1;if(t.index||(t.setIndex(new xt(new Uint32Array(l),1,!1)),h=!0),h||o){let c=0,d=0,x=t.getIndex();for(let b=0,p=i.length;b<p;b++){let g=i[b],S=g.getIndex();if(!(!r&&!h&&s[b]))for(let y=0;y<S.count;++y)x.setX(c+y,S.getX(y)+d);c+=S.count,d+=g.getAttribute("position").count}}}let f=Object.keys(i[0].attributes);for(let h=0,c=f.length;h<c;h++){let d=!1,x=f[h];if(!t.getAttribute(x)){let g=i[0].getAttribute(x);t.setAttribute(x,Sr(g,u)),d=!0}let b=0,p=t.getAttribute(x);for(let g=0,S=i.length;g<S;g++){let w=i[g],y=!r&&!d&&s[g],T=w.getAttribute(x);if(!y)if(x==="color"&&p.itemSize!==T.itemSize)for(let E=b,C=T.count;E<C;E++)T.setXYZW(E,p.getX(E),p.getY(E),p.getZ(E),1);else pc(T,p,b);b+=T.count}}}function Xp(i,e,t){let n=i.index,s=i.attributes.position.count,o=n?n.count:s,a=i.groups;a.length===0&&(a=[{count:o,start:0,materialIndex:0}]);let l=i.getAttribute("materialIndex");if(!l||l.count!==s){let f;t.length<=255?f=new Uint8Array(s):f=new Uint16Array(s),l=new xt(f,1,!1),i.deleteAttribute("materialIndex"),i.setAttribute("materialIndex",l)}let u=l.array;for(let f=0;f<a.length;f++){let h=a[f],c=h.start,d=h.count,x=Math.min(d,o-c),b=Array.isArray(e)?e[h.materialIndex]:e,p=t.indexOf(b);for(let g=0;g<x;g++){let S=c+g;n&&(S=n.getX(S)),u[S]=p}}}function qp(i,e){if(!i.index){let t=i.attributes.position.count,n=new Array(t);for(let r=0;r<t;r++)n[r]=r;i.setIndex(n)}if(!i.attributes.normal&&e&&e.includes("normal")&&i.computeVertexNormals(),!i.attributes.uv&&e&&e.includes("uv")){let t=i.attributes.position.count;i.setAttribute("uv",new xt(new Float32Array(t*2),2,!1))}if(!i.attributes.uv2&&e&&e.includes("uv2")){let t=i.attributes.position.count;i.setAttribute("uv2",new xt(new Float32Array(t*2),2,!1))}if(!i.attributes.tangent&&e&&e.includes("tangent"))if(i.attributes.uv&&i.attributes.normal)i.computeTangents();else{let t=i.attributes.position.count;i.setAttribute("tangent",new xt(new Float32Array(t*4),4,!1))}if(!i.attributes.color&&e&&e.includes("color")){let t=i.attributes.position.count,n=new Float32Array(t*4);n.fill(1),i.setAttribute("color",new xt(n,4))}}function Ts(i){let e=0;if(i.byteLength!==0){let t=new Uint8Array(i);for(let n=0;n<i.byteLength;n++){let r=t[n];e=(e<<5)-e+r,e|=0}}return e}function Yp(i){let e=i.uuid,t=Object.values(i.attributes);i.index&&(t.push(i.index),e+=`index|${i.index.version}`);let n=Object.keys(t).sort();for(let r of n){let s=t[r];e+=`${r}_${s.version}|`}return e}function Zp(i){let e=i.skeleton;return e?(e.boneTexture||e.computeBoneTexture(),`${Ts(e.boneTexture.image.data.buffer)}_${e.boneTexture.uuid}`):null}var mc=class{constructor(e=null){this.matrixWorld=new $e,this.geometryHash=null,this.skeletonHash=null,this.primitiveCount=-1,e!==null&&this.updateFrom(e)}updateFrom(e){let t=e.geometry,n=(t.index?t.index.count:t.attributes.position.count)/3;this.matrixWorld.copy(e.matrixWorld),this.geometryHash=Yp(t),this.primitiveCount=n,this.skeletonHash=Zp(e)}didChange(e){let t=e.geometry,n=(t.index?t.index.count:t.attributes.position.count)/3;return!(this.matrixWorld.equals(e.matrixWorld)&&this.geometryHash===Yp(t)&&this.skeletonHash===Zp(e)&&this.primitiveCount===n)}};var br=new k,Mr=new k,Tr=new k,$p=new bt,gc=new k,Wh=new k,Jp=new bt,Kp=new bt,xc=new $e,Qp=new $e;function jp(i,e,t){let n=i.skeleton,r=i.geometry,s=n.bones,o=n.boneInverses;Jp.fromBufferAttribute(r.attributes.skinIndex,e),Kp.fromBufferAttribute(r.attributes.skinWeight,e),xc.elements.fill(0);for(let a=0;a<4;a++){let l=Kp.getComponent(a);if(l!==0){let u=Jp.getComponent(a);Qp.multiplyMatrices(s[u].matrixWorld,o[u]),mS(xc,Qp,l)}}return xc.multiply(i.bindMatrix).premultiply(i.bindMatrixInverse),t.transformDirection(xc),t}function Xh(i,e,t,n,r){gc.set(0,0,0);for(let s=0,o=i.length;s<o;s++){let a=e[s],l=i[s];a!==0&&(Wh.fromBufferAttribute(l,n),t?gc.addScaledVector(Wh,a):gc.addScaledVector(Wh.sub(r),a))}r.add(gc)}function mS(i,e,t){let n=i.elements,r=e.elements;for(let s=0,o=r.length;s<o;s++)n[s]+=r[s]*t}function gS(i){let{index:e,attributes:t}=i;if(e)for(let n=0,r=e.count;n<r;n+=3){let s=e.getX(n),o=e.getX(n+2);e.setX(n,o),e.setX(n+2,s)}else for(let n in t){let r=t[n],s=r.itemSize;for(let o=0,a=r.count;o<a;o+=3)for(let l=0;l<s;l++){let u=r.getComponent(o,l),f=r.getComponent(o+2,l);r.setComponent(o,l,f),r.setComponent(o+2,l,u)}}return i}function em(i,e={},t=new Ft){e={applyWorldTransforms:!0,attributes:[],...e};let n=i.geometry,r=e.applyWorldTransforms,s=e.attributes.includes("normal"),o=e.attributes.includes("tangent"),a=n.attributes,l=t.attributes;for(let S in t.attributes)(!e.attributes.includes(S)||!(S in n.attributes))&&t.deleteAttribute(S);!t.index&&n.index&&(t.index=n.index.clone()),l.position||t.setAttribute("position",Sr(a.position)),s&&!l.normal&&a.normal&&t.setAttribute("normal",Sr(a.normal)),o&&!l.tangent&&a.tangent&&t.setAttribute("tangent",Sr(a.tangent)),ji(n.index,t.index),ji(a.position,l.position),s&&ji(a.normal,l.normal),o&&ji(a.tangent,l.tangent);let u=a.position,f=s?a.normal:null,h=o?a.tangent:null,c=n.morphAttributes.position,d=n.morphAttributes.normal,x=n.morphAttributes.tangent,b=n.morphTargetsRelative,p=i.morphTargetInfluences,g=new tt;g.getNormalMatrix(i.matrixWorld),n.index&&t.index.array.set(n.index.array);for(let S=0,w=a.position.count;S<w;S++)br.fromBufferAttribute(u,S),f&&Mr.fromBufferAttribute(f,S),h&&($p.fromBufferAttribute(h,S),Tr.fromBufferAttribute(h,S)),p&&(c&&Xh(c,p,b,S,br),d&&Xh(d,p,b,S,Mr),x&&Xh(x,p,b,S,Tr)),i.isSkinnedMesh&&(i.applyBoneTransform(S,br),f&&jp(i,S,Mr),h&&jp(i,S,Tr)),r&&br.applyMatrix4(i.matrixWorld),l.position.setXYZ(S,br.x,br.y,br.z),f&&(r&&Mr.applyNormalMatrix(g),l.normal.setXYZ(S,Mr.x,Mr.y,Mr.z)),h&&(r&&Tr.transformDirection(i.matrixWorld),l.tangent.setXYZW(S,Tr.x,Tr.y,Tr.z,$p.w));for(let S in e.attributes){let w=e.attributes[S];w==="position"||w==="tangent"||w==="normal"||!(w in a)||(l[w]||t.setAttribute(w,Sr(a[w])),ji(a[w],l[w]),pc(a[w],l[w]))}return i.matrixWorld.determinant()<0&&gS(t),t}var vc=class extends Ft{constructor(){super(),this.version=0,this.hash=null,this._diff=new mc}isCompatible(e,t){let n=e.geometry;for(let r=0;r<t.length;r++){let s=t[r],o=n.attributes[s],a=this.attributes[s];if(o&&!ji(o,a))return!1}return!0}updateFrom(e,t){let n=this._diff;return n.didChange(e)?(em(e,t,this),n.updateFrom(e),this.version++,this.hash=`${this.uuid}_${this.version}`,!0):!1}};var yc=0,qh=1,Yh=2;function xS(i,e){for(let t=0,n=i.length;t<n;t++)i[t].traverseVisible(s=>{s.isMesh&&e(s)})}function vS(i){let e=[];for(let t=0,n=i.length;t<n;t++){let r=i[t];Array.isArray(r.material)?e.push(...r.material):e.push(r.material)}return e}function _S(i,e,t){if(i.length===0){e.setIndex(null);let n=e.attributes;for(let r in n)e.deleteAttribute(r);for(let r in t.attributes)e.setAttribute(t.attributes[r],new xt(new Float32Array(0),4,!1))}else Wp(i,t,e);for(let n in e.attributes)e.attributes[n].needsUpdate=!0}var _c=class{constructor(e){this.objects=null,this.useGroups=!0,this.applyWorldTransforms=!0,this.generateMissingAttributes=!0,this.overwriteIndex=!0,this.attributes=["position","normal","color","tangent","uv","uv2"],this._intermediateGeometry=new Map,this._geometryMergeSets=new WeakMap,this._mergeOrder=[],this._dummyMesh=null,this.setObjects(e||[])}_getDummyMesh(){if(!this._dummyMesh){let e=new ur,t=new Ft;t.setAttribute("position",new xt(new Float32Array(9),3)),this._dummyMesh=new on(t,e)}return this._dummyMesh}_getMeshes(){let e=[];return xS(this.objects,t=>{e.push(t)}),e.sort((t,n)=>t.uuid>n.uuid?1:t.uuid<n.uuid?-1:0),e.length===0&&e.push(this._getDummyMesh()),e}_updateIntermediateGeometries(){let{_intermediateGeometry:e}=this,t=this._getMeshes(),n=new Set(e.keys()),r={attributes:this.attributes,applyWorldTransforms:this.applyWorldTransforms};for(let s=0,o=t.length;s<o;s++){let a=t[s],l=a.uuid;n.delete(l);let u=e.get(l);(!u||!u.isCompatible(a,this.attributes))&&(u&&u.dispose(),u=new vc,e.set(l,u)),u.updateFrom(a,r)&&this.generateMissingAttributes&&qp(u,this.attributes)}n.forEach(s=>{e.delete(s)})}setObjects(e){Array.isArray(e)?this.objects=[...e]:this.objects=[e]}generate(e=new Ft){let{useGroups:t,overwriteIndex:n,_intermediateGeometry:r,_geometryMergeSets:s}=this,o=this._getMeshes(),a=[],l=[],u=s.get(e)||[];this._updateIntermediateGeometries();let f=!1;o.length!==u.length&&(f=!0);for(let c=0,d=o.length;c<d;c++){let x=o[c],b=r.get(x.uuid);l.push(b);let p=u[c];!p||p.uuid!==b.uuid?(a.push(!1),f=!0):p.version!==b.version?a.push(!1):a.push(!0)}_S(l,e,{useGroups:t,forceUpdate:f,skipAssigningAttributes:a,overwriteIndex:n}),f&&e.dispose(),s.set(e,l.map(c=>({version:c.version,uuid:c.uuid})));let h=yc;return f?h=Yh:a.includes(!1)&&(h=qh),{changeType:h,materials:vS(o),geometry:e}}};function yS(i){let e=new Set;for(let t=0,n=i.length;t<n;t++){let r=i[t];for(let s in r){let o=r[s];o&&o.isTexture&&e.add(o)}}return Array.from(e)}function SS(i){let e=[],t=new Set;for(let r=0,s=i.length;r<s;r++)i[r].traverse(o=>{o.visible&&(o.isRectAreaLight||o.isSpotLight||o.isPointLight||o.isDirectionalLight)&&(e.push(o),o.iesMap&&t.add(o.iesMap))});let n=Array.from(t).sort((r,s)=>r.uuid<s.uuid?1:r.uuid>s.uuid?-1:0);return{lights:e,iesTextures:n}}var Sc=class{get initialized(){return!!this.bvh}constructor(e){this.bvhOptions={},this.attributes=["position","normal","tangent","color","uv","uv2"],this.generateBVH=!0,this.bvh=null,this.geometry=new Ft,this.staticGeometryGenerator=new _c(e),this._bvhWorker=null,this._pendingGenerate=null,this._buildAsync=!1,this._materialUuids=null}setObjects(e){this.staticGeometryGenerator.setObjects(e)}setBVHWorker(e){this._bvhWorker=e}async generateAsync(e=null){if(!this._bvhWorker)throw new Error('PathTracingSceneGenerator: "setBVHWorker" must be called before "generateAsync" can be called.');if(this.bvh instanceof Promise)return this._pendingGenerate||(this._pendingGenerate=new Promise(async()=>(await this.bvh,this._pendingGenerate=null,this.generateAsync(e)))),this._pendingGenerate;{this._buildAsync=!0;let t=this.generate(e);return this._buildAsync=!1,t.bvh=this.bvh=await t.bvh,t}}generate(e=null){let{staticGeometryGenerator:t,geometry:n,attributes:r}=this,s=t.objects;t.attributes=r,s.forEach(c=>{c.traverse(d=>{d.isSkinnedMesh&&d.skeleton&&d.skeleton.update()})});let o=t.generate(n),a=o.materials,l=o.changeType!==yc||this._materialUuids===null||this._materialUuids.length!==length;if(!l){for(let c=0,d=a.length;c<d;c++)if(a[c].uuid!==this._materialUuids[c]){l=!0;break}}let u=yS(a),{lights:f,iesTextures:h}=SS(s);if(l&&(Xp(n,a,a),this._materialUuids=a.map(c=>c.uuid)),this.generateBVH){if(this.bvh instanceof Promise)throw new Error("PathTracingSceneGenerator: BVH is already building asynchronously.");if(o.changeType===Yh){let c={strategy:2,maxLeafTris:1,indirect:!0,onProgress:e,...this.bvhOptions};this._buildAsync?this.bvh=this._bvhWorker.generate(n,c):this.bvh=new hc(n,c)}else o.changeType===qh&&this.bvh.refit()}return{bvhChanged:o.changeType!==yc,bvh:this.bvh,needsMaterialIndexUpdate:l,lights:f,iesTextures:h,geometry:n,materials:a,textures:u,objects:s}}};var bS=new bi(-1,1,1,-1,0,1),Zh=class extends Ft{constructor(){super(),this.setAttribute("position",new Yt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Yt([0,2,0,0,2,0],2))}},MS=new Zh,On=class{constructor(e){this._mesh=new on(MS,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,bS)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var er=class extends Ht{set needsUpdate(e){super.needsUpdate=!0,this.dispatchEvent({type:"recompilation"})}constructor(e){super(e);for(let t in this.uniforms)Object.defineProperty(this,t,{get(){return this.uniforms[t].value},set(n){this.uniforms[t].value=n}})}setDefine(e,t=void 0){if(t==null){if(e in this.defines)return delete this.defines[e],this.needsUpdate=!0,!0}else if(this.defines[e]!==t)return this.defines[e]=t,this.needsUpdate=!0,!0;return!1}};var bc=class extends er{constructor(e){super({blending:Kt,uniforms:{target1:{value:null},target2:{value:null},opacity:{value:1}},vertexShader:`

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

				}`}),this.setValues(e)}};function Mc(i=1){let e="uint";return i>1&&(e="uvec"+i),`
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
	`}function Tc(i=1){let e="uint",t="float",n="",r=".r",s="1u";return i>1&&(e="uvec"+i,t="vec"+i,n=i+"",i===2?(r=".rg",s="uvec2( 1u, 2u )"):i===3?(r=".rgb",s="uvec3( 1u, 2u, 3u )"):(r="",s="uvec4( 1u, 2u, 3u, 4u )")),`

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
	`}var wc=`

	// Utils
	const float SOBOL_FACTOR = 1.0 / 16777216.0;
	const uint SOBOL_MAX_POINTS = 256u * 256u;

	${Mc(1)}
	${Mc(2)}
	${Mc(3)}
	${Mc(4)}

	uint sobolHash( uint x ) {

		// finalizer from murmurhash3
		x ^= x >> 16;
		x *= 0x85ebca6bu;
		x ^= x >> 13;
		x *= 0xc2b2ae35u;
		x ^= x >> 16;
		return x;

	}

`,tm=`

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

`,nm=`

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

	${Tc(1)}
	${Tc(2)}
	${Tc(3)}
	${Tc(4)}

`;var $h=class extends er{constructor(){super({blending:Kt,uniforms:{resolution:{value:new Oe}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`

				${wc}
				${tm}

				varying vec2 vUv;
				uniform vec2 resolution;
				void main() {

					uint index = uint( gl_FragCoord.y ) * uint( resolution.x ) + uint( gl_FragCoord.x );
					gl_FragColor = generateSobolPoint( index );

				}
			`})}},Ac=class{generate(e,t=256){let n=new kt(t,t,{type:nt,format:Xe,minFilter:je,magFilter:je,generateMipmaps:!1}),r=e.getRenderTarget();e.setRenderTarget(n);let s=new On(new $h);return s.material.resolution.set(t,t),s.render(e),e.setRenderTarget(r),s.dispose(),n}};var ws=class extends rn{set bokehSize(e){this.fStop=this.getFocalLength()/e}get bokehSize(){return this.getFocalLength()/this.fStop}constructor(...e){super(...e),this.fStop=1.4,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=25,this.anamorphicRatio=1}copy(e,t){return super.copy(e,t),this.fStop=e.fStop,this.apertureBlades=e.apertureBlades,this.apertureRotation=e.apertureRotation,this.focusDistance=e.focusDistance,this.anamorphicRatio=e.anamorphicRatio,this}};var Ec=class{constructor(){this.bokehSize=0,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=10,this.anamorphicRatio=1}updateFrom(e){e instanceof ws?(this.bokehSize=e.bokehSize,this.apertureBlades=e.apertureBlades,this.apertureRotation=e.apertureRotation,this.focusDistance=e.focusDistance,this.anamorphicRatio=e.anamorphicRatio):(this.bokehSize=0,this.apertureRotation=0,this.apertureBlades=0,this.focusDistance=10,this.anamorphicRatio=1)}};function Rc(i){let e=new Uint16Array(i.length);for(let t=0,n=i.length;t<n;++t)e[t]=vt.toHalfFloat(i[t]);return e}function im(i,e,t=0,n=i.length){let r=t,s=t+n-1;for(;r<s;){let o=r+s>>1;i[o]<e?r=o+1:s=o}return r-t}function TS(i,e,t){return .2126*i+.7152*e+.0722*t}function wS(i,e=ut){let t=i.clone();t.source=new Hs({...t.image});let{width:n,height:r,data:s}=t.image,o=s;if(t.type!==e){e===ut?o=new Uint16Array(s.length):o=new Float32Array(s.length);let a;s instanceof Int8Array||s instanceof Int16Array||s instanceof Int32Array?a=2**(8*s.BYTES_PER_ELEMENT-1)-1:a=2**(8*s.BYTES_PER_ELEMENT)-1;for(let l=0,u=s.length;l<u;l++){let f=s[l];t.type===ut&&(f=vt.fromHalfFloat(s[l])),t.type!==nt&&t.type!==ut&&(f/=a),e===ut&&(o[l]=vt.toHalfFloat(f))}t.image.data=o,t.type=e}if(t.flipY){let a=o;o=o.slice();for(let l=0;l<r;l++)for(let u=0;u<n;u++){let f=r-l-1,h=4*(l*n+u),c=4*(f*n+u);o[c+0]=a[h+0],o[c+1]=a[h+1],o[c+2]=a[h+2],o[c+3]=a[h+3]}t.flipY=!1,t.image.data=o}return t}var Cc=class{constructor(){let e=new It(Rc(new Float32Array([0,0,0,0])),1,1);e.type=ut,e.format=Xe,e.minFilter=st,e.magFilter=st,e.wrapS=sn,e.wrapT=sn,e.generateMipmaps=!1,e.needsUpdate=!0;let t=new It(Rc(new Float32Array([0,1])),1,2);t.type=ut,t.format=An,t.minFilter=st,t.magFilter=st,t.generateMipmaps=!1,t.needsUpdate=!0;let n=new It(Rc(new Float32Array([0,0,1,1])),2,2);n.type=ut,n.format=An,n.minFilter=st,n.magFilter=st,n.generateMipmaps=!1,n.needsUpdate=!0,this.map=e,this.marginalWeights=t,this.conditionalWeights=n,this.totalSum=0}getPixelWeight(e,t,n){return TS(e,t,n)}dispose(){this.marginalWeights.dispose(),this.conditionalWeights.dispose(),this.map.dispose()}updateFrom(e){let t=wS(e);t.wrapS=sn,t.wrapT=Lt;let{width:n,height:r,data:s}=t.image,o=new Float32Array(n*r),a=new Float32Array(n*r),l=new Float32Array(r),u=new Float32Array(r),f=0,h=0;for(let p=0;p<r;p++){let g=0;for(let S=0;S<n;S++){let w=p*n+S,y=vt.fromHalfFloat(s[4*w+0]),T=vt.fromHalfFloat(s[4*w+1]),E=vt.fromHalfFloat(s[4*w+2]),C=this.getPixelWeight(y,T,E,p,r);g+=C,f+=C,o[w]=C,a[w]=g}if(g!==0)for(let S=p*n,w=p*n+n;S<w;S++)o[S]/=g,a[S]/=g;h+=g,l[p]=g,u[p]=h}if(h!==0)for(let p=0,g=l.length;p<g;p++)l[p]/=h,u[p]/=h;let c=new Uint16Array(r),d=new Uint16Array(n*r);for(let p=0;p<r;p++){let g=(p+1)/r,S=im(u,g);c[p]=vt.toHalfFloat((S+.5)/r)}for(let p=0;p<r;p++)for(let g=0;g<n;g++){let S=p*n+g,w=(g+1)/n,y=im(a,w,p*n,n);d[S]=vt.toHalfFloat((y+.5)/n)}this.dispose();let{marginalWeights:x,conditionalWeights:b}=this;x.image={width:r,height:1,data:c},x.needsUpdate=!0,b.image={width:n,height:r,data:d},b.needsUpdate=!0,this.totalSum=f,this.map=t}};var Jh=6,AS=11,ES=0,RS=1,CS=2,IS=3,PS=4,Kn=new k,Pn=new k,rm=new $e,As=new Hn,sm=new k,ai=new k,DS=new k(0,1,0),Ic=class{constructor(){let e=new It(new Float32Array(4),1,1);e.format=Xe,e.type=nt,e.wrapS=Lt,e.wrapT=Lt,e.generateMipmaps=!1,e.minFilter=je,e.magFilter=je,this.tex=e,this.count=0}updateFrom(e,t=[]){let n=this.tex,r=Math.max(e.length*Jh,1),s=Math.ceil(Math.sqrt(r));n.image.width!==s&&(n.dispose(),n.image.data=new Float32Array(s*s*4),n.image.width=s,n.image.height=s);let o=n.image.data;for(let l=0,u=e.length;l<u;l++){let f=e[l],h=l*Jh*4,c=0;for(let x=0;x<Jh*4;x++)o[h+x]=0;f.getWorldPosition(Pn),o[h+c++]=Pn.x,o[h+c++]=Pn.y,o[h+c++]=Pn.z;let d=ES;if(f.isRectAreaLight&&f.isCircular?d=RS:f.isSpotLight?d=CS:f.isDirectionalLight||f.isSunLight?d=IS:f.isPointLight&&(d=PS),o[h+c++]=d,o[h+c++]=f.color.r,o[h+c++]=f.color.g,o[h+c++]=f.color.b,o[h+c++]=f.intensity,f.getWorldQuaternion(As),f.isRectAreaLight)Kn.set(f.width,0,0).applyQuaternion(As),o[h+c++]=Kn.x,o[h+c++]=Kn.y,o[h+c++]=Kn.z,c++,Pn.set(0,f.height,0).applyQuaternion(As),o[h+c++]=Pn.x,o[h+c++]=Pn.y,o[h+c++]=Pn.z,o[h+c++]=Kn.cross(Pn).length()*(f.isCircular?Math.PI/4:1);else if(f.isSpotLight){let x=f.radius||0;sm.setFromMatrixPosition(f.matrixWorld),ai.setFromMatrixPosition(f.target.matrixWorld),rm.lookAt(sm,ai,DS),As.setFromRotationMatrix(rm),Kn.set(1,0,0).applyQuaternion(As),o[h+c++]=Kn.x,o[h+c++]=Kn.y,o[h+c++]=Kn.z,c++,Pn.set(0,1,0).applyQuaternion(As),o[h+c++]=Pn.x,o[h+c++]=Pn.y,o[h+c++]=Pn.z,o[h+c++]=Math.PI*x*x,o[h+c++]=x,o[h+c++]=f.decay,o[h+c++]=f.distance,o[h+c++]=Math.cos(f.angle),o[h+c++]=Math.cos(f.angle*(1-f.penumbra)),o[h+c++]=f.iesMap?t.indexOf(f.iesMap):-1}else if(f.isPointLight){let x=Kn.setFromMatrixPosition(f.matrixWorld);o[h+c++]=x.x,o[h+c++]=x.y,o[h+c++]=x.z,c++,c+=4,c+=1,o[h+c++]=f.decay,o[h+c++]=f.distance}else if(f.isDirectionalLight){let x=Kn.setFromMatrixPosition(f.matrixWorld),b=Pn.setFromMatrixPosition(f.target.matrixWorld);ai.subVectors(x,b).normalize(),o[h+c++]=ai.x,o[h+c++]=ai.y,o[h+c++]=ai.z}else f.isSunLight&&(ai.setFromMatrixPosition(f.matrixWorld).normalize(),o[h+c++]=ai.x,o[h+c++]=ai.y,o[h+c++]=ai.z);o[h+AS]=f.visibleToCameraRays?1:0}this.count=e.length;let a=Ts(o.buffer);return this.hash!==a?(this.hash=a,n.needsUpdate=!0,!0):!1}};function om(i,e,t,n,r){if(e>n)throw new Error;let s=i.length/e,o=i.constructor.BYTES_PER_ELEMENT*8,a=1;switch(i.constructor){case Uint8Array:case Uint16Array:case Uint32Array:a=2**o-1;break;case Int8Array:case Int16Array:case Int32Array:a=2**(o-1)-1;break}for(let l=0;l<s;l++){let u=4*l,f=e*l;for(let h=0;h<n;h++)t[r+u+h]=e>=h+1?i[f+h]/a:0}}var Pc=class extends Ni{constructor(){super(),this._textures=[],this.type=nt,this.format=Xe,this.internalFormat="RGBA32F"}updateAttribute(e,t){let n=this._textures[e];n.updateFrom(t);let r=n.image,s=this.image;if(r.width!==s.width||r.height!==s.height)throw new Error("FloatAttributeTextureArray: Attribute must be the same dimensions when updating single layer.");let{width:o,height:a,data:l}=s,f=o*a*4*e,h=t.itemSize;h===3&&(h=4),om(n.image.data,h,l,4,f),this.dispose(),this.needsUpdate=!0}setAttributes(e){let t=e[0].count,n=e.length;for(let h=0,c=n;h<c;h++)if(e[h].count!==t)throw new Error("FloatAttributeTextureArray: All attributes must have the same item count.");let r=this._textures;for(;r.length<n;){let h=new Ms;r.push(h)}for(;r.length>n;)r.pop();for(let h=0,c=n;h<c;h++)r[h].updateFrom(e[h]);let o=r[0].image,a=this.image;(o.width!==a.width||o.height!==a.height||o.depth!==n)&&(a.width=o.width,a.height=o.height,a.depth=n,a.data=new Float32Array(a.width*a.height*a.depth*4));let{data:l,width:u,height:f}=a;for(let h=0,c=n;h<c;h++){let d=r[h],b=u*f*4*h,p=e[h].itemSize;p===3&&(p=4),om(d.image.data,p,l,4,b)}this.dispose(),this.needsUpdate=!0}};var Dc=class extends Pc{updateNormalAttribute(e){this.updateAttribute(0,e)}updateTangentAttribute(e){this.updateAttribute(1,e)}updateUvAttribute(e){this.updateAttribute(2,e)}updateColorAttribute(e){this.updateAttribute(3,e)}updateFrom(e,t,n,r){this.setAttributes([e,t,n,r])}};function Kh(i,e){return i.uuid<e.uuid?1:i.uuid>e.uuid?-1:0}function Lc(i){return`${i.source.uuid}:${i.colorSpace}`}function LS(i){let e=new Set,t=[];for(let n=0,r=i.length;n<r;n++){let s=i[n],o=Lc(s);e.has(o)||(e.add(o),t.push(s))}return t}function am(i){let e=i.map(n=>n.iesMap||null).filter(n=>n),t=new Set(e);return Array.from(t).sort(Kh)}function lm(i){let e=new Set;for(let n=0,r=i.length;n<r;n++){let s=i[n];for(let o in s){let a=s[o];a&&a.isTexture&&e.add(a)}}let t=Array.from(e);return LS(t).sort(Kh)}function cm(i){let e=[];return i.traverseVisible(t=>{(t.isRectAreaLight||t.isSpotLight||t.isPointLight||t.isDirectionalLight||t.isSunLight)&&e.push(t)}),e.sort(Kh)}var Nc=47,um=Nc*4,Qh=class{constructor(){this._features={}}isUsed(e){return e in this._features}setUsed(e,t=!0){t===!1?delete this._features[e]:this._features[e]=!0}reset(){this._features={}}},Fc=class extends It{constructor(){super(new Float32Array(4),1,1),this.format=Xe,this.type=nt,this.wrapS=Lt,this.wrapT=Lt,this.minFilter=je,this.magFilter=je,this.generateMipmaps=!1,this.features=new Qh}updateFrom(e,t){function n(x,b,p=-1){if(b in x&&x[b]){let g=Lc(x[b]);return h[g]}else return p}function r(x,b,p){return b in x?x[b]:p}function s(x,b,p,g){let S=x[b]&&x[b].isTexture?x[b]:null;if(S){S.matrixAutoUpdate&&S.updateMatrix();let w=S.matrix.elements,y=0;p[g+y++]=w[0],p[g+y++]=w[3],p[g+y++]=w[6],y++,p[g+y++]=w[1],p[g+y++]=w[4],p[g+y++]=w[7],y++}return 8}let o=0,a=e.length*Nc,l=Math.ceil(Math.sqrt(a))||1,{image:u,features:f}=this,h={};for(let x=0,b=t.length;x<b;x++)h[Lc(t[x])]=x;u.width!==l&&(this.dispose(),u.data=new Float32Array(l*l*4),u.width=l,u.height=l);let c=u.data;f.reset();for(let x=0,b=e.length;x<b;x++){let p=e[x];if(p.isFogVolumeMaterial){f.setUsed("FOG");for(let w=0;w<um;w++)c[o+w]=0;c[o+0+0]=p.color.r,c[o+0+1]=p.color.g,c[o+0+2]=p.color.b,c[o+8+3]=r(p,"emissiveIntensity",0),c[o+12+0]=p.emissive.r,c[o+12+1]=p.emissive.g,c[o+12+2]=p.emissive.b,c[o+52+1]=p.density,c[o+52+3]=0,c[o+56+2]=4,o+=um;continue}c[o++]=p.color.r,c[o++]=p.color.g,c[o++]=p.color.b,c[o++]=n(p,"map"),c[o++]=r(p,"metalness",0),c[o++]=n(p,"metalnessMap"),c[o++]=r(p,"roughness",0),c[o++]=n(p,"roughnessMap"),c[o++]=r(p,"ior",1.5),c[o++]=r(p,"transmission",0),c[o++]=n(p,"transmissionMap"),c[o++]=r(p,"emissiveIntensity",0),"emissive"in p?(c[o++]=p.emissive.r,c[o++]=p.emissive.g,c[o++]=p.emissive.b):(c[o++]=0,c[o++]=0,c[o++]=0),c[o++]=n(p,"emissiveMap"),c[o++]=n(p,"normalMap"),"normalScale"in p?(c[o++]=p.normalScale.x,c[o++]=p.normalScale.y):(c[o++]=1,c[o++]=1),c[o++]=r(p,"clearcoat",0),c[o++]=n(p,"clearcoatMap"),c[o++]=r(p,"clearcoatRoughness",0),c[o++]=n(p,"clearcoatRoughnessMap"),c[o++]=n(p,"clearcoatNormalMap"),"clearcoatNormalScale"in p?(c[o++]=p.clearcoatNormalScale.x,c[o++]=p.clearcoatNormalScale.y):(c[o++]=1,c[o++]=1),o++,c[o++]=r(p,"sheen",0),"sheenColor"in p?(c[o++]=p.sheenColor.r,c[o++]=p.sheenColor.g,c[o++]=p.sheenColor.b):(c[o++]=0,c[o++]=0,c[o++]=0),c[o++]=n(p,"sheenColorMap"),c[o++]=r(p,"sheenRoughness",0),c[o++]=n(p,"sheenRoughnessMap"),c[o++]=n(p,"iridescenceMap"),c[o++]=n(p,"iridescenceThicknessMap"),c[o++]=r(p,"iridescence",0),c[o++]=r(p,"iridescenceIOR",1.3);let g=r(p,"iridescenceThicknessRange",[100,400]);c[o++]=g[0],c[o++]=g[1],"specularColor"in p?(c[o++]=p.specularColor.r,c[o++]=p.specularColor.g,c[o++]=p.specularColor.b):(c[o++]=1,c[o++]=1,c[o++]=1),c[o++]=n(p,"specularColorMap"),c[o++]=r(p,"specularIntensity",1),c[o++]=n(p,"specularIntensityMap");let S=r(p,"thickness",0)===0&&r(p,"attenuationDistance",1/0)===1/0;if(c[o++]=Number(S),o++,"attenuationColor"in p?(c[o++]=p.attenuationColor.r,c[o++]=p.attenuationColor.g,c[o++]=p.attenuationColor.b):(c[o++]=1,c[o++]=1,c[o++]=1),c[o++]=r(p,"attenuationDistance",1/0),c[o++]=n(p,"alphaMap"),c[o++]=p.opacity,c[o++]=p.alphaTest,!S&&p.transmission>0)c[o++]=0;else switch(p.side){case Tn:c[o++]=1;break;case Jt:c[o++]=-1;break;case _n:c[o++]=0;break}c[o++]=Number(r(p,"matte",!1)),c[o++]=Number(r(p,"castShadow",!0)),c[o++]=Number(p.vertexColors)|Number(p.flatShading)<<1,c[o++]=Number(p.transparent),o+=s(p,"map",c,o),o+=s(p,"metalnessMap",c,o),o+=s(p,"roughnessMap",c,o),o+=s(p,"transmissionMap",c,o),o+=s(p,"emissiveMap",c,o),o+=s(p,"normalMap",c,o),o+=s(p,"clearcoatMap",c,o),o+=s(p,"clearcoatNormalMap",c,o),o+=s(p,"clearcoatRoughnessMap",c,o),o+=s(p,"sheenColorMap",c,o),o+=s(p,"sheenRoughnessMap",c,o),o+=s(p,"iridescenceMap",c,o),o+=s(p,"iridescenceThicknessMap",c,o),o+=s(p,"specularColorMap",c,o),o+=s(p,"specularIntensityMap",c,o),o+=s(p,"alphaMap",c,o)}let d=Ts(c.buffer);return this.hash!==d?(this.hash=d,this.needsUpdate=!0,!0):!1}};var hm=new Ke;function FS(i){return i?`${i.uuid}:${i.version}`:null}function NS(i,e){for(let t in e)t in i&&(i[t]=e[t])}var Uo=class extends Gs{constructor(e,t,n){let r={format:Xe,type:an,minFilter:st,magFilter:st,wrapS:sn,wrapT:sn,generateMipmaps:!1,...n};super(e,t,1,r),NS(this.texture,r),this.texture.setTextures=(...o)=>{this.setTextures(...o)},this.hashes=[null];let s=new On(new jh);this.fsQuad=s}setTextures(e,t,n=this.width,r=this.height){let s=e.getRenderTarget(),o=e.toneMapping,a=e.getClearAlpha();e.getClearColor(hm);let l=t.length||1;(n!==this.width||r!==this.height||this.depth!==l)&&(this.setSize(n,r,l),this.hashes=new Array(l).fill(null)),e.setClearColor(0,0),e.toneMapping=wn;let u=this.fsQuad,f=this.hashes,h=!1;for(let c=0,d=l;c<d;c++){let x=t[c],b=FS(x);x&&(f[c]!==b||x.isWebGLRenderTarget)&&(x.matrixAutoUpdate=!1,x.matrix.identity(),u.material.map=x,e.setRenderTarget(this,c),u.render(e),x.updateMatrix(),x.matrixAutoUpdate=!0,f[c]=b,h=!0)}return u.material.map=null,e.setClearColor(hm,a),e.setRenderTarget(s),e.toneMapping=o,h}dispose(){super.dispose(),this.fsQuad.dispose()}},jh=class extends Ht{get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}constructor(){super({uniforms:{map:{value:null}},vertexShader:`
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
			`})}};function US(i,e=Math.random()){for(let t=i.length-1;t>0;t--){let n=Math.floor(e()*(t+1)),r=i[t];i[t]=i[n],i[n]=r}return i}var Uc=class{constructor(e,t,n=Math.random){let r=e**t,s=new Uint16Array(r),o=r;for(let a=0;a<r;a++)s[a]=a;this.samples=new Float32Array(t),this.strataCount=e,this.reset=function(){for(let a=0;a<r;a++)s[a]=a;o=0},this.reshuffle=function(){o=0},this.next=function(){let{samples:a}=this;o>=s.length&&(US(s,n),this.reshuffle());let l=s[o++];for(let u=0;u<t;u++)a[u]=(l%e+n())/e,l=Math.floor(l/e);return a}}};var Bc=class{constructor(e,t,n=Math.random){let r=0;for(let l of t)r+=l;let s=new Float32Array(r),o=[],a=0;for(let l of t){let u=new Uc(e,l,n);u.samples=new Float32Array(s.buffer,a,u.samples.length),a+=u.samples.length*4,o.push(u)}this.samples=s,this.strataCount=e,this.next=function(){for(let l of o)l.next();return s},this.reshuffle=function(){for(let l of o)l.reshuffle()},this.reset=function(){for(let l of o)l.reset()}}};var ef=class{constructor(e=0){this.m=2147483648,this.a=1103515245,this.c=12345,this.seed=e}nextInt(){return this.seed=(this.a*this.seed+this.c)%this.m,this.seed}nextFloat(){return this.nextInt()/(this.m-1)}},Oc=class extends It{constructor(e=1,t=1,n=8){super(new Float32Array(1),1,1,Xe,nt),this.minFilter=je,this.magFilter=je,this.strata=n,this.sampler=null,this.generator=new ef,this.stableNoise=!1,this.random=()=>this.stableNoise?this.generator.nextFloat():Math.random(),this.init(e,t,n)}init(e=this.image.height,t=this.image.width,n=this.strata){let{image:r}=this;if(r.width===t&&r.height===e&&this.sampler!==null)return;let s=new Array(e*t).fill(4),o=new Bc(n,s,this.random);r.width=t,r.height=e,r.data=o.samples,this.sampler=o,this.dispose(),this.next()}next(){this.sampler.next(),this.needsUpdate=!0}reset(){this.sampler.reset(),this.generator.seed=0}};function fm(i,e=Math.random){for(let t=i.length-1;t>0;t--){let n=~~((e()-1e-6)*t),r=i[t];i[t]=i[n],i[n]=r}}function dm(i,e){i.fill(0);for(let t=0;t<e;t++)i[t]=1}var Bo=class{constructor(e){this.count=0,this.size=-1,this.sigma=-1,this.radius=-1,this.lookupTable=null,this.score=null,this.binaryPattern=null,this.resize(e),this.setSigma(1.5)}findVoid(){let{score:e,binaryPattern:t}=this,n=1/0,r=-1;for(let s=0,o=t.length;s<o;s++){if(t[s]!==0)continue;let a=e[s];a<n&&(n=a,r=s)}return r}findCluster(){let{score:e,binaryPattern:t}=this,n=-1/0,r=-1;for(let s=0,o=t.length;s<o;s++){if(t[s]!==1)continue;let a=e[s];a>n&&(n=a,r=s)}return r}setSigma(e){if(e===this.sigma)return;let t=~~(Math.sqrt(20*e**2)+1),n=2*t+1,r=new Float32Array(n*n),s=e*e;for(let o=-t;o<=t;o++)for(let a=-t;a<=t;a++){let l=(t+a)*n+o+t,u=o*o+a*a;r[l]=Math.E**(-u/(2*s))}this.lookupTable=r,this.sigma=e,this.radius=t}resize(e){this.size!==e&&(this.size=e,this.score=new Float32Array(e*e),this.binaryPattern=new Uint8Array(e*e))}invert(){let{binaryPattern:e,score:t,size:n}=this;t.fill(0);for(let r=0,s=e.length;r<s;r++)if(e[r]===0){let o=~~(r/n),a=r-o*n;this.updateScore(a,o,1),e[r]=1}else e[r]=0}updateScore(e,t,n){let{size:r,score:s,lookupTable:o}=this,a=this.radius,l=2*a+1;for(let u=-a;u<=a;u++)for(let f=-a;f<=a;f++){let h=(a+f)*l+u+a,c=o[h],d=e+u;d=d<0?r+d:d%r;let x=t+f;x=x<0?r+x:x%r;let b=x*r+d;s[b]+=n*c}}addPointIndex(e){this.binaryPattern[e]=1;let t=this.size,n=~~(e/t),r=e-n*t;this.updateScore(r,n,1),this.count++}removePointIndex(e){this.binaryPattern[e]=0;let t=this.size,n=~~(e/t),r=e-n*t;this.updateScore(r,n,-1),this.count--}copy(e){this.resize(e.size),this.score.set(e.score),this.binaryPattern.set(e.binaryPattern),this.setSigma(e.sigma),this.count=e.count}};var zc=class{constructor(){this.random=Math.random,this.sigma=1.5,this.size=64,this.majorityPointsRatio=.1,this.samples=new Bo(1),this.savedSamples=new Bo(1)}generate(){let{samples:e,savedSamples:t,sigma:n,majorityPointsRatio:r,size:s}=this;e.resize(s),e.setSigma(n);let o=Math.floor(s*s*r),a=e.binaryPattern;dm(a,o),fm(a,this.random);for(let h=0,c=a.length;h<c;h++)a[h]===1&&e.addPointIndex(h);for(;;){let h=e.findCluster();e.removePointIndex(h);let c=e.findVoid();if(h===c){e.addPointIndex(h);break}e.addPointIndex(c)}let l=new Uint32Array(s*s);t.copy(e);let u;for(u=e.count-1;u>=0;){let h=e.findCluster();e.removePointIndex(h),l[h]=u,u--}let f=s*s;for(u=t.count;u<f/2;){let h=t.findVoid();t.addPointIndex(h),l[h]=u,u++}for(t.invert();u<f;){let h=t.findCluster();t.removePointIndex(h),l[h]=u,u++}return{data:l,maxValue:f}}};function BS(i){return i>=3?4:i}function OS(i){switch(i){case 1:return An;case 2:return cn;default:return Xe}}var kc=class extends It{constructor(e=64,t=1){super(new Float32Array(4),1,1,Xe,nt),this.minFilter=je,this.magFilter=je,this.size=e,this.channels=t,this.update()}update(){let e=this.channels,t=this.size,n=new zc;n.channels=e,n.size=t;let r=BS(e),s=OS(r);(this.image.width!==t||s!==this.format)&&(this.image.width=t,this.image.height=t,this.image.data=new Float32Array(t**2*r),this.format=s,this.dispose());let o=this.image.data;for(let a=0,l=e;a<l;a++){let u=n.generate(),f=u.data,h=u.maxValue;for(let c=0,d=f.length;c<d;c++){let x=f[c]/h;o[c*r+a]=x}}this.needsUpdate=!0}};var pm=`

	struct PhysicalCamera {

		float focusDistance;
		float anamorphicRatio;
		float bokehSize;
		int apertureBlades;
		float apertureRotation;

	};

`;var mm=`

	struct EquirectHdrInfo {

		sampler2D marginalWeights;
		sampler2D conditionalWeights;
		sampler2D map;

		float totalSum;

	};

`;var gm=`

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

`;var xm=`

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

`;var vm=`

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

`;var _m=`

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
`;var ym=`

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

`;var Sm=`

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


`;var bm=`

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

`;var Mm=`

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

`;var Tm=`

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

`;var wm=`

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

`;var Vc=`

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
`;var tf=`

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
`;var Am=`

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

`;var Em=`

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

`;var Rm=`

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

`;var Cm=`

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

`;var Im=`

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

`;var Pm=`

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

`;var Dm=`

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

`;var Lm=`

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

`;var Fm=`

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

`;var Nm=`

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

`;var Um=`

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
`;var Bm=`

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

`;var Om=`

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

`;var Hc=class extends er{onBeforeRender(){this.setDefine("FEATURE_DOF",this.physicalCamera.bokehSize===0?0:1),this.setDefine("FEATURE_BACKGROUND_MAP",this.backgroundMap?1:0),this.setDefine("FEATURE_FOG",this.materials.features.isUsed("FOG")?1:0)}constructor(e){super({transparent:!0,depthWrite:!1,defines:{FEATURE_MIS:1,FEATURE_RUSSIAN_ROULETTE:1,FEATURE_DOF:1,FEATURE_BACKGROUND_MAP:0,FEATURE_FOG:1,RANDOM_TYPE:2,CAMERA_TYPE:0,DEBUG_MODE:0,ATTR_NORMAL:0,ATTR_TANGENT:1,ATTR_UV:2,ATTR_COLOR:3,MATERIAL_PIXELS:Nc},uniforms:{resolution:{value:new Oe},opacity:{value:1},bounces:{value:10},transmissiveBounces:{value:10},filterGlossyFactor:{value:0},physicalCamera:{value:new Ec},cameraWorldMatrix:{value:new $e},invProjectionMatrix:{value:new $e},bvh:{value:new dc},attributesArray:{value:new Dc},materialIndexAttribute:{value:new bs},materials:{value:new Fc},textures:{value:new Uo().texture},lights:{value:new Ic},iesProfiles:{value:new Uo(360,180,{type:ut,wrapS:Lt,wrapT:Lt}).texture},environmentIntensity:{value:1},environmentRotation:{value:new $e},envMapInfo:{value:new Cc},backgroundBlur:{value:0},backgroundMap:{value:null},backgroundAlpha:{value:1},backgroundIntensity:{value:1},backgroundRotation:{value:new $e},seed:{value:0},sobolTexture:{value:null},stratifiedTexture:{value:new Oc},stratifiedOffsetTexture:{value:new kc(64,1)}},vertexShader:`

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
				${yr.common_functions}
				${yr.bvh_struct_definitions}
				${yr.bvh_ray_functions}

				// uniform structs
				${pm}
				${gm}
				${mm}
				${xm}
				${vm}

				// random
				#if RANDOM_TYPE == 2 	// Stratified List

					${Am}

				#elif RANDOM_TYPE == 1 	// Sobol

					${tf}
					${wc}
					${nm}

					#define rand(v) sobol(v)
					#define rand2(v) sobol2(v)
					#define rand3(v) sobol3(v)
					#define rand4(v) sobol4(v)

				#else 					// PCG

				${tf}

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
				${wm}
				${bm}
				${Vc}
				${Mm}
				${Tm}

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
				${Sm}
				${_m}
				${ym}

				${Dm}
				${Cm}
				${Pm}
				${Im}
				${Rm}
				${Em}

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

				${Bm}
				${Fm}
				${Om}
				${Lm}
				${Nm}
				${Um}

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

			`}),this.setValues(e)}};function*kS(){let{_renderer:i,_fsQuad:e,_blendQuad:t,_primaryTarget:n,_blendTargets:r,_sobolTarget:s,_subframe:o,alpha:a,material:l}=this,u=new bt,f=new bt,h=t.material,[c,d]=r;for(;;){a?(h.opacity=this._opacityFactor/(this.samples+1),l.blending=Kt,l.opacity=1):(l.opacity=this._opacityFactor/(this.samples+1),l.blending=ii);let[x,b,p,g]=o,S=n.width,w=n.height;l.resolution.set(S*p,w*g),l.sobolTexture=s.texture,l.stratifiedTexture.init(20,l.bounces+l.transmissiveBounces+5),l.stratifiedTexture.next(),l.seed++;let y=this.tiles.x||1,T=this.tiles.y||1,E=y*T,C=Math.ceil(S*p),_=Math.ceil(w*g),R=Math.floor(x*S),I=Math.floor(b*w),F=Math.ceil(C/y),L=Math.ceil(_/T);for(let O=0;O<T;O++)for(let N=0;N<y;N++){let V=i.getRenderTarget(),W=i.autoClear,J=i.getScissorTest();i.getScissor(u),i.getViewport(f);let ce=N,K=O;if(!this.stableTiles){let re=this._currentTile%(y*T);ce=re%y,K=~~(re/y),this._currentTile=re+1}let ie=T-K-1;n.scissor.set(R+ce*F,I+ie*L,Math.min(F,C-ce*F),Math.min(L,_-ie*L)),n.viewport.set(R,I,C,_),i.setRenderTarget(n),i.setScissorTest(!0),i.autoClear=!1,e.render(i),i.setViewport(f),i.setScissor(u),i.setScissorTest(J),i.setRenderTarget(V),i.autoClear=W,a&&(h.target1=c.texture,h.target2=n.texture,i.setRenderTarget(d),t.render(i),i.setRenderTarget(V)),this.samples+=1/E,N===y-1&&O===T-1&&(this.samples=Math.round(this.samples)),yield}[c,d]=[d,c]}}var zm=new Ke,Oo=class{get material(){return this._fsQuad.material}set material(e){this._fsQuad.material.removeEventListener("recompilation",this._compileFunction),e.addEventListener("recompilation",this._compileFunction),this._fsQuad.material=e}get target(){return this._alpha?this._blendTargets[1]:this._primaryTarget}set alpha(e){this._alpha!==e&&(e||(this._blendTargets[0].dispose(),this._blendTargets[1].dispose()),this._alpha=e,this.reset())}get alpha(){return this._alpha}get isCompiling(){return!!this._compilePromise}constructor(e){this.camera=null,this.tiles=new Oe(3,3),this.stableNoise=!1,this.stableTiles=!0,this.samples=0,this._subframe=new bt(0,0,1,1),this._opacityFactor=1,this._renderer=e,this._alpha=!1,this._fsQuad=new On(new Hc),this._blendQuad=new On(new bc),this._task=null,this._currentTile=0,this._compilePromise=null,this._sobolTarget=new Ac().generate(e),this._primaryTarget=new kt(1,1,{format:Xe,type:nt,magFilter:je,minFilter:je}),this._blendTargets=[new kt(1,1,{format:Xe,type:nt,magFilter:je,minFilter:je}),new kt(1,1,{format:Xe,type:nt,magFilter:je,minFilter:je})],this._compileFunction=()=>{let t=this.compileMaterial(this._fsQuad._mesh);t.then(()=>{this._compilePromise===t&&(this._compilePromise=null)}),this._compilePromise=t},this.material.addEventListener("recompilation",this._compileFunction)}compileMaterial(){return this._renderer.compileAsync(this._fsQuad._mesh)}setCamera(e){let{material:t}=this;t.cameraWorldMatrix.copy(e.matrixWorld),t.invProjectionMatrix.copy(e.projectionMatrixInverse),t.physicalCamera.updateFrom(e);let n=0;e.projectionMatrix.elements[15]>0&&(n=1),e.isEquirectCamera&&(n=2),t.setDefine("CAMERA_TYPE",n),this.camera=e}setSize(e,t){e=Math.ceil(e),t=Math.ceil(t),!(this._primaryTarget.width===e&&this._primaryTarget.height===t)&&(this._primaryTarget.setSize(e,t),this._blendTargets[0].setSize(e,t),this._blendTargets[1].setSize(e,t),this.reset())}getSize(e){e.x=this._primaryTarget.width,e.y=this._primaryTarget.height}dispose(){this._primaryTarget.dispose(),this._blendTargets[0].dispose(),this._blendTargets[1].dispose(),this._sobolTarget.dispose(),this._fsQuad.dispose(),this._blendQuad.dispose(),this._task=null}reset(){let{_renderer:e,_primaryTarget:t,_blendTargets:n}=this,r=e.getRenderTarget(),s=e.getClearAlpha();e.getClearColor(zm),e.setRenderTarget(t),e.setClearColor(0,0),e.clearColor(),e.setRenderTarget(n[0]),e.setClearColor(0,0),e.clearColor(),e.setRenderTarget(n[1]),e.setClearColor(0,0),e.clearColor(),e.setClearColor(zm,s),e.setRenderTarget(r),this.samples=0,this._task=null,this.material.stratifiedTexture.stableNoise=this.stableNoise,this.stableNoise&&(this.material.seed=0,this.material.stratifiedTexture.reset())}update(){this.material.onBeforeRender(),!this.isCompiling&&(this._task||(this._task=kS.call(this)),this._task.next())}};var wr=new Oe,km=new Oe,Gc=new no,Wc=new Ke,Xc=class extends It{constructor(e=512,t=512){super(new Uint16Array(e*t*4),e,t,Xe,ut,ri,sn,Lt,st,st),this.generationCallback=null}update(){this.dispose(),this.needsUpdate=!0;let{data:e,width:t,height:n}=this.image;for(let r=0;r<t;r++)for(let s=0;s<n;s++){km.set(t,n),wr.set(r/t,s/n),wr.x-=.5,wr.y=1-wr.y,Gc.theta=wr.x*2*Math.PI,Gc.phi=wr.y*Math.PI,Gc.radius=1,this.generationCallback(Gc,wr,km,Wc);let a=4*(s*t+r);e[a+0]=vt.toHalfFloat(Wc.r),e[a+1]=vt.toHalfFloat(Wc.g),e[a+2]=vt.toHalfFloat(Wc.b),e[a+3]=vt.toHalfFloat(1)}}copy(e){return super.copy(e),this.generationCallback=e.generationCallback,this}};var Vm=new k,qc=class extends Xc{constructor(e=512){super(e,e),this.topColor=new Ke().set(16777215),this.bottomColor=new Ke().set(0),this.exponent=2,this.generationCallback=(t,n,r,s)=>{Vm.setFromSpherical(t);let o=Vm.y*.5+.5;s.lerpColors(this.bottomColor,this.topColor,o**this.exponent)}}copy(e){return super.copy(e),this.topColor.copy(e.topColor),this.bottomColor.copy(e.bottomColor),this}};var Yc=class extends Ht{get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}constructor(e){super({uniforms:{map:{value:null},opacity:{value:1}},vertexShader:`
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
			`}),this.setValues(e)}};var nf=class extends Ht{constructor(){super({uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:`
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

				${Vc}

				void main() {

					vec3 rayDirection = equirectUvToDirection( vUv );
					rayDirection.x *= flipEnvMap;
					gl_FragColor = textureCube( envMap, rayDirection );

				}`}),this.depthWrite=!1,this.depthTest=!1}},zo=class{constructor(e){this._renderer=e,this._quad=new On(new nf)}generate(e,t=null,n=null){if(!e.isCubeTexture)throw new Error("CubeToEquirectMaterial: Source can only be cube textures.");let r=e.images[0],s=this._renderer,o=this._quad;t===null&&(t=4*r.height),n===null&&(n=2*r.height);let a=new kt(t,n,{type:nt,colorSpace:r.colorSpace}),l=r.height,u=Math.log2(l)-2,f=1/l,h=1/(3*Math.max(Math.pow(2,u),112));o.material.defines.CUBEUV_MAX_MIP=`${u}.0`,o.material.defines.CUBEUV_TEXEL_WIDTH=h,o.material.defines.CUBEUV_TEXEL_HEIGHT=f,o.material.uniforms.envMap.value=e,o.material.uniforms.flipEnvMap.value=e.isRenderTargetTexture?1:-1,o.material.needsUpdate=!0;let c=s.getRenderTarget(),d=s.autoClear;s.autoClear=!0,s.setRenderTarget(a),o.render(s),s.setRenderTarget(c),s.autoClear=d;let x=new Uint16Array(t*n*4),b=new Float32Array(t*n*4);s.readRenderTargetPixels(a,0,0,t,n,b),a.dispose();for(let g=0,S=b.length;g<S;g++)x[g]=vt.toHalfFloat(b[g]);let p=new It(x,t,n,Xe,ut);return p.minFilter=Hu,p.magFilter=st,p.wrapS=sn,p.wrapT=sn,p.mapping=ri,p.needsUpdate=!0,p}dispose(){this._quad.dispose()}};function VS(i){return i.extensions.get("EXT_float_blend")}var Es=new Oe,Zc=class{get multipleImportanceSampling(){return!!this._pathTracer.material.defines.FEATURE_MIS}set multipleImportanceSampling(e){this._pathTracer.material.setDefine("FEATURE_MIS",e?1:0)}get transmissiveBounces(){return this._pathTracer.material.transmissiveBounces}set transmissiveBounces(e){this._pathTracer.material.transmissiveBounces=e}get bounces(){return this._pathTracer.material.bounces}set bounces(e){this._pathTracer.material.bounces=e}get filterGlossyFactor(){return this._pathTracer.material.filterGlossyFactor}set filterGlossyFactor(e){this._pathTracer.material.filterGlossyFactor=e}get samples(){return this._pathTracer.samples}get target(){return this._pathTracer.target}get tiles(){return this._pathTracer.tiles}get stableNoise(){return this._pathTracer.stableNoise}set stableNoise(e){this._pathTracer.stableNoise=e}get isCompiling(){return!!this._pathTracer.isCompiling}constructor(e){console.warn('WebGLPathTracer: This class has been deprecated and will be removed in a future release. Use "WebGPUPathTracer" instead.'),this._renderer=e,this._generator=new Sc,this._pathTracer=new Oo(e),this._queueReset=!1,this._clock=new to,this._compilePromise=null,this._lowResPathTracer=new Oo(e),this._lowResPathTracer.tiles.set(1,1),this._quad=new On(new Yc({map:null,transparent:!0,blending:Kt,premultipliedAlpha:e.getContextAttributes().premultipliedAlpha})),this._materials=null,this._previousEnvironment=null,this._previousBackground=null,this._internalBackground=null,this.renderDelay=100,this.minSamples=5,this.fadeDuration=500,this.enablePathTracing=!0,this.pausePathTracing=!1,this.dynamicLowRes=!1,this.lowResScale=.25,this.renderScale=1,this.synchronizeRenderSize=!0,this.rasterizeScene=!0,this.renderToCanvas=!0,this.textureSize=new Oe(1024,1024),this.rasterizeSceneCallback=(t,n)=>{this._renderer.render(t,n)},this.renderToCanvasCallback=(t,n,r)=>{let s=n.autoClear;n.autoClear=!1,r.render(n),n.autoClear=s},this.setScene(new cr,new rn)}setBVHWorker(e){this._generator.setBVHWorker(e)}setScene(e,t,n={}){e.updateMatrixWorld(!0),t.updateMatrixWorld();let r=this._generator;if(r.setObjects(e),this._buildAsync)return r.generateAsync(n.onProgress).then(s=>this._updateFromResults(e,t,s));{let s=r.generate();return this._updateFromResults(e,t,s)}}setSceneAsync(...e){this._buildAsync=!0;let t=this.setScene(...e);return this._buildAsync=!1,t}setCamera(e){this.camera=e,this.updateCamera()}updateCamera(){let e=this.camera;e.updateMatrixWorld(),this._pathTracer.setCamera(e),this._lowResPathTracer.setCamera(e),this.reset()}updateMaterials(){let e=this._pathTracer.material,t=this._renderer,n=this._materials,r=this.textureSize,s=lm(n);e.textures.setTextures(t,s,r.x,r.y),e.materials.updateFrom(n,s),this.reset()}updateLights(){let e=this.scene,t=this._renderer,n=this._pathTracer.material,r=cm(e),s=am(r);n.lights.updateFrom(r,s),n.iesProfiles.setTextures(t,s),this.reset()}updateEnvironment(){let e=this.scene,t=this._pathTracer.material;if(this._internalBackground&&(this._internalBackground.dispose(),this._internalBackground=null),t.backgroundBlur=e.backgroundBlurriness,t.backgroundIntensity=e.backgroundIntensity??1,t.backgroundRotation.makeRotationFromEuler(e.backgroundRotation).invert(),e.background===null)t.backgroundMap=null,t.backgroundAlpha=0;else if(e.background.isColor){this._colorBackground=this._colorBackground||new qc(16);let n=this._colorBackground;n.topColor.equals(e.background)||(n.topColor.set(e.background),n.bottomColor.set(e.background),n.update()),t.backgroundMap=n,t.backgroundAlpha=1}else if(e.background.isCubeTexture){if(e.background!==this._previousBackground){let n=new zo(this._renderer).generate(e.background);this._internalBackground=n,t.backgroundMap=n,t.backgroundAlpha=1}}else t.backgroundMap=e.background,t.backgroundAlpha=1;if(t.environmentIntensity=e.environment!==null?e.environmentIntensity??1:0,t.environmentRotation.makeRotationFromEuler(e.environmentRotation).invert(),this._previousEnvironment!==e.environment&&e.environment!==null)if(e.environment.isCubeTexture){let n=new zo(this._renderer).generate(e.environment);t.envMapInfo.updateFrom(n)}else t.envMapInfo.updateFrom(e.environment);this._previousEnvironment=e.environment,this._previousBackground=e.background,this.reset()}_updateFromResults(e,t,n){let{materials:r,geometry:s,bvh:o,bvhChanged:a,needsMaterialIndexUpdate:l}=n;this._materials=r;let f=this._pathTracer.material;return a&&(f.bvh.updateFrom(o),f.attributesArray.updateFrom(s.attributes.normal,s.attributes.tangent,s.attributes.uv,s.attributes.color)),l&&f.materialIndexAttribute.updateFrom(s.attributes.materialIndex),this._previousScene=e,this.scene=e,this.camera=t,this.updateCamera(),this.updateMaterials(),this.updateEnvironment(),this.updateLights(),n}renderSample(){let e=this._lowResPathTracer,t=this._pathTracer,n=this._renderer,r=this._clock,s=this._quad;this._updateScale(),this._queueReset&&(t.reset(),e.reset(),this._queueReset=!1,s.material.opacity=0,r.start());let o=r.getDelta()*1e3,a=r.getElapsedTime()*1e3;if(!this.pausePathTracing&&this.enablePathTracing&&this.renderDelay<=a&&!this.isCompiling&&t.update(),t.alpha=t.material.backgroundAlpha!==1||!VS(n),e.alpha=t.alpha,this.renderToCanvas){let l=this._renderer,u=this.minSamples;if(a>=this.renderDelay&&this.samples>=this.minSamples&&(this.fadeDuration!==0?s.material.opacity=Math.min(s.material.opacity+o/this.fadeDuration,1):s.material.opacity=1),!this.enablePathTracing||this.samples<u||s.material.opacity<1){if(this.dynamicLowRes&&!this.isCompiling){e.samples<1&&(e.material=t.material,e.update());let f=s.material.opacity;s.material.opacity=1-s.material.opacity,s.material.map=e.target.texture,s.render(l),s.material.opacity=f}(!this.dynamicLowRes&&this.rasterizeScene||this.dynamicLowRes&&this.isCompiling)&&this.rasterizeSceneCallback(this.scene,this.camera)}this.enablePathTracing&&s.material.opacity>0&&(s.material.opacity<1&&(s.material.blending=this.dynamicLowRes?ro:ii),s.material.map=t.target.texture,this.renderToCanvasCallback(t.target,l,s),s.material.blending=Kt)}}reset(){this._queueReset=!0,this._pathTracer.samples=0}dispose(){this._quad.dispose(),this._quad.material.dispose(),this._pathTracer.dispose()}_updateScale(){if(this.synchronizeRenderSize){this._renderer.getDrawingBufferSize(Es);let e=Math.floor(this.renderScale*Es.x),t=Math.floor(this.renderScale*Es.y);if(this._pathTracer.getSize(Es),Es.x!==e||Es.y!==t){let n=this.lowResScale;this._pathTracer.setSize(e,t),this._lowResPathTracer.setSize(Math.floor(e*n),Math.floor(t*n))}}}getRenderTime(){return this._clock.getElapsedTime()*1e3}};var $c=class extends fr{constructor(e){super(e),this.type=ut}parse(e){let o=function(_,R){switch(_){case 1:throw new Error("THREE.HDRLoader: Read Error: "+(R||""));case 2:throw new Error("THREE.HDRLoader: Write Error: "+(R||""));case 3:throw new Error("THREE.HDRLoader: Bad File Format: "+(R||""));default:case 4:throw new Error("THREE.HDRLoader: Memory Error: "+(R||""))}},h=function(_,R,I){R=R||1024;let L=_.pos,O=-1,N=0,V="",W=String.fromCharCode.apply(null,new Uint16Array(_.subarray(L,L+128)));for(;0>(O=W.indexOf(`
`))&&N<R&&L<_.byteLength;)V+=W,N+=W.length,L+=128,W=String.fromCharCode.apply(null,new Uint16Array(_.subarray(L,L+128)));return-1<O?(I!==!1&&(_.pos+=N+O+1),V+W.slice(0,O)):!1},c=function(_){let R=/^#\?(\S+)/,I=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,F=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,L=/^\s*FORMAT=(\S+)\s*$/,O=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,N={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},V,W;for((_.pos>=_.byteLength||!(V=h(_)))&&o(1,"no header found"),(W=V.match(R))||o(3,"bad initial token"),N.valid|=1,N.programtype=W[1],N.string+=V+`
`;V=h(_),V!==!1;){if(N.string+=V+`
`,V.charAt(0)==="#"){N.comments+=V+`
`;continue}if((W=V.match(I))&&(N.gamma=parseFloat(W[1])),(W=V.match(F))&&(N.exposure=parseFloat(W[1])),(W=V.match(L))&&(N.valid|=2,N.format=W[1]),(W=V.match(O))&&(N.valid|=4,N.height=parseInt(W[1],10),N.width=parseInt(W[2],10)),N.valid&2&&N.valid&4)break}return N.valid&2||o(3,"missing format specifier"),N.valid&4||o(3,"missing image size specifier"),N},d=function(_,R,I){let F=R;if(F<8||F>32767||_[0]!==2||_[1]!==2||_[2]&128)return new Uint8Array(_);F!==(_[2]<<8|_[3])&&o(3,"wrong scanline width");let L=new Uint8Array(4*R*I);L.length||o(4,"unable to allocate buffer space");let O=0,N=0,V=4*F,W=new Uint8Array(4),J=new Uint8Array(V),ce=I;for(;ce>0&&N<_.byteLength;){N+4>_.byteLength&&o(1),W[0]=_[N++],W[1]=_[N++],W[2]=_[N++],W[3]=_[N++],(W[0]!=2||W[1]!=2||(W[2]<<8|W[3])!=F)&&o(3,"bad rgbe scanline format");let K=0,ie;for(;K<V&&N<_.byteLength;){ie=_[N++];let Te=ie>128;if(Te&&(ie-=128),(ie===0||K+ie>V)&&o(3,"bad scanline data"),Te){let ve=_[N++];for(let Qe=0;Qe<ie;Qe++)J[K++]=ve}else J.set(_.subarray(N,N+ie),K),K+=ie,N+=ie}let re=F;for(let Te=0;Te<re;Te++){let ve=0;L[O]=J[Te+ve],ve+=F,L[O+1]=J[Te+ve],ve+=F,L[O+2]=J[Te+ve],ve+=F,L[O+3]=J[Te+ve],O+=4}ce--}return L},x=function(_,R,I,F){let L=_[R+3],O=Math.pow(2,L-128)/255;I[F+0]=_[R+0]*O,I[F+1]=_[R+1]*O,I[F+2]=_[R+2]*O,I[F+3]=1},b=function(_,R,I,F){let L=_[R+3],O=Math.pow(2,L-128)/255;I[F+0]=vt.toHalfFloat(Math.min(_[R+0]*O,65504)),I[F+1]=vt.toHalfFloat(Math.min(_[R+1]*O,65504)),I[F+2]=vt.toHalfFloat(Math.min(_[R+2]*O,65504)),I[F+3]=vt.toHalfFloat(1)},p=new Uint8Array(e);p.pos=0;let g=c(p),S=g.width,w=g.height,y=d(p.subarray(p.pos),S,w),T,E,C;switch(this.type){case nt:C=y.length/4;let _=new Float32Array(C*4);for(let I=0;I<C;I++)x(y,I*4,_,I*4);T=_,E=nt;break;case ut:C=y.length/4;let R=new Uint16Array(C*4);for(let I=0;I<C;I++)b(y,I*4,R,I*4);T=R,E=ut;break;default:throw new Error("THREE.HDRLoader: Unsupported type: "+this.type)}return{width:S,height:w,data:T,header:g.string,gamma:g.gamma,exposure:g.exposure,type:E,colorSpace:dn,minFilter:st,magFilter:st,generateMipmaps:!1,flipY:!0}}setDataType(e){return this.type=e,this}};var Xt=Uint8Array,zn=Uint16Array,ff=Int32Array,Jc=new Xt([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Kc=new Xt([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),af=new Xt([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Zm=function(i,e){for(var t=new zn(31),n=0;n<31;++n)t[n]=e+=1<<i[n-1];for(var r=new ff(t[30]),n=1;n<30;++n)for(var s=t[n];s<t[n+1];++s)r[s]=s-t[n]<<5|n;return{b:t,r}},$m=Zm(Jc,2),Jm=$m.b,lf=$m.r;Jm[28]=258,lf[258]=28;var Km=Zm(Kc,0),HS=Km.b,Hm=Km.r,cf=new zn(32768);for(wt=0;wt<32768;++wt)Ei=(wt&43690)>>1|(wt&21845)<<1,Ei=(Ei&52428)>>2|(Ei&13107)<<2,Ei=(Ei&61680)>>4|(Ei&3855)<<4,cf[wt]=((Ei&65280)>>8|(Ei&255)<<8)>>1;var Ei,wt,li=(function(i,e,t){for(var n=i.length,r=0,s=new zn(e);r<n;++r)i[r]&&++s[i[r]-1];var o=new zn(e);for(r=1;r<e;++r)o[r]=o[r-1]+s[r-1]<<1;var a;if(t){a=new zn(1<<e);var l=15-e;for(r=0;r<n;++r)if(i[r])for(var u=r<<4|i[r],f=e-i[r],h=o[i[r]-1]++<<f,c=h|(1<<f)-1;h<=c;++h)a[cf[h]>>l]=u}else for(a=new zn(n),r=0;r<n;++r)i[r]&&(a[r]=cf[o[i[r]-1]++]>>15-i[r]);return a}),tr=new Xt(288);for(wt=0;wt<144;++wt)tr[wt]=8;var wt;for(wt=144;wt<256;++wt)tr[wt]=9;var wt;for(wt=256;wt<280;++wt)tr[wt]=7;var wt;for(wt=280;wt<288;++wt)tr[wt]=8;var wt,Ho=new Xt(32);for(wt=0;wt<32;++wt)Ho[wt]=5;var wt,GS=li(tr,9,0),WS=li(tr,9,1),XS=li(Ho,5,0),qS=li(Ho,5,1),rf=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},Qn=function(i,e,t){var n=e/8|0;return(i[n]|i[n+1]<<8)>>(e&7)&t},sf=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},df=function(i){return(i+7)/8|0},pf=function(i,e,t){return(e==null||e<0)&&(e=0),(t==null||t>i.length)&&(t=i.length),new Xt(i.subarray(e,t))};var YS=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Dn=function(i,e,t){var n=new Error(e||YS[i]);if(n.code=i,Error.captureStackTrace&&Error.captureStackTrace(n,Dn),!t)throw n;return n},ZS=function(i,e,t,n){var r=i.length,s=n?n.length:0;if(!r||e.f&&!e.l)return t||new Xt(0);var o=!t,a=o||e.i!=2,l=e.i;o&&(t=new Xt(r*3));var u=function(Ce){var Ye=t.length;if(Ce>Ye){var Pt=new Xt(Math.max(Ye*2,Ce));Pt.set(t),t=Pt}},f=e.f||0,h=e.p||0,c=e.b||0,d=e.l,x=e.d,b=e.m,p=e.n,g=r*8;do{if(!d){f=Qn(i,h,1);var S=Qn(i,h+1,3);if(h+=3,S)if(S==1)d=WS,x=qS,b=9,p=5;else if(S==2){var E=Qn(i,h,31)+257,C=Qn(i,h+10,15)+4,_=E+Qn(i,h+5,31)+1;h+=14;for(var R=new Xt(_),I=new Xt(19),F=0;F<C;++F)I[af[F]]=Qn(i,h+F*3,7);h+=C*3;for(var L=rf(I),O=(1<<L)-1,N=li(I,L,1),F=0;F<_;){var V=N[Qn(i,h,O)];h+=V&15;var w=V>>4;if(w<16)R[F++]=w;else{var W=0,J=0;for(w==16?(J=3+Qn(i,h,3),h+=2,W=R[F-1]):w==17?(J=3+Qn(i,h,7),h+=3):w==18&&(J=11+Qn(i,h,127),h+=7);J--;)R[F++]=W}}var ce=R.subarray(0,E),K=R.subarray(E);b=rf(ce),p=rf(K),d=li(ce,b,1),x=li(K,p,1)}else Dn(1);else{var w=df(h)+4,y=i[w-4]|i[w-3]<<8,T=w+y;if(T>r){l&&Dn(0);break}a&&u(c+y),t.set(i.subarray(w,T),c),e.b=c+=y,e.p=h=T*8,e.f=f;continue}if(h>g){l&&Dn(0);break}}a&&u(c+131072);for(var ie=(1<<b)-1,re=(1<<p)-1,Te=h;;Te=h){var W=d[sf(i,h)&ie],ve=W>>4;if(h+=W&15,h>g){l&&Dn(0);break}if(W||Dn(2),ve<256)t[c++]=ve;else if(ve==256){Te=h,d=null;break}else{var Qe=ve-254;if(ve>264){var F=ve-257,Ue=Jc[F];Qe=Qn(i,h,(1<<Ue)-1)+Jm[F],h+=Ue}var et=x[sf(i,h)&re],Q=et>>4;et||Dn(3),h+=et&15;var K=HS[Q];if(Q>3){var Ue=Kc[Q];K+=sf(i,h)&(1<<Ue)-1,h+=Ue}if(h>g){l&&Dn(0);break}a&&u(c+131072);var le=c+Qe;if(c<K){var Re=s-K,We=Math.min(K,le);for(Re+c<0&&Dn(3);c<We;++c)t[c]=n[Re+c]}for(;c<le;++c)t[c]=t[c-K]}}e.l=d,e.p=Te,e.b=c,e.f=f,d&&(f=1,e.m=b,e.d=x,e.n=p)}while(!f);return c!=t.length&&o?pf(t,0,c):t.subarray(0,c)},Ri=function(i,e,t){t<<=e&7;var n=e/8|0;i[n]|=t,i[n+1]|=t>>8},ko=function(i,e,t){t<<=e&7;var n=e/8|0;i[n]|=t,i[n+1]|=t>>8,i[n+2]|=t>>16},of=function(i,e){for(var t=[],n=0;n<i.length;++n)i[n]&&t.push({s:n,f:i[n]});var r=t.length,s=t.slice();if(!r)return{t:jm,l:0};if(r==1){var o=new Xt(t[0].s+1);return o[t[0].s]=1,{t:o,l:1}}t.sort(function(T,E){return T.f-E.f}),t.push({s:-1,f:25001});var a=t[0],l=t[1],u=0,f=1,h=2;for(t[0]={s:-1,f:a.f+l.f,l:a,r:l};f!=r-1;)a=t[t[u].f<t[h].f?u++:h++],l=t[u!=f&&t[u].f<t[h].f?u++:h++],t[f++]={s:-1,f:a.f+l.f,l:a,r:l};for(var c=s[0].s,n=1;n<r;++n)s[n].s>c&&(c=s[n].s);var d=new zn(c+1),x=uf(t[f-1],d,0);if(x>e){var n=0,b=0,p=x-e,g=1<<p;for(s.sort(function(E,C){return d[C.s]-d[E.s]||E.f-C.f});n<r;++n){var S=s[n].s;if(d[S]>e)b+=g-(1<<x-d[S]),d[S]=e;else break}for(b>>=p;b>0;){var w=s[n].s;d[w]<e?b-=1<<e-d[w]++-1:++n}for(;n>=0&&b;--n){var y=s[n].s;d[y]==e&&(--d[y],++b)}x=e}return{t:new Xt(d),l:x}},uf=function(i,e,t){return i.s==-1?Math.max(uf(i.l,e,t+1),uf(i.r,e,t+1)):e[i.s]=t},Gm=function(i){for(var e=i.length;e&&!i[--e];);for(var t=new zn(++e),n=0,r=i[0],s=1,o=function(l){t[n++]=l},a=1;a<=e;++a)if(i[a]==r&&a!=e)++s;else{if(!r&&s>2){for(;s>138;s-=138)o(32754);s>2&&(o(s>10?s-11<<5|28690:s-3<<5|12305),s=0)}else if(s>3){for(o(r),--s;s>6;s-=6)o(8304);s>2&&(o(s-3<<5|8208),s=0)}for(;s--;)o(r);s=1,r=i[a]}return{c:t.subarray(0,n),n:e}},Vo=function(i,e){for(var t=0,n=0;n<e.length;++n)t+=i[n]*e[n];return t},Qm=function(i,e,t){var n=t.length,r=df(e+2);i[r]=n&255,i[r+1]=n>>8,i[r+2]=i[r]^255,i[r+3]=i[r+1]^255;for(var s=0;s<n;++s)i[r+s+4]=t[s];return(r+4+n)*8},Wm=function(i,e,t,n,r,s,o,a,l,u,f){Ri(e,f++,t),++r[256];for(var h=of(r,15),c=h.t,d=h.l,x=of(s,15),b=x.t,p=x.l,g=Gm(c),S=g.c,w=g.n,y=Gm(b),T=y.c,E=y.n,C=new zn(19),_=0;_<S.length;++_)++C[S[_]&31];for(var _=0;_<T.length;++_)++C[T[_]&31];for(var R=of(C,7),I=R.t,F=R.l,L=19;L>4&&!I[af[L-1]];--L);var O=u+5<<3,N=Vo(r,tr)+Vo(s,Ho)+o,V=Vo(r,c)+Vo(s,b)+o+14+3*L+Vo(C,I)+2*C[16]+3*C[17]+7*C[18];if(l>=0&&O<=N&&O<=V)return Qm(e,f,i.subarray(l,l+u));var W,J,ce,K;if(Ri(e,f,1+(V<N)),f+=2,V<N){W=li(c,d,0),J=c,ce=li(b,p,0),K=b;var ie=li(I,F,0);Ri(e,f,w-257),Ri(e,f+5,E-1),Ri(e,f+10,L-4),f+=14;for(var _=0;_<L;++_)Ri(e,f+3*_,I[af[_]]);f+=3*L;for(var re=[S,T],Te=0;Te<2;++Te)for(var ve=re[Te],_=0;_<ve.length;++_){var Qe=ve[_]&31;Ri(e,f,ie[Qe]),f+=I[Qe],Qe>15&&(Ri(e,f,ve[_]>>5&127),f+=ve[_]>>12)}}else W=GS,J=tr,ce=XS,K=Ho;for(var _=0;_<a;++_){var Ue=n[_];if(Ue>255){var Qe=Ue>>18&31;ko(e,f,W[Qe+257]),f+=J[Qe+257],Qe>7&&(Ri(e,f,Ue>>23&31),f+=Jc[Qe]);var et=Ue&31;ko(e,f,ce[et]),f+=K[et],et>3&&(ko(e,f,Ue>>5&8191),f+=Kc[et])}else ko(e,f,W[Ue]),f+=J[Ue]}return ko(e,f,W[256]),f+J[256]},$S=new ff([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),jm=new Xt(0),JS=function(i,e,t,n,r,s){var o=s.z||i.length,a=new Xt(n+o+5*(1+Math.ceil(o/7e3))+r),l=a.subarray(n,a.length-r),u=s.l,f=(s.r||0)&7;if(e){f&&(l[0]=s.r>>3);for(var h=$S[e-1],c=h>>13,d=h&8191,x=(1<<t)-1,b=s.p||new zn(32768),p=s.h||new zn(x+1),g=Math.ceil(t/3),S=2*g,w=function(it){return(i[it]^i[it+1]<<g^i[it+2]<<S)&x},y=new ff(25e3),T=new zn(288),E=new zn(32),C=0,_=0,R=s.i||0,I=0,F=s.w||0,L=0;R+2<o;++R){var O=w(R),N=R&32767,V=p[O];if(b[N]=V,p[O]=N,F<=R){var W=o-R;if((C>7e3||I>24576)&&(W>423||!u)){f=Wm(i,l,0,y,T,E,_,I,L,R-L,f),I=C=_=0,L=R;for(var J=0;J<286;++J)T[J]=0;for(var J=0;J<30;++J)E[J]=0}var ce=2,K=0,ie=d,re=N-V&32767;if(W>2&&O==w(R-re))for(var Te=Math.min(c,W)-1,ve=Math.min(32767,R),Qe=Math.min(258,W);re<=ve&&--ie&&N!=V;){if(i[R+ce]==i[R+ce-re]){for(var Ue=0;Ue<Qe&&i[R+Ue]==i[R+Ue-re];++Ue);if(Ue>ce){if(ce=Ue,K=re,Ue>Te)break;for(var et=Math.min(re,Ue-2),Q=0,J=0;J<et;++J){var le=R-re+J&32767,Re=b[le],We=le-Re&32767;We>Q&&(Q=We,V=le)}}}N=V,V=b[N],re+=N-V&32767}if(K){y[I++]=268435456|lf[ce]<<18|Hm[K];var Ce=lf[ce]&31,Ye=Hm[K]&31;_+=Jc[Ce]+Kc[Ye],++T[257+Ce],++E[Ye],F=R+ce,++C}else y[I++]=i[R],++T[i[R]]}}for(R=Math.max(R,F);R<o;++R)y[I++]=i[R],++T[i[R]];f=Wm(i,l,u,y,T,E,_,I,L,R-L,f),u||(s.r=f&7|l[f/8|0]<<3,f-=7,s.h=p,s.p=b,s.i=R,s.w=F)}else{for(var R=s.w||0;R<o+u;R+=65535){var Pt=R+65535;Pt>=o&&(l[f/8|0]=u,Pt=o),f=Qm(l,f+1,i.subarray(R,Pt))}s.i=o}return pf(a,0,n+df(f)+r)},KS=(function(){for(var i=new Int32Array(256),e=0;e<256;++e){for(var t=e,n=9;--n;)t=(t&1&&-306674912)^t>>>1;i[e]=t}return i})(),QS=function(){var i=-1;return{p:function(e){for(var t=i,n=0;n<e.length;++n)t=KS[t&255^e[n]]^t>>>8;i=t},d:function(){return~i}}};var jS=function(i,e,t,n,r){if(!r&&(r={l:1},e.dictionary)){var s=e.dictionary.subarray(-32768),o=new Xt(s.length+i.length);o.set(s),o.set(i,s.length),i=o,r.w=s.length}return JS(i,e.level==null?6:e.level,e.mem==null?r.l?Math.ceil(Math.max(8,Math.min(13,Math.log(i.length)))*1.5):20:12+e.mem,t,n,r)},eg=function(i,e){var t={};for(var n in i)t[n]=i[n];for(var n in e)t[n]=e[n];return t};var mn=function(i,e,t){for(;t;++e)i[e]=t,t>>>=8};var eb=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&Dn(6,"invalid zlib data"),(i[1]>>5&1)==+!e&&Dn(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function tb(i,e){return jS(i,e||{},0,0)}function Rs(i,e){return ZS(i.subarray(eb(i,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var tg=function(i,e,t,n){for(var r in i){var s=i[r],o=e+r,a=n;Array.isArray(s)&&(a=eg(n,s[1]),s=s[0]),s instanceof Xt?t[o]=[s,a]:(t[o+="/"]=[new Xt(0),a],tg(s,o,t,n))}},Xm=typeof TextEncoder<"u"&&new TextEncoder,nb=typeof TextDecoder<"u"&&new TextDecoder,ib=0;try{nb.decode(jm,{stream:!0}),ib=1}catch{}function qm(i,e){if(e){for(var t=new Xt(i.length),n=0;n<i.length;++n)t[n]=i.charCodeAt(n);return t}if(Xm)return Xm.encode(i);for(var r=i.length,s=new Xt(i.length+(i.length>>1)),o=0,a=function(f){s[o++]=f},n=0;n<r;++n){if(o+5>s.length){var l=new Xt(o+8+(r-n<<1));l.set(s),s=l}var u=i.charCodeAt(n);u<128||e?a(u):u<2048?(a(192|u>>6),a(128|u&63)):u>55295&&u<57344?(u=65536+(u&1047552)|i.charCodeAt(++n)&1023,a(240|u>>18),a(128|u>>12&63),a(128|u>>6&63),a(128|u&63)):(a(224|u>>12),a(128|u>>6&63),a(128|u&63))}return pf(s,0,o)}var hf=function(i){var e=0;if(i)for(var t in i){var n=i[t].length;n>65535&&Dn(9),e+=n+4}return e},Ym=function(i,e,t,n,r,s,o,a){var l=n.length,u=t.extra,f=a&&a.length,h=hf(u);mn(i,e,o!=null?33639248:67324752),e+=4,o!=null&&(i[e++]=20,i[e++]=t.os),i[e]=20,e+=2,i[e++]=t.flag<<1|(s<0&&8),i[e++]=r&&8,i[e++]=t.compression&255,i[e++]=t.compression>>8;var c=new Date(t.mtime==null?Date.now():t.mtime),d=c.getFullYear()-1980;if((d<0||d>119)&&Dn(10),mn(i,e,d<<25|c.getMonth()+1<<21|c.getDate()<<16|c.getHours()<<11|c.getMinutes()<<5|c.getSeconds()>>1),e+=4,s!=-1&&(mn(i,e,t.crc),mn(i,e+4,s<0?-s-2:s),mn(i,e+8,t.size)),mn(i,e+12,l),mn(i,e+14,h),e+=16,o!=null&&(mn(i,e,f),mn(i,e+6,t.attrs),mn(i,e+10,o),e+=14),i.set(n,e),e+=l,h)for(var x in u){var b=u[x],p=b.length;mn(i,e,+x),mn(i,e+2,p),i.set(b,e+4),e+=4+p}return f&&(i.set(a,e),e+=f),e},rb=function(i,e,t,n,r){mn(i,e,101010256),mn(i,e+8,t),mn(i,e+10,t),mn(i,e+12,n),mn(i,e+16,r)};function ng(i,e){e||(e={});var t={},n=[];tg(i,"",t,e);var r=0,s=0;for(var o in t){var a=t[o],l=a[0],u=a[1],f=u.level==0?0:8,h=qm(o),c=h.length,d=u.comment,x=d&&qm(d),b=x&&x.length,p=hf(u.extra);c>65535&&Dn(11);var g=f?tb(l,u):l,S=g.length,w=QS();w.p(l),n.push(eg(u,{size:l.length,crc:w.d(),c:g,f:h,m:x,u:c!=o.length||x&&d.length!=b,o:r,compression:f})),r+=30+c+p+S,s+=76+2*(c+p)+(b||0)+S}for(var y=new Xt(s+22),T=r,E=s-r,C=0;C<n.length;++C){var h=n[C];Ym(y,h.o,h,h.f,h.u,h.c.length);var _=30+h.f.length+hf(h.extra);y.set(h.c,h.o+_),Ym(y,r,h,h.f,h.u,h.c.length,h.o,h.m),r+=16+_+(h.m?h.m.length:0)}return rb(y,r,n.length,E,T),y}var Qc=class extends fr{constructor(e){super(e),this.type=ut,this.outputFormat=Xe,this.part=0}parse(e){let R=Math.pow(2.7182818,2.2),I=null;function F(v,m){let M=0;for(let D=0;D<65536;++D)(D==0||v[D>>3]&1<<(D&7))&&(m[M++]=D);let P=M-1;for(;M<65536;)m[M++]=0;return P}function L(v){for(let m=0;m<16384;m++)v[m]={},v[m].len=0,v[m].lit=0,v[m].p=null}let O={l:0,c:0,lc:0};function N(v,m,M,P,D){for(;M<v;)m=m<<8|we(P,D),M+=8;M-=v,O.l=m>>M&(1<<v)-1,O.c=m,O.lc=M}let V=new Array(59);function W(v){for(let M=0;M<=58;++M)V[M]=0;for(let M=0;M<65537;++M)V[v[M]]+=1;let m=0;for(let M=58;M>0;--M){let P=m+V[M]>>1;V[M]=m,m=P}for(let M=0;M<65537;++M){let P=v[M];P>0&&(v[M]=P|V[P]++<<6)}}function J(v,m,M,P,D,B){let U=m,q=0,H=0;for(;P<=D;P++){if(U.value-m.value>M)return!1;N(6,q,H,v,U);let Y=O.l;if(q=O.c,H=O.lc,B[P]=Y,Y==63){if(U.value-m.value>M)throw new Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");N(8,q,H,v,U);let $=O.l+6;if(q=O.c,H=O.lc,P+$>D+1)throw new Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");for(;$--;)B[P++]=0;P--}else if(Y>=59){let $=Y-59+2;if(P+$>D+1)throw new Error("THREE.EXRLoader: Something wrong with hufUnpackEncTable");for(;$--;)B[P++]=0;P--}}W(B)}function ce(v){return v&63}function K(v){return v>>6}function ie(v,m,M,P){for(;m<=M;m++){let D=K(v[m]),B=ce(v[m]);if(D>>B)throw new Error("THREE.EXRLoader: Invalid table entry");if(B>14){let U=P[D>>B-14];if(U.len)throw new Error("THREE.EXRLoader: Invalid table entry");if(U.lit++,U.p){let q=U.p;U.p=new Array(U.lit);for(let H=0;H<U.lit-1;++H)U.p[H]=q[H]}else U.p=new Array(1);U.p[U.lit-1]=m}else if(B){let U=0;for(let q=1<<14-B;q>0;q--){let H=P[(D<<14-B)+U];if(H.len||H.p)throw new Error("THREE.EXRLoader: Invalid table entry");H.len=B,H.lit=m,U++}}}return!0}let re={c:0,lc:0};function Te(v,m,M,P){v=v<<8|we(M,P),m+=8,re.c=v,re.lc=m}let ve={c:0,lc:0};function Qe(v,m,M,P,D,B,U,q,H){if(v==m){P<8&&(Te(M,P,D,B),M=re.c,P=re.lc),P-=8;let Y=M>>P;if(Y=new Uint8Array([Y])[0],q.value+Y>H)return!1;let $=U[q.value-1];for(;Y-- >0;)U[q.value++]=$}else if(q.value<H)U[q.value++]=v;else return!1;ve.c=M,ve.lc=P}function Ue(v){return v&65535}function et(v){let m=Ue(v);return m>32767?m-65536:m}let Q={a:0,b:0};function le(v,m){let M=et(v),D=et(m),B=M+(D&1)+(D>>1),U=B,q=B-D;Q.a=U,Q.b=q}function Re(v,m){let M=Ue(v),P=Ue(m),D=M-(P>>1)&65535,B=P+D-32768&65535;Q.a=B,Q.b=D}function We(v,m,M,P,D,B,U){let q=U<16384,H=M>D?D:M,Y=1,$,oe;for(;Y<=H;)Y<<=1;for(Y>>=1,$=Y,Y>>=1;Y>=1;){oe=0;let te=oe+B*(D-$),ne=B*Y,ge=B*$,pe=P*Y,me=P*$,Se,Ge,fe,Ze;for(;oe<=te;oe+=ge){let xe=oe,Me=oe+P*(M-$);for(;xe<=Me;xe+=me){let Fe=xe+pe,ft=xe+ne,ot=ft+pe;q?(le(v[xe+m],v[ft+m]),Se=Q.a,fe=Q.b,le(v[Fe+m],v[ot+m]),Ge=Q.a,Ze=Q.b,le(Se,Ge),v[xe+m]=Q.a,v[Fe+m]=Q.b,le(fe,Ze),v[ft+m]=Q.a,v[ot+m]=Q.b):(Re(v[xe+m],v[ft+m]),Se=Q.a,fe=Q.b,Re(v[Fe+m],v[ot+m]),Ge=Q.a,Ze=Q.b,Re(Se,Ge),v[xe+m]=Q.a,v[Fe+m]=Q.b,Re(fe,Ze),v[ft+m]=Q.a,v[ot+m]=Q.b)}if(M&Y){let Fe=xe+ne;q?le(v[xe+m],v[Fe+m]):Re(v[xe+m],v[Fe+m]),Se=Q.a,v[Fe+m]=Q.b,v[xe+m]=Se}}if(D&Y){let xe=oe,Me=oe+P*(M-$);for(;xe<=Me;xe+=me){let Fe=xe+pe;q?le(v[xe+m],v[Fe+m]):Re(v[xe+m],v[Fe+m]),Se=Q.a,v[Fe+m]=Q.b,v[xe+m]=Se}}$=Y,Y>>=1}return oe}function Ce(v,m,M,P,D,B,U,q,H){let Y=0,$=0,oe=U,te=Math.trunc(P.value+(D+7)/8);for(;P.value<te;)for(Te(Y,$,M,P),Y=re.c,$=re.lc;$>=14;){let ge=Y>>$-14&16383,pe=m[ge];if(pe.len)$-=pe.len,Qe(pe.lit,B,Y,$,M,P,q,H,oe),Y=ve.c,$=ve.lc;else{if(!pe.p)throw new Error("THREE.EXRLoader: hufDecode issues");let me;for(me=0;me<pe.lit;me++){let Se=ce(v[pe.p[me]]);for(;$<Se&&P.value<te;)Te(Y,$,M,P),Y=re.c,$=re.lc;if($>=Se&&K(v[pe.p[me]])==(Y>>$-Se&(1<<Se)-1)){$-=Se,Qe(pe.p[me],B,Y,$,M,P,q,H,oe),Y=ve.c,$=ve.lc;break}}if(me==pe.lit)throw new Error("THREE.EXRLoader: hufDecode issues")}}let ne=8-D&7;for(Y>>=ne,$-=ne;$>0;){let ge=m[Y<<14-$&16383];if(ge.len)$-=ge.len,Qe(ge.lit,B,Y,$,M,P,q,H,oe),Y=ve.c,$=ve.lc;else throw new Error("THREE.EXRLoader: hufDecode issues")}return!0}function Ye(v,m,M,P,D,B){let U={value:0},q=M.value,H=_e(m,M),Y=_e(m,M);M.value+=4;let $=_e(m,M);if(M.value+=4,H<0||H>=65537||Y<0||Y>=65537)throw new Error("THREE.EXRLoader: Something wrong with HUF_ENCSIZE");let oe=new Array(65537),te=new Array(16384);L(te);let ne=P-(M.value-q);if(J(v,M,ne,H,Y,oe),$>8*(P-(M.value-q)))throw new Error("THREE.EXRLoader: Something wrong with hufUncompress");ie(oe,H,Y,te),Ce(oe,te,v,M,$,Y,B,D,U)}function Pt(v,m,M){for(let P=0;P<M;++P)m[P]=v[m[P]]}function it(v){for(let m=1;m<v.length;m++){let M=v[m-1]+v[m]-128;v[m]=M}}function ht(v,m){let M=0,P=Math.floor((v.length+1)/2),D=0,B=v.length-1;for(;!(D>B||(m[D++]=v[M++],D>B));)m[D++]=v[P++]}function At(v){let m=v.byteLength,M=new Array,P=0,D=new DataView(v);for(;m>0;){let B=D.getInt8(P++);if(B<0){let U=-B;m-=U+1;for(let q=0;q<U;q++)M.push(D.getUint8(P++))}else{let U=B;m-=2;let q=D.getUint8(P++);for(let H=0;H<U+1;H++)M.push(q)}}return M}function ct(v,m,M,P,D,B){let U=new DataView(B.buffer),q=M[v.idx[0]].width,H=M[v.idx[0]].height,Y=3,$=Math.floor(q/8),oe=Math.ceil(q/8),te=Math.ceil(H/8),ne=q-(oe-1)*8,ge=H-(te-1)*8,pe={value:0},me=new Array(Y),Se=new Array(Y),Ge=new Array(Y),fe=new Array(Y),Ze=new Array(Y);for(let Me=0;Me<Y;++Me)Ze[Me]=m[v.idx[Me]],me[Me]=Me<1?0:me[Me-1]+oe*te,Se[Me]=new Float32Array(64),Ge[Me]=new Uint16Array(64),fe[Me]=new Uint16Array(oe*64);for(let Me=0;Me<te;++Me){let Fe=8;Me==te-1&&(Fe=ge);let ft=8;for(let De=0;De<oe;++De){De==oe-1&&(ft=ne);for(let Ve=0;Ve<Y;++Ve)Ge[Ve].fill(0),Ge[Ve][0]=D[me[Ve]++],qt(pe,P,Ge[Ve]),hn(Ge[Ve],Se[Ve]),Ot(Se[Ve]);Y==3&&Gt(Se);for(let Ve=0;Ve<Y;++Ve)X(Se[Ve],fe[Ve],De*64)}let ot=0;for(let De=0;De<Y;++De){let Ve=M[v.idx[De]].type;for(let Ct=8*Me;Ct<8*Me+Fe;++Ct){ot=Ze[De][Ct];for(let at=0;at<$;++at){let mt=at*64+(Ct&7)*8;U.setUint16(ot+0*Ve,fe[De][mt+0],!0),U.setUint16(ot+2*Ve,fe[De][mt+1],!0),U.setUint16(ot+4*Ve,fe[De][mt+2],!0),U.setUint16(ot+6*Ve,fe[De][mt+3],!0),U.setUint16(ot+8*Ve,fe[De][mt+4],!0),U.setUint16(ot+10*Ve,fe[De][mt+5],!0),U.setUint16(ot+12*Ve,fe[De][mt+6],!0),U.setUint16(ot+14*Ve,fe[De][mt+7],!0),ot+=16*Ve}}if($!=oe)for(let Ct=8*Me;Ct<8*Me+Fe;++Ct){let at=Ze[De][Ct]+8*$*2*Ve,mt=$*64+(Ct&7)*8;for(let fn=0;fn<ft;++fn)U.setUint16(at+fn*2*Ve,fe[De][mt+fn],!0)}}}let xe=new Uint16Array(q);U=new DataView(B.buffer);for(let Me=0;Me<Y;++Me){M[v.idx[Me]].decoded=!0;let Fe=M[v.idx[Me]].type;if(M[Me].type==2)for(let ft=0;ft<H;++ft){let ot=Ze[Me][ft];for(let De=0;De<q;++De)xe[De]=U.getUint16(ot+De*2*Fe,!0);for(let De=0;De<q;++De)U.setFloat32(ot+De*2*Fe,ee(xe[De]),!0)}}}function Bt(v,m,M,P,D,B){let U=new DataView(B.buffer),q=M[v],H=q.width,Y=q.height,$=Math.ceil(H/8),oe=Math.ceil(Y/8),te=Math.floor(H/8),ne=H-($-1)*8,ge=Y-(oe-1)*8,pe={value:0},me=0,Se=new Float32Array(64),Ge=new Uint16Array(64),fe=new Uint16Array($*64);for(let Ze=0;Ze<oe;++Ze){let xe=8;Ze==oe-1&&(xe=ge);for(let Me=0;Me<$;++Me)Ge.fill(0),Ge[0]=D[me++],qt(pe,P,Ge),hn(Ge,Se),Ot(Se),X(Se,fe,Me*64);for(let Me=8*Ze;Me<8*Ze+xe;++Me){let Fe=m[v][Me];for(let ft=0;ft<te;++ft){let ot=ft*64+(Me&7)*8;for(let De=0;De<8;++De)U.setUint16(Fe+De*2*q.type,fe[ot+De],!0);Fe+=16*q.type}if($!=te){let ft=te*64+(Me&7)*8;for(let ot=0;ot<ne;++ot)U.setUint16(Fe+ot*2*q.type,fe[ft+ot],!0)}}}q.decoded=!0}function qt(v,m,M){let P,D=1;for(;D<64;)P=m[v.value],P==65280?D=64:P>>8==255?D+=P&255:(M[D]=P,D++),v.value++}function hn(v,m){m[0]=ee(v[0]),m[1]=ee(v[1]),m[2]=ee(v[5]),m[3]=ee(v[6]),m[4]=ee(v[14]),m[5]=ee(v[15]),m[6]=ee(v[27]),m[7]=ee(v[28]),m[8]=ee(v[2]),m[9]=ee(v[4]),m[10]=ee(v[7]),m[11]=ee(v[13]),m[12]=ee(v[16]),m[13]=ee(v[26]),m[14]=ee(v[29]),m[15]=ee(v[42]),m[16]=ee(v[3]),m[17]=ee(v[8]),m[18]=ee(v[12]),m[19]=ee(v[17]),m[20]=ee(v[25]),m[21]=ee(v[30]),m[22]=ee(v[41]),m[23]=ee(v[43]),m[24]=ee(v[9]),m[25]=ee(v[11]),m[26]=ee(v[18]),m[27]=ee(v[24]),m[28]=ee(v[31]),m[29]=ee(v[40]),m[30]=ee(v[44]),m[31]=ee(v[53]),m[32]=ee(v[10]),m[33]=ee(v[19]),m[34]=ee(v[23]),m[35]=ee(v[32]),m[36]=ee(v[39]),m[37]=ee(v[45]),m[38]=ee(v[52]),m[39]=ee(v[54]),m[40]=ee(v[20]),m[41]=ee(v[22]),m[42]=ee(v[33]),m[43]=ee(v[38]),m[44]=ee(v[46]),m[45]=ee(v[51]),m[46]=ee(v[55]),m[47]=ee(v[60]),m[48]=ee(v[21]),m[49]=ee(v[34]),m[50]=ee(v[37]),m[51]=ee(v[47]),m[52]=ee(v[50]),m[53]=ee(v[56]),m[54]=ee(v[59]),m[55]=ee(v[61]),m[56]=ee(v[35]),m[57]=ee(v[36]),m[58]=ee(v[48]),m[59]=ee(v[49]),m[60]=ee(v[57]),m[61]=ee(v[58]),m[62]=ee(v[62]),m[63]=ee(v[63])}function Ot(v){let m=.5*Math.cos(.7853975),M=.5*Math.cos(3.14159/16),P=.5*Math.cos(3.14159/8),D=.5*Math.cos(3*3.14159/16),B=.5*Math.cos(5*3.14159/16),U=.5*Math.cos(3*3.14159/8),q=.5*Math.cos(7*3.14159/16),H=new Array(4),Y=new Array(4),$=new Array(4),oe=new Array(4);for(let te=0;te<8;++te){let ne=te*8;H[0]=P*v[ne+2],H[1]=U*v[ne+2],H[2]=P*v[ne+6],H[3]=U*v[ne+6],Y[0]=M*v[ne+1]+D*v[ne+3]+B*v[ne+5]+q*v[ne+7],Y[1]=D*v[ne+1]-q*v[ne+3]-M*v[ne+5]-B*v[ne+7],Y[2]=B*v[ne+1]-M*v[ne+3]+q*v[ne+5]+D*v[ne+7],Y[3]=q*v[ne+1]-B*v[ne+3]+D*v[ne+5]-M*v[ne+7],$[0]=m*(v[ne+0]+v[ne+4]),$[3]=m*(v[ne+0]-v[ne+4]),$[1]=H[0]+H[3],$[2]=H[1]-H[2],oe[0]=$[0]+$[1],oe[1]=$[3]+$[2],oe[2]=$[3]-$[2],oe[3]=$[0]-$[1],v[ne+0]=oe[0]+Y[0],v[ne+1]=oe[1]+Y[1],v[ne+2]=oe[2]+Y[2],v[ne+3]=oe[3]+Y[3],v[ne+4]=oe[3]-Y[3],v[ne+5]=oe[2]-Y[2],v[ne+6]=oe[1]-Y[1],v[ne+7]=oe[0]-Y[0]}for(let te=0;te<8;++te)H[0]=P*v[16+te],H[1]=U*v[16+te],H[2]=P*v[48+te],H[3]=U*v[48+te],Y[0]=M*v[8+te]+D*v[24+te]+B*v[40+te]+q*v[56+te],Y[1]=D*v[8+te]-q*v[24+te]-M*v[40+te]-B*v[56+te],Y[2]=B*v[8+te]-M*v[24+te]+q*v[40+te]+D*v[56+te],Y[3]=q*v[8+te]-B*v[24+te]+D*v[40+te]-M*v[56+te],$[0]=m*(v[te]+v[32+te]),$[3]=m*(v[te]-v[32+te]),$[1]=H[0]+H[3],$[2]=H[1]-H[2],oe[0]=$[0]+$[1],oe[1]=$[3]+$[2],oe[2]=$[3]-$[2],oe[3]=$[0]-$[1],v[0+te]=oe[0]+Y[0],v[8+te]=oe[1]+Y[1],v[16+te]=oe[2]+Y[2],v[24+te]=oe[3]+Y[3],v[32+te]=oe[3]-Y[3],v[40+te]=oe[2]-Y[2],v[48+te]=oe[1]-Y[1],v[56+te]=oe[0]-Y[0]}function Gt(v){for(let m=0;m<64;++m){let M=v[0][m],P=v[1][m],D=v[2][m];v[0][m]=M+1.5747*D,v[1][m]=M-.1873*P-.4682*D,v[2][m]=M+1.8556*P}}function X(v,m,M){for(let P=0;P<64;++P)m[M+P]=vt.toHalfFloat(en(v[P]))}function en(v){return v<=1?Math.sign(v)*Math.pow(Math.abs(v),2.2):Math.sign(v)*Math.pow(R,Math.abs(v)-1)}function gt(v){return new DataView(v.array.buffer,v.offset.value,v.size)}function z(v){let m=v.viewer.buffer.slice(v.offset.value,v.offset.value+v.size),M=new Uint8Array(At(m)),P=new Uint8Array(M.length);return it(M),ht(M,P),new DataView(P.buffer)}function A(v){let m=v.array.slice(v.offset.value,v.offset.value+v.size),M=Rs(m),P=new Uint8Array(M.length);return it(M),ht(M,P),new DataView(P.buffer)}function Z(v){let m=v.viewer,M={value:v.offset.value},P=new Uint16Array(v.columns*v.lines*(v.inputChannels.length*v.type)),D=new Uint8Array(8192),B=0,U=new Array(v.inputChannels.length);for(let ge=0,pe=v.inputChannels.length;ge<pe;ge++)U[ge]={},U[ge].start=B,U[ge].end=U[ge].start,U[ge].nx=v.columns,U[ge].ny=v.lines,U[ge].size=v.type,B+=U[ge].nx*U[ge].ny*U[ge].size;let q=ue(m,M),H=ue(m,M);if(H>=8192)throw new Error("THREE.EXRLoader: Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");if(q<=H)for(let ge=0;ge<H-q+1;ge++)D[ge+q]=Be(m,M);let Y=new Uint16Array(65536),$=F(D,Y),oe=_e(m,M);Ye(v.array,m,M,oe,P,B);for(let ge=0;ge<v.inputChannels.length;++ge){let pe=U[ge];for(let me=0;me<U[ge].size;++me)We(P,pe.start+me,pe.nx,pe.size,pe.ny,pe.nx*pe.size,$)}Pt(Y,P,B);let te=0,ne=new Uint8Array(P.buffer.byteLength);for(let ge=0;ge<v.lines;ge++)for(let pe=0;pe<v.inputChannels.length;pe++){let me=U[pe],Se=me.nx*me.size,Ge=new Uint8Array(P.buffer,me.end*2,Se*2);ne.set(Ge,te),te+=Se*2,me.end+=Se}return new DataView(ne.buffer)}function j(v){let m=v.array.slice(v.offset.value,v.offset.value+v.size),M=Rs(m),P=v.inputChannels.length*v.lines*v.columns*v.totalBytes,D=new ArrayBuffer(P),B=new DataView(D),U=0,q=0,H=new Array(4);for(let Y=0;Y<v.lines;Y++)for(let $=0;$<v.inputChannels.length;$++){let oe=0;switch(v.inputChannels[$].pixelType){case 1:H[0]=U,H[1]=H[0]+v.columns,U=H[1]+v.columns;for(let ne=0;ne<v.columns;++ne){let ge=M[H[0]++]<<8|M[H[1]++];oe+=ge,B.setUint16(q,oe,!0),q+=2}break;case 2:H[0]=U,H[1]=H[0]+v.columns,H[2]=H[1]+v.columns,U=H[2]+v.columns;for(let ne=0;ne<v.columns;++ne){let ge=M[H[0]++]<<24|M[H[1]++]<<16|M[H[2]++]<<8;oe+=ge,B.setUint32(q,oe,!0),q+=4}break}}return B}function se(v){let m=v.array,M=v.offset.value,P=v.columns,D=v.lines,B=v.inputChannels,U=v.totalBytes,q=tn.compression==="B44A_COMPRESSION",H=new Uint8Array(D*P*U),Y=new Uint16Array(16),$=0;for(let oe=0;oe<B.length;oe++){let te=B[oe],ne=te.pixelType*2,ge=Math.ceil(P/te.xSampling),pe=Math.ceil(D/te.ySampling),me=te.xSampling===1&&te.ySampling===1;if(te.pixelType!==1){for(let fe=0;fe<pe;fe++)if(me){let Ze=fe*P*U+$*P;for(let xe=0;xe<ge*ne;xe++)H[Ze+xe]=m[M++]}else M+=ge*ne;$+=ne;continue}let Se=Math.ceil(ge/4),Ge=Math.ceil(pe/4);for(let fe=0;fe<Ge;fe++)for(let Ze=0;Ze<Se;Ze++){if(q&&m[M+2]>=52){let xe=m[M]<<8|m[M+1],Me=xe&32768?xe&32767:~xe&65535;Y.fill(Me),M+=3}else{let xe=m[M]<<8|m[M+1],Me=m[M+2]>>2,Fe=32<<Me,ft=xe+((m[M+2]<<4|m[M+3]>>4)&63)*(1<<Me)-Fe&65535,ot=ft+((m[M+3]<<2|m[M+4]>>6)&63)*(1<<Me)-Fe&65535,De=ot+(m[M+4]&63)*(1<<Me)-Fe&65535,Ve=xe+(m[M+5]>>2&63)*(1<<Me)-Fe&65535,Ct=ft+((m[M+5]<<4|m[M+6]>>4)&63)*(1<<Me)-Fe&65535,at=ot+((m[M+6]<<2|m[M+7]>>6)&63)*(1<<Me)-Fe&65535,mt=De+(m[M+7]&63)*(1<<Me)-Fe&65535,fn=Ve+(m[M+8]>>2&63)*(1<<Me)-Fe&65535,hi=Ct+((m[M+8]<<4|m[M+9]>>4)&63)*(1<<Me)-Fe&65535,Ps=at+((m[M+9]<<2|m[M+10]>>6)&63)*(1<<Me)-Fe&65535,jn=mt+(m[M+10]&63)*(1<<Me)-Fe&65535,ir=fn+(m[M+11]>>2&63)*(1<<Me)-Fe&65535,Ko=hi+((m[M+11]<<4|m[M+12]>>4)&63)*(1<<Me)-Fe&65535,Qo=Ps+((m[M+12]<<2|m[M+13]>>6)&63)*(1<<Me)-Fe&65535,jo=jn+(m[M+13]&63)*(1<<Me)-Fe&65535,Ds=[xe,Ve,fn,ir,ft,Ct,hi,Ko,ot,at,Ps,Qo,De,mt,jn,jo];for(let Cr=0;Cr<16;Cr++)Y[Cr]=Ds[Cr]&32768?Ds[Cr]&32767:~Ds[Cr]&65535;M+=14}if(te.pLinear){if(I===null){I=new Uint16Array(65536);for(let xe=0;xe<65536;xe++)if((xe&31744)===31744||xe>32768)I[xe]=0;else{let Me=ee(xe);I[xe]=Me<=0?0:vt.toHalfFloat(8*Math.log(Me))}}for(let xe=0;xe<16;xe++)Y[xe]=I[Y[xe]]}for(let xe=0;xe<4;xe++){let Me=fe*4+xe;if(!(Me>=pe))for(let Fe=0;Fe<4;Fe++){let ft=Ze*4+Fe;if(ft>=ge)continue;let ot=Y[xe*4+Fe];for(let De=0;De<te.ySampling;De++){let Ve=Me*te.ySampling+De;if(!(Ve>=D))for(let Ct=0;Ct<te.xSampling;Ct++){let at=ft*te.xSampling+Ct;if(at>=P)continue;let mt=Ve*P*U+$*P+at*2;H[mt]=ot&255,H[mt+1]=ot>>8&255}}}}}$+=2}return new DataView(H.buffer)}function ye(v){let m=v.viewer,M={value:v.offset.value},P=new Uint8Array(v.columns*v.lines*(v.inputChannels.length*v.type*2)),D={version:Ne(m,M),unknownUncompressedSize:Ne(m,M),unknownCompressedSize:Ne(m,M),acCompressedSize:Ne(m,M),dcCompressedSize:Ne(m,M),rleCompressedSize:Ne(m,M),rleUncompressedSize:Ne(m,M),rleRawSize:Ne(m,M),totalAcUncompressedCount:Ne(m,M),totalDcUncompressedCount:Ne(m,M),acCompression:Ne(m,M)};if(D.version<2)throw new Error("THREE.EXRLoader: "+tn.compression+" version "+D.version+" is unsupported");let B=new Array,U=ue(m,M)-2;for(;U>0;){let pe=be(m.buffer,M),me=Be(m,M),Se=me>>2&3,Ge=(me>>4)-1,fe=new Int8Array([Ge])[0],Ze=Be(m,M);B.push({name:pe,index:fe,type:Ze,compression:Se}),U-=pe.length+3}let q=tn.channels,H=new Array(v.inputChannels.length);for(let pe=0;pe<v.inputChannels.length;++pe){let me=H[pe]={},Se=q[pe];me.name=Se.name,me.compression=0,me.decoded=!1,me.type=Se.pixelType,me.pLinear=Se.pLinear,me.width=v.columns,me.height=v.lines}let Y={idx:new Array(3)};for(let pe=0;pe<v.inputChannels.length;++pe){let me=H[pe],Se=me.name.lastIndexOf("."),Ge=Se>=0?me.name.substring(Se+1):me.name;for(let fe=0;fe<B.length;++fe){let Ze=B[fe];Ge===Ze.name&&me.type===Ze.type&&(me.compression=Ze.compression,Ze.index>=0&&(Y.idx[Ze.index]=pe),me.offset=pe)}}let $,oe,te;if(D.acCompressedSize>0)switch(D.acCompression){case 0:$=new Uint16Array(D.totalAcUncompressedCount),Ye(v.array,m,M,D.acCompressedSize,$,D.totalAcUncompressedCount);break;case 1:let pe=v.array.slice(M.value,M.value+D.totalAcUncompressedCount),me=Rs(pe);$=new Uint16Array(me.buffer),M.value+=D.totalAcUncompressedCount;break}if(D.dcCompressedSize>0){let pe={array:v.array,offset:M,size:D.dcCompressedSize};oe=new Uint16Array(A(pe).buffer),M.value+=D.dcCompressedSize}if(D.rleRawSize>0){let pe=v.array.slice(M.value,M.value+D.rleCompressedSize),me=Rs(pe);te=At(me.buffer),M.value+=D.rleCompressedSize}let ne=0,ge=new Array(H.length);for(let pe=0;pe<ge.length;++pe)ge[pe]=new Array;for(let pe=0;pe<v.lines;++pe)for(let me=0;me<H.length;++me)ge[me].push(ne),ne+=H[me].width*v.type*2;Y.idx[0]!==void 0&&H[Y.idx[0]]&&ct(Y,ge,H,$,oe,P);for(let pe=0;pe<H.length;++pe){let me=H[pe];if(!me.decoded)switch(me.compression){case 2:let Se=0,Ge=0;for(let fe=0;fe<v.lines;++fe){let Ze=ge[pe][Se];for(let xe=0;xe<me.width;++xe){for(let Me=0;Me<2*me.type;++Me)P[Ze++]=te[Ge+Me*me.width*me.height];Ge++}Se++}break;case 1:Bt(pe,ge,H,$,oe,P);break;default:throw new Error("THREE.EXRLoader: unsupported channel compression")}}return new DataView(P.buffer)}function be(v,m){let M=new Uint8Array(v),P=0;for(;M[m.value+P]!=0;)P+=1;let D=new TextDecoder().decode(M.slice(m.value,m.value+P));return m.value=m.value+P+1,D}function ae(v,m,M){let P=new TextDecoder().decode(new Uint8Array(v).slice(m.value,m.value+M));return m.value=m.value+M,P}function he(v,m){let M=Le(v,m),P=_e(v,m);return[M,P]}function Ae(v,m){let M=_e(v,m),P=_e(v,m);return[M,P]}function Le(v,m){let M=v.getInt32(m.value,!0);return m.value=m.value+4,M}function _e(v,m){let M=v.getUint32(m.value,!0);return m.value=m.value+4,M}function we(v,m){let M=v[m.value];return m.value=m.value+1,M}function Be(v,m){let M=v.getUint8(m.value);return m.value=m.value+1,M}let Ne=function(v,m){let M=Number(v.getBigInt64(m.value,!0));return m.value+=8,M};function ke(v,m){let M=v.getFloat32(m.value,!0);return m.value+=4,M}function G(v,m){return vt.toHalfFloat(ke(v,m))}function ee(v){let m=(v&31744)>>10,M=v&1023;return(v>>15?-1:1)*(m?m===31?M?NaN:1/0:Math.pow(2,m-15)*(1+M/1024):6103515625e-14*(M/1024))}function ue(v,m){let M=v.getUint16(m.value,!0);return m.value+=2,M}function Ee(v,m){return ee(ue(v,m))}function Pe(v,m,M,P){let D=M.value,B=[];for(;M.value<D+P-1;){let U=be(m,M),q=Le(v,M),H=Be(v,M);M.value+=3;let Y=Le(v,M),$=Le(v,M);B.push({name:U,pixelType:q,pLinear:H,xSampling:Y,ySampling:$})}return M.value+=1,B}function de(v,m){let M=ke(v,m),P=ke(v,m),D=ke(v,m),B=ke(v,m),U=ke(v,m),q=ke(v,m),H=ke(v,m),Y=ke(v,m);return{redX:M,redY:P,greenX:D,greenY:B,blueX:U,blueY:q,whiteX:H,whiteY:Y}}function He(v,m){let M=["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"],P=Be(v,m);return M[P]}function ze(v,m){let M=Le(v,m),P=Le(v,m),D=Le(v,m),B=Le(v,m);return{xMin:M,yMin:P,xMax:D,yMax:B}}function Dt(v,m){let M=["INCREASING_Y","DECREASING_Y","RANDOM_Y"],P=Be(v,m);return M[P]}function yt(v,m){let M=["ENVMAP_LATLONG","ENVMAP_CUBE"],P=Be(v,m);return M[P]}function Ln(v,m){let M=["ONE_LEVEL","MIPMAP_LEVELS","RIPMAP_LEVELS"],P=["ROUND_DOWN","ROUND_UP"],D=_e(v,m),B=_e(v,m),U=Be(v,m);return{xSize:D,ySize:B,levelMode:M[U&15],roundingMode:P[U>>4]}}function kn(v,m){let M=ke(v,m),P=ke(v,m);return[M,P]}function jc(v,m){let M=ke(v,m),P=ke(v,m),D=ke(v,m);return[M,P,D]}function eu(v,m,M,P,D){if(P==="string"||P==="stringvector"||P==="iccProfile")return ae(m,M,D);if(P==="chlist")return Pe(v,m,M,D);if(P==="chromaticities")return de(v,M);if(P==="compression")return He(v,M);if(P==="box2i")return ze(v,M);if(P==="envmap")return yt(v,M);if(P==="tiledesc")return Ln(v,M);if(P==="lineOrder")return Dt(v,M);if(P==="float")return ke(v,M);if(P==="v2f")return kn(v,M);if(P==="v3f")return jc(v,M);if(P==="int")return Le(v,M);if(P==="rational")return he(v,M);if(P==="timecode")return Ae(v,M);if(P==="preview"||P==="deepImageState"||P==="idmanifest")return M.value+=D,"skipped";M.value+=D}function Go(v,m){let M=Math.log2(v);return m=="ROUND_DOWN"?Math.floor(M):Math.ceil(M)}function Cs(v,m,M){let P=0;switch(v.levelMode){case"ONE_LEVEL":P=1;break;case"MIPMAP_LEVELS":P=Go(Math.max(m,M),v.roundingMode)+1;break;case"RIPMAP_LEVELS":throw new Error("THREE.EXRLoader: RIPMAP_LEVELS tiles currently unsupported.")}return P}function Wo(v,m,M,P){let D=new Array(v);for(let B=0;B<v;B++){let U=1<<B,q=m/U|0;P=="ROUND_UP"&&q*U<m&&(q+=1);let H=Math.max(q,1);D[B]=(H+M-1)/M|0}return D}function Xo(){let v=this,m=v.offset,M={value:0};for(let P=0;P<v.tileCount;P++){let D=Le(v.viewer,m),B=Le(v.viewer,m);m.value+=8,v.size=_e(v.viewer,m);let U=D*v.blockWidth,q=B*v.blockHeight;v.columns=U+v.blockWidth>v.width?v.width-U:v.blockWidth,v.lines=q+v.blockHeight>v.height?v.height-q:v.blockHeight;let H=v.columns*v.totalBytes,$=v.size<v.lines*H?v.uncompress(v):gt(v);m.value+=v.size;for(let oe=0;oe<v.lines;oe++){let te=oe*v.columns*v.totalBytes;for(let ne=0;ne<v.inputChannels.length;ne++){let ge=tn.channels[ne].name,pe=v.channelByteOffsets[ge]*v.columns,me=v.decodeChannels[ge];if(me===void 0)continue;M.value=te+pe;let Se=(v.height-(1+q+oe))*v.outLineWidth;for(let Ge=0;Ge<v.columns;Ge++){let fe=Se+(Ge+U)*v.outputChannels+me;v.byteArray[fe]=v.getter($,M)}}}}}function qo(){let v=this,m=v.offset,M={value:0};for(let P=0;P<v.height/v.blockHeight;P++){let D=Le(v.viewer,m)-tn.dataWindow.yMin;v.size=_e(v.viewer,m),v.lines=D+v.blockHeight>v.height?v.height-D:v.blockHeight;let B=v.columns*v.totalBytes,q=v.size<v.lines*B?v.uncompress(v):gt(v);m.value+=v.size;for(let H=0;H<v.lines;H++){let Y=D+H,$=H*B,oe=(v.height-1-Y)*v.outLineWidth;for(let te=0;te<v.inputChannels.length;te++){let ne=tn.channels[te].name,ge=v.channelByteOffsets[ne]*v.columns,pe=v.decodeChannels[ne];if(pe!==void 0){M.value=$+ge;for(let me=0;me<v.columns;me++){let Se=oe+me*v.outputChannels+pe;v.byteArray[Se]=v.getter(q,M)}}}}}}function ci(){let v=this,m=v.chunkOffsets,M={value:0};for(let P=0;P<m.length;P++){let D={value:m[P]};D.value+=4;let B=Le(v.viewer,D)-tn.dataWindow.yMin;v.size=_e(v.viewer,D),v.lines=B+v.blockHeight>v.height?v.height-B:v.blockHeight;let U=v.columns*v.totalBytes,q=v.size<v.lines*U,H=v.offset;v.offset=D;let Y=q?v.uncompress(v):gt(v);v.offset=H;for(let $=0;$<v.lines;$++){let oe=B+$,te=$*U,ne=(v.height-1-oe)*v.outLineWidth;for(let ge=0;ge<v.inputChannels.length;ge++){let pe=tn.channels[ge].name,me=v.channelByteOffsets[pe]*v.columns,Se=v.decodeChannels[pe];if(Se!==void 0){M.value=te+me;for(let Ge=0;Ge<v.columns;Ge++){let fe=ne+Ge*v.outputChannels+Se;v.byteArray[fe]=v.getter(Y,M)}}}}}}function Ar(v,m,M,P){if(M===0)return null;let D=v.slice(m,m+M);switch(P){case"NO_COMPRESSION":return new DataView(D.buffer,D.byteOffset,D.byteLength);case"RLE_COMPRESSION":{let B=new Uint8Array(At(D.buffer.slice(D.byteOffset,D.byteOffset+D.byteLength))),U=new Uint8Array(B.length);return it(B),ht(B,U),new DataView(U.buffer)}case"ZIPS_COMPRESSION":{let B=Rs(D),U=new Uint8Array(B.length);return it(B),ht(B,U),new DataView(U.buffer)}default:throw new Error("THREE.EXRLoader: "+P+" is unsupported for deep data")}}function Yo(){let v=this,m=v.chunkOffsets,M=v.width,P=v.height,D=v.deepChannels,B=tn.compression,U=v.multiPart,q=v.decodeChannels,H=v.outputChannels,Y=v.byteArray instanceof Uint16Array,$=-1;for(let oe=0;oe<D.length;oe++)if(D[oe].name==="A"){$=oe;break}for(let oe=0;oe<m.length;oe++){let te={value:m[oe]};U&&(te.value+=4);let ne=Le(v.viewer,te)-tn.dataWindow.yMin,ge=Ne(v.viewer,te),pe=Ne(v.viewer,te);Ne(v.viewer,te);let me=Ar(v.array,te.value,ge,B);if(te.value+=ge,me===null)continue;let Se=new Uint32Array(M);for(let Fe=0;Fe<M;Fe++)Se[Fe]=me.getUint32(Fe*4,!0);let Ge=Se[M-1];if(Ge===0){te.value+=pe;continue}let fe=Ar(v.array,te.value,pe,B),Ze=[],xe=0;for(let Fe=0;Fe<D.length;Fe++)Ze.push(xe),xe+=Ge*D[Fe].bytesPerSample;let Me=(P-1-ne)*v.outLineWidth;for(let Fe=0;Fe<M;Fe++){let ft=Fe===0?0:Se[Fe-1],De=Se[Fe]-ft;if(De===0)continue;let Ve=new Float32Array(H),Ct=0;for(let mt=0;mt<De;mt++){let fn=ft+mt,hi=1-Ct;if(hi<=0)break;let Ps=1;if($>=0){let jn=D[$].bytesPerSample,ir=Ze[$]+fn*jn;Ps=jn===2?ee(fe.getUint16(ir,!0)):fe.getFloat32(ir,!0)}for(let jn=0;jn<D.length;jn++){let ir=D[jn],Ko=q[ir.name];if(Ko===void 0)continue;let Qo=ir.bytesPerSample,jo=Ze[jn]+fn*Qo,Ds=Qo===2?ee(fe.getUint16(jo,!0)):fe.getFloat32(jo,!0);Ve[Ko]+=Ds*hi}Ct+=Ps*hi}q.A!==void 0&&(Ve[q.A]=Ct);let at=Me+Fe*H;for(let mt=0;mt<H;mt++)v.byteArray[at+mt]=Y?vt.toHalfFloat(Ve[mt]):Ve[mt]}}}function Is(v,m,M){let P={},D=!1;for(;;){let B=be(m,M);if(B==="")break;D=!0;let U=be(m,M),q=_e(v,M),H=eu(v,m,M,U,q);H===void 0?console.warn(`THREE.EXRLoader: Skipped unknown header attribute type '${U}'.`):P[B]=H}return D?P:null}function Er(v,m,M){if(v.getUint32(0,!0)!=20000630)throw new Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");let P=v.getUint8(4),D=v.getUint8(5),B={singleTile:!!(D&2),longName:!!(D&4),deepFormat:!!(D&8),multiPart:!!(D&16)};M.value=8;let U=[];if(B.multiPart){for(;;){let q=Is(v,m,M);if(q===null)break;q.version=P,q.spec=B,U.push(q)}if(U.length===0)throw new Error("THREE.EXRLoader: No valid part headers found.")}else{let q=Is(v,m,M);q.version=P,q.spec=B,U.push(q)}return U}function Zo(v,m,M,P,D,B){let U={size:0,viewer:m,array:M,offset:P,width:v.dataWindow.xMax-v.dataWindow.xMin+1,height:v.dataWindow.yMax-v.dataWindow.yMin+1,inputChannels:v.channels,channelByteOffsets:{},shouldExpand:!1,yCbCr:!1,totalBytes:null,columns:null,lines:null,type:null,uncompress:null,getter:null,format:null,colorSpace:dn};switch(v.compression){case"NO_COMPRESSION":U.blockHeight=1,U.uncompress=gt;break;case"RLE_COMPRESSION":U.blockHeight=1,U.uncompress=z;break;case"ZIPS_COMPRESSION":U.blockHeight=1,U.uncompress=A;break;case"ZIP_COMPRESSION":U.blockHeight=16,U.uncompress=A;break;case"PIZ_COMPRESSION":U.blockHeight=32,U.uncompress=Z;break;case"PXR24_COMPRESSION":U.blockHeight=16,U.uncompress=j;break;case"B44_COMPRESSION":case"B44A_COMPRESSION":U.blockHeight=32,U.uncompress=se;break;case"DWAA_COMPRESSION":U.blockHeight=32,U.uncompress=ye;break;case"DWAB_COMPRESSION":U.blockHeight=256,U.uncompress=ye;break;default:throw new Error("THREE.EXRLoader: "+v.compression+" is unsupported")}let q={};for(let te of v.channels)switch(te.name){case"BY":case"RY":case"Y":case"R":case"G":case"B":case"A":q[te.name]=!0,U.type=te.pixelType}let H=!1,Y=!1;if(q.Y&&q.RY&&q.BY)U.outputChannels=4,U.yCbCr=!0;else if(q.R&&q.G&&q.B)U.outputChannels=4;else if(q.Y)U.outputChannels=1;else throw new Error("THREE.EXRLoader: file contains unsupported data channels.");switch(U.outputChannels){case 4:B==Xe?(H=!q.A,U.format=Xe,U.colorSpace=dn,U.outputChannels=4,U.decodeChannels={R:0,G:1,B:2,A:3}):B==cn?(U.format=cn,U.colorSpace=dn,U.outputChannels=2,U.decodeChannels={R:0,G:1}):B==An?(U.format=An,U.colorSpace=dn,U.outputChannels=1,U.decodeChannels={R:0}):Y=!0;break;case 1:B==Xe?(H=!0,U.format=Xe,U.colorSpace=dn,U.outputChannels=4,U.shouldExpand=!0,U.decodeChannels={Y:0}):B==cn?(U.format=cn,U.colorSpace=dn,U.outputChannels=2,U.shouldExpand=!0,U.decodeChannels={Y:0}):B==An?(U.format=An,U.colorSpace=dn,U.outputChannels=1,U.decodeChannels={Y:0}):Y=!0;break;default:Y=!0}if(Y)throw new Error("THREE.EXRLoader: invalid output format for specified file.");if(U.yCbCr&&(U.format=Xe,U.outputChannels=4,U.decodeChannels={Y:0,RY:1,BY:2},H=!0),U.type==1)switch(D){case nt:U.getter=Ee;break;case ut:U.getter=ue;break}else if(U.type==2)switch(D){case nt:U.getter=ke;break;case ut:U.getter=G}else throw new Error("THREE.EXRLoader: unsupported pixelType "+U.type+" for "+v.compression+".");U.columns=U.width;let $=U.width*U.height*U.outputChannels;switch(D){case nt:U.byteArray=new Float32Array($),H&&U.byteArray.fill(1,0,$);break;case ut:U.byteArray=new Uint16Array($),H&&U.byteArray.fill(15360,0,$);break;default:console.error("THREE.EXRLoader: unsupported type: ",D);break}let oe=0;for(let te of v.channels)U.decodeChannels[te.name]!==void 0&&(U.channelByteOffsets[te.name]=oe),oe+=te.pixelType*2;if(U.totalBytes=oe,U.outLineWidth=U.width*U.outputChannels,v.spec.deepFormat){U.deepChannels=[];let te=0;for(let ne of v.channels){let ge=ne.pixelType===0?4:ne.pixelType*2;U.deepChannels.push({name:ne.name,pixelType:ne.pixelType,bytesPerSample:ge}),te+=ge}U.deepBytesPerSample=te,U.chunkOffsets=v._chunkOffsets,U.multiPart=v.spec.multiPart,U.decode=Yo.bind(U)}else if(v.spec.singleTile){U.blockHeight=v.tiles.ySize,U.blockWidth=v.tiles.xSize;let te=Cs(v.tiles,U.width,U.height),ne=Wo(te,U.width,v.tiles.xSize,v.tiles.roundingMode),ge=Wo(te,U.height,v.tiles.ySize,v.tiles.roundingMode);U.tileCount=ne[0]*ge[0];for(let pe=0;pe<te;pe++)for(let me=0;me<ge[pe];me++)for(let Se=0;Se<ne[pe];Se++)Ne(m,P);U.decode=Xo.bind(U)}else if(v.spec.multiPart)U.blockWidth=U.width,U.chunkOffsets=v._chunkOffsets,U.decode=ci.bind(U);else{U.blockWidth=U.width;let te=Math.ceil(U.height/U.blockHeight);for(let ne=0;ne<te;ne++)Ne(m,P);U.decode=qo.bind(U)}return U}let ui={value:0},nr=new DataView(e),$o=new Uint8Array(e),Rr=Er(nr,e,ui),Jo=Math.max(0,Math.min(this.part,Rr.length-1)),tn=Rr[Jo];if(tn.spec.multiPart||tn.spec.deepFormat)for(let v=0;v<Rr.length;v++){let m=Rr[v].chunkCount;if(v===Jo){tn._chunkOffsets=[];for(let M=0;M<m;M++)tn._chunkOffsets.push(Ne(nr,ui))}else for(let M=0;M<m;M++)Ne(nr,ui)}let Rn=Zo(tn,nr,$o,ui,this.type,this.outputFormat);if(Rn.decode(),Rn.shouldExpand){let v=Rn.byteArray;if(this.outputFormat==Xe)for(let m=0;m<v.length;m+=4)v[m+2]=v[m+1]=v[m];else if(this.outputFormat==cn)for(let m=0;m<v.length;m+=2)v[m+1]=v[m]}if(Rn.yCbCr){let v=Rn.byteArray,m=Rn.width*Rn.height;if(this.type===ut)for(let M=0;M<m;M++){let P=M*4,D=ee(v[P]),B=ee(v[P+1]),U=ee(v[P+2]),q=(1+B)*D,H=(1+U)*D,Y=(D-q*.2126-H*.0722)/.7152;v[P]=vt.toHalfFloat(Math.max(0,q)),v[P+1]=vt.toHalfFloat(Math.max(0,Y)),v[P+2]=vt.toHalfFloat(Math.max(0,H))}else for(let M=0;M<m;M++){let P=M*4,D=v[P],B=v[P+1],U=v[P+2],q=(1+B)*D,H=(1+U)*D;v[P]=Math.max(0,q),v[P+1]=Math.max(0,(D-q*.2126-H*.0722)/.7152),v[P+2]=Math.max(0,H)}}return{header:tn,width:Rn.width,height:Rn.height,data:Rn.byteArray,format:Rn.format,colorSpace:Rn.colorSpace,type:this.type,minFilter:st,magFilter:st,generateMipmaps:!1,flipY:!1}}setDataType(e){return this.type=e,this}setOutputFormat(e){return this.outputFormat=e,this}setPart(e){return this.part=e,this}};var sb={WebGLRenderer:zl,Scene:cr,Group:_i,Mesh:on,BufferGeometry:Ft,BufferAttribute:xt,MeshPhysicalMaterial:Qs,MeshStandardMaterial:Qr,DataTexture:It,Color:Ke,Matrix4:$e,Vector2:Oe,Vector3:k,PlaneGeometry:hr,CircleGeometry:Js,LatheGeometry:Ks,RGBAFormat:Xe,FloatType:nt,HalfFloatType:ut,LinearFilter:st,EquirectangularReflectionMapping:ri,RepeatWrapping:sn,ClampToEdgeWrapping:Lt,DoubleSide:_n,FrontSide:Tn,SRGBColorSpace:Sn,LinearSRGBColorSpace:dn,NoToneMapping:wn,ACESFilmicToneMapping:ao,ReinhardToneMapping:so,CineonToneMapping:oo,AgXToneMapping:lo,NeutralToneMapping:co,REVISION:"186",OrthographicCamera:bi,WebGLRenderTarget:kt,ShaderMaterial:Ht};return ag(ob);})();
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
