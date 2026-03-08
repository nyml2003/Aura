import { Button } from "@aura/ui";
import { ADMIN_PATH_LIST } from "./paths";

export interface ArticleFormActionsProps {
  /** 主按钮文案，如「保存」「创建」 */
  submitLabel: string;
  onSubmit: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
  /** 是否显示删除，编辑页为 true */
  showDelete?: boolean;
  onDelete?: () => void;
}

/**
 * 表单底部操作区：主操作突出，取消/删除为次要样式
 */
export function ArticleFormActions(props: ArticleFormActionsProps) {
  return (
    <div class="aura-flex aura-items-center aura-gap-4 aura-flex-wrap aura-pt-4 aura-mt-4 aura-border-t">
      <Button
        variant="contained"
        color="primary"
        onClick={props.onSubmit}
        disabled={props.submitDisabled}
        loading={props.loading}
      >
        {props.submitLabel}
      </Button>
      <Button variant="text" color="primary" href={ADMIN_PATH_LIST}>
        取消
      </Button>
      {props.showDelete && props.onDelete && (
        <div style="margin-left: auto;">
          <Button variant="text" color="error" onClick={props.onDelete} disabled={props.loading}>
            删除
          </Button>
        </div>
      )}
    </div>
  );
}
