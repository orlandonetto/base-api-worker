import importPlugin from 'eslint-plugin-import'
import importHelpers from 'eslint-plugin-import-helpers'
import prettier from 'eslint-plugin-prettier'

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import tsparser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 13,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      prettier,
      import: importPlugin,
      'import-helpers': importHelpers,
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'no-plusplus': 'off',
      'no-continue': 'off',
      camelcase: 'off',
      'import/no-unresolved': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: true },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          custom: { regex: '^Type[A-Z]', match: true },
        },
      ],
      'class-methods-use-this': 'off',
      'import/prefer-default-export': 'off',
      'no-shadow': 'off',
      'no-console': 'warn',
      'no-useless-constructor': 'off',
      'no-empty-function': 'off',
      'lines-between-class-members': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { ts: 'never', js: 'never' },
      ],
      'import-helpers/order-imports': [
        'warn',
        {
          newlinesBetween: 'always',
          groups: ['module', '/^@/', ['parent', 'sibling', 'index']],
          alphabetize: { order: 'asc', ignoreCase: true },
        },
      ],
      'import/no-extraneous-dependencies': [
        'off',
        { devDependencies: ['**/*.spec.js'] },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '_' },
      ],
      'no-restricted-syntax': 'off',
      'no-global-assign': 'error',
      'generator-star-spacing': 'off',
      'no-var': 'error',
      semi: 'off',
      'no-underscore-dangle': 'off',
      'no-param-reassign': 'off',
      'no-promise-executor-return': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
    ignores: ['node_modules', 'dist', 'coverage'],
  },
]
