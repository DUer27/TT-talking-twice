const { getPool } = require('../database/connection');

const publicUserFields = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    nickname: user.nickname,
    qq: user.qq || '',
    studentNo: user.student_no || '',
    createdAt: user.created_at,
  };
};

const findUserByEmail = async (email) => {
  const [rows] = await getPool().execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
  return rows[0] || null;
};

const findUserByStudentNo = async (studentNo) => {
  const normalized = String(studentNo || '').trim();
  if (!normalized) return null;
  const [rows] = await getPool().execute('SELECT * FROM users WHERE student_no = ? LIMIT 1', [normalized]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await getPool().execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createUser = async ({ email, passwordHash, role = 'student', nickname, qq = '', studentNo = null }) => {
  const normalizedEmail = email.toLowerCase();
  try {
    const [result] = await getPool().execute(
      `INSERT INTO users (email, password_hash, role, nickname, qq, student_no)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, role, nickname || normalizedEmail.split('@')[0], qq, studentNo || null]
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

const countUsersByRole = async (role) => {
  const [rows] = await getPool().execute('SELECT COUNT(*) AS total FROM users WHERE role = ?', [role]);
  return Number(rows[0]?.total || 0);
};

const listUsersByRole = async (role) => {
  const [rows] = await getPool().execute(
    'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC, id DESC',
    [role]
  );
  return rows.map(publicUserFields);
};

const updateUserRole = async (id, role) => {
  await getPool().execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  return findUserById(id);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByStudentNo,
  publicUserFields,
  updateUserPassword,
  updateUserProfile,
  countUsersByRole,
  listUsersByRole,
  updateUserRole,
};
