// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1) Ignore build / noise folders
  {
    ignores: ['dist', 'coverage', 'node_modules', 'eslint.config.mjs'],
  },

  // 2) JS / CJS / MJS files
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    ...eslint.configs.recommended,
  },

  // 3) Type-checked TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        // TS 5+ projectService is fine here, uses your tsconfig.json
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    extends: [
      // TS-ESLint recommended + type-checked rules
      ...tseslint.configs.recommendedTypeChecked,
      // If you ever want stricter rules, you can add:
      // ...tseslint.configs.strictTypeChecked,
    ],
    rules: {
      // reasonable defaults for a NestJS backend
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // keep other unsafe rules on, they help a lot with bugs
    },
  },

  // 4) Optional DTO scope overrides, if you ever need them
  {
    files: ['src/**/dto/**/*.ts', 'src/**/*.input.ts', 'src/**/*.dto.ts'],
    rules: {
      // If decorators ever trigger false positives, you can relax them here:
      // '@typescript-eslint/no-unsafe-call': 'off',
      // '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // 5) Prettier integration (MUST be near the end)
  eslintPluginPrettierRecommended,

  // 6) Last override: make prettier/prettier a WARNING instead of ERROR
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
);
