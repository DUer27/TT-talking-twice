# 现经管回声 (TT-talking-twice) - Windows 启动与检测工具包

本目录整合了在 Windows 环境下一键运行、体检诊断以及优雅停止所需的所有脚本与工具。

## 文件结构

- **`start.bat`**：Windows 一键启动批处理脚本（双击直接运行）。
- **`check-env.bat`**：Windows 独立环境检查诊断脚本（双击直接运行）。
- **`stop.bat`**：Windows 一键停止服务脚本（双击直接运行）。
- **`start-service.ps1`**：启动底层编排脚本（支持自动环境检查、旧实例平滑重启、数据库迁移、后台守护启动与默认浏览器自动唤起）。
- **`check-env.ps1`**：底层环境检查脚本（系统、Node 18+、npm、.env、node_modules、MySQL 服务状态、TCP 端口连通、账号认证、业务数据库、服务端口 6999 及静态外网检测）。
- **`check-db.js`**：MySQL 深度认证与数据库状态检测辅助脚本。
- **`docker-start.bat`**：Windows 一键通过 Docker Compose 启动容器集群。
- **`docker-stop.bat`**：Windows 一键停止 Docker 容器集群。

## 运行方式

### 方式一：本地直接启动（推荐本地开发调试）
1. **直接启动**：双击运行本目录下的 `start.bat`（或项目根目录下的 `start.bat`）。
2. **环境诊断**：双击运行本目录下的 `check-env.bat`。
3. **停止服务**：双击运行本目录下的 `stop.bat`。

### 方式二：Docker 容器化启动
1. **启动容器**：双击运行本目录下或项目根目录下的 `docker-start.bat`（需安装并启动 Docker Desktop）。
2. **停止容器**：双击运行本目录下或项目根目录下的 `docker-stop.bat`。

所有脚本均已处理 Windows PowerShell 执行策略（Bypass）及 UTF-8 编码兼容性，开箱即用。
