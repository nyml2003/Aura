/**
 * 接口化请求：POST /page 或 GET 语义化 path，与 BFF 约定一致；内部使用 createClient
 */
import type { InitData } from "@aura/contract";
import { SceneCode } from "@aura/contract";
import { getSceneCodeFromPath, getPageParamsFromPath } from "./path";
import type { PageParams } from "./path";
import { createClient } from "./client";

/** POST /page 的请求体（可选，用于接口化请求） */
export interface PageRequest {
  scenecode: "list" | "article" | "home";
  params?: PageParams["list"] | PageParams["article"] | PageParams["home"];
}

export interface RequestPageOptions {
  /** 后端 base URL，如 https://example.com */
  baseUrl: string;
  /** 场景码 */
  scenecode: PageRequest["scenecode"];
  /** 场景参数，如 article 时传 { slug: "xxx" } */
  params?: PageRequest["params"];
  /** 使用 POST /page 而非 GET 语义化 path，默认 false（GET） */
  usePost?: boolean;
}

/**
 * 请求首屏数据：GET 语义化 path 或 POST /page，返回 InitData；失败或解析失败返回 null。
 */
export async function requestPage(options: RequestPageOptions): Promise<InitData | null> {
  const { baseUrl, scenecode, params, usePost = false } = options;
  const client = createClient(baseUrl);

  if (usePost) {
    const result = await client.post<InitData | null>("/page", {
      scenecode,
      params: params ?? {},
    });
    return result.ok ? result.value : null;
  }

  let path: string;
  switch (scenecode) {
    case SceneCode.list:
      path = "/list";
      break;
    case SceneCode.home:
      path = "/";
      break;
    case SceneCode.article:
      path =
        params && "slug" in params
          ? `/article/${encodeURIComponent((params as { slug: string }).slug)}`
          : "/list";
      break;
    default:
      path = "/list";
  }
  const textResult = await client.getText(path);
  if (!textResult.ok) return null;
  const doc = new DOMParser().parseFromString(textResult.value, "text/html");
  const el = doc.getElementById("__INIT_DATA__");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as InitData;
  } catch {
    return null;
  }
}

/**
 * 根据 pathname 和 baseUrl 请求首屏数据（CSR 兜底用）。
 * 直接请求后端接口拿到 InitData JSON，不依赖 HTML 里的 __INIT_DATA__；
 * path → scenecode/params 的解析与 scene 字面量均在此处，调用方无需感知具体 scene。
 */
export async function requestPageByPath(
  pathname: string,
  baseUrl: string
): Promise<InitData | null> {
  const scenecode = getSceneCodeFromPath(pathname);
  if (!scenecode) return null;
  const pageParams = getPageParamsFromPath(pathname);
  const params =
    scenecode === SceneCode.list
      ? pageParams?.list ?? {}
      : scenecode === SceneCode.article
        ? pageParams?.article ?? {}
        : pageParams?.home ?? {};
  return requestPage({
    baseUrl: baseUrl.replace(/\/$/, ""),
    scenecode,
    params,
    usePost: true,
  });
}
