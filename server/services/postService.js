const {
  createPost,
  findPostById,
  incrementPostViews,
  listPosts,
} = require('../repositories/postRepository');

const allowedCategories = new Set(['课程吐槽', '食堂吐槽', '宿舍生活', '校园设施', '活动社团']);

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const normalizeContent = (value) => String(value || '').trim();

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getPosts = async ({ currentUserId } = {}) => listPosts({ currentUserId });

const getPost = async (id, { currentUserId, increaseViews = false } = {}) => {
  if (!id || !/^\d+$/.test(String(id))) {
    throw createHttpError('帖子不存在', 404);
  }

  const post = increaseViews
    ? await incrementPostViews(id, currentUserId)
    : await findPostById(id, currentUserId);

  if (!post) {
    throw createHttpError('帖子不存在', 404);
  }

  return post;
};

const publishPost = async (userId, { title, content, category, isAnonymous = true }) => {
  const normalizedTitle = normalizeText(title);
  const normalizedContent = normalizeContent(content);
  const normalizedCategory = normalizeText(category);

  if (!normalizedTitle) {
    throw createHttpError('标题不能为空');
  }

  if (normalizedTitle.length > 60) {
    throw createHttpError('标题不能超过 60 个字符');
  }

  if (!normalizedContent) {
    throw createHttpError('内容不能为空');
  }

  if (normalizedContent.length > 5000) {
    throw createHttpError('内容不能超过 5000 个字符');
  }

  if (!allowedCategories.has(normalizedCategory)) {
    throw createHttpError('请选择有效的吐槽板块');
  }

  return createPost({
    userId,
    title: normalizedTitle,
    content: normalizedContent,
    category: normalizedCategory,
    isAnonymous: Boolean(isAnonymous),
  });
};

module.exports = {
  getPost,
  getPosts,
  publishPost,
};
