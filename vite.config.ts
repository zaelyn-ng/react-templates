import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

// Library build
export default defineConfig({
  plugins: [react(), dts({ include: ["src"], rollupTypes: false })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "UiSections",
      fileName: (format) => (format === "es" ? "ui-sections.js" : "ui-sections.cjs"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
