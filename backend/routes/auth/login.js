const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { createJWT, verifyPassword } = require('../../middleware/auth');

// parseaza body-ul requestului
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
  // parseaza body-ul json
  parseBody(req, async (err, body) => {
    if (err) {
      // body invalid
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Body invalid' }));
    }
    const { username, password } = body;
    // verifica campuri obligatorii
    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'username si password sunt obligatorii' }));
    }
    try {
      // cauta user in baza de date
      const user = await User.findByUsername(username);
      // user inexistent
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'User sau parola incorecte' }));
      }
      // verifica parola
      const match = verifyPassword(password, user.password_hash);
      if (!match) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'User sau parola incorecte' }));
      }
      // autentificare reusita, genereaza token
      const token = createJWT({ id: user.id, username: user.username });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Login reusit', userId: user.id, token }));
    } catch (e) {
      // eroare server
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare server' }));
    }
  });
}

module.exports = handleLogin;