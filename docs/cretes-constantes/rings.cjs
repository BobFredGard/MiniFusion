const P=JSON.parse(require('fs').readFileSync('cav_pts.json'));
const runs=[];let cur=[];
for(const p of P){ if(p.r){ if(cur.length)runs.push(cur);cur=[];continue;} cur.push(p);}
if(cur.length)runs.push(cur);
const out=[];
runs.forEach((run,ri)=>{let s=0;const cum=[0];for(let i=1;i<run.length;i++)cum[i]=cum[i-1]+Math.hypot(run[i].x-run[i-1].x,run[i].y-run[i-1].y,run[i].z-run[i-1].z);
 let i=s+1;
 while(i<run.length){let hit=-1;
  for(let k=s;k<run.length&&cum[k]-cum[s]<30;k++){ if(cum[i]-cum[k]<20)break; if(Math.hypot(run[i].x-run[k].x,run[i].y-run[k].y,run[i].z-run[k].z)<0.05){hit=k;break;}}
  if(hit>=0){ if(hit>s)out.push({ri,link:1,pts:run.slice(s,hit+1)}); out.push({ri,pts:run.slice(hit,i+1)}); s=i;}
  i++;}
 out.push({ri,open:1,pts:run.slice(s)});});
const area=pts=>{let a=0;for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];a+=p.x*q.y-q.x*p.y;}return a/2;};
const Lof=p=>p.reduce((a,q,k)=>k?a+Math.hypot(q.x-p[k-1].x,q.y-p[k-1].y,q.z-p[k-1].z):0,0);
out.forEach((r,i)=>{const p=r.pts;let zl=1e9,zh=-1e9;for(const q of p){zl=Math.min(zl,q.z);zh=Math.max(zh,q.z);}
 console.log(i,'run'+r.ri,r.open?'OPEN':r.link?'link':'ring','n='+p.length,'L='+Lof(p).toFixed(1),r.link?'':'A='+area(p).toFixed(0),'z['+zl.toFixed(2)+','+zh.toFixed(2)+']','s('+p[0].x.toFixed(2)+','+p[0].y.toFixed(2)+','+p[0].z.toFixed(2)+')');});
require('fs').writeFileSync('rings.json',JSON.stringify(out));
