const pool = require('../config/database');

const Resource = {
  async findAllByType(type) {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE type = $1 AND visibility = 'public'
       ORDER BY import_date DESC
       LIMIT 50`,
      [type]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create({ type, title, url, description, topic, keywords, visibility }) {
    const result = await pool.query(
      `INSERT INTO resources(type, title, url, description, topic, keywords, visibility)
       VALUES($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, title, url, description, topic, keywords, visibility, import_date`,
      [type, title, url, description, topic, keywords, visibility]
    );
    return result.rows[0];
  },

  async update(id, { type, title, url, description, topic, keywords, visibility }) {
    const result = await pool.query(
      `UPDATE resources
       SET type = $1, title = $2, url = $3, description = $4, topic = $5, keywords = $6, visibility = $7
       WHERE id = $8
       RETURNING id, type, title, url, description, topic, keywords, visibility, import_date`,
      [type, title, url, description, topic, keywords, visibility, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM resources
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    return result.rows[0];
  },

  async searchByKeyword(keyword) {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE visibility = 'public'
         AND (
           title ILIKE $1 OR
           description ILIKE $1 OR
           topic ILIKE $1 OR
           keywords ILIKE $1
         )
       ORDER BY import_date DESC
       LIMIT 50`,
      [`%${keyword}%`]
    );
    return result.rows;
  },

  async findByTopic(topic) {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE (
          topic ILIKE $1 OR
          title ILIKE $1 OR
          description ILIKE $1 OR
          keywords ILIKE $1
        )
        AND visibility = 'public'
       ORDER BY import_date DESC
       LIMIT 50`,
      [`%${topic}%`]
    );
    return result.rows;
  },

  async findByTopicsAndTypes(topics, types) {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE visibility = 'public'
         AND topic = ANY($1)
         AND type = ANY($2)
       ORDER BY import_date DESC
       LIMIT 50`,
      [topics, types]
    );
    return result.rows;
  },

  async findByTopicAndType(topic, type) {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE (
          topic ILIKE $1 OR
          title ILIKE $1 OR
          description ILIKE $1 OR
          keywords ILIKE $1
        )
        AND type = $2
        AND visibility = 'public'
       ORDER BY import_date DESC
       LIMIT 50`,
      [`%${topic}%`, type]
    );
    return result.rows;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT id, type, title, url, description, topic, keywords, visibility, import_date, source, homepage
       FROM resources
       WHERE visibility = 'public'
       ORDER BY import_date DESC`
    );
    return result.rows;
  },


};

module.exports = Resource;
