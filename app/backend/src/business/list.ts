/**
 * 业务层：列表与文章详情（MVP mock），链接用 @aura/site 的 getSiteBase，启动时注入
 */
import type { ListItem, ArticleDetail } from "@aura/contract";
import { getSiteBase } from "@aura/site";

interface MockItem {
  id: string;
  title: string;
  summary: string;
  meta: string;
}

const MOCK_ITEMS: MockItem[] = [
  { id: "article-1", title: "第一篇示例文章", summary: "这是摘要内容，MVP 仅列表页。", meta: "2025-03-07" },
  { id: "article-2", title: "第二篇示例文章", summary: "摘要二。", meta: "2025-03-06" },
  { id: "article-3", title: "第三篇示例文章", summary: "摘要三。", meta: "2025-03-05" },
  { id: "article-4", title: "第四篇示例文章", summary: "摘要四。", meta: "2025-03-04" },
  { id: "article-5", title: "第五篇示例文章", summary: "摘要五。", meta: "2025-03-03" },
];

const MOCK_CONTENT: Record<string, string> = {
  "article-1": "这里是第一篇文章的正文。MVP 阶段为纯文本占位，后续可接入富文本或 Markdown。",
  "article-2": "第二篇正文内容。",
  "article-3": "第三篇正文内容。",
  "article-4": "第四篇正文内容。",
  "article-5": "第五篇正文内容。",
};

function toListItem(item: MockItem): ListItem {
  const base = getSiteBase();
  return {
    ...item,
    type: "article",
    href: `${base}/article/${item.id}`,
  };
}

export function listData(): ListItem[] {
  return MOCK_ITEMS.map(toListItem);
}

export function getArticle(id: string): ArticleDetail | null {
  const item = MOCK_ITEMS.find((x) => x.id === id);
  if (!item) return null;
  const content = MOCK_CONTENT[id] ?? "（暂无正文）";
  const listItem = toListItem(item);
  return { ...listItem, content };
}

export function getListHref(): string {
  return `${getSiteBase()}/list`;
}
