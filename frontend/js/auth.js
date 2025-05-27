
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const resp = await fetch('../backend/api/auth/login.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, password})
      });
      const data = await resp.json();
      document.getElementById('status').innerText = data.message;
      if (data.success) {
        window.location.href = 'index.html';
      }
    });
  }

  const regForm = document.getElementById('regForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const resp = await fetch('../backend/api/auth/register.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, password})
      });
      const data = await resp.json();
      document.getElementById('status').innerText = data.message;
      if (data.success) {
        window.location.href = 'login.html';
      }
    });
  }
});
