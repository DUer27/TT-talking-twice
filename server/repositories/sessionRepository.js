const { readDatabase, updateDatabase } = require('../database/connection');

const createSession = async ({ userId, tokenHash, expiresAt }) => {
  await updateDatabase((database) => {
    database.sessions.push({
      id: database.meta.nextSessionId++,
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });
  });
};

const findSessionWithUser = async (tokenHash) => {
  const database = await readDatabase();
  const session = database.sessions.find(
    (item) => item.token_hash === tokenHash && new Date(item.expires_at).getTime() > Date.now()
  );
  if (!session) return null;
  const user = database.users.find((item) => item.id === session.user_id);
  if (!user) return null;
  return {
    session_id: session.id,
    expires_at: session.expires_at,
    ...user,
  };
};

const deleteSession = async (tokenHash) => {
  await updateDatabase((database) => {
    database.sessions = database.sessions.filter((session) => session.token_hash !== tokenHash);
  });
};

module.exports = {
  createSession,
  deleteSession,
  findSessionWithUser,
};
