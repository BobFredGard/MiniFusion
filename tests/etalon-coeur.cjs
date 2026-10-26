// Étalonnage d'un cœur pour tests/run.cjs : petite boucle de calcul (flottants, tableau),
// lancée épinglée sur un seul cœur logique ; écrit sa durée en ms.
const a = new Float64Array(4096), t = Date.now();
let x = 0;
for (let i = 0; i < 4e7; i++) { a[i & 4095] = Math.sqrt(i + a[(i * 7) & 4095]); x += a[i & 4095] % 3 | 0; }
console.log(Date.now() - t, x > 0);
