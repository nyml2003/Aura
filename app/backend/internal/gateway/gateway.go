package gateway

import (
	"encoding/json"
	"net/http"

	"github.com/aura/blog-mvp/internal/scene"
)

// Handler 网关：按 path 解析 scenecode 并分发到场景 Handler
type Handler struct {
	List *scene.ListHandler
}

// ServeHTTP 处理需首屏数据的 GET 请求
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	path := r.URL.Path
	code, ok := Resolve(path)
	if !ok {
		http.NotFound(w, r)
		return
	}
	switch code {
	case SceneList:
		html, err := h.List.Render(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(html)
	default:
		http.NotFound(w, r)
	}
}

// WriteJSON 写入 JSON 响应（供 POST /page 等可选）
func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
