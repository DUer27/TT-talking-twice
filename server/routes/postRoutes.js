const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getPost, getPostStats, getPosts, publishPost } = require('../services/postService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const posts = await getPosts({ currentUserId: req.currentUser?.id });
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (_req, res, next) => {
  try {
    const stats = await getPostStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await getPost(req.params.id, {
      currentUserId: req.currentUser?.id,
      increaseViews: true,
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

module.exports = router;
