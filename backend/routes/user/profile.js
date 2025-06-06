const User = require('../../models/User');

async function handleProfile(req, res, user) {
  try {
    const result = await User.findById(user.userId);
    if (!result) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Utilizator inexistent' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      username: result.username,
      email: result.email,
      role: result.role
    }));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Eroare server' }));
  }
}

module.exports = handleProfile;