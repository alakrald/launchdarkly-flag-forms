import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "@launchdarkly/flag-forms",
      fileName: (format) => `index.${format}.js`,
      formats: ["cjs", "es"]
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies || {})]
    },
    sourcemap: true,
    emptyOutDir: true
  },
  plugins: [dts()]
});        