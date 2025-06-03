document.getElementById('forgotForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('forgot-message').textContent = data.message;
      document.getElementById('forgot-message').style.color = data.success ? 'green' : 'red';
    });
});