package main

import (
	"log"
	"net/http"

	"github.com/aura/blog-mvp/internal/gateway"
	"github.com/aura/blog-mvp/internal/template"
	"github.com/aura/blog-mvp/internal/scene"
)

func main() {
	tpl, err := template.New()
	if err != nil {
		log.Fatal(err)
	}
	gw := &gateway.Handler{
		List: &scene.ListHandler{Tpl: tpl},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	// 需首屏数据的页面请求走网关
	mux.Handle("/", gw)

	addr := ":8080"
	log.Printf("server listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
