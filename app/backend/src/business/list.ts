/**
 * 业务层：列表与文章详情，从 store（文件系统）读取；链接用 @aura/site 的 getSiteBase
 */
import type { ListItem, ArticleDetail } from "@aura/contract";
import { getSiteBase } from "@aura/site";
import { getArticles, getArticleById } from "./store.js";

function toListItem(row: { id: string; title: string; summary: string; href?: string; meta: string }): ListItem {
  const base = getSiteBase();
  return {
    id: row.id,
    type: "article",
    title: row.title,
    summary: row.summary,
    href: row.href ?? `${base}/article/${row.id}`,
    meta: row.meta,
  };
}

export async function listData(): Promise<ListItem[]> {
  const rows = await getArticles();
  return rows.map((row) => toListItem(row));
}

export async function getArticle(id: string): Promise<ArticleDetail | null> {
  const row = await getArticleById(id);
  if (!row) return null;
  const listItem = toListItem(row);
  return { ...listItem, content: row.content };
}

export function getListHref(): string {
  return `${getSiteBase()}/list`;
}
