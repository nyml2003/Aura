import type { JSX } from "solid-js";
import { StickyLayout, StickySection, StickyFooter, ErrorBoundary } from "@aura/ui";
import { PageNav } from "@aura/app-common";
import { ADMIN_PATH_LIST } from "./paths";

export type AdminPageKind = "list" | "new" | "edit";

export interface AdminLayoutProps {
  page: AdminPageKind;
  editId?: string;
  editTitle?: string;
  children: JSX.Element;
}

function Breadcrumb(props: { page: AdminPageKind; editId?: string; editTitle?: string }) {
  return (
    <nav class="aura-flex aura-items-center aura-gap-2 aura-text-sm aura-text-muted" aria-label="面包屑">
      <a href={ADMIN_PATH_LIST} class="aura-text-muted aura-no-underline aura-transition aura-text-primary-hover">
        文章列表
      </a>
      {props.page === "new" && <span class="aura-text-muted">/</span>}
      {props.page === "new" && <span class="aura-text-fg">新建文章</span>}
      {props.page === "edit" && <span class="aura-text-muted">/</span>}
      {props.page === "edit" && <span class="aura-text-fg">编辑：{props.editTitle ?? props.editId ?? ""}</span>}
    </nav>
  );
}

export function AdminLayout(props: AdminLayoutProps) {
  return (
    <div class="aura-root aura-min-h-screen aura-flex aura-flex-col aura-font-sans aura-text-fg aura-bg-page-gradient">
      <StickyLayout>
        <div class="aura-w-full aura-px-4 aura-desktop-px-10 aura-flex aura-flex-col aura-flex-1 aura-gap-0">
          <ErrorBoundary>
            <PageNav
              left={
                <div class="aura-flex aura-flex-col aura-gap-1">
                  <h1 class="aura-m-0 aura-text-2xl aura-leading-tight aura-font-semibold aura-text-fg">
                    文章管理
                  </h1>
                  <Breadcrumb
                    page={props.page}
                    editId={props.editId}
                    editTitle={props.editTitle}
                  />
                </div>
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StickySection class="aura-pt-6 aura-pb-6">
              {props.children}
            </StickySection>
          </ErrorBoundary>
          <StickyFooter class="aura-footer-soft aura-flex aura-items-center aura-justify-between">
            <a href={ADMIN_PATH_LIST} class="aura-text-sm aura-text-muted aura-no-underline aura-transition aura-text-primary-hover">
              文章列表
            </a>
            <a href="/list" class="aura-text-sm aura-text-muted aura-no-underline aura-transition aura-text-primary-hover">
              返回站点
            </a>
          </StickyFooter>
        </div>
      </StickyLayout>
    </div>
  );
}
