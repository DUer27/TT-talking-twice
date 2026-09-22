@echo off
chcp 65001 >nul
title 现经管回声 - Windows 一键启动
cd /d "%~dp0"

echo 正在启动 现经管回声 (TT-talking-twice)...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-service.ps1" %*

if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================================
    echo   服务已在后台正常运行！
    echo   提示：您可以双击 stop.bat 随时停止服务。
    echo ============================================================
    echo 按任意键关闭本启动窗口（不影响后台服务）...
    pause >nul
) else (
    echo.
    echo 启动过程中遇到问题，请参考上方提示信息排查。
    pause
)
