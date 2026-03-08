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

## Button

Material UI 风格：**variant** 控制形态，**color** 控制语义色。

- **variant**：`contained`（实心）、`outlined`（描边）、`text`（纯文字，无边框）。
- **color**：`primary`（主色）、`secondary`（次要灰）、`error`（错误/危险）、`inherit`（继承）。
- **href**：有值时渲染为 `<a>`，用于「取消」「编辑」等跳转。
- **loading** / **disabled**：加载态与禁用。

```tsx
<Button variant="contained" color="primary" onClick={save}>保存</Button>
<Button variant="text" color="primary" href="/admin">取消</Button>
<Button variant="text" color="error" onClick={onDelete}>删除</Button>
<Button variant="outlined" color="primary">次要操作</Button>
```

## Table

表格容器 + 表头/表体/行/单元格，统一边框、内边距与行 hover。

- **Table**：外层 `div` 横向滚动 + `<table>`。
- **Table.Head**：`<thead>`。
- **Table.HeadRow**：表头行（无 hover，与 Body 行区分）。
- **Table.Body**：`<tbody>`。
- **Table.Row**：表体行（带 hover）。
- **Table.Th / Table.Td**：表头单元 / 表体单元，支持 `class` 扩展列宽等。

```tsx
<Table>
  <Table.Head>
    <Table.HeadRow>
      <Table.Th>标题</Table.Th>
      <Table.Th class="aura-w-32">操作</Table.Th>
    </Table.HeadRow>
  </Table.Head>
  <Table.Body>
    {rows.map((row) => (
      <Table.Row>
        <Table.Td>{row.title}</Table.Td>
        <Table.Td>...</Table.Td>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```
