/** 列表项（文章卡片） */
export interface ListItem {
  id: string;
  type: "article";
  title: string;
  summary: string;
  /** 完整 URL，由后端下发 */
  href: string;
  meta: string;
}

/** list 场景首屏数据 */
export interface ListInitData {
  scene: "list";
  list: ListItem[];
}

/** 文章详情（与 ListItem 对齐，多 content；href 为本页完整 URL） */
export interface ArticleDetail {
  id: string;
  type: "article";
  title: string;
  summary: string;
  href: string;
  meta: string;
  /** 正文 HTML 或纯文本，MVP 可为纯文本 */
  content: string;
}

/** article 场景首屏数据 */
export interface ArticleInitData {
  scene: "article";
  article: ArticleDetail;
  /** 返回列表的完整 URL */
  listHref: string;
}

/** 按 scenecode 的 InitData 联合类型 */
export type InitData = ListInitData | ArticleInitData;

/** 首屏数据挂载点（window 上的 key） */
export const INIT_DATA_ID = "__INIT_DATA__";
export const INIT_DATA_GLOBAL = "__INIT_DATA__";
