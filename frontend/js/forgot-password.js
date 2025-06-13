document.getElementById('forgotForm').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const msg = document.getElementById('forgot-message');
  msg.textContent = '';
  try {
    const res = await fetch('http://localhost:3000/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      msg.textContent = 'Verifică emailul pentru parola temporară!';
      msg.style.color = 'green';
    } else {
      msg.textContent = data.error || 'Eroare la trimitere!';
      msg.style.color = 'red';
    }
  } catch {
    msg.textContent = 'Eroare la conectarea cu serverul!';
    msg.style.color = 'red';
  }
};