import { render } from "solid-js/web";
import "@aura/design-system/styles.css";
import "./index.css";
import { ApiClientProvider } from "@aura/request-sdk";
import { AdminLayout, ListPage } from "@aura/admin-common";

const root = document.getElementById("root");
if (root) {
  render(
    () => (
      <ApiClientProvider>
        <AdminLayout page="list">
          <ListPage />
        </AdminLayout>
      </ApiClientProvider>
    ),
    root
  );
}
