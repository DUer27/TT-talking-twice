<#
.SYNOPSIS
    现经管回声 (TT-talking-twice) Windows 环境检查脚本
.DESCRIPTION
    全面检测操作系统、Node.js、npm、配置文件、依赖包、MySQL 服务与认证、端口占用及网络连通性。
.PARAMETER AutoFix
    是否自动修复可修复项（如复制 .env、安装依赖等）
.PARAMETER SkipPause
    执行完毕后不暂停（供一键启动脚本等调用）
#>

[CmdletBinding()]
param(
    [switch]$AutoFix,
    [switch]$SkipPause
)

# 确保控制台输出使用 UTF-8
try {
    $OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = (Resolve-Path (Join-Path $scriptDir "..")).Path

# 计数器
$script:passCount = 0
$script:warnCount = 0
$script:failCount = 0

function Print-Header {
    param([string]$title)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Print-Section {
    param([string]$name)
    Write-Host ""
    Write-Host "[$name]" -ForegroundColor DarkCyan
}

function Print-Ok {
    param([string]$message, [string]$detail = "")
    $script:passCount++
    Write-Host "  [√ 通过] " -ForegroundColor Green -NoNewline
    Write-Host $message -ForegroundColor White -NoNewline
    if ($detail) {
        Write-Host " ($detail)" -ForegroundColor Gray
    } else {
        Write-Host ""
    }
}

function Print-Warn {
    param([string]$message, [string]$detail = "")
    $script:warnCount++
    Write-Host "  [! 警告] " -ForegroundColor Yellow -NoNewline
    Write-Host $message -ForegroundColor Yellow -NoNewline
    if ($detail) {
        Write-Host " ($detail)" -ForegroundColor DarkYellow
    } else {
        Write-Host ""
    }
}

function Print-Fail {
    param([string]$message, [string]$detail = "")
    $script:failCount++
    Write-Host "  [× 失败] " -ForegroundColor Red -NoNewline
    Write-Host $message -ForegroundColor Red -NoNewline
    if ($detail) {
        Write-Host " -> $detail" -ForegroundColor DarkRed
    } else {
        Write-Host ""
    }
}

function Print-Info {
    param([string]$message)
    Write-Host "  [i 提示] $message" -ForegroundColor Cyan
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

# 测试 TCP 端口是否通畅
function Test-PortOpen {
    param([string]$HostName, [int]$Port, [int]$TimeoutMs = 3000)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect($HostName, $Port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)
        if ($wait -and $client.Connected) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        } else {
            $client.Close()
            return $false
        }
    } catch {
        return $false
    }
}

# ==================== 主流程开始 ====================
Print-Header "现经管回声 (TT-talking-twice) - Windows 环境检测"
Write-Host "检测时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "项目根目录: $rootDir" -ForegroundColor Gray

# 1. 检查操作系统
Print-Section "1. 操作系统环境"
$os = [System.Environment]::OSVersion
$arch = if ([System.Environment]::Is64BitOperatingSystem) { "64 位" } else { "32 位" }
Print-Ok "操作系统: Windows ($($os.VersionString), $arch)"

# 2. 检查 Node.js
Print-Section "2. Node.js 运行环境"
$nodeCmd = Get-Command "node.exe" -ErrorAction SilentlyContinue
if ($nodeCmd) {
    try {
        $nodeVersionStr = (& node.exe -v).Trim()
        $nodeMajor = [int]($nodeVersionStr -replace '^v(\d+)\..*', '$1')
        if ($nodeMajor -ge 18) {
            Print-Ok "Node.js 已安装" "版本 $nodeVersionStr，符合 >= 18.x 要求"
        } else {
            Print-Fail "Node.js 版本过低: $nodeVersionStr" "推荐升级至 Node.js 18 或更高版本 (https://nodejs.org/)"
        }
    } catch {
        Print-Fail "无法获取 Node.js 版本信息" $_.Exception.Message
    }
} else {
    Print-Fail "未找到 Node.js" "请先下载安装 Node.js 18+ (https://nodejs.org/) 并配置 PATH 环境变量"
}

# 3. 检查 npm
Print-Section "3. npm 包管理工具"
$npmCmd = Get-Command "npm.cmd" -ErrorAction SilentlyContinue
if (-not $npmCmd) {
    $npmCmd = Get-Command "npm" -ErrorAction SilentlyContinue
}
if ($npmCmd) {
    try {
        $npmVersionStr = (& "npm.cmd" -v 2>$null).Trim()
        if (-not $npmVersionStr) {
            $npmVersionStr = (& npm -v 2>$null).Trim()
        }
        Print-Ok "npm 工具已就绪" "版本 $npmVersionStr"
    } catch {
        Print-Warn "npm 命令存在但调用异常" $_.Exception.Message
    }
} else {
    Print-Fail "未找到 npm 命令行工具" "请确认 Node.js 安装完整"
}

# 4. 检查配置文件 .env
Print-Section "4. 环境变量配置文件 (.env)"
$envFile = Join-Path $rootDir ".env"
$envExampleFile = Join-Path $rootDir ".env.example"
$envConfig = @{}

if (Test-Path $envFile) {
    Print-Ok "已检测到配置文件 .env"
    $envConfig = Parse-EnvFile $envFile
} else {
    if ($AutoFix -and (Test-Path $envExampleFile)) {
        try {
            Copy-Item $envExampleFile $envFile -Force
            Print-Warn "未检测到 .env，已自动从 .env.example 复制创建" "请检查数据库与管理员密码等设置"
            $envConfig = Parse-EnvFile $envFile
        } catch {
            Print-Fail "未能自动复制 .env 配置文件" $_.Exception.Message
        }
    } else {
        Print-Warn "未找到 .env 配置文件" "请从 .env.example 复制为 .env 并填写数据库与密码配置"
        if (Test-Path $envExampleFile) {
            $envConfig = Parse-EnvFile $envExampleFile
        }
    }
}

# 提取关键配置
$appPort = if ($envConfig["PORT"]) { [int]$envConfig["PORT"] } else { 6999 }
$dbHost = if ($envConfig["DB_HOST"]) { $envConfig["DB_HOST"] } else { "127.0.0.1" }
$dbPort = if ($envConfig["DB_PORT"]) { [int]$envConfig["DB_PORT"] } else { 3306 }
$dbName = if ($envConfig["DB_NAME"]) { $envConfig["DB_NAME"] } else { "tt_talking_twice" }
$dbUser = if ($envConfig["DB_USER"]) { $envConfig["DB_USER"] } else { "root" }
$defaultAdminPass = $envConfig["DEFAULT_ADMIN_PASSWORD"]

# 校验管理员密码强度提示
if ($defaultAdminPass -and $defaultAdminPass.Length -lt 12) {
    Print-Warn "DEFAULT_ADMIN_PASSWORD 长度小于 12 位" "为保障安全，生产环境建议至少 12 位以上强密码"
}

# 校验邮件配置
if (-not $envConfig["SMTP_USER"] -or -not $envConfig["SMTP_PASS"]) {
    Print-Info "SMTP 邮件参数未完全配置，注册验证码及找回密码邮件将无法真实发送（开发测试不受影响）"
}

# 5. 检查项目依赖 node_modules
Print-Section "5. 项目依赖包 (node_modules)"
$nmDir = Join-Path $rootDir "node_modules"
$expressPkg = Join-Path $nmDir "express"
$mysql2Pkg = Join-Path $nmDir "mysql2"

if ((Test-Path $expressPkg) -and (Test-Path $mysql2Pkg)) {
    Print-Ok "node_modules 核心依赖包完整"
} else {
    if ($AutoFix) {
        Print-Warn "依赖缺失，正在尝试自动执行 npm install，请稍候..."
        try {
            $proc = Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $rootDir -NoNewWindow -Wait -PassThru
            if ($proc.ExitCode -eq 0 -and (Test-Path $expressPkg)) {
                Print-Ok "依赖自动安装成功"
            } else {
                Print-Fail "npm install 安装依赖失败，退出码: $($proc.ExitCode)" "请手动在根目录执行 npm install 查看详细报错"
            }
        } catch {
            Print-Fail "自动运行 npm install 异常" $_.Exception.Message
        }
    } else {
        Print-Fail "缺失 node_modules 或关键依赖" "请在项目根目录运行: npm install"
    }
}

# 6. 检查 MySQL 服务与数据库连接
Print-Section "6. MySQL 服务与数据库连通性"
$isLocalDb = ($dbHost -eq "127.0.0.1" -or $dbHost -eq "localhost")

# 本地环境检测 Windows MySQL 系统服务
$localMysqlService = $null
if ($isLocalDb) {
    $mysqlServices = Get-Service -Name "*mysql*", "*mariadb*" -ErrorAction SilentlyContinue
    if ($mysqlServices) {
        $localMysqlService = $mysqlServices[0]
        if ($localMysqlService.Status -eq "Running") {
            Print-Ok "本地 Windows 服务 [$($localMysqlService.Name)] 正在运行"
        } else {
            Print-Warn "本地 Windows 服务 [$($localMysqlService.Name)] 当前状态为: $($localMysqlService.Status)"
            if ($AutoFix) {
                try {
                    Write-Host "  尝试启动服务 $($localMysqlService.Name)..." -ForegroundColor Cyan
                    Start-Service -Name $localMysqlService.Name -ErrorAction Stop
                    Print-Ok "本地 Windows 服务 [$($localMysqlService.Name)] 已成功启动"
                } catch {
                    Print-Warn "自动启动服务失败（可能需要管理员权限）" "请以管理员身份执行: net start $($localMysqlService.Name)"
                }
            } else {
                Print-Info "提示：可使用管理员 CMD 运行 'net start $($localMysqlService.Name)' 启动服务"
            }
        }
    }
}

# 检测 TCP 端口连通性
$portReachable = Test-PortOpen -HostName $dbHost -Port $dbPort -TimeoutMs 3000
if ($portReachable) {
    Print-Ok "MySQL 网络端口连通正常" "${dbHost}:${dbPort}"
} else {
    Print-Fail "无法连接到 MySQL 端口 ${dbHost}:${dbPort}" "请确认 MySQL 服务已启动且防火墙未拦截"
}

# 深度校验：使用 node check-db.js 进行账号认证及库校验
$checkDbScript = Join-Path $scriptDir "check-db.js"
if (-not (Test-Path $checkDbScript)) { $checkDbScript = Join-Path $rootDir "scripts\check-db.js" }
if ($portReachable -and (Test-Path $checkDbScript) -and (Test-Path $mysql2Pkg)) {
    try {
        $checkDbOutput = & node.exe $checkDbScript 2>$null
        if ($checkDbOutput) {
            $dbResult = $checkDbOutput | ConvertFrom-Json
            if ($dbResult.ok) {
                Print-Ok "MySQL 用户认证成功" "用户: $($dbResult.user)，数据库版本: $($dbResult.serverVersion)"
                if ($dbResult.databaseExists) {
                    Print-Ok "业务数据库已存在: [$($dbResult.database)]"
                } else {
                    Print-Info "业务数据库 [$($dbResult.database)] 尚未创建，服务启动时将自动执行迁移创建"
                }
            } else {
                Print-Fail "MySQL 认证或查询失败" "$($dbResult.message)"
            }
        }
    } catch {
        Print-Warn "执行数据库深度检测脚本时发生异常" $_.Exception.Message
    }
}

# 7. 检查服务启动端口占用情况
Print-Section "7. 服务端口检测 (PORT: $appPort)"
$busyConnection = Get-NetTCPConnection -LocalPort $appPort -State Listen -ErrorAction SilentlyContinue
if ($busyConnection) {
    $owningPid = ($busyConnection | Select-Object -ExpandProperty OwningProcess -Unique)[0]
    $owningProc = Get-Process -Id $owningPid -ErrorAction SilentlyContinue
    $procName = if ($owningProc) { $owningProc.ProcessName } else { "未知进程" }

    $pidFile = Join-Path $rootDir ".server.pid"
    $isSelfApp = $false
    if (Test-Path $pidFile) {
        $savedPid = (Get-Content $pidFile -ErrorAction SilentlyContinue).Trim()
        if ($savedPid -eq [string]$owningPid) {
            $isSelfApp = $true
        }
    }
    if ($procName -eq "node") {
        $isSelfApp = $true
    }

    if ($isSelfApp) {
        Print-Warn "端口 $appPort 当前已被本项目的 Node 进程占用 (PID: $owningPid)" "启动脚本将自动停止该旧实例并重启"
    } else {
        Print-Fail "端口 $appPort 已被其他应用程序占用: $procName (PID: $owningPid)" "请修改 .env 中的 PORT 或退出占用该端口的程序"
    }
} else {
    Print-Ok "端口 $appPort 空闲可用"
}

# 8. 检查外部静态资源连通性
 Print-Section "8. 外部网络连通性 (QQ 头像服务)"
try {
    $resp = Invoke-WebRequest -Uri "https://q1.qlogo.cn" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    Print-Ok "QQ 头像静态服务访问正常" "https://q1.qlogo.cn"
} catch {
    Print-Warn "无法连通 QQ 头像服务器 (https://q1.qlogo.cn)" "头像将自动回退为默认首字母头像，不影响核心功能"
}

# ==================== 结果汇总 ====================
Print-Header "环境检查结果汇总"
 Write-Host "  [√ 通过]: $script:passCount 项" -ForegroundColor Green
Write-Host "  [! 警告]: $script:warnCount 项" -ForegroundColor Yellow
Write-Host "  [× 失败]: $script:failCount 项" -ForegroundColor Red
Write-Host ""

$readyToRun = ($script:failCount -eq 0)

if ($readyToRun) {
    Write-Host ">>> [ 结论: 环境检测通过，项目已具备启动条件！ ] <<<" -ForegroundColor Green
} else {
    Write-Host ">>> [ 结论: 检测到 $script:failCount 个阻断性问题，请根据上方红色 [× 失败] 提示排查后再启动 ] <<<" -ForegroundColor Red
}
Write-Host ""

if (-not $SkipPause) {
    Write-Host "按任意键退出..." -ForegroundColor Gray
    try { [Console]::ReadKey($true) | Out-Null } catch {}
}

if ($readyToRun) {
    exit 0
} else {
    exit 1
}
