/** @jsxImportSource solid-js */
import { render } from "solid-js/web";
import "@aura/design-system/styles.css";
import "./index.css";
import { ApiClientProvider } from "@aura/request-sdk";
import { AdminLayout, EditPage } from "@aura/admin-common";

declare global {
  interface Window {
    __ADMIN_EDIT_ID__?: string;
  }
}

function getEditId(): string {
  const id = window.__ADMIN_EDIT_ID__;
  if (id) return id;
  const m = window.location.pathname.match(/\/admin\/articles\/([^/]+)\/edit$/);
  return m ? m[1] : "";
}

const editId = getEditId();
const root = document.getElementById("root");
if (root) {
  render(
    () => (
      <ApiClientProvider>
        <AdminLayout page="edit" editId={editId}>
          <EditPage id={editId} />
        </AdminLayout>
      </ApiClientProvider>
    ),
    root
  );
}
