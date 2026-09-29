// ---------- Coque (shell) button ----------
// Creates button btnCoque and inserts it into the toolbar near other tools
(function(){
  if(document.getElementById('btnCoque'))return;
  const after=document.getElementById('btnDraft')||document.getElementById('btnExtrude');
  if(!after||!after.parentNode)return;
  const b=document.createElement('button');
  b.id='btnCoque';
  b.textContent='⚙ Coque';
  b.title='Créer une coque (shell) à partir du solide exact.';
  after.parentNode.insertBefore(b,after.nextSibling);
})();
