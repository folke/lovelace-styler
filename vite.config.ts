// https://vitejs.dev/config/
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
    },
  },
  esbuild: {
    legalComments: "none",
  },
})
