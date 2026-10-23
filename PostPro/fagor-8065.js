/* ───────────────────────────────────────────────────────────────────────────
   Machine : Fagor 8065 (3 axes)
   Post-processeur MiniFusion : UN FICHIER PAR MACHINE dans PostPro/.
   Nouvelle machine : copier ce fichier, changer id / label / réglages, puis
   lancer `npm run build` (le fichier est intégré au livrable fusion_mvp.html).

   Repères dans les modèles de lignes : {T} n° d'outil, {S} vitesse de broche,
   {ZRETR} plan de retrait (repère pièce), {NAME} nom du programme.
   ─────────────────────────────────────────────────────────────────────────── */
faoMachine({
  id: 'fagor8065',               // identifiant enregistré dans les projets : ne pas le changer
  label: 'Fagor 8065',           // nom affiché dans la liste des machines
  kind: 'fagor',                 // dialecte : 'siemens' (840D) ou 'fagor' (8065)
  ext: 'nc',                     // extension du programme exporté
  axes: 3,                       // 3 : aucun axe rotatif commandé (3+2 ignoré, avertissement)
  numbers: { start: 10, step: 5 },  // lignes N10, N15, N20…
  coolant: { flood: 'M08', through: 'M08', off: 'M09' },  // arrosage, centre outil, arrêt
  toolChange: ['T{T} D1 M06'],   // changement d'outil (une ligne par élément)
  spindle: 'S{S} M03',           // mise en rotation
  end: ['G0 Z{ZRETR}', '#MSG[""]', 'M30']   // fin : après l'arrêt d'arrosage (efface le message opération)
});
