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

module.exports = {
  attachCurrentUser,
  requireAuth,
};
