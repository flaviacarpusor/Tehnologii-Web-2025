
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('login-error');

  msg.textContent = "";

  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem('token', data.token);

    const profileRes = await fetch('http://localhost:3000/user/profile', {
      headers: { 'Authorization': 'Bearer ' + data.token }
    });
    const profile = await profileRes.json();

    if (profile.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'profile.html';
    }
  } else {
    msg.textContent = data.error || 'Eroare la autentificare!';
  }
});
