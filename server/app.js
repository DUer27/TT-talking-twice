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
const { purgeExpiredDeletedPosts } = require('./repositories/postRepository');

const app = express();
const pidFile = path.join(rootDir, '.server.pid');

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

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(attachCurrentUser);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/posts', postRoutes);

app.use(express.static(rootDir));

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
