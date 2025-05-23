import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  build: {
    rollupOptions: {
      output: {
        format: "es",
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  worker: {
    format: "es",
  },
});
