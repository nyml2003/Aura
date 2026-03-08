import { createSignal, onMount } from "solid-js";
import { StickyLayout, StickyHeader, StickySection, StickyFooter, ErrorBoundary } from "@aura/ui";
import { PageNav } from "@aura/app-common";

export interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  meta: string;
  content: string;
}

const API = "/api/articles";

function AdminPage() {
  const [articles, setArticles] = createSignal<ArticleRow[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [form, setForm] = createSignal({ title: "", summary: "", meta: "", content: "" });

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setArticles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    fetchList();
  });

  const loadEdit = (row: ArticleRow) => {
    setEditingId(row.id);
    setForm({ title: row.title, summary: row.summary, meta: row.meta, content: row.content });
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({ title: "", summary: "", meta: "", content: "" });
  };

  const save = async () => {
    const f = form();
    if (!f.title.trim()) return;
    setError(null);
    try {
      const url = editingId() ? `${API}/${editingId()}` : API;
      const method = editingId() ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg: string;
        try {
          const json = JSON.parse(text) as { error?: string; detail?: string };
          msg = [json.error, json.detail].filter(Boolean).join(": ") || res.statusText;
        } catch {
          msg = text || res.statusText;
        }
        throw new Error(msg);
      }
      clearForm();
      await fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除这篇文章？")) return;
    setError(null);
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.statusText);
      await fetchList();
      if (editingId() === id) clearForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div class="aura-root aura-min-h-screen aura-flex aura-flex-col aura-font-sans aura-text-fg aura-bg-page-gradient">
      <StickyLayout>
        <div class="aura-w-full aura-px-4 aura-desktop-px-10 aura-flex aura-flex-col aura-flex-1 aura-gap-0">
          <ErrorBoundary>
            <PageNav
              left={
                <div>
                  <h1 class="aura-m-0 aura-text-3xl aura-leading-tight aura-header-title-accent">
                    文章管理
                  </h1>
                  <p class="aura-m-0 aura-mt-2 aura-text-sm aura-text-muted aura-leading-normal">
                    增删改查（暂不鉴权）
                  </p>
                </div>
              }
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <StickySection class="aura-pt-4 aura-pb-6">
              <div class="aura-max-w-content-wide aura-mx-auto aura-flex aura-flex-col aura-gap-6">
                {error() && (
                  <div class="aura-p-3 aura-rounded-md aura-border aura-border-strong" role="alert" style="background: var(--aura-color-primary-muted); color: var(--aura-color-fg);">
                    {error()}
                  </div>
                )}

                <div class="aura-flex aura-gap-4 aura-items-center">
                  <button
                    type="button"
                    class="aura-px-4 aura-py-2 aura-rounded-md aura-font-medium aura-transition aura-border"
                    style="background: var(--aura-color-primary); color: #fff; border-color: var(--aura-color-primary);"
                    onClick={clearForm}
                  >
                    {editingId() ? "取消编辑" : "新建文章"}
                  </button>
                  {editingId() && (
                    <span class="aura-text-sm aura-text-muted">
                      正在编辑：{articles().find((a) => a.id === editingId())?.title ?? editingId()}
                    </span>
                  )}
                </div>

                <div class="aura-bg-elevated aura-border aura-rounded-lg aura-p-5 aura-shadow-card">
                  <h2 class="aura-m-0 aura-mb-4 aura-text-lg aura-font-semibold aura-text-fg">
                    {editingId() ? "编辑文章" : "新建文章"}
                  </h2>
                  <div class="aura-flex aura-flex-col aura-gap-3">
                    <label class="aura-flex aura-flex-col aura-gap-1">
                      <span class="aura-text-sm aura-font-medium aura-text-fg">标题</span>
                      <input
                        type="text"
                        class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated"
                        value={form().title}
                        onInput={(e) => setForm((f) => ({ ...f, title: e.currentTarget.value }))}
                        placeholder="标题"
                      />
                    </label>
                    <label class="aura-flex aura-flex-col aura-gap-1">
                      <span class="aura-text-sm aura-font-medium aura-text-fg">摘要</span>
                      <input
                        type="text"
                        class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated"
                        value={form().summary}
                        onInput={(e) => setForm((f) => ({ ...f, summary: e.currentTarget.value }))}
                        placeholder="摘要"
                      />
                    </label>
                    <label class="aura-flex aura-flex-col aura-gap-1">
                      <span class="aura-text-sm aura-font-medium aura-text-fg">元信息（如日期）</span>
                      <input
                        type="text"
                        class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated"
                        value={form().meta}
                        onInput={(e) => setForm((f) => ({ ...f, meta: e.currentTarget.value }))}
                        placeholder="2025-03-07"
                      />
                    </label>
                    <label class="aura-flex aura-flex-col aura-gap-1">
                      <span class="aura-text-sm aura-font-medium aura-text-fg">正文</span>
                      <textarea
                        class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated"
                        value={form().content}
                        onInput={(e) => setForm((f) => ({ ...f, content: e.currentTarget.value }))}
                        placeholder="正文内容"
                        rows={6}
                      />
                    </label>
                    <div class="aura-flex aura-gap-2">
                      <button
                        type="button"
                        class="aura-px-4 aura-py-2 aura-rounded-md aura-font-medium aura-transition aura-border"
                        style="background: var(--aura-color-primary); color: #fff; border-color: var(--aura-color-primary);"
                        onClick={save}
                        disabled={!form().title.trim()}
                      >
                        保存
                      </button>
                      {editingId() && (
                        <button
                          type="button"
                          class="aura-px-4 aura-py-2 aura-rounded-md aura-border aura-text-fg aura-font-medium aura-transition aura-bg-hover"
                          onClick={clearForm}
                        >
                          取消
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div class="aura-bg-elevated aura-border aura-rounded-lg aura-shadow-card aura-overflow-hidden">
                  <h2 class="aura-m-0 aura-p-4 aura-border-b aura-text-lg aura-font-semibold aura-text-fg">
                    文章列表
                  </h2>
                  {loading() ? (
                    <p class="aura-p-4 aura-text-muted">加载中…</p>
                  ) : (
                    <div class="aura-overflow-x-auto">
                      <table class="aura-w-full aura-text-left">
                        <thead>
                          <tr class="aura-border-b aura-bg-hover">
                            <th class="aura-p-3 aura-font-medium aura-text-fg">标题</th>
                            <th class="aura-p-3 aura-font-medium aura-text-fg">元信息</th>
                            <th class="aura-p-3 aura-font-medium aura-text-fg w-32">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {articles().map((row) => (
                            <tr class="aura-border-b aura-bg-hover">
                              <td class="aura-p-3 aura-text-fg">{row.title}</td>
                              <td class="aura-p-3 aura-text-muted">{row.meta}</td>
                              <td class="aura-p-3 aura-flex aura-gap-2">
                                <button
                                  type="button"
                                  class="aura-text-sm aura-text-primary aura-transition"
                                  onClick={() => loadEdit(row)}
                                >
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  class="aura-text-sm aura-transition aura-text-muted"
                                  style="color: #b91c1c;"
                                  onClick={() => remove(row.id)}
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!loading() && articles().length === 0 && (
                    <p class="aura-p-4 aura-text-muted">暂无文章，点击「新建文章」添加。</p>
                  )}
                </div>
              </div>
            </StickySection>
          </ErrorBoundary>
          <StickyFooter class="aura-footer-soft aura-flex aura-items-center">
            <a href="/list" class="aura-text-sm aura-text-muted aura-no-underline aura-transition">
              返回列表页
            </a>
          </StickyFooter>
        </div>
      </StickyLayout>
    </div>
  );
}

export { AdminPage };
