const pool = require('../config/database');

const Interaction = {
  async addInteraction(userId, resourceId, type) {
    const result = await pool.query(
      `INSERT INTO user_interactions (user_id, resource_id, interaction_type)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, resource_id, interaction_type, created_at`,
      [userId, resourceId, type]
    );
    return result.rows[0];
  },

  async getInteractionsByUser(userId) {
    const result = await pool.query(
      `SELECT id, resource_id, interaction_type, created_at
       FROM user_interactions WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  },

  async updateInteraction(interactionId, newType) {
    const result = await pool.query(
      `UPDATE user_interactions
       SET interaction_type = $1
       WHERE id = $2
       RETURNING id, user_id, resource_id, interaction_type, created_at`,
      [newType, interactionId]
    );
    return result.rows[0];
  },

  async deleteInteraction(interactionId) {
    await pool.query(
      `DELETE FROM user_interactions WHERE id = $1`,
      [interactionId]
    );
  }
};

module.exports = Interaction;