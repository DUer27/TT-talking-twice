const { readDatabase, updateDatabase } = require('../database/connection');

const publicUserFields = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    nickname: user.nickname,
    createdAt: user.created_at,
  };
};

const findUserByEmail = async (email) => {
  const database = await readDatabase();
  return database.users.find((user) => user.email === email.toLowerCase()) || null;
};

const findUserById = async (id) => {
  const database = await readDatabase();
  return database.users.find((user) => user.id === Number(id)) || null;
};

const createUser = async ({ email, passwordHash, role = 'student', nickname }) => {
  const normalizedEmail = email.toLowerCase();
  return updateDatabase((database) => {
    if (database.users.some((user) => user.email === normalizedEmail)) {
      const error = new Error('该邮箱已注册');
      error.statusCode = 409;
      throw error;
    }

    const now = new Date().toISOString();
    const user = {
      id: database.meta.nextUserId++,
      email: normalizedEmail,
      password_hash: passwordHash,
      role,
      nickname: nickname || normalizedEmail.split('@')[0],
      created_at: now,
      updated_at: now,
    };

    database.users.push(user);
    return user;
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  publicUserFields,
};
