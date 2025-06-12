document.addEventListener('DOMContentLoaded', async () => {
  // --- protectie acces admin ---
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
      return;
    }
  } catch (e) {
    window.location.href = 'login.html';
    return;
  }

  // --- logout ---
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  // --- taburi ---
  const tabResurse = document.getElementById('tab-resurse');
  const tabUtilizatori = document.getElementById('tab-utilizatori');
  const sectionResurse = document.getElementById('section-resurse');
  const sectionUtilizatori = document.getElementById('section-utilizatori');

  tabResurse.addEventListener('change', function() {
    sectionResurse.style.display = 'block';
    sectionUtilizatori.style.display = 'none';
    // daca dropdownul e pe "listeaza toate resursele", listeaza automat
    if (resourceActions.value === 'list') {
      listAllResources();
    }
  });
  tabUtilizatori.addEventListener('change', function() {
    sectionResurse.style.display = 'none';
    sectionUtilizatori.style.display = 'block';
  });

  // --- gestionare resurse ---
  const resourceActions = document.getElementById('resource-actions');
  const addResourceForm = document.getElementById('addResourceForm');
  const resourceList = document.getElementById('resource-list');

  // la incarcare, seteaza vizibilitatea corecta pentru formular
  if (addResourceForm) {
    addResourceForm.style.display = resourceActions.value === 'add' ? 'block' : 'none';
  }

  // afiseaza formularul doar daca e selectat "adauga manual resurse"
  resourceActions.addEventListener('change', function() {
    if (addResourceForm) {
      addResourceForm.style.display = this.value === 'add' ? 'block' : 'none';
    }
    if (this.value === 'list') {
      listAllResources();
      resourceList.style.display = 'block';
    } else if (this.value === 'delete') {
      showDeleteResources();
      resourceList.style.display = 'block';
    } else {
      resourceList.style.display = 'none';
    }
  });

  // la incarcare, daca dropdownul e pe "listeaza toate resursele", listeaza automat
  if (resourceActions && resourceActions.value === 'list') {
    resourceList.style.display = 'block';
    listAllResources();
  } else {
    resourceList.style.display = 'none';
  }

  // --- functie listare resurse ---
  async function listAllResources() {
    const res = await fetch('http://localhost:3000/admin/resources', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    resourceList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      resourceList.innerHTML = '<p>Nu exista resurse.</p>';
      return;
    }

    // creeaza un tabel simplu
    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Titlu</th>
        <th>Tip</th>
        <th>Topic</th>
        <th>Vizibilitate</th>
        <th>Data</th>
      </tr>
    `;
    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>${item.topic}</td>
        <td>${item.visibility}</td>
        <td>${item.import_date ? new Date(item.import_date).toLocaleString() : ''}</td>
      `;
      table.appendChild(tr);
    });
    resourceList.appendChild(table);
  }

  // --- gestionare utilizatori ---
  const userActions = document.getElementById('user-actions');
  const userList = document.getElementById('user-list');
  userActions.addEventListener('change', function() {
    userList.style.display = this.value === 'list' ? 'block' : 'none';
    // poti adauga aici si alte actiuni pentru delete/role
  });
  // la incarcare, seteaza vizibilitatea corecta
  userList.style.display = userActions.value === 'list' ? 'block' : 'none';

  if (addResourceForm) {
    addResourceForm.onsubmit = async function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const url = document.getElementById('url').value;
      const type = document.getElementById('type').value;
      const description = document.getElementById('description').value;
      const topic = document.getElementById('topic').value;
      const visibility = document.getElementById('visibility').value;
      const keywords = document.getElementById('keywords').value;
      const msg = document.getElementById('admin-message');

      msg.textContent = '';
      try {
        const res = await fetch('http://localhost:3000/admin/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({ title, url, type, description, topic, visibility, keywords })
        });
        const data = await res.json();
        if (res.ok) {
          msg.textContent = 'Resursa a fost adaugata!';
          msg.style.color = 'green';
          addResourceForm.reset();
          listAllResources(); // reincarca lista de resurse dupa adaugare
        } else {
          msg.textContent = data.error || 'Eroare la adaugare!';
          msg.style.color = 'red';
        }
      } catch (err) {
        msg.textContent = 'Eroare la conectarea cu serverul!';
        msg.style.color = 'red';
      }
    };
  }

  async function showDeleteResources() {
    const res = await fetch('http://localhost:3000/admin/resources', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    resourceList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      resourceList.innerHTML = '<p>Nu exista resurse.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Titlu</th>
        <th>Tip</th>
        <th>Topic</th>
        <th>Vizibilitate</th>
        <th>Data</th>
        <th>Actiuni</th>
      </tr>
    `;
    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>${item.topic}</td>
        <td>${item.visibility}</td>
        <td>${item.import_date ? new Date(item.import_date).toLocaleString() : ''}</td>
        <td><button class="delete-btn" data-id="${item.id}">Sterge</button></td>
      `;
      table.appendChild(tr);
    });
    resourceList.appendChild(table);

    // adauga event listener pentru butoanele de stergere
    resourceList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (confirm('Sigur vrei sa stergi aceasta resursa?')) {
          await fetch(`http://localhost:3000/admin/resources?id=${btn.dataset.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          showDeleteResources(); // reincarca lista dupa stergere
        }
      });
    });
  }

  document.getElementById('export-json').onclick = function() {
    window.open('http://localhost:3000/admin/export?format=json', '_blank');
  };

  document.getElementById('export-csv').onclick = function() {
    window.open('http://localhost:3000/admin/export?format=csv', '_blank');
  };

  document.getElementById('import-file').addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    const formMsg = document.getElementById('import-export-message');
    formMsg.textContent = '';
    const reader = new FileReader();
    reader.onload = async function(e) {
      let content = e.target.result;
      let isCSV = file.name.endsWith('.csv');
      let url = 'http://localhost:3000/admin/import';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': isCSV ? 'text/csv' : 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: content
        });
        const data = await res.json();
        if (res.ok) {
          formMsg.textContent = 'Import realizat cu succes!';
          formMsg.style.color = 'green';
          listAllResources();
        } else {
          formMsg.textContent = data.error || 'Eroare la import!';
          formMsg.style.color = 'red';
        }
      } catch (err) {
        formMsg.textContent = 'Eroare la conectarea cu serverul!';
        formMsg.style.color = 'red';
      }
    };
    reader.readAsText(file);
  });
});
