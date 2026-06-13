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

module.exports = {
  createCategory,
  listCategories,
};
