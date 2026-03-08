/**
 * 业务层：列表数据（MVP 在业务层内 mock，形态与日后查存储一致）
 */
import type { ListItem } from "@aura/contract";

const SITE_BASE = process.env.SITE_BASE ?? "http://localhost:9080";

export function getSiteBase(): string {
  return SITE_BASE;
}

export function listData(): ListItem[] {
  return [
    { id: "article-1", type: "article", title: "第一篇示例文章", summary: "这是摘要内容，MVP 仅列表页。", href: `${SITE_BASE}/article/article-1`, meta: "2025-03-07" },
    { id: "article-2", type: "article", title: "第二篇示例文章", summary: "摘要二。", href: `${SITE_BASE}/article/article-2`, meta: "2025-03-06" },
    { id: "article-3", type: "article", title: "第三篇示例文章", summary: "摘要三。", href: `${SITE_BASE}/article/article-3`, meta: "2025-03-05" },
    { id: "article-4", type: "article", title: "第四篇示例文章", summary: "摘要四。", href: `${SITE_BASE}/article/article-4`, meta: "2025-03-04" },
    { id: "article-5", type: "article", title: "第五篇示例文章", summary: "摘要五。", href: `${SITE_BASE}/article/article-5`, meta: "2025-03-03" },
  ];
}
