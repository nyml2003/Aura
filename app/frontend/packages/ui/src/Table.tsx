import type { JSX } from "solid-js";

export interface TableProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children: JSX.Element;
}

function TableRoot(props: TableProps) {
  return (
    <div class={`aura-overflow-x-auto ${props.class ?? ""}`.trim()} classList={props.classList}>
      <table class="aura-w-full aura-text-left">{props.children}</table>
    </div>
  );
}

export interface TableHeadProps {
  children: JSX.Element;
}

export function TableHead(props: TableHeadProps) {
  return <thead>{props.children}</thead>;
}

export interface TableHeadRowProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children: JSX.Element;
}

/** 表头行：无 hover，与 Table.Row（表体行）区分 */
export function TableHeadRow(props: TableHeadRowProps) {
  return (
    <tr class={`aura-border-b aura-bg-elevated ${props.class ?? ""}`.trim()} classList={props.classList}>
      {props.children}
    </tr>
  );
}

export interface TableBodyProps {
  children: JSX.Element;
}

export function TableBody(props: TableBodyProps) {
  return <tbody>{props.children}</tbody>;
}

export interface TableRowProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children: JSX.Element;
}

export function TableRow(props: TableRowProps) {
  return (
    <tr class={`aura-border-b aura-bg-hover ${props.class ?? ""}`.trim()} classList={props.classList}>
      {props.children}
    </tr>
  );
}

export interface TableThProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children: JSX.Element;
}

export function TableTh(props: TableThProps) {
  return (
    <th class={`aura-p-3 aura-font-medium aura-text-fg ${props.class ?? ""}`.trim()} classList={props.classList}>
      {props.children}
    </th>
  );
}

export interface TableTdProps {
  class?: string;
  classList?: Record<string, boolean | undefined>;
  children: JSX.Element;
}

export function TableTd(props: TableTdProps) {
  return (
    <td class={`aura-p-3 aura-text-fg ${props.class ?? ""}`.trim()} classList={props.classList}>
      {props.children}
    </td>
  );
}

export interface TableCompound {
  (props: TableProps): JSX.Element;
  Head: typeof TableHead;
  HeadRow: typeof TableHeadRow;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Th: typeof TableTh;
  Td: typeof TableTd;
}

/** 表格组件：Table.Head + HeadRow / Body + Row / Th / Td 组合使用 */
export const Table: TableCompound = Object.assign(TableRoot, {
  Head: TableHead,
  HeadRow: TableHeadRow,
  Body: TableBody,
  Row: TableRow,
  Th: TableTh,
  Td: TableTd,
});
