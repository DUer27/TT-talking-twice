const path = require('path');

const rootDir = path.join(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT || 5173),
  rootDir,
  databasePath: process.env.DATABASE_PATH || path.join(rootDir, 'server', 'data', 'database.json'),
  sessionCookieName: 'campus_voice_session',
  sessionMaxAgeMs: 1000 * 60 * 60 * 24 * 7,
};
