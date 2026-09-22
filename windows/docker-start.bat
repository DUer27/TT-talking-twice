@echo off
chcp 65001 >nul
title 现经管回声 - Docker 一键启动
cd /d "%~dp0.."

echo ============================================================
echo   现经管回声 (TT-talking-twice) - Docker 一键部署启动
echo ============================================================

where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [错误] 未在系统 PATH 中检测到 docker 命令！
    echo 请确认已安装并启动 Docker Desktop (https://www.docker.com/products/docker-desktop/)
    echo.
    pause
    exit /b 1
)

if not exist .env (
    if exist docker-compose.env.example (
        echo [提示] 未检测到 .env，自动从 docker-compose.env.example 复制创建...
        copy docker-compose.env.example .env >nul
    )
)

echo ==> 正在拉起 Docker 容器集群 (含 Node 应用与 MySQL 8.0)...
docker compose up -d --build

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================================
    echo   Docker 容器已成功在后台运行！
    echo   访问地址: http://127.0.0.1:6999
    echo   停止容器: 双击 windows\docker-stop.bat 或运行 docker compose down
    echo ============================================================
    echo.
    echo 按任意键打开浏览器访问系统...
    pause >nul
    start http://127.0.0.1:6999
) else (
    echo.
    echo [错误] Docker 启动失败，请检查 Docker Desktop 是否处于运行状态。
    pause
)
