const {
  clearLoginAttempt,
  findLoginAttempt,
  upsertLoginFailure,
} = require('../repositories/loginAttemptRepository');

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 1000 * 60 * 15;

const assertCanAttempt = async ({ email, ip }) => {
  const attempt = await findLoginAttempt({ email, ip });
  if (attempt && attempt.failed_count >= MAX_FAILED_ATTEMPTS) {
    const error = new Error('登录失败次数过多，请 15 分钟后再试');
    error.statusCode = 429;
    error.remainingAttempts = 0;
    throw error;
  }
};

const recordFailure = async ({ email, ip }) => {
  const attempt = await upsertLoginFailure({ email, ip, windowMs: WINDOW_MS });
  return Math.max(MAX_FAILED_ATTEMPTS - attempt.failed_count, 0);
};

const recordSuccess = async ({ email, ip }) => {
  await clearLoginAttempt({ email, ip });
};

module.exports = {
  assertCanAttempt,
  recordFailure,
  recordSuccess,
};
