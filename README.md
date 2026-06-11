# 现经管回声

校园吐槽/反馈社区原型，参考 Linux.do / Discourse 风格。当前版本已包含前端交互、登录/注册弹窗，以及可真实运行的本地后端认证系统。

## 本地运行

首次运行先安装依赖：

```sh
npm install
```

启动前端与后端：

```sh
npm start
```

打开：

```text
http://127.0.0.1:5173/
```

如果只想初始化数据库：

```sh
npm run migrate
```

## 登录注册

当前登录注册已经接入真实后端：

- 注册：`POST /api/auth/register`
- 登录：`POST /api/auth/login`
- 当前用户：`GET /api/auth/me`
- 退出登录：`POST /api/auth/logout`

账号数据保存在本地文件数据库：

```text
server/data/database.json
```

该目录已加入 `.gitignore`，不会提交真实用户数据。

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

后端已按职责拆分，后续如果要替换成 MySQL / PostgreSQL / SQLite，只需要重点替换 `server/database/` 和 `server/repositories/`。

## 当前功能

- 顶部导航栏
- 左侧边栏
- 分类/标签下拉筛选
- 论坛式吐槽列表
- 发布吐槽弹窗
- 帖子详情弹窗
- 点赞 / 收藏 / 举报 / 回复交互
- 登录弹窗
- 注册弹窗
- 密码加密存储
- httpOnly Cookie 登录会话
- 管理员后台占位页
- 黑夜 / 白天模式
