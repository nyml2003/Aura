/**
 * 业务组件工厂：为组件统一套上中间件（目前仅 ErrorBoundary），便于问题定位与后续扩展。
 * 约定：所有业务/页面级组件均通过 createBusinessComponent 创建，保证至少被 ErrorBoundary 包裹。
 */
import type { Component, JSX } from "solid-js";
import { ErrorBoundary } from "./error-boundary";

export interface CreateBusinessComponentOptions {
  /** 错误边界 fallback，不传则用 ErrorBoundary 默认 */
  fallback?: (err: Error, reset: () => void) => JSX.Element;
  /** 组件名，便于调试与错误信息（后续可展示在 fallback 中） */
  name?: string;
}

/**
 * 创建带 ErrorBoundary 包裹的业务组件。后续可在此处增加 withLogin、withTracking 等。
 */
export function createBusinessComponent<P extends object>(
  Comp: Component<P>,
  options?: CreateBusinessComponentOptions
): Component<P> {
  const fallback = options?.fallback;
  const Wrapped: Component<P> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Comp {...(props as P)} />
    </ErrorBoundary>
  );
  return Wrapped;
}
