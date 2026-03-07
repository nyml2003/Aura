import type { ListInitData } from '@aura/request-sdk';

export default function App(props: { initData: ListInitData }) {
  const list = () => props.initData.list;
  return (
    <div class="layout">
      <header class="header">
        <h1 class="site-title">文章列表</h1>
      </header>
      <main class="main">
        <ul class="card-list">
          {list().map((item) => (
            <li class="card" key={item.id}>
              <a class="card-link" href={item.href} rel="noopener">
                <h2 class="card-title">{item.title}</h2>
                <p class="card-summary">{item.summary}</p>
                <span class="card-meta">{item.meta}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <footer class="footer">
        <span>MVP · 列表页</span>
      </footer>
    </div>
  );
}
