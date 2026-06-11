const { getPool } = require('../database/connection');

const toIsoString = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const publicPostFields = (post, currentUserId = null) => {
  if (!post) return null;
  const isAnonymous = Number(post.is_anonymous) === 1 || post.is_anonymous === true;
  const isMine = Boolean(currentUserId && String(post.user_id) === String(currentUserId));
  const authorName = isAnonymous ? '匿名同学' : (post.author_nickname || post.author_email?.split('@')[0] || '同学');

  return {
    id: String(post.id),
    title: post.title,
    content: post.content,
    category: post.category,
    isAnonymous,
    status: post.status,
    views: Number(post.view_count || 0),
    replies: Number(post.reply_count || 0),
    likeCount: Number(post.like_count || 0),
    author: {
      id: isAnonymous ? null : String(post.user_id),
      name: authorName,
      initial: isAnonymous ? '匿' : authorName.slice(0, 1).toUpperCase(),
    },
    mine: isMine,
    resolved: post.status === 'resolved',
    createdAt: toIsoString(post.created_at),
    updatedAt: toIsoString(post.updated_at),
  };
};

const selectPostSql = `
  SELECT
    posts.*,
    users.email AS author_email,
    users.nickname AS author_nickname
  FROM posts
  INNER JOIN users ON users.id = posts.user_id
`;

const listPosts = async ({ limit = 100, currentUserId = null } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
  const [rows] = await getPool().query(
    `${selectPostSql}
     ORDER BY posts.created_at DESC, posts.id DESC
     LIMIT ${safeLimit}`
  );
  return rows.map((row) => publicPostFields(row, currentUserId));
};

const findPostById = async (id, currentUserId = null) => {
  const [rows] = await getPool().execute(
    `${selectPostSql}
     WHERE posts.id = ?
     LIMIT 1`,
    [id]
  );
  return publicPostFields(rows[0], currentUserId);
};

const createPost = async ({ userId, title, content, category, isAnonymous }) => {
  const [result] = await getPool().execute(
    `INSERT INTO posts (user_id, title, content, category, is_anonymous)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, content, category, isAnonymous ? 1 : 0]
  );
  return findPostById(result.insertId, userId);
};

const incrementPostViews = async (id, currentUserId = null) => {
  await getPool().execute('UPDATE posts SET view_count = view_count + 1, updated_at = updated_at WHERE id = ?', [id]);
  return findPostById(id, currentUserId);
};

module.exports = {
  createPost,
  findPostById,
  incrementPostViews,
  listPosts,
  publicPostFields,
};
