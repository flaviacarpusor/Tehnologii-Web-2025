const pool = require('../config/database');

// model pentru preferintele userului
const UserPreference = {
  // ia toate preferintele unui user
  async getByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, resource_type, topic
       FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  },

  // adauga o preferinta noua
  async add(userId, resourceType, topic) {
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, resource_type, topic)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, resource_type, topic`,
      [userId, resourceType, topic]
    );
    return result.rows[0];
  },

  // sterge o preferinta
  async remove(userId, preferenceId) {
    await pool.query(
      `DELETE FROM user_preferences WHERE id = $1 AND user_id = $2`,
      [preferenceId, userId]
    );
  },

  // verifica daca userul are deja o preferinta cu acelasi topic si tip
  async getByUserAndTopicAndType(userId, topic, resourceType) {
    const result = await pool.query(
      `SELECT id, user_id, resource_type, topic
       FROM user_preferences
       WHERE user_id = $1 AND topic = $2 AND resource_type = $3`,
      [userId, topic, resourceType]
    );
    return result.rows[0] || null;
  },
};

module.exports = UserPreference;