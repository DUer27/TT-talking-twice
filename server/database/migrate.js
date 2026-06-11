const { readDatabase, writeDatabase } = require('./connection');

const migrate = async () => {
  const database = await readDatabase();
  database.meta ||= {};
  database.users ||= [];
  database.sessions ||= [];
  database.meta.nextUserId ||= database.users.length + 1;
  database.meta.nextSessionId ||= database.sessions.length + 1;
  database.sessions = database.sessions.filter(
    (session) => new Date(session.expires_at).getTime() > Date.now()
  );
  await writeDatabase(database);
};

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Database migration completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
