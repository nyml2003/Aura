# MVP：文章列表页

按 [docs/06-mvp-plan.md](../docs/06-mvp-plan.md) 实现的文章列表页全链路：Nginx → Go（内联 `__INIT_DATA__`）→ Solid 首屏渲染。

## 本地运行

### 1. 构建前端

```bash
cd app/frontend
pnpm install
pnpm run build:list
```

产物在 `app/frontend/apps/list/dist/`（含 `index.html`、`assets/index.js`、`assets/index.css`）。

### 2. 仅跑 Go（直连 8080，无 Nginx）

```bash
cd app/backend
go run ./cmd/server
```

浏览器访问 http://localhost:8080/list 或 http://localhost:8080/ 会得到带内联数据的 HTML，但静态资源 `/assets/*` 需由 Nginx 提供，故此时会 404。用于验证网关与列表数据。

### 3. 完整链路（Nginx + Go）

先完成步骤 1，再：

```bash
cd app
docker compose up --build
```

访问 **http://localhost:9080/** 或 **http://localhost:9080/list**，首屏即文章列表，数据来自 HTML 内联，无额外列表接口请求。

## 目录结构

- `backend/`：Go 网关 + List 场景 Handler + 列表页 HTML 模板，数据内存固定
- `frontend/`：pnpm Monorepo
  - `packages/contract`：scenecode、InitData 类型
  - `packages/request-sdk`：契约再导出
  - `packages/page-common`：读 `window.__INIT_DATA__`、首屏分发
  - `apps/list`：Solid 列表页应用
- `nginx/`：Nginx 配置，页面 → Go，`/assets/` → 前端 dist
- `docker-compose.yml`：go + nginx 二容器，前端 dist 挂卷到 nginx

## 验收要点

- 访问 http://localhost:9080/list 或 http://localhost:9080/ 首屏即展示文章卡片，数据来自内联 JSON，无白屏再请求列表接口
- Network：首屏仅文档请求 + JS/CSS，无单独 list API
- `docker compose up` 后经 Nginx（端口 9080）访问列表页行为与预期一致
