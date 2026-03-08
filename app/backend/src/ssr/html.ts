/**
 * 首屏 HTML：空壳 + __INIT_DATA__，列表由前端 hydrate 渲染
 */
import type { ListInitData, ArticleInitData } from "@aura/contract";
import { INIT_DATA_ID } from "@aura/contract";

function escapeScriptPayload(json: string): string {
  return json.replace(/<\//g, "<\\/");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export interface PageHtmlOptions {
  serverGeneratedAt?: number;
}

export function listPageHtml(initData: ListInitData, options: PageHtmlOptions = {}): string {
  return pageShell("文章列表", initData, options, "list");
}

export function articlePageHtml(initData: ArticleInitData, options: PageHtmlOptions = {}): string {
  return pageShell(initData.article.title, initData, options, "article");
}

/** appKind: "list" 用 /assets/，"article" 用 /assets-article/（MPA 各自 bundle） */
function pageShell(
  pageTitle: string,
  initData: ListInitData | ArticleInitData,
  options: PageHtmlOptions = {},
  appKind: "list" | "article" = "list"
): string {
  const payload = escapeScriptPayload(JSON.stringify(initData));
  const generatedAt = options.serverGeneratedAt ?? Date.now();
  const assetsBase = appKind === "article" ? "/assets-article" : "/assets";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="stylesheet" href="${assetsBase}/index.css" />
</head>
<body>
  <div id="root"></div>
  <script id="${INIT_DATA_ID}" type="application/json">${payload}</script>
  <script>window.__PERF_SERVER__={generatedAt:${generatedAt}};</script>
  <script>
    (function(){
      var el = document.getElementById('${INIT_DATA_ID}');
      if (el && el.textContent) {
        try { window.__INIT_DATA__ = JSON.parse(el.textContent); } catch(e) {}
      }
    })();
  </script>
  <script type="module" src="${assetsBase}/index.js"></script>
</body>
</html>`;
}
