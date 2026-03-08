# 博客系统设计文档索引

本目录为博客系统从产品需求到技术设计、MVP 方案的文档集合，建议按下列顺序阅读。

---

## 文档列表与阅读顺序

| 文档 | 说明 |
|------|------|
| **[01-product-requirements.md](./01-product-requirements.md)** | **产品需求**：功能范围、体验目标（含首屏约 100ms、链接由系统生成并下发为完整 URL）、页面拆解与职责；产品不规定具体 URL/路由。 |
| **[02-constraints.md](./02-constraints.md)** | **约束**：运行环境（2 核 2G、单机单实例等）、架构与部署、后端与 API、前端（Monorepo + 多 npm 包）、内容与数据、安全、性能与体验、运维、质量；技术设计必须在此范围内。 |
| **[03-goals-and-technical-options.md](./03-goals-and-technical-options.md)** | **目标与技术选型**：希望达成的结果、服务形态考量、博文内容存储与运维等选型参考；含前端 Monorepo 多包、链接完整 URL。 |
| **[04-product-tech-feasibility.md](./04-product-tech-feasibility.md)** | **可行性评估**：产品需求与约束对照、首屏 100ms 推荐方案（Deno 内 BFF/SSR + 数据内联或随 SSR 注入）、必须落地的清单；链接与响应结构均为完整 URL。 |
| **[05-first-screen-design.md](./05-first-screen-design.md)** | **首屏方案设计**：Nginx + Go + 前端完整链路；实测依据（demo）、JSON 注入 HTML 时 Nginx 仍作反向代理与静态资源服务；前端 Monorepo 多包（请求 SDK、页面通用依赖）、目标前端 20–40ms、后端 <60ms。 |
| **[06-mvp-plan.md](./06-mvp-plan.md)** | **MVP 方案**：文章列表页全链路验证；网关与 scenecode 分发、URL 设计（语义化 path + 链接下发完整 URL）、前后端请求契约（SDK）、目录结构（前端 Monorepo 多包：request-sdk、page-common、apps/list）、后端/前端/Nginx/Docker 要点、开发与部署顺序、验收标准。 |
| **[07-template-dsl-and-injection.md](./07-template-dsl-and-injection.md)** | **页面模板 DSL 与分阶段注入**：索引（完整方案见 06 之 7.4、7.5）+ 业界方案对比摘要。 |
| **[08-pipeline-and-roles.md](./08-pipeline-and-roles.md)** | **整条链路与各角色联动**：**主方案 Deno + Solid + SSR**（自建服务器、Nginx 反代 Deno、Hono + solid-ssr）；附录含 Go BFF + qtpl 备选、Bun/Deno 对比等。 |
| **[09-url-routing-and-links.md](./09-url-routing-and-links.md)** | **URL/路由设计与链接规则**：语义化 path、scenecode 对应、链接由系统生成并下发为完整 URL 的规则。 |
| **[10-api-contract.md](./10-api-contract.md)** | **前后端 API 契约**：首屏数据与异步 API 的通用结构、链接在响应中的位置；Item 领域模型后续在文档内补充。 |
| **[11-backend-mvp-solidstart.md](./11-backend-mvp-solidstart.md)** | **MVP 后端方案**：Node + SolidStart 单进程，网关/业务层/SSR 划分、目录结构、与 09/10 对齐、一次性删除 Go/Deno 的清单与验收。 |

---

## 元方案与后续约定

- **已确定的元方案**：URL/路由与链接规则见 **09**；前后端 API 契约（含首屏与链接字段）见 **10**；Item 领域模型在 10 中**后续补充**。
- **MVP 后再约定**：**管理后台细节**、**搜索**（接口与形态）、**缓存**（策略与失效）在 MVP 版本完成后再约定。
- **前端工程**：当前以**独立应用**为主，**先跑起来**，再视需要调整结构（如是否 Monorepo、多包拆分等）。

---

## 约定摘要

- **契约包（contract）**：类型与常量统一用 **`.ts`**，由 index 统一 re-export（详见 11）。
- **链接**：后端下发的链接为**完整 URL**，前端只使用、不拼接。
- **前端架构**：当前以**独立应用**先跑通为主；后续可演进为 Monorepo + 多 npm 包（请求 SDK、页面通用依赖、各页面应用）。
- **首屏**：**Deno（TS）** 按 URL 做 BFF/SSR、注入数据到 HTML 或随 SSR 返回；前端单 bundle 读内联数据或 hydrate；目标前端 20–40ms、后端 <60ms、总约 100ms。

---

## 仍须在技术设计阶段落地的

首屏模块划分与内联格式、小游戏/demo 承载与性能边界、搜索方案与资源、推荐打标存储与 API、链接（完整 URL）与响应结构、运维前端是否必做（见 04 必须覆盖清单）。
