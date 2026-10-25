#!/usr/bin/env node
// Serveur MCP de MiniFusion (V0.8.5) — sans dépendance.
//
//   Claude (ou tout client MCP) ──stdio, JSON-RPC──▶ ce serveur ──WebSocket 127.0.0.1──▶ la page MiniFusion
//
// La page se relie au serveur quand l'utilisateur clique « 🔌 Pilotage (MCP)… » (menu Projet) ;
// le serveur lui transmet des scripts JSON (53-scripts.js) et rend leurs résultats.
// Outils : minifusion_run_script, minifusion_info, minifusion_commands.
//
// Installation (Claude Code) :  claude mcp add minifusion -- node <chemin>/tools/mcp-minifusion.cjs
// Port : MINIFUSION_PORT (47811 par défaut). Écoute sur 127.0.0.1 seulement.
'use strict';
const http=require('http'),crypto=require('crypto');
const PORT=+process.env.MINIFUSION_PORT||47811;
const VERSION='0.8.5';
const log=(...a)=>process.stderr.write('[minifusion-mcp] '+a.join(' ')+'\n');

/* ── WebSocket minimal (RFC 6455) : poignée de main, trames texte, ping / close ── */
let page=null;           // {sock, hello}
const pending=new Map(); // id → {resolve, timer}
let seq=0;
function wsSend(sock,text){
  const p=Buffer.from(text,'utf8'),n=p.length;
  let h;
  if(n<126)h=Buffer.from([0x81,n]);
  else if(n<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(n,2);}
  else{h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(n),2);}
  sock.write(Buffer.concat([h,p]));
}
function wsFrames(state,chunk,onText,onClose,sock){
  state.buf=Buffer.concat([state.buf,chunk]);
  for(;;){
    const b=state.buf;if(b.length<2)return;
    const op=b[0]&0x0f,fin=!!(b[0]&0x80),masked=!!(b[1]&0x80);let len=b[1]&0x7f,off=2;
    if(len===126){if(b.length<4)return;len=b.readUInt16BE(2);off=4;}
    else if(len===127){if(b.length<10)return;len=Number(b.readBigUInt64BE(2));off=10;}
    const mk=masked?b.slice(off,off+4):null;if(masked)off+=4;
    if(b.length<off+len)return;
    let data=b.slice(off,off+len);
    if(mk){data=Buffer.from(data);for(let i=0;i<data.length;i++)data[i]^=mk[i&3];}
    state.buf=b.slice(off+len);
    if(op===0x8){onClose();try{sock.end(Buffer.from([0x88,0]));}catch(e){}return;}
    if(op===0x9){try{sock.write(Buffer.concat([Buffer.from([0x8a,data.length]),data]));}catch(e){}continue;}
    if(op===0x1||op===0x0){state.parts.push(data);if(fin){onText(Buffer.concat(state.parts).toString('utf8'));state.parts=[];}}
  }
}
const server=http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/plain; charset=utf-8'});
  res.end('Serveur MCP MiniFusion '+VERSION+' — page '+(page?'reliée':'non reliée')+'\n');});
server.on('upgrade',(req,sock)=>{
  const key=req.headers['sec-websocket-key'];
  // origine : la page servie en local (http://localhost, file://, null) — jamais un site distant
  const org=String(req.headers.origin||'null');
  if(!key||!/^(null|file:\/\/.*|https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/.test(org)){sock.end('HTTP/1.1 403 Forbidden\r\n\r\n');log('refusé, origine',org);return;}
  const acc=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');
  if(page){try{page.sock.end();}catch(e){}}
  const me={sock,hello:null};page=me;
  const st={buf:Buffer.alloc(0),parts:[]};
  const gone=()=>{if(page===me){page=null;log('page déconnectée');}};
  sock.on('data',c=>wsFrames(st,c,txt=>{
    let m;try{m=JSON.parse(txt);}catch(e){return;}
    if(m.type==='hello'){me.hello=m;log('page reliée :',m.app,m.ver,'«',m.doc,'»');return;}
    if(m.type==='result'&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);p.resolve(m.result);}
  },gone,sock));
  sock.on('close',gone);sock.on('error',gone);
});
function toPage(msg,ms){
  return new Promise(resolve=>{
    if(!page){resolve({ok:false,error:'MiniFusion n’est pas relié : ouvrez MiniFusion dans Chrome, menu Projet → « 🔌 Pilotage (MCP)… ».'});return;}
    const id=++seq;msg.id=id;msg.type='run';
    const timer=setTimeout(()=>{pending.delete(id);resolve({ok:false,error:'pas de réponse de la page en '+(ms/1000)+' s'});},ms);
    pending.set(id,{resolve,timer});
    try{wsSend(page.sock,JSON.stringify(msg));}catch(e){clearTimeout(timer);pending.delete(id);resolve({ok:false,error:'envoi impossible : '+e.message});}
  });
}

/* ── MCP : JSON-RPC 2.0 sur stdio (une ligne par message) ── */
const COMMANDS=`Script MiniFusion = liste de commandes JSON exécutées dans l'ordre sur le document ouvert.
Le script est atomique : à la première erreur, le document revient tel qu'avant (le résultat donne le numéro de la commande et l'erreur). Une seule étape d'annulation (Ctrl+Z) pour tout le script. Unités : mm, degrés.
  {"op":"new","name":"Bride"}                                   nouveau document vide
  {"op":"param","name":"L","expr":"60"}                          paramètre ƒx (crée ou modifie ; expressions : "L/2+3", sqrt, sin…)
  {"op":"sketch","id":"s1","name":"Contour","plane":"XY","offset":0,"shapes":[...]}
       plane : XY, XZ ou YZ ; offset : décalage le long de la normale du plan
       shapes : {"rect":[x0,y0,x1,y1]} {"circle":[cx,cy,r]} {"poly":[[x,y],...]} {"line":[x1,y1,x2,y2]} (+ "construction":true)
       (un cercle à l'intérieur d'un rectangle fait un trou dans le profil)
  {"op":"extrude","sketch":"s1","distance":10,"cut":false,"symmetric":false,"name":"Plaque"}
  {"op":"revolve","sketch":"s1","axis":"Z","angle":360,"cut":false}
  {"op":"config","name":"Grande"}                               active une configuration (table de variantes)
  {"op":"info"}                                                 état : esquisses, fonctions, paramètres, corps (volume mm³, centre, boîte)
  {"op":"undo"}
Une commande vise une esquisse par l'"id" donné dans le script, son id réel ou son nom.`;
const TOOLS=[
  {name:'minifusion_run_script',description:'Exécute un script de commandes JSON dans MiniFusion (CAO paramétrique) : esquisses, extrusions, révolutions, paramètres, configurations. Atomique. Voir minifusion_commands pour la syntaxe.',
    inputSchema:{type:'object',properties:{commands:{type:'array',items:{type:'object'},description:'Liste de commandes {op, …}'}},required:['commands']}},
  {name:'minifusion_info',description:'État du document ouvert dans MiniFusion : esquisses, fonctions, paramètres, configurations, corps avec volume (mm³), centre de gravité et boîte englobante.',
    inputSchema:{type:'object',properties:{}}},
  {name:'minifusion_commands',description:'Syntaxe des scripts MiniFusion (liste des commandes et de leurs champs).',
    inputSchema:{type:'object',properties:{}}}
];
const txt=(o,err)=>({content:[{type:'text',text:typeof o==='string'?o:JSON.stringify(o,null,1)}],isError:!!err});
async function callTool(name,args){
  if(name==='minifusion_commands')return txt(COMMANDS);
  if(name==='minifusion_info'){const r=await toPage({info:true},30000);return txt(r.ok?r.results[0]:r.error,!r.ok);}
  if(name==='minifusion_run_script'){
    const cmds=args&&args.commands;if(!Array.isArray(cmds))return txt('« commands » : liste attendue',true);
    const r=await toPage({script:cmds},120000);
    return txt(r,!r.ok);
  }
  return txt('outil inconnu : '+name,true);
}
function reply(id,result){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,result})+'\n');}
function replyErr(id,code,message){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,error:{code,message}})+'\n');}
async function handle(m){
  if(!m||m.jsonrpc!=='2.0')return;
  const isReq=m.id!==undefined&&m.id!==null;
  try{
    switch(m.method){
      case 'initialize':
        return reply(m.id,{protocolVersion:(m.params&&m.params.protocolVersion)||'2025-06-18',capabilities:{tools:{}},
          serverInfo:{name:'minifusion',version:VERSION},
          instructions:'Pilote MiniFusion (CAO dans le navigateur). L’utilisateur doit relier la page : menu Projet → « 🔌 Pilotage (MCP)… ». Lire minifusion_commands avant d’écrire un script.'});
      case 'ping':return reply(m.id,{});
      case 'tools/list':return reply(m.id,{tools:TOOLS});
      case 'tools/call':return reply(m.id,await callTool(m.params&&m.params.name,(m.params&&m.params.arguments)||{}));
      default:
        if(isReq)return replyErr(m.id,-32601,'méthode inconnue : '+m.method);
    }
  }catch(e){if(isReq)replyErr(m.id,-32603,String(e&&e.message||e));}
}
let inBuf='';
process.stdin.setEncoding('utf8');
process.stdin.on('data',d=>{inBuf+=d;let i;while((i=inBuf.indexOf('\n'))>=0){const line=inBuf.slice(0,i).trim();inBuf=inBuf.slice(i+1);
  if(!line)continue;let m;try{m=JSON.parse(line);}catch(e){replyErr(null,-32700,'JSON illisible');continue;}handle(m);}});
process.stdin.on('end',()=>process.exit(0));
server.on('error',e=>{log('port',PORT,'indisponible :',e.message);});
server.listen(PORT,'127.0.0.1',()=>log('à l’écoute sur ws://127.0.0.1:'+PORT));
