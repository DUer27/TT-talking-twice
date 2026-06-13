const { ai } = require('../config/env');

const hasAiConfig = () => Boolean(ai.apiKey && ai.model);

const parseJsonResponse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    const matched = text.match(/\{[\s\S]*\}/);
    if (!matched) return null;
    try {
      return JSON.parse(matched[0]);
    } catch (__error) {
      return null;
    }
  }
};

const callOpenAiJson = async ({ system, user }) => {
  if (!hasAiConfig()) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ai.timeoutMs);
  try {
    const response = await fetch(`${ai.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${ai.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': ai.userAgent,
      },
      body: JSON.stringify({
        model: ai.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    return parseJsonResponse(data?.choices?.[0]?.message?.content);
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const compactPostsForAi = (posts, limit = 80) => posts.slice(0, limit).map((post) => ({
  id: post.id,
  title: post.title,
  content: String(post.content || '').slice(0, 800),
  category: post.category,
  status: post.status,
  replies: post.replies,
  likes: post.likeCount,
  views: post.views,
  createdAt: post.createdAt,
}));

const analyzeKeywords = async ({ category, posts, localKeywords }) => callOpenAiJson({
  system: [
    '你是校园反馈系统的数据分析助手。',
    '只根据输入帖子提取关键词，不要编造帖子中没有的信息。',
    '关键词必须是具体问题词，避免输出“学校、同学、问题、建议、反馈”等泛词。',
    '返回严格 JSON，格式为 {"keywords":[{"word":"热水","count":3,"reason":"多条帖子提到晚间热水不稳定"}]}。',
  ].join('\n'),
  user: JSON.stringify({ category, posts: compactPostsForAi(posts), localKeywords }),
});

const generateReportPayload = async ({ posts, localPayload }) => callOpenAiJson({
  system: [
    '你是校园反馈系统的数据分析助手。',
    '只根据输入帖子生成周期性处理报告，不要编造未出现的信息。',
    '返回严格 JSON，包含 summary、keywords、categories、risks、suggestions、actionItems、正文字段。',
    'keywords 使用数组：[{"word":"热水","count":3,"reason":"..."}]。',
    'actionItems 使用数组：[{"category":"宿舍生活","title":"宿舍热水时段稳定性处理"}]，只生成标题和类别，不要编造帖子 id。',
    'suggestions 使用数组，每条建议应可执行。',
  ].join('\n'),
  user: JSON.stringify({ posts: compactPostsForAi(posts, 120), localPayload }),
});

module.exports = {
  analyzeKeywords,
  generateReportPayload,
  hasAiConfig,
};
