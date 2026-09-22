#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

echo "============================================================"
echo "  现经管回声 (TT-talking-twice) - Docker 一键部署启动"
echo "============================================================"

# Check if docker & compose are available
if ! command -v docker &> /dev/null; then
    echo "[错误] 未安装 docker 命令，请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "[错误] 未找到 docker compose 或 docker-compose 插件"
    exit 1
fi

# Create .env from template if missing
if [ ! -f .env ] && [ -f docker-compose.env.example ]; then
    echo "[提示] 未检测到 .env 配置文件，自动从 docker-compose.env.example 复制创建..."
    cp docker-compose.env.example .env
fi

echo "==> 正在构建与启动 Docker 容器群..."
$COMPOSE_CMD up -d --build

echo ""
echo "==> 检查容器运行状态..."
$COMPOSE_CMD ps

echo ""
echo "============================================================"
echo "  现经管回声 Docker 容器已成功启动！"
echo "  访问地址: http://127.0.0.1:6999"
echo "  查看实时日志: $COMPOSE_CMD logs -f"
echo "  停止服务:     $COMPOSE_CMD down"
echo "============================================================"
