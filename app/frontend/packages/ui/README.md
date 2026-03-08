# @aura/ui

内建组件库，基于 `@aura/design-system` 的原子类封装为 Solid.js 组件。使用前请在应用入口引入设计系统样式：

```ts
import '@aura/design-system/styles.css';
```

## Sticky 布局

### 可叠加栈（任意数量）

- **StickyStack**：包住 N 个子元素，每个子元素会吸顶并随滚动**逐个堆叠**（第 1 个 top: 0，第 2 个 top: 高度1，第 3 个 top: 高度1+高度2…）。用 ResizeObserver 测高，动态算 `top`；往上滚时吸顶会依次取消。适合「一开始 1 个，滚到后面慢慢变成 10 个，再滚回去又逐个消失」的场景。
- **StickyStackItem**：可选语义包装，作为 StickyStack 的一个子项；也可直接往 StickyStack 里塞任意节点。

```tsx
<StickyStack>
  {sections.map((s) => (
    <StickyStackItem class="aura-sticky-header aura-header-soft">
      <h2>{s.title}</h2>
    </StickyStackItem>
  ))}
</StickyStack>
```

### 单条固定栏

- **StickyLayout**：外层容器，flex 列、min-height: 100vh，保证底栏贴底。
- **StickyHeader**：单条吸顶栏（`<header>`），适合固定页头。
- **StickySection**：主内容区（默认 `<main>`），自动推出 padding；`as="div"` 可改为 div。
- **StickyFooter**：吸底栏（`<footer>`）。

所有组件支持 `class`、`classList`、`children`。
