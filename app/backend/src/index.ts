/**
 * 网关入口：路由、静态、API、首屏 HTML；启动时注入 site base，不读 env
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import type { ListInitData, ArticleInitData } from "@aura/contract";
import { setSiteBase } from "@aura/site";
import { listData, getArticle, getListHref } from "./business/list.js";
import { listPageHtml, articlePageHtml } from "./ssr/html.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 启动时注入 base URL：首个 CLI 参数，缺省为开发环境 http://localhost:4000
setSiteBase(process.argv[2] ?? "http://localhost:4000");

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
  res.type("html").send(listPageHtml(initData, { serverGeneratedAt: Date.now() }));
}

app.get("/", handleListPage);
app.get("/list", handleListPage);

app.get("/article/:id", (req, res) => {
  const article = getArticle(req.params.id);
  if (!article) {
    res.status(404).send("Not Found");
    return;
  }
  const initData: ArticleInitData = { scene: "article", article, listHref: getListHref() };
  res.type("html").send(articlePageHtml(initData, { serverGeneratedAt: Date.now() }));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
