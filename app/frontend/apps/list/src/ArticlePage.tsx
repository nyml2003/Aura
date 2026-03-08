import type { ArticleInitData } from '@aura/request-sdk';

export default function ArticlePage(props: { initData: ArticleInitData }) {
  const article = () => props.initData.article;
  const listHref = () => props.initData.listHref;
  return (
    <div class="layout">
      <header class="header">
        <h1 class="site-title">
          <a class="back-link" href={listHref()}>← 列表</a>
        </h1>
      </header>
      <main class="main">
        <article class="article">
          <h2 class="article-title">{article().title}</h2>
          <p class="article-meta">{article().meta}</p>
          <div class="article-body">{article().content}</div>
        </article>
      </main>
      <footer class="footer">
        <a href={listHref()}>返回列表</a>
      </footer>
    </div>
  );
}
