// build.js — assemble les sources de src/ dans le livrable unique fusion_mvp.html
// (aucune dépendance, Node seul). Le fichier généré n'est JAMAIS édité à la main :
//   node build.js          reconstruit fusion_mvp.html
//   node build.js --check  échoue (code 1) si le livrable est périmé  → garde-fou CI
//
// DISCIPLINE : on édite les fichiers de src/, PUIS on reconstruit. Editer
// fusion_mvp.html à la main est perdu au build suivant — le --check le signale.
//
// Le découpage est une PARTITION CONTIGUË du script d'origine : l'ordre d'exécution des
// statements de haut niveau est donc conservé à l'identique, et le livrable reste
// un seul HTML (double-clic et file:// continuent de fonctionner).
const fs=require('fs'),path=require('path');
const ROOT=__dirname;
const HTML=path.join(ROOT,'fusion_mvp.html');
const SRC=path.join(ROOT,'src');
const parts=fs.readdirSync(SRC).filter(f=>/^\d\d-.*\.js$/.test(f)).sort();
if(!parts.length){console.error('src/ est vide');process.exit(1);}
const banner=re=>{const i=re.exec(fs.readFileSync(HTML,'utf8'));return i?i[1]:null;};

const old=fs.readFileSync(HTML,'utf8');
const lines=old.split(/\r?\n/);
const iOpen=lines.findIndex(l=>l.trim()==='<script>');
const iClose=lines.findIndex((l,i)=>i>iOpen&&l.trim()==='</script>');
if(iOpen<0||iClose<0){console.error('bornes <script> introuvables');process.exit(1);}
const head=lines.slice(0,iOpen).join('\n');
const tail=lines.slice(iClose+1).join('\n'); // la ligne </script> est reconstruite

// le corps de chaque fichier source, precedé de son bandeau de section
const chunks=parts.map(f=>{
  const body=fs.readFileSync(path.join(SRC,f),'utf8').replace(/\s+$/,'');
  const titre=f.replace(/^\d\d-/,'').replace(/\.js$/,'').replace(/-/g,' ');
  return '/* ═══════════════ '+f+' — '+titre+' ═══════════════ */\n'+body;
});
// CRLF pur : convention du projet (le fichier d'origine est en CRLF)
const out=(head+'\n<script>\n'+chunks.join('\n\n')+'\n</script>\n'+tail).replace(/\r\n/g,'\n').replace(/\n/g,'\r\n');

if(process.argv.indexOf('--check')>=0){
  if(out!==old){
    console.error('✗ fusion_mvp.html est PÉRIMÉ :_src/ a changé sans rebuild.');
    console.error('  Lancez : node build.js');
    process.exit(1);
  }
  console.log('✓ fusion_mvp.html à jour ('+parts.length+' fichiers source)');
  process.exit(0);
}
if(out===old){console.log('✓ rien à reconstruire ('+parts.length+' fichiers source)');process.exit(0);}
fs.writeFileSync(HTML,out,'utf8');
console.log('✓ fusion_mvp.html reconstruit : '+parts.length+' fichiers, '+
  out.split(/\r?\n/).length+' lignes, '+(out.length/1024).toFixed(0)+' Ko');
