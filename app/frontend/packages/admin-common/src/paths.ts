/** 管理后台路径：独立页面 MPA */
export const ADMIN_PATH_LIST = "/admin";
export const ADMIN_PATH_NEW = "/admin/articles/new";

export function getEditPath(id: string): string {
  return `/admin/articles/${id}/edit`;
}
