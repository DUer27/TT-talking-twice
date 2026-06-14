const { getPool } = require('../database/connection');

const toIsoString = (value) => (value ? new Date(value).toISOString() : null);

const publicFeedbackFields = (feedback) => {
  if (!feedback) return null;
  const authorName = feedback.author_nickname
    || feedback.author_email?.split('@')[0]
    || (feedback.user_id ? '用户' : '匿名用户');
  return {
    id: String(feedback.id),
    type: feedback.type,
    content: feedback.content,
    contact: feedback.contact || '',
    pageUrl: feedback.page_url || '',
    userAgent: feedback.user_agent || '',
    status: feedback.status,
    author: feedback.user_id ? {
      id: String(feedback.user_id),
      name: authorName,
      email: feedback.author_email || '',
    } : null,
    createdAt: toIsoString(feedback.created_at),
    updatedAt: toIsoString(feedback.updated_at),
  };
};

const createFeedback = async ({ userId = null, type, content, contact = '', pageUrl = '', userAgent = '' }) => {
  const [result] = await getPool().execute(
    `INSERT INTO site_feedback (user_id, type, content, contact, page_url, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, content, contact, pageUrl, userAgent]
  );
  return findFeedbackById(result.insertId);
};

const findFeedbackById = async (id) => {
  const [rows] = await getPool().execute(
    `SELECT site_feedback.*, users.email AS author_email, users.nickname AS author_nickname
     FROM site_feedback
     LEFT JOIN users ON users.id = site_feedback.user_id
     WHERE site_feedback.id = ?
     LIMIT 1`,
    [id]
  );
  return publicFeedbackFields(rows[0]);
};

const listFeedback = async ({ status = 'all', limit = 100 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
  const params = [];
  let whereSql = '';
  if (status && status !== 'all') {
    whereSql = 'WHERE site_feedback.status = ?';
    params.push(status);
  }
  const [rows] = await getPool().execute(
    `SELECT site_feedback.*, users.email AS author_email, users.nickname AS author_nickname
     FROM site_feedback
     LEFT JOIN users ON users.id = site_feedback.user_id
     ${whereSql}
     ORDER BY site_feedback.created_at DESC, site_feedback.id DESC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map(publicFeedbackFields);
};

const updateFeedbackStatus = async ({ id, status }) => {
  await getPool().execute(
    'UPDATE site_feedback SET status = ? WHERE id = ?',
    [status, id]
  );
  return findFeedbackById(id);
};

module.exports = {
  createFeedback,
  listFeedback,
  updateFeedbackStatus,
};
