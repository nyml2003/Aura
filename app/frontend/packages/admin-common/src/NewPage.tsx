import { createSignal } from "solid-js";
import { ArticleForm, emptyFormValue } from "./ArticleForm";
import type { ArticleFormValue } from "./ArticleForm";
import { Message } from "@aura/ui";
import { createArticle } from "@aura/request-sdk";

export function NewPage() {
  const [form, setForm] = createSignal<ArticleFormValue>(emptyFormValue());
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [successMessage, setSuccessMessage] = createSignal<string | null>(null);

  const save = async () => {
    const v = form();
    if (!v.title.trim()) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    const result = await createArticle(v);
    if (result.ok) {
      setSuccessMessage("创建成功");
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Message message={error()} class="aura-mb-4 aura-max-w-content-wide aura-mx-auto" />
      <Message
        message={successMessage()}
        type="success"
        class="aura-mb-4 aura-max-w-content-wide aura-mx-auto"
      />
      <ArticleForm
        value={form()}
        onChange={setForm}
        onSubmit={save}
        submitLabel="创建"
        loading={loading()}
      />
    </>
  );
}
