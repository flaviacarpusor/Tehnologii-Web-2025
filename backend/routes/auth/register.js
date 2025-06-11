const crypto = require('crypto');
const User = require('../../models/User');

function hashPassword(password) {
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

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isStrongPassword(password) {
  return typeof password === 'string' &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    password.length >= 8;
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
    if (!isValidEmail(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Email invalid' }));
    }
    if (!isStrongPassword(password)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Parola trebuie sa aiba minim 8 caractere, o majuscula, o cifra si un caracter special' }));
    }
    const hash = hashPassword(password);
    try {
      const user = await User.create({ username, email, password_hash: hash });
      res.writeHead(201);
      res.end();
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