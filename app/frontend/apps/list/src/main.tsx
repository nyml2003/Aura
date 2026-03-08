import type { ListInitData } from "@aura/request-sdk";
import { bootstrap } from "@aura/page-common";
import { startObserveDOM, logReportAfterStable } from "@aura/performance-sdk";
import "@aura/design-system/styles.css";
import { App } from "./App";
import "./index.css";

bootstrap({
  rootId: "root",
  pages: {
    list: (props) => <App initData={props.initData as ListInitData} />,
  },
  onNoData: () => {
    const root = document.getElementById("root");
    if (root && !root.hasChildNodes()) root.innerHTML = "<p>暂无数据</p>";
  },
  onSceneMounted: (scene, root, start) => {
    if (scene !== "list") return;
    startObserveDOM(root);
    logReportAfterStable(32, start);
  },
});
