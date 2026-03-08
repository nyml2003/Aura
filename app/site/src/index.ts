/**
 * 站点 base URL，由应用在启动时注入，不读 env。
 * 开发环境默认 http://localhost:4000
 */
const DEFAULT_BASE = "http://localhost:4000";

let base = DEFAULT_BASE;

export function setSiteBase(url: string): void {
  base = url.replace(/\/$/, "");
}

export function getSiteBase(): string {
  return base;
}
