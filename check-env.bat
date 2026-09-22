@echo off
chcp 65001 >nul
title 现经管回声 - Windows 环境检测
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0windows\check-env.ps1" %*
