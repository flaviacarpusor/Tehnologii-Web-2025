const crypto = require('crypto');
const User = require('../../models/User');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return `${salt}$${hash}`;
}

async function handleChangePassword(req, res, user) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { oldPassword, newPassword } = JSON.parse(body);
      if (!oldPassword || !newPassword) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Parola veche și parola nouă sunt obligatorii!' }));
      }

      const dbUser = await User.findById(user.userId);
      if (!dbUser) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Utilizatorul nu a fost găsit!' }));
      }

      const [salt, originalHash] = dbUser.password_hash.split('$');
      const hash = crypto.pbkdf2Sync(oldPassword, salt, 10000, 64, 'sha256').toString('hex');
      if (hash !== originalHash) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Parola veche este incorectă!' }));
      }

      // salveaza noua parola
      const newHash = hashPassword(newPassword);
      await User.updatePassword(user.userId, newHash);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Parola a fost schimbată cu succes!' }));
    } catch (e) {
      console.error('Eroare la schimbarea parolei:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare server' }));
    }
  });
}

module.exports = handleChangePassword;