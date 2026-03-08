/**
 * Sticky 布局原子组件：基于 design-system 的 aura-sticky-* 原子类封装。
 * 依赖 @aura/design-system 的 CSS（需在应用入口 import '@aura/design-system/styles.css'）。
 */
import {
  type JSX,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  children as resolveChildren,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import { ErrorBoundary } from "./error-boundary";

const cn = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

export interface StickyLayoutProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children?: JSX.Element;
}

/** 外层：flex 列、min-height: 100vh，保证 StickyFooter 贴底 */
export function StickyLayout(props: StickyLayoutProps) {
  const resolved = resolveChildren(() => props.children);
  return (
    <div
      class={cn("aura-sticky-layout", props.class)}
      classList={props.classList}
    >
      <ErrorBoundary>{resolved() }</ErrorBoundary>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 可叠加 Sticky 栈：任意数量项，随滚动逐个吸顶、堆叠，滚出视口后自动取消吸顶
// ---------------------------------------------------------------------------

/** Solid 的 children 可能是 getter，需先调用再归一为数组 */
function toChildArray(c: unknown): JSX.Element[] {
  const raw = typeof c === "function" ? (c as () => unknown)() : c;
  if (Array.isArray(raw))
    return raw.filter(
      (x): x is JSX.Element =>
        x != null &&
        typeof x !== "boolean" &&
        typeof x !== "number" &&
        typeof x !== "string" &&
        typeof x !== "function"
    );
  return raw != null && typeof raw === "object" && typeof raw !== "function"
    ? [raw as JSX.Element]
    : [];
}

export interface StickyStackProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  /** 任意数量的子节点，每个会成为一个 sticky 项；顺序即堆叠顺序（先渲染的在上面） */
  children?: JSX.Element;
}

/**
 * 可叠加 Sticky 栈：子元素数量不限，每个用 ResizeObserver 测高，动态算 top 实现堆叠。
 * 滚动时第 1 个吸顶，滚到第 2 个时第 2 个吸在第 1 个下方，以此类推；往上滚则依次取消吸顶。
 */
export function StickyStack(props: StickyStackProps) {
  const resolved = resolveChildren(() => props.children);
  const list = () => toChildArray(resolved());

  const [refs, setRefs] = createSignal<(HTMLDivElement | undefined)[]>([]);
  const [heights, setHeights] = createSignal<number[]>([]);

  const setRef = (index: number) => (el: HTMLDivElement | undefined) => {
    setRefs((prev) => {
      const next = [...prev];
      next[index] = el;
      return next;
    });
  };

  createEffect(() => {
    const r = refs().filter((x): x is HTMLDivElement => x != null);
    if (r.length === 0) return;
    const observer = new ResizeObserver((entries) => {
      const currentRefs = refs();
      setHeights((prev) => {
        const next = [...prev];
        for (const entry of entries) {
          const el = entry.target as HTMLDivElement;
          const idx = currentRefs.indexOf(el);
          if (idx >= 0) next[idx] = entry.contentRect.height;
        }
        return next;
      });
    });
    r.forEach((el) => observer.observe(el));
    onCleanup(() => observer.disconnect());
  });

  const tops = createMemo(() => {
    const h = heights();
    const len = list().length;
    const result: number[] = [];
    let sum = 0;
    for (let i = 0; i < len; i++) {
      result.push(sum);
      sum += h[i] ?? 0;
    }
    return result;
  });

  return (
    <div class={cn("aura-sticky-stack", props.class)} classList={props.classList}>
      {list().map((child, i) => (
        <div
          ref={setRef(i)}
          class="aura-sticky-stack-item"
          style={{ top: `${tops()[i] ?? 0}px` }}
        >
          {child }
        </div>
      ))}
    </div>
  );
}

export interface StickyStackItemProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children?: JSX.Element;
}

/** 语义化包装：作为 StickyStack 的一个子项，本身不设 sticky，由 StickyStack 包一层 */
export function StickyStackItem(props: StickyStackItemProps) {
  const resolved = resolveChildren(() => props.children);
  return (
    <div class={cn(props.class)} classList={props.classList}>
      {resolved()}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 简单吸顶/吸底（单条固定栏，无动态堆叠）
// ---------------------------------------------------------------------------

export interface StickyHeaderProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children?: JSX.Element;
}

/** 单条吸顶栏：等价于 StickyStack 里只有一项且带顶栏样式，适合固定页头 */
export function StickyHeader(props: StickyHeaderProps) {
  const resolved = resolveChildren(() => props.children);
  return (
    <header
      class={cn("aura-sticky-header", props.class)}
      classList={props.classList}
    >
      {resolved() }
    </header>
  );
}

export interface StickySectionProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children?: JSX.Element;
  as?: "main" | "div";
}

/** 主内容区：自动推出 padding，不被顶/底栏遮挡 */
export function StickySection(props: StickySectionProps) {
  const resolved = resolveChildren(() => props.children);
  const tag = () => (props.as === "div" ? "div" : "main");
  return (
    <Dynamic
      component={tag()}
      class={cn("aura-sticky-section", props.class)}
      classList={props.classList}
    >
      {resolved()}
    </Dynamic>
  );
}

export interface StickyFooterProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children?: JSX.Element;
}

/** 吸底栏：position sticky bottom 0 */
export function StickyFooter(props: StickyFooterProps) {
  const resolved = resolveChildren(() => props.children);
  return (
    <footer
      class={cn("aura-sticky-footer", props.class)}
      classList={props.classList}
    >
      { resolved() }
    </footer>
  );
}
