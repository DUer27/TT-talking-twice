@echo off
chcp 65001 >nul
title 现经管回声 - Docker 停止服务
cd /d "%~dp0"
call "%~dp0windows\docker-stop.bat" %*
