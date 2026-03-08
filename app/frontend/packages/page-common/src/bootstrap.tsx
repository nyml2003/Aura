/**
 * 应用启动：getInitData → 无数据时 CSR 请求兜底 → 按 scene 渲染/水合对应页面。
 * 业务 main 只需引入样式、注册页面组件并调用 bootstrap。
 */
import { render, hydrate } from "solid-js/web";
import type { JSX } from "solid-js";
import type { InitData } from "@aura/contract";
import { getInitData } from "./index";
import { requestPageByPath } from "@aura/request-sdk";

/** 按 scene 注册的页面组件，由业务提供；page-common 不依赖具体 scene 类型 */
export type PageComponents = Partial<
  Record<InitData["scene"], (props: { initData: InitData }) => JSX.Element>
>;

export interface BootstrapOptions {
  rootId?: string;
  pages: PageComponents;
  /** 无 initData 且 CSR 请求也失败时的回调（如展示「暂无数据」） */
  onNoData?: () => void;
  /** 某场景页挂载后调用，由业务按需做打点等；scene 为当前 initData.scene */
  onSceneMounted?: (scene: string, root: HTMLElement, scriptStart: number) => void;
}

/**
 * 根据当前 path 请求首屏数据（CSR 兜底：SSR 失效或未注入时用真实请求拉取）。
 * path → scenecode/params 与 scene 字面量均在 request-sdk，此处不感知具体 scene。
 */
async function fetchInitDataFallback(): Promise<InitData | null> {
  if (typeof window === "undefined") return null;
  return requestPageByPath(window.location.pathname, window.location.origin);
}

export function bootstrap(options: BootstrapOptions): void {
  const root = document.getElementById(options.rootId ?? "root");
  if (!root) return;

  const scriptStart = performance.now();
  let initData = getInitData();

  if (!initData) {
    fetchInitDataFallback().then((data) => {
      if (data) {
        runWithInitData(root, data, options, scriptStart);
        return;
      }
      if (!root.hasChildNodes()) {
        options.onNoData ? options.onNoData() : (root.innerHTML = "<p>暂无数据</p>");
      }
    });
    return;
  }

  runWithInitData(root, initData, options, scriptStart);
}

function runWithInitData(
  root: HTMLElement,
  initData: InitData,
  options: BootstrapOptions,
  scriptStart: number
): void {
  const { pages, onSceneMounted } = options;
  const Page = pages[initData.scene];

  if (!Page) {
    if (root.hasChildNodes()) {
      root.innerHTML = "<p>未知场景</p>";
    }
    return;
  }

  if (root.hasChildNodes()) {
    hydrate(() => Page({ initData }), root);
  } else {
    render(() => Page({ initData }), root);
  }
  onSceneMounted?.(initData.scene, root, scriptStart);
}
