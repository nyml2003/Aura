import type { ArticleDetail, ArticleInitData } from "@aura/request-sdk";
import {
  StickyLayout,
  StickySection,
  StickyFooter,
  ErrorBoundary,
  createBusinessComponent,
} from "@aura/ui";
import { PageNav } from "@aura/app-common";

/** 无 BFF 数据时的兜底文章 */
const FALLBACK_ARTICLE: ArticleDetail = {
  id: "article-1",
  type: "article",
  title: "示例文章",
  summary: "摘要占位",
  href: "#",
  meta: "2025-03-07",
  content: "这里是正文占位。MVP 阶段无 BFF 或接口失败时展示。",
};

function ArticlePageInner(props: { initData: ArticleInitData }) {
  const article = (): ArticleDetail => props.initData?.article ?? FALLBACK_ARTICLE;
  const listHref = (): string => props.initData?.listHref ?? "/list";

  return (
    <div class="aura-root aura-min-h-screen aura-flex aura-flex-col aura-font-sans aura-text-fg aura-bg-page-gradient">
      <StickyLayout>
        <div class="aura-w-full aura-px-4 aura-desktop-px-10 aura-flex aura-flex-col aura-flex-1 aura-gap-0">
          <ErrorBoundary>
            <PageNav
              left={
                <div class="aura-flex aura-items-center aura-gap-4">
                  <a
                    href={listHref()}
                    class="aura-text-sm aura-text-muted aura-no-underline aura-transition aura-rounded-md aura-p-2 aura-bg-elevated aura-border aura-bg-hover"
                  >
                    ← 列表
                  </a>
                  <h1 class="aura-m-0 aura-text-xl aura-font-semibold aura-leading-tight aura-text-fg">
                    {article().title}
                  </h1>
                </div>
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StickySection as="main" class="aura-pt-4 aura-pb-6">
              <article class="aura-max-w-prose aura-mx-auto">
                <p class="aura-m-0 aura-mb-4 aura-text-sm aura-text-muted aura-leading-normal">
                  {article().meta}
                </p>
                <div
                  class="aura-article-body aura-text-base aura-leading-relaxed aura-text-fg"
                  style="white-space: pre-wrap;"
                >
                  {article().content}
                </div>
              </article>
            </StickySection>
          </ErrorBoundary>
          <StickyFooter class="aura-footer-soft aura-flex aura-items-center">
            <a href={listHref()} class="aura-text-sm aura-text-muted aura-no-underline aura-transition">
              返回列表
            </a>
          </StickyFooter>
        </div>
      </StickyLayout>
    </div>
  );
}

export const ArticlePage = createBusinessComponent(ArticlePageInner, { name: "ArticlePage" });
