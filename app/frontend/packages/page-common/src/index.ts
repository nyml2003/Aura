import type { InitData, ListInitData, ArticleInitData } from '@aura/contract';
import { INIT_DATA_GLOBAL, INIT_DATA_ID } from '@aura/contract';

declare global {
  interface Window {
    [INIT_DATA_GLOBAL]?: InitData;
  }
}

export function safeParseInitData(data: string): InitData | null {
  try {
    return JSON.parse(data) as InitData;
  } catch {
    return null;
  }
}

export function isObject(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

export function isNotBlankString(data: unknown): data is string {
  return typeof data === 'string' && data !== '' && data.trim() !== '';
}

/**
 * 从 window 或 #__INIT_DATA__ 读取首屏数据（与 Go 模板注入一致）
 */
export function getInitData(): InitData | null {
  const w = typeof window !== 'undefined' ? window : undefined;
  if (w) {
    const initData = (w as Window)[INIT_DATA_GLOBAL];
    if (isObject(initData)){
      return initData;
    }
    if (isNotBlankString(initData)) {
      return safeParseInitData(initData);
    }
  }
  if (typeof document !== 'undefined') {
    const el = document.getElementById(INIT_DATA_ID);
    if (el?.textContent) {
      return safeParseInitData(el.textContent);
    }
  }
  return null;
}

export function isListInitData(data: InitData): data is ListInitData {
  return data.scene === 'list';
}

export function isArticleInitData(data: InitData): data is ArticleInitData {
  return data.scene === 'article';
}

export type { InitData, ListInitData, ArticleInitData };

export {
  bootstrap,
  type BootstrapOptions,
  type PageComponents,
} from "./bootstrap";
