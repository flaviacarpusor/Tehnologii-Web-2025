// Afiseaza sectiunea corecta in functie de tabul selectat
document.getElementById('tab-resurse').addEventListener('change', function() {
  document.getElementById('section-resurse').style.display = 'block';
  document.getElementById('section-utilizatori').style.display = 'none';
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
(function() {
  const select = document.getElementById('resource-actions');
  document.getElementById('addResourceForm').style.display = select.value === 'add' ? 'block' : 'none';
})();

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
