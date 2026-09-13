const path = require('path');
const fs = require('fs');
const { rootDir } = require('../config/env');
const {
  createAnnouncement,
  createAssignment,
  deleteAnnouncement,
  deleteAssignment,
  findAnnouncementById,
  findAssignmentById,
  findSubmissionById,
  getClassStats,
  listAnnouncements,
  listAssignments,
  listSubmissions,
  updateAssignmentStatus,
  upsertSubmission,
} = require('../repositories/classRepository');
const { countUsersByRole } = require('../repositories/userRepository');

const uploadRoot = path.join(rootDir, 'server', 'data', 'class-uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.dot', '.dotx', '.rtf', '.odt', '.wps',
  '.ppt', '.pptx', '.pps', '.ppsx', '.odp', '.dps',
  '.xls', '.xlsx', '.xlsm', '.csv', '.ods', '.et',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.heic', '.heif', '.jfif',
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.txt', '.md', '.pages', '.numbers', '.key',
]);
const MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.dot': 'application/msword',
  '.dotx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.wps': 'application/vnd.ms-works',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.pps': 'application/vnd.ms-powerpoint',
  '.ppsx': 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xlsm': 'application/vnd.ms-excel.sheet.macroenabled.12',
  '.csv': 'text/csv',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.jfif': 'image/jpeg',
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
};
const PREVIEWABLE_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.jfif']);

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeText = (value) => String(value || '').trim();
const canManageClass = (user) => ['admin', 'teacher'].includes(user?.role);
const canSubmitClass = (user) => ['admin', 'student'].includes(user?.role);
const getFileExtension = (filename) => path.extname(String(filename || '')).toLowerCase();
const resolveMimeType = (filename, mimeType = '') => MIME_BY_EXT[getFileExtension(filename)] || mimeType || 'application/octet-stream';
const isPreviewableFile = (filename, mimeType = '') => {
  const ext = getFileExtension(filename);
  const mime = resolveMimeType(filename, mimeType);
  return PREVIEWABLE_EXT.has(ext) || mime.startsWith('image/') || mime === 'application/pdf';
};

const ensureUploadRoot = () => {
  fs.mkdirSync(uploadRoot, { recursive: true });
};

const assertManageClass = (user) => {
  if (!canManageClass(user)) throw createHttpError('只有教师或管理员可以执行该操作', 403);
};

const assertSubmitClass = (user) => {
  if (!canSubmitClass(user)) throw createHttpError('只有学生或管理员可以提交文件', 403);
};
const getOverview = async (user) => {
  const studentCount = await countUsersByRole('student');
  const [stats, announcements, assignments, submissions] = await Promise.all([
    getClassStats(),
    listAnnouncements({ limit: 8 }),
    listAssignments({ limit: 8, expectedCount: studentCount }),
    listSubmissions({ userId: canSubmitClass(user) && user.role !== 'admin' ? user.id : null, limit: 12 }),
  ]);

  const mySubmissions = user?.role === 'student' || user?.role === 'admin'
    ? await listSubmissions({ userId: user.id, limit: 50 })
    : [];
  const mySubmissionMap = new Map(mySubmissions.map((item) => [item.assignmentId, item]));

  return {
    stats: {
      ...stats,
      studentCount,
    },
    announcements,
    assignments: assignments.map((assignment) => ({
      ...assignment,
      mySubmission: mySubmissionMap.get(assignment.id) || null,
      overdue: Boolean(assignment.dueAt && new Date(assignment.dueAt).getTime() < Date.now()),
    })),
    submissions: canManageClass(user) ? submissions : mySubmissions,
  };
};

const publishAnnouncement = async (user, { title, content }) => {
  assertManageClass(user);
  const safeTitle = normalizeText(title);
  const safeContent = String(content || '').trim();
  if (!safeTitle) throw createHttpError('请输入公告标题');
  if (safeTitle.length > 80) throw createHttpError('公告标题不能超过 80 个字');
  if (!safeContent) throw createHttpError('请输入公告内容');
  if (safeContent.length > 4000) throw createHttpError('公告内容不能超过 4000 个字');
  return createAnnouncement({
    authorId: user.id,
    title: safeTitle,
    content: safeContent,
  });
};

const removeAnnouncement = async (user, id) => {
  assertManageClass(user);
  if (!id || !/^\d+$/.test(String(id))) throw createHttpError('公告不存在', 404);
  const existed = await findAnnouncementById(id);
  if (!existed) throw createHttpError('公告不存在', 404);
  await deleteAnnouncement(id);
  return { ok: true };
};

const publishAssignment = async (user, { title, description, dueAt }) => {
  assertManageClass(user);
  const safeTitle = normalizeText(title);
  const safeDescription = String(description || '').trim();
  if (!safeTitle) throw createHttpError('请输入收取标题');
  if (safeTitle.length > 80) throw createHttpError('收取标题不能超过 80 个字');
  if (safeDescription.length > 2000) throw createHttpError('收取说明不能超过 2000 个字');

  let normalizedDueAt = null;
  if (dueAt) {
    const date = new Date(dueAt);
    if (Number.isNaN(date.getTime())) throw createHttpError('截止时间格式不正确');
    normalizedDueAt = date;
  }

  return createAssignment({
    authorId: user.id,
    title: safeTitle,
    description: safeDescription,
    dueAt: normalizedDueAt,
  });
};

const changeAssignmentStatus = async (user, id, { status }) => {
  assertManageClass(user);
  if (!['open', 'closed'].includes(status)) throw createHttpError('收取状态无效');
  const assignment = await findAssignmentById(id);
  if (!assignment) throw createHttpError('收取任务不存在', 404);
  return updateAssignmentStatus({ id, status });
};

const removeAssignment = async (user, id) => {
  assertManageClass(user);
  const assignment = await findAssignmentById(id);
  if (!assignment) throw createHttpError('收取任务不存在', 404);
  const submissions = await listSubmissions({ assignmentId: id, limit: 200 });
  submissions.forEach((item) => {
    const absolutePath = path.join(uploadRoot, item.storedPath);
    if (item.storedPath && fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  });
  await deleteAssignment(id);
  return { ok: true };
};

const submitAssignment = async (user, assignmentId, { note, file }) => {
  assertSubmitClass(user);
  const assignment = await findAssignmentById(assignmentId);
  if (!assignment) throw createHttpError('收取任务不存在', 404);
  if (assignment.status !== 'open') throw createHttpError('该文件收取已停止');
  if (assignment.dueAt && new Date(assignment.dueAt).getTime() < Date.now() && user.role !== 'admin') {
    throw createHttpError('已过截止时间，无法提交');
  }
  if (!file) throw createHttpError('请先选择要提交的文件');
  if (file.size > MAX_FILE_SIZE) throw createHttpError('文件不能超过 50MB');

  const ext = getFileExtension(file.originalname);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw createHttpError('请提交图片、Word、PDF、PPT、Excel 或压缩包等常用文件');
  }

  ensureUploadRoot();
  const storedName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext || '.bin'}`;
  const relativeDir = String(assignmentId);
  const absoluteDir = path.join(uploadRoot, relativeDir);
  fs.mkdirSync(absoluteDir, { recursive: true });
  const relativePath = path.join(relativeDir, storedName);
  const absolutePath = path.join(uploadRoot, relativePath);
  fs.writeFileSync(absolutePath, file.buffer);

  const result = await upsertSubmission({
    assignmentId,
    userId: user.id,
    note: normalizeText(note).slice(0, 300),
    originalName: String(file.originalname || `submission${ext}`).slice(0, 180),
    storedPath: relativePath.replace(/\\/g, '/'),
    mimeType: resolveMimeType(file.originalname, file.mimetype).slice(0, 120),
    fileSize: Number(file.size || 0),
  });

  if (result.previous?.storedPath) {
    const previousPath = path.join(uploadRoot, result.previous.storedPath);
    if (previousPath !== absolutePath && fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
  }

  return result.current;
};

const getSubmissionFile = async (user, id, { inline = false } = {}) => {
  const submission = await findSubmissionById(id);
  if (!submission) throw createHttpError('提交记录不存在', 404);
  if (!canManageClass(user) && String(submission.userId) !== String(user.id)) {
    throw createHttpError('没有权限查看该文件', 403);
  }
  const absolutePath = path.join(uploadRoot, submission.storedPath);
  if (!fs.existsSync(absolutePath)) throw createHttpError('文件已丢失', 404);
  const mimeType = resolveMimeType(submission.originalName, submission.mimeType);
  return {
    absolutePath,
    originalName: submission.originalName,
    mimeType,
    inline: Boolean(inline) && isPreviewableFile(submission.originalName, mimeType),
  };
};

module.exports = {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  canManageClass,
  canSubmitClass,
  changeAssignmentStatus,
  getOverview,
  getSubmissionFile,
  isPreviewableFile,
  listAnnouncements,
  listAssignments,
  listSubmissions,
  publishAnnouncement,
  publishAssignment,
  removeAnnouncement,
  removeAssignment,
  submitAssignment,
  uploadRoot,
};
