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
const adminListDist = path.join(__dirname, "../../frontend/apps/admin-list/dist");
const adminNewDist = path.join(__dirname, "../../frontend/apps/admin-new/dist");
const adminEditDist = path.join(__dirname, "../../frontend/apps/admin-edit/dist");

app.use("/assets", express.static(path.join(listDist, "assets"), { index: false }));
app.use("/assets-article", express.static(path.join(articleDist, "assets"), { index: false }));
app.use("/assets-admin-list", express.static(path.join(adminListDist, "assets"), { index: false }));
app.use("/assets-admin-new", express.static(path.join(adminNewDist, "assets"), { index: false }));
app.use("/assets-admin-edit", express.static(path.join(adminEditDist, "assets"), { index: false }));
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
    res.status(201).json({ ...row, redirect: "/admin" });
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
  res.json({ ...row, redirect: "/admin" });
});

/** 管理页：删除文章 */
app.delete("/api/articles/:id", async (req, res) => {
  const ok = await deleteArticle(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({ redirect: "/admin" });
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

/** 管理后台：独立页面，按路由返回对应 HTML 与脚本 */
app.get("/admin", (_req, res) => {
  res.type("html").send(adminListPageHtml());
});
app.get("/admin/articles/new", (_req, res) => {
  res.type("html").send(adminNewPageHtml());
});
app.get("/admin/articles/:id/edit", async (req, res) => {
  const row = await getArticleById(req.params.id);
  if (!row) {
    res.status(404).send("Not Found");
    return;
  }
  res.type("html").send(adminEditPageHtml(req.params.id, row));
});

function adminListPageHtml(): string {
  return adminPageShell("文章列表 - 文章管理", "/assets-admin-list", undefined, undefined);
}

function adminNewPageHtml(): string {
  return adminPageShell("新建文章 - 文章管理", "/assets-admin-new", undefined, undefined);
}

function adminEditPageHtml(id: string, article: { id: string; title: string; summary: string; meta: string; content: string }): string {
  return adminPageShell("编辑文章 - 文章管理", "/assets-admin-edit", id, article);
}

/** 注入到 script 内的 JSON 需转义，避免打断 HTML */
function escapeScriptJson(json: string): string {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function adminPageShell(
  title: string,
  assetsBase: string,
  editId?: string,
  editData?: { id: string; title: string; summary: string; meta: string; content: string }
): string {
  let scriptInject = "";
  if (editId != null) {
    scriptInject += `<script>window.__ADMIN_EDIT_ID__=${JSON.stringify(editId)};</script>\n  `;
  }
  if (editData != null) {
    scriptInject += `<script>window.__ADMIN_EDIT_DATA__=JSON.parse(${JSON.stringify(escapeScriptJson(JSON.stringify(editData)))});</script>\n  `;
  }
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${assetsBase}/index.css" />
</head>
<body>
  <div id="root"></div>
  ${scriptInject}<script type="module" src="${assetsBase}/index.js"></script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
