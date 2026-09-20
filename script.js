﻿let topics = [];


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
const brandText = document.getElementById('brandText');
const workspaceSwitchBtn = document.getElementById('workspaceSwitchBtn');
const workspaceSwitchLabel = document.getElementById('workspaceSwitchLabel');
const communityWorkspace = document.getElementById('communityWorkspace');
const classWorkspace = document.getElementById('classWorkspace');
const classGuestPanel = document.getElementById('classGuestPanel');
const classAppPanel = document.getElementById('classAppPanel');
const classHeroTitle = document.getElementById('classHeroTitle');
const classHeroCopy = document.getElementById('classHeroCopy');
const classRoleBadge = document.getElementById('classRoleBadge');
const classPreviewSwitch = document.getElementById('classPreviewSwitch');
const classAdminView = document.getElementById('classAdminView');
const classTeacherView = document.getElementById('classTeacherView');
const classStudentView = document.getElementById('classStudentView');
const classStats = document.getElementById('classStats');
const classStatClassCard = document.getElementById('classStatClassCard');
const classStatTeacherCard = document.getElementById('classStatTeacherCard');
const classStatStudentCard = document.getElementById('classStatStudentCard');
const classStatClasses = document.getElementById('classStatClasses');
const classStatTeachers = document.getElementById('classStatTeachers');
const classStatStudents = document.getElementById('classStatStudents');
const classStatAnnouncements = document.getElementById('classStatAnnouncements');
const classStatAssignments = document.getElementById('classStatAssignments');
const classCreateForm = document.getElementById('classCreateForm');
const classCreateName = document.getElementById('classCreateName');
const classStudentClasses = document.getElementById('classStudentClasses');
const classTeacherCreateForm = document.getElementById('classTeacherCreateForm');
const classTeacherName = document.getElementById('classTeacherName');
const classTeacherEmail = document.getElementById('classTeacherEmail');
const classTeacherPassword = document.getElementById('classTeacherPassword');
const classAdminClasses = document.getElementById('classAdminClasses');
const classAnnouncementForm = document.getElementById('classAnnouncementForm');
const classAnnouncementTitle = document.getElementById('classAnnouncementTitle');
const classAnnouncementContent = document.getElementById('classAnnouncementContent');
const classAssignmentForm = document.getElementById('classAssignmentForm');
const classAssignmentTitle = document.getElementById('classAssignmentTitle');
const classAssignmentDesc = document.getElementById('classAssignmentDesc');
const classAssignmentDue = document.getElementById('classAssignmentDue');
const classTeacherAnnouncements = document.getElementById('classTeacherAnnouncements');
const classTeacherAssignments = document.getElementById('classTeacherAssignments');
const classTeacherSubmissions = document.getElementById('classTeacherSubmissions');
const classStudentAnnouncements = document.getElementById('classStudentAnnouncements');
const classStudentAssignments = document.getElementById('classStudentAssignments');
const classStudentSubmissions = document.getElementById('classStudentSubmissions');
const classLoginBtn = document.getElementById('classLoginBtn');
const classBackHomeBtn = document.getElementById('classBackHomeBtn');
const classSwitcherBar = document.getElementById('classSwitcherBar');
const classSwitcherLabel = document.getElementById('classSwitcherLabel');
const classSwitcherTitle = document.getElementById('classSwitcherTitle');
const classSwitcherScopeBadge = document.getElementById('classSwitcherScopeBadge');
const classSwitcherTabs = document.getElementById('classSwitcherTabs');
const classTeacherIsolatedBadge = document.getElementById('classTeacherIsolatedBadge');
const classTeacherIsolatedText = document.getElementById('classTeacherIsolatedText');
const announcementClassSelectLabel = document.getElementById('announcementClassSelectLabel');
const classAnnouncementClassSelect = document.getElementById('classAnnouncementClassSelect');
const assignmentClassSelectLabel = document.getElementById('assignmentClassSelectLabel');
const classAssignmentClassSelect = document.getElementById('classAssignmentClassSelect');
let currentClassScope = 'all';
let currentWorkspace = 'community';
let classPreviewRole = 'admin';
let classOverview = { stats: {}, announcements: [], assignments: [], submissions: [], myClasses: [] };
let classDirectory = { classes: [], teachers: [], studentCount: 0 };
let classLoading = false;
let classDirectoryLoading = false;
let classDiagnostics = null;
let classDiagnosticsLoading = false;
let currentGradingSubmission = null;
let currentTeacherSubmissionsList = [];
const announcementBtn = document.getElementById('announcementBtn');
const generateReportBtn = document.getElementById('generateReportBtn');
const adminReportCategory = document.getElementById('adminReportCategory');
const adminReportStartDate = document.getElementById('adminReportStartDate');
const adminReportEndDate = document.getElementById('adminReportEndDate');
const loginBtn = document.getElementById('loginBtn');
const userMenuWrap = document.getElementById('userMenuWrap');
const userMenu = document.getElementById('userMenu');
const userMenuAvatar = document.getElementById('userMenuAvatar');
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
const adminInviteForm = document.getElementById('adminInviteForm');
const adminInviteLabel = document.getElementById('adminInviteLabel');
const adminInviteCount = document.getElementById('adminInviteCount');
const adminInviteMaxUses = document.getElementById('adminInviteMaxUses');
const adminInviteDays = document.getElementById('adminInviteDays');
const adminInviteResult = document.getElementById('adminInviteResult');
const adminArchivedOpenBtn = document.getElementById('adminArchivedOpenBtn');
const adminArchivedCloseBtn = document.getElementById('adminArchivedCloseBtn');
const adminArchivedPanel = document.getElementById('adminArchivedPanel');
const adminArchivedList = document.getElementById('adminArchivedList');
const feedbackEntry = document.getElementById('feedbackEntry');
const adminFeedbackStatusFilter = document.getElementById('adminFeedbackStatusFilter');
const adminFeedbackRefresh = document.getElementById('adminFeedbackRefresh');
const adminFeedbackBody = document.getElementById('adminFeedbackBody');
const adminFeedbackEmpty = document.getElementById('adminFeedbackEmpty');
let hotCategoryButtons = [];

const defaultTrendLabels = ['调课', '作业', '早八', '考试', '签到', '实验', '课件', '进度', '答疑', '分组', '成绩', '选课'];
let categoryTrendMap = {};
let appCategories = [];
let createdInviteBatches = [];
let inviteLiveChecked = false;
const ADMIN_INVITE_STORAGE_KEY = 'tt-admin-invite-batches';
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

  if (adminReportCategory) {
    const previousValue = adminReportCategory.value || 'all';
    adminReportCategory.innerHTML = [
      '<option value="all">全部帖子</option>',
      ...visibleCategories.map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`),
    ].join('');
    adminReportCategory.value = previousValue === 'all' || visibleCategories.some((category) => category.name === previousValue)
      ? previousValue
      : 'all';
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
let adminFeedback = [];
let adminFeedbackLoading = false;
let adminReports = [];
const reportedPostIds = new Set();
const archivedActionItems = new Set();
const retainedResolvedActionItems = new Set();
const clearedActionItems = new Set();
const ADMIN_ACTION_STATE_STORAGE_KEY = 'tt-admin-action-state';
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
  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const response = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || '请求失败，请稍后重试');
  }
  return data;
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'\"]/g, (char) => ({
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
  const authorAvatarUrl = post.author?.avatarUrl || '';
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
    authorAvatarUrl,
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

const feedbackStatusLabels = {
  open: '待处理',
  resolved: '已处理',
  ignored: '已忽略',
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

const renderAdminFeedback = () => {
  if (!adminFeedbackBody) return;
  if (adminFeedbackLoading) {
    adminFeedbackBody.innerHTML = '<tr><td colspan="6" class="empty-state">正在读取问题反馈...</td></tr>';
    if (adminFeedbackEmpty) adminFeedbackEmpty.hidden = true;
    return;
  }
  adminFeedbackBody.innerHTML = adminFeedback.map((item) => {
    const status = item.status || 'open';
    const statusLabel = feedbackStatusLabels[status] || status;
    const safeId = escapeHtml(item.id);
    const authorText = item.author ? `${item.author.name || '用户'}${item.author.email ? ` / ${item.author.email}` : ''}` : '未登录用户';
    return `
      <tr>
        <td>
          <div class="admin-post-title">
            <strong>${escapeHtml(item.content || '')}</strong>
            <span>${escapeHtml(item.pageUrl || '未记录页面地址')}</span>
          </div>
        </td>
        <td>${escapeHtml(item.type || '其他')}</td>
        <td>
          <div class="admin-feedback-meta">
            <span>${escapeHtml(authorText)}</span>
            ${item.contact ? `<span>联系：${escapeHtml(item.contact)}</span>` : ''}
          </div>
        </td>
        <td><span class="admin-status-badge ${escapeHtml(status)}">${escapeHtml(statusLabel)}</span></td>
        <td>${escapeHtml(getRelativeActivity(item.createdAt))}</td>
        <td>
          <div class="admin-action-group">
            <button type="button" data-feedback-status-id="${safeId}" data-status="open" ${status === 'open' ? 'disabled' : ''}>待处理</button>
            <button type="button" data-feedback-status-id="${safeId}" data-status="resolved" ${status === 'resolved' ? 'disabled' : ''}>已处理</button>
            <button type="button" data-feedback-status-id="${safeId}" data-status="ignored" ${status === 'ignored' ? 'disabled' : ''}>忽略</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  if (adminFeedbackEmpty) adminFeedbackEmpty.hidden = Boolean(adminFeedback.length);
};

const loadAdminFeedback = async ({ silent = true } = {}) => {
  if (!adminFeedbackBody || currentUser?.role !== 'admin') return;
  adminFeedbackLoading = true;
  renderAdminFeedback();
  try {
    const status = adminFeedbackStatusFilter?.value || 'all';
    const { feedback = [] } = await apiRequest(`/api/feedback/admin?status=${encodeURIComponent(status)}`);
    adminFeedback = feedback;
    if (!silent) showToast('问题反馈已刷新');
  } catch (error) {
    adminFeedback = [];
    showToast(error.message || '问题反馈加载失败');
  } finally {
    adminFeedbackLoading = false;
    renderAdminFeedback();
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

const saveAdminActionState = () => {
  try {
    localStorage.setItem(ADMIN_ACTION_STATE_STORAGE_KEY, JSON.stringify({
      archived: [...archivedActionItems],
      retainedResolved: [...retainedResolvedActionItems],
      cleared: [...clearedActionItems],
    }));
  } catch (_error) {
    // Best-effort browser persistence for admin workflow state.
  }
};

const restoreAdminActionState = () => {
  try {
    const state = JSON.parse(localStorage.getItem(ADMIN_ACTION_STATE_STORAGE_KEY) || '{}');
    (state.archived || []).forEach((key) => archivedActionItems.add(String(key)));
    (state.retainedResolved || []).forEach((key) => retainedResolvedActionItems.add(String(key)));
    (state.cleared || []).forEach((key) => clearedActionItems.add(String(key)));
  } catch (_error) {
    archivedActionItems.clear();
    retainedResolvedActionItems.clear();
    clearedActionItems.clear();
  }
};

const getActionKey = (reportId, actionId) => `${reportId}:${actionId}`;

const getActionPostIds = (item = {}) => new Set((item.postIds || []).map((id) => String(id)));

const clearSiblingActionItemsForPosts = (selectedReportId, selectedActionItem) => {
  const selectedKey = getActionKey(selectedReportId, selectedActionItem.id);
  const selectedPostIds = getActionPostIds(selectedActionItem);
  if (!selectedPostIds.size) return;
  adminReports.forEach((reportItem) => {
    (reportItem?.payload?.actionItems || []).forEach((item) => {
      const key = getActionKey(reportItem.id, item.id);
      if (key === selectedKey) return;
      const hasSharedPost = [...getActionPostIds(item)].some((postId) => selectedPostIds.has(postId));
      if (hasSharedPost) clearedActionItems.add(key);
    });
  });
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
    .filter((item) => {
      const key = getActionKey(item.reportId, item.id);
      if (clearedActionItems.has(key) || archivedActionItems.has(key)) return false;
      return item.status !== 'resolved' || retainedResolvedActionItems.has(key);
    });
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

const openArchivedPanel = () => {
  if (!adminArchivedPanel) return;
  renderArchivedActionItems();
  adminArchivedPanel.hidden = false;
  adminArchivedPanel.classList.add('is-expanded');
};

const closeArchivedPanel = () => {
  if (!adminArchivedPanel) return;
  adminArchivedPanel.classList.remove('is-expanded');
  adminArchivedPanel.hidden = true;
};

const normalizeChartPoints = (points = []) => {
  const normalized = (Array.isArray(points) ? points : [])
    .map((value) => Math.max(0, Number(value) || 0));
  return normalized.length ? normalized : defaultTrendLabels.map(() => 0);
};

const alignChartPoints = (points = [], length = 0) => {
  const normalized = normalizeChartPoints(points);
  return Array.from({ length }, (_item, index) => normalized[index] || 0);
};

const initAdminReportDates = () => {
  if (!adminReportStartDate || !adminReportEndDate) return;
  const today = new Date().toISOString().slice(0, 10);
  if (!adminReportStartDate.value) adminReportStartDate.value = today;
  if (!adminReportEndDate.value) adminReportEndDate.value = today;
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
    restoreAdminActionState();
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
    const selectedCategory = adminReportCategory?.value || 'all';
    const startDate = adminReportStartDate?.value || '';
    const endDate = adminReportEndDate?.value || '';
    if (startDate && endDate && startDate > endDate) {
      showToast('开始日期不能晚于结束日期');
      return;
    }
    const { report } = await apiRequest('/api/posts/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ category: selectedCategory, startDate, endDate }),
    });
    adminReports = [report, ...adminReports.filter((item) => String(item.id) !== String(report.id))];
    if (Array.isArray(report?.payload?.categoriesSnapshot)) {
      applyCategories(report.payload.categoriesSnapshot);
    } else if (Array.isArray(report?.payload?.addedTags) && report.payload.addedTags.length) {
      await loadCategories();
    }
    renderAdminReportList();
    await loadAdminStats({ silent: true });
    showToast(selectedCategory === 'all' ? '全部帖子报告已生成' : `${selectedCategory}板块报告已生成`);
  } catch (error) {
    showToast(error.message || '报告生成失败');
  } finally {
    generateReportBtn.disabled = false;
    generateReportBtn.textContent = originalText;
  }
};

const getQqAvatarUrl = (qq) => {
  const normalizedQq = String(qq || '').trim();
  return normalizedQq ? `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(normalizedQq)}&s=100` : '';
};

const renderAvatar = ({ className = 'mini-avatar', initial = '?', name = '用户', qq = '', avatarUrl = '', color = '#64748b' } = {}) => {
  const avatarUrlValue = avatarUrl || getQqAvatarUrl(qq);
  const safeName = escapeHtml(name || '用户');
  const safeInitial = escapeHtml(initial || '?');
  const safeColor = escapeHtml(color);
  if (avatarUrlValue) {
    return `<span class="${className} has-image" data-avatar-fallback="${safeInitial}" data-avatar-color="${safeColor}" aria-label="${safeName}的头像"><img src="${escapeHtml(avatarUrlValue)}" alt="" /></span>`;
  }

  return `<span class="${className}" style="background:${safeColor}" aria-label="${safeName}的头像">${safeInitial}</span>`;
};

document.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const avatar = image.closest('[data-avatar-fallback]');
  if (!avatar) return;
  avatar.classList.remove('has-image');
  avatar.style.background = avatar.dataset.avatarColor || '#64748b';
  avatar.textContent = avatar.dataset.avatarFallback || '?';
}, true);

const setAvatarPreview = (displayName = '?', qq = '') => {
  const initial = (displayName || '?').trim().slice(0, 1).toUpperCase() || '?';
  const avatarUrl = getQqAvatarUrl(qq);
  if (avatarUrl) {
    userMenuAvatar.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="" />`;
    userMenuAvatar.classList.add('has-image');
    userMenuAvatar.setAttribute('aria-label', 'QQ 头像');
    return;
  }

  userMenuAvatar.innerHTML = '';
  userMenuAvatar.classList.remove('has-image');
  userMenuAvatar.textContent = initial;
  userMenuAvatar.setAttribute('aria-label', '默认头像');
};

const updateAuthUI = (user) => {
  currentUser = user;
  if (teacherEntry) teacherEntry.hidden = user?.role !== 'admin';
  if (announcementMenuBtn) announcementMenuBtn.hidden = user?.role !== 'admin';
  if (user?.role !== 'admin' && currentFilter === 'admin') {
    switchFilter('all', '最新吐槽');
  }
  if (user) {
    if (user.role === 'teacher') {
      classPreviewRole = 'teacher';
    } else if (user.role === 'admin') {
      classPreviewRole = 'admin';
    }
    const displayName = user.nickname || user.email.split('@')[0];
    loginBtn.textContent = `${displayName} ▾`;
    loginBtn.classList.add('logged-in');
    loginBtn.setAttribute('aria-expanded', 'false');
    loginBtn.title = '打开个人菜单';
    userMenu.hidden = false;
    userMenuWrap.classList.add('is-logged-in');
    userMenuAvatar.disabled = false;
    userMenuAvatar.removeAttribute('title');
    setAvatarPreview(displayName, user.qq);
    userMenuName.textContent = displayName;
    userMenuEmail.textContent = user.email;
  } else {
    currentClassScope = 'all';
    classPreviewRole = 'admin';
    loginBtn.textContent = '登录';
    loginBtn.classList.remove('logged-in');
    loginBtn.setAttribute('aria-expanded', 'false');
    loginBtn.title = '';
    userMenu.hidden = true;
    userMenu.classList.remove('open');
    userMenuWrap.classList.remove('is-logged-in');
    userMenuAvatar.disabled = true;
    userMenuAvatar.removeAttribute('title');
    setAvatarPreview('?');
    userMenuName.textContent = '未登录';
    userMenuEmail.textContent = '欢迎回来';
  }
  syncClassWorkspace();
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

const normalizeTrendData = (trend = {}) => {
  const rawLabels = Array.isArray(trend.labels) && trend.labels.length ? trend.labels : defaultTrendLabels;
  const labels = rawLabels.length === 1 ? [rawLabels[0], ''] : rawLabels;
  const points = normalizeChartPoints(trend.points);
  const alignedPoints = alignChartPoints(points, labels.length);
  if (rawLabels.length === 1) alignedPoints[1] = alignedPoints[0];
  return {
    keyword: trend.keyword || '暂无',
    mentions: Number(trend.mentions || 0),
    labels,
    points: alignedPoints,
  };
};

const getTrendData = (category = activeTrendCategory) => normalizeTrendData(
  categoryTrendMap[category]
  || categoryTrendMap[adminStats.hotCategory]
  || categoryTrendMap[categoryStatOrder[0].category]
  || {}
);

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
  const trendData = getTrendData(category);
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
  if (trendPoints.length < 2) return;
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
    const posterInitial = topic.posters[0] || '?';
    const safeActivity = escapeHtml(topic.activity);
    const safeColor = colors[index % colors.length];
    const safeLikeLabel = escapeHtml(`${topic.liked ? '取消点赞' : '点赞'}：${topic.title}`);
    const authorAvatar = renderAvatar({
      initial: posterInitial,
      name: topic.authorName || topic.posters[0] || '?',
      avatarUrl: topic.authorAvatarUrl,
      color: safeColor,
    });

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
          <div class="posters author-posters" aria-label="发布人：${safeAuthor}">
            ${authorAvatar}
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
        <td class="num activity">${safeActivity}<small>时间</small></td>
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
      loadAdminFeedback({ silent: true });
      loadAdminReports({ silent: true });
      if (!inviteLiveChecked) checkCreatedInvitesLiveStatus({ silent: true });
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
  if (currentWorkspace === 'class' || currentFilter === 'admin') return;
  renderTopics(currentFilter, currentTitle);
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    searchInput.value = '';
    if (currentWorkspace !== 'class') renderTopics(currentFilter, currentTitle);
    searchInput.blur();
    showToast('已清空搜索');
  }
});

window.addEventListener('scroll', () => {
  if (currentWorkspace === 'class' || currentFilter === 'admin' || !postPageHasMore || postPageLoading) return;
  const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
  if (remaining < 360) loadPersistedTopics({ silent: true, reset: false });
}, { passive: true });

const closeDropdowns = () => {
  categoryMenu.hidden = true;
  tagMenu.hidden = true;
  categoryChip.classList.remove('open');
  tagChip.classList.remove('open');
  categoryChip.setAttribute('aria-expanded', 'false');
  tagChip.setAttribute('aria-expanded', 'false');
};

const formatClassTime = (value) => {
  if (!value) return '未设置截止时间';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未设置截止时间';
  return date.toLocaleString('zh-CN', { hour12: false });
};

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getClassRoleLabel = (role) => {
  if (role === 'admin') return '管理员';
  if (role === 'teacher') return '教师';
  if (role === 'student') return '学生';
  return '未登录';
};

const getActiveClassView = () => {
  if (!currentUser) return null;
  if (currentUser.role === 'admin') {
    if (classPreviewRole === 'student') return 'student';
    if (classPreviewRole === 'teacher') return 'teacher';
    return 'admin';
  }
  if (currentUser.role === 'teacher') return 'teacher';
  return 'student';
};

const getAssignableTeachers = (classItem) => {
  const assignedIds = new Set((classItem.teachers || []).map((teacher) => String(teacher.id)));
  return (classDirectory.teachers || []).filter((teacher) => !assignedIds.has(String(teacher.id)));
};

const renderAdminClasses = () => {
  if (!classAdminClasses) return;
  const classes = classDirectory.classes || [];
  if (!classes.length) {
    classAdminClasses.innerHTML = renderClassEmpty('还没有班级。先在左侧创建班级，再任命老师。');
    return;
  }
  classAdminClasses.innerHTML = classes.map((item) => {
    const teachers = item.teachers || [];
    const students = item.students || [];
    const availableTeachers = getAssignableTeachers(item);
    const teacherChips = teachers.length
      ? `<div class="class-teacher-chips">${teachers.map((teacher) => `
          <div class="class-teacher-chip">
            <strong>${escapeHtml(teacher.nickname || teacher.email)}</strong>
            <small>${escapeHtml(teacher.email || '')}</small>
            <button type="button" class="ghost-btn" data-class-unassign="${escapeHtml(item.id)}" data-teacher-id="${escapeHtml(teacher.id)}">取消任命</button>
          </div>
        `).join('')}</div>`
      : renderClassEmpty('该班还没有老师，可从下方选择任命。');
    const studentChips = students.length
      ? `
        <div class="class-roster-summary-card">
          <div class="roster-summary-info">
            <span class="roster-icon">📋</span>
            <div class="roster-summary-text">
              <strong>在籍独立花名册 · 共 ${students.length} 名学生</strong>
              <small>高考基线总分/位次已录入，专属邀请码已生成就绪</small>
            </div>
          </div>
          <div class="roster-actions">
            <button type="button" class="primary-btn btn-sm" data-jump-to-class="${escapeHtml(item.id)}">👉 前往教师页查看学情</button>
            <button type="button" class="ghost-btn btn-sm" data-toggle-roster="${escapeHtml(item.id)}">展开/查看 50 人名单明细</button>
          </div>
          <div class="class-student-chips roster-collapsible" id="rosterList_${escapeHtml(item.id)}" hidden>
            ${students.map((student) => `
              <div class="class-teacher-chip">
                <strong>${escapeHtml(student.nickname || student.name || student.email)}</strong>
                <small>${escapeHtml(student.studentNo || '')}${student.claimed ? ' · 已注册' : ' · 待注册'}</small>
              </div>
            `).join('')}
          </div>
        </div>
      `
      : renderClassEmpty('该班还没有导入花名册。');
    const assignOptions = availableTeachers.length
      ? availableTeachers.map((teacher) => `<option value="${escapeHtml(teacher.id)}">${escapeHtml(teacher.nickname || teacher.email)} · ${escapeHtml(teacher.email || '')}</option>`).join('')
      : '<option value="">暂无可任命教师</option>';
    return `
      <article class="class-item">
        <div class="class-item-head">
          <strong>${escapeHtml(item.name)}</strong>
          <small>${teachers.length} 位老师 · ${students.length} 名学生</small>
        </div>
        ${teacherChips}
        ${studentChips}
        <form class="class-assign-form" data-class-assign="${escapeHtml(item.id)}">
          <select name="teacherId" ${availableTeachers.length ? '' : 'disabled'} required>
            <option value="">选择要任命的老师</option>
            ${assignOptions}
          </select>
          <button type="submit" class="primary-btn" ${availableTeachers.length ? '' : 'disabled'}>任命老师</button>
        </form>
        <form class="class-rename-form" data-class-rename="${escapeHtml(item.id)}">
          <input type="text" name="name" maxlength="40" value="${escapeHtml(item.name)}" required>
          <button type="submit" class="ghost-btn">保存名称</button>
          <button type="button" class="ghost-btn" data-class-delete="${escapeHtml(item.id)}">删除班级</button>
        </form>
      </article>
    `;
  }).join('');
};

const renderClassEmpty = (text) => `<div class="class-empty">${escapeHtml(text)}</div>`;

const renderClassScopeBadge = (classId, className) => {
  const cid = classId ? String(classId) : '';
  const cname = className || '';
  if (cid === '1' || cname.includes('1')) {
    return '<span class="class-scope-badge scope-1">数经1班</span>';
  }
  if (cid === '2' || cname.includes('2')) {
    return '<span class="class-scope-badge scope-2">数经2班</span>';
  }
  return '<span class="class-scope-badge scope-all">全部班级</span>';
};

const renderClassAnnouncements = (target, items, { canDelete = false } = {}) => {
  if (!target) return;
  if (!items.length) {
    target.innerHTML = renderClassEmpty('暂时还没有班级公告');
    return;
  }
  target.innerHTML = items.map((item) => `
    <article class="class-item">
      <div class="class-item-head">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <strong>${escapeHtml(item.title)}</strong>
          ${renderClassScopeBadge(item.classId, item.className)}
        </div>
        <small>${escapeHtml(item.authorName || '教师')} · ${escapeHtml(formatClassTime(item.createdAt))}</small>
      </div>
      <p>${escapeHtml(item.content || '')}</p>
      ${canDelete ? `<div class="class-item-actions"><button type="button" class="ghost-btn" data-class-delete-announcement="${escapeHtml(item.id)}">删除公告</button></div>` : ''}
    </article>
  `).join('');
};

const CLASS_FILE_ACCEPT = '.pdf,.doc,.docx,.dot,.dotx,.rtf,.odt,.wps,.ppt,.pptx,.pps,.ppsx,.odp,.xls,.xlsx,.xlsm,.csv,.ods,.png,.jpg,.jpeg,.gif,.webp,.bmp,.tif,.tiff,.heic,.heif,.jfif,.zip,.rar,.7z,.tar,.gz,.txt,.md,.pages,.numbers,.key';

const getClassFileKind = (filename = '', mimeType = '') => {
  const ext = String(filename).split('.').pop()?.toLowerCase() || '';
  const mime = String(mimeType || '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'jfif'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['doc', 'docx', 'dot', 'dotx', 'rtf', 'odt', 'wps'].includes(ext)) return 'word';
  if (['ppt', 'pptx', 'pps', 'ppsx', 'odp'].includes(ext)) return 'ppt';
  if (['xls', 'xlsx', 'xlsm', 'csv', 'ods'].includes(ext)) return 'excel';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  return 'file';
};

const getClassFileKindLabel = (kind) => ({
  image: '图片',
  pdf: 'PDF',
  word: 'Word',
  ppt: 'PPT',
  excel: 'Excel',
  archive: '压缩包',
  file: '文件',
}[kind] || '文件');

const canPreviewClassFile = (filename, mimeType) => ['image', 'pdf'].includes(getClassFileKind(filename, mimeType));

const renderClassFilePreview = (item) => {
  const kind = getClassFileKind(item.originalName, item.mimeType);
  const fileUrl = `/api/class/submissions/${escapeHtml(item.id)}/file`;
  const previewUrl = `${fileUrl}?inline=1`;
  if (kind === 'image') {
    return `<a class="class-file-preview" href="${previewUrl}" target="_blank" rel="noopener noreferrer"><img src="${previewUrl}" alt="${escapeHtml(item.originalName || '图片')}"></a>`;
  }
  if (kind === 'pdf') {
    return `<iframe class="class-file-preview class-file-preview-pdf" src="${previewUrl}" title="${escapeHtml(item.originalName || 'PDF')}"></iframe>`;
  }
  return `<div class="class-file-chip">${escapeHtml(getClassFileKindLabel(kind))}</div>`;
};

const renderClassFileActions = (item, downloadLabel) => {
  const fileUrl = `/api/class/submissions/${escapeHtml(item.id)}/file`;
  const previewUrl = `${fileUrl}?inline=1`;
  const previewable = canPreviewClassFile(item.originalName, item.mimeType);
  return `
    <div class="class-item-actions">
      ${previewable ? `<a class="ghost-btn" href="${previewUrl}" target="_blank" rel="noopener noreferrer">预览</a>` : ''}
      <a class="ghost-btn" href="${fileUrl}">${escapeHtml(downloadLabel)}</a>
    </div>
  `;
};

const renderTeacherAssignments = (items) => {
  if (!classTeacherAssignments) return;
  if (!items.length) {
    classTeacherAssignments.innerHTML = renderClassEmpty('还没有发布文件收取，发布后学生就可以提交图片、Word 或 PDF。');
    return;
  }
  classTeacherAssignments.innerHTML = items.map((item) => {
    const submitted = Number(item.submissionCount || 0);
    const expected = Number(item.expectedCount || 0);
    const progressLabel = expected > 0 ? `${submitted}/${expected}` : `${submitted}/0`;
    return `
      <article class="class-item">
        <div class="class-item-head">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong>${escapeHtml(item.title)}</strong>
            ${renderClassScopeBadge(item.classId, item.className)}
          </div>
          <small>${item.status === 'open' ? '收取中' : '已停止'} · 已提交/总数 ${escapeHtml(progressLabel)}</small>
        </div>
        <div class="class-progress" aria-label="已提交 ${submitted}，总数 ${expected}">
          <span style="width:${expected > 0 ? Math.min(100, Math.round((submitted / expected) * 100)) : 0}%"></span>
        </div>
        <p>${escapeHtml(item.description || '未填写收取说明')}</p>
        <small>截止：${escapeHtml(formatClassTime(item.dueAt))}</small>
        <div class="class-item-actions">
          <button type="button" class="ghost-btn remind-assignment-btn" data-class-remind-assignment="${escapeHtml(item.id)}" title="查看该作业未交学生名单并一键催交">🔔 催交未交学生</button>
          <button type="button" class="ghost-btn" data-class-toggle-assignment="${escapeHtml(item.id)}" data-next-status="${item.status === 'open' ? 'closed' : 'open'}">${item.status === 'open' ? '停止收取' : '重新开放'}</button>
          <button type="button" class="ghost-btn" data-class-delete-assignment="${escapeHtml(item.id)}">删除收取</button>
        </div>
      </article>
    `;
  }).join('');
};
const getTierClass = (tier) => {
  if (tier === 'A') return 'tier-badge-a';
  if (tier === 'B+') return 'tier-badge-b-plus';
  if (tier === 'B') return 'tier-badge-b';
  if (tier === 'C') return 'tier-badge-c';
  if (tier === 'D') return 'tier-badge-d';
  return 'tier-badge-none';
};

const renderTierBadge = (tier) => {
  if (!tier) return '<span class="tier-badge tier-badge-none">未评级</span>';
  return `<span class="tier-badge ${getTierClass(tier)}">${escapeHtml(tier)}</span>`;
};

const renderSubmissionStatusPill = (item) => {
  if (item.score !== null && item.score !== undefined) {
    return '<span class="status-pill graded">已完成批阅</span>';
  }
  if (item.aiEvaluation || item.aiSuggestedScore !== null && item.aiSuggestedScore !== undefined) {
    return '<span class="status-pill ai_pregraded">AI已预评</span>';
  }
  return '<span class="status-pill pending">待批阅</span>';
};
const renderTeacherClassJumpGrid = () => {
  const grid = document.getElementById('teacherClassJumpGrid');
  if (!grid) return;

  const subs = classOverview.submissions || [];
  const subs1 = subs.filter((s) => String(s.classId || s.class_id) === '1');
  const subs2 = subs.filter((s) => String(s.classId || s.class_id) === '2');

  const graded1 = subs1.filter((s) => s.score !== null && s.score !== undefined);
  const graded2 = subs2.filter((s) => s.score !== null && s.score !== undefined);

  const avg1 = graded1.length
    ? `${Math.round((graded1.reduce((sum, s) => sum + Number(s.score || 0), 0) / graded1.length) * 10) / 10} 分`
    : (subs1.length ? '待打分' : '暂无提交');
  const avg2 = graded2.length
    ? `${Math.round((graded2.reduce((sum, s) => sum + Number(s.score || 0), 0) / graded2.length) * 10) / 10} 分`
    : (subs2.length ? '待打分' : '暂无提交');

  const quads = classDiagnostics?.quadrants || {};
  const c1Top = ((quads.leader || []).concat(quads.breakthrough || [])).filter(
    (st) => st.className && st.className.includes('1')
  ).length;
  const c2Top = ((quads.leader || []).concat(quads.breakthrough || [])).filter(
    (st) => st.className && st.className.includes('2')
  ).length;

  grid.innerHTML = `
    <div class="teacher-class-jump-card card-class-1" data-jump-to-class="1" role="button" tabindex="0" title="点击直接进入数经1班查看班级情况">
      <div class="jump-card-header">
        <div class="jump-card-title-wrap">
          <span class="jump-class-icon">🏛️</span>
          <div>
            <h3 class="jump-class-name">数经1班</h3>
            <span class="jump-class-teacher">任课教师：张老师 (teacher1@class.local)</span>
          </div>
        </div>
        <span class="jump-class-badge badge-c1">独立建制 · 50人</span>
      </div>
      <p class="jump-card-desc">已建立 50 人真实高考学籍基线。点击直接进入数经1班页面，直接查看专属四象限学情、作业批阅与位次跃迁。</p>
      <div class="jump-card-stats">
        <div class="jump-stat-item">
          <span class="jump-stat-label">在籍学生</span>
          <span class="jump-stat-value">50 人</span>
        </div>
        <div class="jump-stat-item">
          <span class="jump-stat-label">已收作业</span>
          <span class="jump-stat-value text-blue">${subs1.length} 份</span>
        </div>
        <div class="jump-stat-item">
          <span class="jump-stat-label">已批均分</span>
          <span class="jump-stat-value">${avg1}</span>
        </div>
        <div class="jump-stat-item">
          <span class="jump-stat-label">拔尖/跃迁</span>
          <span class="jump-stat-value text-purple">${c1Top} 人</span>
        </div>
      </div>
      <div class="jump-card-action">
        <button type="button" class="jump-action-btn" data-jump-to-class="1">
          👉 直接进入【数经1班】查看班级情况
        </button>
      </div>
    </div>

    <div class="teacher-class-jump-card card-class-2" data-jump-to-class="2" role="button" tabindex="0" title="点击直接进入数经2班查看班级情况">
      <div class="jump-card-header">
        <div class="jump-card-title-wrap">
          <span class="jump-class-icon">🏛️</span>
          <div>
            <h3 class="jump-class-name">数经2班</h3>
            <span class="jump-class-teacher">任课教师：李老师 (teacher2@class.local)</span>
          </div>
        </div>
        <span class="jump-class-badge badge-c2">独立建制 · 50人</span>
      </div>
      <p class="jump-card-desc">已建立 50 人真实高考学籍基线。点击直接进入数经2班页面，直接查看专属四象限学情、作业批阅与位次跃迁。</p>
      <div class="jump-card-stats">
        <div class="jump-stat-item">
          <span class="jump-stat-label">在籍学生</span>
          <span class="jump-stat-value">50 人</span>
        </div>
        <div class="jump-stat-item">
          <span class="jump-stat-label">已收作业</span>
          <span class="jump-stat-value text-blue">${subs2.length} 份</span>
        </div>
        <div class="jump-stat-item">
          <span class="jump-stat-label">已批均分</span>
          <span class="jump-stat-value">${avg2}</span>
        </div>
        <div class="jump-stat-item">
          <span class="jump-stat-label">拔尖/跃迁</span>
          <span class="jump-stat-value text-purple">${c2Top} 人</span>
        </div>
      </div>
      <div class="jump-card-action">
        <button type="button" class="jump-action-btn" data-jump-to-class="2">
          👉 直接进入【数经2班】查看班级情况
        </button>
      </div>
    </div>
  `;
};

const renderClassTeacherDiagnostics = (data) => {
  const card = document.getElementById('classTeacherDiagnosticsCard');
  if (!card) return;
  if (!data) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  const isAllCohortView = currentUser?.role === 'admin' && currentClassScope === 'all';

  const subText = card.querySelector('.class-card-head p');
  if (subText) {
    if (currentUser?.role === 'admin' && currentClassScope === 'all') {
      subText.textContent = '双班 100 人宏观汇总大盘：已隐藏密集名单。点击下方象限中的班级按钮或上方班级卡片，直接跳转至对应班级看班级情况。';
    } else if (currentClassScope === '1') {
      subText.textContent = '数经1班专属学情诊断：结合高考初始基线与本班作业实证表现，动态洞察本班 50 位同学领跑、跃迁、滑坡与帮扶梯队。';
    } else if (currentClassScope === '2') {
      subText.textContent = '数经2班专属学情诊断：结合高考初始基线与本班作业实证表现，动态洞察本班 50 位同学领跑、跃迁、滑坡与帮扶梯队。';
    } else {
      subText.textContent = '结合高考初始基线与大学作业实证表现，动态洞察领跑、跃迁、滑坡与帮扶学生梯队。';
    }
  }

  const metricsGrid = document.getElementById('diagnosticsMetricsGrid');
  if (metricsGrid) {
    metricsGrid.innerHTML = `
      <div class="metric-card">
        <span class="metric-title">班级学生在籍总数</span>
        <span class="metric-value">${Number(data.totalStudents || 0)}</span>
        <span class="metric-sub">${data.className ? escapeHtml(data.className) : (data.totalStudents === 50 ? '班级独立花名册' : '数经1、数经2合计')}</span>
      </div>
      <div class="metric-card accent-blue">
        <span class="metric-title">作业提交率</span>
        <span class="metric-value">${data.submissionRate || 0}%</span>
        <span class="metric-sub">已提交 ${Number(data.submittedCount || 0)} 份</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">批阅完成率</span>
        <span class="metric-value">${data.gradingRate || 0}%</span>
        <span class="metric-sub">已打分 ${Number(data.gradedCount || 0)} 份</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">已批均分 / 中位数</span>
        <span class="metric-value">${data.avgScore || 0}</span>
        <span class="metric-sub">中位数 ${data.medianScore || 0} / 极差 [${data.minScore || 0}-${data.maxScore || 0}]</span>
      </div>
      <div class="metric-card accent-purple">
        <span class="metric-title">位次跃迁先锋</span>
        <span class="metric-value">${(data.topLeapStudents || []).length}</span>
        <span class="metric-sub">逆势破格晋级学生数</span>
      </div>
      <div class="metric-card accent-orange">
        <span class="metric-title">学业预警关注</span>
        <span class="metric-value">${(data.atRiskStudents || []).length}</span>
        <span class="metric-sub">高基线滑坡与未交预警</span>
      </div>
    `;
  }

  const tierStrip = document.getElementById('diagnosticsTierStrip');
  if (tierStrip && data.tierDistribution) {
    const dist = data.tierDistribution;
    const totalGraded = (dist.A || 0) + (dist['B+'] || 0) + (dist.B || 0) + (dist.C || 0) + (dist.D || 0) || 1;
    const pA = Math.round(((dist.A || 0) / totalGraded) * 100);
    const pBp = Math.round(((dist['B+'] || 0) / totalGraded) * 100);
    const pB = Math.round(((dist.B || 0) / totalGraded) * 100);
    const pC = Math.round(((dist.C || 0) / totalGraded) * 100);
    const pD = Math.max(0, 100 - pA - pBp - pB - pC);

    tierStrip.innerHTML = `
      <div class="tier-strip-header">
        <span>五级分位分布 (已批阅 ${totalGraded} 份作业)</span>
        <small style="color:var(--muted)">A(卓越) · B+(优秀) · B(良好) · C(合格) · D(需帮扶)</small>
      </div>
      <div class="tier-strip-bar">
        <div class="tier-strip-segment seg-a" style="width:${pA}%" title="A: ${dist.A || 0}人 (${pA}%)"></div>
        <div class="tier-strip-segment seg-b-plus" style="width:${pBp}%" title="B+: ${dist['B+'] || 0}人 (${pBp}%)"></div>
        <div class="tier-strip-segment seg-b" style="width:${pB}%" title="B: ${dist.B || 0}人 (${pB}%)"></div>
        <div class="tier-strip-segment seg-c" style="width:${pC}%" title="C: ${dist.C || 0}人 (${pC}%)"></div>
        <div class="tier-strip-segment seg-d" style="width:${pD}%" title="D: ${dist.D || 0}人 (${pD}%)"></div>
      </div>
      <div class="tier-strip-legends">
        <span class="tier-strip-legend-item"><span class="tier-strip-legend-dot" style="background:#f59e0b"></span> <b>A 卓越</b>: ${dist.A || 0}人 (${pA}%)</span>
        <span class="tier-strip-legend-item"><span class="tier-strip-legend-dot" style="background:#2563eb"></span> <b>B+ 优秀</b>: ${dist['B+'] || 0}人 (${pBp}%)</span>
        <span class="tier-strip-legend-item"><span class="tier-strip-legend-dot" style="background:#10b981"></span> <b>B 良好</b>: ${dist.B || 0}人 (${pB}%)</span>
        <span class="tier-strip-legend-item"><span class="tier-strip-legend-dot" style="background:#f97316"></span> <b>C 合格</b>: ${dist.C || 0}人 (${pC}%)</span>
        <span class="tier-strip-legend-item"><span class="tier-strip-legend-dot" style="background:#64748b"></span> <b>D 需努力</b>: ${dist.D || 0}人 (${pD}%)</span>
      </div>
    `;
  }

  const quadGrid = document.getElementById('diagnosticsQuadrantGrid');
  if (quadGrid && data.quadrants) {
    const quads = [
      {
        type: 'leader',
        cls: 'quad-leader',
        title: '👑 领跑·拔尖象限',
        desc: '高考基线高（前25名）且大学作业实证表现优异（分≥78或排名前25）',
        students: data.quadrants.leader || [],
      },
      {
        type: 'breakthrough',
        cls: 'quad-breakthrough',
        title: '🚀 跃迁·突破象限',
        desc: '高考基线居中或偏后，在数字经济学实证课程中逆势突围，展现强劲学术后劲',
        students: data.quadrants.breakthrough || [],
      },
      {
        type: 'slipping',
        cls: 'quad-slipping',
        title: '⚠️ 高基线滑坡象限',
        desc: '高考基础扎实但大学作业提交未达预期或尚未提交，需精准跟进学业适应与状态',
        students: data.quadrants.slipping || [],
      },
      {
        type: 'needsSupport',
        cls: 'quad-needs-support',
        title: '🤝 协同·帮扶象限',
        desc: '双重承压学生群体，建议结合答疑、学习互助小组进行阶梯式实证方法指导',
        students: data.quadrants.needsSupport || [],
      },
    ];

    // isAllCohortView is defined at function top scope
    quadGrid.innerHTML = quads.map((q) => {
      const c1Students = q.students.filter((st) => st.className && st.className.includes('1'));
      const c2Students = q.students.filter((st) => st.className && st.className.includes('2'));

      let contentHtml = '';
      if (isAllCohortView) {
        contentHtml = `
          <div class="quadrant-cohort-summary">
            <div class="cohort-dist-row">
              <span class="cohort-dist-pill dist-total">双班总计：<b>${q.students.length}</b> 人</span>
              <span class="cohort-dist-pill">数经1班：<b>${c1Students.length}</b> 人</span>
              <span class="cohort-dist-pill">数经2班：<b>${c2Students.length}</b> 人</span>
            </div>
            <div class="cohort-jump-actions">
              <button type="button" class="quad-jump-btn" data-jump-to-class="1" title="切换到数经1班直接看班级情况">👉 进入数经1班看该象限 (${c1Students.length}人)</button>
              <button type="button" class="quad-jump-btn" data-jump-to-class="2" title="切换到数经2班直接看班级情况">👉 进入数经2班看该象限 (${c2Students.length}人)</button>
            </div>
          </div>
        `;
      } else {
        contentHtml = `
          <div class="quadrant-students-wrap">
            ${q.students.length ? q.students.map((st) => `
              <span class="quadrant-student-chip" title="学号: ${escapeHtml(st.studentNo)} | 高考: ${st.gaokaoScore || '无'} (位次#${st.initialRank || '-'}) | 本次得分: ${st.score !== null ? st.score : '未打分'}">
                <strong>${escapeHtml(st.name)}</strong>
                <small>${st.className ? escapeHtml(st.className) : ''}${st.score !== null ? ` · ${st.score}分` : (st.submitted ? ' · 待批' : ' · 未交')}</small>
              </span>
            `).join('') : '<small style="color:var(--muted)">暂无该象限学生</small>'}
          </div>
        `;
      }

      return `
        <div class="quadrant-card ${q.cls}">
          <div class="quadrant-header">
            <span class="quadrant-title">${q.title}</span>
            <span class="quadrant-count">${q.students.length} 人</span>
          </div>
          <p class="quadrant-desc">${q.desc}</p>
          ${contentHtml}
        </div>
      `;
    }).join('');
  }

  const leapList = document.getElementById('diagnosticsLeapList');
  if (leapList) {
    const topLeap = data.topLeapStudents || [];
    if (isAllCohortView) {
      const c1Leap = topLeap.filter((item) => item.className && item.className.includes('1'));
      const c2Leap = topLeap.filter((item) => item.className && item.className.includes('2'));
      leapList.innerHTML = `
        <div class="cohort-summary-box leap-cohort-box">
          <div class="cohort-summary-desc">
            <span class="cohort-summary-badge">⚡ 跃迁总览</span>
            <span>大盘模式已隔离个人名单。数经1班共 <b>${c1Leap.length}</b> 人跃迁，数经2班共 <b>${c2Leap.length}</b> 人跃迁。点击直接跳转至旁边班级页面查看完整先锋榜：</span>
          </div>
          <div class="cohort-jump-actions">
            <button type="button" class="quad-jump-btn" data-jump-to-class="1" title="切换到数经1班直接看班级情况">👉 进入【数经1班】查看跃迁先锋榜 (${c1Leap.length}人)</button>
            <button type="button" class="quad-jump-btn" data-jump-to-class="2" title="切换到数经2班直接看班级情况">👉 进入【数经2班】查看跃迁先锋榜 (${c2Leap.length}人)</button>
          </div>
        </div>
      `;
    } else {
      leapList.innerHTML = topLeap.length ? topLeap.map((item, idx) => `
        <div class="leap-item">
          <div>
            <strong>#${idx + 1} ${escapeHtml(item.name)}</strong>
            <small style="color:var(--muted)">（${escapeHtml(item.className || '数经')} · ${escapeHtml(item.originProvince || '')}）</small>
            <div style="font-size:12px;color:var(--muted);margin-top:2px;">
              初始位次 #${item.initialRank} ➔ 作业位次 #${item.rankInClass}
            </div>
          </div>
          <div style="text-align:right;">
            <span class="rank-badge-change">▲ 跃升 +${item.rankGain} 位</span>
            <div style="margin-top:4px;">
              ${renderTierBadge(item.tier)}
              <strong style="font-size:13px;margin-left:4px;">${item.score}分</strong>
            </div>
          </div>
        </div>
      `).join('') : renderClassEmpty('暂无符合位次跃迁（排名净增≥15或后进前12）的学生');
    }
  }

  const riskList = document.getElementById('diagnosticsRiskList');
  if (riskList) {
    const atRisk = data.atRiskStudents || [];
    if (isAllCohortView) {
      const c1Risk = atRisk.filter((item) => item.className && item.className.includes('1'));
      const c2Risk = atRisk.filter((item) => item.className && item.className.includes('2'));
      riskList.innerHTML = `
        <div class="cohort-summary-box risk-cohort-box">
          <div class="cohort-summary-desc">
            <span class="cohort-summary-badge" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.25);">🚨 预警总览</span>
            <span>大盘模式已隔离个人名单。数经1班共 <b>${c1Risk.length}</b> 人需教学预警干预，数经2班共 <b>${c2Risk.length}</b> 人需教学预警干预。点击直接跳转至旁边班级页面查看预警明细与帮扶：</span>
          </div>
          <div class="cohort-jump-actions">
            <button type="button" class="quad-jump-btn" data-jump-to-class="1" title="切换到数经1班直接看班级情况">👉 进入【数经1班】查看预警名单 (${c1Risk.length}人)</button>
            <button type="button" class="quad-jump-btn" data-jump-to-class="2" title="切换到数经2班直接看班级情况">👉 进入【数经2班】查看预警名单 (${c2Risk.length}人)</button>
          </div>
        </div>
      `;
    } else {
      riskList.innerHTML = atRisk.length ? atRisk.map((item, idx) => `
        <div class="risk-item">
          <div>
            <strong>#${idx + 1} ${escapeHtml(item.name)}</strong>
            <small style="color:var(--muted)">（${escapeHtml(item.className || '数经')} · ${escapeHtml(item.originProvince || '')}）</small>
            <div style="font-size:12px;color:var(--muted);margin-top:2px;">
              高考总分 ${item.gaokaoScore || '未录入'} (数学 ${item.gaokaoMath || '-'}分) · 初始位次 #${item.initialRank || '-'}
            </div>
          </div>
            <span class="risk-badge">${item.submitted ? (item.score !== null ? `滑落 #${item.rankInClass}` : '待批阅') : '🚨 尚未提交作业'}</span>
            <div style="margin-top:4px;font-size:12px;color:var(--muted);display:flex;align-items:center;justify-content:flex-end;gap:6px;">
              ${item.score !== null ? `得分: <b>${item.score}</b>` : (item.submitted ? '建议跟进' : `<button type="button" class="ghost-btn risk-remind-btn" data-risk-remind-student="${escapeHtml(item.studentNo)}" data-risk-roster-id="${escapeHtml(item.rosterId || '')}" data-risk-student-name="${escapeHtml(item.name)}" title="一键催交该学生">🔔 一键催交</button>`)}
            </div>
          </div>
        </div>
      `).join('') : renderClassEmpty('暂无风险预警学生');
    }
  }

  const provWrap = document.getElementById('diagnosticsProvinceWrap');
  if (provWrap) {
    const provs = data.provinceAnalysis || [];
    provWrap.innerHTML = `
      <table class="province-table">
        <thead>
          <tr>
            <th>生源省份</th>
            <th>学生总数</th>
            <th>高考数学均分</th>
            <th>高考综合均分</th>
            <th>本次作业提交率</th>
            <th>大学作业实证均分</th>
          </tr>
        </thead>
        <tbody>
          ${provs.map((pv) => `
            <tr>
              <td><strong>${escapeHtml(pv.province)}</strong></td>
              <td>${pv.studentCount} 人</td>
              <td><b>${pv.avgMath || '-'}</b> 分</td>
              <td>${pv.avgGaokao || '-'} 分</td>
              <td>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span>${pv.submissionRate}%</span>
                  <div style="width:50px;height:6px;background:rgba(0,0,0,.08);border-radius:999px;overflow:hidden;">
                    <div style="height:100%;background:var(--blue);width:${pv.submissionRate}%"></div>
                  </div>
                </div>
              </td>
              <td>${pv.avgCourseworkScore !== null ? `<b>${pv.avgCourseworkScore}</b> 分` : '<span style="color:var(--muted)">待评分</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};

const loadClassDiagnostics = async ({ silent = false } = {}) => {
  if (!currentUser || !['admin', 'teacher'].includes(currentUser.role)) return;
  if (classDiagnosticsLoading) return;
  classDiagnosticsLoading = true;
  try {
    const params = new URLSearchParams();
    if (currentUser.role === 'admin' && currentClassScope && currentClassScope !== 'all') {
      params.set('classId', currentClassScope);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const { diagnostics } = await apiRequest(`/api/class/diagnostics${queryString}`);
    classDiagnostics = diagnostics;
    renderClassTeacherDiagnostics(classDiagnostics);
  } catch (error) {
    if (!silent) showToast(error.message || '学情诊断数据加载失败');
  } finally {
    classDiagnosticsLoading = false;
  }
};

const renderTeacherSubmissions = (items) => {
  if (!classTeacherSubmissions) return;
  currentTeacherSubmissionsList = items || [];
  const filterSelect = document.getElementById('teacherSubmissionFilter');
  const isAllCohortView = currentUser?.role === 'admin' && currentClassScope === 'all';

  if (filterSelect) {
    filterSelect.style.display = isAllCohortView ? 'none' : '';
  }

  if (isAllCohortView) {
    const subs = currentTeacherSubmissionsList || [];
    const subs1 = subs.filter((s) => String(s.classId || s.class_id) === '1');
    const subs2 = subs.filter((s) => String(s.classId || s.class_id) === '2');

    const graded1 = subs1.filter((s) => s.score !== null && s.score !== undefined);
    const graded2 = subs2.filter((s) => s.score !== null && s.score !== undefined);

    const pending1 = subs1.length - graded1.length;
    const pending2 = subs2.length - graded2.length;

    const avg1 = graded1.length
      ? `${Math.round((graded1.reduce((sum, s) => sum + Number(s.score || 0), 0) / graded1.length) * 10) / 10} 分`
      : (subs1.length ? '待打分' : '暂无提交');
    const avg2 = graded2.length
      ? `${Math.round((graded2.reduce((sum, s) => sum + Number(s.score || 0), 0) / graded2.length) * 10) / 10} 分`
      : (subs2.length ? '待打分' : '暂无提交');

    classTeacherSubmissions.innerHTML = `
      <div class="cohort-submissions-overview-wrap">
        <div class="cohort-submissions-banner">
          <span class="cohort-submissions-icon">📁</span>
          <div class="cohort-submissions-banner-content">
            <strong>全部班级大盘视角：已收起学生个人提交明细（双班共 100 名在籍学生）</strong>
            <p>为保障分班管理清晰度与学生隐私，大盘模式下不罗列个人提交列表。请直接点击下方对应班级卡片跳转至旁边专属班级页面，直接查看学情与批阅：</p>
          </div>
        </div>
        <div class="teacher-class-jump-grid">
          <div class="teacher-class-jump-card card-class-1" data-jump-to-class="1" data-jump-target="submissions" role="button" tabindex="0" title="点击直接进入数经1班作业收件箱与批阅">
            <div class="jump-card-header">
              <div class="jump-card-title-wrap">
                <span class="jump-class-icon">📝</span>
                <div>
                  <h3 class="jump-class-name">数经1班 · 作业收件箱</h3>
                  <span class="jump-class-teacher">任课教师：张老师 (teacher1@class.local)</span>
                </div>
              </div>
              <span class="jump-class-badge badge-c1">在籍 50 人</span>
            </div>
            <p class="jump-card-desc">独立花名册 50 人。点击直接跳转至旁边数经1班页面，查看专属四象限学情、学生作业量规打分与AI预评复核。</p>
            <div class="jump-card-stats">
              <div class="jump-stat-item">
                <span class="jump-stat-label">已收作业</span>
                <span class="jump-stat-value text-blue">${subs1.length} 份</span>
              </div>
              <div class="jump-stat-item">
                <span class="jump-stat-label">待批/预评</span>
                <span class="jump-stat-value text-orange">${pending1} 份</span>
              </div>
              <div class="jump-stat-item">
                <span class="jump-stat-label">已批均分</span>
                <span class="jump-stat-value">${avg1}</span>
              </div>
            </div>
            <div class="jump-card-action">
              <button type="button" class="jump-action-btn" data-jump-to-class="1" data-jump-target="submissions">
                👉 直接进入【数经1班】批阅与查看学情
              </button>
            </div>
          </div>

          <div class="teacher-class-jump-card card-class-2" data-jump-to-class="2" data-jump-target="submissions" role="button" tabindex="0" title="点击直接进入数经2班作业收件箱与批阅">
            <div class="jump-card-header">
              <div class="jump-card-title-wrap">
                <span class="jump-class-icon">📝</span>
                <div>
                  <h3 class="jump-class-name">数经2班 · 作业收件箱</h3>
                  <span class="jump-class-teacher">任课教师：李老师 (teacher2@class.local)</span>
                </div>
              </div>
              <span class="jump-class-badge badge-c2">在籍 50 人</span>
            </div>
            <p class="jump-card-desc">独立花名册 50 人。点击直接跳转至旁边数经2班页面，查看专属四象限学情、学生作业量规打分与AI预评复核。</p>
            <div class="jump-card-stats">
              <div class="jump-stat-item">
                <span class="jump-stat-label">已收作业</span>
                <span class="jump-stat-value text-blue">${subs2.length} 份</span>
              </div>
              <div class="jump-stat-item">
                <span class="jump-stat-label">待批/预评</span>
                <span class="jump-stat-value text-orange">${pending2} 份</span>
              </div>
              <div class="jump-stat-item">
                <span class="jump-stat-label">已批均分</span>
                <span class="jump-stat-value">${avg2}</span>
              </div>
            </div>
            <div class="jump-card-action">
              <button type="button" class="jump-action-btn" data-jump-to-class="2" data-jump-target="submissions">
                👉 直接进入【数经2班】批阅与查看学情
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const filterVal = filterSelect ? filterSelect.value : 'all';
  let filtered = currentTeacherSubmissionsList;
  if (filterVal === 'pending') {
    filtered = filtered.filter((i) => i.score === null && !i.aiEvaluation && (i.aiSuggestedScore === null || i.aiSuggestedScore === undefined));
  } else if (filterVal === 'ai_pregraded') {
    filtered = filtered.filter((i) => i.score === null && (Boolean(i.aiEvaluation) || (i.aiSuggestedScore !== null && i.aiSuggestedScore !== undefined)));
  } else if (filterVal === 'graded') {
    filtered = filtered.filter((i) => i.score !== null && i.score !== undefined);
  } else if (filterVal === 'leap') {
    filtered = filtered.filter((i) => Boolean(i.isLeap) || (i.rankGain !== null && Number(i.rankGain) >= 15));
  }

  if (!filtered.length) {
    classTeacherSubmissions.innerHTML = renderClassEmpty('暂无符合筛选条件的学生作业提交。');
    return;
  }
  classTeacherSubmissions.innerHTML = filtered.map((item) => {
    const kind = getClassFileKind(item.originalName, item.mimeType);
    const rubricSummary = item.rubricScores
      ? `理论:${item.rubricScores.theory || 0} · 实证:${item.rubricScores.empirical || 0} · 创新:${item.rubricScores.innovation || 0} · 规范:${item.rubricScores.expression || 0}`
      : (item.aiEvaluation ? `AI建议: 理论${item.aiEvaluation.rubric?.theory ?? item.aiEvaluation.theory ?? 0}·实证${item.aiEvaluation.rubric?.empirical ?? item.aiEvaluation.empirical ?? 0}·创新${item.aiEvaluation.rubric?.innovation ?? item.aiEvaluation.innovation ?? 0}·规范${item.aiEvaluation.rubric?.expression ?? item.aiEvaluation.expression ?? 0}` : null);

    return `
      <article class="class-item">
        <div class="class-item-head">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong>${escapeHtml(item.studentName || '学生')}</strong>
            ${renderClassScopeBadge(item.classId, item.className)}
            <small style="color:var(--muted)">学号: ${escapeHtml(item.studentNo || '-')}</small>
            ${renderTierBadge(item.tier || item.aiSuggestedTier)}
            ${renderSubmissionStatusPill(item)}
            ${item.isLeap ? '<span class="leap-badge">⚡ 位次跃迁</span>' : ''}
          </div>
          <small>${escapeHtml(item.assignmentTitle || '文件收取')} · ${escapeHtml(getClassFileKindLabel(kind))} · ${escapeHtml(formatClassTime(item.updatedAt || item.createdAt))}</small>
        </div>

        <div style="font-size:12px;color:var(--muted);display:flex;flex-wrap:wrap;gap:12px;background:var(--surface-soft);padding:8px 12px;border-radius:8px;border:1px solid var(--border);">
          <span>📍 生源: <b>${escapeHtml(item.originProvince || '未录入')}</b></span>
          <span>高考总分: <b>${item.gaokaoScore || '无'}</b> (数学 <b>${item.gaokaoMath || '-'}</b>)</span>
          <span>初始排位: <b>#${item.initialRank || '-'}</b></span>
          ${item.rankInClass !== null && item.rankInClass !== undefined ? `<span>本次排位: <b>#${item.rankInClass}</b></span>` : ''}
          ${item.rankGain !== null && item.rankGain !== undefined ? `<span style="color:${item.rankGain >= 0 ? 'var(--purple)' : 'var(--orange)'};font-weight:700;">位次净增: ${item.rankGain >= 0 ? '+' : ''}${item.rankGain}</span>` : ''}
          ${item.score !== null ? `<span style="color:var(--blue);font-weight:800;">最终得分: ${item.score}分</span>` : (item.aiSuggestedScore !== null && item.aiSuggestedScore !== undefined ? `<span style="color:var(--blue);">AI建议分: ${item.aiSuggestedScore}分</span>` : '')}
        </div>

        ${renderClassFilePreview(item)}
        <p>${escapeHtml(item.originalName || '未命名文件')} · ${escapeHtml(formatFileSize(item.fileSize))}${item.note ? ` · 备注: ${escapeHtml(item.note)}` : ''}</p>

        ${rubricSummary ? `<div style="font-size:12px;color:var(--muted);"><b>四维拆解：</b>${escapeHtml(rubricSummary)}</div>` : ''}
        ${item.feedback ? `<div style="font-size:12px;color:var(--text);background:var(--blue-soft);padding:8px 12px;border-radius:8px;"><b>学生评语：</b>${escapeHtml(item.feedback)}</div>` : ''}
        ${item.teacherDiagnosticNote ? `<div style="font-size:12px;color:#92400e;background:rgba(245,158,11,.1);padding:8px 12px;border-radius:8px;border:1px dashed rgba(245,158,11,.4);"><b>内部教学诊断备忘：</b>${escapeHtml(item.teacherDiagnosticNote)}</div>` : ''}

        <div class="class-item-actions">
          <button type="button" class="primary-btn" data-class-grade-submission="${escapeHtml(item.id)}">${item.score !== null ? '调整量规打分' : '量规批阅与诊断'}</button>
          ${renderClassFileActions(item, '下载文件')}
        </div>
      </article>
    `;
  }).join('');
};

const renderStudentRemindersBanner = (reminders = []) => {
  const wrap = document.getElementById('classStudentRemindersWrap');
  if (!wrap) return;
  if (!reminders.length) {
    wrap.hidden = true;
    wrap.innerHTML = '';
    return;
  }
  wrap.hidden = false;
  wrap.innerHTML = `
    <div class="student-reminder-alert-banner">
      <div class="reminder-banner-icon">🔔</div>
      <div class="reminder-banner-content">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <strong>您有 ${reminders.length} 份作业收到任课教师的催交通知！</strong>
          <span style="font-size:12px;color:#b45309;background:rgba(245,158,11,0.15);padding:2px 8px;border-radius:999px;font-weight:600;">请尽快提交</span>
        </div>
        <div class="reminder-banner-list">
          ${reminders.map((r) => `
            <div class="reminder-banner-item">
              <div class="reminder-banner-item-left">
                <span style="font-weight:700;color:var(--text);">【${escapeHtml(r.assignmentTitle)}】</span>
                <span style="color:var(--muted);font-size:12px;">（${escapeHtml(r.teacherName || '任课教师')} 于 ${escapeHtml(formatClassTime(r.createdAt))} 发出催交）</span>
              </div>
              <div style="font-size:12px;color:var(--text);flex:1;min-width:200px;padding:0 8px;">
                💬 <em>${escapeHtml(r.message || '请及时提交')}</em>
              </div>
              <button type="button" class="reminder-banner-jump-btn" data-jump-to-assignment="${escapeHtml(r.assignmentId)}">
                ✍️ 立即前往提交
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

const renderStudentAssignments = (items) => {
  if (!classStudentAssignments) return;
  if (!items.length) {
    classStudentAssignments.innerHTML = renderClassEmpty('暂时没有待交文件。');
    return;
  }
  const myReminders = classOverview.myReminders || [];
  const reminderMap = new Map(myReminders.map((r) => [String(r.assignmentId), r]));

  classStudentAssignments.innerHTML = items.map((item) => {
    const submitted = Boolean(item.mySubmission);
    const closed = item.status !== 'open';
    const reminder = reminderMap.get(String(item.id));
    return `
      <article class="class-item" id="student-assignment-item-${escapeHtml(item.id)}">
        <div class="class-item-head">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong>${escapeHtml(item.title)}</strong>
            ${renderClassScopeBadge(item.classId, item.className)}
            ${reminder && !submitted ? '<span class="status-pill" style="background:#fef3c7;color:#b45309;border:1px solid #fcd34d;">⚠️ 教师已催交</span>' : ''}
          </div>
          <small>${closed ? '已停止收取' : (submitted ? '已提交' : '待提交')}</small>
        </div>
        <p>${escapeHtml(item.description || '教师未填写补充说明')}</p>
        <small>截止：${escapeHtml(formatClassTime(item.dueAt))}${submitted ? ` · 上次提交 ${escapeHtml(item.mySubmission.originalName)}` : ''}</small>
        ${reminder && !submitted ? `
          <div class="assignment-reminder-callout">
            <div class="callout-icon">🔔</div>
            <div style="flex:1;">
              <strong>任课教师（${escapeHtml(reminder.teacherName || '任课教师')}）催交提醒：</strong>
              <p>${escapeHtml(reminder.message || '请抓紧在系统完成提交！')}</p>
              <small>提醒发送时间：${escapeHtml(formatClassTime(reminder.createdAt))}</small>
            </div>
          </div>
        ` : ''}
        ${closed ? '' : `
          <form class="class-submit-form" data-class-submit="${escapeHtml(item.id)}" style="margin-top:12px;">
            <input type="file" name="file" accept="${CLASS_FILE_ACCEPT}" required>
            <small>可提交图片、Word、PDF、PPT、Excel 或压缩包，单文件不超过 50MB。</small>
            <input type="text" name="note" maxlength="300" placeholder="可选备注，例如：已按学号命名">
            <button type="submit" class="primary-btn">${submitted ? '重新提交' : '提交文件'}</button>
          </form>
        `}
      </article>
    `;
  }).join('');
};

const renderStudentSubmissions = (items) => {
  if (!classStudentSubmissions) return;
  if (!items.length) {
    classStudentSubmissions.innerHTML = renderClassEmpty('你还没有提交过文件。');
    return;
  }
  classStudentSubmissions.innerHTML = items.map((item) => {
    const kind = getClassFileKind(item.originalName, item.mimeType);
    const isGraded = Boolean(item.isGraded || item.status === 'graded');
    return `
      <article class="class-item">
        <div class="class-item-head">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong>${escapeHtml(item.assignmentTitle || '文件收取')}</strong>
            ${isGraded ? '<span class="status-pill graded">教师已审阅反馈</span>' : '<span class="status-pill pending">教师审阅中</span>'}
          </div>
          <small>${escapeHtml(getClassFileKindLabel(kind))} · ${escapeHtml(formatClassTime(item.updatedAt || item.createdAt))}</small>
        </div>
        ${renderClassFilePreview(item)}
        <p>${escapeHtml(item.originalName || '未命名文件')} · ${escapeHtml(formatFileSize(item.fileSize))}${item.note ? ` · 我的备注: ${escapeHtml(item.note)}` : ''}</p>
        ${isGraded && item.feedback ? `<div class="student-feedback-box"><strong>教师指导评语：</strong>${escapeHtml(item.feedback)}</div>` : ''}
        <div class="class-item-actions">
          ${isGraded ? `<button type="button" class="primary-btn" data-class-view-submission="${escapeHtml(item.id)}">查看教师学术指导与评语</button>` : ''}
          ${renderClassFileActions(item, '下载我的文件')}
        </div>
      </article>
    `;
  }).join('');
};

const renderClassWorkspace = () => {
  const loggedIn = Boolean(currentUser);
  if (classGuestPanel) classGuestPanel.hidden = loggedIn;
  if (classAppPanel) classAppPanel.hidden = !loggedIn;
  if (!loggedIn) return;

  const view = getActiveClassView();
  const isAdmin = currentUser.role === 'admin';
  if (classPreviewSwitch) classPreviewSwitch.hidden = !isAdmin;
  if (classPreviewSwitch) {
    classPreviewSwitch.querySelectorAll('[data-class-preview]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.classPreview === view);
    });
  }
  if (classAdminView) classAdminView.hidden = view !== 'admin';
  if (classTeacherView) classTeacherView.hidden = view !== 'teacher';
  if (classStudentView) classStudentView.hidden = view !== 'student';
  const isTeacherView = view === 'teacher';
  const isAdminView = isAdmin && view === 'admin';
  if (classStats) {
    classStats.classList.toggle('is-admin', isAdminView);
    classStats.classList.toggle('is-teacher', isTeacherView);
  }
  if (classStatClassCard) classStatClassCard.hidden = !isAdminView;
  if (classStatTeacherCard) classStatTeacherCard.hidden = !isAdminView;
  if (classStatStudentCard) classStatStudentCard.hidden = !(isAdminView || isTeacherView);
  if (classRoleBadge) {
    classRoleBadge.textContent = isAdmin
      ? (view === 'admin' ? '管理员后台' : `管理员预览 · ${view === 'teacher' ? '教师页' : '学生页'}`)
      : getClassRoleLabel(currentUser.role);
  }
  if (classHeroTitle) {
    classHeroTitle.textContent = view === 'admin'
      ? '班级管理后台'
      : (view === 'teacher' ? '教师工作台' : '学生工作台');
  }
  if (classHeroCopy) {
    const classNames = (classOverview.myClasses || []).map((item) => item.name).filter(Boolean);
    classHeroCopy.textContent = view === 'admin'
      ? '创建班级、创建教师账号，并为每个班级任命一位或多位老师。学生使用专属邀请码注册后会自动进入花名册班级。'
      : (view === 'teacher'
        ? '发布班级公告、收取学生文件，并查看图片、Word、PDF 等提交内容。'
        : (classNames.length
          ? `你已被分配到：${classNames.join('、')}。可查看教师公告并提交文件。`
          : '查看教师公告，按收取要求提交图片、Word、PDF 等文件。同一任务再次提交会覆盖旧文件。'));
  }
  if (classStatClasses) classStatClasses.textContent = (classDirectory.classes || []).length;
  if (classStatTeachers) classStatTeachers.textContent = (classDirectory.teachers || []).length;

  const studentCountVal = (isTeacherView || (isAdmin && currentClassScope !== 'all'))
    ? (classOverview.stats?.studentCount || classOverview.stats?.rosterStudentCount || 50)
    : (classDirectory.studentCount || (classDirectory.classes || []).reduce((sum, item) => sum + Number((item.students || []).length || item.studentCount || 0), 0) || 100);

  if (classStatStudents) classStatStudents.textContent = studentCountVal;
  const classStatStudentSubtext = document.getElementById('classStatStudentSubtext');
  if (classStatStudentSubtext) {
    if (isTeacherView) {
      if (isAdmin) {
        classStatStudentSubtext.textContent = currentClassScope === 'all' ? '100人大盘总库' : (currentClassScope === '1' ? '数经1班独立花名册 (50人)' : '数经2班独立花名册 (50人)');
      } else {
        classStatStudentSubtext.textContent = '本班独立花名册 (50人)';
      }
    } else {
      classStatStudentSubtext.textContent = currentClassScope === '1' ? '数经1班花名册 (50人)' : (currentClassScope === '2' ? '数经2班花名册 (50人)' : '已导入学生 (100人总盘)');
    }
  }
  if (classStatAnnouncements) classStatAnnouncements.textContent = classOverview.stats?.announcementCount || 0;
  if (classStatAssignments) classStatAssignments.textContent = classOverview.stats?.openAssignmentCount || 0;

  // Scheme A (Admin) & Scheme B (Teacher) Class Scoping & Status UI
  if (classSwitcherBar) {
    if (isAdmin) {
      // Scheme A: Admin switcher
      const showSwitcher = view === 'admin' || view === 'teacher';
      classSwitcherBar.hidden = !showSwitcher;
      if (showSwitcher) {
        if (classSwitcherTabs) classSwitcherTabs.hidden = false;
        if (classTeacherIsolatedBadge) classTeacherIsolatedBadge.hidden = true;
        if (classSwitcherLabel) classSwitcherLabel.textContent = '当前数据范围：';
        if (classSwitcherTabs) {
          classSwitcherTabs.querySelectorAll('[data-class-scope]').forEach((btn) => {
            const active = btn.dataset.classScope === currentClassScope;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', String(active));
          });
        }
        if (classSwitcherTitle && classSwitcherScopeBadge) {
          if (currentClassScope === '1') {
            classSwitcherTitle.textContent = view === 'teacher' ? '数经1班 · 教师视角预览' : '数经1班 · 专属视角';
            classSwitcherScopeBadge.textContent = '50 人 (任课教师: teacher1)';
          } else if (currentClassScope === '2') {
            classSwitcherTitle.textContent = view === 'teacher' ? '数经2班 · 教师视角预览' : '数经2班 · 专属视角';
            classSwitcherScopeBadge.textContent = '50 人 (任课教师: teacher2)';
          } else {
            classSwitcherTitle.textContent = view === 'teacher' ? '全部班级 · 综合教师视角' : '年级大盘 (全部班级)';
            classSwitcherScopeBadge.textContent = '100 人总库 (数经1 + 数经2)';
          }
        }
        if (announcementClassSelectLabel) announcementClassSelectLabel.hidden = false;
        if (assignmentClassSelectLabel) assignmentClassSelectLabel.hidden = false;
        if (classAnnouncementClassSelect && currentClassScope !== 'all') {
          classAnnouncementClassSelect.value = currentClassScope;
        }
        if (classAssignmentClassSelect && currentClassScope !== 'all') {
          classAssignmentClassSelect.value = currentClassScope;
        }
      }
    } else if (currentUser.role === 'teacher') {
      // Scheme B: Teacher strict class isolation
      classSwitcherBar.hidden = false;
      if (classSwitcherTabs) classSwitcherTabs.hidden = true;
      if (classTeacherIsolatedBadge) classTeacherIsolatedBadge.hidden = false;
      const myClass = (classOverview.myClasses || [])[0] || (currentUser.classes || [])[0] || null;
      let rawName = myClass?.name || (currentUser.email?.includes('1') ? '数经1' : (currentUser.email?.includes('2') ? '数经2' : '数经1'));
      const className = rawName.endsWith('班') ? rawName : `${rawName}班`;
      const teacherNum = className.includes('2') ? '2' : '1';
      if (classTeacherIsolatedText) {
        classTeacherIsolatedText.textContent = `班级专属工作台 · ${className} (50人 · 严格隔离) · 教师${teacherNum}已锁定`;
      }
      if (classSwitcherLabel) classSwitcherLabel.textContent = '已绑定班级：';
      if (classSwitcherTitle) classSwitcherTitle.textContent = `${className} · 专属工作台`;
      if (classSwitcherScopeBadge) classSwitcherScopeBadge.textContent = '50 人独立花名册 (无跨班权限)';
      if (announcementClassSelectLabel) announcementClassSelectLabel.hidden = true;
      if (assignmentClassSelectLabel) assignmentClassSelectLabel.hidden = true;
    } else {
      classSwitcherBar.hidden = true;
      if (announcementClassSelectLabel) announcementClassSelectLabel.hidden = true;
      if (assignmentClassSelectLabel) assignmentClassSelectLabel.hidden = true;
    }
  }

  if (view === 'admin') renderAdminClasses();
  if (classStudentClasses) {
    const myClasses = classOverview.myClasses || [];
    classStudentClasses.innerHTML = myClasses.length
      ? myClasses.map((item) => `
          <article class="class-item">
            <div class="class-item-head">
              <strong>${escapeHtml(item.name)}</strong>
              <small>已分配</small>
            </div>
            <p>注册成功后已自动进入该班，可查看公告并提交文件。</p>
          </article>
        `).join('')
      : renderClassEmpty('还没有分配班级。请使用管理员发给你的专属邀请码注册。');
  }
  renderClassAnnouncements(classTeacherAnnouncements, classOverview.announcements || [], { canDelete: true });
  renderClassAnnouncements(classStudentAnnouncements, classOverview.announcements || []);
  if (view === 'teacher') {
    const showAllCards = isAdmin && currentClassScope === 'all';
    const overviewCard = document.getElementById('teacherAllClassesOverviewCard');
    if (overviewCard) {
      overviewCard.hidden = !showAllCards;
      if (showAllCards) {
        renderTeacherClassJumpGrid();
      }
    }
  } else {
    const overviewCard = document.getElementById('teacherAllClassesOverviewCard');
    if (overviewCard) overviewCard.hidden = true;
  }
  renderTeacherAssignments(classOverview.assignments || []);
  renderTeacherSubmissions(classOverview.submissions || []);
  renderStudentRemindersBanner(classOverview.myReminders || []);
  renderStudentAssignments(classOverview.assignments || []);
  renderStudentSubmissions((classOverview.assignments || []).map((item) => item.mySubmission).filter(Boolean));
};

const loadClassOverview = async ({ silent = false } = {}) => {
  if (!currentUser) {
    classOverview = { stats: {}, announcements: [], assignments: [], submissions: [], myClasses: [] };
    renderClassWorkspace();
    return;
  }
  if (classLoading) return;
  classLoading = true;
  try {
    const params = new URLSearchParams();
    if (currentUser.role === 'admin' && currentClassScope && currentClassScope !== 'all') {
      params.set('classId', currentClassScope);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const { overview } = await apiRequest(`/api/class/overview${queryString}`);
    classOverview = overview || { stats: {}, announcements: [], assignments: [], submissions: [], myClasses: [] };
    renderClassWorkspace();
    if (['admin', 'teacher'].includes(currentUser.role)) {
      loadClassDiagnostics({ silent: true });
    }
  } catch (error) {
    if (!silent) showToast(error.message || '班级数据加载失败');
    renderClassWorkspace();
  } finally {
    classLoading = false;
  }
};

const loadClassDirectory = async ({ silent = false } = {}) => {
  if (!currentUser || currentUser.role !== 'admin') {
    classDirectory = { classes: [], teachers: [] };
    return;
  }
  if (classDirectoryLoading) return;
  classDirectoryLoading = true;
  try {
    const { directory } = await apiRequest('/api/class/admin/directory');
    classDirectory = directory || { classes: [], teachers: [], studentCount: 0 };
    renderClassWorkspace();
  } catch (error) {
    if (!silent) showToast(error.message || '管理后台数据加载失败');
    renderClassWorkspace();
  } finally {
    classDirectoryLoading = false;
  }
};

const syncClassWorkspace = () => {
  renderClassWorkspace();
  if (currentWorkspace === 'class' && currentUser) {
    loadClassOverview({ silent: true });
    if (currentUser.role === 'admin') loadClassDirectory({ silent: true });
  }
};

const setWorkspace = (workspace) => {
  currentWorkspace = workspace === 'class' ? 'class' : 'community';
  const isClass = currentWorkspace === 'class';
  document.body.classList.toggle('class-mode', isClass);
  if (communityWorkspace) communityWorkspace.hidden = isClass;
  if (classWorkspace) classWorkspace.hidden = !isClass;
  if (brandText) brandText.textContent = isClass ? '班级管理' : '现经管回声';
  if (workspaceSwitchLabel) workspaceSwitchLabel.textContent = isClass ? '现经管回声' : '班级管理';
  if (workspaceSwitchBtn) {
    workspaceSwitchBtn.setAttribute('aria-label', isClass ? '切换到现经管回声' : '切换到班级管理');
  }
  document.title = isClass ? '班级管理' : '现经管回声';
  if (isClass) {
    closeDropdowns();
    syncClassWorkspace();
  }
};

brandHome.addEventListener('click', (event) => {
  event.preventDefault();
  if (currentWorkspace === 'class') setWorkspace('community');
  resetChips();
  switchFilter('all', '最新吐槽');
  showToast('已回到首页');
});

if (workspaceSwitchBtn) {
  workspaceSwitchBtn.addEventListener('click', () => {
    if (currentWorkspace === 'class') {
      setWorkspace('community');
      showToast('已回到现经管回声');
      return;
    }
    setWorkspace('class');
    showToast('已进入班级管理');
  });
}

if (classLoginBtn) classLoginBtn.addEventListener('click', () => openLogin());
if (classBackHomeBtn) {
  classBackHomeBtn.addEventListener('click', () => {
    setWorkspace('community');
    showToast('已回到现经管回声');
  });
}
if (classPreviewSwitch) {
  classPreviewSwitch.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-class-preview]');
    if (!button || currentUser?.role !== 'admin') return;
    const nextView = button.dataset.classPreview;
    classPreviewRole = ['admin', 'teacher', 'student'].includes(nextView) ? nextView : 'admin';
    renderClassWorkspace();
    if (classPreviewRole === 'admin') {
      await Promise.all([loadClassDirectory({ silent: true }), loadClassOverview({ silent: true })]);
    } else {
      await loadClassOverview({ silent: true });
    }
  });
}
if (classSwitcherTabs) {
  classSwitcherTabs.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-class-scope]');
    if (!button || currentUser?.role !== 'admin') return;
    const nextScope = button.dataset.classScope;
    if (!nextScope || nextScope === currentClassScope) return;
    currentClassScope = nextScope;
    renderClassWorkspace();
    await loadClassOverview();
    if (currentUser?.role === 'admin' && classPreviewRole === 'admin') {
      await loadClassDirectory({ silent: true });
    }
  });
}
// Direct Class Jump Handlers (Scheme A: Admin jumping directly into specific class workspace)
document.addEventListener('click', async (event) => {
  const jumpBtn = event.target.closest('[data-jump-to-class]');
  if (jumpBtn) {
    event.preventDefault();
    const targetClass = jumpBtn.dataset.jumpToClass;
    const jumpTarget = jumpBtn.dataset.jumpTarget;
    if (!targetClass) return;

    currentClassScope = String(targetClass);

    // If currently in admin view, seamlessly transition to teacher view to view class situation
    if (classPreviewRole === 'admin') {
      classPreviewRole = 'teacher';
    }

    renderClassWorkspace();
    await loadClassOverview();

    // Smooth scroll to diagnostics, submissions or workspace header
    let targetEl = null;
    if (jumpTarget === 'submissions') {
      targetEl = document.getElementById('classTeacherSubmissions');
    } else {
      targetEl = document.getElementById('classTeacherDiagnosticsCard') || document.getElementById('classStats');
    }
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const className = currentClassScope === '1' ? '数经1班' : '数经2班';
    showToast(`已直接进入【${className}】班级情况页面`);
    return;
  }

  const toggleBtn = event.target.closest('[data-toggle-roster]');
  if (toggleBtn) {
    event.preventDefault();
    const cid = toggleBtn.dataset.toggleRoster;
    const rosterEl = document.getElementById(`rosterList_${cid}`);
    if (rosterEl) {
      rosterEl.hidden = !rosterEl.hidden;
      toggleBtn.textContent = rosterEl.hidden ? '展开/查看 50 人名单明细' : '收起 50 人名单明细';
    }
    return;
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    const jumpCard = event.target.closest('[data-jump-to-class][role="button"]');
    if (jumpCard && document.activeElement === jumpCard) {
      event.preventDefault();
      jumpCard.click();
    }
  }
});
if (classCreateForm) {
  classCreateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/api/class/admin/classes', {
        method: 'POST',
        body: JSON.stringify({ name: classCreateName.value.trim() }),
      });
      classCreateForm.reset();
      showToast('班级已创建');
      await loadClassDirectory();
    } catch (error) {
      showToast(error.message || '创建班级失败');
    }
  });
}
if (classTeacherCreateForm) {
  classTeacherCreateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/api/class/admin/teachers', {
        method: 'POST',
        body: JSON.stringify({
          nickname: classTeacherName.value.trim(),
          email: classTeacherEmail.value.trim(),
          password: classTeacherPassword.value,
        }),
      });
      classTeacherCreateForm.reset();
      showToast('教师账号已创建');
      await loadClassDirectory();
    } catch (error) {
      showToast(error.message || '创建教师失败');
    }
  });
}
if (classAnnouncementForm) {
  classAnnouncementForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/api/class/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: classAnnouncementTitle.value.trim(),
          content: classAnnouncementContent.value.trim(),
          classId: (currentUser?.role === 'admin' && classAnnouncementClassSelect)
            ? (classAnnouncementClassSelect.value || (currentClassScope !== 'all' ? currentClassScope : null))
            : null,
        }),
      });
      classAnnouncementForm.reset();
      showToast('班级公告已发布');
      await loadClassOverview();
    } catch (error) {
      showToast(error.message || '公告发布失败');
    }
  });
}
if (classAssignmentForm) {
  classAssignmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await apiRequest('/api/class/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: classAssignmentTitle.value.trim(),
          description: classAssignmentDesc.value.trim(),
          dueAt: classAssignmentDue.value ? new Date(classAssignmentDue.value).toISOString() : '',
          classId: (currentUser?.role === 'admin' && classAssignmentClassSelect)
            ? (classAssignmentClassSelect.value || (currentClassScope !== 'all' ? currentClassScope : null))
            : null,
        }),
      });
      classAssignmentForm.reset();
      showToast('文件收取已发布');
      await loadClassOverview();
    } catch (error) {
      showToast(error.message || '文件收取发布失败');
    }
  });
}
if (classWorkspace) {
  classWorkspace.addEventListener('click', async (event) => {
    const deleteAnnouncementBtn = event.target.closest('[data-class-delete-announcement]');
    const toggleAssignmentBtn = event.target.closest('[data-class-toggle-assignment]');
    const deleteAssignmentBtn = event.target.closest('[data-class-delete-assignment]');
    const unassignBtn = event.target.closest('[data-class-unassign]');
    const deleteClassBtn = event.target.closest('[data-class-delete]');
    try {
      if (deleteAnnouncementBtn) {
        await apiRequest(`/api/class/announcements/${deleteAnnouncementBtn.dataset.classDeleteAnnouncement}`, { method: 'DELETE' });
        showToast('公告已删除');
        await loadClassOverview();
        return;
      }
      if (toggleAssignmentBtn) {
        await apiRequest(`/api/class/assignments/${toggleAssignmentBtn.dataset.classToggleAssignment}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: toggleAssignmentBtn.dataset.nextStatus }),
        });
        showToast(toggleAssignmentBtn.dataset.nextStatus === 'closed' ? '已停止收取' : '已重新开放');
        await loadClassOverview();
        return;
      }
      if (deleteAssignmentBtn) {
        await apiRequest(`/api/class/assignments/${deleteAssignmentBtn.dataset.classDeleteAssignment}`, { method: 'DELETE' });
        showToast('收取任务已删除');
        await loadClassOverview();
        return;
      }
      if (unassignBtn) {
        await apiRequest(`/api/class/admin/classes/${unassignBtn.dataset.classUnassign}/teachers/${unassignBtn.dataset.teacherId}`, { method: 'DELETE' });
        showToast('已取消任命');
        await loadClassDirectory();
        return;
      }
      if (deleteClassBtn) {
        const className = deleteClassBtn.closest('.class-item')?.querySelector('strong')?.textContent || '该班级';
        if (!window.confirm(`确定删除「${className}」吗？该班的老师任命会一并取消。`)) return;
        await apiRequest(`/api/class/admin/classes/${deleteClassBtn.dataset.classDelete}`, { method: 'DELETE' });
        showToast('班级已删除');
        await loadClassDirectory();
      }
    } catch (error) {
      showToast(error.message || '操作失败');
    }
  });
  classWorkspace.addEventListener('submit', async (event) => {
    const assignForm = event.target.closest('[data-class-assign]');
    if (assignForm) {
      event.preventDefault();
      const teacherId = assignForm.querySelector('select[name="teacherId"]')?.value;
      if (!teacherId) {
        showToast('请先选择要任命的老师');
        return;
      }
      try {
        await apiRequest(`/api/class/admin/classes/${assignForm.dataset.classAssign}/teachers`, {
          method: 'POST',
          body: JSON.stringify({ teacherId }),
        });
        showToast('老师已任命');
        await loadClassDirectory();
      } catch (error) {
        showToast(error.message || '任命失败');
      }
      return;
    }

    const renameForm = event.target.closest('[data-class-rename]');
    if (renameForm) {
      event.preventDefault();
      const name = renameForm.querySelector('input[name="name"]')?.value.trim();
      if (!name) {
        showToast('请输入班级名称');
        return;
      }
      try {
        await apiRequest(`/api/class/admin/classes/${renameForm.dataset.classRename}`, {
          method: 'PATCH',
          body: JSON.stringify({ name }),
        });
        showToast('班级名称已更新');
        await loadClassDirectory();
      } catch (error) {
        showToast(error.message || '改名失败');
      }
      return;
    }

    const form = event.target.closest('[data-class-submit]');
    if (!form) return;
    event.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    const noteInput = form.querySelector('input[name="note"]');
    if (!fileInput?.files?.[0]) {
      showToast('请先选择要提交的文件');
      return;
    }
    const payload = new FormData();
    payload.append('file', fileInput.files[0]);
    payload.append('note', noteInput?.value || '');
    try {
      await apiRequest(`/api/class/assignments/${form.dataset.classSubmit}/submissions`, {
        method: 'POST',
        body: payload,
      });
      form.reset();
      showToast('文件已提交');
      await loadClassOverview();
    } catch (error) {
      showToast(error.message || '提交失败');
    }
  });
  const teacherSubFilter = document.getElementById('teacherSubmissionFilter');
  if (teacherSubFilter) {
    teacherSubFilter.addEventListener('change', () => {
      renderTeacherSubmissions(currentTeacherSubmissionsList);
    });
  }

  const refreshDiagBtn = document.getElementById('refreshDiagnosticsBtn');
  if (refreshDiagBtn) {
    refreshDiagBtn.addEventListener('click', async () => {
      refreshDiagBtn.disabled = true;
      try {
        await loadClassDiagnostics();
        showToast('诊断数据已刷新');
      } finally {
        refreshDiagBtn.disabled = false;
      }
    });
  }

  const batchAiBtn = document.getElementById('batchAiGradeBtn');
  if (batchAiBtn) {
    batchAiBtn.addEventListener('click', async () => {
      if (!window.confirm('确定对全班未批阅的作业启动 AI 批量多维量规预评分吗？这会分析学生的高考数学基线并自动生成双轨建议评语。')) return;
      batchAiBtn.disabled = true;
      batchAiBtn.textContent = 'AI 批量预评中...';
      try {
        const payload = { forceHeuristic: false };
        if (currentUser?.role === 'admin' && currentClassScope && currentClassScope !== 'all') {
          payload.classId = Number(currentClassScope);
        }
        const res = await apiRequest('/api/class/submissions/batch-ai-grade', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast(`AI 批量预评完成：成功 ${res.evaluatedCount || 0} 份`);
        await loadClassOverview();
        await loadClassDiagnostics();
      } catch (err) {
        showToast(err.message || 'AI 批量预评失败');
      } finally {
        batchAiBtn.disabled = false;
        batchAiBtn.textContent = '一键 AI 批量预批改';
      }
    });
  }
}

// Grading Modal & Student Detail Modal Controls
const gradingModal = document.getElementById('gradingModal');
const gradingModalClose = document.getElementById('gradingModalClose');
const gradingCancelBtn = document.getElementById('gradingCancelBtn');
const gradingForm = document.getElementById('gradingForm');
const rubricInputTheory = document.getElementById('rubricInputTheory');
const rubricInputEmpirical = document.getElementById('rubricInputEmpirical');
const rubricInputInnovation = document.getElementById('rubricInputInnovation');
const rubricInputExpression = document.getElementById('rubricInputExpression');
const scoreDisplayTheory = document.getElementById('scoreDisplayTheory');
const scoreDisplayEmpirical = document.getElementById('scoreDisplayEmpirical');
const scoreDisplayInnovation = document.getElementById('scoreDisplayInnovation');
const scoreDisplayExpression = document.getElementById('scoreDisplayExpression');
const rubricTotalDisplay = document.getElementById('rubricTotalDisplay');
const rubricTierDisplay = document.getElementById('rubricTierDisplay');
const rubricLeapNotice = document.getElementById('rubricLeapNotice');
const gradingModalCurrentTier = document.getElementById('gradingModalCurrentTier');
const gradingStudentMeta = document.getElementById('gradingStudentMeta');
const gradingAiCallout = document.getElementById('gradingAiCallout');
const gradingAiBody = document.getElementById('gradingAiBody');
const gradingAiConfidence = document.getElementById('gradingAiConfidence');
const applyAiGradingBtn = document.getElementById('applyAiGradingBtn');
const runSingleAiGradeBtn = document.getElementById('runSingleAiGradeBtn');
const gradingStudentFeedback = document.getElementById('gradingStudentFeedback');
const gradingTeacherDiagnosticNote = document.getElementById('gradingTeacherDiagnosticNote');

const submissionDetailModal = document.getElementById('submissionDetailModal');
const submissionDetailClose = document.getElementById('submissionDetailClose');
const submissionDetailContent = document.getElementById('submissionDetailContent');
const submissionDetailTierWrap = document.getElementById('submissionDetailTierWrap');

const closeGradingModal = () => {
  if (gradingModal) gradingModal.hidden = true;
  currentGradingSubmission = null;
};

const closeSubmissionDetailModal = () => {
  if (submissionDetailModal) submissionDetailModal.hidden = true;
};

const calcCurrentRubricScore = () => {
  const t = Number(rubricInputTheory ? rubricInputTheory.value : 0) || 0;
  const e = Number(rubricInputEmpirical ? rubricInputEmpirical.value : 0) || 0;
  const i = Number(rubricInputInnovation ? rubricInputInnovation.value : 0) || 0;
  const ex = Number(rubricInputExpression ? rubricInputExpression.value : 0) || 0;
  return Math.round((t + e + i + ex) * 10) / 10;
};

const updateGradingModalCalculations = () => {
  if (!currentGradingSubmission) return;
  const t = Number(rubricInputTheory ? rubricInputTheory.value : 0) || 0;
  const e = Number(rubricInputEmpirical ? rubricInputEmpirical.value : 0) || 0;
  const i = Number(rubricInputInnovation ? rubricInputInnovation.value : 0) || 0;
  const ex = Number(rubricInputExpression ? rubricInputExpression.value : 0) || 0;

  if (scoreDisplayTheory) scoreDisplayTheory.textContent = t;
  if (scoreDisplayEmpirical) scoreDisplayEmpirical.textContent = e;
  if (scoreDisplayInnovation) scoreDisplayInnovation.textContent = i;
  if (scoreDisplayExpression) scoreDisplayExpression.textContent = ex;

  const total = Math.round((t + e + i + ex) * 10) / 10;
  if (rubricTotalDisplay) rubricTotalDisplay.textContent = total;

  let baseTier = 'D';
  if (total >= 90) baseTier = 'A';
  else if (total >= 80) baseTier = 'B+';
  else if (total >= 70) baseTier = 'B';
  else if (total >= 60) baseTier = 'C';

  const initialRank = Number(currentGradingSubmission.initialRank) || 25;
  const currentRank = Number(currentGradingSubmission.rankInClass) || 25;
  const rankGain = initialRank - currentRank;
  const isLeap = rankGain >= 15 || (initialRank > 25 && currentRank <= 12);

  let finalTier = baseTier;
  if (isLeap) {
    if (baseTier === 'B' && total >= 65) finalTier = 'B+';
    else if (baseTier === 'B+' && total >= 80) finalTier = 'A';
    else if (baseTier === 'C' && total >= 58) finalTier = 'B';
  }

  if (rubricTierDisplay) {
    rubricTierDisplay.textContent = `${finalTier} (${finalTier === 'A' ? '卓越' : (finalTier === 'B+' ? '优秀' : (finalTier === 'B' ? '良好' : (finalTier === 'C' ? '合格' : '需努力')))})`;
  }
  if (gradingModalCurrentTier) {
    gradingModalCurrentTier.textContent = finalTier;
    gradingModalCurrentTier.className = `tier-badge ${getTierClass(finalTier)}`;
  }
  if (rubricLeapNotice) {
    rubricLeapNotice.hidden = !isLeap;
  }
};

const openGradingModal = (submission) => {
  currentGradingSubmission = submission;
  if (!gradingModal) return;

  if (gradingStudentMeta) {
    gradingStudentMeta.innerHTML = `
      <span class="grading-meta-item">学生: <strong>${escapeHtml(submission.studentName || '学生')}</strong> (${escapeHtml(submission.studentNo || '-')})</span>
      <span class="grading-meta-item">班级: <strong>${escapeHtml(submission.className || '数经')}</strong></span>
      <span class="grading-meta-item highlight-gaokao">📍 生源省份: <strong>${escapeHtml(submission.originProvince || '未录入')}</strong></span>
      <span class="grading-meta-item highlight-gaokao">高考基线: <strong>${submission.gaokaoScore || '无'} 分</strong> (数学 <strong>${submission.gaokaoMath || '-'} 分</strong>)</span>
      <span class="grading-meta-item">高考初始位次: <strong>#${submission.initialRank || '-'}</strong></span>
      ${submission.rankInClass ? `<span class="grading-meta-item">当前课程排位: <strong>#${submission.rankInClass}</strong></span>` : ''}
    `;
  }

  const aiRubric = submission.aiEvaluation?.rubric || submission.aiEvaluation || null;
  const scores = submission.rubricScores || (aiRubric ? {
    theory: aiRubric.theory !== undefined ? aiRubric.theory : 24,
    empirical: aiRubric.empirical !== undefined ? aiRubric.empirical : 23,
    innovation: aiRubric.innovation !== undefined ? aiRubric.innovation : 15,
    expression: aiRubric.expression !== undefined ? aiRubric.expression : 16,
  } : {
    theory: 24,
    empirical: 23,
    innovation: 15,
    expression: 16,
  });

  if (rubricInputTheory) rubricInputTheory.value = scores.theory !== undefined ? scores.theory : 24;
  if (rubricInputEmpirical) rubricInputEmpirical.value = scores.empirical !== undefined ? scores.empirical : 23;
  if (rubricInputInnovation) rubricInputInnovation.value = scores.innovation !== undefined ? scores.innovation : 15;
  if (rubricInputExpression) rubricInputExpression.value = scores.expression !== undefined ? scores.expression : 16;

  if (gradingStudentFeedback) {
    gradingStudentFeedback.value = submission.feedback || (submission.aiEvaluation?.studentFeedback || '');
  }
  if (gradingTeacherDiagnosticNote) {
    gradingTeacherDiagnosticNote.value = submission.teacherDiagnosticNote || (submission.aiEvaluation?.teacherDiagnosticNote || '');
  }

  const aiEval = submission.aiEvaluation;
  if (aiEval && gradingAiCallout) {
    gradingAiCallout.hidden = false;
    if (gradingAiConfidence) gradingAiConfidence.textContent = aiEval.confidence || '0.92';
    if (gradingAiBody) {
      gradingAiBody.innerHTML = `
        <div><b>建议总分：</b><strong style="color:var(--blue);font-size:14px;">${aiEval.suggestedScore || '-'} 分</strong> · 预评等级：${renderTierBadge(aiEval.suggestedTier)}</div>
        <div class="grading-ai-scores-bar">
          <span>理论基础: ${aiEval.rubric?.theory ?? aiEval.theory ?? 0}/30</span>
          <span>实证分析: ${aiEval.rubric?.empirical ?? aiEval.empirical ?? 0}/30</span>
          <span>创新洞察: ${aiEval.rubric?.innovation ?? aiEval.innovation ?? 0}/20</span>
          <span>规范表达: ${aiEval.rubric?.expression ?? aiEval.expression ?? 0}/20</span>
        </div>
        <div style="margin-top:6px;color:var(--text);"><b>AI建议公开评语：</b>${escapeHtml(aiEval.studentFeedback || '')}</div>
        <div style="margin-top:4px;color:#92400e;"><b>AI内部学情建议：</b>${escapeHtml(aiEval.teacherDiagnosticNote || '')}</div>
      `;
    }
  } else if (gradingAiCallout) {
    gradingAiCallout.hidden = true;
  }

  updateGradingModalCalculations();
  gradingModal.hidden = false;
};

const openSubmissionDetailModal = (submission) => {
  if (!submissionDetailModal) return;
  const isGraded = Boolean(submission.isGraded || submission.status === 'graded');

  if (submissionDetailTierWrap) {
    submissionDetailTierWrap.innerHTML = isGraded ? '<span class=\"status-pill graded\">审阅完成</span>' : '<span class=\"status-pill pending\">待审阅</span>';
  }

  if (submissionDetailContent) {
    submissionDetailContent.innerHTML = `
      <div class=\"student-rubric-summary\" style=\"align-items:center;\">
        <div>
          <span style=\"font-size:13px;color:var(--muted);display:block;\">作业审阅状态</span>
          <strong style=\"font-size:18px;color:var(--blue);\">${isGraded ? '导师已审阅并提供学术指导' : '任课教师正在审阅中'}</strong>
        </div>
        <div style=\"text-align:right;\">
          <span style=\"font-size:12px;color:var(--muted);\">以过程成长与学术建构为导向，不展示量化排位</span>
        </div>
      </div>

      <div class=\"section-subhead\" style=\"margin-top:14px;\">
        <strong>课程论文考察导向与学术发展维度</strong>
        <small>从经济学思维、实证规范、创新应用及论述逻辑进行针对性学术点拨</small>
      </div>

      <div class=\"student-rubric-grid\">
        <div class=\"student-rubric-col\">
          <strong>1. 理论基础与经济学思维</strong>
          <p style=\"font-size:12px;color:var(--text);margin-top:6px;line-height:1.5;\">聚焦数字经济学平台双边机制、网络外部性与微观机理的理解深度。</p>
        </div>
        <div class=\"student-rubric-col\">
          <strong>2. 数据与实证分析能力</strong>
          <p style=\"font-size:12px;color:var(--text);margin-top:6px;line-height:1.5;\">注重实证样本选取、数据清洗、计量建模及因果逻辑的学术严密性。</p>
        </div>
        <div class=\"student-rubric-col\">
          <strong>3. 创新洞察与现实应用</strong>
          <p style=\"font-size:12px;color:var(--text);margin-top:6px;line-height:1.5;\">鼓励结合数字平台前沿实践与政策热点，提出独立深刻的现实见解。</p>
        </div>
        <div class=\"student-rubric-col\">
          <strong>4. 结构严谨度与学术规范</strong>
          <p style=\"font-size:12px;color:var(--text);margin-top:6px;line-height:1.5;\">规范学术图表制作、参考文献规范引用（GB/T 7714）与逻辑自洽性。</p>
        </div>
      </div>

      <div style="margin-top:16px;">
        <div class="student-feedback-box">
          <strong>导师指导寄语与提升建议：</strong>
          ${escapeHtml(submission.feedback || '任课教师正在阅卷中，评语将在打分完成后公布。')}
        </div>
      </div>
    `;
  }

  submissionDetailModal.hidden = false;
};

// Wire Rubric Sliders
[rubricInputTheory, rubricInputEmpirical, rubricInputInnovation, rubricInputExpression].forEach((slider) => {
  if (slider) {
    slider.addEventListener('input', updateGradingModalCalculations);
  }
});

if (gradingModalClose) gradingModalClose.addEventListener('click', closeGradingModal);
if (gradingCancelBtn) gradingCancelBtn.addEventListener('click', closeGradingModal);
if (gradingModal) {
  gradingModal.addEventListener('click', (e) => {
    if (e.target === gradingModal) closeGradingModal();
  });
}

if (submissionDetailClose) submissionDetailClose.addEventListener('click', closeSubmissionDetailModal);
if (submissionDetailModal) {
  submissionDetailModal.addEventListener('click', (e) => {
    if (e.target === submissionDetailModal) closeSubmissionDetailModal();
  });
}

if (applyAiGradingBtn) {
  applyAiGradingBtn.addEventListener('click', () => {
    if (!currentGradingSubmission || !currentGradingSubmission.aiEvaluation) return;
    const ai = currentGradingSubmission.aiEvaluation;
    const aiScores = ai.rubric || ai;
    if (aiScores.theory !== undefined && rubricInputTheory) rubricInputTheory.value = aiScores.theory;
    if (aiScores.empirical !== undefined && rubricInputEmpirical) rubricInputEmpirical.value = aiScores.empirical;
    if (aiScores.innovation !== undefined && rubricInputInnovation) rubricInputInnovation.value = aiScores.innovation;
    if (aiScores.expression !== undefined && rubricInputExpression) rubricInputExpression.value = aiScores.expression;
    if (ai.studentFeedback && gradingStudentFeedback) gradingStudentFeedback.value = ai.studentFeedback;
    if (ai.teacherDiagnosticNote && gradingTeacherDiagnosticNote) gradingTeacherDiagnosticNote.value = ai.teacherDiagnosticNote;
    updateGradingModalCalculations();
    showToast('已采纳 AI 评分细目与双轨评语');
  });
}

if (runSingleAiGradeBtn) {
  runSingleAiGradeBtn.addEventListener('click', async () => {
    if (!currentGradingSubmission) return;
    runSingleAiGradeBtn.disabled = true;
    runSingleAiGradeBtn.textContent = 'AI 运算中...';
    try {
      const { evaluation } = await apiRequest(`/api/class/submissions/${currentGradingSubmission.id}/ai-grade`, {
        method: 'POST',
        body: JSON.stringify({ forceHeuristic: false }),
      });
      currentGradingSubmission.aiEvaluation = evaluation;
      if (gradingAiCallout) {
        gradingAiCallout.hidden = false;
        if (gradingAiConfidence) gradingAiConfidence.textContent = evaluation.confidence || '0.92';
        if (gradingAiBody) {
          gradingAiBody.innerHTML = `
            <div><b>建议总分：</b><strong style="color:var(--blue);font-size:14px;">${evaluation.suggestedScore || '-'} 分</strong> · 预评等级：${renderTierBadge(evaluation.suggestedTier)}</div>
            <div class="grading-ai-scores-bar">
              <span>理论基础: ${evaluation.rubric?.theory ?? evaluation.theory ?? 0}/30</span>
              <span>实证分析: ${evaluation.rubric?.empirical ?? evaluation.empirical ?? 0}/30</span>
              <span>创新洞察: ${evaluation.rubric?.innovation ?? evaluation.innovation ?? 0}/20</span>
              <span>规范表达: ${evaluation.rubric?.expression ?? evaluation.expression ?? 0}/20</span>
            </div>
            <div style="margin-top:6px;color:var(--text);"><b>AI建议公开评语：</b>${escapeHtml(evaluation.studentFeedback || '')}</div>
            <div style="margin-top:4px;color:#92400e;"><b>AI内部学情建议：</b>${escapeHtml(evaluation.teacherDiagnosticNote || '')}</div>
          `;
        }
      }
      showToast('AI 学情重新诊断完成');
    } catch (err) {
      showToast(err.message || 'AI 诊断失败');
    } finally {
      runSingleAiGradeBtn.disabled = false;
      runSingleAiGradeBtn.textContent = '重新运行 AI 预评';
    }
  });
}

if (gradingForm) {
  gradingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentGradingSubmission) return;
    const submitBtn = document.getElementById('gradingSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;

    const theory = Number(rubricInputTheory.value) || 0;
    const empirical = Number(rubricInputEmpirical.value) || 0;
    const innovation = Number(rubricInputInnovation.value) || 0;
    const expression = Number(rubricInputExpression.value) || 0;
    const score = Math.round((theory + empirical + innovation + expression) * 10) / 10;
    const feedback = (gradingStudentFeedback.value || '').trim();
    const teacherDiagnosticNote = (gradingTeacherDiagnosticNote.value || '').trim();

    try {
      await apiRequest(`/api/class/submissions/${currentGradingSubmission.id}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          score,
          rubricScores: { theory, empirical, innovation, expression, total: score },
          feedback,
          teacherDiagnosticNote,
        }),
      });
      showToast('量规评阅已保存并完成双轨同步');
      closeGradingModal();
      await loadClassOverview();
      await loadClassDiagnostics();
    } catch (err) {
      showToast(err.message || '评分保存失败');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Global click handler for grade button & student view button
document.addEventListener('click', (event) => {
  const gradeBtn = event.target.closest('[data-class-grade-submission]');
  if (gradeBtn) {
    const subId = gradeBtn.dataset.classGradeSubmission;
    const item = (currentTeacherSubmissionsList || []).find((s) => String(s.id) === String(subId));
    if (item) openGradingModal(item);
    return;
  }

  const viewBtn = event.target.closest('[data-class-view-submission]');
  if (viewBtn) {
    const subId = viewBtn.dataset.classViewSubmission;
    const mySubs = (classOverview.assignments || []).map((a) => a.mySubmission).filter(Boolean);
    const item = mySubs.find((s) => String(s.id) === String(subId));
    if (item) openSubmissionDetailModal(item);
  }
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 980) sidebar.classList.toggle('open');
  else sidebar.classList.toggle('collapsed');
});

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

const pruneEmptyInviteBatches = () => {
  createdInviteBatches = createdInviteBatches.filter((batch) => batch.invites.length);
};

const getActiveCreatedInvites = () => createdInviteBatches.flatMap((batch) => batch.invites).filter((invite) => !invite.deleted);

const saveCreatedInvites = () => {
  try {
    localStorage.setItem(ADMIN_INVITE_STORAGE_KEY, JSON.stringify(createdInviteBatches));
  } catch (_error) {
    // Local persistence is best-effort; the server still owns validity.
  }
};

const restoreCreatedInvites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_INVITE_STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return;
    createdInviteBatches = stored.map((batch, batchIndex) => ({
      id: String(batch.id || `restored-${batchIndex}`),
      createdAt: String(batch.createdAt || '本地记录'),
      invites: (Array.isArray(batch.invites) ? batch.invites : [])
        .map((invite) => ({
          ...invite,
          code: String(invite.code || ''),
          deleted: Boolean(invite.deleted),
          live: invite.live !== false && !invite.deleted,
          reason: invite.reason || (invite.deleted ? '已删除' : ''),
        }))
        .filter((invite) => invite.code),
    })).filter((batch) => batch.invites.length);
  } catch (_error) {
    createdInviteBatches = [];
  }
};

const getInviteLabel = (invite) => {
  if (invite.deleted) return '已删除';
  if (invite.live === false) return invite.reason || '不可用';
  return invite.reason || '可用';
};

const renderCreatedInvites = (newInvites = []) => {
  if (!adminInviteResult) return;
  if (newInvites.length) {
    createdInviteBatches.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toLocaleString('zh-CN'),
      invites: newInvites.map((invite) => ({ ...invite, deleted: false, live: true, reason: '可用' })),
    });
    saveCreatedInvites();
  }

  if (!createdInviteBatches.length) {
    adminInviteResult.hidden = true;
    adminInviteResult.innerHTML = '';
    return;
  }

  const activeInvites = getActiveCreatedInvites().filter((invite) => invite.live !== false);
  adminInviteResult.hidden = false;
  adminInviteResult.innerHTML = `
    <div class="admin-invite-result-head">
      <strong>已保留 ${activeInvites.length} 个可用邀请码</strong>
      <button type="button" class="ghost-btn admin-invite-export" data-admin-invite-export ${activeInvites.length ? '' : 'disabled'}>导出 txt</button>
    </div>
    <div class="admin-invite-code-list">
      ${createdInviteBatches.map((batch, batchIndex) => `
        <section class="admin-invite-batch">
          <div class="admin-invite-batch-title">第 ${createdInviteBatches.length - batchIndex} 轮 · ${escapeHtml(batch.createdAt)} · ${batch.invites.filter((invite) => !invite.deleted && invite.live !== false).length}/${batch.invites.length} 可用</div>
          ${batch.invites.map((invite, inviteIndex) => {
            const code = String(invite.code || '');
            return `
              <div class="admin-invite-code-item ${invite.deleted || invite.live === false ? 'is-deleted' : ''}">
                <code>${escapeHtml(code)}</code>
                <span>${escapeHtml(getInviteLabel(invite))}</span>
                <button type="button" data-admin-invite-delete data-batch-id="${escapeHtml(batch.id)}" data-invite-index="${inviteIndex}">${invite.deleted || invite.live === false ? '移除记录' : '删除'}</button>
              </div>
            `;
          }).join('')}
        </section>
      `).join('')}
    </div>
  `;
};

const downloadCreatedInvites = () => {
  const codes = getActiveCreatedInvites().filter((invite) => invite.live !== false).map((invite) => String(invite.code || '')).filter(Boolean);
  if (!codes.length) {
    showToast('暂无可导出的邀请码');
    return;
  }
  const label = (adminInviteLabel?.value || 'invite-codes').trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 40) || 'invite-codes';
  const createdAt = new Date().toISOString().slice(0, 10);
  const blob = new Blob([`${codes.join('\n')}\n`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${label}-${createdAt}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('邀请码 txt 已导出');
};

const deleteCreatedInvite = async (button) => {
  const batch = createdInviteBatches.find((item) => item.id === button.dataset.batchId);
  const inviteIndex = Number(button.dataset.inviteIndex);
  const invite = batch?.invites[inviteIndex];
  if (!batch || !invite) return;

  if (invite.deleted || invite.live === false) {
    batch.invites.splice(inviteIndex, 1);
    pruneEmptyInviteBatches();
    saveCreatedInvites();
    renderCreatedInvites();
    showToast('邀请码记录已移除');
    return;
  }

  button.disabled = true;
  try {
    await apiRequest('/api/auth/admin/invites', {
      method: 'DELETE',
      body: JSON.stringify({ code: invite.code }),
    });
    invite.deleted = true;
    invite.live = false;
    invite.reason = '已删除';
    saveCreatedInvites();
    renderCreatedInvites();
    showToast('邀请码已删除，无法继续使用');
  } catch (error) {
    button.disabled = false;
    showToast(error.message || '邀请码删除失败');
  }
};

const checkCreatedInvitesLiveStatus = async ({ silent = true } = {}) => {
  if (currentUser?.role !== 'admin') return;
  if (!createdInviteBatches.length) restoreCreatedInvites();
  if (!createdInviteBatches.length) {
    renderCreatedInvites();
    inviteLiveChecked = true;
    return;
  }

  renderCreatedInvites();
  const codes = [...new Set(createdInviteBatches.flatMap((batch) => batch.invites.map((invite) => invite.code)).filter(Boolean))];
  if (!codes.length) return;

  try {
    const { statuses = [] } = await apiRequest('/api/auth/admin/invites/live-status', {
      method: 'POST',
      body: JSON.stringify({ codes }),
    });
    const statusMap = new Map(statuses.map((status) => [String(status.code || '').toUpperCase(), status]));
    createdInviteBatches.forEach((batch) => {
      batch.invites.forEach((invite) => {
        const status = statusMap.get(String(invite.code || '').trim().replace(/\s+/g, '').toUpperCase());
        if (!status) return;
        invite.live = Boolean(status.live);
        invite.deleted = status.status === 'disabled' || status.reason === '已删除';
        invite.reason = status.reason || (status.live ? '可用' : '不可用');
        invite.usedCount = status.usedCount;
        invite.maxUses = status.maxUses;
        invite.expiresAt = status.expiresAt;
      });
    });
    inviteLiveChecked = true;
    saveCreatedInvites();
    renderCreatedInvites();
    if (!silent) showToast('邀请码测活完成');
  } catch (error) {
    if (!silent) showToast(error.message || '邀请码测活失败');
  }
};

adminInviteResult?.addEventListener('click', (event) => {
  if (event.target.closest('[data-admin-invite-export]')) {
    downloadCreatedInvites();
    return;
  }
  const deleteButton = event.target.closest('[data-admin-invite-delete]');
  if (deleteButton) {
    deleteCreatedInvite(deleteButton);
  }
});

if (adminInviteForm) {
  adminInviteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (currentUser?.role !== 'admin') {
      showToast('当前账号没有管理员权限');
      return;
    }
    const count = Number(adminInviteCount.value || 1);
    const maxUses = Number(adminInviteMaxUses.value || 1);
    const expiresInDays = Number(adminInviteDays.value || 0);
    if (count < 1 || count > 100) {
      showToast('邀请码数量需在 1-100 之间');
      return;
    }
    if (maxUses < 1 || maxUses > 1000) {
      showToast('每码使用次数需在 1-1000 之间');
      return;
    }
    const submitBtn = adminInviteForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const { invites = [] } = await apiRequest('/api/auth/admin/invites', {
        method: 'POST',
        body: JSON.stringify({
          count,
          maxUses,
          expiresInDays,
          label: adminInviteLabel.value.trim(),
        }),
      });
      renderCreatedInvites(invites);
      showToast(`已创建 ${invites.length} 个邀请码`);
    } catch (error) {
      showToast(error.message || '邀请码创建失败');
    } finally {
      submitBtn.disabled = false;
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

if (adminFeedbackBody) {
  adminFeedbackBody.addEventListener('click', async (event) => {
    const statusButton = event.target.closest('[data-feedback-status-id]');
    if (!statusButton) return;
    statusButton.disabled = true;
    try {
      const { feedback } = await apiRequest(`/api/feedback/admin/${encodeURIComponent(statusButton.dataset.feedbackStatusId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusButton.dataset.status }),
      });
      const index = adminFeedback.findIndex((item) => String(item.id) === String(feedback.id));
      if (index >= 0) adminFeedback.splice(index, 1, feedback);
      else adminFeedback.unshift(feedback);
      renderAdminFeedback();
      showToast('反馈状态已更新');
    } catch (error) {
      showToast(error.message || '反馈状态更新失败');
    } finally {
      statusButton.disabled = false;
    }
  });
}

adminFeedbackStatusFilter?.addEventListener('change', () => loadAdminFeedback({ silent: false }));
adminFeedbackRefresh?.addEventListener('click', () => loadAdminFeedback({ silent: false }));

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
      saveAdminActionState();
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
      const actionKey = getActionKey(report.id, actionItem.id);
      if (nextStatus === 'resolved') {
        retainedResolvedActionItems.add(actionKey);
        clearedActionItems.delete(actionKey);
        clearSiblingActionItemsForPosts(report.id, actionItem);
      } else {
        retainedResolvedActionItems.delete(actionKey);
      }
      saveAdminActionState();
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
    saveAdminActionState();
    const report = adminReports.find((reportItem) => String(reportItem.id) === String(item.dataset.reportId)) || adminReports[0];
    renderAdminActionItems(report);
    renderArchivedActionItems();
    showToast('已恢复建议处理项');
  });
}

adminArchivedOpenBtn?.addEventListener('click', openArchivedPanel);
adminArchivedCloseBtn?.addEventListener('click', closeArchivedPanel);

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

const feedbackModal = document.getElementById('feedbackModal');
const feedbackClose = document.getElementById('feedbackClose');
const feedbackCancel = document.getElementById('feedbackCancel');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackTypeInput = document.getElementById('feedbackTypeInput');
const feedbackContentInput = document.getElementById('feedbackContentInput');
const feedbackContactInput = document.getElementById('feedbackContactInput');

const openFeedback = () => {
  feedbackForm.reset();
  feedbackModal.hidden = false;
  setTimeout(() => feedbackContentInput.focus(), 60);
};

const closeFeedback = () => {
  feedbackModal.hidden = true;
  feedbackForm.reset();
};

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

feedbackEntry?.addEventListener('click', (event) => {
  event.preventDefault();
  openFeedback();
});
feedbackClose?.addEventListener('click', closeFeedback);
feedbackCancel?.addEventListener('click', closeFeedback);
feedbackModal?.addEventListener('click', (event) => { if (event.target === feedbackModal) closeFeedback(); });
feedbackForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = feedbackContentInput.value.trim();
  if (!content) {
    showToast('请先输入你遇到的问题');
    feedbackContentInput.focus();
    return;
  }
  const submitBtn = feedbackForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';
  try {
    await apiRequest('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        type: feedbackTypeInput.value,
        content,
        contact: feedbackContactInput.value.trim(),
        pageUrl: window.location.href,
      }),
    });
    closeFeedback();
    if (currentUser?.role === 'admin') await loadAdminFeedback({ silent: true });
    showToast('问题反馈已提交，管理员会尽快查看');
  } catch (error) {
    showToast(error.message || '反馈提交失败');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

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
  commentList.innerHTML = comments.map((comment, index) => {
    const canDelete = Boolean(currentUser && (currentUser.role === 'admin' || comment.mine || String(comment.author?.id) === String(currentUser.id)));
    const canLike = Boolean(currentUser && currentUser.role !== 'admin' && !canDelete);
    const authorName = comment.author?.name || '同学';
    const authorAvatar = renderAvatar({
      className: 'comment-avatar',
      initial: comment.author?.initial || authorName.slice(0, 1).toUpperCase(),
      name: authorName,
      avatarUrl: comment.author?.avatarUrl,
      color: colors[index % colors.length],
    });
    const actionHtml = canDelete
      ? `<button type="button" class="comment-action-btn" data-comment-delete-id="${escapeHtml(comment.id)}">删除</button>`
      : `<button type="button" class="comment-action-btn ${comment.liked ? 'liked' : ''}" data-comment-like-id="${escapeHtml(comment.id)}" ${canLike ? '' : 'disabled'}>${comment.liked ? '已点赞' : '点赞'} ${Number(comment.likeCount || 0)}</button>`;
    return `
    <article class="comment-item" data-comment-id="${escapeHtml(comment.id)}">
      <div class="comment-meta">
        <div>
          ${authorAvatar}
          <strong>${escapeHtml(authorName)}</strong>
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
  const detailAuthorName = latestTopic.authorName || latestTopic.posters[0] || '匿名';
  const detailAuthorAvatar = renderAvatar({
    className: 'detail-author-avatar',
    initial: latestTopic.posters[0] || '?',
    name: detailAuthorName,
    avatarUrl: latestTopic.authorAvatarUrl,
    color: colors[0],
  });
  detailTitle.textContent = latestTopic.title;
  detailTags.innerHTML = latestTopic.tags.map((tag) => `<span class="tag ${tagClass(tag)}">${escapeHtml(tag)}</span>`).join('');
  detailMeta.innerHTML = `
    <span>板块：${escapeHtml(latestTopic.category)}</span>
    <span>评论：${Number(latestTopic.replies || 0)}</span>
    <span>浏览：${Number(latestTopic.views || 0)}</span>
    <span>收藏：${Number(latestTopic.favoriteCount || 0)}</span>
    <span>时间：${escapeHtml(latestTopic.activity)}</span>
    <span class="detail-author">发布人：${detailAuthorAvatar}${escapeHtml(detailAuthorName)}</span>
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
        author: {
          id: currentUser.id,
          name: currentUser.nickname || currentUser.email?.split('@')[0] || '我',
          initial: (currentUser.nickname || currentUser.email?.split('@')[0] || '我').slice(0, 1).toUpperCase(),
          qq: currentUser.qq || '',
        },
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
  closeArchivedPanel();
  document.querySelectorAll('.admin-workbench article.is-expanded, .admin-manage.is-expanded').forEach((card) => {
    card.classList.remove('is-expanded');
    const button = card.querySelector('[data-expand-card]');
    if (button) button.textContent = '＋';
  });
  if (!rulesModal.hidden) closeRules();
  if (!feedbackModal.hidden) closeFeedback();
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
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const registerForm = document.getElementById('registerForm');
const registerEmail = document.getElementById('registerEmail');
const registerInviteCode = document.getElementById('registerInviteCode');
const registerCode = document.getElementById('registerCode');
const sendRegisterCodeBtn = document.getElementById('sendRegisterCodeBtn');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const resetPasswordModal = document.getElementById('resetPasswordModal');
const resetPasswordClose = document.getElementById('resetPasswordClose');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetEmail = document.getElementById('resetEmail');
const resetCode = document.getElementById('resetCode');
const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
const resetPassword = document.getElementById('resetPassword');
const resetConfirmPassword = document.getElementById('resetConfirmPassword');
const backToLoginFromResetBtn = document.getElementById('backToLoginFromResetBtn');
const profileModal = document.getElementById('profileModal');
const profileClose = document.getElementById('profileClose');
const profileCancel = document.getElementById('profileCancel');
const profileForm = document.getElementById('profileForm');
const profileEmail = document.getElementById('profileEmail');
const profileNickname = document.getElementById('profileNickname');
const profileQq = document.getElementById('profileQq');
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
  profileQq.classList.remove('invalid');
};

const openProfile = () => {
  if (!currentUser) {
    openLogin();
    return;
  }
  profileEmail.value = currentUser.email || '';
  profileNickname.value = currentUser.nickname || currentUser.email.split('@')[0];
  profileQq.value = currentUser.qq || '';
  profileEmail.classList.remove('invalid');
  profileNickname.classList.remove('invalid');
  profileQq.classList.remove('invalid');
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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const startCodeCountdown = (button, seconds = 60, restoreText = '发送验证码') => {
  let remaining = seconds;
  button.disabled = true;
  button.textContent = `${remaining}s`;
  const timer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timer);
      button.disabled = false;
      button.textContent = restoreText;
      return;
    }
    button.textContent = `${remaining}s`;
  }, 1000);
};

const sendEmailCode = async ({ emailInput, purpose, button, extraBody = {}, extraInputs = [] }) => {
  const email = emailInput.value.trim();
  [emailInput, ...extraInputs].forEach((input) => input.classList.remove('invalid'));
  if (!isValidEmail(email)) {
    emailInput.classList.add('invalid');
    showToast('请输入有效邮箱');
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = '发送中...';
  try {
    await apiRequest('/api/auth/email-code', {
      method: 'POST',
      body: JSON.stringify({ email, purpose, ...extraBody }),
    });
    showToast('验证码已发送，请查看邮箱');
    startCodeCountdown(button, 60, originalText);
  } catch (error) {
    button.disabled = false;
    button.textContent = originalText;
    emailInput.classList.add('invalid');
    extraInputs.forEach((input) => input.classList.add('invalid'));
    showToast(error.message);
  }
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
  userMenu.classList.remove('open');
  loginBtn.setAttribute('aria-expanded', 'false');
  openProfile();
});
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
profileQq.addEventListener('input', () => profileQq.classList.remove('invalid'));
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
  [registerEmail, registerInviteCode, registerCode, registerPassword, registerConfirmPassword].forEach((input) => input.classList.remove('invalid'));
  registerModal.hidden = false;
  setTimeout(() => registerEmail.focus(), 60);
};

const closeRegister = () => {
  registerModal.hidden = true;
  registerForm.reset();
  [registerEmail, registerInviteCode, registerCode, registerPassword, registerConfirmPassword].forEach((input) => input.classList.remove('invalid'));
};

const openResetPassword = () => {
  loginModal.hidden = true;
  resetPasswordForm.reset();
  [resetEmail, resetCode, resetPassword, resetConfirmPassword].forEach((input) => input.classList.remove('invalid'));
  resetPasswordModal.hidden = false;
  setTimeout(() => resetEmail.focus(), 60);
};

const closeResetPassword = () => {
  resetPasswordModal.hidden = true;
  resetPasswordForm.reset();
  [resetEmail, resetCode, resetPassword, resetConfirmPassword].forEach((input) => input.classList.remove('invalid'));
};

const backToLogin = () => {
  closeRegister();
  closeResetPassword();
  loginModal.hidden = false;
  setTimeout(() => loginEmail.focus(), 60);
};

showRegisterBtn.addEventListener('click', openRegister);
forgotPasswordBtn.addEventListener('click', openResetPassword);
registerClose.addEventListener('click', closeRegister);
registerModal.addEventListener('click', (event) => {
  if (event.target === registerModal) closeRegister();
});
backToLoginBtn.addEventListener('click', backToLogin);
resetPasswordClose.addEventListener('click', closeResetPassword);
resetPasswordModal.addEventListener('click', (event) => {
  if (event.target === resetPasswordModal) closeResetPassword();
});
backToLoginFromResetBtn.addEventListener('click', backToLogin);
sendRegisterCodeBtn.addEventListener('click', () => sendEmailCode({
  emailInput: registerEmail,
  purpose: 'register',
  button: sendRegisterCodeBtn,
  extraBody: { inviteCode: registerInviteCode.value.trim() },
  extraInputs: [registerInviteCode],
}));
sendResetCodeBtn.addEventListener('click', () => sendEmailCode({
  emailInput: resetEmail,
  purpose: 'reset_password',
  button: sendResetCodeBtn,
}));
[registerEmail, registerInviteCode, registerCode, registerPassword, registerConfirmPassword].forEach((input) => {
  input.addEventListener('input', () => input.classList.remove('invalid'));
});
[resetEmail, resetCode, resetPassword, resetConfirmPassword].forEach((input) => {
  input.addEventListener('input', () => input.classList.remove('invalid'));
});
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  [registerEmail, registerInviteCode, registerCode, registerPassword, registerConfirmPassword].forEach((input) => input.classList.remove('invalid'));
  const email = registerEmail.value.trim();
  const inviteCodeValue = registerInviteCode.value.trim();
  const code = registerCode.value.trim();
  const password = registerPassword.value.trim();
  const confirmPassword = registerConfirmPassword.value.trim();
  if (!isValidEmail(email)) {
    registerEmail.classList.add('invalid');
    showToast('请输入有效注册邮箱');
    return;
  }
  if (!inviteCodeValue) {
    registerInviteCode.classList.add('invalid');
    showToast('请先输入邀请码');
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    registerCode.classList.add('invalid');
    showToast('请输入 6 位邮箱验证码');
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
      body: JSON.stringify({ email, password, code, inviteCode: inviteCodeValue }),
    });
    closeRegister();
    loginModal.hidden = false;
    loginEmail.value = email;
    setTimeout(() => loginPassword.focus(), 60);
    showToast('注册成功，请登录');
  } catch (error) {
    registerInviteCode.classList.add('invalid');
    registerCode.classList.add('invalid');
    showToast(error.message);
  }
});

resetPasswordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  [resetEmail, resetCode, resetPassword, resetConfirmPassword].forEach((input) => input.classList.remove('invalid'));
  const email = resetEmail.value.trim();
  const code = resetCode.value.trim();
  const newPasswordValue = resetPassword.value.trim();
  const confirmPasswordValue = resetConfirmPassword.value.trim();

  if (!isValidEmail(email)) {
    resetEmail.classList.add('invalid');
    showToast('请输入有效邮箱');
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    resetCode.classList.add('invalid');
    showToast('请输入 6 位邮箱验证码');
    return;
  }
  if (newPasswordValue.length < 6) {
    resetPassword.classList.add('invalid');
    showToast('新密码至少需要 6 位');
    return;
  }
  if (newPasswordValue !== confirmPasswordValue) {
    resetPassword.classList.add('invalid');
    resetConfirmPassword.classList.add('invalid');
    showToast('两次输入的新密码不一致');
    return;
  }

  const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '重置中...';
  try {
    await apiRequest('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword: newPasswordValue }),
    });
    closeResetPassword();
    loginModal.hidden = false;
    loginEmail.value = email;
    loginPassword.value = '';
    setTimeout(() => loginPassword.focus(), 60);
    showToast('密码已重置，请使用新密码登录');
  } catch (error) {
    resetCode.classList.add('invalid');
    showToast(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});
profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = profileEmail.value.trim();
  const nickname = profileNickname.value.trim();
  const qq = profileQq.value.trim();
  profileEmail.classList.remove('invalid');
  profileNickname.classList.remove('invalid');
  profileQq.classList.remove('invalid');

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
  if (qq && !/^\d{5,12}$/.test(qq)) {
    profileQq.classList.add('invalid');
    showToast('请输入 5-12 位数字 QQ 号');
    return;
  }

  const submitBtn = profileForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '保存中...';
  try {
    const { user } = await apiRequest('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ email, nickname, qq }),
    });
    updateAuthUI(user);
    await loadPersistedTopics();
    closeProfile();
    showToast('个人信息已更新');
  } catch (error) {
    profileEmail.classList.add('invalid');
    profileQq.classList.add('invalid');
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
    markLoginError('请填写邮箱或学号和密码');
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
    if (user?.role === 'admin') await checkCreatedInvitesLiveStatus({ silent: true });
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
  initAdminReportDates();
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
  if (!resetPasswordModal.hidden) closeResetPassword();
  if (!profileModal.hidden) closeProfile();
  if (!securityModal.hidden) closeSecurity();
  if (!announcementModal.hidden) closeAnnouncements();
  if (!announcementEditorModal.hidden) closeAnnouncementEditor();
});

// ==========================================
// Follow-Up Reminder (跟随催交) Frontend Logic
// ==========================================
let currentReminderAssignment = null;
let currentReminderPendingList = [];

const reminderModal = document.getElementById('reminderModal');
const reminderModalClose = document.getElementById('reminderModalClose');
const reminderCancelBtn = document.getElementById('reminderCancelBtn');
const reminderSendBtn = document.getElementById('reminderSendBtn');
const reminderSelectAllBtn = document.getElementById('reminderSelectAllBtn');
const reminderDeselectAllBtn = document.getElementById('reminderDeselectAllBtn');
const reminderStudentChecklist = document.getElementById('reminderStudentChecklist');
const reminderMessageInput = document.getElementById('reminderMessageInput');
const reminderAssignmentTitle = document.getElementById('reminderAssignmentTitle');
const reminderAssignmentScopeBadge = document.getElementById('reminderAssignmentScopeBadge');
const reminderAssignmentDueAt = document.getElementById('reminderAssignmentDueAt');
const reminderPendingCountDisplay = document.getElementById('reminderPendingCountDisplay');
const reminderSelectedCount = document.getElementById('reminderSelectedCount');
const reminderTotalPendingCount = document.getElementById('reminderTotalPendingCount');

const closeReminderModal = () => {
  if (reminderModal) reminderModal.hidden = true;
  currentReminderAssignment = null;
  currentReminderPendingList = [];
};

const updateReminderSelectedCount = () => {
  if (!reminderStudentChecklist || !reminderSelectedCount) return;
  const checked = reminderStudentChecklist.querySelectorAll('input[type="checkbox"]:checked');
  reminderSelectedCount.textContent = checked.length;
};

const openReminderModalForAssignment = async (assignmentId, preselectedStudentNo = null) => {
  if (!reminderModal) return;
  try {
    const { assignment, students } = await apiRequest(`/api/class/assignments/${assignmentId}/pending-students`);
    currentReminderAssignment = assignment;
    const pendingStudents = (students || []).filter((s) => !s.submitted);
    currentReminderPendingList = pendingStudents;

    if (reminderAssignmentTitle) reminderAssignmentTitle.textContent = assignment.title;
    if (reminderAssignmentDueAt) reminderAssignmentDueAt.textContent = formatClassTime(assignment.dueAt);
    if (reminderPendingCountDisplay) reminderPendingCountDisplay.textContent = pendingStudents.length;
    if (reminderTotalPendingCount) reminderTotalPendingCount.textContent = pendingStudents.length;

    if (reminderAssignmentScopeBadge) {
      if (assignment.classId) {
        reminderAssignmentScopeBadge.hidden = false;
        reminderAssignmentScopeBadge.textContent = assignment.className || (Number(assignment.classId) === 1 ? '数经1班' : '数经2班');
        reminderAssignmentScopeBadge.className = `class-scope-badge badge-class${assignment.classId}`;
      } else {
        reminderAssignmentScopeBadge.hidden = true;
      }
    }

    if (reminderMessageInput) {
      reminderMessageInput.value = `【${assignment.title}】截稿在即，任课教师提醒您及时在系统提交作业。`;
    }

    if (reminderStudentChecklist) {
      if (!pendingStudents.length) {
        reminderStudentChecklist.innerHTML = '<div style="padding:16px;text-align:center;color:var(--muted);font-size:13px;">🎉 太棒了，本班所有学生均已完成作业提交！</div>';
      } else {
        reminderStudentChecklist.innerHTML = pendingStudents.map((s) => {
          const isChecked = preselectedStudentNo ? s.studentNo === preselectedStudentNo : true;
          const hasReminded = Boolean(s.reminder);
          return `
            <div class="reminder-student-item">
              <label>
                <input type="checkbox" value="${escapeHtml(s.rosterId)}" data-student-no="${escapeHtml(s.studentNo)}" ${isChecked ? 'checked' : ''}>
                <strong>${escapeHtml(s.name)}</strong>
                <span class="reminder-student-meta-info">
                  <span>${escapeHtml(s.studentNo)}</span>
                  <span>·</span>
                  <span>${escapeHtml(s.className || '数经班')}</span>
                  ${s.originProvince ? `<span>· ${escapeHtml(s.originProvince)}</span>` : ''}
                </span>
              </label>
              <div>
                ${hasReminded
                  ? `<span class="reminder-status-pill reminded" title="最近一次催交：${escapeHtml(s.reminder.remindedAt)}">已于 ${escapeHtml(formatClassTime(s.reminder.remindedAt))} 催交</span>`
                  : '<span class="reminder-status-pill fresh">尚未催交</span>'}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    updateReminderSelectedCount();
    reminderModal.hidden = false;
  } catch (error) {
    showToast(error.message || '获取未交名单失败');
  }
};

if (reminderModalClose) reminderModalClose.addEventListener('click', closeReminderModal);
if (reminderCancelBtn) reminderCancelBtn.addEventListener('click', closeReminderModal);
if (reminderModal) {
  reminderModal.addEventListener('click', (e) => {
    if (e.target === reminderModal) closeReminderModal();
  });
}

if (reminderSelectAllBtn && reminderStudentChecklist) {
  reminderSelectAllBtn.addEventListener('click', () => {
    reminderStudentChecklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = true;
    });
    updateReminderSelectedCount();
  });
}

if (reminderDeselectAllBtn && reminderStudentChecklist) {
  reminderDeselectAllBtn.addEventListener('click', () => {
    reminderStudentChecklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.checked = false;
    });
    updateReminderSelectedCount();
  });
}

if (reminderStudentChecklist) {
  reminderStudentChecklist.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      updateReminderSelectedCount();
    }
  });
}

if (reminderSendBtn) {
  reminderSendBtn.addEventListener('click', async () => {
    if (!currentReminderAssignment) return;
    const checkedBoxes = reminderStudentChecklist ? Array.from(reminderStudentChecklist.querySelectorAll('input[type="checkbox"]:checked')) : [];
    if (!checkedBoxes.length) {
      showToast('请至少勾选一位未交作业的学生');
      return;
    }
    const rosterIds = checkedBoxes.map((cb) => cb.value);
    const message = reminderMessageInput ? reminderMessageInput.value.trim() : '';

    reminderSendBtn.disabled = true;
    reminderSendBtn.textContent = '正在发送催交通知...';
    try {
      const result = await apiRequest(`/api/class/assignments/${currentReminderAssignment.id}/remind`, {
        method: 'POST',
        body: JSON.stringify({
          rosterIds,
          message,
        }),
      });
      showToast(`成功向 ${result.count} 位未交学生发送跟随催交通知！`);
      closeReminderModal();
      await loadClassOverview({ silent: true });
    } catch (error) {
      showToast(error.message || '发送催交失败');
    } finally {
      reminderSendBtn.disabled = false;
      reminderSendBtn.textContent = '🚀 确认发送催交通知';
    }
  });
}

// Event Delegation for Teacher Assignment Remind Button & Risk List Remind Button
document.addEventListener('click', async (e) => {
  const remindAssignmentBtn = e.target.closest('[data-class-remind-assignment]');
  if (remindAssignmentBtn) {
    const assignmentId = remindAssignmentBtn.dataset.classRemindAssignment;
    await openReminderModalForAssignment(assignmentId);
    return;
  }

  const riskRemindBtn = e.target.closest('[data-risk-remind-student]');
  if (riskRemindBtn) {
    const studentNo = riskRemindBtn.dataset.riskRemindStudent;
    const assignments = (classOverview.assignments || []).filter((a) => a.status === 'open');
    if (!assignments.length) {
      showToast('当前没有正在开放收取的作业');
      return;
    }
    const targetAssignment = assignments[0];
    await openReminderModalForAssignment(targetAssignment.id, studentNo);
    return;
  }

  const jumpToAssignmentBtn = e.target.closest('[data-jump-to-assignment]');
  if (jumpToAssignmentBtn) {
    const assignmentId = jumpToAssignmentBtn.dataset.jumpToAssignment;
    const card = document.getElementById(`student-assignment-item-${assignmentId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      card.style.boxShadow = '0 0 0 3px rgba(47, 111, 237, 0.4)';
      card.style.borderColor = 'var(--blue)';
      setTimeout(() => {
        card.style.boxShadow = '';
        card.style.borderColor = '';
      }, 2500);
    }
    return;
  }
});
