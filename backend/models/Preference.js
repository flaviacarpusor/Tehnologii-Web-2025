const pool = require('../config/database');

// aici avem un fel de "butoane" pentru preferintele userului, ca sa nu ne plictisim
const UserPreference = {
  // ia toate preferintele unui user, ca sa stim ce-i place omului
  async getByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, resource_type, topic
       FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    return result.rows; // returneaza lista cu preferintele, ca la supermarket
  },

  // adauga o preferinta noua, ca atunci cand descoperi ca-ti place sushi
  async add(userId, resourceType, topic) {
    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, resource_type, topic)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, resource_type, topic`,
      [userId, resourceType, topic]
    );
    return result.rows[0]; // returneaza preferinta proaspat adaugata, ca painea calda
  },

  // sterge o preferinta, gen cand te razgandesti si nu mai vrei broccoli
  async remove(userId, preferenceId) {
    await pool.query(
      `DELETE FROM user_preferences WHERE id = $1 AND user_id = $2`,
      [preferenceId, userId]
    );
    // nu returneaza nimic, ca si cand ai aruncat la gunoi si nu te mai uiti inapoi
  },

  // verifica daca userul are deja o preferinta cu acelasi topic si tip (ca sa nu stranga dubluri ca la abtibilduri)
  async getByUserAndTopicAndType(userId, topic, resourceType) {
    const result = await pool.query(
      `SELECT id, user_id, resource_type, topic
       FROM user_preferences
       WHERE user_id = $1 AND topic = $2 AND resource_type = $3`,
      [userId, topic, resourceType]
    );
    // daca gaseste ceva, returneaza primul (ca la loto, primul castiga), altfel returneaza null
    return result.rows[0] || null;
  },
};

// exportam ca sa poata folosi si altii minunatiile astea
module.exports = UserPreference;