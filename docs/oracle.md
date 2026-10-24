# Tests de référence

Généré par `node tests/test_oracle.cjs --ecrire`. Chaque pièce de [`tests/oracle/cas.cjs`](../tests/oracle/cas.cjs) est décrite par une petite recette ; MiniFusion la construit avec son noyau exact et mesure **volume**, **surface**, **centre de gravité** et **encombrement**, comparés à des valeurs **calculées à la main** (formules ci-dessous). Aucune valeur attendue ne vient d’un logiciel de CAO.

Tolérances : volume et surface 10⁻⁶ en relatif, centre de gravité et encombrement 10⁻⁶ mm. La suite tourne à chaque version (CI).

| Pièce | Mesures | Résultat | Écart max | Formules |
|---|---|---|---|---|
| Parallélépipède 60 × 40 × 20 | V, A, G, boîte | ✅ | — | V = abc ; A = 2(ab + bc + ca) ; G au centre |
| Cylindre r 10, h 30 | V, A, G, boîte | ✅ | cz : 1.8e-15 | V = πr²h ; A = 2πrh + 2πr² |
| Plaque 60 × 40 × 10, trou Ø 10 traversant (découpe) | V, A, G, boîte | ✅ | cy : 3.6e-15 | V = abh − πr²h ; A = 2(ab − πr²) + 2(a + b)h + 2πrh |
| Tube par révolution : profil r 5…15, z 0…10, 360° | V, A, G, boîte | ✅ | cx : 4.5e-16 | V = π(R² − r²)h ; A = 2π(R² − r²) + 2πRh + 2πrh |
| Même profil, révolution de 90° | V, A, G | ✅ | cr : 1.8e-15 | secteur θ = π/2 : V = (θ/2)(R² − r²)h ; distance de G à l’axe = (2/3)(R³ − r³)/(R² − r²)·2·sin(θ/2)/θ |
| Bloc 40 × 40 × 20 percé d’un cylindre r 10 (découpe) | V, A, G, boîte | ✅ | cz : 1.8e-15 | V = a²h − πr²h ; A = 2(a² − πr²) + 4ah + 2πrh |
| Deux corps séparés : cube 20 et cube 10 (nouveau corps) | V, A, G, boîte | ✅ | cx : 1.8e-15 | G = Σ Vᵢ Gᵢ / Σ Vᵢ |
| Combiner (union) : 0…20 et 10…30 en X, 20 × 20 | V, A, G, boîte | ✅ | — | union = parallélépipède 30 × 20 × 20 |
| Combiner (intersection) : même paire | V, A, G, boîte | ✅ | cx : 1.8e-15 | intersection = parallélépipède 10 × 20 × 20 |
| Cube 10 sur un plan incliné de 45° autour de X | V, A, G | ✅ | cx : 8.9e-16 | G = o + 5u + 5v + 5n |
| Perçage borgne Ø 10, profondeur 10, pointe 118°, dans une plaque 40 × 40 × 20 | V, boîte | ✅ | v : 2.3e-16 | V = a²h − πr²p − πr²·(r / tan 59°)/3 (cône de pointe) |
| Perçage lamé : Ø 8 débouchant, lamage Ø 16 × 5, plaque 40 × 40 × 20 | V, A, boîte | ✅ | a : 1.3e-16 | V = a²h − πR²h₁ − πr²(h − h₁) ; A = faces planes − ouvertures + parois du lamage et du trou |

Ajouter un cas : une entrée dans `tests/oracle/cas.cjs` (recette + valeurs attendues + formules), puis `node tests/test_oracle.cjs --ecrire`.
