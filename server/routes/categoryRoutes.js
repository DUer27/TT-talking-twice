const express = require('express');
const { requireAdmin } = require('../middleware/authMiddleware');
const { addCategory, getCategories } = require('../services/categoryService');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const category = await addCategory(req.body);
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
