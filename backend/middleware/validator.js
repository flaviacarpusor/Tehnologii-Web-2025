function validateRegister(req, res, next) {
  const { username, email, password } = req.body;

  // 1. Verificare câmpuri lipsă
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Câmpuri lipsă la înregistrare' });
  }

  // 2. Regex email simplu
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email invalid' });
  }

  // 3. Parolă “strong” (similar frontend)
  const upperCase = /[A-Z]/.test(password);
  const digit = /[0-9]/.test(password);
  const specialChar = /[^A-Za-z0-9]/.test(password);
  if (!(upperCase && digit && specialChar && password.length >= 8)) {
    return res.status(400).json({ error: 'Parola nu respectă criteriile de securitate' });
  }

  // Totul OK
  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Câmpuri lipsă la login' });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin
};