const fs=require('fs');
const L=fs.readFileSync(process.argv[2],'utf8').split(/\r?\n/);
let x=0,y=0,z=0,mode=0;const P=[];// {x,y,z,r(rapid),ln}
for(const raw of L){const l=raw.replace(/^N\d+\s*/,'');if(!l||l[0]==';'||l[0]=='#'&&!/G0/.test(l))continue;
 if(/#MCS/.test(l))continue;
 const g=l.match(/G0?([0-3])(?![0-9])/);if(g)mode=+g[1];
 const v={};l.replace(/([XYZIJ])(-?[\d.]+)/g,(m,k,n)=>v[k]=+n);
 if(!('X'in v)&&!('Y'in v)&&!('Z'in v))continue;
 const nx='X'in v?v.X:x,ny='Y'in v?v.Y:y,nz='Z'in v?v.Z:z;
 if(mode===2||mode===3){const cx=x+(v.I||0),cy=y+(v.J||0);let a0=Math.atan2(y-cy,x-cx),a1=Math.atan2(ny-cy,nx-cx);const r=Math.hypot(x-cx,y-cy);
  let da=a1-a0; if(mode===2){while(da>=0)da-=2*Math.PI;}else{while(da<=0)da+=2*Math.PI;}
  const n=Math.max(2,Math.ceil(Math.abs(da)*r/0.5));for(let i=1;i<=n;i++){const a=a0+da*i/n;P.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),z:z+(nz-z)*i/n,r:0,arc:1});}}
 else P.push({x:nx,y:ny,z:nz,r:mode===0?1:0});
 x=nx;y=ny;z=nz;}
module.exports=P;
if(require.main===module){fs.writeFileSync('cav_pts.json',JSON.stringify(P));console.log(P.length);}
