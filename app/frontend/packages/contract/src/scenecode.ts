/**
 * 场景码枚举，与后端网关 path → scenecode 映射一致
 */
export const SceneCode = {
  list: 'list',
  article: 'article',
  home: 'home',
} as const;

export type SceneCode = (typeof SceneCode)[keyof typeof SceneCode];

/** path 与 scenecode 映射（MVP 仅 list） */
export const PATH_SCENECODE: Record<string, SceneCode> = {
  '/': 'list',
  '/list': 'list',
};
