# 文章管理后台：产品与视觉设计

## 一、产品设计

### 1.1 页面划分

管理后台按「一页一事」拆成三个**独立应用**（三份目录），通过 URL 区分，MPA 整页加载。

| 路径 | 应用目录 | 说明 |
|------|----------|------|
| `/admin` | apps/admin-list | 文章列表 |
| `/admin/articles/new` | apps/admin-new | 新建文章 |
| `/admin/articles/:id/edit` | apps/admin-edit | 编辑文章 |

### 1.2 列表页（admin-list）

- 主操作：「新建文章」→ 跳转 `/admin/articles/new`。
- 表格：标题、摘要、元信息、操作（编辑 | 删除）。
- 编辑 → `/admin/articles/:id/edit`；删除 → 确认后请求接口并刷新列表。

### 1.3 新建页（admin-new）

- 仅表单，保存 → 创建接口 → 跳回 `/admin`；取消 → `/admin`。

### 1.4 编辑页（admin-edit）

- 预填表单，保存/删除后跳回 `/admin`。id 由服务端 HTML 注入 `window.__ADMIN_EDIT_ID__` 或 pathname 解析。

### 1.5 共享代码

- `packages/admin-common`：AdminLayout、ArticleForm、ListPage、NewPage、EditPage、types、paths。三个应用均依赖此包。

---

## 二、视觉设计

（与之前 DESIGN 一致：design-system、留白、表格与表单样式、主色/警示色。）

---

## 三、技术实现

- **三份独立应用**：admin-list、admin-new、admin-edit 各为一个 Vite 应用，单入口，构建产出各自 `dist/`。
- **后端**：挂载 `/assets-admin-list`、`/assets-admin-new`、`/assets-admin-edit` 三份静态；按路由返回对应 HTML，引用对应 `index.js`、`index.css`；编辑页 HTML 注入 `__ADMIN_EDIT_ID__`。
