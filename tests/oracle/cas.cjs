// Tests de référence (V0.7.0) : des pièces décrites par une petite recette, et leurs valeurs
// ATTENDUES calculées à la main (formules analytiques, rappelées dans « calc »). Aucune valeur
// ne vient d'un logiciel de CAO. test_oracle.cjs construit chaque recette dans MiniFusion
// (noyau exact), mesure volume, surface, centre de gravité et encombrement, et compare.
//
// Recette :
//   sk : esquisses {id, plan (défaut XY) | o,u,v,n (plan quelconque), rect [x0,y0,x1,y1] |
//        cercle [cx,cy,r] | poly [[x,y]…] | axe [[x,y],[x,y]] (révolution) | trous [[x,y]…]}
//   f  : fonctions {ext: sk, d, op ('add'|'cut'|'new'), corps} | {rev: sk, angle, op} |
//        {trou: sk, d, fin ('blind'|'through'), prof, pointe, type ('simple'|'cbore'), cbD, cbH} |
//        {comb: corps cible, outils [corps], mode}
//   attendu : v (mm³), a (mm²), c [x,y,z] (centre de gravité), cr (distance du centre de gravité
//             à l'axe Z), box [[x0,y0,z0],[x1,y1,z1]] ; tol : tolérances (défaut ci-dessous)
const PI=Math.PI;
const S45=Math.SQRT1_2;
module.exports=[
  {nom:'01-parallelepipede',titre:'Parallélépipède 60 × 40 × 20',
   sk:[{id:'A',rect:[0,0,60,40]}],f:[{ext:'A',d:20}],
   attendu:{v:60*40*20,a:2*(60*40+60*20+40*20),c:[30,20,10],box:[[0,0,0],[60,40,20]]},
   calc:'V = abc ; A = 2(ab + bc + ca) ; G au centre'},
  {nom:'02-cylindre',titre:'Cylindre r 10, h 30',
   sk:[{id:'A',cercle:[0,0,10]}],f:[{ext:'A',d:30}],
   attendu:{v:PI*100*30,a:2*PI*10*30+2*PI*100,c:[0,0,15],box:[[-10,-10,0],[10,10,30]]},
   calc:'V = πr²h ; A = 2πrh + 2πr²'},
  {nom:'03-plaque-percee',titre:'Plaque 60 × 40 × 10, trou Ø 10 traversant (découpe)',
   sk:[{id:'A',rect:[0,0,60,40]},{id:'B',cercle:[30,20,5]}],f:[{ext:'A',d:10},{ext:'B',d:10,op:'cut'}],
   attendu:{v:60*40*10-PI*25*10,a:2*(60*40-PI*25)+2*(60+40)*10+2*PI*5*10,c:[30,20,5],box:[[0,0,0],[60,40,10]]},
   calc:'V = abh − πr²h ; A = 2(ab − πr²) + 2(a + b)h + 2πrh'},
  {nom:'04-tube-revolution',titre:'Tube par révolution : profil r 5…15, z 0…10, 360°',
   sk:[{id:'A',plan:'XZ',poly:[[5,0],[15,0],[15,10],[5,10]],axe:[[0,0],[0,10]]}],f:[{rev:'A',angle:360}],
   attendu:{v:PI*(225-25)*10,a:2*PI*(225-25)+2*PI*15*10+2*PI*5*10,c:[0,0,5],box:[[-15,-15,0],[15,15,10]]},
   calc:'V = π(R² − r²)h ; A = 2π(R² − r²) + 2πRh + 2πrh'},
  {nom:'05-quart-de-tube',titre:'Même profil, révolution de 90°',
   sk:[{id:'A',plan:'XZ',poly:[[5,0],[15,0],[15,10],[5,10]],axe:[[0,0],[0,10]]}],f:[{rev:'A',angle:90}],
   attendu:{v:PI/4*(225-25)*10,a:PI/2*(225-25)+PI/2*15*10+PI/2*5*10+2*10*10,cr:(2/3)*(3375-125)/(225-25)*(2*Math.SQRT2/PI),cz:5},
   calc:'secteur θ = π/2 : V = (θ/2)(R² − r²)h ; distance de G à l’axe = (2/3)(R³ − r³)/(R² − r²)·2·sin(θ/2)/θ'},
  {nom:'06-bloc-moins-cylindre',titre:'Bloc 40 × 40 × 20 percé d’un cylindre r 10 (découpe)',
   sk:[{id:'A',rect:[-20,-20,20,20]},{id:'B',cercle:[0,0,10]}],f:[{ext:'A',d:20},{ext:'B',d:20,op:'cut'}],
   attendu:{v:32000-PI*100*20,a:2*(1600-PI*100)+4*40*20+2*PI*10*20,c:[0,0,10],box:[[-20,-20,0],[20,20,20]]},
   calc:'V = a²h − πr²h ; A = 2(a² − πr²) + 4ah + 2πrh'},
  {nom:'07-deux-corps',titre:'Deux corps séparés : cube 20 et cube 10 (nouveau corps)',
   sk:[{id:'A',rect:[0,0,20,20]},{id:'B',rect:[30,0,40,10]}],f:[{ext:'A',d:20},{ext:'B',d:10,op:'new'}],
   attendu:{v:8000+1000,a:6*400+6*100,c:[(8000*10+1000*35)/9000,(8000*10+1000*5)/9000,(8000*10+1000*5)/9000],box:[[0,0,0],[40,20,20]]},
   calc:'G = Σ Vᵢ Gᵢ / Σ Vᵢ'},
  {nom:'08-union-de-corps',titre:'Combiner (union) : 0…20 et 10…30 en X, 20 × 20',
   sk:[{id:'A',rect:[0,0,20,20]},{id:'B',rect:[10,0,30,20]}],f:[{ext:'A',d:20},{ext:'B',d:20,op:'new'},{comb:'b1',outils:['b2'],mode:'union'}],
   attendu:{v:30*20*20,a:2*(30*20+30*20+20*20),c:[15,10,10],box:[[0,0,0],[30,20,20]]},
   calc:'union = parallélépipède 30 × 20 × 20'},
  {nom:'09-intersection-de-corps',titre:'Combiner (intersection) : même paire',
   sk:[{id:'A',rect:[0,0,20,20]},{id:'B',rect:[10,0,30,20]}],f:[{ext:'A',d:20},{ext:'B',d:20,op:'new'},{comb:'b1',outils:['b2'],mode:'intersect'}],
   attendu:{v:10*20*20,a:2*(10*20+10*20+20*20),c:[15,10,10],box:[[10,0,0],[20,20,20]]},
   calc:'intersection = parallélépipède 10 × 20 × 20'},
  {nom:'10-cube-incline',titre:'Cube 10 sur un plan incliné de 45° autour de X',
   sk:[{id:'A',o:[0,0,0],u:[1,0,0],v:[0,S45,S45],n:[0,-S45,S45],rect:[0,0,10,10]}],f:[{ext:'A',d:10}],
   attendu:{v:1000,a:600,c:[5,0,10*S45]},
   calc:'G = o + 5u + 5v + 5n'},
  {nom:'11-percage-borgne',titre:'Perçage borgne Ø 10, profondeur 10, pointe 118°, dans une plaque 40 × 40 × 20',
   sk:[{id:'A',rect:[-20,-20,20,20]},{id:'H',o:[0,0,20],u:[1,0,0],v:[0,1,0],n:[0,0,1],trous:[[0,0]]}],
   f:[{ext:'A',d:20},{trou:'H',d:10,fin:'blind',prof:10,pointe:118}],
   attendu:{v:32000-PI*25*10-PI*25*(5/Math.tan(59*PI/180))/3,box:[[-20,-20,0],[20,20,20]]},
   calc:'V = a²h − πr²p − πr²·(r / tan 59°)/3 (cône de pointe)'},
  {nom:'12-lamage',titre:'Perçage lamé : Ø 8 débouchant, lamage Ø 16 × 5, plaque 40 × 40 × 20',
   sk:[{id:'A',rect:[-20,-20,20,20]},{id:'H',o:[0,0,20],u:[1,0,0],v:[0,1,0],n:[0,0,1],trous:[[0,0]]}],
   f:[{ext:'A',d:20},{trou:'H',type:'cbore',d:8,cbD:16,cbH:5,fin:'through'}],
   attendu:{v:32000-PI*64*5-PI*16*15,a:2*1600+4*40*20-PI*64-PI*16+2*PI*8*5+(PI*64-PI*16)+2*PI*4*15,box:[[-20,-20,0],[20,20,20]]},
   calc:'V = a²h − πR²h₁ − πr²(h − h₁) ; A = faces planes − ouvertures + parois du lamage et du trou'}
];
