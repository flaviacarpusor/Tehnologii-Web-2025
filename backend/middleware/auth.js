const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'schimba_aceasta_cheie';
const DOMAIN_NAME = "https://127.0.0.1";

// Functie pentru generare JWT (de folosit la login)
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

// Functie pentru extragere token din header
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  return authHeader && authHeader.split(' ')[1];
}

// Middleware pentru verificare JWT
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

module.exports = {
  createJWT,
  verifyJWT,
  extractToken
};