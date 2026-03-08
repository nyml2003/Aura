import { render, hydrate } from 'solid-js/web';
import { getInitData, isListInitData, isArticleInitData } from '@aura/page-common';
import { startObserveDOM, logReportAfterStable } from '@aura/performance-sdk';
import App from './App';
import ArticlePage from './ArticlePage';
import './index.css';

const scriptStart = performance.now();
const root = document.getElementById('root')!;
const initData = getInitData();

if (!root) {
  // no-op
} else if (!initData) {
  if (!root.hasChildNodes()) {
    root.innerHTML = '<p>暂无数据</p>';
  }
} else if (isListInitData(initData)) {
  startObserveDOM(root);
  if (root.hasChildNodes()) {
    hydrate(() => <App initData={initData} />, root);
  } else {
    render(() => <App initData={initData} />, root);
  }
  logReportAfterStable(500, scriptStart);
} else if (isArticleInitData(initData)) {
  if (root.hasChildNodes()) {
    hydrate(() => <ArticlePage initData={initData} />, root);
  } else {
    render(() => <ArticlePage initData={initData} />, root);
  }
} else {
  if (!root.hasChildNodes()) {
    root.innerHTML = '<p>未知场景</p>';
  }
}
