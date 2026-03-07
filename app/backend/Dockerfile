# 使用宿主机已编译好的二进制，无需在构建时拉取 golang/alpine 镜像
# 需先在本机执行: go build -o server -C backend ./cmd/server 或由 run.py 自动执行
FROM scratch
COPY server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
