const {
  addCategoryTags,
  createCategory,
  deleteCategory,
  deleteCategoryTag,
  listCategories,
} = require('../repositories/categoryRepository');

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const getCategories = async () => listCategories();

const parseTags = (value) => normalizeText(value || '')
  .split(/[,，、\s]+/)
  .map((tag) => normalizeText(tag))
  .filter(Boolean)
  .slice(0, 12);

const addCategory = async ({ name }) => {
  const normalizedName = normalizeText(name);
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
  return createCategory({ name: normalizedName, label: normalizedLabel });
};

const addTagsToCategory = async ({ category, tags }) => {
  const normalizedCategory = normalizeText(category);
  const normalizedTags = parseTags(tags);
  if (!normalizedCategory) {
    const error = new Error('请选择板块');
    error.statusCode = 400;
    throw error;
  }
  if (!normalizedTags.length) {
    const error = new Error('请输入要添加的标签');
    error.statusCode = 400;
    throw error;
  }
  const updated = await addCategoryTags({ categoryName: normalizedCategory, tags: normalizedTags });
  if (!updated) {
    const error = new Error('板块不存在');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const removeCategoryOrTag = async ({ category, tag }) => {
  const normalizedCategory = normalizeText(category);
  const normalizedTag = normalizeText(tag);
  if (!normalizedCategory) {
    const error = new Error('请选择板块');
    error.statusCode = 400;
    throw error;
  }
  if (!normalizedTag) {
    const deleted = await deleteCategory(normalizedCategory);
    if (!deleted) {
      const error = new Error('板块不存在');
      error.statusCode = 404;
      throw error;
    }
    return { deletedCategory: normalizedCategory };
  }
  const deleted = await deleteCategoryTag({ categoryName: normalizedCategory, tag: normalizedTag });
  if (!deleted) {
    const error = new Error('标签不存在');
    error.statusCode = 404;
    throw error;
  }
  return { category: normalizedCategory, deletedTag: normalizedTag };
};

module.exports = {
  addCategory,
  addTagsToCategory,
  getCategories,
  removeCategoryOrTag,
};
