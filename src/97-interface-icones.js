/* ---------- Style des icônes (V0.25.0) : choisi dans 🎨, à côté du thème ----------
   • trait   : icônes au trait monochromes (comme avant, défaut)
   • couleur : mêmes dessins, une couleur par FAMILLE (Esquisse vert, Créer bleu, Construire
               orange, Modifier violet…), pastille teintée derrière l'icône
   • fusion  : icônes DESSINÉES en volume (vue isométrique, faces ombrées, profil orange,
               flèches bleues), façon logiciel de CAO pro — MF_ICF, même clé que MF_IC
   • delire  : arc-en-ciel, yeux qui suivent la souris, gigue au survol, confettis au clic
   Rien n'est reconstruit : mfI émet les deux dessins (trait + volume), le CSS sur
   <body data-icons> montre le bon. Mémorisé dans localStorage (minifusion_icons). */
const MF_ICSTYLES=[['trait','Au trait (actuel)'],['couleur','Couleurs par famille'],['fusion','Dessinées en volume'],['delire','Délire 🤪']];
/* couleur de chaque famille du ruban (titre du groupe) — les autres tournent dans MF_GC_CYC */
const MF_GC={'Esquisse':'#22c55e','Créer':'#3b82f6','Construire':'#f59e0b','Modifier':'#a855f7','Ensembles':'#14b8a6','Fichier':'#94a3b8',
  'Composants':'#ec4899','Posage':'#06b6d4','Limites':'#f43f5e','Opérations':'#f59e0b','Simulation':'#22c55e','Calcul':'#ef4444','Export':'#3b82f6',
  'Planches':'#94a3b8','Vues':'#06b6d4','Dessin':'#22c55e','Cotes':'#f59e0b','Axes':'#a855f7','Sortie':'#3b82f6'};
const MF_GC_CYC=['#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6'];
/* ---------- dessins en volume ---------- */
// projection isométrique (X vers la droite-bas, Y vers la gauche-bas, Z vers le haut), en px du viewBox 24
function fzP(X,Y,Z){return (12+(X-Y)*0.866).toFixed(2)+' '+(12+(X+Y)*0.5-Z).toFixed(2);}
// palettes : dessus, face Y (gauche), face X (droite), arête
const FZ={b:['#e3ecf5','#a9bfd6','#7f9bb9','#38506a'],o:['#ffd27a','#f6a623','#d9860f','#8a5200'],
  w:['#fde7c2','#e9c58f','#cf9f5f','#7a5528'],m:['#f1f3f5','#c4cad1','#98a1ab','#4b5563'],g:['#b8f0c8','#4ccf7a','#2fa85a','#1c6b39']};
function fzPoly(pts,fill,edge,extra){return '<path d="M'+pts.map(p=>fzP(p[0],p[1],p[2])).join('L')+'Z" fill="'+fill+'" stroke="'+edge+'" stroke-width=".7" stroke-linejoin="round"'+(extra||'')+'/>';}
// pavé : faces Y max, X max, dessus (top = palette du dessus si elle diffère, ex. profil orange)
function fzBox(x0,y0,z0,x1,y1,z1,k,top){
  const c=FZ[k],t=top?FZ[top]:c;
  return fzPoly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],c[1],c[3])+
    fzPoly([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],c[2],c[3])+
    fzPoly([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],t[0],top?t[3]:c[3]);
}
// chemin 3D : [['M',x,y,z],['L',x,y,z],['Q',cx,cy,cz,x,y,z],['Z']] (l'isométrie est affine : les Bézier restent exactes)
function fzPath(cmds,attrs){
  const d=cmds.map(c=>c[0]==='Z'?'Z':c[0]==='Q'?'Q'+fzP(c[1],c[2],c[3])+' '+fzP(c[4],c[5],c[6]):c[0]+fzP(c[1],c[2],c[3])).join('');
  return '<path d="'+d+'" '+attrs+'/>';
}
// poche / coque : ouverture carrée [-a,a] dans un dessus à z, profondeur h (dessinée AVANT les faces avant)
function fzPocket(a,z,h,k,floor){
  const c=FZ[k];
  return fzPoly([[-a,-a,z],[a,-a,z],[a,-a,z-h],[-a,-a,z-h]],c[2],c[3])+
    fzPoly([[-a,-a,z],[-a,a,z],[-a,a,z-h],[-a,-a,z-h]],c[1],c[3])+
    fzPoly([[-a,-a,z-h],[a,-a,z-h],[a,a,z-h],[-a,a,z-h]],floor||c[2],c[3]);
}
// dessus percé (anneau, evenodd) d'un pavé [-A,A]² ouvert sur [-a,a]²
function fzRim(A,a,z,k){
  const c=FZ[k],r=(s)=>'M'+fzP(-s,-s,z)+'L'+fzP(s,-s,z)+'L'+fzP(s,s,z)+'L'+fzP(-s,s,z)+'Z';
  return '<path d="'+r(A)+r(a)+'" fill="'+c[0]+'" fill-rule="evenodd" stroke="'+c[3]+'" stroke-width=".7" stroke-linejoin="round"/>';
}
function fzSides(x0,y0,z0,x1,y1,z1,k){const c=FZ[k];return fzPoly([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],c[1],c[3])+fzPoly([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],c[2],c[3]);}
// flèche plate (écran) de (x1,y1) vers (x2,y2)
function fzArrow(x1,y1,x2,y2,col,w){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,h=Math.min(4.2,L*.55),hw=(w||2)*1.6;
  const bx=x2-ux*h,by=y2-uy*h,f=n=>n.toFixed(2);
  return '<path d="M'+f(x1)+' '+f(y1)+'L'+f(bx)+' '+f(by)+'" stroke="'+col+'" stroke-width="'+(w||2)+'" stroke-linecap="round" fill="none"/>'+
    '<path d="M'+f(x2)+' '+f(y2)+'L'+f(bx-uy*hw)+' '+f(by+ux*hw)+'L'+f(bx+uy*hw)+' '+f(by-ux*hw)+'Z" fill="'+col+'" stroke="'+col+'" stroke-width=".6" stroke-linejoin="round"/>';
}
// trièdre rouge / vert / bleu en (ox,oy), longueur l
function fzAxes(ox,oy,l){return fzArrow(ox,oy,ox+l*.866,oy+l*.5,'#ef4444',1.5)+fzArrow(ox,oy,ox-l*.866,oy+l*.5,'#22c55e',1.5)+fzArrow(ox,oy,ox,oy-l,'#3b82f6',1.5);}
const FZ_DEFS='<linearGradient id="mfFzHb" x1="0" x2="1"><stop offset="0" stop-color="#eef3f9"/><stop offset="1" stop-color="#7591b0"/></linearGradient>'+
  '<linearGradient id="mfFzHm" x1="0" x2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".45" stop-color="#cbd5e1"/><stop offset="1" stop-color="#7d8896"/></linearGradient>'+
  '<linearGradient id="mfFzHo" x1="0" x2="1"><stop offset="0" stop-color="#ffe0a3"/><stop offset="1" stop-color="#d9860f"/></linearGradient>'+
  '<linearGradient id="mfFzHw" x1="0" x2="1"><stop offset="0" stop-color="#fff1d9"/><stop offset="1" stop-color="#c8955a"/></linearGradient>'+
  '<linearGradient id="mfFzVg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ee7a0"/><stop offset="1" stop-color="#15a34a"/></linearGradient>'+
  '<linearGradient id="mfFzVb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cb6ff"/><stop offset="1" stop-color="#1d5bd8"/></linearGradient>'+
  '<linearGradient id="mfFzVy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>'+
  '<linearGradient id="mfFzVr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fca5a5"/><stop offset="1" stop-color="#dc2626"/></linearGradient>'+
  '<radialGradient id="mfFzSo" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#fff1cc"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#9a4f05"/></radialGradient>';
const FZ_E='stroke="#38506a" stroke-width=".7" stroke-linejoin="round"';
// cylindre vertical : centre du bas (cx,cy) écran, rayon d'écran rx (ry = rx·0,58), hauteur h ; g = dégradé, k = palette
function fzCyl(cx,cy,rx,h,g,k){
  const ry=rx*.58,c=FZ[k],f=n=>n.toFixed(2);
  return '<path d="M'+f(cx-rx)+' '+f(cy-h)+'V'+f(cy)+'A'+f(rx)+' '+f(ry)+' 0 0 0 '+f(cx+rx)+' '+f(cy)+'V'+f(cy-h)+'Z" fill="url(#'+g+')" stroke="'+c[3]+'" stroke-width=".7"/>'+
    '<ellipse cx="'+f(cx)+'" cy="'+f(cy-h)+'" rx="'+f(rx)+'" ry="'+f(ry)+'" fill="'+c[0]+'" stroke="'+c[3]+'" stroke-width=".7"/>';
}
// petit crayon (esquisse) : pointe en (13.5,14.5), vers le haut-droite
const FZ_PENCIL='<g stroke="#7c2d12" stroke-width=".55" stroke-linejoin="round"><path d="M16.47 13.04L21.11 6.41 18.49 4.57 13.85 11.2Z" fill="#f59e0b"/><path d="M16.47 13.04L21.11 6.41 19.8 5.49 15.16 12.12Z" fill="#d97706" stroke="none"/>'+
  '<path d="M21.11 6.41L22.03 5.1 19.41 3.26 18.49 4.57Z" fill="#f472b6"/><path d="M13.5 14.5L16.47 13.04 13.85 11.2Z" fill="#fde7c2"/><path d="M13.5 14.5L14.52 14 13.62 13.37Z" fill="#374151"/></g>';
const FZ_PLUS='<circle cx="18.5" cy="18.5" r="4.6" fill="url(#mfFzVg)" stroke="#166534" stroke-width=".7"/><path d="M18.5 16v5M16 18.5h5" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>';
const FZ_TRAY='<path d="M3 14h18v5.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill="url(#mfFzHm)" stroke="#4b5563" stroke-width=".8"/><path d="M5.5 16.6h13" stroke="#4b5563" stroke-width=".8" stroke-linecap="round"/>';
const FZ_FLOPPY='<path d="M4 4.5A1 1 0 0 1 5 3.5h11.5l3.5 3.5v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" fill="url(#mfFzVb)" stroke="#1e3a8a" stroke-width=".8"/><rect x="7.5" y="3.5" width="8" height="5" fill="#e5e7eb" stroke="#1e3a8a" stroke-width=".6"/><rect x="12.6" y="4.4" width="1.8" height="3.2" fill="#374151"/><rect x="6.5" y="12.5" width="11" height="7.5" rx=".6" fill="#fff" stroke="#1e3a8a" stroke-width=".6"/><path d="M8.5 15h7M8.5 17.5h5" stroke="#93c5fd" stroke-width="1"/>';
const FZ_FOLDER='<path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h4.3l2 2h8.7A1.5 1.5 0 0 1 21 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z" fill="#f59e0b" stroke="#92400e" stroke-width=".8"/><path d="M3 10a1.2 1.2 0 0 1 1.2-1.2h15.6A1.2 1.2 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z" fill="url(#mfFzVy)" stroke="#92400e" stroke-width=".8"/>';
const FZ_DOC='<path d="M6 2.5h8.5l4 4V21a.8.8 0 0 1-.8.8H6.8A.8.8 0 0 1 6 21z" fill="#fff" stroke="#64748b" stroke-width=".8"/><path d="M14.5 2.5v4h4" fill="#e2e8f0" stroke="#64748b" stroke-width=".8" stroke-linejoin="round"/>';
const MF_ICF={
  sketch:fzPoly([[-6,-6,-1],[6,-6,-1],[6,6,-1],[-6,6,-1]],'#dbeafe','#60a5fa')+
    fzPath([['M',-4,-4,-1],['L',1,-4,-1],['L',1,1,-1],['L',-4,1,-1],['Z']],'fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.3" stroke-linejoin="round"')+FZ_PENCIL,
  extrude:fzBox(-5,-5,-6,5,5,-1,'b','o')+fzArrow(12,11,12,1.2,'#1e88e5',2.2),
  revolve:'<path d="M12 1.5v21" stroke="#64748b" stroke-width=".9" stroke-dasharray="2 1.5"/>'+
    '<path d="M6.5 7C9 10 9 13.5 6.2 18.5A5.8 2.3 0 0 0 17.8 18.5C15 13.5 15 10 17.5 7Z" fill="url(#mfFzHb)" '+FZ_E+'/>'+
    '<ellipse cx="12" cy="7" rx="5.5" ry="2.2" fill="#e3ecf5" '+FZ_E+'/>'+
    '<path d="M6.5 7C9 10 9 13.5 6.2 18.5" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>'+
    '<path d="M3.2 12.5A8.8 3 0 0 0 19.6 14.2" fill="none" stroke="#1e88e5" stroke-width="1.5" stroke-linecap="round"/><path d="M21.2 12.6l-.4 3.4-3.1-1.2z" fill="#1e88e5"/>',
  sweep:'<path d="M4 18C8 18 9 7 15 7H18.5" fill="none" stroke="#38506a" stroke-width="5.4"/><path d="M4 18C8 18 9 7 15 7H18.5" fill="none" stroke="#a9bfd6" stroke-width="3.9"/>'+
    '<path d="M4 17C8 17 9 6 15 6H18.5" fill="none" stroke="#eef3f9" stroke-width="1.2" stroke-linecap="round"/>'+
    '<ellipse cx="18.5" cy="7" rx="1.5" ry="2.7" fill="url(#mfFzHo)" stroke="#8a5200" stroke-width=".7"/><ellipse cx="4" cy="18" rx="1.5" ry="2.7" fill="none" stroke="#1e88e5" stroke-width=".9" stroke-dasharray="1.4 1"/>',
  hole:fzBox(-5,-5,-5,5,5,0,'b')+'<ellipse cx="12" cy="12" rx="3.4" ry="1.95" fill="#243a52" stroke="#38506a" stroke-width=".6"/><path d="M8.6 12A3.4 1.95 0 0 0 15.4 12A3.4 1.4 0 0 1 8.6 12Z" fill="#5d7896"/>'+fzArrow(12,1.5,12,10.2,'#1e88e5',2),
  body:fzBox(-5,-5,-3.5,5,5,3,'b'),
  fillet:fzPoly([[-5,5,-5],[5,5,-5],[5,5,0.3],[-5,5,0.3]],FZ.b[1],FZ.b[3])+
    fzPath([['M',5,-5,-5],['L',5,5,-5],['L',5,5,0.3],['Q',5,5,2,5,3.2,2],['L',5,-5,2],['Z']],'fill="'+FZ.b[2]+'" '+FZ_E)+
    fzPoly([[-5,-5,2],[5,-5,2],[5,3.2,2],[-5,3.2,2]],FZ.b[0],FZ.b[3])+
    fzPath([['M',-5,3.2,2],['L',5,3.2,2],['Q',5,5,2,5,5,0.3],['L',-5,5,0.3],['Q',-5,5,2,-5,3.2,2],['Z']],'fill="url(#mfFzHo)" stroke="#8a5200" stroke-width=".7" stroke-linejoin="round"'),
  chamfer:fzPoly([[-5,5,-5],[5,5,-5],[5,5,0],[-5,5,0]],FZ.b[1],FZ.b[3])+
    fzPoly([[5,-5,-5],[5,5,-5],[5,5,0],[5,3,2],[5,-5,2]],FZ.b[2],FZ.b[3])+
    fzPoly([[-5,-5,2],[5,-5,2],[5,3,2],[-5,3,2]],FZ.b[0],FZ.b[3])+
    fzPoly([[-5,3,2],[5,3,2],[5,5,0],[-5,5,0]],'#f6a623','#8a5200'),
  face:fzPoly([[-6,4,-4],[2,4,-4],[2,4,3],[-6,4,3]],FZ.b[1],FZ.b[3])+fzPoly([[2,-4,-4],[2,4,-4],[2,4,3],[2,-4,3]],'#f6a623','#8a5200')+
    fzPoly([[-6,-4,3],[2,-4,3],[2,4,3],[-6,4,3]],FZ.b[0],FZ.b[3])+fzArrow(13.7,12.5,20.6,16.5,'#1e88e5',2),
  draft:fzPoly([[-5,5,-5],[5,5,-5],[3,3,2],[-5,3,2]],'#f6a623','#8a5200')+fzPoly([[5,-5,-5],[5,5,-5],[3,3,2],[3,-5,2]],FZ.b[2],FZ.b[3])+
    fzPoly([[-5,-5,2],[3,-5,2],[3,3,2],[-5,3,2]],FZ.b[0],FZ.b[3])+fzPath([['M',5,5,-5],['L',5,5,3]],'stroke="#1e88e5" stroke-width=".9" stroke-dasharray="1.6 1.2"'),
  shell:fzPocket(3.6,1,4.5,'b','#5d7896')+fzRim(5,3.6,1,'b')+fzSides(-5,-5,-5,5,5,1,'b'),
  split:fzBox(-4.5,-4.5,-6,4.5,4.5,-2,'b')+fzPoly([[-6.5,-6.5,-1.5],[6.5,-6.5,-1.5],[6.5,6.5,-1.5],[-6.5,6.5,-1.5]],'#f6a623','#c2410c',' fill-opacity=".55"')+fzBox(-4.5,-4.5,-0.6,4.5,4.5,3,'b'),
  pattern:fzBox(-5.5,-5.5,-2,-1.5,-1.5,2,'b','o')+fzBox(1.5,-5.5,-2,5.5,-1.5,2,'b')+fzBox(-5.5,1.5,-2,-1.5,5.5,2,'b')+fzBox(1.5,1.5,-2,5.5,5.5,2,'b'),
  combine:fzCyl(15.5,15.5,4.4,9,'mfFzHo','o')+fzBox(-6,-1.5,-4,1,5.5,0.5,'b'),
  move:fzBox(-4,-4,-4,3,3,1,'b')+fzAxes(12,11.5,8.5),
  params:'<rect x="3" y="4" width="18" height="16" rx="3" fill="url(#mfFzVb)" stroke="#1e3a8a" stroke-width=".8"/><path d="M9.6 17.6L11.2 9.6C11.5 8 12.3 7.4 13.6 7.6M9 11.8h4.2" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M14 12.2l3.6 5M17.6 12.2l-3.6 5" stroke="#fde68a" stroke-width="1.7" stroke-linecap="round"/>',
  import:FZ_TRAY+fzArrow(12,2,12,15.2,'#16a34a',3),
  export:FZ_TRAY+fzArrow(12,15,12,1.8,'#1e88e5',3),
  new:FZ_DOC+FZ_PLUS,
  open:FZ_FOLDER,
  folder:FZ_FOLDER+'<path d="M6 13h12" stroke="#92400e" stroke-width=".8"/>',
  save:FZ_FLOPPY,
  saveas:FZ_FLOPPY+'<path d="M15.5 21.5l1-3 5-5 2 2-5 5z" fill="#f59e0b" stroke="#7c2d12" stroke-width=".6" stroke-linejoin="round"/>',
  undo:'<path d="M9 15L3.5 9.5 9 4v3.3h5.5a6.2 6.2 0 0 1 0 12.4H12v-3.4h2.5a2.8 2.8 0 0 0 0-5.6H9z" fill="url(#mfFzVb)" stroke="#1e3a8a" stroke-width=".8" stroke-linejoin="round"/>',
  redo:'<path d="M15 15l5.5-5.5L15 4v3.3H9.5a6.2 6.2 0 0 0 0 12.4H12v-3.4H9.5a2.8 2.8 0 0 1 0-5.6H15z" fill="url(#mfFzVb)" stroke="#1e3a8a" stroke-width=".8" stroke-linejoin="round"/>',
  recent:'<circle cx="12" cy="12" r="9" fill="#fff" stroke="url(#mfFzVb)" stroke-width="2.4"/><path d="M12 6.8V12l3.6 2.2" fill="none" stroke="#1f2937" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.1" fill="#ef4444"/>',
  theme:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-2 0-1.3-1-1.6-1-2.6 0-1 .8-1.4 1.8-1.4H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" fill="#fde7c2" stroke="#7a5528" stroke-width=".9"/>'+
    '<circle cx="7.5" cy="11" r="1.6" fill="#ef4444"/><circle cx="10" cy="6.8" r="1.6" fill="#22c55e"/><circle cx="15" cy="7.3" r="1.6" fill="#3b82f6"/><circle cx="7.8" cy="15.6" r="1.6" fill="#a855f7"/>',
  // construction : plans / axes / points orange
  cgPlane:fzPoly([[-6,0,-5],[6,0,-5],[6,0,5],[-6,0,5]],'#ffb84d','#c2410c',' fill-opacity=".8"')+fzPoly([[-4.2,0,-3.4],[4.2,0,-3.4],[4.2,0,3.4],[-4.2,0,3.4]],'none','#fff7ed',' stroke-dasharray="1.4 1.1"'),
  cgAxis:'<path d="M4 20L20 4" stroke="#9a3412" stroke-width="3.8" stroke-linecap="round"/><path d="M4 20L20 4" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/><ellipse cx="12" cy="12" rx="4.6" ry="2" transform="rotate(-45 12 12)" fill="none" stroke="#1e88e5" stroke-width="1.1"/>',
  cgPoint:'<path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/><circle cx="12" cy="12" r="4.6" fill="url(#mfFzSo)" stroke="#9a3412" stroke-width=".7"/>',
  cgFrame:fzAxes(11,15,10.5)+'<circle cx="11" cy="15" r="1.9" fill="url(#mfFzSo)" stroke="#9a3412" stroke-width=".6"/>',
  // composants
  asmView:fzBox(-5,-6,-1,1,0,4,'b')+fzBox(-1,0,-5,5,6,0,'o'),
  asmPart:fzBox(-6,-6,-3,3,3,3,'b')+FZ_PLUS,
  asmOcc:'<g opacity=".45">'+fzBox(-7,-1,-4,-2,4,1,'b')+'</g>'+fzBox(-2,-6,-1,3,-1,4,'b')+FZ_PLUS,
  asmInspect:fzBox(-5,-5,-4,4,4,2,'b')+'<circle cx="10" cy="10" r="5.4" fill="#dbeafe" fill-opacity=".55" stroke="#1f2937" stroke-width="1.6"/><path d="M14 14l6 6" stroke="#1f2937" stroke-width="2.8" stroke-linecap="round"/>',
  asmFromBodies:fzBox(-7,-1,-3,-3,3,1,'b')+fzBox(1,-7,0,5,-3,4,'o')+fzArrow(9,18.5,19,18.5,'#16a34a',2),
  asmStd:'<rect x="10" y="9" width="4" height="10.5" fill="url(#mfFzHm)" stroke="#4b5563" stroke-width=".7"/><path d="M10 11l4 1.3M10 13.4l4 1.3M10 15.8l4 1.3M10 18.2l4 1.3" stroke="#4b5563" stroke-width=".7"/><path d="M10 19.5l2 2.5 2-2.5" fill="#cbd5e1" stroke="#4b5563" stroke-width=".7"/>'+
    fzCyl(12,8.6,5.6,3.6,'mfFzHm','m')+'<path d="M10.3 5 13.7 5 15.4 5.9 13.7 6.9 10.3 6.9 8.6 5.9Z" fill="#374151"/>',
  // FAO : brut en bois clair, parcours bleus
  setup:fzBox(-6,-6,-7,6,6,-5,'m')+fzBox(-4,-4,-5,4,4,0.5,'w')+fzAxes(12,11.5,6),
  tools:'<rect x="9" y="1.5" width="6" height="9" fill="url(#mfFzHm)" stroke="#4b5563" stroke-width=".7"/><path d="M9 10.5h6v8.5l-3 2.5-3-2.5z" fill="url(#mfFzHo)" stroke="#8a5200" stroke-width=".7" stroke-linejoin="round"/>'+
    '<path d="M9 12.5l6 2.2M9 15.4l6 2.2M9 18.3l4.6 1.7" stroke="#fff7ed" stroke-width="1" stroke-linecap="round"/><path d="M8.5 10.5h7" stroke="#4b5563" stroke-width="1.1"/>',
  facing:fzBox(-5,-5,-5,5,5,0,'w')+fzPath([['M',-4,-3.8,0],['L',4,-3.8,0],['L',4,-1.3,0],['L',-4,-1.3,0],['L',-4,1.2,0],['L',4,1.2,0],['L',4,3.7,0],['L',-4,3.7,0]],'fill="none" stroke="#1e88e5" stroke-width="1.3" stroke-linejoin="round"'),
  pocket:fzPocket(3.2,1,3,'w','#e9c58f')+fzPath([['M',-2.2,-2.2,-2],['L',2.2,-2.2,-2],['L',2.2,2.2,-2],['L',-2.2,2.2,-2],['Z'],['M',-1,-1,-2],['L',1,-1,-2],['L',1,1,-2],['L',-1,1,-2],['Z']],'fill="none" stroke="#1e88e5" stroke-width="1.1"')+fzRim(5,3.2,1,'w')+fzSides(-5,-5,-5,5,5,1,'w'),
  contour:fzPath([['M',-5,5,-3],['L',-5,-5,-3],['L',5,-5,-3]],'fill="none" stroke="#1e88e5" stroke-width="1.2" stroke-dasharray="1.6 1.1"')+fzBox(-3,-3,-5,3,3,2,'w')+
    fzPath([['M',-5,5,-3],['L',5,5,-3],['L',5,-5,-3]],'fill="none" stroke="#1e88e5" stroke-width="1.6" stroke-linejoin="round"'),
  drill:fzBox(-5,-5,-6,5,5,-1,'w')+'<ellipse cx="12" cy="13" rx="2.6" ry="1.5" fill="#5b3d1c"/>'+
    '<path d="M10.6 1.5h2.8v9.5L12 13.4 10.6 11z" fill="url(#mfFzHm)" stroke="#4b5563" stroke-width=".7" stroke-linejoin="round"/><path d="M10.6 4l2.8 1.3M10.6 6.6l2.8 1.3M10.6 9.2l2.8 1.3" stroke="#4b5563" stroke-width=".7"/>',
  rough3d:fzBox(-6,-6,-7,6,6,-4,'w')+fzBox(-4,-4.5,-4,4.5,3,-1,'w')+fzBox(-2,-2.5,-1,2.5,1.5,2,'w')+
    fzPath([['M',-4,3,-1],['L',4.5,3,-1],['L',4.5,-4.5,-1]],'fill="none" stroke="#1e88e5" stroke-width="1"')+fzPath([['M',-6,6,-4],['L',6,6,-4],['L',6,-6,-4]],'fill="none" stroke="#1e88e5" stroke-width="1"'),
  finish:'<path d="M3 11C7 5 11 6 13 10C15 14 19 15 21 8V15C19 22 15 21 13 17C11 13 7 12 3 18Z" fill="url(#mfFzHw)" stroke="#7a5528" stroke-width=".7" stroke-linejoin="round"/>'+
    '<g fill="none" stroke="#1e88e5" stroke-width="1"><path d="M3 13.3C7 7.3 11 8.3 13 12.3C15 16.3 19 17.3 21 10.3"/><path d="M3 15.6C7 9.6 11 10.6 13 14.6C15 18.6 19 19.6 21 12.6"/></g>',
  geodesic:'<path d="M12 3.2c.95 0 1.8.5 2.3 1.35l6.35 11.15c.95 1.7-.25 3.8-2.2 3.8H5.55c-1.95 0-3.15-2.1-2.2-3.8L9.7 4.55C10.2 3.7 11.05 3.2 12 3.2z" fill="url(#mfFzHw)" stroke="#7a5528" stroke-width=".8"/>'+
    '<path d="M12 7.4c.5 0 .95.27 1.2.7l3.85 6.85c.5.9-.15 2-1.2 2H8.15c-1.05 0-1.7-1.1-1.2-2L10.8 8.1c.25-.43.7-.7 1.2-.7z" fill="none" stroke="#1e88e5" stroke-width="1.3"/><path d="M12 11.2l1.9 3.4h-3.8z" fill="#1e88e5" fill-opacity=".55" stroke="#1e88e5" stroke-width=".8"/>',
  play:'<circle cx="12" cy="12" r="9.5" fill="url(#mfFzVg)" stroke="#166534" stroke-width=".8"/><path d="M9.5 7.2l7.3 4.8-7.3 4.8z" fill="#fff"/>',
  rapid:'<path d="M13.5 1.5L4.5 13.5h6.2L9 22.5l10-13h-6.4z" fill="url(#mfFzVy)" stroke="#92400e" stroke-width=".9" stroke-linejoin="round"/>',
  regen:'<path d="M19.5 10.5A7.8 7.8 0 0 0 6 6.2L4.4 7.8" fill="none" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round"/><path d="M3 3.5v6h6z" fill="#16a34a"/>'+
    '<path d="M4.5 13.5A7.8 7.8 0 0 0 18 17.8l1.6-1.6" fill="none" stroke="#1e88e5" stroke-width="2.6" stroke-linecap="round"/><path d="M21 20.5v-6h-6z" fill="#1e88e5"/>',
  gcode:FZ_DOC+'<rect x="6.6" y="8" width="11.3" height="3.2" fill="#1e88e5"/><path d="M8 14h2.5M11.5 14h5M8 16.6h2.5M11.5 16.6h3.5M8 19.2h2.5M11.5 19.2h4.5" stroke-width="1.2" stroke-linecap="round" stroke="#f59e0b"/><path d="M8 14h2.5M8 16.6h2.5M8 19.2h2.5" stroke="#1e88e5" stroke-width="1.2" stroke-linecap="round"/>'
};
/* ---------- application ---------- */
function mfIcDefs(){
  if(document.getElementById('mfFzDefs'))return;
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.id='mfFzDefs';s.setAttribute('width','0');s.setAttribute('height','0');s.setAttribute('aria-hidden','true');
  s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML='<defs>'+FZ_DEFS+'</defs>';document.body.appendChild(s);
}
// couleur de famille (--mfGc) sur chaque groupe du ruban, rang (--mfN) sur chaque bouton (arc-en-ciel du mode délire)
function mfIcTag(){
  let ci=0,n=0;
  document.querySelectorAll('#mfRibbon .mfGrp').forEach(g=>{
    const t=(g.querySelector('.mfGrpT')||{}).textContent||'';
    if(!g.style.getPropertyValue('--mfGc'))g.style.setProperty('--mfGc',MF_GC[t]||MF_GC_CYC[ci++%MF_GC_CYC.length]);
  });
  document.querySelectorAll('#mfRibbon .mfRb,.mfQuick button,#skToolbar .tool,#skToolbar .con').forEach(b=>b.style.setProperty('--mfN',n++));
}
function mfIcons(s){
  s=MF_ICSTYLES.some(x=>x[0]===s)?s:'trait';
  try{mfIcDefs();document.body.setAttribute('data-icons',s);}catch(e){}
  mfLS('minifusion_icons',s);
  try{mfIcTag();}catch(e){}
  try{document.querySelectorAll('.mfIconOpt').forEach(b=>b.classList.toggle('on',b.dataset.i===s));}catch(e){}
}
/* délire : les yeux suivent la souris (une passe par image), confettis au clic */
let mfEyeRaf=0,mfEyeXY=[0,0];
function mfEyesMove(e){
  mfEyeXY=[e.clientX,e.clientY];if(mfEyeRaf)return;
  mfEyeRaf=requestAnimationFrame(()=>{mfEyeRaf=0;
    document.querySelectorAll('#mfRibbon .mfRb i').forEach(i=>{if(!i.offsetParent)return;const r=i.getBoundingClientRect();
      const dx=mfEyeXY[0]-(r.right-1),dy=mfEyeXY[1]-(r.top+1),L=Math.hypot(dx,dy)||1,k=Math.min(1,L/60)*1.5;
      i.style.setProperty('--mfEx',(dx/L*k).toFixed(2)+'px');i.style.setProperty('--mfEy',(dy/L*k).toFixed(2)+'px');});
  });
}
const MF_FUN=['🎉','✨','🔧','🚀','⭐','🍕','🦄','💥','🔩','🌈'];
function mfConfetti(e){
  const b=e.target&&e.target.closest&&e.target.closest('.mfRb,.mfQuick button,#skToolbar .tool,#skToolbar .con');if(!b)return;
  const r=b.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<12;i++){
    const p=document.createElement('span');p.className='mfConf';
    p.textContent=i%3?'':MF_FUN[(Math.random()*MF_FUN.length)|0];
    if(i%3)p.style.background='hsl('+((Math.random()*360)|0)+' 95% 60%)';
    p.style.left=cx+'px';p.style.top=cy+'px';document.body.appendChild(p);
    const a=Math.random()*Math.PI*2,d=30+Math.random()*50,rot=(Math.random()*720-360)|0;
    const an=p.animate([{transform:'translate(-50%,-50%)',opacity:1},{transform:'translate(calc(-50% + '+(Math.cos(a)*d).toFixed(1)+'px),calc(-50% + '+(Math.sin(a)*d+40).toFixed(1)+'px)) rotate('+rot+'deg)',opacity:0}],
      {duration:700+Math.random()*400,easing:'cubic-bezier(.2,.7,.4,1)'});
    an.onfinish=()=>p.remove();
  }
}
function mfIcCss(){
  if(document.getElementById('mfIcCss'))return;
  const st=document.createElement('style');st.id='mfIcCss';
  const CF=':is(body[data-icons="couleur"],body[data-icons="fusion"])';
  st.textContent=[
  '.mfIcF{display:none}',
  'body[data-icons="fusion"] .mfIcF{display:block}body[data-icons="fusion"] .mfIcH{display:none}',
  '.mfPopT{font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);padding:7px 10px 3px}',
  '.mfPopT:not(:first-child){border-top:1px solid var(--border);margin-top:4px;padding-top:8px}',
  '.mfIcSw{display:inline-flex;gap:2px;flex:none}.mfIcSw i{width:6px;height:14px;border-radius:2px}',
  /* couleur : teinte de la famille + pastille ; les icônes FAO déjà colorées (mfIcR/B/G) gardent la leur */
  'body[data-icons="couleur"] .mfRb:not(.mfIcR):not(.mfIcB):not(.mfIcG) i{color:var(--mfGc,var(--primary))}',
  'body[data-icons="couleur"] .mfRb i{opacity:1;border-radius:7px;padding:0 4px;background:color-mix(in srgb,var(--mfGc,var(--primary)) 16%,transparent)}',
  'body[data-icons="couleur"] .mfRb:hover i{color:#fff!important;background:var(--mfGc,var(--primary))}',
  'body[data-icons="couleur"] .mfGrpT{color:var(--mfGc)}',
  'body[data-icons="couleur"] .mfQuick button:nth-child(-n+2){color:#3b82f6}',
  'body[data-icons="couleur"] .mfQuick button:nth-child(n+4){color:#f59e0b}',
  /* esquisse (couleur ET volume) : dessin bleu, modifications orange, cotes jaunes ; contraintes vertes (déjà) */
  CF+' #skToolbar .tool:not(.on){color:#3b9dff}',
  CF+' #skToolbar .tool:is([data-tool="fillet"],[data-tool="chamfer"],[data-tool="offset"],[data-tool="trim"],[data-tool="project"],[data-tool="isect"]):not(.on){color:#f59e0b}',
  CF+' #skToolbar .tool:is([data-tool="dim"],[data-tool="hpoint"]):not(.on){color:#ef8a17}',
  CF+' #skToolbar .tool[data-tool="select"]:not(.on){color:var(--text)}',
  'body[data-theme="clair"]:is([data-icons="couleur"],[data-icons="fusion"]) #skToolbar .tool:not(.on){filter:saturate(1.2) brightness(.85)}',
  /* volume : icônes pleines, un peu plus grandes, ombre portée douce */
  'body[data-icons="fusion"] .mfRb i{opacity:1}',
  'body[data-icons="fusion"] .mfRb i .mfIcF{filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}',
  'body[data-icons="fusion"] .mfRb:hover i .mfIcF{transform:translateY(-1px) scale(1.08);transition:transform .12s}',
  'body[data-icons="fusion"] .mfRb:not(.mfIcR):not(.mfIcB):not(.mfIcG) i{color:var(--mfGc,var(--primary))}', /* icônes sans dessin en volume : couleur de famille */
  /* délire */
  'body[data-icons="delire"] .mfRb i,body[data-icons="delire"] .mfQuick button,body[data-icons="delire"] #skToolbar :is(.tool,.con):not(.on){color:hsl(calc(var(--mfN,0)*47) 92% 62%)!important;opacity:1}',
  'body[data-icons="delire"][data-theme="clair"] .mfRb i,body[data-icons="delire"][data-theme="clair"] .mfQuick button,body[data-icons="delire"][data-theme="clair"] #skToolbar :is(.tool,.con):not(.on){color:hsl(calc(var(--mfN,0)*47) 85% 45%)!important}',
  'body[data-icons="delire"] .mfRb i{position:relative;transform:rotate(-5deg)}body[data-icons="delire"] .mfRb:nth-child(even) i{transform:rotate(6deg)}',
  'body[data-icons="delire"] .mfRb i::after{content:"";position:absolute;right:-7px;top:-5px;width:14px;height:8px;pointer-events:none;'+
    'background:radial-gradient(circle at calc(3.5px + var(--mfEx,0px)) calc(4px + var(--mfEy,0px)),#111 1.3px,transparent 1.7px),'+
    'radial-gradient(circle at calc(10.5px + var(--mfEx,0px)) calc(4px + var(--mfEy,0px)),#111 1.3px,transparent 1.7px),'+
    'radial-gradient(circle at 3.5px 4px,#fff 2.9px,#222 3.2px,transparent 3.6px),radial-gradient(circle at 10.5px 4px,#fff 2.9px,#222 3.2px,transparent 3.6px)}',
  '@keyframes mfWob{0%{transform:rotate(0) scale(1)}20%{transform:rotate(-14deg) scale(1.3)}40%{transform:rotate(11deg) scale(1.2)}60%{transform:rotate(-7deg) scale(1.25)}80%{transform:rotate(4deg) scale(1.2)}100%{transform:rotate(0) scale(1.2)}}',
  '@keyframes mfBoing{0%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}60%{transform:translateY(1px)}}',
  'body[data-icons="delire"] .mfRb:hover i{animation:mfWob .6s ease-out forwards}',
  'body[data-icons="delire"] .mfQuick button:hover,body[data-icons="delire"] #skToolbar :is(.tool,.con):hover{animation:mfBoing .45s ease-out}',
  'body[data-icons="delire"] .mfRb,body[data-icons="delire"] .mfGrpT{font-family:"Comic Sans MS","Comic Neue","Chalkboard SE",cursive}',
  'body[data-icons="delire"] .mfGrpT{font-weight:700;color:hsl(calc(var(--mfN,0)*47) 92% 62%)}',
  'body[data-icons="delire"] .mfGrp:nth-child(6n+1) .mfGrpT{color:#ff5f6d}body[data-icons="delire"] .mfGrp:nth-child(6n+2) .mfGrpT{color:#ffc371}body[data-icons="delire"] .mfGrp:nth-child(6n+3) .mfGrpT{color:#47e891}',
  'body[data-icons="delire"] .mfGrp:nth-child(6n+4) .mfGrpT{color:#3fa9f5}body[data-icons="delire"] .mfGrp:nth-child(6n+5) .mfGrpT{color:#b06ab3}body[data-icons="delire"] .mfGrp:nth-child(6n) .mfGrpT{color:#ff8ad8}',
  'body[data-icons="delire"] #mfRibbon,body[data-icons="delire"] #mfSkBar{background:linear-gradient(90deg,#ff5f6d,#ffc371,#47e891,#3fa9f5,#b06ab3,#ff5f6d) top/100% 3px no-repeat,var(--surface)}',
  'body[data-icons="delire"] .mfRb:hover{background:linear-gradient(135deg,rgba(255,95,109,.18),rgba(63,169,245,.18))}',
  '.mfConf{position:fixed;z-index:99999;width:7px;height:7px;border-radius:2px;pointer-events:none;font-size:15px;line-height:1}',
  '@media (prefers-reduced-motion:reduce){body[data-icons="delire"] *{animation:none!important}}'
  ].join('\n');
  document.head.appendChild(st);
}
(function(){
  try{
    mfIcCss();mfIcDefs();
    mfIcons(mfLS('minifusion_icons')||'trait');
    document.addEventListener('pointermove',e=>{if(document.body.getAttribute('data-icons')==='delire')mfEyesMove(e);},{passive:true});
    document.addEventListener('click',e=>{if(document.body.getAttribute('data-icons')==='delire')mfConfetti(e);},true);
    // le ruban et les outils d'esquisse naissent après ce fichier (97-interface-moderne, 60, 62) : on les repère ensuite
    window.addEventListener('load',()=>{try{mfIcTag();}catch(e){}});
  }catch(e){}
})();
