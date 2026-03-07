package template

import (
	"bytes"
	"encoding/json"
	"html/template"
	"strings"
)

// Renderer 渲染带 __INIT_DATA__ 的 HTML 模板
type Renderer struct {
	listTpl *template.Template
}

// New 从 embed 或目录加载模板
func New() (*Renderer, error) {
	tpl, err := template.New("list").Parse(listHTML)
	if err != nil {
		return nil, err
	}
	return &Renderer{listTpl: tpl}, nil
}

// RenderList 渲染列表页 HTML，InitDataJSON 已转义；initData 可 JSON 序列化即可
func (r *Renderer) RenderList(initData any) ([]byte, error) {
	raw, err := json.Marshal(initData)
	if err != nil {
		return nil, err
	}
	// 避免 </script> 破坏 HTML，见 MVP 文档 7.4
	escaped := strings.ReplaceAll(string(raw), "</", "<\\/")
	var buf bytes.Buffer
	err = r.listTpl.Execute(&buf, map[string]string{"InitDataJSON": escaped})
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
