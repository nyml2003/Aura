/**
 * ApiClient 的 Solid 上下文：ApiClientProvider + useApiClient，供业务组件获取统一 client；
 * 非组件侧（如 getArticle）通过 getCurrentClient() 从上下文取值，调用方无需显式注入 client。
 */
import { createContext, useContext } from "solid-js";
import type { ApiClient } from "./client";
import { createClient } from "./client";
import { requestSdkError, RequestSdkErrorCode, type RequestSdkError } from "./errors";
import { Err, Ok, type Result } from "./result";

const ApiClientContext = createContext<ApiClient | undefined>(undefined);

/** Provider 渲染时写入，供 getCurrentClient() 在非组件代码中读取当前上下文 client */
const currentClientRef: { current: ApiClient | null } = { current: null };

/**
 * 在非组件代码（如 API 封装 getArticle）中获取当前上下文的 ApiClient；返回 Result，上层根据 ok/error 展示 Message。
 */
export function getCurrentClient(): Result<ApiClient, RequestSdkError> {
  const c = currentClientRef.current;
  if (!c) {
    return Err(
      requestSdkError(
        RequestSdkErrorCode.NO_API_CLIENT,
        "未在 ApiClientProvider 内使用，请检查是否在应用根节点包裹了 ApiClientProvider"
      )
    );
  }
  return Ok(c);
}

export interface ApiClientProviderProps {
  /** 直接传入已创建好的 client，与 baseUrl 二选一 */
  client?: ApiClient;
  /** 使用 baseUrl 创建 client，与 client 二选一；不传则使用相对路径 "" */
  baseUrl?: string;
  children: import("solid-js").JSX.Element;
}

/**
 * 在应用根部包裹，为子树提供 ApiClient；请求的 baseUrl 来自此处，getArticle 等会从上下文自动取 client。
 */
export function ApiClientProvider(props: ApiClientProviderProps) {
  const value = (): ApiClient => {
    if (props.client) return props.client;
    return createClient(props.baseUrl ?? "");
  };
  const client = value();
  currentClientRef.current = client;
  return (
    <ApiClientContext.Provider value={client}>
      {props.children}
    </ApiClientContext.Provider>
  );
}

/**
 * 在业务组件中获取当前上下文的 ApiClient，请求的 baseUrl 由 Provider 提供；必须在 ApiClientProvider 子树内使用。
 */
/** 在组件内获取 client，无 Provider 时仍抛错（hook 场景通常要求立即失败） */
export function useApiClient(): ApiClient {
  const ctx = useContext(ApiClientContext);
  if (ctx === undefined) {
    throw requestSdkError(
      RequestSdkErrorCode.NO_API_CLIENT,
      "useApiClient 必须在 ApiClientProvider 子树内使用"
    );
  }
  return ctx;
}
