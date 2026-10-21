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
  textHeight: 7,   // hauteur du texte de cote (mm papier)
  color: 'theme'  // cotes à l'écran : 'theme' = accent du thème, ou '#rrggbb' ; export et impression : noir (ISO)
};
