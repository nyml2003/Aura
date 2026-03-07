package data

// Article 列表项，与契约 ListItem 一致
type Article struct {
	ID     string `json:"id"`
	Type   string `json:"type"` // "article"
	Title  string `json:"title"`
	Summary string `json:"summary"`
	Href   string `json:"href"` // 完整 URL
	Meta   string `json:"meta"`
}

// List 返回内存中的文章列表（MVP 固定数据）
func List(baseURL string) []Article {
	// baseURL 如 https://example.com，用于拼 href
	return []Article{
		{ID: "article-1", Type: "article", Title: "第一篇示例文章", Summary: "这是摘要内容，MVP 仅列表页。", Href: baseURL + "/article/article-1", Meta: "2025-03-07"},
		{ID: "article-2", Type: "article", Title: "第二篇示例文章", Summary: "摘要二。", Href: baseURL + "/article/article-2", Meta: "2025-03-06"},
		{ID: "article-3", Type: "article", Title: "第三篇示例文章", Summary: "摘要三。", Href: baseURL + "/article/article-3", Meta: "2025-03-05"},
		{ID: "article-4", Type: "article", Title: "第四篇示例文章", Summary: "摘要四。", Href: baseURL + "/article/article-4", Meta: "2025-03-04"},
		{ID: "article-5", Type: "article", Title: "第五篇示例文章", Summary: "摘要五。", Href: baseURL + "/article/article-5", Meta: "2025-03-03"},
	}
}
