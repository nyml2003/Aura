/**
 * 当前窗口跳转到指定 URL（用于后端下发的跳链）。
 * 若 url 为空或非法则直接抛错，不做兜底。
 */
export function openUrl(url: string | undefined): void {
  if (url == null || typeof url !== "string" || !url.trim()) {
    throw new Error("跳转地址无效");
  }
  window.location.href = url.trim();
}
