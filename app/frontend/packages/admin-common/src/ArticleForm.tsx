import type { ArticleRow } from "./types";
import { ArticleFormFields } from "./ArticleFormFields";
import { ArticleFormActions } from "./ArticleFormActions";

export interface ArticleFormValue {
  title: string;
  summary: string;
  meta: string;
  content: string;
}

export interface ArticleFormProps {
  value: ArticleFormValue;
  onChange: (v: ArticleFormValue) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
  showDelete?: boolean;
  onDelete?: () => void;
}

/** 文章表单：字段区 + 操作区（主操作突出，取消/删除为次要） */
export function ArticleForm(props: ArticleFormProps) {
  return (
    <div class="aura-bg-elevated aura-border aura-rounded-lg aura-p-6 aura-shadow-card aura-max-w-content-wide aura-mx-auto">
      {props.error && (
        <div
          class="aura-mb-4 aura-p-3 aura-rounded-md aura-border aura-border-strong"
          role="alert"
          style="background: var(--aura-color-primary-muted); color: var(--aura-color-fg);"
        >
          {props.error}
        </div>
      )}
      <ArticleFormFields value={props.value} onChange={props.onChange} />
      <ArticleFormActions
        submitLabel={props.submitLabel ?? "保存"}
        onSubmit={props.onSubmit}
        loading={props.loading}
        submitDisabled={!props.value.title.trim()}
        showDelete={props.showDelete}
        onDelete={props.onDelete}
      />
    </div>
  );
}

export function emptyFormValue(): ArticleFormValue {
  return { title: "", summary: "", meta: "", content: "" };
}

export function rowToFormValue(row: ArticleRow): ArticleFormValue {
  return {
    title: row.title,
    summary: row.summary,
    meta: row.meta,
    content: row.content,
  };
}
