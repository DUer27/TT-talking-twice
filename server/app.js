const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const { port, rootDir } = require('./config/env');
const { migrate } = require('./database/migrate');
const { attachCurrentUser } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(attachCurrentUser);

app.use('/api/auth', authRoutes);

app.use(express.static(rootDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? '服务器内部错误' : error.message,
  });
});

const start = async () => {
  await migrate();
  app.listen(port, () => {
    console.log(`TT-talking-twice is running at http://127.0.0.1:${port}`);
  });
};

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
