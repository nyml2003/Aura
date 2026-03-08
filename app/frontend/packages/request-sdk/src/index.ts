/**
 * @aura/request-sdk
 * 请求契约：类型、path → scenecode、以及可选的接口化请求（POST /page）
 */
export type {
  InitData,
  ListInitData,
  ListItem,
  ArticleInitData,
  ArticleDetail,
} from "@aura/contract";
export {
  SceneCode,
  INIT_DATA_GLOBAL,
  INIT_DATA_ID,
  PATH_SCENECODE,
} from "@aura/contract";
export type { SceneCodeType } from "@aura/contract";

export {
  getSceneCodeFromPath,
  getPageParamsFromPath,
  type PageParams,
  type PageRequest,
} from "./path";
export { requestPage, requestPageByPath, type RequestPageOptions } from "./request";
