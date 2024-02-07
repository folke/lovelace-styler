// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  ignorePatterns: ["dist/"],
  env: {
    browser: true,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.mjs"],
      plugins: ["@typescript-eslint", "import"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended",
        "prettier",
      ],
      settings: {
        "import/resolver": {
          typescript: {},
        },
      },
      parserOptions: {
        // eslint-disable-next-line no-undef
        tsconfigRootDir: __dirname,
        project: true,
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
        "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/consistent-type-imports": "error",
      },
    },
  ],
}
