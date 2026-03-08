/**
 * @aura/request-sdk
 * 请求契约：基础 client、path → scenecode、首屏请求、管理端文章 API
 */
export type {
  InitData,
  ListInitData,
  ListItem,
  ArticleInitData,
  ArticleDetail,
} from "@aura/contract";
export {
  SceneCode,
  INIT_DATA_GLOBAL,
  INIT_DATA_ID,
  PATH_SCENECODE,
} from "@aura/contract";
export type { SceneCodeType } from "@aura/contract";

export { createClient, type ApiClient } from "./client";
export { ApiClientProvider, useApiClient, type ApiClientProviderProps } from "./ApiClientContext";
export {
  RequestSdkErrorCode,
  requestSdkError,
  isRequestSdkError,
  type RequestSdkError,
  type RequestSdkErrorCodeType,
} from "./errors";
export { Ok, Err, isOk, isErr, type Result } from "./result";
export {
  getSceneCodeFromPath,
  getPageParamsFromPath,
  type PageParams,
  type PageRequest,
} from "./path";
export { requestPage, requestPageByPath, type RequestPageOptions } from "./request";
export {
  API_ARTICLES_BASE,
  getArticle,
  listArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  type ArticleRow,
  type ArticleFormPayload,
  type ArticleRedirectResponse,
} from "./adminArticles";
