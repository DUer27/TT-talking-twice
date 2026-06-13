const { createReport, findReportById, listReportedPostIds, listReports } = require('../repositories/reportRepository');
const { listAdminPosts } = require('../repositories/postRepository');
const { extractDynamicKeywords } = require('./postService');
const { generateReportPayload } = require('./aiService');

const statusLabels = {
  open: '待处理',
  resolved: '已处理',
  hidden: '已隐藏',
};

const buildCategorySummary = (posts) => {
  const categoryMap = new Map();
  posts.forEach((post) => {
    const current = categoryMap.get(post.category) || { category: post.category, count: 0, open: 0 };
    current.count += 1;
    if (post.status === 'open') current.open += 1;
    categoryMap.set(post.category, current);
  });
  return [...categoryMap.values()].sort((a, b) => b.count - a.count);
};

const buildKeywordSummary = (posts, limit = 8) => extractDynamicKeywords(posts, limit).map((item) => ({
  word: item.keyword,
  count: item.count,
}));

const buildActionItems = (posts) => {
  const actionItems = [];
  let actionIndex = 1;

  buildCategorySummary(posts).forEach((categoryItem) => {
    const categoryPosts = posts.filter((post) => post.category === categoryItem.category);
    const usedPostIds = new Set();
    const keywords = buildKeywordSummary(categoryPosts, 3);

    keywords.forEach((keywordItem) => {
      const matchedPosts = categoryPosts.filter((post) => `${post.title || ''} ${post.content || ''}`.includes(keywordItem.word));
      if (!matchedPosts.length) return;

      matchedPosts.forEach((post) => usedPostIds.add(String(post.id)));
      actionItems.push({
        id: `action-${actionIndex}`,
        title: `${categoryItem.category}: ${keywordItem.word} 相关反馈处理`,
        category: categoryItem.category,
        keyword: keywordItem.word,
        postIds: matchedPosts.map((post) => String(post.id)),
        postCount: matchedPosts.length,
        status: 'open',
        archived: false,
      });
      actionIndex += 1;
    });

    const remainingPosts = categoryPosts.filter((post) => !usedPostIds.has(String(post.id)));
    if (remainingPosts.length) {
      actionItems.push({
        id: `action-${actionIndex}`,
        title: `${categoryItem.category}: 其他新增反馈处理`,
        category: categoryItem.category,
        postIds: remainingPosts.map((post) => String(post.id)),
        postCount: remainingPosts.length,
        status: 'open',
        archived: false,
      });
      actionIndex += 1;
    }
  });

  return actionItems;
};

const mergeAiActionItems = (localItems, aiItems) => {
  if (!Array.isArray(aiItems) || !aiItems.length) return localItems;
  return localItems.map((item, index) => {
    const matchedAiItem = aiItems.find((aiItem) => aiItem.category && aiItem.category === item.category) || aiItems[index];
    const title = String(matchedAiItem?.title || matchedAiItem?.name || '').trim();
    return title ? { ...item, title } : item;
  });
};

const escapePdfText = (value) => String(value || '')
  .replace(/[\u0100-\uffff]/g, '?')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const buildSimplePdf = (title, body) => {
  const lines = [title, '', ...body.split('\n')].slice(0, 42);
  const textCommands = lines.map((line, index) => `BT /F1 11 Tf 50 ${780 - index * 17} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(textCommands)} >> stream\n${textCommands}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${object}\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

const buildReportPayload = (posts, { source = 'local' } = {}) => {
  const statusCounts = posts.reduce((map, post) => {
    map[post.status] = (map[post.status] || 0) + 1;
    return map;
  }, {});
  const categories = buildCategorySummary(posts);
  const keywords = buildKeywordSummary(posts);
  const topCategory = categories[0];
  const openCount = statusCounts.open || 0;
  const resolvedCount = statusCounts.resolved || 0;
  const hiddenCount = statusCounts.hidden || 0;
  const total = posts.length;

  const summary = total
    ? `本次共汇总 ${total} 条反馈，待处理 ${openCount} 条，已处理 ${resolvedCount} 条，已隐藏 ${hiddenCount} 条。${topCategory ? `高频板块为「${topCategory.category}」，共 ${topCategory.count} 条。` : ''}`
    : '当前暂无可汇总的反馈帖子。';

  const suggestions = [];
  if (topCategory) suggestions.push(`优先跟进「${topCategory.category}」板块，集中处理仍待处理的 ${topCategory.open} 条反馈。`);
  if (keywords[0]) suggestions.push(`围绕高频关键词「${keywords[0].word}」补充线下核实和处理说明。`);
  if (openCount > resolvedCount) suggestions.push('待处理数量高于已处理数量，建议设置每日处理节奏和负责人。');
  if (!suggestions.length) suggestions.push('保持当前处理节奏，并持续关注新发帖子的处理时效。');

  return {
    total,
    statusCounts,
    categories,
    keywords,
    summary,
    suggestions,
    actionItems: buildActionItems(posts),
    source,
    postIds: posts.map((post) => String(post.id)),
    generatedAt: new Date().toISOString(),
  };
};

const generateAdminReport = async (userId) => {
  const posts = await listAdminPosts({ status: 'all', currentUserId: userId, limit: 500 });
  const reportedPostIds = new Set(await listReportedPostIds());
  const unusedPosts = posts.filter((post) => !reportedPostIds.has(String(post.id)));
  if (!unusedPosts.length) {
    const error = new Error('暂无新帖子可生成报告');
    error.statusCode = 409;
    throw error;
  }

  const localPayload = buildReportPayload(unusedPosts);
  const aiPayload = await generateReportPayload({ posts: unusedPosts, localPayload });
  const payload = aiPayload ? {
    ...localPayload,
    ...aiPayload,
    source: 'ai',
    postIds: localPayload.postIds,
    actionItems: mergeAiActionItems(localPayload.actionItems, aiPayload.actionItems),
    generatedAt: new Date().toISOString(),
  } : localPayload;
  const title = `校园反馈处理报告 ${new Date().toLocaleDateString('zh-CN')}`;
  return createReport({ userId, title, summary: payload.summary, payload, postIds: localPayload.postIds });
};

const getReportHistory = async () => listReports({ limit: 12 });

const getReportExport = async (id, format = 'markdown') => {
  const report = await findReportById(id);
  if (!report) {
    const error = new Error('报告不存在');
    error.statusCode = 404;
    throw error;
  }
  const payload = report.payload || {};
  const lines = [
    `# ${report.title}`,
    '',
    `生成时间：${new Date(report.createdAt).toLocaleString('zh-CN')}`,
    '',
    '## 总结',
    report.summary,
    '',
    '## 高频板块',
    ...(payload.categories || []).map((item) => `- ${item.category}: ${item.count} 条，待处理 ${item.open} 条`),
    '',
    '## 高频关键词',
    ...(payload.keywords || []).map((item) => `- ${item.word}: ${item.count} 次`),
    '',
    '## 处理建议',
    ...(payload.suggestions || []).map((item) => `- ${item}`),
    '',
    '## 建议处理',
    ...(payload.actionItems || []).map((item) => `- ${item.title}: ${item.postCount || item.postIds?.length || 0} 个帖子吐槽`),
    '',
  ];
  const markdown = lines.join('\n');
  if (format === 'html' || format === 'word') {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${report.title}</title></head><body>${markdown
      .replace(/^# (.*)$/m, '<h1>$1</h1>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>')}</body></html>`;
    if (format === 'word') {
      return { filename: `${report.title}.doc`, contentType: 'application/msword; charset=utf-8', content: html };
    }
    return { filename: `${report.title}.html`, contentType: 'text/html; charset=utf-8', content: html };
  }
  if (format === 'pdf') {
    return { filename: `${report.title}.pdf`, contentType: 'application/pdf', content: buildSimplePdf(report.title, markdown) };
  }
  return { filename: `${report.title}.md`, contentType: 'text/markdown; charset=utf-8', content: markdown };
};

module.exports = {
  generateAdminReport,
  getReportExport,
  getReportHistory,
  statusLabels,
};
