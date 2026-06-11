const express = require('express');
const { sessionCookieName, sessionMaxAgeMs } = require('../config/env');
const { login, logout, register } = require('../services/authService');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: sessionMaxAgeMs,
  path: '/',
};

router.post('/register', async (req, res, next) => {
  try {
    const user = await register(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { user, session } = await login(req.body);
    res.cookie(sessionCookieName, session.token, cookieOptions);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    await logout(req.cookies?.[sessionCookieName]);
    res.clearCookie(sessionCookieName, { path: '/' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.currentUser });
});

module.exports = router;
