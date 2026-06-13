const {
  createPost,
  findPostById,
  getPostStatsData,
  incrementPostViews,
  listPosts,
} = require('../repositories/postRepository');

const categoryConfig = [
  { category: '课程吐槽', label: '课程', keywords: ['调课', '作业', '早八', '考试', '签到', '实验', '课件', '进度', '答疑', '分组', '成绩', '选课'] },
  { category: '食堂吐槽', label: '食堂', keywords: ['排队', '价格', '窗口', '菜品', '晚饭', '早餐', '拥挤', '卫生', '支付', '座位', '口味', '份量'] },
  { category: '宿舍生活', label: '宿舍', keywords: ['热水', '空调', '网络', '门禁', '噪音', '洗衣机', '维修', '卫生', '插座', '电费', '楼管', '晾晒'] },
  { category: '校园设施', label: '设施', keywords: ['插座', '照明', '空调', '自习室', '电梯', '快递点', '座椅', '网络', '维修', '饮水机', '路灯', '门禁'] },
  { category: '活动社团', label: '活动', keywords: ['报名', '通知', '场地', '时间', '社团', '活动', '志愿', '比赛', '讲座', '宣传', '排练', '签到'] },
];

const allowedCategories = new Set(categoryConfig.map((item) => item.category));

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

const getPosts = async ({ currentUserId } = {}) => listPosts({ currentUserId });

const getPostStats = async () => {
  const statsData = await getPostStatsData();
  const categoryCountMap = new Map(
    statsData.categories.map((row) => [row.category, Number(row.post_count || 0)])
  );

  const trendMap = {};
  for (const config of categoryConfig) {
    const posts = statsData.recentPosts.filter((post) => post.category === config.category);
    const keywordStats = config.keywords.map((keyword) => ({
      keyword,
      count: posts.reduce((sum, post) => sum + countKeyword(`${post.title || ''} ${post.content || ''}`, keyword), 0),
    }));
    keywordStats.sort((a, b) => b.count - a.count || config.keywords.indexOf(a.keyword) - config.keywords.indexOf(b.keyword));

    const topKeyword = keywordStats[0] || { keyword: '暂无', count: 0 };
    trendMap[config.category] = {
      keyword: topKeyword.keyword,
      mentions: topKeyword.count,
      labels: keywordStats.map((item) => item.keyword),
      points: keywordStats.map((item) => item.count),
    };
  }

  const categoryStats = categoryConfig.map((config) => ({
    category: config.category,
    label: config.label,
    value: categoryCountMap.get(config.category) || 0,
  }));

  const todayCount = Number(statsData.summary.today_count || 0);
  const yesterdayCount = Number(statsData.summary.yesterday_count || 0);
  const dailyChange = yesterdayCount === 0
    ? (todayCount > 0 ? 100 : 0)
    : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

  const hotCategory = [...categoryStats].sort((a, b) => b.value - a.value)[0]?.category || categoryConfig[0].category;

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
  getPostStats,
  getPosts,
  publishPost,
};
