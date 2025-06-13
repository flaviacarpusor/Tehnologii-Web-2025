// incarca preferintele userului
async function loadPreferences() {
  const res = await fetch('http://localhost:3000/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  const ul = document.getElementById('preferences-list');
  ul.innerHTML = '';
  // pentru fiecare preferinta, adauga in lista
  prefs.forEach(pref => {
    const li = document.createElement('li');
    li.textContent = `${pref.topic} (${pref.resource_type})`;
    ul.appendChild(li);
  });
}

// sterge preferinta
document.getElementById('deletePreferenceBtn').onclick = async function() {
  const topic = document.querySelector('input[name="topic"]').value;
  const resourceType = document.querySelector('select[name="resourceType"]').value;
  const msgDiv = document.getElementById('preferences-message');

  // ia toate preferintele
  const res = await fetch('http://localhost:3000/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();

  // cauta preferinta dupa topic si tip
  const pref = prefs.find(p => p.topic === topic && p.resource_type === resourceType);
  if (pref) {
    // sterge preferinta din baza de date
    const delRes = await fetch(`http://localhost:3000/user/preferences?id=${pref.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    if (delRes.ok) {
      msgDiv.textContent = 'Preferința a fost ștearsă!';
      msgDiv.style.color = 'green';
      loadPreferences();
      loadRecommendations && loadRecommendations();
    } else {
      msgDiv.textContent = 'Eroare la ștergere!';
      msgDiv.style.color = 'red';
    }
  } else {
    msgDiv.textContent = 'Nu există această preferință!';
    msgDiv.style.color = 'red';
  }
};

// adauga preferinta noua
document.getElementById('preferencesForm').onsubmit = async function(e) {
  e.preventDefault();
  const topic = this.topic.value;
  const resourceType = this.resourceType.value;
  // pregateste div pentru mesaje
  const msgDiv = document.getElementById('preferences-message') || (() => {
    const d = document.createElement('div');
    d.id = 'preferences-message';
    d.style.marginTop = '0.5em';
    d.style.fontWeight = 'bold';
    this.parentNode.appendChild(d);
    return d;
  })();

  // verifica daca preferinta exista deja
  const res = await fetch('http://localhost:3000/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  if (prefs.some(p => p.topic === topic && p.resource_type === resourceType)) {
    msgDiv.textContent = 'Preferinta exista deja!';
    msgDiv.style.color = 'orange';
    return;
  }

  // adauga preferinta in baza de date
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
    loadPreferences();
    loadRecommendations();
  } else {
    const data = await addRes.json();
    msgDiv.textContent = data.error || 'Eroare la adaugare preferinta!';
    msgDiv.style.color = 'red';
  }
};

// incarca datele userului in profil
async function loadProfile() {
  const res = await fetch('http://localhost:3000/user/profile', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  if (!res.ok) {
    window.location.href = 'login.html';
    return;
  }
  const user = await res.json();
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-role').textContent = user.role === 'admin' ? 'Administrator' : 'Utilizator';
}

// schimba parola
document.getElementById('passwordChangeForm').onsubmit = async function(e) {
  e.preventDefault();

  // ia parolele din formular
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const messageDiv = document.getElementById('password-message');

  if (!oldPassword || !newPassword) {
    messageDiv.textContent = 'Parola veche si parola noua sunt obligatorii!';
    messageDiv.style.color = 'red';
    return;
  }

  // trimite cererea de schimbare parola
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
    e.target.reset();
  } else {
    messageDiv.textContent = data.error || 'Eroare la schimbarea parolei!';
    messageDiv.style.color = 'red';
  }
};

// incarcare automata profil si preferinte
if (window.location.pathname.includes('profile.html')) {
  loadProfile();
  loadPreferences();
  loadRecommendations();
}

// logout
document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('logoutBtn');
  if (!btnLogout) return;

  btnLogout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.replace('index.html');
  });
});

// incarca recomandari pentru user
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

  // grupeaza pe tip
  const typeOrder = ['news', 'video', 'image', 'document'];
  const groupedByType = {};
  typeOrder.forEach(type => groupedByType[type] = {});

  data.forEach(item => {
    if (!groupedByType[item.type]) return;
    if (!groupedByType[item.type][item.source]) groupedByType[item.type][item.source] = [];
    groupedByType[item.type][item.source].push(item);
  });

  // grid recomandari
  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.gap = '2em';
  grid.style.flexWrap = 'wrap';

  typeOrder.forEach(type => {
    if (!groupedByType[type]) return;
    Object.entries(groupedByType[type]).forEach(([source, items]) => {
      items.sort((a, b) => new Date(b.import_date) - new Date(a.import_date));
      const col = document.createElement('div');
      col.className = 'source-column';
      col.innerHTML = `
        <div class="source-header">
          ${source} <span style="font-size:0.8em;font-weight:normal;background:#eee;color:#222;padding:0.2em 0.7em;border-radius:5px;margin-left:0.7em;">${type}</span>
        </div>
        <ul class="source-list"></ul>
      `;
      const ul = col.querySelector('.source-list');
      items.forEach(item => {
        const li = document.createElement('li');
        const importDate = new Date(item.import_date);
        const now = new Date();
        const diffMs = now - importDate;
        const diffM = Math.floor(diffMs / (1000 * 60));
        const diffH = Math.floor(diffM / 60);
        const diffD = Math.floor(diffH / 24);
        let timeLabel = '';
        if (diffM < 60) timeLabel = `${diffM}m`;
        else if (diffH < 24) timeLabel = `${diffH}h`;
        else timeLabel = `${diffD}d`;

        li.innerHTML = `<span style="color:#888;margin-right:0.5em;">${timeLabel}</span>
          <a href="${item.url}" target="_blank">${item.title}</a>`;
        ul.appendChild(li);
      });
      grid.appendChild(col);
    });
  });

  results.appendChild(grid);
}

// login automat cu reset token
document.addEventListener('DOMContentLoaded', async () => {
  // daca exista resetToken in url, login automat
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('resetToken');
  if (resetToken) {
    try {
      const res = await fetch('http://localhost:3000/auth/reset-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'profile.html';
      } else {
        alert(data.error || 'Token invalid sau expirat!');
        window.location.href = 'login.html';
      }
    } catch {
      alert('Eroare la autentificare!');
      window.location.href = 'login.html';
    }
  }
});


