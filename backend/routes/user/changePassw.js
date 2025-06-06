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
        return res.end(JSON.stringify({ error: 'Date lipsa' }));
      }
      const dbUser = await User.findById(user.userId);
      console.log('dbUser:', dbUser); 
      const [salt, originalHash] = dbUser.password_hash.split('$');
      const hash = crypto.pbkdf2Sync(oldPassword, salt, 10000, 64, 'sha256').toString('hex');
      if (hash !== originalHash) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Parola veche incorecta' }));
      }
      // Salveaza noua parola
      const newHash = hashPassword(newPassword);
      await User.updatePassword(user.userId, newHash);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Parola schimbata cu succes' }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare la schimbare parola' }));
    }
  });
}

module.exports = handleChangePassword;