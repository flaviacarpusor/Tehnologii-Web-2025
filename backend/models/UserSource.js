const pool = require('../config/database');

const UserSource = {
  async getByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, source_url, source_type, created_at
       FROM user_sources WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  },

  async add(userId, sourceUrl, sourceType) {
    const result = await pool.query(
      `INSERT INTO user_sources (user_id, source_url, source_type)
       VALUES ($1, $2, $3)
       RETURNING id, source_url, source_type`,
      [userId, sourceUrl, sourceType]
    );
    return result.rows[0];
  },

  async remove(userId, sourceId) {
    await pool.query(
      `DELETE FROM user_sources WHERE id = $1 AND user_id = $2`,
      [sourceId, userId]
    );
  }
};

module.exports = UserSource;