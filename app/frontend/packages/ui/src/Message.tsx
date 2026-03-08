import type { JSX } from "solid-js";

export interface MessageProps {
  /** 提示内容，为空则不渲染 */
  message?: string | null;
  /** 类型，影响样式，默认 error */
  type?: "error" | "info" | "success";
  /** 额外 class */
  class?: string;
  children?: JSX.Element;
}

const typeClass = {
  error: "aura-message-error",
  info: "aura-message-info",
  success: "aura-message-success",
} as const;

/**
 * 用于展示操作失败、提示信息等，依赖 @aura/design-system 的 CSS 变量
 */
export function Message(props: MessageProps) {
  const msg = () => props.message ?? props.children;
  const type = () => props.type ?? "error";
  return (
    msg() && (
      <div
        class={`aura-message ${typeClass[type()]} ${props.class ?? ""}`.trim()}
        role="alert"
      >
        {msg()}
      </div>
    )
  );
}
