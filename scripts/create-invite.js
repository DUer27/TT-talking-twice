const crypto = require('crypto');
const { getPool } = require('../server/database/connection');

const normalizeInviteCode = (value) => String(value || '').trim().replace(/\s+/g, '').toUpperCase();
const hashInviteCode = (code) => crypto.createHash('sha256').update(normalizeInviteCode(code)).digest('hex');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = { maxUses: 1, label: '', expiresAt: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--code') options.code = args[index += 1];
    else if (arg === '--max-uses') options.maxUses = Number(args[index += 1]);
    else if (arg === '--label') options.label = args[index += 1] || '';
    else if (arg === '--expires-at') options.expiresAt = args[index += 1] || null;
  }
  return options;
};

const createRandomCode = () => `TT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const main = async () => {
  const options = parseArgs();
  const code = normalizeInviteCode(options.code || createRandomCode());
  const maxUses = Math.max(1, Math.min(Number(options.maxUses) || 1, 10000));
  const expiresAt = options.expiresAt ? new Date(options.expiresAt) : null;

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new Error('expires-at 时间格式不正确，例如：2026-12-31T23:59:59');
  }

  await getPool().execute(
    `INSERT INTO invite_codes (code_hash, label, max_uses, status, expires_at)
     VALUES (?, ?, ?, 'active', ?)
     ON DUPLICATE KEY UPDATE label = VALUES(label), max_uses = VALUES(max_uses), status = 'active', expires_at = VALUES(expires_at)`,
    [hashInviteCode(code), options.label || '手动创建邀请码', maxUses, expiresAt ? expiresAt.toISOString().slice(0, 19).replace('T', ' ') : null]
  );

  console.log('邀请码已创建：');
  console.log(code);
  console.log(`最大使用次数：${maxUses}`);
  console.log(`过期时间：${expiresAt ? expiresAt.toISOString() : '不过期'}`);
  process.exit(0);
};

main().catch((error) => {
  console.error('创建邀请码失败：', error.message);
  process.exit(1);
});
