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

const seedDemoPosts = async (pool) => {
  const passwordHash = await hashPassword('seed-only');
  await pool.execute(
    `INSERT INTO users (email, password_hash, role, nickname)
     VALUES (?, ?, 'student', ?)
     ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)`,
    ['seed@local.test', passwordHash, '演示同学']
  );
  const [userRows] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', ['seed@local.test']);
  const userId = userRows[0]?.id;
  if (!userId) return;

  await pool.execute('DELETE FROM posts WHERE user_id = ?', [userId]);

  const demoPosts = [
    ['现经管回声使用说明与公告留档规则', '这里是校园反馈社区的公告区。管理员发布的公告会按发布时间留档，普通吐槽会进入对应板块并显示待处理或已处理状态。请大家真实表达、理性反馈，尽量说明具体场景、影响和期望改进。', '公告', 0, 'resolved', 1260, 18, 72, ['社区规则']],
    ['高数早八课程连续三周临时调课，希望提前通知', '高数早八最近连续三周临时调课，很多同学前一天晚上才知道，通勤和早起安排都被打乱了。希望后续调课能至少提前一天在统一渠道通知。', '课程吐槽', 1, 'open', 438, 24, 33, ['调课']],
    ['食堂二楼晚饭排队太久，热门窗口能不能多开一个', '晚饭高峰期二楼热门窗口排队经常排到楼梯口，等到买完饭已经很晚。希望能根据高峰时段增加窗口或给出错峰提示。', '食堂吐槽', 1, 'open', 982, 46, 86, ['排队']],
    ['宿舍热水晚上十点后不稳定，最近很多人遇到', '最近宿舍热水晚上十点后经常忽冷忽热，洗澡时间很尴尬。希望能检查热水供应设备，并提前公布维修安排。', '宿舍生活', 1, 'open', 756, 37, 68, ['热水']],
    ['图书馆自习区插座数量不够，考试周特别明显', '图书馆自习区插座不够用，考试周大家都在找能充电的位置。希望增加插座，或开放更多带电源的自习区域。', '校园设施', 1, 'open', 502, 19, 41, ['插座']],
    ['希望社团活动通知能集中展示，不要分散在多个群里', '社团活动通知分散在不同群里，报名时间很容易错过。希望能有统一入口集中展示活动、报名时间和场地信息。', '活动社团', 1, 'open', 241, 12, 24, ['通知', '报名']],
    ['操场夜间照明有几盏灯坏了，跑步区域比较暗', '操场夜间照明最近有几盏灯不亮，跑步时部分区域比较暗。希望尽快安排维修，避免夜跑同学看不清路面。', '校园设施', 1, 'resolved', 198, 8, 18, ['照明', '维修']],
    ['部分公共课作业截止时间集中，希望老师之间能协调', '这周好几门公共课作业都挤在同一天截止，考试复习压力很大。希望课程之间能协调一下截止时间，避免集中提交。', '课程吐槽', 1, 'open', 1118, 53, 92, ['作业']],
    ['北门快递点雨天排队没有遮挡，取件不太方便', '北门快递点雨天排队没有遮挡，地面也容易积水，取件体验很差。希望能增加雨棚或优化排队区域。', '宿舍生活', 1, 'open', 326, 15, 29, ['维修']],
  ];

  for (const post of demoPosts) {
    const [result] = await pool.execute(
      `INSERT INTO posts (user_id, title, content, category, is_anonymous, status, view_count, reply_count, like_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, ...post.slice(0, 8)]
    );
    for (const tag of post[8]) {
      await pool.execute('INSERT IGNORE INTO post_tags (post_id, tag_name) VALUES (?, ?)', [result.insertId, tag]);
    }
  }
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
  await seedDemoPosts(pool);

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
