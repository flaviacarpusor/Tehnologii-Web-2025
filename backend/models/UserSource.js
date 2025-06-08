const pool = require('../config/database');

// Model pentru surse (RSS/API-uri publice)
const UserSource = {
  // Returnează toate sursele publice active
  async getPublic() {
    const result = await pool.query(
      `SELECT id, source_url, source_type, source_name
       FROM user_sources
       WHERE user_id IS NULL AND active = true`
    );
    return result.rows;
  }
};

module.exports = UserSource;