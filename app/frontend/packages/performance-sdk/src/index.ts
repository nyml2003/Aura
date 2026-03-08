/**
 * 观测 #root 下 DOM 变化 + 从请求到首屏稳定的元信息，前后端拉通
 */

export interface DOMObserveReport {
  batchCount: number;
  recordCount: number;
  childListRecordCount: number;
  attributeRecordCount: number;
  characterDataRecordCount: number;
}

export interface PerfServer {
  generatedAt: number;
}

export interface PerfNav {
  navigationStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domContentLoadedEventStart: number;
  loadEventStart: number;
}

export interface PerfFullReport {
  /** 服务端注入：HTML 生成时间戳 */
  server: PerfServer;
  /** 导航时序（若有） */
  nav: PerfNav | null;
  /** 脚本开始执行时间（performance.now） */
  scriptStart: number;
  /** DOM 稳定时时间（performance.now） */
  domStableAt: number;
  /** 稳定延迟 ms */
  stableDelayMs: number;
  /** DOM 变更观测 */
  dom: DOMObserveReport;
  /** 派生：服务端生成到首字节（约）的预估 ms */
  serverToResponseMs: number | null;
  /** 派生：responseEnd 到 script 执行的 ms */
  responseToScriptMs: number | null;
}

const defaultReport: DOMObserveReport = {
  batchCount: 0,
  recordCount: 0,
  childListRecordCount: 0,
  attributeRecordCount: 0,
  characterDataRecordCount: 0,
};

let report: DOMObserveReport = { ...defaultReport };
let observer: MutationObserver | null = null;

function resetReport(): void {
  report = { ...defaultReport };
}

export function startObserveDOM(target: Element | string = "#root"): void {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  stopObserveDOM();
  resetReport();

  observer = new MutationObserver((mutations) => {
    report.batchCount += 1;
    report.recordCount += mutations.length;
    for (const m of mutations) {
      if (m.type === "childList") report.childListRecordCount += 1;
      else if (m.type === "attributes") report.attributeRecordCount += 1;
      else if (m.type === "characterData") report.characterDataRecordCount += 1;
    }
  });

  observer.observe(el, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
    characterDataOldValue: false,
    attributeOldValue: false,
  });
}

export function stopObserveDOM(): DOMObserveReport {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  return getReport();
}

export function getReport(): DOMObserveReport {
  return { ...report };
}

function getNavTiming(): PerfNav | null {
  const nav = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
  if (!nav) return null;
  return {
    navigationStart: nav.startTime,
    requestStart: nav.requestStart,
    responseStart: nav.responseStart,
    responseEnd: nav.responseEnd,
    domContentLoadedEventStart: nav.domContentLoadedEventStart,
    loadEventStart: nav.loadEventStart,
  };
}

/**
 * 组装完整报告（需在 delay 回调内调用，此时已 stopObserveDOM）
 */
export function buildFullReport(scriptStart: number, stableDelayMs: number): PerfFullReport {
  const dom = getReport();
  const domStableAt = performance.now();
  const server = (window as Window & { __PERF_SERVER__?: PerfServer }).__PERF_SERVER__ ?? { generatedAt: 0 };
  const nav = getNavTiming();

  let serverToResponseMs: number | null = null;
  let responseToScriptMs: number | null = null;
  if (nav && server.generatedAt > 0 && typeof performance.timeOrigin === "number") {
    const responseEndAbsolute = performance.timeOrigin + nav.responseEnd;
    serverToResponseMs = Math.round(responseEndAbsolute - server.generatedAt);
    responseToScriptMs = Math.round(scriptStart - nav.responseEnd);
  }

  return {
    server,
    nav,
    scriptStart,
    domStableAt,
    stableDelayMs,
    dom,
    serverToResponseMs,
    responseToScriptMs,
  };
}

/**
 * 仅挂到 window.__PERF_FULL__，不写 DOM
 */
export function setPerfReport(full: PerfFullReport): void {
  (window as Window & { __PERF_FULL__?: PerfFullReport }).__PERF_FULL__ = full;
}

function formatAnalysis(full: PerfFullReport): string {
  const r = full.dom;
  const scriptToStable = Math.round(full.domStableAt - full.scriptStart);
  const lines: string[] = [
    "[performance-sdk] 时序:",
    "  server 生成 → 响应到达  " + (full.serverToResponseMs != null ? full.serverToResponseMs + " ms" : "-"),
    "  响应到达 → 脚本执行   " + (full.responseToScriptMs != null ? full.responseToScriptMs + " ms" : "-"),
    "  脚本执行 → 观测结束   " + scriptToStable + " ms (含 " + full.stableDelayMs + " ms 延迟)",
    "[performance-sdk] DOM:",
    "  " + r.batchCount + " 批 / " + r.recordCount + " 条 mutation (childList: " + r.childListRecordCount + ", attributes: " + r.attributeRecordCount + ", characterData: " + r.characterDataRecordCount + ")",
  ];
  if (full.nav) {
    lines.push(
      "[performance-sdk] 导航: responseEnd " + full.nav.responseEnd.toFixed(1) + " ms, domContentLoaded " + full.nav.domContentLoadedEventStart.toFixed(1) + " ms, load " + full.nav.loadEventStart.toFixed(1) + " ms"
    );
  }
  if (r.batchCount <= 1 && r.childListRecordCount <= 1) {
    lines.push("[performance-sdk] 结论: DOM 仅 1 批/1 次 childList，说明首屏由框架一次性挂载，无多次增量更新。");
  }
  lines.push("[performance-sdk] 完整对象: window.__PERF_FULL__");
  return lines.join("\n");
}

/**
 * 在 delayMs 后停止观测、组装报告、仅打日志（需先 startObserveDOM）
 */
export function logReportAfterStable(delayMs: number, scriptStart: number): void {
  const timeoutId = window.setTimeout(() => {
    stopObserveDOM();
    const full = buildFullReport(scriptStart, delayMs);
    setPerfReport(full);
    console.log(formatAnalysis(full));
  }, delayMs);

  const win = window as Window & { __PERF_CLEANUP__?: () => void };
  if (typeof win.__PERF_CLEANUP__ === "function") win.__PERF_CLEANUP__();
  win.__PERF_CLEANUP__ = () => {
    window.clearTimeout(timeoutId);
    stopObserveDOM();
  };
}
