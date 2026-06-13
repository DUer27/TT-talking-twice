const { createCategory, listCategories } = require('../repositories/categoryRepository');

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const getCategories = async () => listCategories();

const addCategory = async ({ name, label }) => {
  const normalizedName = normalizeText(name);
  const tagText = normalizeText(label || '');
  const tags = tagText
    .split(/[,，、\s]+/)
    .map((tag) => normalizeText(tag))
    .filter(Boolean)
    .slice(0, 12);
  const normalizedLabel = normalizedName.slice(0, 4);
  if (!normalizedName) {
    const error = new Error('板块名称不能为空');
    error.statusCode = 400;
    throw error;
  }
  if (normalizedName.length > 64) {
    const error = new Error('板块名称不能超过 64 个字符');
    error.statusCode = 400;
    throw error;
  }
  return createCategory({ name: normalizedName, label: normalizedLabel, tags });
};

module.exports = {
  addCategory,
  getCategories,
};
