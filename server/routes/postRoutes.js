const express = require('express');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');
const {
  changePostStatus,
  changePostsStatus,
  getAdminPosts,
  getPost,
  getPostStats,
  getPosts,
  publishAnnouncement,
  publishComment,
  publishPost,
  toggleFavorite,
  toggleLike,
} = require('../services/postService');
const { generateAdminReport, getReportExport, getReportHistory } = require('../services/reportService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await getPosts({ currentUserId: req.currentUser?.id, query: req.query });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', requireAdmin, async (_req, res, next) => {
  try {
    const stats = await getPostStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/list', requireAdmin, async (req, res, next) => {
  try {
    const posts = await getAdminPosts({ currentUserId: req.currentUser.id, status: req.query.status });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/reports', requireAdmin, async (_req, res, next) => {
  try {
    const reports = await getReportHistory();
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/reports', requireAdmin, async (req, res, next) => {
  try {
    const report = await generateAdminReport(req.currentUser.id);
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/announcements', requireAdmin, async (req, res, next) => {
  try {
    const post = await publishAnnouncement(req.currentUser.id, req.body);
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

router.get('/admin/reports/:id/export', requireAdmin, async (req, res, next) => {
  try {
    const exported = await getReportExport(req.params.id, req.query.format);
    res.setHeader('Content-Type', exported.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(exported.filename)}"`);
    res.send(exported.content);
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/status', requireAdmin, async (req, res, next) => {
  try {
    const posts = await changePostsStatus(req.currentUser.id, req.body);
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await getPost(req.params.id, {
      currentUserId: req.currentUser?.id,
      increaseViews: true,
      includeHidden: req.currentUser?.role === 'admin',
    });
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const post = await publishPost(req.currentUser.id, req.body);
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const result = await publishComment(req.params.id, req.currentUser.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const result = await toggleLike(req.params.id, req.currentUser.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/favorite', requireAuth, async (req, res, next) => {
  try {
    const result = await toggleFavorite(req.params.id, req.currentUser.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const post = await changePostStatus(req.params.id, req.currentUser.id, req.body);
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
