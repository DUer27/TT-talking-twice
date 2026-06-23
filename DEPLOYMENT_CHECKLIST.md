# 上线清单

## 服务器基础环境

- 安装 Node.js，建议使用 Node.js 18 或更高版本。
- 安装 MySQL 8.x 或兼容版本。服务器如果还没有 MySQL，需要先安装并启动 MySQL，再运行本项目。
- 确认服务器能访问 `https://q1.qlogo.cn`，否则 QQ 头像代理会回退为首字母头像。
- 确认服务器 6999 端口已放行，或在反向代理中转发到本服务的 6999 端口。

Ubuntu/Debian 安装 MySQL 示例：

```sh
sudo apt update
sudo apt install mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

## MySQL 初始化

建议为本项目创建独立数据库用户，不要直接使用 root 账号跑生产服务。

```sql
CREATE DATABASE IF NOT EXISTS tt_talking_twice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'tt_app'@'localhost' IDENTIFIED BY 'replace_with_a_strong_password';
GRANT ALL PRIVILEGES ON tt_talking_twice.* TO 'tt_app'@'localhost';
FLUSH PRIVILEGES;
```

如果 MySQL 不在同一台服务器，把 `localhost` 换成应用服务器 IP，并同步修改 `.env` 里的 `DB_HOST`。

## 环境变量

复制模板并修改：

```sh
cp .env.example .env
```

重点检查：

- `PORT=6999`
- `NODE_ENV=production`
- `DB_HOST`
- `DB_PORT=3306`
- `DB_NAME=tt_talking_twice`
- `DB_USER=tt_app`
- `DB_PASSWORD`
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`
- `VERIFICATION_CODE_SECRET`，必须换成足够长的随机字符串
- `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` / `DEFAULT_ADMIN_NICKNAME`

如果数据库里没有管理员，迁移脚本会自动创建初始管理员。建议上线前明确设置 `DEFAULT_ADMIN_PASSWORD`，长度至少 12 位；如果不设置，服务会生成临时强密码并打印到启动日志，首次登录后立即修改。

## 部署步骤

一键启动 Debian 12 / Ubuntu 服务：

```sh
bash scripts/start-service-debian.sh
```

脚本只负责安装 Node 依赖、创建 systemd 服务并启动应用。数据库需要你提前安装并配置好；如需更新表结构，再手动运行 `npm run migrate`。

手动部署：

```sh
npm ci
npm run migrate
npm start
```

启动后检查：

- `http://127.0.0.1:6999/` 能打开。
- 登录、注册、验证码邮件正常。
- 发帖列表不暴露普通用户邮箱/QQ。
- 管理员后台能看到需要的用户身份字段。
- 发帖人头像能显示；如果头像不显示，先检查服务器能否访问 `https://q1.qlogo.cn`。

## 反向代理建议

生产环境建议使用 Nginx/Caddy 反向代理到 `127.0.0.1:6999`，并开启 HTTPS。示例 Nginx upstream 目标：

```text
http://127.0.0.1:6999
```

应用已在 `NODE_ENV=production` 下使用 Secure Cookie；如果走 HTTPS 反向代理，保留 `app.set('trust proxy', 1)`。

## 上线前确认

- `.env` 不提交到仓库。
- MySQL 已安装、启动并可连接。
- 数据库用户权限只给本项目数据库。
- `npm run migrate` 成功。
- 首个管理员账号可以登录。
- 服务器防火墙和云安全组已放行需要的端口。
- 服务进程有守护方式，例如 systemd、PM2、Docker 或平台自带进程管理。
