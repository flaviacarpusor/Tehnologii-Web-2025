const params = new URLSearchParams(window.location.search);
const token = params.get('token');

document.getElementById('resetForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('reset-message').textContent = data.message;
      document.getElementById('reset-message').style.color = data.success ? 'green' : 'red';
    });
});