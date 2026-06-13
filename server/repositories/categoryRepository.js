const { getPool } = require('../database/connection');

const publicCategoryFields = (category) => ({
  id: String(category.id),
  name: category.name,
  label: category.label,
  tags: category.tags || [],
  createdAt: category.created_at,
});

const listCategories = async () => {
  const [rows] = await getPool().query(
    `SELECT categories.*, GROUP_CONCAT(category_tags.name ORDER BY category_tags.id SEPARATOR ',') AS tag_names
     FROM categories
     LEFT JOIN category_tags ON category_tags.category_id = categories.id
     GROUP BY categories.id
     ORDER BY categories.id ASC`
  );
  return rows.map((row) => publicCategoryFields({
    ...row,
    tags: row.tag_names ? row.tag_names.split(',').filter(Boolean) : [],
  }));
};

const createCategory = async ({ name, label, tags = [] }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'INSERT INTO categories (name, label) VALUES (?, ?)',
      [name, label]
    );
    for (const tag of tags) {
      await connection.execute('INSERT IGNORE INTO category_tags (category_id, name) VALUES (?, ?)', [result.insertId, tag]);
    }
    await connection.commit();
    return (await listCategories()).find((category) => category.id === String(result.insertId));
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('板块已存在');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  } finally {
    connection.release();
  }
};

const addCategoryTags = async ({ categoryName, tags }) => {
  const [rows] = await getPool().execute('SELECT id FROM categories WHERE name = ? LIMIT 1', [categoryName]);
  const categoryId = rows[0]?.id;
  if (!categoryId) return null;
  for (const tag of tags) {
    await getPool().execute('INSERT IGNORE INTO category_tags (category_id, name) VALUES (?, ?)', [categoryId, tag]);
  }
  return (await listCategories()).find((category) => category.name === categoryName);
};

const deleteCategoryTag = async ({ categoryName, tag }) => {
  const [rows] = await getPool().execute('SELECT id FROM categories WHERE name = ? LIMIT 1', [categoryName]);
  const categoryId = rows[0]?.id;
  if (!categoryId) return null;
  const [result] = await getPool().execute(
    'DELETE FROM category_tags WHERE category_id = ? AND name = ?',
    [categoryId, tag]
  );
  return result.affectedRows > 0;
};

const deleteCategory = async (name) => {
  try {
    const [result] = await getPool().execute('DELETE FROM categories WHERE name = ?', [name]);
    return result.affectedRows > 0;
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      const inUseError = new Error('该板块已有帖子，不能删除');
      inUseError.statusCode = 409;
      throw inUseError;
    }
    throw error;
  }
};

module.exports = {
  addCategoryTags,
  createCategory,
  deleteCategory,
  deleteCategoryTag,
  listCategories,
};
