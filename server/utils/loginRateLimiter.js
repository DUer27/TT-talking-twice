const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 1000 * 60 * 15;

const attempts = new Map();

const normalizeKey = ({ email, ip }) => `${String(email || '').trim().toLowerCase()}|${ip || 'unknown'}`;

const cleanup = (now = Date.now()) => {
  for (const [key, record] of attempts.entries()) {
    if (record.resetAt <= now) attempts.delete(key);
  }
};

const getRecord = (key, now = Date.now()) => {
  cleanup(now);
  const record = attempts.get(key);
  if (!record || record.resetAt <= now) {
    return { count: 0, resetAt: now + WINDOW_MS };
  }
  return record;
};

const assertCanAttempt = ({ email, ip }) => {
  const key = normalizeKey({ email, ip });
  const record = getRecord(key);
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const error = new Error('登录失败次数过多，请 15 分钟后再试');
    error.statusCode = 429;
    error.remainingAttempts = 0;
    throw error;
  }
};

const recordFailure = ({ email, ip }) => {
  const key = normalizeKey({ email, ip });
  const record = getRecord(key);
  record.count += 1;
  attempts.set(key, record);
  return Math.max(MAX_FAILED_ATTEMPTS - record.count, 0);
};

const recordSuccess = ({ email, ip }) => {
  attempts.delete(normalizeKey({ email, ip }));
};

module.exports = {
  assertCanAttempt,
  recordFailure,
  recordSuccess,
};
