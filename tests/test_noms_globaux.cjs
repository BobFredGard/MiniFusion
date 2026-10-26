// V0.11.4 : aucun nom global déclaré deux fois dans src/.
// Tous les fichiers forment UN seul script : une fonction redéclarée plus loin écrase
// la première sans erreur. Cas réel (V0.10.0 → V0.11.3) : rdLayout/rdDraw du Rendu
// (98-rendu.js) masquaient ceux des cotes R/Ø de l'esquisse, qui ne se dessinaient plus.
const fs=require('fs'),path=require('path');
const espree=require(path.join(__dirname,'..','node_modules','espree'));
const SRC=path.join(__dirname,'..','src');
const vus=new Map(),fails=[];
// 98-mep-* : noms privés à la fonction englobante (ouverte dans 98-mep-00, fermée dans 98-mep-95)
for(const f of fs.readdirSync(SRC).filter(f=>/^\d\d-.*\.js$/.test(f)&&!/^98-mep-/.test(f)).sort()){
  const ast=espree.parse(fs.readFileSync(path.join(SRC,f),'utf8'),{ecmaVersion:'latest',loc:true});
  ast.body.forEach(s=>{
    const noms=s.type==='FunctionDeclaration'||s.type==='ClassDeclaration'?[s.id.name]
      :s.type==='VariableDeclaration'?s.declarations.filter(d=>d.id.type==='Identifier').map(d=>d.id.name):[];
    noms.forEach(n=>{const ici=f+':'+s.loc.start.line;if(vus.has(n))fails.push(n+' : '+vus.get(n)+' et '+ici);else vus.set(n,ici);});
  });
}
console.log('=== noms globaux uniques ('+vus.size+' noms) ===');
if(fails.length){fails.forEach(m=>console.log('  ✗ '+m));console.log('\n*** '+fails.length+' PROBLEME(S) ***');process.exit(1);}
console.log('\n*** TOUT PASSE ***');
