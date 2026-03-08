#!/usr/bin/env node
/**
 * 将 contract、site 的 dist 复制到 backend/node_modules/@aura/xxx/dist，
 * 避免 pnpm 链接在 Windows 下解析不到 dist 的问题。
 */
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "..");
const nodeModules = path.join(backendDir, "node_modules/@aura");

function syncDist(pkgName, relativeSrc) {
  const src = path.join(backendDir, relativeSrc);
  const dest = path.join(nodeModules, pkgName, "dist");
  if (!fs.existsSync(src)) {
    console.error(`[prepare-site] 缺少 ${relativeSrc}，请先构建: pnpm --dir ../${pkgName} run build`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isFile()) fs.copyFileSync(s, d);
  }
  console.log(`[prepare-site] 已同步 ${pkgName}/dist`);
}

syncDist("contract", "../contract/dist");
syncDist("site", "../site/dist");
