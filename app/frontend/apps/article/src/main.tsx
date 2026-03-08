import type { ArticleInitData } from "@aura/request-sdk";
import { bootstrap } from "@aura/page-common";
import "@aura/design-system/styles.css";
import { ArticlePage } from "./ArticlePage";
import "./index.css";

bootstrap({
  rootId: "root",
  pages: {
    article: (props) => <ArticlePage initData={props.initData as ArticleInitData} />,
  },
  onNoData: () => {
    const root = document.getElementById("root");
    if (root && !root.hasChildNodes()) root.innerHTML = "<p>暂无数据</p>";
  },
});
