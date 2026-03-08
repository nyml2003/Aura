# @aura/request-sdk

请求契约与 path/scenecode 解析，与 BFF 约定一致。

## 类型与常量（来自 @aura/contract）

- **类型**：`InitData`、`ListInitData`、`ListItem`、`ArticleInitData`、`ArticleDetail`、`SceneCodeType`
- **常量**：`SceneCode`、`PATH_SCENECODE`、`INIT_DATA_GLOBAL`、`INIT_DATA_ID`

## Path 解析

- **getSceneCodeFromPath(pathname)**：根据 pathname 解析 scenecode。先精确匹配 `PATH_SCENECODE`（如 `/`、`/list` → list），再匹配 `/article/:slug` → article。
- **getPageParamsFromPath(pathname)**：解析出该页的 `PageParams`（如 article 的 `{ slug }`）。
- **PageParams**：`{ list?: {}; article?: { slug: string }; home?: {} }`。

## 接口化请求

- **PageRequest**：POST /page 的请求体类型，`{ scenecode; params? }`。
- **requestPage(options)**：请求首屏数据。
  - 默认 **GET 语义化 path**（如 `GET /list`、`GET /article/xxx`），解析响应 HTML 中的 `#__INIT_DATA__` 得到 `InitData`。
  - `usePost: true` 时改为 **POST /page**，body 为 `PageRequest`，响应 JSON 为 `InitData`。

## 使用示例

```ts
import {
  getSceneCodeFromPath,
  getPageParamsFromPath,
  requestPage,
  type ListInitData,
} from "@aura/request-sdk";

const pathname = "/article/hello-world";
getSceneCodeFromPath(pathname);   // "article"
getPageParamsFromPath(pathname);  // { article: { slug: "hello-world" } }

const data = await requestPage({
  baseUrl: "https://example.com",
  scenecode: "list",
});
```
