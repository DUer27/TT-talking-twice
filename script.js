const topics = [];

const tagClass = (tag) => {
  if (tag.includes('课程') || tag.includes('公告')) return 'blue';
  if (tag.includes('食堂') || tag.includes('高频')) return 'orange';
  if (tag.includes('宿舍') || tag.includes('急需') || tag.includes('情绪')) return 'red';
  if (tag.includes('设施') || tag.includes('已处理')) return 'green';
  if (tag.includes('活动')) return 'purple';
  return '';
};

const colors = ['#2563eb', '#f97316', '#7c3aed', '#16a34a', '#dc2626', '#0891b2', '#475569'];
const topicBody = document.getElementById('topicBody');
const listHint = document.getElementById('listHint');
const topicPanel = document.getElementById('topicPanel');
const adminPanel = document.getElementById('adminPanel');
let sidebarLinks = document.querySelectorAll('.sidebar-link[data-filter]');
const categorySidebarSection = document.getElementById('categorySidebarSection');
const teacherEntry = document.querySelector('.teacher-entry');
const navLinks = document.querySelectorAll('.nav-pills [data-nav-filter]');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');
const categoryChip = document.getElementById('categoryChip');
const tagChip = document.getElementById('tagChip');
const weekActiveChip = document.getElementById('weekActiveChip');
const categoryMenu = document.getElementById('categoryMenu');
const tagMenu = document.getElementById('tagMenu');
const brandHome = document.getElementById('brandHome');
const announcementBtn = document.getElementById('announcementBtn');
const generateReportBtn = document.getElementById('generateReportBtn');
const loginBtn = document.getElementById('loginBtn');
const userMenuWrap = document.getElementById('userMenuWrap');
const userMenu = document.getElementById('userMenu');
const userMenuAvatar = document.getElementById('userMenuAvatar');
const avatarFileInput = document.getElementById('avatarFileInput');
const userMenuName = document.getElementById('userMenuName');
const userMenuEmail = document.getElementById('userMenuEmail');
const announcementMenuBtn = document.querySelector('[data-user-action="announcement"]');
const createPostBtn = document.getElementById('createPostBtn');
const complaintTrendChart = document.getElementById('complaintTrendChart');
const categoryBarChart = document.getElementById('categoryBarChart');
const hotCategoryName = document.getElementById('hotCategoryName');
const hotCategorySummary = document.getElementById('hotCategorySummary');
const todayPostCount = document.getElementById('todayPostCount');
const todayPostChange = document.getElementById('todayPostChange');
const hotBreakdown = document.querySelector('.hot-breakdown');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminStatusFilter = document.getElementById('adminStatusFilter');
const adminPostBody = document.getElementById('adminPostBody');
const adminPostEmpty = document.getElementById('adminPostEmpty');
const adminAiSummary = document.getElementById('adminAiSummary');
const adminSuggestionList = document.getElementById('adminSuggestionList');
const adminReportList = document.getElementById('adminReportList');
const adminActionList = document.getElementById('adminActionList');
const adminCategoryForm = document.getElementById('adminCategoryForm');
const adminCategoryName = document.getElementById('adminCategoryName');
const adminTagForm = document.getElementById('adminTagForm');
const adminTagCategory = document.getElementById('adminTagCategory');
const adminTagInput = document.getElementById('adminTagInput');
const adminDeleteCategoryBtn = document.getElementById('adminDeleteCategoryBtn');
const adminArchivedList = document.getElementById('adminArchivedList');
let hotCategoryButtons = [];

const defaultTrendLabels = ['调课', '作业', '早八', '考试', '签到', '实验', '课件', '进度', '答疑', '分组', '成绩', '选课'];
let categoryTrendMap = {};
let appCategories = [];
let categoryStatOrder = [
  { category: '课程吐槽', label: '课程' },
  { category: '食堂吐槽', label: '食堂' },
  { category: '宿舍生活', label: '宿舍' },
  { category: '校园设施', label: '设施' },
  { category: '活动社团', label: '活动' },
];

const createEmptyTrendMap = () => Object.fromEntries(categoryStatOrder.map((item) => [item.category, {
  keyword: '暂无',
  mentions: 0,
  labels: defaultTrendLabels,
  points: defaultTrendLabels.map(() => 0),
}]));

categoryTrendMap = createEmptyTrendMap();

let adminStats = {
  summary: { total: 0, today: 0, yesterday: 0, dailyChange: 0 },
  hotCategory: '课程吐槽',
  categories: categoryStatOrder.map((item) => ({ ...item, value: 0 })),
  trends: categoryTrendMap,
};

const getVisibleCategories = () => {
  const fallbackCategories = categoryStatOrder.map((item) => ({ name: item.category, label: item.label, tags: [] }));
  const sourceCategories = appCategories.length ? appCategories : fallbackCategories;
  return sourceCategories.filter((category) => category.name !== '公告');
};

const renderTagMenu = (categoryName = currentFilter) => {
  if (!tagMenu) return;
  const visibleCategories = getVisibleCategories();
  const matchedCategory = visibleCategories.find((category) => category.name === categoryName);
  const sourceCategories = matchedCategory ? [matchedCategory] : visibleCategories;
  const tagNames = [...new Set(sourceCategories.flatMap((category) => category.tags || []))];
  if (currentTagKeyword && !tagNames.includes(currentTagKeyword)) {
    currentTagKeyword = '';
    tagChip.textContent = '标签：全部 ▸';
  }
  tagMenu.innerHTML = ['<button data-tag="全部">全部</button>', ...tagNames.map((tag) => (
    `<button data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
  ))].join('');
  tagMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.tag === (currentTagKeyword || '全部')));
};

const applyCategories = (categories = []) => {
  appCategories = categories.length ? categories : appCategories;
  const visibleCategories = getVisibleCategories();
  if (visibleCategories.length) {
    categoryStatOrder = visibleCategories.map((category) => ({ category: category.name, label: category.label || category.name.slice(0, 4) }));
    categoryTrendMap = { ...createEmptyTrendMap(), ...(adminStats.trends || {}) };
  }

  if (categoryMenu) {
    categoryMenu.innerHTML = ['<button data-category="全部">全部</button>', ...visibleCategories.map((category) => (
      `<button data-category="${escapeHtml(category.name)}">${escapeHtml(category.name)}</button>`
    ))].join('');
  }

  renderTagMenu();
  syncCategoryChip(currentFilter);

  if (categorySidebarSection) {
    categorySidebarSection.innerHTML = [
      '<div class="sidebar-title">吐槽板块</div>',
      ...visibleCategories.map((category, index) => (
        `<a class="sidebar-link" href="#" data-filter="${escapeHtml(category.name)}" data-title="${escapeHtml(category.name)}"><span class="dot ${['orange', 'purple', 'green', 'cyan', 'blue'][index % 5]}"></span> ${escapeHtml(category.name)}</a>`
      )),
    ].join('');
    categorySidebarSection.querySelectorAll('.sidebar-link[data-filter]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        resetChips();
        switchFilter(link.dataset.filter, link.dataset.title);
      });
    });
    sidebarLinks = document.querySelectorAll('.sidebar-link[data-filter]');
  }

  const postCategorySelect = document.getElementById('postCategoryInput');
  if (postCategorySelect) {
    postCategorySelect.innerHTML = visibleCategories.map((category) => (
      `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`
    )).join('');
  }

  if (adminTagCategory) {
    const previousValue = adminTagCategory.value;
    adminTagCategory.innerHTML = visibleCategories.map((category) => (
      `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`
    )).join('');
    if (previousValue && visibleCategories.some((category) => category.name === previousValue)) {
      adminTagCategory.value = previousValue;
    }
  }
  renderPostTagOptions();
};

const loadCategories = async () => {
  try {
    const { categories = [] } = await apiRequest('/api/categories');
    applyCategories(categories);
  } catch (_error) {
    applyCategories([]);
  }
};

const renderPostTagOptions = () => {
  const postCategorySelect = document.getElementById('postCategoryInput');
  const postTagOptions = document.getElementById('postTagOptions');
  if (!postCategorySelect || !postTagOptions) return;
  const category = appCategories.find((item) => item.name === postCategorySelect.value);
  const tags = category?.tags || [];
  if (!tags.length) {
    postTagOptions.innerHTML = '<span class="empty">该板块暂无可选标签</span>';
    return;
  }
  postTagOptions.innerHTML = tags.map((tag) => `
    <label>
      <input type="checkbox" name="postTags" value="${escapeHtml(tag)}">
      <span>${escapeHtml(tag)}</span>
    </label>
  `).join('');
};

const applyCreatePostDefaultCategory = () => {
  const postCategorySelect = document.getElementById('postCategoryInput');
  if (!postCategorySelect) return;
  const visibleCategories = getVisibleCategories();
  const isCategoryFilter = visibleCategories.some((category) => category.name === currentFilter);
  if (isCategoryFilter) {
    postCategorySelect.value = currentFilter;
  }
};

const getCategoryStats = () => categoryStatOrder.map((item) => {
  const matched = adminStats.categories.find((stat) => stat.category === item.category);
  return { ...item, value: Number(matched?.value || 0) };
});

let currentFilter = 'all';
let currentTitle = '最新吐槽';
let currentTopicId = null;
let currentTagKeyword = '';
let postPageOffset = 0;
let postPageLoading = false;
let postPageHasMore = true;
let postPageRequestId = 0;
let hasNewPostsNotice = false;
let latestSeenPostId = '';
const postPageSize = 30;
let adminPosts = [];
let adminPostLoading = false;
let adminReports = [];
const reportedPostIds = new Set();
const archivedActionItems = new Set();
let toastTimer = null;
let activeTrendIndex = 0;
let activeCategoryIndex = -1;
let activeTrendCategory = '食堂吐槽';
let trendAnimationFrame = null;
let trendAnimation = {
  from: null,
  to: null,
  progress: 1,
};

const isNewerPostId = (candidateId, baselineId) => {
  const candidate = Number(candidateId);
  const baseline = Number(baselineId);
  if (Number.isFinite(candidate) && Number.isFinite(baseline)) return candidate > baseline;
  return String(candidateId) > String(baselineId);
};
const isMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform || '')
  || /Mac OS X/.test(navigator.userAgent || '');

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

const getChartTheme = () => {
  const isDark = document.body.classList.contains('dark-mode');
  if (isDark) {
    return {
      background: '#17120f',
      grid: 'rgba(101, 88, 78, .45)',
      axis: 'rgba(169, 157, 147, .65)',
      muted: '#a99d93',
      text: '#e7ddd4',
      line: '#f97316',
      lineGlow: 'rgba(249, 115, 22, .34)',
      point: '#fff7ed',
      tooltipBg: '#07111f',
      tooltipText: '#cbd5e1',
      bar: '#18d3c3',
      barActive: '#5eead4',
      barHover: 'rgba(94, 234, 212, .12)',
    };
  }
  return {
    background: '#ffffff',
    grid: 'rgba(148, 163, 184, .28)',
    axis: 'rgba(100, 116, 139, .5)',
    muted: '#64748b',
    text: '#1f2a3d',
    line: '#2563eb',
    lineGlow: 'rgba(37, 99, 235, .2)',
    point: '#eff6ff',
    tooltipBg: '#ffffff',
    tooltipText: '#1f2a3d',
    bar: '#0891b2',
    barActive: '#06b6d4',
    barHover: 'rgba(8, 145, 178, .1)',
  };
};

const showToast = (message) => {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 1800);
};

let currentUser = null;

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || '请求失败，请稍后重试');
  }
  return data;
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}[char]));

const getRelativeActivity = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) return '刚刚';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return '刚刚';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
};

const isRecentPost = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 1000 * 60 * 60 * 24;
};

const normalizePostTopic = (post) => {
  if (!post) return null;
  const authorInitial = post.author?.initial || (post.isAnonymous ? '?' : '?');
  const authorName = post.author?.name || (post.isAnonymous ? '匿名同学' : '同学');
  const tags = [post.category, ...(Array.isArray(post.tags) ? post.tags : [])];
  if (post.resolved || post.status === 'resolved') tags.push('已处理');
  else tags.push('待回应');


  return {
    id: String(post.id),
    persisted: true,
    title: post.title,
    content: post.content,
    tags,
    category: post.category,
    pinned: post.category === '公告',
    replies: Number(post.replies || 0),
    views: Number(post.views || 0),
    activity: getRelativeActivity(post.updatedAt || post.createdAt),
    posters: [authorInitial],
    authorName,
    hotScore: Number(post.likeCount || 0) + Number(post.favoriteCount || 0),
    hot: Number(post.likeCount || 0) + Number(post.favoriteCount || 0) > 0,
    mine: Boolean(post.mine),
    resolved: Boolean(post.resolved || post.status === 'resolved'),
    unread: false,
    favorite: Boolean(post.favorited),
    liked: Boolean(post.liked),
    likeCount: Number(post.likeCount || 0),
    favoriteCount: Number(post.favoriteCount || 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const updateTopicFromPost = (post, { preserveState = true, prepend = true } = {}) => {
  const nextTopic = normalizePostTopic(post);
  if (!nextTopic) return null;
  const existingIndex = topics.findIndex((topic) => topic.persisted && String(topic.id) === String(nextTopic.id));

  if (existingIndex >= 0) {
    const existingTopic = topics[existingIndex];
    if (preserveState) {
      nextTopic.unread = existingTopic.unread;
      if (!Array.isArray(post.comments) && Array.isArray(existingTopic.comments)) {
        nextTopic.comments = existingTopic.comments;
      }
    }
    topics.splice(existingIndex, 1, nextTopic);
  } else if (prepend) {
    topics.unshift(nextTopic);
  } else {
    topics.push(nextTopic);
  }

  return nextTopic;
};

const getPostListSort = (filter = currentFilter) => (filter === 'hot' ? 'hot' : 'latest');

const getPostListQuery = (filter = currentFilter) => {
  const query = new URLSearchParams({
    limit: String(postPageSize),
    offset: String(postPageOffset),
    sort: getPostListSort(filter),
  });
  if (getVisibleCategories().some((category) => category.name === filter)) query.set('category', filter);
  if (filter === 'resolved') query.set('status', 'resolved');
  if (['mine', 'liked', 'favorites'].includes(filter)) query.set('scope', filter);
  return query;
};

const syncLatestSeenPostId = async ({ markSeen = false } = {}) => {
  const { posts = [] } = await apiRequest('/api/posts?limit=1&offset=0&sort=latest');
  const latestId = posts[0]?.id ? String(posts[0].id) : '';
  if (!latestId) return false;
  if (!latestSeenPostId || markSeen || isNewerPostId(latestId, latestSeenPostId)) {
    if (markSeen || !latestSeenPostId) latestSeenPostId = latestId;
  }
  return isNewerPostId(latestId, latestSeenPostId);
};

const loadPersistedTopics = async ({ silent = true, reset = true } = {}) => {
  if (postPageLoading && !reset) return;
  const requestId = postPageRequestId + 1;
  postPageRequestId = requestId;
  postPageLoading = true;
  try {
    if (reset) {
      postPageOffset = 0;
      postPageHasMore = true;
      for (let index = topics.length - 1; index >= 0; index -= 1) {
        if (topics[index].persisted) topics.splice(index, 1);
      }
    }
    if (!postPageHasMore) return;

    const query = getPostListQuery();
    const { posts = [] } = await apiRequest(`/api/posts?${query.toString()}`);
    if (requestId !== postPageRequestId) return;
    posts.forEach((post) => updateTopicFromPost(post, { preserveState: true, prepend: false }));
    postPageOffset += posts.length;
    postPageHasMore = posts.length === postPageSize;
    if (reset) {
      hasNewPostsNotice = false;
      if (getPostListSort(currentFilter) === 'latest') await syncLatestSeenPostId({ markSeen: currentFilter === 'all' && !currentTagKeyword });
    }

    if (currentFilter === 'admin') await loadAdminStats({ silent: true });
    else renderTopics(currentFilter, currentTitle);
    if (!silent) showToast('已刷新数据库帖子');
  } catch (error) {
    if (!silent) showToast(error.message || '帖子加载失败，请稍后重试');
  } finally {
    if (requestId === postPageRequestId) postPageLoading = false;
  }
};

const checkForNewPosts = async () => {
  if (currentFilter !== 'all' || currentTagKeyword || postPageLoading || hasNewPostsNotice) return;
  try {
    if (await syncLatestSeenPostId()) {
      hasNewPostsNotice = true;
      renderTopics(currentFilter, currentTitle);
    }
  } catch (_error) {
    // New-post polling should stay quiet; normal list loading handles visible errors.
  }
};

const formatDailyChange = (change) => {
  const value = Number(change || 0);
  if (value > 0) return `上涨 +${value}%`;
  if (value < 0) return `下降 ${value}%`;
  return '持平';
};

const renderHotBreakdown = () => {
  if (!hotBreakdown) return;
  const categories = [...getCategoryStats()].sort((a, b) => b.value - a.value).slice(0, 4);
  hotBreakdown.innerHTML = categories.map((item) => {
    const trendData = getTrendData(item.category);
    return `
      <button type="button" class="${item.category === activeTrendCategory ? 'active' : ''}" data-category-key="${escapeHtml(item.category)}">
        <b>${escapeHtml(trendData.keyword)}</b>
        <em>${escapeHtml(item.category)} · ${Number(item.value || 0)} 条</em>
      </button>
    `;
  }).join('');
  hotCategoryButtons = [...hotBreakdown.querySelectorAll('[data-category-key]')];
  hotCategoryButtons.forEach((button) => {
    button.addEventListener('click', () => updateHotCategory(button.dataset.categoryKey));
  });
};

const renderAdminSummary = () => {
  if (todayPostCount) todayPostCount.textContent = Number(adminStats.summary.today || 0);
  if (todayPostChange) todayPostChange.textContent = formatDailyChange(adminStats.summary.dailyChange);
  if (hotCategoryName) hotCategoryName.textContent = activeTrendCategory;
  const trendData = getTrendData(activeTrendCategory);
  if (hotCategorySummary) {
    hotCategorySummary.textContent = `${activeTrendCategory}近 30 天高频关键词「${trendData.keyword}」，共 ${Number(trendData.mentions || 0)} 次`;
  }
  renderHotBreakdown();
};

const loadAdminStats = async ({ silent = true } = {}) => {
  try {
    const { stats } = await apiRequest('/api/posts/stats');
    adminStats = stats || adminStats;
    if (Array.isArray(adminStats.categoriesSnapshot)) {
      applyCategories(adminStats.categoriesSnapshot);
    }
    categoryTrendMap = { ...createEmptyTrendMap(), ...(adminStats.trends || {}) };
    activeTrendCategory = adminStats.hotCategory || activeTrendCategory || categoryStatOrder[0].category;
    activeTrendIndex = 0;
    cancelAnimationFrame(trendAnimationFrame);
    trendAnimationFrame = null;
    const activePoints = normalizeChartPoints(getTrendData(activeTrendCategory).points);
    trendAnimation = { from: activePoints, to: activePoints, progress: 1 };
    renderAdminSummary();
    renderAdminCharts();
    if (!silent) showToast('管理员统计已更新');
  } catch (error) {
    renderAdminSummary();
    renderAdminCharts();
    if (!silent) showToast(error.message || '管理员统计加载失败');
  }
};

const adminStatusLabels = {
  open: '待处理',
  resolved: '已处理',
  deleted: '待删除',
};

const getDeleteRemainingText = (post) => {
  if (post?.status !== 'deleted' || !post.deleteExpiresAt) return '';
  const remainingMs = new Date(post.deleteExpiresAt).getTime() - Date.now();
  if (remainingMs <= 0) return '即将删除';
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.ceil((remainingMs % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')} 后删除`;
};

const getAdminFilteredPosts = () => {
  const query = (adminSearchInput?.value || '').trim().toLowerCase();
  const sortedPosts = [...adminPosts].sort((a, b) => Number(reportedPostIds.has(String(b.id))) - Number(reportedPostIds.has(String(a.id))));
  if (!query) return sortedPosts;
  return sortedPosts.filter((post) => [
    post.title,
    post.content,
    post.category,
    post.status,
    post.author?.name,
  ].join(' ').toLowerCase().includes(query));
};

const renderAdminPosts = () => {
  if (!adminPostBody) return;
  const posts = getAdminFilteredPosts();
  adminPostBody.innerHTML = posts.map((post) => {
    const status = post.status || 'open';
    const statusLabel = adminStatusLabels[status] || status;
    const deleteText = getDeleteRemainingText(post);
    const isReported = reportedPostIds.has(String(post.id));
    const safeId = escapeHtml(post.id);
    return `
      <tr class="admin-post-row ${isReported ? 'is-reported' : ''}" data-admin-row-id="${safeId}" tabindex="0">
        <td>
          <div class="admin-post-title">
            <strong>${escapeHtml(post.title)}</strong>
            <span>${escapeHtml(post.content || '')}</span>
          </div>
        </td>
        <td>${escapeHtml(post.category || '-')}</td>
        <td>
          ${isReported ? '<span class="admin-status-badge reported">已举报</span>' : ''}
          <span class="admin-status-badge ${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
          ${deleteText ? `<span class="admin-status-badge deleting">${escapeHtml(deleteText)}</span>` : ''}
        </td>
        <td>${Number(post.replies || 0)} 评 / ${Number(post.likeCount || 0)} 赞 / ${Number(post.views || 0)} 浏览</td>
        <td>${escapeHtml(getRelativeActivity(post.updatedAt || post.createdAt))}</td>
        <td>
          <div class="admin-action-group">
            <button type="button" data-admin-status-id="${safeId}" data-status="open" ${status === 'open' ? 'disabled' : ''}>待处理</button>
            <button type="button" data-admin-status-id="${safeId}" data-status="resolved" ${status === 'resolved' ? 'disabled' : ''}>已处理</button>
            <button type="button" data-admin-status-id="${safeId}" data-status="${status === 'deleted' ? 'open' : 'deleted'}">${status === 'deleted' ? '恢复' : '删除'}</button>
            ${isReported ? `<button type="button" data-admin-dismiss-report-id="${safeId}">驳回举报</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (adminPostEmpty) adminPostEmpty.hidden = Boolean(posts.length) || adminPostLoading;
};

const loadAdminPosts = async ({ silent = true } = {}) => {
  if (!adminPostBody) return;
  if (!currentUser) {
    adminPosts = [];
    renderAdminPosts();
    if (!silent) showToast('请先登录后再进入后台');
    openLogin();
    return;
  }
  if (currentUser.role !== 'admin') {
    adminPosts = [];
    renderAdminPosts();
    if (!silent) showToast('当前账号没有管理员权限');
    return;
  }

  adminPostLoading = true;
  adminPostBody.innerHTML = '<tr><td colspan="6" class="empty-state">正在读取帖子...</td></tr>';
  if (adminPostEmpty) adminPostEmpty.hidden = true;
  try {
    const status = adminStatusFilter?.value || 'all';
    const { posts = [] } = await apiRequest(`/api/posts/admin/list?status=${encodeURIComponent(status)}`);
    adminPosts = posts;
    renderAdminPosts();
    if (!silent) showToast('后台帖子已刷新');
  } catch (error) {
    adminPosts = [];
    renderAdminPosts();
    showToast(error.message || '后台帖子加载失败');
  } finally {
    adminPostLoading = false;
    renderAdminPosts();
  }
};

const renderAdminReport = (report = adminReports[0]) => {
  if (!adminAiSummary || !adminSuggestionList) return;
  if (!report) {
    adminAiSummary.textContent = '暂无报告，请先生成一份';
    adminSuggestionList.innerHTML = '';
    renderAdminActionItems(null);
    renderArchivedActionItems();
    return;
  }
  const payload = report.payload || {};
  const sourceText = payload.source === 'ai' ? 'AI 分析' : 'AI 请求失败，回退为本地总结链路';
  const postCountText = Array.isArray(payload.postIds) ? `，覆盖 ${payload.postIds.length} 条帖子` : '';
  const failureText = payload.aiFailure?.message ? `（失败原因：${payload.aiFailure.message}）` : '';
  const addedTagsText = Array.isArray(payload.addedTags) && payload.addedTags.length
    ? `；已补充标签：${payload.addedTags.map((item) => `${item.category}/${item.tag}`).join('、')}`
    : '';
  adminAiSummary.textContent = `${sourceText}${postCountText}${failureText}：${report.summary || payload.summary || '暂无摘要'}${addedTagsText}`;
  adminSuggestionList.innerHTML = (payload.suggestions || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  renderAdminActionItems(report);
  renderArchivedActionItems();
};

const renderAdminActionItems = (report = adminReports[0]) => {
  if (!adminActionList) return;
  if (!adminReports.length) {
    adminActionList.innerHTML = '<div class="admin-empty">暂无建议处理项</div>';
    return;
  }
  const actionItems = adminReports.flatMap((reportItem) => (
    reportItem?.payload?.actionItems || []
  ).map((item) => ({ ...item, reportId: reportItem.id })))
    .filter((item) => !archivedActionItems.has(`${item.reportId}:${item.id}`) && item.status !== 'resolved');
  if (!actionItems.length) {
    adminActionList.innerHTML = '<div class="admin-empty">暂无待处理建议</div>';
    return;
  }
  adminActionList.innerHTML = actionItems.map((item) => {
    const isResolved = item.status === 'resolved';
    return `
      <div class="admin-action-item ${isResolved ? 'is-resolved' : ''}" data-action-id="${escapeHtml(item.id)}" data-report-id="${escapeHtml(item.reportId)}">
        <div class="admin-action-title">
          <strong>${escapeHtml(item.title || '建议处理')}</strong>
          <span>${Number(item.postCount || item.postIds?.length || 0)} 条帖子</span>
        </div>
        <div class="admin-action-buttons">
          <button type="button" data-action-status="${isResolved ? 'open' : 'resolved'}">${isResolved ? '恢复待处理' : '标为已处理'}</button>
          <button type="button" data-action-archive="true">归档</button>
        </div>
      </div>
    `;
  }).join('');
};

const renderArchivedActionItems = () => {
  if (!adminArchivedList) return;
  const archivedItems = [];
  adminReports.forEach((report) => {
    (report.payload?.actionItems || []).forEach((item) => {
      const key = `${report.id}:${item.id}`;
      if (archivedActionItems.has(key)) archivedItems.push({ ...item, reportId: report.id, key });
    });
  });
  if (!archivedItems.length) {
    adminArchivedList.innerHTML = '<div class="admin-empty">暂无已归档处理项</div>';
    return;
  }
  adminArchivedList.innerHTML = archivedItems.map((item) => `
    <div class="admin-archived-item" data-archived-key="${escapeHtml(item.key)}" data-report-id="${escapeHtml(item.reportId)}">
      <strong>${escapeHtml(item.title || '建议处理')}</strong>
      <button type="button" data-restore-archived="true">恢复显示</button>
    </div>
  `).join('');
};

const normalizeChartPoints = (points = []) => (Array.isArray(points) ? points : [])
  .map((value) => Math.max(0, Number(value) || 0));

const alignChartPoints = (points = [], length = 0) => {
  const normalized = normalizeChartPoints(points);
  return Array.from({ length }, (_item, index) => normalized[index] || 0);
};

const renderAdminReportList = () => {
  if (!adminReportList) return;
  if (!adminReports.length) {
    adminReportList.innerHTML = '<div class="admin-empty">暂无历史报告</div>';
    renderAdminReport(null);
    return;
  }
  adminReportList.innerHTML = adminReports.map((report) => `
    <div class="admin-report-item">
      <div>
        <strong>${escapeHtml(report.title)}</strong>
        <span>${escapeHtml(new Date(report.createdAt).toLocaleString('zh-CN'))}</span>
      </div>
      <div class="admin-report-actions">
        <a href="/api/posts/admin/reports/${encodeURIComponent(report.id)}/export?format=markdown">Markdown</a>
        <a href="/api/posts/admin/reports/${encodeURIComponent(report.id)}/export?format=word">Word</a>
        <a href="/api/posts/admin/reports/${encodeURIComponent(report.id)}/export?format=pdf">PDF</a>
        <a href="/api/posts/admin/reports/${encodeURIComponent(report.id)}/export?format=html">HTML</a>
      </div>
    </div>
  `).join('');
  renderAdminReport(adminReports[0]);
};

const loadAdminReports = async ({ silent = true } = {}) => {
  if (!adminReportList || currentUser?.role !== 'admin') return;
  try {
    const { reports = [] } = await apiRequest('/api/posts/admin/reports');
    adminReports = reports;
    renderAdminReportList();
  } catch (error) {
    if (!silent) showToast(error.message || '报告历史加载失败');
  }
};

const generateAdminReport = async () => {
  if (!generateReportBtn || currentUser?.role !== 'admin') return;
  const originalText = generateReportBtn.textContent;
  generateReportBtn.disabled = true;
  generateReportBtn.textContent = '生成中...';
  try {
    const { report } = await apiRequest('/api/posts/admin/reports', { method: 'POST' });
    adminReports = [report, ...adminReports.filter((item) => String(item.id) !== String(report.id))];
    if (Array.isArray(report?.payload?.categoriesSnapshot)) {
      applyCategories(report.payload.categoriesSnapshot);
    } else if (Array.isArray(report?.payload?.addedTags) && report.payload.addedTags.length) {
      await loadCategories();
    }
    renderAdminReportList();
    showToast('报告已生成');
  } catch (error) {
    showToast(error.message || '报告生成失败');
  } finally {
    generateReportBtn.disabled = false;
    generateReportBtn.textContent = originalText;
  }
};

const getAvatarStorageKey = (user = currentUser) => {
  if (!user) return '';
  return `campusVoiceAvatar:${user.id || user.email}`;
};

const getStoredAvatar = (user = currentUser) => {
  try {
    const storageKey = getAvatarStorageKey(user);
    return storageKey ? localStorage.getItem(storageKey) : '';
  } catch (_error) {
    return '';
  }
};

const setAvatarPreview = (imageDataUrl, displayName = '?') => {
  const initial = (displayName || '?').trim().slice(0, 1).toUpperCase() || '?';
  if (imageDataUrl) {
    userMenuAvatar.textContent = '';
    userMenuAvatar.style.backgroundImage = `url(${JSON.stringify(imageDataUrl)})`;
    userMenuAvatar.classList.add('has-image');
    userMenuAvatar.setAttribute('aria-label', '当前头像，点击更换');
    return;
  }

  userMenuAvatar.style.backgroundImage = '';
  userMenuAvatar.classList.remove('has-image');
  userMenuAvatar.textContent = initial;
  userMenuAvatar.setAttribute('aria-label', '默认头像');
};

const resizeAvatarFile = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    const canvasSize = 320;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
    const sourceX = ((image.naturalWidth || image.width) - sourceSize) / 2;
    const sourceY = ((image.naturalHeight || image.height) - sourceSize) / 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasSize, canvasSize);
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, canvasSize, canvasSize);
    resolve(canvas.toDataURL('image/jpeg', 0.88));
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('头像图片读取失败，请重试'));
  };
  image.src = objectUrl;
});

const openAvatarPicker = () => {
  if (!currentUser) {
    showToast('请先登录后再更换头像');
    openLogin();
    return;
  }
  avatarFileInput.value = '';
  avatarFileInput.click();
};

const handleAvatarFileChange = async () => {
  const file = avatarFileInput.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    avatarFileInput.value = '';
    showToast('请选择图片文件');
    return;
  }

  if (file.size > 12 * 1024 * 1024) {
    avatarFileInput.value = '';
    showToast('头像图片不能超过 12MB');
    return;
  }

  try {
    const avatarDataUrl = await resizeAvatarFile(file);
    const storageKey = getAvatarStorageKey();
    if (!storageKey) {
      showToast('请先登录后再更换头像');
      return;
    }

    localStorage.setItem(storageKey, avatarDataUrl);
    const displayName = currentUser.nickname || currentUser.email.split('@')[0];
    setAvatarPreview(avatarDataUrl, displayName);
    showToast('头像已更新');
  } catch (error) {
    showToast(error.message || '头像更新失败，请稍后重试');
  } finally {
    avatarFileInput.value = '';
  }
};

const updateAuthUI = (user) => {
  currentUser = user;
  if (teacherEntry) teacherEntry.hidden = user?.role !== 'admin';
  if (announcementMenuBtn) announcementMenuBtn.hidden = user?.role !== 'admin';
  if (user?.role !== 'admin' && currentFilter === 'admin') {
    switchFilter('all', '最新吐槽');
  }
  if (user) {
    const displayName = user.nickname || user.email.split('@')[0];
    loginBtn.textContent = `${displayName} ▾`;
    loginBtn.classList.add('logged-in');
    loginBtn.setAttribute('aria-expanded', 'false');
    loginBtn.title = '打开个人菜单';
    userMenu.hidden = false;
    userMenuWrap.classList.add('is-logged-in');
    userMenuAvatar.disabled = false;
    userMenuAvatar.title = '更换头像';
    setAvatarPreview(getStoredAvatar(user), displayName);
    userMenuName.textContent = displayName;
    userMenuEmail.textContent = user.email;
  } else {
    loginBtn.textContent = '登录';
    loginBtn.classList.remove('logged-in');
    loginBtn.setAttribute('aria-expanded', 'false');
    loginBtn.title = '';
    userMenu.hidden = true;
    userMenu.classList.remove('open');
    userMenuWrap.classList.remove('is-logged-in');
    userMenuAvatar.disabled = true;
    userMenuAvatar.title = '请先登录';
    setAvatarPreview('', '?');
    userMenuName.textContent = '未登录';
    userMenuEmail.textContent = '欢迎回来';
  }
};

const setupCanvas = (canvas) => {
  if (!canvas) return null;
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(Math.floor(rect.width), 320);
  const height = Math.max(Math.floor(rect.height), Number(canvas.getAttribute('height')) || 240);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width, height };
};

const drawGrid = (ctx, area, ySteps, xSteps) => {
  const theme = getChartTheme();
  ctx.save();
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  for (let i = 0; i <= ySteps; i += 1) {
    const y = area.top + (area.height / ySteps) * i;
    ctx.beginPath();
    ctx.moveTo(area.left, y);
    ctx.lineTo(area.right, y);
    ctx.stroke();
  }
  for (let i = 0; i <= xSteps; i += 1) {
    const x = area.left + (area.width / xSteps) * i;
    ctx.beginPath();
    ctx.moveTo(x, area.top);
    ctx.lineTo(x, area.bottom);
    ctx.stroke();
  }
  ctx.restore();
};

const getTrendData = (category = activeTrendCategory) => categoryTrendMap[category]
  || categoryTrendMap[adminStats.hotCategory]
  || categoryTrendMap[categoryStatOrder[0].category]
  || { keyword: '暂无', mentions: 0, labels: defaultTrendLabels, points: defaultTrendLabels.map(() => 0) };

const drawTrendChart = () => {
  const canvasState = setupCanvas(complaintTrendChart);
  if (!canvasState) return;
  const trendData = getTrendData(activeTrendCategory);
  const theme = getChartTheme();
  const animationProgress = easeOutCubic(trendAnimation.progress);
  const currentPoints = normalizeChartPoints(trendData.points);
  const sourcePoints = normalizeChartPoints(trendAnimation.from || currentPoints);
  const targetPoints = normalizeChartPoints(trendAnimation.to || currentPoints);
  const trendPoints = targetPoints.map((value, index) => {
    const startValue = sourcePoints[index] ?? value;
    return startValue + (value - startValue) * animationProgress;
  });
  const trendLabels = Array.isArray(trendData.labels) && trendData.labels.length ? trendData.labels : defaultTrendLabels;
  const { ctx, width, height } = canvasState;
  const area = { left: 48, top: 14, right: width - 18, bottom: height - 48 };
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  const maxPointValue = Math.max(...targetPoints, ...sourcePoints, 1);
  const maxValue = Math.max(5, Math.ceil(maxPointValue / 5) * 5);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, area, 4, 12);

  ctx.strokeStyle = theme.axis;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(area.left, area.top);
  ctx.lineTo(area.left, area.bottom);
  ctx.lineTo(area.right, area.bottom);
  ctx.stroke();

  ctx.fillStyle = theme.muted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  [0, maxValue * .2, maxValue * .4, maxValue * .6, maxValue * .8, maxValue].forEach((value) => {
    const y = area.bottom - (value / maxValue) * area.height;
    ctx.fillText(Math.round(value), area.left - 8, y);
  });

  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  trendLabels.forEach((label, index) => {
    const x = area.left + (area.width / (trendLabels.length - 1)) * index;
    ctx.save();
    ctx.translate(x, area.bottom + 10);
    ctx.rotate(width < 640 ? -Math.PI / 3 : -Math.PI / 4);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });

  const points = trendPoints.map((value, index) => ({
    x: area.left + (area.width / (trendPoints.length - 1)) * index,
    y: area.bottom - (value / maxValue) * area.height,
    value,
  }));

  const drawLimit = points.length <= 1 ? 1 : 1 + (points.length - 1) * animationProgress;
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 2.25;
  ctx.shadowColor = theme.lineGlow;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index > drawLimit) return;
    const visiblePoint = { ...point };
    if (index > Math.floor(drawLimit) && index > 0) {
      const previous = points[index - 1];
      const localProgress = drawLimit - Math.floor(drawLimit);
      visiblePoint.x = previous.x + (point.x - previous.x) * localProgress;
      visiblePoint.y = previous.y + (point.y - previous.y) * localProgress;
    }
    if (index === 0) ctx.moveTo(visiblePoint.x, visiblePoint.y);
    else {
      const previous = points[index - 1];
      const midpointX = (previous.x + visiblePoint.x) / 2;
      ctx.bezierCurveTo(midpointX, previous.y, midpointX, visiblePoint.y, visiblePoint.x, visiblePoint.y);
    }
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  points.forEach((point, index) => {
    const isActive = index === activeTrendIndex;
    const isVisible = index <= drawLimit + .15;
    if (!isVisible) return;
    const pulse = trendAnimation.progress < 1 ? Math.sin(animationProgress * Math.PI) * 2 : 0;
    ctx.fillStyle = theme.point;
    ctx.beginPath();
    ctx.arc(point.x, point.y, (isActive ? 5 : 3) + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.stroke();
  });

  if (!isMacOS) {
    const focusIndex = Math.max(0, Math.min(activeTrendIndex, points.length - 1));
    const focus = points[focusIndex];
    const focusValue = trendData.points[focusIndex] ?? Math.round(focus.value);
    ctx.strokeStyle = theme.axis;
    ctx.beginPath();
    ctx.moveTo(focus.x, area.top);
    ctx.lineTo(focus.x, area.bottom);
    ctx.stroke();

    const tooltipWidth = 118;
    const tooltipHeight = 46;
    const tooltipX = Math.min(focus.x + 12, area.right - tooltipWidth);
    const tooltipY = Math.max(focus.y + 20, area.top + 8);
    ctx.fillStyle = theme.tooltipBg;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 7);
    ctx.fill();
    ctx.fillStyle = theme.tooltipText;
    ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(trendLabels[focusIndex], tooltipX + 10, tooltipY + 15);
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('提及次数', tooltipX + 10, tooltipY + 32);
    ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(focusValue, tooltipX + tooltipWidth - 10, tooltipY + 32);
  }

  ctx.fillStyle = theme.line;
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`${activeTrendCategory} · ${trendData.keyword} ${trendData.mentions}次`, area.left, area.top + 6);

  complaintTrendChart.style.cursor = isMacOS ? 'default' : 'crosshair';
};

const drawCategoryBarChart = () => {
  const canvasState = setupCanvas(categoryBarChart);
  if (!canvasState) return;
  const theme = getChartTheme();
  const categoryStats = getCategoryStats();
  const { ctx, width, height } = canvasState;
  const leftPadding = width < 420 ? 36 : 48;
  const rightPadding = width < 420 ? 10 : 18;
  const area = { left: leftPadding, top: 10, right: width - rightPadding, bottom: height - 30 };
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  const maxStatValue = Math.max(...categoryStats.map((item) => item.value), 1);
  const maxValue = Math.max(4, Math.ceil((maxStatValue * 1.2) / 2) * 2);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, area, 4, categoryStats.length);

  ctx.strokeStyle = theme.axis;
  ctx.beginPath();
  ctx.moveTo(area.left, area.top);
  ctx.lineTo(area.left, area.bottom);
  ctx.lineTo(area.right, area.bottom);
  ctx.stroke();

  ctx.fillStyle = theme.muted;
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  [0, maxValue * .25, maxValue * .5, maxValue * .75, maxValue].forEach((value) => {
    const y = area.bottom - (value / maxValue) * area.height;
    ctx.fillText(Math.round(value), area.left - 8, y);
  });

  const slotWidth = area.width / categoryStats.length;
  const barWidth = Math.max(18, Math.min(42, slotWidth * .46));
  categoryStats.forEach((item, index) => {
    const isActive = index === activeCategoryIndex;
    const currentBarWidth = isActive ? Math.min(50, slotWidth * .58) : barWidth;
    const x = area.left + slotWidth * index + (slotWidth - currentBarWidth) / 2;
    const barHeight = (item.value / maxValue) * area.height;
    const y = area.bottom - barHeight;
    ctx.fillStyle = isActive ? theme.barActive : theme.bar;
    ctx.fillRect(x, y, currentBarWidth, barHeight);
    if (isActive) {
      ctx.fillStyle = theme.barHover;
      ctx.fillRect(x - 8, area.top, currentBarWidth + 16, area.height);
      ctx.fillStyle = theme.barActive;
      ctx.fillRect(x, y, currentBarWidth, barHeight);
    }
    ctx.fillStyle = theme.muted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(item.label, x + currentBarWidth / 2, area.bottom + 8);
    ctx.fillStyle = isActive ? theme.text : theme.text;
    ctx.font = isActive ? '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(item.value, x + currentBarWidth / 2, Math.max(area.top + 14, y - 6));
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  });

  if (activeCategoryIndex >= 0) {
    const item = categoryStats[activeCategoryIndex];
    if (!item) return;
    const tooltipWidth = 116;
    const tooltipHeight = 42;
    const slotCenter = area.left + slotWidth * activeCategoryIndex + slotWidth / 2;
    const tooltipX = Math.max(area.left, Math.min(slotCenter - tooltipWidth / 2, area.right - tooltipWidth));
    const tooltipY = area.top + 10;
    ctx.fillStyle = theme.tooltipBg;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 7);
    ctx.fill();
    ctx.fillStyle = theme.tooltipText;
    ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, tooltipX + 10, tooltipY + 15);
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(`板块吐槽 ${item.value}`, tooltipX + 10, tooltipY + 30);
  }

  categoryBarChart.style.cursor = !isMacOS && activeCategoryIndex >= 0 ? 'pointer' : 'default';
};

const renderAdminCharts = () => {
  renderAdminSummary();
  requestAnimationFrame(() => {
    drawTrendChart();
    drawCategoryBarChart();
  });
};

const animateTrendTo = (previousPoints, nextPoints) => {
  cancelAnimationFrame(trendAnimationFrame);
  const toPoints = normalizeChartPoints(nextPoints);
  const fromPoints = alignChartPoints(previousPoints, toPoints.length);
  trendAnimation = {
    from: fromPoints,
    to: toPoints,
    progress: 0,
  };
  const startedAt = performance.now();
  const duration = 520;
  const tick = (now) => {
    trendAnimation.progress = Math.min((now - startedAt) / duration, 1);
    drawTrendChart();
    if (trendAnimation.progress < 1) {
      trendAnimationFrame = requestAnimationFrame(tick);
    } else {
      trendAnimation = { from: toPoints, to: toPoints, progress: 1 };
      trendAnimationFrame = null;
    }
  };
  trendAnimationFrame = requestAnimationFrame(tick);
};

const updateHotCategory = (category) => {
  const trendData = categoryTrendMap[category];
  if (!trendData) return;
  const previousCategory = activeTrendCategory;
  const previousPoints = normalizeChartPoints(getTrendData(previousCategory).points);
  activeTrendCategory = category;
  activeTrendIndex = 0;
  hotCategoryButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.categoryKey === category);
  });
  if (hotCategoryName) hotCategoryName.textContent = category;
  if (hotCategorySummary) {
    hotCategorySummary.textContent = `${category}近 30 天高频关键词「${trendData.keyword}」，共 ${Number(trendData.mentions || 0)} 次`;
  }
  renderHotBreakdown();
  const nextPoints = normalizeChartPoints(trendData.points);
  if (previousCategory === category) drawTrendChart();
  else animateTrendTo(previousPoints, nextPoints);
  showToast(`已切换到 ${category} 关键词统计`);
};

const getCanvasPointer = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
};

const updateTrendHover = (event) => {
  const pointer = getCanvasPointer(complaintTrendChart, event);
  const trendPoints = getTrendData(activeTrendCategory).points;
  const area = { left: 48, right: pointer.width - 18, top: 16, bottom: pointer.height - 50 };
  if (pointer.x < area.left || pointer.x > area.right || pointer.y < area.top || pointer.y > area.bottom) {
    activeTrendIndex = 0;
    drawTrendChart();
    return;
  }
  const step = (area.right - area.left) / (trendPoints.length - 1);
  const nextIndex = Math.max(0, Math.min(trendPoints.length - 1, Math.round((pointer.x - area.left) / step)));
  if (nextIndex !== activeTrendIndex) {
    activeTrendIndex = nextIndex;
    drawTrendChart();
  }
};

const updateCategoryHover = (event) => {
  const pointer = getCanvasPointer(categoryBarChart, event);
  const categoryStats = getCategoryStats();
  const leftPadding = pointer.width < 420 ? 36 : 48;
  const rightPadding = pointer.width < 420 ? 10 : 18;
  const area = { left: leftPadding, right: pointer.width - rightPadding, top: 10, bottom: pointer.height - 30 };
  let nextIndex = -1;
  if (pointer.x >= area.left && pointer.x <= area.right && pointer.y >= area.top && pointer.y <= area.bottom) {
    const slotWidth = (area.right - area.left) / categoryStats.length;
    nextIndex = Math.max(0, Math.min(categoryStats.length - 1, Math.floor((pointer.x - area.left) / slotWidth)));
  }
  if (nextIndex !== activeCategoryIndex) {
    activeCategoryIndex = nextIndex;
    drawCategoryBarChart();
  }
};

if (complaintTrendChart && !isMacOS) {
  complaintTrendChart.addEventListener('mousemove', updateTrendHover);
  complaintTrendChart.addEventListener('mouseleave', () => {
    activeTrendIndex = 0;
    drawTrendChart();
  });
}

if (categoryBarChart && !isMacOS) {
  categoryBarChart.addEventListener('mousemove', updateCategoryHover);
  categoryBarChart.addEventListener('mouseleave', () => {
    activeCategoryIndex = -1;
    drawCategoryBarChart();
  });
}

renderHotBreakdown();

const getFilteredTopics = (filter) => {
  if (filter === 'all') return topics;
  if (filter === 'hot') return [...topics]
    .filter((topic) => Number(topic.hotScore || 0) > 0)
    .sort((a, b) => Number(b.hotScore || 0) - Number(a.hotScore || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (filter === 'mine') return currentUser ? topics.filter((topic) => topic.mine) : [];
  if (filter === 'resolved') return topics.filter((topic) => topic.resolved);
  if (filter === 'new') return topics;
  if (filter === 'unread') return topics.filter((topic) => topic.unread);
  if (filter === 'liked') return currentUser ? topics.filter((topic) => topic.liked) : [];
  if (filter === 'favorites') return currentUser ? topics.filter((topic) => topic.favorite) : [];
  return topics.filter((topic) => topic.category === filter);
};

const setActiveSidebar = (filter) => {
  sidebarLinks.forEach((item) => item.classList.toggle('active', item.dataset.filter === filter));
};

const setActiveNav = (filter) => {
  navLinks.forEach((item) => item.classList.toggle('active', item.dataset.navFilter === filter));
};

const resetChips = () => {
  categoryChip.textContent = '板块：全部 ▸';
  tagChip.textContent = '标签：全部 ▸';
  currentTagKeyword = '';
  if (typeof categoryMenu !== 'undefined') {
    categoryMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.category === '全部'));
  }
  renderTagMenu('all');
};

const syncCategoryChip = (filter = currentFilter) => {
  if (!categoryChip || !categoryMenu) return;
  const categoryNames = getVisibleCategories().map((category) => category.name);
  const selectedCategory = categoryNames.includes(filter) ? filter : '全部';
  categoryChip.textContent = `板块：${selectedCategory} ▸`;
  categoryMenu.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === selectedCategory);
  });
};

const setAdminMode = (enabled) => {
  if (createPostBtn) createPostBtn.hidden = enabled;
};

const switchFilter = (filter, title, options = {}) => {
  if (!currentUser && ['mine', 'liked', 'favorites'].includes(filter)) {
    showToast('请先登录后查看个人内容');
    openLogin();
    return;
  }

  currentFilter = filter;
  currentTitle = title;
  topicPanel.hidden = false;
  adminPanel.hidden = true;
  setAdminMode(false);
  if (!options.keepSearch) searchInput.value = '';
  if (!options.keepTag) currentTagKeyword = '';
  if (!currentTagKeyword) tagChip.textContent = '标签：全部 ▸';
  syncCategoryChip(filter);
  renderTagMenu(filter);
  setActiveSidebar(filter);
  setActiveNav(filter);
  loadPersistedTopics({ silent: true, reset: true });
};

const renderTopics = (filter = currentFilter, title = currentTitle) => {
  currentFilter = filter;
  currentTitle = title;
  const query = searchInput.value.trim().toLowerCase();
  const baseData = getFilteredTopics(filter);
  const data = baseData.filter((topic) => {
    const text = [topic.title, topic.content, topic.category, topic.activity, topic.authorName, ...topic.tags, ...topic.posters].join(' ').toLowerCase();
    const matchedSearch = query ? text.includes(query) : true;
    const matchedTag = currentTagKeyword ? topic.tags.includes(currentTagKeyword) : true;
    return matchedSearch && matchedTag;
  });

  topicPanel.hidden = false;
  adminPanel.hidden = true;
  setAdminMode(false);
  syncCategoryChip(filter);
  const searchText = query ? `，搜索「${searchInput.value.trim()}」` : '';
  const tagText = currentTagKeyword ? `，标签「${currentTagKeyword}」` : '';
  listHint.hidden = !hasNewPostsNotice;
  listHint.textContent = '有新的吐槽，点击进行刷新';
  listHint.title = `${title}${searchText}${tagText}，已加载 ${data.length} 条帖子`;

  if (!data.length) {
    topicBody.innerHTML = `<tr><td colspan="6" class="empty-state">暂时没有符合条件的帖子</td></tr>`;
    return;
  }

  topicBody.innerHTML = data.map((topic, index) => {
    const safeId = escapeHtml(topic.id);
    const safeTitle = escapeHtml(topic.title);
    const safeAuthor = escapeHtml(topic.authorName || topic.posters[0] || '?');
    const safePoster = escapeHtml(topic.posters[0] || '?');
    const safeActivity = escapeHtml(topic.activity);
    const safeColor = colors[index % colors.length];
    const safeLikeLabel = escapeHtml(`${topic.liked ? '取消点赞' : '点赞'}：${topic.title}`);

    return `
      <tr class="topic-row" data-topic-row-id="${safeId}" tabindex="0">
        <td class="topic-main">
          <div class="topic-title-line">
            ${topic.pinned ? '<span class="pin">置顶</span>' : ''}
            <a class="topic-title" href="#" data-topic-id="${safeId}">${safeTitle}</a>
          </div>
          <div class="topic-meta">
            ${topic.tags.map(tag => `<span class="tag ${tagClass(tag)}">${escapeHtml(tag)}</span>`).join('')}
            ${topic.favorite ? '<span class="tag purple">已收藏</span>' : ''}
            ${topic.liked ? '<span class="tag blue">已点赞</span>' : ''}
          </div>
        </td>
        <td class="posters-cell">
          <div class="posters author-posters" title="发布人：${safeAuthor}">
            <span class="mini-avatar" style="background:${safeColor}" title="${safeAuthor}">${safePoster}</span>
          </div>
        </td>
        <td class="like-cell">
          <button class="quick-like-btn ${topic.liked ? 'liked' : ''}" data-like-topic-id="${safeId}" aria-label="${safeLikeLabel}">
            <span class="quick-like-thumb" aria-hidden="true">赞</span>
            <span class="quick-like-count">${Number(topic.likeCount || 0)}</span>
          </button>
          <small>${Number(topic.favoriteCount || 0)} 藏</small>
        </td>
        <td class="num">${Number(topic.replies || 0)}<small>评论</small></td>
        <td class="num">${Number(topic.views || 0)}<small>浏览</small></td>
        <td class="num activity">${safeActivity}<small>活动</small></td>
      </tr>
    `;
  }).join('');
};

sidebarLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    resetChips();
    const filter = link.dataset.filter;
    const title = link.dataset.title;

    if (filter === 'admin') {
      if (!currentUser) {
        showToast('请先登录后再进入后台');
        openLogin();
        return;
      }
      if (currentUser.role !== 'admin') {
        showToast('当前账号没有管理员权限');
        return;
      }
      currentFilter = filter;
      currentTitle = title;
      topicPanel.hidden = true;
      adminPanel.hidden = false;
      setAdminMode(true);
      sidebarLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      navLinks.forEach((item) => item.classList.remove('active'));
      loadAdminStats({ silent: true });
      loadAdminPosts({ silent: true });
      loadAdminReports({ silent: true });
      showToast('已进入管理员后台');
      return;
    }

    switchFilter(filter, title);
  });
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    resetChips();
    switchFilter(link.dataset.navFilter, link.dataset.navTitle);
  });
});

renderTopics();

searchInput.addEventListener('input', () => {
  if (currentFilter === 'admin') return;
  renderTopics(currentFilter, currentTitle);
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    searchInput.value = '';
    renderTopics(currentFilter, currentTitle);
    searchInput.blur();
    showToast('已清空搜索');
  }
});

window.addEventListener('scroll', () => {
  if (currentFilter === 'admin' || !postPageHasMore || postPageLoading) return;
  const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  if (remaining < 360) loadPersistedTopics({ silent: true, reset: false });
}, { passive: true });

brandHome.addEventListener('click', (event) => {
  event.preventDefault();
  resetChips();
  switchFilter('all', '最新吐槽');
  showToast('已回到首页');
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 980) sidebar.classList.toggle('open');
  else sidebar.classList.toggle('collapsed');
});

const closeDropdowns = () => {
  categoryMenu.hidden = true;
  tagMenu.hidden = true;
  categoryChip.classList.remove('open');
  tagChip.classList.remove('open');
  categoryChip.setAttribute('aria-expanded', 'false');
  tagChip.setAttribute('aria-expanded', 'false');
};

const openDropdown = (menu, chip) => {
  const willOpen = menu.hidden;
  closeDropdowns();
  if (willOpen) {
    menu.hidden = false;
    chip.classList.add('open');
    chip.setAttribute('aria-expanded', 'true');
  }
};

if (adminSearchInput) {
  adminSearchInput.addEventListener('input', renderAdminPosts);
  adminSearchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    adminSearchInput.value = '';
    renderAdminPosts();
    adminSearchInput.blur();
  });
}

if (adminStatusFilter) {
  adminStatusFilter.addEventListener('change', () => loadAdminPosts({ silent: false }));
}

if (adminCategoryForm) {
  adminCategoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = adminCategoryName.value.trim();
    if (!name) {
      showToast('请输入板块名称');
      return;
    }
    const submitBtn = adminCategoryForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      await apiRequest('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      adminCategoryForm.reset();
      await loadCategories();
      await loadAdminStats({ silent: true });
      showToast('板块已添加');
    } catch (error) {
      showToast(error.message || '板块添加失败');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

if (adminTagForm) {
  adminTagForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const category = adminTagCategory.value;
    const tags = adminTagInput.value.trim();
    if (!category || !tags) {
      showToast('请选择板块并输入标签');
      return;
    }
    const submitBtn = adminTagForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      await apiRequest('/api/categories/tags', {
        method: 'PATCH',
        body: JSON.stringify({ category, tags }),
      });
      adminTagInput.value = '';
      await loadCategories();
      showToast('标签已添加');
    } catch (error) {
      showToast(error.message || '标签添加失败');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

if (adminDeleteCategoryBtn) {
  adminDeleteCategoryBtn.addEventListener('click', async () => {
    const category = adminTagCategory.value;
    const tag = adminTagInput.value.trim();
    if (!category) {
      showToast('请选择板块');
      return;
    }
    const targetText = tag ? `删除 ${category} 下的标签「${tag}」` : `删除板块「${category}」`;
    if (!window.confirm(`${targetText}？此操作不可撤销。`)) return;
    adminDeleteCategoryBtn.disabled = true;
    try {
      await apiRequest('/api/categories', {
        method: 'DELETE',
        body: JSON.stringify({ category, tag }),
      });
      adminTagInput.value = '';
      await loadCategories();
      await loadAdminStats({ silent: true });
      showToast(tag ? '标签已删除' : '板块已删除');
    } catch (error) {
      showToast(error.message || '删除失败');
    } finally {
      adminDeleteCategoryBtn.disabled = false;
    }
  });
}

if (adminPostBody) {
  adminPostBody.addEventListener('click', async (event) => {
    const dismissReportButton = event.target.closest('[data-admin-dismiss-report-id]');
    if (dismissReportButton) {
      reportedPostIds.delete(String(dismissReportButton.dataset.adminDismissReportId));
      renderAdminPosts();
      showToast('举报已驳回');
      return;
    }

    const statusButton = event.target.closest('[data-admin-status-id]');
    if (!statusButton) {
      const row = event.target.closest('.admin-post-row[data-admin-row-id]');
      if (!row || event.target.closest('.admin-action-group')) return;
      const adminPost = adminPosts.find((post) => String(post.id) === String(row.dataset.adminRowId));
      if (adminPost) updateTopicFromPost(adminPost, { preserveState: true, prepend: false });
      openTopicDetail(row.dataset.adminRowId);
      return;
    }
    statusButton.disabled = true;
    try {
      const { post } = await apiRequest(`/api/posts/${encodeURIComponent(statusButton.dataset.adminStatusId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusButton.dataset.status }),
      });
      const index = adminPosts.findIndex((item) => String(item.id) === String(post.id));
      if (index >= 0) adminPosts.splice(index, 1, post);
      else adminPosts.unshift(post);
      if (post.status === 'deleted') {
        const topicIndex = topics.findIndex((topic) => topic.persisted && String(topic.id) === String(post.id));
        if (topicIndex >= 0) topics.splice(topicIndex, 1);
      } else {
        updateTopicFromPost(post, { preserveState: true, prepend: false });
      }
      renderAdminPosts();
      await loadPersistedTopics({ silent: true });
      await loadAdminStats({ silent: true });
      await loadAdminPosts({ silent: true });
      if (post.status === 'deleted') showToast('帖子已标记删除，5 分钟内可在此处恢复');
      else if (statusButton.dataset.status === 'open') showToast('帖子已恢复');
      else showToast('帖子状态已更新');
    } catch (error) {
      showToast(error.message || '状态更新失败');
    } finally {
      statusButton.disabled = false;
    }
  });

  adminPostBody.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    const row = event.target.closest('.admin-post-row[data-admin-row-id]');
    if (!row || event.target.closest('.admin-action-group')) return;
    event.preventDefault();
    const adminPost = adminPosts.find((post) => String(post.id) === String(row.dataset.adminRowId));
    if (adminPost) updateTopicFromPost(adminPost, { preserveState: true, prepend: false });
    openTopicDetail(row.dataset.adminRowId);
  });
}

if (adminActionList) {
  adminActionList.addEventListener('click', async (event) => {
    const actionCard = event.target.closest('[data-action-id][data-report-id]');
    if (!actionCard) return;
    const report = adminReports.find((item) => String(item.id) === String(actionCard.dataset.reportId));
    const actionItem = report?.payload?.actionItems?.find((item) => String(item.id) === String(actionCard.dataset.actionId));
    if (!report || !actionItem) return;

    const archiveButton = event.target.closest('[data-action-archive]');
    if (archiveButton) {
      archivedActionItems.add(`${report.id}:${actionItem.id}`);
      renderAdminActionItems(report);
      renderArchivedActionItems();
      showToast('处理项已归档');
      return;
    }

    const statusButton = event.target.closest('[data-action-status]');
    if (!statusButton) return;
    const nextStatus = statusButton.dataset.actionStatus;
    statusButton.disabled = true;
    try {
      const { posts = [] } = await apiRequest('/api/posts/admin/status', {
        method: 'PATCH',
        body: JSON.stringify({ postIds: actionItem.postIds || [], status: nextStatus }),
      });
      actionItem.status = nextStatus;
      posts.forEach((post) => updateTopicFromPost(post, { preserveState: true, prepend: false }));
      renderAdminActionItems(report);
      await loadPersistedTopics({ silent: true });
      await loadAdminPosts({ silent: true });
      await loadAdminStats({ silent: true });
      showToast(nextStatus === 'resolved' ? '相关帖子已标为已处理' : '相关帖子已恢复待处理');
    } catch (error) {
      showToast(error.message || '处理项更新失败');
    } finally {
      statusButton.disabled = false;
    }
  });
}

if (adminArchivedList) {
  adminArchivedList.addEventListener('click', (event) => {
    const restoreButton = event.target.closest('[data-restore-archived]');
    if (!restoreButton) return;
    const item = event.target.closest('[data-archived-key][data-report-id]');
    if (!item) return;
    archivedActionItems.delete(item.dataset.archivedKey);
    const report = adminReports.find((reportItem) => String(reportItem.id) === String(item.dataset.reportId)) || adminReports[0];
    renderAdminActionItems(report);
    renderArchivedActionItems();
    showToast('已恢复建议处理项');
  });
}

document.querySelectorAll('[data-expand-card]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const card = button.closest('article, .admin-manage');
    if (!card) return;
    document.querySelectorAll('.admin-workbench article.is-expanded, .admin-manage.is-expanded').forEach((item) => {
      if (item !== card) {
        item.classList.remove('is-expanded');
        const itemButton = item.querySelector('[data-expand-card]');
        if (itemButton) itemButton.textContent = '＋';
      }
    });
    card.classList.toggle('is-expanded');
    button.textContent = card.classList.contains('is-expanded') ? '－' : '＋';
  });
});

categoryChip.addEventListener('click', (event) => {
  event.stopPropagation();
  openDropdown(categoryMenu, categoryChip);
});

tagChip.addEventListener('click', (event) => {
  event.stopPropagation();
  openDropdown(tagMenu, tagChip);
});

categoryMenu.addEventListener('click', (event) => {
  const option = event.target.closest('[data-category]');
  if (!option) return;
  const category = option.dataset.category;
  categoryMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn === option));
  categoryChip.textContent = `板块：${category} ▸`;
  searchInput.value = '';
  currentTagKeyword = '';
  tagChip.textContent = '标签：全部 ▸';
  renderTagMenu(category === '全部' ? 'all' : category);
  closeDropdowns();
  if (category === '全部') switchFilter('all', '最新吐槽', { keepTag: true });
  else switchFilter(category, category, { keepTag: true });
  showToast(`已选择板块：${category}`);
});

tagMenu.addEventListener('click', (event) => {
  const option = event.target.closest('[data-tag]');
  if (!option) return;
  const tag = option.dataset.tag;
  tagMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn === option));
  currentTagKeyword = tag === '全部' ? '' : tag;
  tagChip.textContent = `标签：${tag} ▸`;
  closeDropdowns();
  renderTopics(currentFilter === 'admin' ? 'all' : currentFilter, currentFilter === 'admin' ? '最新吐槽' : currentTitle);
  showToast(currentTagKeyword ? `已选择标签：${currentTagKeyword}` : '已清除标签筛选');
});

document.addEventListener('click', closeDropdowns);

weekActiveChip.addEventListener('click', () => {
  resetChips();
  switchFilter('hot', '本周活跃');
  showToast('已切换到本周活跃吐槽');
});

listHint.addEventListener('click', async () => {
  await loadPersistedTopics({ silent: false, reset: true });
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

const applyTheme = (mode) => {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '日光' : '黑夜';
  if (adminPanel && !adminPanel.hidden) renderAdminCharts();
};

const savedTheme = localStorage.getItem('campusVoiceTheme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem('campusVoiceTheme', nextTheme);
  applyTheme(nextTheme);
  showToast(nextTheme === 'dark' ? '已切换夜间模式' : '已切换日间模式');
});

const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const rulesClose = document.getElementById('rulesClose');
const rulesOk = document.getElementById('rulesOk');
const openRules = () => { rulesModal.hidden = false; };
const closeRules = () => { rulesModal.hidden = true; };
rulesBtn.addEventListener('click', openRules);
rulesClose.addEventListener('click', closeRules);
rulesOk.addEventListener('click', closeRules);
rulesModal.addEventListener('click', (event) => { if (event.target === rulesModal) closeRules(); });

const createPostModal = document.getElementById('createPostModal');
const createPostClose = document.getElementById('createPostClose');
const createPostCancel = document.getElementById('createPostCancel');
const createPostForm = document.getElementById('createPostForm');
const postTitleInput = document.getElementById('postTitleInput');
const postCategoryInput = document.getElementById('postCategoryInput');
const postContentInput = document.getElementById('postContentInput');
const postAnonymousInput = document.getElementById('postAnonymousInput');
const announcementModal = document.getElementById('announcementModal');
const announcementClose = document.getElementById('announcementClose');
const announcementList = document.getElementById('announcementList');
const announcementEditorModal = document.getElementById('announcementEditorModal');
const announcementEditorClose = document.getElementById('announcementEditorClose');
const announcementCancel = document.getElementById('announcementCancel');
const announcementForm = document.getElementById('announcementForm');
const announcementTitleInput = document.getElementById('announcementTitleInput');
const announcementContentInput = document.getElementById('announcementContentInput');

const getAnnouncements = () => topics
  .filter((topic) => topic.category === '公告')
  .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

const renderAnnouncements = () => {
  if (!announcementList) return;
  const announcements = getAnnouncements();
  if (!announcements.length) {
    announcementList.innerHTML = '<div class="announcement-empty">暂无公告。</div>';
    return;
  }
  announcementList.innerHTML = announcements.map((topic) => `
    <button type="button" class="announcement-item" data-announcement-id="${escapeHtml(topic.id)}">
      <strong>${escapeHtml(topic.title)}</strong>
      <span>${escapeHtml(new Date(topic.createdAt || Date.now()).toLocaleString('zh-CN'))}</span>
      <p>${escapeHtml(topic.content || '')}</p>
    </button>
  `).join('');
};

const openAnnouncements = () => {
  renderAnnouncements();
  announcementModal.hidden = false;
};

const closeAnnouncements = () => { announcementModal.hidden = true; };

const openAnnouncementEditor = () => {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('只有管理员可以发布公告');
    return;
  }
  announcementForm.reset();
  announcementEditorModal.hidden = false;
  setTimeout(() => announcementTitleInput.focus(), 60);
};

const closeAnnouncementEditor = () => {
  announcementEditorModal.hidden = true;
  announcementForm.reset();
};

const openCreatePost = () => {
  if (!currentUser) {
    showToast('请先登录后再发布吐槽');
    openLogin();
    return;
  }
  applyCreatePostDefaultCategory();
  renderPostTagOptions();
  createPostModal.hidden = false;
  setTimeout(() => postTitleInput.focus(), 60);
};
const closeCreatePost = () => {
  createPostModal.hidden = true;
  createPostForm.reset();
  postAnonymousInput.checked = false;
  renderPostTagOptions();
};

createPostBtn.addEventListener('click', openCreatePost);
createPostClose.addEventListener('click', closeCreatePost);
createPostCancel.addEventListener('click', closeCreatePost);
createPostModal.addEventListener('click', (event) => { if (event.target === createPostModal) closeCreatePost(); });
postCategoryInput.addEventListener('change', renderPostTagOptions);
announcementBtn.addEventListener('click', openAnnouncements);
announcementClose.addEventListener('click', closeAnnouncements);
announcementModal.addEventListener('click', (event) => { if (event.target === announcementModal) closeAnnouncements(); });
announcementList.addEventListener('click', (event) => {
  const item = event.target.closest('[data-announcement-id]');
  if (!item) return;
  closeAnnouncements();
  openTopicDetail(item.dataset.announcementId);
});
announcementEditorClose.addEventListener('click', closeAnnouncementEditor);
announcementCancel.addEventListener('click', closeAnnouncementEditor);
announcementEditorModal.addEventListener('click', (event) => { if (event.target === announcementEditorModal) closeAnnouncementEditor(); });

announcementForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = announcementTitleInput.value.trim();
  const content = announcementContentInput.value.trim();
  if (!title || !content) {
    showToast('请填写公告标题和内容');
    return;
  }
  const submitBtn = announcementForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '发布中...';
  try {
    const { post } = await apiRequest('/api/posts/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    updateTopicFromPost(post, { preserveState: false, prepend: true });
    closeAnnouncementEditor();
    renderAnnouncements();
    renderTopics(currentFilter, currentTitle);
    showToast('公告已发布并留档');
  } catch (error) {
    showToast(error.message || '公告发布失败');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

createPostForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = postTitleInput.value.trim();
  const content = postContentInput.value.trim();
  const category = postCategoryInput.value;
  const tags = [...createPostForm.querySelectorAll('input[name="postTags"]:checked')].map((input) => input.value);
  const isAnonymous = postAnonymousInput.checked;

  if (!title) {
    postTitleInput.focus();
    showToast('请输入标题');
    return;
  }

  if (!content) {
    postContentInput.focus();
    showToast('请输入具体内容');
    return;
  }

  const submitBtn = createPostForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '发布中...';

  try {
    const { post } = await apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category, tags, isAnonymous }),
    });
    const topic = updateTopicFromPost(post, { preserveState: false, prepend: true });
    if (topic) topic.unread = true;
    closeCreatePost();
    resetChips();
    switchFilter('all', '最新吐槽');
    loadAdminStats({ silent: true });
    showToast('发布成功，已保存到数据库');
  } catch (error) {
    showToast(error.message || '发布失败，请稍后重试');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

const topicDetailModal = document.getElementById('topicDetailModal');
const topicDetailClose = document.getElementById('topicDetailClose');
const detailTitle = document.getElementById('detailTitle');
const detailTags = document.getElementById('detailTags');
const detailMeta = document.getElementById('detailMeta');
const detailContent = document.getElementById('detailContent');
const commentList = document.getElementById('commentList');
const detailReplyBtn = document.getElementById('detailReplyBtn');
const replyBox = document.getElementById('replyBox');
const replyCancelBtn = document.getElementById('replyCancelBtn');
const replyInput = document.getElementById('replyInput');
const replySubmitBtn = document.getElementById('replySubmitBtn');
const likeBtn = document.getElementById('likeBtn');
const likeText = likeBtn.querySelector('.like-text');
const favoriteBtn = document.getElementById('favoriteBtn');
const reportBtn = document.getElementById('reportBtn');

const refreshDetailButtons = (topic) => {
  likeText.textContent = topic.liked ? `已点赞 ${topic.likeCount}` : `点赞 ${topic.likeCount}`;
  likeBtn.classList.toggle('liked', topic.liked);
  favoriteBtn.textContent = topic.favorite ? `已收藏 ${topic.favoriteCount || 0}` : `收藏 ${topic.favoriteCount || 0}`;
};

const renderComments = (comments = []) => {
  if (!commentList) return;
  if (!comments.length) {
    commentList.innerHTML = '<div class="comment-empty">还没有评论，来写下第一条吧。</div>';
    return;
  }
  commentList.innerHTML = comments.map((comment) => {
    const canDelete = Boolean(currentUser && (currentUser.role === 'admin' || comment.mine || String(comment.author?.id) === String(currentUser.id)));
    const canLike = Boolean(currentUser && currentUser.role !== 'admin' && !canDelete);
    const actionHtml = canDelete
      ? `<button type="button" class="comment-action-btn" data-comment-delete-id="${escapeHtml(comment.id)}">删除</button>`
      : `<button type="button" class="comment-action-btn ${comment.liked ? 'liked' : ''}" data-comment-like-id="${escapeHtml(comment.id)}" ${canLike ? '' : 'disabled'}>${comment.liked ? '已点赞' : '点赞'} ${Number(comment.likeCount || 0)}</button>`;
    return `
    <article class="comment-item" data-comment-id="${escapeHtml(comment.id)}">
      <div class="comment-meta">
        <div>
          <strong>${escapeHtml(comment.author?.name || '同学')}</strong>
          <span>${escapeHtml(getRelativeActivity(comment.createdAt))}</span>
        </div>
        ${actionHtml}
      </div>
      <p class="comment-body">${escapeHtml(comment.content || '')}</p>
    </article>
  `;
  }).join('');
};

const replaceTopicComment = (topic, comment) => {
  if (!topic || !comment) return;
  const comments = Array.isArray(topic.comments) ? [...topic.comments] : [];
  const index = comments.findIndex((item) => String(item.id) === String(comment.id));
  if (index >= 0) comments.splice(index, 1, comment);
  else comments.push(comment);
  topic.comments = comments;
};

const removeTopicComment = (topic, commentId) => {
  if (!topic) return;
  topic.comments = (topic.comments || []).filter((comment) => String(comment.id) !== String(commentId));
  topic.replies = Math.max(0, Number(topic.replies || 0) - 1);
};

const toggleTopicLike = (topic, sourceButton = null) => {
  topic.liked = !topic.liked;
  topic.likeCount = Math.max(0, (topic.likeCount || 0) + (topic.liked ? 1 : -1));
  topic.hotScore = Number(topic.likeCount || 0) + Number(topic.favoriteCount || 0);
  topic.hot = topic.hotScore > 0;
  if (sourceButton && topic.liked) {
    sourceButton.classList.remove('like-pop');
    void sourceButton.offsetWidth;
    sourceButton.classList.add('like-pop');
  }
};

const renderCurrentTopicList = () => {
  renderTopics(currentFilter === 'admin' ? 'all' : currentFilter, currentFilter === 'admin' ? '最新吐槽' : currentTitle);
};

const toggleLikeForTopic = async (topic, sourceButton = null) => {
  if (!topic) return null;
  if (!currentUser) {
    showToast('请先登录后再点赞');
    openLogin();
    return null;
  }

  if (!topic.persisted) {
    toggleTopicLike(topic, sourceButton);
    renderCurrentTopicList();
    if (currentTopicId === topic.id) refreshDetailButtons(topic);
    showToast(topic.liked ? '已点赞' : '已取消点赞');
    return topic;
  }

  if (sourceButton) sourceButton.disabled = true;
  try {
    const { post } = await apiRequest(`/api/posts/${encodeURIComponent(topic.id)}/like`, { method: 'POST' });
    const updatedTopic = updateTopicFromPost(post, { preserveState: true, prepend: false }) || topic;
    renderCurrentTopicList();
    if (currentTopicId === updatedTopic.id) refreshDetailButtons(updatedTopic);
    if (sourceButton && updatedTopic.liked) {
      const refreshedLikeBtn = topicBody.querySelector(`[data-like-topic-id="${updatedTopic.id}"]`);
      const popTarget = refreshedLikeBtn || sourceButton;
      popTarget.classList.remove('like-pop');
      void popTarget.offsetWidth;
      popTarget.classList.add('like-pop');
    }
    showToast(updatedTopic.liked ? '已点赞' : '已取消点赞');
    return updatedTopic;
  } catch (error) {
    showToast(error.message || '点赞失败，请稍后重试');
    return null;
  } finally {
    if (sourceButton) sourceButton.disabled = false;
  }
};

const openTopicDetail = async (topicId) => {
  const topic = topics.find((item) => item.id === topicId);
  if (!topic) return;
  currentTopicId = topicId;

  if (topic.persisted) {
    try {
      const { post } = await apiRequest(`/api/posts/${encodeURIComponent(topicId)}`);
      updateTopicFromPost(post, { preserveState: true, prepend: false });
    } catch (error) {
      showToast(error.message || '帖子详情加载失败');
    }
  } else {
    topic.views += 1;
  }

  const latestTopic = topics.find((item) => item.id === topicId) || topic;
  latestTopic.unread = false;
  detailTitle.textContent = latestTopic.title;
  detailTags.innerHTML = latestTopic.tags.map((tag) => `<span class="tag ${tagClass(tag)}">${escapeHtml(tag)}</span>`).join('');
  detailMeta.innerHTML = `
    <span>板块：${escapeHtml(latestTopic.category)}</span>
    <span>评论：${Number(latestTopic.replies || 0)}</span>
    <span>浏览：${Number(latestTopic.views || 0)}</span>
    <span>收藏：${Number(latestTopic.favoriteCount || 0)}</span>
    <span>活动：${escapeHtml(latestTopic.activity)}</span>
    <span>发布人：${escapeHtml(latestTopic.authorName || latestTopic.posters[0] || '匿名')}</span>
  `;
  detailContent.textContent = latestTopic.content;
  renderComments(latestTopic.comments || []);
  replyBox.hidden = true;
  replyInput.value = '';
  refreshDetailButtons(latestTopic);
  topicDetailModal.hidden = false;
  renderCurrentTopicList();
};

const closeTopicDetail = () => {
  topicDetailModal.hidden = true;
  replyBox.hidden = true;
  currentTopicId = null;
};

const getCurrentTopic = () => topics.find((item) => item.id === currentTopicId);

topicBody.addEventListener('click', (event) => {
  const quickLikeBtn = event.target.closest('.quick-like-btn[data-like-topic-id]');
  if (quickLikeBtn) {
    event.preventDefault();
    event.stopPropagation();
    const topic = topics.find((item) => item.id === quickLikeBtn.dataset.likeTopicId);
    if (!topic) return;
    toggleLikeForTopic(topic, quickLikeBtn);
    return;
  }

  const link = event.target.closest('.topic-title[data-topic-id]');
  const row = event.target.closest('.topic-row[data-topic-row-id]');
  if (!link && !row) return;
  event.preventDefault();
  openTopicDetail(link?.dataset.topicId || row.dataset.topicRowId);
});

topicBody.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const row = event.target.closest('.topic-row[data-topic-row-id]');
  if (!row) return;
  event.preventDefault();
  openTopicDetail(row.dataset.topicRowId);
});

topicDetailClose.addEventListener('click', closeTopicDetail);
topicDetailModal.addEventListener('click', (event) => { if (event.target === topicDetailModal) closeTopicDetail(); });
commentList.addEventListener('click', async (event) => {
  const likeButton = event.target.closest('[data-comment-like-id]');
  const deleteButton = event.target.closest('[data-comment-delete-id]');
  if (!likeButton && !deleteButton) return;
  const topic = getCurrentTopic();
  if (!topic) return;
  if (!currentUser) {
    showToast('请先登录后再操作评论');
    openLogin();
    return;
  }

  if (likeButton) {
    likeButton.disabled = true;
    try {
      const { comment } = await apiRequest(`/api/posts/comments/${encodeURIComponent(likeButton.dataset.commentLikeId)}/like`, { method: 'POST' });
      replaceTopicComment(topic, comment);
      renderComments(topic.comments || []);
      showToast(comment.liked ? '已点赞评论' : '已取消评论点赞');
    } catch (error) {
      showToast(error.message || '评论点赞失败');
    } finally {
      likeButton.disabled = false;
    }
    return;
  }

  deleteButton.disabled = true;
  try {
    const { post } = await apiRequest(`/api/posts/comments/${encodeURIComponent(deleteButton.dataset.commentDeleteId)}`, { method: 'DELETE' });
    removeTopicComment(topic, deleteButton.dataset.commentDeleteId);
    if (post) {
      const updatedTopic = updateTopicFromPost(post, { preserveState: true, prepend: false }) || topic;
      updatedTopic.comments = topic.comments || [];
    }
    renderComments(topic.comments || []);
    renderCurrentTopicList();
    detailMeta.querySelector('span:nth-child(2)').textContent = `评论：${Number(topic.replies || 0)}`;
    showToast('评论已删除');
  } catch (error) {
    showToast(error.message || '评论删除失败');
  } finally {
    deleteButton.disabled = false;
  }
});
detailReplyBtn.addEventListener('click', () => {
  replyBox.hidden = !replyBox.hidden;
  if (!replyBox.hidden) replyInput.focus();
});
replyCancelBtn.addEventListener('click', () => {
  replyInput.value = '';
  replyBox.hidden = true;
});
likeBtn.addEventListener('click', async () => {
  const topic = getCurrentTopic();
  await toggleLikeForTopic(topic, likeBtn);
});
favoriteBtn.addEventListener('click', async () => {
  const topic = getCurrentTopic();
  if (!topic) return;
  if (!currentUser) {
    showToast('请先登录后再收藏');
    openLogin();
    return;
  }
  if (!topic.persisted) {
    topic.favorite = !topic.favorite;
    topic.favoriteCount = Math.max(0, Number(topic.favoriteCount || 0) + (topic.favorite ? 1 : -1));
    refreshDetailButtons(topic);
    renderCurrentTopicList();
    showToast(topic.favorite ? '已加入收藏' : '已取消收藏');
    return;
  }
  favoriteBtn.disabled = true;
  try {
    const { post } = await apiRequest(`/api/posts/${encodeURIComponent(topic.id)}/favorite`, { method: 'POST' });
    const updatedTopic = updateTopicFromPost(post, { preserveState: true, prepend: false }) || topic;
    refreshDetailButtons(updatedTopic);
    renderCurrentTopicList();
    showToast(updatedTopic.favorite ? '已加入收藏' : '已取消收藏');
  } catch (error) {
    showToast(error.message || '收藏失败，请稍后重试');
  } finally {
    favoriteBtn.disabled = false;
  }
});
reportBtn.addEventListener('click', () => {
  const topic = getCurrentTopic();
  if (topic) {
    reportedPostIds.add(String(topic.id));
    const adminPost = adminPosts.find((post) => String(post.id) === String(topic.id));
    if (!adminPost) adminPosts.unshift(topic);
    renderAdminPosts();
  }
  showToast('举报已提交，管理员会进行审核');
});
replySubmitBtn.addEventListener('click', async () => {
  const topic = getCurrentTopic();
  if (!topic || !replyInput.value.trim()) {
    showToast('请先输入评论内容');
    return;
  }
  if (!currentUser) {
    showToast('请先登录后再评论');
    openLogin();
    return;
  }
  const content = replyInput.value.trim();
  replySubmitBtn.disabled = true;
  try {
    if (topic.persisted) {
      const { comment, post } = await apiRequest(`/api/posts/${encodeURIComponent(topic.id)}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      const updatedTopic = updateTopicFromPost(post, { preserveState: true, prepend: false }) || topic;
      updatedTopic.comments = [...(updatedTopic.comments || []), comment].filter(Boolean);
      renderComments(updatedTopic.comments);
      renderCurrentTopicList();
    } else {
      topic.replies += 1;
      topic.activity = '刚刚';
      if (!topic.posters.includes('我')) topic.posters.unshift('我');
      topic.comments = [...(topic.comments || []), {
        id: `local-comment-${Date.now()}`,
        content,
        author: { id: currentUser.id, name: currentUser.nickname || currentUser.email?.split('@')[0] || '我' },
        likeCount: 0,
        liked: false,
        mine: true,
        createdAt: new Date().toISOString(),
      }];
      renderComments(topic.comments);
      renderCurrentTopicList();
    }
    replyInput.value = '';
    replyBox.hidden = true;
    showToast('评论已提交');
  } catch (error) {
    showToast(error.message || '评论失败，请稍后重试');
  } finally {
    replySubmitBtn.disabled = false;
  }
});

if (generateReportBtn) {
  generateReportBtn.addEventListener('click', generateAdminReport);
}

window.addEventListener('resize', () => {
  if (!adminPanel.hidden) renderAdminCharts();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.admin-workbench article.is-expanded, .admin-manage.is-expanded').forEach((card) => {
    card.classList.remove('is-expanded');
    const button = card.querySelector('[data-expand-card]');
    if (button) button.textContent = '＋';
  });
  if (!rulesModal.hidden) closeRules();
  if (!createPostModal.hidden) closeCreatePost();
  if (!announcementModal.hidden) closeAnnouncements();
  if (!announcementEditorModal.hidden) closeAnnouncementEditor();
  if (!topicDetailModal.hidden) closeTopicDetail();
});

const loginModal = document.getElementById('loginModal');
const loginCard = loginModal.querySelector('.login-modal');
const loginClose = document.getElementById('loginClose');
const registerModal = document.getElementById('registerModal');
const registerClose = document.getElementById('registerClose');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const registerForm = document.getElementById('registerForm');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileCancel = document.getElementById('profileCancel');
const profileForm = document.getElementById('profileForm');
const profileEmail = document.getElementById('profileEmail');
const profileNickname = document.getElementById('profileNickname');
const securityModal = document.getElementById('securityModal');
const securityClose = document.getElementById('securityClose');
const securityCancel = document.getElementById('securityCancel');
const securityForm = document.getElementById('securityForm');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmNewPassword = document.getElementById('confirmNewPassword');

const closeProfile = () => {
  profileModal.hidden = true;
  profileForm.reset();
  profileEmail.classList.remove('invalid');
  profileNickname.classList.remove('invalid');
};

const openProfile = () => {
  if (!currentUser) {
    openLogin();
    return;
  }
  profileEmail.value = currentUser.email || '';
  profileNickname.value = currentUser.nickname || currentUser.email.split('@')[0];
  profileEmail.classList.remove('invalid');
  profileNickname.classList.remove('invalid');
  profileModal.hidden = false;
  setTimeout(() => profileEmail.focus(), 60);
};

const closeSecurity = () => {
  securityModal.hidden = true;
  securityForm.reset();
  [currentPassword, newPassword, confirmNewPassword].forEach((input) => input.classList.remove('invalid'));
};

const openSecurity = () => {
  if (!currentUser) {
    openLogin();
    return;
  }
  securityForm.reset();
  [currentPassword, newPassword, confirmNewPassword].forEach((input) => input.classList.remove('invalid'));
  securityModal.hidden = false;
  setTimeout(() => currentPassword.focus(), 60);
};

const openLogin = () => {
  if (currentUser) {
    userMenu.classList.toggle('open');
    loginBtn.setAttribute('aria-expanded', String(userMenu.classList.contains('open')));
    return;
  }

  loginModal.hidden = false;
  setTimeout(() => loginEmail.focus(), 60);
};

const logoutCurrentUser = async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    closeProfile();
    closeSecurity();
    updateAuthUI(null);
    await loadPersistedTopics();
    if (['liked', 'favorites', 'mine'].includes(currentFilter)) {
      resetChips();
      switchFilter('all', '最新吐槽');
    }
    showToast('已退出登录');
  } catch (error) {
    showToast(error.message);
  }
};

const markLoginError = (message) => {
  loginEmail.classList.add('invalid');
  loginPassword.classList.add('invalid');
  loginCard.classList.remove('auth-error');
  void loginCard.offsetWidth;
  loginCard.classList.add('auth-error');
  showToast(message);
};

const clearLoginError = () => {
  loginEmail.classList.remove('invalid');
  loginPassword.classList.remove('invalid');
  loginCard.classList.remove('auth-error');
};

const closeLogin = () => {
  loginModal.hidden = true;
  loginForm.reset();
  clearLoginError();
};

loginBtn.addEventListener('click', openLogin);
userMenuWrap.addEventListener('mouseenter', () => {
  if (!currentUser) return;
  userMenu.classList.add('open');
  loginBtn.setAttribute('aria-expanded', 'true');
});
userMenuWrap.addEventListener('mouseleave', () => {
  userMenu.classList.remove('open');
  loginBtn.setAttribute('aria-expanded', 'false');
});
userMenuAvatar.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  openAvatarPicker();
});
avatarFileInput.addEventListener('change', handleAvatarFileChange);
userMenu.addEventListener('click', async (event) => {
  const menuItem = event.target.closest('button');
  if (!menuItem) return;
  const userFilter = menuItem.dataset.userFilter;
  const userAction = menuItem.dataset.userAction;
  userMenu.classList.remove('open');
  loginBtn.setAttribute('aria-expanded', 'false');

  if (userFilter) {
    const titles = { liked: '我的点赞', favorites: '我的收藏', mine: '我的帖子' };
    resetChips();
    switchFilter(userFilter, titles[userFilter] || '个人中心');
    showToast(`已打开${titles[userFilter] || '个人中心'}`);
    return;
  }

  if (userAction === 'logout') {
    await logoutCurrentUser();
    return;
  }

  if (userAction === 'profile') {
    openProfile();
    return;
  }

  if (userAction === 'security') {
    openSecurity();
    return;
  }

  if (userAction === 'announcement') {
    openAnnouncementEditor();
  }
});
loginClose.addEventListener('click', closeLogin);
loginModal.addEventListener('click', (event) => {
  if (event.target === loginModal) closeLogin();
});
loginEmail.addEventListener('input', clearLoginError);
loginPassword.addEventListener('input', clearLoginError);
profileClose.addEventListener('click', closeProfile);
profileCancel.addEventListener('click', closeProfile);
profileModal.addEventListener('click', (event) => {
  if (event.target === profileModal) closeProfile();
});
profileEmail.addEventListener('input', () => profileEmail.classList.remove('invalid'));
profileNickname.addEventListener('input', () => profileNickname.classList.remove('invalid'));
securityClose.addEventListener('click', closeSecurity);
securityCancel.addEventListener('click', closeSecurity);
securityModal.addEventListener('click', (event) => {
  if (event.target === securityModal) closeSecurity();
});
[currentPassword, newPassword, confirmNewPassword].forEach((input) => {
  input.addEventListener('input', () => input.classList.remove('invalid'));
});

const openRegister = () => {
  loginModal.hidden = true;
  loginForm.reset();
  registerForm.reset();
  [registerEmail, registerPassword, registerConfirmPassword].forEach((input) => input.classList.remove('invalid'));
  registerModal.hidden = false;
  setTimeout(() => registerEmail.focus(), 60);
};

const closeRegister = () => {
  registerModal.hidden = true;
  registerForm.reset();
  [registerEmail, registerPassword, registerConfirmPassword].forEach((input) => input.classList.remove('invalid'));
};

const backToLogin = () => {
  closeRegister();
  loginModal.hidden = false;
  setTimeout(() => loginEmail.focus(), 60);
};

showRegisterBtn.addEventListener('click', openRegister);
registerClose.addEventListener('click', closeRegister);
registerModal.addEventListener('click', (event) => {
  if (event.target === registerModal) closeRegister();
});
backToLoginBtn.addEventListener('click', backToLogin);
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  [registerEmail, registerPassword, registerConfirmPassword].forEach((input) => input.classList.remove('invalid'));
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const confirmPassword = registerConfirmPassword.value.trim();
  if (!email) {
    registerEmail.classList.add('invalid');
    showToast('请输入注册邮箱');
    return;
  }
  if (password.length < 6) {
    registerPassword.classList.add('invalid');
    showToast('密码至少需要 6 位');
    return;
  }
  if (password !== confirmPassword) {
    registerPassword.classList.add('invalid');
    registerConfirmPassword.classList.add('invalid');
    showToast('两次输入的密码不一致');
    return;
  }

  try {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    closeRegister();
    loginModal.hidden = false;
    loginEmail.value = email;
    setTimeout(() => loginPassword.focus(), 60);
    showToast('注册成功，请登录');
  } catch (error) {
    showToast(error.message);
  }
});
profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = profileEmail.value.trim();
  const nickname = profileNickname.value.trim();
  profileEmail.classList.remove('invalid');
  profileNickname.classList.remove('invalid');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    profileEmail.classList.add('invalid');
    showToast('请输入有效邮箱');
    return;
  }
  if (!nickname) {
    profileNickname.classList.add('invalid');
    showToast('请输入用户名');
    return;
  }
  if (nickname.length > 24) {
    profileNickname.classList.add('invalid');
    showToast('用户名不能超过 24 个字符');
    return;
  }

  const submitBtn = profileForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '保存中...';
  try {
    const { user } = await apiRequest('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ email, nickname }),
    });
    updateAuthUI(user);
    await loadPersistedTopics();
    closeProfile();
    showToast('用户名已更新');
  } catch (error) {
    profileNickname.classList.add('invalid');
    showToast(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
securityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  [currentPassword, newPassword, confirmNewPassword].forEach((input) => input.classList.remove('invalid'));
  const currentPasswordValue = currentPassword.value;
  const newPasswordValue = newPassword.value;
  const confirmNewPasswordValue = confirmNewPassword.value;

  if (!currentPasswordValue) {
    currentPassword.classList.add('invalid');
    showToast('请输入当前密码');
    return;
  }
  if (newPasswordValue.length < 6) {
    newPassword.classList.add('invalid');
    showToast('新密码至少需要 6 位');
    return;
  }
  if (newPasswordValue !== confirmNewPasswordValue) {
    newPassword.classList.add('invalid');
    confirmNewPassword.classList.add('invalid');
    showToast('两次输入的新密码不一致');
    return;
  }
  if (currentPasswordValue === newPasswordValue) {
    newPassword.classList.add('invalid');
    showToast('新密码不能与当前密码相同');
    return;
  }

  const submitBtn = securityForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '更新中...';
  try {
    const { user } = await apiRequest('/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword: currentPasswordValue, newPassword: newPasswordValue }),
    });
    updateAuthUI(user);
    closeSecurity();
    showToast('密码已更新');
  } catch (error) {
    currentPassword.classList.add('invalid');
    showToast(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) {
    markLoginError('请填写邮箱和密码');
    return;
  }

  try {
    const { user } = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    closeLogin();
    updateAuthUI(user);
    await loadPersistedTopics();
    showToast('登录成功，欢迎回来');
  } catch (error) {
    markLoginError(error.message);
  }
});

const restoreAuthState = async () => {
  try {
    const { user } = await apiRequest('/api/auth/me');
    updateAuthUI(user);
    await loadPersistedTopics();
  } catch (_error) {
    updateAuthUI(null);
    await loadPersistedTopics();
  }
};

document.addEventListener('click', (event) => {
  if (!userMenuWrap.contains(event.target)) {
    userMenu.classList.remove('open');
    loginBtn.setAttribute('aria-expanded', 'false');
  }
});
const bootstrapApp = async () => {
  await loadCategories();
  await restoreAuthState();
};
bootstrapApp();
setInterval(checkForNewPosts, 60000);
setInterval(() => {
  if (adminPanel && !adminPanel.hidden && adminPosts.some((post) => post.status === 'deleted')) {
    renderAdminPosts();
  }
}, 30000);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!loginModal.hidden) closeLogin();
  if (!registerModal.hidden) closeRegister();
  if (!profileModal.hidden) closeProfile();
  if (!securityModal.hidden) closeSecurity();
  if (!announcementModal.hidden) closeAnnouncements();
  if (!announcementEditorModal.hidden) closeAnnouncementEditor();
});
