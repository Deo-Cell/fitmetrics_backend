const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      // -- Bonnes pratiques --
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'warn',           // Forcer l'utilisation du Logger singleton au lieu de console.log
      'eqeqeq': ['error', 'always'],  // Toujours utiliser === pour éviter les coercions implicites
      'no-var': 'error',              // Utiliser let/const (ES6+)
      'prefer-const': 'error',        // Utiliser const quand la variable n'est pas réassignée
      'no-throw-literal': 'error',    // Toujours throw une Error, pas une string
      'consistent-return': 'warn',    // Toutes les branches d'une fonction doivent return ou pas
      'no-param-reassign': 'warn',    // Éviter la mutation des paramètres
      // -- Qualité --
      'no-duplicate-imports': 'error', // Pas d'imports dupliqués
      'no-shadow': 'warn',            // Éviter les variables qui masquent une variable du scope parent
    },
  },
  {
    ignores: ['node_modules/', 'coverage/', 'tests/'],
  },
];
