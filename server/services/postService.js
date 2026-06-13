const {
  createComment,
  createPost,
  findPostById,
  getPostStatsData,
  incrementPostViews,
  listAdminPosts,
  listCommentsByPostId,
  listPosts,
  togglePostLike,
  updatePostStatus,
  updatePostsStatus,
} = require('../repositories/postRepository');
const { analyzeKeywords } = require('./aiService');
const { getCategories } = require('./categoryService');

const categoryConfig = [
  { category: '课程吐槽', label: '课程', keywords: ['调课', '作业', '早八', '考试', '签到', '实验', '课件', '进度', '答疑', '分组', '成绩', '选课'] },
  { category: '食堂吐槽', label: '食堂', keywords: ['排队', '价格', '窗口', '菜品', '晚饭', '早餐', '拥挤', '卫生', '支付', '座位', '口味', '份量'] },
  { category: '宿舍生活', label: '宿舍', keywords: ['热水', '空调', '网络', '门禁', '噪音', '洗衣机', '维修', '卫生', '插座', '电费', '楼管', '晾晒'] },
  { category: '校园设施', label: '设施', keywords: ['插座', '照明', '空调', '自习室', '电梯', '快递点', '座椅', '网络', '维修', '饮水机', '路灯', '门禁'] },
  { category: '活动社团', label: '活动', keywords: ['报名', '通知', '场地', '时间', '社团', '活动', '志愿', '比赛', '讲座', '宣传', '排练', '签到'] },
];

const allowedPostStatuses = new Set(['open', 'resolved', 'hidden']);

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const normalizeContent = (value) => String(value || '').trim();

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const countKeyword = (text, keyword) => {
  if (!keyword) return 0;
  return (text.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
};

const keywordStopWords = new Set([
  '这个', '那个', '我们', '你们', '他们', '希望', '感觉', '现在', '最近', '已经', '可以', '不能', '没有', '不是', '还是', '一下',
  '一个', '一些', '很多', '比较', '真的', '时候', '问题', '建议', '同学', '老师', '学校', '校园', '吐槽', '反馈', '处理',
]);

const extractDynamicKeywords = (posts, limit = 12) => {
  const counts = new Map();

  posts.forEach((post) => {
    const rawText = `${post.title || ''} ${post.content || ''}`;
    const compactText = rawText.replace(/[\s\p{P}\p{S}]+/gu, '');
    const candidates = new Set();

    (rawText.toLowerCase().match(/[a-z0-9]{2,}/g) || []).forEach((word) => {
      if (!keywordStopWords.has(word)) candidates.add(word);
    });

    for (let size = 2; size <= 4; size += 1) {
      for (let index = 0; index <= compactText.length - size; index += 1) {
        const word = compactText.slice(index, index + size);
        if (!/[\u4e00-\u9fff]/.test(word)) continue;
        if (keywordStopWords.has(word)) continue;
        candidates.add(word);
      }
    }

    candidates.forEach((keyword) => {
      counts.set(keyword, (counts.get(keyword) || 0) + countKeyword(rawText, keyword));
    });
  });

  return [...counts.entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.keyword.length - b.keyword.length || a.keyword.localeCompare(b.keyword, 'zh-CN'))
    .slice(0, limit);
};

const getPosts = async ({ currentUserId } = {}) => listPosts({ currentUserId });

const getAdminPosts = async ({ currentUserId, status = 'all' } = {}) => {
  const normalizedStatus = normalizeText(status || 'all');
  const safeStatus = normalizedStatus === 'all' || allowedPostStatuses.has(normalizedStatus) ? normalizedStatus : 'all';
  return listAdminPosts({ currentUserId, status: safeStatus });
};

const changePostStatus = async (postId, currentUserId, { status }) => {
  if (!postId || !/^\d+$/.test(String(postId))) {
    throw createHttpError('帖子不存在', 404);
  }
  const normalizedStatus = normalizeText(status);
  if (!allowedPostStatuses.has(normalizedStatus)) {
    throw createHttpError('帖子状态无效');
  }
  const post = await updatePostStatus({ postId, status: normalizedStatus, currentUserId });
  if (!post) {
    throw createHttpError('帖子不存在', 404);
  }
  return post;
};

const changePostsStatus = async (currentUserId, { postIds, status }) => {
  const normalizedStatus = normalizeText(status);
  if (!['open', 'resolved'].includes(normalizedStatus)) {
    throw createHttpError('帖子状态无效');
  }
  const safePostIds = Array.isArray(postIds)
    ? [...new Set(postIds.map((id) => String(id)).filter((id) => /^\d+$/.test(id)))]
    : [];
  if (!safePostIds.length) {
    throw createHttpError('请选择要处理的帖子');
  }
  if (safePostIds.length > 100) {
    throw createHttpError('一次最多处理 100 条帖子');
  }
  return updatePostsStatus({ postIds: safePostIds, status: normalizedStatus, currentUserId });
};

const getPostStats = async () => {
  const statsData = await getPostStatsData();
  const categories = await getCategories();
  const statCategories = categories.filter((category) => category.name !== '公告').map((category) => ({
    category: category.name,
    label: category.label,
  }));
  const categoryCountMap = new Map(
    statsData.categories.map((row) => [row.category, Number(row.post_count || 0)])
  );

  const trendMap = {};
  for (const config of statCategories) {
    const posts = statsData.recentPosts.filter((post) => post.category === config.category);
    const localKeywordStats = extractDynamicKeywords(posts);
    const aiKeywordResult = posts.length
      ? await analyzeKeywords({ category: config.category, posts, localKeywords: localKeywordStats })
      : null;
    const aiKeywords = Array.isArray(aiKeywordResult?.keywords)
      ? aiKeywordResult.keywords.map((item) => ({
        keyword: String(item.word || item.keyword || '').trim(),
        count: Number(item.count || 0),
      })).filter((item) => item.keyword && item.count > 0)
      : [];
    const keywordStats = aiKeywords.length ? aiKeywords : localKeywordStats;

    const topKeyword = keywordStats[0] || { keyword: '暂无', count: 0 };
    trendMap[config.category] = {
      keyword: topKeyword.keyword,
      mentions: topKeyword.count,
      labels: keywordStats.map((item) => item.keyword),
      points: keywordStats.map((item) => item.count),
    };
  }

  const categoryStats = statCategories.map((config) => ({
    category: config.category,
    label: config.label,
    value: categoryCountMap.get(config.category) || 0,
  }));

  const todayCount = Number(statsData.summary.today_count || 0);
  const yesterdayCount = Number(statsData.summary.yesterday_count || 0);
  const dailyChange = yesterdayCount === 0
    ? (todayCount > 0 ? 100 : 0)
    : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

  const hotCategory = [...categoryStats].sort((a, b) => b.value - a.value)[0]?.category || statCategories[0]?.category || categoryConfig[0].category;

  return {
    summary: {
      total: Number(statsData.summary.total_count || 0),
      today: todayCount,
      yesterday: yesterdayCount,
      dailyChange,
    },
    hotCategory,
    categories: categoryStats,
    trends: trendMap,
    updatedAt: new Date().toISOString(),
  };
};

const getPost = async (id, { currentUserId, increaseViews = false, includeHidden = false } = {}) => {
  if (!id || !/^\d+$/.test(String(id))) {
    throw createHttpError('帖子不存在', 404);
  }

  const post = increaseViews
    ? await incrementPostViews(id, currentUserId, { includeHidden })
    : await findPostById(id, currentUserId, { includeHidden });

  if (!post) {
    throw createHttpError('帖子不存在', 404);
  }

  const comments = await listCommentsByPostId(id);
  return { ...post, comments };
};

const publishComment = async (postId, userId, { content }) => {
  if (!postId || !/^\d+$/.test(String(postId))) {
    throw createHttpError('帖子不存在', 404);
  }

  const normalizedContent = normalizeContent(content);
  if (!normalizedContent) {
    throw createHttpError('评论内容不能为空');
  }
  if (normalizedContent.length > 1000) {
    throw createHttpError('评论内容不能超过 1000 个字符');
  }

  const comment = await createComment({ postId, userId, content: normalizedContent });
  if (!comment) {
    throw createHttpError('帖子不存在', 404);
  }
  const post = await findPostById(postId, userId);
  return { comment, post };
};

const toggleLike = async (postId, userId) => {
  if (!postId || !/^\d+$/.test(String(postId))) {
    throw createHttpError('帖子不存在', 404);
  }
  const result = await togglePostLike({ postId, userId });
  if (!result) {
    throw createHttpError('帖子不存在', 404);
  }
  return result;
};

const publishPost = async (userId, { title, content, category, tags = [], isAnonymous = true }) => {
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

  const categories = await getCategories();
  const matchedCategory = categories.find((categoryItem) => categoryItem.name === normalizedCategory);
  if (!matchedCategory) {
    throw createHttpError('请选择有效的吐槽板块');
  }

  const allowedTags = new Set(matchedCategory.tags || []);
  const normalizedTags = Array.isArray(tags)
    ? [...new Set(tags.map((tag) => normalizeText(tag)).filter(Boolean))].filter((tag) => allowedTags.has(tag)).slice(0, 6)
    : [];

  return createPost({
    userId,
    title: normalizedTitle,
    content: normalizedContent,
    category: normalizedCategory,
    tagNames: normalizedTags,
    isAnonymous: Boolean(isAnonymous),
  });
};

module.exports = {
  changePostStatus,
  changePostsStatus,
  extractDynamicKeywords,
  getAdminPosts,
  getPost,
  getPostStats,
  getPosts,
  publishComment,
  publishPost,
  toggleLike,
};
