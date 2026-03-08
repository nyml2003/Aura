import { createSignal, onMount } from "solid-js";
import { ArticleForm, rowToFormValue } from "./ArticleForm";
import type { ArticleRow } from "./types";
import type { ArticleFormValue } from "./ArticleForm";
import { Message } from "@aura/ui";
import { ADMIN_PATH_LIST } from "./paths";
import { openUrl } from "./openUrl";
import { getArticle, updateArticle, deleteArticle } from "@aura/request-sdk";

declare global {
  interface Window {
    __ADMIN_EDIT_DATA__?: ArticleRow;
  }
}

export interface EditPageProps {
  id: string;
}

/** 优先使用服务端注入的 __ADMIN_EDIT_DATA__，无则请求接口 */
function getInitialForm(id: string): ArticleFormValue | null {
  const data = typeof window !== "undefined" ? window.__ADMIN_EDIT_DATA__ : undefined;
  if (data && data.id === id) return rowToFormValue(data);
  return null;
}

export function EditPage(props: EditPageProps) {
  const [form, setForm] = createSignal<ArticleFormValue | null>(getInitialForm(props.id));
  const [loading, setLoading] = createSignal(false);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [submitError, setSubmitError] = createSignal<string | null>(null);

  onMount(async () => {
    if (form() != null) return;
    const result = await getArticle(props.id);
    if (result.ok) {
      setForm(rowToFormValue(result.value));
    } else {
      setLoadError(result.error.message);
    }
  });

  const save = async () => {
    const v = form();
    if (!v || !v.title.trim()) return;
    setSubmitError(null);
    setLoading(true);
    const result = await updateArticle(props.id, v);
    if (result.ok) {
      openUrl(result.value.redirect);
    } else {
      setSubmitError(result.error.message);
    }
    setLoading(false);
  };

  const remove = async () => {
    if (!confirm("确定删除这篇文章？")) return;
    setSubmitError(null);
    setLoading(true);
    const result = await deleteArticle(props.id);
    if (result.ok) {
      openUrl(result.value.redirect);
    } else {
      setSubmitError(result.error.message);
    }
    setLoading(false);
  };

  const f = form();
  if (loadError()) {
    return (
      <div class="aura-max-w-content-wide aura-mx-auto aura-p-6 aura-bg-elevated aura-border aura-rounded-lg aura-shadow-card">
        <Message message={loadError()!} class="aura-mb-4" />
        <a href={ADMIN_PATH_LIST} class="aura-mt-3 aura-inline-block aura-text-primary aura-no-underline">
          返回列表
        </a>
      </div>
    );
  }
  if (!f) {
    return (
      <div class="aura-max-w-content-wide aura-mx-auto aura-p-6 aura-text-muted">
        加载中…
      </div>
    );
  }

  return (
    <>
      <Message message={submitError()} class="aura-mb-4 aura-max-w-content-wide aura-mx-auto" />
      <ArticleForm
        value={f}
        onChange={setForm}
        onSubmit={save}
        submitLabel="保存"
        loading={loading()}
        showDelete
        onDelete={remove}
      />
    </>
  );
}
