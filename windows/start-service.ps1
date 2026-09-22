<#
.SYNOPSIS
    现经管回声 (TT-talking-twice) Windows 一键启动脚本
.DESCRIPTION
    1. 自动执行环境检查（支持自动修复缺失项，如依赖、配置文件、已停止的本地 MySQL 服务）
    2. 如果存在旧的实例或端口占用，优雅停止旧服务
    3. 运行数据库迁移 (npm run migrate)
    4. 启动 Node.js 服务器并写入 .server.pid
    5. 等待健康检查通过
    6. 自动在默认浏览器中打开应用页面
.PARAMETER NoBrowser
    启动完成后不自动打开浏览器
.PARAMETER Foreground
    在前台保持运行（按 Ctrl+C 停止），默认在独立窗口中后台常驻运行
#>

[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$Foreground
)

# 确保控制台输出使用 UTF-8
try {
    $OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = (Resolve-Path (Join-Path $scriptDir "..")).Path

function Log-Step {
    param([string]$title)
    Write-Host ""
    Write-Host "==> $title" -ForegroundColor Cyan
}

function Log-Success {
    param([string]$msg)
    Write-Host "    [OK] $msg" -ForegroundColor Green
}

function Log-Warn {
    param([string]$msg)
    Write-Host "    [WARN] $msg" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$msg)
    Write-Host "    [ERROR] $msg" -ForegroundColor Red
}

# 解析 .env 文件
function Parse-EnvFile {
    param([string]$filePath)
    $envHash = @{}
    if (-not (Test-Path $filePath)) { return $envHash }
    Get-Content $filePath -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $idx = $line.IndexOf("=")
        if ($idx -gt 0) {
            $key = $line.Substring(0, $idx).Trim()
            $val = $line.Substring($idx + 1).Trim()
            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                $val = $val.Substring(1, $val.Length - 2)
            }
            $envHash[$key] = $val
        }
    }
    return $envHash
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "      现经管回声 (TT-talking-twice) - Windows 一键启动      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "项目路径: $rootDir" -ForegroundColor Gray

# ----------------- 步骤 1: 执行环境检查 -----------------
Log-Step "步骤 1/5: 正在进行环境健康检查与自动修复..."
$checkEnvScript = Join-Path $scriptDir "check-env.ps1"

if (Test-Path $checkEnvScript) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $checkEnvScript -AutoFix -SkipPause
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Log-Error "环境检查未通过，启动已中止！请按照上方提示排查并解决错误项后重新运行。"
        Write-Host "按任意键退出..." -ForegroundColor Gray
        try { [Console]::ReadKey($true) | Out-Null } catch {}
        exit 1
    }
    Log-Success "环境检查通过！"
} else {
    Log-Warn "未找到 check-env.ps1，跳过环境检查阶段"
}

# ----------------- 步骤 2: 读取运行配置 -----------------
Log-Step "步骤 2/5: 读取项目配置..."
$envFile = Join-Path $rootDir ".env"
$envConfig = Parse-EnvFile $envFile
$appPort = if ($envConfig["PORT"]) { [int]$envConfig["PORT"] } else { 6999 }
$appUrl = "http://127.0.0.1:$appPort"
Log-Success "服务监听端口: $appPort"
Log-Success "目标访问地址: $appUrl"

# ----------------- 步骤 3: 清理旧实例与占用端口 -----------------
Log-Step "步骤 3/5: 检查并清理旧的服务实例..."
$stopScript = Join-Path $rootDir "scripts\stop.js"
if (Test-Path $stopScript) {
    try {
        & node.exe $stopScript
    } catch {
        Log-Warn "运行停止脚本时捕获异常: $($_.Exception.Message)"
    }
}

# 再次确认端口是否已释放
$busyConnection = Get-NetTCPConnection -LocalPort $appPort -State Listen -ErrorAction SilentlyContinue
if ($busyConnection) {
    $owningPid = ($busyConnection | Select-Object -ExpandProperty OwningProcess -Unique)[0]
    Log-Warn "检测到端口 $appPort 仍被 PID $owningPid 占用，正在强制释放..."
    try {
        Stop-Process -Id $owningPid -Force -ErrorAction Stop
        Start-Sleep -Seconds 1
        Log-Success "已成功停止占用进程 $owningPid"
    } catch {
        Log-Error "未能强制停止占用进程 $owningPid，可能需要管理员权限或手动在任务管理器结束"
        exit 1
    }
} else {
    Log-Success "端口 $appPort 空闲，就绪"
}

# ----------------- 步骤 4: 执行数据库迁移 -----------------
Log-Step "步骤 4/5: 执行数据库结构迁移与初始数据同步..."
$migrateScript = Join-Path $rootDir "server\database\migrate.js"
try {
    $migrateProc = Start-Process -FilePath "node.exe" -ArgumentList $migrateScript -WorkingDirectory $rootDir -NoNewWindow -Wait -PassThru
    if ($migrateProc.ExitCode -eq 0) {
        Log-Success "数据库表结构与种子数据迁移完成"
    } else {
        Log-Error "数据库迁移失败，退出码: $($migrateProc.ExitCode)"
        Write-Host "按任意键退出..." -ForegroundColor Gray
        try { [Console]::ReadKey($true) | Out-Null } catch {}
        exit 1
    }
} catch {
    Log-Error "执行数据库迁移失败: $($_.Exception.Message)"
    exit 1
}

# ----------------- 步骤 5: 启动服务 -----------------
Log-Step "步骤 5/5: 启动现经管回声 Node.js 服务..."

$appEntry = Join-Path $rootDir "server\app.js"
$pidFile = Join-Path $rootDir ".server.pid"

# 清理旧的 pid 文件
if (Test-Path $pidFile) {
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

if ($Foreground) {
    Log-Success "正在当前控制台前台启动服务（按 Ctrl+C 可停止）..."
    & node.exe $appEntry
} else {
    # 启动 Node 服务独立后台进程（带有独立窗口标题）
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c title 现经管回声服务 (PORT: $appPort) & node `"$appEntry`"" -WorkingDirectory $rootDir

    # 等待服务端口上线与响应
    Write-Host "    正在等待服务就绪..." -ForegroundColor Cyan -NoNewline
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Milliseconds 500
        Write-Host "." -ForegroundColor Cyan -NoNewline

        $listening = Get-NetTCPConnection -LocalPort $appPort -State Listen -ErrorAction SilentlyContinue
        if ($listening) {
            # 尝试发送 HTTP 请求校验响应
            try {
                $resp = Invoke-WebRequest -Uri "$appUrl/" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
                if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                    $ready = $true
                    break
                }
            } catch {
                $ready = $true
                break
            }
        }
    }
    Write-Host ""

    if ($ready) {
        $savedPid = if (Test-Path $pidFile) { (Get-Content $pidFile -ErrorAction SilentlyContinue).Trim() } else { "已记录" }
        Log-Success "服务启动成功！"
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host "  现经管回声 服务已成功在后台运行！" -ForegroundColor Green
        Write-Host "  访问地址: $appUrl" -ForegroundColor Cyan
        Write-Host "  运行进程: PID $savedPid" -ForegroundColor White
        Write-Host "  停止服务: 双击运行 stop.bat 或执行 npm run stop" -ForegroundColor Gray
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host ""

        # 自动打开浏览器
        if (-not $NoBrowser) {
            Log-Step "正在默认浏览器中打开页面..."
            try {
                Start-Process $appUrl
            } catch {
                Log-Warn "未能自动唤起默认浏览器，请手动复制链接在浏览器中打开: $appUrl"
            }
        }
        exit 0
    } else {
        Log-Error "等待超时，服务未能正常响应端口 $appPort"
        Log-Warn "请检查是否发生报错，或查看是否有同端口冲突"
        Write-Host "按任意键退出..." -ForegroundColor Gray
        try { [Console]::ReadKey($true) | Out-Null } catch {}
        exit 1
    }
}
