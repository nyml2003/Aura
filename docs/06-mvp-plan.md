# MVP 方案：文章列表页（开发到部署全链路验证）

在 [01–05](./README.md) 与 [demo-first-screen](../demo-first-screen/) 基础上，用**一个文章列表页**做 MVP，从开发到部署跑通整条链路，验证 Nginx + Go（内联 JSON）+ Solid 首屏方案可行。本文档约定 MVP 范围、技术边界、实现要点与验收标准。

---

## 一、MVP 目标与范围

| 项 | 说明 |
|----|------|
| **目标** | 验证「用户访问列表页 → Nginx → Go 返回带 `__INIT_DATA__` 的 HTML → 前端 Solid 读数据一次渲染 → 首屏稳定」；并在 Docker 内完成部署。 |
| **功能范围** | **仅文章列表页**：首屏展示若干文章卡片（标题、摘要、链接等），无登录、无分页加载更多、无详情页、无搜索。 |
| **非目标** | 首页推荐、文章详情、管理后台、搜索、评论、统计等均不做；数据源用内存或本地 JSON/文件即可。 |

---

## 二、技术栈与约束对应

与 [02-约束](./02-constraints.md)、[05-首屏方案](./05-first-screen-design.md) 一致：

| 层级 | 选型 | 说明 |
|------|------|------|
| **后端** | Go | 单进程；提供列表页 HTML（内联 JSON）及静态资源路由不处理（交给 Nginx）。 |
| **前端** | Monorepo + 多 npm 包（Solid + TypeScript + Vite） | 请求 SDK（交互与非首屏请求）、页面通用依赖（如从 window 解析数据并渲染）；列表页等应用包依赖上述包，首屏单 bundle 读内联数据渲染。 |
| **样式** | CSS 抽离（class） | 首屏样式放独立 CSS，不内联 style。 |
| **反向代理** | Nginx | 页面请求 → Go；`/assets/` → 静态目录。 |
| **部署** | Docker Compose | 至少 Nginx + Go 二容器；前端构建产物由 Nginx 提供（挂卷或打进镜像）。 |
| **数据** | 内存或本地文件 | 若干条固定文章元数据即可，无需 SQLite/DB。 |

---

## 三、网关层与 scenecode 分发

后端**增加网关层**：所有需首屏数据的请求先进入网关，由 **scenecode（场景码）** 区分页面，再分发到对应场景 Handler，与 [02-约束](./02-constraints.md)「先做单体、区分网关层」一致。

### 3.1 网关职责

- **统一网关**：所有需首屏数据的 **GET** 请求（如 `GET /list`、`GET /article/xxx`）由 Nginx 转发到 Go，由**网关**统一接收。
- **path → scenecode**：网关根据**语义化 path** 解析 scenecode（及参数），例如 `/list` → `list`，`/article/hello` → `article` 且 params `{ slug: "hello" }`；不要求单一 URL，用户可见的即是语义化 path。
- **分发**：按 scenecode 调用对应**场景 Handler**，由各 Handler 拼装该页的 `__INIT_DATA__` 并渲染对应 HTML 模板。
- **可选 POST /page**：若需接口化请求，可保留 `POST /page`、body `{ "scenecode": "list", "params": {} }`，网关从 body 读 scenecode 再分发；首屏与站内链接以 GET + 语义化 path 为主。
- **非页面请求**：`/health`、`/assets/*` 不经过网关；静态资源由 Nginx 提供。

### 3.2 与 02 约束的对应

- 网关层仅做「识别场景 + 分发」，不承载业务；业务逻辑在各自 Scene Handler 及下层（数据、模板）中，便于后续拆微服务时网关独立演进。

---

## 四、URL 设计：语义化与首屏注入的兼容

**结论**：前端 URL 用**语义化 path**（如 `/`、`/list`、`/article/hello-world`），后端根据 **path 解析 scenecode** 再返回带 `__INIT_DATA__` 的 HTML，二者天然兼容，也是常见做法。

### 4.0.1 业界常见做法

- **语义化 URL**：用户与搜索引擎看到的是有含义的 path，如 `/`、`/list`、`/article/my-post`、`/tag/frontend`，利于分享、收藏、SEO。
- **服务端按 path 出页**：用户请求 `GET /list` 或 `GET /article/xxx` 时，服务端根据 **path** 判断是哪个页面，返回对应 HTML（可带内联数据或再请求接口）。path 即「要什么页」，后端只负责「按 path 出哪一页」。
- **与「首屏注入」的关系**：后端收到 `GET /list` → 网关由 path 得到 scenecode `list` → 拼装该页的 `__INIT_DATA__` → 输出 HTML。URL 保持语义化，注入逻辑在服务端内部由 path 驱动，不冲突。

### 4.0.2 本方案约定

- **用户可见的 URL**：语义化 path，例如  
  - `GET /` → 首页  
  - `GET /list` → 文章列表  
  - `GET /article/:slug` → 文章详情  
  - 后续可扩展 `/tag/:name`、`/search` 等  
- **后端网关**：接收上述 **GET + path**，在网关内做 **path → scenecode（+ 参数）** 的映射，例如 `/list` → `list`，`/article/xxx` → `article` 且 params `{ slug: "xxx" }`，再分发到对应 Handler，返回带内联数据的 HTML。  
- **可选**：若需接口化请求，可保留 **POST /page**、body `{ "scenecode": "list", "params": {} }`，网关从 body 读 scenecode 再分发；用户首屏与链接仍以 **GET + 语义化 path** 为主。  
- **链接**：后端下发的链接为**完整 URL**（含 scheme + host，如 `https://mysite.com/list`、`https://mysite.com/article/hello-world`），便于分享、复制、RSS；前端只使用、不拼接。后端按环境配置站点 base 后拼出完整 URL。

---

## 五、前后端请求契约（SDK）

前后端**约定一套请求与首屏数据结构**，通过**共享契约**（类型定义 + scenecode 枚举 + path 与 scenecode 映射）对齐，便于联调与演进；可落成「请求 SDK」或共享包。

### 5.1 统一网关与 scenecode 来源

- **网关统一入口**：所有需首屏数据的 **GET** 请求由 Nginx 转到 Go，网关**统一接收**；scenecode 由 **path 解析**得到（见上节），不依赖单一 URL。
- **path → scenecode 映射**：契约中约定 path 与 scenecode（及参数）的对应，例如 `/list` → `list`，`/article/:slug` → `article` 且 `params.slug`；后端网关按此映射分发；前端仅使用后端下发的链接（**完整 URL**）。
- **可选 POST /page**：body `{ "scenecode": "list", "params": {} }`，用于接口化/程序化请求；用户首屏与站内链接以 GET + 语义化 path 为主。
- **scenecode 枚举**：契约中枚举所有取值（如 `list`、`article`、`home`），MVP 仅实现 `list`。

### 5.2 首屏数据契约（按 scenecode）

- 每个 scenecode 对应一份 **`__INIT_DATA__` 结构**，前后端共用同一份类型定义。
- **MVP**：仅约定 `list` 的 InitData，例如 `{ "scene": "list", "list": [ { "id", "type", "title", "summary", "href", "meta" }, ... ] }`；其中 **href 为完整 URL**（由后端按站点 base 拼出）。可选带 `scene` 字段便于前端分支渲染。
- **共享方式**：  
  - 方案 A：在 Monorepo 内建 **contract**（或 **sdk**）包，用 TypeScript 定义类型与 scenecode 常量，Go 侧手写或通过脚本生成与之一致的 struct。  
  - 方案 B：OpenAPI 描述首屏不适用（首屏无独立 REST），可单独维护一份「首屏 InitData 约定」文档 + 各端手写类型；后续若有 REST 再上 OpenAPI。

### 5.3 请求 SDK 的形态（建议）

- **path 与 scenecode 映射**：SDK 中约定 path 模式与 scenecode（及 params）的对应，与后端网关一致；可选 POST /page 时请求体类型为 `{ scenecode, params? }`。
- **前端**：使用契约中的 `SceneCode` 与各场景 InitData 类型；首屏由**语义化 URL** 打开（如 `/list`），后端根据 path 返回对应 HTML 与 `__INIT_DATA__`；入口根据 `initData.scene` 选择渲染列表/详情等。
- **后端**：网关对 **GET** 按 **path** 解析 scenecode（及 params），对 **POST /page** 从 body 读取；各 Handler 拼装的 payload 与契约中该 scenecode 的 InitData 结构一致。

---

## 六、目录结构建议（Monorepo）

**前端为 Monorepo**：根目录下前端代码由**多个 npm 包**组成，便于复用与分层。

- **请求 SDK**（如 `packages/request-sdk`）：封装与后端的请求契约（scenecode、InitData 类型、path 映射等），支持**交互与非首屏数据请求**（如 POST /page、加载更多、分页、详情接口等）；前后端共用契约，前端各页面引用。
- **页面通用依赖**（如 `packages/page-common`）：**从 window 解析首屏数据并渲染**的通用逻辑，例如读 `window.__INIT_DATA__`、按 scenecode 做入口分发、首屏打点等；各页面应用依赖此包，首屏不重复实现。
- **各页面应用**（如 `apps/list`、后续 `apps/article`）：具体页面的 Solid 应用，依赖 request-sdk 与 page-common；首屏用 page-common 读内联数据渲染，交互与后续请求用 request-sdk。

```
ventus/
├── docs/
├── demo-first-screen/
├── app/
│   ├── contract/           # 可选：前后端共享契约（scenecode、InitData 类型）
│   │   ├── scenecode.ts
│   │   ├── init-data.ts
│   │   └── ...
│   ├── backend/
│   │   ├── cmd/server/
│   │   ├── internal/
│   │   │   ├── gateway/
│   │   │   ├── scene/
│   │   │   │   ├── list.go
│   │   │   │   └── ...
│   │   │   ├── data/
│   │   │   └── template/
│   │   ├── go.mod
│   │   └── Dockerfile
│   ├── frontend/           # 前端 Monorepo 根（pnpm workspace）
│   │   ├── packages/
│   │   │   ├── request-sdk/   # 请求 SDK：契约、scenecode、非首屏请求
│   │   │   └── page-common/   # 页面通用：解析 window.__INIT_DATA__、入口分发、首屏打点
│   │   ├── apps/
│   │   │   └── list/          # 列表页应用（MVP）；后续 article、home 等
│   │   ├── pnpm-workspace.yaml
│   │   └── ...
│   ├── nginx/
│   └── docker-compose.yml
└── ...
```

---

## 七、后端 MVP 要点（Go）

### 7.1 网关 + 场景分发

- **GET + 语义化 path**：用户请求 `GET /list`（或 `GET /` 映射到列表）时，网关根据 **path** 解析出 scenecode `list`，调用 ListHandler，返回带 `__INIT_DATA__` 的 HTML。
- **path → scenecode 映射**：网关内维护 path 规则，如 `/list` → `list`，`/` → `list`（或 `home`，MVP 可二选一）；后续 `/article/:slug` → `article` 且 params。
- **ListHandler**：scenecode 为 `list` 时调用；拼装列表页 `__INIT_DATA__`（结构符合契约），执行列表页 HTML 模板，返回 200。
- **可选 POST /page**：body `{ "scenecode": "list" }`，网关从 body 读 scenecode 再分发，用于接口化请求。
- **GET /health**：不走网关，直接 200。

### 7.2 路由与 scenecode（MVP）

- **GET /list**（或 **GET /**）：网关 path → scenecode `list` → ListHandler → 返回带内联 JSON 的 HTML。用户可见 URL 为语义化 path，后端照常注入数据。
- 不提供单独 REST 列表接口；列表数据仅通过上述页面的 HTML 内联下发。

### 7.3 列表数据结构（与契约一致）

与「五、前后端请求契约」中 `list` 场景的 InitData 一致。示例：

```json
{
  "scene": "list",
  "list": [
    {
      "id": "article-1",
      "type": "article",
      "title": "文章标题",
      "summary": "摘要",
      "href": "https://example.com/article/article-1",
      "meta": "2025-03-07"
    }
  ]
}
```

- `scene`：可选，便于前端按场景分支；`list` 与 `href` 由后端生成，**href 为完整 URL**，前端只做跳转（MVP 详情链接可占位）。
- 后续可增加 `site` 等模块，与 05 按页拼模块一致。

### 7.4 HTML 模板要点

- **Head 内**：  
  - `<script type="application/json" id="__INIT_DATA__">{{.InitDataJSON}}</script>`  
  - 紧跟一段小脚本：解析 `#__INIT_DATA__` 并赋给 `window.__INIT_DATA__`（与 demo 一致）。  
  - `<link rel="modulepreload" href="/assets/index.js">`（或实际静态路径）。  
- **Body**：  
  - `<div id="root"></div>`  
  - `<script type="module" src="/assets/index.js"></script>`  
- **InitDataJSON**：对上述 `list` 的 JSON 做转义后注入，避免 `</script>` 破坏结构。

### 7.5 数据源（MVP）

- 内存：在包内定义 `[]Article`，硬编码 5～10 条；或从本地 JSON 文件（如 `data/articles.json`）加载，启动时读入内存。
- 无需 DB、无需分页；列表长度固定即可。

### 7.6 静态资源

- Go **不**提供 `/assets/*`；由 Nginx 直接提供前端构建产物。  
- 模板中只写死或配置「静态资源根路径」（如 `/assets/`），构建产物部署到 Nginx 对应目录。

---

## 八、前端 MVP 要点（Solid + Monorepo 多包）

### 8.0 前端架构：Monorepo 与多 npm 包

- **前端整体**：Monorepo（如 pnpm workspace），内含**多个 npm 包**，各司其职。  
- **请求 SDK**（`packages/request-sdk`）：与后端契约一致的类型与 scenecode、path 映射；提供**交互与非首屏数据请求**（如 POST /page、加载更多、分页、详情等），各页面引用，不重复实现。  
- **页面通用依赖**（`packages/page-common`）：**从 window 解析首屏数据并渲染**的通用能力，例如读 `window.__INIT_DATA__`、按 scenecode 做入口分发、首屏打点（perf）；各页面应用依赖此包，首屏逻辑集中、可测。  
- **页面应用**（如 `apps/list`）：列表页为独立应用包，依赖 request-sdk 与 page-common；首屏用 page-common 读内联数据并渲染，后续交互与请求用 request-sdk。MVP 仅实现 list 应用。

### 8.1 与 demo 的衔接

- **技术栈**：Solid + Vite + TypeScript，与 [demo-first-screen/client](../demo-first-screen/client/) 一致；首屏逻辑收敛到 page-common，list 应用只负责列表页 UI 与数据消费。  
- **首屏逻辑**：通过 page-common 读 `window.__INIT_DATA__`（或 fallback 到 `#__INIT_DATA__` + parse），根组件接收 `initData`，渲染列表；**不**发首屏接口请求。  
- **样式**：独立 CSS 文件，class 命名可沿用 demo（如 `.layout`、`.card`）或简化。

### 8.2 数据结构与契约

- 使用与后端约定的 **InitData** 类型（见「五、前后端请求契约」）；由 **request-sdk** 或 `app/contract` 提供类型，list 应用引用。  
- 入口根据 `initData.scene`（若有）或当前 path 决定渲染列表页；列表页组件根据 `list` 渲染卡片，点击使用 `item.href`（**完整 URL**，MVP 详情可占位）。  
- 可选：首屏打点放在 **page-common**，便于在 MVP 环境复测 breakdown。

### 8.3 构建与产物

- 构建入口为**列表页应用**（如 `apps/list`）；`pnpm build` 输出到该应用的 `dist/`（或 monorepo 统一输出目录），主入口为 `dist/assets/index.js`（或与 Vite 配置一致）。  
- 部署时将该 `dist` 作为 Nginx 静态根或 `/assets/` 的源，与 Go 模板中的路径一致。

---

## 九、Nginx 配置要点

- **location /**：所有语义化 path（`/`、`/list`、`/article/*` 等）均转给 Go，由网关按 path 解析 scenecode 并返回对应 HTML。  
  - `proxy_pass http://go_backend;`（如 `http://127.0.0.1:8080`）；  
  - 传递 `Host`、`X-Real-IP` 等常用头。  
- **location /assets/**：  
  - `alias /path/to/frontend/dist/assets/;` 或 `root /path/to/frontend/dist;`，由实际部署路径决定。  
  - 可加 `expires 1y;`、`add_header Cache-Control "public, immutable";`。  
- **location /health**（可选）：  
  - `proxy_pass http://go_backend/health;`。  
- 页面 HTML 不长期缓存（不设或短 TTL），静态资源强缓存。

---

## 十、Docker 要点

- **服务**：  
  - **go**：Go 二进制，暴露 8080；不挂载前端静态资源。  
  - **nginx**：依赖 go；监听 80；挂载 nginx 配置与**前端构建产物**（如 `./frontend/dist:/var/www/frontend/dist:ro`）。  
- **构建**：  
  - 前端需先 `pnpm build`，再 `docker compose build`（或 CI 中先构建再打镜像）；或通过多阶段构建在镜像内执行 `pnpm build`。  
  - Go 通过 `go build` 产出二进制，写入镜像。  
- **启动顺序**：Nginx 依赖 Go；Compose 中 `depends_on: [go]` 即可，如需健康检查可加 `condition: service_healthy`（Go 提供 `/health` 时）。

---

## 十一、开发与部署顺序建议

1. **契约（可选先做）**  
   - 在 `app/contract`（或前后端各自）定义 scenecode 常量与 `list` 场景的 InitData 类型；Go 与前端类型对齐。  

2. **Go**  
   - 新建 `app/backend`，实现**网关**（GET 按 **path → scenecode** 映射、分发）+ **ListHandler**；`GET /list`（或 `GET /`）返回带 `__INIT_DATA__` 的 HTML；本地 `go run` 可验证。  

3. **前端**  
   - 在 `app/frontend` 下按 Monorepo 多包搭建：**request-sdk**、**page-common**（读 window、打点）、**apps/list**；列表页应用依赖前两者，读 `__INIT_DATA__`、按契约类型渲染 list。本地 Vite dev 用 mock 或直连 Go，确认列表展示正常。  

4. **对接**  
   - Go 模板引用 `/assets/index.js`；本地 Nginx 指向前端 `dist`，Go + Nginx 同时起，浏览器经 Nginx 访问列表页，确认首屏即列表、无额外接口请求。  

5. **Docker**  
   - 编写 Dockerfile（Go）、多阶段或挂卷提供前端静态；编写 docker-compose.yml；`docker compose up` 后访问列表页，行为与本地一致。  

6. **可选**  
   - 在列表页保留首屏打点，在部署环境中抓一次 breakdown，与 05 的「前端 20–40ms」结论对照。  

---

## 十二、验收标准

| 项 | 标准 |
|----|------|
| **功能** | 浏览器访问**语义化 URL**（如 `/list`），首屏即展示文章列表卡片，数据来自 HTML 内联，无白屏再请求列表接口。 |
| **Network** | 首屏仅一条文档请求 + 静态资源（JS/CSS）；无单独 list/article API。 |
| **部署** | `docker compose up` 后，通过 Nginx 端口访问列表页，展示与本地一致。 |
| **首屏方案** | 实现方式符合 05：Nginx 反代 Go、Go 输出内联 JSON、前端 Monorepo 多包（page-common 读数据）+ 单 bundle 渲染；可选打点结果与 05 实测区间一致。 |

---

## 十三、后续扩展（非 MVP）

- 文章详情页、首页推荐、分页加载更多、搜索、管理后台、评论与统计等，按 01 产品需求与 02 约束在后续迭代中扩展。
