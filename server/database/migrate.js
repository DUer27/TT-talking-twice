const { db } = require('../config/env');
const { getPool, getServerPool } = require('./connection');

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
