import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Demo app (also what gets deployed to GitHub Pages)
export default defineConfig({
  root: "demo",
  base: "./",
  plugins: [react()],
  build: { outDir: "../demo-dist", emptyOutDir: true },
});
