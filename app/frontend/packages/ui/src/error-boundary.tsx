/**
 * 错误边界：捕获子树渲染与响应式传播中的错误，展示错误信息便于排查。
 * 使用 Solid 内置 ErrorBoundary（从 solid-js 导出）。
 */
import { ErrorBoundary as SolidErrorBoundary } from "solid-js";
import type { JSX } from "solid-js";

export interface ErrorBoundaryProps {
  /** 出错时渲染的 fallback，(error, reset) => Element */
  fallback?: (err: Error, reset: () => void) => JSX.Element;
  /** 子节点（不要解构 children，否则错误会在边界外被求值） */
  children?: JSX.Element;
}

const defaultFallback = (err: Error, reset: () => void) => (
  <div
    style={{
      padding: "1.5rem",
      "font-family": "system-ui, sans-serif",
      "font-size": "14px",
      "line-height": "1.5",
      color: "#c53030",
      "background-color": "#fff5f5",
      border: "1px solid #feb2b2",
      "border-radius": "8px",
      "max-width": "640px",
      margin: "1rem",
    }}
  >
    <p style={{ margin: "0 0 0.5rem", "font-weight": "600" }}>渲染出错</p>
    <pre
      style={{
        margin: "0 0 1rem",
        padding: "0.75rem",
        overflow: "auto",
        "background-color": "#fff",
        border: "1px solid #feb2b2",
        "border-radius": "4px",
        "font-size": "12px",
        "white-space": "pre-wrap",
        "word-break": "break-all",
      }}
    >
      {err.message}
    </pre>
    {err.stack && (
      <details style={{ margin: "0 0 1rem" }}>
        <summary style={{ cursor: "pointer" }}>堆栈</summary>
        <pre
          style={{
            margin: "0.5rem 0 0",
            padding: "0.5rem",
            overflow: "auto",
            "font-size": "11px",
            "white-space": "pre-wrap",
            "word-break": "break-all",
            "max-height": "200px",
          }}
        >
          {err.stack}
        </pre>
      </details>
    )}
    <button
      type="button"
      onClick={reset}
      style={{
        padding: "0.5rem 1rem",
        "font-size": "14px",
        cursor: "pointer",
        "background-color": "#c53030",
        color: "#fff",
        border: "none",
        "border-radius": "4px",
      }}
    >
      重试
    </button>
  </div>
);

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <SolidErrorBoundary fallback={props.fallback ?? defaultFallback}>
      {props.children}
    </SolidErrorBoundary>
  );
}
