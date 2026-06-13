const {
  createComment,
  createPost,
  deleteComment,
  findPostById,
  getPostStatsData,
  incrementPostViews,
  listAdminPosts,
  listCommentsByPostId,
  listPosts,
  togglePostFavorite,
  toggleCommentLike,
  togglePostLike,
  updatePostStatus,
  updatePostsStatus,
} = require('../repositories/postRepository');
const { getCategories } = require('./categoryService');
const { listReports } = require('../repositories/reportRepository');

const categoryConfig = [
  { category: '课程吐槽', label: '课程', keywords: ['调课', '作业', '早八', '考试', '签到', '实验', '课件', '进度', '答疑', '分组', '成绩', '选课'] },
  { category: '食堂吐槽', label: '食堂', keywords: ['排队', '价格', '窗口', '菜品', '晚饭', '早餐', '拥挤', '卫生', '支付', '座位', '口味', '份量'] },
  { category: '宿舍生活', label: '宿舍', keywords: ['热水', '空调', '网络', '门禁', '噪音', '洗衣机', '维修', '卫生', '插座', '电费', '楼管', '晾晒'] },
  { category: '校园设施', label: '设施', keywords: ['插座', '照明', '空调', '自习室', '电梯', '快递点', '座椅', '网络', '维修', '饮水机', '路灯', '门禁'] },
  { category: '活动社团', label: '活动', keywords: ['报名', '通知', '场地', '时间', '社团', '活动', '志愿', '比赛', '讲座', '宣传', '排练', '签到'] },
];

const allowedPostStatuses = new Set(['open', 'resolved', 'deleted']);

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

const getCommentText = (post) => {
  const comments = Array.isArray(post.comments) ? post.comments : [];
  return comments
    .map((comment) => (typeof comment === 'string' ? comment : comment?.content))
    .filter(Boolean)
    .join(' ');
};

const getPostAnalysisText = (post) => `${post.title || ''} ${post.content || ''} ${getCommentText(post)}`;

const inferTagsFromText = ({ title, content, allowedTags }) => {
  const normalizeForMatch = (value) => String(value || '').toLowerCase().replace(/\s+/g, '');
  const text = normalizeForMatch(`${title || ''} ${content || ''}`);
  return [...allowedTags]
    .filter((tag) => tag && text.includes(normalizeForMatch(tag)))
    .slice(0, 3);
};

const keywordStopWords = new Set([
  '这个', '那个', '我们', '你们', '他们', '希望', '感觉', '现在', '最近', '已经', '可以', '不能', '没有', '不是', '还是', '一下',
  '一个', '一些', '很多', '比较', '真的', '时候', '问题', '建议', '同学', '老师', '学校', '校园', '吐槽', '反馈', '处理',
  '一下子', '越来越', '管理员', '相关', '新增', '情况', '内容', '发布', '进行', '需要', '应该', '是否', '如果', '因为', '但是',
]);

const getKnownKeywords = (posts = []) => {
  const keywords = new Set(categoryConfig.flatMap((config) => config.keywords));
  posts.forEach((post) => {
    (post.tags || post.tagNames || []).forEach((tag) => keywords.add(tag));
  });
  return [...keywords]
    .map((keyword) => normalizeText(keyword))
    .filter((keyword) => keyword.length >= 2 && !keywordStopWords.has(keyword))
    .sort((a, b) => b.length - a.length);
};

const addKeywordHit = (postScores, postHits, postId, rawText, titleText, keyword) => {
  if (!keyword || !countKeyword(rawText, keyword)) return;
  const safePostId = String(postId);
  const score = titleText.includes(keyword) ? 2 : 1;
  if (!postHits.has(keyword)) postHits.set(keyword, new Set());
  postHits.get(keyword).add(safePostId);
  if (!postScores.has(keyword)) postScores.set(keyword, new Map());
  const keywordScores = postScores.get(keyword);
  keywordScores.set(safePostId, Math.max(keywordScores.get(safePostId) || 0, score));
};

const splitChinesePhrases = (text) => String(text || '')
  .split(/[\s,，。.!！?？;；:：、\-—_()[\]【】《》"“”'‘’/\\]+/u)
  .map((item) => item.trim())
  .filter(Boolean);

const cleanPhraseCandidate = (phrase) => phrase
  .replace(/^(希望|建议|感觉|觉得|发现|反映|关于|这个|那个|最近|现在)+/u, '')
  .replace(/(问题|情况|现象|建议|反馈|一下|一点|很多|比较|真的)+$/u, '')
  .trim();

const countKnownKeywordHits = (value, knownKeywords) => knownKeywords
  .filter((keyword) => value.includes(keyword))
  .length;

const isUsefulKeyword = (keyword) => {
  if (!keyword || keyword.length < 2 || keyword.length > 8) return false;
  if (keywordStopWords.has(keyword)) return false;
  if (/^[0-9]+$/.test(keyword)) return false;
  if (!/[\u4e00-\u9fffA-Za-z]/.test(keyword)) return false;
  return true;
};

const extractDynamicKeywords = (posts, limit = 12) => {
  const postScores = new Map();
  const postHits = new Map();
  const knownKeywords = getKnownKeywords(posts);

  posts.forEach((post, index) => {
    const postId = post.id || `local-${index}`;
    const rawText = getPostAnalysisText(post);
    const titleText = String(post.title || '');

    (rawText.toLowerCase().match(/[a-z0-9]{2,}/g) || []).forEach((word) => {
      if (isUsefulKeyword(word)) addKeywordHit(postScores, postHits, postId, rawText.toLowerCase(), titleText.toLowerCase(), word);
    });

    knownKeywords.forEach((keyword) => addKeywordHit(postScores, postHits, postId, rawText, titleText, keyword));

    splitChinesePhrases(titleText).forEach((phrase) => {
      const cleaned = cleanPhraseCandidate(phrase);
      if (countKnownKeywordHits(cleaned, knownKeywords) > 0) return;
      if (isUsefulKeyword(cleaned) && cleaned.length <= 4) addKeywordHit(postScores, postHits, postId, rawText, titleText, cleaned);
    });

    splitChinesePhrases(rawText).forEach((phrase) => {
      const cleaned = cleanPhraseCandidate(phrase);
      if (!isUsefulKeyword(cleaned)) return;
      const knownHitCount = countKnownKeywordHits(cleaned, knownKeywords);
      if (knownHitCount > 0) return;
      if (cleaned.length <= 4) {
        addKeywordHit(postScores, postHits, postId, rawText, titleText, cleaned);
      }
    });
  });

  return [...postHits.entries()]
    .map(([keyword, ids]) => ({
      keyword,
      count: ids.size,
      score: [...(postScores.get(keyword)?.values() || [])].reduce((total, value) => total + value, 0) || ids.size,
    }))
    .filter((item) => item.count > 0 && isUsefulKeyword(item.keyword))
    .sort((a, b) => b.count - a.count || b.score - a.score || b.keyword.length - a.keyword.length || a.keyword.localeCompare(b.keyword, 'zh-CN'))
    .slice(0, limit);
};

const buildAllowedKeywordMap = (statCategories, categories = []) => new Map(statCategories.map((config) => {
  const staticKeywords = categoryConfig.find((item) => item.category === config.category)?.keywords || [];
  const dynamicTags = categories.find((item) => item.name === config.category)?.tags || [];
  return [config.category, new Set([...staticKeywords, ...dynamicTags].map((item) => normalizeText(item)).filter(Boolean))];
}));

const buildCurrentKeywordCounts = (categoryPosts = [], allowedKeywords = new Set()) => {
  const counts = new Map();
  allowedKeywords.forEach((keyword) => {
    let postCount = 0;
    categoryPosts.forEach((post) => {
      if (countKeyword(getPostAnalysisText(post), keyword)) postCount += 1;
    });
    if (postCount > 0 && isUsefulKeyword(keyword)) counts.set(keyword, postCount);
  });

  extractDynamicKeywords(categoryPosts, 20).forEach((item) => {
    const keyword = normalizeText(item.keyword);
    if (isUsefulKeyword(keyword)) counts.set(keyword, Math.max(counts.get(keyword) || 0, item.count || 0));
  });

  return counts;
};

const getReportKeywordTrends = async (statCategories, categories = [], recentPosts = []) => {
  const reports = await listReports({ limit: 50 });
  const trendMap = Object.fromEntries(statCategories.map((config) => [config.category, new Map()]));
  const allowedKeywordMap = buildAllowedKeywordMap(statCategories, categories);
  const currentKeywordMap = new Map(statCategories.map((config) => {
    const categoryPosts = recentPosts.filter((post) => post.category === config.category);
    const currentKeywords = buildCurrentKeywordCounts(categoryPosts, allowedKeywordMap.get(config.category));
    return [config.category, new Set(currentKeywords.keys())];
  }));
  const isAllowedTrendKeyword = (category, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!isUsefulKeyword(normalizedKeyword)) return false;
    const currentKeywords = currentKeywordMap.get(category);
    if (!currentKeywords || !currentKeywords.has(normalizedKeyword)) return false;
    const allowedKeywords = allowedKeywordMap.get(category);
    if (!allowedKeywords || !allowedKeywords.size) return false;
    return allowedKeywords.has(normalizedKeyword);
  };
  const addKeywordCount = (category, keyword, count) => {
    const normalizedKeyword = normalizeText(keyword);
    const safeCount = Number(count || 0);
    if (!trendMap[category] || !normalizedKeyword || safeCount <= 0) return;
    if (!isAllowedTrendKeyword(category, normalizedKeyword)) return;
    trendMap[category].set(normalizedKeyword, (trendMap[category].get(normalizedKeyword) || 0) + safeCount);
  };

  reports.forEach((report) => {
    const payload = report.payload || {};
    const keywordTrends = payload.keywordTrends || {};
    Object.entries(keywordTrends).forEach(([category, trend]) => {
      const labels = Array.isArray(trend.labels) ? trend.labels : [];
      const points = Array.isArray(trend.points) ? trend.points : [];
      labels.forEach((label, index) => {
        addKeywordCount(category, label, points[index]);
      });
    });

    if (Array.isArray(payload.actionItems)) {
      payload.actionItems.forEach((item) => {
        addKeywordCount(item.category, item.keyword, item.postCount || item.postIds?.length || 0);
      });
    }
  });

  return Object.fromEntries(statCategories.map((config) => {
    const items = [...(trendMap[config.category] || new Map()).entries()]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword, 'zh-CN'))
      .slice(0, 8);
    const topKeyword = items[0] || { keyword: '暂无', count: 0 };
    return [config.category, {
      keyword: topKeyword.keyword,
      mentions: topKeyword.count,
      labels: items.map((item) => item.keyword),
      points: items.map((item) => item.count),
    }];
  }));
};

const buildKeywordTrendsFromPosts = (statCategories, recentPosts = [], categories = []) => {
  const allowedKeywordMap = buildAllowedKeywordMap(statCategories, categories);
  return Object.fromEntries(statCategories.map((config) => {
    const categoryPosts = recentPosts.filter((post) => post.category === config.category);
    const items = [...buildCurrentKeywordCounts(categoryPosts, allowedKeywordMap.get(config.category)).entries()]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword, 'zh-CN'))
      .slice(0, 8);
    const topKeyword = items[0] || { keyword: '暂无', count: 0 };
    return [config.category, {
      keyword: topKeyword.keyword,
      mentions: topKeyword.count,
      labels: items.map((item) => item.keyword),
      points: items.map((item) => item.count),
    }];
  }));
};

const mergeKeywordTrendFallback = (primaryTrends, fallbackTrends) => Object.fromEntries(
  Object.entries(primaryTrends).map(([category, trend]) => {
    const hasTrendData = Array.isArray(trend.labels) && trend.labels.length > 0;
    return [category, hasTrendData ? trend : (fallbackTrends[category] || trend)];
  })
);

const normalizePostQuery = ({ limit = 30, offset = 0, sort = 'latest', category = '', status = '', scope = '' } = {}) => ({
  limit: Math.max(1, Math.min(Number(limit) || 30, 30)),
  offset: Math.max(0, Number(offset) || 0),
  sort: sort === 'hot' ? 'hot' : 'latest',
  category: normalizeText(category),
  status: normalizeText(status),
  scope: ['mine', 'liked', 'favorites'].includes(normalizeText(scope)) ? normalizeText(scope) : '',
});

const getPosts = async ({ currentUserId, query = {} } = {}) => listPosts({ currentUserId, ...normalizePostQuery(query) });

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
  if (!['open', 'resolved', 'deleted'].includes(normalizedStatus)) {
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
  const reportTrendMap = await getReportKeywordTrends(statCategories, categories, statsData.recentPosts);
  const recentTrendMap = buildKeywordTrendsFromPosts(statCategories, statsData.recentPosts, categories);
  const trendMap = mergeKeywordTrendFallback(recentTrendMap, reportTrendMap);

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
    categoriesSnapshot: categories,
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

  const comments = await listCommentsByPostId(id, currentUserId);
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

const toggleCommentReaction = async (commentId, currentUser) => {
  if (!commentId || !/^\d+$/.test(String(commentId))) {
    throw createHttpError('评论不存在', 404);
  }
  if (currentUser?.role === 'admin') {
    throw createHttpError('管理员不能点赞评论', 403);
  }
  const result = await toggleCommentLike({ commentId, userId: currentUser.id });
  if (!result) {
    throw createHttpError('评论不存在', 404);
  }
  if (result.self) {
    throw createHttpError('不能点赞自己的评论');
  }
  return result;
};

const removeComment = async (commentId, currentUser) => {
  if (!commentId || !/^\d+$/.test(String(commentId))) {
    throw createHttpError('评论不存在', 404);
  }
  const result = await deleteComment({
    commentId,
    currentUserId: currentUser.id,
    isAdmin: currentUser.role === 'admin',
  });
  if (!result) {
    throw createHttpError('评论不存在', 404);
  }
  if (result.forbidden) {
    throw createHttpError('只能删除自己的评论', 403);
  }
  const post = await findPostById(result.postId, currentUser.id, { includeHidden: currentUser.role === 'admin' });
  return { ...result, post };
};

const toggleFavorite = async (postId, userId) => {
  if (!postId || !/^\d+$/.test(String(postId))) {
    throw createHttpError('帖子不存在', 404);
  }
  const result = await togglePostFavorite({ postId, userId });
  if (!result) {
    throw createHttpError('帖子不存在', 404);
  }
  return result;
};

const publishPost = async (userId, { title, content, category, tags = [], isAnonymous = true }, { allowAnnouncement = false } = {}) => {
  const normalizedTitle = normalizeText(title);
  const normalizedContent = normalizeContent(content);
  const normalizedCategory = normalizeText(category);

  if (normalizedCategory === '公告' && !allowAnnouncement) {
    throw createHttpError('公告只能由管理员发布', 403);
  }

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
  let normalizedTags = Array.isArray(tags)
    ? [...new Set(tags.map((tag) => normalizeText(tag)).filter(Boolean))].filter((tag) => allowedTags.has(tag)).slice(0, 6)
    : [];

  if (!normalizedTags.length && allowedTags.size) {
    normalizedTags = inferTagsFromText({
      title: normalizedTitle,
      content: normalizedContent,
      allowedTags,
    });
  }

  return createPost({
    userId,
    title: normalizedTitle,
    content: normalizedContent,
    category: normalizedCategory,
    tagNames: normalizedTags,
    isAnonymous: Boolean(isAnonymous),
  });
};

const publishAnnouncement = async (userId, { title, content }) => publishPost(userId, {
  title,
  content,
  category: '公告',
  tags: [],
  isAnonymous: false,
}, { allowAnnouncement: true });

module.exports = {
  changePostStatus,
  changePostsStatus,
  extractDynamicKeywords,
  getPostAnalysisText,
  getAdminPosts,
  getPost,
  getPostStats,
  getPosts,
  publishAnnouncement,
  publishComment,
  publishPost,
  removeComment,
  toggleCommentReaction,
  toggleFavorite,
  toggleLike,
};
