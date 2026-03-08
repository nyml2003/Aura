# @aura/request-sdk 设计说明

## 1. 定位与目标

`@aura/request-sdk` 是前端的**请求契约层**：统一管理「请求路径、场景码、入参/出参类型」以及「首屏数据、管理端 API」的调用方式，与 BFF/后端约定保持一致。

**目标：**

- **单一出口**：所有与后端约定相关的 path、scenecode、请求方式集中在此包，业务包（如 `page-common`、`admin-common`）只依赖 request-sdk，不直接写 `fetch` 或硬编码 path。
- **类型一致**：首屏与契约类型来自 `@aura/contract`，管理端 API 的类型在 request-sdk 内定义并导出，保证前后端对齐。
- **分层清晰**：先封装 **基础 HTTP 请求**（get/post/put/delete），再在其上封装 **业务请求**（首屏、管理端文章等），避免各业务模块重复实现 fetch、错误解析、baseUrl 处理。

---

## 2. 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│  业务层：首屏请求 (request.ts)、管理端文章 (adminArticles.ts)   │  ← 只关心 path、参数、业务类型
├─────────────────────────────────────────────────────────────┤
│  基础层：client.get / post / put / delete (client.ts)         │  ← 统一 baseUrl、错误解析、JSON/Text
├─────────────────────────────────────────────────────────────┤
│  底层：fetch                                                  │
└─────────────────────────────────────────────────────────────┘
```

- **基础层**：提供与 HTTP 方法对应的 `get`、`post`、`put`、`delete`（以及按需的 `getText`），处理 baseUrl 拼接、默认 JSON 解析、非 2xx 时的错误信息解析与抛错。业务层**只调用基础层**，不再直接使用 `fetch`。
- **业务层**：首屏请求、管理端文章 API 等只负责「拼 path、传参、定义入参/出参类型」，内部全部通过基础层的 get/post/put/delete 发请求。

---

## 3. 基础层设计（client）

### 3.1 职责

- 统一 **baseUrl** 处理（尾部斜杠归一、与 path 拼接）。
- 统一 **请求方式**：`get`、`post`、`put`、`delete`。
- 统一 **响应处理**：默认按 JSON 解析；可选按文本返回（如首屏 GET 拿 HTML 时用 `getText`）。
- 统一 **错误处理**：非 2xx 时尝试从 body 解析 `{ error?, detail? }` 拼成可读文案并抛出 `Error`，解析失败则用 `statusText` 或 body 文本。

### 3.2 接口形态（二选一或并存）

**方案 A：函数式**

```ts
// 所有方法签名中显式传 baseUrl（可选，默认 ""）
get<T>(path: string, baseUrl?: string): Promise<T>
getText(path: string, baseUrl?: string): Promise<string>
post<T>(path: string, body?: unknown, baseUrl?: string): Promise<T>
put<T>(path: string, body?: unknown, baseUrl?: string): Promise<T>
del<T>(path: string, baseUrl?: string): Promise<T>
```

- 优点：无状态、简单，适合当前所有调用都是「相对 path + 可选 baseUrl」。
- 缺点：每次调用都要传 baseUrl（若多数请求同一 base 会略啰嗦）。

**方案 B：创建 client 实例**

```ts
const client = createClient(baseUrl?: string);

client.get<T>(path): Promise<T>
client.getText(path): Promise<string>
client.post<T>(path, body?): Promise<T>
client.put<T>(path, body?): Promise<T>
client.del<T>(path): Promise<T>
```

- 优点：baseUrl 固定一次，业务层代码更简洁；后续若要加公共 header、拦截器、重试，只需在 `createClient` 内扩展。
- 缺点：多一层「实例」概念。

**已采用方案 B**：基础层提供 `createClient(baseUrl)`，返回 `ApiClient` 实例；业务层通过 **ApiClientProvider + useApiClient** 在组件树中注入并消费同一 client。

### 3.3 ApiClientProvider 与 useApiClient（Solid 上下文）

- **ApiClientProvider**：在应用根部包裹，为子树提供 `ApiClient`。  
  - 支持 `client`（直接传入已创建的 client）或 `baseUrl`（内部 `createClient(baseUrl)`）二选一；都不传则使用相对路径 `""`。  
  - 子组件通过 `useApiClient()` 获取同一 client，保证 baseUrl、后续扩展的 header/拦截器一致。

- **useApiClient()**：在业务组件内调用，返回当前上下文的 `ApiClient`。  
  - 若未包裹 Provider，返回使用相对路径的默认 client（`createClient("")`），避免报错，便于渐进接入。

- **业务用法**：在 admin 等应用的根（如 `main.tsx`）用 `<ApiClientProvider>` 或 `<ApiClientProvider baseUrl="...">` 包裹；在 EditPage、ListPage、NewPage 等组件中 `const client = useApiClient()`，再将 `client` 传入 `getArticle(id, client)`、`listArticles(client)` 等业务 API。

### 3.4 错误处理约定

- 非 2xx：先读 body 文本，若为 JSON 且含 `error` 或 `detail`，则拼成 `"error: detail"` 或单字段内容后 `throw new Error(msg)`；否则用 `res.statusText` 或 body 文本抛错。
- 网络异常、JSON 解析失败：直接抛出，由调用方 catch。

### 3.5 文件与导出

- **client.ts**：实现 `createClient(baseUrl)` 与 `ApiClient`（get、getText、post、put、del）；内部使用 `fetch`，不依赖 contract。
- **ApiClientContext.tsx**：Solid 的 `createContext` + `ApiClientProvider` 组件 + `useApiClient()`；依赖 `solid-js` 与 `client.ts`。
- **index.ts**：导出 `createClient`、`ApiClient`、`ApiClientProvider`、`useApiClient`、`ApiClientProviderProps`，以及 path、request、adminArticles 等业务 API。

---

## 4. 业务层设计（在基础层之上）

### 4.1 类型与常量再导出（index → contract）

从 `@aura/contract` 再导出首屏相关类型与常量，方便调用方只依赖 request-sdk 即可拿到完整契约：

| 类型 / 常量 | 说明 |
|------------|------|
| `InitData`、`ListInitData`、`ListItem`、`ArticleInitData`、`ArticleDetail` | 首屏数据结构 |
| `SceneCode`、`SceneCodeType`、`PATH_SCENECODE` | 场景码与 path 映射 |
| `INIT_DATA_GLOBAL`、`INIT_DATA_ID` | 首屏数据在 HTML/window 上的挂载 key |

### 4.2 Path 解析（path.ts）

负责 **pathname → scenecode / 场景参数** 的解析，与后端网关的 path 约定一致。

- **getSceneCodeFromPath(pathname)**  
  从 pathname 解析出场景码。先按 `PATH_SCENECODE` 精确匹配（如 `/`、`/list`），再按约定匹配 `/article/:slug` → `article`。
- **getPageParamsFromPath(pathname)**  
  解析出该页的 `PageParams`（如 article 的 `{ slug }`），供 `requestPage` 使用。
- **PageParams**  
  各场景参数结构：`list` / `home` 为空对象，`article` 为 `{ slug: string }`。

path 规则与后端保持一致，新增场景或 path 时需同步更新 contract 的 `PATH_SCENECODE` 与本模块的解析逻辑。

### 4.3 首屏请求（request.ts）— 使用基础层

负责**按场景请求首屏数据**，支持两种方式：

1. **GET 语义化 path**（默认）  
   使用基础层 **getText(path, baseUrl)** 请求如 `GET /list`、`GET /article/:slug`，拿到 HTML，从 DOM 中取 `#__INIT_DATA__` 的 JSON 得到 `InitData`。
2. **POST /page**（接口化）  
   使用基础层 **post(path, body, baseUrl)** 请求 `POST /page`，body 为 `{ scenecode, params }`，响应 JSON 为 `InitData`。

**对外接口**：`requestPage(options)`、`requestPageByPath(pathname, baseUrl)` 不变；内部将原来的 `fetch` 改为对 client 的 `getText` / `post` 调用。

错误处理：GET 模式解析不到 `__INIT_DATA__` 或 POST 非 2xx 时仍返回 `null`，不抛错。

### 4.4 管理端文章 API（adminArticles.ts）— 使用基础层

管理端文章 CRUD 统一走 `/api/articles`，**内部全部改为**：使用基础层的 `get`、`post`、`put`、`del`，path 为 `API_ARTICLES_BASE` 或 `API_ARTICLES_BASE/:id`，不再在 adminArticles 内直接 `fetch` 或自己写 `parseErrorResponse`。

**常量与类型**：`API_ARTICLES_BASE`、`ArticleRow`、`ArticleFormPayload`、`ArticleRedirectResponse` 不变。

**接口**：`getArticle`、`listArticles`、`createArticle`、`updateArticle`、`deleteArticle` 的入参/出参与对外行为不变；实现上改为调用 client 的 get/post/put/del。

---

## 5. 依赖关系

```
@aura/contract          ← 场景码、首屏数据类型
       ↑
@aura/request-sdk
  ├── client.ts         ← 基础层，仅依赖 fetch，不依赖 contract
  ├── path.ts           ← 依赖 contract（PATH_SCENECODE、SceneCode）
  ├── request.ts        ← 依赖 contract + path + client
  └── adminArticles.ts  ← 依赖 client，不依赖 contract
       ↑
page-common / admin-common / apps/*
```

- 业务包只依赖 request-sdk，不直接写 fetch、不重复错误解析。
- 新增业务 API 时，只写 path + 参数 + 类型，请求一律走 client。

---

## 6. 与 BFF/后端的约定

- **首屏**
  - Path：`/`、`/list`、`/article/:slug` 等与 `PATH_SCENECODE` 及 path 解析逻辑一致。
  - 接口化：`POST /page`，body `{ scenecode, params? }`，响应 JSON 为 `InitData`。
  - HTML 直出时，首屏数据放在 `id="__INIT_DATA__"` 的 script 或元素中，与 `INIT_DATA_ID` 一致。

- **管理端文章**
  - Base path：`/api/articles`。
  - GET `.../api/articles` → 列表；GET `.../api/articles/:id` → 单条。
  - POST `.../api/articles`、PUT `.../api/articles/:id`、DELETE `.../api/articles/:id`。
  - 错误响应建议带 `{ error?, detail? }`，便于 request-sdk 解析后抛出可读错误信息。

---

## 7. 使用方

- **page-common**：使用 `requestPageByPath` 做 CSR 首屏兜底；使用 contract 的 InitData 类型。
- **admin-common**：使用 `getArticle`、`listArticles`、`createArticle`、`updateArticle`、`deleteArticle`，以及 request-sdk 导出的 `ArticleRow` 等类型，不再直接 `fetch(API_BASE/...)`。

各 app 通过 Vite 的 alias 或 workspace 依赖解析到 `@aura/request-sdk`，无需在业务代码中写死 path 或重复实现请求逻辑。

---

## 8. 扩展与维护

- **新增首屏场景**：在 contract 中扩展 `SceneCode` 与 `PATH_SCENECODE`，在 path 中补充解析，在 request 中补充 path 或 POST 参数映射；request 内部继续只使用基础层 get/post/getText。
- **新增管理端或其它 API 域**：在 request-sdk 内新增业务模块（如 `adminXxx.ts`），定义 path 常量、请求方法与类型，**内部只调用 client 的 get/post/put/del**，在 index 中导出。
- **统一 baseUrl、重试、公共 header**：在基础层 `client` 或 `createClient` 中扩展即可，业务层无感知。

这样 request-sdk 始终为「基础请求 + 业务请求」两层结构，前端请求契约与调用方式统一、易于与后端约定对齐和演进。

---

## 9. 实施顺序建议

1. **实现基础层**：新增 `client.ts`，实现 `get`、`getText`、`post`、`put`、`del`（函数式即可），统一 baseUrl 与错误解析；在 index 中导出。
2. **改造 adminArticles.ts**：去掉内部 `fetch` 与 `parseErrorResponse`，改为调用 client 的 get/post/put/del。
3. **改造 request.ts**：首屏 GET 改为 client.getText，POST /page 改为 client.post。
4. **（可选）** 引入 `createClient(baseUrl)`，将各业务函数的 baseUrl 收敛为从 client 实例获取，便于后续加拦截器、重试等。
