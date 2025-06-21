const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'schimba_aceasta_cheie';
const DOMAIN_NAME = "https://127.0.0.1";

// functie pentru generare jwt (de folosit la login)
function createJWT(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    iss: DOMAIN_NAME,
    nbf: now,
    exp: now + 2 * 60 * 60,
    userId: user.id, 
    userName: user.username
  };
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS512' });
}

// functie pentru extragere token din header
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  return authHeader && authHeader.split(' ')[1];
}

// middleware pentru verificare jwt
function verifyJWT(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Token lipsa' }));
  }
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'] }, (err, user) => {
    if (err) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Token invalid' }));
    }
    req.user = user;
    next(user);
  });
}

// functie pentru hash parola
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return `${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split('$');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return hash === originalHash;
}

module.exports = {
  createJWT,
  verifyJWT,
  extractToken,
  hashPassword,
  verifyPassword
};