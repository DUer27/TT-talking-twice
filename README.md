# 现经管回声

现经管回声是一个校园吐槽和反馈社区原型，包含前端交互、登录注册、帖子发布、评论点赞收藏、管理员后台、公告留档、AI 辅助统计与报告生成。后端使用 Express + MySQL，前端为原生 HTML/CSS/JavaScript。

## 功能概览

- 帖子列表、搜索、板块筛选、标签筛选、本周活跃筛选
- 帖子详情、评论、点赞、收藏、举报
- 登录、注册、退出、修改资料、修改密码、QQ 头像同步
- 管理员后台：统计图表、帖子状态管理、板块与标签管理、处理建议归档
- 管理员公告：发布公告、公告留档、从公告列表进入详情
- AI 能力：关键词分析、周期报告生成、Markdown/Word/PDF/HTML 导出
- 黑夜/日光主题切换

## 环境要求

- Node.js 18 或更高版本
- MySQL 8.x 或兼容版本
- 可发送邮件的邮箱 SMTP 授权码（用于注册验证码和找回密码）
- npm

## 上线清单

上线前请先看 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)。服务器必须安装并启动 MySQL 8.x 或兼容版本，再配置 `.env`、运行 `npm run migrate` 和启动服务。

Debian 12 / Ubuntu 可以在仓库目录运行一键部署脚本：

```sh
bash scripts/start-service-debian.sh
```

## 本地运行

安装依赖：

```sh
npm install
```

复制环境变量模板：

```sh
copy .env.example .env
```

按本机情况修改 `.env`：

```env
PORT=6999

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=tt_talking_twice
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_CONNECTION_LIMIT=10

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
OPENAI_USER_AGENT=Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36
AI_TIMEOUT_MS=20000

SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@qq.com
SMTP_PASS=your_email_smtp_authorization_code
SMTP_FROM=现经管回声 <your_email@qq.com>
VERIFICATION_CODE_SECRET=change_this_to_a_long_random_string
```

初始化数据库和表：

```sh
npm run migrate
```

启动服务：

```sh
npm start
```

访问：

```text
http://127.0.0.1:6999/
```

停止当前项目服务：

```sh
npm run stop
```

`npm run stop` 会读取项目根目录的 `.server.pid` 并停止对应的 Node 进程；如果没有运行中的服务，会提示未找到，不会报错。

## 数据库

迁移脚本会自动创建数据库：

```text
tt_talking_twice
```

主要数据表：

- `users`：用户账号、角色、昵称
- `sessions`：httpOnly Cookie 登录会话
- `login_attempts`：登录失败限流记录
- `posts`：帖子主体
- `comments`：评论
- `post_likes`：点赞关系
- `categories`：板块
- `category_tags`：板块标签
- `post_tags`：帖子标签
- `admin_reports` / `admin_report_posts`：管理员报告与关联帖子

迁移脚本不会自动创建测试账号或 demo 帖子。

如果数据库里没有任何管理员，迁移脚本会自动创建初始管理员。可通过 `DEFAULT_ADMIN_EMAIL`、`DEFAULT_ADMIN_PASSWORD` 和 `DEFAULT_ADMIN_NICKNAME` 配置；如果不设置 `DEFAULT_ADMIN_PASSWORD`，系统会生成一次性临时强密码并打印到服务日志里，首次登录后请立即修改。

## AI 配置

AI 请求配置集中在 `.env`，由 `server/config/env.js` 读取：

- `OPENAI_API_KEY`：接口密钥
- `OPENAI_BASE_URL`：接口地址，默认 `https://api.openai.com/v1`
- `OPENAI_MODEL`：模型名称
- `OPENAI_USER_AGENT`：请求使用的 User-Agent
- `AI_TIMEOUT_MS`：请求超时时间，单位毫秒

如果没有配置 `OPENAI_API_KEY`，AI 分析会自动跳过，系统仍可使用本地统计逻辑。

## 常用命令

```sh
npm start      # 启动服务
npm run dev    # 同 start
npm run stop   # 停止当前项目服务
npm run migrate # 创建/更新数据库结构
```

## 项目结构

```text
.
├── index.html
├── script.js
├── styles.css
├── assets/
├── scripts/
│   └── stop.js
└── server/
    ├── app.js
    ├── config/
    │   └── env.js
    ├── database/
    │   ├── connection.js
    │   └── migrate.js
    ├── middleware/
    ├── repositories/
    ├── routes/
    ├── services/
    └── utils/
```

## 注意事项

- `.env` 包含数据库密码和 AI Key，不要提交到公开仓库。
- 修改数据库结构后重新运行 `npm run migrate`。
- 管理员报告导出依赖后端生成内容，不需要额外安装 Office 或 PDF 工具。
