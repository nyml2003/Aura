package scene

import (
	"net/http"

	"github.com/aura/blog-mvp/internal/data"
	"github.com/aura/blog-mvp/internal/template"
)

// ListInitData 与契约 list 场景 InitData 一致
type ListInitData struct {
	Scene string         `json:"scene"`
	List  []data.Article `json:"list"`
}

// ListHandler 列表页场景：拼装 __INIT_DATA__ 并渲染 HTML
type ListHandler struct {
	Tpl *template.Renderer
}

// Render 返回带内联 JSON 的 HTML
func (h *ListHandler) Render(r *http.Request) ([]byte, error) {
	baseURL := baseURL(r)
	list := data.List(baseURL)
	initData := ListInitData{Scene: "list", List: list}
	return h.Tpl.RenderList(initData)
}

func baseURL(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	host := r.Host
	if host == "" {
		host = "localhost:8080"
	}
	return scheme + "://" + host
}
