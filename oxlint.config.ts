import { defineConfig } from "oxlint"

export default defineConfig({
  categories: {
    correctness: "error",
  },
  env: {
    web: true,
  },
  ignorePatterns: ["dist/**"],
  options: {
    reportUnusedDisableDirectives: "warn",
    typeAware: true,
    typeCheck: true,
  },
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import"],
  rules: {
    eqeqeq: ["error", "always", { null: "ignore" }],
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import/no-cycle": "error",
    "import/no-duplicates": "error",
    "import/no-named-as-default-member": "error",
    "typescript/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
    "typescript/no-deprecated": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/prefer-nullish-coalescing": ["error", { ignoreConditionalTests: true }],
    "typescript/prefer-optional-chain": "error",
    "unicorn/prefer-module": "error",
    "unicorn/prefer-node-protocol": "error",
  },
  overrides: [
    {
      files: ["*.config.ts", "tests/**/*.mjs"],
      env: { node: true },
    },
    {
      files: ["tests/**/*.mjs"],
      rules: {
        // node:test owns the lifecycle and failures of registered tests.
        "typescript/no-floating-promises": [
          "error",
          { allowForKnownSafeCalls: [{ from: "package", name: "test", package: "node" }] },
        ],
      },
    },
  ],
})
