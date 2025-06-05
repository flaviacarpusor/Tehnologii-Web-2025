// Simulare: datele utilizatorului
const user = {
  username: "popescu.ion",
  email: "ion.popescu@email.com",
  role: "Utilizator"
};

// Completeaza automat datele personale
document.getElementById('profile-username').textContent = user.username;
document.getElementById('profile-email').textContent = user.email;
document.getElementById('profile-role').textContent = user.role;

// schimb passw
document.getElementById('toggle-password-change').onclick = function() {
  const section = document.getElementById('password-change-section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
};