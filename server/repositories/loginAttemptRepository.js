const { readDatabase, updateDatabase } = require('../database/connection');

const normalizeKey = ({ email, ip }) => `${String(email || '').trim().toLowerCase()}|${ip || 'unknown'}`;

const cleanupExpiredAttempts = (database, now = Date.now()) => {
  database.loginAttempts = (database.loginAttempts || []).filter(
    (attempt) => new Date(attempt.reset_at).getTime() > now
  );
};

const findLoginAttempt = async ({ email, ip }) => {
  const database = await readDatabase();
  cleanupExpiredAttempts(database);
  const key = normalizeKey({ email, ip });
  return (database.loginAttempts || []).find((attempt) => attempt.attempt_key === key) || null;
};

const upsertLoginFailure = async ({ email, ip, windowMs }) => {
  return updateDatabase((database) => {
    database.loginAttempts ||= [];
    cleanupExpiredAttempts(database);

    const key = normalizeKey({ email, ip });
    const now = new Date().toISOString();
    const resetAt = new Date(Date.now() + windowMs).toISOString();
    let attempt = database.loginAttempts.find((item) => item.attempt_key === key);

    if (!attempt) {
      attempt = {
        attempt_key: key,
        email: String(email || '').trim().toLowerCase(),
        ip: ip || 'unknown',
        failed_count: 0,
        reset_at: resetAt,
        created_at: now,
        updated_at: now,
      };
      database.loginAttempts.push(attempt);
    }

    attempt.failed_count += 1;
    attempt.updated_at = now;
    return attempt;
  });
};

const clearLoginAttempt = async ({ email, ip }) => {
  await updateDatabase((database) => {
    database.loginAttempts ||= [];
    const key = normalizeKey({ email, ip });
    database.loginAttempts = database.loginAttempts.filter((attempt) => attempt.attempt_key !== key);
  });
};

module.exports = {
  clearLoginAttempt,
  findLoginAttempt,
  upsertLoginFailure,
};
