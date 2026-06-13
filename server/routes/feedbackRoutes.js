const express = require('express');
const { requireAdmin } = require('../middleware/authMiddleware');
const {
  changeFeedbackStatus,
  getFeedbackList,
  submitFeedback,
} = require('../services/feedbackService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const feedback = await submitFeedback({
      currentUserId: req.currentUser?.id || null,
      body: req.body,
      userAgent: req.get('user-agent') || '',
    });
    res.status(201).json({ feedback });
  } catch (error) {
    next(error);
  }
});

router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const feedback = await getFeedbackList({ status: req.query.status });
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const feedback = await changeFeedbackStatus(req.params.id, req.body);
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
