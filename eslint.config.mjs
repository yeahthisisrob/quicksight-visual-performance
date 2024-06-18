import typescriptParser from "@typescript-eslint/parser";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginTypeScript from "@typescript-eslint/eslint-plugin";

/** @type {Linter.FlatConfig[]} */
export default [
  {
    ignores: ["node_modules/", "dist/", "**/dist/**"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": eslintPluginTypeScript,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      ...eslintPluginTypeScript.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
];
