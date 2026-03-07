import { render } from 'solid-js/web';
import { getInitData, isListInitData } from '@aura/page-common';
import App from './App';
import './index.css';

const initData = getInitData();
if (!initData || !isListInitData(initData)) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '<p>暂无数据或非列表页</p>';
  }
} else {
  render(() => <App initData={initData} />, document.getElementById('root')!);
}
