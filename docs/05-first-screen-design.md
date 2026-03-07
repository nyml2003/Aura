# 首屏方案设计（含 Nginx + Go + 前端）

在 [demo-first-screen](../demo-first-screen/) 实测基础上，约定首屏方案：Nginx 反向代理、Go 按 URL 拼装数据并注入 HTML、前端读内联数据一次渲染。

---

## 一、实测数据与依据（demo-first-screen）

- **前端首屏（不含图片）**：在 Solid + 单 bundle + CSS、首屏数据内联的前提下，**前端可稳定落在 20–40ms**；其中「responseEnd→scriptStart」约 17ms，仍有优化空间（如 modulepreload、再压 bundle）。
- **Solid vs React**：同结构下 React 首屏前端约 37–49ms，Solid 约 20–40ms；为稳定达成「总约 100ms」且留余量，**首屏方案采用 Solid**（若约束允许）或接受 React 在理想条件下 borderline 达标。
- **后端预算**：浏览器侧「backend」= 从导航到 responseEnd（含 RTT + 服务端处理 + HTML 传输）。为与前端 20–40ms 合计约 100ms，**后端（Go 处理 + 网络）目标 <60ms**；同城 RTT 约 10–30ms 时，Go 首屏逻辑需控制在约 30–50ms 内。

---

## 二、Nginx 能否与「JSON 注入 HTML」并存

**注入 JSON 的 HTML 是「按请求动态生成」的**，不能由 Nginx 直接读静态文件返回，需要**后端按 URL 拼好数据再输出 HTML**。做法是：

- **页面 URL**（如 `/`、`/article/xxx`）：Nginx **反向代理到 Go**，由 Go 拼装首屏数据、注入 `__INIT_DATA__`、返回完整 HTML。
- **静态资源**（如 `/assets/*`）：由 Nginx 直接提供前端构建产物，不经过 Go。

因此 **Nginx 照常使用**：只做反向代理与静态服务，页面请求交给 Go 动态输出带内联数据的 HTML。

---

## 三、整体链路（用户输入 URL 到首屏稳定）

1. 用户请求 `GET /list`（或 `/`、`/article/xxx`）→ Nginx 转发到 Go。
2. Go 根据 path 选择「页面模板」+ 按页拼装首屏模块数据（BFF 式）。
3. Go 将拼好的 JSON 注入模板中的 `<script type="application/json" id="__INIT_DATA__">`，返回 HTML。
4. 浏览器解析 HTML，发现 `<link rel="modulepreload" href="/assets/index.js">`（可选）并请求静态资源。
5. 前端 JS 执行：读 `window.__INIT_DATA__`（或 `#__INIT_DATA__` 并 parse），根组件用该数据渲染，**不发首屏接口**。
6. 首屏稳定（目标：前端约 20–40ms，后端 <60ms，总 <100ms）。

**分工**：
- **后端**：只负责「按 URL 拼数据 + 填进 HTML 模板」并返回，不渲染组件。
- **前端**：只负责「读内联数据 + 渲染」，不拼链接（链接由后端以完整 URL 下发）、不首屏再请求接口。

---

## 四、Nginx 配置要点

- **页面请求**：`/`、`/article/*`、`/list` 等「需要首屏数据」的 path → `proxy_pass http://go_backend;`，Go 返回带 `__INIT_DATA__` 的 HTML。
- **静态资源**：`/assets/`（或约定好的静态前缀）→ `alias /path/to/frontend/dist/assets;`（或 `root`），不转给 Go。

---

## 五、Go 职责（首屏）

- 按 path 映射到「页面类型」（首页 / 列表 / 文章详情 / 游戏详情等）。
- 按页查询所需模块（如首页：站点信息 + 推荐列表前 N 条；文章页：文章元数据 + 正文摘要 + 导航链接，链接为**完整 URL**）。
- 拼成一份 JSON（与前端约定结构），再注入到模板的 `<script type="application/json" id="__INIT_DATA__">` 中。
- 对需要首屏数据的 URL，只返回这一份「带内联 JSON 的 HTML」；不在此处输出静态 JS/CSS 内容，由 Nginx 单独服务。
- 首屏接口（即返回该 HTML 的请求）从收到请求到写完响应，目标 **<60ms**（不含前端），以便与前端 20–40ms 合计约 100ms 内。

---

## 六、前端首屏约定（与 demo 对齐）

1. **数据来源**  
   - 以 **内联 JSON** 为主：`<script type="application/json" id="__INIT_DATA__">`，由 Go 注入。  
   - 可选：在 head 内增加一小段脚本，在解析到该 script 后立即 `JSON.parse` 并赋给 `window.__INIT_DATA__`，首屏 JS 只读 `window.__INIT_DATA__`，减少主 bundle 内解析成本。

2. **首屏 bundle**  
   - 单入口、单 chunk（不拆首屏必要代码），只包含：读数据 + 首屏组件 + 打点。  
   - 读数据与渲染的通用逻辑可收敛到**页面通用依赖**包（如从 window 解析 `__INIT_DATA__`、按 scenecode 分发、打点），与 06 MVP 方案中的前端 Monorepo 多包结构一致。  
   - 目标：**不含图片请求时，首屏前端约 20–40ms**（与 demo 实测一致）；其余路由、统计、评论等懒加载。

3. **构建产物**  
   - 输出到 `dist/`，主入口如 `dist/assets/index.js`，CSS 可单独或合入。  
   - 部署时将该目录挂到 Nginx 的静态根路径（或 `/assets/`），并在 Go 的 HTML 模板中引用同一路径，便于配合 **modulepreload**（在 HTML head 中加 `<link rel="modulepreload" href="/assets/index.js">`，由 Go 输出或模板写死）。

4. **技术栈**  
   - 约束文档为 React + MPA；若技术设计采纳 Solid，则首屏实现与 demo 一致（读 `__INIT_DATA__` + 单 bundle 渲染），目标仍为 20–40ms。

---

## 七、与约束 / 可行性文档的对应

| 文档 / 条款 | 本方案对应 |
|------------|------------|
| 02 约束：Nginx 做反向代理 | Nginx 代理页面到 Go，静态资源 Nginx 直出。 |
| 02 约束：首屏布局+数据同时下发，Go 内 BFF 式拼装 | Go 按页拼模块数据并注入 HTML；前端不首屏再请求接口。 |
| 04 可行性：内联 JSON、不 SSR、不 Node | 本方案即「HTML + 内联 JSON」，Go 只拼数据不渲染组件。 |
| 04 / demo：首屏 100ms、前端 20–40ms | 后端 <60ms + 前端 20–40ms；Nginx 仅转发，不增加首屏逻辑。 |

---

## 八、小结

- **Nginx 照常使用**：页面请求 → Go（返回带 `__INIT_DATA__` 的 HTML），静态请求 → Nginx（或 CDN）。
- **首屏方案**：Go 按 URL 做 BFF 式拼装、注入 JSON 到 HTML；前端 Monorepo 多包（含请求 SDK、页面通用依赖），单 bundle 读内联数据一次渲染；目标前端 20–40ms、后端 <60ms、总约 100ms。
- **后续**：在具体技术设计里落实 Go 路由与模板命名、`__INIT_DATA__` 的 JSON 结构、以及 Nginx 的最终配置路径与缓存策略即可。
