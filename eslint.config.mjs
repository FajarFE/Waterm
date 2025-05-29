import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extend Next.js and TypeScript rules
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Custom rule overrides and plugin usage
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      // Plugin: eslint-plugin-unused-imports
      // 'unused-imports/no-unused-imports': 'error',
      // 'unused-imports/no-unused-vars': [
      //   'warn',
      //   {
      //     vars: 'all',
      //     varsIgnorePattern: '^_',
      //     args: 'after-used',
      //     argsIgnorePattern: '^_',
      //   },
      // ],
      // // Built-in no-unused-vars (backup for compatibility)
      // 'no-unused-vars': [
      //   'warn',
      //   {
      //     vars: 'all',
      //     varsIgnorePattern: '^_',
      //     args: 'after-used',
      //     argsIgnorePattern: '^_',
      //   },
      // ],
      // // Duplicate imports
      // 'no-duplicate-imports': ['error', { includeExports: true }],
      // // Import rules (plugin: import)
      // 'import/first': 'error',
      // 'import/exports-last': 'error',
      // 'import/no-duplicates': 'error',
      // 'import/no-unresolved': ['error', { ignore: ['^@/'] }],
      // 'import/named': 'error',
      // 'import/default': 'error',
      // 'import/namespace': 'error',
      // 'import/no-named-as-default': 'error',
      // 'import/no-named-as-default-member': 'error',
      // 'import/no-anonymous-default-export': [
      //   'error',
      //   {
      //     allowArray: false,
      //     allowArrowFunction: false,
      //     allowAnonymousClass: false,
      //     allowAnonymousFunction: false,
      //     allowCallExpression: false,
      //     allowLiteral: false,
      //     allowObject: false,
      //     allowNew: false,
      //   },
      // ],
      // 'import/no-self-import': 'error',
      // 'import/no-cycle': [
      //   'error',
      //   { maxDepth: Infinity, ignoreExternal: true },
      // ],
      // 'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
      // 'import/no-relative-packages': 'error',
      // 'import/no-relative-parent-imports': 'error',
    },
  },

  // File patterns to ignore
];
