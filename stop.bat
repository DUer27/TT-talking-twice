@echo off
chcp 65001 >nul
title 现经管回声 - Windows 停止服务
cd /d "%~dp0"

echo 正在停止 现经管回声 (TT-talking-twice) 服务...
node "%~dp0scripts\stop.js"

echo.
echo 按任意键退出...
pause >nul
