// Serveur statique minimal pour les tests navigateur (aucune dépendance) :
// sert la racine du dépôt en http://127.0.0.1:<port>/ avec les bons types MIME
// (application/wasm pour le noyau OCCT, text/javascript pour l'import ESM).
// Usage : node tests/browser/serveur.cjs [port]   (défaut 3123, ou $MF_PORT)
'use strict';
const http=require('http'),fs=require('fs'),path=require('path');

const RACINE=path.resolve(__dirname,'..','..');
const PORT=+(process.argv[2]||process.env.MF_PORT||3123);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.wasm':'application/wasm','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml',
  '.miniFusion':'application/json','.step':'application/octet-stream','.stp':'application/octet-stream'};

http.createServer((req,res)=>{
  let p;
  try{p=decodeURIComponent(new URL(req.url,'http://x').pathname);}catch(e){res.writeHead(400);res.end();return;}
  if(p==='/')p='/fusion_mvp.html';
  const f=path.join(RACINE,p);
  if(!f.startsWith(RACINE)){res.writeHead(403);res.end();return;}
  fs.stat(f,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);res.end('introuvable : '+p);return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Content-Length':st.size,'Cache-Control':'no-store'});
    fs.createReadStream(f).pipe(res);
  });
}).listen(PORT,'127.0.0.1',()=>console.log('[serveur] http://127.0.0.1:'+PORT+'/ → '+RACINE));
