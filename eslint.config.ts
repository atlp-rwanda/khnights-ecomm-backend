// import globals from 'globals'
// import pluginJs from '@eslint/js'
// import tseslint from 'typescript-eslint'

// export default [
//   { languageOptions: { globals: globals.browser } },
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended
// ]
module.exports = {
  root: true, // Set root to true to stop ESLint from searching for parent configuration files
  env: {
    node: true // Set environment to Node.js
  },
  parser: '@typescript-eslint/parser', // Specify the TypeScript parser
  parserOptions: {
    ecmaVersion: 2016, // Set ECMAScript version to 2021 (or appropriate version)
    sourceType: 'module' // Set source type to module
  },
  extends: ['eslint:recommended'], // Use recommended ESLint rules
  rules: {
    // Add custom rules here
    // For example:
    // 'no-console': 'off', // Disable 'no-console' rule
  }
}
