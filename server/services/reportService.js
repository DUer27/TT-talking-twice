const { createReport, findReportById, listReports } = require('../repositories/reportRepository');
const { listAdminPosts } = require('../repositories/postRepository');
const { addSuggestedTagsToCategories, getCategories } = require('./categoryService');
const { extractDynamicKeywords, getPostAnalysisText } = require('./postService');
const { generateReportPayload, getLastAiFailure } = require('./aiService');

const statusLabels = {
  open: '待处理',
  resolved: '已处理',
  deleted: '待删除',
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

const buildKeywordTrendMap = (posts, categories) => Object.fromEntries(categories.map((categoryItem) => {
  const categoryPosts = posts.filter((post) => post.category === categoryItem.category);
  const keywords = buildKeywordSummary(categoryPosts, 8);
  const topKeyword = keywords[0] || { word: '暂无', count: 0 };
  return [categoryItem.category, {
    keyword: topKeyword.word,
    mentions: topKeyword.count,
    labels: keywords.map((item) => item.word),
    points: keywords.map((item) => item.count),
  }];
}));

const normalizeKeywordItems = (items = []) => (Array.isArray(items) ? items : [])
  .map((item) => {
    if (typeof item === 'string') return { word: normalizeActionTitle(item), count: 1 };
    return {
      word: normalizeActionTitle(item?.word || item?.keyword || item?.name || item?.tag),
      count: Number(item?.count || item?.mentions || item?.postCount || item?.value || 1),
      category: normalizeActionTitle(item?.category || item?.categoryName || ''),
      reason: item?.reason || '',
    };
  })
  .filter((item) => item.word && item.count > 0);

const getCategoryName = (item) => normalizeActionTitle(item?.category || item?.categoryName || item?.name || item?.label);

const normalizeAiKeywordTrends = (aiPayload = {}, localPayload = {}, allowedCategories = []) => {
  const statCategories = Array.isArray(localPayload.categories) ? localPayload.categories : [];
  const localCategoryNames = statCategories.map((item) => item.category).filter(Boolean);
  const allowedCategoryNames = (Array.isArray(allowedCategories) ? allowedCategories : [])
    .map((item) => normalizeActionTitle(item?.name || item?.category || item?.label || item))
    .filter(Boolean);
  const categoryNames = [...new Set([...localCategoryNames, ...allowedCategoryNames])];
  const localCategorySet = new Set(localCategoryNames);
  const trendMap = Object.fromEntries(categoryNames.map((category) => [category, new Map()]));
  const localKeywordCategoryMap = new Map();

  Object.entries(localPayload.keywordTrends || {}).forEach(([category, trend]) => {
    const labels = Array.isArray(trend?.labels) ? trend.labels : [];
    labels.forEach((label) => {
      const keyword = normalizeActionTitle(label);
      if (!keyword) return;
      if (!localKeywordCategoryMap.has(keyword)) localKeywordCategoryMap.set(keyword, new Set());
      localKeywordCategoryMap.get(keyword).add(category);
    });
  });

  const inferCategory = (item) => {
    const category = getCategoryName(item);
    if (trendMap[category]) return category;
    const matchedCategories = localKeywordCategoryMap.get(item.word);
    if (matchedCategories?.size === 1) return [...matchedCategories][0];
    return categoryNames.length === 1 ? categoryNames[0] : '';
  };

  const addKeyword = (category, word, count) => {
    if (!trendMap[category] || !word || Number(count || 0) <= 0) return;
    trendMap[category].set(word, (trendMap[category].get(word) || 0) + Number(count));
  };
  const addKeywordItems = (items, fallbackCategory = '') => {
    normalizeKeywordItems(items).forEach((item) => {
      const category = trendMap[item.category] ? item.category : fallbackCategory || inferCategory(item);
      addKeyword(category, item.word, item.count);
    });
  };
  const addTrend = (category, trend) => {
    if (!trend) return;
    if (Array.isArray(trend)) {
      addKeywordItems(trend, category);
      return;
    }
    const labels = Array.isArray(trend.labels) ? trend.labels : [];
    const points = Array.isArray(trend.points) ? trend.points : [];
    labels.forEach((label, index) => addKeyword(category, normalizeActionTitle(label), points[index] || 1));
    addKeywordItems(trend.keywords || trend.items, category);
  };

  if (Array.isArray(aiPayload.keywordTrends)) {
    addKeywordItems(aiPayload.keywordTrends);
  } else {
    Object.entries(aiPayload.keywordTrends || {}).forEach(([category, trend]) => addTrend(category, trend));
  }

  Object.entries(aiPayload.trends || {}).forEach(([category, trend]) => addTrend(category, trend));

  (Array.isArray(aiPayload.categories) ? aiPayload.categories : []).forEach((categoryItem) => {
    const category = getCategoryName(categoryItem);
    addKeywordItems(categoryItem?.keywords || categoryItem?.keywordItems || categoryItem?.tags, category);
    addTrend(category, categoryItem?.keywordTrends || categoryItem?.trend);
  });

  addKeywordItems(aiPayload.keywords);
  addKeywordItems(aiPayload.actionItems);

  return Object.fromEntries(categoryNames.map((category) => {
    const items = [...(trendMap[category] || new Map()).entries()]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword, 'zh-CN'))
      .slice(0, 8);
    const topKeyword = items[0] || { keyword: '暂无', count: 0 };
    if (!localCategorySet.has(category) && !items.length) return null;
    return [category, {
      keyword: topKeyword.keyword,
      mentions: topKeyword.count,
      labels: items.map((item) => item.keyword),
      points: items.map((item) => item.count),
    }];
  }).filter(Boolean));
};

const keywordTrendsToSuggestedTags = (keywordTrends = {}) => Object.entries(keywordTrends).flatMap(([category, trend]) => (
  Array.isArray(trend.labels) ? trend.labels : []
).map((tag) => ({ category, tag })));

const collectExistingKeywordTrends = async () => {
  const keywordMap = new Map();
  const reports = await listReports({ limit: 50 });
  reports.forEach((report) => {
    Object.entries(report.payload?.keywordTrends || {}).forEach(([category, trend]) => {
      if (!keywordMap.has(category)) keywordMap.set(category, new Set());
      const labels = Array.isArray(trend.labels) ? trend.labels : [];
      labels.forEach((label) => {
        const keyword = normalizeActionTitle(label);
        if (keyword) keywordMap.get(category).add(keyword);
      });
    });
  });
  return Object.fromEntries([...keywordMap.entries()].map(([category, keywords]) => [category, [...keywords]]));
};

const normalizeActionTitle = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const parseDateBoundary = (value, { endOfDay = false } = {}) => {
  const normalized = normalizeActionTitle(value);
  if (!normalized) return null;
  const date = new Date(endOfDay ? `${normalized}T23:59:59.999` : `${normalized}T00:00:00.000`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeReportScope = (category) => {
  const normalized = normalizeActionTitle(category);
  return !normalized || normalized === 'all' || normalized === '全部' ? '' : normalized;
};

const normalizePostIds = (postIds = []) => [...new Set(postIds.map((id) => String(id)))].sort();

const getActionKey = (item) => {
  const postIds = normalizePostIds(item.postIds || []);
  const category = item.category || '';
  if (postIds.length) return `${category}|posts:${postIds.join(',')}`;
  return `${category}|title:${normalizeActionTitle(item.title || item.name)}`;
};

const issueStopWords = new Set([
  '学校', '校园', '同学', '老师', '问题', '建议', '反馈', '吐槽', '地方', '这个', '那个', '一个', '一下', '没有', '不是', '可以', '需要', '希望',
]);

const getIssueTokens = (post) => {
  const tokens = new Set();
  const addToken = (token) => {
    const normalized = normalizeActionTitle(token);
    if (!normalized || normalized.length < 2 || normalized.length > 6) return;
    if (issueStopWords.has(normalized)) return;
    if ([...issueStopWords].some((word) => normalized.includes(word))) return;
    if (/^[0-9]+$/.test(normalized)) return;
    tokens.add(normalized);
  };

  (post.tags || post.tagNames || []).forEach(addToken);
  [post.title, post.content, ...(Array.isArray(post.comments) ? post.comments.map((comment) => comment?.content || comment) : [])]
    .filter(Boolean)
    .forEach((value) => {
      const chineseRuns = String(value).match(/[\u4e00-\u9fff]{2,}/g) || [];
      chineseRuns.forEach((run) => {
        for (let size = 2; size <= Math.min(4, run.length); size += 1) {
          for (let index = 0; index <= run.length - size; index += 1) addToken(run.slice(index, index + size));
        }
      });
  });

  return tokens;
};

const findSharedIssueToken = (leftTokens, rightTokens) => [...leftTokens]
  .sort((a, b) => a.length - b.length || a.localeCompare(b, 'zh-CN'))
  .find((token) => rightTokens.has(token));

const getGroupIssueKeyword = (group) => {
  const tokenCounts = new Map();
  group.posts.forEach((post) => {
    getIssueTokens(post).forEach((token) => tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1));
  });
  const minCount = group.posts.length > 1 ? 2 : 1;
  const cleanTokens = [...tokenCounts.entries()]
    .filter(([token, count]) => count >= minCount)
    .filter(([token]) => !/[了的地得吗呢吧啊呀哦嘛]$/.test(token))
    .filter(([token]) => !/^(太|很|真|都|没|不)/.test(token))
    .filter(([token]) => !token.includes('太'));
  if (group.posts.length === 1) {
    return cleanTokens
      .sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0], 'zh-CN'))[0]?.[0];
  }
  return [...tokenCounts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length || a[0].localeCompare(b[0], 'zh-CN'))[0]?.[0];
};

const groupRemainingPosts = (posts) => {
  const groups = [];
  posts.forEach((post) => {
    const tokens = getIssueTokens(post);
    const matchedGroup = groups.find((group) => findSharedIssueToken(tokens, group.tokens));
    if (matchedGroup) {
      matchedGroup.posts.push(post);
      tokens.forEach((token) => matchedGroup.tokens.add(token));
      return;
    }
    groups.push({ posts: [post], tokens });
  });
  return groups;
};

const dedupeActionItems = (items = []) => {
  const seen = new Map();
  items.forEach((item) => {
    const postIds = normalizePostIds(item.postIds || []);
    const title = normalizeActionTitle(item.title || item.name);
    const key = getActionKey({ ...item, title, postIds });
    if (!title && !postIds.length) return;
    if (!seen.has(key)) {
      seen.set(key, { ...item, title, postIds, postCount: postIds.length || item.postCount || 0 });
      return;
    }
    const existing = seen.get(key);
    seen.set(key, {
      ...existing,
      postIds: [...new Set([...(existing.postIds || []), ...postIds])],
      postCount: Math.max(existing.postCount || 0, item.postCount || 0, postIds.length),
    });
  });
  return [...seen.values()].map((item, index) => ({ ...item, id: item.id || `action-${index + 1}` }));
};

const buildActionItems = (posts) => {
  const actionItems = [];
  let actionIndex = 1;

  buildCategorySummary(posts).forEach((categoryItem) => {
    const categoryPosts = posts.filter((post) => post.category === categoryItem.category);
    const usedPostIds = new Set();
    const keywords = buildKeywordSummary(categoryPosts, 3);

    keywords.forEach((keywordItem) => {
      const matchedPosts = categoryPosts.filter((post) => getPostAnalysisText(post).includes(keywordItem.word));
      const newMatchedPosts = matchedPosts.filter((post) => !usedPostIds.has(String(post.id)));
      if (!newMatchedPosts.length) return;

      newMatchedPosts.forEach((post) => usedPostIds.add(String(post.id)));
      actionItems.push({
        id: `action-${actionIndex}`,
        title: `${categoryItem.category}: ${keywordItem.word} 相关反馈处理`,
        category: categoryItem.category,
        keyword: keywordItem.word,
        postIds: newMatchedPosts.map((post) => String(post.id)),
        postCount: newMatchedPosts.length,
        status: 'open',
        archived: false,
      });
      actionIndex += 1;
    });

    groupRemainingPosts(categoryPosts.filter((post) => !usedPostIds.has(String(post.id)))).forEach((group) => {
      const postIds = group.posts.map((post) => String(post.id));
      const keyword = getGroupIssueKeyword(group);
      const title = group.posts.length === 1
        ? `${categoryItem.category}: ${group.posts[0].title || '其他新增反馈'} 处理`
        : `${categoryItem.category}: ${keyword || '相似新增反馈'} 相关反馈处理`;
      actionItems.push({
        id: `action-${actionIndex}`,
        title,
        category: categoryItem.category,
        keyword,
        postIds,
        postCount: postIds.length,
        status: 'open',
        archived: false,
      });
      actionIndex += 1;
    });
  });

  return dedupeActionItems(actionItems);
};

const mergeAiActionItems = (localItems, aiItems) => {
  if (!Array.isArray(aiItems) || !aiItems.length) return localItems;
  const usedAiIndexes = new Set();
  const merged = localItems.map((item, index) => {
    const itemPostIds = new Set(normalizePostIds(item.postIds || []));
    const overlapIndex = aiItems.findIndex((aiItem, aiIndex) => {
      if (usedAiIndexes.has(aiIndex)) return false;
      const aiPostIds = normalizePostIds(aiItem.postIds || []);
      return aiPostIds.some((postId) => itemPostIds.has(postId));
    });
    const categoryIndex = aiItems.findIndex((aiItem, aiIndex) => !usedAiIndexes.has(aiIndex) && aiItem.category && aiItem.category === item.category);
    const fallbackIndex = aiItems.findIndex((_aiItem, aiIndex) => !usedAiIndexes.has(aiIndex) && aiIndex >= index);
    const matchedIndex = overlapIndex >= 0 ? overlapIndex : (categoryIndex >= 0 ? categoryIndex : fallbackIndex);
    const matchedAiItem = matchedIndex >= 0 ? aiItems[matchedIndex] : null;
    if (matchedIndex >= 0) usedAiIndexes.add(matchedIndex);
    const title = String(matchedAiItem?.title || matchedAiItem?.name || '').trim();
    return title ? { ...item, title } : item;
  });
  return dedupeActionItems(merged);
};

const normalizeReportCategories = (categories = [], actionItems = []) => {
  const actionCountMap = new Map();
  (Array.isArray(actionItems) ? actionItems : []).forEach((item) => {
    if (!item?.category) return;
    const current = actionCountMap.get(item.category) || { count: 0, open: 0 };
    const postCount = Number(item.postCount || item.postIds?.length || 0);
    current.count += postCount;
    if ((item.status || 'open') === 'open') current.open += postCount;
    actionCountMap.set(item.category, current);
  });

  return (Array.isArray(categories) ? categories : [])
  .map((item) => {
    if (typeof item === 'string') {
      const actionCounts = actionCountMap.get(item) || { count: 0, open: 0 };
      return { category: item, ...actionCounts };
    }
    const category = item?.category || item?.name || item?.label;
    if (!category) return null;
    const actionCounts = actionCountMap.get(category) || { count: 0, open: 0 };
    return {
      category,
      count: Number(item.count ?? item.value ?? item.postCount ?? actionCounts.count),
      open: Number(item.open ?? item.openCount ?? actionCounts.open),
    };
  })
  .filter(Boolean);
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

const buildReportPayload = (posts, { source = 'local', aiFailure = null, scopeCategory = '' } = {}) => {
  const statusCounts = posts.reduce((map, post) => {
    map[post.status] = (map[post.status] || 0) + 1;
    return map;
  }, {});
  const categories = buildCategorySummary(posts);
  const keywordTrends = buildKeywordTrendMap(posts, categories);
  const keywords = buildKeywordSummary(posts);
  const topCategory = categories[0];
  const openCount = statusCounts.open || 0;
  const resolvedCount = statusCounts.resolved || 0;
  const deletedCount = statusCounts.deleted || 0;
  const total = posts.length;

  const scopeText = scopeCategory ? `「${scopeCategory}」板块` : '全站';
  const summary = total
    ? `本次针对${scopeText}共汇总 ${total} 条反馈，待处理 ${openCount} 条，已处理 ${resolvedCount} 条，待删除 ${deletedCount} 条。${topCategory ? `高频板块为「${topCategory.category}」，共 ${topCategory.count} 条。` : ''}`
    : `当前${scopeText}暂无可汇总的反馈帖子。`;

  const suggestions = [];
  if (topCategory) suggestions.push(`优先跟进「${topCategory.category}」板块，集中处理仍待处理的 ${topCategory.open} 条反馈。`);
  if (keywords[0]) suggestions.push(`围绕高频关键词「${keywords[0].word}」补充线下核实和处理说明。`);
  if (openCount > resolvedCount) suggestions.push('待处理数量高于已处理数量，建议设置每日处理节奏和负责人。');
  if (!suggestions.length) suggestions.push('保持当前处理节奏，并持续关注新发帖子的处理时效。');

  return {
    total,
    statusCounts,
    categories,
    keywordTrends,
    keywords,
    summary,
    suggestions,
    actionItems: buildActionItems(posts),
    source,
    aiStatus: source === 'ai' ? 'success' : 'fallback',
    aiFailure,
    postIds: posts.map((post) => String(post.id)),
    reportScope: {
      category: scopeCategory || '全部',
      mode: scopeCategory ? 'category' : 'all',
    },
    generatedAt: new Date().toISOString(),
  };
};

const generateAdminReport = async (userId, { category = '', startDate = '', endDate = '' } = {}) => {
  const scopeCategory = normalizeReportScope(category);
  const startAt = parseDateBoundary(startDate);
  const endAt = parseDateBoundary(endDate, { endOfDay: true });
  if (startAt && endAt && startAt.getTime() > endAt.getTime()) {
    const error = new Error('开始时间不能晚于结束时间');
    error.statusCode = 400;
    throw error;
  }
  const posts = await listAdminPosts({
    status: 'all',
    currentUserId: userId,
    limit: 500,
    startAt: startAt ? startAt.toISOString().slice(0, 19).replace('T', ' ') : null,
    endAt: endAt ? endAt.toISOString().slice(0, 19).replace('T', ' ') : null,
  });
  const scopedPosts = posts.filter((post) => {
    if (post.status === 'deleted') return false;
    if (scopeCategory && post.category !== scopeCategory) return false;
    const createdAt = new Date(post.createdAt || 0).getTime();
    if (startAt && createdAt < startAt.getTime()) return false;
    if (endAt && createdAt > endAt.getTime()) return false;
    return true;
  });
  if (!scopedPosts.length) {
    const error = new Error(scopeCategory ? `「${scopeCategory}」板块暂无帖子可生成报告` : '暂无帖子可生成报告');
    error.statusCode = 409;
    throw error;
  }

  const localPayload = buildReportPayload(scopedPosts, { scopeCategory });
  const existingCategories = await getCategories();
  const startedAt = Date.now();
  console.log(`[AI] generating admin report for ${scopedPosts.length} posts${scopeCategory ? ` in ${scopeCategory}` : ''}...`);
  const existingKeywordTrends = await collectExistingKeywordTrends();
  const aiPayload = await generateReportPayload({ posts: scopedPosts, localPayload, existingCategories, existingKeywordTrends });
  console.log(`[AI] admin report ${aiPayload ? 'completed' : 'fell back to local summary'} in ${Date.now() - startedAt}ms`);
  const aiFailure = aiPayload ? null : getLastAiFailure();
  if (aiFailure) console.warn(`[AI] admin report fallback reason: ${aiFailure.message}${aiFailure.detail ? `: ${aiFailure.detail}` : ''}`);
  const aiKeywordTrends = aiPayload ? normalizeAiKeywordTrends(aiPayload, localPayload, existingCategories) : null;
  const keywordTags = aiKeywordTrends ? keywordTrendsToSuggestedTags(aiKeywordTrends) : [];
  const addedTags = aiPayload
    ? await addSuggestedTagsToCategories([...(aiPayload.suggestedTags || []), ...keywordTags])
    : [];
  const payload = aiPayload ? {
    ...localPayload,
    ...aiPayload,
    categories: localPayload.categories,
    keywordTrends: aiKeywordTrends,
    keywords: Object.entries(aiKeywordTrends || {}).flatMap(([category, trend]) => (trend.labels || []).map((word, index) => ({ category, word, count: trend.points?.[index] || 0 }))),
    total: localPayload.total,
    statusCounts: localPayload.statusCounts,
    source: 'ai',
    aiStatus: 'success',
    aiFailure: null,
    addedTags,
    postIds: localPayload.postIds,
    actionItems: mergeAiActionItems(localPayload.actionItems, aiPayload.actionItems),
    generatedAt: new Date().toISOString(),
  } : {
    ...localPayload,
    source: 'local',
    aiStatus: 'fallback',
    aiFailure: aiFailure || { message: 'AI request returned no usable result', detail: '', at: new Date().toISOString() },
    addedTags: [],
  };
  payload.actionItems = dedupeActionItems(payload.actionItems);
  payload.categoriesSnapshot = await getCategories();
  payload.reportScope = {
    category: scopeCategory || '全部',
    mode: scopeCategory ? 'category' : 'all',
    startDate: startAt ? startAt.toISOString() : null,
    endDate: endAt ? endAt.toISOString() : null,
  };
  const title = `${scopeCategory ? `${scopeCategory}板块` : '全站'}反馈处理报告 ${new Date().toLocaleDateString('zh-CN')}`;
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
  const reportCategories = normalizeReportCategories(payload.categories, payload.actionItems);
  const aiFailureLines = payload.aiFailure ? [
    '',
    '## AI 请求日志',
    `- 状态：${payload.aiStatus === 'fallback' ? 'AI 请求失败，回退为本地总结链路' : 'AI 请求成功'}`,
    `- 时间：${payload.aiFailure.at || '-'}`,
    `- 原因：${payload.aiFailure.message || '-'}`,
    ...(payload.aiFailure.detail ? [`- 详情：${payload.aiFailure.detail}`] : []),
  ] : [];
  const addedTagLines = Array.isArray(payload.addedTags) && payload.addedTags.length ? [
    '',
    '## 自动补充标签',
    ...payload.addedTags.map((item) => `- ${item.category}: ${item.tag}`),
  ] : [];
  const lines = [
    `# ${report.title}`,
    '',
    `生成时间：${new Date(report.createdAt).toLocaleString('zh-CN')}`,
    `总结范围：${payload.reportScope?.category || '全部'}`,
    '',
    '## 总结',
    report.summary,
    '',
    '## 高频板块',
    ...reportCategories.map((item) => `- ${item.category}: ${item.count} 条，待处理 ${item.open} 条`),
    '',
    '## 高频关键词',
    ...(payload.keywords || []).map((item) => `- ${item.word}: ${item.count} 次`),
    '',
    '## 处理建议',
    ...(payload.suggestions || []).map((item) => `- ${item}`),
    '',
    '## 建议处理',
    ...(payload.actionItems || []).map((item) => `- ${item.title}: ${item.postCount || item.postIds?.length || 0} 个帖子吐槽`),
    ...addedTagLines,
    ...aiFailureLines,
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
