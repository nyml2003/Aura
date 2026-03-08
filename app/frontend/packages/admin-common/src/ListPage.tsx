import { createSignal, onMount } from "solid-js";
import { Button, Table } from "@aura/ui";
import type { ArticleRow } from "./types";
import { ADMIN_PATH_NEW, getEditPath } from "./paths";
import { listArticles, deleteArticle } from "@aura/request-sdk";

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

export function ListPage() {
  const [articles, setArticles] = createSignal<ArticleRow[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    const result = await listArticles();
    if (result.ok) {
      setArticles(result.value);
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  };

  onMount(() => fetchList());

  const remove = async (id: string) => {
    if (!confirm("确定删除这篇文章？")) return;
    setError(null);
    const result = await deleteArticle(id);
    if (result.ok) {
      await fetchList();
    } else {
      setError(result.error.message);
    }
  };

  return (
    <div class="aura-max-w-content-wide aura-mx-auto aura-flex aura-flex-col aura-gap-6">
      <div class="aura-flex aura-items-center aura-justify-between">
        <h2 class="aura-m-0 aura-text-lg aura-font-semibold aura-text-fg">文章列表</h2>
        <Button variant="contained" color="primary" href={ADMIN_PATH_NEW}>
          新建文章
        </Button>
      </div>

      {error() && (
        <div
          class="aura-p-3 aura-rounded-md aura-border aura-border-strong"
          role="alert"
          style="background: var(--aura-color-primary-muted); color: var(--aura-color-fg);"
        >
          {error()}
        </div>
      )}

      <div class="aura-bg-elevated aura-border aura-rounded-lg aura-shadow-card aura-overflow-hidden">
        {loading() ? (
          <p class="aura-p-6 aura-text-muted">加载中…</p>
        ) : articles().length === 0 ? (
          <div class="aura-p-6 aura-text-center aura-text-muted">
            <p class="aura-m-0 aura-mb-3">暂无文章</p>
            <Button variant="contained" color="primary" href={ADMIN_PATH_NEW}>
              新建文章
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.HeadRow>
                <Table.Th>标题</Table.Th>
                <Table.Th class="aura-max-w-[200px]">摘要</Table.Th>
                <Table.Th class="aura-w-28">元信息</Table.Th>
                <Table.Th class="aura-w-32">操作</Table.Th>
              </Table.HeadRow>
            </Table.Head>
            <Table.Body>
              {articles().map((row) => (
                <Table.Row>
                  <Table.Td class="aura-font-medium">{row.title}</Table.Td>
                  <Table.Td class="aura-text-muted aura-text-sm">{truncate(row.summary, 40)}</Table.Td>
                  <Table.Td class="aura-text-muted aura-text-sm">{row.meta}</Table.Td>
                  <Table.Td>
                    <div class="aura-flex aura-gap-2">
                      <Button variant="text" color="primary" href={getEditPath(row.id)}>
                        编辑
                      </Button>
                      <Button variant="text" color="error" onClick={() => remove(row.id)}>
                        删除
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
}
