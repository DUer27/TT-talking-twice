const mysql = require('mysql2/promise');
const { db } = require('../config/env');

let pool;
let serverPool;

const commonOptions = {
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  waitForConnections: true,
  connectionLimit: db.connectionLimit,
  charset: 'utf8mb4',
};

const getServerPool = () => {
  if (!serverPool) serverPool = mysql.createPool(commonOptions);
  return serverPool;
};

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...commonOptions,
      database: db.database,
    });
  }
  return pool;
};

module.exports = {
  getPool,
  getServerPool,
};
