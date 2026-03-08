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

/** 按 scenecode 的 InitData 联合类型 */
export type InitData = ListInitData;

/** 首屏数据挂载点（window 上的 key） */
export const INIT_DATA_ID = "__INIT_DATA__";
export const INIT_DATA_GLOBAL = "__INIT_DATA__";
