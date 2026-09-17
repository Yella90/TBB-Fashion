import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  // Fichiers ignorés
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'dist/**',
      '*.config.mjs',
      '*.config.js',
    ],
  },

  // Base JS
  js.configs.recommended,

  // TypeScript
  ...tseslint.configs.recommended,

  // React
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // ============================================
      // Regles assouplies pour permettre le build
      // ============================================

      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',

      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];