#!/usr/bin/env python3
"""
MVP 一键启动：Docker Compose 构建并启动 Node 后端 + Nginx。
镜像内会构建 contract、frontend、backend-node。
需已安装：Docker。
用法：在 app 目录下执行  python run.py  或  python3 run.py
启动后访问: http://localhost:9080/ 或 http://localhost:9080/list
"""
from __future__ import print_function

import os
import subprocess
import sys

APP_DIR = os.path.dirname(os.path.abspath(__file__))


def run(cmd, cwd=None, description="", env=None):
    cwd = cwd or APP_DIR
    if description:
        print(description, flush=True)
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

    print("启动 Docker（Node 后端 + Nginx）…")
    print("启动后访问: http://localhost:9080/ 或 http://localhost:9080/list")
    run(["docker", "compose", "up", "--build"], cwd=APP_DIR, description="启动服务…")


if __name__ == "__main__":
    main()
