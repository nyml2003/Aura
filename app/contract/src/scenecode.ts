/**
 * 场景码枚举，与后端网关 path → scenecode 映射一致
 */
export const SceneCode = {
  list: "list",
  article: "article",
  home: "home",
} as const;

/** path 与 scenecode 映射（MVP 仅 list） */
export const PATH_SCENECODE: Record<string, (typeof SceneCode)[keyof typeof SceneCode]> = {
  "/": "list",
  "/list": "list",
};

export type SceneCodeType = (typeof SceneCode)[keyof typeof SceneCode];
