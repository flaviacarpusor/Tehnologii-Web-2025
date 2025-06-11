// Incarca preferintele userului, ca sa stim ce-i place si ce nu suporta
async function loadPreferences() {
  const res = await fetch('http://localhost:3000/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  const ul = document.getElementById('preferences-list');
  ul.innerHTML = '';
  // Pentru fiecare preferinta, punem un rand in lista, ca la meniul zilei
  prefs.forEach(pref => {
    const li = document.createElement('li');
    li.textContent = `${pref.topic} (${pref.resource_type})`;
    ul.appendChild(li);
  });
}

// Cand apesi pe butonul de stergere, cauta preferinta si o sterge daca exista
document.getElementById('deletePreferenceBtn').onclick = async function() {
  const topic = document.querySelector('input[name="topic"]').value;
  const resourceType = document.querySelector('select[name="resourceType"]').value;
  
  // Luam toate preferintele, ca sa vedem daca exista ce vrea userul sa stearga
  const res = await fetch('http://localhost:3000/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  
  // Cautam preferinta dupa topic si tip
  const pref = prefs.find(p => p.topic === topic && p.resource_type === resourceType);
  if (pref) {
    // Daca o gasim, o stergem din baza de date (adio, preferinta!)
    await fetch(`http://localhost:3000/user/preferences?id=${pref.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    loadPreferences(); // Reincarcam lista, ca sa dispara din meniu
  } else {
    alert('Nu exista aceasta preferinta!'); // Daca nu gasim, il anuntam ca a visat
  }
};

// Cand userul vrea sa adauge o preferinta noua, verificam sa nu fie dublura si o adaugam
document.getElementById('preferencesForm').onsubmit = async function(e) {
  e.preventDefault();
  const topic = this.topic.value;
  const resourceType = this.resourceType.value;
  // Pregatim un div pentru mesaje, ca sa nu planga userul in gol
  const msgDiv = document.getElementById('preferences-message') || (() => {
    const d = document.createElement('div');
    d.id = 'preferences-message';
    d.style.marginTop = '0.5em';
    d.style.fontWeight = 'bold';
    this.parentNode.appendChild(d);
    return d;
  })();

  // Verificam daca preferinta exista deja, ca sa nu stranga dubluri ca la abtibilduri
  const res = await fetch('http://localhost:3000/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  if (prefs.some(p => p.topic === topic && p.resource_type === resourceType)) {
    msgDiv.textContent = 'Preferinta exista deja!';
    msgDiv.style.color = 'orange';
    return;
  }

  // Daca nu exista, trimitem POST si adaugam preferinta in baza de date
  const addRes = await fetch('http://localhost:3000/user/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ topic, resource_type: resourceType })
  });

  if (addRes.ok) {
    msgDiv.textContent = 'Preferinta a fost adaugata cu succes!';
    msgDiv.style.color = 'green';
    this.reset();
    loadPreferences(); // Reincarcam lista, ca sa vedem preferinta noua
    loadRecommendations(); // Si poate primim recomandari noi
  } else {
    const data = await addRes.json();
    msgDiv.textContent = data.error || 'Eroare la adaugare preferinta!';
    msgDiv.style.color = 'red';
  }
};

// Incarca datele userului in profil, ca sa stie cine e la butoane
async function loadProfile() {
  const res = await fetch('http://localhost:3000/user/profile', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  if (!res.ok) {
    window.location.href = 'login.html'; // Daca nu e logat, il trimitem la login
    return;
  }
  const user = await res.json();
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-role').textContent = user.role === 'admin' ? 'Administrator' : 'Utilizator';
}

// Cand userul vrea sa-si schimbe parola, verificam si trimitem la backend
document.getElementById('passwordChangeForm').onsubmit = async function(e) {
  e.preventDefault();

  // Luam parolele din formular, ca la banc
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const messageDiv = document.getElementById('password-message'); // Aici afisam mesajul

  if (!oldPassword || !newPassword) {
    messageDiv.textContent = 'Parola veche si parola noua sunt obligatorii!';
    messageDiv.style.color = 'red';
    return;
  }

  // Trimitem la backend cererea de schimbare parola
  const res = await fetch('http://localhost:3000/user/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });

  const data = await res.json();
  if (res.ok) {
    messageDiv.textContent = 'Parola a fost schimbata cu succes!';
    messageDiv.style.color = 'green';
    e.target.reset(); // Resetam formularul, ca sa nu ramana datele pe ecran
  } else {
    messageDiv.textContent = data.error || 'Eroare la schimbarea parolei!';
    messageDiv.style.color = 'red';
  }
};

// Daca suntem pe pagina de profil, incarcam automat datele userului si preferintele
if (window.location.pathname.includes('profile.html')) {
  loadProfile();
  loadPreferences();
  loadRecommendations();
}

// Cand apesi pe logout, stergem token-ul si te trimitem acasa, ca la final de petrecere
document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('logoutBtn');
  if (!btnLogout) return;

  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');   // Stergem token-ul, ca sa nu mai poata intra nimeni
    window.location.replace('index.html'); // Te trimitem pe prima pagina
  });
});

// Incarca recomandarile pentru user, ca sa nu se plictiseasca
async function loadRecommendations() {
  const res = await fetch('http://localhost:3000/resources/recommendations', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  if (!res.ok) {
    document.getElementById('profile-results').textContent = 'Nu exista recomandari.';
    return;
  }
  const data = await res.json();
  const results = document.getElementById('profile-results');
  results.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    results.innerHTML = '<p>Nu exista recomandari pe baza preferintelor tale.</p>';
    return;
  }

  // Grupam recomandarile pe tipuri, ca la rafturile din supermarket
  const typeOrder = ['news', 'video', 'image', 'document'];
  const groupedByType = {};
  typeOrder.forEach(type => groupedByType[type] = {});

  data.forEach(item => {
    if (!groupedByType[item.type]) return;
    if (!groupedByType[item.type][item.source]) groupedByType[item.type][item.source] = [];
    groupedByType[item.type][item.source].push(item);
  });

  // Facem gridul cu recomandari, ca pe index, dar pentru profilul userului
  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.gap = '2em';
  grid.style.flexWrap = 'wrap';

  typeOrder.forEach(type => {
    if (!groupedByType[type]) return;
    Object.entries(groupedByType[type]).forEach(([source, items]) => {
      // Sortam stirile din fiecare sursa dupa data, ca sa fie cele mai noi primele
      items.sort((a, b) => new Date(b.import_date) - new Date(a.import_date));

      // Facem o coloana pentru fiecare sursa, ca la rafturile din supermarket
      const col = document.createElement('div');
      col.className = 'source-column';
      col.innerHTML = `
        <div class="source-header">
          ${source} <span style="font-size:0.8em;font-weight:normal;background:#eee;color:#222;padding:0.2em 0.7em;border-radius:5px;margin-left:0.7em;">${type}</span>
        </div>
        <ul class="source-list"></ul>
      `;
      const ul = col.querySelector('.source-list');
      // Punem fiecare stire ca un link in lista, ca sa poata da click userul si sa plece direct pe site-ul sursa
      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${item.url}" target="_blank">${item.title}</a>`;
        ul.appendChild(li);
      });
      // Adaugam coloana in grid
      grid.appendChild(col);
    });
  });

  // La final, punem gridul in pagina, ca sa vada userul toate recomandarile lui
  results.appendChild(grid);
}

