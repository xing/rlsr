module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  globals: {
    Class: true,
    Event: true,
    jest: true,
  },
  env: {
    jest: true,
    browser: true,
  },
  rules: {
    'prettier/prettier': 2,
    'no-mixed-operators': 0,
    'no-console': 2,
    'import/default': 2,
    'import/export': 2,
    'import/named': 2,
    'import/no-duplicates': 2,
    'import/no-webpack-loader-syntax': 0,
    'import/no-internal-modules': 0,
    'import/no-named-as-default-member': 2,
    'import/no-named-as-default': 0,
    'import/no-named-default': 2,
    'import/no-extraneous-dependencies': [
      2,
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: true,
      },
    ],

    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'import/order': [1, { 'newlines-between': 'always-and-inside-groups' }],
    'max-lines-per-function': 0,
    'prefer-const': 0,
    'react/no-children-prop': 0,
    'react/jsx-fragments': [1, 'element'],
    'sort-imports': 0,
    'sort-vars': 0,
    // These rules are never needed when using Prettier
    'array-bracket-newline': 0,
    'array-bracket-spacing': 0,
    'array-element-newline': 0,
    'arrow-parens': 0,
    'arrow-spacing': 0,
    'block-spacing': 0,
    'brace-style': 0,
    'comma-dangle': 0,
    'comma-spacing': 0,
    'comma-style': 0,
    'computed-property-spacing': 0,
    camelcase: 0,
    'dot-location': 0,
    'eol-last': 0,
    'func-call-spacing': 0,
    'function-paren-newline': 0,
    'generator-star': 0,
    'generator-star-spacing': 0,
    'implicit-arrow-linebreak': 0,
    // note you must disable the base rule as it can report incorrect errors
    // @SEE: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md#how-to-use
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'react/prop-types': ['off'],
      },
    },
    {
      files: ['integration-test/**/*', '**/_common/**/*'],
      rules: { 'import/no-extraneous-dependencies': ['off'] },
    },
  ],
};
