/* Paramètres de style des cotes de l'espace PLAN.
   Modifier ces valeurs puis relancer `node build.js` (le livrable est reconstruit).
   Unités : millimètres papier, sauf arrowAngle (degrés). */
const MEP_DIM_STYLE = {
  gap: 1.5,        // vide entre la pièce et le début du trait de rappel
  overrun: 2,      // dépassement du rappel au-delà de la ligne de cote
  leaderGap: 1.5,  // vide entre le bord et le trait de diamètre opposé
  arrowAngle: 36,  // ouverture totale de la pointe de flèche (ancien : ~46°)
  arrowLen: 7      // longueur du marker SVG (unités de trait)
};
