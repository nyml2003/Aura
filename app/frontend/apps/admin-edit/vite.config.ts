import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    proxy: { "/api": { target: "http://localhost:4000", changeOrigin: true } },
  },
  resolve: {
    alias: {
      "@aura/admin-common": path.resolve(__dirname, "../../packages/admin-common/src/index.ts"),
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
