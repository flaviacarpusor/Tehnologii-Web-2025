document.getElementById('registerForm').addEventListener('submit', function(e) {
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
    e.preventDefault();
    return;
  }
  if (!isStrongPassword(password)) {
    msg.textContent = "Parola trebuie să aibă minim 8 caractere, o majusculă, o cifră și un caracter special!";
    e.preventDefault();
    return;
  }
  if (password !== confirm) {
    msg.textContent = "Parolele nu coincid!";
    e.preventDefault();
    return;
  }
  msg.textContent = "";
});