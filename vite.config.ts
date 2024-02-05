// https://vitejs.dev/config/
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/styler.ts",
      formats: ["es"],
    },
  },
  esbuild: {
    legalComments: "none",
  },
});
