const fs = require('fs/promises');
const path = require('path');
const { databasePath } = require('../config/env');

const defaultDatabase = () => ({
  meta: {
    nextUserId: 1,
    nextSessionId: 1,
  },
  users: [],
  sessions: [],
  loginAttempts: [],
});

const ensureDatabase = async () => {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  try {
    await fs.access(databasePath);
  } catch (_error) {
    await fs.writeFile(databasePath, JSON.stringify(defaultDatabase(), null, 2));
  }
};

const readDatabase = async () => {
  await ensureDatabase();
  const raw = await fs.readFile(databasePath, 'utf8');
  return raw.trim() ? JSON.parse(raw) : defaultDatabase();
};

const writeDatabase = async (database) => {
  await fs.writeFile(databasePath, JSON.stringify(database, null, 2));
};

let queue = Promise.resolve();

const updateDatabase = async (updater) => {
  const run = async () => {
    const database = await readDatabase();
    const result = await updater(database);
    await writeDatabase(database);
    return result;
  };

  queue = queue.then(run, run);
  return queue;
};

module.exports = {
  readDatabase,
  updateDatabase,
  writeDatabase,
};
