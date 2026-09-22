@echo off
chcp 65001 >nul
title 现经管回声 - Docker 停止服务
cd /d "%~dp0.."

echo 正在停止 现经管回声 Docker 容器...
docker compose down

echo.
echo 按任意键退出...
pause >nul
