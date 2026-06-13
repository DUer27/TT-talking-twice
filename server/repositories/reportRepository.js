const { getPool } = require('../database/connection');

const toIsoString = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const publicReportFields = (report) => {
  if (!report) return null;
  let payload = report.payload;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (_error) {
      payload = {};
    }
  }
  return {
    id: String(report.id),
    title: report.title,
    summary: report.summary,
    payload: payload || {},
    createdAt: toIsoString(report.created_at),
  };
};

const createReport = async ({ userId, title, summary, payload, postIds = [] }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO admin_reports (user_id, title, summary, payload)
       VALUES (?, ?, ?, ?)`,
      [userId, title, summary, JSON.stringify(payload)]
    );
    const reportId = result.insertId;
    const uniquePostIds = [...new Set(postIds.map((id) => Number(id)).filter(Boolean))];
    for (const postId of uniquePostIds) {
      await connection.execute(
        'INSERT IGNORE INTO admin_report_posts (report_id, post_id) VALUES (?, ?)',
        [reportId, postId]
      );
    }
    await connection.commit();
    return findReportById(reportId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const findReportById = async (id) => {
  const [rows] = await getPool().execute('SELECT * FROM admin_reports WHERE id = ? LIMIT 1', [id]);
  return publicReportFields(rows[0]);
};

const listReports = async ({ limit = 12 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 12, 50));
  const [rows] = await getPool().query(
    `SELECT * FROM admin_reports
     ORDER BY created_at DESC, id DESC
     LIMIT ${safeLimit}`
  );
  return rows.map(publicReportFields);
};

const listReportedPostIds = async () => {
  const [rows] = await getPool().query('SELECT DISTINCT post_id FROM admin_report_posts');
  return rows.map((row) => String(row.post_id));
};

module.exports = {
  createReport,
  findReportById,
  listReportedPostIds,
  listReports,
};
