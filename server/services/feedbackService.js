const {
  createFeedback,
  listFeedback,
  updateFeedbackStatus,
} = require('../repositories/feedbackRepository');

const allowedStatuses = new Set(['open', 'resolved', 'ignored']);
const allowedTypes = new Set(['登录问题', '发帖问题', '页面显示异常', '管理员后台问题', '数据错误', '功能建议', '其他']);

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const normalizeContent = (value) => String(value || '').trim();

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const submitFeedback = async ({ currentUserId = null, body = {}, userAgent = '' } = {}) => {
  const type = allowedTypes.has(normalizeText(body.type)) ? normalizeText(body.type) : '其他';
  const content = normalizeContent(body.content);
  const contact = normalizeText(body.contact).slice(0, 120);
  const pageUrl = normalizeText(body.pageUrl).slice(0, 500);

  if (!content) throw createHttpError('请先输入你遇到的问题');
  if (content.length < 5) throw createHttpError('问题描述至少需要 5 个字');
  if (content.length > 2000) throw createHttpError('问题描述不能超过 2000 字');

  return createFeedback({
    userId: currentUserId,
    type,
    content,
    contact,
    pageUrl,
    userAgent: normalizeText(userAgent).slice(0, 500),
  });
};

const getFeedbackList = async ({ status = 'all' } = {}) => {
  const normalizedStatus = normalizeText(status || 'all');
  const safeStatus = normalizedStatus === 'all' || allowedStatuses.has(normalizedStatus) ? normalizedStatus : 'all';
  return listFeedback({ status: safeStatus });
};

const changeFeedbackStatus = async (id, { status }) => {
  if (!id || !/^\d+$/.test(String(id))) throw createHttpError('反馈不存在', 404);
  const normalizedStatus = normalizeText(status);
  if (!allowedStatuses.has(normalizedStatus)) throw createHttpError('反馈状态无效');
  const feedback = await updateFeedbackStatus({ id, status: normalizedStatus });
  if (!feedback) throw createHttpError('反馈不存在', 404);
  return feedback;
};

module.exports = {
  changeFeedbackStatus,
  getFeedbackList,
  submitFeedback,
};
