const { getPool } = require('../database/connection');

const createSession = async ({ userId, tokenHash, expiresAt }) => {
  await getPool().execute(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt.slice(0, 19).replace('T', ' ')]
  );
};

const findSessionWithUser = async (tokenHash) => {
  const [rows] = await getPool().execute(
    `SELECT
       sessions.id AS session_id,
       sessions.expires_at,
       users.id,
       users.email,
       users.role,
       users.nickname,
       users.created_at
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ?
       AND sessions.expires_at > UTC_TIMESTAMP()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
};

const deleteSession = async (tokenHash) => {
  await getPool().execute('DELETE FROM sessions WHERE token_hash = ?', [tokenHash]);
};

module.exports = {
  createSession,
  deleteSession,
  findSessionWithUser,
};
