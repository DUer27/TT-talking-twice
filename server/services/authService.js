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
const { hashPassword, verifyPassword } = require('../utils/password');
const { createSessionToken, hashSessionToken } = require('../utils/sessionToken');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeLoginIdentifier = (value) => String(value || '').trim().toLowerCase();

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
  logout,
  register,
  updateProfile,
};
