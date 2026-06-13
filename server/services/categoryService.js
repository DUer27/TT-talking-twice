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

const tagStopWords = new Set(['学校', '同学', '老师', '问题', '建议', '反馈', '处理', '吐槽', '情况', '东西', '地方', '这个', '那个']);

const normalizeTagForCompare = (value) => normalizeText(value)
  .toLowerCase()
  .replace(/[\s,，。.!！?？;；:：、\-—_()[\]【】《》"“”'‘’/\\]+/g, '');

const isCoveredByExistingTag = (tag, existingTags = []) => {
  const normalizedTag = normalizeTagForCompare(tag);
  if (!normalizedTag) return true;
  return existingTags.some((existingTag) => {
    const normalizedExisting = normalizeTagForCompare(existingTag);
    if (!normalizedExisting) return false;
    if (normalizedExisting === normalizedTag) return true;
    return normalizedTag.length > normalizedExisting.length && normalizedTag.includes(normalizedExisting);
  });
};

const isUsefulTag = (tag) => {
  if (!tag || tag.length < 2 || tag.length > 8) return false;
  if (tagStopWords.has(tag)) return false;
  if (/^[0-9]+$/.test(tag)) return false;
  return /[\u4e00-\u9fffA-Za-z]/.test(tag);
};

const normalizeSuggestedTags = (suggestions = [], fallbackCategory = '') => {
  const normalized = [];
  const source = Array.isArray(suggestions) ? suggestions : [];
  source.forEach((item) => {
    if (typeof item === 'string') {
      const tag = normalizeText(item);
      if (fallbackCategory && isUsefulTag(tag)) normalized.push({ category: fallbackCategory, tag });
      return;
    }
    const category = normalizeText(item?.category || item?.categoryName || fallbackCategory);
    const tags = Array.isArray(item?.tags) ? item.tags : [item?.tag || item?.name || item?.word].filter(Boolean);
    tags.forEach((value) => {
      const tag = normalizeText(value);
      if (category && isUsefulTag(tag)) normalized.push({ category, tag });
    });
  });
  return normalized;
};

const addSuggestedTagsToCategories = async (suggestions = [], { fallbackCategory = '' } = {}) => {
  const categories = await listCategories();
  const categoryMap = new Map(categories.map((category) => [category.name, category]));
  const groupedTags = new Map();

  normalizeSuggestedTags(suggestions, fallbackCategory).forEach(({ category, tag }) => {
    const matchedCategory = categoryMap.get(category);
    if (!matchedCategory) return;
    const existingTags = matchedCategory.tags || [];
    if (isCoveredByExistingTag(tag, existingTags)) return;
    if (!groupedTags.has(category)) groupedTags.set(category, new Set());
    groupedTags.get(category).add(tag);
  });

  const addedTags = [];
  for (const [category, tagSet] of groupedTags.entries()) {
    const tags = [...tagSet];
    await addCategoryTags({ categoryName: category, tags });
    tags.forEach((tag) => addedTags.push({ category, tag }));
  }

  return addedTags;
};

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
  addSuggestedTagsToCategories,
  addTagsToCategory,
  getCategories,
  removeCategoryOrTag,
};
