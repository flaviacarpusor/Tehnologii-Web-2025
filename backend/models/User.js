const pool = require('../config/database');

const User = {
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT id, password_hash, role FROM users WHERE username=$1',
      [username]
    );
    return result.rows[0];
  },

  async findByUsernameOrEmail(username, email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    return result.rows[0]; // Returnează utilizatorul dacă există
  },

  async create({ username, email, password_hash }) {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updatePassword(id, newHash) {
    await pool.query(
      'UPDATE users SET password_hash=$1 WHERE id=$2',
      [newHash, id]
    );
  },

  async getAll() {
    const result = await pool.query('SELECT id, username, email, role, created_at FROM users');
    return result.rows;
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },

  async updateRole(id, role) {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
  },
};

module.exports = User;