import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vitest from "@vitest/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["test/yarn-*.cjs", "**/dist", "**/coverage"]),
  {
    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
    ),

    plugins: { "@typescript-eslint": typescriptEslint },

    languageOptions: {
      globals: { ...globals.builtin, ...globals.mocha },

      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: "commonjs",
    },

    rules: { "no-console": "off" },
  },
  eslintPluginUnicorn.configs.recommended,
  { files: ["**/*.cts"], rules: { "unicorn/prefer-module": "off" } },
  {
    files: ["**/*.js"],

    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["test/**"], // or any other pattern
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
]);
