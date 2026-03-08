/**
 * 网关入口：路由、静态、API、首屏 HTML；启动时注入 site base，不读 env
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import type { ListInitData, ArticleInitData } from "@aura/contract";
import { setSiteBase } from "@aura/site";
import { listData, getArticle, getListHref } from "./business/list.js";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from "./business/store.js";
import { listPageHtml, articlePageHtml } from "./ssr/html.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 启动时注入 base URL：首个 CLI 参数，缺省为开发环境 http://localhost:4000
setSiteBase(process.argv[2] ?? "http://localhost:4000");

const app = express();

/** 显式配置：端口与前端构建产物路径（均相对于 backend 所在目录 = app/backend） */
const PORT = 4000;
const listDist = path.join(__dirname, "../../frontend/apps/list/dist");
const articleDist = path.join(__dirname, "../../frontend/apps/article/dist");
const adminDist = path.join(__dirname, "../../frontend/apps/admin/dist");

app.use("/assets", express.static(path.join(listDist, "assets"), { index: false }));
app.use("/assets-article", express.static(path.join(articleDist, "assets"), { index: false }));
app.use("/assets-admin", express.static(path.join(adminDist, "assets"), { index: false }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.type("text/plain").send("ok");
});

app.get("/api/list", async (_req, res) => {
  const list = await listData();
  const payload: ListInitData = { scene: "list", list };
  res.json(payload);
});

/** 管理页：文章列表 */
app.get("/api/articles", async (_req, res) => {
  res.json(await getArticles());
});

/** 管理页：单篇文章 */
app.get("/api/articles/:id", async (req, res) => {
  const row = await getArticleById(req.params.id);
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(row);
});

/** 管理页：新建文章 */
app.post("/api/articles", async (req, res) => {
  try {
    const body = (req.body ?? {}) as Record<string, string | undefined>;
    const title = body.title ?? "";
    const summary = body.summary ?? "";
    const meta = body.meta ?? "";
    const content = body.content ?? "";
    if (!title.trim()) {
      res.status(400).json({ error: "title required" });
      return;
    }
    const row = await createArticle({
      title: title.trim(),
      summary: summary.trim(),
      meta: meta.trim(),
      content: content.trim(),
    });
    res.status(201).json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[POST /api/articles]", e);
    res.status(500).json({ error: "create failed", detail: msg });
  }
});

/** 管理页：更新文章 */
app.put("/api/articles/:id", async (req, res) => {
  const { title, summary, meta, content } = req.body as Record<string, string | undefined>;
  const patch: Record<string, string> = {};
  if (title !== undefined) patch.title = String(title).trim();
  if (summary !== undefined) patch.summary = String(summary).trim();
  if (meta !== undefined) patch.meta = String(meta).trim();
  if (content !== undefined) patch.content = String(content).trim();
  const row = await updateArticle(req.params.id, patch);
  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(row);
});

/** 管理页：删除文章 */
app.delete("/api/articles/:id", async (req, res) => {
  const ok = await deleteArticle(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.status(204).send();
});

/** CSR 兜底：无 __INIT_DATA__ 时前端 POST 此接口直接拿 InitData JSON */
app.post("/page", async (req, res) => {
  const { scenecode, params = {} } = req.body as { scenecode?: string; params?: { slug?: string } };
  if (scenecode === "list" || scenecode === "home") {
    const list = await listData();
    const initData: ListInitData = { scene: "list", list };
    res.json(initData);
    return;
  }
  if (scenecode === "article") {
    const slug = params?.slug;
    if (!slug) {
      res.status(400).json({ error: "missing slug" });
      return;
    }
    const article = await getArticle(slug);
    if (!article) {
      res.status(404).json({ error: "article not found" });
      return;
    }
    const initData: ArticleInitData = { scene: "article", article, listHref: getListHref() };
    res.json(initData);
    return;
  }
  res.status(400).json({ error: "unknown scenecode" });
});

async function handleListPage(_req: express.Request, res: express.Response): Promise<void> {
  const list = await listData();
  const initData: ListInitData = { scene: "list", list };
  res.type("html").send(listPageHtml(initData, { serverGeneratedAt: Date.now() }));
}

app.get("/", handleListPage);
app.get("/list", handleListPage);

app.get("/article/:id", async (req, res) => {
  const article = await getArticle(req.params.id);
  if (!article) {
    res.status(404).send("Not Found");
    return;
  }
  const initData: ArticleInitData = { scene: "article", article, listHref: getListHref() };
  res.type("html").send(articlePageHtml(initData, { serverGeneratedAt: Date.now() }));
});

/** 管理页：返回 admin 应用的 HTML（MPA） */
app.get("/admin", (_req, res) => {
  res.type("html").send(adminPageHtml());
});
app.get("/admin/*", (_req, res) => {
  res.type("html").send(adminPageHtml());
});

function adminPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>文章管理</title>
  <link rel="stylesheet" href="/assets-admin/index.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets-admin/index.js"></script>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
