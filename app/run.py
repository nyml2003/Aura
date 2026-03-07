#!/usr/bin/env python3
"""
一键启动前后端：先构建前端，再 docker compose up。
仅用 Python 3 标准库，兼容 Windows / macOS / Linux。
用法：在 app 目录下执行  python3 run.py  或  python run.py
"""
from __future__ import print_function

import os
import subprocess
import sys

# 脚本所在目录即 app 目录
APP_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(APP_DIR, "frontend")
BACKEND_DIR = os.path.join(APP_DIR, "backend")
DIST_DIR = os.path.join(APP_DIR, "frontend", "apps", "list", "dist")
SERVER_BINARY = os.path.join(BACKEND_DIR, "server")


def run(cmd, cwd=None, description="", env=None):
    cwd = cwd or APP_DIR
    if description:
        print(description, flush=True)
    # Windows 下用 shell 才能正确找到 pnpm/docker 等
    use_shell = os.name == "nt"
    if use_shell and isinstance(cmd, list):
        cmd = " ".join(cmd)
    print("  ", cmd if isinstance(cmd, str) else " ".join(cmd), flush=True)
    ret = subprocess.call(cmd, cwd=cwd, shell=use_shell, env=env)
    if ret != 0:
        print("命令失败，退出码:", ret, file=sys.stderr)
        sys.exit(ret)


def main():
    if sys.version_info < (3, 6):
        print("需要 Python 3.6 或更高版本", file=sys.stderr)
        sys.exit(1)

    os.chdir(APP_DIR)

    # 1. 构建前端（需宿主机已安装 Node + pnpm）
    if not os.path.isdir(FRONTEND_DIR):
        print("未找到 frontend 目录:", FRONTEND_DIR, file=sys.stderr)
        sys.exit(1)

    run(
        ["pnpm", "install"],
        cwd=FRONTEND_DIR,
        description="安装前端依赖…",
    )
    run(
        ["pnpm", "run", "build:list"],
        cwd=FRONTEND_DIR,
        description="构建列表页前端…",
    )

    if not os.path.isdir(DIST_DIR):
        print("构建后未找到 dist 目录:", DIST_DIR, file=sys.stderr)
        sys.exit(1)

    # 2. 在宿主机编译 Go 二进制（Linux），避免 Docker 构建时拉取 golang 镜像
    if not os.path.isdir(BACKEND_DIR):
        print("未找到 backend 目录:", BACKEND_DIR, file=sys.stderr)
        sys.exit(1)
    go_env = os.environ.copy()
    go_env["GOOS"] = "linux"
    go_env["GOARCH"] = "amd64"
    run(
        ["go", "build", "-o", "server", "./cmd/server"],
        cwd=BACKEND_DIR,
        description="编译 Go 后端（Linux）…",
        env=go_env,
    )
    if not os.path.isfile(SERVER_BINARY):
        print("Go 编译后未找到二进制:", SERVER_BINARY, file=sys.stderr)
        sys.exit(1)

    # 3. 启动 Docker（仅打包二进制 + Nginx，无需拉取 golang/alpine）
    print("启动后可在宿主机浏览器访问: http://localhost:9080/ 或 http://localhost:9080/list")
    run(
        ["docker", "compose", "up", "--build"],
        cwd=APP_DIR,
        description="启动 Docker 服务（Nginx + 后端）…",
    )


if __name__ == "__main__":
    main()
