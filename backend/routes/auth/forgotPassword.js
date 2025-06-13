const User = require('../../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { hashPassword } = require('../../middleware/auth');

async function handleForgotPassword(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { email } = JSON.parse(body);
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Email lipsă' }));
      }
      const user = await User.findByEmail(email);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Email inexistent' }));
      }

      // genereaza o parola temporara random
      const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const hash = hashPassword(tempPassword);

      // actualizeaza parola in baza de date
      await User.updatePassword(user.id, hash);

      // trimite parola prin email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'carpusorflavia02@gmail.com',
          pass: 'vqru wnix jxer jgwz'
        }
      });
      await transporter.sendMail({
        from: '"ReT" <carpusorflavia02@gmail.com>',
        to: email,
        subject: 'Resetare parolă',
        html: `<p>Parola ta temporară este: <b>${tempPassword}</b><br>
        Folosește această parolă pentru a te loga și schimb-o imediat din profil!</p>`
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Parolă temporară trimisă pe email!' }));
    } catch (e) {
      console.error('EROARE FORGOT PASSWORD:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Eroare server' }));
    }
  });
}

module.exports = { handleForgotPassword };