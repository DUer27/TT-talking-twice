const crypto = require('crypto');
const { sessionMaxAgeMs } = require('../config/env');
const { verificationCodeSecret } = require('../config/env');
const {
  createUser,
  findUserByEmail,
  findUserById,
  publicUserFields,
  updateUserPassword,
  updateUserProfile,
} = require('../repositories/userRepository');
const {
  countEmailCodesSince,
  createEmailVerification,
  findLatestActiveEmailVerification,
  incrementVerificationAttempt,
  markEmailVerificationUsed,
} = require('../repositories/emailVerificationRepository');
const { createSession, deleteSession, findSessionWithUser } = require('../repositories/sessionRepository');
const { createInviteCodes, disableInviteByCodeHash, findInviteByCodeHash, redeemInviteCode } = require('../repositories/inviteRepository');
const { sendVerificationCodeEmail } = require('./emailService');
const { hashPassword, verifyPassword } = require('../utils/password');
const { createSessionToken, hashSessionToken } = require('../utils/sessionToken');

const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
const EMAIL_CODE_COOLDOWN_MS = 60 * 1000;
const EMAIL_CODE_DAILY_LIMIT = 10;
const EMAIL_CODE_MAX_ATTEMPTS = 5;
const EMAIL_CODE_PURPOSES = new Set(['register', 'reset_password']);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeLoginIdentifier = (value) => String(value || '').trim().toLowerCase();
const normalizeInviteCode = (value) => String(value || '').trim().replace(/\s+/g, '').toUpperCase();
const hashInviteCode = (code) => crypto.createHash('sha256').update(normalizeInviteCode(code)).digest('hex');

const normalizeQq = (value) => String(value || '').trim();

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateQq = (qq) => !qq || /^\d{5,12}$/.test(qq);

const normalizePurpose = (purpose) => String(purpose || '').trim();

const createVerificationCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const createInviteCode = () => crypto.randomBytes(9).toString('base64url').toUpperCase();

const hashVerificationCode = ({ email, purpose, code }) => crypto
  .createHmac('sha256', verificationCodeSecret)
  .update(`${normalizeEmail(email)}|${normalizePurpose(purpose)}|${String(code || '').trim()}`)
  .digest('hex');

const isSameHash = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ''), 'hex');
  const rightBuffer = Buffer.from(String(right || ''), 'hex');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const createAuthSession = async (user) => {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs).toISOString();

  await createSession({ userId: user.id, tokenHash, expiresAt });

  return { token, expiresAt };
};

const assertValidEmailCode = async ({ email, purpose, code }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPurpose = normalizePurpose(purpose);
  const normalizedCode = String(code || '').trim();
  if (!/^\d{6}$/.test(normalizedCode)) {
    const error = new Error('请输入 6 位邮箱验证码');
    error.statusCode = 400;
    throw error;
  }

  const verification = await findLatestActiveEmailVerification({ email: normalizedEmail, purpose: normalizedPurpose });
  if (!verification) {
    const error = new Error('验证码不存在或已过期，请重新获取');
    error.statusCode = 400;
    throw error;
  }
  if (Number(verification.attempt_count || 0) >= EMAIL_CODE_MAX_ATTEMPTS) {
    await markEmailVerificationUsed(verification.id);
    const error = new Error('验证码错误次数过多，请重新获取');
    error.statusCode = 429;
    throw error;
  }

  const expectedHash = hashVerificationCode({ email: normalizedEmail, purpose: normalizedPurpose, code: normalizedCode });
  if (!isSameHash(verification.code_hash, expectedHash)) {
    await incrementVerificationAttempt(verification.id);
    const error = new Error('邮箱验证码不正确');
    error.statusCode = 400;
    throw error;
  }

  return verification;
};

const sendEmailCode = async ({ email, purpose, inviteCode }, { ip = '' } = {}) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPurpose = normalizePurpose(purpose);

  if (!validateEmail(normalizedEmail)) {
    const error = new Error('Email format is invalid');
    error.statusCode = 400;
    throw error;
  }
  if (!EMAIL_CODE_PURPOSES.has(normalizedPurpose)) {
    const error = new Error('验证码用途无效');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (normalizedPurpose === 'register' && existingUser) {
    const error = new Error('该邮箱已注册');
    error.statusCode = 409;
    throw error;
  }
  if (normalizedPurpose === 'register') {
    const normalizedInviteCode = normalizeInviteCode(inviteCode);
    if (!normalizedInviteCode) {
      const error = new Error('请先输入邀请码');
      error.statusCode = 400;
      throw error;
    }
    await assertInviteCodeUsable(hashInviteCode(normalizedInviteCode), { requireAvailableUse: true });
  }
  if (normalizedPurpose === 'reset_password' && !existingUser) {
    return { ok: true };
  }

  const now = Date.now();
  const recentCount = await countEmailCodesSince({
    email: normalizedEmail,
    purpose: normalizedPurpose,
    since: new Date(now - EMAIL_CODE_COOLDOWN_MS),
  });
  if (recentCount > 0) {
    const error = new Error('验证码发送太频繁，请稍后再试');
    error.statusCode = 429;
    throw error;
  }

  const dailyCount = await countEmailCodesSince({
    email: normalizedEmail,
    purpose: normalizedPurpose,
    since: new Date(now - 24 * 60 * 60 * 1000),
  });
  if (dailyCount >= EMAIL_CODE_DAILY_LIMIT) {
    const error = new Error('今日验证码发送次数已达上限');
    error.statusCode = 429;
    throw error;
  }

  const code = createVerificationCode();
  const codeHash = hashVerificationCode({ email: normalizedEmail, purpose: normalizedPurpose, code });
  await sendVerificationCodeEmail({ to: normalizedEmail, code, purpose: normalizedPurpose });
  await createEmailVerification({
    email: normalizedEmail,
    purpose: normalizedPurpose,
    codeHash,
    expiresAt: new Date(now + EMAIL_CODE_TTL_MS),
    ip,
  });

  return { ok: true };
};

const register = async ({ email, password, code, inviteCode }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedInviteCode = normalizeInviteCode(inviteCode);

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
  if (!normalizedInviteCode) {
    const error = new Error('请先输入邀请码');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('该邮箱已注册');
    error.statusCode = 409;
    throw error;
  }

  const codeHash = hashInviteCode(normalizedInviteCode);
  await assertInviteCodeUsable(codeHash, { requireAvailableUse: true });
  const verification = await assertValidEmailCode({ email: normalizedEmail, purpose: 'register', code });
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email: normalizedEmail, passwordHash });
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
  await markEmailVerificationUsed(verification.id);
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

const assertInviteCodeUsable = async (codeHash, { requireAvailableUse = false } = {}) => {
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
  if (requireAvailableUse && Number(invite.used_count || 0) >= Number(invite.max_uses || 1)) {
    const error = new Error('邀请码使用次数已用完');
    error.statusCode = 401;
    throw error;
  }
  return invite;
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

const updateProfile = async (userId, { email, nickname, qq }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedNickname = String(nickname || '').trim();
  const normalizedQq = normalizeQq(qq);
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
  if (!validateQq(normalizedQq)) {
    const error = new Error('QQ 号必须是 5-12 位数字');
    error.statusCode = 400;
    throw error;
  }
  const user = await updateUserProfile(userId, { email: normalizedEmail, nickname: normalizedNickname, qq: normalizedQq });
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

const resetPassword = async ({ email, code, newPassword }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!validateEmail(normalizedEmail)) {
    const error = new Error('Email format is invalid');
    error.statusCode = 400;
    throw error;
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error('验证码不存在或已过期，请重新获取');
    error.statusCode = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('新密码至少需要 6 位');
    error.statusCode = 400;
    throw error;
  }

  const verification = await assertValidEmailCode({ email: normalizedEmail, purpose: 'reset_password', code });
  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(user.id, passwordHash);
  await markEmailVerificationUsed(verification.id);
  return { ok: true };
};

const createAdminInviteCodes = async (adminUserId, { count = 1, maxUses = 1, expiresInDays = 0, label = '' } = {}) => {
  const safeCount = Math.max(1, Math.min(Number(count) || 1, 100));
  const safeMaxUses = Math.max(1, Math.min(Number(maxUses) || 1, 1000));
  const safeExpiresInDays = Math.max(0, Math.min(Number(expiresInDays) || 0, 365));
  const normalizedLabel = String(label || '').trim().slice(0, 120);
  const expiresAt = safeExpiresInDays
    ? new Date(Date.now() + safeExpiresInDays * 24 * 60 * 60 * 1000)
    : null;
  const codeSet = new Set();
  while (codeSet.size < safeCount) {
    codeSet.add(createInviteCode());
  }
  const invites = [...codeSet].map((code) => ({
    code,
    codeHash: hashInviteCode(code),
    label: normalizedLabel,
    maxUses: safeMaxUses,
    expiresAt,
  }));

  await createInviteCodes({ invites, createdBy: adminUserId });
  return invites.map(({ code, label, maxUses, expiresAt }) => ({
    code,
    label,
    maxUses,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
  }));
};

const getInviteLiveStatus = async ({ codes = [] } = {}) => {
  const normalizedCodes = [...new Set((Array.isArray(codes) ? codes : [])
    .map((code) => normalizeInviteCode(code))
    .filter(Boolean))].slice(0, 500);

  const statuses = await Promise.all(normalizedCodes.map(async (code) => {
    const invite = await findInviteByCodeHash(hashInviteCode(code));
    if (!invite) return { code, live: false, status: 'not_found', reason: '不存在' };
    if (invite.status !== 'active') return { code, live: false, status: invite.status, reason: '已删除' };
    if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
      return { code, live: false, status: 'expired', reason: '已过期' };
    }
    if (Number(invite.used_count || 0) >= Number(invite.max_uses || 1)) {
      return { code, live: false, status: 'used_up', reason: '次数已用完' };
    }
    return {
      code,
      live: true,
      status: 'active',
      reason: '可用',
      usedCount: Number(invite.used_count || 0),
      maxUses: Number(invite.max_uses || 1),
      expiresAt: invite.expires_at ? new Date(invite.expires_at).toISOString() : null,
    };
  }));

  return statuses;
};

const deleteAdminInviteCode = async ({ code } = {}) => {
  const normalizedCode = normalizeInviteCode(code);
  if (!normalizedCode) {
    const error = new Error('请先选择要删除的邀请码');
    error.statusCode = 400;
    throw error;
  }

  const deleted = await disableInviteByCodeHash(hashInviteCode(normalizedCode));
  if (!deleted) {
    const error = new Error('邀请码不存在或已删除');
    error.statusCode = 404;
    throw error;
  }

  return { ok: true };
};

module.exports = {
  changePassword,
  createAdminInviteCodes,
  deleteAdminInviteCode,
  getInviteLiveStatus,
  getCurrentUser,
  login,
  logout,
  register,
  resetPassword,
  sendEmailCode,
  updateProfile,
};
