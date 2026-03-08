import type { JSX } from "solid-js";
import { StickyHeader } from "@aura/ui";
import { useDarkMode } from "./useDarkMode";

export interface PageNavProps {
  /** 左侧内容：标题、返回链接+标题等 */
  left: JSX.Element;
  /** 右侧内容，不传则默认主题切换按钮 */
  right?: JSX.Element;
  class?: string;
  classList?: Record<string, boolean | undefined>;
}

/** 公共导航栏：StickyHeader + 左 slot + 右 slot（默认主题切换） */
export function PageNav(props: PageNavProps) {
  const { dark, toggle } = useDarkMode();

  return (
    <StickyHeader
      class={`aura-header-soft aura-flex aura-items-center aura-justify-between ${props.class ?? ""}`}
      classList={props.classList}
    >
      <div class="aura-flex aura-items-center aura-gap-4">{props.left}</div>
      {props.right !== undefined ? (
        props.right
      ) : (
        <button
          type="button"
          class="aura-text-sm aura-text-muted aura-transition aura-rounded-md aura-p-2 aura-bg-elevated aura-border aura-bg-hover"
          onClick={toggle}
          aria-label={dark() ? "切换到浅色" : "切换到暗色"}
        >
          {dark() ? "☀️" : "🌙"}
        </button>
      )}
    </StickyHeader>
  );
}
