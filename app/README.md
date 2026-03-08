# MVP：文章列表页（Node + Solid）

按 [docs/11-backend-mvp-solidstart.md](../docs/11-backend-mvp-solidstart.md)、[09-url-routing-and-links.md](../docs/09-url-routing-and-links.md)、[10-api-contract.md](../docs/10-api-contract.md) 实现的列表页全链路：**Nginx → Node 后端（空壳 + `__INIT_DATA__`）→ Solid 前端渲染**。包管理统一 **pnpm**。

## 目录结构

| 目录 | 说明 |
|------|------|
| **contract/** | 前后端共用：契约类型（`.d.ts`）+ 运行时常量（`.ts`），`ListItem`、`ListInitData`、scenecode、`__INIT_DATA__`。 |
| **frontend/** | pnpm workspace：`apps/list`（Solid 列表页）、`packages/page-common`（读 `__INIT_DATA__`）、`packages/request-sdk`；依赖 `../contract`。 |
| **backend/** | Node（Express）：网关、业务层（`listData()` mock）、API（`GET /api/list`）、首屏 HTML（壳 + 注入）；依赖 `../contract`。 |
| **nginx/** | Nginx 配置：全部请求反代到 Node:3000。 |

## 一键运行（Docker）

在 `app` 目录下执行（需已安装 Docker、建议 Node 20+ 与 pnpm 用于本地构建）：

```bash
python run.py
# 或
python3 run.py
```

镜像内会：构建 contract → 构建 frontend → 构建 backend，然后启动 Node + Nginx。  
访问 **http://localhost:9080/** 或 **http://localhost:9080/list** 即可看到文章列表；首屏数据来自 HTML 内联，无额外列表接口请求。

## 分步运行（本地）

### 1. 契约包

```bash
cd app/contract
pnpm install
pnpm run build
```

### 2. 前端

```bash
cd app/frontend
pnpm install
pnpm run build:list
```

产物在 `app/frontend/apps/list/dist/`。

### 3. 后端（本地起 Node，直连 3000）

```bash
cd app/backend
pnpm install
pnpm run build
# 需能访问到前端 dist（默认 ../frontend/apps/list/dist）
pnpm start
# 或开发：pnpm run dev
```

浏览器访问 http://localhost:3000/ 或 http://localhost:3000/list。

### 4. 完整链路（Docker：Node + Nginx）

在 `app` 目录下执行：

```bash
docker compose up --build
```

访问 **http://localhost:9080/** 或 **http://localhost:9080/list**。Nginx 将请求转发到 Node，静态 `/assets/*` 由 Node 提供。

## 验收要点

- 访问 http://localhost:9080/list 或 http://localhost:9080/ 首屏即展示文章卡片，数据来自内联 `__INIT_DATA__`，无白屏、无再请求列表接口。
- `GET /api/list` 返回 JSON（`{ scene: 'list', list: [...] }`），供前端分页/筛选等后续使用。
- 列表项链接为完整 URL（如 `http://localhost:9080/article/xxx`），由后端按 `SITE_BASE` 生成。

## 若 Docker 构建报错（registry EOF / 超时）

拉取 `docker.io` 镜像失败时，可配置 Docker 镜像加速（如 `https://docker.1ms.run`）或更换网络后重试 `docker compose up --build`。
