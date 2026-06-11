const { getPool } = require('../database/connection');

const normalizeKey = ({ email, ip }) => `${String(email || '').trim().toLowerCase()}|${ip || 'unknown'}`;

const cleanupExpiredAttempts = async () => {
  await getPool().execute('DELETE FROM login_attempts WHERE reset_at <= UTC_TIMESTAMP()');
};

const findLoginAttempt = async ({ email, ip }) => {
  await cleanupExpiredAttempts();
  const [rows] = await getPool().execute(
    'SELECT * FROM login_attempts WHERE attempt_key = ? LIMIT 1',
    [normalizeKey({ email, ip })]
  );
  return rows[0] || null;
};

const upsertLoginFailure = async ({ email, ip, windowMs }) => {
  await cleanupExpiredAttempts();
  const key = normalizeKey({ email, ip });
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedIp = ip || 'unknown';
  const resetAt = new Date(Date.now() + windowMs).toISOString().slice(0, 19).replace('T', ' ');

  await getPool().execute(
    `INSERT INTO login_attempts (attempt_key, email, ip, failed_count, reset_at)
     VALUES (?, ?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE
       failed_count = failed_count + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [key, normalizedEmail, normalizedIp, resetAt]
  );

  const [rows] = await getPool().execute('SELECT * FROM login_attempts WHERE attempt_key = ? LIMIT 1', [key]);
  return rows[0];
};

const clearLoginAttempt = async ({ email, ip }) => {
  await getPool().execute('DELETE FROM login_attempts WHERE attempt_key = ?', [normalizeKey({ email, ip })]);
};

module.exports = {
  clearLoginAttempt,
  findLoginAttempt,
  upsertLoginFailure,
};
