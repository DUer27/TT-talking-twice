const { getPool } = require('../database/connection');

const findInviteByCodeHash = async (codeHash) => {
  const [rows] = await getPool().execute(
    'SELECT * FROM invite_codes WHERE code_hash = ? LIMIT 1',
    [codeHash]
  );
  return rows[0] || null;
};

const redeemInviteCode = async ({ codeHash, email, userId }) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [inviteRows] = await connection.execute(
      'SELECT * FROM invite_codes WHERE code_hash = ? LIMIT 1 FOR UPDATE',
      [codeHash]
    );
    const invite = inviteRows[0];
    if (!invite) {
      await connection.rollback();
      return { ok: false, reason: 'not_found' };
    }

    if (invite.status !== 'active') {
      await connection.rollback();
      return { ok: false, reason: 'disabled' };
    }

    if (invite.expires_at && new Date(invite.expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      return { ok: false, reason: 'expired' };
    }

    const [redemptionRows] = await connection.execute(
      'SELECT id FROM invite_code_redemptions WHERE invite_code_id = ? AND email = ? LIMIT 1',
      [invite.id, email]
    );

    if (redemptionRows.length) {
      await connection.execute(
        'UPDATE invite_code_redemptions SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?',
        [redemptionRows[0].id]
      );
      await connection.commit();
      return { ok: true, invite, alreadyRedeemed: true };
    }

    if (Number(invite.used_count || 0) >= Number(invite.max_uses || 1)) {
      await connection.rollback();
      return { ok: false, reason: 'used_up' };
    }

    await connection.execute(
      'UPDATE invite_codes SET used_count = used_count + 1, last_used_at = CURRENT_TIMESTAMP WHERE id = ?',
      [invite.id]
    );
    await connection.execute(
      `INSERT INTO invite_code_redemptions (invite_code_id, user_id, email)
       VALUES (?, ?, ?)`,
      [invite.id, userId, email]
    );
    await connection.commit();
    return { ok: true, invite, alreadyRedeemed: false };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  findInviteByCodeHash,
  redeemInviteCode,
};
