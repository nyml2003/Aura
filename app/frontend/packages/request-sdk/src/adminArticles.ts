/**
 * 管理端文章 API：基于 ApiClient，统一返回 Result，client 从上下文自动取得，调用方根据 ok/error 展示 Message。
 */
import { getCurrentClient } from "./ApiClientContext";
import type { RequestSdkError } from "./errors";
import type { Result } from "./result";

export const API_ARTICLES_BASE = "/api/articles";

export interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  meta: string;
  content: string;
}

export interface ArticleFormPayload {
  title: string;
  summary: string;
  meta: string;
  content: string;
}

export interface ArticleRedirectResponse {
  redirect?: string;
}

export async function getArticle(id: string): Promise<Result<ArticleRow, RequestSdkError>> {
  const clientResult = getCurrentClient();
  if (!clientResult.ok) return clientResult;
  return clientResult.value.get<ArticleRow>(`${API_ARTICLES_BASE}/${id}`);
}

export async function listArticles(): Promise<Result<ArticleRow[], RequestSdkError>> {
  const clientResult = getCurrentClient();
  if (!clientResult.ok) return clientResult;
  return clientResult.value.get<ArticleRow[]>(API_ARTICLES_BASE);
}

export async function createArticle(
  body: ArticleFormPayload
): Promise<Result<ArticleRedirectResponse, RequestSdkError>> {
  const clientResult = getCurrentClient();
  if (!clientResult.ok) return clientResult;
  return clientResult.value.post<ArticleRedirectResponse>(API_ARTICLES_BASE, body);
}

export async function updateArticle(
  id: string,
  body: ArticleFormPayload
): Promise<Result<ArticleRedirectResponse, RequestSdkError>> {
  const clientResult = getCurrentClient();
  if (!clientResult.ok) return clientResult;
  return clientResult.value.put<ArticleRedirectResponse>(`${API_ARTICLES_BASE}/${id}`, body);
}

export async function deleteArticle(
  id: string
): Promise<Result<ArticleRedirectResponse, RequestSdkError>> {
  const clientResult = getCurrentClient();
  if (!clientResult.ok) return clientResult;
  return clientResult.value.del<ArticleRedirectResponse>(`${API_ARTICLES_BASE}/${id}`);
}
