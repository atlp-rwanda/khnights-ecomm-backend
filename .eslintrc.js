// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
    'no-undef': 'off',
    'semi': ['warn', 'always'],
    'no-multi-spaces': 'warn',
    'no-trailing-spaces': 'warn',
    'space-before-function-paren': ['warn', 'always'],
    'func-style': ['warn', 'declaration', { 'allowArrowFunctions': true }],
    'camelcase': 'warn',
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/explicit-member-accessibility': ['off', { accessibility: 'explicit' }],
    'no-unused-vars': 'warn',
    'no-extra-semi': 'warn',
  },
};