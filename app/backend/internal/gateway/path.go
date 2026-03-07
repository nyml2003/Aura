package gateway

// SceneCode 场景码，与契约一致
type SceneCode string

const (
	SceneList SceneCode = "list"
)

// Resolve 根据 path 解析 scenecode（MVP 仅 / 与 /list）
func Resolve(path string) (SceneCode, bool) {
	switch path {
	case "/", "/list":
		return SceneList, true
	default:
		return "", false
	}
}
