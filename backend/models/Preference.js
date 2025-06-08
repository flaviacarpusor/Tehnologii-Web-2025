const pool = require('../config/database');

const UserPreference = {
  async getByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, resource_type, topic, weight, created_at
       FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  },

  async add(userId, resourceType, topic) {
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, resource_type, topic)
       VALUES ($1, $2, $3)
       RETURNING id, resource_type, topic`,
      [userId, resourceType, topic]
    );
    return result.rows[0];
  },

  async remove(userId, preferenceId) {
    await pool.query(
      `DELETE FROM user_preferences WHERE id = $1 AND user_id = $2`,
      [preferenceId, userId]
    );
  },

  async updateWeight(preferenceId, userId, newWeight) {
    const result = await pool.query(
      `UPDATE user_preferences
       SET weight = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, resource_type, topic, weight`,
      [newWeight, preferenceId, userId]
    );
    return result.rows[0];
  }
};

module.exports = UserPreference;