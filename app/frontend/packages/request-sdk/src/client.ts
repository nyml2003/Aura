/**
 * 基础 HTTP 请求层：get / getText / post / put / del，统一返回 Result，上层根据 ok/error 展示 Message。
 */
import { requestSdkError, RequestSdkErrorCode, type RequestSdkError } from "./errors";
import { Err, Ok, type Result } from "./result";

function normalizeBase(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "") || "";
}

function buildUrl(baseUrl: string, path: string): string {
  const base = normalizeBase(baseUrl);
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

async function parseErrorResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { error?: string; detail?: string };
    return [json.error, json.detail].filter(Boolean).join(": ") || res.statusText;
  } catch {
    return text || res.statusText;
  }
}

export interface ApiClient {
  get<T>(path: string): Promise<Result<T, RequestSdkError>>;
  getText(path: string): Promise<Result<string, RequestSdkError>>;
  post<T>(path: string, body?: unknown): Promise<Result<T, RequestSdkError>>;
  put<T>(path: string, body?: unknown): Promise<Result<T, RequestSdkError>>;
  del<T>(path: string): Promise<Result<T, RequestSdkError>>;
}

/**
 * 创建 API 客户端实例，所有请求以 baseUrl 为前缀（为空则使用相对路径）。
 * 在组件树中应通过 useApiClient() 获取 client，其 baseUrl 来自 ApiClientProvider 的上下文，无需 defaultClient。
 */
export function createClient(baseUrl: string = ""): ApiClient {
  const base = normalizeBase(baseUrl);

  const request = async (path: string, init?: RequestInit): Promise<Result<Response, RequestSdkError>> => {
    try {
      return Ok(await fetch(buildUrl(base, path), init));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "网络请求失败";
      return Err(requestSdkError(RequestSdkErrorCode.NETWORK_ERROR, msg));
    }
  };

  const checkOk = async (res: Response): Promise<Result<void, RequestSdkError>> => {
    if (!res.ok) {
      const message = await parseErrorResponse(res);
      return Err(requestSdkError(RequestSdkErrorCode.HTTP_ERROR, message, res.status));
    }
    return Ok(undefined);
  };

  return {
    async get<T>(path: string): Promise<Result<T, RequestSdkError>> {
      const resResult = await request(path);
      if (!resResult.ok) return resResult;
      const check = await checkOk(resResult.value);
      if (!check.ok) return check;
      try {
        return Ok(await resResult.value.json());
      } catch {
        return Err(requestSdkError(RequestSdkErrorCode.NETWORK_ERROR, "响应解析失败"));
      }
    },

    async getText(path: string): Promise<Result<string, RequestSdkError>> {
      const resResult = await request(path);
      if (!resResult.ok) return resResult;
      const check = await checkOk(resResult.value);
      if (!check.ok) return check;
      return Ok(await resResult.value.text());
    },

    async post<T>(path: string, body?: unknown): Promise<Result<T, RequestSdkError>> {
      const resResult = await request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body != null ? JSON.stringify(body) : undefined,
      });
      if (!resResult.ok) return resResult;
      const check = await checkOk(resResult.value);
      if (!check.ok) return check;
      try {
        return Ok(await resResult.value.json());
      } catch {
        return Err(requestSdkError(RequestSdkErrorCode.NETWORK_ERROR, "响应解析失败"));
      }
    },

    async put<T>(path: string, body?: unknown): Promise<Result<T, RequestSdkError>> {
      const resResult = await request(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: body != null ? JSON.stringify(body) : undefined,
      });
      if (!resResult.ok) return resResult;
      const check = await checkOk(resResult.value);
      if (!check.ok) return check;
      try {
        return Ok(await resResult.value.json());
      } catch {
        return Err(requestSdkError(RequestSdkErrorCode.NETWORK_ERROR, "响应解析失败"));
      }
    },

    async del<T>(path: string): Promise<Result<T, RequestSdkError>> {
      const resResult = await request(path, { method: "DELETE" });
      if (!resResult.ok) return resResult;
      const check = await checkOk(resResult.value);
      if (!check.ok) return check;
      try {
        return Ok(await resResult.value.json());
      } catch {
        return Err(requestSdkError(RequestSdkErrorCode.NETWORK_ERROR, "响应解析失败"));
      }
    },
  };
}
