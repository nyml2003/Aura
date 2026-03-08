import type { ListInitData, ListItem } from "@aura/request-sdk";
import {
  StickyLayout,
  StickySection,
  StickyFooter,
  ErrorBoundary,
  createBusinessComponent,
} from "@aura/ui";
import { PageNav } from "@aura/app-common";

/** 前端兜底数据：无 BFF 或 list 为空时使用 */
const FALLBACK_LIST: ListItem[] = [
  { id: "article-1", type: "article", title: "第一篇示例文章", summary: "这是摘要内容，MVP 仅列表页。", href: "#", meta: "2025-03-07" },
  { id: "article-2", type: "article", title: "第二篇示例文章", summary: "摘要二。", href: "#", meta: "2025-03-06" },
  { id: "article-3", type: "article", title: "第三篇示例文章", summary: "摘要三。", href: "#", meta: "2025-03-05" },
  { id: "article-4", type: "article", title: "第四篇示例文章", summary: "摘要四。", href: "#", meta: "2025-03-04" },
  { id: "article-5", type: "article", title: "第五篇示例文章", summary: "摘要五。", href: "#", meta: "2025-03-03" },
  { id: "article-6", type: "article", title: "关于原子 CSS 与设计系统", summary: "自维护的原子类与主题变量如何支撑多端一致体验。", href: "#", meta: "2025-03-02" },
  { id: "article-7", type: "article", title: "PC 端列表页布局实践", summary: "宽内容区、双列网格与无边框页头页脚的设计取舍。", href: "#", meta: "2025-03-01" },
  { id: "article-8", type: "article", title: "Solid.js 与 SSR 水合", summary: "服务端渲染出 HTML 后，客户端如何挂载事件与响应式。", href: "#", meta: "2025-02-28" },
  { id: "article-9", type: "article", title: "Deno 作为 BFF 运行时", summary: "TypeScript 直跑、标准库与 Hono 轻量路由的搭配。", href: "#", meta: "2025-02-27" },
  { id: "article-10", type: "article", title: "首屏性能与稳定打点", summary: "从进入页面到连续无 layout shift 的耗时统计思路。", href: "#", meta: "2025-02-26" },
  { id: "article-11", type: "article", title: "契约与前后端类型共享", summary: "scenecode、InitData 与 Monorepo 下的类型对齐。", href: "#", meta: "2025-02-25" },
  { id: "article-12", type: "article", title: "从零搭建博客 MVP", summary: "目标、约束、技术选型与迭代顺序的简要记录。", href: "#", meta: "2025-02-24" },
  { id: "article-13", type: "article", title: "Vite 与前端构建流水线", summary: "ESM、HMR 与多应用 Monorepo 的配置要点。", href: "#", meta: "2025-02-23" },
  { id: "article-14", type: "article", title: "Nginx 反向代理与静态资源", summary: "页面请求转发与 /assets 缓存的常见写法。", href: "#", meta: "2025-02-22" },
  { id: "article-15", type: "article", title: "Docker Compose 本地联调", summary: "前后端与网关在同一 compose 下的启动顺序与网络。", href: "#", meta: "2025-02-21" },
  { id: "article-16", type: "article", title: "语义化 URL 与 SEO", summary: "列表、详情与标签页的 path 设计对收录的影响。", href: "#", meta: "2025-02-20" },
  { id: "article-17", type: "article", title: "首屏数据内联与 hydrate", summary: "__INIT_DATA__ 的注入时机与客户端复用方式。", href: "#", meta: "2025-02-19" },
  { id: "article-18", type: "article", title: "小服务器下的资源取舍", summary: "2 核 2G 场景里 Node、Deno、Go 的占用与选型。", href: "#", meta: "2025-02-18" },
  { id: "article-19", type: "article", title: "暗色主题与 CSS 变量", summary: "data-theme 切换与设计系统变量的覆盖策略。", href: "#", meta: "2025-02-17" },
  { id: "article-20", type: "article", title: "后续扩展：详情页与分页", summary: "文章正文渲染与列表分页的接口与前端约定。", href: "#", meta: "2025-02-16" },
];

function ListPageInner(props: { initData?: ListInitData | null }) {
  const list = (): ListItem[] => props.initData?.list ?? FALLBACK_LIST;

  return (
    <div class="aura-root aura-min-h-screen aura-flex aura-flex-col aura-font-sans aura-text-fg aura-bg-page-gradient">
      <StickyLayout>
        <div class="aura-w-full aura-px-4 aura-desktop-px-10 aura-flex aura-flex-col aura-flex-1 aura-gap-0">
          <ErrorBoundary>
            <PageNav
              left={
                <div>
                  <h1 class="aura-m-0 aura-text-3xl aura-leading-tight aura-header-title-accent">
                    文章列表
                  </h1>
                  <p class="aura-m-0 aura-mt-2 aura-text-sm aura-text-muted aura-leading-normal">
                    原子 CSS · 主题
                  </p>
                </div>
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StickySection class="aura-pt-2 aura-pb-4">
              <ul class="aura-m-0 aura-p-0 aura-list-none aura-list-grid">
                {list().map((item) => (
                  <li class="aura-m-0 aura-p-0">
                    <a
                      class="aura-link-card aura-block aura-bg-elevated aura-border aura-rounded-lg aura-p-5 aura-shadow-card aura-card-accent aura-card-lift aura-transition-all"
                      href={item.href}
                      rel="noopener"
                    >
                      <h2 class="aura-m-0 aura-mb-2 aura-text-lg aura-font-semibold aura-leading-tight aura-text-fg">
                        {item.title}
                      </h2>
                      <p class="aura-m-0 aura-mb-3 aura-text-sm aura-text-muted aura-leading-relaxed">
                        {item.summary}
                      </p>
                      <span class="aura-text-xs aura-text-subtle">{item.meta}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </StickySection>
          </ErrorBoundary>
          <StickyFooter class="aura-footer-soft aura-flex aura-items-center">
            <span>MVP · 列表页</span>
          </StickyFooter>
        </div>
      </StickyLayout>
    </div>
  );
}

export const ListPage = createBusinessComponent(ListPageInner, { name: "ListPage" });
