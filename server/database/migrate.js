const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { db, defaultAdmin, rootDir } = require('../config/env');
const { getPool, getServerPool } = require('./connection');
const { hashPassword } = require('../utils/password');

const ensureUserQqColumn = async (pool) => {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'qq'
     LIMIT 1`,
    [db.database]
  );
  if (rows.length) return;

  await pool.query("ALTER TABLE users ADD COLUMN qq VARCHAR(20) NOT NULL DEFAULT '' AFTER nickname");
};

const hasColumn = async (pool, tableName, columnName) => {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [db.database, tableName, columnName]
  );
  return rows.length > 0;
};

const ensureUserStudentNoColumn = async (pool) => {
  if (await hasColumn(pool, 'users', 'student_no')) return;
  await pool.query("ALTER TABLE users ADD COLUMN student_no VARCHAR(32) NULL AFTER qq");
  const [indexRows] = await pool.execute("SHOW INDEX FROM users WHERE Key_name = 'uk_users_student_no'");
  if (!indexRows.length) {
    await pool.query('ALTER TABLE users ADD UNIQUE KEY uk_users_student_no (student_no)');
  }
};

const ensureRosterColumns = async (pool) => {
  if (!(await hasColumn(pool, 'class_roster', 'origin_province'))) {
    await pool.query("ALTER TABLE class_roster ADD COLUMN origin_province VARCHAR(64) NULL AFTER name");
  }
  if (!(await hasColumn(pool, 'class_roster', 'gaokao_score'))) {
    await pool.query("ALTER TABLE class_roster ADD COLUMN gaokao_score DECIMAL(6,2) NULL AFTER origin_province");
  }
  if (!(await hasColumn(pool, 'class_roster', 'gaokao_math'))) {
    await pool.query("ALTER TABLE class_roster ADD COLUMN gaokao_math DECIMAL(6,2) NULL AFTER gaokao_score");
  }
  if (!(await hasColumn(pool, 'class_roster', 'gaokao_chinese'))) {
    await pool.query("ALTER TABLE class_roster ADD COLUMN gaokao_chinese DECIMAL(6,2) NULL AFTER gaokao_math");
  }
  if (!(await hasColumn(pool, 'class_roster', 'gaokao_english'))) {
    await pool.query("ALTER TABLE class_roster ADD COLUMN gaokao_english DECIMAL(6,2) NULL AFTER gaokao_chinese");
  }
  if (!(await hasColumn(pool, 'class_roster', 'initial_rank'))) {
    await pool.query("ALTER TABLE class_roster ADD COLUMN initial_rank INT UNSIGNED NULL AFTER gaokao_english");
  }
};

const ensureSubmissionColumns = async (pool) => {
  if (!(await hasColumn(pool, 'class_submissions', 'tier'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN tier VARCHAR(16) NULL AFTER file_size");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'score'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN score DECIMAL(5,2) NULL AFTER tier");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'rank_in_class'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN rank_in_class INT UNSIGNED NULL AFTER score");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'rank_gain'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN rank_gain INT NULL AFTER rank_in_class");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'is_leap'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN is_leap TINYINT(1) NOT NULL DEFAULT 0 AFTER rank_gain");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'feedback'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN feedback TEXT NULL AFTER rank_gain");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'rubric_scores'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN rubric_scores JSON NULL AFTER feedback");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'ai_suggested_tier'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN ai_suggested_tier VARCHAR(16) NULL AFTER rubric_scores");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'ai_suggested_score'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN ai_suggested_score DECIMAL(5,2) NULL AFTER ai_suggested_tier");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'ai_evaluation'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN ai_evaluation JSON NULL AFTER ai_suggested_score");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'teacher_diagnostic_note'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN teacher_diagnostic_note TEXT NULL AFTER ai_evaluation");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'status'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'submitted' AFTER teacher_diagnostic_note");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'graded_at'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN graded_at DATETIME NULL AFTER status");
  }
  if (!(await hasColumn(pool, 'class_submissions', 'graded_by'))) {
    await pool.query("ALTER TABLE class_submissions ADD COLUMN graded_by BIGINT UNSIGNED NULL AFTER graded_at");
  }
};
const ensureAssignmentAndAnnouncementClassId = async (pool) => {
  if (!(await hasColumn(pool, 'class_assignments', 'class_id'))) {
    await pool.query("ALTER TABLE class_assignments ADD COLUMN class_id BIGINT UNSIGNED NULL AFTER author_id, ADD KEY idx_class_assignments_class_id (class_id)");
  }
  if (!(await hasColumn(pool, 'class_announcements', 'class_id'))) {
    await pool.query("ALTER TABLE class_announcements ADD COLUMN class_id BIGINT UNSIGNED NULL AFTER author_id, ADD KEY idx_class_announcements_class_id (class_id)");
  }
};

const seedDefaultAdmin = async (pool) => {
  const [adminRows] = await pool.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (adminRows.length) return;

  if (defaultAdmin.password && defaultAdmin.password.length < 12) {
    throw new Error('DEFAULT_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const generatedPassword = defaultAdmin.password || crypto.randomBytes(18).toString('base64url');
  const passwordHash = await hashPassword(generatedPassword);
  await pool.execute(
    `INSERT INTO users (email, password_hash, role, nickname)
     VALUES (?, ?, 'admin', ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', nickname = VALUES(nickname)`,
    [defaultAdmin.email, passwordHash, defaultAdmin.nickname]
  );

  console.warn(`Created initial admin account: ${defaultAdmin.email}`);
  if (!defaultAdmin.password) {
    console.warn(`Temporary initial admin password: ${generatedPassword}`);
    console.warn('Change this password immediately after first login.');
  }
};

const seedDefaultClassTeachers = async (pool) => {
  const defaults = [
    { email: 'teacher1@class.local', nickname: '教师1', password: 'TeacherOne#2026', className: '数经1', aliases: ['班级1'] },
    { email: 'teacher2@class.local', nickname: '教师2', password: 'TeacherTwo#2026', className: '数经2', aliases: ['班级2'] },
  ];

  for (const item of defaults) {
    const names = [item.className, ...(item.aliases || [])];
    let classId = null;
    for (const name of names) {
      const [classRows] = await pool.execute('SELECT id FROM class_groups WHERE name = ? LIMIT 1', [name]);
      if (classRows[0]?.id) {
        classId = classRows[0].id;
        if (name !== item.className) {
          await pool.execute('UPDATE class_groups SET name = ? WHERE id = ?', [item.className, classId]);
        }
        break;
      }
    }
    if (!classId) {
      await pool.execute('INSERT INTO class_groups (name) VALUES (?)', [item.className]);
      const [classRows] = await pool.execute('SELECT id FROM class_groups WHERE name = ? LIMIT 1', [item.className]);
      classId = classRows[0]?.id;
    }
    const [userRows] = await pool.execute('SELECT id, role FROM users WHERE email = ? LIMIT 1', [item.email]);
    let userId = userRows[0]?.id;
    if (!userId) {
      const passwordHash = await hashPassword(item.password);
      const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, role, nickname) VALUES (?, ?, ?, ?)',
        [item.email, passwordHash, 'teacher', item.nickname]
      );
      userId = result.insertId;
      console.warn(`Created teacher account: ${item.email}`);
    } else if (userRows[0].role !== 'admin') {
      await pool.execute('UPDATE users SET role = ?, nickname = ? WHERE id = ?', ['teacher', item.nickname, userId]);
    }
    if (classId && userId) {
      await pool.execute('INSERT IGNORE INTO class_teachers (class_id, user_id) VALUES (?, ?)', [classId, userId]);
    }
  }
};

const hashInviteCode = (code) => crypto
  .createHash('sha256')
  .update(String(code || '').trim().replace(/\s+/g, '').toUpperCase())
  .digest('hex');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SIMPLE_INVITE_CODE = /^[A-Z]{3}\d{4}$/;

const createStudentInviteCode = () => {
  let letters = '';
  for (let index = 0; index < 3; index += 1) {
    letters += LETTERS[crypto.randomInt(0, LETTERS.length)];
  }
  return `${letters}${String(crypto.randomInt(0, 10000)).padStart(4, '0')}`;
};

const insertInviteCode = async (pool, { className, nickname, studentNo }) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const inviteCode = createStudentInviteCode();
    const codeHash = hashInviteCode(inviteCode);
    try {
      const [result] = await pool.execute(
        `INSERT INTO invite_codes (code_hash, label, max_uses, status)
         VALUES (?, ?, 1, 'active')`,
        [codeHash, `${className} ${nickname} ${studentNo}`]
      );
      return { inviteCode, inviteId: result.insertId };
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
    }
  }
  throw new Error(`Failed to create invite code for student ${studentNo}`);
};

const cleanupImportedStudentAccounts = async (pool) => {
  const [result] = await pool.execute(
    "DELETE FROM users WHERE role = 'student' AND (email LIKE '%@student.local' OR email LIKE '%@class.local' OR email = 'seed@local.test')"
  );
  if (result.affectedRows) {
    console.warn(`Removed ${result.affectedRows} previously imported student accounts.`);
  }
};

const seedClassRoster = async (pool) => {
  const rosterPath = path.join(rootDir, 'scripts', 'seed-class-students.json');
  if (!fs.existsSync(rosterPath)) return;

  const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
  if (!Array.isArray(roster) || !roster.length) return;

  const exportDir = path.join(rootDir, 'server', 'data');
  fs.mkdirSync(exportDir, { recursive: true });
  const exportPath = path.join(exportDir, 'student-invite-codes.txt');
  const lines = ['班级\t学号\t姓名\t邀请码'];
  let createdRoster = 0;
  let createdInvites = 0;
  let refreshedInvites = 0;

  for (const item of roster) {
    const className = String(item.className || '').trim();
    const studentNo = String(item.studentNo || '').trim();
    const nickname = String(item.name || '').trim();
    if (!className || !studentNo || !nickname) continue;

    const originProvince = item.originProvince ? String(item.originProvince).trim() : null;
    const gaokaoScore = Number.isFinite(Number(item.gaokaoScore)) ? Number(item.gaokaoScore) : null;
    const gaokaoMath = Number.isFinite(Number(item.gaokaoMath)) ? Number(item.gaokaoMath) : null;
    const gaokaoChinese = Number.isFinite(Number(item.gaokaoChinese)) ? Number(item.gaokaoChinese) : null;
    const gaokaoEnglish = Number.isFinite(Number(item.gaokaoEnglish)) ? Number(item.gaokaoEnglish) : null;
    const initialRank = Number.isFinite(Number(item.initialRank)) ? Number(item.initialRank) : null;

    const [classRows] = await pool.execute('SELECT id FROM class_groups WHERE name = ? LIMIT 1', [className]);
    const classId = classRows[0]?.id;
    if (!classId) continue;

    const [existingRows] = await pool.execute('SELECT * FROM class_roster WHERE student_no = ? LIMIT 1', [studentNo]);
    if (existingRows[0]) {
      await pool.execute(
        `UPDATE class_roster
         SET class_id = ?, name = ?, origin_province = ?, gaokao_score = ?, gaokao_math = ?, gaokao_chinese = ?, gaokao_english = ?, initial_rank = ?
         WHERE id = ?`,
        [classId, nickname, originProvince, gaokaoScore, gaokaoMath, gaokaoChinese, gaokaoEnglish, initialRank, existingRows[0].id]
      );
      let inviteCode = String(existingRows[0].invite_code || '').trim().toUpperCase();
      if (!existingRows[0].user_id && !SIMPLE_INVITE_CODE.test(inviteCode)) {
        const created = await insertInviteCode(pool, { className, nickname, studentNo });
        inviteCode = created.inviteCode;
        await pool.execute(
          'UPDATE class_roster SET invite_code = ?, invite_code_id = ? WHERE id = ?',
          [inviteCode, created.inviteId, existingRows[0].id]
        );
        if (existingRows[0].invite_code_id) {
          await pool.execute(
            "DELETE FROM invite_codes WHERE id = ? AND used_count = 0",
            [existingRows[0].invite_code_id]
          );
        }
        createdInvites += 1;
        refreshedInvites += 1;
      }
      lines.push(`${className}\t${studentNo}\t${nickname}\t${inviteCode}`);
      continue;
    }

    const created = await insertInviteCode(pool, { className, nickname, studentNo });
    await pool.execute(
      `INSERT INTO class_roster (class_id, student_no, name, origin_province, gaokao_score, gaokao_math, gaokao_chinese, gaokao_english, initial_rank, invite_code, invite_code_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [classId, studentNo, nickname, originProvince, gaokaoScore, gaokaoMath, gaokaoChinese, gaokaoEnglish, initialRank, created.inviteCode, created.inviteId]
    );
    createdRoster += 1;
    createdInvites += 1;
    lines.push(`${className}\t${studentNo}\t${nickname}\t${created.inviteCode}`);
  }

  fs.writeFileSync(exportPath, `${lines.join('\n')}\n`, 'utf8');
  if (createdRoster || createdInvites || refreshedInvites) {
    console.warn(`Imported class roster: ${createdRoster} students, ${createdInvites} invite codes, refreshed ${refreshedInvites}.`);
    console.warn(`Plaintext invite codes written to ${exportPath}`);
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
      qq VARCHAR(20) NOT NULL DEFAULT '',
      student_no VARCHAR(32) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_users_email (email),
      UNIQUE KEY uk_users_student_no (student_no)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await ensureUserQqColumn(pool);
  await ensureUserStudentNoColumn(pool);

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
    CREATE TABLE IF NOT EXISTS invite_codes (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      code_hash CHAR(64) NOT NULL,
      label VARCHAR(120) NULL,
      max_uses INT UNSIGNED NOT NULL DEFAULT 1,
      used_count INT UNSIGNED NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      expires_at DATETIME NULL,
      created_by BIGINT UNSIGNED NULL,
      last_used_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_invite_codes_code_hash (code_hash),
      KEY idx_invite_codes_status_expires_at (status, expires_at),
      KEY idx_invite_codes_created_by (created_by),
      CONSTRAINT fk_invite_codes_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invite_code_redemptions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      invite_code_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      email VARCHAR(255) NOT NULL,
      first_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_invite_redemptions_code_email (invite_code_id, email),
      KEY idx_invite_redemptions_user_id (user_id),
      CONSTRAINT fk_invite_redemptions_code_id FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id) ON DELETE CASCADE,
      CONSTRAINT fk_invite_redemptions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    CREATE TABLE IF NOT EXISTS email_verifications (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      purpose VARCHAR(32) NOT NULL,
      code_hash CHAR(64) NOT NULL,
      ip VARCHAR(80) NULL,
      attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_email_verifications_email_purpose_created_at (email, purpose, created_at),
      KEY idx_email_verifications_expires_at (expires_at),
      KEY idx_email_verifications_used_at (used_at)
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

  const [deleteMarkedColumnRows] = await pool.execute("SHOW COLUMNS FROM posts LIKE 'delete_marked_at'");
  if (!deleteMarkedColumnRows.length) {
    await pool.query('ALTER TABLE posts ADD COLUMN delete_marked_at DATETIME NULL AFTER status');
  }
  const [deleteIndexRows] = await pool.execute("SHOW INDEX FROM posts WHERE Key_name = 'idx_posts_status_delete_marked_at'");
  if (!deleteIndexRows.length) {
    await pool.query('ALTER TABLE posts ADD KEY idx_posts_status_delete_marked_at (status, delete_marked_at)');
  }
  const [favoriteCountColumnRows] = await pool.execute("SHOW COLUMNS FROM posts LIKE 'favorite_count'");
  if (!favoriteCountColumnRows.length) {
    await pool.query('ALTER TABLE posts ADD COLUMN favorite_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER like_count');
  }

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
      like_count INT UNSIGNED NOT NULL DEFAULT 0,
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

  const [commentColumns] = await pool.query("SHOW COLUMNS FROM comments LIKE 'like_count'");
  if (!commentColumns.length) {
    await pool.query('ALTER TABLE comments ADD COLUMN like_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER content');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comment_likes (
      comment_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (comment_id, user_id),
      KEY idx_comment_likes_user_id (user_id),
      CONSTRAINT fk_comment_likes_comment_id FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
      CONSTRAINT fk_comment_likes_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    CREATE TABLE IF NOT EXISTS post_favorites (
      post_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id),
      KEY idx_post_favorites_user_id (user_id),
      CONSTRAINT fk_post_favorites_post_id FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT fk_post_favorites_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    UPDATE posts
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS favorite_total
      FROM post_favorites
      GROUP BY post_id
    ) favorite_counts ON favorite_counts.post_id = posts.id
    SET posts.favorite_count = COALESCE(favorite_counts.favorite_total, 0)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_feedback (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NULL,
      type VARCHAR(64) NOT NULL DEFAULT '其他',
      content TEXT NOT NULL,
      contact VARCHAR(120) NULL,
      page_url VARCHAR(500) NULL,
      user_agent VARCHAR(500) NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'open',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_site_feedback_status_created_at (status, created_at),
      KEY idx_site_feedback_user_id (user_id),
      CONSTRAINT fk_site_feedback_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_announcements (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      author_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(120) NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_class_announcements_created_at (created_at),
      KEY idx_class_announcements_author_id (author_id),
      CONSTRAINT fk_class_announcements_author_id FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_assignments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      author_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(120) NOT NULL,
      description TEXT NULL,
      due_at DATETIME NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'open',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_class_assignments_status_created_at (status, created_at),
      KEY idx_class_assignments_author_id (author_id),
      CONSTRAINT fk_class_assignments_author_id FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_submissions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      assignment_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      note VARCHAR(300) NOT NULL DEFAULT '',
      original_name VARCHAR(180) NOT NULL,
      stored_path VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120) NOT NULL DEFAULT 'application/octet-stream',
      file_size INT UNSIGNED NOT NULL DEFAULT 0,
      tier VARCHAR(16) NULL,
      score DECIMAL(5,2) NULL,
      rank_in_class INT UNSIGNED NULL,
      rank_gain INT NULL,
      feedback TEXT NULL,
      rubric_scores JSON NULL,
      ai_suggested_tier VARCHAR(16) NULL,
      ai_suggested_score DECIMAL(5,2) NULL,
      ai_evaluation JSON NULL,
      teacher_diagnostic_note TEXT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'submitted',
      graded_at DATETIME NULL,
      graded_by BIGINT UNSIGNED NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_class_submissions_assignment_user (assignment_id, user_id),
      KEY idx_class_submissions_user_id (user_id),
      KEY idx_class_submissions_status (status),
      CONSTRAINT fk_class_submissions_assignment_id FOREIGN KEY (assignment_id) REFERENCES class_assignments(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_submissions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_groups (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(80) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_class_groups_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_teachers (
      class_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (class_id, user_id),
      KEY idx_class_teachers_user_id (user_id),
      CONSTRAINT fk_class_teachers_class_id FOREIGN KEY (class_id) REFERENCES class_groups(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_teachers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_students (
      class_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (class_id, user_id),
      KEY idx_class_students_user_id (user_id),
      CONSTRAINT fk_class_students_class_id FOREIGN KEY (class_id) REFERENCES class_groups(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_students_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_roster (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      class_id BIGINT UNSIGNED NOT NULL,
      student_no VARCHAR(32) NOT NULL,
      name VARCHAR(80) NOT NULL,
      origin_province VARCHAR(64) NULL,
      gaokao_score DECIMAL(6,2) NULL,
      gaokao_math DECIMAL(6,2) NULL,
      gaokao_chinese DECIMAL(6,2) NULL,
      gaokao_english DECIMAL(6,2) NULL,
      initial_rank INT UNSIGNED NULL,
      invite_code VARCHAR(64) NOT NULL,
      invite_code_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NULL,
      claimed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_class_roster_student_no (student_no),
      UNIQUE KEY uk_class_roster_invite_code (invite_code),
      UNIQUE KEY uk_class_roster_invite_code_id (invite_code_id),
      UNIQUE KEY uk_class_roster_user_id (user_id),
      KEY idx_class_roster_class_id (class_id),
      CONSTRAINT fk_class_roster_class_id FOREIGN KEY (class_id) REFERENCES class_groups(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_roster_invite_code_id FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_roster_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS class_reminders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      assignment_id BIGINT UNSIGNED NOT NULL,
      teacher_id BIGINT UNSIGNED NOT NULL,
      roster_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NULL,
      class_id BIGINT UNSIGNED NOT NULL,
      student_name VARCHAR(80) NOT NULL,
      student_no VARCHAR(32) NOT NULL,
      message VARCHAR(500) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_class_reminders_assignment (assignment_id),
      KEY idx_class_reminders_user (user_id),
      KEY idx_class_reminders_roster (roster_id),
      KEY idx_class_reminders_class (class_id),
      CONSTRAINT fk_class_reminders_assignment FOREIGN KEY (assignment_id) REFERENCES class_assignments(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_reminders_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_reminders_roster FOREIGN KEY (roster_id) REFERENCES class_roster(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await ensureRosterColumns(pool);
  await ensureSubmissionColumns(pool);
  await ensureAssignmentAndAnnouncementClassId(pool);

  await seedDefaultClassTeachers(pool);
  await cleanupImportedStudentAccounts(pool);
  await seedClassRoster(pool);

  await pool.query('DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()');
  await pool.query('DELETE FROM login_attempts WHERE reset_at <= UTC_TIMESTAMP()');
  await pool.query("DELETE FROM email_verifications WHERE expires_at <= UTC_TIMESTAMP() OR used_at IS NOT NULL");
  await pool.query("DELETE FROM posts WHERE status = 'deleted' AND delete_marked_at <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)");
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
