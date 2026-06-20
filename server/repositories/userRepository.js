const { getPool } = require('../database/connection');

const publicUserFields = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    nickname: user.nickname,
    qq: user.qq || '',
    createdAt: user.created_at,
  };
};

const findUserByEmail = async (email) => {
  const [rows] = await getPool().execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await getPool().execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createUser = async ({ email, passwordHash, role = 'student', nickname, qq = '' }) => {
  const normalizedEmail = email.toLowerCase();
  try {
    const [result] = await getPool().execute(
      `INSERT INTO users (email, password_hash, role, nickname, qq)
       VALUES (?, ?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, role, nickname || normalizedEmail.split('@')[0], qq]
    );
    return findUserById(result.insertId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('该邮箱已注册');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }
};

const updateUserProfile = async (id, { email, nickname, qq = '' }) => {
  try {
    await getPool().execute(
      'UPDATE users SET email = ?, nickname = ?, qq = ? WHERE id = ?',
      [email.toLowerCase(), nickname, qq, id]
    );
    return findUserById(id);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('璇ラ偖绠卞凡娉ㄥ唽');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }
};

const updateUserPassword = async (id, passwordHash) => {
  await getPool().execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  return findUserById(id);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  publicUserFields,
  updateUserPassword,
  updateUserProfile,
};
