document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm-password').value;
  const msg = document.getElementById('register-message');

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isStrongPassword(password) {
    return /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password) &&
           password.length >= 8;
  }

  if (!isValidEmail(email)) {
    msg.textContent = "Email invalid!";
    return;
  }
  if (!isStrongPassword(password)) {
    msg.textContent = "Parola trebuie să aibă minim 8 caractere, o majusculă, o cifră și un caracter special!";
    return;
  }
  if (password !== confirm) {
    msg.textContent = "Parolele nu coincid!";
    return;
  }
  msg.textContent = "";

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    console.log('Răspuns server:', data);

    if (res.ok && data.success) {
      window.location.href = 'login.html';
    } else {
      msg.textContent = data.error || 'Eroare la înregistrare!';
    }
  } catch (err) {
    console.error('Eroare la cererea fetch:', err);
    msg.textContent = 'Eroare la conectarea cu serverul!';
  }
});