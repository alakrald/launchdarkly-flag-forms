import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "launchdarkly-flag-form",
      fileName: (format) => `launchdarkly-flag-form-lib.${format}.js`,
      formats: ["cjs", "es"]
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies || {})]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: [
    dts({
      outDir: "dist",
      insertTypesEntry: true
    }), 
    react()
  ]
});        