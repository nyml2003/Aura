# 博客系统设计文档索引

本目录为博客系统从产品需求到技术设计、MVP 方案的文档集合，建议按下列顺序阅读。

---

## 文档列表与阅读顺序

| 文档 | 说明 |
|------|------|
| **[01-product-requirements.md](./01-product-requirements.md)** | **产品需求**：功能范围、体验目标（含首屏约 100ms、链接由系统生成并下发为完整 URL）、页面拆解与职责；产品不规定具体 URL/路由。 |
| **[02-constraints.md](./02-constraints.md)** | **约束**：运行环境（2 核 2G、单机单实例等）、架构与部署、后端与 API、前端（Monorepo + 多 npm 包）、内容与数据、安全、性能与体验、运维、质量；技术设计必须在此范围内。 |
| **[03-goals-and-technical-options.md](./03-goals-and-technical-options.md)** | **目标与技术选型**：希望达成的结果、服务形态考量、博文内容存储与运维等选型参考；含前端 Monorepo 多包、链接完整 URL。 |
| **[04-product-tech-feasibility.md](./04-product-tech-feasibility.md)** | **可行性评估**：产品需求与约束对照、首屏 100ms 推荐方案（Go 内 BFF 式拼装 + 数据内联）、必须落地的清单；链接与响应结构均为完整 URL。 |
| **[05-first-screen-design.md](./05-first-screen-design.md)** | **首屏方案设计**：Nginx + Go + 前端完整链路；实测依据（demo）、JSON 注入 HTML 时 Nginx 仍作反向代理与静态资源服务；前端 Monorepo 多包（请求 SDK、页面通用依赖）、目标前端 20–40ms、后端 <60ms。 |
| **[06-mvp-plan.md](./06-mvp-plan.md)** | **MVP 方案**：文章列表页全链路验证；网关与 scenecode 分发、URL 设计（语义化 path + 链接下发完整 URL）、前后端请求契约（SDK）、目录结构（前端 Monorepo 多包：request-sdk、page-common、apps/list）、后端/前端/Nginx/Docker 要点、开发与部署顺序、验收标准。 |

---

## 约定摘要

- **链接**：后端下发的链接为**完整 URL**，前端只使用、不拼接。
- **前端架构**：**Monorepo + 多 npm 包**——请求 SDK（交互与非首屏请求）、页面通用依赖（从 window 解析数据并渲染）、各页面应用（如 apps/list）依赖上述包。
- **首屏**：Go 按 URL 做 BFF 式拼装、注入 JSON 到 HTML；前端单 bundle 读内联数据一次渲染；目标前端 20–40ms、后端 <60ms、总约 100ms。

---

## 仍须在技术设计阶段落地的

首屏模块划分与内联格式、小游戏/demo 承载与性能边界、搜索方案与资源、推荐打标存储与 API、链接（完整 URL）与响应结构、运维前端是否必做（见 04 必须覆盖清单）。
