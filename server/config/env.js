const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const rootDir = path.join(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT || 5173),
  rootDir,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'tt_talking_twice',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },
  sessionCookieName: 'campus_voice_session',
  sessionMaxAgeMs: 1000 * 60 * 60 * 24 * 7,
};
