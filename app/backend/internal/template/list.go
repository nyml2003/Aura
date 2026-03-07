package template

const listHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>文章列表</title>
  <script type="application/json" id="__INIT_DATA__">{{.InitDataJSON}}</script>
  <script>
    (function(){
      var el = document.getElementById('__INIT_DATA__');
      if (el && el.textContent) {
        try { window.__INIT_DATA__ = JSON.parse(el.textContent); } catch(e) {}
      }
    })();
  </script>
  <link rel="modulepreload" href="/assets/index.js" />
  <link rel="stylesheet" href="/assets/index.css" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>
`
