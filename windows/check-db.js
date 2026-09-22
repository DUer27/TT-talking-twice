/**
 * Database connectivity verification script for TT-talking-twice
 * Reads config from .env (or environment variables) and tests MySQL connectivity.
 * Outputs JSON result to stdout for parsing by PowerShell or node scripts.
 */
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Simple .env parser in case dotenv is not yet loaded or user wants raw values
const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
};

const fileEnv = parseEnvFile(envPath);

const dbConfig = {
  host: process.env.DB_HOST || fileEnv.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || fileEnv.DB_PORT || 3306),
  user: process.env.DB_USER || fileEnv.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (fileEnv.DB_PASSWORD || ''),
  database: process.env.DB_NAME || fileEnv.DB_NAME || 'tt_talking_twice',
  connectTimeout: 5000,
};

async function main() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (err) {
    console.log(JSON.stringify({
      ok: false,
      code: 'MODULE_NOT_FOUND',
      message: 'mysql2 模块未安装，请先执行 npm install',
    }));
    process.exit(1);
  }

  let connection;
  try {
    // 1. Connect without selecting database to verify credentials & server reachability
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: dbConfig.connectTimeout,
    });

    // 2. Query version
    const [versionRows] = await connection.query('SELECT VERSION() as ver');
    const serverVersion = versionRows && versionRows[0] ? versionRows[0].ver : 'unknown';

    // 3. Check if database exists
    const [dbRows] = await connection.query('SHOW DATABASES LIKE ?', [dbConfig.database]);
    const databaseExists = Array.isArray(dbRows) && dbRows.length > 0;

    await connection.end();

    console.log(JSON.stringify({
      ok: true,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      databaseExists,
      serverVersion,
      message: databaseExists
        ? `成功连接到 MySQL (${serverVersion})，数据库 [${dbConfig.database}] 已存在`
        : `成功连接到 MySQL (${serverVersion})，数据库 [${dbConfig.database}] 尚未创建（启动时将自动创建）`,
    }));
    process.exit(0);
  } catch (err) {
    if (connection) {
      try { await connection.end(); } catch (_) {}
    }

    let friendlyMessage = err.message;
    if (err.code === 'ECONNREFUSED') {
      friendlyMessage = `无法连接到 MySQL 服务 (${dbConfig.host}:${dbConfig.port})，请确认 MySQL 服务已启动`;
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      friendlyMessage = `MySQL 认证失败：用户 "${dbConfig.user}" 密码错误或无访问权限，请检查 .env 中的 DB_USER 与 DB_PASSWORD`;
    } else if (err.code === 'ETIMEDOUT') {
      friendlyMessage = `连接 MySQL 服务 (${dbConfig.host}:${dbConfig.port}) 超时，请检查网络或防火墙设置`;
    } else if (err.code === 'ENOTFOUND') {
      friendlyMessage = `找不到数据库主机名 "${dbConfig.host}"，请检查 .env 中的 DB_HOST`;
    }

    console.log(JSON.stringify({
      ok: false,
      code: err.code || 'UNKNOWN_ERROR',
      errno: err.errno,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      message: friendlyMessage,
      rawError: err.message,
    }));
    process.exit(1);
  }
}

main();
