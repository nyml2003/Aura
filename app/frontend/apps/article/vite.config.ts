import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    proxy: {
      "/page": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@aura/contract": path.resolve(__dirname, "../../../contract/src/index.ts"),
      "@aura/request-sdk": path.resolve(__dirname, "../../packages/request-sdk/src/index.ts"),
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
