document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/user/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      window.location.href = 'login.html';
      return;
    }
    const user = await res.json();
    if (user.role !== 'admin') {
      alert('Acces interzis! Doar adminii pot intra aici.');
      window.location.href = 'login.html';
    }
  } catch (e) {
    window.location.href = 'login.html';
  }
});

document.querySelectorAll('a[href="admin.html"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const token = localStorage.getItem('token');
    if (!token) {
      e.preventDefault();
      window.location.href = 'login.html';
    }
  });
});


document.getElementById('tab-resurse').addEventListener('change', function() {
  document.getElementById('section-resurse').style.display = 'block';//vizibil
  document.getElementById('section-utilizatori').style.display = 'none';//ascuns
});
document.getElementById('tab-utilizatori').addEventListener('change', function() {
  document.getElementById('section-resurse').style.display = 'none';
  document.getElementById('section-utilizatori').style.display = 'block';
});

// Afiseaza formularul de adaugare doar daca e selectat "Adauga manual resurse"
document.getElementById('resource-actions').addEventListener('change', function() {
  document.getElementById('addResourceForm').style.display = this.value === 'add' ? 'block' : 'none';
});
// La incarcare, seteaza vizibilitatea corecta


// Exemplu: afiseaza lista useri doar cand e selectat "Listeaza useri"
document.getElementById('user-actions').addEventListener('change', function() {
  // Exemplu simplu: afiseaza doar lista useri la optiunea "list"
  document.getElementById('user-list').style.display = this.value === 'list' ? 'block' : 'none';
  // Aici poti adauga si alte actiuni pentru delete/role daca ai formulare dedicate
});
// La incarcare, seteaza vizibilitatea corecta
(function() {
  const select = document.getElementById('user-actions');
  document.getElementById('user-list').style.display = select.value === 'list' ? 'block' : 'none';
})();

document.getElementById('logout').addEventListener('click', function(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  window.location.href = 'index.html';
});
