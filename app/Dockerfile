# MVP Node 后端：contract + frontend 构建 + backend，包管理统一 pnpm
# 若拉取 registry-1.docker.io 超时，可配置 Docker 镜像加速
FROM node:20-bookworm-slim

WORKDIR /app

COPY contract contract
COPY frontend frontend
COPY backend backend

# 统一使用 pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 契约包构建（产出 dist，供 backend 引用）
RUN cd contract && pnpm install && pnpm run build

# 前端依赖与构建
RUN cd frontend && pnpm install && pnpm run build:list

# 后端依赖与构建
RUN cd backend && pnpm install && pnpm run build

ENV FRONTEND_DIST=/app/frontend/apps/list/dist
ENV PORT=4000

EXPOSE 4000
CMD ["node", "backend/dist/index.js"]
