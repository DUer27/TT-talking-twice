const topics = [
  { pinned: true, title: '关于校园吐槽社区试运行与文明发言说明', tags: ['公告', '社区规则'], category: '公告', replies: 18, views: 1260, activity: '置顶', posters: ['校', '师', 'AI'], hot: true, mine: false, resolved: true, unread: false, favorite: false, liked: false },
  { title: '高数早八课程连续三周调课，希望能提前通知', tags: ['课程吐槽', '待回应', '匿名'], category: '课程吐槽', replies: 24, views: 438, activity: '5分钟前', posters: ['匿', '陈', '王'], hot: false, mine: true, resolved: false, unread: true, favorite: false, liked: false },
  { title: '食堂二楼晚饭排队太久，热门窗口能不能多开一个', tags: ['食堂吐槽', '高频问题'], category: '食堂吐槽', replies: 46, views: 982, activity: '12分钟前', posters: ['李', '匿', '周'], hot: true, mine: false, resolved: false, unread: true, favorite: false, liked: false },
  { title: '宿舍热水晚上十点后不稳定，最近很多人遇到', tags: ['宿舍生活', '急需处理'], category: '宿舍生活', replies: 37, views: 756, activity: '21分钟前', posters: ['匿', '赵', '孙'], hot: true, mine: true, resolved: false, unread: true, favorite: false, liked: false },
  { title: '图书馆自习区插座数量不够，考试周特别明显', tags: ['校园设施', '建议类'], category: '校园设施', replies: 19, views: 502, activity: '34分钟前', posters: ['刘', '匿'], hot: false, mine: false, resolved: false, unread: false, favorite: false, liked: false },
  { title: '希望社团活动通知能集中展示，不要分散在多个群里', tags: ['活动社团', '建议类'], category: '活动社团', replies: 12, views: 241, activity: '1小时前', posters: ['吴', '郑'], hot: false, mine: false, resolved: false, unread: false, favorite: false, liked: false },
  { title: '操场夜间照明有几盏灯坏了，跑步区域比较暗', tags: ['校园设施', '已处理'], category: '校园设施', replies: 8, views: 198, activity: '2小时前', posters: ['匿', '何'], hot: false, mine: true, resolved: true, unread: false, favorite: false, liked: false },
  { title: '部分公共课作业截止时间集中，希望老师之间能协调一下', tags: ['课程吐槽', '情绪较强'], category: '课程吐槽', replies: 53, views: 1118, activity: '3小时前', posters: ['匿', '马', '许'], hot: true, mine: false, resolved: false, unread: true, favorite: false, liked: false },
  { title: '北门快递点雨天排队区域没有遮挡，取件不太方便', tags: ['生活吐槽', '建议类'], category: '宿舍生活', replies: 15, views: 326, activity: '昨天', posters: ['黄', '匿'], hot: false, mine: false, resolved: false, unread: false, favorite: false, liked: false },
];

const ensureTopicIds = () => {
  topics.forEach((topic, index) => {
    if (!topic.id) topic.id = `topic-${Date.now()}-${index}`;
    if (typeof topic.likeCount !== 'number') topic.likeCount = Math.max(3, Math.round(topic.views / 18) + topic.replies);
    if (!topic.content) {
      topic.content = `这是关于“${topic.title}”的详细吐槽内容。\n\n目前这个帖子详情为前端演示数据，后续接入后端后会展示学生发布的完整正文、评论、处理状态和管理员处理意见。`;
    }
  });
};
ensureTopicIds();

const tagClass = (tag) => {
  if (tag.includes('课程') || tag.includes('公告')) return 'blue';
  if (tag.includes('食堂') || tag.includes('高频')) return 'orange';
  if (tag.includes('宿舍') || tag.includes('急需') || tag.includes('情绪')) return 'red';
  if (tag.includes('设施') || tag.includes('已')) return 'green';
  if (tag.includes('活动')) return 'purple';
  return '';
};

const colors = ['#2563eb', '#f97316', '#7c3aed', '#16a34a', '#dc2626', '#0891b2', '#475569'];
const topicBody = document.getElementById('topicBody');
const listHint = document.getElementById('listHint');
const topicPanel = document.getElementById('topicPanel');
const adminPanel = document.getElementById('adminPanel');
const sidebarLinks = document.querySelectorAll('.sidebar-link[data-filter]');
const navLinks = document.querySelectorAll('.nav-pills [data-nav-filter]');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');
const categoryChip = document.getElementById('categoryChip');
const tagChip = document.getElementById('tagChip');
const weekActiveChip = document.getElementById('weekActiveChip');
const categoryMenu = document.getElementById('categoryMenu');
const tagMenu = document.getElementById('tagMenu');
const brandHome = document.getElementById('brandHome');
const generateReportBtn = document.getElementById('generateReportBtn');
const loginBtn = document.getElementById('loginBtn');
const userMenuWrap = document.getElementById('userMenuWrap');
const userMenu = document.getElementById('userMenu');
const userMenuAvatar = document.getElementById('userMenuAvatar');
const avatarFileInput = document.getElementById('avatarFileInput');
const userMenuName = document.getElementById('userMenuName');
const userMenuEmail = document.getElementById('userMenuEmail');
const createPostBtn = document.getElementById('createPostBtn');
const complaintTrendChart = document.getElementById('complaintTrendChart');
const categoryBarChart = document.getElementById('categoryBarChart');
const hotCategoryName = document.getElementById('hotCategoryName');
const hotCategorySummary = document.getElementById('hotCategorySummary');
const hotCategoryButtons = document.querySelectorAll('.hot-breakdown [data-category-key]');

const categoryTrendMap = {
  食堂吐槽: {
    keyword: '排队',
    mentions: 42,
    labels: ['排队', '价格', '窗口', '菜品', '晚饭', '早餐', '拥挤', '卫生', '支付', '座位', '口味', '份量'],
    points: [42, 36, 31, 27, 24, 18, 16, 14, 12, 11, 9, 8],
  },
  宿舍生活: {
    keyword: '热水',
    mentions: 34,
    labels: ['热水', '空调', '网络', '门禁', '噪音', '洗衣机', '维修', '卫生', '插座', '电费', '楼管', '晾晒'],
    points: [34, 29, 25, 21, 19, 16, 15, 13, 12, 10, 8, 7],
  },
  课程吐槽: {
    keyword: '调课',
    mentions: 27,
    labels: ['调课', '作业', '早八', '考试', '签到', '实验', '课件', '进度', '答疑', '分组', '成绩', '选课'],
    points: [27, 25, 22, 20, 17, 15, 14, 12, 11, 9, 8, 7],
  },
  校园设施: {
    keyword: '插座',
    mentions: 21,
    labels: ['插座', '照明', '空调', '自习室', '电梯', '快递点', '座椅', '网络', '维修', '饮水机', '路灯', '门禁'],
    points: [21, 19, 18, 16, 14, 13, 11, 10, 9, 8, 7, 6],
  },
};
const categoryStatOrder = [
  { category: '课程吐槽', label: '课程' },
  { category: '食堂吐槽', label: '食堂' },
  { category: '宿舍生活', label: '宿舍' },
  { category: '校园设施', label: '设施' },
  { category: '活动社团', label: '活动' },
];

const getCategoryStats = () => categoryStatOrder.map((item) => ({
  ...item,
  value: topics.filter((topic) => topic.category === item.category).length,
}));

let currentFilter = 'all';
let currentTitle = '最新吐槽';
let currentTopicId = null;
let currentTagKeyword = '';
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

const setAvatarPreview = (imageDataUrl, displayName = '我') => {
  const initial = (displayName || '我').trim().slice(0, 1).toUpperCase() || '我';
  if (imageDataUrl) {
    userMenuAvatar.textContent = '';
    userMenuAvatar.style.backgroundImage = `url(${JSON.stringify(imageDataUrl)})`;
    userMenuAvatar.classList.add('has-image');
    userMenuAvatar.setAttribute('aria-label', '当前头像，点击更换头像');
    return;
  }

  userMenuAvatar.style.backgroundImage = '';
  userMenuAvatar.classList.remove('has-image');
  userMenuAvatar.textContent = initial;
  userMenuAvatar.setAttribute('aria-label', '点击更换头像');
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
    reject(new Error('图片读取失败，请换一张图片试试'));
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
  if (user) {
    const displayName = user.nickname || user.email.split('@')[0];
    loginBtn.textContent = `${displayName} ▾`;
    loginBtn.classList.add('logged-in');
    loginBtn.setAttribute('aria-expanded', 'false');
    loginBtn.title = '用户中心';
    userMenu.hidden = false;
    userMenuWrap.classList.add('is-logged-in');
    userMenuAvatar.disabled = false;
    userMenuAvatar.title = '点击更换头像';
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
    setAvatarPreview('', '我');
    userMenuName.textContent = '未登录';
    userMenuEmail.textContent = '请先登录';
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

const drawTrendChart = () => {
  const canvasState = setupCanvas(complaintTrendChart);
  if (!canvasState) return;
  const trendData = categoryTrendMap[activeTrendCategory] || categoryTrendMap.食堂吐槽;
  const theme = getChartTheme();
  const animationProgress = easeOutCubic(trendAnimation.progress);
  const sourcePoints = trendAnimation.from || trendData.points;
  const targetPoints = trendAnimation.to || trendData.points;
  const trendPoints = targetPoints.map((value, index) => {
    const startValue = sourcePoints[index] ?? value;
    return startValue + (value - startValue) * animationProgress;
  });
  const trendLabels = trendData.labels;
  const { ctx, width, height } = canvasState;
  const area = { left: 48, top: 14, right: width - 18, bottom: height - 48 };
  area.width = area.right - area.left;
  area.height = area.bottom - area.top;
  const maxValue = 50;

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
  [0, 10, 20, 30, 40, 50].forEach((value) => {
    const y = area.bottom - (value / maxValue) * area.height;
    ctx.fillText(value, area.left - 8, y);
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
  ctx.fillText('出现次数', tooltipX + 10, tooltipY + 32);
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(focusValue, tooltipX + tooltipWidth - 10, tooltipY + 32);

  ctx.fillStyle = theme.line;
  ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`${activeTrendCategory} · ${trendData.keyword} ${trendData.mentions}次`, area.left, area.top + 6);

  complaintTrendChart.style.cursor = 'crosshair';
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
  const maxValue = Math.max(4, Math.ceil(Math.max(...categoryStats.map((item) => item.value), 1) / 2) * 2);

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
    ctx.fillText(item.value, x + currentBarWidth / 2, y - 6);
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

  categoryBarChart.style.cursor = activeCategoryIndex >= 0 ? 'pointer' : 'default';
};

const renderAdminCharts = () => {
  requestAnimationFrame(() => {
    drawTrendChart();
    drawCategoryBarChart();
  });
};

const animateTrendTo = (previousPoints, nextPoints) => {
  cancelAnimationFrame(trendAnimationFrame);
  trendAnimation = {
    from: previousPoints,
    to: nextPoints,
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
      trendAnimation = { from: nextPoints, to: nextPoints, progress: 1 };
      trendAnimationFrame = null;
    }
  };
  trendAnimationFrame = requestAnimationFrame(tick);
};

const updateHotCategory = (category) => {
  const trendData = categoryTrendMap[category];
  if (!trendData) return;
  const previousCategory = activeTrendCategory;
  const previousPoints = (categoryTrendMap[previousCategory] || categoryTrendMap.食堂吐槽).points;
  activeTrendCategory = category;
  activeTrendIndex = 0;
  hotCategoryButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.categoryKey === category);
  });
  if (hotCategoryName) hotCategoryName.textContent = category;
  if (hotCategorySummary) {
    hotCategorySummary.textContent = `${category}：本周提及最多的是“${trendData.keyword}”，共 ${trendData.mentions} 次。`;
  }
  if (previousCategory === category) drawTrendChart();
  else animateTrendTo(previousPoints, trendData.points);
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
  const trendPoints = (categoryTrendMap[activeTrendCategory] || categoryTrendMap.食堂吐槽).points;
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

if (complaintTrendChart) {
  complaintTrendChart.addEventListener('mousemove', updateTrendHover);
  complaintTrendChart.addEventListener('mouseleave', () => {
    activeTrendIndex = 0;
    drawTrendChart();
  });
}

if (categoryBarChart) {
  categoryBarChart.addEventListener('mousemove', updateCategoryHover);
  categoryBarChart.addEventListener('mouseleave', () => {
    activeCategoryIndex = -1;
    drawCategoryBarChart();
  });
}

hotCategoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    updateHotCategory(button.dataset.categoryKey);
  });
});

const getFilteredTopics = (filter) => {
  if (filter === 'all') return topics;
  if (filter === 'hot') return topics.filter((topic) => topic.hot);
  if (filter === 'mine') return topics.filter((topic) => topic.mine);
  if (filter === 'resolved') return topics.filter((topic) => topic.resolved);
  if (filter === 'new') return topics.filter((topic) => topic.tags.includes('新发布') || topic.activity === '刚刚');
  if (filter === 'unread') return topics.filter((topic) => topic.unread);
  if (filter === 'liked') return topics.filter((topic) => topic.liked);
  if (filter === 'favorites') return topics.filter((topic) => topic.favorite);
  return topics.filter((topic) => topic.category === filter);
};

const setActiveSidebar = (filter) => {
  sidebarLinks.forEach((item) => item.classList.toggle('active', item.dataset.filter === filter));
};

const setActiveNav = (filter) => {
  navLinks.forEach((item) => item.classList.toggle('active', item.dataset.navFilter === filter));
};

const resetChips = () => {
  categoryChip.textContent = '类别：全部 ▸';
  tagChip.textContent = '标签：全部 ▸';
  currentTagKeyword = '';
  if (typeof categoryMenu !== 'undefined') {
    categoryMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.category === '全部'));
    tagMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.tag === '全部'));
  }
};

const setAdminMode = (enabled) => {
  if (createPostBtn) createPostBtn.hidden = enabled;
};

const switchFilter = (filter, title, options = {}) => {
  currentFilter = filter;
  currentTitle = title;
  topicPanel.hidden = false;
  adminPanel.hidden = true;
  setAdminMode(false);
  if (!options.keepSearch) searchInput.value = '';
  if (!options.keepTag) currentTagKeyword = '';
  setActiveSidebar(filter);
  setActiveNav(filter);
  renderTopics(filter, title);
};

const renderTopics = (filter = currentFilter, title = currentTitle) => {
  currentFilter = filter;
  currentTitle = title;
  const query = searchInput.value.trim().toLowerCase();
  const baseData = getFilteredTopics(filter);
  const data = baseData.filter((topic) => {
    const text = [topic.title, topic.category, topic.activity, ...topic.tags, ...topic.posters].join(' ').toLowerCase();
    const matchedSearch = query ? text.includes(query) : true;
    const matchedTag = currentTagKeyword ? text.includes(currentTagKeyword.toLowerCase()) : true;
    return matchedSearch && matchedTag;
  });

  topicPanel.hidden = false;
  adminPanel.hidden = true;
  setAdminMode(false);
  const searchText = query ? `，搜索“${searchInput.value.trim()}”` : '';
  const tagText = currentTagKeyword ? `，标签“${currentTagKeyword}”` : '';
  listHint.textContent = `${title}${searchText}${tagText}：共 ${data.length} 条吐槽`;

  if (!data.length) {
    topicBody.innerHTML = `<tr><td colspan="6" class="empty-state">没有找到相关吐槽，换个栏目或关键词试试。</td></tr>`;
    return;
  }

  topicBody.innerHTML = data.map((topic, index) => `
    <tr class="topic-row">
      <td class="topic-main">
        <div class="topic-title-line">
          ${topic.pinned ? '<span class="pin">📌</span>' : ''}
          <a class="topic-title" href="#" data-topic-id="${topic.id}">${topic.title}</a>
        </div>
        <div class="topic-meta">
          ${topic.tags.map(tag => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join('')}
          ${topic.favorite ? '<span class="tag purple">已收藏</span>' : ''}
          ${topic.liked ? '<span class="tag blue">已点赞</span>' : ''}
        </div>
      </td>
      <td class="posters-cell">
        <div class="posters author-posters" title="发帖人：${topic.posters[0] || '匿'}">
          <span class="mini-avatar" style="background:${colors[index % colors.length]}">${topic.posters[0] || '匿'}</span>
        </div>
      </td>
      <td class="like-cell">
        <button class="quick-like-btn ${topic.liked ? 'liked' : ''}" data-like-topic-id="${topic.id}" aria-label="${topic.liked ? '取消点赞' : '点赞'}：${topic.title}">
          <span class="quick-like-thumb" aria-hidden="true">👍</span>
          <span class="quick-like-count">${topic.likeCount}</span>
        </button>
      </td>
      <td class="num">${topic.replies}<small>评论</small></td>
      <td class="num">${topic.views}<small>浏览</small></td>
      <td class="num activity">${topic.activity}<small>活动</small></td>
    </tr>
  `).join('');
};

sidebarLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    resetChips();
    const filter = link.dataset.filter;
    const title = link.dataset.title;

    if (filter === 'admin') {
      currentFilter = filter;
      currentTitle = title;
      topicPanel.hidden = true;
      adminPanel.hidden = false;
      setAdminMode(true);
      sidebarLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      navLinks.forEach((item) => item.classList.remove('active'));
      renderAdminCharts();
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
  categoryChip.textContent = `类别：${category} ▸`;
  searchInput.value = '';
  currentTagKeyword = '';
  tagChip.textContent = '标签：全部 ▸';
  tagMenu.querySelectorAll('button').forEach((btn) => btn.classList.toggle('active', btn.dataset.tag === '全部'));
  closeDropdowns();
  if (category === '全部') switchFilter('all', '最新吐槽', { keepTag: true });
  else switchFilter(category, category, { keepTag: true });
  showToast(`已选择类别：${category}`);
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

listHint.addEventListener('click', () => {
  const newTopic = {
    id: `topic-${Date.now()}`,
    title: '刚刚有同学补充：晚自习教室空调温度不稳定',
    content: '这是模拟的新更新内容，用来展示“查看新的或更新的吐槽”的交互效果。',
    tags: ['校园设施', '新发布'],
    category: '校园设施',
    replies: 0,
    views: 1,
    activity: '刚刚',
    posters: ['匿'],
    hot: false,
    mine: false,
    resolved: false,
    unread: true,
    favorite: false,
    liked: false,
    likeCount: 0,
  };
  topics.unshift(newTopic);
  resetChips();
  switchFilter('all', '最新吐槽');
  showToast('已加载 1 条新的吐槽');
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

const applyTheme = (mode) => {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '白天' : '黑夜';
  if (adminPanel && !adminPanel.hidden) renderAdminCharts();
};

const savedTheme = localStorage.getItem('campusVoiceTheme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem('campusVoiceTheme', nextTheme);
  applyTheme(nextTheme);
  showToast(nextTheme === 'dark' ? '已切换黑夜模式' : '已切换白天模式');
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

const openCreatePost = () => {
  createPostModal.hidden = false;
  setTimeout(() => postTitleInput.focus(), 60);
};
const closeCreatePost = () => {
  createPostModal.hidden = true;
  createPostForm.reset();
  postAnonymousInput.checked = true;
};

createPostBtn.addEventListener('click', openCreatePost);
createPostClose.addEventListener('click', closeCreatePost);
createPostCancel.addEventListener('click', closeCreatePost);
createPostModal.addEventListener('click', (event) => { if (event.target === createPostModal) closeCreatePost(); });

createPostForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const newTopic = {
    id: `topic-${Date.now()}`,
    title: postTitleInput.value.trim(),
    content: postContentInput.value.trim(),
    tags: [postCategoryInput.value, postAnonymousInput.checked ? '匿名' : '实名', '新发布'],
    category: postCategoryInput.value,
    replies: 0,
    views: 1,
    activity: '刚刚',
    posters: [postAnonymousInput.checked ? '匿' : '我'],
    hot: false,
    mine: true,
    resolved: false,
    unread: true,
    favorite: false,
    liked: false,
    likeCount: 0,
  };
  if (!newTopic.title || !newTopic.content) return;
  topics.unshift(newTopic);
  closeCreatePost();
  resetChips();
  switchFilter('all', '最新吐槽');
  showToast('发布成功，已加入最新吐槽');
});

const topicDetailModal = document.getElementById('topicDetailModal');
const topicDetailClose = document.getElementById('topicDetailClose');
const detailTitle = document.getElementById('detailTitle');
const detailTags = document.getElementById('detailTags');
const detailMeta = document.getElementById('detailMeta');
const detailContent = document.getElementById('detailContent');
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
  favoriteBtn.textContent = topic.favorite ? '已收藏' : '收藏';
};

const toggleTopicLike = (topic, sourceButton = null) => {
  topic.liked = !topic.liked;
  topic.likeCount = Math.max(0, (topic.likeCount || 0) + (topic.liked ? 1 : -1));
  if (sourceButton && topic.liked) {
    sourceButton.classList.remove('like-pop');
    void sourceButton.offsetWidth;
    sourceButton.classList.add('like-pop');
  }
};

const openTopicDetail = (topicId) => {
  const topic = topics.find((item) => item.id === topicId);
  if (!topic) return;
  currentTopicId = topicId;
  topic.views += 1;
  topic.unread = false;
  detailTitle.textContent = topic.title;
  detailTags.innerHTML = topic.tags.map((tag) => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join('');
  detailMeta.innerHTML = `
    <span>板块：${topic.category}</span>
    <span>评论：${topic.replies}</span>
    <span>浏览：${topic.views}</span>
    <span>活动：${topic.activity}</span>
    <span>发帖人：${topic.posters[0] || '匿'}</span>
  `;
  detailContent.textContent = topic.content;
  replyBox.hidden = true;
  replyInput.value = '';
  refreshDetailButtons(topic);
  topicDetailModal.hidden = false;
  renderTopics(currentFilter === 'admin' ? 'all' : currentFilter, currentFilter === 'admin' ? '最新吐槽' : currentTitle);
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
    toggleTopicLike(topic, quickLikeBtn);
    renderTopics(currentFilter === 'admin' ? 'all' : currentFilter, currentFilter === 'admin' ? '最新吐槽' : currentTitle);
    if (topic.liked) {
      const refreshedLikeBtn = topicBody.querySelector(`[data-like-topic-id="${topic.id}"]`);
      if (refreshedLikeBtn) {
        refreshedLikeBtn.classList.remove('like-pop');
        void refreshedLikeBtn.offsetWidth;
        refreshedLikeBtn.classList.add('like-pop');
      }
    }
    if (currentTopicId === topic.id) refreshDetailButtons(topic);
    showToast(topic.liked ? '已快捷点赞' : '已取消点赞');
    return;
  }

  const link = event.target.closest('.topic-title[data-topic-id]');
  if (!link) return;
  event.preventDefault();
  openTopicDetail(link.dataset.topicId);
});

topicDetailClose.addEventListener('click', closeTopicDetail);
topicDetailModal.addEventListener('click', (event) => { if (event.target === topicDetailModal) closeTopicDetail(); });
detailReplyBtn.addEventListener('click', () => {
  replyBox.hidden = !replyBox.hidden;
  if (!replyBox.hidden) replyInput.focus();
});
replyCancelBtn.addEventListener('click', () => {
  replyInput.value = '';
  replyBox.hidden = true;
});
likeBtn.addEventListener('click', () => {
  const topic = getCurrentTopic();
  if (!topic) return;
  toggleTopicLike(topic, likeBtn);
  refreshDetailButtons(topic);
  renderTopics(currentFilter === 'admin' ? 'all' : currentFilter, currentFilter === 'admin' ? '最新吐槽' : currentTitle);
  showToast(topic.liked ? '已点赞' : '已取消点赞');
});
favoriteBtn.addEventListener('click', () => {
  const topic = getCurrentTopic();
  if (!topic) return;
  topic.favorite = !topic.favorite;
  refreshDetailButtons(topic);
  renderTopics(currentFilter === 'admin' ? 'all' : currentFilter, currentFilter === 'admin' ? '最新吐槽' : currentTitle);
  showToast(topic.favorite ? '已加入收藏' : '已取消收藏');
});
reportBtn.addEventListener('click', () => {
  showToast('举报已提交，管理员会进行审核');
});
replySubmitBtn.addEventListener('click', () => {
  const topic = getCurrentTopic();
  if (!topic || !replyInput.value.trim()) {
    showToast('请先输入评论内容');
    return;
  }
  topic.replies += 1;
  topic.activity = '刚刚';
  if (!topic.posters.includes('我')) topic.posters.unshift('我');
  replyInput.value = '';
  replyBox.hidden = true;
  openTopicDetail(topic.id);
  showToast('评论已提交');
});

if (generateReportBtn) {
  generateReportBtn.addEventListener('click', () => {
    showToast('管理员账号配置后开启后台功能');
  });
}

window.addEventListener('resize', () => {
  if (!adminPanel.hidden) renderAdminCharts();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!rulesModal.hidden) closeRules();
  if (!createPostModal.hidden) closeCreatePost();
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
  profileNickname.classList.remove('invalid');
};

const openProfile = () => {
  if (!currentUser) {
    openLogin();
    return;
  }
  profileNickname.value = currentUser.nickname || currentUser.email.split('@')[0];
  profileNickname.classList.remove('invalid');
  profileModal.hidden = false;
  setTimeout(() => profileNickname.focus(), 60);
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
  const nickname = profileNickname.value.trim();
  profileNickname.classList.remove('invalid');

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
      body: JSON.stringify({ nickname }),
    });
    updateAuthUI(user);
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
    showToast('登录成功，欢迎回来');
  } catch (error) {
    markLoginError(error.message);
  }
});

const restoreAuthState = async () => {
  try {
    const { user } = await apiRequest('/api/auth/me');
    updateAuthUI(user);
  } catch (_error) {
    updateAuthUI(null);
  }
};

document.addEventListener('click', (event) => {
  if (!userMenuWrap.contains(event.target)) {
    userMenu.classList.remove('open');
    loginBtn.setAttribute('aria-expanded', 'false');
  }
});
restoreAuthState();
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!loginModal.hidden) closeLogin();
  if (!registerModal.hidden) closeRegister();
  if (!profileModal.hidden) closeProfile();
  if (!securityModal.hidden) closeSecurity();
});
