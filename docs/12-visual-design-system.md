# 整体项目视觉设计文档

本文档约定 Aura 博客系统的**视觉设计体系**：设计原则、令牌（颜色/间距/字体等）、布局与组件形态。产品与前端实现应在此范围内执行，避免「写代码时再凭感觉」导致的返工。

---

## 1. 目的与范围

- **目的**：在编码前明确「长什么样、怎么留白、如何对齐」，为产品、设计与前端提供统一依据。
- **范围**：全局设计令牌、布局约定、通用组件形态；具体页面的布局与规格见各页面视觉文档（如 [13-mvp-list-page-visual-design.md](./13-mvp-list-page-visual-design.md)）。

---

## 2. 设计原则

- **可读优先**：正文与列表在桌面端控制行宽与留白，避免满屏拉满导致阅读疲劳。
- **一致性**：同一类元素（如页头、内容区、卡片）在不同页面使用同一套间距与对齐规则。
- **层次清晰**：通过背景色、阴影、圆角区分「页面背景 / 内容容器 / 卡片」层级。
- **主题友好**：亮色 / 暗色通过 CSS 变量切换，不写死色值。

---

## 3. 设计令牌（Design Tokens）

令牌由 `@aura/design-system` 的 `theme.css` 定义，供原子类与业务覆盖使用。

### 3.1 颜色

| 用途 | 变量 | 说明 |
|------|------|------|
| 主色 | `--aura-color-primary` | 品牌/强调（如青绿 #0d9488） |
| 主色悬停 | `--aura-color-primary-hover` | 交互反馈 |
| 主色弱化 | `--aura-color-primary-muted` | 背景、左边框等 |
| 点缀色 | `--aura-color-accent` | 次要强调（如橙色） |
| 前景 | `--aura-color-fg` | 正文 |
| 前景弱化 | `--aura-color-fg-muted` / `--aura-color-fg-subtle` | 副文案、元信息 |
| 边框 | `--aura-color-border` / `--aura-color-border-strong` | 分割线、描边 |
| 背景 | `--aura-color-bg` / `--aura-color-bg-elevated` / `--aura-color-bg-hover` | 页面底、卡片、悬停 |
| 页面渐变 | `--aura-color-bg-from` / `--aura-color-bg-to` | 整页渐变（可选） |

暗色主题通过 `[data-theme="dark"]` 覆盖上述变量，不在此赘列。

### 3.2 间距（4px 基准）

| 变量 | 值 | 典型用途 |
|------|-----|----------|
| `--aura-space-1` ~ `--aura-space-4` | 0.25rem ~ 1rem | 组件内边距、gap |
| `--aura-space-5` ~ `--aura-space-8` | 1.25rem ~ 2rem | 区块间距、卡片内边距 |
| `--aura-space-10` ~ `--aura-space-12` | 2.5rem ~ 3rem | 桌面端页面左右留白、大区块 |

### 3.3 圆角

- `--aura-radius-sm` ~ `--aura-radius-xl`：6px ~ 20px，用于按钮、卡片、输入框等。
- `--aura-radius-full`：全圆角（如药丸按钮）。

### 3.4 字体与行高

- **无衬线**：`--aura-font-sans`（Inter / 系统 fallback）。
- **等宽**：`--aura-font-mono`（代码等）。
- **字号**：`--aura-text-xs` ~ `--aura-text-3xl`。
- **字重**：`--aura-font-medium` / `--aura-font-semibold` / `--aura-font-bold`。
- **行高**：`--aura-leading-tight` / `--aura-leading-normal` / `--aura-leading-relaxed`。

### 3.5 阴影

- `--aura-shadow-sm` / `--aura-shadow-md` / `--aura-shadow-lg`：通用层级。
- `--aura-shadow-card` / `--aura-shadow-card-hover` / `--aura-shadow-card-lift`：卡片默认、悬停、上浮。

### 3.6 断点与内容宽度

- `--aura-breakpoint-md`：768px。
- `--aura-breakpoint-lg`：1024px。
- `--aura-max-w-content`：720px（正文阅读）。
- `--aura-max-w-content-wide`：960px（列表、多列布局）。

---

## 4. 布局约定

### 4.1 全宽 vs 限宽

- **全宽**：整页背景、通栏 Banner、Sticky 顶/底栏的**背景**可铺满视口。
- **限宽**：正文、列表、表单等**内容**应限制最大宽度（如 `max-w-content` / `max-w-content-wide`），并配合左右留白，保证可读与对齐。

### 4.2 横向留白（页面级）

- **移动端**：内容区左右留白建议 ≥ 1rem（如 `aura-px-4`），与视口边缘保持距离。
- **桌面端（≥1024px）**：内容区左右留白可加大（如 2.5rem / `aura-desktop-px-10`），避免超宽屏下内容贴边或「一条细带」感。
- **原则**：同一页面内，Header 内容、主内容区、Footer 内容的**左右对齐线**应一致（即采用同一套横向 padding/max-width），除非设计明确要求「Header 全宽背景 + 内部内容限宽」。

### 4.3 Sticky 布局

- **顶栏 / 底栏**：可吸顶、吸底，使用半透明背景 + 毛玻璃（`backdrop-filter`），高度与 z-index 由变量控制（`--aura-sticky-header-height`、`--aura-sticky-footer-height`、`--aura-sticky-z`）。
- **主内容区**：使用 StickySection 等组件，通过上下 padding 避免被 Sticky 栏遮挡；内容区可随滚动正常推出。

---

## 5. 通用组件形态

### 5.1 页头（Header）

- **形态**：可选「无边框 + 大留白」（`aura-header-soft`），仅用字重与字号区分标题与副标题。
- **标题**：可加主色渐变等强调（`aura-header-title-accent`）。
- **背景**：可与内容区同宽或全宽；若全宽，内部内容容器需与主内容区对齐。

### 5.2 页脚（Footer）

- **形态**：可选「无边框 + 留白」（`aura-footer-soft`），弱化字色与字号，信息量少。
- **位置**：Sticky 吸底或随内容流；若 Sticky，需保证主内容区有足够底部 padding。

### 5.3 卡片 / 链接块

- **默认**：白底（或 elevated 背景）、边框、圆角、轻阴影。
- **强调**：左侧主色竖条（`aura-card-accent`）。
- **悬停**：轻微上浮 + 阴影加强（`aura-card-lift`），过渡平滑。

### 5.4 列表网格

- **移动端**：单列、纵向排列、统一间距。
- **桌面端**：可双列网格（如 `aura-list-grid`），控制卡片宽度与 gap，与内容区 max-width 配合。

---

## 6. 主题与暗色

- **切换方式**：在根节点（如 `document.documentElement`）设置 `data-theme="light"` | `data-theme="dark"`。
- **令牌**：所有与颜色/阴影相关的令牌在 `[data-theme="dark"]` 下覆盖，业务尽量只引用变量、不写死色值。
- **持久化**：可由前端根据用户选择写入 localStorage，下次进入页面时应用。

---

## 7. 与实现的对应关系

- **令牌**：`app/frontend/packages/design-system/src/theme.css`。
- **原子类**：`app/frontend/packages/design-system/src/atomic.css`，单职责类（如 `aura-px-4`、`aura-card-lift`），组合使用。
- **重置**：`app/frontend/packages/design-system/src/reset.css`，在 `styles.css` 中优先引入。
- **入口**：业务只需 `import '@aura/design-system/styles.css'` 即可获得 reset + 主题 + 原子类；也可按需单独引入 `reset.css` / `theme.css` / `atomic.css`。

新页面或新组件应先对照本文档与对应页面视觉文档确定布局与令牌，再选用或扩展原子类实现，避免随意写死数值。
