/**
 * 网关入口：路由、静态、API、首屏 HTML
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import type { ListInitData } from "@aura/contract";
import { listData } from "./business/list.js";
import { listPageHtml } from "./ssr/html.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const frontendDist = process.env.FRONTEND_DIST || path.join(__dirname, "../../frontend/apps/list/dist");

app.use("/assets", express.static(path.join(frontendDist, "assets"), { index: false }));

app.get("/health", (_req, res) => {
  res.type("text/plain").send("ok");
});

app.get("/api/list", (_req, res) => {
  const list = listData();
  const payload: ListInitData = { scene: "list", list };
  res.json(payload);
});

function handleListPage(_req: express.Request, res: express.Response): void {
  const list = listData();
  const initData: ListInitData = { scene: "list", list };
  res.type("html").send(listPageHtml(initData));
}

app.get("/", handleListPage);
app.get("/list", handleListPage);

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
