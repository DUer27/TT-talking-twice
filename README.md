# 现经管回声

校园吐槽/反馈社区原型，参考 Linux.do / Discourse 风格。当前版本已包含前端交互、登录/注册弹窗，以及基于本机 MySQL 的真实后端认证系统。

## 本地运行

首次运行先安装依赖：

```sh
npm install
```

复制环境变量配置：

```sh
cp .env.example .env
```

根据本机 MySQL 修改 `.env`：

```env
PORT=5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=tt_talking_twice
DB_USER=root
DB_PASSWORD=
DB_CONNECTION_LIMIT=10
```

初始化数据库和表：

```sh
npm run migrate
```

启动前端与后端：

```sh
npm start
```

打开：

```text
http://127.0.0.1:5173/
```

## MySQL 数据库

后端启动/迁移时会自动创建数据库：

```text
tt_talking_twice
```

当前认证相关表：

```text
users
sessions
login_attempts
```

登录失败限频写入 `login_attempts` 表，服务重启后不会丢失。

## 登录注册

当前登录注册已经接入真实后端：

- 注册：`POST /api/auth/register`
- 登录：`POST /api/auth/login`
- 当前用户：`GET /api/auth/me`
- 退出登录：`POST /api/auth/logout`

密码使用 `bcryptjs` 加密存储，登录状态使用 httpOnly Cookie 会话。

## 后端结构

```text
server/
├── app.js
├── config/
│   └── env.js
├── database/
│   ├── connection.js
│   └── migrate.js
├── middleware/
│   └── authMiddleware.js
├── repositories/
│   ├── loginAttemptRepository.js
│   ├── sessionRepository.js
│   └── userRepository.js
├── routes/
│   └── authRoutes.js
├── services/
│   └── authService.js
└── utils/
    ├── password.js
    └── sessionToken.js
```

## 当前功能

- 顶部导航栏
- 左侧边栏
- 分类/标签下拉筛选
- 论坛式吐槽列表
- 发布吐槽弹窗
- 帖子详情弹窗
- 点赞 / 收藏 / 举报 / 评论交互
- 登录弹窗
- 注册弹窗
- 密码加密存储
- httpOnly Cookie 登录会话
- 登录失败 5 次持久化限频，15 分钟后恢复
- 管理员后台占位页
- 黑夜 / 白天模式
