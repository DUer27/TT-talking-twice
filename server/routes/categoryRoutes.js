const express = require('express');
const { requireAdmin } = require('../middleware/authMiddleware');
const { addCategory, addTagsToCategory, getCategories, removeCategoryOrTag } = require('../services/categoryService');

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

router.patch('/tags', requireAdmin, async (req, res, next) => {
  try {
    const category = await addTagsToCategory(req.body);
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

router.delete('/', requireAdmin, async (req, res, next) => {
  try {
    const result = await removeCategoryOrTag(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
