import { render } from "solid-js/web";
import "@aura/design-system/styles.css";
import "./index.css";
import { ApiClientProvider } from "@aura/request-sdk";
import { AdminLayout, NewPage } from "@aura/admin-common";

const root = document.getElementById("root");
if (root) {
  render(
    () => (
      <ApiClientProvider>
        <AdminLayout page="new">
          <NewPage />
        </AdminLayout>
      </ApiClientProvider>
    ),
    root
  );
}
