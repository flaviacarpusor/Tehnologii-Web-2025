const { Pool } = require('pg');
const crypto = require('crypto');
const pool = require('../../config/database');

const SALT_ROUNDS = 10;

function hashPassword(password, saltRounds = SALT_ROUNDS) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return `${salt}$${hash}`;
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      callback(null, JSON.parse(body));
    } catch (e) {
      callback(e);
    }
  });
}

async function handleRegister(req, res) {
  parseBody(req, async (err, body) => {
    if (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Body invalid' }));
    }
    const { username, email, password } = body;
    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'username si password sunt obligatorii' }));
    }
    const hash = hashPassword(password);
    try {
      const result = await pool.query(
        `INSERT INTO users(username,email,password_hash) 
         VALUES($1,$2,$3) 
         RETURNING id, username, email, created_at`,
        [username, email, hash]
      );
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.rows[0]));
    } catch (e) {
      if (e.code === '23505') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Username sau email deja folosit' }));
      }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare server' }));
    }
  });
}


module.exports = handleRegister;