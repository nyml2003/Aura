/**
 * path → scenecode / params 解析，与后端网关约定一致
 */
import { SceneCode, PATH_SCENECODE } from "@aura/contract";
import type { SceneCodeType } from "@aura/contract";

/** 各场景的请求参数（与后端 path 参数一致） */
export interface PageParams {
  list?: Record<string, never>;
  article?: { slug: string };
  home?: Record<string, never>;
}

const ARTICLE_PATH_PREFIX = "/article/";

/**
 * 从 pathname 解析出 scenecode；先精确匹配 PATH_SCENECODE，再匹配 /article/:slug
 */
export function getSceneCodeFromPath(pathname: string): SceneCodeType | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const exact = PATH_SCENECODE[normalized];
  if (exact) return exact;
  if (normalized.startsWith(ARTICLE_PATH_PREFIX) && normalized.length > ARTICLE_PATH_PREFIX.length) {
    return SceneCode.article;
  }
  return undefined;
}

/**
 * 从 pathname 解析出该场景的 params（如 article 的 slug）
 */
export function getPageParamsFromPath(pathname: string): PageParams | undefined {
  const scenecode = getSceneCodeFromPath(pathname);
  if (!scenecode) return undefined;
  if (scenecode === SceneCode.article) {
    const normalized = pathname.replace(/\/$/, "");
    if (normalized.startsWith(ARTICLE_PATH_PREFIX)) {
      const slug = normalized.slice(ARTICLE_PATH_PREFIX.length).split("/")[0] ?? "";
      return { article: { slug } };
    }
  }
  if (scenecode === SceneCode.list || scenecode === SceneCode.home) {
    return scenecode === SceneCode.list ? { list: {} } : { home: {} };
  }
  return undefined;
}
