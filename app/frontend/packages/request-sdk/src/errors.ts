/**
 * request-sdk 统一错误结构体：上层可根据 code 做 Message 等展示，不依赖 UI 库。
 */

export const RequestSdkErrorCode = {
  /** 未在 ApiClientProvider 内调用 getCurrentClient / 使用 getArticle 等 */
  NO_API_CLIENT: "NO_API_CLIENT",
  /** 请求 HTTP 非 2xx，含 status 与后端返回的 message */
  HTTP_ERROR: "HTTP_ERROR",
  /** 网络异常（fetch 抛错） */
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export type RequestSdkErrorCodeType = (typeof RequestSdkErrorCode)[keyof typeof RequestSdkErrorCode];

export interface RequestSdkError {
  code: RequestSdkErrorCodeType;
  message: string;
  /** 仅 HTTP_ERROR 时有值 */
  status?: number;
}

export function requestSdkError(
  code: RequestSdkErrorCodeType,
  message: string,
  status?: number
): RequestSdkError {
  return status !== undefined ? { code, message, status } : { code, message };
}

export function isRequestSdkError(e: unknown): e is RequestSdkError {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    "message" in e &&
    typeof (e as RequestSdkError).code === "string" &&
    typeof (e as RequestSdkError).message === "string"
  );
}
