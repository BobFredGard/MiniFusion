const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'fusion_mvp.html'),'utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/);
console.log('script trouvé :',!!m,'  longueur :',m?m[1].length:0);
if(m){
  try{new vm.Script(m[1],{filename:'app.js'});console.log('SYNTAXE OK');}
  catch(e){
    console.log('SYNTAXE KO : '+e.message);
    const st=(e.stack||'').split('\n').slice(0,6).join('\n');
    console.log(st);
    // ligne concernée
    const mm=/app\.js:(\d+)/.exec(e.stack||'');
    if(mm){
      const L=m[1].split(/\r?\n/);
      const n=+mm[1];
      console.log('--- autour de la ligne '+n+' ---');
      for(let i=Math.max(0,n-4);i<Math.min(L.length,n+3);i++)console.log((i+1)+': '+L[i].slice(0,120));
    }
  }
}