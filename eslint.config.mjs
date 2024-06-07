import { fixupConfigRules, fixupPluginRules } from "@eslint/compat"
import globals from "globals"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import _import from "eslint-plugin-import"
import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ["**/dist/"],
  },
  ...fixupConfigRules(
    compat.extends("eslint:recommended", "plugin:import/recommended", "prettier")
  ),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/strict",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:@typescript-eslint/recommended",
      "prettier"
    )
  ).map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs"],
  })),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mjs"],

    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        tsconfigRootDir: "/home/folke/projects/lovelace-styler",
        project: true,
      },
    },

    settings: {
      "import/resolver": {
        typescript: {},
      },
    },

    rules: {
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default-member": "off",
      "import/named": "off",
      "import/extensions": "off",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-unresolved": "off",
      "import/no-duplicates": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "array-callback-return": "error",
      "prefer-template": "warn",
      "prefer-promise-reject-errors": "error",
      "require-unicode-regexp": "error",
      "prefer-spread": "error",

      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
]

