import type { JSX } from "solid-js";

/**
 * Material UI 风格：variant 控制形态，color 控制语义色
 * 样式与 hover/focus 由 @aura/design-system 的 button.css 提供（data-aura-btn + data-variant + data-color）
 */
export type ButtonVariant = "contained" | "outlined" | "text";
export type ButtonColor = "primary" | "secondary" | "error" | "inherit";

export interface ButtonProps {
  variant?: ButtonVariant;
  color?: ButtonColor;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  /** 作为链接时使用，与 href 同时存在时渲染为 <a> */
  href?: string;
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children: JSX.Element;
  onClick?: (e: MouseEvent) => void;
}

export function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "contained";
  const color = () => props.color ?? "primary";
  const isLink = () => props.href != null;
  const disabled = () => props.disabled || props.loading;

  const attrs = () => ({
    "data-aura-btn": "",
    "data-variant": variant(),
    "data-color": color(),
    class: props.class ?? "",
    classList: props.classList,
    "aria-disabled": disabled() ? true : undefined,
    get children() {
      return props.loading ? "加载中…" : props.children;
    },
  });

  if (isLink()) {
    return (
      <a
        href={props.href}
        data-aura-btn
        data-variant={variant()}
        data-color={color()}
        class={attrs().class}
        classList={attrs().classList}
        aria-disabled={attrs()["aria-disabled"]}
        onClick={(e) => {
          if (disabled()) e.preventDefault();
          props.onClick?.(e as unknown as MouseEvent);
        }}
      >
        {attrs().children}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      data-aura-btn
      data-variant={variant()}
      data-color={color()}
      class={attrs().class}
      classList={attrs().classList}
      disabled={disabled()}
      onClick={props.onClick}
    >
      {attrs().children}
    </button>
  );
}
