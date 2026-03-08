import type { ArticleFormValue } from "./ArticleForm";

export interface ArticleFormFieldsProps {
  value: ArticleFormValue;
  onChange: (v: ArticleFormValue) => void;
}

/** 仅表单字段：标题、摘要、元信息、正文，供新建/编辑页复用 */
export function ArticleFormFields(props: ArticleFormFieldsProps) {
  return (
    <div class="aura-flex aura-flex-col aura-gap-4">
      <label class="aura-flex aura-flex-col aura-gap-1">
        <span class="aura-text-sm aura-font-medium aura-text-fg">标题</span>
        <input
          type="text"
          class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated aura-w-full"
          value={props.value.title}
          onInput={(e) => props.onChange({ ...props.value, title: e.currentTarget.value })}
          placeholder="文章标题"
        />
      </label>
      <label class="aura-flex aura-flex-col aura-gap-1">
        <span class="aura-text-sm aura-font-medium aura-text-fg">摘要</span>
        <input
          type="text"
          class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated aura-w-full"
          value={props.value.summary}
          onInput={(e) => props.onChange({ ...props.value, summary: e.currentTarget.value })}
          placeholder="简短摘要"
        />
      </label>
      <label class="aura-flex aura-flex-col aura-gap-1">
        <span class="aura-text-sm aura-font-medium aura-text-fg">元信息（如日期）</span>
        <input
          type="text"
          class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated aura-w-full"
          value={props.value.meta}
          onInput={(e) => props.onChange({ ...props.value, meta: e.currentTarget.value })}
          placeholder="2025-03-07"
        />
      </label>
      <label class="aura-flex aura-flex-col aura-gap-1">
        <span class="aura-text-sm aura-font-medium aura-text-fg">正文</span>
        <textarea
          class="aura-p-2 aura-border aura-rounded-md aura-text-fg aura-bg-elevated aura-w-full"
          style="min-height: 12rem;"
          value={props.value.content}
          onInput={(e) => props.onChange({ ...props.value, content: e.currentTarget.value })}
          placeholder="正文内容"
          rows={8}
        />
      </label>
    </div>
  );
}
