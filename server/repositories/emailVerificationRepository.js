const { getPool } = require('../database/connection');

const toMysqlDateTime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

const cleanupExpiredVerifications = async () => {
  await getPool().execute("DELETE FROM email_verifications WHERE expires_at <= UTC_TIMESTAMP() OR used_at IS NOT NULL");
};

const countEmailCodesSince = async ({ email, purpose, since }) => {
  const [rows] = await getPool().execute(
    `SELECT COUNT(*) AS total
     FROM email_verifications
     WHERE email = ? AND purpose = ? AND created_at >= ?`,
    [email.toLowerCase(), purpose, toMysqlDateTime(since)]
  );
  return Number(rows[0]?.total || 0);
};

const createEmailVerification = async ({ email, purpose, codeHash, expiresAt, ip = '' }) => {
  await cleanupExpiredVerifications();
  const [result] = await getPool().execute(
    `INSERT INTO email_verifications (email, purpose, code_hash, ip, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [email.toLowerCase(), purpose, codeHash, ip, toMysqlDateTime(expiresAt)]
  );
  return result.insertId;
};

const findLatestActiveEmailVerification = async ({ email, purpose }) => {
  await cleanupExpiredVerifications();
  const [rows] = await getPool().execute(
    `SELECT *
     FROM email_verifications
     WHERE email = ?
       AND purpose = ?
       AND used_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     ORDER BY id DESC
     LIMIT 1`,
    [email.toLowerCase(), purpose]
  );
  return rows[0] || null;
};

const incrementVerificationAttempt = async (id) => {
  await getPool().execute('UPDATE email_verifications SET attempt_count = attempt_count + 1 WHERE id = ?', [id]);
};

const markEmailVerificationUsed = async (id) => {
  await getPool().execute('UPDATE email_verifications SET used_at = UTC_TIMESTAMP() WHERE id = ?', [id]);
};

module.exports = {
  countEmailCodesSince,
  createEmailVerification,
  findLatestActiveEmailVerification,
  incrementVerificationAttempt,
  markEmailVerificationUsed,
};
