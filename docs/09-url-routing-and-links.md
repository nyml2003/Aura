# URL/路由设计与链接生成与下发规则

本文档约定**用户可见的 URL 与路由规范**，以及**链接由系统生成并以下发为完整 URL** 的规则，前后端与网关均按此执行。产品需求见 [01-product-requirements.md](./01-product-requirements.md)。

---

## 一、原则

- **用户可见的 URL**：语义化 path，便于分享、收藏与 SEO；不暴露内部 scenecode/实现细节。
- **链接归属**：所有列表、详情、分页、返回等**链接由系统（后端）生成并下发为完整 URL**，前端只展示与跳转，不自行拼接 path 或 host。
- **路由与 scenecode**：后端网关根据 **path 解析 scenecode**（及参数），再分发到对应场景 Handler；path 即「要什么页」，与 scenecode 一一对应。

---

## 二、URL/路由规范

### 2.1 语义化 path 约定

| path 模式 | 含义 | scenecode（后端解析） | 说明 |
|-----------|------|------------------------|------|
| `/` | 首页 | `home` | 推荐内容瀑布流等 |
| `/list` | 列表页 | `list` | 分页展示 item，可按类型/标签/时间筛选 |
| `/list?page=2&type=article` | 列表页（分页/筛选） | `list` | 参数见下 |
| `/item/:id` 或 `/article/:slug` | 详情页 | `item` / `article` | 文章或小游戏/demo 详情，由 id 或 slug 区分 |
| `/search` | 搜索 | `search` | 关键词 + 筛选，结果分页 |
| `/admin`（或独立子域） | 管理后台 | — | 管理后台细节 MVP 后约定 |

- 具体采用 `/item/:id` 还是 `/article/:slug`、`/game/:id` 等由实现决定，需在 API 契约中与**下发的链接**一致。
- 列表的**分页、筛选**以 **query 参数**表示，例如：`page`、`size`、`type`、`tag`、`from`/`to`（时间）。参数名与可选值在 [10-api-contract.md](./10-api-contract.md) 中与 API 对齐。

### 2.2 完整 URL 的组成

下发的链接为**完整 URL**，形式：

```
{scheme}://{host}{path}{?query}
```

- **scheme**：`https`（生产）或 `http`（本地）。
- **host**：站点域名（含端口，若非常规 80/443），由**后端/网关配置**（如环境变量 `SITE_BASE` 或 `PUBLIC_HOST`）确定，前端不写死。
- **path**：上述语义化 path。
- **query**：可选，与 path 语义一致（如列表的 `page`、`type`、`tag`）。

后端在生成链接时从配置读取「站点 base」（如 `https://mysite.com`），再拼接 path 与 query，保证同一环境内链接一致、可复现。

---

## 三、链接生成与下发规则

### 3.1 谁生成

- **后端/网关**（或 BFF）负责生成所有面向用户的链接；前端不根据 path 模板或 host 自行拼接。

### 3.2 何时、如何下发

- **首屏（SSR）**：在返回的 HTML 中，首屏数据（如 `window.__INIT_DATA__` 或等效注入）里已包含本页用到的链接；列表项、分页、返回等均为**完整 URL**。
- **异步接口**：列表、详情、搜索等 API 的响应体中，凡需要前端做跳转的字段（如列表项的详情链接、分页的上一页/下一页、面包屑/返回链接），均为**完整 URL** 字符串。
- 前端仅将下发的字符串用作 `<a href="...">` 或 `location.href`，不做字符串拼接或替换 host/path。

### 3.3 需下发的链接类型（示例）

| 场景 | 链接内容 | 示例 |
|------|----------|------|
| 列表项 | 该项的详情页 URL | `https://mysite.com/article/hello-world` |
| 列表分页 | 当前页、上一页、下一页、第 N 页（若提供） | `https://mysite.com/list?page=2` |
| 详情页 | 返回首页、返回列表（及可选「上一项/下一项」） | `https://mysite.com/`、`https://mysite.com/list` |
| 搜索 | 搜索结果页 URL（含关键词与筛选参数） | `https://mysite.com/search?q=foo&type=article` |
| 导航 | 首页、列表、搜索等入口 | 同上，完整 URL |

具体字段命名（如 `href`、`url`、`links.prev`）在 [10-api-contract.md](./10-api-contract.md) 中约定。

---

## 四、与网关/scenecode 的对应

- 网关收到 **GET {path}{?query}** 后，根据 **path** 解析出 **scenecode** 与 path 参数（如 `:id`、`:slug`），再分发到对应 Handler。
- path 与 scenecode 的映射由后端与本文档保持一致，例如：`/` → `home`，`/list` → `list`，`/article/:slug` → `article`（params：`slug`）。
- 可选：若提供 **POST /page** 等接口化请求，body 中可传 `scenecode` + `params`，用于程序化获取某页数据；**用户首屏与站内跳转仍以 GET + 语义化 path 为主**，下发的链接也是 GET 的完整 URL。

---

## 五、后续扩展

- 管理后台的 URL 与入口、搜索结果的 URL 形态，可在 MVP 后与「管理后台细节」「搜索」一并约定；本文档中的 path 与链接规则可沿用或做最小扩展。
- 新增页面类型时，在本文档中增加 path 模式与 scenecode，并在 API 契约中补充对应响应里的链接字段。
