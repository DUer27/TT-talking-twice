const { db } = require('../config/env');
const { getPool, getServerPool } = require('./connection');
const { hashPassword } = require('../utils/password');

const seedDefaultAdmin = async (pool) => {
  const [adminRows] = await pool.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (adminRows.length) return;

  const passwordHash = await hashPassword('123456');
  await pool.execute(
    `INSERT INTO users (email, password_hash, role, nickname)
     VALUES (?, ?, 'admin', ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', nickname = VALUES(nickname)`,
    ['root@root.root', passwordHash, 'root']
  );
};

const migrate = async () => {
  const serverPool = getServerPool();
  await serverPool.query(
    `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'student',
      nickname VARCHAR(80) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_sessions_token_hash (token_hash),
      KEY idx_sessions_user_id (user_id),
      KEY idx_sessions_expires_at (expires_at),
      CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      attempt_key VARCHAR(512) NOT NULL,
      email VARCHAR(255) NOT NULL,
      ip VARCHAR(80) NOT NULL,
      failed_count INT UNSIGNED NOT NULL DEFAULT 0,
      reset_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (attempt_key),
      KEY idx_login_attempts_reset_at (reset_at),
      KEY idx_login_attempts_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(120) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(64) NOT NULL,
      is_anonymous TINYINT(1) NOT NULL DEFAULT 1,
      status VARCHAR(32) NOT NULL DEFAULT 'open',
      view_count INT UNSIGNED NOT NULL DEFAULT 0,
      reply_count INT UNSIGNED NOT NULL DEFAULT 0,
      like_count INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_posts_user_id (user_id),
      KEY idx_posts_category_created_at (category, created_at),
      KEY idx_posts_created_at (created_at),
      CONSTRAINT fk_posts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(64) NOT NULL,
      label VARCHAR(32) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_categories_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS category_tags (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      category_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_category_tags_category_name (category_id, name),
      CONSTRAINT fk_category_tags_category_id FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id BIGINT UNSIGNED NOT NULL,
      tag_name VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, tag_name),
      CONSTRAINT fk_post_tags_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const defaultCategories = [
    ['课程吐槽', '课程', ['调课', '作业', '考试']],
    ['食堂吐槽', '食堂', ['排队', '价格', '口味']],
    ['宿舍生活', '宿舍', ['热水', '噪音', '网络']],
    ['校园设施', '设施', ['插座', '照明', '维修']],
    ['活动社团', '活动', ['通知', '报名', '场地']],
    ['公告', '公告', ['社区规则']],
  ];
  for (const category of defaultCategories) {
    await pool.execute(
      'INSERT IGNORE INTO categories (name, label) VALUES (?, ?)',
      [category[0], category[1]]
    );
    const [categoryRows] = await pool.execute('SELECT id FROM categories WHERE name = ? LIMIT 1', [category[0]]);
    const categoryId = categoryRows[0]?.id;
    if (categoryId) {
      for (const tag of category[2]) {
        await pool.execute('INSERT IGNORE INTO category_tags (category_id, name) VALUES (?, ?)', [categoryId, tag]);
      }
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      post_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'visible',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_comments_post_id_created_at (post_id, created_at),
      KEY idx_comments_user_id (user_id),
      CONSTRAINT fk_comments_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT fk_comments_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      post_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id),
      KEY idx_post_likes_user_id (user_id),
      CONSTRAINT fk_post_likes_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT fk_post_likes_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_reports (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(160) NOT NULL,
      summary TEXT NOT NULL,
      payload JSON NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_admin_reports_user_id_created_at (user_id, created_at),
      CONSTRAINT fk_admin_reports_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_report_posts (
      report_id BIGINT UNSIGNED NOT NULL,
      post_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id, post_id),
      KEY idx_admin_report_posts_post_id (post_id),
      CONSTRAINT fk_admin_report_posts_report_id FOREIGN KEY (report_id) REFERENCES admin_reports(id) ON DELETE CASCADE,
      CONSTRAINT fk_admin_report_posts_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await seedDefaultAdmin(pool);

  await pool.query('DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()');
  await pool.query('DELETE FROM login_attempts WHERE reset_at <= UTC_TIMESTAMP()');
};

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('MySQL migration completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('MySQL migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { migrate };
