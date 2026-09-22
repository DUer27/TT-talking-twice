@echo off
chcp 65001 >nul
title 现经管回声 - Docker 一键启动
cd /d "%~dp0"
call "%~dp0windows\docker-start.bat" %*
