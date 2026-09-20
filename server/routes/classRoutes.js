const path = require('path');
const express = require('express');
const multer = require('multer');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');
const {
  MAX_FILE_SIZE,
  assignTeacher,
  changeAssignmentStatus,
  createManagedClass,
  createTeacherAccount,
  getAdminDirectory,
  getOverview,
  getSubmissionFile,
  listAnnouncements,
  listAssignments,
  listSubmissions,
  publishAnnouncement,
  publishAssignment,
  removeAnnouncement,
  removeAssignment,
  removeManagedClass,
  renameManagedClass,
  submitAssignment,
  unassignTeacher,
  getAssignmentPendingStudents,
  sendAssignmentReminders,
  listMyReminders,
} = require('../services/classService');
const { findClassesForUser, findSubmissionById } = require('../repositories/classRepository');
const {
  RUBRIC_CRITERIA,
  TIER_DEFINITIONS,
  batchAiGradeSubmissions,
  getClassDiagnostics,
  gradeSubmission,
  runAiGradingForSubmission,
} = require('../services/classGradingService');

const requireTeacherOrAdmin = (req, res, next) => {
  if (!['admin', 'teacher'].includes(req.currentUser?.role)) {
    const error = new Error('只有教师或管理员可以进行此操作');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

router.use(requireAuth);

router.get('/admin/directory', requireAdmin, async (req, res, next) => {
  try {
    const directory = await getAdminDirectory(req.currentUser);
    res.json({ directory });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/classes', requireAdmin, async (req, res, next) => {
  try {
    const classGroup = await createManagedClass(req.currentUser, req.body);
    res.status(201).json({ class: classGroup });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/classes/:id', requireAdmin, async (req, res, next) => {
  try {
    const classGroup = await renameManagedClass(req.currentUser, req.params.id, req.body);
    res.json({ class: classGroup });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/classes/:id', requireAdmin, async (req, res, next) => {
  try {
    await removeManagedClass(req.currentUser, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/teachers', requireAdmin, async (req, res, next) => {
  try {
    const teacher = await createTeacherAccount(req.currentUser, req.body);
    res.status(201).json({ teacher });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/classes/:id/teachers', requireAdmin, async (req, res, next) => {
  try {
    const classGroup = await assignTeacher(req.currentUser, req.params.id, req.body);
    res.json({ class: classGroup });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/classes/:id/teachers/:teacherId', requireAdmin, async (req, res, next) => {
  try {
    const classGroup = await unassignTeacher(req.currentUser, req.params.id, req.params.teacherId);
    res.json({ class: classGroup });
  } catch (error) {
    next(error);
  }
});

router.get('/overview', async (req, res, next) => {
  try {
    const classId = req.query.classId ? Number(req.query.classId) : null;
    const overview = await getOverview(req.currentUser, { classId });
    res.json({ overview, user: req.currentUser });
  } catch (error) {
    next(error);
  }
});

router.get('/announcements', async (req, res, next) => {
  try {
    let classId = req.query.classId ? Number(req.query.classId) : null;
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      classId = teacherClasses[0]?.id ? Number(teacherClasses[0].id) : null;
    }
    const announcements = await listAnnouncements({ classId, limit: 50 });
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements', async (req, res, next) => {
  try {
    const announcement = await publishAnnouncement(req.currentUser, req.body);
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.delete('/announcements/:id', async (req, res, next) => {
  try {
    await removeAnnouncement(req.currentUser, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get('/assignments', async (req, res, next) => {
  try {
    let classId = req.query.classId ? Number(req.query.classId) : null;
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      classId = teacherClasses[0]?.id ? Number(teacherClasses[0].id) : null;
    }
    const assignments = await listAssignments({ classId, limit: 50 });
    res.json({ assignments });
  } catch (error) {
    next(error);
  }
});

router.post('/assignments', async (req, res, next) => {
  try {
    const assignment = await publishAssignment(req.currentUser, req.body);
    res.status(201).json({ assignment });
  } catch (error) {
    next(error);
  }
});

router.patch('/assignments/:id/status', async (req, res, next) => {
  try {
    const assignment = await changeAssignmentStatus(req.currentUser, req.params.id, req.body);
    res.json({ assignment });
  } catch (error) {
    next(error);
  }
});

router.delete('/assignments/:id', async (req, res, next) => {
  try {
    await removeAssignment(req.currentUser, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
router.get('/assignments/:id/pending-students', requireTeacherOrAdmin, async (req, res, next) => {
  try {
    const data = await getAssignmentPendingStudents(req.currentUser, req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/assignments/:id/remind', requireTeacherOrAdmin, async (req, res, next) => {
  try {
    const result = await sendAssignmentReminders(req.currentUser, {
      assignmentId: req.params.id,
      studentNos: req.body?.studentNos,
      rosterIds: req.body?.rosterIds,
      message: req.body?.message,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/my-reminders', async (req, res, next) => {
  try {
    const reminders = await listMyReminders(req.currentUser);
    res.json({ reminders });
  } catch (error) {
    next(error);
  }
});


router.get('/rubric', async (_req, res) => {
  res.json({
    criteria: RUBRIC_CRITERIA,
    tierDefinitions: TIER_DEFINITIONS,
  });
});

router.get('/diagnostics', requireTeacherOrAdmin, async (req, res, next) => {
  try {
    let classId = req.query.classId ? Number(req.query.classId) : null;
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      classId = teacherClasses[0]?.id ? Number(teacherClasses[0].id) : null;
    }
    const assignmentId = req.query.assignmentId ? Number(req.query.assignmentId) : null;
    const diagnostics = await getClassDiagnostics({ classId, assignmentId });
    res.json({ diagnostics, classId });
  } catch (error) {
    next(error);
  }
});

router.post('/submissions/:id/ai-grade', requireTeacherOrAdmin, async (req, res, next) => {
  try {
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      const classIds = new Set(teacherClasses.map((c) => String(c.id)));
      const sub = await findSubmissionById(Number(req.params.id), { isManager: true });
      if (!sub) {
        const err = new Error('提交记录不存在');
        err.statusCode = 404;
        throw err;
      }
      if (sub.classId && !classIds.has(String(sub.classId))) {
        const err = new Error('没有权限预评其他班级学生的作业');
        err.statusCode = 403;
        throw err;
      }
    }
    const evaluation = await runAiGradingForSubmission(Number(req.params.id), {
      forceHeuristic: Boolean(req.body?.forceHeuristic),
    });
    res.json({ evaluation });
  } catch (error) {
    next(error);
  }
});

router.post('/submissions/batch-ai-grade', requireTeacherOrAdmin, async (req, res, next) => {
  try {
    let classId = req.body?.classId ? Number(req.body.classId) : null;
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      classId = teacherClasses[0]?.id ? Number(teacherClasses[0].id) : null;
    }
    const assignmentId = req.body?.assignmentId ? Number(req.body.assignmentId) : null;
    const submissionIds = Array.isArray(req.body?.submissionIds) ? req.body.submissionIds : [];
    const result = await batchAiGradeSubmissions({
      classId,
      assignmentId,
      submissionIds,
      forceHeuristic: Boolean(req.body?.forceHeuristic),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/submissions/:id/grade', requireTeacherOrAdmin, async (req, res, next) => {
  try {
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      const classIds = new Set(teacherClasses.map((c) => String(c.id)));
      const sub = await findSubmissionById(Number(req.params.id), { isManager: true });
      if (!sub) {
        const err = new Error('提交记录不存在');
        err.statusCode = 404;
        throw err;
      }
      if (sub.classId && !classIds.has(String(sub.classId))) {
        const err = new Error('没有权限批阅其他班级学生的作业');
        err.statusCode = 403;
        throw err;
      }
    }
    const submission = await gradeSubmission({
      submissionId: Number(req.params.id),
      teacherId: req.currentUser.id,
      score: req.body?.score,
      tier: req.body?.tier,
      rubricScores: req.body?.rubricScores,
      feedback: req.body?.feedback,
      teacherDiagnosticNote: req.body?.teacherDiagnosticNote,
    });
    res.json({ submission });
  } catch (error) {
    next(error);
  }
});

router.get('/submissions', async (req, res, next) => {
  try {
    const isManager = ['admin', 'teacher'].includes(req.currentUser.role);
    let classId = req.query.classId ? Number(req.query.classId) : null;
    if (req.currentUser.role === 'teacher') {
      const teacherClasses = await findClassesForUser(req.currentUser.id);
      classId = teacherClasses[0]?.id ? Number(teacherClasses[0].id) : null;
    }
    const submissions = await listSubmissions({
      assignmentId: req.query.assignmentId ? Number(req.query.assignmentId) : null,
      classId,
      userId: isManager ? (req.query.userId ? Number(req.query.userId) : null) : req.currentUser.id,
      limit: req.query.limit ? Number(req.query.limit) : (isManager ? 200 : 100),
      isManager,
    });
    res.json({ submissions });
  } catch (error) {
    next(error);
  }
});

router.post('/assignments/:id/submissions', (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();
    error.statusCode = 400;
    error.message = error.code === 'LIMIT_FILE_SIZE' ? '文件不能超过 50MB' : '文件上传失败';
    next(error);
  });
}, async (req, res, next) => {
  try {
    const submission = await submitAssignment(req.currentUser, req.params.id, {
      note: req.body?.note,
      file: req.file,
    });
    res.status(201).json({ submission });
  } catch (error) {
    next(error);
  }
});

router.get('/submissions/:id/file', async (req, res, next) => {
  try {
    const file = await getSubmissionFile(req.currentUser, req.params.id, {
      inline: String(req.query.inline || '') === '1',
    });
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    const disposition = file.inline ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
    res.sendFile(path.resolve(file.absolutePath));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
