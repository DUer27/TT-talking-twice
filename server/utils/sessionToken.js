const crypto = require('crypto');

const createSessionToken = () => crypto.randomBytes(32).toString('hex');

const hashSessionToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { createSessionToken, hashSessionToken };
