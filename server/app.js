const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const { port, rootDir } = require('./config/env');
const { migrate } = require('./database/migrate');
const { attachCurrentUser } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const postRoutes = require('./routes/postRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const { purgeExpiredDeletedPosts } = require('./repositories/postRepository');

const app = express();
const pidFile = path.join(rootDir, '.server.pid');
const staticOptions = {
  dotfiles: 'deny',
  fallthrough: false,
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
};

const cleanupPidFile = () => {
  try {
    if (fs.existsSync(pidFile) && fs.readFileSync(pidFile, 'utf8').trim() === String(process.pid)) {
      fs.unlinkSync(pidFile);
    }
  } catch (_error) {
    // Best-effort cleanup only.
  }
};

process.on('exit', cleanupPidFile);
process.on('SIGINT', () => { cleanupPidFile(); process.exit(0); });
process.on('SIGTERM', () => { cleanupPidFile(); process.exit(0); });

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://q1.qlogo.cn; connect-src 'self'"
  );
  next();
});
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(attachCurrentUser);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/avatars', avatarRoutes);

app.use('/assets', express.static(path.join(rootDir, 'assets'), staticOptions));
app.get(['/styles.css', '/script.js'], (req, res) => {
  res.sendFile(path.join(rootDir, req.path.slice(1)));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || error.status || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? '服务器内部错误' : error.message,
  });
});

const start = async () => {
  await migrate();
  const cleanupDeletedPosts = () => {
    purgeExpiredDeletedPosts().catch((error) => {
      console.warn(`Failed to purge expired deleted posts: ${error.message}`);
    });
  };
  cleanupDeletedPosts();
  const cleanupTimer = setInterval(cleanupDeletedPosts, 60 * 1000);
  cleanupTimer.unref?.();
  const server = app.listen(port, () => {
    fs.writeFileSync(pidFile, String(process.pid));
    console.log(`TT-talking-twice is running at http://127.0.0.1:${port}`);
  });
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Run "npm run stop" and then try again.`);
      process.exit(1);
    }
    throw error;
  });
};

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
