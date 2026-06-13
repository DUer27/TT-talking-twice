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
    deleteMarkedAt: toIsoString(post.delete_marked_at),
    deleteExpiresAt: toIsoString(post.delete_marked_at ? new Date(new Date(post.delete_marked_at).getTime() + 5 * 60 * 1000) : null),
    views: Number(post.view_count || 0),
    replies: Number(post.reply_count || 0),
    likeCount: Number(post.like_count || 0),
    favoriteCount: Number(post.favorite_count || 0),
    liked: Boolean(Number(post.liked_by_current_user || 0)),
    favorited: Boolean(Number(post.favorited_by_current_user || 0)),
    tags: post.tag_names ? String(post.tag_names).split(',').filter(Boolean) : [],
    author: {
      id: isAnonymous ? null : String(post.user_id),
      name: authorName,
      initial: isAnonymous ? '匿' : authorName.slice(0, 1).toUpperCase(),
    },
    mine: isMine,
    resolved: post.status === 'resolved',
    deleted: post.status === 'deleted',
    createdAt: toIsoString(post.created_at),
    updatedAt: toIsoString(post.updated_at),
  };
};

const publicCommentFields = (comment) => {
  if (!comment) return null;
  const authorName = comment.author_nickname || comment.author_email?.split('@')[0] || '同学';
  return {
    id: String(comment.id),
    postId: String(comment.post_id),
    content: comment.content,
    author: {
      id: String(comment.user_id),
      name: authorName,
      initial: authorName.slice(0, 1).toUpperCase(),
    },
    createdAt: toIsoString(comment.created_at),
    updatedAt: toIsoString(comment.updated_at),
  };
};

const selectPostSql = (currentUserId = null) => `
  SELECT
    posts.*,
    users.email AS author_email,
    users.nickname AS author_nickname,
    (
      SELECT GROUP_CONCAT(post_tags.tag_name ORDER BY post_tags.tag_name SEPARATOR ',')
      FROM post_tags
      WHERE post_tags.post_id = posts.id
    ) AS tag_names,
    ${currentUserId ? 'EXISTS(SELECT 1 FROM post_likes WHERE post_likes.post_id = posts.id AND post_likes.user_id = ?)' : '0'} AS liked_by_current_user,
    ${currentUserId ? 'EXISTS(SELECT 1 FROM post_favorites WHERE post_favorites.post_id = posts.id AND post_favorites.user_id = ?)' : '0'} AS favorited_by_current_user
  FROM posts
  INNER JOIN users ON users.id = posts.user_id
`;

const purgeExpiredDeletedPosts = async () => {
  const [result] = await getPool().execute(
    "DELETE FROM posts WHERE status = 'deleted' AND delete_marked_at <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)"
  );
  return result.affectedRows || 0;
};

const activePostWhereSql = "posts.status <> 'deleted'";

const buildListOrderSql = (sort = 'latest') => {
  if (sort === 'hot') return 'ORDER BY (posts.like_count + posts.favorite_count) DESC, posts.created_at DESC, posts.id DESC';
  return 'ORDER BY posts.created_at DESC, posts.id DESC';
};

const listPosts = async ({ limit = 30, offset = 0, currentUserId = null, includeHidden = false, sort = 'latest', category = '', status = '', scope = '' } = {}) => {
  await purgeExpiredDeletedPosts();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 30));
  const safeOffset = Math.max(0, Number(offset) || 0);
  const params = currentUserId ? [currentUserId, currentUserId] : [];
  const whereParts = [includeHidden ? activePostWhereSql : "posts.status NOT IN ('hidden', 'deleted')"];
  if (sort === 'hot') {
    whereParts.push('(posts.like_count + posts.favorite_count) > 0');
  }
  if (category) {
    whereParts.push('posts.category = ?');
    params.push(category);
  }
  if (status) {
    whereParts.push('posts.status = ?');
    params.push(status);
  }
  if (['mine', 'liked', 'favorites'].includes(scope) && !currentUserId) {
    whereParts.push('1 = 0');
  }
  if (scope === 'mine' && currentUserId) {
    whereParts.push('posts.user_id = ?');
    params.push(currentUserId);
  }
  if (scope === 'liked' && currentUserId) {
    whereParts.push('EXISTS(SELECT 1 FROM post_likes liked_scope WHERE liked_scope.post_id = posts.id AND liked_scope.user_id = ?)');
    params.push(currentUserId);
  }
  if (scope === 'favorites' && currentUserId) {
    whereParts.push('EXISTS(SELECT 1 FROM post_favorites favorite_scope WHERE favorite_scope.post_id = posts.id AND favorite_scope.user_id = ?)');
    params.push(currentUserId);
  }
  const [rows] = await getPool().execute(
    `${selectPostSql(currentUserId)}
     WHERE ${whereParts.join(' AND ')}
     ${buildListOrderSql(sort)}
     LIMIT ${safeLimit} OFFSET ${safeOffset}`,
    params
  );
  return rows.map((row) => publicPostFields(row, currentUserId));
};

const findPostById = async (id, currentUserId = null, { includeHidden = false, includeDeleted = false } = {}) => {
  await purgeExpiredDeletedPosts();
  const params = currentUserId ? [currentUserId, currentUserId, id] : [id];
  const visibilitySql = includeDeleted
    ? ''
    : (includeHidden ? "AND posts.status <> 'deleted'" : "AND posts.status NOT IN ('hidden', 'deleted')");
  const [rows] = await getPool().execute(
    `${selectPostSql(currentUserId)}
     WHERE posts.id = ?
     ${visibilitySql}
     LIMIT 1`,
    params
  );
  return publicPostFields(rows[0], currentUserId);
};

const listAdminPosts = async ({ limit = 200, status = 'all', currentUserId = null } = {}) => {
  await purgeExpiredDeletedPosts();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 500));
  const params = currentUserId ? [currentUserId, currentUserId] : [];
  let statusSql = '';
  if (status && status !== 'all') {
    statusSql = 'WHERE posts.status = ?';
    params.push(status);
  }
  const [rows] = await getPool().execute(
    `${selectPostSql(currentUserId)}
     ${statusSql}
     ORDER BY posts.created_at DESC, posts.id DESC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map((row) => publicPostFields(row, currentUserId));
};

const updatePostStatus = async ({ postId, status, currentUserId = null }) => {
  await purgeExpiredDeletedPosts();
  if (status === 'deleted') {
    await getPool().execute(
      "UPDATE posts SET status = 'deleted', delete_marked_at = UTC_TIMESTAMP() WHERE id = ? AND status <> 'deleted'",
      [postId]
    );
  } else {
    await getPool().execute('UPDATE posts SET status = ?, delete_marked_at = NULL WHERE id = ?', [status, postId]);
  }
  return findPostById(postId, currentUserId, { includeHidden: true, includeDeleted: true });
};

const updatePostsStatus = async ({ postIds, status, currentUserId = null }) => {
  await purgeExpiredDeletedPosts();
  const safeIds = [...new Set(postIds.map((id) => Number(id)).filter(Boolean))];
  if (!safeIds.length) return [];
  const placeholders = safeIds.map(() => '?').join(', ');
  if (status === 'deleted') {
    await getPool().execute(
      `UPDATE posts SET status = 'deleted', delete_marked_at = UTC_TIMESTAMP() WHERE id IN (${placeholders}) AND status <> 'deleted'`,
      safeIds
    );
  } else {
    await getPool().execute(
      `UPDATE posts SET status = ?, delete_marked_at = NULL WHERE id IN (${placeholders})`,
      [status, ...safeIds]
    );
  }
  const [rows] = await getPool().execute(
    `${selectPostSql(currentUserId)}
     WHERE posts.id IN (${placeholders})
     ORDER BY posts.created_at DESC, posts.id DESC`,
    currentUserId ? [currentUserId, currentUserId, ...safeIds] : safeIds
  );
  return rows.map((row) => publicPostFields(row, currentUserId));
};

const listCommentsByPostId = async (postId) => {
  const [rows] = await getPool().execute(
    `SELECT comments.*, users.email AS author_email, users.nickname AS author_nickname
     FROM comments
     INNER JOIN users ON users.id = comments.user_id
     WHERE comments.post_id = ? AND comments.status = 'visible'
     ORDER BY comments.created_at ASC, comments.id ASC`,
    [postId]
  );
  return rows.map(publicCommentFields);
};

const createPost = async ({ userId, title, content, category, isAnonymous, tagNames = [] }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO posts (user_id, title, content, category, is_anonymous)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, content, category, isAnonymous ? 1 : 0]
    );
    for (const tagName of tagNames) {
      try {
        await connection.execute('INSERT IGNORE INTO post_tags (post_id, tag_name) VALUES (?, ?)', [result.insertId, tagName]);
      } catch (_error) {
        // Tags are best-effort enrichment; they should never block the post itself.
      }
    }
    await connection.commit();
    return findPostById(result.insertId, userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const incrementPostViews = async (id, currentUserId = null, { includeHidden = false } = {}) => {
  await purgeExpiredDeletedPosts();
  const visibilitySql = includeHidden ? "AND status <> 'deleted'" : "AND status NOT IN ('hidden', 'deleted')";
  await getPool().execute(
    `UPDATE posts SET view_count = view_count + 1, updated_at = updated_at WHERE id = ? ${visibilitySql}`,
    [id]
  );
  return findPostById(id, currentUserId, { includeHidden });
};

const createComment = async ({ postId, userId, content }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [postRows] = await connection.execute(
      "SELECT id FROM posts WHERE id = ? AND status NOT IN ('hidden', 'deleted') FOR UPDATE",
      [postId]
    );
    if (!postRows.length) {
      await connection.rollback();
      return null;
    }
    const [result] = await connection.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );
    await connection.execute(
      'UPDATE posts SET reply_count = reply_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [postId]
    );
    await connection.commit();

    const [rows] = await getPool().execute(
      `SELECT comments.*, users.email AS author_email, users.nickname AS author_nickname
       FROM comments
       INNER JOIN users ON users.id = comments.user_id
       WHERE comments.id = ?
       LIMIT 1`,
      [result.insertId]
    );
    return publicCommentFields(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const togglePostLike = async ({ postId, userId }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [postRows] = await connection.execute(
      "SELECT id FROM posts WHERE id = ? AND status NOT IN ('hidden', 'deleted') FOR UPDATE",
      [postId]
    );
    if (!postRows.length) {
      await connection.rollback();
      return null;
    }
    const [likeRows] = await connection.execute(
      'SELECT post_id FROM post_likes WHERE post_id = ? AND user_id = ? LIMIT 1',
      [postId, userId]
    );
    const liked = likeRows.length === 0;
    if (liked) {
      await connection.execute('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      await connection.execute('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [postId]);
    } else {
      await connection.execute('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      await connection.execute('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [postId]);
    }
    await connection.commit();
    const post = await findPostById(postId, userId);
    return { liked, post };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const togglePostFavorite = async ({ postId, userId }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [postRows] = await connection.execute(
      "SELECT id FROM posts WHERE id = ? AND status NOT IN ('hidden', 'deleted') FOR UPDATE",
      [postId]
    );
    if (!postRows.length) {
      await connection.rollback();
      return null;
    }
    const [favoriteRows] = await connection.execute(
      'SELECT post_id FROM post_favorites WHERE post_id = ? AND user_id = ? LIMIT 1',
      [postId, userId]
    );
    const favorited = favoriteRows.length === 0;
    if (favorited) {
      await connection.execute('INSERT INTO post_favorites (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      await connection.execute('UPDATE posts SET favorite_count = favorite_count + 1 WHERE id = ?', [postId]);
    } else {
      await connection.execute('DELETE FROM post_favorites WHERE post_id = ? AND user_id = ?', [postId, userId]);
      await connection.execute('UPDATE posts SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = ?', [postId]);
    }
    await connection.commit();
    const post = await findPostById(postId, userId);
    return { favorited, post };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getPostStatsData = async () => {
  await purgeExpiredDeletedPosts();
  const [summaryRows] = await getPool().query(`
    SELECT
      COUNT(*) AS total_count,
      SUM(CASE WHEN DATE(created_at) = UTC_DATE() THEN 1 ELSE 0 END) AS today_count,
      SUM(CASE WHEN DATE(created_at) = DATE_SUB(UTC_DATE(), INTERVAL 1 DAY) THEN 1 ELSE 0 END) AS yesterday_count
    FROM posts
    WHERE status <> 'deleted'
  `);

  const [categoryRows] = await getPool().query(`
    SELECT category, COUNT(*) AS post_count
    FROM posts
    WHERE status <> 'deleted'
    GROUP BY category
  `);

  const [recentRows] = await getPool().query(`
    SELECT category, title, content, created_at
    FROM posts
    WHERE status <> 'deleted' AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 DAY)
    ORDER BY created_at DESC, id DESC
    LIMIT 1000
  `);

  return {
    summary: summaryRows[0] || {},
    categories: categoryRows,
    recentPosts: recentRows,
  };
};

module.exports = {
  createPost,
  createComment,
  findPostById,
  getPostStatsData,
  incrementPostViews,
  listAdminPosts,
  listCommentsByPostId,
  listPosts,
  purgeExpiredDeletedPosts,
  publicPostFields,
  togglePostFavorite,
  togglePostLike,
  updatePostStatus,
  updatePostsStatus,
};
