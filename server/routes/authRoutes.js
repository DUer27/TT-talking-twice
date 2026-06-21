const express = require('express');
const { sessionCookieName, sessionMaxAgeMs } = require('../config/env');
const { changePassword, createAdminInviteCodes, deleteAdminInviteCode, getInviteLiveStatus, login, logout, register, resetPassword, sendEmailCode, updateProfile } = require('../services/authService');
const { assertCanAttempt, recordFailure, recordSuccess } = require('../utils/loginRateLimiter');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: sessionMaxAgeMs,
  path: '/',
};

router.post('/email-code', async (req, res, next) => {
  try {
    await sendEmailCode(req.body, { ip: req.ip });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const user = await register(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset', async (req, res, next) => {
  try {
    await resetPassword(req.body);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/invites', requireAdmin, async (req, res, next) => {
  try {
    const invites = await createAdminInviteCodes(req.currentUser.id, req.body);
    res.status(201).json({ invites });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/invites', requireAdmin, async (req, res, next) => {
  try {
    await deleteAdminInviteCode(req.body);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/invites/live-status', requireAdmin, async (req, res, next) => {
  try {
    const statuses = await getInviteLiveStatus(req.body);
    res.json({ statuses });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const attemptMeta = { email: req.body?.email, ip: req.ip };
  try {
    await assertCanAttempt(attemptMeta);
    const { user, session } = await login(req.body);
    await recordSuccess(attemptMeta);
    res.cookie(sessionCookieName, session.token, cookieOptions);
    res.json({ user });
  } catch (error) {
    if (error.statusCode === 401) {
      error.remainingAttempts = await recordFailure(attemptMeta);
      error.message = `${error.message}，还可尝试 ${error.remainingAttempts} 次`;
    }
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

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await updateProfile(req.currentUser.id, req.body);
    req.currentUser = user;
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch('/password', requireAuth, async (req, res, next) => {
  try {
    const user = await changePassword(req.currentUser.id, req.body);
    req.currentUser = user;
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
