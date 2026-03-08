import { render, hydrate } from 'solid-js/web';
import { getInitData, isListInitData } from '@aura/page-common';
import App from './App';
import './index.css';

const root = document.getElementById('root')!;
const initData = getInitData();

if (!root) {
  // no-op
} else if (!initData || !isListInitData(initData)) {
  if (!root.hasChildNodes()) {
    root.innerHTML = '<p>暂无数据或非列表页</p>';
  }
} else {
  // 有首屏数据时：若 root 已有内容（SSR），则 hydrate；否则客户端渲染
  if (root.hasChildNodes()) {
    hydrate(() => <App initData={initData} />, root);
  } else {
    render(() => <App initData={initData} />, root);
  }
}
