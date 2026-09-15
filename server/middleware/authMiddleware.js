const { sessionCookieName } = require('../config/env');
const { getCurrentUser } = require('../services/authService');

const attachCurrentUser = async (req, _res, next) => {
  try {
    const token = req.cookies?.[sessionCookieName];
    req.currentUser = await getCurrentUser(token);
    next();
  } catch (error) {
    next(error);
  }
};

const requireAuth = (req, res, next) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: '请先登录' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: '请先登录' });
  }
  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

const requireTeacher = (req, res, next) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: '请先登录' });
  }
  if (!['admin', 'teacher'].includes(req.currentUser.role)) {
    return res.status(403).json({ message: '需要教师或管理员权限' });
  }
  next();
};

module.exports = {
  attachCurrentUser,
  requireAdmin,
  requireAuth,
  requireTeacher,
};
