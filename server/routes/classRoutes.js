const path = require('path');
const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  MAX_FILE_SIZE,
  changeAssignmentStatus,
  getOverview,
  getSubmissionFile,
  listAnnouncements,
  listAssignments,
  listSubmissions,
  publishAnnouncement,
  publishAssignment,
  removeAnnouncement,
  removeAssignment,
  submitAssignment,
} = require('../services/classService');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

router.use(requireAuth);

router.get('/overview', async (req, res, next) => {
  try {
    const overview = await getOverview(req.currentUser);
    res.json({ overview, user: req.currentUser });
  } catch (error) {
    next(error);
  }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await listAnnouncements({ limit: 50 });
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
    const assignments = await listAssignments({ limit: 50 });
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

router.get('/submissions', async (req, res, next) => {
  try {
    const isManager = ['admin', 'teacher'].includes(req.currentUser.role);
    const submissions = await listSubmissions({
      assignmentId: req.query.assignmentId || null,
      userId: isManager ? (req.query.userId || null) : req.currentUser.id,
      limit: 100,
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
