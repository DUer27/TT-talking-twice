const crypto = require('crypto');
const { sessionMaxAgeMs } = require('../config/env');
const {
  createUser,
  findUserByEmail,
  findUserById,
  publicUserFields,
  updateUserPassword,
  updateUserProfile,
} = require('../repositories/userRepository');
const { createSession, deleteSession, findSessionWithUser } = require('../repositories/sessionRepository');
const { findInviteByCodeHash, redeemInviteCode } = require('../repositories/inviteRepository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { createSessionToken, hashSessionToken } = require('../utils/sessionToken');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeLoginIdentifier = (value) => String(value || '').trim().toLowerCase();
const normalizeInviteCode = (value) => String(value || '').trim().replace(/\s+/g, '').toUpperCase();
const hashInviteCode = (code) => crypto.createHash('sha256').update(normalizeInviteCode(code)).digest('hex');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createAuthSession = async (user) => {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs).toISOString();

  await createSession({ userId: user.id, tokenHash, expiresAt });

  return { token, expiresAt };
};

const register = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!validateEmail(normalizedEmail)) {
    const error = new Error('邮箱格式不正确');
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 6) {
    const error = new Error('密码至少需要 6 位');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('该邮箱已注册');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email: normalizedEmail, passwordHash });
  return publicUserFields(user);
};

const login = async ({ email, password }) => {
  const loginIdentifier = normalizeLoginIdentifier(email);
  const user = await findUserByEmail(loginIdentifier);

  if (!user) {
    const error = new Error('邮箱或密码错误');
    error.statusCode = 401;
    throw error;
  }

  const matched = await verifyPassword(password || '', user.password_hash);
  if (!matched) {
    const error = new Error('邮箱或密码错误');
    error.statusCode = 401;
    throw error;
  }

  const session = await createAuthSession(user);
  return { user: publicUserFields(user), session };
};

const assertInviteCodeUsable = async (codeHash) => {
  const invite = await findInviteByCodeHash(codeHash);
  if (!invite) {
    const error = new Error('邀请码不存在或已失效');
    error.statusCode = 401;
    throw error;
  }
  if (invite.status !== 'active') {
    const error = new Error('邀请码已停用');
    error.statusCode = 401;
    throw error;
  }
  if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
    const error = new Error('邀请码已过期');
    error.statusCode = 401;
    throw error;
  }
  return invite;
};

const loginWithInvite = async ({ email, inviteCode }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = normalizeInviteCode(inviteCode);

  if (!validateEmail(normalizedEmail)) {
    const error = new Error('邮箱格式不正确');
    error.statusCode = 400;
    throw error;
  }
  if (!normalizedCode) {
    const error = new Error('请输入邀请码');
    error.statusCode = 400;
    throw error;
  }

  const codeHash = hashInviteCode(normalizedCode);
  await assertInviteCodeUsable(codeHash);

  let user = await findUserByEmail(normalizedEmail);
  if (!user) {
    const passwordHash = await hashPassword(crypto.randomBytes(24).toString('hex'));
    user = await createUser({ email: normalizedEmail, passwordHash });
  }

  const redeemed = await redeemInviteCode({ codeHash, email: normalizedEmail, userId: user.id });
  if (!redeemed.ok) {
    const messages = {
      not_found: '邀请码不存在或已失效',
      disabled: '邀请码已停用',
      expired: '邀请码已过期',
      used_up: '邀请码使用次数已用完',
    };
    const error = new Error(messages[redeemed.reason] || '邀请码验证失败');
    error.statusCode = 401;
    throw error;
  }

  const session = await createAuthSession(user);
  return { user: publicUserFields(user), session };
};

const getCurrentUser = async (token) => {
  if (!token) return null;
  const sessionUser = await findSessionWithUser(hashSessionToken(token));
  return publicUserFields(sessionUser);
};

const logout = async (token) => {
  if (!token) return;
  await deleteSession(hashSessionToken(token));
};

const updateProfile = async (userId, { email, nickname }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedNickname = String(nickname || '').trim();
  if (!validateEmail(normalizedEmail)) {
    const error = new Error('Email format is invalid');
    error.statusCode = 400;
    throw error;
  }
  if (!normalizedNickname) {
    const error = new Error('用户名不能为空');
    error.statusCode = 400;
    throw error;
  }
  if (normalizedNickname.length > 24) {
    const error = new Error('用户名不能超过 24 个字符');
    error.statusCode = 400;
    throw error;
  }
  const user = await updateUserProfile(userId, { email: normalizedEmail, nickname: normalizedNickname });
  return publicUserFields(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('用户不存在');
    error.statusCode = 404;
    throw error;
  }

  const matched = await verifyPassword(currentPassword || '', user.password_hash);
  if (!matched) {
    const error = new Error('当前密码不正确');
    error.statusCode = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('新密码至少需要 6 位');
    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error('新密码不能与当前密码相同');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);
  const updatedUser = await updateUserPassword(userId, passwordHash);
  return publicUserFields(updatedUser);
};

module.exports = {
  changePassword,
  getCurrentUser,
  login,
  loginWithInvite,
  logout,
  register,
  updateProfile,
};
