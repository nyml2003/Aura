# MVP 列表页视觉设计文档

本文档描述 **文章列表页**（MVP）的视觉与布局规格，是 [12-visual-design-system.md](./12-visual-design-system.md) 在该页面的具体落地。实现时以本文档为准，保证 Header、内容区、Footer、卡片等与设计一致。

---

## 1. 页面目标与受众

- **目标**：展示文章列表，支持快速扫读标题、摘要与元信息，点击进入详情。
- **受众**：普通读者，桌面端与移动端均需可用；首屏性能与可读性优先。

---

## 2. 整体布局结构

页面采用 **单列纵向布局**，自上而下为：

1. **根容器**：全屏最小高度、flex 列、页面级背景（渐变或纯色）。
2. **内容带（Content Band）**：宽度 100%，横向留白由内边距控制，与 Header/Footer 内容**左右对齐**。
3. **Sticky 顶栏（Header）**：位于内容带内，吸顶显示标题与主题切换。
4. **主内容区（Section）**：文章列表网格，可滚动。
5. **Sticky 底栏（Footer）**：位于内容带内，吸底显示简短信息。

结构关系（示意）：

```
根 (aura-root, min-h-screen, flex-col, 背景)
└── StickyLayout (flex-col, min-h-100vh)
    └── 内容带 (w-full, px-4 + desktop-px-10, flex-1)
        ├── StickyHeader   ← 吸顶
        ├── StickySection  ← 列表
        └── StickyFooter   ← 吸底
```

---

## 3. 各区域规格

### 3.1 内容带（横向留白与对齐）

- **作用**：整页唯一「横向留白」控制层，保证 Header、Section、Footer 的**左右对齐线一致**。
- **移动端**：左右 padding = 1rem（`aura-px-4`）。
- **桌面端（≥1024px）**：左右 padding = 2.5rem（`aura-desktop-px-10`）。
- **设计理由**：
  - 控制阅读宽度，避免超宽屏下单行过长。
  - 与视口边缘保持呼吸感，不贴边。
  - Header 与主内容共用同一套留白，视觉上是一条竖线对齐，规整统一。

### 3.2 Sticky 顶栏（Header）

- **布局**：flex、水平方向、主次两端对齐（标题组左，主题切换按钮右）。
- **样式**：无边框、大留白（`aura-header-soft`），背景为 Sticky 半透明 + 毛玻璃。
- **标题**：主标题使用 `aura-header-title-accent`（主色渐变等强调），副标题小号、弱化色（`aura-text-muted`）。
- **主题切换**：小按钮，圆角、边框、悬停反馈（`aura-bg-hover`），图标或文案区分亮/暗。
- **横向**：Header 与 Section、Footer 同处「内容带」内，因此**不额外加横向 padding**，由内容带统一提供；Header 仅负责上下 padding 与内部 flex 布局。

### 3.3 主内容区（Section）

- **上下**：顶部与 StickySection 默认 padding 一致（避免被吸顶栏遮挡），底部留白保证最后一条卡片下方与 Footer 上方舒适。
- **列表**：`ul` 使用 `aura-list-grid`。
  - **移动端**：单列、纵向、统一间距（如 gap 1.25rem）。
  - **桌面端（≥960px）**：双列网格，gap 略大（如 1.5rem），卡片等分宽度。

### 3.4 卡片（列表项）

- **容器**：`a.aura-link-card`，块级、白底（elevated）、边框、圆角、基础阴影。
- **强调**：左侧主色竖条（`aura-card-accent`），宽度约 4px。
- **悬停**：上浮 3px + 阴影加强（`aura-card-lift`），过渡约 0.2s。
- **内容**：
  - 标题：字大、字重 semibold、主色前景。
  - 摘要：小号、弱化色、多行。
  - 元信息（如日期）：更小、更弱色（`aura-text-subtle`）。

### 3.5 Sticky 底栏（Footer）

- **布局**：单行、水平居中或左对齐，小号字、弱化色（`aura-footer-soft`）。
- **内容**：如「MVP · 列表页」等简短说明。
- **背景**：与 Header 同，半透明 + 毛玻璃，吸底。

---

## 4. 响应式要点

| 断点 | 内容带横向留白 | 列表布局 |
|------|----------------|----------|
| < 1024px | 1rem | 单列 |
| ≥ 1024px | 2.5rem | 双列（≥960px 即双列） |

列表网格断点（960px）与内容带留白断点（1024px）可略有差异，以当前 atomic 与实现为准；若需统一，可在设计系统中调整为同一断点。

---

## 5. 主题（亮 / 暗）

- 列表页支持亮色与暗色主题，通过根节点 `data-theme` 切换。
- 卡片、Header、Footer、背景、文字色均使用设计系统变量，无需在页面内写死色值。
- 主题切换按钮位于 Header 右侧，点击后切换并持久化到 localStorage。

---

## 6. 设计决策记录

| 决策 | 说明 |
|------|------|
| Header/Footer 与内容区同处一个「内容带」 | 保证三条区域左右对齐一致，避免 Header 全宽而内容缩进带来的错位感；若未来需要「Header 背景全宽、内容限宽」，可改为内容带仅包 Section，Header/Footer 单独全宽并内层再限宽。 |
| 桌面端加大横向留白 | 超宽屏下避免内容贴边、单行过长，并保持与移动端一致的留白逻辑（按视口比例放大）。 |
| 列表桌面端双列 | 利用宽屏空间，提高信息密度，同时用 max-width 控制单卡不会过宽。 |
| 卡片左侧主色条 + 悬停上浮 | 强化可点击性，与纯文字列表区分层级，同时不破坏简洁风格。 |

---

## 7. 与实现的对应关系

- **页面组件**：`app/frontend/apps/list/src/App.tsx`。
- **布局组件**：`@aura/ui` 的 `StickyLayout`、`StickyHeader`、`StickySection`、`StickyFooter`。
- **样式**：原子类来自 `@aura/design-system`（如 `aura-header-soft`、`aura-list-grid`、`aura-card-accent`、`aura-card-lift`）。
- **主题**：页面内 `useDarkMode` 控制 `data-theme` 与 localStorage。

后续若增加筛选、分页、空状态等，应在本文档中补充对应区域的视觉规格，再改代码。
