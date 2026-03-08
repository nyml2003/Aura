import { render } from "solid-js/web";
import "@aura/design-system/styles.css";
import { AdminPage } from "./AdminPage";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  render(() => <AdminPage />, root);
}
