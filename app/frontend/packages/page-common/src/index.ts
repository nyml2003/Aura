import type { InitData, ListInitData } from '@aura/contract';
import { INIT_DATA_GLOBAL, INIT_DATA_ID } from '@aura/contract';

declare global {
  interface Window {
    [INIT_DATA_GLOBAL]?: InitData;
  }
}

/**
 * 从 window 或 #__INIT_DATA__ 读取首屏数据（与 Go 模板注入一致）
 */
export function getInitData(): InitData | null {
  const w = typeof window !== 'undefined' ? window : undefined;
  if (w && (w as Window)[INIT_DATA_GLOBAL]) {
    return (w as Window)[INIT_DATA_GLOBAL]!;
  }
  if (typeof document !== 'undefined') {
    const el = document.getElementById(INIT_DATA_ID);
    if (el?.textContent) {
      try {
        return JSON.parse(el.textContent) as InitData;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isListInitData(data: InitData): data is ListInitData {
  return data.scene === 'list';
}

export type { InitData, ListInitData };
