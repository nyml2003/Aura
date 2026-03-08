/**
 * 文件系统文章存储：每篇文章一个 JSON 文件
 * 目录为空时自动写入初始数据；重启后数据持久化
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** 数据目录：显式相对于本文件位置，backend/data/articles */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data/articles");

export interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  meta: string;
  content: string;
}

const INITIAL: ArticleRow[] = [
  { id: "article-1", title: "第一篇示例文章", summary: "这是摘要内容，MVP 仅列表页。", meta: "2025-03-07", content: "这里是第一篇文章的正文。MVP 阶段为纯文本占位，后续可接入富文本或 Markdown。" },
  { id: "article-2", title: "第二篇示例文章", summary: "摘要二。", meta: "2025-03-06", content: "第二篇正文内容。" },
  { id: "article-3", title: "第三篇示例文章", summary: "摘要三。", meta: "2025-03-05", content: "第三篇正文内容。" },
  { id: "article-4", title: "第四篇示例文章", summary: "摘要四。", meta: "2025-03-04", content: "第四篇正文内容。" },
  { id: "article-5", title: "第五篇示例文章", summary: "摘要五。", meta: "2025-03-03", content: "第五篇正文内容。" },
];

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function ensureSeed(): Promise<void> {
  const files = await fs.readdir(DATA_DIR).catch(() => []);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  if (jsonFiles.length > 0) return;
  for (const row of INITIAL) {
    const filePath = path.join(DATA_DIR, `${row.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(row, null, 2), "utf-8");
  }
}

function safeId(filename: string): string | null {
  const base = path.basename(filename, ".json");
  return base && !base.includes("..") ? base : null;
}

export async function getArticles(): Promise<ArticleRow[]> {
  await ensureDir();
  await ensureSeed();
  const files = await fs.readdir(DATA_DIR);
  const list: ArticleRow[] = [];
  for (const f of files) {
    const id = safeId(f);
    if (!id) continue;
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, `${id}.json`), "utf-8");
      list.push(JSON.parse(raw) as ArticleRow);
    } catch {
      // 损坏或非 JSON 则跳过
    }
  }
  list.sort((a, b) => (b.meta || "").localeCompare(a.meta || ""));
  return list;
}

export async function getArticleById(id: string): Promise<ArticleRow | null> {
  if (!id || id.includes("..") || path.basename(id) !== id) return null;
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as ArticleRow;
  } catch {
    return null;
  }
}

async function nextId(): Promise<string> {
  const list = await getArticles();
  const max = list.reduce((n, r) => {
    const m = r.id.match(/^article-(\d+)$/);
    return m ? Math.max(n, parseInt(m[1], 10)) : n;
  }, 0);
  return `article-${max + 1}`;
}

export async function createArticle(input: Omit<ArticleRow, "id">): Promise<ArticleRow> {
  await ensureDir();
  const id = await nextId();
  const row: ArticleRow = { ...input, id };
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(row, null, 2), "utf-8");
  return { ...row };
}

export async function updateArticle(id: string, input: Partial<Omit<ArticleRow, "id">>): Promise<ArticleRow | null> {
  const current = await getArticleById(id);
  if (!current) return null;
  const row: ArticleRow = { ...current, ...input, id };
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(row, null, 2), "utf-8");
  return { ...row };
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!id || id.includes("..") || path.basename(id) !== id) return false;
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
