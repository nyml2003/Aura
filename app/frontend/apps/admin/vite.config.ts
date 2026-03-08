import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@aura/app-common": path.resolve(__dirname, "../../packages/app-common/src/index.ts"),
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
