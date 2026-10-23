/* ───────────────────────────────────────────────────────────────────────────
   Machine : Siemens SINUMERIK 840D — « 1520 » (5 axes, table B/C)
   Post-processeur MiniFusion : UN FICHIER PAR MACHINE dans PostPro/.
   Nouvelle machine : copier ce fichier, changer id / label / réglages, puis
   lancer `npm run build` (le fichier est intégré au livrable fusion_mvp.html).

   Repères dans les modèles de lignes : {T} n° d'outil, {S} vitesse de broche,
   {ZRETR} plan de retrait (repère pièce), {NAME} nom du programme.
   ─────────────────────────────────────────────────────────────────────────── */
faoMachine({
  id: 'siemens1520',             // identifiant enregistré dans les projets : ne pas le changer
  label: 'Siemens 840D · 1520',  // nom affiché dans la liste des machines
  kind: 'siemens',               // dialecte : 'siemens' (840D) ou 'fagor' (8065)
  ext: 'mpf',                    // extension du programme exporté
  axes: 5,                       // 5 : indexation 3+2 commandée (TRAORI, B/C) ; 3 : usinage à plat
  numbers: null,                 // numérotation des lignes : null, ou { start: 10, step: 5 }
  coolant: { flood: 'M7', through: 'M8', off: 'M9' },   // arrosage, centre outil, arrêt
  toolChange: ['T{T} D1', 'M6'],  // changement d'outil (une ligne par élément)
  spindle: 'S{S} M3',            // mise en rotation
  end: ['G0 SUPA Z600 D0', 'G0 X-430', 'M30']   // fin : après l'arrêt d'arrosage
});
