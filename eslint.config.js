const globals = require('globals');

// Lint du SCRIPT CONCATÉNÉ (même ordre que build.js) : les fonctions déclarées
// dans un fichier source sont visibles depuis les autres, exactement comme dans
// le livrable. On active d'abord les règles à fort rendement ; le reste viendra
// progressivement (pas de reformatage massif).
module.exports = [
  {
    ignores: [
      'node_modules/**',
      'threejs/**',
      'occt/**',
      'Backup/**',
      'Exemples/**',
      'docs/**',
      'fusion_mvp.html'
    ]
  },
  {
    files: ['.lint-bundle.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.worker,
        THREE: 'readonly',
        CSG: 'readonly',
        FAO_DEBUG_SLIDE: 'readonly',
        onResize: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-empty': ['warn', { allowEmptyCatch: false }],
      'no-unused-vars': 'off',
      'no-redeclare': 'off'
    }
  }
];
