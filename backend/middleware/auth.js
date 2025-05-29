const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'schimba_aceasta_cheie';

function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Token lipsa' }));
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Token invalid' }));
    }
    req.user = user;
    next();
  });
}

module.exports = verifyJWT;