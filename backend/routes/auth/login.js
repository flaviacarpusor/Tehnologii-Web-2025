const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { createJWT } = require('../../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'schimba_aceasta_cheie';

function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split('$');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return hash === originalHash;
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

async function handleLogin(req, res) {
  // Parsează corpul request-ului (body-ul JSON trimis de client)
  parseBody(req, async (err, body) => {
    if (err) {
      // Dacă body-ul nu e valid JSON, răspunde cu eroare 400
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Body invalid' }));
    }
    const { username, password } = body;
    // Verifică dacă ambele câmpuri sunt prezente
    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'username si password sunt obligatorii' }));
    }
    try {
      // Caută utilizatorul în baza de date după username
      const user = await User.findByUsername(username);
      // Dacă nu există userul, răspunde cu eroare 401 (neautorizat)
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'User sau parola incorecte' }));
      }
      // Verifică dacă parola introdusă corespunde cu hash-ul din baza de date
      const match = verifyPassword(password, user.password_hash);
      if (!match) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'User sau parola incorecte' }));
      }
      // Dacă autentificarea reușește, generează un token JWT cu datele userului
      const token = createJWT({ id: user.id, username: user.username });
      // Trimite răspuns cu succes, userId și token-ul JWT
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Login reusit', userId: user.id, token }));
    } catch (e) {
      // Dacă apare o eroare la interogarea bazei de date sau altceva, răspunde cu 500
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare server' }));
    }
  });
}

module.exports = handleLogin;