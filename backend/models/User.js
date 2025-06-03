const pool = require('../config/database');

const User = {
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT id, password_hash, role FROM users WHERE username=$1',
      [username]
    );
    return result.rows[0];
  },

  async create({ username, email, password_hash }) {
    const result = await pool.query(
      `INSERT INTO users(username, email, password_hash)
       VALUES($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email, password_hash]
    );
    return result.rows[0];
  }
};

module.exports = User;