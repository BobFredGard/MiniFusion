/* Écriture de l'espace PLAN (ISO 3098) : h = hauteur des MAJUSCULES, en mm papier,
   prise dans la série normalisée en √2 (comme les formats de papier).
   Recommandations courantes : cotes et notes 3,5 (2,5 mini ; 1,8 toléré en A4),
   repères et titres de vue un cran au-dessus (5), titres 7.
   Réglages « Paramètres — Plan » (section Écriture), mémorisés localement. */
const MEP_TEXT_STYLE = {
  iso: [1.8, 2.5, 3.5, 5, 7, 10, 14, 20],
  capRatio: 0.716, // majuscule / corps de la police sans-serif (Arial) : corps = h / capRatio
  dimH: 3.5,       // chiffres et textes de cote
  lblH: 5,         // lettres de coupe / détail, titres de vue
  noteH: 3.5       // textes et champs posés (valeur par défaut des nouveaux)
};

/* Paramètres de style des cotes de l'espace PLAN.
   Valeurs par défaut ; l'utilisateur peut les régler dans
   « Paramètres — Plan » (section Cotation), réglages mémorisés localement.
   Unités : millimètres papier, sauf arrowAngle (degrés). */
const MEP_DIM_STYLE = {
  gap: 1.5,        // vide entre la pièce et le début du trait de rappel
  overrun: 2,      // dépassement du rappel au-delà de la ligne de cote
  leaderGap: 1.5,  // vide entre le bord et le trait de diamètre opposé
  arrowAngle: 36,  // ouverture totale de la pointe de flèche (ancien : ~46°)
  arrowLen: 7,     // longueur du marker SVG (unités de trait)
  textHeight: +(MEP_TEXT_STYLE.dimH / MEP_TEXT_STYLE.capRatio).toFixed(3), // CORPS du texte de cote, dérivé de MEP_TEXT_STYLE.dimH
  color: 'theme'  // cotes à l'écran : 'theme' = accent du thème, ou '#rrggbb' ; export et impression : noir (ISO)
};
