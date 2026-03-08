# @aura/design-system

自维护的**原子 CSS 样式类**与**主题变量**包，无运行时，仅 CSS。

## 使用

```ts
import '@aura/design-system/styles.css';
```

或按需引入：

```ts
import '@aura/design-system/theme.css';   // 仅变量
import '@aura/design-system/atomic.css';   // 仅原子类
```

## 结构

- **theme.css**：CSS 变量（颜色、间距、圆角、字体、阴影）。支持 `:root` 与 `[data-theme="dark"]`。
- **atomic.css**：单职责原子类，命名前缀 `aura-`，如 `aura-flex`、`aura-p-4`、`aura-text-muted`、`aura-rounded-lg`。
- **styles.css**：theme + atomic + 基础 reset（`.aura-root`）。

## Sticky 布局

- **`.aura-sticky-layout`**：外层 flex 列、`min-height: 100vh`，保证 footer 贴底。
- **`.aura-sticky-header`**：吸顶栏，半透明背景 + 毛玻璃；高度由 `--aura-sticky-header-height` 控制。
- **`.aura-sticky-header-2`**：第二层顶栏（如工具栏），叠在第一个下方，`top: var(--aura-sticky-header-height)`。
- **`.aura-sticky-section`**：主内容区，带 `padding-top` / `padding-bottom`，内容自动推出、不被顶/底栏遮挡。
- **`.aura-sticky-footer`**：吸底栏，样式与 header 对称。

主题中提供 `--aura-sticky-header-height`、`--aura-sticky-footer-height`、`--aura-sticky-z`、`--aura-sticky-bar-bg` 等，暗色下自动切换为深色条。

## 暗色模式

在根节点设置 `data-theme="dark"`（如 `<html data-theme="dark">`）即可启用暗色变量；设为 `light` 或移除则回退到 `:root`。Sticky 顶/底栏背景、阴影在暗色下由主题变量覆盖。
