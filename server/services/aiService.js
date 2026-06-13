const http = require('http');
const https = require('https');
const { ai } = require('../config/env');

const hasAiConfig = () => Boolean(ai.apiKey && ai.model);
let lastAiFailure = null;

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

const requestJson = (url, { headers, body, timeoutMs }) => new Promise((resolve, reject) => {
  const target = new URL(url);
  const client = target.protocol === 'http:' ? http : https;
  const payload = JSON.stringify(body);
  const req = client.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || undefined,
    path: `${target.pathname}${target.search}`,
    method: 'POST',
    headers: {
      ...headers,
      'Content-Length': Buffer.byteLength(payload),
    },
    timeout: timeoutMs,
  }, (res) => {
    let responseText = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { responseText += chunk; });
    res.on('end', () => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        statusText: res.statusMessage,
        text: responseText,
      });
    });
  });

  req.on('timeout', () => {
    req.destroy(new Error(`AI request timed out after ${timeoutMs}ms`));
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

const logAiFailure = (message, detail = '') => {
  lastAiFailure = {
    message,
    detail: String(detail || '').slice(0, 1000),
    at: new Date().toISOString(),
  };
  console.warn(`[AI] ${message}${detail ? `: ${detail}` : ''}`);
};

const clearLastAiFailure = () => { lastAiFailure = null; };

const getLastAiFailure = () => lastAiFailure;

const callOpenAiJson = async ({ system, user }) => {
  clearLastAiFailure();
  if (!hasAiConfig()) {
    logAiFailure('missing AI config', 'OPENAI_API_KEY or OPENAI_MODEL is empty');
    return null;
  }

  try {
    const response = await requestJson(`${ai.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      timeoutMs: ai.timeoutMs,
      headers: {
        Authorization: `Bearer ${ai.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': ai.userAgent,
      },
      body: {
        model: ai.model,
        temperature: 0.2,
        max_tokens: ai.maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      },
    });
    if (!response.ok) {
      logAiFailure(`request failed with HTTP ${response.status}`, response.text.slice(0, 500));
      return null;
    }
    const data = parseJsonResponse(response.text);
    const content = data?.choices?.[0]?.message?.content;
    const parsedContent = parseJsonResponse(content);
    if (!parsedContent) logAiFailure('response did not contain parseable JSON', response.text.slice(0, 500));
    return parsedContent;
  } catch (error) {
    logAiFailure('request error', error.message);
    return null;
  }
};

const compactPostsForAi = (posts, limit = 80) => posts.slice(0, limit).map((post) => ({
  id: post.id,
  title: post.title,
  content: String(post.content || '').slice(0, 800),
  comments: Array.isArray(post.comments)
    ? post.comments.map((comment) => String(typeof comment === 'string' ? comment : comment?.content || '').slice(0, 300)).filter(Boolean).slice(0, 20)
    : [],
  category: post.category,
  status: post.status,
  replies: post.replies,
  likes: post.likeCount,
  views: post.views,
  createdAt: post.createdAt,
}));

const generateReportPayload = async ({ posts, localPayload, existingCategories = [] }) => callOpenAiJson({
  system: [
    '你是校园反馈系统的数据分析助手。',
    '只根据输入帖子生成周期性处理报告，不要编造未出现的信息。',
    '同一帖子内标题、正文或评论重复出现同一句话，只能算作该帖子的一次信号。不要因为标题和内容相同而生成两个相同建议。',
    '返回严格 JSON，包含 summary、keywords、categories、risks、suggestions、actionItems、正文段落。内容要精炼，summary 不超过 120 字，suggestions 不超过 4 条，正文段落不超过 180 字。',
    'keywords 使用数组，如 [{"word":"热水","count":3,"reason":"..."}]。',
    'actionItems 使用数组，如 [{"category":"宿舍生活","title":"宿舍热水时段稳定性处理"}]，只生成标题和类别，不要编造帖子 id；同一类别同一问题只输出一条。',
    'suggestions 使用数组，每条建议应可执行。',
    '同时检查是否需要补充新标签，返回 suggestedTags 数组，如 [{"category":"校园设施","tag":"厕所","reason":"多条帖子反馈厕所卫生"}]。只建议具体、可复用的问题标签，不要输出“问题、建议、学校、同学”等泛词。必须先查看 existingCategories；如果当前板块已有更短、更通用的标签覆盖该问题，不要输出新标签，例如已有“场地”时不要输出“社团场地”“社团场地不足”。',
  ].join('\n'),
  user: JSON.stringify({ posts: compactPostsForAi(posts, 120), localPayload, existingCategories }),
});

module.exports = {
  getLastAiFailure,
  generateReportPayload,
  hasAiConfig,
};
