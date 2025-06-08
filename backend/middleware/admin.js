const User = require('../models/User');

async function verifyAdmin(req, res, next) {
  if (!req.user || !req.user.userId) {
    // user lipsă sau token invalid
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Neautorizat' }));
  }

  // Găsește user-ul în DB și verifică rolul
  const dbUser = await User.findById(req.user.userId);
  if (!dbUser || dbUser.role !== 'admin') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Acces interzis' }));
  }

  // Dacă rolul e “admin”, mergem mai departe
  next();
}

module.exports = { verifyAdmin };