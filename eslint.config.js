// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const ext = [
  //file extensions to lint
  "ts",
  "tsx",
  "jsx",
  "js",
  "mjs",
  "css",
  "html",
  "md"
].join(",");


export default tseslint.config(
  {
    // Ignore build artifacts and global pnpm files across all workspaces
    ignores: [
      '**/dist/',
      '**/build/',
      '**/node_modules/',
      '.pnpm-store/',
    ],
  },
  {
    // Base recommended settings for JS and TS
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    files: [
      `apps/**/*.{ ${ext} } `, 
      `packages/**/*{ ${ext} }`
    ],
    rules: {
      // Add your custom workspace-wide rules here
    },
  }
);


